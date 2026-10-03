# Landing page design notes — batch 1 (Linear marketing site, 5 screenshots, 1920×1080)

Observations from the screenshots. **Measured** = sampled from pixels (approximate, compression-affected). **Observed** = read by eye. Nothing here is copied brand material; it is a vocabulary of techniques to evaluate for DesignMaxxing.

## What each screenshot shows

| File | Content |
|---|---|
| `linear-01-hero.webp` | Page top. Sticky nav: logo left; links (Product, Resources, Customers, Pricing, Now, Contact); divider; "Log in" text link; white pill "Sign up". Very large two-line headline, small muted subline, a small "New · Loops →" link right-aligned on the subline row. Below: a framed product window (sidebar + issue detail + floating AI-agent panel) cut off by the viewport bottom, with a soft grey glow rising from the page bottom edge |
| `linear-02-hero-scrolled.webp` | Same page scrolled ~190 px: header stays fixed with a hairline bottom border; the product window is now fully visible inside its rounded frame |
| `linear-03-logos-and-principles.png` | Monochrome white customer-logo row (7 logos, evenly spread across the container) with a small monospace uppercase caption underneath; a large two-tone statement (first sentence white, remainder grey); three equal columns separated by vertical hairlines, each with a monospace label ("FIG 0.1/0.2/0.3"), an isometric wireframe line illustration, a short title and one grey sentence |
| `linear-04-intake-integrations.png` | Section header pattern: heading left, larger light-weight paragraph right, a "Learn more →" text link; below it an animated composite: a chat-thread card overlapping a faded kanban board; the one saturated element is a blue-violet send button |
| `linear-05-planning-monitoring.png` | Same header pattern; left a faded roadmap/timeline, right a card with a dot-plot chart (teal dots, thin red/grey lines); below, a "Features" label and two columns of expandable list items marked with "+" |

## Measured properties (approximate)

- **Background:** near-black with a green-grey cast, about `#08090a` (also `#090b0c`). No pure `#000`.
- **Surfaces:** product panel about `#161819`; sidebar about `#151718` — one step lighter than the page.
- **Hairlines:** about `#1b1c1d`–`#202322` on the page background (1 px borders, column dividers, header underline `#1d1f20`).
- **Primary button:** off-white pill about `#e7e6e9`, dark label.
- **Accents:** used sparingly — blue-violet `#6d78d6` (primary action in a mock), teal about `#068895` (chart data). Text is white and mid-grey; accents appear only inside illustrative product UI.
- **Layout:** content column ≈ 1280 px wide at 1920 px (left edge x≈320, right edge x≈1600), header height 72 px; text blocks left-aligned to the same edge; the product mockup bleeds slightly wider (≈ 1320 px, x≈300–1620).

## Observed patterns

1. **One huge headline, then restraint.** Tight tracking, heavy-medium weight neo-grotesque sans (Inter-like), ~72 px, two lines, white on dark; supporting copy is small and grey. Large empty space above and below.
2. **Product-as-hero.** The hero image *is* the real product UI in a rounded, hairline-bordered window — not abstract art. A floating panel overlaps the window to suggest the AI feature.
3. **Two-tone statement text.** A confident sentence in white followed by explanatory text in grey inside the same paragraph.
4. **Technical "figure" language.** Monospace uppercase micro-labels ("FIG 0.1", the logo-row caption), thin-line isometric wireframes — gives an engineering-blueprint feel.
5. **Consistent section header grid.** Heading in the left column, description + text link in the right column, then a full-width visual. Repeated for every section, which makes the page easy to scan.
6. **Visuals fade at the edges.** Mockups are masked with gradients so the screen content dissolves into the background; motion/animation is implied by partially revealed content.
7. **Hairline structure.** Separation comes from 1 px borders and spacing, not cards with shadows or color blocks.
8. **Link style.** Secondary actions are text links with an arrow ("Learn more →", "Loops →"); there is exactly one filled button in the nav.
9. **Expandable lists.** Feature lists collapse behind "+" icons, keeping the page short.

## Principles to evaluate for DesignMaxxing (not decisions yet)

- **Dark, low-contrast chrome with a single bright CTA** suits a *design-reference* product because screenshots (the real content) become the color. *Hypothesis:* our hero should show **real search results of the product** (section cards with a query) in a framed window, as the product-as-hero pattern does.
- A **section-header grid** and **hairline structure** are cheap to implement and keep the page calm.
- A **monospace micro-label system** could map to our own concepts (e.g. "SECTION 0.1 — HERO") — a natural fit for a product about sections.
- Avoid: copying Linear's headline, copy, illustrations, logo row, or exact palette; showing third-party logos as if they were customers (we have none, and doing so could imply endorsement — see docs/20 F-44).

