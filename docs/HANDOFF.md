# DesignMaxxing: Handoff

**Read this first in any new session.** It summarises the whole project conversation up to 4 October 2026: what we are building, what exists, every decision and rejection, how we work, and what to do next. Details live in the linked docs; where this file and a linked doc disagree, the linked doc wins (decisions: [doc 20](20-founder-decisions-and-plan-validation.md)).

---

## 1. The product in one page

- **What:** DesignMaxxing is a searchable library of real website design, organised into **parts** (heroes, feature grids, stats, pricing, testimonials, footers…), Mobbin-like but web-first and cheaper. Users browse and search; they **never crawl** and never add to the public library. Mobile apps and logged-in flows come later.
- **Who:** designers, developers and founders looking for real references.
- **The founder:** solo, no users yet, waitlist first. Works on a **Windows PC** (F-65). Prefers plain, non-technical explanations and short questions with a suggested answer.
- **How the library is made:** collected **by us**, automatically, from sites **a person chose** (F-46). The founder approves every site for visual quality. Automation only finds pages *inside* approved sites (≤ 25 per site).
- **The only place the project can fail is data collection.** It must never get stuck and must never let unusable captures reach users ("captured ≠ publishable").
- **Stage gates** (doc 20 §6): E1 waitlist demand (≥ 15% conversion, ≥ 500 signups in 60 days) → E2 20-site capture spike (quality, cost, block rate, founder-minutes) → E3 search usefulness → E4 willingness to pay ($9 / $19) → E5 legal consult before any public library.

## 2. Where things stand (4 October 2026)

| Area | Status |
|---|---|
| Engineering docs 01–23 | Written ([docs/README.md](README.md)) |
| Founder decisions | F-01…F-65 recorded in [doc 20](20-founder-decisions-and-plan-validation.md); ideas I-1…I-3 in doc 20 §10 (not decisions) |
| Parts Hierarchy | v1.2: 9 groups, 66 Parts ([doc 21](21-parts-hierarchy.md)); Feature List coverage checked ([parts/feature-coverage.md](parts/feature-coverage.md)) |
| Collection-path specs (Stage 2) | 13 written and reviewed in three consistency passes ([parts/](parts/README.md)) |
| Collection-path task lists (Stage 3) | 13 lists, 896 tasks, milestone build order M0–M7 ([parts/tasks/README.md](parts/tasks/README.md)) |
| Remaining V0 specs + task lists | **Not written yet.** 11 sub-agents were started for the 23 remaining V0 Parts but all stopped on the account's weekly usage limit before writing anything. Rerun them with [process/spec-and-tasks-brief.md](process/spec-and-tasks-brief.md) (see §8) |
| Landing page | v4 is current: [landing/prototype/landing-v4.html](../landing/prototype/landing-v4.html); deployed on Vercel via the root `vercel.json` |
| How it works film | Done, with voice and music: [landing/films/how-it-works.html](../landing/films/how-it-works.html) |
| Application code | **None yet.** Building starts in the next (local) session at milestone M0 |

## 3. How we work

- **Breakdown protocol** ([process/project-breakdown-protocol.md](process/project-breakdown-protocol.md)): Stage 1 Parts Hierarchy → Stage 2 one Part-Spec per Part from the [template](process/part-spec-prompt-template.md) → Stage 3 task lists in the [task-list format](process/task-list-format.md). Never invent decisions: anything undecided is an `OPEN QUESTION OQ-<part>-<n>` with a labelled suggested default. Tasks built on an open question carry `[default OQ-…]`.
- **Consistency reviews** after each wave of specs fix name and contract mismatches: [review-wave-1](parts/review-wave-1.md), [-2](parts/review-wave-2.md), [-3](parts/review-wave-3.md). Their §3 tables list the names every later document must use.
- **Changing a decision:** update the source doc first (doc 20, 22 or 23), then the template's frozen decisions, then the specs. Never change a decision only in a spec.
- **Sub-agents:** the founder asked for **Sonnet 5.5** for every sub-agent.
- **Git:** develop on the working branch, push, and also fast-forward `main` (the founder asked for everything on `main`). Commit messages describe the change in plain words.
- **Talking to the founder:** plain words, no jargon; when a decision is needed, ask a short numbered question with a suggested answer, and accept "ok to all". Show work as published pages where useful.
- **Secrets:** never commit keys. A Fish Audio API key was pasted in chat once; it is not in the repo. **The founder should rotate it.**

