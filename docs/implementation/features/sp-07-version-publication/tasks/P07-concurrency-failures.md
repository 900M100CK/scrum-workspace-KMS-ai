# Task Brief: SP07-P07 Concurrency & Failure Boundaries

**Task ID:** SP07-P07  
**Parent plan:** [FEAT-SP07-01](../plan.md)  
**Deliverable:** Concurrency, CAS collision, and permission revocation boundary tests  
**Dependency:** P04, P05, P06  
**Allowed paths:** `tests/integration/document-revision-concurrency.test.mjs`  

## Objective & Scope
1. Test competing revisions on same document revision: exactly one succeeds, competing revision fails with 409 conflict.
2. Test revision attempt with stale CAS expected revision: 409 conflict.
3. Test revision when `knowledge-author` capability is revoked right before commit.
4. Test reading superseded/archived version when read grant is revoked.

## Verification
- Concurrency test suite: `tests/integration/document-revision-concurrency.test.mjs`.
