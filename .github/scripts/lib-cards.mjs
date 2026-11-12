// Generated profile cards. Split out of generate.mjs so the rendering can be
// exercised with fixtures without hitting the GitHub API.
import { C, esc, FONT, MONO, defs, glass, nf } from './lib-theme.mjs';
import { art, signal, GLYPH } from './lib-art.mjs';

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
// Two canvases, because one cannot serve both frames. GitHub renders a README
// in a ~355px column on a phone and ~830px on a desktop.
//   'm'  900 wide — 0.39x on a phone. Portrait-ish, stats stacked 2x2.
//   'w' 1600 wide — 0.52x on a desktop. A banner: short, wide, one row of
//       stats, legends in three columns. A phone would render its 26px floor
//       at 9px, which is why it is desktop-only and served behind a media
//       query with the 900 card as the fallback.
const GEO = {
  m: { W: 900,  PAD: 52, T: { micro: 27, small: 30, label: 31, body: 32, kicker: 31, name: 68,  huge: 86  } },
  w: { W: 1600, PAD: 64, T: { micro: 26, small: 30, label: 32, body: 34, kicker: 30, name: 104, huge: 104 } },
};
const geo = (mode = 'm') => {
  const g = GEO[mode] ?? GEO.m;
  return { ...g, IW: g.W - g.PAD * 2, wide: mode === 'w' };
};
// Module-level defaults keep the helpers below readable; every card shadows
// them with its own geometry.
const { W, PAD, IW, T } = geo('m');

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

// Takes its width from the caller: reading the module-level default here drew
// a 900-wide background on the 1600 canvas, leaving a hard edge at 56%.
// The aura radii scale too, or the blur's filter region clips into a seam.
const card = (h, m, cw = W, aura = true) => `
  <rect width="${cw}" height="${h}" rx="22" fill="url(#bg)"/>
  ${aura ? `<g filter="url(#soft)" opacity=".85">
    <ellipse cx="${cw - 60}" cy="40" rx="${(cw * 0.24).toFixed(0)}" ry="${Math.max(150, h * 0.5).toFixed(0)}" fill="url(#aura1)"/>
    <ellipse cx="60" cy="${h + 20}" rx="${(cw * 0.26).toFixed(0)}" ry="${Math.max(150, h * 0.5).toFixed(0)}" fill="url(#aura2)"/>
  </g>` : ''}
  <rect width="${cw}" height="${h}" rx="22" fill="url(#grid)"/>
  <rect x="0" y="0" width="${cw}" height="3" fill="url(#hair)"/>`;

const compact = n => n >= 10000 ? `${(n / 1000).toFixed(0)}k` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : nf(n);

