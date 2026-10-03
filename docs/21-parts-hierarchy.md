# 21 — Parts Hierarchy (Stage 1 of the Breakdown Protocol)

Part of the [engineering docs](README.md). Follows [the protocol](process/project-breakdown-protocol.md), Stage 1: an ordered **Groups → Parts** list. Names and one-line descriptions only — no schemas, endpoints or task lists. Next stage (Part-Spec Prompt Template + per-Part specs) **does not start until this list is reviewed**.

**Inputs (frozen):** conversation-derived docs [01–19](README.md), the founder decisions `F-xx` in [20](20-founder-decisions-and-plan-validation.md), and the collection decisions `DC-xx`/`SC-xx` in [22](22-data-collection-resilience-architecture.md) and [23](23-scrapling-evaluation-and-collection-gap-analysis.md).

**Version 1.2 (October 2026):** a coverage check against the `Feature List` added Group 9 (eight later Parts that had no home) and small wording additions to 2.7, 2.8 and 6.3; see the coverage table in [parts/feature-coverage.md](parts/feature-coverage.md).

**Version 1.1 (October 2026):** applies the pending changes recorded in [22 §17](22-data-collection-resilience-architecture.md) and [23 §6](23-scrapling-evaluation-and-collection-gap-analysis.md): descriptions of 1.4, 1.8, 2.1, 2.2, 2.3, 2.5, 3.4 and 4.4 updated, and three Parts added (2.9, 2.10, 2.11). **Part IDs are stable:** new Parts take the next free number in their Group and are listed in dependency position, so 2.9 sits before 2.3 and 2.10–2.11 sit after 2.5.

**Ordering rule:** dependency order, both across Groups and within each Group. Execution timing is governed by the stage gates in [20 §6](20-founder-decisions-and-plan-validation.md); where a Part can be done any time, its description says so. Phase tags `[pre-V0] [V0] [V1] [V2] [V3]` come from [18](18-mvp-v1-v2-v3-roadmap.md) as amended by [20 §3](20-founder-decisions-and-plan-validation.md).

**Axis used for Groups:** dependency layer (foundations → collection → normalization → intelligence → search → client surfaces → gated V2 collection → business enablement), not "backend vs frontend".

---

## Group 1 — Foundations

1.1 **Repository, Environments & Delivery** — modular-monolith repo layout, Docker Compose environments, configuration and secrets handling, CI, and the two-VM deployment shape. `[V0]`
1.2 **Core Data Platform** — PostgreSQL + pgvector setup, migrations, UUIDv7 identifiers, and the base entity tables and relationships of the design graph. `[V0]`
1.3 **Object Storage & Artifact Registry** — R2 buckets, content-addressed keys, the `RawArtifact`/`DerivedArtifact` registry, and storage lifecycle rules. `[V0]`
1.4 **Job Queue, Events & Reliability** — the `CaptureUnit` work model with leases/heartbeats and unit states, Postgres as the source of truth with a reconciler that rebuilds the BullMQ queue, per-domain fair scheduling, retries/backoff/DLQ, and the event envelope with schema versioning. `[V0]`
1.5 **Source & Policy Registry** — the `Source` entity, Source Adapter interface, per-domain crawl policy (robots, rate limits, takedown status), and authorization status. `[V0]`
1.6 **Cost, Provenance & Budget Ledger** — `CostEvent` recording, provenance fields on captured/derived items, and budget caps with early-warning alerts. `[V0]`
1.7 **Security & Safety Baseline** — crawler/app boundary, SSRF guard, container sandbox for browser workers, secrets handling, and backups with a restore test. `[V0]`
1.8 **Observability** — error tracking, structured logs, core pipeline metrics, the stuck-detection dashboard and dead-man's switch, and the daily summary email. `[V0]`

## Group 2 — Web Collection & Evidence (Core Backend)

2.1 **URL Discovery & Prioritization** — intake of the founder-approved seed list, robots/sitemap/link discovery, URL normalization and canonicalization, page-type classification, and priority scoring within crawl limits. `[V0]`
2.2 **Browser Capture Runtime** — the capture child process: deterministic, sharp (DPR 2/3) capture environment, visual-readiness detector, viewport profiles, the S0–S3 strategy ladder, and site recipes. `[V0]`
2.9 **Supervisor, Watchdogs & Circuit Breakers** — the external supervisor that leases units, enforces hard deadlines and memory limits, recycles browsers, reaps orphans, and runs the lease sweeper, domain/global breakers, poison quarantine and disk guard. `[V0]`
2.3 **Page & Section Capture** — full-page and viewport screenshots (motion and static passes), DOM/accessibility/computed-style/performance capture, DOM-measured section segmentation with per-section screenshots, and the capture-hazard techniques (sticky, scroll-reveal, `100vh`, pinned, carousels, autoplay). `[V0]`
2.4 **Media Extraction & Animation Capture** — five-layer media discovery, media inventory, SVG/GIF/video/Lottie/canvas handling, animation detection, and the original/poster/normalized-video representations. `[V0; scroll-pass recording V1]`
2.5 **Crawl Orchestration & Lifecycle** — per-source crawl runs, fan-out to capture units, the janitor roll-up, partial-failure handling, budgets and backpressure, and manual/scheduled re-crawl triggers. `[V0]`
2.10 **Capture Validation & Publishability Gate** — the automated checks that turn a capture into `quality_score`, `capture_status` and `publish_status` (accepted / needs review / rejected), including the bad-page fingerprint library; captured never means publishable. `[V0]`
2.11 **Collection Test Harness** — the torture suite of failure fixtures, the golden-set canary, and chaos drills that every capture-runtime change must pass. `[V0]`
2.6 **Dangerous-Action Policy** — keyword/role deny-list, form-submission blocking, and per-site allowlists that gate every automated interaction. `[V1]`
2.7 **Interaction Exploration (Fixed Set)** — deterministic detection and capture of nav menus, tabs, accordions, and pricing toggles, with state hashing and limits; the wider state list in Feature List F (focus, disabled, loading, error, success, drag/drop, swipe, keyboard) is a later extension. `[V1; wider states later]`
2.8 **Responsive Extensions** — conditional tablet and laptop capture, breakpoint detection, layout-signature comparison across viewports, and capture-context metadata (DPR, orientation, theme). `[V1]`

