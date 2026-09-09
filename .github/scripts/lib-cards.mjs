// Generated profile cards. Split out of generate.mjs so the rendering can be
// exercised with fixtures without hitting the GitHub API.
import { C, esc, FONT, defs, glass, nf } from './lib-theme.mjs';

/* ────────────────────────────── SVG cards ──────────────────────────────
   Mobile first. GitHub renders a README in a ~355px column on a phone and
   ~830px on a desktop, and these cards are always width:100%. A 1280-wide
   card therefore shrinks to 0.28x on a phone, which turned every 13-16px
   label into 4px of unreadable mush. Everything below is drawn on a 700-wide
   canvas with a minimum type size of 21, so the smallest label still lands
   near 11px on a phone and stays comfortable on a desktop.
   ───────────────────────────────────────────────────────────────────────── */
// A single canvas has to survive two very different frames: GitHub renders a
// README in a ~355px column on a phone and ~830px on a desktop, and the cards
// are always width:100%. A 700-wide canvas made the type readable on a phone
// but blew the cards up to 1.2x on a desktop, where the hero alone ran over
// 560px tall. 900 splits the difference: 0.39x on a phone, 0.92x on a desktop.
// The floor is the smallest size that still reads at 0.39x — 30 lands near 12px.
const W = 900;          // canvas width for every card
const PAD = 52;         // side padding
const IW = W - PAD * 2; // inner width
const T = { micro: 27, small: 30, label: 31, body: 32, kicker: 31, name: 68, huge: 86 };

// Rough advance width, good enough to keep text inside the canvas.
const textW = (s, size, ls = 0) => String(s).length * size * 0.58 + String(s).length * ls;

// Greedy word wrap to a pixel width; returns at most `maxLines` lines.
function wrap(text, size, max, maxLines = 2) {
  const words = String(text ?? '').split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (textW(next, size) > max && cur) { lines.push(cur); cur = w; } else cur = next;
    if (lines.length === maxLines) break;
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  return lines.length ? lines : [''];
}

const card = (h, m, aura = true) => `
  <rect width="${W}" height="${h}" rx="22" fill="url(#bg)"/>
  ${aura ? `<g filter="url(#soft)" opacity=".85">
    <ellipse cx="${W - 60}" cy="40" rx="200" ry="150" fill="url(#aura1)"/>
    <ellipse cx="60" cy="${h + 20}" rx="220" ry="150" fill="url(#aura2)"/>
  </g>` : ''}
  <rect width="${W}" height="${h}" rx="22" fill="url(#grid)"/>
  <rect x="0" y="0" width="${W}" height="3" fill="url(#hair)"/>`;

