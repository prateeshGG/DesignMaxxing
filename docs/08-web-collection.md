# 08 — Web Collection

Part of the [engineering docs](README.md). Prev: [07](07-search-and-retrieval-architecture.md). Next: [09 iOS/Android collection](09-ios-android-collection.md). Workflow frame: [03](03-capture-and-crawling-workflow.md). Phase: websites are **V0**; responsive extras, technology detection and animation viewer are **V1** ([18](18-mvp-v1-v2-v3-roadmap.md)).

Internal collection only; not a user-facing crawler ([01](01-product-context.md)). Framing: a **website observation engine** — the browser observes DOM, network and browser events, and an observation engine derives structure (sections, components, elements), media (images, SVG, video, GIF, Lottie, canvas) and motion (animations, transitions, interactions) (TECH§12).

## Three levels (§9)

| Level | What | Cost |
|---|---|---|
| 1 — HTTP discovery | `URL → HTTP → HTML → links → metadata` to find candidate URLs | cheap |
| 2 — Browser rendering | Chromium/Playwright: `URL → browser → render → wait → capture` | moderate |
| 3 — Interaction exploration | detect interactive elements → rank → execute → wait for stability → capture → compare state → repeat | expensive; only for pages that warrant it |

Discovery sources and prioritization: [03](03-capture-and-crawling-workflow.md).

## Playwright / Chromium workflow

Collected at Level 2: DOM, CSS (computed styles), viewport, screenshots, accessibility tree, network metadata, console errors, navigation, links, assets, fonts, performance. Use Playwright browser-context isolation so sites/sessions don't leak into each other; worker → browser → context → page (IF§8).

**Browser worker lifecycle (MB§30):** start worker → start Chromium → create context → create page → capture → destroy page → new page → … → recycle browser. *Not* "launch Chrome per website then kill it, repeated 1,000 times" (browser startup/memory overhead). Reconciled with disposable workers (§50): a crashed browser worker is destroyed and replaced and the job resumes from checkpoint; "never make one browser session responsible for the entire crawl" ([14](14-failure-recovery-and-reliability.md)). Browser hosting: own Playwright workers (Docker, queue, autoscaling) rather than a paid browser service initially; Browserbase pricing was cited only as a benchmark (≈$20/month for 100 browser-hours, then ≈$0.12/hour — point-in-time claim, **Provisional**; MB§29).

### Deterministic capture environment (WF§9)

"Crawler correctness" is the biggest technical challenge, not screenshots: infinite scroll, lazy loading, cookie banners, popups, personalization, A/B tests, geolocation, authentication, SPA routing, canvas, WebGL, animations, hover states, carousels, accordions, modals, sticky navigation, responsive breakpoints. Make the crawler deterministic: disable ads where possible, disable randomization where possible, freeze time, set locale, timezone and viewport, optionally reduce motion, block analytics, wait for network idle / fonts / images, dismiss cookie dialogs, then capture. "That matters more than having an extremely sophisticated AI model."

### Capture protocol (MB§31)

```
1 Navigate   2 Wait for DOM   3 Wait for fonts   4 Observe network
5 Detect lazy-loading   6 Trigger required scrolling   7 Wait for visual stability
8 Capture viewport   9 Capture full page   10 Capture sections
11 Explore interactions   12 Record media   13 Extract DOM
14 Extract accessibility tree   15 Extract CSS/computed styles
16 Extract assets   17 Score quality
```

Do **not** rely on a blind "wait 5 seconds" (reported lazy-loading, animation-state and screenshot-before-ready problems). A **visual readiness detector** is its own subsystem (MB§32): fonts loaded, images loaded, layout stable, animations stable, network quiet enough, large layout shifts stopped, lazy content rendered. Its thresholds: **Not decided**.

**Two capture modes (MB§33):** *static* (disable/reduce animations — clean reference screenshot) and *motion* (preserve animations — understand behavior). Capture both so we need not choose between a beautiful screenshot and the actual animation. Whether V0 captures both modes: **Not decided**.

Cookie banners/popups (MB§60): capture a clean state when safely dismissible; detect and record intrusive popups without silently destroying evidence.

## Responsive capture

Final Blueprint (§12) initial profiles:

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

Extra captures are added when meaningful differences are detected. Earlier iterations used other sets (all **Superseded as exact values**, useful as candidate "later" profiles): Desktop 1440×900, Laptop 1280×800, Tablet 768×1024, Mobile 390×844, Small mobile 375×667 (WF§2); canonical breakpoints 375/390/768/1024/1280/1440 (WF§8); a "3 canonical viewports" V1 (IF§31). WF§8 also proposed a **responsive-difference score**: if 1280→1440 looks essentially identical, don't store both as independent examples; if 768→1024 changes navigation/grid/typography, keep both. The scoring method is **Not decided**.

