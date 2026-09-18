# 품질 검수 체크리스트

> **완료 보고 전 실행 필수.** "코드를 썼다"는 완료가 아니다 — 완료 = 빌드 통과 + 실행 검증 + 증거.
> 각 절의 명령·스크립트는 복사해서 그대로 실행 가능하도록 유지한다(코드가 바뀌면 이 문서도 갱신).
> 판정 규칙의 근거: [DECISIONS.md ADR-3·ADR-11](DECISIONS.md) / 실사고 목록: [pitfalls.md](../.claude/skills/roadq-work/references/pitfalls.md)

## A. 모든 변경 공통

- [ ] 계약 검사 통과 (CI와 같은 게이트, 로컬에서 몇 초) — 저장소 루트에서
  ```bash
  npm run lint && npm run check:domains && npm run check:ontology && npm run check:storage
  ```
- [ ] 빌드 통과 확인 — **"transformed" 라인이 아니라 종료 코드로 판정할 것.** 저장소가 한글 경로 아래 있어 transform 직후 조용히 크래시한다([CLAUDE.md §4-4](../CLAUDE.md)).
  ```powershell
  # 저장소 루트에서 실행. 경로를 변수로 잡아 쓴다(절대경로를 문서에 박지 않는다)
  $SRC = (Get-Location).Path
  # ⚠️ /XD에 상대명 dist를 쓰면 node_modules\vite\dist까지 제외되어 빌드가 ERR_MODULE_NOT_FOUND로 깨진다 — 반드시 절대경로로
  robocopy $SRC $env:TEMP\roadq-build /E /XD "$SRC\.git" "$SRC\dist" | Out-Null
  cd $env:TEMP\roadq-build; node node_modules\vite\bin\vite.js build; "EXIT=$LASTEXITCODE"   # EXIT=0 + "✓ built in Xs" 필수
  cd $SRC; Remove-Item -Recurse -Force $env:TEMP\roadq-build
  ```
  (push 후 CI 빌드 성공으로 갈음 가능 — 오히려 이쪽이 더 신뢰할 수 있다)
- [ ] 프리뷰 서버로 변경 화면 진입, **DOM 텍스트로 확인** (스크린샷은 보조 증거). dev 서버는 `.claude/launch.json`의 `roadq` 구성(포트 5176, 점유 시 자동 배정)으로 띄운다. `npm run dev`만 실행하면 vite 기본 포트 5174다 — 어느 쪽이든 **시작 로그의 실제 주소**를 따를 것(경로에 `/ex-road-ai/` base가 붙는다)
- [ ] 브라우저 콘솔 에러 0건 (풀 리로드 후 새로 쌓인 것만 — 세션 누적 HMR 오류는 스테일일 수 있다)
- [ ] 자동 검증 스크립트 통과
  ```bash
  node .claude/skills/roadq-verify/scripts/verify.mjs http://localhost:5176/ex-road-ai/   # EXIT 0
  ```
- [ ] 의도치 않은 파일 변경 없는지 `git status --short` 확인 후 커밋(한국어, 무엇을·왜)
- [ ] push 후 `gh run watch <id> --exit-status` 성공 + 라이브 URL 200 + **변경이 든 청크에서 마커 확인**(lazy 청크는 index 번들에 없다)

## B. 도메인 팩 검수 (팩 추가·수정 시 필수)

### B-1. 정적 검사

