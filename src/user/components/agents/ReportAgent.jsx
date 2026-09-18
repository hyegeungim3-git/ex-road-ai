import React, { useState } from "react";
import {
  FileText, Search, Filter, Cpu, Radio, Loader2, CheckCircle,
  ChevronRight, Network, Play, RotateCcw, Download, FileCheck,
  ExternalLink, Clock, Edit3, Eye, Printer
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ResponsiveContainer, Cell, LabelList
} from "recharts";
import ApprovalModal from "../ApprovalModal.jsx";
import SelfCheckModal from "../SelfCheckModal.jsx";
import AgentWorkflowPanel from "./AgentWorkflowPanel.jsx";
import { AGENT_TEAMS } from "../../data/constants.js";
import { useAgentSimulation } from "../../hooks/useAgentSimulation.js";
import { cn, agentHeader, downloadTextFile, orgLogoDataUri } from "../../utils.jsx";


const APV_LINE=[
  {name:'이도현',dept:'데이터플랫폼부',title:'차장',role:'작성자'},
  {name:'한지훈',dept:'AI인프라부',title:'팀장',role:'검토자'},
  {name:'윤상헌',dept:'디지털계획처',title:'처장',role:'승인자'},
];

const AGENTS=[
  {icon:Search, label:'템플릿 검색기',  sub:'표준 보고서 양식 불러오는 중',    color:'bg-emerald-600', ms:1600},
  {icon:Filter, label:'데이터 정제기',  sub:'입력 정보 매핑 및 정제 중',       color:'bg-green-600',   ms:2200},
  {icon:Cpu,    label:'보고서 포맷터', sub:'GPT-OSS 120B 문서 생성 중',      color:'bg-teal-600',    ms:2500},
];

const REPORT_TYPES=[
  {id:'weekly',    label:'주간실적보고',       icon:'📊', desc:'주간 업무 실적 및 차주 계획'},
  {id:'field',     label:'현장점검보고',       icon:'🏗️', desc:'도로 시설물 현장 점검 결과 보고'},
  {id:'monthly',   label:'월간실적보고',       icon:'📈', desc:'월간 종합 업무 실적 보고'},
  {id:'officetel', label:'교통데이터 분석보고', icon:'🚦', desc:'분기별 교통량·속도 동향 분석 보고'},
  {id:'market',    label:'돌발상황 상황보고',  icon:'🚨', desc:'돌발상황 검지·대응 경과 보고'},
];

const TONES=[
  {id:'formal',   label:'공식체',  desc:'공문서 개조식 문체'},
  {id:'summary',  label:'요약체',  desc:'핵심만 간결하게'},
  {id:'detailed', label:'상세체',  desc:'배경·근거 포함 상세'},
];

const LENGTHS_REPORT=[
  {id:'short',  label:'단문 (1~2p)', desc:'핵심 위주'},
  {id:'medium', label:'표준 (3~5p)', desc:'일반 업무 보고'},
  {id:'long',   label:'장문 (6p+)',  desc:'종합 분석 보고'},
];

/* 내보내기 형식 — 백엔드 없이 브라우저에서 실제로 만들 수 있는 것만 둔다.
   한글(.hwpx)은 독점 바이너리라 클라이언트에서 생성 불가 → 메뉴 하단에 변환 경유를 명시하고,
   한글이 그대로 열 수 있는 .html을 대신 제공한다. */
const EXPORT_FORMATS=[
  {label:'Word (.doc)',  icon:'📄', ext:'doc',  color:'text-blue-600'},
  {label:'HTML (.html)', icon:'📋', ext:'html', color:'text-green-600'},
  {label:'PDF (인쇄)',   icon:'📕', ext:'pdf',  color:'text-red-600'},
];

const DOC_NUMS={
  weekly:    'EX-데이터플랫폼부-2026-0148',
  field:     'EX-시설처-2026-0358',
  monthly:   'EX-데이터플랫폼부-2026-0141',
  officetel: 'EX-데이터플랫폼부-2026-0139',
  market:    'EX-교통센터-2026-0912',
};

const REPORT_DEFAULTS={
  market:{
    dept:'교통센터 상황관리부',
    period:'2026. 09. 18. 07:42 ~ 08:30',
    mainWork:'- 07:42 경부선 하행 386.8k 급감속 클러스터 7건/2분 자동 검지\n- 구간 평균속도 92 → 38 km/h 급락 (평시 대비 -59%)\n- 2차사고 위험도 0.78 (경보 임계 0.70) → VMS 3기 경보 송출\n- 08:12 30분 후 예측 속도 44 km/h (95% 신뢰구간 38~51)',
    nextPlan:'- 견인 완료 후 차로 차단 해제 및 VMS 경보 해제\n- 상황 종료 보고 EXTIS 등록 및 검지~조치 소요시간 분석\n- 동일 구간 반복 발생 여부 점검 및 검지 임계 재조정 검토',
    special:'- 검지 지연 48초 (목표 60초 이내) — 현장 확인 결과 오탐 아님\n- 수도권본부 용인지사 합동 대응, 우회 안내 VMS 2기 추가 송출',
  },
  weekly:{
    dept:'디지털계획처 데이터플랫폼부',
    period:'2026. 09. 14. ~ 09. 18.',
    mainWork:'- VDS 5분 집계 수집 파이프라인 점검 8건 완료 (일 2,840만 건)\n- 경부선 구간 결측률 4.8% 원인 분석 — VDS-0010-0247 통신 불량 3일 누적\n- ex-speed-lstm v2.3 30분 MAE 4.7 km/h 검증 (목표 5.0 이하 충족)',
    nextPlan:'- VDS-0010-0247 통신 모듈 교체 요청 및 결측 보정 재적재\n- 적재 지연 최대 4분 12초 구간 원인 분석 (임계 3분)\n- 3분기 교통데이터 분석 보고서 작성',
    special:'- 예측 모델 드리프트 지수 +0.9 (임계 1.0) 근접 — 분기 재학습 일정 조기화 검토',
  },
  field:{
    dept:'시설처 구조물관리부',
    period:'2026. 09. 17. (수)',
    mainWork:'- 남한강교(중부내륙선 128.6k) 신축이음 변위 12.4 mm 계측 (관리 임계 15.0 mm)\n- 가속도 RMS 2.8 → 3.4 m/s² 상승 추세 기록 (최근 30일)\n- 교량 받침·신축이음 육안 점검 및 사진 기록 완료',
    nextPlan:'- 계측 이력 EXAM 등록 및 정밀안전진단 요청 공문 상신\n- 영동선 대관령 구간 노면 결빙 취약 지점 합동 점검 일정 협의',
    special:'- 잔존수명 추정 14개월 — 정밀안전진단 권고 판정',
  },
  monthly:{
    dept:'디지털계획처 데이터플랫폼부',
    period:'2026. 08.',
    mainWork:'- 돌발상황 자동 검지 142건 처리 (현장 확인 139건, 오탐 3건 — 오탐률 2.1%)\n- 평균 검지 지연 48초 (목표 60초 이내 충족)\n- 데이터 품질 점검 47건 완료, 결측 구간 조치 11건',
    nextPlan:'- 9월 결측률 개선 과제 착수 (노후 VDS 교체 우선순위 산정)\n- 지역본부별 혼잡지수 월간 리포트 자동화',
    special:'- 하이패스 일평균 통행량 512만 대 — 명절 특별교통대책 최대 618만 대 대비 시나리오 점검 필요',
  },
  officetel:{
    dept:'디지털계획처 데이터플랫폼부',
    period:'2026. 07. ~ 09. (3분기)',
    mainWork:"- '26년 3분기 고속도로 교통량·속도 동향 분석 완료 (8개 지역본부, 상시 관측지점 2,340개소)\n- 하이패스 일평균 통행량 512만 대, 명절 특별교통대책 최대 618만 대\n- 지역본부 혼잡지수 수도권 78로 최고, 강원 33으로 최저 (0~100)\n- 경부선 하행 기흥IC~수원신갈IC 평시 평균속도 92 km/h, 첨두 급락 1건(38 km/h)\n- 이상탐지 오탐률 2.1%, 평균 검지 지연 48초 — 목표(60초 이내) 유지",
    nextPlan:"- '26년 4분기 동향 분석 준비 (10월 집계 개시)\n- 지역본부별 VDS 관측지점 유지·교체 현황 점검\n- 분석 결과 도로처·교통센터 공유 및 특별교통대책 반영\n- 결측률 3.0% 초과 구간 지표 이상치 검증 작업",
    special:"- 경부선 하행 결측률 4.8%: 관리 임계 3.0% 초과 — VDS-0010-0247 통신 불량 3일 누적\n- 적재 지연 최대 4분 12초(임계 3분) — 야간 배치 시간대 집중\n- 예측 모델 드리프트 지수 +0.9(임계 1.0) 근접, 재학습 주기 점검 필요",
  },
};

/* ── 차트 데이터 ── */
// 교통데이터 분석 — 월평균 통행속도 추이 (km/h)
const INDEX_TREND=[
  {month:'2026.7월', 전국:88.4, 수도권:82.6, 경부선:92.3},
  {month:'2026.8월', 전국:88.1, 수도권:82.1, 경부선:91.8},
  {month:'2026.9월', 전국:88.9, 수도권:83.0, 경부선:92.0},
];
// 구간별 전분기 대비 변동률 (%)
const REGION_RATE=[
  {area:'전국',    속도:-0.39, 혼잡시간:0.20,  결측률:0.5},
  {area:'수도권',  속도:-0.62, 혼잡시간:0.48,  결측률:0.8},
  {area:'대전충남',속도:-0.21, 혼잡시간:0.12,  결측률:0.2},
  {area:'강원',    속도:0.35,  혼잡시간:-0.18, 결측률:-0.4},
  {area:'경부선',  속도:-0.74, 혼잡시간:0.61,  결측률:1.4},
];
// 주간/월간 실적 차트 데이터
const WEEKLY_CHART=[
  {item:'파이프라인', 완료:8, 목표:10},
  {item:'품질 이슈',  완료:3, 목표:5},
  {item:'분석 리포트',완료:2, 목표:2},
];
const MONTHLY_CHART=[
  {item:'품질 점검', 완료:47, 목표:50},
  {item:'검지 검증', 완료:18, 목표:20},
  {item:'결측 조치', 완료:11, 목표:15},
];
const FIELD_CHART=[
  {item:'점검 시설물',완료:5, 목표:5},
  {item:'계측 이력',  완료:8, 목표:10},
  {item:'현황 기록',  완료:3, 목표:3},
];

const CustomTooltip=({active,payload,label})=>{
  if(!active||!payload?.length) return null;
  return(
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-[11px]">
      <div className="font-black text-slate-700 mb-1">{label}</div>
      {payload.map(p=>(
        <div key={p.name} className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{background:p.color}}/>
          <span className="text-slate-600">{p.name}:</span>
          <span className="font-bold" style={{color:p.color}}>{p.value}{typeof p.value==='number'&&p.value<=10?'건':''}</span>
        </div>
      ))}
    </div>
  );
};

