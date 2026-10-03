# 02 — System Architecture

Part of the [engineering docs](README.md). Prev: [01](01-product-context.md). Next: [03 Capture workflow](03-capture-and-crawling-workflow.md).

## Pipeline

Source (§1, §74):

```
SOURCES  Websites · Web apps · iOS apps · Android apps · Authorized builds
   │
   ▼
SOURCE MANAGER      authorization · scheduling · crawl policy · source metadata
   │
   ▼
INGESTION / CAPTURE ENGINE
   WEB ENGINE            iOS ENGINE               ANDROID ENGINE
   browser workers       simulator / authorized   emulator / authorized
                         device                   device
   │
   ▼
RAW EVIDENCE      screenshots · videos · DOM/UI tree · network metadata · assets ·
                  interaction logs · source files · device metadata
   │
   ▼
NORMALIZATION     pages · screens · sections · components · assets · animations ·
                  states · flows
   │
   ▼
INTELLIGENCE      CV · OCR · classifiers · embeddings · AI taxonomy ·
                  technology detection · flow reconstruction · diffs
   │
   ▼
DESIGN GRAPH
   │
   ├──► SEARCH ──┐
   ├──► FLOWS ───┼──► WEB PRODUCT  (research / library surfaces)
   └──► LIBRARY ─┘
```

Cross-cutting stage (GAP§3–4, §11): between capture and storage/exposure, captures pass through **PII detection → redaction** and **secrets detection**, with the unredacted original kept only in a quarantined raw layer where there is a legitimate reason to retain it ([15](15-security-and-isolation.md)). The Blueprint's diagram does not draw this stage; the placement relative to `normalization` is **Inferred**.

| Stage | Responsibility | Detail doc |
|---|---|---|
| Source | What may be collected, and under what policy | [03](03-capture-and-crawling-workflow.md), [10](10-authentication-and-permission-workflows.md) |
| Capture | Produce evidence only; no interpretation | [03](03-capture-and-crawling-workflow.md), [08](08-web-collection.md), [09](09-ios-android-collection.md) |
| Raw evidence | Immutable store of what was seen | [04](04-raw-evidence-and-storage.md) |
| Normalization | Turn heterogeneous captures into canonical entities | [05](05-normalization-and-design-graph.md) |
| Intelligence | Derive labels, text, vectors, diffs — with confidence and evidence | [06](06-intelligence-pipeline.md), [17](17-ai-architecture.md) |
| Design graph | Platform-independent common representation | [05](05-normalization-and-design-graph.md) |
| Product | Search, library, flows, admin | [07](07-search-and-retrieval-architecture.md), [16](16-admin-and-operations.md) |

Core split stated repeatedly: **"Deterministic systems collect. AI classifies."** (INT) and *"Separate raw capture from interpretation"* (IF§3): `Website → Browser → Raw evidence → Deterministic processing → AI interpretation → Structured dataset`, never `Website → LLM → Database`.

## Major services (monorepo target layout, §2)

Where the Blueprint (or a later clarification) states a role, it is cited; otherwise the role is **Inferred** from the name.

| Service | Role | Basis |
|---|---|---|
| `source-manager` | Authorization, scheduling, crawl policy, source metadata; per-domain policy flags | §1, GAP§2 |
| `crawl-orchestrator` | Crawl lifecycle, job fan-out, checkpoint state, crawl-policy enforcement (budgets, depth, prioritization) | Inferred from IF§4–8 (the "crawl scheduler"/"policy engine" roles) |
| `web-crawler` | Levels 1–3: HTTP discovery, browser rendering, interaction exploration | §9 |
| `ios-collector`, `android-collector` | Implement the `MobileCollector` interface per platform | §19 |
| `exploration-engine` | State-graph exploration, action scoring, state dedup (deterministic; AI may help pick among unexplored actions) | §20–22, GAP§10 |
| `screenshot-service` | Canonical screenshots (crop system chrome, normalize DPR/dimensions), crops | GAP§11; name |
| `media-service`, `asset-service` | Media/asset normalization (poster, normalized video, SVG), media inventory | §13–17, IF§12; split Inferred |
| `ocr-service`, `vision-service` | OCR; layout detection, segmentation, component detection, visual similarity | §54 |
| `taxonomy-service` | Hierarchical taxonomy classification | §30–31 |
| `technology-detector` | Deterministic evidence-based technology enrichment | §18, IF§16 |
| `flow-builder` | Flow reconstruction from the exploration graph | §26 |
| `embedding-service`, `search-service` | Embeddings; indexing/retrieval | §34–37 |
| `change-detector` | Version-to-version diff, run before expensive AI processing | §29, GAP§7 |
| `pii-service` | PII and secrets detection + redaction in the capture→storage path | GAP§3–4 (role now defined) |
| `notification-service` | **Not decided** — the Master Blueprint lists product webhooks (`crawl.completed`, `crawl.failed`, `version.detected`, `review.required`, MB§25) but under the SaaS premise | name only |

