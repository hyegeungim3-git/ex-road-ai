import React, { useState, useEffect } from 'react';
import { Database, Cpu, Plus, Search, Shield, Save, Trash2, Eye, Check, XCircle, Filter, Power, RotateCcw, Bell, Gauge, TestTube2, TrendingUp, ThumbsUp, ThumbsDown, Edit3, AlertTriangle } from 'lucide-react';
import { MOCK_GUARDRAIL_LOGS, MOCK_LLM_ADMIN_MODELS, MOCK_FILTER_RULES, MOCK_RERANK_PIPELINES, MOCK_RAG_GLOBAL, MOCK_RAG_AREAS, MOCK_OUTPUT_GUARDRAILS, MOCK_CONFIDENCE_CONFIG, MOCK_QUALITY_REVIEWS, ADMIN_PERSONA } from '../mocks.js';
import { StatusBadge, Modal, PageShell, useToast, ConfirmDialog, ToggleSwitch } from '../common.jsx';
import { getActiveDomainId } from '../../domains/index.js';
import { demoStorage, makeDomainStorageKey } from '../../core/demoStorage.js';

const FILTER_RULES_KEY = 'roadq_filter_rules';
const OUTPUT_GUARDRAILS_KEY = 'roadq_output_guardrails';

export const LlmManagePage = () => {
  const toast=useToast();
  const [models,setModels]=useState(MOCK_LLM_ADMIN_MODELS.map(m=>({...m,promptHistory:[...m.promptHistory]})));
  const [selected,setSelected]=useState(null);
  const [detailTab,setDetailTab]=useState('info');
  const [showRegister,setShowRegister]=useState(false);
  const [confirmDel,setConfirmDel]=useState(null);
  const [editPrompt,setEditPrompt]=useState('');
  const [editNote,setEditNote]=useState('');
  const [expandHist,setExpandHist]=useState(null);
  const [form,setForm]=useState({name:'',baseModel:'',version:'v1.0.0',desc:'',temperature:'0.5',maxTokens:'2048',topP:'0.9',contextWindow:'8K',systemPrompt:''});
  const sel=selected?models.find(m=>m.id===selected):null;

  const handleSelect=(m)=>{setSelected(m.id);setEditPrompt(m.systemPrompt);setEditNote('');setDetailTab('info');setExpandHist(null);};

  const savePrompt=()=>{
    if(!sel)return;
    const parts=sel.version.split('.');const newMinor=parseInt(parts[2]||0)+1;
    const newVer=`${parts[0]}.${parts[1]}.${newMinor}`;
    const newEntry={ver:newVer,date:new Date().toISOString().slice(0,16).replace('T',' '),author:ADMIN_PERSONA.name,note:editNote||'프롬프트 수정',content:editPrompt};
    setModels(prev=>prev.map(m=>m.id===sel.id?{...m,systemPrompt:editPrompt,version:newVer,promptHistory:[newEntry,...m.promptHistory]}:m));
    toast(`시스템 프롬프트 저장됨 (${newVer})`);setEditNote('');
  };

  const rollback=(h)=>{
    if(!sel)return;
    setModels(prev=>prev.map(m=>m.id===sel.id?{...m,systemPrompt:h.content,version:h.ver}:m));
    setEditPrompt(h.content);setDetailTab('prompt');
    toast(`${h.ver}으로 롤백되었습니다`,'info');
  };

  const toggleActive=(m)=>{
    setModels(prev=>prev.map(x=>x.id===m.id?{...x,status:x.status==='Active'?'Inactive':'Active'}:x));
    if(selected===m.id) setSelected(null);
    toast(`${m.name} ${m.status==='Active'?'비활성화':'활성화'}됨`,m.status==='Active'?'info':'success');
  };

  const registerModel=()=>{
    if(!form.name||!form.baseModel){toast('모델명과 베이스 모델은 필수입니다','error');return;}
    const newM={id:`m-${Date.now()}`,name:form.name,baseModel:form.baseModel,version:form.version,desc:form.desc,
      status:'Inactive',temperature:parseFloat(form.temperature)||0.5,maxTokens:parseInt(form.maxTokens)||2048,
      topP:parseFloat(form.topP)||0.9,contextWindow:form.contextWindow,systemPrompt:form.systemPrompt,promptHistory:[]};
    setModels(prev=>[...prev,newM]);setShowRegister(false);
    setForm({name:'',baseModel:'',version:'v1.0.0',desc:'',temperature:'0.5',maxTokens:'2048',topP:'0.9',contextWindow:'8K',systemPrompt:''});
    toast('모델이 등록되었습니다');
  };

  return (
    <PageShell breadcrumb={['관리자 전용','LLM 관리']} title="LLM 모델 관리"
      action={<button onClick={()=>setShowRegister(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5"><Plus size={15}/>모델 등록</button>}>
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          ['등록 모델',models.length,'개','text-blue-600'],
          ['활성 모델',models.filter(m=>m.status==='Active').length,'개','text-green-600'],
          ['비활성 모델',models.filter(m=>m.status==='Inactive').length,'개','text-gray-500'],
          ['프롬프트 총 버전',models.reduce((a,m)=>a+m.promptHistory.length,0),'건','text-purple-600'],
        ].map(([label,val,unit,cls])=>(
          <div key={label} className="bg-white rounded-xl border p-4">
            <div className="text-xs text-gray-400 mb-1">{label}</div>
            <div className={`text-2xl font-extrabold ${cls}`}>{val}<span className="text-sm font-normal ml-1 text-gray-400">{unit}</span></div>
          </div>
        ))}
      </div>
      <div className="flex gap-6" style={{height:'calc(100vh - 300px)'}}>
        {/* Left: model cards */}
        <div className="w-72 shrink-0 overflow-y-auto space-y-3 pr-1">
          {models.map(m=>(
            <div key={m.id} onClick={()=>handleSelect(m)}
              className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all hover:shadow-md ${sel?.id===m.id?'border-blue-500 shadow-md':'border-slate-200'}`}>
              <div className="flex items-start justify-between mb-1 gap-1">
                <div className="font-bold text-sm text-slate-800 flex-1 break-all">{m.name}</div>
                <StatusBadge status={m.status==='Active'?'Running':'Stopped'}/>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mb-1.5 truncate">Base: {m.baseModel}</div>
              <div className="text-xs text-slate-500 line-clamp-2 mb-2">{m.desc||'(설명 없음)'}</div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[m.version,`T=${m.temperature}`,m.contextWindow].map(t=>(
                  <span key={t} className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded font-mono">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Right: detail panel */}
        {sel ? (
          <div className="flex-1 bg-white rounded-xl border flex flex-col overflow-hidden">
            <div className="px-6 py-3 border-b bg-slate-50 flex items-center justify-between">
              <div>
                <div className="font-bold">{sel.name}</div>
                <div className="text-xs text-slate-400 font-mono">Base: {sel.baseModel} · {sel.version}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={()=>toggleActive(sel)} className={`text-xs px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1 ${sel.status==='Active'?'bg-red-50 text-red-600 border-red-200 hover:bg-red-100':'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'}`}>
                  <Power size={12}/>{sel.status==='Active'?'비활성화':'활성화'}
                </button>
                <button onClick={()=>setConfirmDel(sel)} className="text-xs px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1 bg-white text-red-500 border-red-200 hover:bg-red-50"><Trash2 size={12}/>삭제</button>
              </div>
            </div>
            <div className="flex border-b">
              {[['info','기본 정보'],['prompt','시스템 프롬프트'],['history','변경 이력']].map(([id,label])=>(
                <button key={id} onClick={()=>setDetailTab(id)}
                  className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${detailTab===id?'border-blue-600 text-blue-700':'border-transparent text-slate-500 hover:text-slate-800'}`}>
                  {label}{id==='history'&&<span className="ml-1.5 bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded-full">{sel.promptHistory.length}</span>}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {detailTab==='info'&&(
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[['모델명',sel.name],['베이스 모델 *',sel.baseModel],['버전',sel.version],['컨텍스트 윈도우',sel.contextWindow]].map(([k,v])=>(
                      <div key={k} className="bg-slate-50 rounded-lg p-3">
                        <div className="text-xs text-slate-400 mb-0.5">{k}</div>
                        <div className="font-semibold text-sm text-slate-800 font-mono break-all">{v}</div>
                      </div>
                    ))}
                    <div className="col-span-2 bg-slate-50 rounded-lg p-3">
                      <div className="text-xs text-slate-400 mb-0.5">설명</div>
                      <div className="text-sm text-slate-700">{sel.desc||'(없음)'}</div>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <div className="text-xs text-blue-500 font-bold uppercase tracking-wider mb-3">파라미터 설정값</div>
                    <div className="grid grid-cols-3 gap-4">
                      {[['Temperature',sel.temperature],['Top-P',sel.topP],['Max Tokens',sel.maxTokens]].map(([k,v])=>(
                        <div key={k}>
                          <div className="text-xs text-slate-500 mb-0.5">{k}</div>
                          <div className="font-extrabold text-xl text-blue-700">{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {detailTab==='prompt'&&(
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-700">공통 시스템 프롬프트</div>
                    <span className="text-xs text-slate-400">현재: <span className="font-mono font-bold text-blue-600">{sel.version}</span></span>
                  </div>
                  <textarea value={editPrompt} onChange={e=>setEditPrompt(e.target.value)} rows={10}
                    className="w-full border rounded-xl px-4 py-3 text-sm font-mono bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"/>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">변경 사유 (버전 메모)</label>
                    <input value={editNote} onChange={e=>setEditNote(e.target.value)} placeholder="예: 보안 규정 4항 추가"
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                  </div>
                  <button onClick={savePrompt} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700">
                    <Save size={14}/>저장 및 버전 업
                  </button>
                </div>
              )}
              {detailTab==='history'&&(
                <div>
                  <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4 flex items-center gap-2">
                    <AlertTriangle size={13}/>이전 버전으로 롤백 시 현재 프롬프트가 즉시 교체됩니다. 신중하게 진행하세요.
                  </div>
                  {sel.promptHistory.length===0 && <div className="text-sm text-slate-400 text-center py-12">변경 이력이 없습니다.</div>}
                  <div className="space-y-3">
                    {sel.promptHistory.map((h,i)=>(
                      <div key={i} className={`rounded-xl border-2 p-4 ${i===0?'border-blue-300 bg-blue-50/40':'border-slate-200'}`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-blue-700 text-sm">{h.ver}</span>
                            {i===0&&<span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">현재</span>}
                            <span className="text-xs text-slate-400">{h.date} · {h.author}</span>
                          </div>
                          {i>0&&(
                            <button onClick={()=>rollback(h)} className="text-xs text-orange-600 border border-orange-200 bg-orange-50 px-3 py-1 rounded-lg font-semibold flex items-center gap-1 hover:bg-orange-100">
                              <RotateCcw size={11}/>롤백
                            </button>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mb-1.5"><span className="font-semibold text-slate-700">변경 사유: </span>{h.note}</div>
                        <button onClick={()=>setExpandHist(expandHist===h.ver?null:h.ver)}
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                          <Eye size={11}/>{expandHist===h.ver?'내용 닫기':'내용 보기'}
                        </button>
                        {expandHist===h.ver&&(
                          <pre className="mt-2 bg-slate-100 rounded-lg p-3 text-xs font-mono whitespace-pre-wrap text-slate-700 max-h-36 overflow-y-auto">{h.content}</pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ):(
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-slate-400"><Cpu size={42} className="mx-auto mb-3 opacity-20"/><p className="text-sm">좌측에서 모델을 선택하세요</p></div>
          </div>
        )}
      </div>
      {/* Register Modal */}
      <Modal isOpen={showRegister} onClose={()=>setShowRegister(false)} title="LLM 모델 등록" size="md">
        <div className="space-y-4">
          <div><label className="block text-sm font-semibold mb-1">모델명 <span className="text-red-500">*</span></label>
            <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="예: GPT-OSS-120B" className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <div><label className="block text-sm font-semibold mb-1">베이스 모델 <span className="text-red-500">*</span></label>
            <input value={form.baseModel} onChange={e=>setForm({...form,baseModel:e.target.value})} placeholder="예: Meta-Llama-3-405B-Instruct" className="w-full border rounded-lg px-3 py-2 text-sm font-mono"/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-semibold mb-1">버전</label>
              <input value={form.version} onChange={e=>setForm({...form,version:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm font-mono"/></div>
            <div><label className="block text-sm font-semibold mb-1">컨텍스트 윈도우</label>
              <select value={form.contextWindow} onChange={e=>setForm({...form,contextWindow:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                {['4K','8K','32K','128K','200K'].map(v=><option key={v}>{v}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[['temperature','Temperature'],['topP','Top-P'],['maxTokens','Max Tokens']].map(([k,label])=>(
              <div key={k}><label className="block text-sm font-semibold mb-1">{label}</label>
                <input value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
            ))}
          </div>
          <div><label className="block text-sm font-semibold mb-1">설명</label>
            <textarea value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm resize-none"/></div>
          <div><label className="block text-sm font-semibold mb-1">초기 시스템 프롬프트</label>
            <textarea value={form.systemPrompt} onChange={e=>setForm({...form,systemPrompt:e.target.value})} rows={3} placeholder="선택 사항 — 나중에 편집 가능" className="w-full border rounded-lg px-3 py-2 text-sm font-mono resize-none"/></div>
          <button onClick={registerModel} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm">등록</button>
        </div>
      </Modal>
      <ConfirmDialog isOpen={!!confirmDel} onClose={()=>setConfirmDel(null)}
        onConfirm={()=>{setModels(p=>p.filter(x=>x.id!==confirmDel.id));if(selected===confirmDel?.id)setSelected(null);setConfirmDel(null);toast('모델이 삭제되었습니다','info');}}
        title="모델 삭제" message={`'${confirmDel?.name}' 모델을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`} confirmText="삭제" danger/>
    </PageShell>
  );
};

// ==================== 필터링 관리 ====================
export const GuardrailFilterPage = () => {
  const toast=useToast();
  const [rules,setRules]=useState(()=>{
    const stored=demoStorage.readJson(FILTER_RULES_KEY,null);
    return Array.isArray(stored)?stored:MOCK_FILTER_RULES.map(r=>({...r}));
  });
  const [showAdd,setShowAdd]=useState(false);
  const [editRule,setEditRule]=useState(null);
  const [confirmDel,setConfirmDel]=useState(null);
  const [catFilter,setCatFilter]=useState('전체');
  const [showTest,setShowTest]=useState(false);
  const [testInput,setTestInput]=useState('');
  const [testResult,setTestResult]=useState(null);
  const [form,setForm]=useState({name:'',pattern:'',category:'기밀',severity:'warning',action:'차단'});

  // 규칙 변경 시 localStorage에 즉시 동기화 → 사용자 포털에서 실시간 적용
  useEffect(()=>{demoStorage.writeJson(FILTER_RULES_KEY,rules);},[rules]);

  const CATS=['전체','기밀','개인정보','보안','비윤리','시스템'];
  const SEV_MAP={danger:{label:'위험',cls:'bg-red-100 text-red-700'},warning:{label:'경고',cls:'bg-yellow-100 text-yellow-700'},caution:{label:'주의',cls:'bg-blue-100 text-blue-700'}};
  const filtered=catFilter==='전체'?rules:rules.filter(r=>r.category===catFilter);
  const totalHits=rules.filter(r=>r.active).reduce((a,r)=>a+r.hitCount,0);

  const runTest=()=>{
    if(!testInput.trim())return;
    const matched=rules.filter(r=>{
      if(!r.active)return false;
      return r.p.split(',').map(k=>k.trim().toLowerCase()).some(k=>testInput.toLowerCase().includes(k));
    });
    setTestResult({input:testInput,matched,blocked:matched.some(r=>r.a==='차단')});
  };

  return (
    <PageShell breadcrumb={['가드레일','필터 설정']} title="부적절 프롬프트 필터링 관리"
      action={
        <div className="flex items-center gap-2">
          <button onClick={()=>{setTestInput('');setTestResult(null);setShowTest(true);}} className="border border-amber-400 text-amber-700 bg-amber-50 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 hover:bg-amber-100"><TestTube2 size={15}/>프롬프트 테스트</button>
          <button onClick={()=>setShowAdd(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5"><Plus size={15}/>필터 추가</button>
        </div>
      }>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          ['전체 규칙',rules.length,'개','text-blue-600'],
          ['활성 규칙',rules.filter(r=>r.active).length,'개','text-green-600'],
          ['금일 총 차단',totalHits,'건','text-red-600'],
          ['위험 등급 규칙',rules.filter(r=>r.severity==='danger'&&r.active).length,'개','text-red-500'],
        ].map(([label,val,unit,cls])=>(
          <div key={label} className="bg-white rounded-xl border p-4">
            <div className="text-xs text-gray-400 mb-1">{label}</div>
            <div className={`text-2xl font-extrabold ${cls}`}>{val}<span className="text-sm font-normal ml-1 text-gray-400">{unit}</span></div>
          </div>
        ))}
      </div>
      {/* Category filter tabs */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {CATS.map(c=>(
          <button key={c} onClick={()=>setCatFilter(c)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all ${catFilter===c?'bg-blue-600 text-white border-blue-600':'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>{c}</button>
        ))}
        <span className="ml-auto text-xs text-gray-400">{filtered.length}개 규칙</span>
      </div>
      {/* Rules table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-3 text-left">규칙명</th>
              <th className="px-4 py-3 text-left">분류</th>
              <th className="px-4 py-3 text-left">위험도</th>
              <th className="px-4 py-3 text-left">패턴/키워드</th>
              <th className="px-4 py-3 text-left">동작</th>
              <th className="px-4 py-3 text-right">탐지 수</th>
              <th className="px-4 py-3 text-center">활성</th>
              <th className="px-4 py-3 text-center">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(f=>(
              <tr key={f.id} className={`hover:bg-gray-50 transition-colors ${!f.active?'opacity-40':''}`}>
                <td className="px-4 py-3 font-semibold">{f.n}</td>
                <td className="px-4 py-3"><span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">{f.category}</span></td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded font-bold ${SEV_MAP[f.severity]?.cls||'bg-gray-100 text-gray-600'}`}>
                    {SEV_MAP[f.severity]?.label||f.severity}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 max-w-xs truncate text-xs">{f.p}</td>
                <td className="px-4 py-3"><StatusBadge status={f.a}/></td>
                <td className="px-4 py-3 text-right font-mono font-bold text-red-600">{f.hitCount.toLocaleString()}</td>
                <td className="px-4 py-3 text-center">
                  <ToggleSwitch on={f.active} onClick={()=>{
                    setRules(p=>p.map(x=>x.id===f.id?{...x,active:!x.active}:x));
                    toast(f.active?`'${f.n}' 비활성화`:`'${f.n}' 활성화`,f.active?'info':'success');
                  }}/>
                </td>
                <td className="px-4 py-3 text-center space-x-2">
                  <button onClick={()=>setEditRule({...f})} className="text-xs text-blue-600 hover:underline font-medium">편집</button>
                  <button onClick={()=>setConfirmDel(f)} className="text-xs text-red-500 hover:underline font-medium">삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Add Modal */}
      <Modal isOpen={showAdd} onClose={()=>setShowAdd(false)} title="필터 규칙 추가" size="md">
        <div className="space-y-4">
          <div><label className="block text-sm font-semibold mb-1">규칙명 <span className="text-red-500">*</span></label>
            <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="예: 내부 기밀 요청" className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <div><label className="block text-sm font-semibold mb-1">패턴/키워드 <span className="text-gray-400 font-normal">(쉼표 구분)</span></label>
            <input value={form.pattern} onChange={e=>setForm({...form,pattern:e.target.value})} placeholder="키워드1, 키워드2, ..." className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-sm font-semibold mb-1">분류</label>
              <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                {['기밀','개인정보','보안','비윤리','시스템'].map(c=><option key={c}>{c}</option>)}</select></div>
            <div><label className="block text-sm font-semibold mb-1">위험도</label>
              <select value={form.severity} onChange={e=>setForm({...form,severity:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                <option value="danger">위험</option><option value="warning">경고</option><option value="caution">주의</option></select></div>
            <div><label className="block text-sm font-semibold mb-1">동작</label>
              <select value={form.action} onChange={e=>setForm({...form,action:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                <option>차단</option><option>경고</option><option>로그만</option></select></div>
          </div>
          <button onClick={()=>{
            if(!form.name)return;
            setRules(p=>[...p,{id:Date.now(),n:form.name,p:form.pattern,category:form.category,severity:form.severity,a:form.action,active:true,hitCount:0}]);
            setShowAdd(false);setForm({name:'',pattern:'',category:'기밀',severity:'warning',action:'차단'});
            toast('필터 규칙이 추가되었습니다');
          }} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm">추가</button>
        </div>
      </Modal>
      {/* Edit Modal */}
      <Modal isOpen={!!editRule} onClose={()=>setEditRule(null)} title="필터 규칙 편집" size="md">
        {editRule&&<div className="space-y-4">
          <div><label className="block text-sm font-semibold mb-1">규칙명</label>
            <input value={editRule.n} onChange={e=>setEditRule({...editRule,n:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <div><label className="block text-sm font-semibold mb-1">패턴/키워드</label>
            <input value={editRule.p} onChange={e=>setEditRule({...editRule,p:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-sm font-semibold mb-1">분류</label>
              <select value={editRule.category} onChange={e=>setEditRule({...editRule,category:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                {['기밀','개인정보','보안','비윤리','시스템'].map(c=><option key={c}>{c}</option>)}</select></div>
            <div><label className="block text-sm font-semibold mb-1">위험도</label>
              <select value={editRule.severity} onChange={e=>setEditRule({...editRule,severity:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                <option value="danger">위험</option><option value="warning">경고</option><option value="caution">주의</option></select></div>
            <div><label className="block text-sm font-semibold mb-1">동작</label>
              <select value={editRule.a} onChange={e=>setEditRule({...editRule,a:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                <option>차단</option><option>경고</option><option>로그만</option></select></div>
          </div>
          <button onClick={()=>{setRules(p=>p.map(x=>x.id===editRule.id?{...x,...editRule}:x));setEditRule(null);toast('규칙이 수정되었습니다');}}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm">저장</button>
        </div>}
      </Modal>
      {/* Test Modal */}
      <Modal isOpen={showTest} onClose={()=>setShowTest(false)} title="프롬프트 필터 테스트" size="md">
        <div className="space-y-4">
          <div className="text-sm text-gray-500 bg-amber-50 border border-amber-200 rounded-lg p-3">
            테스트할 프롬프트를 입력하면 현재 활성 규칙과 대조하여 차단 여부를 확인합니다.
          </div>
          <textarea value={testInput} onChange={e=>setTestInput(e.target.value)} rows={4}
            placeholder="테스트 프롬프트를 입력하세요..." className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          <button onClick={runTest} className="w-full bg-amber-500 text-white py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2">
            <TestTube2 size={15}/>테스트 실행
          </button>
          {testResult&&(
            <div className={`rounded-xl border-2 p-4 ${testResult.blocked?'border-red-300 bg-red-50':'border-green-300 bg-green-50'}`}>
              <div className={`font-bold text-base mb-2 flex items-center gap-2 ${testResult.blocked?'text-red-700':'text-green-700'}`}>
                {testResult.blocked?<><XCircle size={18}/>차단됨</>:<><Check size={18}/>통과됨</>}
              </div>
              {testResult.matched.length>0?(
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-gray-600 mb-1.5">적용된 규칙 ({testResult.matched.length}개)</div>
                  {testResult.matched.map(r=>(
                    <div key={r.id} className="flex items-center gap-2 text-xs text-gray-700">
                      <span className={`w-1.5 h-1.5 rounded-full ${SEV_MAP[r.severity]?.cls.includes('red')?'bg-red-500':'bg-yellow-500'}`}/>
                      <span className="font-semibold">{r.n}</span><span className="text-gray-400">→ {r.a}</span>
                    </div>
                  ))}
                </div>
              ):(
                <div className="text-sm text-green-700">매칭된 필터 규칙이 없습니다.</div>
              )}
            </div>
          )}
        </div>
      </Modal>
      <ConfirmDialog isOpen={!!confirmDel} onClose={()=>setConfirmDel(null)}
        onConfirm={()=>{setRules(p=>p.filter(x=>x.id!==confirmDel.id));setConfirmDel(null);toast('규칙이 삭제되었습니다','info');}}
        title="규칙 삭제" message={`'${confirmDel?.n}' 규칙을 삭제하시겠습니까?`} confirmText="삭제" danger/>
    </PageShell>
  );
};

export const GuardrailLogPage = () => {
  const [search,setSearch]=useState('');const [filterRule,setFilterRule]=useState('전체');const [detail,setDetail]=useState(null);
  const logs=MOCK_GUARDRAIL_LOGS.filter(l=>{
    const matchSearch=!search||l.user.includes(search)||l.query.includes(search);
    const matchRule=filterRule==='전체'||l.rule===filterRule;
    return matchSearch&&matchRule;
  });
  const rules=[...new Set(MOCK_GUARDRAIL_LOGS.map(l=>l.rule))];
  return (
    <PageShell breadcrumb={['가드레일','탐지 로그']} title="탐지 로그">
      <div className="flex items-center space-x-3 mb-4">
        <div className="relative flex-1 max-w-sm"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="사용자 또는 질의 검색..." className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/><Search size={16} className="absolute left-3 top-2.5 text-gray-400"/></div>
        <select value={filterRule} onChange={e=>setFilterRule(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white"><option>전체</option>{rules.map(r=><option key={r}>{r}</option>)}</select>
        <span className="text-xs text-gray-400">총 {logs.length}건</span>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr>
          <th className="px-4 py-3 text-left">시간</th><th className="px-4 py-3 text-left">사용자</th><th className="px-4 py-3 text-left">질의 내용</th><th className="px-4 py-3 text-left">적용 규칙</th><th className="px-4 py-3 text-left">조치</th>
        </tr></thead><tbody className="divide-y">{logs.map(l=>(
          <tr key={l.id} className="hover:bg-gray-50 cursor-pointer" onClick={()=>setDetail(l)}>
            <td className="px-4 py-3 text-xs font-mono text-gray-500">{l.time}</td><td className="px-4 py-3 font-medium">{l.user}</td><td className="px-4 py-3 text-gray-700">{l.query}</td><td className="px-4 py-3 text-gray-500">{l.rule}</td><td className="px-4 py-3"><StatusBadge status={l.action}/></td>
          </tr>
        ))}</tbody></table>
      </div>
      <Modal isOpen={!!detail} onClose={()=>setDetail(null)} title="탐지 로그 상세" size="lg">
        {detail&&<div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">{[['사용자',detail.user],['시간',detail.time],['적용 규칙',detail.rule],['조치',detail.action]].map(([k,v],i)=>(
            <div key={i} className="bg-gray-50 p-3 rounded-lg"><div className="text-xs text-gray-400">{k}</div><div className="font-medium">{v}</div></div>
          ))}</div>
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg"><div className="text-xs text-red-400 mb-1">차단된 질의</div><p className="text-sm text-red-700">{detail.query}</p></div>
        </div>}
      </Modal>
    </PageShell>
  );
};

// ==================== DEPLOY PAGES ====================
export const TrustManagePage = () => {
  const toast = useToast();
  const [tab, setTab] = useState('rerank');

  /* ── Re-rank 상태 ── */
  const [pipelines, setPipelines] = useState(MOCK_RERANK_PIPELINES.map(p=>({...p})));
  const [editPipe, setEditPipe] = useState(null);

  /* ── RAG 상태 ── */
  const [ragGlobal, setRagGlobal] = useState({...MOCK_RAG_GLOBAL});
  const [ragAreas, setRagAreas] = useState(MOCK_RAG_AREAS.map(a=>({...a})));
  const [editArea, setEditArea] = useState(null);

  /* ── 출력 가드레일 상태 ── */
  const [outRules, setOutRules] = useState(()=>{
    const stored=demoStorage.readJson(OUTPUT_GUARDRAILS_KEY,null);
    return Array.isArray(stored)?stored:MOCK_OUTPUT_GUARDRAILS.map(r=>({...r}));
  });
  // 가드레일 변경 시 localStorage 동기화
  useEffect(()=>{demoStorage.writeJson(OUTPUT_GUARDRAILS_KEY,outRules);},[outRules]);
  const [ogCat, setOgCat] = useState('전체');
  const [editOgRule, setEditOgRule] = useState(null);
  const [showAddOg, setShowAddOg] = useState(false);
  const [ogForm, setOgForm] = useState({name:'',desc:'',category:'팩트체크',action:'경고 표시'});

  /* ── 신뢰도 스코어링 상태 ── */
  const [conf, setConf] = useState({...MOCK_CONFIDENCE_CONFIG,factors:MOCK_CONFIDENCE_CONFIG.factors.map(f=>({...f})),perModel:MOCK_CONFIDENCE_CONFIG.perModel.map(m=>({...m}))});

  const TABS=[
    {id:'rerank',label:'Re-rank 설정',icon:Filter},
    {id:'rag',label:'RAG 파이프라인',icon:Database},
    {id:'guardrail',label:'출력 가드레일',icon:Shield},
    {id:'confidence',label:'신뢰도 스코어링',icon:Gauge},
  ];

  const OG_CATS=['전체','인용','팩트체크','품질','보안'];
  const OG_ACTION_COLORS={'재생성 요청':'bg-orange-50 text-orange-700','경고 표시':'bg-yellow-50 text-yellow-700','신뢰도 감점':'bg-red-50 text-red-700','자동 요약':'bg-blue-50 text-blue-700','자동 제거':'bg-purple-50 text-purple-700','자동 마스킹':'bg-purple-50 text-purple-700','응답 중단':'bg-red-100 text-red-800'};

  const updateWeight = (key, val) => {
    setConf(prev=>{
      const others = prev.factors.filter(f=>f.key!==key);
      const remain = 100 - val;
      const total = others.reduce((a,f)=>a+f.weight,0);
      const newFactors = prev.factors.map(f=>{
        if(f.key===key) return {...f,weight:val};
        return {...f, weight: total===0 ? Math.round(remain/others.length) : Math.round((f.weight/total)*remain)};
      });
      return {...prev, factors:newFactors};
    });
  };

  const trendMax = Math.max(...conf.trend.map(t=>t.avg));
  const trendMin = Math.min(...conf.trend.map(t=>t.avg)) - 5;

  return (
    <PageShell breadcrumb={['관리자 전용','신뢰성 관리']} title="환각 최소화 · 신뢰성 관리">
      {/* Top-level metric cards */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          ['활성 Re-rank 파이프라인', pipelines.filter(p=>p.enabled).length+'개', 'text-blue-600', '평균 정확도 향상 +'+((pipelines.filter(p=>p.enabled).reduce((a,p)=>a+p.improvement,0)/Math.max(1,pipelines.filter(p=>p.enabled).length)).toFixed(1))+'%'],
          ['RAG 지식영역', ragAreas.length+'개', 'text-purple-600', '하이브리드 검색: '+(ragGlobal.hybridSearch?'활성':'비활성')],
          ['출력 가드레일', outRules.filter(r=>r.enabled).length+'/'+outRules.length+'개', 'text-orange-600', '금주 적용 '+outRules.reduce((a,r)=>a+r.hitCount,0)+'건'],
          ['평균 신뢰도', conf.trend[conf.trend.length-1].avg.toFixed(1)+'%', conf.trend[conf.trend.length-1].avg>=80?'text-green-600':'text-yellow-600', '자동응답 임계값 '+conf.autoAnswerThreshold+'%'],
        ].map(([label,val,cls,sub])=>(
          <div key={label} className="bg-white rounded-xl border p-4">
            <div className="text-xs text-gray-400 mb-1">{label}</div>
            <div className={`text-2xl font-extrabold ${cls}`}>{val}</div>
            <div className="text-xs text-gray-400 mt-1">{sub}</div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex border-b mb-5">
        {TABS.map(({id,label,icon:Icon})=>(
          <button key={id} onClick={()=>setTab(id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${tab===id?'border-blue-600 text-blue-700':'border-transparent text-gray-500 hover:text-gray-800'}`}>
            <Icon size={15}/>{label}
          </button>
        ))}
      </div>

      {/* ── Tab 1: Re-rank ── */}
      {tab==='rerank'&&(
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">에이전트별 Re-rank 파이프라인을 설정합니다. Re-ranking은 초기 벡터 검색 결과를 Cross-Encoder로 재정렬하여 답변 정확도를 향상시킵니다.</p>
          </div>
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">에이전트</th>
                  <th className="px-4 py-3 text-left">Re-rank 모델</th>
                  <th className="px-4 py-3 text-center">Top-K</th>
                  <th className="px-4 py-3 text-center">임계값</th>
                  <th className="px-4 py-3 text-center">정확도 향상</th>
                  <th className="px-4 py-3 text-center">활성</th>
                  <th className="px-4 py-3 text-center">설정</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pipelines.map(p=>(
                  <tr key={p.id} className={`hover:bg-gray-50 ${!p.enabled?'opacity-50':''}`}>
                    <td className="px-4 py-3 font-semibold text-gray-800">{p.agent}</td>
                    <td className="px-4 py-3">
                      <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-mono font-bold">{p.model}</span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold">{p.topK}</td>
                    <td className="px-4 py-3 text-center font-bold">{p.threshold}</td>
                    <td className="px-4 py-3 text-center">
                      {p.enabled
                        ? <span className="text-green-700 font-bold">+{p.improvement}%</span>
                        : <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ToggleSwitch on={p.enabled} onClick={()=>{
                        setPipelines(prev=>prev.map(x=>x.id===p.id?{...x,enabled:!x.enabled}:x));
                        toast(`${p.agent} Re-rank ${p.enabled?'비활성화':'활성화'}됨`,p.enabled?'info':'success');
                      }}/>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={()=>setEditPipe({...p})} className="text-xs text-blue-600 hover:underline font-medium">편집</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Reranker model summary */}
          <div className="mt-5 grid grid-cols-3 gap-4">
            {['BGE-Reranker-v2','Cross-Encoder-KoE5','ColBERT-v2-Kor'].map(modelName=>{
              const count = pipelines.filter(p=>p.model===modelName&&p.enabled).length;
              const avgImp = pipelines.filter(p=>p.model===modelName&&p.enabled).reduce((a,p)=>a+p.improvement,0)/(count||1);
              return (
                <div key={modelName} className="bg-white rounded-xl border p-4">
                  <div className="font-mono font-bold text-sm text-slate-700 mb-2">{modelName}</div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>적용 파이프라인</span><span className="font-bold text-blue-700">{count}개</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                    <span>평균 정확도 향상</span><span className="font-bold text-green-700">+{count?avgImp.toFixed(1):0}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tab 2: RAG ── */}
      {tab==='rag'&&(
        <div className="space-y-6">
          {/* Global settings */}
          <div className="bg-white rounded-xl border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-gray-800">전역 RAG 파라미터</h3>
              <button onClick={()=>toast('RAG 파라미터가 저장되었습니다')} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"><Save size={12}/>저장</button>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-5">
              {[
                ['청크 크기 (Chunk Size)',ragGlobal.chunkSize,'chunkSize','tokens'],
                ['청크 오버랩',ragGlobal.chunkOverlap,'chunkOverlap','tokens'],
                ['초기 검색 Top-K',ragGlobal.topKRetrieve,'topKRetrieve','개'],
                ['Re-rank 후 Top-K',ragGlobal.topKAfterRerank,'topKAfterRerank','개'],
              ].map(([label,val,key,unit])=>(
                <div key={key} className="bg-slate-50 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-2">{label}</div>
                  <div className="flex items-center gap-2">
                    <input type="number" value={val} onChange={e=>setRagGlobal(prev=>({...prev,[key]:+e.target.value}))}
                      className="w-20 border rounded px-2 py-1 text-sm font-bold text-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"/>
                    <span className="text-xs text-gray-400">{unit}</span>
                  </div>
                </div>
              ))}
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-2">유사도 임계값</div>
                <div className="flex items-center gap-3">
                  <input type="range" min="40" max="95" value={ragGlobal.similarityThreshold*100|0}
                    onChange={e=>setRagGlobal(p=>({...p,similarityThreshold:e.target.value/100}))} className="flex-1"/>
                  <span className="text-sm font-bold text-blue-700 w-12 text-right">{(ragGlobal.similarityThreshold*100).toFixed(0)}%</span>
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-2">최소 인용 유사도</div>
                <div className="flex items-center gap-3">
                  <input type="range" min="50" max="95" value={ragGlobal.minCitationSimilarity}
                    onChange={e=>setRagGlobal(p=>({...p,minCitationSimilarity:+e.target.value}))} className="flex-1"/>
                  <span className="text-sm font-bold text-purple-700 w-12 text-right">{ragGlobal.minCitationSimilarity}%</span>
                </div>
              </div>
            </div>
            {/* Hybrid search */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold text-gray-700">하이브리드 검색 (BM25 + Semantic)</div>
                  <div className="text-xs text-gray-400">키워드 검색과 의미론적 검색을 결합하여 검색 재현율을 향상시킵니다.</div>
                </div>
                <ToggleSwitch on={ragGlobal.hybridSearch} onClick={()=>setRagGlobal(p=>({...p,hybridSearch:!p.hybridSearch}))}/>
              </div>
              {ragGlobal.hybridSearch&&(
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-2">검색 가중치 비율</div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-gray-600">BM25</span>
                      <span className="font-bold text-blue-700">{ragGlobal.bm25Weight}%</span>
                    </div>
                    <input type="range" min="10" max="90" value={ragGlobal.bm25Weight}
                      onChange={e=>setRagGlobal(p=>({...p,bm25Weight:+e.target.value,semanticWeight:100-e.target.value}))} className="flex-1"/>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-gray-600">Semantic</span>
                      <span className="font-bold text-purple-700">{ragGlobal.semanticWeight}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Per-area overrides */}
          <div>
            <h3 className="font-bold text-sm text-gray-800 mb-3">지식영역별 파라미터 오버라이드</h3>
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">지식영역</th>
                    <th className="px-4 py-3 text-center">Top-K</th>
                    <th className="px-4 py-3 text-center">유사도 임계값</th>
                    <th className="px-4 py-3 text-center">청크 크기</th>
                    <th className="px-4 py-3 text-center">오버라이드</th>
                    <th className="px-4 py-3 text-center">최종 수정</th>
                    <th className="px-4 py-3 text-center">편집</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {ragAreas.map(a=>(
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold">{a.area}</td>
                      <td className="px-4 py-3 text-center font-mono">{a.topK}</td>
                      <td className="px-4 py-3 text-center font-mono">{a.threshold}</td>
                      <td className="px-4 py-3 text-center font-mono">{a.chunkSize}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded font-bold ${a.override?'bg-blue-100 text-blue-700':'bg-gray-100 text-gray-500'}`}>
                          {a.override?'개별 설정':'전역 적용'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-400">{a.updated}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={()=>setEditArea({...a})} className="text-xs text-blue-600 hover:underline font-medium">편집</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 3: 출력 가드레일 ── */}
      {tab==='guardrail'&&(
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-500">입력 필터링과 달리, 출력 가드레일은 <strong>AI의 응답 결과를 검증</strong>하여 환각을 감지하고 신뢰도를 보장합니다.</div>
            <button onClick={()=>setShowAddOg(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 shrink-0 ml-4"><Plus size={14}/>규칙 추가</button>
          </div>
          {/* Category tabs */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {OG_CATS.map(c=>(
              <button key={c} onClick={()=>setOgCat(c)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all ${ogCat===c?'bg-blue-600 text-white border-blue-600':'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>{c}</button>
            ))}
            <span className="ml-auto text-xs text-gray-400">금주 총 적용 {outRules.filter(r=>r.enabled).reduce((a,r)=>a+r.hitCount,0)}건</span>
          </div>
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">규칙명</th>
                  <th className="px-4 py-3 text-left">설명</th>
                  <th className="px-4 py-3 text-left">분류</th>
                  <th className="px-4 py-3 text-left">적용 동작</th>
                  <th className="px-4 py-3 text-right">적용 수</th>
                  <th className="px-4 py-3 text-center">활성</th>
                  <th className="px-4 py-3 text-center">편집</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {outRules.filter(r=>ogCat==='전체'||r.category===ogCat).map(r=>(
                  <tr key={r.id} className={`hover:bg-gray-50 ${!r.enabled?'opacity-40':''}`}>
                    <td className="px-4 py-3 font-semibold">{r.name}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-xs">{r.desc}</td>
                    <td className="px-4 py-3"><span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded font-medium">{r.category}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded font-bold ${OG_ACTION_COLORS[r.action]||'bg-gray-100 text-gray-600'}`}>{r.action}</span></td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-orange-600">{r.hitCount}</td>
                    <td className="px-4 py-3 text-center">
                      <ToggleSwitch on={r.enabled} onClick={()=>{
                        setOutRules(prev=>prev.map(x=>x.id===r.id?{...x,enabled:!x.enabled}:x));
                        toast(`'${r.name}' ${r.enabled?'비활성화':'활성화'}됨`,r.enabled?'info':'success');
                      }}/>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={()=>setEditOgRule({...r})} className="text-xs text-blue-600 hover:underline font-medium">편집</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab 4: 신뢰도 스코어링 ── */}
      {tab==='confidence'&&(
        <div className="grid grid-cols-3 gap-5">
          {/* Left: thresholds + weights */}
          <div className="col-span-2 space-y-5">
            {/* Threshold sliders */}
            <div className="bg-white rounded-xl border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm">신뢰도 임계값 설정</h3>
                <button onClick={()=>toast('임계값이 저장되었습니다')} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"><Save size={11}/>저장</button>
              </div>
              <div className="space-y-5">
                {[
                  {key:'autoAnswerThreshold',label:'자동 응답 임계값',desc:'이 점수 이상이면 사람 검토 없이 자동 응답합니다.',color:'text-green-700',icon:'🟢'},
                  {key:'hitlThreshold',label:'HITL 요청 임계값',desc:'이 점수 미만이면 전문가 검토를 요청합니다.',color:'text-orange-600',icon:'🟠'},
                  {key:'hallucinationWarnThreshold',label:'환각 경고 임계값',desc:'이 점수 미만이면 사용자에게 환각 경고를 표시합니다.',color:'text-red-600',icon:'🔴'},
                ].map(({key,label,desc,color,icon})=>(
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className="text-sm font-semibold text-gray-700">{icon} {label}</span>
                        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                      </div>
                      <span className={`text-xl font-extrabold ${color} w-16 text-right`}>{conf[key]}%</span>
                    </div>
                    <input type="range" min="30" max="99" value={conf[key]}
                      onChange={e=>setConf(p=>({...p,[key]:+e.target.value}))} className="w-full"/>
                  </div>
                ))}
              </div>
            </div>
            {/* Scoring weights */}
            <div className="bg-white rounded-xl border p-5">
              <h3 className="font-bold text-sm mb-4">신뢰도 점수 구성 요소</h3>
              <div className="space-y-4">
                {conf.factors.map(f=>(
                  <div key={f.key}>
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className="text-sm font-semibold text-gray-700">{f.name}</span>
                        <span className="text-xs text-gray-400 ml-2">{f.desc}</span>
                      </div>
                      <span className="font-extrabold text-blue-700 w-12 text-right">{f.weight}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-3 bg-blue-500 rounded-full transition-all" style={{width:`${f.weight}%`}}/>
                      </div>
                      <input type="range" min="10" max="70" value={f.weight}
                        onChange={e=>updateWeight(f.key,+e.target.value)} className="w-28"/>
                    </div>
                  </div>
                ))}
                <div className="flex justify-end text-xs text-gray-400">
                  합계: <span className={`ml-1 font-bold ${conf.factors.reduce((a,f)=>a+f.weight,0)===100?'text-green-600':'text-red-500'}`}>{conf.factors.reduce((a,f)=>a+f.weight,0)}%</span>
                </div>
              </div>
            </div>
            {/* Per-model baselines */}
            <div className="bg-white rounded-xl border p-5">
              <h3 className="font-bold text-sm mb-4">모델별 신뢰도 기준선</h3>
              <div className="space-y-3">
                {conf.perModel.map((m,i)=>(
                  <div key={m.model} className="flex items-center gap-4">
                    <div className="w-44 text-sm font-semibold text-gray-700 shrink-0">{m.model}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div className="h-3 rounded-full transition-all"
                        style={{width:`${m.avgScore}%`,background:m.avgScore>=80?'#22c55e':m.avgScore>=70?'#f59e0b':'#ef4444'}}/>
                    </div>
                    <div className="text-xs font-mono font-bold w-14 text-right">
                      <span className={m.avgScore>=80?'text-green-600':m.avgScore>=70?'text-yellow-600':'text-red-600'}>{m.avgScore}%</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 w-20">
                      <span>기준:</span>
                      <input type="number" min="50" max="100" value={m.baseline}
                        onChange={e=>setConf(p=>({...p,perModel:p.perModel.map((x,j)=>j===i?{...x,baseline:+e.target.value}:x)}))}
                        className="w-12 border rounded px-1 py-0.5 text-xs font-bold text-center"/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Right: trend chart */}
          <div className="space-y-5">
            <div className="bg-white rounded-xl border p-5">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><TrendingUp size={15} className="text-blue-500"/>최근 7일 신뢰도 추이</h3>
              <div className="flex items-end gap-2 h-32">
                {conf.trend.map((t,i)=>{
                  const pct=((t.avg-trendMin)/(trendMax-trendMin+1))*100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="text-[10px] font-bold text-blue-700">{t.avg}</div>
                      <div className="w-full rounded-t-sm transition-all"
                        style={{height:`${Math.max(10,pct)}%`,background:t.avg>=80?'#3b82f6':'#f59e0b'}}/>
                      <div className="text-[9px] text-gray-400 whitespace-nowrap">{t.date}</div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2 text-xs">
                <div className="bg-green-50 rounded p-2 text-center">
                  <div className="text-green-600 font-bold">{Math.max(...conf.trend.map(t=>t.avg))}%</div>
                  <div className="text-gray-400">최고</div>
                </div>
                <div className="bg-orange-50 rounded p-2 text-center">
                  <div className="text-orange-600 font-bold">{Math.min(...conf.trend.map(t=>t.avg))}%</div>
                  <div className="text-gray-400">최저</div>
                </div>
              </div>
            </div>
            {/* Alert config */}
            <div className="bg-white rounded-xl border p-5">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Bell size={15} className="text-orange-500"/>알림 규칙</h3>
              <div className="space-y-3 text-sm">
                {[
                  ['연속 3회 이상 환각 경고','이메일 발송','text-red-600'],
                  ['평균 신뢰도 70% 미만','슬랙 알림','text-orange-600'],
                  ['HITL 대기 10건 초과','관리자 팝업','text-yellow-600'],
                ].map(([trigger,action,cls],i)=>(
                  <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg p-2.5">
                    <div>
                      <div className={`text-xs font-semibold ${cls}`}>{trigger}</div>
                      <div className="text-xs text-gray-400">→ {action}</div>
                    </div>
                    <ToggleSwitch on={true} onClick={()=>toast(`알림 규칙 설정 변경됨`)}/>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {/* Edit pipeline */}
      <Modal isOpen={!!editPipe} onClose={()=>setEditPipe(null)} title={`Re-rank 설정: ${editPipe?.agent}`} size="md">
        {editPipe&&<div className="space-y-4">
          <div><label className="block text-sm font-semibold mb-1">Re-rank 모델</label>
            <select value={editPipe.model} onChange={e=>setEditPipe({...editPipe,model:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-white font-mono">
              {['BGE-Reranker-v2','Cross-Encoder-KoE5','ColBERT-v2-Kor'].map(m=><option key={m}>{m}</option>)}</select></div>
          <div><label className="block text-sm font-semibold mb-1">Top-K <span className="font-normal text-gray-400">(최종 반환 문서 수)</span></label>
            <input type="number" min="1" max="20" value={editPipe.topK} onChange={e=>setEditPipe({...editPipe,topK:+e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <div><label className="block text-sm font-semibold mb-2">임계값 (Threshold): <span className="text-blue-700">{editPipe.threshold}</span></label>
            <input type="range" min="0.3" max="0.95" step="0.05" value={editPipe.threshold} onChange={e=>setEditPipe({...editPipe,threshold:+parseFloat(e.target.value).toFixed(2)})} className="w-full"/>
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>0.3 (낮음)</span><span>0.95 (높음)</span></div></div>
          <button onClick={()=>{setPipelines(p=>p.map(x=>x.id===editPipe.id?{...editPipe}:x));setEditPipe(null);toast('Re-rank 설정이 저장되었습니다');}}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm">저장</button>
        </div>}
      </Modal>

      {/* Edit RAG area */}
      <Modal isOpen={!!editArea} onClose={()=>setEditArea(null)} title={`RAG 설정: ${editArea?.area}`} size="md">
        {editArea&&<div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[['Top-K','topK'],['청크 크기','chunkSize']].map(([label,key])=>(
              <div key={key}><label className="block text-sm font-semibold mb-1">{label}</label>
                <input type="number" value={editArea[key]} onChange={e=>setEditArea({...editArea,[key]:+e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
            ))}
          </div>
          <div><label className="block text-sm font-semibold mb-2">유사도 임계값: <span className="text-blue-700">{editArea.threshold}</span></label>
            <input type="range" min="0.4" max="0.95" step="0.05" value={editArea.threshold} onChange={e=>setEditArea({...editArea,threshold:+parseFloat(e.target.value).toFixed(2)})} className="w-full"/></div>
          <div className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
            <div className="text-sm font-semibold text-gray-700">전역 설정 오버라이드</div>
            <ToggleSwitch on={editArea.override} onClick={()=>setEditArea(p=>({...p,override:!p.override}))}/>
          </div>
          <button onClick={()=>{setRagAreas(p=>p.map(x=>x.id===editArea.id?{...editArea,updated:new Date().toISOString().slice(0,10)}:x));setEditArea(null);toast(`${editArea.area} RAG 설정이 저장되었습니다`);}}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm">저장</button>
        </div>}
      </Modal>

      {/* Edit output guardrail */}
      <Modal isOpen={!!editOgRule} onClose={()=>setEditOgRule(null)} title="출력 가드레일 편집" size="md">
        {editOgRule&&<div className="space-y-4">
          <div><label className="block text-sm font-semibold mb-1">규칙명</label>
            <input value={editOgRule.name} onChange={e=>setEditOgRule({...editOgRule,name:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <div><label className="block text-sm font-semibold mb-1">설명</label>
            <textarea value={editOgRule.desc} onChange={e=>setEditOgRule({...editOgRule,desc:e.target.value})} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm resize-none"/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-semibold mb-1">분류</label>
              <select value={editOgRule.category} onChange={e=>setEditOgRule({...editOgRule,category:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                {['인용','팩트체크','품질','보안'].map(c=><option key={c}>{c}</option>)}</select></div>
            <div><label className="block text-sm font-semibold mb-1">적용 동작</label>
              <select value={editOgRule.action} onChange={e=>setEditOgRule({...editOgRule,action:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                {['재생성 요청','경고 표시','신뢰도 감점','자동 요약','자동 제거','자동 마스킹','응답 중단'].map(a=><option key={a}>{a}</option>)}</select></div>
          </div>
          <button onClick={()=>{setOutRules(p=>p.map(x=>x.id===editOgRule.id?{...editOgRule}:x));setEditOgRule(null);toast('가드레일 규칙이 수정되었습니다');}}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm">저장</button>
        </div>}
      </Modal>

      {/* Add output guardrail */}
      <Modal isOpen={showAddOg} onClose={()=>setShowAddOg(false)} title="출력 가드레일 추가" size="md">
        <div className="space-y-4">
          <div><label className="block text-sm font-semibold mb-1">규칙명 <span className="text-red-500">*</span></label>
            <input value={ogForm.name} onChange={e=>setOgForm({...ogForm,name:e.target.value})} placeholder="예: 법률 조항 번호 검증" className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <div><label className="block text-sm font-semibold mb-1">설명</label>
            <textarea value={ogForm.desc} onChange={e=>setOgForm({...ogForm,desc:e.target.value})} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm resize-none"/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-semibold mb-1">분류</label>
              <select value={ogForm.category} onChange={e=>setOgForm({...ogForm,category:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                {['인용','팩트체크','품질','보안'].map(c=><option key={c}>{c}</option>)}</select></div>
            <div><label className="block text-sm font-semibold mb-1">적용 동작</label>
              <select value={ogForm.action} onChange={e=>setOgForm({...ogForm,action:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                {['재생성 요청','경고 표시','신뢰도 감점','자동 요약','자동 제거','자동 마스킹','응답 중단'].map(a=><option key={a}>{a}</option>)}</select></div>
          </div>
          <button onClick={()=>{
            if(!ogForm.name)return;
            setOutRules(p=>[...p,{id:`og-${Date.now()}`,name:ogForm.name,desc:ogForm.desc,category:ogForm.category,action:ogForm.action,enabled:true,hitCount:0}]);
            setShowAddOg(false);setOgForm({name:'',desc:'',category:'팩트체크',action:'경고 표시'});
            toast('출력 가드레일 규칙이 추가되었습니다');
          }} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm">추가</button>
        </div>
      </Modal>
    </PageShell>
  );
};

// ==================== SIDEBAR ====================
export const QualityManagementPage = () => {
  const toast=useToast();
  const [selReview,setSelReview]=useState(null);
  const [goldenCount,setGoldenCount]=useState(247);
  const [goldenIds,setGoldenIds]=useState([]);      // 이번 세션에 등록한 검토 건
  const [editAnswer,setEditAnswer]=useState(null);   // 답변 수정 중 {id, text}
  const [newGolden,setNewGolden]=useState(null);     // 직접 등록 폼 {q,a}
  const [ratingFilter,setRatingFilter]=useState('전체');
  const [autoTh,setAutoTh]=useState(80);             // 자동 응답 임계값(%)
  const [halluTh,setHalluTh]=useState(60);           // 할루시네이션 경고 임계값(%)

  const registerGolden=(review)=>{
    if(goldenIds.includes(review.id)){toast('이미 골든 데이터로 등록된 건입니다.','info');return;}
    setGoldenIds(p=>[...p,review.id]);
    setGoldenCount(c=>c+1);
    toast('골든 데이터로 등록했습니다');
  };
  const saveGolden=()=>{
    if(!newGolden.q.trim()||!newGolden.a.trim()){toast('질문과 답변을 모두 입력하세요.','info');return;}
    setGoldenCount(c=>c+1); setNewGolden(null);
    toast('골든 데이터를 등록했습니다');
  };
  const saveAnswer=()=>{
    setSelReview(p=>p&&({...p,answer:editAnswer.text}));
    setEditAnswer(null);
    toast('답변을 수정했습니다 (검토 이력에 반영)');
  };
  // 사용자 포털 답변 피드백(👍👎, localStorage) 병합 — 전문가 검토 목록 앞에 표시 (피드백 루프)
  const userRows=(()=>{
    const dom=getActiveDomainId();
    const stored=demoStorage.readJson(makeDomainStorageKey('feedback',dom),[]);
    if(!Array.isArray(stored))return [];
    return stored.map(f=>({
      id:f.id, query:f.query||'(질문 미기록)', answer:f.answer, agent:'일반 질의 (사용자 포털)',
      reviewer:'사용자 피드백', rating:f.rating, confidence:f.confidence??0.8,
      date:f.date, feedback:f.reason||'',
    }));
  })();
  const rows=[...userRows,...MOCK_QUALITY_REVIEWS];
  const ratingIcon=r=>r==='good'?<ThumbsUp size={14} className="text-green-600"/>:r==='bad'?<ThumbsDown size={14} className="text-red-600"/>:<Edit3 size={14} className="text-orange-500"/>;
  const ratingLabel=r=>r==='good'?'정확':r==='bad'?'할루시네이션':'수정 필요';
  const ratingBg=r=>r==='good'?'bg-green-50 text-green-700':r==='bad'?'bg-red-50 text-red-700':'bg-orange-50 text-orange-700';
  const good=rows.filter(r=>r.rating==='good').length;
  const edit=rows.filter(r=>r.rating==='edit').length;
  const bad=rows.filter(r=>r.rating==='bad').length;
  return (
    <PageShell breadcrumb={['관리자 전용','AI 품질 관리']} title="AI 답변 품질 관리">
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[{l:'총 검토 건수',v:rows.length,c:'border-blue-500 bg-blue-50',tc:'text-blue-700'},
          {l:'정확',v:good,c:'border-green-500 bg-green-50',tc:'text-green-700'},
          {l:'수정 필요',v:edit,c:'border-orange-500 bg-orange-50',tc:'text-orange-700'},
          {l:'할루시네이션',v:bad,c:'border-red-500 bg-red-50',tc:'text-red-700'},
          {l:'평균 신뢰도',v:((rows.reduce((s,r)=>s+r.confidence,0)/rows.length)*100).toFixed(0)+'%',c:'border-purple-500 bg-purple-50',tc:'text-purple-700'}
        ].map((c,i)=>(
          <div key={i} className={`p-4 rounded-xl border-l-4 bg-white shadow-sm ${c.c}`}>
            <div className="text-xs text-gray-500 mb-1">{c.l}</div>
            <div className={`text-xl font-bold ${c.tc}`}>{c.v}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-5 mb-6">
        <div className="col-span-2">
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-gray-50/80 border-b flex items-center justify-between">
              <h3 className="font-bold text-sm">전문가 검토 내역</h3>
              <select value={ratingFilter} onChange={e=>setRatingFilter(e.target.value)} aria-label="검토 결과 필터" className="text-xs border rounded px-2 py-1 bg-white">{['전체','정확','수정 필요','할루시네이션'].map(o=><option key={o}>{o}</option>)}</select>
            </div>
            <div className="divide-y">{rows.filter(r=>ratingFilter==='전체'||ratingLabel(r.rating)===ratingFilter).map(r=>(
              <div key={r.id} onClick={()=>setSelReview(r)} className="px-5 py-4 hover:bg-gray-50/50 cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`flex items-center space-x-1 px-2 py-0.5 rounded-md text-xs font-medium ${ratingBg(r.rating)}`}>{ratingIcon(r.rating)}<span className="ml-1">{ratingLabel(r.rating)}</span></span>
                    <span className="text-xs text-gray-400">{r.agent}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <span>신뢰도: <span className={`font-bold ${r.confidence>=0.9?'text-green-600':r.confidence>=0.7?'text-orange-500':'text-red-600'}`}>{(r.confidence*100).toFixed(0)}%</span></span>
                    <span>{r.date}</span>
                  </div>
                </div>
                <div className="text-sm font-medium mb-1">Q: {r.query}</div>
                <div className="text-xs text-gray-500 truncate">A: {r.answer}</div>
                {r.feedback&&<div className="text-xs text-orange-600 mt-1 flex items-center"><Edit3 size={10} className="mr-1"/>{r.feedback}</div>}
              </div>
            ))}</div>
          </div>
        </div>
        <div className="space-y-5">
          <div className="bg-white rounded-xl border shadow-sm p-5">
            <h3 className="font-bold text-sm mb-4">신뢰도 임계값 설정</h3>
            <div className="space-y-4">
              <div><label className="text-xs text-gray-500">자동 응답 임계값</label><div className="flex items-center space-x-2 mt-1"><input type="range" min="0" max="100" value={autoTh} onChange={e=>setAutoTh(+e.target.value)} aria-label="자동 응답 임계값" className="flex-1"/><span className="text-sm font-bold text-blue-600 w-12 text-right">{autoTh}%</span></div><p className="text-xs text-gray-400 mt-1">이 값 이상이면 자동 응답, 미만이면 전문가 검토 요청 — 현재 검토 내역 {rows.filter(r=>(r.confidence*100)<autoTh).length}건이 해당</p></div>
              <div><label className="text-xs text-gray-500">할루시네이션 경고 임계값</label><div className="flex items-center space-x-2 mt-1"><input type="range" min="0" max="100" value={halluTh} onChange={e=>setHalluTh(+e.target.value)} aria-label="할루시네이션 경고 임계값" className="flex-1"/><span className="text-sm font-bold text-red-600 w-12 text-right">{halluTh}%</span></div><p className="text-xs text-gray-400 mt-1">이 값 미만이면 할루시네이션 경고 표시 — 현재 {rows.filter(r=>(r.confidence*100)<halluTh).length}건이 해당</p></div>
            </div>
          </div>
          <div className="bg-white rounded-xl border shadow-sm p-5">
            <h3 className="font-bold text-sm mb-3">Golden Data 관리</h3>
            <p className="text-xs text-gray-500 mb-3">검증된 Q&A 쌍을 골든 데이터로 등록하여 답변 품질을 개선합니다.</p>
            <div className="flex items-center justify-between bg-blue-50 rounded-lg p-3 mb-2"><span className="text-sm font-medium text-blue-700">등록된 골든 데이터</span><span className="text-lg font-bold text-blue-700">{goldenCount}<span className="text-xs font-normal text-blue-500 ml-1">건</span></span></div>
            <button onClick={()=>setNewGolden({q:'',a:''})} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600">+ 골든 데이터 등록</button>
          </div>
        </div>
      </div>
      <Modal isOpen={!!selReview} onClose={()=>setSelReview(null)} title="답변 상세 검토" size="lg">
        {selReview&&<div className="space-y-5">
          <div className="flex items-center space-x-3 pb-3 border-b">
            <span className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium ${ratingBg(selReview.rating)}`}>{ratingIcon(selReview.rating)}<span className="ml-1">{ratingLabel(selReview.rating)}</span></span>
            <span className="text-sm text-gray-500">{selReview.agent}</span>
            <span className="text-sm text-gray-400">검토자: {selReview.reviewer}</span>
          </div>
          <div className="bg-blue-50 rounded-lg p-4"><div className="text-xs text-blue-600 font-bold mb-1">질문</div><div className="text-sm">{selReview.query}</div></div>
          <div className="bg-gray-50 rounded-lg p-4"><div className="text-xs text-gray-500 font-bold mb-1">AI 답변 (신뢰도: {(selReview.confidence*100).toFixed(0)}%)</div><div className="text-sm">{selReview.answer}</div></div>
          {selReview.feedback&&<div className="bg-orange-50 rounded-lg p-4"><div className="text-xs text-orange-600 font-bold mb-1">전문가 피드백</div><div className="text-sm text-orange-800">{selReview.feedback}</div></div>}
          <div className="flex space-x-2 justify-end pt-2">
            <button onClick={()=>registerGolden(selReview)} disabled={goldenIds.includes(selReview.id)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center disabled:opacity-50 disabled:cursor-default">
              <ThumbsUp size={14} className="mr-1.5"/>{goldenIds.includes(selReview.id)?'등록됨':'골든 데이터 등록'}</button>
            <button onClick={()=>setEditAnswer({id:selReview.id,text:selReview.answer})} className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50">답변 수정</button>
          </div>
        </div>}
      </Modal>

      {/* 답변 수정 */}
      <Modal isOpen={!!editAnswer} onClose={()=>setEditAnswer(null)} title="답변 수정" size="lg">
        {editAnswer&&<div className="space-y-3">
          <textarea value={editAnswer.text} onChange={e=>setEditAnswer(p=>({...p,text:e.target.value}))} rows={8}
            className="w-full border rounded-lg px-3 py-2 text-sm leading-relaxed"/>
          <p className="text-xs text-gray-400">수정한 답변은 검토 이력에 반영되며, 골든 데이터로 등록하면 이후 답변 품질 개선에 사용됩니다.</p>
          <button onClick={saveAnswer} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700">저장</button>
        </div>}
      </Modal>

      {/* 골든 데이터 직접 등록 */}
      <Modal isOpen={!!newGolden} onClose={()=>setNewGolden(null)} title="골든 데이터 등록" size="md">
        {newGolden&&<div className="space-y-3">
          <div><label className="block text-sm font-medium mb-1">질문</label>
            <input value={newGolden.q} onChange={e=>setNewGolden(p=>({...p,q:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <div><label className="block text-sm font-medium mb-1">검증된 답변</label>
            <textarea value={newGolden.a} onChange={e=>setNewGolden(p=>({...p,a:e.target.value}))} rows={5} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <button onClick={saveGolden} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700">등록</button>
        </div>}
      </Modal>
    </PageShell>
  );
};
