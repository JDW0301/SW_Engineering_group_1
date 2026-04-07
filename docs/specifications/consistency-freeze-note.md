# Consistency Freeze Note Before Logic-Level Specs

## 1. Purpose

This document freezes the shared rules and canonical interpretations that should be treated as the writing baseline for upcoming logic-level detailed specifications.

It is not a replacement for active specification documents. It is a cross-cutting consistency note that reduces drift between multiple downstream logic specs.

## 2. Status of this note

- Scope: current project baseline before logic-level specs
- Source set:
  - `docs/ddd/active/*`
  - `docs/specifications/active/*`
  - `immediate-mvp-notes.md`
- Priority: this note should be used as a reconciliation layer when active documents still express the same decision in different places

## 3. Canonical terminology

## 3.1 Core case term

- The canonical implementation-facing term remains **`inquiry`**.
- `support case` may be used in strategic/DDD explanation, but downstream logic specs should map it explicitly to **`inquiry`** unless a later refactor changes the implementation term globally.

### Writing rule

- Strategic explanation: `support case (inquiry)` is allowed.
- Logic/data/application specs: prefer `inquiry`.

## 3.2 Conversation terms

- `inquiry_message`: message inside human-handled inquiry flow
- `chat_message`: message inside `chatbot_session`
- `conversation`: allowed as a general conceptual word, but not as the primary persisted entity name in the current implementation baseline

## 3.3 Chatbot handoff terms

- `chatbot_session` is a separate top-level entity from `inquiry`.
- Handoff means **creating an inquiry linked to an existing chatbot session**, not transforming the chatbot session into the inquiry entity itself.

## 4. Product and structure freeze

- Two app entries:
  - customer app
  - operator app
- One shared backend/domain/storage boundary
- Member-only customer access
- MVP single operator role

These should be treated as fixed baseline assumptions for downstream logic specs.

## 5. Data ownership freeze

## 5.1 External source of truth

- `customer`, `order`, `product` are external-source snapshots.
- Local data for those entities is operational snapshot data only.

## 5.2 Internal source of truth

- `inquiry`
- `inquiry_message`
- `chatbot_session`
- `chat_message`
- `internal_note`
- `ai_summary`
- `abuse_detection_result`
- `handoff_event`

These are internal-origin data and should not be treated as externally authoritative.

## 6. Lifecycle freeze

## 6.1 Inquiry states

The canonical MVP inquiry state set is:

- `OPEN`
- `WAITING`
- `IN_PROGRESS`
- `ON_HOLD`
- `RESOLVED`

No additional operational state enum should be introduced casually in downstream specs unless it is explicitly approved as a new cross-document decision.

## 6.2 Automation relationship to state

- Automation may suggest, summarize, detect, or trigger handoff.
- Automation does **not** directly own final inquiry-state authority.

## 6.3 Reopen and edge-case rule status

The following remain local unresolved items and should be handled explicitly inside the owning logic specs:

- reopen assignee retention
- hold reason codes
- resolve reason codes
- duplicate/linked inquiry handling
- concurrent operator response conflict handling

They are not globally re-opened architectural questions, but local rules that must be written carefully.

## 7. Content visibility freeze

## 7.1 Raw/display split

- `content_raw` and `content_display` are both canonical.
- Default UI/API output uses `content_display`.
- Raw visibility exists for customer-visible conversation scope, not for internal-only data.

## 7.2 Raw content visibility boundary

Customer and operator may access raw content only within customer-visible conversation scope.

The following stay excluded from raw visibility:

- internal notes
- internal operational judgment data
- internal processing-only intermediate data

## 8. Attachment freeze

- Customer attachments are allowed.
- Image only.
- Allowed formats:
  - `jpg`
  - `jpeg`
  - `png`
- Max size: 5MB per image
- Max count: 3 images per message
- Preview behavior:
  - thumbnail in conversation
  - click to expand
  - if preview fails, download only

Video, document, and other file types stay out of current MVP scope.

## 9. Summary and automation freeze

## 9.1 Summary policy

- One active summary per `inquiry` or `chatbot_session`
- Regeneration overwrites the previous summary
- Regeneration uses the full current conversation scope
- Summary history is not retained in MVP

## 9.2 Abuse detection policy

- Dictionary-based detection, not LLM judgment
- Detection modifies default display behavior, not raw storage

## 9.3 Chatbot knowledge-file policy

- File type: `.txt` only
- Max size: 3MB per file
- Multiple files may stay active at once
- If conflict exists, newest uploaded file wins
- If upload fails, existing active file set remains unchanged
- For school-project MVP scope, active file count is left unlimited

## 9.4 Knowledge-file upload UI policy

- Multi-file upload supported
- Active file list visible to operator
- Upload result shown per file (success/failure individually)

## 10. Handoff and auto-expiry freeze

## 10.1 Handoff rule

- Customer may request handoff from an active chatbot session at any time before auto-expiry.
- Handoff immediately creates `inquiry`.
- Linked chatbot context remains accessible to the operator.

## 10.2 Auto-expiry rule

Auto-expiry applies only to:

- `chatbot_session`
- inquiry created by chatbot handoff

And only when:

- there is no meaningful chatbot record, and
- there is no additional customer message

### Time value

- Auto-expiry time is fixed at **10 minutes**.

General inquiries do not use auto-expiry.

## 11. Auth/session freeze

- MVP authentication is session-based.
- Session expires on browser close.
- No inactivity timeout is used in current MVP scope.
- Re-entry after session loss leads back to login.

This is an MVP simplification rule and should be reconsidered if the project moves toward production-grade deployment.

## 12. Search and metrics freeze

## 12.1 Search scope

Operator search supports:

- customer name
- order number
- inquiry status
- inquiry type
- period
- product name

## 12.2 Period and timezone

Default period presets:

- today
- last 7 days
- last 30 days

Timezone baseline:

- `Asia/Seoul`

## 12.3 KPI interpretation

Fixed KPI set:

- inquiry count
- average first response time
- resolution rate

### KPI exclusions

- auto-expired inquiries excluded
- `is_test=true` inquiries excluded

### KPI UI rules

- average first response time: human-readable hour/minute format
- zero-count metrics:
  - inquiry count = `0`
  - average first response time = `-`
  - resolution rate = `-`

## 13. Webhook freeze

## 13.1 Integration event posture

- Webhook-first snapshot sync remains the default mechanism.
- Manual resync remains operator-triggered and entity-scoped.

## 13.2 Validation posture

- For current school-project MVP scope, webhook authenticity validation is intentionally omitted.
- This is not a production recommendation.

## 13.3 Retry posture

- Retry count: 3
- Retry interval: 1 minute / 1 minute / 1 minute

## 14. What this note does not settle

This note does not fully settle the following local implementation topics:

- retention window values
- delete vs anonymize implementation detail
- exact sensitive-field inventory
- exact retry backoff sophistication beyond the fixed MVP rule
- attachment storage vendor choice
- video policy
- exact message max length
- exact concurrency resolution mechanics

These should be resolved in the relevant downstream logic specs unless they grow into cross-document contradictions.

## 15. Rule of use

When a downstream logic-level spec sees a conflict between:

1. a stale unresolved marker in an older active file section, and
2. a decision frozen in this note,

the frozen rule in this note should be treated as the temporary canonical baseline until the active source section is explicitly updated.
