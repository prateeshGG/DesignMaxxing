# 07 — Search and Retrieval Architecture

Part of the [engineering docs](README.md). Prev: [06](06-intelligence-pipeline.md). Next: [08 Web collection](08-web-collection.md). Feature-level requirements are in the [Feature List](../Feature%20List) (section O, P); this doc covers mechanism only.

## Query pipeline (§35)

```
USER QUERY
   ├── keyword parser
   ├── taxonomy parser
   ├── semantic embedding
   └── visual input
          ▼
   candidate retrieval
          ▼
   metadata filtering
          ▼
   ranking / diversification
          ▼
   results
```

## Search modes and where they run

| Mode | Backed by | Phase |
|---|---|---|
| Keyword (incl. text inside screenshots via OCR) | Search index (OpenSearch/Elasticsearch) | basic search [V0] |
| Metadata / filter search (taxonomy, platform, product, version…) | Search index + Postgres metadata | [V0] basic taxonomy |
| Semantic search | Text/multimodal embeddings in the vector index (pgvector initially) | [V1] embeddings; natural-language/AI search [V3] |
| Visual search (upload a screenshot / similar screens) | Visual embeddings | [V1] |
| Component-level search | Component crop → embedding → component index | [V3] (detection [V1]) |
| Region-level search | User-selected crop → visual embedding → similar component search | [V3] |

Whether V0 "basic search" uses OpenSearch or something simpler (e.g. Postgres full-text) is **Not decided** (§53 recommends OpenSearch for the "first serious version").

## Indexing strategy

- `SearchDocument` is the indexed unit (§4); its fields are **Not decided** ([12](12-data-model-and-events.md)). **Inferred:** one per searchable entity (Screen, Section, Component, Asset, Flow, Page, Product) carrying text, taxonomy, metadata and embedding references.
- Indexes (§3): **Search Index** = keyword + filters + OCR; **Vector Index** = semantic + visual similarity. Start with **pgvector**; do not introduce a dedicated vector database immediately (§53).
- Separate embeddings per entity type, and per modality (text, visual, multimodal) (§34).
- Indexing is the last event in the chain (`embedding.generate → index.update`) and is asynchronous. Index updates are incremental when only changed material is reprocessed ([11](11-versioning-change-detection.md)).
- Index rebuild after reprocessing: possible because embeddings/classifications derive from immutable evidence ([04](04-raw-evidence-and-storage.md)). Strategy for zero-downtime reindex: **Not decided**.

## Multimodal embeddings

"Don't rely on one vector." Text + visual + multimodal embeddings per object (§34). Embedding results are cached by input hash and model/version ([17](17-ai-architecture.md)).

## Candidate retrieval

Per mode, retrieve candidates from the appropriate index (keyword, vector, or both). How candidate sets from different indexes are merged (score fusion, union then re-rank) is **Not decided**.

## Filtering

Metadata filtering after retrieval (§35): platform, taxonomy, product/app, version, user-selected filters (§36 "platform match, user filters"). Pre- vs post-filtering for vector queries: **Not decided**.

## Ranking (§36)

Signals: semantic relevance, visual similarity, taxonomy match, freshness, quality, popularity, diversity, platform match, user filters.

Rule: **popularity must not overwhelm relevance.** Example: for "minimal checkout", a highly popular unrelated screen must not outrank a less popular exact match. Weights and learning-to-rank: **Not decided**. "Popularity" depends on usage data that does not exist until the product has users (**Inferred**).

## Diversification (§37)

Avoid returning the same product repeatedly when many are relevant (Stripe ×5 → Stripe, Shopify, Linear, Notion, Airbnb). "Particularly useful for design research." Algorithm (e.g. per-product cap, MMR): **Not decided**.

## Query understanding

LLM/VLM role: natural-language query interpretation (§54) — [17](17-ai-architecture.md). [V3] ("AI search, natural-language research"). Before V3, the keyword and taxonomy parsers handle queries.

## Query types and endpoints

`GET /search`, `POST /visual-search` (§47). Region and component search endpoints: **Not decided**.

## Uploads in search

User-uploaded screenshots are another source (`USER_UPLOAD → RawArtifact → OCR → Embedding → Visual search`) and are kept out of the public dataset (§39). [V1] ("collections, uploads").
