# AGENTS

## 1. Purpose

This file is an operational control document for agents working in this project. Its purpose is not to explain the product, but to ensure agents read the **minimum correct context** in the **correct order** without wasting tokens on unrelated or obsolete documents.

For work inside this project, this file takes precedence over the home-level global `AGENTS.md`.

## 2. Default Document Priority

### 2.1 Primary references

Agents must treat the following as the default reference order.

1. `docs/ddd/README.md`
2. Relevant files in `docs/ddd/active/`
3. `docs/specifications/README.md`
4. Relevant files in `docs/specifications/active/`
5. `immediate-mvp-notes.md` only when current decision status or unresolved MVP scope matters

### 2.2 Non-primary references

The following are **not** default references.

- `docs/project-handbook/*`
- `docs/specifications/archive/*`
- `docs/ddd/archive/*`
- any legacy/history/archive file

Past versions must be read only under the conditions defined in section 5.

## 3. Reference Minimization Rules

- Do not broadly scan unrelated folders.
- Do not start by opening many detailed files.
- Read index/README/summary documents first.
- Open detailed documents only after identifying the relevant domain or bounded context.
- Do not chain through multiple versioned files for one question unless history is explicitly required.
- Do not confirm the same fact in multiple documents if one active authoritative document is already sufficient.
- If active/latest documentation is sufficient, stop there.

## 4. Work Start Procedure

Before doing substantive work, agents must follow this sequence.

1. Classify the request by **domain / bounded context**, not by UI feature label.
2. Estimate what information is needed.
3. Select the smallest viable reference set.
4. Read only current active documents first.
5. Expand outward only if a real gap remains.

## 5. Versioned Document Handling

### 5.1 Current working rule

- The working baseline is always the latest active document for the relevant topic.
- Existing files are preserved; new versions are created instead of overwriting history blindly.
- However, the current task should still use only the latest active document as the default baseline.

### 5.2 When past versions may be read

Agents may read older documents only when:

1. the user explicitly requests a specific older version,
2. current active documents do not explain the rationale or policy history,
3. current documents appear to conflict and comparison is required,
4. regression, impact analysis, or prior decision background must be checked.

### 5.3 Required disclosure when older docs are read

If older documents are consulted, agents must briefly state:

- why they were read,
- which documents were consulted,
- how that affected the current work.

## 6. DDD-Oriented Working Rules

- Start from domain meaning, not file location, database tables, or UI widgets.
- Extract rules, policies, state transitions, and events before implementation details.
- Resolve vocabulary conflicts by proposing ubiquitous language candidates first.
- Do not force heavy tactical DDD patterns onto simple CRUD areas.
- Treat external APIs, DB schemas, and UI structures as secondary views of the domain, not the domain itself.

## 7. Current Strategic Design Baseline

Unless a task clearly says otherwise, agents should assume this project is organized around these bounded contexts:

- Case Management
- Customer Portal
- Commerce Integration
- Knowledge Policy
- Safety Intelligence
- Identity & Governance

For strategic interpretation, use:

- `docs/ddd/active/domain-landscape.md`
- `docs/ddd/active/bounded-contexts.md`
- `docs/ddd/active/context-map.md`
- `docs/ddd/active/ubiquitous-language.md`

For implementation detail, then use the matching `docs/specifications/active/*` documents.

## 8. Recommended Reading Paths by Task Type

### 8.1 Domain boundary or architecture question

Read in this order:

1. `docs/ddd/README.md`
2. `docs/ddd/active/domain-landscape.md`
3. `docs/ddd/active/bounded-contexts.md`
4. `docs/ddd/active/context-map.md`

### 8.2 Implementation/specification question

Read in this order:

1. `docs/specifications/README.md`
2. matching `docs/specifications/active/foundation/*`
3. matching `docs/specifications/active/modules/*`
4. `platform/*` only if cross-cutting rules are needed

### 8.3 Current scope/meeting-decision question

Read in this order:

1. `immediate-mvp-notes.md`
2. relevant active DDD/spec documents

## 9. Efficiency Guardrails

- Avoid reading every markdown file just because the user says “review the project.”
- “Review the whole project” means: identify all materials, classify them, then analyze with active/latest-first discipline.
- If a README or active index identifies the relevant authority, do not keep searching for more documents unless a real inconsistency appears.
- Stop reading when the decision can be grounded confidently in the current active set.

## 10. Output Discipline

When responding, agents should make it clear whether a claim is:

- from current active documentation,
- inferred from structure,
- or dependent on older/history documents.

If historical documents were not needed, do not mention them.
