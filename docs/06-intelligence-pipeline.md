# 06 — Intelligence Pipeline

Part of the [engineering docs](README.md). Prev: [05](05-normalization-and-design-graph.md). Next: [07 Search](07-search-and-retrieval-architecture.md). AI-specific policy: [17](17-ai-architecture.md).

## Pipeline

```
Raw evidence
   ├── deterministic processing
   ├── OCR
   ├── computer vision
   └── AI/VLM
          ▼
   normalized metadata
          ▼
      embeddings
          ▼
       indexing
```

Event chain realizing it: `screen.detected → media.extract → ocr.process → vision.classify → taxonomy.classify → embedding.generate → index.update` ([02](02-system-architecture.md), [12](12-data-model-and-events.md)). Output feeds the [design graph](05-normalization-and-design-graph.md).

## Deterministic processing (code, no model) — §54

URL discovery, DOM parsing, asset extraction, hashing, dimensions, MIME detection, duplicate detection, state comparison, metadata, technology signatures. Cheapest, most reliable; always runs first.

## OCR

Model-based (§54). Text is extracted from screenshots/sections and indexed for keyword search (keyword + filters + OCR live in the search index — [07](07-search-and-retrieval-architecture.md)). OCR is also a signal in section detection, state deduplication and classification. OCR engine/provider: **Not decided**. [V0]

## Computer vision (CV)

Used for layout detection, visual segmentation, component detection and visual similarity (§54). Component detection is [V1]. Specific models: **Not decided**.

## Section detection

DOM structure + visual segmentation + semantic analysis + OCR (§10). Each detected section gets its own canonical capture. [V0] Section vocabulary is the taxonomy ([below](#taxonomy)); the Feature List (section C) lists target section types. Handling of sections that fit no category: the Feature List requires a custom/unknown bucket; the Blueprint's equivalent is the `unknown` rule for uncertainty — mechanism **Not decided**.

## Component detection

`screen → component detection → component crop → component embedding → component index` (§63). [V1] detection; component search is [V3] (§71).

## Taxonomy

Hierarchical, not flat tags (§30), e.g. Screen → Authentication → Login/Signup/OTP/Password Reset; Commerce → Product/Cart/Checkout; Account → Profile/Settings. Same structure for components, flows, website sections, animations. Basic taxonomy is [V0]. Versioned via `TaxonomyVersion` (also a cache-key input, [17](17-ai-architecture.md)). The actual taxonomy content: **Not decided** (only illustrative examples exist; Mobbin's taxonomy was researched as a competitor reference, not adopted).

## Multiple classification sources (§31)

Never let AI be the only classifier:

```
DOM rules + UI hierarchy + OCR + CV + heuristics + LLM/VLM  →  combine the evidence
```

The combination method (weighted vote, learned ensemble, etc.) is **Not decided**.

## Technology detection

An **enrichment field, not a mandatory pipeline stage** (§18). Evidence sources: HTML, headers, scripts, bundles, DOM, network, known signatures, metadata. Output `Technology: name, category, confidence, evidence, detected_at`. If uncertain: `unknown`. "Never hallucinate frameworks." Example: Next.js, confidence 0.99, evidence `__NEXT_DATA__`, `/_next/`. [V1] Details: [08](08-web-collection.md).

## Embeddings

Separate embeddings for Screen, Section, Component, Asset, Flow, Page, Product (§34). Combine text embedding + visual embedding + multimodal embedding — "don't rely on one vector." [V1] Models and dimensionality: **Not decided**. Indexing: [07](07-search-and-retrieval-architecture.md).

## Confidence and evidence

Every derived attribute carries `label, confidence, source` (§32):

```
screen_type: checkout
confidence: 0.97
evidence: classifier, OCR, DOM
```

Persisted via `Classification` / `ClassificationRevision` and `TechnologyEvidence` ([12](12-data-model-and-events.md)). Generated commentary (e.g. "why is this good") is kept separate from underlying evidence (§65). Confidence calibration and the review threshold are **Not decided**.

## Human review

Low-confidence results can enter human review (§32–33). The admin "Needs Review" queue shows counts such as uncertain screen types, duplicate candidates, bad captures, flow errors, technology uncertainties. **Fixing an item should create training data.** Queue UI: [16](16-admin-and-operations.md). A job can also pause in `WAITING_FOR_REVIEW` ([03](03-capture-and-crawling-workflow.md)).

## Evaluation datasets (§57)

Small human-labeled benchmark: **1,000 screens, 200 sections, 200 components, 100 flows** (lives under `ml/evaluation`, `ml/datasets`). Every classifier change is evaluated; track **precision, recall, F1, false-positive rate**. "Don't blindly deploy a new model because it looks better." Labeling process and ownership: **Not decided** (review-queue corrections as a label source is the only stated feed).

## Flow reconstruction

From the exploration graph ([09](09-ios-android-collection.md)); AI only labels flows, transitions stay evidence-based. [V2]
