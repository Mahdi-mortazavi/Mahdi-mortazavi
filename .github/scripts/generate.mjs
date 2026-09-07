#!/usr/bin/env node
/**
 * Living profile engine.
 * Pulls live data from the GitHub API, renders brand-consistent Liquid-Glass
 * SVG cards, and rewrites the marked sections of README.md.
 * Self-hosted on purpose: no third-party card service can break this profile.
 */
import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { C, FONT, defs, glass, esc, tehran, nf } from './lib-theme.mjs';
import { hero, stack, growth, heat, headline, footer } from './lib-cards.mjs';

const USER = 'Mahdi-mortazavi';
const OUT = 'assets/live';
const API = 'https://api.github.com';

// Presentation hints for repos I've written a Persian line for. Anything not
// listed still shows up automatically — selection is by stars, not by this map.
const META = {
  relay:  { name: 'relay',           icon: '📡', fa: 'ریلی — اشتراک آنیِ اینترنت بین اندروید و ویندوز' },
  flow:   { name: 'Flow — تک‌نقطه',   icon: '◉',  fa: 'تک‌نقطه — تمرکز، عادت و کارِ عمیق، مبتنی بر علم رفتار' },
  app:    { name: 'Nava',            icon: '🍎', fa: 'نوا — اپ بهره‌وری مینیمال با الهام از طراحی اپل' },
  purify: { name: 'purify',          icon: '🧹', fa: 'پیوریفای — پاک‌سازی هوشمند و فوق‌سریع دیسک ویندوز' },
  mova:   { name: 'Mova',            icon: '🌀', fa: 'موا — در حرکت، نه در کمال' },
  sooda:  { name: 'sooda',           icon: '💎', fa: 'سودا — ماشین‌حساب سود، قیمت فروش و تخفیف، آفلاین و دوزبانه' },
  overrun:{ name: 'overrun',         icon: '🎮', fa: 'اورران — شوتر آرنای بلادرنگ روی لبه‌ی شبکه' },
};
// Repos that are infrastructure, not portfolio pieces.
const HIDE = new Set(['mahdi-mortazavi', 'mahdi-mortazavi.github.io']);
const MAX_FEATURED = 6;

// STARS_TOKEN (optional) is a personal token with public-repo read. It is the
// only credential GitHub accepts for cross-repo /stargazers: the built-in
// GITHUB_TOKEN gets 403 there and an anonymous retry gets 401. Without it the
// growth curve still works — it just builds from daily snapshots instead of
// backfilled star timestamps.
const TOKEN = process.env.STARS_TOKEN || process.env.GITHUB_TOKEN;
// Which credential is in play? Length only — never the value.
console.log('auth:', process.env.STARS_TOKEN ? `STARS_TOKEN (${process.env.STARS_TOKEN.length} chars)`
  : process.env.GITHUB_TOKEN ? 'GITHUB_TOKEN (STARS_TOKEN not set)' : 'anonymous (no token)');
