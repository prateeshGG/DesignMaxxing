# DesignMaxxing film style guide

Taken from the grammar of the Maydit films the founder shared (showreel, Chariot, Dualite, Sathi and three service loops; frames reviewed every 1.5–2.5 s). **We take their grammar, never their content, logos, art or characters.** Our films show DesignMaxxing's own UI with real section screenshots inside cards.

## What the references do (summary)
- One idea per shot, 1.5–4 s, full-bleed field.
- Product UI is large and crisp. Exactly one thing animates at a time (typing, a cursor click, a chart drawing, a counter, a tab switch, a card changing colour).
- Containers morph into the next shot instead of cutting (pill → graph → pill → card).
- Two layers: an art layer behind (painting, engraving, photo, pattern) and a soft floating card in front.
- Transitions: hard cuts on the beat, pixel-mosaic dissolves, a background colour swap behind a fixed card, pull-outs into a wall.
- Calm depth: blurred copies, gentle push-ins, no spinning 3D.
- Type: serif statements revealed word by word, small mono labels, very little copy. Texture: grain, glyph rows, dot and diamond patterns.

## Our rules
| Topic | Rule |
|---|---|
| Canvas | 1440×900 stage, exported at 1280×800, 30 fps, H.264 MP4 plus VP9 WebM, muted, loops seamlessly (except the scroll film) |
| Palette | cream `#faf8f3`, soft lime `#eef5cf`, lilac `#ece8ff`, peach `#ffeadb`, soft blue `#e6ebff`, navy `#0b1424` (closing only). Accents: blue `#2f55ff`, lime `#dcf36b`. Ink `#0a0b0d` only for text, never for big fills or buttons |
| One field per film | How it works: cream → lime → peach (the colour swap marks each act). Compare: lilac. Devices: peach. Motion: soft blue. Closing: navy |
| Art layer (code only) | Engraving-style contour lines with cross-hatching, masked into a soft corner blob; pattern fields (dots, diamonds, plus, bracket glyphs) drifting slowly; silk lines; pixel-mosaic dissolves. No external images |
| Cards | White, 18–22 px radius, hairline border `rgba(10,11,13,.06)`, layered soft shadow tinted with the field colour. Real screenshots sit inside, `object-fit: cover`, top-anchored |
| Bars and inputs | White, 22 px radius, soft blue border, soft blue-tinted shadow, blue icon. No black fills |
| Labels | Pills: white with soft shadow, mono 12–14 px; one blue or lime pill per shot at most |
| Type | Bricolage Grotesque (display), Geist (UI), Geist Mono (labels), Instrument Serif (statements) |
| Motion | `inOut` cubic for moves, `back` for pills and pops, 0.3–0.45 s staggers. Push-ins ≤ 3 %. One focal action at a time |
| Cursor | Small black arrow with white outline; a blue ring ripples on click |
| Never | Explain how sections are collected; spin 3D; centred-text-on-gradient filler; copy any reference's layout, logo or artwork |

## Films
| File | Length | Used for |
|---|---|---|
| `how-it-works.html` | 16 s, scroll-driven | Isolate → Search → Study (the page scrubs it with scroll) |
| `compare.html` | 12 s loop | Example row 1 |
| `motion.html` | 10 s loop | Example row 2 |
| `devices.html` | 10 s loop | Example row 3 |
| `closing.html` | 14 s loop | Closing section backdrop |

Render: `node render.mjs <film> stills 0,2.5` or `node render.mjs <film> video 30` (outputs in `out/`). Preview live: open `<film>.html?play` in a browser; `?t=4.2` freezes a frame.
