# CMS AJK — Changelog

All notable changes to this project are documented here in reverse chronological order.

---

## [2026-09-12] — Complaint Form Download & Official Printable Document

### Changes Made

| # | What Changed | Files Modified |
|---|---|---|
| 1 | **Official Printable Complaint Document Component (`ComplaintPrintDocument.jsx`)** — Created an authentic, high-fidelity printable complaint certificate complete with Prime Minister's Contact Centre (PMCC) branding, GoAJK Seal, official State Flag of Azad Kashmir, tracking number heading, status indicator, 4 structured sections (Citizen Information, Department & Location, Grievance Details, and Attached Evidence list), and a computer-generated verification watermark with tracking URL. | `ComplaintPrintDocument.jsx` |
| 2 | **Print & PDF Layout Styles (`app.css`)** — Added dedicated `@media print` rules configured for standard A4 portrait output. Hides web headers, footers, sidebars, and action buttons during print / "Save as PDF", isolating the official complaint document with clean typography and high contrast. | `app.css` |
| 3 | **"Download copy of form" on Confirmation Screen** — Added a `#344e41` action button with download icon on `/complaints/confirmation/{number}`, allowing citizens to immediately print or save a PDF copy of their lodged grievance upon completion. | `ComplaintConfirmation.jsx` |
| 4 | **"Download copy" on Tracking Screen** — Added the download/print action button directly to the tracking header card next to the status badge on `/complaints/track`, enabling citizens to retrieve and download an up-to-date copy whenever they look up their tracking number. | `ComplaintTrack.jsx` |
| 5 | **Dedicated Direct Download Route & Auto-Print** — Added route `GET /complaints/download/{complaint_number}` and corresponding controller action in `PublicComplaintController.php` that supports automatic print dialog trigger (`autoPrint: true`), and updated `track` queries to eager-load `subDepartment`, `category`, and `attachments` for complete data access. | `PublicComplaintController.php`, `web.php`, `CitizenPortalTest.php` |

---

## [2026-09-12] — Form Validation Audit & Evidence Attachment Verification

### Changes Made

| # | What Changed | Files Modified |
|---|---|---|
| 1 | **Aligned Minimum Character Limits (Details Field)** — Synchronized client-side validation in `ComplaintSubmit.jsx` (`min: 50`) with server-side validation in `StorePublicComplaintRequest.php` (`'min:50'`). Updated the real-time character counter and inline error-clearing threshold from 20 to 50 characters so users receive immediate guidance and are never blocked on submission by mismatched backend rules. | `ComplaintSubmit.jsx` |
| 2 | **Client-Side File Extension & Format Validation** — Added immediate validation in `addFiles()` checking files against the allowed extensions (`jpg, jpeg, png, gif, pdf, mp3, wav, mp4, avi, mov`) before adding them to state. Disallowed extensions (e.g. `.exe`, `.docx`, `.zip`) are flagged with user-friendly bilingual error messages without waiting for server round-trip. | `ComplaintSubmit.jsx` |
| 3 | **Attachment Backend Error Display & Form Navigation** — Connected backend file validation errors (`errors.attachments` and indexed `errors['attachments.*']`) directly into the Evidence dropzone display. Updated submission error handler `onError` to navigate straight to Step 3 if attachment validation issues are returned by Laravel. | `ComplaintSubmit.jsx` |
| 4 | **Database Compatibility & Automated Test Suite** — Hardened enum update migrations for SQLite/testing driver compatibility and expanded `ServerSideValidationTest.php` to verify attachment file limits (max 5, 10MB individual size limit, allowed MIME types, and database record creation). All 123 tests passing. | `StorePublicComplaintRequest.php`, `ServerSideValidationTest.php`, migrations |

---

## [2026-09-11] — Complaint Tracking Screen Prototype Redesign

### Changes Made

| # | What Changed | Files Modified |
|---|---|---|
| 1 | **Exact Visual Redesign for Tracking Screen** — Restyled `ComplaintTrack.jsx` to match the exact design provided: left poster sidebar (`#344e41` gradient, ambient golden orb, `Complaint status` badge, `Where is my complaint?` headline), search input with search icon and vibrant `#ec3013` pill `Track` button. | `ComplaintTrack.jsx` |
| 2 | **Complaint Details & Status Badge** — Integrated the complaint summary card with high-contrast `#344e41` tracking number heading, subject description, and floating status pill with animated colored indicator. | `ComplaintTrack.jsx` |
| 3 | **3 Info Cards & Vertical Progress Timeline** — Added the 3 metric cards (`Submitted`, `Department`, `Due by`), plus the connected 4-stage vertical timeline (`Complaint received`, `Assigned to department`, `Under investigation`, `Resolution`) with solid green nodes and connectors for completed/active stages and subtle hollow rings for pending stages. | `ComplaintTrack.jsx`, `PublicComplaintController.php`, `TrackComplaintRequest.php` |

