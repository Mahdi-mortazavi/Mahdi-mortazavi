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

// STARS_TOKEN (optional) is a personal token with public-repo read. It is the
// only credential GitHub accepts for cross-repo /stargazers: the built-in
// GITHUB_TOKEN gets 403 there and an anonymous retry gets 401. Without it the
// growth curve still works — it just builds from daily snapshots instead of
// backfilled star timestamps.
const TOKEN = process.env.STARS_TOKEN || process.env.GITHUB_TOKEN;
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
  if (r.status === 403 && h.Authorization) {
    const { Authorization, ...anon } = h;
    r = await fetch(`${API}${path}`, { headers: anon });
    if (r.ok) console.log(`  ↩ anonymous retry succeeded: ${path}`);
  }
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

/* ────────────────────────────── SVG cards ────────────────────────────── */
function hero(d, t) {
  const m = t.mood, W = 1280, H = 340;
  // Orbit mark: a luminous core with bodies circling it. Round, alive, and a
  // literal picture of the process — ideas pulled into orbit around a centre.
  const CX = 1096, CY = 170;
  const orbitRing = (r, o) =>
    `<ellipse cx="${CX}" cy="${CY}" rx="${r}" ry="${(r * 0.62).toFixed(1)}" fill="none" stroke="#FFFFFF" stroke-opacity="${o}" stroke-width="1.6"/>`;
  // Bodies ride the exact ellipse of their ring, so nothing drifts off-orbit.
  const body = (rx, size, dur, delay, op) => {
    const ry = (rx * 0.62).toFixed(1);
    const path = `M${CX - rx},${CY} a${rx},${ry} 0 1,0 ${rx * 2},0 a${rx},${ry} 0 1,0 ${-rx * 2},0`;
    return `<g><circle r="${size}" fill="#FFFFFF" fill-opacity="${op}"/>
      <animateMotion dur="${dur}s" repeatCount="indefinite" begin="-${delay}s" path="${path}"/></g>`;
  };
  const orbit = `<g>
    ${orbitRing(96, .13)}${orbitRing(70, .2)}${orbitRing(44, .3)}
    <circle cx="${CX}" cy="${CY}" r="30" fill="url(#mark)" filter="url(#coreglow)"/>
    <circle cx="${CX}" cy="${CY}" r="26" fill="url(#mark)"/>
    <circle cx="${CX}" cy="${CY}" r="26" fill="none" stroke="#FFFFFF" stroke-opacity=".5"/>
    <circle cx="${CX}" cy="${CY}" r="26" fill="none" stroke="#FFFFFF" stroke-opacity=".35">
      <animate attributeName="r" values="26;40;26" dur="4s" repeatCount="indefinite"/>
      <animate attributeName="stroke-opacity" values=".35;0;.35" dur="4s" repeatCount="indefinite"/>
    </circle>
    ${body(96, 6.5, 18, 0, 1)}${body(70, 5, 12, 4.6, .85)}${body(44, 4, 8, 5.8, .7)}
  </g>`;
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

  ${orbit}
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


/**
 * Growth card — cumulative stars over time, drawn from real starred_at
 * timestamps. Animates its own line on load.
 */
function growth(d, t) {
  const m = t.mood, W = 1280, H = 250;
  const PL = 72, PR = 72, PT = 78, PB = 46;
  const cw = W - PL - PR, ch = H - PT - PB;
  const ev = d.starEvents ?? [];
  const hist = d.history ?? [];
  // Real timestamps when available; otherwise the snapshot history.
  const series = ev.length >= 2
    ? null
    : hist.map(h => ({ t: new Date(h.d).getTime(), v: h.stars }));

  if (ev.length < 2 && (series?.length ?? 0) < 2) {
    // Day one: no curve to draw yet. Lead with the real total instead of an
    // empty frame, and say plainly that the line starts filling from here.
    const bx = PL, bw = cw, by = 170;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img"
  aria-label="Mahdi Mortazavi has ${d.stars} GitHub stars; the growth curve starts tracking today">
  <title>${d.stars} stars across all repositories — growth tracking starts today</title>
  ${defs(m)}
  <rect width="${W}" height="${H}" rx="20" fill="url(#bg)"/>
  <g filter="url(#soft)" opacity=".65"><ellipse cx="1150" cy="30" rx="280" ry="170" fill="url(#aura1)"/></g>
  <rect width="${W}" height="${H}" rx="20" fill="url(#grid)"/>
  <text x="${PL}" y="40" font-family="${FONT}" font-size="16" font-weight="700" letter-spacing="3" fill="${m.a}">GROWTH · STARS OVER TIME</text>
  <text x="${PL}" y="112" font-family="${FONT}" font-size="58" font-weight="800" letter-spacing="-2" fill="${C.txt}">${d.stars}<tspan dx="16" font-size="20" font-weight="600" letter-spacing="0" fill="${C.muted}">total stars</tspan></text>
  <text x="${PL}" y="142" font-family="${FONT}" font-size="15" font-weight="500" fill="${C.dim}">across ${d.repos.length} public repositories · the curve starts filling in from today</text>
  <line x1="${bx}" y1="${by}" x2="${bx + bw}" y2="${by}" stroke="${m.a}" stroke-opacity=".35" stroke-width="2.5" stroke-dasharray="6 8" stroke-linecap="round"/>
  <circle cx="${bx + bw}" cy="${by}" r="6" fill="#FFFFFF"/>
  <circle cx="${bx + bw}" cy="${by}" r="6" fill="none" stroke="#FFFFFF" stroke-opacity=".7">
    <animate attributeName="r" values="6;17;6" dur="2.6s" repeatCount="indefinite"/>
    <animate attributeName="stroke-opacity" values=".7;0;.7" dur="2.6s" repeatCount="indefinite"/>
  </circle>
  <text x="${PL}" y="${by + 40}" font-family="${FONT}" font-size="13" fill="${C.dim}">today</text>
  <text x="${bx + bw}" y="${by + 40}" text-anchor="end" font-family="${FONT}" font-size="13" fill="${C.dim}">next snapshot in 6h</text>
</svg>`;
  }

  const now = Date.now();
  const first = series ? series[0].t : new Date(ev[0]).getTime();
  const span = Math.max(now - first, 86400000);
  const N = 72, pts = [];
  for (let i = 0; i <= N; i++) {
    const at = first + (span * i) / N;
    let c;
    if (series) {
      c = series[0].v;
      for (const p of series) if (p.t <= at) c = p.v;
    } else {
      c = 0;
      while (c < ev.length && new Date(ev[c]).getTime() <= at) c++;
    }
    pts.push({ x: PL + (cw * i) / N, y: c });
  }
  const max = Math.max(...pts.map(p => p.y), 1);
  const Y = v => PT + ch - (v / max) * ch;
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${Y(p.y).toFixed(1)}`).join('');
  const area = `${line}L${(PL + cw).toFixed(1)},${PT + ch}L${PL},${PT + ch}Z`;

  // Stars added in the trailing 30 days.
  const cut = now - 30 * 86400000;
  const last30 = ev.length
    ? ev.filter(e => new Date(e).getTime() >= cut).length
    : (() => { const w = (hist ?? []).filter(h => new Date(h.d).getTime() >= cut);
               return w.length > 1 ? d.stars - w[0].stars : 0; })();

  const fmt = ts => new Intl.DateTimeFormat('en-GB', { month: 'short', year: '2-digit' }).format(new Date(ts));
  const ticks = [0, .5, 1].map(f => {
    const x = PL + cw * f;
    return `<text x="${x.toFixed(1)}" y="${H - 16}" text-anchor="${f === 0 ? 'start' : f === 1 ? 'end' : 'middle'}"
      font-family="${FONT}" font-size="13" fill="${C.dim}">${fmt(first + span * f)}</text>`;
  }).join('');
  const grid = [0, .5, 1].map(f =>
    `<line x1="${PL}" y1="${Y(max * f).toFixed(1)}" x2="${PL + cw}" y2="${Y(max * f).toFixed(1)}"
      stroke="#FFFFFF" stroke-opacity=".07"/>`).join('');
  const end = pts[pts.length - 1];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img"
  aria-label="Star growth across Mahdi Mortazavi's open-source repositories">
  <title>Cumulative GitHub stars — ${max} total, ${last30} in the last 30 days</title>
  ${defs(m)}
  <linearGradient id="gfill" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${m.a}" stop-opacity=".55"/>
    <stop offset="100%" stop-color="${m.a}" stop-opacity="0"/>
  </linearGradient>
  <rect width="${W}" height="${H}" rx="20" fill="url(#bg)"/>
  <g filter="url(#soft)" opacity=".65"><ellipse cx="1150" cy="30" rx="280" ry="170" fill="url(#aura1)"/></g>
  <rect width="${W}" height="${H}" rx="20" fill="url(#grid)"/>
  <text x="${PL}" y="40" font-family="${FONT}" font-size="16" font-weight="700" letter-spacing="3" fill="${m.a}">GROWTH · STARS OVER TIME</text>
  <text x="${PL}" y="66" font-family="${FONT}" font-size="15" font-weight="500" fill="${C.dim}">${max} total ${last30 > 0 ? `<tspan fill="#30D158" font-weight="700">▲ +${last30}</tspan> in the last 30 days` : "tracking growth from here"}</text>
  ${grid}
  <path d="${area}" fill="url(#gfill)"/>
  <path d="${line}" fill="none" stroke="${m.a}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"
    stroke-dasharray="4000" stroke-dashoffset="4000">
    <animate attributeName="stroke-dashoffset" from="4000" to="0" dur="2.2s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
  </path>
  <circle cx="${end.x.toFixed(1)}" cy="${Y(end.y).toFixed(1)}" r="6" fill="#FFFFFF"/>
  <circle cx="${end.x.toFixed(1)}" cy="${Y(end.y).toFixed(1)}" r="6" fill="none" stroke="#FFFFFF" stroke-opacity=".7">
    <animate attributeName="r" values="6;17;6" dur="2.6s" repeatCount="indefinite"/>
    <animate attributeName="stroke-opacity" values=".7;0;.7" dur="2.6s" repeatCount="indefinite"/>
  </circle>
  ${ticks}
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
await writeFile(`${OUT}/growth.svg`, growth(d, t));

let md = await readFile('README.md', 'utf8');
md = replaceSection(md, 'PROJECTS', projectsMd(d));
md = replaceSection(md, 'ACTIVITY', activityMd(d));
md = replaceSection(md, 'AMA', amaMd(d));
md = replaceSection(md, 'UPDATED',
  `<sub>🔄 This profile rebuilds itself every 6 hours · last updated <b>${t.date}, ${t.time}</b> Tehran time</sub>`);
await writeFile('README.md', md);
console.log('✓ wrote hero.svg, stack.svg, growth.svg, README.md');
