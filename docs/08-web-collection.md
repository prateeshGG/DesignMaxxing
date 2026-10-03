# 08 — Web Collection

Part of the [engineering docs](README.md). Prev: [07](07-search-and-retrieval-architecture.md). Next: [09 iOS/Android collection](09-ios-android-collection.md). Workflow frame: [03](03-capture-and-crawling-workflow.md). Phase: websites are **V0**; responsive extras, technology detection and animation viewer are **V1** ([18](18-mvp-v1-v2-v3-roadmap.md)).

Internal collection only; not a user-facing crawler ([01](01-product-context.md)).

## Three levels (§9)

| Level | What | Cost |
|---|---|---|
| 1 — HTTP discovery | `URL → HTTP → HTML → links → metadata` to find candidate URLs | cheap |
| 2 — Browser rendering | Chromium/Playwright: `URL → browser → render → wait → capture` | moderate |
| 3 — Interaction exploration | detect interactive elements → rank → execute → wait for stability → capture → compare state → repeat | expensive; only for pages that warrant it |

## Playwright / Chromium workflow

Collected at Level 2: DOM, CSS, viewport, screenshots, network metadata, console errors, navigation, links, assets. Browser workers are **disposable** — a crash destroys the worker and a new one resumes from the checkpoint; "never make one browser session responsible for the entire crawl" (§50, [14](14-failure-recovery-and-reliability.md)). Wait/stability criteria ("wait", "wait for stability") are **Not decided**.

## Responsive capture (§12)

Initial profiles:

| Profile | Viewport |
|---|---|
| Desktop | 1440 × 900 |
| Tablet | 1024 × 1366 |
| Mobile | 390 × 844 |

"Later add more profiles", but "don't blindly crawl every site at every size":

```
desktop → baseline
mobile  → baseline
tablet  → conditional
```

Extra captures are added when meaningful differences are detected. How "meaningful difference" is measured is **Not decided**. [V0] covers full-page screenshots; "responsive capture" is listed under [V1] — so the V0 viewport set is **Not decided** (**Inferred:** desktop only or desktop + mobile baseline). The Feature List also names a "Laptop" profile and breakpoint detection; neither is in the Blueprint.

## Page vs section capture (§10–11)

Do not assume 1 URL = 1 screen. Store both:

```
Page
├── full_page.png
├── section_hero.png
├── section_features.png
├── section_pricing.png
└── section_footer.png
```

Section detection combines DOM structure + visual segmentation + semantic analysis + OCR ([06](06-intelligence-pipeline.md)). Each section gets its own canonical capture. [V0]

## Media collection (§13)

Automatic. The collector identifies `<img>`, `<video>`, `<source>`, `<picture>`, `<svg>`, `<canvas>`, `background-image`, CSS animations, Lottie, WebGL/canvas, GIF, WebP animation, APNG.

Per item an `Asset`: `type, source_url, mime, width, height, duration, animated, hash, storage_key`. Assets are stored content-addressed ([04](04-raw-evidence-and-storage.md)).

### Animated media — three representations (§14)

`original`, `poster`, `normalized_video` — e.g. `hero-animation.json`, `hero-animation-poster.webp`, `hero-animation.mp4`. The frontend uses whichever fits. Applies to GIF, WebP/APNG, Lottie, animated SVG, canvas/WebGL. How canvas/WebGL is captured (screen recording of the render) is **Inferred** — the Blueprint says only "capture frames/encode video" for animated SVG and lists WebGL/canvas as detected media.

### SVG (§15)

Store `original.svg` + `normalized.svg` + `preview.png`. Extract `viewBox, width, height, fill, stroke, animation, embedded assets`. Animated SVG: `detect animation → render → capture frames → encode video`.

### Lottie (§16)

Detect the JSON; store `original.json`, poster, video, metadata. Extract frame count, fps, duration, dimensions, layers.

### Video (§17)

`source → metadata → thumbnail → poster → normalized preview`. Potentially classify role: background video, hero video, product demo, UI animation, advertisement (marked "potentially" — not committed). Streaming formats (M3U8, listed in the Feature List) are **Not decided** in the Blueprint.

### GIF / WebP / APNG

Treated as animated media under the three-representation rule. Format-specific frame extraction details: **Not decided**.

## Animation detection

CSS animations and media-based animation are detected in V0 (§68 "animation detection"); the **animation viewer** is V1 (§69). Scroll animation, parallax, hover animation etc. (Feature List G) require interaction/scroll capture — mechanism **Not decided**.

## Technology detection (§18)

Enrichment, **not mandatory**. Evidence: HTML, headers, scripts, bundles, DOM, network, known signatures, metadata. Output: `name, category, confidence, evidence, detected_at`; uncertain → `unknown`; never hallucinate. Example evidence for Next.js: `__NEXT_DATA__`, `/_next/`. Runs in `technology-detector`; results stored as `Technology` + `TechnologyEvidence`. The user's question whether this is hard (frameworks like Next.js, React, Tailwind, Webflow, Shopify, WordPress…) was answered in a message not preserved in the export; the Blueprint's resolution is "evidence-based, with confidence, and optional." [V1]

## Authenticated websites (§24)

Many target products are behind login. The web engine reaches `LOGIN_REQUIRED` → job `WAITING_FOR_AUTH` → operator provides an authorized session/test account → collector resumes. The exploration engine is never responsible for bypassing authentication. Full workflow and dangerous-action policy: [10](10-authentication-and-permission-workflows.md). Phase for authenticated web collection: **Not decided** (V0 is "website URLs"; `WEB_APP` is a Source type).

## Outputs

RawArtifacts (`SCREENSHOT, HTML, DOM, NETWORK_METADATA, ASSET, LOG, TRACE`, …) per [04](04-raw-evidence-and-storage.md), then events such as `screen.captured` and `crawl.completed` ([12](12-data-model-and-events.md)).
