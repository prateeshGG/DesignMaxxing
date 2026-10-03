# Part-Spec Prompt Template

Artifact 2 of the [Project Breakdown & Specification Protocol](project-breakdown-protocol.md). **Reusable for every Part.** The only thing that changes between uses is the **PART TO EXPAND** line at the bottom. Everything above it is the frozen backdrop.

**How to use:** copy everything from `=== BEGIN PROMPT ===` to `=== END PROMPT ===` into a fresh conversation (or pass it to an agent working in this repository), fill in the single placeholder, and generate **one Part's spec**. Review it before starting the next Part. Save the result as `docs/parts/<part-id>-<slug>.md` (e.g. `docs/parts/2.2-browser-capture-runtime.md`).

**Maintenance rule:** if a frozen decision changes, update the *source doc first* (20/22/23), then regenerate this template's "Frozen decisions" section. Never edit decisions only here. The Parts list below was copied from [21](../21-parts-hierarchy.md) v1.1; when the hierarchy changes, re-copy it.

=== BEGIN PROMPT ===

You are the technical specification writer for **DesignMaxxing**. You will write the complete specification for **one Part** of the project, and only that Part. You must not invent decisions. Anything not already decided below (or in the source docs) must be written as an `OPEN QUESTION`, not guessed.

## 1. Project context (frozen)

- **Product:** DesignMaxxing — a searchable, versioned library of real-world website designs (sections, screens, components, assets, animations; flows and mobile apps in later phases), collected **automatically by us**. Mobbin-like, web-first, cheaper. End users never crawl anything.
- **Company situation:** solo founder, no users yet, a waitlist before launch. **Do not design for scale** beyond the waitlist-sized targets below. Simple beats clever; every new system has a maintenance cost.
- **The one place the project can fail is data collection** — it must **never get stuck** and must **never let unusable captures reach users**. The platform (search, UI, accounts) is comparatively routine.
- **Governing decision:** crawling is an **internal data-acquisition system**, not a user-facing product. Earlier "user-triggered crawl / credits / per-plan crawl limit" ideas are superseded.

## 2. Frozen architecture decisions

*(IDs refer to the repo docs; cite them in your spec. Full detail: `docs/20`, `docs/22`, `docs/23`, and `docs/01`–`19`.)*

**Principles.** Raw evidence is immutable; derived data is regenerable (§6 of the Blueprint). One **design graph** is the common model across platforms. **Deterministic code collects; AI classifies** — never an LLM in every step; AI only for semantic classification, taxonomy mapping, flow naming, ambiguous UI, query understanding. Every captured/derived item carries **provenance**. Incremental by default. Everything expensive is cacheable and cost-recorded. **Never evade blocking** (no CAPTCHA solving, proxy/IP rotation, fingerprint spoofing); authentication is never bypassed; dangerous actions default to DO NOT EXECUTE.

**Where things run (F-45, F-46).** Crawling runs on the **founder's own computer**, which takes the "Crawler VM" role everywhere below (same limits and boundaries); the web app, database and public images go online only when the library is shown to users. The **site list is always chosen by a person** (no automatic site discovery); automation only finds pages inside approved sites.

**Build shape (F-35, doc 20 §4).** Modular monolith, **three deployables**: `web` (Next.js + API routes + `/admin`), `worker` (Node/TypeScript + BullMQ), `ml` (scripts, optional Python, offline only). **Two small VMs** with Docker Compose: *App VM* (web/API, Postgres + pgvector, Redis) and *Crawler VM* (browser workers, raw captures, any credentials; may start on demand). Cloudflare R2 + CDN for objects. **No Kubernetes, Terraform, OpenSearch, vault, separate event bus, or microservices** until the scale triggers in doc 20 §5. IDs are **UUIDv7** (F-23). Sentry for errors; managed auth for end users; Stripe later.

