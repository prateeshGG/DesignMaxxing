# 01 — Product Context

Part of the [engineering docs](README.md). Next: [02 System architecture](02-system-architecture.md). Citation tags are defined in the [README](README.md#how-the-conversation-unfolds-and-which-part-wins).

## What we are building

A **Mobbin-like design intelligence platform**: a searchable, versioned library of real-world interfaces (screens, sections, components, assets, animations, flows) collected automatically from real products. The user's stated starting point: *"I like to create my own mobbin but for now just for websites and cheaper."*

The conversation's guiding sentence (§ opening):

> Collect raw evidence once, normalize it into a common design graph, and derive everything else — screens, sections, components, flows, animations, search, embeddings, taxonomy, and version history — from that evidence.

How the framing evolved (all agreed in the conversation):

- Not a "screenshot crawler" but a **website observation engine** that turns a live site into a structured dataset (TECH§12). *"The fundamental object is the website observation, not the screenshot"* (MB§ premise).
- Not "cheaper Mobbin" as identity; price is an advantage, not the identity. The assistant's positioning: *"the searchable intelligence layer for the web"* / *"one machine-readable research layer for real websites"* (MB§52, §76). **Provisional** (written under the since-superseded SaaS premise, but not contradicted).
- Stronger thesis at the end: the product becomes a design-intelligence platform "rather than a Mobbin clone" once V3 features land (§71). The moat is "the dataset + observation graph" (MB§73), operationalized as the five protected assets (§ closing).

Product name: **DesignMaxxing** (founder decision: the product name is the repository name; see [20](20-founder-decisions-and-plan-validation.md) F-05). The Blueprint's working titles "Design Intelligence Platform" and the `design-intelligence/` monorepo root are descriptive/internal only. The landing page is deferred until the founder provides design references.

## Core problem

1. Reference products contain sections, GIFs, SVGs, animated SVGs, video, Lottie and more, across several screen sizes. Collecting these **manually is a hassle** (User). The user wants the whole collection process automated, not only media (User: *"i meant the whole thing"*).
2. **Automation target (AUTO):** *"95%+ automated collection"* but **not** "100% automated interpretation". Pipeline shape: deterministic browser collection → automated inference → confidence score → human correction when necessary. Not "AI guesses everything."
3. The result has to be **cheap** to build and run; cost is an architectural constraint ([13](13-cost-performance-and-scaling.md)). The conversation quantified the token-cost motivation for deterministic capture (TOK): a specialized structured source ≈ **1×**, DOM/accessibility-tree only ≈ **2–5×**, DOM + screenshots ≈ **5–15×**, DOM + frequent screenshots + iterative actions ≈ **10–30×+** tokens. The assistant labels these a "rule of thumb", not a fixed multiplier.
4. Most real products sit behind authentication ([10](10-authentication-and-permission-workflows.md)).
5. Community/market signals the assistant cited (Reddit/X; external, **not independently verified here**): complaints about capture quality, missing states, awkward screenshots, lack of web-app coverage, expensive subscriptions, and agents unable to go deep into a reference library; "too much inspiration becomes unusable" → optimize for *time from design question → useful reference* (RES§19, MB§75). Consequence recorded by the assistant: **capture quality is the first engineering milestone**, ahead of scale ("We can reliably capture difficult websites", MB§75).
6. The Blueprint states the real difficulty: the screenshot crawler is "comparatively straightforward"; the hard, valuable part is *"turning millions of heterogeneous captures into a clean, deduplicated, versioned, searchable design dataset."*

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

- **User:** *"i am not building this crawling for users it is just for me to collect the data so we can show it in our platform which is like mobbin."* The assistant's response: *"You are not building a generic crawling SaaS. You are building an internal ingestion system… whose output becomes the dataset"*, optimizing for *maximum automated collection → minimum human intervention → high-quality structured design dataset* (INT).
- This clarification is the **governing decision**. It **supersedes** the Master Blueprint's user-triggered-crawl assumptions: per-plan crawl limits, page-credit billing, public SSRF/abuse controls for user-submitted URLs, "Crawl API", "Crawl recipe" user modes, and the first authenticated-platform answer (see [10](10-authentication-and-permission-workflows.md), [13](13-cost-performance-and-scaling.md), [15](15-security-and-isolation.md), [19](19-decisions-assumptions-open-questions.md) §4).
- End users consume the **design graph** through search, library and research features. They never touch collectors or credentials.
- The admin dashboard is "a core product" (§40) but serves operators ([16](16-admin-and-operations.md)). In the internal framing: *"your job should become: curate the dataset, not manually create it"* (IF§27).
- Data flow (full detail in [02](02-system-architecture.md)): Source → capture → raw evidence → normalization → intelligence → design graph → product.

## Scope

Foundational scope (the architecture is built around these; the "five things to protect"):

1. Immutable raw evidence — [04](04-raw-evidence-and-storage.md)
2. Unified design graph across web/iOS/Android — [05](05-normalization-and-design-graph.md)
3. Automated exploration + state deduplication — [09](09-ios-android-collection.md)
4. Multimodal indexing (text, metadata, visual, component, flow search) — [07](07-search-and-retrieval-architecture.md)
5. Incremental crawling and change detection — [11](11-versioning-change-detection.md)

Principle added in the Master Blueprint and consistent with the above: **everything collected has provenance** — source URL, DOM range, bounding box, viewport, capture timestamp, classification, confidence, model/version — so an agent can answer "why did you classify this as a hero?" with evidence (MB§74, GAP§1).

Phasing is in [18](18-mvp-v1-v2-v3-roadmap.md). Summary: **V0** = websites only; mobile arrives in **V2**.

## Deliberately out of scope initially

Final Blueprint (§72): community · public profiles · team chat · enterprise SSO · Slack integration · finance-specific vertical · marketplace · complex billing · a mobile app for our own product. Reason: *"Those don't help validate the core data engine."*

Additional "do not build initially" items from earlier iterations, not contradicted later: full design editor / Figma competitor, automatic code generation, self-hosted enterprise version, custom AI model training, unlimited crawling, huge social network (MB§72); Kubernetes, Kafka, custom browser runtime, custom vector database, real-time crawling, user-submitted crawling, dozens of platform integrations, sophisticated autonomous agents, every possible viewport, perfect framework detection, perfect interaction discovery (IF§30).

Also out of scope by the user's own statement: any user-facing crawling product.

## Pricing and business model

The user asked whether pricing and expenses were decided. Answers over time:

- PLAN: **not decided**; do not pick a subscription price before calculating COGS, payment fees, support, infra overhead, AI overhead and storage growth.
- MB§47–51, §78: a **pricing hypothesis** (Free $0 / Starter $9 / Pro $19 / Power $39 / Team $79+ / Enterprise custom, with page credits). It is labelled *"proposed and ready for testing, not permanently locked"* (MB§79) and was written when users could trigger crawls. Details and caveats: [13](13-cost-performance-and-scaling.md).
- Final Blueprint: "complex billing" is [Deferred] (§72).

Net status: **pricing model Not decided**; the hypothesis is retained as **Provisional** history.

## Relationship to the existing Feature List

The [Feature List](../Feature%20List) is the *what*. These docs are the *how*. Features are not restated here.

| Feature List section | Mechanism documented in | Coverage note |
|---|---|---|
| A Website library, B Page library | [03](03-capture-and-crawling-workflow.md), [05](05-normalization-and-design-graph.md), [08](08-web-collection.md), [11](11-versioning-change-detection.md) | |
| C Section intelligence | [08](08-web-collection.md), [06](06-intelligence-pipeline.md) | |
| D Component intelligence | [06](06-intelligence-pipeline.md), [07](07-search-and-retrieval-architecture.md) | V1 detection |
| E Responsive intelligence | [08](08-web-collection.md) | Viewport profiles and conditional capture are specified; the early "Laptop 1280×800" profile and a *responsive-difference score* appear in earlier iterations (WF§2, WF§8). Breakpoint detection / responsive timeline: mechanism **Not decided** beyond that. |
| F Interaction intelligence | [03](03-capture-and-crawling-workflow.md), [08](08-web-collection.md), [09](09-ios-android-collection.md) | Web interaction discovery specified in IF§14–15 |
| G Motion, H Media intelligence | [08](08-web-collection.md), [04](04-raw-evidence-and-storage.md) | |
| I Design-system intelligence | [05](05-normalization-and-design-graph.md), [08](08-web-collection.md) | Deterministic extraction from computed CSS (IF§17); design fingerprint is V3 (§62) |
| J Content intelligence | [06](06-intelligence-pipeline.md) | "DOM first, OCR second" (MB§14) |
| K Flow intelligence | [09](09-ios-android-collection.md), [05](05-normalization-and-design-graph.md) | V2 |
| L Technology intelligence | [08](08-web-collection.md), [06](06-intelligence-pipeline.md) | Enrichment, not mandatory |
| M Accessibility intelligence | [08](08-web-collection.md), [06](06-intelligence-pipeline.md) | Accessibility tree and metadata are captured (MB§15, MB§31, GAP§13); not in the final Blueprint's phases |
| N Performance intelligence | [08](08-web-collection.md) | Metrics captured via browser performance APIs (AUTO table); not in the final Blueprint's phases |
| O Search | [07](07-search-and-retrieval-architecture.md) | |
| P Research features | [11](11-versioning-change-detection.md), [07](07-search-and-retrieval-architecture.md), [18](18-mvp-v1-v2-v3-roadmap.md) | V3: comparison, reports |
| Q AI (incl. MCP, API) | [17](17-ai-architecture.md), [07](07-search-and-retrieval-architecture.md) | MCP tool list and API endpoints were sketched under the SaaS premise (MB§24–25); phase **Not decided** |
| R Collaboration | [05](05-normalization-and-design-graph.md) | Collections/uploads covered; team workspaces, public collections, Figma are mostly [Deferred] / **Not decided** |
| S Future features | [11](11-versioning-change-detection.md) | Change detection is the enabling mechanism for monitoring |

The conversation's long Mobbin inventory is **research input about a competitor**, not a requirements list for us, and is not reproduced.
