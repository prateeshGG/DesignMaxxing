# 17 — AI Architecture

Part of the [engineering docs](README.md). Prev: [16](16-admin-and-operations.md). Next: [18 Roadmap](18-mvp-v1-v2-v3-roadmap.md). Pipeline context: [06](06-intelligence-pipeline.md). Cost context: [13](13-cost-performance-and-scaling.md).

Principle (§54): **"Do not put an LLM in every step."** Using deterministic code and specialized models where possible "will reduce cost dramatically."

## Deterministic vs model-based

| Class | Used for | Notes |
|---|---|---|
| **Deterministic (code)** | URL discovery, DOM parsing, asset extraction, hashing, dimensions, MIME detection, duplicate detection, state comparison, metadata, technology signatures | Always first; no model |
| **Specialized CV/OCR models** | Layout detection, OCR, visual segmentation, component detection, visual similarity | Not LLMs; model choice **Not decided** |
| **LLM / VLM** | Semantic classification, taxonomy mapping, flow naming, section interpretation, ambiguous UI understanding, natural-language query interpretation | Reserved for what code/CV cannot decide |

## Where AI is used

- **Semantic classification** — screen/section/component type ([06](06-intelligence-pipeline.md)).
- **Taxonomy mapping/classification** — hierarchical taxonomy; combined with DOM rules, UI hierarchy, OCR, CV and heuristics: "don't let AI be the only classifier" (§31).
- **Flow naming** — AI labels flows (e.g. `SEARCHING`); transitions stay evidence-based (§26, [09](09-ios-android-collection.md)).
- **Section interpretation / ambiguous UI analysis** — where deterministic signals are inconclusive.
- **Query understanding** — interpreting natural-language search ([07](07-search-and-retrieval-architecture.md)); AI search is [V3].
- **Embeddings** — text, visual, multimodal ([06](06-intelligence-pipeline.md)).
- **"Why is this good?"** explanations — later, with generated commentary kept separate from evidence (§65). Phase: "later", not assigned to a numbered phase. **Not decided.**
- **Automated design reports** [V3] (§67) and AI research features (Feature List Q).

## Where AI is deliberately NOT used

- URL discovery, DOM parsing, asset extraction, hashing, dimensions, MIME, duplicate detection, state comparison, metadata extraction, technology signatures (§54).
- **Authentication**: the exploration engine never bypasses it ([10](10-authentication-and-permission-workflows.md)).
- **Technology detection**: evidence-and-signature based; uncertain → `unknown`; "never hallucinate frameworks" (§18). AI is not used to guess frameworks.
- **Flow transitions**: derived from recorded actions/states, not generated; AI only names the flow (§26).
- **Evidence**: generated commentary never replaces underlying evidence (§65).
- Dangerous-action gating is policy-based ([10](10-authentication-and-permission-workflows.md)); using a VLM to *detect* dangerous controls is **Not decided**.

## AI processing pipeline (§55)

```
Raw evidence ─► deterministic ─► OCR ─► CV ─► AI/VLM ─► normalized metadata ─► embeddings ─► indexing
```

All AI outputs carry `label, confidence, source` and are stored as `Classification`s ([06](06-intelligence-pipeline.md)).

## AI caching (§56)

Key every inference by:

```
input_hash, model, model_version, prompt_version, taxonomy_version
```

Same screenshot + same model + same prompt = cached answer. Changing any component of the key (new model, new prompt version, new taxonomy version) invalidates only the affected entries and naturally supports reprocessing ([04](04-raw-evidence-and-storage.md)). Cache backing store and eviction: **Not decided**.

## Evaluation methodology (§57)

- Human-labeled benchmark: **1,000 screens, 200 sections, 200 components, 100 flows**.
- Metrics: precision, recall, F1, false-positive rate.
- Every classifier change is evaluated against it; "don't blindly deploy a new model because it 'looks better.'"
- Review-queue corrections create training data ([16](16-admin-and-operations.md)).
- Pass/fail thresholds, labeling workflow, and benchmark versioning/leakage controls (training data vs. benchmark): **Not decided**.

## Not decided

Specific models/vendors (VLM, embedding models, OCR), on-premise vs. hosted inference, prompt management, budgets per call, fallback chains, and structured-output contracts. The earlier user question — token cost of DOM-manipulation-plus-screenshot browsing vs. an MCP — was asked at the start of the conversation, and its answer is not in the export. The Blueprint addresses AI cost only through the policies above.
