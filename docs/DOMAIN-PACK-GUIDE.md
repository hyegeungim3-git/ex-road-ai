# 도메인 팩 작성 가이드

> 대상 독자: RoadQ의 콘텐츠 계층(`src/domains/*.js`)을 만들거나 고치는 **모든 AI 모델/세션**.
> 이 가이드대로 작성하면 모델에 관계없이 동일한 수준의 결과물이 나와야 한다.
> 작성 후에는 반드시 [QUALITY-CHECKLIST.md](QUALITY-CHECKLIST.md)의 §B 검수를 실행한다.
>
> ⚠️ **스키마 정본은 이 문서가 아니라 코드다**([DECISIONS.md ADR-7](DECISIONS.md)). 이 문서는 코드의 스냅샷·안내다.
> 필드 shape의 최종 계약은 **실제 소비 지점** + 각 에이전트 파일 상단 `CONTENT_DEFAULTS` +
> `src/user/liveEngine.js`·`src/user/timeseries/engine.js` 상단 주석이다.
> 이 문서와 코드가 어긋나면 **코드를 신뢰하고 이 문서를 즉시 갱신**하라.
>
> ⚠️ **이 제품의 코어 기본값은 '중립'이 아니라 '한국도로공사'다**([ADR-14](DECISIONS.md)).
> 창립 도메인이 `expressway`라서, 팩이 선택 필드를 생략하면 그 자리에는 **도로공사 콘텐츠**가 들어온다.
> 도로공사 팩을 고칠 때는 그게 정답이지만, **팩을 늘릴 때는 "빈 칸이 중립으로 채워진다"고 가정하면 안 된다.**

## 0. 작업 순서 (요약)

1. `src/domains/_template.js`를 복사해 `src/domains/<도메인id>.js` 생성
2. **[WORLD-LEDGER.md](WORLD-LEDGER.md)에 그 도메인의 조직·인물·식별자·수치를 먼저 등재** (§3 품질 기준 1번)
3. 아래 §2 스키마에 따라 필드 작성 (§3 콘텐츠 품질 기준 준수)
4. `src/domains/index.js`에 import + `DOMAINS` + `DOMAIN_LIST` 등록
5. **`.claude/skills/roadq-verify/scripts/scan-config.mjs`의 `DOMAINS` 배열에 판정 기준 등록** — `banned`(금칙어)·`generalMarkers`·`hubMarkers`·`orchCards`·`dataMarkers`. 관리자까지 검수하려면 `ADMIN_PAGES`·`ADMIN_BANNED`도. 누락 시 새 도메인이 자동 검증에서 조용히 빠진다(index.js 등록과 **나란히** 반드시 함께).
6. `npm run check:domains`(레지스트리·필수 필드·agentId 계약) → ASCII 경로 복사 빌드(EXIT 0) → 프리뷰에서 화면 확인 → **§B 검수 체크리스트 + `verify.mjs` 실행** (빌드 판정 규칙: [DECISIONS.md ADR-3](DECISIONS.md))
7. 커밋 (한국어 메시지) → push → CI 성공 + 라이브 확인

코어 파일(`RootApp.jsx`/`UserApp.jsx`/`App.jsx`/`src/user/components/**`)은 **수정하지 않는 것이 정상**이다.
수정이 필요하다고 느껴지면 = 코어에 하드코딩이 남아 있다는 뜻 → 해당 문자열을 팩 필드+fallback 패턴으로 일반화하는 작업을 먼저 **분리 커밋**으로 수행하라([ADR-1](DECISIONS.md)).

## 1. 소비 지점 지도 (필드가 어디에 쓰이는가 — 코드 확인 기준)

