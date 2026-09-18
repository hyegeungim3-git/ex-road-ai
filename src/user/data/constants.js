import {
  Briefcase, Database, ShieldCheck, MessageSquare, FileCheck, Languages, FileText,
  Shield, Lock, Activity, Search, Globe, BookOpen, ListChecks, CheckSquare,
  AlertCircle, Star, ClipboardList, ScanLine, MapPin, AlignLeft,
  MessageCircle, BarChart2, Bot,
} from "lucide-react";

export const USER_INFO = { name: "이도현", dept: "디지털계획처 데이터플랫폼부", title: "차장" };

export const MOCK_NOTICES_USER = [
  {id:'N-001',title:'[필독] 2026년 하반기 보안 업데이트 공지 — 비밀번호 변경 필요',date:'2026-09-15',pinned:true},
  {id:'N-002',title:'RoadQ AI 플랫폼 v2.3 업데이트: 교통데이터 에이전트 기능 강화 안내',date:'2026-09-10',pinned:false},
  {id:'N-003',title:'9월 정기 시스템 점검 안내 (9/26 새벽 2~4시)',date:'2026-09-08',pinned:false},
];

export const MOCK_FAQ = [
  {q:'로그인이 안 됩니다.',a:'SSO 연동 계정으로 로그인하세요. 그룹웨어(WorksOn)와 동일한 계정을 사용합니다. 계정 문제 시 디지털계획처 AI인프라부(내선 5050)로 문의 바랍니다.'},
  {q:'AI 답변이 틀렸을 경우 어떻게 하나요?',a:'답변 하단의 👎 (불만족) 버튼을 누른 후 "오류 신고"를 통해 내용을 제출해 주세요. 관리자가 품질 개선에 활용합니다.'},
  {q:'파일을 첨부할 수 있나요?',a:'채팅창 하단의 📎 버튼을 통해 PDF, DOCX, XLSX, PPTX 등을 첨부할 수 있습니다. 단일 파일 최대 50MB, 1회 최대 5개까지 가능합니다.'},
  {q:'보안 채팅(보안구역)은 언제 사용하나요?',a:'대외비·비밀 등급 문서를 처리하거나 개인정보가 포함된 내용을 다룰 때 사용하세요. 모든 처리가 내부 서버에서만 이루어지며 외부로 전송되지 않습니다.'},
  {q:'이용 이력은 저장되나요?',a:'질의 이력은 보안 정책에 따라 최대 90일간 서버에 보관됩니다. 직속 상관이나 타 부서에 자동 공유되지 않으며, 감사·컴플라이언스 목적으로만 관리자가 열람할 수 있습니다.'},
  {q:'에이전트 탭과 일반 채팅의 차이가 무엇인가요?',a:'에이전트 탭은 여러 단계의 자동화된 파이프라인(자료 파싱 → 지침 검색 → 대조 검토 등)을 통해 복잡한 업무를 처리합니다. 일반 채팅은 단순 질의응답에 적합합니다.'},
];

export const WORKSPACES = [
  { id: "ws1", name: "디지털계획처 AI업무혁신 TF", icon: Briefcase, active: true },
  { id: "ws2", name: "교통데이터 분석반", icon: Database },
  { id: "ws3", name: "도로 데이터 품질관리 TF", icon: ShieldCheck },
];

export const LLM_MODELS = [
  { id: "m1", name: "GPT-OSS 120B", shortName: "GPT-OSS", type: "구축형", context: "128K", security: "high", status: "running", desc: "고성능 내부망 전용 대형 모델 (기본값)" },
  { id: "m2", name: "Llama-3-Korean 70B", shortName: "Llama-3", type: "구축형", context: "32K", security: "high", status: "running", desc: "빠른 추론 및 에이전트 워크플로우 특화" },
  { id: "m3", name: "EXAONE 3.0 78B", shortName: "EXAONE", type: "구축형", context: "32K", security: "high", status: "running", desc: "사내 규정 및 지식 검색(RAG) 특화" },
  { id: "m4", name: "Claude 3.5 Sonnet", shortName: "Claude", type: "API(Cloud)", context: "200K", security: "low", status: "blocked", desc: "클라우드 모델 — 망분리 환경 접근 불가" },
];

