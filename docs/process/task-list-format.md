# Task List Format (Stage 3)

Part of the [Project Breakdown & Specification Protocol](project-breakdown-protocol.md), Stage 3. One task list per reviewed Part-Spec, saved as `docs/parts/tasks/<part-id>-tasks.md`. The spec is the **only** input: Stage 3 decomposes, it never decides.

## Rules

1. **No new decisions.** Every task traces to a section, rule (R-n), edge case (E-n), contract or table in the spec.
2. **Open questions.** Founder decisions F-47…F-64 (doc 20) settle 18 of them; treat those as decided. A task that depends on a question that is still open uses the spec's *suggested default* and carries the tag `[default OQ-x.y-n]`, so it can be changed later without hunting.
3. **Phase.** Only V0 work gets tasks. A forward-compatible hook the spec marks for V0 (a column, an enum value, an interface) gets one small task; later-phase behaviour gets none. List it under "Not in V0" at the end.
4. **Atomic.** Each task is something one person can finish and test in about half a day to two days. If it is bigger, split it.
5. **Order by dependency**, within the list and across Parts. A task names what it depends on, including tasks in other Parts' lists (e.g. `1.2-T03`).
6. **Every task has a check.** Name the test or fixture that proves it is done. For collection Parts, cite the 2.11 fixture ids where they exist (`hazard_sticky_header`, `chaos_kill_child`, …).

## File layout

```
# <part-id> <Part name>: Task List

Source: [<part-id> spec](../<spec file>) · decisions applied: F-xx, F-yy · status: draft

## Task groups (in build order)

### G1 <group name, e.g. Data model>
| ID | Task | Depends on | Check | Spec ref | Tags |
|---|---|---|---|---|---|
| <part-id>-T01 | <imperative one-line task> | — | <test or fixture> | §3.2, R4 | `[default OQ-…]` |

### G2 …

## Not in V0
- <hook or later-phase item>: <why it is deferred, spec ref>

## Open questions this list depends on
| OQ | Default used | Tasks affected |
|---|---|---|
```

Task groups usually follow the spec's own sections: data model and migrations, contracts and module skeleton, core behaviour, business rules and edge cases, CLI and admin hooks, observability, tests and fixtures. IDs are stable once published: new tasks take the next free number.
