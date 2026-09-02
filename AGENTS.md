# CMCC-AJK Agent Guidelines & Repository Architecture

This repository contains the **Citizen Complaint Management System for Azad Jammu & Kashmir (CMCC-AJK)** built with Laravel 13, Inertia.js (React 18), Tailwind CSS, and Vite.

---

## 🚨 Mandatory Agent Maintenance Directive

**CRITICAL RULE FOR ALL AI AGENTS & DEVELOPERS**:
Whenever you add a feature, refactor code, change environment requirements, modify database schema, or add documentation to this codebase, you **MUST ALWAYS**:
1. Keep `README.md` updated with the latest commands, features, and setup steps.
2. Keep `AGENTS.md` and `CLAUDE.md` synchronized with updated system context, rules, and guidelines so future agents receive immediate context on startup.
3. Run `php artisan test` to verify that all 34+ automated tests pass 100% before committing.

---

## 🚀 Quick Start & Environment Verification

```bash
# 1. Verify Prerequisites
php -v         # Must be PHP 8.3+
composer -V

# 2. Environment Setup
cp .env.example .env
php artisan key:generate

# 3. Dependencies & Build
composer install
npm install --legacy-peer-deps
npm run build

# 4. Database Seed & Test Suite
php artisan migrate --seed
php artisan test
```

---

## 🏛️ System Architecture Overview

- **Stack**: Laravel 13 (PHP 8.5) + Inertia.js (React 18) + Tailwind CSS + Vite.
- **Database**: 18 normalized tables covering administrative divisions (10 Districts, 29 Tehsils), citizen PII, departments, sub-departments, complaints, attachments, investigations, actions, duplicate similarity matches, external forwards, and status audit histories (`complaint_status_history`).
- **Real-Time Engine**: First-party **Laravel Reverb** (`laravel/reverb`) WebSocket server broadcasting on private channels (`private-department.{id}`). Start with `php artisan reverb:start`.
- **Cloud Storage**: AWS S3 / MinIO local emulator setup configured in `config/filesystems.php`. Dedicated `complaint_attachments` disk serving 15-minute presigned URLs.

---

## 🛠️ Specialized Agent Skills (`.agents/`)

When working on tasks in this codebase, load and leverage the specialized skill frameworks in `.agents/`:

- **🧭 Codebase Exploration**: [.agents/codebase-onboarding-engineer.md](file:///Users/sheraz/work/cms-ajk/.agents/codebase-onboarding-engineer.md)
- **🏗️ Database & System Design**: [.agents/backend-architect.md](file:///Users/sheraz/work/cms-ajk/.agents/backend-architect.md)
- **👁️ Code Review**: [.agents/code-reviewer.md](file:///Users/sheraz/work/cms-ajk/.agents/code-reviewer.md)
- **🔐 Application Security**: [.agents/appsec-engineer.md](file:///Users/sheraz/work/cms-ajk/.agents/appsec-engineer.md)
- **📋 Compliance & Audits**: [.agents/compliance-auditor.md](file:///Users/sheraz/work/cms-ajk/.agents/compliance-auditor.md)
- **🌿 Git Workflow & Merging**: [.agents/git-workflow-master.md](file:///Users/sheraz/work/cms-ajk/.agents/git-workflow-master.md)

Refer to [.agents/README.md](file:///Users/sheraz/work/cms-ajk/.agents/README.md) for usage instructions.

---

## 📖 Complete Documentation Suite (`docs/`)

- [docs/ARCHITECTURE.md](file:///Users/sheraz/work/cms-ajk/docs/ARCHITECTURE.md): Database schema (18 tables), ER relationships, performance indexes.
- [docs/REALTIME_WEBSOCKETS.md](file:///Users/sheraz/work/cms-ajk/docs/REALTIME_WEBSOCKETS.md): Real-time WebSockets setup via Laravel Reverb and Inertia React.
- [docs/STORAGE_S3_GUIDE.md](file:///Users/sheraz/work/cms-ajk/docs/STORAGE_S3_GUIDE.md): S3 cloud storage configuration, local MinIO mocking, PHPUnit `Storage::fake('s3')`, and presigned URLs.
- [docs/GIT_WORKFLOW_AND_MERGING.md](file:///Users/sheraz/work/cms-ajk/docs/GIT_WORKFLOW_AND_MERGING.md): Branching conventions (`feature/*`, `fix/*`), PR squash-and-merge policy, Conventional Commits, and AI agent quality gates.
