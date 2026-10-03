# Feature List coverage check

Part of the [Part-Specs](README.md). Every section of the `Feature List` (repo root) mapped to the Part(s) in the [Parts Hierarchy](../21-parts-hierarchy.md) v1.2 that will build it. Checked on 3 October 2026 at the founder's request ("did we miss any feature?"). Rows marked **added** had no Part before this check.

| Feature List section | Covered by | Phase | Notes |
|---|---|---|---|
| A. Website library: profile, domain, category, industry, type | 1.5 (source), 3.2 (Product), 4.3 (taxonomy) | V0 | Category comes from seed curation (F-46); industry and website type are taxonomy labels |
| A. Page library, versions, historical captures, timestamps | 3.2, 3.4, 6.6 | V0 hash-skip; V1 diffs and viewer | |
| A. Site map (page/URL structure) | 6.3 | V0 | **added** to 6.3's description |
| A. Technology stack, CMS, framework, libraries, hosting/CDN, analytics, payment | 4.7 | V1 | |
| A. Fonts | 4.8 | V1 | |
| B. Page, full-page, above-the-fold and section screenshots | 2.3 | V0 | Sharp 2×/3× captures (DC-20) |
| B. Desktop and mobile versions | 2.2, 2.3 | V0 | |
| B. Tablet versions | 2.8 | V1 | |
| B. Page metadata: URL, title, description, H1/H2, SEO, OpenGraph | 2.3 (captured in the DOM), 6.3 (shown) | V0 | **added** to 6.3's description |
| C. Section intelligence: 25 types + unknown | 2.3 (segmentation), 4.3 (classification) | V0 | Taxonomy v1 = exactly this list (F-27) |
| D. Component intelligence | 4.9, 5.4 | V1 detection; V3 search | |
| E. Desktop, mobile | 2.2 | V0 | |
| E. Tablet, laptop, breakpoints, layout changes, responsive comparison | 2.8, 6.6 | V1 | **added** laptop and breakpoint detection to 2.8 |
| E. Responsive timeline, navigation/typography/component/content changes | 2.8, 6.6 | V1 | Detailed in the 2.8 spec when written |
| F. Interaction states: nav menus, tabs, accordions, pricing toggles | 2.7 | V1 | Fixed set (F-17) |
| F. Wider states: hover, focus, active, disabled, loading, error, success, drag/drop, swipe, keyboard | 2.7 (later extension) | later | **added** as a named later extension of 2.7 |
| G. Motion intelligence | 2.4 | V0 detection; V1 scroll recording | |
| H. Media intelligence and metadata | 2.4 | V0 | |
| I. Design-system tokens | 4.8 | V1 | |
| I. Inferred design system | 4.8 (fingerprint) | V3 | |
| J. Content intelligence (copy, CTAs, FAQ, errors, empty states) | 4.2 (text), 5.1 (search) | V0 | Error/empty/loading messages need the wider interaction states (F) |
| K. Flow intelligence | 7.8, 6.7 | V2 | Gated by G5 |
| L. Technology intelligence | 4.7 | V1 | |
| M. Accessibility intelligence | **9.1** | unphased | **added** (raw accessibility tree already captured by 2.3) |
| N. Performance intelligence | **9.2** | unphased | **added** (raw timings already captured by 2.3) |
| O. Keyword and semantic search, combined filters | 5.1, 5.2, 6.2 | V0 | |
| O. Screenshot (visual) search | 5.3 | V1 | |
| P. Similar sections | 4.5 | V0 | |
| P. Similar pages, websites, components | 4.5, 5.3, 5.4 | V1–V3 | |
| P. Compare websites, responsive behaviour, design systems, flows, versions | 6.6, 6.8 | V1–V3 | |
| P. Design, industry and technology trends; pattern frequency | **9.3** | unphased | **added** |
| Q. AI: ask, explain, find references, reports, compare, summarize, extract design system | 5.5 | V3 | |
| Q. MCP and API | 5.5 | V3, gated by F-03 | |
| R. Collections, folders, tags, notes | 6.5 | V1 | |
| R. Comments, team workspaces, sharing, public collections, permissions, export | **9.4** | unphased | **added** |
| R. Figma integration | **9.5** | unphased | **added** |
| S. Code generation, design-system generation, recreate this, screenshot → HTML/React/Figma | **9.6** | future | **added**; doc 18 says "do not build initially" for code generation |
| S. Website change monitoring, competitive monitoring, automated trend reports | **9.7** (builds on 3.4, 6.8) | future | **added** |
| S. Browser extension | **9.8** | future | **added**; needs a founder decision because a capture extension conflicts with "end users never crawl" |

**Result:** before this check, sections M, N, the trend half of P, most of R and all of S had no Part. They are now Parts 9.1–9.8, unphased until the founder decides. Nothing from the Feature List was removed.
