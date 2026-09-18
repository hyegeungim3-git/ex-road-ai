# RoadQ Project Instructions

이 저장소에서 작업하는 모든 에이전트·기여자에게 적용되는 규칙.
서술형 배경과 "왜"는 [CLAUDE.md](CLAUDE.md)와 [docs/DECISIONS.md](docs/DECISIONS.md)에 있다. 여기에는 **지켜야 할 것**만 적는다.

## 1. 범위

- 이 저장소는 한국도로공사용 도로 시계열 데이터 AI 데모 플랫폼 **RoadQ**다(공급사 OCUBE).
- 정식 도메인 팩은 `expressway` **1개**(창립 도메인)다. 팩이 1개면 포털의 도메인 스위처는 자동으로 숨는다.
- JavaScript/JSX를 유지한다. TypeScript·새 런타임 라이브러리는 명시적 승인 없이 도입하지 않는다.
- 해시 라우팅 URL 계약(`#/<domainId>/user/<tab>`, `#/<domainId>/admin/<menuId>`)은 마이그레이션 계획과 회귀 테스트 없이 바꾸지 않는다.

## 2. 진실의 원천

- **콘텐츠 수치·인물·식별자**: [docs/WORLD-LEDGER.md](docs/WORLD-LEDGER.md)가 단일 원장이다. 새 값은 **원장에 먼저 등재하고** 쓴다. 팩에서 즉흥으로 숫자를 만들지 않는다.
- **필드 스키마**: 문서가 아니라 **코드**가 정본이다 — 각 에이전트 파일 상단 `CONTENT_DEFAULTS`, `src/user/liveEngine.js`·`src/user/timeseries/engine.js` 상단 주석, 그리고 실제 소비 지점.
- **불변식·기각한 대안**: [docs/DECISIONS.md](docs/DECISIONS.md). 결정이나 운영 절차가 바뀌면 같은 커밋에서 갱신한다.
- 작업 절차·실사고 목록: `.claude/skills/roadq-work/`(오케스트레이터 + `references/pitfalls.md`), `.claude/skills/roadq-pack/`(콘텐츠 작성), `.claude/skills/roadq-verify/`(검증 스크립트).

## 3. 아키텍처 경계

- `src/RootApp.jsx`, `src/UserApp.jsx`, `src/App.jsx`, `src/user/**`, `src/admin/**`, `src/core/**`는 **도메인 중립 인프라**다.
- 인프라는 구체적인 도메인 팩을 직접 import하지 않는다. 도메인 데이터는 `src/domains/index.js`의 리졸버(`getDomain`/`getDomainList`)와 `src/user/scenarios.js`의 `allScenarios(domain)`를 통해서만 읽는다.
  - `DOMAINS[...]` 직접 참조의 **유일한 승인 예외**는 팩 스튜디오(`src/admin/pages/packstudio.jsx`)의 베이스 팩 선택이다.
- `src/domains/`가 도메인 용어·목업·에이전트 콘텐츠·워크플로·테마를 소유한다. 공유 UI에 도메인 분기를 하드코딩하지 않는다.
- **코어 기본값은 중립이 아니라 도로공사 콘텐츠**다(창립 도메인). 팩이 생략한 필드는 도로공사 콘텐츠로 채워진다 — 팩을 늘릴 때 이를 전제로 오버라이드한다.
- `src/admin/mocks.js`에 상수를 추가하면 **`export let` · `__REB_DEFAULTS` · `applyAdminDomain` 3곳에 등록**한다(누락 시 팩 오버라이드가 조용히 무시된다). `__REB_DEFAULTS`는 유산 이름이지만 리졸버 계약이므로 개명하지 않는다.
- 공유 UI는 `src/user/components/` 또는 `src/admin/components/`에 둔다. 페이지 전용 UI는 페이지 옆에 둬도 된다.
- 큰 목업 카탈로그는 데이터 전용 모듈로 둔다. UI 컴포넌트가 목업 정의를 소유·변형하지 않는다.

## 4. 상태·목업·보안

