# 01 — Product Context

Part of the [engineering docs](README.md). Next: [02 System architecture](02-system-architecture.md).

## What we are building

A **Mobbin-like design intelligence platform**: a searchable, versioned library of real-world interfaces (screens, sections, components, assets, animations, flows) collected automatically from real products. The user's stated starting point: *"I like to create my own mobbin but for now just for websites and cheaper."*

The conversation's guiding sentence (§ opening):

> Collect raw evidence once, normalize it into a common design graph, and derive everything else — screens, sections, components, assets, animations, flows, search, taxonomy, embeddings, and version history — from that evidence.

Product name: **Not decided.** The Blueprint titles it "Design Intelligence Platform" and uses `design-intelligence/` as the monorepo root; this repository is named DesignMaxxing.

## Core problem

1. Reference products (websites, and later apps) contain sections, GIFs, SVGs, animated SVGs, video, Lottie and more, across several screen sizes. Collecting these **manually is a hassle** (User). The user wants the whole collection process automated, not only media collection (User: *"i meant the whole thing not just these"*).
2. The result has to be **cheap** to build and run. Cost is an architectural constraint, not an afterthought ([13](13-cost-performance-and-scaling.md)).
3. Most real products sit behind authentication ([10](10-authentication-and-permission-workflows.md)).
4. The Blueprint states the real difficulty: the screenshot crawler is "comparatively straightforward"; the hard, valuable part is *"turning millions of heterogeneous captures into a clean, deduplicated, versioned, searchable design dataset."*

## Intended product model

Two halves with a hard boundary between them:

```
┌───────────────────────────────┐        ┌────────────────────────────────┐
│ INTERNAL DATA ACQUISITION     │        │ PRODUCT-FACING                 │
│ Source manager, collectors,   │  data  │ Explore, Search, Screens,      │
│ exploration, capture, raw     ├───────►│ Flows, Sites, Apps,            │
│ evidence, pipelines           │        │ Collections, object pages      │
│ Operated by us only           │        │ + Admin (operator-facing)      │
└───────────────────────────────┘        └────────────────────────────────┘
```

- **User:** *"i am not building this crawling for users it is just for me to collect the data so we can show it in our platform which is like mobbin."* The crawler/collector is an **internal data-acquisition system**. No end-user crawl requests, no user-facing crawl UI.
- End users consume the **design graph** through search, library and research features. They never touch collectors or credentials.
- The admin dashboard is "a core product" (§40) but serves operators, not end users ([16](16-admin-and-operations.md)).
- Data flow (full detail in [02](02-system-architecture.md)): Source → capture → raw evidence → normalization → intelligence → design graph → product.

## Scope

Foundational scope (the architecture is built around these; see the "five things to protect" in [19](19-decisions-assumptions-open-questions.md)):

1. Immutable raw evidence — [04](04-raw-evidence-and-storage.md)
2. Unified design graph across web/iOS/Android — [05](05-normalization-and-design-graph.md)
3. Automated exploration + state deduplication — [09](09-ios-android-collection.md)
4. Multimodal indexing (text, metadata, visual, component, flow) — [07](07-search-and-retrieval-architecture.md)
5. Incremental crawling and change detection — [11](11-versioning-change-detection.md)

Phasing is in [18](18-mvp-v1-v2-v3-roadmap.md). Summary: **V0** = websites only (crawl, full-page screenshots, sections, assets, animation detection, OCR, basic taxonomy, Postgres + object storage, basic search); mobile arrives in **V2**.

## Deliberately out of scope initially (§72)

Community · public profiles · team chat · enterprise SSO · Slack integration · finance-specific vertical · marketplace · complex billing · a mobile app for our own product. Reason given: *"Those don't help validate the core data engine."*

Also out of scope by the user's own statement: any user-facing crawling product.

Not discussed, therefore **Not decided**: pricing model, plan tiers, and revenue (the user asked whether pricing and expenses were decided; the Blueprint answers only with cost *tracking*, see [13](13-cost-performance-and-scaling.md)).

## Relationship to the existing Feature List

The [Feature List](../Feature%20List) is the *what*. These docs are the *how*. Features are not restated here. This table points each Feature List section to where its mechanism is documented.

| Feature List section | Mechanism documented in | Coverage note |
|---|---|---|
| A Website library, B Page library | [03](03-capture-and-crawling-workflow.md), [05](05-normalization-and-design-graph.md), [08](08-web-collection.md), [11](11-versioning-change-detection.md) | |
| C Section intelligence | [08](08-web-collection.md), [06](06-intelligence-pipeline.md) | |
| D Component intelligence | [06](06-intelligence-pipeline.md), [07](07-search-and-retrieval-architecture.md) | V1 detection |
| E Responsive intelligence | [08](08-web-collection.md) | Blueprint specifies desktop/tablet/mobile profiles and conditional capture. Breakpoint detection, "Laptop" profile and responsive timeline are **not covered by the Blueprint**. |
| F Interaction intelligence | [03](03-capture-and-crawling-workflow.md), [09](09-ios-android-collection.md) | Web state exploration is Level 3 only |
| G Motion, H Media intelligence | [08](08-web-collection.md), [04](04-raw-evidence-and-storage.md) | |
| I Design-system intelligence | [05](05-normalization-and-design-graph.md) | Blueprint covers only a V3 "design fingerprint" (§62) |
| J Content intelligence | [06](06-intelligence-pipeline.md) | OCR/text indexing covered; per-copy-type extraction **Not decided** |
| K Flow intelligence | [09](09-ios-android-collection.md), [05](05-normalization-and-design-graph.md) | V2 |
| L Technology intelligence | [08](08-web-collection.md), [06](06-intelligence-pipeline.md) | Enrichment, not mandatory |
| M Accessibility, N Performance intelligence | — | **Not covered by the Blueprint.** Architecture placement Not decided. |
| O Search | [07](07-search-and-retrieval-architecture.md) | |
| P Research features | [11](11-versioning-change-detection.md), [07](07-search-and-retrieval-architecture.md), [18](18-mvp-v1-v2-v3-roadmap.md) | V3: comparison, reports |
| Q AI | [17](17-ai-architecture.md) | MCP/API exposure: **Not decided** (listed in Feature List only) |
| R Collaboration | — | Collections/uploads covered ([05](05-normalization-and-design-graph.md)); Figma, team workspaces, public collections **Not decided** / partly [Deferred] |
| S Future features | [11](11-versioning-change-detection.md) | Change detection is the foundation for monitoring; the rest is not addressed |

The Feature List also contains Mobbin-derived items. The Discussion's long Mobbin inventory is **research input about a competitor**, not a requirements list for us, and is not reproduced.
