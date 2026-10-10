# Template library guide

The workspace root `AGENTS.md` owns project rules. `SDLC-Prompt-Checklist/` is a pinned upstream prompt/checklist submodule, not the Scrum application specification.

- Initialize the submodule using the root README instructions. The pinned commit stores prompts and workbook checklists directly in its root; profiles reference those flat filenames.
- Keep templates project-neutral: explicit placeholders, separate source inputs and outputs, and no project facts or unvalidated targets in reusable examples.
- When prompt sections or review criteria change, inspect the matching workbook rows. Preserve standards names/version numbers and verify new compliance claims.
- Use `agents/02-use-cases.md` with the upstream use-case prompt/checklist. A local `UC/SKILL.md` or grouped folder layout is not part of the pinned upstream input.
- There is no upstream package manager or test runner for the templates. Inspect applicable Markdown/workbook rows; context checks establish paths and shapes, not standards conformance.

This guide records the existing project template conventions in the parent repository so a clean clone does not depend on an uncommitted guide inside the submodule.