| 필드 | 소비 위치 | 화면 |
|---|---|---|
| `orgName` | `RootApp.jsx`(탭 제목 `RoadQ · <orgName>`), `UserApp`/`Sidebar`(로고), `AgentHub`(부제), `App.jsx` | 전 화면 조직 표기 |
| `sectorLabel` | `RootApp.jsx`(포털 대제목 옆), `Sidebar.jsx` | 제품명 `RoadQ` 옆의 업종 라벨. 생략 시 `orgName` |
| `orgShort`, `orgEn` | 로고 레터·공문서 생성(`generateDocHTML`) | 로고·문서 헤더 |
| `brandColor` | 코어 전역(포털·탭·차트 색) | 브랜드 색 |
| `welcome`, `statusBadge`, `footerNote`, `userFeatures` | `RootApp.jsx` | 포털 선택 화면 |
| `platformTitle` | **현재는 팩 스튜디오(`src/admin/pages/packstudio.jsx`) 폼·미리보기에서만 사용** — 포털 제목은 `RoadQ` + `sectorLabel` 조합이 그린다 | 관리자 팩 스튜디오 |
| `user`, `workspaces`, `llmModels` (필수) | `UserApp.jsx` 주입부 | 사용자 포털 전체 |
| `suggestions`, `sampleAnswers`, `docs`, `history`, `modeDesc`, `agentFeed`, `agentCatalog` (선택) | `UserApp.jsx` 주입부 및 응답 매칭 | 사용자 포털 전체 |
| `mapIntel` (선택 — 생략 시 지도 기능 비활성) | `UserApp` 응답 생성 → `src/user/mapIntel.js` → `MapIntelCard.jsx` | GENERAL 채팅 지역 질의 응답(히트맵+시계열) |
| `orchestration` (선택 — 생략 시 시나리오 카드 비노출) | `AgentHub.jsx` 허브 상단 카드 → `OrchestrationScenario.jsx` (조회는 `allScenarios(domain)` 경유) | 에이전트 허브 오케스트레이션 |
| `notifications` (선택 — 생략 시 헤더 벨 비노출) | `ChatHeader.jsx` 알림 센터 + `ChatMessages` 빈 화면 '오늘의 업무 브리핑' | 사용자 포털 |
| `agentRouting` (선택 — 생략 시 핸드오프 카드 비노출) | `UserApp` 응답 하단 → `ChatMessages` | GENERAL 답변 아래 '다음 단계' 카드 |
| `liveMetric` (선택 — 생략 시 라이브 카드·실시간 알림 비활성) | `UserApp` 1초 틱 → `src/user/liveEngine.js` → `LiveMetricCard` | GENERAL 빈 화면 라이브 카드 |
| **`timeSeries`** (선택 — **생략 시 DATA 탭 자체가 사이드바에 안 뜬다**) | `Sidebar.jsx`(탭 노출 조건) → `src/user/timeseries/TimeSeriesPanel.jsx` + `engine.js` | **데이터 탭 — 이 제품의 정체성 화면** |
| `scanLabel`, `scanRegistry` (선택 — 생략 시 스캔 버튼 비노출) | `ChatInput.jsx` → 스캔 모달 | 채팅 입력줄 코드 스캔 |
| `workOrderSeed`, `workOrderNote` (선택) | `src/user/workOrders.js` → `WorkOrderModal.jsx` | 작업지시 닫힌 루프 |
| `shiftHandover` (선택 — 생략 시 카드 비노출) | `src/user/shiftHandover.js` → `ShiftHandoverModal.jsx`, `ChatMessages` | 교대 인수인계 |
| `selfChecks` (선택) | `SelfCheckModal.jsx` (`domain?.selfChecks?.[docType]`) | 문서 상신 전 자가점검 |
| `agentContent`, `secureSuggestions`, `modeAnswers`, `fileData` (선택) | 에이전트 13종·SECURE·인용 뷰어 | §2-5 |
| `adminContent` (선택) | `App.jsx` 렌더 시작 시 `applyAdminDomain(domain)` → `src/admin/mocks.js` | 관리자 61페이지 |

## 2. 스키마 레퍼런스

### 2-1. 필수 필드

`npm run check:domains`가 기계 판정하는 것: `id`(레지스트리 key와 동일)·`orgName`·`platformTitle`·`brandColor`·`workspaces`(비어 있지 않음, id 중복 없음)·`suggestions`(비어 있지 않음, title/query 채움)·**`orchestration`이 배열일 것**(시나리오가 없으면 `[]`로 둔다 — 필드를 아예 빼면 검사가 실패한다)·`agentCatalog`/`orchestration[].stages[].agentId`가 고정 ID 목록에 속할 것.
그 외 아래 필드는 코드가 fallback 없이 바로 쓰므로(예: `RootApp`이 `domain.userFeatures.map(...)`) 빠지면 화면이 깨진다.
`sectorLabel`·`orgEn`은 예외적으로 fallback이 있지만(각각 `orgName`, 빈 값) 데모 팩은 채우는 것이 정상이다.

```js
id: "mydomain",              // 영소문자. localStorage 키·해시 라우트·React key로 사용
orgName: "조직명",            // 예: "한국도로공사"
orgShort: "EX",              // 영문 약칭 2~4자. 로고·공문서에 사용
orgEn: "Korea Expressway Corporation",
sectorLabel: "도로·교통",      // 포털 대제목에서 'RoadQ' 옆에 붙는 업종 라벨
platformTitle: "…RoadQ",     // 팩 스튜디오 표시용
brandColor: "#00539F",       // 조직 상징색 HEX
welcome: "…환영합니다.",      // 포털 인사말 1문장
statusBadge: "시스템 정상 가동 중 · 로컬 LLM · <망 명칭> 적용",
footerNote: "<조직> <사업명> (<연계 시스템> 연계 데모)",
userFeatures: [ /* 문자열 4개 — 포털 카드의 대표 기능. 도메인 언어로 */ ],
user: { name: "이도현", dept: "부서명", title: "직급" },   // 데모 주인공 1명
workspaces: [ // 정확히 3개 권장. icon은 lucide-react에서 import
  { id: "ws1", name: "…분석반", icon: Activity, active: true },
  { id: "ws2", name: "…TF",     icon: Route },
  { id: "ws3", name: "…협의체",  icon: Database },
],
llmModels: [ /* 5개. 아래 규칙 필수 */ ],
```

