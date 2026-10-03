# 13 — Cost, Performance and Scaling

Part of the [engineering docs](README.md). Prev: [12](12-data-model-and-events.md). Next: [14 Failure and recovery](14-failure-recovery-and-reliability.md).

Cost is a core constraint: the goal is "a cheap but technically strong Mobbin alternative" (§ closing; User: "cheaper"). The conversation gives **mechanisms**, not numbers. There are no cost estimates, budgets or per-unit price assumptions in the source. Those are **Not decided**.

## CostEvent (§42)

Every expensive operation gets a cost record:

```
CostEvent: job_id, service, operation, input_units, output_units,
           compute_seconds, storage_bytes, estimated_cost
```

Derived metrics: **cost / site, cost / screen, cost / flow, cost / successful capture.** `CaptureJob.cost` carries the per-job total. What is "expensive" (the threshold for emitting a CostEvent) is **Not decided**. Displayed in the admin dashboard ([16](16-admin-and-operations.md)).

## Cost-saving mechanisms (preserved)

| Mechanism | Description | Doc |
|---|---|---|
| **Caching** | Key on hash of input: screenshot, asset, OCR, embedding, classification, video. Same input → CACHE HIT (§43). | [04](04-raw-evidence-and-storage.md) |
| **AI caching** | `input_hash + model + model_version + prompt_version + taxonomy_version` (§56) | [17](17-ai-architecture.md) |
| **Content-addressable storage** | 20 sites using one asset → 1 physical file, 20 references (§44) | [04](04-raw-evidence-and-storage.md) |
| **Deduplication** | Duplicate detection (deterministic), state dedup for exploration (§21, §54) | [09](09-ios-android-collection.md) |
| **Conditional responsive capture** | desktop/mobile baseline, tablet conditional, extras only on meaningful difference (§12) | [08](08-web-collection.md) |
| **Incremental crawling** | Re-crawl → diff → only changed material processed; "the economic foundation" (§73) | [11](11-versioning-change-detection.md) |
| **Tiered web crawling** | Cheap HTTP discovery before browser; interaction exploration only on "expensive pages" (§9) | [03](03-capture-and-crawling-workflow.md) |
| **Deterministic-first processing** | Code for everything code can do; models only where needed; "will reduce cost dramatically" (§54) | [17](17-ai-architecture.md) |
| **LLM/VLM only for ambiguity** | Not "an LLM in every step" | [17](17-ai-architecture.md) |
| **Action scoring** | Avoid wasting browser/device time on random or repeated actions (§22) | [09](09-ios-android-collection.md) |
| **Storage tiers** | HOT / WARM / COLD; user-facing product doesn't need raw crawl online (§45) | [04](04-raw-evidence-and-storage.md) |
| **CDN + on-demand derivatives** | Frontend never pulls large originals; generate sizes on demand (§46) | [04](04-raw-evidence-and-storage.md) |
| **Checkpoints / resumability** | Don't redo a large crawl after a crash (§50–51) | [14](14-failure-recovery-and-reliability.md) |
| **Decoupled stages** | A failed AI stage doesn't force re-crawl (§8) | [02](02-system-architecture.md) |
| **Immutable raw + reprocessing** | Improve models without re-crawling (§6) | [04](04-raw-evidence-and-storage.md) |
| **pgvector first** | No dedicated vector DB initially (§53) | [07](07-search-and-retrieval-architecture.md) |
| **Phase discipline** | Don't build community, SSO, etc. before validating the core data engine (§68, §72) | [18](18-mvp-v1-v2-v3-roadmap.md) |

## Expensive-operation policy

The conversation identifies the expensive operations implicitly; the policy below is assembled from it.

| Operation | Gate stated in the conversation |
|---|---|
| Browser rendering | Only after cheap Level 1 discovery |
| Interaction exploration (Level 3) | Only expensive pages; scored actions; dedup; risk-penalized |
| Tablet / extra viewports | Only when meaningful differences are detected |
| LLM/VLM calls | Only for semantic classification, taxonomy mapping, flow naming, section interpretation, ambiguous UI, query interpretation; always cache-keyed |
| Re-processing unchanged content | Skipped via incremental processing and cache hits |
| Mass reprocessing after model change | **Not decided** (budget guard, sampling, prioritization) |
| Mobile device/emulator time | **Not decided** |

Caps or hard budgets per source/job: **Not decided** (`CaptureJob.cost` and `CostEvent` make them possible; **Inferred**).

## Browser utilization

Browser workers are disposable, one session never owns an entire crawl (§50). Browser time is the main scarce compute in V0; Level 1/2/3 tiering and conditional viewports exist to conserve it. Concurrency limits, pool sizing, and per-domain rate limits: **Not decided**.

## Compute and storage considerations

- Screenshots, videos and assets can be large: object storage + CAS + tiering + CDN ([04](04-raw-evidence-and-storage.md)). Videos are produced as normalized derivatives; retention of both original and normalized forms is part of the three-representation rule ([08](08-web-collection.md)).
- Postgres stays small (metadata/relationships only) (§3).
- Search/vector indexes grow with the number of entities × embedding types ([07](07-search-and-retrieval-architecture.md)); capacity: **Not decided**.
- Scaling to "millions of heterogeneous captures" is the stated horizon (§ closing); no concrete target scale (number of sources, crawl frequency) is stated. **Not decided.**

## Economic principles from the conversation

1. **Do not pay twice** for the same input (cache hits).
2. **Store once, reference many** (CAS).
3. **Crawl cheaply first; spend browser/model time only where it adds value.**
4. **Only changed material is reprocessed** (incremental).
5. **Raw evidence is kept so models can improve without re-crawling** — a cost *trade*: storage is spent to avoid repeated crawling.
6. **Measure cost per site/screen/flow/successful capture** — if you can't measure it, you can't control it.
7. **Validate the core data engine before building expensive product breadth.**
