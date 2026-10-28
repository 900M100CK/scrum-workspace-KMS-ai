# P08 owned persistence, KDF and private operations result

**Artifact ID:** SP01-P08-RESULT\
**Version/date:** 0.2 Draft · 28 October 2026\
**Status:** Bounded P08 implementation and affected regressions verified. Public authentication handler behaviours verified: 0.\
**Inputs:** [FEAT-SP01-01](../../implementation/features/sp-01-session-foundation/plan.md) (execution snapshot v0.4); [P08 task](../../implementation/features/sp-01-session-foundation/tasks/SP01-P08-owned-persistence.md) (execution snapshot v0.3); [authorised design](../../implementation/features/sp-01-session-foundation/p08-persistence-design.md) v0.2; [ADR-0024](../../adr/0024-backend-session-foundation.md) (execution snapshot v0.3); [ADR-0025](../../adr/0025-opaque-session-candidate.md) (execution snapshot v0.3); DATA-04 v0.13.\
**Trace:** M-01 / SP-01.2 and applicable SP-11.1; FR-01/36/37/68, TC-01 and TC-18 relevance; no complete FR/AC or parent-pack acceptance.\
**Owner role:** Sequential implementer; bounded P08/schema implementation authorised with owner conditions, no independent review or formal ADR acceptance.

## Outcome and authorised scope

The owner selected manual account disable: deny login and every existing session, without automatic failed-attempt lockout. The subsequent P08 approval covers explicit scrypt memory/admission limits, shared-libuv/deployment caveats, operator-only atomic recovery/audit, unreadable-clock denial, singleton contention and honest unobserved-time limits. It does not Accept ADRs, close D-07 or authorise a development migration. Those conditions were checked against the concrete design before implementation.

Workspace has actual private persistence adapters and migration 005, with exact pg/@types/pg 8.23.1 pins. Cookie/validator packages were not adopted in this persistence-only slice. Root test:session:storage runs the new integration suite; existing build/start/foundation commands remain real. No public session HTTP route or UI login was added. Internal creation returns a bearer only to its owning caller; raw bearer material is never stored in the database or audit.

New schema: private auth_account; immutable session_token digest/absolute metadata linked to existing Session; initially unhealthy persistent auth_clock_state; append-only authentication_audit with no invented project. Session mutation and required minimum audit use the same client/transaction. Legacy sessions make upgrade fail without deletion; nonempty/used identities and evidence make rollback fail. Original 001–004 SQL bytes are unchanged. All migrations in this task ran on uniquely named disposable PostgreSQL fixtures; development data/volumes were not upgraded or reset.

Runtime workspace_app has no credential/account mutation or fault-reset capability. A fixed-search-path SECURITY DEFINER function grants only the account row-lock/read needed for consistency, avoiding broad UPDATE rights. Operator tooling requires separate Workspace-owner authority, reads private bounded stdin and exposes no HTTP route. Provision/disable/recovery never print raw database errors or secrets. [The operations guide](../../../services/workspace/SESSION-OPERATIONS.md) documents startup, attestation, resource bounds and unknown outcomes.

## Verification and attribution

The retained [first P08 run](sp01-p08-evidence/2026-10-28T03-17-53-621Z/result.json) captures explicit Node 24.22.1 commands, per-command logs and before/after runnable-source/SQL/package manifests. Source inputs were stable throughout that run. The [source archive](sp01-p08-evidence/2026-10-28T03-17-53-621Z/source.zip) preserves that exact failed-regression input set; it includes no TLS keys, .env or real credentials. The source collector explicitly labels documentation checks as separate from the runtime input set. No clean-clone or remote CI claim is made.

| Executed check | Result and evidence boundary |
| --- | --- |
| Fresh npm ci, offline, ignore-scripts | Passed from the updated root lockfile under explicit Node 24 |
| npm run typecheck / build | Passed web and both services |
| npm run test:foundation with local TLS paths | 12 passed, 0 skipped; includes real HTTPS/proxy and two KDF tests |
| npm run test:session:storage | 17 Node results passed (16 scenarios plus parent), using actual Workspace adapters and runtime/operator database roles |
| Existing db:test | Final affected rerun passed 26/26; earlier failures retained |
| contracts:test | Passed 26/26 in the recorded follow-up |

The P08 PostgreSQL suite exercises empty forward/reverse/forward/reapply, unchanged migration hashes, legacy refusal, role denial and Knowledge isolation; explicit clock initialization; current credential revision; raw-token/password/hash absence from audit and digest-only token storage; exact injected audit failure rollback; immutable absolute deadline; expired/revoked/forged denial; manual disable and both observed SQL lock schedules; real PostgreSQL restart; missing/unreadable clock; stale/mismatched recovery, audit rollback and old-token denial; cancellation/discard/later health; bounded singleton wait and later recovery; injected receipt loss after actual COMMIT; actual private CLI; and exact bigint generation above Number.MAX_SAFE_INTEGER.