**llmModels 규칙** (보안 데모 서사가 여기에 걸려 있다):
- **배열 [0]이 곧 초기 선택 모델이다** — 코드가 `useState(LLM_MODELS[0])`로 첫 요소를 잡는다. 플랫폼 정책상 [0]에는 **Claude Fable 5**(`type:"보안 게이트웨이"`, `security:"high"`, `status:"running"`, context `"400K"`)를 둔다.
- `type:"구축형"` + `status:"running"` 모델이 **최소 1개 필수** — 보안 탭 진입 시 이 조건으로 검색해 자동 전환한다. 문자열 `"구축형"`은 코드와의 계약이므로 바꾸지 말 것.
- `status:"blocked"` 클라우드 모델 1개 — 가드레일 차단 데모용.
- desc의 망 명칭(업무망/내부망/OT망)은 `statusBadge`와 일치시킬 것.

### 2-2. 사용자 포털 콘텐츠 (선택 — 생략 시 코어 기본값 = 도로공사 콘텐츠)

```js
suggestions: [ /* 4개 */ { icon: Gauge, iconBg: "bg-blue-50", iconColor: "text-blue-700",
  title: "8자 내외 라벨", query: "실제 입력될 질문 문장" } ],

sampleAnswers: [ /* suggestions와 짝. 최소 2개. 배열 순서대로 매칭되므로
                    키워드가 겹치는 답변은 '더 구체적인 것'을 앞에 둘 것 */
  { keywords: ["돌발", "2차사고"],   // 소문자로 작성 (질의가 toLowerCase()로 비교됨)
    answer: { content: "마크다운 답변…", citations: [], steps: null,
      // XAI 푸터(선택 — XaiPanel.jsx가 소비): confidence도 citations도 없으면 "일반 지식 · 담당자 확인 권장" 배지로 폴백
      confidence: 94,               // 0~100. 75 미만이면 '담당자 검토 권장'(HITL) 배지
      xai: {                        // 전부 선택 — sources 없으면 citations 유사도로 근거 구성 합성
        queryRewrite: "검색 질의 변환문", base: { rag: 88, model: 12 },
        sources: [{ name: "근거 문서명", similarity: 94 }],
        rejected: [{ name: "기각 문서명", similarity: 58, reason: "기각 사유" }],
        reasoning: "판단 근거 1~2문장 (불확실성 언급 권장)",
      } } } ],
  // citations는 fileData를 함께 제공하지 않는 한 빈 배열로 둔다 — 근거 표시는 xai.sources로

modeDesc: { GENERAL: "…에 대해 자유롭게 질문하세요" },

docs: [ /* 3~4개 — 우측 자료함 */
  { id: "d1", name: "파일명.pdf", size: "4.2 MB", date: "2026.08.12",
    tags: ["운영지침"], secLevel: "O" } ],
```

> 🔴 **`docs[]`의 `tags`와 `secLevel`은 필수다.**
> 우측 패널이 `doc.secLevel`로 카드 테두리·아이콘 색을 고르고 `SecurityBadge`를 그리며, `doc.tags`를 칩으로 렌더한다(`src/user/components/layout/RightPanel.jsx`).
> `tags`를 빠뜨려 **우측 패널이 크래시(화이트 스크린)** 한 실제 사고가 있었다. 지금은 코어가 경계에서 방어(`doc.tags?.length > 0`)하므로 죽지는 않지만, 빠뜨리면 태그 줄이 통째로 사라지고 `secLevel` 누락은 **"미분류(?)" 회색 배지**로 노출된다 — 보안등급 서사가 무너진다.
> `secLevel`은 **`C`(기밀·빨강) / `S`(민감·주황) / `O`(공개·초록)** 3종 고정이며, 자료함에 세 등급이 골고루 섞이게 구성하는 것이 관례다.

```js
history: [ /* 5개 — 좌측 최근 대화 */ { id: "h1", title: "…확인", mode: "GENERAL",
  time: "08:12", isToday: true, starred: true } ],

agentFeed: { // 에이전트 탭 우측 활동 피드
  recent: [ /* 3개 */ { agentId: "agent-meeting", agentName: "회의록", time: "오늘 14:32",
    result: "EX-…-2026-0158.hwp 생성" } ],   // agentId는 아래 고정 목록 중에서
  recommendTitle: "…기한 N일 전", recommendBody: "…확인하시겠습니까?",
  pendingBody: "…회의 녹음이 미처리 상태입니다.",
},

agentCatalog: { // 13개 전부 override 권장. key는 아래 고정 ID 목록
  "agent-chatbot": { name: "…Q&A 챗봇", shortName: "…", desc: "…합니다." },
  // agent-report / agent-meeting / agent-knowledge / agent-internalreg / agent-ocr
  // agent-dbquery / agent-address / agent-dataanalysis / agent-summary
  // agent-translate / agent-review / agent-safety
},  // name·shortName·desc만 교체된다. 내부 화면 콘텐츠는 agentContent (§2-5)
```

