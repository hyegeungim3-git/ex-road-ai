import React, { useState } from 'react';
import { Plus, X, Trash2, MessageSquare, Edit3 } from 'lucide-react';
import { MOCK_NOTICES_MGMT, MOCK_QNA_MGMT, MOCK_SURVEYS_MGMT, MOCK_APIS, MOCK_API_APPROVALS, MOCK_PROMPTS_MGMT, MOCK_ANNOUNCEMENTS, ADMIN_PERSONA, ADMIN_PROMPT_PREVIEW_INTRO } from '../mocks.js';
import { StatusBadge, Modal, PageShell, useToast, ToggleSwitch } from '../common.jsx';

export const AnnouncementPage = () => {
  const toast=useToast();
  const [announcements,setAnnouncements]=useState(MOCK_ANNOUNCEMENTS.map(a=>({...a})));
  const [showCreate,setShowCreate]=useState(false);const [detail,setDetail]=useState(null);
  const [form,setForm]=useState({title:'',category:'공지',content:'',startDate:'2026-02-11',endDate:'2026-03-11'});
  return (
    <PageShell breadcrumb={['관리자 전용','공지사항']} title="공지사항 관리" action={<button onClick={()=>setShowCreate(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"><Plus size={16} className="mr-1.5"/>공지 등록</button>}>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-gray-50/80"><tr>
          <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">제목</th>
          <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">분류</th>
          <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">게시 기간</th>
          <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">작성자</th>
          <th className="px-5 py-3.5 text-right text-xs font-medium text-gray-500">조회수</th>
          <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">상태</th>
          <th className="px-5 py-3.5 text-center text-xs font-medium text-gray-500">게시</th>
        </tr></thead><tbody className="divide-y divide-gray-100">{announcements.map(a=>(
          <tr key={a.id} className="hover:bg-gray-50/50 cursor-pointer" onClick={()=>setDetail(a)}>
            <td className="px-5 py-3.5 font-medium">{a.title}</td>
            <td className="px-5 py-3.5"><span className={`px-2 py-0.5 rounded-md text-xs font-medium ${a.category==='공지'?'bg-blue-50 text-blue-700':a.category==='점검'?'bg-orange-50 text-orange-700':'bg-green-50 text-green-700'}`}>{a.category}</span></td>
            <td className="px-5 py-3.5 text-gray-400 text-xs">{a.startDate} ~ {a.endDate}</td>
            <td className="px-5 py-3.5 text-gray-500">{a.author}</td>
            <td className="px-5 py-3.5 text-right font-medium">{a.views}</td>
            <td className="px-5 py-3.5"><StatusBadge status={a.status}/></td>
            <td className="px-5 py-3.5 text-center" onClick={e=>e.stopPropagation()}>
              <ToggleSwitch on={a.status==='게시 중'} onClick={()=>{setAnnouncements(p=>p.map(x=>x.id===a.id?{...x,status:x.status==='게시 중'?'중지':'게시 중'}:x));toast(a.status==='게시 중'?'공지가 중지되었습니다':'공지가 게시되었습니다',a.status==='게시 중'?'info':'success');}}/>
            </td>
          </tr>
        ))}</tbody></table>
      </div>
      <Modal isOpen={showCreate} onClose={()=>setShowCreate(false)} title="공지 등록" size="lg">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">제목</label><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">분류</label><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"><option>공지</option><option>점검</option><option>업데이트</option></select></div>
            <div><label className="block text-sm font-medium mb-1">시작일</label><input type="date" value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
            <div><label className="block text-sm font-medium mb-1">종료일</label><input type="date" value={form.endDate} onChange={e=>setForm({...form,endDate:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">내용</label><textarea value={form.content} onChange={e=>setForm({...form,content:e.target.value})} rows={5} placeholder="공지 내용을 입력하세요..." className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <button onClick={()=>{if(!form.title)return;setAnnouncements(p=>[{id:p.length+1,title:form.title,category:form.category,startDate:form.startDate,endDate:form.endDate,author:ADMIN_PERSONA.name,views:0,status:'게시 중',content:form.content},...p]);setShowCreate(false);setForm({title:'',category:'공지',content:'',startDate:'2026-02-11',endDate:'2026-03-11'});toast('공지가 등록되었습니다');}} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm">등록</button>
        </div>
      </Modal>
      <Modal isOpen={!!detail} onClose={()=>setDetail(null)} title={detail?.title} size="lg">
        {detail&&<div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">{[['분류',detail.category],['작성자',detail.author],['조회수',detail.views],['게시 기간',`${detail.startDate} ~ ${detail.endDate}`],['상태',detail.status]].map(([k,v],i)=>(
            <div key={i} className={`bg-gray-50 p-3 rounded-lg ${i===3?'col-span-2':''}`}><div className="text-xs text-gray-400">{k}</div><div className="font-medium">{v}</div></div>
          ))}</div>
          {detail.content&&<div className="bg-gray-50 p-4 rounded-lg text-sm">{detail.content}</div>}
          <div className="flex space-x-2">
            <button onClick={()=>{setAnnouncements(p=>p.filter(x=>x.id!==detail.id));setDetail(null);toast('공지가 삭제되었습니다','info');}} className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-100">삭제</button>
          </div>
        </div>}
      </Modal>
    </PageShell>
  );
};

export const ContentMgmtPage = () => {
  const [tab, setTab] = useState('notice');
  const [notices, setNotices] = useState(MOCK_NOTICES_MGMT.map(n=>({...n})));
  const [qnas, setQnas] = useState(MOCK_QNA_MGMT.map(q=>({...q})));
  const [selQ, setSelQ] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [newNotice, setNewNotice] = useState({title:'',type:'공지',content:''});
  const [editNotice, setEditNotice] = useState(null);  // 공지 수정 중(사본)
  const [qFilter, setQFilter] = useState('전체');       // Q&A 상태 필터
  const toast = useToast();
  const TABS = [{id:'notice',label:'📢 공지사항'},{id:'qna',label:'❓ Q&A 게시판'},{id:'survey',label:'📋 설문조사'}];
  const tcls = {공지:'bg-blue-100 text-blue-700',업데이트:'bg-green-100 text-green-700',점검:'bg-orange-100 text-orange-700',매뉴얼:'bg-purple-100 text-purple-700'};
  const qcls = {답변완료:'bg-green-100 text-green-700',처리중:'bg-blue-100 text-blue-700',대기:'bg-yellow-100 text-yellow-700'};
  return (
    <PageShell breadcrumb={['운영·관리','콘텐츠 관리']} title="콘텐츠 관리" sub="공지사항 · Q&A · 설문조사 게시 및 관리">
      <div className="flex gap-0.5 mb-6 border-b border-gray-200 -mx-6 px-6">
        {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`px-4 py-2.5 text-[13px] font-bold border-b-2 whitespace-nowrap transition-colors ${tab===t.id?'border-blue-600 text-blue-700 bg-blue-50/60':'border-transparent text-gray-500 hover:text-gray-700'}`}>{t.label}</button>)}
      </div>
      {tab==='notice' && (
        <div className="space-y-4">
          <div className="flex justify-end"><button onClick={()=>setShowNoticeForm(true)} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-[13px] font-bold hover:bg-blue-700 shadow-sm"><Plus className="w-4 h-4"/> 공지 등록</button></div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-[13px]">
              <thead><tr className="border-b border-gray-100 bg-gray-50">{['유형','제목','작성자','등록일','조회수','고정','게시',''].map(h=><th key={h} className="text-left font-bold text-gray-500 py-2.5 px-4 text-[11px] uppercase">{h}</th>)}</tr></thead>
              <tbody>{notices.map(n=>(
                <tr key={n.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded text-[11px] font-bold ${tcls[n.type]||'bg-gray-100 text-gray-600'}`}>{n.type}</span></td>
                  <td className="py-3 px-4 font-bold text-gray-800">{n.pinned&&<span className="text-red-500 mr-1">📌</span>}{n.title}</td>
                  <td className="py-3 px-4 text-gray-600">{n.author}</td>
                  <td className="py-3 px-4 text-gray-500">{n.date}</td>
                  <td className="py-3 px-4 text-gray-600">{n.views}</td>
                  <td className="py-3 px-4"><button onClick={()=>{setNotices(ns=>ns.map(x=>x.id===n.id?{...x,pinned:!x.pinned}:x));toast(`고정 ${n.pinned?'해제':'설정'} 완료`);}} className={`text-[11px] font-bold px-2 py-0.5 rounded ${n.pinned?'bg-red-100 text-red-600':'bg-gray-100 text-gray-500'}`}>{n.pinned?'고정중':'고정'}</button></td>
                  <td className="py-3 px-4"><ToggleSwitch on={n.active} onChange={v=>{setNotices(ns=>ns.map(x=>x.id===n.id?{...x,active:v}:x));}} size="sm"/></td>
                  <td className="py-3 px-4 flex gap-1"><button aria-label={`${n.title} 수정`} onClick={()=>setEditNotice({...n})} className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600"><Edit3 className="w-3.5 h-3.5"/></button><button onClick={()=>{setNotices(ns=>ns.filter(x=>x.id!==n.id));toast('공지가 삭제되었습니다.');}} className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5"/></button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          {showNoticeForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-7 mx-4">
              <div className="flex items-center justify-between mb-5"><h3 className="font-black text-[16px]">공지 등록</h3><button onClick={()=>setShowNoticeForm(false)}><X className="w-5 h-5 text-gray-400"/></button></div>
              <select value={newNotice.type} onChange={e=>setNewNotice(p=>({...p,type:e.target.value}))} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-[13px] mb-3 focus:outline-none focus:border-blue-400">
                {['공지','업데이트','점검','매뉴얼'].map(t=><option key={t}>{t}</option>)}
              </select>
              <input value={newNotice.title} onChange={e=>setNewNotice(p=>({...p,title:e.target.value}))} placeholder="제목" className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-[13px] mb-3 focus:outline-none focus:border-blue-400"/>
              <textarea value={newNotice.content} onChange={e=>setNewNotice(p=>({...p,content:e.target.value}))} placeholder="내용" rows={4} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-[13px] mb-4 resize-none focus:outline-none focus:border-blue-400"/>
              <div className="flex gap-3"><button onClick={()=>setShowNoticeForm(false)} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-[13px]">취소</button><button onClick={()=>{if(!newNotice.title){toast('제목을 입력하세요.');return;}setNotices(ns=>[{id:`N-${Date.now()}`,title:newNotice.title,type:newNotice.type,author:ADMIN_PERSONA.name,date:new Date().toISOString().slice(0,10),views:0,pinned:false,active:true},...ns]);setShowNoticeForm(false);setNewNotice({title:'',type:'공지',content:''});toast('공지가 등록되었습니다.');}} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-black text-[13px] hover:bg-blue-700">등록</button></div>
            </div></div>
          )}
          {editNotice && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-7 mx-4">
              <div className="flex items-center justify-between mb-5"><h3 className="font-black text-[16px]">공지 수정</h3><button onClick={()=>setEditNotice(null)} aria-label="닫기"><X className="w-5 h-5 text-gray-400"/></button></div>
              <select value={editNotice.type} onChange={e=>setEditNotice(p=>({...p,type:e.target.value}))} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-[13px] mb-3 focus:outline-none focus:border-blue-400">
                {['공지','업데이트','점검','매뉴얼'].map(t=><option key={t}>{t}</option>)}
              </select>
              <input value={editNotice.title} onChange={e=>setEditNotice(p=>({...p,title:e.target.value}))} placeholder="제목" className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-[13px] mb-4 focus:outline-none focus:border-blue-400"/>
              <div className="flex gap-3">
                <button onClick={()=>setEditNotice(null)} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-[13px]">취소</button>
                <button onClick={()=>{if(!editNotice.title.trim()){toast('제목을 입력하세요.');return;}setNotices(ns=>ns.map(x=>x.id===editNotice.id?{...x,title:editNotice.title.trim(),type:editNotice.type}:x));setEditNotice(null);toast('공지가 수정되었습니다.');}} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-black text-[13px] hover:bg-blue-700">저장</button>
              </div>
            </div></div>
          )}
        </div>
      )}
      {tab==='qna' && (
        <div className="flex gap-5">
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <h4 className="font-black text-[14px] text-gray-700">Q&A 문의 목록</h4>
              <div className="flex gap-2 text-[12px]">
                {['전체','대기','처리중','답변완료'].map(s=><button key={s} onClick={()=>setQFilter(s)} className={`px-3 py-1 rounded-lg border font-medium transition-colors ${qFilter===s?'border-blue-500 bg-blue-50 text-blue-700':'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{s}</button>)}
              </div>
            </div>
            <table className="w-full text-[13px]">
              <thead><tr className="border-b border-gray-100 bg-gray-50">{['제목','질문자','부서','등록일','상태'].map(h=><th key={h} className="text-left font-bold text-gray-500 py-2.5 px-4 text-[11px] uppercase">{h}</th>)}</tr></thead>
              <tbody>{qnas.filter(q=>qFilter==='전체'||q.status===qFilter).map(q=>(
                <tr key={q.id} onClick={()=>{setSelQ(q);setAnswerText(q.answer);}} className={`border-b border-gray-50 cursor-pointer ${selQ?.id===q.id?'bg-blue-50':'hover:bg-gray-50'}`}>
                  <td className="py-2.5 px-4 font-bold text-gray-800">{q.title}</td>
                  <td className="py-2.5 px-4 text-gray-600">{q.user}</td>
                  <td className="py-2.5 px-4 text-gray-500">{q.dept}</td>
                  <td className="py-2.5 px-4 text-gray-500">{q.date}</td>
                  <td className="py-2.5 px-4"><span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${qcls[q.status]}`}>{q.status}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <div className="w-80 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 shrink-0">
            {selQ ? (
              <div>
                <h4 className="font-black text-[13px] text-gray-700 mb-3">답변 작성</h4>
                <div className="p-3 bg-gray-50 rounded-xl mb-3 text-[12px] text-gray-700"><strong className="block mb-1">{selQ.user} ({selQ.dept})</strong>{selQ.title}</div>
                <textarea value={answerText} onChange={e=>setAnswerText(e.target.value)} placeholder="답변을 입력하세요..." rows={6} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-[13px] resize-none focus:outline-none focus:border-blue-400 mb-3"/>
                <button onClick={()=>{setQnas(qs=>qs.map(q=>q.id===selQ.id?{...q,answer:answerText,status:'답변완료'}:q));toast('답변이 등록되었습니다.');setSelQ(null);}} className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-black text-[13px] hover:bg-blue-700">답변 등록</button>
              </div>
            ) : <div className="flex flex-col items-center justify-center h-48 text-gray-400"><MessageSquare className="w-10 h-10 mb-2 text-gray-200"/><p className="text-[13px] font-medium text-center">Q&A를 선택하면<br/>답변을 작성할 수 있습니다</p></div>}
          </div>
        </div>
      )}
      {tab==='survey' && (
        <div className="space-y-4">
          <div className="flex justify-end"><button onClick={()=>toast('설문 생성 기능은 준비 중입니다.')} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[13px] font-bold hover:bg-indigo-700 shadow-sm"><Plus className="w-4 h-4"/> 설문 생성</button></div>
          <div className="space-y-4">
            {MOCK_SURVEYS_MGMT.map(sv=>(
              <div key={sv.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div><h4 className="font-black text-[15px] text-gray-800 mb-1">{sv.title}</h4><p className="text-[12px] text-gray-500">{sv.start} ~ {sv.end}</p></div>
                  <span className={`px-2.5 py-1 rounded-full text-[12px] font-bold ${sv.status==='진행중'?'bg-green-100 text-green-700':sv.status==='완료'?'bg-gray-100 text-gray-600':'bg-blue-100 text-blue-700'}`}>{sv.status}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full"><div className="h-full bg-indigo-500 rounded-full" style={{width:`${Math.round((sv.responses/sv.target)*100)}%`}}/></div>
                  <span className="text-[13px] font-bold text-gray-700">{sv.responses}/{sv.target}명</span>
                  <span className="text-[12px] text-indigo-600 font-bold">{Math.round((sv.responses/sv.target)*100)}%</span>
                </div>
                {sv.status==='완료' && <button onClick={()=>toast('설문 결과 상세 리포트를 표시합니다.')} className="mt-3 px-3 py-1.5 border border-indigo-200 text-indigo-600 rounded-lg text-[12px] font-bold hover:bg-indigo-50">결과 보기</button>}
              </div>
            ))}
          </div>
        </div>
      )}
    </PageShell>
  );
};

// ==================== 접근권한·차단 관리 ====================
export const ApiPromptPage = () => {
  const [tab, setTab] = useState('api');
  const [apis, setApis] = useState(MOCK_APIS.map(a=>({...a})));
  const [approvals, setApprovals] = useState(MOCK_API_APPROVALS.map(a=>({...a})));
  const [prompts, setPrompts] = useState(MOCK_PROMPTS_MGMT.map(p=>({...p})));
  const [selPrompt, setSelPrompt] = useState(null);
  const [editContent, setEditContent] = useState('');
  const toast = useToast();
  const TABS = [{id:'api',label:'🔌 API 관리'},{id:'approval',label:'✅ 사용 승인'},{id:'prompt',label:'✏️ 프롬프트 관리'}];
  return (
    <PageShell breadcrumb={['운영·관리','API·프롬프트 관리']} title="API · 프롬프트 관리" sub="API 생성/승인/통계 및 프롬프트 설계·테스트">
      <div className="flex gap-0.5 mb-6 border-b border-gray-200 -mx-6 px-6">
        {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`px-4 py-2.5 text-[13px] font-bold border-b-2 whitespace-nowrap transition-colors ${tab===t.id?'border-blue-600 text-blue-700 bg-blue-50/60':'border-transparent text-gray-500 hover:text-gray-700'}`}>{t.label}</button>)}
      </div>
      {tab==='api' && (
        <div className="space-y-4">
          <div className="flex justify-end"><button onClick={()=>toast('API 등록 다이얼로그가 열립니다.')} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-[13px] font-bold hover:bg-blue-700 shadow-sm"><Plus className="w-4 h-4"/> API 등록</button></div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-[13px]">
              <thead><tr className="border-b border-gray-100 bg-gray-50">{['API명','엔드포인트','버전','인증 방식','상태','오늘 호출','승인일','활성화',''].map(h=><th key={h} className="text-left font-bold text-gray-500 py-2.5 px-4 text-[11px] uppercase whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody>{apis.map(a=>(
                <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-bold text-gray-800">{a.name}</td>
                  <td className="py-3 px-4 font-mono text-gray-600 text-[12px]">{a.endpoint}</td>
                  <td className="py-3 px-4"><span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[11px] font-bold">{a.version}</span></td>
                  <td className="py-3 px-4 text-gray-600 text-[12px]">{a.auth}</td>
                  <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${a.status==='활성'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>{a.status}</span></td>
                  <td className="py-3 px-4 font-bold text-gray-700">{a.callsToday.toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-500">{a.approvedDate}</td>
                  <td className="py-3 px-4"><ToggleSwitch on={a.status==='활성'} onChange={v=>setApis(as=>as.map(x=>x.id===a.id?{...x,status:v?'활성':'비활성'}:x))} size="sm"/></td>
                  <td className="py-3 px-4"><button onClick={()=>toast(`${a.name} API 키를 재발급합니다.`)} className="px-2.5 py-1 border border-gray-200 text-gray-600 rounded-lg text-[11px] font-bold hover:bg-gray-50">키 재발급</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
      {tab==='approval' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[{label:'승인 대기',v:approvals.filter(a=>a.status==='대기').length,c:'text-yellow-600',bg:'bg-yellow-50'},{label:'승인 완료',v:approvals.filter(a=>a.status==='승인').length,c:'text-green-600',bg:'bg-green-50'},{label:'거부',v:0,c:'text-red-600',bg:'bg-red-50'}].map(s=>(
              <div key={s.label} className={`${s.bg} rounded-2xl border border-gray-100 p-4 text-center shadow-sm`}><div className={`text-2xl font-black ${s.c}`}>{s.v}</div><div className="text-[11px] text-gray-500 mt-1">{s.label}</div></div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-[13px]">
              <thead><tr className="border-b border-gray-100 bg-gray-50">{['신청자','부서','신청 API','사용 목적','신청일','상태',''].map(h=><th key={h} className="text-left font-bold text-gray-500 py-2.5 px-4 text-[11px] uppercase">{h}</th>)}</tr></thead>
              <tbody>{approvals.map(a=>(
                <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-bold text-gray-800">{a.requester}</td>
                  <td className="py-3 px-4 text-gray-600">{a.dept}</td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{a.api}</td>
                  <td className="py-3 px-4 text-gray-600 max-w-[200px] truncate">{a.purpose}</td>
                  <td className="py-3 px-4 text-gray-500">{a.requestDate}</td>
                  <td className="py-3 px-4"><span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${a.status==='대기'?'bg-yellow-100 text-yellow-700':'bg-green-100 text-green-700'}`}>{a.status}</span></td>
                  <td className="py-3 px-4">{a.status==='대기'&&<div className="flex gap-2"><button onClick={()=>{setApprovals(as=>as.map(x=>x.id===a.id?{...x,status:'승인'}:x));toast(`${a.requester} API 사용이 승인되었습니다.`);}} className="px-2.5 py-1 bg-green-600 text-white rounded-lg text-[11px] font-bold hover:bg-green-700">승인</button><button onClick={()=>{setApprovals(as=>as.filter(x=>x.id!==a.id));toast('거부되었습니다.');}} className="px-2.5 py-1 bg-red-500 text-white rounded-lg text-[11px] font-bold hover:bg-red-600">거부</button></div>}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
      {tab==='prompt' && (
        <div className="flex gap-5">
          <div className="flex-1 space-y-4">
            {prompts.map(p=>(
              <div key={p.id} onClick={()=>{setSelPrompt(p);setEditContent(`[${p.mode} 시스템 프롬프트 v${p.version}]\n\n${ADMIN_PROMPT_PREVIEW_INTRO}\n${p.desc}\n\n답변 시 반드시 출처 문서를 인용하고, 모르는 내용은 "관련 정보가 없습니다"라고 명확히 밝히세요.`);}} className={`bg-white rounded-2xl border-2 p-5 shadow-sm cursor-pointer transition-colors ${selPrompt?.id===p.id?'border-blue-500':'border-gray-100 hover:border-blue-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2"><span className="font-black text-[14px] text-gray-800">{p.name}</span><span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[11px] font-bold">{p.mode}</span><span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[11px] font-bold">{p.version}</span></div>
                  <div className="flex items-center gap-2"><span className="text-[11px] text-gray-400">{p.tokens} tokens</span><ToggleSwitch on={p.active} onChange={v=>setPrompts(ps=>ps.map(x=>x.id===p.id?{...x,active:v}:x))} size="sm"/></div>
                </div>
                <p className="text-[12px] text-gray-600">{p.desc}</p>
                <p className="text-[11px] text-gray-400 mt-1">최종 수정: {p.lastUpdated}</p>
              </div>
            ))}
          </div>
          <div className="w-96 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 shrink-0">
            <h4 className="font-black text-[13px] text-gray-700 mb-3 flex items-center gap-2"><Edit3 className="w-4 h-4 text-blue-500"/> 프롬프트 편집 · 테스트</h4>
            {selPrompt ? (
              <div className="space-y-3">
                <textarea value={editContent} onChange={e=>setEditContent(e.target.value)} rows={10} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-[12px] font-mono resize-none focus:outline-none focus:border-blue-400"/>
                <div className="flex gap-2">
                  <button onClick={()=>toast('프롬프트가 저장되었습니다.')} className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-[12px] font-bold hover:bg-blue-700">저장</button>
                  <button onClick={()=>toast('테스트 대화창이 열립니다.')} className="flex-1 py-2 rounded-xl border-2 border-blue-200 text-blue-700 text-[12px] font-bold hover:bg-blue-50">테스트</button>
                </div>
              </div>
            ) : <div className="flex flex-col items-center justify-center h-48 text-gray-400"><Edit3 className="w-10 h-10 mb-2 text-gray-200"/><p className="text-[13px] font-medium text-center">프롬프트를 선택하면<br/>편집창이 열립니다</p></div>}
          </div>
        </div>
      )}
    </PageShell>
  );
};

// ==================== HR 연계 · 사용자/그룹 확장 ====================
