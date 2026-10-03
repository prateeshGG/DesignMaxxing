# Wave 1 consistency review (1.1–1.5)

Part of the [Part-Specs](README.md). Checked on 3 October 2026 after all five wave-1 specs were written in parallel. **Later waves must use the names below.** Anything here marked "founder to confirm" is still a suggestion until the founder reviews it.

## 1. Fixed in the specs during this review

| Issue | Where | Fix |
|---|---|---|
| Table names were plural in 1.3 (`raw_artifacts`, `sources`, `capture_units`) | 1.3 | Changed to 1.2's convention: **snake_case singular** (`raw_artifact`, `derived_artifact`, `source`, `capture_unit`) |
| `raw_artifact.capture_id` pointed at `capture_units` and needed a separate `attempt` column; 1.4 suggested the attempt row | 1.3 (OQ-1.3-4) | Now `raw_artifact.capture_attempt_id` → `capture_attempt.id`; the `attempt` column is gone. Nullable only for source-level evidence such as robots.txt, which 1.5's `robots_artifact_id` needs |
| 1.4 named a placeholder `getDomainPolicy(domain_key)` | 1.4 | Uses 1.5's contracts: `getEffectivePolicy(source_id)` and `evaluateCollection(source_id, purpose)` |
| 1.4 used a free-text `viewport_profile`; 1.2 defines a `device_profile` table and expects a foreign key | 1.4 | `capture_unit.device_profile_id` → `device_profile.id`; `unit_key = sha256(canonical_url ‖ device_profile.code ‖ crawl_run_id)` |
| `domain_key` was loosely defined | 1.4 | `domain_key` = copy of `source.domain` (registrable domain, immutable) |

## 2. Already consistent (founder to confirm)

- **IDs:** every primary key is a UUIDv7 `id` (F-23). The DC-02 identity of a capture unit is kept as `capture_unit.unit_key` (unique), so 1.2's OQ-1.2-4 and 1.4's OQ-1.4-2 have the same suggested answer.
- **Who owns the work tables:** 1.4 owns `crawl_run`, `capture_job`, `capture_session`, `capture_unit`, `capture_attempt`, `event_log`, `event_delivery`, `intake_hold` (1.2 agrees; OQ-1.4-1).
- **Evidence grain:** raw evidence hangs off the **attempt** (`capture_attempt`), so files from failed ladder attempts stay traceable (1.3, 1.4; OQ-1.4-22).
- **Writes under a lease:** every worker write goes through 1.4's `withLease`; 1.3's registry inserts and 1.2's `recordScreenGraph` run inside that transaction.
- **Process roles and config:** 1.4 adopted 1.1's roles (`web`, `worker-app`, `worker-crawler`, `supervisor`, `capture-child`, `cli`), `packages/schemas`, `REDIS_URL`, `LIMIT_*` overrides and the rule that every job declares placement `app` or `crawler`.
- **Breaker state:** stored on `source` (1.5), written only by 2.9 through `recordBreakerTransition`; events `source.breaker_opened/closed` are in 1.4's catalogue with 2.9 as emitter.
- **Migration order:** extensions → `device_profile` → 1.5 → 1.4 → 1.3 → 1.2 graph tables → 1.6 → 4.3 → 4.5 → 5.1.

## 3. Names wave 2 and later must use

