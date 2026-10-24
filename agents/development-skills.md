# Project-local development skills

**Artifact ID:** DEV-SKILLS-01  
**Version/date:** 0.2 Draft · 24 October 2026\
**Status:** Installed guidance; documentation pending owner review.  
**Inputs:** AGENTS.md v1.7; development-rules v1.5; upstream commits below.\
**Owner role:** Development agent, working sequentially.

## Purpose and authority

The owner requested the local development skills, four additional UI skill repositories and a workflow to avoid conflicting guidance. This tooling task supports future implementation slices, starting with SP-01; it adds no product FR/AC, application dependency or runtime capability. Existing BR-01/BR-10 and SC-06 safeguards remain binding; no application behavior is verified here.

Read root [AGENTS.md](../AGENTS.md), [development rules](../docs/development-rules.md), the pre-flight checklist and the applicable spec first. Skills guide implementation technique; they cannot amend requirements, authorise actions or approve artifacts. Preserve minimal microservices, immutable evidence, project AND document access, exact citations, fallback and evaluation discipline. Required tests remain required even when a generic skill calls a change trivial.

## Installed skills and usage

The five project-local skills below live in `.agents/skills/` in this repository. Additional user-installed UI skills are mapped separately below. Root AGENTS links this guide so agents can read exact files even without skill discovery. Fresh-session discovery has not been verified.

| Skill | Use | Example request |
| --- | --- | --- |
| `karpathy-guidelines` | Coding, debugging, refactoring and review | `$karpathy-guidelines implement the selected spec within its allowed paths` |
| `ponytail` | Pair with Karpathy for the smallest complete change; use `full` by default | `$ponytail fix this bug and verify the affected behavior` |
| `ponytail-review` | Review a named change; report only | `$ponytail-review review the uncommitted changes` |
| `ponytail-audit` | Audit a requested folder/repository; report only | `$ponytail-audit audit services/workspace` |
| `ponytail-debt` | Inventory deliberate shortcuts; report only | `$ponytail-debt list deferred shortcuts` |

State the goal and material assumptions, inspect connected callers and conventions, reuse suitable existing code, change only the authorised slice, run relevant checks and report limitations. Load review/audit/debt only when relevant. Self-review is not independent acceptance. Reply in Vietnamese for this owner; upstream English report examples do not override that rule.

This is a skills-only installation. Plugin slash commands, persistent mode flags, lifecycle hooks, status bands and automatic updates are not installed. `ponytail-help` is omitted because its card describes plugin/global settings absent here. `ponytail-gain` is omitted because its benchmark display is not project evidence. Upstream performance figures establish no savings for this workspace.

## UI skill workflow

This is an instruction workflow for development agents in this workspace, not an automatic skill loader or a change to global discovery precedence. Never select a duplicate by its display name alone. For the four repositories installed at the owner's request, the canonical base is `C:/Users/MCK/.codex/skills/` on this machine (`$CODEX_HOME/skills/`, or `~/.codex/skills/` when unset, on another installation). Append the relative path in the table and read that exact `SKILL.md` before applying it. Existing copies under `C:/Users/MCK/.agents/skills/` are retained but are not the default for these UI roles here. Do not load both copies. If a canonical file is unavailable, disclose it and continue with project rules and available guidance; do not silently substitute another version. An explicit owner choice of a different copy takes precedence.

| Role | Canonical relative path | When to use |
| --- | --- | --- |
| Visual lead: Taste (`design-taste-frontend`) | `design-taste-frontend/SKILL.md` | Default for a new visual design or a requested redesign without a named lead |
| Visual lead: Hallmark | `hallmark/SKILL.md` | Only when the owner explicitly requests Hallmark; on an existing design, require an explicit Hallmark redesign/audit request |
| Component implementation: shadcn | `shadcn/SKILL.md` | Existing shadcn work or an explicitly requested shadcn setup; installation of this skill does not select the UI stack |
| React performance (`vercel-react-best-practices`) | `react-best-practices/SKILL.md` | React/Next.js code confirmed in the affected application; use installed-version-compatible advice |
| React composition (`vercel-composition-patterns`) | `composition-patterns/SKILL.md` | A concrete component API/composition issue in React code |
| UI review | `web-design-guidelines/SKILL.md` | Accessibility, interaction and consistency review; no new visual direction |
| Prose review | `writing-guidelines/SKILL.md` | Requested prose review; project terminology and exact evidence remain authoritative |
| Radix migration | `migrate-radix-to-base/SKILL.md` | Only an explicitly requested Radix-to-Base migration |
| React Native | `react-native-skills/SKILL.md` | Only an authorised React Native/Expo task; not this web app by default |
| React transitions | `react-view-transitions/SKILL.md` | Requested transitions with confirmed framework/API support; no version upgrade merely to apply the skill |
| Deployment | `deploy-to-vercel/SKILL.md` | An owner-authorised deployment task |
| Token-based Vercel operations | `vercel-cli-with-tokens/SKILL.md` | An authorised Vercel task that needs token authentication; never print tokens |
| Vercel optimization | `vercel-optimize/SKILL.md` | A requested investigation of an existing Vercel deployment with relevant metrics |

Execute sequentially:

