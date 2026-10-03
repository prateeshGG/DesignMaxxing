# Engineering Documentation — DesignMaxxing

This directory explains **how the product works and how it will be built**. It is extracted from the project conversation, not designed from scratch.

## Source material

| File | Role |
|---|---|
| [`Discussion of the Product`](../Discussion%20of%20the%20Product) | Primary source. Full conversation export (user messages and assistant answers, ~15,000 lines). |
| [`Feature List`](../Feature%20List) | The product feature list. **Referenced, never duplicated, by these docs.** (It is the same list the conversation derives at "Proper feature list for OUR product".) |

### How the conversation unfolds (and which part wins)

The conversation iterates. Later material overrides earlier material; the user's own clarifications override the assistant's assumptions. Citations in these docs use the tags below. Line numbers refer to `Discussion of the Product` as of this documentation revision.

| Tag | Part of the conversation | Lines (approx.) | Status |
|---|---|---|---|
| `TOK` | Token cost of DOM+screenshot browsing vs. a Mobbin-style MCP | 1–50 | Context |
| `WF§n` | First workflow-architecture answer (website-only capture pipeline), sections 1–10 | 872–1592 | Early iteration |
| `RES§n` | Gap review + Reddit/X research, sections 1–25 | 1596–2672 | Early iteration |
| `TECH§n` | Technology-detection and media-automation answer, sections 1–12 | 2676–3175 | Early iteration |
| `AUTO` | "Collection can be almost completely automated" answers | 3697–4389 | Early iteration |
| `PLAN§n` | "Is everything decided?" status table + planning checklist, sections 1–18 | 4391–5285 | Early iteration (identifies gaps) |
| `MB§n` | "Master Blueprint" (assumes **user-facing SaaS** with user-triggered crawls, credits, pricing), sections 1–80 | 5289–8054 | **Partly superseded** by the user's clarification below |
| `AUTH` | First answer on authenticated platforms (user-authorized sessions) | 8058–8665 | **Superseded** (user-facing premise) |
| *User clarification* | *"i am not building this crawling for users it is just for me to collect the data"* | 8667 | **Governing decision** (see [01](01-product-context.md)) |
| `INT` | Internal-ingestion answer (authorized profiles, site recipes, 8 pipelines) | 8669–9226 | Current |
| `IF§n` | "Internal ingestion factory" production architecture, sections 1–35 | 9230–10652 | Current (bootstrapping guidance) |
| `MOB§n` | Mobile-app collection answer, sections 1–21 | 10656–11549 | Current |
| `GAP§n` | "Is anything left to consider?", sections 1–30 | 11553–12557 | Current |
| `§n` | **Engineering Blueprint**, sections 1–74 (final) | 12561–14983 | **Final / authoritative** |

Precedence rule used throughout: **founder decisions in [20](20-founder-decisions-and-plan-validation.md) > Engineering Blueprint (`§n`) > clarifications by the user > `INT`/`IF`/`MOB`/`GAP` > earlier iterations**. Material from superseded iterations is kept only where it adds detail the final blueprint does not contradict, and is tagged. Conflicts are listed in [19](19-decisions-assumptions-open-questions.md) §4.

## Process

Specification work follows [`process/project-breakdown-protocol.md`](process/project-breakdown-protocol.md) (Stage 1 Parts Hierarchy → Stage 2 Part-Spec per Part → Stage 3 task lists). Current position: **Stage 1 complete and awaiting founder review** ([21](21-parts-hierarchy.md)); Stage 2 has not started.

## How to read these docs

Status markers used everywhere:

