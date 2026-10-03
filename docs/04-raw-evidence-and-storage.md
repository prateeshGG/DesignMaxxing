# 04 — Raw Evidence and Storage

Part of the [engineering docs](README.md). Prev: [03](03-capture-and-crawling-workflow.md). Next: [05 Normalization and design graph](05-normalization-and-design-graph.md). Related: [13 Cost](13-cost-performance-and-scaling.md), [15 Security](15-security-and-isolation.md).

## Principle [Foundational]

> **Raw evidence is immutable.** Never modify the original capture. (§6)

Derived data is regenerable from raw evidence. This "lets us reprocess the dataset without crawling everything again" — improved models, new taxonomy versions or new normalization rules apply to existing captures. Earlier statements of the same idea: *"Don't use screenshots as the primary source of truth… capture screenshot + DOM + accessibility tree + computed styles + URL + viewport + interaction metadata, then you can regenerate different representations later"* (WF§ key insight) and *"that gives us the ability to reprocess old websites whenever our classifiers improve"* (IF§3). Listed first among the five architectural assets to protect.

## Raw artifacts

```
RawArtifact: id, source_id, capture_id, type, storage_key, sha256, mime_type, size, created_at
```

Types: `SCREENSHOT, VIDEO, HTML, DOM, UI_TREE, NETWORK_METADATA, ASSET, APP_PACKAGE, LOG, TRACE`.

Evidence categories named in the pipeline (§1): screenshots, videos, DOM/UI tree, network metadata, assets, interaction logs, source files, device metadata. Elsewhere also captured as evidence: accessibility tree, computed styles, fonts, performance metrics, console errors, DOM snapshots, traces (WF, MB§31, MB§37). Mapping of "interaction logs", "source files", "device metadata", "accessibility tree", "computed styles" onto the type list is **Not decided** (**Inferred:** LOG/TRACE, HTML/APP_PACKAGE, metadata fields, and sub-documents of `DOM`/`UI_TREE` respectively).

## Provenance (GAP§1, MB§74)

Every captured item stores where it came from and how it was obtained:

```
source_url, source_domain, source_type, capture_timestamp, crawl_job_id, app_version,
platform, device_profile, acquisition_method, access_authorization, asset_source
```

Capture context also recorded (RES§1–§2, MB§40, GAP§12–16): canonical URL, viewport, browser and version, crawler version, OS, locale, language, text direction (LTR/RTL), currency, timezone, device pixel ratio, orientation, touch/hover capability, user agent, logged-in/logged-out state, theme (light/dark/system), fonts used, capture/crawl version. Personalized or geo-specific content is marked with its capture context/region (MB§60).

Four data classes must be distinguishable: `raw_capture`, `derived_asset`, `AI_generated_metadata`, `human_verified_metadata` (GAP§1). Never overwrite historical captures (MB§40).

## Derived artifacts

Derived versions *reference* raw artifacts (§6): `Raw screenshot → canonical screenshot → thumbnail → OCR → embedding`.

**Screenshot canonicalization (GAP§11):** screenshots differ because of device pixel ratio, browser chrome, status bars, font rendering, OS differences, dynamic timestamps, animations, ads, personalization. Pipeline: `raw screenshot → crop system chrome → normalize DPR → normalize dimensions → redact dynamic PII → canonical screenshot`. **Keep raw + canonical.**

Other derived outputs: poster and normalized video for animated media, `normalized.svg` and `preview.png` for SVG ([08](08-web-collection.md)), `flow.mp4` and transition recordings ([09](09-ios-android-collection.md)), CDN size variants, classifications, technology evidence. `DerivedArtifact` fields are **Not decided** ([12](12-data-model-and-events.md)); **Inferred** minimum: reference to source `RawArtifact`(s), producing service, version, hash.

Rule: a derived artifact is never the source of truth ("The video is a derived artifact, not the source of truth", §27).

User uploads are another source (§39): `USER_UPLOAD → RawArtifact → OCR → Embedding → Visual search`. Not mixed into the public dataset automatically. (`USER_UPLOAD` is not in the `Source.type` list — [19](19-decisions-assumptions-open-questions.md).)

## Raw vs. PII-redacted layers (GAP§3)

`Capture → PII detection → Redaction → Storage`, with configurable rules (e.g. `[email] → █████`). **The original raw capture is kept only in a tightly controlled / quarantined layer where there is a legitimate reason to retain it.** Retention periods for that layer: **Not decided** ([15](15-security-and-isolation.md)).

