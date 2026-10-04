# Part-Specs (Stage 2) and task lists (Stage 3)

Part of the [engineering docs](../README.md). Each file here is one Part from the [Parts Hierarchy](../21-parts-hierarchy.md) (v1.1), written with the [Part-Spec Prompt Template](../process/part-spec-prompt-template.md). Task lists (Stage 3) live in [`tasks/`](tasks/) and are produced only from a reviewed spec.

**Status key:** `draft` = written, waiting for founder review · `reviewed` = founder approved, task list may be written · `tasks` = task list written · `building` = tasks in progress.

## Collection path (specified first, in dependency waves)

| Wave | Part | Spec | Status | Task list |
|---|---|---|---|---|
| 1 | 1.1 Repository, Environments & Delivery | [1.1](1.1-repository-environments-delivery.md) | tasks | [1.1 tasks](tasks/1.1-tasks.md) |
| 1 | 1.2 Core Data Platform | [1.2](1.2-core-data-platform.md) | tasks | [1.2 tasks](tasks/1.2-tasks.md) |
| 1 | 1.3 Object Storage & Artifact Registry | [1.3](1.3-object-storage-artifact-registry.md) | tasks | [1.3 tasks](tasks/1.3-tasks.md) |
| 1 | 1.4 Job Queue, Events & Reliability | [1.4](1.4-job-queue-events-reliability.md) | tasks | [1.4 tasks](tasks/1.4-tasks.md) |
| 1 | 1.5 Source & Policy Registry | [1.5](1.5-source-policy-registry.md) | tasks | [1.5 tasks](tasks/1.5-tasks.md) |
| 2 | 2.1 URL Discovery & Prioritization | [2.1](2.1-url-discovery-prioritization.md) | tasks | [2.1 tasks](tasks/2.1-tasks.md) |
| 2 | 2.2 Browser Capture Runtime | [2.2](2.2-browser-capture-runtime.md) | tasks | [2.2 tasks](tasks/2.2-tasks.md) |
| 2 | 2.9 Supervisor, Watchdogs & Circuit Breakers | [2.9](2.9-supervisor-watchdogs-circuit-breakers.md) | tasks | [2.9 tasks](tasks/2.9-tasks.md) |
| 3 | 2.3 Page & Section Capture | [2.3](2.3-page-section-capture.md) | tasks | [2.3 tasks](tasks/2.3-tasks.md) |
| 3 | 2.4 Media Extraction & Animation Capture | [2.4](2.4-media-extraction-animation-capture.md) | tasks | [2.4 tasks](tasks/2.4-tasks.md) |
| 3 | 2.5 Crawl Orchestration & Lifecycle | [2.5](2.5-crawl-orchestration-lifecycle.md) | tasks | [2.5 tasks](tasks/2.5-tasks.md) |
| 3 | 2.10 Capture Validation & Publishability Gate | [2.10](2.10-capture-validation-publishability-gate.md) | tasks | [2.10 tasks](tasks/2.10-tasks.md) |
| 4 | 2.11 Collection Test Harness | [2.11](2.11-collection-test-harness.md) | tasks | [2.11 tasks](tasks/2.11-tasks.md) |

**Build order:** [tasks/README.md](tasks/README.md): 896 tasks in eight milestones, from the workspace on the founder's computer to the 20-site spike.

**Wave 1 review:** [review-wave-1.md](review-wave-1.md) (fixes made, names later waves must use, top founder decisions).

**Wave 2 review:** [review-wave-2.md](review-wave-2.md) (fixes made to 1.1, 1.3, 1.4, 1.5, 2.1, 2.9, names later waves must use, carried-forward questions, founder decisions).

**Wave 3 review:** [review-wave-3.md](review-wave-3.md) (fixes made to 1.1 to 1.5, 2.1, 2.2, 2.9 and the four wave-3 specs, names later waves must use, carried-forward questions, founder decisions).

**How the waves work:** a wave's specs are written from the template and must conform to the specs of earlier waves (treated as frozen once reviewed). Within a wave, ownership boundaries were fixed up front so parallel specs do not overlap. After each wave, a consistency review checks that table, state, job and event names match across specs.

Everything else in the hierarchy (3.x, 4.x, 5.x, 6.x, 1.6–1.8, 8.x) is specified after the collection path, in the order listed at the end of [21](../21-parts-hierarchy.md).
