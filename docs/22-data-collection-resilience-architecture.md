# 22 — Data Collection Resilience Architecture

Part of the [engineering docs](README.md). Extends [03](03-capture-and-crawling-workflow.md), [08](08-web-collection.md), [14](14-failure-recovery-and-reliability.md) and the founder decisions in [20](20-founder-decisions-and-plan-validation.md). Written at the founder's direction: **the platform is not the risk — data collection is.** Design it so it **never gets stuck** and **never lets unusable captures reach users**, with the least human work.

Status of this document: **design decisions by the co-founder (`DC-xx`)**, within the solo-founder, no-users, one-VM constraints of doc 20. Numbers are **[Estimate]** starting values to be calibrated in the 20-site spike (experiment E2). Anything not decided is marked **Not decided**. This is a *design*, not a Part-Spec; Part-Specs and Task lists come later per the [protocol](process/project-breakdown-protocol.md).

## 1. What "stuck" means — two failure classes

| Class | Looks like | Why it is dangerous |
|---|---|---|
| **A. Stalls** | A job that is "RUNNING" forever, a queue that stops draining, a browser that hangs, a site that eats all workers, a disk that fills | Nothing visibly fails, so nothing is fixed; throughput silently drops to zero |
| **B. Silent bad data** | A job that "succeeds" but the screenshot is a Cloudflare challenge page, a blank render, a cookie wall, a half-loaded layout, an error page | Worse than a stall: unusable data gets published, trust is lost, and cost was spent |

The architecture treats these as separate problems with separate mechanisms: **bounded, supervised execution** for A (§5–§9) and a **publishability gate** for B (§8). The rule that ties them together: **"captured" never means "publishable."** Users only ever see data that passed the gate.

## 2. Failure-mode catalog

| # | Failure | Class | Detected by | Automatic response | Human needed? |
|---|---|---|---|---|---|
| 1 | Page never settles (endless network/animation) | A | Readiness cap (15 s) hit | Escalate strategy S0→S1 (§7) | No |
| 2 | Navigation / Playwright call hangs without throwing | A | External supervisor deadline (hard kill) | Kill child process; requeue unit with next strategy | No |
| 3 | Chromium crash / zombie / memory leak | A | Child exit code, RSS limit, reaper | New process; resume from unit checkpoint | No |
| 4 | Worker dies mid-unit | A | Lease expiry (no heartbeat) | Requeue unit, attempt+1 | No |
| 5 | Infinite scroll / lazy content never ends | A | Scroll budget (distance/time/steps) | Stop at budget; flag `truncated`; gate decides | No (unless flagged) |
| 6 | URL traps (calendars, facets, session IDs) | A | Page/depth/query-variant limits | Stop expanding; prioritized pages only | No |
| 7 | One slow/hostile site starves the crawler | A | Per-domain concurrency + fair scheduler | Other domains keep flowing | No |
| 8 | Poison URL fails every attempt | A | Attempts exhausted | Quarantine unit; job continues | Optional |
| 9 | Site blocks us (403/429, challenge page, CAPTCHA) | B | Status + challenge signatures | Mark `BLOCKED`; one polite retry; domain breaker. **No evasion.** | Optional |
| 10 | Blank / white / partial render | B | Pixel + DOM-content checks | Retry next strategy; else reject | No |
| 11 | Cookie wall / modal / chat widget covers content | B | Overlay-coverage check | Auto-dismiss known patterns; else flag | Only if flagged |
| 12 | Broken fonts/images, lazy images not loaded | B | Font status, broken-image ratio, lazy-pending ratio | Retry next strategy; else lower score | No |
| 13 | Error page captured as content (404/500/"Access denied") | B | Status, title/body signatures, bad-page fingerprint match | Reject; log fingerprint | No |
| 14 | Desktop/mobile disagree (different page served) | B | Title/H1 cross-check | Flag `needs_review` | Optional |
| 15 | AI provider outage / rate limit | A | Call errors, breaker | Park classification; capture continues (bounded backlog) | No |
| 16 | Storage upload fails / disk fills on crawler VM | A | Upload errors, disk watermark | Local spool + retry; pause intake at 80% disk | No |
| 17 | Runtime drift (Chromium/Playwright update changes output) | B | Canary/golden-set regression | Block rollout; alert | Yes (decide) |
| 18 | Cost runaway | A | `CostEvent` vs budget | Throttle at 70%, pause intake at 100% | Yes (raise cap) |
| 19 | Quality degrades slowly across many sites | B | Publishable-rate trend by domain/day | Alert; auto-pause the failing strategy/site | Yes |
| 20 | Pipeline stalls with no error at all | A | Dead-man's switch (§12) | Alert immediately | Yes |

