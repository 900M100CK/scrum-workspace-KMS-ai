# SP09-PUB02 — Synchronize main and retire the SP-08 checkout

Parent [FEAT-SP09-01](../plan.md). Scope is local Git refs and the managed SP-08 worktree. Preserve the SP-07 checkout.

1. Fetch origin/main and verify local main is an ancestor and is not checked out. Update the ref using the old SHA.
2. Verify SP-08 ancestry and clean tracked/untracked status. Copy ignored .tmp data outside the worktree and compare hashes.
3. Archive the managed checkout and verify detachment. Delete the branch with Git's merged-branch check. Retain it if a safety check fails.
4. Pass the final refs, worktree list and backup verification to PUB03.
