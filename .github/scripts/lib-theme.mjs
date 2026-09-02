// Brand + time-aware theming (Tehran clock) for all generated SVGs.
export const C = {
  bg: '#0D1117', bg2: '#0F1420', panel: '#161B22',
  txt: '#F5F5F7', muted: '#A1A1A6', dim: '#8A93A3',
  stroke: 'rgba(255,255,255,.14)', accent: '#0A84FF',
};

// Four moods, keyed to the hour in Tehran.
const MOODS = [
  { id:'night', from:0,  to:5,  a:'#5E5CE6', b:'#0A84FF', fa:'شب بخیر',    en:'Good night',    icon:'🌙' },
  { id:'dawn',  from:5,  to:9,  a:'#FF9F0A', b:'#FF375F', fa:'صبح بخیر',   en:'Good morning',  icon:'🌅' },
  { id:'day',   from:9,  to:17, a:'#0A84FF', b:'#30D1D0', fa:'روز بخیر',   en:'Good afternoon',icon:'☀️' },
  { id:'dusk',  from:17, to:21, a:'#5E5CE6', b:'#FF375F', fa:'عصر بخیر',   en:'Good evening',  icon:'🌇' },
  { id:'night2',from:21, to:24, a:'#5E5CE6', b:'#0A84FF', fa:'شب بخیر',    en:'Good night',    icon:'🌙' },
];

export function tehran() {
  const f = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Tehran', hour: '2-digit', minute: '2-digit',
    day: '2-digit', month: 'short', year: 'numeric', hour12: false,
  }).formatToParts(new Date());
  const g = t => f.find(p => p.type === t)?.value ?? '';
  const hour = parseInt(g('hour'), 10);
  return {
    hour, time: `${g('hour')}:${g('minute')}`,
    date: `${g('day')} ${g('month')} ${g('year')}`,
    mood: MOODS.find(m => hour >= m.from && hour < m.to) ?? MOODS[2],
  };
}

// XML-safe text.
export const esc = s => String(s ?? '')
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  .replace(/"/g,'&quot;').replace(/'/g,'&apos;');

export const FONT = "system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";

// Shared <defs>: ambient light field, glass gradients, glow + grid pattern.
export function defs(mood) {
  return `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${C.bg}"/>
      <stop offset="55%" stop-color="${C.bg2}"/>
      <stop offset="100%" stop-color="#161B22"/>
    </linearGradient>
    <radialGradient id="aura1" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${mood.a}" stop-opacity=".55"/>
      <stop offset="100%" stop-color="${mood.a}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="aura2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${mood.b}" stop-opacity=".38"/>
      <stop offset="100%" stop-color="${mood.b}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity=".13"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity=".045"/>
    </linearGradient>
    <linearGradient id="mark" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${mood.a}"/>
      <stop offset="100%" stop-color="${mood.b}"/>
    </linearGradient>
    <linearGradient id="hair" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${mood.a}" stop-opacity="0"/>
      <stop offset="50%" stop-color="${mood.a}"/>
      <stop offset="100%" stop-color="${mood.b}" stop-opacity="0"/>
    </linearGradient>
    <filter id="soft" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="26"/>
    </filter>
    <pattern id="grid" width="26" height="26" patternUnits="userSpaceOnUse">
      <circle cx="1.2" cy="1.2" r="1.2" fill="#FFFFFF" fill-opacity=".05"/>
    </pattern>
  </defs>`;
}

// A rounded "glass" panel.
export function glass(x, y, w, h, r = 18) {
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#glass)"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="${C.stroke}"/>
    <path d="M ${x+r} ${y+0.75} H ${x+w-r}" stroke="#FFFFFF" stroke-opacity=".3" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  </g>`;
}