export const MODES = {
  GENERAL: {
    id: "GENERAL", label: "일반 질의", shortLabel: "질의",
    desc: "교통량·속도 데이터, 도로 운영 지침, 사내 규정에 대해 자유롭게 질문하세요",
    placeholder: "교통데이터 현황이나 도로 운영 지침에 대해 자유롭게 질문하세요.",
    icon: MessageSquare,
    colors: { active: "bg-blue-600 text-white", light: "bg-blue-50 text-blue-700 border-blue-200", text: "text-blue-600", badge: "bg-blue-600", inputFocus: "focus-within:border-blue-400" }
  },
  REVIEW: {
    id: "REVIEW", label: "문서 검토", shortLabel: "검토",
    desc: "업로드하신 문서를 사내 지침 및 관계 법령과 자동으로 대조하여 검토합니다",
    placeholder: "검토받을 기안문·계획서를 업로드하고 무엇을 확인할지 알려주세요.",
    icon: FileCheck,
    colors: { active: "bg-indigo-600 text-white", light: "bg-indigo-50 text-indigo-700 border-indigo-200", text: "text-indigo-600", badge: "bg-indigo-600", inputFocus: "focus-within:border-indigo-400" }
  },
  TRANSLATE: {
    id: "TRANSLATE", label: "번역·요약", shortLabel: "번역",
    desc: "한·영·중·일 번역 및 원하는 분량으로 요약해 드립니다",
    placeholder: "번역하거나 요약할 내용을 입력하거나 문서를 업로드하세요.",
    icon: Languages,
    colors: { active: "bg-violet-600 text-white", light: "bg-violet-50 text-violet-700 border-violet-200", text: "text-violet-600", badge: "bg-violet-600", inputFocus: "focus-within:border-violet-400" }
  },
  REPORT: {
    id: "REPORT", label: "보고서 작성", shortLabel: "보고",
    desc: "사내 표준 양식에 맞춰 주간 실적, 현장 점검, 상황 보고서를 자동 작성합니다",
    placeholder: "보고서에 담을 내용을 알려주세요. (예: 이번 주 VDS 정기점검 5개소 완료)",
    icon: FileText,
    colors: { active: "bg-emerald-600 text-white", light: "bg-emerald-50 text-emerald-700 border-emerald-200", text: "text-emerald-600", badge: "bg-emerald-600", inputFocus: "focus-within:border-emerald-400" }
  }
};

export const SECURE_SUGGESTIONS = [
  { icon: FileText,    iconBg: "bg-blue-950/50", iconColor: "text-blue-400", title: "대외비 문서 내용 분석",    query: "공개 전 검토가 필요한 대외비 문서의 핵심 내용을 정리해줘. 결과는 저장되지 않아" },
  { icon: ShieldCheck, iconBg: "bg-blue-950/50", iconColor: "text-blue-400", title: "민감 정보 포함 초안 작성", query: "개인정보나 민감 내용이 포함될 수 있는 내부 보고서 초안을 작성해줘" },
  { icon: Search,      iconBg: "bg-blue-950/50", iconColor: "text-blue-400", title: "내부 규정 비공개 검토",    query: "도로 운영 내규·업무지침 관련 내용을 보안 환경에서 확인하고 싶어. 대화는 저장되지 않아야 해" },
  { icon: Lock,        iconBg: "bg-blue-950/50", iconColor: "text-blue-400", title: "기밀 업무 아이디어 정리",  query: "아직 공유하기 전인 업무 아이디어를 보안 환경에서 문서화해줘" },
];

export const HISTORY = [
  { id: "h1", title: "VDS 결측률 관리 기준 문의", mode: "GENERAL", time: "14:30", isToday: true, starred: true },
  { id: "h2", title: "터널 방재시설 지침 영문 번역", mode: "TRANSLATE", time: "10:15", isToday: true, starred: false },
  { id: "h3", title: "갓길 차단 점검 기안문 검토", mode: "REVIEW", time: "어제", isToday: false, starred: false },
  { id: "h4", title: "주간 교통데이터 운영 실적 초안", mode: "REPORT", time: "09.15", isToday: false, starred: true },
  { id: "h5", title: "경부선 속도 급락 구간 조회", mode: "GENERAL", time: "09.11", isToday: false, starred: false },
];

export const DOCS = [
  { id: "d1", name: "고속도로_교통량조사_지침.pdf",           size: "3.2 MB", date: "2025.11.20", tags: ["대외비", "DRM 자동해제"], secLevel: "C" },
  { id: "d2", name: "3. 과업지시서.pdf",                     size: "1.4 MB", date: "2026.01.15", tags: ["OCR 적용"],              secLevel: "S" },
  { id: "d3", name: "교통정보_수집장비_유지관리_매뉴얼.hwp",   size: "2.1 MB", date: "2026.08.12", tags: ["운영지침"],              secLevel: "O" },
];

