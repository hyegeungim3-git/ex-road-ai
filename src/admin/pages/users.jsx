import React, { useState } from 'react';
import { Activity, Plus, Search, AlertCircle, X, Shield, Trash2, Download, Check, RotateCcw, Edit3, UserPlus, Info } from 'lucide-react';
import { MOCK_USERS, MOCK_PERMISSION_REQUESTS, MOCK_USAGE_HISTORY, MOCK_SERVICE_STATS, MOCK_IP_BLOCKS, MOCK_WORK_LOG, MOCK_EXTRACT_LOG, MOCK_USAGE_BY_DEPT, MOCK_ABUSE_ALERTS, MOCK_HR_SYNC, MOCK_ACCESS_LOGS, ADMIN_PERSONA, ADMIN_APPROVAL_ROWS, ADMIN_QUOTA_DEPTS, ADMIN_PERM_MATRIX, ADMIN_QUOTA_ADVICE, ADMIN_USER_GROUPS } from '../mocks.js';
import { StatusBadge, Modal, PageShell, useToast, ConfirmDialog } from '../common.jsx';

export const ApprovalPage = () => {
  const toast=useToast();
  const [requests,setRequests]=useState(ADMIN_APPROVAL_ROWS.map(r=>({...r})));
  const [tab,setTab]=useState('전체');const [confirmAction,setConfirmAction]=useState(null);const [rejectReason,setRejectReason]=useState('');
  const filtered=tab==='전체'?requests:requests.filter(r=>r.status===tab);
  const counts={total:requests.length,pending:requests.filter(r=>r.status==='대기 중').length,approved:requests.filter(r=>r.status==='승인').length,rejected:requests.filter(r=>r.status==='거부').length};
  return (
    <PageShell breadcrumb={['운영','승인']} title="승인 관리">
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[{l:'전체',v:counts.total,c:'bg-gray-50 text-gray-700'},{l:'대기 중',v:counts.pending,c:'bg-yellow-50 text-yellow-700'},{l:'승인',v:counts.approved,c:'bg-green-50 text-green-700'},{l:'거부',v:counts.rejected,c:'bg-red-50 text-red-700'}].map((s,i)=>(
          <div key={i} className={`p-4 rounded-xl ${s.c}`}><div className="text-2xl font-bold">{s.v}</div><div className="text-xs mt-1 opacity-80">{s.l}</div></div>
        ))}
      </div>
      <div className="flex space-x-1 mb-4 border-b">{['전체','대기 중','승인','거부'].map(t=>(
        <button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 ${tab===t?'border-blue-600 text-blue-600':'border-transparent text-gray-500 hover:text-gray-800'}`}>{t}</button>
      ))}</div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr>
          <th className="px-4 py-3 text-left">요청 ID</th><th className="px-4 py-3 text-left">유형</th><th className="px-4 py-3 text-left">요청자</th><th className="px-4 py-3 text-left">부서</th><th className="px-4 py-3 text-left">요청일</th><th className="px-4 py-3 text-left">상태</th><th className="px-4 py-3 text-center">액션</th>
        </tr></thead><tbody className="divide-y">{filtered.map(r=>(
          <tr key={r.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 font-mono text-xs">{r.id}</td><td className="px-4 py-3 font-medium">{r.type}</td><td className="px-4 py-3">{r.user}</td><td className="px-4 py-3 text-gray-500">{r.dept}</td><td className="px-4 py-3 text-gray-500">{r.date}</td><td className="px-4 py-3"><StatusBadge status={r.status}/></td>
            <td className="px-4 py-3 text-center space-x-2">
              {r.status==='대기 중'&&<>
                <button onClick={()=>setConfirmAction({req:r,action:'approve'})} className="text-xs px-2 py-1 rounded bg-green-50 text-green-600 hover:bg-green-100 font-medium">승인</button>
                <button onClick={()=>setConfirmAction({req:r,action:'reject'})} className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 font-medium">거부</button>
              </>}
            </td>
          </tr>
        ))}</tbody></table>
      </div>
      {confirmAction?.action==='approve'&&<ConfirmDialog isOpen={true} onClose={()=>setConfirmAction(null)} onConfirm={()=>{setRequests(p=>p.map(x=>x.id===confirmAction.req.id?{...x,status:'승인'}:x));setConfirmAction(null);toast(`${confirmAction.req.id} 승인 완료`);}} title="요청 승인" message={`${confirmAction.req.user}의 "${confirmAction.req.type}" 요청을 승인하시겠습니까?\n\n상세: ${confirmAction.req.desc}`} confirmText="승인"/>}
      {confirmAction?.action==='reject'&&<Modal isOpen={true} onClose={()=>{setConfirmAction(null);setRejectReason('');}} title="요청 거부" size="md">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">{confirmAction.req.user}의 "{confirmAction.req.type}" 요청을 거부합니다.</p>
          <div><label className="block text-sm font-medium mb-1">거부 사유</label><textarea value={rejectReason} onChange={e=>setRejectReason(e.target.value)} rows={3} placeholder="거부 사유를 입력하세요..." className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          <button onClick={()=>{setRequests(p=>p.map(x=>x.id===confirmAction.req.id?{...x,status:'거부'}:x));setConfirmAction(null);setRejectReason('');toast(`${confirmAction.req.id} 거부 완료`,'info');}} className="w-full bg-red-600 text-white py-2.5 rounded-lg font-medium text-sm">거부</button>
        </div>
      </Modal>}
    </PageShell>
  );
};

export const QuotaPage = () => {
  const toast=useToast();
  const [depts,setDepts]=useState(ADMIN_QUOTA_DEPTS.map(d=>({...d,gpu:{...d.gpu},mem:{...d.mem},storage:{...d.storage}})));
  const [editDept,setEditDept]=useState(null);
  const pct=(u,t)=>Math.round(u/t*100);
  return (
    <PageShell breadcrumb={['운영','할당량']} title="부서별 리소스 할당량 관리">
      <div className="grid grid-cols-3 gap-4">{depts.map(d=>(
        <div key={d.id} className="bg-white p-5 rounded-xl border">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold">{d.name}</h3>
            <button onClick={()=>setEditDept({...d})} className="text-xs text-blue-600 hover:underline">수정</button>
          </div>
          <div className="space-y-3">{[
            {l:'GPU',u:d.gpu.used,t:d.gpu.total,unit:'개',color:'bg-blue-500'},
            {l:'메모리',u:d.mem.used,t:d.mem.total,unit:'GB',color:'bg-purple-500'},
            {l:'스토리지',u:d.storage.used,t:d.storage.total,unit:'TB',color:'bg-green-500'},
          ].map((r,j)=>{const p=pct(r.u,r.t);return(
            <div key={j}><div className="flex justify-between text-xs mb-1"><span className="text-gray-500">{r.l}</span><div className="flex items-center space-x-1"><span className="font-medium">{r.u}/{r.t} {r.unit}</span>{p>=80&&<span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-medium">⚠ {p}%</span>}</div></div>
              <div className="w-full bg-gray-100 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${p>=80?'bg-red-500':r.color}`} style={{width:`${p}%`}}/></div></div>
          );})}</div>
        </div>
      ))}</div>
      <Modal isOpen={!!editDept} onClose={()=>setEditDept(null)} title={`${editDept?.name} 할당량 수정`} size="md">
        {editDept&&<div className="space-y-4">
          <div><label className="block text-sm font-medium mb-2">GPU 할당량</label>
            <input type="range" min={1} max={16} value={editDept.gpu.total} onChange={e=>setEditDept({...editDept,gpu:{...editDept.gpu,total:+e.target.value}})} className="w-full"/>
            <div className="text-right text-sm font-medium">{editDept.gpu.total}개</div></div>
          <div><label className="block text-sm font-medium mb-2">메모리 할당량</label>
            <input type="range" min={64} max={1024} step={64} value={editDept.mem.total} onChange={e=>setEditDept({...editDept,mem:{...editDept.mem,total:+e.target.value}})} className="w-full"/>
            <div className="text-right text-sm font-medium">{editDept.mem.total} GB</div></div>
          <div><label className="block text-sm font-medium mb-2">스토리지 할당량</label>
            <input type="range" min={1} max={20} value={editDept.storage.total} onChange={e=>setEditDept({...editDept,storage:{...editDept.storage,total:+e.target.value}})} className="w-full"/>
            <div className="text-right text-sm font-medium">{editDept.storage.total} TB</div></div>
          <button onClick={()=>{setDepts(p=>p.map(x=>x.id===editDept.id?editDept:x));setEditDept(null);toast('할당량이 저장되었습니다');}} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm">저장</button>
        </div>}
      </Modal>
    </PageShell>
  );
};

