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

Event chain: `screen.detected → media.extract → ocr.process → vision.classify → taxonomy.classify → embedding.generate → index.update` ([02](02-system-architecture.md), [12](12-data-model-and-events.md)). Output feeds the [design graph](05-normalization-and-design-graph.md).

**Funnel (IF§22):** don't send every screenshot individually to an expensive model. Example: `10,000 screenshots → metadata + OCR + CV → 3,000 meaningful candidates → AI classification → structured taxonomy`; cache every AI result; "if a screenshot hasn't changed, never process it again."

## Deterministic processing (code, no model) — §54, TECH

URL discovery, DOM parsing, asset extraction, hashing, dimensions, MIME detection, duplicate detection, state comparison, metadata, technology signatures. Also deterministic: CSS/computed-style and design-token extraction (colors, fonts, dimensions, geometry, spacing), media/SVG/video handling, performance metrics, viewport metadata (AI strategy list, PLAN§8). Cheapest, most reliable; always runs first. **DOM first, OCR second** for text (MB§14).

## OCR

Model-based (§54). Text is extracted from screenshots/sections and indexed for keyword search ([07](07-search-and-retrieval-architecture.md)); OCR is also a signal in section detection, state deduplication and classification. For web, OCR is only the fallback for text that DOM extraction does not give (MB§14); for apps and canvas-rendered content it is a primary text source. OCR engine/provider: **Not decided**. [V0]

## Computer vision (CV)

Layout detection, visual segmentation, component detection and visual similarity (§54). Component detection is [V1]. Specific models: **Not decided**. Pre-AI cheap CV/OCR is the second rung of the model-routing ladder ([17](17-ai-architecture.md)).

## Section detection

