# Part-Specs (Stage 2) and task lists (Stage 3)

Part of the [engineering docs](../README.md). Each file here is one Part from the [Parts Hierarchy](../21-parts-hierarchy.md) (v1.1), written with the [Part-Spec Prompt Template](../process/part-spec-prompt-template.md). Task lists (Stage 3) live in [`tasks/`](tasks/) and are produced only from a reviewed spec.

**Status key:** `draft` = written, waiting for founder review · `reviewed` = founder approved, task list may be written · `tasks` = task list written · `building` = tasks in progress.

## Collection path (specified first, in dependency waves)

| Wave | Part | Spec | Status | Task list |
|---|---|---|---|---|
| 1 | 1.1 Repository, Environments & Delivery | [1.1](1.1-repository-environments-delivery.md) | draft | — |
| 1 | 1.2 Core Data Platform | [1.2](1.2-core-data-platform.md) | draft | — |
| 1 | 1.3 Object Storage & Artifact Registry | [1.3](1.3-object-storage-artifact-registry.md) | draft | — |
| 1 | 1.4 Job Queue, Events & Reliability | [1.4](1.4-job-queue-events-reliability.md) | draft | — |
| 1 | 1.5 Source & Policy Registry | [1.5](1.5-source-policy-registry.md) | draft | — |
| 2 | 2.1 URL Discovery & Prioritization | — | not started | — |
| 2 | 2.2 Browser Capture Runtime | — | not started | — |
| 2 | 2.9 Supervisor, Watchdogs & Circuit Breakers | — | not started | — |
| 3 | 2.3 Page & Section Capture | — | not started | — |
| 3 | 2.4 Media Extraction & Animation Capture | — | not started | — |
| 3 | 2.5 Crawl Orchestration & Lifecycle | — | not started | — |
| 3 | 2.10 Capture Validation & Publishability Gate | — | not started | — |
| 4 | 2.11 Collection Test Harness | — | not started | — |

**How the waves work:** a wave's specs are written from the template and must conform to the specs of earlier waves (treated as frozen once reviewed). Within a wave, ownership boundaries were fixed up front so parallel specs do not overlap. After each wave, a consistency review checks that table, state, job and event names match across specs.

Everything else in the hierarchy (3.x, 4.x, 5.x, 6.x, 1.6–1.8, 8.x) is specified after the collection path, in the order listed at the end of [21](../21-parts-hierarchy.md).
