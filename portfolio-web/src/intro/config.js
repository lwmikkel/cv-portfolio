// Everything you may want to change in the intro lives in this file:
// contact details, texts, and the two layouts (desktop 1280x800, phone 390x880).
//
// Coordinates are "stage pixels": the stage is a fixed-size box (1280x800 or 390x880)
// that GuideIntro scales to fit the screen, so these numbers never depend on the window size.

export const DEFAULT_CONTACT = {
  name: 'Mikkel Wilquin',
  tagline: 'Software student · AAU Copenhagen',
  email: 'Mikkel@wilquin.dk',
  phone: { text: '+45 93 92 70 56', href: 'tel:+4593927056' },
  linkedin: {
    text: 'linkedin.com/in/mikkel-wilquin-742a66248',
    short: 'in/mikkel-wilquin-742a66248', // shown on phones, where the answer card is narrow
    href: 'https://www.linkedin.com/in/mikkel-wilquin-742a66248',
  },
  github: { text: 'github.com/lwmikkel', href: 'https://github.com/lwmikkel' },
}

// What the visitor "types", what the robot says, and what the answer card shows.
export const COMMANDS = {
  site: { text: 'Open the website', say1: 'On it, opening the website!', say2: 'Here you go, come on in!', title: 'Website', val: 'Opening now…' },
  linkedin: { text: 'LinkedIn', say1: 'Okay, fetching LinkedIn!', say2: 'Here you go!', title: 'LinkedIn', action: 'Open LinkedIn' },
  github: { text: 'GitHub', say1: 'Okay, fetching GitHub!', say2: 'Here you go!', title: 'GitHub', action: 'Open GitHub' },
  email: { text: 'Email', say1: 'Okay, fetching the email!', say2: 'Here you go!', title: 'Email', action: 'Copy' },
  phone: { text: 'Phone', say1: 'Okay, finding the number!', say2: 'Here you go!', title: 'Phone', action: 'Copy' },
}
export const CHIP_ORDER = ['site', 'linkedin', 'github', 'email', 'phone'] // the row of buttons
export const TILE_ORDER = ['email', 'phone', 'linkedin', 'github'] // the four logos (left to right)
export const TILE_LABEL = { email: 'Email', phone: 'Phone', linkedin: 'LinkedIn', github: 'GitHub' }

export const COPY = {
  greeting: "Hi! I'm Mikkel's AI guide. Pick a topic below.",
  choose: 'Choose:',
  copied: 'Copied!', // shown on the Copy button for a moment after it was pressed
  placeholder: "Pick a topic above or tap a logo — I'll send it for you",
  placeholderMobile: 'Pick a topic or tap a logo',
}

// Where the main button of your front page sits in the 1280x800 screenshot (page pixels).
// The robot's cursor clicks exactly there. Change it if you move the button.
export const SITE_BUTTON = { x: 158, y: 566 }

// Idle wandering and walking (seconds). The wandering loops forever until the visitor picks something.
export const WALK = { lead: 1.2, move: 2.4, pause: 1.1, step: 0.6, speed: 230 }

const FRAME_BAR = 22 // height of the little browser bar above the screen
export const ROBOT_UNITS_HIGH = 4.13 // height of the 3D model in model units

export function makeLayout(kind) {
  const mobile = kind === 'mobile'
  const L = mobile
    ? {
        key: 'mobile', mobile: true, W: 390, H: 880, px: 34,
        head: { x: 24, y: 28, title: 32, tag: 14 },
        screen: { x: 41, y: 126, s: 0.24 },
        stand: false,
        tile: { size: 76, y: 338, cx: { email: 62, phone: 151, linkedin: 239, github: 328 }, label: 12.5, img: 40, radius: 18, shadowY: 456, shadowW: 60 },
        feetY: 634,
        wp: [[195, 634], [130, 640], [110, 630], [160, 642], [240, 636], [280, 640], [262, 630], [195, 642], [195, 634]],
        standMin: 104, standMax: 286, // keeps the speech bubble inside the screen
        floor: { glow: [470, 220], dots: [500, 170] },
        chat: { x: 24, w: 342, top: 646, am: 40 },
        chips: { top: 750, fs: 12.5, label: false },
        input: { x: 24, top: 824, w: 342, h: 48, fs: 15, left: 46 },
        siteStand: [118, 634],
        say: { fs: 12.5, wrap: 190 },
        card: { fs: 14, title: 11, btn: 12 },
        user: { fs: 14 },
      }
    : {
        key: 'desktop', mobile: false, W: 1280, H: 800, px: 50,
        head: { x: 56, y: 56, title: 44, tag: 16 },
        screen: { x: 397, y: 102, s: 0.38 },
        stand: true,
        tile: { size: 108, y: 166, cx: { email: 150, phone: 290, linkedin: 990, github: 1130 }, label: 13, img: 58, radius: 22, shadowY: 452, shadowW: 96 },
        feetY: 530,
        wp: [[640, 535], [470, 545], [300, 530], [520, 550], [780, 538], [980, 548], [1120, 532], [880, 545], [640, 535]],
        standMin: 0, standMax: 1280,
        floor: { glow: [420, 200], dots: [450, 150] },
        chat: { x: 320, w: 640, top: 566, am: 42, row: true }, // am = where the answer card starts inside the chat area; row = your message and the answer sit on the same line
        chips: { top: 684, fs: 13, label: true },
        input: { x: 320, top: 728, w: 640, h: 50, fs: 16, left: 52 },
        siteStand: [470, 540],
        say: { fs: 13, wrap: 0 },
        card: { fs: 15, title: 12, btn: 13 },
        user: { fs: 15 },
      }

  // ---- derived values (no need to edit) ----
  const sc = L.screen
  sc.w = 1280 * sc.s
  sc.h = 800 * sc.s
  L.frame = { x: sc.x, y: sc.y - FRAME_BAR, w: sc.w, h: sc.h + FRAME_BAR, bar: FRAME_BAR, radius: mobile ? 12 : 16 }
  L.bubbleBottom = Math.round(ROBOT_UNITS_HIGH * L.px + 26) // the speech bubble sits above the antenna
  // where the zoom ends: the page fills the stage (on a phone it fills the height and is centred)
  if (mobile) {
    const es = L.H / 800
    L.siteEnd = { x: (L.W - 1280 * es) / 2, y: 0, s: es }
  } else {
    L.siteEnd = { x: 0, y: 0, s: 1 }
  }
  L.walk = { ...WALK, loop: WALK.lead + (L.wp.length - 1) * (WALK.move + WALK.pause) }

  // where the robot stands and what it points at, per command
  const tileCy = L.tile.y + L.tile.size / 2
  L.cmd = { site: { stand: L.siteStand, point: [sc.x + SITE_BUTTON.x * sc.s, sc.y + SITE_BUTTON.y * sc.s] } }
  for (const k of TILE_ORDER) {
    const cx = L.tile.cx[k]
    L.cmd[k] = { stand: [Math.min(L.standMax, Math.max(L.standMin, cx)), L.feetY], point: [cx, tileCy] }
  }
  return L
}
