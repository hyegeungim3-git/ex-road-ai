import React, { useState, useRef, useEffect } from "react";
import {
  BookOpen, Search, Brain, PenLine, CheckCircle, Loader2, ChevronRight,
  Network, RotateCcw, Copy, FileCheck, ChevronDown, ExternalLink, Clock,
  ArrowLeft, History, Send, Sparkles
} from "lucide-react";
import ApprovalModal from "../ApprovalModal.jsx";
import AgentWorkflowPanel from "./AgentWorkflowPanel.jsx";
import { AGENT_TEAMS } from "../../data/constants.js";
import { cn, agentHeader } from "../../utils.jsx";


const REG_CATEGORIES = ['유지관리 매뉴얼','작업안전수칙','데이터 품질관리 지침','취업규칙','복무규정','개인정보처리방침','보안정책','계약·조달 규정'];
const SUGGESTIONS = ['갓길 차단 승인 절차','통신 불량 출동 기한','야간작업 안전 기준','적재 지연 소명 기준','정기점검 주기'];
const SEARCH_MODE_OPTIONS = [
  {label:'전체 검색', value:'all'},
  {label:'조항 번호', value:'article'},
  {label:'키워드',   value:'keyword'},
];

const RAG_DOCS = [
  {name:'교통정보 수집장비 유지관리 매뉴얼.pdf', hits:12},
  {name:'도로 공사구간 작업안전수칙.pdf',        hits:9},
  {name:'데이터 품질관리 지침.pdf',              hits:7},
  {name:'안전보건관리규정.pdf',                  hits:3},
  {name:'취업규칙(2025개정).hwp',                hits:6},
];

const AGENTS = [
  {icon:Brain,   label:'의도 파악',   sub:'질의 의도 및 관련 규정 범주 파악', color:'bg-blue-600',   ms:1800},
  {icon:Search,  label:'RAG 검색',    sub:'사내 지식망 시맨틱 검색',           color:'bg-indigo-600', ms:3200},
  {icon:PenLine, label:'답변 작성',   sub:'EXAONE 3.0으로 답변 구성',          color:'bg-violet-600', ms:2400},
];

const APV_LINE = [
  {role:'작성자', name:'이도현', dept:'데이터플랫폼부', title:'차장'},
  {role:'검토자', name:'한지훈', dept:'AI인프라부', title:'팀장'},
  {role:'승인자', name:'윤상헌', dept:'디지털계획처', title:'처장'},
];

const ANSWER_TEXT = `고속도로 본선 갓길을 차단하고 수집장비를 점검하려면, 교통정보 수집장비 유지관리 매뉴얼과 도로 공사구간 작업안전수칙에 따라 다음 절차를 이행하여야 합니다.

1. 사전 승인: 갓길 차단은 관할 지역본부장의 사전 승인 대상입니다(유지관리 매뉴얼 제14조). 작업계획서에 차단 구간·시간·작업원 수를 명시하여 승인을 요청합니다.

2. 교통센터 통보: 승인 후 교통센터 상황관리부에 작업 개시 24시간 전까지 통보하고, VMS 예고 송출을 요청합니다. 통보 기한이 미달하면 작업을 개시할 수 없습니다.

3. 위험성평가: 산업안전보건법 제36조에 따라 작업 전 위험성평가를 실시하고 결과를 안전관리계획서에 첨부합니다. 야간 작업이 포함되면 조도·신호수 배치 기준을 별도로 기재합니다.

4. 현장 안전조치: 차단 구간 전방 800m에 안전표지와 라바콘을 설치한 뒤 진입하며, 2인 1조 원칙과 30분 간격 연락 확인을 준수합니다(작업안전수칙 제7조).

5. 작업 종료·보고: 차단 해제 즉시 교통센터에 통보하고 점검 결과와 통신 불량 조치 내역을 EXMMS에 등록합니다. 통신 불량은 확인일로부터 3일 이내 출동이 원칙입니다(유지관리 매뉴얼 제13조).`;