export const FILE_DATA = {
  d1: { title: "[대외비] 고속도로_교통량조사_지침.pdf", date: "2025.11.20 | 디지털계획처", secLevel: "C", text: `[고속도로 교통량·속도 상시조사 업무 지침]\n\n제2장 상시조사 주기 및 방법\n\n2.1. 상시 관측 주기\n - 교통량·속도는 노선별 대표 관측지점(VDS)에서 5분 단위로 수집하며, 수집 자료는 EXTIS를 거쳐 EX-DataLake에 집계·적재한다.\n - 적재 지연이 3분을 초과한 경우 지연 원인을 기록하고 당일 중 소명하여야 한다.\n\n2.2. 현장 점검 방법\n - 현장 점검은 검지기 설치 지점을 직접 방문하여 루프·영상 검지 상태, 통신 회선, 전원 공급 상태를 확인한다.\n - 인접 관측지점 및 프로브 자료와 교차 검증하여 관측값의 신뢰도를 확인한다.\n\n제3장 자료 산출 유의사항\n\n3.1. 구간 정합성 유지\n - 결측률이 관리 임계 3.0%를 초과한 지점은 익일까지 원인을 규명하고 보정 절차를 적용한다.\n - 구간 속도는 인접 관측지점 간 정합을 유지해야 하며, 노선 이정(k) 기준으로 결측 구간을 보간하여 산출한다.`, highlights: ["5분 단위로 수집", "관리 임계 3.0%를 초과한 지점은 익일까지 원인을 규명"] },
  d2: { title: "3. 과업지시서.pdf", date: "2026.01.15 | 디지털계획처 AI업무혁신 TF", secLevel: "S", text: `한국도로공사 도로 시계열 데이터 AI 플랫폼 구축 사업 과업지시서\n\nI 사업 개요\n1. 사업명: 한국도로공사 도로 시계열 데이터 AI 플랫폼 구축 사업\n2. 사업기간: 계약체결일 ~ '26. 12. 31.\n3. 사업금액: 1,280,000천원(VAT별도)\n\nII 사업 범위\n- 내부 웹 UI(망분리, 인터넷 차단)\n- 통합 애플리케이션 서버: ① 로컬 LLM 서비스 ② 로컬 RAG & 데이터 ③ 에이전트 코어\n- 연계 대상 시스템: EXTIS, EX-DataLake, EXAM, RWIS`, highlights: ["1,280,000천원(VAT별도)", "내부 웹 UI(망분리, 인터넷 차단)"] },
  d3: { title: "교통정보_수집장비_유지관리_매뉴얼.hwp", date: "2026.08.12 | 도로처", secLevel: "O", text: `교통정보 수집장비 유지관리 매뉴얼 (2026년 개정)\n\n제12조 (점검 주기)\n① VDS 검지기는 분기 1회 정기점검을 원칙으로 한다.\n② 통신 불량이 확인된 지점은 최초 확인일로부터 3일 이내에 현장 출동하여 조치하여야 한다.\n\n제13조 (본선 차단 작업)\n① 갓길 또는 차로 차단이 필요한 점검은 관할 지역본부장의 사전 승인을 받아야 한다.\n② 차단 작업 착수 24시간 전까지 교통센터 상황관리부에 통보하여 VMS 예고 송출을 요청하여야 한다.\n\n제14조 (야간 작업)\n① 야간 점검은 2인 1조로 시행하며, 안전시설 설치를 완료한 후 진입한다.`, highlights: ["갓길 또는 차로 차단이 필요한 점검은 관할 지역본부장의 사전 승인", "착수 24시간 전까지 교통센터 상황관리부에 통보"] },
};