Hybrid (§10, IF§11): deterministic signals first — DOM landmarks (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`), large DOM containers, repeated component boundaries, heading hierarchy followed by content, CSS layout boundaries, background/color transitions, large whitespace gaps — then **AI classification** labels the raw section ("Hero", "Feature Grid", "Pricing"…), not discovers it from scratch (WF§1). Each section gets its own canonical capture and stores `section_type, confidence, evidence`; original DOM evidence is kept. [V0] Handling of sections that fit no category: the Feature List requires a custom/unknown bucket; the mechanism is **Not decided** (the `unknown` rule for low confidence is stated, below).

## Component detection

`screen → component detection → component crop → component embedding → component index` (§63). Recognition uses AI + DOM evidence (IF§18) and records component type, bounding boxes, screens, variants, visual embeddings. Variants/attributes discussed (RES§6): e.g. Button → variant primary, size large, radius 8px, icon arrow, hover animation. [V1] detection; component search is [V3] (§71).

## Taxonomy

Hierarchical, not flat tags (§30), e.g. Screen → Authentication → Login/Signup/OTP/Password Reset; Commerce → Product/Cart/Checkout; Account → Profile/Settings. Same structure for components, flows, website sections, animations. Basic taxonomy is [V0]. **Dataset versioning (GAP§23):** taxonomy will change (Hero → Editorial/Product/Video/Interactive Hero), so records carry `taxonomy_version`, `classifier_version`, `embedding_version`; reprocess when models improve. Taxonomy *content* beyond examples: **Not decided** (Mobbin's taxonomy was researched as a competitor reference, not adopted).

## Multiple classification sources (§31)

Never let AI be the only classifier: DOM rules + UI hierarchy + OCR + CV + heuristics + LLM/VLM → combine the evidence. Accessibility data (role, label, description, state, focusability, navigation order) is another semantic source that helps classify button/tab/dialog/navigation/input/menu without relying only on vision (GAP§13). Combination method (weighted vote, learned ensemble…): **Not decided**.

## Technology detection

An **enrichment field, not a mandatory pipeline stage** (§18). Evidence sources: HTML, headers, cookies, script URLs/paths, JS bundles and global variables, DOM markers/attributes, CSS markers, network requests, meta tags, asset paths, source maps when publicly exposed, known signatures. Output `Technology: name, category, confidence, evidence, detected_at`. Status levels discussed (TECH§1–2, MB§12): **detected / likely / possible / unknown**; "never hallucinate frameworks"; store `unknown` rather than pollute search. Example: Next.js, confidence 0.97–0.99, evidence `__NEXT_DATA__`, `/_next/`. Reliability varies: Next.js, WordPress, Shopify, Webflow leave recognizable fingerprints; libraries like Framer Motion or custom animation engines are less certain (hence "likely"). For apps: bundle structure, resources, UI-hierarchy characteristics, runtime behavior, package metadata (MOB§12). [V1] Details: [08](08-web-collection.md).

## Embeddings

Separate embeddings per object type, never one vector (§34, GAP§21): text + visual + multimodal embeddings. [V1] Models and dimensionality: **Not decided**. Indexing: [07](07-search-and-retrieval-architecture.md).

## Confidence, evidence and provenance

Every derived attribute carries `label, confidence, source` (§32) — the earlier fuller form: `value, confidence, method, timestamp, model/version` (MB§20); AI-provenance form: `model, model_version, prompt_version, timestamp, confidence, input_id` (GAP§24):

```
screen_type: checkout
confidence: 0.97
evidence: classifier, OCR, DOM
```

Persisted via `Classification` / `ClassificationRevision` and `TechnologyEvidence` ([12](12-data-model-and-events.md)). **Decision thresholds (AUTO):** confidence > 0.90 accept automatically; 0.60–0.90 queue for lightweight review; < 0.60 mark `unknown`. These thresholds are the assistant's proposal, illustrated for section classification — **Provisional**.

Generated commentary (e.g. "why does this design work") is kept separate from underlying evidence and presented as **AI analysis, not objective facts** (§65, RES§15, MB§54).

## Quality scoring (MB§19, IF§26)

Every captured page gets a quality score from checks such as: page loaded, fonts loaded, images loaded, lazy content loaded, screenshot valid, no cookie overlay, no blank regions, viewport valid; plus section confidence, interaction coverage, media completeness. "Failures should be explicit. Never silently publish a broken capture." **Low-quality captures do not automatically enter the public dataset.** Score formula and threshold: **Not decided** (examples show 96/98 of 100).

## Human review

Low-confidence results can enter human review (§32–33). Review inputs (MB§21): low confidence, broken rendering, missing media, suspicious capture, conflicting classifiers. The admin "Needs Review" queue (counts for uncertain screen types, duplicate candidates, bad captures, flow errors, technology uncertainties) — [16](16-admin-and-operations.md). **Fixing an item creates training data**, recorded as `AI prediction → human correction → ground truth`, not an overwrite (GAP§25): more data → more corrections → better classifier → less manual work. A job can also pause in `WAITING_FOR_REVIEW` ([03](03-capture-and-crawling-workflow.md)). Target: ~90–98% accepted automatically; humans review exceptions (IF§27).

## Evaluation datasets (§57)

Small human-labeled benchmark: **1,000 screens, 200 sections, 200 components, 100 flows** (`ml/evaluation`, `ml/datasets`). Every classifier change is evaluated; track **precision, recall, F1, false-positive rate**. "Don't blindly deploy a new model because it looks better." Labeling process and ownership: **Not decided** (review-queue corrections are the only stated label source). Whether corrections feed both training and evaluation, and how to prevent leakage: **Not decided**.

## Design-system extraction

Deterministic extraction from the rendered site / computed CSS (IF§17, MB§13): colors, typography (family, source, weight, size, line height, letter spacing), geometry (radius, shadows, spacing, container widths, button heights), layout (grid/flex, max-width, columns, breakpoints), effects, motion (duration, easing, transition properties) → a "detected design system" view. Feature List section I.

## Flow reconstruction

From the exploration graph ([09](09-ios-android-collection.md)); AI only labels flows; transitions stay evidence-based. [V2]