/* ── 도메인 이관: 기본 콘텐츠 (모듈 상수) ── */
// 통계 보고(분석 보고서) 레이아웃용 데이터
const PRESS_KPI_CARDS=[
  {label:'일평균 통행량',value:'512만 대',sub:'명절 최대 618만 대',color:'#1e40af'},
  {label:'평시 평균속도',value:'92 km/h',sub:'경부선 기흥~신갈',color:'#16a34a'},
  {label:'검지 오탐률',value:'2.1%',sub:'평균 지연 48초',color:'#16a34a'},
  {label:'VDS 결측률',value:'▲ 4.8%',sub:'관리 임계 3.0%',color:'#dc2626'},
];
const PRESS_KPI_STATS=[
  {label:'수집량(5분 집계)',value:'일 2,840만 건'},
  {label:'30분 예측 MAE',value:'4.7 km/h'},
  {label:'최대 적재 지연',value:'4분 12초'},
];
const PRESS_SECTIONS=[
  {num:'1',title:'교통량 동향',
    regions:[{area:'일평균',rate:'512만 대',prev:'498만 대'},{area:'명절 최대',rate:'618만 대',prev:'602만 대'},{area:'수집량',rate:'2,840만 건',prev:'2,760만 건'}],
    details:[
      {area:'수도권',rate:'지수 78',note:'8개 지역본부 중 최고. 첨두 시간대 경부선·영동선 유입이 겹치며 혼잡지수 상위 유지 (혼잡시간 전분기 대비 +0.48%)'},
      {area:'대전충남',rate:'지수 61',note:'하계 휴가철 이후 감소했으나 물류 통행 비중이 높아 중위권 유지 (전분기 59→61)'},
      {area:'강원',rate:'지수 33',note:'8개 본부 중 최저. 영동선 주말 집중 패턴은 유지되어 주중·주말 편차가 큼'},
    ],
  },
  {num:'2',title:'속도·정체 동향',
    regions:[{area:'평시 속도',rate:'92 km/h',prev:'대비 -0.39%'},{area:'정체 임계',rate:'40 km/h',prev:'동일'},{area:'혼잡시간',rate:'+0.20%',prev:'증가'}],
    details:[
      {area:'경부선',rate:'38 km/h',note:'9/18 07:42 하행 기흥IC~수원신갈IC 급락(평시 대비 -59%). 30분 후 예측 44 km/h(신뢰구간 38~51)로 회복 전망'},
      {area:'영동선',rate:'-1.2 ℃',note:'대관령 구간 노면온도 하강. 결빙 확률 0.62로 주의 임계(0.50) 초과 — 동절기 사전 대응 대상'},
      {area:'중부내륙',rate:'12.4 mm',note:'남한강교(128.6k) 신축이음 변위. 관리 임계 15.0 mm 이내이나 상승 추세로 정밀안전진단 권고'},
    ],
  },
  {num:'3',title:'돌발상황·이상탐지 동향',
    regions:[{area:'오탐률',rate:'2.1%',prev:'2.3%'},{area:'검지 지연',rate:'48초',prev:'52초'},{area:'위험도 경보',rate:'0.78',prev:'0.70'}],
    details:[
      {area:'검지',rate:'7건/2분',note:'9/18 07:42 경부선 하행 386.8k 급감속 클러스터. 자동 검지 후 VMS 3기 경보 송출'},
      {area:'오탐',rate:'2.1%',note:'분기 누적 오탐률. 목표 대비 안정적이나 야간 저교통량 구간에서 편차가 큼'},
      {area:'지연',rate:'48초',note:'평균 검지 지연. 목표 60초 이내 충족 — 결측률이 높은 구간일수록 지연이 증가하는 경향'},
    ],
  },
];
const PRESS_INDEX_GROUPS=[
  {label:'월평균 통행속도 (km/h)',rows:[{a:'전국',v1:'88.4',v2:'88.1',v3:'88.9',c:'-0.39'},{a:'수도권',v1:'82.6',v2:'82.1',v3:'83.0',c:'-0.62'},{a:'경부선',v1:'92.3',v2:'91.8',v3:'92.0',c:'-0.74'}]},
  {label:'일평균 통행량 (만 대)',rows:[{a:'전국',v1:'508',v2:'521',v3:'512',c:'+0.8'},{a:'수도권',v1:'196',v2:'201',v3:'198',c:'+1.0'},{a:'경부선',v1:'42.1',v2:'43.6',v3:'42.8',c:'+1.7'}]},
  {label:'VDS 결측률 (%)',rows:[{a:'전국',v1:'2.4',v2:'2.7',v3:'2.9',c:'+0.5'},{a:'수도권',v1:'3.3',v2:'3.7',v3:'4.1',c:'+0.8'},{a:'경부선',v1:'3.4',v2:'4.1',v3:'4.8',c:'+1.4'}]},
];
const PRESS_RATIO_DATA=[
  {area:'수도권',  결측률:4.1,오탐률:2.4},
  {area:'대전충남',결측률:2.8,오탐률:1.9},
  {area:'부산경남',결측률:2.4,오탐률:2.0},
  {area:'강원',    결측률:3.3,오탐률:2.6},
  {area:'전국',    결측률:2.9,오탐률:2.1},
];

/* 인쇄용 HTML 빌더 — (args, C, org) 계약.
   본문 데이터는 C(CONTENT_DEFAULTS+팩 병합)의 press* 키에서 생성하고, 조직명·브랜드색은 org에서 취한다.
   팩은 press* 데이터만 공급하면 인쇄물이 완성되며, 필요 시 함수 자체를 통째로 교체할 수도 있다.
   buildPressHtml: 보도자료(통계) 레이아웃 / buildReportHtml: 일반 보고서 레이아웃 */
/* 인쇄 HTML의 조직 폴백 — 호출부(downloadDoc)는 항상 domain 기반 org를 넘긴다 */
const FALLBACK_ORG={name:'조직명',short:'ORG',color:'#334155',en:'ORGANIZATION'};

/* ── 인쇄용 SVG 생성 헬퍼 — 기존 인쇄 마크업 구조(HTML/CSS·SVG 차트) 유지, 값·라벨·색만 데이터에서 ── */
const _r=v=>Math.round(v*100)/100;
const _tick=v=>{const n=+v||0;const a=Math.abs(n);return String(parseFloat(a>=100?n.toFixed(0):a>=10?n.toFixed(1):n.toFixed(2)));};
const _signTick=v=>(+v>0?'+':'')+_tick(v);
const _valLabel=v=>{const n=+v||0;return Math.abs(n)>=10?String(parseFloat(n.toFixed(1))):String(n);};
const _rateColor=v=>{const s=String(v??'').trim();return s.startsWith('-')?'#dc2626':s.startsWith('+')?'#16a34a':'#475569';};

/* 좌측 카드: 지표 월별 추이 꺾은선 (pressTrendData/pressTrendSeries/pressTrendDomain) */
const _pressTrendSvg=C=>{
  const data=C.pressTrendData||[],series=C.pressTrendSeries||[];
  const [mn,mx]=C.pressTrendDomain||[0,100];const rg=(mx-mn)||1;
  const X0=40,W=250,Y0=10,H=110,PAD=35;
  const xi=i=>_r(data.length>1?X0+PAD+i*(W-2*PAD)/(data.length-1):X0+W/2);
  const yi=v=>_r(Y0+(mx-(+v||0))/rg*H);
  const grid=[1,2,3].map(k=>`<line x1="${X0}" y1="${_r(Y0+k*H/4)}" x2="${X0+W}" y2="${_r(Y0+k*H/4)}" stroke="#e2e8f0" stroke-dasharray="3,3"/>`).join('');
  const yLbls=[0,1,2,3].map(k=>`<text x="${X0-4}" y="${_r(Y0+k*H/4+4)}" text-anchor="end" font-size="7" fill="#94a3b8">${_tick(mx-k*rg/4)}</text>`).join('');
  const xLbls=data.map((d,i)=>`<text x="${xi(i)}" y="132" text-anchor="middle" font-size="8" fill="#64748b">${String(d.month??'').replace(/^\d+\./,'')}</text>`).join('');
  const lines=series.map(s=>{
    const pts=data.map((d,i)=>`${xi(i)},${yi(d[s.key])}`).join(' ');
    const dots=data.map((d,i)=>`<circle cx="${xi(i)}" cy="${yi(d[s.key])}" r="3.5" fill="${s.color}"/>`).join('');
    const f=data[0],l=data[data.length-1];
    const lbls=f&&l?`<text x="${_r(xi(0)-3)}" y="${_r(yi(f[s.key])-5)}" text-anchor="end" font-size="7" fill="${s.color}" font-weight="700">${f[s.key]}</text><text x="${_r(xi(data.length-1)+4)}" y="${_r(yi(l[s.key])+3)}" font-size="7" fill="${s.color}" font-weight="700">${l[s.key]}</text>`:'';
    return `<polyline points="${pts}" fill="none" stroke="${s.color}" stroke-width="2.5" stroke-linejoin="round"/>${dots}${lbls}`;
  }).join('');
  const legend=series.map((s,i)=>`<rect x="${60+i*50}" y="140" width="16" height="3" rx="1" fill="${s.color}"/><text x="${80+i*50}" y="143" font-size="7" fill="#64748b">${s.key}</text>`).join('');
  return `<svg viewBox="0 0 310 155" width="100%" style="display:block;margin-bottom:6px">
      <defs><linearGradient id="gBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f0f9ff"/><stop offset="100%" stop-color="#f8fafc"/></linearGradient></defs>
      <rect x="${X0}" y="${Y0}" width="${W}" height="${H}" fill="url(#gBg)" rx="3"/>
      ${grid}${yLbls}${xLbls}${lines}${legend}
    </svg>`;
};

