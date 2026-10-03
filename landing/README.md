# Landing page — working folder

**Status: v0 (Linear-like, dark) rejected by the founder ("copied Linear, not as good"). Direction chosen: light, editorial, motion-first, with original fictional specimen sites. v1 reviewed (near, but footer/CTA/FAQ/how-it-works/mobile rejected). v2 reviewed (lagged; explained collection; nav/markers copied). **v3 built** with Flute videos, a lighter scroll story and a redesigned nav, FAQ, closing section and footer; awaiting feedback. More references coming.** Product name: **DesignMaxxing** (the repo name).

- `references/` — design reference screenshots supplied by the founder (batch 1: five desktop screenshots; batch 2: four desktop + one low-resolution mobile full-page capture; batch 3: five 390-wide mobile viewport screenshots — all of Linear's marketing site; batch 4: five desktop screenshots of a *different* site, a light video-led design-studio portfolio; batch 6: five desktop screenshots of Stripe's site, `stripe-01…05`). More batches will be added.
- `prototype/landing-v0.html` — **first-look prototype** (static page, dark, built from batches 1–3). Previewed as a private artifact; **not the production landing page**. The production page will be built in Next.js (docs/20 F-35) as Part 8.1/6.x. The waitlist forms are UI only: nothing is sent or stored yet.
- `prototype/landing-v1.html` — **v1 prototype** (light, editorial; animated "cut → pick → library → search" stage built from original fictional specimen sites; scripted FAQ ask-box). Published as a private artifact. The waitlist form and the ask-box are UI only: nothing is sent or stored, and the ask-box answers from a fixed FAQ list, not a live AI.
- `prototype/landing-v2.html` + `prototype/img/` — **v2 prototype**: real section crops (Stripe, Linear, one studio site) with a silk-line hero, sticky scroll story, looping recordings and a pointer-reactive burst. Third-party images: private prototype only; see `design-notes.md` (Prototype v2 decisions) and docs/20 F-44.
- `prototype/landing-v3.html` + `prototype/video/` — **v3 prototype**; the videos are made in `motion/` (Flute scenes and a rendered background loop, see `motion/README.md`).
- `films/` — **code-made motion films** (v4 direction): a small deterministic film engine, five films, the style guide (`films/style-guide.md`, grammar taken from Maydit's films) and the storyboard review page (`films/storyboard.html`). Render with `node films/render.mjs <film> video`.
- `design-notes.md` — measured/observed design properties and the principles we take from the references.

**Rules for references**
1. They are **third-party copyrighted work**, kept here only as private internal inspiration. The repository is **private** (verified); **remove `references/` before the repository is ever made public.**
2. We take **principles** (layout, typography, restraint, motion), never another company's copy, logos, illustrations or assets.
3. Build starts only after the founder confirms all reference batches are in.

Landing-page requirements come from the plan, not the references: waitlist capture, a short demo, and the price-intent question (docs/20, experiment E1; Part 8.1 in docs/21).
