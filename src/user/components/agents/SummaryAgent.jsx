import React, { useState, useRef } from "react";
import {
  FileText, UploadCloud, X, Play, RotateCcw, Download, Copy,
  ChevronRight, Loader2, CheckCircle, AlignLeft, List, Layers,
  Tag, BarChart2, ChevronDown, ChevronUp, Hash, BookOpen,
  ArrowLeftRight, GitCompareArrows, TableProperties, Plus
} from "lucide-react";
import AgentWorkflowPanel from "./AgentWorkflowPanel.jsx";
import { AGENT_TEAMS } from "../../data/constants.js";
import { useAgentSimulation } from "../../hooks/useAgentSimulation.js";
import { cn, downloadTextFile, agentHeader } from "../../utils.jsx";


const AGENTS=[
  {icon:Layers,    label:'구조 파악 에이전트',  sub:'문서 구조 및 핵심 주제 파악 중',   color:'bg-amber-600',  ms:2000},
  {icon:AlignLeft, label:'요약 LLM 에이전트',    sub:'Llama-3-Korean 70B 요약 생성 중',  color:'bg-orange-600', ms:3200},
  {icon:Hash,      label:'키워드 분석기',         sub:'EXAONE 3.0 핵심 키워드 추출 중',   color:'bg-yellow-600', ms:1800},
];

const SUMMARY_TYPES=[
  {id:'핵심',label:'핵심 요약',desc:'핵심 내용만 3~5줄',        border:'border-blue-400',   bg:'bg-blue-50',    badge:'bg-blue-100 text-blue-700',    dot:'bg-blue-500'},
  {id:'상세',label:'상세 요약',desc:'섹션별 구조화 요약',       border:'border-green-400',  bg:'bg-green-50',   badge:'bg-green-100 text-green-700',  dot:'bg-green-500'},
  {id:'불릿',label:'불릿 포인트',desc:'중요 항목 체계적 나열',  border:'border-purple-400', bg:'bg-purple-50',  badge:'bg-purple-100 text-purple-700', dot:'bg-purple-500'},
  {id:'표형식',label:'표 형식',desc:'항목별 비교 표 출력',      border:'border-teal-400',   bg:'bg-teal-50',    badge:'bg-teal-100 text-teal-700',    dot:'bg-teal-500'},
];

/* Mock comparison data for 문서 비교 요약 */
const COMPARE_ROWS=[
  {category:'적용 대상',docA:'전국 고속도로 VDS 전 지점',docB:'수도권본부 관할 구간 우선 적용',diff:'범위 조정'},
  {category:'수집 주기',docA:'원시자료 30초 · 집계 5분',docB:'원시자료 30초 · 집계 5분 (동일)',diff:'동일'},
  {category:'결측률 관리',docA:'3.0% 초과 시 원인 조사',docB:'3.0% 유지 + 통신 불량 3일 이상 시 EXMMS 작업지시 자동 발행',diff:'조치 자동화'},
  {category:'적재 지연',docA:'3분 초과 시 운영자 경보',docB:'3분 초과 시 운영자 경보 + 자동 재적재',diff:'절차 추가'},
  {category:'소통 상태 판정',docA:'정체 40 km/h 미만 · 서행 60 km/h 미만',docB:'정체 40 km/h 미만 · 서행 60 km/h 미만 (동일)',diff:'동일'},
  {category:'예측모델 재학습',docA:'분기 1회 정기 재학습',docB:'드리프트 지수 0.9 도달 시 조기 착수',diff:'주기 단축'},
  {category:'검지 지연 목표',docA:'60초 이내',docB:'45초 이내',diff:'목표 강화'},
  {category:'원자료 보존',docA:'1년간 보존',docB:'3년간 보존 (AI 학습 활용)',diff:'기간 연장'},
];

const LENGTHS=['100자','300자','500자','1000자'];
const FOCUS_CHIPS=['핵심 결론','수치·데이터','법적 근거','일정·기한','위험 요소','실행 항목'];

