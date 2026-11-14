# SP09-PUB01 — Publish the fixture for review

Parent [FEAT-SP09-01](../plan.md). Prerequisite P05 fixture evidence.

1. Verify branch, ancestry and remote refs. Review staged paths and run Git whitespace checks and structural checks.
2. Commit SP-09 runtime, tests and documentation with the SP-08 backtracking documents. Exclude machine-local material.
3. Push the topic branch and open one draft PR to main with reproduction, saved results and TC-26 limits.
4. Verify the exact PR head and wait for its CI result. Pass the PR and check links to PUB03.