**에이전트 ID 고정 목록** (오타 시 조용히 무시되고 `check:domains`가 실패한다):
`agent-chatbot` `agent-report` `agent-meeting` `agent-knowledge` `agent-internalreg` `agent-ocr` `agent-dbquery` `agent-address` `agent-dataanalysis` `agent-summary` `agent-translate` `agent-review` `agent-safety`

### 2-3. 지도 · 오케스트레이션 · 알림 · 핸드오프 · 라이브 지표

```js
// 지도 인텔리전스 — GENERAL 채팅에서 지역 질의 시 히트맵+시계열 카드 삽입. 생략하면 기능 자체가 비활성.
// 매칭 규칙: 질의에 metricKeywords 중 1개 + (regions[].keywords 또는 wideKeywords 중 1개)가 동시 포함될 때만 발동.
// suggestions 4번째를 지도 질의로 구성하는 것이 관례 (클릭 시 바로 시연돼야 함 — 검수 항목).
mapIntel: {
  metricLabel: "지역본부별 혼잡지수",   // 응답 본문·카드 헤더의 지표명
  unit: "",                            // 값 단위 (%, 건 …). 조사(은/는·으로/로)는 코어가 받침 보고 자동 선택
  regionUnit: "본부",                   // 지역 단위 명칭
  periodLabel: "2026년 9월 3주차 기준",
  sourceSystem: "EXTIS 교통정보시스템",  // 처리 단계 표기용 — 그 도메인의 실제 시스템명 재사용
  sourceNote: "※ 출처: … (시뮬레이션 데이터)",   // '시뮬레이션 데이터' 표기는 반드시 유지
  mapTitle: "…히트맵", chartTitle: "…추이",
  metricKeywords: ["혼잡지수", "혼잡"],  // 소문자
  wideKeywords: ["본부별", "지역본부", "전국", "지도"],
  heatLow: "#DBEAFE", heatHigh: "#00539F",  // 밝은색→어두운색 순서 필수 (어두운 타일엔 흰 글자 자동)
  avgLabel: "전국 평균",
  seriesLabels: ["4월", …],              // 모든 series·avgSeries와 길이 일치
  avgSeries: [48.1, …],                  // 마지막 값 ≈ regions value 평균이어야 자연스럽다
  grid: { cols: 3, rows: 3 },            // 타일 좌표계 (x/y는 이 범위 내 0-based)
  regions: [ { id: "cap", name: "수도권본부", keywords: ["수도권본부", "수도권"], x: 1, y: 0,
    value: 78, series: [72, …], insight: "수치의 원인·전망 1~2문장." } ],  // keywords 겹치면 먼저 선언된 지역이 이김
},
```

```js
// 복합 업무 오케스트레이션 — 허브 상단 시나리오 카드 + "요청 1건 → 에이전트 릴레이" 실행 데모.
// 객체 1개(카드 1장) 또는 배열(시나리오별 카드 1장씩) 모두 허용. 비우면 카드 자체가 숨겨짐.
// ⚠️ 단, npm run check:domains가 "배열일 것"을 요구한다 — 시나리오가 없어도 필드를 빼지 말고 [] 로 둘 것.
// ⚠️ 코어의 시나리오 조회는 src/user/scenarios.js의 allScenarios(domain) 경유 —
//    관리자 '시나리오 빌더'가 만드는 커스텀 시나리오(roadq.customScenarios.<도메인>, 도메인당 최대 3개)가 뒤에 이어 붙는다.
orchestration: [{
  title: "돌발상황 자동 대응",              // 그 도메인의 실제 반복 업무명
  brief: "허브 카드·헤더에 표시될 1문장 설명",
  request: "사용자가 입력할 법한 자연어 요청 1문장",
  attachment: { name: "스캔파일.pdf", pages: 18, size: "12.4 MB" },  // 선택 — 알람·데이터 트리거형 시나리오는 생략
  stages: [ // { agentId, ms(연출 시간), task(1문장), logs(3~5줄 — 시스템명·수치 포함), output:{label, items[], factors?}, review?, handoff }
    { agentId: "agent-dbquery", ms: 2600, task: "…", logs: ["…"],
      output: { label: "조회 결과", items: ["…"], factors: [{ label: "판정 기여", pct: 46 }] },
      review: "사람 확인 지점(HITL) 배지 문구",   // 분석·판정 스테이지에 권장
      handoff: "추출 결과를 …로 전달" },          // 마지막 스테이지는 null
  ],
  result: { docNo: "EX-…-2026-0912", docTitle: "…보고서", summary: ["…3줄"],
            metrics: [{ label: "처리 건수", value: "12건" } /* 4개 */] },
}],

// 알림 센터 + '오늘의 업무 브리핑'
notifications: [ { id: "n1", severity: "alert"|"warn"|"info", title: "…", body: "…",
  time: "방금", link: { agentId: "orchestration:0" } } ],   // agentId 또는 orchestration:<idx> 딥링크

// GENERAL 답변 아래 '다음 단계' 핸드오프 카드 (지도 응답에는 미부착, 선행 규칙 우선)
agentRouting: [ { keywords: ["돌발", "2차사고"], agentId: "orchestration:0", reason: "…합니다." } ],

// 라이브 지표 — GENERAL '빈 화면' 전용 카드. 스키마·거동 정본은 src/user/liveEngine.js 상단 주석
liveMetric: {
  label: "…", unit: "km/h", decimals: 1,
  initial: 52.0, min: 24, max: 96, window: 48,       // window = 스파크라인 길이
  threshold: 40, thresholdLabel: "…",
  drift: -0.12, noise: 1.6,                          // drift = 초당 기저 변화량
  recovery: { at: 30, to: 58 },                      // 값이 at 이상이 되면 to로 리셋 (고착 방지)
  alert: { severity: "alert", title: "…", body: "…{value}…", link: { agentId: "orchestration:0" } },
  source: "… (시뮬레이션)",
},
```

