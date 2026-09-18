import React, { useState } from 'react';
import { Database, Plus, Search } from 'lucide-react';
import { MOCK_MODELS, MOCK_CODESPACES, MOCK_VOLUMES, ADMIN_DATASET_ROWS, ADMIN_VECTOR_SEARCH_RESULTS } from '../mocks.js';
import { StatusBadge, Modal, PageShell, useToast, ConfirmDialog, ToggleSwitch } from '../common.jsx';

export const DatasetPage = () => {
  const toast=useToast();
  const [datasets,setDatasets]=useState(ADMIN_DATASET_ROWS.map(r=>({...r})));
  const [search,setSearch]=useState('');const [showCreate,setShowCreate]=useState(false);const [detail,setDetail]=useState(null);const [confirmDel,setConfirmDel]=useState(null);
  const [form,setForm]=useState({name:'',desc:'',type:'JSONL'});
  const filtered=datasets.filter(d=>d.n.toLowerCase().includes(search.toLowerCase())||d.d.includes(search));
  return (
    <PageShell breadcrumb={['데이터','데이터셋']} title="데이터셋 관리" action={<button onClick={()=>setShowCreate(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"><Plus size={16} className="mr-1"/>데이터셋 생성</button>}>
      <div className="relative max-w-sm mb-4"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="데이터셋 검색..." className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/><Search size={16} className="absolute left-3 top-2.5 text-gray-400"/></div>
      <div className="grid grid-cols-3 gap-4">{filtered.map(d=>(
        <div key={d.id} className="bg-white p-5 rounded-xl border hover:border-blue-300 cursor-pointer transition-all" onClick={()=>setDetail(d)}>
          <div className="flex justify-between items-start mb-3"><div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg"><Database size={20}/></div><span className="text-xs text-gray-400">{d.date}</span></div>
          <h3 className="font-bold text-sm mb-1">{d.n}</h3>
          <p className="text-xs text-gray-500 mb-3 h-8">{d.d}</p>
          <div className="flex space-x-1.5 text-xs">{[d.t,d.s,d.c+' items'].map((t,j)=><span key={j} className="bg-gray-100 px-2 py-0.5 rounded">{t}</span>)}</div>
        </div>
      ))}</div>
      <Modal isOpen={showCreate} onClose={()=>setShowCreate(false)} title="데이터셋 생성" size="md">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">이름</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <div><label className="block text-sm font-medium mb-1">설명</label><input value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <div><label className="block text-sm font-medium mb-1">유형</label><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"><option>JSONL</option><option>CSV</option><option>TXT</option><option>Parquet</option></select></div>
          <button onClick={()=>{if(!form.name)return;setDatasets(p=>[{id:Date.now(),n:form.name,d:form.desc,t:form.type,s:'0MB',c:'0',date:'2026-02-11'},...p]);setShowCreate(false);setForm({name:'',desc:'',type:'JSONL'});toast('데이터셋이 생성되었습니다');}} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm">생성</button>
        </div>
      </Modal>
      <Modal isOpen={!!detail} onClose={()=>setDetail(null)} title={detail?.n} size="lg">
        {detail&&<div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">{[['유형',detail.t],['크기',detail.s],['건수',detail.c],['생성일',detail.date],['설명',detail.d]].map(([k,v],i)=>(
            <div key={i} className={`bg-gray-50 p-3 rounded-lg ${i===4?'col-span-2':''}`}><div className="text-xs text-gray-400">{k}</div><div className="font-medium">{v}</div></div>
          ))}</div>
          <button onClick={()=>{setConfirmDel(detail);setDetail(null);}} className="w-full bg-red-50 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-100">삭제</button>
        </div>}
      </Modal>
      <ConfirmDialog isOpen={!!confirmDel} onClose={()=>setConfirmDel(null)} onConfirm={()=>{setDatasets(p=>p.filter(x=>x.id!==confirmDel.id));setConfirmDel(null);toast('데이터셋이 삭제되었습니다','info');}} title="데이터셋 삭제" message={`'${confirmDel?.n}'을(를) 삭제하시겠습니까?`} confirmText="삭제" danger/>
    </PageShell>
  );
};

