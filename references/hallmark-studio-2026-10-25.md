# Hallmark Studio experiment

**Artifact ID:** UI-STUDIO-01
**Version/date:** 0.1 Draft · 25 October 2026
**Status:** Experimental local branch; author review only.
**Inputs:** UX-BLUEPRINT-01 v1.4; UX-WF-EX-01 v0.1; UI-REF-01 v0.5; existing work preview; Proposed ADR-0003.
**Trace:** BR-01/02/03/10/13; SC-01/03/06/08; SP-01–05 presentation groundwork.

## Request and boundary

The owner requested a new branch to experiment with Hallmark's **Studio / Field Office, an identity studio** design. Branch `codex/hallmark-field-office` starts at `1fee971` on the current main branch. Field Office is the supplied theme example, not a replacement product name or a claim that this Scrum application is an identity studio. Threadwork, all synthetic fixture facts, event handlers, form fields, test hooks, exact-source rules and dark-theme behaviour remain unchanged.

Hallmark v2.0.0 at canonical `C:/Users/MCK/.codex/skills/hallmark/SKILL.md` is the sole visual lead. Its `references/themes/studio.md`, reference image, app-screen and redesign guidance govern this experiment. Taste is not combined with it. Local Karpathy Guidelines and Ponytail govern implementation. Audience and use come from the existing project: a Scrum team planning work and inspecting source context. Material is the existing synthetic product; no photos, metrics, quotes, customer logos or external AI generation are needed.

Unrelated pre-existing package, submodule, Obsidian and temporary-file changes are preserved. The skill's clean-tree suggestion does not justify stashing or overwriting owner work. The branch isolates the experiment's Git base; its current design edits remain uncommitted. No new provider, dependency, backend rule or contract is introduced.

## Design choices

- Cool paper canvas and blue-black text, with a single orange action; the app borrows Studio's palette/type/surfaces, not the example's marketing hero, font measurements or studio claims.
- Locally hosted Hedvig Letters Serif 400 for the wordmark and display headings; Geist stays on work text, metadata, labels and controls. [Font sources/licences](../apps/web/assets/README.md) are retained.
- Separated Board columns become proof sheets with small registration corners and shadows. Task items become flat rows separated by rules, preserving the owner's column-separation requirement without a card inside each card.
- Square controls, an inset rule on the primary button, sharper panel boundaries and a narrower project rail. Dark mode retains the warm action and the existing readable neutral layers.
- Dot texture is limited to the project directory's introductory region; it is not behind the working Board or running task text. No fabricated type measurements or decorative animation.
- Layout, styles and metadata are in `styles.css`, `tokens.css`, `base.css` and `index.html`. The static server adds only the exact CSS/font assets to its allowlist. `connect-src 'none'` and loopback binding remain.

The sidebar is retained as the existing shell. Existing middle-dot labels are retained verbatim to preserve tested copy; the owner/project preservation requirement takes precedence over the theme's punctuation rule. Scope labels name actual project context rather than decorative categories. Fixed columns and functional rows replace the theme's marketing composition. No independent reviewer or parallel agent is claimed.

## Evidence and critique

| View | Evidence |
| --- | --- |
| Light Board, 1440 × 900 | [Screenshot](hallmark-studio-board-2026-10-25.png) |
| Dark Board, 1440 × 900 | [Screenshot](hallmark-studio-dark-2026-10-25.png) |
| Light phone, 390 × 844 | [Screenshot](hallmark-studio-mobile-2026-10-25.png) |

Browser observations confirmed Hedvig loaded, the primary action resolved to #F38523, and no horizontal page overflow at 1440 or 390 widths. Phone columns stacked at about 343px within the available width. A capped 1600px app canvas prevents unlimited stretching. The original synthetic interaction suite covers loading, empty, denied, failure, conflict and unknown presentations; these are not live permission evidence.

Hallmark static sweep over the stylesheet and entry HTML: **0 FAIL, 0 WARN, one answered Finish finding** for the retained source dialog's edge and shadow. Its separate render/capture driver was not run: platform browser interactions use the provided computer-use surface, which supplied the screenshots instead. No automatic rendered Hallmark or axe pass is claimed. App-scope review is in-thread, not independent: the hierarchy, restrained colour, phone stacking and existing controls remain legible; the largest tradeoff is lower visible item density and less familiar serif column headings. The previous design's sans headings were quicker to scan; this branch deliberately tests an editorial alternative.

Initial verification found two failures after a punctuation experiment changed tested blocker/Sprint labels. The application module was restored to the branch base rather than weakening tests. Spacing-token failures were corrected; inherited-colour warnings were made explicit. The final implementation changes no application-module logic or copy. No test threshold was lowered.

Final test and structural results follow after execution. Remaining gaps: no automated render-tier/axe, assistive-technology, colour-vision, 200% zoom, hardware usability or independent acceptance; no live session, service permission, storage, provider or concurrency verification. Pre-flight/reporting checklist reviewed; no accepted ADR/BRD changed. Handoff: compare this branch's Studio direction against the committed neutral design before adopting it. No commit or push was requested for this experiment.

Final verification with bundled Node 24.22.1: UI/static-server/contrast tests passed 17/17; context:lint/context:check passed and context:test passed 45/45; docs:lint passed for 20 diagram pairs / 35 manifest artifacts and docs:test passed 20/20; generated metadata checked 66 outputs with no drift. Hallmark static sweep: zero failures and zero warnings, one answered dialog finish finding. The first documentation run failed on the supporting register's linked REG-00 v0.61 input after the version bump; DOC-REVIEW-REG-01 v0.3 updates that input to v0.62 and preserves historical correction anchors, then the checks passed. No live application handler behaviours verified; render-tier, contract, storage, provider, evaluation and independent acceptance remain unrun.
