# PMCC — Product Requirements Documents
### Prime Minister Contact Center
### Separate from the technical build guide — one PRD per module, for stakeholder review and sign-off

---

## How this document relates to the others

You now have three layers of documentation, each with a different audience and purpose:

| Document | Answers | Audience |
|---|---|---|
| **BRD** (your original upload) | What does the business/government need, broadly? | Stakeholders, business owners |
| **This document — PRDs** | What exactly will each module do, for whom, and what won't it do? With acceptance criteria. | Stakeholders (for sign-off), you, any future developer |
| **The build guide** | How does Antigravity actually build it — schema, prompts, verification steps | You, working hands-on with Antigravity |

Going forward, the intended order for each new module is: **PRD first (scope agreed, ideally reviewed by whoever owns the BRD) → then the build guide** (technical implementation). This document currently covers **Module 2 (Authentication & Roles)** and **Module 3 (Citizen Portal)**, written retroactively to match what was actually decided and built. Every future module's PRD gets added here before its build guide is written.

---

# PRD 1 — Authentication & Role-Based Access
### Corresponds to Module 2 in the build guide

## Problem Statement
PMCC requires that only authorized government staff — Admins and Focal Persons — can access internal complaint-handling functions, while citizens interact without needing an account. Without controlled, attributable access, sensitive citizen data (CNIC, complaint details) could be viewed by anyone with a link, there would be no accountability for who investigated or resolved a given complaint, and a Focal Person could potentially see complaints belonging to other departments.

## Goals
1. Every internal action (viewing, investigating, resolving a complaint) is attributable to a specific logged-in staff member.
2. Focal Persons can only access complaints belonging to their own department — enforced by the system, not just by convention.
3. A deactivated staff account is immediately locked out, even if the password is still correct.
4. Admin and Focal Person accounts are provisioned in a controlled way, with no public self-registration path.
5. Login failures (wrong password, deactivated account, wrong role) show clear, plain-language messages, not technical errors.

