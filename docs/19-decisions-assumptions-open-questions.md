# 19 — Decisions, Assumptions, Open Questions

Part of the [engineering docs](README.md). Prev: [18](18-mvp-v1-v2-v3-roadmap.md).

Register of what the conversation settled, what these docs assume, what remains unsettled, and where the conversation contradicts itself. Citation tags (`§n`, `MB§n`, `IF§n`, …) are defined in the [README](README.md#how-the-conversation-unfolds-and-which-part-wins).

**What counts as a "decision".** The user repeatedly answered the assistant's proposals with "do it" and never contested them except once (the crawling-is-internal clarification). So positions the assistant presented as recommendations — and the user did not override — are recorded as decisions, **except** where the assistant itself labelled them *provisional / proposed / ready for testing* (marked **Provisional**) or where a later statement supersedes them (see §4).

## 1. Decisions

| ID | Decision | Reasoning / context | Docs |
|---|---|---|---|
| D-01 | Build a Mobbin-like design intelligence platform; websites first, cheaper | User's opening request | [01](01-product-context.md) |
| D-02 | The crawler/collector is an **internal data-acquisition system**, not a user-facing product. **Governing clarification; supersedes the user-facing SaaS assumptions** | User: "i am not building this crawling for users it is just for me to collect the data" | [01](01-product-context.md), [03](03-capture-and-crawling-workflow.md) |
| D-03 | Automate the whole collection process, not only media; target **95%+ automated collection, not 100% automated interpretation** | User: "i meant the whole thing"; AUTO | [01](01-product-context.md), [03](03-capture-and-crawling-workflow.md) |
| D-04 | Core principle: collect raw evidence once → normalize into a common design graph → derive everything else | Prevents separate web/iOS/Android products | [02](02-system-architecture.md) |
| D-05 | Raw evidence is immutable; derived data is regenerable | Reprocess with better models without re-crawling (§6) | [04](04-raw-evidence-and-storage.md) |
| D-06 | Design graph is the common representation across platforms | §1, §74, MOB§18 | [05](05-normalization-and-design-graph.md) |
| D-07 | Monorepo with `apps/`, `services/`, `packages/`, `infrastructure/`, `ml/` (target layout; bootstrap with fewer services) | §2, IF§2/§30 | [02](02-system-architecture.md) |
| D-08 | PostgreSQL source of truth; object storage for heavy files; search index; vector index; no media in Postgres | §3 | [02](02-system-architecture.md) |
| D-09 | Everything asynchronous is a job; queue/event-driven between services | §7–8; failures isolated | [02](02-system-architecture.md), [12](12-data-model-and-events.md) |
| D-10 | Three-level web collection: HTTP discovery → browser rendering → interaction exploration (only expensive pages) | Cost control (§9) | [03](03-capture-and-crawling-workflow.md), [08](08-web-collection.md) |
| D-11 | Do not assume 1 URL = 1 screen; store full-page and section captures | Users search sections (§10–11) | [08](08-web-collection.md) |
| D-12 | Responsive: desktop 1440×900 and mobile 390×844 baselines, tablet 1024×1366 conditional; extras on meaningful difference | §12 | [08](08-web-collection.md) |
| D-13 | Animated media stored as original + poster + normalized video; SVG/Lottie/GIF/video/canvas/WebGL have dedicated handling; canvas/WebGL captured as rendered output | §13–17, INT, TECH§9 | [08](08-web-collection.md) |
| D-14 | Technology detection is an optional enrichment with evidence and confidence; statuses detected/likely/possible/unknown; never promise certainty | §18, TECH§1–2 | [06](06-intelligence-pipeline.md), [08](08-web-collection.md) |
| D-15 | Mobile collectors implement one `MobileCollector` interface | §19 | [09](09-ios-android-collection.md) |
| D-16 | Mobile apps are explored as a graph; states deduplicated by multi-signal weighted similarity; actions scored; exploration is deterministic graph traversal | §20–22, GAP§10 | [09](09-ios-android-collection.md) |
| D-17 | Dangerous actions (Delete, Purchase, Send, Publish, Transfer, Logout, Subscribe, Pay) default to DO NOT EXECUTE | §23 | [10](10-authentication-and-permission-workflows.md) |
| D-18 | Login-required → `WAITING_FOR_AUTH`; operator provides an authorized session/test account; engine never bypasses auth; CAPTCHA/MFA are human checkpoints | §24, INT | [10](10-authentication-and-permission-workflows.md) |
| D-19 | Controlled test states: fresh_install, permissions_denied/allowed, logged_out/in (+ previously launched) | §25, MOB§14 | [10](10-authentication-and-permission-workflows.md) |
| D-20 | Flows are generated from the graph; AI may only label; recorded video is derived | §26–27 | [09](09-ios-android-collection.md) |
| D-21 | Website versions inferred from crawl timestamp, deployment metadata, content hash; apps use real version identifiers; never overwrite historical captures | §28, MB§40 | [11](11-versioning-change-detection.md) |
| D-22 | Change detection at page/section/screen/component/asset/flow level → ADDED/REMOVED/MODIFIED/UNCHANGED; runs before expensive AI | §29, GAP§7 | [11](11-versioning-change-detection.md) |
| D-23 | Hierarchical, versioned taxonomy; multiple classification sources; AI is never the only classifier | §30–31, GAP§23 | [06](06-intelligence-pipeline.md) |
| D-24 | Every derived attribute carries label/confidence/source (+ model/version provenance); low confidence → human review; corrections are recorded, not overwritten, and create training data | §32–33, GAP§24–25 | [06](06-intelligence-pipeline.md), [16](16-admin-and-operations.md) |
| D-25 | Separate embeddings per entity type; text + visual + multimodal | §34 | [07](07-search-and-retrieval-architecture.md) |
| D-26 | Search pipeline: parse → retrieve → filter → rank/diversify; popularity must not overwhelm relevance | §35–37 | [07](07-search-and-retrieval-architecture.md) |
| D-27 | Uploaded references are a separate source, not mixed into the public dataset automatically | §39 | [04](04-raw-evidence-and-storage.md) |
| D-28 | Admin dashboard is a core product; every automatic decision is overridable | §40, GAP§29 | [16](16-admin-and-operations.md) |
| D-29 | Record `CostEvent` for every expensive operation; track cost per site/screen/flow/successful capture; core metric = cost per successfully indexed screen | §42, GAP§26 | [13](13-cost-performance-and-scaling.md) |
| D-30 | Hash-keyed caching everywhere; CAS; HOT/WARM/COLD tiers; CDN with on-demand derivatives | §43–46 | [04](04-raw-evidence-and-storage.md), [13](13-cost-performance-and-scaling.md) |
| D-31 | Event envelope with `schema_version` | §48 | [12](12-data-model-and-events.md) |
| D-32 | Workers have timeout/retry/backoff/DLQ; browser workers disposable; checkpoints; a failed page must not fail the whole site | §49–51, IF§4 | [14](14-failure-recovery-and-reliability.md) |
| D-33 | Crawler VPC boundary; credentials never in the normal frontend/API environment; crawling treated as untrusted-code execution in ephemeral isolated containers | §52, MB§61 | [15](15-security-and-isolation.md) |
| D-34 | Initial stack: Next.js, TypeScript/Node API and workers, Postgres, Redis+BullMQ, S3-compatible storage, Cloudflare/CloudFront CDN, Playwright+Chromium, pgvector first (search engine for V0: see Q-31) | §53 | [02](02-system-architecture.md) |
| D-35 | Deterministic code first; LLM/VLM only for semantic classification, taxonomy mapping, flow naming, section interpretation, ambiguous UI, query interpretation; model-routing ladder small → large | §54, PLAN§9 | [17](17-ai-architecture.md) |
| D-36 | Cache AI inferences by input_hash+model+model_version+prompt_version+taxonomy_version | §56 | [17](17-ai-architecture.md) |
| D-37 | Evaluate classifiers against a human-labeled benchmark (1,000 screens / 200 sections / 200 components / 100 flows) | §57 | [17](17-ai-architecture.md) |
| D-38 | Phases V0–V3 as listed in §68–71; community, public profiles, team chat, SSO, Slack, finance vertical, marketplace, complex billing, own mobile app deferred | §68–72 | [18](18-mvp-v1-v2-v3-roadmap.md) |
| D-39 | Five assets to protect: immutable raw evidence; unified design graph; automated exploration + state dedup; multimodal indexing; incremental crawling/change detection | Closing section | [01](01-product-context.md), [02](02-system-architecture.md) |
| D-40 | "Deterministic systems collect. AI classifies." AI is not responsible for collecting raw data | INT, IF§3 | [02](02-system-architecture.md), [17](17-ai-architecture.md) |
| D-41 | The web collector is a **website observation engine** with a deterministic capture environment, a capture protocol and a visual readiness detector (no blind waits); static and motion capture modes | TECH§12, WF§9, MB§31–33 | [08](08-web-collection.md) |
| D-42 | Internal authentication via authorized site/session profiles in a credential vault; no raw passwords in the crawler DB; session expiry → human re-auth | INT, IF§9, GAP§5 | [10](10-authentication-and-permission-workflows.md) |
| D-43 | PII and secrets are detected and redacted before storage; the unredacted original lives only in a quarantined layer; discovered secrets never enter the searchable dataset | GAP§3–4 | [15](15-security-and-isolation.md) |
| D-44 | Per-domain policy layer (`crawl_allowed`, `media_allowed`, `authenticated_allowed`, `screenshot_allowed`, `recrawl_allowed`, `takedown_status`) and a "Remove source" operation that propagates through derived data | GAP§2 | [03](03-capture-and-crawling-workflow.md), [15](15-security-and-isolation.md) |
| D-45 | Deduplicate at URL, exact-hash, perceptual-hash and semantic levels; semantic duplicates are linked (`similar_to`), never auto-deleted | MB§39, IF§21 | [04](04-raw-evidence-and-storage.md) |
| D-46 | Acquisition through a Source Adapter abstraction (web URL, authorized web session, iOS authorized build, Android APK/AAB, internal test build) | GAP§30 | [02](02-system-architecture.md), [09](09-ios-android-collection.md) |
| D-47 | Screenshots are canonicalized (crop system chrome, normalize DPR/dimensions, redact dynamic PII); keep raw + canonical | GAP§11 | [04](04-raw-evidence-and-storage.md) |
| D-48 | System UI (status bar, navigation bar, keyboard, permission dialogs) is stored separately from app UI | MOB§16 | [05](05-normalization-and-design-graph.md), [09](09-ios-android-collection.md) |
| D-49 | Exploration is bounded by state-space limits (`max_unique_states`, `max_depth`, `max_actions_per_state`, `max_scroll_distance`, `max_repeated_state_count`) and crawl budgets (`max_pages`, `max_browser_minutes`, `max_video_minutes`, `max_storage`, `max_AI_cost`, `max_depth`) | GAP§8–9 | [03](03-capture-and-crawling-workflow.md) |
| D-50 | Everything captured or derived has provenance (source, capture context, model/version) | MB§74, GAP§1/§24 | [04](04-raw-evidence-and-storage.md) |
| D-51 | Capture quality is scored; failures are explicit; low-quality captures do not enter the public dataset; capture reliability on difficult sites is the first engineering milestone | MB§19, MB§75, IF§26 | [06](06-intelligence-pipeline.md), [14](14-failure-recovery-and-reliability.md) |
| D-52 | Disaster recovery rests on Postgres backups, object-storage versioning, crawl manifests, and dataset exports; crawls must be reproducible | GAP§27 | [14](14-failure-recovery-and-reliability.md) |
| D-53 | Mobile rollout order after web: Android, then iOS, then unified intelligence | MOB§21 | [09](09-ios-android-collection.md), [18](18-mvp-v1-v2-v3-roadmap.md) |
| D-54 | Legal/compliance policies (ToS, privacy, AUP, crawler policy, takedown, copyright complaint, retention, upload and dataset policies) are designed before public launch and reviewed by counsel | PLAN§12, MB§64 | [15](15-security-and-isolation.md) |
| D-55 | Dedicated collection architecture (not an LLM browsing agent): LLM-driven browsing is the expensive path the design avoids | TOK, WF§10 | [13](13-cost-performance-and-scaling.md), [17](17-ai-architecture.md) |

**Provisional (stated, but explicitly "not locked", or point-in-time):** confidence thresholds 0.90 / 0.60 (AUTO); pricing tiers and credit multipliers (MB§48–50, MB§78–79); engineering cost targets per page (MB§46); vendor choices and prices — Cloudflare R2, Browserbase and OpenAI price references (MB§29, §37, §41, §79); page-priority scores; MCP tool list and API endpoints (MB§24–25); crawl-plan limits (MB§36); metrics and north star (MB§69–70).

## 2. Assumptions

Items below are **Inferred** by the documentation author, not stated in the conversation. Confirm or reject each.

| ID | Assumption | Where used |
|---|---|---|
| A-01 | `crawl-orchestrator` owns crawl job lifecycle, fan-out, checkpoint state and policy/budget enforcement | [03](03-capture-and-crawling-workflow.md) |
| A-02 | Job state transitions beyond the listed statuses (e.g. `WAITING_FOR_REVIEW` = human decision needed); IF§4 stages are pipeline stages while §7 statuses are job states, and failure names are reasons | [03](03-capture-and-crawling-workflow.md), [14](14-failure-recovery-and-reliability.md) |
| A-03 | Checkpoints are stored in Postgres | [03](03-capture-and-crawling-workflow.md) |
| A-04 | `/internal/*` endpoints enqueue work rather than execute pipeline stages inline | [02](02-system-architecture.md) |
| A-05 | `ScreenState` (exploration node) normalizes into `Screen`/`UIState` | [05](05-normalization-and-design-graph.md) |
| A-06 | Raw session recordings from `record()` are RawArtifacts; composed `flow.mp4` is a DerivedArtifact | [09](09-ios-android-collection.md) |
| A-07 | A new website `ProductVersion` is created only when content hashes differ | [11](11-versioning-change-detection.md) |
| A-08 | V0 viewport set is desktop (maybe plus mobile baseline) | [08](08-web-collection.md) |
| A-09 | Dangerous-action policy is a hard gate, not just a score penalty | [10](10-authentication-and-permission-workflows.md) |
| A-10 | Only derived/CDN output (post PII/secrets handling) crosses from the crawler boundary to the product side | [15](15-security-and-isolation.md) |
| A-11 | Consumers are idempotent (retries, reprocessing, cache hits) | [12](12-data-model-and-events.md), [14](14-failure-recovery-and-reliability.md) |
| A-12 | The admin dashboard is needed from V0 to operate crawls | [18](18-mvp-v1-v2-v3-roadmap.md) |
| A-13 | The §73 "real MVP" is the end-to-end shape V0 grows into, while §68 defines the V0 cut | [18](18-mvp-v1-v2-v3-roadmap.md) |
| A-14 | ML services are likely Python | [02](02-system-architecture.md) |
| A-15 | The PII/secrets stage sits between capture and normalization/exposure | [02](02-system-architecture.md) |
| A-16 | `AUTH_REQUIRED`/`CAPTCHA_REQUIRED` map to `WAITING_FOR_AUTH` | [10](10-authentication-and-permission-workflows.md) |
| A-17 | Where the Master Blueprint's SaaS-premise items still make sense internally (SSRF blocking, per-domain rate/concurrency limits, asset-size caps), they remain applicable | [15](15-security-and-isolation.md) |
| A-18 | Android-before-iOS ordering applies within V2 | [09](09-ios-android-collection.md) |
| A-19 | BullMQ's retry/backoff features implement the retry model | [14](14-failure-recovery-and-reliability.md) |
| A-20 | Blob keys use CAS while per-source structure is held in metadata; the IF§20 directory layout is a logical view | [04](04-raw-evidence-and-storage.md) |
| A-21 | On takedown, raw evidence (not only derived data) is also removed or quarantined | [15](15-security-and-isolation.md) |

(Resolved since the previous revision: mobile has no "Section" layer — now stated in MOB§18; `pii-service` role — now stated in GAP§3–4.)

## 3. Open questions

> **Update:** the founder delegated these questions and they were decided in [20](20-founder-decisions-and-plan-validation.md) (decisions `F-01`…`F-40`, each citing the `Q-xx` it resolves). Items below still show their pre-decision status for traceability; treat **20 as authoritative** where it addresses a question. Not decided by 20: none of Q-01…Q-35 remain open, but several decisions are explicitly provisional pending experiments E1–E5 (thresholds, price points, model choice via bake-off).

Status: **Open** = Not decided; **Partly** = the conversation addresses part of it; **Resolved** = settled by the updated conversation (kept for traceability).

### Scope and phasing

| ID | Question | Status |
|---|---|---|
| Q-01 | §68 V0 omits embeddings and visual/semantic classification, but §73 "real MVP" includes both (and re-crawl diffing). Which is V0? | Open |
| Q-02 | Which phase covers web interaction exploration (Level 3) and authenticated website collection (`WEB_APP`)? The "automated exploration + state dedup" asset is foundational but mobile is V2; earlier lists put web interaction at V1.5/V2 and authenticated crawling at V3. | Open |
| Q-03 | Is incremental crawling / scheduled re-crawl a V0 requirement even though "version comparison" is V1? | Open |
| Q-04 | Phase of the human review queue, diversification, "why is this good?", MCP/API exposure, trend detection, website DNA. | Open |
| Q-05 | How are Feature List sections M (accessibility) and N (performance), Laptop profile, breakpoint detection, Figma and the browser extension phased? | Partly — accessibility/performance capture and the 1280×800 laptop profile appear in the capture design; no phase |
| Q-06 | Product name. | **Resolved** — "DesignMaxxing" (the repo name), [20](20-founder-decisions-and-plan-validation.md) F-05 |

### Business

| ID | Question | Status |
|---|---|---|
| Q-07 | Pricing and revenue model; is there a library-access subscription now that crawling is internal? | Partly — a hypothesis exists (MB§47–50, §78) but its crawl-credit premise is superseded; complex billing deferred |
| Q-08 | Target scale (sources, pages, crawl frequency) and cost budgets; the cost model at 10K–10M screens. | Open — never computed |

### Collection

| ID | Question | Status |
|---|---|---|
| Q-09 | `crawl_policy` contents; scheduler cadence; sitemap use; whether robots.txt is always honored internally. | Partly — policy-engine fields (IF§6), per-domain flags (GAP§2), discovery sources including sitemap/robots (IF§5) and cadence examples (GAP§6) exist; "always honor robots" is not stated |
| Q-10 | What qualifies as an "expensive page" for Level 3; exploration budgets; wait-for-stability criteria. | Partly — candidate ranking HIGH/MED/LOW (IF§14), readiness detector (MB§32), state-space limit names (GAP§9); thresholds and values open |
| Q-11 | How "meaningful difference" triggers extra responsive captures; additional profiles. | Partly — responsive-difference score idea (WF§8); computation open |
| Q-12 | Capturing scroll/hover/parallax animation; M3U8 streaming; WebP/APNG details. | Partly — canvas/WebGL = record rendered output; behavioral observation for JS animation; scroll capture and HLS open |
| Q-13 | How mobile app packages are acquired; device/OS matrix; tooling; iOS equivalent of `back()`. | Partly — Source Adapter kinds, "authorized acquisition only", canonical small/medium/large profiles, portrait/landscape; concrete sources/tooling open |
| Q-14 | State-dedup weights and threshold; dynamic content handling. | Partly — web state-hash signals (MB§35) added; numbers open |
| Q-15 | How "important flows" are selected for recording. | Open |

### Authentication and safety

| ID | Question | Status |
|---|---|---|
| Q-16 | Form and lifecycle of authorized sessions; 2FA/CAPTCHA/SSO; test-account provisioning; vault technology. | Partly — encrypted browser state/cookies/OAuth/service accounts preferred, no raw passwords, CAPTCHA/MFA = human checkpoint; vault and provisioning open |
| Q-17 | Representation, granting and detection of the dangerous-action policy; handling flows that need a dangerous step. | Open |
| Q-18 | Do `fresh_install`/permission states apply to web? | Open |
| Q-19 | Legal/compliance positions (ToS, robots, copyright, display rights, DMCA handling, retention); `pii-service` techniques. | Partly — takedown propagation (GAP§2) and PII/secrets pipeline (GAP§3–4) defined; policy positions explicitly deferred to counsel review |
| Q-20 | Secret storage, encryption at rest, access/audit logging for raw captures; browser sandbox specifics; whether SSRF protection is built for an internal-only crawler. | Partly — ephemeral isolated containers and restricted network (MB§61); rest open |

### Data and events

| ID | Question | Status |
|---|---|---|
| Q-21 | `UIState` vs `ScreenState`; `CaptureSession` fields and relation to `CaptureJob`; `SourceVersion` vs `ProductVersion`; whether `SessionProfile`, per-domain policy, design tokens and review items are entities. | Open |
| Q-22 | `USER_UPLOAD` is used as a source (§39) but is not in `Source.type`. | Open |
| Q-23 | ID format; `DerivedArtifact`, `Embedding`, `SearchDocument`, `Classification` fields. | Open |
| Q-24 | Event naming convention (facts vs. commands), event catalog, delivery guarantees, schema compatibility policy; relation of product webhooks (MB§25) to internal events. | Open |
| Q-25 | How internal `POST /internal/*` endpoints relate to the queue-based flow. | Open |
| Q-26 | Entity matching across versions and thresholds for MODIFIED; cheap change signals (ETag, HTML hash, sitemap lastmod). | Partly — capture can be skipped after cheap verification (GAP§6); signals and matching open |
| Q-27 | Graph storage approach (relational only vs. graph engine); cardinalities. | Partly — relational table sketches (IF§19); cardinalities open |

### Intelligence and search

| ID | Question | Status |
|---|---|---|
| Q-28 | Taxonomy content (levels, labels); handling of unknown/custom sections. | Open |
| Q-29 | Model/vendor choices (OCR, CV, VLM, embeddings); evidence-combination method; confidence calibration and review threshold. | Partly — 0.90/0.60 thresholds proposed (Provisional); the rest open |
| Q-30 | Labeling workflow, benchmark governance, pass thresholds, train/benchmark separation. | Open |
| Q-31 | V0 "basic search": OpenSearch (§53) or Postgres FTS + pgvector first (MB§71, IF§23)? Candidate merging/score fusion; pre/post-filtering for vectors; diversification algorithm; ranking weights; reindexing strategy. | Open — conflicting statements |

### Operations

| ID | Question | Status |
|---|---|---|
| Q-32 | Retry/backoff/timeouts per job type; manual-retry semantics; mapping `PARTIAL` to final statuses; mid-page checkpoints. | Partly — `PARTIAL` stage exists, retry example only |
| Q-33 | Storage tier transition rules and retention (raw recordings, quarantined raw layer); reprocessing scope and cost guardrails. | Open |
| Q-34 | "Healthy" source criteria; alerting; metrics tooling; relationship of `apps/web/admin` to `apps/worker-dashboard`; role of `notification-service`. | Partly — metric list and Sentry/OpenTelemetry named; rest open |
| Q-35 | Cloud provider; container orchestration (Kubernetes in the monorepo vs. "don't start with Kubernetes"); backup frequency/RPO/RTO. | Partly — DR components named (GAP§27) |

### Source gaps

| ID | Question | Status |
|---|---|---|
| Q-36 | Missing assistant answers (token cost, framework detection, "is anything left to consider"). | **Resolved** — the updated conversation file includes them (TOK, TECH§1–2, GAP) |
| Q-37 | Several conversation iterations overlap (SaaS-premise Master Blueprint vs. internal-ingestion answers vs. final Blueprint). Is the precedence rule in [README](README.md) correct for each superseded item in §4 below? | Open — confirm |

## 4. Conflicts between iterations and how these docs resolve them

| ID | Conflict | Resolution used (precedence: final Blueprint > user clarification > INT/IF/MOB/GAP > earlier) |
|---|---|---|
| C-01 | **Product premise.** Master Blueprint and `AUTH` assume users trigger crawls (SaaS: crawl credits, plan limits, public SSRF/abuse controls, "Crawl API"). The user then said crawling is internal. | Internal model wins; SaaS crawl mechanics recorded as **Superseded** history ([01](01-product-context.md), [13](13-cost-performance-and-scaling.md), [15](15-security-and-isolation.md)). |
| C-02 | **Pricing.** MB§47–51/§78 propose tiered pricing with credits; PLAN says undecided; final Blueprint defers complex billing. | Pricing model **Not decided**; hypothesis retained as Provisional ([13](13-cost-performance-and-scaling.md)). |
| C-03 | **Authentication model.** `AUTH`: users log in through our browser; statuses `USER_AUTHORIZED`, etc. `INT`/final: operator-managed authorized profiles, `WAITING_FOR_AUTH`. | Internal model wins ([10](10-authentication-and-permission-workflows.md)). |
| C-04 | **Roadmaps.** Four earlier phase lists (PLAN, Master Blueprint incl. "V1.5", internal factory, mobile) differ from the final V0–V3. | Final V0–V3 is authoritative; earlier lists documented as history; no extra phases ([18](18-mvp-v1-v2-v3-roadmap.md)). |
| C-05 | **V0 contents vs. "real MVP".** §68 vs §73 (embeddings, classification, diffing). | Open (Q-01); follow §68 for the V0 cut. |
| C-06 | **Search engine.** §53: OpenSearch/Elasticsearch; MB§71/IF§2/IF§23: Postgres FTS + pgvector first, OpenSearch later. | Open (Q-31); "start simple" favored (Inferred). |
| C-07 | **Infrastructure weight.** Final monorepo has `infrastructure/kubernetes`; IF§2/§30 say not to start with Kubernetes/Kafka/microservices-everywhere. | The monorepo is the target layout; the first version stays boring; Kubernetes timing open (Q-35). |
| C-08 | **Viewport sets.** §12 (1440×900 / 1024×1366 / 390×844) vs WF (1440/1280/768/390/375 and canonical breakpoints), MB§4, INT. | §12 is authoritative; others are candidate "later" profiles ([08](08-web-collection.md)). |
| C-09 | **Job vocabulary.** §7 statuses vs IF§4 lifecycle (CREATED…PUBLISHED) and failure states; AUTH statuses. | Reconciled as job state vs pipeline stage vs failure reason (Inferred, A-02). |
| C-10 | **Storage layout.** §44 content-addressed (hash-keyed) vs IF§20 per-website directories. | Both retained; combination open (A-20). |
| C-11 | **Embedding levels.** §34 (Screen, Section, Component, Asset, Flow, Page, Product) vs GAP§21 (Website, Page, Section, Screen, Component, Asset, Animation, Flow). | Union treated as the working list; final list Not decided ([07](07-search-and-retrieval-architecture.md)). |
| C-12 | **AI cache key.** MB§42 (input hash, model, prompt version) vs §56 (adds model_version, taxonomy_version). | §56 authoritative. |
| C-13 | **Browser lifecycle.** MB§30 reuse and recycle browsers vs §50 disposable workers per failure. | Both: reuse for efficiency, destroy and replace on crash ([08](08-web-collection.md), [14](14-failure-recovery-and-reliability.md)). |
| C-14 | **Edge-case table.** MB§60 ("login required → public capture only", "CAPTCHA → mark inaccessible") vs internal authorized profiles/human checkpoints. | Internal model wins; table kept as Provisional guidance ([08](08-web-collection.md)). |
| C-15 | **Entity naming.** `UIState` vs `ScreenState`; `Website` (early) vs `Product`/`Source`; early objects `Design Token`, `Viewport`, `Capture`. | Mapped in [05](05-normalization-and-design-graph.md), [12](12-data-model-and-events.md); residual Q-21. |
| C-16 | **Mobile sections.** Early unified model implied sections everywhere; MOB§18 diagram has no mobile Section layer. | MOB§18 followed ([05](05-normalization-and-design-graph.md)). |
| C-17 | **Out-of-scope "native mobile apps".** MB§72 lists "native mobile apps" as not-initially-built while the final Blueprint puts mobile *collection* in V2 and defers only "a mobile app for our own product". | Read as "our own mobile app" (Inferred) ([01](01-product-context.md)). |
