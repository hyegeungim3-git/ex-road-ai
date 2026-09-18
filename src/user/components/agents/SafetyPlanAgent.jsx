import React, { useState, useRef } from "react";
import {
  FileText, Database, CheckSquare, ClipboardList, Radio, Loader2, CheckCircle,
  ChevronRight, Network, UploadCloud, X, Play, RotateCcw, Download, FileCheck,
  ExternalLink, Clock, ChevronLeft, LayoutGrid, AlertTriangle
} from "lucide-react";
import ApprovalModal from "../ApprovalModal.jsx";
import SelfCheckModal from "../SelfCheckModal.jsx";
import { SAFE_AGENTS, SAFE_RISK_OPTIONS, SAFE_RESULT, APV_LINE_SAFE } from "../../data/responses.js";
import AgentWorkflowPanel from "./AgentWorkflowPanel.jsx";
import { AGENT_TEAMS } from "../../data/constants.js";
import { useAgentSimulation } from "../../hooks/useAgentSimulation.js";
import { agentHeader, orgLogoDataUri } from "../../utils.jsx";

const RISK_DATA={
  '주행 차량 충돌':{level:'높음',freq:'높음',sev:5,lkl:4,lvlColor:'bg-orange-100 text-orange-700 border-orange-200',measure:'전방 800m 안전표지·라바콘 설치, 갓길 차단 확인 후 진입, 본선을 등지고 작업 금지'},
  '추락·낙상':{level:'높음',freq:'보통',sev:4,lkl:3,lvlColor:'bg-orange-100 text-orange-700 border-orange-200',measure:'안전대·안전모 착용, 비탈면 작업 2인 1조, 사다리 고정 상태 확인'},
  '중장비 협착':{level:'높음',freq:'낮음',sev:5,lkl:2,lvlColor:'bg-orange-100 text-orange-700 border-orange-200',measure:'중장비 작업 반경 내 출입 통제, 유도원 배치, 후방 경보장치 작동 확인'},
  '폭염·한파 노출':{level:'보통',freq:'보통',sev:3,lkl:3,lvlColor:'bg-yellow-100 text-yellow-700 border-yellow-200',measure:'수분 보충·그늘 휴식 의무화, 폭염특보 시 14~17시 작업 중단'},
  '낙석·비탈면 붕괴':{level:'높음',freq:'낮음',sev:4,lkl:2,lvlColor:'bg-orange-100 text-orange-700 border-orange-200',measure:'비탈면 상부 접근 금지, 강우 후 지반 상태 사전 확인, 낙석방지망 점검'},
  '우천 노면 미끄럼':{level:'높음',freq:'보통',sev:4,lkl:3,lvlColor:'bg-orange-100 text-orange-700 border-orange-200',measure:'강우 시 작업 일정 재조정, 미끄럼 방지 안전화 착용, 감속 유도 표지 추가 설치'},
  '터널 내 매연·시야 불량':{level:'높음',freq:'낮음',sev:4,lkl:2,lvlColor:'bg-orange-100 text-orange-700 border-orange-200',measure:'제트팬 가동 확인, 방진마스크 착용, 반사 조끼·이동식 조명 배치'},
  '전기설비 감전':{level:'보통',freq:'낮음',sev:5,lkl:2,lvlColor:'bg-yellow-100 text-yellow-700 border-yellow-200',measure:'전원 차단 확인 후 함체 개방, 절연 장갑 착용, 우천 시 함체 작업 금지'},
  '교량 하부 고소작업':{level:'매우 높음',freq:'낮음',sev:5,lkl:2,lvlColor:'bg-red-100 text-red-700 border-red-200',measure:'안전대 2줄 걸이, 작업발판·안전난간 설치, 하부 통행 차단'},
  '야간 작업':{level:'높음',freq:'보통',sev:4,lkl:3,lvlColor:'bg-orange-100 text-orange-700 border-orange-200',measure:'야간 본선 작업 금지 원칙, 불가피 시 조도 확보·신호수 2인 배치 및 관리자 보고'},
};
const SAFE_CHECKLIST=['작업 전일 기상·노면 상태 확인 (RWIS 노면온도 조회)','교통센터 상황관리부 작업 통보 및 VMS 예고 송출 요청','갓길 차단 지역본부장 승인 및 24시간 전 통보 여부','개인보호장비(안전모·안전화·야광 조끼) 지급 확인','차단 구간 전방 800m 안전표지·라바콘 설치 완료 후 진입','2인 1조 구성 및 30분 간격 작업 책임자 연락 확인','비상 연락처(119, 교통센터, 관리자) 현장 등록 확인'];
const SAFE_LAWS=['산업안전보건법 제36조 (위험성평가 의무)','산업안전보건법 제38조 (안전조치)','도로법 제31조 (도로공사와 도로의 유지·관리 등)','도로교통법 제68조 (도로에서의 금지행위 등)','한국도로공사 도로 공사구간 안전관리 지침 제7조 (이동차선규제)'];
const RAG_DOC_HITS=[
  {name:'도로 공사구간 안전관리 지침.pdf', hits:8},
  {name:'교통정보 수집장비 유지관리 매뉴얼.pdf', hits:5},
  {name:'산업안전보건법 제36조.pdf', hits:4},
  {name:'도로법 제31조 (도로의 유지·관리).pdf', hits:3},
  {name:'차로 차단 작업 위험성평가 사례집.pdf', hits:2},
];
const RAG_TAGS=['산업안전보건법','도로법','도로교통법','도로 공사구간 안전관리 지침','수집장비 유지관리 매뉴얼','이동차선규제'];
const ORG_MEMBERS=['[현장 작업 A조] 김태우 대리','[현장 작업 B조] 정민석 차장'];
const EMERGENCY_STEPS=[
  {label:'사고 발생',sub:'즉시 갓길 대피',color:'bg-red-600'},
  {label:'119 신고',sub:'부상자 발생 시 즉시 신고',color:'bg-orange-500'},
  {label:'교통센터 연락',sub:'상황관리부 박선영 010-XXXX-XXXX',color:'bg-orange-500'},
  {label:'안전관리책임자 보고',sub:'원인 조사 및 재발 방지',color:'bg-slate-700'},
];
const PLAN_SECTIONS=[
  {sub:'3.1  작업 착수 전 안전 관리',items:['작업 전일 기상·노면 상태 확인 (RWIS 노면온도 조회)','교통센터 상황관리부 작업 통보 및 VMS 예고 송출 요청','개인보호장비(안전모·안전화·야광 조끼) 지급 확인']},
  {sub:'3.2  차로 차단·현장 작업 안전',items:['차단 구간 전방 800m 안전표지·라바콘 설치 완료 후 진입','2인 1조 원칙 — 본선 방향을 등지고 작업 금지','30분 간격 작업 책임자 연락 확인 (미응답 시 즉시 확인 출동)']},
  {sub:'3.3  기상·야간 작업 안전',items:['강우·강설 예보 시 작업 일정 재조정 및 노면 상태 재확인','폭염특보 발령 시 14~17시 작업 중단, 그늘 휴식 의무화','야간 본선 작업 금지 원칙, 불가피 시 조도 확보·신호수 배치']},
];