Apps: `apps/web` (search, screens, flows, apps, sites, collections, admin), `apps/api`, `apps/worker-dashboard`. The split between `apps/web/admin` and `apps/worker-dashboard` is **Not decided** (the ingestion dashboard in IF§25 is the operator view; see [16](16-admin-and-operations.md)).

**Bootstrapping guidance (IF§2, IF§28, IF§30):** the monorepo above is the *target* layout. For the first version "keep it relatively boring": a few cheap VM workers, Docker, no Kubernetes/Kafka/microservices-everywhere/distributed browser platform; scale worker types independently (CPU worker: discovery/HTML/metadata; browser worker: Chromium; media worker: FFmpeg/image processing; AI worker: classification). The Master Blueprint adds: "Start simple: Web/API, Workers, Postgres, Redis, R2. Then split services only when actual load demands it" (MB§71). This coexists with the Blueprint's `infrastructure/kubernetes` directory; see conflict note in [19](19-decisions-assumptions-open-questions.md) §4.

## Service boundaries

- **Collectors only capture.** They write RawArtifacts and emit events. They do not classify, embed, or index. "If the AI classifier dies, the crawler doesn't have to run again" (§8).
- **Intelligence services read evidence, write DerivedArtifacts/Classifications.** They never mutate RawArtifacts ([04](04-raw-evidence-and-storage.md)).
- **Public/product side never touches the crawler environment.** Credentials, browsers, devices and raw captures live in a separate boundary ([15](15-security-and-isolation.md)). Never run crawled sites in the same trusted environment as database, API credentials, billing or internal services (MB§61).
- **Heavy files never live in Postgres.** Postgres = metadata and relationships (source of truth); object storage = files; search index = keyword/filter/OCR; vector index = semantic and visual similarity (§3).

```
PostgreSQL ─ metadata + relationships (source of truth)
Object Storage ─ screenshots, videos, assets, raw captures
Search Index ─ keyword + filters + OCR
Vector Index ─ semantic + visual similarity
```

- **Source Adapter (GAP§30):** acquisition is abstracted per source kind rather than hard-coding "App Store crawler" — Web URL, authorized web session, iOS authorized build, Android APK/AAB, internal test build. Fits under `source-manager`/collectors; adapter interface **Not decided**.

## Monorepo

Target layout (§2); not yet created in this repository.

```
design-intelligence/
├── apps/            web (search, screens, flows, apps, sites, collections, admin), api, worker-dashboard
├── services/        source-manager, crawl-orchestrator, web-crawler, ios-collector,
│                    android-collector, exploration-engine, screenshot-service, media-service,
│                    asset-service, ocr-service, vision-service, taxonomy-service,
│                    technology-detector, flow-builder, embedding-service, search-service,
│                    change-detector, pii-service, notification-service
├── packages/        database, events, schemas, storage, auth, image-utils, video-utils,
│                    browser-utils, device-profiles, taxonomy
├── infrastructure/  terraform, kubernetes, queues, monitoring, storage
└── ml/              classifiers, embeddings, evaluation, datasets
```

Shared contracts live in `packages/schemas` and `packages/events` ([12](12-data-model-and-events.md)). Language per service beyond "TypeScript / Node" for API and workers is **Not decided**; image processing uses Sharp and video uses FFmpeg (IF§2). ML services' language is **Inferred** (not stated).

## Sync vs asynchronous

| Synchronous (request/response) | Asynchronous (job + event) |
|---|---|
| Product reads: `GET /search`, `/screens/:id`, `/flows/:id`, `/pages/:id`, `/sections/:id`, `/products/:id`, `/collections/:id` | Everything that captures, normalizes, classifies, embeds, or indexes |
| `POST /visual-search`, `POST /collections`, `POST /uploads` | Crawls and capture jobs (`CaptureJob`) |
| Operator: `GET/POST /sources`, `POST /sources/:id/crawl`, `GET /jobs`, `GET /jobs/:id` | Retries, DLQ handling, reprocessing, scheduled re-crawls |

"Everything asynchronous should be a job" (§7). Services communicate through a queue "rather than calling one another synchronously" (§8).

Internal APIs are also listed (§47): `POST /internal/capture`, `/internal/normalize`, `/internal/classify`, `/internal/embed`, `/internal/index`. How these coexist with queue-based flow is **Not decided**; **Inferred:** operator/service entry points that enqueue work.

MCP and public API: the Master Blueprint sketched MCP tools (`search_websites`, `search_pages`, `search_sections`, `search_components`, `search_flows`, `search_media`, `search_animations`, `search_technologies`, `search_design_tokens`, `find_similar`, `compare_pages`, `compare_responsive_states`, `get_page`, `get_section`, `get_flow`, `get_assets`, `get_technology`, `get_version_history`) and REST endpoints (MB§24–25). The final Blueprint's API list (§47) has no MCP. Treated as **Provisional** product exposures over the same design graph; phase **Not decided** ([07](07-search-and-retrieval-architecture.md)).

