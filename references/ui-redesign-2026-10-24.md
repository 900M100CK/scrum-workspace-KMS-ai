# Work preview visual redesign

**Artifact ID:** UI-REDESIGN-01
**Version/date:** 0.1 Draft · 24 October 2026
**Status:** Owner-requested synthetic preview redesign; author verification only.
**Inputs:** UX-WF-EX-01 v0.1 frames 03/04/10; UX-BLUEPRINT-01 v1.3; UI-REF-01 v0.3; PRD-01 v0.9; SAD-03 v0.15; existing contracts; ADR-0008/0014; Proposed ADR-0003/0018/0019.
**Trace:** BR-01/02/03/06/10/13; SC-01/03/04/06/08; SP-01–05 presentation groundwork.

## Direction and boundaries

The owner requested a redesign using the newly installed skills. Taste is the sole visual lead, at canonical `C:/Users/MCK/.codex/skills/design-taste-frontend/SKILL.md`, with its app-screen reference. Web Design Guidelines at canonical `C:/Users/MCK/.codex/skills/web-design-guidelines/SKILL.md` supplies review criteria. Local Karpathy Guidelines and Ponytail supply implementation discipline. React/shadcn optimization and framework migration guidance do not apply to this plain DOM preview. The [project workflow](../agents/development-skills.md#ui-skill-workflow) governs these roles.

The workspace draw selected **achromatic-ledger**, seed **1650259184**, without a redraw. The [direction sheet](../.taste-skill/direction.json) preserves the result. A neutral ledger supports repeated planning and source inspection: blue-grey ground, white task surfaces, labelled navigation, Geist typography, restrained borders and colour reserved for work state. A linked-thread mark and task-to-source context provide product identity. No decorative charts, invented metrics or extra work states were added.

Data inventory: two synthetic projects; nine tasks total, including five active-Sprint tasks, three initial Backlog tasks and one completed-Sprint task; three Board states; project-scoped assignees; one initially blocked active task with ordered events; exact fictional document/version/passage links. Counts and controls derive from fixtures. Project selection answers which workspace to enter; Board shows current work and blockers; Backlog supports ordering and Sprint planning; task details explain ownership, history and source evidence.

The existing [wireframe implementation record](ui-work-wireframe-2026-10-24.md) remains a historical snapshot. This redesign preserves its local workflows, generic denied shells, unknown-outcome restrictions and exact-source handling. It does not implement application handlers, select the Proposed stack, change contracts, grant access or provide server permission evidence.

## Implementation and rendered review

- Reworked entry/project selection, shell, Board, Backlog, planning, task inspector and dialogs through shared presentation styles. Labelled SVG icons replace inconsistent glyphs; IDs retain monospace, ordinary text uses Geist.
- Self-hosted the licensed [Geist font](../apps/web/assets/README.md), preloaded locally. The server allows only the specific font asset, keeps loopback binding and `connect-src 'none'`, and explicitly restricts fonts to self.
- Desktop has a 256px sidebar and three Board columns. Tablet folds project navigation. Phone uses 44px primary controls and a single task-detail pane; closing restores task focus and the Board. Escape closes navigation or task context.
- Review fixes addressed a mobile menu specificity conflict, excess phone header space and small mobile controls. At 390 × 844 the first task starts at 476.5px, inside the first 60% of the viewport. No horizontal overflow was observed at 1440, 768 or 390 widths. Geist loaded successfully in the browser.

Fresh browser evidence: [desktop Board, 1440 × 900](ui-redesign-desktop-2026-10-24.png), [tablet Backlog, 768 × 1024](ui-redesign-tablet-2026-10-24.png), [phone task details, 390 × 844](ui-redesign-mobile-2026-10-24.png). Desktop navigation is persistent; phone menu state, Escape/focus and single-pane task details were exercised. These are bounded author observations, not independent usability or accessibility acceptance.

Taste source lint returned zero failures and four warnings. The two section-label warnings refer to actual scope/context labels, monospace is restricted to identifiers, and the shadow is for an overlay dialog. The skill's separate browser inspection script was not run because platform browser control must use the provided computer-use surface. Equivalent viewport observations used that surface. Review also consulted the primary [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md).

## Verification and handoff

Bundled Node 24.22.1: local UI/static-server tests passed **14/14**, including menu state/Escape/navigation and font MIME/signature/allowlisting. They preserve the existing fixture interaction checks; they verify zero live application handler behaviours. Structural results are recorded in the register after the final run.

Live session, current server permissions, concurrency/idempotency, database/provider integration, complete Documents/Search/AI/Audit screens, independent usability/accessibility acceptance and production deployment remain open. Contracts were unchanged and contract/storage/evaluation suites were not rerun. No commit or parallel agent was used. Pre-flight reviewed: presentation scope retained, exact sources and permission boundaries preserved, no BRD or accepted ADR edited. Handoff: inspect this local direction before choosing the application stack and integrating the work-first slices.

Final author checks (bundled Node 24.22.1): context:lint and context:check passed; context:test passed 45/45; docs:lint passed for 20 diagram pairs and 35 manifest artifacts; docs:test passed 18/18. UI syntax and changed tracked-file whitespace checks passed. Taste source lint: zero failures, four explained warnings. These are presentation and structural results, with zero live application handler behaviours verified.
