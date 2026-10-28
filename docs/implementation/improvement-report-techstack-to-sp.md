# Tech stack to task packs — reconciled improvement report

**Artifact ID:** IMPL-IMPROVE-01\
**Version/date:** 0.2 Draft · 27 October 2026\
**Status:** Reconciled recommendations, not owner acceptance of stack or policy.\
**Inputs:** Owner-supplied Claude report dated 27 October and subsequent rebuttal in this chat (external v1, not a registered repository artifact); TECH-STACK-01 v1.5; [decision map](decisions.md); [canonical specs](../../specs/README.md) v0.5; [Workspace contract](../../contracts/openapi/workspace.openapi.json) v0.2.8; Proposed ADR-0024/0025.\
**Trace:** Existing BR-01–BR-14 / SC-01–SC-08; no Must deferral or added feature.\
**Owner role:** Sequential documentation coordinator.

## Disposition of the external review

This is the first repository edition of the reconciled report; v0.2 identifies the revision of the supplied review, not a claim that a repository v0.1 existed. The external review usefully asks for executable child assertions, fewer repeated instructions and early end-to-end evidence. Its examples were illustrative and must not override canonical contracts.

| Topic | Reconciled action |
| --- | --- |
| Decision order | Proposal → authorised bounded spike → recorded results → owner decision → status and application integration. No agent self-acceptance. |
| D-01 split | D-01a backend preparation and D-01b frontend adoption are separate; retain existing preview and defer framework adoption until its own decision is needed. No fixed React/Tailwind rewrite is introduced. |
| Session examples | POST/GET/DELETE `/session`; Login uses username/password. Unknown-field handling must match explicit adapter policy; server actor cannot be forged. Repeated expired/invalidated logout uses declared 204 under UC-01 EX-03. |
| Validator compatibility | Ajv 2020-12 is a candidate. References, formats, actual route loading, annotation handling, input mutation settings and response serialization must be tested together. |
| Session rationale | Opaque DB sessions simplify logout/expiry; document revocation still requires authoritative permission checks and guarded handoff. Thirty-minute/eight-hour limits remain discussion values. |
| Existing safeguards | SP-09.4 already requires barriers/captured bytes; SP-10.4 already covers uncited operational evidence. Turn them into executed tests rather than claiming missing requirements. |
| Proposed ADRs and packages | Resolve only relevant gates. Permit bounded authorised experiments; do not infer application adoption or whole-pack acceptance. New dependencies require a purpose, boundary and evidence; independent work continues. |
| Task repetition | Put common evidence/authority rules in execution.md; retain child-specific prerequisites/assertions. Expand the selected SP-01.1 now; do not invent 52 detailed assertions without rereading their contracts. |
| Audit and status automation | Later checks may enforce declared coverage and handoff presence, but only handler/DB failure tests prove audit atomicity. Version/link checks cannot prove semantic source review or independent acceptance. |
| Algorithms | Reuse stack section 7 and implemented SQL baseline. ANN, reranking, BM25/fuzzy, graph infrastructure and orchestration frameworks remain unselected experiments. |

## Execution order and retained scope

Prepare SP-01.1 first. Then establish SP-01 with applicable SP-11.1 capture, SP-02 membership foundation, and the first SP-03/04 work slice. SP-06/07 provide document access/versions; SP-08 requires SP-03 as well as SP-06. Only after the work/document and evidence prerequisites should SP-09 relay execute. SP-10 depends on SP-04/09; SP-12 final verification still depends on SP-05/09/10. This preserves the canonical work-before-AI constraint.

An early demonstration can show login → project/task → restricted document → exact citation → revoke → withheld answer, with keyword fallback. It does not replace full pack acceptance. SP-05 may be sequenced around knowledge preparation only through an explicit planning update that preserves its dependencies and all Must ACs. This batch does not rewrite the canonical roadmap or defer Sprint lifecycle or membership removal. No “demo-only” Scrum standard is introduced.

## Concrete next batch

The [SP-01.1 brief](briefs/SP-01.1-session-foundation.md) and Proposed [backend ADR](../adr/0024-backend-session-foundation.md) / [session ADR](../adr/0025-opaque-session-candidate.md) provide the reviewable preparation. Record structural pre-evidence separately from pending HTTP/DB/session evidence in the [dated result](../sdlc/reports/SP-01.1-preparation-2026-10-27.md). No dependency, production session default or framework is adopted by this report.

**Checklist:** Pass for review disposition and dependency correction; Gap for full runtime spike, technology selection and application acceptance. **Handoff:** execute only the selected brief's authorised scope; keep unresolved material choices visible.
