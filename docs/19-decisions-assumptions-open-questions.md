# 19 — Decisions, Assumptions, Open Questions

Part of the [engineering docs](README.md). Prev: [18](18-mvp-v1-v2-v3-roadmap.md).

Register of what the conversation settled, what these docs assume, and what remains unsettled. `§n` = section of the Blueprint in `Discussion of the Product`; "User" = a user message.

## 1. Decisions

| ID | Decision | Reasoning / context | Docs |
|---|---|---|---|
| D-01 | Build a Mobbin-like design intelligence platform; websites first, cheaper | User's opening request | [01](01-product-context.md) |
| D-02 | The crawler/collector is an **internal data-acquisition system**, not a user-facing product | User: "i am not building this crawling for users it is just for me to collect the data" | [01](01-product-context.md), [03](03-capture-and-crawling-workflow.md) |
| D-03 | Automate the whole collection process, not only media | User: "i meant the whole thing" | [03](03-capture-and-crawling-workflow.md) |
| D-04 | Core principle: collect raw evidence once → normalize into a common design graph → derive everything else | Prevents separate web/iOS/Android products | [02](02-system-architecture.md) |
| D-05 | Raw evidence is immutable; derived data is regenerable | Reprocess with better models without re-crawling (§6) | [04](04-raw-evidence-and-storage.md) |
| D-06 | Design graph is the common representation across platforms | §1, §74 | [05](05-normalization-and-design-graph.md) |
| D-07 | Monorepo with `apps/`, `services/`, `packages/`, `infrastructure/`, `ml/` | §2 | [02](02-system-architecture.md) |
| D-08 | PostgreSQL source of truth; object storage for heavy files; search index; vector index; no media in Postgres | §3 | [02](02-system-architecture.md) |
| D-09 | Everything asynchronous is a job; queue/event-driven between services | §7–8; failures isolated | [02](02-system-architecture.md), [12](12-data-model-and-events.md) |
| D-10 | Three-level web collection: HTTP discovery → browser rendering → interaction exploration (only expensive pages) | Cost control (§9) | [03](03-capture-and-crawling-workflow.md), [08](08-web-collection.md) |
| D-11 | Do not assume 1 URL = 1 screen; store full-page and section captures | Users search sections (§10–11) | [08](08-web-collection.md) |
| D-12 | Responsive: desktop 1440×900 and mobile 390×844 baselines, tablet 1024×1366 conditional; extras on meaningful difference | §12 | [08](08-web-collection.md) |
| D-13 | Animated media stored as original + poster + normalized video; SVG/Lottie have dedicated handling | §13–17 | [08](08-web-collection.md) |
| D-14 | Technology detection is an optional enrichment with evidence and confidence; uncertain → `unknown` | "Never hallucinate frameworks" (§18) | [08](08-web-collection.md) |
| D-15 | Mobile collectors implement one `MobileCollector` interface | §19 | [09](09-ios-android-collection.md) |
| D-16 | Mobile apps are explored as a graph; states deduplicated by multi-signal weighted similarity; actions scored | §20–22 | [09](09-ios-android-collection.md) |
| D-17 | Dangerous actions (Delete, Purchase, Send, Publish, Transfer, Logout, Subscribe, Pay) default to DO NOT EXECUTE | §23 | [10](10-authentication-and-permission-workflows.md) |
| D-18 | Login-required → `WAITING_FOR_AUTH`; operator supplies authorized session/test account; engine never bypasses auth | §24 | [10](10-authentication-and-permission-workflows.md) |
| D-19 | Controlled test states: fresh_install, permissions_denied/allowed, logged_out/in | §25 | [10](10-authentication-and-permission-workflows.md) |
| D-20 | Flows are generated from the graph; AI may only label; recorded video is derived | §26–27 | [09](09-ios-android-collection.md) |
| D-21 | Website versions inferred from crawl timestamp, deployment metadata, content hash; apps use real version identifiers | §28 | [11](11-versioning-change-detection.md) |
| D-22 | Change detection at page/section/screen/component/asset/flow level → ADDED/REMOVED/MODIFIED/UNCHANGED | §29 | [11](11-versioning-change-detection.md) |
| D-23 | Hierarchical taxonomy; multiple classification sources; AI is never the only classifier | §30–31 | [06](06-intelligence-pipeline.md) |
| D-24 | Every derived attribute carries label/confidence/source; low confidence → human review; fixes create training data | §32–33 | [06](06-intelligence-pipeline.md), [16](16-admin-and-operations.md) |
| D-25 | Separate embeddings per entity type; text + visual + multimodal | §34 | [07](07-search-and-retrieval-architecture.md) |
| D-26 | Search pipeline: parse → retrieve → filter → rank/diversify; popularity must not overwhelm relevance | §35–37 | [07](07-search-and-retrieval-architecture.md) |
| D-27 | Uploaded references are a separate source, not mixed into the public dataset automatically | §39 | [04](04-raw-evidence-and-storage.md) |
| D-28 | Admin dashboard is treated as a core product | §40 | [16](16-admin-and-operations.md) |
| D-29 | Record `CostEvent` for every expensive operation; track cost per site/screen/flow/successful capture | §42 | [13](13-cost-performance-and-scaling.md) |
| D-30 | Hash-keyed caching everywhere; CAS; HOT/WARM/COLD tiers; CDN with on-demand derivatives | §43–46 | [04](04-raw-evidence-and-storage.md), [13](13-cost-performance-and-scaling.md) |
| D-31 | Event envelope with `schema_version` | §48 | [12](12-data-model-and-events.md) |
| D-32 | Workers have timeout/retry/backoff/DLQ; browser workers disposable; checkpoints for resumption | §49–51 | [14](14-failure-recovery-and-reliability.md) |
| D-33 | Crawler VPC boundary; credentials never in the normal frontend/API environment | §52 | [15](15-security-and-isolation.md) |
| D-34 | Initial stack: Next.js, TypeScript/Node API, Postgres, Redis+BullMQ, S3-compatible, CloudFront/Cloudflare, Playwright+Chromium, OpenSearch/Elasticsearch, pgvector first | §53 | [02](02-system-architecture.md) |
| D-35 | Deterministic code first; LLM/VLM only for semantic classification, taxonomy mapping, flow naming, section interpretation, ambiguous UI, query interpretation | §54 | [17](17-ai-architecture.md) |
| D-36 | Cache AI inferences by input_hash+model+model_version+prompt_version+taxonomy_version | §56 | [17](17-ai-architecture.md) |
| D-37 | Evaluate classifiers against a human-labeled benchmark (1,000 screens / 200 sections / 200 components / 100 flows) | §57 | [17](17-ai-architecture.md) |
| D-38 | Phases V0–V3 as listed; community, public profiles, team chat, SSO, Slack, finance vertical, marketplace, complex billing, own mobile app deferred | §68–72 | [18](18-mvp-v1-v2-v3-roadmap.md) |
| D-39 | Five assets to protect: immutable raw evidence; unified design graph; automated exploration + state dedup; multimodal indexing; incremental crawling/change detection | Closing section | [01](01-product-context.md), [02](02-system-architecture.md) |

