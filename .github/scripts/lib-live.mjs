// Event-driven cards: the headline ticker and the radar. Both are written
// from things that actually happened (a release, a star, a merged pull
// request, a story on Hacker News), so the page changes when I do.
import { C, esc, FONT, MONO, defs, glass, nf } from './lib-theme.mjs';

const loop = 'repeatCount="indefinite"';
const clip = (s, n) => { s = String(s ?? '').replace(/\s+/g, ' ').trim(); return s.length > n ? `${s.slice(0, n - 1).replace(/\s\S*$/, '')}…` : s; };
const since = iso => {
  const h = (Date.now() - new Date(iso)) / 36e5;
  if (h < 1) return 'just now'; if (h < 24) return `${Math.floor(h)}h ago`;
  const dd = Math.floor(h / 24); return dd === 1 ? 'yesterday' : `${dd} days ago`;
};
const frame = (W, H, m) => `
  <rect width="${W}" height="${H}" rx="22" fill="url(#bg)"/>
  <g filter="url(#soft)" opacity=".8"><ellipse cx="${W - 40}" cy="20" rx="${(W * 0.22).toFixed(0)}" ry="${Math.max(120, H * 0.6).toFixed(0)}" fill="url(#aura1)"/>
  <ellipse cx="40" cy="${H}" rx="${(W * 0.2).toFixed(0)}" ry="${Math.max(120, H * 0.6).toFixed(0)}" fill="url(#aura2)"/></g>
  <rect width="${W}" height="${H}" rx="22" fill="url(#grid)"/><rect width="${W}" height="3" fill="url(#hair)"/>`;

/**
 * What is newsworthy right now, most recent or most surprising first.
 * Each headline is { tag, text, tone }. Always returns at least three.
 */
export function headlines(d) {
  const out = [], DAY = 864e5, now = Date.now();
  for (const m of d.radar?.mentions ?? []) out.push({ tag: 'HACKER NEWS', tone: 'hot', text: `${m.title} · ${nf(m.points)} points` });
  const rel = d.shipped?.[0];
  if (rel && now - new Date(rel.at) < 14 * DAY) out.push({ tag: 'SHIPPED', tone: 'go', text: `${rel.name} ${rel.tag} · ${since(rel.at)}` });
  const pr = d.radar?.merged?.[0];
  if (pr && now - new Date(pr.at) < 30 * DAY) out.push({ tag: 'MERGED', tone: 'go', text: `A pull request in ${pr.repo} · ${since(pr.at)}` });
  // Deltas come from the daily snapshots the workflow has been keeping.
  const h = d.history ?? [], last = h.at(-1);
  const wk = [...h].reverse().find(x => now - new Date(x.d) >= 6.5 * DAY);
  if (last && wk) {
    if (last.stars - wk.stars > 0) out.push({ tag: 'STARS', tone: 'up', text: `+${nf(last.stars - wk.stars)} stars this week · ${nf(last.stars)} in total` });
    if (last.followers - wk.followers > 0) out.push({ tag: 'FOLLOWERS', tone: 'up', text: `+${nf(last.followers - wk.followers)} new followers this week` });
  }
  if (d.week?.count) out.push({ tag: 'THIS WEEK', tone: 'go', text: `${nf(d.week.count)} contributions${d.week.repos?.length ? ` · ${d.week.repos.slice(0, 2).join(' and ')}` : ''}` });
  const st = d.radar?.starred?.[0];
  if (st) out.push({ tag: 'STARRED', tone: 'calm', text: `${st.repo} · ${since(st.at)}` });
  if (d.downloads) out.push({ tag: 'DOWNLOADS', tone: 'calm', text: `${nf(d.downloads)} installs of my releases so far` });
  if (d.releases) out.push({ tag: 'RELEASES', tone: 'calm', text: `${nf(d.releases)} versions shipped across ${d.featured?.length ?? 0} projects` });
  return out.slice(0, 6);
}