/* 우측 카드: 그룹 막대 (pressBarData/pressBarSeries) — 값<0이면 color, 0 이상이면 posColor (화면 미리보기와 동일 규칙) */
const _pressBarSvg=C=>{
  const data=C.pressBarData||[],series=C.pressBarSeries||[];
  const X0=40,W=250,Y0=10,H=110,BW=10,GAP=3;
  const vals=data.flatMap(d=>series.map(s=>+d[s.key]||0));
  let P=Math.max(0,...vals)*1.15,N=Math.min(0,...vals)*1.15;
  if(P-N===0){P=1;N=-1;}
  const sc=H/(P-N);const zy=_r(Y0+P*sc);
  const slot=data.length?W/data.length:W;const gw=series.length*BW+(series.length-1)*GAP;
  const groups=data.map((d,i)=>{
    const gx=X0+i*slot+(slot-gw)/2;
    const bars=series.map((s,j)=>{
      const v=+d[s.key]||0;const h=Math.max(_r(Math.abs(v)*sc),1);
      return `<rect x="${_r(gx+j*(BW+GAP))}" y="${v>=0?_r(zy-h):zy}" width="${BW}" height="${h}" rx="2" fill="${v<0?s.color:s.posColor}"/>`;
    }).join('');
    return `<g>${bars}<text x="${_r(gx+gw/2)}" y="132" text-anchor="middle" font-size="7.5" fill="#334155" font-weight="700">${d.area}</text></g>`;
  }).join('');
  const yLbls=[
    P>0?`<text x="${X0-4}" y="${Y0+4}" text-anchor="end" font-size="7" fill="#94a3b8">${_signTick(P)}</text>`:'',
    `<text x="${X0-4}" y="${_r(zy+3)}" text-anchor="end" font-size="7" fill="#94a3b8">0</text>`,
    N<0?`<text x="${X0-4}" y="${Y0+H+4}" text-anchor="end" font-size="7" fill="#94a3b8">${_signTick(N)}</text>`:'',
  ].join('');
  const legend=series.map((s,i)=>`<rect x="${60+i*50}" y="140" width="10" height="5" rx="1" fill="${s.color}"/><text x="${74+i*50}" y="145" font-size="7" fill="#64748b">${s.key}</text>`).join('');
  return `<svg viewBox="0 0 310 155" width="100%" style="display:block;margin-bottom:6px">
      <rect x="${X0}" y="${Y0}" width="${W}" height="${H}" fill="#fafbfd" rx="3"/>
      <line x1="${X0}" y1="${_r(Y0+H*0.25)}" x2="${X0+W}" y2="${_r(Y0+H*0.25)}" stroke="#e2e8f0" stroke-dasharray="3,3"/>
      <line x1="${X0}" y1="${zy}" x2="${X0+W}" y2="${zy}" stroke="#94a3b8" stroke-width="1.2"/>
      <line x1="${X0}" y1="${_r(Y0+H*0.75)}" x2="${X0+W}" y2="${_r(Y0+H*0.75)}" stroke="#e2e8f0" stroke-dasharray="3,3"/>
      ${yLbls}${groups}${legend}
    </svg>`;
};

/* 이중축 막대 (pressRatioData) — 좌축 leftKey는 threshold 이상이면 경고색, 우축 rightKey (화면 미리보기와 동일 규칙) */
const _pressRatioSvg=C=>{
  const data=C.pressRatioData||[];const lk=C.pressRatioLeftKey,rk=C.pressRatioRightKey;
  const [lmn,lmx]=C.pressRatioLeftDomain||[0,100];const lrg=(lmx-lmn)||1;
  const [rmn,rmx]=C.pressRatioRightDomain||[0,10];const rrg=(rmx-rmn)||1;
  const th=C.pressRatioThreshold;
  const X0=50,W=270,Y0=10,H=105,BOT=Y0+H;
  const yl=v=>_r(Y0+(lmx-(+v||0))/lrg*H),yr=v=>_r(Y0+(rmx-(+v||0))/rrg*H);
  const grid=[0,1,2,3,4].map(k=>`<line x1="${X0}" y1="${_r(Y0+k*H/4)}" x2="${X0+W}" y2="${_r(Y0+k*H/4)}" stroke="#e2e8f0" stroke-dasharray="3,3"/><text x="${X0-4}" y="${_r(Y0+k*H/4+4)}" text-anchor="end" font-size="7" fill="#94a3b8">${_tick(lmx-k*lrg/4)}%</text>`).join('');
  const thLine=th!=null?`<line x1="${X0}" y1="${yl(th)}" x2="${X0+W}" y2="${yl(th)}" stroke="#ef4444" stroke-dasharray="4,3" stroke-width="1"/><text x="${X0+W-2}" y="${_r(yl(th)-3)}" text-anchor="end" font-size="7" fill="#ef4444" font-weight="700">${C.pressRatioRefLabel||''}</text>`:'';
  const slot=data.length?W/data.length:W;
  const groups=data.map((d,i)=>{
    const gx=X0+i*slot+(slot-47)/2;
    const lv=+d[lk]||0,rv=+d[rk]||0;
    const ly=Math.min(yl(lv),BOT-1),ry=Math.min(yr(rv),BOT-1);
    return `<g><rect x="${_r(gx)}" y="${ly}" width="22" height="${_r(BOT-ly)}" rx="3" fill="${th!=null&&lv>=th?'#fca5a5':'#bfdbfe'}"/><rect x="${_r(gx+25)}" y="${ry}" width="22" height="${_r(BOT-ry)}" rx="3" fill="#6ee7b7"/><text x="${_r(gx+11)}" y="${_r(ly-4)}" text-anchor="middle" font-size="7" fill="#3b82f6" font-weight="700">${_valLabel(lv)}%</text><text x="${_r(gx+36)}" y="${_r(ry-4)}" text-anchor="middle" font-size="7" fill="#16a34a" font-weight="700">${_valLabel(rv)}%</text><text x="${_r(gx+23.5)}" y="130" text-anchor="middle" font-size="8" fill="#334155" font-weight="700">${d.area}</text></g>`;
  }).join('');
  const legend=th!=null
    ?`<rect x="65" y="142" width="12" height="5" rx="1" fill="#fca5a5"/><text x="81" y="147" font-size="7" fill="#64748b">${lk}(≥${th}%)</text><rect x="145" y="142" width="12" height="5" rx="1" fill="#bfdbfe"/><text x="161" y="147" font-size="7" fill="#64748b">${lk}(&lt;${th}%)</text><rect x="225" y="142" width="12" height="5" rx="1" fill="#6ee7b7"/><text x="241" y="147" font-size="7" fill="#64748b">${rk}</text>`
    :`<rect x="65" y="142" width="12" height="5" rx="1" fill="#bfdbfe"/><text x="81" y="147" font-size="7" fill="#64748b">${lk}</text><rect x="145" y="142" width="12" height="5" rx="1" fill="#6ee7b7"/><text x="161" y="147" font-size="7" fill="#64748b">${rk}</text>`;
  return `<svg viewBox="0 0 340 155" width="100%" style="display:block;margin-bottom:8px">
    <rect x="${X0}" y="${Y0}" width="${W}" height="${H}" fill="#fafbfd" rx="3"/>
    ${grid}${thLine}${groups}${legend}
  </svg>`;
};

const buildPressHtml=({title,docNum,dept,period,mainWork,nextPlan,special,apvLine,logo},C=CONTENT_DEFAULTS,org=FALLBACK_ORG)=>`<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8">
<title>${title} — ${docNum}</title>
<style>
  @page{size:A4;margin:12mm 15mm}
  *{-webkit-print-color-adjust:exact;print-color-adjust:exact;box-sizing:border-box}
  body{font-family:'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif;margin:0;color:#1a202c;font-size:12px;line-height:1.75;word-break:keep-all;letter-spacing:-0.01em}
  .hd{border:1px solid ${org.color};display:grid;grid-template-columns:150px 1fr;grid-template-rows:auto auto;margin-bottom:14px}
  .hd-logo{grid-column:1;grid-row:1/3;display:flex;align-items:center;justify-content:center;padding:14px 12px;background:#fff;border-right:1px solid ${org.color}}
  .hd-logo img{width:150px;height:auto}
  .hd-title{grid-column:2;grid-row:1;display:flex;align-items:center;justify-content:center;padding:14px 12px;background:#e6e6e6;border-bottom:1px solid ${org.color}}
  .hd-h1{font-size:28px;font-weight:900;letter-spacing:.4em;padding-right:.4em;color:${org.color};line-height:1.2}
  .hd-meta{grid-column:2;grid-row:2;display:grid;grid-template-columns:64px 1fr 64px 1fr}
  .hd-ml{display:flex;align-items:center;justify-content:center;padding:6px 8px;background:#dbeafe;border-right:1px solid ${org.color};font-size:10px;font-weight:700;color:${org.color}}
  .hd-mv{display:flex;align-items:center;padding:6px 10px;border-right:1px solid ${org.color};font-size:11px;color:#1a202c;font-weight:600}
  .hd-mv-last{display:flex;flex-direction:column;justify-content:center;gap:2px;padding:6px 10px;font-size:10px;color:#1a202c}
  .kpi{background:#eef2ff;border:1px solid #c7d2fe;border-radius:8px;padding:12px 16px;margin-bottom:12px}
  .kpi-title{font-size:10px;font-weight:800;color:${org.color};margin-bottom:10px}
  .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:8px}
  .kpi-card{background:#fff;border:1px solid #e0e7ff;border-radius:6px;padding:8px 10px;text-align:center}
  .kpi-lbl{font-size:9px;color:#6b7280;font-weight:700;margin-bottom:3px}
  .kpi-val{font-size:16px;font-weight:900;line-height:1.2}
  .kpi-sub{font-size:9px;color:#9ca3af;margin-top:2px}
  .kpi-stat{background:#f8fafc;border:1px solid #e2e8f0;border-radius:5px;padding:5px 8px;display:flex;justify-content:space-between;align-items:center}
  .kpi-sl{font-size:9px;color:#6b7280;font-weight:600}
  .kpi-sv{font-size:11px;color:#1e3a8a;font-weight:800}
  .sh{display:flex;align-items:center;gap:7px;font-size:13px;font-weight:900;color:#1a202c;margin:14px 0 7px}
  .sn{width:20px;height:20px;background:${org.color};color:white;border-radius:3px;display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:900;flex-shrink:0}
  .ml{margin-left:27px}
  .rcard-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:8px}
  .rcard{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:6px 10px}
  .rcard-area{font-size:9px;color:#94a3b8;font-weight:700;margin-bottom:1px}
  .rcard-rate{font-size:14px;font-weight:900;line-height:1.2}
  .rcard-prev{font-size:9px;color:#cbd5e1;margin-top:2px}
  .drow{display:flex;gap:6px;font-size:11px;line-height:1.6;align-items:flex-start;margin-bottom:5px}
  .drow-area{font-weight:800;color:${org.color};width:36px;flex-shrink:0}
  .drow-rate{font-weight:700;flex-shrink:0;width:52px}
  .drow-note{color:#475569}
  table.idx{width:100%;border-collapse:collapse;font-size:10px;border:1px solid #e2e8f0}
  table.idx th{background:${org.color};color:#fff;padding:5px 7px;font-weight:700;text-align:left}
  table.idx td{padding:4px 7px;border-bottom:1px solid #f1f5f9}
  table.idx tr.cat td{background:#dbeafe;font-weight:800;color:${org.color}}
  .note{font-size:9px;color:#9ca3af;margin-top:4px}
  table.jw{width:100%;border-collapse:collapse;font-size:10px;border:1px solid #e2e8f0}
  table.jw th{background:${org.color};color:#fff;padding:5px 7px;font-weight:700;text-align:center}
  table.jw td{padding:4px 7px;border-bottom:1px solid #f1f5f9;text-align:center}
  .contact{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:8px 12px;font-size:10px;color:#64748b;margin-top:14px}
  .sig-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:14px;border-top:2px solid ${org.color};padding-top:12px}
  .sig-box{border:1px solid #cbd5e0;border-radius:5px;overflow:hidden}
  .sig-lbl{background:${org.color};color:white;text-align:center;padding:5px;font-size:10px;font-weight:700}
  .sig-sp{height:48px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:6px;gap:2px}
  .sig-name{font-size:12px;font-weight:700;color:#334155}
  .sig-dept{font-size:10px;color:#94a3b8}
  .footer{text-align:center;font-size:9px;color:#9ca3af;margin-top:10px}
  .red{color:#dc2626}.green{color:#16a34a}.blue{color:#1e40af}.gray{color:#475569}
</style></head><body>
<script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};</script>
<div class="hd">
  <div class="hd-logo"><img src="${logo}" alt="${org.name}"/></div>
  <div class="hd-title"><div class="hd-h1">${title}</div></div>
  <div class="hd-meta">
    <div class="hd-ml">담당부서</div><div class="hd-mv">${dept}</div>
    <div class="hd-ml">문서번호</div>
    <div class="hd-mv-last"><span style="font-family:monospace;font-weight:700">${docNum}</span><span style="color:#6b7280;font-size:9px">수신: 내부결재</span></div>
  </div>
</div>

<table style="width:100%;border-collapse:collapse;font-size:11px;border-top:2px solid ${org.color};margin-bottom:12px">
  <tr style="border-bottom:1px solid #e2e8f0"><td style="padding:5px 8px;font-weight:700;color:${org.color};width:80px">담당 부서</td><td style="padding:5px 8px;font-weight:600" colspan="3">${dept}</td></tr>
  <tr style="border-bottom:1px solid #e2e8f0"><td style="padding:5px 8px;font-weight:700;color:${org.color}">조사 기간</td><td style="padding:5px 8px">${period}</td><td style="padding:5px 8px;font-weight:700;color:${org.color};width:70px">배포 일시</td><td style="padding:5px 8px">${C.pressDistDate||''}</td></tr>
  <tr style="border-bottom:1px solid #e2e8f0"><td style="padding:5px 8px;font-weight:700;color:${org.color}">주요 내용</td><td style="padding:5px 8px;font-size:10px" colspan="3">${mainWork.replace(/\n/g,'<br/>')}</td></tr>
</table>

<div class="kpi">
  <div class="kpi-title">${C.pressKpiTitle||''}</div>
  <div class="kpi-grid">
    ${(C.pressKpiCards||[]).map(c=>`<div class="kpi-card"><div class="kpi-lbl">${c.label}</div><div class="kpi-val" style="color:${c.color}">${c.value}</div><div class="kpi-sub">${c.sub}</div></div>`).join('')}
  </div>
  <div style="display:grid;grid-template-columns:repeat(${(C.pressKpiStats||[]).length||3},1fr);gap:6px">
    ${(C.pressKpiStats||[]).map(s=>`<div class="kpi-stat"><span class="kpi-sl">${s.label}</span><span class="kpi-sv">${s.value}</span></div>`).join('')}
  </div>
</div>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 14px">
    <div style="font-size:10px;font-weight:800;color:${org.color};margin-bottom:6px;letter-spacing:0.03em">${C.pressTrendTitle||''}</div>
    ${_pressTrendSvg(C)}
  </div>
  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 14px">
    <div style="font-size:10px;font-weight:800;color:${org.color};margin-bottom:6px;letter-spacing:0.03em">${C.pressBarTitle||''}</div>
    ${_pressBarSvg(C)}
  </div>
</div>

${(C.pressSections||[]).map(sec=>`<div class="sh"><span class="sn">${sec.num}</span> ${sec.title}</div>
<div class="ml">
  <div class="rcard-grid">
    ${(sec.regions||[]).map(g=>`<div class="rcard"><div class="rcard-area">${g.area}</div><div class="rcard-rate" style="color:${_rateColor(g.rate)}">${g.rate}</div><div class="rcard-prev">전분기 ${g.prev}</div></div>`).join('')}
  </div>
  ${(sec.details||[]).map(d=>`<div class="drow"><span class="drow-area">${d.area}</span><span class="drow-rate" style="color:${_rateColor(d.rate)}">(${d.rate})</span><span class="drow-note">${d.note}</span></div>`).join('')}