export function hero(d, t) {
  const m = t.mood;
  const CX = 790, CY = 144;
  const orbitRing = (r, o) =>
    `<ellipse cx="${CX}" cy="${CY}" rx="${r}" ry="${(r * 0.62).toFixed(1)}" fill="none" stroke="#FFFFFF" stroke-opacity="${o}" stroke-width="1.6"/>`;
  const body = (rx, size, dur, delay, op) => {
    const ry = (rx * 0.62).toFixed(1);
    const path = `M${CX - rx},${CY} a${rx},${ry} 0 1,0 ${rx * 2},0 a${rx},${ry} 0 1,0 ${-rx * 2},0`;
    return `<g><circle r="${size}" fill="#FFFFFF" fill-opacity="${op}"/>
      <animateMotion dur="${dur}s" repeatCount="indefinite" begin="-${delay}s" path="${path}"/></g>`;
  };
  const orbit = `<g>
    ${orbitRing(62, .13)}${orbitRing(45, .2)}${orbitRing(28, .3)}
    <circle cx="${CX}" cy="${CY}" r="23" fill="url(#mark)" filter="url(#coreglow)"/>
    <circle cx="${CX}" cy="${CY}" r="19" fill="url(#mark)"/>
    <circle cx="${CX}" cy="${CY}" r="19" fill="none" stroke="#FFFFFF" stroke-opacity=".5"/>
    <circle cx="${CX}" cy="${CY}" r="19" fill="none" stroke="#FFFFFF" stroke-opacity=".35">
      <animate attributeName="r" values="19;33;19" dur="4s" repeatCount="indefinite"/>
      <animate attributeName="stroke-opacity" values=".35;0;.35" dur="4s" repeatCount="indefinite"/>
    </circle>
    ${body(62, 5.9, 18, 0, 1)}${body(45, 5.0, 12, 4.6, .85)}${body(28, 4.1, 8, 5.8, .7)}
  </g>`;

  // Vertical cursor, so a long bio never collides with what follows.
  let y = 70;
  const greet = `${m.icon} ${m.en} · Tehran ${t.time}`;
  let s = `<text x="${PAD}" y="${y}" font-family="${FONT}" font-size="${T.small}" font-weight="700" letter-spacing=".6" fill="${m.a}">${esc(greet)}</text>`;
  y += 92;
  s += `<text x="${PAD}" y="${y}" font-family="${FONT}" font-size="${T.name}" font-weight="800" letter-spacing="-1.6" fill="${C.txt}">Mahdi Mortazavi</text>`;
  y += 56;
  s += `<text x="${PAD}" y="${y}" font-family="${FONT}" font-size="39" font-weight="700" fill="${C.muted}">مهدی مرتضوی</text>`;
  y += 48;
  for (const ln of wrap(`${d.role} · Iran`, T.small, IW, 2)) {
    s += `<text x="${PAD}" y="${y}" font-family="${FONT}" font-size="${T.small}" font-weight="500" fill="${C.dim}">${esc(ln)}</text>`;
    y += 39;
  }

  // Stats as a 2x2 grid — four pills in one row cannot hold a readable label
  // at phone scale.
  const PW = 380, PH = 85, GAP = 36;
  const pill = (col, row, label, value) => {
    const x = PAD + col * (PW + GAP), py = y + 10 + row * (PH + 20);
    return `${glass(x, py, PW, PH, 22)}
      <text x="${x + 26}" y="${py + 54}" font-family="${FONT}" font-size="${T.label}" font-weight="600" fill="${C.muted}">${esc(label)}</text>
      <text x="${x + PW - 26}" y="${py + 54}" text-anchor="end" font-family="${FONT}" font-size="36" font-weight="800" fill="${C.txt}">${esc(value)}</text>`;
  };
  s += pill(0, 0, '★ Stars', nf(d.stars));
  s += pill(1, 0, 'Followers', nf(d.user?.followers));
  s += pill(0, 1, 'Repos', nf(d.repos.length));
  s += pill(1, 1, 'Forks', nf(d.forks));
  y += 10 + PH * 2 + 20;

  const H = y + 66;
  s += `<text x="${W - PAD}" y="${y + 38}" text-anchor="end" font-family="${FONT}" font-size="${T.micro}" font-weight="500" fill="${C.dim}">auto-updated ${esc(t.date)} · Tehran</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img"
  aria-label="Mahdi Mortazavi — live profile banner">
  <title>Mahdi Mortazavi · مهدی مرتضوی — Full-Stack Developer, Product Builder and Problem Solver</title>
  ${defs(m)}${card(H, m)}${orbit}${s}
</svg>`;
}

