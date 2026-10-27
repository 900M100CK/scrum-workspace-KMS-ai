// Compatibility for notebooklm-mcp 2.0.0 after Google's NotebookLM redirect.
// Applied in memory: the npm cache and saved authentication files are untouched.
import { registerHooks } from 'node:module';

export function patchAuthSource(source) {
  const legacyCheck = 'currentUrl.startsWith("https://notebooklm.google.com/")';
  const checks = source.split(legacyCheck).length - 1;
  if (checks !== 4) {
    throw new Error(`Unsupported notebooklm-mcp auth implementation (${checks} URL checks). Review the domain compatibility patch before continuing.`);
  }
  return source.replaceAll(
    legacyCheck,
    '/^https:\\/\\/(?:notebooklm|notebook)\\.google\\.com\\//.test(currentUrl)',
  );
}

export function patchSourceSelectors(source) {
  const replacements = [
    ['overlayPane: \'[role="dialog"]\'', 'overlayPane: \'[role="dialog"]:not(.emoji-keyboard__container):visible\''],
    ['overlayInput: \'[role="dialog"] input[type="text"]:not([readonly])\'', 'overlayInput: \'[role="dialog"]:not(.emoji-keyboard__container):visible input[type="text"]:not([readonly]):visible\''],
    ['overlayTextarea: \'[role="dialog"] textarea\'', 'overlayTextarea: \'[role="dialog"]:not(.emoji-keyboard__container):visible textarea:visible\''],
  ];
  for (const [before, after] of replacements) {
    if (source.split(before).length !== 2) {
      throw new Error('Unsupported notebooklm-mcp source selectors. Review the dialog compatibility patch.');
    }
    source = source.replace(before, after);
  }
  return source;
}

registerHooks({
  load(url, context, nextLoad) {
    const result = nextLoad(url, context);
    if (url.endsWith('/notebooklm-mcp/dist/auth/auth-manager.js')) {
      return { ...result, source: patchAuthSource(String(result.source)) };
    }
    if (url.endsWith('/notebooklm-mcp/dist/notebooklm/selectors.js')) {
      return { ...result, source: patchSourceSelectors(String(result.source)) };
    }
    return result;
  },
});
