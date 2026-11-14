/**
 * The one file to edit.
 * Everything the profile says about me that is NOT read live from the GitHub
 * API lives here: positioning, availability, links, the curated project list
 * and the career timeline. Change a line, push, and the workflow redraws every
 * card and rewrites the README.
 */
export default {
  user: 'Mahdi-mortazavi',
  name: 'Mahdi Mortazavi',
  nameFa: 'مهدی مرتضوی',

  // One sentence a recruiter should remember.
  tagline: 'CTO & product engineer — from first principles to shipped products.',

  // Availability. Set `open: false` to switch the green light off everywhere.
  status: {
    open: true,
    long: 'Open to remote roles · contract work · co-founding',
    short: 'Open to remote work',
  },
  zone: 'UTC+3:30 · IRAN',

  // Lines the hero cycles through.
  focus: [
    'AI agents & MCP tooling',
    'Mobile — Flutter · Kotlin · Compose',
    'Desktop — Rust · Tauri · .NET',
    'Web & edge — TypeScript · React · Workers',
  ],

  links: {
    email: 'mahdi.mortazavi.135@gmail.com',
    telegram: 'https://t.me/Mahdi_mortazavi1',
    linkedin: 'https://www.linkedin.com/in/mahdimortazavidev',
    hub: 'https://mahdi-mortazavi.github.io',
    community: 'https://t.me/Startup_legend',
  },

  // Curated, in this order. `art` picks the animated illustration.
  // The first `lead` projects are always visible; the rest sit behind a fold.
  lead: 4,
  projects: [
    {
      repo: 'relay', name: 'relay', art: 'relay',
      kicker: 'NETWORKING · ANDROID → WINDOWS',
      tagline: "Share your phone's internet with your PC over an encrypted WireGuard tunnel. No root, no server, no account.",
      points: [
        'One WireGuard tunnel carries the whole PC, TCP and UDP, so games, calls and installers all work.',
        'No server and no account: keys are created at pairing and destroyed when sharing stops.',
        'Kotlin and Compose on Android, .NET 8 and WinUI 3 on Windows, Go for the tunnel.',
      ],
    },
    {
      repo: 'angaros', name: 'Angaros', art: 'angaros',
      kicker: 'AI AGENTS · MCP SERVER',
      tagline: 'Your phone, for your AI agents: SMS, OTP codes, contacts and call log for any MCP client. End-to-end encrypted, self-hosted.',
      points: [
        'The relay only ever stores ciphertext (AES-256-GCM); the key travels by QR code and never touches it.',
        '22 typed MCP tools, a CLI, a Python SDK and a local REST API.',
        'SMS text is treated as untrusted input, and every send lands in a hash-chained audit log.',
      ],
    },
    {
      repo: 'flow', name: 'Flow', art: 'flow',
      kicker: 'FLUTTER · FOCUS & HABITS',
      tagline: 'One decision a day. An offline-first focus and habit app grounded in behavioural science.',
      points: [
        'Built around one decision a day, with a focus timer and habit tracking grounded in behavioural science.',
        'Fully offline: no account, no sync, no telemetry.',
        'Flutter and Riverpod, with a Persian-first right-to-left interface.',
      ],
    },
    {
      repo: 'overrun', name: 'Overrun', art: 'overrun',
      kicker: 'REALTIME MULTIPLAYER · EDGE',
      tagline: 'A browser arena shooter that installs like an app, plays offline and takes eight players online. Zero asset files.',
      points: [
        'Client and server run the same simulation file: 60 Hz prediction in the browser, 20 Hz authority in a Durable Object.',
        'Client-side prediction with input replay, entity interpolation and a quantised binary protocol.',
        'Every mesh, texture and sound is generated in code. There are no asset files.',
      ],
    },
    {
      repo: 'sooda', name: 'Sooda', art: 'sooda',
      kicker: 'PWA · SMALL BUSINESS',
      tagline: 'Profit, price and discount calculator for small shops. Offline-first, bilingual, no backend.',
      points: [
        'Profit, selling price and discount in both directions, for people who run a small shop.',
        'Offline-first PWA with no backend: install once and it keeps working.',
        'TypeScript and Vite, bilingual with full right-to-left support.',
      ],
    },
    {
      repo: 'purify', name: 'purify', art: 'purify',
      kicker: 'RUST · WINDOWS DESKTOP',
      tagline: 'Clean a Windows disk with confidence: fast, private and reversible. Built with Rust and Tauri.',
      points: [
        'Shows exactly what it found before it deletes anything, and every clean is reversible.',
        'Nothing is uploaded: the scan and the cleanup stay on the machine.',
        'Rust core with a Tauri interface, so it starts instantly.',
      ],
    },
    {
      repo: 'app', name: 'Nava', art: 'nava',
      kicker: 'FLUTTER · INTERFACE DESIGN',
      tagline: 'The art of reduction: a minimal productivity app with squircle design, haptics and breathing motion.',
      points: [
        'A task manager reduced to the essentials: squircle shapes, haptic feedback and breathing motion.',
        'Flutter and Dart, for Android and iOS.',
        'Bilingual, with a Persian right-to-left interface.',
      ],
    },
  ],

  // The tab bar. Each tab is a page in this repository, so GitHub becomes a
  // small site: overview, case studies, hiring, building, Persian.
  tabs: [
    { id: 'home', label: 'Overview', href: 'https://github.com/Mahdi-mortazavi' },
    { id: 'work', label: 'Case studies', dir: 'work' },
    { id: 'log', label: 'Ship log', dir: 'log' },
    { id: 'radar', label: 'Radar', dir: 'radar' },
    { id: 'hire', label: 'Hire me', dir: 'hire' },
    { id: 'build', label: 'Build with me', dir: 'build' },
    { id: 'fa', label: 'فارسی', dir: 'fa', rtl: true },
  ],

  // Radar: what the page watches for on my behalf. Everything here is a
  // filter, so tightening a line makes the page quieter, never noisier.
  radar: {
    window: 45,          // days: how new a repository must be to count as rising
    minStars: 200,       // floor for "rising in my fields"
    // A topic alone is not enough (people tag anything): the name or the
    // description must also match.
    topics: [
      { topic: 'mcp', match: 'mcp|model context protocol' },
      { topic: 'ai-agents', match: 'agent' },
      { topic: 'wireguard', match: 'wireguard' },
      { topic: 'flutter', match: 'flutter' },
      { topic: 'tauri', match: 'tauri' },
      { topic: 'cloudflare-workers', match: 'cloudflare|worker' },
    ],
    // Best of GitHub: the breakout repositories of the last `breakoutDays`
    // days, and the most-starred active projects in my own stack.
    breakoutDays: 30,
    breakoutStars: 1500,
    essentials: ['flutter', 'kotlin', 'rust', 'tauri', 'mcp', 'wireguard', 'cloudflare-workers'],
    // Never shown, wherever they come from.
    block: 'crypto|usdc|airdrop|token sale|casino|betting|nsfw|porn|cheat|crack|jailbreak',
    // Stars I gave: only established projects in the languages I work in.
    starred: {
      minStars: 100,
      langs: ['Kotlin', 'Dart', 'Rust', 'TypeScript', 'JavaScript', 'Python', 'Go', 'C#', 'Swift'],
      hide: ['thecynetx/CyDrive', 'caamer20/Telegram-Drive'],
    },
    // Hacker News: specific terms only, and only stories that got traction.
    hnPoints: 100,
    keywords: ['MCP', 'Model Context Protocol', 'AI agent', 'AI agents', 'agentic', 'LLM', 'LLMs', 'WireGuard', 'Flutter', 'Tauri',
      'Cloudflare Workers', 'Durable Objects', 'self-hosted', 'local-first', 'offline-first', 'PWA', 'Jetpack Compose'],
  },

  // Architecture diagrams for the case studies in work/README.md.
  studies: [
    {
      id: 'relay', kicker: 'RELAY · DATA PATH', both: true,
      alt: 'How relay works: the phone runs a WireGuard endpoint, the PC runs a WireGuard client, and every app on the PC goes through the encrypted tunnel',
      nodes: [
        { title: 'Android phone', lines: ['WIREGUARD ENDPOINT', 'Kotlin · Compose · Go'] },
        { title: 'Windows PC', lines: ['WIREGUARD CLIENT', '.NET 8 · WinUI 3 · Go'] },
        { title: 'Every app', lines: ['WHOLE SYSTEM', 'TCP and UDP, no leaks'] },
      ],
      links: ['encrypted tunnel', 'system route'],
      note: 'No server in the middle. Keys are made at pairing and destroyed when sharing stops.',
    },
    {
      id: 'angaros', kicker: 'ANGAROS · ZERO-KNOWLEDGE RELAY', both: true,
      alt: 'How Angaros works: the phone seals messages with AES-256-GCM, a self-hosted Cloudflare relay stores only ciphertext, and the computer exposes them to AI agents as MCP tools',
      nodes: [
        { title: 'Android phone', lines: ['SMS · CALLS', 'seals everything'] },
        { title: 'Your relay', lines: ['WORKER + D1', 'ciphertext only'] },
        { title: 'Your computer', lines: ['SQLITE + FTS', 'MCP · CLI · SDK'] },
        { title: 'AI agents', lines: ['22 MCP TOOLS', 'any MCP client'] },
      ],
      links: ['AES-GCM', 'long-poll', 'MCP'],
      note: 'Both ends poll out over HTTPS, so there are no inbound connections and nothing to open.',
    },
    {
      id: 'overrun', kicker: 'OVERRUN · ONE SIMULATION, TWO CLOCKS', both: true,
      alt: 'How Overrun works: the browser predicts the local player at 60 Hz while a Cloudflare Durable Object runs the same simulation at 20 Hz as the authority',
      nodes: [
        { title: 'Browser · PWA · APK', lines: ['SIM @ 60 HZ', 'predicts you instantly'] },
        { title: 'Durable Object', lines: ['SAME SIM @ 20 HZ', 'sole authority per match'] },
      ],
      links: ['quantised binary WebSocket'],
      note: 'Client and server run the same file, so prediction cannot drift from the authority.',
    },
  ],

  // Career timeline. `{stars:relay}` becomes that repository's live star count.
  journey: [
    { when: '2023', title: 'Senagh', role: 'CTO & Head of Product',
      text: 'AI-agent assistant for real-estate agents. I own architecture and product.' },
    { when: '2025', title: 'Open source', role: 'First public release',
      text: 'Started shipping my tools in the open, bilingual and free.' },
    { when: '2026', title: 'relay', role: '{stars:relay} stars',
      text: 'Reverse tethering over WireGuard, used on real devices every day.' },
    { when: 'NOW', title: 'Zista Health', role: 'Co-founder & CTO',
      text: 'AI-powered remote patient monitoring, from the wearable to the apps.' },
  ],
};
