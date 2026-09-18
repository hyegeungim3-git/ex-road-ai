import React, { useState } from 'react';
import { Plus, CheckCircle, Check, Power, Copy } from 'lucide-react';
import { MOCK_MODELS, MOCK_CHAT_APPS, ADMIN_PERSONA, ADMIN_MGMT_GROUPS, ADMIN_REPORT_ROWS, ADMIN_REPORT_TEMPLATES } from '../mocks.js';
import { StatusBadge, Modal, PageShell, useToast, ToggleSwitch } from '../common.jsx';

export const ChatAppPage = () => {
  const toast=useToast();
  const [apps,setApps]=useState(MOCK_CHAT_APPS);
  const [showModal,setShowModal]=useState(false);const [step,setStep]=useState(1);
  const [chatForm,setChatForm]=useState({title:'',desc:'',group:'AI Engineer',model:'GPT-OSS-120B',mode:'knowledge',approval:false});
  const handleCreate=()=>{const id=apps.length>0?Math.max(...apps.map(a=>a.id))+1:1;const a={id,name:chatForm.title,type:'전용 채팅',status:'Online',deploy:'배포',creator:ADMIN_PERSONA.name,dept:chatForm.group,addr:''};setApps(p=>[a,...p]);setShowModal(false);setStep(1);setChatForm({title:'',desc:'',group:'AI Engineer',model:'GPT-OSS-120B',mode:'knowledge',approval:false});toast(`'${chatForm.title}' 채팅 앱이 생성되었습니다.`);};
  const toggleDeploy=(id)=>{setApps(p=>p.map(a=>a.id===id?{...a,status:a.status==='Online'?'Offline':'Online',deploy:a.deploy==='배포'?'배포중지':'배포'}:a));toast('배포 상태가 변경되었습니다.','info');};
  const copyAddr=(id)=>{toast(`앱 ID ${id}의 주소가 클립보드에 복사되었습니다.`);};
  return (
    <PageShell breadcrumb={['애플리케이션','채팅']}>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold">채팅 애플리케이션 목록</h2>
        <div className="flex space-x-2">
          <button onClick={()=>{setShowModal(true);setStep(1);}} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"><Plus size={16} className="mr-1"/>애플리케이션 생성</button>
        </div>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-gray-50 text-xs text-gray-500"><tr>
          <th className="px-4 py-3 text-left">ID</th><th className="px-4 py-3 text-left">제목</th><th className="px-4 py-3 text-left">유형</th><th className="px-4 py-3 text-center">상태</th><th className="px-4 py-3 text-center">배포</th><th className="px-4 py-3 text-left">제작자</th><th className="px-4 py-3 text-left">관리 그룹</th><th className="px-4 py-3 text-center">액션</th>
        </tr></thead><tbody className="divide-y">{apps.map(a=>(
          <tr key={a.id} className="hover:bg-gray-50"><td className="px-4 py-3 text-gray-500">{a.id}</td><td className="px-4 py-3 font-medium">{a.name||'-'}</td><td className="px-4 py-3">{a.type||'-'}</td>
            <td className="px-4 py-3 text-center">{a.status?<StatusBadge status={a.status}/>:'-'}</td>
            <td className="px-4 py-3 text-center">{a.deploy?<span className="cursor-pointer" onClick={()=>toggleDeploy(a.id)}><StatusBadge status={a.deploy}/></span>:'-'}</td>
            <td className="px-4 py-3">{a.creator||'-'}</td><td className="px-4 py-3">{a.dept}</td>
            <td className="px-4 py-3 text-center"><div className="flex items-center justify-center space-x-1">
              <button onClick={()=>copyAddr(a.id)} title="주소 복사"><Copy size={14} className="text-gray-400 cursor-pointer hover:text-blue-600"/></button>
              {a.deploy&&<button onClick={()=>toggleDeploy(a.id)} title={a.deploy==='배포'?'배포 중지':'배포'}><Power size={14} className={a.status==='Online'?'text-green-500 hover:text-red-500':'text-gray-400 hover:text-green-500'}/></button>}
            </div></td></tr>
        ))}</tbody></table>
      </div>
      <Modal isOpen={showModal} onClose={()=>setShowModal(false)} title="채팅 생성" size="md">
        <div className="flex justify-center space-x-4 mb-8">{[1,2,3,4].map(s=>(
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step>s?'bg-blue-600 text-white':step===s?'bg-blue-600 text-white ring-4 ring-blue-100':'bg-gray-200 text-gray-500'}`}>{step>s?<Check size={14}/>:s}</div>
            <span className="ml-2 text-sm font-medium">{['기본정보','모델설정','권한설정','완료'][s-1]}</span>
            {s<4&&<div className={`w-12 h-0.5 mx-2 ${step>s?'bg-blue-600':'bg-gray-200'}`}/>}
          </div>
        ))}</div>
        {step===1&&<div className="space-y-4">
          <div><label className="text-sm font-bold">제목 *</label><input value={chatForm.title} onChange={e=>setChatForm(p=>({...p,title:e.target.value}))} placeholder="제목을 입력하세요" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"/></div>
          <div><label className="text-sm font-bold">상세 설명</label><input value={chatForm.desc} onChange={e=>setChatForm(p=>({...p,desc:e.target.value}))} placeholder="상세 설명을 입력하세요" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"/></div>
          <div><label className="text-sm font-bold">관리 그룹 *</label><select value={chatForm.group} onChange={e=>setChatForm(p=>({...p,group:e.target.value}))} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white">{ADMIN_MGMT_GROUPS.map(g=><option key={g}>{g}</option>)}</select></div>
        </div>}
        {step===2&&<div className="space-y-4">
          <div><label className="text-sm font-bold">LLM 모델 선택 *</label><select value={chatForm.model} onChange={e=>setChatForm(p=>({...p,model:e.target.value}))} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white">{MOCK_MODELS.map(m=><option key={m.id} value={m.name}>{m.name}</option>)}</select></div>
          <div><label className="text-sm font-bold">응답 모드</label>
            <div className="mt-2 space-y-2">
              <div onClick={()=>setChatForm(p=>({...p,mode:'knowledge'}))} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${chatForm.mode==='knowledge'?'bg-blue-50 border-blue-200':''}`}><input type="radio" name="mode" checked={chatForm.mode==='knowledge'} readOnly className="mr-2"/><div><div className="font-medium text-sm">지식 참조 모드</div><div className="text-xs text-gray-500">RAG 파이프라인을 통한 내부 문서 참조 응답</div></div></div>
              <div onClick={()=>setChatForm(p=>({...p,mode:'direct'}))} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${chatForm.mode==='direct'?'bg-blue-50 border-blue-200':''}`}><input type="radio" name="mode" checked={chatForm.mode==='direct'} readOnly className="mr-2"/><div><div className="font-medium text-sm">직접 응답 모드</div><div className="text-xs text-gray-500">내부 LLM만 활용한 즉각적 응답</div></div></div>
            </div>
          </div>
        </div>}
        {step===3&&<div className="space-y-4">
          <div><label className="text-sm font-bold">승인 필요 여부</label><div className="mt-2 flex items-center space-x-2"><ToggleSwitch on={chatForm.approval} onClick={()=>setChatForm(p=>({...p,approval:!p.approval}))}/><span className="text-sm text-gray-600">{chatForm.approval?'승인 후 배포':'즉시 배포'}</span></div></div>
          <div><label className="text-sm font-bold">사용 가능한 관리 그룹</label><select className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white"><option>AI Engineer</option><option>QA</option><option>전체</option></select></div>
          <div><label className="text-sm font-bold">사용 가능한 역할</label><select className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white"><option>전체</option><option>시스템관리자</option><option>부서관리자</option><option>일반사용자</option></select></div>
        </div>}
        {step===4&&<div className="text-center py-8"><CheckCircle size={48} className="mx-auto text-green-500 mb-4"/><h3 className="text-lg font-bold">설정 완료!</h3><p className="text-gray-500 mt-2">'{chatForm.title}' 채팅 애플리케이션이 생성됩니다.</p><div className="mt-4 text-sm text-gray-500"><div>모델: {chatForm.model}</div><div>응답 모드: {chatForm.mode==='knowledge'?'지식 참조':'직접 응답'}</div><div>그룹: {chatForm.group}</div></div></div>}
        <div className="flex justify-between items-center mt-8 pt-4 border-t">
          <button onClick={()=>setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm">닫기</button>
          <div className="flex space-x-2">
            {step>1&&<button onClick={()=>setStep(s=>s-1)} className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium">← 이전</button>}
            <button onClick={()=>{if(step===1&&!chatForm.title.trim()){toast('제목을 입력하세요.','error');return;}if(step<4)setStep(s=>s+1);else handleCreate();}} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">{step===4?'생성':'다음 →'}</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
};

export const ReportGenPage = () => {
  const toast=useToast();
  const [reports,setReports]=useState(ADMIN_REPORT_ROWS.map(r=>({...r})));
  const [showCreate,setShowCreate]=useState(false);const [detail,setDetail]=useState(null);
  const [form,setForm]=useState({title:'',type:'요약',template:ADMIN_REPORT_TEMPLATES[0],source:''});
  return (
    <PageShell breadcrumb={['애플리케이션','보고서 생성']} title="보고서 생성" action={<button onClick={()=>setShowCreate(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"><Plus size={16} className="mr-1"/>새 보고서</button>}>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[{l:'전체 보고서',v:reports.length,c:'bg-blue-50 text-blue-700'},{l:'생성 완료',v:reports.filter(r=>r.status==='완료').length,c:'bg-green-50 text-green-700'},{l:'총 페이지',v:reports.reduce((a,r)=>a+r.pages,0),c:'bg-purple-50 text-purple-700'}].map((s,i)=>(
          <div key={i} className={`p-4 rounded-xl ${s.c}`}><div className="text-2xl font-bold">{s.v}</div><div className="text-xs mt-1 opacity-80">{s.l}</div></div>
        ))}
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr>
          <th className="px-4 py-3 text-left">ID</th><th className="px-4 py-3 text-left">제목</th><th className="px-4 py-3 text-left">유형</th><th className="px-4 py-3 text-left">템플릿</th><th className="px-4 py-3 text-right">페이지</th><th className="px-4 py-3 text-left">상태</th>
        </tr></thead><tbody className="divide-y">{reports.map(r=>(
          <tr key={r.id} className="hover:bg-gray-50 cursor-pointer" onClick={()=>setDetail(r)}>
            <td className="px-4 py-3 font-mono text-xs">{r.id}</td><td className="px-4 py-3 font-medium">{r.title}</td>
            <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded ${r.type==='요약'?'bg-blue-50 text-blue-700':r.type==='분석'?'bg-purple-50 text-purple-700':r.type==='번역'?'bg-green-50 text-green-700':'bg-orange-50 text-orange-700'}`}>{r.type}</span></td>
            <td className="px-4 py-3 text-gray-500">{r.template}</td><td className="px-4 py-3 text-right">{r.pages||'-'}</td><td className="px-4 py-3"><StatusBadge status={r.status}/></td>
          </tr>
        ))}</tbody></table>
      </div>
      <Modal isOpen={showCreate} onClose={()=>setShowCreate(false)} title="새 보고서 생성" size="md">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">제목</label><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="보고서 제목" className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">유형</label><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"><option>요약</option><option>분석</option><option>보고서</option><option>번역</option></select></div>
            <div><label className="block text-sm font-medium mb-1">템플릿</label><select value={form.template} onChange={e=>setForm({...form,template:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{ADMIN_REPORT_TEMPLATES.map(t=><option key={t}>{t}</option>)}</select></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">데이터 소스</label><input value={form.source} onChange={e=>setForm({...form,source:e.target.value})} placeholder="데이터셋 또는 문서명" className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <button onClick={()=>{if(!form.title)return;setReports(p=>[{id:`RPT-${String(p.length+1).padStart(3,'0')}`,title:form.title,type:form.type,template:form.template,status:'생성 중',date:'2026-02-11',pages:0},...p]);setShowCreate(false);setForm({title:'',type:'요약',template:ADMIN_REPORT_TEMPLATES[0],source:''});toast('보고서 생성이 시작되었습니다');}} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm">생성 시작</button>
        </div>
      </Modal>
      <Modal isOpen={!!detail} onClose={()=>setDetail(null)} title={detail?.title} size="lg">
        {detail&&<div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">{[['유형',detail.type],['템플릿',detail.template],['생성일',detail.date],['페이지 수',detail.pages||'생성 중'],['상태',detail.status],['ID',detail.id]].map(([k,v],i)=>(
            <div key={i} className="bg-gray-50 p-3 rounded-lg"><div className="text-xs text-gray-400">{k}</div><div className="font-medium">{v}</div></div>
          ))}</div>
          {detail.status==='완료'&&<button onClick={()=>{toast('보고서를 다운로드합니다');setDetail(null);}} className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium">다운로드</button>}
        </div>}
      </Modal>
    </PageShell>
  );
};

