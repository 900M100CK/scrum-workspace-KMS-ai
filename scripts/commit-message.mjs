import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const hook = `#!/bin/sh
if [ -f scripts/commit-message.mjs ]; then
  exec node scripts/commit-message.mjs "$1"
fi
`;

function git(args, input) {
  return execFileSync('git', args, { encoding: 'utf8', input, stdio: ['pipe', 'pipe', 'pipe'] }).trim();
}

function install() {
  try {
    git(['config', '--get', 'core.hooksPath']);
    throw new Error('A custom core.hooksPath is configured. Add the validator to your existing commit-msg hook.');
  } catch (error) {
    if (error.status !== 1) throw error;
  }
  const file = git(['rev-parse', '--git-path', 'hooks/commit-msg']);
  if (!existsSync(file)) {
    writeFileSync(file, hook, { flag: 'wx', mode: 0o755 });
  } else if (readFileSync(file, 'utf8') !== hook) {
    throw new Error('A commit-msg hook already exists. Add the validator to that hook.');
  }
  console.log('Conventional Commits hook enabled.');
}

function validate(file) {
  const message = readFileSync(file, 'utf8');
  const subject = git(['stripspace', '--strip-comments'], message).split('\n', 1)[0];
  if (subject.startsWith('Merge ') && existsSync(git(['rev-parse', '--git-path', 'MERGE_HEAD']))) return;
  if (!/^[a-z][a-z0-9-]*(?:\([^()\s]+\))?!?: \S/u.test(subject)) {
    throw new Error('Use type(scope): description, e.g. fix(workspace): clarify the error message. Scope and ! are optional.');
  }
}

try {
  const [argument] = process.argv.slice(2);
  if (!argument) throw new Error('Pass a commit message file or use --install.');
  if (argument === '--install') install();
  else validate(argument);
} catch (error) {
  console.error(`Commit message: ${error.message}`);
  process.exitCode = 1;
}
