# Web client and local UI preview

Status: synthetic interactive design preview supplied; application handlers and live API integration remain unimplemented. React/TypeScript adoption remains Proposed. Use Workspace same-origin facade for future application integration; never access internal service or database endpoints.

Initial screens: sign-in, project/backlog/basic board, fixed Sprint lifecycle, source editor/view with Current/Superseded/Archived history, task source links, keyword search, cited question response and permitted inspection. Unsaved form text is not a persisted product Draft; a confirmed revision becomes Current immediately. Each surface needs loading/empty/validation/conflict/not-found/AI-failure states. No role-based hidden control is an authorisation mechanism.

Document source links pin document/version/passage; unavailable history does not redirect. Operational citations retain the delivered observation locator separately from renewed current state. AI outage leaves work/document/keyword paths usable only while their own dependencies are healthy; Knowledge failure may also prevent document reads/search, and unknown authority denies protected output. Defer visual map/drag polish/reports; no meeting UI or autonomous writes. Follow each spec allowed-path scope.

Use the [UX entry](../../docs/sdlc/ui-ux-spec.md), [wireframe work plan](../../docs/ux/wireframe-workplan.md) and [reference desk](../../references/README.md) for source bindings and evidence gaps. These are draft design inputs; no runtime permission behavior is implemented here.

## Run the preview

With Node 24+ active, run from the repository root:

```powershell
npm --prefix apps/web start
```

Open [the local preview](http://localhost:4173). The preview server binds only to `127.0.0.1:4173` and serves an explicit UI asset allowlist. Stop it with Ctrl+C. No build or new package installation is required for the preview. UI tests use the root's existing `jsdom` development dependency:

```powershell
npm --prefix apps/web test
```

Select a sample project, open a task, change its local state, create a sample Backlog task, or switch the View state control to inspect failure variants. No account or credentials are needed. This preview uses only synthetic memory state; reload resets local changes. The entry screen explains the pending live identity integration. Documents/Search/Members are explicitly deferred screens, not working API features.

## Workflows aligned with the wireframe

- **Unavailable scope:** Unavailable, authority failure, load failure and loading render a neutral shell without project name, task counts, previous inspectors or source dialogs. The View state control is a preview tool, not an authorisation control. A real application must obtain fresh server authority before rendering again.
- **Backlog order:** Move up/down with native buttons, review the unsaved order and apply the full list explicitly. Filtered/partial/read-only/conflicting/unknown states disable reorder. The sample retains an exact revision string and checks the complete permutation locally; this is not server concurrency evidence.
- **Sprint planning:** Select a Sprint, select Backlog items, allocate individually, create a planned Sprint with dates/goal, then exercise Planned → Active → Completed. Completion requires confirmation; Done work remains in history and unfinished work returns as To Do. A second Sprint cannot start while one is Active in the sample.
- **Mixed outcomes:** Choose `Mixed allocation outcomes`, then select the three initial Backlog tasks and allocate. Confirmed, Rejected and Outcome unknown appear separately. Confirmed items remain applied. The unknown item's original in-memory operation context is retained across project navigation; that task and affected reorder/lifecycle controls remain disabled. There is no simulated polling endpoint, automatic retry or claim of rollback. Reload explicitly resets the whole disposable fixture rather than reconciling a real operation.
- **Task context:** A nonmodal panel sits alongside the work on wider layouts and stacks above it on tablet layouts; phone layouts show task details as a single pane. Assign only a member of the selected sample project, change state, append Open/Resolved blocker events and inspect an exact synthetic source. Escape/Close restores task focus. Source unavailable/denied/failure variants do not substitute another version; denial hides source metadata in both inspector and dialog.

The test suite covers these local interactions, partial/filtered reorder restrictions, mixed allocation outcomes, fixed Sprint lifecycle, project-scoped member options, denied metadata clearing, source denial, focus restoration, escaped task titles and static server exposure. These tests do not verify any application handler, authentication, permission, database or concurrency acceptance criterion. See the [wireframe implementation handoff](../../references/ui-work-wireframe-2026-10-24.md) and the [historical first preview review](../../references/ui-review-2026-10-23.md).

## Visual direction

The current owner-selected direction is **soft green with a Hedvig wordmark/page title and Geist work text**, following the original green preview. Orange Studio and neutral Taste palettes are historical explorations.

Near-white workspace, a deeper green rail/columns and white cards provide a clear surface hierarchy. Column headings use Geist, state dots supplement status labels, selected cards use the primary green, and readable source links have distinct blue chips. Blocker callouts retain the latest reason. Sprint progress shows Done/Total for the entire active Sprint and stays stable while filtering.

The Board scrolls horizontally on narrow screens; columns never wrap. Empty columns show a static explanation, with no drag-and-drop promise. Assignee filters and Complete Sprint remain available. Use **Dark theme** to switch to moss-green surfaces; the choice survives navigation and preserves unsaved form text, while reload resets to light.

Status refinement (26 October 2026): Blocked uses the owner-selected amber/ochre palette, separate count badge and tinted selected state; the latest blocker reason and subtle card border use the same palette. Card surfaces remain unchanged. System error colours remain separate. The active Sprint badge uses the primary background and a static dot. The blocker marker and unselected filter count pulse twice over 3.2 seconds when rendered, then settle; reduced-motion users receive no pulse or hover transition. Existing local filtering semantics remain unchanged. UI/static-server/contrast tests passed 20/20 with Node 24.22.1, including both new theme colour pairs. Light/dark and filter toggling were visually checked; full accessibility, touch hardware and backend checks were not run. See the [rendered status refinement](../../references/ui-status-ochre-2026-10-26.png).

Owner colour convention: amber/ochre means work has an open blocker. Terracotta is reserved for operation/system errors such as Conflict, Denied or Failed and must never style a task blocker, its callout or its filter. Keep explicit labels and icons so meaning does not depend on colour alone. This convention does not itself implement a new error palette or change generic unavailable responses.

See the [CSS and green system report](../../references/ui-css-green-system-2026-10-26.md) for this refinement. Earlier records are historical: [Studio experiment](../../references/hallmark-studio-2026-10-25.md), [selection](../../references/ui-selection-2026-10-26.md), [Studio refinement](../../references/studio-refinement-2026-10-26.md), [reference clarification](../../references/ui-reference-clarification-2026-10-26.md), [dark theme](../../references/ui-dark-theme-2026-10-24.md), and [Taste redesign](../../references/ui-redesign-2026-10-24.md). See [font provenance and license](assets/README.md).