## 4. Decisions (summary; full text in doc 20)

**Scope and business:** web marketing sites first (V0); mobile and authenticated flows gated to V2 (F-01…F-04, F-36). Name DesignMaxxing (F-05). Budget cap (F-07). Waitlist demo rules: ≤ 8 sites, each attributed, a non-affiliation line, no logos as customers (F-44).

**Collection policy:** robots.txt always; honest user-agent with contact URL; 1 request/s and 2 concurrent per domain; ≤ 25 pages per site, depth ≤ 3; asset ≤ 25 MB; site job ≤ 30 min (F-10…F-14, F-32, DC-13). Page priority: home 100, pricing 90, product 85, features 80, about 60, contact 40, blog 20, legal 5. No evasion, no CAPTCHA solving, no stealth (DC-08, DC-18, SC-03).

**Resilience (docs 22/23):** `CaptureUnit` = canonical URL × viewport × crawl run; leases with 10 s heartbeats; hard kill deadlines; strategy ladder S0–S3; publishability gate with quality score (≥ 80 accepted, 60–79 review, < 60 rejected); Postgres is the source of truth and Redis is rebuildable (DC-14); torture suite, golden set and chaos drills gate every capture change (DC-12). Sharp captures at device scale 2 (desktop) / 3 (phone), never upscaled; motion and static passes chosen per section; one shot for regions sharing an animated background (DC-20). Section crops from DOM-measured bounds (DC-21).

**Where things run:**
- F-45: crawling on the founder's computer, not a cloud VM.
- F-55: before launch everything is local (web app, database, queue, screenshots); things move online only when the library is shown to users.
- F-65: the computer is a Windows PC (x86-64) with Docker Desktop + WSL2. Linux Google Chrome runs inside the capture container. Keep crawler data inside the WSL2 filesystem.

**The 18 collection answers (F-47…F-64, "ok to all"):**

| Topic | Decision |
|---|---|
| Internet or storage down | Keep captures in a local spool, upload later (F-47) |
| Crash before a try starts | Does not count as a try (F-48) |
| Removal requests | Founder uses "Remove site" in admin; everything deleted within 48 h (F-49) |
| robots.txt errors | 404 = allowed; 5xx/unreachable = skip today, retry tomorrow (F-50) |
| Picture storage online | Originals private; only display copies public; backups separate; before launch: local disk + Drive folder backup (F-51) |
| Storage size | About 40–160 GB raw, re-measured in the spike (F-52) |
| When the crawler runs | Only in a session the founder starts; never at boot; never sleeps or restarts the PC; keeps it awake only while capturing (F-53) |
| Sleep or power loss mid-page | Not a failed try; retried the same way (F-54) |
| Everything local before launch | Yes (F-55) |
| Machine share | Two browser slots, low priority, pause on low memory or battery (F-56) |
| 30-minute site limit | Counts only active crawling time (F-57) |
| Crawler identity | One honest user-agent with contact URL, English, UTC, phone captures emulate a phone (F-58) |
| Animations | Original + still for everything; playable video only for videos and GIFs (F-59) |
| Going live | Batches; founder spot-checks a random 5%; one bad item holds the batch; automatic after 3 clean batches of ≥ 100 checked items (F-60) |
| Browser | Branded Google Chrome channel so H.264 hero videos play (F-61) |
| Site "done" | ≥ 70% of capturable pages accepted; review-pending doesn't count yet; 404/PDF/redirects excluded; later approvals only improve it (F-62) |
| Downloaded files from sites | Kept privately as evidence; derived previews deleted first if space is short (F-63) |
| Blocked site waiting 6 h | Crawler stays on for the retry; founder can stop any time (F-64) |

**Ideas, not yet decisions (doc 20 §10):** I-1 Google Drive first for images, S3/R2 later (recommendation: local + Drive backup now, Cloudflare R2 when online). I-2 Mobbin-style blurred/limited previews for free users, flows and advanced features paid. I-3 owner submissions in return for a discount (V1; owner proves the domain; we still capture; founder still approves).

## 5. Rejected or superseded (do not bring these back)

