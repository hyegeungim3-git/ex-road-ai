import React, { useState, useRef, useEffect } from "react";
import {
  MapPin, Cpu, Database, Globe2, Radio, Loader2, CheckCircle,
  ChevronRight, Network, Play, RotateCcw, Download, Copy,
  Upload, RefreshCw, FileSpreadsheet, BarChart3, Target, Map,
  AlertTriangle, ChevronDown, Search, Hash, ArrowRightLeft,
  Clipboard, ClipboardCheck, XCircle,
  ScanLine, Eye, FileText, Zap, Shield, CheckCircle2,
  Building2, Home, Layers
} from "lucide-react";
import AgentWorkflowPanel from "./AgentWorkflowPanel.jsx";
import { AGENT_TEAMS } from "../../data/constants.js";
import { useAgentSimulation } from "../../hooks/useAgentSimulation.js";
import { cn, agentHeader } from "../../utils.jsx";


const AGENTS=[
  {icon:Cpu,      label:'위치 표현 파서',    sub:'노선·이정·주소 구성요소 분해 중', color:'bg-rose-600',  ms:1200},
  {icon:Database, label:'위치 매핑 에이전트', sub:'도로명주소 DB·EXTIS 매칭 중',    color:'bg-pink-600',  ms:2000},
  {icon:Globe2,   label:'지오코딩 에이전트', sub:'위경도 좌표·VDS 지점 변환 중',   color:'bg-red-600',   ms:1500},
];

const SAMPLE_BATCH=`경부선 하행 386.8k 급감속 지점
영동선 상행 대관령1터널 입구
중부내륙선 남한강교 128.6k
서해안선 하행 매송IC 부근
경부선 상행 기흥휴게소`;

const BATCH_RESULTS=[
  {input:'경부선 하행 386.8k 급감속 지점', road:'경기도 용인시 기흥구 경부고속도로 386',   jibun:'경기도 용인시 기흥구 신갈동 산 12-3',       zip:'16976', legalCode:'4146310100', adminCode:'4146355000', legalDong:'신갈동',   adminDong:'신갈동',   conf:98.7,status:'완전매칭'},
  {input:'영동선 상행 대관령1터널 입구',   road:'강원특별자치도 평창군 대관령면 영동고속도로 143', jibun:'강원특별자치도 평창군 대관령면 횡계리 산 1-2', zip:'25374', legalCode:'4276031022', adminCode:'4276031000', legalDong:'횡계리',   adminDong:'대관령면', conf:97.3,status:'완전매칭'},
  {input:'중부내륙선 남한강교 128.6k',     road:'충청북도 충주시 앙성면 중부내륙고속도로 128',    jibun:'충청북도 충주시 앙성면 능암리 산 45',        zip:'27300', legalCode:'4313034021', adminCode:'4313034000', legalDong:'능암리',   adminDong:'앙성면',   conf:96.4,status:'부분매칭'},
  {input:'서해안선 하행 매송IC 부근',      road:'경기도 화성시 매송면 서해안고속도로 42',        jibun:'경기도 화성시 매송면 어천리 128-1',          zip:'18274', legalCode:'4159031024', adminCode:'4159031000', legalDong:'어천리',   adminDong:'매송면',   conf:97.9,status:'완전매칭'},
  {input:'경부선 상행 기흥휴게소',         road:'경기도 용인시 기흥구 경부고속도로 391',        jibun:'경기도 용인시 기흥구 하갈동 555',            zip:'16977', legalCode:'4146310300', adminCode:'4146355000', legalDong:'하갈동',   adminDong:'신갈동',   conf:98.2,status:'완전매칭'},
];

const QUICK_EXAMPLES=['경부선 하행 기흥IC 부근 급감속 지점','영동선 대관령 구간 결빙 신고 위치','중부내륙선 남한강교 계측 지점'];

/* ── 구간·VDS 지점 코드 조회 ─────────────────────────── */
const APT_QUICK=[
  '경부선 하행 기흥IC~수원신갈IC',
  '영동선 상행 대관령1터널 구간',
  '중부내륙선 남한강교 구간',
];

const APT_RESULT={
  query:'경부선 하행 기흥IC~수원신갈IC',
  complexName:'경부선 하행 기흥IC~수원신갈IC',
  complexCode:'0010-D-3842',
  address:'경기도 용인시 기흥구 신갈동 일원 (하행 384.2k~389.6k)',
  roadAddress:'경기도 용인시 기흥구 경부고속도로 384~390',
  legalDong:'용인지사',
  legalCode:'수도권본부',
  totalHouseholds:24,
  totalBuildings:4,
  buildings:[
    {dongName:'384.2k', dongCode:'VDS-0010-0245', floors:3, households:6},
    {dongName:'386.8k', dongCode:'VDS-0010-0247', floors:3, households:6},
    {dongName:'388.1k', dongCode:'VDS-0010-0249', floors:3, households:6},
    {dongName:'389.6k', dongCode:'VDS-0010-0251', floors:3, households:6},
  ],
  units:[
    {floor:1, hoName:'1차로',   hoCode:'VDS-0010-0247-L1', area:99.4, type:'본선'},
    {floor:2, hoName:'2차로',   hoCode:'VDS-0010-0247-L2', area:99.1, type:'본선'},
    {floor:3, hoName:'3차로',   hoCode:'VDS-0010-0247-L3', area:98.7, type:'본선'},
    {floor:4, hoName:'갓길차로', hoCode:'VDS-0010-0247-L4', area:97.2, type:'갓길'},
    {floor:5, hoName:'진출램프', hoCode:'VDS-0010-0247-R1', area:93.5, type:'램프'},
    {floor:6, hoName:'진입램프', hoCode:'VDS-0010-0247-R2', area:83.3, type:'램프'},
  ],
};

/* ── OCR 모드 상수 ──────────────────────────────────── */
const OCR_AGENTS=[
  {icon:Shield,    label:'DRM 복호화',        sub:'SSO/EAM 정책 검증 및 문서 복호화',   color:'bg-red-600',    ms:700},
  {icon:ScanLine,  label:'Vision OCR',         sub:'Vision OCR 엔진 문자 인식 중',       color:'bg-teal-600',   ms:3400},
  {icon:Eye,       label:'주소 패턴 추출기',   sub:'정규식 패턴으로 주소 후보 탐지',     color:'bg-amber-600',  ms:900},
  {icon:Cpu,       label:'주소 파서',          sub:'주소 구성요소 분해 중',              color:'bg-rose-600',   ms:1100},
  {icon:Database,  label:'주소 매핑 에이전트', sub:'공식 주소 DB 매칭 중',              color:'bg-pink-600',   ms:1800},
  {icon:Globe2,    label:'지오코딩 에이전트',  sub:'위경도 좌표 변환 중',               color:'bg-red-600',    ms:1200},
];

const OCR_DOC_TEXT_RAW=`[돌발상황 현장 확인 보고]
문서번호: EX-교통센터-2026-0912
확인일자: 2026.09.18  담당: 박선영(교통센터 상황관리부)

1. 상황 개요
발생 위치: 경부선 하행 386.8k (기흥IC~수원신갈IC)
검지 지점: VDS-0010-0247

2. 현장 확인 내역
(1) 1차 확인: 경기도 용인시 기흥구 신갈동 산 12-3
    현황: 3차로 정차 차량 | 2차사고 위험도 0.78
(2) 2차 확인: 경기도 용인시 기흥구 하갈동 555
    현황: 갓길 견인 대기 | 차로 차단 해제

3. 우회 안내 지점
   지점 A: 경기도 수원시 영통구 이의동 1330
   지점 B: 경기도 용인시 수지구 풍덕천동 1002

4. 비고
   AI 검지 결과 상황관리부 2차 확인 예정`;

const OCR_ADDR_RESULTS=[
  {raw:'경부선 하행 386.8k',              ctx:'발생 위치',   ocrConf:98.3, road:'경기도 용인시 기흥구 경부고속도로 386', jibun:'경기도 용인시 기흥구 신갈동 산 12-3', zip:'16976',lat:'37.2735',lng:'127.1102',legalCode:'4146310100',legalDong:'신갈동',  adminCode:'4146355000',adminDong:'신갈동',  matchConf:98.7,status:'완전매칭'},
  {raw:'경기도 용인시 기흥구 신갈동 산 12-3',ctx:'1차 확인',  ocrConf:97.1, road:'경기도 용인시 기흥구 경부고속도로 386', jibun:'경기도 용인시 기흥구 신갈동 산 12-3', zip:'16976',lat:'37.2758',lng:'127.1069',legalCode:'4146310100',legalDong:'신갈동',  adminCode:'4146355000',adminDong:'신갈동',  matchConf:99.2,status:'완전매칭'},
  {raw:'경기도 용인시 기흥구 하갈동 555',  ctx:'2차 확인',    ocrConf:96.8, road:'경기도 용인시 기흥구 경부고속도로 391', jibun:'경기도 용인시 기흥구 하갈동 555',    zip:'16977',lat:'37.2810',lng:'127.0990',legalCode:'4146310300',legalDong:'하갈동',  adminCode:'4146355000',adminDong:'신갈동',  matchConf:97.4,status:'완전매칭'},
  {raw:'경기도 수원시 영통구 이의동 1330', ctx:'우회 지점 A', ocrConf:94.2, road:'경기도 수원시 영통구 광교중앙로 140',  jibun:'경기도 수원시 영통구 이의동 1330',   zip:'16514',lat:'37.2960',lng:'127.0500',legalCode:'4111710800',legalDong:'이의동',  adminCode:'4111766000',adminDong:'광교1동',matchConf:96.8,status:'부분매칭'},
  {raw:'경기도 용인시 수지구 풍덕천동 1002',ctx:'우회 지점 B',ocrConf:99.1, road:'경기도 용인시 수지구 풍덕천로 76',    jibun:'경기도 용인시 수지구 풍덕천동 1002', zip:'16827',lat:'37.3230',lng:'127.0949',legalCode:'4146510100',legalDong:'풍덕천동',adminCode:'4146551000',adminDong:'풍덕천1동',matchConf:98.2,status:'완전매칭'},
];