## 3. Design decisions (principles)

| ID | Decision |
|---|---|
| **DC-01** | **Everything is bounded:** time, memory, pages, scroll distance, actions, attempts, backlog, and cost have hard limits at every layer. No unbounded loop or wait exists anywhere in collection. |
| **DC-02** | **Smallest unit of work is a `CaptureUnit` = one canonical URL × one viewport profile × one crawl run.** Units are idempotent: re-running one never corrupts or duplicates data. |
| **DC-03** | **Execution is supervised from outside.** A supervisor owns deadlines and can `kill -9` a capture child; the capture code is never trusted to time itself out. |
| **DC-04** | **Fail forward, never block.** A unit that cannot be captured is quarantined after its ladder is exhausted and the site continues. A job reaches a terminal state within its deadline no matter what. |
| **DC-05** | **Retries change strategy.** Each attempt uses a different capture strategy (§7), never the same one repeated. |
| **DC-06** | **Captured ≠ publishable.** A separate automated publishability gate (§8) decides what enters the public dataset; unusable captures never reach users. |
| **DC-07** | **Isolation by default:** a fresh browser context per unit, a fresh process per batch, hard memory limits, periodic recycling. |
| **DC-08** | **Never evade blocking.** No CAPTCHA solving, no proxy/IP rotation to defeat blocks, no fingerprint spoofing. Blocked = recorded as blocked ([10](10-authentication-and-permission-workflows.md), F-10). |
| **DC-09** | **Per-domain isolation:** per-domain queues, concurrency, rate limits and circuit breakers so one site cannot starve or poison the rest. |
| **DC-10** | **Decouple capture from interpretation:** capture writes raw evidence and finishes; classification/embedding/indexing failures never block collection ([02](02-system-architecture.md), §8). |
| **DC-11** | **Self-heal first, escalate last:** sweepers, breakers, reapers, and the strategy ladder fix common failures automatically; humans see only a small, categorized Quarantine inbox (§10). |
| **DC-12** | **Prove it before scaling it:** a failure-injection "torture suite" and a golden-set canary must pass before any change to the capture runtime ships (§13). |
| **DC-13** | **Site job deadline raised to 30 minutes** (was 20 in F-32): 25 pages × 2 viewports = 50 units at ~40 s average and 2 concurrent per domain ≈ 17 min, which leaves no headroom under 20 min [Estimate]. All other F-32 values stand. |
| **DC-14** | **Postgres is the single source of truth for unit state; Redis/BullMQ is a rebuildable queue.** A reconciler (startup + every 5 min) re-enqueues `PENDING` units and units whose lease expired, and drops queue entries for already-terminal units. Losing Redis loses no work. *(Added in [23](23-scrapling-evaluation-and-collection-gap-analysis.md).)* |
| **DC-15** | **Change-detection normalization:** strip scripts/styles, timestamps/relative dates, nonces, tracking params and ad/iframe nodes before hashing; perceptual tolerance for visuals; target false-"changed" rate ≤ 10% on a golden-set re-crawl [Estimate]. |
| **DC-16** | **Capture hazards are first-class requirements of Part 2.3, each with a torture fixture:** sticky/fixed elements, scroll-reveal content, `100vh` sections, pinned/horizontal-scroll sections, carousels, autoplay video. Unfixable cases are flagged `needs_review`, never auto-published. |
| **DC-17** | **Founder-minutes per accepted site ≤ 2 on average** and inbox ≤ 5% of units are E2 gates [Estimate]; failures are fixed in the capture runtime, not by more founder time. |
| **DC-18** | **Block rate is a measured launch input** (`BLOCKED %` per seed category); seeds are founder-curated; sites that block us stay blocked — dataset size is set by what we can legitimately collect.

