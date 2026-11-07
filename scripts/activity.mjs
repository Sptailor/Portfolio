// Writes data/activity.json from the GitHub contributions API.
// Run locally with `gh auth token`, or in CI with GITHUB_TOKEN set.
//   node scripts/activity.mjs

import { writeFileSync, mkdirSync } from 'node:fs';

const LOGIN = process.env.GH_LOGIN || 'Sptailor';
const TOKEN = process.env.GITHUB_TOKEN;
if (!TOKEN) {
  console.error('GITHUB_TOKEN is not set (try: GITHUB_TOKEN=$(gh auth token) node scripts/activity.mjs)');
  process.exit(1);
}

const QUERY = `
query($login:String!) {
  user(login:$login) {
    contributionsCollection {
      totalCommitContributions
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount } }
      }
    }
    repositories(privacy: PUBLIC, ownerAffiliations: OWNER) { totalCount }
  }
}`;

const res = await fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer ' + TOKEN,
    'Content-Type': 'application/json',
    'User-Agent': 'portfolio-activity'
  },
  body: JSON.stringify({ query: QUERY, variables: { login: LOGIN } })
});
if (!res.ok) throw new Error('GitHub API ' + res.status + ' ' + (await res.text()));

const json = await res.json();
if (json.errors) throw new Error(JSON.stringify(json.errors));

const user = json.data.user;
const cc = user.contributionsCollection;
const days = cc.contributionCalendar.weeks.flatMap((w) => w.contributionDays);
if (days.length < 300) {
  // A token without read:user comes back with an empty calendar rather than
  // an error. Fail here instead of overwriting good data with nothing.
  throw new Error(`only ${days.length} days returned; the token likely lacks read:user`);
}
const counts = days.map((d) => d.contributionCount);

// Four bands over the active days, the way the GitHub graph shades them.
const active = counts.filter((c) => c > 0).sort((a, b) => a - b);
const at = (p) => (active.length ? active[Math.min(active.length - 1, Math.floor(active.length * p))] : 1);
const [t1, t2, t3] = [at(0.25), at(0.5), at(0.75)];
const level = (c) => (c <= 0 ? 0 : c <= t1 ? 1 : c <= t2 ? 2 : c <= t3 ? 3 : 4);

let best = 0, run = 0;
for (const c of counts) { run = c > 0 ? run + 1 : 0; if (run > best) best = run; }

const out = {
  generated: new Date().toISOString(),
  from: days[0].date,
  to: days[days.length - 1].date,
  commits: cc.totalCommitContributions,
  contributions: cc.contributionCalendar.totalContributions,
  repos: user.repositories.totalCount,
  streak: best,
  levels: counts.map(level)
};

mkdirSync('data', { recursive: true });
writeFileSync('data/activity.json', JSON.stringify(out) + '\n');
console.log(`${out.levels.length} days, ${out.commits} commits, ${out.repos} repos, ${out.streak}-day streak`);
