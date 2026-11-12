// Animated illustrations. Every project gets its own small scene, drawn in a
// 300x200 box and animated with SMIL so it plays inside a README <img>.
// No scripts, no external assets, no fonts beyond the system stack.
import { MONO } from './lib-theme.mjs';

const S = 'stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" fill="none"';
const loop = 'repeatCount="indefinite"';

/** relay — packets leave the phone, cross an encrypted tunnel, land on the PC. */
function relay() {
  const packet = (delay, r = 5) => `<circle r="${r}" cy="100" fill="url(#mark)">
    <animate attributeName="cx" values="92;206" dur="2.4s" begin="-${delay}s" ${loop}/>
    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.12;.88;1" dur="2.4s" begin="-${delay}s" ${loop}/>
  </circle>`;
  return `
  <rect x="26" y="42" width="62" height="116" rx="13" ${S} stroke-opacity=".85" stroke-width="2.4"/>
  <rect x="48" y="50" width="18" height="4" rx="2" fill="#FFFFFF" fill-opacity=".5"/>
  <g ${S} stroke-width="2.4">
    <path d="M45 26 q12 -12 24 0" stroke-opacity=".35"><animate attributeName="stroke-opacity" values=".15;.8;.15" dur="2.4s" ${loop}/></path>
    <path d="M51 33 q6 -6 12 0" stroke-opacity=".6"><animate attributeName="stroke-opacity" values=".3;1;.3" dur="2.4s" begin="-.4s" ${loop}/></path>
  </g>
  <rect x="38" y="78" width="38" height="44" rx="8" fill="url(#mark)" fill-opacity=".22"/>
  <rect x="92" y="88" width="114" height="24" rx="12" fill="#FFFFFF" fill-opacity=".05" stroke="#FFFFFF" stroke-opacity=".28" stroke-dasharray="5 7" stroke-width="1.6">
    <animate attributeName="stroke-dashoffset" values="24;0" dur="1.2s" ${loop}/>
  </rect>
  ${packet(0)}${packet(0.8, 4)}${packet(1.6)}
  <g transform="translate(149 60)">
    <rect x="-11" y="-2" width="22" height="17" rx="4.5" fill="url(#mark)"/>
    <path d="M-6 -2 v-5 a6 6 0 0 1 12 0 v5" ${S} stroke-width="2.4" stroke-opacity=".9"/>
  </g>
  <rect x="210" y="62" width="68" height="50" rx="7" ${S} stroke-opacity=".85" stroke-width="2.4"/>
  <path d="M200 124 h88 l-6 10 h-76 z" ${S} stroke-opacity=".85" stroke-width="2.4"/>
  <rect x="222" y="74" width="44" height="26" rx="4" fill="url(#mark)" fill-opacity=".22">
    <animate attributeName="fill-opacity" values=".12;.5;.12" dur="2.4s" begin="-.3s" ${loop}/>
  </rect>`;
}

