import React from "react";
import { Star } from "lucide-react";
import { cn } from "../../utils.jsx";

/* 이용만족도 평가 모달 — AI 답변 3회 후 자동 팝업 */
const SatisfactionModal = ({ satRating, setSatRating, satComment, setSatComment, onClose, setToast }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 mx-4 animate-in zoom-in-90 duration-200">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-yellow-50 border-2 border-yellow-200 flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 text-yellow-500" />
        </div>
        <h3 className="text-xl font-black text-slate-800 mb-1">이용 만족도 평가</h3>
        <p className="text-[14px] text-slate-500 font-medium">서비스 개선에 소중한 의견을 주세요.</p>
      </div>
      {/* 별점 */}
      <div className="flex justify-center gap-3 mb-6">
        {[1,2,3,4,5].map(s => (
          <button key={s} onClick={() => setSatRating(s)} aria-label={`별점 ${s}점`} className="transition-transform hover:scale-125">
            <Star className={cn("w-10 h-10", s <= satRating ? "text-yellow-400 fill-yellow-400" : "text-slate-300")} />
          </button>
        ))}
      </div>
      {satRating > 0 && (
        <div className="mb-2 text-center text-[13px] font-bold text-slate-600">
          {["","매우 불만족","불만족","보통","만족","매우 만족"][satRating]}
        </div>
      )}
      {/* 의견 */}
      <textarea
        value={satComment}
        onChange={e => setSatComment(e.target.value)}
        placeholder="자유롭게 의견을 남겨주세요. (선택)"
        rows={3}
        className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-[14px] font-medium text-slate-700 focus:outline-none focus:border-blue-400 resize-none mb-5"
      />
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-[14px] hover:bg-slate-50 transition-colors">나중에</button>
        <button onClick={() => { onClose(); setToast({ message: satRating > 0 ? `${satRating}점 평가가 제출되었습니다. 감사합니다!` : "평가 없이 닫혔습니다." }); }} className="flex-1 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-white font-black text-[14px] transition-colors shadow-md">제출</button>
      </div>
    </div>
  </div>
);

export default SatisfactionModal;
