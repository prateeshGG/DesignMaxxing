# 13 — Cost, Performance and Scaling

Part of the [engineering docs](README.md). Prev: [12](12-data-model-and-events.md). Next: [14 Failure and recovery](14-failure-recovery-and-reliability.md).

Cost is a core constraint: the goal is "a cheap but technically strong Mobbin alternative" (§ closing; User: "cheaper"). Mechanisms are specified; **unit costs, budgets and capacity targets are not** — figures quoted below are the assistant's illustrations or point-in-time vendor prices cited in the conversation, flagged **Provisional**. A full cost model (cost/website at 100…100,000 sites; cost at 10K/100K/1M/10M screens) was listed as remaining work (PLAN§4, GAP "J") and **was never computed**.

## Why deterministic capture (token-cost motivation, TOK)

At the conversation's start the user asked whether DOM-manipulation + screenshots or an MCP-style structured source uses more tokens. Answer (rule of thumb, "not a fixed multiplier"):

| Method | Relative token usage |
|---|---|
| Specialized structured source (MCP-like) | 1× |
| DOM / accessibility tree only | 2–5× |
| DOM + screenshots | 5–15× |
| DOM + frequent screenshots + iterative actions | 10–30×+ |

Example given: ~2,000 useful tokens from a structured MCP call vs. 10,000–30,000+ for the equivalent browser workflow. Key point: MCP does not inherently use fewer tokens — "the key is how much information gets returned to the model per step". Preferred escalation: `structured data → accessibility tree → targeted DOM → screenshot only when visually necessary`. This motivates **deterministic capture + AI only afterwards** ([17](17-ai-architecture.md)) and an agent interface that returns structured, scoped results ([07](07-search-and-retrieval-architecture.md)).

## CostEvent (§42)

Every expensive operation gets a cost record:

```
CostEvent: job_id, service, operation, input_units, output_units,
           compute_seconds, storage_bytes, estimated_cost
```

Derived metrics: **cost / site, cost / screen, cost / flow, cost / successful capture.** `CaptureJob.cost` carries the per-job total. What is "expensive" (the threshold for emitting a CostEvent) is **Not decided**.

Earlier forms of the same idea (**Provisional**, same intent):

- **"Processed Page" as the internal cost unit** (MB§44): `page_cost = Σ(browser_seconds, CPU, RAM, storage, assets, screenshots, video, OCR, embeddings, AI, bandwidth)`; `crawl_cost = Σ(page_cost)`.
- **Cost ledger per job** (MB§45), e.g. `job_id, pages, browser_seconds, screenshots, video_seconds, storage_mb, ocr_units, embedding_units, llm_input_tokens, llm_output_tokens, estimated_cost_usd`. Maps onto `CostEvent` fields; `llm_*_tokens` are `input_units/output_units` for the AI service.
- **Core business metric (GAP§26):** **cost per successfully indexed screen.** Also track crawl success rate, pages/hour, screens/hour, average browser time, media GB/day, AI cost/day, AI cost/site, duplicate rate, capture failure rate, classification confidence, human review rate.
- Engineering targets (MB§46, "not guaranteed costs"): basic page < $0.01–0.03, complex page < $0.03–0.10, very heavy page < $0.10–0.30.

## Cost-saving mechanisms (preserved)

| Mechanism | Description | Doc |
|---|---|---|
| **Caching** | Key on hash of input: screenshot, asset, OCR, embedding, classification, video. Same input → CACHE HIT (§43). | [04](04-raw-evidence-and-storage.md) |
| **AI caching** | `input_hash + model + model_version + prompt_version + taxonomy_version` (§56) | [17](17-ai-architecture.md) |
| **Content-addressable storage** | 20 sites using one asset → 1 physical file, 20 references (§44) | [04](04-raw-evidence-and-storage.md) |
| **Deduplication** | exact (SHA-256), perceptual (pHash/dHash), semantic (`similar_to`, not deleted); state dedup for exploration (§21) | [04](04-raw-evidence-and-storage.md), [09](09-ios-android-collection.md) |
| **Conditional responsive capture** | desktop/mobile baseline, tablet conditional, extras only on meaningful difference (§12); responsive-difference score (WF§8) | [08](08-web-collection.md) |
| **Incremental crawling** | Re-crawl → diff → only changed material processed; per-layer rules (page hash / DOM / visual / media); "the economic foundation" (§73, MB§43) | [11](11-versioning-change-detection.md) |
| **Cheap change verification** | HTTP/content signals first; browser crawl only when needed (GAP§6) | [11](11-versioning-change-detection.md) |
| **Tiered web crawling** | Cheap HTTP discovery before browser; interaction exploration only on "expensive pages" (§9) | [03](03-capture-and-crawling-workflow.md) |
| **Crawl budgets and policy limits** | `max_pages, max_browser_minutes, max_video_minutes, max_storage, max_AI_cost, max_depth`; page prioritization; per-domain limits (GAP§8, IF§6–7) | [03](03-capture-and-crawling-workflow.md) |
| **State-space limits; discard no-change interactions** | prevents combinatorial/infinite exploration (GAP§9, IF§15) | [03](03-capture-and-crawling-workflow.md) |
| **Deterministic-first processing** | Code for everything code can do; models only where needed; "will reduce cost dramatically" (§54) | [17](17-ai-architecture.md) |
| **Model routing** | rule-based → cheap CV/OCR → small model → large vision model only when necessary (PLAN§9, MB§41) | [17](17-ai-architecture.md) |
| **Preprocessing funnel** | 10,000 screenshots → ~3,000 candidates → AI (IF§22) | [06](06-intelligence-pipeline.md) |
| **Action scoring** | Avoid wasting browser/device time on random or repeated actions (§22) | [09](09-ios-android-collection.md) |
| **Detect motion before recording** | Don't blindly record 30 s per page (IF§13) | [08](08-web-collection.md) |
| **Browser reuse** | Recycle browser/contexts instead of relaunching Chromium per page (MB§30) | [08](08-web-collection.md) |
| **Storage tiers** | HOT / WARM / COLD; user-facing product doesn't need raw crawl online (§45) | [04](04-raw-evidence-and-storage.md) |
| **CDN + on-demand derivatives** | Frontend never pulls large originals; generate sizes on demand (§46) | [04](04-raw-evidence-and-storage.md) |
| **Video normalization + retention rules** | Video is the dangerous storage item (IF§29) | [04](04-raw-evidence-and-storage.md) |
| **Checkpoints / resumability** | Don't redo a large crawl after a crash (§50–51) | [14](14-failure-recovery-and-reliability.md) |
| **Decoupled stages** | A failed AI stage doesn't force re-crawl (§8) | [02](02-system-architecture.md) |
| **Immutable raw + reprocessing** | Improve models without re-crawling (§6) | [04](04-raw-evidence-and-storage.md) |
| **Self-hosted browsers; pgvector first; boring first stack** | No managed browser service, dedicated vector DB, Kubernetes or Kafka initially (MB§29, §53, IF§2/§30) | [02](02-system-architecture.md) |
| **Independent worker scaling** | CPU / browser / media / AI worker types scale separately (IF§28) | [02](02-system-architecture.md) |
| **Phase discipline** | Don't build community, SSO, etc. before validating the core data engine (§68, §72) | [18](18-mvp-v1-v2-v3-roadmap.md) |

