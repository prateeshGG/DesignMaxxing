# 21 — Parts Hierarchy (Stage 1 of the Breakdown Protocol)

Part of the [engineering docs](README.md). Follows [the protocol](process/project-breakdown-protocol.md), Stage 1: an ordered **Groups → Parts** list. Names and one-line descriptions only — no schemas, endpoints or task lists. Next stage (Part-Spec Prompt Template + per-Part specs) **does not start until this list is reviewed**.

**Inputs (frozen):** conversation-derived docs [01–19](README.md) and the founder decisions `F-xx` in [20](20-founder-decisions-and-plan-validation.md).

**Ordering rule:** dependency order, both across Groups and within each Group. Execution timing is governed by the stage gates in [20 §6](20-founder-decisions-and-plan-validation.md); where a Part can be done any time, its description says so. Phase tags `[pre-V0] [V0] [V1] [V2] [V3]` come from [18](18-mvp-v1-v2-v3-roadmap.md) as amended by [20 §3](20-founder-decisions-and-plan-validation.md).

**Axis used for Groups:** dependency layer (foundations → collection → normalization → intelligence → search → client surfaces → gated V2 collection → business enablement), not "backend vs frontend".

---

## Group 1 — Foundations

1.1 **Repository, Environments & Delivery** — modular-monolith repo layout, Docker Compose environments, configuration and secrets handling, CI, and the two-VM deployment shape. `[V0]`
1.2 **Core Data Platform** — PostgreSQL + pgvector setup, migrations, UUIDv7 identifiers, and the base entity tables and relationships of the design graph. `[V0]`
1.3 **Object Storage & Artifact Registry** — R2 buckets, content-addressed keys, the `RawArtifact`/`DerivedArtifact` registry, and storage lifecycle rules. `[V0]`
1.4 **Job Queue, Events & Reliability** — BullMQ jobs, job states, retries/backoff/DLQ, URL-level checkpoints, and the event envelope with schema versioning. `[V0]`
1.5 **Source & Policy Registry** — the `Source` entity, Source Adapter interface, per-domain crawl policy (robots, rate limits, takedown status), and authorization status. `[V0]`
1.6 **Cost, Provenance & Budget Ledger** — `CostEvent` recording, provenance fields on captured/derived items, and budget caps with early-warning alerts. `[V0]`
1.7 **Security & Safety Baseline** — crawler/app boundary, SSRF guard, container sandbox for browser workers, secrets handling, and backups with a restore test. `[V0]`
1.8 **Observability** — error tracking, structured logs, core pipeline metrics, and the daily summary email. `[V0]`

## Group 2 — Web Collection & Evidence (Core Backend)

2.1 **URL Discovery & Prioritization** — robots/sitemap/link discovery, URL normalization and canonicalization, page-type classification, and priority scoring within crawl limits. `[V0]`
2.2 **Browser Capture Runtime** — Playwright worker lifecycle, deterministic capture environment, visual-readiness detector, viewport profiles, and crash recovery. `[V0]`
2.3 **Page & Section Capture** — full-page and viewport screenshots, DOM/accessibility/computed-style/performance capture, and heuristic section segmentation with per-section screenshots. `[V0]`
2.4 **Media Extraction & Animation Capture** — five-layer media discovery, media inventory, SVG/GIF/video/Lottie/canvas handling, animation detection, and the original/poster/normalized-video representations. `[V0; scroll-pass recording V1]`
2.5 **Crawl Orchestration & Lifecycle** — per-source crawl jobs, fan-out to capture jobs, partial-failure handling, budgets, and manual/scheduled re-crawl triggers. `[V0]`
2.6 **Dangerous-Action Policy** — keyword/role deny-list, form-submission blocking, and per-site allowlists that gate every automated interaction. `[V1]`
2.7 **Interaction Exploration (Fixed Set)** — deterministic detection and capture of nav menus, tabs, accordions, and pricing toggles, with state hashing and limits. `[V1]`
2.8 **Responsive Extensions** — conditional tablet capture, layout-signature comparison across viewports, and capture-context metadata (DPR, orientation, theme). `[V1]`

## Group 3 — Normalization & Design Graph

3.1 **Canonicalization & Deduplication** — canonical screenshots (raw + canonical), exact/perceptual/semantic duplicate detection, and `similar_to` linking. `[V0]`
3.2 **Design Graph Normalization** — turning raw captures into `Product`, `Page`, `Screen`, `Section`, `Asset`, `Animation` entities with provenance links. `[V0]`
3.3 **Text Screening & Redaction** — regex PII/secret screening of extracted text before indexing, and later pixel-level redaction for authenticated captures. `[V0 text; V2 pixel]`
3.4 **Versioning & Change Detection** — hash-skip on re-crawl and `ProductVersion` creation first, then entity-level `ADDED/REMOVED/MODIFIED/UNCHANGED` diffs. `[V0 hash-skip; V1 diffs]`

## Group 4 — Intelligence Systems

4.1 **AI Model Gateway & Cache** — provider-abstraction interface, model routing (rules → CV/OCR → small → large), cache keys, and per-call cost recording. `[V0]`
4.2 **Text Extraction & OCR** — DOM-first text extraction with open-source OCR fallback. `[V0]`
4.3 **Taxonomy & Classification** — versioned two-level taxonomy, deterministic-plus-model classifiers, confidence routing, and classification provenance. `[V0]`
4.4 **Quality Scoring & Human Review** — capture quality score, `needs_review` routing, override/correction capture, and training-data recording. `[V0]`
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
6.3 **Site, Page & Section Views** — object pages with metadata, similar sections, and source attribution. `[V0]`
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

## Right-sizing check (for founder review)

Counts: 8 Groups, 55 Parts. Candidates I considered merging or splitting; decide before Stage 2:

- **Merge candidates:** 1.8 into 1.7 (both small); 4.7 + 4.8 (both detection-from-evidence); 7.7 into 7.6 (both mobile exploration).
- **Split candidates:** 2.3 (capture vs. section segmentation) if section segmentation proves to sprawl; 4.3 (taxonomy vs. classifiers).
- **Parts that can be written *last* or skipped** until their gate passes: all of Group 7, 5.3–5.5, 6.5–6.8, 4.7–4.9, 2.6–2.8, 8.3 billing.

**Parts to spec first (Stage 2 order, per [20 §6](20-founder-decisions-and-plan-validation.md) gates):** the V0 spike path — 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.5, 3.2, 4.3, 4.5, 5.1, 6.2 — plus 8.1 and 8.2 in parallel as business tasks.
