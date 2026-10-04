# 20 — Founder Decisions and Plan Validation

Part of the [engineering docs](README.md). Resolves the open questions in [19](19-decisions-assumptions-open-questions.md) §3 and validates the plan in docs 01–19. Written by the AI co-founder/operating partner at the founder's instruction ("you decide those things").

**Authority.** Docs 01–19 record what the *conversation* decided. This document records what the *founder delegated and the co-founder decided now*, under the constraints below. Where a decision here conflicts with an earlier doc's "Not decided" or phase placement, **this document wins** and the change is listed in §3. Decisions are frozen as `F-xx` and are what the Stage-2 Part-Spec template will embed ([process](process/project-breakdown-protocol.md), [21](21-parts-hierarchy.md)).

Labels: **[Fact]** from the repo/conversation · **[Assumption]** · **[Estimate]** · **[Decision]** · **[Risk]**. Vendor prices are point-in-time claims quoted in the conversation (Oct 2026), not verified.

## 0. Constraints this plan is built under

| Constraint | Consequence |
|---|---|
| **[Fact]** Solo founder; no users; no revenue; limited capital | Every system must be cheap to run and cheap to maintain. Complexity is a cost. |
| **[Fact]** A waitlist will run before launch and will reveal expected traffic | **Do not design for scale now.** Size infrastructure for the *waitlist*, not a hypothetical market. Re-size only when the waitlist number is known (§5). |
| **[Fact]** Crawling is internal; the product serves a curated dataset | No user-triggered crawl load. Read traffic (search + images) is the only public load. |
| **[Fact]** Docs 01–19 describe a target architecture far larger than one person can build and operate | Treat the monorepo/service list as a *map*, not a build list. Build a modular monolith (§4). |

## 1. Situation → Diagnosis → Verdict

**Situation.** 19 reference docs exist for a product with 0 users, 0 demand evidence, 0 lines of production code. The architecture is internally coherent and its core ideas (immutable raw evidence, deterministic-collect/AI-classify, incremental processing, one design graph) are sound and cheap to adopt.

**Diagnosis — the binding constraint is not technology; it is unvalidated demand and an unresolved legal position.** The biggest risks, in order:

1. **[Risk] Demand/willingness to pay is unproven.** The only demand evidence is the assistant's summary of Reddit/X threads (not verified here) — directionally useful (complaints about price, web coverage, capture quality) but behavioral evidence is zero. A well-known incumbent exists (Mobbin) and several website-inspiration libraries exist (Land-book, Awwwards, Dribbble were named in the conversation).
2. **[Risk] Copyright / terms-of-service exposure** from storing and *publicly displaying* third-party website screenshots. It is the one risk that can end the business after launch. Not legal advice; needs counsel before public launch.
3. **[Risk] Scope.** Four phases, three platforms, authenticated collection, flow reconstruction, AI research — for one person. Mobile (V2) alone is a company-sized effort with its own legal questions.
4. **[Risk] Capture quality at scale** (lazy loading, animation, popups) is the real engineering difficulty, not the pipeline plumbing. If captures look broken, nothing downstream matters.
5. **[Risk] Weak early defensibility.** "Millions of observations" is not a solo-founder starting position; anyone can run Playwright. Early advantage must come from *niche focus, quality, taxonomy, and distribution*, not dataset size.

**Verdict.** **The architecture is valid as a destination. The plan is not valid as a build order.** Proceed, but (a) sequence work by evidence gates (§6), (b) cut V0 to the smallest slice that can test demand and capture quality, (c) get the waitlist live *before* building more than a capture spike, (d) book the legal consult before the public library goes live.

**Distraction flags (called out as instructed):** *building before validating* (19 docs of spec precede any demand test) and *overengineering* (Kubernetes, OpenSearch, 19 services, event bus, vault are all in the plan for a pre-user product). The docs are done; **stop writing specs beyond the Part-Spec work in §7 and go test demand.**

## 2. Founder decisions (resolve open questions)

All **[Decision]**. "Revisit" = the evidence that would change it.

### Scope and phasing

