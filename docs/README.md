# Engineering Documentation — Design Intelligence Platform

This directory explains **how the product works and how it will be built**. It is extracted from the project conversation, not designed from scratch.

## Source material

| File | Role |
|---|---|
| [`Discussion of the Product`](../Discussion%20of%20the%20Product) | Primary source. Conversation export. Contains the user's requests and one assistant message, the 74-section "Engineering Blueprint". |
| [`Feature List`](../Feature%20List) | The product feature list. **Referenced, never duplicated, by these docs.** |

**Source limitation.** The export contains the user's messages in full but only one assistant message (the Blueprint, starting at line 678 of the file). The assistant answers that sat between the user's questions (for example the answers about how hard framework detection is, token cost of browser automation vs. an MCP, and "is anything left to consider") are not in the export. Anything those answers might have decided is therefore **Not decided** here.

## How to read these docs

Citations like `§23` refer to the numbered sections (1–74) of the Blueprint in `Discussion of the Product`. `User:` marks something the user said directly.

Status markers used everywhere:

| Marker | Meaning |
|---|---|
| *(unmarked)* | Stated in the conversation. |
| **Inferred** | Not stated; deduced from the conversation. Treat as a proposal to confirm. |
| **Not decided** | The conversation does not settle it. |
| **[Foundational]** | The conversation treats it as a core architectural asset (§ "five things to protect"). |
| **[V0] [V1] [V2] [V3]** | The phase in which the conversation places it. |
| **[Deferred]** | Explicitly not built initially (§72). |

## Index

| # | Document | Covers |
|---|---|---|
| 01 | [Product context](01-product-context.md) | What, why, scope, relation to the Feature List |
| 02 | [System architecture](02-system-architecture.md) | Pipeline, services, monorepo, sync vs async, principles |
| 03 | [Capture and crawling workflow](03-capture-and-crawling-workflow.md) | Source manager → orchestration → capture jobs → checkpoints |
| 04 | [Raw evidence and storage](04-raw-evidence-and-storage.md) | Immutable evidence, CAS, caching, tiers, CDN, reprocessing |
| 05 | [Normalization and design graph](05-normalization-and-design-graph.md) | Canonical entities, unified web/iOS/Android model |
| 06 | [Intelligence pipeline](06-intelligence-pipeline.md) | Deterministic, OCR, CV, classification, confidence, review, evaluation |
| 07 | [Search and retrieval](07-search-and-retrieval-architecture.md) | Query pipeline, indexes, ranking, diversification |
| 08 | [Web collection](08-web-collection.md) | HTTP discovery, Playwright, responsive, media, technology detection |
| 09 | [iOS/Android collection](09-ios-android-collection.md) | MobileCollector, exploration graph, state dedup, flows |
| 10 | [Authentication and permission workflows](10-authentication-and-permission-workflows.md) | WAITING_FOR_AUTH, test states, dangerous actions |
| 11 | [Versioning and change detection](11-versioning-change-detection.md) | ProductVersion, diffs, incremental processing |
| 12 | [Data model and events](12-data-model-and-events.md) | Entities, fields, event envelope |
| 13 | [Cost, performance, scaling](13-cost-performance-and-scaling.md) | CostEvent, caching, dedup, economic principles |
| 14 | [Failure, recovery, reliability](14-failure-recovery-and-reliability.md) | Retries, DLQ, crashes, checkpoints |
| 15 | [Security and isolation](15-security-and-isolation.md) | Crawler VPC, credentials, data handling |
| 16 | [Admin and operations](16-admin-and-operations.md) | Dashboard, review queue, health, costs |
| 17 | [AI architecture](17-ai-architecture.md) | Where AI is and is not used, cache keys, evaluation |
| 18 | [Roadmap V0–V3](18-mvp-v1-v2-v3-roadmap.md) | Phases and deferred items |
| 19 | [Decisions, assumptions, open questions](19-decisions-assumptions-open-questions.md) | Consolidated register |

## Cross-document dependency map

```
01 context ─► 02 architecture ─┬─► 03 capture ─┬─► 08 web
                               │               ├─► 09 mobile ─► 10 auth
                               │               └─► 14 failure
                               ├─► 04 storage ─► 13 cost
                               ├─► 05 graph ◄─ 12 data model/events
                               ├─► 06 intelligence ─► 17 AI
                               ├─► 07 search
                               ├─► 11 versioning
                               ├─► 15 security
                               └─► 16 admin
18 roadmap and 19 register cut across everything.
```

## Terminology (fixed across all documents)

- **Source** — anything we collect from: `WEBSITE`, `WEB_APP`, `IOS_APP`, `ANDROID_APP`, `AUTHORIZED_BUILD`.
- **Platform** — web, iOS, Android. The same vocabulary (Screen, Section, Component, Flow, State) is used for all three.
- **Raw evidence / RawArtifact** — immutable capture output. **DerivedArtifact** — anything regenerated from it.
- **Design graph** — the common normalized representation across platforms.
- **Collector** — internal data-acquisition system (web-crawler, ios-collector, android-collector). It is **not** a user-facing crawling product.
