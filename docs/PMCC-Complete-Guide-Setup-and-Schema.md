# PMCC Development Guide
### Prime Minister Contact Center
### Complete guide — Part A: Environment Setup · Part B: Database Schema (Module 1) · Part C: Authentication & Roles (Module 2) · Part D: Citizen Portal (Module 3, bilingual) · Part E: Focal Person Portal (Module 4)
### For Azad Jammu & Kashmir (AJK) — built prompt-only, no Terminal, on Mac

> **Branding note:** The original BRD document (and this guide, up to this point) referred to this system as "CMCC." The official name going forward is **PMCC — Prime Minister Contact Center**. This has been updated throughout the guide, including the complaint number prefix. If your GitHub repo is still named something like `cmcc-system`, that's fine to leave as-is — it's just an internal folder/repo identifier, not something citizens ever see — but you're welcome to rename it in GitHub's repo settings if you'd like it to match.

---

# Part A — Environment Setup

*(This is your one-time setup. If you already completed this earlier, skip to Part B.)*

## Before you start: what each tool actually does

| Tool | What it is | Why you need it |
|---|---|---|
| **Antigravity** | Google's AI coding app. You type what you want in plain English, and it writes/tests the code for you. | This is where you'll spend 90% of your time — it's your "developer." |
| **GitHub** | An online backup + history system for your code (a website, github.com). | Keeps your code safe, versioned, and lets you (or others) access it from anywhere. |
| **Laravel Herd** | A free Mac app that quietly installs PHP, Composer, and Node.js and runs your website locally — no setup screens, no Terminal. | Laravel (PHP) and React (Node) both need these "engines" installed to run. |
| **DBngin** | A free Mac app with an on/off switch for a real MySQL database. | Your app needs a database to store data — this gives you one with zero typing. |
| **Laravel** | The backend framework (handles data, logic, security). | This is the "engine room" of your app. |
| **React** | The frontend framework (handles what the user sees/clicks). | This is the "shop window" of your app. |

**The overall flow:** GitHub (empty project box) → Antigravity (your AI builder, connected to that box) → Herd + DBngin (the local engine + database running quietly in the background) → you type prompts → Antigravity writes Laravel + React code → it saves ("commits") that code back to GitHub with a few clicks.

You will **never open the black Terminal window** in this guide. Every step is either a website click, an app click, or a prompt you type to Antigravity's AI agent.

## A1 — Create your GitHub account and an empty project

1. Go to **https://github.com**, click **Sign up**, and create your account (email, password, username, verify email).
2. Click the **+** icon (top-right) → **New repository**.
3. Name it, e.g. `cmcc-system`. Choose **Private**.
4. Tick **Add a README file**.
5. Under **Add .gitignore**, choose **Laravel** from the dropdown.
6. Click **Create repository**.
7. On the repo page, click **Code** → **HTTPS** tab → copy the URL (e.g. `https://github.com/yourname/cmcc-system.git`). Save it somewhere temporary — you'll need it in A4.

## A2 — Install Antigravity on your Mac

1. Go to **https://antigravity.google**, click **Download**, choose **macOS**.
2. Open the downloaded file, drag **Antigravity** into **Applications**, then open it.
3. If macOS warns it was downloaded from the internet, click **Open** to confirm.
4. Sign in with your **Google account**.
5. In **Settings → Accounts** (or **Source Control**), click **Sign in with GitHub** and authorize it in the browser window that opens.

This link lets Antigravity's Source Control panel push/pull to GitHub with buttons — no typed git commands.

## A3 — Install the two local helper apps

**Laravel Herd** (gives you PHP, Composer, Node/npm automatically):
1. Go to **https://herd.laravel.com**, download for macOS, drag to **Applications**, open it.
2. Let its guided setup finish (progress bar, no typing needed). You'll see a Herd icon in the menu bar once it's running.

**DBngin** (gives you a MySQL database with an on/off switch):
1. Go to **https://dbngin.com**, download, drag to **Applications**, open it.
2. Click **+ Add Database** → **MySQL** → latest version → keep port `3306` → **Create**.
3. Toggle it **on** (green light).
4. Save these connection details somewhere:
   - Host: `127.0.0.1`
   - Port: `3306`
   - Username: `root`
   - Password: *(blank/empty)*

Both apps can stay running in the background from now on.

## A4 — Bring your GitHub project into Antigravity

1. In Antigravity, find **Clone Repository** (welcome screen, Source Control sidebar, or command search).
2. Paste the GitHub URL from A1.
3. Save it into a folder Herd can see — e.g. a new `Sites` folder in your Home folder.
4. Click **Clone**. Your empty project (README + .gitignore) opens in Antigravity.

## A5 — Scaffold the base Laravel + React project

In Antigravity's main prompt/chat box, type:

> "Set up a new Laravel project in this folder, using Laravel Breeze with a React + Inertia frontend (not plain Blade). Use Composer and npm to install everything. Once installed, confirm the project runs locally before doing anything else."

Review the plan Antigravity proposes and approve it. Once it's done, you have a working, empty Laravel + React app — ready for Part B.

---

# Part B — Module 1: Database Schema & Models (Revised)

## What changed in this revision, and why

Three things happened since the first version of this module: I cross-checked my own design as an architect would, you confirmed this system is for **Azad Jammu & Kashmir (AJK)**, not Punjab, and you asked for **AI-assisted duplicate detection** in the clubbing module. This version folds all three in. If you already ran the original prompt from the first Module 1 guide, don't worry — just run the new prompt below; Antigravity will add what's missing rather than starting over.

