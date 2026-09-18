import React, { useState } from "react";
import {
  Search, BookMarked, FileText, ChevronRight, Loader2, CheckCircle,
  Radio, Network, Play, RotateCcw, Download, Copy, ChevronDown,
  Filter, Clock, Zap, Star, Tag, BookOpen, Hash, TrendingUp, Eye,
  Sparkles, Lock, Shield, Globe
} from "lucide-react";
import AgentWorkflowPanel from "./AgentWorkflowPanel.jsx";
import { AGENT_TEAMS } from "../../data/constants.js";
import { queryOntology } from "../../ontologyGraph.js";
import { cn, agentHeader } from "../../utils.jsx";

const SEARCH_MODES={
  semantic:{
    label:'시맨틱 검색', shortLabel:'시맨틱 검색', desc:'의미 유사도 기반', action:'시맨틱 검색 시작',
    running:'시맨틱 검색 중', runningDesc:'벡터 임베딩 기반으로 관련 문서를 검색합니다',
    footer:'벡터 임베딩 기반 시맨틱 검색 — 의미적 유사도로 최적 문서를 검색합니다', icon:Zap,
    agents:[
      {icon:Hash, label:'질의 임베딩', sub:'자연어 질의 벡터화 중', color:'bg-violet-600', ms:800},
      {icon:Search, label:'시맨틱 검색', sub:'벡터 DB 유사도 검색 중', color:'bg-blue-600', ms:1600},
      {icon:FileText, label:'결과 랭킹', sub:'관련성 점수 재정렬·발췌 중', color:'bg-indigo-600', ms:900},
    ],
  },
  fulltext:{
    label:'전문 검색 (Full-Text)', shortLabel:'전문 검색', desc:'키워드 정확 매칭 + 위치 표시', action:'전문 검색 시작',
    running:'전문 검색 중', runningDesc:'키워드 매칭으로 문서 내 정확한 위치를 탐색합니다',
    footer:'키워드 전문 검색 — 문서 내 정확한 위치를 탐색합니다', icon:Hash,
    agents:[
      {icon:Hash, label:'질의 토큰화', sub:'검색어 형태소·키워드 분리 중', color:'bg-violet-600', ms:650},
      {icon:Search, label:'전문 색인 검색', sub:'문서 색인과 정확 일치 구간 탐색 중', color:'bg-blue-600', ms:1200},
      {icon:FileText, label:'위치·결과 정렬', sub:'문단 위치와 관련성 순위 계산 중', color:'bg-indigo-600', ms:800},
    ],
  },
  graph:{
    label:'온톨로지 Graph RAG', shortLabel:'Graph RAG', desc:'개념·관계·근거 경로 탐색', action:'Graph RAG 검색 시작',
    running:'온톨로지 Graph RAG 검색 중', runningDesc:'질의 개념을 정규화하고 관계 경로와 근거 문서를 함께 탐색합니다',
    footer:'온톨로지 Graph RAG — 개념과 관계 경로를 근거 문서로 검증합니다', icon:Network,
    agents:[
      {icon:Tag, label:'개체·개념 정규화', sub:'질의를 온톨로지 개념과 연결 중', color:'bg-violet-600', ms:700},
      {icon:Network, label:'관계 경로 탐색', sub:'연결 개념과 최단 관계 경로 탐색 중', color:'bg-blue-600', ms:1400},
      {icon:Shield, label:'근거 무결성 검증', sub:'관계별 출처와 보안 범위 대조 중', color:'bg-indigo-600', ms:900},
    ],
  },
};

const KNOWLEDGE_BASES=[
  {id:'kb1', name:'도로교통정보 수집·운영지침', docs:47, updated:'2026.08.15', icon:BookOpen, color:'violet'},
  {id:'kb2', name:'VDS 장비 운영·정비 매뉴얼', docs:31, updated:'2026.07.10', icon:FileText, color:'blue'},
  {id:'kb3', name:'도로설계기준(KDS 44)', docs:83, updated:'2025.12.01', icon:BookMarked, color:'indigo'},
  {id:'kb4', name:'고속도로 유지관리 지침', docs:38, updated:'2026.06.20', icon:BookOpen, color:'teal'},
  {id:'kb5', name:'고속도로 공사구간 교통관리지침', docs:12, updated:'2026.09.05', icon:FileText, color:'emerald'},
  {id:'kb6', name:'교량·터널 정밀안전점검 지침', docs:24, updated:'2026.05.10', icon:BookOpen, color:'emerald'},
  {id:'kb7', name:'유료도로 통행료 업무편람', docs:18, updated:'2026.08.01', icon:BookOpen, color:'cyan'},
];

const RECENT_SEARCHES=[
  {id:1, query:'VDS 결측률 관리 기준',        date:'2026-09-17 16:20', results:5},
  {id:2, query:'신축이음 변위 관리 임계',      date:'2026-09-16 10:12', results:3},
  {id:3, query:'공사구간 차로 차단 승인 절차', date:'2026-09-15 14:55', results:7},
];

