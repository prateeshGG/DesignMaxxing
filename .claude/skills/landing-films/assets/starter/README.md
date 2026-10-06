# Film starter kit

A copy of the film engine from the DesignMaxxing repo, so the skill works in any project.

1. Copy this folder into your project, for example as `films/`.
2. `npm install` (installs Playwright), and install ffmpeg and Google Chrome or Playwright's Chromium.
3. Fonts are local in `fonts/` (see `fonts/LICENSE.txt`); `film.css` loads them.
4. `hero-silk.html` is a complete self-contained film (the seamless line loop): `node render.mjs hero-silk stills 0,6` then `node render.mjs hero-silk video`.
5. `reference-how-it-works.html` is the full quality-bar film (rooms, camera, callouts). It needs section crops in `src/`; use it as the model for new films.
6. Sound: `audio/vo.mjs` (voice clips, `--clips` mode for clips made with the Fish Audio connector) and `audio/mux.mjs` (voice over licensed music). Start from `audio/example.cues.json`.

Outputs go to `out/`. Read the skill's SKILL.md and references/ before building.
