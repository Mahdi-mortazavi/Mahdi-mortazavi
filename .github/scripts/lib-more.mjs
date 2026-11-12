// Second-generation cards: the tab bar that turns the repository into a small
// site, the shipping-cadence chart, the follower wall and the architecture
// diagrams used by the case studies.
import { C, esc, FONT, MONO, defs, glass, nf } from './lib-theme.mjs';

const GEO = { m: { W: 900, PAD: 52 }, w: { W: 1600, PAD: 64 } };
const geo = mode => { const g = GEO[mode] ?? GEO.m; return { ...g, IW: g.W - g.PAD * 2, wide: mode === 'w' }; };
const textW = (s, size) => String(s).length * size * 0.58;
const loop = 'repeatCount="indefinite"';

function wrap(text, size, max, maxLines = 3) {
  const words = String(text ?? '').split(/\s+/).filter(Boolean), lines = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (textW(next, size) > max && cur) { lines.push(cur); cur = w; } else cur = next;
    if (lines.length === maxLines) break;
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  return lines.length ? lines : [''];
}

const frame = (W, H, m) => `
  <rect width="${W}" height="${H}" rx="22" fill="url(#bg)"/>
  <g filter="url(#soft)" opacity=".8">
    <ellipse cx="${W - 60}" cy="40" rx="${(W * 0.24).toFixed(0)}" ry="${Math.max(150, H * 0.5).toFixed(0)}" fill="url(#aura1)"/>
    <ellipse cx="60" cy="${H + 20}" rx="${(W * 0.26).toFixed(0)}" ry="${Math.max(150, H * 0.5).toFixed(0)}" fill="url(#aura2)"/>
  </g>
  <rect width="${W}" height="${H}" rx="22" fill="url(#grid)"/>
  <rect x="0" y="0" width="${W}" height="3" fill="url(#hair)"/>`;
const kicker = (x, y, s, m, size = 24) =>
  `<text x="${x}" y="${y}" font-family="${MONO}" font-size="${size}" font-weight="700" letter-spacing="2.6" fill="${m.b}">${esc(s)}</text>`;

/**
 * One tab of the site navigation. Every page carries the same row of tabs,
 * with its own drawn in the "on" state, so the repository reads like an app.
 */
