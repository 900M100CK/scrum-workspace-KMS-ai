# CC-02: Verify commit validation

**Version/date:** 0.1 Draft · 14 November 2026

Prerequisite: CC-01. Use a disposable Git repository and synthetic messages; do not commit in the project. Confirm valid scoped and breaking subjects with a Co-Authored-By trailer pass, malformed and empty subjects fail, Git-generated merge messages work, and installation is repeatable and preserves an existing hook. Run `npm run context:lint`, `npm run context:check`, `npm run context:test` and `git diff --check`; use Node 24 for context checks. Record results and any setup limitation in the [plan](../plan.md).