Responsive state is more than width (GAP§16): record viewport, DPR, orientation, touch capability, hover capability, user agent — some sites change behavior based on mobile *device* vs. small desktop window. Responsive comparison of the same section across viewports, and expressing behavior like "3-column → 2-column → 1-column", is a Feature List item (E); mechanism beyond the above is **Not decided**.

[V0] covers full-page screenshots; "responsive capture" is listed under [V1], so the V0 viewport set is **Not decided** (**Inferred:** desktop, possibly with a mobile baseline).

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

Also viewport screenshots per profile and interaction-state screenshots (e.g. `pricing-annual.png`, `menu-open.png`, `modal-open.png`) (IF§10). Section detection: [06](06-intelligence-pipeline.md). [V0]

## Media collection (§13, MB§34)

Automatic. Five extraction layers:

1. **DOM:** `img`, `picture`, `video`, `source`, `svg`, `canvas`, `iframe` (and `object`).
2. **CSS:** `background-image`, `mask`, `content`.
3. **Network:** loaded assets (webp, avif, png, mp4, webm, gif, svg, lottie json, woff2, CDN-hosted resources) — important for assets loaded dynamically by JS.
4. **Runtime:** Lottie, GSAP, Framer Motion, Three.js, Rive.
5. **Visual:** if something is visible but unidentifiable → screen recording / computer vision. "This minimizes unnecessary processing."

Per item an `Asset`: `type, source_url, mime, width, height, duration, animated, hash, storage_key`; the earlier fuller list also records file size, page, DOM location, section, poster (INT). A per-page **media inventory** (e.g. "47 images, 12 SVGs, 3 animated SVGs, 2 videos, 1 Lottie, 1 WebGL canvas") links every asset to page/section/element/state (MB§11). Assets are stored content-addressed ([04](04-raw-evidence-and-storage.md)).

### Animated media — three representations (§14)

`original`, `poster`, `normalized_video` — e.g. `hero-animation.json`, `hero-animation-poster.webp`, `hero-animation.mp4`. GIF, Lottie, animated SVG and WebGL are all normalized to MP4 + thumbnail (INT); canvas/WebGL are **recorded as rendered result** (no extraction of an underlying object needed): `type = webgl_animation, capture = video`, AI classifies later (TECH§9). Animation video stored with `duration, bounding_box, trigger, type, poster` (IF§13); generated formats such as `original.mp4`, `preview.webm`, `preview.gif` — GIF is only a convenient preview, **video is canonical** (WF§3).

**Animation recording (IF§13):** don't record the page blindly for 30 seconds. Detect motion first (compare rendered frames / DOM / media state): initial screenshot → observe → motion detected? no → static; yes → record. Detection signals: `animation-name`, `transition`, `transform`, `opacity`, `<video>`, `<canvas>`, Lottie, `requestAnimationFrame`, DOM mutations; output flags like `has_animation` and `animation_types` (hover, scroll, transition…) (WF§3).

### SVG (§15, TECH§5)

Store `original.svg` + `normalized.svg` + `preview.png`; extract `viewBox, width, height, fill, stroke, animation, embedded assets`. Find `<svg>`, `<img src=*.svg>`, CSS backgrounds. Animated SVG: look for `<animate>`, `<animateTransform>`, `<animateMotion>` plus CSS/JS-driven animation, and/or observe rendered pixels over time; then `detect → render → capture frames → encode video`.

### Lottie (§16, TECH§8)

Detect `.json` animation files, Lottie player elements, `lottie-web`, known player libraries, network requests, DOM attributes. Store `original.json`, poster/preview, video, thumbnail, metadata (frame count, fps, duration, dimensions, layers, loop, autoplay, renderer).

### Video (§17, TECH§7)

Detect `<video>` and network `.mp4/.webm/.m3u8`; capture duration, resolution, autoplay, loop, muted, poster, controls; associate with the containing section. Pipeline: `source → metadata → thumbnail → poster → normalized preview`. Potentially classify role: background, hero, product demo, UI animation, advertisement (marked "potentially"). DRM: don't attempt circumvention (MB§60). Streaming (HLS/M3U8) handling details: **Not decided**.

### GIF / WebP / APNG (TECH§6)

Detect `image/gif`/`.gif`; extract dimensions, frame count, duration, fps; auto preview. WebP animation and APNG follow the three-representation rule; format-specific extraction **Not decided**.

### CSS and JS animations (TECH§10–11)

