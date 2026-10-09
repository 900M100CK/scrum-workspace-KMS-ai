# Knowledge service scaffold

Status: directory/context scaffold only; no application handler/index/provider is implemented. Own knowledge/version/passages/links/retrieval/AI/provenance under the [architecture](../../docs/architecture.md) and [Knowledge contract](../../contracts/openapi/knowledge.openapi.json).

Never copy or independently interpret permission rules: obtain current scoped decisions from Workspace and filter project AND document before query/context. Own Knowledge data only. Generation is read-only and provider-independent. Draft never enters retrieval/context; citation IDs are assigned from retrieved records. Guarded delivery validates the full evidence set, including uncited context.

Implement SP-06–SP-10 after the foundation; capture evidence from the first operation. Real build/test/run commands follow installed versions, not this README.
