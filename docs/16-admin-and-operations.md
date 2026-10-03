# 16 — Admin and Operations

Part of the [engineering docs](README.md). Prev: [15](15-security-and-isolation.md). Next: [17 AI architecture](17-ai-architecture.md).

"The admin application should be treated as a core product" (§40); "you absolutely need an internal dashboard" (IF§25). It is **operator-facing** — it manages the internal data-acquisition system ([01](01-product-context.md)). Placement: `apps/web/admin` and a separate `apps/worker-dashboard` (§2); division of responsibility **Not decided**. Operating principle: "curate the dataset, not manually create it" (IF§27); **"you should be able to manually override anything"** (IF§25, GAP§29).

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

## Ingestion / job dashboard (IF§25)

```
CRAWLER
Active jobs 17 · Completed today 438 · Failed 9 · Auth required 3 · Processing 61

Website    Pages  Screens  Status
Stripe      142     841     ✓
Linear       87     403     ✓
Vercel       64     290     ...
Example      32     112     ⚠
```

Clicking a site shows: discovered URLs, captured pages, screenshots, animations, assets, interactions, technologies, AI classification, errors, quality score. "Auth required" jobs correspond to `WAITING_FOR_AUTH` ([10](10-authentication-and-permission-workflows.md)). (Illustrative numbers.)

## Source management

Create/edit sources, set `type`, `canonical_url`, `authorization_status`, `crawl_policy`/per-domain policy flags, optional site recipes; trigger crawls; supply or re-authenticate sessions for jobs in `WAITING_FOR_AUTH`; "Remove source" with takedown propagation ([15](15-security-and-isolation.md)). The UI for entering credentials: **Not decided**.

## Crawl jobs and failures

Jobs by status, attempts, errors, cost; DLQ view; manual retry; pause/cancel. Granularity of controls: **Not decided**.

## Review queue (§33)

Example "Needs Review":

```
42 uncertain screen types
17 duplicate candidates
 8 bad captures
 6 flow errors
 4 technology uncertainties
```

Earlier example (MB§21): `[Hero?] 0.61`, `[Pricing?] 0.58`, `[Broken image] 0.42`, "one click resolves it". Triggers: low confidence (0.60–0.90 band for lightweight review), broken rendering, missing media, suspicious capture, conflicting classifiers ([06](06-intelligence-pipeline.md)). "Fixing an item should create training data" (`AI prediction → human correction → ground truth`) → feeds `ml/datasets` and the evaluation benchmark. Reviewer roles and SLAs: **Not decided**.

## Admin overrides (GAP§29)

Every automatic decision should be overridable from the dashboard: wrong page type, wrong section, wrong technology, bad screenshot, duplicate, missing screen, incorrect flow, wrong animation classification. Overrides are stored as revisions, not overwrites ([06](06-intelligence-pipeline.md)).

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

(Illustrative.) A **capture quality score** per page/capture (page loaded, fonts/images/lazy content loaded, screenshot valid, no cookie overlay, no blank regions, viewport valid) is shown alongside (IF§26, MB§19).

## Operational metrics

Stated (GAP§26): crawl success rate, pages/hour, screens/hour, average browser time, media GB/day, AI cost/day, AI cost/site, duplicate rate, capture failure rate, classification confidence, human review rate — especially **cost per successfully indexed screen**. Also: job status distribution, storage by tier, classifier precision/recall/F1/false-positive rate on the benchmark ([06](06-intelligence-pipeline.md)). Dataset-quality metrics from the Master Blueprint (MB§69): capture success rate, classification accuracy, broken-capture rate, duplicate rate, review rate. Product-side analytics (search → click/save/collection/export/MCP request; "time to useful reference"; north-star "useful references discovered per active researcher per week") are **Provisional** and belong to the product, not this admin (PLAN§15, MB§69–70). Tooling: Sentry + OpenTelemetry (IF§2); `infrastructure/monitoring` (§2). Alerting: **Not decided**.

## Source health

"Status: Healthy" is shown per source; criteria **Not decided** (**Inferred** inputs: recent crawl success, failure count, needs-review backlog, quality score).

## Notifications

`notification-service` exists in the layout (§2); purpose (operator alerts vs. user-facing change alerts / webhooks) is **Not decided**.