| Rejected | Why / replaced by |
|---|---|
| Users triggering crawls, credits, per-plan crawl limits (Master Blueprint) | Governing decision: crawling is internal; users only browse |
| Automatic discovery of new sites | F-46: a person chooses every site |
| Scrapling as the core, any stealth or evasion | SC-01, SC-03, DC-18 |
| Kubernetes, Terraform, OpenSearch, two cloud VMs | F-35 simplicity; then F-45/F-55: everything on the founder's PC first |
| Upscaling low-resolution screenshots | Re-capture at device scale 2/3 (DC-20) |
| Guessing section bounds by eye | DOM-measured bounds (DC-21) |
| Joining strips from different shots under animated art | One shot (DC-20): the Stripe ribbon seam |
| A nightly automatic quality run | F-53: the crawler never starts by itself; the canary is started by the founder |
| **Landing page:** copying Linear's look (v1), describing how we browse, capture or screenshot sites, copied nav with square markers, solid black search or ask bars, the same video everywhere, the Flute videos and wall reel, boxes/panels around previews, the outer box around the waitlist form, a hard black border on the Index button, a sound button that showed the action instead of the state | v2–v4 fixes; rules recorded in the landing-films skill |
| **Film:** low-quality first films, curvy annotation connectors, a big circle around the gradient art, labels over content, "hero with a product visual" as the search query, "Every page, broken into parts" as the intro | Straight arrows to targets, labels in empty space, query "hero with a big, bold headline", intro "Search real websites, section by section." |
| **Film sound:** code-synthesised sound effects and pad ("fush fush"), the "Calm Female Voice" (roomy, flat) | Energetic dry voice "Upbeat Woman" over licensed music |
| Flute (scene videos and the studio tool) | Rejected; folder deleted. Motion is made only with the code film engine (`landing/films`, landing-films skill) |
| Fish Audio API route | Needs separate API credit (402); use the Fish **connector** (package credits) |
| Mixkit / Pixabay / Uppbeat music | Bot-check pages; not scraped |
| Bensound free tier, MusicGen | Licence unclear / non-commercial weights |

## 6. The landing page

- **Current page:** `landing/prototype/landing-v4.html`, plain HTML + CSS + JS, no build step. It contains:
  - a floating nav bar, with a logo mark showing a page whose middle section pops out in blue, a blue "Get early access" button, and the soft Index button and Index dropdown (the founder likes the dropdown);
  - the hero line animation, shown as a looping video;
  - How it works: Isolate → Search → Study, scroll-driven, with straight-arrow callouts;
  - the parts film with a Sound on/off button that shows the current state;
  - the "What you can search" tiles;
  - example rows: heroes that swap places on hover, the Stripe banner, Linear phone screens;
  - credit band, roadmap, FAQ with an automated answer box, closing waitlist, footer with the attribution and non-affiliation line.
- **Images:** every image on the page was regenerated from the sharp 2× captures in `landing/films/src/`.
- **Deployment:**
  - The root `vercel.json` serves `landing/prototype` as static files and maps `/` to `landing-v4`.
  - The first Vercel deploy showed "DesignMaxxing motion scenes. Open with the Flute studio." because Vercel auto-detected the old Vite/Flute studio in `landing/motion`. That folder has since been deleted (Flute is rejected), so the repo has no other build to detect.
  - **In Vercel → Project Settings → Build & Deployment:** set Root Directory to the repo root (empty) and Framework Preset to "Other". Then redeploy.
- **Waitlist forms are front-end only** (no backend yet); the price-intent question is still missing (see 8.1).
- **Copy:**
  - Hero: "Find the exact section, not the whole website."
  - Parts section: "Find the exact part you need, not a full-page screenshot."
  - Closing: "Stop screenshotting. Start finding."
- **Coverage gaps the founder accepted for later:**
  - "Find similar"
  - filters shown
  - who it's for
  - price question
  - collections
  - colours and fonts
  - tech stack
  - screenshot search
  - version history
  
  A compact "Everything in one library" section was proposed and not yet built.

## 7. The How it works film