> ⚠️ **라이브 지표의 방향을 먼저 정하라.** 기본은 '값이 커질수록 나쁨'(상향 돌파)이다. 속도·가용률처럼 *낮을수록 나쁜* 지표는 `thresholdDirection: "below"`를 주면 돌파 판정과 `recovery` 도달 판정이 함께 뒤집힌다. 설정 후에는 실제 거동을 확인하라 — 엔진은 순수 함수라 Node로 수백 틱 돌려 돌파 횟수·고착 여부를 볼 수 있다(고착은 recovery 방향을 잘못 준 신호다).

### 2-4. `timeSeries` — 시계열 인텔리전스(데이터 탭) **【이 제품의 정체성】**

> 스키마 정본: **`src/user/timeseries/engine.js` 상단 주석** / 작성 예시: `src/domains/expressway.js`의 `timeSeries`
> 설계 이유(왜 좌표를 팩에 안 박는가): [DECISIONS.md ADR-15](DECISIONS.md)

**핵심 원리** — 팩은 **'사건의 형태'** 만 준다. 곡선의 좌표는 `engine.js`가 시드 기반으로 **결정적으로** 생성한다.
같은 입력이면 항상 같은 그래프이므로, 스크린샷·검증 스크립트가 값을 판정할 수 있다.
`timeSeries`를 생략하면 **DATA 탭 자체가 사이드바에 나타나지 않는다**(`Sidebar.jsx`).

```js
timeSeries: {
  intro: "…4개 축으로 봅니다.",        // 패널 헤더 부제
  sourceNote: "※ … (시뮬레이션 데이터)",  // 패널 하단 출처. '시뮬레이션' 표기 유지 필수

  /* ── 축 1. 예측 (ForecastView) ── */
  forecast: {
    horizonLabel: "30분 후",          // 지표 카드·헤더 문구
    modelName: "ex-speed-lstm v2.3",  // 카드 우상단 모델 표기
    segments: [{                      // 구간 탭 버튼 1개 = 항목 1개 (2~5개 권장)
      id: "s1",                       // 고유 id (탭 key)
      name: "기흥IC~수원신갈IC",        // 탭 라벨·카드 제목
      route: "경부선 하행",             // 카드 부제 앞부분
      mileage: "384.2k~389.6k",       // 카드 부제 뒷부분
      unit: "km/h",                   // 값 단위 (툴팁·지표 카드)
      baseline: 92,                   // 평시 기준값 — 곡선이 이 값 주변에서 흔들린다
      threshold: 40,                  // 경보 임계 — 차트의 붉은 점선 + '현재 관측' 색 판정
      warn: 60,                       // 주의 임계 — '현재 관측'이 이 이하면 주황
      seed: 11,                       // 시드(정수). 같은 시드 = 같은 곡선. 구간마다 다르게
      dip: { atPct: 1.0, to: 38, width: 0.22 },  // 급락: 위치(0~1)·바닥값·폭. 생략 가능(평온한 구간)
      forecast: { value: 44, lo: 38, hi: 51 },   // 예측 목표값과 95% 신뢰구간 (관측 끝점에서 이 값으로 수렴)
      mae: 4.7,                       // 예측 오차 지표 (5 초과면 주황 표시)
      drift: 0.9,                     // 드리프트 지수 (1.0 이상 빨강 / 0.8 이상 주황)
      insight: "이 구간을 어떻게 읽어야 하는지 1~2문장.",
    }],
  },
```

> 🔴 **'현재 관측'은 반드시 원장 수치와 일치해야 한다.**
> 급락이 **'지금'** 인 구간은 `dip.atPct: 1.0`으로 둔다. 엔진은 `atPct >= 0.999`일 때 **마지막 관측값을 잡음 없이 `dip.to`로 고정**하므로, `dip.to`에 원장 수치(예: 38km/h)를 적으면 화면의 '현재 관측'이 정확히 그 값이 된다(`engine.js buildSeries` 말미).
> 과거 시점의 급락은 `atPct`를 0.3~0.9로 두면 되고, 이때 '현재 관측'은 `baseline` 부근이 된다.
> 화면 수치가 원장과 어긋나면 **차트 코드가 아니라 팩의 `dip`/`baseline`을 고친다.**

