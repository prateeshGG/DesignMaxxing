# 16 — Admin and Operations

Part of the [engineering docs](README.md). Prev: [15](15-security-and-isolation.md). Next: [17 AI architecture](17-ai-architecture.md).

"The admin application should be treated as a core product" (§40). It is **operator-facing** — it manages the internal data-acquisition system ([01](01-product-context.md)). Placement: `apps/web/admin` and a separate `apps/worker-dashboard` (§2); how they divide responsibility is **Not decided**.

## Admin dashboard sections (§40)

Sources · Crawl Jobs · Failures · Screens · Flows · Assets · Animations · Technology · Classifications · Reviews · Versions · Storage · Costs

| Section | Backed by |
|---|---|
| Sources | `Source`; `GET/POST /sources`, `POST /sources/:id/crawl` — [03](03-capture-and-crawling-workflow.md) |
| Crawl Jobs / Failures | `CaptureJob`; `GET /jobs`, `GET /jobs/:id`; DLQ with manual retry — [14](14-failure-recovery-and-reliability.md) |
| Screens, Flows, Assets, Animations | Design graph entities — [05](05-normalization-and-design-graph.md) |
| Technology | `Technology` / `TechnologyEvidence` (uncertainties reviewed) — [06](06-intelligence-pipeline.md) |
| Classifications | `Classification` / `ClassificationRevision`; edit/correct — [06](06-intelligence-pipeline.md) |
| Reviews | Human review queue |
| Versions | `ProductVersion`, diffs — [11](11-versioning-change-detection.md) |
| Storage | Tier usage, object storage — [04](04-raw-evidence-and-storage.md) |
| Costs | `CostEvent` aggregates — [13](13-cost-performance-and-scaling.md) |

## Source management

Create/edit sources, set `type`, `canonical_url`, `authorization_status`, `crawl_policy`; trigger crawls; supply authorized sessions for jobs in `WAITING_FOR_AUTH` ([10](10-authentication-and-permission-workflows.md)). The UI for entering credentials is **Not decided** ([15](15-security-and-isolation.md)).

## Crawl jobs and failures

Jobs by status (`QUEUED … CANCELLED`), attempts, errors, cost; DLQ view; manual retry. Cancel/pause controls follow the `PAUSED`/`CANCELLED` states. Granularity of controls: **Not decided**.

## Review queue (§33)

Example "Needs Review":

```
42 uncertain screen types
17 duplicate candidates
 8 bad captures
 6 flow errors
 4 technology uncertainties
```

"Fixing an item should create training data" → feeds `ml/datasets` and the evaluation benchmark ([06](06-intelligence-pipeline.md), [17](17-ai-architecture.md)). Reviewer roles and SLAs: **Not decided**.

## Per-source dashboard (§41)

```
Stripe
────────────────────────
Status: Healthy

Pages:             184
Screens:           742
Sections:        1,231
Assets:          4,902
Animations:         87
Flows:              42

Last crawl:      2h ago
Next crawl:      tomorrow

Failures:           3
Needs review:       7
```

(Illustrative numbers from the conversation.)

## Operational metrics

Stated or implied by the conversation: counts per source (pages, screens, sections, assets, animations, flows), last/next crawl, failures, needs-review count, job status distribution, cost per site/screen/flow/successful capture, storage usage by tier, classifier precision/recall/F1/false-positive rate on the benchmark ([06](06-intelligence-pipeline.md)). Metrics infrastructure: `infrastructure/monitoring` (§2); tooling **Not decided**. Alerting: **Not decided**.

## Source health

"Status: Healthy" is shown per source; criteria are **Not decided** (**Inferred** inputs: recent crawl success, failure count, needs-review backlog).

## Notifications

`notification-service` exists in the layout (§2); purpose (operator alerts, user notifications for e.g. change monitoring) is **Not decided**.