export function stack(d, t) {
  const m = t.mood;
  const top = Object.entries(d.langs).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const total = top.reduce((s, [, v]) => s + v, 0) || 1;
  const COLORS = ['#0A84FF', '#5E5CE6', '#30D158', '#FF9F0A', '#FF375F', '#30D1D0'];
  const BY = 100, BH = 41;

  let x = PAD, bar = '';
  top.forEach(([, bytes], i) => {
    const w = Math.max(5, (bytes / total) * IW);
    bar += `<rect x="${x.toFixed(1)}" y="${BY}" width="${w.toFixed(1)}" height="${BH}" fill="${COLORS[i]}"/>`;
    x += w;
  });

  // Legend on a fixed 3-column grid: free-flowing labels overlap once the
  // card is scaled down to a phone.
  const COLW = IW / 2;
  const legend = top.map(([name, bytes], i) => {
    const col = i % 2, row = (i / 2) | 0;
    const lx = PAD + col * COLW, ly = BY + 100 + row * 54;
    const pct = ((bytes / total) * 100).toFixed(1);
    return `<circle cx="${lx + 9}" cy="${ly - 9}" r="8.5" fill="${COLORS[i]}"/>
      <text x="${lx + 28}" y="${ly}" font-family="${FONT}" font-size="${T.small}" font-weight="600" fill="${C.muted}">${esc(name)} ${pct}%</text>`;
  }).join('');

  // Frameworks the languages alone do not reveal, drawn as chips inside the
  // same card rather than as a row of third-party badges beneath it.
  const TOOLS = ['.NET', 'Flutter', 'Tauri', 'React', 'Cloudflare Workers', 'Astro', 'Riverpod', 'Figma'];
  const chipY = BY + 100 + Math.ceil(top.length / 2) * 54 + 18;
  let cx = PAD, cy = chipY, chips = '';
  for (const name of TOOLS) {
    const w = Math.round(textW(name, T.micro) + 40);
    if (cx + w > PAD + IW) { cx = PAD; cy += 52; }
    chips += `<rect x="${cx}" y="${cy}" width="${w}" height="40" rx="14" fill="url(#glass)" stroke="${C.stroke}"/>
      <text x="${cx + w / 2}" y="${cy + 27}" text-anchor="middle" font-family="${FONT}" font-size="${T.micro}" font-weight="600" fill="${C.muted}">${esc(name)}</text>`;
    cx += w + 12;
  }
  const H = cy + 40 + 26;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img"
  aria-label="Language distribution across Mahdi Mortazavi's public repositories">
  <title>Real language distribution across all public repositories</title>
  ${defs(m)}${card(H, m)}
  <text x="${PAD}" y="62" font-family="${FONT}" font-size="${T.kicker}" font-weight="700" letter-spacing="2.5" fill="${m.a}">LANGUAGES · جعبه‌ابزار</text>
  <clipPath id="barclip"><rect x="${PAD}" y="${BY}" width="${IW}" height="${BH}" rx="20"/></clipPath>
  <g clip-path="url(#barclip)">${bar}</g>
  <rect x="${PAD}" y="${BY}" width="${IW}" height="${BH}" rx="20" fill="none" stroke="${C.stroke}"/>
  ${legend}${chips}
</svg>`;
}

/**
 * Contribution heatmap — a full year of real contribution counts, drawn from
 * the GraphQL contributionCalendar. Self-hosted, so no third-party card
 * service can take it down (the one this replaces started returning 402).
 */
export function heat(cal, t) {
  const m = t.mood;
  const LV = ['#161B22', '#0E4429', '#006D32', '#26A641', '#39D353'];
  const GY = 162, CELL = 12.1, GAP = 2.8, STEP = CELL + GAP;
  const H = 324;

  if (!cal) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img"
  aria-label="Contribution heatmap for Mahdi Mortazavi — waiting for the first sync">
  <title>Contribution heatmap — syncing</title>
  ${defs(m)}${card(H, m)}
  <text x="${PAD}" y="62" font-family="${FONT}" font-size="${T.kicker}" font-weight="700" letter-spacing="2.5" fill="${m.a}">CONTRIBUTIONS · فعالیت</text>
  <text x="${PAD}" y="84" font-family="${FONT}" font-size="${T.small}" fill="${C.dim}">The heatmap fills in on the next scheduled sync.</text>
  ${Array.from({ length: 53 * 7 }, (_, i) => {
    const c = (i / 7) | 0, r = i % 7;
    return `<rect x="${(PAD + c * STEP).toFixed(1)}" y="${(GY + r * STEP).toFixed(1)}" width="${CELL}" height="${CELL}" rx="2.8" fill="${LV[0]}"/>`;
  }).join('')}
</svg>`;
  }

  // Position every cell from its own date. The GraphQL payload is already
  // grouped by week, but the HTML fallback lists days weekday-major, and
  // trusting the array order transposes the whole grid.
  const days = (cal.weeks ?? []).flatMap(w => w.contributionDays)
    .filter(d => d?.date).sort((a, b) => a.date.localeCompare(b.date));
  const at = d => Date.parse(`${d}T00:00:00Z`);
  const counts = days.map(d => d.contributionCount ?? 0);
  const peak = Math.max(...counts, 1);
  // GraphQL gives counts, the HTML fallback gives GitHub's own shade levels.
  const level = d => cal.levelsOnly
    ? (d.level ?? 0)
    : (d.contributionCount ?? 0) === 0 ? 0
      : d.contributionCount >= peak * 0.6 ? 4
      : d.contributionCount >= peak * 0.3 ? 3
      : d.contributionCount >= peak * 0.12 ? 2 : 1;

  // Anchor on the Sunday of the first week so columns line up with GitHub's.
  const firstRow = new Date(at(days[0].date));
  const anchor = at(days[0].date) - firstRow.getUTCDay() * 86400000;
  const colOf = d => Math.floor((at(d.date) - anchor) / (7 * 86400000));
  const rowOf = d => new Date(at(d.date)).getUTCDay();
  const nCols = colOf(days[days.length - 1]) + 1;
  const STEP2 = IW / nCols, CELL2 = Math.max(5, STEP2 - 2.8);

  let cells = '', months = '', lastMonth = -1;
  for (const day of days) {
    const c = colOf(day), r = rowOf(day), lv = level(day);
    cells += `<rect x="${(PAD + c * STEP2).toFixed(1)}" y="${(GY + r * STEP2).toFixed(1)}" width="${CELL2.toFixed(1)}" height="${CELL2.toFixed(1)}" rx="2.8" fill="${LV[lv]}">`
      + (lv >= 3 ? `<animate attributeName="opacity" values="1;.72;1" dur="3.4s" begin="-${((c * 7 + r) % 34) / 10}s" repeatCount="indefinite"/>` : '')
      + `<title>${day.date}${cal.levelsOnly ? '' : `: ${day.contributionCount}`}</title></rect>`;
    // One label per month, on the column where that month first appears.
    const mo = new Date(at(day.date)).getUTCMonth();
    if (r === 0 && mo !== lastMonth && c < nCols - 2) {
      lastMonth = mo;
      months += `<text x="${(PAD + c * STEP2).toFixed(1)}" y="${GY - 16}" font-family="${FONT}" font-size="24" font-weight="600" fill="${C.dim}">${
        ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][mo]}</text>`;
    }
  }

  // Streaks, computed from the same calendar — no second service needed.
  // "Today" is the last day the calendar carries, so a timezone gap at the
  // edge of the year cannot silently zero a live streak.
  const active = d => (cal.levelsOnly ? (d.level ?? 0) : (d.contributionCount ?? 0)) > 0;
  let best = 0, run = 0;
  for (const d of days) { run = active(d) ? run + 1 : 0; if (run > best) best = run; }
  let current = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (active(days[i])) current++;
    else if (i === days.length - 1) continue;   // today may simply not have started
    else break;
  }
  const bestDay = cal.levelsOnly ? 0 : Math.max(...counts, 0);

  const LGY = GY + 7 * STEP2 + 32;
  const legend = LV.map((c, i) =>
    `<rect x="${PAD + 60 + i * 21}" y="${LGY - 13}" width="14" height="14" rx="3" fill="${c}"/>`).join('');
  const total = cal.totalContributions ?? counts.reduce((a, b) => a + b, 0);
  const totalLine = total ? `${nf(total)}<tspan dx="9" font-size="${T.small}" font-weight="500" fill="${C.dim}">in the last year</tspan>` : `<tspan font-size="${T.small}" font-weight="500" fill="${C.dim}">the last year of contributions</tspan>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img"
  aria-label="${total ? `Mahdi Mortazavi made ${total} contributions in the last year` : `A year of GitHub contributions by Mahdi Mortazavi`}">
  <title>${total ? `${total} contributions in the last year` : `A year of contributions`}</title>
  ${defs(m)}${card(H, m)}
  <text x="${PAD}" y="48" font-family="${FONT}" font-size="${T.kicker}" font-weight="700" letter-spacing="2" fill="${m.a}">CONTRIBUTIONS · فعالیت</text>
  <text x="${PAD}" y="108" font-family="${FONT}" font-size="${T.body}" font-weight="700" fill="${C.txt}">${totalLine}</text>
  <text x="${W - PAD}" y="108" text-anchor="end" font-family="${FONT}" font-size="${T.small}" font-weight="700" fill="${m.a}">${current > 0 ? `🔥 ${current}-day streak` : `longest streak ${best}d`}</text>
  ${months}${cells}
  <text x="${PAD}" y="${LGY}" font-family="${FONT}" font-size="${T.micro}" fill="${C.dim}">less</text>
  ${legend}
  <text x="${PAD + 172}" y="${LGY}" font-family="${FONT}" font-size="${T.micro}" fill="${C.dim}">more</text>
  <text x="${W - PAD}" y="${LGY}" text-anchor="end" font-family="${FONT}" font-size="${T.micro}" fill="${C.dim}">${
    bestDay ? `longest ${best}d · best day ${bestDay}` : `longest streak ${best}d`}</text>
</svg>`;
}