export function tab(label, on, t, rtl = false) {
  const m = t.mood, H = 84, size = 30;
  const W = Math.round(textW(label, size) * (rtl ? 1.05 : 0.95) + 68);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">
  <title>${esc(label)}</title>
  <defs><linearGradient id="u" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${m.a}"/><stop offset="100%" stop-color="${m.b}"/></linearGradient></defs>
  <rect x="2" y="6" width="${W - 4}" height="${H - 16}" rx="18" fill="#FFFFFF" fill-opacity="${on ? '.1' : '0'}" stroke="#FFFFFF" stroke-opacity="${on ? '.24' : '.1'}" stroke-width="1.5"/>
  <text x="${W / 2}" y="${H / 2 + 7}" text-anchor="middle" font-family="${FONT}" font-size="${size}" font-weight="${on ? 800 : 600}" fill="${on ? '#FFFFFF' : '#9AA3B2'}">${esc(label)}</text>
  ${on ? `<rect x="${W / 2 - 22}" y="${H - 7}" width="44" height="5" rx="2.5" fill="url(#u)"/>` : ''}
</svg>`;
}

/**
 * Shipping cadence: releases per month across every project, plus what the
 * current week looks like. The claim "I ship" drawn from release timestamps.
 */
export function velocity(d, t, mode = 'm') {
  const { W, PAD, IW, wide } = geo(mode);
  const m = t.mood;
  const dates = (d.relDates ?? []).map(x => new Date(x)).filter(x => !isNaN(x)).sort((a, b) => a - b);
  const now = new Date();
  const MONTHS = wide ? 8 : 6;
  const buckets = [];
  for (let i = MONTHS - 1; i >= 0; i--) {
    const dt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    buckets.push({ key: dt.toISOString().slice(0, 7), label: dt.toLocaleString('en-GB', { month: 'short', timeZone: 'UTC' }), n: 0 });
  }
  for (const x of dates) { const b = buckets.find(k => k.key === x.toISOString().slice(0, 7)); if (b) b.n++; }
  const peak = Math.max(...buckets.map(b => b.n), 1);
  const total = dates.length;
  const span = total > 1 ? (now - dates[0]) / 86400000 : 0;
  const every = total > 1 ? Math.max(1, Math.round(span / total)) : null;
  const wk = d.week ?? { count: 0, repos: [] };

  const CH = wide ? 150 : 170;              // chart height
  const CX = wide ? 760 : PAD, CWd = wide ? W - PAD - 760 : IW;
  const CY = wide ? 92 : 318;
  const BW = CWd / MONTHS;
  let bars = '';
  buckets.forEach((b, i) => {
    const h = Math.max(b.n ? 10 : 4, (b.n / peak) * CH), x = CX + i * BW + BW * 0.18, w = BW * 0.64, y = CY + CH - h;
    bars += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="10" fill="url(#mark)" fill-opacity="${b.n ? (0.45 + 0.55 * b.n / peak).toFixed(2) : '.18'}">
      <animate attributeName="height" values="0;${h.toFixed(1)}" keyTimes="0;1" dur="1.2s" begin="${(i * 0.09).toFixed(2)}s" fill="freeze" calcMode="spline" keySplines=".2 .8 .2 1"/>
      <animate attributeName="y" values="${(CY + CH).toFixed(1)};${y.toFixed(1)}" keyTimes="0;1" dur="1.2s" begin="${(i * 0.09).toFixed(2)}s" fill="freeze" calcMode="spline" keySplines=".2 .8 .2 1"/>
    </rect>
    ${b.n ? `<text x="${(x + w / 2).toFixed(1)}" y="${(y - 12).toFixed(1)}" text-anchor="middle" font-family="${FONT}" font-size="${wide ? 24 : 27}" font-weight="800" fill="${C.txt}">${b.n}</text>` : ''}
    <text x="${(x + w / 2).toFixed(1)}" y="${CY + CH + 36}" text-anchor="middle" font-family="${MONO}" font-size="${wide ? 21 : 24}" font-weight="600" fill="${C.dim}">${b.label.toUpperCase()}</text>`;
  });

  const headY = wide ? 172 : 164;
  let s = kicker(PAD, 66, 'SHIPPING CADENCE', m, wide ? 23 : 25);
  s += `<text x="${PAD - 4}" y="${headY}" font-family="${FONT}" font-size="${wide ? 104 : 92}" font-weight="800" letter-spacing="-3" fill="${C.txt}">${nf(total)}<tspan dx="18" font-size="${wide ? 34 : 32}" font-weight="600" letter-spacing="0" fill="${C.muted}">releases shipped</tspan></text>`;
  if (every) s += `<text x="${PAD}" y="${headY + 48}" font-family="${FONT}" font-size="${wide ? 28 : 29}" font-weight="600" fill="${C.muted}">One every <tspan fill="${m.b}" font-weight="800">${every} day${every > 1 ? 's' : ''}</tspan> on average</text>`;

  // This week, as a live strip.
  const SY = wide ? CY + CH + 78 : CY + CH + 74, SH = wide ? 72 : 78;
  const active = wk.repos?.length ? `active in ${wk.repos.slice(0, wide ? 4 : 2).join(', ')}` : 'between releases';
  s += `${glass(PAD, SY, IW, SH, SH / 2)}
    <circle cx="${PAD + 36}" cy="${SY + SH / 2}" r="7" fill="${C.green}"/>
    <circle cx="${PAD + 36}" cy="${SY + SH / 2}" r="7" fill="none" stroke="${C.green}"><animate attributeName="r" values="7;17;7" dur="2.4s" ${loop}/><animate attributeName="stroke-opacity" values=".8;0;.8" dur="2.4s" ${loop}/></circle>
    <text x="${PAD + 62}" y="${SY + SH / 2 + 10}" font-family="${FONT}" font-size="${wide ? 27 : 28}" font-weight="600" fill="${C.muted}"><tspan font-family="${MONO}" font-weight="700" fill="${C.green}" letter-spacing="1.6">THIS WEEK</tspan><tspan dx="18" fill="${C.txt}" font-weight="800">${nf(wk.count ?? 0)}</tspan> contributions · ${esc(active)}</text>`;
  const H = SY + SH + (wide ? 46 : 48);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img"
  aria-label="${total} releases shipped${every ? `, one every ${every} days on average` : ''}">
  <title>Shipping cadence — ${total} releases across all projects</title>
  ${defs(m)}${frame(W, H, m)}${s}${bars}