---

## [2026-09-11] — Dynamic Department & Category Context-Aware Subject Suggestions

### Changes Made

| # | What Changed | Files Modified |
|---|---|---|
| 1 | **Dynamic Subject Suggestions by Department & Category** — Replaced the static 12-item suggestion list with an intelligent context-aware engine (`getSubjectSuggestions`). When a citizen selects a Department (e.g. Home Department / Police, Health, School Education, Power / Electricity, Local Government, C&W, ITB, Food Authority, Board of Revenue, etc.) and an optional Category (e.g. Investigation, Medicine Shortage, Dangerous Building, Billing, Sewerage, etc.), the Subject input suggestions instantly adapt to provide highly relevant, authentic issues in both English and Urdu. | `resources/js/data/complaintSubjects.js`, `resources/js/Pages/Public/ComplaintSubmit.jsx` |
| 2 | **Bilingual Subject Preview & Smart Text Filtering** — Updated the suggestion dropdown to present primary title and secondary translation subtitle (`English` / `Urdu` based on active language direction), allowing instant selection while still filtering smoothly when the citizen types custom keywords. | `resources/js/Pages/Public/ComplaintSubmit.jsx` |

---

## [2026-09-11] — Color Update (#344e41), Screen Height Viewport Fit & Header Refinement

### Changes Made

| # | What Changed | Files Modified |
|---|---|---|
| 1 | **Color Palette Transition to `#344e41`** — Updated the primary forest green shade from `#14603a` to `#344e41` across the top navbar, left poster card gradient (`#344e41` to `#283d33`), step title headings, footer, and icons. | `PublicLayout.jsx`, `ComplaintSubmit.jsx`, `ComplaintTrack.jsx`, `ComplaintConfirmation.jsx` |
| 2 | **Viewport Screen Height Optimization** — Adjusted container padding (`clamp(14px, 2vw, 24px)`) and gaps so the full 2-column modernist interface fits seamlessly within typical screen heights without awkward page scrolling. | `PublicLayout.jsx`, `ComplaintSubmit.jsx` |
| 3 | **Header Button Conditional Visibility** — Removed the redundant "File a complaint" button from the main complaint form navbar, keeping it visible only on the Track Complaint screen. | `PublicLayout.jsx` |

---

## [2026-09-11] — Full Modernist 2-Column Redesign Matching Prototype (`akj-.zip`)

### Changes Made

| # | What Changed | Files Modified |
|---|---|---|
| 1 | **Exact 2-Column Layout Architecture** — Replaced the single-column centered layout with the exact 2-column modernist layout from `akj-.zip` (`aside` poster column + `section` form card) matching the provided design. | `ComplaintSubmit.jsx`, `ComplaintTrack.jsx`, `ComplaintConfirmation.jsx` |
| 2 | **Deep Forest Green Poster Sidebar** — Implemented the left column with `#14603a` to `#0d472b` gradient, animated floating ambient gold radial orb (`pmccFloat`), chip kicker badge (`Citizen complaint`), hero title (`Let's get your voice heard.`), 4-step vertical progress rail with circular numbered indicators (`01`, `02`, `03`, `04`), and bottom security badge (`Encrypted and confidential`). | `ComplaintSubmit.jsx` |
| 3 | **Modernist Form Card & Input Elements** — Built the white form card with top golden progress line (`25%`, `50%`, `75%`, `100%`), step indicator pill (`Step 1 of 4`), soft cream backgrounds (`#faf7f2`), rounded borders (`border-radius: 16px`), inner left vector icons for name, CNIC, mobile, and dropdowns, and pill action buttons. | `ComplaintSubmit.jsx` |
| 4 | **Portal Shell & Navbar Overhaul** — Refreshed `PublicLayout.jsx` with the top gold govt banner (`linear-gradient(90deg, #c8891a, #d49f34)`), deep forest green header (`#14603a`), circular `PM` seal, `PMCC` brand typography, pill action buttons (`File a complaint`, `Track complaint`), and clean footer. | `PublicLayout.jsx` |
| 5 | **Bilingual RTL / LTR Parity** — Full layout inversion and font alignment (`Noto Nastaliq Urdu` & `Noto Naskh Arabic`) when toggling between Urdu and English. | `PublicLayout.jsx`, `ComplaintSubmit.jsx`, `LanguageContext.jsx` |

---