const KEYWORDS=[
  {word:'VDS',pct:94},{word:'결측률',pct:88},{word:'5분 집계',pct:81},
  {word:'교통정보',pct:76},{word:'수집운영지침',pct:72},{word:'적재 지연',pct:68},
  {word:'소통 상태',pct:64},{word:'프로브 자료',pct:59},{word:'이상치 판정',pct:54},
  {word:'예측모델',pct:49},{word:'VMS 표출',pct:45},{word:'EX-DataLake',pct:41},
];

const KEYWORD_COLORS=[
  'bg-amber-100 text-amber-800','bg-orange-100 text-orange-800',
  'bg-yellow-100 text-yellow-800','bg-lime-100 text-lime-800',
  'bg-green-100 text-green-800','bg-teal-100 text-teal-800',
];

const SECTIONS=[
  {id:'1',title:'제1장 총칙',children:['제1조 목적','제2조 정의','제3조 적용 범위']},
  {id:'2',title:'제2장 수집 기준',children:['제4조 수집 주기','제5조 검지기 설치 기준','제6조 프로브 자료 수집']},
  {id:'3',title:'제3장 품질 관리',children:['제7조 결측률 관리','제8조 이상치 판정','제9조 결측 보정']},
  {id:'4',title:'제4장 가공 및 제공',children:['제10조 5분 집계','제11조 소통 상태 판정','제12조 VMS·ROADPLUS 제공']},
  {id:'5',title:'제5장 보칙',children:['제13조 장애 보고','제14조 기록 관리']},
];

const SUMMARY_CONTENT=`**제1장 총칙**
본 지침은 고속도로 교통정보의 수집·가공·제공 절차와 품질 기준을 규정한다. 적용 대상은 전국 고속도로에 설치된 VDS와 프로브 수집 체계이며, 수집 자료는 EX-DataLake에 **5분 집계** 단위로 적재한다. 일 수집량은 **2,840만 건** 규모이다.

**제2장 수집 기준**
VDS 원시자료는 **30초 단위**로 수집하며, 집계 자료의 적재 지연은 **3분 이내**로 관리한다. 지연이 임계를 초과하면 EXTIS 운영자에게 자동 경보를 발송한다. 현재 최대 적재 지연은 **4분 12초**로 임계를 초과한 상태이다.

**제3장 품질 관리**
지점별 결측률 관리 임계는 **3.0%**이며, 초과 시 품질 이상으로 판정하고 원인 조사를 실시한다. 30분 이내 단기 결측은 인접 지점 속도로 가중 보간하고, 동일 지점의 통신 불량이 **3일 이상** 누적되면 자동 보정 대상에서 제외한다.

**제4장 가공 및 제공**
소통 상태는 구간 평균속도로 판정하며 **40 km/h 미만은 정체**, 60 km/h 미만은 서행으로 구분한다. 판정 결과와 속도 예측(ex-speed-lstm v2.3, 30분 MAE **4.7 km/h**)은 VMS와 ROADPLUS로 제공한다.

**제5장 보칙**
수집 장애는 인지 즉시 EXTIS 운영자에게 보고하고 조치 이력을 EXMMS에 등록한다. 수집 원자료는 **1년간 보존**하며, 보존 기간 경과 자료는 집계 단위로만 유지한다.`;

