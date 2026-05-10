# Draft: SW Engineering Group 1 Runbook

## Requirements (confirmed)
- [request]: `/home/donguk/project2/SW_Engineering_group_1` 경로 안에서 md 파일을 읽고 DB와 서버, 클라이언트 실행 방법을 알려달라

## Technical Decisions
- [approach]: 루트 및 server 문서와 실행 스크립트를 우선 근거로 사용한다

## Research Findings
- [README]: 루트 README에 자동 실행(`./start-dev.sh`)과 수동 DB/서버/프론트 실행 명령이 정리되어 있다
- [start-dev.sh]: 로컬 MySQL은 루트의 `.local-mysql/` 아래에서 3307 포트로 실행된다
- [vite.config.js]: 프론트는 `/api` 요청을 `http://localhost:4000`으로 프록시한다

## Open Questions
- [none yet]

## Scope Boundaries
- INCLUDE: 실행 절차, 필요한 명령, 접속 URL, 종료 방법, 주의사항
- EXCLUDE: 실제 실행 대행, 코드 수정, 환경 구성 변경