The receipt-loss hook deliberately simulates caller uncertainty after an actual committed write; it is not a real TCP acknowledgement-drop experiment. The caller reports unknown outcome, discards the client and does not retry; the row/audit remains committed. No cookie success is claimed without a handler. The clock test seeds a future high-water value and compares actual DB time; it does not change the host clock. Separate laboratory restart evidence also retains the original failing wall-clock baseline and the passing mitigation variant.

## Findings, corrections and limitations

Initial role tests exposed PostgreSQL's UPDATE privilege requirement for SELECT FOR UPDATE on account rows. The implementation was corrected with a narrow account-lock helper; credential mutation remains denied and both race orders are now exercised against actual methods/DB waits. The first TypeScript check also exposed promisify's scrypt overload typing; an explicit typed callback-to-Promise wrapper fixed it without weakening memory settings. These exploratory failures preceded the retained final P08 suite and are not labelled reproducible measured runs.

The first broad regression stopped because Workspace migration counts were still hardcoded to four in two pre-existing suites. That stopped subsequent Knowledge setup, causing secondary missing-table failures. The retained snapshot preserves the 9-pass/17-fail result. A [second run](sp01-p08-evidence/2026-10-28T03-22-09-757Z/result.json) reached the policy rollback test and exposed its remaining expected retained-migration count (two instead of three), recording 24 passed/2 failed including the parent. Exactly three expected-count assertions were corrected: two full counts to five and one targeted-rollback count to three. Knowledge code/migrations and every permission/data assertion were preserved.

The [final affected rerun](sp01-p08-evidence/2026-10-28T03-24-35-431Z/result.json) passed db:test 26/26 and contracts:test 26/26, with stable before/after inputs and a [retained source archive](sp01-p08-evidence/2026-10-28T03-24-35-431Z/source.zip). Comparing source sets between the first and final runs identifies only the evidence collector's remaining-check selection and the two old migration-count test files as changed. Application/KDF/persistence/migration inputs are byte-identical, so their already-passed checks were not needlessly repeated. Both failed runs keep their own logs, manifests and archives; no failed result was relabelled Passed.

Scrypt N=131072/r=8/p=1 uses explicit maxmem=192 MiB and a random 16-byte salt/32-byte output. Admission is process-wide across verifier instances, capped at two with no queue; unsupported stored parameters and oversized internal input reject before work. The recorded foundation run observed about 2.84 ms for a filesystem read during KDF work and total peak process RSS 324940 KiB, including Node overhead. The two concurrent derivations plus one later derivation took about 442 ms together. Async scrypt still shares libuv; these local observations are not deployment capacity/security calibration or latency equality. The weaker synthetic spike configuration was not copied into application defaults.

Clock-health is mitigation. It serializes a row and cannot establish elapsed time during wholly unobserved intervals. A blocked P08 request was observed failing at the configured 1-second lock bound, then a later request succeeded; this is not a throughput SLA. Independent operator time verification and target-deployment calibration remain operating gaps. Recovery uses an explicit operator-selected comparison bound, not an implicit accepted universal tolerance. SQL comparison/arithmetic retains PostgreSQL timestamp precision; JavaScript date conversion is not the expiry authority.

Logical JSON v0.9, DATA-04 v0.13 and canonical Workspace ERD v0.4 include the four new tables; generated source-version metadata was synchronized. The old PNG preview is explicitly labelled stale; refreshed rendered export/review is not claimed. No project/document capability, physical purge, provider transfer or additional runtime agent was added.

## Handoff

P08 scope is private owned persistence and operations. P09–P12 public handlers, renewal/logout integration, UI/browser cookie/CSRF and full FR acceptance remain unimplemented. ADR-0024/0025 remain Proposed despite bounded implementation authorisation and passing persistence checks; D-07 is untouched. See the authoritative [task table](../../implementation/features/sp-01-session-foundation/plan.md#tasks-and-acceptance). No commit/push or independent approval occurred.

Additional checks passed: docs:lint, docs:test 20/20, context:lint, context:check and context:test 45/45. Metadata synchronization checks 66 generated outputs; physical ERD/model parity covers the new tables. The [separate retained preparation run](sp01-p08-evidence/prep-restart/result.json) passed 50 Node results including the real restart experiment; its original wall-clock baseline guarantee remains failed in the conservative ledger. Laboratory diagnostic success never converts that failed guarantee into universal clock assurance.

**Checklist:** Author self-checked scope/roles/source attribution and preserved failures. **Review:** Not requested. **Unrun:** target-deployment KDF calibration, independently verified operating time, refreshed rendered ERD preview, public handlers/browser/guarded transport and complete SP-01 acceptance. No development migration, commit or push.

Revision 0.2 only clarifies the original P08 execution input snapshots after P09 updated plan/task/ADR metadata. Original P08 measured results, source archives and limitations are unchanged.
