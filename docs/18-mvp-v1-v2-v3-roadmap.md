# 18 — Roadmap: V0 / V1 / V2 / V3

Part of the [engineering docs](README.md). Prev: [17](17-ai-architecture.md). Next: [19 Decisions, assumptions, open questions](19-decisions-assumptions-open-questions.md).

The **authoritative** roadmap is the final Engineering Blueprint (§68–73). The conversation produced several earlier phase lists while the product was being shaped; they are recorded at the end as history so nothing is lost, but they are **not** additional phases. No phases are invented here.

Discipline stated by the conversation: "Do not build everything above." Each phase list below is quoted; commentary is marked.

## V0 — MVP (§68)

```
Website URLs → Playwright → crawl pages → full-page screenshots → section detection →
asset extraction → animation detection → OCR → basic taxonomy → Postgres → S3 → basic search
```

Frontend: **Explore, Search, Site, Page, Section**. "That's enough to validate the core idea."

Documents involved: [03](03-capture-and-crawling-workflow.md), [04](04-raw-evidence-and-storage.md), [05](05-normalization-and-design-graph.md), [06](06-intelligence-pipeline.md), [07](07-search-and-retrieval-architecture.md), [08](08-web-collection.md).

Websites only (`WEBSITE` sources). Design foundations to include from the start even though they are not "features": immutable RawArtifact/DerivedArtifact model, provenance fields, job/event envelope, hashing/CAS, `CostEvent`, crawler/product boundary ([02](02-system-architecture.md) — "Foundational vs optional"). The assistant's engineering-priority statement for the first milestone: "We can reliably capture difficult websites" before "we can crawl 100,000 websites" (MB§75).

### The "real MVP" pipeline (§73)

```
URL → Crawler → Rendered page → Screenshot → Section detection → Asset/media extraction →
OCR → Visual/semantic classification → Embedding → Postgres + Object Storage + Search → Search UI
```

then `URL → crawl again → difference detected → only changed material processed` ("the economic foundation").

> **Discrepancy within the final blueprint:** §73 includes visual/semantic classification, embedding, and re-crawl diffing, while the §68 V0 list has no embeddings and §69 puts embeddings, version comparison, and visual search in V1. Not reconciled → [19](19-decisions-assumptions-open-questions.md) Q-01. This doc follows §68 for V0 and treats §73 as the end-to-end shape V0 grows into (**Inferred**).

## V1 (§69)

Add: **responsive capture, component detection, visual search, embeddings, collections, uploads, technology detection, version comparison, animation viewer.** "Now it starts feeling like a serious product."

Documents: [07](07-search-and-retrieval-architecture.md), [08](08-web-collection.md), [11](11-versioning-change-detection.md), [04](04-raw-evidence-and-storage.md) (uploads).

## V2 (§70)

Add: **Android, iOS, flow reconstruction, interaction recording, mobile screenshots, device profiles, app version history.** "Now we have the full mobile/web dataset."

Documents: [09](09-ios-android-collection.md), [10](10-authentication-and-permission-workflows.md), [11](11-versioning-change-detection.md). Within V2 the mobile answer sequenced Android before iOS, then unified intelligence (MOB§21) — **Inferred** ordering.

## V3 (§71)

Add: **AI search, natural-language research, component search, region search, design fingerprints, competitive comparison, automated design reports.** "This is where the product becomes a design intelligence platform rather than a Mobbin clone."

Documents: [07](07-search-and-retrieval-architecture.md), [17](17-ai-architecture.md), [05](05-normalization-and-design-graph.md) (fingerprint), [11](11-versioning-change-detection.md) (comparison).

## Explicitly deferred / not initially built

Final (§72): Community · public profiles · team chat · enterprise SSO · Slack integration · finance-specific vertical · marketplace · complex billing · mobile app for our own product. Reason: "Those don't help validate the core data engine."

Also stated "do not build initially" in earlier iterations and not contradicted (**Provisional**): full design editor / Figma competitor, automatic code generation, self-hosted enterprise version, custom AI model training, unlimited crawling, huge social network (MB§72); Kubernetes, Kafka, custom browser runtime, custom vector database, real-time crawling, user-submitted crawling, dozens of platform integrations, sophisticated autonomous agents, every possible viewport, perfect framework detection, perfect interaction discovery (IF§30).

## Phase-assignment table (final blueprint)

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

## Items with no phase in the final blueprint — **Not decided**