## Expensive-operation policy

| Operation | Gate stated in the conversation |
|---|---|
| Browser rendering | Only after cheap Level 1 discovery; skip if cheap verification shows no change |
| Interaction exploration (Level 3) | Only expensive pages; scored/ranked actions; dedup; risk-penalized; state-space limits |
| Tablet / extra viewports | Only when meaningful differences are detected |
| Video recording | Only after motion is detected |
| LLM/VLM calls | Only for semantic classification, taxonomy mapping, flow naming, section interpretation, ambiguous UI, query interpretation; routed small → large; always cache-keyed |
| Re-processing unchanged content | Skipped via incremental processing and cache hits |
| Mass reprocessing after model change | **Not decided** (budget guard, sampling, prioritization) |
| Mobile device/emulator time | **Not decided** (budgets apply by `max_browser_minutes`-style limits — **Inferred**) |

## Browser utilization

Browser time is the main scarce compute in V0. Own Playwright workers on cheap VMs; Browserbase's published pricing was used only as a yardstick showing that browser cost "is not necessarily the dominant cost if we engineer the pipeline carefully" (MB§29). Concurrency limits, pool sizing, per-domain rate limits (`rate limit, concurrency limit, crawl delay` per domain, MB§63): **Not decided**.

## Compute and storage considerations

- Screenshots, videos and assets are large: object storage + CAS + tiering + CDN ([04](04-raw-evidence-and-storage.md)). Cloudflare R2 (no egress fees) was cited as a good fit (**Provisional**).
- Illustration of scale: 1,000 websites × 10 pages × 4 viewports = **40,000 page captures**, and an LLM is not needed for each (WF§10).
- Postgres stays small (metadata/relationships only) (§3).
- Search/vector indexes grow with entities × embedding types ([07](07-search-and-retrieval-architecture.md)); capacity: **Not decided**.
- Stated scale horizon: "millions of heterogeneous captures" (§ closing). No target number of sources or crawl frequency is stated.

## Pricing hypotheses (Provisional; premise partly superseded)

Written under the assumption that **users could trigger crawls** (MB§47–51, §78): library access separated from crawl/compute credits; proposed Free $0 (10 pages) / Starter $9 (100 page credits) / Pro $19 (500) / Power $39 (2,000) / Team $79+ / Enterprise custom; credit definition "1 page credit = one standard page analysis at one standard capture profile" with internal multipliers (3 responsive sizes 1.5×, motion capture +0.5×, deep interaction +1×, video-heavy +0.5–2×, unchanged historical re-crawl 0.5×); proposed per-plan crawl limits (pages per domain, concurrent jobs, historical versions; MB§36); free-tier "10 pages/month". Status in the conversation: *"Proposed and ready for testing, not permanently locked"* (MB§79).

After the user's clarification that crawling is internal, **crawl credits and per-plan crawl limits have no user-facing meaning**; what remains relevant is (a) internal crawl budgets ([03](03-capture-and-crawling-workflow.md)), (b) the cost accounting above, and (c) a possible library-access subscription — **Not decided**. Complex billing is [Deferred] (§72). Metrics from MB§69–70 (north star "useful references discovered per active researcher per week"; COGS per user/page/crawl) apply to the product side, **Provisional**.

## Economic principles from the conversation

1. **Do not pay twice** for the same input (cache hits).
2. **Store once, reference many** (CAS).
3. **Crawl cheaply first; spend browser/model time only where it adds value.**
4. **Only changed material is reprocessed** (incremental).
5. **Raw evidence is kept so models can improve without re-crawling** — a cost *trade*: storage is spent to avoid repeated crawling.
6. **Measure cost per site/screen/flow/successful capture** — "otherwise pricing becomes guesswork".
7. **Don't use an expensive model to solve a deterministic browser problem** (MB§77).
8. **Validate the core data engine before building expensive product breadth.**
