import React, { useState } from "react";
import { MessageCircle, ChevronDown, X } from "lucide-react";
import { cn } from "../../utils.jsx";
import { MOCK_FAQ } from "../../data/constants.js";

/* Q&A / FAQ 모달 — 아코디언 목록 (열림 인덱스는 모달 내부 상태; 닫으면 언마운트로 초기화) */
const QnaModal = ({ onClose }) => {
  const [qnaOpenIdx, setQnaOpenIdx] = useState(null);
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-[520px] max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center gap-2.5">
            <MessageCircle className="w-5 h-5 text-white" />
            <span className="font-black text-[16px] text-white">자주 묻는 질문 (FAQ)</span>
          </div>
          <button onClick={onClose} aria-label="닫기" className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* FAQ List */}
        <div className="overflow-y-auto flex-1 p-4 space-y-2.5">
          {MOCK_FAQ.map((item, i) => (
            <div key={i} className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <button
                onClick={() => setQnaOpenIdx(qnaOpenIdx === i ? null : i)}
                className="w-full flex items-start gap-3 p-4 bg-slate-50 hover:bg-blue-50 text-left transition-colors"
              >
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">Q</span>
                <span className="text-[13px] font-bold text-slate-800 flex-1 leading-snug">{item.q}</span>
                <ChevronDown className={cn("w-4 h-4 text-slate-400 shrink-0 mt-0.5 transition-transform", qnaOpenIdx === i && "rotate-180")} />
              </button>
              {qnaOpenIdx === i && (
                <div className="flex items-start gap-3 p-4 bg-white border-t border-slate-100 animate-in fade-in duration-150">
                  <span className="w-5 h-5 rounded-full bg-green-600 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">A</span>
                  <span className="text-[12px] text-slate-600 leading-relaxed">{item.a}</span>
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Footer */}
        <div className="px-6 py-3.5 border-t bg-slate-50 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">추가 문의: <span className="font-bold text-blue-600">정보기술팀 (내선 5050)</span></p>
          <button onClick={onClose} className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-[12px] font-bold hover:bg-blue-700 transition-colors">닫기</button>
        </div>
      </div>
    </div>
  );
};

export default QnaModal;
