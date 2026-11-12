#!/usr/bin/env python3
"""Builds assets/showreel(-w).svg: real product screenshots in floating phone frames.

Run by hand when a screenshot changes (needs Pillow):
    python3 .github/scripts/build-showreel.py NAME=path/to/shot.png ...
Screens are embedded as JPEG data URIs because an SVG shown through <img>
cannot load anything from the network.
"""
import base64, io, sys
from PIL import Image

FONT = "system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif"
MONO = "ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,'Liberation Mono',monospace"
shots = [a.split('=', 1) for a in sys.argv[1:]]

def uri(path, w, h):
    im = Image.open(path).convert('RGB')
    r = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS).crop((0, 0, w, h))
    buf = io.BytesIO(); im.save(buf, 'JPEG', quality=80, optimize=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()

def build(W, PAD, items, pw, ph, top, size):
    n = len(items); gap = (W - 2 * PAD - n * pw) / max(1, n - 1)
    H = top + ph + 150
    out = [f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-label="Real screens from {', '.join(k for k, _ in items)}">
<title>Real product screens: {', '.join(k for k, _ in items)}</title>
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#07090E"/><stop offset="100%" stop-color="#10151F"/></linearGradient>
  <radialGradient id="au" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#0A84FF" stop-opacity=".5"/><stop offset="100%" stop-color="#0A84FF" stop-opacity="0"/></radialGradient>
  <linearGradient id="hair" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#0A84FF" stop-opacity="0"/><stop offset="50%" stop-color="#0A84FF"/><stop offset="100%" stop-color="#30D1D0" stop-opacity="0"/></linearGradient>
  <filter id="soft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="40"/></filter>
  <clipPath id="ph"><rect width="{pw}" height="{ph}" rx="{round(pw * .13)}"/></clipPath>
</defs>
<rect width="{W}" height="{H}" rx="22" fill="url(#bg)"/>
<g filter="url(#soft)"><ellipse cx="{W / 2}" cy="{top + ph * .55}" rx="{W * .42}" ry="{ph * .42}" fill="url(#au)"/></g>
<rect width="{W}" height="3" fill="url(#hair)"/>
<text x="{PAD}" y="66" font-family="{MONO}" font-size="{size - 6}" font-weight="700" letter-spacing="2.6" fill="#30D1D0">REAL SCREENS</text>
<text x="{PAD - 3}" y="{66 + size * 2.3:.0f}" font-family="{FONT}" font-size="{size * 1.9:.0f}" font-weight="800" letter-spacing="-1.6" fill="#F5F5F7">Shipped, not mocked up.</text>''']
    for i, (name, path) in enumerate(items):
        x = PAD + i * (pw + gap); y = top + (0 if i % 2 == 0 else 34); d = 5 + i * 0.6
        out.append(f'''<g transform="translate({x:.1f} {y})"><g>
  <animateTransform attributeName="transform" type="translate" values="0 0;0 -14;0 0" dur="{d:.1f}s" begin="-{i * 0.9:.1f}s" repeatCount="indefinite" calcMode="spline" keyTimes="0;.5;1" keySplines=".4 0 .6 1;.4 0 .6 1"/>
  <rect x="-5" y="-5" width="{pw + 10}" height="{ph + 10}" rx="{round(pw * .13) + 5}" fill="#0B0F18" stroke="#FFFFFF" stroke-opacity=".28" stroke-width="2"/>
  <image href="{uri(path, round(pw * 1.5), round(ph * 1.5))}" width="{pw}" height="{ph}" clip-path="url(#ph)" preserveAspectRatio="xMidYMin slice"/>
  <rect width="{pw}" height="{ph}" rx="{round(pw * .13)}" fill="none" stroke="#FFFFFF" stroke-opacity=".12"/>
</g>
<text x="{pw / 2}" y="{ph + 62 + (34 if i % 2 == 0 else 0)}" text-anchor="middle" font-family="{FONT}" font-size="{size}" font-weight="800" fill="#F5F5F7">{name}</text></g>''')
    out.append('</svg>')
    return '\n'.join(out)

open('assets/showreel-w.svg', 'w', encoding='utf8').write(build(1600, 64, shots[:5], 236, 500, 190, 30))
pick = [shots[0], shots[1], shots[3]] if len(shots) > 3 else shots[:3]
open('assets/showreel.svg', 'w', encoding='utf8').write(build(900, 52, pick, 236, 500, 210, 32))