/* 도메인 이관: 도로공사 기본 콘텐츠 — 도메인 팩 agentContent["agent-summary"]로 키 단위 오버라이드 */
export const CONTENT_DEFAULTS={
  headerTitle:'문서 요약 에이전트',                        // string — 미제공 시 허브 카탈로그 이름 승계
  headerDesc:'문서 업로드 → 멀티 에이전트 분석 → 구조화 요약 생성', // string — 헤더 설명(작업 흐름)
  docAName:'도로교통정보_수집운영지침.pdf',                  // 업로드 mock 문서 A 파일명
  docBName:'도로교통정보_수집운영지침_개정안.pdf',           // 업로드 mock 문서 B 파일명 (비교 모드)
  resultDocLabel:'도로교통정보_수집운영지침.pdf',            // 결과 헤더 문서명 (단일)
  resultCompareLabel:'수집운영지침.pdf  vs  수집운영지침_개정안.pdf',// 결과 헤더 문서명 (비교 모드)
  structureHints:['제1장 총칙','제2장 수집 기준','제3장 품질 관리','제4장 가공 및 제공...'], // string[4] — step2 구조 파악 칩
  summaryStats:[                                             // {label,val}[4] — 단일 요약 통계 카드
    {label:'원문',val:'18,240자'},
    {label:'요약',val:'860자'},
    {label:'압축률',val:'95.3%'},
    {label:'섹션',val:'5개'},
  ],
  compareStats:[                                             // {label,val}[4] — 비교 모드 통계 카드
    {label:'비교 항목',val:'8개'},
    {label:'변경 항목',val:'6개'},
    {label:'동일 항목',val:'2개'},
    {label:'주요 차이',val:'기준 강화'},
  ],
  compareRows:COMPARE_ROWS,                                  // {category,docA,docB,diff}[8] — diff '동일'이면 회색, 그 외 붉은 배지
  docALabel:'문서 A (현행)',                                 // 비교 표 헤더 좌측
  docBLabel:'문서 B (개정안)',                               // 비교 표 헤더 우측
  compareFootnote:'Llama-3-Korean 70B 분석 · 주요 변경: 결측 조치 자동화, 재학습 주기 단축, 검지 지연 목표 강화', // 비교 표 하단 각주
  tableSummaryRows:[                                         // {ch,content,key}[5] — 표 형식 요약 행
    {ch:'제1장 총칙',   content:'고속도로 교통정보 수집·가공·제공 절차 및 품질 기준 규정',  key:'일 수집량 2,840만 건'},
    {ch:'제2장 수집',   content:'VDS 원시자료 30초 수집 · EX-DataLake 5분 집계 적재',    key:'적재 지연 임계 3분'},
    {ch:'제3장 품질',   content:'지점별 결측률 관리 · 이상치 판정 · 단기 결측 가중 보간', key:'결측률 임계 3.0%'},
    {ch:'제4장 제공',   content:'소통 상태 판정 후 VMS·ROADPLUS 표출 · 속도 예측 제공',  key:'정체 판정 40 km/h'},
    {ch:'제5장 보칙',   content:'수집 장애 보고 체계 · 조치 이력 EXMMS 등록 · 기록 관리', key:'원자료 1년 보존'},
  ],
  keywords:KEYWORDS,                                         // {word,pct(number)}[12] — 핵심 키워드 칩
  sections:SECTIONS,                                         // {id,title,children:string[]}[5] — 문서 구조 맵
  summaryContent:SUMMARY_CONTENT,                            // '**헤더**\n본문' 블록을 빈 줄(\n\n)로 구분, **굵게** 마크업 사용
};