/** Angaros — an SMS arrives, its code is read, and it is routed to agents. */
function angaros() {
  const digits = ['4', '8', '2', '9', '1', '3'].map((n, i) =>
    `<text x="${52 + i * 15 + (i > 2 ? 8 : 0)}" y="97" font-family="${MONO}" font-size="17" font-weight="700" fill="#FFFFFF" opacity=".25">${n}
      <animate attributeName="opacity" values=".2;1;1;.2" keyTimes="0;.1;.75;1" dur="3.6s" begin="${(i * 0.18).toFixed(2)}s" ${loop}/></text>`).join('');
  const agent = (x, y, d) => `<g>
    <path d="M168 100 C ${190} 100, ${x - 34} ${y}, ${x - 14} ${y}" ${S} stroke-opacity=".28" stroke-width="1.8"/>
    <circle r="4" fill="url(#mark)"><animateMotion dur="2.4s" begin="-${d}s" ${loop} path="M168 100 C 190 100, ${x - 34} ${y}, ${x - 14} ${y}"/>
      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.85;1" dur="2.4s" begin="-${d}s" ${loop}/></circle>
    <rect x="${x - 14}" y="${y - 14}" width="28" height="28" rx="9" fill="#FFFFFF" fill-opacity=".07" stroke="#FFFFFF" stroke-opacity=".5" stroke-width="1.8"/>
    <path d="M${x} ${y - 7} l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="url(#mark)"/>
  </g>`;
  return `
  <rect x="34" y="62" width="122" height="54" rx="16" fill="#FFFFFF" fill-opacity=".07" stroke="#FFFFFF" stroke-opacity=".55" stroke-width="2.2"/>
  <path d="M54 116 l-6 16 20 -16" fill="#FFFFFF" fill-opacity=".07" stroke="#FFFFFF" stroke-opacity=".55" stroke-width="2.2" stroke-linejoin="round"/>
  ${digits}
  <circle cx="168" cy="100" r="7" fill="url(#mark)"/>
  <circle cx="168" cy="100" r="7" fill="none" stroke="#FFFFFF" stroke-opacity=".6">
    <animate attributeName="r" values="7;18;7" dur="2.4s" ${loop}/><animate attributeName="stroke-opacity" values=".6;0;.6" dur="2.4s" ${loop}/>
  </circle>
  ${agent(262, 46, 0)}${agent(272, 100, 0.8)}${agent(262, 154, 1.6)}`;
}

/** Flow — one point, breathing. */
function flow() {
  const ring = d => `<circle cx="150" cy="100" r="14" fill="none" stroke="url(#mark)" stroke-width="2.2">
    <animate attributeName="r" values="14;84" dur="4.5s" begin="-${d}s" ${loop}/>
    <animate attributeName="opacity" values=".75;0" dur="4.5s" begin="-${d}s" ${loop}/>
  </circle>`;
  return `
  <circle cx="150" cy="100" r="78" fill="none" stroke="#FFFFFF" stroke-opacity=".1" stroke-width="2"/>
  <circle cx="150" cy="100" r="78" fill="none" stroke="url(#mark)" stroke-width="4" stroke-linecap="round" stroke-dasharray="490" stroke-dashoffset="490" transform="rotate(-90 150 100)">
    <animate attributeName="stroke-dashoffset" values="490;0;0" keyTimes="0;.9;1" dur="13.5s" ${loop}/>
  </circle>
  ${ring(0)}${ring(1.5)}${ring(3)}
  <circle cx="150" cy="100" r="13" fill="url(#mark)">
    <animate attributeName="r" values="12;16;12" dur="4.5s" ${loop}/>
  </circle>
  <circle cx="150" cy="100" r="5" fill="#FFFFFF"/>`;
}

/** Overrun — a radar sweep while the wave closes in on the player. */
function overrun() {
  const foe = (a, d) => {
    const r = a * Math.PI / 180, x = 150 + Math.cos(r) * 78, y = 100 + Math.sin(r) * 78;
    return `<circle r="5" fill="#FF375F">
      <animate attributeName="cx" values="${x.toFixed(1)};150" dur="4s" begin="-${d}s" ${loop}/>
      <animate attributeName="cy" values="${y.toFixed(1)};100" dur="4s" begin="-${d}s" ${loop}/>
      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.72;.8" dur="4s" begin="-${d}s" ${loop}/>
    </circle>`;
  };
  return `
  <circle cx="150" cy="100" r="82" fill="#FFFFFF" fill-opacity=".03" stroke="#FFFFFF" stroke-opacity=".3" stroke-width="2"/>
  <circle cx="150" cy="100" r="52" ${S} stroke-opacity=".16" stroke-width="1.5"/>
  <circle cx="150" cy="100" r="24" ${S} stroke-opacity=".16" stroke-width="1.5"/>
  <path d="M150 12 v28 M150 160 v28 M62 100 h28 M210 100 h28" ${S} stroke-opacity=".45" stroke-width="2"/>
  <g>
    <path d="M150 100 L150 18 A82 82 0 0 1 221 59 Z" fill="url(#mark)" fill-opacity=".3"/>
    <animateTransform attributeName="transform" type="rotate" from="0 150 100" to="360 150 100" dur="4s" ${loop}/>
  </g>
  ${foe(20, 0)}${foe(110, 0.9)}${foe(195, 1.8)}${foe(250, 2.6)}${foe(320, 3.3)}
  <path d="M150 88 l10 20 -10 -5 -10 5z" fill="#FFFFFF"/>`;
}