| ID | Resolves | Decision | Why (solo / pre-user lens) | Revisit when |
|---|---|---|---|---|
| F-01 | Q-01, Q-03 | **V0 = §68 list + section-level embeddings and "similar sections" + hash-skip on re-crawl + minimal admin/review.** Excludes: screenshot-upload visual search, region/component search, version-comparison UI, scheduled re-crawl automation. | "Search by meaning" is the cheapest differentiator and the thing demand tests must show; pgvector at ~10⁵ vectors is trivial. Hash-skip is nearly free and protects cost. | Embedding bake-off (F-30) shows poor relevance |
| F-02 | Q-02 | **V0/V1 = public marketing websites only.** Web interaction exploration (Level 3) lands in **V1 as a fixed, small, deterministic set** (open nav menu, tabs, accordion, pricing toggle) — not open-ended exploration. **Authenticated web (`WEB_APP`) and mobile = V2, gated** (F-40). | Marketing sites are legally and technically simplest, match the Feature List's site sections, and are enough to test the thesis. | Waitlist feedback demands app/dashboard coverage |
| F-03 | Q-04 | Review queue: **V0 minimal** (table + override form; founder is reviewer). Diversification: **V0** (per-site cap: max 2 results per site in top 20). "Why is this good", trend detection, website DNA: **V3**. **MCP/API: not built until ≥ 50 activated users or paying customers ask** (it is a thin layer over the search API). | Cheap items now, expensive/speculative items gated on users. | Usage evidence |
| F-04 | Q-05 | **Capture accessibility tree and basic performance timings into raw evidence in V0** (cheap, cannot be recreated later); **no product surface before V2.** No "Laptop" profile, no breakpoint-detection or responsive-timeline feature before V2. Figma/browser extension: V3+ / deferred. | Raw evidence is immutable and reusable — capture once. UI for it has no validated demand. | Demand for accessibility/performance filters |
| F-05 | Q-06 | **Product name = the repository name: "DesignMaxxing".** (Founder decision, superseding the earlier codename-only decision.) A trademark/availability check is still advisable before the waitlist page goes public. **Landing page: deferred** — not started until the founder supplies design reference images; no landing-page code or copy work before then. |

### Business

| ID | Resolves | Decision | Why | Revisit when |
|---|---|---|---|---|
| F-06 | Q-07 | **Pricing = test, don't set.** Model for the test: Free (limited browse/search) + **one** paid plan; **no credits, no Team/Enterprise, no complex billing** until paid demand exists. Test price points at **$9 and $19/month** (from the conversation's hypotheses) via waitlist price-intent question and a fake-door upgrade. Decision rule: §6 experiment E4. | Crawling is internal, so credit-based pricing no longer maps to anything. One plan = minimal billing surface (Stripe later). | E4 result |
| F-07 | Q-08 | **Scale/budget targets [Estimate]:** V0 dataset **≈ 500 sites / ≈ 10,000 pages** (cap 25 pages/site); V1 ≈ 1,500 sites. **All-in monthly infrastructure + AI cap before revenue: $200**, early-warning at 70% ($140), measured via `CostEvent`. | Enough content to feel real in a niche; small enough that spend is trivially capped. | Waitlist size; first month's real `CostEvent` totals |

### Collection

| ID | Resolves | Decision | Why |
|---|---|---|---|
| F-10 | Q-09 | **Honor robots.txt always** (default). Overriding a domain requires an explicit logged policy override by the founder. Honest user-agent string with a contact URL. Limits: **1 request/s and 2 concurrent per domain; max 25 pages/site (V0), depth ≤ 3, asset ≤ 25 MB, site job ≤ 30 min (DC-13).** Use sitemap + links; prioritize by page-type score (home 100, pricing 90, product 85, features 80, about 60, contact 40, blog 20, legal 5). Re-crawl: manual in V0; monthly cron in V1. | Respecting robots is the cheapest legal-risk reduction available and costs little coverage on marketing sites. |
| F-11 | Q-10 | "Wait for stability" = **network idle ≥ 500 ms + `document.fonts.ready` + no layout shift for 1 s, hard cap 15 s** [Estimate; tune on the 20-site spike]. "Expensive page" for Level 3 (V1) = pages classified **home / pricing / product**, ≤ 10 HIGH-ranked candidate actions per page. | Bounded, deterministic, measurable. |
| F-12 | Q-11 | **Capture desktop 1440×900 and mobile 390×844 by default in V0** (mobile sections matter; marginal cost is low); **tablet 1024×1366 only in V1 and only when the desktop↔mobile layout signature differs** (column-count change or hidden/shown block). Responsive-difference score: simple signature comparison, not a learned model. | Cheap and explainable. |
| F-13 | Q-12 | V1: one scroll-pass video (motion mode) for hero + sections, **only on sites where an animation library/video/canvas is detected.** Canvas/WebGL: record rendered output. **HLS/M3U8: store poster + metadata only; do not download streams** (cost and copyright). GIF/WebP/APNG: standard three-representation rule. | Keeps video storage and copyright exposure small. |
| F-14 | Q-14 | State-dedup starting weights: **visual 0.40, UI-tree 0.30, OCR 0.20, navigation 0.10; same-state threshold 0.92** [Estimate]; calibrate on 100 labelled state pairs before use. Web state hash = URL + DOM structure + visible text + layout signature (+ visual embedding in V1). | Gives implementers a concrete default to tune. |

### Authentication and safety (mostly V2)

