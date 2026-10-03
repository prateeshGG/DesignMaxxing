# 03 — Capture and Crawling Workflow

Part of the [engineering docs](README.md). Prev: [02](02-system-architecture.md). Next: [04 Raw evidence](04-raw-evidence-and-storage.md).

This is an **internal data-acquisition workflow** for building our dataset, not a user-facing crawling product ([01](01-product-context.md)). Web specifics: [08](08-web-collection.md). Mobile: [09](09-ios-android-collection.md). Auth: [10](10-authentication-and-permission-workflows.md). Failures: [14](14-failure-recovery-and-reliability.md).

## End-to-end collection workflow

```
Seed URLs / sources ─► Source Manager ─► scheduler + queue ─► CaptureJob(s)
                                                              │
            ┌─────────────────────────────────────────────────┤
            ▼                    ▼                            ▼
   Level 1 HTTP discovery  Level 2 browser render   Level 3 interaction exploration
   (cheap)                 (Chromium/Playwright)    (only "expensive" pages)
            └─────────────────────────────────────────────────┤
                                                              ▼
                                         RawArtifacts + events (e.g. crawl.completed)
                                                              ▼
                              PII/secrets stage → normalization → intelligence → design graph
```

Planning-stage version of the same flow (PLAN§2): add domain → robots/sitemap check → discover URLs → prioritize pages → open browser → desktop/tablet/mobile capture → DOM + network + media extraction → interaction discovery → motion recording → section/component detection → AI enrichment → deduplication → indexing → quality check → publish. PLAN states "we haven't yet determined the exact rules at every step" — the rules are specified in the sections below and in [08](08-web-collection.md).

The capture side stops at **raw evidence plus events**. Everything after is downstream and asynchronous ([02](02-system-architecture.md)). The human's role: *add website → review automatically generated metadata → correct occasional mistakes* (AUTO).

## Source manager

Everything starts with a `Source` (§5): `id, type, name, canonical_url, domain, platform, owner, authorization_status, crawl_policy, created_at, updated_at`. Types: `WEBSITE, WEB_APP, IOS_APP, ANDROID_APP, AUTHORIZED_BUILD`. Acquisition is via a **Source Adapter** (GAP§30).

Responsibilities of `source-manager` (§1): **authorization, scheduling, crawl policy, source metadata.**

**Per-domain policy layer (GAP§2)** — built into the crawler, not bolted on:

```
Domain
 ├── crawl_allowed
 ├── media_allowed
 ├── authenticated_allowed
 ├── screenshot_allowed
 ├── recrawl_allowed
 └── takedown_status
```

plus an immediate **Remove source** operation ([15](15-security-and-isolation.md)).

**Crawl policy engine (IF§6)** — per-domain limits: `max_pages, max_depth, allowed_paths, blocked_paths, max_query_variants, max_runtime, max_asset_size`. Automatically deprioritize calendar combinations, search-result explosions, tracking URLs, duplicate query parameters, infinite pagination, session URLs — "otherwise one website can consume the entire crawler." Whether policy-flag values and engine limits are one structure inside `Source.crawl_policy` is **Not decided**.

**Site recipes (INT):** an optional per-site YAML (domain, `max_depth`, `authenticated`, include paths such as `/`, `/pricing`, `/product/*`, viewports, capture toggles for screenshots/animations/assets/interactions). Rule: **generic automatic discovery first**; create a recipe only when a site behaves unusually.

**Crawl budgets (GAP§8)** per crawl: `max_pages, max_browser_minutes, max_video_minutes, max_storage, max_AI_cost, max_depth`. The scheduler can say "this site has consumed 80% of its allocated budget; prioritize high-value pages." Budget values: **Not decided**.

**Scheduling (GAP§6):** the goal moves from "crawl this website" to "keep this dataset current", e.g. Stripe/Linear/Notion weekly, Shopify monthly, small sites quarterly (examples). If HTTP/content signals suggest nothing changed → cheap verification; run the expensive browser crawl only when necessary ([11](11-versioning-change-detection.md)). Scheduled re-crawls timing in the roadmap: **Not decided** (an earlier phase list placed them late: see [18](18-mvp-v1-v2-v3-roadmap.md)).

Operator entry points: `GET/POST /sources`, `POST /sources/:id/crawl` (§47).

## Crawl orchestration

