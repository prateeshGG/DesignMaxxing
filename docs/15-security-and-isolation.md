# 15 — Security and Isolation

Part of the [engineering docs](README.md). Prev: [14](14-failure-recovery-and-reliability.md). Next: [16 Admin and operations](16-admin-and-operations.md). Authentication workflow: [10](10-authentication-and-permission-workflows.md).

Because the product stores copies of third-party websites and apps (and, for authenticated captures, potentially personal data), security, privacy and legal handling were named as design work to do **before launch**, not after (PLAN§12–14, MB§64). Decisions are listed first; remaining gaps are marked.

## Explicit security decisions

1. **Crawler environment is the most sensitive environment** (§52): a separate boundary ("CRAWLER VPC") with browsers, devices, credentials and raw captures.
2. **Public ↔ crawler boundary**: no direct path from the public side into the crawler environment; the public frontend never directly accesses crawler credentials or raw authenticated sessions (GAP§28).

```
        PUBLIC
          │
          X
          │
  ┌───────────────┐
  │ CRAWLER VPC   │
  │ browsers      │
  │ devices       │
  │ credentials   │   (credential vault, session profiles,
  │ raw captures  │    raw capture storage)
  └───────────────┘
```

3. **Credentials never enter the normal frontend/API environment** (§52).
4. **No raw passwords in the crawler database**; prefer OAuth, session cookies, encrypted browser state, service accounts, official APIs (IF§9).
5. **The exploration engine never bypasses authentication**; CAPTCHA/MFA are human checkpoints ([10](10-authentication-and-permission-workflows.md)).
6. **Dangerous actions default to DO NOT EXECUTE** (§23).
7. **User-uploaded material is not mixed into the public dataset automatically** (§39).
8. **Immutable raw evidence** (§6); the unredacted original is kept only in a quarantined layer where retention is justified (GAP§3).
9. **Crawling is treated as untrusted-code execution** (PLAN§13, MB§61): `Internet → isolated browser sandbox → ephemeral container → restricted network → capture → destroy`. Never run crawled sites inside the same trusted environment as database, API credentials, billing or internal services.
10. **Captured data is classified by provenance and authorization** (`access_authorization`, `acquisition_method`, data class — [04](04-raw-evidence-and-storage.md)).

## PII detection and redaction (GAP§3) — `pii-service`

Screenshots can contain names, emails, phone numbers, addresses, profile photos, account balances, messages, order information, notification previews. Pipeline: `Capture → PII detection → Redaction → Storage`, with configurable rules (e.g. `[email] → █████`, `[phone]`, `[account number]`). Keep the original raw capture only in a tightly controlled / quarantined layer where there is a legitimate reason to retain it. Detection techniques, rule set, and whether redaction is applied to DOM/HTML/network metadata as well as pixels: **Not decided**.

## Secrets detection (GAP§4)

The same pipeline looks for API keys, tokens, JWTs, private URLs, credentials, environment values — in HTML, JavaScript, network logs, downloaded JSON and screenshots. **Never put discovered secrets into the searchable dataset.**

## Policy layer, takedown and removal (GAP§2)

