# Pinned OpenAPI document structure schema

Upstream source: https://spec.openapis.org/oas/3.1/schema/2022-10-07

Retrieved 18 October 2026; unmodified downloaded bytes in `schema-2022-10-07.json`.
SHA-256: `da01ba28852cac0de53893797cb8d1942bc3b05084f526dcc216717dec314ed0`.
Apache-2.0 license is included as `LICENSE.txt` from the OpenAPI Specification repository.

This dated schema covers OpenAPI 3.1.x **document structure without Schema Object validation**, as its description states. `scripts/contract-schemas.mjs` specializes its four `#meta` dynamic references to the same local Schema Object definition on an in-memory copy, removes that definition's dynamic anchor, and checks both the snapshot hash and expected reference count. The upstream file stays unchanged. This bounded specialization handles Ajv's dynamic-reference limitation, also documented in [swagger-parser 13.1.0's validator](https://github.com/APIDevTools/swagger-parser/blob/v13.1.0/lib/validators/schema.js). It does not enable external dialect overrides or implement the official `schema-base` wrapper. A synthetic valid schema-containing document and malformed documents calibrate the adapter.

Document-level format assertions are disabled, matching the primary validator's approach; media-range and URI syntax are not certified here. Component sample tests separately use JSON Schema 2020-12 with date-time formats enabled. All checks are local and do not resolve network references or send contracts outside the workspace. This is not full standards conformance, consumer/provider compatibility, a runtime permission check or evidence of persistence.
