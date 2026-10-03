# 09 — iOS and Android Collection

Part of the [engineering docs](README.md). Prev: [08](08-web-collection.md). Next: [10 Authentication and permissions](10-authentication-and-permission-workflows.md). Phase: **V2** ([18](18-mvp-v1-v2-v3-roadmap.md)). Do not build ahead of V2; only keep the design graph and job/event model compatible ([05](05-normalization-and-design-graph.md)).

Origin: the user asked "what about the mobile apps because mobbin has that too". Mobile apps are "a first-class ingestion pipeline, not an afterthought", but "cannot be collected with the same crawler architecture as websites" — they need app instrumentation + device automation (MOB§1). Internal collection only. The **output is unified** even though collection is platform-specific.

## Acquisition (MOB§2, GAP§30)

```
iOS:     App Store → authorized app acquisition → iOS Simulator / authorized device → install → launch → UI automation → screenshots → screen transitions → media/interaction capture
Android: Play Store / APK / authorized source → emulator / authorized device → install → launch → UI automation → screenshots → UI hierarchy → transitions → media extraction
```

"The exact acquisition method depends on what you are legally authorized to access. We should **not** design the system around bypassing app-store restrictions, DRM, authentication, or anti-bot mechanisms." Acquisition goes through **Source Adapters**: iOS authorized build, Android APK/AAB, internal test build. Which concrete sources are ingested ("public mobile apps / authorized app builds / internal test builds") must be decided before building the mobile collector (GAP§30): **Not decided**.

## Mobile collector interface (§19)

"The mobile architecture should expose the same normalized interface." iOS and Android implement it differently.

```
MobileCollector
 ├── install()
 ├── launch()
 ├── reset()
 ├── inspect_ui()
 ├── screenshot()
 ├── record()
 ├── tap()
 ├── swipe()
 ├── back()
 ├── input()
 └── collect_state()
```

Services: `ios-collector`, `android-collector`, with `exploration-engine`. Engines run against a **simulator / authorized device** (iOS) and **emulator / authorized device** (Android) (§1). Mapping of interface calls to tooling (XCUITest, Appium, adb/UIAutomator…) is **Not decided**. How `back()` maps to iOS (no system back button) is **Not decided**. Gestures beyond the interface (long press, double tap, drag, pinch, pull-to-refresh) are required by MOB§8; whether they extend the interface or fold into `input()`/`swipe()`: **Not decided**.

## Observation layers (MOB§3–4)

A website gives DOM, CSS, JS, network; a native app gives accessibility/UI hierarchy, visual pixels, touch events, system events, network activity and app lifecycle. For every app record: **screenshot** (`screen.png`), **UI hierarchy** (per element: text, bounds, accessibility label, clickable), **device metadata** (OS, device, resolution, DPI, orientation, locale, dark/light mode), **interaction** (tap, swipe, long press, back, keyboard, scroll, toggle), **transition** (Screen A →tap→ Screen B). This is "the foundation for automatic flow reconstruction."

## Installation, launch, reset

`install()` places a build; `launch()` starts it; `reset()` returns the app to a known state — used to create controlled states (fresh install etc., [10](10-authentication-and-permission-workflows.md)).

## UI inspection, screenshots, recording

- `inspect_ui()` → `UI_TREE` RawArtifact; `screenshot()` → `SCREENSHOT`; `record()` → `VIDEO`; `collect_state()` → composite state evidence.
- For many native apps "the most reliable representation is simply what the user actually sees", so **screenshots and recordings remain the canonical evidence**; original assets (PNG/JPEG/WebP/SVG/vector drawables/Lottie/fonts/icons) are extracted only "where legitimately available" and are not depended on (MOB§10).
- Recorded flow video is **derived, not the source of truth**: individual screens, edges and actions are stored alongside `flow.mp4` (§27). **Inferred:** raw session recordings from `record()` are RawArtifacts; the composed `flow.mp4` is a DerivedArtifact.
- **Transitions:** when a transition occurs record `transition.mp4`, poster, duration, source_screen, destination_screen, trigger (MOB§9). Screen capture + frame recording + UI hierarchy together.
- **System UI is separated from app UI** (status bar, navigation bar, keyboard, permission dialogs) so search data isn't polluted with OS UI (MOB§16, [05](05-normalization-and-design-graph.md)). Canonicalization crops system chrome ([04](04-raw-evidence-and-storage.md)).
- **Native vs rendered UI (MOB§11):** native (SwiftUI, UIKit, Jetpack Compose, Android Views), cross-platform (React Native, Flutter, .NET MAUI, Kotlin Multiplatform, Ionic) and game/rendered engines (Unity, Unreal, custom OpenGL/Metal). For the last, the UI hierarchy may be incomplete → **UI hierarchy + visual analysis** together.

## Exploration graph (§20)

The app is a graph:

```
                 ┌── Settings
Home ────────────┼── Search
                 └── Profile
```

```
ScreenState (node): visual_hash, ui_hash, screenshot, ui_tree, device, app_version
FlowEdge   (edge):  from, to, action, coordinates, target, duration
```

