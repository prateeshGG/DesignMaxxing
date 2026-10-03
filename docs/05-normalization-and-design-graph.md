# 05 — Normalization and Design Graph

Part of the [engineering docs](README.md). Prev: [04](04-raw-evidence-and-storage.md). Next: [06 Intelligence pipeline](06-intelligence-pipeline.md). Data fields: [12](12-data-model-and-events.md).

## Purpose [Foundational]

Normalization turns heterogeneous raw evidence into **canonical entities**. The **design graph** is the common representation across web, iOS and Android — "that prevents us from building separate products for web, iOS, and Android." Search, flows and the library are all views over this graph.

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
| `Component` | A UI element crop (navigation bar, pricing card, bottom sheet…), used for component search |
| `Asset` | Media item: `type, source_url, mime, width, height, duration, animated, hash, storage_key` |
| `Animation` | Motion asset/behavior (CSS animation, Lottie, animated SVG/GIF/video, canvas/WebGL) |
| `UIState` | A UI state (see note below) |
| `Interaction` | An action performed (tap, swipe, input, click) |
| `Flow`, `FlowNode`, `FlowEdge` | Ordered journey over screen states and actions |
| `Technology`, `TechnologyEvidence` | Evidence-backed technology enrichment |
| `Pattern`, `Tag`, `TaxonomyVersion` | Taxonomy |
| `Collection`, `CollectionItem`, `Comment` | User research layer; items can point to Screen, Flow, Page, Section, Asset, Product (§38) |

Note: the entity list contains `UIState` while the exploration section uses `ScreenState` (§20). Whether they are the same entity is **Not decided**; this document treats `ScreenState` as an exploration-time node that normalizes into a `Screen`/`UIState`. **Inferred.**

## Unified web / iOS / Android representation

Same vocabulary across platforms:

| Concept | Web | iOS / Android |
|---|---|---|
| Source | `WEBSITE`, `WEB_APP` | `IOS_APP`, `ANDROID_APP`, `AUTHORIZED_BUILD` |
| Structure evidence | DOM, CSS | UI tree |
| Screenshot | Full-page and section | Screen |
| Section | Yes — page segmentation | **Not decided** (sections are web-oriented in the conversation) |
| Component | Yes | Yes |
| State | Interaction/Level 3 state | `ScreenState` (visual_hash, ui_hash) |
| Flow | Possible via Level 3 | Core (V2) |
| Version | crawl timestamp / deploy metadata / content hash | versionName, versionCode, CFBundle* |

Platform differences are handled at **collection** (platform-specific engines behind a common interface — [09](09-ios-android-collection.md)) and in `Platform`/`DeviceProfile`, not by forking the model.

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

Detection combines DOM structure + visual segmentation + semantic analysis + OCR ([06](06-intelligence-pipeline.md), [08](08-web-collection.md)). Both the full-page capture and each section capture are stored: users want "pricing sections", not just "websites containing pricing" (§11).

## Relationships

Design graph (§74):

```
Product → Version → Screen → Section → Component → Asset
                      ↕         ↕
                    Flow     Animation
```

Flows are generated from the exploration graph: `FlowEdge` carries `from, to, action, coordinates, target, duration`; AI may *label* a flow (e.g. `SEARCHING`) but "the underlying transitions remain evidence-based" (§26). Every derived attribute carries label/confidence/source ([06](06-intelligence-pipeline.md)).

Cardinalities, graph storage (relational tables vs. a graph engine) and ID strategy are **Not decided**. The conversation states PostgreSQL is the source of truth for "metadata + relationships" (§3); a separate graph database is not proposed.

## Design graph consumers

- **Search** — builds `SearchDocument`s and embeddings per entity type ([07](07-search-and-retrieval-architecture.md)).
- **Flows**, **Library** (collections, product/site/app pages) — see Feature List sections K, R.
- **Design fingerprint** [V3] — per-product summary: color system, typography, spacing, border radius, button styles, navigation patterns, card patterns, animation patterns, layout patterns (§62). Relates to Feature List section I.
- **Change detection** — diffs entities across `ProductVersion`s ([11](11-versioning-change-detection.md)).

## What normalization must not do

- Mutate raw evidence ([04](04-raw-evidence-and-storage.md)).
- Assume one URL equals one screen.
- Treat differing hashes as different states ([09](09-ios-android-collection.md) §State deduplication).
- Mix user uploads into the public dataset automatically ([04](04-raw-evidence-and-storage.md)).
