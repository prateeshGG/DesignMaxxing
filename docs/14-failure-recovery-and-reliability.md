# 14 — Failure, Recovery and Reliability

Part of the [engineering docs](README.md). Prev: [13](13-cost-performance-and-scaling.md). Next: [15 Security](15-security-and-isolation.md). Job model: [03](03-capture-and-crawling-workflow.md); events: [12](12-data-model-and-events.md).

## Per-worker requirements (§49)

Every worker needs: **timeout, retry, backoff, dead-letter queue (DLQ)**.

Example retry sequence from the conversation:

```
Attempt 1 ─ failure ─► wait 30 s ─► Attempt 2 ─ failure ─► wait 5 min ─►
Attempt 3 ─ failure ─► DLQ
```

An **example**, not a mandated policy: values for timeouts, backoff curve, and `max_attempts` per job type are **Not decided** (`CaptureJob` carries `attempts`, `max_attempts`). Admin can **retry manually** from the DLQ ([16](16-admin-and-operations.md)). The planning stage named "Failure/retry system" a gap (PLAN) and a "failure/retry matrix" a next deliverable (MB§80); the matrix was not written. Redis + BullMQ is the stated job queue (§53), so BullMQ's retry/backoff facilities are the likely mechanism (**Inferred**).

## Worker failures

Stages communicate through queues and are decoupled, so one failing service doesn't force upstream work to rerun: "If the AI classifier dies, the crawler doesn't have to run again" (§8). Retries are per stage/event. Consumer idempotency is **Inferred** as a requirement.

## Browser crashes (§50)

Browser workers are disposable:

```
Job → Browser worker → crash → worker destroyed → new worker → resume from checkpoint
```

"Never make one browser session responsible for the entire crawl." This coexists with *browser reuse across pages* for efficiency (MB§30): the Chromium process is recycled periodically and replaced on crash. Crawled sites run in isolated, ephemeral containers that are destroyed after capture (MB§61, [15](15-security-and-isolation.md)). Mobile emulators/simulators/devices: same principle expected; specifics **Not decided** ([09](09-ios-android-collection.md)).

## Checkpoints and resumability (§51)

Per job: discovered, completed, failed, pending URLs. "If the process dies, resume." Mid-page state (e.g. in the middle of Level 3 exploration) is **Not decided**; the stated granularity is the URL. For mobile exploration, the graph of `ScreenState`/`FlowEdge` is the natural checkpoint (**Inferred**). **Crawl manifests** make a crawl reproducible (GAP§27).

## Partial failures

- **"A failed page should not fail the entire website."** (IF§4) A site crawl can end in `PARTIAL`; the failed URLs remain in the checkpoint. Mapping `PARTIAL` to the final job statuses (`COMPLETED` vs `FAILED`) is **Not decided** ([03](03-capture-and-crawling-workflow.md)).
- A capture may succeed while downstream processing fails (OCR, classification): raw evidence remains; the failed stage is retried independently.
- **Capture quality gate:** every capture gets a quality score; failures must be explicit — "never silently publish a broken capture"; low-quality captures do not enter the public dataset (MB§19, IF§26).
- Bad captures, duplicate candidates and flow errors appear in the review queue (§33; [16](16-admin-and-operations.md)).
- Blocked/bot-protected sites: "retry, then mark blocked" (MB§60); timeouts and network errors are failure reasons (`TIMEOUT`, `NETWORK_ERROR`, `INVALID_SITE`, `BLOCKED`).
- Missing font → record the failure; broken image → preserve evidence (MB§60).
- Cost of failed attempts: `CostEvent`s still apply; "cost / successful capture" is tracked precisely because failures cost money ([13](13-cost-performance-and-scaling.md)).

## Job states (§7) and reasons

`QUEUED, RUNNING, PAUSED, WAITING_FOR_AUTH, WAITING_FOR_REVIEW, COMPLETED, FAILED, CANCELLED`. Failure-related transition: `RUNNING → FAILED` after retries exhaust, then DLQ (**Inferred**). Intentional waits (`WAITING_FOR_AUTH`, `WAITING_FOR_REVIEW`, `PAUSED`) are not failures ([10](10-authentication-and-permission-workflows.md)). Pipeline stages and failure reasons (`AUTH_REQUIRED, CAPTCHA_REQUIRED, BLOCKED, TIMEOUT, NETWORK_ERROR, INVALID_SITE, PARTIAL, FAILED`): [03](03-capture-and-crawling-workflow.md).

## Manual retry and review

- DLQ items can be retried manually by an admin (§49).
- `WAITING_FOR_REVIEW`, the review queue, and the **admin override system** (every automatic decision should be overridable — GAP§29) provide human intervention ([16](16-admin-and-operations.md)).
- What a manual retry re-runs (single stage vs. whole job) and whether it resets `attempts`: **Not decided**.

## Disaster recovery (GAP§27)

Postgres backups; object-storage versioning; crawl manifests; dataset exports. "A crawl should be reproducible": if the database were lost, much of it could be reconstructed from `raw evidence + crawl manifests`. Backup frequency, retention, restore testing, RPO/RTO: **Not decided** (MB§80 lists "Disaster recovery" as a spec to write).

## Observability

Metrics from day one (GAP§26; list in [13](13-cost-performance-and-scaling.md) / [16](16-admin-and-operations.md)); stack: Sentry + OpenTelemetry (IF§2, MB§71). Alert rules, paging, SLOs: **Not decided**.

## Source health

The source dashboard shows status (e.g. "Healthy"), failure count and needs-review count ([16](16-admin-and-operations.md)). Criteria for "Healthy": **Not decided**.

## Not covered in the conversation

Poison-message handling beyond the DLQ, circuit breakers on target sites (rate-limit backoff per domain beyond `rate limit/concurrency limit/crawl delay`), and handling of sites that actively block automation beyond "retry, then mark blocked".