/* 도메인 이관: 기본 콘텐츠 — 도메인 팩 agentContent["agent-safety"]로 키 단위 오버라이드 */
export const CONTENT_DEFAULTS={
  headerTitle:'안전관리계획 수립 에이전트',                                    // string — 미제공 시 허브 카탈로그 이름 승계
  headerDesc:'작업 구간 정보 입력 → RAG 법령 검색 → 도로 공사구간 안전관리계획서 자동 생성', // string — 헤더 설명(작업 흐름)
  agents: SAFE_AGENTS,             // {icon:LucideIcon,label,sub,color,ms}[4] — 시뮬레이션 단계 카드. 배열 통째 교체(아이콘·타이밍 포함)
  riskOptions: SAFE_RISK_OPTIONS,  // string[10] — 위험 요인 선택지. riskData의 키와 반드시 일치. 배열 통째 교체
  riskData: RISK_DATA,             // {[riskOption]:{level,freq,sev:1~5,lkl:1~5,lvlColor,measure}} — 위험요인별 평가(매트릭스·표에 사용). 객체 통째 교체
  resultText: SAFE_RESULT,         // string — 계획서 전문 텍스트(원본 편집·PDF 출력 본문)
  apvLine: APV_LINE_SAFE,          // {name,dept,title,role}[3] — 결재선. 배열 통째 교체
  defaultProjName:'교통정보 수집장비(VDS) 정기점검 및 통신 회선 정비', // string — 작업명 초기값
  defaultProjType:'갓길 차단 작업',  // string — 작업 유형 초기값
  defaultProjLoc:'경부선 하행 기흥IC~수원신갈IC (384.2k~389.6k)', // string — 작업 구간 초기값
  defaultDuration:'5일',            // string — 작업 기간 초기값
  defaultRisks:['주행 차량 충돌','추락·낙상','야간 작업'], // string[3] — 초기 선택 위험 요인(riskOptions의 부분집합)
  projTypePlaceholder:'작업 유형 (갓길 차단 작업, 이동차선규제 등)', // string — 작업 유형 입력 placeholder
  uploadHint:'작업 구간 도면, 차로 차단 계획, 이전 작업 사례, 현장 사진 등을 업로드하세요 (선택)', // string — 업로드 안내 문구
  ragDocs: RAG_DOC_HITS,           // {name,hits:number}[5] — RAG 검색 티커 문서 목록. 배열 통째 교체
  ragTags: RAG_TAGS,               // string[6] — 자동 참조 법령·규정 태그. 배열 통째 교체
  checklist: SAFE_CHECKLIST,       // string[7] — 안전 체크리스트 항목. 배열 통째 교체
  laws: SAFE_LAWS,                 // string[5] — 관련 법령 및 규정. 배열 통째 교체
  orgLeader:'[안전관리책임자] 윤상헌 처장',   // string — 조직도 최상위 1줄
  orgManager:'[안전담당자] 한지훈 팀장',      // string — 조직도 중간 관리자 1줄
  orgMembers: ORG_MEMBERS,         // string[2] — 조직도 하위 2줄(├─, └─ 순서). 배열 통째 교체
  emergencySteps: EMERGENCY_STEPS, // {label,sub,color:tailwind bg 클래스}[4] — 비상 연락 체계 4단계. 배열 통째 교체
  planSections: PLAN_SECTIONS,     // {sub,items:string[3]}[3] — 안전관리 계획 3개 소절. 배열 통째 교체
  dept:'디지털계획처 데이터플랫폼부',           // string — 담당부서(문서 헤더·PDF)
  docNum:'EX-데이터플랫폼부-2026-0153',       // string — 문서번호(문서 헤더·PDF·결재 모달)
  brandLine: null,                          // 미제공 시 '<약칭> · <조직명>'으로 자동 생성
  logoSrc: null,                          // 미제공 시 도메인 정보로 레터헤드 자동 생성
  logoAlt: null,                            // 미제공 시 '<약칭> <조직명>'
  apvRef:'APV-2026-0918-0153',     // string — 결재 진행 참조번호
  periodRange:'2026. 09. 21. ~ 2026. 09. 25.', // string — 문서 보기 작업 기간(뒤에 (duration) 병기)
};