/** The ticker: one headline at a time, sliding up, with a progress rail. */
export function ticker(d, t, mode = 'm') {
  const wide = mode === 'w', W = wide ? 1600 : 900, PAD = wide ? 64 : 52, H = wide ? 132 : 248;
  const m = t.mood, items = headlines(d), N = items.length;
  const tone = { hot: '#FF9F0A', go: C.green, up: m.b, calm: C.muted };
  const SLOT = 3.4, total = (N * SLOT).toFixed(1), f = 0.035;
  const TX = wide ? 250 : PAD, TY = wide ? 78 : 132, max = wide ? 58 : 44;
  const rows = items.map((it, i) => {
    const a = i / N, b = (i + 1) / N;
    const kt = [0, a, Math.min(a + f, b), Math.max(b - f, a), b, 1].map(v => v.toFixed(4)).join(';');
    return `<g opacity="0">
      <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="${kt}" dur="${total}s" ${loop}/>
      <animateTransform attributeName="transform" type="translate" values="0 26;0 26;0 0;0 0;0 -26;0 -26" keyTimes="${kt}" dur="${total}s" ${loop} calcMode="spline" keySplines="0 0 1 1;.2 .8 .2 1;0 0 1 1;.6 0 .8 .2;0 0 1 1"/>
      <text x="${TX}" y="${TY}" font-family="${FONT}" font-size="${wide ? 34 : 36}" font-weight="700" fill="${C.txt}"><tspan font-family="${MONO}" font-size="${wide ? 22 : 24}" font-weight="700" letter-spacing="2.2" fill="${tone[it.tone]}">${esc(it.tag)}</tspan>${wide ? '<tspan dx="20">' : `<tspan x="${TX}" dy="48">`}${esc(clip(it.text, max))}</tspan></text>
    </g>`;
  }).join('');
  // Progress rail: one segment per headline, filling while it is on screen.
  const RW = wide ? 34 : 56, RG = 8, RX = wide ? W - PAD - N * (RW + RG) + RG : PAD, RY = wide ? 62 : H - 40;
  const rail = items.map((_, i) => {
    const a = i / N, b = (i + 1) / N;
    return `<rect x="${RX + i * (RW + RG)}" y="${RY}" width="${RW}" height="6" rx="3" fill="#FFFFFF" fill-opacity=".14"/>
      <rect x="${RX + i * (RW + RG)}" y="${RY}" width="0" height="6" rx="3" fill="url(#mark)">
        <animate attributeName="width" values="0;0;${RW};0;0" keyTimes="0;${a.toFixed(4)};${b.toFixed(4)};${Math.min(b + 0.0001, 1).toFixed(4)};1" dur="${total}s" ${loop}/></rect>`;
  }).join('');
  const LX = PAD, LY = wide ? 66 : 68;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Latest: ${esc(items.map(i => `${i.tag} ${i.text}`).join('. '))}">
  <title>Live headlines from ${esc(d.cfg.name)}'s GitHub activity</title>
  ${defs(m)}${frame(W, H, m)}
  <rect x="${LX}" y="${LY - 34}" width="150" height="52" rx="26" fill="${C.green}" fill-opacity=".12" stroke="${C.green}" stroke-opacity=".45" stroke-width="1.4"/>
  <circle cx="${LX + 30}" cy="${LY - 8}" r="7" fill="${C.green}"/>
  <circle cx="${LX + 30}" cy="${LY - 8}" r="7" fill="none" stroke="${C.green}"><animate attributeName="r" values="7;17;7" dur="2.4s" ${loop}/><animate attributeName="stroke-opacity" values=".8;0;.8" dur="2.4s" ${loop}/></circle>
  <text x="${LX + 52}" y="${LY + 1}" font-family="${MONO}" font-size="24" font-weight="700" letter-spacing="3" fill="#D7FBE0">LIVE</text>
  ${rows}${rail}
</svg>`;
}

/** Radar card: a sweeping scope and the three strongest signals right now. */
export function radarCard(d, t, mode = 'm') {
  const wide = mode === 'w', W = wide ? 1600 : 900, PAD = wide ? 64 : 52, IW = W - PAD * 2;
  const m = t.mood, r = d.radar ?? {};
  const rows = [
    r.trending?.[0] && { tag: 'TRENDING', title: r.trending[0].repo, meta: r.trending[0].today ? `+${nf(r.trending[0].today)} today` : `★ ${nf(r.trending[0].stars)}` },
    r.best?.[0] && { tag: 'BREAKOUT', title: r.best[0].repo, meta: `★ ${nf(r.best[0].stars)} this month` },
    r.hot?.[0] && { tag: 'RISING', title: r.hot[0].repo, meta: `★ ${nf(r.hot[0].stars)} · ${r.hot[0].topic}` },
    r.starred?.[0] && { tag: 'I STARRED', title: r.starred[0].repo, meta: since(r.starred[0].at) },
    r.merged?.[0] && { tag: 'I CONTRIBUTED', title: r.merged[0].repo, meta: since(r.merged[0].at) },
    r.hot?.[1] && { tag: 'RISING', title: r.hot[1].repo, meta: `★ ${nf(r.hot[1].stars)} · ${r.hot[1].topic}` },
    r.hn?.[0] && { tag: 'ON HN', title: r.hn[0].repo, meta: `${nf(r.hn[0].points)} points` },
  ].filter(Boolean).slice(0, 3);
  const CXc = wide ? PAD + 150 : W - PAD - 110, CYc = wide ? 190 : 150, R = wide ? 118 : 96;
  const blips = [[40, 0.5], [150, 0.78], [235, 0.4], [310, 0.66]].map(([a, k], i) => {
    const x = CXc + Math.cos(a * Math.PI / 180) * R * k, y = CYc + Math.sin(a * Math.PI / 180) * R * k;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="${i === 0 ? '#FF9F0A' : m.b}">
      <animate attributeName="opacity" values=".15;1;.15" dur="4s" begin="-${(4 - (a / 360) * 4).toFixed(2)}s" ${loop}/></circle>`;
  }).join('');
  const scope = `<circle cx="${CXc}" cy="${CYc}" r="${R}" fill="#FFFFFF" fill-opacity=".03" stroke="#FFFFFF" stroke-opacity=".28" stroke-width="2"/>
    <circle cx="${CXc}" cy="${CYc}" r="${R * 0.62}" fill="none" stroke="#FFFFFF" stroke-opacity=".14"/><circle cx="${CXc}" cy="${CYc}" r="${R * 0.28}" fill="none" stroke="#FFFFFF" stroke-opacity=".14"/>
    <path d="M${CXc - R} ${CYc} H${CXc + R} M${CXc} ${CYc - R} V${CYc + R}" stroke="#FFFFFF" stroke-opacity=".12"/>
    <g><path d="M${CXc} ${CYc} L${CXc} ${CYc - R} A${R} ${R} 0 0 1 ${(CXc + R * 0.866).toFixed(1)} ${(CYc - R * 0.5).toFixed(1)} Z" fill="url(#mark)" fill-opacity=".32"/>
      <animateTransform attributeName="transform" type="rotate" from="0 ${CXc} ${CYc}" to="360 ${CXc} ${CYc}" dur="4s" ${loop}/></g>
    ${blips}<circle cx="${CXc}" cy="${CYc}" r="5" fill="#FFFFFF"/>`;
  const X0 = wide ? PAD + 340 : PAD, Y0 = wide ? 118 : 300, STEP = wide ? 66 : 112, maxT = wide ? 52 : 40;
  let s = `<text x="${PAD}" y="66" font-family="${MONO}" font-size="${wide ? 23 : 25}" font-weight="700" letter-spacing="2.6" fill="${m.b}">RADAR</text>`;
  if (!wide) s += `<text x="${PAD - 2}" y="150" font-family="${FONT}" font-size="46" font-weight="800" letter-spacing="-1.2" fill="${C.txt}">What I'm</text><text x="${PAD - 2}" y="204" font-family="${FONT}" font-size="46" font-weight="800" letter-spacing="-1.2" fill="${C.txt}">watching now</text>`;
  rows.forEach((it, i) => {
    const y = Y0 + i * STEP;
    s += wide
      ? `<text x="${X0}" y="${y}" font-family="${MONO}" font-size="21" font-weight="700" letter-spacing="2.2" fill="${it.tag === 'TRENDING' ? '#FF9F0A' : m.b}">${esc(it.tag)}</text>
         <text x="${X0 + 250}" y="${y + 2}" font-family="${FONT}" font-size="31" font-weight="700" fill="${C.txt}">${esc(clip(it.title, maxT))}</text>
         <text x="${W - PAD}" y="${y + 1}" text-anchor="end" font-family="${FONT}" font-size="24" font-weight="600" fill="${C.dim}">${esc(it.meta)}</text>`
      : `${glass(PAD, y - 44, IW, 96, 22)}
         <text x="${PAD + 26}" y="${y - 6}" font-family="${MONO}" font-size="22" font-weight="700" letter-spacing="2.2" fill="${it.tag === 'TRENDING' ? '#FF9F0A' : m.b}">${esc(it.tag)}<tspan dx="14" font-family="${FONT}" letter-spacing="0" font-weight="600" fill="${C.dim}">${esc(it.meta)}</tspan></text>
         <text x="${PAD + 26}" y="${y + 34}" font-family="${FONT}" font-size="31" font-weight="700" fill="${C.txt}">${esc(clip(it.title, maxT))}</text>`;
    s += `<animate href="#none"/>`;
  });
  if (!rows.length) s += `<text x="${X0}" y="${Y0 + (wide ? 70 : 20)}" font-family="${FONT}" font-size="30" font-weight="600" fill="${C.muted}">Scanning. The first signals land with the next rebuild.</text>`;
  const H = wide ? 330 : Y0 + Math.max(1, rows.length) * STEP - 16 + 36;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Radar: ${esc(rows.map(x => `${x.tag}: ${x.title}`).join('. '))}">
  <title>Radar — what ${esc(d.cfg.name)} is watching now</title>
  ${defs(m)}${frame(W, H, m)}${scope}${s.replaceAll('<animate href="#none"/>', '')}
</svg>`;
}
