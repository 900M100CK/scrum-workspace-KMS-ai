# F-REG-01 full Workspace regression closure

**Artifact ID:** SP05-FREG-CLOSURE-01\
**Version/date:** 0.1 Draft · 5 November 2026\
**Disposition:** Resolved by returned Antigravity execution; not waived.\
**Coordinator:** Codex; no substitute runtime rerun during this reconciliation.

Antigravity returned report/tracking v0.5, [full regression record](../evidence/ag01-v05-full-regression/workspace-full-regression.json), [raw log](../evidence/ag01-v05-full-regression/workspace-full-regression.log) and the owner's [execution transcript](../evidence/ag01-v05-full-regression/owner-execution-transcript.txt). The reported execution covers40 non-browser Workspace files,347 passed/0 failed/0 skipped/0 cancelled/0 todo, Node24.22.1, pinned pgvector0.8.2/PG17.10, exit0 at source b40a01439e9cb2f1ce51f887bf238fe3bff9dd73. Raw footer duration is281266.1972ms (~4m41s); approximate JSON seconds281.35 is retained rather than silently corrected.

[Coordinator source/log reconciliation](../evidence/ag01-v05-full-regression/coordinator-verification.json) confirms:

- Full commit identity,122 published runtime/test/contract/config blobs and current working source match; later dossier commits change documentation only.
- The target Git tree resolves exactly40 expected top-level non-browser test paths. Each file's first static test-name marker is found in the raw log (40/40). The reviewer JSON records a placeholder command, not expanded argv; the coordinator inventory is explicitly reconstructed from the Git tree, not mislabelled as a captured reviewer argument array.
- Raw log footer and JSON counters/duration/exit report agree. The log is UTF16LE with a BOM; original bytes were preserved and decoded only in memory for inspection. The initial coordinator UTF8 parsing failure is retained as coordinator-attempt1.txt; it was not a runtime test failure or reason to rerun/change assertions.
- Returned report/tracking and log/JSON/transcript are copied byte-for-byte into fresh immutable snapshots; their hashes are retained. Earlier v0.4.1 statements that broader regression was unrun are historical and are superseded only for the current F-REG-01 status.

**F-REG-01 is closed within the stated full Workspace regression scope.** The347 count includes Node parent records and overlaps the earlier seven SP05 suites57 records; do not add these as unique requirements. The previously returned Edge execution remains a separate browser gate, not part of these40 files. Raw source-manifest v0.3.1 remains a frozen source snapshot; any earlier embedded execution status is superseded by report v0.5 and the new actual log/record.

[AG01 reconciliation](antigravity-reconciliation.md), [final handoff](final-handoff.md) and [M03 readiness checklist](m03-readiness.md) distinguish verified technical evidence from owner acceptance. No M03/release acceptance, main merge, runtime fix, scope change, dependency update, valuable-data migration or authority waiver is inferred. The existing docs-only Draft PR #2 publishes this receipt under PUB02; raw evidence is not rewritten.