const SectionTree=({sections})=>{
  const [open,setOpen]=useState({});
  const toggle=(id)=>setOpen(p=>({...p,[id]:!p[id]}));
  return(
    <div className="space-y-1">
      {sections.map(s=>(
        <div key={s.id} className="border border-slate-100 rounded-lg overflow-hidden">
          <button onClick={()=>toggle(s.id)} className="w-full flex items-center justify-between px-3 py-2 bg-amber-50 hover:bg-amber-100 transition-colors text-left">
            <span className="text-xs font-bold text-amber-800">{s.title}</span>
            {open[s.id]?<ChevronUp className="w-3.5 h-3.5 text-amber-500"/>:<ChevronDown className="w-3.5 h-3.5 text-amber-500"/>}
          </button>
          {open[s.id]&&(
            <div className="px-3 py-1.5 bg-white space-y-0.5">
              {s.children.map((c,i)=>(
                <div key={i} className="flex items-center gap-2 text-xs text-slate-600 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-300 flex-shrink-0"/>
                  {c}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const SummaryAgent=({onBack,domain})=>{
  const C={...CONTENT_DEFAULTS,...(domain?.agentContent?.["agent-summary"]||{})};
  const H=agentHeader(domain,'agent-summary',C,AGENT_TEAMS);
  const {step,setStep,agentIdx,doneIdx,start:startSim,resetSim}=useAgentSimulation(AGENTS);
  const [inputMode,setInputMode]=useState('file');
  const [textInput,setTextInput]=useState('');
  const [fileDrag,setFileDrag]=useState(false);
  const [compareMode,setCompareMode]=useState(false);
  const [summaryType,setSummaryType]=useState('상세');
  const [targetLength,setTargetLength]=useState('300자');
  const [language,setLanguage]=useState('한국어');
  const [focusAreas,setFocusAreas]=useState([]);
  const [copied,setCopied]=useState(false);
  const [downloaded,setDownloaded]=useState(false);
  const [uploaded,setUploaded]=useState(null);   // 업로드한 문서 A {name,size}
  const fileRef=useRef(null);

  const toggleFocus=(f)=>setFocusAreas(p=>p.includes(f)?p.filter(x=>x!==f):[...p,f]);

  const startProcess=()=>startSim();

  const reset=()=>{resetSim();setCopied(false);};

  const handleCopy=()=>{
    navigator.clipboard?.writeText(C.summaryContent.replace(/\*\*/g,''));
    setCopied(true);
    setTimeout(()=>setCopied(false),2000);
  };

  const handleDownloadTxt=()=>{
    downloadTextFile('문서요약.txt',C.summaryContent.replace(/\*\*/g,''));
    setDownloaded(true);
    setTimeout(()=>setDownloaded(false),2000);
  };

  const selectedType=SUMMARY_TYPES.find(t=>t.id===summaryType);

  /* ── STEP 1 ── */
  if(step===1) return(
    <div className="flex-1 overflow-y-auto px-6 py-8 bg-white">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* header */}
        <div className="flex items-center gap-3 mb-2">
          <button onClick={onBack} aria-label="뒤로 가기" className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
            <ChevronRight className="w-4 h-4 text-slate-500 rotate-180"/>
          </button>
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-md">
            <BookOpen className="w-5 h-5 text-white"/>
          </div>
          <div>
            <div className="text-[15px] font-black text-slate-800">{H.title}</div>
            <div className="text-xs text-slate-400">{H.desc}</div>
          </div>
        </div>

        {/* input mode toggle */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">입력 방식</div>
            {/* 문서 비교 요약 모드 */}
            <button
              onClick={()=>setCompareMode(p=>!p)}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all',
                compareMode?'bg-indigo-600 text-white border-indigo-600 shadow-sm':'border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-600')}>
              <ArrowLeftRight className="w-3.5 h-3.5"/>
              문서 비교 요약
            </button>
          </div>
          {compareMode&&(
            <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-700 font-medium">
              <ArrowLeftRight className="w-3.5 h-3.5 shrink-0 text-indigo-500"/>
              두 문서의 내용을 AI가 분석하여 차이점·공통점을 표로 비교합니다
            </div>
          )}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit">
            {['파일 업로드','텍스트 직접 입력'].map(m=>(
              <button key={m} onClick={()=>setInputMode(m==='파일 업로드'?'file':'text')}
                className={cn('px-4 py-1.5 rounded-md text-xs font-bold transition-all',
                  (m==='파일 업로드'?inputMode==='file':inputMode==='text')
                    ?'bg-white text-amber-700 shadow-sm':'text-slate-500 hover:text-slate-700')}>
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* file upload area */}
        {inputMode==='file'&&(
          <div className="space-y-3">
            <div onDragOver={e=>{e.preventDefault();setFileDrag(true);}} onDragLeave={()=>setFileDrag(false)}
              onDrop={e=>{e.preventDefault();setFileDrag(false);}}
              className={cn('border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all',
                fileDrag?'border-amber-400 bg-amber-50':'border-slate-200 bg-slate-50 hover:border-amber-300 hover:bg-amber-50/40')}
              onClick={()=>fileRef.current?.click()}>
              <UploadCloud className={cn('w-8 h-8 mx-auto mb-2',fileDrag?'text-amber-500':'text-slate-300')}/>
              <div className="text-sm font-semibold text-slate-600">파일을 드래그하거나 클릭하여 업로드</div>
              <div className="text-xs text-slate-400 mt-1">PDF, DOCX, HWP, PPTX 지원 · 최대 50MB</div>
              <input ref={fileRef} type="file" accept=".pdf,.docx,.hwp,.pptx" className="hidden"
                onChange={e=>{const f=e.target.files?.[0]; if(!f)return;
                  setUploaded({name:f.name,size:`${(f.size/1024/1024).toFixed(1)}MB`}); e.target.value='';}}/>
            </div>
            {/* mock uploaded file(s) */}
            <div className={cn('flex gap-3', compareMode ? 'flex-col' : '')}>
              <div className={cn('flex items-center gap-3 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl', compareMode ? '' : '')}>
                {compareMode&&<div className="text-[10px] font-black text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded shrink-0">문서 A</div>}
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-white"/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-700 truncate">{uploaded?.name||C.docAName}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{uploaded?`${uploaded.size} · 업로드 완료`:'3.2MB · PDF · 업로드 완료'}</div>
                </div>
                <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-3 h-3 text-white"/>
                </div>
              </div>
              {compareMode&&(
                <>
                  <div className="flex items-center justify-center gap-2 text-[10px] font-black text-indigo-400">
                    <div className="flex-1 h-px bg-indigo-100"/><ArrowLeftRight className="w-3.5 h-3.5"/><div className="flex-1 h-px bg-indigo-100"/>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2.5 bg-indigo-50 border border-indigo-200 rounded-xl">
                    <div className="text-[10px] font-black text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded shrink-0">문서 B</div>
                    <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-white"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-700 truncate">{C.docBName}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">2.8MB · PDF · 업로드 완료</div>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-white"/>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* text input area */}
        {inputMode==='text'&&(
          <textarea value={textInput} onChange={e=>setTextInput(e.target.value)} rows={7}
            placeholder="요약할 텍스트를 붙여넣거나 직접 입력하세요..."
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none placeholder:text-slate-300"/>
        )}

        {/* summary type selector */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">요약 유형</div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {SUMMARY_TYPES.map(t=>(
              <button key={t.id} onClick={()=>setSummaryType(t.id)}
                className={cn('border-2 rounded-xl p-3 text-left transition-all',
                  summaryType===t.id?`${t.border} ${t.bg} shadow-sm`:'border-slate-200 bg-white hover:border-slate-300')}>
                <div className={cn('w-2 h-2 rounded-full mb-2',t.dot)}/>
                <div className="text-xs font-black text-slate-800">{t.label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* target length */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">목표 길이</div>
          <div className="flex gap-2 flex-wrap">
            {LENGTHS.map(l=>(
              <button key={l} onClick={()=>setTargetLength(l)}
                className={cn('px-4 py-1.5 rounded-full text-xs font-bold border transition-all',
                  targetLength===l
                    ?'bg-amber-500 text-white border-amber-500 shadow-sm'
                    :'bg-white text-slate-600 border-slate-200 hover:border-amber-300')}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* language toggle */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">출력 언어</div>
          <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit">
            {['한국어','영어'].map(lang=>(
              <button key={lang} onClick={()=>setLanguage(lang)}
                className={cn('px-5 py-1.5 rounded-md text-xs font-bold transition-all',
                  language===lang?'bg-white text-amber-700 shadow-sm':'text-slate-500 hover:text-slate-700')}>
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* focus areas */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">집중 분야 <span className="font-normal text-slate-400 normal-case">(선택)</span></div>
          <div className="flex gap-2 flex-wrap">
            {FOCUS_CHIPS.map(f=>(
              <button key={f} onClick={()=>toggleFocus(f)}
                className={cn('px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                  focusAreas.includes(f)
                    ?'bg-amber-500 text-white border-amber-500'
                    :'bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-700')}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* start button */}
        <button onClick={startProcess}
          className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all">
          <Play className="w-4 h-4"/>요약 시작
        </button>
      </div>
    </div>
  );

  /* ── STEP 2 ── */
  if(step===2) return(
    <div className="flex-1 flex min-h-0 overflow-hidden">
      <div className="flex-1 min-w-0 flex flex-col items-center justify-center overflow-y-auto custom-scrollbar">
        <div className="max-w-xl w-full px-6 py-8 space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center mx-auto shadow-md mb-3">
              <BookOpen className="w-6 h-6 text-white"/>
            </div>
            <div className="text-base font-black text-slate-800">문서 요약 처리 중</div>
            <div className="text-xs text-slate-400 mt-1">멀티 에이전트 파이프라인이 순차적으로 문서를 분석하고 있습니다</div>
          </div>

          <div className="space-y-3">
            {AGENTS.map((ag,i)=>{
              const Icon=ag.icon;
              const isDone=doneIdx.includes(i);
              const isActive=agentIdx===i;
              return(
                <div key={i} className={cn('rounded-xl border-2 p-4 transition-all',
                  isDone?'border-green-200 bg-green-50':isActive?'border-amber-300 bg-amber-50':'border-slate-100 bg-slate-50')}>
                  <div className="flex items-center gap-3">
                    <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                      isDone?'bg-green-500':isActive?ag.color:'bg-slate-200')}>
                      {isDone?<CheckCircle className="w-4 h-4 text-white"/>:
                       isActive?<Loader2 className="w-4 h-4 text-white animate-spin"/>:
                       <Icon className="w-4 h-4 text-slate-400"/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn('text-xs font-black',isDone?'text-green-700':isActive?'text-slate-800':'text-slate-400')}>
                        {ag.label}
                      </div>
                      <div className={cn('text-[11px] mt-0.5',isDone?'text-green-600':isActive?'text-amber-600':'text-slate-400')}>
                        {isDone?'완료':isActive?ag.sub:'대기 중'}
                      </div>
                      {/* structure discovery hint for first agent */}
                      {isActive&&i===0&&(
                        <div className="mt-2 flex flex-wrap gap-1">
                          {C.structureHints.map((s,si)=>(
                            <span key={si} className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-semibold animate-pulse">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    {isDone&&<span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full flex-shrink-0">완료</span>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className="bg-amber-500 h-2 rounded-full transition-all duration-700"
              style={{width:`${Math.round((doneIdx.length/AGENTS.length)*100)}%`}}/>
          </div>
          <div className="text-center text-xs text-slate-400">{doneIdx.length}/{AGENTS.length} 에이전트 완료</div>
        </div>
      </div>
      <div className="hidden lg:flex w-80 shrink-0 border-l border-slate-100 bg-gradient-to-b from-slate-50 to-white p-4 overflow-y-auto custom-scrollbar flex-col">
        <AgentWorkflowPanel agentId="agent-summary" activeStep={agentIdx} doneSteps={doneIdx} />
      </div>
    </div>
  );

  /* ── STEP 3 ── */
  return(
    <div className="flex-1 overflow-y-auto px-6 py-8 bg-slate-50">
      <div className="max-w-3xl mx-auto space-y-4">

        {/* 액션 버튼 (문서 위) */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleCopy}
            className={cn('flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all',
              copied?'bg-amber-500 text-white border-amber-500':'bg-white text-slate-600 border-slate-200 hover:border-amber-400 hover:text-amber-700')}>
            <Copy className="w-3.5 h-3.5"/>{copied?'복사됨!':'복사'}
          </button>
          <button onClick={handleDownloadTxt}
            className={cn('flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all',
              downloaded?'bg-emerald-50 border-emerald-300 text-emerald-700':'border-slate-200 bg-white text-slate-600 hover:border-amber-400 hover:text-amber-700')}>
            <Download className="w-3.5 h-3.5"/>{downloaded?'내려받음':'TXT 다운로드'}
          </button>
          <button onClick={reset}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:border-amber-400 hover:text-amber-700 transition-all">
            <RotateCcw className="w-3.5 h-3.5"/>새 요약
          </button>
          <button onClick={()=>setStep(1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-sm ml-auto">
            <AlignLeft className="w-3.5 h-3.5"/>다른 형식으로 재요약
          </button>
        </div>

        {/* 결과 메타 헤더 */}
        <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-amber-500 flex items-center justify-center shrink-0">
                  <AlignLeft className="w-3.5 h-3.5 text-white"/>
                </div>
                <span className="text-[15px] font-black text-slate-800">{compareMode?'문서 비교 요약':'문서 요약'}</span>
              </div>
              <div className="text-[12px] text-slate-400">{compareMode?C.resultCompareLabel:C.resultDocLabel}</div>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap justify-end shrink-0">
              {compareMode&&<span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-700">비교 모드</span>}
              {selectedType&&<span className={cn('px-2.5 py-1 rounded-full text-[11px] font-bold',selectedType.badge)}>{selectedType.label}</span>}
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700">{targetLength}</span>
            </div>
          </div>

          {/* stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-100">
          {(compareMode?C.compareStats:C.summaryStats).map(s=>(
            <div key={s.label} className={cn('border rounded-xl p-2.5 text-center', compareMode?'bg-indigo-50 border-indigo-100':'bg-amber-50 border-amber-100')}>
              <div className={cn('text-xs font-black', compareMode?'text-indigo-700':'text-amber-700')}>{s.val}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
          </div>
        </div>{/* /결과 메타 헤더 */}

        {/* 문서 비교 요약 table */}
        {compareMode&&(
          <div className="border border-indigo-200 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600">
              <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-200"/>
              <span className="text-[12px] font-black text-white">항목별 비교 분석</span>
              <span className="ml-auto text-[10px] text-indigo-200">AI 자동 비교 · {C.compareRows.length}개 항목</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px] border-collapse">
                <thead>
                  <tr className="bg-indigo-50">
                    <th className="text-left px-3 py-2 font-black text-indigo-800 w-28 border-b border-indigo-100">비교 항목</th>
                    <th className="text-left px-3 py-2 font-black text-amber-700 border-b border-indigo-100">
                      <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"/>{C.docALabel}</span>
                    </th>
                    <th className="text-left px-3 py-2 font-black text-indigo-700 border-b border-indigo-100">
                      <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"/>{C.docBLabel}</span>
                    </th>
                    <th className="text-center px-3 py-2 font-black text-slate-500 border-b border-indigo-100 w-20">변경 여부</th>
                  </tr>
                </thead>
                <tbody>
                  {C.compareRows.map((row,i)=>(
                    <tr key={i} className={i%2===0?'bg-white':'bg-slate-50/40'} style={{borderBottom:'1px solid #e0e7ff'}}>
                      <td className="px-3 py-2.5 font-bold text-slate-700">{row.category}</td>
                      <td className="px-3 py-2.5 text-slate-600">{row.docA}</td>
                      <td className="px-3 py-2.5 text-slate-700 font-medium">{row.docB}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-black', row.diff==='동일'?'bg-slate-100 text-slate-500':'bg-rose-100 text-rose-700')}>
                          {row.diff}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2.5 bg-indigo-50 border-t border-indigo-100 text-[10px] text-indigo-500">
              {C.compareFootnote}
            </div>
          </div>
        )}

        {/* 표 형식 요약 */}
        {summaryType==='표형식'&&!compareMode&&(
          <div className="border border-teal-200 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-teal-600">
              <TableProperties className="w-3.5 h-3.5 text-teal-200"/>
              <span className="text-[12px] font-black text-white">표 형식 요약</span>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full text-[12px] border-collapse">
              <thead>
                <tr className="bg-teal-50">
                  <th className="text-left px-3 py-2 font-black text-teal-800 border-b border-teal-100 w-28">장</th>
                  <th className="text-left px-3 py-2 font-black text-teal-800 border-b border-teal-100">핵심 내용</th>
                  <th className="text-left px-3 py-2 font-black text-teal-800 border-b border-teal-100 w-28">주요 기준</th>
                </tr>
              </thead>
              <tbody>
                {C.tableSummaryRows.map((r,i)=>(
                  <tr key={i} className={i%2===0?'bg-white':'bg-teal-50/30'} style={{borderBottom:'1px solid #99f6e4'}}>
                    <td className="px-3 py-2.5 font-bold text-teal-700">{r.ch}</td>
                    <td className="px-3 py-2.5 text-slate-600">{r.content}</td>
                    <td className="px-3 py-2.5 text-[11px] font-bold text-teal-600 bg-teal-50 rounded">{r.key}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {/* main summary content — hidden in compare/table modes */}
        {!compareMode&&summaryType!=='표형식'&&<div className="border border-slate-200 rounded-xl bg-slate-50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlignLeft className="w-4 h-4 text-amber-600"/>
            <span className="text-xs font-black text-slate-700 uppercase tracking-wide">요약 내용</span>
          </div>
          <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
            {C.summaryContent.split('\n\n').map((block,bi)=>{
              const lines=block.split('\n');
              const header=lines[0].replace(/\*\*/g,'');
              const body=lines.slice(1).join(' ');
              /* re-render with number highlights */
              const bodyHighlighted=body.split(/(\*\*[^*]+\*\*)/g).map((part,pi)=>{
                if(part.startsWith('**')&&part.endsWith('**'))
                  return<strong key={pi} className="font-black text-slate-900">{part.replace(/\*\*/g,'')}</strong>;
                return part.split(/(\d[\d,]*\s*[개명일년%±][\d]*)/g).map((seg,si)=>
                  /^\d/.test(seg)
                    ?<span key={si} className="font-bold text-amber-700">{seg}</span>
                    :seg
                );
              });
              return(
                <div key={bi} className="space-y-1">
                  <div className="text-xs font-black text-amber-700 uppercase tracking-wide">{header}</div>
                  <p className="text-[13px] leading-relaxed">{bodyHighlighted}</p>
                </div>
              );
            })}
          </div>
        </div>}

        {/* keywords */}
        <div className="border border-slate-200 rounded-xl bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-amber-600"/>
            <span className="text-xs font-black text-slate-700 uppercase tracking-wide">핵심 키워드 ({C.keywords.length}개)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {C.keywords.map((kw,i)=>(
              <span key={i} className={cn('px-2.5 py-1 rounded-full text-[11px] font-bold',KEYWORD_COLORS[i%KEYWORD_COLORS.length])}>
                {kw.word} <span className="opacity-70">{kw.pct}%</span>
              </span>
            ))}
          </div>
        </div>

        {/* document structure map */}
        <div className="border border-slate-200 rounded-xl bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-amber-600"/>
            <span className="text-xs font-black text-slate-700 uppercase tracking-wide">문서 구조 맵</span>
          </div>
          <SectionTree sections={C.sections}/>
        </div>


      </div>
    </div>
  );
};

export default SummaryAgent;
