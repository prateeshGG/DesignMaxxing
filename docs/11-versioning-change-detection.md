# 11 — Versioning and Change Detection

Part of the [engineering docs](README.md). Prev: [10](10-authentication-and-permission-workflows.md). Next: [12 Data model and events](12-data-model-and-events.md). Economic rationale: [13](13-cost-performance-and-scaling.md).

Incremental crawling and change detection is one of the five foundational assets: it "determines whether the economics work at scale" (§ closing). The conversation repeatedly calls automatic version tracking "the killer feature" (IF§34) and says to build versioning into the data model "from day one" (MB§18). Phase: version comparison is **V1**; app version history is **V2**; monitoring-style features are future (Feature List S).

## Product versions (§28)

```
ProductVersion: version, platform, release_identifier, captured_at
```

| Source type | How the version is determined |
|---|---|
| Website | Inferred from **crawl timestamp**, **deployment metadata**, **content hash** |
| iOS / Android app | Actual `versionName`, `versionCode`, `CFBundleShortVersionString`, `CFBundleVersion` where available |

**Never overwrite historical captures** (MB§40, RES§1): `stripe.com → 2026-10-03, 2026-09-12, 2026-08-01…` becomes a website-evolution / version-history feature. A capture is identified by `website_id, page_id, version_id, captured_at, viewport, browser_version, crawler_version` (MB§40) — i.e. the capture records the *crawler's* version as well as the product's.

`SourceVersion` (§4) fields and relation to `ProductVersion` are **Not decided**. What counts as "deployment metadata" for a site (build IDs in headers/scripts, ETag/Last-Modified) is **Not decided**. How a new website `ProductVersion` is cut (every crawl vs. only when content changed) is **Not decided**; **Inferred:** only when content hashes differ.

Dataset-side versions are separate from product versions: `taxonomy_version`, `classifier_version`, `embedding_version` (GAP§23, [06](06-intelligence-pipeline.md)).

## Comparison levels (§29)

Compare Version A → Version B at: **page, section, screen, component, asset, flow**.

Output per entity: `ADDED | REMOVED | MODIFIED | UNCHANGED`. Performed by `change-detector`. Enables "What changed in this product's UX?".

Change categories discussed (GAP§7):

- **Structural:** new/removed section, new route, changed navigation.
- **Visual:** layout, color, typography, component, image.
- **Behavioral:** new/removed interaction, changed flow.

Other comparison dimensions mentioned: technology, animation, text, responsive state, design tokens, assets (MB§18, PLAN§10).

Matching entities across versions (identity keys such as URL, section type + position, asset hash, state similarity) and what threshold turns "different pixels" into `MODIFIED` are **Not decided**. For screens/states the state-similarity approach ([09](09-ios-android-collection.md)) is the natural basis (**Inferred**); for assets, content hashes ([04](04-raw-evidence-and-storage.md)); screenshots are compared after **canonicalization** (GAP§11).

## Incremental processing (§73)

```
URL → crawl again → difference detected → only changed material processed
```

"That is the economic foundation." Concrete rules from the Master Blueprint (MB§43):

| If… | Then… |
|---|---|
| page hash unchanged | skip expensive processing |
| DOM changed | reprocess structure |
| visual changed | reprocess screenshot |
| media changed | reprocess media |

Plus (GAP§7): change detection runs **before** expensive AI processing; unchanged → don't reprocess; changed → process only affected objects.

**Re-crawl scheduling (GAP§6)** — "keep this dataset current": e.g. weekly for large dynamic products, monthly, quarterly for small sites (examples). If HTTP/content signals suggest no change → "cheap verification"; only perform the expensive browser crawl when necessary. This answers an earlier open point: *capture itself can be skipped* when cheap verification shows no change; cheap-signal specifics (ETag, content hash of HTML, sitemap lastmod) are **Not decided**.

- Unchanged entities reuse existing derived artifacts and classifications (cache hits on OCR, embeddings, classification — [13](13-cost-performance-and-scaling.md), [17](17-ai-architecture.md)).
- Only `ADDED`/`MODIFIED` material flows through `media.extract → ocr.process → … → index.update` ([12](12-data-model-and-events.md)).
- `REMOVED` handling in indexes/library (hide vs. keep history): **Not decided**; history is retained because raw evidence is immutable ([04](04-raw-evidence-and-storage.md)).

## Crawl timestamps and hashes

`captured_at` on `ProductVersion`; `created_at` on RawArtifact; `sha256` on RawArtifact and `hash` on Asset ([12](12-data-model-and-events.md)). Hashes are the primary change signal; perceptual hash and visual/UI-tree similarity handle states where raw hashes differ spuriously ([04](04-raw-evidence-and-storage.md)).

## Downstream uses

- Version history in the product (Feature List A, P "version comparison"): show changed sections, new/removed screens, changed typography/colors/components/animations (IF§34).
- Competitive comparison once version history exists (§66, V3).
- **Trend detection** (RES§17): temporal data lets the system surface patterns across quarters ("increasing oversized typography", "rising animated product demos"). Feature List P ("design trends") — phase: the final Blueprint does not list it; **Not decided**.
- Website change monitoring, competitive monitoring, change alerts, automated trend reports (Feature List S). Not scheduled in the final Blueprint; change detection is their enabling mechanism (**Inferred**).