/** Sooda — margin grows, the trend line draws itself. */
function sooda() {
  const bar = (i, h) => {
    const x = 52 + i * 44;
    return `<rect x="${x}" width="28" rx="7" fill="url(#mark)" fill-opacity="${0.35 + i * 0.16}" y="${160 - h}" height="${h}">
      <animate attributeName="height" values="6;${h};${h};6" keyTimes="0;.35;.9;1" dur="5s" begin="${(i * 0.15).toFixed(2)}s" ${loop}/>
      <animate attributeName="y" values="154;${160 - h};${160 - h};154" keyTimes="0;.35;.9;1" dur="5s" begin="${(i * 0.15).toFixed(2)}s" ${loop}/>
    </rect>`;
  };
  return `
  <path d="M40 160 h220" ${S} stroke-opacity=".3" stroke-width="2"/>
  ${bar(0, 38)}${bar(1, 62)}${bar(2, 84)}${bar(3, 112)}
  <path d="M60 112 L110 88 L154 66 L206 34" ${S} stroke-width="3" stroke-opacity=".95" stroke-dasharray="180" stroke-dashoffset="180">
    <animate attributeName="stroke-dashoffset" values="180;180;0;0;180" keyTimes="0;.3;.6;.92;1" dur="5s" ${loop}/>
  </path>
  <g transform="translate(240 56)">
    <circle r="24" fill="#FFFFFF" fill-opacity=".07" stroke="#FFFFFF" stroke-opacity=".5" stroke-width="2"/>
    <circle cx="-7" cy="-7" r="4.2" ${S} stroke-width="2.4"/><circle cx="7" cy="7" r="4.2" ${S} stroke-width="2.4"/>
    <path d="M8 -9 L-8 9" ${S} stroke-width="2.4"/>
    <animateTransform attributeName="transform" type="translate" values="240 60;240 52;240 60" dur="5s" ${loop}/>
  </g>`;
}

