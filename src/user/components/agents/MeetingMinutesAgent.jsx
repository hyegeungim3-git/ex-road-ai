import React, { useState, useRef, useEffect } from "react";
import {
  Volume2, ClipboardList, Radio, Loader2, CheckCircle, ChevronRight,
  Network, Trash2, UserPlus, Plus, Play, RotateCcw, Download,
  FileCheck, ExternalLink, Clock, ChevronLeft, Paperclip, Users, MessageSquare
} from "lucide-react";
import ApprovalModal from "../ApprovalModal.jsx";
import SelfCheckModal from "../SelfCheckModal.jsx";
import { MEET_AGENTS, MEET_RESULT, APV_LINE_MEET } from "../../data/responses.js";
import AgentWorkflowPanel from "./AgentWorkflowPanel.jsx";
import { AGENT_TEAMS } from "../../data/constants.js";
import { useAgentSimulation } from "../../hooks/useAgentSimulation.js";
import { agentHeader, orgLogoDataUri } from "../../utils.jsx";

/* 도메인 이관: 도로공사 기본 콘텐츠 — 도메인 팩 agentContent["agent-meeting"]로 키 단위 오버라이드 */
export const CONTENT_DEFAULTS = {
  headerTitle: '회의록 자동 작성 에이전트',                        // string — 미제공 시 허브 카탈로그 이름 승계
  headerDesc: '음성 파일 업로드 → 멀티 에이전트 처리 → 표준 회의록 생성', // string — 헤더 설명(작업 흐름)
  defaultTitle:'2026년 3분기 교통데이터 분석반 정례회의',       // string — 회의명 초기값
  defaultDate:'2026-09-18',                                    // string — YYYY-MM-DD
  defaultPlace:'본사 3층 대회의실 (304호)',                     // string — 장소 초기값
  defaultAttendees:[                                           // {name,dept,role}[] — 참석자 초기값 (원장 §1·§8 인물)
    {name:'윤상헌',dept:'디지털계획처',role:'주재(처장)'},
    {name:'이도현',dept:'디지털계획처 데이터플랫폼부',role:'차장'},
    {name:'한지훈',dept:'디지털계획처 AI인프라부',role:'팀장'},
    {name:'박선영',dept:'교통센터 상황관리부',role:'과장'},
    {name:'김태우',dept:'수도권본부 도로교통부',role:'대리'},
  ],
  defaultAgenda:['경부선 VDS 결측률 4.8% 대응 방안','속도 예측모델 ex-speed-lstm v2.3 드리프트 점검'], // string[2] — 안건 초기값
  sttSampleText:'안녕하십니까 2026년 3분기 교통데이터 분석반 정례회의를 시작하겠습니다 오늘 안건은 경부선 VDS 결측률 대응과 속도 예측모델 드리프트 점검 두 가지입니다 경부선 구간 결측률이 4.8퍼센트로 관리 임계 3.0퍼센트를 초과했습니다 원인 지점은 VDS-0010-0247이고 통신 불량이 3일째 누적되고 있습니다 오늘 아침 7시 42분 기흥IC 수원신갈IC 구간 평균속도가 38킬로미터까지 떨어졌고 평균 검지 지연은 48초였습니다 예측모델 드리프트 지수는 0.9로 임계 1.0에 근접해 재학습 조기 착수를 제안드립니다', // string — 공백 구분, STT 스트리밍 시뮬레이션 문장
  diarization:[ // {time,speaker,color,bg,border,text,docKey,meetingText}[8] — docKey는 docSections.key와 일치, color/bg/border는 tailwind 클래스
    {time:'00:00:12',speaker:'이도현',color:'text-indigo-700',bg:'bg-indigo-50',border:'border-indigo-200',
      text:'안녕하십니까. 2026년 3분기 교통데이터 분석반 정례회의를 시작하겠습니다. 오늘 안건은 경부선 VDS 결측률 대응과 속도 예측모델 드리프트 점검 두 가지입니다.',
      docKey:'open',
      meetingText:'데이터플랫폼부 주관으로 교통데이터 분석반 정례회의 개최. 참석 인원 확인 및 안건 공유.'},
    {time:'00:01:05',speaker:'한지훈',color:'text-violet-700',bg:'bg-violet-50',border:'border-violet-200',
      text:'경부선 구간 VDS 결측률이 4.8%로 관리 임계 3.0%를 초과했습니다. 원인 지점은 VDS-0010-0247이고, 통신 불량이 3일째 누적되고 있습니다.',
      docKey:'agenda1',
      meetingText:'한지훈 팀장: 경부선 VDS 결측률 4.8%(관리 임계 3.0% 초과). 원인 지점 VDS-0010-0247 통신 불량 3일 누적.'},
    {time:'00:02:33',speaker:'박선영',color:'text-emerald-700',bg:'bg-emerald-50',border:'border-emerald-200',
      text:'해당 지점 결측이 아침 급감속 검지에도 영향을 줬습니다. 오늘 07시 42분 기흥IC~수원신갈IC 평균속도가 38km/h까지 떨어졌고, 평균 검지 지연은 48초였습니다.',
      docKey:'agenda1',
      meetingText:'박선영 과장: 09.18. 07:42 기흥IC~수원신갈IC 평균속도 38 km/h 급락(평시 92 km/h), 평균 검지 지연 48초.'},
    {time:'00:04:12',speaker:'김태우',color:'text-rose-700',bg:'bg-rose-50',border:'border-rose-200',
      text:'VDS-0010-0247은 통신 불량이 3일째 누적된 상태입니다. 수도권본부 자체 현장 점검을 9월 25일자로 편성하겠습니다.',
      docKey:'agenda1',
      meetingText:'김태우 대리: VDS-0010-0247 통신 불량 3일 누적 — 수도권본부 현장 점검 2026.09.25. 편성.'},
    {time:'00:06:48',speaker:'이도현',color:'text-indigo-700',bg:'bg-indigo-50',border:'border-indigo-200',
      text:'그러면 결측률 관리 임계는 3.0%로 유지하되, 통신 불량이 3일 이상 지속되는 지점은 EXMMS 작업지시가 자동 발행되도록 규칙을 바꾸는 것으로 하겠습니다.',
      docKey:'agenda1_conc',
      meetingText:'[결론] 결측률 관리 임계 3.0% 유지 — 통신 불량 3일 이상 지속 지점은 EXMMS 작업지시 자동 발행.'},
    {time:'00:07:30',speaker:'한지훈',color:'text-violet-700',bg:'bg-violet-50',border:'border-violet-200',
      text:'동의합니다. 자동 발행 규칙은 EXMMS 연동 테스트까지 포함해 9월 25일까지 적용하겠습니다.',
      docKey:'decision',
      meetingText:'[결정①] 통신 불량 3일 이상 지속 지점 EXMMS 작업지시 자동 발행 — 2026.09.25.까지 연동 적용.'},
    {time:'00:09:15',speaker:'한지훈',color:'text-violet-700',bg:'bg-violet-50',border:'border-violet-200',
      text:'예측모델은 30분 MAE가 4.7km/h로 목표 5.0 이내지만, 드리프트 지수가 +0.9로 임계 1.0에 근접했습니다. 분기 재학습을 앞당기는 편이 좋겠습니다.',
      docKey:'agenda2',
      meetingText:'한지훈 팀장: ex-speed-lstm v2.3 30분 MAE 4.7 km/h(목표 5.0 이하), 드리프트 지수 +0.9(임계 1.0) — 재학습 조기 착수 제안.'},
    {time:'00:10:44',speaker:'이도현',color:'text-indigo-700',bg:'bg-indigo-50',border:'border-indigo-200',
      text:'오늘 논의된 조치 사항을 기한 내 이행해 주시기 바랍니다. 이상으로 회의를 마치겠습니다.',
      docKey:'close',
      meetingText:'차기 회의: 2026년 10월 16일(금) 14:00 예정. 남한강교 정밀안전진단 요청 건은 서면 공람 예정.'},
  ],
  docSections:[ // {key,num,label,brief,color}[7] — 회의록 섹션 아웃라인(key는 diarization.docKey와 연결)
    {key:'open',     num:'§1', label:'개회',               brief:'데이터플랫폼부 주관으로 교통데이터 분석반 정례회의 개최. 참석 인원 확인 및 안건 공유.', color:'slate'},
    {key:'agenda1',  num:'§2-①', label:'안건 1 · VDS 결측률 대응', brief:'경부선 결측률 4.8%(임계 3.0%) · VDS-0010-0247 통신 불량 3일 · 09.25. 현장 점검 편성.', color:'violet'},
    {key:'agenda1_conc', num:'  └결론', label:'안건 1 결론', brief:'임계 3.0% 유지 — 통신 불량 3일 이상 지속 지점은 EXMMS 작업지시 자동 발행.', color:'violet'},
    {key:'agenda2',  num:'§2-②', label:'안건 2 · 예측모델 드리프트', brief:'ex-speed-lstm v2.3 MAE 4.7 km/h · 드리프트 지수 +0.9(임계 1.0) 재학습 조기 착수.', color:'blue'},
    {key:'decision', num:'§3', label:'결정 사항',           brief:'① 작업지시 자동 발행  ② 예측모델 조기 재학습  ③ 남한강교 정밀안전진단 요청.', color:'emerald'},
    {key:'action',   num:'§4', label:'조치 사항',           brief:'4개 항목 · 담당자 배정 · 기한 2026.09.25~10.16.', color:'amber'},
    {key:'close',    num:'§5', label:'폐회',               brief:'차기 회의: 2026.10.16(금) 14:00 예정.', color:'slate'},
  ],
  speakerLegend:[ // {name,color,bg,border}[4] — 발언자 범례(diarization 화자와 일치)
    {name:'이도현',color:'text-indigo-700',bg:'bg-indigo-100',border:'border-indigo-200'},
    {name:'한지훈',color:'text-violet-700',bg:'bg-violet-100',border:'border-violet-200'},
    {name:'박선영',color:'text-emerald-700',bg:'bg-emerald-100',border:'border-emerald-200'},
    {name:'김태우',color:'text-rose-700',bg:'bg-rose-100',border:'border-rose-200'},
  ],
  actions:[ // {label,person,dept,due}[4] — §4 조치 사항 표
    {label:'VDS-0010-0247 현장 점검 및 통신 모듈 교체',person:'김태우',dept:'수도권본부 도로교통부',due:'2026.09.25'},
    {label:'EXMMS 작업지시 자동 발행 규칙 연동 적용',person:'한지훈',dept:'AI인프라부',due:'2026.09.25'},
    {label:'ex-speed-lstm v2.3 재학습 데이터셋 구성',person:'이도현',dept:'데이터플랫폼부',due:'2026.10.02'},
    {label:'남한강교 정밀안전진단 요청 공문 발송',person:'정민석',dept:'시설처 구조물관리부',due:'2026.09.25'},
  ],
  deptName:'데이터플랫폼부',              // string — 문서 헤더 담당부서
  docNum:'EX-데이터플랫폼부-2026-0158',  // string — 문서번호(결재 모달 공용)
  openingLines:['디지털계획처 데이터플랫폼부 주관으로 2026년 3분기 교통데이터 분석반 정례회의 개최','참석 인원 확인 및 안건 공유'], // string[2] — §1 개회 불릿
  agendaDiscussions:[ // {lines:string[],conclusion:string}[2] — 안건 인덱스 순서 대응(배열 밖 안건은 자동 추출 문구 표시)
    {lines:['한지훈 팀장: 경부선 구간 VDS 결측률 4.8% — 관리 임계 3.0% 초과. 원인 지점 VDS-0010-0247 통신 불량 3일 누적.','박선영 과장: 09.18. 07:42 기흥IC~수원신갈IC 평균속도 38 km/h 급락(평시 92 km/h), 평균 검지 지연 48초.','김태우 대리: VDS-0010-0247 수도권본부 자체 현장 점검 2026.09.25. 편성 예정.','정민석 차장(시설처 서면 의견): 남한강교(중부내륙선 128.6k) 신축이음 변위 12.4 mm — 계측 데이터 연속성 확보 필요.'],
     conclusion:'결측률 관리 임계 3.0% 유지 — 통신 불량 3일 이상 지속 지점은 EXMMS 작업지시 자동 발행'},
    {lines:['한지훈 팀장: ex-speed-lstm v2.3 30분 MAE 4.7 km/h(목표 5.0 이하), 드리프트 지수 +0.9(임계 1.0).','이도현 차장: 분기 재학습 주기를 앞당겨 2026년 4분기 재학습을 10월 중 착수.'],
     conclusion:'드리프트 지수 1.0 도달 전 재학습 착수 — 학습 데이터 기간 2026.09.까지 확장'},
  ],
  decisions:[ // string[3] — §3 결정 사항
    '통신 불량 3일 이상 지속 지점 EXMMS 작업지시 자동 발행 — 2026.09.25.까지 연동 적용',
    'ex-speed-lstm v2.3 재학습 조기 착수 — 학습 데이터 기간 2026.09.까지 확장, 10월 중 착수',
    '남한강교(중부내륙선 128.6k) 정밀안전진단 요청 공문(EX-시설처-2026-0357) 2026.09.25.까지 발송',
  ],
  specialNotes:['차기 회의: 2026년 10월 16일(금) 14:00 예정','데이터 품질 이슈 리포트(EX-데이터플랫폼부-2026-0142)는 서면으로 공람 예정'], // string[2] — §5 특이사항 불릿
  footerText:'본 회의록은 한국도로공사 RoadQ AI 회의록 에이전트 v1.0에 의해 자동 생성되었으며, 담당자 검토 후 확정됩니다.', // string — 문서 하단 문구
  logo: null,                          // 미제공 시 도메인 정보로 레터헤드 자동 생성
  logoAlt: null,                            // 미제공 시 '<약칭> <조직명>'
  resultText: MEET_RESULT,      // string — 원본 편집 탭 초기 텍스트
  apvLine: APV_LINE_MEET,       // {name,...}[3] — 결재선(ApprovalModal 공용)
};

