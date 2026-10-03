# 07 — Search and Retrieval Architecture

Part of the [engineering docs](README.md). Prev: [06](06-intelligence-pipeline.md). Next: [08 Web collection](08-web-collection.md). Feature-level requirements are in the [Feature List](../Feature%20List) (sections O, P); this doc covers mechanism only.

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

Earlier, simpler form (RES§18): Keyword (Postgres) + Semantic (embeddings) + Visual (image embeddings) → **re-ranking** → final results. Consistent with the final pipeline.

## Search modes and where they run

| Mode | Backed by | Phase |
|---|---|---|
| Keyword (incl. text inside screenshots via OCR) | Search index (see engine note) | basic search [V0] |
| Metadata / filter search (taxonomy, platform, product, version…) | Search index + Postgres metadata | [V0] basic taxonomy |
| Semantic search | Text/multimodal embeddings in the vector index (pgvector initially) | [V1] embeddings; natural-language/AI search [V3] |
| Visual search (upload a screenshot / similar screens) | Visual embeddings | [V1] |
| Component-level search | Component crop → embedding → component index | [V3] (detection [V1]) |
| Region-level search | User-selected crop → visual embedding → similar component search | [V3] |

Further query kinds the Master Blueprint listed (MB§16, **Provisional**, phases not assigned): **structural** ("hero + 2 CTAs + video"), **technology** ("Next.js websites with GSAP"), **media** ("websites with animated SVG hero"), **responsive** ("mobile navigation patterns"), **interaction** ("pricing toggle interactions"), and combined queries. These resolve to filters over the design graph's structured metadata rather than to LLM calls: *"Show me mobile pricing sections with animated cards… possible without involving an LLM for every query"* (WF§7). "Find websites like this" combines visual, semantic, structural, technology and style similarity (MB§58). **Problem-based search** — "How do SaaS companies communicate annual savings?" — returns examples plus screenshots, flows, copy, interaction and implementation metadata (RES§21); it is a V3-style capability ("AI search, natural-language research").

**Search-engine note (conflict):** §53 lists OpenSearch/Elasticsearch in the first serious version; MB§71, IF§2 and IF§23 recommend **PostgreSQL full-text + pgvector initially, OpenSearch later "once the dataset becomes large"**. V0's engine: **Not decided**; the repeated "start simple" statements favor Postgres first (**Inferred**).

## Indexing strategy

- `SearchDocument` is the indexed unit (§4); its fields are **Not decided** ([12](12-data-model-and-events.md)). **Inferred:** one per searchable entity (Screen, Section, Component, Asset, Animation, Flow, Page, Product) carrying text, taxonomy, metadata and embedding references.
- Indexes (§3): **Search Index** = keyword + filters + OCR; **Vector Index** = semantic + visual similarity. Start with **pgvector**; no dedicated vector database initially (§53).
- Separate embeddings per entity type and per modality (§34, GAP§21).
- Indexing is the last event in the chain (`embedding.generate → index.update`), asynchronous, incremental when only changed material is reprocessed ([11](11-versioning-change-detection.md)).
- Reindex after reprocessing is possible because embeddings/classifications derive from immutable evidence ([04](04-raw-evidence-and-storage.md)). Zero-downtime reindex strategy: **Not decided**. `embedding_version` is recorded for this reason (GAP§23).
- Takedown/removal propagates to embeddings, search index and cached thumbnails ([15](15-security-and-isolation.md)).
- Low-quality captures are excluded from the public dataset (IF§26), hence from public indexes.

## Multimodal embeddings

"Don't rely on one vector." Text + visual + multimodal per object (§34). Example needing all three: "interfaces similar to this screenshot but with a darker visual style" = image embedding + text embedding + metadata filtering (GAP§22). Embedding results are cached by input hash and model/version ([17](17-ai-architecture.md)).

## Candidate retrieval

Per mode, retrieve candidates from the appropriate index. How candidate sets from different indexes are merged (score fusion, union then re-rank) is **Not decided**.

## Filtering

Metadata filtering after retrieval (§35): platform, taxonomy, product/app, version, user-selected filters (§36). Example structured form (IF§24): `section = pricing, style = minimal, theme = dark, animation = true, category = SaaS, viewport = mobile`. Pre- vs post-filtering for vector queries: **Not decided**.

## Ranking (§36)

Signals: semantic relevance, visual similarity, taxonomy match, freshness, quality, popularity, diversity, platform match, user filters. (Master Blueprint list: keyword score, semantic score, visual score, quality score, freshness, popularity, diversity — MB§38.)

Rule: **popularity must not overwhelm relevance** — for "minimal checkout", a popular unrelated screen must not outrank a less popular exact match. Weights and learning-to-rank: **Not decided**. "Popularity" depends on usage data that does not exist until the product has users (**Inferred**).

## Diversification (§37)

Avoid returning the same product repeatedly when many are relevant (Stripe ×5 → Stripe, Shopify, Linear, Notion, Airbnb). "Particularly useful for design research." Algorithm (per-product cap, MMR…): **Not decided**.

## Query understanding

LLM/VLM role: natural-language query interpretation (§54) — [17](17-ai-architecture.md). [V3]. Before V3, the keyword and taxonomy parsers handle queries.

## MCP / agent retrieval (design intent, phase Not decided)

The original token-cost question (TOK) motivates a *structured, scoped* agent interface: return structured results (site, page, section, screenshot URL, viewport, tags, interaction states, components, tokens, technologies, related flows) and let the model request the actual image **only when it needs visual inspection** (WF§6, RES§25). Preferred escalation: `MCP/structured data → accessibility tree → targeted DOM → screenshot only when necessary`. MCP tool names: [02](02-system-architecture.md). The assistant also noted agents want to go "deeper" into a specific reference/site rather than receive generic search results (MB§24, citing community discussion). AI answers must trace back to actual references (MB§23). Phase of MCP/API: **Not decided** (Master Blueprint put MCP in an MVP under the SaaS premise; the final Blueprint does not mention it).

## Query types and endpoints

`GET /search`, `POST /visual-search` (§47). Region and component search endpoints: **Not decided**. Additional REST endpoints sketched in MB§25 (`GET /websites`, `/pages`, `/sections`, `/components`, `/assets`, `/similar`, `/versions`, `POST /crawl`) belong to the superseded SaaS premise (`POST /crawl` in particular).

## Uploads in search

User-uploaded screenshots are another source (`USER_UPLOAD → RawArtifact → OCR → Embedding → Visual search`) and are kept out of the public dataset (§39). [V1] ("collections, uploads").