const CITATIONS = [
  {doc:'유지관리 매뉴얼 제14조', title:'갓길 차단 승인·통보', excerpt:'"본선 갓길을 차단하는 작업은 관할 지역본부장의 승인을 받고, 교통센터에 작업 개시 24시간 전까지 통보하여야 한다."'},
  {doc:'유지관리 매뉴얼 제13조', title:'통신 불량 조치',      excerpt:'"수집장비의 통신 불량이 확인된 경우 확인일로부터 3일 이내에 현장 출동하여 조치하여야 한다."'},
  {doc:'작업안전수칙 제7조',     title:'이동차선규제',        excerpt:'"차단 구간 전방 800m에 안전표지와 라바콘을 설치한 후 작업 구간에 진입하며, 2인 1조를 원칙으로 한다."'},
];

const RELATED_REGS = [
  {title:'유지관리 매뉴얼 제12조',   desc:'수집장비 정기점검 주기(분기 1회) 및 점검표 서식'},
  {title:'데이터 품질관리 지침 제9조', desc:'적재 지연 3분 초과 시 당일 소명 절차'},
  {title:'작업안전수칙 제11조',      desc:'야간 작업 조도 기준 및 신호수 배치 기준'},
];

const REG_HISTORY = [
  {
    reg:'교통정보 수집장비 유지관리 매뉴얼',
    changes:[
      {ver:'2026.03 개정', date:'2026-03-01', type:'개정',    badge:'bg-blue-100 text-blue-700',   content:'제14조(갓길 차단): 교통센터 통보 기한 「12시간 전」→「24시간 전」으로 강화', reason:'공사구간 2차사고 예방'},
      {ver:'2025.06 개정', date:'2025-06-01', type:'일부개정', badge:'bg-slate-100 text-slate-600', content:'제13조 개정 — 통신 불량 현장 출동 기한 「5일」→「3일」로 단축', reason:'VDS 결측률 관리 강화'},
      {ver:'2024.01 개정', date:'2024-01-01', type:'일부개정', badge:'bg-slate-100 text-slate-600', content:'제12조 신설 — 수집장비 정기점검 주기 분기 1회 명문화', reason:'상시 관측 품질 기준 수립'},
    ]
  },
  {
    reg:'도로 공사구간 작업안전수칙',
    changes:[
      {ver:'2025.09 개정', date:'2025-09-01', type:'개정',    badge:'bg-blue-100 text-blue-700',   content:'제7조(이동차선규제): 전방 안전표지 설치 거리 「500m」→「800m」로 확대', reason:'주행 차량 충돌 위험 저감'},
      {ver:'2024.01 개정', date:'2024-01-01', type:'일부개정', badge:'bg-slate-100 text-slate-600', content:'제11조 개정 — 야간 작업 시 신호수 2인 배치 의무화', reason:'야간 작업 사고 대응'},
    ]
  },
  {
    reg:'데이터 품질관리 지침',
    changes:[
      {ver:'2026.01 개정', date:'2026-01-01', type:'개정',    badge:'bg-emerald-100 text-emerald-700', content:'제9조 개정 — 적재 지연 3분 초과 시 당일 소명 의무 신설', reason:'AI 예측 모델 입력 품질 확보'},
      {ver:'2025.01 개정', date:'2025-01-01', type:'일부개정', badge:'bg-slate-100 text-slate-600',     content:'제5조: VDS 결측률 관리 임계 「5.0%」→「3.0%」로 강화', reason:'예측 정확도 목표 상향'},
    ]
  },
];