- [ ] `src/domains/index.js`에 import + `DOMAINS` + `DOMAIN_LIST` 등록됨 (`npm run check:domains`가 판정)
- [ ] **`.claude/skills/roadq-verify/scripts/scan-config.mjs`의 `DOMAINS` 배열에 판정 기준(`banned`·`generalMarkers`·`hubMarkers`·`orchCards`·`dataMarkers`) 등록됨** — 누락 시 새 도메인이 자동 검증에서 빠짐
- [ ] 필수 필드 전부 존재 (id/orgName/orgShort/orgEn/sectorLabel/platformTitle/brandColor/welcome/statusBadge/footerNote/userFeatures/user/workspaces/llmModels) — `check:domains`가 일부만 기계 판정하므로 나머지는 눈으로
- [ ] `orchestration`이 **배열**로 존재 (시나리오가 없어도 `[]` — 필드를 빼면 `check:domains` 실패)
- [ ] `llmModels`: [0]=Claude Fable 5(보안 게이트웨이) / `구축형`+`running` ≥1 / `blocked` 클라우드 1
- [ ] `agentCatalog` 키가 고정 ID 13개 목록과 일치 (오타는 조용히 무시되나 `check:domains`가 잡는다)
- [ ] **`docs[]` 전 항목에 `tags`·`secLevel`(C/S/O) 기재** — 누락 시 우측 패널 태그·보안 배지가 무너진다(과거 크래시 이력)
- [ ] 새 수치·인물·문서번호가 [WORLD-LEDGER.md](WORLD-LEDGER.md)에 등재됨 (등재 없이 팩에만 쓴 값이 있으면 원장에 추가)

### B-2. 금칙어 DOM 스캔 (핵심 — 브라우저 콘솔에서 실행)

**일반 → 에이전트 → 데이터 → 보안 4개 탭 각각**에서 실행한다.
`FORBIDDEN`은 [WORLD-LEDGER.md §6 금칙어](WORLD-LEDGER.md)와 같은 목록을 쓴다. **팩을 추가하면 그 팩의 고유 어휘도 여기와 원장에 추가**한다(인물명·부서명·문서번호 접두·조직 약칭·전문용어 2개 이상).

```js
(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  // ⚠️ 금칙어 사본을 이 문서에 두지 않는다(사본은 반드시 표류한다).
  //    scan-config.mjs의 DOMAINS[].banned 배열 또는 WORLD-LEDGER.md §6 블록을 그대로 붙여넣을 것.
  const FORBIDDEN = [ /* ← 여기에 붙여넣기 */ ];
  const out = {};
  // 사이드바가 접혀 있으면 탭 버튼이 안 잡힌다 — 먼저 펼친다
  document.querySelector('button[aria-label="사이드바 펼치기"]')?.click();
  await sleep(300);
  for (const tab of ['일반', '에이전트', '데이터', '보안']) {
    [...document.querySelectorAll('button')].find(b => b.textContent.trim() === tab)?.click();
    await sleep(800);
    const t = document.body.innerText;
    out[tab] = FORBIDDEN.filter(k => t.includes(k));   // 전부 [] 이어야 통과
  }
  return out;
})()
```

- [ ] 4개 탭 모두 `[]` (잔재 0건)
- [ ] **에이전트 내부 화면 13종도 스캔**: 에이전트 탭 → 허브에서 13개 카드를 순차 진입하며 같은 필터 실행 — 전부 `[]`.
      해시 라우팅이라 클릭 없이 `#/<도메인>/user/agent/<agentId>`로 직접 진입해도 된다. 잔재 발견 시 팩 `agentContent`의 해당 키 누락이다([AGENT-CONTENT-SCHEMA.md](AGENT-CONTENT-SCHEMA.md) 대조).
      자동화: `node .claude/skills/roadq-verify/scripts/deepscan.mjs <baseUrl> <도메인id>` (도메인당 6~8분)
- [ ] **관리자 전 메뉴(61페이지)도 스캔**: 관리자 입장 → 사이드바 전 그룹 펼침 → 리프 전부 순차 클릭하며 필터 실행 — 전부 `[]`.
      필터에 **타 기관 도메인 주소**(`*.or.kr` 류의 기관 호스트명)도 포함할 것 — 관리자 MCP 서버 페이지에서 주소만 누수된 실제 사례가 있다. 잔재 발견 시 팩 `adminContent` 키 누락 또는 페이지 인라인 하드코딩(→ `mocks.js` 상수로 추출 후 3곳 등록).
      자동화: `node .claude/skills/roadq-verify/scripts/adminscan.mjs <baseUrl> <도메인id>` — **단, 자동 판정은 `scan-config.mjs`의 `ADMIN_PAGES`에 등록된 페이지에 한정**되므로 나머지는 수동 스팟 체크가 필요하다(정직 표기: 관리자 자동 검증 커버리지는 부분적이다).
