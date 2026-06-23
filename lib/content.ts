export const siteCopy = {
  name: "AetherGate Flip-Board",
  tagline: "A message with weight, flap by flap.",
  subtitle: "Split-flap message studio",
  title: "AetherGate Flip-Board — Split-flap message studio",
  description:
    "Write multi-step split-flap messages with sound, music, and cinematic playback. Share a link — optionally password-protected — for the same slow reveal.",
  keywords: [
    "split-flap display",
    "flip board",
    "departure board",
    "message studio",
    "cinematic text",
    "shareable messages",
    "password protected link",
    "Vietnamese text",
  ],
} as const;

export const welcomeBoardText = `WELCOME TO
AETHERGATE

WRITE YOUR MESSAGE
ON THE LEFT — THEN
PREVIEW & SHARE`;

export const whatThisIs = {
  title: "What this is",
  paragraphs: [
    "AetherGate Flip-Board recreates the quiet theatre of classic departure boards — each letter with weight, each line arriving one flip at a time.",
    "Compose on the left: chain steps, tune flip speed and click sound, add music, and lock shared links with a password if you want. Go fullscreen to feel it in the room, or send a link that opens straight into the cinematic reveal.",
  ],
  closing: "Not a ping. Not a slide. A moment that lands, flap by flap.",
} as const;

export const dashboardCopy = {
  fullscreen: "Play fullscreen",
  shareLink: "Copy share link",
  messageSteps: "Message steps",
  boardSettings: "Board settings",
  flipSpeed: "Flip speed",
  clickSound: "Click sound",
} as const;

export const stepEditorCopy = {
  steps: (count: number) => `Steps (${count})`,
  addStep: "Add step",
  messageText: (index: number) => `Message · Step ${index + 1}`,
  placeholder:
    "Type your message here — supports Vietnamese diacritics. Press Update preview when ready.",
  updatePreview: "Update preview",
  advanceLabel: "Playback in shared view",
  holdTime: "Pause between steps",
} as const;

export const previewCopy = {
  title: "Live preview",
  stepOf: (current: number, total: number) => `Step ${current} of ${total}`,
  autoAdvance: "Auto advance",
  manualAdvance: "Manual advance",
  unsavedEdits: "Unsaved changes",
} as const;

export const shareCopy = {
  passwordProtect: "Password-protect link",
  sharePassword: "Viewer password",
  sharePasswordPlaceholder: "Password required to open the link",
  sharePasswordHint:
    "Included in the share URL as a hash — viewers enter the password before the board plays.",
  setPasswordFirst: "Enter a password before copying the link",
  linkCopied: "Share link copied to clipboard",
  linkCopyFailed: "Could not copy link — try again",
  gateTitle: "This message is locked",
  gateHeading: "Enter password",
  gateBody:
    "Someone shared a protected flip-board message with you. Enter the password to watch it unfold.",
  gatePassword: "Password",
  gatePasswordPlaceholder: "Enter password",
  gateWrongPassword: "Incorrect password. Please try again.",
  gateSubmit: "Watch message",
  gateChecking: "Checking…",
} as const;

export const footerCopy = {
  line: "© 2026 AetherGate Flip-Board · Made for messages that deserve to arrive slowly.",
  craftedBy: "Crafted by",
  author: "William Bond",
} as const;

export const musicCopy = {
  background: "Background music",
  presetsNote:
    "Royalty-free tracks by Kevin MacLeod (incompetech.com, CC BY 4.0).",
  selectTrack: "Choose a track",
  zingHint: "Search Vietnamese tracks on Zing MP3",
  searchPlaceholder: "Song or artist…",
  search: "Search",
  tapToStart: "Tap anywhere to start music",
} as const;
