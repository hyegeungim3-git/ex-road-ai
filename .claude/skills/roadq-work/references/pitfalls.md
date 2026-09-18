# ex-road-ai 실전 함정 전집 (전부 실제 사고 이력)

빌드·자동화·배포·대량 편집 작업 전에 해당 절을 읽어라. 각 항목은 "언젠가 일어날 수 있는 일"이 아니라 **이미 일어난 일**이다.

## 목차
1. [빌드·경로](#1-빌드경로)
2. [파일 편집](#2-파일-편집)
3. [브라우저 자동화 검증](#3-브라우저-자동화-검증)
4. [배포 (GitHub Pages)](#4-배포-github-pages)
5. [코드 구조 계약](#5-코드-구조-계약)
6. [콘텐츠·키워드](#6-콘텐츠키워드)

## 1. 빌드·경로

- **한글 경로 네이티브 크래시**: 이 머신에서 `npx vite build`는 `C:\한국부동산원` 경로 탓에 "✓ N modules transformed" 직후 종료 코드 0xC0000409로 조용히 죽는다. 7주간 "transformed가 나왔으니 통과"로 오판했다. 판정 기준은 **EXIT 0 + "✓ built in Xs" + dist/ 갱신** 3종 세트.
- **robocopy /XD 상대명**: ASCII 복사 빌드에서 `/XD dist`(상대명)를 쓰면 `node_modules/vite/dist`까지 제외돼 ERR_MODULE_NOT_FOUND로 깨진다. **/XD는 절대경로**로.
- 복사본 빌드 후 임시 폴더는 반드시 삭제 (사본 방치 금지).

## 2. 파일 편집

- **PowerShell 치환 금지**: `Get-Content | -replace | Set-Content`는 UTF-8 한글 파일을 파괴한다. Edit 도구만 사용, 대량 치환은 Python `io.open(..., encoding='utf-8')`.
- **블록 주석 안 `*/` 문자열 금지**: 주석에 `press*/report*` 같은 표기를 쓰면 주석이 조기 종결돼 빌드가 파괴된다. 두 번 밟은 함정.
- git 커밋 메시지에 쌍따옴표(") 금지 — PowerShell 파싱이 깨진다. here-string `@'...'@` (닫는 `'@`는 줄 시작).
- **`git add -A` 전에 `git status`**: 이전 세션이 남긴 미커밋 변경이 마감 커밋에 딸려 들어가 그대로 배포된다(2026-07-31 ChatbotAgent 첨부 기능이 미완성 상태로 push됨 — 첨부가 말풍선에 렌더되지 않아 전송 순간 사라지는 상태였다). 딸려 들어왔다면 되돌리기보다 **검증해서 완성하거나 별도 커밋으로 분리**하고, 경위를 보고에 남길 것.

## 3. 브라우저 자동화 검증

- **사이드바 접힘 상태 승계**: '일반/에이전트/보안' 탭 버튼은 사이드바 안에 있어서, 접힘 상태면 텍스트 매칭이 조용히 실패한다. **항상 aria-label '사이드바 펼치기' 존재를 먼저 확인**하고 펼친 뒤 탭을 클릭하라.
- **setTimeout 체인보다 단계별 호출**: 한 javascript_exec 안에서 클릭을 setTimeout으로 체이닝하면 타이밍이 어긋나 중간 단계가 조용히 빠진다. 클릭 1회 = 호출 1회 + 상태 확인이 안정적.
- **콘솔 에러 버퍼는 세션 누적**: 편집 도중 HMR 오류(구문 오류·미정의 임포트)가 버퍼에 남는다. 최종 상태 판정은 리로드 후 새 에러 여부 + ASCII 빌드로. 스테일 에러를 보고 회귀로 오판하지 말 것.
- **스크린샷 타임아웃**: computer screenshot이 30초 타임아웃으로 죽는 일이 잦다. DOM 텍스트 검증이 1순위, 스크린샷은 보조.
- **모바일 검증은 신규 로드로**: 데스크톱에서 리사이즈하면 열려 있던 패널 상태가 승계된다(현재는 자동 닫힘 처리됨). 그래도 모바일 판정은 375에서 reload한 상태를 기준으로.
- 대화형 답변은 타이핑 연출(~1.8s+)이 있다 — 전송 후 4~6초 대기 후 판정.
- **백그라운드 탭 타이머 스로틀**: 자동화 세션에서 브라우저 pane 탭의 setInterval이 수십 초에 1회로 스로틀될 수 있다(순수 관찰용 샘플러조차 멈춤). 앱 타이머가 "멈춘 것처럼" 보이면 앱 버그가 아니라 이것부터 의심 — 판정용 샘플러가 실제로 돌았는지(샘플 개수) 먼저 확인. 앱 쪽 대책: 시간 진행은 tick 횟수가 아니라 **벽시계 경과 × 배속**으로 계산(liveEngine 사용처 참조).
- **setState 업데이터 안 부수효과 금지**: 업데이터 내부에서 다른 setState·토스트를 호출하면 StrictMode 이중 호출로 중복 실행된다(라이브 알림 중복 사례). 엔진류는 ref를 정본으로 두고 부수효과는 업데이터 밖에서.

## 4. 배포 (GitHub Pages)

- **Pages 일시 오류 상습 재발**: build는 success인데 deploy-pages만 "try again later"로 실패하는 패턴이 4회 이상. **실패 런 `rerun --failed` 금지**(아티팩트 중복) — `gh workflow run`으로 새 런을 실행.
- **Pages 설정 소실 (일시 오류와 구분할 것)**: `configure-pages@v5` 단계에서 `Get Pages site failed ... Not Found`로 **build 자체가 실패**하면 일시 오류가 아니라 저장소의 Pages 설정이 사라진 것이다(2026-07-30 v3에서 발생, 새 런 재시도 2회 모두 같은 지점 실패). 판정: `gh api repos/<owner>/<repo>/pages` → 404면 확정. 복구: `gh api repos/<owner>/<repo>/pages -X POST -f build_type=workflow` 후 새 런. **구분 기준 — deploy만 실패=일시 오류(새 런), build의 configure-pages 실패=설정 소실(재활성화 먼저).**
- **라이브 마커는 올바른 청크에서**: lazy 컴포넌트 문자열(OrchestrationScenario, UserApp 소속 텍스트)은 index-*.js에 없다. index에서 청크 파일명을 추출해 해당 청크를 받아 확인. `App-[\w-]+\.js` 정규식은 `\b` 없이 쓰면 "UserApp-..."에 오매칭된다.
- **청크 크롤은 1단계로 끝내지 말 것**: index에서 뽑은 청크만 받으면 에이전트 컴포넌트처럼 **2단계 이상 아래 lazy 청크**의 문자열이 "없음"으로 나온다(2026-07-31 오판 1회 — 팩 마커는 나오는데 코어 마커만 빠져 보임). 큐로 BFS 크롤(`"./xxx.js"` 참조를 계속 따라가며 ~26개)해서 판정할 것.
- 배포 주소·리모트 역할은 CLAUDE.md 배포 표가 정본 — push 전에 origin이 어느 저장소인지 확인.

## 5. 코드 구조 계약

- **admin mocks.js 3곳 등록**: 새 상수는 `export let` 선언 + `__REB_DEFAULTS` + `applyAdminDomain` 매핑 3곳 모두 등록해야 도메인 전환이 먹는다. 누락 시 에러 없이 REB 값이 그대로 노출된다.
- **agentContent는 통째 교체 계약**: 배열·객체 키는 REB 기본값과 항목 수·shape을 맞춰야 한다(코어가 인덱스·키에 의존). 값 계약 고정 키(dbSources.key, modeTypes.m 등)는 AGENT-CONTENT-SCHEMA.md의 "고정" 표기 참조.
- **orchestration**: 객체 1개(하위호환) 또는 배열. 라우팅 id는 `orchestration:<idx>`. attachment는 선택(알람 트리거형은 생략).
- 스키마 정본은 문서가 아니라 **각 에이전트 파일 상단 CONTENT_DEFAULTS** — 문서와 코드가 다르면 코드가 맞다(그리고 문서를 고쳐라).

## 6. 콘텐츠·키워드

- **sampleAnswers 순서 = 우선순위**: `find` 첫 매칭이 이긴다. 광범위 키워드('프레스', '보고서') 항목보다 구체 항목을 앞에. 새 제안 카드 질의를 만들면 mapIntel metricKeywords와 충돌하는지 먼저 확인(지도 매칭이 sampleAnswers보다 우선).
- **금칙어 스캔은 DOM에서**: 소스 grep만으로는 코어 하드코딩 누수를 못 잡는다(과거 MCP 서버 페이지 api.reb.or.kr 누수는 DOM 스캔에서만 발견). verify.mjs 또는 QUALITY-CHECKLIST B-2 절차로.
- 검수 오탐 이력: SelfCheckModal·buildRawText·SummaryAgent 비교테이블은 정상 동작이다 — "죽은 코드"로 보고하지 말 것 (재검증 완료된 사안).
- **이름은 한 곳에서만 정의**: 팩 `agentCatalog.name`(바깥 허브·헤더)과 컴포넌트 `CONTENT_DEFAULTS.headerTitle`(안쪽 화면)에 이름이 따로 있으면, 팩이 headerTitle을 생략한 도메인에서 **안쪽에 REB 기본 문구가 뜬다**(병원 EMR 화면에 "부동산 대장 조회"가 실제로 노출됐다). 코어는 `팩 headerTitle > 팩 agentCatalog.name > AGENT_TEAMS.name` 승계 체인을 쓰고, 팩은 이름을 카탈로그에만 적을 것. **verify.mjs는 에이전트 내부 화면을 스캔하지 않으므로 이 유형은 자동 판정에 안 걸린다** — 새 도메인 추가 시 13종 내부 화면 제목을 눈으로 확인.
- **죽은 입력 컨트롤도 세 종류다**: ①`onChange` 없음 ②`value`만 있고 `onChange` 없음 ③**핸들러도 상태도 있는데 결과에 안 쓰임**(통합 로그 검색어가 실제 사례 — `q` 상태는 갱신되는데 행 필터가 원본 배열을 그대로 map). ③은 스캔으로 못 잡으니 필터/검색은 **값 변경 → 행 수 변화**로 판정할 것.
- **죽은 버튼은 두 종류다**: ①`onClick` 자체가 없는 무동작 ②핸들러는 있는데 안에서 터지는 크래시. 정적 스캔(`<button>`에 onClick 유무)은 ①만 잡는다. 실제 사고: 관리자 9개 컴포넌트가 `const { setToast } = useToast()`로 구조분해했는데 **useToast()는 함수(addToast)를 반환** → 41개 지점이 클릭 즉시 `TypeError: setToast is not a function`. 판정법: 훅/컨텍스트의 **provider value 타입을 먼저 확인**하고, 의심 지점은 브라우저에서 `window.addEventListener('error', …)` 걸고 클릭할 것(React가 에러를 비동기로 다시 던져 try/catch로는 안 잡힌다). 토스트처럼 3초 후 사라지는 UI는 MutationObserver로 관측.
- 세계관 수치는 발명 전에 grep: 같은 사건의 숫자(신고 47건, RMS 4.2mm/s, 1,842건)가 팩 안 여러 필드에 흩어져 있다. 한 곳만 고치면 데모에서 모순이 노출된다.