Role of `crawl-orchestrator`: **Inferred** — crawl job lifecycle, fan-out into `CaptureJob`s, checkpoint state, policy/budget enforcement. IF§1 draws this as a *Seed Manager* (URLs/domains/tags) → *Crawl Scheduler* (priority/retries) → *Job Queue* → *Browser Workers A/B/C*.

## URL discovery — Level 1

Cheap HTTP path (§9): `URL → HTTP → HTML → links → metadata`. Discovery sources (IF§5, INT):

- **Explicit:** sitemap.xml, sitemap indexes, robots.txt, canonical URLs, RSS/Atom feeds, structured data.
- **HTML:** `<a href>`, navigation, footer, breadcrumbs, pagination, forms.
- **JavaScript:** SPA routes, client-side navigation, dynamically inserted links (links discovered after JS execution).
- **Browser-observed:** requests, redirects, navigation events.

URL normalization: e.g. `https://example.com/`, `/?utm_source=x`, `/#pricing` are mapped to appropriate canonical representations; deduplicate canonical URLs; handle hash routes, query parameters, pagination, infinite scroll. Then classify URLs by page type (`/pricing`, `/features`, `/product`, `/about`, `/blog`, `/contact`, `/login`, `/signup`, `/docs`…).

**Page prioritization (IF§7):** score discovered pages using URL semantics + navigation prominence + page content — example scores: homepage +100, pricing +90, product +85, features +80, about +60, contact +40, blog +20, legal +5 — "capture the important design surface first." The scores are illustrative.

Robots handling: the SaaS-premise edge-case table says "robots disallows crawl → respect policy / don't crawl" (MB§60); the internal framing makes `crawl_allowed` a per-domain policy flag. Whether robots.txt is **always** honored for our internal crawl: **Not decided**.

## Browser rendering — Level 2

Chromium/Playwright (§9): `URL → browser → render → wait → capture`. The detailed capture protocol, readiness detection and deterministic environment are in [08](08-web-collection.md).

## Interaction exploration — Level 3

"Only expensive pages get this treatment." Loop (§9):

```
render → detect interactive elements → rank actions → execute →
wait for stability → capture → compare state → repeat
```

- **Candidate detector (IF§14):** `<button>`, `<a>`, `<input>`, `<select>`, `[role=button]`, `[role=tab]`, `[aria-expanded]`, `[aria-controls]`, `<details>`, video controls, carousel controls. Rank: HIGH = navigation menu, tabs, accordion, modal trigger, carousel, pricing toggle; MEDIUM = dropdown, tooltip, video; LOW = ordinary links, form submission. "Don't click everything" (combinatorial explosion).
- **Scoring:** `action_score = novelty + semantic_importance + navigation_probability + visual_prominence − repetition − risk` (§22).
- **Per-candidate capture (IF§15):** before → perform action → wait for stability → after → visual diff. Meaningful difference → save the state; no change → discard ("automatically eliminates thousands of useless captures").
- **State hash (MB§35):** combines URL, DOM structure, visible text, visual embedding, layout signature; if new → enqueue, if duplicate → stop the branch.
- **State-space limits (GAP§9):** `max_unique_states, max_depth, max_actions_per_state, max_scroll_distance, max_repeated_state_count` — for feeds that never end, calendars that expand per date/month/year, infinite carousels (edge-case table: "detect cycle").
- **Algorithm (GAP§10):** graph traversal + priority scoring + state dedup; "AI can help decide which unexplored action is interesting, but the underlying system should remain deterministic." Don't let an LLM randomly click.
- **Safety:** dangerous actions default to DO NOT EXECUTE ([10](10-authentication-and-permission-workflows.md)). Forms: "detect structure; filling requires care" (AUTO).
- Exact criteria for an "expensive page" and numeric budgets are **Not decided**. Phase for web Level 3: **Not decided** in the final Blueprint (V0 list omits it); earlier iterations placed interaction capture in V1.5/V2 ([18](18-mvp-v1-v2-v3-roadmap.md)).

## Capture jobs

Everything asynchronous is a job (§7).

```
CaptureJob: id, source_id, type, status, priority, attempts, max_attempts,
            started_at, completed_at, error, cost
```

