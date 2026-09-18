import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, ClipboardList, ArrowRight, CheckCircle2, Clock, FileText } from "lucide-react";
import { cn } from "../utils.jsx";
import { readOrders, advanceOrder, WO_STYLE, WO_FLOW } from "../workOrders.js";

/* ==================================================================
 * 작업지시 추적 — 발행된 지시가 실제로 조치·검증됐는지 닫는 화면
 * 상태를 되돌리는 버튼은 두지 않는다(현장 기록은 정정이 아니라 추가로 남긴다).
 * ================================================================== */
const WorkOrderModal = ({ domain, userName, onClose, onChanged }) => {
  const [orders, setOrders] = useState(() => readOrders(domain.id));
  const [openId, setOpenId] = useState(null);

  const advance = (id) => {
    const next = advanceOrder(id, userName, domain.id);
    setOrders(next);
    onChanged?.();
  };

  const open = orders.filter(o => o.status !== "검증완료");
  const done = orders.filter(o => o.status === "검증완료");

  const Row = (o) => {
    const st = WO_STYLE[o.status] || WO_STYLE["발행"];
    const expanded = openId === o.id;
    return (
      <div key={o.id} className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full border", st.chip)}>{o.status}</span>
            <span className="text-[12px] font-black text-slate-800 min-w-0 truncate">{o.title}</span>
            <span className="ml-auto text-[11px] font-mono text-slate-400 shrink-0">{o.docNo}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
            <span>{o.source}</span>
            {o.owner && <span>· 담당 {o.owner}</span>}
            {o.due && <span>· 기한 {o.due}</span>}
            <button onClick={() => setOpenId(expanded ? null : o.id)}
              className="ml-auto text-[11px] font-bold text-slate-500 hover:text-slate-800">
              {expanded ? "이력 접기" : `이력 ${o.history?.length || 0}건`}
            </button>
          </div>

          {/* 상태 진행 바 */}
          <div className="flex items-center gap-1 mt-2.5">
            {WO_FLOW.map((s, i) => {
              const cur = WO_FLOW.indexOf(o.status);
              const passed = i <= cur;
              return (
                <React.Fragment key={s}>
                  {i > 0 && <div className={cn("h-0.5 flex-1", passed ? "bg-emerald-400" : "bg-slate-200")} />}
                  <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap",
                    passed ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400")}>{s}</span>
                </React.Fragment>
              );
            })}
          </div>

          {expanded && (
            <div className="mt-3 pt-3 border-t space-y-1.5">
              {(o.history || []).map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px]">
                  <Clock className="w-3 h-3 text-slate-300 shrink-0" />
                  <span className="font-bold text-slate-600 w-16 shrink-0">{h.status}</span>
                  <span className="text-slate-400">{h.at}</span>
                  <span className="text-slate-400 truncate">{h.by}</span>
                </div>
              ))}
            </div>
          )}

          {st.next && (
            <button onClick={() => advance(o.id)}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: domain.brandColor }}>
              {st.next} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-label="작업지시 추적"
        className="bg-white w-full max-w-2xl max-h-[88vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="px-5 py-4 flex items-center gap-3 text-white shrink-0" style={{ backgroundColor: domain.brandColor }}>
          <ClipboardList className="w-5 h-5 shrink-0" />
          <div className="min-w-0">
            <div className="text-[15px] font-black">작업지시 추적</div>
            <div className="text-[11px] opacity-80">발행된 지시가 조치·검증까지 갔는지 확인합니다</div>
          </div>
          <button onClick={onClose} aria-label="닫기" className="ml-auto p-2 rounded-lg hover:bg-white/15 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
          <div>
            <div className="text-[12px] font-black text-slate-800 mb-2">진행 중 {open.length}건</div>
            {open.length ? <div className="space-y-2">{open.map(Row)}</div>
              : <p className="text-[12px] text-slate-400 py-4 text-center">진행 중인 작업지시가 없습니다.</p>}
          </div>
          {done.length > 0 && (
            <div>
              <div className="text-[12px] font-black text-slate-400 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />검증 완료 {done.length}건
              </div>
              <div className="space-y-2 opacity-70">{done.map(Row)}</div>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t bg-slate-50 shrink-0">
          <p className="text-[11px] text-slate-400 flex items-start gap-1.5">
            <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            {domain.workOrderNote || "자동화 시나리오가 문서를 발행하면 여기에 자동 등록됩니다. 실서비스에서는 MES·EAM 작업지시와 양방향 연동됩니다."}
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default WorkOrderModal;
