#!/usr/bin/env node
/**
 * Living profile engine.
 * Pulls live data from the GitHub API, renders brand-consistent Liquid-Glass
 * SVG cards, and rewrites the marked sections of README.md.
 * Self-hosted on purpose: no third-party card service can break this profile.
 */
import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { C, FONT, defs, glass, esc, tehran } from './lib-theme.mjs';

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
};
// Repos that are infrastructure, not portfolio pieces.
const HIDE = new Set(['mahdi-mortazavi', 'mahdi-mortazavi.github.io']);
const MAX_FEATURED = 6;

const headers = {
  'Accept': 'application/vnd.github+json',
  'User-Agent': 'mahdi-living-profile',
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

async function gh(path) {
  const r = await fetch(`${API}${path}`, { headers });
  if (!r.ok) { console.warn(`  ! ${r.status} ${path}`); return null; }
  return r.json();
}

const nf = n => Intl.NumberFormat('en-US').format(n ?? 0);
const ago = iso => {
  const d = Math.floor((Date.now() - new Date(iso)) / 86400000);
  if (d <= 0) return 'today';
  if (d === 1) return 'yesterday';
  if (d < 30) return `${d}d ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
};

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

  // Open issues on the profile repo power the public Q&A ("Ask me anything").
  const issues = ((await gh(`/repos/${USER}/${USER}/issues?state=open&per_page=10`)) ?? [])
    .filter(i => !i.pull_request);

  const role = (user?.bio ?? '').split('\n')[0].trim().replace(/\s*[×·|]\s*/g, ' · ')
    || 'Problem Solver · Full-Stack Developer · Product Builder';

  return { user, repos, stars, forks, langs, featured, activity, issues, role };
}

/* ────────────────────────────── SVG cards ────────────────────────────── */
function hero(d, t) {
  const m = t.mood, W = 1280, H = 340;
  const rings = [88, 62, 38].map((r, i) =>
    `<circle cx="1096" cy="170" r="${r}" fill="none" stroke="#FFFFFF" stroke-opacity="${[.16,.3,.55][i]}" stroke-width="2.5"/>`).join('');
  const pill = (x, label, value) => `
    ${glass(x, 258, 176, 46, 15)}
    <text x="${x + 20}" y="287" font-family="${FONT}" font-size="16" font-weight="600" fill="${C.muted}">${esc(label)}</text>
    <text x="${x + 156}" y="287" text-anchor="end" font-family="${FONT}" font-size="17" font-weight="800" fill="${C.txt}">${esc(value)}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img"
  aria-label="Mahdi Mortazavi — live profile banner">
  <title>Mahdi Mortazavi · مهدی مرتضوی — Problem Solver, Flutter Developer &amp; Product Designer</title>
  ${defs(m)}
  <rect width="${W}" height="${H}" rx="20" fill="url(#bg)"/>
  <g filter="url(#soft)" opacity=".9">
    <ellipse cx="1090" cy="70" rx="300" ry="210" fill="url(#aura1)"/>
    <ellipse cx="150" cy="360" rx="320" ry="200" fill="url(#aura2)"/>
  </g>
  <rect width="${W}" height="${H}" rx="20" fill="url(#grid)"/>
  <rect x="0" y="0" width="${W}" height="3" fill="url(#hair)"/>

  <text x="72" y="66" font-family="${FONT}" font-size="17" font-weight="700" letter-spacing="1.5" fill="${m.a}">
    ${m.icon} ${esc(m.en)} — ${esc(m.fa)}  ·  Tehran ${esc(t.time)}
  </text>
  <text x="72" y="142" font-family="${FONT}" font-size="60" font-weight="800" letter-spacing="-1.6" fill="${C.txt}">Mahdi Mortazavi</text>
  <text x="72" y="182" font-family="${FONT}" font-size="27" font-weight="700" fill="${C.muted}">مهدی مرتضوی</text>
  <text x="72" y="220" font-family="${FONT}" font-size="19" font-weight="500" fill="${C.dim}">${esc(d.role)} <tspan fill="${m.a}">·</tspan> Iran</text>

  ${pill(72,  '★ Stars',    nf(d.stars))}
  ${pill(264, 'Followers',  nf(d.user?.followers))}
  ${pill(456, 'Repos',      nf(d.repos.length))}
  ${pill(648, 'Forks',      nf(d.forks))}

  <g>
    <rect x="1001" y="75" width="190" height="190" rx="52" fill="url(#mark)"/>
    <rect x="1001" y="75" width="190" height="190" rx="52" fill="none" stroke="#FFFFFF" stroke-opacity=".35"/>
    ${rings}
    <circle cx="1096" cy="170" r="11" fill="#FFFFFF"/>
  </g>
  <text x="${W - 72}" y="300" text-anchor="end" font-family="${FONT}" font-size="13" font-weight="500" fill="${C.dim}">
    auto-updated ${esc(t.date)} · ${esc(t.time)} Tehran
  </text>
</svg>`;
}

function stack(d, t) {
  const m = t.mood, W = 1280, H = 178;
  const top = Object.entries(d.langs).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const total = top.reduce((s, [, v]) => s + v, 0) || 1;
  const COLORS = ['#0A84FF', '#5E5CE6', '#30D158', '#FF9F0A', '#FF375F', '#30D1D0'];
  const BX = 72, BW = W - 144, BY = 74, BH = 26;

  let x = BX, bar = '', legend = '', lx = BX;
  top.forEach(([name, bytes], i) => {
    const w = Math.max(4, (bytes / total) * BW);
    const pct = ((bytes / total) * 100).toFixed(1);
    bar += `<rect x="${x.toFixed(1)}" y="${BY}" width="${w.toFixed(1)}" height="${BH}" fill="${COLORS[i]}"/>`;
    x += w;
    const label = `${name} ${pct}%`;
    legend += `<circle cx="${lx + 7}" cy="${BY + 68}" r="6" fill="${COLORS[i]}"/>
      <text x="${lx + 21}" y="${BY + 73}" font-family="${FONT}" font-size="15" font-weight="600" fill="${C.muted}">${esc(label)}</text>`;
    lx += 42 + label.length * 9.2;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img"
  aria-label="Language distribution across Mahdi Mortazavi's public repositories">
  <title>Real language distribution across all public repositories</title>
  ${defs(m)}
  <rect width="${W}" height="${H}" rx="20" fill="url(#bg)"/>
  <g filter="url(#soft)" opacity=".7"><ellipse cx="1120" cy="20" rx="260" ry="150" fill="url(#aura1)"/></g>
  <rect width="${W}" height="${H}" rx="20" fill="url(#grid)"/>
  <text x="72" y="48" font-family="${FONT}" font-size="16" font-weight="700" letter-spacing="3" fill="${m.a}">LANGUAGES ACROSS PUBLIC REPOS</text>
  <clipPath id="barclip"><rect x="${BX}" y="${BY}" width="${BW}" height="${BH}" rx="13"/></clipPath>
  <g clip-path="url(#barclip)">${bar}</g>
  <rect x="${BX}" y="${BY}" width="${BW}" height="${BH}" rx="13" fill="none" stroke="${C.stroke}"/>
  ${legend}
</svg>`;
}

/* ────────────────────────────── README sections ────────────────────────────── */
const badge = (l, msg, color, extra = '') =>
  `https://img.shields.io/badge/${encodeURIComponent(l)}-${encodeURIComponent(msg)}-${color}?style=flat-square&labelColor=0D1117${extra}`;

function projectsMd(d) {
  return d.featured.map(f => {
    const r = f.r;
    const topics = (r.topics ?? []).slice(0, 4).map(t => `\`${t}\``).join(' ');
    const rel = f.release ? ` &nbsp;·&nbsp; 🏷️ **${f.release}**` : '';
    return `### ${f.icon} [${f.name}](${r.html_url})

<a href="${r.html_url}/stargazers"><img src="https://img.shields.io/github/stars/${USER}/${r.name}?style=flat-square&logo=github&logoColor=white&labelColor=0D1117&color=0A84FF" alt="${r.name} stars" /></a>
<img src="${badge('Language', r.language ?? 'Multi', '0D1117')}" alt="language" />
<img src="https://img.shields.io/github/last-commit/${USER}/${r.name}?style=flat-square&labelColor=0D1117&color=8A93A3" alt="last commit" />

${r.description ? esc(r.description).replace(/&apos;/g, "'").replace(/&quot;/g, '"') : ''}
<br/><span dir="rtl">${f.fa}</span>

${topics}${rel}

**[→ Repo](${r.html_url})**${r.homepage ? ` &nbsp;·&nbsp; **[⬇ Download](${r.homepage})**` : ''} &nbsp;·&nbsp; <sub>updated ${ago(r.pushed_at)}</sub>

---
`;
  }).join('\n');
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

let md = await readFile('README.md', 'utf8');
md = replaceSection(md, 'PROJECTS', projectsMd(d));
md = replaceSection(md, 'ACTIVITY', activityMd(d));
md = replaceSection(md, 'AMA', amaMd(d));
md = replaceSection(md, 'UPDATED',
  `<sub>🔄 This profile rebuilds itself every 6 hours · last updated <b>${t.date}, ${t.time}</b> Tehran time</sub>`);
await writeFile('README.md', md);
console.log('✓ wrote hero.svg, stack.svg, README.md');
