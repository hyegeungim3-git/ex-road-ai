import React from "react";
import { createPortal } from "react-dom";
import { Cpu, CheckCircle2, Lock } from "lucide-react";
import { cn } from "../../utils.jsx";

/* LLM 선택 드롭다운 — overflow-hidden 상위 컨테이너를 우회하여 body에 직접 렌더링 */
const LLMDropdownPortal = ({ llmPortalRef, llmDropdownPos, isSecure, llmModels, activeLLM, setActiveLLM, setShowLLMDropdown, setToast }) =>
  createPortal(
    <div
      ref={llmPortalRef}
      style={{ position: "fixed", bottom: llmDropdownPos.bottom, right: llmDropdownPos.right, width: 280, zIndex: 9999 }}
      className={cn("rounded-2xl border-2 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150",
        isSecure ? "bg-[#0a0f1c] border-slate-700" : "bg-white border-slate-200")}>
      <div className={cn("px-4 py-2.5 border-b text-[11px] font-black uppercase tracking-wider",
        isSecure ? "border-slate-800 text-slate-500" : "border-slate-100 text-slate-500")}>
        AI 모델 선택 (로컬 온프레미스)
      </div>
      {llmModels.map(model => {
        const blocked = (isSecure || model.status === "blocked") && model.security === "low";
        return (
          <button key={model.id}
            onClick={() => {
              if (blocked) { setToast({ message: "망분리 환경에서는 클라우드 모델을 사용할 수 없습니다.", type: "error" }); return; }
              setActiveLLM(model); setShowLLMDropdown(false);
              setToast({ message: `[${model.name}] 모델로 변경되었습니다.` });
            }}
            className={cn("w-full text-left px-4 py-3 flex items-start gap-3 border-b last:border-0 transition-colors",
              isSecure ? "border-slate-800" : "border-slate-50",
              activeLLM.id === model.id ? (isSecure ? "bg-slate-800/80" : "bg-blue-50/80") : (isSecure ? "hover:bg-slate-800/50" : "hover:bg-slate-50"),
              blocked && "opacity-40 cursor-not-allowed")}>
            <Cpu className={cn("w-4 h-4 mt-0.5 shrink-0", activeLLM.id === model.id ? (isSecure ? "text-blue-400" : "text-blue-600") : "text-slate-400")} />
            <div className="flex-1 min-w-0">
              <div className={cn("text-[13px] font-black flex items-center gap-2", isSecure ? "text-slate-200" : "text-slate-800")}>
                {model.name}
                {activeLLM.id === model.id && <CheckCircle2 className={cn("w-3.5 h-3.5", isSecure ? "text-blue-400" : "text-blue-600")} />}
                {blocked && <Lock className="w-3 h-3 text-red-500" />}
                <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-black",
                  model.type === "구축형" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700")}>{model.type}</span>
              </div>
              <div className={cn("text-[11px] mt-0.5 font-medium", isSecure ? "text-slate-400" : "text-slate-500")}>{model.desc}</div>
              <div className={cn("text-[10px] mt-0.5 font-mono", isSecure ? "text-slate-500" : "text-slate-400")}>Context: {model.context}</div>
            </div>
          </button>
        );
      })}
    </div>,
    document.body
  );

export default LLMDropdownPortal;