const MOCK_RESULTS=[
  {
    id:1, title:'VDS 수집자료 품질 관리 기준', source:'도로교통정보_수집운영지침.pdf',
    page:12, score:97.3, secLevel:'C', line:'p.12 · 3번째 문단',
    excerpt:`VDS 원시자료는 30초 단위로 수집하고 EX-DataLake에는 5분 집계 단위로 적재한다. 지점별 결측률이 3.0%를 초과하면 품질 이상으로 판정하고 원인 조사를 실시하며, 적재 지연이 3분을 초과하면 EXTIS 운영자에게 자동 경보를 발송한다.`,
    keywords:['VDS','결측률','5분 집계','적재 지연'],
  },
  {
    id:2, title:'검지기 통신 불량 대응 및 현장 점검 절차', source:'VDS_장비_운영정비_매뉴얼.pdf',
    page:28, score:89.1, secLevel:'C', line:'p.28 · 1번째 문단',
    excerpt:`동일 지점의 통신 불량이 3일 이상 누적되면 해당 지점을 자동 보정 대상에서 제외하고 EXMMS에 현장 점검 작업지시를 발행한다. 30분 이내 단기 결측은 인접 지점 속도로 가중 보간하되, 보간 구간은 예측 모델 학습 데이터에서 제외한다.`,
    keywords:['통신 불량','현장 점검','가중 보간','EXMMS'],
  },
  {
    id:3, title:'교량 신축이음 계측 관리 기준', source:'교량·터널_정밀안전점검지침.pdf',
    page:35, score:78.6, secLevel:'C', line:'p.35 · 2번째 문단',
    excerpt:`신축이음 변위의 관리 임계는 15.0 mm로 하며, 계측값이 임계의 80%를 초과하거나 가속도 RMS가 최근 30일간 상승 추세를 보이는 경우 정밀안전진단을 권고한다. 계측 이력은 EXAM에 지점별로 축적한다.`,
    keywords:['신축이음','변위','가속도 RMS','정밀안전진단'],
  },
  {
    id:4, title:'고속국도 설계속도와 구간 운영 기준', source:'도로설계기준(KDS 44)',
    page:3, score:71.2, secLevel:'O', line:'p.3 · 본문',
    excerpt:`고속국도의 설계속도는 지형 조건에 따라 100~120 km/h를 적용한다. 운영 단계의 소통 상태는 구간 평균속도로 판정하며, 40 km/h 미만은 정체, 40 km/h 이상 60 km/h 미만은 서행으로 구분한다.`,
    keywords:['설계속도','고속국도','구간 평균속도','소통 상태'],
  },
  {
    id:5, title:'노면 결빙 취약구간 관리 절차', source:'고속도로_유지관리지침.pdf',
    page:5, score:62.4, secLevel:'O', line:'p.5 · 4번째 문단',
    excerpt:`RWIS 노면온도가 0 ℃ 이하이고 결빙 확률이 주의 임계 0.50을 초과하면 취약구간에 제설 장비를 사전 배치하고 VMS에 결빙 주의 경보를 송출한다. 영동선 대관령 구간 등 상습 결빙 구간은 별도 중점관리 대상으로 지정한다.`,
    keywords:['결빙','RWIS','노면온도','제설'],
  },
];

const AI_SUMMARIES={
  'VDS 결측 데이터 품질 관리 기준 및 조치 절차': `검색 결과 5건에 따르면, VDS 결측률 관리 임계는 3.0%이며 현재 경부선 구간은 4.8%로 임계를 초과한 상태입니다. 동일 지점 통신 불량이 3일 이상 누적되면 자동 보정 대상에서 제외하고 EXMMS에 현장 점검 작업지시를 발행하며, 5분 집계 적재 지연은 3분 이내로 관리합니다.`,
  DEFAULT: `검색 결과를 분석한 결과, 관련 문서 5건에서 연관 내용을 찾았습니다. 상세 내용은 아래 검색 결과를 확인하세요.`,
};

const SIMILAR_DOCS=[
  {title:'도로 유지보수 작업지시 표준 절차', source:'EXMMS_운영매뉴얼.pdf', relevance:84},
  {title:'속도 예측모델 운영·재학습 가이드', source:'ex-speed-lstm_운영가이드.pdf', relevance:79},
  {title:'도로기상정보(RWIS) 활용 지침 제3장', source:'RWIS_활용지침.pdf', relevance:71},
];

const SEC_COLORS={C:'bg-rose-100 text-rose-700',S:'bg-amber-100 text-amber-700',O:'bg-slate-100 text-slate-600'};
const SEC_LABELS={C:'대외비',S:'내부',O:'일반'};

