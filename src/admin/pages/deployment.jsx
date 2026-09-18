import React, { useState, useRef } from 'react';
import { Database, Activity, HardDrive, Server, Plus, Search, ChevronRight, ChevronDown, Bot, Send, Layers, Zap, Users, Play, Save, Trash2, Clock, Eye, Filter, Power, RotateCcw, Bell, Monitor, Copy, BookOpen, GitBranch, ArrowRight, Unplug, AlertTriangle } from 'lucide-react';
import { MOCK_MCP_TOOLS, MOCK_MODELS, MOCK_PROMPTS, MOCK_AGENTS, MOCK_AGENT_DEPLOYS, MOCK_WORKFLOWS, ADMIN_PERSONA, ADMIN_INTERNAL_TOOLS, ADMIN_AGENT_NAME_EXAMPLE, ADMIN_WORKFLOW_NAME_EXAMPLE, ADMIN_MCP_SERVERS } from '../mocks.js';
import { StatusBadge, Modal, PageShell, useToast, ConfirmDialog, ToggleSwitch } from '../common.jsx';

export const MCPToolsPage = () => {
  const toast=useToast();
  const [tools,setTools]=useState(MOCK_MCP_TOOLS.map(t=>({...t})));
  const [search,setSearch]=useState('');const [showCreate,setShowCreate]=useState(false);const [detail,setDetail]=useState(null);const [confirmDel,setConfirmDel]=useState(null);
  const [form,setForm]=useState({name:'',desc:'',dept:'AI혁신TF'});
  const filtered=tools.filter(t=>t.name.toLowerCase().includes(search.toLowerCase())||t.desc.includes(search));
  return (
    <PageShell breadcrumb={['도구','MCP 도구']}>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold">MCP 도구 목록</h2>
        <button onClick={()=>setShowCreate(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"><Plus size={16} className="mr-1"/>MCP 도구 생성</button>
      </div>
      <div className="flex items-center space-x-2 mb-4">
        <div className="relative flex-1 max-w-xs"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="도구 검색..." className="pl-9 pr-3 py-2 border rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"/><Search size={16} className="absolute left-3 top-2.5 text-gray-400"/></div>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-gray-50 text-xs text-gray-500"><tr>
          <th className="px-4 py-3 text-left">ID</th><th className="px-4 py-3 text-left">제목</th><th className="px-4 py-3 text-left">상세 설명</th><th className="px-4 py-3 text-left">제작자</th><th className="px-4 py-3 text-left">관리 그룹</th><th className="px-4 py-3 text-left">등록일시</th><th className="px-4 py-3 text-center">액션</th>
        </tr></thead><tbody className="divide-y">{filtered.map(t=>(
          <tr key={t.id} className="hover:bg-gray-50 cursor-pointer" onClick={()=>setDetail(t)}>
            <td className="px-4 py-3 text-gray-500">{t.id}</td><td className="px-4 py-3 font-medium">{t.name}</td><td className="px-4 py-3 text-gray-500">{t.desc}</td>
            <td className="px-4 py-3"><div className="font-medium">{t.creator}</div><div className="text-xs text-gray-400">admin</div></td><td className="px-4 py-3">{t.dept}</td><td className="px-4 py-3 text-xs font-mono text-gray-500">{t.date}</td>
            <td className="px-4 py-3 text-center" onClick={e=>e.stopPropagation()}>
              <button onClick={()=>setConfirmDel(t)} className="text-xs text-red-500 hover:underline">삭제</button>
            </td>
          </tr>
        ))}</tbody></table>
      </div>
      <Modal isOpen={showCreate} onClose={()=>setShowCreate(false)} title="MCP 도구 생성" size="md">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">제목</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <div><label className="block text-sm font-medium mb-1">상세 설명</label><textarea value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <div><label className="block text-sm font-medium mb-1">관리 그룹</label><input value={form.dept} onChange={e=>setForm({...form,dept:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <button onClick={()=>{if(!form.name)return;setTools(p=>[{id:p.length+1,name:form.name,desc:form.desc,creator:ADMIN_PERSONA.name,dept:form.dept,date:'2026-02-11'},...p]);setShowCreate(false);setForm({name:'',desc:'',dept:'AI혁신TF'});toast('MCP 도구가 생성되었습니다');}} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm">생성</button>
        </div>
      </Modal>
      <Modal isOpen={!!detail} onClose={()=>setDetail(null)} title={detail?.name} size="lg">
        {detail&&<div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">{[['ID',detail.id],['제작자',detail.creator],['관리 그룹',detail.dept],['등록일',detail.date]].map(([k,v],i)=>(
            <div key={i} className="bg-gray-50 p-3 rounded-lg"><div className="text-xs text-gray-400">{k}</div><div className="font-medium">{v}</div></div>
          ))}</div>
          <div className="bg-gray-50 p-4 rounded-lg"><div className="text-xs text-gray-400 mb-1">상세 설명</div><p className="text-sm">{detail.desc}</p></div>
        </div>}
      </Modal>
      <ConfirmDialog isOpen={!!confirmDel} onClose={()=>setConfirmDel(null)} onConfirm={()=>{setTools(p=>p.filter(x=>x.id!==confirmDel.id));setConfirmDel(null);toast('MCP 도구가 삭제되었습니다','info');}} title="도구 삭제" message={`'${confirmDel?.name}'을(를) 삭제하시겠습니까?`} confirmText="삭제" danger/>
    </PageShell>
  );
};

