# 03 — Capture and Crawling Workflow

Part of the [engineering docs](README.md). Prev: [02](02-system-architecture.md). Next: [04 Raw evidence](04-raw-evidence-and-storage.md).

This is an **internal data-acquisition workflow** for building our dataset. It is not a user-facing crawling product ([01](01-product-context.md)). Web specifics: [08](08-web-collection.md). Mobile: [09](09-ios-android-collection.md). Auth: [10](10-authentication-and-permission-workflows.md). Failures: [14](14-failure-recovery-and-reliability.md).

## End-to-end collection workflow

```
Source ─► Source Manager ─► crawl orchestration ─► CaptureJob(s)
                                                       │
            ┌──────────────────────────────────────────┤
            ▼                    ▼                     ▼
   Level 1 HTTP discovery  Level 2 browser render  Level 3 interaction exploration
   (cheap)                 (Chromium/Playwright)   (only "expensive" pages)
            └──────────────────────────────────────────┤
                                                       ▼
                                      RawArtifacts + events (e.g. crawl.completed)
                                                       ▼
                                      normalization → intelligence → design graph
```

The capture side stops at **raw evidence plus events**. Everything after is downstream and asynchronous ([02](02-system-architecture.md)).

## Source manager

Everything starts with a `Source` (§5). Fields: `id, type, name, canonical_url, domain, platform, owner, authorization_status, crawl_policy, created_at, updated_at`. Types: `WEBSITE, WEB_APP, IOS_APP, ANDROID_APP, AUTHORIZED_BUILD`.

Responsibilities of the `source-manager` (§1): **authorization, scheduling, crawl policy, source metadata**. The content of `crawl_policy` (e.g. depth, rate limits, robots handling, per-source allow/deny rules) and the scheduler's cadence rules are **Not decided**. The admin dashboard example shows "Last crawl: 2h ago / Next crawl: tomorrow" ([16](16-admin-and-operations.md)), implying recurring scheduled crawls.

Operator entry points: `GET/POST /sources`, `POST /sources/:id/crawl` (§47).

## Crawl orchestration

Role of `crawl-orchestrator`: **Inferred** — owns the crawl job lifecycle, fan-out into `CaptureJob`s, checkpoint state and resumption. The Blueprint specifies its observable behavior (jobs, statuses, checkpoints, retries) but not its internals.

## URL discovery — Level 1

Cheap HTTP path (§9):

```
URL → HTTP → HTML → links → metadata
```

Purpose: discover candidate URLs without paying for a browser. Use of sitemaps, robots.txt, or link-priority heuristics is **Not decided**.

## Browser rendering — Level 2

Chromium/Playwright (§9): `URL → browser → render → wait → capture`. Collected: DOM, CSS, viewport, screenshots, network metadata, console errors, navigation, links, assets. Details in [08](08-web-collection.md).

## Interaction exploration — Level 3

"Only expensive pages get this treatment." Loop (§9):

```
render → detect interactive elements → rank actions → execute →
wait for stability → capture → compare state → repeat
```

- **Ranking:** every candidate action is scored: `action_score = novelty + semantic_importance + navigation_probability + visual_prominence − repetition − risk` (§22).
- **Priority:** navigation, buttons, tabs, menus, CTAs, forms, filters, dialogs, carousels, expanders first; decorative elements, external links, repeated cards, social widgets lower.
- **Safety:** dangerous actions default to DO NOT EXECUTE ([10](10-authentication-and-permission-workflows.md)).
- **Termination:** "compare state" uses state deduplication so exploration does not loop forever (state deduplication is specified for apps in §21, see [09](09-ios-android-collection.md); Level 3 lists "compare state" in §9. Applying the same weighted-similarity method to web states is **Inferred**).
- Criteria for what counts as an "expensive page", the signal weights, and exploration budgets are **Not decided**.
- Phase for web Level 3: **Not decided** (the V0 list in §68 names crawl, screenshots, section detection, assets, animation detection — not interaction exploration).

## Capture jobs

Everything asynchronous is a job (§7).

```
CaptureJob: id, source_id, type, status, priority, attempts, max_attempts,
            started_at, completed_at, error, cost
```

Statuses: `QUEUED, RUNNING, PAUSED, WAITING_FOR_AUTH, WAITING_FOR_REVIEW, COMPLETED, FAILED, CANCELLED`. A `CaptureSession` entity also exists (§4) but its fields are **Not decided** ([12](12-data-model-and-events.md)). `CaptureJob.type` values are **Not decided**.

## Crawl lifecycle

Statuses are from the Blueprint; **transitions below are Inferred**.

```
QUEUED ─► RUNNING ─► COMPLETED
            │  ▲
            │  └── resume (new worker, from checkpoint)
            ├─► PAUSED
            ├─► WAITING_FOR_AUTH ─(operator supplies session)─► RUNNING
            ├─► WAITING_FOR_REVIEW ─► RUNNING / COMPLETED
            ├─► FAILED   (retries exhausted → dead-letter queue, manual retry)
            └─► CANCELLED
```

- `WAITING_FOR_AUTH`: entered when the collector hits `LOGIN_REQUIRED` (§24, [10](10-authentication-and-permission-workflows.md)).
- `WAITING_FOR_REVIEW`: meaning is not defined in the conversation. **Inferred:** the job needs a human decision (e.g. bad capture, policy question). See [16](16-admin-and-operations.md).

## Checkpoints

For large sites a job tracks (§51):

```
Job
 ├── discovered URLs
 ├── completed URLs
 ├── failed URLs
 └── pending URLs
```

"If the process dies, resume." Combined with disposable browser workers: a crashed browser worker is destroyed, a new one spawned, and work resumes from the checkpoint (§50) — see [14](14-failure-recovery-and-reliability.md). Checkpoint storage location is **Not decided** (**Inferred:** Postgres, since it is the source of truth for metadata).

## State handling

- Web: Level 3 compares state after each action; page-level and section-level captures are separate ([08](08-web-collection.md)).
- Mobile: each screen is a `ScreenState` node; states are deduplicated by weighted similarity ([09](09-ios-android-collection.md)).
- Controlled test states (fresh install, permissions, logged in/out): [10](10-authentication-and-permission-workflows.md).

## How the system avoids unnecessary work

Collected from across the Blueprint (full treatment in [13](13-cost-performance-and-scaling.md)):

| Mechanism | Where |
|---|---|
| Cheap HTTP discovery before browser rendering | Level 1 vs 2 |
| Interaction exploration only on pages that warrant it | Level 3 |
| Responsive matrix is conditional: desktop and mobile baseline; tablet conditional; extra sizes only when meaningful differences are detected | §12, [08](08-web-collection.md) |
| Re-crawl → diff → process only changed material | §73, [11](11-versioning-change-detection.md) |
| Hash-keyed caching of screenshots, assets, OCR, embeddings, classification, video | §43, [04](04-raw-evidence-and-storage.md) |
| Content-addressable storage: shared assets stored once | §44 |
| State deduplication prevents infinite exploration | §21 |
| Action scoring avoids random clicking | §22 |
| Checkpoints avoid restarting a large crawl | §51 |
| Decoupled stages: a downstream failure does not trigger a re-crawl | §8 |