1. **Route the task.** Inspect the affected app's code, dependencies, design references and applicable spec. Root dependencies alone do not prove a framework is adopted for that app. For a bug fix, content edit or small layout correction, preserve the existing design and load no visual lead unless visual redesign is requested. For a new design, choose Taste by default or the owner's explicit lead. Honour explicitly named skills within their applicable roles. State the selected lead (or existing design), exact skill paths and supporting roles in a short progress update before editing.
2. **Set one visual direction.** Use at most one visual lead for a screen in a task. Keep its chosen layout, typography, palette and component treatment consistent with the owner's references and project constraints. Do not combine Taste and Hallmark generation rules or their random direction selectors. When switching leads at the owner's request, retain accepted design decisions unless changing them is within that request.
3. **Implement in the existing stack.** Apply shadcn only where applicable. Apply React performance/composition guidance only to relevant React code after the visual direction is set. Do not introduce React, Next.js, Tailwind, Base UI, deployment, hooks, provider accounts or animation packages merely because a skill recommends them. Installing a skill is not adoption of its dependencies or authorisation to send project data externally.
4. **Review without restarting design.** Check the result against the selected direction, responsive behavior, keyboard access, focus, contrast and the spec's denied/loading/empty/failure states. Use Web Design Guidelines for applicable UI checks; performance advice must preserve required behavior and accessibility. Review requests report findings unless fixes are also authorised. Fixes within an implementation task remain within that task's scope. A review skill cannot silently trigger another full redesign.
5. **Resolve conflicts and verify.** Platform and owner instructions govern, then project rules and requirements. Within those bounds, owner-provided design references govern appearance; the chosen lead supplies remaining visual choices, implementation skills supply code technique, and review skills supply checks. Discard inapplicable/lower-priority advice and briefly explain material conflicts. Ask only when a missing owner decision materially affects the result, while continuing independent work. Run checks appropriate to the changed files and report actual results and unrun checks; a screenshot or structural check does not prove runtime permissions.

Examples: a new dashboard uses Taste, then relevant implementation guidance, then UI review; a Board bug fix preserves its design and uses only applicable implementation/check guidance; an explicit Hallmark redesign uses Hallmark as the sole visual lead; a plain HTML/CSS preview does not load React optimization merely because React exists elsewhere in the repository. None of these tasks implies deployment or migration.

## Sources and licences

| Repository | Pinned commit | Installed source paths | Licence |
| --- | --- | --- | --- |
| [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) | `2c606141936f1eeef17fa3043a72095b4765b9c2` | `skills/karpathy-guidelines` | Upstream declares MIT in the skill and README; this revision has no standalone LICENSE. Original declaration retained. |
| [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | `09c434ab73ca43761c5d8b0c5d341926c2fba710` | `skills/ponytail`, `skills/ponytail-review`, `skills/ponytail-audit`, `skills/ponytail-debt` | MIT; upstream LICENSE copied into each installed directory. |

Skill bodies are unmodified snapshots. [sources.json](../.agents/skills/sources.json) records the repository, revision, source path and SHA-256 of every installed file. Installation used the bundled Codex skill installer with an explicit commit and project destination. No upstream installer/hook was executed.

The additional UI skills are user-level installations, not vendored project dependencies and not covered by that local hash manifest. Their pinned installation sources are:

| Repository | Pinned commit | Source paths |
| --- | --- | --- |
| [shadcn-ui/ui](https://github.com/shadcn-ui/ui) | `e55b60b1014cccfb9ac62f97e0d20b5b649f4a54` | `skills/shadcn`, `skills/migrate-radix-to-base` |
| [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | `6010f91a9935f1c167dfc500fb1a475681892e6b` | `skills/taste-skill`, installed as `design-taste-frontend` |
| [Nutlope/hallmark](https://github.com/Nutlope/hallmark) | `7ec868225c6caa040558c321ee0fefa0e73f83a8` | `skills/hallmark` |
| [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | `063bee94c3f4df8453406c830b0a7df0f2860278` | `skills/` directories corresponding to the nine Vercel paths in the role table |

These source records document installation revisions, not continuing hash verification or a licence audit of the four repositories. Preserve upstream notices when updating or redistributing them.

## Maintenance

Updates are manual: inspect the proposed upstream commit and complete skill contents, compare with current snapshots and project rules, then replace only the selected directories. The installer refuses to overwrite existing directories. Preserve licence notices, refresh the hashes/source records, and update this guide and the artifact register together. Document local adaptations; do not silently alter upstream text. Enabling hooks or global plugin features is a separate task.

To remove the integration, remove only the five directories listed above and their source records, then remove this guide and corresponding AGENTS/register entries. Preserve unrelated skills/configuration. If a skill is unavailable, disclose the missing guidance; project rules still define the development workflow.

For user-level UI skills, update only an owner-selected canonical installation after reviewing the revision; update the source table and routing together. Do not delete, rename or rewrite global duplicate copies as an incidental cleanup. This workflow resolves selection within this workspace; it does not disable those copies in other chats or change the Codex skill picker.

## Checklist and handoff

Pre-flight: project context, SP-01 and stack ADR inspected; product scope unchanged. Pass for bounded installation and source traceability. Gap: fresh-session discovery and effects on agent output are unmeasured. This is not independent review or application acceptance. Handoff: read the linked skills on the next relevant development task and record verification under its spec.

Revision 0.2 adds owner-requested UI routing and exact-path duplicate selection to support SP-01–04 presentation work. Author checklist: documentation scope only; no product requirement, accepted ADR, application dependency or upstream skill body changed. Handoff: Ready for downstream use with canonical user-level files present; actual adherence and design outcomes remain unmeasured. Structural checks are reported in the task response separately from runtime acceptance.