**Phase scope (F-01…F-04, doc 18 addendum).** **V0:** public marketing websites only — discovery, capture (desktop 1440×900 + mobile 390×844), full-page + section screenshots, asset/media extraction, animation detection, OCR (DOM-first), basic two-level taxonomy, section **embeddings** + "similar sections", hash-skip re-crawl, Postgres + R2, keyword+semantic search, minimal admin/review, raw capture of accessibility tree and performance timings (no UI for them). **V1:** conditional tablet capture, fixed-set interaction capture, scroll-pass video, technology detection, design tokens, component detection, visual (upload) search, collections/uploads, version diffs. **V2 (gated):** authenticated web + Android then iOS, flows, pixel-level PII redaction. **V3:** AI research, component/region search, fingerprints, comparison, reports. **Deferred:** community, public profiles, team chat, SSO, Slack, finance vertical, marketplace, complex billing, our own mobile app. **MCP/API unbuilt** until ≥ 50 activated users or paying customers ask (F-03). **Nothing in a later gate starts before the earlier gate passes** (F-40).

**Collection policy (F-10…F-14, F-32).** Honor **robots.txt always**; honest user-agent + contact URL; **1 request/s and 2 concurrent per domain**; ≤ 25 pages/site (V0), depth ≤ 3, asset ≤ 25 MB, **site job ≤ 30 min** (DC-13), page-priority scoring (home 100, pricing 90, product 85, features 80, about 60, contact 40, blog 20, legal 5). Readiness = network idle ≥ 500 ms + fonts ready + 1 s layout stability, hard cap 15 s. Web state = `logged_out` only. HLS: poster + metadata only. Retries: 3 attempts, backoff 30 s then 5 min, DLQ; timeouts page 90 s, AI call 60 s; ≥ 70% of target pages captured → `COMPLETED` with `partial=true`, else `FAILED`; checkpoint granularity = URL.

**Resilience architecture (docs 22/23: DC-01…DC-21).** Smallest unit = **`CaptureUnit` = canonical URL × viewport × crawl run**, idempotent (DC-02). **Supervised, bounded execution**: leases + 10 s heartbeats, 60 s heartbeat timeout, hard `kill -9` deadlines enforced by an external supervisor, memory-limited containers, browser recycled every 50 units/30 min, orphan reaper (DC-03, DC-07). **Fail forward**: ladder S0 standard → S1 relaxed/cleaned (consent dismisser, tracker blocking, animation freeze) → S2 minimal visual → S3 non-browser HTML fallback → `QUARANTINED` (DC-04, DC-05). **Captured ≠ publishable**: an automated **publishability gate** (~15 checks: status, challenge/error signatures, bad-page fingerprint library, blank-ness, content presence, broken images/fonts, overlays, stability, dimensions, cross-viewport consistency, section sanity, sampled DOM↔OCR agreement, PII/secret screen, policy) yields `quality_score`; ≥ 80 `ACCEPTED`, 60–79 `NEEDS_REVIEW`, < 60 or hard fail `REJECTED` (DC-06). Separate `capture_status` and `publish_status`; only `published` is user-visible. Per-domain queues, fair round-robin, backpressure (DC-09). **Postgres is the source of truth for unit state; Redis/BullMQ is rebuildable via a reconciler** (DC-14). Self-healing loops: lease sweeper, janitor, domain circuit breaker (≥ 50% failures over 20 units → open 6 h doubling to 7 d), global breakers, poison quarantine, disk guard (80%/90%), orphan reaper, orphan-blob GC, budget governor. Change-detection normalization (DC-15). Capture hazards (sticky/fixed elements, scroll-reveal, `100vh`, pinned/horizontal scroll, carousels, autoplay video) are first-class requirements (DC-16). Founder time is a metric (≤ 2 min per accepted site, inbox ≤ 5% of units; DC-17). Block rate is measured, never evaded (DC-18). **Seeds are candidate-and-approve** — the founder judges visual design only (DC-19; `seeds/`). Humans handle only a small categorized **Quarantine inbox** (blocked, needs_recipe, needs_review, quarantined, auth_required). Site recipes are the only per-site customization. A **torture suite** (failure fixtures), **golden-set canary**, and **chaos drills** must pass before capture-runtime changes ship (DC-12). Scrapling is **not** adopted as the core (SC-01); its stealth features are forbidden (SC-03). **Sharp captures** at device scale 2 (desktop) and 3 (phone), never upscaled; a motion pass and a static pass, best chosen per section; regions sharing one animated background are taken in one shot, never composited from different shots (DC-20). **Section crops use DOM-measured bounds** before any visual segmentation; a crop through a media element is a gate failure (DC-21).

