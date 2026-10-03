# 05 — Normalization and Design Graph

Part of the [engineering docs](README.md). Prev: [04](04-raw-evidence-and-storage.md). Next: [06 Intelligence pipeline](06-intelligence-pipeline.md). Data fields: [12](12-data-model-and-events.md).

## Purpose [Foundational]

Normalization turns heterogeneous raw evidence into **canonical entities**. The **design graph** is the common representation across web, iOS and Android — "that prevents us from building separate products for web, iOS, and Android." Search, flows and the library are all views over this graph. The conversation also calls it the "design dataset" and "observation graph" (MB§73); same thing.

> "Don't build a database that's just `website → screenshot`. Build relationships between websites → pages → sections → screens → states → components → assets → animations → technologies → flows → versions." (IF§35)

## Canonical entities

From the minimum domain model (§4) and normalization stage (§1):

| Entity | Meaning in the conversation |
|---|---|
| `Product` | The thing being studied (a site or an app) |
| `ProductVersion` | A version of it: `version, platform, release_identifier, captured_at` ([11](11-versioning-change-detection.md)) |
| `Platform` / `DeviceProfile` | web / iOS / Android; device or viewport profile ([08](08-web-collection.md), [09](09-ios-android-collection.md)) |
| `Page` | A URL-level web document. **"We shouldn't assume 1 URL = 1 screen"** (§10) |
| `Screen` | A canonical captured screen/state (web viewport state or app screen) |
| `Section` | A segment of a page (Header, Hero, Social proof, Features, Testimonials, Pricing, FAQ, Footer…) with its own canonical capture |
| `Component` | A UI element crop (navigation bar, pricing card, bottom sheet…), used for component search; may carry variants and visual embeddings (IF§18) |
| `Asset` | Media item: `type, source_url, mime, width, height, duration, animated, hash, storage_key` |
| `Animation` | Motion asset/behavior (CSS animation, Lottie, animated SVG/GIF/video, canvas/WebGL); unified content type with poster + normalized video |
| `UIState` | A UI state (see note below) |
| `Interaction` | An action performed (tap, swipe, input, click) |
| `Flow`, `FlowNode`, `FlowEdge` | Ordered journey over screen states and actions |
| `Technology`, `TechnologyEvidence` | Evidence-backed technology enrichment |
| `Pattern`, `Tag`, `TaxonomyVersion` | Taxonomy |
| `Collection`, `CollectionItem`, `Comment` | User research layer; items can point to Screen, Flow, Page, Section, Asset, Product (§38) |

Earlier, a **first-class object** list (RES§23, PLAN§1) also named `Website, Element, Design Token, Viewport, Capture, Version, Workspace`. In the final model: Website ≈ `Product`/`Source` (web); `Viewport` ≈ `DeviceProfile`; `Capture` ≈ `CaptureSession`/artifacts; `Version` ≈ `ProductVersion`; `Design Token` and `Element` are **not entities** in the final list — whether design tokens are first-class rows or attributes of a `Product`/`Section`/`Component` is **Not decided** (the "design fingerprint" is V3, §62).

Note: the entity list has `UIState` while the exploration section uses `ScreenState` (§20). Whether they are the same entity is **Not decided**; **Inferred:** `ScreenState` is an exploration-time node that normalizes into a `Screen`/`UIState`.

Additional per-screen structure discussed (GAP, MOB):

- **Screenshot regions (GAP§20):** every screenshot eventually has a coordinate system — `Screen → Hero/Navbar/CTA/Illustration with x,y,w,h` — foundation for region-level search, component extraction, cropping, annotations.
- **System UI separation (MOB§16):** `screen → app_content | system_status_bar | system_navigation`; OS UI (status bar, navigation bar, keyboard, permission dialogs) is stored separately so it does not pollute design search.
- **Theme and locale as screen identity (GAP§14–15):** light/dark/system (and possibly high-contrast) become part of the screen identity; locale/language/direction metadata for RTL layouts.
- **State kinds worth capturing (GAP§17–18, RES§7):** default, hover, focus, active, disabled, loading, error, success, expanded, collapsed, selected; plus empty, offline, validation error, permission denied, no results, 404, rate limit; loading/skeleton sequences captured at timed intervals.