export const MCPServerPage = () => {
  const toast=useToast();
  const [servers,setServers]=useState(ADMIN_MCP_SERVERS.map(s=>({...s})));
  const [showAdd,setShowAdd]=useState(false);const [confirmAction,setConfirmAction]=useState(null);
  const [form,setForm]=useState({name:'',url:'',tools:''});
  return (
    <PageShell breadcrumb={['도구','MCP 서버']} title="MCP 서버 관리" action={<button onClick={()=>setShowAdd(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"><Plus size={16} className="mr-1"/>서버 추가</button>}>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr>
          <th className="px-4 py-3 text-left">서버명</th><th className="px-4 py-3 text-left">URL</th><th className="px-4 py-3 text-left">연결된 도구</th><th className="px-4 py-3 text-left">상태</th><th className="px-4 py-3 text-center">액션</th>
        </tr></thead><tbody className="divide-y">{servers.map(s=>(
          <tr key={s.id} className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">{s.n}</td><td className="px-4 py-3 font-mono text-xs text-gray-500">{s.u}</td><td className="px-4 py-3 text-gray-500">{s.t}</td><td className="px-4 py-3"><StatusBadge status={s.s}/></td>
            <td className="px-4 py-3 text-center space-x-2">
              <button onClick={()=>toast(`${s.n} 연결 테스트 성공`)} className="text-xs text-green-600 hover:underline">테스트</button>
              <button onClick={()=>setConfirmAction({server:s,action:'restart'})} className="text-xs text-blue-600 hover:underline">재시작</button>
              <button onClick={()=>setConfirmAction({server:s,action:'delete'})} className="text-xs text-red-500 hover:underline">삭제</button>
            </td>
          </tr>
        ))}</tbody></table>
      </div>
      <Modal isOpen={showAdd} onClose={()=>setShowAdd(false)} title="MCP 서버 추가" size="md">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">서버명</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <div><label className="block text-sm font-medium mb-1">URL</label><input value={form.url} onChange={e=>setForm({...form,url:e.target.value})} placeholder="http://..." className="w-full border rounded-lg px-3 py-2 text-sm font-mono"/></div>
          <div><label className="block text-sm font-medium mb-1">연결 도구 (쉼표 구분)</label><input value={form.tools} onChange={e=>setForm({...form,tools:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <button onClick={()=>{if(!form.name)return;setServers(p=>[...p,{id:Date.now(),n:form.name,u:form.url,t:form.tools,s:'Stopped'}]);setShowAdd(false);setForm({name:'',url:'',tools:''});toast('서버가 추가되었습니다');}} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm">추가</button>
        </div>
      </Modal>
      <ConfirmDialog isOpen={!!confirmAction} onClose={()=>setConfirmAction(null)} onConfirm={()=>{const{server,action}=confirmAction;if(action==='restart'){setServers(p=>p.map(x=>x.id===server.id?{...x,s:'Restarting'}:x));setTimeout(()=>setServers(p=>p.map(x=>x.id===server.id?{...x,s:'Running'}:x)),2000);toast(`${server.n} 재시작 중...`,'info');}else{setServers(p=>p.filter(x=>x.id!==server.id));toast('서버가 삭제되었습니다','info');}setConfirmAction(null);}} title={confirmAction?.action==='restart'?'서버 재시작':'서버 삭제'} message={`${confirmAction?.server?.n}을(를) ${confirmAction?.action==='restart'?'재시작':'삭제'}하시겠습니까?`} confirmText={confirmAction?.action==='restart'?'재시작':'삭제'} danger={confirmAction?.action==='delete'}/>
    </PageShell>
  );
};

export const PromptLibraryPage = () => {
  const toast=useToast();
  const [prompts,setPrompts]=useState(MOCK_PROMPTS.map(p=>({...p})));
  const [search,setSearch]=useState('');const [showCreate,setShowCreate]=useState(false);const [detail,setDetail]=useState(null);const [confirmDel,setConfirmDel]=useState(null);
  const [form,setForm]=useState({name:'',desc:'',content:'',dept:'AI혁신TF'});
  const filtered=prompts.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())||p.desc.includes(search));
  return (
    <PageShell breadcrumb={['도구','프롬프트 라이브러리']}>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold">프롬프트 라이브러리</h2>
        <button onClick={()=>setShowCreate(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"><Plus size={16} className="mr-1"/>프롬프트 생성</button>
      </div>
      <div className="relative max-w-sm mb-4"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="프롬프트 검색..." className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/><Search size={16} className="absolute left-3 top-2.5 text-gray-400"/></div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-gray-50 text-xs text-gray-500"><tr>
          <th className="px-4 py-3 text-left">ID</th><th className="px-4 py-3 text-left">제목</th><th className="px-4 py-3 text-left">설명</th><th className="px-4 py-3 text-left">관리 그룹</th><th className="px-4 py-3 text-left">등록일시</th><th className="px-4 py-3 text-center">액션</th>
        </tr></thead><tbody className="divide-y">{filtered.map(p=>(
          <tr key={p.id} className="hover:bg-gray-50 cursor-pointer" onClick={()=>setDetail(p)}>
            <td className="px-4 py-3 text-gray-500">{p.id}</td><td className="px-4 py-3 font-medium">{p.name}</td><td className="px-4 py-3 text-gray-500">{p.desc}</td><td className="px-4 py-3">{p.dept}</td><td className="px-4 py-3 text-xs font-mono text-gray-500">{p.date}</td>
            <td className="px-4 py-3 text-center" onClick={e=>e.stopPropagation()}>
              <button onClick={()=>setConfirmDel(p)} className="text-xs text-red-500 hover:underline">삭제</button>
            </td>
          </tr>
        ))}</tbody></table>
      </div>
      <Modal isOpen={showCreate} onClose={()=>setShowCreate(false)} title="프롬프트 생성" size="lg">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">제목</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <div><label className="block text-sm font-medium mb-1">설명</label><input value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <div><label className="block text-sm font-medium mb-1">프롬프트 내용</label><textarea value={form.content} onChange={e=>setForm({...form,content:e.target.value})} rows={5} placeholder="프롬프트 템플릿을 입력하세요..." className="w-full border rounded-lg px-3 py-2 text-sm font-mono"/></div>
          <div><label className="block text-sm font-medium mb-1">관리 그룹</label><input value={form.dept} onChange={e=>setForm({...form,dept:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <button onClick={()=>{if(!form.name)return;setPrompts(p=>[{id:p.length+1,name:form.name,desc:form.desc,dept:form.dept,date:'2026-02-11',content:form.content},...p]);setShowCreate(false);setForm({name:'',desc:'',content:'',dept:'AI혁신TF'});toast('프롬프트가 생성되었습니다');}} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm">생성</button>
        </div>
      </Modal>
      <Modal isOpen={!!detail} onClose={()=>setDetail(null)} title={detail?.name} size="lg">
        {detail&&<div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">{[['ID',detail.id],['관리 그룹',detail.dept],['등록일',detail.date],['설명',detail.desc]].map(([k,v],i)=>(
            <div key={i} className="bg-gray-50 p-3 rounded-lg"><div className="text-xs text-gray-400">{k}</div><div className="font-medium">{v}</div></div>
          ))}</div>
          {detail.content&&<div className="bg-gray-900 text-green-400 font-mono text-xs p-4 rounded-lg whitespace-pre-wrap">{detail.content}</div>}
        </div>}
      </Modal>
      <ConfirmDialog isOpen={!!confirmDel} onClose={()=>setConfirmDel(null)} onConfirm={()=>{setPrompts(p=>p.filter(x=>x.id!==confirmDel.id));setConfirmDel(null);toast('프롬프트가 삭제되었습니다','info');}} title="프롬프트 삭제" message={`'${confirmDel?.name}'을(를) 삭제하시겠습니까?`} confirmText="삭제" danger/>
    </PageShell>
  );
};

export const ServingPage = () => {
  const toast=useToast();
  const [endpoints,setEndpoints]=useState([
    {id:1,e:'api-gpt-oss-prod',m:'GPT-OSS-120B',q:120,t:4500,l:'240ms',s:'Healthy',replicas:4},
    {id:2,e:'api-llama3-prod',m:'Llama-3-Kor',q:45,t:1800,l:'120ms',s:'Healthy',replicas:2},
    {id:3,e:'api-exaone-dev',m:'EXAONE-3.0',q:15,t:600,l:'180ms',s:'Healthy',replicas:1},
    {id:4,e:'api-solar-batch',m:'Solar-10.7B',q:80,t:3200,l:'95ms',s:'Healthy',replicas:2},
  ]);
  const [detail,setDetail]=useState(null);const [scaleEp,setScaleEp]=useState(null);const [confirmRestart,setConfirmRestart]=useState(null);
  const [newReplicas,setNewReplicas]=useState(1);
  return (
    <PageShell breadcrumb={['서빙']} title="모델 서빙 상태">
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr>
          <th className="px-4 py-3 text-left">엔드포인트</th><th className="px-4 py-3 text-left">모델</th><th className="px-4 py-3 text-right">QPS</th><th className="px-4 py-3 text-right">Tokens/s</th><th className="px-4 py-3 text-right">지연시간</th><th className="px-4 py-3 text-center">레플리카</th><th className="px-4 py-3 text-left">상태</th><th className="px-4 py-3 text-center">액션</th>
        </tr></thead><tbody className="divide-y">{endpoints.map(r=>(
          <tr key={r.id} className="hover:bg-gray-50 cursor-pointer" onClick={()=>setDetail(r)}>
            <td className="px-4 py-3 font-bold">{r.e}</td><td className="px-4 py-3">{r.m}</td><td className="px-4 py-3 text-right">{r.q}</td><td className="px-4 py-3 text-right">{r.t.toLocaleString()}</td><td className="px-4 py-3 text-right">{r.l}</td><td className="px-4 py-3 text-center font-medium">{r.replicas}</td><td className="px-4 py-3"><StatusBadge status={r.s}/></td>
            <td className="px-4 py-3 text-center space-x-2" onClick={e=>e.stopPropagation()}>
              <button onClick={()=>{setScaleEp(r);setNewReplicas(r.replicas);}} className="text-xs text-blue-600 hover:underline">스케일</button>
              <button onClick={()=>setConfirmRestart(r)} className="text-xs text-orange-600 hover:underline">재시작</button>
            </td>
          </tr>
        ))}</tbody></table>
      </div>
      <Modal isOpen={!!detail} onClose={()=>setDetail(null)} title={detail?.e} size="lg">
        {detail&&<div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">{[['모델',detail.m],['QPS',detail.q],['Tokens/s',detail.t.toLocaleString()],['지연시간',detail.l],['레플리카',detail.replicas],['상태',detail.s]].map(([k,v],i)=>(
            <div key={i} className="bg-gray-50 p-3 rounded-lg"><div className="text-xs text-gray-400">{k}</div><div className="font-medium">{v}</div></div>
          ))}</div>
        </div>}
      </Modal>
      <Modal isOpen={!!scaleEp} onClose={()=>setScaleEp(null)} title={`${scaleEp?.e} 스케일 조정`} size="sm">
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-4">
            <button onClick={()=>setNewReplicas(Math.max(1,newReplicas-1))} className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-lg font-bold">-</button>
            <span className="text-3xl font-bold w-12 text-center">{newReplicas}</span>
            <button onClick={()=>setNewReplicas(newReplicas+1)} className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-lg font-bold">+</button>
          </div>
          <button onClick={()=>{setEndpoints(p=>p.map(x=>x.id===scaleEp.id?{...x,replicas:newReplicas}:x));setScaleEp(null);toast(`${scaleEp?.e} 레플리카가 ${newReplicas}개로 조정되었습니다`);}} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm">적용</button>
        </div>
      </Modal>
      <ConfirmDialog isOpen={!!confirmRestart} onClose={()=>setConfirmRestart(null)} onConfirm={()=>{setEndpoints(p=>p.map(x=>x.id===confirmRestart.id?{...x,s:'Restarting'}:x));setTimeout(()=>setEndpoints(p=>p.map(x=>x.id===confirmRestart.id?{...x,s:'Healthy'}:x)),2000);setConfirmRestart(null);toast(`${confirmRestart?.e} 재시작 중...`,'info');}} title="엔드포인트 재시작" message={`${confirmRestart?.e}을(를) 재시작하시겠습니까?`} confirmText="재시작"/>
    </PageShell>
  );
};

// ==================== TOAST & CONFIRM ====================
export const TaskflowBuilderPage = () => {
  const toast=useToast();
  const [agents,setAgents]=useState(MOCK_AGENTS);
  const [selected,setSelected]=useState(null);
  const [tab,setTab]=useState('config');
  const [search,setSearch]=useState('');
  const [filterModel,setFilterModel]=useState('all');
  const [filterStatus,setFilterStatus]=useState('all');
  const [chatMsgs,setChatMsgs]=useState([{role:'assistant',text:'안녕하세요! 에이전트 테스트 모드입니다. 질문을 입력해 주세요.'}]);
  const [chatInput,setChatInput]=useState('');
  const [showCreateModal,setShowCreateModal]=useState(false);
  const [showDeleteConfirm,setShowDeleteConfirm]=useState(false);
  const [showDeployConfirm,setShowDeployConfirm]=useState(false);
  const [showRollbackConfirm,setShowRollbackConfirm]=useState(null);
  const [editForm,setEditForm]=useState({});
  const [newAgent,setNewAgent]=useState({name:'',desc:'',model:'GPT-OSS-120B',responseMode:'knowledge',systemPrompt:'',temperature:0.3,maxTokens:2048});
  const [hitlThreshold,setHitlThreshold]=useState(80);
  const chatEndRef=useRef(null);
  const filtered=agents.filter(a=>{
    if(search&&!a.name.includes(search)&&!a.desc.includes(search))return false;
    if(filterModel!=='all'&&a.model!==filterModel)return false;
    if(filterStatus!=='all'&&a.status!==filterStatus)return false;
    return true;
  });
  const selectAgent=(a)=>{setSelected({...a});setEditForm({name:a.name,desc:a.desc,systemPrompt:a.systemPrompt,model:a.model,temperature:a.temperature,maxTokens:a.maxTokens,responseMode:a.responseMode,mcpTools:[...a.mcpTools],ragEnabled:a.ragEnabled,hitl:a.hitl,a2a:a.a2a,actionable:a.actionable});setTab('config');setChatMsgs([{role:'assistant',text:'안녕하세요! 에이전트 테스트 모드입니다. 질문을 입력해 주세요.'}]);};
  const handleSave=()=>{setAgents(p=>p.map(a=>a.id===selected.id?{...a,...editForm,updated:new Date().toISOString().slice(0,10)}:a));setSelected(p=>({...p,...editForm}));toast('에이전트 설정이 저장되었습니다.');};
  const handleDelete=()=>{setAgents(p=>p.filter(a=>a.id!==selected.id));setSelected(null);setTab('config');toast('에이전트가 삭제되었습니다.','warning');};
  const toggleMcp=(name)=>{setEditForm(p=>{const has=p.mcpTools.includes(name);return{...p,mcpTools:has?p.mcpTools.filter(t=>t!==name):[...p.mcpTools,name]};});};
  const toggleField=(field)=>{setEditForm(p=>({...p,[field]:!p[field]}));};
  const handleCreate=()=>{if(!newAgent.name.trim()){toast('에이전트 이름을 입력하세요.','error');return;}const id='AGT-'+(agents.length+1).toString().padStart(3,'0');const now=new Date().toISOString().slice(0,10);const a={id,name:newAgent.name,desc:newAgent.desc,model:newAgent.model,tools:[],mcpTools:[],ragEnabled:false,hitl:false,a2a:false,responseMode:newAgent.responseMode,actionable:false,status:'Stopped',version:'v1.0',creator:ADMIN_PERSONA.name,dept:ADMIN_PERSONA.dept,created:now,updated:now,requests24h:0,avgLatency:'-',successRate:0,confidence:0,systemPrompt:newAgent.systemPrompt,temperature:newAgent.temperature,maxTokens:newAgent.maxTokens};setAgents(p=>[...p,a]);setShowCreateModal(false);setNewAgent({name:'',desc:'',model:'GPT-OSS-120B',responseMode:'knowledge',systemPrompt:'',temperature:0.3,maxTokens:2048});toast(`'${a.name}' 에이전트가 생성되었습니다.`);};
  const toggleAgentStatus=(id)=>{setAgents(p=>p.map(a=>a.id===id?{...a,status:a.status==='Running'?'Stopped':'Running'}:a));toast('에이전트 상태가 변경되었습니다.','info');};
  const sendChat=()=>{if(!chatInput.trim())return;const msg=chatInput;setChatMsgs(p=>[...p,{role:'user',text:msg}]);setChatInput('');setTimeout(()=>{const ef=editForm;setChatMsgs(p=>[...p,{role:'assistant',text:`[${ef.name||selected.name}] "${msg}"에 대해 ${ef.responseMode==='knowledge'?'사내 지식 DB를 참조하여':'LLM 직접 응답으로'} 답변드리겠습니다.\n\n${ef.mcpTools?.length>0?`MCP 도구 (${ef.mcpTools.join(', ')})를 활용하여 `:''}처리되었습니다.${ef.hitl?'\n\n⚠️ HITL 모드: 전문가 검토 후 최종 응답이 제공됩니다.':''}\n\n신뢰도: ${(selected.confidence*100).toFixed(0)}% | 응답 모드: ${ef.responseMode==='knowledge'?'지식 참조':'직접 응답'}`}]);setTimeout(()=>chatEndRef.current?.scrollIntoView({behavior:'smooth'}),50);},800);};
  const models=[...new Set(agents.map(a=>a.model))];
  const versionHistory=[{ver:'v2.1',change:'MCP 도구 연동 및 HITL 워크플로우 추가',author:'김세은',date:'2026-02-08'},{ver:'v2.0',change:'GPT-OSS-120B 모델로 전환, A2A 프로토콜 활성화',author:'김세은',date:'2026-01-20'},{ver:'v1.5',change:'RAG 파이프라인 연동 및 신뢰도 임계값 설정',author:'이준호',date:'2026-01-05'},{ver:'v1.0',change:'최초 에이전트 생성 (노코드 빌더)',author:'김세은',date:'2025-12-15'}];

  if(selected) return (
    <PageShell breadcrumb={['에이전트','태스크플로우','빌더',selected.name]}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <button onClick={()=>{setSelected(null);setTab('config');}} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight size={18} className="rotate-180 text-gray-500"/></button>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${editForm.actionable?'bg-gradient-to-br from-purple-600 to-blue-600':'bg-blue-600'}`}><Bot size={20} className="text-white"/></div>
          <div><h2 className="text-lg font-bold">{editForm.name||selected.name}</h2>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="text-xs text-gray-500">{selected.id} · {selected.version}</span>
              {editForm.hitl&&<span className="bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded text-[10px] font-bold">HITL</span>}
              {editForm.a2a&&<span className="bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded text-[10px] font-bold">A2A</span>}
              {editForm.actionable&&<span className="bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 px-1.5 py-0.5 rounded text-[10px] font-bold">Actionable AI</span>}
            </div>
          </div>
          <StatusBadge status={selected.status}/>
        </div>
        <div className="flex space-x-2">
          <button onClick={()=>setShowDeleteConfirm(true)} className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 flex items-center space-x-1.5"><Trash2 size={15}/><span>삭제</span></button>
          <button onClick={handleSave} className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center space-x-1.5"><Save size={15}/><span>저장</span></button>
          <button onClick={()=>setShowDeployConfirm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center space-x-1.5"><Play size={15}/><span>배포</span></button>
        </div>
      </div>
      <ConfirmDialog isOpen={showDeleteConfirm} onClose={()=>setShowDeleteConfirm(false)} onConfirm={handleDelete} title="에이전트 삭제" message={`'${selected.name}' 에이전트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`} confirmText="삭제" danger/>
      <ConfirmDialog isOpen={showDeployConfirm} onClose={()=>setShowDeployConfirm(false)} onConfirm={()=>{handleSave();toast('에이전트가 배포 대기열에 추가되었습니다.','info');}} title="에이전트 배포" message={`'${editForm.name||selected.name}' 에이전트를 Production 환경에 배포하시겠습니까?`} confirmText="배포"/>
      <ConfirmDialog isOpen={showRollbackConfirm!==null} onClose={()=>setShowRollbackConfirm(null)} onConfirm={()=>{toast(`${versionHistory[showRollbackConfirm]?.ver} 버전으로 롤백되었습니다.`,'info');}} title="버전 롤백" message={`${versionHistory[showRollbackConfirm]?.ver} 버전으로 롤백하시겠습니까?`} confirmText="롤백" danger/>
      <div className="flex space-x-1 mb-6 border-b">
        {[['config','설정'],['tools','MCP 도구 & RAG'],['protocol','프로토콜'],['test','테스트'],['history','이력']].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab===k?'border-blue-600 text-blue-600':'border-transparent text-gray-500 hover:text-gray-800'}`}>{l}</button>
        ))}
      </div>

      {tab==='config'&&<div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-5">
          <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-gray-800">기본 정보</h3>
            <div><label className="block text-xs font-medium text-gray-500 mb-1.5">에이전트 이름</label><input value={editForm.name||''} onChange={e=>setEditForm(p=>({...p,name:e.target.value}))} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/></div>
            <div><label className="block text-xs font-medium text-gray-500 mb-1.5">설명</label><input value={editForm.desc||''} onChange={e=>setEditForm(p=>({...p,desc:e.target.value}))} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/></div>
            <div><label className="block text-xs font-medium text-gray-500 mb-1.5">시스템 프롬프트</label><textarea value={editForm.systemPrompt||''} onChange={e=>setEditForm(p=>({...p,systemPrompt:e.target.value}))} className="w-full h-28 px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm font-mono bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"/></div>
          </div>
          <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-gray-800">모델 설정</h3>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-xs font-medium text-gray-500 mb-1.5">모델</label><select value={editForm.model||''} onChange={e=>setEditForm(p=>({...p,model:e.target.value}))} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-white">{MOCK_MODELS.map(m=><option key={m.id} value={m.name}>{m.name}</option>)}</select></div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1.5">Temperature</label><input type="number" value={editForm.temperature??0.3} onChange={e=>setEditForm(p=>({...p,temperature:parseFloat(e.target.value)||0}))} step="0.1" min="0" max="1" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm"/></div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1.5">Max Tokens</label><input type="number" value={editForm.maxTokens||2048} onChange={e=>setEditForm(p=>({...p,maxTokens:parseInt(e.target.value)||2048}))} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm"/></div>
            </div>
          </div>
          <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-gray-800">응답 모드</h3>
            <div className="grid grid-cols-2 gap-3">
              <div onClick={()=>setEditForm(p=>({...p,responseMode:'knowledge'}))} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${editForm.responseMode==='knowledge'?'border-blue-500 bg-blue-50/50':'border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center space-x-2 mb-2"><BookOpen size={18} className={editForm.responseMode==='knowledge'?'text-blue-600':'text-gray-400'}/><span className="font-bold text-sm">지식 참조 모드</span></div>
                <p className="text-xs text-gray-500">RAG 파이프라인을 통한 사내 문서 기반 응답. 규정·매뉴얼 등 정확한 참조가 필요한 업무에 적합.</p>
              </div>
              <div onClick={()=>setEditForm(p=>({...p,responseMode:'direct'}))} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${editForm.responseMode==='direct'?'border-blue-500 bg-blue-50/50':'border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center space-x-2 mb-2"><Zap size={18} className={editForm.responseMode==='direct'?'text-blue-600':'text-gray-400'}/><span className="font-bold text-sm">직접 응답 모드</span></div>
                <p className="text-xs text-gray-500">LLM 자체 지식으로 즉각 응답. 일반 질의, 번역, 요약 등 창의적 업무에 적합.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-5">
          <div className="bg-white rounded-xl border p-5 shadow-sm">
            <h3 className="font-bold text-sm text-gray-800 mb-4">에이전트 정보</h3>
            <div className="space-y-3 text-sm">{[['ID',selected.id],['생성자',selected.creator],['부서',selected.dept],['생성일',selected.created],['수정일',selected.updated]].map(([k,v],i)=>(
              <div key={i} className="flex justify-between"><span className="text-gray-400">{k}</span><span className="font-medium">{v}</span></div>
            ))}</div>
          </div>
          <div className="bg-white rounded-xl border p-5 shadow-sm">
            <h3 className="font-bold text-sm text-gray-800 mb-4">실시간 지표</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 text-center"><div className="text-2xl font-bold text-blue-700">{selected.requests24h}</div><div className="text-xs text-blue-500">24h 요청 수</div></div>
              <div className="bg-green-50 rounded-lg p-3 text-center"><div className="text-2xl font-bold text-green-700">{selected.avgLatency}</div><div className="text-xs text-green-500">평균 응답시간</div></div>
              <div className="bg-purple-50 rounded-lg p-3 text-center"><div className="text-2xl font-bold text-purple-700">{selected.successRate}%</div><div className="text-xs text-purple-500">성공률</div></div>
              <div className={`rounded-lg p-3 text-center ${selected.confidence>=0.9?'bg-green-50':selected.confidence>=0.7?'bg-yellow-50':'bg-red-50'}`}><div className={`text-2xl font-bold ${selected.confidence>=0.9?'text-green-700':selected.confidence>=0.7?'text-yellow-700':'text-red-700'}`}>{(selected.confidence*100).toFixed(0)}%</div><div className="text-xs text-gray-500">신뢰도</div></div>
            </div>
          </div>
        </div>
      </div>}

      {tab==='tools'&&<div className="grid grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <h3 className="font-bold text-sm mb-4 flex items-center"><Unplug size={16} className="mr-1.5 text-purple-600"/>MCP 도구 연결</h3>
            <p className="text-xs text-gray-500 mb-4">Model Context Protocol을 통해 외부 시스템 및 도구를 표준화된 방식으로 연동합니다.</p>
            <div className="space-y-2.5">
              {[{name:'MCP-Search',desc:'벡터 DB 시맨틱 검색'},{name:'MCP-WebSearch',desc:'외부 웹 검색 엔진'},{name:'MCP-WebCrawler',desc:'웹 페이지 크롤링'},{name:'MCP-RTMS',desc:'IoT 센서 실시간 데이터'},{name:'MCP-ERPConnector',desc:'ERP 시스템 연동 (SAP/Oracle)'},{name:'MCP-GWSync',desc:'그룹웨어 일정/문서 동기화'},{name:'MCP-CodeDev',desc:'코드 생성 및 실행'},{name:'MCP-DynamicFilter',desc:'동적 데이터 필터링'}].map((t,i)=>{const active=editForm.mcpTools?.includes(t.name);return(
                <div key={i} className={`flex items-center justify-between px-3.5 py-3 rounded-lg border transition-all ${active?'border-purple-200 bg-purple-50/50':'border-gray-200'}`}>
                  <div className="flex items-center space-x-2"><Unplug size={14} className={active?'text-purple-600':'text-gray-400'}/><div><div className="text-sm font-medium">{t.name}</div><div className="text-xs text-gray-400">{t.desc}</div></div></div>
                  <ToggleSwitch on={active} onClick={()=>toggleMcp(t.name)}/>
                </div>
              );})}
            </div>
            <button onClick={()=>toast('MCP 서버 마켓플레이스에서 도구를 추가합니다.','info')} className="mt-4 w-full py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-purple-400 hover:text-purple-600 flex items-center justify-center space-x-1"><Plus size={15}/><span>MCP 서버에서 추가</span></button>
          </div>
        </div>
        <div className="space-y-5">
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <h3 className="font-bold text-sm mb-4 flex items-center"><Database size={16} className="mr-1.5 text-blue-600"/>내부 도구 연결</h3>
            <div className="space-y-2.5">
              {ADMIN_INTERNAL_TOOLS.map((d,i)=>({...d,icon:[Database,HardDrive,Bell][i]||Database,active:i===0?true:selected.tools.includes(d.name)})).map((t,i)=>(
                <div key={i} className={`flex items-center justify-between px-3.5 py-3 rounded-lg border ${t.active?'border-blue-200 bg-blue-50/50':'border-gray-200'}`}>
                  <div className="flex items-center space-x-2"><t.icon size={14} className={t.active?'text-blue-600':'text-gray-400'}/><div><div className="text-sm font-medium">{t.name}</div><div className="text-xs text-gray-400">{t.desc}</div></div></div>
                  <ToggleSwitch on={t.active} onClick={()=>toast(`${t.name} 도구 ${t.active?'비활성화':'활성화'}됨`,'info')}/>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-sm flex items-center"><BookOpen size={16} className="mr-1.5 text-green-600"/>RAG 설정</h3><ToggleSwitch on={editForm.ragEnabled} onClick={()=>toggleField('ragEnabled')}/></div>
            {editForm.ragEnabled&&<div className="space-y-4">
              <div><label className="block text-xs font-medium text-gray-500 mb-1.5">벡터 DB 컬렉션</label><select className="w-full px-3.5 py-2.5 border rounded-lg text-sm bg-white"><option>safety_regulations_v2</option><option>maintenance_manuals</option><option>hr_policies</option></select></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-xs text-gray-500">Chunk Size</label><input type="number" defaultValue={512} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"/></div>
                <div><label className="text-xs text-gray-500">Top-K</label><input type="number" defaultValue={5} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"/></div>
                <div><label className="text-xs text-gray-500">유사도</label><input type="number" defaultValue={0.75} step="0.05" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"/></div>
              </div>
            </div>}
            {!editForm.ragEnabled&&<p className="text-xs text-gray-400">RAG를 활성화하면 벡터 DB 기반의 사내 문서 검색이 가능합니다.</p>}
          </div>
        </div>
      </div>}

      {tab==='protocol'&&<div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h3 className="font-bold text-sm mb-2 flex items-center"><Users size={16} className="mr-1.5 text-orange-500"/>HITL (Human-in-the-Loop)</h3>
          <p className="text-xs text-gray-500 mb-4">신뢰도가 낮거나 중요 결정이 필요한 응답에 대해 전문가 검토를 요청합니다.</p>
          <div className="flex items-center justify-between p-4 rounded-xl bg-orange-50/50 border border-orange-200 mb-4">
            <div><span className="font-bold text-sm">HITL 모드 활성화</span><p className="text-xs text-gray-500 mt-0.5">전문가 승인 후 응답 제공</p></div>
            <ToggleSwitch on={editForm.hitl} onClick={()=>toggleField('hitl')}/>
          </div>
          {editForm.hitl&&<div className="space-y-3 pl-4 border-l-2 border-orange-300">
            <div><label className="text-xs text-gray-500">검토 요청 임계값 (신뢰도)</label><div className="flex items-center space-x-2 mt-1"><input type="range" min="50" max="95" value={hitlThreshold} onChange={e=>setHitlThreshold(+e.target.value)} className="flex-1"/><span className="text-sm font-bold text-orange-600">{hitlThreshold}%</span></div></div>
            <div><label className="text-xs text-gray-500">검토자 지정</label><select className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white"><option>부서 관리자 자동 배정</option><option>지정 전문가 그룹</option></select></div>
            <div><label className="text-xs text-gray-500">검토 SLA</label><select className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white"><option>30분 이내</option><option>1시간 이내</option><option>4시간 이내</option></select></div>
          </div>}
        </div>
        <div className="space-y-5">
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <h3 className="font-bold text-sm mb-2 flex items-center"><GitBranch size={16} className="mr-1.5 text-purple-600"/>A2A (Agent-to-Agent)</h3>
            <p className="text-xs text-gray-500 mb-4">다른 에이전트와 협업하여 복잡한 태스크를 수행합니다.</p>
            <div className="flex items-center justify-between p-4 rounded-xl bg-purple-50/50 border border-purple-200 mb-4">
              <div><span className="font-bold text-sm">A2A 프로토콜 활성화</span><p className="text-xs text-gray-500 mt-0.5">에이전트 간 협업 통신 허용</p></div>
              <ToggleSwitch on={editForm.a2a} onClick={()=>toggleField('a2a')}/>
            </div>
            {editForm.a2a&&<div className="space-y-2">
              <div className="text-xs text-gray-500 mb-2">연결 가능한 에이전트:</div>
              {agents.filter(a=>a.id!==selected.id&&a.a2a).map(a=>(
                <div key={a.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 border">
                  <div className="flex items-center space-x-2"><Bot size={14} className="text-purple-500"/><span className="text-sm">{a.name}</span></div>
                  <StatusBadge status={a.status}/>
                </div>
              ))}
            </div>}
          </div>
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <h3 className="font-bold text-sm mb-2 flex items-center"><Monitor size={16} className="mr-1.5 text-blue-600"/>Actionable AI</h3>
            <p className="text-xs text-gray-500 mb-4">실제 컴퓨터/브라우저 환경에서 업무를 직접 수행하는 실행형 AI 에이전트.</p>
            <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50/50 border border-blue-200">
              <div><span className="font-bold text-sm">Actionable AI 모드</span><p className="text-xs text-gray-500 mt-0.5">ERP, 그룹웨어 등 업무 자동 수행</p></div>
              <ToggleSwitch on={editForm.actionable} onClick={()=>toggleField('actionable')}/>
            </div>
          </div>
        </div>
      </div>}

      {tab==='test'&&<div className="bg-white rounded-xl border shadow-sm flex flex-col" style={{height:'calc(100vh - 280px)'}}>
        <div className="px-5 py-3 border-b bg-gray-50/80 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center space-x-2 text-sm"><Bot size={16} className="text-blue-600"/><span className="font-medium">{editForm.name||selected.name}</span></div>
          <div className="flex items-center space-x-2 text-xs">
            <span className={`px-2 py-0.5 rounded ${editForm.responseMode==='knowledge'?'bg-green-50 text-green-700':'bg-blue-50 text-blue-700'}`}>{editForm.responseMode==='knowledge'?'지식 참조':'직접 응답'}</span>
            {editForm.hitl&&<span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded">HITL</span>}
            <span className="text-gray-400">{editForm.model} T={editForm.temperature}</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {chatMsgs.map((m,i)=><div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}><div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${m.role==='user'?'bg-blue-600 text-white rounded-br-md':'bg-gray-100 text-gray-800 rounded-bl-md'}`}>{m.text}</div></div>)}
          <div ref={chatEndRef}/>
        </div>
        <div className="p-4 border-t bg-white rounded-b-xl">
          <div className="flex space-x-2"><input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendChat()} placeholder="테스트 메시지를 입력하세요..." className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"/><button onClick={sendChat} className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700"><Send size={16}/></button></div>
          <div className="flex items-center space-x-3 mt-2 text-[10px] text-gray-400"><AlertTriangle size={10}/><span>테스트 환경에서의 응답입니다. 실제 운영 환경과 다를 수 있습니다.</span></div>
        </div>
      </div>}

      {tab==='history'&&<div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-gray-50/80"><tr>
          <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">버전</th><th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">변경 내용</th><th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">작성자</th><th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">날짜</th><th className="px-5 py-3.5 text-center text-xs font-medium text-gray-500">롤백</th>
        </tr></thead><tbody className="divide-y divide-gray-100">{versionHistory.map((v,i)=>(
          <tr key={i} className="hover:bg-gray-50"><td className="px-5 py-3.5"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-xs font-bold">{v.ver}</span></td><td className="px-5 py-3.5 text-gray-700">{v.change}</td><td className="px-5 py-3.5 text-gray-500">{v.author}</td><td className="px-5 py-3.5 text-gray-400">{v.date}</td><td className="px-5 py-3.5 text-center">{i>0&&<button onClick={()=>setShowRollbackConfirm(i)} className="px-2.5 py-1 text-xs border rounded hover:bg-gray-50 text-gray-500"><RotateCcw size={10} className="inline mr-1"/>롤백</button>}</td></tr>
        ))}</tbody></table>
      </div>}
    </PageShell>
  );

  return (
    <PageShell breadcrumb={['에이전트','태스크플로우','빌더']} title="에이전트 빌더 (노코드)" action={<button onClick={()=>setShowCreateModal(true)} className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center shadow-sm hover:bg-blue-700"><Plus size={16} className="mr-1.5"/>새 에이전트 생성</button>}>
      <div className="flex items-center space-x-3 mb-5">
        <div className="relative flex-1 max-w-sm"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="에이전트 검색..." className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"/><Search size={16} className="absolute left-3 top-3 text-gray-400"/></div>
        <select value={filterModel} onChange={e=>setFilterModel(e.target.value)} className="px-3 py-2.5 border rounded-lg text-sm bg-white"><option value="all">전체 모델</option>{models.map(m=><option key={m} value={m}>{m}</option>)}</select>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="px-3 py-2.5 border rounded-lg text-sm bg-white"><option value="all">전체 상태</option><option value="Running">Running</option><option value="Stopped">Stopped</option></select>
      </div>
      <div className="grid grid-cols-3 gap-5">{filtered.map(a=>(
        <div key={a.id} className="bg-white rounded-xl border border-gray-200/80 shadow-sm hover:shadow-md hover:border-blue-300 cursor-pointer transition-all p-5 group">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2.5" onClick={()=>selectAgent(a)}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform ${a.actionable?'bg-gradient-to-br from-purple-100 to-blue-100':'bg-blue-50'}`}><Bot size={18} className={a.actionable?'text-purple-600':'text-blue-600'}/></div>
              <div><div className="font-bold text-sm">{a.name}</div><span className="text-xs text-gray-400">{a.id}</span></div>
            </div>
            <div className="flex items-center space-x-2">
              <StatusBadge status={a.status}/>
              <button onClick={e=>{e.stopPropagation();toggleAgentStatus(a.id);}} className="p-1 hover:bg-gray-100 rounded" title={a.status==='Running'?'중지':'시작'}><Power size={13} className={a.status==='Running'?'text-green-500':'text-gray-400'}/></button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed" onClick={()=>selectAgent(a)}>{a.desc}</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-xs">{a.model}</span>
            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md text-xs font-medium">{a.version}</span>
            {a.ragEnabled&&<span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-md text-xs">RAG</span>}
            {a.hitl&&<span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded-md text-xs">HITL</span>}
            {a.a2a&&<span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md text-xs">A2A</span>}
            {a.actionable&&<span className="bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 px-2 py-0.5 rounded-md text-xs">Actionable</span>}
          </div>
          {a.mcpTools.length>0&&<div className="flex items-center space-x-1 mb-3 text-[10px] text-purple-500"><Unplug size={10}/><span>MCP: {a.mcpTools.join(', ')}</span></div>}
          <div className="border-t pt-3 flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center space-x-3">
              <span className="flex items-center"><Activity size={12} className="mr-1"/>{a.requests24h}/day</span>
              <span className="flex items-center"><Clock size={12} className="mr-1"/>{a.avgLatency}</span>
            </div>
            <span className={`font-bold ${a.confidence>=0.9?'text-green-600':a.confidence>=0.7?'text-yellow-600':'text-red-500'}`}>{(a.confidence*100).toFixed(0)}%</span>
          </div>
          <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs">
            <span className="text-gray-400">{a.creator} · {a.dept}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] ${a.responseMode==='knowledge'?'bg-green-50 text-green-600':'bg-blue-50 text-blue-600'}`}>{a.responseMode==='knowledge'?'지식 참조':'직접 응답'}</span>
          </div>
        </div>
      ))}</div>
      {filtered.length===0&&<div className="text-center py-16 text-gray-400"><Bot size={40} className="mx-auto mb-3 text-gray-300"/><p className="text-sm">검색 조건에 맞는 에이전트가 없습니다.</p></div>}
      <Modal isOpen={showCreateModal} onClose={()=>setShowCreateModal(false)} title="새 에이전트 생성" size="md">
        <div className="space-y-4">
          <div><label className="text-sm font-bold">에이전트 이름 *</label><input value={newAgent.name} onChange={e=>setNewAgent(p=>({...p,name:e.target.value}))} placeholder={'예: '+ADMIN_AGENT_NAME_EXAMPLE} className="w-full mt-1 px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"/></div>
          <div><label className="text-sm font-bold">설명</label><input value={newAgent.desc} onChange={e=>setNewAgent(p=>({...p,desc:e.target.value}))} placeholder="에이전트 역할을 간략히 설명하세요" className="w-full mt-1 px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-bold">모델</label><select value={newAgent.model} onChange={e=>setNewAgent(p=>({...p,model:e.target.value}))} className="w-full mt-1 px-3.5 py-2.5 border rounded-lg text-sm bg-white">{MOCK_MODELS.map(m=><option key={m.id} value={m.name}>{m.name}</option>)}</select></div>
            <div><label className="text-sm font-bold">응답 모드</label><select value={newAgent.responseMode} onChange={e=>setNewAgent(p=>({...p,responseMode:e.target.value}))} className="w-full mt-1 px-3.5 py-2.5 border rounded-lg text-sm bg-white"><option value="knowledge">지식 참조</option><option value="direct">직접 응답</option></select></div>
          </div>
          <div><label className="text-sm font-bold">시스템 프롬프트</label><textarea value={newAgent.systemPrompt} onChange={e=>setNewAgent(p=>({...p,systemPrompt:e.target.value}))} placeholder="에이전트의 역할과 행동 지침을 정의하세요..." className="w-full mt-1 h-24 px-3.5 py-2.5 border rounded-lg text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-bold">Temperature</label><input type="number" value={newAgent.temperature} onChange={e=>setNewAgent(p=>({...p,temperature:parseFloat(e.target.value)||0}))} step="0.1" min="0" max="1" className="w-full mt-1 px-3.5 py-2.5 border rounded-lg text-sm"/></div>
            <div><label className="text-sm font-bold">Max Tokens</label><input type="number" value={newAgent.maxTokens} onChange={e=>setNewAgent(p=>({...p,maxTokens:parseInt(e.target.value)||2048}))} className="w-full mt-1 px-3.5 py-2.5 border rounded-lg text-sm"/></div>
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
          <button onClick={()=>setShowCreateModal(false)} className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50">취소</button>
          <button onClick={handleCreate} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">생성</button>
        </div>
      </Modal>
    </PageShell>
  );
};

export const TaskflowDeployPage = () => {
  const toast=useToast();
  const [deploys,setDeploys]=useState(MOCK_AGENT_DEPLOYS);
  const [selDep,setSelDep]=useState(null);
  const [showCreateModal,setShowCreateModal]=useState(false);
  const [showScaleModal,setShowScaleModal]=useState(false);
  const [scaleReplicas,setScaleReplicas]=useState(1);
  const [showStopConfirm,setShowStopConfirm]=useState(false);
  const [showRedeployConfirm,setShowRedeployConfirm]=useState(false);
  const [newDeploy,setNewDeploy]=useState({agentName:ADMIN_AGENT_NAME_EXAMPLE,env:'Production',replicas:2,cpu:'2 Core',memory:'8 GB',gpu:'-'});
  const running=deploys.filter(d=>d.status==='Running').length;
  const totalReq=deploys.reduce((s,d)=>s+d.requests24h,0);
  const avgErr=running?(deploys.filter(d=>d.status==='Running').reduce((s,d)=>s+d.errorRate,0)/running).toFixed(1):'0';
  const handleStopStart=()=>{const newSt=selDep.status==='Running'?'Stopped':'Running';setDeploys(p=>p.map(d=>d.id===selDep.id?{...d,status:newSt,replicas:newSt==='Stopped'?0:d.replicas||2}:d));setSelDep(p=>({...p,status:newSt,replicas:newSt==='Stopped'?0:p.replicas||2}));toast(`배포가 ${newSt==='Running'?'시작':'중지'}되었습니다.`,newSt==='Running'?'success':'warning');};
  const handleRedeploy=()=>{const now=new Date();const dateStr=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;setDeploys(p=>p.map(d=>d.id===selDep.id?{...d,status:'Restarting',deployDate:dateStr}:d));setSelDep(p=>({...p,status:'Restarting',deployDate:dateStr}));toast('재배포 시작됨...','info');setTimeout(()=>{setDeploys(p=>p.map(d=>d.id===selDep.id?{...d,status:'Running'}:d));setSelDep(p=>p?{...p,status:'Running'}:p);toast('재배포가 완료되었습니다.');},2000);};
  const handleScale=()=>{setDeploys(p=>p.map(d=>d.id===selDep.id?{...d,replicas:scaleReplicas}:d));setSelDep(p=>({...p,replicas:scaleReplicas}));setShowScaleModal(false);toast(`Replicas가 ${scaleReplicas}개로 조정되었습니다.`);};
  const copyEndpoint=()=>{navigator.clipboard?.writeText(selDep.endpoint).catch(()=>{});toast('엔드포인트가 클립보드에 복사되었습니다.');};
  const handleCreateDeploy=()=>{const id='DEP-'+(deploys.length+1).toString().padStart(3,'0');const now=new Date();const dateStr=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;const d={id,agentId:'AGT-NEW',agentName:newDeploy.agentName,model:'GPT-OSS-120B',version:'v1.0',env:newDeploy.env,endpoint:`/api/agent/${id.toLowerCase()}`,deployDate:dateStr,deployer:ADMIN_PERSONA.name,status:'Running',replicas:newDeploy.replicas,cpu:newDeploy.cpu,memory:newDeploy.memory,gpu:newDeploy.gpu,uptime:'0h',requests24h:0,errorRate:0};setDeploys(p=>[...p,d]);setShowCreateModal(false);toast(`'${d.agentName}' 배포가 생성되었습니다.`);};
  return (
    <PageShell breadcrumb={['에이전트','태스크플로우','배포']} title="배포 관리" action={<button onClick={()=>setShowCreateModal(true)} className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center shadow-sm hover:bg-blue-700"><Plus size={16} className="mr-1.5"/>새 배포</button>}>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[{label:'총 배포 수',value:deploys.length,unit:'개',color:'border-blue-500 bg-blue-50',tc:'text-blue-700'},{label:'실행 중',value:running,unit:'개',color:'border-green-500 bg-green-50',tc:'text-green-700'},{label:'24h 총 요청',value:totalReq.toLocaleString(),unit:'건',color:'border-purple-500 bg-purple-50',tc:'text-purple-700'},{label:'평균 에러율',value:avgErr,unit:'%',color:'border-orange-500 bg-orange-50',tc:'text-orange-700'}].map((c,i)=>(
          <div key={i} className={`p-5 rounded-xl border-l-4 bg-white shadow-sm ${c.color}`}>
            <div className="text-xs text-gray-500 mb-1">{c.label}</div>
            <div className={`text-2xl font-bold ${c.tc}`}>{c.value}<span className="text-sm font-normal text-gray-400 ml-1">{c.unit}</span></div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-gray-50/80"><tr>
          <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">배포 ID</th>
          <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">에이전트</th>
          <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">모델</th>
          <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">버전</th>
          <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">환경</th>
          <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">Replicas</th>
          <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">상태</th>
          <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">배포일</th>
          <th className="px-5 py-3.5 text-center text-xs font-medium text-gray-500">상세</th>
        </tr></thead><tbody className="divide-y divide-gray-100">{deploys.map(d=>(
          <tr key={d.id} className="hover:bg-gray-50/50">
            <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{d.id}</td>
            <td className="px-5 py-3.5 font-medium">{d.agentName}</td>
            <td className="px-5 py-3.5 text-gray-600">{d.model}</td>
            <td className="px-5 py-3.5"><span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md text-xs font-medium">{d.version}</span></td>
            <td className="px-5 py-3.5"><span className={`px-2 py-0.5 rounded-md text-xs font-medium ${d.env==='Production'?'bg-green-50 text-green-700':'bg-yellow-50 text-yellow-700'}`}>{d.env}</span></td>
            <td className="px-5 py-3.5 text-gray-600">{d.replicas}</td>
            <td className="px-5 py-3.5"><StatusBadge status={d.status}/></td>
            <td className="px-5 py-3.5 text-gray-400 text-xs">{d.deployDate}</td>
            <td className="px-5 py-3.5 text-center"><button onClick={()=>setSelDep(d)} className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600"><Eye size={15}/></button></td>
          </tr>
        ))}</tbody></table>
      </div>
      <Modal isOpen={!!selDep} onClose={()=>setSelDep(null)} title={`${selDep?.agentName} 배포 상세`} size="lg">
        {selDep&&<div className="space-y-5">
          <div className="flex items-center space-x-3 mb-2">
            <StatusBadge status={selDep.status}/>
            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${selDep.env==='Production'?'bg-green-50 text-green-700':'bg-yellow-50 text-yellow-700'}`}>{selDep.env}</span>
            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md text-xs font-medium">{selDep.version}</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[{l:'CPU',v:selDep.cpu},{l:'메모리',v:selDep.memory},{l:'GPU',v:selDep.gpu},{l:'Replicas',v:selDep.replicas}].map((r,i)=>(
              <div key={i} className="bg-gray-50 rounded-lg p-3"><div className="text-xs text-gray-400">{r.l}</div><div className="font-bold mt-0.5">{r.v}</div></div>
            ))}
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs text-gray-400 mb-1">엔드포인트</div>
            <div className="flex items-center space-x-2"><code className="text-sm font-mono bg-white px-3 py-1.5 rounded border flex-1">{selDep.endpoint}</code><button onClick={copyEndpoint} className="p-2 hover:bg-gray-200 rounded-lg" title="복사"><Copy size={14}/></button></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 rounded-lg p-3 text-center"><div className="text-xl font-bold text-blue-700">{selDep.requests24h}</div><div className="text-xs text-blue-500">24h 요청</div></div>
            <div className="bg-green-50 rounded-lg p-3 text-center"><div className="text-xl font-bold text-green-700">{selDep.uptime}</div><div className="text-xs text-green-500">업타임</div></div>
            <div className="bg-orange-50 rounded-lg p-3 text-center"><div className="text-xl font-bold text-orange-700">{selDep.errorRate}%</div><div className="text-xs text-orange-500">에러율</div></div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-400 h-32 overflow-y-auto">
            <div className="text-gray-500 border-b border-gray-700 pb-1 mb-2">최근 로그</div>
            <div>[2026-02-13 09:30:12] INFO Agent {selDep.agentName} processed request #4821</div>
            <div>[2026-02-13 09:29:45] INFO Response generated in {selDep.status==='Running'?'1.2':'0.0'}s</div>
            <div>[2026-02-13 09:28:33] INFO RAG retrieval: 5 chunks, similarity 0.89</div>
            <div className="text-yellow-400">[2026-02-13 09:25:11] WARN Token limit approaching (1856/2048)</div>
          </div>
          <div className="flex space-x-2 justify-end pt-2">
            <button onClick={()=>{setScaleReplicas(selDep.replicas||1);setShowScaleModal(true);}} className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50">스케일 조정</button>
            <button onClick={()=>setShowStopConfirm(true)} className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50">{selDep.status==='Running'?'중지':'시작'}</button>
            <button onClick={()=>setShowRedeployConfirm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">재배포</button>
          </div>
        </div>}
      </Modal>
      <ConfirmDialog isOpen={showStopConfirm} onClose={()=>setShowStopConfirm(false)} onConfirm={handleStopStart} title={selDep?.status==='Running'?'배포 중지':'배포 시작'} message={`'${selDep?.agentName}'을(를) ${selDep?.status==='Running'?'중지':'시작'}하시겠습니까?`} confirmText={selDep?.status==='Running'?'중지':'시작'} danger={selDep?.status==='Running'}/>
      <ConfirmDialog isOpen={showRedeployConfirm} onClose={()=>setShowRedeployConfirm(false)} onConfirm={handleRedeploy} title="재배포 확인" message={`'${selDep?.agentName}'을(를) 재배포하시겠습니까? 일시적으로 서비스가 중단될 수 있습니다.`} confirmText="재배포"/>
      <Modal isOpen={showScaleModal} onClose={()=>setShowScaleModal(false)} title="스케일 조정" size="sm">
        <div className="space-y-4">
          <div><label className="text-sm font-bold">Replicas 수</label><div className="flex items-center space-x-4 mt-2">
            <button onClick={()=>setScaleReplicas(p=>Math.max(0,p-1))} className="w-10 h-10 border rounded-lg flex items-center justify-center text-lg font-bold hover:bg-gray-50">-</button>
            <span className="text-3xl font-bold text-blue-600 w-12 text-center">{scaleReplicas}</span>
            <button onClick={()=>setScaleReplicas(p=>Math.min(10,p+1))} className="w-10 h-10 border rounded-lg flex items-center justify-center text-lg font-bold hover:bg-gray-50">+</button>
          </div></div>
          <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">현재 Replicas: {selDep?.replicas || 0}개 → 변경: {scaleReplicas}개</div>
        </div>
        <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
          <button onClick={()=>setShowScaleModal(false)} className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50">취소</button>
          <button onClick={handleScale} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">적용</button>
        </div>
      </Modal>
      <Modal isOpen={showCreateModal} onClose={()=>setShowCreateModal(false)} title="새 배포 생성" size="md">
        <div className="space-y-4">
          <div><label className="text-sm font-bold">에이전트</label><select value={newDeploy.agentName} onChange={e=>setNewDeploy(p=>({...p,agentName:e.target.value}))} className="w-full mt-1 px-3.5 py-2.5 border rounded-lg text-sm bg-white">{MOCK_AGENTS.map(a=><option key={a.id} value={a.name}>{a.name}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-bold">환경</label><select value={newDeploy.env} onChange={e=>setNewDeploy(p=>({...p,env:e.target.value}))} className="w-full mt-1 px-3.5 py-2.5 border rounded-lg text-sm bg-white"><option>Production</option><option>Staging</option></select></div>
            <div><label className="text-sm font-bold">Replicas</label><input type="number" value={newDeploy.replicas} onChange={e=>setNewDeploy(p=>({...p,replicas:parseInt(e.target.value)||1}))} min="1" max="10" className="w-full mt-1 px-3.5 py-2.5 border rounded-lg text-sm"/></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="text-sm font-bold">CPU</label><select value={newDeploy.cpu} onChange={e=>setNewDeploy(p=>({...p,cpu:e.target.value}))} className="w-full mt-1 px-3.5 py-2.5 border rounded-lg text-sm bg-white"><option>1 Core</option><option>2 Core</option><option>4 Core</option></select></div>
            <div><label className="text-sm font-bold">메모리</label><select value={newDeploy.memory} onChange={e=>setNewDeploy(p=>({...p,memory:e.target.value}))} className="w-full mt-1 px-3.5 py-2.5 border rounded-lg text-sm bg-white"><option>4 GB</option><option>8 GB</option><option>16 GB</option></select></div>
            <div><label className="text-sm font-bold">GPU</label><select value={newDeploy.gpu} onChange={e=>setNewDeploy(p=>({...p,gpu:e.target.value}))} className="w-full mt-1 px-3.5 py-2.5 border rounded-lg text-sm bg-white"><option>-</option><option>H200 x1</option><option>H200 x2</option><option>L40S x1</option></select></div>
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
          <button onClick={()=>setShowCreateModal(false)} className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50">취소</button>
          <button onClick={handleCreateDeploy} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">배포</button>
        </div>
      </Modal>
    </PageShell>
  );
};

export const WorkflowStepNode = ({step,isLast}) => {
  const cfg={trigger:{bg:'bg-orange-50',border:'border-orange-300',icon:Zap,iconColor:'text-orange-500',label:'트리거'},agent:{bg:'bg-blue-50',border:'border-blue-300',icon:Bot,iconColor:'text-blue-600',label:'에이전트'},condition:{bg:'bg-yellow-50',border:'border-yellow-300',icon:Filter,iconColor:'text-yellow-600',label:'조건 분기'},action:{bg:'bg-green-50',border:'border-green-300',icon:Play,iconColor:'text-green-600',label:'액션'},hitl:{bg:'bg-orange-50',border:'border-orange-400',icon:Users,iconColor:'text-orange-600',label:'HITL 검토'},mcp:{bg:'bg-purple-50',border:'border-purple-300',icon:Unplug,iconColor:'text-purple-600',label:'MCP 도구'}};
  const c=cfg[step.type]||cfg.action;
  return (
    <div className="flex items-center shrink-0">
      <div className={`w-36 ${c.bg} border-2 ${c.border} rounded-xl p-3 text-center shadow-sm hover:shadow-md transition-shadow`}>
        <c.icon size={20} className={`mx-auto mb-1.5 ${c.iconColor}`}/>
        <div className="text-xs font-bold text-gray-800 leading-tight">{step.name}</div>
        <div className="text-[10px] text-gray-400 mt-0.5">{c.label}</div>
      </div>
      {!isLast&&<div className="w-8 flex items-center justify-center shrink-0"><ArrowRight size={16} className="text-gray-300"/></div>}
    </div>
  );
};

export const WorkflowPage = () => {
  const toast=useToast();
  const [workflows,setWorkflows]=useState(MOCK_WORKFLOWS);
  const [expanded,setExpanded]=useState({});
  const [showCreateModal,setShowCreateModal]=useState(false);
  const [runningWf,setRunningWf]=useState({});
  const [showRunConfirm,setShowRunConfirm]=useState(null);
  const [showStopConfirm,setShowStopConfirm]=useState(null);
  const [newWf,setNewWf]=useState({name:'',desc:'',protocol:'MCP',hitl:false});
  const toggle=(id)=>setExpanded(p=>({...p,[id]:!p[id]}));
  const [wfRuns,setWfRuns]=useState({});
  const mockRuns=[
    {id:'RUN-0081',start:'2026-02-13 09:30',duration:'2m 14s',status:'완료'},{id:'RUN-0080',start:'2026-02-13 08:15',duration:'1m 58s',status:'완료'},
    {id:'RUN-0079',start:'2026-02-12 17:42',duration:'3m 05s',status:'오류 발생'},{id:'RUN-0078',start:'2026-02-12 14:20',duration:'2m 31s',status:'완료'},
  ];
  const handleRun=(wfId)=>{setRunningWf(p=>({...p,[wfId]:true}));toast('워크플로우 실행이 시작되었습니다.','info');const now=new Date();const dateStr=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;setTimeout(()=>{setRunningWf(p=>({...p,[wfId]:false}));const newRun={id:`RUN-${String(Math.floor(Math.random()*9000)+1000)}`,start:dateStr,duration:`${Math.floor(Math.random()*3)+1}m ${String(Math.floor(Math.random()*60)).padStart(2,'0')}s`,status:'완료'};setWfRuns(p=>({...p,[wfId]:[newRun,...(p[wfId]||[])]}));setWorkflows(p=>p.map(w=>w.id===wfId?{...w,lastRun:dateStr,runs24h:w.runs24h+1}:w));toast('워크플로우 실행이 완료되었습니다.');},3000);};
  const handleStop=(wfId)=>{setWorkflows(p=>p.map(w=>w.id===wfId?{...w,status:w.status==='Running'?'Stopped':'Running'}:w));toast(`워크플로우가 ${workflows.find(w=>w.id===wfId)?.status==='Running'?'중지':'시작'}되었습니다.`,workflows.find(w=>w.id===wfId)?.status==='Running'?'warning':'success');};
  const handleCreate=()=>{if(!newWf.name.trim()){toast('워크플로우 이름을 입력하세요.','error');return;}const id='WF-'+(workflows.length+1).toString().padStart(3,'0');const now=new Date().toISOString().slice(0,10);const wf={id,name:newWf.name,desc:newWf.desc,status:'Stopped',creator:ADMIN_PERSONA.name,created:now,lastRun:'-',runs24h:0,successRate:0,protocol:newWf.protocol,hitl:newWf.hitl,steps:[{id:'s1',name:'트리거 이벤트',type:'trigger',agentId:null},{id:'s2',name:'에이전트 처리',type:'agent',agentId:'AGT-001'}]};setWorkflows(p=>[...p,wf]);setShowCreateModal(false);setNewWf({name:'',desc:'',protocol:'MCP',hitl:false});toast(`'${wf.name}' 워크플로우가 생성되었습니다.`);};
  return (
    <PageShell breadcrumb={['에이전트','워크플로우']} title="멀티 에이전트 워크플로우" action={<button onClick={()=>setShowCreateModal(true)} className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center shadow-sm hover:bg-blue-700"><Plus size={16} className="mr-1.5"/>새 워크플로우 생성</button>}>
      <div className="flex items-center space-x-4 mb-5 text-xs">
        <div className="flex items-center space-x-1.5"><div className="w-3 h-3 rounded bg-orange-200 border border-orange-400"/><span className="text-gray-500">트리거</span></div>
        <div className="flex items-center space-x-1.5"><div className="w-3 h-3 rounded bg-blue-200 border border-blue-400"/><span className="text-gray-500">에이전트</span></div>
        <div className="flex items-center space-x-1.5"><div className="w-3 h-3 rounded bg-yellow-200 border border-yellow-400"/><span className="text-gray-500">조건 분기</span></div>
        <div className="flex items-center space-x-1.5"><div className="w-3 h-3 rounded bg-purple-200 border border-purple-400"/><span className="text-gray-500">MCP 도구</span></div>
        <div className="flex items-center space-x-1.5"><div className="w-3 h-3 rounded bg-orange-200 border border-orange-500"/><span className="text-gray-500">HITL 검토</span></div>
        <div className="flex items-center space-x-1.5"><div className="w-3 h-3 rounded bg-green-200 border border-green-400"/><span className="text-gray-500">액션</span></div>
      </div>
      <div className="space-y-5">{workflows.map(wf=>(
        <div key={wf.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${runningWf[wf.id]?'ring-2 ring-blue-400 ring-offset-2':''}`}>
          <div className="p-5">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${wf.status==='Running'?'bg-blue-50':'bg-gray-100'} ${runningWf[wf.id]?'animate-pulse':''}`}><Layers size={20} className={wf.status==='Running'?'text-blue-600':'text-gray-400'}/></div>
                <div>
                  <div className="flex items-center space-x-2"><h3 className="font-bold">{wf.name}</h3>
                    {wf.protocol&&<span className="bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded text-[10px] font-bold">{wf.protocol}</span>}
                    {wf.hitl&&<span className="bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded text-[10px] font-bold">HITL</span>}
                    {runningWf[wf.id]&&<span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-bold animate-pulse">실행 중...</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{wf.desc}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={()=>{if(runningWf[wf.id])return;setShowRunConfirm(wf.id);}} disabled={runningWf[wf.id]||wf.status==='Stopped'} className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 ${runningWf[wf.id]?'bg-gray-100 text-gray-400 cursor-not-allowed':wf.status==='Stopped'?'bg-gray-100 text-gray-400 cursor-not-allowed':'bg-blue-600 text-white hover:bg-blue-700'}`}><Play size={12}/><span>실행</span></button>
                <button onClick={()=>setShowStopConfirm(wf.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${wf.status==='Running'?'border border-red-200 text-red-600 hover:bg-red-50':'border border-green-200 text-green-600 hover:bg-green-50'}`}>{wf.status==='Running'?'중지':'시작'}</button>
                <StatusBadge status={wf.status}/>
                <button onClick={()=>toggle(wf.id)} className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronDown size={16} className={`text-gray-400 transition-transform ${expanded[wf.id]?'rotate-180':''}`}/></button>
              </div>
            </div>
            <div className="flex items-center space-x-5 text-xs text-gray-400 mb-5 ml-[52px]">
              <span>생성자: {wf.creator}</span><span>최종 실행: {wf.lastRun}</span><span>24h 실행: {wf.runs24h}회</span><span>성공률: {wf.successRate}%</span><span>노드: {wf.steps.length}개</span>
            </div>
            <div className="bg-gray-50/80 rounded-xl p-5 overflow-x-auto">
              <div className="flex items-center min-w-max">
                {wf.steps.map((s,i)=><WorkflowStepNode key={s.id} step={s} isLast={i===wf.steps.length-1}/>)}
              </div>
            </div>
          </div>
          {expanded[wf.id]&&<div className="border-t">
            <div className="px-5 py-3 bg-gray-50/50 text-xs font-bold text-gray-500">실행 이력</div>
            <table className="w-full text-sm"><thead className="bg-gray-50/50"><tr>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400">Run ID</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400">시작 시간</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400">소요 시간</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400">상태</th>
            </tr></thead><tbody className="divide-y divide-gray-100">{[...(wfRuns[wf.id]||[]),...mockRuns].map(r=>(
              <tr key={r.id} className="hover:bg-gray-50/50"><td className="px-5 py-2.5 font-mono text-xs text-gray-500">{r.id}</td><td className="px-5 py-2.5 text-gray-600">{r.start}</td><td className="px-5 py-2.5 text-gray-500">{r.duration}</td><td className="px-5 py-2.5"><StatusBadge status={r.status}/></td></tr>
            ))}</tbody></table>
          </div>}
        </div>
      ))}</div>
      <ConfirmDialog isOpen={showRunConfirm!==null} onClose={()=>setShowRunConfirm(null)} onConfirm={()=>{handleRun(showRunConfirm);}} title="워크플로우 실행" message={`'${workflows.find(w=>w.id===showRunConfirm)?.name}' 워크플로우를 실행하시겠습니까?`} confirmText="실행"/>
      <ConfirmDialog isOpen={showStopConfirm!==null} onClose={()=>setShowStopConfirm(null)} onConfirm={()=>{handleStop(showStopConfirm);}} title={`워크플로우 ${workflows.find(w=>w.id===showStopConfirm)?.status==='Running'?'중지':'시작'}`} message={`'${workflows.find(w=>w.id===showStopConfirm)?.name}' 워크플로우를 ${workflows.find(w=>w.id===showStopConfirm)?.status==='Running'?'중지':'시작'}하시겠습니까?`} confirmText={workflows.find(w=>w.id===showStopConfirm)?.status==='Running'?'중지':'시작'} danger={workflows.find(w=>w.id===showStopConfirm)?.status==='Running'}/>
      <Modal isOpen={showCreateModal} onClose={()=>setShowCreateModal(false)} title="새 워크플로우 생성" size="md">
        <div className="space-y-4">
          <div><label className="text-sm font-bold">워크플로우 이름 *</label><input value={newWf.name} onChange={e=>setNewWf(p=>({...p,name:e.target.value}))} placeholder={'예: '+ADMIN_WORKFLOW_NAME_EXAMPLE} className="w-full mt-1 px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"/></div>
          <div><label className="text-sm font-bold">설명</label><textarea value={newWf.desc} onChange={e=>setNewWf(p=>({...p,desc:e.target.value}))} placeholder="워크플로우의 목적과 처리 흐름을 설명하세요" className="w-full mt-1 h-20 px-3.5 py-2.5 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-bold">프로토콜</label><select value={newWf.protocol} onChange={e=>setNewWf(p=>({...p,protocol:e.target.value}))} className="w-full mt-1 px-3.5 py-2.5 border rounded-lg text-sm bg-white"><option>MCP</option><option>A2A</option><option>MCP+A2A</option></select></div>
            <div><label className="text-sm font-bold">HITL</label><div className="flex items-center mt-3 space-x-2"><ToggleSwitch on={newWf.hitl} onClick={()=>setNewWf(p=>({...p,hitl:!p.hitl}))}/><span className="text-sm text-gray-600">{newWf.hitl?'활성화':'비활성화'}</span></div></div>
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
          <button onClick={()=>setShowCreateModal(false)} className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50">취소</button>
          <button onClick={handleCreate} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">생성</button>
        </div>
      </Modal>
    </PageShell>
  );
};

