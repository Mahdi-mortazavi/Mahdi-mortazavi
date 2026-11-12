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