/* 도메인 이관: 도로공사 기본 콘텐츠 — 도메인 팩 agentContent["agent-knowledge"]로 키 단위 오버라이드 */
export const CONTENT_DEFAULTS={
  headerTitle:'지식 검색 에이전트',          // string — 화면 헤더 제목(도메인별 리브랜딩용)
  headerDesc:'도로설계기준·유지관리지침·수집장비 매뉴얼 시맨틱/전문 검색', // string — 헤더 설명
  defaultQuery:'VDS 결측 데이터 품질 관리 기준 및 조치 절차', // string — 검색어 초기값(aiSummaries 키와 일치 권장)
  quickQueries:['소통 상태 판정 기준','신축이음 변위 관리 임계','공사구간 차로 차단 절차','노면 결빙 주의 기준'], // string[4] — 추천 검색어 칩
  knowledgeBases: KNOWLEDGE_BASES,          // {id,name,docs,updated,icon(lucide 컴포넌트),color(tailwind 색상명)}[7] — 지식베이스 목록
  defaultSelectedKbIds:['kb1','kb2','kb3'], // string[3] — 초기 선택 지식베이스 id(knowledgeBases.id와 일치)
  recentSearches: RECENT_SEARCHES,          // {id,query,date,results}[3] — 최근 검색 이력
  results: MOCK_RESULTS,                    // {id,title,source,page,score,secLevel:'C'|'S'|'O',line,excerpt,keywords:string[]}[5] — 검색 결과(score 내림차순)
                                            //   선택 필드 attrs: {label,value,match:boolean}[] — 온톨로지 속성 매칭(제조 도면 등). 없으면 미노출
  aiSummaries: AI_SUMMARIES,                // {[질의문]:요약문, DEFAULT:폴백요약} — 질의별 AI 요약
  similarDocs: SIMILAR_DOCS,                // {title,source,relevance}[3] — 유사 문서 추천
  ontologyPack:null,                        // 선택 — Graph RAG 개념·관계·근거 팩. 생략 시 검색 모드 비노출

  /* 선택(생략 시 해당 UI 비노출) — 온톨로지 기반 산출물 패널.
     '검색'을 넘어 참조 결과로 초안을 만들어내는 도메인(예: 금형 설계)용. */
  outline:null,
  /* outline 스키마:
     { title, subtitle, badge,
       shape: { viewBox, paths:[{d, stroke?, fill?, dash?}], labels:[{x,y,text}] },   // 단순 SVG 스케치
       specs: [{label, value, from}],           // 자동 산출 제원(출처 도면 표기)
       checks: [{label, status:'ok'|'warn'|'fail', detail}],  // 자동 검증(간섭·공차 등)
       effect: {label, before, after, delta},   // 기대 효과(리드타임 등)
       note }                                   // 하단 안내(실서비스 대체 지점 등)
  */
};