/** purify — the used segment of the disk is wiped clean, then refills. */
function purify() {
  const C = 2 * Math.PI * 62;
  const spark = (x, y, d, s = 1) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -9 l2.4 6.6 6.6 2.4 -6.6 2.4 -2.4 6.6 -2.4 -6.6 -6.6 -2.4 6.6 -2.4z" fill="#FFFFFF">
    <animate attributeName="opacity" values="0;1;0" dur="2.2s" begin="-${d}s" ${loop}/></path>`;
  return `
  <circle cx="150" cy="100" r="62" fill="none" stroke="#FFFFFF" stroke-opacity=".1" stroke-width="20"/>
  <circle cx="150" cy="100" r="62" fill="none" stroke="url(#mark)" stroke-width="20" stroke-linecap="round" transform="rotate(-90 150 100)"
    stroke-dasharray="${(C * 0.82).toFixed(0)} ${C.toFixed(0)}">
    <animate attributeName="stroke-dasharray" dur="6s" ${loop} calcMode="spline" keySplines=".4 0 .2 1;.4 0 .2 1;.4 0 .2 1"
      keyTimes="0;.2;.6;1" values="${(C * 0.82).toFixed(0)} ${C.toFixed(0)};${(C * 0.82).toFixed(0)} ${C.toFixed(0)};${(C * 0.28).toFixed(0)} ${C.toFixed(0)};${(C * 0.82).toFixed(0)} ${C.toFixed(0)}"/>
  </circle>
  <circle cx="150" cy="100" r="30" fill="#FFFFFF" fill-opacity=".06" stroke="#FFFFFF" stroke-opacity=".35" stroke-width="1.6"/>
  <path d="M138 100 l9 9 16 -18" ${S} stroke-width="4" stroke-dasharray="40" stroke-dashoffset="40">
    <animate attributeName="stroke-dashoffset" values="40;40;0;0;40" keyTimes="0;.5;.62;.92;1" dur="6s" ${loop}/>
  </path>
  ${spark(238, 46, 0)}${spark(58, 60, 0.8, 0.7)}${spark(246, 150, 1.5, 0.8)}`;
}

/** Nava — a squircle that breathes, and a list that reduces itself. */
function nava() {
  const row = (i, w) => `<g>
    <rect x="176" y="${58 + i * 34}" width="20" height="20" rx="7" ${S} stroke-opacity=".7" stroke-width="2"/>
    <rect x="208" y="${64 + i * 34}" width="${w}" height="8" rx="4" fill="#FFFFFF" fill-opacity=".5">
      <animate attributeName="width" values="${w};${w};0;0;${w}" keyTimes="0;${(0.2 + i * 0.18).toFixed(2)};${(0.3 + i * 0.18).toFixed(2)};.92;1" dur="7s" ${loop}/>
    </rect>
    <path d="M180 ${68 + i * 34} l5 5 8 -9" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.6" opacity="0">
      <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;${(0.2 + i * 0.18).toFixed(2)};${(0.3 + i * 0.18).toFixed(2)};.92;1" dur="7s" ${loop}/>
    </path>
  </g>`;
  return `
  <g>
    <rect x="34" y="44" width="112" height="112" rx="38" fill="url(#mark)" fill-opacity=".9"/>
    <rect x="34" y="44" width="112" height="112" rx="38" fill="none" stroke="#FFFFFF" stroke-opacity=".5" stroke-width="1.6"/>
    <path d="M70 102 l15 15 26 -32" ${S} stroke-width="7"/>
    <animateTransform attributeName="transform" type="scale" values="1;1.05;1" dur="4.5s" additive="sum" ${loop}/>
    <animateTransform attributeName="transform" type="translate" values="0 0;-4.5 -5;0 0" dur="4.5s" additive="sum" ${loop}/>
  </g>
  ${row(0, 62)}${row(1, 46)}${row(2, 56)}`;
}

const ART = { relay, angaros, flow, overrun, sooda, purify, nava };
export const art = id => (ART[id] ?? flow)();

/**
 * The signature mark: a cloud of scattered points is pulled through a lens
 * and comes out as an ordered grid. Problem -> first principles -> product.
 * Drawn in a 460x300 box.
 */
export function signal(mono = false) {
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const dots = [];
  for (let i = 0; i < 25; i++) {
    const cx = 10 + rnd() * 140, cy = 34 + rnd() * 222;
    const dx = cx + (rnd() - 0.5) * 34, dy = cy + (rnd() - 0.5) * 34;
    const gx = 330 + (i % 5) * 26, gy = 98 + Math.floor(i / 5) * 26;
    const kt = '0;.24;.44;.5;.7;.93;1', ks = '.4 0 .2 1;.5 0 .3 1;0 0 1 1;.2 .8 .2 1;0 0 1 1;.4 0 .2 1';
    const b = (i * 0.035).toFixed(2);
    const a = (attr, vals) => `<animate attributeName="${attr}" values="${vals.map(v => typeof v === 'number' ? v.toFixed(1) : v).join(';')}" keyTimes="${kt}" calcMode="spline" keySplines="${ks}" dur="9s" begin="${b}s" ${loop}/>`;
    dots.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="5" fill="#FFFFFF" fill-opacity=".38">
      ${a('cx', [cx, dx, 230, 230, gx, gx, cx])}${a('cy', [cy, dy, 150, 150, gy, gy, cy])}
      ${a('fill-opacity', ['.38', '.38', '.9', '.9', '1', '1', '.38'])}${a('r', ['5', '5', '2.5', '2.5', '6.5', '6.5', '5'])}
    </circle>`);
  }
  const label = (x, s) => `<text x="${x}" y="292" text-anchor="middle" font-family="${MONO}" font-size="17" font-weight="600" letter-spacing="2.4" fill="#FFFFFF" fill-opacity=".42">${s}</text>`;
  return `
  <path d="M150 150 H186 M274 150 H314" stroke="#FFFFFF" stroke-opacity=".22" stroke-width="1.6" stroke-dasharray="3 7" stroke-linecap="round">
    <animate attributeName="stroke-dashoffset" values="20;0" dur="1.4s" ${loop}/>
  </path>
  <rect x="312" y="80" width="140" height="140" rx="26" fill="url(#mark)" fill-opacity=".16" stroke="#FFFFFF" stroke-opacity=".3" stroke-width="1.5">
    <animate attributeName="opacity" values=".25;.25;.25;.25;1;1;.25" keyTimes="0;.24;.44;.5;.7;.93;1" dur="9s" ${loop}/>
  </rect>
  ${dots.join('')}
  <circle cx="230" cy="150" r="46" fill="url(#mark)" filter="url(#coreglow)" opacity=".7"/>
  <circle cx="230" cy="150" r="34" fill="url(#mark)"/>
  <circle cx="230" cy="150" r="34" fill="none" stroke="#FFFFFF" stroke-opacity=".55" stroke-width="1.5"/>
  <ellipse cx="218" cy="137" rx="13" ry="8" fill="#FFFFFF" fill-opacity=".3" transform="rotate(-35 218 137)"/>
  <circle cx="230" cy="150" r="48" fill="none" stroke="#FFFFFF" stroke-opacity=".4" stroke-width="1.6" stroke-dasharray="4 10" stroke-linecap="round">
    <animateTransform attributeName="transform" type="rotate" from="0 230 150" to="360 230 150" dur="16s" ${loop}/>
  </circle>
  ${mono ? label(80, 'PROBLEM') + label(230, 'PRINCIPLES') + label(382, 'PRODUCT') : ''}`;
}