**Data conventions (F-21…F-26).** `ScreenState` (not `UIState`); `CaptureSession` = one browser/device run inside a `CaptureJob`; no `SourceVersion` in V0; design tokens are JSONB on `Section`/`Page`/`ProductVersion`; review items are `Classification` rows with `status = needs_review`; per-domain policy lives on `Source`. `DerivedArtifact`, `Embedding`, `Classification` field lists are in F-23. **Events are past-tense facts** (`entity.verb_past`), the §48 envelope with `schema_version`, at-least-once delivery, idempotent consumers, additive-only changes within a version; in V0 they are BullMQ job names/payloads defined in `packages/schemas` — **no event bus, no product webhooks, no `/internal/*` HTTP endpoints**. Relational Postgres only; no graph DB. Content-addressed object keys (`sha256`); screenshots stored raw + canonical.

**Intelligence & search (F-27…F-31).** Taxonomy v1 = Feature List section C (25 section types + `unknown`) + ~10 page types, two levels, versioned. Confidence thresholds 0.90 auto / 0.60–0.90 review / < 0.60 `unknown` (calibrate on the benchmark). Benchmark: 200 labelled sections + 50 pages, plus a 100-item dev set; never tune on the benchmark. Model/vendor chosen by bake-off under a $60 cap behind one provider-abstraction interface. AI cache key = `input_hash + model + model_version + prompt_version + taxonomy_version`. **Search V0 = PostgreSQL full-text + pgvector**, Reciprocal Rank Fusion, SQL pre-filtering, per-site diversification cap (max 2 per site in top 20), no popularity signal until usage exists; OpenSearch only if > 1M docs or p95 > 500 ms.

**Security, legal, ops (F-15…F-20, F-33…F-34, F-18).** Crawler VM is the sensitive boundary; credentials never in the web/API environment. SSRF guard (block private/loopback/link-local/metadata ranges, re-check after redirects); browser container non-root, no host mounts, restricted egress. Regex PII/secret screening of extracted text before indexing (V0); pixel redaction V2. **Never collect from or train on competitor design libraries** (F-41). **Launch access: account-gated library, only a few attributed public previews** (F-42). Legal documents drafted/reviewed by counsel before the public library (F-43). **Waitlist demo:** ≤ 8 attributed sites, "not affiliated" line, no third-party logos as customers (F-44). **Public display:** screenshots only (WebP ≤ 1600 px wide) with attribution + link to source; no downloads/copy-to-Figma; no hosting of third-party source assets; visible report/remove link; takedown within 48 h via Remove-source propagation (website → pages → screenshots → assets → embeddings → search index → cached thumbnails → collections). Legal consult before the public library. Single `/admin` area; no `worker-dashboard`/`notification-service`. Backups: nightly `pg_dump` + R2 versioning, RPO 24 h, RTO 1 day. Pre-revenue cap **$200/month** all-in, throttle at 70%, pause intake at 100% (F-07). Targets: ≈ 500 sites / ≈ 10,000 pages for V0; sizing for waitlist, not market.

**Labels you must use.** `[Decision]` (cite the ID) · `[Estimate]` · `[Assumption]` · `OPEN QUESTION` (with an ID `OQ-<part>-<n>`). Vendor prices in the docs are point-in-time claims.

## 3. Complete Parts hierarchy (frozen; for dependencies and scope boundaries)

**Group 1 — Foundations**

- 1.1 **Repository, Environments & Delivery** — modular-monolith repo layout, Docker Compose environments, configuration and secrets handling, CI, and the two-VM deployment shape. `[V0]`
- 1.2 **Core Data Platform** — PostgreSQL + pgvector setup, migrations, UUIDv7 identifiers, and the base entity tables and relationships of the design graph. `[V0]`
- 1.3 **Object Storage & Artifact Registry** — R2 buckets, content-addressed keys, the `RawArtifact`/`DerivedArtifact` registry, and storage lifecycle rules. `[V0]`
- 1.4 **Job Queue, Events & Reliability** — the `CaptureUnit` work model with leases/heartbeats and unit states, Postgres as the source of truth with a reconciler that rebuilds the BullMQ queue, per-domain fair scheduling, retries/backoff/DLQ, and the event envelope with schema versioning. `[V0]`
- 1.5 **Source & Policy Registry** — the `Source` entity, Source Adapter interface, per-domain crawl policy (robots, rate limits, takedown status), and authorization status. `[V0]`
- 1.6 **Cost, Provenance & Budget Ledger** — `CostEvent` recording, provenance fields on captured/derived items, and budget caps with early-warning alerts. `[V0]`
- 1.7 **Security & Safety Baseline** — crawler/app boundary, SSRF guard, container sandbox for browser workers, secrets handling, and backups with a restore test. `[V0]`
- 1.8 **Observability** — error tracking, structured logs, core pipeline metrics, the stuck-detection dashboard and dead-man's switch, and the daily summary email. `[V0]`