/**
 * Growth card — cumulative stars over time, drawn from real starred_at
 * timestamps. Animates its own line on load.
 */
export function growth(d, t) {
  const m = t.mood;
  const H = 398, PT = 226, PB = 70;
  const ch = H - PT - PB;
  const ev = d.starEvents ?? [];
  const hist = d.history ?? [];
  const series = ev.length >= 2 ? null : hist.map(h => ({ t: new Date(h.d).getTime(), v: h.stars }));

  const head = (sub, raw) => `
  <text x="${PAD}" y="62" font-family="${FONT}" font-size="${T.kicker}" font-weight="700" letter-spacing="2.5" fill="${m.a}">GROWTH · رشد</text>
  <text x="${PAD}" y="162" font-family="${FONT}" font-size="${T.huge}" font-weight="800" letter-spacing="-2" fill="${C.txt}">${d.stars}<tspan dx="18" font-size="${T.body}" font-weight="600" letter-spacing="0" fill="${C.muted}">total stars</tspan></text>
  ${(raw ? wrap(raw, T.micro, IW, 2) : [sub]).map((ln, i) =>
    `<text x="${PAD}" y="${203 + i * 35}" font-family="${FONT}" font-size="${T.micro}" font-weight="500" fill="${C.dim}">${ln}</text>`).join('')}`;

  if (ev.length < 2 && (series?.length ?? 0) < 2) {
    const by = 296;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img"
  aria-label="Mahdi Mortazavi has ${d.stars} GitHub stars; the growth curve starts tracking today">
  <title>${d.stars} stars across all repositories — growth tracking starts today</title>
  ${defs(m)}${card(H, m)}
  ${head(null, `across ${d.repos.length} public repositories · the curve fills in from today`)}
  <line x1="${PAD}" y1="${by}" x2="${PAD + IW}" y2="${by}" stroke="${m.a}" stroke-opacity=".35" stroke-width="3.2" stroke-dasharray="8 10" stroke-linecap="round"/>
  <circle cx="${PAD + IW}" cy="${by}" r="8" fill="#FFFFFF"/>
  <circle cx="${PAD + IW}" cy="${by}" r="8" fill="none" stroke="#FFFFFF" stroke-opacity=".7">
    <animate attributeName="r" values="8;22;8" dur="2.6s" repeatCount="indefinite"/>
    <animate attributeName="stroke-opacity" values=".7;0;.7" dur="2.6s" repeatCount="indefinite"/>
  </circle>
  <text x="${PAD}" y="${by + 51}" font-family="${FONT}" font-size="${T.micro}" fill="${C.dim}">today</text>
  <text x="${PAD + IW}" y="${by + 51}" text-anchor="end" font-family="${FONT}" font-size="${T.micro}" fill="${C.dim}">next snapshot in 6h</text>
</svg>`;
  }

  const now = Date.now();
  const first = series ? series[0].t : new Date(ev[0]).getTime();
  const span = Math.max(now - first, 86400000);
  const N = 72, pts = [];
  for (let i = 0; i <= N; i++) {
    const at = first + (span * i) / N;
    let c;
    if (series) { c = series[0].v; for (const p of series) if (p.t <= at) c = p.v; }
    else { c = 0; while (c < ev.length && new Date(ev[c]).getTime() <= at) c++; }
    pts.push({ x: PAD + (IW * i) / N, y: c });
  }
  const max = Math.max(...pts.map(p => p.y), 1);
  const min = Math.min(...pts.map(p => p.y));
  // A zero baseline flattens a 294->301 series into a straight line. Track the
  // data range instead, and label the baseline so the axis is not misleading.
  const lo = max === min ? Math.max(0, min - 1) : min - (max - min) * 0.25;
  const Y = v => PT + ch - ((v - lo) / (max - lo || 1)) * ch;
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${Y(p.y).toFixed(1)}`).join('');
  const area = `${line}L${(PAD + IW).toFixed(1)},${PT + ch}L${PAD},${PT + ch}Z`;

  const cut = now - 30 * 86400000;
  const last30 = ev.length
    ? ev.filter(e => new Date(e).getTime() >= cut).length
    : (() => { const w = (hist ?? []).filter(h => new Date(h.d).getTime() >= cut);
               return w.length > 1 ? d.stars - w[0].stars : 0; })();

  // Short spans need day precision; long ones read better as month + year.
  const fmt = span < 75 * 86400000
    ? ts => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(ts))
    : ts => new Intl.DateTimeFormat('en-GB', { month: 'short', year: '2-digit' }).format(new Date(ts));
  const ticks = [0, .5, 1].map(f => {
    const x = PAD + IW * f;
    return `<text x="${x.toFixed(1)}" y="${H - 17}" text-anchor="${f === 0 ? 'start' : f === 1 ? 'end' : 'middle'}"
      font-family="${FONT}" font-size="${T.micro}" fill="${C.dim}">${fmt(first + span * f)}</text>`;
  }).join('');
  const grid = [0, .5, 1].map(f =>
    `<line x1="${PAD}" y1="${Y(lo + (max - lo) * f).toFixed(1)}" x2="${PAD + IW}" y2="${Y(lo + (max - lo) * f).toFixed(1)}" stroke="#FFFFFF" stroke-opacity=".07"/>`).join('');
  // Baseline value, so a non-zero axis is stated rather than implied.
  const axis = `<text x="${PAD}" y="${(PT + ch + 25).toFixed(1)}" font-family="${FONT}" font-size="${T.micro}" fill="${C.dim}">from ${Math.round(lo)}</text>`;
  const end = pts[pts.length - 1];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img"
  aria-label="Star growth across Mahdi Mortazavi's open-source repositories">
  <title>Cumulative GitHub stars — ${max} total, ${last30} in the last 30 days</title>
  ${defs(m)}
  <linearGradient id="gfill" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${m.a}" stop-opacity=".55"/>
    <stop offset="100%" stop-color="${m.a}" stop-opacity="0"/>
  </linearGradient>
  ${card(H, m)}
  ${head(last30 > 0 ? `<tspan fill="#30D158" font-weight="700">▲ +${last30}</tspan> in the last 30 days` : 'tracking growth from here')}
  ${grid}
  <path d="${area}" fill="url(#gfill)"/>
  <path d="${line}" fill="none" stroke="${m.a}" stroke-width="3.8" stroke-linejoin="round" stroke-linecap="round"
    stroke-dasharray="4000" stroke-dashoffset="4000">
    <animate attributeName="stroke-dashoffset" from="4000" to="0" dur="2.2s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
  </path>
  <circle cx="${end.x.toFixed(1)}" cy="${Y(end.y).toFixed(1)}" r="8" fill="#FFFFFF"/>
  <circle cx="${end.x.toFixed(1)}" cy="${Y(end.y).toFixed(1)}" r="8" fill="none" stroke="#FFFFFF" stroke-opacity=".7">
    <animate attributeName="r" values="6;17;6" dur="2.6s" repeatCount="indefinite"/>
    <animate attributeName="stroke-opacity" values=".7;0;.7" dur="2.6s" repeatCount="indefinite"/>
  </circle>
  ${ticks}${axis}
