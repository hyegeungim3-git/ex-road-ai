import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "../../utils.jsx";

/* AI 응답 오류 신고 모달 — 유형 선택 후 제출 */
const ErrorReportModal = ({ errReportText, setErrReportText, onClose, setToast }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 mx-4 animate-in zoom-in-90 duration-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border-2 border-red-200 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800">AI 응답 오류 신고</h3>
            <p className="text-[12px] text-slate-500 font-medium">어떤 유형의 오류인지 선택해 주세요.</p>
          </div>
        </div>
        <button onClick={onClose} aria-label="닫기" className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"><X className="w-5 h-5" /></button>
      </div>
      {/* 오류 유형 라디오 */}
      <div className="space-y-3 mb-5">
        {[
          { val: "환각현상", label: "환각 현상 (Hallucination)", desc: "존재하지 않는 사실·수치를 만들어낸 경우" },
          { val: "부정확한정보", label: "부정확한 정보", desc: "사실과 다르거나 오래된 정보를 제공한 경우" },
          { val: "출처오류", label: "출처 오류", desc: "잘못된 문서·페이지를 출처로 인용한 경우" },
          { val: "답변누락", label: "답변 누락", desc: "핵심 내용이 빠진 불완전한 답변인 경우" },
          { val: "기타", label: "기타", desc: "위 항목에 해당하지 않는 기타 오류" },
        ].map(({ val, label, desc }) => (
          <label key={val} className={cn("flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all", errReportText === val ? "border-red-400 bg-red-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50")}>
            <input type="radio" name="errType" value={val} checked={errReportText === val} onChange={() => setErrReportText(val)} className="mt-0.5 accent-red-500" />
            <div>
              <div className="font-bold text-[14px] text-slate-800">{label}</div>
              <div className="text-[12px] text-slate-500 font-medium">{desc}</div>
            </div>
          </label>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-[14px] hover:bg-slate-50 transition-colors">취소</button>
        <button
          disabled={!errReportText}
          onClick={() => { onClose(); setToast({ message: `오류 신고가 접수되었습니다. (${errReportText})` }); setErrReportText(''); }}
          className={cn("flex-1 py-3 rounded-xl font-black text-[14px] transition-colors shadow-md", errReportText ? "bg-red-500 hover:bg-red-600 text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed")}
        >신고 제출</button>
      </div>
    </div>
  </div>
);

export default ErrorReportModal;
