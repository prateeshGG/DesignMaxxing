# 15 — Security and Isolation

Part of the [engineering docs](README.md). Prev: [14](14-failure-recovery-and-reliability.md). Next: [16 Admin and operations](16-admin-and-operations.md). Authentication workflow: [10](10-authentication-and-permission-workflows.md).

The conversation makes few explicit security decisions. They are listed first; everything else is marked.

## Explicit security decisions

1. **Crawler environment is the most sensitive environment** (§52). It is a separate boundary ("CRAWLER VPC") containing browsers, devices, credentials and raw captures.
2. **Public ↔ crawler boundary**: no direct path from the public side into the crawler environment.

```
        PUBLIC
          │
          X
          │
  ┌───────────────┐
  │ CRAWLER VPC   │
  │ browsers      │
  │ devices       │
  │ credentials   │
  │ raw captures  │
  └───────────────┘
```

3. **Credentials never enter the normal frontend/API environment** (§52).
4. **The exploration engine never bypasses authentication**; humans provide an authorized session/test account ([10](10-authentication-and-permission-workflows.md)).
5. **Dangerous actions default to DO NOT EXECUTE** (§23).
6. **User-uploaded material is not mixed into the public dataset automatically** (§39).
7. **Immutable raw evidence** (§6) — integrity of the evidence store is also a data-handling property ([04](04-raw-evidence-and-storage.md)).
8. **Authorized collection**: `Source.authorization_status`, `Authorization` and `Policy` entities, and the `AUTHORIZED_BUILD` source type indicate collection is gated by authorization ([03](03-capture-and-crawling-workflow.md)).

## Crawler environment

Browsers, devices (simulator/emulator/authorized device), credentials and raw captures live inside the boundary. Network egress rules, sandboxing of browsers (they execute untrusted third-party JavaScript), per-job isolation, and device cleanup between runs: **Not decided**. (Disposable browser workers, [14](14-failure-recovery-and-reliability.md), help isolation; **Inferred**.)

## Credential isolation

Credentials only in the crawler boundary; the API, frontend and admin product surface never receive them. Secret storage (vault/secret manager), rotation, how operators submit credentials without exposing them to the API: **Not decided**. `packages/auth` exists in the monorepo layout, but its scope (user auth vs. collector credentials) is **Not decided**.

## Authenticated collection security

Authenticated captures may contain personal or confidential data. The model includes a `pii-service` (§2) and a `TakedownRequest` entity (§4), but the conversation does not define:

- what PII is detected or redacted, and when (pre-storage vs. before exposure),
- whether raw captures from authenticated sessions are ever exposed beyond the crawler boundary,
- takedown handling flow (what is removed: derived data, raw evidence, index entries).

All **Not decided**. **Inferred:** only derived/CDN output crosses to the product side ([04](04-raw-evidence-and-storage.md)), and `pii-service` runs between capture and exposure.

## Raw capture security

Raw artifacts are the highest-sensitivity data store (COLD tier) ([04](04-raw-evidence-and-storage.md)). Encryption at rest, access control, audit logging: **Not decided**.

## Permissions (product side)

`Collection`/`CollectionMember`/`Comment` and `Organization`/`User` entities exist, and the Feature List describes permissions/sharing. Team workspaces, SSO, and public collections are largely [Deferred] (§72). Authorization model for the product: **Not decided**.

## Data handling rules (stated)

- Raw evidence immutable; derived regenerable.
- Uploads private by default relative to the public dataset.
- Credentials isolated.
- Every cost/derived attribute traceable to evidence and job ([12](12-data-model-and-events.md)).

## Not discussed

Legal/compliance posture on collecting third-party sites and apps (terms of service, robots handling, copyright of captured content, licensing for public display) — **Not decided**. The user stated the crawler is for their own data collection to power the platform; nothing further is established. The `crawl_policy` and `TakedownRequest` mechanisms exist as placeholders. This is flagged as an open question in [19](19-decisions-assumptions-open-questions.md).
