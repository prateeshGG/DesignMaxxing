# Project Breakdown & Specification Protocol

This is the workflow we worked out for taking a project too big to spec in one pass, and breaking it down step by step into pieces small enough that an AI can document each one accurately — without hallucinating detail that was never actually decided.

It runs in **three stages**, each one narrower and more detailed than the last. You never skip a stage, and you never do more than one unit of a stage at a time.

---

## Stage 1 — Decompose the Project into Groups → Parts

**Goal:** produce an ordered, hierarchical *list* of every distinct part of the project. Names and one-line descriptions only — no elaboration yet.

**Process:**
1. Split the whole project into a small number of major **Groups**. The best axis for this is dependency layer, not "backend vs frontend" — e.g. Foundations → Core Backend Logic → each Client Surface → Supporting/Intelligence Systems. This avoids the same concept (like checkout) getting split awkwardly across unrelated groups.
2. Within each Group, divide further into **Parts** — the most atomic *feature area* that could eventually become its own build tasks. Deliberately stop **one level above** that atomic-task level. Stopping short here is what prevents the AI from inventing fake detail before the overall shape of the system is even agreed.
3. Order everything by dependency: whatever must exist first goes at the top, both across Groups and within each Group's Parts.
4. Output: Group name → Part name + one-line description. Nothing else — no schemas, no endpoints, no task lists yet.

**Right-sizing rule of thumb:** if you can't picture writing one focused document about a Part without it sprawling into several unrelated topics, split it further. If it's so small it's basically already a single task, merge it up into its neighbor.

---

## Stage 2 — Generate a Full Specification per Part

**Goal:** turn one named Part into a complete, tightly-scoped specification document. One Part at a time — never more.

**Process:**
1. Use a fixed **Part-Spec Prompt Template** for every Part. The template embeds:
   - The full project context and every architecture decision already made, so nothing gets reinvented differently between parts.
   - The complete Group → Part hierarchy from Stage 1, so dependencies stay consistent and the AI knows what's out of scope.
   - A fixed output structure: **Purpose & Scope · Dependencies · Data Model · API Surface · Business Rules & Edge Cases · UI/UX Flow · Non-Functional Notes · Open Questions & Assumptions.**
   - An explicit instruction that anything undecided gets flagged as an `OPEN QUESTION` rather than guessed at.
2. The only thing that changes between uses of the template is the name of the target Part, filled into the "PART TO EXPAND" placeholder.
3. Generate one Part's spec per message (a fresh conversation is fine — the template carries all needed context with it). Review it before moving to the next Part.

This is what keeps the AI from drifting: it only ever holds one Part's worth of detail in its head at a time, against a backdrop that doesn't change from Part to Part.

---

## Stage 3 — Break the Completed Spec into Tasks

**Goal:** once a Part's spec document exists and has been reviewed, divide *that document* into an ordered, hierarchical list of build tasks — this time going all the way down to atomic, directly-executable tasks. Unlike Stage 1, there's no "stop one level early" rule here, because tasks are the terminal unit — there's nothing smaller left to protect against.

**Process:**
1. Take the completed Part-Spec document as the sole input — no new decisions get introduced at this stage, only decomposition of what's already written.
2. Apply the same dividing method as Stage 1: split into **Task Groups** first (a natural starting point is the spec's own sections — e.g. Data Model tasks, API tasks, Business-rule/edge-case handling tasks, UI tasks), then divide each Task Group into individual atomic **Tasks**.
3. Order by dependency, same rule as always: what must be built first goes first.
4. Output at this stage is a list too: Task Group → Task name + one-line description. Not full build instructions yet.
5. If a specific task turns out to be complex enough that it genuinely needs its own detailed brief before building (not just a one-liner), that's the signal to write a focused **Task-Spec** for that single task — following the same "fixed template, one unit at a time" pattern as Stage 2. This template doesn't exist yet; it can be built the same way the Part-Spec template was, whenever a task needs it.

---

## Why this works

Each stage only ever asks the AI to do one narrow thing against a fixed backdrop of everything decided so far:

- **Stage 1** — name things and order them. No invented detail.
- **Stage 2** — detail one named thing, against a frozen set of architecture decisions, so there's no drift between parts.
- **Stage 3** — mechanically decompose a document that already exists and was already reviewed. No new decisions, just breaking existing content into executable units.

The AI is always working from something that already exists — a name, or a written spec — rather than being asked to invent an entire layer of detail in one leap. That's the actual anti-hallucination mechanism here, not any particular prompt wording.

---

## Artifacts this protocol produces, in order

1. **Parts Hierarchy** — the Stage 1 output (Groups → Parts, ordered by dependency). → [`../21-parts-hierarchy.md`](../21-parts-hierarchy.md)
2. **Part-Spec Prompt Template** — reusable prompt for Stage 2, one file, reused for every Part. *(Not yet built.)*
3. **Part-Spec Documents** — one per Part, generated by (2).
4. **Task Lists** — one per Part-Spec, produced by Stage 3.
5. **Task-Spec Prompt Template** *(not yet built)* — for the rare task complex enough to need its own detailed brief before building.