const SafetyPlanAgent = ({ onBack, domain }) => {
  const C={...CONTENT_DEFAULTS,...(domain?.agentContent?.["agent-safety"]||{})};

  /* 문서 레터헤드 — 팩이 자체 로고를 주면 그것을, 아니면 도메인 정보로 생성.
     (기본 래스터 로고를 쓰면 타 분야 문서에 엉뚱한 발주처 로고가 찍히므로 도메인 기반 생성이 기본) */
  const orgMeta = { name: domain?.orgName || '조직명', short: domain?.orgShort || 'ORG', color: domain?.brandColor || '#334155' };
  const docLogo = C.logoSrc || orgLogoDataUri(orgMeta);
  const docLogoAlt = C.logoAlt || `${orgMeta.short} ${orgMeta.name}`;
  const H=agentHeader(domain,'agent-safety',C,AGENT_TEAMS);
  const {step,agentIdx,doneIdx,start:startSim,resetSim}=useAgentSimulation(C.agents);
  const [projName,setProjName]=useState(C.defaultProjName);
  const [projType,setProjType]=useState(C.defaultProjType);
  const [projLoc,setProjLoc]=useState(C.defaultProjLoc);
  const [duration,setDuration]=useState(C.defaultDuration);
  const [selectedRisks,setSelectedRisks]=useState(C.defaultRisks);
  const [result,setResult]=useState(C.resultText);
  const [safeViewMode,setSafeViewMode]=useState('doc');
  const [checkState,setCheckState]=useState({});
  const [apvState,setApvState]=useState(null);
  const [apvMsg,setApvMsg]=useState('검토 요청드립니다.');
  const [uploadedFiles,setUploadedFiles]=useState([]);
  const [fileDrag,setFileDrag]=useState(false);
  const safeFileRef=useRef(null);
  const [ragDocs]=useState(C.ragDocs);

  const toggleRisk=(r)=>setSelectedRisks(p=>p.includes(r)?p.filter(x=>x!==r):[...p,r]);

  const startProcess=()=>startSim();

  const reset=()=>{resetSim();setUploadedFiles([]);setApvState(null);setApvMsg('검토 요청드립니다.');};
  const submitApv=()=>{setApvState('submitting');setTimeout(()=>{setApvState('done');},1600);};

  if(step===1) return(
    <div className="flex-1 overflow-y-auto px-6 py-8 bg-white">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-2">
          {onBack && <button onClick={onBack} aria-label="뒤로 가기" className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"><ChevronLeft className="w-5 h-5"/></button>}
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-md">
            <ClipboardList className="w-5 h-5 text-white"/>
          </div>
          <div>
            <div className="text-[15px] font-black text-slate-800">{H.title}</div>
            <div className="text-xs text-slate-400">{H.desc}</div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[15px] font-black text-slate-600 uppercase tracking-wider">1 · 관련 자료 업로드</label>
          <div
            onDragOver={e=>{e.preventDefault();setFileDrag(true);}}
            onDragLeave={()=>setFileDrag(false)}
            onDrop={e=>{e.preventDefault();setFileDrag(false);const files=Array.from(e.dataTransfer.files);setUploadedFiles(p=>[...p,...files]);}}
            onClick={()=>safeFileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center py-8 cursor-pointer transition-all ${fileDrag?'border-orange-400 bg-orange-50':'border-slate-200 hover:border-orange-300 hover:bg-slate-50'}`}>
            <input ref={safeFileRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.hwp,.hwpx,.ppt,.pptx" multiple className="hidden"
              onChange={e=>{if(e.target.files)setUploadedFiles(p=>[...p,...Array.from(e.target.files)]);e.target.value='';}}/>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${fileDrag?'bg-orange-100':'bg-slate-100'}`}>
              <UploadCloud className={`w-6 h-6 ${fileDrag?'text-orange-500':'text-slate-400'}`}/>
            </div>
            <div className="font-bold text-slate-500 text-sm">관련 자료를 드래그하거나 클릭하여 업로드</div>
            <div className="text-xs text-slate-400 mt-1">PDF · DOCX · XLSX · HWP · PPT 지원 · 복수 파일 가능</div>
          </div>
          {uploadedFiles.length>0&&(
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y">
              {uploadedFiles.map((f,i)=>{
                const ext=f.name.split('.').pop().toLowerCase();
                const ic=ext==='pdf'?'text-red-500 bg-red-50':ext==='hwp'||ext==='hwpx'?'text-blue-500 bg-blue-50':ext==='xlsx'||ext==='xls'?'text-green-500 bg-green-50':ext==='ppt'||ext==='pptx'?'text-orange-500 bg-orange-50':'text-slate-500 bg-slate-50';
                const [tc,bc]=ic.split(' ');
                return(
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-white hover:bg-slate-50/60 transition-colors">
                    <div className={`w-7 h-7 rounded-lg ${bc} flex items-center justify-center shrink-0`}>
                      <FileText className={`w-3.5 h-3.5 ${tc}`}/>
                    </div>
                    <span className="flex-1 truncate text-sm text-slate-700 font-medium">{f.name}</span>
                    <span className="text-[11px] text-slate-400 shrink-0 font-mono">{f.size>1024*1024?(f.size/1024/1024).toFixed(1)+' MB':(f.size/1024).toFixed(0)+' KB'}</span>
                    <button onClick={e=>{e.stopPropagation();setUploadedFiles(p=>p.filter((_,j)=>j!==i));}}
                      aria-label="업로드 파일 삭제"
                      className="text-slate-300 hover:text-red-400 transition-colors shrink-0 ml-1"><X className="w-3.5 h-3.5"/></button>
                  </div>
                );
              })}
            </div>
          )}
          <div className="text-[11px] text-slate-400">
            {uploadedFiles.length>0
              ?<><span className="text-orange-600 font-bold">{uploadedFiles.length}개 파일 업로드됨</span> — 업로드된 자료가 RAG 분석에 우선 참조됩니다</>
              :C.uploadHint}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[15px] font-black text-slate-600 uppercase tracking-wider">2 · 작업 기본 정보</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2"><input value={projName} onChange={e=>setProjName(e.target.value)} placeholder="작업명" className="w-full border rounded-xl px-4 py-2.5 text-sm bg-white outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100"/></div>
            <input value={projType} onChange={e=>setProjType(e.target.value)} placeholder={C.projTypePlaceholder} className="border rounded-xl px-4 py-2.5 text-sm bg-white outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100"/>
            <input value={projLoc} onChange={e=>setProjLoc(e.target.value)} placeholder="작업 구간 (노선·이정)" className="border rounded-xl px-4 py-2.5 text-sm bg-white outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100"/>
            <input value={duration} onChange={e=>setDuration(e.target.value)} placeholder="작업 기간 (예: 5일)" className="border rounded-xl px-4 py-2.5 text-sm bg-white outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100"/>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[15px] font-black text-slate-600 uppercase tracking-wider">3 · 예상 위험 요인 선택</label>
          <div className="flex flex-wrap gap-2">
            {C.riskOptions.map(r=>(
              <button key={r} onClick={()=>toggleRisk(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${selectedRisks.includes(r)?'bg-orange-50 border-orange-400 text-orange-700 shadow-sm':'border-slate-200 text-slate-400 hover:border-slate-300'}`}>
                {r}
              </button>
            ))}
          </div>
          <div className="text-[11px] text-slate-400">{selectedRisks.length}개 선택됨 — 선택한 위험 요인에 맞춰 RAG 검색 및 계획서가 생성됩니다</div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black text-blue-700"><Database className="w-3.5 h-3.5"/>자동 참조 법령·규정 (RAG 지식 DB)</div>
          <div className="flex flex-wrap gap-1.5">
            {C.ragTags.map(l=>(
              <span key={l} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold">{l}</span>
            ))}
          </div>
        </div>

        <button onClick={startProcess} disabled={!projName||selectedRisks.length===0} className="w-full py-3.5 bg-orange-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-100 text-[15px] disabled:opacity-40">
          <Play className="w-4 h-4 fill-white"/> 안전관리계획 수립 시작
        </button>
      </div>
    </div>
  );

  if(step===2) return(
    <div className="flex-1 flex min-h-0 overflow-hidden">
      <div className="flex-1 min-w-0 flex flex-col items-center justify-center overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-xl px-6">
          <div className="text-center mb-10">
            <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200">
              <Radio className="w-7 h-7 text-white animate-pulse"/>
            </div>
            <div className="text-[18px] font-black text-slate-800">멀티 에이전트 처리 중</div>
            <div className="text-sm text-slate-400 mt-1">4개 전문 에이전트가 병렬·순차 협력하여 계획서를 작성합니다</div>
          </div>
          <div className="space-y-3">
            {C.agents.map((ag,i)=>{
              const isDone=doneIdx.includes(i);
              const isActive=agentIdx===i;
              const AgIcon=ag.icon;
              return(
                <div key={i}>
                  <div className={`rounded-2xl border-2 p-4 transition-all duration-500 ${isDone?'border-emerald-200 bg-emerald-50/60':isActive?'border-orange-300 bg-orange-50 shadow-md shadow-orange-100':'border-slate-100 bg-white opacity-50'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${isDone?'bg-emerald-500':isActive?ag.color:'bg-slate-200'}`}>
                        {isDone?<CheckCircle className="w-5 h-5 text-white"/>:<AgIcon className={`w-5 h-5 ${isActive?'text-white animate-pulse':'text-slate-400'}`}/>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-black text-sm ${isDone?'text-emerald-700':isActive?'text-orange-700':'text-slate-400'}`}>{ag.label}</div>
                        <div className={`text-xs mt-0.5 ${isDone?'text-emerald-500':isActive?'text-orange-500':'text-slate-300'}`}>{isActive?`처리 중 — ${ag.sub}`:isDone?`완료 — ${ag.sub}`:ag.sub}</div>
                      </div>
                      {isActive&&<Loader2 className="w-4 h-4 text-orange-500 animate-spin shrink-0"/>}
                      {isDone&&<span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">완료</span>}
                    </div>
                    {isActive&&i===1&&(
                      <div className="mt-3 space-y-1">
                        {uploadedFiles.length>0&&(
                          <>
                            <div className="text-[9px] font-black text-orange-500 uppercase tracking-wider mb-1">업로드 자료 분석 중</div>
                            {uploadedFiles.map((f,fi)=>(
                              <div key={`u-${fi}`} className={`flex items-center gap-2 text-[10px] transition-all ${fi<3?'opacity-100':'opacity-40'}`}>
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0"/>
                                <span className="text-slate-600 truncate font-medium">{f.name}</span>
                                <span className="ml-auto text-orange-500 font-bold shrink-0">분석 중</span>
                              </div>
                            ))}
                            <div className="border-t border-slate-100 my-1.5"/>
                            <div className="text-[9px] font-black text-blue-500 uppercase tracking-wider mb-1">RAG 지식 DB 검색 중</div>
                          </>
                        )}
                        {ragDocs.map((d,di)=>(
                          <div key={di} className={`flex items-center gap-2 text-[10px] transition-all ${di<2?'opacity-100':'opacity-30'}`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"/>
                            <span className="text-slate-500 truncate">{d.name}</span>
                            <span className="ml-auto text-blue-500 font-bold shrink-0">관련 {d.hits}건</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {isActive&&<div className="mt-3"><div className="h-1 bg-orange-100 rounded-full overflow-hidden"><div className="h-1 bg-orange-500 rounded-full animate-pulse" style={{width:'65%'}}/></div></div>}
                  </div>
                  {i<C.agents.length-1&&<div className="flex justify-center my-1"><ChevronRight className="w-4 h-4 text-slate-300 rotate-90"/></div>}
                </div>
              );
            })}
          </div>
          <div className="mt-8 text-center text-xs text-slate-400">
            <Network className="w-3.5 h-3.5 inline mr-1 text-orange-400"/>
            참조 법령 {ragDocs.length}건 · RAG 검색 문서 12건{uploadedFiles.length>0?` · 업로드 자료 ${uploadedFiles.length}건`:''} 처리 중
          </div>
        </div>
      </div>
      <div className="hidden lg:flex w-80 shrink-0 border-l border-slate-100 bg-gradient-to-b from-slate-50 to-white p-4 overflow-y-auto custom-scrollbar flex-col">
        <AgentWorkflowPanel agentId="agent-safety" activeStep={agentIdx} doneSteps={doneIdx} />
      </div>
    </div>
  );

  return(
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-100">
      <div className="shrink-0 bg-white border-b px-5 py-2.5 flex items-center gap-2 flex-wrap shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0"><CheckCircle className="w-3.5 h-3.5 text-white"/></div>
          <div className="min-w-0">
            <div className="text-[13px] font-black text-slate-800 truncate">안전관리계획서 생성 완료</div>
            <div className="text-[10px] text-slate-400">위험 요인 {selectedRisks.length}건 · 참조 법령 5건 · RAG 문서 12건</div>
          </div>
        </div>
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
          {[['doc','문서 보기'],['matrix','위험 매트릭스'],['edit','원본 편집']].map(([m,l])=>(
            <button key={m} onClick={()=>setSafeViewMode(m)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${safeViewMode===m?'bg-white text-orange-700 shadow-sm':'text-slate-500 hover:text-slate-700'}`}>{l}</button>
          ))}
        </div>
        <button onClick={reset} className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-[11px] font-bold text-slate-500 hover:bg-slate-50 transition-colors"><RotateCcw className="w-3 h-3"/>새 계획서</button>
        <button onClick={()=>{
          const html=`<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><title>안전관리계획서 — ${C.docNum}</title>
          <style>
            @page{size:A4;margin:15mm 18mm}
            *{-webkit-print-color-adjust:exact;print-color-adjust:exact;box-sizing:border-box}
            body{font-family:'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif;margin:0;color:#1a202c;font-size:14px;line-height:1.9;word-break:keep-all;letter-spacing:-0.01em}
            .hd{border:1px solid #003A70}
            .hd-grid{display:grid;grid-template-columns:170px 1fr;grid-template-rows:auto auto}
            .hd-logo{grid-column:1;grid-row:1/3;display:flex;align-items:center;justify-content:center;padding:16px 14px;background:#fff;border-right:1px solid #003A70}
            .hd-logo img{width:156px;height:auto}
            .hd-title{grid-column:2;grid-row:1;display:flex;align-items:center;justify-content:center;padding:16px 12px;background:#e6e6e6;border-bottom:1px solid #003A70}
            .hd-meta{grid-column:2;grid-row:2;display:grid;grid-template-columns:72px 1fr 72px 1fr}
            .hd-h1{font-size:26px;font-weight:900;letter-spacing:.35em;padding-right:.35em;white-space:nowrap;font-family:'HY견고딕','돋움','맑은 고딕',sans-serif;color:#041E54;line-height:1.3}
            .hd-meta-lbl{display:flex;align-items:center;justify-content:center;padding:7px 10px;background:#dfeaf5;border-right:1px solid #003A70;font-size:12px;font-weight:700;color:#003A70}
            .hd-meta-val{display:flex;align-items:center;padding:7px 12px;border-right:1px solid #003A70;font-size:13.5px;color:#1a202c;font-weight:600}
            .hd-meta-val-last{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:2px;padding:7px 12px;font-size:12px;color:#1a202c}
            .body{background:white;padding:24px 30px}
            pre{white-space:pre-wrap;font-family:'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif;font-size:14px;line-height:2.05;color:#1a202c;margin:0;word-break:keep-all;letter-spacing:-0.01em}
            .sig-area{border-top:2px solid #7c2d12;padding-top:14px;margin-top:20px}
            .sig-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
            .sig-box{border:1px solid #cbd5e0;border-radius:5px;overflow:hidden}
            .sig-lbl{background:#7c2d12;color:white;text-align:center;padding:6px;font-size:12px;font-weight:700}
            .sig-sp{height:54px}
            .footer{text-align:center;font-size:11px;color:#a0aec0;margin-top:12px}
          </style></head><body>
          <script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};</script>
          <div class="hd">
            <div class="hd-grid">
              <div class="hd-logo"><img src="${docLogo}" alt="${docLogoAlt}"/></div>
              <div class="hd-title"><div class="hd-h1">안 전 관 리 계 획 서</div></div>
              <div class="hd-meta">
                <div class="hd-meta-lbl">담당부서</div>
                <div class="hd-meta-val">${C.dept}</div>
                <div class="hd-meta-lbl">문서번호</div>
                <div class="hd-meta-val-last"><span style="font-family:monospace;font-weight:700;font-size:12px">${C.docNum}</span><span style="color:#6b7280;font-size:10px">수신: 내부결재</span></div>
              </div>
            </div>
          </div>
          <div class="body">
            <pre>${result}</pre>
            <div class="sig-area">
              <div class="sig-grid">${['작  성  자','검  토  자','승  인  자'].map(r=>`<div class="sig-box"><div class="sig-lbl">${r}</div><div class="sig-sp"></div></div>`).join('')}</div>
              <p class="footer">본 안전관리계획서는 RoadQ AI 안전관리계획 에이전트에 의해 자동 생성되었으며, 담당자 검토 후 확정됩니다.</p>
            </div>
          </div>
          </body></html>`;
          const w=window.open('','_blank','width=900,height=1200');w.document.write(html);w.document.close();w.focus();
        }} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7c2d12] text-white rounded-lg text-[11px] font-bold hover:bg-[#6b2510] transition-colors shadow-sm"><Download className="w-3 h-3"/>PDF 출력</button>
        {apvState!=='done'
          ?<button onClick={()=>setApvState('selfcheck')} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[11px] font-bold hover:bg-emerald-700 transition-colors shadow-sm"><FileCheck className="w-3 h-3"/>결재 상신</button>
          :<span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold"><CheckCircle className="w-3 h-3"/>결재 진행 중</span>
        }
      </div>

      {apvState==='done'&&(
        <div className="shrink-0 bg-orange-50 border-b border-orange-100 px-5 py-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"/>
              <span className="text-[11px] font-black text-slate-700">결재 현황</span>
              <span className="text-[9px] font-bold text-white bg-[#7c2d12] px-1.5 py-0.5 rounded">WorksOn</span>
            </div>
            <div className="flex items-center gap-1 flex-1 min-w-0">
              {C.apvLine.map((p,i)=>(
                <React.Fragment key={i}>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] border whitespace-nowrap ${i===0?'bg-emerald-50 border-emerald-200':i===1?'bg-blue-50 border-blue-200 shadow-sm':'bg-white border-slate-200'}`}>
                    {i===0?<CheckCircle className="w-3 h-3 text-emerald-500 shrink-0"/>:i===1?<Loader2 className="w-3 h-3 text-blue-500 animate-spin shrink-0"/>:<Clock className="w-3 h-3 text-slate-300 shrink-0"/>}
                    <span className="font-bold text-slate-700">{p.name}</span>
                    <span className={`font-black text-[9px] ${i===0?'text-emerald-500':i===1?'text-blue-500':'text-slate-300'}`}>{i===0?'서명 완료':i===1?'검토 중':'대기'}</span>
                  </div>
                  {i<C.apvLine.length-1&&<ChevronRight className="w-3 h-3 text-slate-300 shrink-0"/>}
                </React.Fragment>
              ))}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] text-slate-400 font-mono">{C.apvRef}</span>
              <a href="#" onClick={e=>e.preventDefault()} className="text-[10px] font-bold text-blue-500 hover:underline flex items-center gap-0.5">WorksOn에서 보기<ExternalLink className="w-2.5 h-2.5"/></a>
            </div>
          </div>
        </div>
      )}

      {apvState==='selfcheck'&&(
        <SelfCheckModal
          docType="safety"
          domain={domain}
          onClose={()=>setApvState(null)}
          onProceed={()=>setApvState('modal')}
        />
      )}

      {(apvState==='modal'||apvState==='submitting')&&(
        <ApprovalModal
          docTitle={`안전관리계획서 — ${projName}`}
          docNum={C.docNum}
          apvLine={C.apvLine}
          apvMsg={apvMsg} setApvMsg={setApvMsg}
          onClose={()=>setApvState(null)}
          onSubmit={submitApv}
          submitting={apvState==='submitting'}
          accentBg="bg-[#7c2d12]"
          accentBtn="bg-[#7c2d12] hover:bg-[#6b2510]"
        />
      )}

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {safeViewMode==='edit'?(
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border shadow-sm overflow-hidden">
            <textarea value={result} onChange={e=>setResult(e.target.value)}
              className="w-full p-6 font-mono text-[13px] text-slate-700 leading-relaxed resize-none outline-none"
              style={{minHeight:640}}/>
          </div>
        ):safeViewMode==='matrix'?(
          <div className="max-w-3xl mx-auto space-y-5">
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shrink-0"><LayoutGrid className="w-4 h-4 text-white"/></div>
                <div>
                  <div className="text-[14px] font-black text-slate-800">위험도 매트릭스</div>
                  <div className="text-[11px] text-slate-400">발생 가능성(빈도) × 심각도 — 선택된 위험 요인 {selectedRisks.length}건 분포</div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[500px]">
                  <div className="flex mb-1 ml-[76px]">
                    {['매우낮음(1)','낮음(2)','보통(3)','높음(4)','매우높음(5)'].map((l,i)=>(
                      <div key={i} className="flex-1 text-center text-[9px] font-black text-slate-400 leading-tight">{l}</div>
                    ))}
                  </div>
                  {[{sev:5,label:'치명'},{sev:4,label:'심각'},{sev:3,label:'보통'},{sev:2,label:'경미'},{sev:1,label:'미미'}].map(({sev,label})=>(
                    <div key={sev} className="flex mb-1">
                      <div className="w-[76px] shrink-0 flex items-center justify-end pr-2 gap-0.5">
                        <span className="text-[11px] font-black text-slate-600">{label}</span>
                        <span className="text-[9px] text-slate-400">({sev})</span>
                      </div>
                      {[1,2,3,4,5].map(lkl=>{
                        const score=sev*lkl;
                        const bg=score>=16?'bg-red-100 border-red-300':score>=10?'bg-orange-100 border-orange-300':score>=5?'bg-yellow-100 border-yellow-300':'bg-emerald-100 border-emerald-300';
                        const cellRisks=selectedRisks.filter(r=>C.riskData[r]&&C.riskData[r].sev===sev&&C.riskData[r].lkl===lkl);
                        return(
                          <div key={lkl} className={`flex-1 border-2 rounded-xl mx-0.5 px-1 py-1 min-h-[58px] flex flex-col items-center justify-start ${bg}`}>
                            <div className="text-[8px] text-slate-400 font-mono self-end">{score}</div>
                            {cellRisks.map((r,ri)=>(
                              <div key={ri} className="mt-0.5 px-1 py-0.5 bg-white/90 border border-white rounded text-[7.5px] font-black text-slate-800 text-center leading-tight w-full truncate shadow-sm">
                                {r.length>6?r.slice(0,6)+'…':r}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  <div className="mt-2 ml-[76px] text-center text-[10px] text-slate-400 font-black">← 발생 가능성 (빈도) →</div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4 flex-wrap">
                {[{bg:'bg-emerald-100 border-emerald-300',label:'낮음 (1-4)'},{bg:'bg-yellow-100 border-yellow-300',label:'보통 (5-9)'},{bg:'bg-orange-100 border-orange-300',label:'높음 (10-15)'},{bg:'bg-red-100 border-red-300',label:'매우높음 (16+)'}].map(({bg,label})=>(
                  <div key={label} className="flex items-center gap-1.5">
                    <div className={`w-3.5 h-3.5 rounded border-2 ${bg}`}/>
                    <span className="text-[11px] text-slate-500 font-bold">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedRisks.map(r=>{
                const d=C.riskData[r];
                if(!d)return null;
                const score=d.sev*d.lkl;
                const sc=score>=16?'text-red-700 bg-red-50 border-red-200':score>=10?'text-orange-700 bg-orange-50 border-orange-200':score>=5?'text-yellow-700 bg-yellow-50 border-yellow-200':'text-emerald-700 bg-emerald-50 border-emerald-200';
                return(
                  <div key={r} className="bg-white rounded-xl border shadow-sm p-4">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="font-black text-[13px] text-slate-800">{r}</div>
                      <div className={`text-[10px] font-black px-2 py-0.5 rounded-full border shrink-0 ${sc}`}>점수 {score}</div>
                    </div>
                    <div className="flex gap-3 text-[11px] mb-2">
                      <span className="text-slate-400">심각도 <span className="font-black text-slate-700">{d.sev}/5</span></span>
                      <span className="text-slate-200">|</span>
                      <span className="text-slate-400">빈도 <span className="font-black text-slate-700">{d.lkl}/5</span></span>
                    </div>
                    <div className="text-[11px] text-slate-500 leading-relaxed">{d.measure}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ):(
          <div className="max-w-3xl mx-auto shadow-2xl rounded-lg overflow-hidden"
            style={{fontFamily:"'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif",lineHeight:1.85,wordBreak:'keep-all',letterSpacing:'-0.01em'}}>
            <div style={{background:'linear-gradient(135deg,#431407 0%,#7c2d12 55%,#c2410c 100%)'}}>
              <div className="px-10 pt-7 pb-2 flex items-start justify-between">
                <div>
                  <div className="text-[10px] tracking-[0.4em] text-orange-200 mb-0.5 font-medium">{C.brandLine || `${orgMeta.short} · ${orgMeta.name}`}</div>
                  <div className="text-[11px] text-orange-300 font-medium">{C.dept}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-orange-300">문서번호</div>
                  <div className="text-[12px] font-bold text-white font-mono">{C.docNum}</div>
                  <div className="text-[10px] text-orange-300 mt-0.5">수신: 내부결재</div>
                </div>
              </div>
              <div className="text-center py-7 px-10">
                <div className="inline-block border-t border-b border-orange-300/40 py-4 px-10">
                  <div className="text-[38px] font-black text-white tracking-[0.5em]"
                    style={{fontFamily:"'Nanum Myeongjo','Batang','Gungsuh','Times New Roman',serif",textShadow:'0 2px 12px rgba(0,0,0,0.4)'}}>
                    안전관리계획서
                  </div>
                  <div className="text-[11px] tracking-[0.5em] text-orange-200 mt-1 font-light">SAFETY MANAGEMENT PLAN</div>
                </div>
              </div>
              <div className="h-1 flex">
                <div className="flex-1 bg-orange-400"/><div className="flex-1 bg-orange-300"/><div className="flex-1 bg-white/20"/>
              </div>
            </div>
            <div className="bg-white px-10 py-8 space-y-7">
              <table className="w-full border-collapse text-[13px]" style={{borderTop:'2px solid #7c2d12'}}>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-3 pr-4 font-bold text-[#7c2d12] w-28 whitespace-nowrap">조  사  명</td>
                    <td className="py-3 font-semibold text-slate-800" colSpan={3}>{projName}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-3 pr-4 font-bold text-[#7c2d12] whitespace-nowrap">작업 유형</td>
                    <td className="py-3 pr-8 text-slate-700">{projType}</td>
                    <td className="py-3 pr-4 font-bold text-[#7c2d12] whitespace-nowrap w-28">작업 구간</td>
                    <td className="py-3 text-slate-700">{projLoc}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-3 pr-4 font-bold text-[#7c2d12] whitespace-nowrap">작업 기간</td>
                    <td className="py-3 text-slate-700" colSpan={3}>{C.periodRange} ({duration})</td>
                  </tr>
                </tbody>
              </table>
              <div className="flex items-center gap-3"><div className="flex-1 h-px bg-slate-200"/><div className="w-1.5 h-1.5 rounded-full bg-slate-300"/><div className="flex-1 h-px bg-slate-200"/></div>
              <section>
                <h3 className="flex items-center gap-2 text-[14px] font-black text-slate-800 mb-3">
                  <span className="w-6 h-6 rounded-md bg-[#7c2d12] flex items-center justify-center text-white text-[10px] font-black shrink-0">1</span>안전관리 조직
                </h3>
                <div className="ml-8 bg-orange-50 border border-orange-100 rounded-xl p-4 text-[12px] font-mono leading-relaxed space-y-1">
                  <div className="font-bold text-[#7c2d12]">{C.orgLeader}</div>
                  <div className="ml-4 text-slate-500">└─ <span className="text-slate-700 font-semibold">{C.orgManager}</span></div>
                  <div className="ml-12 text-slate-500">├─ <span className="text-slate-700">{C.orgMembers[0]}</span></div>
                  <div className="ml-12 text-slate-500">└─ <span className="text-slate-700">{C.orgMembers[1]}</span></div>
                </div>
              </section>
              <section>
                <h3 className="flex items-center gap-2 text-[14px] font-black text-slate-800 mb-3">
                  <span className="w-6 h-6 rounded-md bg-[#7c2d12] flex items-center justify-center text-white text-[10px] font-black shrink-0">2</span>위험 요인 분석 (위험성 평가)
                </h3>
                <div className="ml-8">
                  <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-[12px]" style={{borderTop:'2px solid #7c2d12'}}>
                    <thead>
                      <tr style={{background:'#7c2d12'}}>
                        <th className="text-white font-bold py-2.5 px-3 text-left">위험 요인</th>
                        <th className="text-white font-bold py-2.5 px-3 text-center w-20">위험도</th>
                        <th className="text-white font-bold py-2.5 px-3 text-center w-16">빈도</th>
                        <th className="text-white font-bold py-2.5 px-3 text-left">안전 대책</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRisks.map((r,i)=>{
                        const d=C.riskData[r]||{level:'보통',freq:'-',lvlColor:'bg-yellow-100 text-yellow-700 border-yellow-200',measure:'별도 안전 대책 수립 필요'};
                        return(
                          <tr key={i} className={i%2===0?'bg-white':'bg-slate-50/60'} style={{borderBottom:'1px solid #e2e8f0'}}>
                            <td className="py-2.5 px-3 font-bold text-slate-700">{r}</td>
                            <td className="py-2.5 px-3 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black border ${d.lvlColor}`}>{d.level}</span>
                            </td>
                            <td className="py-2.5 px-3 text-center text-slate-500">{d.freq}</td>
                            <td className="py-2.5 px-3 text-slate-600">{d.measure}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  </div>
                </div>
              </section>
              <section>
                <h3 className="flex items-center gap-2 text-[14px] font-black text-slate-800 mb-3">
                  <span className="w-6 h-6 rounded-md bg-[#7c2d12] flex items-center justify-center text-white text-[10px] font-black shrink-0">3</span>안전관리 계획 (작업 단계별)
                </h3>
                <div className="ml-8 space-y-3">
                  {C.planSections.map((sec,si)=>(
                    <div key={si} className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="px-4 py-2 bg-orange-50 border-b border-orange-100">
                        <span className="text-[12px] font-black text-[#7c2d12]">{sec.sub}</span>
                      </div>
                      <div className="px-4 py-3 space-y-1.5">
                        {sec.items.map((item,ii)=>(
                          <div key={ii} className="flex items-start gap-2 text-[12px] text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0 mt-1.5"/>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <h3 className="flex items-center gap-2 text-[14px] font-black text-slate-800 mb-3">
                  <span className="w-6 h-6 rounded-md bg-[#7c2d12] flex items-center justify-center text-white text-[10px] font-black shrink-0">4</span>비상 연락 체계
                </h3>
                <div className="ml-8 bg-red-50 border border-red-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    {C.emergencySteps.map((s,i,arr)=>(
                      <React.Fragment key={i}>
                        <div className="flex flex-col items-center gap-1">
                          <div className={`${s.color} text-white text-[11px] font-black px-3 py-1.5 rounded-lg text-center whitespace-nowrap`}>{s.label}</div>
                          <div className="text-[10px] text-slate-500 text-center">{s.sub}</div>
                        </div>
                        {i<arr.length-1&&<ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mb-3"/>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </section>
              <section>
                <h3 className="flex items-center gap-2 text-[14px] font-black text-slate-800 mb-3">
                  <span className="w-6 h-6 rounded-md bg-[#7c2d12] flex items-center justify-center text-white text-[10px] font-black shrink-0">5</span>관련 법령 및 규정
                </h3>
                <div className="ml-8 space-y-2">
                  {C.laws.map((l,i)=>(
                    <div key={i} className="flex items-start gap-2.5 text-[13px] text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-[#7c2d12] text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>
                      <span>{l}</span>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <h3 className="flex items-center gap-2 text-[14px] font-black text-slate-800 mb-3">
                  <span className="w-6 h-6 rounded-md bg-[#7c2d12] flex items-center justify-center text-white text-[10px] font-black shrink-0">6</span>안전 체크리스트
                </h3>
                <div className="ml-8">
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    {C.checklist.map((item,i)=>(
                      <button key={i} onClick={()=>setCheckState(p=>({...p,[i]:!p[i]}))}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-[12px] text-left transition-colors ${checkState[i]?'bg-emerald-50':(i%2===0?'bg-white':'bg-slate-50/60')} ${i<C.checklist.length-1?'border-b border-slate-100':''} hover:bg-emerald-50/60`}>
                        <div className={`w-4 h-4 border-2 rounded shrink-0 flex items-center justify-center transition-all ${checkState[i]?'bg-emerald-500 border-emerald-500':'border-slate-300'}`}>
                          {checkState[i]&&<svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                        <span className={`transition-colors ${checkState[i]?'text-emerald-700 line-through decoration-emerald-400':'text-slate-700'}`}>{item}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{Object.values(checkState).filter(Boolean).length}/{C.checklist.length}건 확인 완료</span>
                    {Object.values(checkState).filter(Boolean).length===C.checklist.length&&(
                      <span className="text-emerald-600 font-black flex items-center gap-1"><CheckCircle className="w-3 h-3"/>전체 확인 완료</span>
                    )}
                  </div>
                </div>
              </section>
              <div className="pt-4" style={{borderTop:'2px solid #7c2d12'}}>
                <div className="grid grid-cols-3 gap-4">
                  {['작  성  자','검  토  자','승  인  자'].map((r,i)=>(
                    <div key={i} className="border border-slate-300 rounded-lg overflow-hidden">
                      <div className="py-1.5 text-center text-[11px] font-bold text-white" style={{background:'#7c2d12'}}>{r}</div>
                      <div className="h-16 flex items-end justify-center pb-2">
                        <div className="w-16 border-b border-slate-300"/>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-center text-[10px] text-slate-400 mt-4">
                  본 계획서는 RoadQ 안전관리 에이전트 v1.0에 의해 자동 생성되었으며, 담당자 검토 후 확정됩니다.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SafetyPlanAgent;
