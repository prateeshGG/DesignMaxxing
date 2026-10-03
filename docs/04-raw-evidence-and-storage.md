# 04 — Raw Evidence and Storage

Part of the [engineering docs](README.md). Prev: [03](03-capture-and-crawling-workflow.md). Next: [05 Normalization and design graph](05-normalization-and-design-graph.md). Related: [13 Cost](13-cost-performance-and-scaling.md), [15 Security](15-security-and-isolation.md).

## Principle [Foundational]

> **Raw evidence is immutable.** Never modify the original capture. (§6)

Derived data is regenerable from raw evidence. This "lets us reprocess the dataset without crawling everything again" — so improved models, new taxonomy versions or new normalization rules can be applied to existing captures. Listed first among the five architectural assets to protect (§ closing).

## Raw artifacts

```
RawArtifact: id, source_id, capture_id, type, storage_key, sha256, mime_type, size, created_at
```

Types: `SCREENSHOT, VIDEO, HTML, DOM, UI_TREE, NETWORK_METADATA, ASSET, APP_PACKAGE, LOG, TRACE`.

Evidence categories named in the pipeline (§1): screenshots, videos, DOM/UI tree, network metadata, assets, interaction logs, source files, device metadata. Mapping of "interaction logs", "source files" and "device metadata" onto the type list above is **Not decided** (**Inferred:** LOG/TRACE, HTML/APP_PACKAGE, and metadata fields respectively).

## Derived artifacts

Derived versions *reference* raw artifacts (§6):

```
Raw screenshot → canonical screenshot → thumbnail → OCR → embedding
```

Other derived outputs named in the conversation: poster and normalized video for animated media, `normalized.svg` and `preview.png` for SVG ([08](08-web-collection.md)), `flow.mp4` ([09](09-ios-android-collection.md)), CDN size variants, classifications, technology evidence. `DerivedArtifact` fields are **Not decided** ([12](12-data-model-and-events.md)); **Inferred** minimum: reference to the source `RawArtifact`(s), producing service, version, hash.

Rule: a derived artifact is never the source of truth. Example stated for flows: "The video is a derived artifact, not the source of truth" (§27).

User uploads are treated as another source and become RawArtifacts (§39): `USER_UPLOAD → RawArtifact → OCR → Embedding → Visual search`. Uploaded material is **not mixed into the public dataset automatically**. (`USER_UPLOAD` is not in the `Source.type` list — see [19](19-decisions-assumptions-open-questions.md).)

## Object storage

S3-compatible (§53). Heavy files — screenshots, videos, assets, raw captures — go here. "Do not put videos or screenshots directly in Postgres" (§3). Postgres holds only metadata and the `storage_key`.

## Content-addressable storage (CAS) and hashing

Key by `sha256(file)` (§44):

```
assets/
  ab/
    ab123...
```

If 20 sites use the same asset: **1 physical file, 20 references**. The `sha256` field on `RawArtifact` and `hash` on `Asset` are the basis for deduplication and for cache keys. Hash algorithm for *visual* similarity (perceptual hashing) is **Not decided**; the exploration engine uses `visual_hash` and `ui_hash` ([09](09-ios-android-collection.md)).

## Cache strategy

Everything expensive should be cacheable, keyed on the hash of the input (§43): screenshot hash, asset hash, OCR hash, embedding hash, classification hash, video hash. Same input again → **CACHE HIT**, "no reason to pay for it twice."

AI inference is keyed more richly: `input_hash + model + model_version + prompt_version + taxonomy_version` (§56) — see [17](17-ai-architecture.md). Cache store technology (Redis vs. table in Postgres vs. derived-artifact lookup) is **Not decided**.

## Storage tiers (§45)

| Tier | Contents |
|---|---|
| HOT | Recent / current screenshots |
| WARM | Older but frequently accessed material |
| COLD | Raw crawl artifacts |

"The user-facing product shouldn't need the full raw crawl dataset online at all times." Tier-transition rules, retention periods and retrieval latency for COLD are **Not decided**. Note interaction with reprocessing: COLD raw artifacts must be retrievable for reprocessing.

## CDN and derivative strategy (§46)

```
Object storage → image/video processing → CDN → Browser
```

The frontend never pulls large originals directly. Generate `thumbnail, small, medium, large, original` **on demand**. Sizes (pixel dimensions) and formats are **Not decided**. CDN options: CloudFront or Cloudflare (§53).

Animated media keeps three representations — `original`, `poster`, `normalized_video` — so the frontend picks the appropriate one ([08](08-web-collection.md)).

## Reprocessing model

```
change in model / prompt / taxonomy / normalization rule
        │
        ▼
select RawArtifacts (from COLD if needed)
        │
        ▼
re-run pipeline stages ──► new DerivedArtifacts / Classification revisions
        │
        └── cache keys include model/prompt/taxonomy versions, so unchanged inputs
            under unchanged versions are cache hits
```

- No re-crawl is required. This is the payoff of immutability.
- `Classification` and `ClassificationRevision` (§4) keep history of derived labels; human corrections feed training data ([06](06-intelligence-pipeline.md)).
- Scope selection (reprocess everything vs. by source/version), orchestration, and cost guardrails for mass reprocessing are **Not decided**.

## Security note

Raw captures from authenticated sessions are sensitive and live in the crawler boundary ([15](15-security-and-isolation.md)); what is exposed to the product side is derived/CDN output. Whether raw captures are scrubbed (`pii-service`) before leaving that boundary is **Not decided**.