</div>`).join('\n')}

<div class="sh"><span class="sn">${(C.pressSections||[]).length+1}</span> ${C.pressIndexTitle||''}</div>
<div class="ml">
  <table class="idx">
    <thead><tr>${(C.pressIndexHead||[]).map(h=>`<th>${h}</th>`).join('')}</tr></thead>
    <tbody>
      ${(C.pressIndexGroups||[]).map(g=>`<tr class="cat"><td colspan="${(C.pressIndexHead||[]).length||5}">${g.label}</td></tr>`+(g.rows||[]).map(rw=>`<tr><td>${rw.a}</td><td>${rw.v1}</td><td>${rw.v2}</td><td>${rw.v3}</td><td style="color:${_rateColor(rw.c)}">${rw.c}</td></tr>`).join('')).join('\n      ')}
    </tbody>
  </table>
  <p class="note">${C.pressIndexNote||''}</p>
</div>

<div class="sh"><span class="sn">${(C.pressSections||[]).length+2}</span> ${C.pressRatioTitle||''}</div>
<div class="ml">
  ${_pressRatioSvg(C)}
  <table class="jw">
    <thead><tr><th>구분</th><th>${C.pressRatioLeftKey||''}(%)</th><th>${C.pressRatioRightKey||''}(%)</th><th>임계 초과 여부</th></tr></thead>
    <tbody>
      ${(C.pressRatioData||[]).map((row,i,arr)=>{const lv=+row[C.pressRatioLeftKey]||0;const hi=C.pressRatioThreshold!=null&&lv>=C.pressRatioThreshold;const last=i===arr.length-1;return `<tr${last?' style="background:#f0f9ff;font-weight:700"':''}><td>${row.area}</td><td class="blue">${row[C.pressRatioLeftKey]}</td><td class="green">${row[C.pressRatioRightKey]}</td><td class="${hi?'red':'gray'}"${hi?' style="font-weight:700"':''}>${hi?'임계 초과':'정상'}</td></tr>`;}).join('\n      ')}
    </tbody>
  </table>
  <p class="note">${C.pressRatioNote||''}</p>
</div>

<div class="sh"><span class="sn">${(C.pressSections||[]).length+3}</span> 향후 계획</div>
<div class="ml" style="font-size:11px;color:#374151;line-height:1.9">${nextPlan.replace(/\n/g,'<br/>')}</div>

<div class="sh"><span class="sn">${(C.pressSections||[]).length+4}</span> 특이 사항</div>
<div class="ml" style="font-size:11px;color:#374151;line-height:1.9">${(special||'(해당 없음)').replace(/\n/g,'<br/>')}</div>

<div class="contact">
  <span style="font-weight:700;color:${org.color}">문의</span> ${C.pressContact||''}
</div>

<div class="sig-grid">
  ${(apvLine||[]).map(p=>`<div class="sig-box"><div class="sig-lbl">${p.role}</div><div class="sig-sp"><div class="sig-name">${p.name}</div><div class="sig-dept">${p.dept}</div></div></div>`).join('')}
</div>
<p class="footer">본 보고서는 RoadQ AI 보고서 작성 에이전트에 의해 자동 생성되었으며, 담당자 검토 후 확정됩니다.</p>
</body></html>`;

const buildReportHtml=({title,docNum,dept,period,mainWork,nextPlan,special,logo},C=CONTENT_DEFAULTS,org=FALLBACK_ORG)=>`<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><title>${title} — ${docNum}</title>
    <style>
      @page{size:A4;margin:15mm 18mm}
      *{-webkit-print-color-adjust:exact;print-color-adjust:exact;box-sizing:border-box}
      body{font-family:'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif;margin:0;color:#1a202c;font-size:14px;line-height:1.9;word-break:keep-all;letter-spacing:-0.01em}
      .hd{border:1px solid ${org.color}}
      .hd-grid{display:grid;grid-template-columns:170px 1fr;grid-template-rows:auto auto}
      .hd-logo{grid-column:1;grid-row:1/3;display:flex;align-items:center;justify-content:center;padding:16px 14px;background:#fff;border-right:1px solid ${org.color}}
      .hd-logo img{width:156px;height:auto}
      .hd-title{grid-column:2;grid-row:1;display:flex;align-items:center;justify-content:center;padding:16px 12px;background:#e6e6e6;border-bottom:1px solid ${org.color}}
      .hd-meta{grid-column:2;grid-row:2;display:grid;grid-template-columns:72px 1fr 72px 1fr}
      .hd-h1{font-size:34px;font-weight:900;letter-spacing:.4em;padding-right:.4em;white-space:nowrap;font-family:'HY견고딕','돋움','맑은 고딕',sans-serif;color:${org.color};line-height:1.2}
      .hd-meta-lbl{display:flex;align-items:center;justify-content:center;padding:7px 10px;background:#dfeaf5;border-right:1px solid ${org.color};font-size:12px;font-weight:700;color:${org.color}}
      .hd-meta-val{display:flex;align-items:center;padding:7px 12px;border-right:1px solid ${org.color};font-size:13.5px;color:#1a202c;font-weight:600}
      .hd-meta-val-last{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:2px;padding:7px 12px;font-size:12px;color:#1a202c}
      .body{background:white;padding:24px 30px}
      .info-tbl{width:100%;border-collapse:collapse;border-top:2px solid ${org.color};margin-bottom:18px}
      .info-tbl td{padding:9px 11px;border-bottom:1px solid #e2e8f0;font-size:13.5px;line-height:1.7}
      .lbl{font-weight:700;color:${org.color};width:72px;white-space:nowrap}
      .sh{display:flex;align-items:center;gap:8px;font-size:15.5px;font-weight:900;color:#1a202c;margin:20px 0 9px}
      .sn{width:22px;height:22px;background:${org.color};color:white;border-radius:3px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;flex-shrink:0}
      .sc{margin-left:30px;font-size:14px;color:#374151;line-height:2.0;word-break:keep-all}
      .sig-area{border-top:2px solid ${org.color};padding-top:14px;margin-top:20px}
      .sig-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
      .sig-box{border:1px solid #cbd5e0;border-radius:5px;overflow:hidden}
      .sig-lbl{background:${org.color};color:white;text-align:center;padding:6px;font-size:12px;font-weight:700}
      .sig-sp{height:54px}
      .footer{text-align:center;font-size:11px;color:#a0aec0;margin-top:12px}
    </style></head><body>
    <script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};</script>
    <div class="hd">
      <div class="hd-grid">
        <div class="hd-logo"><img src="${logo}" alt="${org.short} ${org.name}"/></div>
        <div class="hd-title"><div class="hd-h1">${title}</div></div>
        <div class="hd-meta">
          <div class="hd-meta-lbl">담당부서</div>
          <div class="hd-meta-val">${dept}</div>
          <div class="hd-meta-lbl">문서번호</div>
          <div class="hd-meta-val-last"><span style="font-family:monospace;font-weight:700">${docNum}</span><span style="color:#6b7280;font-size:9px">수신: 내부결재</span></div>
        </div>
      </div>
    </div>
    <div class="body">
      <table class="info-tbl">
        <tr><td class="lbl">보고 부서</td><td><strong>${dept}</strong></td><td class="lbl">문서번호</td><td><strong>${docNum}</strong></td></tr>
        <tr><td class="lbl">보고 기간</td><td colspan="3">${period}</td></tr>
      </table>
      <div class="sh"><span class="sn">1</span> 주요 실적</div>
      <div class="sc">${mainWork.split('\n').map(l=>`<p>${l}</p>`).join('')}</div>
      <div class="sh"><span class="sn">2</span> 차주 계획</div>
      <div class="sc">${nextPlan.split('\n').map(l=>`<p>${l}</p>`).join('')}</div>
      <div class="sh"><span class="sn">3</span> 특이 사항</div>
      <div class="sc">${(special||'(해당 없음)').split('\n').map(l=>`<p>${l}</p>`).join('')}</div>
      <div class="sig-area">
        <div class="sig-grid">${['작  성  자','검  토  자','승  인  자'].map(r=>`<div class="sig-box"><div class="sig-lbl">${r}</div><div class="sig-sp"></div></div>`).join('')}</div>
        <p class="footer">본 보고서는 RoadQ AI 보고서 작성 에이전트에 의해 자동 생성되었으며, 담당자 검토 후 확정됩니다.</p>
      </div>
    </div>
    </body></html>`;