| ID | Resolves | Decision | Why |
|---|---|---|---|
| F-15 | Q-16 | (V2) Operator logs in manually in a headed browser; save Playwright `storageState`, **encrypted at rest with a key held in the host secret store**; **no passwords stored**; sessions expire after 30 days; 2FA/CAPTCHA are manual; test accounts use founder-controlled email aliases. | Minimal viable secure model; no vault product until needed. |
| F-16 | Q-17 | Dangerous-action policy: **default DENY by accessible-name/role keyword list** (delete, remove, purchase, buy, pay, confirm order, send, publish, transfer, log out/sign out, subscribe, cancel, submit) **plus hard-block form submissions** unless the site recipe allowlists a selector. Checkout flows are captured **up to the payment step, never submitted**. No VLM for detection in V1. | Deterministic, auditable, cheap. |
| F-17 | Q-18 | Web = **`logged_out` state only** (V0/V1). Browser permission prompts (notifications, location, camera) are suppressed; fresh-install/permission states are mobile-only. | Avoids web complexity with no demand signal. |

### Legal, security, data

| ID | Resolves | Decision | Why |
|---|---|---|---|
| F-18 | Q-19 | **Public display policy at launch:** show screenshots only (WebP, ≤ 1600 px wide) with **attribution + link to the live source**; **no download, no copy-to-Figma, no hosting of third-party source assets** (video, SVG, Lottie JSON stay internal evidence); visible "Report / remove" link; **takedown honored within 48 h** via Remove-source propagation. **Book a legal consult (company, ToS/Privacy, crawling, screenshot display, takedown/DMCA) before the public library opens.** The waitlist page may go live first. Not legal advice. | Reduces redistribution exposure to the minimum needed for the product to function. |
| F-19 | Q-19, Q-20 | V0 scope is **public marketing pages only**, so PII risk is low: run **regex PII/secret screening on extracted text before indexing** (emails, phones, tokens, JWTs, API-key patterns); **pixel-level redaction deferred to V2** with authenticated collection. `pii-service` is a library/function, not a service. | Right-sized to the real risk. |
| F-20 | Q-20, Q-35 | **Build SSRF protection in V0** (resolve DNS, block private/loopback/link-local/metadata ranges, re-check after redirects) because the crawler visits arbitrary URLs and follows redirects. Browser worker = **Docker container, non-root, no host mounts, restricted egress, destroyed per job batch.** Encryption at rest: provider defaults (object storage, managed/host disk); secrets via host environment/secret store. | Cheap; protects the crawler host. |
| F-41 | Q-19 | **Never collect from, scrape, or train on competitor design libraries** (Mobbin and similar). Their public terms forbid scraping, re-hosting, AI training and building substitute repositories; our sources are original product/marketing sites only (founder-approved seeds, DC-19). Competitor research uses public marketing/help pages only. |
| F-42 | Q-19 | **Launch access model: the library is account-gated** (free signup); public, indexable pages are limited to a small set of attributed previews. Revisit after counsel's advice and once SEO value is weighed against redistribution risk. |
| F-43 | Q-19 | **Legal documents (drafted/reviewed by counsel before the public library):** Terms of Service with clauses against scraping, re-hosting, AI training and competing repositories; a Copyright/DMCA page with a notice procedure and a designated agent (registration of a DMCA agent with the U.S. Copyright Office is, to my understanding, needed for safe-harbor protection — **confirm with counsel**); a "third-party IP belongs to its owners" notice; a repeat-infringer policy. Modeled on practices visible in [15](15-security-and-isolation.md) (Mobbin reference), not copied text. |
| F-44 | Q-19 | **Waitlist demo rules (G1):** show ≤ 8 sites, each attributed with a link; include a "not affiliated with or endorsed by the sites shown" line; **no third-party logos presented as customers or partners**; prefer sites whose owners have agreed. Landing-page design references (e.g. [landing/](../landing/README.md)) are inspiration only — never copied copy or assets. |
| F-45 | (Oct 2026) | **Crawling runs on the founder's own computer**, not on a cloud Crawler VM. The local machine plays the "Crawler VM" role of F-35 and doc 22 (browser workers, raw captures, spool, supervisor), with the same limits and boundaries; only the web app, database and public images move online when the library is shown to users. Where docs say "Crawler VM", read "crawler machine (the founder's computer)". |
| F-46 | (Oct 2026) | **The site list is always chosen by a person.** No automatic discovery of new sites; the founder approves every site for visual design quality (strengthens DC-19). Automation only finds the pages *inside* an approved site (home, pricing, features…, F-10 limits). |
| F-47 | (Oct 2026, collection specs) | Internet or storage outage during capture: captures are kept in the local spool on the crawler machine and uploaded when the connection returns; an fsynced spool file counts as the first durable write (resolves OQ-1.3-3, review-wave-1 §5.3). |
| F-48 | (Oct 2026, collection specs) | A lease lost before an attempt actually started (crash, sleep, shutdown) does not count as an attempt and does not move the unit down the ladder (OQ-1.4-5). |
| F-49 | (Oct 2026, collection specs) | Takedown requests are handled by the founder from a "Remove site" action in the admin console (6.4): it records the request (1.5 `takedown_request`), stops collection and deletes the site's captures and derived files within 48 h (F-18). The end-to-end owner is 6.4 driving 1.5's functions (OQ-1.5-8). |
| F-50 | (Oct 2026, collection specs) | robots.txt: a 404 (no file) means crawling is allowed; a 5xx, timeout or unreachable robots.txt means skip the site for now and retry the next day (OQ-1.5-14). |
| F-51 | (Oct 2026, collection specs) | Storage once online: full originals stay private; only resized display copies go to a public delivery location; backups live separately. Before launch everything stays on the founder's computer with the Drive desktop folder as backup (OQ-1.3-1, idea I-1). R2 object versioning is not relied on until verified (OQ-1.3-2). |
| F-52 | (Oct 2026, collection specs) | Storage estimate accepted for planning: about 40–160 GB of raw captures as WebP with DPR 2/3 (DC-20); re-measured in the 20-site spike. |
| F-53 | (Oct 2026, collection specs) | The crawler runs only during a crawl session the founder starts and stops; it never starts at boot, never sleeps, powers off or restarts the computer, and keeps the computer awake only while a page is being captured (OQ-2.9-35, OQ-2.9-27). |
| F-54 | (Oct 2026, collection specs) | A lease lost because the computer slept or lost power is released with the `host_unavailable` cause: it is not a failed attempt and the page is retried with the same strategy (OQ-1.4-25, OQ-2.9-37). |
| F-55 | (Oct 2026, collection specs) | Before launch everything runs on the founder's computer: web app, database, queue and screenshots on local disk; things move online only when the library is shown to users (OQ-1.1-10, OQ-2.9-40). |
| F-56 | (Oct 2026, collection specs) | Machine share: two browser slots at a time, low process priority, pausing while memory is tight or the computer is on battery; limits stay configurable and the spike measures real load (OQ-2.9-5, OQ-2.9-36). |
| F-57 | (Oct 2026, collection specs) | The 30-minute site limit is an active-time clock: it counts only time when the crawler is running and the job is not paused (OQ-1.4-26, OQ-2.9-38, 2.5 active-time clock). |
| F-58 | (Oct 2026, collection specs) | Crawler identity: one honest user-agent naming the project with a contact URL for every site, English locale and UTC time; phone captures emulate a phone (viewport, touch). This is a declared setup, not a disguise (OQ-2.2-8, OQ-2.2-10; F-10). |
| F-59 | (Oct 2026, collection specs) | Animations in V0: every animated item keeps its original file plus a still preview; playable normalized video is made only for videos and GIFs; Lottie and animated SVG get a playable version later if wanted (OQ-2.4-3, OQ-2.4-4). |
| F-60 | (Oct 2026, collection specs) | Publishing: approved pages go live in batches after the founder spot-checks a random 5% of each batch; one bad item holds the batch; switching to automatic is allowed after three consecutive clean batches of at least 100 checked items each (OQ-2.10-25). |
| F-61 | (Oct 2026, collection specs) | Capture uses the branded Google Chrome channel (proprietary codecs, so H.264 hero videos play) on the founder's computer; the 20-site spike confirms the effect before it is locked (OQ-2.2-34, OQ-2.3-25). |
| F-62 | (Oct 2026, collection specs) | A site is done when at least 70% of its capturable pages are ACCEPTED; NEEDS_REVIEW does not count yet; pages that cannot or must not be captured (404, non-HTML, off-domain, robots, policy, takedown) leave the denominator; later approvals can only improve the result (OQ-2.5-3, OQ-2.5-4; refines F-32). |
| F-63 | (Oct 2026, collection specs) | Downloaded third-party originals are kept as raw evidence like other captures; if space runs short, derived previews are deleted first; stricter retention is decided after the spike measures size (OQ-1.3-22, OQ-1.3-23). |
| F-64 | (Oct 2026, collection specs) | While a blocked site waits for its half-open probe, the crawler stays running so the probe can happen; other sites continue and the founder can stop at any time (OQ-2.5-5, OQ-2.5-11). |
| F-65 | (Oct 2026) | **The crawler machine is the founder's Windows PC** (x86-64). Capture runs in Linux containers through Docker Desktop with the WSL2 backend; the branded Google Chrome channel (F-61) is available for linux/amd64, so the capture child keeps its container sandbox and plays H.264 video. Files the crawler writes live inside the WSL2 filesystem (not a mounted Windows folder) for speed; the Drive backup folder (F-51) is synced from there. If the PC is ever ARM-based, revisit: Linux Chrome has no arm64 build. |