const MeetingMinutesAgent = ({ onBack, domain }) => {
  const C={...CONTENT_DEFAULTS,...(domain?.agentContent?.["agent-meeting"]||{})};

  /* 문서 레터헤드 — 팩이 자체 로고를 주면 그것을, 아니면 도메인 정보로 생성.
     (기본값이 포크 원본의 래스터 로고여서 타 분야 문서에 엉뚱한 기관명이 찍히던 문제) */
  const orgMeta = { name: domain?.orgName || '조직명', short: domain?.orgShort || 'ORG', color: domain?.brandColor || '#334155' };
  const docLogo = C.logo || orgLogoDataUri(orgMeta);
  const docLogoAlt = C.logoAlt || `${orgMeta.short} ${orgMeta.name}`;
  const H=agentHeader(domain,'agent-meeting',C,AGENT_TEAMS);
  const {step,agentIdx,doneIdx,start:startSim,resetSim}=useAgentSimulation(MEET_AGENTS);
  const [title,setTitle]=useState(C.defaultTitle);
  const [meetDate,setMeetDate]=useState(C.defaultDate);
  const [place,setPlace]=useState(C.defaultPlace);
  const [attendees,setAttendees]=useState(C.defaultAttendees);
  const [agenda,setAgenda]=useState(C.defaultAgenda);
  const [audioFile,setAudioFile]=useState(null);
  const [audioDrag,setAudioDrag]=useState(false);
  const [refFile,setRefFile]=useState(null);
  const [refDrag,setRefDrag]=useState(false);
  const [result,setResult]=useState(C.resultText);
  const [viewMode,setViewMode]=useState('doc');
  const [apvState,setApvState]=useState(null);
  const [apvMsg,setApvMsg]=useState('검토 요청드립니다.');
  const [sttWords,setSttWords]=useState([]);   // 스트리밍 단어
  const [sttMeta,setSttMeta]=useState(null);   // { wer, conf, speakers }
  const [activeUtterance,setActiveUtterance]=useState(null); // 발언자 뷰 선택 발언 인덱스
  const fileRef=useRef(null);
  const refFileRef=useRef(null);

  /* STT 스트리밍 시뮬레이션 — 첫 번째 에이전트(STT)가 활성일 때 */
  const STT_SAMPLE = C.sttSampleText.split(' ');

  useEffect(()=>{
    if(agentIdx!==0){return;}
    setSttWords([]);setSttMeta(null);
    let idx=0;
    const id=setInterval(()=>{
      if(idx>=STT_SAMPLE.length){clearInterval(id);setSttMeta({wer:4.2,speakers:4});return;}
      setSttWords(p=>[...p,STT_SAMPLE[idx]]);
      idx++;
    },120);
    return ()=>clearInterval(id);
  },[agentIdx]); // eslint-disable-line

  const addAttendee=()=>setAttendees(p=>[...p,{name:'',dept:'',role:''}]);
  const removeAttendee=(i)=>setAttendees(p=>p.filter((_,j)=>j!==i));
  const addAgenda=()=>setAgenda(p=>[...p,'']);
  const removeAgenda=(i)=>setAgenda(p=>p.filter((_,j)=>j!==i));

  const startProcess=()=>startSim();

  const reset=()=>{resetSim();setAudioFile(null);setRefFile(null);setApvState(null);setApvMsg('검토 요청드립니다.');};
  const submitApv=()=>{setApvState('submitting');setTimeout(()=>{setApvState('done');},1600);};

  if(step===1) return(
    <div className="flex-1 overflow-y-auto px-6 py-8 bg-white">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-2">
          {onBack && <button onClick={onBack} aria-label="뒤로 가기" className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"><ChevronLeft className="w-5 h-5"/></button>}
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-md"><ClipboardList className="w-5 h-5 text-white"/></div>
          <div><div className="text-[15px] font-black text-slate-800">{H.title}</div><div className="text-xs text-slate-400">{H.desc}</div></div>
        </div>

        {/* 1. 회의 음성 파일 */}
        <div className="space-y-1.5">
          <label className="text-[15px] font-black text-slate-600 uppercase tracking-wider">1 · 회의 음성 파일</label>
          <div
            onDragOver={e=>{e.preventDefault();setAudioDrag(true);}}
            onDragLeave={()=>setAudioDrag(false)}
            onDrop={e=>{e.preventDefault();setAudioDrag(false);const f=e.dataTransfer.files[0];if(f)setAudioFile(f);}}
            onClick={()=>fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center py-10 cursor-pointer transition-all ${audioDrag?'border-violet-400 bg-violet-50':'border-slate-200 hover:border-violet-300 hover:bg-slate-50'}`}>
            <input ref={fileRef} type="file" accept="audio/*,.m4a,.mp3,.wav,.ogg" className="hidden" onChange={e=>{if(e.target.files[0])setAudioFile(e.target.files[0]);}}/>
            {audioFile?(
              <><div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mb-3"><Volume2 className="w-6 h-6 text-violet-600"/></div>
              <div className="font-bold text-slate-700 text-sm">{audioFile.name}</div>
              <div className="text-xs text-slate-400 mt-1">{(audioFile.size/1024/1024).toFixed(1)} MB</div></>
            ):(
              <><div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3"><Volume2 className="w-6 h-6 text-slate-400"/></div>
              <div className="font-bold text-slate-500 text-sm">음성 파일을 드래그하거나 클릭하여 업로드</div>
              <div className="text-xs text-slate-400 mt-1">MP3 · WAV · M4A · OGG 지원 | STT + 발언자 구분(Diarization) 자동 처리</div></>
            )}
          </div>
        </div>

        {/* 2. 회의 자료 첨부 (선택) — 회의 자료(PPT, 문서) 분석 후 관련 맥락 반영 */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <label className="text-[15px] font-black text-slate-600 uppercase tracking-wider">2 · 회의 자료 첨부</label>
            <span className="text-[10px] px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full font-bold">선택</span>
            <span className="text-[10px] text-slate-400 font-medium ml-1">AI가 자료를 분석하여 회의록에 맥락 반영</span>
          </div>
          <div
            onDragOver={e=>{e.preventDefault();setRefDrag(true);}}
            onDragLeave={()=>setRefDrag(false)}
            onDrop={e=>{e.preventDefault();setRefDrag(false);const f=e.dataTransfer.files[0];if(f)setRefFile(f);}}
            onClick={()=>refFileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl flex items-center gap-4 px-5 py-4 cursor-pointer transition-all ${refDrag?'border-violet-400 bg-violet-50':'border-slate-200 hover:border-violet-300 hover:bg-slate-50'}`}>
            <input ref={refFileRef} type="file" accept=".pptx,.ppt,.pdf,.hwp,.docx,.xlsx" className="hidden" onChange={e=>{if(e.target.files[0])setRefFile(e.target.files[0]);}}/>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${refFile?'bg-violet-100':'bg-slate-100'}`}>
              <Paperclip className={`w-5 h-5 ${refFile?'text-violet-600':'text-slate-400'}`}/>
            </div>
            {refFile?(
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-700 text-sm truncate">{refFile.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">{(refFile.size/1024/1024).toFixed(1)} MB · AI 맥락 분석 예정</div>
              </div>
            ):(
              <div>
                <div className="font-bold text-slate-500 text-sm">회의 자료 파일을 드래그하거나 클릭</div>
                <div className="text-xs text-slate-400 mt-0.5">PPT · PDF · HWP · DOCX 지원</div>
              </div>
            )}
            {refFile&&(
              <button onClick={e=>{e.stopPropagation();setRefFile(null);}} aria-label="첨부 파일 제거" className="ml-auto shrink-0 text-slate-300 hover:text-red-400 p-1">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
              </button>
            )}
          </div>
        </div>

        {/* 3. 회의 기본 정보 */}
        <div className="space-y-1.5">
          <label className="text-[15px] font-black text-slate-600 uppercase tracking-wider">3 · 회의 기본 정보</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2"><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="회의명" className="w-full border rounded-xl px-4 py-2.5 text-sm bg-white outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200"/></div>
            <input value={meetDate} onChange={e=>setMeetDate(e.target.value)} type="date" className="border rounded-xl px-4 py-2.5 text-sm bg-white outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200"/>
            <input value={place} onChange={e=>setPlace(e.target.value)} placeholder="장소" className="border rounded-xl px-4 py-2.5 text-sm bg-white outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200"/>
          </div>
        </div>

        {/* 4. 참석자 */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between"><label className="text-[15px] font-black text-slate-600 uppercase tracking-wider">4 · 참석자</label>
            <button onClick={addAttendee} className="flex items-center gap-1 text-xs font-bold text-violet-600 hover:text-violet-800"><UserPlus className="w-3.5 h-3.5"/>추가</button></div>
          <div className="border rounded-xl overflow-hidden divide-y">
            {attendees.map((a,i)=>(
              <div key={i} className="grid grid-cols-7 gap-0 divide-x">
                <input value={a.name} onChange={e=>setAttendees(p=>p.map((x,j)=>j===i?{...x,name:e.target.value}:x))} placeholder="성명" className="col-span-2 px-3 py-2 text-sm outline-none focus:bg-violet-50"/>
                <input value={a.dept} onChange={e=>setAttendees(p=>p.map((x,j)=>j===i?{...x,dept:e.target.value}:x))} placeholder="부서" className="col-span-2 px-3 py-2 text-sm outline-none focus:bg-violet-50"/>
                <input value={a.role} onChange={e=>setAttendees(p=>p.map((x,j)=>j===i?{...x,role:e.target.value}:x))} placeholder="직위·역할" className="col-span-2 px-3 py-2 text-sm outline-none focus:bg-violet-50"/>
                <button onClick={()=>removeAttendee(i)} aria-label="참석자 삭제" className="flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
              </div>
            ))}
          </div>
        </div>

        {/* 5. 안건 목록 */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between"><label className="text-[15px] font-black text-slate-600 uppercase tracking-wider">5 · 안건 목록</label>
            <button onClick={addAgenda} className="flex items-center gap-1 text-xs font-bold text-violet-600 hover:text-violet-800"><Plus className="w-3.5 h-3.5"/>추가</button></div>
          <div className="space-y-2">
            {agenda.map((a,i)=>(
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs font-black text-violet-500 w-5 shrink-0">{i+1}.</span>
                <input value={a} onChange={e=>setAgenda(p=>p.map((x,j)=>j===i?e.target.value:x))} placeholder={`안건 ${i+1}`} className="flex-1 border rounded-xl px-4 py-2.5 text-sm bg-white outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200"/>
                <button onClick={()=>removeAgenda(i)} aria-label="안건 삭제" className="text-slate-300 hover:text-red-400"><Trash2 className="w-3.5 h-3.5"/></button>
              </div>
            ))}
          </div>
        </div>

        <button onClick={startProcess} className="w-full py-3.5 bg-violet-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-violet-700 transition-colors shadow-lg shadow-violet-200 text-[15px]">
          <Play className="w-4 h-4 fill-white"/> 회의록 자동 작성 시작
        </button>
      </div>
    </div>
  );

  if(step===2) return(
    <div className="flex-1 flex min-h-0 overflow-hidden">
      <div className="flex-1 min-w-0 flex flex-col items-center justify-center overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-xl px-6">
          <div className="text-center mb-10">
            <div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-200">
              <Radio className="w-7 h-7 text-white animate-pulse"/>
            </div>
            <div className="text-[18px] font-black text-slate-800">멀티 에이전트 처리 중</div>
            <div className="text-sm text-slate-400 mt-1">AI 에이전트들이 순차적으로 회의 내용을 분석합니다</div>
          </div>
          <div className="space-y-3">
            {MEET_AGENTS.map((ag,i)=>{
              const isDone=doneIdx.includes(i);
              const isActive=agentIdx===i;
              const AgIcon=ag.icon;
              return(
                <div key={i}>
                  <div className={`rounded-2xl border-2 p-4 transition-all duration-500 ${isDone?'border-emerald-200 bg-emerald-50/60':isActive?'border-violet-300 bg-violet-50 shadow-md shadow-violet-100':'border-slate-100 bg-white opacity-50'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${isDone?'bg-emerald-500':isActive?ag.color:'bg-slate-200'}`}>
                        {isDone?<CheckCircle className="w-5 h-5 text-white"/>:<AgIcon className={`w-5 h-5 ${isActive?'text-white animate-pulse':'text-slate-400'}`}/>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-black text-sm ${isDone?'text-emerald-700':isActive?'text-violet-700':'text-slate-400'}`}>{ag.label}</div>
                        <div className={`text-xs mt-0.5 ${isDone?'text-emerald-500':isActive?'text-violet-500':'text-slate-300'}`}>{isActive?`처리 중 — ${ag.sub}`:isDone?`완료 — ${ag.sub}`:ag.sub}</div>
                      </div>
                      {isActive&&<Loader2 className="w-4 h-4 text-violet-500 animate-spin shrink-0"/>}
                      {isDone&&<span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">완료</span>}
                    </div>
                    {isActive&&<div className="mt-3"><div className="h-1 bg-violet-100 rounded-full overflow-hidden"><div className="h-1 bg-violet-500 rounded-full animate-pulse" style={{width:'70%'}}/></div></div>}

                    {/* STT 스트리밍 패널 — 첫 번째 에이전트(음성인식)가 활성일 때 */}
                    {isActive && i===0 && sttWords.length>0 && (
                      <div className="mt-3 rounded-xl bg-slate-900 p-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"/>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">STT 실시간 출력</span>
                          <span className="ml-auto text-[8px] text-slate-600 font-mono">Whisper-v3 · grpc://10.10.1.16:7006</span>
                        </div>
                        <p className="text-[10px] text-emerald-300 font-mono leading-relaxed">
                          {sttWords.map((w,wi)=>(
                            <span key={wi} className={wi===sttWords.length-1?'text-white':''}>{w} </span>
                          ))}
                          <span className="inline-block w-1.5 h-3 bg-emerald-400 animate-pulse ml-0.5 align-middle"/>
                        </p>
                        {sttMeta && (
                          <div className="flex gap-3 mt-2 pt-2 border-t border-slate-700">
                            <div className="text-center"><div className="text-[11px] font-black text-amber-400">{sttMeta.wer}%</div><div className="text-[8px] text-slate-500">WER</div></div>
                            <div className="text-center"><div className="text-[11px] font-black text-violet-400">{sttMeta.speakers}명</div><div className="text-[8px] text-slate-500">화자</div></div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {i<MEET_AGENTS.length-1&&<div className="flex justify-center my-1"><ChevronRight className="w-4 h-4 text-slate-300 rotate-90"/></div>}
                </div>
              );
            })}
          </div>
          <div className="mt-8 text-center text-xs text-slate-400">
            <Network className="w-3.5 h-3.5 inline mr-1 text-violet-400"/>
            멀티 에이전트 아키텍처 — 각 에이전트가 독립적으로 최적화된 작업을 수행합니다
          </div>
        </div>
      </div>
      <div className="hidden lg:flex w-80 shrink-0 border-l border-slate-100 bg-gradient-to-b from-slate-50 to-white p-4 overflow-y-auto custom-scrollbar flex-col">
        <AgentWorkflowPanel agentId="agent-meeting" activeStep={agentIdx} doneSteps={doneIdx} />
      </div>
    </div>
  );

  const downloadDoc=()=>{
    const html=`<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><title>회의록 — ${title}</title>
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
      .hd-h1{font-size:34px;font-weight:900;letter-spacing:.4em;padding-right:.4em;white-space:nowrap;font-family:'HY견고딕','돋움','맑은 고딕',sans-serif;color:#041E54;line-height:1.2}
      .hd-meta-lbl{display:flex;align-items:center;justify-content:center;padding:7px 10px;background:#dfeaf5;border-right:1px solid #003A70;font-size:12px;font-weight:700;color:#003A70}
      .hd-meta-val{display:flex;align-items:center;padding:7px 12px;border-right:1px solid #003A70;font-size:13.5px;color:#1a202c;font-weight:600}
      .hd-meta-val-last{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:2px;padding:7px 12px;font-size:12px;color:#1a202c}
      .body{background:white;padding:24px 30px}
      .info-tbl{width:100%;border-collapse:collapse;border-top:2px solid #003A70;margin-bottom:18px}
      .info-tbl td{padding:9px 11px;border-bottom:1px solid #e2e8f0;font-size:14px;line-height:1.75}
      .lbl{font-weight:700;color:#003A70;width:72px;white-space:nowrap}
      .chip{display:inline-flex;align-items:center;gap:3px;padding:2px 7px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:3px;margin:2px;font-size:11px}
      .dvd{display:flex;align-items:center;gap:6px;margin:12px 0}.dvd hr{flex:1;border:none;border-top:1px solid #e2e8f0}.dvd span{width:5px;height:5px;border-radius:50%;background:#cbd5e0;display:inline-block}
      .sh{display:flex;align-items:center;gap:7px;font-size:15.5px;font-weight:900;color:#1a202c;margin:20px 0 9px}
      .sn{width:22px;height:22px;background:#003A70;color:white;border-radius:3px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;flex-shrink:0}
      .sc{margin-left:27px;font-size:14px;line-height:2.0;word-break:keep-all}
      .ag{border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;margin-bottom:8px}
      .ag-hd{padding:7px 12px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:12px}
      .ag-tag{font-weight:900;color:#00539F;background:#eff6ff;border:1px solid #bfdbfe;padding:1px 5px;border-radius:2px;margin-right:5px}
      .ag-bd{padding:9px 13px;font-size:13px;color:#4a5568;line-height:1.85;word-break:keep-all}
      .ag-bd p{margin:3px 0}
      .conc{margin-top:8px;padding-top:8px;border-top:1px dashed #e2e8f0;font-size:12px}
      .conc-badge{background:#f0fdf4;border:1px solid #bbf7d0;color:#166534;font-weight:900;padding:1px 5px;border-radius:2px;margin-right:5px}
      .dec{display:flex;align-items:flex-start;gap:7px;margin-bottom:7px;font-size:13px}
      .dn{width:19px;height:19px;background:#00539F;color:white;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:900;flex-shrink:0;margin-top:1px}
      .atbl{width:100%;border-collapse:collapse;border-top:2px solid #003A70;font-size:12px}
      .atbl th{background:#003A70;color:white;padding:7px 9px;font-weight:700}
      .atbl td{padding:7px 9px;border-bottom:1px solid #e2e8f0}
      .atbl tr:nth-child(even) td{background:#f8fafc}
      .due{font-weight:700;color:#c05621}.dnum{font-weight:700;color:#00539F}
      .sig-area{border-top:2px solid #003A70;padding-top:14px;margin-top:20px}
      .sig-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
      .sig-box{border:1px solid #cbd5e0;border-radius:5px;overflow:hidden}
      .sig-lbl{background:#003A70;color:white;text-align:center;padding:6px;font-size:12px;font-weight:700}
      .sig-sp{height:54px}
      .footer{text-align:center;font-size:11px;color:#a0aec0;margin-top:12px}
    </style>
    </head><body>
    <script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};</script>
    <div class="hd">
      <div class="hd-grid">
        <div class="hd-logo"><img src="${docLogo}" alt="${docLogoAlt}"/></div>
        <div class="hd-title"><div class="hd-h1">회 의 록</div></div>
        <div class="hd-meta">
          <div class="hd-meta-lbl">담당부서</div>
          <div class="hd-meta-val">${C.deptName}</div>
          <div class="hd-meta-lbl">문서번호</div>
          <div class="hd-meta-val-last"><span style="font-family:monospace;font-weight:700;font-size:12px">${C.docNum}</span><span style="color:#6b7280;font-size:10px">수신: 내부결재</span></div>
        </div>
      </div>
    </div>
    <div class="body">
      <table class="info-tbl">
        <tr><td class="lbl">회 의 명</td><td colspan="3"><strong>${title}</strong></td></tr>
        <tr><td class="lbl">일      시</td><td>${meetDate.replace(/-/g,'.')}.</td><td class="lbl">장      소</td><td>${place}</td></tr>
        <tr><td class="lbl" style="vertical-align:top;padding-top:10px">참 석 자</td><td colspan="3">${attendees.map(a=>`<span class="chip"><strong>${a.name}</strong> · ${a.dept}${a.role?` (${a.role})`:''}</span>`).join('')}</td></tr>
      </table>
      <div class="dvd"><hr><span></span><hr></div>
      <div class="sh"><span class="sn">1</span> 개회</div>
      <div class="sc" style="color:#4a5568;font-size:13px">${C.openingLines.map(l=>`<p style="margin:1px 0">· ${l}</p>`).join('')}</div>
      <div class="sh"><span class="sn">2</span> 안건 토의</div>
      <div class="sc">${agenda.map((ag,i)=>`<div class="ag"><div class="ag-hd"><span class="ag-tag">[안건 ${i+1}]</span><strong>${ag}</strong></div><div class="ag-bd">${C.agendaDiscussions[i]?C.agendaDiscussions[i].lines.map(l=>`<p>· ${l}</p>`).join(''):'<p style="color:#a0aec0;font-style:italic">· 안건 내용이 STT 에이전트에 의해 자동 추출되었습니다.</p>'}<div class="conc"><span class="conc-badge">결론</span>${C.agendaDiscussions[i]?.conclusion||'추후 논의 예정'}</div></div></div>`).join('')}</div>
      <div class="sh"><span class="sn">3</span> 결정 사항</div>
      <div class="sc">${C.decisions.map((d,i)=>`<div class="dec"><span class="dn">${i+1}</span><span>${d}</span></div>`).join('')}</div>
      <div class="sh"><span class="sn">4</span> 조치 사항</div>
      <div class="sc"><table class="atbl"><thead><tr><th style="width:32px">No.</th><th>조치 내용</th><th style="width:66px;text-align:center">담당자</th><th style="width:82px;text-align:center">부서</th><th style="width:82px;text-align:center">완료 기한</th></tr></thead><tbody>${C.actions.map((a,i)=>`<tr><td class="dnum" style="text-align:center">${i+1}</td><td>${a.label}</td><td style="text-align:center;font-weight:700">${a.person}</td><td style="text-align:center">${a.dept}</td><td class="due" style="text-align:center">${a.due}</td></tr>`).join('')}</tbody></table></div>
      <div class="sh"><span class="sn">5</span> 특이사항</div>
      <div class="sc" style="color:#4a5568;font-size:13px">${C.specialNotes.map(l=>`<p style="margin:1px 0">· ${l}</p>`).join('')}</div>
      <div class="sig-area">
        <div class="sig-grid">${['작  성  자','검  토  자','승  인  자'].map(r=>`<div class="sig-box"><div class="sig-lbl">${r}</div><div class="sig-sp"></div></div>`).join('')}</div>
        <p class="footer">${C.footerText}</p>
      </div>
    </div>
    </body></html>`;
    const w=window.open('','_blank','width=900,height=1200');
    w.document.write(html);
    w.document.close();
    w.focus();
  };

  return(
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-100">
      <div className="shrink-0 bg-white border-b px-5 py-2.5 flex items-center gap-2 flex-wrap shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0"><CheckCircle className="w-3.5 h-3.5 text-white"/></div>
          <div className="min-w-0">
            <div className="text-[13px] font-black text-slate-800 truncate">회의록 생성 완료</div>
            <div className="text-[10px] text-slate-400">{attendees.length}명 · 안건 {agenda.length}건</div>
          </div>
        </div>
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
          {[['doc','문서 보기'],['speakers','발언자 구분'],['edit','원본 편집']].map(([m,l])=>(
            <button key={m} onClick={()=>setViewMode(m)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${viewMode===m?'bg-white text-violet-700 shadow-sm':'text-slate-500 hover:text-slate-700'}`}>{l}</button>
          ))}
        </div>
        <button onClick={reset} className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-[11px] font-bold text-slate-500 hover:bg-slate-50 transition-colors"><RotateCcw className="w-3 h-3"/>새 회의록</button>
        <button onClick={downloadDoc} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00539F] text-white rounded-lg text-[11px] font-bold hover:bg-[#002571] transition-colors shadow-sm"><Download className="w-3 h-3"/>PDF 출력</button>
        {apvState!=='done'
          ?<button onClick={()=>setApvState('selfcheck')} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[11px] font-bold hover:bg-emerald-700 transition-colors shadow-sm"><FileCheck className="w-3 h-3"/>결재 상신</button>
          :<span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold"><CheckCircle className="w-3 h-3"/>결재 진행 중</span>
        }
      </div>

      {apvState==='done'&&(
        <div className="shrink-0 bg-emerald-50 border-b border-emerald-100 px-5 py-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"/>
              <span className="text-[11px] font-black text-slate-700">결재 현황</span>
              <span className="text-[9px] font-bold text-white bg-[#00539F] px-1.5 py-0.5 rounded">WorksOn</span>
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
              <span className="text-[10px] text-slate-400 font-mono">APV-2026-0314-031</span>
              <a href="#" onClick={e=>e.preventDefault()} className="text-[10px] font-bold text-blue-500 hover:underline flex items-center gap-0.5">WorksOn에서 보기<ExternalLink className="w-2.5 h-2.5"/></a>
            </div>
          </div>
        </div>
      )}

      {apvState==='selfcheck'&&(
        <SelfCheckModal
          docType="meeting"
          domain={domain}
          onClose={()=>setApvState(null)}
          onProceed={()=>setApvState('modal')}
        />
      )}

      {(apvState==='modal'||apvState==='submitting')&&(
        <ApprovalModal
          docTitle={`회의록 — ${title}`}
          docNum={C.docNum}
          apvLine={C.apvLine}
          apvMsg={apvMsg} setApvMsg={setApvMsg}
          onClose={()=>setApvState(null)}
          onSubmit={submitApv}
          submitting={apvState==='submitting'}
          accentBg="bg-[#00539F]"
          accentBtn="bg-[#00539F] hover:bg-[#002571]"
        />
      )}

      <div className={`flex-1 ${viewMode==='speakers'?'flex overflow-hidden':'overflow-y-auto px-6 py-6'}`}>
        {/* ── 발언자 구분 (Speaker Diarization) view — split layout ── */}
        {viewMode==='speakers'&&(
          <>
          {/* Left: Transcript */}
          <div className="flex-1 overflow-y-auto px-5 py-5 min-w-0">
            <div className="max-w-xl mx-auto">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-white"/>
                </div>
                <div>
                  <div className="text-[14px] font-black text-slate-800">발언자 구분 (Speaker Diarization)</div>
                  <div className="text-[11px] text-slate-400">발언을 클릭하면 회의록 반영 위치를 확인할 수 있습니다</div>
                </div>
                <div className="ml-auto shrink-0">
                  <div className="text-[10px] px-2 py-1 bg-violet-100 text-violet-700 rounded-lg font-bold border border-violet-200">
                    {C.diarization.length}개 발언
                  </div>
                </div>
              </div>
              {/* Speaker legend */}
              <div className="flex flex-wrap gap-1.5 mb-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 mr-0.5 self-center">참석자</span>
                {C.speakerLegend.map((s,i)=>(
                  <span key={i} className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold border ${s.bg} ${s.border} ${s.color}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0"/>
                    {s.name}
                  </span>
                ))}
              </div>
              {/* Transcript — clickable */}
              <div className="space-y-2">
                {C.diarization.map((d,i)=>{
                  const isActive=activeUtterance===i;
                  const sameSection=activeUtterance!==null&&C.diarization[activeUtterance]?.docKey===d.docKey&&!isActive;
                  return(
                    <div key={i}
                      onClick={()=>setActiveUtterance(isActive?null:i)}
                      className={`flex gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150
                        ${isActive?`ring-2 ring-violet-400 shadow-md ${d.bg} ${d.border}`
                        :sameSection?`${d.bg} ${d.border} opacity-60`
                        :`${d.bg} ${d.border} hover:shadow-sm hover:opacity-90`}`}>
                      <div className="shrink-0 text-right w-16">
                        <div className={`text-[10px] font-black ${d.color} mb-0.5`}>{d.speaker}</div>
                        <div className="text-[9px] font-mono text-slate-400">{d.time}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] text-slate-700 leading-relaxed">{d.text}</div>
                        {/* 회의록 반영 내용 — 활성일 때만 */}
                        {isActive&&(
                          <div className="mt-2 pt-2 border-t border-violet-200 flex items-start gap-1.5 animate-in fade-in duration-150">
                            <ChevronRight className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5"/>
                            <div>
                              <div className="text-[10px] font-black text-violet-500 mb-0.5">회의록 반영 내용</div>
                              <div className="text-[12px] text-violet-700 leading-relaxed">{d.meetingText}</div>
                            </div>
                          </div>
                        )}
                      </div>
                      {/* 회의록 섹션 뱃지 */}
                      <div className="shrink-0 self-start pt-0.5">
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border transition-all
                          ${isActive?'bg-violet-600 text-white border-violet-600':'bg-white/70 text-slate-400 border-slate-200'}`}>
                          {C.docSections.find(s=>s.key===d.docKey)?.num}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-center text-[10px] text-slate-400 pt-3">
                Whisper-v3 · 한국어 특화 화자 분리 모델 적용
              </div>
            </div>
          </div>

          {/* Right: 회의록 섹션 아웃라인 */}
          <div className="hidden lg:block w-60 shrink-0 border-l border-slate-200 bg-white overflow-y-auto px-4 py-5">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MessageSquare className="w-3 h-3"/>회의록 구조
            </div>
            <div className="space-y-1.5">
              {C.docSections.map(sec=>{
                const isHighlighted=activeUtterance!==null&&C.diarization[activeUtterance]?.docKey===sec.key;
                const utterCount=C.diarization.filter(d=>d.docKey===sec.key).length;
                return(
                  <div key={sec.key}
                    className={`rounded-xl border p-2.5 transition-all duration-200
                      ${isHighlighted?'bg-violet-50 border-violet-300 shadow-sm':'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded shrink-0
                        ${isHighlighted?'bg-violet-600 text-white':'bg-slate-200 text-slate-500'}`}>
                        {sec.num}
                      </span>
                      <span className={`text-[12px] font-bold truncate
                        ${isHighlighted?'text-violet-800':'text-slate-600'}`}>
                        {sec.label}
                      </span>
                    </div>
                    {utterCount>0&&(
                      <div className={`text-[10px] mt-1 font-medium ${isHighlighted?'text-violet-500':'text-slate-400'}`}>
                        발언 {utterCount}건 반영
                      </div>
                    )}
                    {isHighlighted&&(
                      <div className="mt-2 pt-2 border-t border-violet-200 text-[11px] text-violet-700 leading-relaxed animate-in fade-in duration-150">
                        {sec.brief}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className={`mt-4 p-2.5 rounded-xl border text-[10px] leading-relaxed transition-all
              ${activeUtterance!==null?'bg-violet-50 border-violet-200 text-violet-600':'bg-slate-50 border-slate-100 text-slate-400'}`}>
              {activeUtterance!==null
                ?`"${C.diarization[activeUtterance].speaker}" 발언이 회의록 ${C.docSections.find(s=>s.key===C.diarization[activeUtterance].docKey)?.label} 항목에 반영되었습니다.`
                :'발언을 클릭하면 회의록 반영 위치를 확인할 수 있습니다.'}
            </div>
          </div>
          </>
        )}

        {/* ── 원본 편집 view ── */}
        {viewMode==='edit'&&(
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border shadow-sm overflow-hidden">
            <textarea value={result} onChange={e=>setResult(e.target.value)}
              className="w-full p-6 font-mono text-[13px] text-slate-700 leading-relaxed resize-none outline-none"
              style={{minHeight:640}}/>
          </div>
        )}

        {/* ── 문서 보기 view ── */}
        {viewMode==='doc'&&(
          <div className="max-w-3xl mx-auto shadow-2xl rounded-lg overflow-hidden"
            style={{fontFamily:"'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif",lineHeight:1.85,wordBreak:'keep-all',letterSpacing:'-0.01em'}}>
            {/* Document header — 공문 레터헤드 양식 */}
            <div style={{border:'1px solid #003A70',display:'grid',gridTemplateColumns:'170px 1fr',gridTemplateRows:'auto auto'}}>
              {/* 로고 — 2행 span */}
              <div style={{gridColumn:'1',gridRow:'1/3',display:'flex',alignItems:'center',justifyContent:'center',padding:'16px 14px',background:'#fff',borderRight:'1px solid #003A70'}}>
                <img src={docLogo} alt={docLogoAlt} style={{width:'156px',height:'auto'}}/>
              </div>
              {/* 문서 제목 */}
              <div style={{gridColumn:'2',gridRow:'1',display:'flex',alignItems:'center',justifyContent:'center',padding:'18px 14px',background:'#e6e6e6',borderBottom:'1px solid #003A70',overflow:'hidden'}}>
                <div style={{fontSize:'34px',fontWeight:900,letterSpacing:'0.5em',paddingRight:'0.5em',fontFamily:"'HY견고딕','돋움','맑은 고딕',sans-serif",color:'#041E54',lineHeight:1.2,whiteSpace:'nowrap'}}>
                  회의록
                </div>
              </div>
              {/* 메타 정보 행 */}
              <div style={{gridColumn:'2',gridRow:'2',display:'grid',gridTemplateColumns:'72px 1fr 72px 1fr'}}>
                <div style={{padding:'7px 10px',background:'#dfeaf5',borderRight:'1px solid #003A70',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <span style={{fontSize:'12px',fontWeight:700,color:'#003A70'}}>담당부서</span>
                </div>
                <div style={{padding:'7px 12px',borderRight:'1px solid #003A70',display:'flex',alignItems:'center'}}>
                  <span style={{fontSize:'13px',color:'#1a202c',fontWeight:600}}>{C.deptName}</span>
                </div>
                <div style={{padding:'7px 10px',background:'#dfeaf5',borderRight:'1px solid #003A70',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <span style={{fontSize:'12px',fontWeight:700,color:'#003A70'}}>문서번호</span>
                </div>
                <div style={{padding:'7px 12px',display:'flex',flexDirection:'column',justifyContent:'center',gap:'2px'}}>
                  <span style={{fontSize:'12px',fontFamily:'monospace',fontWeight:700,color:'#1a202c'}}>{C.docNum}</span>
                  <span style={{fontSize:'10px',color:'#6b7280'}}>수신: 내부결재</span>
                </div>
              </div>
            </div>
            <div className="bg-white px-10 py-8 space-y-7">
              <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[14px]" style={{borderTop:'2px solid #003A70'}}>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-3 pr-4 font-bold text-[#003A70] w-24 whitespace-nowrap align-top">회 의 명</td>
                    <td className="py-3 pr-8 font-semibold text-slate-800" colSpan={3}>{title}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-3 pr-4 font-bold text-[#003A70] whitespace-nowrap">일      시</td>
                    <td className="py-3 pr-8 text-slate-700">{meetDate.replace(/-/g,'.')}.</td>
                    <td className="py-3 pr-4 font-bold text-[#003A70] whitespace-nowrap">장      소</td>
                    <td className="py-3 text-slate-700">{place}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-3 pr-4 font-bold text-[#003A70] whitespace-nowrap align-top">참 석 자</td>
                    <td className="py-3 text-slate-700" colSpan={3}>
                      <div className="flex flex-wrap gap-2">
                        {attendees.map((a,i)=>(
                          <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-[12px]">
                            <span className="font-bold text-slate-700">{a.name}</span>
                            <span className="text-slate-400">·</span>
                            <span className="text-slate-500">{a.dept}</span>
                            {a.role&&<span className="text-[10px] text-blue-500 font-medium">({a.role})</span>}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              </div>
              <div className="flex items-center gap-3"><div className="flex-1 h-px bg-slate-200"/><div className="w-1.5 h-1.5 rounded-full bg-slate-300"/><div className="flex-1 h-px bg-slate-200"/></div>
              <section>
                <h3 className="flex items-center gap-2 text-[16px] font-black text-slate-800 mb-3">
                  <span className="w-7 h-7 rounded-md bg-[#003A70] flex items-center justify-center text-white text-[11px] font-black shrink-0">1</span>개회
                </h3>
                <div className="ml-9 text-[14px] text-slate-700 leading-relaxed space-y-1.5">
                  {C.openingLines.map((l,i)=>(<p key={i}>· {l}</p>))}
                </div>
              </section>
              <section>
                <h3 className="flex items-center gap-2 text-[16px] font-black text-slate-800 mb-3">
                  <span className="w-7 h-7 rounded-md bg-[#003A70] flex items-center justify-center text-white text-[11px] font-black shrink-0">2</span>안건 토의
                </h3>
                <div className="ml-9 space-y-5">
                  {agenda.map((ag,i)=>(
                    <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="px-4 py-2.5 bg-slate-50 border-b flex items-center gap-2">
                        <span className="text-[11px] font-black text-[#00539F] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">[안건 {i+1}]</span>
                        <span className="text-[13px] font-bold text-slate-700">{ag}</span>
                      </div>
                      <div className="px-4 py-3 space-y-1.5 text-[12px] text-slate-600 leading-relaxed">
                        {C.agendaDiscussions[i]
                          ? C.agendaDiscussions[i].lines.map((l,li)=>(<p key={li}>· {l}</p>))
                          : <p className="text-slate-400 italic">· 안건 내용이 STT 에이전트에 의해 자동 추출되었습니다.</p>}
                        <div className="mt-2 pt-2 border-t border-dashed border-slate-200 flex items-center gap-1.5">
                          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">결론</span>
                          <span className="text-[11px] text-slate-500">{C.agendaDiscussions[i]?.conclusion||'추후 논의 예정'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <h3 className="flex items-center gap-2 text-[16px] font-black text-slate-800 mb-3">
                  <span className="w-7 h-7 rounded-md bg-[#003A70] flex items-center justify-center text-white text-[11px] font-black shrink-0">3</span>결정 사항
                </h3>
                <div className="ml-9 space-y-2">
                  {C.decisions.map((d,i)=>(
                    <div key={i} className="flex items-start gap-2.5 text-[14px] text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-[#00539F] text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <h3 className="flex items-center gap-2 text-[16px] font-black text-slate-800 mb-3">
                  <span className="w-7 h-7 rounded-md bg-[#003A70] flex items-center justify-center text-white text-[11px] font-black shrink-0">4</span>조치 사항
                </h3>
                <div className="ml-9 overflow-x-auto">
                  <table className="w-full border-collapse text-[12px]" style={{borderTop:'2px solid #003A70'}}>
                    <thead>
                      <tr style={{background:'#003A70'}}>
                        <th className="text-white font-bold py-2.5 px-3 text-left w-10">No.</th>
                        <th className="text-white font-bold py-2.5 px-3 text-left">조치 내용</th>
                        <th className="text-white font-bold py-2.5 px-3 text-center w-20">담당자</th>
                        <th className="text-white font-bold py-2.5 px-3 text-center w-24">부서</th>
                        <th className="text-white font-bold py-2.5 px-3 text-center w-24">완료 기한</th>
                      </tr>
                    </thead>
                    <tbody>
                      {C.actions.map((a,i)=>(
                        <tr key={i} className={i%2===0?'bg-white':'bg-slate-50/60'} style={{borderBottom:'1px solid #e2e8f0'}}>
                          <td className="py-2.5 px-3 text-center font-bold text-[#00539F]">{i+1}</td>
                          <td className="py-2.5 px-3 text-slate-700 font-medium">{a.label}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-700">{a.person}</td>
                          <td className="py-2.5 px-3 text-center text-slate-500">{a.dept}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-orange-600">{a.due}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
              <section>
                <h3 className="flex items-center gap-2 text-[16px] font-black text-slate-800 mb-3">
                  <span className="w-7 h-7 rounded-md bg-[#003A70] flex items-center justify-center text-white text-[11px] font-black shrink-0">5</span>특이사항
                </h3>
                <div className="ml-9 text-[14px] text-slate-700 space-y-1.5">
                  {C.specialNotes.map((l,i)=>(<p key={i}>· {l}</p>))}
                </div>
              </section>
              <div className="pt-4" style={{borderTop:'2px solid #003A70'}}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {['작  성  자','검  토  자','승  인  자'].map((r,i)=>(
                    <div key={i} className="border border-slate-300 rounded-lg overflow-hidden">
                      <div className="py-1.5 text-center text-[12px] font-bold text-white" style={{background:'#003A70'}}>{r}</div>
                      <div className="h-16 flex items-end justify-center pb-2">
                        <div className="w-16 border-b border-slate-300"/>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-center text-[11px] text-slate-400 mt-4">
                  {C.footerText}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingMinutesAgent;