export const VectorDbPage = () => {
  const toast=useToast();
  const [query,setQuery]=useState('');const [results,setResults]=useState(null);const [searching,setSearching]=useState(false);
  const [collections]=useState([
    {name:'safety_regulations',vectors:'850K',dim:1024,status:'Active',updated:'2026-02-10'},
    {name:'maintenance_manual',vectors:'420K',dim:1024,status:'Active',updated:'2026-02-09'},
    {name:'employee_qa_logs',vectors:'680K',dim:768,status:'Active',updated:'2026-02-10'},
    {name:'financial_reports',vectors:'210K',dim:1024,status:'Active',updated:'2026-02-08'},
    {name:'training_materials',vectors:'240K',dim:768,status:'Building',updated:'2026-02-11'},
  ]);
  const doSearch=()=>{if(!query.trim())return;setSearching(true);setTimeout(()=>{setResults(ADMIN_VECTOR_SEARCH_RESULTS.map(r=>({...r})));setSearching(false);},800);};
  return (
    <PageShell breadcrumb={['데이터','벡터 DB']}>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border"><div className="text-3xl font-bold mb-1">2.4M</div><div className="text-sm text-gray-500">총 벡터 수</div></div>
        <div className="bg-white p-5 rounded-xl border"><div className="text-3xl font-bold mb-1">{collections.length}</div><div className="text-sm text-gray-500">활성 컬렉션</div></div>
        <div className="bg-white p-5 rounded-xl border"><div className="text-3xl font-bold mb-1">45ms</div><div className="text-sm text-gray-500">평균 쿼리 지연</div></div>
      </div>
      <div className="bg-white rounded-xl border p-5 mb-6">
        <h3 className="font-bold mb-3 flex items-center"><Search size={18} className="mr-2 text-blue-600"/>벡터 검색 시뮬레이터</h3>
        <div className="flex space-x-2 mb-4">
          <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doSearch()} placeholder="테스트할 검색어 입력..." className="flex-1 px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          <button onClick={doSearch} disabled={searching} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{searching?'검색 중...':'검색'}</button>
        </div>
        {results&&<div className="space-y-2">{results.map((r,i)=>(
          <div key={i} className="bg-gray-50 border rounded-lg p-3 hover:border-blue-300">
            <div className="flex justify-between mb-1"><span className="text-xs font-mono text-gray-500">{r.id}</span><span className="text-xs font-bold text-blue-600">유사도: {r.score}</span></div>
            <p className="text-sm text-gray-700">{r.content}</p>
          </div>
        ))}</div>}
      </div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold">컬렉션 관리</h3>
        <button onClick={()=>toast('컬렉션이 생성되었습니다')} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center"><Plus size={14} className="mr-1"/>컬렉션 생성</button>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr>
          <th className="px-4 py-3 text-left">컬렉션명</th><th className="px-4 py-3 text-right">벡터 수</th><th className="px-4 py-3 text-right">차원</th><th className="px-4 py-3 text-left">상태</th><th className="px-4 py-3 text-left">최근 업데이트</th>
        </tr></thead><tbody className="divide-y">{collections.map((c,i)=>(
          <tr key={i} className="hover:bg-gray-50"><td className="px-4 py-3 font-mono text-sm font-medium">{c.name}</td><td className="px-4 py-3 text-right">{c.vectors}</td><td className="px-4 py-3 text-right">{c.dim}</td><td className="px-4 py-3"><StatusBadge status={c.status}/></td><td className="px-4 py-3 text-gray-500 text-xs">{c.updated}</td></tr>
        ))}</tbody></table>
      </div>
    </PageShell>
  );
};