```js
  /* ── 축 2. 이상탐지 (AnomalyView) ── */
  anomaly: {
    streamLabel: "…지점 속도 스트림",   // 차트 카드 제목
    streamUnit: "km/h",
    streamSeed: 29,                     // 시드
    streamBase: 88,                     // 기준값
    streamDip: { atPct: 0.92, to: 34, width: 0.14 },  // 급락 = '이상 검지' 세로 기준선이 찍히는 지점
    detector: "ex-incident-iforest v1.4",             // 검지 모델명
    stats: [ { label: "평균 검지 지연", value: "48초", note: "목표 60초 이내" } ],  // 3개 권장
    events: [{
      id: "a1", time: "07:42", spot: "경부선 하행 386.8k", type: "급감속 클러스터",
      score: 0.78,                       // 이상 점수
      status: "확정",                     // "확정"=빨강 배지 / 그 외="검토" 주황 배지
      why: [ { label: "급감속 이벤트 7건/2분", pct: 46 } ],  // 판정 기여도 바 — pct 합 100 권장
      action: "VMS 3기 경보 송출 · 순찰 출동 요청",
    }],
  },

  /* ── 축 3. 예지보전 (HealthView) ── */
  health: {
    assets: [{
      id: "h1", name: "남한강교", route: "중부내륙선", mileage: "128.6k",
      metric: "신축이음 변위",   // 표시용 지표명
      // lowerIsBad: true,       // 낮을수록 나쁜 지표(가용률·잔여 두께 등)일 때만
      value: 12.4, unit: "mm", threshold: 15.0,   // 임계 대비 비율이 막대·툴팁·색 판정에 쓰인다
      rulMonths: 14,             // 잔존수명(개월) — 카드 우상단
      grade: "주의",              // 배지 '문구'는 이 값을 그대로 쓴다. 색은 value/threshold로 계산되니
                                 // 둘이 어긋나지 않게 할 것(정상/주의/경고 수준을 수치와 맞춰 적는다)
      seed: 71, trendUp: true,   // 최근 30일 추세선 생성용 — trendUp이면 상승 추세로 그린다
      sub: [ { label: "가속도 RMS", value: "3.4 m/s²", note: "30일 전 2.8" } ],  // 보조 지표 1~3개
      action: "정밀안전진단 권고 — …",
    }],
    note: "잔존수명(RUL)은 추세 외삽 기반 추정값으로 …",   // 카드 묶음 하단 한계 표기
  },

  /* ── 축 4. 데이터 품질 (QualityView) ── */
  quality: {
    pipelines: [ { id: "p1", name: "VDS 5분 집계", source: "EXTIS → EX-DataLake",
      rows: "2,840만 건/일", latency: "4분 12초", latencyThreshold: "3분",
      missing: 4.8, missingThreshold: 3.0,    // 숫자(%) — missing > missingThreshold면 빨간 글씨
      status: "경고" } ],                      // "정상"이 아니면 주황 배지
    rules: [ { id: "r1", name: "결측률 임계", target: "VDS 5분 집계",
      rule: "구간 결측률 3.0% 이하", result: "위반",   // "위반"=빨강 / 그 외=초록
      detail: "경부선 4.8% — …" } ],
    models: [ { id: "m1", name: "구간 속도 예측", version: "ex-speed-lstm v2.3",
      metric: "MAE", value: 4.7, target: 5.0,
      drift: 0.9, driftThreshold: 1.0,        // drift >= driftThreshold*0.8 이면 주황
      trained: "2026-06-30", retrain: "분기 1회 (다음 2026-09-30)" } ],
  },
},
```

**4개 축 작성 시 정합성 규칙** (여기서 데모가 무너진다):
- 네 축이 **같은 사건을 다른 각도에서** 말해야 한다. 예) 이상탐지의 검지 지점·시각이 예측 축 급락 구간과 같고, 품질 축의 결측률 초과가 예측 축의 `mae`·`drift` 악화 이유가 된다.
- 모든 수치는 [WORLD-LEDGER.md](WORLD-LEDGER.md)에서 가져온다. 임계값은 원장의 관리 임계와 동일해야 하고, 알림(`notifications`)·오케스트레이션 결과와도 같은 숫자여야 한다.
- 예측 카드의 기준 문구는 팩이 공급한다: `forecast.maeTarget`(→ "목표 N 이하"), `forecast.driftThreshold`(→ "임계 N"), 구간별 `thresholdLabel`(→ 임계선 라벨). 생략하면 해당 보조 문구가 빠지고 색 판정은 중립이 된다.

### 2-5. 에이전트 내부 콘텐츠 · 코어 승격 필드 · 관리자 콘텐츠

