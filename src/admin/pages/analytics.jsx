import React, { useState } from 'react';
import { Cpu, Plus, Search, ChevronDown, Users, Clock, PieChart, Download, Hash, MessageSquare, TrendingUp, AlertTriangle, Star } from 'lucide-react';
import { MOCK_USAGE_STATS, MOCK_USAGE_HISTORY, MOCK_SATISFACTION_DATA, MOCK_SERVICE_STATS } from '../mocks.js';
import { PageShell, useToast } from '../common.jsx';

export const UsageHistoryPage = () => {
  const [hist]=useState(MOCK_USAGE_HISTORY.map(h=>({...h})));
  const [search,setSearch]=useState('');
  const [modeF,setModeF]=useState('ALL');
  const [expRow,setExpRow]=useState(null);
  const MLBL={GENERAL:'일반질의',REVIEW:'문서검토',TRANSLATE:'번역·요약',REPORT:'보고서',AGENT:'에이전트',SECURE:'보안채팅'};
  const MCLR={GENERAL:'bg-blue-100 text-blue-700',REVIEW:'bg-indigo-100 text-indigo-700',TRANSLATE:'bg-violet-100 text-violet-700',REPORT:'bg-emerald-100 text-emerald-700',AGENT:'bg-orange-100 text-orange-700',SECURE:'bg-red-100 text-red-700'};
  const filt=hist.filter(h=>(modeF==='ALL'||h.mode===modeF)&&(!search||h.query.includes(search)||h.user.includes(search)));
  const errC=filt.filter(h=>h.errReport).length;
  const avgR=(filt.reduce((s,h)=>s+(h.rating||0),0)/(filt.length||1)).toFixed(1);
  return(<PageShell breadcrumb={['관리자 전용','이용 이력 관리']} title="이용 이력 관리">
    <div className="grid grid-cols-4 gap-4 mb-5">
      {[{l:'전체 질의 수',v:filt.length+'건',c:'border-blue-500 bg-blue-50',tc:'text-blue-700'},
        {l:'사용 토큰',v:(filt.reduce((s,h)=>s+h.tokens,0)/1000).toFixed(1)+'K',c:'border-green-500 bg-green-50',tc:'text-green-700'},
        {l:'평균 만족도',v:avgR+'/5',c:'border-yellow-500 bg-yellow-50',tc:'text-yellow-700'},
        {l:'오류 신고',v:errC+'건',c:'border-red-500 bg-red-50',tc:'text-red-700'}
      ].map((s,i)=><div key={i} className={`p-5 rounded-xl border-l-4 shadow-sm ${s.c}`}>
        <div className="text-xs text-gray-500">{s.l}</div><div className={`text-2xl font-bold mt-1 ${s.tc}`}>{s.v}</div>
      </div>)}
    </div>
    <div className="bg-white rounded-xl border shadow-sm p-4 mb-4 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 flex-1 min-w-[180px]">
        <Search size={14} className="text-gray-400 shrink-0"/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="사용자명·질의 내용 검색" className="flex-1 text-sm outline-none text-gray-700 placeholder:text-gray-400"/>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {['ALL','GENERAL','REVIEW','TRANSLATE','REPORT','AGENT','SECURE'].map(m=>(
          <button key={m} onClick={()=>setModeF(m)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${modeF===m?'bg-blue-600 text-white':'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
            {m==='ALL'?'전체':MLBL[m]}
          </button>
        ))}
      </div>
    </div>
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <table className="w-full text-sm"><thead><tr className="bg-gray-50 text-xs text-gray-500 border-b">
        {['시각','사용자','모드','질의 내용','토큰','만족도','오류신고',''].map((h,i)=><th key={i} className="text-left px-4 py-3 font-semibold">{h}</th>)}
      </tr></thead><tbody className="divide-y divide-gray-50">
        {filt.map(h=>(
          <React.Fragment key={h.id}>
            <tr className={`hover:bg-gray-50 cursor-pointer transition-colors ${h.errReport?'bg-red-50/30':''}`} onClick={()=>setExpRow(expRow===h.id?null:h.id)}>
              <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{h.time}</td>
              <td className="px-4 py-3"><div className="font-medium">{h.user}</div><div className="text-xs text-gray-400">{h.dept}</div></td>
              <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-bold ${MCLR[h.mode]||'bg-gray-100 text-gray-500'}`}>{MLBL[h.mode]}</span></td>
              <td className="px-4 py-3 max-w-[220px]"><p className="text-sm text-gray-700 truncate">{h.query}</p></td>
              <td className="px-4 py-3 text-xs text-gray-500">{h.tokens}</td>
              <td className="px-4 py-3"><div className="flex gap-0.5">{[1,2,3,4,5].map(s=><Star key={s} size={12} className={s<=h.rating?'text-yellow-400 fill-yellow-400':'text-gray-200'}/>)}</div></td>
              <td className="px-4 py-3">{h.errReport&&<span className="flex items-center gap-1 text-xs text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full w-fit"><AlertTriangle size={10}/>신고됨</span>}</td>
              <td className="px-4 py-3"><ChevronDown size={14} className={`text-gray-400 transition-transform ${expRow===h.id?'rotate-180':''}`}/></td>
            </tr>
            {expRow===h.id&&<tr className="bg-blue-50/20"><td colSpan={8} className="px-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><div className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">질의</div><div className="text-sm text-gray-700 bg-white rounded-lg p-3 border leading-relaxed">{h.query}</div></div>
                <div><div className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">AI 답변 요약</div>
                  <div className="text-sm text-gray-700 bg-white rounded-lg p-3 border leading-relaxed line-clamp-3">{h.answer}</div>
                  {h.errReport&&<div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-100 text-xs text-red-600"><AlertTriangle size={10} className="inline mr-1"/><strong>신고 사유:</strong> {h.errDetail}</div>}
                </div>
              </div>
            </td></tr>}
          </React.Fragment>
        ))}
      </tbody></table>
    </div>
  </PageShell>);
};

const SURVEY_TARGETS=['전체 사용자','최근 30일 이용자','부서관리자'];

export const SatisfactionMgmtPage = () => {
  const [data]=useState(MOCK_SATISFACTION_DATA);
  const toast=useToast();
  const [survey,setSurvey]=useState(null);   // 발송 폼 상태
  const [sentLog,setSentLog]=useState([]);   // 이번 세션 발송 이력
  const sendSurvey=()=>{
    if(!survey.subject.trim()){toast('제목을 입력하세요.','info');return;}
    const now=new Date();
    setSentLog(p=>[{target:survey.target,subject:survey.subject.trim(),
      at:`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`},...p]);
    toast(`${survey.target}에게 만족도 조사를 발송했습니다`);
    setSurvey(null);
  };
  return(<PageShell breadcrumb={['관리자 전용','이용만족도 관리']} title="이용만족도 관리" action={<button onClick={()=>setSurvey({target:SURVEY_TARGETS[0],subject:'RoadQ 이용 만족도 조사'})} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center hover:bg-blue-700"><Plus size={14} className="mr-1.5"/>만족도 조사 발송</button>}>
    {survey&&(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={()=>setSurvey(null)}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4" onClick={e=>e.stopPropagation()}>
          <h3 className="font-bold text-lg mb-4">만족도 조사 발송</h3>
          <label className="block text-sm font-medium mb-1">발송 대상</label>
          <select value={survey.target} onChange={e=>setSurvey(p=>({...p,target:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm bg-white mb-3">{SURVEY_TARGETS.map(t=><option key={t}>{t}</option>)}</select>
          <label className="block text-sm font-medium mb-1">제목</label>
          <input value={survey.subject} onChange={e=>setSurvey(p=>({...p,subject:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mb-4"/>
          <div className="flex gap-2">
            <button onClick={()=>setSurvey(null)} className="flex-1 py-2.5 border rounded-lg text-sm font-medium hover:bg-gray-50">취소</button>
            <button onClick={sendSurvey} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">발송</button>
          </div>
        </div>
      </div>
    )}
    {sentLog.length>0&&(
      <div className="mb-5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
        <div className="text-xs font-bold text-blue-700 mb-1.5">이번 세션 발송 내역 {sentLog.length}건</div>
        {sentLog.map((s,i)=><div key={i} className="text-xs text-blue-700">· {s.at} · {s.target} · {s.subject}</div>)}
      </div>
    )}
    <div className="grid grid-cols-4 gap-4 mb-6">
      {[{l:'평균 만족도',v:`${data.avg}점`,c:'border-yellow-500 bg-yellow-50',tc:'text-yellow-700'},
        {l:'총 응답 수',v:`${data.total}건`,c:'border-blue-500 bg-blue-50',tc:'text-blue-700'},
        {l:'응답률',v:'68%',c:'border-green-500 bg-green-50',tc:'text-green-700'},
        {l:'오류 신고',v:'12건',c:'border-red-500 bg-red-50',tc:'text-red-700'}
      ].map((s,i)=><div key={i} className={`p-5 rounded-xl border-l-4 shadow-sm ${s.c}`}>
        <div className="text-xs text-gray-500">{s.l}</div><div className={`text-2xl font-bold mt-1 ${s.tc}`}>{s.v}</div>
      </div>)}
    </div>
    <div className="grid grid-cols-3 gap-5 mb-6">
      <div className="bg-white rounded-xl border shadow-sm p-5">
        <h3 className="font-bold text-sm mb-4">평점 분포</h3>
        <div className="space-y-2.5">
          {data.dist.map(d=><div key={d.stars} className="flex items-center gap-3">
            <div className="flex gap-0.5 w-14 shrink-0">{[1,2,3,4,5].map(s=><Star key={s} size={10} className={s<=d.stars?'text-yellow-400 fill-yellow-400':'text-gray-200'}/>)}</div>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-yellow-400 rounded-full" style={{width:`${d.pct}%`}}/></div>
            <div className="text-xs text-gray-500 w-16 text-right">{d.count}건 ({d.pct}%)</div>
          </div>)}
        </div>
      </div>
      <div className="col-span-2 bg-white rounded-xl border shadow-sm p-5">
        <h3 className="font-bold text-sm mb-4">주간 만족도 추이</h3>
        <div className="flex items-end gap-2 h-28">
          {[{d:'02-19',v:3.8},{d:'02-20',v:4.0},{d:'02-21',v:4.1},{d:'02-22',v:3.9},{d:'02-23',v:4.3},{d:'02-24',v:4.5},{d:'02-25',v:4.2}].map((pt,i)=>(
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="text-[10px] font-bold text-yellow-600">{pt.v}</div>
              <div className="w-full rounded-t-md overflow-hidden" style={{height:`${(pt.v/5)*100}%`,minHeight:'8px'}}>
                <div className="w-full h-full bg-yellow-400"></div>
              </div>
              <div className="text-[9px] text-gray-400">{pt.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between"><h3 className="font-bold text-sm">최근 응답</h3>
        <span className="text-xs text-gray-400">최근 5건</span></div>
      <table className="w-full text-sm"><thead><tr className="bg-gray-50 text-xs text-gray-500 border-b">
        {['사용자','부서','평점','의견','날짜'].map((h,i)=><th key={i} className="text-left px-4 py-2.5 font-semibold">{h}</th>)}
      </tr></thead><tbody className="divide-y divide-gray-50">
        {data.recent.map(r=><tr key={r.id} className="hover:bg-gray-50">
          <td className="px-4 py-3 font-medium">{r.user}</td>
          <td className="px-4 py-3 text-xs text-gray-500">{r.dept}</td>
          <td className="px-4 py-3"><div className="flex gap-0.5">{[1,2,3,4,5].map(s=><Star key={s} size={12} className={s<=r.stars?'text-yellow-400 fill-yellow-400':'text-gray-200'}/>)}</div></td>
          <td className="px-4 py-3 text-xs text-gray-700 max-w-[300px]">{r.comment}</td>
          <td className="px-4 py-3 text-xs text-gray-400">{r.date}</td>
        </tr>)}
      </tbody></table>
    </div>
  </PageShell>);
};

export const UsageStatsPage = () => {
  const [period,setPeriod]=useState('week');
  const maxQ=Math.max(...MOCK_USAGE_STATS.daily.map(d=>d.queries));
  return (
    <PageShell breadcrumb={['관리자 전용','이용 통계']} title="이용 통계 및 분석">
      <div className="flex items-center space-x-2 mb-5">
        {[['week','최근 7일'],['month','최근 30일'],['quarter','분기']].map(([k,l])=>(
          <button key={k} onClick={()=>setPeriod(k)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${period===k?'bg-blue-600 text-white':'bg-white border hover:bg-gray-50'}`}>{l}</button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[{l:'총 질의 수',v:'11,470',c:'border-blue-500',tc:'text-blue-700',bg:'bg-blue-50',icon:MessageSquare},{l:'활성 사용자',v:'128',c:'border-green-500',tc:'text-green-700',bg:'bg-green-50',icon:Users},{l:'평균 응답시간',v:'1.1s',c:'border-purple-500',tc:'text-purple-700',bg:'bg-purple-50',icon:Clock},{l:'만족도',v:'4.2/5',c:'border-orange-500',tc:'text-orange-700',bg:'bg-orange-50',icon:Star}].map((c,i)=>(
          <div key={i} className={`p-5 rounded-xl border-l-4 bg-white shadow-sm ${c.c}`}>
            <div className="flex items-center justify-between mb-2"><span className="text-xs text-gray-500">{c.l}</span><c.icon size={16} className="text-gray-300"/></div>
            <div className={`text-2xl font-bold ${c.tc}`}>{c.v}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-5 mb-6">
        <div className="col-span-2 bg-white rounded-xl border shadow-sm p-5">
          <h3 className="font-bold text-sm mb-4">일별 질의량 추이</h3>
          <div className="flex items-end space-x-2 h-40">
            {MOCK_USAGE_STATS.daily.map((d,i)=>(
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-blue-100 rounded-t-md relative" style={{height:`${(d.queries/maxQ)*100}%`,minHeight:'4px'}}>
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 font-medium whitespace-nowrap">{d.queries}</div>
                </div>
                <div className="text-[10px] text-gray-400 mt-1.5 font-medium">{d.date}</div>
                <div className="text-[10px] text-gray-300">{d.users}명</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <h3 className="font-bold text-sm mb-4">부서별 이용 현황</h3>
          <div className="space-y-3">{MOCK_USAGE_STATS.byDept.map((d,i)=>(
            <div key={i}>
              <div className="flex justify-between text-xs mb-1"><span className="text-gray-600 font-medium">{d.dept}</span><span className="text-gray-500">{d.queries.toLocaleString()}건 ({d.pct}%)</span></div>
              <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{width:`${d.pct*100/28}%`}}/></div>
            </div>
          ))}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <h3 className="font-bold text-sm mb-4">모델별 사용량</h3>
          <div className="space-y-3">{MOCK_USAGE_STATS.byModel.map((m,i)=>(
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2"><Cpu size={14} className="text-gray-400"/><span className="text-sm font-medium">{m.model}</span></div>
              <div className="flex items-center space-x-3"><span className="text-sm font-bold">{m.queries.toLocaleString()}</span><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">{m.pct}%</span></div>
            </div>
          ))}</div>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <h3 className="font-bold text-sm mb-4">인기 검색 키워드 (Top 10)</h3>
          <div className="flex flex-wrap gap-2">{MOCK_USAGE_STATS.topKeywords.map((kw,i)=>(
            <span key={i} className={`px-3 py-1.5 rounded-full border text-sm font-medium ${i<3?'bg-blue-50 text-blue-700 border-blue-200':'bg-gray-50 text-gray-600 border-gray-200'}`}>
              <Hash size={12} className="inline mr-1"/>{kw}
            </span>
          ))}</div>
        </div>
      </div>
    </PageShell>
  );
};

export const InfoServiceStatsPage = () => {
  const [tab, setTab] = useState('overview');
  const toast = useToast();
  const TABS = [{id:'overview',label:'📊 이용 현황'},{id:'keyword',label:'🔑 키워드 분석'},{id:'apistats',label:'🔌 API 통계'}];
  const maxKw = MOCK_SERVICE_STATS.keywords[0].cnt;
  const maxBar = Math.max(...MOCK_SERVICE_STATS.daily.map(d=>d.api));
  return (
    <PageShell breadcrumb={['운영·관리','서비스 통계 리포트']} title="서비스 통계 리포트" sub="이용자 · 대화 · API · 키워드 통합 분석">
      <div className="flex gap-0.5 mb-6 border-b border-gray-200 -mx-6 px-6">
        {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`px-4 py-2.5 text-[13px] font-bold border-b-2 whitespace-nowrap transition-colors ${tab===t.id?'border-blue-600 text-blue-700 bg-blue-50/60':'border-transparent text-gray-500 hover:text-gray-700'}`}>{t.label}</button>)}
      </div>
      {tab==='overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-6 gap-4">
            {[{label:'전체 사용자',v:MOCK_SERVICE_STATS.summary.users.toLocaleString(),sub:`오늘 +${MOCK_SERVICE_STATS.summary.newToday}명`,c:'text-blue-600'},{label:'총 대화 건수',v:MOCK_SERVICE_STATS.summary.conversations.toLocaleString(),sub:'누적',c:'text-green-600'},{label:'API 호출',v:MOCK_SERVICE_STATS.summary.apiCalls.toLocaleString(),sub:'누적',c:'text-purple-600'},{label:'링크 연계',v:MOCK_SERVICE_STATS.summary.linkCalls.toLocaleString(),sub:'누적',c:'text-indigo-600'},{label:'만족도 응답',v:MOCK_SERVICE_STATS.summary.feedbacks,sub:'건',c:'text-yellow-600'},{label:'오늘 신규 가입',v:MOCK_SERVICE_STATS.summary.newToday,sub:'명',c:'text-teal-600'}].map(s=>(
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-center">
                <div className={`text-2xl font-black ${s.c}`}>{s.v}</div>
                <div className="text-[11px] text-gray-500 mt-1">{s.label}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-black text-[14px] text-gray-700 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-500"/> 일별 이용 추이 (최근 7일)</h4>
              <button onClick={()=>toast('통계 데이터를 엑셀로 내보냅니다.')} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-[12px] font-bold hover:bg-gray-50"><Download className="w-3.5 h-3.5"/> 엑셀 내보내기</button>
            </div>
            <div className="flex items-end gap-2" style={{height:'100px'}}>
              {MOCK_SERVICE_STATS.daily.map(d=>{
                const h = Math.max(8, Math.round((d.api/maxBar)*90));
                const uh = Math.max(4, Math.round((d.users/150)*60));
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5">
                    <div className="w-full flex flex-col items-center" style={{height:'90px',justifyContent:'flex-end'}}>
                      <div className="w-3 rounded-t bg-blue-400 mb-0.5" style={{height:`${uh}px`}} title={`사용자 ${d.users}명`}/>
                      <div className="w-full rounded bg-purple-300" style={{height:`${h}px`}} title={`API ${d.api}건`}/>
                    </div>
                    <span className="text-[10px] text-gray-400">{d.date}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-2 text-[11px]"><span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-400 inline-block"/> 사용자</span><span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-purple-300 inline-block"/> API 호출</span></div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h4 className="font-black text-[14px] text-gray-700 mb-4 flex items-center gap-2"><PieChart className="w-4 h-4 text-indigo-500"/> 주제어별 질의 분포</h4>
            <div className="space-y-3">
              {MOCK_SERVICE_STATS.topics.map(t=>(
                <div key={t.topic} className="flex items-center gap-3">
                  <span className="text-[13px] font-bold text-gray-700 w-24 shrink-0">{t.topic}</span>
                  <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${t.c} transition-all`} style={{width:`${t.pct}%`}}/>
                  </div>
                  <span className="text-[13px] font-black text-gray-700 w-10 text-right">{t.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {tab==='keyword' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h4 className="font-black text-[14px] text-gray-700 mb-4 flex items-center gap-2"><Hash className="w-4 h-4 text-blue-500"/> 키워드 빈도 상위 12개</h4>
            <div className="space-y-2">
              {MOCK_SERVICE_STATS.keywords.map((k,i)=>(
                <div key={k.word} className="flex items-center gap-3">
                  <span className={`text-[12px] font-black w-5 text-right ${i<3?'text-blue-600':'text-gray-400'}`}>{i+1}</span>
                  <span className="text-[13px] font-bold text-gray-800 w-28 shrink-0">{k.word}</span>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${i===0?'bg-blue-500':i===1?'bg-blue-400':i===2?'bg-blue-300':'bg-gray-300'}`} style={{width:`${Math.round((k.cnt/maxKw)*100)}%`}}/>
                  </div>
                  <span className="text-[12px] font-bold text-gray-600 w-16 text-right">{k.cnt.toLocaleString()}건</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h4 className="font-black text-[14px] text-gray-700 mb-3">키워드 클라우드</h4>
            <div className="flex flex-wrap gap-2">
              {MOCK_SERVICE_STATS.keywords.map((k,i)=>(
                <span key={k.word} className={`px-3 py-1.5 rounded-full font-bold cursor-default select-none ${i===0?'text-[18px] bg-blue-600 text-white':i<3?'text-[16px] bg-blue-100 text-blue-800':i<6?'text-[14px] bg-gray-100 text-gray-700':'text-[12px] bg-gray-50 text-gray-500'}`}>{k.word}</span>
              ))}
            </div>
          </div>
        </div>
      )}
      {tab==='apistats' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm overflow-hidden">
            <h4 className="font-black text-[14px] text-gray-700 mb-4">엔드포인트별 오늘 호출 현황</h4>
            <table className="w-full text-[13px]">
              <thead><tr className="border-b border-gray-100 bg-gray-50">{['엔드포인트','호출 건수','비율','막대'].map(h=><th key={h} className="text-left font-bold text-gray-500 py-2 px-3 text-[11px] uppercase">{h}</th>)}</tr></thead>
              <tbody>{MOCK_SERVICE_STATS.apiByEndpoint.map(a=>(
                <tr key={a.ep} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-gray-800">{a.ep}</td>
                  <td className="py-2.5 px-3 font-bold text-gray-700">{a.calls.toLocaleString()}</td>
                  <td className="py-2.5 px-3 font-bold text-blue-600">{a.pct}%</td>
                  <td className="py-2.5 px-3 w-48"><div className="h-2 bg-gray-100 rounded-full"><div className="h-full bg-blue-500 rounded-full" style={{width:`${a.pct}%`}}/></div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h4 className="font-black text-[14px] text-gray-700 mb-4">시간대별 API 호출 패턴 (오늘)</h4>
            <div className="flex items-end gap-1" style={{height:'80px'}}>
              {MOCK_SERVICE_STATS.peakHours.map((v,h)=>{
                const max=195; const ht=Math.max(2,Math.round((v/max)*72));
                return <div key={h} className="flex-1 flex flex-col items-center" title={`${h}시: ${v}건`}><div className="w-full rounded-t" style={{height:`${ht}px`,background:v>150?'#3b82f6':v>80?'#93c5fd':'#dbeafe'}}/></div>;
              })}
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>0시</span><span>6시</span><span>12시</span><span>18시</span><span>23시</span></div>
            <p className="text-[12px] text-gray-500 mt-2 font-medium">피크 시간: <strong className="text-blue-600">17:00~18:00 (195건)</strong></p>
          </div>
        </div>
      )}
    </PageShell>
  );
};

// ==================== 콘텐츠 관리 ====================
