import React, { useState } from 'react';
import { Database, Settings, FileText, AlertCircle, Bot, Shield, Users, UploadCloud, RotateCcw, BookOpen, TrendingUp, Megaphone, FolderTree, Link2, Star } from 'lucide-react';
import { MOCK_USERS, MOCK_KNOWLEDGE_AREAS, MOCK_CONNECTED_SW, MOCK_QUALITY_REVIEWS, MOCK_ANNOUNCEMENTS, MOCK_LINKED_SW, ADMIN_PERSONA, ADMIN_MY_DOCS } from '../mocks.js';
import { StatusBadge, Modal, PageShell, useToast } from '../common.jsx';

export const SystemMonitorPage = () => (
  <PageShell breadcrumb={['관리자 전용','시스템 모니터링']} title="연동 SW 및 시스템 모니터링">
    <div className="grid grid-cols-3 gap-4 mb-6">
      {[{l:'연동 SW',v:MOCK_LINKED_SW.length,u:'개',c:'border-blue-500 bg-blue-50',tc:'text-blue-700'},
        {l:'정상 가동',v:MOCK_LINKED_SW.filter(s=>s.status==='Running').length,u:'개',c:'border-green-500 bg-green-50',tc:'text-green-700'},
        {l:'주의 필요',v:MOCK_LINKED_SW.filter(s=>s.status==='Warning').length,u:'개',c:'border-orange-500 bg-orange-50',tc:'text-orange-700'}
      ].map((c,i)=>(
        <div key={i} className={`p-5 rounded-xl border-l-4 bg-white shadow-sm ${c.c}`}>
          <div className="text-xs text-gray-500 mb-1">{c.l}</div>
          <div className={`text-2xl font-bold ${c.tc}`}>{c.v}<span className="text-sm font-normal text-gray-400 ml-1">{c.u}</span></div>
        </div>
      ))}
    </div>
    <div className="space-y-3">{MOCK_LINKED_SW.map((sw,i)=>(
      <div key={i} className="bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sw.status==='Running'?'bg-green-50':'bg-orange-50'}`}>
              <Link2 size={20} className={sw.status==='Running'?'text-green-600':'text-orange-500'}/>
            </div>
            <div>
              <div className="flex items-center space-x-2"><h3 className="font-bold text-sm">{sw.name}</h3><StatusBadge status={sw.status}/></div>
              <div className="flex items-center space-x-3 text-xs text-gray-400 mt-0.5">
                <span>v{sw.version}</span>
                <span className="font-mono">{sw.endpoint}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <div className="text-center"><div className="font-bold text-gray-800">{sw.cpu}%</div><div className="text-xs text-gray-400">CPU</div></div>
            <div className="text-center"><div className="font-bold text-gray-800">{sw.memory}%</div><div className="text-xs text-gray-400">Memory</div></div>
            <div className="text-center"><div className="font-bold text-gray-800">{sw.uptime}</div><div className="text-xs text-gray-400">Uptime</div></div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2">
          <div><div className="flex justify-between text-xs mb-1"><span className="text-gray-500">CPU</span><span className="font-medium">{sw.cpu}%</span></div>
            <div className="w-full bg-gray-100 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${sw.cpu>40?'bg-orange-500':'bg-green-500'}`} style={{width:`${sw.cpu}%`}}/></div></div>
          <div><div className="flex justify-between text-xs mb-1"><span className="text-gray-500">Memory</span><span className="font-medium">{sw.memory}%</span></div>
            <div className="w-full bg-gray-100 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${sw.memory>50?'bg-orange-500':'bg-green-500'}`} style={{width:`${sw.memory}%`}}/></div></div>
        </div>
      </div>
    ))}</div>
  </PageShell>
);