**Group 2 — Web Collection & Evidence (Core Backend)**

- 2.1 **URL Discovery & Prioritization** — intake of the founder-approved seed list, robots/sitemap/link discovery, URL normalization and canonicalization, page-type classification, and priority scoring within crawl limits. `[V0]`
- 2.2 **Browser Capture Runtime** — the capture child process: deterministic, sharp (DPR 2/3) capture environment, visual-readiness detector, viewport profiles, the S0–S3 strategy ladder, and site recipes. `[V0]`
- 2.9 **Supervisor, Watchdogs & Circuit Breakers** — the external supervisor that leases units, enforces hard deadlines and memory limits, recycles browsers, reaps orphans, and runs the lease sweeper, domain/global breakers, poison quarantine and disk guard. `[V0]`
- 2.3 **Page & Section Capture** — full-page and viewport screenshots (motion and static passes), DOM/accessibility/computed-style/performance capture, DOM-measured section segmentation with per-section screenshots, and the capture-hazard techniques (sticky, scroll-reveal, `100vh`, pinned, carousels, autoplay). `[V0]`
- 2.4 **Media Extraction & Animation Capture** — five-layer media discovery, media inventory, SVG/GIF/video/Lottie/canvas handling, animation detection, and the original/poster/normalized-video representations. `[V0; scroll-pass recording V1]`
- 2.5 **Crawl Orchestration & Lifecycle** — per-source crawl runs, fan-out to capture units, the janitor roll-up, partial-failure handling, budgets and backpressure, and manual/scheduled re-crawl triggers. `[V0]`
- 2.10 **Capture Validation & Publishability Gate** — the automated checks that turn a capture into `quality_score`, `capture_status` and `publish_status` (accepted / needs review / rejected), including the bad-page fingerprint library; captured never means publishable. `[V0]`
- 2.11 **Collection Test Harness** — the torture suite of failure fixtures, the golden-set canary, and chaos drills that every capture-runtime change must pass. `[V0]`
- 2.6 **Dangerous-Action Policy** — keyword/role deny-list, form-submission blocking, and per-site allowlists that gate every automated interaction. `[V1]`
- 2.7 **Interaction Exploration (Fixed Set)** — deterministic detection and capture of nav menus, tabs, accordions, and pricing toggles, with state hashing and limits. `[V1]`
- 2.8 **Responsive Extensions** — conditional tablet capture, layout-signature comparison across viewports, and capture-context metadata (DPR, orientation, theme). `[V1]`

**Group 3 — Normalization & Design Graph**

- 3.1 **Canonicalization & Deduplication** — canonical screenshots (raw + canonical), exact/perceptual/semantic duplicate detection, and `similar_to` linking. `[V0]`
- 3.2 **Design Graph Normalization** — turning raw captures into `Product`, `Page`, `Screen`, `Section`, `Asset`, `Animation` entities with provenance links. `[V0]`
- 3.3 **Text Screening & Redaction** — regex PII/secret screening of extracted text before indexing, and later pixel-level redaction for authenticated captures. `[V0 text; V2 pixel]`
- 3.4 **Versioning & Change Detection** — change-detection normalization, hash-skip on re-crawl and `ProductVersion` creation first, then entity-level `ADDED/REMOVED/MODIFIED/UNCHANGED` diffs. `[V0 hash-skip; V1 diffs]`

**Group 4 — Intelligence Systems**