CSS: inspect `animation-*`, `transition`, `transform`, `opacity` and associate with DOM elements (e.g. button hover: translateY(-2px), 200 ms). JS (GSAP, Framer Motion, Motion, Anime.js, Barba, Locomotive Scroll, Lenis, Three.js, `requestAnimationFrame`): detect the library, then use **behavioral observation** — DOM before → interaction → DOM after → visual difference → video — rather than reverse-engineering the implementation. Scroll behavior (capturing at 0/20/40/60/80/100 % and what changes) is discussed as a feature (RES§9); capture mechanism **Not decided**.

## Interaction discovery (IF§14–15)

Candidate detector, ranking and state capture are in [03](03-capture-and-crawling-workflow.md). Per candidate: before → action → wait for stability → after → visual diff; keep only meaningful state changes. Interaction targets: hover, focus (keyboard automation), click, scroll, open menu/modal/accordion/tab/carousel/dropdown, play/pause video.

## Error, empty and loading states (GAP§17–18)

Not only happy paths: loading, empty, error, offline, success, validation error, permission denied, no results, 404, rate limit. For loading/skeleton, sample timed captures (0 → 300 → 700 → 1500 ms → stable) if the UI visibly changes. How errors are *induced* on web (without dangerous actions): **Not decided**.

## Fonts and design tokens

Store font family, source, weight, style, fallback, and detect custom fonts (GAP§12). Design tokens (colors, typography, geometry, effects, motion) are extracted deterministically from computed styles ([06](06-intelligence-pipeline.md)).

## Technology detection (§18)

Enrichment, **not mandatory**; deterministic service; evidence sources, status levels (detected/likely/possible/unknown) and examples in [06](06-intelligence-pipeline.md). Answer to the user's question "isn't it hard to find the framework?": *not a blocker* — fingerprinting with confidence works well for Next.js/WordPress/Shopify/Webflow; less certain for animation libraries; never promise certainty (TECH§1–2). Runs in `technology-detector`; results stored as `Technology` + `TechnologyEvidence`. [V1]

## Authenticated websites

Many target products are behind login. Internal model (INT, IF§9, GAP§5): authorized site profiles with encrypted session state in a credential vault; session expiry → `AUTH_REQUIRED`/`WAITING_FOR_AUTH` → human re-authentication → resume; CAPTCHA/MFA are human checkpoints, never defeated; platform APIs/OAuth preferred where available. Paths needing accounts, payment, email verification, CAPTCHA, geographic access or private data that cannot be legitimately reached are **marked inaccessible** (AUTO). Full workflow: [10](10-authentication-and-permission-workflows.md). Phase for authenticated web collection: **Not decided** (V0 is "website URLs"; `WEB_APP` is a Source type; an earlier iteration placed authenticated crawling in its V3).

## Edge-case policy (MB§60)

Assistant's table, written under the SaaS premise; kept as **Provisional** guidance with the internal reading noted:

| Situation | Behavior |
|---|---|
| robots disallows crawl | respect policy / don't crawl *(internal: per-domain `crawl_allowed` flag; always-honor Not decided)* |
| CAPTCHA | mark inaccessible *(internal: human checkpoint)* |
| login required | public capture only *(internal: authorized profile or WAITING_FOR_AUTH — see [10](10-authentication-and-permission-workflows.md))* |
| paywall | capture accessible surface |
| Cloudflare / bot block | retry, then mark blocked |
| huge page | enforce resource limits |
| infinite scroll | bounded exploration |
| infinite carousel | detect cycle |
| animation never settles | motion capture + stable fallback |
| missing font | record failure |
| broken image | preserve evidence |
| video DRM | don't attempt circumvention |
| cross-origin iframe | capture if permitted/accessible |
| WebGL / canvas | screenshot/video fallback |
| duplicate page | canonicalize |
| URL explosion | crawl budget |
| personalized / geo-specific content | mark capture context / record region |
| cookie banner | capture clean state when safely dismissible |
| intrusive popup | detect and record; don't silently destroy evidence |
| random content | seed/detect variability where possible |

PLAN§3 also lists further cases to specify explicitly (SPA/MPA/SSR/SSG, hash routing, redirects, URL parameters, 404/500, age gates, geo restrictions, rate limits, shadow DOM, custom elements, huge DOM, very large images, nested modals, multi-step forms, orientation, mobile-only/desktop-only components, horizontal scrolling). Behavior for those: **Not decided** beyond the table.

## Outputs

RawArtifacts (`SCREENSHOT, HTML, DOM, NETWORK_METADATA, ASSET, LOG, TRACE`, …) per [04](04-raw-evidence-and-storage.md), then events such as `screen.captured` and `crawl.completed` ([12](12-data-model-and-events.md)).
