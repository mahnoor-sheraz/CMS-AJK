# CMCC-AJK Agent Guidelines & Repository Architecture

This repository contains the **Citizen Complaint Management System for Azad Jammu & Kashmir (CMCC-AJK)** built with Laravel 13, Inertia.js (React 18), Tailwind CSS, and Vite.

---

## 🚀 Prerequisites & Quick Start

1. **Verify PHP & Composer**:
   ```bash
   php -v         # Must be PHP 8.3+
   composer -V
   ```
2. **Environment Setup**:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
3. **Dependencies & Assets**:
   ```bash
   composer install
   npm install --legacy-peer-deps
   npm run build
   ```
4. **Database & Tests**:
   ```bash
   php artisan migrate --seed
   php artisan test
   ```

---

## 🛠️ Specialized Agent Skills (`.agents/`)

When working on tasks in this repository, leverage the specialized skill frameworks in `.agents/`:

- **🧭 Codebase Exploration**: `.agents/codebase-onboarding-engineer.md`
- **🏗️ Database & System Design**: `.agents/backend-architect.md`
- **👁️ Code Review**: `.agents/code-reviewer.md`
- **🔐 Application Security**: `.agents/appsec-engineer.md`
- **📋 Compliance & Audits**: `.agents/compliance-auditor.md`
- **🌿 Git Workflow & Merging**: `.agents/git-workflow-master.md`

Refer to [.agents/README.md](file:///Users/sheraz/work/cms-ajk/.agents/README.md) for usage instructions.

---

## 📖 Architecture, Real-Time, Storage & Git Documentation (`docs/`)

- [docs/ARCHITECTURE.md](file:///Users/sheraz/work/cms-ajk/docs/ARCHITECTURE.md): Database schema (18 tables), ER relationships, performance indexes.
- [docs/REALTIME_WEBSOCKETS.md](file:///Users/sheraz/work/cms-ajk/docs/REALTIME_WEBSOCKETS.md): Real-time WebSockets setup via Laravel Reverb and Inertia React.
- [docs/STORAGE_S3_GUIDE.md](file:///Users/sheraz/work/cms-ajk/docs/STORAGE_S3_GUIDE.md): S3 cloud storage configuration, local MinIO mocking, PHPUnit `Storage::fake('s3')`, and presigned URL access patterns.
- [docs/GIT_WORKFLOW_AND_MERGING.md](file:///Users/sheraz/work/cms-ajk/docs/GIT_WORKFLOW_AND_MERGING.md): Branching conventions (`feature/*`, `fix/*`), PR squash-and-merge policy, Conventional Commits, and AI agent quality gates.
