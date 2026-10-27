import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

// Executable protocol reference only. No persistence, permission decision,
// guard, one-use claim, provider adapter or transport is implemented here.
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

export function decodeCanonicalBase64(value, maxBytes) {
  assert(Number.isSafeInteger(maxBytes) && maxBytes > 0, 'A trusted positive byte limit is required');
  assert(typeof value === 'string' && value.length > 0 && value.length <= 4 * Math.ceil(maxBytes / 3), 'Encoded byte limit or empty value');
  assert(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value), 'Invalid canonical base64');
  const bytes = Buffer.from(value, 'base64');
  assert(bytes.length <= maxBytes && bytes.toString('base64') === value, 'Noncanonical base64 or byte limit exceeded');
  return bytes;
}

const scalarString = value => {
  // Reject unpaired escaped UTF-16 surrogates before any UTF-8 hashing of text.
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(++i);
      assert(next >= 0xdc00 && next <= 0xdfff, 'Unpaired Unicode surrogate');
    } else assert(code < 0xdc00 || code > 0xdfff, 'Unpaired Unicode surrogate');
  }
  return value;
};

function exactSafeInteger(token) {
  const [, sign, whole, fraction = '', exponentText = '0'] = token.match(/^(-?)(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
  let digits = (whole + fraction).replace(/^0+/, '');
  if (!digits) return; // Every representation of zero is exact.
  const exponent = Number(exponentText);
  assert(Number.isSafeInteger(exponent), 'JSON number is not an exact safe integer');
  const shift = exponent - fraction.length;
  if (shift < 0) {
    assert(-shift < digits.length && /^0*$/.test(digits.slice(shift)), 'JSON number is not an exact safe integer');
    digits = digits.slice(0, shift);
  } else {
    assert(digits.length + shift <= 16, 'JSON number is not an exact safe integer');
    digits += '0'.repeat(shift);
  }
  assert(digits.length <= 16 && BigInt((sign || '') + digits) >= -BigInt(Number.MAX_SAFE_INTEGER) && BigInt((sign || '') + digits) <= BigInt(Number.MAX_SAFE_INTEGER), 'JSON number is not an exact safe integer');
}

export function decodeManifestJson(value, maxBytes) {
  const bytes = decodeCanonicalBase64(value, maxBytes);
  let text, parsed;
  try {
    // Preserve BOM so JSON.parse rejects it rather than silently changing bytes.
    text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
    parsed = JSON.parse(text);
  } catch { throw new Error('Invalid UTF-8 or JSON'); }
  // Native JSON.parse validates the complete grammar first. This token walk
  // adds duplicate decoded-key and exact-integer checks that JSON.parse loses.
  const tokens = /"(?:[^"\\]|\\[\s\S])*"|[{}\[\]:,]|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null/g;
  const stack = [];
  let end = 0;
  for (const match of text.matchAll(tokens)) {
    assert(/^[\t\n\r ]*$/.test(text.slice(end, match.index)), 'Unrecognized JSON token');
    end = match.index + match[0].length;
    const token = match[0], parent = stack.at(-1);
    if (token === '{') stack.push({ kind: 'object', keys: new Set(), key: true });
    else if (token === '[') stack.push({ kind: 'array' });
    else if (token === '}' || token === ']') stack.pop();
    else if (token === ',') { if (parent?.kind === 'object') parent.key = true; }
    else if (token.startsWith('"')) {
      const decoded = scalarString(JSON.parse(token));
      if (parent?.kind === 'object' && parent.key) {
        assert(!parent.keys.has(decoded), 'Duplicate decoded JSON object key');
        parent.keys.add(decoded); parent.key = false;
      }
    } else if (/^-?\d/.test(token)) exactSafeInteger(token);
  }
  assert(/^[\t\n\r ]*$/.test(text.slice(end)), 'Unrecognized trailing JSON data');
  return { bytes, value: parsed };
}

export function sameJson(left, right) {
  if (left === right) return true;
  if (!left || !right || typeof left !== 'object' || typeof right !== 'object' || Array.isArray(left) !== Array.isArray(right)) return false;
  if (Array.isArray(left) && left.length !== right.length) return false;
  const keys = Object.keys(left);
  return keys.length === Object.keys(right).length && keys.every(key => Object.hasOwn(right, key) && sameJson(left[key], right[key]));
}

const requireSchema = (validators, name, value) => assert(validators.get(name)?.(value), 'Invalid ' + name + ' shape');
const evidenceMap = evidence => {
  const result = new Map();
  for (const source of evidence) {
    assert(!result.has(source.source_id), 'Duplicate evidence source ID');
    result.set(source.source_id, source);
  }
  return result;
};

export function verifyHandoffBytes({ receipt, authoritativeReceipt, expectedIdentity, capturedEvidence, payloadBytesBase64, typedAnswer, validators, limits }) {
  requireSchema(validators, 'StoredHandoff', receipt);
  requireSchema(validators, 'StoredHandoff', authoritativeReceipt);
  assert(sameJson(receipt, authoritativeReceipt), 'Receipt differs from authoritative preparation');
  const decoded = decodeManifestJson(receipt.manifest_bytes_base64, limits.manifestBytes);
  assert(sha256(decoded.bytes) === receipt.manifest_digest, 'Manifest byte digest mismatch');
  assert(sameJson(decoded.value, receipt.manifest), 'Manifest JSON differs from typed manifest');
  const manifest = receipt.manifest;
  const fields = ['handoff_id','run_id','attempt_id','purpose','actor_id','project_id','access_context_ref','session_generation','project_permission_revision','destination_ref'];
  assert(fields.every(key => Object.hasOwn(expectedIdentity, key) && manifest[key] === expectedIdentity[key]), 'Manifest identity or destination mismatch');
  assert(Array.isArray(capturedEvidence), 'Independent complete capture inventory is required');
  for (const source of capturedEvidence) requireSchema(validators,'HandoffEvidence',source);
  const prepared = evidenceMap(manifest.evidence_set), captured = evidenceMap(capturedEvidence);
  assert(prepared.size === captured.size && [...prepared].every(([id, source]) => sameJson(source, captured.get(id))), 'Manifest differs from complete captured evidence');
  assert([...prepared.values()].every(source => source.project_id === manifest.project_id), 'Cross-project evidence binding');
  const payload = decodeCanonicalBase64(payloadBytesBase64, limits.payloadBytes);
  assert(payload.length === manifest.payload_length && sha256(payload) === manifest.payload_digest, 'Payload byte length or digest mismatch');
  if (manifest.purpose === 'answer_delivery') {
    const answer = decodeManifestJson(payloadBytesBase64, limits.payloadBytes).value;
    requireSchema(validators,'QuestionResult',answer);
    assert(sameJson(answer, typedAnswer) && answer.run_id === manifest.run_id, 'Answer differs from typed result or run');
    const cited = new Set();
    for (const citation of answer.citations ?? []) {
      const source = prepared.get(citation.source_id);
      assert(source && !cited.has(citation.source_id), 'Unknown or duplicate citation source');
      assert(Object.entries(citation).every(([key, value]) => source[key] === value), 'Citation locator differs from evidence');
      cited.add(citation.source_id);
    }
    for (const claim of answer.claims ?? []) assert(claim.source_ids.every(id => cited.has(id)), 'Claim references an unbound citation');
  }
  // No bytes or authority token are returned. Provider wire mapping, current
  // scope, durability, one-use claims and guarded transport are still mandatory.
  return { bindingOnly: true, purpose: manifest.purpose, payloadLength: payload.length, evidenceCount: prepared.size, providerWireMappingRequired: manifest.purpose === 'provider_input' };
}