## 4. Work model

```
CrawlRun (a batch: e.g. "initial 500 sites")
  └─ CaptureJob (one site; F-32 statuses)             deadline 30 min
       └─ CaptureSession (one browser process run)    recycled every 50 units / 30 min
            └─ CaptureUnit (URL × viewport)           deadline 90 s per attempt, ≤ 3 browser attempts + 1 non-browser fallback
                 └─ Step (navigate → ready → capture → extract → upload → validate)   each step has its own sub-deadline
```

- **Unit identity (idempotency):** `unit_id = hash(canonical_url, viewport_profile, crawl_run_id)`. Outputs are written to content-addressed storage first, then the database row is committed — a crash between the two leaves an orphan blob (harmless, garbage-collected), never a half-written record.
- **Unit states** *(Decision; refines the F-32 job statuses at unit level)*:

```
PENDING → LEASED → RUNNING → CAPTURED → VALIDATING ─┬─► ACCEPTED ───► (normalize → publish eligible)
                                │                    ├─► NEEDS_REVIEW
                                │                    └─► REJECTED ──► (next strategy, if attempts remain)
                                ├─► RETRY_WAIT (backoff 30 s, then 5 min — F-32)
                                ├─► QUARANTINED (ladder exhausted; reason recorded)
                                ├─► BLOCKED   (access denied; no evasion)
                                └─► SKIPPED   (policy: robots/domain flag/budget)
```

- **Job rollup:** a `CaptureJob` completes when every unit is terminal (`ACCEPTED`, `NEEDS_REVIEW`, `QUARANTINED`, `BLOCKED`, `SKIPPED`). F-32 applies: ≥ 70% of target pages accepted → `COMPLETED (partial=true)`, below → `FAILED`. A job can never remain `RUNNING` past its deadline — the janitor (§9) force-rolls it up.
- **Two orthogonal statuses per capture** *(DC-06)*: `capture_status` (did evidence get stored) and `publish_status` (`unpublished`/`eligible`/`published`/`withdrawn`). The public product queries only `published`.
- `CaptureUnit` and its attempt/lease fields are **new implementation-level concepts** added by this design; they refine, not replace, `CaptureJob`/`CaptureSession` ([12](12-data-model-and-events.md), F-21). Exact schema is for the Part-Spec.

## 5. Execution layer — supervised, bounded, disposable

```
BullMQ queue (Redis) ──► Scheduler (per-domain fair) ──► Supervisor (long-lived, tiny, no browser)
                                                              │ spawns, watches, kills
                                                              ▼
                                                    Capture Child (Node + Playwright + Chromium)
                                                    inside a Docker container with cgroup limits
```