</svg>`;
}

/**
 * Animated headline strip. Replaces readme-typing-svg.demolab.com so the
 * wordmark line is on-brand (same glass, same Tehran-time accent) and cannot
 * be taken down by a third party.
 */
export function headline(t) {
  const m = t.mood, H = 118;
  const LINES = [
    'Full-Stack Developer × Product Builder',
    '🧩  First principles thinking',
    '💡  Designing solutions',
    '🚀  Building real products',
    'Open-source builder from Iran',
  ];
  const N = LINES.length, total = (N * 2.6).toFixed(1), fade = 0.022;
  // One full-cycle timeline per line. SMIL requires keyTimes to span 0..1, so
  // each line carries the whole cycle and is simply transparent outside its
  // own window — a sub-range timeline renders nothing at all.
  const items = LINES.map((line, i) => {
    const a = i / N, b = (i + 1) / N;
    const kt = [0, a, Math.min(a + fade, b), Math.max(b - fade, a), b, 1]
      .map(v => v.toFixed(4)).join(';');
    return `<text x="${W / 2}" y="${H / 2 + 12}" text-anchor="middle" font-family="${FONT}"
      font-size="34" font-weight="700" fill="${C.txt}" opacity="0">${esc(line)}
      <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="${kt}"
        dur="${total}s" repeatCount="indefinite"/>
    </text>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img"
  aria-label="${esc(LINES.join(' · '))}">
  <title>${esc(LINES.join(' · '))}</title>
  ${defs(m)}
  <rect width="${W}" height="${H}" rx="22" fill="url(#bg)"/>
  <g filter="url(#soft)" opacity=".7"><ellipse cx="${W / 2}" cy="${H / 2}" rx="300" ry="80" fill="url(#aura1)"/></g>
  <rect width="${W}" height="${H}" rx="22" fill="url(#grid)"/>
  <rect x="0" y="0" width="${W}" height="3" fill="url(#hair)"/>
  ${items}
