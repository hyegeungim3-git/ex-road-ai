import React, { useState, useRef } from "react";
import {
  Languages, Radio, Loader2, CheckCircle, ChevronRight, Network,
  RotateCcw, Copy, Download, Upload, FileText, Scissors, Cpu, ClipboardCheck,
  BookOpen, Plus, Trash2, ArrowLeftRight, RefreshCw, ChevronDown
} from "lucide-react";
import AgentWorkflowPanel from "./AgentWorkflowPanel.jsx";
import { AGENT_TEAMS } from "../../data/constants.js";
import { useAgentSimulation } from "../../hooks/useAgentSimulation.js";
import { cn, agentHeader } from "../../utils.jsx";


const LANG_PAIRS=[
  {id:'ko-en',label:'한 → 영',src:'한국어',tgt:'English'},
  {id:'en-ko',label:'영 → 한',src:'English',tgt:'한국어'},
  {id:'ko-zh',label:'한 → 중',src:'한국어',tgt:'中文'},
  {id:'ko-ja',label:'한 → 일',src:'한국어',tgt:'日本語'},
];

const AGENTS=[
  {icon:Scissors,label:'청킹 에이전트',sub:'문맥 보존 의미 단위 분할 중',color:'bg-violet-600',ms:1500},
  {icon:Cpu,label:'번역 LLM 에이전트',sub:'Llama-3-Korean 70B 번역 처리 중',color:'bg-purple-600',ms:3500},
  {icon:ClipboardCheck,label:'검수 에이전트',sub:'공기업 표준 문체 검수 중',color:'bg-indigo-600',ms:1800},
];

const SOURCE_TEXT=`고속도로 교통정보시스템(EXTIS) 운영 지침에 따라 2026년 3분기 차량검지기(VDS) 기반 구간 속도 예측 모델의 성능 평가를 수행하였습니다.

평가 대상 구간은 경부선 하행 기흥IC~수원신갈IC(384.2k~389.6k)이며, 5분 집계 자료 일 2,840만 건을 활용하였습니다. 예측 모델 ex-speed-lstm v2.3의 30분 예측 평균절대오차(MAE)는 4.7 km/h로 목표 기준(5.0 km/h 이하)을 충족하였습니다.

평가 결과, 평시 평균속도 92 km/h 구간에서 돌발상황 발생 시 예측 오차가 확대되는 경향이 확인되었습니다. 2026년 9월 18일 07시 42분 급감속 사례에서는 실측 38 km/h에 대해 30분 후 예측값 44 km/h(95% 신뢰구간 38~51)를 산출하였습니다.`;

const TRANSLATED_TEXT=`In accordance with the operating guidelines of the Expressway Traffic Information System (EXTIS), a performance evaluation of the VDS-based section speed prediction model was conducted for the third quarter of 2026.

The evaluation covered the Giheung IC-Suwon Singal IC section of the Gyeongbu Line southbound (384.2k-389.6k), using 28.4 million five-minute aggregated records per day. The 30-minute mean absolute error (MAE) of the prediction model ex-speed-lstm v2.3 was 4.7 km/h, meeting the target threshold of 5.0 km/h or less.

The results confirm that prediction error widens when an incident occurs on sections with a normal average speed of 92 km/h. In the sudden-deceleration case at 07:42 on 18 September 2026, the model produced a 30-minute forecast of 44 km/h (95% confidence interval 38-51) against an observed speed of 38 km/h.`;

const CHUNKS=[
  {id:1,text:'고속도로 교통정보시스템(EXTIS) 운영 지침에 따라 2026년 3분기 차량검지기(VDS) 기반 구간 속도 예측 모델의 성능 평가를 수행하였습니다.'},
  {id:2,text:'평가 대상 구간은 경부선 하행 기흥IC~수원신갈IC(384.2k~389.6k)이며, 5분 집계 자료 일 2,840만 건을 활용하였습니다.'},
  {id:3,text:'예측 모델 ex-speed-lstm v2.3의 30분 예측 평균절대오차(MAE)는 4.7 km/h로 목표 기준(5.0 km/h 이하)을 충족하였습니다.'},
  {id:4,text:'평가 결과, 평시 평균속도 92 km/h 구간에서 돌발상황 발생 시 예측 오차가 확대되는 경향이 확인되었습니다.'},
  {id:5,text:'9월 18일 07시 42분 급감속 사례에서는 실측 38 km/h에 대해 30분 후 예측값 44 km/h를 산출하였습니다.'},
];