| Item | Note |
|---|---|
| Web interaction exploration (Level 3) | Not in V0 list; earlier lists put it at V1.5/V2 |
| Authenticated website collection / `WEB_APP` | Earlier list put authenticated crawling in its V3; auth for mobile is part of V2 |
| Incremental crawling / change-detection runtime; scheduled re-crawls | "Economic foundation" (§73) but "version comparison" is V1; earlier list put scheduled re-crawls in its V3 |
| PII/secrets detection stage | Required before authenticated captures are stored (GAP§3–4); phase not stated (**Inferred:** before any authenticated or public exposure) |
| Admin dashboard scope per phase | "Core product" (§40); needed from V0 for operating crawls (**Inferred**) |
| Human review queue | Not assigned |
| "Why is this good?" explanations | "Later" (§65) |
| Search ranking diversification | Not assigned (**Inferred:** with embeddings, V1) |
| MCP / API, Figma, browser extension, trend detection, website DNA | Appear only in earlier lists (see below) or the Feature List |
| Accessibility and performance capture | Described in capture protocol (MB§31) but not phased |
| V0 search engine | Postgres FTS vs. OpenSearch |
| Legal review / takedown tooling | "Before public launch" (MB§64); phase not stated |

## Earlier roadmap iterations (superseded; history only)

| Source | Lists |
|---|---|
| `PLAN§16–18` (early planning) | **MVP:** crawler, page discovery, desktop/mobile, screenshots, sections, media, basic video, DOM, OCR, section/component classification, technology detection, basic design tokens, semantic+visual embeddings, search/filters, website/section pages, save/collections, visual similarity, natural-language search, basic AI research, MCP. **V2:** interaction capture, flows, responsive comparison, animation intelligence, design-system extraction, expanded technology intelligence, version history, change detection, collaboration, team workspaces. **V3:** competitive monitoring, trends, Figma, browser extension, code generation, screenshot→code/Figma, advanced AI research, API, enterprise |
| `MB§65–68` (Master Blueprint) | **MVP** (as PLAN, plus fonts, cost ledger, quality scoring), **V1.5:** interaction exploration, state graphs, animations, responsive comparison, version history, technology intelligence, advanced search, AI synthesis. **V2:** API, Figma, browser extension, team workspaces, monitoring, change alerts, website DNA, pattern analytics, advanced MCP. **V3:** competitive intelligence, trend detection, design-system comparison, implementation intelligence, code/Figma generation, enterprise deployments, private datasets |
| `IF§31–33` (internal factory) | **V1:** discover pages → Chromium → 3 canonical viewports → full-page screenshots → section detection → image/SVG/video extraction → basic animation recording → technology detection → OCR → AI page/section classification → deduplication → Postgres + S3 → UI. **V2:** interactive states, flow detection, animation classification, Lottie detection, canvas/WebGL recording, component extraction, design-token extraction, visual search, semantic search. **V3:** authenticated crawling, version tracking, scheduled recrawls, change detection, historical snapshots, automatic flow reconstruction, advanced technology detection, AI-generated design summaries, collections, team collaboration, MCP/API |
| `MOB§21` | Phase 1 web → Phase 2 Android → Phase 3 iOS → Phase 4 unified intelligence |

These differ from the final lists on purpose (the product direction changed from a user-facing SaaS toward an internal data engine plus product). The final blueprint is the roadmap of record; items appearing only above are tracked as "no phase" in the table.

## Addendum — founder adjustments (see [20](20-founder-decisions-and-plan-validation.md))

These override the placements above where they differ:

- **V0 adds:** section-level embeddings and "similar sections" (F-01), hash-skip on re-crawl (F-01, F-25), minimal admin/review (F-03), per-site diversification cap (F-03), raw accessibility-tree and performance capture without UI (F-04).
- **V1 adds:** fixed-set web interaction capture (F-02), conditional tablet capture (F-12), scroll-pass video (F-13).
- **V2 = authenticated web + mobile, gated** behind demand/legal evidence (F-02, F-36, F-40); Android before iOS.
- **Gates:** nothing in a later gate starts before the earlier gate passes (F-40; gates G1–G5 in [20 §6](20-founder-decisions-and-plan-validation.md)).
- MCP/API stays unbuilt until ≥ 50 activated users or paying customers ask (F-03).

## Rule for architecture

Do not pre-build future-phase functionality (mobile collectors, flow reconstruction, region search, etc.) in V0. Keep the data model and event contracts forward-compatible so later phases extend rather than rewrite ([05](05-normalization-and-design-graph.md), [12](12-data-model-and-events.md)).