- **Engine:** `landing/films/` holds a deterministic HTML film engine (`engine.js`, `film.css`, local fonts). `render.mjs` renders frames with Playwright at 2× and encodes MP4 + WebM at 1920×1200.
- **Story:** title → a Stripe page split into tagged sections → search "hero with a big, bold headline" → three real heroes → the Stripe hero opened, with straight-arrow callouts (Headline, Gradient art, One call to action) → "Open live site".
- **Sound:**
  - Voice: "Upbeat Woman", Fish Audio voice `e107ce68d2a64e928c3a674781ce9d56`, made with the Fish connector, with per-line delivery tags. Lines and timings are in `landing/films/audio/how-it-works.cues.json`.
  - Music: "Werq" by Kevin MacLeod (incompetech.com), **CC BY 4.0**. The credit must appear where the film is shown; it is in the page caption and in `audio/music/CREDITS.md`. The track starts 0.89 s in, so a downbeat lands on the 12.55 s cut.
  - Mix (`audio/mux.mjs`): dry voice chain, music ducked about 10 dB under the voice, −16 LUFS.
  - The shipped file carries its audio track. It autoplays muted, and a visible button unmutes it.
- **Re-render** (from `landing/films/`):
  1. `node render.mjs how-it-works video`
  2. Save voice clips as `out/how-it-works-vo/line-<i>.mp3`
  3. `node audio/vo.mjs how-it-works --clips`
  4. `node audio/mux.mjs how-it-works`
  5. Copy `out/how-it-works-sound.*` to `landing/prototype/video/how-it-works.*`
- **Skill:** `.claude/skills/landing-films/` captures everything learned: capture, motion, callouts, audio, and the QA checklist.

## 8. Data collection plan

- **Specs:** `docs/parts/` holds the Part-Specs. The 13 collection specs are:

  | Group | Specs |
  |---|---|
  | Foundations | 1.1 repo and environments, 1.2 database, 1.3 storage, 1.4 job queue and reliability, 1.5 sources and policy |
  | Collection | 2.1 URL discovery, 2.2 browser capture runtime, 2.9 supervisor and breakers, 2.3 page and section capture, 2.4 media and animation, 2.5 crawl orchestration, 2.10 publishability gate, 2.11 test harness |

- **Build order** ([parts/tasks/README.md](parts/tasks/README.md)):

  | Milestone | Content |
  |---|---|
  | M0 | Workspace on the PC |
  | M1 | Data foundations |
  | **M2** | **One sharp page with Chrome (walking skeleton: `capture try <url>`)** |
  | M3 | Never stuck |
  | M4 | A whole site |
  | M5 | Judge quality and media |
  | M6 | Resilience and operations |
  | M7 | The 20-site spike (E2 scorecard) |

- **Remaining V0 Parts: not written yet.** The 23 Parts below were assigned to 11 Sonnet sub-agents, which all stopped on the weekly usage limit before writing a file. To redo them, give each sub-agent [process/spec-and-tasks-brief.md](process/spec-and-tasks-brief.md) plus its assignment. Run them in two waves: wave A first, wave B after it. Wave B Parts may refer to wave-A Parts by role. Finish with one consistency review like the earlier ones.

  | Wave | Agent | Parts |
  |---|---|---|
  | A | 1 | 1.7 security baseline |
  | A | 2 | 1.6 cost ledger, 1.8 observability |
  | A | 3 | 3.2 graph normalization |
  | A | 4 | 3.1 dedupe, 3.4 versioning |
  | A | 5 | 3.3 text screening, 4.1 AI gateway |
  | B | 6 | 4.2 OCR, 4.3 taxonomy |
  | B | 7 | 4.4 review inbox, 6.4 admin |
  | B | 8 | 4.5 embeddings, 4.6 benchmark |
  | B | 9 | 5.1 search, 5.2 ranking |
  | B | 10 | 6.1 app shell, 6.2 explore UI, 6.3 object views |
  | B | 11 | 8.1 waitlist, 8.2 legal, 8.3 pricing experiments, 8.4 runbooks |

  Each agent's prompt should also list what existing specs already expect from its Part. Search `docs/parts` and `docs/parts/tasks` for the Part id; the "Specs still needed" table in parts/tasks/README.md says why each is needed.
- **Not yet specified (V1+ or gated):** 2.6–2.8, 4.7–4.9, 5.3–5.5, 6.5–6.8, all of Group 7 (authenticated and mobile), Group 9 (later features from the Feature List: accessibility, performance, trends, team collaboration, Figma, generation tools, monitoring, browser extension). Specify them when their gate passes.
- **Seeds:** `seeds/candidates-v0.csv` is the drafted candidate list. The founder approves sites from a contact sheet (F-46, DC-19).

