# 23 — Scrapling Evaluation and Collection Gap Analysis

Part of the [engineering docs](README.md). Evaluates [Scrapling](https://github.com/D4Vinci/Scrapling) against the data-collection problems in [22](22-data-collection-resilience-architecture.md), then answers honestly: **is data collection solved?** Decisions here are `SC-xx` (Scrapling) and `DC-14…DC-19` (added to doc 22). Authority: same as [20](20-founder-decisions-and-plan-validation.md).

**Evidence quality.** *[Verified]* = I downloaded the published package `scrapling==0.4.15` and read its metadata and source in this session; I did **not** run it. *[Reported]* = from the project's README/docs pages as returned by a fetch tool (a small model summarized them; the docs site `scrapling.readthedocs.io` was blocked from this environment). Treat *[Reported]* items as likely, and re-check them in the bake-off (SC-02) before relying on them.

## 1. What Scrapling is

| Fact | Evidence |
|---|---|
| Python library (≥ 3.10), BSD-3-Clause license, by D4Vinci; version 0.4.15 — **pre-1.0** | [Verified] |
| Three layers: **parser** (CSS/XPath, plus *adaptive* element relocation after site changes), **fetchers** (HTTP via `curl_cffi`; `DynamicFetcher` on Playwright; `StealthyFetcher` stealth browser), **spider framework** (Scrapy-like) | [Verified] + [Reported] |
| Spider framework: scheduler with URL dedup, session manager, **checkpoint** = a pickle file (`checkpoint.pkl`) of pending requests + seen URLs, per-domain throttling and *AutoThrottle*, `max_blocked_retries` (default **3**), optional `robots_txt_obey` (default **`False`**) | [Verified] from `spiders/*.py` |
| Fetcher extras depend on `patchright`, `browserforge`, `apify-fingerprint-datapoints`, `curl_cffi` (TLS impersonation), `protego` (robots parser) | [Verified] package metadata |
| Headline capability: "bypass Cloudflare Turnstile/Interstitial" (`solve_cloudflare`), fingerprint spoofing, `humanize`, proxy rotation (`ProxyRotator`) | [Reported] + [Verified] option names in `_stealth.py` |
| `DynamicFetcher` options: `timeout` (default 30 s), `network_idle`, `wait_selector`, `page_action(page)` hook, `disable_resources`, `block_ads` (~3,500 domains), `capture_xhr`, `locale`, `timezone_id`, `cdp_url`, `user_data_dir` | [Reported]; `timeout` default [Verified] |
| A **screenshot** function exists only inside its AI/MCP helper (`core/ai.py`), not as a fetcher/response feature; the response object does not expose the Playwright page (you get `page_action(page)` instead) | [Verified] source; [Reported] docs |
| Also ships an MCP server, CLI, and ready-made spiders (sitemap, crawl, Shopify) | [Reported] |
| Own disclaimer: "educational and research purposes… Always respect the terms of service of websites and robots.txt" | [Reported] |
| Not found in the source: heartbeats, leases, watchdogs, hard-kill supervision | [Verified] (searched for heartbeat/watchdog/lease) |

## 2. Does it solve our problems?

| Our need (doc 22) | Does Scrapling provide it? | Verdict |
|---|---|---|
| Supervised execution: leases, heartbeats, hard `kill -9` deadlines, recycling (DC-03, DC-07) | No. Per-request `timeout` exists, but nothing detects a hung Playwright call from outside; docs omit session recycling | **No** |
| Durable unit state, idempotent units, reconcile after crash (DC-02, §4) | Partial: file-based pickle checkpoint of one process; no unit-level state, no multi-worker coordination | **No** (we need Postgres-backed units) |
| Per-domain fair scheduling, throttling, adaptive delay (DC-09) | Yes: per-domain limits, AutoThrottle | **Idea worth copying**, not worth a dependency |
| Robots compliance (F-10: always honor) | Available but **off by default** | Would need forced configuration |
| Polite handling of blocks (DC-08: one retry, then stop) | Default is **3 blocked retries** plus built-in bypass features | **Conflicts** unless disabled |
| Visual capture: full-page + section screenshots, viewport profiles, video, a11y/computed styles, performance, readiness detector (§8 of doc 08) | No capture API; only a `page_action(page)` escape hatch to raw Playwright | **No** — we would write this in Playwright anyway |
| Publishability gate (§8 of doc 22) | No | **No** |
| Parser robustness across site changes | **Adaptive parser** relocates elements after redesigns | **Possibly useful** for site-recipe selectors and re-crawl stability |
| Ad/tracker blocking | `block_ads` (~3,500 domains) | Useful, but public blocklists give the same in our own stack |
| Anti-bot bypass (Cloudflare solving, fingerprint spoofing, proxy rotation) | Yes — its main selling point | **Forbidden by our policy** (DC-08, F-10) and a legal/ToS risk |
| Language/stack fit (TypeScript/Node modular monolith, D-34, F-35) | Python | **Mismatch** — a second runtime and process type for no problem solved |

**Bottom line:** Scrapling solves problems we have *chosen not to solve* (evasion) and parts we can build cheaply (throttling, parsing). It does **not** solve the three things that actually decide whether collection works: **never getting stuck** (supervision), **not publishing unusable captures** (the gate), and **visual capture quality** (screenshots, sections). Those remain ours.

## 3. Decisions

| ID | Decision |
|---|---|
| **SC-01** | **Do not adopt Scrapling as the capture or orchestration core.** Reasons: stack mismatch; its core strength is evasion we prohibit; it lacks supervision, durable unit state, visual capture, and a quality gate; `robots_txt_obey` defaults off and blocked-retries default to 3; and it is pre-1.0 (API churn risk). The collection core stays Playwright (Node/TypeScript) + BullMQ + Postgres per doc 22. |
| **SC-02** | **Time-boxed bake-off (≤ 1 day, inside the V0 spike) of two optional pieces only:** (a) the **adaptive parser** as a helper for site-recipe selectors / re-crawl stability, run as a Python script outside the production path to see whether it beats plain selectors on our golden set; (b) its **ad/tracker domain list** vs. a public blocklist — adopt only if licensing of the list is clearly compatible (the BSD-3 license covers the code; the list's provenance is unverified). If (a) does not clearly help, drop it. |
| **SC-03** | **Hard rules if any Scrapling code is ever run:** never `StealthyFetcher`, `solve_cloudflare`, `ProxyRotator`, TLS-impersonating `Fetcher`, `humanize`, or fingerprint options against target sites; force `robots_txt_obey=True`; blocked-retries ≤ 1; run only inside the crawler boundary; pin the exact version; never in the user-facing path. |
| **SC-04** | **Copy these ideas, reimplement in TypeScript:** per-domain **AutoThrottle** (double the delay on 429/blocks, speed up after sustained success); the **`is_blocked()` hook pattern** (pluggable block-signature detection feeding our `BLOCKED` state); **request-fingerprint URL dedup** in the scheduler; **atomic checkpoint writes** (we get this from Postgres transactions). |
| **SC-05** | If the spike shows an unacceptable block rate with an honest crawler, the response is a **coverage/business decision** (curate sites, ask owners for allowlisting, drop sites) — **not** switching on stealth features. |

Considered and rejected: running Scrapling's Spider as the orchestrator with our gate on top (duplicates BullMQ/Postgres and imports a second runtime); using its `DynamicFetcher` as the browser layer (we need direct Playwright control for screenshots, video, sections, and readiness).

## 4. Is data collection "solved"? — Honest answer: **no**

The architecture in [22](22-data-collection-resilience-architecture.md) is a **complete design for two things**: never getting stuck, and keeping unusable captures from users. It is **unproven** (no code, no measurements), and the review below found real gaps. Status legend: **Solved by design** · **Solved only after measurement** · **Not solved**.

| # | Problem | Status | What is needed |
|---|---|---|---|
| 1 | Hangs, crashes, stalled queues, runaway jobs | Solved by design | Verify in the torture suite and chaos drills |
| 2 | Bad captures reaching users | Solved by design — *if* the gate is calibrated | Calibrate on labeled data in the spike (E2) |
| 3 | **Redis loss orphans queued work** (queue state only in Redis) | **Gap — fixed now** | **DC-14** (below) |
| 4 | **Capture-technique hazards:** sticky/fixed headers repeated in tall screenshots; scroll-triggered reveals leaving blank areas in full-page shots; `100vh` hero sections stretching in tall captures; pinned or horizontal-scroll sections; carousels | **Not solved** — detected by the gate only after the fact | **DC-16**: explicit hazard handling and fixtures in the Part-Spec for 2.3 |
| 5 | **Block rate / coverage:** many marketing sites sit behind bot protection; with an honest crawler a share of them will be `BLOCKED`, and we will not evade | **Unknown** | **DC-18**: measure on the target list; curate seeds; accept the loss |
| 6 | **Which sites to crawl** (the seed list) drives block rate, legal exposure and product value; the founder cannot research hundreds of sites but can judge design quality | **Solved by decision DC-19** | Candidate-and-approve workflow: a drafted starter list (`seeds/candidates-v0.csv`, unverified) → spike captures homepages → founder approves/drops from a contact sheet (taste only). No random or scraped-list crawling in V0 |
| 7 | **Section segmentation is *correct*, not just sane:** the gate checks sizes and coverage, not whether a "pricing section" really is one | Solved only after measurement | Benchmark accuracy on 200 labeled sections (F-29) |
| 8 | **Founder time:** if the inbox is 20% of units, the founder becomes the bottleneck | **Unknown** | **DC-17**: founder-minutes-per-accepted-site metric and E2 threshold |
| 9 | **Noise in change detection:** timestamps, ads, rotating carousels and A/B tests make unchanged pages look changed, causing needless reprocessing | **Not solved** | **DC-15**: normalization + tolerance, measured false-positive rate |
| 10 | Non-determinism (A/B tests, geo, personalization) | Accepted limitation | Record capture context; do not try to eliminate |
| 11 | Animation/video capture cost and quality (F-13 is minimal) | Not solved in detail | Part-Spec for 2.4; V1 |
| 12 | SPA/JS-only sites: HTTP-only discovery misses routes | Partly solved | Browser-based link discovery in Level 2 (doc 03); verify in spike |
| 13 | Gate calibration needs labeled data we don't have | Solved only after measurement | The founder labels the first 20 sites fully; their labels seed the benchmark (F-29) |
| 14 | Legal exposure from collecting/displaying third-party content | **Not solved** (policy defined, counsel pending) | E5 legal consult before the public library |
| 15 | Headless-browser detection by target sites beyond robots/UA | Accepted limitation | Covered by #5; no spoofing |

## 5. Added decisions for doc 22

| ID | Decision | Resolves |
|---|---|---|
| **DC-14** | **Postgres is the single source of truth for unit state; Redis/BullMQ is a rebuildable queue.** A **reconciler** (runs at startup and every 5 min) re-enqueues units that are `PENDING`, or `LEASED`/`RUNNING` with an expired lease, and drops queue entries whose unit is already terminal. Losing Redis loses no work. | Gap 3 |
| **DC-15** | **Change-detection normalization:** before hashing, strip scripts/styles, timestamps/relative dates, nonces, tracking params and ad/iframe nodes; use perceptual-hash tolerance for visuals (≥ 0.95 similar = unchanged, F-25). Track the **false-"changed" rate** on a re-crawl of the golden set; target ≤ 10% [Estimate]; above that, widen normalization before scaling re-crawls. | Gap 9 |
| **DC-16** | **Capture hazards are first-class requirements of Part 2.3 and each gets a torture fixture:** sticky/fixed elements, scroll-reveal content, `100vh` sections, pinned/horizontal-scroll sections, carousels, autoplay video. Candidate techniques to evaluate in the spike (not guarantees): a scroll-through pass to trigger reveals before capture; neutralizing fixed/sticky positioning for stitched shots or capturing viewport tiles; fixing viewport height for `vh` layouts. Anything the techniques cannot fix is flagged `needs_review`, never auto-published. | Gap 4 |
| **DC-17** | **Founder-minutes per accepted site** is a tracked metric and an E2 gate: **≤ 2 minutes average** during the spike and inbox ≤ 5% of units [Estimate]. If exceeded, the fix goes into the capture runtime (recipes, techniques), not into more founder time. | Gap 8 |
| **DC-18** | **Block rate is a measured launch input:** the spike reports `BLOCKED %` per seed category. Seeds are founder-curated (gap 6). Sites that block us stay `BLOCKED` (no evasion); the dataset's target size is set by what we can legitimately collect, not by what a stealth tool could reach. | Gap 5 |
| **DC-19** | **Seeds are candidate-and-approve** (decision text in [22](22-data-collection-resilience-architecture.md)): a drafted starter list (`seeds/candidates-v0.csv`) plus founder additions; the founder judges visual design quality only. | Gap 6 |

These are also appended to [22](22-data-collection-resilience-architecture.md) §3/§17, and [20](20-founder-decisions-and-plan-validation.md) E2 is extended with block rate, founder-minutes and false-changed rate.

## 6. What this changes in the plan

- **Stack stays as decided** (Node/TypeScript Playwright + BullMQ + Postgres). No new runtime.
- **Spike scope grows slightly:** record block rate, founder-minutes per site, false-changed rate, and run the one-day Scrapling adaptive-parser/blocklist bake-off (SC-02).
- **Part-Spec implications (for when the hierarchy is updated):** Part 1.4 gains the reconciler; Part 2.3 gains the hazard list and fixtures; Part 3.4 gains normalization; a "seed list curation" input is needed for Part 2.1/2.5 and the business tasks (8.1).
- **Still the real risks:** capture-technique hazards (4), block rate (5), seed selection (6), founder time (8), legal (14). None is solved by a library.