Exploration agent loop (MOB§6): read the UI hierarchy → prioritize actions (tap obvious navigation, tabs, open menus, scroll, expand accordions, open dialogs) → `before screenshot → action → wait for UI stability → after screenshot → visual diff → new state?` → genuinely new = **save**; effectively identical = **discard**.

Don't screenshot only initial screens: e.g. Instagram `Home → tap + → Create → Photo picker → Editor → Filters → Share` must be discovered (MOB§5).

## Action selection (§22)

No random clicking. Score each candidate: `action_score = novelty + semantic_importance + navigation_probability + visual_prominence − repetition − risk`. High priority: navigation, buttons, tabs, menus, CTAs, forms, filters, dialogs, carousels, expanders. Lower: decorative elements, external links, repeated cards, social widgets. Dangerous actions: [10](10-authentication-and-permission-workflows.md).

**Flow discovery is a graph algorithm (GAP§10):** state → candidate actions → action → new state → edge, using graph traversal + priority scoring + state dedup. "Don't let an LLM randomly click around. AI can help decide which unexplored action is interesting, but the underlying system should remain deterministic."

## State deduplication (§21) [Foundational]

"Never assume two screenshots are different because their hashes differ."

```
state_similarity = weighted( visual similarity,
                             UI-tree similarity,
                             OCR similarity,
                             URL / navigation state )
if state_similarity > threshold → same state
```

Prevents infinite exploration. Weights, threshold, and the native meaning of "URL/navigation state" (activity/view-controller identity?) are **Not decided**. The web analogue (MB§35) hashes URL, DOM structure, visible text, visual embedding and layout signature.

**State-space limits (GAP§9)** — for infinite feeds, calendars, etc.: `max_unique_states, max_depth, max_actions_per_state, max_scroll_distance, max_repeated_state_count`, plus state deduplication. Values **Not decided**.

## Gestures and transitions (MOB§8)

Record tap, double tap, long press, swipe, drag, horizontal swipe, vertical scroll, pinch, back, keyboard input, pull-to-refresh. Per meaningful transition: `action_type, coordinates, target, duration, direction, source_screen, destination_screen` so the flow viewer can reproduce the interaction. (The Blueprint's `FlowEdge` has `from, to, action, coordinates, target, duration`; `direction` is an addition from this answer.)

## Flow reconstruction (§26)

```
A → B   tap Search
B → C   type query
C → D   tap result
```

A flow is generated from the graph (`Flow`, `FlowNode`, `FlowEdge`). AI may label it (`SEARCHING`) but transitions remain evidence-based ([17](17-ai-architecture.md)). How "important flows" are chosen for recording is **Not decided**. Flow types from the Feature List are classification targets via taxonomy.

## Controlled test states and session profiles

`fresh_install, permissions_denied, permissions_allowed, logged_out, logged_in` (§25; MOB§14 also lists "previously launched"), and session profiles **Anonymous / Authenticated / Special test account** (MOB§13) — see [10](10-authentication-and-permission-workflows.md).

## Device profiles (MOB§15)

`packages/device-profiles` holds profiles and `DeviceProfile` is a core entity. "Don't attempt 50 devices initially": canonical profiles — iPhone small/medium/large; Android small/medium/large — in portrait and landscape; later notch, Dynamic Island, navigation-bar and different aspect ratios. Exact devices, OS versions and pixel sizes: **Not decided**. Theme (light/dark) and locale are part of screen identity ([05](05-normalization-and-design-graph.md)).

## Platform and version handling (§28)

Use the app's real identifiers where available: `versionName`, `versionCode` (Android); `CFBundleShortVersionString`, `CFBundleVersion` (iOS). Stored in `ProductVersion`; feeds app version history — compare Version A vs B for new/removed screens, changed layouts, colors, navigation, components, flows (MOB§17, [11](11-versioning-change-detection.md)). Linking the same product across iOS/Android/web: **Not decided**.

## Framework detection (MOB§12)

Same principle as web: deterministic evidence (bundle structure, resources, UI-hierarchy characteristics, runtime behavior, known framework signatures, package metadata) → e.g. React Native, confidence 0.94; Lottie 0.88; if uncertain `Unknown` (e.g. 0.42) — "better to say unknown than pollute your database."

## Rollout order within V2

The mobile answer sequenced the work: Phase 1 web → Phase 2 **Android** (APK/authorized acquisition → emulator → UI hierarchy → screenshots → interactions → flows) → Phase 3 **iOS** (authorized acquisition → simulator/device → UI automation → …) → Phase 4 unified intelligence (common taxonomy, search, visual search, flow search) (MOB§21). The final Blueprint's V2 lists "Android, iOS" without separate phases; the Android-before-iOS order is retained as an **Inferred** within-V2 ordering ([18](18-mvp-v1-v2-v3-roadmap.md)).

## Failure and reliability

Emulator/simulator/device crashes follow the disposable-worker + checkpoint pattern from [14](14-failure-recovery-and-reliability.md); device-farm specifics are **Not decided**.
