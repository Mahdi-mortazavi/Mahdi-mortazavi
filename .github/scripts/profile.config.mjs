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
    },
    {
      repo: 'angaros', name: 'Angaros', art: 'angaros',
      kicker: 'AI AGENTS · MCP SERVER',
      tagline: 'Your phone, for your AI agents: SMS, OTP codes, contacts and call log for any MCP client. End-to-end encrypted, self-hosted.',
    },
    {
      repo: 'flow', name: 'Flow', art: 'flow',
      kicker: 'FLUTTER · FOCUS & HABITS',
      tagline: 'One decision a day. An offline-first focus and habit app grounded in behavioural science.',
    },
    {
      repo: 'overrun', name: 'Overrun', art: 'overrun',
      kicker: 'REALTIME MULTIPLAYER · EDGE',
      tagline: 'A browser arena shooter that installs like an app, plays offline and takes eight players online. Zero asset files.',
    },
    {
      repo: 'sooda', name: 'Sooda', art: 'sooda',
      kicker: 'PWA · SMALL BUSINESS',
      tagline: 'Profit, price and discount calculator for small shops. Offline-first, bilingual, no backend.',
    },
    {
      repo: 'purify', name: 'purify', art: 'purify',
      kicker: 'RUST · WINDOWS DESKTOP',
      tagline: 'Clean a Windows disk with confidence: fast, private and reversible. Built with Rust and Tauri.',
    },
    {
      repo: 'app', name: 'Nava', art: 'nava',
      kicker: 'FLUTTER · INTERFACE DESIGN',
      tagline: 'The art of reduction: a minimal productivity app with squircle design, haptics and breathing motion.',
    },
  ],

  // The tab bar. Each tab is a page in this repository, so GitHub becomes a
  // small site: overview, case studies, hiring, building, Persian.
  tabs: [
    { id: 'home', label: 'Overview', href: 'https://github.com/Mahdi-mortazavi' },
    { id: 'work', label: 'Case studies', dir: 'work' },
    { id: 'hire', label: 'Hire me', dir: 'hire' },
    { id: 'build', label: 'Build with me', dir: 'build' },
    { id: 'fa', label: 'فارسی', dir: 'fa', rtl: true },
  ],

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
