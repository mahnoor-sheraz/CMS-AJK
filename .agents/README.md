# Agency Agents & Skills Directory for CMCC-AJK

This directory contains specialized AI Agent personas and skill guidelines tailored from the [agency-agents](https://github.com/msitarzewski/agency-agents) framework. These roles can be loaded by AI coding assistants (Antigravity, Claude Code, Cursor, Copilot) or human developers during development, architecture, code review, security auditing, and git operations.

---

## 🛠️ Available Agent Skills

| Skill File | Role Name | Purpose & Focus |
|------------|-----------|-----------------|
| [codebase-onboarding-engineer.md](file:///Users/sheraz/work/cms-ajk/.agents/codebase-onboarding-engineer.md) | **Codebase Onboarding Engineer** | Rapid repository exploration, entry point mapping, data flow tracing, and grounded facts. |
| [backend-architect.md](file:///Users/sheraz/work/cms-ajk/.agents/backend-architect.md) | **Backend Architect** | System architecture design, DB schema normalization, API contracts, zero-downtime migrations. |
| [code-reviewer.md](file:///Users/sheraz/work/cms-ajk/.agents/code-reviewer.md) | **Code Reviewer** | Quality assurance, correctness, maintainability, performance (N+1 queries), and blocker/suggestion flagging. |
| [appsec-engineer.md](file:///Users/sheraz/work/cms-ajk/.agents/appsec-engineer.md) | **AppSec Engineer** | Threat modeling (STRIDE), OWASP Top 10 prevention, secure coding standards, input validation, encryption. |
| [compliance-auditor.md](file:///Users/sheraz/work/cms-ajk/.agents/compliance-auditor.md) | **Compliance Auditor** | Audit readiness (SOC 2, ISO 27001, Public Sector PII), gap assessment, control implementation, evidence matrix. |
| [git-workflow-master.md](file:///Users/sheraz/work/cms-ajk/.agents/git-workflow-master.md) | **Git Workflow Master** | Branch naming standards (`feature/*`, `fix/*`), Conventional Commits, pre-push quality gates, and PR merge strategies. |

---

## 💡 How to Use These Skills in AI Coding Workflows

When prompting an AI assistant on this repository, reference the relevant agent skill file to activate its framework:

- **For Onboarding & Explanations**: *"Using `.agents/codebase-onboarding-engineer.md`, explain how complaint status updates move through the system."*
- **For Schema & Performance Changes**: *"Using `.agents/backend-architect.md`, design an indexed vector search migration for complaint similarity matching."*
- **For PRs & Code Review**: *"Using `.agents/code-reviewer.md`, review this new ComplaintController implementation for N+1 queries and authorization checks."*
- **For Security Audits**: *"Using `.agents/appsec-engineer.md`, audit our file attachment handler against OWASP Top 10."*
- **For Git Branching & Commits**: *"Using `.agents/git-workflow-master.md`, prepare a feature branch and commit message for complaint search."*