/* 도메인 이관: 기본 콘텐츠 — 도메인 팩 agentContent["agent-report"]로 키 단위 오버라이드 */
export const CONTENT_DEFAULTS={
  headerTitle:'보고서 템플릿 자동 작성 에이전트',            // string — 미제공 시 허브 카탈로그 이름 승계
  headerDesc:'표준 양식 선택 → 정보 입력 → AI 보고서 자동 생성', // string — 헤더 설명(작업 흐름)
  apvLine: APV_LINE,                        // {name,dept,title,role}[3] — 작성자→검토자→승인자 순. [0]이 작성자 서명에 쓰임
  reportTypes: REPORT_TYPES,                // {id,label,icon(이모지),desc}[5] — 첫 항목이 초기 선택값
  docNums: DOC_NUMS,                        // {[typeId]: 문서번호} — reportTypes 전 id 매핑 권장
  docNumFallback:'EX-데이터플랫폼부-2026-0148', // docNums 미매핑 typeId의 문서번호
  reportDefaults: REPORT_DEFAULTS,          // {[typeId]:{dept,period,mainWork,nextPlan,special}} — 유형 선택 시 입력폼 자동 채움
  reportDate:'2026. 09. 18.',               // 일반 보고서 작성일 표기
  approvalSystem:'WorksOn',                 // 전자결재 시스템명 (배지·링크 문구)
  apvRefNo:'APV-2026-0918-0148',            // 결재 진행 참조번호
  logo: null,                          // 미제공 시 도메인 정보로 레터헤드 자동 생성
  logoAlt: null,                            // 미제공 시 '<약칭> <조직명>'
  perfCharts:{                              // {[typeId]:{label,data:{item,[perfDoneKey],[perfGoalKey]}[3]}} — 미매핑 typeId는 첫 항목 사용
    weekly:{label:'주간',data:WEEKLY_CHART},
    monthly:{label:'월간',data:MONTHLY_CHART},
    field:{label:'현장조사',data:FIELD_CHART},
  },
  perfDoneKey:'완료', perfGoalKey:'목표',     // 실적 차트 dataKey — perfCharts data 행의 키와 일치해야 함
  pressTypeId:'officetel',                  // 통계 분석 레이아웃을 쓰는 reportTypes id — 없는 id를 주면 비활성
  pressDistDate:'2026년 10월 16일 (목)',     // 분석 보고서 배포 일시
  pressDate:'2026. 10. 16.',                // 분석 보고서 작성일 표기
  pressKpiTitle:'▪ 2026년 3분기 고속도로 교통 동향 핵심 지표 (전분기 대비)', // KPI 박스 제목
  pressKpiCards: PRESS_KPI_CARDS,           // {label,value,sub,color(hex)}[4] — KPI 카드
  pressKpiStats: PRESS_KPI_STATS,           // {label,value}[3] — KPI 하단 보조 지표
  pressTrendTitle:'▪ 월평균 통행속도 추이 (km/h)', // 좌측 꺾은선 차트 제목
  pressTrendData: INDEX_TREND,              // {month,...시리즈키}[3] — 시리즈키는 pressTrendSeries.key와 일치
  pressTrendSeries:[{key:'전국',color:'#dc2626'},{key:'수도권',color:'#2563eb'},{key:'경부선',color:'#16a34a'}], // {key,color}[3]
  pressTrendDomain:[78,96],                 // 꺾은선 Y축 [min,max]
  pressBarTitle:'▪ 구간별 변동률 (전분기 대비, %)', // 우측 막대 차트 제목
  pressBarData: REGION_RATE,                // {area,...시리즈키}[5] — 시리즈키는 pressBarSeries.key와 일치
  pressBarSeries:[{key:'속도',color:'#fca5a5',posColor:'#86efac'},{key:'혼잡시간',color:'#93c5fd',posColor:'#6ee7b7'},{key:'결측률',color:'#6ee7b7',posColor:'#fca5a5'}], // 값<0이면 color, 0 이상이면 posColor
  pressSections: PRESS_SECTIONS,            // {num,title,regions:{area,rate,prev}[3],details:{area,rate,note}[3]}[3] — 본문 섹션 1~3
  pressIndexTitle:'2026년 7~9월 교통 지표 및 전분기 대비 변동', // 섹션 4 제목
  pressIndexHead:['구분','2026.7','2026.8','2026.9','전분기 변동(%)'], // string[5] — 지표 테이블 헤더
  pressIndexGroups: PRESS_INDEX_GROUPS,     // {label,rows:{a,v1,v2,v3,c}[3]}[3] — 그룹 헤더행 label + 데이터행
  pressIndexNote:'* 집계: VDS 5분 집계 평균, EX-DataLake 적재 기준 · 결측 보정 후 산출', // 지표 테이블 각주
  pressRatioTitle:'지역본부별 VDS 결측률 및 검지 오탐률', // 섹션 5 제목
  pressRatioData: PRESS_RATIO_DATA,         // {area,[leftKey]:number,[rightKey]:number}[5]
  pressRatioLeftKey:'결측률', pressRatioRightKey:'오탐률', // 이중축 막대 dataKey — pressRatioData 행 키와 일치
  pressRatioLeftDomain:[0,6], pressRatioRightDomain:[0,4], // 좌·우 Y축 [min,max]
  pressRatioThreshold:3,                    // leftKey 값이 이 이상이면 경고색 막대
  pressRatioRefLabel:'관리 임계 3.0%',       // 기준선 라벨
  pressRatioNote:'* 결측률 3.0% 이상(빨간 막대): 관리 임계 초과 — 데이터 품질 개선 대상 | 오탐률: 자동 검지 중 현장 확인 결과 미해당 비율', // 섹션 5 각주
  pressContact:'디지털계획처 데이터플랫폼부 차장 이도현 ☎ (054)811-8531 | 담당 교통센터 상황관리부 과장 박선영 ☎ (054)811-8532　｜　자료확인: EXTIS 고속도로 교통정보시스템 www.ex.co.kr', // 문의처 1줄 ('문의' 라벨은 코어)
  buildPressHtml,                           // ({title,docNum,dept,period,mainWork,nextPlan,special,apvLine,logo}, C, org:{name,short,color,en})=>html — 보도자료 인쇄본. 본문은 C의 press* 키에서 생성되므로 팩은 데이터만 공급하면 됨(함수 통째 교체도 가능)
  buildReportHtml,                          // ({title,docNum,dept,period,mainWork,nextPlan,special,logo}, C, org)=>html — 일반 보고서 인쇄본. 조직 표기·색만 org 사용(함수 통째 교체도 가능)
};

