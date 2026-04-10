# AGENTS

## Project Identity
- This project is a rebuilt university-level software engineering project.
- It is not a production-grade enterprise system.
- The core product theme must be preserved: a small-seller customer support platform with a customer app and an operator app.

## Core Mission
- Preserve the full product theme and major feature groups.
- Reduce implementation complexity to a student-manageable level.
- Prioritize visible screens, end-to-end flows, and demoable behavior.
- Avoid enterprise-heavy planning, governance, and hardening unless the user explicitly asks for them.

## Must Preserve
- `customer-app` and `operator-app` as distinct user experiences.
- Inquiry-centered support flow.
- Customer / order / product context connected through imported snapshot-style data.
- Customer self-service chatbot and handoff to human support.
- Operator workspace for inquiry review, response, notes, and status updates.
- Knowledge support, summary, safety-assist, search, and metrics as project themes.

## Must Simplify
- Fine-grained permissions and role matrices.
- Enterprise-style audit, governance, compliance, and retention detail.
- Deep recovery, event-log, retry/backoff, and traceability workflows.
- Excessive validation branches and edge-case matrices.
- Infrastructure-heavy or policy-heavy explanations that do not help a student implement the project.

## Product Modeling Rules
- Treat this as a working university project, not an enterprise helpdesk platform.
- Prefer happy-path behavior and simple state transitions.
- Keep the inquiry as the center of the system.
- Use imported snapshot-style commerce context instead of deep external-system replication.
- When choosing between realism and over-engineering, choose the simpler model that still preserves the product idea.

## Identity and Linking Rules
- Keep local account identity and imported external snapshot identity separate.
- Do not treat the local logged-in user and the external customer snapshot as automatically identical.
- Use simple link/claim style modeling where needed.
- Mock phone-verification / verification-provider simulation is allowed as a school-project simplification.
- Mock verification must be described as a simulation of an external verification provider, not as real legal identity verification.
- Do not introduce resident registration number collection.

## Documentation Layer Rules
- Keep shared product structure separate from customer-only behavior and operator-only behavior.
- Do not describe shared routing or entry structure as if it were a customer-only action.
- Do not place operator-only actions inside customer feature sections.
- Do not place customer-only actions inside operator feature sections.
- Put high-level product identity and shared entry/routing in overview documents.
- Put customer-visible flows in `02-customer-app/`.
- Put operator-visible flows in `01-operator-app/`.
- Put cross-cutting feature logic in `03-features-and-logic/`.
- Put API/schema summaries in `04-technical-reference/`.

## Writing Rules
- Write in clear, direct language.
- Prefer concrete screens, flows, and visible behavior over abstract platform language.
- Keep terminology consistent across overview, app, logic, and technical docs.
- Avoid actor confusion: always make the acting subject clear.
- Avoid responsibility-boundary blur: do not mix system routing, customer behavior, and operator behavior in the same bullet list unless the doc is explicitly about shared structure.

## Common Failure Modes To Avoid
- Rebuilding the project into an industry-scale platform again.
- Turning documentation into backend-first architecture planning instead of product-flow documentation.
- Mixing customer, operator, and shared-entry responsibilities.
- Adding workflow/history tables that do not buy meaningful clarity for a student implementation.
- Over-specifying exception handling before the main product flow is understandable.

## Review Standard For Future Sessions
- Before adding complexity, check whether the feature theme can be preserved with a simpler model.
- Before editing specs, verify that the target content belongs in that document layer.
- If a sentence can be misread about who is acting, rewrite it.
- If a section sounds like enterprise policy rather than student-implementable product behavior, simplify it.