</svg>`;
}

/**
 * Follower wall. Follow the profile and your avatar is drawn here on the next
 * rebuild. Avatars are embedded as data URIs, because an SVG shown through
 * <img> cannot load anything from the network.
 */
export function wall(d, t, mode = 'm') {
  const { W, PAD, IW, wide } = geo(mode);
  const m = t.mood;
  const people = d.followers ?? [];
  const COLS = wide ? 16 : 8, MAX = wide ? 48 : 32;
  const shown = people.slice(0, MAX);
  const STEP = IW / COLS, R = STEP * 0.37, TOP = wide ? 190 : 214;
  const tints = ['#0A84FF', '#5E5CE6', '#30D158', '#FF9F0A', '#FF375F', '#30D1D0'];
  let cells = '', clips = '';
  shown.forEach((p, i) => {
    const cx = PAD + (i % COLS) * STEP + STEP / 2, cy = TOP + Math.floor(i / COLS) * STEP + STEP / 2;
    clips += `<clipPath id="c${i}"><circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${R.toFixed(1)}"/></clipPath>`;
    const face = p.img
      ? `<image href="${p.img}" x="${(cx - R).toFixed(1)}" y="${(cy - R).toFixed(1)}" width="${(R * 2).toFixed(1)}" height="${(R * 2).toFixed(1)}" clip-path="url(#c${i})" preserveAspectRatio="xMidYMid slice"/>`
      : `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${R.toFixed(1)}" fill="${tints[i % tints.length]}" fill-opacity=".55"/>
         <text x="${cx.toFixed(1)}" y="${(cy + R * 0.3).toFixed(1)}" text-anchor="middle" font-family="${FONT}" font-size="${(R * 0.9).toFixed(0)}" font-weight="800" fill="#FFFFFF">${esc((p.login ?? '?')[0].toUpperCase())}</text>`;
    cells += `<g>${face}
      <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${R.toFixed(1)}" fill="none" stroke="#FFFFFF" stroke-opacity=".22" stroke-width="1.5"/>
      <animate attributeName="opacity" values="0;1" keyTimes="0;1" dur=".5s" begin="${(i * 0.03).toFixed(2)}s" fill="freeze"/>
    </g>`;
  });
  // The next free seat, reserved for whoever follows next.
  const n = shown.length;
  if (n < MAX) {
    const cx = PAD + (n % COLS) * STEP + STEP / 2, cy = TOP + Math.floor(n / COLS) * STEP + STEP / 2;
    cells += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${R.toFixed(1)}" fill="none" stroke="${m.b}" stroke-width="2.4" stroke-dasharray="6 8" stroke-linecap="round">
      <animateTransform attributeName="transform" type="rotate" from="0 ${cx.toFixed(1)} ${cy.toFixed(1)}" to="360 ${cx.toFixed(1)} ${cy.toFixed(1)}" dur="12s" ${loop}/></circle>
      <text x="${cx.toFixed(1)}" y="${(cy + R * 0.32).toFixed(1)}" text-anchor="middle" font-family="${FONT}" font-size="${(R * 0.9).toFixed(0)}" font-weight="700" fill="${m.b}">+</text>`;
  }
  const rows = Math.ceil(Math.min(MAX, n + 1) / COLS);
  const H = TOP + rows * STEP + (wide ? 44 : 48);
  const count = d.user?.followers ?? people.length;
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img"
  aria-label="${count} people follow Mahdi Mortazavi on GitHub">
  <title>${count} followers — follow to join the wall</title>
  ${defs(m)}<defs>${clips}</defs>${frame(W, H, m)}
  ${kicker(PAD, 66, 'THE WALL', m, wide ? 23 : 25)}
  <text x="${PAD - 3}" y="${wide ? 140 : 146}" font-family="${FONT}" font-size="${wide ? 60 : 58}" font-weight="800" letter-spacing="-1.6" fill="${C.txt}">${nf(count)}<tspan dx="14" font-size="${wide ? 30 : 30}" font-weight="600" letter-spacing="0" fill="${C.muted}">people follow this work</tspan></text>
  ${wide
    ? `<text x="${W - PAD}" y="140" text-anchor="end" font-family="${FONT}" font-size="27" font-weight="600" fill="${C.muted}">Follow, and the next seat is yours</text>`
    : `<text x="${PAD}" y="190" font-family="${FONT}" font-size="27" font-weight="600" fill="${C.muted}">Follow, and the next seat is yours</text>`}
  ${cells}
</svg>`;
}

/**
 * Architecture diagram for a case study: two to four nodes joined by animated
 * links. Horizontal on desktop, stacked on a phone.
 */