## Inputs the landing page must satisfy (from the plan, not the references)

Waitlist signup, a short demo of real search over real captured sections (≤ 8 sites, attributed, with a "not affiliated" note — F-44), a price-intent question ($9 / $19 test points — F-06), and the product name **DesignMaxxing**. Brand voice, tagline, and exact sections: **Not decided** — after all reference batches are received.

# Batch 2 (5 more screenshots: 4 desktop 1920×1080 + 1 mobile full-page)

| File | Content |
|---|---|
| `linear-06-ai-automations.png` | Same section-header grid (heading left, light paragraph + "Learn more →" right). Below: four side-by-side "agent chat" panels (Cursor, Linear, ChatPRD…) in a horizontal strip; the outer panels are cropped and faded at the edges, the center ones fully visible. A "Features" label with "+" expandable items sits under the visual |
| `linear-07-build-review-ship.png` | Same header grid. Visual: a task list (grouped In Review / In Progress / Todo) partially covered by a code-diff panel with line numbers, syntax colors, red and green changed-line highlights and a monospace file path; the right half of the diff fades out; the list fades at the bottom. "Features" list below |
| `linear-08-changelog-testimonials.png` | "Changelog": a horizontal timeline (thin line with four dots, first dot red = latest, the rest grey) over four entries — title, two-line grey excerpt, monospace date ("SEP 24, 2026"); "View all →" link. Below, **testimonial cards that break the dark palette**: a pale blue-lavender card and a neon yellow-green card with large dark quote text |
| `linear-09-final-cta-footer.png` | Centered closing headline ("Built for the future. Available today.") with two pills: filled off-white "Get started" and dark ghost "Contact sales". Hairline rule, then a footer: logo mark + five link columns (Product, Features, Company, Resources, Connect) and a small legal row (Privacy, Terms, DPA, AUP) |
| `linear-10-mobile-fullpage.webp` | **Mobile full-page capture, only 140×2000 px** (too small to read text; usable for structure only): single column; header with logo, "Log in" and a pill "Sign up"; headline then the product window cropped; logo row truncated; section headers stack heading → paragraph → "Learn more"; visuals shrink and crop; testimonial cards sit side by side and are cut off (horizontal scroll); the closing headline and two pills are centered; footer links become a two-column grid |

## Measured (batch 2, approximate)

- Testimonial card colors: pale blue-lavender about `#e2e4ff`; neon yellow-green about `#e4f222` (the only strongly saturated fills on the page).
- Closing buttons: filled about `#e5e5e6`; ghost about `#141516` (barely lighter than the page).
- Footer rule about `#23252a`; timeline dots: latest red about `#eb5757`, others grey about `#62666d`.
- Diff highlighting: red rows (dark red-brown tint) and green gutter edge on dark surface.

## Observed patterns (batch 2)

10. **Color is rationed for the end.** The page is almost monochrome until the testimonial cards, where two saturated, very different colors create a deliberate "pop" moment before the closing CTA.
11. **The section-header grid repeats for every feature** (Intake, Planning, AI, Build) — identical structure, different visual, which makes the long page rhythmic.
12. **Visuals are cropped and faded, not fully shown**, hinting at more content beyond the frame (agent panels strip, diff panel).
13. **Monospace details signal precision:** dates, file paths, ticket IDs, figure labels.
14. **Changelog as social proof of momentum:** a timeline of recent releases with dates — shows the product is alive. (For us: a "recently added sections/sites" strip could play this role.)
15. **Closing CTA is centered** (the only centered block besides the footer) with one filled and one ghost button — a clear primary/secondary hierarchy.
16. **Footer:** five columns, understated grey links, legal links (including AUP) in a small bottom row — consistent with the legal documents we plan (docs/20 F-43).
17. **Mobile reflow is simple:** one column, header slimmed to logo + Log in + Sign up, visuals scaled/cropped, horizontal-scroll cards. No hamburger visible in this capture (nav links are absent on mobile; unclear if hidden behind an icon — the image is too small to tell).

## Limits of batch 2

The mobile image is thumbnail-sized. For responsive design decisions please send **real mobile viewport screenshots (about 390×844)** of the hero, a feature section, the testimonial area and the footer, plus any menu-open state.

# Batch 3 (5 real mobile viewport screenshots, 390 wide)