| Area | Names (defined in) |
|---|---|
| Work model | `crawl_run`, `capture_job`, `capture_session`, `capture_unit`, `capture_attempt`; unit states `PENDING, LEASED, RUNNING, CAPTURED, VALIDATING, ACCEPTED, NEEDS_REVIEW, REJECTED, RETRY_WAIT, QUARANTINED, BLOCKED, SKIPPED`; strategies `S0–S3`; steps `navigate, ready, capture, extract, upload, validate` ([1.4](1.4-job-queue-events-reliability.md) §3) |
| Leases and scheduling | `leaseNextUnit`, `startAttempt`, `heartbeat`, `withLease`, `completeAttempt`, `expireLease`, `releaseLease`, `paceDomain`, `holdIntake`/`releaseIntake`; queues `capture.<domain_key>` and `ev.<consumer>` ([1.4](1.4-job-queue-events-reliability.md) §4) |
| Events | `capture_job.started`, `capture_job.units_planned`, `capture_unit.captured`, `capture_unit.finalized`, `capture_job.finished`, `crawl_run.finished`, `source.breaker_opened/closed`, `intake.held/released` plus 1.5's `source.*` and `site_recipe.activated` |
| Sources and policy | `source` (with `crawl_policy`, robots fields, `seed_status`, `access_status`, breaker fields), `site_recipe`, `takedown_request`, `source_policy_change`; `getEffectivePolicy`, `evaluateCollection`, `recordRobotsFetch` (2.1 only), `recordBreakerTransition` (2.9 only), `getActiveRecipe` (2.2) ([1.5](1.5-source-policy-registry.md)) |
| Storage | `raw_artifact` (types `SCREENSHOT, VIDEO, HTML, DOM, UI_TREE, NETWORK_METADATA, ASSET, APP_PACKAGE, LOG, TRACE`), `derived_artifact`; `putBlob`, `registerRawArtifact`, `registerDerivedArtifact`; key scheme `raw/<type>/<h0h1>/<sha256>` ([1.3](1.3-object-storage-artifact-registry.md)) |
| Design graph | `device_profile` (`desktop` 1440×900 @2, `mobile` 390×844 @3), `product`, `product_version`, `page`, `screen`, `screen_artifact` (`capture_pass` `motion`/`static`), `section` (DOM bounds in CSS px, `detection_method`), `section_artifact`, `asset`, `animation`, `animation_artifact`; `recordScreenGraph` ([1.2](1.2-core-data-platform.md)) |
| Repo | `apps/web`, `apps/worker`, `services/<module>`, `packages/{schemas,database,storage,config}`, `infrastructure/{compose,docker,env,scripts}`; module `services/work-queue` ([1.1](1.1-repository-environments-delivery.md)) |

## 4. Carried forward to later Parts (not fixable in wave 1)

| Question | Raised in | Belongs to |
|---|---|---|
| Where gate results live: 1.2 puts `quality_score`/`publish_status` on `screen` and `section`, 1.4 keeps a `verdict` on `capture_attempt`. One clear home per value is needed | OQ-1.2-19, OQ-1.4-23 | 2.10 (wave 3) |
| Can the gate return `BLOCKED` and `SKIPPED`, or only accept/review/reject? | OQ-1.4-8 | 2.10 |
| What "1 request per second per domain" counts (navigations only, or every request) | OQ-1.4-19 | 2.2 (wave 2) |
| Homepages that redirect to another domain (notion.so → notion.com) | OQ-1.5-24 | 2.1 (wave 2) and 2.10 |
| Two different page-type lists (F-10 has `legal`; F-27 has `docs`, `login`, `signup`) | OQ-1.2-16 | 2.1 and 4.3 |
| No Part owns end-to-end takedown propagation | OQ-1.5-8 | founder decision; candidate owners 1.5 or 6.4 |
| Is a section crop raw evidence or derived? | OQ-1.2-12 | 2.3 (wave 3) |

## 5. Top founder decisions from wave 1

1. **Where jobs run:** all traffic to collected sites, including discovery, on the Crawler VM (OQ-1.1-11); the 20-site spike on one VM first (OQ-1.1-15).
2. **Buckets:** one private bucket (F-33) or add a public delivery bucket and a separate backups bucket (OQ-1.3-1). Also check whether R2 offers object versioning, which F-35's backup plan assumes (OQ-1.3-2).
3. **Spool vs. "storage first":** treat the fsynced local spool file as the first durable write while R2 is down (OQ-1.3-3).
4. **Attempt counting:** a lease that expires before any attempt starts does not count as an attempt (OQ-1.4-5; departs slightly from doc 22 §5).
5. **Takedown owner** (OQ-1.5-8) and **robots.txt errors** (OQ-1.5-14).
6. **Storage estimate:** DC-20's sharp captures raise raw storage to roughly 40–160 GB as WebP (about $9/month at the top), versus 27–45 GB in doc 20 §5.