```js
// 에이전트 내부 화면 콘텐츠 오버라이드 — 키 단위 병합(제공한 키만 교체, 나머지는 코어 기본값)
agentContent: {
  "agent-ocr": { extractedText: "…", maskLog: [/*4*/], /* … */ },
  "agent-knowledge": {
    // 선택: 제공 시에만 'Graph RAG' 검색 방식이 노출된다. 상세 계약은 AGENT-CONTENT-SCHEMA.md
    ontologyPack: {
      label: "…지식그래프", version: "EX-ONTO v0.1", statusLabel: "근거 연결 완료", maxDepth: 3,
      notice: "실서비스에서는 온프레미스 Graph DB·MCP/API로 교체",
      defaultSummary: "…",
      queryIntents: [{ id: "intent-1", label: "…", keywords: ["핵심어"], focusNodeIds: ["n1"], evidenceRefs: ["ev-1"], summary: "…" }],
      nodes: [{ id: "n1", label: "개념", type: "데이터", aliases: ["…"], keywords: ["…"], evidenceRefs: ["ev-1"] }],
      edges: [{ id: "e1", from: "n1", to: "n2", label: "관계", inverseLabel: "역관계", evidenceRefs: ["ev-1"] }],
      evidence: [{ id: "ev-1", kbId: "kb1", title: "…", source: "원문.pdf", page: 18,
                   line: "p.18 · 2번째 문단", secLevel: "C", excerpt: "…", keywords: ["…"] }],
    },
  },
  // 스키마 정본: 각 에이전트 파일 상단 export const CONTENT_DEFAULTS (shape 주석 포함)
  // 전체 키 목록·계약: docs/AGENT-CONTENT-SCHEMA.md
},

secureSuggestions: [ /* 4개 — SECURE 탭 제안. suggestions와 동일 shape */ ],

modeAnswers: {  // REVIEW/TRANSLATE/REPORT 모드 + SECURE 응답 오버라이드 (answer 객체 shape)
  REVIEW: { content: "…", citations: [], steps: [/*3*/] },
  TRANSLATE: { … }, REPORT: { …, document: {/* 공문서 객체 — 생략 시 다운로드용 문서 없음 */} },
  SECURE_DEFAULT: { … }, SECURE_AIRGAP: { … },
},

fileData: { d1: { title, date, secLevel, text, highlights: [] }, … },  // 인용 뷰어 원문 (docs[].id와 일치)
// 공문서 다운로드 HTML은 generateDocHTML(doc, org)이 orgName·orgShort·brandColor를 자동 주입 — 팩 작업 불필요
selfChecks: { report: [ /* 상신 전 자가점검 항목 */ ] },   // 생략 시 코어 기본 항목
```

- **배열·객체는 통째 교체 계약**: `agentContent`의 각 키는 항목 수·필드 shape를 코어 기본값과 동일하게 유지할 것(코어가 인덱스·키에 의존).
- 일부 키는 값 계약이 있다(예: `dbSources.key`는 `building|land|lup` 고정, `address modeTypes.m` 고정) — [AGENT-CONTENT-SCHEMA.md](AGENT-CONTENT-SCHEMA.md)의 "고정" 표기 참조.
- `ontologyPack`의 모든 edge는 유효한 node id를 가리키고, 법적·수치 관계에는 `evidenceRefs`를 붙인다. `npm run check:ontology`가 참조 무결성과 대표 질의를 검증한다(CI 게이트).

```js
// 관리자 콘텐츠 오버라이드 — 키는 src/admin/mocks.js의 export 상수명 그대로
adminContent: {
  ADMIN_PERSONA: { name: "…", role: "관리자", dept: "…", email: "…" },
  MOCK_USERS: [ /* shape 동일 */ ],
  MOCK_AIACT_SYSTEMS: [ /* status '고영향 확인'|'검토 중'|'비해당' 값 고정 */ ],
  // … 도메인 종속 키만 제공. 전체 키 목록: mocks.js 하단 __RESOLVER_START__ 블록
},
```
- 리졸버: `App.jsx`가 렌더 시작 시 `applyAdminDomain(domain)`을 호출 → `mocks.js`의 `export let` 상수가 통째 교체된다(페이지는 상수를 직접 import, 무수정).
- **`mocks.js`에 새 상수를 추가할 때는 ① `export let` ② `__REB_DEFAULTS` ③ `applyAdminDomain` 3곳 등록 필수** — 누락 시 팩 오버라이드가 조용히 무시된다. (`__REB_DEFAULTS`는 포크 유산 이름이지만 리졸버 계약이라 유지 — [ADR-8](DECISIONS.md))
- 관리자 코드 계약 값: 상태 배지 문자열(Running/Stopped/완료/학습 중 등, `common.jsx StatusBadge` 맵), AIACT status, 만족도 rating(good/edit/bad)은 값 유지.

## 3. 콘텐츠 품질 기준 (모델 무관 동일 수준을 위한 규칙)

