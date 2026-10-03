# 09 — iOS and Android Collection

Part of the [engineering docs](README.md). Prev: [08](08-web-collection.md). Next: [10 Authentication and permissions](10-authentication-and-permission-workflows.md). Phase: **V2** ([18](18-mvp-v1-v2-v3-roadmap.md)). Do not build ahead of V2; only keep the design graph and job/event model compatible ([05](05-normalization-and-design-graph.md)).

Origin: the user asked "what about the mobile apps because mobbin has that too". Internal collection only.

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

Services: `ios-collector`, `android-collector`, with `exploration-engine` driving them. The engines run against a **simulator / authorized device** (iOS) and **emulator / authorized device** (Android) (§1). Mapping of interface calls to tooling (e.g. XCUITest, Appium, adb/UIAutomator) is **Not decided**. How `back()` maps to iOS (which has no system back button) is **Not decided**.

## Installation, launch, reset

`install()` places an app build; `launch()` starts it; `reset()` returns the app to a known state — used to create controlled states (fresh install etc., [10](10-authentication-and-permission-workflows.md)). How app packages are obtained (store download, authorized builds from owners) is **Not decided**; `APP_PACKAGE` is a RawArtifact type and `AUTHORIZED_BUILD` a Source type, which implies builds are collected under authorization.

## UI inspection, screenshots, recording

- `inspect_ui()` → `UI_TREE` RawArtifact; `screenshot()` → `SCREENSHOT`; `record()` → `VIDEO`; `collect_state()` → composite state evidence.
- Device metadata is captured as evidence (§1) and tied to `DeviceProfile`.
- Recorded flow video is **derived, not the source of truth**: individual screens, edges and actions are stored alongside `flow.mp4` (§27). **Inferred:** raw session recordings from `record()` are RawArtifacts, while the composed `flow.mp4` is a DerivedArtifact.

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

## Action selection (§22)

No random clicking. Score each candidate: `action_score = novelty + semantic_importance + navigation_probability + visual_prominence − repetition − risk`. High priority: navigation, buttons, tabs, menus, CTAs, forms, filters, dialogs, carousels, expanders. Lower: decorative elements, external links, repeated cards, social widgets. Dangerous actions: [10](10-authentication-and-permission-workflows.md).

## State deduplication (§21) [Foundational]

"Never assume two screenshots are different because their hashes differ."

```
state_similarity = weighted( visual similarity,
                             UI-tree similarity,
                             OCR similarity,
                             URL / navigation state )
if state_similarity > threshold → same state
```

Prevents infinite exploration. Weights, threshold, and what "URL/navigation state" means on native apps (e.g. activity/view-controller identity) are **Not decided**. Handling of dynamic content (feeds, timers, carousels) that perturbs hashes is **Not decided**; the multi-signal design is the conversation's answer to it.

## Flow reconstruction (§26)

```
A → B   tap Search
B → C   type query
C → D   tap result
```

A flow is generated from the graph (`Flow`, `FlowNode`, `FlowEdge`). AI may label it (`SEARCHING`) via `flow-builder` + LLM/VLM, but transitions remain evidence-based ([17](17-ai-architecture.md)). How to choose "important flows" to record (§27 "for important flows") is **Not decided**. Flow types from the Feature List (signup, checkout, onboarding…) are classification targets via taxonomy.

## Controlled test states (§25)

`fresh_install, permissions_denied, permissions_allowed, logged_out, logged_in` — see [10](10-authentication-and-permission-workflows.md).

## Device profiles

`packages/device-profiles` holds device profiles (§2) and `DeviceProfile` is a core entity. Specific devices, OS versions, screen sizes, locale/orientation: **Not decided**.

## Platform and version handling (§28)

Use the app's real identifiers where available: `versionName`, `versionCode` (Android); `CFBundleShortVersionString`, `CFBundleVersion` (iOS). Stored in `ProductVersion` (`version, platform, release_identifier, captured_at`). Feeds app version history ([11](11-versioning-change-detection.md)). Handling the same product across platforms (linking iOS/Android/web `Product`s) is **Not decided**; the Feature List mentions platform switching on one product.

## Failure and reliability

Emulator/simulator/device crashes follow the disposable-worker + checkpoint pattern from [14](14-failure-recovery-and-reliability.md); specifics for device farms are **Not decided**.