// ==================== ADMIN PAGES ====================
const ROLE_OPTIONS=['시스템관리자','부서관리자','일반사용자'];

export const UserManagementPage = () => {
  const toast=useToast();
  const [selUser,setSelUser]=useState(null);
  const [tab,setTab]=useState('users');
  const [users,setUsers]=useState(MOCK_USERS.map(u=>({...u})));
  const [permReqs,setPermReqs]=useState(MOCK_PERMISSION_REQUESTS.map(p=>({...p})));
  const [query,setQuery]=useState('');
  const [roleFilter,setRoleFilter]=useState('전체 역할');
  const [showAdd,setShowAdd]=useState(false);
  const [newUser,setNewUser]=useState({name:'',dept:'',role:'일반사용자',email:''});
  const [roleEdit,setRoleEdit]=useState(null);        // 역할 변경 중인 사용자
  const roleBadge=r=>r==='시스템관리자'?'bg-red-50 text-red-700':r==='부서관리자'?'bg-blue-50 text-blue-700':'bg-gray-100 text-gray-600';

  const visibleUsers=users.filter(u=>{
    const q=query.trim();
    const hitQ=!q||[u.name,u.dept,u.email].some(v=>String(v).includes(q));
    return hitQ&&(roleFilter==='전체 역할'||u.role===roleFilter);
  });

  const addUser=()=>{
    if(!newUser.name.trim()||!newUser.dept.trim()){toast('이름과 부서를 입력하세요.','info');return;}
    setUsers(p=>[{
      id:`U-${String(p.length+1).padStart(3,'0')}`, name:newUser.name.trim(), dept:newUser.dept.trim(),
      role:newUser.role, email:newUser.email.trim()||`${newUser.name.trim()}@example.com`,
      lastLogin:'-', apiCalls:0, loginCount:0, status:'Running',
    },...p]);
    setShowAdd(false); setNewUser({name:'',dept:'',role:'일반사용자',email:''});
    toast(`${newUser.name} 사용자를 추가했습니다`);
  };

  const decidePerm=(id,ok)=>{
    setPermReqs(p=>p.map(x=>x.id===id?{...x,status:ok?'승인':'거부'}:x));
    toast(`${id} ${ok?'승인':'거부'} 완료`,ok?'success':'info');
  };

  const applyRole=(role)=>{
    setUsers(p=>p.map(u=>u.id===roleEdit.id?{...u,role}:u));
    setSelUser(s=>s&&s.id===roleEdit.id?{...s,role}:s);
    setRoleEdit(null);
    toast(`${roleEdit.name}의 역할을 ${role}(으)로 변경했습니다`);
  };

  const toggleActive=(u)=>{
    const next=u.status==='Running'?'Stopped':'Running';
    setUsers(p=>p.map(x=>x.id===u.id?{...x,status:next}:x));
    setSelUser(s=>s&&s.id===u.id?{...s,status:next}:s);
    toast(`${u.name} 계정을 ${next==='Running'?'활성화':'비활성화'}했습니다`,next==='Running'?'success':'info');
  };

  return (
    <PageShell breadcrumb={['관리자 전용','사용자 관리']} title="사용자 및 권한 관리" action={<button onClick={()=>setShowAdd(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center hover:bg-blue-700"><UserPlus size={16} className="mr-1.5"/>사용자 추가</button>}>
      <div className="flex space-x-1 mb-5 border-b">
        {[['users','사용자 목록'],['permissions','권한 요청'],['roles','역할 관리']].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab===k?'border-blue-600 text-blue-600':'border-transparent text-gray-500 hover:text-gray-800'}`}>{l}</button>
        ))}
      </div>
      {tab==='users'&&<>
        <div className="flex items-center space-x-3 mb-4">
          <div className="relative flex-1 max-w-sm"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="이름, 부서, 이메일 검색..." className="w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"/><Search size={16} className="absolute left-3 top-3 text-gray-400"/></div>
          <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} className="px-3 py-2.5 border rounded-lg text-sm bg-white">{['전체 역할',...ROLE_OPTIONS].map(r=><option key={r}>{r}</option>)}</select>
          <span className="text-xs text-gray-400">{visibleUsers.length}명</span>
        </div>
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm"><thead className="bg-gray-50/80"><tr>
            <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">ID</th>
            <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">이름</th>
            <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">부서</th>
            <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">역할</th>
            <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">이메일</th>
            <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">최근 로그인</th>
            <th className="px-5 py-3.5 text-right text-xs font-medium text-gray-500">API 호출</th>
            <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">상태</th>
          </tr></thead><tbody className="divide-y divide-gray-100">{visibleUsers.map(u=>(
            <tr key={u.id} className="hover:bg-gray-50/50 cursor-pointer" onClick={()=>setSelUser(u)}>
              <td className="px-5 py-3.5 font-mono text-xs text-gray-400">{u.id}</td>
              <td className="px-5 py-3.5 font-medium">{u.name}</td>
              <td className="px-5 py-3.5 text-gray-600">{u.dept}</td>
              <td className="px-5 py-3.5"><span className={`px-2 py-0.5 rounded-md text-xs font-medium ${roleBadge(u.role)}`}>{u.role}</span></td>
              <td className="px-5 py-3.5 text-gray-500 text-xs">{u.email}</td>
              <td className="px-5 py-3.5 text-gray-400 text-xs">{u.lastLogin}</td>
              <td className="px-5 py-3.5 text-right font-medium">{u.apiCalls.toLocaleString()}</td>
              <td className="px-5 py-3.5"><StatusBadge status={u.status}/></td>
            </tr>
          ))}</tbody></table>
        </div>
      </>}
      {tab==='permissions'&&<div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-gray-50/80"><tr>
          <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">요청 ID</th>
          <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">요청자</th>
          <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">부서</th>
          <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">유형</th>
          <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">대상</th>
          <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">요청일</th>
          <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">상태</th>
          <th className="px-5 py-3.5 text-center text-xs font-medium text-gray-500">처리</th>
        </tr></thead><tbody className="divide-y divide-gray-100">{permReqs.map(p=>(
          <tr key={p.id} className="hover:bg-gray-50/50">
            <td className="px-5 py-3.5 font-mono text-xs text-gray-400">{p.id}</td>
            <td className="px-5 py-3.5 font-medium">{p.user}</td>
            <td className="px-5 py-3.5 text-gray-600">{p.dept}</td>
            <td className="px-5 py-3.5"><span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md text-xs font-medium">{p.type}</span></td>
            <td className="px-5 py-3.5 text-gray-500">{p.target}</td>
            <td className="px-5 py-3.5 text-gray-400">{p.date}</td>
            <td className="px-5 py-3.5"><StatusBadge status={p.status}/></td>
            <td className="px-5 py-3.5 text-center">{p.status==='대기 중'&&<div className="flex space-x-1 justify-center">
              <button onClick={()=>decidePerm(p.id,true)} className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700">승인</button>
              <button onClick={()=>decidePerm(p.id,false)} className="px-3 py-1 border border-red-200 text-red-600 rounded text-xs font-medium hover:bg-red-50">거부</button>
            </div>}</td>
          </tr>
        ))}</tbody></table>
      </div>}
      {tab==='roles'&&<div className="grid grid-cols-3 gap-5">
        {[{role:'시스템관리자',desc:'전체 시스템 관리 및 설정 권한',perms:['전체 메뉴 접근','사용자 관리','모델 관리','시스템 설정','통계 조회'],count:2,color:'bg-red-50 border-red-200'},
          {role:'부서관리자',desc:'소속 부서 리소스 관리 권한',perms:['부서 에이전트 관리','지식영역 관리','부서원 권한 관리','사용 통계 조회'],count:3,color:'bg-blue-50 border-blue-200'},
          {role:'일반사용자',desc:'기본 서비스 이용 권한',perms:['에이전트 질의','개인 지식영역','채팅 애플리케이션','보고서 생성'],count:3,color:'bg-gray-50 border-gray-200'}
        ].map((r,i)=>(
          <div key={i} className={`p-5 rounded-xl border ${r.color}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm">{r.role}</h3>
              <span className="text-xs bg-white px-2 py-0.5 rounded-full border">{r.count}명</span>
            </div>
            <p className="text-xs text-gray-500 mb-4">{r.desc}</p>
            <div className="space-y-1.5">{r.perms.map((p,j)=>(
              <div key={j} className="flex items-center text-xs text-gray-600"><Check size={12} className="mr-1.5 text-green-500 shrink-0"/>{p}</div>
            ))}</div>
          </div>
        ))}
      </div>}
      <Modal isOpen={!!selUser} onClose={()=>setSelUser(null)} title={`${selUser?.name} 상세 정보`} size="md">
        {selUser&&<div className="space-y-5">
          <div className="flex items-center space-x-4 pb-4 border-b">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-lg font-bold">{selUser.name[0]}</div>
            <div><div className="font-bold text-lg">{selUser.name}</div><div className="text-sm text-gray-500">{selUser.dept} · {selUser.role}</div><div className="text-xs text-gray-400 mt-0.5">{selUser.email}</div></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 rounded-lg p-3 text-center"><div className="text-xl font-bold text-blue-700">{selUser.loginCount}</div><div className="text-xs text-blue-500">총 로그인</div></div>
            <div className="bg-green-50 rounded-lg p-3 text-center"><div className="text-xl font-bold text-green-700">{selUser.apiCalls.toLocaleString()}</div><div className="text-xs text-green-500">API 호출</div></div>
            <div className="bg-purple-50 rounded-lg p-3 text-center"><div className="text-xl font-bold text-purple-700">{selUser.lastLogin.split(' ')[1]}</div><div className="text-xs text-purple-500">최근 접속</div></div>
          </div>
          <div className="flex space-x-2 pt-2">
            <button onClick={()=>setRoleEdit(selUser)} className="flex-1 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50">역할 변경</button>
            <button onClick={()=>toggleActive(selUser)} className="flex-1 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50">{selUser.status==='Running'?'비활성화':'활성화'}</button>
          </div>
        </div>}
      </Modal>

      {/* 사용자 추가 */}
      <Modal isOpen={showAdd} onClose={()=>setShowAdd(false)} title="사용자 추가" size="md">
        <div className="space-y-3">
          {[{k:'name',l:'이름',ph:'홍길동'},{k:'dept',l:'부서',ph:'부동산공시처'},{k:'email',l:'이메일 (선택)',ph:'user@example.com'}].map(f=>(
            <div key={f.k}><label className="block text-sm font-medium mb-1">{f.l}</label>
              <input value={newUser[f.k]} onChange={e=>setNewUser(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
          ))}
          <div><label className="block text-sm font-medium mb-1">역할</label>
            <select value={newUser.role} onChange={e=>setNewUser(p=>({...p,role:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">{ROLE_OPTIONS.map(r=><option key={r}>{r}</option>)}</select></div>
          <button onClick={addUser} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700">추가</button>
        </div>
      </Modal>

      {/* 역할 변경 */}
      <Modal isOpen={!!roleEdit} onClose={()=>setRoleEdit(null)} title={`${roleEdit?.name} 역할 변경`} size="sm">
        {roleEdit&&<div className="space-y-2">
          {ROLE_OPTIONS.map(r=>(
            <button key={r} onClick={()=>applyRole(r)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${roleEdit.role===r?'border-blue-500 bg-blue-50 text-blue-700':'hover:bg-gray-50'}`}>
              {r}{roleEdit.role===r&&<Check size={14}/>}
            </button>
          ))}
        </div>}
      </Modal>
    </PageShell>
  );
};

// ── Document OCR 시뮬레이션 결과 ──
export const AccessLogPage = () => {
  const [q,setQ]=useState('');
  const [action,setAction]=useState('전체 액션');
  const [period,setPeriod]=useState('최근 7일');
  // 기간: 목업 로그의 최신 일자를 기준으로 N일 이내만 노출
  const days=period==='오늘'?1:period==='최근 7일'?7:30;
  const latest=MOCK_ACCESS_LOGS.reduce((m,l)=>{const d=l.time.slice(0,10);return d>m?d:m;},'0000-00-00');
  const cutoff=new Date(latest+'T00:00:00'); cutoff.setDate(cutoff.getDate()-(days-1));
  const rows=MOCK_ACCESS_LOGS.filter(l=>{
    const hitQ=!q.trim()||[l.user,l.dept,l.ip,l.detail].some(v=>String(v).includes(q.trim()));
    const hitA=action==='전체 액션'||l.action===action;
    const hitP=new Date(l.time.slice(0,10)+'T00:00:00')>=cutoff;
    return hitQ&&hitA&&hitP;
  });
  return (
  <PageShell breadcrumb={['관리자 전용','접근 로그']} title="접근 및 감사 로그">
    <div className="flex items-center space-x-3 mb-4">
      <div className="relative flex-1 max-w-sm"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="사용자, 부서, IP 검색..." className="w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"/><Search size={16} className="absolute left-3 top-3 text-gray-400"/></div>
      <select value={action} onChange={e=>setAction(e.target.value)} className="px-3 py-2.5 border rounded-lg text-sm bg-white">{['전체 액션','로그인','에이전트 호출','설정 변경','문서 업로드'].map(o=><option key={o}>{o}</option>)}</select>
      <select value={period} onChange={e=>setPeriod(e.target.value)} className="px-3 py-2.5 border rounded-lg text-sm bg-white">{['오늘','최근 7일','최근 30일'].map(o=><option key={o}>{o}</option>)}</select>
      <span className="text-xs text-gray-400 whitespace-nowrap">{rows.length}건</span>
    </div>
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <table className="w-full text-sm"><thead className="bg-gray-50/80"><tr>
        <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">시간</th>
        <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">사용자</th>
        <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">부서</th>
        <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">액션</th>
        <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">IP</th>
        <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500">상세</th>
      </tr></thead><tbody className="divide-y divide-gray-100">{rows.map(l=>(
        <tr key={l.id} className="hover:bg-gray-50/50">
          <td className="px-5 py-3.5 font-mono text-xs text-gray-400">{l.time}</td>
          <td className="px-5 py-3.5 font-medium">{l.user}</td>
          <td className="px-5 py-3.5 text-gray-600 text-xs">{l.dept}</td>
          <td className="px-5 py-3.5"><span className={`px-2 py-0.5 rounded-md text-xs font-medium ${l.action==='로그인'?'bg-green-50 text-green-700':l.action==='에이전트 호출'?'bg-blue-50 text-blue-700':l.action==='설정 변경'?'bg-orange-50 text-orange-700':'bg-purple-50 text-purple-700'}`}>{l.action}</span></td>
          <td className="px-5 py-3.5 font-mono text-xs text-gray-400">{l.ip}</td>
          <td className="px-5 py-3.5 text-gray-500 text-xs">{l.detail}</td>
        </tr>
      ))}</tbody></table>
      {rows.length===0&&<div className="px-5 py-10 text-center text-sm text-gray-400">조건에 맞는 로그가 없습니다</div>}
    </div>
  </PageShell>
  );
};

export const AccessSecurityPage = () => {
  const [tab, setTab] = useState('permission');
  const [blocks, setBlocks] = useState(MOCK_IP_BLOCKS.map(b=>({...b})));
  const [showAdd, setShowAdd] = useState(false);
  const [newBlock, setNewBlock] = useState({target:'',type:'IP',reason:'',action:'차단'});
  const toast = useToast();
  const TABS = [{id:'permission',label:'🔐 사용자/그룹별 권한'},{id:'block',label:'🚫 ID·IP 차단·허용'}];
  return (
    <PageShell breadcrumb={['운영·관리','접근권한·차단']} title="접근권한 · 차단 관리" sub="지식영역별 사용자/그룹 권한 및 ID·IP 접근 제어">
      <div className="flex gap-0.5 mb-6 border-b border-gray-200 -mx-6 px-6">
        {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`px-4 py-2.5 text-[13px] font-bold border-b-2 whitespace-nowrap transition-colors ${tab===t.id?'border-blue-600 text-blue-700 bg-blue-50/60':'border-transparent text-gray-500 hover:text-gray-700'}`}>{t.label}</button>)}
      </div>
      {tab==='permission' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm overflow-x-auto">
            <div className="flex items-center justify-between mb-4"><h4 className="font-black text-[14px] text-gray-700">지식영역별 부서 접근 권한 매트릭스</h4><button onClick={()=>toast('권한 변경 사항이 저장되었습니다.')} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-[12px] font-bold hover:bg-blue-700">저장</button></div>
            <table className="w-full text-[12px]">
              <thead><tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left font-bold text-gray-500 py-2 px-3 text-[11px]">부서/그룹</th>
                {ADMIN_PERM_MATRIX.headers.map(ka=><th key={ka} className="text-center font-bold text-gray-500 py-2 px-2 text-[11px] whitespace-nowrap">{ka}</th>)}
              </tr></thead>
              <tbody>{ADMIN_PERM_MATRIX.rows.map(r=>(
                <tr key={r.dept} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2.5 px-3 font-bold text-gray-800">{r.dept}</td>
                  {r.perm.map((p,i)=>(
                    <td key={i} className="py-2.5 px-2 text-center">
                      <button onClick={()=>toast(`권한이 ${p?'해제':'부여'}되었습니다.`)} className={`w-6 h-6 rounded-md border-2 flex items-center justify-center mx-auto transition-colors ${p?'bg-blue-600 border-blue-600 text-white':'border-gray-200 hover:border-blue-300'}`}>{p&&<Check className="w-3.5 h-3.5"/>}</button>
                    </td>
                  ))}
                </tr>
              ))}</tbody>
            </table>
          </div>
          <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5"/>
            <p className="text-[13px] text-amber-800 font-medium">권한은 인사정보(HR) 연계를 통해 매일 01:00에 자동 업데이트됩니다. 이 화면에서 수동으로 변경한 권한은 다음 HR 동기화 시 재적용됩니다. <strong>개인 사용자 단위 예외 설정</strong>은 사용자 관리 페이지에서 별도 지정하세요.</p>
          </div>
        </div>
      )}
      {tab==='block' && (
        <div className="space-y-4">
          <div className="flex justify-end"><button onClick={()=>setShowAdd(true)} className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-xl text-[13px] font-bold hover:bg-red-700 shadow-sm"><Plus className="w-4 h-4"/> 차단·허용 추가</button></div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-[13px]">
              <thead><tr className="border-b border-gray-100 bg-gray-50">{['대상','유형','처리','사유','설정자','설정일','상태',''].map(h=><th key={h} className="text-left font-bold text-gray-500 py-2.5 px-4 text-[11px] uppercase">{h}</th>)}</tr></thead>
              <tbody>{blocks.map(b=>(
                <tr key={b.id} className={`border-b border-gray-50 hover:bg-gray-50 ${b.action==='차단'?'bg-red-50/30':''}`}>
                  <td className="py-3 px-4 font-mono font-bold text-gray-800">{b.target}</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[11px] font-bold">{b.type}</span></td>
                  <td className="py-3 px-4"><span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${b.action==='차단'?'bg-red-100 text-red-700':'bg-green-100 text-green-700'}`}>{b.action}</span></td>
                  <td className="py-3 px-4 text-gray-600 max-w-[200px] truncate" title={b.reason}>{b.reason}</td>
                  <td className="py-3 px-4 text-gray-500">{b.appliedBy}</td>
                  <td className="py-3 px-4 text-gray-500">{b.date}</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[11px] font-bold">{b.status}</span></td>
                  <td className="py-3 px-4"><button onClick={()=>{setBlocks(bs=>bs.filter(x=>x.id!==b.id));toast(`${b.target} 규칙이 해제되었습니다.`);}} className="px-2.5 py-1 border border-gray-200 text-gray-600 rounded-lg text-[11px] font-bold hover:bg-gray-50">해제</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          {showAdd && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7 mx-4">
              <div className="flex items-center justify-between mb-5"><h3 className="font-black text-[16px]">차단·허용 규칙 추가</h3><button onClick={()=>setShowAdd(false)}><X className="w-5 h-5 text-gray-400"/></button></div>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <select value={newBlock.type} onChange={e=>setNewBlock(p=>({...p,type:e.target.value}))} className="border-2 border-gray-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:border-blue-400">
                    {['IP','ID','대역'].map(t=><option key={t}>{t}</option>)}
                  </select>
                  <select value={newBlock.action} onChange={e=>setNewBlock(p=>({...p,action:e.target.value}))} className="border-2 border-gray-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:border-blue-400">
                    {['차단','허용'].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <input value={newBlock.target} onChange={e=>setNewBlock(p=>({...p,target:e.target.value}))} placeholder="IP 주소 또는 사용자 ID" className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:border-blue-400"/>
                <input value={newBlock.reason} onChange={e=>setNewBlock(p=>({...p,reason:e.target.value}))} placeholder="사유" className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:border-blue-400"/>
              </div>
              <div className="flex gap-3 mt-5"><button onClick={()=>setShowAdd(false)} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-[13px]">취소</button><button onClick={()=>{if(!newBlock.target||!newBlock.reason){toast('대상과 사유를 입력하세요.');return;}setBlocks(bs=>[{id:`ib-${Date.now()}`,target:newBlock.target,type:newBlock.type,reason:newBlock.reason,action:newBlock.action,appliedBy:ADMIN_PERSONA.name,date:new Date().toISOString().slice(0,10),status:'활성'},...bs]);setShowAdd(false);setNewBlock({target:'',type:'IP',reason:'',action:'차단'});toast('규칙이 추가되었습니다.');}} className={`flex-1 py-2.5 rounded-xl font-black text-[13px] text-white ${newBlock.action==='차단'?'bg-red-600 hover:bg-red-700':'bg-green-600 hover:bg-green-700'}`}>추가</button></div>
            </div></div>
          )}
        </div>
      )}
    </PageShell>
  );
};

// ==================== 통합 로그 관리 ====================
export const WorkLogPage = () => {
  const [tab, setTab] = useState('access');
  const [q, setQ] = useState('');
  const [qMode, setQMode] = useState('전체');   // 질의 이력 모드 필터
  const [qText, setQText] = useState('');       // 질의 이력 검색어
  const [from, setFrom] = useState('2026-02-01');
  const [to, setTo] = useState('2026-02-25');
  const toast = useToast();
  /* 검색어·기간 필터 — 원본 로그 배열에 적용한 뒤 표 행으로 변환한다 */
  const inRange = l => { const d = String(l.time).slice(0,10); return d >= from && d <= to; };
  const hitText = l => { const s = q.trim(); return !s || [l.user,l.dept,l.ip,l.detail,l.target,l.action,l.file].some(v => v && String(v).includes(s)); };
  const pick = arr => arr.filter(l => inRange(l) && hitText(l));
  const TABS = [{id:'access',label:'🔑 접속 로그'},{id:'work',label:'⚙️ 작업 로그'},{id:'query',label:'💬 질의 이력'},{id:'extract',label:'📥 추출·출력 로그'}];
  /* ⚠ <LogTable/>로 렌더하면 매 렌더마다 새 타입이 되어 검색 input이 리마운트된다
     (한 글자만 입력되는 증상). 함수 호출 {logTable(...)}로 쓸 것. */
  const logTable = ({cols,rows}) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-0"><Search className="w-4 h-4 text-gray-400 shrink-0"/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="사용자·IP·내용 검색..." className="flex-1 text-[13px] outline-none font-medium text-gray-700 placeholder:text-gray-400"/></div>
        <div className="flex gap-2 shrink-0">
          <input type="date" value={from} onChange={e=>setFrom(e.target.value)} aria-label="시작일" className="border border-gray-200 rounded-lg px-2 py-1.5 text-[12px] focus:outline-none"/>
          <input type="date" value={to} onChange={e=>setTo(e.target.value)} aria-label="종료일" className="border border-gray-200 rounded-lg px-2 py-1.5 text-[12px] focus:outline-none"/>
          <button onClick={()=>toast('CSV로 내보냅니다.')} className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-[12px] font-bold hover:bg-gray-50"><Download className="w-3.5 h-3.5"/> CSV</button>
        </div>
      </div>
      <div className="overflow-x-auto"><table className="w-full text-[12px]">
        <thead><tr className="border-b border-gray-100 bg-gray-50">{cols.map(c=><th key={c} className="text-left font-bold text-gray-500 py-2.5 px-3 text-[11px] uppercase whitespace-nowrap">{c}</th>)}</tr></thead>
        <tbody>{rows.map((r,i)=><tr key={i} className="border-b border-gray-50 hover:bg-gray-50">{r.map((c,j)=><td key={j} className={`py-2.5 px-3 ${j===0?'text-gray-400 whitespace-nowrap':j===1||j===2?'font-bold text-gray-800':'text-gray-600'}`}>{c}</td>)}</tr>)}</tbody>
      </table>
      {rows.length===0&&<div className="py-10 text-center text-[13px] text-gray-400">조건에 맞는 기록이 없습니다</div>}</div>
    </div>
  );
  const accessRows = pick(MOCK_ACCESS_LOGS).map(l=>[l.time,l.user,l.dept,l.ip,<span className={`px-2 py-0.5 rounded text-[11px] font-bold ${(l.action.includes('로그인')||l.action.includes('성공'))?'bg-green-100 text-green-700':'bg-blue-100 text-blue-700'}`}>{l.action}</span>,l.detail]);
  const workRows = pick(MOCK_WORK_LOG).map(l=>[l.time,l.user,l.dept,l.ip,<span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[11px] font-bold">{l.action}</span>,l.target,l.detail]);
  const extractRows = pick(MOCK_EXTRACT_LOG).map(l=>[l.time,l.user,l.dept,l.type,l.file,l.size,l.rows?l.rows+'행':'–']);
  return (
    <PageShell breadcrumb={['운영·관리','통합 로그 관리']} title="통합 로그 관리" sub="접속 · 작업 · 질의 이력 · 추출/출력 로그 통합 조회">
      <div className="flex gap-0.5 mb-6 border-b border-gray-200 -mx-6 px-6">
        {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`px-4 py-2.5 text-[13px] font-bold border-b-2 whitespace-nowrap transition-colors ${tab===t.id?'border-blue-600 text-blue-700 bg-blue-50/60':'border-transparent text-gray-500 hover:text-gray-700'}`}>{t.label}</button>)}
      </div>
      {tab==='access' && logTable({cols:['일시','사용자','부서','IP','행위','상세'], rows:accessRows})}
      {tab==='work' && logTable({cols:['일시','사용자','부서','IP','행위 유형','대상','상세'], rows:workRows})}
      {tab==='query' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-1"><Search className="w-4 h-4 text-gray-400"/><input value={qText} onChange={e=>setQText(e.target.value)} placeholder="질의 내용·사용자 검색..." className="flex-1 text-[13px] outline-none"/></div>
            <div className="flex gap-2">
              {['전체','GENERAL','REVIEW','TRANSLATE','REPORT','AGENT'].map(m=><button key={m} onClick={()=>setQMode(m)} className={`px-2.5 py-1 border rounded-lg text-[11px] font-bold transition-colors ${qMode===m?'border-blue-500 bg-blue-50 text-blue-700':'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{m}</button>)}
              <button onClick={()=>toast('질의이력을 CSV로 내보냅니다.')} className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-[12px] font-bold hover:bg-gray-50"><Download className="w-3.5 h-3.5"/> CSV</button>
            </div>
          </div>
          <table className="w-full text-[12px]">
            <thead><tr className="border-b border-gray-100 bg-gray-50">{['일시','사용자','부서','모드','질문 요약','토큰','별점','오류신고'].map(h=><th key={h} className="text-left font-bold text-gray-500 py-2.5 px-3 text-[11px] uppercase whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody>{MOCK_USAGE_HISTORY.filter(r=>(qMode==='전체'||r.mode===qMode)&&(!qText.trim()||[r.user,r.dept,r.query].some(v=>String(v).includes(qText.trim())))).map(r=>(
              <tr key={r.id} className={`border-b border-gray-50 hover:bg-gray-50 ${r.errReport?'bg-red-50/30':''}`}>
                <td className="py-2.5 px-3 text-gray-400 whitespace-nowrap">{r.time}</td>
                <td className="py-2.5 px-3 font-bold text-gray-800">{r.user}</td>
                <td className="py-2.5 px-3 text-gray-600">{r.dept}</td>
                <td className="py-2.5 px-3"><span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">{r.mode}</span></td>
                <td className="py-2.5 px-3 text-gray-700 max-w-[200px] truncate" title={r.query}>{r.query}</td>
                <td className="py-2.5 px-3 font-mono text-gray-600">{r.tokens}</td>
                <td className="py-2.5 px-3 text-yellow-500">{'★'.repeat(r.rating)}</td>
                <td className="py-2.5 px-3">{r.errReport&&<span className="text-red-500 text-[11px] font-bold">⚠ 신고</span>}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {tab==='extract' && logTable({cols:['일시','사용자','부서','추출 유형','파일명','크기','레코드 수'], rows:extractRows})}
    </PageShell>
  );
};

// ==================== 사용량 모니터링 ====================
export const UsageMonitorPage = () => {
  const [tab, setTab] = useState('dept');
  const toast = useToast();
  const TABS = [{id:'dept',label:'🏢 부서별 현황'},{id:'pattern',label:'📈 API 패턴 분석'},{id:'abuse',label:'🚨 오남용 탐지'}];
  const maxQ = Math.max(...MOCK_USAGE_BY_DEPT.map(d=>d.queries));
  const sevCls = {위험:'bg-red-100 text-red-700 border-red-200',주의:'bg-yellow-100 text-yellow-700 border-yellow-200',정보:'bg-gray-100 text-gray-600 border-gray-200'};
  return (
    <PageShell breadcrumb={['운영·관리','사용량 모니터링']} title="사용량 모니터링" sub="부서별 현황 · API 패턴 · 오남용 탐지">
      <div className="flex gap-0.5 mb-6 border-b border-gray-200 -mx-6 px-6">
        {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`px-4 py-2.5 text-[13px] font-bold border-b-2 whitespace-nowrap transition-colors ${tab===t.id?'border-blue-600 text-blue-700 bg-blue-50/60':'border-transparent text-gray-500 hover:text-gray-700'}`}>{t.label}</button>)}
      </div>
      {tab==='dept' && (
        <div className="space-y-5">
          <div className="grid grid-cols-4 gap-4">
            {[{label:'전체 질의 수',v:'13,900',c:'text-blue-600'},{label:'평균 대화 길이',v:'208자',c:'text-green-600'},{label:'총 토큰 사용',v:'2.9M',c:'text-purple-600'},{label:'오남용 의심',v:'3건',c:'text-red-600'}].map(s=>(
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm"><div className={`text-2xl font-black ${s.c}`}>{s.v}</div><div className="text-[11px] text-gray-500 mt-1">{s.label}</div></div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <h4 className="font-black text-[14px] text-gray-700">부서별 사용 현황</h4>
              <button onClick={()=>toast('부서별 사용 현황을 엑셀로 내보냅니다.')} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-[12px] font-bold hover:bg-gray-50"><Download className="w-3.5 h-3.5"/> 엑셀</button>
            </div>
            <table className="w-full text-[12px]">
              <thead><tr className="border-b border-gray-100 bg-gray-50">{['부서','사용자수','질의 건수','질의 추이','평균 대화길이','토큰 사용','피크 시간'].map(h=><th key={h} className="text-left font-bold text-gray-500 py-2.5 px-4 text-[11px] uppercase whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody>{MOCK_USAGE_BY_DEPT.map(d=>(
                <tr key={d.dept} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-bold text-gray-800">{d.dept}</td>
                  <td className="py-3 px-4 text-gray-600">{d.users}명</td>
                  <td className="py-3 px-4 font-bold text-gray-800">{d.queries.toLocaleString()}</td>
                  <td className="py-3 px-4 w-32"><div className="h-2 bg-gray-100 rounded-full"><div className="h-full bg-blue-500 rounded-full" style={{width:`${Math.round((d.queries/maxQ)*100)}%`}}/></div></td>
                  <td className="py-3 px-4 text-gray-600">{d.avgLen}자</td>
                  <td className="py-3 px-4 font-mono text-gray-700">{(d.tokens/1000).toFixed(0)}K</td>
                  <td className="py-3 px-4 text-gray-600">{d.peakHour}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
      {tab==='pattern' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h4 className="font-black text-[14px] text-gray-700 mb-4">시간대별 API 호출 패턴 (주간 평균)</h4>
            <div className="flex items-end gap-1" style={{height:'80px'}}>
              {MOCK_SERVICE_STATS.peakHours.map((v,h)=>{
                const max=195; const ht=Math.max(2,Math.round((v/max)*72));
                return <div key={h} className="flex-1 flex flex-col items-center" title={`${h}시: ${v}건`}><div className="w-full rounded-t" style={{height:`${ht}px`,background:v>150?'#3b82f6':v>80?'#93c5fd':'#dbeafe'}}/></div>;
              })}
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>0시</span><span>6시</span><span>12시</span><span>18시</span><span>23시</span></div>
            <p className="text-[12px] text-gray-500 mt-2">피크 시간대 <strong className="text-blue-600">15:00~18:00</strong> — 서버 사전 스케일업 권장</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h4 className="font-black text-[14px] text-gray-700 mb-4">모드별 사용 패턴</h4>
            <div className="space-y-3">
              {[{mode:'GENERAL',pct:48,c:'bg-blue-500'},{mode:'REVIEW',pct:22,c:'bg-purple-500'},{mode:'TRANSLATE',pct:14,c:'bg-violet-500'},{mode:'REPORT',pct:10,c:'bg-green-500'},{mode:'AGENT',pct:4,c:'bg-indigo-500'},{mode:'SECURE',pct:2,c:'bg-slate-700'}].map(m=>(
                <div key={m.mode} className="flex items-center gap-3">
                  <span className="text-[12px] font-black text-gray-600 w-20">{m.mode}</span>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${m.c}`} style={{width:`${m.pct}%`}}/></div>
                  <span className="text-[13px] font-black text-gray-700 w-8 text-right">{m.pct}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-4 flex items-start gap-3">
            <Activity className="w-5 h-5 text-blue-500 shrink-0 mt-0.5"/>
            <div className="text-[13px] text-blue-800 font-medium"><strong>할당량 관리 권장:</strong> {ADMIN_QUOTA_ADVICE}</div>
          </div>
        </div>
      )}
      {tab==='abuse' && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            {[{label:'오늘 탐지',v:MOCK_ABUSE_ALERTS.length,c:'text-red-600',bg:'bg-red-50'},{label:'자동 차단',v:1,c:'text-orange-600',bg:'bg-orange-50'},{label:'모니터링 중',v:2,c:'text-yellow-600',bg:'bg-yellow-50'}].map(s=>(
              <div key={s.label} className={`${s.bg} rounded-2xl border border-gray-100 p-4 text-center shadow-sm`}><div className={`text-2xl font-black ${s.c}`}>{s.v}</div><div className="text-[11px] text-gray-500 mt-1">{s.label}</div></div>
            ))}
          </div>
          <div className="space-y-4">
            {MOCK_ABUSE_ALERTS.map(a=>(
              <div key={a.id} className={`bg-white rounded-2xl border-2 p-5 shadow-sm ${a.severity==='위험'?'border-red-200':a.severity==='주의'?'border-yellow-200':'border-gray-100'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-black border ${sevCls[a.severity]}`}>{a.severity}</span>
                      <span className="font-black text-[14px] text-gray-800">{a.type}</span>
                      <span className="text-[13px] text-gray-600">({a.user} · {a.ip})</span>
                    </div>
                    <p className="text-[13px] text-gray-700 mb-2">{a.detail}</p>
                    <p className="text-[11px] text-gray-400">탐지: {a.detected}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${a.status==='차단됨'?'bg-red-100 text-red-700':a.status==='경고발송'?'bg-yellow-100 text-yellow-700':'bg-blue-100 text-blue-700'}`}>{a.status}</span>
                    {a.status!=='차단됨'&&<button onClick={()=>toast(`${a.user} IP를 차단했습니다.`)} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-[11px] font-bold hover:bg-red-700">즉시 차단</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h4 className="font-black text-[14px] text-gray-700 mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-blue-500"/> 오남용 방지 임계값 설정</h4>
            <div className="grid grid-cols-3 gap-4">
              {[{label:'분당 API 호출 한도',val:'50',unit:'회/분'},{label:'일일 토큰 사용 한도',val:'100,000',unit:'토큰/일'},{label:'대량 추출 감지 기준',val:'5',unit:'건/시간'}].map(s=>(
                <div key={s.label}><label className="text-[12px] font-bold text-gray-600 block mb-1.5">{s.label}</label><div className="flex items-center gap-2"><input defaultValue={s.val} className="flex-1 border-2 border-gray-200 rounded-lg px-3 py-1.5 text-[13px] font-mono focus:outline-none focus:border-blue-400"/><span className="text-[11px] text-gray-400 whitespace-nowrap">{s.unit}</span></div></div>
              ))}
            </div>
            <button onClick={()=>toast('오남용 방지 설정이 저장되었습니다.')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-[12px] font-bold hover:bg-blue-700">저장</button>
          </div>
        </div>
      )}
    </PageShell>
  );
};

// ==================== API · 프롬프트 관리 ====================
const GROUP_PERM_OPTIONS=['읽기','읽기·쓰기','전체'];

export const HrSyncPage = () => {
  const [tab, setTab] = useState('hrsync');
  const toast = useToast();
  const [groups,setGroups]=useState(ADMIN_USER_GROUPS.map(g=>({...g,areas:[...g.areas]})));
  const [editGroup,setEditGroup]=useState(null);   // 편집 중인 그룹(사본)
  const [newGroup,setNewGroup]=useState(null);     // 생성 중인 그룹
  const saveGroup=()=>{
    if(!editGroup.name.trim()){toast('그룹명을 입력하세요.','info');return;}
    setGroups(p=>p.map(g=>g.name===editGroup._orig?{...editGroup,name:editGroup.name.trim()}:g));
    toast(`${editGroup.name} 그룹을 수정했습니다`); setEditGroup(null);
  };
  const createGroup=()=>{
    if(!newGroup.name.trim()){toast('그룹명을 입력하세요.','info');return;}
    if(groups.some(g=>g.name===newGroup.name.trim())){toast('같은 이름의 그룹이 이미 있습니다.','info');return;}
    setGroups(p=>[...p,{name:newGroup.name.trim(),type:newGroup.type,members:0,areas:newGroup.areas.split(',').map(s=>s.trim()).filter(Boolean),perms:newGroup.perms}]);
    toast(`${newGroup.name} 그룹을 생성했습니다`); setNewGroup(null);
  };
  const TABS = [{id:'hrsync',label:'🔄 인사정보 연계'},{id:'group',label:'👥 그룹 관리'}];
  const typeCls = {신규입사:'bg-green-100 text-green-700',퇴직:'bg-red-100 text-red-700',부서이동:'bg-blue-100 text-blue-700',겸직:'bg-purple-100 text-purple-700',부재설정:'bg-yellow-100 text-yellow-700'};
  return (
    <PageShell breadcrumb={['운영·관리','HR 연계·그룹 관리']} title="인사정보 연계 · 그룹 관리" sub="HR DB 자동 동기화 및 사용자 그룹 관리">
      <div className="flex gap-0.5 mb-6 border-b border-gray-200 -mx-6 px-6">
        {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`px-4 py-2.5 text-[13px] font-bold border-b-2 whitespace-nowrap transition-colors ${tab===t.id?'border-blue-600 text-blue-700 bg-blue-50/60':'border-transparent text-gray-500 hover:text-gray-700'}`}>{t.label}</button>)}
      </div>
      {tab==='hrsync' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border-2 border-green-100 p-5 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1"><div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_6px_#22c55e]"/><span className="font-black text-[15px] text-gray-800">인사정보 DB 연계 상태: <span className="text-green-600">{MOCK_HR_SYNC.status}</span></span></div>
                <div className="text-[12px] text-gray-500">마지막 동기화: {MOCK_HR_SYNC.lastSync} · 다음 예정: {MOCK_HR_SYNC.nextSync}</div>
              </div>
              <button onClick={()=>toast('수동 동기화가 시작되었습니다. 완료 시 알림이 발송됩니다.')} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-xl text-[13px] font-bold hover:bg-green-700 shadow-sm"><RotateCcw className="w-4 h-4"/> 수동 동기화</button>
            </div>
          </div>
          <div className="grid grid-cols-6 gap-4">
            {[{label:'전체 사용자',v:MOCK_HR_SYNC.summary.total},{label:'신규 입사',v:MOCK_HR_SYNC.summary.new},{label:'퇴직',v:MOCK_HR_SYNC.summary.retired},{label:'부서이동',v:MOCK_HR_SYNC.summary.moved},{label:'겸직',v:MOCK_HR_SYNC.summary.concurrent},{label:'부재',v:MOCK_HR_SYNC.summary.leave}].map(s=>(
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm"><div className="text-xl font-black text-gray-800">{s.v}</div><div className="text-[11px] text-gray-500 mt-0.5">{s.label}</div></div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100"><h4 className="font-black text-[14px] text-gray-700">최근 동기화 내역</h4></div>
            <table className="w-full text-[13px]">
              <thead><tr className="border-b border-gray-100 bg-gray-50">{['이름','변경 유형','소속 부서','동기화 일시','처리 내용'].map(h=><th key={h} className="text-left font-bold text-gray-500 py-2.5 px-4 text-[11px] uppercase whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody>{MOCK_HR_SYNC.recent.map(r=>(
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-bold text-gray-800">{r.name}</td>
                  <td className="py-3 px-4"><span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${typeCls[r.type]}`}>{r.type}</span></td>
                  <td className="py-3 px-4 text-gray-600">{r.dept}</td>
                  <td className="py-3 px-4 text-gray-500">{r.syncDate}</td>
                  <td className="py-3 px-4 text-gray-700">{r.action}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5"/>
            <p className="text-[13px] text-blue-800 font-medium">인사정보 DB와 매일 01:00 자동 동기화됩니다. <strong>신규 입사</strong>: 계정 자동 생성 + 기본 권한 부여 / <strong>퇴직</strong>: 계정 즉시 비활성화 + 접속 차단 / <strong>부서이동</strong>: 소속 그룹 자동 변경 / <strong>겸직</strong>: 복수 그룹 추가 / <strong>부재</strong>: 임시 계정 잠금</p>
          </div>
        </div>
      )}
      {tab==='group' && (
        <div className="space-y-4">
          <div className="flex justify-end"><button onClick={()=>setNewGroup({name:'',type:'수동 그룹',areas:'',perms:'읽기'})} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[13px] font-bold hover:bg-indigo-700 shadow-sm"><Plus className="w-4 h-4"/> 그룹 생성</button></div>
          <div className="grid grid-cols-2 gap-4">
            {groups.map(g=>(
              <div key={g.name} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3"><div><span className="font-black text-[14px] text-gray-800 block">{g.name}</span><span className="text-[11px] text-gray-500">{g.type}</span></div><span className="text-[12px] font-bold text-gray-600">{g.members}명</span></div>
                <div className="text-[12px] text-gray-600 mb-2"><span className="font-medium text-gray-500">접근 영역: </span>{g.areas.join(', ')}</div>
                <div className="flex items-center justify-between"><span className={`text-[11px] px-2 py-0.5 rounded font-bold ${g.perms.includes('전체')?'bg-red-100 text-red-700':g.perms.includes('쓰기')?'bg-blue-100 text-blue-700':'bg-gray-100 text-gray-600'}`}>{g.perms}</span><div className="flex gap-2"><button aria-label={`${g.name} 수정`} onClick={()=>setEditGroup({...g,areas:[...g.areas],_orig:g.name})} className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600"><Edit3 className="w-3.5 h-3.5"/></button><button aria-label={`${g.name} 삭제`} onClick={()=>{setGroups(p=>p.filter(x=>x.name!==g.name));toast(`${g.name} 그룹을 삭제했습니다`,'info');}} className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5"/></button></div></div>
              </div>
            ))}
          </div>

          {/* 그룹 수정 */}
          <Modal isOpen={!!editGroup} onClose={()=>setEditGroup(null)} title={`${editGroup?._orig} 수정`} size="md">
            {editGroup&&<div className="space-y-3">
              <div><label className="block text-sm font-medium mb-1">그룹명</label>
                <input value={editGroup.name} onChange={e=>setEditGroup(p=>({...p,name:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
              <div><label className="block text-sm font-medium mb-1">접근 영역 (쉼표 구분)</label>
                <input value={editGroup.areas.join(', ')} onChange={e=>setEditGroup(p=>({...p,areas:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)}))} className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
              <div><label className="block text-sm font-medium mb-1">권한</label>
                <select value={editGroup.perms} onChange={e=>setEditGroup(p=>({...p,perms:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">{GROUP_PERM_OPTIONS.map(o=><option key={o}>{o}</option>)}</select></div>
              <button onClick={saveGroup} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700">저장</button>
            </div>}
          </Modal>

          {/* 그룹 생성 */}
          <Modal isOpen={!!newGroup} onClose={()=>setNewGroup(null)} title="그룹 생성" size="md">
            {newGroup&&<div className="space-y-3">
              <div><label className="block text-sm font-medium mb-1">그룹명</label>
                <input value={newGroup.name} onChange={e=>setNewGroup(p=>({...p,name:e.target.value}))} placeholder="예: 공시가격 조사 TF" className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
              <div><label className="block text-sm font-medium mb-1">접근 영역 (쉼표 구분)</label>
                <input value={newGroup.areas} onChange={e=>setNewGroup(p=>({...p,areas:e.target.value}))} placeholder="예: 사규, 업무 매뉴얼" className="w-full border rounded-lg px-3 py-2 text-sm"/></div>
              <div><label className="block text-sm font-medium mb-1">권한</label>
                <select value={newGroup.perms} onChange={e=>setNewGroup(p=>({...p,perms:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">{GROUP_PERM_OPTIONS.map(o=><option key={o}>{o}</option>)}</select></div>
              <button onClick={createGroup} className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-indigo-700">생성</button>
            </div>}
          </Modal>
        </div>
      )}
    </PageShell>
  );
};

// ==================== 연계 SW 통합 모니터링 ====================
