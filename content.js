// ============================================================
//  FLAME488 PORTFOLIO — CONTENT CONFIGURATION
//  Edit this file (or use admin.html) to update the site.
// ============================================================

const PORTFOLIO_CONTENT = {

  // ── META ────────────────────────────────────────────────
  meta: {
    siteTitle:    "Flame488",
    tabTitle:     "Flame488 — 3D Animator & Designer",
    description:  "A 3D animator specializing in Minecraft-themed content, as well as a designer and 3D modeler.",
    ogImage:      "assets/images/card500b.jpg",
    accentColor:  "#FF4500",
  },

  // ── HERO ────────────────────────────────────────────────
  hero: {
    name:       "Flame488",
    tagline:    "3D Animator · Designer · Modeler",
    bio:        "A 3D animator specializing in Minecraft-themed content, as well as a designer and 3D modeler.",
    heroImage:  "assets/images/image01.jpg",
    quickLinks: [
      { label: "Gallery",      href: "gallery.html",      icon: "gallery" },
      { label: "Commissions",  href: "commissions.html",  icon: "cart"    },
    ],
  },

  // ── SOCIAL LINKS ────────────────────────────────────────
  socials: [
    { platform: "YouTube",   url: "https://youtube.com/@the_flamey_488",     icon: "youtube"   },
    { platform: "Discord",   url: "https://discord.gg/YMw9UA356s",           icon: "discord"   },
    { platform: "Instagram", url: "https://www.instagram.com/flame_anims48", icon: "instagram" },
  ],

  // ── OC / RIG ────────────────────────────────────────────
  oc: {
    heading:          "Zack Almond Reynalds",
    subheading:       "Original Character — Rig & Model",
    // Teaser: short blurb shown on the homepage preview card
    teaser:           "An original character with a fully custom rig. Available on request via DM.",
    image:            "assets/images/image02.jpg",
    body:             "Rig/Model will **only** be given via **Discord** or **Instagram DM**.\nFor more information about the OC, visit the character info page.",
    characterInfoUrl: "characterinfo.html",
    badge:            "Available on Request",
  },

  // ── COMMISSIONS ─────────────────────────────────────────
  commissions: {
    heading:    "Commissions",
    subheading: "Open for Work",
    // Status shown on the homepage teaser card
    // statusOpen: true = green "Open" pill, false = red "Closed" pill
    statusOpen: true,
    statusNote: "Currently accepting orders. Slots are limited — DM to reserve yours.",
    image:      "assets/images/image03.jpg",
    intro:      "Thank you for your interest in my commissions. Here's everything you need to place an order.",

    services: [
      { name: "Half-body / Head only",  price: "$3", note: ""                               },
      { name: "Full body render",        price: "$6", note: "+$1 per extra character"        },
      { name: "Group Render / Scene",    price: "$5", note: "+$1 per extra character"        },
      { name: "Custom Model",           price: "$4", note: "Price may grow with complexity" },
    ],

    process: [
      "**Contact** — DM me with details about your project.",
      "**Details** — We'll discuss ideas, deadlines, and pricing.",
      "**Payment** — 50% deposit to start. Remainder on delivery. PayPal or Robux (at cash value).",
      "**Delivery** — Progress updates throughout, final product in your chosen format.",
    ],

    tos: [
      "I reserve the right to decline any request I'm uncomfortable with.",
      "Commissions are for personal use only unless agreed otherwise (commercial use incurs extra fees).",
      "No refunds once the project has started.",
      "Deadlines are negotiable — rushed orders may incur extra fees.",
    ],

    contact: {
      discord:   "flame488",
      instagram: "flame_anims48",
    },
  },

  // ── GALLERY ─────────────────────────────────────────────
  // category: "mywork" | "scraped" | "spoiler"
  // src: image path OR a YouTube URL (auto-detected)
  // spoiler: true — blurs until hover
  gallery: [
    { title: "HellAway — Curse of a Broken World", src: "assets/images/image04.png", category: "mywork",  spoiler: false },
    { title: "REDACTED // SPOILER",                src: "assets/images/image02.jpg", category: "spoiler", spoiler: true  },
    { title: "Coming Soon — HellAway",             src: "assets/images/image03.jpg", category: "mywork",  spoiler: false },
    { title: "Character Showcase",                 src: "assets/images/image01.jpg", category: "scraped", spoiler: false },
  ],


  // ── CHARACTER INFO ──────────────────────────────────────
  characterInfo: {
    // Identity card
    name:    "Zack Almond Reynalds",
    alias:   "// Flame488",
    bio:     "Serious by default — always alert, always ready. Flip the switch around friends and he's a completely different person. Relaxed. Smiling. Still dangerous.",
    tags: [
      { label: "Age 19",     style: "default" },
      { label: "Plasma",     style: "energy"  },
      { label: "Fire Spear", style: "weapon"  },
    ],
    privateVersion: "2.5.6",
    latestVersion:  "V5",
    versionNote:    "unreleased",

    // Arsenal
    arsenal: {
      offense: [
        { name: "Plasma Balls",    note: "Close-burst explosives. Fast, loud, effective."          },
        { name: "Plasma Beams",    note: "Concentrated. Long reach. Don't stand in the line."       },
        { name: "Energy Spikes",   note: "Erupts from the ground. Zone denial."                    },
        { name: "Energy Weapons",  note: "Constructs blades, bludgeons — anything, on demand."     },
      ],
      defense: [
        { name: "Energy Barriers", note: "Plasma walls. Not forever, but long enough."             },
        { name: "Energy Shields",  note: "Portable. Personal. Absorbs impact."                     },
        { name: "Hardened Fists",  note: "Glowing knuckles — stops swords cold. Costs energy."    },
      ],
      mobility: [
        { name: "Energy Dash",     note: "Short burst. Close gaps. Dodge anything."                },
        { name: "Teleport",        note: "Instant. Short range. Hungry for energy."                },
      ],
    },

    // Forms
    forms: [
      {
        id:    "blue",
        title: "FULL POWER",
        desc:  "Peak control. Every ability firing clean. This is Zack at his most precise — efficient, surgical, overwhelming.",
        warning: "",
      },
      {
        id:    "dark",
        title: "DARK FORM",
        desc:  "Raw destructive force. Less finesse, more devastation. He'll win — but something's going to break.",
        warning: "",
      },
      {
        id:    "corrupted",
        title: "CORRUPTED FORM",
        desc:  "Unstable. Chaotic. Powers act on their own. Nobody — not even Zack — knows what happens next.",
        warning: "⚠ UNPREDICTABLE",
      },
    ],

    // Threat profile stats (0–100)
    stats: [
      { label: "Destructive Output", value: 95, gradient: "linear-gradient(90deg,#4a9eff,#9966ff)" },
      { label: "Alertness",          value: 88, gradient: "linear-gradient(90deg,#3a9a3a,#4aef88)" },
      { label: "Speed",              value: 75, gradient: "linear-gradient(90deg,#4a9eff,#44ccff)" },
      { label: "Strength",           value: 70, gradient: "linear-gradient(90deg,#4a9eff,#44ccff)" },
    ],

    // Showcase images shown as a horizontal slider on the static character sheet
    // Add as many paths/URLs as you like; remove array entirely or leave empty to hide slider
    images: [
      // "assets/images/your-image.jpg",
    ],

    // Known exploits / vulnerabilities
    exploits: [
      { tag: "Human Body",  note: "No superhuman durability without active energy cost." },
      { tag: "Rage State",  note: "Anger spikes power but kills awareness. Bait it."     },
      { tag: "Stamina Cap", note: "Burn his energy fast. Wait. He drops."               },
    ],
  },

  // ── FOOTER ──────────────────────────────────────────────
  footer: {
    credit:    "Built by SpideySpidery",
    creditUrl: "https://www.youtube.com/@SpideySpidery",
    year:      "2025",
  },
};

if (typeof module !== "undefined") module.exports = PORTFOLIO_CONTENT;