export const SUGGESTIONS = {
  GENERAL: [
    { icon: Search,   iconBg: "bg-blue-50",   iconColor: "text-blue-600",   title: "교통량 상시조사 기준",  query: "교통량·속도 상시조사 수집 주기와 결측률 관리 임계가 어떻게 되나요?" },
    { icon: Globe,    iconBg: "bg-green-50",  iconColor: "text-green-600",  title: "AI 사업 예산 조회",    query: "도로 시계열 데이터 AI 플랫폼 구축 사업의 총 예산과 사업 기간을 알려주세요." },
    { icon: BookOpen, iconBg: "bg-violet-50", iconColor: "text-violet-600", title: "결측 지점 조치 절차",  query: "VDS 결측률이 관리 임계를 초과하면 언제까지 어떤 조치를 해야 하나요?" },
    { icon: FileText, iconBg: "bg-orange-50", iconColor: "text-orange-600", title: "갓길 차단 승인 절차",  query: "본선 갓길 차단이 필요한 점검 작업은 어떤 승인과 통보 절차를 거쳐야 하나요?" },
  ],
  REVIEW: [
    { icon: FileCheck,   iconBg: "bg-indigo-50", iconColor: "text-indigo-600", title: "점검 작업 기안문 검토",  query: "업로드한 VDS 점검 작업 기안문을 유지관리 매뉴얼과 대조해서 누락된 절차가 없는지 검토해줘" },
    { icon: Shield,      iconBg: "bg-red-50",    iconColor: "text-red-600",    title: "보안 규정 준수 여부",  query: "이 문서에 망분리 관련 보안 요건을 위반하는 내용이 있는지 확인해줘" },
    { icon: CheckSquare, iconBg: "bg-green-50",  iconColor: "text-green-600",  title: "계약서 누락 항목",    query: "업로드된 계약서를 사내 표준 양식과 비교해서 누락 항목을 확인해줘" },
    { icon: AlertCircle, iconBg: "bg-orange-50", iconColor: "text-orange-600", title: "개인정보 포함 여부",  query: "이 문서에 개인식별정보(이름·연락처·주민번호 등)가 포함되어 있는지 확인해줘" },
  ],
  TRANSLATE: [
    { icon: Languages,  iconBg: "bg-violet-50", iconColor: "text-violet-600", title: "영문 지침 번역",       query: "업로드한 영문 도로터널 방재시설 설치 지침을 한국어로 번역해줘" },
    { icon: ListChecks, iconBg: "bg-blue-50",   iconColor: "text-blue-600",   title: "과업지시서 요약",      query: "과업지시서 핵심 내용을 500자 이내로 요약해줘" },
    { icon: Globe,      iconBg: "bg-green-50",  iconColor: "text-green-600",  title: "한→영 지침 번역",     query: "교통량 상시조사 수집 주기 조항을 영문으로 번역해줘" },
    { icon: FileText,   iconBg: "bg-orange-50", iconColor: "text-orange-600", title: "핵심 키워드 추출",     query: "이 문서의 핵심 키워드 10개와 핵심 내용을 200자로 정리해줘" },
  ],
  REPORT: [
    { icon: FileText,    iconBg: "bg-emerald-50", iconColor: "text-emerald-600", title: "주간 실적 보고서",  query: "이번 주 VDS 정기점검 5개소 완료, 속도 예측 모델 성능 점검 2건 처리 완료를 주간 실적 보고서로 작성해줘" },
    { icon: AlertCircle, iconBg: "bg-red-50",     iconColor: "text-red-600",     title: "돌발상황 처리 보고", query: "경부선 하행 급감속 클러스터 검지 및 VMS 경보 송출 결과에 대한 상황보고서를 작성해줘" },
    { icon: Activity,    iconBg: "bg-blue-50",    iconColor: "text-blue-600",    title: "월간 실적 보고서",  query: "2026년 9월 데이터플랫폼부 월간 업무 실적을 보고서 형식으로 작성해줘" },
    { icon: Star,        iconBg: "bg-yellow-50",  iconColor: "text-yellow-600",  title: "분기 성과 분석",    query: "올해 3분기 교통데이터 수집 품질 이력을 바탕으로 성과 분석 보고서를 작성해줘" },
  ],
};