const headers = {
  'Accept': 'application/vnd.github+json',
  'User-Agent': 'mahdi-living-profile',
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

async function gh(path, accept) {
  const h = accept ? { ...headers, Accept: accept } : { ...headers };
  let r = await fetch(`${API}${path}`, { headers: h });
  // GITHUB_TOKEN is refused (403) on cross-repo /stargazers. An anonymous
  // retry is worth one attempt but GitHub answers 401 from Actions runners,
  // so this only succeeds when a STARS_TOKEN is absent for another reason.
  const authStatus = r.status;
  let retried = false;
  if (r.status === 403 && h.Authorization) {
    const { Authorization, ...anon } = h;
    r = await fetch(`${API}${path}`, { headers: anon });
    retried = true;
  }
  if (!r.ok) {
    // 401 = credential rejected, 403 = credential accepted but not permitted.
    console.warn(`  ! ${path} — authed:${authStatus}${retried ? ` anon:${r.status}` : ''}`);
    return null;
  }
  if (retried) console.log(`  ↩ anonymous retry succeeded: ${path}`);
  return r.json();
}

const ago = iso => {
  const d = Math.floor((Date.now() - new Date(iso)) / 86400000);
  if (d <= 0) return 'today';
  if (d === 1) return 'yesterday';
  if (d < 30) return `${d}d ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
};

/**
 * A year of real contribution counts, via GraphQL. Returns null on any
 * failure so the caller can fall back to a designed empty card rather than
 * writing a broken one.
 */
async function contributions() {
  // Best source: exact per-day counts via GraphQL.
  if (TOKEN) {
    const query = `query($l:String!){user(login:$l){contributionsCollection{contributionCalendar{
      totalContributions weeks{contributionDays{date contributionCount}}}}}}`;
    try {
      const r = await fetch(`${API}/graphql`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': USER },
        body: JSON.stringify({ query, variables: { l: USER } }),
      });
      const j = r.ok ? await r.json() : null;
      const cal = j?.data?.user?.contributionsCollection?.contributionCalendar;
      if (cal?.weeks?.length) {
        console.log(`  contributions: ${cal.totalContributions} (graphql)`);
        return cal;
      }
      console.warn(`  ! contributions graphql — ${r.ok ? (j?.errors?.[0]?.message ?? 'empty') : 'HTTP ' + r.status}`);
    } catch (e) { console.warn('  ! contributions graphql —', e.message); }
  }

  // Fallback: the public contributions fragment. No token, no scopes. It gives
  // shade levels rather than counts, which is all the heatmap needs to draw.
  try {
    const r = await fetch(`https://github.com/users/${USER}/contributions`, {
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'text/html' },
    });
    if (!r.ok) { console.warn(`  ! contributions html — HTTP ${r.status}`); return null; }
    const html = await r.text();
    const days = [...html.matchAll(/data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="(\d)"/g)]
      .map(m => ({ date: m[1], level: +m[2], contributionCount: 0 }));
    if (!days.length) { console.warn('  ! contributions html — no day cells found'); return null; }
    const totalM = html.match(/([\d,]+)\s+contributions?\s+in the last year/i);
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) weeks.push({ contributionDays: days.slice(i, i + 7) });
    console.log(`  contributions: ${days.length} days (html fallback)`);
    return { totalContributions: totalM ? +totalM[1].replace(/,/g, '') : null, weeks, levelsOnly: true };
  } catch (e) { console.warn('  ! contributions html —', e.message); return null; }
}

