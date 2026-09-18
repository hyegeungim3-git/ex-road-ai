import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, ChevronRight, ChevronDown, X, XCircle, Home, AlertTriangle } from 'lucide-react';

export const Breadcrumb = ({path}) => (
  <div className="flex items-center space-x-1.5 text-sm text-gray-500 mb-5">
    <Home size={14} className="text-gray-400"/>
    {(path||[]).map((item,idx)=>(
      <React.Fragment key={idx}>
        <ChevronRight size={14} className="text-gray-300"/>
        <span className={idx===path.length-1?"font-semibold text-gray-800":"hover:text-blue-600 cursor-pointer"}>{item}</span>
      </React.Fragment>
    ))}
  </div>
);

export const StatusBadge = ({status}) => {
  const map = {
    'Running':'bg-green-100 text-green-700','Healthy':'bg-green-100 text-green-700','Online':'bg-green-100 text-green-700',
    '학습 완료':'bg-green-100 text-green-700','완료':'bg-green-100 text-green-700','배포':'bg-blue-100 text-blue-700',
    'Stopped':'bg-gray-100 text-gray-600','Offline':'bg-gray-100 text-gray-600','취소됨':'bg-gray-200 text-gray-600',
    '배포중지':'bg-gray-100 text-gray-600','학습 중':'bg-blue-100 text-blue-700 animate-pulse','실행 중':'bg-blue-100 text-blue-700',
    '중지됨':'bg-gray-100 text-gray-600','오류 발생':'bg-red-100 text-red-700','대기 중':'bg-yellow-100 text-yellow-700',
    'Warning':'bg-yellow-100 text-yellow-700','차단':'bg-red-100 text-red-700','경고':'bg-yellow-100 text-yellow-700',
    'Restarting':'bg-purple-100 text-purple-700 animate-pulse','삭제됨':'bg-red-50 text-red-600',
  };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[status]||'bg-gray-100 text-gray-600'}`}>{status}</span>;
};

export const Modal = ({isOpen,onClose,title,children,size='md'}) => {
  if(!isOpen) return null;
  const s = {sm:'max-w-md',md:'max-w-2xl',lg:'max-w-4xl',xl:'max-w-6xl'};
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${s[size]} max-h-[90vh] flex flex-col`} onClick={e=>e.stopPropagation()}>
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X size={20}/></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

export const SemiGauge = ({value,label,unit='%',color='#22c55e'}) => {
  const pct = Math.min(value/100,1);
  const r=60, cx=80, cy=75;
  const startAngle=-180, endAngle=0;
  const range = endAngle-startAngle;
  const valAngle = startAngle + range*pct;
  const toRad=a=>a*Math.PI/180;
  const arcPath=(start,end)=>{
    const x1=cx+r*Math.cos(toRad(start)),y1=cy+r*Math.sin(toRad(start));
    const x2=cx+r*Math.cos(toRad(end)),y2=cy+r*Math.sin(toRad(end));
    const large=end-start>180?1:0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };
  return (
    <div className="bg-white rounded-xl border p-5 flex flex-col items-center">
      <div className="text-sm text-gray-500 mb-2 font-medium">{label}</div>
      <svg width="160" height="100" viewBox="0 0 160 100">
        <path d={arcPath(-180,0)} fill="none" stroke="#e5e7eb" strokeWidth="10" strokeLinecap="round"/>
        {pct>0 && <path d={arcPath(-180,valAngle)} fill="none" stroke={pct>0.8?'#ef4444':pct>0.6?'#f59e0b':color} strokeWidth="10" strokeLinecap="round"/>}
        <text x={cx} y={cy+5} textAnchor="middle" className="text-2xl font-bold" style={{fontSize:'22px',fill:pct>0.8?'#ef4444':pct>0.6?'#f59e0b':color}}>
          {typeof value==='number'?value.toFixed(value<10?2:1):value}{unit}
        </text>
      </svg>
    </div>
  );
};

export const PageShell = ({breadcrumb,title,sub,action,children}) => (
  <div className="p-7 h-full overflow-y-auto animate-in slide-in-from-bottom-2 duration-200">
    <Breadcrumb path={breadcrumb}/>
    {(title||action) && (
      <div className="flex justify-between items-start mb-6 pb-5 border-b border-gray-100">
        <div className="flex items-start gap-3">
          <div className="w-1 h-8 bg-blue-600 rounded-full mt-0.5 shrink-0"/>
          <div>
            <h2 className="text-[22px] font-black text-gray-900 leading-tight">{title}</h2>
            {sub && <p className="text-sm text-slate-500 font-medium mt-0.5">{sub}</p>}
          </div>
        </div>
        {action && <div className="shrink-0 ml-4">{action}</div>}
      </div>
    )}
    {children}
  </div>
);