/* ── 기준정보 매핑(마스터 정비) 모드 ─────────────────
   팩이 masterMapping을 제공할 때만 처리 유형 카드가 노출된다(미제공 도메인 무변화). */
const MASTER_PIPELINE_DEFAULT=[
  {label:'소스 수집',     sub:'대상 시스템에서 원본 항목을 수집 중',  ms:1400},
  {label:'명명규칙 파서', sub:'표준 명명규칙으로 구문 분해 중',       ms:1800},
  {label:'표준코드 매퍼', sub:'표준 마스터와 후보 매칭 중',           ms:2600},
  {label:'교차 검증',     sub:'시스템 간 정합성을 검증 중',           ms:1600},
];
const MASTER_ICONS=[Database,Cpu,ArrowRightLeft,CheckCircle2];
const MASTER_COLORS=['bg-indigo-600','bg-violet-600','bg-indigo-500','bg-emerald-600'];
const MASTER_STATUS={
  auto:  {label:'자동 확정', dot:'bg-emerald-500', chip:'bg-emerald-50 border-emerald-200 text-emerald-700'},
  review:{label:'검토 필요', dot:'bg-amber-500',   chip:'bg-amber-50 border-amber-200 text-amber-700'},
  none:  {label:'미매칭',    dot:'bg-rose-500',    chip:'bg-rose-50 border-rose-200 text-rose-700'},
};

const CODE_LOOKUP={
  '4146310100':{type:'법정동',dong:'신갈동',   road:'경기도 용인시 기흥구 경부고속도로 386',        jibun:'경기도 용인시 기흥구 신갈동 산 12-3',        zip:'16976',legalCode:'4146310100',adminCode:'4146355000',adminDong:'신갈동',   region:'경기도 > 용인시 기흥구 > 신갈동'},
  '4146355000':{type:'행정동',dong:'신갈동',   road:'경기도 용인시 기흥구 경부고속도로 386',        jibun:'경기도 용인시 기흥구 신갈동 산 12-3',        zip:'16976',legalCode:'4146310100',adminCode:'4146355000',legalDong:'신갈동',   region:'경기도 > 용인시 기흥구 > 신갈동'},
  '4146310300':{type:'법정동',dong:'하갈동',   road:'경기도 용인시 기흥구 경부고속도로 391',        jibun:'경기도 용인시 기흥구 하갈동 555',            zip:'16977',legalCode:'4146310300',adminCode:'4146355000',adminDong:'신갈동',   region:'경기도 > 용인시 기흥구 > 하갈동'},
  '4276031022':{type:'법정동',dong:'횡계리',   road:'강원특별자치도 평창군 대관령면 영동고속도로 143',jibun:'강원특별자치도 평창군 대관령면 횡계리 산 1-2',zip:'25374',legalCode:'4276031022',adminCode:'4276031000',adminDong:'대관령면', region:'강원특별자치도 > 평창군 > 대관령면 횡계리'},
  '4276031000':{type:'행정동',dong:'대관령면', road:'강원특별자치도 평창군 대관령면 영동고속도로 143',jibun:'강원특별자치도 평창군 대관령면 횡계리 산 1-2',zip:'25374',legalCode:'4276031022',adminCode:'4276031000',legalDong:'횡계리',   region:'강원특별자치도 > 평창군 > 대관령면'},
  '4313034021':{type:'법정동',dong:'능암리',   road:'충청북도 충주시 앙성면 중부내륙고속도로 128',   jibun:'충청북도 충주시 앙성면 능암리 산 45',        zip:'27300',legalCode:'4313034021',adminCode:'4313034000',adminDong:'앙성면',   region:'충청북도 > 충주시 > 앙성면 능암리'},
  '4313034000':{type:'행정동',dong:'앙성면',   road:'충청북도 충주시 앙성면 중부내륙고속도로 128',   jibun:'충청북도 충주시 앙성면 능암리 산 45',        zip:'27300',legalCode:'4313034021',adminCode:'4313034000',legalDong:'능암리',   region:'충청북도 > 충주시 > 앙성면'},
  '4159031024':{type:'법정동',dong:'어천리',   road:'경기도 화성시 매송면 서해안고속도로 42',       jibun:'경기도 화성시 매송면 어천리 128-1',          zip:'18274',legalCode:'4159031024',adminCode:'4159031000',adminDong:'매송면',   region:'경기도 > 화성시 > 매송면 어천리'},
  '4159031000':{type:'행정동',dong:'매송면',   road:'경기도 화성시 매송면 서해안고속도로 42',       jibun:'경기도 화성시 매송면 어천리 128-1',          zip:'18274',legalCode:'4159031024',adminCode:'4159031000',legalDong:'어천리',   region:'경기도 > 화성시 > 매송면'},
};

const CODE_QUICK_EXAMPLES=[
  {code:'4146310100',label:'용인 기흥 신갈동 (법정)'},
  {code:'4146355000',label:'용인 기흥 신갈동 (행정)'},
  {code:'4276031022',label:'평창 대관령 횡계리 (법정)'},
];

const RESULT={
  road:'경기도 용인시 기흥구 경부고속도로 386',
  jibun:'경기도 용인시 기흥구 신갈동 산 12-3',
  zip:'16976',
  lat:'37.2735',
  lng:'127.1102',
  buildType:'공동주택',
  adminDong:'신갈동',
  legalDong:'신갈동',
  legalCode:'4146310100',
  adminCode:'4146355000',
  status:'완전매칭',
  complexName:'경부선 하행 기흥IC~수원신갈IC',
  complexCode:'0010-D-3842',
};

/* ── 처리 유형 카드 (m·color 키 고정: single|batch|ocr|reverse / rose|orange|teal|purple) ── */
const MODE_TYPES_DEFAULT=[
  {m:'single',  icon:'📍', label:'단일 위치',   desc:'비정형 위치 표현 1건을 도로명·지번·좌표·노선 이정으로 변환', color:'rose'},
  {m:'batch',   icon:'📋', label:'일괄 처리',   desc:'여러 지점을 한 번에 붙여넣거나 파일로 일괄 표준화',          color:'orange'},
  {m:'ocr',     icon:'🔍', label:'OCR 파일',    desc:'돌발상황 보고서·현장 점검표에서 위치 자동 추출',             color:'teal'},
  {m:'reverse', icon:'🔢', label:'코드 역조회', desc:'법정동·행정동코드로 정식 주소를 역방향 조회',                color:'purple'},
];

/* 도메인 이관: 기본 콘텐츠 — 도메인 팩 agentContent["agent-address"]로 키 단위 오버라이드 */
export const CONTENT_DEFAULTS={
  defaultAddress:'용인시 기흥구 경부고속도로 386.8k 하행',    // 단일 위치 입력 초기값
  addressPlaceholder:'예: 경부선 하행 386.8k / 용인시 기흥구 신갈동 산 12-3', // 단일 위치 placeholder
  quickExamples:QUICK_EXAMPLES,                              // string[3] — 단일 위치 예시 칩
  defaultAptQuery:'경부선 하행 기흥IC~수원신갈IC',            // 구간·VDS 지점 조회 입력 초기값
  aptPlaceholder:'예: 경부선 하행 기흥IC~수원신갈IC',         // 구간·VDS 지점 조회 placeholder
  aptQuickExamples:APT_QUICK,                                // string[3] — 구간 예시 칩
  aptLookupResult:APT_RESULT,                                // {query,complexName(구간명),complexCode(구간코드),address,roadAddress,legalDong(관할 지사),legalCode(관할 본부),totalHouseholds(총 검지채널 수),totalBuildings(VDS 지점 수),buildings:{dongName(이정),dongCode(VDS 지점코드),floors(차로 수),households(채널 수)}[4],units:{floor(채널 번호),hoName(차로명),hoCode(채널코드),area(검지율 %),type(구분)}[6]}
  singleResult:RESULT,                                       // {road,jibun,zip,lat,lng,buildType(값 계약 '공동주택'이면 VDS 지점 코드 섹션 노출 — 표시 문자열 아님),adminDong,legalDong,legalCode,adminCode,status('완전매칭'|'부분매칭'),complexName(구간명),complexCode(구간코드)}
  sampleBatch:SAMPLE_BATCH,                                  // 개행 구분 위치 문자열(5줄) — 일괄 처리 textarea 초기값
  batchResults:BATCH_RESULTS,                                // {input,road,jibun,zip,legalCode,adminCode,legalDong,adminDong,conf(number),status('완전매칭'|'부분매칭')}[5]
  modeTypes:MODE_TYPES_DEFAULT,                              // {m·color 키 고정, icon(이모지), label, desc}[4]
  ocrDocText:OCR_DOC_TEXT_RAW,                               // OCR 스트리밍 원문 — 공백 단위로 순차 출력됨
  ocrAddrResults:OCR_ADDR_RESULTS,                           // {raw,ctx,ocrConf,road,jibun,zip,lat,lng,legalCode,legalDong,adminCode,adminDong,matchConf,status('완전매칭'|'부분매칭')}[5]
  ocrFeatureLabel:'돌발상황·현장 점검 보고서 특화',            // OCR 업로드 존 강조 문구(도메인 문서 유형)
  codeLookup:CODE_LOOKUP,                                    // {코드10자리: {type('법정동'|'행정동'),dong,road,jibun,zip,legalCode,adminCode,adminDong?,legalDong?,region}}
  codeQuickExamples:CODE_QUICK_EXAMPLES,                     // {code,label}[3] — 역조회 예시 칩
  headerTitle:'도로 위치 표준화 에이전트',                    // 화면 헤더(도메인 리브랜딩)
  headerDesc:'처리 유형 선택 → 입력 → 노선·이정·VDS 지점 매핑',
  headerStatus:'도로명주소 DB · EXTIS 연결됨',                // 우상단 연결 표시
  masterMapping:null,
  /* masterMapping 스키마 (선택 — 제공 시 modeTypes에 {m:'master',color:'indigo'} 카드를 함께 넣어야 노출)
     {
       subtitle,                                             // 워크벤치 부제
       pipeline: [{label,sub,ms}],                           // 처리 단계(생략 시 코어 기본 4단계)
       scopes:   [{key,label,count,desc}],                   // 대상 소스 시스템 선택 칩
       summary:  [{label,value,sub,tone:'base'|'warn'|'bad'}], // 진단 지표 카드
       readiness:{level,max,label,note,levels:[string]},     // 성숙도 게이지
       naming:   {pattern,example,note,segments:[{seg,label,desc}]}, // 표준 명명규칙 분해
       rows:     [{src,srcSystem,suggest,name,unit,conf,status:'auto'|'review'|'none',
                   basis:[{label,detail}], alts:[{code,name,conf,reason}], convert}],
       reasons:  [{label,count,action}],                     // 미매칭 사유 분포
       crossMatch:{systems:[string],cells:[[number|null]]},  // 시스템 간 매칭률(%) 매트릭스
       apply:    {label,before,after,autoCount,reviewCount,note} // 자동 확정 반영 효과
     } */
};