export const AdminPage = () => (
  <PageShell breadcrumb={['관리자 전용','관리']} title="시스템 관리">
    <div className="grid grid-cols-3 gap-5">
      {[{icon:Users,title:'사용자 관리',desc:'계정, 권한, 역할 관리',count:`${MOCK_USERS.length}명`,color:'bg-blue-50 text-blue-600'},
        {icon:FolderTree,title:'지식영역 관리',desc:'RAG 지식 DB 및 접근 권한',count:`${MOCK_KNOWLEDGE_AREAS.length}개`,color:'bg-purple-50 text-purple-600'},
        {icon:TrendingUp,title:'이용 통계',desc:'질의 현황, 부서별 분석',count:'11,470건',color:'bg-green-50 text-green-600'},
        {icon:FileText,title:'접근 로그',desc:'감사 로그 및 이력 추적',count:'2,450건',color:'bg-orange-50 text-orange-600'},
        {icon:Star,title:'AI 품질 관리',desc:'전문가 검토, 골든 데이터',count:`${MOCK_QUALITY_REVIEWS.length}건`,color:'bg-red-50 text-red-600'},
        {icon:Megaphone,title:'공지사항',desc:'공지, 점검, 업데이트 안내',count:`${MOCK_ANNOUNCEMENTS.filter(a=>a.status==='Running').length}건 게시 중`,color:'bg-teal-50 text-teal-600'},
        {icon:Link2,title:'시스템 모니터링',desc:'연동 SW 상태 모니터링',count:`${MOCK_LINKED_SW.length}개 연동`,color:'bg-indigo-50 text-indigo-600'},
        {icon:Shield,title:'보안 설정',desc:'접근 제어, DRM, IP 제한',count:'활성',color:'bg-gray-50 text-gray-600'},
        {icon:Settings,title:'시스템 설정',desc:'전역 설정 및 구성 관리',count:'',color:'bg-gray-50 text-gray-600'}
      ].map((c,i)=>(
        <div key={i} className="bg-white p-5 rounded-xl border shadow-sm hover:shadow-md hover:border-blue-300 cursor-pointer transition-all">
          <div className="flex items-center space-x-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.color}`}><c.icon size={20}/></div>
            <div><h3 className="font-bold text-sm">{c.title}</h3><p className="text-xs text-gray-500">{c.desc}</p></div>
          </div>
          {c.count&&<div className="text-right text-xs font-medium text-gray-400">{c.count}</div>}
        </div>
      ))}
    </div>
  </PageShell>
);