### Data and events

| ID | Resolves | Decision |
|---|---|---|
| F-21 | Q-21 | **`UIState` dropped; `ScreenState` is the single name.** `CaptureSession` = one browser/device run inside a `CaptureJob` (1 job → N sessions). **`SourceVersion` dropped for V0** (use `ProductVersion` only). `SessionProfile` introduced in V2. **Design tokens = JSONB on `Section`/`Page`/`ProductVersion`**, not a table. **Review items = `Classification` rows with `status = needs_review`.** Per-domain policy = columns/JSONB on `Source`. |
| F-22 | Q-22 | `USER_UPLOAD` is added to `Source.type` when uploads ship (V1). |
| F-23 | Q-23 | **IDs: UUIDv7.** `DerivedArtifact`: `id, raw_artifact_ids, kind, producer, producer_version, input_hash, storage_key, created_at`. `Embedding`: `id, entity_type, entity_id, model, model_version, embedding_version, vector, created_at`. `Classification`: `id, entity_type, entity_id, label, confidence, method, evidence(JSONB), model, model_version, prompt_version, taxonomy_version, status{auto,needs_review,human_verified}, created_at`. `SearchDocument` (V0) = a Postgres table `section_search(entity_id, text, taxonomy, filters JSONB, tsv, embedding)` rebuilt from derived data. |
| F-24 | Q-24, Q-25 | **Events are past-tense facts** (`entity.verb_past`, e.g. `screen.captured`); consumers decide work. Envelope per §48; **at-least-once delivery, idempotent consumers**; **additive-only changes within a `schema_version`; breaking changes bump it.** In V0, events are BullMQ job names/payloads defined in `packages/schemas` — **no separate event bus, no product webhooks, no `/internal/*` HTTP endpoints** (operators use the admin UI/CLI, which enqueue jobs). |
| F-25 | Q-26 | Cheap change signal V0: **hash of rendered HTML with scripts/styles stripped**. V1 entity matching: pages by canonical URL; sections by (page, type, order index) with perceptual-hash similarity ≥ 0.95 = `UNCHANGED`, otherwise `MODIFIED`. Capture is skipped only when the cheap signal matches *and* the page is within its re-crawl interval. |
| F-26 | Q-27 | **Relational Postgres only. No graph database.** Design graph = foreign keys + indexed relationship tables. |

