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

| Stage | Responsibility | Detail doc |
|---|---|---|
| Source | What may be collected, and under what policy | [03](03-capture-and-crawling-workflow.md), [10](10-authentication-and-permission-workflows.md) |
| Capture | Produce evidence only; no interpretation | [03](03-capture-and-crawling-workflow.md), [08](08-web-collection.md), [09](09-ios-android-collection.md) |
| Raw evidence | Immutable store of what was seen | [04](04-raw-evidence-and-storage.md) |
| Normalization | Turn heterogeneous captures into canonical entities | [05](05-normalization-and-design-graph.md) |
| Intelligence | Derive labels, text, vectors, diffs — with confidence and evidence | [06](06-intelligence-pipeline.md), [17](17-ai-architecture.md) |
| Design graph | Platform-independent common representation | [05](05-normalization-and-design-graph.md) |
| Product | Search, library, flows, admin | [07](07-search-and-retrieval-architecture.md), [16](16-admin-and-operations.md) |

## Major services (monorepo target layout, §2)

The Blueprint lists the services below. Where it states a role, the role is quoted; otherwise the role is **Inferred** from the name and should be confirmed before the service is built. Only services required by the current phase should be created (see [18](18-mvp-v1-v2-v3-roadmap.md)).

| Service | Role | Basis |
|---|---|---|
| `source-manager` | Authorization, scheduling, crawl policy, source metadata | §1 |
| `crawl-orchestrator` | Crawl lifecycle, job/checkpoint coordination | Inferred |
| `web-crawler` | Levels 1–3: HTTP discovery, browser rendering, interaction exploration | §9 |
| `ios-collector`, `android-collector` | Implement the `MobileCollector` interface per platform | §19 |
| `exploration-engine` | App-as-graph exploration, action scoring, state dedup | §20–22 (mobile); web Level 3 use Inferred |
| `screenshot-service` | Canonical screenshots, crops | Inferred |
| `media-service`, `asset-service` | Media/asset normalization (poster, normalized video, SVG) | §13–17; Inferred split |
| `ocr-service`, `vision-service` | OCR; layout detection, segmentation, component detection, visual similarity | §54 |
| `taxonomy-service` | Hierarchical taxonomy classification | §30–31 |
| `technology-detector` | Evidence-based technology enrichment | §18 |
| `flow-builder` | Flow reconstruction from the exploration graph | §26 |
| `embedding-service`, `search-service` | Embeddings; indexing/retrieval | §34–37 |
| `change-detector` | Version-to-version diff | §29 |
| `pii-service` | **Not decided** — role not discussed (Inferred: PII handling of captures, see [15](15-security-and-isolation.md)) | name only |
| `notification-service` | **Not decided** — role not discussed | name only |

Apps: `apps/web` (search, screens, flows, apps, sites, collections, admin), `apps/api`, `apps/worker-dashboard`. The relationship between `apps/web/admin` and `apps/worker-dashboard` is **Not decided**.

## Service boundaries

- **Collectors only capture.** They write RawArtifacts and emit events. They do not classify, embed, or index. This is why "if the AI classifier dies, the crawler doesn't have to run again" (§8).
- **Intelligence services read evidence, write DerivedArtifacts/Classifications.** They never mutate RawArtifacts ([04](04-raw-evidence-and-storage.md)).
- **Public/product side never touches the crawler environment.** Credentials, browsers, devices and raw captures live in a separate network boundary ([15](15-security-and-isolation.md)).
- **Heavy files never live in Postgres.** Postgres = metadata and relationships (source of truth); object storage = files; search index = keyword/filter/OCR; vector index = semantic and visual similarity (§3).

```
PostgreSQL ─ metadata + relationships (source of truth)
Object Storage ─ screenshots, videos, assets, raw captures
Search Index ─ keyword + filters + OCR
Vector Index ─ semantic + visual similarity
```

## Monorepo

Monorepo (§2). This is the **target** layout from the conversation; it is not yet created in this repository.

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

