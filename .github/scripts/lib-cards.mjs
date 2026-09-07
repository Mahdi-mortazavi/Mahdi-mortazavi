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
const W = 700;          // canvas width for every card
const PAD = 40;         // side padding
const IW = W - PAD * 2; // inner width
const T = { micro: 21, small: 23, label: 24, body: 25, kicker: 24, name: 58, huge: 74 };

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
  const CX = 615, CY = 112;
  const orbitRing = (r, o) =>
    `<ellipse cx="${CX}" cy="${CY}" rx="${r}" ry="${(r * 0.62).toFixed(1)}" fill="none" stroke="#FFFFFF" stroke-opacity="${o}" stroke-width="1.6"/>`;
  const body = (rx, size, dur, delay, op) => {
    const ry = (rx * 0.62).toFixed(1);
    const path = `M${CX - rx},${CY} a${rx},${ry} 0 1,0 ${rx * 2},0 a${rx},${ry} 0 1,0 ${-rx * 2},0`;
    return `<g><circle r="${size}" fill="#FFFFFF" fill-opacity="${op}"/>
      <animateMotion dur="${dur}s" repeatCount="indefinite" begin="-${delay}s" path="${path}"/></g>`;
  };
  const orbit = `<g>
    ${orbitRing(48, .13)}${orbitRing(35, .2)}${orbitRing(22, .3)}
    <circle cx="${CX}" cy="${CY}" r="18" fill="url(#mark)" filter="url(#coreglow)"/>
    <circle cx="${CX}" cy="${CY}" r="15" fill="url(#mark)"/>
    <circle cx="${CX}" cy="${CY}" r="15" fill="none" stroke="#FFFFFF" stroke-opacity=".5"/>
    <circle cx="${CX}" cy="${CY}" r="15" fill="none" stroke="#FFFFFF" stroke-opacity=".35">
      <animate attributeName="r" values="15;26;15" dur="4s" repeatCount="indefinite"/>
      <animate attributeName="stroke-opacity" values=".35;0;.35" dur="4s" repeatCount="indefinite"/>
    </circle>
    ${body(48, 4.6, 18, 0, 1)}${body(35, 3.9, 12, 4.6, .85)}${body(22, 3.2, 8, 5.8, .7)}
  </g>`;

  // Vertical cursor, so a long bio never collides with what follows.
  let y = 54;
  const greet = `${m.icon} ${m.en} · Tehran ${t.time}`;
  let s = `<text x="${PAD}" y="${y}" font-family="${FONT}" font-size="${T.small}" font-weight="700" letter-spacing=".6" fill="${m.a}">${esc(greet)}</text>`;
  y += 72;
  s += `<text x="${PAD}" y="${y}" font-family="${FONT}" font-size="52" font-weight="800" letter-spacing="-1.2" fill="${C.txt}">Mahdi Mortazavi</text>`;
  y += 44;
  s += `<text x="${PAD}" y="${y}" font-family="${FONT}" font-size="30" font-weight="700" fill="${C.muted}">مهدی مرتضوی</text>`;
  y += 38;
  for (const ln of wrap(`${d.role} · Iran`, T.small, IW, 2)) {
    s += `<text x="${PAD}" y="${y}" font-family="${FONT}" font-size="${T.small}" font-weight="500" fill="${C.dim}">${esc(ln)}</text>`;
    y += 30;
  }

  // Stats as a 2x2 grid — four pills in one row cannot hold a readable label
  // at phone scale.
  const PW = 296, PH = 66, GAP = 28;
  const pill = (col, row, label, value) => {
    const x = PAD + col * (PW + GAP), py = y + 8 + row * (PH + 16);
    return `${glass(x, py, PW, PH, 18)}
      <text x="${x + 20}" y="${py + 42}" font-family="${FONT}" font-size="${T.label}" font-weight="600" fill="${C.muted}">${esc(label)}</text>
      <text x="${x + PW - 20}" y="${py + 42}" text-anchor="end" font-family="${FONT}" font-size="28" font-weight="800" fill="${C.txt}">${esc(value)}</text>`;
  };
  s += pill(0, 0, '★ Stars', nf(d.stars));
  s += pill(1, 0, 'Followers', nf(d.user?.followers));
  s += pill(0, 1, 'Repos', nf(d.repos.length));
  s += pill(1, 1, 'Forks', nf(d.forks));
  y += 8 + PH * 2 + 16;

  const H = y + 52;
  s += `<text x="${W - PAD}" y="${y + 30}" text-anchor="end" font-family="${FONT}" font-size="${T.micro}" font-weight="500" fill="${C.dim}">auto-updated ${esc(t.date)} · Tehran</text>`;

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
  const BY = 78, BH = 32;

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
    const lx = PAD + col * COLW, ly = BY + 78 + row * 42;
    const pct = ((bytes / total) * 100).toFixed(1);
    return `<circle cx="${lx + 7}" cy="${ly - 7}" r="6.5" fill="${COLORS[i]}"/>
      <text x="${lx + 22}" y="${ly}" font-family="${FONT}" font-size="${T.small}" font-weight="600" fill="${C.muted}">${esc(name)} ${pct}%</text>`;
  }).join('');

  const H = BY + 78 + Math.ceil(top.length / 2) * 42 + 18;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img"
  aria-label="Language distribution across Mahdi Mortazavi's public repositories">
  <title>Real language distribution across all public repositories</title>
  ${defs(m)}${card(H, m)}
  <text x="${PAD}" y="48" font-family="${FONT}" font-size="${T.kicker}" font-weight="700" letter-spacing="2" fill="${m.a}">LANGUAGES · جعبه‌ابزار</text>
  <clipPath id="barclip"><rect x="${PAD}" y="${BY}" width="${IW}" height="${BH}" rx="16"/></clipPath>
  <g clip-path="url(#barclip)">${bar}</g>
  <rect x="${PAD}" y="${BY}" width="${IW}" height="${BH}" rx="16" fill="none" stroke="${C.stroke}"/>
  ${legend}
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
  const GY = 126, CELL = 9.4, GAP = 2.2, STEP = CELL + GAP;
  const H = 252;

  if (!cal) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img"
  aria-label="Contribution heatmap for Mahdi Mortazavi — waiting for the first sync">
  <title>Contribution heatmap — syncing</title>
  ${defs(m)}${card(H, m)}
  <text x="${PAD}" y="48" font-family="${FONT}" font-size="${T.kicker}" font-weight="700" letter-spacing="2" fill="${m.a}">CONTRIBUTIONS · فعالیت</text>
  <text x="${PAD}" y="84" font-family="${FONT}" font-size="${T.small}" fill="${C.dim}">The heatmap fills in on the next scheduled sync.</text>
  ${Array.from({ length: 53 * 7 }, (_, i) => {
    const c = (i / 7) | 0, r = i % 7;
    return `<rect x="${(PAD + c * STEP).toFixed(1)}" y="${(GY + r * STEP).toFixed(1)}" width="${CELL}" height="${CELL}" rx="2.2" fill="${LV[0]}"/>`;
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
  const STEP2 = IW / nCols, CELL2 = Math.max(4, STEP2 - 2.2);

  let cells = '', months = '', lastMonth = -1;
  for (const day of days) {
    const c = colOf(day), r = rowOf(day), lv = level(day);
    cells += `<rect x="${(PAD + c * STEP2).toFixed(1)}" y="${(GY + r * STEP2).toFixed(1)}" width="${CELL2.toFixed(1)}" height="${CELL2.toFixed(1)}" rx="2.2" fill="${LV[lv]}">`
      + (lv >= 3 ? `<animate attributeName="opacity" values="1;.72;1" dur="3.4s" begin="-${((c * 7 + r) % 34) / 10}s" repeatCount="indefinite"/>` : '')
      + `<title>${day.date}${cal.levelsOnly ? '' : `: ${day.contributionCount}`}</title></rect>`;
    // One label per month, on the column where that month first appears.
    const mo = new Date(at(day.date)).getUTCMonth();
    if (r === 0 && mo !== lastMonth && c < nCols - 2) {
      lastMonth = mo;
      months += `<text x="${(PAD + c * STEP2).toFixed(1)}" y="${GY - 12}" font-family="${FONT}" font-size="18" font-weight="600" fill="${C.dim}">${
        ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][mo]}</text>`;
    }
  }

  const LGY = GY + 7 * STEP2 + 24;
  const legend = LV.map((c, i) =>
    `<rect x="${PAD + 46 + i * 16}" y="${LGY - 10}" width="11" height="11" rx="2.4" fill="${c}"/>`).join('');
  const total = cal.totalContributions ?? counts.reduce((a, b) => a + b, 0);
  const totalLine = total ? `${nf(total)}<tspan dx="9" font-size="${T.small}" font-weight="500" fill="${C.dim}">in the last year</tspan>` : `<tspan font-size="${T.small}" font-weight="500" fill="${C.dim}">the last year of contributions</tspan>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img"
  aria-label="${total ? `Mahdi Mortazavi made ${total} contributions in the last year` : `A year of GitHub contributions by Mahdi Mortazavi`}">
  <title>${total ? `${total} contributions in the last year` : `A year of contributions`}</title>
  ${defs(m)}${card(H, m)}
  <text x="${PAD}" y="48" font-family="${FONT}" font-size="${T.kicker}" font-weight="700" letter-spacing="2" fill="${m.a}">CONTRIBUTIONS · فعالیت</text>
  <text x="${PAD}" y="84" font-family="${FONT}" font-size="${T.body}" font-weight="700" fill="${C.txt}">${totalLine}</text>
  ${months}${cells}
  <text x="${PAD}" y="${LGY}" font-family="${FONT}" font-size="${T.micro}" fill="${C.dim}">less</text>
  ${legend}
  <text x="${PAD + 134}" y="${LGY}" font-family="${FONT}" font-size="${T.micro}" fill="${C.dim}">more</text>
</svg>`;
}

/**
 * Growth card — cumulative stars over time, drawn from real starred_at
 * timestamps. Animates its own line on load.
 */
export function growth(d, t) {
  const m = t.mood;
  const H = 310, PT = 176, PB = 54;
  const ch = H - PT - PB;
  const ev = d.starEvents ?? [];
  const hist = d.history ?? [];
  const series = ev.length >= 2 ? null : hist.map(h => ({ t: new Date(h.d).getTime(), v: h.stars }));

  const head = (sub, raw) => `
  <text x="${PAD}" y="48" font-family="${FONT}" font-size="${T.kicker}" font-weight="700" letter-spacing="2" fill="${m.a}">GROWTH · رشد</text>
  <text x="${PAD}" y="126" font-family="${FONT}" font-size="${T.huge}" font-weight="800" letter-spacing="-2" fill="${C.txt}">${d.stars}<tspan dx="14" font-size="${T.body}" font-weight="600" letter-spacing="0" fill="${C.muted}">total stars</tspan></text>
  ${(raw ? wrap(raw, T.micro, IW, 2) : [sub]).map((ln, i) =>
    `<text x="${PAD}" y="${158 + i * 27}" font-family="${FONT}" font-size="${T.micro}" font-weight="500" fill="${C.dim}">${ln}</text>`).join('')}`;

  if (ev.length < 2 && (series?.length ?? 0) < 2) {
    const by = 230;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img"
  aria-label="Mahdi Mortazavi has ${d.stars} GitHub stars; the growth curve starts tracking today">
  <title>${d.stars} stars across all repositories — growth tracking starts today</title>
  ${defs(m)}${card(H, m)}
  ${head(null, `across ${d.repos.length} public repositories · the curve fills in from today`)}
  <line x1="${PAD}" y1="${by}" x2="${PAD + IW}" y2="${by}" stroke="${m.a}" stroke-opacity=".35" stroke-width="2.5" stroke-dasharray="6 8" stroke-linecap="round"/>
  <circle cx="${PAD + IW}" cy="${by}" r="6" fill="#FFFFFF"/>
  <circle cx="${PAD + IW}" cy="${by}" r="6" fill="none" stroke="#FFFFFF" stroke-opacity=".7">
    <animate attributeName="r" values="6;17;6" dur="2.6s" repeatCount="indefinite"/>
    <animate attributeName="stroke-opacity" values=".7;0;.7" dur="2.6s" repeatCount="indefinite"/>
  </circle>
  <text x="${PAD}" y="${by + 40}" font-family="${FONT}" font-size="${T.micro}" fill="${C.dim}">today</text>
  <text x="${PAD + IW}" y="${by + 40}" text-anchor="end" font-family="${FONT}" font-size="${T.micro}" fill="${C.dim}">next snapshot in 6h</text>
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
  const Y = v => PT + ch - (v / max) * ch;
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${Y(p.y).toFixed(1)}`).join('');
  const area = `${line}L${(PAD + IW).toFixed(1)},${PT + ch}L${PAD},${PT + ch}Z`;

  const cut = now - 30 * 86400000;
  const last30 = ev.length
    ? ev.filter(e => new Date(e).getTime() >= cut).length
    : (() => { const w = (hist ?? []).filter(h => new Date(h.d).getTime() >= cut);
               return w.length > 1 ? d.stars - w[0].stars : 0; })();

  const fmt = ts => new Intl.DateTimeFormat('en-GB', { month: 'short', year: '2-digit' }).format(new Date(ts));
  const ticks = [0, .5, 1].map(f => {
    const x = PAD + IW * f;
    return `<text x="${x.toFixed(1)}" y="${H - 18}" text-anchor="${f === 0 ? 'start' : f === 1 ? 'end' : 'middle'}"
      font-family="${FONT}" font-size="${T.micro}" fill="${C.dim}">${fmt(first + span * f)}</text>`;
  }).join('');
  const grid = [0, .5, 1].map(f =>
    `<line x1="${PAD}" y1="${Y(max * f).toFixed(1)}" x2="${PAD + IW}" y2="${Y(max * f).toFixed(1)}" stroke="#FFFFFF" stroke-opacity=".07"/>`).join('');
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