/* ────────────────────────────── data ────────────────────────────── */
async function collect() {
  if (process.env.FIXTURE) {
    console.log('using fixture:', process.env.FIXTURE);
    return JSON.parse(await readFile(process.env.FIXTURE, 'utf8'));
  }
  const user = await gh(`/users/${USER}`);
  const all = (await gh(`/users/${USER}/repos?per_page=100&sort=updated`)) ?? [];
  const repos = all.filter(r => !r.fork && !r.private);

  const stars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const forks = repos.reduce((s, r) => s + r.forks_count, 0);

  // Real language distribution, by bytes, across every public repo.
  const langs = {};
  for (const r of repos) {
    const l = await gh(`/repos/${USER}/${r.name}/languages`);
    for (const [k, v] of Object.entries(l ?? {})) langs[k] = (langs[k] ?? 0) + v;
  }

  // Featured = the most-starred real projects. A new repo that earns stars
  // appears here on its own; nothing to hand-edit.
  const picks = repos
    .filter(r => !HIDE.has(r.name.toLowerCase()))
    .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at))
    .slice(0, MAX_FEATURED);
  const featured = [];
  for (const r of picks) {
    const m = META[r.name.toLowerCase()] ?? {};
    const rel = await gh(`/repos/${USER}/${r.name}/releases/latest`);
    featured.push({ name: m.name ?? r.name, icon: m.icon ?? '◆', fa: m.fa ?? null, r, release: rel?.tag_name ?? null });
  }

  // Recent public activity → "what I'm building right now".
  const events = (await gh(`/users/${USER}/events/public?per_page=100`)) ?? [];
  const seen = new Set();
  const activity = [];
  for (const e of events) {
    const name = e.repo?.name?.split('/')[1];
    if (!name) continue;
    let line = null;
    if (e.type === 'PushEvent') {
      const c = e.payload?.commits?.at(-1)?.message?.split('\n')[0];
      if (c) line = { kind: 'commit', icon: '📝', repo: name, text: c };
    } else if (e.type === 'ReleaseEvent') {
      line = { kind: 'release', icon: '🚀', repo: name, text: `Released ${e.payload?.release?.tag_name ?? ''}`.trim() };
    } else if (e.type === 'CreateEvent' && e.payload?.ref_type === 'repository') {
      line = { kind: 'new', icon: '✨', repo: name, text: 'Started a new project' };
    }
    if (!line) continue;
    const key = line.repo + '|' + line.text;
    if (seen.has(key)) continue;
    seen.add(key);
    activity.push({ ...line, at: e.created_at });
    if (activity.length >= 5) break;
  }

  // Star timestamps would be ideal, but the repo-scoped GITHUB_TOKEN is
  // refused (403) on cross-repo /stargazers. Try anyway — it backfills real
  // history when it works — and otherwise fall back to daily snapshots.
  const starEvents = [];
  for (const r of repos.filter(x => x.stargazers_count > 0)) {
    const pages = Math.min(3, Math.ceil(r.stargazers_count / 100));
    for (let p = 1; p <= pages; p++) {
      const rows = await gh(`/repos/${USER}/${r.name}/stargazers?per_page=100&page=${p}`,
        'application/vnd.github.star+json');
      if (!Array.isArray(rows)) { p = pages; continue; }
      for (const s of rows) if (s?.starred_at) starEvents.push(s.starred_at);
    }
  }
  starEvents.sort();

  // Open issues on the profile repo power the public Q&A ("Ask me anything").
  const issues = ((await gh(`/repos/${USER}/${USER}/issues?state=open&per_page=10`)) ?? [])
    .filter(i => !i.pull_request);

  const role = (user?.bio ?? '').split('\n')[0].trim().replace(/\s*[×·|]\s*/g, ' · ')
    || 'Problem Solver · Full-Stack Developer · Product Builder';

  // Daily snapshot history — always available, accumulates a real curve.
  const today = new Date().toISOString().slice(0, 10);
  let history = [];
  try { history = JSON.parse(await readFile(`${OUT}/history.json`, 'utf8')); } catch {}
  history = history.filter(h => h.d !== today);
  history.push({ d: today, stars, followers: user?.followers ?? 0, repos: repos.length });
  history.sort((a, b) => a.d.localeCompare(b.d));
  await mkdir(OUT, { recursive: true });
  await writeFile(`${OUT}/history.json`, JSON.stringify(history, null, 2));

  return { user, repos, stars, forks, langs, featured, activity, issues, role, starEvents, history };
}

/* ────────────────────────────── README sections ────────────────────────────── */
const badge = (l, msg, color, extra = '') =>
  `https://img.shields.io/badge/${encodeURIComponent(l)}-${encodeURIComponent(msg)}-${color}?style=flat-square&labelColor=0D1117${extra}`;

function projectsMd(d) {
  const one = f => {
    const r = f.r;
    const topics = (r.topics ?? []).slice(0, 4).map(t => `\`${t}\``).join(' ');
    const rel = f.release ? `🏷️ **${f.release}**` : '';
    const meta = [topics, rel].filter(Boolean).join(' &nbsp;·&nbsp; ');
    const desc = r.description
      ? esc(r.description).replace(/&apos;/g, "'").replace(/&quot;/g, '"')
      : '';
    // A Persian line only exists for repos I have written one for.
    const fa = f.fa ? `\n<br/><span dir="rtl">${f.fa}</span>` : '';
    return `### ${f.icon} [${f.name}](${r.html_url})

<a href="${r.html_url}/stargazers"><img src="https://img.shields.io/github/stars/${USER}/${r.name}?style=flat-square&logo=github&logoColor=white&labelColor=0D1117&color=0A84FF" alt="${r.name} stars" /></a>
&nbsp;<sub>**${r.language ?? 'Multi-language'}**</sub>

${desc}${fa}
${meta ? `\n${meta}\n` : ''}
**[→ Repo](${r.html_url})**${r.homepage ? ` &nbsp;·&nbsp; **[⬇ Try it](${r.homepage})**` : ''} &nbsp;·&nbsp; <sub>updated ${ago(r.pushed_at)}</sub>

---
`;
  };

  const head = d.featured.slice(0, 3).map(one).join('\n');
  const rest = d.featured.slice(3);
  if (!rest.length) return head;

  // The remaining projects live behind a disclosure so the README stays short
  // on a phone; the text is still in the page, so it is still crawled.
  return `${head}
<details>
<summary><b>📦 ${rest.length} more projects</b> &nbsp;·&nbsp; <sub>${rest.map(f => f.name).join(' · ')}</sub></summary>

<br/>

${rest.map(one).join('\n')}

</details>
`;
}

