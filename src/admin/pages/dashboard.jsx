import React, { useState } from 'react';
import { Cpu, Power, RotateCcw } from 'lucide-react';
import { MOCK_GPU_NODES, MOCK_NODES } from '../mocks.js';
import { StatusBadge, Modal, SemiGauge, PageShell, useToast } from '../common.jsx';

export const SystemDashboard = () => {
  const [selectedNode,setSelectedNode]=useState(null);
  const [range,setRange]=useState('24h');   // 파드 정보 조회 구간
  return (
    <PageShell breadcrumb={['대시보드','시스템']}>
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-lg font-bold">클러스터 리소스</h3>
        <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded border">현재</span>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-8">
        <SemiGauge value={5.32} label="Cluster CPU usage"/>
        <SemiGauge value={35.9} label="Cluster Memory Usage"/>
        <SemiGauge value={26.5} label="GPU Power Usage (AVG.)" unit=" W"/>
        <SemiGauge value={58.4} label="Cluster Filesystem"/>
      </div>
      <h3 className="text-lg font-bold mb-2">서버 정보</h3>
      <div className="bg-white rounded-xl border overflow-hidden mb-8">
        <div className="px-4 py-3 bg-gray-50 text-sm font-semibold text-gray-600">Node Information</div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr>
            <th className="px-4 py-3 text-left">nodename</th><th className="px-4 py-3 text-left">instance</th>
            <th className="px-4 py-3 text-left">OS</th><th className="px-4 py-3 text-left">Version</th>
            <th className="px-4 py-3 text-left">Release</th><th className="px-4 py-3 text-right">CPU Usage(%)</th>
            <th className="px-4 py-3 text-right">MEM Usage(%)</th>
          </tr></thead>
          <tbody className="divide-y">{MOCK_NODES.map((n,i)=>(
            <tr key={i} className="hover:bg-gray-50 cursor-pointer" onClick={()=>setSelectedNode(n)}>
              <td className="px-4 py-3 font-medium">{n.name}</td><td className="px-4 py-3 text-gray-500">{n.instance}</td>
              <td className="px-4 py-3">{n.os}</td><td className="px-4 py-3">{n.version}</td>
              <td className="px-4 py-3 text-gray-500 text-xs">{n.release}</td>
              <td className="px-4 py-3 text-right">{n.cpu}</td><td className="px-4 py-3 text-right">{n.mem}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-baseline gap-2"><h3 className="text-lg font-bold">파드 정보</h3><span className="text-xs text-gray-400">최근 {range} 집계</span></div>
        <div className="flex space-x-1">{['1h','6h','24h','7d'].map(t=><button key={t} onClick={()=>setRange(t)} aria-pressed={range===t} className={`px-2.5 py-1 text-xs rounded border transition-colors ${range===t?'border-blue-500 bg-blue-50 text-blue-600 font-bold':'hover:bg-blue-50 hover:text-blue-600'}`}>{t}</button>)}</div>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-gray-50 text-xs text-gray-500"><tr>
          <th className="px-4 py-2 text-left">Pod Name</th><th className="px-4 py-2 text-left">Namespace</th><th className="px-4 py-2 text-right">CPU</th><th className="px-4 py-2 text-right">Memory</th><th className="px-4 py-2 text-left">Status</th>
        </tr></thead><tbody className="divide-y">
          {[{n:'roadq-api-7f8b9c-x2k4p',ns:'production',cpu:'120m',mem:'256Mi',s:'Running'},{n:'llm-serving-gpt-oss-0',ns:'serving',cpu:'4000m',mem:'32Gi',s:'Running'},{n:'embedding-worker-1',ns:'training',cpu:'2000m',mem:'8Gi',s:'Running'},{n:'vector-db-milvus-0',ns:'data',cpu:'500m',mem:'4Gi',s:'Running'},{n:'scheduler-cron-abc12',ns:'system',cpu:'50m',mem:'128Mi',s:'Completed'}].map((p,i)=>(
            <tr key={i} className="hover:bg-gray-50"><td className="px-4 py-2 font-mono text-xs">{p.n}</td><td className="px-4 py-2 text-xs">{p.ns}</td><td className="px-4 py-2 text-right text-xs">{p.cpu}</td><td className="px-4 py-2 text-right text-xs">{p.mem}</td><td className="px-4 py-2"><StatusBadge status={p.s}/></td></tr>
          ))}
        </tbody></table>
      </div>
      <Modal isOpen={!!selectedNode} onClose={()=>setSelectedNode(null)} title={`${selectedNode?.name} 상세 정보`} size="lg">
        {selectedNode&&<div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg"><div className="text-xs text-gray-400">CPU</div><div className="font-bold text-lg">{selectedNode.cpu}%</div></div>
            <div className="bg-gray-50 p-4 rounded-lg"><div className="text-xs text-gray-400">Memory</div><div className="font-bold text-lg">{selectedNode.mem}%</div></div>
            <div className="bg-gray-50 p-4 rounded-lg"><div className="text-xs text-gray-400">OS</div><div className="font-bold">{selectedNode.os} {selectedNode.version}</div></div>
          </div>
          <div className="bg-gray-900 text-green-400 font-mono text-xs p-4 rounded-lg h-48 overflow-y-auto">
            <div className="text-gray-500 border-b border-gray-700 pb-1 mb-2">PID USER PR NI VIRT RES SHR S %CPU %MEM COMMAND</div>
            <div>1234 root 20 0 16.2g 4.1g 124m S 12.0 1.6 python3 train.py</div>
            <div>1452 redis 20 0 4.2g 1.2g 42m S 4.0 0.5 redis-server</div>
            <div>1102 root 20 0 220m 45m 12m S 1.0 0.0 dockerd</div>
          </div>
        </div>}
      </Modal>
    </PageShell>
  );
};

export const ServiceDashboard = () => {
  const toast=useToast();
  const [svcs,setSvcs]=useState([
    {id:1,name:'인증 서비스 (SSO)',desc:'사용자 통합 인증',status:'Healthy',up:'14d 2h',cpu:'12%',mem:'256MB',port:8443},
    {id:2,name:'모델 서빙 API',desc:'LLM 추론 엔드포인트',status:'Healthy',up:'14d 2h',cpu:'68%',mem:'32GB',port:8080},
    {id:3,name:'벡터 DB 서비스',desc:'RAG 검색 엔진',status:'Healthy',up:'14d 2h',cpu:'24%',mem:'4GB',port:19530},
    {id:4,name:'로그 수집기',desc:'시스템/감사 로그',status:'Healthy',up:'14d 2h',cpu:'5%',mem:'512MB',port:5044},
    {id:5,name:'알림 서비스',desc:'Slack/Email 연동',status:'Warning',up:'14d 2h',cpu:'8%',mem:'128MB',port:9090},
    {id:6,name:'작업 스케줄러',desc:'배치 작업 관리',status:'Healthy',up:'14d 2h',cpu:'3%',mem:'256MB',port:8090},
  ]);
  const [detail,setDetail]=useState(null);
  const restart=i=>{setSvcs(p=>p.map((s,j)=>j===i?{...s,status:'Restarting'}:s));setTimeout(()=>setSvcs(p=>p.map((s,j)=>j===i?{...s,status:'Healthy'}:s)),2000);toast('서비스 재시작 중...','info');};
  const healthy=svcs.filter(s=>s.status==='Healthy').length;
  return (
    <PageShell breadcrumb={['대시보드','서비스']} title="서비스 상태 모니터링">
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[{l:'전체 서비스',v:svcs.length,c:'bg-blue-50 text-blue-700'},{l:'정상',v:healthy,c:'bg-green-50 text-green-700'},{l:'주의',v:svcs.length-healthy,c:'bg-yellow-50 text-yellow-700'}].map((s,i)=>(
          <div key={i} className={`p-4 rounded-xl ${s.c}`}><div className="text-2xl font-bold">{s.v}</div><div className="text-xs mt-1 opacity-80">{s.l}</div></div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">{svcs.map((s,i)=>(
        <div key={s.id} className="bg-white p-5 rounded-xl border hover:border-blue-300 transition-all cursor-pointer" onClick={()=>setDetail(s)}>
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${s.status==='Healthy'?'bg-green-500':s.status==='Warning'?'bg-yellow-500':'bg-purple-500 animate-pulse'}`}/>
              <div><div className="font-bold text-sm">{s.name}</div><div className="text-xs text-gray-500">{s.desc}</div></div>
            </div>
            <StatusBadge status={s.status}/>
          </div>
          <div className="flex justify-between items-end pt-3 border-t">
            <span className="text-xs text-gray-400 font-mono">Up: {s.up}</span>
            <button onClick={e=>{e.stopPropagation();restart(i);}} disabled={s.status==='Restarting'} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50">
              <RotateCcw size={14} className={s.status==='Restarting'?'animate-spin':''}/>
            </button>
          </div>
        </div>
      ))}</div>
      <Modal isOpen={!!detail} onClose={()=>setDetail(null)} title={detail?.name} size="md">
        {detail&&<div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">{[['CPU 사용률',detail.cpu],['메모리',detail.mem],['포트',detail.port],['가동시간',detail.up]].map(([k,v],i)=>(
            <div key={i} className="bg-gray-50 p-3 rounded-lg"><div className="text-xs text-gray-400">{k}</div><div className="font-medium">{v}</div></div>
          ))}</div>
          <div><StatusBadge status={detail.status}/></div>
        </div>}
      </Modal>
    </PageShell>
  );
};

export const GpuDashboard = () => {
  const [detailGpu,setDetailGpu]=useState(null);
  const allGpus=MOCK_GPU_NODES.flatMap(n=>n.gpus);
  const avgUtil=Math.round(allGpus.reduce((a,g)=>a+g.util,0)/allGpus.length);
  const avgTemp=Math.round(allGpus.reduce((a,g)=>a+g.temp,0)/allGpus.length);
  const overloaded=allGpus.filter(g=>g.util>90).length;
  return (
    <PageShell breadcrumb={['대시보드','GPU']} title="GPU 클러스터">
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[{l:'총 GPU',v:allGpus.length,c:'bg-blue-50 text-blue-700'},{l:'평균 사용률',v:`${avgUtil}%`,c:'bg-green-50 text-green-700'},{l:'평균 온도',v:`${avgTemp}°C`,c:'bg-orange-50 text-orange-700'},{l:'과부하',v:overloaded,c:overloaded>0?'bg-red-50 text-red-700':'bg-gray-50 text-gray-700'}].map((s,i)=>(
          <div key={i} className={`p-4 rounded-xl ${s.c}`}><div className="text-2xl font-bold">{s.v}</div><div className="text-xs mt-1 opacity-80">{s.l}</div></div>
        ))}
      </div>
      <div className="space-y-6">{MOCK_GPU_NODES.map(node=>(
        <div key={node.id} className="bg-white rounded-xl border overflow-hidden">
          <div className="px-5 py-4 bg-gray-50 border-b flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Cpu className="text-gray-500" size={20}/>
              <div><h3 className="font-bold">{node.name}</h3><p className="text-xs text-gray-500">{node.model} x{node.count} ({node.memory})</p></div>
            </div>
          </div>
          <div className="p-5 grid grid-cols-4 gap-4">{node.gpus.map(gpu=>(
            <div key={gpu.id} className="bg-gray-50 rounded-lg p-4 border hover:border-blue-300 transition-colors cursor-pointer" onClick={()=>setDetailGpu({...gpu,node:node.name,model:node.model})}>
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-sm">GPU {gpu.id}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${gpu.util>90?'bg-red-100 text-red-600':'bg-green-100 text-green-600'}`}>{gpu.util>90?'과부하':'정상'}</span>
              </div>
              <div className="mb-3"><div className="flex justify-between text-xs text-gray-500 mb-1"><span>Util</span><span>{gpu.util}%</span></div>
                <div className="w-full bg-gray-200 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{width:`${gpu.util}%`}}/></div></div>
              <div className="mb-3"><div className="flex justify-between text-xs text-gray-500 mb-1"><span>VRAM</span><span>{gpu.memUtil}%</span></div>
                <div className="w-full bg-gray-200 rounded-full h-1.5"><div className="bg-purple-500 h-1.5 rounded-full transition-all" style={{width:`${gpu.memUtil}%`}}/></div></div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2 rounded border text-center"><span className="text-gray-400 block">온도</span><span className={`font-bold ${gpu.temp>80?'text-red-500':''}`}>{gpu.temp}°C</span></div>
                <div className="bg-white p-2 rounded border text-center"><span className="text-gray-400 block">전력</span><span className="font-bold">{gpu.power}W</span></div>
              </div>
            </div>
          ))}</div>
        </div>
      ))}</div>
      <Modal isOpen={!!detailGpu} onClose={()=>setDetailGpu(null)} title={`GPU ${detailGpu?.id} 상세`} size="md">
        {detailGpu&&<div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">{[['노드',detailGpu.node],['모델',detailGpu.model],['GPU ID',detailGpu.id],['사용률',`${detailGpu.util}%`],['VRAM',`${detailGpu.memUtil}%`],['온도',`${detailGpu.temp}°C`],['전력',`${detailGpu.power}W`]].map(([k,v],i)=>(
            <div key={i} className="bg-gray-50 p-3 rounded-lg"><div className="text-xs text-gray-400">{k}</div><div className="font-medium">{v}</div></div>
          ))}</div>
        </div>}
      </Modal>
    </PageShell>
  );
};