const SUMMARY=`2026년 3분기 VDS 기반 구간 속도 예측 모델 평가 결과, 경부선 하행 기흥IC~수원신갈IC 구간에서 30분 예측 MAE 4.7 km/h로 목표(5.0 이하) 충족. 평시 92 km/h 구간의 돌발상황 시 오차 확대 경향 확인. 9/18 07:42 급감속 사례 실측 38 km/h, 예측 44 km/h.`;

const SUMMARY_EN=`The Q3 2026 evaluation of the VDS-based section speed prediction model recorded a 30-minute MAE of 4.7 km/h on the Giheung IC-Suwon Singal IC section, meeting the 5.0 km/h target. Prediction error widens during incidents on sections averaging 92 km/h. In the 07:42 case on 18 Sep, the observed speed was 38 km/h against a 44 km/h forecast.`;

const BACK_TRANSLATED=`고속도로 교통정보시스템(EXTIS)의 운영 지침에 의거하여 2026년 3분기 VDS 기반 구간 속도 예측 모델에 대한 성능 평가가 수행되었습니다.

평가는 경부선 하행 기흥IC~수원신갈IC 구간(384.2k~389.6k)을 대상으로 하였으며, 일 2,840만 건의 5분 집계 자료를 사용하였습니다. 예측 모델 ex-speed-lstm v2.3의 30분 평균절대오차(MAE)는 4.7 km/h로 목표치인 5.0 km/h 이하를 충족하였습니다.

평가 결과 평시 평균속도가 92 km/h인 구간에서 돌발상황이 발생하면 예측 오차가 확대되는 것으로 확인되었습니다. 2026년 9월 18일 07시 42분 급감속 사례에서 모델은 실측 38 km/h에 대하여 30분 예측값 44 km/h(95% 신뢰구간 38~51)를 산출하였습니다.`;

const DEFAULT_GLOSSARY=[
  {ko:'차량검지기(VDS)',  en:'Vehicle Detection System (VDS)',  category:'검지'},
  {ko:'구간 속도',        en:'Section Speed',                   category:'교통'},
  {ko:'돌발상황',         en:'Traffic Incident',                category:'교통'},
  {ko:'이정(k)',          en:'Chainage (km post)',              category:'위치'},
  {ko:'평균절대오차',      en:'Mean Absolute Error (MAE)',       category:'모델'},
  {ko:'결측률',           en:'Missing Data Rate',               category:'품질'},
  {ko:'도로전광표지(VMS)', en:'Variable Message Sign (VMS)',     category:'시설'},
  {ko:'2차사고',          en:'Secondary Crash',                 category:'안전'},
];

/* 도메인 이관: 기본 콘텐츠 — 도메인 팩 agentContent["agent-translate"]로 키 단위 오버라이드 */
export const CONTENT_DEFAULTS={
  headerTitle:'다국어 번역·요약 에이전트',                        // string — 미제공 시 허브 카탈로그 이름 승계
  headerDesc:'ITS 기술자료·논문 입력 → 청킹·번역·검수 에이전트 → 번역문 및 요약 생성', // string — 헤더 설명(작업 흐름)
  sourceText: SOURCE_TEXT,         // string — 샘플 원문. '\n\n' 구분 문단 3개 (좌측 원문 패널·역번역 대조에 사용)
  translatedText: TRANSLATED_TEXT, // string — 번역 결과. '\n\n' 구분 문단 3개 (sourceText와 문단 수 일치 권장)
  chunks: CHUNKS,                  // {id:number,text:string}[5] — 청킹 결과(원문을 의미 단위 분할). 배열 통째 교체
  summaryKo: SUMMARY,              // string — 원문 언어 요약 (요약 패널 좌측)
  summaryEn: SUMMARY_EN,           // string — 번역 언어 요약 (요약 패널 우측)
  backTranslated: BACK_TRANSLATED, // string — 역번역 검증 텍스트. '\n\n' 구분, 첫 문단만 노출
  glossary: DEFAULT_GLOSSARY,      // {ko:string,en:string,category:string}[8] — 도메인 용어집 초기값. 배열 통째 교체
};