## Group 3 — Normalization & Design Graph

3.1 **Canonicalization & Deduplication** — canonical screenshots (raw + canonical), exact/perceptual/semantic duplicate detection, and `similar_to` linking. `[V0]`
3.2 **Design Graph Normalization** — turning raw captures into `Product`, `Page`, `Screen`, `Section`, `Asset`, `Animation` entities with provenance links. `[V0]`
3.3 **Text Screening & Redaction** — regex PII/secret screening of extracted text before indexing, and later pixel-level redaction for authenticated captures. `[V0 text; V2 pixel]`
3.4 **Versioning & Change Detection** — change-detection normalization, hash-skip on re-crawl and `ProductVersion` creation first, then entity-level `ADDED/REMOVED/MODIFIED/UNCHANGED` diffs. `[V0 hash-skip; V1 diffs]`

## Group 4 — Intelligence Systems

4.1 **AI Model Gateway & Cache** — provider-abstraction interface, model routing (rules → CV/OCR → small → large), cache keys, and per-call cost recording. `[V0]`
4.2 **Text Extraction & OCR** — DOM-first text extraction with open-source OCR fallback. `[V0]`
4.3 **Taxonomy & Classification** — versioned two-level taxonomy, deterministic-plus-model classifiers, confidence routing, and classification provenance. `[V0]`
4.4 **Quality Scoring & Human Review** — the Quarantine inbox and review queue for items the gate (2.10) or classifiers route to a human, override/correction capture, and training-data recording. `[V0]`
4.5 **Embeddings & Similarity** — section embeddings and "similar sections" first, then page/component/asset embeddings, with embedding versioning. `[V0 sections; V1 others]`
4.6 **Evaluation & Benchmark Harness** — labelled benchmark and dev sets, metrics (precision/recall/F1/false-positive rate), and the model/embedding bake-off procedure. `[V0]`
4.7 **Technology Detection** — evidence-based fingerprinting with detected/likely/possible/unknown status. `[V1]`
4.8 **Design-Token Extraction** — deterministic extraction of colors, typography, geometry and motion tokens; the per-site design fingerprint comes later. `[V1; fingerprint V3]`
4.9 **Component Detection** — detecting, cropping and classifying UI components from sections and screens. `[V1]`

## Group 5 — Search & Retrieval

5.1 **Search Index & Query API** — Postgres full-text + pgvector index, `SearchDocument` build, filters, and the `GET /search` surface. `[V0]`
5.2 **Hybrid Ranking & Diversification** — rank fusion of keyword and vector results, quality/freshness weighting, and per-site diversification. `[V0]`
5.3 **Visual Search** — screenshot-upload and similar-screen search over visual embeddings. `[V1]`
5.4 **Component & Region Search** — component-level and user-selected-region similarity search. `[V3]`
5.5 **AI Research & Natural-Language Query** — query understanding, research reports, and the gated MCP/API exposure over the same search layer. `[V3; MCP/API gated by F-03]`

## Group 6 — Client Surfaces

6.1 **Public App Shell, Auth & Delivery** — Next.js shell, managed authentication, CDN image delivery, and the report/remove-content flow. `[V0]`
6.2 **Explore & Search UI** — browse, keyword/semantic search, filters, and result presentation. `[V0]`
6.3 **Site, Page & Section Views** — object pages with metadata (title, description, heading structure, SEO/OpenGraph), the site map of captured pages, similar sections, and source attribution. `[V0]`
6.4 **Admin Console** — sources, crawl jobs, failures, review queue, overrides, costs, source health, and takedown tools inside `/admin`. `[V0]`
6.5 **Collections & Uploads** — saved references, folders/tags/notes, and private user uploads. `[V1]`
6.6 **Animation, Responsive & Version Viewers** — playback of animations, side-by-side responsive comparison, and version history views. `[V1]`
6.7 **Flow & App Viewers** — flow playback, app pages, and mobile screen views. `[V2]`
6.8 **Comparison & Report Views** — competitive comparison and automated design-report presentation. `[V3]`