| Marker | Meaning |
|---|---|
| *(unmarked)* | Stated in the conversation. |
| **Inferred** | Not stated; deduced from the conversation. Treat as a proposal to confirm. |
| **Not decided** | The conversation does not settle it. |
| **Provisional** | Stated in the conversation but explicitly provisional / "not permanently locked". |
| **Superseded** | Stated earlier, overridden later; recorded as history only. |
| **[Foundational]** | The conversation treats it as a core architectural asset (the "five things to protect"). |
| **[V0] [V1] [V2] [V3]** | The phase in which the final blueprint places it. |
| **[Deferred]** | Explicitly not built initially. |

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
| 08 | [Web collection](08-web-collection.md) | HTTP discovery, Playwright, capture protocol, responsive, media, technology detection |
| 09 | [iOS/Android collection](09-ios-android-collection.md) | MobileCollector, exploration graph, state dedup, flows |
| 10 | [Authentication and permission workflows](10-authentication-and-permission-workflows.md) | WAITING_FOR_AUTH, session profiles, test states, dangerous actions |
| 11 | [Versioning and change detection](11-versioning-change-detection.md) | ProductVersion, diffs, incremental processing, scheduling |
| 12 | [Data model and events](12-data-model-and-events.md) | Entities, fields, event envelope |
| 13 | [Cost, performance, scaling](13-cost-performance-and-scaling.md) | CostEvent, caching, dedup, model routing, economic principles |
| 14 | [Failure, recovery, reliability](14-failure-recovery-and-reliability.md) | Retries, DLQ, crashes, checkpoints, disaster recovery |
| 15 | [Security and isolation](15-security-and-isolation.md) | Crawler VPC, credentials, PII, takedown, legal |
| 16 | [Admin and operations](16-admin-and-operations.md) | Dashboard, review queue, overrides, health, costs |
| 17 | [AI architecture](17-ai-architecture.md) | Where AI is and is not used, routing, cache keys, evaluation |
| 18 | [Roadmap V0–V3](18-mvp-v1-v2-v3-roadmap.md) | Phases, deferred items, superseded roadmap history |
| 19 | [Decisions, assumptions, open questions](19-decisions-assumptions-open-questions.md) | Consolidated register + conflicts between iterations |
| 20 | [Founder decisions and plan validation](20-founder-decisions-and-plan-validation.md) | Decisions on the open questions (`F-xx`), plan validation, scale posture, experiments, stage gates, risk register. **Overrides 01–19 where they conflict** |
| 21 | [Parts hierarchy](21-parts-hierarchy.md) | Stage 1 of the [breakdown protocol](process/project-breakdown-protocol.md): ordered Groups → Parts |
| 22 | [Data collection resilience architecture](22-data-collection-resilience-architecture.md) | Never-stuck collection: supervised bounded execution, strategy ladder, publishability gate (no unusable data to users), self-healing, torture suite. Decisions `DC-01…DC-13` |
| 23 | [Scrapling evaluation and collection gap analysis](23-scrapling-evaluation-and-collection-gap-analysis.md) | Verified review of Scrapling (not adopted as core; rules for any use), honest list of unsolved collection problems, added decisions `SC-01…05`, `DC-14…18` |

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

- **Source** — anything we collect from: `WEBSITE`, `WEB_APP`, `IOS_APP`, `ANDROID_APP`, `AUTHORIZED_BUILD`. A **Source Adapter** (GAP§30) is the acquisition mechanism per source kind (Web URL, authorized web session, iOS authorized build, Android APK/AAB, internal test build).
- **Platform** — web, iOS, Android. The same vocabulary (Screen, Section, Component, Flow, State) is used for all three (with the exceptions noted in [05](05-normalization-and-design-graph.md)).
- **Raw evidence / RawArtifact** — immutable capture output. **DerivedArtifact** — anything regenerated from it.
- **Design graph** — the common normalized representation across platforms. The conversation also calls the stored result the "design dataset" / "observation graph"; these are the same thing.
- **Collector** — internal data-acquisition system (web-crawler, ios-collector, android-collector). It is **not** a user-facing crawling product.
- **Website observation engine** — the conversation's framing of the web collector: the browser *observes* a site and produces a structured dataset, rather than "taking screenshots" (TECH§12).