- **Leases + heartbeats (DC-03):** a unit is *leased* to a supervisor with a TTL; the child emits a heartbeat every 10 s carrying its current step. No heartbeat for **60 s** → lease expired → unit requeued (`attempt+1`, next strategy) and the child killed. A completed unit releases its lease explicitly.
- **Hard deadlines:** unit 90 s per attempt; step sub-deadlines (navigation 30 s, readiness 15 s cap — F-11, scroll pass 20 s, section capture 20 s, media extraction 20 s, upload 30 s). Deadlines are enforced by the **supervisor killing the process**, and also passed into code as `AbortSignal` for clean exits. This covers the case where Playwright hangs without throwing.
- **Resource limits:** container memory limit **≈ 2.5 GB** per browser slot, CPU shares, no host mounts, restricted egress (F-20). Child killed if RSS exceeds the limit.
- **Recycling:** new browser process every **50 units or 30 minutes**, whichever first; new context per unit; downloaded files and temp dirs deleted on unit end.
- **Reaper:** every minute, any Chromium process not tied to a live lease and older than 5 minutes is killed; any temp dir older than 1 hour is deleted.
- **Spooling:** if object-storage upload fails, evidence is spooled to local disk with retry; intake pauses at 80% disk, hard-stops at 90% (§9).
- **Queue state is rebuildable (DC-14):** unit state lives in Postgres; the reconciler re-enqueues lost work if Redis is wiped or restarted.
- **Idempotent writes:** upload by content hash; database commits are conditional on the unit's current `lease_id`, so a zombie worker that lost its lease cannot overwrite newer results.

## 6. Scheduling — fairness, backpressure, no head-of-line blocking

- **Per-domain queues** with **round-robin** across domains; **global browser slots** (starting value: 2–3 on the Crawler VM); **per-domain: 2 concurrent, 1 request/s** (F-10).
- **Discovery before capture:** URL discovery (cheap, non-browser) is a separate queue stage, so a slow capture never blocks discovery and discovery can't flood capture.
- **Backpressure:** capture intake pauses when downstream backlog (validated-but-not-yet-normalized units) exceeds a bound (starting value 500 units) or storage/disk watermarks trip. Pausing is automatic and resumes automatically.
- **Priority:** page-type score (F-10) orders units inside a site; home/pricing/product pages are captured first so that a time-boxed or partial job still produces the most valuable pages.
- **Batching for the on-demand VM:** the Crawler VM can be started for a `CrawlRun` and stopped when the queue drains; the supervisor shuts it down after an idle period (**Not decided:** exact idle timeout and the VM start/stop mechanism).

## 7. Capture strategy ladder (what retries actually do)

| Attempt | Strategy | What changes |
|---|---|---|
| **S0 — standard** | Normal readiness (network idle ≥ 500 ms + fonts ready + 1 s layout stability), full-page + sections + media | — |
| **S1 — relaxed & cleaned** | Skip network-idle; use "DOM mutation quiet for 1 s" + fonts ready; inject reduced-motion/animation-freeze CSS; block known trackers/analytics; run the consent-banner dismisser (known CMP selectors and common patterns) | Fixes endless-network and animation stalls, cookie walls |
| **S2 — minimal visual** | Viewport screenshots at scroll positions (bounded steps) instead of one tall full-page capture; skip media extraction and interaction capture; DOM + a11y snapshot kept; unit marked `degraded` | Gets *some* usable visual evidence from stubborn pages |
| **S3 — non-browser fallback** (after 3 failed browser attempts) | HTTP fetch of HTML, headers, metadata only; mark `no_visual`; **not publishable as a visual**, but kept as evidence for text/technology signals | Preserves what can be saved cheaply |
| **Terminal** | `QUARANTINED` with reason code and evidence fingerprint | Appears in the Quarantine inbox |

Backoff between attempts follows F-32 (30 s, then 5 min). **Prohibited at every rung (DC-08):** solving CAPTCHAs, rotating IPs/proxies to defeat blocks, spoofing browser fingerprints, bypassing paywalls/logins, executing dangerous actions ([10](10-authentication-and-permission-workflows.md)). A `BLOCKED` result gets **one** polite retry after backoff, then the **domain breaker** (§9) opens.

**Site recipes** (INT, [03](03-capture-and-crawling-workflow.md)) can override per-site details — a cookie-dismiss selector, a `wait_for` selector, selectors to ignore, extra wait — and are created from the Quarantine inbox. They are the only per-site customization allowed; the default must be generic.

## 8. Publishability gate — keeping unusable data from users

Runs automatically at `VALIDATING` for every captured unit and every extracted section. Checks and **starting thresholds [Estimate — calibrate in E2]**:

| # | Check | Passes when |
|---|---|---|
| 1 | Final HTTP status and URL | 200-class; final registrable domain unchanged (not bounced to a login/consent domain) |
| 2 | Challenge/error signatures | Title/body do not match known challenge or error patterns ("Just a moment", "Access denied", CAPTCHA frames, 404/500 text, etc.) |
| 3 | Bad-page fingerprint library | Perceptual-hash similarity to any known bad page (challenge, blank, 404, consent wall) < 0.95. The library **grows from review decisions** |
| 4 | Not blank | Pixel variance above floor; no uniform region > 85% of the screenshot |
| 5 | Content present | Visible DOM text ≥ 50 words (or page typed as media-only/exempt); images decode |
| 6 | Images | Broken `<img>` ≤ 10%; lazily-loaded images still pending after the scroll pass ≤ 5% |
| 7 | Fonts | `document.fonts` settled; fallback-font ratio below limit |
| 8 | Overlays | Fixed/sticky elements covering > 30% of the viewport are dismissed, else the unit is flagged |
| 9 | Stability | Two captures ~1 s apart differ by less than a perceptual threshold (otherwise flag motion; capture a stable frame) |
| 10 | Dimensions | Full-page height between viewport height and a maximum (starting value 30,000 px); beyond it → `truncated` flag |
| 11 | Cross-viewport consistency | Desktop and mobile agree on page title and H1 |
| 12 | Section sanity | ≥ 1 section; section boxes inside the page; section height ≥ 120 px (nav/announcement exempt); sections cover ≥ 80% of page height |
| 13 | Sampled DOM↔OCR agreement | On a **10% sample** (cost control), OCR text overlaps DOM text ≥ 60% — detects "renders differently from DOM" failures |
| 14 | Text screening | Regex PII/secret screen passes (F-19) |
| 15 | Policy | Domain flags allow screenshots and display; not under takedown (F-18) |

**Outcome:** `quality_score` 0–100 from weighted checks (weights **Not decided**; check 1–3 and 4 are hard fails, not weighted). `≥ 80` → `ACCEPTED` and publish-eligible (matches the E2 threshold); `60–79` → `NEEDS_REVIEW`; `< 60` or any hard fail → `REJECTED` → next ladder strategy, or quarantine when exhausted.

**Lifecycle of data:** `raw → captured → validated → accepted → publish_eligible → published` (and `withdrawn` for takedowns). **Nothing reaches the public product before `published`**, and `published` requires an explicit step (automatic in V0 for `ACCEPTED`; manual batch approval during early alpha — **Decision:** the founder spot-checks a random 5% sample of each batch before it is marked published until the measured accuracy in E2 is stable).

**Gate regression:** every human `reject/approve` in review is written back as labeled data; the gate's own precision/recall are tracked against the benchmark ([06](06-intelligence-pipeline.md), F-29).

## 9. Self-healing loops

| Loop | Cadence | Does |
|---|---|---|
| **Lease sweeper** | 30 s | Expired leases → requeue unit (`attempt+1`, next strategy) and kill the owning child |
| **Janitor** | 60 s | Any `CaptureJob` past its 30-min deadline → force roll-up using F-32 partial rule; any unit `RUNNING` beyond hard deadline → kill + requeue |
| **Domain circuit breaker** | per unit result | Sliding window of the last 20 units for a domain: failure/`BLOCKED` ≥ 50% → breaker **open** for 6 h (doubling to a max of 7 days); job → `PAUSED (domain_unhealthy)`; other domains unaffected; breaker half-opens with one probe unit |
| **Global breakers** | per call | AI provider breaker (park classification, keep capturing while the bounded backlog allows); object-storage breaker (spool locally) |
| **Poison quarantine** | per unit | A unit that exhausts the ladder → `QUARANTINED` with `reason` + fingerprint; the same fingerprint across ≥ 5 units of one site marks the **site** `needs_recipe_or_skip` |
| **Disk guard** | 60 s | Crawler VM disk > 80% → pause intake and flush spool; > 90% → hard stop and alert; temp cleanup always on |
| **Orphan reaper** | 60 s | Kill orphan Chromium > 5 min; delete stale temp dirs > 1 h |
| **Orphan blob GC** | daily | Delete blobs with no database reference older than 48 h (from crashes between upload and commit) |
| **Budget governor** | per `CostEvent` | 70% of the monthly cap → throttle (halve browser slots, AI to cheapest route); 100% → pause intake automatically ([20](20-founder-decisions-and-plan-validation.md) F-07) |