export const DashboardTrainer = () => {
  const [period,setPeriod]=useState('주간');
  return (
    <PageShell breadcrumb={['대시보드','트레이너']} title="학습 작업 현황">
      <div className="flex space-x-1 mb-4">{['일간','주간','월간'].map(p=>(
        <button key={p} onClick={()=>setPeriod(p)} className={`px-4 py-1.5 text-sm rounded-lg ${period===p?'bg-blue-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{p}</button>
      ))}</div>
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl border">
          <h3 className="font-bold mb-4">{period} 학습 요약</h3>
          <div className="space-y-3">
            {[{label:'완료된 작업',count:period==='일간'?5:period==='주간'?24:96,color:'text-blue-700 bg-blue-50'},{label:'실패한 작업',count:period==='일간'?0:period==='주간'?2:8,color:'text-red-600 bg-red-50'},{label:'대기 중 작업',count:period==='일간'?1:period==='주간'?3:5,color:'text-yellow-600 bg-yellow-50'}].map((s,i)=>(
              <div key={i} className={`flex justify-between items-center p-4 rounded-lg border ${s.color}`}>
                <span className="text-sm font-medium">{s.label}</span><span className="font-bold text-lg">{s.count}건</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border">
          <h3 className="font-bold mb-4">리소스 배분 현황</h3>
          <div className="flex items-center justify-center space-x-8 py-4">
            <div className="relative w-40 h-40 rounded-full" style={{background:'conic-gradient(#3b82f6 0% 60%, #8b5cf6 60% 80%, #10b981 80% 95%, #e2e8f0 95% 100%)'}}>
              <div className="absolute inset-0 m-auto w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center shadow-inner"><span className="text-2xl font-bold">95%</span><span className="text-xs text-gray-500">Total</span></div>
            </div>
            <div className="space-y-3 text-sm">
              {[{l:'LLM 학습',v:60,c:'#3b82f6'},{l:'RAG 임베딩',v:20,c:'#8b5cf6'},{l:'추론',v:15,c:'#10b981'},{l:'대기',v:5,c:'#e2e8f0'}].map((d,i)=>(
                <div key={i} className="flex items-center"><span className="w-3 h-3 rounded-full mr-2" style={{backgroundColor:d.c}}/><span className="text-gray-500 w-20">{d.l}</span><span className="font-bold">{d.v}%</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <h3 className="font-bold mb-3">최근 학습 작업</h3>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-gray-50 text-xs text-gray-500"><tr>
          <th className="px-4 py-2 text-left">Job ID</th><th className="px-4 py-2 text-left">모델</th><th className="px-4 py-2 text-left">유형</th><th className="px-4 py-2 text-left">시작</th><th className="px-4 py-2 text-left">상태</th>
        </tr></thead><tbody className="divide-y">
          {[{id:'JOB-992',m:'GPT-OSS-120B',t:'LoRA',d:'02-10 14:30',s:'학습 중'},{id:'JOB-991',m:'Llama-3-Kor',t:'QLoRA',d:'02-09 09:00',s:'학습 완료'},{id:'VLM-102',m:'InternVL-2-8B',t:'VLM',d:'02-10 10:00',s:'학습 중'},{id:'EMB-003',m:'KoE5-large',t:'임베딩',d:'02-08 16:00',s:'학습 완료'}].map(j=>(
            <tr key={j.id} className="hover:bg-gray-50"><td className="px-4 py-2 font-mono text-xs">{j.id}</td><td className="px-4 py-2 font-medium">{j.m}</td><td className="px-4 py-2">{j.t}</td><td className="px-4 py-2 text-gray-500 text-xs">{j.d}</td><td className="px-4 py-2"><StatusBadge status={j.s}/></td></tr>
          ))}
        </tbody></table>
      </div>
    </PageShell>
  );
};

// ==================== DEV PAGES ====================
