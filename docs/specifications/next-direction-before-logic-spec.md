# Next Direction Before Logic-Level Specs

## 1. Goal

This document defines the most practical next sequence after the current baseline review, before and during logic-level detailed specification writing.

The purpose is not broad project management, but to reduce rework by writing the next documents in dependency order.

## 2. Main conclusion

There is **no longer a need for a large prerequisite phase**.

The recommended path is:

1. do one short reconciliation/cleanup pass,
2. freeze remaining cross-cutting local rules,
3. start logic-level detailed specs in dependency order.

## 3. What must be done before logic-level specs

These are the few remaining items that still have cross-document impact.

### 3.1 Naming/term freeze

Before deeper logic specs branch out, define one canonical internal mapping for:

- `support case`
- `inquiry`
- `conversation`
- `chatbot_session`

This can be done as a short naming/terminology note, not a large rewrite.

### 3.2 Cross-cutting rule freeze

Freeze the items that would otherwise repeat inconsistently:

- lifecycle edge rules
- test inquiry exclusion
- timezone / date preset rules
- webhook retry interval and delete handling
- privacy/governance detail needed across multiple specs

### 3.3 Active doc cleanup

Do one more short pass to remove stale unresolved markers where decisions are already fixed.

## 4. What can be decided during logic-level specs

The following items do **not** need to block the start of detailed logic writing:

- message max length
- note edit-history detail
- attachment storage backend choice
- event log retention detail
- precise upload UI polishing
- file storage implementation detail
- advanced dashboard behavior

These should be resolved inside the relevant spec as local decisions.

## 5. Recommended writing order

The next detailed specs should not be written by feature popularity, but by dependency.

### 5.1 Case Management logic spec first

Why first:

- It is the center of the system.
- Customer Portal, Safety Intelligence, and Commerce Integration all feed into it.
- Inquiry lifecycle, state transitions, assignment handling, reopen behavior, and context assembly all belong here.

Should cover:

- inquiry creation
- state transition rules
- reopen handling
- assignment and concurrency rules
- `case_context_bundle`
- missing linkage behavior for order/product/customer snapshots

### 5.2 Customer Portal / Handoff logic spec second

Why second:

- Customer flow creates or feeds cases but does not own case state.
- It depends on stable case creation and visible-state semantics.

Should cover:

- customer inquiry creation
- customer message append rules
- chatbot-to-inquiry handoff
- customer-visible state mapping
- auto-expire candidate flow

### 5.3 Conversation / Attachments logic spec third

Why third:

- Shared by portal, workspace, and chatbot behavior
- Needed before deeper automation logic becomes precise

Should cover:

- message write/read rules
- `content_raw` / `content_display`
- attachment validation
- preview fallback
- deletion/retention hooks

### 5.4 Safety Intelligence / Knowledge logic spec fourth

Why fourth:

- Depends on stable conversation inputs
- Provides signals and knowledge, but should not own final inquiry state

Should cover:

- summary regeneration rules
- abuse detection flow
- knowledge-file selection rules
- chatbot answer boundary
- handoff linkage

### 5.5 Commerce Integration logic spec fifth

Why fifth:

- Important, but core case logic can already be specified before all external sync details are fully expanded
- Current workspace behavior already tolerates stale or missing snapshot linkage

Should cover:

- canonical integration events
- ACL translation rules
- idempotent snapshot upsert
- manual resync behavior
- stale/missing snapshot handling

### 5.6 Metrics / Search logic spec last

Why last:

- Derived from lifecycle, timestamps, exclusions, and integration assumptions
- Best written after the operational logic is fully grounded

Should cover:

- KPI derivation rules
- event-time aggregation
- period presets/timezone
- exclusion rules
- list/sort/read-model behavior

## 6. Immediate practical next steps

The most practical immediate sequence from now is:

1. final active baseline cleanup,
2. naming / cross-cutting rule freeze note,
3. start `Case Management` logic-level spec,
4. continue in the order above.

## 7. Working rule for the next phase

During logic-level spec writing:

- do not reopen already stable product decisions unless a real contradiction appears,
- resolve local unresolved items inside the owning spec whenever possible,
- only escalate to cross-document decision status when the issue affects multiple contexts.

## 8. Final recommendation

The repo is ready to move forward.

Not because everything is perfectly complete, but because the remaining open items are now mostly **localized**, not **foundational**.

The next phase should therefore be:

> **short cleanup -> dependency-ordered logic specs -> local rule resolution inside each spec**