## 10. Human exception handling — a small Quarantine inbox

Humans never watch jobs; they clear an inbox. Items are categorized, with **one-click actions**:

| Category | Typical cause | Actions |
|---|---|---|
| `blocked` | Challenge/403/429 | Mark inaccessible, snooze 30 days, drop site |
| `needs_recipe` | Overlay or wait problem repeated across units | Add/edit site recipe → re-run affected units |
| `needs_review` | Score 60–79, cross-viewport mismatch, truncation | Approve / reject (writes label data and, for rejects, a bad-page fingerprint) |
| `quarantined` | Ladder exhausted | Retry with chosen strategy / skip |
| `auth_required` | Login wall (V2 feature) | Provide session or mark inaccessible ([10](10-authentication-and-permission-workflows.md)) |

Inbox size is itself a health metric: **target < 5% of units** in the inbox per batch; above that the cause is fixed in the capture runtime, not by working the inbox.

## 11. Budgets and kill switches (summary)

Per unit: 90 s, memory limit, scroll budget (starting values: ≤ 40 scroll steps / 20 s), ≤ 3 browser attempts. Per site: 30 min, ≤ 25 pages (V0), asset ≤ 25 MB, domain limits (F-10). Per run: backlog bound, disk watermarks. Global: monthly cost cap with automatic throttle/pause (F-07). All limits are configuration, not code constants, and appear in the admin console ([16](16-admin-and-operations.md)).

## 12. Detecting "stuck" — observability

Core dashboard (admin): **oldest `RUNNING` unit age** · **queue age p95** · units/hour · unit outcome mix (accepted / review / rejected / quarantined / blocked) · **publishable rate overall and per domain/day** · inbox size · breaker states · heartbeat freshness · disk % · browser slots in use · cost burn vs cap.

**Dead-man's switch:** an external heartbeat monitor expects a "units completed" tick at least every **30 min while the queue is non-empty**; silence triggers an immediate email (this catches stalls where nothing errors). Plus the daily summary email (F-34) and Sentry alerts for exceptions. No pager (F-34).

Structured logs carry `run_id, job_id, unit_id, attempt, strategy, step` on every line so any unit's history can be reconstructed.

## 13. Verification — how we know it won't get stuck

1. **Torture suite (CI, fixture site served locally):** pages and servers that reproduce each failure in §2 deterministically — hanging navigation, never-idle network, infinite scroll, infinite carousel, animation that never settles, blocking cookie wall, full-screen modal, challenge page lookalike, blank render, 404/500 served with 200, broken images/fonts, huge DOM, slow-loris responses, redirect loops, URL-trap calendar, memory-leak page, process-kill and lease-loss injection, storage-down and AI-down injection. **Every fixture must end in a terminal unit state within its deadline and the gate must classify it correctly.**
2. **Golden set / canary:** 20–30 real, stable sites captured nightly (or on any runtime change) with stored baseline quality scores and perceptual hashes; regressions beyond tolerance block the change (DC-12). **Chromium/Playwright versions are pinned**; upgrades go through the canary first.
3. **Spike metrics (E2):** the 20-site spike must show ≥ 90% of pages passing the gate, an inbox < 5% of units, zero jobs exceeding deadline, and the real cost per page ([20](20-founder-decisions-and-plan-validation.md) §6).
4. **Chaos drills before alpha (G2):** kill the supervisor, kill Redis, fill the disk, drop the network, disable the AI provider — the system must recover or degrade as designed, without data corruption.