/** Small glyphs for the contact buttons, drawn in a 32x32 box. */
export const GLYPH = {
  mail: `<rect x="4" y="8" width="24" height="17" rx="4" ${S} stroke-width="2.4"/><path d="M5 10 l11 9 11 -9" ${S} stroke-width="2.4"/>`,
  telegram: `<path d="M27 6 L4 15 l7 3 2 8 4 -5 6 4z" ${S} stroke-width="2.4"/><path d="M11 18 l12 -9" ${S} stroke-width="2"/>`,
  linkedin: `<rect x="4" y="4" width="24" height="24" rx="6" ${S} stroke-width="2.4"/><path d="M10.5 14 v8 M10.5 10 v.2 M15.5 22 v-8 M15.5 17.5 c0 -5 6.5 -5 6.5 0 v4.5" ${S} stroke-width="2.4"/>`,
  globe: `<circle cx="16" cy="16" r="12" ${S} stroke-width="2.4"/><path d="M4 16 h24 M16 4 c-7 7 -7 17 0 24 M16 4 c7 7 7 17 0 24" ${S} stroke-width="2"/>`,
  chat: `<path d="M6 7 h20 a3 3 0 0 1 3 3 v10 a3 3 0 0 1 -3 3 h-10 l-7 5 v-5 h-3 a3 3 0 0 1 -3 -3 v-10 a3 3 0 0 1 3 -3z" ${S} stroke-width="2.4"/>`,
  doc: `<path d="M9 4 h10 l6 6 v18 h-16z M19 4 v6 h6 M13 16 h8 M13 21 h8" ${S} stroke-width="2.4"/>`,
  card: `<rect x="3" y="7" width="26" height="18" rx="4" ${S} stroke-width="2.4"/><circle cx="11" cy="14.5" r="3" ${S} stroke-width="2.2"/><path d="M6.5 21 c1.5 -3.5 7.5 -3.5 9 0 M19 13 h6 M19 18 h6" ${S} stroke-width="2.2"/>`,
  plus: `<circle cx="13" cy="11" r="5" ${S} stroke-width="2.4"/><path d="M4 27 c1.5 -8 16.5 -8 18 0 M25 9 v8 M21 13 h8" ${S} stroke-width="2.4"/>`,
  brief: `<rect x="4" y="10" width="24" height="16" rx="4" ${S} stroke-width="2.4"/><path d="M12 10 v-3 a2 2 0 0 1 2 -2 h4 a2 2 0 0 1 2 2 v3 M4 17 h24" ${S} stroke-width="2.4"/>`,
};