## Non-Goals
- **Citizen accounts/login** — citizens are tracked by CNIC + complaint number only, never an authenticated identity. *(Not required by the BRD; would add friction to filing a complaint.)*
- **Multi-factor authentication** — not required for v1. *(Adds complexity beyond the BRD's stated requirements; revisit if a security review calls for it.)*
- **A Focal Person covering more than one department** — confirmed out of scope; one FP = exactly one department. *(Confirmed directly with stakeholder.)*
- **Username as an alternative login field, alongside email** — email-only for v1. *(Simpler for an Admin-provisioned user base; reversible later if needed.)*

## User Stories
- As an **Admin**, I want to log in with my email and password so I can access system management functions.
- As a **Focal Person**, I want to log in with my email and password so I can view and act on complaints assigned to my department.
- As an **Admin**, I want a Focal Person account I deactivate to be immediately blocked from logging in, so former or suspended staff can't access the system.
- As a **Focal Person**, I want to reset my password if I forget it, without calling the Admin every time, so I can regain access quickly.
- As the **system**, every request to a department-scoped page must verify the requester's role and department, so no Focal Person can view another department's complaints, even by guessing a URL.

## Requirements

**P0 — Must-Have**
| Requirement | Acceptance Criteria |
|---|---|
| Email + password login for Admin and Focal Person | Given valid credentials for an active account, when the user submits the login form, then they're redirected to their role's dashboard. |
| Role-based route protection | Given a logged-in Focal Person, when they visit an `/admin` route directly by URL, then they receive a 403 Forbidden page, not the admin content. |
| Inactive account lockout at login | Given a user with `is_active = false` and a correct password, when they attempt to log in, then they see "This account has been deactivated. Contact your administrator." and are not logged in. |
| No public registration route | Given an unauthenticated visitor, when they navigate to any account-creation URL, then no such page exists. |
| Department-scoping policy for the Complaint model | A reusable authorization check exists returning true only if `complaint.department_id == focal_person.department_id`. (Not yet wired into screens — foundation for later modules.) |
| Seeded initial Admin account | One Admin account exists after setup, with a system-generated temporary password shown once. |

**P1 — Nice-to-Have**
- Password reset via email, without revealing whether a given email exists in the system.
- Clear, plain-language validation and error messages throughout — no raw framework error text ever shown to a user.

**P2 — Future Considerations**
- Multi-factor authentication for Admin accounts.
- Username-based login as an alternative to email.
- Focal Persons spanning multiple departments (would require converting `department_id` into a many-to-many relationship).

## Success Metrics
- **Leading**: 100% of role-restricted routes correctly reject wrong-role or logged-out access during manual testing (see build guide's verification checklist).
- **Leading**: 0 successful logins from deactivated accounts during testing.
- **Lagging**: 0 reported incidents, post-launch, of a Focal Person viewing another department's complaint data.

## Open Questions
- Should Admin accounts also have a deactivation path, or are they assumed permanent? *(stakeholder)*
- Does any AJK government IT security standard require a specific password complexity policy? *(legal/compliance)*

## Timeline Considerations
This module is a hard dependency for every subsequent staff-facing module — nothing role-gated (FP Portal, Admin Portal) can be built until this ships.

---

# PRD 2 — Citizen Portal (Bilingual)
### Corresponds to Module 3 in the build guide

## Problem Statement
Citizens across Azad Jammu & Kashmir need a way to file complaints about government services without creating an account, without being blocked by an English-only form, and without visiting an office in person. Without a low-friction, native-language public intake channel, complaints go unreported or get filed through slower, harder-to-track informal channels — undermining PMCC's core goal of centralized, auditable citizen grievance handling.

## Goals
1. A citizen can file a complete complaint (personal details, department/category, description, evidence) without any assistance or account creation.
2. The form defaults to Urdu — the language most AJK citizens are most comfortable reading — removing language as a barrier to filing.
3. Every submitted complaint receives a unique, memorable tracking number usable without logging in.
4. A citizen who doesn't know which department handles their issue can still submit successfully, routed to Admin for manual categorization.
5. A citizen's data can only be viewed by someone who already holds both their CNIC and complaint number — neither alone is enough.

## Non-Goals
- **Citizen accounts/login** — out of scope, matching PRD 1. *(Not required by the BRD; adds friction.)*
- **Call Center / Khuli Kachahry staff-assisted submission** — out of scope for this module. *(Different actor, different workflow — a staff member submitting on a citizen's behalf; better as its own module.)*
- **SMS/email status notifications to citizens** — out of scope for v1. *(No notification infrastructure exists yet; citizen must actively check the tracking page.)*
- **AI duplicate-detection at submission time** — out of scope here. *(Conceptually belongs to the Focal Person's clubbing workflow, built in Module 4.)*
- **Languages beyond Urdu and English** — out of scope. *(Not requested by stakeholder.)*

## User Stories
- As a **citizen**, I want the complaint form to load in Urdu by default, so I can read and understand it without needing English literacy.
- As an **English-literate citizen**, I want to switch the form to English if I prefer, so I can use the language I'm most comfortable with.
- As a **citizen**, I want to select my district and tehsil from a dropdown in my own language, so I don't need to know English place names.
- As a **citizen filing a complaint**, I want to attach photos or documents as evidence, so my complaint is better supported.
- As a **citizen who isn't sure which department handles my issue**, I want to select "Other" and still successfully submit, so unfamiliarity with government structure doesn't block me from filing.
- As a **citizen**, I want a clear tracking number after submitting, so I can check on my complaint later.
- As a **returning citizen**, I want the system to recognize me by my CNIC, so my details aren't duplicated or entered incorrectly a second time.
- As a **citizen**, I want to check my complaint's status using my CNIC and tracking number together, so I can see progress without needing an account.

## Requirements

**P0 — Must-Have**
| Requirement | Acceptance Criteria |
|---|---|
| Bilingual UI, Urdu default, English toggle, with RTL/LTR layout switching | Given a first-time visitor, when the page loads, then all text is in Urdu with a right-to-left layout; when the toggle is clicked, then everything switches to English, left-to-right. |
| Full submission form matching BRD fields | Each required field (name, CNIC, mobile, district, tehsil, subject, details) blocks submission with a clear message when empty or invalid. |
| CNIC-based citizen deduplication | Given a CNIC already in the `citizens` table, when a new complaint is submitted with that CNIC, then the existing citizen record is reused/updated, not duplicated. |
| "Other" department path | Given "Other" selected as department, when submitted, then `is_uncategorized = true` and `department_id`/`category_id` are left empty. |
| Auto-generated unique complaint number | Given a successful submission, then a complaint number in the format `PMCC-{year}-{6 digits}` is generated and shown on a confirmation screen. |
| Dual-factor tracking lookup (CNIC + complaint number, both required) | Given a mismatched or incorrect CNIC/number pair, then a single generic "not found" message is shown, without indicating which field was wrong. |
| Public tracking bar reflecting current stage | Given a valid lookup, the correct one of the three BRD-defined stages is visually highlighted. |
| Rate limit: one complaint per CNIC per 24 hours | Given a CNIC that has an existing complaint with `submitted_at` within the last 24 hours, when that CNIC attempts to submit a new complaint, then the submission is blocked and a clear message states when they may submit again (e.g. "You've already filed a complaint recently. You can file another after [time]."). |

**P1 — Nice-to-Have**
- Live character counter on the Details field.
- Drag-and-drop style attachment upload.
- Urdu translations for dynamic dropdown content beyond districts/tehsils (departments/categories, once real data exists from the Admin module).

**P2 — Future Considerations**
- SMS/email notifications on status change.
- Call Center / Khuli Kachahry assisted-submission flow.
- Additional languages beyond Urdu/English.

## Success Metrics
- **Leading**: % of started submissions that reach the confirmation screen (completion rate) — specific target to be set with stakeholder input once real usage data exists.
- **Leading**: % of sessions where the citizen never switches away from the Urdu default — validates the default-language choice.
- **Leading**: 0 duplicate citizen records created for repeat-CNIC submissions during testing.
- **Lagging**: % of complaints landing in the "Others" (uncategorized) queue — a persistently high rate may signal the department/category dropdown needs improvement.

## Open Questions
- What's an acceptable form-completion time target? *(stakeholder — no target set yet; not blocking further work)*
- Do the six lower-confidence Urdu tehsil name spellings (flagged in the build guide's Module 1 addendum) need formal sign-off before public launch? *(stakeholder)*

## Timeline Considerations
- Depends on Module 1 (schema, including the bilingual `name_ur` addendum). Does not strictly require Module 2 (auth), since this module has no login.
- Complaints landing in the "Others" queue aren't actionable by anyone until the Admin Portal module builds the actual queue screen — they'll be stored correctly, just not yet visible to staff.

---

## What's next

**PRD 3 — Focal Person Portal** (corresponding to Module 4), covering the FP dashboard, First Investigation, AI-assisted duplicate review, and action/resolution — written *before* that module's build guide, so we agree on scope up front rather than discovering gaps mid-build. Say the word when you're ready.