Statuses (final Blueprint): `QUEUED, RUNNING, PAUSED, WAITING_FOR_AUTH, WAITING_FOR_REVIEW, COMPLETED, FAILED, CANCELLED`. A `CaptureSession` entity also exists (§4); fields **Not decided** ([12](12-data-model-and-events.md)). `CaptureJob.type` values **Not decided**.

## Crawl lifecycle

Two vocabularies appear in the conversation. **Inferred** reconciliation: the Blueprint's statuses are job *states*; IF§4 is the ordered *pipeline stage* a site-level crawl moves through; the failure names are *reasons* attached to a failed or waiting job.

Stage progression (IF§4): `CREATED → DISCOVERING → CRAWLING → CAPTURING → PROCESSING → CLASSIFYING → QUALITY_CHECK → PUBLISHED`.

Failure/waiting reasons (IF§4): `AUTH_REQUIRED, CAPTCHA_REQUIRED, BLOCKED, TIMEOUT, NETWORK_ERROR, INVALID_SITE, PARTIAL, FAILED`. "A failed page should **not** fail the entire website." (An earlier user-facing list also had `PUBLIC, USER_AUTHORIZED, API_AUTHORIZED, MFA_REQUIRED, ROBOTS_RESTRICTED, CRAWL_ERROR`: **Superseded**, see [10](10-authentication-and-permission-workflows.md).)

State transitions — **Inferred**:

```
QUEUED ─► RUNNING ─► COMPLETED
            │  ▲
            │  └── resume (new worker, from checkpoint)
            ├─► PAUSED
            ├─► WAITING_FOR_AUTH ─(operator supplies/refreshes session)─► RUNNING
            ├─► WAITING_FOR_REVIEW ─► RUNNING / COMPLETED
            ├─► FAILED   (retries exhausted → dead-letter queue, manual retry)
            └─► CANCELLED
```

- `WAITING_FOR_AUTH`: entered when the collector hits `LOGIN_REQUIRED` / session expiry (§24, INT).
- `WAITING_FOR_REVIEW`: meaning not defined; **Inferred:** a human decision is needed (bad capture, conflicting classifiers, suspicious capture — [16](16-admin-and-operations.md)). IF§26: low-quality captures do not automatically enter the public dataset.

## Checkpoints

For large sites a job tracks (§51): discovered, completed, failed, and pending URLs. "If the process dies, resume." Combined with disposable browser workers: a crashed worker is destroyed, a new one spawned and work resumes from the checkpoint (§50) — [14](14-failure-recovery-and-reliability.md). Checkpoint storage location **Not decided** (**Inferred:** Postgres). The Master Blueprint also adds **crawl manifests** for reproducibility (GAP§27, [14](14-failure-recovery-and-reliability.md)).

## State handling

- Web: Level 3 compares state after each action via the state hash; page-level and section-level captures are separate ([08](08-web-collection.md)).
- Mobile: each screen is a `ScreenState` node; states are deduplicated by weighted similarity ([09](09-ios-android-collection.md)).
- Controlled test states and session profiles: [10](10-authentication-and-permission-workflows.md).

## How the system avoids unnecessary work

Full treatment in [13](13-cost-performance-and-scaling.md):

| Mechanism | Where |
|---|---|
| Cheap HTTP discovery before browser rendering | Level 1 vs 2 |
| Interaction exploration only on pages that warrant it; HIGH/MEDIUM/LOW ranking | Level 3 |
| Page prioritization and crawl budgets; crawl-policy limits | IF§6–7, GAP§8 |
| Responsive matrix conditional: desktop/mobile baseline; tablet conditional; extras only on meaningful difference | §12, [08](08-web-collection.md) |
| Re-crawl → diff → process only changed material; cheap HTTP verification before a browser re-crawl | §73, GAP§6–7, [11](11-versioning-change-detection.md) |
| Hash-keyed caching of screenshots, assets, OCR, embeddings, classification, video | §43, [04](04-raw-evidence-and-storage.md) |
| Content-addressable storage: shared assets stored once | §44 |
| State deduplication and state-space limits prevent infinite exploration; no-change interactions are discarded | §21, GAP§9, IF§15 |
| Action scoring avoids random clicking | §22 |
| Checkpoints avoid restarting a large crawl | §51 |
| Decoupled stages: a downstream failure does not trigger a re-crawl | §8 |
| Reuse browser processes/pages instead of relaunching Chromium per page | MB§30 |
