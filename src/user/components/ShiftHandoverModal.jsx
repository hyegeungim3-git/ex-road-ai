import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, ArrowRightLeft, CheckCircle2, Plus, Trash2, Download, Bot, ClipboardCheck } from "lucide-react";
import { cn, downloadTextFile } from "../utils.jsx";
import { itemTypes, saveHandover, handoverToText } from "../shiftHandover.js";

/* ==================================================================
 * 교대 인수인계 — 받은 인계 확인 + 이번 조 노트 작성
 * 좌: 직전 조가 넘긴 내용(확인 처리) / 우: AI 초안 → 편집 → 확정
 * ================================================================== */
const TONE = {
  rose:    { dot: "bg-rose-500",    chip: "bg-rose-50 text-rose-700 border-rose-200" },
  emerald: { dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  amber:   { dot: "bg-amber-500",   chip: "bg-amber-50 text-amber-700 border-amber-200" },
  blue:    { dot: "bg-blue-500",    chip: "bg-blue-50 text-blue-700 border-blue-200" },
};

const ShiftHandoverModal = ({ domain, incoming, draft, userName, onClose, onSaved }) => {
  const [items, setItems] = useState(draft?.items || []);
  const [adding, setAdding] = useState("");
  const [addType, setAddType] = useState("pending");
  const [acked, setAcked] = useState(false);
  const [saved, setSaved] = useState(false);

  const byType = (t) => items.filter(i => i.type === t);
  const removeItem = (idx) => setItems(p => p.filter((_, i) => i !== idx));
  const addItem = () => {
    const text = adding.trim();
    if (!text) return;
    setItems(p => [...p, { type: addType, text }]);
    setAdding("");
  };

  const confirm = () => {
    const note = { ...draft, items, author: userName || "", ackedIncoming: acked };
    if (saveHandover(note, domain.id)) {
      setSaved(true);
      onSaved?.(note);
      setTimeout(onClose, 1200);
    }
  };

  /* 항목 유형 라벨·모달 제목은 팩이 덮을 수 있다 — 업무 성격이 다르면 분류 이름도 달라진다
     (제조 '설비 이상·알람' vs 행정 상황실 '상황 발생'). 미제공 시 코어 중립 라벨. */
  const TYPES = itemTypes(domain);
  const TITLE = domain?.shiftHandover?.title || "교대 인수인계";

  const download = () => downloadTextFile(
    `${TITLE.replace(/\s/g, "")}_${draft?.shiftLabel || ""}.txt`,
    handoverToText({ ...draft, items, author: userName }, domain?.orgName, domain));

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-label={TITLE}
        className="bg-white w-full max-w-4xl max-h-[88vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* 헤더 */}
        <div className="px-6 py-4 flex items-center gap-3 shrink-0 text-white"
          style={{ backgroundColor: domain?.brandColor || "#334155" }}>
          <ArrowRightLeft className="w-5 h-5 shrink-0" />
          <div className="min-w-0">
            <div className="text-[15px] font-black">{TITLE}</div>
            <div className="text-[12px] opacity-80 truncate">
              {incoming ? `${incoming.shiftLabel} → ` : ""}{draft?.shiftLabel}
              {draft?.shiftTime ? ` (${draft.shiftTime})` : ""}
            </div>
          </div>
          <button onClick={onClose} aria-label="닫기" className="ml-auto p-2 rounded-lg hover:bg-white/15 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 overflow-y-auto">
          {/* ── 받은 인수인계 ── */}
          <section className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-black text-slate-800">받은 인수인계</span>
              {incoming && <span className="text-[10px] font-bold text-slate-400">
                {incoming.shiftLabel}{incoming.author ? ` · ${incoming.author}` : ""}{incoming.time ? ` · ${incoming.time}` : ""}
              </span>}
            </div>
            {!incoming ? (
              <p className="text-[12px] text-slate-400 py-6 text-center">직전 조에서 넘어온 인수인계가 없습니다.</p>
            ) : (
              <>
                <div className="space-y-1.5">
                  {(incoming.items || []).map((it, i) => {
                    const meta = TYPES.find(t => t.type === it.type) || TYPES[2];
                    const tone = TONE[meta.tone];
                    return (
                      <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg border border-slate-100 bg-slate-50/60">
                        <span className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", tone.dot)} />
                        <div className="min-w-0">
                          <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border mr-1.5", tone.chip)}>{meta.label}</span>
                          <span className="text-[12px] text-slate-700 leading-relaxed">{it.text}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 cursor-pointer select-none transition-colors
                  border-slate-200 hover:border-emerald-300 has-[:checked]:border-emerald-400 has-[:checked]:bg-emerald-50">
                  <input type="checkbox" checked={acked} onChange={e => setAcked(e.target.checked)} className="accent-emerald-600 w-4 h-4" />
                  <span className="text-[12px] font-bold text-slate-700">위 내용을 확인했습니다</span>
                </label>
              </>
            )}
          </section>

          {/* ── 이번 조 인수인계 작성 ── */}
          <section className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Bot className="w-3.5 h-3.5" style={{ color: domain?.brandColor }} />
              <span className="text-[12px] font-black text-slate-800">이번 조 인수인계 (AI 초안)</span>
              {draft?.fromAuditCount > 0 && (
                <span className="ml-auto text-[10px] font-bold text-emerald-600">실제 활동 {draft.fromAuditCount}건 반영</span>
              )}
            </div>

            {TYPES.map(({ type, label, tone }) => {
              const list = byType(type);
              if (!list.length) return null;
              return (
                <div key={type}>
                  <div className={cn("text-[10px] font-black px-1.5 py-0.5 rounded border w-fit mb-1.5", TONE[tone].chip)}>{label}</div>
                  <div className="space-y-1">
                    {list.map((it) => {
                      const idx = items.indexOf(it);
                      return (
                        <div key={idx} className="group flex items-start gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="text-[12px] text-slate-700 leading-relaxed flex-1 min-w-0">{it.text}</span>
                          <button onClick={() => removeItem(idx)} aria-label="항목 삭제"
                            className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 text-slate-300 hover:text-rose-500 transition-all shrink-0">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* 직접 추가 */}
            <div className="flex items-center gap-1.5 pt-1">
              <select value={addType} onChange={e => setAddType(e.target.value)}
                aria-label="항목 유형" className="text-[11px] border border-slate-200 rounded-lg px-2 py-2 bg-white shrink-0">
                {TYPES.map(t => <option key={t.type} value={t.type}>{t.label}</option>)}
              </select>
              <input value={adding} onChange={e => setAdding(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addItem()}
                placeholder="직접 추가할 인계 사항"
                className="flex-1 min-w-0 text-[12px] border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200" />
              <button onClick={addItem} aria-label="항목 추가"
                className="shrink-0 p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </section>
        </div>

        {/* 푸터 */}
        <div className="px-6 py-3.5 border-t bg-slate-50 flex items-center gap-2 shrink-0 flex-wrap">
          <p className="text-[11px] text-slate-400 flex-1 min-w-[180px]">
            {domain?.shiftHandover?.note || "확정하면 다음 조의 '받은 인수인계'로 넘어갑니다."}
          </p>
          <button onClick={download}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-[12px] font-bold text-slate-600 hover:bg-white transition-colors">
            <Download className="w-3.5 h-3.5" />내려받기
          </button>
          <button onClick={confirm} disabled={saved || !items.length}
            className={cn("flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-black text-white transition-colors shadow-sm",
              saved ? "bg-emerald-600" : items.length ? "hover:opacity-90" : "bg-slate-300 cursor-not-allowed")}
            style={!saved && items.length ? { backgroundColor: domain?.brandColor || "#334155" } : undefined}>
            {saved ? <><CheckCircle2 className="w-3.5 h-3.5" />인계 완료</> : <><ClipboardCheck className="w-3.5 h-3.5" />인수인계 확정</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ShiftHandoverModal;
