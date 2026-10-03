# 12 — Data Model and Events

Part of the [engineering docs](README.md). Prev: [11](11-versioning-change-detection.md). Next: [13 Cost](13-cost-performance-and-scaling.md). Entity semantics: [05](05-normalization-and-design-graph.md). Source of truth is PostgreSQL ([02](02-system-architecture.md)); contracts live in `packages/schemas`, `packages/events`, `packages/database`.

Only fields the conversation specifies are listed. All other fields are **Not decided**. ID format (UUID/ULID/etc.) is **Not decided**; all entities carry an `id`.

## Core entities (§4)

```
Organization, User
Source, SourceVersion, CaptureJob, CaptureSession
Product, ProductVersion, Platform, DeviceProfile
Page, Screen, Section, Component, Asset, Animation
Flow, FlowNode, FlowEdge
Interaction, UIState
Collection, CollectionItem, Comment
Tag, Pattern, TaxonomyVersion
Embedding, SearchDocument
RawArtifact, DerivedArtifact
Classification, ClassificationRevision
Technology, TechnologyEvidence
Policy, Authorization, TakedownRequest
```

Also appearing outside that list: `CollectionMember` (§38), `ScreenState` (§20, exploration node), `CostEvent` (§42), `USER_UPLOAD` (§39, used as a source).

## Entity fields stated in the conversation

| Entity | Fields |
|---|---|
| `Source` | id, type (`WEBSITE, WEB_APP, IOS_APP, ANDROID_APP, AUTHORIZED_BUILD`), name, canonical_url, domain, platform, owner, authorization_status, crawl_policy, created_at, updated_at |
| `CaptureJob` | id, source_id, type, status, priority, attempts, max_attempts, started_at, completed_at, error, cost. Status: `QUEUED, RUNNING, PAUSED, WAITING_FOR_AUTH, WAITING_FOR_REVIEW, COMPLETED, FAILED, CANCELLED` |
| `CaptureSession` | **Not decided** (relationship to `CaptureJob` — **Inferred:** one job may span one or more sessions, e.g. device/browser runs with a given profile/state) |
| `RawArtifact` | id, source_id, capture_id, type (`SCREENSHOT, VIDEO, HTML, DOM, UI_TREE, NETWORK_METADATA, ASSET, APP_PACKAGE, LOG, TRACE`), storage_key, sha256, mime_type, size, created_at |
| `DerivedArtifact` | Fields **Not decided**; references the raw artifact(s) it derives from ([04](04-raw-evidence-and-storage.md)) |
| `ProductVersion` | version, platform, release_identifier, captured_at |
| `Asset` | type, source_url, mime, width, height, duration, animated, hash, storage_key |
| `Technology` | name, category, confidence, evidence, detected_at |
| `TechnologyEvidence` | The evidence items (e.g. `__NEXT_DATA__`, `/_next/`); fields **Not decided** |
| `Classification` | label, confidence, source (evidence list) — "every derived attribute" (§32). `ClassificationRevision` records changes/corrections. Full fields **Not decided** |
| `ScreenState` | visual_hash, ui_hash, screenshot, ui_tree, device, app_version |
| `FlowEdge` | from, to, action, coordinates, target, duration |
| `Embedding` | **Not decided** (per entity type and modality — [06](06-intelligence-pipeline.md)) |
| `SearchDocument` | **Not decided** ([07](07-search-and-retrieval-architecture.md)) |
| `CostEvent` | job_id, service, operation, input_units, output_units, compute_seconds, storage_bytes, estimated_cost ([13](13-cost-performance-and-scaling.md)) |
| `Collection` / `CollectionItem` / `CollectionMember` / `Comment` | Items may point to Screen, Flow, Page, Section, Asset, Product (§38) |
| `Policy`, `Authorization`, `TakedownRequest` | Existence only ([10](10-authentication-and-permission-workflows.md), [15](15-security-and-isolation.md)) |

## Relationships (as established)

```
Source ─< CaptureJob ─< RawArtifact
Source ─< SourceVersion / Product ─< ProductVersion
ProductVersion ─< Screen ─< Section ─< Component ─< Asset
Screen/Section ─ Animation ;  Flow ─< FlowNode / FlowEdge  (nodes = screen states)
RawArtifact ─< DerivedArtifact ─< Classification (+ Revisions)
Asset / Page / Section / Screen ─ Embedding ─ SearchDocument
Technology ─< TechnologyEvidence
```

Cardinalities beyond these are **Inferred**; the graph view is in [05](05-normalization-and-design-graph.md).

## Events

Event-driven pipeline (§8, §48); event chain from the Blueprint:

```
crawl.completed → capture.normalize → screen.detected → media.extract → ocr.process
→ vision.classify → taxonomy.classify → embedding.generate → index.update
```

Also used in the schema example: `screen.captured`.

### Event envelope (§48)

```
event_id, event_type, timestamp, source_id, job_id, entity_id, schema_version, payload
```

```json
{
  "event_type": "screen.captured",
  "schema_version": 1,
  "source_id": "...",
  "job_id": "...",
  "entity_id": "...",
  "payload": { "width": 1440, "height": 900, "artifact_id": "..." }
}
```

### Naming and semantics

The chain mixes **past-tense facts** (`crawl.completed`, `screen.detected`, `screen.captured`) with **imperative work items** (`capture.normalize`, `media.extract`, `ocr.process`, `vision.classify`, `taxonomy.classify`, `embedding.generate`, `index.update`). Whether one naming convention should be enforced (facts only, with consumers deciding work) is **Not decided**. The full event catalog (including events for failure, auth-wait, review, cost, change detection) is **Not decided**.

### Schema versioning

`schema_version` is a field on every event (example value `1`). Compatibility policy (backward/forward compatibility, upgrader strategy, registry) is **Not decided**; schemas are housed in `packages/schemas` / `packages/events`.

### Delivery

Queue-based; recommended Redis + BullMQ with a managed queue later (§53). Delivery guarantees, ordering and idempotency requirements are **Not decided**. **Inferred:** consumers should be idempotent because retries and reprocessing are expected ([14](14-failure-recovery-and-reliability.md)) and results are cacheable by input hash ([13](13-cost-performance-and-scaling.md)).

## Events and costs

Every expensive operation produces a `CostEvent` tied to `job_id`; `CaptureJob.cost` aggregates ([13](13-cost-performance-and-scaling.md)).