## 9. Environment notes (for the local session)

- **Windows + Docker Desktop (WSL2 backend):** run the project inside the WSL2 filesystem. Install Google Chrome stable (linux/amd64) in the worker image (2.2-T16).
- **Fonts:** headless Chromium could not load Google Fonts in the cloud sandbox, so the films use local font files in `landing/films/fonts/`.
- **Bundled Playwright Chromium cannot decode H.264.** This is why F-61 chose Chrome.
- **Cloud-only quirk:** the cloud sandbox needed Chromium to trust the proxy CA (`--ignore-certificate-errors-spki-list=<CA pin>`). The local PC does not need this. Never use a blanket ignore-certificate flag.
- **Fish Audio:**
  - The MCP connector (`https://api.fish.audio/mcp`) works on the free plan with package credits; 9,462 package credits plus 2,000 extra remained after this session.
  - The raw API needs separate API credit.
  - Add the connector in the local Claude app if voice work continues.
- **Screenshots of third-party sites:** credit each site, check robots.txt, and keep the number of sites small (F-44). The landing page already carries the attribution and non-affiliation line.

## 10. What the next session should do first

1. Read this file, then [doc 20](20-founder-decisions-and-plan-validation.md) and [parts/tasks/README.md](parts/tasks/README.md).
2. Fix the Vercel project settings if the deployment still shows the Flute placeholder (§6).
3. **Do not start coding until the founder says so.** When they do, begin with M0 (1.1 G1–G5, 1.2 G1, 2.11 G1–G2), then M2 (`capture try <url>` with Chrome) before most of M3.
4. Keep the founder's preferences: plain words, short questions with suggested answers, Sonnet 5.5 sub-agents, push to `main`.
5. Optional landing work: the "Everything in one library" section, the price-intent question on the waitlist, a real waitlist backend (8.1).

## 11. FAQ (questions the founder asked, with the answers given)

| Question | Answer |
|---|---|
| Do users crawl or upload? | No. We collect; users browse and search. A private "my uploads" area is a V1 idea, never added to the public library. |
| Should owners be able to submit their own site/app for a discount? | Good idea for V1 (I-3): the owner proves the domain; we still capture; the founder still approves. Apps with the mobile phase. |
| Why at most 25 pages per site? | Politeness (1 request/s keeps each site under ~30 min) and value (design lives on home, pricing, features, about; page 26+ is mostly blog and legal). It is a setting and can change. |
| Can we store images in Google Drive first? | Before launch, keep everything local and let the Drive desktop app back up the folder. For serving images to users later, use object storage (Cloudflare R2 is cheapest and easiest); Drive is rate-limited and not built for that. |
| Where did the sharp images come from? | Re-captured live at device scale 2 (2880 px wide) and 3 for phones, never upscaled; animations frozen; section bounds from the page's DOM. |
| Why were some images blank? | Scroll-reveal sections were photographed before they faded in. Fixed by re-capturing after scrolling and waiting; the skill now requires a blank-crop check. |
| Is every Feature List item in the plan? | Yes, after the coverage check: items with no Part became Group 9 (unphased). See parts/feature-coverage.md. |
| Did we create all Part-Specs and task docs? | Collection path: yes (13 + 13). Remaining 23 V0 Parts: not yet; the agents hit the weekly limit, and the brief to rerun them is in docs/process/spec-and-tasks-brief.md. V1+ Parts: later. |
| Why was the Vercel site a placeholder? | Vercel deployed the old Flute studio in landing/motion (now deleted). The root vercel.json serves the static landing page; set Root Directory to the repo root. |
| Do we use Flute? | No. Flute is rejected; its studio folder was deleted. All motion is made with our own code film engine (landing/films, landing-films skill). |
| Why couldn't voiceover use the API key? | The API needs separate API credit; the connector uses the free package credits and worked. |
| Should we show blurred previews like Mobbin? | Good fit (I-2); decide limits with the pricing experiment (E4). |
| What computer runs the crawler? | The founder's Windows PC with Docker Desktop + WSL2 (F-65). |