// A status pill with a breathing green light.
function statusPill(x, y, label, size, open = true) {
  const w = Math.round(textW(label, size) * 0.93 + 74), h = Math.round(size * 2.05);
  const col = open ? C.green : C.dim;
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${col}" fill-opacity=".12" stroke="${col}" stroke-opacity=".45" stroke-width="1.4"/>
    <circle cx="${x + 30}" cy="${y + h / 2}" r="7" fill="${col}"/>
    ${open ? `<circle cx="${x + 30}" cy="${y + h / 2}" r="7" fill="none" stroke="${col}">
      <animate attributeName="r" values="7;17;7" dur="2.4s" repeatCount="indefinite"/>
      <animate attributeName="stroke-opacity" values=".8;0;.8" dur="2.4s" repeatCount="indefinite"/>
    </circle>` : ''}
    <text x="${x + 52}" y="${y + h / 2 + size * 0.35}" font-family="${FONT}" font-size="${size}" font-weight="650" fill="${open ? '#D7FBE0' : C.muted}">${esc(label)}</text>
  </g>`;
}

// One line at a time, cross-fading. SMIL keyTimes must span 0..1, so every
// line carries the whole cycle and is transparent outside its own window.
function rotator(lines, x, y, size, color) {
  const N = lines.length, total = (N * 2.8).toFixed(1), fade = 0.03;
  return lines.map((line, i) => {
    const a = i / N, b = (i + 1) / N;
    const kt = [0, a, Math.min(a + fade, b), Math.max(b - fade, a), b, 1].map(v => v.toFixed(4)).join(';');
    return `<text x="${x}" y="${y}" font-family="${MONO}" font-size="${size}" font-weight="600" fill="${color}" opacity="0"><tspan fill="${C.dim}">&gt; </tspan>${esc(line)}
      <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="${kt}" dur="${total}s" repeatCount="indefinite"/></text>`;
  }).join('');
}

export function hero(d, t, mode = 'm') {
  const { W, PAD, IW, T, wide } = geo(mode);
  const m = t.mood, P = d.cfg;

  // Signature mark, top right.
  const mark = wide
    ? `<g transform="translate(1086 96)">${signal(true)}</g>`
    : `<g transform="translate(596 30) scale(.56)">${signal(false)}</g>`;

  let s = statusPill(PAD, wide ? 52 : 46, wide ? P.status.long : P.status.short, wide ? 27 : 28, P.status.open);
  if (wide) s += `<text x="${W - PAD}" y="90" text-anchor="end" font-family="${MONO}" font-size="${wide ? 22 : 23}" font-weight="600" letter-spacing="2.2" fill="${C.dim}">${esc(P.zone)}</text>`;

  let y = wide ? 232 : 252;
  s += `<text x="${PAD - 4}" y="${y}" font-family="${FONT}" font-size="${T.name}" font-weight="800" letter-spacing="${wide ? -3.2 : -2}" fill="${C.txt}">${esc(P.name)}</text>`;
  y += wide ? 66 : 58;
  s += `<text x="${PAD}" y="${y}" font-family="${FONT}" font-size="${wide ? 44 : 38}" font-weight="700" fill="${C.muted}">${esc(P.nameFa)}</text>`;
  y += wide ? 62 : 58;
  for (const ln of wrap(P.tagline, wide ? 36 : 33, wide ? 1010 : IW, 2)) {
    s += `<text x="${PAD}" y="${y}" font-family="${FONT}" font-size="${wide ? 36 : 33}" font-weight="600" fill="${C.txt}" fill-opacity=".92">${esc(ln)}</text>`;
    y += wide ? 46 : 43;
  }
  y += wide ? 12 : 10;
  s += rotator(P.focus, PAD, y, wide ? 27 : 26, m.b);

  // Proof, not adjectives: six live numbers.
  const total = d.cal?.totalContributions;
  const tiles = [
    ['Stars', nf(d.stars)],
    d.downloads ? ['Downloads', `${compact(d.downloads)}+`] : ['Public repos', nf(d.repos.length)],
    d.releases ? ['Releases shipped', nf(d.releases)] : ['Projects', nf(P.projects.length)],
    total ? ['Contributions / yr', nf(total)] : ['Public repos', nf(d.repos.length)],
    ['Followers', nf(d.user?.followers)],
    ['Forks', nf(d.forks)],
  ];
  y += wide ? 40 : 38;
  const COLS = wide ? 6 : 2, GAP = wide ? 16 : 20;
  const PW = (IW - GAP * (COLS - 1)) / COLS, PH = wide ? 112 : 96;
  tiles.forEach(([label, value], i) => {
    const col = i % COLS, row = (i / COLS) | 0;
    const x = PAD + col * (PW + GAP), py = y + row * (PH + GAP);
    s += wide
      ? `${glass(x, py, PW, PH, 22)}
        <text x="${x + 24}" y="${py + 54}" font-family="${FONT}" font-size="44" font-weight="800" letter-spacing="-1" fill="${C.txt}">${esc(value)}</text>
        <text x="${x + 24}" y="${py + 90}" font-family="${FONT}" font-size="22" font-weight="600" fill="${C.muted}">${esc(label)}</text>`
      : `${glass(x, py, PW, PH, 22)}
        <text x="${x + 26}" y="${py + PH / 2 + 11}" font-family="${FONT}" font-size="${T.micro}" font-weight="600" fill="${C.muted}">${esc(label)}</text>
        <text x="${x + PW - 26}" y="${py + PH / 2 + 13}" text-anchor="end" font-family="${FONT}" font-size="38" font-weight="800" fill="${C.txt}">${esc(value)}</text>`;
  });
  const rows = Math.ceil(tiles.length / COLS);
  y += rows * PH + (rows - 1) * GAP;

  const H = y + (wide ? 62 : 64);
  s += `<text x="${PAD}" y="${H - 24}" font-family="${MONO}" font-size="${wide ? 20 : 22}" font-weight="500" fill="${C.dim}">live from the GitHub API · rebuilt ${esc(t.date)}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img"
  aria-label="${esc(P.name)} — ${esc(P.tagline)}">
  <title>${esc(P.name)} · ${esc(P.nameFa)} — ${esc(P.tagline)}</title>
  ${defs(m)}${card(H, m, W)}${mark}${s}
</svg>`;
}

/**
 * Project card. A short banner on desktop (art · copy · numbers), a portrait
 * card on a phone (art and numbers on top, copy underneath).
 */
export function project(p, r, release, t, mode = 'm') {
  const { W, PAD, IW, T, wide } = geo(mode);
  const m = t.mood;
  const stars = r?.stargazers_count ?? 0, lang = r?.language ?? '';
  // A star count is proof only once it is one. Young projects lead with their
  // version and language instead of a lonely zero.
  const facts = [release, lang].filter(Boolean);
  const stat = (x, y, anchor) => stars >= 5 ? `
    <text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${FONT}" font-size="${wide ? 58 : 60}" font-weight="800" letter-spacing="-1.5" fill="${C.txt}"><tspan fill="${m.b}" font-size="${wide ? 40 : 42}">★ </tspan>${nf(stars)}</text>
    ${facts.map((f, i) => `<text x="${x}" y="${y + 50 + i * 42}" text-anchor="${anchor}" font-family="${i === 0 && release ? MONO : FONT}" font-size="26" font-weight="600" fill="${i ? C.dim : C.muted}">${esc(f)}</text>`).join('')}` : `
    <text x="${x}" y="${y + 6}" text-anchor="${anchor}" font-family="${FONT}" font-size="40" font-weight="800" letter-spacing="-.6" fill="${C.txt}">${esc(lang || 'Open source')}</text>
    <text x="${x}" y="${y + 52}" text-anchor="${anchor}" font-family="${MONO}" font-size="24" font-weight="700" letter-spacing="2" fill="${m.b}">${esc(release ?? 'NEW')}</text>`;
  const arrow = (x, y) => `<g transform="translate(${x} ${y})" stroke="${C.muted}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M0 22 L22 0 M4 0 H22 V18"/></g>`;

  let body, H;
  if (wide) {
    const lines = wrap(p.tagline, 30, 800, 3);
    H = 320;
    const x0 = PAD + 330 + 46, base = lines.length === 3 ? 0 : 20;
    body = `${glass(PAD, 44, 330, 232, 28)}
      <g transform="translate(${PAD + 15} 60)">${art(p.art)}</g>
      <text x="${x0}" y="${92 + base}" font-family="${MONO}" font-size="23" font-weight="700" letter-spacing="2.6" fill="${m.b}">${esc(p.kicker)}</text>
      <text x="${x0 - 3}" y="${162 + base}" font-family="${FONT}" font-size="66" font-weight="800" letter-spacing="-2" fill="${C.txt}">${esc(p.name)}</text>
      ${lines.map((ln, i) => `<text x="${x0}" y="${212 + base + i * 40}" font-family="${FONT}" font-size="30" font-weight="500" fill="${C.muted}">${esc(ln)}</text>`).join('')}
      ${arrow(W - PAD - 24, 52)}
      ${stat(W - PAD, 168, 'end')}`;
  } else {
    const lines = wrap(p.tagline, 32, IW, 4);
    body = `${glass(PAD, 44, IW, 240, 30)}
      <g transform="translate(${PAD + 34} 64)">${art(p.art)}</g>
      ${arrow(W - PAD - 54, 70)}
      ${stat(W - PAD - 34, 168, 'end')}
      <text x="${PAD}" y="344" font-family="${MONO}" font-size="24" font-weight="700" letter-spacing="2.4" fill="${m.b}">${esc(p.kicker)}</text>
      <text x="${PAD - 3}" y="414" font-family="${FONT}" font-size="64" font-weight="800" letter-spacing="-2" fill="${C.txt}">${esc(p.name)}</text>
      ${lines.map((ln, i) => `<text x="${PAD}" y="${468 + i * 44}" font-family="${FONT}" font-size="32" font-weight="500" fill="${C.muted}">${esc(ln)}</text>`).join('')}`;
    H = 468 + (lines.length - 1) * 44 + 48;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img"
  aria-label="${esc(p.name)} — ${esc(p.tagline)}">
  <title>${esc(p.name)} — ${esc(p.tagline)}</title>
  ${defs(m)}${card(H, m, W, false)}
  <g filter="url(#soft)" opacity=".55"><ellipse cx="${PAD + 160}" cy="160" rx="230" ry="150" fill="url(#aura1)"/></g>
  ${body}
</svg>`;
}