## 2. Assumptions

Items below are **Inferred** by the documentation author, not stated in the conversation. Confirm or reject each.

| ID | Assumption | Where used |
|---|---|---|
| A-01 | `crawl-orchestrator` owns crawl job lifecycle, fan-out and checkpoint state | [03](03-capture-and-crawling-workflow.md) |
| A-02 | Job state transitions beyond the listed statuses (e.g. `WAITING_FOR_REVIEW` = human decision needed) | [03](03-capture-and-crawling-workflow.md), [14](14-failure-recovery-and-reliability.md) |
| A-03 | Checkpoints are stored in Postgres | [03](03-capture-and-crawling-workflow.md) |
| A-04 | `/internal/*` endpoints enqueue work rather than execute pipeline stages inline | [02](02-system-architecture.md) |
| A-05 | `ScreenState` (exploration node) normalizes into `Screen`/`UIState` | [05](05-normalization-and-design-graph.md) |
| A-06 | Raw session recordings from `record()` are RawArtifacts; composed `flow.mp4` is a DerivedArtifact | [09](09-ios-android-collection.md) |
| A-07 | A new website `ProductVersion` is created only when content hashes differ | [11](11-versioning-change-detection.md) |
| A-08 | V0 viewport set is desktop (maybe plus mobile baseline) | [08](08-web-collection.md) |
| A-09 | Hard policy gate (not just a score penalty) applies to dangerous actions | [10](10-authentication-and-permission-workflows.md) |
| A-10 | Only derived/CDN output crosses from the crawler boundary to the product side; `pii-service` runs before exposure | [15](15-security-and-isolation.md) |
| A-11 | Consumers are idempotent (retries, reprocessing, cache hits) | [12](12-data-model-and-events.md), [14](14-failure-recovery-and-reliability.md) |
| A-12 | The admin dashboard is needed from V0 to operate crawls | [18](18-mvp-v1-v2-v3-roadmap.md) |
| A-13 | The §73 "real MVP" is the end-to-end shape V0 grows into, while §68 defines the V0 cut | [18](18-mvp-v1-v2-v3-roadmap.md) |
| A-14 | Mobile "section" is not a concept; sections are web-oriented | [05](05-normalization-and-design-graph.md) |
| A-15 | ML services are likely Python | [02](02-system-architecture.md) |
| A-16 | Raw captures from authenticated sessions are the most sensitive store | [15](15-security-and-isolation.md) |

