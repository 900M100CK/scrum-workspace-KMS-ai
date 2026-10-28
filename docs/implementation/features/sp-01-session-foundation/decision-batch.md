# SP-01 decision batch after isolated runtime experiments

**Artifact ID:** SP01-DECISION-BATCH\
**Version/date:** 0.4 Draft · 28 October 2026\
**Status:** Core session policy direction owner-confirmed; detailed technical adoption Proposed.\
**Inputs:** [FEAT-SP01-01](plan.md) v0.6; [runtime result](../../../sdlc/reports/SP-01-runtime-spike-2026-10-28.md) v0.2; Proposed ADR-0024/0025 v0.5; OWNER-FRAMEWORK-01 v0.1.\
**Trace:** SP01-P06 / SP-01.1 / M-01; FR-01/36/37/68 relevance, no acceptance.\
**Owner role:** Owner makes material choices; agent prepares evidence and implements authorised work.

## Already selected

React/Vite/TypeScript frontend and two Fastify/TypeScript service foundations are selected by OWNER-FRAMEWORK-01. Reuse them; do not ask the owner to select those foundations again. Their shared scaffold is implemented and tested independently of sessions. Existing storage ownership is unchanged.

## Proposed identity and transport direction

Recommend opaque 32-byte random tokens, SHA-256 digest only in Workspace, pre-provisioned username accounts with no registration/reset flow, and independently valid concurrent sessions. Logout closes only the current token; disable/lock policy must explicitly satisfy TC-01 without disclosing account existence. Node scrypt is the dependency-minimising KDF candidate; production cost/max-memory/input/rate-limit parameters still require calibration and security assessment, not adoption of synthetic N=16384.

Recommend same-origin deployment, a host-only `__Host-sacw-session` cookie with Secure/HttpOnly/SameSite=Strict/Path=/, exact configured Origin and a required custom header for POST/DELETE, no permissive credentialed cross-origin policy, and denial when Origin is missing. Local browser development needs HTTPS/proxy configuration. The owner selected 30 minutes idle and 8 hours absolute on 28 October. GET /session can renew idle time under the same row lock; subsequent protected handlers need one shared Workspace authority integration rather than copied rules. Effective expires_at cannot exceed the original absolute cap. Exact cookie renewal expiry must follow remaining absolute lifetime.

Compatible isolated pins are Fastify 5.12.7, @fastify/cookie 11.1.5, pg 8.23.1, Ajv 8.20.0/formats 3.0.1 on Node 24.22.1/TypeScript 6.0.3. Explicit body validation rejects extras and type coercion. This evidence supports a candidate recommendation, not complete application adoption or acceptance of every serializer/schema interaction. Retain explicit errors for unavailable storage and never retry an unknown COMMIT outcome as if it rolled back.

JWT is a viable alternative but does not remove current-authority checks, logout/revocation state or the expiry clock problem. Opaque sessions align with the existing small owned persistence boundary; document revocation is still a separate D-07 guard concern.

## Decision still required: authoritative time and failure policy

The simple post-lock DB-wall-time algorithm passed deterministic normal races but failed backward-time non-revival. Choose a production time model explicitly. Recommended next step: keep ADR-0025 Proposed, complete a bounded clock-health/fail-closed design and its negative tests, then request acceptance with those results. This is already authorised preparation and does not require stopping independent missing HTTP/DB assertions. The alternative is explicit owner acceptance of DB wall time as the policy authority, with its rollback limitation and operational clock monitoring documented; no test can turn that limitation into a stronger guarantee.

Per-session last-observed time can detect some backward observations but cannot detect all elapsed time across idle/outage intervals. No claim of persistent, restart-safe elapsed-time enforcement is supported by this spike. No application schema extension is approved by this document.

## Disposition and continuation

On 28 October the owner chose: “Gia cố cơ chế phát hiện đồng hồ lỗi và từ chối truy cập trước khi chốt (khuyến nghị)”. This selects further clock-hardening preparation, not production adoption or ADR acceptance. The measured guarded variant persists an observed-regression fault across repository reconstruction and denies issue/renewal even after time catches up; logout remains possible. An unobserved interval cannot establish elapsed time, the singleton guard serializes checks, actual DB restart and deployed operator recovery are not verified. Retain the failing baseline instead of treating the variant as a universal time guarantee.

The owner then answered “Chốt hướng này; giữ các cổng kiểm chứng còn mở” to the concrete bundle: pre-provisioned username accounts, opaque digest-backed sessions, multiple sessions, secure same-origin cookie plus Origin/header checks, idle 30 minutes and absolute 8 hours. Those core choices are selected and must not be re-asked. Automated lockout/rate-limit mechanics and operator authorization still need application design consistent with TC-01; unknown/wrong/disabled credentials stay publicly generic.

Measured KDF candidate: scrypt N=131072/r=8/p=1, 16-byte random salt, 32-byte output and explicit maxmem=192 MiB. On the recorded i7-13650HX machine, three single derivations took about 209–210 ms; two concurrent derivations completed in about 213 ms. These are synthetic calibration observations, not a deployment SLA. The recovery candidate now tests required attestation, stale/mismatched preconditions, atomic audit failure rollback and revocation of every pre-recovery session before clearing the fault. Its trusted-time source, real operator tool, deployment KDF concurrency/input bounds and actual DB restart remain application/operating gates.

Detailed mechanics remain [ADR-0024](../../../adr/0024-backend-session-foundation.md) v0.4 and [ADR-0025](../../../adr/0025-opaque-session-candidate.md) v0.4 Proposed. A choice of direction does not automatically Accept ADRs or close failed/incomplete experiments. Do not ask the owner to reselect the accepted policy bundle; request only disposition of the concrete additional KDF/clock/recovery mechanics and their retained trusted-time limits when ready for adoption. D-07 remains separate; login/logout tests cannot accept protected document transport.

**Checklist:** Self-checked for existing selection reuse, observed failure and concrete alternatives. **Review:** Not requested. **Acceptance:** Core policy direction selected; detailed mechanics Proposed. **Handoff:** [parent plan task table](plan.md#tasks-and-acceptance).

## Subsequent P08 disposition

Manual disable was selected: deny login and every existing session, with no automatic failed-attempt lockout. The owner then authorised only P08/schema-extension implementation subject to the KDF memory/admission/libuv, atomic private recovery, fail-closed, contention and honest-limitation conditions. See [the authorised design](p08-persistence-design.md) v0.2 and [P08 result](../../../sdlc/reports/SP-01-P08-persistence-2026-10-28.md). No repeated selection of the core bundle is needed; no Accepted ADR or D-07 closure is inferred. Public session handlers/UI remain later tasks.

## P09 disposition

The subsequent owner instruction authorised P09 separately. POST/GET and the selected cookie/validation mechanics are implemented; [P09 evidence](../../../sdlc/reports/SP-01-P09-http-2026-10-28.md) retains scope and remaining gates. Logout/renewal/UI, deployment calibration and D-07 remain open; no repeated core-policy selection or self-Accepted ADR.

## P10 disposition

The owner separately requested the next task after P09. Selected expiry/current-token logout policy is now implemented in bounded P10 with migration 006 and mandatory atomic audit. See [P10 result](../../../sdlc/reports/SP-01-P10-lifecycle-2026-10-28.md). No policy is silently reselected; browser, D-07, deployment calibration and formal ADR acceptance remain open.
