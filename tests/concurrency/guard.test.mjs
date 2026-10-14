import test from 'node:test';

// ADR-0011: explicit unimplemented handler gates, never passing evidence.
test.todo('T-1: ten authenticated scoped internal policy reads finish within policy_timeout_ms while a handoff holds the guard');
test.todo('T-2: revocation waits for source/citation/AI handoff completion or confirmed abort, then commits');
test.todo('T-3: crash after Workspace registration and before Knowledge persist; same-key retry creates exactly one version and initial grant');
test.todo('T-4: orphan ACL without content and unknown document produce identical public responses');
test.todo('T-5: delayed create racing orphan cleanup cannot lose committed policy or revive a cancelled operation');
