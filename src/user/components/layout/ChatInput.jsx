import React, { useState, useRef, useEffect } from "react";
import { Paperclip, Mic, Database, Cpu, ChevronDown, Workflow, Send, ScanLine, Square } from "lucide-react";
import { isVoiceSupported, startVoice } from "../../voiceInput.js";
import { cn } from "../../utils.jsx";

/* ================================================================== */
/* 하단 입력 영역 — 통합 단일 박스 (첨부·음성·RAG 토글·LLM 선택·전송)   */
/* ================================================================== */
const ChatInput = ({
  th, isSecure, isAgent, mc,
  input, setInput, handleSend,
  fileInputRef, setToast,
  ragMode, setRagMode,
  llmDropdownRef, llmButtonRef, showLLMDropdown, setShowLLMDropdown, setLlmDropdownPos,
  activeLLM, setShowBuilderModal,
  onOpenScan,
  scanLabel = "코드 스캔",   // 팩 scanLabel — 무엇을 찍는지는 도메인마다 다르다(설비·로트 / 시설물 / 접수증)
}) => {
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);
  const baseRef = useRef("");   // 녹음 시작 시점의 입력값 — 인식 결과를 뒤에 붙인다

  /* 인식 결과는 곧바로 보내지 않고 입력창에 채워 검토받는다.
     소음 환경 오인식을 사람이 걸러내는 단계 (voiceInput.js 주석 참조) */
  const toggleVoice = () => {
    if (listening) { recRef.current?.stop(); return; }
    if (!isVoiceSupported()) {
      setToast({ message: "이 브라우저는 음성 입력을 지원하지 않습니다. 크롬 계열에서 사용하세요." });
      return;
    }
    baseRef.current = input ? input + " " : "";
    const rec = startVoice(
      (text) => setInput(baseRef.current + text),
      (reason) => { setListening(false); recRef.current = null; if (reason) setToast({ message: reason }); }
    );
    if (rec) { recRef.current = rec; setListening(true); }
  };

  useEffect(() => () => recRef.current?.stop(), []);

  return (
  <div className={cn("shrink-0 px-4 sm:px-12 pb-7 pt-5 border-t transition-colors", isSecure ? "bg-[#0a0f1c]/85 backdrop-blur-sm border-slate-800" : "bg-white/85 backdrop-blur-sm border-slate-200")}>
    <div className="max-w-3xl mx-auto">
      {/* Unified Input Box */}
      <div className={cn("rounded-2xl border-2 shadow-lg transition-all", th.inputBg, !isSecure && "ring-1 ring-gray-100")}>
        {/* Textarea */}
        <div className="px-4 pt-4 pb-1">
          <textarea
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={isSecure ? "보안 문서의 개인정보 마스킹, 보안 규정 준수 여부 등을 지시하세요." : mc.placeholder}
            className={cn("w-full bg-transparent border-none resize-none outline-none text-[15px] placeholder:text-slate-400 min-h-[56px] max-h-[160px] py-1 font-medium leading-relaxed", isSecure ? "text-slate-200" : "text-slate-900")}
            rows={1}
          />
        </div>
        {/* Bottom Row: 첨부·마이크 | 구분 | RAG·LLM·파이프라인 | 전송 */}
        <div className="flex items-center gap-1.5 px-3 pb-3 pt-0.5">
          <input type="file" className="hidden" ref={fileInputRef} onChange={e => { const f = e.target.files?.[0]; if (f) setToast({ message: `'${f.name}' 업로드 중. DRM 해제 및 OCR 처리가 시작됩니다.` }); }} />
          <button onClick={() => fileInputRef.current?.click()} title="파일 첨부" aria-label="파일 첨부" className={cn("h-8 w-8 rounded-lg flex items-center justify-center transition-colors", isSecure ? "text-slate-500 hover:text-blue-400 hover:bg-slate-800" : "text-slate-400 hover:text-slate-700 hover:bg-slate-100")}>
            <Paperclip className="w-4 h-4" />
          </button>
          <button title={listening ? "음성 입력 중지" : "음성 입력"} aria-label={listening ? "음성 입력 중지" : "음성 입력"}
            aria-pressed={listening} onClick={toggleVoice}
            className={cn("h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
              listening ? "bg-rose-500 text-white animate-pulse"
              : isSecure ? "text-slate-500 hover:text-blue-400 hover:bg-slate-800" : "text-slate-400 hover:text-slate-700 hover:bg-slate-100")}>
            {listening ? <Square className="w-3.5 h-3.5 fill-current" /> : <Mic className="w-4 h-4" />}
          </button>
          {onOpenScan && (
            <button title={scanLabel} aria-label={scanLabel} onClick={onOpenScan}
              className={cn("h-8 w-8 rounded-lg flex items-center justify-center transition-colors", isSecure ? "text-slate-500 hover:text-blue-400 hover:bg-slate-800" : "text-slate-400 hover:text-slate-700 hover:bg-slate-100")}>
              <ScanLine className="w-4 h-4" />
            </button>
          )}

          <div className="flex-1" />

          {/* RAG 토글 pill */}
          <button
            onClick={() => { setRagMode(!ragMode); setToast({ message: `${!ragMode ? "지식 참조(RAG)" : "직접 응답(LLM Only)"} 모드로 전환되었습니다.` }); }}
            className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold border transition-colors",
              ragMode
                ? (isSecure ? "bg-blue-900/40 text-blue-400 border-blue-800" : "bg-blue-50 text-blue-600 border-blue-200")
                : (isSecure ? "text-slate-500 border-slate-700 hover:border-slate-600" : "text-slate-400 border-slate-200 hover:border-slate-300"))}>
            <Database className="w-3 h-3" />
            <span>{ragMode ? "지식참조" : "직접응답"}</span>
          </button>

          {/* LLM 선택기 — 드롭다운은 createPortal로 body에 직접 렌더링 (overflow-hidden 우회) */}
          <div ref={llmDropdownRef}>
            <button
              ref={llmButtonRef}
              onClick={() => {
                if (!showLLMDropdown && llmButtonRef.current) {
                  const r = llmButtonRef.current.getBoundingClientRect();
                  setLlmDropdownPos({ bottom: window.innerHeight - r.top + 8, right: window.innerWidth - r.right });
                }
                setShowLLMDropdown(!showLLMDropdown);
              }}
              className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold border transition-colors",
                isSecure ? "bg-[#040814] border-slate-700 text-blue-400 hover:border-blue-600" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300")}>
              <Cpu className="w-3 h-3" />
              <span>{activeLLM.shortName}</span>
              <div className={cn("w-1.5 h-1.5 rounded-full", activeLLM.status === "running" ? "bg-green-500" : "bg-red-400")} />
              <ChevronDown className={cn("w-3 h-3 opacity-70 transition-transform", showLLMDropdown && "rotate-180")} />
            </button>
          </div>

          {/* 에이전트 파이프라인 버튼 */}
          {isAgent && (
            <button onClick={() => setShowBuilderModal(true)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold border bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 transition-colors">
              <Workflow className="w-3 h-3" /> 파이프라인
            </button>
          )}

          {/* 전송 버튼 */}
          <button onClick={() => handleSend()} aria-label="메시지 전송" className={cn("h-9 w-9 rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-95 ml-0.5", isSecure ? "bg-blue-600 hover:bg-blue-700 text-white" : cn(mc.colors.active, "hover:opacity-90 text-white"))}>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className={cn("text-center text-[11px] mt-3 font-medium", isSecure ? "text-slate-500 font-mono" : "text-slate-400")}>
        {isSecure ? "✓ 외부망 연결 차단됨 · 입력 데이터 외부 전송 없음" : "AI 답변은 참고용입니다. 중요한 사항은 원문 및 담당 부서를 통해 확인하세요."}
      </p>
    </div>
  </div>
  );
};

export default ChatInput;
