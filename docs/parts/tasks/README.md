# Build order: the collection path (Stage 3 output)

Part of the [Part-Specs](../README.md). Thirteen task lists, **896 tasks**, written from the reviewed specs in the format of [task-list-format.md](../../process/task-list-format.md). Founder decisions F-45…F-64 ([doc 20](../../20-founder-decisions-and-plan-validation.md)) are applied; tasks built on a still-open question carry `[default OQ-…]`.

| List | Tasks | List | Tasks |
|---|---|---|---|
| [1.1 Repository & delivery](1.1-tasks.md) | 52 | [2.2 Browser capture runtime](2.2-tasks.md) | 63 |
| [1.2 Core data platform](1.2-tasks.md) | 45 | [2.9 Supervisor & breakers](2.9-tasks.md) | 82 |
| [1.3 Storage & artifacts](1.3-tasks.md) | 45 | [2.3 Page & section capture](2.3-tasks.md) | 85 |
| [1.4 Queue, events & reliability](1.4-tasks.md) | 88 | [2.4 Media & animation](2.4-tasks.md) | 62 |
| [1.5 Sources & policy](1.5-tasks.md) | 54 | [2.5 Crawl orchestration](2.5-tasks.md) | 48 |
| [2.1 URL discovery](2.1-tasks.md) | 49 | [2.10 Publishability gate](2.10-tasks.md) | 67 |
| | | [2.11 Test harness](2.11-tasks.md) | 98 |

## Milestones

Each milestone ends with something the founder can run and see. Task groups are listed by `list Gn`; inside a group, follow the list's own order and `Depends on` column. "Online" groups (1.1 G6, 1.2 G6, 1.3 G8) wait until the library is shown to users (F-55).

| # | Milestone | What exists at the end | Groups |
|---|---|---|---|
| **M0** | Workspace on the founder's computer | Repo layout, config, local Postgres + Redis, CI, migrations from empty; the fixture site serves its first test pages | 1.1 G1–G5 · 1.2 G1 · 2.11 G1–G2 |
| **M1** | Data foundations | Graph tables, sources and policy, work tables, storage interface with the local-disk driver | 1.2 G2–G5 · 1.5 G1–G4 · 1.4 G1–G2 · 1.3 G1–G4 |
| **M2** | One page, sharp (walking skeleton) | `capture try <url>` runs the capture child standalone: Google Chrome, honest identity, readiness, motion and static passes, a sharp full-page and viewport shot on disk | 2.2 G1–G8 · 2.3 G1–G4 · 2.11 G3–G6 |
| **M3** | Never stuck | Outbox, transitions, leases and heartbeats, scheduler, holds, reconciler; the supervisor leases units, enforces deadlines, recycles browsers; the first chaos drills pass | 1.4 G3–G9 · 2.2 G9 · 2.9 G1–G5, G10–G11 · 2.11 G8–G9 |
| **M4** | A whole site | Seed import, robots, discovery, the ≤ 25-page plan; crawl runs and jobs with the active-time clock; DOM-measured sections, hazards and crops | 2.1 G1–G10 · 2.5 G1–G9 · 1.5 G5–G7 · 2.3 G5–G11 · 2.11 G7, G12 |
| **M5** | Judge quality | All gate checks, scoring and verdicts, bad-page fingerprints, batch publishing (F-60); media inventory, stills and derived video for videos and GIFs (F-59) | 2.10 G1–G8 · 2.4 G1–G10 · 1.3 G5–G7 · 2.11 G10–G11, G13 |
| **M6** | Resilience and operations | Domain and global breakers, poison quarantine, disk guard, read contracts and CLIs, observability | 2.9 G6–G9, G12–G14 · 1.4 G10–G13 · 1.5 G8–G11 · 2.5 G10–G11 |
| **M7** | 20-site spike (E2) | Golden set and canary, the spike measurements and the E2 scorecard (quality, block rate, founder-minutes, false-changed rate) | 2.11 G14–G15 · 2.2 G11 |

M2 deliberately comes before most of M3: one sharp screenshot from the real browser early proves the hardest unknown (capture quality on real sites, F-61) before the reliability machinery is built around it.

## Gap fixes made while merging the lists

| Gap | Fix |
|---|---|
| A lease left by a supervisor that slept or lost power could be expired by the sweeper and counted as a failed attempt, against F-54 | 2.9-T48: at start-up, release every lease of an earlier instance on this host with `host_unavailable` before the reconciler and sweeper run |
| `capture_job.purpose` was created by 2.5's migration, but 1.4's scheduler (1.4-T44) needs it earlier | 1.4-T03 creates the column; 2.5-T01 only backfills it |
| No fixture proved that hero videos play with the Chrome channel (F-61) | 2.11-T98 adds `media_h264_autoplay` |
| 1.5's events had no dedup keys and `source.created` has no consumer | Use 1.4's pattern `<event_type>:<entity_id>[:<discriminator>]` (1.5-T12); `source.created` is emitted with no consumer until 1.8 declares a queue |
| The lease limit must also stop `leaseNextUnit` from re-leasing a unit at its limit | Covered in 1.4-T42 |
| A soft 404 rejected with `retryable: false` ends `QUARANTINED`, which counts as a miss in the 70% rule | Left as OQ-1.4-30 for the spike to measure |

## Crawler machine (decided)

**F-65:** the founder's Windows PC (x86-64) with Docker Desktop and WSL2. Google Chrome's linux/amd64 build runs inside the capture container, so 1.1 G4, 2.2 G3 and 2.9-T08 work as written; keep crawler data inside the WSL2 filesystem.

## Specs still needed

The collection path ends with gated, publishable captures. These Parts are referenced by the task lists but not yet specified:

| Needed for | Parts |
|---|---|
| M3–M5 (referenced as seams) | 1.7 Security baseline (SSRF guard, container sandbox), 1.8 Observability (metrics, dead-man ping), 1.6 Cost ledger (`CostEvent`, budget state) |
| Turning captures into library rows | 3.2 Design-graph normalization (`recordScreenGraph` calls 2.10's `applyGateToGraph`) |
| The founder's tools | 4.4 Quarantine inbox and review, 6.4 Admin console (Remove site, review queue, seed contact sheet, publish batches) |
| The rest of the E2 spike (doc 20 §8) | 4.2 Text and OCR, 3.3 Text screening, 4.3 Taxonomy and classification, 4.5 Embeddings, 5.1 Search index, 6.2 Explore and search UI |

Suggested next: specify 1.7, 3.2, 4.4 and 6.4 while M0–M2 are being built, then 4.2, 3.3, 4.3, 4.5, 5.1, 6.2.
