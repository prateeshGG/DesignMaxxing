---
name: landing-films
description: Make publish-quality motion-graphics films for landing pages in code (no AI video models), from real product or website screenshots. Covers studying reference films, sharp screenshot capture, style guide, storyboard, a deterministic HTML film engine with a virtual camera, hand-drawn callouts, rendering to MP4/WebM, sound design and voiceover. Use whenever someone wants a product video, feature film, showreel, hero loop, animated explainer or "video like this reference" for a website, or asks to improve one that looks cheap.
---

# Landing films

Films are deterministic web pages: `window.seek(t)` places every element for second `t`. A headless browser captures each frame at 2x and ffmpeg encodes them. This repo already has a working engine and five films in `landing/films/`; reuse them, do not start from scratch.

## Files in this repo
| Path | What it is |
|---|---|
| `landing/films/engine.js` | Engine: easing, springs, keyframe tracks, virtual camera + directional motion blur, masked text reveals, sheens, code-made art (engraving lines, pattern fields, silk lines, pixel dissolves), cursor and click, hand-drawn callouts |
| `landing/films/film.css` | Shared look and **local** font files (`landing/films/fonts/`) |
| `landing/films/how-it-works.html` | Reference film at the quality bar (rooms, camera, callouts) |
| `landing/films/render.mjs` | `node render.mjs <film> stills 0,2.5` or `node render.mjs <film> video 30` |
| `landing/films/audio/` | `sfx.mjs` (synthesised sound design from a cues file), `vo.mjs` (Fish Audio voiceover), `mux.mjs` (mix and attach) |
| `landing/films/style-guide.md` | The style rules derived from the founder's references |
| `.claude/skills/landing-films/scripts/` | `capture.mjs` (sharp capture) and `crop.py` (crop by DOM bounds) |

## Workflow
1. **Study the reference.** Download it and pull a frame every 1.5–2.5 s into a contact sheet. Write down the grammar: shot length, what animates, transitions, camera, type, art layer and texture. Take the grammar, never the content, logos or artwork. See `references/grammar.md`.
2. **Capture sharp sources.** Never upscale low-resolution screenshots; capture again. Run `scripts/capture.mjs` at device scale 2 (3 for phones). It saves an animated pass and a reduced-motion pass (frozen counters, no half-finished reveals), plus section boxes measured from the DOM. Crop with `scripts/crop.py` using those boxes. Choose per section: reduced motion can blank out background videos (posters only), and some UI looks wrong frozen (for example nav buttons). Patch strips from the other pass when needed. Check `robots.txt` first and credit every site. Details in `references/capture.md`.
3. **Style guide.** One field colour per film, an art layer drawn in code, white cards with soft tinted shadows, no solid black fills, and one focal action at a time.
4. **Storyboard before rendering.** A beat grid (time → what happens → transition) and 6–10 stills rendered from the real timeline (`render.mjs stills`). Get the founder's comments first.
5. **Build the film** (see `references/motion.md`): lay scenes out as rooms on a wide world plane and move a camera between them. Use push-ins on details, expo pull-backs, a whip pan with motion blur, match cuts, springs with overshoot, masked text reveals and light sweeps. Use hand-drawn callouts for annotations.
6. **QA pass.** Every item must hold before publishing:
   - Fonts loaded. Headless Chromium here cannot reach Google Fonts, so use local files only.
   - No clipped or half-animated source content: counters, reveals, sections cut through the middle.
   - Labels sit in empty space and never cover content; a line runs from each label to its target.
   - Blur appears only on fast moves, and holds are crisp. Check frames pulled from the encoded file, not only stills.
   - No camera framing that shows past the edge of the world.
   - Loops are seamless where the film loops.
   - File size is under about 10 MB for 20 s at 1920×1200 (H.264 CRF 22 plus VP9 CRF 33).
7. **Sound** (see `references/audio.md`): write a cues file timed to the beats, synthesise UI sounds and a soft pad, and add a voiceover when there is TTS credit. Ship a silent file for autoplay and a "-sound" file behind an unmute button.
8. **Ship.** Put the silent MP4 and WebM in the page with `muted autoplay loop playsinline`, play only while visible, and add a sound toggle that swaps to the "-sound" file. Commit the film sources, not the `out/` renders.

## Hard rules
- Never describe on a public page how the library is collected (no capture, crawler or quality-gate talk).
- No solid black buttons or bars; soft surfaces with soft shadows.
- Credit sources (site names) on screen or in the caption; no third-party logos presented as customers.
- Secrets such as a TTS API key come from environment variables only. Never write them into the repository or into a page.
