# 11 — Versioning and Change Detection

Part of the [engineering docs](README.md). Prev: [10](10-authentication-and-permission-workflows.md). Next: [12 Data model and events](12-data-model-and-events.md). Economic rationale: [13](13-cost-performance-and-scaling.md).

Incremental crawling and change detection is one of the five foundational assets: it "determines whether the economics work at scale" (§ closing). Phase: version comparison is **V1**; app version history is **V2**; monitoring-style features are future (Feature List S).

## Product versions (§28)

```
ProductVersion: version, platform, release_identifier, captured_at
```

| Source type | How the version is determined |
|---|---|
| Website | Inferred from **crawl timestamp**, **deployment metadata**, **content hash** |
| iOS / Android app | Actual `versionName`, `versionCode`, `CFBundleShortVersionString`, `CFBundleVersion` where available |

"Source versions" are also modeled as `SourceVersion` (§4); its fields and relation to `ProductVersion` are **Not decided**. What counts as "deployment metadata" for a site (e.g. build IDs in headers or scripts such as Next.js build IDs, ETag/Last-Modified) is **Not decided**. How a new `ProductVersion` is cut for a website (every crawl vs. only when content changed) is **Not decided**; **Inferred:** only when content hashes differ, in line with incremental processing.

## Comparison levels (§29)

Compare Version A → Version B at: **page, section, screen, component, asset, flow**.

Output per entity:

```
ADDED | REMOVED | MODIFIED | UNCHANGED
```

Performed by `change-detector`. Enables the future question "What changed in this product's UX?"

Matching entities across versions (identity keys such as URL, section type + position, asset hash, state similarity) and what threshold turns "different pixels" into `MODIFIED` are **Not decided**. For screens/states the state-similarity approach ([09](09-ios-android-collection.md)) is the natural basis (**Inferred**); for assets, content hashes ([04](04-raw-evidence-and-storage.md)).

## Incremental processing (§73)

```
URL → crawl again → difference detected → only changed material processed
```

"That is the economic foundation." Concretely:

- Unchanged entities (same hash / `UNCHANGED`) reuse existing derived artifacts and classifications (cache hits on OCR, embeddings, classification — [13](13-cost-performance-and-scaling.md), [17](17-ai-architecture.md)).
- Only `ADDED`/`MODIFIED` material flows through `media.extract → ocr.process → … → index.update` ([12](12-data-model-and-events.md)).
- `REMOVED` handling in indexes/library (hide vs. keep history): **Not decided**; history is retained because raw evidence is immutable ([04](04-raw-evidence-and-storage.md)).
- Whether raw captures are still taken in full on each re-crawl, with savings applied downstream, or whether capture itself is skipped when an HTTP-level check shows no change: **Not decided** (the Blueprint states only "only changed material processed").

## Crawl timestamps and hashes

`captured_at` on `ProductVersion`; `created_at` on RawArtifact; `sha256` on RawArtifact and `hash` on Asset ([12](12-data-model-and-events.md)). Hashes are the primary change signal; visual/UI-tree similarity handles states where raw hashes differ spuriously.

## Downstream uses

- Version history in the product (Feature List A, P "version comparison").
- Competitive comparison once version history exists (§66, V3): compare onboarding, checkout, navigation, pricing, authentication across products, showing underlying screens side by side.
- Website change monitoring, competitive monitoring, automated trend reports: listed as Feature List "future features". The Blueprint does not schedule them; change detection is their enabling mechanism (**Inferred**).