## Unified web / iOS / Android representation

Same vocabulary across platforms (MOB§18 diagram):

```
PRODUCT
 ├── WEB      Page → Section → Component → Asset → Animation
 ├── iOS      Screen → State → Component → Asset → Animation
 └── ANDROID  Screen → State → Component → Asset → Animation
                         └── all → Flow → Version
```

| Concept | Web | iOS / Android |
|---|---|---|
| Source | `WEBSITE`, `WEB_APP` | `IOS_APP`, `ANDROID_APP`, `AUTHORIZED_BUILD` |
| Structure evidence | DOM, CSS, accessibility tree | UI tree (accessibility/UI hierarchy) |
| Screenshot | Full-page and section | Screen |
| Section | Yes — page segmentation | **Not used** — the unified diagram has no Section layer for mobile |
| Component | Yes | Yes |
| State | Interaction/Level 3 state | `ScreenState` (visual_hash, ui_hash) |
| Flow | Possible via Level 3 | Core (V2) |
| Version | crawl timestamp / deploy metadata / content hash | versionName, versionCode, CFBundle* |

"Your search engine doesn't care whether something came from website, iOS, Android unless the user filters for it." Platform differences are handled at **collection** (platform-specific engines behind a common interface — [09](09-ios-android-collection.md)) and in `Platform`/`DeviceProfile`, not by forking the model.

## Page vs screen vs section

```
Page
 ├── Header
 ├── Hero
 ├── Social proof
 ├── Feature section
 ├── Testimonials
 ├── Pricing
 ├── FAQ
 └── Footer
```

Detection combines DOM structure + visual segmentation + semantic analysis + OCR ([06](06-intelligence-pipeline.md), [08](08-web-collection.md)). Both the full-page capture and each section capture are stored: users want "pricing sections", not just "websites containing pricing" (§11). A section carries `{type, confidence, source (dom+vision+layout), page, bounds, screenshot, elements}` (MB§6).

## Relationships

Design graph (§74):

```
Product → Version → Screen → Section → Component → Asset
                      ↕         ↕
                    Flow     Animation
```

Flows are generated from the exploration graph: `FlowEdge` carries `from, to, action, coordinates, target, duration`; AI may *label* a flow (e.g. `SEARCHING`) but "the underlying transitions remain evidence-based" (§26). Every derived attribute carries label/confidence/source ([06](06-intelligence-pipeline.md)).

Site-level structure also derived for websites (RES§10): a **link/route graph** (site map; user journey such as Home → Product → Pricing → Signup). Relationship to `Flow` entities (route graph vs. interaction flow): **Not decided**.

Cardinalities, graph storage (relational tables vs. a graph engine) and ID strategy are **Not decided**. Postgres is the source of truth for "metadata + relationships" (§3); a graph database is not proposed. The IF§19 table list is relational (see [12](12-data-model-and-events.md)).

## Design graph consumers

- **Search** — builds `SearchDocument`s and embeddings per entity type ([07](07-search-and-retrieval-architecture.md)). Embedding levels (GAP§21): Website, Page, Section, Screen, Component, Asset, Animation, Flow (the final Blueprint §34 lists Screen, Section, Component, Asset, Flow, Page, Product).
- **Flows**, **Library** — Feature List sections K, R.
- **Design fingerprint / "Website DNA"** [V3] — per-product summary: color system, typography, spacing, border radius, button styles, navigation patterns, card patterns, animation patterns, layout patterns (§62); Master Blueprint adds style, imagery, framework/CMS/animation tech and responsive strategy (MB§57). Relates to Feature List section I.
- **Change detection** — diffs entities across `ProductVersion`s ([11](11-versioning-change-detection.md)).

## What normalization must not do

- Mutate raw evidence ([04](04-raw-evidence-and-storage.md)).
- Assume one URL equals one screen.
- Treat differing hashes as different states ([09](09-ios-android-collection.md) §State deduplication).
- Mix user uploads into the public dataset automatically ([04](04-raw-evidence-and-storage.md)).
- Hard-code taxonomy into historical records ([06](06-intelligence-pipeline.md)).