## Group 7 — Authenticated & Mobile Collection (gated)

7.1 **Authenticated Session Management** — operator-driven login, encrypted storage state, expiry/re-authentication, and `WAITING_FOR_AUTH` handling. `[V2]`
7.2 **Authenticated Web Collection** — `WEB_APP` sources collected through authorized sessions under the dangerous-action policy. `[V2]`
7.3 **Mobile Collector Interface & Device Profiles** — the `MobileCollector` contract, device/emulator profiles, and system-UI separation. `[V2]`
7.4 **Android Collector** — emulator-based install/launch/inspect/record implementation. `[V2]`
7.5 **iOS Collector** — simulator/authorized-device implementation after Android works. `[V2]`
7.6 **Mobile Exploration & State Deduplication** — action scoring, state-similarity dedup, state-space limits, and the exploration graph. `[V2]`
7.7 **Permission & Test-State Capture** — fresh-install, permission allowed/denied, and logged-in/out controlled states. `[V2]`
7.8 **Flow Reconstruction & Recording** — building `Flow` entities from the graph, transition recordings, and flow naming. `[V2]`
7.9 **App Version History** — app version identifiers, per-version comparison, and mobile `ProductVersion` handling. `[V2]`

## Group 8 — Business Enablement & Operations

8.1 **Waitlist, Landing & Analytics** — public name, landing page with demo, waitlist capture, price-intent question, and minimal product analytics. `[pre-V0 — can start first]`
8.2 **Legal & Compliance Pack** — counsel consult, ToS/Privacy/acceptable-use, crawler policy page, takedown/DMCA procedure, and retention policy. `[before public library]`
8.3 **Pricing Experiments & Billing** — price-test design and results, and (only after validation) Stripe billing for the single paid plan. `[experiments V0; billing after E4]`
8.4 **Operating Runbooks & Reviews** — SOPs for crawl operations, takedown, restore, and the weekly/monthly metrics review. `[V0]`

---

## Group 9 — Later Features from the Feature List (coverage, unphased)

Added in v1.2 after a line-by-line check of the `Feature List` against this hierarchy found items with no Part. Phases are **not decided** (doc 18 lists several as "appear only in earlier lists" or "not phased"); each needs a founder decision before it is specified. Listed so nothing is silently dropped.

9.1 **Accessibility Analysis** — semantic HTML, ARIA, labels, alt text, heading and landmark structure, focus states, contrast and form checks, surfaced as warnings (Feature List M; the raw accessibility tree is already captured by 2.3). `[unphased]`
9.2 **Performance Analysis** — LCP, CLS, INP, TTFB, page/JS/CSS/image weight, request counts, font and lazy loading, resource timing (Feature List N; raw timings captured by 2.3). `[unphased]`
9.3 **Trends & Pattern Frequency** — design, industry and technology trends and how often patterns occur across the library (Feature List P). `[unphased]`
9.4 **Team Collaboration & Sharing** — comments, team workspaces, sharing, public collections, permissions and export (Feature List R; personal collections, folders, tags and notes are already in 6.5). `[unphased]`
9.5 **Figma Integration** — moving selected references into Figma (Feature List R). `[unphased]`
9.6 **Generation Tools** — code generation, design-system generation, "recreate this", screenshot → HTML / React / Figma (Feature List S; doc 18 marks code generation "do not build initially"). `[future]`
9.7 **Monitoring & Automated Reports** — website change monitoring, competitive monitoring and recurring trend reports for users (Feature List S; builds on 3.4 and 6.8). `[future]`
9.8 **Browser Extension** — research websites from the browser (Feature List S). **Needs a founder decision:** a capture-from-browser extension conflicts with the governing decision that end users never crawl; a view-only research extension would not. `[future, scope to decide]`

---

## Right-sizing check (for founder review)

Counts: 9 Groups, 66 Parts (55 in v1.0, plus 2.9, 2.10, 2.11 in v1.1, plus Group 9's eight coverage Parts in v1.2). Candidates I considered merging or splitting; decide before Stage 2:

- **Merge candidates:** 1.8 into 1.7 (both small); 4.7 + 4.8 (both detection-from-evidence); 7.7 into 7.6 (both mobile exploration).
- **Split candidates:** 2.3 (capture vs. section segmentation) if section segmentation proves to sprawl; 4.3 (taxonomy vs. classifiers).
- **Parts that can be written *last* or skipped** until their gate passes: all of Group 7, 5.3–5.5, 6.5–6.8, 4.7–4.9, 2.6–2.8, 8.3 billing.

**Parts to spec first (Stage 2 order, per [20 §6](20-founder-decisions-and-plan-validation.md) gates):** the V0 spike path — 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.9, 2.3, 2.4, 2.5, 2.10, 2.11 (the collection path, specified first), then 3.2, 4.3, 4.5, 5.1, 6.2 — plus 8.1 and 8.2 in parallel as business tasks. Part-Specs live in [`parts/`](parts/README.md).
