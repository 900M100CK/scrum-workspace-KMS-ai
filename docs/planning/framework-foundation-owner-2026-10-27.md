# Owner-directed framework foundation

**Artifact ID:** OWNER-FRAMEWORK-01\
**Version/date:** 0.1 Draft · 27 October 2026\
**Status:** Owner-authorised framework initialisation; session/provider/guard decisions remain open.\
**Inputs:** Owner messages in this chat: initialise frontend/backend on main following TECH-STACK-01, keep existing UI/UX under design/prototype, save feature branch first, push to confirmed origin, then bring main into feature; ADR-0003/0024/0025.\
**Trace:** Shared preparation for SP-01 and the existing two-service architecture; BR-01/10; SC-06 relevance.\
**Owner role:** Project owner direction recorded by sequential implementer.

The user explicitly requested framework initialisation and referred to tech-stack.md when asked to confirm React/Vite/TypeScript and Fastify/TypeScript. The user also explicitly confirmed https://github.com/900M100CK/scrum-workspace-KMS-ai as the destination for plan/task documents and source publication after automatic push review asked for destination confirmation. This record grants no independent reviewer acceptance or real-data/provider transfer.

Selected and installed foundation tuple: Node 24.22.1 used for verification; React/react-dom 19.3.1, Vite 8.3.5, TypeScript 6.0.3, Fastify 5.12.7, @types/react/@types/react-dom 19.3.0 and @types/node 24.19.2. Root React 18 tooling for Excalidraw is separate from the application's React 19 workspace. Direct application versions are pinned; root lockfile captures resolution. TypeScript 6 is the compiler-API compatibility alternative already allowed by the stack inventory; no dual compiler is selected. No additional React compiler plugin is needed for the tested native Vite transform.

This selection covers scaffold/dev/build/typecheck/liveness and a React entry only. D-02 credential provisioning, KDF/session mechanism/expiry/cookie/CSRF/time policy, actual pg adapter/transaction behaviour, D-07 handoff guards, provider and retrieval/evaluation choices are not accepted by this request. ADR-0024's wider driver/schema integration and ADR-0025 remain Proposed. SP-01 tasks must reconcile the actual foundation and retain their unexecuted security/session/DB gates.

Source/checkpoint: feature documents were committed as 7113a82 before main initialisation; shared docs were fast-forwarded onto main to avoid divergent rule/register copies. The [foundation plan](../implementation/features/framework-foundation/plan.md) records coordinated paths, tasks and evidence. Owner-directed scope authorises moving the existing synthetic web preview to design/prototype and creating separate application packages; it does not authorise redesign or domain-scope cuts.

**Checklist:** Self-checked for recorded owner instruction and bounded selection; detailed execution results are registered separately. **Handoff:** foundation smoke is not application acceptance; continue the relevant SP-01 tasks with their remaining decisions.
