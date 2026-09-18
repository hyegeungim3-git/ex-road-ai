import React, { useState } from 'react';
import { Plus, Search, Play } from 'lucide-react';
import { MOCK_EMBEDDING_JOBS, ADMIN_PERSONA } from '../mocks.js';
import { StatusBadge, Modal, PageShell, useToast, ConfirmDialog, ToggleSwitch } from '../common.jsx';

export const LlmTraining = () => {
  const toast=useToast();
  const [jobs,setJobs]=useState([
    {id:'JOB-992',model:'GPT-OSS-120B',method:'LoRA',dataset:'Maintenance_Manual',progress:45,status:'학습 중',lr:'2e-4',epochs:'3/10',batch:32,gpu:'A100 x8'},
    {id:'JOB-991',model:'Llama-3-Kor',method:'QLoRA',dataset:'Safety_QA_v1',progress:100,status:'학습 완료',lr:'3e-4',epochs:'10/10',batch:16,gpu:'A100 x4'},
    {id:'JOB-989',model:'EXAONE-3.0',method:'Full-FT',dataset:'Finance_Report',progress:0,status:'오류 발생',lr:'1e-5',epochs:'0/5',batch:8,gpu:'A100 x8'},
  ]);
  const [showCreate,setShowCreate]=useState(false);const [detail,setDetail]=useState(null);const [confirmStop,setConfirmStop]=useState(null);
  const [form,setForm]=useState({model:'Llama-3-Kor',method:'QLoRA',dataset:'',lr:'2e-4',epochs:10,batch:16,gpu:'A100 x4'});
  return (
    <PageShell breadcrumb={['트레이너','LLM']} title="LLM 학습 관리" action={<button onClick={()=>setShowCreate(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"><Plus size={16} className="mr-1"/>새 학습 작업</button>}>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr>
          <th className="px-4 py-3 text-left">Job ID</th><th className="px-4 py-3 text-left">모델</th><th className="px-4 py-3 text-left">방법</th><th className="px-4 py-3 text-left">데이터셋</th><th className="px-4 py-3 text-left">진행률</th><th className="px-4 py-3 text-left">상태</th><th className="px-4 py-3 text-center">액션</th>
        </tr></thead><tbody className="divide-y">{jobs.map(j=>(
          <tr key={j.id} className="hover:bg-gray-50 cursor-pointer" onClick={()=>setDetail(j)}>
            <td className="px-4 py-3 font-mono text-xs">{j.id}</td><td className="px-4 py-3 font-medium">{j.model}</td><td className="px-4 py-3">{j.method}</td><td className="px-4 py-3 text-gray-500">{j.dataset}</td>
            <td className="px-4 py-3"><div className="flex items-center space-x-2"><div className="w-full bg-gray-200 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${j.status==='오류 발생'?'bg-red-500':j.status==='학습 중'?'bg-blue-500 animate-pulse':'bg-green-500'}`} style={{width:`${j.progress}%`}}/></div><span className="text-xs w-8">{j.progress}%</span></div></td>
            <td className="px-4 py-3"><StatusBadge status={j.status}/></td>
            <td className="px-4 py-3 text-center" onClick={e=>e.stopPropagation()}>
              {j.status==='학습 중'&&<button onClick={()=>setConfirmStop(j)} className="text-xs text-red-500 hover:underline">중지</button>}
              {j.status==='오류 발생'&&<button onClick={()=>{setJobs(p=>p.map(x=>x.id===j.id?{...x,status:'학습 중',progress:1}:x));toast('재학습을 시작합니다');}} className="text-xs text-blue-600 hover:underline">재시도</button>}
            </td>
          </tr>
        ))}</tbody></table>
      </div>
      <Modal isOpen={showCreate} onClose={()=>setShowCreate(false)} title="새 LLM 학습 작업" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">모델</label><select value={form.model} onChange={e=>setForm({...form,model:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"><option>Llama-3-Kor</option><option>GPT-OSS-120B</option><option>EXAONE-3.0</option><option>Solar-10.7B</option><option>Gemma-2-9B</option></select></div>
            <div><label className="block text-sm font-medium mb-1">학습 방법</label><select value={form.method} onChange={e=>setForm({...form,method:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"><option>QLoRA</option><option>LoRA</option><option>Full-FT</option><option>DPO</option><option>RLHF</option></select></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">데이터셋</label><input value={form.dataset} onChange={e=>setForm({...form,dataset:e.target.value})} placeholder="데이터셋 이름" className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <div className="grid grid-cols-4 gap-4">
            <div><label className="block text-sm font-medium mb-1">Learning Rate</label><input value={form.lr} onChange={e=>setForm({...form,lr:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm font-mono"/></div>
            <div><label className="block text-sm font-medium mb-1">에폭</label><input type="number" value={form.epochs} onChange={e=>setForm({...form,epochs:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
            <div><label className="block text-sm font-medium mb-1">배치 크기</label><select value={form.batch} onChange={e=>setForm({...form,batch:+e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"><option>8</option><option>16</option><option>32</option><option>64</option></select></div>
            <div><label className="block text-sm font-medium mb-1">GPU</label><select value={form.gpu} onChange={e=>setForm({...form,gpu:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"><option>A100 x2</option><option>A100 x4</option><option>A100 x8</option></select></div>
          </div>
          <button onClick={()=>{setJobs(p=>[{id:`JOB-${993+p.length}`,model:form.model,method:form.method,dataset:form.dataset||'Custom',progress:0,status:'대기 중',lr:form.lr,epochs:`0/${form.epochs}`,batch:form.batch,gpu:form.gpu},...p]);setShowCreate(false);toast('학습 작업이 생성되었습니다');}} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm">생성</button>
        </div>
      </Modal>
      <Modal isOpen={!!detail} onClose={()=>setDetail(null)} title={`${detail?.id} 상세`} size="lg">
        {detail&&<div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">{[['모델',detail.model],['방법',detail.method],['데이터셋',detail.dataset],['Learning Rate',detail.lr],['에폭',detail.epochs],['배치 크기',detail.batch],['GPU',detail.gpu],['진행률',`${detail.progress}%`]].map(([k,v],i)=>(
            <div key={i} className="bg-gray-50 p-3 rounded-lg"><div className="text-xs text-gray-400">{k}</div><div className="font-medium">{v}</div></div>
          ))}</div>
          <div><StatusBadge status={detail.status}/></div>
        </div>}
      </Modal>
      <ConfirmDialog isOpen={!!confirmStop} onClose={()=>setConfirmStop(null)} onConfirm={()=>{setJobs(p=>p.map(x=>x.id===confirmStop.id?{...x,status:'중지됨'}:x));setConfirmStop(null);toast('학습이 중지되었습니다','info');}} title="학습 중지" message={`${confirmStop?.id} 작업을 중지하시겠습니까?`} confirmText="중지" danger/>
    </PageShell>
  );
};

export const VlmTraining = () => {
  const toast=useToast();
  const [jobs,setJobs]=useState([
    {id:'VLM-101',model:'LLaVA-1.6-13B',resolution:'336x336',epochs:'10/10',progress:100,status:'학습 완료',dataset:'REB_Image_QA',gpu:'A100 x2',created:'2026-02-08'},
    {id:'VLM-102',model:'InternVL-2-8B',resolution:'448x448',epochs:'4/20',progress:20,status:'학습 중',dataset:'Safety_Image_v2',gpu:'A100 x4',created:'2026-02-10'},
    {id:'VLM-103',model:'Qwen-VL-Chat',resolution:'224x224',epochs:'0/15',progress:0,status:'대기 중',dataset:'Equipment_Manual_Img',gpu:'A100 x2',created:'2026-02-11'},
  ]);
  const [showCreate,setShowCreate]=useState(false);const [detail,setDetail]=useState(null);
  const [form,setForm]=useState({model:'LLaVA-1.6-13B',resolution:'336x336',epochs:10,dataset:'',gpu:'A100 x2'});
  return (
    <PageShell breadcrumb={['트레이너','VLM']} title="시각 언어 모델 (VLM) 학습" action={<button onClick={()=>setShowCreate(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"><Plus size={16} className="mr-1"/>새 학습 작업</button>}>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[{l:'전체 작업',v:jobs.length,c:'bg-blue-50 text-blue-700'},{l:'학습 중',v:jobs.filter(j=>j.status==='학습 중').length,c:'bg-green-50 text-green-700'},{l:'완료',v:jobs.filter(j=>j.status==='학습 완료').length,c:'bg-purple-50 text-purple-700'}].map((s,i)=>(
          <div key={i} className={`p-4 rounded-xl ${s.c}`}><div className="text-2xl font-bold">{s.v}</div><div className="text-xs mt-1 opacity-80">{s.l}</div></div>
        ))}
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr>
          <th className="px-4 py-3 text-left">Job ID</th><th className="px-4 py-3 text-left">모델</th><th className="px-4 py-3 text-left">해상도</th><th className="px-4 py-3 text-left">에폭</th><th className="px-4 py-3 text-left">진행률</th><th className="px-4 py-3 text-left">상태</th><th className="px-4 py-3 text-center">액션</th>
        </tr></thead><tbody className="divide-y">{jobs.map(j=>(
          <tr key={j.id} className="hover:bg-gray-50 cursor-pointer" onClick={()=>setDetail(j)}>
            <td className="px-4 py-3 font-mono text-xs">{j.id}</td><td className="px-4 py-3 font-medium">{j.model}</td><td className="px-4 py-3">{j.resolution}</td><td className="px-4 py-3">{j.epochs}</td>
            <td className="px-4 py-3"><div className="flex items-center space-x-2"><div className="w-full bg-gray-200 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${j.status==='학습 완료'?'bg-green-500':j.status==='학습 중'?'bg-blue-500 animate-pulse':'bg-gray-400'}`} style={{width:`${j.progress}%`}}/></div><span className="text-xs text-gray-500 w-8">{j.progress}%</span></div></td>
            <td className="px-4 py-3"><StatusBadge status={j.status}/></td>
            <td className="px-4 py-3 text-center" onClick={e=>e.stopPropagation()}>{j.status==='학습 중'&&<button onClick={()=>{setJobs(p=>p.map(x=>x.id===j.id?{...x,status:'중지됨'}:x));toast('학습이 중지되었습니다','info');}} className="text-xs text-red-500 hover:underline">중지</button>}{j.status==='대기 중'&&<button onClick={()=>{setJobs(p=>p.map(x=>x.id===j.id?{...x,status:'학습 중',progress:5}:x));toast('학습이 시작되었습니다');}} className="text-xs text-blue-600 hover:underline">시작</button>}</td>
          </tr>
        ))}</tbody></table>
      </div>
      <Modal isOpen={showCreate} onClose={()=>setShowCreate(false)} title="새 VLM 학습 작업" size="md">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">모델</label><select value={form.model} onChange={e=>setForm({...form,model:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"><option>LLaVA-1.6-13B</option><option>InternVL-2-8B</option><option>Qwen-VL-Chat</option></select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">해상도</label><select value={form.resolution} onChange={e=>setForm({...form,resolution:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"><option>224x224</option><option>336x336</option><option>448x448</option></select></div>
            <div><label className="block text-sm font-medium mb-1">에폭 수</label><input type="number" value={form.epochs} onChange={e=>setForm({...form,epochs:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">데이터셋</label><input value={form.dataset} onChange={e=>setForm({...form,dataset:e.target.value})} placeholder="데이터셋 이름" className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <div><label className="block text-sm font-medium mb-1">GPU</label><select value={form.gpu} onChange={e=>setForm({...form,gpu:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"><option>A100 x2</option><option>A100 x4</option><option>A100 x8</option></select></div>
          <button onClick={()=>{const nj={id:`VLM-${104+jobs.length}`,model:form.model,resolution:form.resolution,epochs:`0/${form.epochs}`,progress:0,status:'대기 중',dataset:form.dataset||'Custom',gpu:form.gpu,created:'2026-02-11'};setJobs(p=>[nj,...p]);setShowCreate(false);toast('VLM 학습 작업이 생성되었습니다');}} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm">생성</button>
        </div>
      </Modal>
      <Modal isOpen={!!detail} onClose={()=>setDetail(null)} title={`${detail?.id} 상세 정보`} size="lg">
        {detail&&<div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">{[['모델',detail.model],['해상도',detail.resolution],['에폭',detail.epochs],['GPU',detail.gpu],['데이터셋',detail.dataset],['생성일',detail.created]].map(([k,v],i)=>(
            <div key={i} className="bg-gray-50 p-3 rounded-lg"><div className="text-xs text-gray-400">{k}</div><div className="font-medium">{v}</div></div>
          ))}</div>
          <div className="bg-gray-50 p-4 rounded-lg"><div className="flex justify-between mb-2"><span className="text-sm font-medium">학습 진행률</span><span className="text-sm font-bold text-blue-600">{detail.progress}%</span></div>
            <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{width:`${detail.progress}%`}}/></div></div>
          <div><StatusBadge status={detail.status}/></div>
        </div>}
      </Modal>
    </PageShell>
  );
};

export const EmbeddingPage = () => {
  const toast=useToast();
  const [jobs,setJobs]=useState(MOCK_EMBEDDING_JOBS.map(j=>({...j})));
  const [search,setSearch]=useState('');const [detail,setDetail]=useState(null);const [showCreate,setShowCreate]=useState(false);
  const [form,setForm]=useState({name:'',plan:'Fine-Tune',gpu:'A100 x1'});
  const filtered=jobs.filter(j=>j.name.toLowerCase().includes(search.toLowerCase())||j.creator.includes(search));
  return (
    <PageShell breadcrumb={['트레이너','임베딩']}>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold">학습 임베딩 목록</h2>
        <button onClick={()=>setShowCreate(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"><Plus size={16} className="mr-1"/>학습 임베딩 생성</button>
      </div>
      <div className="flex items-center space-x-2 mb-4">
        <select className="border rounded-lg px-3 py-2 text-sm bg-white"><option>제목</option><option>제작자</option></select>
        <div className="relative flex-1 max-w-xs"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="검색어를 입력해 주세요" className="pl-9 pr-3 py-2 border rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"/><Search size={16} className="absolute left-3 top-2.5 text-gray-400"/></div>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-gray-50 text-xs text-gray-500"><tr>
          <th className="px-4 py-3 text-left">ID</th><th className="px-4 py-3 text-left">제목</th><th className="px-4 py-3 text-left">유형</th>
          <th className="px-4 py-3 text-left">제작자</th><th className="px-4 py-3 text-left">관리 그룹</th><th className="px-4 py-3 text-left">등록일시</th>
          <th className="px-4 py-3 text-left">GPU</th><th className="px-4 py-3 text-center">텐서보드</th><th className="px-4 py-3 text-center">학습 상태</th><th className="px-4 py-3 text-center">액션</th>
        </tr></thead><tbody className="divide-y">{filtered.map(j=>(
          <tr key={j.id} className="hover:bg-gray-50 cursor-pointer" onClick={()=>setDetail(j)}>
            <td className="px-4 py-3 text-gray-500">{j.id}</td><td className="px-4 py-3 font-medium">{j.name}</td><td className="px-4 py-3 text-gray-500">{j.plan}</td>
            <td className="px-4 py-3"><div className="font-medium">{j.creator}</div><div className="text-xs text-gray-400">admin</div></td>
            <td className="px-4 py-3">{j.dept}</td><td className="px-4 py-3 text-gray-500 text-xs font-mono">{j.date}</td>
            <td className="px-4 py-3 text-xs">{j.gpu}</td>
            <td className="px-4 py-3 text-center"><span className={`inline-flex items-center text-xs ${j.tbStatus==='실행 중'?'text-green-600':'text-gray-400'}`}><span className={`w-1.5 h-1.5 rounded-full mr-1 ${j.tbStatus==='실행 중'?'bg-green-500':'bg-gray-400'}`}/>{j.tbStatus}</span></td>
            <td className="px-4 py-3 text-center"><StatusBadge status={j.status}/></td>
            <td className="px-4 py-3 text-center" onClick={e=>e.stopPropagation()}>
              {j.status==='학습 중'&&<button onClick={()=>{setJobs(p=>p.map(x=>x.id===j.id?{...x,status:'중지됨'}:x));toast('학습이 중지되었습니다','info');}} className="text-xs text-red-500 hover:underline">중지</button>}
              {(j.status==='학습 완료'||j.tbStatus==='실행 중')&&<button onClick={()=>toast('텐서보드를 엽니다')} className="text-xs text-blue-600 hover:underline">텐서보드</button>}
            </td>
          </tr>
        ))}</tbody></table>
      </div>
      <Modal isOpen={showCreate} onClose={()=>setShowCreate(false)} title="학습 임베딩 생성" size="md">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">제목</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">유형</label><select value={form.plan} onChange={e=>setForm({...form,plan:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"><option>Fine-Tune</option><option>Pre-Train</option><option>Distillation</option></select></div>
            <div><label className="block text-sm font-medium mb-1">GPU</label><select value={form.gpu} onChange={e=>setForm({...form,gpu:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"><option>A100 x1</option><option>A100 x2</option><option>A100 x4</option></select></div>
          </div>
          <button onClick={()=>{if(!form.name)return;setJobs(p=>[{id:p.length+1,name:form.name,plan:form.plan,creator:ADMIN_PERSONA.name,dept:ADMIN_PERSONA.dept,date:'2026-02-11',gpu:form.gpu,tbStatus:'정지',status:'대기 중'},...p]);setShowCreate(false);setForm({name:'',plan:'Fine-Tune',gpu:'A100 x1'});toast('임베딩 학습이 생성되었습니다');}} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm">생성</button>
        </div>
      </Modal>
      <Modal isOpen={!!detail} onClose={()=>setDetail(null)} title={detail?.name} size="lg">
        {detail&&<div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">{[['유형',detail.plan],['제작자',detail.creator],['관리 그룹',detail.dept],['GPU',detail.gpu],['등록일',detail.date],['텐서보드',detail.tbStatus]].map(([k,v],i)=>(
            <div key={i} className="bg-gray-50 p-3 rounded-lg"><div className="text-xs text-gray-400">{k}</div><div className="font-medium">{v}</div></div>
          ))}</div>
          <div><StatusBadge status={detail.status}/></div>
        </div>}
      </Modal>
    </PageShell>
  );
};

export const RerankingPage = () => {
  const toast=useToast();
  const [models,setModels]=useState([
    {id:1,name:'BGE-Reranker-v2',desc:'BAAI 기반 한국어 리랭킹 모델',topK:5,threshold:0.7,active:true,accuracy:92.4,latency:'15ms'},
    {id:2,name:'Cross-Encoder-KoE5',desc:'한국어 특화 Cross-Encoder',topK:3,threshold:0.8,active:true,accuracy:89.1,latency:'22ms'},
    {id:3,name:'ColBERT-v2-Kor',desc:'ColBERT 기반 다단계 리랭킹',topK:10,threshold:0.6,active:false,accuracy:87.5,latency:'35ms'},
  ]);
  const [showAdd,setShowAdd]=useState(false);const [editModel,setEditModel]=useState(null);
  const [form,setForm]=useState({name:'',desc:'',topK:5,threshold:0.7});
  return (
    <PageShell breadcrumb={['트레이너','리랭킹']} title="Cross-Encoder 리랭킹 학습" action={<button onClick={()=>setShowAdd(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"><Plus size={16} className="mr-1"/>모델 추가</button>}>
      <div className="grid grid-cols-3 gap-4">
        {models.map(m=>(
          <div key={m.id} className={`bg-white p-5 rounded-xl border ${m.active?'border-blue-200':'border-gray-200 opacity-70'} transition-all`}>
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-sm">{m.name}</h3>
              <ToggleSwitch on={m.active} onClick={()=>{setModels(p=>p.map(x=>x.id===m.id?{...x,active:!x.active}:x));toast(m.active?`${m.name} 비활성화됨`:`${m.name} 활성화됨`,m.active?'info':'success');}}/>
            </div>
            <p className="text-xs text-gray-500 mb-3">{m.desc}</p>
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div className="bg-gray-50 p-2 rounded"><span className="text-gray-400">Top-K: </span><span className="font-bold">{m.topK}</span></div>
              <div className="bg-gray-50 p-2 rounded"><span className="text-gray-400">임계값: </span><span className="font-bold">{m.threshold}</span></div>
              <div className="bg-blue-50 p-2 rounded"><span className="text-blue-400">정확도: </span><span className="font-bold text-blue-700">{m.accuracy}%</span></div>
              <div className="bg-green-50 p-2 rounded"><span className="text-green-400">지연: </span><span className="font-bold text-green-700">{m.latency}</span></div>
            </div>
            <button onClick={()=>setEditModel(m)} className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium text-xs hover:bg-gray-200 transition-colors">설정 변경</button>
          </div>
        ))}
      </div>
      <Modal isOpen={showAdd} onClose={()=>setShowAdd(false)} title="리랭킹 모델 추가" size="md">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">모델명</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <div><label className="block text-sm font-medium mb-1">설명</label><input value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Top-K</label><input type="number" value={form.topK} onChange={e=>setForm({...form,topK:+e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
            <div><label className="block text-sm font-medium mb-1">임계값</label><input type="number" step="0.1" value={form.threshold} onChange={e=>setForm({...form,threshold:+e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          </div>
          <button onClick={()=>{if(!form.name)return;setModels(p=>[...p,{id:Date.now(),name:form.name,desc:form.desc,topK:form.topK,threshold:form.threshold,active:true,accuracy:0,latency:'-'}]);setShowAdd(false);setForm({name:'',desc:'',topK:5,threshold:0.7});toast('리랭킹 모델이 추가되었습니다');}} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm">추가</button>
        </div>
      </Modal>
      <Modal isOpen={!!editModel} onClose={()=>setEditModel(null)} title={`${editModel?.name} 설정`} size="md">
        {editModel&&<div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Top-K</label><input type="number" value={editModel.topK} onChange={e=>setEditModel({...editModel,topK:+e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <div><label className="block text-sm font-medium mb-1">임계값 (Threshold)</label><input type="number" step="0.05" value={editModel.threshold} onChange={e=>setEditModel({...editModel,threshold:+e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <button onClick={()=>{setModels(p=>p.map(x=>x.id===editModel.id?{...x,topK:editModel.topK,threshold:editModel.threshold}:x));setEditModel(null);toast('설정이 저장되었습니다');}} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm">저장</button>
        </div>}
      </Modal>
    </PageShell>
  );
};

export const LeaderboardPage = () => {
  const toast=useToast();
  const data=[{r:1,m:'GPT-OSS-120B',a:82.4,b:88.9,c:94.1,d:240},{r:2,m:'Llama-3-Kor-70B',a:79.1,b:85.2,c:91.5,d:120},{r:3,m:'EXAONE-3.0-7.8B',a:72.3,b:78.6,c:88.2,d:80},{r:4,m:'Solar-10.7B',a:70.5,b:76.1,c:86.9,d:95},{r:5,m:'Gemma-2-9B',a:68.2,b:74.3,c:85.1,d:75}];
  const [sortKey,setSortKey]=useState('r');const [sortAsc,setSortAsc]=useState(true);
  const sorted=[...data].sort((x,y)=>{const va=x[sortKey],vb=y[sortKey];return sortAsc?(va>vb?1:-1):(va<vb?1:-1);});
  const handleSort=k=>{if(sortKey===k)setSortAsc(!sortAsc);else{setSortKey(k);setSortAsc(k==='r'||k==='d');}};
  const arrow=k=>sortKey===k?(sortAsc?' ↑':' ↓'):'';
  return (
    <PageShell breadcrumb={['평가','리더보드']} title="모델 리더보드" action={<button onClick={()=>toast('벤치마크 실행이 시작되었습니다')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"><Play size={16} className="mr-1"/>벤치마크 실행</button>}>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr>
          <th className="px-4 py-3 text-left cursor-pointer hover:text-gray-800 select-none" onClick={()=>handleSort('r')}>순위{arrow('r')}</th>
          <th className="px-4 py-3 text-left">모델</th>
          <th className="px-4 py-3 text-right cursor-pointer hover:text-gray-800 select-none" onClick={()=>handleSort('a')}>MTEB{arrow('a')}</th>
          <th className="px-4 py-3 text-right cursor-pointer hover:text-gray-800 select-none" onClick={()=>handleSort('b')}>KorQuAD{arrow('b')}</th>
          <th className="px-4 py-3 text-right cursor-pointer hover:text-gray-800 select-none" onClick={()=>handleSort('c')}>K-Hate{arrow('c')}</th>
          <th className="px-4 py-3 text-right cursor-pointer hover:text-gray-800 select-none" onClick={()=>handleSort('d')}>Avg Latency{arrow('d')}</th>
        </tr></thead><tbody className="divide-y">{sorted.map((r,i)=>(
          <tr key={r.r} className={`hover:bg-gray-50 ${i===0?'bg-yellow-50/50':''}`}>
            <td className="px-4 py-3 font-bold">{i===0?'🥇':i===1?'🥈':i===2?'🥉':r.r}</td>
            <td className="px-4 py-3 font-medium">{r.m}</td>
            <td className="px-4 py-3 text-right font-bold text-blue-600">{r.a}</td>
            <td className="px-4 py-3 text-right">{r.b}</td>
            <td className="px-4 py-3 text-right">{r.c}</td>
            <td className="px-4 py-3 text-right text-gray-500">{r.d}ms</td>
          </tr>
        ))}</tbody></table>
      </div>
    </PageShell>
  );
};

export const EvalMetricsPage = () => {
  const toast=useToast();const [detail,setDetail]=useState(null);
  const evals=[
    {id:'EVAL-001',model:'GPT-OSS-120B',benchmark:'MTEB',score:82.4,samples:5000,date:'2026-02-10',status:'완료',duration:'4h 20m'},
    {id:'EVAL-002',model:'Llama-3-Kor-70B',benchmark:'KorQuAD',score:85.2,samples:3000,date:'2026-02-09',status:'완료',duration:'2h 15m'},
    {id:'EVAL-003',model:'EXAONE-3.0-7.8B',benchmark:'K-Hate',score:88.2,samples:2000,date:'2026-02-09',status:'완료',duration:'1h 30m'},
    {id:'EVAL-004',model:'Solar-10.7B',benchmark:'MTEB',score:70.5,samples:5000,date:'2026-02-08',status:'완료',duration:'3h 45m'},
    {id:'EVAL-005',model:'GPT-OSS-120B',benchmark:'전체',score:0,samples:10000,date:'2026-02-11',status:'실행 중',duration:'-'},
  ];
  return (
    <PageShell breadcrumb={['평가','평가지표']} title="성능 평가 지표" action={<button onClick={()=>toast('새 평가 실행이 시작되었습니다')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"><Play size={16} className="mr-1"/>평가 실행</button>}>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[{l:'MTEB (검색)',v:'82.4',c:'bg-blue-50 text-blue-600'},{l:'K-Hatespeech',v:'94.1',c:'bg-green-50 text-green-600'},{l:'KorQuAD 1.0',v:'88.9',c:'bg-purple-50 text-purple-600'},{l:'평균 지연시간',v:'450ms',c:'bg-orange-50 text-orange-600'}].map((m,i)=>(
          <div key={i} className={`p-5 rounded-xl ${m.c}`}><div className="text-2xl font-bold">{m.v}</div><div className="text-xs mt-1 opacity-80">{m.l}</div></div>
        ))}
      </div>
      <h3 className="font-bold mb-3">평가 실행 기록</h3>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr>
          <th className="px-4 py-3 text-left">ID</th><th className="px-4 py-3 text-left">모델</th><th className="px-4 py-3 text-left">벤치마크</th><th className="px-4 py-3 text-right">점수</th><th className="px-4 py-3 text-right">샘플</th><th className="px-4 py-3 text-left">소요시간</th><th className="px-4 py-3 text-left">상태</th>
        </tr></thead><tbody className="divide-y">{evals.map(e=>(
          <tr key={e.id} className="hover:bg-gray-50 cursor-pointer" onClick={()=>setDetail(e)}>
            <td className="px-4 py-3 font-mono text-xs">{e.id}</td><td className="px-4 py-3 font-medium">{e.model}</td><td className="px-4 py-3">{e.benchmark}</td>
            <td className="px-4 py-3 text-right font-bold text-blue-600">{e.score||'-'}</td><td className="px-4 py-3 text-right">{e.samples.toLocaleString()}</td>
            <td className="px-4 py-3 text-gray-500">{e.duration}</td><td className="px-4 py-3"><StatusBadge status={e.status}/></td>
          </tr>
        ))}</tbody></table>
      </div>
      <Modal isOpen={!!detail} onClose={()=>setDetail(null)} title={`${detail?.id} 평가 상세`} size="lg">
        {detail&&<div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">{[['모델',detail.model],['벤치마크',detail.benchmark],['점수',detail.score||'진행 중'],['샘플 수',detail.samples.toLocaleString()],['소요시간',detail.duration],['실행일',detail.date]].map(([k,v],i)=>(
            <div key={i} className="bg-gray-50 p-3 rounded-lg"><div className="text-xs text-gray-400">{k}</div><div className="font-medium">{v}</div></div>
          ))}</div>
          <div><StatusBadge status={detail.status}/></div>
        </div>}
      </Modal>
    </PageShell>
  );
};

// ==================== LLM 관리 ====================