const TranslateAgent=({onBack,domain})=>{
  const C={...CONTENT_DEFAULTS,...(domain?.agentContent?.["agent-translate"]||{})};
  const H=agentHeader(domain,'agent-translate',C,AGENT_TEAMS);
  const {step,agentIdx,doneIdx,start:startSim,resetSim}=useAgentSimulation(AGENTS,{
    // 번역 단계(i=1) 동안 청크 진행 티커
    onStepStart:(i,prev)=>{
      if(i===1){
        C.chunks.forEach((_,ci)=>{
          setTimeout(()=>setChunkIdx(ci),prev+400+ci*580);
        });
      }
    },
    completeDelay:500,
  });
  const [langPair,setLangPair]=useState('ko-en');
  const [summaryMode,setSummaryMode]=useState(false);
  const [summaryLen,setSummaryLen]=useState(300);
  const [inputTab,setInputTab]=useState('text');
  const [srcText,setSrcText]=useState(C.sourceText);
  const [uploadFile,setUploadFile]=useState(null);
  const [drag,setDrag]=useState(false);
  const [chunkIdx,setChunkIdx]=useState(-1);
  const [copied,setCopied]=useState(false);
  const fileRef=useRef(null);
  // 용어집
  const [glossaryOpen,setGlossaryOpen]=useState(false);
  const [glossary,setGlossary]=useState(C.glossary);
  const [newKo,setNewKo]=useState('');
  const [newEn,setNewEn]=useState('');
  // 역번역 검증
  const [backMode,setBackMode]=useState(false);

  const lp=LANG_PAIRS.find(l=>l.id===langPair)||LANG_PAIRS[0];

  const startProcess=()=>{setChunkIdx(-1);startSim();};

  const reset=()=>{resetSim();setChunkIdx(-1);setUploadFile(null);setCopied(false);};

  const copyAll=()=>{
    navigator.clipboard.writeText(langPair==='ko-en'?C.translatedText:C.translatedText).catch(()=>{});
    setCopied(true);setTimeout(()=>setCopied(false),2000);
  };

  const downloadTxt=()=>{
    const blob=new Blob([C.translatedText],{type:'text/plain;charset=utf-8'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='translation_result.txt';a.click();
  };

  // STEP 1
  if(step===1)return(
    <div className="flex-1 overflow-y-auto px-6 py-8 bg-white">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-2">
          {onBack&&<button onClick={onBack} aria-label="뒤로 가기" className="text-slate-400 hover:text-violet-600 transition-colors mr-1"><ChevronRight className="w-4 h-4 rotate-180"/></button>}
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-md"><Languages className="w-5 h-5 text-white"/></div>
          <div>
            <div className="text-[15px] font-black text-slate-800">{H.title}</div>
            <div className="text-xs text-slate-400">{H.desc}</div>
          </div>
        </div>

        {/* language pair */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">1 · 번역 언어 쌍</label>
          <div className="flex gap-2 flex-wrap">
            {LANG_PAIRS.map(lp2=>(
              <button key={lp2.id} onClick={()=>setLangPair(lp2.id)}
                className={cn('px-4 py-2 rounded-full text-[13px] font-bold border-2 transition-all',
                  langPair===lp2.id?'bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-200':'border-slate-200 text-slate-500 hover:border-violet-300')}>
                {lp2.label}
              </button>
            ))}
          </div>
        </div>

        {/* summary option */}
        <div className="space-y-3">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">2 · 출력 옵션</label>
          <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1 w-fit">
            {[false,true].map(v=>(
              <button key={String(v)} onClick={()=>setSummaryMode(v)}
                className={cn('px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all',
                  summaryMode===v?'bg-white text-violet-700 shadow-sm':'text-slate-500 hover:text-slate-700')}>
                {v?'번역+요약':'번역만'}
              </button>
            ))}
          </div>
          {summaryMode&&(
            <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-bold text-violet-700">요약 목표 길이</span>
                <span className="font-black text-violet-600">{summaryLen}자</span>
              </div>
              <input type="range" min={100} max={1000} step={50} value={summaryLen}
                onChange={e=>setSummaryLen(Number(e.target.value))}
                className="w-full accent-violet-600"/>
              <div className="flex justify-between text-[10px] text-slate-400"><span>100자</span><span>1000자</span></div>
            </div>
          )}
        </div>

        {/* input */}
        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">3 · 원문 입력</label>
          <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1 w-fit mb-2">
            {[['text','직접 입력'],['file','파일 업로드']].map(([t,l])=>(
              <button key={t} onClick={()=>setInputTab(t)}
                className={cn('px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5',
                  inputTab===t?'bg-white text-violet-700 shadow-sm':'text-slate-500 hover:text-slate-700')}>
                {t==='text'?<FileText className="w-3 h-3"/>:<Upload className="w-3 h-3"/>}{l}
              </button>
            ))}
          </div>
          {inputTab==='text'?(
            <div className="relative">
              <textarea value={srcText} onChange={e=>setSrcText(e.target.value)}
                rows={8}
                placeholder={`${lp.src} 원문을 입력하세요…`}
                className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 text-[13px] text-slate-700 leading-relaxed resize-none outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200"/>
              <div className="absolute bottom-3 right-4 text-[10px] text-slate-400 font-mono">{srcText.length}자</div>
            </div>
          ):(
            <div>
              <div
                onDragOver={e=>{e.preventDefault();setDrag(true);}}
                onDragLeave={()=>setDrag(false)}
                onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f)setUploadFile(f);}}
                onClick={()=>fileRef.current?.click()}
                className={cn('border-2 border-dashed rounded-2xl flex flex-col items-center justify-center py-8 cursor-pointer transition-all',
                  drag?'border-violet-400 bg-violet-50':'border-slate-200 hover:border-violet-300 hover:bg-slate-50')}>
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.hwp,.txt" className="hidden"
                  onChange={e=>{if(e.target.files[0])setUploadFile(e.target.files[0]);}}/>
                {uploadFile?(
                  <><div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center mb-2"><FileText className="w-5 h-5 text-violet-600"/></div>
                  <div className="font-bold text-slate-700 text-sm">{uploadFile.name}</div>
                  <div className="text-xs text-slate-400 mt-1">{(uploadFile.size/1024).toFixed(0)} KB</div></>
                ):(
                  <><div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center mb-2"><Upload className="w-5 h-5 text-slate-400"/></div>
                  <div className="font-bold text-slate-500 text-sm">파일을 드래그하거나 클릭하여 업로드</div>
                  <div className="text-xs text-slate-400 mt-1">PDF · DOC · DOCX · HWP · TXT</div></>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 용어집 설정 */}
        <div className="border border-violet-200 rounded-2xl overflow-hidden">
          <button onClick={()=>setGlossaryOpen(p=>!p)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-violet-50/50 transition-colors">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-violet-500"/>
              <span className="text-[13px] font-bold text-slate-700">4 · 도메인 용어집 설정</span>
              <span className="text-[10px] font-black text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full">{glossary.length}개 등록</span>
            </div>
            <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform',glossaryOpen&&'rotate-180')}/>
          </button>
          {glossaryOpen&&(
            <div className="border-t border-violet-100 bg-violet-50/30 px-4 py-3 space-y-3">
              <div className="text-[10px] text-slate-400">용어집에 등록된 단어는 번역 시 우선 적용됩니다.</div>
              <div className="bg-white rounded-xl border border-violet-100 overflow-hidden">
                <div className="grid grid-cols-[1fr_1fr_auto] text-[10px] font-black text-slate-400 uppercase tracking-wider px-3 py-2 border-b border-slate-100 bg-slate-50">
                  <span>한국어</span><span>번역</span><span/>
                </div>
                <div className="divide-y divide-slate-50 max-h-40 overflow-y-auto">
                  {glossary.map((g,i)=>(
                    <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-center px-3 py-2 gap-2">
                      <span className="text-[11px] font-medium text-slate-700 truncate">{g.ko}</span>
                      <span className="text-[11px] text-slate-500 truncate">{g.en}</span>
                      <button onClick={()=>setGlossary(p=>p.filter((_,j)=>j!==i))}
                        aria-label="용어 삭제"
                        className="text-slate-300 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5"/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              {/* 새 용어 추가 */}
              <div className="flex items-center gap-2">
                <input value={newKo} onChange={e=>setNewKo(e.target.value)} placeholder="한국어"
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-[12px] outline-none focus:border-violet-400"/>
                <ArrowLeftRight className="w-4 h-4 text-slate-300 shrink-0"/>
                <input value={newEn} onChange={e=>setNewEn(e.target.value)} placeholder="English"
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-[12px] outline-none focus:border-violet-400"/>
                <button onClick={()=>{if(newKo&&newEn){setGlossary(p=>[...p,{ko:newKo,en:newEn,category:'사용자'}]);setNewKo('');setNewEn('');}}}
                  className="flex items-center gap-1 px-3 py-1.5 bg-violet-600 text-white rounded-lg text-[11px] font-bold hover:bg-violet-700 transition-colors shrink-0">
                  <Plus className="w-3.5 h-3.5"/>추가
                </button>
              </div>
            </div>
          )}
        </div>

        <button onClick={startProcess}
          disabled={inputTab==='text'?srcText.trim().length===0:!uploadFile}
          className="w-full py-3.5 bg-violet-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-violet-700 transition-colors shadow-lg shadow-violet-200 text-[15px] disabled:opacity-40 disabled:cursor-not-allowed">
          <Radio className="w-4 h-4"/> 번역 시작
        </button>
      </div>
    </div>
  );

  // STEP 2
  if(step===2)return(
    <div className="flex-1 flex min-h-0 overflow-hidden">
      <div className="flex-1 min-w-0 flex flex-col items-center justify-center overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-xl px-6">
          <div className="text-center mb-10">
            <div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-200">
              <Languages className="w-7 h-7 text-white animate-pulse"/>
            </div>
            <div className="text-[18px] font-black text-slate-800">번역 에이전트 처리 중</div>
            <div className="text-sm text-slate-400 mt-1">{lp.src} → {lp.tgt} 번역을 수행합니다</div>
          </div>
          <div className="space-y-3">
            {AGENTS.map((ag,i)=>{
              const isDone=doneIdx.includes(i);
              const isActive=agentIdx===i;
              const AgIcon=ag.icon;
              const showChunks=isActive&&i===1&&chunkIdx>=0;
              return(
                <div key={i}>
                  <div className={cn('rounded-2xl border-2 p-4 transition-all duration-500',
                    isDone?'border-emerald-200 bg-emerald-50/60':isActive?'border-violet-300 bg-violet-50 shadow-md shadow-violet-100':'border-slate-100 bg-white opacity-50')}>
                    <div className="flex items-center gap-3">
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all',isDone?'bg-emerald-500':isActive?ag.color:'bg-slate-200')}>
                        {isDone?<CheckCircle className="w-5 h-5 text-white"/>:<AgIcon className={cn('w-5 h-5',isActive?'text-white animate-pulse':'text-slate-400')}/>}
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
                    {isActive&&!showChunks&&(
                      <div className="mt-3"><div className="h-1 bg-violet-100 rounded-full overflow-hidden"><div className="h-1 bg-violet-500 rounded-full animate-pulse" style={{width:'55%'}}/></div></div>
                    )}
                    {showChunks&&(
                      <div className="mt-3 space-y-1.5">
                        {C.chunks.slice(0,chunkIdx+1).map((c,ci)=>(
                          <div key={c.id} className={cn('flex items-start gap-2 text-[11px] rounded-lg px-2.5 py-1.5 transition-all',
                            ci===chunkIdx?'bg-violet-100 text-violet-700 font-bold':'text-slate-400 bg-transparent')}>
                            <span className={cn('shrink-0 font-mono font-black text-[10px] mt-0.5',ci===chunkIdx?'text-violet-500':'text-slate-300')}>#{c.id}</span>
                            {ci===chunkIdx?<Loader2 className="w-3 h-3 animate-spin shrink-0 mt-0.5 text-violet-500"/>:<CheckCircle className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5"/>}
                            <span className="truncate">{c.text.slice(0,60)}…</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {i<AGENTS.length-1&&<div className="flex justify-center my-1"><ChevronRight className="w-4 h-4 text-slate-300 rotate-90"/></div>}
                </div>
              );
            })}
          </div>
          <div className="mt-8 text-center text-xs text-slate-400">
            <Network className="w-3.5 h-3.5 inline mr-1 text-violet-400"/>
            Llama-3-Korean 70B 모델 — 공기업 표준 문체 최적화 적용
          </div>
        </div>
      </div>
      <div className="hidden lg:flex w-80 shrink-0 border-l border-slate-100 bg-gradient-to-b from-slate-50 to-white p-4 overflow-y-auto custom-scrollbar flex-col">
        <AgentWorkflowPanel agentId="agent-translate" activeStep={agentIdx} doneSteps={doneIdx} />
      </div>
    </div>
  );

  // STEP 3
  const srcLen=srcText.length||C.sourceText.length;
  const tgtLen=C.translatedText.length;

  return(
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-100">
      {/* toolbar */}
      <div className="shrink-0 bg-white border-b px-5 py-2.5 flex items-center gap-2 flex-wrap shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0"><CheckCircle className="w-3.5 h-3.5 text-white"/></div>
          <div className="min-w-0">
            <div className="text-[13px] font-black text-slate-800 truncate">번역 완료 — {lp.src} → {lp.tgt}</div>
            <div className="text-[10px] text-slate-400">청크 {C.chunks.length}개 · {tgtLen}자</div>
          </div>
        </div>
        <button onClick={copyAll}
          className={cn('flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-[11px] font-bold transition-colors',
            copied?'border-emerald-300 text-emerald-600 bg-emerald-50':'text-slate-500 hover:bg-slate-50')}>
          <Copy className="w-3 h-3"/>{copied?'복사됨':'전체 복사'}
        </button>
        <button onClick={downloadTxt} className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-[11px] font-bold text-slate-500 hover:bg-slate-50 transition-colors">
          <Download className="w-3 h-3"/>TXT 다운로드
        </button>
        <button onClick={()=>setBackMode(p=>!p)}
          className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors',
            backMode?'bg-indigo-600 text-white border-indigo-600 shadow-sm':'border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-600')}>
          <RefreshCw className="w-3 h-3"/>역번역 검증
        </button>
        <button onClick={reset} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white rounded-lg text-[11px] font-bold hover:bg-violet-700 transition-colors shadow-sm">
          <RotateCcw className="w-3 h-3"/>새 번역
        </button>
      </div>

      {/* stats bar */}
      <div className="shrink-0 bg-violet-50 border-b border-violet-100 px-5 py-2">
        <div className="flex items-center gap-4 text-[11px] flex-wrap">
          {[
            {label:'원문',val:`${srcLen.toLocaleString()}자`},
            {label:'번역문',val:`${tgtLen.toLocaleString()}자`},
            {label:'청크',val:`${C.chunks.length}개`},
            {label:'처리 시간',val:'6.8초'},
            {label:'모델',val:'Llama-3-Korean 70B'},
          ].map((s,i)=>(
            <div key={i} className="flex items-center gap-1.5">
              <span className="text-slate-400">{s.label}</span>
              <span className="font-black text-violet-700">{s.val}</span>
              {i<4&&<div className="w-px h-3 bg-violet-200 ml-2"/>}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto lg:overflow-hidden flex flex-col px-6 py-4 gap-4">
        {/* split pane */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
          {/* left: source */}
          <div className="flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="shrink-0 px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-400"/>
              <span className="text-[11px] font-black text-slate-600">{lp.src} 원문</span>
              <span className="ml-auto text-[10px] text-slate-400 font-mono">{srcLen}자</span>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {C.chunks.map((c,ci)=>(
                <p key={c.id} className={cn('text-[13px] leading-relaxed mb-3 pb-3 transition-colors',
                  ci<C.chunks.length-1&&'border-b border-dashed border-slate-100',
                  ci%2===0?'text-slate-700':'text-slate-600')}>
                  <span className="inline-block text-[9px] font-black text-violet-400 bg-violet-50 px-1 py-0.5 rounded mr-1.5 font-mono align-middle">#{c.id}</span>
                  {c.text}
                </p>
              ))}
            </div>
          </div>

          {/* right: translation */}
          <div className="flex flex-col bg-white rounded-2xl border border-violet-200 shadow-sm overflow-hidden">
            <div className="shrink-0 px-4 py-2.5 bg-violet-50 border-b border-violet-100 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-500"/>
              <span className="text-[11px] font-black text-violet-700">{lp.tgt} 번역문</span>
              <span className="ml-auto text-[10px] text-violet-400 font-mono">{tgtLen}자</span>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {C.translatedText.split('\n\n').filter(Boolean).map((p,i)=>(
                <p key={i} className={cn('text-[13px] leading-relaxed mb-3 pb-3 text-slate-700',i<2&&'border-b border-dashed border-violet-100')}>
                  <span className="inline-block text-[9px] font-black text-violet-400 bg-violet-50 px-1 py-0.5 rounded mr-1.5 font-mono align-middle">#{i+1}</span>
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* 역번역 검증 패널 */}
        {backMode&&(
          <div className="shrink-0 bg-white rounded-2xl border border-indigo-200 shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 bg-indigo-50 border-b border-indigo-100 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-indigo-500"/>
              <span className="text-[11px] font-black text-indigo-700">역번역 검증 — {lp.tgt} → {lp.src}</span>
              <span className="ml-auto text-[10px] text-indigo-400 bg-indigo-100 px-2 py-0.5 rounded-full font-bold">유사도 94.2%</span>
            </div>
            <div className="px-5 py-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-wider">원문 (한국어)</div>
                <p className="text-[12px] text-slate-600 leading-relaxed line-clamp-6">{C.sourceText.split('\n\n')[0]}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">역번역 결과</div>
                  <div className="h-px flex-1 bg-indigo-100"/>
                  <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">95.1% 유사</span>
                </div>
                <p className="text-[12px] text-indigo-700 leading-relaxed line-clamp-6">{C.backTranslated.split('\n\n')[0]}</p>
              </div>
            </div>
            <div className="px-5 pb-3">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="h-1.5 bg-emerald-500 rounded-full" style={{width:'94.2%'}}/>
                </div>
                <span className="shrink-0 font-black text-emerald-600">94.2%</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">의미 보존율 기반 역번역 품질 평가 · 85% 이상: 우수</div>
            </div>
          </div>
        )}

        {/* summary panel */}
        {summaryMode&&(
          <div className="shrink-0 bg-white rounded-2xl border border-purple-200 shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 bg-purple-50 border-b border-purple-100 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500"/>
              <span className="text-[11px] font-black text-purple-700">AI 요약 ({summaryLen}자 기준)</span>
              <span className="ml-auto text-[10px] text-purple-400">원문 요약 · 번역 요약</span>
            </div>
            <div className="px-5 py-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-wider">한국어 요약</div>
                <p className="text-[12px] text-slate-600 leading-relaxed">{C.summaryKo}</p>
              </div>
              <div>
                <div className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-wider">English Summary</div>
                <p className="text-[12px] text-slate-600 leading-relaxed">{C.summaryEn}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslateAgent;