## [2026-09-11] — Citizen Form Interactions, Animations & Validation Fine-Tuning

### Changes Made

| # | What Changed | Files Modified |
|---|---|---|
| 1 | **Fluid step card animations** — Added `.step-card-animated` keyframes (`stepFadeInSlide`) for smooth entry when navigating between steps 1, 2, 3, and 4. | `ComplaintSubmit.jsx`, `app.css` |
| 2 | **Active stepper pulse & hover scaling** — Added `stepperPulse` animation to the active step indicator and smooth spring scale on completed steps. | `app.css` |
| 3 | **Cascading dropdown transitions** — Added `.cascade-field-enter` smooth reveal animation when dependent dropdowns (Tehsil, Sub-department, Category, Sub-category) become visible. | `ComplaintSubmit.jsx`, `app.css` |
| 4 | **Real-time inline validation clearing** — Inputs now instantly clear error messages as soon as the user satisfies constraints (Full name ≥ 2 chars, 13-digit CNIC, valid Pakistani mobile prefix, subject, details ≥ 50 chars, district, and tehsil). | `ComplaintSubmit.jsx` |
| 5 | **Strict Pakistani phone validation** — Refined regex to validate authentic telco network prefixes (`0300-0370`). | `ComplaintSubmit.jsx` |
| 6 | **Interactive character counter progress bar** — Added a dynamic progress bar beneath the complaint details field transitioning smoothly from copper (`#c78f54`) to deep green (`#39723b`) once the 50-character threshold is reached. | `ComplaintSubmit.jsx`, `app.css` |
| 7 | **Drag-and-drop file upload zone** — Implemented an interactive drag-over dropzone in Step 4 with visual hover states. | `ComplaintSubmit.jsx`, `app.css` |
| 8 | **Thumbnail image previews** — Uploaded images now render rich thumbnail previews in the attachment list with safe object URL lifecycle cleanup. | `ComplaintSubmit.jsx`, `app.css` |

---

## [2026-09-10] — Restore Urdu Headline

### Changes Made

| # | What Changed | Files Modified |
|---|---|---|
| 1 | **Restored headline** — Added back 'آپ کی بات، براہِ راست وزیرِ اعظم تک' as a standalone heading above the step navigator. The step badge and intro paragraph remain removed. | `resources/js/Pages/Public/ComplaintSubmit.jsx` |

**Reason:** User explicitly overrode Decision #002 — the headline must stay on the form page.


## [2026-09-10] — Form Cleanup & Step Navigator Spacing

### Changes Made

| # | What Changed | Files Modified |
|---|---|---|
| 1 | **Removed hero/intro section** — Deleted the large headline block ('آپ کی بات، براہِ راست وزیرِ اعظم تک'), the step badge ('شکایت جمع کرائیں · 0X/04'), and the intro-copy paragraph from the complaint form page. | `resources/js/Pages/Public/ComplaintSubmit.jsx` |
| 2 | **Removed intro-copy paragraph** — Deleted the redundant marketing text ('اپنے بارے میں کچھ بتا کر شروع کریں...') that sat below the hero headline. | `resources/js/Pages/Public/ComplaintSubmit.jsx` |
| 3 | **Fixed step navigator spacing** — Changed gap between circle and label from 0.7rem to 1rem (16px). Changed gap between step items from 1rem to 2rem (32px). Changed `align-items` from `flex-start` to `center` for vertical centering. Reduced top margin from 4rem to 1.5rem since the hero section was removed. | `resources/css/app.css` |

---

## [2026-09-09] — Form UX Bug Fixes (Phase 1)

### Changes Made

| # | What Changed | Files Modified |
|---|---|---|
| 1 | **Fixed asterisk misalignment** — Wrapped field labels in `.form-label-title` span to keep asterisks inline with label text. | `ComplaintSubmit.jsx`, `app.css` |
| 2 | **Fixed oversized checkbox** — Added explicit checkbox sizing rules (`1.15rem` with `!important`) to prevent the global input stretch from affecting checkboxes. | `app.css` |
| 3 | **Updated Urdu hero heading** — Changed to 'آپ کی بات، براہِ راست وزیرِ اعظم تک'. | `ComplaintSubmit.jsx` |
| 4 | **Scaled down Urdu hero font** — Used `clamp(1.4rem, 2.4vw, 2.1rem)` for RTL `.intro h1` to prevent text overflow. | `app.css` |

---

## [2026-09-09] — Database Conflict Resolution

### Changes Made

| # | What Changed | Details |
|---|---|---|
| 1 | **Cleaned up stale mysqld processes** — Killed orphaned MySQL processes that were blocking DBngin from starting. | System-level fix, no code changes. |
