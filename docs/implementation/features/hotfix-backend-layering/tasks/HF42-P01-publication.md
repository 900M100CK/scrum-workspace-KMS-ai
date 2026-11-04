# HF42-P01 — commit and main integration

**Artifact ID:** HF42-P01\
**Version/date:** 0.1 Draft · 4 November 2026

Parent/status authority: [plan v0.3](../plan.md#owner-authorised-publication--4-november-2026). Owner explicitly authorised commit and direct main integration/publication. Same PLAN-01 Month1 / M-02–M-03 / SP-03–SP-04 documentation support.

Prerequisites: HF42-T01–T03/F01 evidence, current branch codex/hotfix-backend-layering and origin/main at the base or a verified non-conflicting ancestor. Exact allowed paths are the original metadata-scope.json list plus the owning feature folder. No code/contracts/migrations, source SP-04 checkout, dependency pins, branches or worktree deletion.

Steps: inspect exact staged scope and retained evidence logs; run the registered five structural checks/whitespace; commit using Codex identity and Co-Authored-By byline; switch this clean worktree to main and fast-forward only; push normally without force and verify origin/main equals the commit. If remote moved, stop only the dependent publication and reconcile without overwriting user work. A rejected push/protected-main policy is not authority to bypass it. Report actual commit/ref and CI state to the owner.

Recovery: before publication correct only this isolated worktree's scoped diff. After publication do not reset/force-push main; any correction uses a normal follow-up commit within owner-authorised scope. Preserve source checkout and prior negative test evidence. Publication does not claim runtime/CI success unless actually observed.
