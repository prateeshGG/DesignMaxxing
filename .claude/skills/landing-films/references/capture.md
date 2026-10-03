# Sharp captures (what made the difference)

The first films looked soft because they were built from the founder's 1920×1080 screenshots, cropped to 1280 px and then zoomed. **The fix was to capture again, not to upscale.**

- **Device scale factor.** Render the page at `deviceScaleFactor: 2` (desktop, 1440 CSS px wide → 2880 px images) and 3 for phones (390 → 1170 px). Text and UI stay sharp even at a 2x camera push-in.
- **Settle before shooting.** Scroll the whole page in 400 px steps with short waits (lazy images, scroll reveals), return to the top, wait about 3 s.
- **Two passes.** Animated pass for anything that only looks right running (background videos, art that loads on play). Reduced-motion pass (`reducedMotion: "reduce"` plus a style tag pausing animations and transitions) for counters and reveals. A live counter shot mid-roll is the classic defect: "1.726066" with digits half-scrolled.
- **Section bounds from the DOM.** Measure `header, section, footer, main > div` with `getBoundingClientRect` and crop exactly on those edges. Guessing bounds by eye cut a banner through the middle and glued its tail onto the next section.
- **Patch when a pass breaks something.** Example: Stripe's nav buttons rendered blank in the reduced-motion pass, so the nav strip came from the animated pass.
- **Fonts.** For our own renders, ship font files locally. A blocked font host fails silently and everything falls back to system fonts.
- **Respect.** Check `robots.txt`, keep the number of sites small, credit each site, and keep third-party captures in private prototypes until counsel signs off.
