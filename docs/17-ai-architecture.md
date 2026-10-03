# 17 — AI Architecture

Part of the [engineering docs](README.md). Prev: [16](16-admin-and-operations.md). Next: [18 Roadmap](18-mvp-v1-v2-v3-roadmap.md). Pipeline context: [06](06-intelligence-pipeline.md). Cost context: [13](13-cost-performance-and-scaling.md).

Principle (§54): **"Do not put an LLM in every step."** "Deterministic systems collect. AI classifies." (INT) AI "should not be responsible for collecting the raw data." Using deterministic code and specialized models "will reduce cost dramatically."

## Deterministic vs model-based

| Class | Used for | Notes |
|---|---|---|
| **Deterministic (code)** | URL discovery, DOM parsing, asset extraction, hashing, dimensions, MIME detection, duplicate detection, state comparison, metadata, technology signatures; also CSS/computed-style and design-token extraction, colors, fonts, network, media/SVG/video handling, performance, viewport (PLAN§8) | Always first; no model |
| **Specialized CV/OCR models** | Layout detection, OCR, visual segmentation, component detection, visual similarity | Not LLMs; model choice **Not decided** |
| **LLM / VLM** | Semantic classification, taxonomy mapping, flow naming, section interpretation, ambiguous UI understanding, natural-language query interpretation | Reserved for what code/CV cannot decide |

Other places AI helps, from earlier iterations (same principle): section/component classification, design style, semantic tags, UX-pattern and flow classification, design-system interpretation, image understanding, search-query understanding, AI research (PLAN§8).

## Model routing (PLAN§9, MB§41)

```
Rule-based
   ↓
Cheap CV/OCR
   ↓
Small model
   ↓
Large vision model only when necessary
```

Illustration: "Is this an SVG?" → no AI. "What section is this?" → small vision model. "Explain the UX strategy across these 20 pages" → large reasoning model. Do **not** send every screenshot → expensive multimodal model → every page → every crawl. The assistant cited a large price spread between smaller and flagship API models as the reason routing matters (MB§41, §77; **Provisional**, no specific model chosen). Concrete model choices: **Not decided**; "custom AI model training" is deliberately not built initially (MB§72).

## Where AI is used

- **Semantic classification** — screen/section/component type ([06](06-intelligence-pipeline.md)); AI *labels* sections found by deterministic heuristics.
- **Taxonomy mapping/classification** — combined with DOM rules, UI hierarchy, OCR, CV and heuristics: "don't let AI be the only classifier" (§31).
- **Flow naming** — AI labels flows (e.g. `SEARCHING`); transitions stay evidence-based (§26).
- **Section interpretation / ambiguous UI analysis**.
- **Choosing among unexplored actions** — AI "can help decide which unexplored action is interesting, but the underlying system should remain deterministic" (GAP§10).
- **Query understanding** — natural-language search ([07](07-search-and-retrieval-architecture.md)); [V3].
- **Embeddings** — text, visual, multimodal ([06](06-intelligence-pipeline.md)).
- **"Why is this good / why this design?"** — later, grounded in observable evidence ("the section uses a two-column layout, places the primary CTA above the fold…", not "the designer wanted…"), kept separate from evidence and labelled **AI analysis, not objective fact** (§65, RES§15, MB§54). Not assigned to a numbered phase. **Not decided.**
- **AI research / pattern synthesis / build brief** — retrieve → analyze → cluster → compare → answer, always traceable to actual references (MB§23, §55–56); the Blueprint's phase is V3 "AI search, natural-language research … automated design reports" (§71).

## Where AI is deliberately NOT used

- URL discovery, DOM parsing, asset extraction, hashing, dimensions, MIME, duplicate detection, state comparison, metadata, technology signatures (§54).
- **Collecting data**: browsers collect, AI interprets (IF§3).
- **Authentication**: the exploration engine never bypasses it ([10](10-authentication-and-permission-workflows.md)).
- **Technology detection**: evidence-and-signature based; uncertain → `unknown`; "never hallucinate frameworks" (§18, TECH§2).
- **Flow transitions**: derived from recorded actions/states; AI only names the flow (§26).
- **Evidence**: generated commentary never replaces underlying evidence (§65).
- **Randomly clicking around an app/site**: exploration is graph traversal + scoring + dedup (GAP§10).
- Dangerous-action gating is policy-based ([10](10-authentication-and-permission-workflows.md)); using a VLM to *detect* dangerous controls is **Not decided**.

## AI processing pipeline (§55)

```
Raw evidence ─► deterministic ─► OCR ─► CV ─► AI/VLM ─► normalized metadata ─► embeddings ─► indexing
```

All AI outputs carry `label, confidence, source` and are stored as `Classification`s; with the fuller **AI provenance** fields `model, model_version, prompt_version, timestamp, confidence, input_id` (GAP§24) so classifications can be audited and improved. Acceptance policy by confidence: > 0.90 auto-accept; 0.60–0.90 lightweight review; < 0.60 `unknown` (AUTO, **Provisional**).

## AI caching (§56)

Key every inference by:

```
input_hash, model, model_version, prompt_version, taxonomy_version
```

Same screenshot + same model + same prompt = cached answer. (The earlier form, MB§42, keyed on input hash, model, prompt version and stored the result — the final key adds `model_version` and `taxonomy_version`.) Changing any component invalidates only affected entries and supports reprocessing ([04](04-raw-evidence-and-storage.md)). Cache backing store and eviction: **Not decided**. "If a screenshot hasn't changed: never process it again" (IF§22).

## Human correction loop

Corrections are never plain overwrites: `AI prediction → human correction → ground truth`; more data → more corrections → better classifier → less manual work (GAP§25). Corrections feed training data and the evaluation benchmark ([06](06-intelligence-pipeline.md)).

## Evaluation methodology (§57)

- Human-labeled benchmark: **1,000 screens, 200 sections, 200 components, 100 flows**.
- Metrics: precision, recall, F1, false-positive rate.
- Every classifier change is evaluated against it; "don't blindly deploy a new model because it 'looks better.'"
- Dataset versions (`taxonomy_version`, `classifier_version`, `embedding_version`) make evaluations reproducible (GAP§23).
- Pass/fail thresholds, labeling workflow, and benchmark leakage controls (training data vs. benchmark): **Not decided**.

## Agent-facing token efficiency

For AI agents consuming our dataset (MCP/API, phase **Not decided**): return structured, scoped results and fetch images only on request, following the escalation `structured → accessibility tree → targeted DOM → screenshot` ([13](13-cost-performance-and-scaling.md), [07](07-search-and-retrieval-architecture.md)).

## Not decided

Specific models/vendors (VLM, embedding models, OCR), hosted vs. self-hosted inference, prompt management, per-call budgets, fallback chains, and structured-output contracts.
