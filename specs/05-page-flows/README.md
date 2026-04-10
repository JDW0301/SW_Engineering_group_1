# 페이지 흐름 문서

## 목적

이 폴더는 이 프로젝트에서 실제로 필요한 페이지를 사용자 흐름 기준으로 단순하게 정리한다.

기존 `/home/tjwocjf0915/workspace/SWE_project` 문서는 매우 상세한 모듈별 UI 명세를 가지고 있었지만, 이 프로젝트에서는 학생 프로젝트 수준에서 구현 가능한 페이지 집합으로 다시 묶어 설명한다.

## 문서 읽기 원칙

- 먼저 공용 진입 구조를 읽는다.
- 그 다음 운영자 앱과 고객 앱 페이지를 각각 읽는다.
- 마지막으로 교차 기능이 각 페이지 어디에 붙는지 확인한다.

권장 읽기 순서는 아래와 같다.

1. `00-shared-entry-and-routing-pages.md`
2. `01-operator-app-pages.md`
3. `02-customer-app-pages.md`
4. `03-features-logic-page-hooks.md`
5. `04-technical-reference-page-mapping.md`

## 정리 기준

- `customer-app`과 `operator-app`은 같은 백엔드와 도메인을 공유하지만 페이지와 사용자 경험은 분리한다.
- 페이지 수를 불필요하게 늘리지 않는다.
- 검색, 지표, 요약, 안전 보조, 스냅샷 맥락은 가능하면 기존 핵심 화면 안의 영역으로 넣는다.
- 독립 화면이 꼭 필요한 경우에만 별도 페이지로 분리한다.

## 이 폴더가 직접 다루는 것

- 어떤 페이지가 필요한지
- 각 페이지의 목적과 핵심 UI
- 사용자 흐름 기준 페이지 이동
- 어떤 기능이 어느 페이지에 들어가야 하는지

## 이 폴더가 직접 다루지 않는 것

- 세부 API 형식
- 세부 DB 컬럼 정의
- 복잡한 예외 매트릭스
- 엔터프라이즈형 운영 정책

## 원문 기준 문서 매핑

이 문서 세트는 주로 아래 원문을 단순화해 옮긴 결과다.

- `SWE_project/docs/specifications/active/modules/ui/customer-portal-handoff-ui-spec.md`
- `SWE_project/docs/specifications/active/modules/ui/case-management-ui-spec.md`
- `SWE_project/docs/specifications/active/modules/ui/conversation-and-attachments-ui-spec.md`
- `SWE_project/docs/specifications/active/modules/ui/safety-and-knowledge-ui-spec.md`
- `SWE_project/docs/specifications/active/modules/ui/metrics-and-search-ui-spec.md`
- `SWE_project/docs/specifications/active/modules/ui/commerce-integration-ui-spec.md`

핵심 해석은 단순하다.

- 고객은 `문의`와 `챗봇` 중심으로 움직인다.
- 운영자는 `문의 목록`과 `문의 상세` 중심으로 움직인다.
- 나머지 기능은 대부분 이 두 흐름을 돕는 보조 영역이다.