export const UserPage = () => {
  const toast=useToast();
  const [profile,setProfile]=useState({name:ADMIN_PERSONA.name,dept:ADMIN_PERSONA.dept,role:ADMIN_PERSONA.role,email:ADMIN_PERSONA.email,phone:'02-2100-0000'});
  const [showEdit,setShowEdit]=useState(false);const [editForm,setEditForm]=useState({...profile});
  const [docs]=useState(ADMIN_MY_DOCS);
  const [apiKey]=useState('roadq-api-xxxx-xxxx-1a2b');const [showKey,setShowKey]=useState(false);
  return (
    <PageShell breadcrumb={['사용자 페이지']} title="내 정보 및 개인 지식영역">
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[{l:'총 질의 수',v:'1,247',c:'bg-blue-50 text-blue-700'},{l:'이번 달 사용량',v:'342',c:'bg-green-50 text-green-700'},{l:'업로드 문서',v:docs.length,c:'bg-purple-50 text-purple-700'},{l:'API 호출',v:'856',c:'bg-orange-50 text-orange-700'}].map((s,i)=>(
          <div key={i} className={`p-4 rounded-xl ${s.c}`}><div className="text-2xl font-bold">{s.v}</div><div className="text-xs mt-1 opacity-80">{s.l}</div></div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border">
          <div className="flex justify-between items-center mb-4"><h3 className="font-bold">내 프로필</h3><button onClick={()=>{setEditForm({...profile});setShowEdit(true);}} className="text-xs text-blue-600 hover:underline">수정</button></div>
          <div className="space-y-3 text-sm">{Object.entries({이름:profile.name,부서:profile.dept,역할:profile.role,이메일:profile.email,전화:profile.phone}).map(([k,v],i)=>(
            <div key={i} className="flex justify-between border-b pb-2"><span className="text-gray-500">{k}</span><span className="font-medium">{v}</span></div>
          ))}</div>
        </div>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border">
            <h3 className="font-bold mb-4">업로드 문서</h3>
            <div className="space-y-2 mb-4">{docs.map((d,i)=>(
              <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <div><div className="text-sm font-medium">{d.name}</div><div className="text-xs text-gray-400">{d.size} · {d.date}</div></div>
              </div>
            ))}</div>
            <button onClick={()=>toast('문서 업로드 (데모)')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"><UploadCloud size={16} className="mr-1"/>문서 업로드</button>
          </div>
          <div className="bg-white p-6 rounded-xl border">
            <h3 className="font-bold mb-3">API 키</h3>
            <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
              <code className="text-sm flex-1 font-mono">{showKey?apiKey:'roadq-api-xxxx-xxxx-****'}</code>
              <button onClick={()=>setShowKey(!showKey)} className="text-xs text-blue-600 hover:underline">{showKey?'숨기기':'보기'}</button>
              <button onClick={()=>{navigator.clipboard?.writeText(apiKey);toast('API 키가 복사되었습니다');}} className="text-xs text-gray-500 hover:underline">복사</button>
            </div>
            <button onClick={()=>toast('API 키가 재발급되었습니다','info')} className="mt-2 text-xs text-red-500 hover:underline">키 재발급</button>
          </div>
        </div>
      </div>
      <Modal isOpen={showEdit} onClose={()=>setShowEdit(false)} title="프로필 수정" size="md">
        <div className="space-y-4">
          {[['이름','name'],['부서','dept'],['이메일','email'],['전화','phone']].map(([label,key])=>(
            <div key={key}><label className="block text-sm font-medium mb-1">{label}</label><input value={editForm[key]} onChange={e=>setEditForm({...editForm,[key]:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          ))}
          <button onClick={()=>{setProfile(editForm);setShowEdit(false);toast('프로필이 수정되었습니다');}} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm">저장</button>
        </div>
      </Modal>
    </PageShell>
  );
};

// ==================== 신뢰성 관리 (환각 최소화) ====================
export const ConnectedMonitorPage = () => {
  const toast = useToast();
  const SW = [
    {key:'rag',name:'RAG 서비스',icon:BookOpen,c:'blue',d:MOCK_CONNECTED_SW.rag,metrics:[['QPS',MOCK_CONNECTED_SW.rag.qps],['평균 지연',`${MOCK_CONNECTED_SW.rag.avgLatency}ms`],['성공률',`${MOCK_CONNECTED_SW.rag.successRate}%`],['대기 큐',`${MOCK_CONNECTED_SW.rag.queueSize}건`]]},
    {key:'ocr',name:'OCR 엔진',icon:FileText,c:'green',d:MOCK_CONNECTED_SW.ocr,metrics:[['처리 건수',MOCK_CONNECTED_SW.ocr.processed],['평균 지연',`${MOCK_CONNECTED_SW.ocr.avgLatency}ms`],['성공률',`${MOCK_CONNECTED_SW.ocr.successRate}%`],['대기 큐',`${MOCK_CONNECTED_SW.ocr.queueSize}건`]]},
    {key:'vectordb',name:'VectorDB (Milvus)',icon:Database,c:'purple',d:MOCK_CONNECTED_SW.vectordb,metrics:[['총 벡터',MOCK_CONNECTED_SW.vectordb.totalVectors.toLocaleString()],['QPS',MOCK_CONNECTED_SW.vectordb.qps],['쿼리 지연',`${MOCK_CONNECTED_SW.vectordb.avgQueryMs}ms`],['디스크',MOCK_CONNECTED_SW.vectordb.diskUsage]]},
    {key:'agent',name:'에이전트 엔진',icon:Bot,c:'orange',d:MOCK_CONNECTED_SW.agent,metrics:[['활성 파이프라인',MOCK_CONNECTED_SW.agent.activePipelines],['오늘 완료',MOCK_CONNECTED_SW.agent.completedToday],['오늘 실패',MOCK_CONNECTED_SW.agent.failedToday],['평균 실행',`${MOCK_CONNECTED_SW.agent.avgExecSec}s`]]},
  ];
  const statCls = {정상:'bg-green-100 text-green-700',주의:'bg-yellow-100 text-yellow-700',오류:'bg-red-100 text-red-700'};
  const levelCls = {INFO:'text-gray-500',WARN:'text-yellow-600 font-bold',ERROR:'text-red-600 font-bold'};
  return (
    <PageShell breadcrumb={['운영·관리','연계 SW 모니터링']} title="연계 SW 통합 모니터링" sub="RAG · OCR · VectorDB · Agent 실시간 상태 및 로그">
      <div className="grid grid-cols-2 gap-5 mb-5">
        {SW.map(sw=>(
          <div key={sw.key} className="bg-white rounded-2xl border-2 border-gray-100 p-5 shadow-sm hover:border-blue-100 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-${sw.c}-50 border-2 border-${sw.c}-100 flex items-center justify-center`}><sw.icon className={`w-5 h-5 text-${sw.c}-600`}/></div>
                <div><div className="font-black text-[14px] text-gray-800">{sw.name}</div><div className="text-[11px] text-gray-400">{sw.key==='vectordb'?MOCK_CONNECTED_SW.vectordb.name:sw.name}</div></div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${statCls[sw.d.status]}`}>{sw.d.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {sw.metrics.map(([k,v])=>(
                <div key={k} className="bg-gray-50 rounded-xl p-3"><div className="text-[10px] text-gray-400 font-medium">{k}</div><div className="font-black text-[15px] text-gray-800 mt-0.5">{v}</div></div>
              ))}
            </div>
            {sw.key==='agent'&&MOCK_CONNECTED_SW.agent.failedToday>0&&<div className="mt-3 p-2.5 bg-yellow-50 border border-yellow-200 rounded-xl text-[11px] text-yellow-700 font-medium">⚠ 오늘 {MOCK_CONNECTED_SW.agent.failedToday}건 실패 — 재처리 큐 확인 권장</div>}
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <h4 className="font-black text-[14px] text-gray-700">연계 SW 통합 로그 (최근)</h4>
          <button onClick={()=>toast('로그를 새로고침했습니다.')} className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-[12px] font-bold hover:bg-gray-50"><RotateCcw className="w-3.5 h-3.5"/> 새로고침</button>
        </div>
        <table className="w-full text-[12px]">
          <thead><tr className="border-b border-gray-100 bg-gray-50">{['시각','SW','레벨','메시지'].map(h=><th key={h} className="text-left font-bold text-gray-500 py-2.5 px-4 text-[11px] uppercase whitespace-nowrap">{h}</th>)}</tr></thead>
          <tbody>{MOCK_CONNECTED_SW.logs.map((l,i)=>(
            <tr key={i} className={`border-b border-gray-50 hover:bg-gray-50 ${l.level==='ERROR'?'bg-red-50/40':l.level==='WARN'?'bg-yellow-50/40':''}`}>
              <td className="py-2.5 px-4 text-gray-400 whitespace-nowrap font-mono">{l.time}</td>
              <td className="py-2.5 px-4"><span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[11px] font-bold">{l.sw}</span></td>
              <td className={`py-2.5 px-4 text-[11px] font-black ${levelCls[l.level]}`}>{l.level}</td>
              <td className="py-2.5 px-4 text-gray-700">{l.msg}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div className="mt-5 bg-indigo-50 border-2 border-indigo-100 rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5"/>
        <p className="text-[13px] text-indigo-800 font-medium">임계치 초과 시 Slack 및 이메일로 즉시 알림이 발송됩니다. 알림 기준: <strong>에러율 &gt;2%</strong>, <strong>응답 지연 p99 &gt;1s</strong>, <strong>큐 적체 &gt;100건</strong>. 임계값은 시스템 모니터링 페이지에서 설정 가능합니다.</p>
      </div>
    </PageShell>
  );
};

// ==================== RAG PIPELINE PAGE ====================
