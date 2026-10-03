# 10 — Authentication and Permission Workflows

Part of the [engineering docs](README.md). Prev: [09](09-ios-android-collection.md). Next: [11 Versioning](11-versioning-change-detection.md). Security context: [15](15-security-and-isolation.md).

Origin: the user asked "how it will crawl the authenticated platforms which almost all of the platforms websites are", then clarified: *"i am not building this crawling for users it is just for me to collect the data."* This is an **operator workflow**, not a user-facing feature.

## Evolution (what is current)

| Iteration | Model | Status |
|---|---|---|
| `AUTH` (first answer) | User-facing: the *user* logs in inside our controlled browser ("Connect authenticated website"); we never ask for passwords; importing a user's session was judged too risky for v1; platform/API integrations (GitHub, Shopify, WordPress, Webflow, Figma, Sanity) via a connector layer. Crawl statuses `PUBLIC, AUTH_REQUIRED, USER_AUTHORIZED, API_AUTHORIZED, BLOCKED, CAPTCHA_REQUIRED, MFA_REQUIRED, ROBOTS_RESTRICTED, CRAWL_ERROR` | **Superseded** (user-facing premise). The principle survives: authentication is an access mechanism, not something to defeat |
| `INT`, `IF§9`, `MOB§13`, `GAP§5` | **Internal**: we maintain *authorized site profiles* / session profiles for sites we are permitted to access | **Current** |
| `§24` | `LOGIN_REQUIRED` → `WAITING_FOR_AUTH` → operator provides an authorized session/test account → resume | **Final** |

## Login-required state and `WAITING_FOR_AUTH` (§24)

```
collector reaches LOGIN_REQUIRED
        │
        ▼
CaptureJob → WAITING_FOR_AUTH
        │
        ▼
operator provides an authorized session / test account
        │
        ▼
collector resumes
```

Session expiry follows the same path (INT): `Worker → AUTH_REQUIRED → human re-authentication → session restored → crawler resumes`. **"Never make the exploration engine responsible for bypassing authentication."** The engine detects the state and stops; humans supply access. CAPTCHA and MFA likewise become **explicit human checkpoints**, not something the system tries to defeat (INT, IF§9). Do not circumvent bot protection, access controls, DRM or app-store restrictions (MOB§2).

Pipeline reason codes alongside the job status (IF§4): `AUTH_REQUIRED, CAPTCHA_REQUIRED, BLOCKED, …` ([03](03-capture-and-crawling-workflow.md)). Whether these are `WAITING_FOR_AUTH` sub-reasons or separate states is **Not decided** (**Inferred:** `AUTH_REQUIRED` and `CAPTCHA_REQUIRED` map to `WAITING_FOR_AUTH`).

## Authorized session / test account — session profiles

Model (INT, IF§9, MOB§13, GAP§5):

```
Crawler Worker
    ├── Public profile (anonymous)
    ├── Site A authenticated profile
    ├── Site B authenticated profile
    └── Special test account
```

- A **credential vault** → **session profiles** → browser context (web) / app state (mobile).
- **Do not store raw passwords in the crawler database.** Prefer OAuth, session cookies, encrypted browser state, service accounts, official APIs, where legitimately available (IF§9).
- Each session profile records: `owner, authorization scope, created_at, expires_at, last_verified, source`; and the crawler should "know: I am authorized to access this site using this particular account" (GAP§5).
- For mobile, reuse an authenticated app state where technically possible; reaching something that needs a human (OTP, Google/Apple/phone login, onboarding) → `AUTH_REQUIRED` and the job pauses (MOB§13).
- Provenance records `access_authorization` and `acquisition_method` per capture ([04](04-raw-evidence-and-storage.md)). Per-domain policy flag `authenticated_allowed` ([03](03-capture-and-crawling-workflow.md)).

Still **Not decided**: vault technology, how operators enter secrets without exposing them to the API/admin front end, 2FA handling per product (beyond "human checkpoint"), test-account provisioning, whether session profiles are a first-class entity (`SessionProfile` appears in discussion but not in the §4 entity list — [12](12-data-model-and-events.md)).

## Credentials boundary (§52)

Credentials live only inside the crawler boundary ("CRAWLER VPC": browsers, devices, credentials, raw captures). **"Credentials never enter the normal frontend/API environment."** "The public frontend should never directly access crawler credentials or raw authenticated sessions" (GAP§28). See [15](15-security-and-isolation.md).

## What is not collected

Flows that require accounts, payment, email verification, CAPTCHA, geographic access or private data that we cannot legitimately satisfy are **marked inaccessible rather than circumvented** (AUTO). Forms: "detect structure; filling requires care" (AUTO).

## Permission states and controlled test states (§25, MOB§14)

Create controlled states and capture each where relevant:

| State | Yields |
|---|---|
| `fresh_install` | onboarding, first-run UX |
| `permissions_denied` | denied-permission UX |
| `permissions_allowed` | permission prompts, allowed UX |
| `logged_out` | pre-auth UX |
| `logged_in` | returning-user UX, empty states |
| *previously launched* (MOB§14 adds) | returning-user UX |

Permissions named: location, camera, microphone, notifications, contacts, photos, Bluetooth, tracking. Related mobile states worth capturing (GAP§17): first launch, returning user, expired session, no connection, permission denied. These apply mainly to mobile (`reset()` in [09](09-ios-android-collection.md)); applicability of fresh-install/permission states to web (cookie/notification prompts) is **Not decided**. How a captured state is labelled on the resulting `ProductVersion`/`Screen` (tag vs. separate capture session) is **Not decided** ([12](12-data-model-and-events.md)). Logged-in/logged-out is also recorded as capture provenance (RES§1).

## Dangerous-action policy (§23)

The exploration engine must recognize dangerous actions such as **Delete, Purchase, Send, Publish, Transfer, Logout, Subscribe, Pay**. "These should require explicit policy. Default: **DO NOT EXECUTE**." "Particularly important for authenticated apps."

- Risk is also a negative term in `action_score` ([09](09-ios-android-collection.md)), but the policy is a hard gate, not just a penalty (**Inferred**).
- Logout is listed because it destroys the session.
- Detection method (button text, ARIA/role, taxonomy, VLM), representation of "explicit policy" (per source? per action type?; the `Policy` entity exists) and who can grant it: **Not decided**.
- What happens when a high-value flow needs a dangerous step (e.g. checkout without paying): **Not decided**.

## Explicit execution restrictions (summary)

1. Never bypass authentication, CAPTCHA, MFA, bot protection, DRM, or app-store restrictions.
2. Never execute dangerous actions without explicit policy; default is not to.
3. Credentials stay in the crawler boundary; no raw passwords in the crawler database.
4. Only collect from sources with an authorization status and where the domain policy allows it ([03](03-capture-and-crawling-workflow.md)).
5. Authenticated captures are sensitive raw evidence; PII/secrets are detected and redacted ([15](15-security-and-isolation.md)).
6. Never put discovered secrets into the searchable dataset (GAP§4).

## Related entities and states

`Source.authorization_status`, `Authorization`, `Policy`, `TakedownRequest`, `CaptureJob.status = WAITING_FOR_AUTH` ([12](12-data-model-and-events.md)).
