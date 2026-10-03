# 18 — Roadmap: V0 / V1 / V2 / V3

Part of the [engineering docs](README.md). Prev: [17](17-ai-architecture.md). Next: [19 Decisions, assumptions, open questions](19-decisions-assumptions-open-questions.md).

Taken from §68–73 of the conversation. **No additional phases are invented.** Discipline stated by the conversation: "Do not build everything above." Each phase list is quoted; commentary is marked.

## V0 — MVP (§68)

```
Website URLs → Playwright → crawl pages → full-page screenshots → section detection →
asset extraction → animation detection → OCR → basic taxonomy → Postgres → S3 → basic search
```

Frontend: **Explore, Search, Site, Page, Section**. "That's enough to validate the core idea."

Documents involved: [03](03-capture-and-crawling-workflow.md), [04](04-raw-evidence-and-storage.md), [05](05-normalization-and-design-graph.md), [06](06-intelligence-pipeline.md), [07](07-search-and-retrieval-architecture.md), [08](08-web-collection.md).

Websites only (`WEBSITE` sources). Design foundations to include from the start even though they are not "features": immutable RawArtifact/DerivedArtifact model, job/event envelope, hashing/CAS, `CostEvent` ([02](02-system-architecture.md) — "Foundational vs optional").

### The "real MVP" pipeline (§73)

```
URL → Crawler → Rendered page → Screenshot → Section detection → Asset/media extraction →
OCR → Visual/semantic classification → Embedding → Postgres + Object Storage + Search → Search UI
```

then `URL → crawl again → difference detected → only changed material processed` ("the economic foundation").

> **Discrepancy within the source:** §73 includes visual/semantic classification, embedding, and re-crawl diffing, while the §68 V0 list has no embeddings and §69 puts embeddings, version comparison, and visual search in V1. Not reconciled in the conversation → [19](19-decisions-assumptions-open-questions.md) Q-01. This doc follows §68 for V0 and treats §73 as the end-to-end shape that the V0 pipeline is intended to grow into. **Inferred.**

## V1 (§69)

Add: **responsive capture, component detection, visual search, embeddings, collections, uploads, technology detection, version comparison, animation viewer.** "Now it starts feeling like a serious product."

Documents: [07](07-search-and-retrieval-architecture.md), [08](08-web-collection.md), [11](11-versioning-change-detection.md), [04](04-raw-evidence-and-storage.md) (uploads).

## V2 (§70)

Add: **Android, iOS, flow reconstruction, interaction recording, mobile screenshots, device profiles, app version history.** "Now we have the full mobile/web dataset."

Documents: [09](09-ios-android-collection.md), [10](10-authentication-and-permission-workflows.md), [11](11-versioning-change-detection.md).

## V3 (§71)

Add: **AI search, natural-language research, component search, region search, design fingerprints, competitive comparison, automated design reports.** "This is where the product becomes a design intelligence platform rather than a Mobbin clone."

Documents: [07](07-search-and-retrieval-architecture.md), [17](17-ai-architecture.md), [05](05-normalization-and-design-graph.md) (fingerprint), [11](11-versioning-change-detection.md) (comparison).

## Explicitly deferred / not initially built (§72)

Community · public profiles · team chat · enterprise SSO · Slack integration · finance-specific vertical · marketplace · complex billing · mobile app for our own product. Reason: "Those don't help validate the core data engine."

## Phase-assignment table

| Capability | Phase | Source |
|---|---|---|
| Crawl, full-page screenshots, section detection, asset extraction, animation detection, OCR, basic taxonomy, basic search | V0 | §68 |
| Responsive capture | V1 | §69 |
| Component detection | V1 | §69 |
| Visual search, embeddings | V1 | §69 |
| Collections, uploads | V1 | §69 |
| Technology detection | V1 | §69 |
| Version comparison | V1 | §69 |
| Animation viewer | V1 | §69 |
| Android, iOS, device profiles, mobile screenshots | V2 | §70 |
| Flow reconstruction, interaction recording | V2 | §70 |
| App version history | V2 | §70 |
| AI search, natural-language research | V3 | §71 |
| Component search, region search | V3 | §71 |
| Design fingerprints | V3 | §71 |
| Competitive comparison, automated design reports | V3 | §71 |

## Items with no phase stated — **Not decided**

| Item | Note |
|---|---|
| Web interaction exploration (Level 3) | Not in V0 list; "interaction recording" is V2 (mobile context) |
| Authenticated website collection / `WEB_APP` | V0 is "Website URLs"; auth flow ([10](10-authentication-and-permission-workflows.md)) tied to apps in V2 |
| Incremental crawling / change detection runtime | "Economic foundation" (§73) but "version comparison" is V1 |
| Admin dashboard scope per phase | "Core product" (§40); needed from V0 for operating crawls (**Inferred**) |
| Human review queue | Not assigned |
| "Why is this good?" explanations | "Later" (§65) |
| Search ranking diversification | Not assigned (**Inferred:** with embeddings, V1) |
| Feature List items: accessibility, performance, Figma, API/MCP | Outside the Blueprint's phases |
| Web search engine choice in V0 | OpenSearch vs. simpler |

## Rule for architecture

Do not pre-build future-phase functionality (mobile collectors, flow reconstruction, region search, etc.) in V0. Keep the data model and event contracts forward-compatible so later phases extend rather than rewrite ([05](05-normalization-and-design-graph.md), [12](12-data-model-and-events.md)).
