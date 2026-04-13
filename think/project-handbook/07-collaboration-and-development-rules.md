# 07. Collaboration and Development Rules

## 1. Purpose

This document defines the minimum common rules for a 4-person AI-assisted development project.

The goal is not to add heavy process. The goal is to reduce merge conflicts, naming mismatches, and duplicated work while keeping the team workflow simple.

This document should be used together with:

- `specs/` for feature and technical requirements
- `think/project-handbook/` for overall project context and planning
- `specs/00-overview/05-shared-naming-registry.md` for shared naming updates

---

## 2. Shared Source of Truth Order

When documents conflict, use this order:

1. `specs/`
2. `think/project-handbook/`
3. this document
4. `05-shared-naming-registry.md`

Rule:

- Feature behavior, API structure, DB rules, and page flow must follow `specs/` first.
- Team workflow and GitHub collaboration must follow this document.
- New shared names must be recorded in the naming registry.

---

## 3. Team Roles

## PM / Data Manager

- manages shared documents
- manages requirement alignment
- reviews naming conflicts
- reviews DB-related changes
- coordinates final integration priorities

## Backend / Integration

- authentication and authorization
- API implementation
- DB access and data flow
- external or internal integration logic
- synchronization logic
- file processing
- statistics API

## Frontend / Screen Owner

- customer-facing screens
- operator-facing screens
- UI interaction and input/output behavior
- search, filter, status-change UI
- chat UI and dashboard UI

## AI Owner

- classification
- chatbot
- abusive-expression detection
- message summary
- neutralization logic
- AI integration API definition

Role rule:

- Each area has a main owner.
- If a change affects another area, the owner must open a PR and request review from the related owner.

---

## 4. Development Principles

1. Start from the shared documents, not from personal assumptions.
2. Follow the existing structure before creating a new one.
3. Keep names consistent across frontend, backend, AI, and DB.
4. Do not merge code without updating documents when the change affects shared behavior.
5. Keep the process minimal. Use only the rules that prevent real confusion.

---

## 5. GitHub Branch Rules

## Main Rule

- Do not push directly to `main`.
- All work must be merged through Pull Request.

## Branch Naming

Use one of the following formats:

- `feat/<short-topic>`
- `fix/<short-topic>`
- `docs/<short-topic>`
- `refactor/<short-topic>`
- `chore/<short-topic>`

Examples:

- `feat/auth-signup-login`
- `feat/operator-inquiry-list`
- `feat/ai-message-summary`
- `fix/token-refresh-error`
- `docs/collaboration-rules`

## Branch Scope Rule

- One branch should focus on one feature group or one clear task.
- Do not mix unrelated backend, frontend, and AI work in one branch unless they must be merged together.

---

## 6. Commit Message Rules

Use a simple prefix-based format:

- `feat: ...`
- `fix: ...`
- `docs: ...`
- `refactor: ...`
- `test: ...`
- `chore: ...`

Examples:

- `feat: add customer signup API`
- `fix: correct inquiry status mapping`
- `docs: update shared naming registry`

Commit rule:

- Write what changed in clear and short language.
- Prefer one meaningful change per commit.

---

## 7. Pull Request Rules

Every PR should include:

1. Summary of what was changed
2. Why the change was needed
3. Related documents updated
4. Test or verification result
5. Screenshots if UI changed

## PR Title Rule

Use the same style as commit prefixes:

- `feat: operator inquiry detail page`
- `fix: login token validation`
- `docs: add development rules`

## Review Rule

- At least one teammate review is required before merge.
- If the PR changes shared API, DB, or naming, request review from the related owner.

## Merge Rule

Do not merge if any of these are missing:

- required document update
- naming registry update for new shared names
- basic test or manual verification note

---

## 8. File and Scope Rules

## Frontend

- Frontend owners should not change backend response format by assumption.
- If frontend needs a response change, it must be discussed and reflected in the relevant spec or naming registry.

## Backend

- Backend owners should not rename shared API fields without updating documents.
- Backend owners should not change DB field meaning without updating the registry and relevant specs.

## AI

- AI owners should not invent new request/response names independently when those values are shared with frontend or backend.
- AI input/output fields must follow documented names.

## PM / Data

- PM or data manager reviews final naming consistency and shared documentation quality.

---

## 9. Shared Naming Rules

All shared names must be consistent across documents and code.

This includes:

- API field names
- DB column names
- enum/status names
- shared component names
- shared class names
- AI input/output field names

If a new shared name is introduced, it must be added to:

- `specs/00-overview/05-shared-naming-registry.md`

before merge, or at minimum in the same PR.

---

## 10. Document Update Rules

The following changes require document updates:

- API request/response field change
- DB column add/remove/change
- enum or status change
- naming change shared across teams
- page flow or user flow change
- AI input/output contract change

Rule:

- A PR that changes shared behavior must also update the relevant markdown file.

Simple standard:

- code change only is not enough for shared behavior changes

---

## 11. AI-Assisted Development Rules

Each developer may use AI during implementation, but must give AI the correct context.

Minimum input to AI should include:

- related spec file paths
- current task scope
- files allowed to change
- names already defined in the naming registry

Do not ask AI to freely redesign unrelated parts of the project.

Preferred pattern:

1. read the relevant spec
2. check the naming registry
3. define the exact task scope
4. generate or edit code with AI
5. update docs if shared behavior changed

---

## 12. Integration Rule

When work affects more than one area, integrate in this order:

1. shared document check
2. API or DB contract confirmation
3. implementation in each area
4. naming registry update if needed
5. PR review
6. merge

---

## 13. Recommended Development Flow

```text
Read shared specs
   ↓
Check naming registry
   ↓
Create personal branch
   ↓
Develop with AI inside defined scope
   ↓
New shared name or field created?
   ├─ No → continue
   └─ Yes → update naming registry
   ↓
Open Pull Request
   ↓
Review documents + code together
   ↓
Merge into main
```

---

## 14. GitHub Workflow Diagram

```text
main
 ├─ feat/auth-signup-login
 ├─ feat/operator-inquiry-list
 ├─ feat/ai-message-summary
 └─ docs/collaboration-rules

Each branch
  → development
  → PR creation
  → review
  → merge into main
```

---

## 15. Minimum Merge Checklist

Before merge, confirm:

- [ ] branch purpose is clear
- [ ] commit messages follow the simple prefix rule
- [ ] PR description explains the change
- [ ] shared behavior changes are reflected in docs
- [ ] new shared names are recorded in the naming registry
- [ ] related owner reviewed if needed
- [ ] basic verification was completed

---

## 16. Final Rule

If a team member is unsure whether a naming or structure change is shared, treat it as shared and document it.

That is better than silently creating a merge conflict later.
