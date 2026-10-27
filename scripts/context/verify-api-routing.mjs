import assert from 'node:assert/strict';

export const HTTP_METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];

// Bounded OpenAPI routing rules plus this project's existing authentication
// invariants. No HTTP router or runtime permission enforcement is exercised.
export function validateApiRouting(api) {
  const resolveParameter = (value, seen = new Set()) => {
    if (!value?.$ref) return value;
    assert(value.$ref.startsWith('#/'), 'External parameter reference is not checked');
    assert(!seen.has(value.$ref), 'Cyclic parameter reference');
    seen.add(value.$ref);
    const target = value.$ref.slice(2).split('/').reduce((current, part) => current?.[part.replaceAll('~1', '/').replaceAll('~0', '~')], api);
    assert(target, 'Unresolved parameter reference: ' + value.$ref);
    return resolveParameter(target, seen);
  };
  const parameters = (list = []) => {
    const result = new Map();
    for (const input of list) {
      const value = resolveParameter(input);
      assert(value && typeof value.name === 'string' && ['path', 'query', 'header', 'cookie'].includes(value.in), 'Invalid parameter identity');
      const key = JSON.stringify([value.in, value.name]);
      assert(!result.has(key), 'Duplicate parameter: ' + key);
      result.set(key, value);
    }
    return result;
  };
  const shapes = new Set();
  const ids = new Set();
  let operations = 0, internal = 0;
  for (const [path, item] of Object.entries(api.paths)) {
    if (path.startsWith('x-')) continue;
    const shape = path.replace(/\{[^}]+\}/g, '{}');
    assert(!shapes.has(shape), 'Equivalent templated paths: ' + path);
    shapes.add(shape);
    const inherited = parameters(item.parameters);
    const selectors = new Set([...path.matchAll(/\{([^}]+)\}/g)].map(match => match[1]));
    for (const method of HTTP_METHODS) {
      const operation = item[method];
      if (!operation) continue;
      operations++;
      assert(operation.operationId && !ids.has(operation.operationId), 'Duplicate/missing operation ID');
      ids.add(operation.operationId);
      const effective = new Map([...inherited, ...parameters(operation.parameters)]);
      for (const parameter of effective.values()) {
        if (parameter.in !== 'path') continue;
        assert(selectors.has(parameter.name), 'Extra path parameter: ' + parameter.name);
        assert.equal(parameter.required, true, 'Path parameter must be required: ' + parameter.name);
      }
      for (const selector of selectors) assert(effective.has(JSON.stringify(['path', selector])), 'Missing path parameter: ' + selector);
      const security = operation.security ?? api.security;
      assert(Array.isArray(security), 'Authentication declaration missing');
      for (const clause of security) for (const name of Object.keys(clause)) assert(Object.hasOwn(api.components?.securitySchemes ?? {}, name), 'Unknown security scheme: ' + name);
      if (path.startsWith('/internal/')) {
        internal++;
        assert(security.length && security.every(clause => Object.hasOwn(clause, 'serviceKey') && Object.hasOwn(clause, 'actorSession')), 'Internal authentication alternative lacks service and actor context');
      } else if (path === '/session' && method === 'post' && operation.operationId === 'signIn') {
        assert.equal(security.length, 0, 'Sign-in authentication must stay explicitly unauthenticated');
      } else {
        assert(security.length && security.every(clause => Object.hasOwn(clause, 'sessionCookie')), 'Public authentication alternative lacks session context');
      }
    }
  }
  return { operations, internal, public: operations - internal };
}
