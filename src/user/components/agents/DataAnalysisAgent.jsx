import React, { useState } from "react";
import {
  BarChart2, Upload, FileSpreadsheet, TrendingUp, Play, RotateCcw, ChevronRight,
  CheckCircle, Loader2, Radio, Network, Download, Copy, Table2,
  Activity, Filter, Cpu, Zap, AlertCircle, ArrowUpDown, FileText
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Cell, LabelList, ReferenceLine
} from "recharts";
import AgentWorkflowPanel from "./AgentWorkflowPanel.jsx";
import { AGENT_TEAMS } from "../../data/constants.js";
import { cn, downloadTextFile, buildDocHtml, agentHeader } from "../../utils.jsx";


const AGENTS=[
  {icon:FileSpreadsheet, label:'데이터 파싱 에이전트', sub:'CSV/Excel 구조 파악·정제 중', color:'bg-orange-500', ms:1100},
  {icon:Activity,        label:'통계 분석 에이전트',  sub:'기술통계·분포·이상치 분석 중', color:'bg-amber-500',  ms:2000},
  {icon:BarChart2,       label:'시각화 에이전트',     sub:'차트·그래프 자동 생성 중',     color:'bg-rose-500',   ms:1300},
];

const SAMPLE_FILES=[
  {id:'f1',name:'VDS_5분집계_경부선_2026-09.csv',  rows:1248,cols:12,size:'2.4MB'},
  {id:'f2',name:'돌발상황_검지이력_2026Q3.csv',    rows:342, cols:8, size:'0.8MB'},
  {id:'f3',name:'속도예측_정확도평가_2026.xlsx',    rows:89,  cols:15,size:'0.5MB'},
];

/* 차트 데이터 */
const PRICE_TREND=[
  {month:'07:35',실측:84,예측:87,평시:92},
  {month:'07:40',실측:38,예측:53,평시:92},
  {month:'07:45',실측:36,예측:37,평시:91},
  {month:'07:50',실측:35,예측:36,평시:91},
  {month:'07:55',실측:37,예측:38,평시:90},
  {month:'08:00',실측:39,예측:40,평시:90},
  {month:'08:05',실측:41,예측:42,평시:89},
  {month:'08:10',실측:43,예측:44,평시:89},
  {month:'08:15',실측:46,예측:47,평시:88},
];

const REGION_BAR=[
  {region:'수도권',  혼잡지수:78},
  {region:'대전충남',혼잡지수:61},
  {region:'부산경남',혼잡지수:57},
  {region:'대구경북',혼잡지수:52},
  {region:'광주전남',혼잡지수:44},
  {region:'충북',    혼잡지수:41},
  {region:'전북',    혼잡지수:38},
  {region:'강원',    혼잡지수:33},
];

const APPEAL_MONTHLY=[
  {month:'7월',검지:128,확인:125,오탐:3},
  {month:'8월',검지:142,확인:139,오탐:3},
  {month:'9월',검지:108,확인:106,오탐:2},
];

const STATS_TABLE=[
  {metric:'구간 평균속도(평시)',   value:'92 km/h',  change:'유지',   status:'normal'},
  {metric:'최저 구간속도(07:42)', value:'38 km/h',  change:'-59%',  status:'warning'},
  {metric:'VDS 원본 결측률',      value:'4.8%',     change:'+1.8%p',status:'warning'},
  {metric:'급감속 클러스터',       value:'7건/2분',  change:'+7건',  status:'high'},
  {metric:'2차사고 위험도',        value:'0.78',     change:'+0.08', status:'high'},
  {metric:'30분 예측 MAE',        value:'4.7 km/h', change:'-0.3',  status:'normal'},
];

const STATUS_COLORS={normal:'text-slate-600',high:'text-rose-600',warning:'text-amber-600'};
const STATUS_BG   ={normal:'bg-slate-50',   high:'bg-rose-50',    warning:'bg-amber-50'};

/* 자동 생성 리포트 3종 — 화면에 실제로 있는 값만 문서에 담는다 */
const REPORT_KINDS=[
  {kind:'summary', label:'요약 리포트',     desc:'1페이지 핵심 요약',     icon:'📄'},
  {kind:'detail',  label:'상세 분석 보고서', desc:'통계+차트+인사이트',   icon:'📊'},
  {kind:'outlier', label:'이상치 보고서',   desc:'이상치 및 데이터 품질', icon:'⚠️'},
];

/* 기본(도로공사) 분석 유형 — 선택에 따라 결과 구획이 달라진다 */
const ANALYSIS_TYPES=[
  {id:'comprehensive',label:'종합 분석',  desc:'기술통계 + 추세 + 이상치 + 시각화 전체',  sections:['stats','charts','report']},
  {id:'stats',        label:'기술통계',   desc:'평균속도·분산·분위수·지점 간 상관',      sections:['stats','report']},
  {id:'trend',        label:'추세 분석',  desc:'시계열 트렌드·첨두시간 패턴 분석',        sections:['charts','report']},
  {id:'outlier',      label:'이상치 탐지',desc:'Z-score·IQR 기반 급감속·결측 검출',       sections:['stats','charts','report']},
];

