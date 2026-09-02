# System Architecture & Database Schema: CMCC-AJK

**System Name**: Citizen Complaint & Grievance Management System (AJK)  
**Stack**: Laravel 13 (PHP 8.5) + Inertia.js (React 18) + Tailwind CSS + Vite  
**Database**: MySQL / PostgreSQL (18 Normalized Tables)  

---

## 🏗️ High-Level System Architecture

```
                                +-----------------------------------+
                                |   Citizen / Web / Mobile / Call   |
                                +-----------------------------------+
                                                  |
                                                  v
                                +-----------------------------------+
                                |    Inertia.js + React 18 Frontend |
                                +-----------------------------------+
                                                  |
                                                  v
                                +-----------------------------------+
                                | Laravel 13 Routing & Auth Middleware|
                                +-----------------------------------+
                                                  |
                                                  v
                                +-----------------------------------+
                                |   Complaint & Department Policies |
                                +-----------------------------------+
                                                  |
                                                  v
                                +-----------------------------------+
                                |   Eloquent Domain Models (18 DB)  |
                                +-----------------------------------+
```

---

## 🗄️ Relational Database Schema (18 Tables)

### 1. Identity & Division Lookups
- `users`: Application users (`admin`, `focal_person`), linked to `department_id` and `sub_department_id`.
- `citizens`: Citizen identity (`cnic`, `name`, `mobile_number`, `district_id`, `tehsil_id`).
- `districts`: 10 Districts of Azad Jammu & Kashmir.
- `tehsils`: 29 Tehsils of Azad Jammu & Kashmir.
- `departments`: Government ministries and departments.
- `sub_departments`: Specialized divisions within departments.
- `categories`: Complaint categorizations.
- `channels`: Intake sources (Web, Mobile App, Call Center, Khuli Kachahry).
- `forward_destinations`: External escalation targets (Federal, AJK Service Tribunal, Consumer Court, etc.).

### 2. Core Domain & History
- `complaints`: Primary complaint record (`complaint_number`, `citizen_id`, `department_id`, `status`, `stage`, `embedding`).
- `complaint_attachments`: Uploaded media and documents (`uploaded_by_type`: citizen, focal_person).
- `complaint_investigations`: Department field visits, hearing notes, jurisdiction checks.
- `complaint_actions`: Official actions taken by focal persons.
- `complaint_clubs`: Primary and secondary clubbed complaint relationships.
- `complaint_similarity_matches`: Automated vector similarity scores between complaints.
- `complaint_external_forwards`: Tracking forwarded complaints to external agencies.
- `complaint_status_history`: Immutable log of every status transition.
- `complaint_assignments`: Detailed log of admin and department assignments.

---

## 🚀 Performance & Scaling Directives

1. **Composite Database Indexing**: Add composite index for department dashboard filtering:
   ```sql
   CREATE INDEX idx_complaints_dept_status_date ON complaints(department_id, status, submitted_at);
   ```
2. **Vector Embeddings**: For scaling beyond 10,000 complaints, transition `embedding` column from generic `json` to PostgreSQL `pgvector` indexed vector extension.