const MatchStatusBadge=({status})=>{
  const isExact=status==='완전매칭';
  return(
    <div className={cn('border rounded-xl px-4 py-3 flex items-center justify-between',isExact?'bg-emerald-50 border-emerald-200':'bg-amber-50 border-amber-200')}>
      <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider">매칭 결과</div>
      <div className="flex items-center gap-2">
        {isExact
          ?<CheckCircle className="w-4 h-4 text-emerald-500"/>
          :<AlertTriangle className="w-4 h-4 text-amber-500"/>}
        <span className={cn('text-[14px] font-black',isExact?'text-emerald-700':'text-amber-700')}>{status}</span>
        <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-bold border',isExact?'bg-emerald-100 border-emerald-200 text-emerald-600':'bg-amber-100 border-amber-200 text-amber-600')}>
          {isExact?'공식 DB 일치':'수동 확인 권장'}
        </span>
      </div>
    </div>
  );
};

const AddressAgent=({onBack,domain})=>{
  const C={...CONTENT_DEFAULTS,...(domain?.agentContent?.["agent-address"]||{})};
  const H=agentHeader(domain,'agent-address',C,AGENT_TEAMS);
  const OCR_DOC_WORDS=C.ocrDocText.split(' ');
  const [mode,setMode]=useState(()=>C.modeTypes?.[0]?.m||'single'); // 팩이 정렬한 첫 유형이 기본
  const [inputTab,setInputTab]=useState('address'); // 'address' | 'apt'
  const {step,setStep,agentIdx,doneIdx,start:startSim,resetSim}=useAgentSimulation(AGENTS);
  const [address,setAddress]=useState(C.defaultAddress);
  const [aptQuery,setAptQuery]=useState(C.defaultAptQuery);
  const [aptResult,setAptResult]=useState(null);
  const [selectedDong,setSelectedDong]=useState(0);
  const [selectedHo,setSelectedHo]=useState(0);
  const [copiedField,setCopiedField]=useState(null);
  const [batchText,setBatchText]=useState(C.sampleBatch);
  const [batchCopied,setBatchCopied]=useState(false);
  const [uploadedFile,setUploadedFile]=useState(null);
  // 역조회
  const [revCode,setRevCode]=useState('');
  const [revResult,setRevResult]=useState(null);
  const [revSearched,setRevSearched]=useState(false);
  const [revCopied,setRevCopied]=useState(null);
  // 단일결과 전체복사
  const [copiedAll,setCopiedAll]=useState(false);
  // OCR 모드
  const [ocrFile,setOcrFile]=useState(null);
  const [ocrFileDrag,setOcrFileDrag]=useState(false);
  const [ocrAgentIdx,setOcrAgentIdx]=useState(-1);
  const [ocrDoneIdx,setOcrDoneIdx]=useState([]);
  const [ocrWords,setOcrWords]=useState([]);
  const [ocrAddrFound,setOcrAddrFound]=useState(false);
  const [ocrSelectedRow,setOcrSelectedRow]=useState(null);
  // 기준정보 매핑 모드
  const MM=C.masterMapping;
  const masterAgents=(MM?.pipeline||MASTER_PIPELINE_DEFAULT).map((p,i)=>({
    icon:MASTER_ICONS[i%MASTER_ICONS.length], color:MASTER_COLORS[i%MASTER_COLORS.length],
    label:p.label, sub:p.sub, ms:p.ms||1800,
  }));
  const [mstScopes,setMstScopes]=useState(()=>(MM?.scopes||[]).map(s=>s.key));
  const [mstAgentIdx,setMstAgentIdx]=useState(-1);
  const [mstDoneIdx,setMstDoneIdx]=useState([]);
  const [mstFilter,setMstFilter]=useState('all');
  const [mstRow,setMstRow]=useState(null);
  const [mstApplied,setMstApplied]=useState(false);
  const ocrFileRef=useRef(null);
  const fileRef=useRef(null);

  /* OCR 스트리밍: Vision OCR 에이전트(i=1) 활성 시 문서 텍스트 출력 */
  useEffect(()=>{
    if(ocrAgentIdx!==1){return;}
    setOcrWords([]);setOcrAddrFound(false);
    let idx=0;
    const id=setInterval(()=>{
      if(idx>=OCR_DOC_WORDS.length){clearInterval(id);return;}
      setOcrWords(p=>[...p,OCR_DOC_WORDS[idx]]);
      idx++;
    },80);
    return ()=>clearInterval(id);
  },[ocrAgentIdx]);

  /* 주소 패턴 추출기(i=2) 활성 시 "주소 감지" 플래시 */
  useEffect(()=>{
    if(ocrAgentIdx===2) setTimeout(()=>setOcrAddrFound(true),600);
  },[ocrAgentIdx]);

  const startProcess=()=>{
    if(inputTab==='apt'){
      setAptResult(C.aptLookupResult);
      setSelectedDong(0);
      setStep(3);
      return;
    }
    startSim();
  };

  const copyField=(key,val)=>{
    navigator.clipboard?.writeText(val);
    setCopiedField(key);
    setTimeout(()=>setCopiedField(null),2000);
  };


  const copyBatchCsv=()=>{
    const header='입력위치,도로명주소,지번주소,우편번호,법정동코드,법정동명,행정동코드,행정동명,매칭상태';
    const rows=C.batchResults.map(r=>[r.input,r.road,r.jibun,r.zip,r.legalCode,r.legalDong,r.adminCode,r.adminDong,r.status].join(','));
    navigator.clipboard?.writeText([header,...rows].join('\n'));
    setBatchCopied(true);
    setTimeout(()=>setBatchCopied(false),2000);
  };

  const downloadBatchExcel=()=>{
    const header='입력위치\t도로명주소\t지번주소\t우편번호\t법정동코드\t법정동명\t행정동코드\t행정동명\t매칭상태';
    const rows=C.batchResults.map(r=>[r.input,r.road,r.jibun,r.zip,r.legalCode,r.legalDong,r.adminCode,r.adminDong,r.status].join('\t'));
    const tsv=[header,...rows].join('\n');
    const blob=new Blob(['\uFEFF'+tsv],{type:'text/tab-separated-values;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url; a.download='도로위치표준화_결과.xls'; a.click();
    URL.revokeObjectURL(url);
  };

  const startOcrProcess=()=>{
    setStep(2);setOcrAgentIdx(0);setOcrDoneIdx([]);setOcrWords([]);setOcrAddrFound(false);
    let delay=0;
    OCR_AGENTS.forEach((ag,i)=>{
      delay+=ag.ms;
      setTimeout(()=>{
        setOcrAgentIdx(i+1<OCR_AGENTS.length?i+1:-1);
        setOcrDoneIdx(p=>[...p,i]);
        if(i===OCR_AGENTS.length-1) setTimeout(()=>setStep(3),600);
      },delay);
    });
  };

  const resetOcr=()=>{setOcrFile(null);setOcrAgentIdx(-1);setOcrDoneIdx([]);setOcrWords([]);setOcrAddrFound(false);setOcrSelectedRow(null);};

  const startMasterProcess=()=>{
    setStep(2);setMstAgentIdx(0);setMstDoneIdx([]);setMstRow(null);setMstApplied(false);setMstFilter('all');
    let delay=0;
    masterAgents.forEach((ag,i)=>{
      delay+=ag.ms;
      setTimeout(()=>{
        setMstAgentIdx(i+1<masterAgents.length?i+1:-1);
        setMstDoneIdx(p=>[...p,i]);
        if(i===masterAgents.length-1) setTimeout(()=>setStep(3),600);
      },delay);
    });
  };

  const resetMaster=()=>{setMstAgentIdx(-1);setMstDoneIdx([]);setMstRow(null);setMstApplied(false);setMstFilter('all');};

  const doReverseSearch=()=>{
    const clean=revCode.replace(/\s/g,'');
    const found=C.codeLookup[clean]||null;
    setRevResult(found);
    setRevSearched(true);
    setRevCopied(null);
  };

  const copyRevField=(key,val)=>{
    navigator.clipboard?.writeText(val);
    setRevCopied(key);
    setTimeout(()=>setRevCopied(null),2000);
  };

  const copyAllFields=()=>{
    const selBuilding=C.aptLookupResult.buildings[selectedDong];
    const selUnit=C.aptLookupResult.units[selectedHo];
    const text=[
      `[도로명주소] ${C.singleResult.road}`,
      `[지번주소]   ${C.singleResult.jibun}`,
      `[우편번호]   ${C.singleResult.zip}`,
      `[좌표]       위도 ${C.singleResult.lat}, 경도 ${C.singleResult.lng}`,
      `[법정동]     ${C.singleResult.legalDong} (${C.singleResult.legalCode})`,
      `[행정동]     ${C.singleResult.adminDong} (${C.singleResult.adminCode})`,
      `[구간명]     ${C.singleResult.complexName}`,
      `[구간코드]   ${C.singleResult.complexCode}`,
      `[지점코드]   ${selBuilding.dongName} ${selBuilding.dongCode}`,
      `[채널코드]   ${selUnit.hoName} ${selUnit.hoCode}`,
    ].join('\n');
    navigator.clipboard?.writeText(text);
    setCopiedAll(true);
    setTimeout(()=>setCopiedAll(false),2500);
  };

  const handleFileChange=(e)=>{
    const f=e.target.files?.[0];
    if(!f) return;
    setUploadedFile(f.name);
    const reader=new FileReader();
    reader.onload=(ev)=>setBatchText(ev.target.result||'');
    reader.readAsText(f,'utf-8');
  };

  const mstAllRows=MM?.rows||[];
  const mstCounts={all:mstAllRows.length,auto:0,review:0,none:0};
  mstAllRows.forEach(r=>{mstCounts[r.status]=(mstCounts[r.status]||0)+1;});
  const mstRows=mstAllRows.filter(r=>mstFilter==='all'||r.status===mstFilter);

  const batchCount=batchText.split('\n').filter(l=>l.trim()).length;
  const perfectMatch=C.batchResults.filter(r=>r.status==='완전매칭').length;
  const perfectMatchRate=Math.round((perfectMatch/C.batchResults.length)*100);

  const CopyBtn=({fieldKey,val})=>(
    <button onClick={()=>copyField(fieldKey,val)}
      className={cn(
        'text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors shrink-0',
        copiedField===fieldKey?'bg-emerald-100 text-emerald-600':'bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600'
      )}>
      <Copy className="w-3 h-3 inline mr-0.5"/>{copiedField===fieldKey?'복사됨':'복사'}
    </button>
  );

  /* ── step helpers ── */
  const startBatch=()=>setStep(3);
  const startReverse=()=>{doReverseSearch();setStep(3);};

  /* 팩이 masterMapping 없이 master 카드만 넣은 경우를 방어 */
  const MODE_TYPES=C.modeTypes.filter(t=>t.m!=='master'||MM);

  const COLOR={
    rose:   {sel:'border-rose-500 bg-rose-50 shadow-rose-100',   icon:'bg-rose-600',   btn:'bg-rose-600 hover:bg-rose-700 shadow-rose-100',   ring:'focus:border-rose-400 focus:ring-rose-100',   check:'text-rose-500'},
    orange: {sel:'border-orange-500 bg-orange-50 shadow-orange-100', icon:'bg-orange-500', btn:'bg-orange-500 hover:bg-orange-600 shadow-orange-100', ring:'focus:border-orange-400 focus:ring-orange-100', check:'text-orange-500'},
    teal:   {sel:'border-teal-500 bg-teal-50 shadow-teal-100',   icon:'bg-teal-600',   btn:'bg-teal-600 hover:bg-teal-700 shadow-teal-100',   ring:'focus:border-teal-400 focus:ring-teal-100',   check:'text-teal-500'},
    purple: {sel:'border-purple-500 bg-purple-50 shadow-purple-100', icon:'bg-purple-600', btn:'bg-purple-600 hover:bg-purple-700 shadow-purple-100', ring:'focus:border-purple-400 focus:ring-purple-100', check:'text-purple-500'},
    indigo: {sel:'border-indigo-500 bg-indigo-50 shadow-indigo-100', icon:'bg-indigo-600', btn:'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100', ring:'focus:border-indigo-400 focus:ring-indigo-100', check:'text-indigo-500'},
  };

  const resetAll=()=>{
    resetSim();setCopiedField(null);
    setRevCode('');setRevResult(null);setRevSearched(false);
    setRevCopied(null);setCopiedAll(false);resetOcr();resetMaster();setAptResult(null);
  };

  const cur=MODE_TYPES.find(t=>t.m===mode)||MODE_TYPES[0];
  const CLR=COLOR[cur.color];

  /* ───────────── STEP 1: 입력 ───────────── */
  if(step===1) return(
    <div className="flex-1 overflow-y-auto px-6 py-8 bg-white">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* 에이전트 타이틀 */}
        <div className="flex items-center gap-3">
          {onBack&&<button onClick={onBack} className="text-slate-400 hover:text-slate-600 text-[11px] font-bold flex items-center gap-1 shrink-0 py-2 pr-2 max-md:py-2.5"><ChevronRight className="w-3.5 h-3.5 rotate-180"/>뒤로</button>}
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shadow-md shrink-0',CLR.icon)}>
            <MapPin className="w-5 h-5 text-white"/>
          </div>
          <div>
            <div className="text-[15px] font-black text-slate-800">{H.title}</div>
            <div className="text-xs text-slate-400">{H.desc}</div>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-[10px] text-slate-400">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
            {C.headerStatus}
          </div>
        </div>

        {/* 1 · 처리 유형 선택 */}
        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">1 · 처리 유형 선택</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MODE_TYPES.map(t=>{
              const tc=COLOR[t.color];
              const isActive=mode===t.m;
              return(
                <button key={t.m} onClick={()=>setMode(t.m)}
                  className={cn(
                    'flex flex-col items-start gap-1.5 px-4 py-3.5 border-2 rounded-2xl text-left transition-all',
                    isActive?tc.sel+' shadow-md':'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  )}>
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-xl">{t.icon}</span>
                    <span className={cn('font-black text-[13px]',isActive?'text-slate-800':'text-slate-600')}>{t.label}</span>
                    {isActive&&<CheckCircle className={cn('w-4 h-4 ml-auto shrink-0',tc.check)}/>}
                  </div>
                  <span className="text-[11px] text-slate-400 ml-7 leading-snug">{t.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2 · 입력 (유형별) */}
        <div className="space-y-3">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">2 · 입력</label>

          {/* 단일 주소 — 탭 분기 */}
          {mode==='single'&&(
            <div className="space-y-3">
              {/* 입력 방식 탭 */}
              <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                <button onClick={()=>setInputTab('address')}
                  className={cn('flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-black transition-all',
                    inputTab==='address'?'bg-white text-rose-600 shadow-sm':'text-slate-500 hover:text-slate-700')}>
                  <MapPin className="w-3.5 h-3.5"/>일반 주소 변환
                </button>
                <button onClick={()=>setInputTab('apt')}
                  className={cn('flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-black transition-all',
                    inputTab==='apt'?'bg-white text-rose-600 shadow-sm':'text-slate-500 hover:text-slate-700')}>
                  <Building2 className="w-3.5 h-3.5"/>구간·VDS 지점 조회
                </button>
              </div>

              {/* 일반 주소 입력 */}
              {inputTab==='address'&&(
                <>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-rose-400"/>
                    <input value={address} onChange={e=>setAddress(e.target.value)}
                      placeholder={C.addressPlaceholder}
                      className={cn('w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-[14px] bg-white outline-none focus:ring-2',CLR.ring,'text-slate-700')}/>
                  </div>
                  {address&&(
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="font-bold">유형 추정:</span>
                      <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-full font-bold text-[10px]">
                        {address.includes('로')||address.includes('길')?'도로명주소':'지번주소'}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {C.quickExamples.map((q,i)=>(
                      <button key={i} onClick={()=>setAddress(q)}
                        className="text-[11px] px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-medium hover:bg-rose-100 transition-colors">
                        {q}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* 구간·VDS 지점 코드 조회 입력 */}
              {inputTab==='apt'&&(
                <>
                  <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-[11px] text-rose-700 flex items-start gap-2">
                    <Building2 className="w-4 h-4 shrink-0 mt-0.5 text-rose-500"/>
                    <span>노선·구간명을 입력하면 <span className="font-black">구간코드·VDS 지점코드·검지채널코드</span>를 조회합니다.</span>
                  </div>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3.5 w-4 h-4 text-rose-400"/>
                    <input value={aptQuery} onChange={e=>setAptQuery(e.target.value)}
                      placeholder={C.aptPlaceholder}
                      className={cn('w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-[14px] bg-white outline-none focus:ring-2',CLR.ring,'text-slate-700')}/>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {C.aptQuickExamples.map((q,i)=>(
                      <button key={i} onClick={()=>setAptQuery(q)}
                        className="text-[11px] px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-medium hover:bg-rose-100 transition-colors">
                        {q}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* 일괄 처리 */}
          {mode==='batch'&&(
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 truncate">
                  {batchCount}건 입력됨{uploadedFile&&` · ${uploadedFile}`}
                </span>
                <label className="flex items-center gap-1 text-[11px] text-slate-400 cursor-pointer hover:text-orange-600 transition-colors">
                  <Upload className="w-3.5 h-3.5"/><span>파일 업로드</span>
                  <input ref={fileRef} type="file" accept=".txt,.csv" className="hidden" onChange={handleFileChange}/>
                </label>
              </div>
              <textarea value={batchText} onChange={e=>setBatchText(e.target.value)} rows={7}
                placeholder="위치를 한 줄에 하나씩 입력하세요 (노선·이정 또는 주소)"
                className={cn('w-full border border-slate-200 rounded-xl px-4 py-3 text-[13px] bg-white outline-none focus:ring-2',CLR.ring,'text-slate-700 resize-none')}/>
            </div>
          )}

          {/* OCR 파일 */}
          {mode==='ocr'&&(
            <div
              onDragOver={e=>{e.preventDefault();setOcrFileDrag(true);}}
              onDragLeave={()=>setOcrFileDrag(false)}
              onDrop={e=>{e.preventDefault();setOcrFileDrag(false);const f=e.dataTransfer.files?.[0];if(f)setOcrFile(f.name);}}
              onClick={()=>ocrFileRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all py-12',
                ocrFileDrag?'border-teal-400 bg-teal-50':ocrFile?'border-teal-300 bg-teal-50':'border-slate-200 hover:border-teal-300 hover:bg-teal-50/40'
              )}>
              {ocrFile?(
                <>
                  <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-teal-600"/>
                  </div>
                  <div className="text-[14px] font-bold text-teal-700">{ocrFile}</div>
                  <div className="text-[11px] text-teal-500">파일 준비 완료 · 클릭하여 변경</div>
                </>
              ):(
                <>
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-slate-400"/>
                  </div>
                  <div className="text-[14px] font-bold text-slate-600">PDF · HWP · 이미지 업로드</div>
                  <div className="text-[12px] text-slate-400 text-center leading-relaxed">
                    파일을 드래그하거나 클릭해서 선택하세요<br/>
                    <span className="text-teal-500 font-bold">DRM 자동 복호화</span> 및 <span className="text-teal-500 font-bold">{C.ocrFeatureLabel}</span> 처리 지원
                  </div>
                </>
              )}
              <input ref={ocrFileRef} type="file" accept=".pdf,.hwp,.jpg,.png" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)setOcrFile(f.name);}}/>
            </div>
          )}

          {/* 기준정보 매핑 — 대상 소스 선택 + 현재 진단 스냅샷 */}
          {mode==='master'&&MM&&(
            <div className="space-y-3">
              {MM.summary?.length>0&&(
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {MM.summary.map((s,i)=>(
                    <div key={i} className={cn('border rounded-xl px-3 py-2.5',
                      s.tone==='bad'?'bg-rose-50 border-rose-200':s.tone==='warn'?'bg-amber-50 border-amber-200':'bg-slate-50 border-slate-200')}>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</div>
                      <div className={cn('text-[17px] font-bold mt-0.5',
                        s.tone==='bad'?'text-rose-700':s.tone==='warn'?'text-amber-700':'text-slate-800')}>{s.value}</div>
                      {s.sub&&<div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{s.sub}</div>}
                    </div>
                  ))}
                </div>
              )}
              {MM.scopes?.length>0&&(
                <>
                  <div className="text-[11px] text-slate-400">대상 소스 시스템 — 선택한 시스템의 항목만 매핑합니다</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {MM.scopes.map(s=>{
                      const on=mstScopes.includes(s.key);
                      return(
                        <button key={s.key} aria-pressed={on}
                          onClick={()=>setMstScopes(p=>on?p.filter(k=>k!==s.key):[...p,s.key])}
                          className={cn('text-left px-3.5 py-2.5 rounded-xl border-2 transition-all',
                            on?'border-indigo-500 bg-indigo-50':'border-slate-200 hover:border-slate-300 bg-white')}>
                          <div className="flex items-center gap-2">
                            <span className={cn('w-3.5 h-3.5 rounded-[5px] border-2 flex items-center justify-center shrink-0',
                              on?'border-indigo-500 bg-indigo-500':'border-slate-300')}>
                              {on&&<CheckCircle className="w-2.5 h-2.5 text-white"/>}
                            </span>
                            <span className={cn('text-[12px] font-bold',on?'text-indigo-700':'text-slate-600')}>{s.label}</span>
                            <span className="ml-auto text-[10px] font-mono text-slate-400">{s.count}</span>
                          </div>
                          {s.desc&&<div className="text-[10px] text-slate-400 mt-1 ml-[22px] leading-snug">{s.desc}</div>}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* 코드 역조회 */}
          {mode==='reverse'&&(
            <div className="space-y-3">
              <div className="relative">
                <Hash className="absolute left-3 top-3.5 w-4 h-4 text-purple-400"/>
                <input value={revCode} onChange={e=>{setRevCode(e.target.value);setRevSearched(false);}}
                  onKeyDown={e=>e.key==='Enter'&&startReverse()}
                  placeholder="법정동 또는 행정동 코드 10자리 (예: 1168010600)"
                  className={cn('w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-[14px] font-mono bg-white outline-none focus:ring-2',CLR.ring,'text-slate-700')}/>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {C.codeQuickExamples.map((ex,i)=>(
                  <button key={i} onClick={()=>{setRevCode(ex.code);setRevSearched(false);}}
                    className="text-[11px] px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 font-medium hover:bg-purple-100 transition-colors">
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 시작 버튼 */}
        <button onClick={mode==='single'?startProcess:mode==='batch'?startBatch:mode==='ocr'?startOcrProcess:mode==='master'?startMasterProcess:startReverse}
          className={cn('w-full py-3.5 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg text-[15px]',CLR.btn)}>
          <Play className="w-4 h-4 fill-white"/>
          {mode==='single'&&inputTab==='apt'?'구간·VDS 지점 조회':
           mode==='single'?'위치 표준화 시작':
           mode==='batch'?'일괄 처리 시작':
           mode==='ocr'?'OCR 위치 추출 시작':
           mode==='master'?`기준정보 매핑 시작${mstScopes.length?` (소스 ${mstScopes.length}종)`:''}`:'역조회 검색'}
        </button>
      </div>
    </div>
  );

  /* ───────────── STEP 2: 처리 중 (단일/OCR) ───────────── */
  if(step===2) return(
    <div className="flex-1 flex min-h-0 overflow-hidden">
      <div className="flex-1 min-w-0 flex flex-col items-center justify-center overflow-y-auto">
        <div className="w-full max-w-xl px-6">
          <div className="text-center mb-10">
            <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg',CLR.icon)}>
              {mode==='ocr'?<ScanLine className="w-7 h-7 text-white animate-pulse"/>
               :mode==='master'?<ArrowRightLeft className="w-7 h-7 text-white animate-pulse"/>
               :<Radio className="w-7 h-7 text-white animate-pulse"/>}
            </div>
            <div className="text-[18px] font-black text-slate-800">
              {mode==='ocr'?'OCR 파이프라인 처리 중':mode==='master'?'기준정보 매핑 파이프라인 처리 중':'에이전트 파이프라인 처리 중'}
            </div>
            <div className="text-sm text-slate-400 mt-1">
              {mode==='ocr'?'문서에서 위치를 인식하고 표준화합니다'
               :mode==='master'?(MM?.subtitle||'원본 항목을 표준 코드 체계로 매핑합니다')
               :'위치 표현을 파싱하고 노선·이정·VDS 지점에 매핑합니다'}
            </div>
          </div>
          <div className="space-y-3">
            {(mode==='ocr'?OCR_AGENTS:mode==='master'?masterAgents:AGENTS).map((ag,i)=>{
              const isDone=(mode==='ocr'?ocrDoneIdx:mode==='master'?mstDoneIdx:doneIdx).includes(i);
              const isActive=(mode==='ocr'?ocrAgentIdx:mode==='master'?mstAgentIdx:agentIdx)===i;
              const AgIcon=ag.icon;
              return(
                <div key={i}>
                  <div className={cn(
                    'rounded-2xl border-2 p-4 transition-all duration-500',
                    isDone?'border-emerald-200 bg-emerald-50/60':
                    isActive?'border-slate-300 bg-slate-50 shadow-md':
                    'border-slate-100 bg-white opacity-50'
                  )}>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all',
                        isDone?'bg-emerald-500':isActive?ag.color:'bg-slate-200'
                      )}>
                        {isDone?<CheckCircle className="w-5 h-5 text-white"/>
                          :<AgIcon className={cn('w-5 h-5',isActive?'text-white animate-pulse':'text-slate-400')}/>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={cn('font-black text-sm',isDone?'text-emerald-700':isActive?'text-slate-800':'text-slate-400')}>{ag.label}</div>
                        <div className={cn('text-xs mt-0.5',isDone?'text-emerald-500':isActive?'text-slate-500':'text-slate-300')}>
                          {isActive?'처리 중 — '+ag.sub:isDone?'완료 — '+ag.sub:ag.sub}
                        </div>
                        {isActive&&mode==='ocr'&&i===1&&ocrWords.length>0&&(
                          <div className="mt-2 text-[10px] font-mono text-teal-600 bg-teal-50 border border-teal-100 rounded-lg px-2 py-1.5 leading-relaxed max-h-16 overflow-hidden">
                            {ocrWords.join(' ')}
                            {ocrAddrFound&&<span className="ml-1 text-rose-500 font-black animate-pulse"> [위치 감지]</span>}
                          </div>
                        )}
                      </div>
                      {isActive&&<Loader2 className="w-4 h-4 text-slate-400 animate-spin shrink-0"/>}
                      {isDone&&<span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">완료</span>}
                    </div>
                    {isActive&&<div className="mt-3"><div className="h-1 bg-slate-100 rounded-full overflow-hidden"><div className={cn('h-1 rounded-full animate-pulse',CLR.icon.replace('bg-','bg-'))} style={{width:'70%'}}/></div></div>}
                  </div>
                  {i<(mode==='ocr'?OCR_AGENTS:mode==='master'?masterAgents:AGENTS).length-1&&<div className="flex justify-center my-1"><ChevronRight className="w-4 h-4 text-slate-300 rotate-90"/></div>}
                </div>
              );
            })}
          </div>
          <div className="mt-8 text-center text-xs text-slate-400">
            <Network className="w-3.5 h-3.5 inline mr-1"/>
            도로 위치 표준화 파이프라인 — 도로명주소 DB·EXTIS 기반 정규화
          </div>
        </div>
      </div>
      <div className="hidden lg:flex w-80 shrink-0 border-l border-slate-100 bg-gradient-to-b from-slate-50 to-white p-4 overflow-y-auto flex-col">
        <AgentWorkflowPanel agentId="agent-address" activeStep={mode==='ocr'?ocrAgentIdx:mode==='master'?mstAgentIdx:agentIdx} doneSteps={mode==='ocr'?ocrDoneIdx:mode==='master'?mstDoneIdx:doneIdx}/>
      </div>
    </div>
  );

  /* ───────────── STEP 3: 결과 ───────────── */
  return(
    <div className="flex-1 overflow-y-auto px-6 py-8 bg-white">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* 결과 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500"/>
            <span className="text-[15px] font-black text-slate-800">
              {mode==='single'&&inputTab==='apt'?`구간·VDS 지점 조회 완료`:
               mode==='single'?'위치 표준화 완료':
               mode==='batch'?`일괄 처리 완료 (${C.batchResults.length}건)`:
               mode==='ocr'?`OCR 위치 추출 완료 (${C.ocrAddrResults.length}건)`:
               mode==='master'?`기준정보 매핑 완료 (${MM?.rows?.length||0}건 검토 대상)`:'코드 역조회 완료'}
            </span>
          </div>
          <button onClick={resetAll}
            className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all">
            <RotateCcw className="w-3.5 h-3.5"/>처음으로
          </button>
        </div>

        {/* ── 구간·VDS 지점 코드 조회 결과 ── */}
        {mode==='single'&&inputTab==='apt'&&aptResult&&(
          <div className="space-y-4">
            {/* 구간 정보 카드 */}
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-5 h-5 text-rose-600"/>
                    <span className="text-[16px] font-black text-slate-800">{aptResult.complexName}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">{aptResult.address}</div>
                  <div className="text-[11px] text-slate-400">{aptResult.roadAddress}</div>
                </div>
                <div className="shrink-0 text-right bg-white border border-rose-200 rounded-xl px-3 py-2">
                  <div className="text-[10px] text-rose-500 font-bold uppercase mb-0.5">구간코드</div>
                  <div className="text-[15px] font-black text-slate-800 font-mono">{aptResult.complexCode}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-rose-200">
                <div className="text-center">
                  <div className="text-[18px] font-black text-rose-700">{aptResult.totalHouseholds.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500">총 검지채널</div>
                </div>
                <div className="text-center border-x border-rose-200">
                  <div className="text-[18px] font-black text-rose-700">{aptResult.totalBuildings}</div>
                  <div className="text-[10px] text-slate-500">VDS 지점 수</div>
                </div>
                <div className="text-center">
                  <div className="text-[14px] font-black text-rose-700">{aptResult.legalCode}</div>
                  <div className="text-[10px] text-slate-500">관할본부 ({aptResult.legalDong})</div>
                </div>
              </div>
            </div>

            {/* 동 선택 탭 */}
            <div className="space-y-2">
              <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-3.5 h-3.5"/>VDS 지점 선택 (이정)
              </div>
              <div className="flex flex-wrap gap-2">
                {aptResult.buildings.map((b,i)=>(
                  <button key={i} onClick={()=>setSelectedDong(i)}
                    className={cn(
                      'px-3.5 py-2 rounded-xl border-2 text-[12px] font-black transition-all',
                      selectedDong===i?'border-rose-500 bg-rose-50 text-rose-700 shadow-sm':'border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-600'
                    )}>
                    {b.dongName}
                  </button>
                ))}
              </div>
              {/* 선택된 동 코드 */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">VDS 지점코드</div>
                  <div className="text-[14px] font-black font-mono text-slate-700 mt-0.5">
                    {aptResult.buildings[selectedDong].dongCode}
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <div>본선 {aptResult.buildings[selectedDong].floors}차로</div>
                  <div>검지 {aptResult.buildings[selectedDong].households}채널</div>
                </div>
              </div>
            </div>

            {/* 호 목록 테이블 */}
            <div className="space-y-2">
              <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Home className="w-3.5 h-3.5"/>검지채널 목록 — {aptResult.buildings[selectedDong].dongName}
              </div>
              <div className="border-2 border-slate-100 rounded-2xl overflow-x-auto text-[12px]">
                <div className="min-w-[480px] grid grid-cols-[0.5fr_0.6fr_1.8fr_0.7fr_0.7fr] bg-slate-50 border-b">
                  {['채널','차로명','채널코드','검지율','구분'].map(h=>(
                    <div key={h} className="px-3 py-2.5 font-black text-[10px] text-slate-500 uppercase border-r last:border-r-0">{h}</div>
                  ))}
                </div>
                {aptResult.units.map((u,i)=>(
                  <div key={i} className="min-w-[480px] grid grid-cols-[0.5fr_0.6fr_1.8fr_0.7fr_0.7fr] border-b last:border-b-0 hover:bg-rose-50/40 transition-colors">
                    <div className="px-3 py-2.5 text-slate-500 font-bold border-r">{u.floor}번</div>
                    <div className="px-3 py-2.5 text-slate-700 font-bold border-r">{u.hoName}</div>
                    <div className="px-3 py-2.5 font-mono text-[11px] text-slate-600 border-r">{u.hoCode}</div>
                    <div className="px-3 py-2.5 text-slate-500 border-r">{u.area}%</div>
                    <div className="px-3 py-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-50 border border-rose-200 text-rose-600">
                        {u.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── 단일 주소 결과 (일반) ── */}
        {mode==='single'&&inputTab==='address'&&(
          <>
            <MatchStatusBadge status={C.singleResult.status}/>

            {/* 입력 → 결과 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-100 rounded-xl px-4 py-3">
                <div className="text-[9px] font-black text-slate-400 uppercase mb-1">입력 위치</div>
                <div className="text-[13px] text-slate-600 font-medium leading-snug">{address}</div>
              </div>
              <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                <div className="text-[9px] font-black text-rose-500 uppercase mb-1">도로명주소</div>
                <div className="text-[13px] text-rose-700 font-bold leading-snug">{C.singleResult.road}</div>
              </div>
            </div>

            {/* ① 주소 코드 */}
            <div className="bg-white border-2 border-slate-100 rounded-2xl overflow-hidden divide-y">
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">주소 코드</span>
              </div>
              {[
                {key:'road',  label:'도로명주소',  val:C.singleResult.road,  bold:true},
                {key:'jibun', label:'지번주소',    val:C.singleResult.jibun},
                {key:'zip',   label:'우편번호',    val:C.singleResult.zip},
                {key:'coord', label:'좌표 (WGS84)', val:'위도 '+C.singleResult.lat+', 경도 '+C.singleResult.lng},
                {key:'legal', label:'법정동',      val:C.singleResult.legalDong+' ('+C.singleResult.legalCode+')'},
                {key:'admin', label:'행정동',      val:C.singleResult.adminDong+' ('+C.singleResult.adminCode+')'},
              ].map(({key,label,val,bold})=>(
                <div key={key} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-24 shrink-0 text-[11px] font-black text-slate-400">{label}</div>
                  <div className={cn('flex-1 text-[13px] text-slate-700 leading-snug font-mono',bold&&'font-bold font-sans')}>{val}</div>
                  <CopyBtn fieldKey={key} val={val}/>
                </div>
              ))}
            </div>

            {/* ② 구간·VDS 지점 코드 */}
            {C.singleResult.buildType==='공동주택'&&(
              <div className="bg-white border-2 border-rose-100 rounded-2xl overflow-hidden divide-y divide-rose-50">
                {/* 헤더: 구간명 + 구간코드 */}
                <div className="px-4 py-3 bg-rose-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-rose-500 shrink-0"/>
                    <span className="text-[13px] font-black text-rose-700">{C.singleResult.complexName}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">구간·VDS 코드</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-black font-mono text-slate-700">{C.singleResult.complexCode}</span>
                    <CopyBtn fieldKey="complex" val={C.singleResult.complexCode}/>
                  </div>
                </div>

                {/* VDS 지점 선택 + 지점코드 */}
                <div className="px-4 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider w-24 shrink-0">지점 선택</span>
                    <div className="flex flex-wrap gap-1.5">
                      {C.aptLookupResult.buildings.map((b,i)=>(
                        <button key={i} onClick={()=>{setSelectedDong(i);setSelectedHo(0);}}
                          className={cn('px-3 py-1 rounded-lg border text-[11px] font-black transition-all',
                            selectedDong===i
                              ?'border-rose-500 bg-rose-500 text-white shadow-sm'
                              :'border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-600')}>
                          {b.dongName}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider w-24 shrink-0">지점코드</span>
                    <span className="text-[13px] font-mono text-slate-700 flex-1">{C.aptLookupResult.buildings[selectedDong].dongCode}</span>
                    <CopyBtn fieldKey="dong" val={C.aptLookupResult.buildings[selectedDong].dongCode}/>
                  </div>
                </div>

                {/* 검지채널 선택 + 채널코드 */}
                <div className="px-4 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider w-24 shrink-0">채널 선택</span>
                    <div className="flex flex-wrap gap-1.5">
                      {C.aptLookupResult.units.map((u,i)=>(
                        <button key={i} onClick={()=>setSelectedHo(i)}
                          className={cn('px-3 py-1 rounded-lg border text-[11px] font-black transition-all',
                            selectedHo===i
                              ?'border-rose-500 bg-rose-500 text-white shadow-sm'
                              :'border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-600')}>
                          {u.hoName}
                          <span className="text-[9px] opacity-70 ml-1">{u.type}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider w-24 shrink-0">채널코드</span>
                    <span className="text-[13px] font-mono text-slate-700 flex-1">{C.aptLookupResult.units[selectedHo].hoCode}</span>
                    <CopyBtn fieldKey="ho" val={C.aptLookupResult.units[selectedHo].hoCode}/>
                  </div>
                </div>

                {/* 선택 요약 */}
                <div className="px-4 py-2.5 bg-slate-50 flex items-center gap-2 flex-wrap">
                  {[
                    {label:'법정동', val:`${C.singleResult.legalDong} (${C.singleResult.legalCode})`},
                    {label:'구간코드', val:C.singleResult.complexCode},
                    {label:'지점코드', val:C.aptLookupResult.buildings[selectedDong].dongCode},
                    {label:'채널코드', val:C.aptLookupResult.units[selectedHo].hoCode},
                  ].map((item,i)=>(
                    <div key={i} className="flex items-center gap-1.5 text-[10px]">
                      {i>0&&<span className="text-slate-300">·</span>}
                      <span className="font-black text-slate-400">{item.label}</span>
                      <span className="font-mono text-slate-600">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={copyAllFields}
              className={cn('w-full py-3 text-[13px] font-black rounded-xl border transition-all flex items-center justify-center gap-2',
                copiedAll?'bg-emerald-50 border-emerald-300 text-emerald-700':'border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-600')}>
              {copiedAll?<><ClipboardCheck className="w-4 h-4"/>전체 복사됨!</>:<><Clipboard className="w-4 h-4"/>전체 복사 (법정동·구간·지점·채널코드 포함)</>}
            </button>
          </>
        )}

        {/* ── 일괄 처리 결과 ── */}
        {mode==='batch'&&(
          <>
            <div className="grid grid-cols-3 gap-3">
              {[
                {label:'처리 건수', val:C.batchResults.length+'건', color:'text-orange-700 bg-orange-50 border-orange-200'},
                {label:'완전매칭', val:perfectMatch+'건',           color:'text-emerald-700 bg-emerald-50 border-emerald-200'},
                {label:'완전매칭률', val:perfectMatchRate+'%',     color:'text-blue-700 bg-blue-50 border-blue-200'},
              ].map(s=>(
                <div key={s.label} className={cn('border rounded-xl px-4 py-3 text-center',s.color)}>
                  <div className="text-[9px] font-black uppercase opacity-60 mb-1">{s.label}</div>
                  <div className="text-[20px] font-black">{s.val}</div>
                </div>
              ))}
            </div>
            <div className="border-2 border-slate-100 rounded-2xl overflow-x-auto text-[12px]">
              <div className="min-w-[560px] grid grid-cols-[1.2fr_1.8fr_2fr_0.8fr_0.9fr] bg-slate-50 border-b">
                {['입력 위치','도로명주소','지번주소','우편번호','상태'].map(h=>(
                  <div key={h} className="px-3 py-2 font-black text-[10px] text-slate-500 uppercase border-r last:border-r-0">{h}</div>
                ))}
              </div>
              {C.batchResults.map((r,i)=>(
                <div key={i} className="min-w-[560px] grid grid-cols-[1.2fr_1.8fr_2fr_0.8fr_0.9fr] border-b last:border-b-0 hover:bg-slate-50">
                  <div className="px-3 py-2.5 text-slate-600 truncate border-r">{r.input}</div>
                  <div className="px-3 py-2.5 text-slate-700 font-medium truncate border-r">{r.road}</div>
                  <div className="px-3 py-2.5 text-slate-500 truncate border-r">{r.jibun}</div>
                  <div className="px-3 py-2.5 font-mono text-slate-600 border-r">{r.zip}</div>
                  <div className="px-3 py-2.5">
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-black',
                      r.status==='완전매칭'?'bg-emerald-100 text-emerald-700':'bg-amber-100 text-amber-700')}>{r.status}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={copyBatchCsv}
                className={cn('flex-1 py-3 font-black rounded-xl border text-[13px] flex items-center justify-center gap-2 transition-all',
                  batchCopied?'bg-emerald-50 border-emerald-300 text-emerald-700':'border-orange-200 text-orange-600 hover:bg-orange-50')}>
                {batchCopied?<><ClipboardCheck className="w-4 h-4"/>복사됨!</>:<><Copy className="w-4 h-4"/>CSV 복사</>}
              </button>
              <button onClick={downloadBatchExcel}
                className="flex-1 py-3 bg-orange-500 text-white font-black rounded-xl text-[13px] flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors shadow-md shadow-orange-100">
                <Download className="w-4 h-4"/>엑셀 다운로드
              </button>
            </div>
          </>
        )}

        {/* ── OCR 결과 ── */}
        {mode==='ocr'&&(
          <div className="space-y-3">
            {C.ocrAddrResults.map((r,i)=>(
              <div key={i}
                onClick={()=>setOcrSelectedRow(ocrSelectedRow===i?null:i)}
                className={cn('border-2 rounded-2xl p-4 cursor-pointer transition-all',
                  ocrSelectedRow===i?'border-teal-400 bg-teal-50':'border-slate-200 hover:border-teal-200 hover:bg-slate-50')}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-black text-teal-600 px-2 py-0.5 bg-teal-50 border border-teal-200 rounded-full">{r.ctx}</span>
                  <div className="flex items-center gap-2">
                    <span className={cn('text-[10px] font-black px-2 py-0.5 rounded-full',
                      r.status==='완전매칭'?'bg-emerald-100 text-emerald-700':'bg-amber-100 text-amber-700')}>{r.status}</span>
                  </div>
                </div>
                <div className="text-[14px] font-bold text-slate-800 mb-0.5">{r.road}</div>
                <div className="text-[11px] text-slate-400">원문: {r.raw}</div>
                {ocrSelectedRow===i&&(
                  <div className="mt-3 pt-3 border-t border-teal-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div><span className="text-slate-400 font-bold">지번: </span><span className="text-slate-600">{r.jibun}</span></div>
                    <div><span className="text-slate-400 font-bold">우편번호: </span><span className="font-mono text-slate-600">{r.zip}</span></div>
                    <div><span className="text-slate-400 font-bold">좌표: </span><span className="text-slate-600">{r.lat}, {r.lng}</span></div>
                    <div><span className="text-slate-400 font-bold">매칭상태: </span><span className={cn('font-bold',r.status==='완전매칭'?'text-emerald-600':'text-amber-600')}>{r.status}</span></div>
                    <div><span className="text-slate-400 font-bold">법정동코드: </span><span className="font-mono text-slate-600">{r.legalCode} ({r.legalDong})</span></div>
                    <div><span className="text-slate-400 font-bold">행정동코드: </span><span className="font-mono text-slate-600">{r.adminCode} ({r.adminDong})</span></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── 기준정보 매핑 워크벤치 ── */}
        {mode==='master'&&MM&&(
          <div className="space-y-5">

            {/* ① AI 준비도 + 진단 지표 */}
            {MM.readiness&&(
              <div className="border border-slate-200 rounded-2xl p-4 bg-white">
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-500"/>
                    <span className="text-[13px] font-bold text-slate-800">{MM.readiness.label}</span>
                  </div>
                  <span className="text-[12px] font-bold text-indigo-600">
                    레벨 {MM.readiness.level} <span className="text-slate-300 font-medium">/ {MM.readiness.max}</span>
                  </span>
                </div>
                <div className="flex gap-1">
                  {Array.from({length:MM.readiness.max}).map((_,i)=>(
                    <div key={i} className={cn('h-2 flex-1 rounded-full',i<MM.readiness.level?'bg-indigo-500':'bg-slate-100')}/>
                  ))}
                </div>
                {MM.readiness.levels?.length>0&&(
                  <div className="flex gap-1 mt-1.5">
                    {MM.readiness.levels.map((lv,i)=>(
                      <div key={i} className={cn('flex-1 text-[9px] text-center leading-tight',
                        i<MM.readiness.level?'text-indigo-600 font-bold':'text-slate-300')}>{lv}</div>
                    ))}
                  </div>
                )}
                {MM.readiness.note&&<div className="text-[11px] text-slate-500 mt-2.5 leading-relaxed">{MM.readiness.note}</div>}
              </div>
            )}

            {MM.summary?.length>0&&(
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MM.summary.map((s,i)=>(
                  <div key={i} className={cn('border rounded-xl px-3 py-2.5',
                    s.tone==='bad'?'bg-rose-50 border-rose-200':s.tone==='warn'?'bg-amber-50 border-amber-200':'bg-slate-50 border-slate-200')}>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</div>
                    <div className={cn('text-[17px] font-bold mt-0.5',
                      s.tone==='bad'?'text-rose-700':s.tone==='warn'?'text-amber-700':'text-slate-800')}>{s.value}</div>
                    {s.sub&&<div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{s.sub}</div>}
                  </div>
                ))}
              </div>
            )}

            {/* ② 표준 명명 규칙 */}
            {MM.naming&&(
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5 text-slate-400"/>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">표준 명명 규칙</span>
                  <span className="ml-auto text-[11px] font-mono text-slate-400">{MM.naming.pattern}</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {MM.naming.segments.map((sg,i)=>(
                      <React.Fragment key={i}>
                        {i>0&&<span className="text-slate-300 text-[13px]">·</span>}
                        <div className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100">
                          <div className="text-[12px] font-mono font-bold text-indigo-700">{sg.seg}</div>
                          <div className="text-[9px] text-indigo-400">{sg.label}</div>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                    {MM.naming.segments.map((sg,i)=>(
                      <div key={i} className="flex gap-2 text-[11px]">
                        <span className="font-mono text-slate-400 shrink-0">{sg.seg}</span>
                        <span className="text-slate-500 leading-snug">{sg.desc}</span>
                      </div>
                    ))}
                  </div>
                  {MM.naming.note&&(
                    <div className="text-[11px] text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 leading-relaxed">
                      {MM.naming.note}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ③ 매핑 워크벤치 */}
            {mstAllRows.length>0&&(
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">매핑 후보</span>
                  {[{k:'all',label:'전체'},{k:'auto',label:MASTER_STATUS.auto.label},{k:'review',label:MASTER_STATUS.review.label},{k:'none',label:MASTER_STATUS.none.label}].map(f=>(
                    <button key={f.k} onClick={()=>{setMstFilter(f.k);setMstRow(null);}}
                      className={cn('px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all',
                        mstFilter===f.k?'border-indigo-500 bg-indigo-50 text-indigo-700':'border-slate-200 text-slate-500 hover:border-slate-300')}>
                      {f.label} <span className="font-mono opacity-60">{mstCounts[f.k]||0}</span>
                    </button>
                  ))}
                </div>

                <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
                  {mstRows.map((r,i)=>{
                    const st=MASTER_STATUS[r.status]||MASTER_STATUS.review;
                    const open=mstRow===r.src;
                    const done=mstApplied&&r.status==='auto';
                    return(
                      <div key={i}>
                        <button onClick={()=>setMstRow(open?null:r.src)}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0',st.dot)}/>
                            <span className="text-[12px] font-mono text-slate-500 truncate">{r.src}</span>
                            {r.srcSystem&&<span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-bold shrink-0">{r.srcSystem}</span>}
                            <ArrowRightLeft className="w-3 h-3 text-slate-300 shrink-0"/>
                            <span className={cn('text-[12px] font-mono font-bold shrink-0',r.status==='none'?'text-slate-300':'text-slate-800')}>
                              {r.suggest||'— 후보 없음'}
                            </span>
                            <span className={cn('ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0',
                              done?'bg-emerald-600 border-emerald-600 text-white':st.chip)}>
                              {done?'반영됨':st.label}
                            </span>
                            {r.conf!=null&&<span className="text-[11px] font-mono text-slate-400 w-11 text-right shrink-0">{r.conf}%</span>}
                            <ChevronDown className={cn('w-3.5 h-3.5 text-slate-300 shrink-0 transition-transform',open&&'rotate-180')}/>
                          </div>
                          {r.name&&<div className="text-[11px] text-slate-400 mt-1 ml-3.5">{r.name}{r.unit?` · ${r.unit}`:''}</div>}
                        </button>

                        {open&&(
                          <div className="px-4 pb-4 pt-1 bg-slate-50/60 space-y-3">
                            {r.basis?.length>0&&(
                              <div className="space-y-1.5">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">판정 근거</div>
                                {r.basis.map((b,bi)=>(
                                  <div key={bi} className="flex gap-2 text-[11px]">
                                    <span className="font-bold text-slate-600 w-24 shrink-0">{b.label}</span>
                                    <span className="text-slate-500 leading-snug">{b.detail}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {r.convert&&(
                              <div className="text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2 leading-relaxed">
                                <span className="font-bold">변환 규칙 · </span>{r.convert}
                              </div>
                            )}
                            {r.alts?.length>0&&(
                              <div className="space-y-1.5">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">대안 후보</div>
                                {r.alts.map((a,ai)=>(
                                  <div key={ai} className="flex items-start gap-2 text-[11px] bg-white border border-slate-200 rounded-lg px-2.5 py-1.5">
                                    <span className="font-mono font-bold text-slate-600 shrink-0">{a.code}</span>
                                    <span className="text-slate-400 shrink-0">{a.name}</span>
                                    <span className="text-slate-500 leading-snug flex-1">{a.reason}</span>
                                    <span className="font-mono text-slate-400 shrink-0">{a.conf}%</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {mstRows.length===0&&(
                    <div className="px-4 py-8 text-center text-[12px] text-slate-400">해당 상태의 항목이 없습니다</div>
                  )}
                </div>
              </div>
            )}

            {/* ④ 미매칭 사유 분포 */}
            {MM.reasons?.length>0&&(
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500"/>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">미매칭 사유와 조치</span>
                </div>
                <div className="p-4 space-y-2.5">
                  {MM.reasons.map((rs,i)=>{
                    const max=Math.max(...MM.reasons.map(x=>x.count));
                    return(
                      <div key={i}>
                        <div className="flex items-center gap-2 text-[11px] mb-1">
                          <span className="font-bold text-slate-600">{rs.label}</span>
                          <span className="ml-auto font-mono text-slate-400">{rs.count.toLocaleString()}건</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-1.5 rounded-full bg-amber-400" style={{width:`${Math.round((rs.count/max)*100)}%`}}/>
                        </div>
                        {rs.action&&<div className="text-[10px] text-slate-400 mt-1 leading-snug">→ {rs.action}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ⑤ 시스템 간 정합성 */}
            {MM.crossMatch&&(
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                  <Network className="w-3.5 h-3.5 text-slate-400"/>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">시스템 간 키 매칭률</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <table className="w-full min-w-[380px] text-[11px]">
                    <thead>
                      <tr>
                        <th className="text-left font-bold text-slate-400 pb-2 pr-2"/>
                        {MM.crossMatch.systems.map((s,i)=>(
                          <th key={i} className="font-bold text-slate-500 pb-2 px-2 text-center">{s}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MM.crossMatch.systems.map((s,ri)=>(
                        <tr key={ri}>
                          <td className="font-bold text-slate-500 py-1 pr-2 whitespace-nowrap">{s}</td>
                          {MM.crossMatch.cells[ri].map((v,ci)=>(
                            <td key={ci} className="px-1 py-1">
                              {v==null
                                ?<div className="h-7 rounded-lg bg-slate-50"/>
                                :<div className={cn('h-7 rounded-lg flex items-center justify-center font-mono font-bold',
                                    v>=90?'bg-emerald-50 text-emerald-700':v>=75?'bg-amber-50 text-amber-700':'bg-rose-50 text-rose-700')}>
                                    {v}%
                                  </div>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ⑥ 자동 확정 반영 */}
            {MM.apply&&(
              <div className={cn('rounded-2xl p-4 border transition-colors',
                mstApplied?'bg-emerald-50 border-emerald-200':'bg-slate-900 border-slate-900')}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className={cn('text-[12px] font-bold',mstApplied?'text-emerald-800':'text-white')}>{MM.apply.label}</div>
                    <div className={cn('text-[11px] mt-0.5',mstApplied?'text-emerald-600':'text-slate-400')}>
                      자동 확정 {MM.apply.autoCount}건 · 사람 검토 {MM.apply.reviewCount}건
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn('text-[15px] font-mono font-bold',mstApplied?'text-emerald-400/60 line-through':'text-slate-400')}>{MM.apply.before}</span>
                    <ChevronRight className={cn('w-4 h-4',mstApplied?'text-emerald-500':'text-slate-500')}/>
                    <span className={cn('text-[19px] font-mono font-bold',mstApplied?'text-emerald-700':'text-white')}>{MM.apply.after}</span>
                  </div>
                </div>
                <button onClick={()=>setMstApplied(true)} disabled={mstApplied}
                  className={cn('w-full mt-3 py-2.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 transition-colors',
                    mstApplied?'bg-emerald-100 text-emerald-700 cursor-default':'bg-indigo-600 text-white hover:bg-indigo-500')}>
                  {mstApplied
                    ?<><CheckCircle2 className="w-4 h-4"/>표준 마스터에 반영됨 (검토 {MM.apply.reviewCount}건 대기)</>
                    :<><RefreshCw className="w-4 h-4"/>자동 확정 {MM.apply.autoCount}건 표준 마스터에 반영</>}
                </button>
                {MM.apply.note&&(
                  <div className={cn('text-[10px] mt-2 leading-relaxed',mstApplied?'text-emerald-600':'text-slate-400')}>{MM.apply.note}</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── 코드 역조회 결과 ── */}
        {mode==='reverse'&&revResult&&(
          <>
            <div className="flex items-center gap-3">
              <div className={cn('px-3 py-1 rounded-full text-[11px] font-black border',
                revResult.type==='법정동'?'bg-purple-50 border-purple-200 text-purple-700':'bg-indigo-50 border-indigo-200 text-indigo-700')}>
                {revResult.type}
              </div>
              <div className="text-[18px] font-black text-slate-800">{revResult.dong}</div>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
              <ChevronRight className="w-3 h-3 shrink-0"/>{revResult.region}
            </div>
            <div className="bg-white border-2 border-purple-100 rounded-2xl overflow-hidden divide-y">
              {[
                {key:'road',  label:'도로명주소', val:revResult.road},
                {key:'jibun', label:'지번주소',   val:revResult.jibun},
                {key:'zip',   label:'우편번호',   val:revResult.zip},
                {key:'legal', label:'법정동코드', val:revResult.legalCode+(revResult.legalDong?' ('+revResult.legalDong+')':'')},
                {key:'admin', label:'행정동코드', val:revResult.adminCode+(revResult.adminDong?' ('+revResult.adminDong+')':'')},
              ].map(({key,label,val})=>(
                <div key={key} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-24 shrink-0 text-[11px] font-black text-slate-400">{label}</div>
                  <div className="flex-1 text-[13px] text-slate-700">{val}</div>
                  <button onClick={()=>copyRevField(key,val)}
                    className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors shrink-0',
                      revCopied===key?'bg-emerald-100 text-emerald-600':'bg-slate-100 text-slate-500 hover:bg-purple-50 hover:text-purple-600')}>
                    {revCopied===key?'복사됨':'복사'}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
        {mode==='reverse'&&!revResult&&revSearched&&(
          <div className="flex flex-col items-center gap-3 py-12">
            <XCircle className="w-12 h-12 text-red-300"/>
            <div className="text-[15px] font-bold text-slate-500">코드를 찾을 수 없습니다</div>
            <div className="text-[12px] text-slate-400">입력한 코드: <span className="font-mono text-slate-600">{revCode}</span></div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AddressAgent;