## Object storage

S3-compatible (§53); Cloudflare R2 named as an attractive fit (asset-heavy, no egress fee; pricing quoted by the assistant: $0.015/GB-month standard, 10 GB-month free — point-in-time claim from the conversation, **Provisional**; MB§37, MB§71). Heavy files — screenshots, videos, assets, raw captures, DOM snapshots, traces, raw network metadata — go here. "Do not put videos or screenshots directly in Postgres" (§3). Postgres holds metadata and the `storage_key`.

Layout (IF§20): `/{website_id}/{pages|screens|sections|animations|assets|recordings|thumbnails}/`. This is a **per-source namespace**; the content-addressable scheme below is keyed by hash. How the two combine (hash-keyed blobs with per-source manifests/references vs. per-source directories) is **Not decided**; **Inferred:** CAS for blob keys, source-scoped paths or DB rows for references.

## Content-addressable storage (CAS) and hashing

Key by `sha256(file)` (§44):

```
assets/
  ab/
    ab123...
```

20 sites using one asset → **1 physical file, 20 references**. The `sha256` field on `RawArtifact` and `hash` on `Asset` are the basis for deduplication and cache keys.

**Deduplication levels** (MB§39, IF§21):

| Level | Method | Handling |
|---|---|---|
| URL | canonicalization | same URL → one page |
| Exact asset/screenshot | SHA-256 | exact duplicate |
| Perceptual | pHash/dHash (screenshots and visual assets) | same visual despite compression/resolution differences |
| Semantic | embedding similarity | **never auto-deleted**; marked `similar_to` — visually similar designs may still be valuable |

Example (MB§39): same screenshot at a different URL → likely duplicate; same layout with different content → related, not duplicate.

## Cache strategy

Everything expensive should be cacheable, keyed on the hash of the input (§43): screenshot hash, asset hash, OCR hash, embedding hash, classification hash, video hash. Same input → **CACHE HIT**, "no reason to pay for it twice."

AI inference is keyed more richly: `input_hash + model + model_version + prompt_version + taxonomy_version` (§56) — [17](17-ai-architecture.md). Cache store technology: **Not decided** (Redis is listed as "jobs/cache" in the planning stack, PLAN§7).

## Storage tiers (§45)

| Tier | Contents |
|---|---|
| HOT | Recent / current screenshots |
| WARM | Older but frequently accessed material |
| COLD | Raw crawl artifacts |

"The user-facing product shouldn't need the full raw crawl dataset online at all times." **Video is the storage risk (IF§29):** illustrative arithmetic — 1,000,000 screenshots × 500 KB ≈ 500 GB, but 100,000 videos × 10 MB ≈ 1 TB. Store `original + web-optimized version + thumbnail`, compress aggressively, and "establish retention rules for raw recordings." Retention rules and tier-transition rules: **Not decided**. COLD raw artifacts must remain retrievable for reprocessing.

## CDN and derivative strategy (§46)

`Object storage → image/video processing → CDN → Browser`. The frontend never pulls large originals directly. Generate `thumbnail, small, medium, large, original` **on demand**; Cloudflare is the stated CDN in later iterations (CloudFront/Cloudflare in §53). Pixel sizes/formats: **Not decided**.

Animated media keeps three representations — `original`, `poster`, `normalized_video` — so the frontend does not need to understand "14 different animation formats" and the platform has one unified **Animation** content type (INT, [08](08-web-collection.md)).

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

- No re-crawl is required (immutability's payoff).
- Dataset versioning (GAP§23): carry `taxonomy_version`, `classifier_version`, `embedding_version`; "don't hard-code taxonomy into historical records."
- `Classification` and `ClassificationRevision` (§4) keep history; human corrections are recorded as `AI prediction → human correction → ground truth`, not overwrites ([06](06-intelligence-pipeline.md)).
- Scope selection for reprocessing, orchestration, and cost guardrails for mass reprocessing: **Not decided**.

## Backup and reproducibility (GAP§27)

Keep Postgres backups, object-storage versioning, **crawl manifests**, and dataset exports. "A crawl should be reproducible": if the database disappeared, much of it should be reconstructable from `raw evidence + crawl manifests`. Backup schedule, RPO/RTO: **Not decided** ([14](14-failure-recovery-and-reliability.md)).

## Security note

Raw captures from authenticated sessions are sensitive and live in the crawler boundary ([15](15-security-and-isolation.md)); what is exposed to the product side is derived/CDN output after PII/secrets handling.