/* 도메인 이관: 기본 콘텐츠 — 도메인 팩 agentContent["agent-dataanalysis"]로 키 단위 오버라이드 */
export const CONTENT_DEFAULTS={
  headerTitle:'데이터 분석 에이전트',                // string — 화면 헤더 제목(미제공 시 허브 카탈로그 이름 승계)
  headerDesc:'교통 시계열(CSV/Excel) 업로드 → 통계 분석 → 자동 시각화', // string — 헤더 설명(작업 흐름)
  sampleFiles: SAMPLE_FILES,                       // {id,name,rows,cols,size}[3]
  /* 분석 유형 — 선택 결과가 결과 화면 구성(sections)을 실제로 바꾼다.
     sections 생략 시 전 구획 노출(하위 호환). 사용 가능한 키:
     stats(기술통계 표) · charts(시각화) · predict(품질 예측 모델)
     · optim(최적 공정조건) · rul(설비 잔여수명) · invest(설비 투자 적정성) · report(리포트 생성) */
  analysisTypes: ANALYSIS_TYPES,                   // {id,label,desc,sections?}[]
  /* 아래 4종은 전부 선택 필드 — 팩이 공급할 때만 해당 구획이 렌더된다 */
  predictPanel: null,                              // 품질·불량 사전 예측 모델 (아래 스키마 주석 참조)
  optimPanel: null,                                // 최적 공정변수·설비조건 도출
  rulPanel: null,                                  // 설비 이상·유지보수 시점 예측(잔여수명)
  investPanel: null,                               // 품질 수준을 고려한 설비 투자 적정성 판단
  trendCaption:'경부선 하행 기흥IC~수원신갈IC 구간 평균속도 (2026-09-18 07:35~08:15, 5분 집계) · 단위: km/h',
  trendData: PRICE_TREND,                          // {month,...seriesKey}[9]
  trendSeries:[{key:'실측',color:'#f97316'},{key:'예측',color:'#3b82f6'},{key:'평시',color:'#10b981'}],
  trendDomain:[20,100], trendRef:40, trendRefLabel:'정체 임계(40)',
  barTabLabel:'본부별',
  barCaption:'지역본부별 혼잡지수 (2026-09-18 기준) · 0~100, 높을수록 혼잡',
  barData: REGION_BAR, barXKey:'region', barValueKey:'혼잡지수', barUnit:'',
  stackTabLabel:'돌발상황',
  stackCaption:'돌발상황 검지·확인·오탐 현황 (2026년 3분기) · 단위: 건',
  stackData: APPEAL_MONTHLY, stackSeries:[{key:'검지',color:'#f97316'},{key:'확인',color:'#10b981'},{key:'오탐',color:'#ef4444'}],
  statsTable: STATS_TABLE,                         // {metric,value,change,status}[6]
  outlierSummary:'23건 (1.8%)',
  docStandard:'EX 표준 형식',
  docStandardNote:'리포트 형식을 선택하면 EX 표준 양식으로 자동 생성됩니다',
};