</svg>`;
}

/**
 * Footer wave. Replaces capsule-render.vercel.app, which has started
 * answering 403 intermittently.
 */
export function footer(t) {
  const m = t.mood, H = 128;
  // Three layers, each a full period wider than the canvas and drifting
  // sideways, so the crests never sit still or line up.
  const layer = (y, op, dur, amp, shift) => {
    const w = W * 1.5;
    const d = `M${-W / 2},${y} ` +
      `C ${-W / 4},${y - amp} ${0},${y + amp} ${W / 4},${y} ` +
      `C ${W / 2},${y - amp} ${(W * 3) / 4},${y + amp} ${W},${y} ` +
      `C ${(W * 5) / 4},${y - amp} ${(W * 3) / 2},${y + amp} ${w},${y} ` +
      `L${w},${H} L${-W / 2},${H} Z`;
    return `<path fill="url(#wave)" fill-opacity="${op}" d="${d}">
      <animateTransform attributeName="transform" type="translate"
        values="${shift} 0;${shift - W / 2} 0" dur="${dur}s" repeatCount="indefinite"/>
    </path>`;
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img"
  aria-label="Decorative footer">
  <title>Mahdi Mortazavi · مهدی مرتضوی</title>
  ${defs(m)}
  <linearGradient id="wave" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="${m.a}"/><stop offset="100%" stop-color="${m.b}"/>
  </linearGradient>
  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  ${layer(54, .16, 19, 32, 0)}${layer(74, .26, 13, 24, 150)}${layer(93, .46, 9, 16, 300)}
  <rect x="0" y="0" width="${W}" height="2.5" fill="url(#hair)"/>
</svg>`;
}