Files `linear-11…15-mobile-*.png`. Observations: header is logo left; "Log in" text link; a white "Sign up" pill; a **hamburger icon** at right (so the nav collapses into a menu). Hero: headline stacks to four lines at about 40 px; subline, then "New · Loops →" under it (left-aligned); the product window is cropped at the viewport bottom. Logo row is a **horizontally scrolling strip** cut off at both edges, with the mono caption below. The two-tone statement is left-aligned at about 22 px. The figure cards are **horizontally scrolling cards** (rounded border, the next card peeking in). Section headers stack heading → paragraph → "Learn more →". Testimonial cards are horizontally scrolling and bleed past the right edge; the closing headline and both pills are centered, and the pills sit side by side.

# First-look prototype decisions (v0)

- **Dark only**, matching the references (founder has not asked for a light theme).
- **Our own identity:** coral accent (`#ff6b3d`), pale mint card, Geist + Geist Mono, an original logo mark; no Linear copy, logos, illustrations or palette.
- **Product-as-hero** with an illustrative search window and a "Capture check" panel (our differentiator); all thumbnails are generic wireframes with `.example` domains, never real sites or logos (docs/20 F-44).
- **Customer logos and testimonials were not copied.** The logo row became "section types we are indexing"; the testimonial pop cards became two principle cards (Attribution, Respect); the changelog timeline became a Roadmap with Now/Next/Later labels instead of dates.
- Waitlist: email field + button in the hero and again in the closing section; client-side validation only.

# Batch 4 — a different site: a design-studio portfolio (light, video-led) — 5 desktop screenshots

Files `studio-01…05-*`. Founder notes: **the hero visual (01) is a video, and video / motion-design clips are used everywhere to show examples.** More references are coming.

| File | Content |
|---|---|
| `studio-01-hero-video.webp` | White page. Nav: two text items with a **diamond glyph (◆)**, centered "X" logo, a **sharp-cornered black button** with a video-call icon. Centered mono-caps eyebrow with a client logo and a result ("…PULLED 5K+ VISITS IN LAUNCH WEEK"). Huge bold two-line centered headline, two-line small subline, black rectangular primary button + plain text link. Below: a **full-bleed, art-directed video stage**: painterly flower imagery left and right with **pixel/dither-cut edges**, and in the middle a hairline-gridded panel mixing a serif headline, a green textured product card and a **line-art engraving** of a rider on a horse |
| `studio-02-logo-tiles-selected-work.webp` | A grid of pale-grey **logo tiles** (5 × 2); one tile **expands wide on hover** to show a one-line description of the work. Then a small-caps eyebrow ("◆ SELECTED WORK"), a centered two-line headline, and the first **case-study row**: client logo, colored category pills, a headline stating the result, an underlined "Read case study" link, a client quote pinned to the bottom, and on the right a **motion clip** (waveform audio player on cream) |
| `studio-03-case-study-rows.png` / `studio-04-case-study-rows-2.webp` | Case-study rows **alternate media left/right**; each has the same structure (logo + pills, outcome headline, link, quote with avatar, name and role). The media are rich, mixed-style clips: a maroon UI chart, a painterly fresco, a cosmic painting with a white UI card on top. Pills: yellow-green "Website", pink "Product", outlined "Development" with an icon |
| `studio-05-services-split.png` | A **full-height split screen**: left deep navy with eyebrow, three diamond step markers (◆◆◆), title "Product Design", one-sentence description, dark rounded tag chips, a white rectangular button; right a **saturated blue panel** playing a product video (chart card, tagline) |

## Measured (approximate)

White page `#ffffff`; logo tiles `#fafafa`; cream media backdrop `#faf7f2`; deep navy panel `#03111c`; saturated blue panel `#1183ff`; pink pill `#ffe5ef`; yellow-green pill (olive-lime). Black buttons are near-black with sharp corners.

## What makes this site work (observed)

1. **Proof in motion.** Every example is a short, designed video rather than a screenshot; the page *shows* the work moving.
2. **Art direction, not templates.** Mixed media (painterly images, engravings, UI) with a consistent treatment: **pixel/dither-cut edges** on images, hairline grid lines, serif accents against a bold sans.
3. **Results in the copy.** Headlines state outcomes ("100k user signups", "5k+ visits in launch week").
4. **A strong, repeated row template** (logo + pills → outcome headline → link → quote) with large whitespace, alternating media side.
5. **Color blocking:** after a white page, a full-height navy | blue split section is the loud moment.
6. **Small distinctive details:** diamond glyph, sharp-cornered buttons (not pills), mono-caps eyebrows, hover-expanding tiles.

## Honest review of prototype v0 (founder feedback: "copied Linear, and not as good")