const DataAnalysisAgent=({onBack,domain})=>{
  const C={...CONTENT_DEFAULTS,...(domain?.agentContent?.["agent-dataanalysis"]||{})};
  const H=agentHeader(domain,'agent-dataanalysis',C,AGENT_TEAMS);
  const TYPES=C.analysisTypes?.length?C.analysisTypes:ANALYSIS_TYPES;
  const [step,setStep]=useState(1);
  const [selectedFile,setSelectedFile]=useState(()=>C.sampleFiles?.[0]?.id||'f1');
  const [analysisType,setAnalysisType]=useState(()=>TYPES[0].id); // 팩이 정렬한 첫 유형이 기본
  const [agentIdx,setAgentIdx]=useState(-1);
  const [doneIdx,setDoneIdx]=useState([]);
  const [chartTab,setChartTab]=useState('trend');
  const [bulkMode,setBulkMode]=useState(false);
  const [downloaded,setDownloaded]=useState(false);
  const [madeReport,setMadeReport]=useState(null);

  /* 통계 요약 + 현재 보고 있는 차트의 원본 데이터를 엑셀(TSV)로 — 화면에 없는 값은 넣지 않는다 */
  const downloadResult=()=>{
    const rows=[['[통계 요약]'],['지표','값','전기 대비'],
      ...C.statsTable.map(s=>[s.metric,s.value,s.change]),['']];
    // 탭 키는 trend | region | appeal (렌더 조건과 동일하게 맞출 것)
    const chart=chartTab==='region'?{title:C.barCaption,data:C.barData}
      :chartTab==='appeal'?{title:C.stackCaption,data:C.stackData}
      :{title:C.trendCaption,data:C.trendData};
    if(chart.data?.length){
      rows.push([`[${chart.title}]`],Object.keys(chart.data[0]),
        ...chart.data.map(d=>Object.values(d)));
    }
    downloadTextFile('분석결과.xls',rows.map(r=>r.join('\t')).join('\n'),
      'text/tab-separated-values;charset=utf-8');
    setDownloaded(true);
    setTimeout(()=>setDownloaded(false),2000);
  };

  /* 리포트 3종을 워드(.doc)로 실제 생성 — 종류별로 담는 구획이 다르다 */
  const downloadReport=(r)=>{
    const L=[`분석 대상: ${file?.name} (${file?.rows.toLocaleString()}행 × ${file?.cols}열)`,
      `분석 유형: ${typeInfo.label}${bulkMode?' · 대량 데이터 모드':''}`,
      `이상치: ${C.outlierSummary}`,''];
    if(r.kind!=='outlier'){
      L.push('[기술 통계 요약]');
      C.statsTable.forEach(s=>L.push(`- ${s.metric}: ${s.value} (전기 대비 ${s.change})`));
      L.push('');
    }
    if(r.kind==='outlier'){
      L.push('[이상치 및 데이터 품질]',`- 이상치 건수: ${C.outlierSummary}`,'- 보정 후 결측: 0건');
      C.statsTable.filter(s=>s.status!=='normal')
        .forEach(s=>L.push(`- 주의 지표 ${s.metric}: ${s.value} (${s.change})`));
      L.push('');
    }
    if(r.kind==='detail'){
      if(predict){
        L.push(`[${predict.title}]`,`모델: ${predict.modelName||'-'}`);
        (predict.metrics||[]).forEach(m=>L.push(`- ${m.label}: ${m.value}`));
        (predict.features||[]).forEach(f=>L.push(`- 기여도 ${f.name}: ${(f.weight*100).toFixed(0)}%`));
        if(predict.note)L.push(`※ ${predict.note}`);
        L.push('');
      }
      if(optim){
        L.push(`[${optim.title}]`);
        (optim.params||[]).forEach(p=>L.push(`- ${p.name}: ${p.current} → ${p.recommended} (${p.delta})`));
        (optim.effects||[]).forEach(e=>L.push(`- 기대효과 ${e.label}: ${e.before} → ${e.after}`));
        (optim.tradeoffs||[]).forEach(t=>L.push(`- 트레이드오프: ${t}`));
        L.push('');
      }
      if(rul){
        L.push(`[${rul.title}]`);
        (rul.items||[]).forEach(it=>L.push(`- ${it.equip}: ${it.verdict} · 잔여 ${it.rulDays}일 — ${it.basis}`));
        L.push('');
      }
      if(invest){
        L.push(`[${invest.title}]`);
        (invest.options||[]).forEach(o=>L.push(`- ${o.name}: 투자비 ${o.capex} · 예상 품질 ${o.quality} · 연 절감 ${o.saving} · 회수 ${o.payback} → ${o.verdict}`));
        if(invest.rationale)L.push(`판단 근거: ${invest.rationale}`);
        L.push('');
      }
      L.push(`[${C.trendCaption}]`);
      C.trendData.forEach(d=>L.push('- '+Object.entries(d).map(([k,v])=>`${k}: ${v}`).join(' · ')));
    }
    downloadTextFile(`${r.label}.doc`,buildDocHtml(`${r.label} — ${file?.name}`,L.join('\n')),
      'application/msword;charset=utf-8');
    setMadeReport(r.kind);
    setTimeout(()=>setMadeReport(null),2000);
  };

  const startAnalysis=()=>{
    setStep(2);setAgentIdx(0);setDoneIdx([]);
    let delay=0;
    AGENTS.forEach((ag,i)=>{
      delay+=ag.ms;
      setTimeout(()=>{
        setAgentIdx(i+1<AGENTS.length?i+1:-1);
        setDoneIdx(p=>[...p,i]);
        if(i===AGENTS.length-1)setTimeout(()=>setStep(3),600);
      },delay);
    });
  };

  const reset=()=>{setStep(1);setAgentIdx(-1);setDoneIdx([]);setChartTab('trend');};

  const file=C.sampleFiles.find(f=>f.id===selectedFile);
  const typeInfo=TYPES.find(t=>t.id===analysisType)||TYPES[0];
  /* 분석 유형이 결과 구획을 결정한다 — sections 미지정 유형은 전 구획 노출(하위 호환) */
  const shows=key=>!typeInfo.sections||typeInfo.sections.includes(key);
  const predict=shows('predict')?C.predictPanel:null;
  const optim  =shows('optim')  ?C.optimPanel  :null;
  const rul    =shows('rul')    ?C.rulPanel    :null;
  const invest =shows('invest') ?C.investPanel :null;
  /* 대량 데이터 모드는 청크 분할 처리 — 소요 시간이 달라진다 */
  const elapsed=bulkMode?'12.8초':'4.4초';

  if(step===1)return(
    <div className="flex-1 overflow-y-auto px-6 py-8 bg-white">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-2">
          {onBack&&<button onClick={onBack} className="text-slate-400 hover:text-slate-600 text-[11px] font-bold flex items-center gap-1 shrink-0 py-2 pr-2 max-md:py-2.5">
            <ChevronRight className="w-3.5 h-3.5 rotate-180"/>뒤로
          </button>}
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-md shrink-0">
            <BarChart2 className="w-5 h-5 text-white"/>
          </div>
          <div>
            <div className="text-[15px] font-black text-slate-800">{H.title}</div>
            <div className="text-xs text-slate-400">{H.desc}</div>
          </div>
        </div>

        {/* 파일 업로드 */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">1 · 데이터 파일 선택</label>
          <div className="border-2 border-dashed border-orange-200 rounded-xl bg-orange-50/30 px-6 py-5 text-center hover:bg-orange-50/60 transition-colors cursor-pointer group">
            <Upload className="w-8 h-8 text-orange-400 mx-auto mb-2 group-hover:text-orange-600 transition-colors"/>
            <p className="text-[13px] font-bold text-slate-600">Excel / CSV 파일을 업로드하거나</p>
            <p className="text-[11px] text-slate-400 mt-1">샘플 데이터를 선택해서 분석을 시작하세요</p>
          </div>
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-slate-500">또는 샘플 파일 선택</p>
            {C.sampleFiles.map(f=>(
              <label key={f.id} className={cn(
                'flex items-center gap-3 px-4 py-3 border rounded-xl cursor-pointer transition-all select-none',
                selectedFile===f.id?'bg-orange-50 border-orange-300':'border-slate-200 hover:bg-slate-50'
              )}>
                <input type="radio" name="file" value={f.id} checked={selectedFile===f.id} onChange={()=>setSelectedFile(f.id)} className="accent-orange-600 shrink-0"/>
                <FileSpreadsheet className={cn('w-5 h-5 shrink-0',selectedFile===f.id?'text-orange-600':'text-slate-400')}/>
                <div className="flex-1 min-w-0">
                  <div className={cn('text-[13px] font-bold truncate',selectedFile===f.id?'text-slate-800':'text-slate-500')}>{f.name}</div>
                  <div className="text-[10px] text-slate-400">{f.rows.toLocaleString()}행 × {f.cols}열 · {f.size}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 대량 데이터 모드 */}
        <label className={cn(
          'flex items-center gap-3 px-4 py-2.5 border-2 rounded-xl cursor-pointer transition-all select-none',
          bulkMode?'border-orange-400 bg-orange-50':'border-slate-200 hover:border-orange-200 bg-white'
        )}>
          <input type="checkbox" checked={bulkMode} onChange={e=>setBulkMode(e.target.checked)} className="accent-orange-600 w-4 h-4 shrink-0"/>
          <div>
            <span className={cn('text-[13px] font-bold',bulkMode?'text-orange-700':'text-slate-700')}>대량 데이터 모드</span>
            <span className="text-[10px] text-slate-400 ml-2">10만 건 이상 데이터 최적화 처리</span>
          </div>
          {bulkMode&&<span className="ml-auto text-[10px] font-black text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full shrink-0">활성</span>}
        </label>

        {/* 분석 유형 */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">2 · 분석 유형</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TYPES.map(t=>(
              <label key={t.id} className={cn(
                'flex flex-col px-4 py-3 border rounded-xl cursor-pointer transition-all select-none',
                analysisType===t.id?'bg-orange-50 border-orange-300':'border-slate-200 hover:bg-slate-50'
              )}>
                <div className="flex items-center gap-2 mb-1">
                  <input type="radio" name="atype" value={t.id} checked={analysisType===t.id} onChange={()=>setAnalysisType(t.id)} className="accent-orange-600"/>
                  <span className={cn('text-[13px] font-bold',analysisType===t.id?'text-slate-800':'text-slate-500')}>{t.label}</span>
                </div>
                <span className="text-[10px] text-slate-400 pl-5">{t.desc}</span>
              </label>
            ))}
          </div>
        </div>

        <button onClick={startAnalysis}
          className="w-full py-3.5 bg-orange-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-100 text-[15px]">
          <Play className="w-4 h-4 fill-white"/> 데이터 분석 시작
        </button>
      </div>
    </div>
  );

  if(step===2)return(
    <div className="flex-1 flex min-h-0 overflow-hidden">
      <div className="flex-1 min-w-0 flex flex-col items-center justify-center overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-xl px-6">
          <div className="text-center mb-10">
            <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-100">
              <Radio className="w-7 h-7 text-white animate-pulse"/>
            </div>
            <div className="text-[18px] font-black text-slate-800">데이터 분석 파이프라인 처리 중</div>
            <div className="text-sm text-slate-400 mt-1">{file?.name} · {file?.rows.toLocaleString()}행 데이터 분석 중</div>
          </div>
          <div className="space-y-3">
            {AGENTS.map((ag,i)=>{
              const isDone=doneIdx.includes(i);
              const isActive=agentIdx===i;
              const AgIcon=ag.icon;
              return(
                <div key={i}>
                  <div className={cn(
                    'rounded-2xl border-2 p-4 transition-all duration-500',
                    isDone?'border-emerald-200 bg-emerald-50/60':
                    isActive?'border-orange-300 bg-orange-50 shadow-md shadow-orange-100':
                    'border-slate-100 bg-white opacity-50'
                  )}>
                    <div className="flex items-center gap-3">
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all',
                        isDone?'bg-emerald-500':isActive?ag.color:'bg-slate-200')}>
                        {isDone?<CheckCircle className="w-5 h-5 text-white"/>
                          :<AgIcon className={cn('w-5 h-5',isActive?'text-white animate-pulse':'text-slate-400')}/>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={cn('font-black text-sm',isDone?'text-emerald-700':isActive?'text-orange-700':'text-slate-400')}>{ag.label}</div>
                        <div className={cn('text-xs mt-0.5',isDone?'text-emerald-500':isActive?'text-orange-500':'text-slate-300')}>
                          {isActive?`처리 중 — ${ag.sub}`:isDone?`완료 — ${ag.sub}`:ag.sub}
                        </div>
                      </div>
                      {isActive&&<Loader2 className="w-4 h-4 text-orange-500 animate-spin shrink-0"/>}
                      {isDone&&<span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">완료</span>}
                    </div>
                    {isActive&&<div className="mt-3"><div className="h-1 bg-orange-100 rounded-full overflow-hidden"><div className="h-1 bg-orange-500 rounded-full animate-pulse" style={{width:'55%'}}/></div></div>}
                  </div>
                  {i<AGENTS.length-1&&<div className="flex justify-center my-1"><ChevronRight className="w-4 h-4 text-slate-300 rotate-90"/></div>}
                </div>
              );
            })}
          </div>
          <div className="mt-8 text-center text-xs text-slate-400">
            <Cpu className="w-3.5 h-3.5 inline mr-1 text-orange-400"/>
            AI 통계 분석 파이프라인 — 정형 데이터를 자동으로 분석하고 시각화합니다
          </div>
        </div>
      </div>
      <div className="hidden lg:flex w-80 shrink-0 border-l border-slate-100 bg-gradient-to-b from-slate-50 to-white p-4 overflow-y-auto custom-scrollbar flex-col">
        <AgentWorkflowPanel agentId="agent-dataanalysis" activeStep={agentIdx} doneSteps={doneIdx} />
      </div>
    </div>
  );

  /* ── STEP 3: 결과 ── */
  return(
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      <div className="shrink-0 bg-white border-b px-5 py-2.5 flex items-center gap-2 flex-wrap shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0"><CheckCircle className="w-3.5 h-3.5 text-white"/></div>
          <div className="min-w-0">
            <div className="text-[13px] font-black text-slate-800 truncate">분석 완료 · {file?.rows.toLocaleString()}행</div>
            <div className="text-[10px] text-slate-400 truncate">{file?.name} · 분석 시간 {elapsed}</div>
          </div>
        </div>
        <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded-full shrink-0">{typeInfo.label}</span>
        {bulkMode&&<span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-full shrink-0">대량 모드 · 10,000행 청크 분할</span>}
        <button onClick={reset} className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-[11px] font-bold text-slate-500 hover:bg-slate-50 transition-colors">
          <RotateCcw className="w-3 h-3"/>새 분석
        </button>
        <button onClick={downloadResult}
          className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors shadow-sm text-white',
            downloaded?'bg-emerald-600 hover:bg-emerald-700':'bg-orange-500 hover:bg-orange-600')}>
          <Download className="w-3 h-3"/>{downloaded?'내려받음':'결과 다운로드'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* 통계 요약 카드 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {label:'총 데이터',value:`${file?.rows.toLocaleString()}행`,color:'text-orange-700',bg:'bg-orange-50 border-orange-200'},
            {label:'분석 열',  value:`${file?.cols}개`,                color:'text-blue-700',  bg:'bg-blue-50 border-blue-200'},
            {label:'이상치',   value:C.outlierSummary,                 color:'text-amber-600', bg:'bg-amber-50 border-amber-200'},
            {label:'보정 후 결측',value:'0건',                         color:'text-emerald-600',bg:'bg-emerald-50 border-emerald-200'},
          ].map(({label,value,color,bg})=>(
            <div key={label} className={cn('border rounded-xl px-4 py-3 text-center',bg)}>
              <div className={cn('text-[16px] font-black',color)}>{value}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* 기술 통계 테이블 */}
        {shows('stats')&&<div className="bg-white border rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b flex items-center gap-2">
            <Table2 className="w-4 h-4 text-orange-600"/>
            <span className="text-[13px] font-black text-slate-800">기술 통계 요약</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-slate-50 border-b">
                  {['지표','값','전기 대비','상태'].map(h=>(
                    <th key={h} className="px-4 py-2.5 text-left font-black text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {C.statsTable.map((r,i)=>(
                  <tr key={i} className={cn('border-b last:border-0',STATUS_BG[r.status])}>
                    <td className="px-4 py-2.5 font-medium text-slate-700">{r.metric}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-800 font-bold">{r.value}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-500">{r.change}</td>
                    <td className="px-4 py-2.5">
                      {r.status==='warning'?<span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-bold flex items-center gap-1 w-fit"><AlertCircle className="w-3 h-3"/>주의</span>
                       :r.status==='high'?<span className="text-[10px] px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full font-bold w-fit flex items-center gap-1"><TrendingUp className="w-3 h-3"/>높음</span>
                       :<span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold w-fit">정상</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>}

        {/* 차트 탭 */}
        {shows('charts')&&<div className="bg-white border rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b flex items-center gap-3">
            <BarChart2 className="w-4 h-4 text-orange-600"/>
            <span className="text-[13px] font-black text-slate-800">시각화</span>
            <div className="ml-auto flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
              {[
                {key:'trend', label:'추세'},
                {key:'region', label:C.barTabLabel},
                {key:'appeal', label:C.stackTabLabel},
              ].map(({key,label})=>(
                <button key={key} onClick={()=>setChartTab(key)}
                  className={cn('px-3 py-1 rounded-md text-[11px] font-bold transition-all',
                    chartTab===key?'bg-white text-orange-700 shadow-sm':'text-slate-500 hover:text-slate-700')}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5">
            {chartTab==='trend'&&(
              <>
                <p className="text-[11px] text-slate-400 font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-orange-500"/>
                  {C.trendCaption}
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={C.trendData} margin={{top:5,right:20,left:-10,bottom:5}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                    <XAxis dataKey="month" tick={{fontSize:10,fill:'#94a3b8'}} tickLine={false}/>
                    <YAxis domain={C.trendDomain} tick={{fontSize:10,fill:'#94a3b8'}} tickLine={false} axisLine={false}/>
                    <Tooltip contentStyle={{fontSize:11,borderRadius:8,border:'1px solid #e2e8f0'}}/>
                    <Legend wrapperStyle={{fontSize:11}}/>
                    {C.trendRef!=null&&<ReferenceLine y={C.trendRef} stroke="#94a3b8" strokeDasharray="4 4" label={{value:C.trendRefLabel,position:'right',fontSize:9,fill:'#94a3b8'}}/>}
                    {C.trendSeries.map(s=>(
                      <Line key={s.key} type="monotone" dataKey={s.key} stroke={s.color} strokeWidth={2} dot={false}/>
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </>
            )}
            {chartTab==='region'&&(
              <>
                <p className="text-[11px] text-slate-400 font-bold mb-4 flex items-center gap-2">
                  <BarChart2 className="w-3.5 h-3.5 text-orange-500"/>
                  {C.barCaption}
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={C.barData} margin={{top:5,right:20,left:-10,bottom:5}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                    <XAxis dataKey={C.barXKey} tick={{fontSize:10,fill:'#94a3b8'}} tickLine={false}/>
                    <YAxis tick={{fontSize:10,fill:'#94a3b8'}} tickLine={false} axisLine={false}/>
                    <Tooltip contentStyle={{fontSize:11,borderRadius:8,border:'1px solid #e2e8f0'}} formatter={(v)=>[`${v}${C.barUnit}`,C.barValueKey]}/>
                    <ReferenceLine y={0} stroke="#94a3b8"/>
                    <Bar dataKey={C.barValueKey} radius={[4,4,0,0]}>
                      {C.barData.map((entry,index)=>(
                        <Cell key={index} fill={entry[C.barValueKey]>=0?'#10b981':'#f97316'}/>
                      ))}
                      <LabelList dataKey={C.barValueKey} position="top" style={{fontSize:10,fill:'#64748b'}} formatter={v=>`${v}${C.barUnit}`}/>
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
            {chartTab==='appeal'&&(
              <>
                <p className="text-[11px] text-slate-400 font-bold mb-4 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-orange-500"/>
                  {C.stackCaption}
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={C.stackData} margin={{top:5,right:20,left:-10,bottom:5}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                    <XAxis dataKey="month" tick={{fontSize:10,fill:'#94a3b8'}} tickLine={false}/>
                    <YAxis tick={{fontSize:10,fill:'#94a3b8'}} tickLine={false} axisLine={false}/>
                    <Tooltip contentStyle={{fontSize:11,borderRadius:8,border:'1px solid #e2e8f0'}}/>
                    <Legend wrapperStyle={{fontSize:11}}/>
                    {C.stackSeries.map(s=>(
                      <Bar key={s.key} dataKey={s.key} fill={s.color} radius={[3,3,0,0]}>
                        <LabelList dataKey={s.key} position="top" style={{fontSize:10}}/>
                      </Bar>
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
          </div>
        </div>}

        {/* ── 품질·불량 사전 예측 모델 ── */}
        {predict&&(
          <div className="bg-white border rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b flex items-center gap-2 flex-wrap">
              <Zap className="w-4 h-4 text-orange-600"/>
              <span className="text-[13px] font-black text-slate-800">{predict.title}</span>
              {predict.modelName&&<span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{predict.modelName}</span>}
            </div>
            <div className="p-5 space-y-4">
              {!!predict.metrics?.length&&(
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {predict.metrics.map((m,i)=>(
                    <div key={i} className="border rounded-xl px-3 py-2.5 text-center bg-slate-50">
                      <div className="text-[15px] font-black text-slate-800">{m.value}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{m.label}</div>
                    </div>
                  ))}
                </div>
              )}
              {!!predict.features?.length&&(
                <div>
                  <p className="text-[11px] font-black text-slate-500 mb-2">공정변수 기여도 (모델 판단 근거)</p>
                  <div className="space-y-1.5">
                    {predict.features.map((f,i)=>(
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-600 w-40 shrink-0 truncate">{f.name}</span>
                        <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden min-w-0">
                          <div className="h-2.5 bg-orange-500 rounded-full" style={{width:`${Math.round(f.weight*100)}%`}}/>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-slate-700 w-12 text-right shrink-0">{(f.weight*100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {!!predict.matrix?.length&&(
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px] border rounded-xl overflow-hidden">
                    <thead><tr className="bg-slate-50 border-b">
                      {['구분','건수','비고'].map(h=><th key={h} className="px-4 py-2 text-left font-black text-slate-500">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {predict.matrix.map((m,i)=>(
                        <tr key={i} className="border-b last:border-0">
                          <td className="px-4 py-2 font-medium text-slate-700">{m.label}</td>
                          <td className="px-4 py-2 font-mono font-bold text-slate-800">{m.count}</td>
                          <td className="px-4 py-2 text-slate-500">{m.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {predict.note&&(
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5"/>
                  <p className="text-[11px] text-amber-800 leading-relaxed">{predict.note}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 최적 공정변수·설비조건 도출 ── */}
        {optim&&(
          <div className="bg-white border rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b flex items-center gap-2">
              <Filter className="w-4 h-4 text-orange-600"/>
              <span className="text-[13px] font-black text-slate-800">{optim.title}</span>
              {optim.target&&<span className="ml-auto text-[10px] text-slate-400 truncate">{optim.target}</span>}
            </div>
            <div className="p-5 space-y-4">
              {!!optim.params?.length&&(
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead><tr className="bg-slate-50 border-b">
                      {['공정변수','현재 설정','AI 권장','변화'].map(h=><th key={h} className="px-4 py-2 text-left font-black text-slate-500">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {optim.params.map((p,i)=>(
                        <tr key={i} className="border-b last:border-0">
                          <td className="px-4 py-2 font-medium text-slate-700">{p.name}</td>
                          <td className="px-4 py-2 font-mono text-slate-500">{p.current}</td>
                          <td className="px-4 py-2 font-mono font-bold text-emerald-700">{p.recommended}</td>
                          <td className="px-4 py-2 font-mono text-[11px] text-orange-600">{p.delta}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {!!optim.effects?.length&&(
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {optim.effects.map((e,i)=>(
                    <div key={i} className="border border-emerald-200 bg-emerald-50 rounded-xl px-4 py-3">
                      <div className="text-[10px] text-emerald-700 font-bold">{e.label}</div>
                      <div className="text-[13px] font-black text-slate-800 mt-1">
                        <span className="text-slate-400 font-bold">{e.before}</span>
                        <ArrowUpDown className="w-3 h-3 inline mx-1 text-emerald-600 rotate-90"/>
                        {e.after}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!!optim.tradeoffs?.length&&(
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <p className="text-[11px] font-black text-amber-800 mb-1.5">함께 감수해야 할 영향 (트레이드오프)</p>
                  <ul className="space-y-1">
                    {optim.tradeoffs.map((t,i)=>(
                      <li key={i} className="text-[11px] text-amber-800 leading-relaxed">· {t}</li>
                    ))}
                  </ul>
                </div>
              )}
              {optim.validation&&(
                <p className="text-[11px] text-slate-500 leading-relaxed border-l-2 border-slate-200 pl-3">{optim.validation}</p>
              )}
            </div>
          </div>
        )}

        {/* ── 설비 이상·유지보수 시점 예측 ── */}
        {rul&&(
          <div className="bg-white border rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-600"/>
              <span className="text-[13px] font-black text-slate-800">{rul.title}</span>
              {rul.asOf&&<span className="ml-auto text-[10px] text-slate-400">{rul.asOf}</span>}
            </div>
            <div className="p-5 space-y-2.5">
              {(rul.items||[]).map((it,i)=>{
                const tone=it.status==='danger'?{b:'border-rose-200',bg:'bg-rose-50',t:'text-rose-700',bar:'bg-rose-500'}
                  :it.status==='warn'?{b:'border-amber-200',bg:'bg-amber-50',t:'text-amber-700',bar:'bg-amber-500'}
                  :{b:'border-slate-200',bg:'bg-white',t:'text-emerald-700',bar:'bg-emerald-500'};
                return(
                  <div key={i} className={cn('border rounded-xl px-4 py-3',tone.b,tone.bg)}>
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="text-[12px] font-black text-slate-800">{it.equip}</span>
                      <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border',tone.t,tone.b)}>{it.verdict}</span>
                      <span className="ml-auto text-[11px] font-mono font-bold text-slate-700">잔여 {it.rulDays}일</span>
                    </div>
                    <div className="h-2 bg-white border border-slate-200 rounded-full overflow-hidden mb-2">
                      <div className={cn('h-full rounded-full',tone.bar)} style={{width:`${Math.max(3,Math.min(100,Math.round((it.rulDays/(rul.horizonDays||90))*100)))}%`}}/>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{it.basis}</p>
                    {it.action&&<p className="text-[11px] font-bold text-slate-700 mt-1">권장 조치 · {it.action}</p>}
                  </div>
                );
              })}
              {rul.note&&<p className="text-[11px] text-slate-500 leading-relaxed border-l-2 border-slate-200 pl-3">{rul.note}</p>}
            </div>
          </div>
        )}

        {/* ── 품질 수준을 고려한 설비 투자 적정성 ── */}
        {invest&&(
          <div className="bg-white border rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b flex items-center gap-2">
              <Cpu className="w-4 h-4 text-orange-600"/>
              <span className="text-[13px] font-black text-slate-800">{invest.title}</span>
            </div>
            <div className="p-5 space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead><tr className="bg-slate-50 border-b">
                    {['투자안','투자비','예상 품질','연 절감액','회수기간','판정'].map(h=>(
                      <th key={h} className="px-3 py-2 text-left font-black text-slate-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {(invest.options||[]).map((o,i)=>(
                      <tr key={i} className={cn('border-b last:border-0',o.verdict==='추천'&&'bg-emerald-50')}>
                        <td className="px-3 py-2.5 font-medium text-slate-700">{o.name}</td>
                        <td className="px-3 py-2.5 font-mono text-slate-600 whitespace-nowrap">{o.capex}</td>
                        <td className="px-3 py-2.5 font-mono text-slate-600 whitespace-nowrap">{o.quality}</td>
                        <td className="px-3 py-2.5 font-mono text-slate-600 whitespace-nowrap">{o.saving}</td>
                        <td className="px-3 py-2.5 font-mono text-slate-600 whitespace-nowrap">{o.payback}</td>
                        <td className="px-3 py-2.5">
                          <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap',
                            o.verdict==='추천'?'bg-emerald-100 text-emerald-700'
                            :o.verdict==='보류'?'bg-amber-100 text-amber-700':'bg-slate-100 text-slate-600')}>{o.verdict}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {invest.rationale&&(
                <div className="bg-slate-50 border rounded-xl px-4 py-3">
                  <p className="text-[11px] font-black text-slate-600 mb-1">판단 근거</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{invest.rationale}</p>
                </div>
              )}
              {invest.note&&(
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5"/>
                  <p className="text-[11px] text-amber-800 leading-relaxed">{invest.note}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 표준화 분석 리포트 자동 생성 */}
        {shows('report')&&<div className="bg-white border rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-600"/>
            <span className="text-[13px] font-black text-slate-800">표준화 분석 리포트 자동 생성</span>
            <span className="ml-auto text-[10px] text-slate-400">{C.docStandard}</span>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {REPORT_KINDS.map(r=>(
                <button key={r.kind}
                  onClick={()=>downloadReport(r)}
                  className="border-2 border-dashed border-orange-200 rounded-xl p-4 text-center hover:bg-orange-50 hover:border-orange-400 transition-all">
                  <div className="text-2xl mb-1">{r.icon}</div>
                  <div className="text-[12px] font-black text-slate-700">{madeReport===r.kind?'생성 완료':r.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{r.desc}</div>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 text-center">{C.docStandardNote}</p>
          </div>
        </div>}

        <div className="text-center py-2">
          <button onClick={reset} className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl text-[13px] font-black hover:bg-orange-600 transition-colors shadow-md shadow-orange-100">
            <RotateCcw className="w-4 h-4"/>새 분석
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataAnalysisAgent;