// ==================== DASHBOARD PAGES ====================
export const ToastContext = React.createContext();
export const ToastProvider = ({children}) => {
  const [toasts,setToasts]=useState([]);
  const addToast=(msg,type='success')=>{const id=Date.now();setToasts(p=>[...p,{id,msg,type}]);setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),3000);};
  return <ToastContext.Provider value={addToast}>{children}
    <div className="fixed top-4 right-4 z-[60] space-y-2">{toasts.map(t=>(
      <div key={t.id} className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center space-x-2 animate-in ${t.type==='success'?'bg-green-600 text-white':t.type==='error'?'bg-red-600 text-white':t.type==='info'?'bg-blue-600 text-white':'bg-orange-500 text-white'}`}>
        {t.type==='success'&&<CheckCircle size={16}/>}{t.type==='error'&&<XCircle size={16}/>}{t.type==='info'&&<AlertCircle size={16}/>}{t.type==='warning'&&<AlertTriangle size={16}/>}
        <span>{t.msg}</span>
      </div>
    ))}</div>
  </ToastContext.Provider>;
};
export const useToast=()=>React.useContext(ToastContext);

export const ConfirmDialog = ({isOpen,onClose,onConfirm,title,message,confirmText='확인',danger=false}) => {
  if(!isOpen)return null;
  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center space-x-3 mb-4">{danger?<AlertTriangle size={24} className="text-red-500"/>:<AlertCircle size={24} className="text-blue-500"/>}<h3 className="font-bold text-lg">{title}</h3></div>
        <p className="text-sm text-gray-600 mb-6 ml-9">{message}</p>
        <div className="flex space-x-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50">취소</button>
          <button onClick={()=>{onConfirm();onClose();}} className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${danger?'bg-red-600 hover:bg-red-700':'bg-blue-600 hover:bg-blue-700'}`}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

// ==================== SERVICE PAGES ====================
export const ToggleSwitch = ({on,label,onClick})=>(
  <div className="flex items-center space-x-2" onClick={e=>{e.stopPropagation();onClick&&onClick();}}>
    <div className={`w-9 h-5 rounded-full cursor-pointer transition-colors ${on?'bg-blue-600':'bg-gray-300'}`}><div className={`w-4 h-4 bg-white rounded-full shadow mt-0.5 transition-transform ${on?'translate-x-4.5 ml-0.5':'ml-0.5'}`}/></div>
    {label&&<span className="text-xs text-gray-500">{label}</span>}
  </div>
);

export const SidebarItem = ({item,activeId,onNav,level=0}) => {
  const isActive = activeId===item.id;
  const isParentActive = activeId?.startsWith(item.id+'.');
  const hasChildren = !!item.children;
  const [expanded,setExpanded]=useState(isActive||isParentActive);
  useEffect(()=>{
    if(!isActive&&!isParentActive) return undefined;
    const timer=setTimeout(()=>setExpanded(true),0);
    return ()=>clearTimeout(timer);
  },[isActive,isParentActive]);

  const pl = level===0?'pl-4':level===1?'pl-8':level===2?'pl-11':'pl-13';

  const handleClick = ()=>{
    if(hasChildren){setExpanded(!expanded);} else {onNav(item.id);}
  };

  return (<>
    <div onClick={handleClick} className={`flex items-center justify-between py-2 pr-3 mx-1.5 rounded-lg cursor-pointer text-sm transition-all duration-150 select-none ${pl}
      ${!hasChildren&&isActive
        ? 'bg-blue-50 text-blue-700 font-bold border-l-[3px] border-blue-600 shadow-sm'
        : hasChildren&&isParentActive
          ? 'text-gray-900 font-semibold hover:bg-blue-50/50'
          : 'text-gray-600 hover:bg-blue-50/40 hover:text-gray-900'}`}>
      <div className="flex items-center space-x-2.5 min-w-0">
        {level===0&&item.icon&&<item.icon size={17} className={!hasChildren&&isActive?'text-blue-600':isParentActive?'text-blue-500':'text-gray-400'}/>}
        {level>0&&<span className={`w-1.5 h-1.5 rounded-full shrink-0 ${!hasChildren&&isActive?'bg-blue-600':'bg-gray-300'}`}/>}
        <span className="truncate">{item.label}</span>
      </div>
      {hasChildren&&<ChevronDown size={13} className={`text-gray-400 shrink-0 transition-transform duration-200 ${expanded?'rotate-180':''}`}/>}
    </div>
    {hasChildren&&expanded&&<div className="mt-0.5 mb-1">{item.children.map(c=><SidebarItem key={c.id} item={c} activeId={activeId} onNav={onNav} level={level+1}/>)}</div>}
  </>);
};

// ==================== 서비스 통계 리포트 ====================