export const AGENT_TEAMS = [
  {
    id: "agent-chatbot", name: "업무 챗봇", shortName: "업무 챗봇",
    desc: "교통량·속도 데이터, 사내 규정, 업무 절차 등 궁금한 사항을 자유롭게 질문하면 RAG 기반으로 근거와 함께 즉시 답변합니다.",
    icon: MessageCircle, color: "indigo", tech: ["RAG", "sLLM", "대화형"],
    workflow: [
      { step: 1, role: "의도 파악",   name: "의도 파악 에이전트",  prompt: "사용자 질의의 핵심 의도와 필요한 정보 범주를 파악하십시오.",              tool: "GPT-OSS 120B" },
      { step: 2, role: "문서 검색",   name: "RAG 검색 에이전트",   prompt: "관련 문서·규정을 벡터 검색으로 상위 5건 추출하십시오.",                   tool: "사내_지식_검색망" },
      { step: 3, role: "답변 생성",   name: "답변 생성 에이전트",  prompt: "검색 결과를 근거로 명확하고 정확한 답변을 작성하십시오.",                  tool: "GPT-OSS 120B" },
    ]
  },
  {
    id: "agent-report", name: "표준 보고서 작성", shortName: "보고서 작성",
    desc: "단순 텍스트를 사내 표준 양식(주간실적·현장점검·상황보고 등)에 맞춰 완성된 공문서로 자동 생성합니다.",
    icon: FileText, color: "emerald", tech: ["sLLM", "템플릿", "공문서"],
    workflow: [
      { step: 1, role: "양식 로드",   name: "템플릿 검색기",       prompt: "요청 보고서 종류에 맞는 사내 표준 템플릿 구조를 불러오십시오.",             tool: "사내_지식_검색망" },
      { step: 2, role: "정보 매핑",   name: "데이터 정제기",       prompt: "입력 데이터를 분석하여 템플릿 각 목차에 알맞게 배치하십시오.",              tool: "해당 없음" },
      { step: 3, role: "최종 생성",   name: "보고서 포맷터",       prompt: "매핑 데이터를 공문서 개조식 문장으로 다듬어 출력하십시오.",                  tool: "GPT-OSS 120B" },
    ]
  },
  {
    id: "agent-meeting", name: "회의록 작성", shortName: "회의록",
    desc: "음성 파일을 업로드하면 STT·분석·작성 에이전트가 협력하여 표준 양식의 회의록을 자동 생성합니다.",
    icon: ClipboardList, color: "purple", tech: ["STT", "RAG", "멀티에이전트"],
    workflow: [
      { step: 1, role: "음성 변환",   name: "STT 에이전트",        prompt: "음성 파일을 텍스트로 변환하고 화자를 구분하십시오.",                         tool: "Whisper-v3" },
      { step: 2, role: "내용 분석",   name: "분석 에이전트",       prompt: "발언 내용에서 주요 결정 사항·액션 아이템·참석자 역할을 추출하십시오.",      tool: "GPT-OSS 120B" },
      { step: 3, role: "문서 작성",   name: "작성 에이전트",       prompt: "표준 회의록 양식에 맞게 결과물을 완성하십시오.",                               tool: "GPT-OSS 120B" },
    ]
  },
  {
    id: "agent-knowledge", name: "지식 검색", shortName: "지식 검색",
    desc: "교통량조사 지침·장비 유지관리 매뉴얼·도로 관계법령 등 사내 문서를 자연어로 검색하면 벡터 임베딩 기반으로 관련 내용과 출처를 제공합니다.",
    icon: Search, color: "violet", tech: ["RAG", "벡터DB", "시맨틱"],
    workflow: [
      { step: 1, role: "질의 임베딩",  name: "임베딩 에이전트",    prompt: "자연어 질의를 고차원 벡터로 변환하십시오.",                                    tool: "EXAONE 3.0 78B" },
      { step: 2, role: "시맨틱 검색",  name: "벡터 검색 에이전트", prompt: "임베딩 벡터로 지식 DB 내 유사 문서를 최대 10건 검색하십시오.",                 tool: "사내_지식_검색망" },
      { step: 3, role: "결과 랭킹",    name: "랭킹 에이전트",       prompt: "검색 결과를 관련성 점수로 재정렬하고 핵심 발췌문을 추출하십시오.",              tool: "GPT-OSS 120B" },
    ]
  },
  {
    id: "agent-internalreg", name: "내규·규정 조회", shortName: "규정 조회",
    desc: "유지관리 매뉴얼·업무지침·복무규정 등 사내 내규를 자연어로 질의하면 근거 조항과 함께 명확한 답변을 제공합니다.",
    icon: BookOpen, color: "blue", tech: ["RAG", "지식DB", "인용"],
    workflow: [
      { step: 1, role: "질의 분석",   name: "의도 파악 에이전트",  prompt: "사용자 질의의 핵심 의도와 관련 규정 범주를 파악하십시오.",                    tool: "GPT-OSS 120B" },
      { step: 2, role: "문서 검색",   name: "RAG 검색 에이전트",   prompt: "관련 내규 조항을 벡터 검색으로 상위 5건 추출하십시오.",                       tool: "사내_지식_검색망" },
      { step: 3, role: "답변 생성",   name: "답변 작성 에이전트",  prompt: "검색된 조항을 인용하여 명확하고 구체적인 답변을 작성하십시오.",                tool: "EXAONE 3.0 78B" },
    ]
  },
  {
    id: "agent-ocr", name: "문서 인식(OCR)", shortName: "문서 인식",
    desc: "스캔 이미지·PDF를 업로드하면 Vision OCR로 텍스트와 표를 추출하고 편집 가능한 문서로 변환합니다.",
    icon: ScanLine, color: "teal", tech: ["Vision OCR", "PDF", "표 추출"],
    workflow: [
      { step: 1, role: "이미지 전처리", name: "이미지 정규화기",   prompt: "입력 이미지의 기울기 보정·노이즈 제거·해상도를 최적화하십시오.",             tool: "Vision_OCR_엔진" },
      { step: 2, role: "텍스트 추출",  name: "OCR 추출 에이전트", prompt: "보정된 이미지에서 텍스트·표·수치 데이터를 정밀 추출하십시오.",                tool: "Vision_OCR_엔진" },
      { step: 3, role: "구조화",       name: "문서 구조화기",      prompt: "추출 텍스트를 단락·표·목록 등 논리적 구조로 재구성하십시오.",                  tool: "GPT-OSS 120B" },
    ]
  },
  {
    id: "agent-dbquery", name: "데이터 조회·분석", shortName: "데이터 조회",
    desc: "자연어로 노선·구간별 교통량·속도 시계열을 질의하면 SQL을 자동 생성하고 표·차트로 결과를 시각화합니다.",
    icon: Database, color: "cyan", tech: ["Text2SQL", "DB", "시각화"],
    workflow: [
      { step: 1, role: "질의 분석",   name: "NL 파서",             prompt: "자연어 질의에서 조회 의도·필터·집계 조건을 구조화하십시오.",                  tool: "GPT-OSS 120B" },
      { step: 2, role: "SQL 생성",    name: "Text2SQL 에이전트",   prompt: "구조화된 조건으로 최적 SQL 쿼리를 생성하십시오.",                             tool: "GPT-OSS 120B" },
      { step: 3, role: "결과 시각화", name: "결과 포맷터",          prompt: "쿼리 결과를 표·집계 통계·시각화 형식으로 출력하십시오.",                      tool: "내장 DB 엔진" },
    ]
  },
  {
    id: "agent-address", name: "기준정보 표준화", shortName: "기준정보",
    desc: "시스템별로 제각각인 코드·명칭을 표준 명명규칙으로 매핑하고 미매칭·중복 항목을 정비합니다.",
    icon: MapPin, color: "rose", tech: ["기준정보DB", "표준코드", "일괄처리"],
    workflow: [
      { step: 1, role: "명칭 파싱",   name: "명명규칙 파서",       prompt: "입력 항목의 명명 구성요소를 표준 규칙 단위로 분해하십시오.",                tool: "내장 알고리즘" },
      { step: 2, role: "DB 조회",     name: "표준코드 매퍼",       prompt: "분해된 구성요소로 표준 기준정보 사전에서 최적 매칭 결과를 조회하십시오.",    tool: "표준_기준정보_DB" },
      { step: 3, role: "교차 검증",   name: "정합성 검증 에이전트", prompt: "매핑 결과의 중복·충돌 여부를 시스템 간 교차 검증하십시오.",                  tool: "기준정보_엔진" },
    ]
  },
  {
    id: "agent-dataanalysis", name: "데이터 시각화 분석", shortName: "데이터 분석",
    desc: "Excel·CSV 파일을 업로드하면 기술통계·분포·이상치 탐지를 자동 수행하고 차트·보고서로 시각화합니다.",
    icon: BarChart2, color: "orange", tech: ["통계분석", "시각화", "AI"],
    workflow: [
      { step: 1, role: "데이터 파싱",  name: "데이터 파싱 에이전트", prompt: "CSV/Excel 파일 구조를 파악하고 데이터 타입·결측치·범위를 정제하십시오.",    tool: "내장 파서" },
      { step: 2, role: "통계 분석",   name: "통계 분석 에이전트",   prompt: "기술통계, 분포, 상관관계, 이상치를 탐지하고 인사이트를 도출하십시오.",     tool: "GPT-OSS 120B" },
      { step: 3, role: "시각화",      name: "시각화 에이전트",      prompt: "분석 결과를 목적에 맞는 차트·그래프로 자동 생성하십시오.",                   tool: "내장 시각화 엔진" },
    ]
  },
  {
    id: "agent-summary", name: "문서 요약", shortName: "문서 요약",
    desc: "업로드 문서를 핵심요약·상세요약·불릿 포인트 등 원하는 형식으로 자동 요약하고 핵심 키워드를 추출합니다.",
    icon: AlignLeft, color: "amber", tech: ["sLLM", "청킹", "키워드"],
    workflow: [
      { step: 1, role: "문서 분석",   name: "구조 파악 에이전트",  prompt: "문서의 구조(챕터·섹션·단락)와 핵심 주제를 파악하십시오.",                    tool: "GPT-OSS 120B" },
      { step: 2, role: "요약 생성",   name: "요약 LLM 에이전트",   prompt: "선택한 형식(핵심·상세·불릿)과 목표 길이에 맞춰 요약을 생성하십시오.",        tool: "Llama-3-Korean 70B" },
      { step: 3, role: "키워드 추출", name: "키워드 분석기",        prompt: "문서 전체에서 핵심 키워드·전문용어·고유명사를 추출하고 중요도를 산출하십시오.", tool: "EXAONE 3.0 78B" },
    ]
  },
  {
    id: "agent-translate", name: "문서 번역", shortName: "번역",
    desc: "한·영·중·일 문서를 의미 단위로 분할해 번역하고, 용어집 적용·역번역 검증·요약까지 한 번에 처리합니다.",
    icon: Languages, color: "violet", tech: ["번역", "청킹", "용어집"],
    workflow: [
      { step: 1, role: "문서 분할",   name: "청킹 에이전트",       prompt: "문맥이 끊기지 않도록 문서를 의미 단위로 분할하십시오.",                       tool: "GPT-OSS 120B" },
      { step: 2, role: "번역 수행",   name: "번역 LLM 에이전트",   prompt: "사내 용어집을 우선 적용하여 대상 언어로 번역하십시오.",                       tool: "Llama-3-Korean 70B" },
      { step: 3, role: "문체 검수",   name: "검수 에이전트",       prompt: "공기업 표준 문체로 다듬고 용어 일관성과 누락 여부를 검수하십시오.",            tool: "EXAONE 3.0 78B" },
    ]
  },
  {
    id: "agent-review", name: "문서 사전 검토", shortName: "문서 검토",
    desc: "기안문·계획서를 업로드하면 유지관리 매뉴얼·업무처리지침 등 사내 기준과 자동 대조하여 누락·위반 소지를 심각도별로 검토합니다.",
    icon: FileCheck, color: "indigo", tech: ["RAG", "사규 대조", "DRM"],
    workflow: [
      { step: 1, role: "문서 해제",   name: "DRM 해제 에이전트",   prompt: "업로드 문서의 DRM을 해제하고 텍스트·표 데이터를 추출하십시오.",               tool: "DRM_자동_복호화_모듈" },
      { step: 2, role: "규정 검색",   name: "규정 검색 에이전트",  prompt: "문서 내용과 관련된 사내 규정 조항을 시맨틱 검색으로 추출하십시오.",            tool: "사내_지식_검색망" },
      { step: 3, role: "위반 검토",   name: "위반사항 검토 에이전트", prompt: "규정 조항과 대조하여 위반 소지를 심각도(높음·중간·낮음)별로 분석하십시오.",  tool: "GPT-OSS 120B" },
    ]
  },
  {
    id: "agent-safety", name: "안전관리계획 수립", shortName: "안전계획",
    desc: "도로 공사·점검 구간 정보와 위험 요소를 입력하면 위험성평가 매트릭스와 관련 법령 기반의 안전관리계획서를 자동 생성합니다.",
    icon: ShieldCheck, color: "orange", tech: ["위험성평가", "법령 RAG", "체크리스트"],
    workflow: [
      { step: 1, role: "위험 분석",   name: "위험성평가 에이전트", prompt: "입력된 위험 요소별 심각도×발생빈도 매트릭스를 산출하십시오.",                  tool: "GPT-OSS 120B" },
      { step: 2, role: "법령 검색",   name: "법령·지침 검색 에이전트", prompt: "산업안전보건법 등 관련 법령과 사내 안전지침을 검색하십시오.",             tool: "사내_지식_검색망" },
      { step: 3, role: "계획 생성",   name: "계획서 작성 에이전트", prompt: "평가 결과와 법령 근거를 반영한 안전관리계획서를 표준 양식으로 작성하십시오.",  tool: "Llama-3-Korean 70B" },
    ]
  },
];