## Event-driven architecture

Example chain (§8):

```
crawl.completed → capture.normalize → screen.detected → media.extract → ocr.process
   → vision.classify → taxonomy.classify → embedding.generate → index.update
```

Envelope and schema versioning: [12](12-data-model-and-events.md). Failure semantics: [14](14-failure-recovery-and-reliability.md). Change detection is placed *before* expensive AI processing (GAP§7), so unchanged material is not re-run ([11](11-versioning-change-detection.md)).

## Recommended infrastructure

Final Blueprint (§53, "first serious version"):

| Concern | Choice |
|---|---|
| Frontend | Next.js |
| API | TypeScript / Node |
| Database | PostgreSQL |
| Queue | Redis + BullMQ, "or a managed queue later" |
| Object storage | S3-compatible |
| CDN | CloudFront / Cloudflare |
| Browser automation | Playwright + Chromium |
| Search | OpenSearch / Elasticsearch |
| Vector | pgvector initially — "not immediately introduce a dedicated vector database" |

Additional / diverging statements in earlier iterations (all **Provisional**):

| Concern | Statement | Source |
|---|---|---|
| Browser compute | Run **our own Playwright workers**; do not start by paying a third-party browser service per crawl. Reuse browser processes/pages rather than relaunching Chromium per page | MB§29–30 |
| Search | **Postgres full-text + pgvector initially → dedicated search engine (OpenSearch) when necessary** | MB§71, IF§2, IF§23 |
| Object storage / CDN | Cloudflare R2 (no egress fees) and Cloudflare CDN | MB§71 |
| Image / video | Sharp / FFmpeg | IF§2 |
| Observability | Sentry + OpenTelemetry (managed logs/metrics) | IF§2, MB§71 |
| Auth / billing (product side) | Managed authentication initially; Stripe | MB§71 (SaaS premise; billing is [Deferred] per §72) |
| Deployment | Docker; cheap VM workers initially | IF§2 |
| AI | Model router across multiple models | MB§71, [17](17-ai-architecture.md) |

"Exact infrastructure vendor choices: **Provisional**" (MB§79). Which search engine V0 uses is therefore **Not decided** (conflict between §53 and the "start simple" statements). Cloud provider: **Not decided**.

## Core architectural principles

1. **Raw evidence is immutable; derived data is regenerable** [Foundational] — [04](04-raw-evidence-and-storage.md).
2. **The design graph is the common representation** across web/iOS/Android; no separate products per platform [Foundational] — [05](05-normalization-and-design-graph.md).
3. **Asynchronous by default; queue between services**; one failing stage must not force a re-crawl.
4. **Deterministic collects, AI classifies; models only where code cannot** — [17](17-ai-architecture.md).
5. **Never let AI be the only classifier**; every derived attribute carries label, confidence, source — [06](06-intelligence-pipeline.md).
6. **Everything has provenance** (source, capture context, model/version) — [04](04-raw-evidence-and-storage.md).
7. **Everything expensive is cacheable; do not pay twice** — [13](13-cost-performance-and-scaling.md).
8. **Disposable workers; checkpointed jobs; a failed page must not fail the whole site** — [14](14-failure-recovery-and-reliability.md).
9. **Incremental by default**: re-crawl, diff, process only what changed [Foundational] — [11](11-versioning-change-detection.md).
10. **Authentication is never bypassed; CAPTCHA/MFA are human checkpoints; dangerous actions default to DO NOT EXECUTE** — [10](10-authentication-and-permission-workflows.md).
11. **Credentials never enter the normal frontend/API environment** — [15](15-security-and-isolation.md).
12. **Do not build everything at once** — phase discipline, [18](18-mvp-v1-v2-v3-roadmap.md).

## Foundational vs optional

| Foundational (design in from day one) | Optional / phase-gated |
|---|---|
| Immutable RawArtifact + DerivedArtifact model | Mobile collectors (V2) |
| Design-graph entity model (incl. Platform, DeviceProfile) | Component detection (V1), component/region search (V3) |
| Job/event model with schema versioning | Technology detection (enrichment, V1) |
| Content-addressable storage + hashing + caching | Visual search / embeddings (V1) |
| Provenance on every captured/derived item | Flow reconstruction (V2) |
| Version + change detection hooks | AI search, reports, fingerprints (V3) |
| Cost recording (`CostEvent`) | Community, SSO, Slack, billing (Deferred) |
| Crawler/product security boundary; PII/secrets stage | MCP/API exposure (phase Not decided) |

Tension to resolve: item 3 of the "five things to protect" (automated exploration + state dedup) is foundational in value, yet mobile exploration is V2 and web interaction exploration (Level 3) has no phase in the final Blueprint — see [19](19-decisions-assumptions-open-questions.md).