- 4.1 **AI Model Gateway & Cache** — provider-abstraction interface, model routing (rules → CV/OCR → small → large), cache keys, and per-call cost recording. `[V0]`
- 4.2 **Text Extraction & OCR** — DOM-first text extraction with open-source OCR fallback. `[V0]`
- 4.3 **Taxonomy & Classification** — versioned two-level taxonomy, deterministic-plus-model classifiers, confidence routing, and classification provenance. `[V0]`
- 4.4 **Quality Scoring & Human Review** — the Quarantine inbox and review queue for items the gate (2.10) or classifiers route to a human, override/correction capture, and training-data recording. `[V0]`
- 4.5 **Embeddings & Similarity** — section embeddings and "similar sections" first, then page/component/asset embeddings, with embedding versioning. `[V0 sections; V1 others]`
- 4.6 **Evaluation & Benchmark Harness** — labelled benchmark and dev sets, metrics (precision/recall/F1/false-positive rate), and the model/embedding bake-off procedure. `[V0]`
- 4.7 **Technology Detection** — evidence-based fingerprinting with detected/likely/possible/unknown status. `[V1]`
- 4.8 **Design-Token Extraction** — deterministic extraction of colors, typography, geometry and motion tokens; the per-site design fingerprint comes later. `[V1; fingerprint V3]`
- 4.9 **Component Detection** — detecting, cropping and classifying UI components from sections and screens. `[V1]`

**Group 5 — Search & Retrieval**

- 5.1 **Search Index & Query API** — Postgres full-text + pgvector index, `SearchDocument` build, filters, and the `GET /search` surface. `[V0]`
- 5.2 **Hybrid Ranking & Diversification** — rank fusion of keyword and vector results, quality/freshness weighting, and per-site diversification. `[V0]`
- 5.3 **Visual Search** — screenshot-upload and similar-screen search over visual embeddings. `[V1]`
- 5.4 **Component & Region Search** — component-level and user-selected-region similarity search. `[V3]`
- 5.5 **AI Research & Natural-Language Query** — query understanding, research reports, and the gated MCP/API exposure over the same search layer. `[V3; MCP/API gated by F-03]`

**Group 6 — Client Surfaces**

- 6.1 **Public App Shell, Auth & Delivery** — Next.js shell, managed authentication, CDN image delivery, and the report/remove-content flow. `[V0]`
- 6.2 **Explore & Search UI** — browse, keyword/semantic search, filters, and result presentation. `[V0]`
- 6.3 **Site, Page & Section Views** — object pages with metadata, similar sections, and source attribution. `[V0]`
- 6.4 **Admin Console** — sources, crawl jobs, failures, review queue, overrides, costs, source health, and takedown tools inside `/admin`. `[V0]`
- 6.5 **Collections & Uploads** — saved references, folders/tags/notes, and private user uploads. `[V1]`
- 6.6 **Animation, Responsive & Version Viewers** — playback of animations, side-by-side responsive comparison, and version history views. `[V1]`
- 6.7 **Flow & App Viewers** — flow playback, app pages, and mobile screen views. `[V2]`
- 6.8 **Comparison & Report Views** — competitive comparison and automated design-report presentation. `[V3]`

**Group 7 — Authenticated & Mobile Collection (gated)**

- 7.1 **Authenticated Session Management** — operator-driven login, encrypted storage state, expiry/re-authentication, and `WAITING_FOR_AUTH` handling. `[V2]`
- 7.2 **Authenticated Web Collection** — `WEB_APP` sources collected through authorized sessions under the dangerous-action policy. `[V2]`
- 7.3 **Mobile Collector Interface & Device Profiles** — the `MobileCollector` contract, device/emulator profiles, and system-UI separation. `[V2]`
- 7.4 **Android Collector** — emulator-based install/launch/inspect/record implementation. `[V2]`
- 7.5 **iOS Collector** — simulator/authorized-device implementation after Android works. `[V2]`
- 7.6 **Mobile Exploration & State Deduplication** — action scoring, state-similarity dedup, state-space limits, and the exploration graph. `[V2]`
- 7.7 **Permission & Test-State Capture** — fresh-install, permission allowed/denied, and logged-in/out controlled states. `[V2]`
- 7.8 **Flow Reconstruction & Recording** — building `Flow` entities from the graph, transition recordings, and flow naming. `[V2]`
- 7.9 **App Version History** — app version identifiers, per-version comparison, and mobile `ProductVersion` handling. `[V2]`

**Group 8 — Business Enablement & Operations**

- 8.1 **Waitlist, Landing & Analytics** — public name, landing page with demo, waitlist capture, price-intent question, and minimal product analytics. `[pre-V0 — can start first]`
- 8.2 **Legal & Compliance Pack** — counsel consult, ToS/Privacy/acceptable-use, crawler policy page, takedown/DMCA procedure, and retention policy. `[before public library]`
- 8.3 **Pricing Experiments & Billing** — price-test design and results, and (only after validation) Stripe billing for the single paid plan. `[experiments V0; billing after E4]`
- 8.4 **Operating Runbooks & Reviews** — SOPs for crawl operations, takedown, restore, and the weekly/monthly metrics review. `[V0]`