export function diagram(spec, t, mode = 'm') {
  const { W, PAD, IW, wide } = geo(mode);
  const m = t.mood, N = spec.nodes.length;
  let s = kicker(PAD, 66, spec.kicker, m, wide ? 23 : 25), H;
  const node = (x, y, w, h, n) => `${glass(x, y, w, h, 26)}
    <text x="${x + 30}" y="${y + (wide ? 58 : 56)}" font-family="${FONT}" font-size="${wide ? (N > 3 ? 29 : 34) : 36}" font-weight="800" letter-spacing="-.5" fill="${C.txt}">${esc(n.title)}</text>
    ${n.lines.map((ln, i) => `<text x="${x + 30}" y="${y + (wide ? 100 : 100) + i * (wide ? 34 : 38)}" font-family="${i === 0 ? MONO : FONT}" font-size="${wide ? (i === 0 ? 22 : 24) : (i === 0 ? 25 : 27)}" font-weight="${i === 0 ? 700 : 500}" fill="${i === 0 ? m.b : C.muted}">${esc(ln)}</text>`).join('')}`;
  const dots = (path, dur, both) => [0, 1, 2].map(i => `<circle r="5.5" fill="url(#mark)">
      <animateMotion dur="${dur}s" begin="-${(i * dur / 3).toFixed(2)}s" ${loop} path="${path}" ${both && i === 1 ? 'keyPoints="1;0" keyTimes="0;1" calcMode="linear"' : ''}/>
    </circle>`).join('');
  if (wide) {
    const GAPW = N === 2 ? 330 : N === 3 ? 170 : 124;
    const NW = (IW - GAPW * (N - 1)) / N, NH = 196, Y = 112;
    spec.nodes.forEach((n, i) => {
      const x = PAD + i * (NW + GAPW);
      s += node(x, Y, NW, NH, n);
      if (i < N - 1) {
        const x1 = x + NW + 10, x2 = x + NW + GAPW - 10, cy = Y + NH / 2;
        const label = spec.links[i] ?? '';
        s += `<path d="M${x1} ${cy} H${x2}" stroke="#FFFFFF" stroke-opacity=".3" stroke-width="2" stroke-dasharray="5 8" stroke-linecap="round"><animate attributeName="stroke-dashoffset" values="26;0" dur="1.2s" ${loop}/></path>
          ${dots(`M${x1} ${cy} H${x2}`, 2.4, spec.both)}
          ${wrap(label, 19, GAPW - 16, 2).map((ln, k, a) => `<text x="${(x1 + x2) / 2}" y="${cy - 22 - (a.length - 1 - k) * 26}" text-anchor="middle" font-family="${MONO}" font-size="19" font-weight="600" fill="${C.dim}">${esc(ln)}</text>`).join('')}`;
      }
    });
    H = Y + NH + 92;
    s += `<text x="${PAD}" y="${H - 38}" font-family="${FONT}" font-size="27" font-weight="600" fill="${C.muted}">${esc(spec.note)}</text>`;
  } else {
    const NH = 60 + 40 + Math.max(...spec.nodes.map(n => n.lines.length)) * 38, GAPH = 96;
    let y = 104;
    spec.nodes.forEach((n, i) => {
      s += node(PAD, y, IW, NH, n);
      if (i < N - 1) {
        const cx = PAD + 70, y1 = y + NH + 8, y2 = y + NH + GAPH - 8;
        s += `<path d="M${cx} ${y1} V${y2}" stroke="#FFFFFF" stroke-opacity=".3" stroke-width="2" stroke-dasharray="5 8" stroke-linecap="round"><animate attributeName="stroke-dashoffset" values="26;0" dur="1.2s" ${loop}/></path>
          ${dots(`M${cx} ${y1} V${y2}`, 2, spec.both)}
          <text x="${cx + 34}" y="${(y1 + y2) / 2 + 9}" font-family="${MONO}" font-size="25" font-weight="600" fill="${C.dim}">${esc(spec.links[i] ?? '')}</text>`;
      }
      y += NH + GAPH;
    });
    y -= GAPH;
    const lines = wrap(spec.note, 28, IW, 3);
    lines.forEach((ln, i) => { s += `<text x="${PAD}" y="${y + 60 + i * 40}" font-family="${FONT}" font-size="28" font-weight="600" fill="${C.muted}">${esc(ln)}</text>`; });
    H = y + 60 + (lines.length - 1) * 40 + 46;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(spec.alt)}">
  <title>${esc(spec.alt)}</title>
  ${defs(m)}${frame(W, H, m)}${s}
</svg>`;
}
