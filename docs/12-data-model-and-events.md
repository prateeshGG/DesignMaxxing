# 12 — Data Model and Events

Part of the [engineering docs](README.md). Prev: [11](11-versioning-change-detection.md). Next: [13 Cost](13-cost-performance-and-scaling.md). Entity semantics: [05](05-normalization-and-design-graph.md). Source of truth is PostgreSQL ([02](02-system-architecture.md)); contracts live in `packages/schemas`, `packages/events`, `packages/database`.

Only fields the conversation specifies are listed. All other fields are **Not decided**. ID format (UUID/ULID/etc.) is **Not decided**; all entities carry an `id`. The final Blueprint's entity list (§4) is authoritative; earlier table sketches are shown for comparison and marked.

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

Also appearing outside that list: `CollectionMember` (§38), `ScreenState` (§20), `CostEvent` (§42), `USER_UPLOAD` (§39), and — from later clarifications — a per-domain **policy** record (`crawl_allowed, media_allowed, authenticated_allowed, screenshot_allowed, recrawl_allowed, takedown_status`, GAP§2) and **session profiles** (`owner, authorization scope, created_at, expires_at, last_verified, source`, GAP§5). Whether these are the `Policy`/`Authorization` entities or separate tables is **Not decided**.

## Entity fields stated in the conversation

| Entity | Fields |
|---|---|
| `Source` | id, type (`WEBSITE, WEB_APP, IOS_APP, ANDROID_APP, AUTHORIZED_BUILD`), name, canonical_url, domain, platform, owner, authorization_status, crawl_policy, created_at, updated_at |
| `CaptureJob` | id, source_id, type, status, priority, attempts, max_attempts, started_at, completed_at, error, cost. Status: `QUEUED, RUNNING, PAUSED, WAITING_FOR_AUTH, WAITING_FOR_REVIEW, COMPLETED, FAILED, CANCELLED` |
| `CaptureSession` | **Not decided** (**Inferred:** one job may span one or more sessions, e.g. device/browser runs with a given profile/state) |
| `RawArtifact` | id, source_id, capture_id, type (`SCREENSHOT, VIDEO, HTML, DOM, UI_TREE, NETWORK_METADATA, ASSET, APP_PACKAGE, LOG, TRACE`), storage_key, sha256, mime_type, size, created_at |
| `DerivedArtifact` | Fields **Not decided**; references the raw artifact(s) it derives from ([04](04-raw-evidence-and-storage.md)) |
| Provenance (per captured/derived item) | source_url, source_domain, source_type, capture_timestamp, crawl_job_id, app_version, platform, device_profile, acquisition_method, access_authorization, asset_source (GAP§1); data class ∈ raw_capture / derived_asset / AI_generated_metadata / human_verified_metadata |
| `ProductVersion` | version, platform, release_identifier, captured_at (+ capture identity adds viewport, browser_version, crawler_version — MB§40) |
| `Asset` | type, source_url, mime, width, height, duration, animated, hash, storage_key |
| `Technology` | name, category, confidence, evidence, detected_at (status detected/likely/possible/unknown — [06](06-intelligence-pipeline.md)) |
| `TechnologyEvidence` | The evidence items (e.g. `__NEXT_DATA__`, `/_next/`); fields **Not decided** |
| `Classification` | label (value), confidence, source/method (+ model, model_version, prompt_version, timestamp, input_id per AI provenance — GAP§24). `ClassificationRevision` records changes/corrections (AI prediction → human correction → ground truth). Full fields **Not decided** |
| `ScreenState` | visual_hash, ui_hash, screenshot, ui_tree, device, app_version |
| `FlowEdge` | from, to, action, coordinates, target, duration (+ direction for gestures — MOB§8) |
| `Embedding` | **Not decided**; carries `embedding_version` (GAP§23) |
| `SearchDocument` | **Not decided** ([07](07-search-and-retrieval-architecture.md)) |
| `CostEvent` | job_id, service, operation, input_units, output_units, compute_seconds, storage_bytes, estimated_cost ([13](13-cost-performance-and-scaling.md)) |
| `Collection` / `CollectionItem` / `CollectionMember` / `Comment` | Items may point to Screen, Flow, Page, Section, Asset, Product (§38) |
| `Policy`, `Authorization`, `TakedownRequest` | Existence only; `TakedownRequest` semantics now include propagation through derived data ([15](15-security-and-isolation.md)) |

## Earlier schema sketches (for reference; superseded by §4 where they differ)

- WF§7 (web-only): `sites(id, domain, name, category, description, favicon, created_at)`, `pages(id, site_id, url, title, path, page_type)`, `sections(id, page_id, type, order, heading, description, screenshot_url)`, `captures(id, section_id, viewport_width, viewport_height, screenshot_url, video_url, dom_snapshot_url)`, `elements(id, section_id, type, text, bounding_box, selector)`, `embeddings(id, object_id, embedding, embedding_type)`.
- IF§19 tables: `websites, domains, crawl_jobs, pages, page_versions, screens, screen_states, sections, components, assets, animations, interactions, technologies, design_tokens, flows, flow_steps, tags, collections, users` (MB§37 adds `workspaces, captures, versions, tokens, jobs, reviews`).
- Mapping to §4: websites/domains ≈ `Source`/`Product`; crawl_jobs ≈ `CaptureJob`; page_versions/versions ≈ `ProductVersion`; screen_states ≈ `UIState`/`ScreenState`; flow_steps ≈ `FlowNode`/`FlowEdge`; `design_tokens` and `reviews` have no §4 counterpart (**Not decided**: whether design tokens and review items are stored as `Classification`s or separate tables).

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

Cardinalities beyond these are **Inferred**; graph view in [05](05-normalization-and-design-graph.md).

## Events

Event-driven pipeline (§8, §48); chain:

```
crawl.completed → capture.normalize → screen.detected → media.extract → ocr.process
→ vision.classify → taxonomy.classify → embedding.generate → index.update
```

Also in the schema example: `screen.captured`. Product-side webhooks from the Master Blueprint (MB§25, SaaS premise, **Provisional**): `crawl.completed`, `crawl.failed`, `version.detected`, `review.required` — these overlap in name with internal events; whether they are the same stream: **Not decided**.

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

The chain mixes **past-tense facts** (`crawl.completed`, `screen.detected`, `screen.captured`) with **imperative work items** (`capture.normalize`, `media.extract`, `ocr.process`, `vision.classify`, `taxonomy.classify`, `embedding.generate`, `index.update`). Whether one naming convention should be enforced is **Not decided**. The full event catalog (failure, auth-wait, review, cost, change detection, PII, takedown) is **Not decided**.

### Schema versioning

`schema_version` is a field on every event (example `1`). Compatibility policy (backward/forward, upgraders, registry) is **Not decided**; schemas are housed in `packages/schemas` / `packages/events`. Detailed queue/job-type/state-transition specs were listed as a next engineering deliverable (MB§79, GAP "B. Event/job model"): **Not yet written**.

### Delivery

Queue-based; Redis + BullMQ with a managed queue later (§53). Delivery guarantees, ordering and idempotency requirements are **Not decided**. **Inferred:** consumers should be idempotent because retries and reprocessing are expected ([14](14-failure-recovery-and-reliability.md)) and results are cacheable by input hash ([13](13-cost-performance-and-scaling.md)).

## Events and costs

Every expensive operation produces a `CostEvent` tied to `job_id`; `CaptureJob.cost` aggregates ([13](13-cost-performance-and-scaling.md)).
