import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import '../scripts/notebooklm-domain-compat.mjs';

// Opt-in integration check against the installed upstream package and Chrome.
const entry = process.env.NOTEBOOKLM_MCP_ENTRY;
test('source controls ignore an earlier emoji dialog and hidden source modal', {
  skip: entry ? false : 'Set NOTEBOOKLM_MCP_ENTRY to the installed dist/index.js',
}, async () => {
  const entryUrl = pathToFileURL(entry);
  const { Selectors } = await import(new URL('./notebooklm/selectors.js', entryUrl));
  const { chromium } = createRequire(entryUrl)('patchright');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(`
      <div role="dialog" class="emoji-keyboard__container" style="display:none">
        <textarea id="emoji"></textarea>
      </div>
      <div role="dialog" style="display:none"><textarea id="old"></textarea></div>
      <div role="dialog" id="source"><input type="text"><textarea id="body"></textarea></div>
    `);
    const overlay = page.locator(Selectors.sources.overlayPane).first();
    await overlay.waitFor({ state: 'visible', timeout: 1000 });
    assert.equal(await overlay.getAttribute('id'), 'source');
    await page.locator(Selectors.sources.overlayTextarea).first().fill('Synthetic source');
    assert.equal(await page.locator('#body').inputValue(), 'Synthetic source');
    assert.equal(await page.locator('#emoji').inputValue(), '');
    assert.equal(await page.locator('#old').inputValue(), '');
    // Even a visible emoji palette must never become the source dialog.
    await page.locator('.emoji-keyboard__container').evaluate(el => el.style.display = 'block');
    assert.equal(await overlay.getAttribute('id'), 'source');
    await page.locator('#source').evaluate(el => el.style.display = 'none');
    await overlay.waitFor({ state: 'hidden', timeout: 1000 });
  } finally {
    await browser.close();
  }
});
