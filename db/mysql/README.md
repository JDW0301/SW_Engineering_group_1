# MySQL Schema Notes

## Files
- `001_initial_safe_schema.sql`: current low-rework initial schema derived from active specification documents.

## Why this schema is called "safe"
- It creates tables that are already fairly stable in the active docs.
- It avoids hard-wiring a few cross-boundary assumptions that are still slightly inconsistent across active docs.
- It keeps cross-boundary references soft where the docs still need one more reconciliation pass.

## Intentional deferrals
- `inquiries.customer_id` is stored now, but not hard-FK-bound yet.
- `inquiries.order_id` / `product_id` are stored as soft references.
- Polymorphic ownership tables (`attachments`, `ai_summaries`, `abuse_detection_results`) do not use static foreign keys for all owners.
- No `inquiry_events` table yet; active docs explicitly defer it.

## Applying the schema
Run this against a reachable MySQL 8+ server:

```bash
mysql -u <user> -p < db/mysql/001_initial_safe_schema.sql
```

Or after selecting a server/database manually:

```bash
SOURCE db/mysql/001_initial_safe_schema.sql;
```

## Active-doc source set
- `docs/specifications/active/foundation/domain-model.md`
- `docs/specifications/active/modules/case-management-db-spec.md`
- `docs/specifications/active/modules/conversation-and-attachments-db-spec.md`
- `docs/specifications/active/modules/customer-portal-handoff-db-spec.md`
- `docs/specifications/active/modules/commerce-integration-db-spec.md`
- `docs/specifications/active/modules/safety-and-knowledge-db-spec.md`
