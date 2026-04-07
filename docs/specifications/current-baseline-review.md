# Current Baseline Review Before Logic-Level Specs

## 1. Review scope

This review is based only on the current active documents and `immediate-mvp-notes.md`.

- `docs/ddd/active/*`
- `docs/specifications/active/*`
- `immediate-mvp-notes.md`

No archive/history documents were used.

## 2. Overall judgment

The current baseline is **strong enough to begin logic-level detailed specifications soon**, but it is not perfectly clean yet.

The strategic direction, product shape, data ownership split, core inquiry lifecycle, chatbot handoff structure, customer/operator separation, KPI baseline, and webhook-first sync model are already stable enough to support deeper specification work.

The remaining weaknesses are mostly:

1. stale unresolved markers left behind in a few documents,
2. cross-cutting rules that still need one more cleanup pass,
3. a few implementation parameters that are now local, not architecture-blocking.

In other words:

> the project is no longer blocked at the architecture/policy level, but it still benefits from one more review-and-cleanup layer before logic specs branch into multiple documents.

## 3. What is already solid

### 3.1 Strategic architecture

- 6 bounded contexts are clearly defined in active DDD documents.
- The project direction is consistently **Modular Monolith**.
- `Commerce Integration` is correctly separated from internal case ownership.
- ACL around external commerce data is already part of the baseline.

### 3.2 Product and user structure

- Customer app and operator app are separated as two app entries.
- Both apps still share one backend, one domain model, and one storage boundary.
- Customer access is member-only.
- MVP operator role is intentionally simplified to a single operator role.

### 3.3 Data ownership and messaging

- `customer/order/product` are treated as external-source snapshots.
- `inquiry`, `inquiry_message`, `chatbot_session`, `chat_message`, `internal_note`, and automation outputs are internal originals.
- `content_raw` / `content_display` split is fixed.
- `chatbot_session` is separated from `inquiry`, and handoff creates `inquiry` immediately.

### 3.4 Lifecycle and automation

- Inquiry lifecycle is narrowed to 5 states:
  - `OPEN`
  - `WAITING`
  - `IN_PROGRESS`
  - `ON_HOLD`
  - `RESOLVED`
- Automation scope is intentionally limited to:
  - summary
  - dictionary-based abuse detection
  - store-information-based chatbot
- broad answer recommendation / full generative replacement is out of MVP.

### 3.5 Metrics and sync baseline

- KPI set is fixed:
  - inquiry count
  - average first response time
  - resolution rate
- webhook-first sync and per-entity manual resync are already fixed.
- search/filter and metrics now have a usable baseline.

## 4. What still threatens consistency

These are not broad architecture blockers, but they are still the most likely sources of rework if logic-level specs start without care.

### 4.1 Vocabulary drift

DDD documents lean toward `support case` / `conversation`, while active implementation specs still center on `inquiry`, `inquiry_message`, and `chat_message`.

This does not block implementation immediately, but it can create drift when logic-level docs start defining aggregates, commands, events, and naming conventions more deeply.

### 4.2 Lifecycle edge rules

The main state model is stable, but some edge behavior still remains locally unresolved:

- reopen assignee retention
- hold reason codes
- resolve reason codes
- duplicate inquiry relation handling
- concurrent operator response conflicts
- state-change vs new-message race handling

These do not block the entire next phase, but they will need to be resolved inside or just before the relevant logic specs.

### 4.3 Privacy / governance detail

The direction is stable, but exact implementation rules are not fully closed yet:

- sensitive-field inventory
- retention windows
- delete vs anonymize policy
- exact audit-log scope
- some raw-content access and file-handling details

### 4.4 Integration contract detail

The integration boundary is conceptually strong, but still underspecified at contract level:

- exact external target system shape
- field-level snapshot mapping scope
- deletion event handling
- retry interval/backoff policy
- event log retention policy

### 4.5 A few outdated or weak TODO traces may still exist

The active docs are far cleaner than before, but there may still be scattered “추가 정의 필요” markers that no longer reflect actual unresolved decisions.

These should be cleaned as part of a short reconciliation pass so logic-level specs inherit one truth.

## 5. What can safely be deferred

The following items can be handled later or inside local logic specs without blocking the next phase:

- physical document re-layout
- file storage vendor choice
- legal retention implementation details
- video policy (currently outside core MVP image flow)
- advanced BI / SLA dashboards
- multi-role operator expansion

## 6. Recommended cleanup before logic-level specs

This is the minimum recommended cleanup set before writing logic-level detailed specifications in earnest.

### 6.1 Freeze one canonical internal naming rule

Decide how the next-level specs will use:

- `support case`
- `inquiry`
- `conversation`
- `chatbot_session`

The key point is not to rename everything immediately, but to stop downstream logic docs from mixing terms inconsistently.

### 6.2 Resolve cross-cutting local rules once

Close the shared rules that will otherwise be repeated across many documents:

- lifecycle edge rules
- privacy/governance detail
- webhook retry interval / delete handling
- test inquiry treatment
- timezone and date preset rules

### 6.3 Remove stale unresolved markers

Before branching into deeper logic docs, it is worth doing one quick consistency pass so already-fixed decisions are not still written as TBD.

## 7. Practical conclusion

The current baseline is **not raw anymore**.

It already has enough stable structure to support logic-level specification writing.
What remains is not a large prerequisite discovery phase, but a short reconciliation phase followed by dependency-aware detailed writing.

The most practical interpretation is:

> Start the next phase soon, but start it from a reviewed and slightly cleaned baseline, not from the current active set without one final pass.
