import React, { useState } from 'react';
import { Database, Settings, Server, Plus, FileText, CheckCircle, AlertCircle, ChevronRight, ChevronDown, Bot, RefreshCw, Shield, Users, Trash2, UploadCloud, CheckSquare, Globe, Lock, Download, Eye, RotateCcw, Wrench, Sparkles, History, SlidersHorizontal, TrendingUp, Edit3, FolderTree, AlertTriangle, Folder, ScanLine, FileCode2, Loader2, LayoutList } from 'lucide-react';
import { MOCK_KB_FOLDERS, MOCK_KB_DOCS, MOCK_BATCH_JOBS, MOCK_SYNC_LOGS, MOCK_DATA_SOURCES_INT, MOCK_DATA_SOURCES_EXT, MOCK_DOC_PIPELINE, MOCK_CHUNK_QUALITY, MOCK_CHUNK_PREVIEW, MOCK_EMBED_STATUS, MOCK_REPROCESS_QUEUE, UPSTAGE_OCR_MOCK, UPSTAGE_PARSE_MOCK, ADMIN_PERSONA, ADMIN_AGENT_FOLDER_LINKS } from '../mocks.js';
import { Modal, PageShell, useToast, ToggleSwitch } from '../common.jsx';

// 에이전트-폴더 연동 카드의 아이콘·색 (도메인 중립 시각 메타 — 콘텐츠는 ADMIN_AGENT_FOLDER_LINKS)
const AGENT_LINK_META=[{icon:CheckSquare,color:'bg-indigo-50 text-indigo-700'},{icon:Wrench,color:'bg-blue-50 text-blue-700'},{icon:Users,color:'bg-green-50 text-green-700'}];