- [ ] 잔재 발견 시: 코어 하드코딩이다 → 팩 필드+fallback으로 일반화 후 재검사 (팩에 땜질 금지 — [ADR-1](DECISIONS.md))

### B-3. 동작 검사

- [ ] 포털: 제품명 `RoadQ` + 업종 라벨, 브랜드색·배지·기능 4종, 탭 제목(`RoadQ · <조직명>`)
- [ ] **도메인 스위처는 정식 팩이 1개면 보이지 않는 것이 정상**([ADR-16](DECISIONS.md)). 커스텀 팩을 만들면 나타나야 한다
- [ ] 새로고침 후 도메인·대화 유지 (localStorage `roadq.*`)
- [ ] 사용자 포털: 사용자명·부서, 워크스페이스 3종, 자료함, 최근 대화가 팩 콘텐츠
- [ ] 제안 질의 클릭 → **~2초 후 도메인 답변** 출력 (폴백 응답이면 `keywords` 불일치)
- [ ] (mapIntel 보유 팩) 지도 질의 제안 클릭 → 히트맵 타일 전체 + 시계열 차트 렌더, 타일 클릭 시 차트·인사이트 전환. **뷰포트 ≥1280에서 검사**
- [ ] (orchestration 보유 팩) 에이전트 허브 상단 시나리오 카드 수가 팩 배열 길이와 일치 → 실행 → 스테이지가 순차 진행(로그→산출물→핸드오프) → 최종 보고서 카드(문서번호·요약·지표) 렌더
- [ ] LLM 드롭다운: Claude Fable 5 기본 선택 + `blocked` 모델 차단 표시
- [ ] 보안 탭 진입 → "로컬 LLM(구축형 모델명)으로 자동 전환" 토스트, **SECURE 대화가 저장되지 않음**(새로고침 후 사라지는지 확인)
- [ ] 에이전트 탭: 카드 13종이 팩 명칭, 우측 활동 피드가 팩 콘텐츠

### B-4. 데이터 탭(시계열 인텔리전스) 검수 — **이 제품의 정체성 화면, 생략 금지**

팩에 `timeSeries`가 있으면 사이드바에 **데이터** 탭이 뜬다. 없으면 탭 자체가 안 뜨는 것이 정상이다.

- [ ] 사이드바에 **데이터** 탭 존재 → 진입 시 헤더 "시계열 인텔리전스" + `intro` 문구 렌더
- [ ] **4개 축 버튼(예측 / 이상탐지 / 예지보전 / 데이터 품질)이 모두 렌더**되고, 각각 클릭 시 해당 뷰가 그려진다
  - 예측: 구간 탭 버튼이 `forecast.segments` 개수만큼 + 관측·예측 선 2개 + 임계 점선 + 지표 카드 4개
  - 이상탐지: 스트림 차트 + '이상 검지' 기준선 + `stats` 3개 + 이벤트 카드마다 기여도 바(`why`)
  - 예지보전: 자산 카드마다 등급 배지·임계 대비 막대·30일 추세 미니차트·조치 문구
  - 데이터 품질: 파이프라인 표 + 품질 규칙 카드 + 모델 드리프트 카드
- [ ] **'현재 관측' 값이 [WORLD-LEDGER.md](WORLD-LEDGER.md)의 수치와 정확히 일치**한다 (예: 급락 구간 38 km/h).
      어긋나면 차트 코드가 아니라 팩의 `dip`(특히 `atPct: 1.0` + `dip.to`)을 고친다 — [ADR-15](DECISIONS.md)
      ```js
      // 예측 뷰에서 실행: '현재 관측' 카드의 값만 뽑아 원장과 대조
      [...document.querySelectorAll('div')].filter(d => d.textContent.trim() === '현재 관측')
        .map(d => d.parentElement.innerText.replace(/\n/g, ' '))
      ```