export const MCP_TOOLS = [
  { id: "t1",  name: "사내_지식_검색망", type: "벡터 DB",    endpoint: "grpc://10.10.1.11:7001", latency: 38,   desc: "사내 규정(내규, 업무지침, 유지관리 매뉴얼 등) 시맨틱 검색 엔진", status: "활성" },
  { id: "t2",  name: "DRM_자동_복호화_모듈",      type: "보안 모듈",  endpoint: "grpc://10.10.1.12:7002", latency: 15,   desc: "업로드 문서 파싱 전 암호화 해제 (사내 SSO/EAM 연동)",          status: "활성" },
  { id: "t3",  name: "Vision_OCR_엔진",           type: "OCR 모듈",   endpoint: "http://10.10.1.13:8080", latency: 220,  desc: "스캔된 PDF 및 이미지 내 텍스트·표 데이터 추출",                status: "활성" },
  { id: "t4",  name: "표준_기준정보_DB",           type: "기준정보 DB",    endpoint: "grpc://10.10.1.14:7004", latency: 12,   desc: "노선·구간·시설물 표준 기준정보 사전 (실시간 연동)",         status: "활성" },
  { id: "t5",  name: "업무_정형DB",               type: "관계형 DB",  endpoint: "jdbc://10.10.1.15:5432", latency: 8,    desc: "노선·구간별 교통량·속도 시계열 데이터베이스 (EX-DataLake)",    status: "활성" },
  { id: "t6",  name: "Whisper_STT_엔진",          type: "STT 모듈",   endpoint: "grpc://10.10.1.16:7006", latency: 890,  desc: "음성 파일 텍스트 변환 및 화자 분리 (Speaker Diarization)",      status: "활성" },
  { id: "t7",  name: "GPT-OSS_120B_sLLM",        type: "sLLM 엔진",  endpoint: "grpc://10.10.1.17:7007", latency: 1240, desc: "사내 구축 오픈소스 대형 언어 모델 (120B 파라미터, 온프레미스)", status: "활성" },
  { id: "t8",  name: "Llama-3-Korean_70B",        type: "sLLM 엔진",  endpoint: "grpc://10.10.1.17:7008", latency: 820,  desc: "한국어 특화 Llama-3 기반 경량 sLLM (70B 파라미터)",            status: "활성" },
  { id: "t9",  name: "EXAONE-3_78B_sLLM",        type: "sLLM 엔진",  endpoint: "grpc://10.10.1.17:7009", latency: 940,  desc: "LG AI Research 한국어 특화 모델 (78B 파라미터)",               status: "활성" },
  { id: "t10", name: "기준정보_매칭_엔진",         type: "지도 API",   endpoint: "grpc://10.10.1.20:7010", latency: 43,   desc: "노선 이정(k)·IC 구간의 위경도 좌표 및 관할 본부 코드 변환 서비스", status: "활성" },
];

export const MY_RAG_INIT = [
  {id:'mra-1',name:'내 업무 참고자료',docs:3,active:true},
  {id:'mra-2',name:'용역 계약 검토 자료',docs:2,active:false},
];

export const MY_RAG_DOCS_INIT = {
  'mra-1':[
    {id:'mr-1',name:'교통데이터_업무매뉴얼_2026.pdf',   size:'1.2MB', pii:false, inScope:true,  secLevel:'O'},
    {id:'mr-2',name:'도로터널_방재시설_설치지침.pdf',   size:'840KB', pii:false, inScope:true,  secLevel:'S'},
    {id:'mr-3',name:'연간_교통량_집계표_초안.xlsx',     size:'2.1MB', pii:true,  inScope:false, secLevel:'S'},
  ],
  'mra-2':[
    {id:'mr-4',name:'용역계약서_표준양식.docx',        size:'580KB', pii:false, inScope:true,  secLevel:'S'},
    {id:'mr-5',name:'계약검토체크리스트.pdf',          size:'320KB', pii:false, inScope:true,  secLevel:'O'},
  ],
};