### Intelligence and search

| ID | Resolves | Decision |
|---|---|---|
| F-27 | Q-28 | **Taxonomy v1** = the Feature List section C (25 section types + `unknown`) and ~10 page types (home, pricing, product, features, about, contact, blog, docs, login, signup); **two levels** (parent/child); versioned from day one. Components (Feature List D) start in V1. |
| F-28 | Q-29 | OCR: **DOM text first; open-source OCR on CPU only as fallback** (no vendor). Confidence thresholds **0.90 auto-accept / 0.60–0.90 review / < 0.60 `unknown`** are accepted as starting values, **calibrated on the benchmark** before relying on them. |
| F-29 | Q-30 | **Benchmark starts small:** 200 labelled sections + 50 labelled pages, labelled by the founder; a separate 100-item dev set for tuning. **The benchmark is never used for prompt/model tuning.** Review corrections feed the dev/training pool, not the benchmark. Grow toward §57's 1,000/200/200/100 by V2. |
| F-30 | Q-29 | **Model/vendor choice by bake-off, not opinion:** test 2–3 candidate hosted multimodal models and 2 embedding models on the 200-section benchmark under a **$60 test cap**; choose on accuracy-per-dollar; keep a single provider-abstraction interface so vendors are swappable. |
| F-31 | Q-31 | **V0 search = PostgreSQL full-text + pgvector.** Merge keyword and vector candidates with **Reciprocal Rank Fusion**; apply metadata filters in SQL (pre-filter); hand-set ranking = relevance first, quality multiplier, small freshness term, **no popularity signal until real usage exists**; diversification = per-site cap (F-03). Reindex = offline rebuild from derived artifacts. **OpenSearch only if > 1M search docs or p95 query latency > 500 ms.** |

### Operations

