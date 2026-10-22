# Executable handoff byte-binding reference

**Artifact ID:** HANDOFF-REF-01  
**Version/date:** 0.2 Draft · 18 October 2026  
**Status:** Local synthetic protocol reference; no application handler, durable store, permission decision, relay or runtime acceptance.  
**Inputs:** PRD-01 v0.9; SAD-03 v0.15; DATA-04 v0.11; Proposed ADR-0020 v0.3; Workspace OpenAPI v0.2.8 / Knowledge v0.2.9; TC-26.  
**Trace:** BR-08–BR-10, BR-12, BR-14; FR-21/22/25/26/28/29/32/55/57/59/60; SC-02/03/05/06.

## Purpose and location

[The reference checker](../../../scripts/verify-handoff-bytes.mjs) evaluates frozen manifest/payload binding rules against synthetic independent receipt/capture inputs. [Its tests](../../../tests/handoff-bytes.test.mjs) run with `npm run contracts:test` after `npm ci`. It uses the already selected Node development harness and development-only schema tooling; no application framework/provider is selected and no SP is marked implemented.

The existing storage design needs exact byte validation before a committed record can be trusted at a handoff. This bounded prerequisite is now executable. Additive Knowledge manifest storage, Workspace nonexpiring claim/fence mapping and real guarded transport remain unimplemented; no migration, database or provider was started for this task.

## Checked properties

| Property | Executed reference evidence |
| --- | --- |
| Canonical base64 and byte bounds | Reject malformed alphabet/padding, ignored whitespace, nonzero unused padding bits, empty input and an overrun of caller-supplied trusted limits. No application/pilot limit is chosen by the synthetic test sizes. |
| Exact UTF-8/JSON manifest and answer decoding | Fatal UTF-8 decoding; reject BOM, trailing data, decoded duplicate keys including Unicode escapes/nested objects, and unpaired escaped surrogates. Native JSON.parse validates syntax first; a token walk adds checks it loses. A deterministic native-serialization corpus exercises nested arrays/objects, escaped punctuation, control characters and valid Unicode. |
| Integer precision | Current manifest/answer count/revision fields must be exact safe integers. Reject rounded large integers and mathematically fractional tokens; accept exact equivalents such as 1.0, 1e0 and 0.001e3. This is a bounded current-record profile, not a general fractional provider-wire parser or an adopted public revision-format change. |
| Frozen manifest bytes | SHA-256 uses the exact decoded bytes. Parsed JSON must equal the typed manifest; object key order may differ semantically, but changed whitespace/order/Unicode bytes require their own matching digest. No normalization or reserialization substitutes for byte hashing. |
| Receipt and identity | Compare the entire supplied receipt against the independent synthetic preparation record, then actor/session/project/run/attempt/purpose/destination. A schema-shaped record or digest alone is insufficient. |
| Full evidence inventory | Compare exact keyed document and operational evidence against the separately supplied complete capture inventory, including uncited context. Reject duplicate mappings, missing/changed entries and cross-project bindings. |
| Frozen payload | Compare exact byte length and SHA-256. Appending whitespace or counting UTF-16 code units instead of UTF-8 bytes fails. |
| Answer mapping | Decode exact QuestionResult bytes, compare typed answer/run, map every citation to exact prepared source fields, reject duplicate/unknown citations and claim references without matching citation. Zero-evidence insufficiency remains valid. |
| Provider boundary | Check only opaque payload byte binding; return providerWireMappingRequired=true. No real or synthetic identity adapter is presented as a provider implementation. |

## Trust and verification limits

`authoritativeReceipt`, expected identity and complete capture inventory are **test oracles** supplied to this local checker. They do not prove a database commit, authenticated lookup, current session, permission, source authority or actual evidence capture. A forged set of mutually consistent inputs is not made trustworthy by this checker. Real adapters must independently obtain/revalidate those facts under the owning-service/guard protocol.

The result is labelled bindingOnly and returns no payload or send capability. It performs no I/O, send/retry, storage write, claim, guard, current source lookup or provider request. It cannot prove zero protected bytes at a real transport boundary or close TC-26. Fact support, truthful conflict/missing-component wording and source-content digest derivation remain separate checks. In particular, matching source IDs or text shape never establishes that a claim is supported.

The integer profile deliberately fails rather than round. Current contracts still contain some unbounded numeric revision/count declarations; real serializers must preserve exact values or fail closed, and any revised public representation requires its own contract/consumer reconciliation. Fractional fields in future provider-specific requests need that adapter's own exact mapping and wire schema; this manifest/answer decoder must not be reused as a general provider decoder.

The canonical-base64/BOM/scalar-string rules are explicit reference transport-profile choices under Proposed ADR-0020; they are not claims about every JSON implementation. No external dialect/provider compatibility, application body limit, storage durability, access/race/crash/fence/replay behavior or production parsing hardening is certified.

Checklist: Pass for executed local byte-binding negatives; Gap for live preparation/claim/guard/source/provider/answer boundaries. Handoff: use the cases when implementing those adapters, keep SYS-01 blocked, and retain SP-09/11 as Unimplemented until their actual acceptance evidence exists. Final check counts and unrun work are recorded in the correction queue.

## SQL receipt integration follow-up

[HANDOFF-SQL-01](handoff-sql-projection-2026-10-18.md) now feeds committed SQL projections into this reference, testing canonical base64, preserved raw bytes, both purposes, context mismatch, consumed-claim separation, uncommitted/rolled-back visibility and unsafe numeric decoding. Seven optional integration results passed. The receipt/context oracles remain synthetic and the reference still grants no send or permission authority.
