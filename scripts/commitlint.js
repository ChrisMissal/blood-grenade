import { execFileSync } from 'node:child_process';

const resolveCommitRange = () => {
  const baseFromEnv = process.env.BASE_SHA;
  const headFromEnv = process.env.HEAD_SHA;

  if (baseFromEnv && headFromEnv) {
    return { base: baseFromEnv, head: headFromEnv };
  }

  try {
    const base = execFileSync('git', ['merge-base', 'origin/main', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return { base, head: 'HEAD' };
  } catch {
    return { base: 'HEAD~1', head: 'HEAD' };
  }
};

const { base, head } = resolveCommitRange();

console.log(`Validating commits from ${base} to ${head}`);

execFileSync('npm', ['exec', 'commitlint', '--', '--from', base, '--to', head, '--verbose'], {
  stdio: 'inherit',
});