/* 도메인 이관: 기본 콘텐츠 — 도메인 팩 agentContent["agent-internalreg"]로 키 단위 오버라이드 */
export const CONTENT_DEFAULTS = {
  headerTitle: '내규·규정 조회',              // string — 미제공 시 허브 카탈로그 이름 승계
  headerDesc: 'RAG 검색 + EXAONE 3.0',       // string — 헤더 설명(작업 흐름)
  regCategories: REG_CATEGORIES,       // string[8] — 규정 범주 칩
  defaultCategories:['유지관리 매뉴얼','작업안전수칙'], // string[2] — 초기 선택 범주(regCategories 항목과 일치)
  suggestions: SUGGESTIONS,            // string[5] — 자주 묻는 질문 버튼
  ragDocs: RAG_DOCS,                   // {name,hits}[5] — RAG 검색 대상 문서(처리 중 티커)
  apvLine: APV_LINE,                   // {role,name,dept,title}[3] — 결재선(ApprovalModal 공용)
  answerText: ANSWER_TEXT,             // string(멀티라인) — AI 답변 본문
  citations: CITATIONS,                // {doc,title,excerpt}[3] — 참조 규정 인용
  relatedRegs: RELATED_REGS,           // {title,desc}[3] — 관련 규정 더보기
  regHistory: REG_HISTORY,             // {reg,changes:{ver,date,type,badge(tailwind 클래스),content,reason}[]}[3] — 규정 변경 이력 타임라인
  emptyDesc:['유지관리 매뉴얼, 작업안전수칙, 취업규칙 등','한국도로공사 사내 규정을 검색합니다'], // string[2] — 빈 화면 안내 2줄(<br/> 연결)
  inputPlaceholder:'유지관리 매뉴얼, 작업안전수칙, 취업규칙 등 내규에 대해 질문하세요 (Enter로 전송)', // string — 입력창 플레이스홀더
  regSystemFooter:'한국도로공사 규정 관리 시스템 연동 · 최신 개정 기준 자동 반영', // string — 변경 이력 카드 하단 문구
  apvDocTitle:'내규 조회 결과 — 갓길 차단 작업 승인·통보 절차', // string — 결재 문서 제목
  apvDocNum:'EX-데이터플랫폼부-2026-0149', // string — 결재 문서번호
};