**Fixes from the architect cross-check:**
- One authoritative place decides a complaint's status (`complaint_actions`), instead of three tables that could disagree.
- A complaint can't be clubbed twice, or club to itself.
- `complaint_number` is now generated safely (from the database's own auto-increment ID, which is race-condition-proof, rather than a manual counter).
- `district_id`/`tehsil_id` are captured directly on the complaint at submission time, instead of always being looked up live from the citizen (so the Admin table can filter/sort fast, and a complaint's location stays historically accurate even if the citizen moves later).
- Every foreign key pointing at complaint history is set to **restrict** deletion — nothing can silently vanish a complaint's records.
- Reassignments are now logged (`complaint_assignments`), not just silently overwritten.
- `channel` and forward `destination` became small lookup tables instead of fixed enums, so new intake channels or forwarding destinations can be added later without a schema change — consistent with how `departments` already works.
- One Focal Person = one department, confirmed — no change needed there.

**AJK correction:**
- `districts`/`tehsils` are now seeded with AJK's actual administrative divisions (10 districts, 32 tehsils across 3 divisions), not Punjab's.
- **Flag for you to confirm:** the BRD lists "Punjab Services Tribunal" as a forward destination — this looks like a leftover from a Punjab-based template. AJK's equivalent is the **AJK Service Tribunal**. I've used the AJK name in the schema below; let me know if that's wrong.

**AI-assisted clubbing:**
- Every complaint gets a stored AI **embedding** (a numeric fingerprint of its subject + details text).
- A new `complaint_similarity_matches` table holds AI-suggested duplicate pairs with a similarity score.
- This is a **suggestion system, not an auto-merge system** — the Focal Person always reviews and confirms before two complaints are actually clubbed. This matters for a government system: an AI shouldn't be the one deciding a citizen's complaint was "just a duplicate" without a human sign-off.

---

## The full, revised table list

### Reference / lookup tables

**1. `districts`** — AJK's 10 districts.
- `id`, `name`

**2. `tehsils`** — AJK's 32 tehsils across 3 divisions.
- `id`, `district_id` (FK), `name`

**3. `departments`**
- `id`, `name`, `code`, `display_order`, `is_active`

**4. `sub_departments`**
- `id`, `department_id` (FK), `name`, `is_active`

**5. `categories`** — self-referencing for main/sub-category (two levels only, enforced by the app).
- `id`, `department_id` (FK), `parent_category_id` (FK, nullable), `name`, `is_active`

**6. `channels`** *(new — was an enum, now a lookup table)*
- `id`, `name` (Web, Mobile App, Call Center, Khuli Kachahry), `is_active`

**7. `forward_destinations`** *(new — was an enum, now a lookup table)*
- `id`, `name` (Federal, AJK Service Tribunal *[confirm this — see flag above]*, Consumer Court, Anti-Corruption, Overseas, Other), `is_active`

### People tables

**8. `citizens`**
- `id`, `cnic` (unique, 13 digits), `name`, `mobile_number`, `district_id` (FK — current address), `tehsil_id` (FK), timestamps

**9. `users`** — staff only (Admin, Focal Person); citizens never log in.
- `id`, `name`, `email` (unique, used to log in), `password`, `role` (`admin` / `focal_person`), `department_id` (FK, filled only for FPs — exactly one department), `sub_department_id` (FK, nullable), `is_active`, timestamps

### The core table

**10. `complaints`**
- `id`
- `complaint_number` — generated right after insert, from the row's own `id` (e.g. `PMCC-2026-000482`); safe under concurrent submissions because it rides on MySQL's atomic auto-increment
- `citizen_id` (FK, restrict on delete)
- `channel_id` (FK → channels)
- `district_id`, `tehsil_id` (FK — **snapshotted at submission**, not looked up live from the citizen)
- `department_id`, `sub_department_id`, `category_id` (FK, nullable — empty if "Other" was picked)
- `is_uncategorized` (boolean)
- `subject` (max 100 chars), `details` (text, min 50 chars enforced by the app)
- `embedding` (JSON, nullable) — AI-generated vector representation of subject + details, used for duplicate suggestions
- `assigned_fp_id` (FK → users, nullable) — the *current* assignee; full history lives in `complaint_assignments`
- `status` — set exclusively via `complaint_actions` (see below), never edited directly elsewhere: `submitted`, `under_investigation`, `pending_field_visit`, `clubbed`, `forwarded_external`, `not_resolvable`, `resolved`, `rejected`
- `stage` — drives the public tracking bar only: `application_submission`, `investigation_by_department`, `updated_info`
- `admin_assigned_by` (FK → users, nullable), `admin_remarks` (text, nullable) — filled only when Admin manually routes an "Other" complaint
- `submitted_at`, timestamps

**11. `complaint_attachments`**
- `id`, `complaint_id` (FK, restrict), `file_path`, `file_type`, `uploaded_by_type` (`citizen` / `focal_person`), `uploaded_by_user_id` (FK, nullable), timestamps

### Investigation & resolution tables

**12. `complaint_investigations`** — classification and supporting evidence only; does *not* set the complaint's status itself.
- `id`, `complaint_id` (FK, restrict), `fp_id` (FK)
- `investigation_type`: `known_duplicate`, `not_resolvable_legislation`, `not_resolvable_social`, `federal_jurisdiction`, `private_business`, `govt_service`, `field_visit`, `complainant_interaction`, `other_tribunal`
- `notes` (text, nullable), `location` (string, nullable), `visit_datetime` (timestamp, nullable) — used when `investigation_type` is `field_visit`
- timestamps

**13. `complaint_actions`** — **the single authoritative place a complaint's status changes.** Creating a row here is what actually updates `complaints.status`.
- `id`, `complaint_id` (FK, restrict), `fp_id` (FK)
- `action_summary` (text, min 100 chars)
- `resolution_status`: `resolved`, `clubbed`, `forwarded_externally`, `rejected`
- `complainant_feedback` (text, nullable)
- timestamps

**14. `complaint_clubs`**
- `id`, `primary_complaint_id` (FK, restrict), `clubbed_complaint_id` (FK, restrict, **unique** — a complaint can only be absorbed once), `clubbed_by` (FK → users), `notes` (text, nullable), timestamps
- App-level rule: `primary_complaint_id` can never equal `clubbed_complaint_id`.

**15. `complaint_similarity_matches`** *(new — AI-assisted clubbing)*
- `id`, `complaint_id` (FK, restrict), `matched_complaint_id` (FK, restrict)
- `similarity_score` (decimal 0–1, how close the AI judged the two complaints to be)
- `status`: `pending`, `confirmed`, `dismissed`
- `reviewed_by` (FK → users, nullable), `reviewed_at` (timestamp, nullable)
- created automatically by the system when a new complaint's AI embedding closely matches an existing one in the same department + category; confirming a match is what triggers a real `complaint_clubs` row

**16. `complaint_external_forwards`**
- `id`, `complaint_id` (FK, restrict), `destination_id` (FK → forward_destinations)
- `forwarded_by` (FK → users), `remarks` (text, nullable), `forwarded_at`
- `response_received_at` (timestamp, nullable), `response_notes` (text, nullable)

**17. `complaint_status_history`** — audit trail, append-only.
- `id`, `complaint_id` (FK, restrict), `stage`, `status_detail` (nullable), `changed_by` (FK, nullable — empty if system-driven), `changed_at`

**18. `complaint_assignments`** *(new — reassignment history)*
- `id`, `complaint_id` (FK, restrict), `fp_id` (FK → users), `assigned_by` (FK → users, nullable), `assigned_at`, `unassigned_at` (nullable)

---

## What we deliberately kept simple (and the extension path)

- **Field visits and complainant calls** still live inside `complaint_investigations` (via `investigation_type` + `notes`/`location`/`visit_datetime`) rather than their own tables — fine for now; splittable later without breaking anything.
- **AI matching scope**: the similarity search only compares complaints within the *same department + category*, both for performance and because a "duplicate" only makes sense within the same topic. If you later want cross-department duplicate detection (e.g. the same road issue reported to two different departments), that's a deliberate future change, not an oversight.
- **The external API bridge** to other departmental systems still isn't built here — `complaint_external_forwards` is the hook point for it, but the actual API integration is a later module.

---

## The prompt to give Antigravity

Paste this into Antigravity's agent chat inside your Laravel + React project:

> "I need you to build out the full database schema for this Laravel project as migrations and matching Eloquent models. Do not build any UI or routes yet — just the database layer. Every foreign key referencing complaint-history tables must use `onDelete('restrict')` — nothing should ever cascade-delete a complaint's records. Here are the tables:
>
> 1. `districts` (id, name) — seed with AJK's 10 districts: Muzaffarabad, Neelum, Jhelum Valley (Hattian Bala), Bagh, Haveli, Poonch, Sudhnuti, Kotli, Mirpur, Bhimber.
> 2. `tehsils` (id, district_id FK→districts restrict, name) — I'll provide the full list of 32 tehsils separately; for now just build the table and I'll seed it.
> 3. `departments` (id, name, code, display_order integer default 0, is_active boolean default true)
> 4. `sub_departments` (id, department_id FK→departments restrict, name, is_active boolean default true)
> 5. `categories` (id, department_id FK→departments restrict, parent_category_id FK→categories nullable self-reference, name, is_active boolean default true)
> 6. `channels` (id, name, is_active boolean default true) — seed with: Web, Mobile App, Call Center, Khuli Kachahry
> 7. `forward_destinations` (id, name, is_active boolean default true) — seed with: Federal, AJK Service Tribunal, Consumer Court, Anti-Corruption, Overseas, Other
> 8. `citizens` (id, cnic string unique 13 chars, name, mobile_number, district_id FK→districts restrict, tehsil_id FK→tehsils restrict, timestamps)
> 9. `users` — extend Laravel's default users table to add: role (enum: admin, focal_person), department_id FK→departments nullable restrict, sub_department_id FK→sub_departments nullable restrict, is_active boolean default true
> 10. `complaints` (id, complaint_number string unique nullable — generate this in a model 'created' event using the new row's own id, formatted like PMCC-{year}-{id padded to 6 digits}, then save it back; citizen_id FK→citizens restrict; channel_id FK→channels restrict; district_id FK→districts restrict; tehsil_id FK→tehsils restrict; department_id FK→departments nullable restrict; sub_department_id FK→sub_departments nullable restrict; category_id FK→categories nullable restrict; is_uncategorized boolean default false; subject string max 100; details text; embedding json nullable; assigned_fp_id FK→users nullable restrict; status enum: submitted/under_investigation/pending_field_visit/clubbed/forwarded_external/not_resolvable/resolved/rejected default submitted; stage enum: application_submission/investigation_by_department/updated_info default application_submission; admin_assigned_by FK→users nullable restrict; admin_remarks text nullable; submitted_at timestamp; timestamps)
> 11. `complaint_attachments` (id, complaint_id FK→complaints restrict, file_path, file_type, uploaded_by_type enum: citizen/focal_person, uploaded_by_user_id FK→users nullable restrict, timestamps)
> 12. `complaint_investigations` (id, complaint_id FK→complaints restrict, fp_id FK→users restrict, investigation_type enum: known_duplicate/not_resolvable_legislation/not_resolvable_social/federal_jurisdiction/private_business/govt_service/field_visit/complainant_interaction/other_tribunal, notes text nullable, location string nullable, visit_datetime timestamp nullable, timestamps)
> 13. `complaint_actions` (id, complaint_id FK→complaints restrict, fp_id FK→users restrict, action_summary text, resolution_status enum: resolved/clubbed/forwarded_externally/rejected, complainant_feedback text nullable, timestamps) — add a model event so that creating one of these updates the parent complaint's `status` field to match `resolution_status` (mapping resolved→resolved, clubbed→clubbed, forwarded_externally→forwarded_external, rejected→rejected)
> 14. `complaint_clubs` (id, primary_complaint_id FK→complaints restrict, clubbed_complaint_id FK→complaints restrict UNIQUE, clubbed_by FK→users restrict, notes text nullable, timestamps) — add a model-level validation preventing primary_complaint_id from equaling clubbed_complaint_id
> 15. `complaint_similarity_matches` (id, complaint_id FK→complaints restrict, matched_complaint_id FK→complaints restrict, similarity_score decimal(5,4), status enum: pending/confirmed/dismissed default pending, reviewed_by FK→users nullable restrict, reviewed_at timestamp nullable, timestamps)
> 16. `complaint_external_forwards` (id, complaint_id FK→complaints restrict, destination_id FK→forward_destinations restrict, forwarded_by FK→users restrict, remarks text nullable, forwarded_at timestamp, response_received_at timestamp nullable, response_notes text nullable, timestamps)
> 17. `complaint_status_history` (id, complaint_id FK→complaints restrict, stage string, status_detail string nullable, changed_by FK→users nullable restrict, changed_at timestamp)
> 18. `complaint_assignments` (id, complaint_id FK→complaints restrict, fp_id FK→users restrict, assigned_by FK→users nullable restrict, assigned_at timestamp, unassigned_at timestamp nullable)
>
> For every model, set up the Eloquent relationships (belongsTo / hasMany) matching these foreign keys. Add indexes on all foreign key columns, plus `citizens.cnic`, `complaints.complaint_number`, and `complaint_similarity_matches.similarity_score`. Once migrations and models are created, run the migrations against the local MySQL database, seed the lookup tables (districts, channels, forward_destinations) with the values I listed above, and confirm every table was created successfully. Then show me a summary of every table and its columns."

### After you send the AJK tehsil list

Once the schema above is built, send Antigravity the full list of AJK's 32 tehsils grouped by district (I can help you compile this precisely if you'd like — just ask), with a follow-up prompt like:

> "Seed the `tehsils` table with this list, matching each tehsil to its district by name: [paste your list here]"

---

## Verifying it worked

Ask Antigravity directly:

> "List all 18 tables now in the database, confirm every foreign key uses restrict on delete, and confirm the districts, channels, and forward_destinations tables are seeded correctly."

Or check visually with **TablePlus** (connect using host `127.0.0.1`, port `3306`, user `root`, blank password) and browse the tables yourself.

---

## Appendix — The full AJK district → tehsil list

Sourced from the **AJ&K Statistical Year Book** (Table 1.1, "Divisions, Districts & Sub-Divisions of AJ&K"), published by the Planning & Development Department, Government of AJK, citing the Board of Revenue as the primary source. This is the official administrative breakdown — 3 divisions, 10 districts, 32 tehsils (called "sub-divisions" in the government's own terminology) — and the numbers cross-check correctly (each division's tehsil count sums to its stated total, and the grand total is exactly 32).

Two districts have both an official and a commonly-used name — I've noted both so your dropdowns can use whichever your users will recognize; "Jhelum Valley" and "Poonch" are the official/gazetted names, while "Hattian Bala" and "Rawalakot" are the everyday names:

| Division | District | Tehsils |
|---|---|---|
| Muzaffarabad | Muzaffarabad | Muzaffarabad, Naseerabad |
| Muzaffarabad | Neelum | Athmuqam, Sharda |
| Muzaffarabad | Jhelum Valley (Hattian Bala) | Hattian, Chikar, Leepa |
| Poonch | Bagh | Bagh, Dhirkot, Harighel |
| Poonch | Haveli | Haveli, Khurshidabad, Mumtazabad |
| Poonch | Poonch (Rawalakot) | Rawalakot, Hajira, Abbaspur, Thorar |
| Poonch | Sudhnoti | Pallandri, Mong, Tararkhal, Baloch |
| Mirpur | Mirpur | Mirpur, Dudyal |
| Mirpur | Kotli | Kotli, Khuiratta, Charhoi, Darlia Jattan, Sehnsa, Fatehpur Thakyala |
| Mirpur | Bhimber | Bhimber, Barnala, Samahni |

### The prompt to seed this

Once the schema from earlier in this module is built, paste this into Antigravity's agent chat:

> "Seed the `tehsils` table, matching each tehsil to its district by name (create the district first if it isn't already seeded under this exact name):
>
> - Muzaffarabad: Muzaffarabad, Naseerabad
> - Neelum: Athmuqam, Sharda
> - Jhelum Valley: Hattian, Chikar, Leepa
> - Bagh: Bagh, Dhirkot, Harighel
> - Haveli: Haveli, Khurshidabad, Mumtazabad
> - Poonch: Rawalakot, Hajira, Abbaspur, Thorar
> - Sudhnoti: Pallandri, Mong, Tararkhal, Baloch
> - Mirpur: Mirpur, Dudyal
> - Kotli: Kotli, Khuiratta, Charhoi, Darlia Jattan, Sehnsa, Fatehpur Thakyala
> - Bhimber: Bhimber, Barnala, Samahni
>
> Confirm afterward that all 10 districts and all 32 tehsils exist and are correctly linked."

**One judgment call worth confirming with your team:** if your citizens are more familiar with "Hattian Bala" and "Rawalakot" than the gazetted "Jhelum Valley" and "Poonch," you may want the *displayed* dropdown label to use the common name while keeping the official name as an internal reference — just mention that to Antigravity and it can add a `display_name` field alongside `name`.

---

## Addendum — Bilingual support (Urdu/English)

*(Added after the initial schema was built — this is exactly the kind of additive change described above: a new migration on top of the existing tables, not a rewrite.)*

The Citizen Portal (Part D) needs to display in Urdu by default with an English toggle. The static text on the page (labels, buttons, instructions) is handled entirely in the frontend code, no database change needed for that. But the **dropdown options that come from your database** — district names, tehsil names, department names, category names — need an Urdu version stored alongside the English one, or the page would switch language everywhere except those dropdowns.

**The fix:** add a `name_ur` column to every lookup table a citizen actually sees on the submission form: `districts`, `tehsils`, `departments`, `sub_departments`, `categories`. (Internal-only tables like `forward_destinations`, which only Focal Persons/Admin see, don't need this — this module's Urdu requirement is specifically for the public-facing screen.)

### The prompt to give Antigravity

> "Add a nullable `name_ur` string column to the `districts`, `tehsils`, `departments`, `sub_departments`, and `categories` tables, via a new migration (don't edit the existing migration files). Also confirm the database connection and all these tables use the `utf8mb4` character set and `utf8mb4_unicode_ci` collation, so Urdu script stores and sorts correctly — if any table isn't already set to this, fix it. Then update the `districts` and `tehsils` seed data with these Urdu names, matched by the existing English name:
>
> Districts: Muzaffarabad → مظفرآباد, Neelum → نیلم, Jhelum Valley → وادیٔ جہلم (ہٹیاں بالا), Bagh → باغ, Haveli → حویلی, Poonch → پونچھ (راولاکوٹ), Sudhnoti → سدھنوتی, Mirpur → میرپور, Kotli → کوٹلی, Bhimber → بھمبر
>
> Tehsils: Muzaffarabad → مظفرآباد, Naseerabad → نصیرآباد, Athmuqam → ایتھمقام, Sharda → شاردہ, Hattian → ہٹیاں, Chikar → چکار, Leepa → لیپہ, Bagh → باغ, Dhirkot → دھیرکوٹ, Harighel → ہڑی گلہ, Haveli → حویلی, Khurshidabad → خورشید آباد, Mumtazabad → ممتاز آباد, Rawalakot → راولاکوٹ, Hajira → ہاجرہ, Abbaspur → عباسپور, Thorar → تھوراڑ, Pallandri → پلندری, Mong → مونگ, Tararkhal → تراڑکھل, Baloch → بلوچ, Mirpur → میرپور, Dudyal → دودیال, Kotli → کوٹلی, Khuiratta → کھوئیرٹہ, Charhoi → چڑھوئی, Darlia Jattan → درولیہ جاٹاں, Sehnsa → سہنسہ, Fatehpur Thakyala → فتح پور ٹھکیالہ, Bhimber → بھمبر, Barnala → برنالہ, Samahni → سماہنی
>
> Confirm afterward that every district and tehsil now has both `name` and `name_ur` populated."

**Honesty check on this list, same as the tehsil names themselves:** the well-known place names (Muzaffarabad, Mirpur, Kotli, Bagh, Rawalakot, etc.) I'm confident in. A handful of the smaller tehsils — **Harighel, Thorar, Tararkhal, Baloch, Charhoi, and Darlia Jattan** — are less common names, and my Urdu spellings for these should be checked by a native Urdu speaker on your team (or against an official AJK government document) before this goes live. Getting a well-known place name wrong looks careless; getting an obscure one wrong is an easy mistake to make and easy to miss in review, so it's worth the extra pair of eyes specifically on those six.

Departments and categories didn't have real data yet at the time this addendum was written — that's resolved below.

---

## Addendum — AJK Department & Category seed data

*(Added once the actual list of AJK departments, categories, and sub-categories was compiled — see the accompanying file `AJK-Departments-Categories.xlsx`.)*

This file has two sheets:
- **Departments** — 34 AJK government departments, each tagged with a source-confidence level (confirmed from the official AJK government portal, confirmed from your original BRD, or inferred/needs verification), plus the Urdu name for each.
- **Hierarchy** — every department's Category and Sub Category, matching the same two-level structure as your Punjab reference file. Where a department's Category and Sub Category are identical (e.g. "Others" / "Others"), that's a single-level category with no further breakdown — not two separate things.

### Before running this: get the file into your project

Drag `AJK-Departments-Categories.xlsx` into your project's `docs` folder in Antigravity (same as the PRD and build guide files), so the agent can read it directly.

### The prompt to give Antigravity

> "I've added `docs/AJK-Departments-Categories.xlsx` to this project. Read the **Departments** sheet and seed the `departments` table: one row per department, using the `Name (Urdu)` column for `name_ur`, and set `display_order` by row order for now (top to bottom) — this is a neutral starting order, not a real popularity ranking, since we have no usage data yet.
>
> Then read the **Hierarchy** sheet and seed the `categories` table using this rule: for each department, group its rows by Category. If a Category's value is identical to its Sub Category (e.g. 'Others' / 'Others', 'Service Delivery' / 'Service Delivery'), create **one** category row with that name (using the `Category (Urdu)` column for `name_ur`) and `parent_category_id` left empty — don't create a duplicate child row. If a Category has one or more *different* Sub Category values under it (e.g. 'Complaint against Police' with 'Police Corruption', 'Police High-Handedness', 'Other'), create one parent category row (name from `Category`, `name_ur` from `Category (Urdu)`), then one child category row for each distinct Sub Category value (name from `Sub Category`, `name_ur` from `Sub Category (Urdu)`), with `parent_category_id` pointing to that parent.
>
> Once seeded, show me: the total department count, the total category count (parent and child combined), and the full category breakdown — English and Urdu — for the 'Home Department (incl. AJK Police)' department specifically, so I can spot-check it against the source file."

### A scope note on Urdu category names

All 30 unique categories and 79 unique sub-categories now have Urdu translations in the spreadsheet (many repeat across departments — e.g. the generic "Others"/"Service Delivery" baseline — so 109 unique terms covers all 193 rows). This was done in one bulk pass, not researched term-by-term the way the AJK place names were, so it carries a different kind of risk than the tehsil list: these are standard Pakistani government bureaucratic vocabulary (safer territory than obscure place names), but a native Urdu speaker on your team should still skim the `categories` table before this goes live — some compound or lightly technical terms (e.g. "Non-Functional Water Supply Scheme," "Departmental Issue") may read better with a different official phrasing than my direct rendering. Treat it as a solid first draft, not a final sign-off.

### A structural note worth your attention

The AJK department list merges Traffic Police into a single **Home Department (incl. AJK Police)**, with "Traffic" as one of its categories, rather than keeping Traffic Police as its own separate department the way Punjab's reference does — AJK doesn't appear to run a separate Traffic Police agency. Your reference PDF's sample complaint (Traffic Police → Others → Others) maps onto this AJK structure as **Home Department → Traffic → License Issues** or a similar Traffic sub-category, not a 1:1 department match.

### Verifying it worked

1. Ask Antigravity to show the department list sorted by `display_order` and confirm it's exactly 34 departments, matching the spreadsheet.
2. Spot-check two or three departments' categories against the spreadsheet — particularly one with a custom tree (Police, School Education, Health, Electricity, Local Government, or the IT Board) and one using the generic four-category baseline.
3. Load the Citizen Portal's submission form (Module 3) and confirm the Department and Category dropdowns now show this real data instead of being empty.

---

## A note on changing your mind later

Adding a field or table later is normal — just describe what you want in plain language (e.g. *"add a priority field to complaints"*) and Antigravity will create a new migration to change the existing table safely, rather than editing old migration files.

---

## What's next

Continue to **Part C** below.

---

# Part C — Module 2: Authentication & Roles

## What this module covers, in plain language

Right now your database has a `users` table (for Admin and Focal Persons) but nothing actually checks passwords, keeps someone logged in, or stops a Focal Person from wandering into the Admin screens. This module builds that layer: **who can log in, how the system knows who they are on every page, and what each role is and isn't allowed to see.**

Three things to understand up front, since they shape everything below:

1. **Citizens never log in.** There's no "citizen account" anywhere in the BRD — a citizen submits a complaint and tracks it by their CNIC or complaint number, with no password involved. So this module only builds login for **Admin** and **Focal Person**.
2. **Nobody signs themselves up.** Unlike a normal app with a public "Create Account" page, the BRD makes Admin responsible for creating Focal Person accounts ("Manage Focal Persons: Create FP accounts"). So the public registration page that Laravel Breeze normally includes needs to be switched off — accounts only get created *by* an Admin, *from inside* the Admin portal (that screen itself is a later module; for now we just make sure the door is shut).
3. **Login is only half the job.** The other half is: once someone's logged in, what do they see? An FP should only ever see complaints belonging to their own department — never the whole system. This module sets up the *mechanism* for that (a reusable rule Antigravity's agent applies to every screen from here on), even though the actual complaint-listing screens come in a later module.

## Key decisions in this module

**Login identifier — email only.** The BRD says "Email / Username" for the Focal Person sign-in field, which is a little ambiguous about whether both should work. I've defaulted to **email-only** login here, since that's Laravel's standard, well-tested pattern and keeps things simple — a username field adds real complexity (uniqueness rules, a second lookup path) for a system with a small, Admin-managed user base where duplicate/forgotten usernames aren't really a risk. If you'd specifically like username-based login too, tell me and I'll fold it in — easy to add now, more work to retrofit later.

**No public registration, no public password reset link on the login page.** Since Admin creates every account, we remove the "Register" link Breeze normally shows. We keep "Forgot password" (an FP who's locked out still needs a way back in without calling Admin every time), but it only works for emails that already exist in the `users` table.

**Inactive accounts are blocked at login, not just hidden later.** The `users.is_active` field from Module 1 exists so Admin can deactivate someone who's left the department. That check needs to happen *at the login attempt itself* — an inactive user who enters the correct password should still be refused, with a clear message, not let in and then restricted somewhere downstream.

**Role-checking and data-scoping are two separate rules, both needed.** Blocking a Focal Person from the `/admin` pages entirely (role-checking) is not the same as making sure an FP who's allowed on `/complaints` only sees *their own department's* complaints (data-scoping). It's an easy pair to conflate — a system can correctly block wrong-role pages while still leaking wrong-department data on the pages it does allow. We build both.

## What Antigravity will build

- **Login pages** for Admin and Focal Person (Breeze already scaffolded the basic login screen when we set up the project in Part A — this module wires it up properly to your `users` table and roles, rather than leaving Breeze's defaults in place).
- **Two "gate" middlewares** — small rules that run before a page loads: one confirms *someone is logged in at all*, the other confirms *they're the right role* for the page they're trying to reach (e.g. `/admin/*` routes require role `admin`; `/fp/*` routes require role `focal_person`).
- **A department-scoping rule (a Laravel "policy")** that Antigravity will attach to complaint-related actions later, so a Focal Person's queries are automatically filtered to `department_id = their own department` — built now, used starting in the next module.
- **Session handling** (staying logged in, logging out) — handled by Breeze's defaults, which are solid; no changes needed there.
- **A seeded first Admin account**, since nobody can "sign up" as Admin — the very first Admin login has to come from somewhere. Antigravity will create one with a temporary password that you'll be told to change on first login.

## The prompt to give Antigravity

Paste this into Antigravity's agent chat inside your project:

> "Set up authentication and role-based access for this Laravel + React (Inertia) project, building on the existing Breeze scaffolding and the `users` table from the database module. Requirements:
>
> 1. Remove the public registration page and route entirely — no one should be able to create their own account. Keep the 'forgot password' flow, but it should only send a reset email if the address exists in the `users` table, and should not reveal whether an email exists or not to the person requesting it.
> 2. Login is by email and password only. When someone logs in, check `users.is_active` — if false, reject the login with a clear message like 'This account has been deactivated. Contact your administrator.' even if the password is correct.
> 3. Create a middleware called `EnsureUserHasRole` that accepts a role parameter (e.g. `role:admin` or `role:focal_person`) and blocks access to any route it's applied to if the logged-in user's `role` field doesn't match, returning a 403 Forbidden page.
> 4. Set up two route groups: everything under `/admin` requires the `admin` role; everything under `/fp` requires the `focal_person` role. For now these can point to simple placeholder dashboard pages — the real dashboard screens come in a later module.
> 5. Create a Laravel policy (or equivalent authorization class) for the `Complaint` model that includes a method for 'can this focal person view this complaint' which checks whether the complaint's `department_id` matches the focal person's own `department_id`. Don't wire this into any screens yet — just create it so future modules can use it directly.
> 6. Seed one initial Admin user: name 'System Administrator', a real-looking email you can tell me, role `admin`, `is_active` true, and a randomly generated temporary password — show me that password after seeding so I can log in and change it.
> 7. After building all this, log in as the seeded Admin account yourself to confirm the login works, confirm the `/fp` routes correctly reject an admin-only or logged-out visitor, and give me a summary of what was built."

### After you run it

Antigravity will hand you back the seeded Admin email and temporary password — save those somewhere safe (a password manager, not a sticky note) and log in once yourself to confirm it works before moving on.

## Verifying it worked

Ask Antigravity directly:

> "Show me: what happens if I try to visit an /admin page without being logged in, what happens if a focal_person account tries to visit an /admin page, and what happens if an inactive user tries to log in with the correct password."

All three should be refused, with a clear reason each time — not a blank page or a generic error.

## A note on what's deliberately not here yet

This module builds the *mechanism* for roles and data-scoping — it doesn't yet build the actual Admin dashboard, the Focal Person's complaint list, or the "Manage Focal Persons" screen where Admin actually creates new FP accounts. Those come in later modules and will plug directly into what we just built here (the middleware and policy don't need to change — the screens just start using them).

**Later update:** two more roles — `director` and `field_officer` — get added to `users.role` as part of Module 4's schema addendum, once the Focal Person Portal's design surfaced the need for them (a Director approves cross-department reassignment requests; a field officer can be assigned field visits by their supervising FP). The `EnsureUserHasRole` middleware built here doesn't need any changes for this — it already accepts any role name as a parameter — so this is a clean extension, not a rework. See Part E for the actual migration.

---

## What's next

Continue to **Part D** below.

---

# Part D — Module 3: Citizen Portal (bilingual: Urdu default, English toggle)

## What this module covers, in plain language

This is the first module where you'll actually see a real, styled screen come together — everything before this was invisible plumbing. Two public pages, neither requiring login, and both fully bilingual:

1. **The complaint submission form** — what a citizen fills out to file a complaint.
2. **A "track my complaint" lookup page** — where a citizen checks their complaint's status later, using their CNIC and complaint number together.

**Language requirement:** every citizen-facing screen loads in **Urdu by default**, with a visible toggle button to switch to **English**. This isn't just translated text — Urdu is written right-to-left, so the whole page layout mirrors direction when Urdu is active, not just the words.

## Key decisions in this module

**Urdu is the default, English is opt-in, and the choice is remembered.** The first thing any citizen sees is Urdu. A toggle button (labelled clearly, e.g. "English" in Urdu mode and "اردو" in English mode) switches the whole page. Once someone switches, that choice is remembered for their visit (stored in the browser) so they're not re-toggling on every page.

**Right-to-left isn't optional styling — it changes the layout itself.** In Urdu mode, text flows right-to-left, form labels sit on the right of their fields, the reading order of the whole page mirrors, and validation messages appear correctly aligned. This needs to be built as a real layout switch (the page's overall text direction flips), not just "translate the words and leave everything else pointing the same way" — that combination reads as broken to anyone literate in Urdu.

**Urdu needs its own font.** Standard web fonts don't render Urdu's script (Nastaliq/Naskh style) properly. We'll use **Noto Nastaliq Urdu** (a free, widely-used Google Font built for exactly this) when the page is in Urdu mode, and a standard font for English mode.

**Static text vs. dynamic text are handled two different ways.** Labels, buttons, and instructions that never change ("Submit Complaint," "Please enter your CNIC") live in a simple translation file in the code — easy for Antigravity to maintain. Dropdown options that come from your database (district and tehsil names, eventually department and category names) use the `name_ur` column added in Module 1's addendum — the same dropdown just displays `name` or `name_ur` depending on which language is currently active.

**What citizens type themselves needs no special handling.** The Subject and Details fields accept whatever language the citizen naturally writes in — Urdu, English, or a mix — since that's just user input, not something the app translates. The database is already configured to store Urdu script correctly (confirmed in Module 1's addendum).

*(The decisions below carry over unchanged from the original version of this module.)*

**Channel defaults to "Web" automatically.** The BRD lists four intake channels (Web, Mobile, Call Center, Khuli Kachahry), but this public form is specifically the *web* one — a citizen filling it out themselves. Call Center and Khuli Kachahry represent staff *entering a complaint on a citizen's behalf* during a phone call or an in-person open-court session, which is a different workflow (a staff member's own login, a slightly different form) rather than a variation of this public page. That's a reasonable candidate for its own small module later — for now, this form always records `channel = Web`.

**Tracking requires CNIC *and* complaint number together, not either alone.** If a citizen could look up status with just the complaint number, anyone who saw a complaint number (e.g. printed on a physical receipt someone dropped) could pull up another citizen's complaint details. Requiring both together is a simple, low-friction way to keep each citizen's information private without needing full account login.

**Picking "Other" for department skips category entirely.** If a citizen doesn't know which department their issue belongs to, there's no sensible category to pick either — so the form sets `is_uncategorized = true`, leaves `department_id`/`category_id` empty, and the complaint automatically lands in Admin's "Others" queue (built in a later module) for manual routing.

**Returning citizens reuse their existing record.** Since `citizens.cnic` is unique, if someone who's filed before submits again with the same CNIC, the system updates their existing citizen record (in case their mobile number or district changed) rather than creating a duplicate. Their new complaint links to that same citizen record.

**Attachments: up to 5 files, 10MB each.** The BRD doesn't specify an exact count limit, just that attachments are supported — 5 files is a sensible default that covers most real complaints (a few photos, maybe a short video) without one submission being able to overload storage. Easy to adjust later if you'd rather allow more.

**AI embeddings aren't generated yet — on purpose.** The schema has an `embedding` column ready to go, but actually generating it means connecting to an AI API, which is really a concern of the *clubbing* feature, not the submission form. Wiring it up here would mean setting up API keys before you actually need them. We'll turn this on in Module 4, right where it's used (the Focal Person's duplicate-review screen).