- [ ] 임계 초과/미달 항목의 **색 판정과 배지 문구가 서로 모순되지 않는다**(예지보전 `grade` 문자열 ↔ value/threshold 계산 색)
- [ ] 네 축이 **같은 사건**을 말한다: 이상탐지 검지 지점·시각 = 예측 급락 구간, 품질 축 결측률 초과 = 예측 축 MAE·드리프트 악화 사유
- [ ] **콘솔 에러 0건** (recharts는 컨테이너 폭 0에서 경고를 낸다 — 좁은 뷰포트에서도 확인)
- [ ] 375 / 768 / 1280 뷰포트에서 가로 스크롤 없음(품질 축 표는 자체 `overflow-x-auto`가 정상)
- [ ] 하단 `sourceNote`에 **"시뮬레이션"** 표기가 남아 있다([ADR-2](DECISIONS.md) 정직성)

### B-5. 회귀 검사

- [ ] 기존 도메인(`expressway`) 대표 동선 1회 완주: 제안 질의 → 답변 / 에이전트 허브 → 시나리오 완주 / 데이터 탭 4축 / 보안 탭 전환
- [ ] `verify.mjs` EXIT 0 (등록된 전 도메인)

## C. 문서·체계 변경 검수 (이 문서들 자체를 고칠 때)

- [ ] 문서의 모든 코드 조각·명령을 실제 실행해 통과 확인 (죽은 예제 금지)
- [ ] 문서가 참조하는 **파일 경로가 실재**하는지 기계 확인 (저장소 루트에서)
  ```bash
  grep -ohE '(src|docs|scripts|\.claude)/[A-Za-z0-9_./-]+\.(js|jsx|mjs|md|json)' *.md docs/*.md | sort -u | while read f; do [ -e "$f" ] || echo "MISSING: $f"; done
  ```
- [ ] 문서가 참조하는 **필드명·함수명이 현재 코드와 일치**
  ```bash
  grep -rohE 'domain\??\.[a-zA-Z]+' src/RootApp.jsx src/UserApp.jsx src/App.jsx src/user src/admin | sort -u
  ```
- [ ] 필드명뿐 아니라 **타입·구조**도 가이드 §2와 일치 확인 (실제 팩을 열어 눈으로 대조)
- [ ] **문서에도 타 발주처 잔재 0건** (금칙어 목록은 `scan-config.mjs`의 `banned`가 정본 — 문서에 사본을 두지 않는다)
  ```bash
  # 저장소 루트에서. ※ 저장소 경로 자체에 한글 기관명이 들어 있으면 명령 예시의 경로 문자열이 오탐으로 잡힌다 — 그래서 문서에 절대경로를 쓰지 않는다
  node -e "import('./.claude/skills/roadq-verify/scripts/scan-config.mjs').then(m=>process.stdout.write(m.DOMAINS.flatMap(d=>d.banned).join('\n')+'\n'))" > /tmp/banned.txt
  grep -rnFf /tmp/banned.txt docs/DECISIONS.md docs/HANDOVER.md docs/DOMAIN-PACK-GUIDE.md docs/QUALITY-CHECKLIST.md docs/AGENT-CONTENT-SCHEMA.md README.md AGENTS.md | wc -l   # 0
  ```
- [ ] 신선한 시각 검수: 해당 작업을 안 한 별도 에이전트/세션에게 문서만 주고 "이대로 실행 가능한가, 코드와 어긋난 곳은 없는가"를 검토시킬 것
- [ ] [CLAUDE.md](../CLAUDE.md) "현재 상태" 갱신 + 사용자 메모리 동기화

## D. 자기검토 7문 (완료 보고 직전, 답을 적어볼 것)

1. 요청 문장의 모든 명사가 결과물에 반영됐는가?
2. 받는 사람이 처음 여는 순간 무엇이 보이는가? (그 화면을 실제로 열어봤는가)
3. 이번 수정이 깨뜨릴 수 있는 연결부는? (팩 전환·보안탭 전환·데이터 탭·인용 클릭·배포 경로)
4. 회의적 검토자가 지적할 1가지와 그에 대한 답은?
5. 제시한 증거가 실행 결과인가, 추정인가?
6. 롤백·삭제의 잔재(미사용 코드·임시 스크립트·옛 캐시·ASCII 빌드 사본)는 없는가?
7. 다음 세션이 이어받을 기록([CLAUDE.md](../CLAUDE.md)·[WORLD-LEDGER.md](WORLD-LEDGER.md)·[DECISIONS.md](DECISIONS.md))을 남겼는가?