## 14. Capacity plan for the single Crawler VM [Estimate]

Assumptions: 2–3 concurrent browser slots at ~2–2.5 GB each; ~35–40 s per unit including validation; each page = 2 units (desktop + mobile).

- Throughput ≈ 3 slots × (3,600 / 40) ≈ **270 units/h ≈ 135 pages/h**.
- The V0 dataset target (≈ 10,000 pages, F-07) ≈ **≈ 75 hours of crawl time ≈ 3 days** as a batch on an on-demand VM.
- Per-domain limits (2 concurrent, 1 req/s) mean ≥ 3 sites must be crawled in parallel to keep slots busy — the fair scheduler (§6) provides this.

Any change to these assumptions is measured in the spike, not guessed.

## 15. Assumptions and open items

| # | Item | Status |
|---|---|---|
| 1 | Thresholds in §8 and limits in §5/§9 are starting values | **[Estimate]** — calibrate in E2 |
| 2 | Quality-score weighting and exemption rules (media-only pages, nav sections) | **Not decided** |
| 3 | Consent-banner dismisser's pattern library (initial selectors) | **Not decided** — assembled in the spike from the golden set |
| 4 | On-demand Crawler VM start/stop mechanism and idle timeout | **Not decided** |
| 5 | Whether the supervisor is a separate process type in the same codebase (assumed) vs. a separate deployable | **Inferred:** same codebase, separate process |
| 6 | DOM↔OCR sampling rate (10%) | **[Estimate]** |
| 7 | Handling of sites that legitimately require JS-heavy interactions before content appears (e.g. age gates, region selectors) | **Not decided** → site recipes |
| 8 | Exact `CaptureUnit`/lease/attempt schema and indexes | For the Part-Spec ([21](21-parts-hierarchy.md) parts 1.4, 2.5) |

## 16. Review addendum (v1.1)

A review of this design — including an evaluation of the Scrapling library — is in [23](23-scrapling-evaluation-and-collection-gap-analysis.md). Conclusions: the design covers *stalls* and *unusable data* but is **not proof that collection is solved**; gaps and their status are listed there, and `DC-14`…`DC-18` above close the ones that were fixable by design. Scrapling is **not** adopted as the core (SC-01).

## 17. Impact on other docs (to apply when the Parts Hierarchy is updated)

The founder asked to update the Parts Hierarchy later; recorded here so nothing is lost.

| Existing Part ([21](21-parts-hierarchy.md)) | Change |
|---|---|
| 1.4 Job Queue, Events & Reliability | Add `CaptureUnit`, leases/heartbeats, unit states, per-domain fair scheduling |
| 2.2 Browser Capture Runtime | Becomes supervisor + capture child; strategy ladder S0–S3; resource limits and recycling |
| 2.5 Crawl Orchestration & Lifecycle | Janitor roll-up, domain breakers, budgets/backpressure |
| 4.4 Quality Scoring & Human Review | Becomes the **publishability gate** plus the Quarantine inbox |
| 1.8 Observability | Stuck-detection dashboard and dead-man's switch |
| **New Part (proposed)** | **Capture Validation & Publishability Gate** (if 4.4 is split) |
| **New Part (proposed)** | **Supervisor, Watchdogs & Circuit Breakers** (if 2.2/2.5 are split) |
| **New Part (proposed)** | **Collection Test Harness** — torture suite, golden-set canary, chaos drills |
| 1.4 (reconciler), 2.3 (hazards, DC-16), 3.4 (normalization, DC-15) | Additional changes from [23](23-scrapling-evaluation-and-collection-gap-analysis.md) |

Also: [20](20-founder-decisions-and-plan-validation.md) F-32 (site deadline 20 → **30 min**, DC-13) and the hosted-browser fallback wording (reliability only; never to evade blocks) are corrected there.