## What Antigravity will build

- A **language toggle mechanism**: a React context (or equivalent) holding the current language, defaulting to Urdu, that flips `dir="rtl"`/`dir="ltr"` on the page and swaps the active font, with the choice persisted in the browser so it holds across the submission and tracking pages.
- A **translation file** covering every static piece of text on both pages in both languages — form labels, placeholder text, buttons, validation error messages, the tracking bar's three stage names, and the confirmation/not-found messages.
- The **submission form page**: personal details, cascading District → Tehsil dropdowns (seeded AJK data, showing `name_ur` or `name` depending on active language), cascading Department → Sub-department → Category dropdowns (with "Other" at the bottom of each, per the BRD's ordering rule), subject, details with a live character counter (minimum 50), and a drag-and-drop-style multi-file attachment field.
- **Form validation**: CNIC as exactly 13 digits, a valid Pakistani mobile number format, required fields enforced, details minimum length enforced — with validation messages shown in whichever language is currently active.
- **Submission logic**: looks up or creates the citizen record, creates the complaint (auto-generating its `complaint_number`), saves attachments, and writes the first `complaint_status_history` row (`stage = application_submission`) so the audit trail starts on day one.
- **A confirmation screen** after submitting, showing the citizen their complaint number clearly (e.g. "Save this number: PMCC-2026-000482") and a link to the tracking page, in the active language.
- **The tracking lookup page**: a small form asking for CNIC + complaint number, and on match, a page showing the 3-stage tracking bar (Application Submission → Investigation by Department → Updated Info, translated) with the current stage highlighted, plus the complaint's subject and submission date. On no match, a generic "we couldn't find a complaint with those details" message — deliberately not revealing *which* of the two fields was wrong, for the same privacy reason as above.

## The prompt to give Antigravity

Paste this into Antigravity's agent chat inside your project (run this *after* the bilingual schema addendum from Module 1):

> "Build the public Citizen Portal for this app — two pages, neither requiring login, both fully bilingual in Urdu and English:
>
> **Language switching:**
> - Default language is Urdu on first load. Add a clearly visible toggle button that switches to English and back.
> - When Urdu is active, set the page's text direction to right-to-left (`dir=\"rtl\"`) and use the 'Noto Nastaliq Urdu' Google Font for all Urdu text. When English is active, use `dir=\"ltr\"` and a standard sans-serif font.
> - Persist the chosen language in the browser (e.g. localStorage) so it's remembered across both pages of this portal.
> - Put every piece of static text (labels, placeholders, buttons, validation messages, the tracking bar stage names, confirmation and not-found messages) into a translation file with Urdu and English versions, and reference it throughout — don't hardcode text directly into either page.
>
> **Page 1: Complaint submission form**, at a public route like `/complaints/new`:
> - Fields: Name, CNIC (exactly 13 digits, validate format), Mobile number (validate as a Pakistani mobile format), District (dropdown from the `districts` table, showing `name_ur` when Urdu is active and `name` when English is active), Tehsil (dropdown from `tehsils`, filtered live based on the selected district, same bilingual display rule), Subject (max 100 characters), Details (textarea, minimum 50 characters, show a live character counter), and a multi-file attachment field (max 5 files, 10MB each, accept images/audio/video/PDF).
> - Below Details, add: Department (dropdown from `departments`, ordered by `display_order`, bilingual display, with 'Other' as the last option), then if a department with sub-departments is selected, show a Sub-department dropdown; then a Category dropdown (from `categories`, filtered by the selected department, main categories only, bilingual display, with 'Other' as the last option, and if a category has sub-categories show a second-level dropdown for those).
> - If 'Other' is selected for Department: hide/skip the Category dropdown entirely, and on submit set `is_uncategorized = true` with `department_id` and `category_id` left empty.
> - On submit: look up a citizen by CNIC — if one exists, update their name/mobile/district/tehsil if changed and reuse their `citizen_id`; if not, create a new citizen record. Then create the complaint with `channel_id` set to Web, `stage = application_submission`, `status = submitted`, `submitted_at = now`, and the auto-generated `complaint_number`. Save any uploaded files as `complaint_attachments` records with `uploaded_by_type = citizen`. Also create a `complaint_status_history` row for this complaint with `stage = application_submission` and `changed_by` left empty.
> - After successful submission, redirect to a confirmation page clearly displaying the complaint number and a link to the tracking page, in the active language.
>
> **Page 2: Track my complaint**, at a public route like `/complaints/track`:
> - A small form asking for Complaint Number and CNIC.
> - On submit, look up a complaint matching *both* values together. If found, show a 3-stage tracking bar (Application Submission, Investigation by Department, Updated Info — translated) with the complaint's current `stage` visually highlighted, plus its subject and submission date. If not found, show a single generic message in the active language, without indicating which field was incorrect.
>
> Use clean, accessible form design with clear validation error messages in plain language, correctly mirrored for right-to-left layout in Urdu mode. Once built, show me both pages running locally, in both languages, so I can review them."

## Verifying it worked

1. Load the submission form fresh (clear browser storage first, or use a private window) and confirm it opens in **Urdu**, right-to-left, with the Urdu font rendering properly (not boxes or garbled characters).
2. Click the language toggle and confirm the entire page — labels, dropdown contents, buttons — switches to English and the layout flips to left-to-right.
3. Refresh the page and confirm your language choice was remembered.
4. Fill out the form (in either language) as a test citizen and submit it.
5. Ask Antigravity: *"Show me the database records that were just created for that test submission — the citizen, complaint, attachment, and status history rows."* Confirm each field looks right (correct `complaint_number` format, `stage = application_submission`, etc.).
6. Go to the tracking page and look up that same complaint with the correct CNIC + complaint number — confirm it shows up correctly, in both languages.
7. Try the tracking page with a wrong CNIC or a wrong complaint number — confirm you get the generic "not found" message, not an error page or a partial match.
8. Submit a second test complaint with the *same* CNIC as the first — ask Antigravity to confirm it reused the same `citizen_id` rather than creating a duplicate citizen record.

## A note on what's deliberately not here yet

This module doesn't touch anything staff-facing — no Focal Person ever sees these complaints yet, because the FP dashboard doesn't exist until the next module. That's expected; a citizen can submit and track a complaint right now, it just won't visibly *move* through the tracking bar until Module 4 gives a Focal Person somewhere to act on it.

Also worth noting: **only the Citizen Portal is bilingual per your request.** The Focal Person and Admin portals (Modules 4 and 5) are being built English-only unless you tell me otherwise — staff systems don't have the same accessibility need as a public-facing citizen form, but say the word if you'd like those bilingual too and I'll fold it into those modules' guides.

---

## Addendum — Rate limiting (one complaint per CNIC per 24 hours)

*(Added after the initial module was built — this is a resolved item from the PRD's open questions: submissions are limited to one per CNIC per 24-hour period, to deter spam and abuse of the public form.)*

This check needs to run **before** a new complaint is created, using the same CNIC lookup the submission logic already does for deduplication — if that citizen has any complaint with a `submitted_at` in the last 24 hours, the new submission is blocked with a clear, specific message (not a generic error).

### The prompt to give Antigravity

> "Add a rate limit to the complaint submission logic: before creating a new complaint, check whether the citizen matching the submitted CNIC already has a complaint with `submitted_at` within the last 24 hours. If so, block the submission and show a clear message in the active language (Urdu or English) stating they've already filed a complaint recently and specifying the exact time they'll be able to submit again (24 hours from their last submission). If not, allow the submission to proceed as normal. Add this message to the existing bilingual translation file rather than hardcoding it. Then show me what happens if I try to submit a second complaint with the same CNIC within 24 hours of the first."

### Verifying it worked

1. Submit a test complaint with a CNIC.
2. Immediately try to submit a second complaint with the **same CNIC** — confirm it's blocked with a clear message stating when you can try again, in whichever language is active.
3. Confirm a **different** CNIC can still submit successfully during that same window (the limit is per-CNIC, not global).

---

## Addendum — Gender field, step-form, and in-form photo/video capture

*(Added after the initial module was built — these three came out of a UX review of the live form. Voice-note recording was also raised but deliberately deferred; see PRD 2's Non-Goals for why.)*

### Schema change: optional gender field

One new nullable column, no other schema impact.

> "Add a nullable `gender` column to the `citizens` table via a new migration, as an enum: `male`, `female`, `prefer_not_to_say`. Update the citizen create-or-update logic from the submission form to accept and store this value when provided, but never require it — submission must succeed identically whether or not `gender` is set."

### Restructure: single page → 4-step form

This is a frontend reorganization of the existing submission form, not a new page — the fields, validation rules, and submission logic already built stay exactly the same, just regrouped into steps.

> "Restructure the complaint submission form at `/complaints/new` from a single long page into a 4-step flow, with a visible step indicator at the top (e.g. numbered circles or a labelled bar showing 'Step 2 of 4: Location'), translated into the active language and correctly mirrored for right-to-left layout in Urdu mode:
>
> - **Step 1 — Your Details**: Name, CNIC, Mobile number, and the new optional Gender field.
> - **Step 2 — Location**: District and Tehsil dropdowns.
> - **Step 3 — Complaint**: Department, Sub-department, Category, Subject, Details.
> - **Step 4 — Attachments & Review**: the attachment field (including the new capture options below), plus a read-only summary of everything entered in steps 1–3 so the citizen can review before submitting.
>
> Each step validates its own fields before allowing 'Next.' Submission only happens from Step 4. Make sure this step indicator is visually distinct from the public 3-stage tracking bar used elsewhere in this module (different shape/style) so the two are never confused. Show me the flow working end-to-end in both languages, including going back a step to change an earlier answer without losing what was entered in later steps."

### In-form photo/video capture

Adds two new options alongside the existing file-upload button, not a replacement for it.

> "Add two options to the attachment step, alongside the existing file upload: 'Take a Photo' and 'Record a Video,' both using the device's camera directly through the browser (no separate app). Recorded video is capped at approximately 60 seconds. Anything captured this way counts toward the same 5-file, 10MB-each attachment limit as uploaded files — validate combined count and size the same way regardless of source. If the citizen's browser denies camera permission, show a clear message in the active language and let them fall back to uploading a file instead, without breaking the rest of the form. Show me capturing a photo and a short video on a mobile browser specifically, not just desktop, since that's the primary device most citizens will use."

### Verifying it worked

1. Confirm the gender field can be left blank and the complaint still submits successfully — this should never be a blocking field.
2. Walk through all 4 steps in Urdu, then again in English, confirming the step indicator and layout direction are both correct in each.
3. Go back a step partway through and confirm previously entered data in later steps isn't lost.
4. On an actual mobile device (not just a resized desktop browser), test both 'Take a Photo' and 'Record a Video,' and confirm a denied camera permission falls back gracefully to the upload option.
5. Submit a complaint using only captured photos/video (no uploaded files) and confirm they're saved as `complaint_attachments` rows identically to uploaded ones.

---

## What's next

**Module 4: Focal Person Portal** — the FP dashboard, the First Investigation screen (including the AI-assisted duplicate suggestions we designed earlier), and the action/resolution screen. This is where complaints actually start moving through the tracking bar. Say the word when you're ready.

---

# Part E — Module 4: Focal Person Portal

## Reconciling the uploaded design with what's already built

You shared a design spec for this module, and it's strong — the human-accountability guardrails (explicit confirmation before clubbing, no silent cascades), the department-scoping carried over from Module 2, and the phased build sequence are exactly the right instincts. Before turning it into build prompts, three things needed reconciling against the schema Module 1 already built and ran, so Antigravity isn't given two documents that quietly disagree:

**1. Tracking bar labels vs. the stored `stage` values.** The design doc uses "Received → Under Investigation → Resolved" as citizen-facing labels. Module 1's schema stores `stage` as `application_submission` / `investigation_by_department` / `updated_info`. These are the same three stages — no schema change needed — but to avoid two different naming schemes floating around, the *stored* values stay as Module 1 defined them, and "Received / Under Investigation / Resolved" become the **display labels** shown on screen (both to citizens on the tracker and staff on the dashboard badge). I've used the friendlier labels throughout this module's UI descriptions below, on the understanding they map onto the existing stored values.

**2. The four classification paths need a small schema correction.** Module 1's `investigation_type` enum (`known_duplicate`, `not_resolvable_legislation`, `not_resolvable_social`, `federal_jurisdiction`, `private_business`, `govt_service`, `field_visit`, `complainant_interaction`, `other_tribunal`) was built before this module's UI was designed, and it doesn't cleanly match the four-path decision the design doc lays out (Handle Directly / Club with Existing / Forward Externally / Schedule Field Visit) — several of those enum values were really just *reasons for forwarding*, not distinct top-level paths. The design doc's four-path model is actually cleaner, so we're simplifying the enum to match it via a new migration:
   - `handle_directly`
   - `club_with_existing` (replaces `known_duplicate`)
   - `forward_externally` (replaces `not_resolvable_legislation`, `not_resolvable_social`, `federal_jurisdiction`, `private_business`, `other_tribunal` — the *specific* reason now lives in `complaint_external_forwards.destination_id` plus a required free-text reason, not as separate enum branches)
   - `schedule_field_visit` (replaces `field_visit`)
   - `progress_note` (new — for the ongoing Investigation Log entries in the Action/Resolution screen: calls, meeting notes, updates that aren't a formal reclassification; replaces `complainant_interaction` as a more general-purpose log entry type)

**3. `resolution_status` needs one addition.** The design doc's Resolution outcome selector includes "Escalate to Admin," which doesn't exist in Module 1's `complaint_actions.resolution_status` enum (`resolved`, `clubbed`, `forwarded_externally`, `rejected`). Adding `escalated` to that enum, plus a matching `escalated_to_admin` value on `complaints.status`, via migration.

## Decisions made on the five open questions — updated

*(This supersedes an earlier pass at these same five questions, before you gave explicit answers. Two of your answers meaningfully expand this module's schema beyond what Module 1 built — noted below.)*

1. **SLA / Days-Open threshold**: **15 days**, computed (today minus `submitted_at`), not a stored field — a simple constant Antigravity can change in one place if a real SLA policy emerges later.
2. **Citizen name/CNIC visibility**: **full visibility everywhere on FP screens** — both the dashboard queue and the First Investigation detail screen show the citizen's full name and full CNIC. No masking. Your reasoning holds: an FP's job requires actually contacting and verifying the citizen, and masking would get in the way of that on every screen, not just protect against a real risk (this is an internal staff tool, not the public tracker).
3. **Field visit assignment**: an FP **can** assign a field visit to a subordinate. This needs a real, if small, schema addition — a new `field_officer` role, with each field officer linked to the FP who supervises them.
4. **Reassignment**: bigger than the original design doc's framing. It's not a same-department handoff between FPs — an FP can request moving a complaint to a **different department entirely**, and that request needs approval from a **Director**, a new role, one per department, distinct from Admin. This is the largest schema/role addition in this module.
5. **Priority/SLA column**: no new column — folds into decision #1, computed not stored.

## New schema this module requires (build this first, before the four staged prompts)

Decisions #3 and #4 above need real additions to what Module 1 and Module 2 already built. Same additive pattern as every other addendum so far — new migrations, nothing rewritten.

**Role model expansion** (extends Module 2):
- `users.role` gains two new values: `director` and `field_officer` (existing values `admin` and `focal_person` are untouched).
- `users.supervisor_id` — a new nullable, self-referencing foreign key (`users.id`). Populated only for `field_officer` accounts, pointing to the Focal Person who supervises them. An FP can only assign a field visit to a field officer where `supervisor_id` equals their own user ID.
- A `director` account is scoped to one department via the existing `users.department_id` column — same pattern as an FP, just a different role and different permissions (approving reassignment requests for that department, rather than investigating complaints).

**Field visit assignment** (extends Module 1's `complaint_investigations`):
- New nullable column `assigned_officer_id` (FK → `users`) — who is actually carrying out the visit. Can be the FP themselves or one of their field officers.

**Cross-department reassignment requests** (new table):
- `complaint_reassignment_requests`: `id`, `complaint_id` (FK → complaints, restrict), `requested_by` (FK → users — the FP requesting), `from_department_id` (FK → departments, restrict), `to_department_id` (FK → departments, restrict), `reason` (text, required), `status` (enum: `pending` / `approved` / `rejected`, default `pending`), `reviewed_by` (FK → users, nullable — the Director who acted on it), `reviewed_at` (timestamp, nullable), `review_notes` (text, nullable), timestamps.
- **Assumption I'm flagging rather than guessing silently:** I've set the *destination* department's Director as the approver (they're the one whose queue is about to gain a complaint), not the source department's Director. This seems like the more defensible default — a department shouldn't be able to have complaints pushed onto it without its own Director's sign-off — but if AJK's actual accountability structure works the other way (the *originating* Director signs off on giving it away), this is a one-line change before we build the approval screen in Module 5.

### The prompt to give Antigravity for this schema addition

> "Add the following to this Laravel project via new migrations (don't edit existing migration files):
>
> 1. Add `director` and `field_officer` as new allowed values on the `users.role` enum, alongside the existing `admin` and `focal_person`.
> 2. Add a nullable `supervisor_id` column to `users`, a self-referencing foreign key to `users.id`, restrict on delete.
> 3. Add a nullable `assigned_officer_id` column to `complaint_investigations`, foreign key to `users.id`, restrict on delete.
> 4. Create a new table `complaint_reassignment_requests`: id, complaint_id (FK→complaints, restrict), requested_by (FK→users, restrict), from_department_id (FK→departments, restrict), to_department_id (FK→departments, restrict), reason (text, required), status (enum: pending/approved/rejected, default pending), reviewed_by (FK→users, nullable, restrict), reviewed_at (timestamp, nullable), review_notes (text, nullable), timestamps.
> 5. Set up the Eloquent relationships and add indexes on all new foreign key columns.
>
> Confirm all four changes were applied successfully."

## What Antigravity will build — five staged prompts

Matching the design doc's own recommendation: build and review each piece before moving to the next.

### Prompt 1 — FP Dashboard (read-only)

> "Build the Focal Person dashboard at a route like `/fp/dashboard`, protected by the `focal_person` role middleware from Module 2. This is read-only — no state-changing actions yet.
>
> - KPI strip: four cards showing counts for this FP's department only — New/Unassigned, Under Investigation, Awaiting Resolution Confirmation, Resolved This Month.
> - Filter bar: status, category, district, tehsil, date range, and a 'has duplicate suggestion' toggle (complaints with an unconfirmed row in `complaint_similarity_matches` above a similarity threshold).
> - Complaint queue table, scoped to `department_id = the logged-in FP's department_id` using the policy from Module 2, columns: Complaint Number, Citizen's full Name and full CNIC (no masking — this is an internal staff screen), Category, District/Tehsil, Submitted Date, Current Stage (badge showing 'Received' / 'Under Investigation' / 'Resolved' as the display label for the underlying `stage` value), Days Open (computed as today minus `submitted_at`, shown in red if over 15 days), a small icon if a duplicate suggestion is pending, and a small icon if this complaint has a pending reassignment request awaiting a Director's decision.
> - Row click routes to the First Investigation screen if the complaint's stage is `application_submission`, or to the Action/Resolution screen if it's already `investigation_by_department`.
>
> Show me the dashboard running with some test complaint data so I can review the layout before we build the next screen."

### Prompt 2 — First Investigation Screen: complaint detail + AI duplicate panel

> "Build the First Investigation screen at a route like `/fp/complaints/{id}/investigate`, reachable only for complaints in this FP's own department (enforce via the Module 2 policy) with stage `application_submission`.
>
> - Section A, read-only: full complaint detail — description, attachments, location, category/subcategory, submission channel (from the `channels` lookup table), complaint number, submission timestamp, and the citizen's full name and full CNIC.
> - Section B, AI Duplicate Suggestions panel: query `complaint_similarity_matches` for this complaint, show up to 5 candidates with status `pending`, each displaying the candidate's complaint number, a text snippet, and the `similarity_score` translated into a label (High/Medium/Low rather than a raw number), with a 'Compare' expand showing both complaints' text side-by-side. Each candidate gets three actions: 'Confirm as duplicate' (opens a confirmation modal explaining that this will club the complaint under the matched one before committing, then on confirm creates a `complaint_clubs` row and updates the `complaint_similarity_matches` row to `confirmed`), 'Not a duplicate' (updates the match to `dismissed`), and 'Skip' (leaves it `pending`, resurfaces next visit). If there are zero pending candidates, show a plain 'No similar complaints found' message, no action required.
>
> Show me this screen running against a test complaint that has at least one seeded duplicate suggestion, so I can review the panel before we build the classification step."

### Prompt 3 — First Investigation Screen: classification decision

> "Add Section C to the First Investigation screen: a classification decision the FP must make to proceed. Four options, exactly one selectable:
>
> 1. **Handle Directly** — creates a `complaint_investigations` row with `investigation_type = handle_directly`, sets the complaint's `stage` to `investigation_by_department`, keeps it in this FP's queue.
> 2. **Club with Existing** — only enabled if Section B has a `confirmed` match for this complaint; creates a `complaint_investigations` row with `investigation_type = club_with_existing` (the actual `complaint_clubs` row was already created when the match was confirmed in Section B).
> 3. **Forward Externally** — requires selecting a destination from the `forward_destinations` table and a required reason/note; creates a `complaint_investigations` row with `investigation_type = forward_externally`, creates a `complaint_external_forwards` row, sets `stage` to `investigation_by_department` and `status` to `forwarded_external`.
> 4. **Schedule Field Visit** — requires a proposed date and an assigned officer: a dropdown listing the FP themselves plus any `field_officer` users whose `supervisor_id` matches the FP's own user ID; creates a `complaint_investigations` row with `investigation_type = schedule_field_visit`, storing the date in `visit_datetime`, the chosen person in `assigned_officer_id`, and defaulting the location to the complaint's recorded district/tehsil; sets `stage` to `investigation_by_department`.
>
> Whichever path is chosen, also write a row to `complaint_status_history` with the new stage and `changed_by` set to the current FP. After submitting, redirect back to the dashboard.
>
> Show me each of the four paths working against separate test complaints, including confirming the field officer dropdown only shows officers supervised by the currently logged-in FP."

### Prompt 4 — Action/Resolution Screen

> "Build the Action/Resolution screen at a route like `/fp/complaints/{id}/resolve`, reachable for complaints in this FP's department with stage `investigation_by_department`.
>
> - Section A, Investigation Log: an append-only timeline pulling every `complaint_investigations` row for this complaint (timestamp, author, `investigation_type`, notes), plus a simple form to add a new **progress note** at any time (creates a new `complaint_investigations` row with `investigation_type = progress_note`) — used for call logs, meeting notes, and field visit outcomes.
> - Section B, Resolution Action: an outcome selector — Resolved / Rejected (with a required reason) / Escalate to Admin. A required Resolution Summary field (minimum 100 characters, written for the citizen to read on their public tracker — plain language, not internal jargon), and a required evidence/attachment upload. On submit, create a `complaint_actions` row with the matching `resolution_status` (add `escalated` as a new allowed value on this enum via migration if it isn't there yet), which per the existing model event updates `complaints.status` to match. If Resolved or Rejected, also set `stage` to `updated_info`. If Escalated, set `complaints.status` to `escalated_to_admin` (add this as a new allowed value on the `complaints.status` enum too) and leave `stage` at `investigation_by_department` — don't advance the public tracker to a stage that isn't true yet. Write a `complaint_status_history` row in every case.
> - If this complaint is a **parent** in a `complaint_clubs` relationship (has one or more `clubbed_complaint_id` rows pointing to it), resolving or rejecting it should show a confirmation modal first: 'This will also resolve N clubbed complaints — confirm?' Only proceed if confirmed, and if so, apply the same resolution to every clubbed child complaint, each getting its own `complaint_status_history` entry (not a silent bulk update with no trail).
>
> Show me the full flow: adding a progress note, then resolving a complaint, then resolving a complaint that has clubbed children attached, so I can confirm the cascade confirmation works correctly."

### Prompt 5 — Request reassignment to another department

> "Add a 'Request Reassignment' action, available from both the dashboard (as a row action) and the First Investigation / Action-Resolution screens, for any complaint in this FP's department that doesn't already have a pending reassignment request.
>
> - A small form: select a destination department (from `departments`, excluding the complaint's current department), and a required reason (text).
> - On submit, create a `complaint_reassignment_requests` row with `status = pending`, `from_department_id` set to the complaint's current department, `to_department_id` set to the chosen department, and `requested_by` set to the current FP. Do not change the complaint's actual `department_id` yet — that only happens if a Director approves it (built in a later module).
> - On the dashboard, show a small 'Reassignment pending' indicator on any complaint with an unresolved request, and let the FP see the status (pending/approved/rejected) of requests they've submitted, including any `review_notes` if a Director rejected it.
>
> Show me submitting a reassignment request and confirm it appears correctly as pending on the dashboard."

## Verifying it worked

After each prompt, before moving to the next:
1. **After the schema prompt**: confirm the new `director`/`field_officer` roles, `supervisor_id`, `assigned_officer_id`, and `complaint_reassignment_requests` table all exist correctly.
2. **After Prompt 1**: confirm the dashboard only shows complaints for the logged-in FP's own department (log in as two different FPs from different departments, confirm each sees a different queue), and confirm full name/CNIC show with no masking.
3. **After Prompt 2**: seed a test complaint with a deliberately similar duplicate and confirm it surfaces in the panel with a sensible similarity label.
4. **After Prompt 3**: walk all four classification paths on separate test complaints, and specifically confirm the field officer dropdown on the field-visit path only shows officers where `supervisor_id` matches the logged-in FP — seed a test field officer under one FP and confirm a *different* FP doesn't see them in their dropdown.
5. **After Prompt 4**: confirm a citizen can see the resolution summary on their public tracking page (from Module 3) once resolved, and confirm the clubbed-children cascade only fires with explicit confirmation, never silently.
6. **After Prompt 5**: submit a reassignment request and confirm the complaint's actual `department_id` does *not* change yet (it shouldn't, until a Director acts on it in Module 5) — only the request record and the dashboard indicator should reflect it.

## A note on what's deliberately not here yet

The Director's approval screen — where they actually see and act on pending reassignment requests for their department — isn't built in this module. This module builds the *request* side only; the *approval* side needs a Director login/dashboard, which is a natural fit for the same module as Admin (Module 5), since both are department/system oversight roles rather than case-handling roles. The "routing" that puts a complaint into an FP's queue in the first place — automatic department/category matching, or Admin manually assigning an "Other" complaint — is also Module 5's responsibility; this module is the receiving end of that, not the router.

---

## What's next

**PRD for Module 5: Admin & Director Portal** — the centralized complaints table, the "Others" assignment queue, department/category/FP/Director management, and the reassignment-request approval screen this module's Prompt 5 fed into. Per your standing instruction, I'll write that PRD first, before any build guide content. Say the word when you're ready.