const KnowledgeAgent=({onBack,domain})=>{
  const C={...CONTENT_DEFAULTS,...(domain?.agentContent?.["agent-knowledge"]||{})};
  const H=agentHeader(domain,'agent-knowledge',C,AGENT_TEAMS);
  const [step,setStep]=useState(1);
  const [query,setQuery]=useState(C.defaultQuery);
  const [selectedKBs,setSelectedKBs]=useState(new Set(C.defaultSelectedKbIds));
  const [topK,setTopK]=useState('5');
  const [agentIdx,setAgentIdx]=useState(-1);
  const [doneIdx,setDoneIdx]=useState([]);
  const [expanded,setExpanded]=useState(new Set());
  const [histOpen,setHistOpen]=useState(false);
  const [searchMode,setSearchMode]=useState('semantic'); // 'semantic' | 'fulltext' | 'graph'
  const [secFilter,setSecFilter]=useState('all'); // 'all' | 'O' | 'S' | 'C'
  const supportsGraph=Boolean(C.ontologyPack?.nodes?.length&&C.ontologyPack?.edges?.length);
  const availableModes=supportsGraph?Object.entries(SEARCH_MODES):Object.entries(SEARCH_MODES).filter(([key])=>key!=='graph');
  const modeInfo=SEARCH_MODES[searchMode];
  const ModeIcon=modeInfo.icon;
  const searchAgents=modeInfo.agents;

  const toggleKB=(id)=>setSelectedKBs(p=>{
    const n=new Set(p);
    n.has(id)?n.delete(id):n.add(id);
    return n;
  });

  const toggleExpand=(id)=>setExpanded(p=>{
    const n=new Set(p);
    n.has(id)?n.delete(id):n.add(id);
    return n;
  });

  const startSearch=()=>{
    setStep(2);setAgentIdx(0);setDoneIdx([]);
    let delay=0;
    searchAgents.forEach((ag,i)=>{
      delay+=ag.ms;
      setTimeout(()=>{
        setAgentIdx(i+1<searchAgents.length?i+1:-1);
        setDoneIdx(p=>[...p,i]);
        if(i===searchAgents.length-1)setTimeout(()=>setStep(3),500);
      },delay);
    });
  };

  const reset=()=>{setStep(1);setAgentIdx(-1);setDoneIdx([]);setExpanded(new Set());};

  if(step===1)return(
    <div className="flex-1 overflow-y-auto px-6 py-8 bg-white">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-2">
          {onBack&&<button onClick={onBack} className="text-slate-400 hover:text-slate-600 text-[11px] font-bold flex items-center gap-1 shrink-0 py-2 pr-2 max-md:py-2.5">
            <ChevronRight className="w-3.5 h-3.5 rotate-180"/>뒤로
          </button>}
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-md shrink-0">
            <Search className="w-5 h-5 text-white"/>
          </div>
          <div>
            <div className="text-[15px] font-black text-slate-800">{H.title}</div>
            <div className="text-xs text-slate-400">{H.desc}</div>
          </div>
        </div>

        {/* 검색어 입력 */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">1 · 검색어 입력</label>
            <button onClick={()=>setHistOpen(p=>!p)}
              className={cn('flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all',
                histOpen?'bg-violet-600 text-white border-violet-600':'border-slate-200 text-slate-500 hover:border-violet-300 hover:text-violet-600')}>
              <Clock className="w-3.5 h-3.5"/> 최근 검색
            </button>
          </div>

          {histOpen&&(
            <div className="border border-violet-200 rounded-xl bg-violet-50/40 overflow-hidden">
              {C.recentSearches.map(h=>(
                <button key={h.id} onClick={()=>{setQuery(h.query);setHistOpen(false);}}
                  className="w-full text-left px-3 py-2.5 hover:bg-violet-100/60 transition-colors border-b border-violet-100 last:border-0 flex items-center justify-between">
                  <div>
                    <div className="text-[12px] font-medium text-slate-700">{h.query}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{h.date}</div>
                  </div>
                  <span className="text-[10px] text-violet-600 font-bold bg-violet-50 px-1.5 py-0.5 rounded">{h.results}건</span>
                </button>
              ))}
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
            <input
              value={query} onChange={e=>setQuery(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&startSearch()}
              placeholder="검색하고 싶은 내용을 자연어로 입력하세요"
              className="w-full border rounded-xl pl-9 pr-4 py-3 text-sm bg-white outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-100 text-slate-700"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {C.quickQueries.map((q,i)=>(
              <button key={i} onClick={()=>setQuery(q)}
                className="text-[11px] px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 font-medium hover:bg-violet-100 transition-colors">
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* 검색 방식 토글 */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">2 · 검색 방식</label>
          <div className={cn('grid grid-cols-1 gap-2',supportsGraph?'sm:grid-cols-3':'sm:grid-cols-2')}>
            {availableModes.map(([val,{label,desc,icon:Icon}])=>(
              <label key={val} className={cn(
                'flex items-start gap-2.5 px-4 py-3 border-2 rounded-xl cursor-pointer transition-all select-none',
                searchMode===val?'border-violet-400 bg-violet-50 shadow-sm':'border-slate-200 hover:bg-slate-50'
              )}>
                <input type="radio" name="searchmode" value={val} checked={searchMode===val} onChange={()=>setSearchMode(val)} className="sr-only"/>
                <Icon className={cn('w-4 h-4 mt-0.5 shrink-0',searchMode===val?'text-violet-600':'text-slate-400')}/>
                <div>
                  <div className={cn('text-[12px] font-black',searchMode===val?'text-violet-800':'text-slate-600')}>{label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{desc}</div>
                </div>
                {searchMode===val&&<CheckCircle className="w-4 h-4 text-violet-500 ml-auto shrink-0 mt-0.5"/>}
              </label>
            ))}
          </div>
        </div>

        {/* 보안 등급 필터 */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">3 · 보안 등급 필터</label>
          <div className="flex flex-wrap gap-2">
            {[
              {val:'all', label:'전체', color:'bg-slate-600'},
              {val:'O',   label:'일반 (공개)', color:'bg-slate-500'},
              {val:'S',   label:'내부', color:'bg-amber-500'},
              {val:'C',   label:'대외비', color:'bg-rose-500'},
            ].map(({val,label,color})=>(
              <label key={val} className={cn(
                'flex items-center gap-1.5 px-3 py-2 border-2 rounded-xl cursor-pointer transition-all select-none text-[12px] font-bold',
                secFilter===val?color+' text-white border-transparent shadow-sm':'border-slate-200 text-slate-500 hover:bg-slate-50'
              )}>
                <input type="radio" name="secfilter" value={val} checked={secFilter===val} onChange={()=>setSecFilter(val)} className="sr-only"/>
                {val!=='all'&&<Shield className="w-3 h-3"/>}
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* 지식베이스 선택 */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">4 · 검색 범위 선택</label>
          <div className="grid grid-cols-1 gap-2">
            {C.knowledgeBases.map(kb=>{
              const isSelected=selectedKBs.has(kb.id);
              const KBIcon=kb.icon;
              return(
                <label key={kb.id} className={cn(
                  'flex items-center gap-3 px-4 py-3 border rounded-xl cursor-pointer transition-all select-none',
                  isSelected?`bg-${kb.color}-50 border-${kb.color}-300`:'border-slate-200 hover:bg-slate-50'
                )}>
                  <input type="checkbox" checked={isSelected} onChange={()=>toggleKB(kb.id)} className="accent-violet-600 shrink-0"/>
                  <KBIcon className={cn('w-4 h-4 shrink-0',isSelected?`text-${kb.color}-600`:'text-slate-400')}/>
                  <div className="flex-1 min-w-0">
                    <div className={cn('text-[13px] font-bold',isSelected?'text-slate-800':'text-slate-500')}>{kb.name}</div>
                    <div className="text-[10px] text-slate-400">{kb.docs}개 문서 · 최종 업데이트 {kb.updated}</div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Top K */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">5 · 검색 결과 수</label>
          <div className="flex items-center gap-3">
            {['3','5','10'].map(v=>(
              <label key={v} className={cn(
                'flex items-center gap-1.5 px-4 py-2 border rounded-xl cursor-pointer transition-all text-sm font-bold select-none',
                topK===v?'bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-100':'border-slate-200 text-slate-500 hover:bg-slate-50'
              )}>
                <input type="radio" name="topk" value={v} checked={topK===v} onChange={()=>setTopK(v)} className="sr-only"/>
                상위 {v}건
              </label>
            ))}
          </div>
        </div>

        <button onClick={startSearch}
          disabled={!query.trim()}
          className="w-full py-3.5 bg-violet-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-violet-700 transition-colors shadow-lg shadow-violet-100 text-[15px] disabled:opacity-50 disabled:cursor-not-allowed">
          <Search className="w-4 h-4"/>
          {modeInfo.action}
        </button>
      </div>
    </div>
  );

  if(step===2)return(
    <div className="flex-1 flex min-h-0 overflow-hidden">
      <div className="flex-1 min-w-0 flex flex-col items-center justify-center overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-xl px-6">
          <div className="text-center mb-10">
            <div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-100">
              <Radio className="w-7 h-7 text-white animate-pulse"/>
            </div>
            <div className="text-[18px] font-black text-slate-800">
              {modeInfo.running}
            </div>
            <div className="text-sm text-slate-400 mt-1">
              {modeInfo.runningDesc}
            </div>
          </div>
          <div className="space-y-3">
            {searchAgents.map((ag,i)=>{
              const isDone=doneIdx.includes(i);
              const isActive=agentIdx===i;
              const AgIcon=ag.icon;
              return(
                <div key={i}>
                  <div className={cn(
                    'rounded-2xl border-2 p-4 transition-all duration-500',
                    isDone?'border-emerald-200 bg-emerald-50/60':
                    isActive?'border-violet-300 bg-violet-50 shadow-md shadow-violet-100':
                    'border-slate-100 bg-white opacity-50'
                  )}>
                    <div className="flex items-center gap-3">
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all',
                        isDone?'bg-emerald-500':isActive?ag.color:'bg-slate-200')}>
                        {isDone?<CheckCircle className="w-5 h-5 text-white"/>
                          :<AgIcon className={cn('w-5 h-5',isActive?'text-white animate-pulse':'text-slate-400')}/>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={cn('font-black text-sm',isDone?'text-emerald-700':isActive?'text-violet-700':'text-slate-400')}>{ag.label}</div>
                        <div className={cn('text-xs mt-0.5',isDone?'text-emerald-500':isActive?'text-violet-500':'text-slate-300')}>
                          {isActive?`처리 중 — ${ag.sub}`:isDone?`완료 — ${ag.sub}`:ag.sub}
                        </div>
                      </div>
                      {isActive&&<Loader2 className="w-4 h-4 text-violet-500 animate-spin shrink-0"/>}
                      {isDone&&<span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">완료</span>}
                    </div>
                    {isActive&&<div className="mt-3"><div className="h-1 bg-violet-100 rounded-full overflow-hidden"><div className="h-1 bg-violet-500 rounded-full animate-pulse" style={{width:'65%'}}/></div></div>}
                  </div>
                  {i<searchAgents.length-1&&<div className="flex justify-center my-1"><ChevronRight className="w-4 h-4 text-slate-300 rotate-90"/></div>}
                </div>
              );
            })}
          </div>
          <div className="mt-8 text-center text-xs text-slate-400">
            <Network className="w-3.5 h-3.5 inline mr-1 text-violet-400"/>
            {modeInfo.footer}
          </div>
        </div>
      </div>
      <div className="hidden lg:flex w-80 shrink-0 border-l border-slate-100 bg-gradient-to-b from-slate-50 to-white p-4 overflow-y-auto custom-scrollbar flex-col">
        <AgentWorkflowPanel agentId="agent-knowledge" activeStep={agentIdx} doneSteps={doneIdx} />
      </div>
    </div>
  );

  /* ── STEP 3: 결과 ── */
  const graphResult=searchMode==='graph'?queryOntology(C.ontologyPack,query,{
    allowedKbIds:[...selectedKBs],
    maxPaths:Math.min(Number.parseInt(topK,10),4),
  }):null;
  const resultSource=graphResult?.evidence||C.results;
  const allResults=resultSource.slice(0,Number.parseInt(topK,10));
  const topResults=secFilter==='all'?allResults:allResults.filter(r=>r.secLevel===secFilter);
  const aiSummary=graphResult?.summary||C.aiSummaries[query]||C.aiSummaries.DEFAULT;
  const resultStats=graphResult?[
    {label:'매칭 개념',value:`${graphResult.stats.matchedNodes}개`,color:'text-violet-700',bg:'bg-violet-50 border-violet-200'},
    {label:'관계 경로',value:`${graphResult.stats.pathCount}개`,color:'text-emerald-600',bg:'bg-emerald-50 border-emerald-200'},
    {label:'근거 연결률',value:`${graphResult.stats.evidenceCoverage}%`,color:'text-blue-600',bg:'bg-blue-50 border-blue-200'},
  ]:[
    {label:'검색 결과',value:`${topResults.length}건`,color:'text-violet-700',bg:'bg-violet-50 border-violet-200'},
    {label:'최고 유사도',value:`${topResults[0]?.score.toFixed(1)||0}%`,color:'text-emerald-600',bg:'bg-emerald-50 border-emerald-200'},
    {label:'검색 시간',value:'0.38초',color:'text-blue-600',bg:'bg-blue-50 border-blue-200'},
  ];

  return(
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      <div className="shrink-0 bg-white border-b px-5 py-2.5 flex items-center gap-2 flex-wrap shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0"><CheckCircle className="w-3.5 h-3.5 text-white"/></div>
          <div className="min-w-0">
            <div className="text-[13px] font-black text-slate-800 truncate">검색 완료 · {topResults.length}건</div>
            <div className="text-[10px] text-slate-400">
              {modeInfo.shortLabel} 결과 · 검색 시간 0.38초
            </div>
          </div>
        </div>
        <button onClick={reset} className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-[11px] font-bold text-slate-500 hover:bg-slate-50 transition-colors">
          <RotateCcw className="w-3 h-3"/>새 검색
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* 검색어 표시 */}
        <div className="bg-slate-800 rounded-xl px-4 py-3 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0"/>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">검색어</div>
            <div className="text-[13px] text-white">{query}</div>
          </div>
          <span className="shrink-0 text-[10px] font-black text-violet-400 bg-violet-900/40 px-2 py-1 rounded-lg flex items-center gap-1">
            <ModeIcon className="w-3 h-3"/>
            {modeInfo.shortLabel}
          </span>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-3 gap-3">
          {resultStats.map(({label,value,color,bg})=>(
            <div key={label} className={cn('border rounded-xl px-4 py-3 text-center',bg)}>
              <div className={cn('text-[18px] font-black',color)}>{value}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Graph RAG 추론 경로 — 온톨로지 팩과 Graph 모드를 선택한 경우만 노출 */}
        {graphResult&&(
          <div className="bg-white border-2 border-violet-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 bg-violet-50/70 border-b border-violet-100 flex items-center gap-2 flex-wrap">
              <Network className="w-4 h-4 text-violet-600"/>
              <span className="text-[13px] font-black text-slate-800">{graphResult.label}</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-violet-600 text-white font-semibold">{graphResult.version}</span>
              <span className="ml-auto text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg font-bold">
                {graphResult.statusLabel}
              </span>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">질의 해석 · {graphResult.intentLabel}</div>
                <div className="flex flex-wrap gap-1.5">
                  {graphResult.matchedNodes.map(node=>(
                    <span key={node.id} className="text-[10px] px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 font-bold">
                      {node.label}<span className="text-slate-400 font-medium ml-1">{node.type}</span>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">근거가 연결된 관계 경로</div>
                <div className="space-y-2">
                  {graphResult.paths.length===0&&(
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11px] text-amber-700 font-bold">
                      선택한 지식베이스 범위에는 표시할 수 있는 근거 관계 경로가 없습니다.
                    </div>
                  )}
                  {graphResult.paths.map(path=>(
                    <div key={path.id} className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 flex items-center gap-1.5 flex-wrap">
                      {path.nodes.map((node,index)=>(
                        <React.Fragment key={`${path.id}-${node.id}-${index}`}>
                          {index>0&&(
                            <span className="text-[9px] text-violet-600 font-bold flex items-center gap-1">
                              <ChevronRight className="w-3 h-3"/>{path.relations[index-1]}<ChevronRight className="w-3 h-3"/>
                            </span>
                          )}
                          <span className="text-[11px] text-slate-700 font-black bg-white border border-slate-200 px-2 py-1 rounded-lg">{node.label}</span>
                        </React.Fragment>
                      ))}
                      <span className="ml-auto text-[9px] text-emerald-700 font-bold flex items-center gap-1">
                        <Shield className="w-3 h-3"/>근거 {path.evidenceRefs.length}건
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed flex items-start gap-1.5">
                <Lock className="w-3 h-3 shrink-0 mt-0.5"/>{graphResult.notice}
              </p>
            </div>
          </div>
        )}

        {/* AI 요약 카드 */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-indigo-600"/>
            <span className="text-[13px] font-black text-indigo-800">검색 결과 요약</span>
            <span className="ml-auto text-[10px] text-indigo-500">GPT-OSS 120B · {graphResult?'그래프 근거 종합':'검색 결과 생성'}</span>
          </div>
          <p className="text-[12px] text-indigo-700 leading-relaxed">{aiSummary}</p>
        </div>

        {/* 보안 등급 필터 (결과 화면) */}
        {secFilter!=='all'&&(
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-700 font-bold">
            <Shield className="w-3.5 h-3.5"/>
            <span>{SEC_LABELS[secFilter]} 등급 문서만 표시 중</span>
            <button onClick={()=>setSecFilter('all')} className="ml-auto text-amber-600 hover:text-amber-800 underline text-[10px]">전체 보기</button>
          </div>
        )}

        {/* 검색 결과 목록 */}
        <div className="space-y-3">
          {topResults.map((r,idx)=>(
            <div key={r.id} className="bg-white border rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
              <button onClick={()=>toggleExpand(r.id)} className="w-full text-left">
                <div className="px-5 py-4 flex items-start gap-3">
                  <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white text-[12px] font-black shadow-sm',
                    idx===0?'bg-amber-500':idx===1?'bg-slate-500':'bg-slate-400')}>
                    {idx+1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="text-[14px] font-black text-slate-800 leading-snug">{r.title}</div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={cn('text-[10px] font-black px-2 py-0.5 rounded-full',SEC_COLORS[r.secLevel])}>{SEC_LABELS[r.secLevel]}</span>
                        <span className={cn('text-[12px] font-black',r.score>=90?'text-emerald-600':r.score>=75?'text-blue-600':'text-slate-500')}>
                          {r.score.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mb-2">
                      <FileText className="w-3 h-3"/>
                      <span>{r.source}</span>
                      <span>·</span>
                      <span>p.{r.page}</span>
                      {searchMode==='fulltext'&&r.line&&(
                        <>
                          <span>·</span>
                          <span className="text-violet-500 font-bold">{r.line}</span>
                        </>
                      )}
                    </div>
                    <p className={cn('text-[12px] text-slate-600 leading-relaxed',expanded.has(r.id)?'':'line-clamp-2')}>
                      {r.excerpt}
                    </p>
                  </div>
                  <ChevronDown className={cn('w-4 h-4 text-slate-400 shrink-0 mt-1 transition-transform',expanded.has(r.id)&&'rotate-180')}/>
                </div>
              </button>
              {expanded.has(r.id)&&(
                <div className="px-5 pb-4 border-t border-slate-100 pt-3">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {r.keywords.map((kw,ki)=>(
                      <span key={ki} className="text-[10px] px-2.5 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 font-medium flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5"/>{kw}
                      </span>
                    ))}
                  </div>
                  {searchMode==='fulltext'&&r.line&&(
                    <div className="mb-3 px-3 py-2 bg-violet-50 border border-violet-100 rounded-xl flex items-center gap-2">
                      <Hash className="w-3.5 h-3.5 text-violet-500"/>
                      <span className="text-[11px] font-bold text-violet-700">위치: {r.line}</span>
                    </div>
                  )}
                  {/* 온톨로지 속성 매칭 — 팩이 attrs를 공급할 때만 (제조 도면 등 구조화 지식) */}
                  {r.attrs?.length>0&&(
                    <div className="mb-3">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Network className="w-3 h-3"/>온톨로지 속성 매칭
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {r.attrs.map((a,ai)=>(
                          <div key={ai} className={cn('px-2.5 py-1.5 rounded-lg border text-[10px]',
                            a.match?'bg-emerald-50 border-emerald-200':'bg-slate-50 border-slate-200')}>
                            <div className="text-slate-400 font-medium">{a.label}</div>
                            <div className={cn('font-black flex items-center gap-1 mt-0.5',a.match?'text-emerald-700':'text-slate-600')}>
                              {a.match&&<CheckCircle className="w-2.5 h-2.5 shrink-0"/>}
                              <span className="truncate">{a.value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* 검색 점수 바 */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 w-16 shrink-0">{graphResult?'근거 점수':'유사도'}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div className="h-2 rounded-full bg-violet-500 transition-all" style={{width:`${r.score}%`}}/>
                    </div>
                    <span className="text-[11px] font-black text-violet-600 w-12 text-right">{r.score.toFixed(1)}%</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 온톨로지 산출물 — 설계 아웃라인 (팩이 outline을 공급할 때만 노출) */}
        {C.outline&&(
          <div className="bg-white border-2 border-violet-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 bg-violet-50/70 border-b border-violet-100 flex items-center gap-2 flex-wrap">
              <Sparkles className="w-4 h-4 text-violet-600 shrink-0"/>
              <span className="text-[13px] font-bold text-slate-800">{C.outline.title}</span>
              {C.outline.badge&&(
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-violet-600 text-white font-semibold shrink-0">{C.outline.badge}</span>
              )}
              {C.outline.subtitle&&(
                <span className="ml-auto text-[10px] text-slate-500 font-medium truncate">{C.outline.subtitle}</span>
              )}
            </div>

            {/* 도면 스케치 + 자동 산출 제원 */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 p-4">
              {C.outline.shape&&(
                <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">자동 생성 아웃라인 (개념도)</div>
                  <svg viewBox={C.outline.shape.viewBox} className="w-full h-44" role="img" aria-label="자동 생성된 설계 아웃라인 개념도">
                    {C.outline.shape.paths.map((p,pi)=>(
                      <path key={pi} d={p.d} fill={p.fill||'none'} stroke={p.stroke||'#7c3aed'} strokeWidth={p.width||1.5}
                        strokeDasharray={p.dash||undefined} strokeLinejoin="round"/>
                    ))}
                    {(C.outline.shape.labels||[]).map((l,li)=>(
                      <text key={li} x={l.x} y={l.y} fontSize={l.size||9} fill={l.color||'#64748b'} textAnchor={l.anchor||'middle'}>{l.text}</text>
                    ))}
                  </svg>
                </div>
              )}
              {C.outline.specs?.length>0&&(
                <div className="lg:col-span-2 space-y-1.5">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">자동 산출 제원</div>
                  {C.outline.specs.map((s,si)=>(
                    <div key={si} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white">
                      <span className="text-[11px] text-slate-500 font-medium shrink-0 w-20 truncate">{s.label}</span>
                      <span className="text-[12px] font-bold text-slate-800 font-mono tabular-nums flex-1 min-w-0 truncate">{s.value}</span>
                      {s.from&&<span className="text-[9px] text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded shrink-0">{s.from}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 자동 검증 (간섭·공차 등) */}
            {C.outline.checks?.length>0&&(
              <div className="px-4 pb-4">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">설계 자동 검증</div>
                <div className="space-y-1.5">
                  {C.outline.checks.map((c,ci)=>{
                    const tone=c.status==='ok'?{bg:'bg-emerald-50 border-emerald-200',t:'text-emerald-700',Icon:CheckCircle}
                      :c.status==='warn'?{bg:'bg-amber-50 border-amber-200',t:'text-amber-700',Icon:Shield}
                      :{bg:'bg-rose-50 border-rose-200',t:'text-rose-700',Icon:Shield};
                    const TIcon=tone.Icon;
                    return(
                      <div key={ci} className={cn('flex items-start gap-2 px-3 py-2 rounded-lg border',tone.bg)}>
                        <TIcon className={cn('w-3.5 h-3.5 shrink-0 mt-px',tone.t)}/>
                        <div className="min-w-0 flex-1">
                          <span className={cn('text-[11px] font-bold',tone.t)}>{c.label}</span>
                          {c.detail&&<span className="text-[11px] text-slate-500 ml-1.5">{c.detail}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 기대 효과 + 안내 */}
            {(C.outline.effect||C.outline.note)&&(
              <div className="px-4 pb-4 space-y-2">
                {C.outline.effect&&(
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900">
                    <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0"/>
                    <span className="text-[11px] text-slate-300 font-medium shrink-0">{C.outline.effect.label}</span>
                    <span className="ml-auto flex items-center gap-2 shrink-0">
                      <span className="text-[12px] text-slate-500 line-through font-mono tabular-nums">{C.outline.effect.before}</span>
                      <ChevronRight className="w-3 h-3 text-slate-600"/>
                      <span className="text-[15px] font-black text-white font-mono tabular-nums">{C.outline.effect.after}</span>
                      {C.outline.effect.delta&&(
                        <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full">{C.outline.effect.delta}</span>
                      )}
                    </span>
                  </div>
                )}
                {C.outline.note&&(
                  <p className="text-[10px] text-slate-400 leading-relaxed flex items-start gap-1.5">
                    <Lock className="w-3 h-3 shrink-0 mt-0.5"/>{C.outline.note}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* 유사 문서 추천 */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-500"/>
            <span className="text-[13px] font-black text-slate-700">유사 문서 추천</span>
            <span className="ml-auto text-[10px] text-slate-400">관련성 기반 자동 추천</span>
          </div>
          <div className="divide-y divide-slate-100">
            {C.similarDocs.map((doc,i)=>(
              <div key={i} className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-violet-50 border border-violet-200 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-violet-500"/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-slate-700 leading-snug">{doc.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{doc.source}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-[13px] font-black text-violet-600">{doc.relevance}%</div>
                  <div className="text-[9px] text-slate-400">관련성</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0"/>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center py-2">
          <button onClick={reset} className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl text-[13px] font-black hover:bg-violet-700 transition-colors shadow-md shadow-violet-100">
            <RotateCcw className="w-4 h-4"/>새 검색
          </button>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeAgent;