- It reused **Linear's skeleton** (hero → framed window → logo row → statement → three figures → header-grid sections → timeline → colored cards → CTA → footer) with different colors and words. That is a copy of structure, not our own idea.
- Its visuals were **flat grey wireframes**. Linear's quality comes from real product UI, refined type and spacing, and motion; placeholders cannot match that.
- **No motion at all**, while both reference sites are driven by it.
- It had **no idea specific to DesignMaxxing**: nothing on the page could only belong to a design-reference library.

## Batch 5 (seen in chat; image files not saved to the repo — please re-send if you want them kept)

- **Services scenes:** the navy | blue split repeated per service, each with its own motion video on the right.
- **Testimonial carousel:** large quote cards over **pixel-dithered landscape bands**, with prev/next arrows.
- **FAQ:** two columns (title left, accordion right), and under the list an **"Ask anything else:" input row** with a send button — an AI chat entry point below the FAQ.
- **Closing section:** a booking calendar embedded in the final CTA.

## Prototype v1 decisions

- Concept: show the product's own idea in motion — a page is cut into sections, the sections fly into a library, a search filters them.
- Examples are **original fictional sites** (three skins of one generated component set: Halden, Vantor, Pomelo), never real sites.
- Borrowed *patterns* only: sharp-cornered buttons, mono-caps eyebrows, navy | blue split, dither/noise art, accordion FAQ with an ask row, closing CTA.
- The ask-box is **scripted** (keyword match over the page's FAQ). A real assistant needs a backend, rate limits, a cost cap and answers restricted to published docs.

## Batch 6 (Stripe marketing site, 5 desktop screenshots) — `stripe-01…05-*`

- **Frame:** a centered column with 1px vertical rails and full-width horizontal hairlines; sections are separated by rules rather than boxes.
- **Hero:** a live GDP counter eyebrow, a two-tone headline (dark first sentence, grey rest), one CTA, and a large silk-like gradient ribbon behind the text; the ribbon tints the letters it crosses. A logo strip closes the hero.
- **Bento:** one wide + one narrow card, then three equal cards, then a wide one. Each shows real-looking product UI (localised currency and language) cropped by the card edge on its own gradient or particle art; a small expand button sits top-right of every card.
- **Banner + stats:** a full-column video banner, then a lavender-tinted section with four stats between hairlines (the first dark, the rest dimmed).
- **Graphic:** a half-fan of thin lines with dot tips on a lavender glow. The founder reports the lines move on hover, so it is a live interactive graphic, not a video.

## Founder feedback on v1 (after reviewing the published artifact)

Redesign is "near perfect", but: footer and the CTA above it look bad; FAQ looks bad; the mobile screen in the demo is too small and too curved; **how it works** looks completely bad; the sites are very **scroll-driven**; use **real screenshots**; **What you will find** needs real motion-graphics video (code is fine) and feels empty; videos or motion graphics behind the hero are common.

## Prototype v2 decisions

- **Real content:** all captures on the page are crops of the founder's reference screenshots (Stripe, Linear, one design-studio site whose name is still to be confirmed). Crops live in `prototype/img/` (stored as WebP). Docs/20 F-44 allows a waitlist demo of ≤ 8 sites if each is attributed with a link, with a non-affiliation line and no logos as customers; the page carries those. F-44 also prefers sites whose owners agreed, and counsel (E5) has not reviewed this — **keep it a private prototype**, and remove `img/` and `references/` before the repository is ever public.
- **Hero:** a canvas of ~90 thin gradient lines flows behind the headline and shifts with the pointer. A strip of real section crops scrolls under it.
- **How it works:** one sticky scroll story, driven by scroll position and reversible. 1 Capture (a scroll recording of a real page), 2 Check (a checklist ticking to an illustrative score; scores of 80+ publish, per docs/22), 3 Cut (the page zooms out and splits into labelled sections), 4 Search (a library of real sections; a typed query highlights three heroes).
- **What you will find:** each row has a code-made looping "recording": hero comparison with pan and zoom, a page scroll with camera zoom and a timeline, and three phone screens drifting. Rows now carry pills, a short paragraph, three facts, a link and a meta line.
- **Closing:** a navy section with a pointer-reactive burst of lines (our own, in the spirit of the Stripe graphic). The footer has hairline columns, the attribution line and a large wordmark.
- **FAQ:** two columns with numbered rows, a gradient line panel, and the ask box in a bordered panel with suggestion chips always visible. The ask box is still **scripted** (keyword match over the FAQ); it is not an AI.
- **Mobile:** the story stays sticky, with text on top and the scene below; the phone frames use a 10px radius and larger screens.

## Waiting for

More reference screenshots from the founder (batch 3+), ideally including real mobile viewport shots. Please also say what you like or dislike about these (e.g., "love the hero window, dislike the logo row"), and whether you want dark only or light/dark.