- 브라우저 저장소 접근은 `src/core/demoStorage.js` 어댑터만 사용한다. `src/` 어디에서도 `localStorage.*`를 직접 호출하지 않는다.
- 키는 네임스페이스 `roadq.*`이며 `makeGlobalStorageKey`/`makeDomainStorageKey`로 만든다.
- `localStorage`는 **명시적으로 이름 붙인 데모 영속성**일 뿐이다. 인증·인가·보안 저장소가 아니다.
- **SECURE(민감) 모드의 입력·출력은 절대 저장하지 않는다.** 호출부가 `{ sensitive: true }`를 넘기면 읽기는 fallback만 반환하고 쓰기·삭제는 실패를 반환한다.
- 목업·시뮬레이션 데이터는 UI나 문서에서 **식별 가능해야 한다**(예: "시뮬레이션 데이터" 출처 표기). 이 표기를 지우지 않는다.
- 실데이터/API 경로가 실패했을 때 조용히 목업으로 폴백하지 않는다. 폴백했음을 사용자에게 보여준다.
- 비밀키·개인정보·운영 자격증명·비공개 엔드포인트를 절대 커밋하지 않는다.

## 5. 구현 워크플로

1. 편집 전에 해당 리졸버·소비 지점·검증 하네스를 먼저 읽는다(추측으로 필드를 쓰지 않는다).
2. 가장 작은 일관된 변경을 하고, 계획에 없는 동작 변경은 하지 않는다.
3. **파일 수정은 Edit 계열 도구로 한다.** PowerShell `-replace`/`Set-Content`는 한글 UTF-8 파일을 파괴한다. 대량 치환은 Python(UTF-8 명시)으로 하고 임시 스크립트는 실행 후 삭제한다.
4. 블록 주석 안에 `*/`를 포함하는 문자열을 쓰지 않는다(주석 조기 종결로 빌드가 깨진 사고가 두 번 있었다).
5. 스테이징 전 `git status`·`git diff`를 확인하고 의도한 경로만 올린다. 커밋 메시지는 간결한 한국어(무엇을·왜)이며 쌍따옴표를 넣지 않는다.
6. 코어를 고쳐야 할 것 같으면 그건 "코어가 덜 일반화됨" 신호다 — **코어 일반화 커밋과 팩 콘텐츠 커밋을 분리**한다.

## 6. 필수 검증

- `npm run lint` — 에러 0건.
- `npm run check:domains` / `check:ontology` / `check:storage` — 전부 통과.
- 빌드는 **ASCII 경로**에서 수행하고 **종료 코드 `0` + Vite의 `built in` 마커**를 함께 확인한다. "transformed" 라인만 보고 통과로 판정하지 않는다.
- `.claude/skills/roadq-verify/scripts/`의 해당 스크립트를 영향받는 도메인에 대해 실행한다(`verify.mjs` 기본, 팩·공용 화면 변경 시 `deepscan.mjs`, 관리자 변경 시 `adminscan.mjs`).
- UI 동작을 바꿨으면 브라우저에서 해당 경로를 열어 **DOM 텍스트로 확인**하고 콘솔 에러를 본다.
- 데이터 탭(시계열)을 건드렸으면 4개 축이 모두 렌더되고 **'현재 관측'이 원장 수치와 일치**하는지 확인한다.
- 건너뛴 검사와 그 이유를 인수인계에 기록한다. **실행하지 않은 검사를 통과로 보고하지 않는다.**
- 완료 보고 전 [docs/QUALITY-CHECKLIST.md](docs/QUALITY-CHECKLIST.md)를 실행한다.

## 7. GitHub·배포

- `origin`은 `ex-road-ai`이며 `main` push 시 GitHub Actions가 Pages로 배포한다. 포크 원본 저장소로 push하지 않는다(push 전 remote 확인).
- CI는 재현 가능한 설치(`npm ci`)를 쓰고 lockfile을 지우지 않는다.
- CI는 lint → 계약 검사 → build를 통과해야 Pages 배포로 넘어간다.
- 저장소명·Vite `base`·Pages 워크플로·공개 메타데이터는 모두 `ex-road-ai`로 일치해야 한다.
- 배포 확인은 라이브 200 + **변경이 든 청크에서 마커 확인**까지다. Pages deploy 단계만 실패하면 실패 런 rerun이 아니라 새 런을 띄운다.