export const DataAnalysisPage = () => {
  const toast=useToast();
  const [showCreate,setShowCreate]=useState(false);
  const [form,setForm]=useState({file:'',type:'CSV',method:'통계분석'});
  const templates=[
    {name:'통계 분석',desc:'기초 통계량, 분포, 상관관계 분석',icon:'📊',color:'bg-blue-50 border-blue-200'},
    {name:'이상치 탐지',desc:'데이터 이상값 자동 탐지 및 시각화',icon:'🔍',color:'bg-red-50 border-red-200'},
    {name:'트렌드 분석',desc:'시계열 추세 및 패턴 분석',icon:'📈',color:'bg-green-50 border-green-200'},
    {name:'텍스트 분석',desc:'자연어 텍스트 감성 및 토픽 분석',icon:'📝',color:'bg-purple-50 border-purple-200'},
  ];
  return (
    <PageShell breadcrumb={['애플리케이션','데이터 분석']} title="데이터 분석" action={<button onClick={()=>setShowCreate(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"><Plus size={16} className="mr-1"/>새 분석</button>}>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[{l:'총 분석 작업',v:47,c:'bg-blue-50 text-blue-700'},{l:'이번 주 실행',v:12,c:'bg-green-50 text-green-700'},{l:'평균 처리시간',v:'2.3분',c:'bg-purple-50 text-purple-700'}].map((s,i)=>(
          <div key={i} className={`p-4 rounded-xl ${s.c}`}><div className="text-2xl font-bold">{s.v}</div><div className="text-xs mt-1 opacity-80">{s.l}</div></div>
        ))}
      </div>
      <h3 className="font-bold mb-3">분석 템플릿</h3>
      <div className="grid grid-cols-2 gap-4 mb-6">{templates.map((t,i)=>(
        <div key={i} className={`p-5 rounded-xl border cursor-pointer hover:shadow-md transition-all ${t.color}`} onClick={()=>{setForm({...form,method:t.name});setShowCreate(true);}}>
          <div className="text-2xl mb-2">{t.icon}</div>
          <h4 className="font-bold text-sm mb-1">{t.name}</h4>
          <p className="text-xs text-gray-500">{t.desc}</p>
        </div>
      ))}</div>
      <Modal isOpen={showCreate} onClose={()=>setShowCreate(false)} title="새 분석 작업" size="md">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">파일 이름</label><input value={form.file} onChange={e=>setForm({...form,file:e.target.value})} placeholder="분석할 파일명" className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">파일 유형</label><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"><option>CSV</option><option>Excel</option><option>JSON</option><option>Parquet</option></select></div>
            <div><label className="block text-sm font-medium mb-1">분석 방법</label><select value={form.method} onChange={e=>setForm({...form,method:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"><option>통계분석</option><option>이상치 탐지</option><option>트렌드 분석</option><option>텍스트 분석</option></select></div>
          </div>
          <button onClick={()=>{setShowCreate(false);toast('분석 작업이 시작되었습니다');}} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm">분석 시작</button>
        </div>
      </Modal>
    </PageShell>
  );
};

// ==================== OPS PAGES ====================