export const KnowledgeManagementPage = () => {
  const [kbTab,setKbTab]=useState('folders');
  const [flds]=useState(MOCK_KB_FOLDERS.map(f=>({...f})));
  const [docs,setDocs]=useState(JSON.parse(JSON.stringify(MOCK_KB_DOCS)));
  const [sel,setSel]=useState(MOCK_KB_FOLDERS[0]);
  const [expanded,setExpanded]=useState({'f-001':true,'f-002':false});
  const [batches,setBatches]=useState(MOCK_BATCH_JOBS.map(b=>({...b})));
  const [showUp,setShowUp]=useState(false);
  const [showPerm,setShowPerm]=useState(false);
  const [showPrep,setShowPrep]=useState(false);
  const [prepDoc,setPrepDoc]=useState(null);
  const [upFile,setUpFile]=useState({name:'',pii:false,scanning:false,scanned:false});
  const toast=useToast();
  // ── 배치 스케줄 추가 / 동기화 로그 새로고침 / 에이전트 폴더 연결 ──
  const [newBatch,setNewBatch]=useState(null);
  const [syncedAt,setSyncedAt]=useState(null);
  const [agentLinks,setAgentLinks]=useState(ADMIN_AGENT_FOLDER_LINKS.map(a=>({...a,folders:[...a.folders]})));
  const [linkTarget,setLinkTarget]=useState(null);   // 폴더 연결 추가 대상 에이전트 인덱스

  /* 원문 파일은 시연 환경에 없으므로 등록된 메타데이터를 내려받는다 */
  const downloadDocMeta=(d)=>{
    const body=[
      ['파일명',d.name],['크기',d.size],['청크 수',d.chunks],['상태',d.status],
      ['개인정보 마스킹',d.pii?'적용':'해당 없음'],['업로드일',d.uploaded],['지식 폴더',sel?.name||'-'],
    ].map(r=>r.join('\t')).join('\n');
    const url=URL.createObjectURL(new Blob(['﻿'+body],{type:'text/tab-separated-values;charset=utf-8'}));
    const a=document.createElement('a'); a.href=url; a.download=`${d.name.replace(/\.[^.]+$/,'')}_메타데이터.xls`; a.click();
    URL.revokeObjectURL(url);
    toast(`${d.name} 메타데이터를 내려받았습니다`);
  };

  const addBatch=()=>{
    if(!newBatch.src.trim()||!newBatch.target.trim()){toast('소스와 대상 폴더를 입력하세요.','info');return;}
    setBatches(p=>[...p,{id:`b-${p.length+1}`,src:newBatch.src.trim(),target:newBatch.target.trim(),schedule:newBatch.schedule,
      lastRun:'-',lastResult:'대기',addedDocs:0,updatedDocs:0,deletedDocs:0,enabled:true}]);
    toast(`${newBatch.src} 배치 스케줄을 추가했습니다`); setNewBatch(null);
  };

  const addFolderLink=(folderName)=>{
    setAgentLinks(p=>p.map((a,i)=>i===linkTarget&&!a.folders.includes(folderName)?{...a,folders:[...a.folders,folderName]}:a));
    toast(`${folderName} 폴더를 연결했습니다`); setLinkTarget(null);
  };

  // ── 수동 전처리 상태 ──
  const [prepTab,setPrepTab]=useState('parse');           // 'ocr' | 'parse'
  const [ocrState,setOcrState]=useState('idle');          // idle | processing | done
  const [ocrResult,setOcrResult]=useState(null);
  const [ocrLang,setOcrLang]=useState('auto');
  const [ocrShowBbox,setOcrShowBbox]=useState(true);
  const [ocrPageIdx,setOcrPageIdx]=useState(0);
  const [parseState,setParseState]=useState('idle');      // idle | processing | done
  const [parseResult,setParseResult]=useState(null);
  const [parseFormat,setParseFormat]=useState('markdown');
  const [parseMode,setParseMode]=useState('auto');
  const [parseSplit,setParseSplit]=useState(false);
  const [parseCoords,setParseCoords]=useState(false);
  const [parseBase64,setParseBase64]=useState(false);
  const [parsedContent,setParsedContent]=useState('');
  const resetPrep=()=>{setOcrState('idle');setOcrResult(null);setParseState('idle');setParseResult(null);setParsedContent('');setOcrPageIdx(0);};
  const closePrep=()=>{setShowPrep(false);resetPrep();};
  const runOcr=()=>{
    setOcrState('processing');
    setTimeout(()=>{
      const result=JSON.parse(JSON.stringify(UPSTAGE_OCR_MOCK));
      setOcrResult(result);setOcrState('done');setOcrPageIdx(0);
      showToast('OCR 완료 — 텍스트 추출 및 인식 영역 생성됨','success');
    },2800);
  };
  const runParse=()=>{
    setParseState('processing');
    setTimeout(()=>{
      const result=JSON.parse(JSON.stringify(UPSTAGE_PARSE_MOCK));
      setParsedContent(result.outputs[parseFormat]);
      setParseResult(result);setParseState('done');
      showToast('문서 파싱 완료 — 레이아웃 요소 구조화됨','success');
    },3200);
  };
  const showToast=useToast();   // useToast()는 addToast '함수'를 반환한다 — 구조분해하면 undefined가 되어 클릭 시 크래시
  const rootFlds=flds.filter(f=>!f.parent);
  const getKids=id=>flds.filter(f=>f.parent===id);
  const selDocs=(docs[sel?.id]||[]);
  const PLBL={all:'전체 공개',dept:'부서별',specific:'특정 사용자',admin:'관리자 전용'};
  const PCLR={all:'bg-green-100 text-green-700',dept:'bg-blue-100 text-blue-700',specific:'bg-yellow-100 text-yellow-700',admin:'bg-red-100 text-red-700'};
  const SCLR={완료:'bg-green-100 text-green-700',처리중:'bg-yellow-100 text-yellow-700',오류:'bg-red-100 text-red-700'};
  const scan=()=>{setUpFile(p=>({...p,scanning:true,scanned:false}));setTimeout(()=>setUpFile(p=>({...p,scanning:false,scanned:true,pii:Math.random()>0.5})),1800);};
  const doUpload=()=>{const nd={id:'d-'+Date.now(),name:upFile.name||'파일.pdf',size:'2.1MB',pii:upFile.pii,status:'처리중',chunks:0,uploaded:new Date().toISOString().slice(0,10),uploader:ADMIN_PERSONA.name};setDocs(p=>({...p,[sel.id]:[...(p[sel.id]||[]),nd]}));setShowUp(false);setUpFile({name:'',pii:false,scanning:false,scanned:false});showToast('업로드 완료. 벡터 색인 중...','info');};
  const delDoc=id=>{setDocs(p=>({...p,[sel.id]:p[sel.id].filter(d=>d.id!==id)}));showToast('삭제 및 벡터 DB 반영됨','success');};
  const toggleBatch=id=>setBatches(p=>p.map(b=>b.id===id?{...b,enabled:!b.enabled}:b));
  const FNode=({f,depth=0})=>{
    const kids=getKids(f.id);const isExp=expanded[f.id];const isSel=sel?.id===f.id;
    return(<div><div onClick={()=>setSel(f)} style={{paddingLeft:`${depth*12+8}px`}} className={`flex items-center py-1.5 rounded-lg cursor-pointer text-xs transition-colors group ${isSel?'bg-indigo-50 text-indigo-700 font-semibold':'hover:bg-gray-100 text-gray-700'}`}>
      {kids.length>0?<button onClick={e=>{e.stopPropagation();setExpanded(p=>({...p,[f.id]:!p[f.id]}))}} className="mr-1 text-gray-400">{isExp?<ChevronDown size={12}/>:<ChevronRight size={12}/>}</button>:<span className="w-4 mr-1"/>}
      <Folder size={13} className={`mr-1.5 ${isSel?'text-indigo-500':'text-gray-400'}`}/>
      <span className="flex-1 truncate">{f.name}</span>
      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ml-1 mr-1 shrink-0 ${PCLR[f.perm]}`}>{PLBL[f.perm].split(' ')[0]}</span>
    </div>{isExp&&kids.map(c=><FNode key={c.id} f={c} depth={depth+1}/>)}</div>);
  };
  return(<PageShell breadcrumb={['관리자 전용','기본 지식 관리']} title="기본 지식 관리" action={<button onClick={()=>setShowUp(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"><UploadCloud size={14} className="mr-1.5"/>문서 업로드</button>}>
    {/* 탭 */}
    <div className="flex items-center space-x-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
      {[['folders','폴더·문서 관리',FolderTree],['batch','배치·동기화',RefreshCw],['agent','에이전트 연동',Bot]].map(([k,l,Ic])=>(
        <button key={k} onClick={()=>setKbTab(k)} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${kbTab===k?'bg-white text-blue-700 shadow-sm':'text-gray-500 hover:text-gray-700'}`}><Ic size={14}/><span>{l}</span></button>
      ))}
    </div>
    {/* Tab 1: 폴더·문서 */}
    {kbTab==='folders'&&<div className="flex gap-5" style={{height:'calc(100vh - 290px)'}}>
      <div className="w-60 shrink-0 bg-white rounded-xl border shadow-sm flex flex-col">
        <div className="p-3 border-b flex items-center justify-between shrink-0">
          <span className="text-xs font-bold text-gray-600">폴더 구조</span>
          <button onClick={()=>showToast('폴더 생성 모달','info')} className="text-blue-600 hover:text-blue-700"><Plus size={14}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">{rootFlds.map(f=><FNode key={f.id} f={f}/>)}</div>
      </div>
      <div className="flex-1 bg-white rounded-xl border shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2"><Folder size={15} className="text-indigo-500"/><span className="font-bold text-sm">{sel?.name}</span>{sel&&<span className={`text-xs px-2 py-0.5 rounded-full ${PCLR[sel.perm]}`}>{PLBL[sel.perm]}</span>}</div>
            <div className="text-xs text-gray-400 mt-0.5">소유: {sel?.owner} · {selDocs.length}개 문서</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>setShowPerm(true)} className="flex items-center text-xs text-gray-500 border rounded-lg px-3 py-1.5 hover:bg-gray-50"><Lock size={12} className="mr-1"/>권한 설정</button>
            <button onClick={()=>setShowUp(true)} className="flex items-center text-xs text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50"><UploadCloud size={12} className="mr-1"/>업로드</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {selDocs.length===0?<div className="flex flex-col items-center justify-center h-full text-gray-300"><FileText size={40}/><p className="text-sm mt-2">문서 없음</p></div>:(
            <table className="w-full text-sm"><thead><tr className="bg-gray-50 text-xs text-gray-500 sticky top-0">
              {['파일명','크기','개인정보','청크','상태','업로드일','조작'].map((h,i)=><th key={i} className="text-left px-4 py-2.5 font-semibold">{h}</th>)}
            </tr></thead><tbody className="divide-y divide-gray-50">
              {selDocs.map(d=><tr key={d.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5"><div className="flex items-center gap-2"><FileText size={13} className="text-gray-400"/><span className="font-medium text-xs truncate max-w-[160px]">{d.name}</span></div></td>
                <td className="px-4 py-2.5 text-xs text-gray-500">{d.size}</td>
                <td className="px-4 py-2.5">{d.pii?<span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-full flex items-center w-fit gap-1"><Shield size={10}/>마스킹</span>:<span className="text-gray-300 text-xs">-</span>}</td>
                <td className="px-4 py-2.5 text-xs text-gray-600">{d.chunks}</td>
                <td className="px-4 py-2.5"><span className={`text-[10px] px-2 py-0.5 rounded-full ${SCLR[d.status]||'bg-gray-100 text-gray-500'}`}>{d.status}</span></td>
                <td className="px-4 py-2.5 text-[10px] text-gray-400">{d.uploaded}</td>
                <td className="px-4 py-2.5"><div className="flex items-center gap-1">
                  <button onClick={()=>{setPrepDoc(d);setShowPrep(true)}} className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded" title="전처리 설정"><SlidersHorizontal size={13}/></button>
                  <button onClick={()=>downloadDocMeta(d)} className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="메타데이터 다운로드"><Download size={13}/></button>
                  <button onClick={()=>delDoc(d.id)} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="삭제"><Trash2 size={13}/></button>
                </div></td>
              </tr>)}
            </tbody></table>
          )}
        </div>
      </div>
    </div>}
    {/* Tab 2: 배치·동기화 */}
    {kbTab==='batch'&&<div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {[{src:'그룹웨어',icon:Globe,desc:'사내 그룹웨어 문서 자동 수집',last:'2026-02-25 02:00',c:'border-blue-200'},
          {src:'ERP',icon:Database,desc:'ERP 시스템 규정/인사 자료 동기화',last:'2026-02-24 03:00',c:'border-green-200'},
          {src:'DMS',icon:Server,desc:'문서관리시스템 실시간 연동',last:'2026-02-25 09:15',c:'border-purple-200'}
        ].map((s,i)=><div key={i} className={`p-4 rounded-xl border bg-white shadow-sm ${s.c}`}>
          <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><s.icon size={18} className="text-gray-600"/><span className="font-bold text-sm">{s.src}</span></div>
            <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle size={10}/>연결됨</span></div>
          <p className="text-xs text-gray-500 mb-1">{s.desc}</p>
          <div className="text-xs text-gray-400">마지막: {s.last}</div>
        </div>)}
      </div>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between"><h3 className="font-bold text-sm">배치 스케줄 관리</h3>
          <button onClick={()=>setNewBatch({src:'',target:'',schedule:'0 2 * * *'})} className="text-sm text-blue-600 font-medium flex items-center hover:text-blue-700"><Plus size={14} className="mr-1"/>추가</button></div>
        <table className="w-full text-sm"><thead><tr className="bg-gray-50 text-xs text-gray-500">
          {['소스','대상 폴더','스케줄','마지막 실행','결과','문서 변경','활성'].map((h,i)=><th key={i} className="text-left px-4 py-2.5 font-semibold">{h}</th>)}
        </tr></thead><tbody className="divide-y divide-gray-50">
          {batches.map(bj=><tr key={bj.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 font-medium text-sm">{bj.src}</td>
            <td className="px-4 py-3 text-sm text-gray-600">{bj.target}</td>
            <td className="px-4 py-3"><span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded font-mono">{bj.schedule}</span></td>
            <td className="px-4 py-3 text-xs text-gray-500">{bj.lastRun}</td>
            <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${bj.lastResult==='성공'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{bj.lastResult}</span></td>
            <td className="px-4 py-3 text-xs text-gray-600">+{bj.addedDocs} / ~{bj.updatedDocs} / -{bj.deletedDocs}</td>
            <td className="px-4 py-3"><ToggleSwitch on={bj.enabled} onChange={()=>toggleBatch(bj.id)}/></td>
          </tr>)}
        </tbody></table>
      </div>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between"><h3 className="font-bold text-sm">동기화 로그</h3>
          <div className="flex items-center gap-2">
            {syncedAt&&<span className="text-[11px] text-gray-400">마지막 갱신 {syncedAt}</span>}
            <button onClick={()=>{const n=new Date();setSyncedAt(`${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}:${String(n.getSeconds()).padStart(2,'0')}`);toast(`동기화 로그 ${MOCK_SYNC_LOGS.length}건을 다시 불러왔습니다`);}} className="text-xs text-gray-500 flex items-center gap-1 hover:text-blue-600"><RefreshCw size={12}/>새로고침</button>
          </div></div>
        <table className="w-full text-sm"><thead><tr className="bg-gray-50 text-xs text-gray-500">
          {['시각','소스','폴더','파일명','액션','PII','상태'].map((h,i)=><th key={i} className="text-left px-4 py-2 font-semibold">{h}</th>)}
        </tr></thead><tbody className="divide-y divide-gray-50">
          {MOCK_SYNC_LOGS.map(log=><tr key={log.id} className="hover:bg-gray-50 text-xs">
            <td className="px-4 py-2.5 text-gray-400 whitespace-nowrap">{log.time}</td>
            <td className="px-4 py-2.5 font-medium">{log.src}</td>
            <td className="px-4 py-2.5 text-gray-500">{log.folder}</td>
            <td className="px-4 py-2.5 text-gray-700 max-w-[160px] truncate">{log.file}</td>
            <td className="px-4 py-2.5"><span className={`px-2 py-0.5 rounded-full ${log.action==='추가'?'bg-blue-100 text-blue-700':log.action==='업데이트'?'bg-yellow-100 text-yellow-700':'bg-red-100 text-red-700'}`}>{log.action}</span></td>
            <td className="px-4 py-2.5">{log.pii?<span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">PII</span>:<span className="text-gray-300">-</span>}</td>
            <td className="px-4 py-2.5"><span className={log.status.includes('완료')?'text-green-600':log.status==='실패'?'text-red-500':'text-gray-500'}>{log.status}</span></td>
          </tr>)}
        </tbody></table>
      </div>
    </div>}
    {/* Tab 3: 에이전트 연동 */}
    {kbTab==='agent'&&<div className="grid grid-cols-3 gap-4">
      {agentLinks.map((a,i)=>({...a,...AGENT_LINK_META[i%AGENT_LINK_META.length]})).map((ag,i)=><div key={i} className="bg-white rounded-xl border shadow-sm p-5">
        <div className={`w-10 h-10 rounded-xl ${ag.color.split(' ')[0]} flex items-center justify-center mb-3`}><ag.icon size={20} className={ag.color.split(' ')[1]}/></div>
        <h3 className="font-bold text-sm mb-1">{ag.agent}</h3>
        <p className="text-xs text-gray-500 mb-3">연결된 지식 폴더</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {ag.folders.map((f,j)=><span key={j} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-lg flex items-center gap-1"><Folder size={10}/>{f}</span>)}
        </div>
        <button onClick={()=>setLinkTarget(i)} className="w-full text-xs text-blue-600 border border-blue-200 rounded-lg py-2 hover:bg-blue-50 flex items-center justify-center gap-1"><Plus size={12}/>폴더 연결 추가</button>
      </div>)}
    </div>}

    {/* 배치 스케줄 추가 */}
    <Modal isOpen={!!newBatch} onClose={()=>setNewBatch(null)} title="배치 스케줄 추가" size="md">
      {newBatch&&<div className="space-y-3">
        <div><label className="block text-sm font-medium mb-1">소스</label>
          <select value={newBatch.src} onChange={e=>setNewBatch(p=>({...p,src:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">선택하세요</option>{['그룹웨어','ERP','DMS'].map(s=><option key={s}>{s}</option>)}</select></div>
        <div><label className="block text-sm font-medium mb-1">대상 폴더</label>
          <select value={newBatch.target} onChange={e=>setNewBatch(p=>({...p,target:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">선택하세요</option>{flds.map(f=><option key={f.id}>{f.name}</option>)}</select></div>
        <div><label className="block text-sm font-medium mb-1">스케줄 (cron)</label>
          <input value={newBatch.schedule} onChange={e=>setNewBatch(p=>({...p,schedule:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm font-mono"/>
          <p className="text-xs text-gray-400 mt-1">기본값은 매일 02:00 실행입니다.</p></div>
        <button onClick={addBatch} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700">추가</button>
      </div>}
    </Modal>

    {/* 에이전트 폴더 연결 추가 */}
    <Modal isOpen={linkTarget!==null} onClose={()=>setLinkTarget(null)} title={`${linkTarget!==null?agentLinks[linkTarget]?.agent:''} 폴더 연결`} size="sm">
      {linkTarget!==null&&<div className="space-y-2">
        {flds.map(f=>{
          const linked=agentLinks[linkTarget].folders.includes(f.name);
          return (
            <button key={f.id} disabled={linked} onClick={()=>addFolderLink(f.name)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${linked?'bg-gray-50 text-gray-400 cursor-default':'hover:bg-blue-50 hover:border-blue-300'}`}>
              <span className="flex items-center gap-2"><Folder size={13}/>{f.name}</span>
              {linked&&<span className="text-xs">연결됨</span>}
            </button>
          );
        })}
      </div>}
    </Modal>
    {/* 업로드 모달 */}
    <Modal isOpen={showUp} onClose={()=>{setShowUp(false);setUpFile({name:'',pii:false,scanning:false,scanned:false})}} title="문서 업로드" size="md">
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
          <UploadCloud size={28} className="mx-auto text-gray-300 mb-2"/>
          <p className="text-sm text-gray-500 mb-3">PDF, DOCX, XLSX, PPTX 지원</p>
          <input type="text" placeholder="파일명 입력 (시뮬레이션)" value={upFile.name} onChange={e=>setUpFile(p=>({...p,name:e.target.value,scanned:false,scanning:false}))} className="w-full border rounded-lg px-3 py-2 text-sm"/>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div><div className="text-sm font-medium">개인정보(PII) 자동 탐지</div><div className="text-xs text-gray-400">주민번호·연락처·계좌번호 자동 마스킹</div></div>
          {!upFile.scanned&&!upFile.scanning&&<button onClick={scan} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg">스캔 실행</button>}
          {upFile.scanning&&<span className="text-xs text-blue-600 animate-pulse">스캔 중...</span>}
          {upFile.scanned&&(upFile.pii?<span className="text-xs bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg flex items-center gap-1"><AlertCircle size={12}/>PII 탐지 → 마스킹</span>:<span className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg flex items-center gap-1"><CheckCircle size={12}/>PII 없음</span>)}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="text-xs text-gray-500">청크 크기</label><input type="number" defaultValue={512} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"/></div>
          <div><label className="text-xs text-gray-500">오버랩</label><input type="number" defaultValue={50} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"/></div>
          <div><label className="text-xs text-gray-500">분할 방식</label><select className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white"><option>의미 단위</option><option>고정 크기</option><option>문단</option></select></div>
        </div>
        <div className="flex gap-2 pt-2">
          <button onClick={()=>{setShowUp(false);setUpFile({name:'',pii:false,scanning:false,scanned:false})}} className="flex-1 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50">취소</button>
          <button onClick={doUpload} disabled={!upFile.name} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40">업로드 및 색인</button>
        </div>
      </div>
    </Modal>
    {/* 권한 모달 */}
    <Modal isOpen={showPerm} onClose={()=>setShowPerm(false)} title={`'${sel?.name}' 접근 권한 설정`} size="md">
      <div className="space-y-4">
        <div><label className="text-sm font-medium text-gray-700 block mb-2">공개 범위</label>
          <div className="space-y-2">
            {[['all','전체 공개','모든 사용자가 조회 가능'],['dept','부서별','지정 부서만 접근'],['specific','특정 사용자','지정 사용자만 접근'],['admin','관리자 전용','관리자만 접근 가능']].map(([k,l,d])=>(
              <label key={k} className={`flex items-start p-3 rounded-lg border-2 cursor-pointer transition-colors ${sel?.perm===k?'border-blue-500 bg-blue-50':'border-transparent bg-gray-50 hover:border-gray-200'}`}>
                <input type="radio" name="perm" value={k} defaultChecked={sel?.perm===k} className="mt-0.5 mr-3"/>
                <div><div className="text-sm font-medium">{l}</div><div className="text-xs text-gray-500">{d}</div></div>
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button onClick={()=>setShowPerm(false)} className="flex-1 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50">취소</button>
          <button onClick={()=>{setShowPerm(false);showToast('권한이 업데이트되었습니다.','success')}} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">저장</button>
        </div>
      </div>
    </Modal>
    {/* ── 수동 전처리 모달 ── */}
    <Modal isOpen={showPrep} onClose={closePrep} title="수동 전처리" size="lg">
      {prepDoc&&<div className="space-y-4">

        {/* 파일 정보 배너 */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border">
          <FileText size={18} className="text-indigo-600 shrink-0"/>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-gray-800 truncate">{prepDoc.name}</div>
            <div className="text-xs text-gray-400">{prepDoc.size} · {prepDoc.chunks}청크 (기존)</div>
          </div>
          <span className="text-xs px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full font-bold shrink-0">문서 AI</span>
        </div>

        {/* 탭: Document OCR | Document Parse */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          {[['ocr','Document OCR','스캔·이미지 텍스트 추출',ScanLine],['parse','Document Parse','구조 문서 레이아웃 파싱',FileCode2]].map(([key,label,sub,Icon])=>(
            <button key={key} onClick={()=>{setPrepTab(key);resetPrep();}} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm transition-all ${prepTab===key?'bg-white shadow-sm text-indigo-700':'text-gray-500 hover:text-gray-700'}`}>
              <Icon size={15}/>
              <div className="text-left">
                <div className="font-bold text-[13px]">{label}</div>
                <div className="text-[10px] opacity-70">{sub}</div>
              </div>
            </button>
          ))}
        </div>

        {/* ═══ Document OCR 탭 ═══ */}
        {prepTab==='ocr'&&<div className="space-y-3">
          {/* 설정 */}
          {ocrState==='idle'&&<div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium text-gray-500 block mb-1">인식 언어</label>
                <select value={ocrLang} onChange={e=>setOcrLang(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="auto">자동 감지</option><option value="ko">한국어</option>
                  <option value="en">English</option><option value="ko-en">한국어+영어</option>
                </select></div>
              <div><label className="text-xs font-medium text-gray-500 block mb-1.5">인식 영역 표시</label>
                <button onClick={()=>setOcrShowBbox(!ocrShowBbox)} className={`relative inline-flex w-10 h-5 rounded-full transition-colors ${ocrShowBbox?'bg-indigo-600':'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${ocrShowBbox?'translate-x-5':'translate-x-0.5'}`}/>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-700">
              <ScanLine size={12} className="shrink-0"/>
              지원 형식: PNG · JPG · TIFF · PDF(스캔본) — 이미지 기반 스캔 문서에 최적화
            </div>
            <button onClick={runOcr} className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors">
              <ScanLine size={16}/> OCR 실행
            </button>
          </div>}

          {/* 처리 중 */}
          {ocrState==='processing'&&<div className="flex flex-col items-center py-10 gap-3">
            <Loader2 size={36} className="animate-spin text-indigo-600"/>
            <div className="text-sm font-bold text-gray-700">OCR 처리 중...</div>
            <div className="text-xs text-gray-400">텍스트 및 인식 영역 추출 중</div>
            <div className="w-64 bg-gray-100 rounded-full h-1.5 mt-1"><div className="bg-indigo-600 h-1.5 rounded-full w-3/5 animate-pulse"/></div>
          </div>}

          {/* 결과 */}
          {ocrState==='done'&&ocrResult&&<div className="space-y-3">
            {/* 통계 */}
            <div className="grid grid-cols-3 gap-2">
              {[['총 페이지',ocrResult.totalPages+'쪽','text-blue-600','bg-blue-50'],
                ['추출 블록',ocrResult.totalBlocks+'개','text-green-600','bg-green-50'],
                ['처리 시간',ocrResult.elapsed+'s','text-orange-600','bg-orange-50'],
              ].map(([l,v,c,bg])=>(
                <div key={l} className={`${bg} rounded-xl p-2.5 border text-center`}>
                  <div className={`text-lg font-black ${c}`}>{v}</div>
                  <div className="text-[10px] text-gray-500 font-medium">{l}</div>
                </div>
              ))}
            </div>
            {/* 페이지 탭 */}
            <div className="flex gap-1">
              {ocrResult.pages.map((_,i)=>(
                <button key={i} onClick={()=>setOcrPageIdx(i)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition-colors ${ocrPageIdx===i?'bg-indigo-600 text-white border-indigo-600':'border-gray-200 text-gray-500 hover:border-indigo-300'}`}>
                  {i+1}쪽
                </button>
              ))}
            </div>
            {/* 2단 프리뷰 */}
            <div className="grid grid-cols-2 gap-3">
              {/* 좌: 문서 미리보기 + OCR 하이라이트 */}
              <div className="border-2 rounded-xl overflow-hidden">
                <div className="px-3 py-2 border-b bg-gray-50 text-[11px] font-bold text-gray-500 flex items-center gap-1">
                  <Eye size={11}/> 문서 미리보기 (OCR 인식 영역)
                </div>
                <div className="p-3 bg-white" style={{minHeight:200}}>
                  {/* 실제 문서 시뮬레이션: 텍스트 블록을 bbox 위치에 배치 */}
                  <div className="relative bg-white border border-gray-200 rounded shadow-sm overflow-hidden" style={{minHeight:220,fontFamily:'serif'}}>
                    {/* 문서 텍스트 블록 (실제 위치에 렌더링) */}
                    {ocrResult.pages[ocrPageIdx]?.blocks.map((blk,bi)=>(
                      <div key={`t-${bi}`} className="absolute text-gray-800 leading-tight select-none"
                        style={{
                          left:`${blk.bbox.x}%`,top:`${blk.bbox.y}%`,
                          width:`${blk.bbox.w}%`,
                          fontSize: blk.bbox.h>7?'10px':'8.5px',
                          fontWeight: blk.text.startsWith('제')&&blk.text.includes('조')?'700':'400',
                        }}>
                        {blk.text}
                      </div>
                    ))}
                    {/* OCR 인식 영역 하이라이트 오버레이 */}
                    {ocrShowBbox&&ocrResult.pages[ocrPageIdx]?.blocks.map((blk,bi)=>(
                      <div key={`h-${bi}`}
                        className="absolute rounded-sm border border-indigo-400/70 bg-indigo-200/30 hover:bg-indigo-200/50 transition-colors cursor-default"
                        style={{
                          left:`${blk.bbox.x}%`,top:`${blk.bbox.y}%`,
                          width:`${blk.bbox.w}%`,height:`${Math.max(blk.bbox.h,5)}%`,
                        }}
                        title={blk.text}
                      />
                    ))}
                  </div>
                </div>
              </div>
              {/* 우: 추출 텍스트 편집 */}
              <div className="border-2 rounded-xl overflow-hidden flex flex-col">
                <div className="px-3 py-2 border-b bg-gray-50 text-[11px] font-bold text-gray-500 flex items-center gap-1">
                  <Edit3 size={11}/> 추출 텍스트 (편집 가능)
                </div>
                <textarea
                  value={ocrResult.pages[ocrPageIdx]?.text||''}
                  onChange={e=>setOcrResult(prev=>({...prev,pages:prev.pages.map((p,i)=>i===ocrPageIdx?{...p,text:e.target.value}:p)}))}
                  className="flex-1 p-3 text-xs resize-none border-none outline-none font-mono bg-white"
                  style={{minHeight:180}}
                />
              </div>
            </div>
            {/* 블록 목록 */}
            <div className="border rounded-xl overflow-hidden">
              <div className="px-3 py-2 bg-gray-50 border-b text-[11px] font-bold text-gray-500 flex items-center gap-1">
                <LayoutList size={11}/> 인식 블록 목록 — {ocrResult.pages[ocrPageIdx]?.blocks.length}개
              </div>
              <div className="max-h-28 overflow-y-auto divide-y">
                {ocrResult.pages[ocrPageIdx]?.blocks.map((blk,bi)=>(
                  <div key={bi} className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-indigo-50/40 group">
                    <span className="w-5 text-center text-[9px] font-bold text-indigo-400 shrink-0">#{bi+1}</span>
                    <span className="text-gray-300 font-mono text-[9px] shrink-0">[{blk.bbox.x},{blk.bbox.y}]</span>
                    <span className="flex-1 truncate text-gray-600">{blk.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>}
        </div>}

        {/* ═══ Document Parse 탭 ═══ */}
        {prepTab==='parse'&&<div className="space-y-3">
          {/* 설정 */}
          {parseState==='idle'&&<div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-xs font-medium text-gray-500 block mb-1">출력 형식</label>
                <select value={parseFormat} onChange={e=>setParseFormat(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="markdown">Markdown</option>
                  <option value="html">HTML</option>
                  <option value="text">Plain Text</option>
                </select></div>
              <div><label className="text-xs font-medium text-gray-500 block mb-1">파싱 모드</label>
                <select value={parseMode} onChange={e=>setParseMode(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="auto">Auto (권장)</option>
                  <option value="standard">Standard — 텍스트 중심</option>
                  <option value="enhanced">Enhanced — 표·이미지 포함</option>
                </select></div>
              <div><label className="text-xs font-medium text-gray-500 block mb-1">페이지 분할</label>
                <select value={parseSplit?'page':'doc'} onChange={e=>setParseSplit(e.target.value==='page')} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="doc">문서 단위</option>
                  <option value="page">페이지 단위</option>
                </select></div>
            </div>
            <div className="flex items-center gap-5 px-3 py-2.5 bg-gray-50 border rounded-xl text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={parseCoords} onChange={e=>setParseCoords(e.target.checked)} className="rounded"/>
                <span className="font-medium text-gray-600">좌표 추출</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={parseBase64} onChange={e=>setParseBase64(e.target.checked)} className="rounded"/>
                <span className="font-medium text-gray-600">이미지 Base64</span>
              </label>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-700">
              <FileCode2 size={12} className="shrink-0"/>
              지원 형식: PDF · DOCX · PPTX · XLSX · HWP — 레이아웃·표·수식·그림 자동 추출
            </div>
            <button onClick={runParse} className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors">
              <FileCode2 size={16}/> 문서 파싱 실행
            </button>
          </div>}

          {/* 처리 중 */}
          {parseState==='processing'&&<div className="flex flex-col items-center py-8 gap-3">
            <Loader2 size={36} className="animate-spin text-indigo-600"/>
            <div className="text-sm font-bold text-gray-700">문서 파싱 중...</div>
            <div className="text-xs text-gray-400">문서 레이아웃 구조 분석 중</div>
            <div className="mt-2 space-y-1.5 w-full max-w-xs">
              {['레이아웃 감지','요소 분류 (단락·표·그림)','테이블 구조 추출','마크다운/HTML 변환'].map((step,i)=>(
                <div key={i} className="flex items-center gap-2 text-xs">
                  {i<2?<CheckCircle size={13} className="text-green-500 shrink-0"/>:i===2?<Loader2 size={13} className="animate-spin text-indigo-500 shrink-0"/>:<div className="w-3.5 h-3.5 rounded-full border-2 border-gray-200 shrink-0"/>}
                  <span className={i<3?'text-gray-700':'text-gray-300'}>{step}</span>
                </div>
              ))}
            </div>
          </div>}

          {/* 결과 */}
          {parseState==='done'&&parseResult&&<div className="space-y-3">
            {/* 요소 통계 */}
            <div className="grid grid-cols-5 gap-2">
              {[['단락',parseResult.statistics.paragraphs,'text-blue-600','bg-blue-50'],
                ['제목',parseResult.statistics.headings,'text-purple-600','bg-purple-50'],
                ['표',parseResult.statistics.tables,'text-green-600','bg-green-50'],
                ['그림',parseResult.statistics.figures,'text-orange-600','bg-orange-50'],
                ['합계',parseResult.statistics.total,'text-gray-700','bg-gray-50'],
              ].map(([l,cnt,c,bg])=>(
                <div key={l} className={`${bg} rounded-xl p-2.5 border text-center`}>
                  <div className={`text-xl font-black ${c}`}>{cnt}</div>
                  <div className="text-[10px] text-gray-500 font-medium">{l}</div>
                </div>
              ))}
            </div>
            {/* 2단: 요소 목록 + 편집 가능 출력 */}
            <div className="grid grid-cols-2 gap-3">
              {/* 좌: 감지된 요소 목록 */}
              <div className="border-2 rounded-xl overflow-hidden">
                <div className="px-3 py-2 border-b bg-gray-50 text-[11px] font-bold text-gray-500 flex items-center gap-1">
                  <LayoutList size={11}/> 감지된 요소 ({parseResult.elements.length}개)
                </div>
                <div className="max-h-52 overflow-y-auto divide-y">
                  {parseResult.elements.map((el,i)=>{
                    const tagMap={heading1:'H1',heading2:'H2',heading3:'H3',paragraph:'P',table:'TBL',figure:'IMG',list:'LIST'};
                    const clrMap={heading1:'bg-purple-100 text-purple-700',heading2:'bg-purple-100 text-purple-700',heading3:'bg-purple-100 text-purple-700',paragraph:'bg-blue-100 text-blue-700',table:'bg-green-100 text-green-700',figure:'bg-orange-100 text-orange-700',list:'bg-yellow-100 text-yellow-700'};
                    return(
                      <div key={i} className="flex items-start gap-2 px-3 py-1.5 hover:bg-gray-50 text-xs">
                        <span className={`shrink-0 text-[9px] px-1.5 py-0.5 rounded font-black mt-0.5 ${clrMap[el.category]||'bg-gray-100 text-gray-600'}`}>{tagMap[el.category]||el.category.toUpperCase()}</span>
                        <span className="flex-1 text-gray-600 truncate">{el.content.substring(0,55)}{el.content.length>55?'…':''}</span>
                        {el.page&&<span className="shrink-0 text-[9px] text-gray-300">{el.page}p</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* 우: 출력 편집 */}
              <div className="border-2 rounded-xl overflow-hidden flex flex-col">
                <div className="px-3 py-2 border-b bg-gray-50 text-[11px] font-bold text-gray-500 flex items-center justify-between">
                  <div className="flex items-center gap-1"><Edit3 size={11}/> {parseFormat.toUpperCase()} 출력 (편집)</div>
                  <div className="flex gap-0.5">
                    {['markdown','html','text'].map(f=>(
                      <button key={f} onClick={()=>{setParseFormat(f);setParsedContent(parseResult.outputs[f]);}}
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold transition-colors ${parseFormat===f?'bg-indigo-600 text-white':'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea value={parsedContent} onChange={e=>setParsedContent(e.target.value)}
                  className="flex-1 p-3 text-xs resize-none border-none outline-none font-mono bg-white"
                  style={{minHeight:210}}/>
              </div>
            </div>
            {/* 옵션 적용 안내 */}
            <div className="flex flex-wrap gap-2">
              {parseCoords&&<span className="flex items-center gap-1 text-xs px-2.5 py-1 bg-purple-50 border border-purple-200 rounded-lg text-purple-700 font-medium"><CheckSquare size={11}/>좌표 데이터 포함됨</span>}
              {parseBase64&&<span className="flex items-center gap-1 text-xs px-2.5 py-1 bg-orange-50 border border-orange-200 rounded-lg text-orange-700 font-medium"><CheckSquare size={11}/>이미지 Base64 포함됨</span>}
              {parseSplit&&<span className="flex items-center gap-1 text-xs px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 font-medium"><CheckSquare size={11}/>페이지 단위 분할</span>}
            </div>
          </div>}
        </div>}

        {/* 하단 버튼 */}
        <div className="flex gap-2 pt-3 border-t">
          {(ocrState==='done'||parseState==='done')&&(
            <button onClick={resetPrep} className="px-3 py-2 border rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50">초기화</button>
          )}
          <div className="flex-1"/>
          <button onClick={closePrep} className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">취소</button>
          <button
            disabled={ocrState!=='done'&&parseState!=='done'}
            onClick={()=>{closePrep();showToast('전처리 결과가 RAG 파이프라인에 반영되었습니다.','success');}}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold disabled:opacity-40 hover:bg-indigo-700 transition-colors flex items-center gap-1.5">
            <CheckCircle size={14}/> 전처리 적용 및 색인
          </button>
        </div>

      </div>}
    </Modal>
  </PageShell>);
};

const StatusBadge = ({v}) => {
  const m = {정상:'green',양호:'green',완료:'blue',대기중:'yellow',처리중:'blue',오류:'red',실패:'red',경고:'yellow',주의:'yellow',수동처리필요:'red',검토중:'yellow',미처리:'red',신규:'purple'};
  const c = m[v]||'gray';
  const cls = {green:'bg-green-100 text-green-700',blue:'bg-blue-100 text-blue-700',yellow:'bg-yellow-100 text-yellow-700',red:'bg-red-100 text-red-700',purple:'bg-purple-100 text-purple-700',gray:'bg-gray-100 text-gray-600'};
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap ${cls[c]}`}>{v}</span>;
};

export const RagPipelinePage = () => {
  const [tab, setTab] = useState('sources');
  const [selChunk, setSelChunk] = useState(null);
  const [rpQueue, setRpQueue] = useState(MOCK_REPROCESS_QUEUE.map(r=>({...r})));
  const toast = useToast();

  const stColor = {완료:'text-green-600',처리중:'text-blue-600',실패:'text-red-600',대기:'text-gray-400'};
  const stIcon  = {완료:'✓',처리중:'⟳',실패:'✗',대기:'…'};

  const TABS = [
    {id:'sources',label:'📡 데이터 소스'},{id:'monitor',label:'📊 처리 모니터링'},
    {id:'chunk',label:'🧩 청크 품질'},{id:'embed',label:'🔢 임베딩 품질'},{id:'queue',label:'🔄 재처리 큐'},
  ];

  return (
    <PageShell breadcrumb={['지식·RAG','RAG 파이프라인']} title="RAG 파이프라인 관리" sub="데이터 수집 · 전처리 · 임베딩 · 품질 통합 관리">
      {/* Tab bar */}
      <div className="flex gap-0.5 mb-6 border-b border-gray-200 -mx-6 px-6">
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={`px-4 py-2.5 text-[13px] font-bold border-b-2 transition-colors whitespace-nowrap ${tab===t.id?'border-blue-600 text-blue-700 bg-blue-50/60':'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab 1: 데이터 소스 ── */}
      {tab==='sources' && (
        <div className="space-y-6">
          {/* 내부 시스템 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-[15px] text-gray-800 flex items-center gap-2"><Database className="w-4 h-4 text-blue-600"/> 내부 시스템 연계</h3>
              <button onClick={()=>toast('소스 추가 다이얼로그가 열립니다.')} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[12px] font-bold hover:bg-blue-700 shadow-sm"><Plus className="w-3.5 h-3.5"/> 소스 추가</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {MOCK_DATA_SOURCES_INT.map(src=>(
                <div key={src.id} className="bg-white rounded-2xl border-2 border-gray-100 p-5 shadow-sm hover:border-blue-200 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${src.status==='정상'?'bg-green-500 shadow-[0_0_6px_#22c55e]':src.status==='경고'?'bg-yellow-500':'bg-red-500'}`}/>
                      <span className="font-black text-[14px] text-gray-800">{src.name}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">{src.protocol}</span>
                    </div>
                    <StatusBadge v={src.status}/>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 text-[12px]">
                    <div><div className="text-gray-400 font-medium">대상 폴더</div><div className="font-bold text-gray-800">{src.target}</div></div>
                    <div><div className="text-gray-400 font-medium">수집 문서</div><div className="font-bold text-gray-800">{src.docCount.toLocaleString()}건 <span className="text-green-600">+{src.newToday}건</span></div></div>
                    <div><div className="text-gray-400 font-medium">스케줄</div><div className="font-bold text-gray-700">{src.schedule}</div></div>
                    <div><div className="text-gray-400 font-medium">마지막 동기화</div><div className="font-bold text-gray-700">{src.lastSync}</div></div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button onClick={()=>toast(`${src.name} 수동 동기화가 시작되었습니다.`)} className="flex items-center gap-1 px-2.5 py-1 bg-gray-800 text-white rounded-lg text-[11px] font-bold hover:bg-gray-700"><RotateCcw className="w-3 h-3"/> 즉시 동기화</button>
                    <button onClick={()=>toast(`${src.name} 설정 편집창이 열립니다.`)} className="flex items-center gap-1 px-2.5 py-1 border border-gray-200 text-gray-600 rounded-lg text-[11px] font-bold hover:bg-gray-50"><Settings className="w-3 h-3"/> 설정</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* 외부 연계 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-[15px] text-gray-800 flex items-center gap-2"><Globe className="w-4 h-4 text-purple-600"/> 외부 연계 (Open API / 크롤링)</h3>
              <button onClick={()=>toast('외부 소스 추가 다이얼로그가 열립니다.')} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-[12px] font-bold hover:bg-purple-700 shadow-sm"><Plus className="w-3.5 h-3.5"/> 외부 소스 추가</button>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-[13px]">
                <thead><tr className="border-b-2 border-gray-100 bg-gray-50">{['소스명','방식','대상 폴더','수집 스케줄','마지막 수집','문서 수','상태',''].map(h=><th key={h} className="text-left font-bold text-gray-500 py-2.5 px-4 text-[11px] uppercase tracking-wide">{h}</th>)}</tr></thead>
                <tbody>{MOCK_DATA_SOURCES_EXT.map(src=>(
                  <tr key={src.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4"><div className="font-bold text-gray-800">{src.name}</div><div className="text-[11px] text-gray-400 font-mono">{src.url}</div></td>
                    <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded text-[11px] font-bold ${src.method==='Open API'?'bg-blue-100 text-blue-700':'bg-orange-100 text-orange-700'}`}>{src.method}</span></td>
                    <td className="py-3 px-4 text-gray-600">{src.target}</td>
                    <td className="py-3 px-4 text-gray-600 text-[12px]">{src.schedule}</td>
                    <td className="py-3 px-4 text-gray-500 text-[12px]">{src.lastSync}</td>
                    <td className="py-3 px-4 font-bold text-gray-800">{src.docCount.toLocaleString()} <span className="text-green-600 text-[11px] font-bold">+{src.newToday}</span></td>
                    <td className="py-3 px-4"><StatusBadge v={src.status}/></td>
                    <td className="py-3 px-4"><button onClick={()=>toast(`${src.name} 즉시 수집이 시작되었습니다.`)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"><RotateCcw className="w-3.5 h-3.5"/></button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
          {/* 메타데이터 & 접근권한 안내 */}
          <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0"><Shield className="w-5 h-5 text-blue-600"/></div>
            <div>
              <div className="font-black text-[14px] text-blue-800 mb-1">메타데이터 기반 접근 권한 관리</div>
              <p className="text-[13px] text-blue-700 font-medium">수집 문서의 소속 부서, 보안 등급, 문서 유형 메타데이터를 자동 추출하여 벡터 DB에 저장합니다. 검색 시 사용자 부서 및 권한 레벨에 따라 검색 대상 컬렉션을 자동 필터링하며, 최신 문서(수집일 기준)에 가중치 부스팅을 적용하여 최신 자료가 우선 답변에 활용됩니다.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: 처리 모니터링 ── */}
      {tab==='monitor' && (
        <div className="space-y-5">
          <div className="grid grid-cols-5 gap-4">
            {[{label:'오늘 신규 수집',v:22,c:'text-blue-600',bg:'bg-blue-50'},{label:'오늘 업데이트',v:8,c:'text-green-600',bg:'bg-green-50'},{label:'삭제 감지',v:1,c:'text-orange-600',bg:'bg-orange-50'},{label:'처리 실패',v:2,c:'text-red-600',bg:'bg-red-50'},{label:'임베딩 대기',v:14,c:'text-yellow-600',bg:'bg-yellow-50'}].map(s=>(
              <div key={s.label} className={`${s.bg} rounded-2xl border border-gray-100 p-4 text-center shadow-sm`}>
                <div className={`text-2xl font-black ${s.c}`}>{s.v}</div>
                <div className="text-[11px] text-gray-500 font-medium mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          {/* 파일 유형별 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h4 className="font-black text-[14px] text-gray-700 mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500"/> 오늘 파일 유형별 처리 현황</h4>
            <div className="flex flex-wrap gap-3">
              {[{t:'PDF',n:14,c:'bg-red-100 text-red-700'},{t:'XLSX',n:4,c:'bg-green-100 text-green-700'},{t:'DOCX',n:2,c:'bg-blue-100 text-blue-700'},{t:'PPTX',n:1,c:'bg-orange-100 text-orange-700'},{t:'JSON',n:1,c:'bg-gray-100 text-gray-700'},{t:'크롤링',n:3,c:'bg-purple-100 text-purple-700'}].map(t=>(
                <div key={t.t} className={`flex items-center gap-2 px-4 py-2 rounded-xl ${t.c} font-bold text-[13px]`}>{t.t} <span className="font-black">{t.n}건</span></div>
              ))}
            </div>
          </div>
          {/* 파이프라인 처리 이력 테이블 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
              <h4 className="font-black text-[14px] text-gray-700">처리 이력 (최근 7건)</h4>
              <div className="flex items-center gap-3 text-[12px] text-gray-500 flex-wrap">
                {[['green','완료'],['blue','처리중'],['red','실패'],['gray','대기']].map(([cl,lb])=>(
                  <span key={lb} className="flex items-center gap-1"><span className={`w-2 h-2 rounded-full bg-${cl}-500 inline-block`}/>{lb}</span>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead><tr className="border-b border-gray-100 bg-gray-50">{['문서명','폴더','소스','유형','수집 일시','파싱','청킹','임베딩','청크 수','PII','변경유형'].map(h=><th key={h} className="text-left font-bold text-gray-500 py-2.5 px-3 text-[11px] uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
                <tbody>{MOCK_DOC_PIPELINE.map(d=>(
                  <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 px-3 font-bold text-gray-800 max-w-[160px] truncate" title={d.name}>{d.name}</td>
                    <td className="py-2.5 px-3 text-gray-600 whitespace-nowrap">{d.folder}</td>
                    <td className="py-2.5 px-3 text-gray-500">{d.src}</td>
                    <td className="py-2.5 px-3"><span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-bold">{d.type}</span></td>
                    <td className="py-2.5 px-3 text-gray-500 whitespace-nowrap">{d.ingest}</td>
                    <td className={`py-2.5 px-3 text-center font-black text-lg ${stColor[d.parseStatus]}`}>{stIcon[d.parseStatus]}</td>
                    <td className={`py-2.5 px-3 text-center font-black text-lg ${stColor[d.chunkStatus]}`}>{stIcon[d.chunkStatus]}</td>
                    <td className={`py-2.5 px-3 text-center font-black text-lg ${stColor[d.embedStatus]}`}>{stIcon[d.embedStatus]}</td>
                    <td className="py-2.5 px-3 font-mono text-gray-700">{d.chunks>0?d.chunks.toLocaleString():'–'}</td>
                    <td className="py-2.5 px-3 text-center">{d.pii?<span className="text-red-500 font-black text-[11px]">⚠PII</span>:<span className="text-gray-300 text-[11px]">–</span>}</td>
                    <td className="py-2.5 px-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${d.changeType==='신규'?'bg-blue-100 text-blue-700':d.changeType==='업데이트'?'bg-yellow-100 text-yellow-700':'bg-gray-100 text-gray-600'}`}>{d.changeType}</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
          {/* 이력 관리 안내 배너 */}
          <div className="bg-indigo-50 border-2 border-indigo-100 rounded-2xl p-4 flex items-center gap-4">
            <History className="w-5 h-5 text-indigo-500 shrink-0"/>
            <p className="text-[13px] text-indigo-700 font-medium">자료실 문서 변경 사항(신규·업데이트·삭제)은 자동 감지되어 위 이력에 기록됩니다. 각 문서의 버전 이력 및 이전 벡터 스냅샷은 <strong>30일간 보관</strong>됩니다.</p>
          </div>
        </div>
      )}

      {/* ── Tab 3: 청크 품질 ── */}
      {tab==='chunk' && (
        <div className="space-y-5">
          <div className="grid grid-cols-4 gap-4">
            {[{label:'평균 청크 길이',v:'154자',sub:'권장 100~300자',ok:true},{label:'특수문자 비율',v:'3.1%',sub:'임계 5% 초과 시 경고',ok:true},{label:'중복 청크 비율',v:'2.1%',sub:'임계 5% 초과 시 경고',ok:true},{label:'의미 완결성 평균',v:'84.8점',sub:'임계 70점 미만 경고',ok:true}].map(s=>(
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className="text-[11px] text-gray-500 font-medium mb-1">{s.label}</div>
                <div className="text-xl font-black text-gray-800">{s.v}</div>
                <div className={`text-[11px] mt-1 font-medium ${s.ok?'text-green-600':'text-red-600'}`}>{s.sub}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-5 items-start">
            {/* Quality table */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-w-0">
              <div className="px-5 py-3.5 border-b border-gray-100">
                <h4 className="font-black text-[14px] text-gray-700">문서별 청크 품질 현황</h4>
                <p className="text-[12px] text-gray-400 mt-0.5">행 클릭 시 청크 미리보기 패널에 표시됩니다.</p>
              </div>
              <table className="w-full text-[12px]">
                <thead><tr className="border-b border-gray-100 bg-gray-50">{['문서명','폴더','평균길이','특수문자%','중복%','의미점수','상태',''].map(h=><th key={h} className="text-left font-bold text-gray-500 py-2 px-3 text-[11px] uppercase">{h}</th>)}</tr></thead>
                <tbody>{MOCK_CHUNK_QUALITY.map(d=>(
                  <tr key={d.docId} onClick={()=>setSelChunk(d)} className={`border-b border-gray-50 cursor-pointer transition-colors ${selChunk?.docId===d.docId?'bg-blue-50 border-l-4 border-l-blue-500':'hover:bg-gray-50'}`}>
                    <td className="py-2.5 px-3 font-bold text-gray-800 max-w-[150px] truncate" title={d.name}>{d.name}</td>
                    <td className="py-2.5 px-3 text-gray-500 whitespace-nowrap">{d.folder}</td>
                    <td className="py-2.5 px-3 font-mono text-gray-700">{d.avgLen}자</td>
                    <td className={`py-2.5 px-3 font-mono font-bold ${d.specialCharPct>5?'text-red-600':d.specialCharPct>3?'text-yellow-600':'text-green-600'}`}>{d.specialCharPct}%</td>
                    <td className={`py-2.5 px-3 font-mono font-bold ${d.dupPct>5?'text-red-600':d.dupPct>3?'text-yellow-600':'text-green-600'}`}>{d.dupPct}%</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-gray-100"><div className={`h-full rounded-full ${d.semanticScore>=90?'bg-green-500':d.semanticScore>=75?'bg-yellow-500':'bg-red-500'}`} style={{width:`${d.semanticScore}%`}}/></div>
                        <span className="font-mono font-bold text-gray-700 text-[11px]">{d.semanticScore}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3"><StatusBadge v={d.status}/></td>
                    <td className="py-2.5 px-3"><button onClick={e=>{e.stopPropagation();toast(`${d.name} 청킹 재적용이 시작되었습니다.`);}} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600"><RotateCcw className="w-3.5 h-3.5"/></button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            {/* Chunk preview */}
            <div className="w-80 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 shrink-0">
              <h4 className="font-black text-[13px] text-gray-700 mb-3 flex items-center gap-2"><Eye className="w-4 h-4 text-blue-500"/> 청크 미리보기</h4>
              {selChunk ? (
                <div>
                  <div className="text-[12px] text-gray-500 font-medium mb-3 p-2 bg-gray-50 rounded-lg">{selChunk.name}</div>
                  <div className="space-y-3">
                    {MOCK_CHUNK_PREVIEW.map(c=>(
                      <div key={c.idx} className="p-3 rounded-xl border-2 border-gray-100 bg-gray-50">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-black text-gray-400">청크 #{c.idx}</span>
                          <div className="flex gap-2">
                            <span className="text-[10px] text-gray-400">{c.len}자</span>
                            <span className={`text-[10px] font-bold ${c.score>=90?'text-green-600':'text-yellow-600'}`}>의미:{c.score}</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-700 leading-relaxed">{c.text.substring(0,120)}…</p>
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>toast('청킹 규칙 재적용이 시작되었습니다.')} className="w-full mt-3 py-2 rounded-xl bg-blue-600 text-white text-[12px] font-bold hover:bg-blue-700 transition-colors">청킹 규칙 재적용</button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-52 text-gray-400">
                  <FileText className="w-10 h-10 mb-2 text-gray-200"/>
                  <p className="text-[13px] font-medium text-center">좌측 표에서 문서를 선택하면<br/>청크 미리보기가 표시됩니다</p>
                </div>
              )}
            </div>
          </div>
          {/* Chunking rules */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h4 className="font-black text-[14px] text-gray-700 mb-4 flex items-center gap-2"><SlidersHorizontal className="w-4 h-4 text-indigo-500"/> 청킹 규칙 전역 설정</h4>
            <div className="grid grid-cols-4 gap-5 mb-4">
              {[{label:'기본 청크 크기',unit:'토큰',val:'512'},{label:'오버랩 크기',unit:'토큰',val:'64'},{label:'최소 청크 길이',unit:'자',val:'30'},{label:'최대 청크 길이',unit:'자',val:'800'}].map(r=>(
                <div key={r.label}>
                  <label className="text-[12px] font-bold text-gray-600 block mb-1.5">{r.label}</label>
                  <div className="flex items-center gap-2">
                    <input defaultValue={r.val} className="w-full border-2 border-gray-200 rounded-lg px-3 py-1.5 text-[13px] font-mono font-bold text-gray-800 focus:outline-none focus:border-blue-400"/>
                    <span className="text-[12px] text-gray-400 whitespace-nowrap">{r.unit}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-[12px] font-bold text-gray-600">분할 방식:</span>
              {['문장 단위 분할','절/항 단위 분할 (공문서 최적화)','시멘틱 분할 (실험적)'].map((m,i)=>(
                <label key={m} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="chunkMethod" defaultChecked={i===2} className="accent-blue-600"/>
                  <span className="text-[13px] font-medium text-gray-700">{m}</span>
                </label>
              ))}
              <button onClick={()=>toast('청킹 규칙이 저장되었습니다.')} className="ml-auto px-4 py-1.5 bg-blue-600 text-white rounded-lg text-[12px] font-bold hover:bg-blue-700 shadow-sm">저장</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 4: 임베딩 품질 ── */}
      {tab==='embed' && (
        <div className="space-y-5">
          {/* Today stats */}
          <div className="grid grid-cols-5 gap-4">
            {[{label:'오늘 처리',v:MOCK_EMBED_STATUS.today.total,c:'text-gray-800',bg:'bg-white'},{label:'성공',v:MOCK_EMBED_STATUS.today.success,c:'text-green-600',bg:'bg-green-50'},{label:'실패',v:MOCK_EMBED_STATUS.today.fail,c:'text-red-600',bg:'bg-red-50'},{label:'대기',v:MOCK_EMBED_STATUS.today.pending,c:'text-yellow-600',bg:'bg-yellow-50'},{label:'성공률',v:`${MOCK_EMBED_STATUS.today.successRate}%`,c:'text-blue-600',bg:'bg-blue-50'}].map(s=>(
              <div key={s.label} className={`${s.bg} rounded-2xl border border-gray-100 p-4 text-center shadow-sm`}>
                <div className={`text-2xl font-black ${s.c}`}>{s.v}</div>
                <div className="text-[11px] text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          {/* Models + VectorDB */}
          <div className="grid grid-cols-3 gap-4">
            {MOCK_EMBED_STATUS.models.map(m=>(
              <div key={m.name} className="bg-white rounded-2xl border-2 border-gray-100 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3"><div className="font-black text-[14px] text-gray-800">{m.name}</div><StatusBadge v={m.status}/></div>
                <div className="space-y-2 text-[12px]">
                  {[['벡터 차원',`${m.dim}차원`],['임베딩 문서',`${m.docs.toLocaleString()}건`],['평균 지연',`${m.avgLatency}ms`],['마지막 갱신',m.lastUpdated]].map(([k,v])=>(
                    <div key={k} className="flex justify-between"><span className="text-gray-400">{k}</span><span className="font-bold text-gray-700">{v}</span></div>
                  ))}
                </div>
              </div>
            ))}
            <div className="bg-white rounded-2xl border-2 border-blue-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="font-black text-[14px] text-gray-800 flex items-center gap-2"><Database className="w-4 h-4 text-blue-500"/>{MOCK_EMBED_STATUS.vectorDb.name}</div>
                <StatusBadge v={MOCK_EMBED_STATUS.vectorDb.status}/>
              </div>
              <div className="space-y-2 text-[12px]">
                {[['컬렉션 수',`${MOCK_EMBED_STATUS.vectorDb.collections}개`],['총 벡터 수',MOCK_EMBED_STATUS.vectorDb.totalVectors.toLocaleString()],['디스크 사용',MOCK_EMBED_STATUS.vectorDb.diskUsage],['쿼리 지연',`${MOCK_EMBED_STATUS.vectorDb.queryLatency}ms`],['인덱스 타입',MOCK_EMBED_STATUS.vectorDb.indexType]].map(([k,v])=>(
                  <div key={k} className="flex justify-between"><span className="text-gray-400">{k}</span><span className="font-bold text-gray-700">{v}</span></div>
                ))}
              </div>
            </div>
          </div>
          {/* Weekly trend */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h4 className="font-black text-[14px] text-gray-700 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-500"/> 주간 임베딩 처리 추이</h4>
            <div className="flex items-end gap-2" style={{height:'100px'}}>
              {MOCK_EMBED_STATUS.weeklyTrend.map(d=>{
                const max=1500;
                const sh=Math.max(4,Math.round((d.success/max)*88));
                const fh=Math.max(2,Math.round((d.fail/max)*88));
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5">
                    <div className="w-full flex flex-col items-center" style={{height:'88px',justifyContent:'flex-end'}}>
                      <div className="w-full rounded-t bg-red-300" style={{height:`${fh}px`}} title={`실패 ${d.fail}`}/>
                      <div className="w-full bg-green-400 rounded-b" style={{height:`${sh}px`}} title={`성공 ${d.success}`}/>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">{d.date}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-2 text-[11px] font-medium">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-400 inline-block"/> 성공</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-300 inline-block"/> 실패</span>
            </div>
          </div>
          {/* Re-rank 모델 안내 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h4 className="font-black text-[14px] text-gray-700 mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-yellow-500"/> 검색 성능 향상 — Re-rank 모델 제안</h4>
            <div className="grid grid-cols-3 gap-4">
              {[{name:'BGE Reranker v2',desc:'한국어 교차 인코더. 상위 20개 후보에서 의미 기반 재순위화. MRR@10 기준 +18% 향상',badge:'권장',bc:'bg-green-100 text-green-700'},{name:'ColBERT v2',desc:'토큰 레벨 후기 상호작용. 긴 문서(1,000자↑) 검색에 효과적. 지연 +12ms',badge:'고성능',bc:'bg-blue-100 text-blue-700'},{name:'Cohere Rerank 3',desc:'다국어 지원. 한/영 혼용 문서에 최적화. API 방식으로 인프라 추가 불필요',badge:'외부API',bc:'bg-purple-100 text-purple-700'}].map(r=>(
                <div key={r.name} className="p-4 rounded-xl border-2 border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2"><span className="font-black text-[14px] text-gray-800">{r.name}</span><span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${r.bc}`}>{r.badge}</span></div>
                  <p className="text-[12px] text-gray-600 font-medium">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Anomaly detection */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h4 className="font-black text-[14px] text-gray-700 mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-yellow-500"/> 이상치 탐지 ({MOCK_EMBED_STATUS.anomalies.length}건)</h4>
            <div className="space-y-3">
              {MOCK_EMBED_STATUS.anomalies.map(a=>(
                <div key={a.id} className={`flex items-start justify-between p-4 rounded-xl border-2 ${a.status==='미처리'?'border-red-200 bg-red-50':'border-yellow-200 bg-yellow-50'}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[11px] font-black px-2 py-0.5 rounded ${a.status==='미처리'?'bg-red-200 text-red-700':'bg-yellow-200 text-yellow-700'}`}>{a.type}</span>
                      <span className="text-[13px] font-bold text-gray-800">{a.doc}</span>
                    </div>
                    <p className="text-[12px] text-gray-600">{a.desc}</p>
                    <p className="text-[11px] text-gray-400 mt-1">탐지 시각: {a.detected}</p>
                  </div>
                  <div className="flex gap-2 shrink-0 ml-4 items-center">
                    <StatusBadge v={a.status}/>
                    <button onClick={()=>toast(`${a.doc} 재처리 큐에 추가되었습니다.`)} className="px-3 py-1 bg-gray-800 text-white rounded-lg text-[11px] font-bold hover:bg-gray-700">재처리</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 5: 재처리 큐 ── */}
      {tab==='queue' && (
        <div className="space-y-5">
          <div className="grid grid-cols-4 gap-4">
            {[{label:'대기 중',v:rpQueue.filter(r=>r.status==='대기중').length,c:'text-yellow-600',bg:'bg-yellow-50'},{label:'수동 처리 필요',v:rpQueue.filter(r=>r.status==='수동처리필요').length,c:'text-red-600',bg:'bg-red-50'},{label:'높음 우선순위',v:rpQueue.filter(r=>r.priority==='높음').length,c:'text-orange-600',bg:'bg-orange-50'},{label:'평균 재시도 횟수',v:`${(rpQueue.reduce((s,r)=>s+r.retryCount,0)/rpQueue.length).toFixed(1)}회`,c:'text-gray-700',bg:'bg-gray-50'}].map(s=>(
              <div key={s.label} className={`${s.bg} rounded-2xl border border-gray-100 p-4 text-center shadow-sm`}>
                <div className={`text-2xl font-black ${s.c}`}>{s.v}</div>
                <div className="text-[11px] text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
              <h4 className="font-black text-[14px] text-gray-700">재처리 대기 목록</h4>
              <div className="flex gap-2">
                <button onClick={()=>{setRpQueue(q=>q.map(r=>r.status==='대기중'?{...r,retryCount:r.retryCount+1}:r));toast(`${rpQueue.filter(r=>r.status==='대기중').length}건 일괄 재처리가 시작되었습니다.`);}} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[12px] font-bold hover:bg-blue-700 shadow-sm"><RotateCcw className="w-3.5 h-3.5"/> 전체 재처리</button>
                <button onClick={()=>toast('완료된 항목이 큐에서 제거되었습니다.')} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-[12px] font-bold hover:bg-gray-50"><Trash2 className="w-3.5 h-3.5"/> 완료 항목 정리</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead><tr className="border-b border-gray-100 bg-gray-50">{['우선순위','문서명','폴더','소스','실패 단계','오류 내용','실패 시각','재시도','상태',''].map(h=><th key={h} className="text-left font-bold text-gray-500 py-2.5 px-3 text-[11px] uppercase whitespace-nowrap">{h}</th>)}</tr></thead>
                <tbody>{rpQueue.map(r=>(
                  <tr key={r.id} className={`border-b border-gray-50 hover:bg-gray-50 ${r.status==='수동처리필요'?'bg-red-50/40':''}`}>
                    <td className="py-3 px-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${r.priority==='높음'?'bg-red-100 text-red-700':'bg-gray-100 text-gray-600'}`}>{r.priority}</span></td>
                    <td className="py-3 px-3 font-bold text-gray-800 max-w-[130px] truncate" title={r.doc}>{r.doc}</td>
                    <td className="py-3 px-3 text-gray-600 whitespace-nowrap">{r.folder}</td>
                    <td className="py-3 px-3 text-gray-500">{r.src}</td>
                    <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700 text-[11px] font-bold">{r.stage}</span></td>
                    <td className="py-3 px-3 text-gray-600 max-w-[220px] truncate" title={r.error}>{r.error}</td>
                    <td className="py-3 px-3 text-gray-400 whitespace-nowrap">{r.failedAt}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-gray-600">{r.retryCount}회</td>
                    <td className="py-3 px-3"><StatusBadge v={r.status}/></td>
                    <td className="py-3 px-3">
                      {r.status==='대기중' && <button onClick={()=>{setRpQueue(q=>q.map(x=>x.id===r.id?{...x,retryCount:x.retryCount+1}:x));toast(`${r.doc} 재처리를 시작합니다.`);}} className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[11px] font-bold hover:bg-blue-700"><RotateCcw className="w-3 h-3"/> 재처리</button>}
                      {r.status==='수동처리필요' && <button onClick={()=>toast(`${r.doc}: 파일 복호화 또는 분할 처리가 필요합니다.`)} className="flex items-center gap-1 px-2.5 py-1 bg-orange-500 text-white rounded-lg text-[11px] font-bold hover:bg-orange-600">수동 처리</button>}
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
          <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl p-4 flex items-start gap-4">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5"/>
            <div className="text-[13px] text-amber-800 font-medium">
              <strong>수동 처리 필요 항목</strong>은 암호화 파일, 토큰 초과 문서, 손상 파일 등 자동 재처리가 불가한 경우입니다.
              해당 파일을 <strong>복호화하거나 분할 업로드</strong>한 후 재처리 버튼을 눌러주세요. 3회 이상 실패한 항목은 담당자에게 Slack 알림이 발송됩니다.
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
};

// ==================== MAIN APP ====================