function activityMd(d) {
  if (!d.activity.length) return '<sub>No public activity in the last few days.</sub>';
  return d.activity.map(a =>
    `- ${a.icon} **[${a.repo}](https://github.com/${USER}/${a.repo})** — ${esc(a.text).slice(0, 90)} <sub>· ${ago(a.at)}</sub>`
  ).join('\n');
}

function amaMd(d) {
  const ask = `\n\n<a href="https://github.com/${USER}/${USER}/issues/new?title=Question%3A%20&body=Ask%20me%20anything%20%E2%80%94%20%D9%87%D8%B1%20%D8%B3%D9%88%D8%A7%D9%84%DB%8C%20%D8%AF%D8%A7%D8%B1%DB%8C%D8%AF%20%D8%A8%D9%BE%D8%B1%D8%B3%DB%8C%D8%AF"><img src="${badge('💬 Ask me anything', 'open a question', '0A84FF', '')}" height="28" alt="Ask me anything" /></a>`;
  if (!d.issues.length) {
    return `<sub>No open questions yet — be the first. &nbsp;·&nbsp; <span dir="rtl">هنوز سوالی پرسیده نشده؛ اولین نفر باشید.</span></sub>${ask}`;
  }
  return d.issues.slice(0, 5).map(i =>
    `- 💬 **[${esc(i.title).slice(0, 80)}](${i.html_url})** <sub>· by @${i.user.login} · ${i.comments} 💭</sub>`
  ).join('\n') + ask;
}

function replaceSection(md, key, body) {
  const re = new RegExp(`(<!-- LIVE:${key} -->)[\\s\\S]*?(<!-- /LIVE:${key} -->)`, 'g');
  if (!re.test(md)) { console.warn(`  ! marker LIVE:${key} not found`); return md; }
  return md.replace(re, `$1\n${body}\n$2`);
}

/* ────────────────────────────── main ────────────────────────────── */
const t = tehran();
console.log(`Tehran ${t.time} · mood=${t.mood.id}`);
const d = await collect();
console.log(`data: ${d.repos.length} repos · ${d.stars}★ · ${d.featured.length} featured · ${d.activity.length} activity · ${d.issues.length} issues`);

await mkdir(OUT, { recursive: true });
await writeFile(`${OUT}/hero.svg`, hero(d, t));
await writeFile(`${OUT}/stack.svg`, stack(d, t));
await writeFile(`${OUT}/growth.svg`, growth(d, t));
await writeFile(`${OUT}/headline.svg`, headline(t));
await writeFile(`${OUT}/footer.svg`, footer(t));
const cal = await contributions();
if (cal) await writeFile(`${OUT}/heat.svg`, heat(cal, t));
else {
  // A transient fetch failure must not wipe a heatmap that already works.
  try { await readFile(`${OUT}/heat.svg`, 'utf8'); console.warn('  ! keeping the existing heat.svg'); }
  catch { await writeFile(`${OUT}/heat.svg`, heat(null, t)); }
}

let md = await readFile('README.md', 'utf8');
md = replaceSection(md, 'PROJECTS', projectsMd(d));
md = replaceSection(md, 'ACTIVITY', activityMd(d));
md = replaceSection(md, 'AMA', amaMd(d));
md = replaceSection(md, 'UPDATED',
  `<sub>🔄 This profile rebuilds itself every 6 hours · last updated <b>${t.date}, ${t.time}</b> Tehran time</sub>`);
await writeFile('README.md', md);
console.log('✓ wrote hero, stack, growth, heat, headline, footer + README.md');
