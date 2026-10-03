# 10 — Authentication and Permission Workflows

Part of the [engineering docs](README.md). Prev: [09](09-ios-android-collection.md). Next: [11 Versioning](11-versioning-change-detection.md). Security context: [15](15-security-and-isolation.md).

Origin: the user asked "how it will crawl the authenticated platforms which almost all of the platforms websites are", then clarified: *"i am not building this crawling for users it is just for me to collect the data."* This is therefore an **operator workflow**, not a user-facing feature.

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

**"Never make the exploration engine responsible for bypassing authentication."** The engine detects the state and stops; humans supply access.

## Authorized session / test account

- Sources carry `authorization_status` (§5); source types include `AUTHORIZED_BUILD`; the entity list includes `Authorization` and `Policy` (§4).
- What the operator provides: an "authorized session/test account". Form (cookies/storage state vs. username+password), refresh handling, 2FA/OTP/CAPTCHA, SSO, and account provisioning per product: **Not decided**.
- Where operators enter credentials (admin UI vs. secret manager): **Not decided**; the boundary rule below applies.

## Credentials boundary (§52)

Credentials live only inside the crawler boundary ("CRAWLER VPC": browsers, devices, credentials, raw captures). **"Credentials never enter the normal frontend/API environment."** See [15](15-security-and-isolation.md).

## Permission states and controlled test states (§25)

Create controlled states and capture each where relevant:

| State | Yields |
|---|---|
| `fresh_install` | onboarding, first-run UX |
| `permissions_denied` | denied-permission UX |
| `permissions_allowed` | permission prompts, allowed UX |
| `logged_out` | pre-auth UX |
| `logged_in` | returning-user UX, empty states |

"Gives you: permission prompts, onboarding, empty states, first-run UX, returning-user UX." These apply mainly to mobile (`reset()` in [09](09-ios-android-collection.md)); applicability of `fresh_install`/permissions to web (e.g. cookie/notification prompts) is **Not decided**. How a captured state is labeled on the resulting `ProductVersion`/`Screen` (state tag vs. separate capture session) is **Not decided** ([12](12-data-model-and-events.md)).

## Dangerous-action policy (§23)

The exploration engine must recognize dangerous actions such as **Delete, Purchase, Send, Publish, Transfer, Logout, Subscribe, Pay**. "These should require explicit policy. Default: **DO NOT EXECUTE**." "Particularly important for authenticated apps."

- Risk is also a negative term in `action_score` ([09](09-ios-android-collection.md)), but the policy is a hard gate, not just a penalty. **Inferred.**
- Logout is listed as dangerous because it destroys the session.
- Detection method (button text, ARIA/role, taxonomy, VLM), the representation of "explicit policy" (per source? per action type?), and who can grant it: **Not decided**. `Policy` entity exists in the model.
- What happens when a high-value flow needs a dangerous step (e.g. checkout without paying): **Not decided**.

## Explicit execution restrictions (summary)

1. Never bypass authentication.
2. Never execute dangerous actions without explicit policy; default is not to.
3. Credentials stay in the crawler boundary.
4. Only collect from sources with an authorization status ([03](03-capture-and-crawling-workflow.md)).
5. Authenticated captures are sensitive raw evidence ([15](15-security-and-isolation.md)).

## Related entities and states

`Source.authorization_status`, `Authorization`, `Policy`, `TakedownRequest`, `CaptureJob.status = WAITING_FOR_AUTH` ([12](12-data-model-and-events.md)). Semantics of `TakedownRequest` (what is removed, from where) are **Not decided**.
