# 14 — Failure, Recovery and Reliability

Part of the [engineering docs](README.md). Prev: [13](13-cost-performance-and-scaling.md). Next: [15 Security](15-security-and-isolation.md). Job model: [03](03-capture-and-crawling-workflow.md); events: [12](12-data-model-and-events.md).

## Per-worker requirements (§49)

Every worker needs: **timeout, retry, backoff, dead-letter queue (DLQ)**.

Example retry sequence from the conversation:

```
Attempt 1 ─ failure ─► wait 30 s ─► Attempt 2 ─ failure ─► wait 5 min ─►
Attempt 3 ─ failure ─► DLQ
```

An **example**, not a mandated policy: values for timeouts, backoff curve, and `max_attempts` per job type are **Not decided** (`CaptureJob` carries `attempts` and `max_attempts`). The Admin can **retry manually** from the DLQ ([16](16-admin-and-operations.md)).

## Worker failures

Stages communicate through queues and are decoupled, so one failing service doesn't force upstream work to rerun: "If the AI classifier dies, the crawler doesn't have to run again" (§8). Retries are per stage/event. Consumer idempotency is **Inferred** as a requirement.

## Browser crashes (§50)

Browser workers are disposable:

```
Job → Browser worker → crash → worker destroyed → new worker → resume from checkpoint
```

"Never make one browser session responsible for the entire crawl." Mobile emulators/simulators/devices: same principle expected; specifics **Not decided** ([09](09-ios-android-collection.md)).

## Checkpoints and resumability (§51)

Per job: discovered, completed, failed, pending URLs. "If the process dies, resume." Mid-page state (e.g. in the middle of Level 3 exploration) is **Not decided** — the stated checkpoint granularity is the URL. For mobile exploration, checkpoint of the exploration graph is **Not decided** (**Inferred:** the graph of `ScreenState`/`FlowEdge` is the natural checkpoint).

## Partial failures

- A site crawl may complete with some failed URLs: the `failed URLs` list is retained in the checkpoint; the job's final status for "completed with failures" (`COMPLETED` vs `FAILED`) is **Not decided**.
- A capture may succeed while downstream processing fails (e.g. OCR or classification): raw evidence remains; the failed stage is retried independently.
- Bad captures appear in the review queue ("8 bad captures", §33) — [16](16-admin-and-operations.md).
- Flow errors appear in the review queue ("6 flow errors") ([09](09-ios-android-collection.md)).
- Cost of failed attempts: `CostEvent`s still apply; "cost / successful capture" is a tracked metric precisely because failures cost money ([13](13-cost-performance-and-scaling.md)).

## Job states (§7)

`QUEUED, RUNNING, PAUSED, WAITING_FOR_AUTH, WAITING_FOR_REVIEW, COMPLETED, FAILED, CANCELLED`. Failure-related transitions: `RUNNING → FAILED` after retries exhaust, then DLQ (**Inferred**). Intentional waits (`WAITING_FOR_AUTH`, `WAITING_FOR_REVIEW`, `PAUSED`) are not failures ([10](10-authentication-and-permission-workflows.md)). Lifecycle diagram: [03](03-capture-and-crawling-workflow.md).

## Manual retry and review

- DLQ items can be retried manually by an admin (§49).
- `WAITING_FOR_REVIEW` and the review queue provide human intervention ([06](06-intelligence-pipeline.md)).
- What a manual retry re-runs (single stage vs. whole job) and whether it resets `attempts`: **Not decided**.

## Source health

The source dashboard shows status (e.g. "Healthy"), failure count and needs-review count ([16](16-admin-and-operations.md)). Criteria for "Healthy" are **Not decided**.

## Not covered in the conversation

Alerting/paging, SLOs, backup and disaster recovery for Postgres/object storage, poison-message handling beyond the DLQ, circuit breakers on target sites (e.g. blocking/rate limits), and handling of sites that actively block automation: **Not decided**.
