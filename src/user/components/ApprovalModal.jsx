import React from "react";
import { createPortal } from "react-dom";
import { FileCheck, Globe, X, Send, Loader2, ArrowRight, MessageCircle, CheckCircle, Clock, Timer } from "lucide-react";
import { cn } from "../utils.jsx";


const ApprovalModal = ({docTitle,docNum,apvLine,apvMsg,setApvMsg,onClose,onSubmit,submitting,accentBg,accentBtn}) => createPortal(
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300] flex items-center justify-center p-4"
    onClick={e=>{if(e.target===e.currentTarget&&!submitting)onClose();}}>
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] overflow-hidden animate-fade-in" onClick={e=>e.stopPropagation()}>

      {/* 헤더 */}
      <div className={`${accentBg} px-6 py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <FileCheck className="w-4 h-4 text-white"/>
          </div>
          <div>
            <div className="text-white font-black text-[14px]">전자결재 상신</div>
            <div className="text-white/60 text-[10px] flex items-center gap-1.5 mt-0.5">
              <Globe className="w-3 h-3"/>WorksOn 그룹웨어 연동
            </div>
          </div>
        </div>
        <button onClick={onClose} disabled={submitting} className="text-white/60 hover:text-white transition-colors disabled:opacity-30"><X className="w-5 h-5"/></button>
      </div>

      {/* 바디 */}
      <div className="px-6 py-5 space-y-4">
        {/* 문서 정보 */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
          <div className="flex gap-3 items-start">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider w-14 shrink-0 pt-0.5">문서명</span>
            <span className="text-[13px] font-semibold text-slate-800 leading-snug flex-1">{docTitle}</span>
          </div>
          <div className="flex gap-3 items-center">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider w-14 shrink-0">문서번호</span>
            <span className="text-[12px] font-mono text-slate-500">{docNum}</span>
          </div>
        </div>

        {/* 결재 진행 단계 */}
        <div>
          <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3">결재 진행 단계</div>
          <div className="flex items-start gap-0 mb-4">
            {[
              {label:'기안',    sub:apvLine[0]?.name??'',done:true, active:false},
              {label:'1차 검토',sub:apvLine[1]?.name??'',done:false,active:true},
              {label:'최종 승인',sub:apvLine[2]?.name??'',done:false,active:false},
              {label:'결재 완료',sub:'',                  done:false,active:false},
            ].map((st,i,arr)=>(
              <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-1 shrink-0 w-16">
                  <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all',
                    st.done?'bg-emerald-500 text-white shadow-sm shadow-emerald-200':
                    st.active?'bg-blue-500 text-white ring-2 ring-blue-200 ring-offset-1 shadow-sm shadow-blue-200':
                    'bg-slate-100 text-slate-400')}>
                    {st.done?<CheckCircle className="w-4 h-4"/>:i+1}
                  </div>
                  <div className={cn('text-[9px] font-black text-center leading-tight',st.done?'text-emerald-600':st.active?'text-blue-600':'text-slate-400')}>{st.label}</div>
                  {st.sub&&<div className="text-[8px] text-slate-400 text-center truncate w-full">{st.sub}</div>}
                  {st.active&&<div className="text-[7px] text-blue-500 font-bold animate-pulse">검토 중</div>}
                </div>
                {i<arr.length-1&&<div className={cn('flex-1 h-0.5 mt-3.5 mx-1',st.done?'bg-emerald-300':'bg-slate-200')}/>}
              </React.Fragment>
            ))}
          </div>
          {/* Approver cards */}
          <div className="grid grid-cols-3 gap-2">
            {apvLine.map((p,i)=>{
              const STATES=[
                {border:'border-emerald-200 bg-emerald-50/50',roleCls:'text-emerald-600',avatarBg:'bg-emerald-100',avatarText:'text-emerald-700',badge:'bg-emerald-100 text-emerald-600',badgeText:'서명 완료',BadgeIcon:CheckCircle},
                {border:'border-blue-200 bg-blue-50/50',roleCls:'text-blue-500',avatarBg:'bg-blue-100',avatarText:'text-blue-700',badge:'bg-blue-100 text-blue-600',badgeText:'검토 중',BadgeIcon:Clock},
                {border:'border-slate-200 bg-white',roleCls:'text-slate-400',avatarBg:'bg-slate-100',avatarText:'text-slate-500',badge:'bg-slate-100 text-slate-400',badgeText:'대기',BadgeIcon:Timer},
              ][i]||{border:'border-slate-200',roleCls:'text-slate-400',avatarBg:'bg-slate-100',avatarText:'text-slate-500',badge:'bg-slate-100 text-slate-400',badgeText:'대기',BadgeIcon:Timer};
              const {border,roleCls,avatarBg,avatarText,badge,badgeText,BadgeIcon}=STATES;
              return(
                <div key={i} className={`border rounded-xl py-3 px-2 text-center ${border}`}>
                  <div className={`text-[9px] font-black uppercase tracking-wider mb-1.5 ${roleCls}`}>{p.role}</div>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center mx-auto mb-1.5 shadow-sm ${avatarBg}`}>
                    <span className={`text-[14px] font-black ${avatarText}`}>{p.name[0]}</span>
                  </div>
                  <div className="text-[12px] font-black text-slate-800">{p.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{p.dept}</div>
                  <div className={`flex items-center justify-center gap-0.5 mt-2 px-1.5 py-0.5 rounded-full text-[8px] font-black mx-auto w-fit ${badge}`}>
                    <BadgeIcon className="w-2.5 h-2.5 shrink-0"/>{badgeText}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <ArrowRight className="w-3 h-3"/>순차 결재 방식
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Clock className="w-3 h-3"/>예상 소요: 약 2시간
            </div>
          </div>
        </div>

        {/* 전달 메시지 */}
        <div>
          <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
            전달 메시지 <span className="normal-case font-normal text-slate-300 text-[10px]">(선택)</span>
          </div>
          <textarea value={apvMsg} onChange={e=>setApvMsg(e.target.value)} rows={2}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-700 resize-none outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100 transition-all"/>
        </div>

        {/* 연동 시스템 */}
        <div className="grid grid-cols-2 gap-2">
          {[
            {Icon:Globe,         label:'WorksOn 그룹웨어', status:'연동됨'},
            {Icon:MessageCircle, label:'이메일 알림',       status:'발송 예정'},
          ].map(({Icon,label,status})=>(
            <div key={label} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
              <Icon className="w-3 h-3 text-slate-400 shrink-0"/>
              <span className="text-[10px] text-slate-600 flex-1 truncate">{label}</span>
              <span className="text-[9px] font-bold text-emerald-500 shrink-0">✓ {status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 푸터 */}
      <div className="px-6 pb-5 flex gap-2.5">
        <button onClick={onClose} disabled={submitting}
          className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-40">
          취소
        </button>
        <button onClick={onSubmit} disabled={submitting}
          className={`flex-1 py-2.5 ${accentBtn} text-white rounded-xl text-sm font-black transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-70`}>
          {submitting?<Loader2 className="w-4 h-4 animate-spin"/>:<Send className="w-4 h-4"/>}
          {submitting?'상신 중...':'전자결재 상신'}
        </button>
      </div>
    </div>
  </div>,
  document.body
);

export default ApprovalModal;