| ID | Resolves | Decision |
|---|---|---|
| F-32 | Q-32 | Retries: **3 attempts, backoff 30 s then 5 min, then DLQ** (the §49 example adopted). Timeouts: page capture 90 s, site job **30 min** (raised from 20 by DC-13 in [22](22-data-collection-resilience-architecture.md): 50 units at ~40 s and 2 concurrent ≈ 17 min leaves no headroom), AI call 60 s. `PARTIAL`: a site job with **≥ 70% of target pages captured completes with `partial = true`; below 70% it fails.** Manual retry re-runs only failed units (pages/stages) and resets their attempts. Checkpoint granularity = URL. |
| F-33 | Q-33 | **No storage tiering in V0** (single bucket). Add lifecycle rules later: raw HTML/DOM/traces → cold after 90 days; raw recordings kept 180 days. Mass reprocessing requires a `CostEvent`-based estimate and explicit founder approval. |
| F-34 | Q-34 | "Healthy" source = last crawl ≥ 90% pages OK **and** ≤ 5% items `needs_review` **and** last crawl < 35 days old. Alerting = Sentry email alerts + one daily summary email; **no pager.** **One admin area inside the web app** (`/admin`, role-gated); **`apps/worker-dashboard` and `notification-service` are not built.** |
| F-35 | Q-35 | **Hosting: two small VMs with Docker Compose** (one provider; Hetzner-class pricing assumed). *App VM:* web/API, Postgres+pgvector, Redis. *Crawler VM:* browser workers, raw captures, any credentials — separate to honor the §52 boundary; may be **started on demand** for batch crawls. *(Amended by F-45: the crawler runs on the founder's computer.)* Object storage + CDN: Cloudflare R2 + Cloudflare. **No Kubernetes, no Terraform, no OpenSearch until the triggers in §5.** Backups: nightly `pg_dump` to R2 + R2 versioning; **RPO 24 h, RTO 1 day; do one restore test before launch.** |
| F-36 | Q-13 | **Mobile (V2) begins as a 2-week research spike on ≤ 5 apps, with a legal go/no-go on acquisition first.** Android emulator first; one Pixel-class portrait profile, light theme; iOS only after Android works. Source only apps with legitimate access (own/partner/test builds, apps whose terms allow it). |
| F-37 | Q-15 | (V2) Flows to record first, by taxonomy: onboarding, signup, login, paywall, search, settings, checkout (up to payment). |
| F-38 | Q-37 | **Precedence rule in the [README](README.md) is confirmed:** final Blueprint > founder clarification > INT/IF/MOB/GAP > earlier iterations; **and this document > docs 01–19 where they conflict.** |
| F-40 | — | **The stage gates G1–G5 in §6 are binding.** No work belonging to a later gate (including V1 features, authenticated web, and mobile) starts before the earlier gate has passed, except the legal consult and naming, which can run in parallel. The main protection against building before validating. |

**Resolved with no decision needed:** Q-36 (source gap closed by the updated conversation).

## 3. Changes this document makes to earlier docs

| Earlier doc | Change |
|---|---|
| [18](18-mvp-v1-v2-v3-roadmap.md) | V0 gains: section embeddings + similar sections, hash-skip re-crawl, minimal admin/review, per-site diversification cap. V1 gains: fixed-set interaction capture, tablet-conditional capture, scroll-pass video. V2 = authenticated web + mobile, **gated** (F-40). Accessibility/performance: captured raw in V0, no UI before V2. |
| [02](02-system-architecture.md) | Build a **modular monolith** (§4), not the 19-service layout. `search` = Postgres FTS + pgvector. Kubernetes/OpenSearch/Terraform deferred. |
| [12](12-data-model-and-events.md) | Entity decisions F-21–F-23; event conventions F-24; `/internal/*` endpoints and product webhooks dropped. |
| [15](15-security-and-isolation.md) | Concrete V0 security/legal posture F-18–F-20. |
| [16](16-admin-and-operations.md) | One `/admin` area; no worker-dashboard/notification-service. |
| [19](19-decisions-assumptions-open-questions.md) | Open questions Q-01…Q-35 marked as decided here. |
| [08](08-web-collection.md), [14](14-failure-recovery-and-reliability.md), [03](03-capture-and-crawling-workflow.md) | Data-collection reliability is specified in [22](22-data-collection-resilience-architecture.md) (`DC-01`…`DC-13`): supervised bounded execution, strategy ladder, publishability gate, self-healing loops. Site job deadline is 30 min. |

## 4. Build shape: modular monolith, three deployables

Replace the 19-service target with **one repo, three deployables** (the directory/service names in [02](02-system-architecture.md) remain valid as *module* names and future split points):

| Deployable | Contents (as modules) | Runs on |
|---|---|---|
| `web` (Next.js app + API routes) | public UI, `/admin`, search API, auth (managed), takedown endpoint | App VM |
| `worker` (Node/TypeScript, BullMQ) | source/policy, discovery, capture runtime, media, dedup, normalization, PII regex screen, change hash, embedding/classification jobs, cost ledger | Crawler VM (browser jobs) and App VM (non-browser jobs) |
| `ml` (scripts/notebooks, Python optional) | benchmark, bake-off, evaluation, offline reindex | founder machine / on demand |

**Build vs buy (decisions):** *Buy:* managed auth, object storage + CDN (R2/Cloudflare), hosted AI models behind one abstraction, Sentry, Stripe (later), transactional email. *Build:* capture runtime, section segmentation, normalization/graph, taxonomy, evaluation harness — this is the differentiating value. *Browser hosting:* **[Estimate]** V0 needs ≈ 10,000 pages × 2 viewports × ~30 s ≈ **167 browser-hours**; at the conversation's quoted Browserbase rate (≈ $20/mo for 100 h, then ≈ $0.12/h) that is **≈ $28** — comparable to a small VM. We still **self-host** for isolation, video recording and instrumentation control, and may use a hosted browser **only as a reliability fallback if our own VM is unavailable — never to evade a block** (DC-08 in [22](22-data-collection-resilience-architecture.md)).

## 5. Scale posture and economics (no excessive scaling)

**Sizing rule (assumption, replace with data when the waitlist is known):** launch-week peak concurrent users ≈ **3–5% of waitlist**; each active user issues ≈ 1 request/10 s. Example: **5,000 waitlist → 150–250 concurrent → ≈ 15–25 req/s** — comfortably within one app VM plus a CDN (images are served from R2/Cloudflare, not the VM).

**Capacity estimates [Estimate]:** 10,000 pages × (2 full-page + ≈ 8 sections × 2 viewports) ≈ 180,000 images × 150–250 KB WebP ≈ **27–45 GB**; at the quoted R2 price ($0.015/GB-month) ≈ **< $1/month**, no egress fees. Section vectors ≈ 80,000 → trivial for pgvector. AI classification: ≈ 80,000 sections, of which a deterministic first pass should resolve most; assume 30–40% reach a model (≈ 25–30k calls) — **cost is unknown until the bake-off (F-30); the $200/month cap and `CostEvent` ledger bound the downside.**

**Scale triggers (do nothing until one fires):**

| Trigger (sustained) | Next step |
|---|---|
| App VM CPU > 60% for 1 h, or p95 page/API > 500 ms | Bigger VM → then separate Postgres from the app VM |
| Postgres > 50 GB or > 1M search docs, or p95 search > 500 ms | Managed Postgres / read replica → then consider OpenSearch |
| Crawl queue wait > 24 h | Add a second Crawler VM |
| ≥ 3 always-on VMs needed | *Then* evaluate container orchestration |

**Unit economics gate:** target **average all-in cost per processed page ≤ $0.05** [Estimate; the conversation's own engineering target was $0.01–0.03 basic, $0.03–0.10 complex]. If the 20-site spike exceeds $0.10/page, fix cost (model routing, caching, fewer sections) before scaling the dataset.

## 6. Experiments and stage gates

Format: Hypothesis → Experiment → Metric → Threshold → Decision. **Thresholds are founder-adjustable proposals [Estimate].**

| # | Hypothesis | Experiment | Metric | Threshold | Decision |
|---|---|---|---|---|---|
| E1 | Designers/devs want section-level web search enough to join a waitlist | Landing page + short demo (hand-run on ≈ 50 sites) posted to 3–5 relevant communities | Visitor→waitlist conversion; total signups in 60 days | ≥ 15% on targeted traffic **and** ≥ 500 signups | Pass: continue. 8–15% or 200–500: iterate positioning/niche. Below: stop and re-interview |
| E2 | Automated capture is good enough to publish (gate and resilience design in [22](22-data-collection-resilience-architecture.md)) | 20-site end-to-end spike (then 50) | % pages with quality score ≥ 80; section-type accuracy on auto-accepted items; cost/page; inbox size; founder-minutes; false-changed rate; block rate | ≥ 90% pages pass; ≥ 85% accuracy at ≥ 0.90 confidence; ≤ $0.10/page (target ≤ $0.05); **inbox ≤ 5% of units; founder-minutes ≤ 2 per accepted site; false-"changed" rate ≤ 10% on re-crawl; `BLOCKED %` reported per seed category** (DC-15, DC-17, DC-18 in [23](23-scrapling-evaluation-and-collection-gap-analysis.md)) | Pass: scale to V0 dataset. Fail: fix capture quality before anything else |
| E3 | Search finds useful references fast | 20 target users × 5 tasks on the demo | Task success; time to useful reference | ≥ 70% success in < 60 s | Pass: proceed to beta. Fail: fix taxonomy/embeddings/ranking |
| E4 | People will pay | Price-intent question (at $9 and $19) + fake-door upgrade for beta users | Paid-intent click-through among activated users | ≥ 5% at one price point | Pass: build billing + V1. Fail: reconsider model/niche |
| E5 | Display of screenshots is acceptable | Legal consult (F-18) | Counsel's written guidance | No blocking issue, or a workable policy | Gate for public library launch |

**Gates:** **G1** waitlist live (name decided — F-05; needs the landing page, which waits on the founder's design references) → **G2** internal alpha: 100 sites searchable (needs E2) → **G3** private beta to top waitlist (needs E3 + E5) → **G4** public launch + paid test; V1 work begins (needs E1 + E4) → **G5** mobile/authenticated spike (needs paid-demand evidence; F-36). Nothing in a later gate starts before the earlier gate passes.

## 7. Risk register (top items)

| Risk | Prob. | Impact | Early-warning signal | Mitigation | Contingency |
|---|---|---|---|---|---|
| No paying demand | Med | High | E1/E4 below threshold | Gate spend on E1; niche to SaaS marketing sites; talk to 10 target users | Pivot niche or pause; cost of failure is bounded by F-07 cap |
| Copyright/ToS claim | Med | Very high | Takedown request; C&D | F-10, F-18; counsel before public launch; thumbnails + attribution; fast takedown | Remove source within 48 h; limit to opt-in/licensed sites |
| Capture quality poor | High | High | E2 fail; review-queue growth | Readiness detector, quality gate, small spike first | Reduce section scope; hand-fix top sites |
| Incumbent response / low differentiation | Med | Med | Churn to Mobbin features; waitlist stall | Web-first depth: sections, states, tech stack, versions | Narrow to a niche incumbents ignore |
| AI cost blowout | Med | Med | `CostEvent` > 70% of cap | Deterministic-first, routing, cache keys, caps | Pause AI stage; use review queue |
| Founder overload / scope creep | High | High | Work not tied to a gate | Gates in §6; modular monolith; no new docs | Cut to E1/E2 only |
| Crawler IP blocked / site blocking | Med | Low–Med | Rising `BLOCKED` rate | Rate limits, honest UA, robots compliance | Mark `BLOCKED`, open the domain breaker, drop the site — **no evasion** (DC-08) |
| Data loss | Low | High | Backup failure alert | F-35 backups + restore test | Rebuild from raw evidence + manifests |

## 8. Next 1–3 actions (this is the answer to "what should I do?")

1. **Waitlist + demo (E1).** The name is decided (F-05: DesignMaxxing); once the founder supplies design references, build and publish a landing page with a 60-second demo from the V0 spike's output, and add the price-intent question. *Why:* it produces the traffic number that sizes everything and the first behavioral demand evidence. *Success metric:* ≥ 500 signups in 60 days at ≥ 15% conversion.
2. **Capture spike (E2).** Build only: discovery → capture runtime → section segmentation → classification → section embeddings → Postgres + R2 → bare search UI, for 20 sites on one VM. *Why:* proves quality and real cost/page, the two numbers that decide whether this is viable. *Success metric:* thresholds in E2.
3. **Book the legal consult (E5)** before any public library. *Why:* the only risk that can end the company post-launch.

**After the results:** E1 + E2 pass → expand to ≈ 100 sites and invite beta (E3, E4). E1 fails → stop building, re-interview users. E2 fails → fix capture quality before spending on anything else.

## 9. Process: where this fits in the breakdown protocol

Stage 1 output is [21 — Parts Hierarchy](21-parts-hierarchy.md). **Do not start Stage 2** (Part-Spec Prompt Template + per-Part specs) until the founder has reviewed the hierarchy. The frozen inputs the template will embed are: docs 01–19 (conversation-derived), this document's `F-xx` decisions, and the hierarchy in doc 21.

## 10. Founder ideas under consideration (October 2026)

Raised by the founder; **not decisions yet**. Each needs a yes/no before it changes a Part-Spec.

| # | Idea | Recommendation | Affects |
|---|---|---|---|
| I-1 | Store images in **Google Drive** first; move to S3 or similar once the waitlist proves demand | Before launch, keep captures on the founder's computer (F-45) and back them up with the Drive desktop sync folder: no code, no cost. When the library goes online, use object storage built for serving images. Cloudflare R2 is the cheapest of the easy options: no download fees and a free tier. Drive's API is rate-limited and not meant for serving images to a website. The storage layer (1.3) is an interface, so switching later needs no other changes | 1.3, 6.1 |
| I-2 | **Mobbin-style free tier:** visitors and free users see blurred or limited previews (for example 5 items per feature); flows and advanced features are paid | Good fit, and it also lowers legal exposure because full images are shown only to signed-in users (F-18, F-42). Decide the exact limits with the pricing experiment (E4) | 6.1, 6.2, 6.3, 8.3 |
| I-3 | **Owner submissions:** let companies submit their own site or app to the library in return for a discount or similar reward | Good fit for V1, with conditions: the owner proves the domain is theirs (DNS or meta tag); we still capture it ourselves for consistent quality; the founder still approves it (F-46). 1.5 already has `authorization_status = owner_permitted`. Apps come with the mobile phase (V2). Users still never crawl and never upload into the public library | 1.5, 6.5, 8.3 |