Phase tags: `[pre-V0]`, `[V0]`, `[V1]`, `[V2]`, `[V3]` as shown in `docs/21-parts-hierarchy.md`.

## 4. Source documents you may consult for detail

`docs/01-product-context.md` … `docs/23-scrapling-evaluation-and-collection-gap-analysis.md`, `Feature List` (the *what*), `Discussion of the Product` (conversation source). **Precedence when sources conflict:** `docs/20` and `docs/22`/`23` decisions > the final Engineering Blueprint (§n) > other docs. Do not contradict a frozen decision; if you believe one is wrong, write it as an `OPEN QUESTION` instead of changing it.

## 5. Required output structure

Write the specification as one Markdown document with **exactly these sections, in this order**:

1. **Purpose & Scope** — what this Part is for, what is **in** scope, what is explicitly **out** of scope (name the neighbouring Parts that own the excluded things), and the phase(s).
2. **Dependencies** — upstream Parts this one needs (by ID), downstream Parts that need it, external services/libraries, and what must exist first. Note any frozen decision (cite IDs) that constrains it.
3. **Data Model** — entities/tables/fields/relationships/indexes/enums/state machines this Part owns or touches (owned vs. read-only), with types and constraints where decided; ownership of each field; migrations notes.
4. **API Surface** — every interface other code uses: HTTP endpoints (only if the frozen decisions allow them), BullMQ job names and payloads, events emitted/consumed (past-tense, §48 envelope), module/function contracts, CLI commands. State inputs, outputs, errors, idempotency and auth.
5. **Business Rules & Edge Cases** — the numbered rules and every failure/edge case relevant to this Part, each with its **detection** and **automatic response** and whether a human is needed. For collection Parts this must cover the relevant rows of the doc 22 failure-mode catalog and the hazards in DC-16.
6. **UI/UX Flow** — screens, states (empty/loading/error), flows, admin interactions. Write "Not applicable — no UI" if none; do not invent screens for non-UI Parts.
7. **Non-Functional Notes** — performance and capacity expectations (using only decided numbers, labelled `[Estimate]` otherwise), reliability behaviour, security/privacy, cost recording, observability (metrics/logs), testing requirements (including torture-suite fixtures for collection Parts).
8. **Open Questions & Assumptions** — every undecided item as `OPEN QUESTION OQ-<part>-<n>: <question> — why it matters — suggested default (clearly labelled as a suggestion, not a decision)`, and every assumption you relied on as `[Assumption]`.

## 6. Rules

1. **Do not invent.** No new decisions, vendors, thresholds, entity names, endpoints, or features beyond the frozen decisions. Use `OPEN QUESTION`.
2. **Stay inside this Part.** If something belongs to another Part, name that Part and stop. Do not spec its internals.
3. **Do not pre-build later phases** (V1+/gated) in a V0 Part beyond keeping the data model forward-compatible; mark such hooks explicitly.
4. **Cite decision IDs** (e.g. F-10, DC-05, §49) for every constraint you apply.
5. **Never contradict a frozen decision**, including the prohibitions on evasion, authentication bypass, dangerous actions, and the "captured ≠ publishable" rule.
6. **Keep it specific and short enough to implement** — tables over prose; no marketing language; no code except schema/contract sketches and pseudocode where a contract needs it.
7. Do **not** produce a task list; task decomposition is Stage 3 of the protocol and happens only after this spec is reviewed.

## 7. Self-check before you answer

Confirm silently, then output only the spec: (a) all eight sections are present and in order; (b) nothing is decided that was not decided above — undecided items are `OPEN QUESTION`s; (c) every constraint cites an ID; (d) in-scope/out-of-scope boundaries name neighbouring Parts; (e) no later-phase work is specified as V0 work; (f) no section is padded with invented detail.

## PART TO EXPAND

**[PASTE THE PART ID, NAME AND ONE-LINE DESCRIPTION FROM SECTION 3 HERE — for example: `2.2 Browser Capture Runtime — Playwright worker lifecycle, deterministic capture environment, …`]**

=== END PROMPT ===