/* ────────────────────────────────────────────────────────────── */
const InternalRegAgent = ({ onBack, domain }) => {
  const C = {...CONTENT_DEFAULTS, ...(domain?.agentContent?.["agent-internalreg"]||{})};
  const H = agentHeader(domain,'agent-internalreg',C,AGENT_TEAMS);
  const [step, setStep]               = useState(1);   // 1=입력 2=처리중 3=결과
  const [query, setQuery]             = useState('');
  const [submittedQuery, setSubmitted]= useState('');
  const [selectedCats, setSelectedCats] = useState(C.defaultCategories);
  const [searchMode, setSearchMode]   = useState('all');
  const [agentIdx, setAgentIdx]       = useState(-1);
  const [doneIdx, setDoneIdx]         = useState([]);
  const [ragDocIdx, setRagDocIdx]     = useState(-1);
  const [openCitations, setOpenCit]   = useState([]);
  const [openRelated, setOpenRelated] = useState([]);
  const [openHistory, setOpenHistory] = useState([]);
  const [apvState, setApvState]       = useState(null);
  const [apvMsg, setApvMsg]           = useState('검토 요청드립니다.');
  const [copied, setCopied]           = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);   // 추천 질의 클릭 시 입력창으로 포커스를 옮겨 '반영됐다'는 피드백을 준다

  useEffect(() => {
    if (step === 3) bottomRef.current?.scrollIntoView({behavior:'smooth'});
  }, [step]);

  const toggleCat  = (c) => setSelectedCats(p => p.includes(c) ? p.filter(x=>x!==c) : [...p,c]);
  const toggleCit  = (i) => setOpenCit(p => p.includes(i) ? p.filter(x=>x!==i) : [...p,i]);
  const toggleRel  = (i) => setOpenRelated(p => p.includes(i) ? p.filter(x=>x!==i) : [...p,i]);
  const toggleHist = (i) => setOpenHistory(p => p.includes(i) ? p.filter(x=>x!==i) : [...p,i]);

  const handleSend = () => {
    const q = query.trim();
    if (!q || selectedCats.length === 0) return;
    setSubmitted(q);
    setQuery('');
    setStep(2); setAgentIdx(0); setDoneIdx([]); setRagDocIdx(-1);
    let delay = 0;
    AGENTS.forEach((ag, i) => {
      delay += ag.ms;
      if (i === 1) {
        C.ragDocs.forEach((_, di) => {
          setTimeout(() => setRagDocIdx(di), delay - ag.ms + (ag.ms / C.ragDocs.length) * (di + 1));
        });
      }
      setTimeout(() => {
        setAgentIdx(i + 1 < AGENTS.length ? i + 1 : -1);
        setDoneIdx(p => [...p, i]);
        if (i === AGENTS.length - 1) setTimeout(() => setStep(3), 600);
      }, delay);
    });
  };

  const reset = () => {
    setStep(1); setQuery(''); setSubmitted('');
    setAgentIdx(-1); setDoneIdx([]); setRagDocIdx(-1);
    setOpenCit([]); setOpenRelated([]); setOpenHistory([]);
    setApvState(null); setApvMsg('검토 요청드립니다.'); setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(C.answerText).catch(()=>{});
    setCopied(true); setTimeout(()=>setCopied(false), 2000);
  };
  const submitApv = () => { setApvState('submitting'); setTimeout(()=>setApvState('done'),1600); };

  /* ── 공통 헤더 ── */
  const renderHeader = ({showActions=false}={}) => (
    <div className="shrink-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-2.5">
      {onBack && (
        <button onClick={onBack} aria-label="뒤로 가기" className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0">
          <ArrowLeft className="w-4 h-4"/>
        </button>
      )}
      <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 shadow-sm">
        <BookOpen className="w-3.5 h-3.5 text-white"/>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-black text-slate-800 leading-tight">{H.title}</div>
        <div className="text-[10px] text-slate-400">{H.desc}</div>
      </div>
      {showActions && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={reset} className="flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-500 hover:bg-slate-50 transition-colors">
            <RotateCcw className="w-3 h-3"/>새 질의
          </button>
          <button onClick={handleCopy} className={cn('flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors border',
            copied?'bg-emerald-50 border-emerald-200 text-emerald-700':'border-slate-200 text-slate-500 hover:bg-slate-50')}>
            <Copy className="w-3 h-3"/>{copied?'복사됨':'복사'}
          </button>
          {apvState!=='done'
            ? <button onClick={()=>setApvState('modal')} className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-[11px] font-bold hover:bg-blue-700 transition-colors shadow-sm">
                <FileCheck className="w-3 h-3"/>결재 상신
              </button>
            : <span className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold">
                <CheckCircle className="w-3 h-3"/>결재 진행 중
              </span>
          }
        </div>
      )}
      {!showActions && (
        <div className="ml-auto flex items-center gap-1.5 text-[10px] text-slate-400 shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
          규정 DB 연결됨
        </div>
      )}
    </div>
  );

  /* ── 공통 하단 입력창 ── */
  /* ⚠ 컴포넌트로 렌더(<InputBar/>)하면 안 된다 — 부모 안에서 정의된 함수라
     매 렌더마다 새 타입이 되어 textarea가 리마운트되고 포커스가 날아간다
     (첫 글자만 입력되는 증상). 반드시 {inputBar(...)}처럼 함수로 호출할 것. */
  const inputBar = ({disabled=false}={}) => (
    <div className="shrink-0 bg-white border-t border-slate-100 px-4 py-3 space-y-2.5">
      {/* 범주 + 조회 방식 */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">범주</span>
        <div className="flex flex-wrap gap-1">
          {C.regCategories.map(cat => (
            <button key={cat} onClick={()=>!disabled&&toggleCat(cat)} className={cn(
              'px-2 py-0.5 rounded-full border text-[10px] font-bold transition-all',
              selectedCats.includes(cat)
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500'
            )}>{cat}</button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1 shrink-0">
          {SEARCH_MODE_OPTIONS.map(opt => (
            <button key={opt.value} onClick={()=>!disabled&&setSearchMode(opt.value)} className={cn(
              'px-2 py-0.5 rounded-full border text-[10px] font-bold transition-all',
              searchMode===opt.value
                ? 'bg-slate-700 border-slate-700 text-white'
                : 'bg-white border-slate-200 text-slate-400 hover:border-slate-400'
            )}>{opt.label}</button>
          ))}
        </div>
      </div>
      {/* 텍스트 입력 */}
      <div className="flex gap-2 items-end">
        <textarea
          ref={inputRef}
          value={query}
          onChange={e=>setQuery(e.target.value)}
          onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleSend();}}}
          disabled={disabled}
          placeholder={disabled ? '처리 중입니다...' : C.inputPlaceholder}
          rows={2}
          className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-700 resize-none outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300 leading-relaxed disabled:bg-slate-50 disabled:text-slate-300"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !query.trim() || selectedCats.length===0}
          aria-label="질의 전송"
          className="w-[46px] h-[58px] max-w-full bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 disabled:opacity-40 disabled:cursor-not-allowed shrink-0">
          <Send className="w-4 h-4"/>
        </button>
      </div>
    </div>
  );

  /* ────────── STEP 1: 입력 (빈 화면) ────────── */
  if (step === 1) return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {renderHeader()}
      {/* 빈 상태 */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-6 py-8">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center mb-5">
          <BookOpen className="w-8 h-8 text-blue-400"/>
        </div>
        <div className="text-[17px] font-black text-slate-600 mb-1.5">사내 규정에 대해 질문하세요</div>
        <div className="text-[12px] text-slate-400 mb-6 text-center leading-relaxed">
          {C.emptyDesc[0]}<br/>{C.emptyDesc[1]}
        </div>
        {/* 추천 질의 */}
        <div className="w-full max-w-md space-y-2">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider text-center mb-3">자주 묻는 질문</div>
          {C.suggestions.map(s => (
            <button key={s} onClick={()=>{setQuery(s); inputRef.current?.focus();}} className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl text-[13px] font-medium text-slate-600 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-all shadow-sm text-left">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0"/>
              {s}
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 ml-auto shrink-0"/>
            </button>
          ))}
        </div>
      </div>
      {inputBar()}
    </div>
  );

  /* ────────── STEP 2: 처리 중 ────────── */
  if (step === 2) return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* 왼쪽: 채팅 영역 */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden bg-slate-50">
          {renderHeader()}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            {/* 사용자 질의 버블 */}
            <div className="flex justify-end">
              <div className="max-w-[78%]">
                <div className="bg-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-3 text-[13px] leading-relaxed shadow-sm">
                  {submittedQuery}
                </div>
                <div className="flex justify-end gap-1 mt-1.5">
                  {selectedCats.map(c=>(
                    <span key={c} className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-600 rounded-full text-[10px] font-bold">{c}</span>
                  ))}
                </div>
              </div>
            </div>
            {/* AI 처리 중 버블 */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <BookOpen className="w-4 h-4 text-white"/>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3.5 shadow-sm min-w-[200px]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[12px] text-slate-500 font-medium">규정을 검색하고 있습니다</span>
                  <span className="flex gap-0.5 ml-1">
                    {[0,1,2].map(i=>(
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce inline-block" style={{animationDelay:`${i*0.15}s`}}/>
                    ))}
                  </span>
                </div>
                <div className="space-y-2">
                  {AGENTS.map((ag,i)=>{
                    const isDone=doneIdx.includes(i);
                    const isActive=agentIdx===i;
                    const AgIcon=ag.icon;
                    return(
                      <div key={i} className={cn('flex items-center gap-2 text-[11px] transition-all duration-300',
                        isDone?'text-emerald-600':isActive?'text-blue-600':'text-slate-300')}>
                        <div className={cn('w-5 h-5 rounded-md flex items-center justify-center shrink-0',
                          isDone?'bg-emerald-500':isActive?ag.color:'bg-slate-100')}>
                          {isDone
                            ?<CheckCircle className="w-3 h-3 text-white"/>
                            :<AgIcon className={cn('w-3 h-3',isActive?'text-white animate-pulse':'text-slate-300')}/>}
                        </div>
                        <span className="font-bold">{ag.label}</span>
                        {isActive&&<Loader2 className="w-3 h-3 animate-spin ml-auto shrink-0"/>}
                        {isDone&&<span className="ml-auto text-[9px] font-black text-emerald-500 shrink-0">완료</span>}
                      </div>
                    );
                  })}
                </div>
                {/* RAG 문서 검색 현황 */}
                {agentIdx===1&&ragDocIdx>=0&&(
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                    {C.ragDocs.map((doc,di)=>(
                      <div key={di} className={cn('flex items-center justify-between text-[10px] px-2 py-0.5 rounded transition-all',
                        di<=ragDocIdx?'text-blue-700 bg-blue-50':'text-slate-300')}>
                        <span className="truncate flex-1">{doc.name}</span>
                        {di<=ragDocIdx&&<span className="font-black ml-2 shrink-0">{doc.hits}건</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          {inputBar({disabled:true})}
        </div>
        {/* 오른쪽: 워크플로우 패널 */}
        <div className="hidden lg:flex w-72 shrink-0 border-l border-slate-100 bg-gradient-to-b from-slate-50 to-white p-4 overflow-y-auto flex-col">
          <AgentWorkflowPanel agentId="agent-internalreg" activeStep={agentIdx} doneSteps={doneIdx}/>
        </div>
      </div>
    </div>
  );

  /* ────────── STEP 3: 결과 (채팅) ────────── */
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {renderHeader({showActions:true})}

      {/* 결재 현황 바 */}
      {apvState==='done'&&(
        <div className="shrink-0 bg-blue-50 border-b border-blue-100 px-5 py-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"/>
              <span className="text-[11px] font-black text-slate-700">결재 현황</span>
              <span className="text-[9px] font-bold text-white bg-blue-600 px-1.5 py-0.5 rounded">WorksOn</span>
            </div>
            <div className="flex items-center gap-1 flex-1 min-w-0">
              {C.apvLine.map((p,i)=>(
                <React.Fragment key={i}>
                  <div className={cn('flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] border whitespace-nowrap',
                    i===0?'bg-emerald-50 border-emerald-200':i===1?'bg-blue-50 border-blue-200 shadow-sm':'bg-white border-slate-200')}>
                    {i===0?<CheckCircle className="w-3 h-3 text-emerald-500 shrink-0"/>:i===1?<Loader2 className="w-3 h-3 text-blue-500 animate-spin shrink-0"/>:<Clock className="w-3 h-3 text-slate-300 shrink-0"/>}
                    <span className="font-bold text-slate-700">{p.name}</span>
                    <span className={cn('font-black text-[9px]',i===0?'text-emerald-500':i===1?'text-blue-500':'text-slate-300')}>
                      {i===0?'서명 완료':i===1?'검토 중':'대기'}
                    </span>
                  </div>
                  {i<C.apvLine.length-1&&<ChevronRight className="w-3 h-3 text-slate-300 shrink-0"/>}
                </React.Fragment>
              ))}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] text-slate-400 font-mono">APV-2026-0313-019</span>
              <a href="#" onClick={e=>e.preventDefault()} className="text-[10px] font-bold text-blue-500 hover:underline flex items-center gap-0.5">
                WorksOn<ExternalLink className="w-2.5 h-2.5"/>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 결재 모달 */}
      {(apvState==='modal'||apvState==='submitting')&&(
        <ApprovalModal
          docTitle={C.apvDocTitle}
          docNum={C.apvDocNum}
          apvLine={C.apvLine}
          apvMsg={apvMsg} setApvMsg={setApvMsg}
          onClose={()=>setApvState(null)}
          onSubmit={submitApv}
          submitting={apvState==='submitting'}
          accentBg="bg-blue-600"
          accentBtn="bg-blue-600 hover:bg-blue-700"
        />
      )}

      {/* 대화 영역 */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

        {/* 사용자 질의 버블 */}
        <div className="flex justify-end">
          <div className="max-w-[75%]">
            <div className="bg-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-3 text-[13px] leading-relaxed shadow-sm">
              {submittedQuery}
            </div>
            <div className="flex justify-end gap-1 mt-1.5">
              {selectedCats.map(c=>(
                <span key={c} className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-600 rounded-full text-[10px] font-bold">{c}</span>
              ))}
            </div>
          </div>
        </div>

        {/* AI 응답 버블 */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <BookOpen className="w-4 h-4 text-white"/>
          </div>
          <div className="flex-1 min-w-0 space-y-2">

            {/* 본문 답변 카드 */}
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm shadow-sm overflow-hidden">
              {/* 참조 규정 칩 */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/60 flex-wrap">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0">참조 규정</span>
                {C.citations.map((c,i)=>(
                  <button key={i} onClick={()=>toggleCit(i)} className={cn(
                    'flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all',
                    openCitations.includes(i)
                      ?'bg-blue-600 text-white border-blue-600 shadow-sm'
                      :'bg-white border-blue-200 text-blue-700 hover:bg-blue-50'
                  )}>
                    <BookOpen className="w-2.5 h-2.5"/>{c.doc}
                  </button>
                ))}
              </div>

              {/* 인용문 펼침 */}
              {openCitations.length>0&&(
                <div className="px-4 py-3 border-b border-slate-100 space-y-2.5 bg-blue-50/40">
                  {openCitations.map(i=>(
                    <div key={i} className="bg-white border border-blue-100 rounded-xl px-4 py-3">
                      <div className="text-[11px] font-black text-blue-700 mb-1.5">{C.citations[i].doc} · {C.citations[i].title}</div>
                      <blockquote className="text-[12px] text-slate-600 border-l-2 border-blue-300 pl-3 italic leading-relaxed">
                        {C.citations[i].excerpt}
                      </blockquote>
                    </div>
                  ))}
                </div>
              )}

              {/* 답변 텍스트 */}
              <div className="px-5 py-4">
                <p className="text-[13px] text-slate-700 leading-[1.9] whitespace-pre-line">{C.answerText}</p>
              </div>
            </div>

            {/* 관련 규정 아코디언 */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">관련 규정 더보기</span>
              </div>
              {C.relatedRegs.map((r,i)=>(
                <div key={i} className="border-b border-slate-100 last:border-0">
                  <button onClick={()=>toggleRel(i)} className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3 h-3 text-blue-400 shrink-0"/>
                      <span className="text-[12px] font-bold text-slate-700">{r.title}</span>
                    </div>
                    <ChevronDown className={cn('w-3.5 h-3.5 text-slate-300 transition-transform shrink-0',openRelated.includes(i)&&'rotate-180')}/>
                  </button>
                  {openRelated.includes(i)&&(
                    <div className="px-4 pb-3 text-[12px] text-slate-500 leading-relaxed bg-slate-50/50 border-t border-slate-100">{r.desc}</div>
                  )}
                </div>
              ))}
            </div>

            {/* 규정 변경 이력 */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2">
                <History className="w-3.5 h-3.5 text-blue-500"/>
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">규정 변경 이력</span>
                <span className="ml-auto text-[10px] font-black text-white bg-blue-500 px-1.5 py-0.5 rounded-full">
                  {C.regHistory.reduce((s,r)=>s+r.changes.length,0)}건
                </span>
              </div>
              {C.regHistory.map((r,i)=>(
                <div key={i} className="border-b border-slate-100 last:border-0">
                  <button onClick={()=>toggleHist(i)} className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0"/>
                      <span className="text-[12px] font-bold text-slate-700">{r.reg}</span>
                      <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">개정 {r.changes.length}회</span>
                    </div>
                    <ChevronDown className={cn('w-3.5 h-3.5 text-slate-300 transition-transform shrink-0',openHistory.includes(i)&&'rotate-180')}/>
                  </button>
                  {openHistory.includes(i)&&(
                    <div className="px-4 pb-4 bg-slate-50/50 border-t border-slate-100">
                      <div className="relative mt-3">
                        {r.changes.map((chg,ci)=>(
                          <div key={ci} className="flex gap-3 mb-4 last:mb-0 relative">
                            {ci<r.changes.length-1&&<div className="absolute left-[10px] top-5 bottom-0 w-px bg-slate-200"/>}
                            <div className="w-5 h-5 rounded-full border-2 border-blue-300 bg-white flex items-center justify-center shrink-0 mt-0.5 z-10">
                              <div className="w-2 h-2 rounded-full bg-blue-400"/>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className={cn('text-[10px] font-black px-2 py-0.5 rounded',chg.badge)}>{chg.type}</span>
                                <span className="text-[11px] font-bold text-slate-700">{chg.ver}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{chg.date}</span>
                              </div>
                              <div className="text-[12px] text-slate-600 leading-relaxed mb-1">{chg.content}</div>
                              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                <span className="font-black text-slate-500">개정 사유:</span>{chg.reason}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div className="px-4 py-2 bg-slate-50 border-t text-[10px] text-slate-400">
                {C.regSystemFooter}
              </div>
            </div>

          </div>
        </div>
        <div ref={bottomRef}/>
      </div>

      {/* 하단 입력창 (추가 질의) */}
      {inputBar()}
    </div>
  );
};

export default InternalRegAgent;
