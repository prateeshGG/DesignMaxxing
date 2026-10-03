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

## Waiting for

More reference screenshots from the founder (batch 2+). Please also say what you like or dislike about these (e.g., "love the hero window, dislike the logo row"), and whether you want dark only or light/dark.
