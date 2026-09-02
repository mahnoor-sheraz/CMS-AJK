# CMCC-AJK: Citizen Complaint Management System

![Laravel Framework](https://img.shields.io/badge/Laravel-13.x-red.svg)
![React](https://img.shields.io/badge/React-18.x-blue.svg)
![Inertia.js](https://img.shields.io/badge/Inertia.js-2.x-purple.svg)
![PHP](https://img.shields.io/badge/PHP-8.5-indigo.svg)
![Tests Status](https://img.shields.io/badge/Tests-34%20Passed-brightgreen.svg)

The **CMCC-AJK** system is a centralized public sector grievance management platform designed for Azad Jammu & Kashmir government departments. It enables citizens to register complaints across multiple channels (Web, Mobile App, Call Center, Khuli Kachahry) and allows department Focal Persons (FPs) and System Administrators to track, investigate, club, forward, and resolve complaints.

---

## 🏛️ System Features & Domain Architecture

- **Multi-Tenant Division Management**: 10 Districts, 29 Tehsils, multi-department scoping.
- **Complaint Lifecycle Pipeline**: Statuses from `submitted` to `under_investigation`, `pending_field_visit`, `clubbed`, `forwarded_external`, `resolved`, `rejected`.
- **Immutable Audit Trail**: Logged status histories (`complaint_status_history`) and action tracking (`complaint_actions`).
- **AI Similarity & Duplicate Detection**: Embedding storage for duplicate identification (`complaint_similarity_matches`).
- **Real-Time Websockets**: Event broadcasting via Laravel Reverb and React Inertia listeners.
- **S3 / Cloud File Attachments**: Encrypted file storage for complaint evidence with local MinIO emulator support.

---

## 🛠️ Local Development & Quick Start

```bash
# 1. Clone repository & install dependencies
composer install
npm install --legacy-peer-deps

# 2. Environment setup & key generation
cp .env.example .env
php artisan key:generate

# 3. Compile frontend assets
npm run build

# 4. Run database migrations & seeders
php artisan migrate --seed

# 5. Run PHPUnit test suite (34 Tests / 85 Assertions)
php artisan test
```

---

## 📚 Project Documentation

- 🗺️ **[System Architecture & Database Schema](file:///Users/sheraz/work/cms-ajk/docs/ARCHITECTURE.md)**: Details on the 18 relational tables, FK constraints, and scaling strategies.
- ⚡ **[Real-Time WebSocket Integration Guide](file:///Users/sheraz/work/cms-ajk/docs/REALTIME_WEBSOCKETS.md)**: Real-time complaint assignment and live counter updates with Reverb and Echo.
- 📦 **[S3 Storage Setup, Mocking & Provisioning Guide](file:///Users/sheraz/work/cms-ajk/docs/STORAGE_S3_GUIDE.md)**: S3 config, local MinIO mocking, `Storage::fake('s3')`, and presigned URLs.
- 🤖 **[Agent Skills Directory](file:///Users/sheraz/work/cms-ajk/.agents/README.md)**: Specialized AI agent skill personas for onboarding, architecture, security, code review, and compliance auditing.