Shared contracts live in `packages/schemas` and `packages/events` ([12](12-data-model-and-events.md)). Language/runtime per service beyond "TypeScript / Node" for the API is **Not decided** (ML services are likely Python — **Inferred**, not stated).

## Sync vs asynchronous

| Synchronous (request/response) | Asynchronous (job + event) |
|---|---|
| Product reads: `GET /search`, `/screens/:id`, `/flows/:id`, `/pages/:id`, `/sections/:id`, `/products/:id`, `/collections/:id` | Everything that captures, normalizes, classifies, embeds, or indexes |
| `POST /visual-search`, `POST /collections`, `POST /uploads` | Crawls and capture jobs (`CaptureJob`) |
| Operator: `GET/POST /sources`, `POST /sources/:id/crawl`, `GET /jobs`, `GET /jobs/:id` | Retries, DLQ handling, reprocessing |

"Everything asynchronous should be a job" (§7). Services communicate through a queue "rather than calling one another synchronously" (§8).

Internal APIs are also listed (§47): `POST /internal/capture`, `/internal/normalize`, `/internal/classify`, `/internal/embed`, `/internal/index`. How these coexist with queue-based flow is **Not decided**. **Inferred:** they are operator/service entry points that enqueue work rather than perform it inline.

## Event-driven architecture

Example chain (§8):

```
crawl.completed → capture.normalize → screen.detected → media.extract → ocr.process
   → vision.classify → taxonomy.classify → embedding.generate → index.update
```

Envelope and schema versioning: [12](12-data-model-and-events.md). Failure semantics: [14](14-failure-recovery-and-reliability.md).

## Recommended infrastructure (first serious version, §53)

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

Which of these are needed in **V0** (e.g. OpenSearch vs. Postgres full-text for "basic search") is **Not decided**. See [18](18-mvp-v1-v2-v3-roadmap.md). Container orchestration is implied by `infrastructure/kubernetes` and `terraform`; cloud provider is **Not decided**.

## Core architectural principles

1. **Raw evidence is immutable; derived data is regenerable** [Foundational] — [04](04-raw-evidence-and-storage.md).
2. **The design graph is the common representation** across web/iOS/Android; no separate products per platform [Foundational] — [05](05-normalization-and-design-graph.md).
3. **Asynchronous by default; queue between services**; one failing stage must not force a re-crawl.
4. **Deterministic first; models only where code cannot** — [17](17-ai-architecture.md).
5. **Never let AI be the only classifier**; every derived attribute carries label, confidence, source — [06](06-intelligence-pipeline.md).
6. **Everything expensive is cacheable; do not pay twice** — [13](13-cost-performance-and-scaling.md).
7. **Disposable workers; checkpointed jobs** — [14](14-failure-recovery-and-reliability.md).
8. **Incremental by default**: re-crawl, diff, process only what changed [Foundational] — [11](11-versioning-change-detection.md).
9. **Authentication is never bypassed by the exploration engine; dangerous actions default to DO NOT EXECUTE** — [10](10-authentication-and-permission-workflows.md).
10. **Credentials never enter the normal frontend/API environment** — [15](15-security-and-isolation.md).
11. **Do not build everything at once** — phase discipline, [18](18-mvp-v1-v2-v3-roadmap.md).

## Foundational vs optional

| Foundational (design in from day one) | Optional / phase-gated |
|---|---|
| Immutable RawArtifact + DerivedArtifact model | Mobile collectors (V2) |
| Design-graph entity model (incl. Platform, DeviceProfile) | Component detection (V1), component/region search (V3) |
| Job/event model with schema versioning | Technology detection (enrichment, V1) |
| Content-addressable storage + hashing + caching | Visual search / embeddings (V1) |
| Version + change detection hooks | Flow reconstruction (V2) |
| Cost recording (`CostEvent`) | AI search, reports, fingerprints (V3) |
| Crawler/product security boundary | Community, SSO, Slack, billing (Deferred) |

Tension to resolve: item 3 of the "five things to protect" (automated exploration + state dedup) is foundational in value, yet mobile exploration is V2 and web interaction exploration (Level 3) has no stated phase — see [19](19-decisions-assumptions-open-questions.md).
