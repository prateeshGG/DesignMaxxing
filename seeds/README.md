# Seeds

`candidates-v0.csv` is a **starter candidate list** of well-known product and developer sites, drafted from general knowledge. It is **unverified**: some domains may redirect, block automated access, or have changed. It is *not* a commitment to crawl them.

**Workflow (decision DC-19 in `docs/22`):**
1. The capture spike takes a homepage screenshot of each candidate (honoring robots.txt).
2. The founder reviews a contact sheet and fills `founder_decision` with `keep` or `drop` — judging **visual design quality only** (about 5 seconds per site).
3. Sites that block us are recorded as blocked; we never evade blocks.
4. The founder may add any site they like. Target for the first alpha: **about 100 approved sites**.
