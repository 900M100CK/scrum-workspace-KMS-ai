# Project-local development skills

**Artifact ID:** DEV-SKILLS-01  
**Version/date:** 0.1 Draft · 22 October 2026  
**Status:** Installed guidance; documentation pending owner review.  
**Inputs:** AGENTS.md v1.6; development-rules v1.5; upstream commits below.  
**Owner role:** Development agent, working sequentially.

## Purpose and authority

The owner requested both repositories for this workspace. This tooling task supports future implementation slices, starting with SP-01; it adds no product FR/AC, application dependency or runtime capability. Existing BR-01/BR-10 and SC-06 safeguards remain binding; no application behavior is verified here.

Read root [AGENTS.md](../AGENTS.md), [development rules](../docs/development-rules.md), the pre-flight checklist and the applicable spec first. Skills guide implementation technique; they cannot amend requirements, authorise actions or approve artifacts. Preserve minimal microservices, immutable evidence, project AND document access, exact citations, fallback and evaluation discipline. Required tests remain required even when a generic skill calls a change trivial.

## Installed skills and usage

Skills live in `.agents/skills/` in this repository. Root AGENTS links them explicitly so agents can read them even without skill discovery. Codex can discover them on the next turn; if the picker has not refreshed, open a new chat in this folder. Fresh-session discovery has not been verified.

| Skill | Use | Example request |
| --- | --- | --- |
| `karpathy-guidelines` | Coding, debugging, refactoring and review | `$karpathy-guidelines implement the selected spec within its allowed paths` |
| `ponytail` | Pair with Karpathy for the smallest complete change; use `full` by default | `$ponytail fix this bug and verify the affected behavior` |
| `ponytail-review` | Review a named change; report only | `$ponytail-review review the uncommitted changes` |
| `ponytail-audit` | Audit a requested folder/repository; report only | `$ponytail-audit audit services/workspace` |
| `ponytail-debt` | Inventory deliberate shortcuts; report only | `$ponytail-debt list deferred shortcuts` |

State the goal and material assumptions, inspect connected callers and conventions, reuse suitable existing code, change only the authorised slice, run relevant checks and report limitations. Load review/audit/debt only when relevant. Self-review is not independent acceptance. Reply in Vietnamese for this owner; upstream English report examples do not override that rule.

This is a skills-only installation. Plugin slash commands, persistent mode flags, lifecycle hooks, status bands and automatic updates are not installed. `ponytail-help` is omitted because its card describes plugin/global settings absent here. `ponytail-gain` is omitted because its benchmark display is not project evidence. Upstream performance figures establish no savings for this workspace.

## Sources and licences

| Repository | Pinned commit | Installed source paths | Licence |
| --- | --- | --- | --- |
| [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) | `2c606141936f1eeef17fa3043a72095b4765b9c2` | `skills/karpathy-guidelines` | Upstream declares MIT in the skill and README; this revision has no standalone LICENSE. Original declaration retained. |
| [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | `09c434ab73ca43761c5d8b0c5d341926c2fba710` | `skills/ponytail`, `skills/ponytail-review`, `skills/ponytail-audit`, `skills/ponytail-debt` | MIT; upstream LICENSE copied into each installed directory. |

Skill bodies are unmodified snapshots. [sources.json](../.agents/skills/sources.json) records the repository, revision, source path and SHA-256 of every installed file. Installation used the bundled Codex skill installer with an explicit commit and project destination. No upstream installer/hook was executed.

## Maintenance

Updates are manual: inspect the proposed upstream commit and complete skill contents, compare with current snapshots and project rules, then replace only the selected directories. The installer refuses to overwrite existing directories. Preserve licence notices, refresh the hashes/source records, and update this guide and the artifact register together. Document local adaptations; do not silently alter upstream text. Enabling hooks or global plugin features is a separate task.

To remove the integration, remove only the five directories listed above and their source records, then remove this guide and corresponding AGENTS/register entries. Preserve unrelated skills/configuration. If a skill is unavailable, disclose the missing guidance; project rules still define the development workflow.

## Checklist and handoff

Pre-flight: project context, SP-01 and stack ADR inspected; product scope unchanged. Pass for bounded installation and source traceability. Gap: fresh-session discovery and effects on agent output are unmeasured. This is not independent review or application acceptance. Handoff: read the linked skills on the next relevant development task and record verification under its spec.
