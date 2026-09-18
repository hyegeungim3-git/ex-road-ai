/**
 * 도메인 팩 — 한국도로공사 (RoadQ 창립 도메인)
 *
 * 이 플랫폼의 정체성은 "도로에서 올라오는 시계열 데이터를 AI로 쓰는 것"이다.
 * 콘텐츠의 모든 수치·식별자는 docs/WORLD-LEDGER.md(세계관 단일 원장)에서 가져온다.
 * 원장에 없는 수치를 이 파일에서 새로 지어내지 말 것 — 원장에 먼저 등재하고 쓴다.
 */
import {
  Route, Activity, AlertTriangle, Gauge, Map, Database,
} from "lucide-react";

const expressway = {
  id: "expressway",
  orgName: "한국도로공사",
  orgEn: "Korea Expressway Corporation",
  orgShort: "EX",
  sectorLabel: "도로·교통",
  platformTitle: "한국도로공사 RoadQ",
  brandColor: "#00539F",
  welcome: "한국도로공사 도로 시계열 데이터 AI 플랫폼에 오신 것을 환영합니다.",
  statusBadge: "시스템 정상 가동 중 · 로컬 LLM · 업무망 전용 · 망분리 적용",
  footerNote: "한국도로공사 도로데이터 AI 활용 사업 (EXTIS·EX-DataLake 연계 데모)",
  userFeatures: [
    "구간 속도·교통량 예측 (시계열 AI)",
    "돌발상황·이상 패턴 자동 검지",
    "교량·터널 계측 예지보전",
    "수집 데이터 품질 진단 (결측·지연)",
  ],
  user: { name: "이도현", dept: "디지털계획처 데이터플랫폼부", title: "차장" },
  workspaces: [
    { id: "ws1", name: "교통데이터 분석반", icon: Activity, active: true },
    { id: "ws2", name: "스마트도로 AI TF", icon: Route },
    { id: "ws3", name: "데이터 거버넌스 협의체", icon: Database },
  ],
  llmModels: [
    { id: "m0", name: "Claude Fable 5", shortName: "Fable 5", type: "보안 게이트웨이", context: "400K", security: "high", status: "running", desc: "플래그십 최고 성능 모델 — 보안 게이트웨이 경유 (기본값)" },
    { id: "m1", name: "GPT-OSS 120B", shortName: "GPT-OSS", type: "구축형", context: "128K", security: "high", status: "running", desc: "업무망 내부 전용 대형 모델" },
    { id: "m2", name: "Llama-3-Korean 70B", shortName: "Llama-3", type: "구축형", context: "32K", security: "high", status: "running", desc: "도로 업무 에이전트 워크플로우 특화" },
    { id: "m3", name: "EXAONE 3.0 78B", shortName: "EXAONE", type: "구축형", context: "32K", security: "high", status: "running", desc: "설계기준·유지관리지침 검색(RAG) 특화" },
    { id: "m4", name: "Gemini 2.5 Pro", shortName: "Gemini", type: "API(Cloud)", context: "1M", security: "low", status: "blocked", desc: "미인증 클라우드 모델 — 내부 데이터 반출 금지 정책으로 차단" },
  ],
  suggestions: [
    { icon: Gauge,         iconBg: "bg-blue-50",   iconColor: "text-blue-700",   title: "구간 속도 예측",   query: "경부선 하행 기흥IC~수원신갈IC 구간의 30분 후 속도를 예측해줘" },
    { icon: AlertTriangle, iconBg: "bg-rose-50",   iconColor: "text-rose-600",   title: "돌발상황 확인",    query: "지금 경부선 하행에서 검지된 돌발상황과 2차사고 위험도를 알려줘" },
    { icon: Database,      iconBg: "bg-amber-50",  iconColor: "text-amber-600",  title: "데이터 품질 점검", query: "VDS 수집 데이터 결측률이 관리 임계를 넘은 지점을 알려줘" },
    { icon: Map,           iconBg: "bg-cyan-50",   iconColor: "text-cyan-700",   title: "본부별 혼잡 지도", query: "지역본부별 혼잡지수 현황을 지도로 분석해줘" },
  ],
  modeDesc: {
    GENERAL: "교통 데이터, 도로 설계·유지관리 기준, 사내 규정에 대해 자유롭게 질문하세요",
  },
  sampleAnswers: [
    {
      // 돌발 답변을 먼저 — 구간·속도 키워드가 예측 답변과 겹치므로 구체 키워드로 선점
      keywords: ["돌발", "2차사고", "급감속", "사고 위험"],
      answer: {
        content: "**돌발상황 검지 현황** (EXTIS 실시간, 2026-09-18 07:42 기준)\n\n- **검지 지점**: 경부선 하행 **386.8k** (기흥IC~수원신갈IC 구간 내)\n- **검지 근거**: 급감속 클러스터 **7건 / 2분** — 인접 3개 VDS 지점에서 동시 관측\n- **구간 평균속도**: **38 km/h** (평시 92 km/h 대비 **-59%**)\n- **2차사고 위험도**: **0.78** — 경보 임계(0.70) **초과**\n\n**자동 조치 상태**\n1. 후방 **VMS 3기** 경보 송출 (386.8k 기준 상류 2.5km·5km·8km)\n2. 교통센터 상황관리부 알림 전파 완료 (07:43)\n3. 순찰차 출동 요청 — 수도권본부 대기\n\n에이전트 탭의 **돌발상황 자동 대응** 시나리오를 실행하면 검지 → 영상·기상 교차검증 → 위험도 산정 → 상황보고서(EX-교통센터-2026-0912) 작성까지 자동으로 처리됩니다.\n\n※ 출처: EXTIS 돌발검지 로그, VDS 5분 집계, 도로교통 돌발상황 대응 매뉴얼",
        citations: [], steps: null,
        confidence: 94,
        xai: {
          queryRewrite: "경부선 하행 돌발상황 급감속 2차사고 위험도",
          base: { rag: 62, model: 38 },
          factors: [
            { label: "VDS 급감속 클러스터", pct: 46 },
            { label: "구간 속도 급락 패턴", pct: 34 },
            { label: "대응 매뉴얼 조항", pct: 20 },
          ],
          review: "VMS 문안 확정과 순찰 출동 지시는 교통센터 상황관리부 판단 사항입니다.",
        },
      },
    },
    {
      keywords: ["속도 예측", "30분", "예측", "정체"],
      answer: {
        content: "**구간 속도 예측** — 경부선 하행 기흥IC~수원신갈IC (384.2k~389.6k)\n\n| 구분 | 값 |\n|---|---|\n| 현재 평균속도 | **38 km/h** |\n| 30분 후 예측 | **44 km/h** (95% 신뢰구간 38~51) |\n| 평시 기준속도 | 92 km/h |\n| 정체 판정 임계 | 40 km/h |\n\n**해석**\n- 현재는 정체 임계(40 km/h) 아래이나, 30분 후에는 임계를 **소폭 회복**하는 것으로 예측됩니다.\n- 다만 신뢰구간 하단이 38 km/h로, **정체 지속 가능성도 유의미**합니다.\n- 적용 모델: **ex-speed-lstm v2.3** · 30분 예측 MAE **4.7 km/h** (목표 5.0 이하 충족)\n\n**참고**: 이 구간은 현재 386.8k 돌발상황의 영향권입니다. 돌발 해소 시점에 따라 회복이 앞당겨질 수 있습니다.\n\n상단 **데이터** 탭의 예측 화면에서 구간별 관측·예측 곡선과 신뢰구간을 직접 확인할 수 있습니다.\n\n※ 출처: EXTIS VDS 5분 집계, ex-speed-lstm v2.3 추론 로그 (시뮬레이션 데이터)",
        citations: [], steps: null,
        confidence: 88,
        xai: {
          queryRewrite: "경부선 하행 기흥IC 수원신갈IC 30분 속도 예측",
          base: { rag: 35, model: 65 },
          factors: [
            { label: "직전 2시간 관측 시계열", pct: 52 },
            { label: "요일·시간대 패턴", pct: 28 },
            { label: "돌발 영향 보정", pct: 20 },
          ],
          review: "예측값은 참고 지표이며, 교통 통제 판단은 상황관리부가 현장 확인 후 결정합니다.",
        },
      },
    },
    {
      keywords: ["결측", "데이터 품질", "수집", "지연"],
      answer: {
        content: "**수집 데이터 품질 현황** (EX-DataLake, 오늘 08:00 기준)\n\n- **결측률**: 경부선 구간 **4.8%** — 관리 임계(**3.0%**) **초과**\n- **주 원인 지점**: VDS-0010-0247 통신 불량 **3일 누적**\n- **수집량**: 일 **2,840만 건** (5분 집계 기준)\n- **적재 지연**: 최대 **4분 12초** — 임계(3분) 초과 구간 발생\n\n**영향**\n- 결측 구간이 속도 예측 입력에 포함되면 예측 오차가 커집니다. 현재 ex-speed-lstm v2.3의 드리프트 지수는 **+0.9**로 임계(1.0)에 근접해 있습니다.\n- 3일 이상 지속된 통신 불량 지점은 유지보수 작업지시 자동 발행 대상입니다.\n\n에이전트 탭의 **데이터 품질 이상 대응** 시나리오를 실행하면 지점 진단 → 결측 보정 → 품질 리포트(EX-데이터플랫폼부-2026-0142) → 작업지시 발행까지 자동 처리됩니다.\n\n※ 출처: EX-DataLake 수집 메타, EXTIS 장비 상태 로그",
        citations: [], steps: null,
        confidence: 91,
        xai: {
          queryRewrite: "VDS 결측률 관리 임계 초과 지점 적재 지연",
          base: { rag: 54, model: 46 },
          factors: [
            { label: "수집 메타 집계", pct: 48 },
            { label: "장비 상태 로그", pct: 32 },
            { label: "품질 관리 기준", pct: 20 },
          ],
          review: "장비 교체 여부는 지역본부 도로교통부 현장 점검 결과에 따릅니다.",
        },
      },
    },
  ],

  /* ── 지도 인텔리전스 — 지역본부 8개 혼잡지수 ── */
  mapIntel: {
    metricLabel: "지역본부별 혼잡지수",
    unit: "",
    regionUnit: "본부",
    periodLabel: "2026년 9월 3주차 기준",
    sourceSystem: "EXTIS 교통정보시스템",
    sourceNote: "※ 출처: EXTIS VDS·프로브 집계 (시뮬레이션 데이터)",
    mapTitle: "지역본부별 혼잡 히트맵",
    chartTitle: "월별 평균 혼잡지수 추이",
    metricKeywords: ["혼잡지수", "혼잡", "정체 현황"],
    wideKeywords: ["본부별", "지역본부", "전국", "지도"],
    heatLow: "#DBEAFE", heatHigh: "#00539F",
    avgLabel: "전국 평균",
    seriesLabels: ["4월", "5월", "6월", "7월", "8월", "9월"],
    avgSeries: [48.1, 49.6, 50.2, 53.8, 55.1, 50.5],
    grid: { cols: 3, rows: 3 },
    regions: [
      { id: "cap",  name: "수도권본부",   keywords: ["수도권본부", "수도권"],     x: 1, y: 0, value: 78, series: [72, 74, 75, 79, 81, 78], insight: "경부선·영동선 출퇴근 정체가 구조적으로 누적되는 구간입니다. 9월 들어 하계 특별수송 종료로 소폭 완화됐습니다." },
      { id: "gw",   name: "강원본부",     keywords: ["강원본부", "강원"],         x: 2, y: 0, value: 33, series: [30, 32, 34, 44, 41, 33], insight: "하계 피서 교통 종료로 평시 수준을 회복했습니다. 동절기 결빙 대응이 다음 관리 포인트입니다." },
      { id: "cb",   name: "충북본부",     keywords: ["충북본부", "충북"],         x: 0, y: 0, value: 41, series: [38, 39, 40, 45, 46, 41], insight: "중부내륙선 물류 통행 비중이 높아 주중 오전 시간대 편중이 뚜렷합니다." },
      { id: "dj",   name: "대전충남본부", keywords: ["대전충남본부", "대전충남"], x: 1, y: 1, value: 61, series: [57, 58, 60, 64, 66, 61], insight: "서해안선·경부선 분기 교통량 증가로 전국 평균을 상회합니다." },
      { id: "jb",   name: "전북본부",     keywords: ["전북본부", "전북"],         x: 2, y: 1, value: 38, series: [36, 37, 38, 41, 42, 38], insight: "특이 동향 없이 안정적으로 유지되고 있습니다." },
      { id: "gj",   name: "광주전남본부", keywords: ["광주전남본부", "광주전남"], x: 0, y: 1, value: 44, series: [41, 42, 43, 48, 49, 44], insight: "명절 전후 귀성 교통에 민감한 구간으로, 특별교통대책 기간 관리가 중요합니다." },
      { id: "bs",   name: "부산경남본부", keywords: ["부산경남본부", "부산경남"], x: 0, y: 2, value: 57, series: [54, 55, 56, 60, 62, 57], insight: "항만 물류 화물차 비중이 높아 중차량 혼입률 관리가 필요합니다." },
      { id: "dg",   name: "대구경북본부", keywords: ["대구경북본부", "대구경북"], x: 1, y: 2, value: 52, series: [49, 50, 51, 55, 57, 52], insight: "중부내륙선 연계 통행 증가로 완만한 상승 추세를 보입니다." },
    ],
  },

  /* ── 채팅 → 에이전트 핸드오프 ── */
  agentRouting: [
    { keywords: ["돌발", "2차사고", "급감속", "사고"], agentId: "orchestration:0", reason: "검지 → 영상·기상 교차검증 → 위험도 산정 → 상황보고서까지 자동 릴레이로 처리합니다." },
    { keywords: ["결측", "데이터 품질", "지연", "수집"], agentId: "orchestration:1", reason: "지점 진단 → 결측 보정 → 품질 리포트 → 작업지시 발행까지 자동 릴레이로 처리합니다." },
    { keywords: ["예측", "속도", "교통량"], agentId: "agent-dataanalysis", reason: "시계열 분석 에이전트가 관측·예측 곡선과 모델 성능을 함께 보여줍니다." },
    { keywords: ["교량", "터널", "계측", "점검"], agentId: "agent-safety", reason: "시설물 계측 이력을 근거로 점검·안전관리 계획을 작성합니다." },
    { keywords: ["회의록", "녹음"], agentId: "agent-meeting", reason: "분석반 회의 녹음을 발언자 구분 회의록으로 자동 정리합니다." },
  ],

  /* ── 알림 센터 + 오늘의 업무 브리핑 ── */
  notifications: [
    { id: "n1", severity: "alert", title: "돌발상황 검지 — 경부선 하행 386.8k", body: "급감속 클러스터 7건/2분 · 2차사고 위험도 0.78 (임계 0.70 초과). 돌발상황 자동 대응 시나리오 실행을 권장합니다.", time: "방금", link: { agentId: "orchestration:0" } },
    { id: "n2", severity: "warn", title: "VDS 결측률 임계 초과 — 4.8%", body: "관리 임계 3.0% 초과. VDS-0010-0247 통신 불량이 3일 누적됐습니다.", time: "08:00", link: { agentId: "orchestration:1" } },
    { id: "n3", severity: "warn", title: "남한강교 신축이음 변위 12.4mm", body: "관리 임계 15.0mm의 83% 도달 · 가속도 RMS 상승 추세. 정밀안전진단 검토가 필요합니다.", time: "어제", link: { agentId: "agent-safety" } },
    { id: "n4", severity: "info", title: "예측 모델 드리프트 +0.9", body: "ex-speed-lstm v2.3 드리프트 지수가 임계(1.0)에 근접했습니다. 재학습 일정 검토가 필요합니다.", time: "어제", link: { agentId: "agent-dataanalysis" } },
  ],

  /* ── 라이브 지표 — 구간 평균속도 (낮을수록 나쁨) ── */
  liveMetric: {
    label: "경부선 하행 기흥~수원신갈 평균속도", unit: "km/h", decimals: 1,
    initial: 52.0, min: 24, max: 96, window: 48,
    threshold: 40, thresholdLabel: "정체 경보 40km/h", thresholdDirection: "below",
    drift: -0.12, noise: 1.6,
    recovery: { at: 30, to: 58 },
    alert: { severity: "alert", title: "구간 정체 경보", body: "기흥IC~수원신갈IC 평균속도 {value}km/h — 정체 임계(40km/h) 하향 돌파. 돌발상황 자동 대응 시나리오를 확인하세요.", link: { agentId: "orchestration:0" } },
    source: "EXTIS VDS 5분 집계 · 1분 주기(시뮬레이션)",
  },

  /* ── 시계열 인텔리전스 (데이터 탭) — 스키마 정본: src/user/timeseries/engine.js ── */
  timeSeries: {
    intro: "도로에서 올라오는 시계열을 예측·이상탐지·예지보전·품질 4개 축으로 봅니다.",
    sourceNote: "※ EXTIS VDS 5분 집계 · EX-DataLake 적재 메타 · EXAM 계측 이력 (시뮬레이션 데이터)",
    forecast: {
      horizonLabel: "30분 후",
      modelName: "ex-speed-lstm v2.3",
      maeTarget: 5.0,          // 예측 오차 목표 (화면의 '목표 N 이하' 표기)
      driftThreshold: 1.0,     // 드리프트 경보 임계
      segments: [
        { id: "s1", name: "기흥IC~수원신갈IC", route: "경부선 하행", mileage: "384.2k~389.6k",
          unit: "km/h", baseline: 92, threshold: 40, thresholdLabel: "정체 임계 40", warn: 60, seed: 11,
          dip: { atPct: 1.0, to: 38, width: 0.22 },   // 지금이 급락 한가운데 — 마지막 관측값이 38km/h가 되도록
          forecast: { value: 44, lo: 38, hi: 51 }, mae: 4.7, drift: 0.9,
          insight: "386.8k 돌발 영향으로 급락한 구간. 30분 후 정체 임계를 소폭 회복하나 신뢰구간 하단은 여전히 정체 영역입니다." },
        { id: "s2", name: "용인IC~양지IC", route: "영동선 동향", mileage: "32.4k~41.1k",
          unit: "km/h", baseline: 88, threshold: 40, thresholdLabel: "정체 임계 40", warn: 60, seed: 23,
          dip: { atPct: 0.46, to: 63, width: 0.10 },
          forecast: { value: 81, lo: 75, hi: 86 }, mae: 4.1, drift: 0.4,
          insight: "일시 서행 후 회복. 주말 피크 전 평시 수준을 유지할 것으로 예측됩니다." },
        { id: "s3", name: "서평택IC~발안IC", route: "서해안선 하행", mileage: "22.8k~31.5k",
          unit: "km/h", baseline: 95, threshold: 40, thresholdLabel: "정체 임계 40", warn: 60, seed: 37,
          dip: { atPct: 0.88, to: 71, width: 0.08 },
          forecast: { value: 79, lo: 72, hi: 85 }, mae: 5.3, drift: 0.6,
          insight: "화물 통행 증가로 완만히 둔화. 중차량 혼입률이 높아 예측 오차가 상대적으로 큽니다." },
        { id: "s4", name: "여주JC~감곡IC", route: "중부내륙선 상행", mileage: "118.2k~128.9k",
          unit: "km/h", baseline: 90, threshold: 40, thresholdLabel: "정체 임계 40", warn: 60, seed: 53,
          dip: { atPct: 0.30, to: 76, width: 0.07 },
          forecast: { value: 86, lo: 81, hi: 90 }, mae: 3.8, drift: 0.2,
          insight: "안정 구간. 남한강교 계측 이상과 별개로 교통 흐름 자체는 정상입니다." },
      ],
    },
    anomaly: {
      streamLabel: "경부선 하행 386.8k 지점 속도 스트림",
      streamUnit: "km/h",
      streamSeed: 29, streamBase: 88, streamDip: { atPct: 0.92, to: 34, width: 0.14 },
      detector: "ex-incident-iforest v1.4",
      stats: [
        { label: "평균 검지 지연", value: "48초", note: "목표 60초 이내" },
        { label: "오탐률", value: "2.1%", note: "최근 30일" },
        { label: "금일 검지", value: "5건", note: "확정 3 · 검토 2" },
      ],
      events: [
        { id: "a1", time: "07:42", spot: "경부선 하행 386.8k", type: "급감속 클러스터", score: 0.78, status: "확정",
          why: [ { label: "급감속 이벤트 7건/2분", pct: 46 }, { label: "인접 3지점 동시 관측", pct: 34 }, { label: "평시 대비 속도 -59%", pct: 20 } ],
          action: "VMS 3기 경보 송출 · 순찰 출동 요청" },
        { id: "a2", time: "06:15", spot: "영동선 대관령 62.4k", type: "노면 결빙 위험", score: 0.62, status: "확정",
          why: [ { label: "노면온도 -1.2℃", pct: 52 }, { label: "습도·강수 이력", pct: 28 }, { label: "고도·터널 출구 패턴", pct: 20 } ],
          action: "결빙 주의 VMS 송출 · 제설 대기조 통보" },
        { id: "a3", time: "05:38", spot: "서해안선 하행 28.1k", type: "정지 차량 의심", score: 0.44, status: "검토",
          why: [ { label: "1개 지점 점유율 급등", pct: 58 }, { label: "인접 지점 미확산", pct: 42 } ],
          action: "CCTV 확인 요청 (미확정)" },
      ],
    },
    health: {
      assets: [
        { id: "h1", name: "남한강교", route: "중부내륙선", mileage: "128.6k", metric: "신축이음 변위",
          value: 12.4, unit: "mm", threshold: 15.0, rulMonths: 14, grade: "주의", seed: 71, trendUp: true,
          sub: [ { label: "가속도 RMS", value: "3.4 m/s²", note: "30일 전 2.8" }, { label: "온도 보정", value: "적용", note: "EXAM 자동" } ],
          action: "정밀안전진단 권고 — 시설처 구조물관리부 검토 요청" },
        { id: "h2", name: "죽령터널", route: "중앙선 연계", mileage: "94.2k", metric: "제트팬 진동",
          value: 2.1, unit: "mm/s", threshold: 4.5, rulMonths: 31, grade: "양호", seed: 83, trendUp: false,
          sub: [ { label: "누적 가동", value: "18,420시간" }, { label: "직전 점검", value: "2026-06-12" } ],
          action: "정기 점검 주기 유지" },
        { id: "h3", name: "기흥 VDS 함체군", route: "경부선", mileage: "384~390k", metric: "통신 가용률",
          value: 92.4, unit: "%", threshold: 97.0, lowerIsBad: true, rulMonths: 4, grade: "경고", seed: 97, trendUp: false,
          sub: [ { label: "불량 지점", value: "VDS-0010-0247" }, { label: "누적 불량", value: "3일" } ],
          action: "통신 모듈 교체 작업지시 발행 대상" },
      ],
      note: "잔존수명(RUL)은 계측 추세 외삽 기반 추정값으로, 정밀안전진단 결과를 대체하지 않습니다.",
    },
    quality: {
      pipelines: [
        { id: "p1", name: "VDS 5분 집계", source: "EXTIS → EX-DataLake", rows: "2,840만 건/일", latency: "4분 12초", latencyThreshold: "3분", missing: 4.8, missingThreshold: 3.0, status: "경고" },
        { id: "p2", name: "프로브 통행속도", source: "DSRC/GPS → EX-DataLake", rows: "1,160만 건/일", latency: "1분 48초", latencyThreshold: "3분", missing: 1.2, missingThreshold: 3.0, status: "정상" },
        { id: "p3", name: "RWIS 노면기상", source: "RWIS → EX-DataLake", rows: "84만 건/일", latency: "2분 06초", latencyThreshold: "3분", missing: 2.4, missingThreshold: 3.0, status: "정상" },
        { id: "p4", name: "교량·터널 계측", source: "EXAM → EX-DataLake", rows: "47만 건/일", latency: "5분 30초", latencyThreshold: "10분", missing: 0.6, missingThreshold: 3.0, status: "정상" },
      ],
      rules: [
        { id: "r1", name: "결측률 임계", target: "VDS 5분 집계", rule: "구간 결측률 3.0% 이하", result: "위반", detail: "경부선 4.8% — VDS-0010-0247 통신 불량" },
        { id: "r2", name: "적재 지연", target: "전 파이프라인", rule: "지연 3분 이하", result: "위반", detail: "VDS 집계 최대 4분 12초" },
        { id: "r3", name: "속도 범위 검증", target: "VDS 5분 집계", rule: "속도 0~140 km/h", result: "통과", detail: "이상치 0건" },
        { id: "r4", name: "타임스탬프 단조성", target: "프로브", rule: "역전 레코드 0건", result: "통과", detail: "최근 24시간 0건" },
      ],
      models: [
        { id: "m1", name: "구간 속도 예측", version: "ex-speed-lstm v2.3", metric: "MAE", value: 4.7, target: 5.0, drift: 0.9, driftThreshold: 1.0, trained: "2026-06-30", retrain: "분기 1회 (다음 2026-09-30)" },
        { id: "m2", name: "돌발 검지", version: "ex-incident-iforest v1.4", metric: "오탐률", value: 2.1, target: 3.0, drift: 0.3, driftThreshold: 1.0, trained: "2026-07-15", retrain: "반기 1회" },
        { id: "m3", name: "결빙 위험", version: "ex-ice-gbm v1.1", metric: "AUC", value: 0.91, target: 0.85, drift: 0.2, driftThreshold: 1.0, trained: "2026-05-20", retrain: "동절기 전 재학습" },
      ],
    },
  },

  /* ── 복합 업무 오케스트레이션 (시나리오 2장) ── */
  orchestration: [
  {
    title: "돌발상황 자동 대응",
    brief: "돌발 검지 1건이 데이터 조회 → 교차검증 분석 → 대응 매뉴얼 대조 → 상황보고서로 자동 릴레이됩니다.",
    request: "경부선 하행 386.8k에서 돌발이 검지됐어. VDS·프로브 데이터 확인하고 기상·영상으로 교차검증해서 2차사고 위험도 산정하고, 대응 매뉴얼 대조해서 상황보고서까지 만들어줘.",
    stages: [
      {
        agentId: "agent-dbquery", ms: 2600,
        task: "EXTIS·EX-DataLake에서 해당 구간의 속도·교통량 시계열을 조회합니다.",
        logs: [
          "Text2SQL 변환 — 구간·지점·시간창 조건 쿼리 생성",
          "VDS 5분 집계 조회 — 384.2k~389.6k / 최근 2시간",
          "급감속 이벤트 추출 — 386.8k 인근 7건 / 2분",
          "구간 평균속도 38km/h 확인 (평시 92km/h)",
        ],
        output: {
          label: "시계열 조회 결과",
          items: [
            "급감속 클러스터 7건 — 인접 3개 VDS 지점 동시 관측",
            "구간 평균속도 38km/h — 정체 임계(40km/h) 하회",
          ],
        },
        handoff: "관측 시계열을 분석 에이전트로 전달",
      },
      {
        agentId: "agent-dataanalysis", ms: 3200,
        task: "기상·차종 구성과 교차검증해 2차사고 위험도를 산정합니다.",
        logs: [
          "RWIS 노면기상 대조 — 노면 건조·시정 양호(기상 요인 배제)",
          "중차량 혼입률 분석 — 18.2% (평시 14.6% 대비 상승)",
          "상류 대기행렬 추정 — 2.4km / 증가 추세",
          "2차사고 위험도 산정 — 0.78 (임계 0.70 초과)",
        ],
        output: {
          label: "교차검증 분석 결과",
          items: [
            "위험도 0.78 — 경보 임계 초과, 후방 경보 필요",
            "대기행렬 2.4km 증가 추세 — 상류 3개 지점 영향권",
          ],
          factors: [
            { label: "급감속 클러스터 밀도", pct: 46 },
            { label: "대기행렬 증가율", pct: 34 },
            { label: "중차량 혼입률", pct: 20 },
          ],
        },
        handoff: "위험도 산정 결과를 규정 조회 에이전트로 전달",
      },
      {
        agentId: "agent-internalreg", ms: 2400,
        task: "돌발상황 대응 매뉴얼의 경보 발령·정보 제공 기준을 대조합니다.",
        logs: [
          "도로교통 돌발상황 대응 매뉴얼 조회 — 경보 단계 기준",
          "위험도 0.70 이상 → 후방 VMS 경보 송출 요건 충족",
          "상류 3기(2.5km·5km·8km) 송출 대상 확정",
          "상황 전파 대상 — 교통센터 상황관리부·수도권본부",
        ],
        output: {
          label: "매뉴얼 대조 결과",
          items: [
            "VMS 경보 송출 요건 충족 — 상류 3기 지정",
            "상황 전파·순찰 출동 요청 기준 해당",
          ],
        },
        handoff: "대응 요건과 조치 내역을 보고서 작성 에이전트로 전달",
      },
      {
        agentId: "agent-report", ms: 2800,
        task: "돌발상황 상황보고서를 표준 양식으로 작성합니다.",
        logs: [
          "돌발상황 상황보고 템플릿 로드 (교통센터 표준 양식)",
          "현황·분석·조치·계획 4개 절 자동 작성",
          "문서번호 채번 — EX-교통센터-2026-0912",
          "교통센터 상황관리부 결재선 자동 지정",
        ],
        output: {
          label: "보고서 생성",
          items: ["상황보고 1보 생성 (속도 추이 그래프·VMS 송출 내역 첨부)"],
        },
        review: "VMS 문안 확정과 순찰 출동 지시는 상황관리부 판단 사항입니다 (보고서는 건의 단계).",
        handoff: null,
      },
    ],
    result: {
      docNo: "EX-교통센터-2026-0912",
      docTitle: "돌발상황 상황보고 제1보 (경부선 하행 386.8k)",
      summary: [
        "급감속 클러스터 7건 검지 — 2차사고 위험도 0.78로 경보 임계(0.70) 초과",
        "기상 요인 배제 확인, 중차량 혼입률 상승(18.2%)이 위험도 상승에 기여",
        "상류 VMS 3기 경보 송출 건의 — 대기행렬 2.4km 증가 추세 고려",
      ],
      metrics: [
        { label: "검지 지연", value: "48초" },
        { label: "2차사고 위험도", value: "0.78" },
        { label: "릴레이 에이전트", value: "4개" },
        { label: "총 소요", value: "약 11초" },
      ],
    },
  },
  {
    title: "데이터 품질 이상 대응",
    brief: "결측률 임계 초과 1건이 지점 진단 → 결측 보정 → 품질 리포트 → 유지보수 작업지시로 자동 릴레이됩니다.",
    request: "VDS 결측률이 관리 임계를 넘었어. 원인 지점 진단하고 결측 보정해서 데이터 품질 리포트 만들고, 통신 불량 지점 정비 작업지시까지 발행해줘.",
    stages: [
      {
        agentId: "agent-dbquery", ms: 2500,
        task: "EX-DataLake 수집 메타에서 결측·지연 현황을 지점 단위로 조회합니다.",
        logs: [
          "Text2SQL 변환 — 지점별 결측률·적재 지연 집계 쿼리",
          "경부선 구간 결측률 4.8% 확인 (임계 3.0%)",
          "지점별 분해 — VDS-0010-0247 결측 기여도 62%",
          "적재 지연 최대 4분 12초 구간 식별",
        ],
        output: {
          label: "품질 메타 조회 결과",
          items: [
            "결측률 4.8% — 관리 임계 3.0% 초과",
            "주 원인 VDS-0010-0247 — 통신 불량 3일 누적",
          ],
        },
        handoff: "지점별 결측 패턴을 분석 에이전트로 전달",
      },
      {
        agentId: "agent-dataanalysis", ms: 3000,
        task: "결측 패턴을 분류하고 예측 입력용 보정값을 산출합니다.",
        logs: [
          "결측 패턴 분류 — 연속 결측(통신 단절) 74% · 산발 결측 26%",
          "인접 지점 상관 기반 보정값 산출 — 384.2k·389.6k 가중 평균",
          "보정 후 예측 입력 오차 영향 재평가 — MAE +0.3km/h 이내",
          "모델 드리프트 기여도 점검 — 현재 +0.9 (임계 1.0)",
        ],
        output: {
          label: "결측 진단·보정 결과",
          items: [
            "연속 결측이 지배적 — 장비 통신 문제로 판정",
            "보정 적용 시 예측 오차 영향 MAE +0.3km/h 이내",
          ],
          factors: [
            { label: "통신 단절 연속 결측", pct: 62 },
            { label: "전원·함체 이상 의심", pct: 23 },
            { label: "산발 패킷 손실", pct: 15 },
          ],
        },
        handoff: "진단 결과를 보고서 작성 에이전트로 전달",
      },
      {
        agentId: "agent-report", ms: 2700,
        task: "데이터 품질 이슈 리포트를 표준 양식으로 작성합니다.",
        logs: [
          "데이터 품질 리포트 템플릿 로드 (데이터 거버넌스 양식)",
          "품질 지표·원인·조치·재발방지 4개 절 작성",
          "문서번호 채번 — EX-데이터플랫폼부-2026-0142",
          "데이터 거버넌스 협의체 공유 대상 지정",
        ],
        output: {
          label: "리포트 생성",
          items: ["품질 이슈 리포트 1건 생성 (지점별 결측 분포·보정 내역 첨부)"],
        },
        handoff: "정비 필요 지점을 안전관리 에이전트로 전달",
      },
      {
        agentId: "agent-safety", ms: 2600,
        task: "통신 불량 지점의 정비 작업지시와 차로 통제 안전조치를 작성합니다.",
        logs: [
          "EXMMS 작업지시 양식 로드 — 통신 모듈 교체",
          "작업 구간 차로 통제 계획 — 갓길 차단·이동차선규제 병행",
          "야간 작업 시 안전조치 항목 자동 체크",
          "문서번호 채번 — EX-시설처-2026-0357",
        ],
        output: {
          label: "작업지시 생성",
          items: ["VDS-0010-0247 통신 모듈 교체 작업지시 1건 (안전관리계획 포함)"],
        },
        review: "작업 일정·차로 통제 승인은 수도권본부 도로교통부 결재 후 확정됩니다.",
        handoff: null,
      },
    ],
    result: {
      docNo: "EX-데이터플랫폼부-2026-0142",
      docTitle: "VDS 수집 데이터 품질 이슈 리포트 (결측률 4.8%)",
      summary: [
        "경부선 구간 결측률 4.8% — 관리 임계(3.0%) 초과, 주 원인은 VDS-0010-0247 통신 불량 3일 누적",
        "연속 결측 74%로 장비 문제 판정 — 인접 지점 상관 보정으로 예측 입력 영향 MAE +0.3km/h 이내 억제",
        "통신 모듈 교체 작업지시 발행(EX-시설처-2026-0357) — 3일 이상 불량 지점 자동 발행 규칙 신설 건의",
      ],
      metrics: [
        { label: "결측률", value: "4.8%" },
        { label: "원인 지점", value: "1개소" },
        { label: "릴레이 에이전트", value: "4개" },
        { label: "총 소요", value: "약 11초" },
      ],
    },
  },
  ],

  /* ── 에이전트 카탈로그 (13종) ── */
  agentCatalog: {
    "agent-chatbot":      { name: "도로 업무 Q&A 챗봇", shortName: "업무 Q&A", desc: "설계기준·유지관리지침·사내 규정을 RAG 기반으로 근거와 함께 즉시 답변합니다." },
    "agent-report":       { name: "교통데이터 보고 에이전트", shortName: "데이터 보고", desc: "교통량·속도 집계와 분석 결과를 상황보고·분석보고 표준 양식으로 자동 작성합니다." },
    "agent-meeting":      { name: "분석반 회의록 에이전트", shortName: "회의록 정리", desc: "교통데이터 분석반 회의 녹음을 발언자 구분 회의록으로 정리하고 액션 아이템을 추출합니다." },
    "agent-knowledge":    { name: "기술자료 검색 에이전트", shortName: "지식 검색", desc: "도로설계기준·ITS 표준·연구보고서를 시맨틱 검색으로 찾아줍니다." },
    "agent-internalreg":  { name: "사내 규정 조회 에이전트", shortName: "규정 조회", desc: "유지관리지침·작업안전수칙·복무규정을 조항 단위로 조회합니다." },
    "agent-ocr":          { name: "점검표 OCR 에이전트", shortName: "점검표 OCR", desc: "현장 점검표·계측 보고서 스캔본을 판독하고 개인정보를 자동 마스킹해 구조화합니다." },
    "agent-dbquery":      { name: "교통데이터 조회 에이전트", shortName: "데이터 조회", desc: "자연어로 질문하면 EXTIS·EX-DataLake의 구간·지점·기간 데이터를 SQL로 변환해 조회합니다." },
    "agent-address":      { name: "도로 위치 표준화 에이전트", shortName: "위치 표준화", desc: "주소·좌표·현장 표기를 노선·이정(k)·VDS 지점 표준 체계로 매핑합니다." },
    "agent-dataanalysis": { name: "시계열 분석 에이전트", shortName: "시계열 분석", desc: "구간 속도·교통량·계측 시계열을 분석해 추세·이상 원인 후보를 시각화합니다." },
    "agent-summary":      { name: "기술문서 요약 에이전트", shortName: "문서 요약", desc: "장문의 지침·연구보고서를 핵심 조항 중심으로 구조화 요약하고 버전 간 차이를 비교합니다." },
    "agent-translate":    { name: "기술자료 번역 에이전트", shortName: "기술 번역", desc: "해외 ITS 기술자료·표준 문서를 용어집 기반으로 번역하고 역번역으로 검증합니다." },
    "agent-review":       { name: "기안 사전검토 에이전트", shortName: "기안 검토", desc: "기안문·시방서를 사내 규정과 관계 법령에 비추어 위반 소지를 사전 검토합니다." },
    "agent-safety":       { name: "공사구간 안전관리 에이전트", shortName: "공사 안전", desc: "도로 공사구간의 위험 요소를 평가하고 차로 통제·안전관리계획서를 생성합니다." },
  },

  /* ── 에이전트 내부 콘텐츠 (키 단위 병합) ──
   * 창립 도메인이라 코어 CONTENT_DEFAULTS 자체가 도로공사 콘텐츠다.
   * 따라서 여기에는 '팩만이 줄 수 있는 것'(도로 자산 지식그래프)만 둔다. */
  agentContent: {
    "agent-knowledge": {
      ontologyPack: {
        label: "도로 자산·교통정보 지식그래프",
        version: "EX-ONTO v0.1",
        statusLabel: "근거 연결 완료",
        maxDepth: 3,
        notice: "이 화면은 지식그래프 탐색 과정을 재현한 데모입니다. 실서비스에서는 그래프 DB와 MCP/API로 연결되어 실제 자산·계측 데이터를 조회합니다.",
        defaultSummary: "도로 자산(노선·지점·시설물)과 데이터·기준 사이의 관계를 탐색하고, 그 관계를 뒷받침하는 지침 근거를 함께 제시했습니다.",
        queryIntents: [
          {
            id: "intent-incident",
            label: "돌발상황 검지·경보 발령",
            keywords: ["돌발", "급감속", "2차사고", "VMS", "경보"],
            focusNodeIds: ["incident-detection", "secondary-accident", "vms"],
            evidenceRefs: ["ev-incident-manual", "ev-vms-criteria"],
            summary: "급감속 클러스터로 돌발을 검지하면 2차사고 위험도를 산정하고, 위험도 0.70 이상에서 후방 VMS 경보 송출 요건이 충족됩니다.",
          },
          {
            id: "intent-quality",
            label: "수집 데이터 품질 기준",
            keywords: ["결측", "품질", "수집", "지연", "임계"],
            focusNodeIds: ["missing-rate", "quality-rule", "vds"],
            evidenceRefs: ["ev-quality-rule", "ev-device-maint"],
            summary: "구간 결측률 관리 임계는 3.0%이며, 통신 불량이 3일 이상 지속된 지점은 정비 작업지시 발행 대상입니다.",
          },
          {
            id: "intent-forecast",
            label: "속도 예측 모델 운영",
            keywords: ["예측", "모델", "드리프트", "재학습", "MAE"],
            focusNodeIds: ["forecast-model", "speed-series", "missing-rate"],
            evidenceRefs: ["ev-survey-guide", "ev-quality-rule"],
            summary: "구간 속도 예측 모델은 VDS 5분 집계를 입력으로 쓰므로, 결측률이 관리 임계를 넘으면 예측 오차와 드리프트가 함께 커집니다.",
          },
          {
            id: "intent-structure",
            label: "교량 계측·정밀안전진단",
            keywords: ["교량", "계측", "변위", "진단", "잔존수명"],
            focusNodeIds: ["bridge-sensor", "precision-inspection", "work-order"],
            evidenceRefs: ["ev-structure-criteria"],
            summary: "신축이음 변위가 관리 임계의 80%를 넘고 가속도 RMS가 상승 추세면 정밀안전진단 검토 대상으로 분류됩니다.",
          },
        ],
        nodes: [
          { id: "vds", label: "차량검지기(VDS)", type: "수집 장비", aliases: ["검지기"], keywords: ["5분 집계", "지점"], evidenceRefs: ["ev-survey-guide", "ev-device-maint"] },
          { id: "speed-series", label: "구간 속도 시계열", type: "데이터", aliases: ["속도 데이터"], keywords: ["평균속도", "구간"], evidenceRefs: ["ev-survey-guide"] },
          { id: "extis", label: "EXTIS 교통정보시스템", type: "시스템", aliases: ["교통정보시스템"], evidenceRefs: ["ev-survey-guide"] },
          { id: "datalake", label: "EX-DataLake", type: "시스템", aliases: ["데이터 레이크"], evidenceRefs: ["ev-quality-rule"] },
          { id: "missing-rate", label: "결측률", type: "품질 지표", keywords: ["임계", "3.0%"], evidenceRefs: ["ev-quality-rule"] },
          { id: "quality-rule", label: "데이터 품질 관리 기준", type: "기준", evidenceRefs: ["ev-quality-rule"] },
          { id: "forecast-model", label: "구간 속도 예측 모델", type: "모델", aliases: ["ex-speed-lstm"], keywords: ["MAE", "드리프트"], evidenceRefs: ["ev-survey-guide"] },
          { id: "incident-detection", label: "돌발상황 검지", type: "분석", aliases: ["돌발 검지"], keywords: ["급감속 클러스터"], evidenceRefs: ["ev-incident-manual"] },
          { id: "secondary-accident", label: "2차사고 위험도", type: "위험 지표", keywords: ["0.70", "임계"], evidenceRefs: ["ev-incident-manual"] },
          { id: "vms", label: "도로전광표지(VMS)", type: "제공 수단", aliases: ["전광표지"], evidenceRefs: ["ev-vms-criteria"] },
          { id: "incident-manual", label: "돌발상황 대응 매뉴얼", type: "기준", evidenceRefs: ["ev-incident-manual", "ev-vms-criteria"] },
          { id: "bridge-sensor", label: "교량 계측(신축이음·가속도)", type: "계측", aliases: ["교량 계측"], evidenceRefs: ["ev-structure-criteria"] },
          { id: "exam", label: "EXAM 도로자산관리시스템", type: "시스템", evidenceRefs: ["ev-structure-criteria"] },
          { id: "precision-inspection", label: "정밀안전진단", type: "조치", evidenceRefs: ["ev-structure-criteria"] },
          { id: "work-order", label: "EXMMS 유지보수 작업지시", type: "조치", aliases: ["작업지시"], evidenceRefs: ["ev-device-maint"] },
          { id: "rwis", label: "도로기상정보(RWIS)", type: "수집 장비", keywords: ["노면온도", "결빙"], evidenceRefs: ["ev-incident-manual"] },
        ],
        edges: [
          { id: "edge-vds-series", from: "vds", to: "speed-series", label: "관측 생성", inverseLabel: "수집 원천", evidenceRefs: ["ev-survey-guide"] },
          { id: "edge-extis-vds", from: "extis", to: "vds", label: "수집·관제", inverseLabel: "소속 시스템", evidenceRefs: ["ev-survey-guide"] },
          { id: "edge-series-lake", from: "speed-series", to: "datalake", label: "5분 집계 적재", inverseLabel: "적재 대상", evidenceRefs: ["ev-quality-rule"] },
          { id: "edge-lake-missing", from: "datalake", to: "missing-rate", label: "품질 지표 산출", inverseLabel: "산출 기반", evidenceRefs: ["ev-quality-rule"] },
          { id: "edge-rule-missing", from: "quality-rule", to: "missing-rate", label: "관리 임계 규정", inverseLabel: "규율 지표", evidenceRefs: ["ev-quality-rule"] },
          { id: "edge-missing-model", from: "missing-rate", to: "forecast-model", label: "예측 정확도 영향", inverseLabel: "입력 품질 의존", evidenceRefs: ["ev-quality-rule", "ev-survey-guide"] },
          { id: "edge-series-model", from: "speed-series", to: "forecast-model", label: "학습·추론 입력", inverseLabel: "입력 데이터", evidenceRefs: ["ev-survey-guide"] },
          { id: "edge-series-incident", from: "speed-series", to: "incident-detection", label: "검지 입력", inverseLabel: "관측 근거", evidenceRefs: ["ev-incident-manual"] },
          { id: "edge-incident-risk", from: "incident-detection", to: "secondary-accident", label: "위험도 산정", inverseLabel: "산정 근거", evidenceRefs: ["ev-incident-manual"] },
          { id: "edge-risk-vms", from: "secondary-accident", to: "vms", label: "경보 송출 요건", inverseLabel: "발령 기준", evidenceRefs: ["ev-vms-criteria"] },
          { id: "edge-manual-risk", from: "incident-manual", to: "secondary-accident", label: "임계 규정", inverseLabel: "근거 기준", evidenceRefs: ["ev-incident-manual"] },
          { id: "edge-rwis-incident", from: "rwis", to: "incident-detection", label: "기상 교차검증", inverseLabel: "검증 입력", evidenceRefs: ["ev-incident-manual"] },
          { id: "edge-exam-bridge", from: "exam", to: "bridge-sensor", label: "계측 이력 관리", inverseLabel: "관리 시스템", evidenceRefs: ["ev-structure-criteria"] },
          { id: "edge-bridge-inspection", from: "bridge-sensor", to: "precision-inspection", label: "진단 판단 근거", inverseLabel: "판단 대상", evidenceRefs: ["ev-structure-criteria"] },
          { id: "edge-missing-order", from: "missing-rate", to: "work-order", label: "정비 발행 조건", inverseLabel: "발행 사유", evidenceRefs: ["ev-device-maint"] },
          { id: "edge-vds-order", from: "vds", to: "work-order", label: "정비 대상", inverseLabel: "작업 대상 장비", evidenceRefs: ["ev-device-maint"] },
        ],
        evidence: [
          {
            id: "ev-survey-guide", kbId: "kb1", title: "교통량·속도 상시조사 방법", source: "고속도로_교통량조사_지침.pdf",
            page: 18, line: "p.18 · 2번째 문단", secLevel: "C",
            excerpt: "구간 평균속도는 차량검지기(VDS) 5분 집계 자료를 기준으로 산출하며, 지점 결측 시 인접 지점 자료로 보정할 수 있다.",
            keywords: ["VDS", "5분 집계", "구간 평균속도", "보정"],
          },
          {
            id: "ev-quality-rule", kbId: "kb1", title: "수집 자료 품질 관리 기준", source: "교통정보_수집장비_유지관리_매뉴얼.hwp",
            page: 7, line: "p.7 · 표 2-1", secLevel: "C",
            excerpt: "구간 결측률은 3.0% 이하로 관리하며, 적재 지연은 3분을 초과하지 않도록 한다.",
            keywords: ["결측률", "임계", "적재 지연", "품질"],
          },
          {
            id: "ev-device-maint", kbId: "kb2", title: "수집 장비 정비 발행 기준", source: "교통정보_수집장비_유지관리_매뉴얼.hwp",
            page: 22, line: "p.22 · 3번째 문단", secLevel: "C",
            excerpt: "통신 불량이 3일 이상 지속되는 지점은 유지보수 작업지시를 발행하고, 차로 통제가 필요한 경우 안전관리계획을 함께 수립한다.",
            keywords: ["통신 불량", "작업지시", "차로 통제", "안전관리계획"],
          },
          {
            id: "ev-incident-manual", kbId: "kb3", title: "돌발상황 검지 및 판정", source: "돌발상황_대응_매뉴얼_v4.pdf",
            page: 14, line: "p.14 · 1번째 문단", secLevel: "C",
            excerpt: "인접 지점에서 급감속 이벤트가 동시에 관측되면 돌발상황으로 판정하고, 대기행렬·차종 구성을 반영해 2차사고 위험도를 산정한다.",
            keywords: ["급감속", "돌발 판정", "대기행렬", "2차사고"],
          },
          {
            id: "ev-vms-criteria", kbId: "kb3", title: "경보 정보 제공 기준", source: "돌발상황_대응_매뉴얼_v4.pdf",
            page: 31, line: "p.31 · 표 5-2", secLevel: "C",
            excerpt: "2차사고 위험도가 0.70 이상인 경우 상류 도로전광표지 3기 이상에 경보 정보를 송출한다.",
            keywords: ["VMS", "위험도", "0.70", "경보 송출"],
          },
          {
            id: "ev-structure-criteria", kbId: "kb4", title: "교량 계측 관리 기준", source: "교량_구조물_계측관리_기준.pdf",
            page: 9, line: "p.9 · 2번째 문단", secLevel: "C",
            excerpt: "신축이음 변위가 관리 임계의 80%를 초과하고 가속도 RMS가 상승 추세인 경우 정밀안전진단 실시를 검토한다.",
            keywords: ["신축이음", "변위", "가속도 RMS", "정밀안전진단"],
          },
        ],
      },
    },
  },

  /* ── 사이드바 자료함 ── */
  /* 자료함 항목은 tags·secLevel까지 채운다 — 우측 패널이 보안등급 배지와 태그를 렌더한다
     (C 대외비 / S 사내한정 / O 공개). 빠뜨리면 패널이 비거나 등급 테두리가 중립으로 표시된다. */
  docs: [
    { id: "d1", name: "고속도로_교통량조사_지침.pdf", size: "4.2 MB", date: "2026.08.12", tags: ["운영지침"], secLevel: "O" },
    { id: "d2", name: "교통정보_수집장비_유지관리_매뉴얼.hwp", size: "2.8 MB", date: "2026.07.03", tags: ["사내한정"], secLevel: "S" },
    { id: "d3", name: "돌발상황_대응_매뉴얼_v4.pdf", size: "6.1 MB", date: "2026.05.20", tags: ["대외비", "DRM 자동해제"], secLevel: "C" },
    { id: "d4", name: "교량_구조물_계측관리_기준.pdf", size: "3.4 MB", date: "2026.04.18", tags: ["사내한정"], secLevel: "S" },
  ],
  history: [
    { id: "h1", title: "경부선 하행 구간 속도 예측 확인", mode: "GENERAL", time: "08:12", isToday: true, starred: true },
    { id: "h2", title: "VDS 결측률 임계 초과 원인 문의", mode: "GENERAL", time: "08:03", isToday: true, starred: false },
    { id: "h3", title: "남한강교 계측 이상 추세 검토", mode: "GENERAL", time: "어제", isToday: false, starred: true },
    { id: "h4", title: "돌발상황 대응 매뉴얼 경보 기준", mode: "GENERAL", time: "09.16", isToday: false, starred: false },
    { id: "h5", title: "지역본부별 혼잡지수 비교", mode: "GENERAL", time: "09.15", isToday: false, starred: false },
  ],
  agentFeed: {
    recent: [
      { agentId: "agent-dataanalysis", agentName: "시계열 분석", time: "오늘 08:05", result: "경부선 구간 속도 급락 원인 분석 완료" },
      { agentId: "agent-dbquery",      agentName: "데이터 조회", time: "오늘 07:44", result: "VDS 5분 집계 2시간 구간 조회" },
      { agentId: "agent-meeting",      agentName: "회의록 정리", time: "어제 16:20", result: "EX-회의록-0917.hwp 생성" },
    ],
    recommendTitle: "돌발상황 검지 직후입니다",
    recommendBody: "경부선 하행 386.8k 돌발 건의 상황보고서를 자동으로 작성할까요?",
    pendingBody: "2026-09-17 교통데이터 분석반 정례회의 녹음이 미처리 상태입니다.",
  },
  secureSuggestions: [
    { title: "미공개 교통량 원자료 분석", query: "미공개 구간별 원자료로 통행 패턴을 분석해줘" },
    { title: "사고 이력 민감정보 검토", query: "사고 이력 데이터에서 개인식별 위험 항목을 점검해줘" },
    { title: "요금 수납 데이터 조회", query: "하이패스 수납 데이터의 이상 거래 패턴을 확인해줘" },
    { title: "내부 감사 자료 요약", query: "데이터 거버넌스 내부 점검 결과를 요약해줘" },
  ],
  modeAnswers: {
    REVIEW: "제출하신 기안문을 사내 규정·관계 법령에 비추어 검토했습니다. 공사구간 안전관리 항목에서 보완이 필요합니다.",
    TRANSLATE: "해외 ITS 기술자료를 도로 분야 용어집 기준으로 번역했습니다. 역번역 검증까지 완료했습니다.",
    REPORT: "교통데이터 분석 결과를 표준 보고서 양식으로 정리했습니다.",
  },

  /* ── 현장 기능 ── */
  workOrderSeed: [
    { docNo: "EX-시설처-2026-0357", title: "VDS-0010-0247 통신 모듈 교체",
      source: "데이터 품질 이상 진단", owner: "수도권본부 도로교통부 김태우", due: "2026-09-22",
      status: "작업중", updatedAt: "2026-09-18 08:40",
      history: [
        { status: "발행", at: "2026-09-18 08:12", by: "AI 자동 발행" },
        { status: "작업중", at: "2026-09-18 08:40", by: "수도권본부 도로교통부 김태우" },
      ] },
    { docNo: "EX-시설처-2026-0341", title: "남한강교 신축이음 정밀안전진단 요청",
      source: "계측 이상 추세", owner: "시설처 구조물관리부 정민석", due: "2026-09-30",
      status: "발행", updatedAt: "2026-09-17 17:05",
      history: [{ status: "발행", at: "2026-09-17 17:05", by: "시설처 구조물관리부 정민석" }] },
    { docNo: "EX-교통센터-2026-0908", title: "영동선 대관령 구간 결빙 대비 제설 대기조 편성",
      source: "노면기상 경보", owner: "교통센터 상황관리부 박선영", due: "2026-09-19",
      status: "완료", updatedAt: "2026-09-18 06:40",
      history: [
        { status: "발행", at: "2026-09-18 06:20", by: "AI 자동 발행" },
        { status: "완료", at: "2026-09-18 06:40", by: "교통센터 상황관리부 박선영" },
      ] },
  ],
  workOrderNote: "자동화 시나리오가 문서를 발행하면 여기에 자동 등록됩니다. 실서비스에서는 EXMMS 작업지시와 양방향 연동됩니다.",
  scanLabel: "시설물·장비 코드 스캔",
  scanRegistry: [
    { code: "VDS-0010-0247", type: "equip", label: "경부선 VDS 지점 — 데이터 품질 이상 대응", agentId: "orchestration:1" },
    { code: "BRG-0450-1286", type: "equip", label: "남한강교 계측 — 예지보전 현황 조회", query: "남한강교 신축이음 변위 추세와 잔존수명을 알려줘" },
    { code: "SEG-0010-3842", type: "order", label: "기흥~수원신갈 구간 — 돌발상황 대응", agentId: "orchestration:0" },
    { code: "RWIS-0500-0624", type: "equip", label: "대관령 노면기상 — 결빙 위험 조회", query: "영동선 대관령 구간 노면온도와 결빙 확률을 알려줘" },
  ],
  shiftHandover: {
    hint: "상황실 알람·조치·미결을 자동으로 모아 다음 교대조에 넘깁니다",
    itemLabels: {
      alarm:   "돌발·경보",
      action:  "조치 완료",
      pending: "인계 사항(미결)",
      quality: "데이터 품질 특이사항",
    },
    shifts: [
      { id: "A", label: "주간조", time: "06:00–14:00" },
      { id: "B", label: "야간조", time: "14:00–22:00" },
      { id: "C", label: "심야조", time: "22:00–06:00" },
    ],
    currentId: "A",
    previous: {
      shiftId: "C", author: "박선영 과장", time: "06:05",
      items: [
        { type: "alarm",   text: "영동선 대관령 62.4k 노면온도 -1.2℃ — 결빙 주의 VMS 송출, 제설 대기조 편성 완료(EX-교통센터-2026-0908)" },
        { type: "action",  text: "서해안선 하행 28.1k 정지 차량 의심 — CCTV 확인 결과 갓길 정차, 05:52 상황 종료" },
        { type: "pending", text: "VDS-0010-0247 통신 불량 3일차 — 데이터 품질 임계 초과 지속, 주간조에서 정비 발행 필요" },
        { type: "pending", text: "남한강교 계측 변위 12.4mm — 시설처 정밀안전진단 요청 회신 대기" },
        { type: "quality", text: "경부선 구간 결측률 4.8% — 야간 내내 임계(3.0%) 초과 유지" },
      ],
    },
    draftSeed: {
      alarms: [
        "경부선 하행 386.8k 급감속 클러스터 7건 — 2차사고 위험도 0.78, VMS 3기 송출",
      ],
      actions: [
        "상류 VMS 3기 경보 송출 확인 (2.5km·5km·8km)",
        "수도권본부 순찰 출동 요청 전파 완료 (07:43)",
      ],
      pending: [
        "VDS-0010-0247 통신 모듈 교체 작업 진행 중 — 차로 통제 승인 대기",
        "예측 모델 드리프트 +0.9 — 재학습 일정 협의 필요",
      ],
      quality: [
        "결측 보정 적용 후 예측 입력 영향 MAE +0.3km/h 이내 확인",
      ],
    },
    note: "확정하면 다음 교대조의 받은 인수인계로 넘어갑니다. 실서비스에서는 교통센터 상황일지와 연동됩니다.",
  },
};

export default expressway;