Build a policy layer into the crawler (per-domain `crawl_allowed, media_allowed, authenticated_allowed, screenshot_allowed, recrawl_allowed, takedown_status` — [03](03-capture-and-crawling-workflow.md)) and an immediate **Remove source** operation. A legitimate removal request must propagate through: `website → pages → screenshots → assets → embeddings → search index → cached thumbnails → collections`. This defines `TakedownRequest` semantics (§4). Handling of raw evidence in COLD storage and backups on removal: **Not decided** (**Inferred:** raw evidence also removed or quarantined; backups' retention interplay unresolved).

## Credential isolation

Credentials only in the crawler boundary: **credential vault → session profiles → browser context** (GAP§5, IF§9). Each session profile has an owner, authorization scope, created/expires/last-verified timestamps and source. Vault product, rotation, and operator-submission path: **Not decided**. `packages/auth` is in the monorepo layout; whether it covers user auth, collector credentials, or both is **Not decided** (managed authentication was suggested for *product* users: MB§71).

## Authenticated collection security

Authenticated captures may contain personal or confidential data → PII/secrets pipeline above, session-profile controls, credentials boundary, authorization-scoped provenance. Whether any raw authenticated capture is ever exposed beyond the crawler boundary: **Not decided** (**Inferred:** no; only derived/CDN output crosses, after redaction).

## Raw capture security

Raw artifacts are the highest-sensitivity data store (COLD tier, [04](04-raw-evidence-and-storage.md)). Encryption at rest, access control, audit logging: PLAN§13 lists "encrypted storage, access control, audit logs, secret management" as needs; concrete design **Not decided**.

## SSRF and abuse controls (superseded premise, still useful)

For a **public-facing** crawler the Master Blueprint specified SSRF protection (block requests to localhost, 127.0.0.1, private IP ranges, metadata endpoints, internal services) and per-user/per-domain abuse controls (max concurrent crawls, pages/day, domains/day, asset size, crawl duration, browser CPU, storage; per-domain rate limit, concurrency, crawl delay) (MB§62–63, PLAN§14). Because crawling is internal, **per-user quotas are moot**, but: SSRF blocking remains sensible wherever seeds/redirects reach the crawler (**Inferred**), and per-domain rate/concurrency limits and asset-size caps remain relevant to the crawl policy engine ([03](03-capture-and-crawling-workflow.md)). Whether SSRF protection is built for an internal-only crawler: **Not decided**.

## Permissions and multi-tenancy (product side)

`Organization`/`User`/`Collection`/`CollectionMember`/`Comment` entities exist. PLAN§13 lists tenant isolation, API authentication and rate limiting for when users, teams, private collections and API keys exist; team workspaces, SSO, public collections are largely [Deferred] (§72). Authorization model and multi-tenancy design: **Not decided**.

## Legal and data policy (PLAN§12, MB§64)

To be designed before public launch: Terms of Service, Privacy Policy, acceptable-use policy, **crawler policy**, takedown mechanism, copyright-complaint (DMCA) mechanism, asset retention policy, user-upload policy, public/private dataset policy. Distinguish **metadata** from **third-party copyrighted assets** and decide what is retained and served. Topics: robots.txt, site terms, copyright of screenshots/cached assets, attribution, crawl frequency, authentication, personal information. **Should be reviewed by qualified counsel before public launch** (MB§64). The conversation sets no concrete positions on any of these; all **Not decided** (see [19](19-decisions-assumptions-open-questions.md)).

## Reference: how Mobbin handles third-party content (public statements)

*Evidence: excerpts of Mobbin's public Terms, Acceptable Use Policy and Copyright pages as returned by web search (October 2026). `mobbin.com` was blocked from this environment, so the full pages were **not read**; re-read them before relying on this.* This describes what Mobbin **says**, not what its legal basis is — that is **not stated** in what I could see.

| Topic | What Mobbin's public pages say |
|---|---|
| Ownership | The platform contains screenshots, recordings and metadata about **third parties' app interfaces and designs**; IP referenced in those images "belongs to their respective owners" |
| Takedown | Copyright policy with a **DMCA notice** process; on a notice it takes "whatever action it thinks is appropriate", which may include removing the content; **repeat infringers' accounts are disabled/terminated** |
| Restrictions on users | No transferring, aggregating, mirroring, caching, archiving or **re-hosting** content (including via scraping tools) elsewhere; no selling, licensing or exploiting content commercially |
| AI | The Acceptable Use Policy prohibits using automated tools/AI to create derivative works from platform content or to **train, test, index, benchmark or improve** AI/ML models |
| API/MCP | For personal/internal use; no resale; no creating competing services or building "a standalone content repository or service that substitutes for Mobbin" |
| Access model | Content is shown inside an account/paywall product (plans in the earlier conversation research); copy/download exists for paid users |
| Not found | Whether Mobbin has **licenses or permission** from app owners — the pages I saw rely on notice-and-takedown language and an ownership disclaimer, and do not say |

**What this means for us:** "Mobbin does it" is **not a legal defense** — we do not know their legal basis, jurisdiction, or agreements, and size does not prove permission. The *practices* worth mirroring are: a clear ownership disclaimer, a copyright/DMCA process, a repeat-infringer policy, terms that forbid re-hosting/scraping/AI training/competing repositories, and account-gated access. These are captured as decisions F-41…F-44 in [20](20-founder-decisions-and-plan-validation.md). Counsel still decides whether our plan is acceptable (E5).

**Also a rule for us:** Mobbin's terms forbid scraping and building a competing repository from its content, so **we never collect from Mobbin or other competitor design libraries** (F-41). The earlier competitor feature inventory used public marketing/help pages for research only.

## Data handling rules (stated)

- Raw evidence immutable; derived regenerable; raw vs. derived vs. AI-generated vs. human-verified are distinct classes.
- Uploads private by default relative to the public dataset.
- Credentials isolated; secrets and (redacted) PII never enter the searchable dataset.
- Low-quality captures do not enter the public dataset.
- Every derived attribute traceable to evidence, job, and model/version ([12](12-data-model-and-events.md)).