## 3. Open questions

Grouped; each is **Not decided** by the conversation.

### Scope and phasing

- **Q-01** §68 V0 omits embeddings and visual/semantic classification, but §73 "real MVP" includes both (and re-crawl diffing). Which is V0?
- **Q-02** Which phase covers web interaction exploration (Level 3) and authenticated website collection (`WEB_APP`)? The "automated exploration + state dedup" asset is foundational but mobile is V2.
- **Q-03** Is incremental crawling a V0 requirement even though "version comparison" is V1?
- **Q-04** Phase of the human review queue, diversification, "why is this good?", MCP/API exposure.
- **Q-05** How are Feature List sections M (accessibility) and N (performance), plus Laptop profile, breakpoint detection and Figma integration, mapped into the architecture? The Blueprint doesn't cover them.
- **Q-06** Product name.

### Business

- **Q-07** Pricing, plans, and revenue model. The user asked whether "pricing and expenses" were decided; only cost *tracking* is defined.
- **Q-08** Target scale (sources, pages, crawl frequency) and cost budgets.

### Collection

- **Q-09** `crawl_policy` contents (depth, rate limits, robots handling, per-source rules); scheduler cadence; sitemaps.
- **Q-10** What qualifies as an "expensive page" for Level 3; exploration budgets; wait-for-stability criteria.
- **Q-11** How "meaningful difference" triggers extra responsive captures; additional viewport profiles.
- **Q-12** How scroll/hover/parallax animations and canvas/WebGL are captured; M3U8 streaming.
- **Q-13** How mobile app packages are acquired; device/OS matrix; simulator/emulator tooling; iOS equivalent of `back()`.
- **Q-14** State-dedup weights and threshold; dynamic content handling.
- **Q-15** How "important flows" are selected for recording.

### Authentication and safety

- **Q-16** Form and lifecycle of authorized sessions (cookies vs. credentials, 2FA/CAPTCHA/SSO, test-account provisioning).
- **Q-17** Representation, granting and detection of the dangerous-action policy; handling flows that need a dangerous step.
- **Q-18** Do `fresh_install`/permission states apply to web?
- **Q-19** Legal/compliance posture (ToS, robots, copyright, display rights); `TakedownRequest` semantics; `pii-service` scope.
- **Q-20** Secret storage, encryption, access/audit for raw captures; sandboxing for browsers.

### Data and events

- **Q-21** `UIState` vs `ScreenState`; `CaptureSession` fields and its relation to `CaptureJob`; `SourceVersion` vs `ProductVersion`.
- **Q-22** `USER_UPLOAD` is used as a source (§39) but is not in `Source.type`.
- **Q-23** ID format; `DerivedArtifact`, `Embedding`, `SearchDocument`, `Classification` fields.
- **Q-24** Event naming convention (facts vs. commands), event catalog, delivery guarantees, schema compatibility policy.
- **Q-25** How internal `POST /internal/*` endpoints relate to the queue-based flow.
- **Q-26** Entity matching across versions and thresholds for MODIFIED; whether capture is skipped or only processing is skipped on unchanged re-crawls.
- **Q-27** Graph storage approach (relational only vs. graph engine); cardinalities.

### Intelligence and search

- **Q-28** Taxonomy content (levels, labels); handling of unknown/custom sections.
- **Q-29** Model/vendor choices (OCR, CV, VLM, embeddings); evidence-combination method; confidence calibration and review threshold.
- **Q-30** Labeling workflow, benchmark governance, pass thresholds.
- **Q-31** Whether V0 "basic search" uses OpenSearch or a simpler option; candidate merging/score fusion; pre/post-filtering for vectors; diversification algorithm; ranking weights; reindexing strategy.

### Operations

- **Q-32** Retry/backoff/timeouts per job type; manual retry semantics; "completed with failures" status; mid-page checkpoints.
- **Q-33** Storage tier transition rules and retention; reprocessing scope and cost guardrails.
- **Q-34** "Healthy" source criteria; alerting; metrics tooling; relationship of `apps/web/admin` to `apps/worker-dashboard`; role of `notification-service`.
- **Q-35** Cloud provider; container orchestration choices; backup/DR.

### Source gaps

- **Q-36** Answers from the conversation's omitted assistant messages (token cost of browser/DOM vs. MCP; how hard framework detection is; "is anything left to consider") are not in the export and may contain decisions not captured here.