1. **원장 우선**: 수치·인물·문서번호는 [WORLD-LEDGER.md](WORLD-LEDGER.md)에서 가져온다. 새 값이 필요하면 **원장에 먼저 등재**하고 쓴다. 팩에서 즉흥으로 만든 숫자는 다른 화면과 어긋나는 순간 데모를 무너뜨린다.
2. **실물 형식 재현**: 지침·매뉴얼 인용은 "제N조(제목) ① …" 조문 형식, 답변엔 "※ 출처: 문서명, N페이지"를 붙인다. 두루뭉술한 설명문은 실격.
3. **수치는 구체적으로**: "정기적으로 점검" ✕ → "점검 주기 분기 1회, 통신 불량 3일 내 출동" ○. 기한·주기·임계값을 상식적 범위에서 구체화한다.
4. **법령 창작 금지**: 존재하지 않는 법조문을 만들지 않는다. 사내 지침·내규로 서술하고, 인용은 실재하는 법령만(원장 §8 목록 참조).
5. **고유명사 일관성**: 인물·부서·문서번호 접두(`EX-`)·시스템명(EXTIS·EXAM·EXMMS 등)을 팩 전체에서 통일. 한 필드에서 만든 이름을 다른 필드가 재사용해야 실제 조직처럼 보인다.
6. **도메인 전문용어 최소 5개**: 그 업계 사람이라야 아는 용어(도로=이정(k)·VDS·신축이음·2차사고 위험도·노면온도)를 자연스럽게 배치. 반대로 타 도메인 용어는 0개(원장 §6 금칙어).
7. **에이전트 이름은 업무명 기반으로**: `name`은 "<그 조직의 업무명> 에이전트" 꼴(예: "교통데이터 조회 에이전트"), `shortName`은 접미사 없는 축약(예: "데이터 조회"). 기술 일반명("DB 검색")만 남기면 도메인화가 안 된 것이다.
8. **가상 조직 사용**: 실존 기업·기관명은 발주처(계약 상대)가 아닌 한 쓰지 않는다. 등장 인물은 전부 가상이다(원장 §1).
9. **suggestions ↔ sampleAnswers 짝 맞춤**: 제안 질의 4개 중 최소 2개는 클릭 시 도메인 답변이 나오도록 `keywords`를 질의 문장의 실제 단어로 구성한다(검수에서 클릭 테스트함). **키워드가 겹치면 더 구체적인 답변을 배열 앞에** 둔다.

## 4. 알려진 한계 (팩으로 아직 못 덮는 것 — 인지하고 작업할 것)

| 영역 | 현상 | 우회/계획 |
|---|---|---|
| 데이터 탭 보조 문구 | 예측 카드의 "목표 5.0 이하"·"임계 1.0"·"정체 임계 …" 라벨이 `TimeSeriesPanel.jsx`에 고정 | 단위·기준이 다른 도메인을 추가할 때 팩 필드로 일반화(분리 커밋) |
| 예지보전 방향 판정 | 자산의 `lowerIsBad: true`로 지정 (해소됨 — 2026-09-18) | 생략 시 "높을수록 나쁨"으로 판정 |
| 라이브 지표 방향 | `thresholdDirection: "below"`로 하강형 지표 지원 (해소됨 — 2026-09-18) | 생략 시 상향 돌파 기준 |
| 관리자 화면 | 61페이지는 `adminContent` 키 단위 오버라이드라 키를 빠뜨리면 코어 기본값(도로공사)이 노출 | `adminscan.mjs`로 전수 스캔. 자동 검증 커버리지는 `scan-config.mjs`의 `ADMIN_PAGES`에 등록된 페이지에 한정 |
| 인쇄용 HTML | `agent-report`의 `buildPressHtml`/`buildReportHtml`은 함수 통째 교체 계약 | 팩이 생략하면 코어 레이아웃 유지(다운로드 파일 전용이라 DOM 스캔에 안 걸림) |

## 5. 실수 사전 (실제로 겪은 것)

- 팩만 만들고 **`src/domains/index.js` 등록 누락** → 스위처·라우팅에 안 나타남 (`check:domains`가 잡는다)
- **`scan-config.mjs` 등록 누락** → 새 도메인이 자동 검증에서 조용히 빠짐 (가장 늦게 발견되는 결함)
- `suggestions`만 넣고 `sampleAnswers` 누락 → 클릭 시 폴백 응답 → 데모 김빠짐
- `keywords`를 대문자/조사 포함으로 작성 → 매칭 실패 (소문자·핵심 명사만)
- **`docs[]`에 `tags`·`secLevel` 누락** → 우측 패널 태그·보안 배지 붕괴(과거 크래시 이력)
- `timeSeries` 급락을 `atPct: 0.9`쯤에 두고 원장 수치를 '현재 관측'으로 주장 → 화면 값이 원장과 불일치. `atPct: 1.0` + `dip.to`로 고정할 것
- `llmModels`에 구축형 running 모델 없음 → 보안 탭 자동 전환이 동작하지 않음
- 코어 어딘가의 하드코딩(최근 대화·자료함·모드 설명·활동 피드)이 그대로 노출 → **검수의 금칙어 DOM 스캔으로만 잡힌다. 생략 금지**
- 블록 주석 안에 `*/`를 포함하는 문자열을 써서 주석이 조기 종결 → 빌드 파괴(두 번 겪음)
