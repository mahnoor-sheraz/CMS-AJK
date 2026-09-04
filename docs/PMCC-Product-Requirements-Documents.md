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
6. A citizen can document evidence in the moment (a photo or short video of the actual issue) without needing to already have a file saved on their device.
7. The form's length feels manageable rather than overwhelming, measurably improving how many citizens who start a submission actually finish it.
8. PMCC can eventually report on whether complaints are being filed, routed, and resolved equitably across genders — without ever forcing a citizen to disclose that information to file a complaint.

## Non-Goals
- **Citizen accounts/login** — out of scope, matching PRD 1. *(Not required by the BRD; adds friction.)*
- **Call Center / Khuli Kachahry staff-assisted submission** — out of scope for this module. *(Different actor, different workflow — a staff member submitting on a citizen's behalf; better as its own module.)*
- **SMS/email status notifications to citizens** — out of scope for v1. *(No notification infrastructure exists yet; citizen must actively check the tracking page.)*
- **AI duplicate-detection at submission time** — out of scope here. *(Conceptually belongs to the Focal Person's clubbing workflow, built in Module 4.)*
- **Languages beyond Urdu and English** — out of scope. *(Not requested by stakeholder.)*
- **Voice note recording for the complaint description** — explicitly deferred, not part of this pass. *(Raised and discussed, but intentionally skipped for now — it has real dependencies, particularly speech-to-text transcription so the AI duplicate-matching pipeline in Module 4 still has text to work with. Worth its own addendum later rather than folding in half-considered.)*
- **Mandatory gender collection** — the field exists but is never required; a citizen can always leave it unanswered and still submit. *(Collecting it does not justify blocking or slowing down a complaint.)*

## User Stories
- As a **citizen**, I want the complaint form to load in Urdu by default, so I can read and understand it without needing English literacy.
- As an **English-literate citizen**, I want to switch the form to English if I prefer, so I can use the language I'm most comfortable with.
- As a **citizen**, I want to select my district and tehsil from a dropdown in my own language, so I don't need to know English place names.
- As a **citizen filing a complaint**, I want to attach photos or documents as evidence, so my complaint is better supported.
- As a **citizen documenting an issue on the spot**, I want to take a photo or record a short video directly within the form, so I don't have to find and re-upload a file separately.
- As a **citizen who isn't sure which department handles my issue**, I want to select "Other" and still successfully submit, so unfamiliarity with government structure doesn't block me from filing.
- As a **citizen filling out a multi-part form**, I want to see which step I'm on and how many remain, so a long form feels manageable rather than overwhelming.
- As a **citizen**, I want a clear tracking number after submitting, so I can check on my complaint later.
- As a **returning citizen**, I want the system to recognize me by my CNIC, so my details aren't duplicated or entered incorrectly a second time.
- As a **citizen**, I want to check my complaint's status using my CNIC and tracking number together, so I can see progress without needing an account.
- As a **citizen**, I want the option to indicate my gender if I choose to, so government reporting can reflect whether service delivery is equitable, without ever being required to answer.

## Requirements

**P0 — Must-Have**
| Requirement | Acceptance Criteria |
|---|---|
| Bilingual UI, Urdu default, English toggle, with RTL/LTR layout switching | Given a first-time visitor, when the page loads, then all text is in Urdu with a right-to-left layout; when the toggle is clicked, then everything switches to English, left-to-right. |
| Full submission form matching BRD fields | Each required field (name, CNIC, mobile, district, tehsil, subject, details) blocks submission with a clear message when empty or invalid. |
| Multi-step form with a visible step indicator | The form is broken into distinct steps (Your Details, Location, Complaint, Attachments & Review), with a step indicator showing current position — visually and conceptually distinct from the public 3-stage tracking bar elsewhere in this module. |
| Optional gender field | The citizen may select Male / Female / Prefer not to say; submission succeeds identically whether or not this field is answered. |
| In-form photo/video capture | A citizen can open their device camera directly from the attachment step to take a photo or record a short video, without first saving it elsewhere; captured media counts toward the same 5-file/10MB-each attachment limit as uploaded files, and video recording is capped at approximately 60 seconds. |
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
- Allowing free navigation back to a previous step without losing already-entered data in later steps.

**P2 — Future Considerations**
- SMS/email notifications on status change.
- Call Center / Khuli Kachahry assisted-submission flow.
- Additional languages beyond Urdu/English.
- Voice note recording as a substitute for typed details, with speech-to-text transcription — deferred from this pass; a real, larger piece of work in its own right.

## Success Metrics
- **Leading**: % of started submissions that reach the confirmation screen (completion rate) — specific target to be set with stakeholder input once real usage data exists. The step-form redesign is the concrete lever aimed at moving this number; worth comparing before/after once both versions have real usage data.
- **Leading**: % of sessions where the citizen never switches away from the Urdu default — validates the default-language choice.
- **Leading**: % of submissions that include at least one in-form-captured photo/video vs. an uploaded file — indicates whether the native capture option is actually being used or citizens still prefer uploading existing files.
- **Leading**: % of submissions where gender is answered (opt-in rate) — not a target to maximize, just a signal of whether citizens trust providing it.
- **Leading**: 0 duplicate citizen records created for repeat-CNIC submissions during testing.
- **Lagging**: % of complaints landing in the "Others" (uncategorized) queue — a persistently high rate may signal the department/category dropdown needs improvement.

## Open Questions
- What's an acceptable form-completion time target? *(stakeholder — no target set yet; not blocking further work)*
- Do the six lower-confidence Urdu tehsil name spellings (flagged in the build guide's Module 1 addendum) need formal sign-off before public launch? *(stakeholder)*
- Should the gender field ever expand beyond three options, or is Male/Female/Prefer-not-to-say sufficient for this system's reporting needs? *(product/stakeholder)*
- When (not if) voice-note submission gets picked back up: does it need to support both Urdu and English speech recognition from day one, given the bilingual toggle already in place? *(deferred, but worth having front-of-mind for that future addendum)*

## Timeline Considerations
- Depends on Module 1 (schema, including the bilingual `name_ur` addendum, and now the `citizens.gender` addition). Does not strictly require Module 2 (auth), since this module has no login.
- Complaints landing in the "Others" queue aren't actionable by anyone until the Admin Portal module builds the actual queue screen — they'll be stored correctly, just not yet visible to staff.
- In-form camera/video capture depends on browser permission handling working reliably across the range of devices AJK citizens are likely using — worth explicit device/browser testing before launch, not just desktop-browser testing.

---

## What's next

**PRD 3 — Focal Person Portal** (corresponding to Module 4), covering the FP dashboard, First Investigation, AI-assisted duplicate review, and action/resolution — written *before* that module's build guide, so we agree on scope up front rather than discovering gaps mid-build. Say the word when you're ready.

---

# PRD 3 — Focal Person Portal
### Corresponds to Module 4 in the build guide

## Problem Statement
Once a complaint is submitted, someone at the responsible department needs a working queue to triage it, investigate it, and close it out — with every decision attributable, every duplicate-merge explicitly human-confirmed, and every citizen able to see accurate progress on their public tracker. Without this, complaints could sit unrouted indefinitely, get resolved inconsistently across departments, or have an AI silently merge two citizens' complaints without a human ever confirming they're actually the same issue.

## Goals
1. A Focal Person can see, at a glance, every complaint assigned to their department, with enough triage information (age, category, duplicate flags) to prioritize their work.
2. A Focal Person can classify a new complaint into exactly one of four clear paths (handle directly, club as duplicate, forward externally, schedule a field visit), each producing a correct, auditable database record.
3. AI-suggested duplicate matches are always reviewed and explicitly confirmed or dismissed by a human before two complaints are ever linked.
4. A resolved or rejected complaint's public-facing summary is written in plain, citizen-readable language, not internal jargon.
5. Resolving a complaint that has other complaints clubbed under it never silently resolves those children without explicit confirmation.
6. A Focal Person can delegate a field visit to a supervised field officer, with that assignment clearly attributable.
7. A Focal Person who believes a complaint belongs to a different department can request its reassignment, without unilaterally being able to move it there — that requires the receiving department's approval.

## Non-Goals
- **Masking citizen identity anywhere on FP screens** — explicitly out of scope; full name and CNIC are shown everywhere an FP works, including the dashboard queue. *(Confirmed decision: this is an internal staff tool, and an FP's job requires contacting/verifying the citizen — masking would hinder the job without a corresponding privacy benefit, unlike the public-facing tracker in Module 3.)*
- **A configurable, department-specific SLA policy** — out of scope for v1; a single fixed 15-day threshold is used system-wide. *(No SLA policy is defined in the BRD; a single sensible default avoids over-building a configuration UI nobody asked for yet.)*
- **Automatic (non-human-confirmed) duplicate clubbing** — explicitly and permanently out of scope, not just deferred. *(Core accountability principle for this system: AI suggests, a human decides.)*
- **A Director actually reviewing/approving reassignment requests** — this module builds the *request* side only (an FP submitting one); the approval screen belongs to Module 5, alongside Admin, since both are oversight roles rather than case-handling roles.
- **The routing logic that puts a complaint into an FP's queue in the first place** — out of scope; this module is the receiving end of routing, not the router. Routing (automatic department/category matching, and Admin's manual "Others" assignment) belongs to Module 5.

## User Stories
- As a **Focal Person**, I want to see only my own department's complaints, so I never have to sort through irrelevant work or risk seeing another department's data.
- As a **Focal Person**, I want to see how long a complaint has been open, so I can prioritize the ones at risk of running late.
- As a **Focal Person**, I want the system to suggest possible duplicate complaints, so I don't have to manually search past complaints to catch obvious repeats.
- As a **Focal Person**, I want to confirm or dismiss an AI-suggested duplicate myself, so I stay in control of a decision that affects a citizen's complaint record.
- As a **Focal Person**, I want a clear, limited set of classification choices for a new complaint, so I'm not guessing at how to categorize my decision.
- As a **Focal Person**, I want to log notes over time as I investigate (calls, visits, updates), so there's a complete record when I eventually resolve the complaint.
- As a **Focal Person**, I want to write a plain-language resolution summary, knowing the citizen will read exactly what I write, so I communicate clearly with the public.
- As a **Focal Person**, I want to be warned before resolving a complaint that has other complaints clubbed under it, so I don't accidentally close out cases I didn't mean to touch.
- As a **Focal Person**, I want to escalate a complaint to Admin when it's beyond my department's authority to resolve, so genuinely stuck cases don't sit in my queue indefinitely.
- As a **Focal Person**, I want to assign a field visit to one of my field officers instead of always doing it myself, so I can distribute fieldwork across my team.
- As a **Focal Person**, I want to request that a complaint be moved to a different department when I believe it doesn't belong with mine, so misrouted complaints don't sit stalled in my queue.
- As a **field officer**, I want to see only the field visits my supervising Focal Person has assigned to me, so my task list is relevant and not cluttered with cases I have no role in.

## Requirements

**P0 — Must-Have**
| Requirement | Acceptance Criteria |
|---|---|
| Department-scoped dashboard | Given two Focal Persons from different departments, when each views their dashboard, then each sees only their own department's complaints. |
| Full citizen identity everywhere on FP screens | Given any FP-facing screen (dashboard queue or First Investigation detail), then the citizen's full name and full CNIC are visible, with no masking. |
| AI duplicate suggestions, human-confirmed only | Given a complaint with a pending similarity match, when the FP clicks "Confirm as duplicate," then a confirmation modal explains the effect before any `complaint_clubs` record is created — no match is ever auto-confirmed. |
| Four-path classification, exactly one required | Given a complaint at the First Investigation stage, the FP must select exactly one of Handle Directly / Club with Existing / Forward Externally / Schedule Field Visit before the complaint proceeds, and the correct database records are created for whichever path is chosen. |
| Field visit delegation to a supervised officer | Given the Schedule Field Visit path, the FP may assign the visit to themselves or to a `field_officer` whose `supervisor_id` matches their own user ID; officers not under their supervision are never shown as options. |
| Resolution requires a plain-language summary | Given a Resolved or Rejected outcome, then a resolution summary of at least 100 characters is required before submission is allowed. |
| Clubbed-parent resolution requires explicit cascade confirmation | Given a complaint with one or more clubbed children, when the FP resolves or rejects it, then a confirmation modal states how many child complaints will also be resolved, and no child is updated without that confirmation. |
| Escalation path to Admin | Given a complaint the FP cannot resolve within department authority, when they select "Escalate to Admin," then the complaint's status reflects escalation without falsely advancing the public tracker to "Resolved." |
| Cross-department reassignment request | Given a complaint the FP believes belongs to a different department, they can submit a request naming the destination department and a reason; this creates a `pending` record but does **not** change the complaint's actual department until a Director approves it. |
| Every classification/resolution/reassignment action is logged | Given any classification, resolution, or reassignment-request action, then a corresponding audit row (`complaint_status_history` or `complaint_reassignment_requests`) is written with the acting user's identity and timestamp. |

**P1 — Nice-to-Have**
- Days-Open visual flag (red) once a complaint exceeds the 15-day default threshold.
- "Has duplicate suggestion" and "has pending reassignment request" filters/indicators on the dashboard.
- Free-form progress notes addable to a complaint at any point during investigation, independent of the four formal classification paths.
- Visibility, for the requesting FP, into the status (pending/approved/rejected) and any review notes on their own submitted reassignment requests.

**P2 — Future Considerations**
- Configurable, per-department SLA thresholds.
- A dedicated field-officer login/task view (this module gives FPs the ability to *assign* to a field officer; a field officer's own view of their assigned visits is not yet built).
- Allowing the *source* department's Director, rather than the destination's, to approve reassignment — currently defaulted to destination-approves (see Open Questions).

## Success Metrics
- **Leading**: % of AI-suggested duplicates that get explicitly confirmed or dismissed (not left permanently pending) — indicates FPs are actually engaging with the suggestion panel rather than ignoring it.
- **Leading**: 0 instances of a clubbed child complaint being resolved without its parent's cascade confirmation being triggered, during testing.
- **Leading**: 0 instances of a Focal Person's dashboard showing another department's complaint, during testing.
- **Leading**: 0 instances of a field officer appearing as an assignable option for an FP who doesn't supervise them, during testing.
- **Lagging**: median Days Open at resolution, once real usage data exists — establishes whether the 15-day default threshold is realistic or needs adjusting.
- **Lagging**: % of reassignment requests approved vs. rejected, once Module 5's approval screen exists — a high rejection rate might indicate FPs are misusing the request as a way to offload work rather than genuinely misrouted complaints.

## Open Questions
- **Which department's Director approves a reassignment request — source or destination?** Defaulted to the *destination* department (they're gaining the complaint, so their sign-off gates new work landing on them), but this is a real policy call, not a technical one. *(stakeholder — confirm before Module 5 builds the approval screen)*
- Is a fixed system-wide 15-day SLA threshold acceptable, or do different complaint categories realistically need different timeframes (e.g. an infrastructure complaint vs. a documentation request)? *(stakeholder)*
- Should there be any limit on how many complaints can be clubbed under a single parent, or any review step if that number gets unusually large? *(engineering — not currently addressed)*
- Does a field officer need their own login and task view in a near-term future phase, or is FP-mediated visibility (the FP checks visit outcomes themselves) sufficient indefinitely? *(product — affects whether P2's "dedicated field-officer view" should be prioritized sooner)*

## Timeline Considerations
- Hard dependency on Module 1 (schema — including the `investigation_type` and `resolution_status` corrections made when reconciling this module's design), and Module 2 (auth/department-scoping policy, now also the source of the new `director`/`field_officer` roles).
- The AI duplicate-suggestion panel (Section B) depends on complaint embeddings actually being generated — this is the first module where that AI integration gets wired up and tested end-to-end, so budget extra review time here specifically.
- The reassignment-request **approval** screen (for Directors) and initial complaint routing are explicitly deferred to Module 5 — that module cannot be considered complete until those two pieces exist, since this module assumes they'll be built there.

---

# PRD 4 — Admin, Super Admin & Director Portal
### Corresponds to Module 5 in the build guide

## Problem Statement
Once complaints are flowing through departments (Modules 3–4), the system needs a top-level oversight layer: someone to route complaints citizens couldn't categorize themselves, manage the reference data (departments, categories, accounts) everything else depends on, and approve cross-department reassignment requests. It also needs a control point above that: PITB, as the technical authority behind PMCC, retaining ultimate control over who holds Admin-level access — so a single Admin account is never the top of the privilege chain with no check above it.

## Goals
1. Every "Other" (uncategorized) complaint gets manually routed to the correct department/category by Admin, with a mandatory remark explaining the decision.
2. Admin has a searchable, filterable, sortable, system-wide view of every complaint in PMCC, matching the BRD's specified filter fields.
3. Admin can manage the structural reference data the rest of the system depends on — Departments, Sub-departments, Categories, Forward Destinations — without needing a developer or a database migration.
4. Admin can create and manage Focal Person and Director accounts, using the account-provisioning mechanism Module 2 already built.
5. A Director can review and act on (approve/reject) cross-department reassignment requests submitted by FPs in Module 4, with a required note on rejection.
6. Super Admin (PITB) can create, deactivate, and manage Admin accounts — a capability no one else in the system has.
7. Super Admin has full visibility into everything Admin can see, without a separate, parallel set of screens — same views, with account-provisioning-for-Admin layered on top.

## Non-Goals
- **A functionally distinct Super Admin dashboard** — out of scope; per your confirmation, Super Admin sees everything Admin sees. The only additive capability is Admin account management, not a parallel UI. *(Avoids building and maintaining two mostly-identical interfaces.)*
- **FP, Director, or Admin self-service account creation** — out of scope; consistent with Module 2's "no public registration" principle extended all the way up the hierarchy. Every account is created by the role one level above it.
- **The external API bridge to departmental systems** — still out of scope. `complaint_external_forwards` and any Super Admin-facing system configuration screens are the hook points for it, not the integration itself.
- **Bulk/batch operations on complaints** (e.g. mass-reassigning many complaints at once) — out of scope for v1; every action in this module operates on one complaint or one account at a time, so every action stays individually auditable.
- **Source-department-approves as an alternative reassignment model** — not built; per Module 4's PRD, the destination department's Director approves. Still flagged as genuinely open with you, not finally settled.
- **Within-department reassignment** (an Admin moving a complaint between two FPs in the same department) — still deferred, unresolved from Module 4's PRD; not built here either unless you tell me otherwise.

## User Stories
- As **Admin**, I want to see a queue of "Other" (uncategorized) complaints, so I can route them to the correct department.
- As **Admin**, when I route an "Other" complaint, I want to be required to leave a remark, so there's a record of my reasoning.
- As **Admin**, I want a searchable/filterable table of every complaint in the system, so I can answer system-wide status questions without going department by department.
- As **Admin**, I want to create, edit, and deactivate Focal Person accounts, so I can manage staffing without needing a developer.
- As **Admin**, I want to create, edit, and deactivate Director accounts, for the same reason.
- As **Admin**, I want to manage the list of Departments, Sub-departments, and Categories, so the dropdowns citizens and FPs see stay accurate as government structure changes.
- As **Admin**, I want to manage the list of Forward Destinations, so new external routing options can be added without a schema change.
- As a **Director**, I want to see pending reassignment requests for my department, so I can act on them promptly.
- As a **Director**, when I reject a reassignment request, I want to be required to leave a note explaining why, so the requesting FP understands the decision.
- As **Super Admin**, I want to create and deactivate Admin accounts, so PITB retains ultimate control over who has operational access to the system.
- As **Super Admin**, I want to see everything an Admin sees, so I can audit or step in if needed without a separate restricted view.

## Requirements

**P0 — Must-Have**
| Requirement | Acceptance Criteria |
|---|---|
| "Others" queue with mandatory remark | Given a complaint with `is_uncategorized = true`, when Admin assigns department/sub-department/category, then `admin_assigned_by` and a required, non-empty `admin_remarks` are saved, and the complaint leaves the Others queue. |
| Centralized complaints table, BRD filters | The table is filterable/sortable by complaint ID, citizen CNIC, channel, district, tehsil, department, sub-department, category, submission date, and current stage. |
| Department / sub-department / category management | Admin can create, edit, and deactivate (soft, via `is_active`) each; deactivated items disappear from citizen/FP dropdowns going forward, but historical complaints referencing them are untouched (schema already enforces restrict-on-delete, so hard delete isn't offered anywhere). |
| Forward destination management | Same create/edit/deactivate pattern as above, for `forward_destinations`. |
| FP and Director account management | Admin can create an account (name, email, role, exactly one department), with a system-generated temporary password shown once; can deactivate/reactivate an existing account, immediately affecting login per Module 2's `is_active` check. |
| Director reassignment approval | A Director sees only `pending` `complaint_reassignment_requests` where `to_department_id` matches their own department. Approving sets `status = approved`, updates the complaint's `department_id` to `to_department_id`, clears `assigned_fp_id` (lands unassigned in the new department's queue), and writes a `complaint_status_history` row. Rejecting requires a non-empty `review_notes` value, sets `status = rejected`, and leaves the complaint's department/FP untouched. |
| Super Admin manages Admin accounts | Super Admin can create/deactivate accounts with `role = admin`, using the same mechanism as Admin→FP/Director. |
| Super Admin shares every Admin view | A Super Admin login can access every screen Admin can access, with no separate or restricted version. |

**P1 — Nice-to-Have**
- An audit-trail view surfacing `complaint_status_history`, `admin_remarks`, and reassignment decisions together, for oversight review.
- CSV export of the centralized complaints table, for offline reporting.

**P2 — Future Considerations**
- Bulk/batch complaint operations.
- A distinct Super Admin analytics/system-health view beyond what Admin sees.
- A two-person approval rule for Super Admin's own account-creation actions, if a future security review calls for it.

## Success Metrics
- **Leading**: average time an "Other" complaint sits unrouted before Admin acts — specific target TBD with stakeholder input.
- **Leading**: 0 instances of a Director seeing or acting on a reassignment request for a department they don't direct, during testing.
- **Leading**: 0 instances of an FP, Director, or Admin account existing without a corresponding creator action logged (Admin creates FP/Director; Super Admin creates Admin).
- **Lagging**: % of reassignment requests approved vs. rejected (carried over from Module 4's PRD, now measurable once this screen exists).

## Open Questions
- Should deactivating a department/category warn if complaints are still actively using it, or is silent deactivation (it simply stops appearing in new dropdowns) acceptable? *(product)*
- Does Admin need a way to reassign a complaint between two FPs *within* the same department — the original Module 4 design doc's idea — or does that stay genuinely out of scope? *(stakeholder — still unresolved from Module 4's PRD)*
- Should Super Admin's account-creation actions for Admin require any additional approval step (e.g. a two-person rule), given this sits at the top of the privilege hierarchy? *(security/compliance)*

## Timeline Considerations
- Hard dependency on Modules 1–4 — the reassignment approval screen specifically depends on Module 4's Prompt 5 (request submission) already existing and working.
- This is the last of the three portals originally scoped in the BRD. Once it ships, the core system is functionally complete end-to-end; the external API bridge to departmental systems remains the one explicitly deferred major piece beyond it.

---

## What's next

Once you've reviewed this PRD and flagged anything you'd change, the Module 5 build guide (Part F) is next — covering the schema addition for `super_admin`, and staged Antigravity prompts for the complaints table, Others queue, account/reference-data management, and the Director approval screen. Say the word when you're ready.