export const AutoLoadPage = () => {
  const toast=useToast();
  const [sources,setSources]=useState([
    {id:1,n:'ERP_HR_DB',t:'Oracle DB',s:'매일 02:00',l:'2026-02-10 02:00',st:'Healthy',active:true},
    {id:2,n:'SharePoint_Docs',t:'API Crawler',s:'매시간',l:'2026-02-10 11:00',st:'Healthy',active:true},
    {id:3,n:'Legacy_File_Server',t:'SMB Mount',s:'매주 (일)',l:'2026-02-09 00:00',st:'Warning',active:true},
    {id:4,n:'IoT_Sensor_Logs',t:'MQTT Stream',s:'실시간',l:'실행 중',st:'Healthy',active:true},
  ]);
  const [showAdd,setShowAdd]=useState(false);const [confirmRun,setConfirmRun]=useState(null);
  const [form,setForm]=useState({name:'',type:'Oracle DB',schedule:'매일 02:00'});
  return (
    <PageShell breadcrumb={['데이터','자동 적재']} title="데이터 자동 적재 설정" action={<button onClick={()=>setShowAdd(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"><Plus size={16} className="mr-1"/>소스 추가</button>}>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr>
          <th className="px-4 py-3 text-left">소스명</th><th className="px-4 py-3 text-left">유형</th><th className="px-4 py-3 text-left">주기</th><th className="px-4 py-3 text-left">최근 실행</th><th className="px-4 py-3 text-left">상태</th><th className="px-4 py-3 text-center">활성</th><th className="px-4 py-3 text-center">액션</th>
        </tr></thead><tbody className="divide-y">{sources.map(r=>(
          <tr key={r.id} className={`hover:bg-gray-50 ${!r.active?'opacity-50':''}`}>
            <td className="px-4 py-3 font-medium">{r.n}</td><td className="px-4 py-3">{r.t}</td><td className="px-4 py-3">{r.s}</td><td className="px-4 py-3 text-gray-500">{r.l}</td><td className="px-4 py-3"><StatusBadge status={r.st}/></td>
            <td className="px-4 py-3 text-center"><ToggleSwitch on={r.active} onClick={()=>{setSources(p=>p.map(x=>x.id===r.id?{...x,active:!x.active}:x));toast(r.active?`${r.n} 비활성화`:`${r.n} 활성화`,r.active?'info':'success');}}/></td>
            <td className="px-4 py-3 text-center"><button onClick={()=>setConfirmRun(r)} className="text-xs text-blue-600 hover:underline">지금 실행</button></td>
          </tr>
        ))}</tbody></table>
      </div>
      <Modal isOpen={showAdd} onClose={()=>setShowAdd(false)} title="소스 추가" size="md">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">소스명</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">유형</label><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"><option>Oracle DB</option><option>API Crawler</option><option>SMB Mount</option><option>MQTT Stream</option><option>S3 Bucket</option></select></div>
            <div><label className="block text-sm font-medium mb-1">주기</label><select value={form.schedule} onChange={e=>setForm({...form,schedule:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"><option>실시간</option><option>매시간</option><option>매일 02:00</option><option>매주 (일)</option></select></div>
          </div>
          <button onClick={()=>{if(!form.name)return;setSources(p=>[...p,{id:Date.now(),n:form.name,t:form.type,s:form.schedule,l:'-',st:'Healthy',active:true}]);setShowAdd(false);setForm({name:'',type:'Oracle DB',schedule:'매일 02:00'});toast('소스가 추가되었습니다');}} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm">추가</button>
        </div>
      </Modal>
      <ConfirmDialog isOpen={!!confirmRun} onClose={()=>setConfirmRun(null)} onConfirm={()=>{setSources(p=>p.map(x=>x.id===confirmRun.id?{...x,l:'실행 중',st:'Healthy'}:x));setConfirmRun(null);toast(`${confirmRun?.n} 적재가 시작되었습니다`);}} title="지금 실행" message={`'${confirmRun?.n}'을(를) 즉시 실행하시겠습니까?`} confirmText="실행"/>
    </PageShell>
  );
};

export const CodespacePage = () => {
  const toast=useToast();
  const [spaces,setSpaces]=useState(MOCK_CODESPACES.map(c=>({...c})));
  const [showCreate,setShowCreate]=useState(false);const [confirmDel,setConfirmDel]=useState(null);
  const [form,setForm]=useState({name:'',image:'pytorch/pytorch:2.1-cuda12',gpu:'A100 x1'});
  const toggleStatus=(id)=>{setSpaces(p=>p.map(c=>{if(c.id!==id)return c;const ns=c.status==='Running'?'Stopped':'Running';toast(ns==='Running'?`${c.name} 시작됨`:`${c.name} 중지됨`,ns==='Running'?'success':'info');return{...c,status:ns};}));};
  return (
    <PageShell breadcrumb={['개발','코드스페이스']} title="코드스페이스" action={<button onClick={()=>setShowCreate(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"><Plus size={16} className="mr-1"/>새 환경 생성</button>}>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr>
          <th className="px-4 py-3 text-left">이름</th><th className="px-4 py-3 text-left">Docker 이미지</th><th className="px-4 py-3 text-left">상태</th><th className="px-4 py-3 text-left">GPU</th><th className="px-4 py-3 text-left">생성일</th><th className="px-4 py-3 text-center">액션</th>
        </tr></thead><tbody className="divide-y">{spaces.map(c=>(
          <tr key={c.id} className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">{c.name}</td><td className="px-4 py-3 text-gray-500 font-mono text-xs">{c.image}</td><td className="px-4 py-3"><StatusBadge status={c.status}/></td><td className="px-4 py-3">{c.gpu}</td><td className="px-4 py-3 text-gray-500">{c.created}</td>
            <td className="px-4 py-3 text-center space-x-2">
              <button onClick={()=>toggleStatus(c.id)} className={`text-xs px-2 py-1 rounded ${c.status==='Running'?'bg-orange-50 text-orange-600 hover:bg-orange-100':'bg-green-50 text-green-600 hover:bg-green-100'}`}>{c.status==='Running'?'중지':'시작'}</button>
              <button onClick={()=>setConfirmDel(c)} className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100">삭제</button>
            </td>
          </tr>
        ))}</tbody></table>
      </div>
      <Modal isOpen={showCreate} onClose={()=>setShowCreate(false)} title="새 코드스페이스 생성" size="md">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">이름</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <div><label className="block text-sm font-medium mb-1">Docker 이미지</label><select value={form.image} onChange={e=>setForm({...form,image:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"><option>pytorch/pytorch:2.1-cuda12</option><option>tensorflow/tensorflow:2.15-gpu</option><option>jupyter/datascience-notebook</option><option>vllm/vllm-openai:latest</option></select></div>
          <div><label className="block text-sm font-medium mb-1">GPU</label><select value={form.gpu} onChange={e=>setForm({...form,gpu:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"><option>None</option><option>A100 x1</option><option>A100 x2</option><option>A100 x4</option></select></div>
          <button onClick={()=>{if(!form.name)return;setSpaces(p=>[{id:`cs-${Date.now()}`,name:form.name,image:form.image,status:'Stopped',gpu:form.gpu,created:'2026-02-11'},...p]);setShowCreate(false);setForm({name:'',image:'pytorch/pytorch:2.1-cuda12',gpu:'A100 x1'});toast('코드스페이스가 생성되었습니다');}} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm">생성</button>
        </div>
      </Modal>
      <ConfirmDialog isOpen={!!confirmDel} onClose={()=>setConfirmDel(null)} onConfirm={()=>{setSpaces(p=>p.filter(x=>x.id!==confirmDel.id));setConfirmDel(null);toast('코드스페이스가 삭제되었습니다','info');}} title="코드스페이스 삭제" message={`'${confirmDel?.name}'을(를) 삭제하시겠습니까?`} confirmText="삭제" danger/>
    </PageShell>
  );
};

export const SharedVolumePage = () => {
  const toast=useToast();
  const [volumes,setVolumes]=useState(MOCK_VOLUMES.map((v,i)=>({...v,id:i+1})));
  const [showCreate,setShowCreate]=useState(false);const [resizeVol,setResizeVol]=useState(null);const [confirmDel,setConfirmDel]=useState(null);
  const [form,setForm]=useState({name:'',size:'100GB',mount:'/mnt/shared/'});const [newSize,setNewSize]=useState('');
  return (
    <PageShell breadcrumb={['개발','공유 볼륨']} title="공유 볼륨 관리" action={<button onClick={()=>setShowCreate(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"><Plus size={16} className="mr-1"/>볼륨 생성</button>}>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr>
          <th className="px-4 py-3 text-left">이름</th><th className="px-4 py-3 text-left">크기</th><th className="px-4 py-3 text-left">마운트 경로</th><th className="px-4 py-3 text-left">사용 환경</th><th className="px-4 py-3 text-left">상태</th><th className="px-4 py-3 text-center">액션</th>
        </tr></thead><tbody className="divide-y">{volumes.map(v=>(
          <tr key={v.id} className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">{v.name}</td><td className="px-4 py-3">{v.size}</td><td className="px-4 py-3 font-mono text-xs text-gray-500">{v.mount}</td><td className="px-4 py-3 text-gray-500">{v.usedBy}</td><td className="px-4 py-3"><StatusBadge status={v.status}/></td>
            <td className="px-4 py-3 text-center space-x-2">
              <button onClick={()=>{setResizeVol(v);setNewSize(v.size);}} className="text-xs text-blue-600 hover:underline">리사이즈</button>
              <button onClick={()=>setConfirmDel(v)} className="text-xs text-red-500 hover:underline">삭제</button>
            </td>
          </tr>
        ))}</tbody></table>
      </div>
      <Modal isOpen={showCreate} onClose={()=>setShowCreate(false)} title="볼륨 생성" size="md">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">이름</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">크기</label><select value={form.size} onChange={e=>setForm({...form,size:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"><option>50GB</option><option>100GB</option><option>500GB</option><option>1TB</option><option>5TB</option></select></div>
            <div><label className="block text-sm font-medium mb-1">마운트 경로</label><input value={form.mount} onChange={e=>setForm({...form,mount:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm font-mono"/></div>
          </div>
          <button onClick={()=>{if(!form.name)return;setVolumes(p=>[...p,{id:Date.now(),name:form.name,size:form.size,mount:form.mount,usedBy:'-',status:'Mounted'}]);setShowCreate(false);setForm({name:'',size:'100GB',mount:'/mnt/shared/'});toast('볼륨이 생성되었습니다');}} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm">생성</button>
        </div>
      </Modal>
      <Modal isOpen={!!resizeVol} onClose={()=>setResizeVol(null)} title={`${resizeVol?.name} 리사이즈`} size="sm">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">새 크기</label><select value={newSize} onChange={e=>setNewSize(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm"><option>50GB</option><option>100GB</option><option>500GB</option><option>1TB</option><option>5TB</option><option>10TB</option></select></div>
          <button onClick={()=>{setVolumes(p=>p.map(x=>x.id===resizeVol.id?{...x,size:newSize}:x));setResizeVol(null);toast('볼륨 크기가 변경되었습니다');}} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm">적용</button>
        </div>
      </Modal>
      <ConfirmDialog isOpen={!!confirmDel} onClose={()=>setConfirmDel(null)} onConfirm={()=>{setVolumes(p=>p.filter(x=>x.id!==confirmDel.id));setConfirmDel(null);toast('볼륨이 삭제되었습니다','info');}} title="볼륨 삭제" message={`'${confirmDel?.name}'을(를) 삭제하시겠습니까? 데이터가 영구 삭제됩니다.`} confirmText="삭제" danger/>
    </PageShell>
  );
};

// ==================== MODEL, TRAINER, EVAL, GUARDRAIL ====================
export const ModelRegistry = () => {
  const toast=useToast();
  const [models,setModels]=useState(MOCK_MODELS.map(m=>({...m})));
  const [search,setSearch]=useState('');const [showCreate,setShowCreate]=useState(false);const [detail,setDetail]=useState(null);const [confirmAction,setConfirmAction]=useState(null);
  const [form,setForm]=useState({name:'',param:'7B',context:'4K',quant:'FP16'});
  const filtered=models.filter(m=>m.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <PageShell breadcrumb={['모델']} title="모델 레지스트리" action={<button onClick={()=>setShowCreate(true)} className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"><Plus size={16} className="mr-1"/>모델 등록</button>}>
      <div className="relative max-w-sm mb-4"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="모델 검색..." className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/><Search size={16} className="absolute left-3 top-2.5 text-gray-400"/></div>
      <div className="space-y-3">{filtered.map(m=>(
        <div key={m.id} className="bg-white p-5 rounded-xl border flex items-center justify-between hover:border-blue-300 transition-all cursor-pointer" onClick={()=>setDetail(m)}>
          <div className="flex items-center space-x-4">
            <div className="w-11 h-11 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-600">AI</div>
            <div><h3 className="font-bold">{m.name}</h3>
              <div className="flex space-x-2 mt-1 text-xs">{[`파라미터: ${m.param}`,`문맥: ${m.context}`,`양자화: ${m.quant}`].map((t,i)=><span key={i} className="bg-gray-100 px-2 py-0.5 rounded border">{t}</span>)}</div>
            </div>
          </div>
          <div className="flex items-center space-x-4" onClick={e=>e.stopPropagation()}>
            <div className="text-right text-sm"><div className="text-xs text-gray-400">로드 노드</div><div className="font-medium">{m.loaded}</div></div>
            <StatusBadge status={m.status}/>
            <button onClick={()=>setConfirmAction({model:m,action:m.status==='Running'?'unload':'load'})} className={`text-xs px-3 py-1.5 rounded font-medium ${m.status==='Running'?'bg-orange-50 text-orange-600 hover:bg-orange-100':'bg-green-50 text-green-600 hover:bg-green-100'}`}>{m.status==='Running'?'언로드':'로드'}</button>
          </div>
        </div>
      ))}</div>
      <Modal isOpen={showCreate} onClose={()=>setShowCreate(false)} title="모델 등록" size="md">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">모델명</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="모델 이름" className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">파라미터</label><select value={form.param} onChange={e=>setForm({...form,param:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"><option>7B</option><option>13B</option><option>30B</option><option>70B</option><option>120B</option></select></div>
            <div><label className="block text-sm font-medium mb-1">문맥 길이</label><select value={form.context} onChange={e=>setForm({...form,context:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"><option>4K</option><option>8K</option><option>32K</option><option>128K</option></select></div>
            <div><label className="block text-sm font-medium mb-1">양자화</label><select value={form.quant} onChange={e=>setForm({...form,quant:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"><option>FP16</option><option>INT8</option><option>INT4</option><option>GPTQ</option><option>AWQ</option></select></div>
          </div>
          <button onClick={()=>{if(!form.name)return;setModels(p=>[{id:`model-${Date.now()}`,name:form.name,param:form.param,context:form.context,quant:form.quant,loaded:'-',status:'Stopped'},...p]);setShowCreate(false);setForm({name:'',param:'7B',context:'4K',quant:'FP16'});toast('모델이 등록되었습니다');}} className="w-full bg-gray-800 text-white py-2.5 rounded-lg font-medium text-sm">등록</button>
        </div>
      </Modal>
      <Modal isOpen={!!detail} onClose={()=>setDetail(null)} title={detail?.name} size="lg">
        {detail&&<div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">{[['파라미터',detail.param],['문맥 길이',detail.context],['양자화',detail.quant],['로드 노드',detail.loaded],['상태',detail.status],['ID',detail.id]].map(([k,v],i)=>(
            <div key={i} className="bg-gray-50 p-3 rounded-lg"><div className="text-xs text-gray-400">{k}</div><div className="font-medium">{v}</div></div>
          ))}</div>
        </div>}
      </Modal>
      <ConfirmDialog isOpen={!!confirmAction} onClose={()=>setConfirmAction(null)} onConfirm={()=>{const{model,action}=confirmAction;setModels(p=>p.map(x=>x.id===model.id?{...x,status:action==='load'?'Running':'Stopped',loaded:action==='load'?'gpu-node-01':'-'}:x));setConfirmAction(null);toast(action==='load'?`${model.name} 로드 완료`:`${model.name} 언로드 완료`,action==='load'?'success':'info');}} title={confirmAction?.action==='load'?'모델 로드':'모델 언로드'} message={`${confirmAction?.model?.name}을(를) ${confirmAction?.action==='load'?'로드':'언로드'}하시겠습니까?`} confirmText={confirmAction?.action==='load'?'로드':'언로드'}/>
    </PageShell>
  );
};