/** Career timeline. The line draws itself; the current node keeps pulsing. */
export function journey(d, t, mode = 'm') {
  const { W, PAD, IW, T, wide } = geo(mode);
  const m = t.mood;
  // {stars:repo} is that repository's own live star count.
  const fill = s => String(s).replace(/\{stars:([\w.-]+)\}/g, (_, name) =>
    nf(d.featured.find(f => f.r.name.toLowerCase() === name.toLowerCase())?.r.stargazers_count ?? 0));
  const J = d.cfg.journey, N = J.length;
  const node = (x, y, last) => `<circle cx="${x}" cy="${y}" r="10" fill="${last ? C.green : C.bg}" stroke="${last ? C.green : m.b}" stroke-width="3.2"/>
    ${last ? `<circle cx="${x}" cy="${y}" r="10" fill="none" stroke="${C.green}">
      <animate attributeName="r" values="10;26;10" dur="2.4s" repeatCount="indefinite"/>
      <animate attributeName="stroke-opacity" values=".8;0;.8" dur="2.4s" repeatCount="indefinite"/></circle>` : ''}`;
  let s = `<text x="${PAD}" y="66" font-family="${MONO}" font-size="${wide ? 23 : 25}" font-weight="700" letter-spacing="2.6" fill="${m.b}">JOURNEY</text>`;
  let H;
  if (wide) {
    const LY = 150, CW = IW / N;
    s += `<path d="M${PAD + 10} ${LY} H${W - PAD}" stroke="${m.b}" stroke-opacity=".55" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="${IW}" stroke-dashoffset="${IW}">
      <animate attributeName="stroke-dashoffset" values="${IW};0" keyTimes="0;1" dur="2.4s" fill="freeze" calcMode="spline" keySplines=".3 0 .2 1"/></path>`;
    J.forEach((e, i) => {
      const x = PAD + 10 + i * CW;
      s += node(x, LY, i === N - 1);
      s += `<text x="${x - 10}" y="${LY - 30}" font-family="${MONO}" font-size="26" font-weight="700" fill="${i === N - 1 ? C.green : C.muted}">${esc(e.when)}</text>
        <text x="${x - 10}" y="${LY + 62}" font-family="${FONT}" font-size="36" font-weight="800" letter-spacing="-.6" fill="${C.txt}">${esc(e.title)}</text>
        <text x="${x - 10}" y="${LY + 102}" font-family="${FONT}" font-size="26" font-weight="650" fill="${m.b}">${esc(fill(e.role))}</text>
        ${wrap(e.text, 24, CW - 30, 4).map((ln, k) => `<text x="${x - 10}" y="${LY + 142 + k * 33}" font-family="${FONT}" font-size="24" font-weight="500" fill="${C.dim}">${esc(ln)}</text>`).join('')}`;
    });
    H = LY + 142 + 3 * 33 + 40;
  } else {
    const LX = PAD + 12, Y0 = 130, STEP = 208;
    const LEN = (N - 1) * STEP;
    s += `<path d="M${LX} ${Y0} V${Y0 + LEN}" stroke="${m.b}" stroke-opacity=".55" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="${LEN}" stroke-dashoffset="${LEN}">
      <animate attributeName="stroke-dashoffset" values="${LEN};0" keyTimes="0;1" dur="2.4s" fill="freeze" calcMode="spline" keySplines=".3 0 .2 1"/></path>`;
    J.forEach((e, i) => {
      const y = Y0 + i * STEP, x = LX + 44;
      s += node(LX, y, i === N - 1);
      s += `<text x="${x}" y="${y + 9}" font-family="${MONO}" font-size="27" font-weight="700" fill="${i === N - 1 ? C.green : C.muted}">${esc(e.when)}</text>
        <text x="${x}" y="${y + 58}" font-family="${FONT}" font-size="40" font-weight="800" letter-spacing="-.6" fill="${C.txt}">${esc(e.title)}<tspan dx="16" font-size="28" font-weight="650" letter-spacing="0" fill="${m.b}">${esc(fill(e.role))}</tspan></text>
        ${wrap(e.text, 28, IW - 60, 2).map((ln, k) => `<text x="${x}" y="${y + 100 + k * 38}" font-family="${FONT}" font-size="28" font-weight="500" fill="${C.dim}">${esc(ln)}</text>`).join('')}`;
    });
    H = Y0 + LEN + 100 + 38 + 44;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img"
  aria-label="Career timeline of ${esc(d.cfg.name)}">
  <title>${esc(J.map(e => `${e.when}: ${e.title} — ${fill(e.role)}`).join(' · '))}</title>
  ${defs(m)}${card(H, m, W)}${s}
</svg>`;
}

/** Contact button. Drawn at 2x and shown at height 44 in the README. */
export function button(label, glyph, t, primary = false) {
  const m = t.mood, H = 92, size = 31;
  const W = Math.round(textW(label, size) * 0.95 + 118);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">
  <title>${esc(label)}</title>
  <defs>
    <linearGradient id="mark" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${m.a}"/><stop offset="100%" stop-color="${m.b}"/></linearGradient>
    <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFFFF" stop-opacity=".22"/><stop offset="60%" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>
  </defs>
  <rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="${(H - 4) / 2}" fill="${primary ? 'url(#mark)' : '#141922'}"/>
  <rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="${(H - 4) / 2}" fill="url(#sheen)"/>
  <rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="${(H - 4) / 2}" fill="none" stroke="#FFFFFF" stroke-opacity="${primary ? '.4' : '.22'}" stroke-width="1.6"/>
  <g transform="translate(36 30)">${GLYPH[glyph] ?? ''}</g>
  <text x="84" y="${H / 2 + 11}" font-family="${FONT}" font-size="${size}" font-weight="700" fill="#FFFFFF">${esc(label)}</text>
</svg>`;
}

export function stack(d, t, mode = 'm') {
  const { W, PAD, IW, T, wide } = geo(mode);
  const m = t.mood;
  const top = Object.entries(d.langs).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const total = top.reduce((s, [, v]) => s + v, 0) || 1;
  const COLORS = ['#0A84FF', '#5E5CE6', '#30D158', '#FF9F0A', '#FF375F', '#30D1D0'];
  const BY = wide ? 108 : 100, BH = wide ? 46 : 41;

  let x = PAD, bar = '';
  top.forEach(([, bytes], i) => {
    const w = Math.max(5, (bytes / total) * IW);
    bar += `<rect x="${x.toFixed(1)}" y="${BY}" width="${w.toFixed(1)}" height="${BH}" fill="${COLORS[i]}"/>`;
    x += w;
  });

  // Legend on a fixed 3-column grid: free-flowing labels overlap once the
  // card is scaled down to a phone.
  const LCOLS = wide ? 3 : 2;
  const COLW = IW / LCOLS;
  const legend = top.map(([name, bytes], i) => {
    const col = i % LCOLS, row = (i / LCOLS) | 0;
    const lx = PAD + col * COLW, ly = BY + (wide ? 96 : 100) + row * 54;
    const pct = ((bytes / total) * 100).toFixed(1);
    return `<circle cx="${lx + 9}" cy="${ly - 9}" r="8.5" fill="${COLORS[i]}"/>
      <text x="${lx + 28}" y="${ly}" font-family="${FONT}" font-size="${T.small}" font-weight="600" fill="${C.muted}">${esc(name)} ${pct}%</text>`;
  }).join('');

  // Frameworks the languages alone do not reveal, drawn as chips inside the
  // same card rather than as a row of third-party badges beneath it.
  const TOOLS = ['.NET', 'Flutter', 'Tauri', 'React', 'Cloudflare Workers', 'Astro', 'Riverpod', 'Figma'];
  const chipY = BY + (wide ? 96 : 100) + Math.ceil(top.length / LCOLS) * 54 + (wide ? 8 : 18);
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
  ${defs(m)}${card(H, m, W)}
  <text x="${PAD}" y="62" font-family="${MONO}" font-size="${T.kicker - 6}" font-weight="700" letter-spacing="2.6" fill="${m.b}">STACK</text>
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
export function heat(cal, t, mode = 'm') {
  const { W, PAD, IW, T, wide } = geo(mode);
  const m = t.mood;
  const LV = ['#161B22', '#0E4429', '#006D32', '#26A641', '#39D353'];
  const GY = wide ? 168 : 162, CELL = 12.1, GAP = 2.8, STEP = CELL + GAP;
  // The grid stretches to the canvas, so the card's height follows it.
  const H = Math.round(GY + 7 * (IW / 53) + 66);

  if (!cal) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img"
  aria-label="Contribution heatmap for Mahdi Mortazavi — waiting for the first sync">
  <title>Contribution heatmap — syncing</title>
  ${defs(m)}${card(H, m, W)}
  <text x="${PAD}" y="62" font-family="${MONO}" font-size="${T.kicker - 6}" font-weight="700" letter-spacing="2.6" fill="${m.b}">CONTRIBUTIONS</text>
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
  ${defs(m)}${card(H, m, W)}
  <text x="${PAD}" y="48" font-family="${MONO}" font-size="${T.kicker - 6}" font-weight="700" letter-spacing="2.6" fill="${m.b}">CONTRIBUTIONS</text>
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
export function growth(d, t, mode = 'm') {
  const { W, PAD, IW, T, wide } = geo(mode);
  const m = t.mood;
  const H = wide ? 372 : 398, PT = wide ? 212 : 226, PB = 70;
  const ch = H - PT - PB;
  const ev = d.starEvents ?? [];
  const hist = d.history ?? [];
  const series = ev.length >= 2 ? null : hist.map(h => ({ t: new Date(h.d).getTime(), v: h.stars }));

  const head = (sub, raw) => `
  <text x="${PAD}" y="62" font-family="${MONO}" font-size="${T.kicker - 6}" font-weight="700" letter-spacing="2.6" fill="${m.b}">GROWTH</text>
  <text x="${PAD}" y="162" font-family="${FONT}" font-size="${T.huge}" font-weight="800" letter-spacing="-2" fill="${C.txt}">${d.stars}<tspan dx="18" font-size="${T.body}" font-weight="600" letter-spacing="0" fill="${C.muted}">total stars</tspan></text>
  ${(raw ? wrap(raw, T.micro, IW, 2) : [sub]).map((ln, i) =>
    `<text x="${PAD}" y="${203 + i * 35}" font-family="${FONT}" font-size="${T.micro}" font-weight="500" fill="${C.dim}">${ln}</text>`).join('')}`;

  if (ev.length < 2 && (series?.length ?? 0) < 2) {
    const by = 296;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img"
  aria-label="Mahdi Mortazavi has ${d.stars} GitHub stars; the growth curve starts tracking today">
  <title>${d.stars} stars across all repositories — growth tracking starts today</title>
  ${defs(m)}${card(H, m, W)}
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
  ${card(H, m, W)}
  ${head(last30 > 0 ? `<tspan fill="#30D158" font-weight="700">▲ +${last30}</tspan> in the last 30 days` : 'tracking growth from here')}
  ${grid}
  <path d="${area}" fill="url(#gfill)"/>
  <path d="${line}" fill="none" stroke="${m.a}" stroke-width="3.8" stroke-linejoin="round" stroke-linecap="round"
    stroke-dasharray="4000" stroke-dashoffset="4000">
    <animate attributeName="stroke-dashoffset" values="4000;0" keyTimes="0;1" dur="2.2s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
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
 * Footer wave. Replaces capsule-render.vercel.app, which has started
 * answering 403 intermittently.
 */
export function footer(t, mode = 'm') {
  const { W } = geo(mode);
  const m = t.mood, H = mode === 'w' ? 118 : 128;
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
