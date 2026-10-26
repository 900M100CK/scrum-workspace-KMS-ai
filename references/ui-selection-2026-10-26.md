# Studio visual direction selected — 26 October 2026

The owner explicitly selected the existing Hallmark Studio preview and requested merging the experimental branch into main: “ok chốt bản này merge với main đi”. This authorizes integration of the reviewed appearance, local UI tests, self-hosted fonts, screenshots and associated reporting records. The [Studio experiment](hallmark-studio-2026-10-25.md) preserves design choices and prior verification, including its initial failures and remaining gaps.

This is a visual selection, not acceptance of live application handlers, permission enforcement, accessibility certification, production readiness or the Proposed application stack. The existing synthetic preview and work/source safeguards remain unchanged. No new design edit is part of this integration.

Commit scope excludes the pre-existing root package/lockfile changes, submodule work, Obsidian settings, temporary files and unrelated untracked documents. They remain in the working directory. No force push or history rewrite is intended. Final tests and Git integration outcome are recorded in the task response.

Pre-merge verification on 26 October 2026 with Node 24.22.1: UI/static-server/contrast tests 17/17 passed; docs lint and tests 20/20 passed; generated metadata checked 66 outputs with no drift. No code changes since the Studio interaction/render observations beyond documentation and licence whitespace. This run does not add live handler, contract/storage/provider or independent accessibility acceptance evidence.
