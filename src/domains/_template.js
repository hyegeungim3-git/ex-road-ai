/**
 * 도메인 팩 템플릿 — 새 도메인 추가 시 이 파일을 복사해 <도메인id>.js 로 저장하고 전 필드를 채운다.
 * 작성 규칙·품질 기준: docs/DOMAIN-PACK-GUIDE.md  /  검수: docs/QUALITY-CHECKLIST.md §B
 * 완성 후 반드시 src/domains/index.js 에 등록할 것 (import + DOMAINS + DOMAIN_LIST 3곳).
 * 이 템플릿 파일 자체는 레지스트리에 등록하지 않는다.
 */
import { Briefcase, Database, ShieldCheck, Search, Globe, BookOpen, FileText } from "lucide-react";

const template = {
  /* ===== 필수 (누락 시 화면 깨짐) ===== */
  id: "template",                       // 영소문자 고유값. localStorage·React key
  orgName: "조직명",
  orgShort: "ORG",                      // 영문 약칭 2~4자
  orgEn: "Organization Name",            // 영문 조직명 (문서 레플리카 레터헤드)
  sectorLabel: "분야",                  // 화면 표시용 분야명 (탭·로고·타이틀). 본문 조직명은 orgName 유지
  platformTitle: "조직명 RoadQ",
  brandColor: "#334155",                // 기존 팩(#00539F/#00539F/#166534)과 다르게
  welcome: "조직명 생성형 AI 플랫폼에 오신 것을 환영합니다.",
  statusBadge: "시스템 정상 가동 중 · 로컬 LLM · 내부망 전용 · 망분리 적용",
  footerNote: "조직명 생성형 AI 전환 사업 (연계시스템 데모)",
  userFeatures: [
    "도메인 핵심업무 질의 (RAG)",
    "도메인 문서 OCR 판독",
    "도메인 데이터 자연어 조회",
    "다국어 번역 (한/영/중/일)",
  ],
  user: { name: "홍길동", dept: "핵심부서명", title: "직급" },
  workspaces: [
    { id: "ws1", name: "AI 혁신 TF", icon: Briefcase, active: true },
    { id: "ws2", name: "핵심부서 분석반", icon: Database },
    { id: "ws3", name: "보안점검 TF", icon: ShieldCheck },
  ],
  llmModels: [
    // [0]은 반드시 Claude Fable 5 (플래그십, 기본 선택). 구축형 running ≥1 필수. blocked 1개 관례.
    { id: "m0", name: "Claude Fable 5", shortName: "Fable 5", type: "보안 게이트웨이", context: "400K", security: "high", status: "running", desc: "플래그십 최고 성능 모델 — 보안 게이트웨이 경유 (기본값)" },
    { id: "m1", name: "GPT-OSS 120B", shortName: "GPT-OSS", type: "구축형", context: "128K", security: "high", status: "running", desc: "내부망 전용 대형 모델" },
    { id: "m2", name: "Llama-3-Korean 70B", shortName: "Llama-3", type: "구축형", context: "32K", security: "high", status: "running", desc: "에이전트 워크플로우 특화" },
    { id: "m3", name: "EXAONE 3.0 78B", shortName: "EXAONE", type: "구축형", context: "32K", security: "high", status: "running", desc: "규정·지식 검색(RAG) 특화" },
    { id: "m4", name: "Gemini 2.5 Pro", shortName: "Gemini", type: "API(Cloud)", context: "1M", security: "low", status: "blocked", desc: "미인증 클라우드 모델 — 보안 정책으로 차단" },
  ],

  /* ===== 선택 (생략 시 REB 기본값 노출 — 데모용 팩은 전부 작성) ===== */
  suggestions: [
    // 4개. 이 중 2개 이상은 아래 sampleAnswers.keywords와 매칭되게 query를 구성
    { icon: Search,   iconBg: "bg-slate-50",  iconColor: "text-slate-600",  title: "핵심규정 검색", query: "핵심 규정의 ○○ 기준을 알려줘" },
    { icon: Globe,    iconBg: "bg-blue-50",   iconColor: "text-blue-600",   title: "데이터 조회",   query: "지난달 ○○ 실적과 전월 대비 변동을 알려줘" },
    { icon: BookOpen, iconBg: "bg-violet-50", iconColor: "text-violet-600", title: "내규 확인",     query: "취업규칙상 ○○ 요건을 정리해줘" },
    { icon: FileText, iconBg: "bg-orange-50", iconColor: "text-orange-600", title: "이력 조회",     query: "최근 ○○ 처리 이력을 정리해줘" },
  ],
  sampleAnswers: [
    // 최소 2개 — suggestions 4개 중 2개 이상의 query와 keywords가 매칭돼야 한다.
    // keywords는 소문자·핵심 명사만 (질의가 toLowerCase()로 비교됨). citations는 빈 배열 유지.
    // ○○는 반드시 도메인 실제 용어로 교체할 것 (아래 keywords는 위 suggestions의 query 단어와 이미 짝이 맞춰져 있음).
    {
      keywords: ["기준", "규정"],   // ← suggestions[0] "핵심 규정의 ○○ 기준을 알려줘"와 매칭
      answer: {
        content: "**○○ 기준** (○○규정 제N조, 2026.01 개정 기준)\n\n- 항목 1: 구체 수치\n- 항목 2: 구체 기한\n\n※ 출처: ○○규정 제N조, N페이지",
        citations: [], steps: null,
      },
    },
    {
      keywords: ["실적", "변동"],   // ← suggestions[1] "지난달 ○○ 실적과 전월 대비 변동…"과 매칭
      answer: {
        content: "**○○ 실적 요약** (내부 시스템 집계, 기간 명시)\n\n| 구분 | 이번 달 | 지난달 | 변동 |\n|---|---|---|---|\n| 항목 A | 수치 | 수치 | ▲/▼ |\n\n변동 원인 한 줄 분석.\n\n※ 출처: ○○ 시스템 월간 리포트",
        citations: [], steps: null,
      },
    },
  ],
  modeDesc: {
    GENERAL: "도메인 규정, 업무 절차, 지침에 대해 자유롭게 질문하세요",
  },
  // 지도 인텔리전스 — GENERAL 채팅에서 지역 질의 시 히트맵+시계열 카드 삽입 (생략 시 기능 비활성).
  // 매칭 규칙: metricKeywords 중 1개 + (regions[].keywords 또는 wideKeywords 중 1개) 동시 포함.
  // suggestions 4번째를 지도 질의로 구성하는 것이 관례 (클릭 시 바로 시연 가능해야 함).
  mapIntel: {
    metricLabel: "○○ 지표명",           // 예: "지역본부별 혼잡지수"
    unit: "%",                           // 값 단위 (%, 건 등)
    regionUnit: "지역",                  // 지역 단위 명칭 (시도/사업장/행정동)
    periodLabel: "2026년 ○월 기준",
    sourceSystem: "○○ 시스템",          // 처리 단계에 표기될 집계 시스템명 (도메인 시스템 재사용)
    sourceNote: "※ 출처: ○○ 통계 (시뮬레이션 데이터)",   // '시뮬레이션' 표기는 유지할 것
    mapTitle: "○○ 히트맵",
    chartTitle: "월별 추이",
    metricKeywords: ["지표어1", "지표어2"],          // 소문자 (질의가 toLowerCase()로 비교됨)
    wideKeywords: ["지역별", "전체", "지도"],        // 전체(광역) 질의 트리거
    heatLow: "#E2E8F0", heatHigh: "#0F172A",         // 밝은색→어두운색 (어두운 타일엔 흰 글자 자동 적용)
    avgLabel: "전체 평균",
    seriesLabels: ["1월", "2월", "3월"],             // 시계열 X축 라벨 (모든 series와 길이 일치)
    avgSeries: [0, 0, 0],                            // 평균선 — 마지막 값 ≈ regions value 평균이어야 자연스럽다
    grid: { cols: 4, rows: 3 },                      // 타일 좌표계 크기
    regions: [
      // 7~17개. x/y는 실제 지리 배치를 근사한 타일 좌표 (0-based, grid 범위 내)
      { id: "r1", name: "지역명", keywords: ["지역명"], x: 0, y: 0, value: 0,
        series: [0, 0, 0], insight: "이 지역의 수치를 설명하는 도메인 언어 1~2문장 (원인·전망 포함)." },
    ],
  },
  // 복합 업무 오케스트레이션 — 허브 상단 시나리오 카드 + 에이전트 릴레이 데모 (생략 시 카드 자체가 숨겨짐).
  // stages는 4개 관례(OCR→표준화→DB조회→보고서). agentId는 고정 ID 목록에서, 콘텐츠는 전부 도메인 언어로.
  // ⚠️ 배열이어야 한다 — check:domains가 배열을 요구하고, 허브는 항목마다 카드를 1장씩 그린다.
  orchestration: [
  {
    title: "○○ 서류 일괄 처리",                       // 시나리오명 — 그 도메인의 실제 반복 업무
    brief: "서류 1묶음이 OCR → ○○ 표준화 → ○○ 조회 → 보고서로 자동 릴레이됩니다.",
    request: "사용자가 실제로 입력할 법한 자연어 요청 1문장 (첨부 처리→조회→보고서까지).",
    attachment: { name: "○○_스캔_0305.pdf", pages: 18, size: "12.4 MB" },
    stages: [
      // 각 스테이지: agentId(고정 목록) / ms(연출 시간) / task(1문장) / logs(3~5줄, 시스템명·수치 포함)
      // / output(중간 산출물 — 다음 단계의 입력이 되는 것을 명시) / handoff(다음 에이전트로 무엇을 넘기는지, 마지막은 null)
      {
        agentId: "agent-ocr", ms: 3200,
        task: "스캔 서류에서 ○○·○○를 추출합니다.",
        logs: ["Vision_OCR_엔진 호출 — N면 판독", "서류 N건 인식 · 평균 신뢰도 9X.X%", "○○ N건 추출"],
        output: { label: "OCR 추출 결과", items: ["서류 N건 구조화 (핵심 필드 나열)"] },
        handoff: "추출한 ○○ N건을 다음 에이전트로 전달",
      },
      { agentId: "agent-address", ms: 2400, task: "…", logs: ["…"], output: { label: "표준화 결과", items: ["…"] }, handoff: "…" },
      { agentId: "agent-dbquery", ms: 2800, task: "…", logs: ["…"], output: { label: "조회 결과", items: ["…"] }, handoff: "…" },
      { agentId: "agent-report",  ms: 3000, task: "…", logs: ["…", "문서번호 채번 — ORG-부서-2026-NNN"], output: { label: "보고서 생성", items: ["…"] }, handoff: null },
    ],
    result: {
      docNo: "ORG-부서-2026-NNN",                     // 팩의 문서번호 접두 체계 재사용
      docTitle: "○○(N건) 검토 보고서",
      summary: ["핵심 판정 1", "예외·후속 조치 1", "제안 1"],   // 3줄 관례 — 수치·근거 포함
      metrics: [
        { label: "처리 건수", value: "N건" }, { label: "○○", value: "N건" },
        { label: "릴레이 에이전트", value: "4개" }, { label: "총 소요", value: "약 12초" },
      ],
    },
  },
  ],
  agentCatalog: {
    // 10개 전부 작성. key 오타는 조용히 무시되므로 아래 목록에서 복사할 것.
    "agent-chatbot":      { name: "업무 Q&A 챗봇", shortName: "업무 Q&A", desc: "…을 RAG 기반으로 근거와 함께 즉시 답변합니다." },
    "agent-report":       { name: "보고서 작성 에이전트", shortName: "보고서 작성", desc: "…" },
    "agent-meeting":      { name: "회의록 작성 에이전트", shortName: "회의록 작성", desc: "…" },
    "agent-knowledge":    { name: "지식 검색 에이전트", shortName: "지식 검색", desc: "…" },
    "agent-internalreg":  { name: "내규 조회 에이전트", shortName: "내규 조회", desc: "…" },
    "agent-ocr":          { name: "문서 OCR 에이전트", shortName: "OCR", desc: "…" },
    "agent-dbquery":      { name: "데이터 조회 에이전트", shortName: "DB 조회", desc: "…" },
    "agent-address":      { name: "기준정보 표준화 에이전트", shortName: "표준화", desc: "…" },
    "agent-dataanalysis": { name: "데이터 분석 에이전트", shortName: "데이터 분석", desc: "…" },
    "agent-summary":      { name: "문서 요약 에이전트", shortName: "문서 요약", desc: "…" },
    "agent-translate":    { name: "번역·요약 에이전트", shortName: "번역·요약", desc: "…" },
    "agent-review":       { name: "문서 사전 검토 에이전트", shortName: "문서 검토", desc: "…" },
    "agent-safety":       { name: "안전관리계획 에이전트", shortName: "안전계획", desc: "…" },
  },
  docs: [
    // 3개. secLevel은 C/S/O 하나씩, 3번째는 내규 hwp 관례
    // ⚠️ tags·secLevel은 필수 — 빠뜨리면 우측 패널이 크래시한다(실제 사고 이력)
    { id: "d1", name: "핵심업무_기준서.pdf", size: "3.0 MB", date: "2026.01.10", tags: ["대외비", "DRM 자동해제"], secLevel: "C" },
    { id: "d2", name: "업무_처리지침.pdf", size: "1.5 MB", date: "2026.01.20", tags: ["OCR 적용"], secLevel: "S" },
    { id: "d3", name: "조직명_취업규칙(2025개정).hwp", size: "2.0 MB", date: "2026.02.10", tags: ["사규"], secLevel: "O" },
  ],
  history: [
    // 5개. mode는 GENERAL/TRANSLATE/REVIEW/REPORT 골고루
    { id: "h1", title: "○○ 기준 문의", mode: "GENERAL", time: "14:30", isToday: true, starred: true },
    { id: "h2", title: "○○ 문서 영문 번역", mode: "TRANSLATE", time: "10:15", isToday: true, starred: false },
    { id: "h3", title: "○○ 기안문 검토", mode: "REVIEW", time: "어제", isToday: false, starred: false },
    { id: "h4", title: "주간 실적 보고서 초안", mode: "REPORT", time: "02.20", isToday: false, starred: true },
    { id: "h5", title: "내규 ○○ 조항 문의", mode: "GENERAL", time: "02.18", isToday: false, starred: false },
  ],
  agentFeed: {
    recent: [
      { agentId: "agent-meeting",      agentName: "회의록 작성", time: "오늘 14:32", result: "ORG-회의록-0312.hwp 생성" },
      { agentId: "agent-knowledge",    agentName: "지식 검색",   time: "오늘 10:15", result: "○○ 기준 5건 검색" },
      { agentId: "agent-dataanalysis", agentName: "데이터 분석", time: "어제 16:44", result: "○○ 현황 분석 완료" },
    ],
    recommendTitle: "○○ 기한 N일 전",
    recommendBody: "지난 ○○와 현행 ○○을 대조 검토하여 변경사항을 확인하시겠습니까?",
    pendingBody: "2026-03-17 ○○부서 정례회의 녹음이 미처리 상태입니다.",
  },

  /* ===== v3/v4 필드 (선택, 그러나 데모용 팩은 작성 — 스키마 정본은 코드, DECISIONS.md ADR-7) ===== */

  // 오케스트레이션은 객체 1개 또는 배열(카드 N장) 모두 허용. 관례: [서류 트리거형, 데이터/이벤트 트리거형] 2장.
  // 데이터/이벤트 트리거형은 attachment를 생략한다. 분석 스테이지에 output.factors(판정 기여도, 합≈100),
  // 판정·발행 스테이지에 review(사람 확인 지점) 추가 권장. → 위 orchestration을 배열로 바꿔 2개 작성.

  // 채팅→에이전트 핸드오프 — GENERAL 답변 아래 '다음 단계' 이동 카드 (소비: UserApp handleSend)
  agentRouting: [
    // { keywords: ["소문자"], agentId: "orchestration:1" 또는 "agent-xxx", reason: "왜 이 에이전트로" }
  ],

  // 알림 센터(헤더 벨) + 오늘의 업무 브리핑(GENERAL 빈 화면) — link.agentId로 딥링크(orchestration:<idx> 허용)
  notifications: [
    // { id, severity: "alert"|"warn"|"info", title, body, time, link: { agentId } }  — 대표 사건과 같은 수치로
  ],

  // 라이브 지표 — GENERAL 첫 화면 실시간 카드 + 임계 상향 돌파 시 알림 생성. 스키마 정본: src/user/liveEngine.js 상단 주석.
  // 대표 사건(데이터/이벤트 트리거)의 수치를 그대로 써서 mapIntel·시나리오와 한 원장으로 정합.
  liveMetric: {
    // label, unit, decimals, initial, min, max, window, threshold, thresholdLabel, drift, noise,
    // recovery: { at, to }(고착 방지), alert: { severity, title, body('{value}' 치환), link:{agentId} }, source
  },

  // SECURE 탭 제안 4종 (다크 UI 고정 팔레트 bg-blue-950/50 · text-blue-400)
  secureSuggestions: [
    // { icon, iconBg:"bg-blue-950/50", iconColor:"text-blue-400", title, query }  — 4개
  ],

  // REVIEW/TRANSLATE/REPORT + SECURE 모드 응답 오버라이드 (citations는 항상 [], 도메인 언어로)
  modeAnswers: {
    // REVIEW: { content, citations: [], steps: null }, TRANSLATE, REPORT, SECURE_DEFAULT, SECURE_AIRGAP
  },

  /* ── 시계열 인텔리전스(데이터 탭) ──
     생략하면 '데이터' 탭 자체가 노출되지 않는다(탭은 timeSeries 유무로 결정).
     좌표를 직접 박지 말 것 — 기준값·급락 시점·시드만 주고 곡선은 engine.js가 생성한다.
     스키마 정본: src/user/timeseries/engine.js 상단 주석, 작성 예시: src/domains/expressway.js */
  timeSeries: {
    // intro: "…", sourceNote: "※ … (시뮬레이션 데이터)",
    // forecast: { horizonLabel, modelName, segments: [{ id, name, route, mileage, unit, baseline,
    //             threshold, warn, seed, dip:{atPct,to,width}, forecast:{value,lo,hi}, mae, drift, insight }] }
    //   ⚠️ 지금이 이상 상황이면 dip.atPct를 1.0으로 — 그래야 '현재 관측'이 세계관 수치와 일치한다.
    // anomaly: { streamLabel, streamUnit, streamSeed, streamBase, streamDip, detector,
    //            stats:[{label,value,note}], events:[{ id,time,spot,type,score,status,why:[{label,pct}],action }] }
    // health:  { assets:[{ id,name,route,mileage,metric,value,unit,threshold,rulMonths,grade,seed,trendUp,
    //            sub:[{label,value,note}],action }], note }
    // quality: { pipelines:[…], rules:[…], models:[…] }
  },

  // fileData: 인용 뷰어 원문 (docs[].id와 일치). 생략 시 코어 기본값(창립 도메인 콘텐츠) 폴백.
  // agentContent: 에이전트 13종 내부 화면 콘텐츠 — 정본은 각 에이전트 파일 상단 CONTENT_DEFAULTS.
  //   ⚠️ 코어 기본값은 '중립'이 아니라 창립 도메인(한국도로공사) 콘텐츠다.
  //      새 발주처 팩이라면 반드시 채워라 — 생략하면 도로공사 콘텐츠가 그대로 노출된다.
  //      상세 키: docs/AGENT-CONTENT-SCHEMA.md.
  // adminContent: 관리자 페이지 콘텐츠. 생략 시 관리자가 창립 도메인 페르소나로 노출. 정본: src/admin/mocks.js.
};

export default template;
