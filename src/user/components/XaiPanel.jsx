import React, { useState } from "react";
import { Gauge, ChevronDown, FileSearch, UserCheck, Sparkles, CheckCircle2, MinusCircle } from "lucide-react";
import { cn } from "../utils.jsx";
import { logAudit } from "../auditLog.js";

/* ================================================================== */
/* XAI(설명가능한 AI) 답변 푸터 — 신뢰도 게이지·근거 구성·판단 근거     */
/* 데이터는 answer 객체에서: confidence(number)·citations[]·xai{}      */
/*   xai(선택): { queryRewrite, base:{rag,model}, sources:[{name,      */
/*     similarity}], rejected:[{name,similarity,reason}], reasoning }  */
/* xai 미공급 시 citations의 유사도로 근거 구성을 합성한다 (코어 중립) */
/* ================================================================== */
const XaiPanel = ({ msg, isSecure }) => {
  const [open, setOpen] = useState(false);
  const openedRef = React.useRef(false);
  const conf = typeof msg.confidence === "number" ? msg.confidence : null;
  const xai = msg.xai || {};
  // 표시용 근거 목록 — 팩 xai.sources 우선, 없으면 클릭형 citations에서 합성
  const sources = xai.sources?.length ? xai.sources : (msg.citations || []).map(c => ({ name: c.name, similarity: c.similarity }));
  const hasEvidence = sources.length > 0;

  // 근거 전무 + 신뢰도 미산출 → 일반 지식 폴백 답변: 검토 권장 라인만 표시 (HITL)
  if (conf === null && !hasEvidence) {
    return (
      <div className={cn("mt-1.5 flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-bold",
        isSecure ? "bg-amber-900/20 border-amber-800/40 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-700")}>
        <UserCheck className="w-3.5 h-3.5 shrink-0" />
        <span>모델 일반 지식 기반 답변 — 근거 문서 없음 · 중요 사안은 담당자 확인을 권장합니다</span>
      </div>
    );
  }

  const avgSim = hasEvidence ? Math.round(sources.reduce((s, c) => s + (c.similarity || 0), 0) / sources.length) : 0;
  const rag = xai.base?.rag ?? (hasEvidence ? Math.max(55, Math.min(93, avgSim - 4)) : 0);
  const model = xai.base?.model ?? Math.max(0, 100 - rag);
  const low = conf !== null && conf < 75;
  const confTone = conf === null ? "slate" : conf >= 90 ? "emerald" : conf >= 75 ? "blue" : "amber";
  const barColor = { emerald: "bg-emerald-500", blue: "bg-blue-500", amber: "bg-amber-500", slate: "bg-slate-400" }[confTone];
  const numColor = isSecure
    ? { emerald: "text-emerald-400", blue: "text-blue-400", amber: "text-amber-400", slate: "text-slate-400" }[confTone]
    : { emerald: "text-emerald-600", blue: "text-blue-600", amber: "text-amber-600", slate: "text-slate-500" }[confTone];

  return (
    <div className={cn("mt-1.5 rounded-xl border text-[11px] transition-colors",
      isSecure ? "bg-[#0a0f1c] border-slate-800" : "bg-white border-slate-200")}>
      {/* ── 요약 행 (상시 노출) ── */}
      <div className="flex items-center gap-2.5 flex-wrap px-3 py-2">
        {conf !== null && (
          <span className="flex items-center gap-1.5 shrink-0">
            <Gauge className={cn("w-3.5 h-3.5", numColor)} />
            <span className={cn("font-bold", isSecure ? "text-slate-400" : "text-slate-500")}>신뢰도</span>
            <span className={cn("w-16 h-1.5 rounded-full overflow-hidden", isSecure ? "bg-slate-800" : "bg-slate-100")}>
              <span className={cn("block h-full rounded-full", barColor)} style={{ width: `${conf}%` }} />
            </span>
            <span className={cn("font-black font-mono tabular-nums", numColor)}>{conf}%</span>
          </span>
        )}
        {hasEvidence && (
          <span className={cn("flex items-center gap-1.5 min-w-0", isSecure ? "text-slate-400" : "text-slate-500")}>
            <FileSearch className="w-3.5 h-3.5 shrink-0" />
            <span className="font-bold truncate">근거 사내 문서 {sources.length}건 {rag}% · 모델 지식 {model}%</span>
          </span>
        )}
        {low && (
          <span className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full font-black shrink-0",
            isSecure ? "bg-amber-900/40 text-amber-400" : "bg-amber-100 text-amber-700")}>
            <UserCheck className="w-3 h-3" /> 담당자 검토 권장
          </span>
        )}
        <button aria-expanded={open}
          onClick={() => setOpen(o => {
            // 첫 열람만 감사 로그에 기록 (XAI 열람율 지표) — SECURE는 무저장
            if (!o && !openedRef.current && !isSecure) { openedRef.current = true; logAudit({ type: "xai_open", summary: `신뢰도 ${conf ?? "-"}% 답변의 판단 근거 열람` }); }
            return !o;
          })}
          className={cn("ml-auto flex items-center gap-1 font-black shrink-0 transition-colors",
            isSecure ? "text-blue-400 hover:text-blue-300" : "text-indigo-600 hover:text-indigo-800")}>
          왜 이 답변인가
          <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")} />
        </button>
      </div>

      {/* ── 상세 패널 (접이식) ── */}
      {open && (
        <div className={cn("px-3 pb-3 pt-2 border-t space-y-2.5", isSecure ? "border-slate-800" : "border-slate-100")}>
          {xai.queryRewrite && (
            <div>
              <div className={cn("text-[9px] font-black uppercase tracking-widest mb-1", isSecure ? "text-slate-500" : "text-slate-400")}>검색 질의 변환</div>
              <div className={cn("font-mono text-[11px] px-2 py-1.5 rounded-lg", isSecure ? "bg-slate-900 text-slate-300" : "bg-slate-50 text-slate-600")}>
                &ldquo;{xai.queryRewrite}&rdquo;
              </div>
            </div>
          )}
          {hasEvidence && (
            <div>
              <div className={cn("text-[9px] font-black uppercase tracking-widest mb-1.5", isSecure ? "text-slate-500" : "text-slate-400")}>근거 문서 채택 내역</div>
              <div className="space-y-1.5">
                {sources.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className={cn("w-3 h-3 shrink-0", isSecure ? "text-emerald-400" : "text-emerald-500")} />
                    <span className={cn("truncate font-bold flex-1 min-w-0", isSecure ? "text-slate-300" : "text-slate-700")}>{s.name}</span>
                    <span className={cn("w-14 h-1 rounded-full overflow-hidden shrink-0", isSecure ? "bg-slate-800" : "bg-slate-100")}>
                      <span className="block h-full rounded-full bg-blue-400" style={{ width: `${s.similarity || 0}%` }} />
                    </span>
                    <span className={cn("font-mono font-bold tabular-nums shrink-0 w-8 text-right", isSecure ? "text-slate-400" : "text-slate-500")}>{s.similarity}%</span>
                  </div>
                ))}
                {(xai.rejected || []).map((r, i) => (
                  <div key={`r${i}`} className="flex items-center gap-2 opacity-70">
                    <MinusCircle className={cn("w-3 h-3 shrink-0", isSecure ? "text-slate-500" : "text-slate-400")} />
                    <span className={cn("truncate flex-1 min-w-0", isSecure ? "text-slate-500" : "text-slate-400")}>
                      {r.name} <span className="font-medium">— 기각: {r.reason}</span>
                    </span>
                    <span className={cn("font-mono tabular-nums shrink-0 w-8 text-right", isSecure ? "text-slate-600" : "text-slate-400")}>{r.similarity}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {xai.reasoning && (
            <div>
              <div className={cn("text-[9px] font-black uppercase tracking-widest mb-1", isSecure ? "text-slate-500" : "text-slate-400")}>판단 근거</div>
              <p className={cn("leading-relaxed font-medium", isSecure ? "text-slate-300" : "text-slate-600")}>{xai.reasoning}</p>
            </div>
          )}
          <div className={cn("flex items-start gap-1.5 pt-1.5 border-t text-[10px] font-medium",
            isSecure ? "border-slate-800 text-slate-500" : "border-slate-100 text-slate-400")}>
            <Sparkles className="w-3 h-3 shrink-0 mt-0.5" />
            <span>AI 생성 답변입니다 (AI 기본법 제31조 고지). 내부 문서 기준 시점의 정보이며, 중요 의사결정은 담당자 검토를 거치세요.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default XaiPanel;
