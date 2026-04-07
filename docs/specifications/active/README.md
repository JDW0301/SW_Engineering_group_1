# Active 명세 문서 안내

이 디렉터리는 현재 기준으로 사용해야 하는 상세 명세 문서 세트이다.

## 구성 원칙

- `foundation/`: 다른 문서의 기준이 되는 선행 정의 문서
- `modules/`: 기능 단위 상세 명세 문서
- `platform/`: 연동, 보안, 예외 처리, 공통 제약 문서

## 현재 기준 문서 우선순위

1. `foundation/product-scope.md`
2. `foundation/domain-model.md`
3. `foundation/roles-and-permissions.md`
4. `foundation/case-lifecycle.md`
5. `modules/customer-portal-and-self-service.md`
6. `modules/workspace-and-inquiry-operations.md`
7. `modules/chat-and-attachments.md`
8. `modules/ai-assistant-and-knowledge.md`
9. `modules/metrics-and-search.md`
10. `platform/integration-security-and-constraints.md`
11. `platform/webhook-event-flow.md`

위 순서는 단순 읽기 순서가 아니라, 실제 작성 및 구현 선행 순서를 겸한다.