const ReportAgent=({onBack,domain})=>{
  const C={...CONTENT_DEFAULTS,...(domain?.agentContent?.["agent-report"]||{})};

  /* 문서 레터헤드 — 팩이 자체 로고를 주면 그것을, 아니면 도메인 정보로 생성.
     (기본 래스터 로고를 쓰면 타 분야 문서에 엉뚱한 발주처 로고가 찍히므로 도메인 기반 생성이 기본) */
  const orgMeta = { name: domain?.orgName || '조직명', short: domain?.orgShort || 'ORG', color: domain?.brandColor || '#334155' };
  const docLogo = C.logo || orgLogoDataUri(orgMeta);
  const docLogoAlt = C.logoAlt || `${orgMeta.short} ${orgMeta.name}`;
  const H=agentHeader(domain,'agent-report',C,AGENT_TEAMS);
  const initialDefaults=C.reportDefaults[C.reportTypes[0].id]||{};
  const {step,agentIdx,doneIdx,start:startSim,resetSim}=useAgentSimulation(AGENTS,{
    onComplete:()=>setEditResult(buildRawText()),
  });
  const [reportType,setReportType]=useState(C.reportTypes[0].id);
  const [dept,setDept]=useState(initialDefaults.dept||'');
  const [period,setPeriod]=useState(initialDefaults.period||'');
  const [mainWork,setMainWork]=useState(initialDefaults.mainWork||'');
  const [nextPlan,setNextPlan]=useState(initialDefaults.nextPlan||'');
  const [special,setSpecial]=useState(initialDefaults.special||'');
  const [viewMode,setViewMode]=useState('doc');
  const [apvState,setApvState]=useState(null);
  const [apvMsg,setApvMsg]=useState('검토 요청드립니다.');
  const [editResult,setEditResult]=useState('');
  const [tone,setTone]=useState('formal');
  const [length,setLength]=useState('medium');
  const [showExportMenu,setShowExportMenu]=useState(false);
  const [exported,setExported]=useState(null);

  const DOC_NUM=C.docNums[reportType]||C.docNumFallback;

  const selectReportType=(nextType)=>{
    setReportType(nextType);
    const d=C.reportDefaults[nextType];
    if(!d) return;
    setDept(d.dept);
    setPeriod(d.period);
    setMainWork(d.mainWork);
    setNextPlan(d.nextPlan);
    setSpecial(d.special);
  };

  const startProcess=()=>startSim();

  const reset=()=>{resetSim();setApvState(null);setApvMsg('검토 요청드립니다.');setShowExportMenu(false);};
  const submitApv=()=>{setApvState('submitting');setTimeout(()=>{setApvState('done');},1600);};

  const buildRawText=()=>`[${C.reportTypes.find(t=>t.id===reportType)?.label||C.reportTypes[0].label}]

부서: ${dept}
기간: ${period}
문서번호: ${DOC_NUM}

1. 주요 실적
${mainWork}

2. 차주 계획
${nextPlan}

3. 특이 사항
${special||'(해당 없음)'}

작성자: ${C.apvLine[0].name} (${C.apvLine[0].dept} ${C.apvLine[0].title})
작성일: ${C.reportDate}`;

  const selectedType=C.reportTypes.find(t=>t.id===reportType);

  /* 인쇄·내보내기가 같은 문서 HTML을 쓰도록 단일화 */
  const buildHtml=()=>{
    const docTitle=selectedType?.label||C.reportTypes[0].label;
    const org={name:domain?.orgName||'한국도로공사',short:domain?.orgShort||'EX',color:domain?.brandColor||'#00539F',en:domain?.orgEn||'Korea Expressway Corporation'};
    return {docTitle,html:reportType===C.pressTypeId
      ?C.buildPressHtml({title:docTitle,docNum:DOC_NUM,dept,period,mainWork,nextPlan,special,apvLine:C.apvLine,logo:docLogo},C,org)
      :C.buildReportHtml({title:docTitle,docNum:DOC_NUM,dept,period,mainWork,nextPlan,special,logo:docLogo},C,org)};
  };

  const downloadDoc=()=>{
    const {html}=buildHtml();
    const w=window.open('','_blank','width=900,height=1200');
    w.document.write(html);
    w.document.close();
    w.focus();
  };

  /* 내보내기 — 형식별로 실제 파일을 만들거나 인쇄 대화상자를 띄운다 */
  const exportAs=(ext)=>{
    setShowExportMenu(false);
    const {docTitle,html}=buildHtml();
    if(ext==='pdf'){ // 브라우저 인쇄 → 'PDF로 저장'이 실제 경로
      const w=window.open('','_blank','width=900,height=1200');
      w.document.write(html); w.document.close(); w.focus();
      setTimeout(()=>w.print(),400);
      return;
    }
    downloadTextFile(`${docTitle}_${DOC_NUM}.${ext}`,html,
      ext==='doc'?'application/msword;charset=utf-8':'text/html;charset=utf-8');
    setExported(ext);
    setTimeout(()=>setExported(null),2000);
  };

  if(step===1) return(
    <div className="flex-1 overflow-y-auto px-6 py-8 bg-white">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-2">
          {onBack&&<button onClick={onBack} className="text-slate-400 hover:text-slate-600 text-[11px] font-bold flex items-center gap-1 shrink-0 py-2 pr-2 max-md:py-2.5"><ChevronRight className="w-3.5 h-3.5 rotate-180"/>뒤로</button>}
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md shrink-0"><FileText className="w-5 h-5 text-white"/></div>
          <div>
            <div className="text-[15px] font-black text-slate-800">{H.title}</div>
            <div className="text-xs text-slate-400">{H.desc}</div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">1 · 보고서 유형 선택</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {C.reportTypes.map(t=>(
              <button key={t.id} onClick={()=>selectReportType(t.id)}
                className={cn(
                  'flex flex-col items-start gap-1.5 px-4 py-3.5 border-2 rounded-2xl text-left transition-all',
                  reportType===t.id
                    ?'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100'
                    :'border-slate-200 hover:border-emerald-200 hover:bg-slate-50'
                )}>
                <div className="flex items-center gap-2 w-full">
                  <span className="text-xl">{t.icon}</span>
                  <span className={cn('font-black text-[13px]',reportType===t.id?'text-emerald-700':'text-slate-700')}>{t.label}</span>
                  {reportType===t.id&&<CheckCircle className="w-4 h-4 text-emerald-500 ml-auto shrink-0"/>}
                </div>
                <span className="text-[11px] text-slate-400 ml-7 leading-snug">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">2 · 기본 정보</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-500 font-bold mb-1 block">보고 부서</label>
              <input value={dept} onChange={e=>setDept(e.target.value)}
                className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100"/>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 font-bold mb-1 block">보고 기간</label>
              <input value={period} onChange={e=>setPeriod(e.target.value)}
                className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100"/>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">3 · 주요 실적</label>
          <textarea value={mainWork} onChange={e=>setMainWork(e.target.value)} rows={4}
            className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 resize-none text-slate-700 leading-relaxed"/>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">4 · 차주 계획</label>
          <textarea value={nextPlan} onChange={e=>setNextPlan(e.target.value)} rows={4}
            className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 resize-none text-slate-700 leading-relaxed"/>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">5 · 특이 사항</label>
            <span className="text-[10px] text-slate-400">(선택)</span>
          </div>
          <textarea value={special} onChange={e=>setSpecial(e.target.value)} rows={2}
            placeholder="특이 사항이 있으면 입력하세요"
            className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 resize-none text-slate-700 leading-relaxed"/>
        </div>

        {/* 보고서 톤/길이 설정 */}
        <div className="space-y-4 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4">
          <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider">6 · 보고서 톤 &amp; 길이 설정</div>
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-slate-500">문체 선택</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {TONES.map(t=>(
                <button key={t.id} onClick={()=>setTone(t.id)}
                  className={cn(
                    'flex flex-col items-start px-3 py-2.5 border-2 rounded-xl text-left transition-all',
                    tone===t.id?'border-emerald-400 bg-emerald-50':'border-slate-200 hover:border-emerald-200 bg-white'
                  )}>
                  <span className={cn('text-[12px] font-black',tone===t.id?'text-emerald-700':'text-slate-700')}>{t.label}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 leading-snug">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-slate-500">분량 선택</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {LENGTHS_REPORT.map(l=>(
                <button key={l.id} onClick={()=>setLength(l.id)}
                  className={cn(
                    'flex flex-col items-start px-3 py-2.5 border-2 rounded-xl text-left transition-all',
                    length===l.id?'border-emerald-400 bg-emerald-50':'border-slate-200 hover:border-emerald-200 bg-white'
                  )}>
                  <span className={cn('text-[12px] font-black',length===l.id?'text-emerald-700':'text-slate-700')}>{l.label}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 leading-snug">{l.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={startProcess}
          className="w-full py-3.5 bg-emerald-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100 text-[15px]">
          <Play className="w-4 h-4 fill-white"/> 보고서 자동 작성 시작
        </button>
      </div>
    </div>
  );

  if(step===2) return(
    <div className="flex-1 flex min-h-0 overflow-hidden">
      <div className="flex-1 min-w-0 flex flex-col items-center justify-center overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-xl px-6">
          <div className="text-center mb-10">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-100">
              <Radio className="w-7 h-7 text-white animate-pulse"/>
            </div>
            <div className="text-[18px] font-black text-slate-800">멀티 에이전트 보고서 생성 중</div>
            <div className="text-sm text-slate-400 mt-1">표준 양식을 불러오고 AI가 내용을 자동 구성합니다</div>
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
                    isActive?'border-emerald-300 bg-emerald-50 shadow-md shadow-emerald-100':
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
                        <div className={cn('font-black text-sm',isDone?'text-emerald-700':isActive?'text-emerald-700':'text-slate-400')}>{ag.label}</div>
                        <div className={cn('text-xs mt-0.5',isDone?'text-emerald-500':isActive?'text-emerald-500':'text-slate-300')}>
                          {isActive?`처리 중 — ${ag.sub}`:isDone?`완료 — ${ag.sub}`:ag.sub}
                        </div>
                      </div>
                      {isActive&&<Loader2 className="w-4 h-4 text-emerald-500 animate-spin shrink-0"/>}
                      {isDone&&<span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">완료</span>}
                    </div>
                    {isActive&&<div className="mt-3"><div className="h-1 bg-emerald-100 rounded-full overflow-hidden"><div className="h-1 bg-emerald-500 rounded-full animate-pulse" style={{width:'70%'}}/></div></div>}
                  </div>
                  {i<AGENTS.length-1&&<div className="flex justify-center my-1"><ChevronRight className="w-4 h-4 text-slate-300 rotate-90"/></div>}
                </div>
              );
            })}
          </div>
          <div className="mt-8 text-center text-xs text-slate-400">
            <Network className="w-3.5 h-3.5 inline mr-1 text-emerald-400"/>
            GPT-OSS 120B 문서 생성 모델 — 표준 공문서 형식 준수
          </div>
        </div>
      </div>
      <div className="hidden lg:flex w-80 shrink-0 border-l border-slate-100 bg-gradient-to-b from-slate-50 to-white p-4 overflow-y-auto custom-scrollbar flex-col">
        <AgentWorkflowPanel agentId="agent-report" activeStep={agentIdx} doneSteps={doneIdx} />
      </div>
    </div>
  );

  return(
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-100">
      <div className="shrink-0 bg-white border-b px-5 py-2.5 flex items-center gap-2 flex-wrap shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0"><CheckCircle className="w-3.5 h-3.5 text-white"/></div>
          <div className="min-w-0">
            <div className="text-[13px] font-black text-slate-800 truncate">보고서 생성 완료</div>
            <div className="text-[10px] text-slate-400">{selectedType?.label} · {DOC_NUM}</div>
          </div>
        </div>
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
          {[['doc','문서 보기'],['edit','원본 편집']].map(([m,l])=>(
            <button key={m} onClick={()=>setViewMode(m)}
              className={cn('px-3 py-1.5 rounded-md text-[11px] font-bold transition-all',
                viewMode===m?'bg-white text-emerald-700 shadow-sm':'text-slate-500 hover:text-slate-700')}>
              {m==='doc'?<Eye className="w-3 h-3 inline mr-1"/>:<Edit3 className="w-3 h-3 inline mr-1"/>}{l}
            </button>
          ))}
        </div>
        <button onClick={reset} className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-[11px] font-bold text-slate-500 hover:bg-slate-50 transition-colors"><RotateCcw className="w-3 h-3"/>새 보고서</button>
        {/* 내보내기 드롭다운 */}
        <div className="relative">
          <button onClick={()=>setShowExportMenu(p=>!p)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors">
            <Download className="w-3 h-3"/>내보내기 ▾
          </button>
          {showExportMenu&&(
            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
              {EXPORT_FORMATS.map(fmt=>(
                <button key={fmt.ext}
                  onClick={()=>exportAs(fmt.ext)}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left">
                  <span className="text-base">{fmt.icon}</span>
                  <span className={cn('text-[12px] font-bold',fmt.color)}>
                    {exported===fmt.ext?'내려받음':fmt.label}
                  </span>
                </button>
              ))}
              <p className="px-4 py-2 text-[10px] text-slate-400 border-t leading-relaxed">
                한글(.hwpx) 변환은 실서비스에서 문서 변환 서버를 경유합니다
              </p>
            </div>
          )}
        </div>
        <button onClick={downloadDoc} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[11px] font-bold hover:bg-emerald-700 transition-colors shadow-sm"><Printer className="w-3 h-3"/>출력</button>
        {apvState!=='done'
          ?<button onClick={()=>setApvState('selfcheck')} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-[11px] font-bold hover:bg-emerald-800 transition-colors shadow-sm"><FileCheck className="w-3 h-3"/>결재 상신</button>
          :<span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold"><CheckCircle className="w-3 h-3"/>결재 진행 중</span>
        }
      </div>

      {apvState==='done'&&(
        <div className="shrink-0 bg-emerald-50 border-b border-emerald-100 px-5 py-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
              <span className="text-[11px] font-black text-slate-700">결재 현황</span>
              <span className="text-[9px] font-bold text-white bg-emerald-700 px-1.5 py-0.5 rounded">{C.approvalSystem}</span>
            </div>
            <div className="flex items-center gap-1 flex-1 min-w-0">
              {C.apvLine.map((p,i)=>(
                <React.Fragment key={i}>
                  <div className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] border whitespace-nowrap',
                    i===0?'bg-emerald-50 border-emerald-200':i===1?'bg-blue-50 border-blue-200 shadow-sm':'bg-white border-slate-200'
                  )}>
                    {i===0?<CheckCircle className="w-3 h-3 text-emerald-500 shrink-0"/>
                      :i===1?<Loader2 className="w-3 h-3 text-blue-500 animate-spin shrink-0"/>
                      :<Clock className="w-3 h-3 text-slate-300 shrink-0"/>}
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
              <span className="text-[10px] text-slate-400 font-mono">{C.apvRefNo}</span>
              <a href="#" onClick={e=>e.preventDefault()} className="text-[10px] font-bold text-blue-500 hover:underline flex items-center gap-0.5">{C.approvalSystem}에서 보기<ExternalLink className="w-2.5 h-2.5"/></a>
            </div>
          </div>
        </div>
      )}

      {apvState==='selfcheck'&&(
        <SelfCheckModal
          docType={reportType===C.pressTypeId?'officetel':'report'}
          domain={domain}
          onClose={()=>setApvState(null)}
          onProceed={()=>setApvState('modal')}
        />
      )}

      {(apvState==='modal'||apvState==='submitting')&&(
        <ApprovalModal
          docTitle={`${selectedType?.label} — ${period}`}
          docNum={DOC_NUM}
          apvLine={C.apvLine}
          apvMsg={apvMsg} setApvMsg={setApvMsg}
          onClose={()=>setApvState(null)}
          onSubmit={submitApv}
          submitting={apvState==='submitting'}
          accentBg="bg-emerald-700"
          accentBtn="bg-emerald-600 hover:bg-emerald-700"
        />
      )}

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {viewMode==='edit'?(
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border shadow-sm overflow-hidden">
            <textarea value={editResult} onChange={e=>setEditResult(e.target.value)}
              className="w-full p-6 font-mono text-[13px] text-slate-700 leading-relaxed resize-none outline-none"
              style={{minHeight:640}}/>
          </div>
        ):(
          <div className="max-w-3xl mx-auto shadow-2xl rounded-lg overflow-hidden"
            style={{fontFamily:"'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif",lineHeight:1.85,wordBreak:'keep-all',letterSpacing:'-0.01em'}}>
            {/* Document header — 공식 공문서(레터헤드) 양식 */}
            <div style={{border:'1px solid #00335F',display:'grid',gridTemplateColumns:'170px 1fr',gridTemplateRows:'auto auto'}}>
              {/* 로고 — 2행 span */}
              <div style={{gridColumn:'1',gridRow:'1/3',display:'flex',alignItems:'center',justifyContent:'center',padding:'16px 14px',background:'#fff',borderRight:'1px solid #00335F'}}>
                <img src={docLogo} alt={docLogoAlt} style={{width:'156px',height:'auto'}}/>
              </div>
              {/* 문서 제목 */}
              <div style={{gridColumn:'2',gridRow:'1',display:'flex',alignItems:'center',justifyContent:'center',padding:'18px 14px',background:'#e6e6e6',borderBottom:'1px solid #00335F',overflow:'hidden'}}>
                <div style={{fontSize:'34px',fontWeight:900,letterSpacing:'0.4em',paddingRight:'0.4em',fontFamily:"'HY견고딕','돋움','맑은 고딕',sans-serif",color:'#00335F',lineHeight:1.2,whiteSpace:'nowrap'}}>
                  {selectedType?.label||C.reportTypes[0].label}
                </div>
              </div>
              {/* 메타 정보 행 */}
              <div style={{gridColumn:'2',gridRow:'2',display:'grid',gridTemplateColumns:'72px 1fr 72px 1fr'}}>
                <div style={{padding:'7px 10px',background:'#dfeaf5',borderRight:'1px solid #00335F',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <span style={{fontSize:'12px',fontWeight:700,color:'#00335F'}}>담당부서</span>
                </div>
                <div style={{padding:'7px 12px',borderRight:'1px solid #00335F',display:'flex',alignItems:'center'}}>
                  <span style={{fontSize:'13px',color:'#1a202c',fontWeight:600}}>{dept}</span>
                </div>
                <div style={{padding:'7px 10px',background:'#dfeaf5',borderRight:'1px solid #00335F',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <span style={{fontSize:'12px',fontWeight:700,color:'#00335F'}}>문서번호</span>
                </div>
                <div style={{padding:'7px 12px',display:'flex',flexDirection:'column',justifyContent:'center',gap:'2px'}}>
                  <span style={{fontSize:'12px',fontFamily:'monospace',fontWeight:700,color:'#1a202c'}}>{DOC_NUM}</span>
                  <span style={{fontSize:'10px',color:'#6b7280'}}>수신: 내부결재</span>
                </div>
              </div>
            </div>

            {/* Document body */}
            {reportType===C.pressTypeId ? (
            /* ── 교통데이터 분석보고(통계) 형식 ── */
            <div className="bg-white px-8 py-7 space-y-6" style={{fontFamily:"'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif",lineHeight:1.85,wordBreak:'keep-all',letterSpacing:'-0.01em'}}>
              {/* 메타 정보 */}
              <table className="w-full border-collapse text-[13px]" style={{borderTop:'2px solid #00539F'}}>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-2.5 pr-4 font-bold text-[#00539F] w-28 whitespace-nowrap">담당 부서</td>
                    <td className="py-2.5 pr-6 font-semibold text-slate-800" colSpan={3}>{dept}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-2.5 font-bold text-[#00539F] whitespace-nowrap">조사 기간</td>
                    <td className="py-2.5 text-slate-700 pr-6">{period}</td>
                    <td className="py-2.5 font-bold text-[#00539F] w-24 whitespace-nowrap">배포 일시</td>
                    <td className="py-2.5 text-slate-700">{C.pressDistDate}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-2.5 font-bold text-[#00539F] whitespace-nowrap">문서번호</td>
                    <td className="py-2.5 font-mono text-slate-600 text-[12px]" colSpan={3}>{DOC_NUM}</td>
                  </tr>
                </tbody>
              </table>

              {/* 핵심 지표 요약 */}
              <div style={{background:'#eef2ff',border:'1px solid #c7d2fe',borderRadius:'10px',padding:'16px 18px'}}>
                <div style={{fontSize:'11px',fontWeight:800,color:'#00539F',letterSpacing:'0.05em',marginBottom:'12px'}}>
                  {C.pressKpiTitle}
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px'}}>
                  {C.pressKpiCards.map(({label,value,sub,color})=>(
                    <div key={label} style={{background:'#fff',border:'1px solid #e0e7ff',borderRadius:'8px',padding:'10px 12px',textAlign:'center'}}>
                      <div style={{fontSize:'10px',color:'#6b7280',fontWeight:700,marginBottom:'4px'}}>{label}</div>
                      <div style={{fontSize:'18px',fontWeight:900,color,lineHeight:1.2}}>{value}</div>
                      <div style={{fontSize:'10px',color:'#9ca3af',marginTop:'3px'}}>{sub}</div>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:'12px',display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px'}}>
                  {C.pressKpiStats.map(({label,value})=>(
                    <div key={label} style={{background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'6px',padding:'7px 10px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span style={{fontSize:'10px',color:'#6b7280',fontWeight:600}}>{label}</span>
                      <span style={{fontSize:'12px',color:'#1e3a8a',fontWeight:800}}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── 그래프 섹션 ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* 가격지수 월별 추이 꺾은선 */}
                <div style={{background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'10px',padding:'14px 16px'}}>
                  <div style={{fontSize:'11px',fontWeight:800,color:'#00539F',marginBottom:'12px',letterSpacing:'0.03em'}}>
                    {C.pressTrendTitle}
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={C.pressTrendData} margin={{top:5,right:12,left:-20,bottom:0}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                      <XAxis dataKey="month" tick={{fontSize:10,fill:'#94a3b8'}} tickLine={false}/>
                      <YAxis domain={C.pressTrendDomain} tick={{fontSize:9,fill:'#94a3b8'}} tickLine={false} axisLine={false}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Legend wrapperStyle={{fontSize:'10px',paddingTop:'6px'}}/>
                      {C.pressTrendSeries.map(s=>(
                        <Line key={s.key} type="monotone" dataKey={s.key} stroke={s.color} strokeWidth={2.5} dot={{r:4,fill:s.color}} activeDot={{r:6}}/>
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* 지역별 변동률 막대 그래프 */}
                <div style={{background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'10px',padding:'14px 16px'}}>
                  <div style={{fontSize:'11px',fontWeight:800,color:'#00539F',marginBottom:'12px',letterSpacing:'0.03em'}}>
                    {C.pressBarTitle}
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={C.pressBarData} margin={{top:5,right:8,left:-24,bottom:0}} barCategoryGap="25%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false}/>
                      <XAxis dataKey="area" tick={{fontSize:10,fill:'#64748b'}} tickLine={false}/>
                      <YAxis tick={{fontSize:9,fill:'#94a3b8'}} tickLine={false} axisLine={false}/>
                      <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1.5}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Legend wrapperStyle={{fontSize:'10px',paddingTop:'6px'}}/>
                      {C.pressBarSeries.map(s=>(
                        <Bar key={s.key} dataKey={s.key} fill={s.color} radius={[3,3,0,0]}>
                          {C.pressBarData.map((e,i)=><Cell key={i} fill={e[s.key]<0?s.color:s.posColor}/>)}
                        </Bar>
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 본문 섹션 (지표 그룹별) */}
              {C.pressSections.map(({num,title,regions,details})=>(
                <section key={num}>
                  <h3 className="flex items-center gap-2 text-[14px] font-black text-slate-800 mb-3">
                    <span className="w-6 h-6 rounded-md bg-[#00539F] flex items-center justify-center text-white text-[10px] font-black shrink-0">{num}</span>
                    {title}
                  </h3>
                  <div className="ml-8 grid grid-cols-3 gap-2 mb-3">
                    {regions.map(r=>(
                      <div key={r.area} style={{background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'8px',padding:'8px 12px'}}>
                        <div style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,marginBottom:'2px'}}>{r.area}</div>
                        <div style={{fontSize:'16px',fontWeight:900,color:r.rate.startsWith('-')?'#dc2626':'#16a34a',lineHeight:1.2}}>{r.rate}</div>
                        <div style={{fontSize:'10px',color:'#cbd5e1',marginTop:'2px'}}>전분기 {r.prev}</div>
                      </div>
                    ))}
                  </div>
                  <div className="ml-8 space-y-1.5">
                    {details.map(d=>(
                      <div key={d.area} style={{display:'flex',gap:'8px',fontSize:'13px',lineHeight:1.6,alignItems:'flex-start'}}>
                        <span style={{fontWeight:800,color:'#00539F',width:'40px',flexShrink:0}}>{d.area}</span>
                        <span style={{fontWeight:700,flexShrink:0,color:d.rate.startsWith('-')?'#dc2626':d.rate.startsWith('+')?'#16a34a':'#475569'}}>({d.rate})</span>
                        <span style={{color:'#475569'}}>{d.note}</span>
                      </div>
                    ))}
                  </div>
                </section>
              ))}

              {/* 가격지수 변동률 테이블 */}
              <section>
                <h3 className="flex items-center gap-2 text-[14px] font-black text-slate-800 mb-3">
                  <span className="w-6 h-6 rounded-md bg-[#00539F] flex items-center justify-center text-white text-[10px] font-black shrink-0">4</span>
                  {C.pressIndexTitle}
                </h3>
                <div className="ml-8">
                  <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-[12px]" style={{border:'1px solid #e2e8f0'}}>
                    <thead>
                      <tr style={{background:'#00539F',color:'#fff'}}>
                        {C.pressIndexHead.map(h=>(
                          <th key={h} className="py-2 px-3 font-bold text-left">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {C.pressIndexGroups.map(({label,rows})=>(
                        <React.Fragment key={label}>
                          <tr style={{background:'#dbeafe'}}>
                            <td className="py-1.5 px-3 font-black text-[#00539F] text-[11px]" colSpan={5}>{label}</td>
                          </tr>
                          {rows.map(r=>(
                            <tr key={r.a} className="border-b border-slate-100">
                              <td className="py-1.5 px-3 pl-5 text-slate-600">{r.a}</td>
                              <td className="py-1.5 px-3 text-slate-600">{r.v1}</td>
                              <td className="py-1.5 px-3 text-slate-600">{r.v2}</td>
                              <td className="py-1.5 px-3 text-slate-600">{r.v3}</td>
                              <td className={`py-1.5 px-3 font-black ${r.c.startsWith('-')?'text-rose-600':r.c==='0.00'?'text-slate-500':'text-emerald-600'}`}>{r.c}%</td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                  </div>
                  <p style={{fontSize:'10px',color:'#9ca3af',marginTop:'5px'}}>{C.pressIndexNote}</p>
                </div>
              </section>

              {/* ── 결측률·오탐률 요약 차트 ── */}
              <section>
                <h3 className="flex items-center gap-2 text-[14px] font-black text-slate-800 mb-3">
                  <span className="w-6 h-6 rounded-md bg-[#00539F] flex items-center justify-center text-white text-[10px] font-black shrink-0">5</span>
                  {C.pressRatioTitle}
                </h3>
                <div className="ml-8">
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart
                      data={C.pressRatioData}
                      margin={{top:5,right:16,left:-10,bottom:0}}
                      barCategoryGap="30%"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false}/>
                      <XAxis dataKey="area" tick={{fontSize:11,fill:'#64748b'}} tickLine={false}/>
                      <YAxis yAxisId="left" domain={C.pressRatioLeftDomain} tick={{fontSize:9,fill:'#94a3b8'}} tickLine={false} axisLine={false} tickFormatter={v=>`${v}%`}/>
                      <YAxis yAxisId="right" orientation="right" domain={C.pressRatioRightDomain} tick={{fontSize:9,fill:'#94a3b8'}} tickLine={false} axisLine={false} tickFormatter={v=>`${v}%`}/>
                      <Tooltip content={({active,payload,label})=>{
                        if(!active||!payload?.length)return null;
                        return(
                          <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-[11px]">
                            <div className="font-black text-slate-700 mb-1">{label}</div>
                            {payload.map(p=>(
                              <div key={p.name} className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{background:p.color}}/>
                                <span className="text-slate-600">{p.name}:</span>
                                <span className="font-bold" style={{color:p.color}}>{p.value}%</span>
                              </div>
                            ))}
                          </div>
                        );
                      }}/>
                      <Legend wrapperStyle={{fontSize:'10px',paddingTop:'6px'}}/>
                      <ReferenceLine yAxisId="left" y={C.pressRatioThreshold} stroke="#ef4444" strokeDasharray="4 3" strokeWidth={1.5} label={{value:C.pressRatioRefLabel,position:'insideTopRight',fontSize:9,fill:'#ef4444'}}/>
                      <Bar yAxisId="left" dataKey={C.pressRatioLeftKey} fill="#bfdbfe" radius={[3,3,0,0]}>
                        {C.pressRatioData.map((row,i)=>(
                          <Cell key={i} fill={row[C.pressRatioLeftKey]>=C.pressRatioThreshold?'#fca5a5':'#bfdbfe'}/>
                        ))}
                        <LabelList dataKey={C.pressRatioLeftKey} position="top" style={{fontSize:9,fontWeight:700,fill:'#3b82f6'}} formatter={v=>`${v}%`}/>
                      </Bar>
                      <Bar yAxisId="right" dataKey={C.pressRatioRightKey} fill="#6ee7b7" radius={[3,3,0,0]}>
                        <LabelList dataKey={C.pressRatioRightKey} position="top" style={{fontSize:9,fontWeight:700,fill:'#16a34a'}} formatter={v=>`${v}%`}/>
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p style={{fontSize:'10px',color:'#9ca3af',marginTop:'4px'}}>{C.pressRatioNote}</p>
                </div>
              </section>

              {/* 문의처 */}
              <div style={{background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'8px',padding:'10px 14px',fontSize:'11px',color:'#64748b'}}>
                <span style={{fontWeight:700,color:'#00539F'}}>문의</span> {C.pressContact}
              </div>

              {/* 작성 정보 */}
              <div className="flex items-center justify-between text-[12px] text-slate-500">
                <span>작성자: <strong className="text-slate-700">{C.apvLine[0].name}</strong> · {dept} {C.apvLine[0].title}</span>
                <span>작성일: {C.pressDate}</span>
              </div>

              {/* 서명란 */}
              <div style={{borderTop:'2px solid #00539F',paddingTop:'14px'}}>
                <div className="grid grid-cols-3 gap-4">
                  {C.apvLine.map((p,i)=>(
                    <div key={i} className="border border-slate-300 rounded-lg overflow-hidden">
                      <div className="py-2 text-center text-[12px] font-bold text-white" style={{background:'#00539F'}}>{p.role}</div>
                      <div className="h-14 flex flex-col items-center justify-end pb-2 gap-0.5">
                        <div className="text-[13px] font-bold text-slate-700">{p.name}</div>
                        <div className="text-[11px] text-slate-400">{p.dept}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-center text-[10px] text-slate-400 mt-3">
                  본 보고서는 RoadQ AI 보고서 작성 에이전트 v1.0에 의해 자동 생성되었으며, 담당자 검토 후 확정됩니다.
                </p>
              </div>
            </div>
            ) : (
            /* ── 일반 보고서 형식 ── */
            <div className="bg-white px-10 py-8 space-y-7">
              <table className="w-full border-collapse text-[14.5px]" style={{borderTop:'2px solid #00539F'}}>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-3.5 pr-4 font-bold text-[#064e3b] w-24 whitespace-nowrap">담당 부서</td>
                    <td className="py-3.5 pr-8 font-semibold text-slate-800">{dept}</td>
                    <td className="py-3.5 pr-4 font-bold text-[#064e3b] w-24 whitespace-nowrap">문서번호</td>
                    <td className="py-3.5 font-mono text-slate-700">{DOC_NUM}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-3.5 pr-4 font-bold text-[#064e3b] whitespace-nowrap">보고 기간</td>
                    <td className="py-3.5 text-slate-700" colSpan={3}>{period}</td>
                  </tr>
                </tbody>
              </table>

              <div className="flex items-center gap-3"><div className="flex-1 h-px bg-slate-200"/><div className="w-1.5 h-1.5 rounded-full bg-slate-300"/><div className="flex-1 h-px bg-slate-200"/></div>

              {/* 실적 현황 차트 */}
              {(()=>{
                const perf=C.perfCharts[reportType]||Object.values(C.perfCharts)[0];
                const chartData=perf.data;
                const accentColor='#064e3b';
                const label=perf.label;
                return(
                  <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'10px',padding:'14px 18px'}}>
                    <div style={{fontSize:'11px',fontWeight:800,color:accentColor,marginBottom:'12px',letterSpacing:'0.03em'}}>
                      ▪ {label} 실적 현황 — 목표 대비 달성률
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-center">
                      <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={chartData} layout="vertical" margin={{top:0,right:40,left:10,bottom:0}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" horizontal={false}/>
                          <XAxis type="number" tick={{fontSize:10,fill:'#6b7280'}} tickLine={false} axisLine={false}/>
                          <YAxis type="category" dataKey="item" tick={{fontSize:11,fill:'#374151',fontWeight:600}} tickLine={false} axisLine={false} width={52}/>
                          <Tooltip content={<CustomTooltip/>}/>
                          <Bar dataKey={C.perfGoalKey} fill="#d1fae5" radius={[0,3,3,0]} barSize={12}/>
                          <Bar dataKey={C.perfDoneKey} fill={accentColor} radius={[0,3,3,0]} barSize={12}>
                            <LabelList dataKey={C.perfDoneKey} position="right" style={{fontSize:10,fontWeight:700,fill:accentColor}}/>
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="space-y-2.5">
                        {chartData.map(d=>{
                          const pct=Math.round(d[C.perfDoneKey]/d[C.perfGoalKey]*100);
                          return(
                            <div key={d.item}>
                              <div className="flex justify-between text-[11px] mb-1">
                                <span className="font-bold text-slate-700">{d.item}</span>
                                <span className="font-black" style={{color:pct>=100?'#16a34a':pct>=80?accentColor:'#f59e0b'}}>{pct}%</span>
                              </div>
                              <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all" style={{width:`${Math.min(pct,100)}%`,background:pct>=100?'#16a34a':pct>=80?accentColor:'#f59e0b'}}/>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{d[C.perfDoneKey]} / {d[C.perfGoalKey]}건</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {[
                {num:'1',title:'주요 실적',content:mainWork},
                {num:'2',title:'차주 계획',content:nextPlan},
                {num:'3',title:'특이 사항',content:special||'해당 없음'},
              ].map(({num,title,content})=>(
                <section key={num}>
                  <h3 className="flex items-center gap-2 text-[16.5px] font-black text-slate-800 mb-3.5">
                    <span className="w-7 h-7 rounded-md bg-[#064e3b] flex items-center justify-center text-white text-[11px] font-black shrink-0">{num}</span>
                    {title}
                  </h3>
                  <div className="ml-9 text-[14.5px] text-slate-700 space-y-2" style={{lineHeight:2.0,wordBreak:'keep-all'}}>
                    {content.split('\n').filter(l=>l.trim()).map((line,i)=>(
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </section>
              ))}

              <div className="flex items-center gap-3"><div className="flex-1 h-px bg-slate-200"/><div className="w-1.5 h-1.5 rounded-full bg-slate-300"/><div className="flex-1 h-px bg-slate-200"/></div>

              <div className="flex items-center justify-between text-[13px] text-slate-500">
                <span>작성자: <strong className="text-slate-700">{C.apvLine[0].name}</strong> · {dept} {C.apvLine[0].title}</span>
                <span>작성일: {C.reportDate}</span>
              </div>

              <div className="pt-4" style={{borderTop:'2px solid #064e3b'}}>
                <div className="grid grid-cols-3 gap-4">
                  {C.apvLine.map((p,i)=>(
                    <div key={i} className="border border-slate-300 rounded-lg overflow-hidden">
                      <div className="py-2 text-center text-[12px] font-bold text-white" style={{background:'#064e3b'}}>{p.role}</div>
                      <div className="h-16 flex flex-col items-center justify-end pb-2 gap-1">
                        <div className="text-[13px] font-bold text-slate-700">{p.name}</div>
                        <div className="text-[11px] text-slate-400">{p.dept}</div>
                        <div className="w-16 border-b border-slate-300 mt-1"/>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-center text-[11px] text-slate-400 mt-4">
                  본 보고서는 RoadQ AI 보고서 작성 에이전트 v1.0에 의해 자동 생성되었으며, 담당자 검토 후 확정됩니다.
                </p>
              </div>
            </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportAgent;
