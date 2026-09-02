# Team & AI Agent Git Branching & Code Merging Strategy

This document defines the official Git branching model, Pull Request (PR) workflow, Conventional Commit standards, and AI Agent collaboration rules for the **CMCC-AJK** engineering team.

---

## 🌲 1. Branch Naming Conventions

All team members and AI coding agents must follow this strict branch prefix format:

| Branch Pattern | Purpose | Example |
|----------------|---------|---------|
| `main` | Production-ready, stable code. Protected branch. Direct pushes prohibited. | `main` |
| `feature/<name>` | New feature development | `feature/complaint-controllers` |
| `fix/<name>` | Bug fixes and patch resolution | `fix/policy-department-scoping` |
| `refactor/<name>` | Code cleanup / structural refactoring without behavior change | `refactor/user-model-casts` |
| `docs/<name>` | Documentation, guides, or agent skills updates | `docs/s3-storage-setup` |
| `agent/<agent-name>/<task>` | AI-generated branch for long-running / autonomous agent tasks | `agent/antigravity/vector-pgvector` |

---

## 🔄 2. The Development & PR Workflow

```
[ main ] <-------------------------------------------------------+
   |                                                             |
   | (Create Feature Branch)                                     | (Squash & Merge after PR Approval)
   v                                                             |
[ feature/complaint-crud ] ---> (Commits & Tests) ---> [ Pull Request ]
                                                          |
                                                          +-- Automated CI Check (php artisan test)
                                                          +-- Code Review (.agents/code-reviewer.md)
```

### Step 1: Create a Feature Branch
Always branch off the latest `main`:
```bash
git checkout main
git pull origin main
git checkout -b feature/complaint-crud
```

### Step 2: Develop & Verify Code Locally
Before staging code, ensure all local checks pass:
```bash
# 1. Format PHP code
php artisan pint

# 2. Compile frontend assets
npm run build

# 3. Run automated PHPUnit test suite (Must pass 100%)
php artisan test
```

### Step 3: Write Conventional Commits
Commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) format:
- `feat: add complaint assignment controller and route bindings`
- `fix: correct department scoping in ComplaintPolicy`
- `docs: update S3 storage setup guide`
- `test: add unit test for focal person dashboard access`
- `refactor: extract citizen validation rules into FormRequest`

### Step 4: Push Branch & Open Pull Request
```bash
git push -u origin feature/complaint-crud
```
Open a Pull Request targeting `main` with:
- **Clear PR Description**: Summary of changes and why they were made.
- **Verification Proof**: Command outputs or test pass confirmation (`34/34 tests passed`).
- **Reviewer Assignment**: Tag a team member or request AI Code Review (`.agents/code-reviewer.md`).

### Step 5: Merge Strategy (Squash and Merge)
Use **Squash and Merge** on GitHub to maintain a linear, clean `main` history.

---

## 🤖 3. AI Agent Collaboration Rules (For Human & AI Pair Programming)

When AI Agents (Antigravity, Claude Code, Cursor, Copilot) generate code or perform autonomous goals on this repository, they MUST adhere to the following 5 rules:

1. **No Direct `main` Mutations**: Agents must never force-push or mutate `main` directly for multi-file feature additions.
2. **Pre-Push Quality Gate**: Agents MUST execute `php artisan test` and verify clean execution before pushing commits.
3. **Preserve Existing API Contracts**: If an agent refactors a method signature, it must update all call sites across controllers, models, seeders, and tests.
4. **Clean Git History**: Commits created by agents must use conventional commit prefixes (`feat:`, `fix:`, `docs:`, `test:`).
5. **No Swallowed Errors**: Agents must never bypass failing assertions or comment out tests to force a build to pass.
