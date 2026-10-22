import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

let structureValidator;
export async function loadOpenApiStructureValidator() {
  if (structureValidator) return structureValidator;
  const bytes = await readFile(new URL('../tests/fixtures/openapi31/schema-2022-10-07.json', import.meta.url));
  if (createHash('sha256').update(bytes).digest('hex') !== 'da01ba28852cac0de53893797cb8d1942bc3b05084f526dcc216717dec314ed0') throw new Error('OpenAPI snapshot digest changed; recheck upstream source');
  const source = JSON.parse(bytes);
  // Specialize the plain document schema's four #meta references. Ajv's
  // dynamic-reference limitation is also documented in swagger-parser 13.1.0.
  // This does not implement schema-base dialect overrides; component constraints
  // are evaluated independently below. Keep the upstream snapshot unchanged.
  delete source.$defs.schema.$dynamicAnchor;
  let references = 0;
  const walk = value => {
    if (!value || typeof value !== 'object') return;
    if (value.$dynamicRef) {
      if (value.$dynamicRef !== '#meta') throw new Error('Unexpected OpenAPI dynamic reference');
      value.$ref = '#/$defs/schema';
      delete value.$dynamicRef;
      references++;
    }
    for (const child of Object.values(value)) walk(child);
  };
  walk(source);
  if (references !== 4) throw new Error('OpenAPI snapshot changed; recheck specialization');
  const ajv = new Ajv2020({ strict: false, allErrors: true, validateFormats: false, coerceTypes: false, useDefaults: false, removeAdditional: false });
  structureValidator = ajv.compile(source);
  return structureValidator;
}

// Evaluate schema constraints only. This is not an OpenAPI meta-schema,
// HTTP handler, permission, evidence-completeness or transport-byte check.
export async function loadContractSchemas(service) {
  const api = JSON.parse(await readFile(new URL('../contracts/openapi/' + service + '.openapi.json', import.meta.url), 'utf8'));
  return compileContractSchemas(api, service);
}

export function compileContractSchemas(api, service) {
  const ajv = new Ajv2020({ strict: false, allErrors: true, coerceTypes: false, useDefaults: false, removeAdditional: false });
  addFormats(ajv);
  const root = { $id: 'urn:contract:' + service, $schema: 'https://json-schema.org/draft/2020-12/schema', components: api.components, paths: api.paths };
  ajv.addSchema(root);
  const compileAt = pointer => {
    let schema = root;
    for (const part of pointer.slice(1).split('/')) schema = schema[part.replaceAll('~1', '/').replaceAll('~0', '~')];
    if (!ajv.validateSchema(schema)) throw new Error('Contract schema is invalid at ' + pointer + ': ' + ajv.errorsText());
    return ajv.getSchema(root.$id + '#' + pointer);
  };
  const validators = new Map();
  for (const name of Object.keys(api.components.schemas)) validators.set(name, compileAt('/components/schemas/' + name.replaceAll('~', '~0').replaceAll('/', '~1')));
  const inlineValidators = new Map();
  const pointerPart = value => value.replaceAll('~', '~0').replaceAll('/', '~1');
  const collect = (value, pointer) => {
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      if (['example', 'examples'].includes(key)) continue;
      const next = pointer + '/' + pointerPart(key);
      if (key === 'schema') inlineValidators.set(next, compileAt(next));
      else if (pointer !== '/components/schemas') collect(child, next);
    }
  };
  collect({paths:api.paths,components:api.components},'');
  return { api, validators, inlineValidators };
}
