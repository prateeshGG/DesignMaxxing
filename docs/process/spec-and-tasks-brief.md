# Brief: write a Part-Spec AND its task list for each assigned Part

Repo: /home/user/DesignMaxxing. You write documents only. No application code exists yet. Touch only the files named in your assignment, plus nothing else. Do not commit.

## Step 1: read
1. docs/process/project-breakdown-protocol.md (Stages 2 and 3).
2. docs/process/part-spec-prompt-template.md. The block between `=== BEGIN PROMPT ===` and `=== END PROMPT ===` is your instruction set for the spec: 8 sections in order, cite decision IDs, no invented decisions, undecided items become `OPEN QUESTION OQ-<part>-<n>` with a labelled suggested default, no task list inside the spec.
3. docs/process/task-list-format.md: the exact task-list format and rules.
4. docs/20-founder-decisions-and-plan-validation.md, especially F-xx rows F-01…F-65 and §10 ideas (ideas are not decisions).
5. docs/parts/review-wave-1.md, review-wave-2.md, review-wave-3.md: binding names.
6. docs/parts/tasks/README.md: the build order and the "Specs still needed" table.
7. The existing specs your Part touches (in docs/parts/), and their task lists in docs/parts/tasks/. They are frozen: use their table, column, enum, function, queue and event names exactly. Where they already promise something to your Part (search them for your Part id, e.g. "3.2"), honour it. If you need something they lack, write an OPEN QUESTION naming the owner.
8. Source docs for your Part (docs/01–23), Feature List (repo root), docs/parts/feature-coverage.md.

## Step 2: write the spec
Save as `docs/parts/<id>-<slug>.md`. First line `# <id> <Name> — Part-Spec (draft v1, for founder review)`, then a line linking ../21-parts-hierarchy.md, ../process/part-spec-prompt-template.md and the three review files. Then the 8 sections. Plain precise English; tables over prose. V0 only; later phases only as marked forward-compatible hooks.

Standing decisions to respect: F-45 and F-55 (everything runs on the founder's Windows PC before launch: Docker Desktop + WSL2, F-65), F-46 (a person chooses every site), F-47…F-64 (the founder accepted 18 defaults), F-18/F-44 (legal: attribution, takedown in 48 h, no logos as customers), "captured never means publishable" (2.10), deterministic code first and AI only where needed, solo founder: simple beats clever.

## Step 3: write the task list
Save as `docs/parts/tasks/<id>-tasks.md` in the format file's layout. Only V0 work; local-first path first, any "when the library goes online" work as a final labelled group. Every task has a check. Use real task ids from existing lists in docs/parts/tasks/ for cross-Part dependencies.

## Step 4: reply
For each Part: file paths, a 5-line summary, task count by group, new cross-Part names you defined, earlier names you relied on, and any place an existing spec looks wrong or is missing something your Part needs.
