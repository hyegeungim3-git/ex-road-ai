import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, ScanLine, Camera, Keyboard, AlertTriangle, ArrowRight } from "lucide-react";
import { cn } from "../utils.jsx";

/* ==================================================================
 * 설비·로트 코드 스캔
 *
 * 현장에서 "PRS-C03 진동 어때?"를 장갑 낀 손으로 타이핑하는 대신 설비에 붙은
 * QR을 찍는 게 제조의 표준 동선이다.
 *
 * 카메라는 BarcodeDetector(크롬 계열)로 읽되, 없는 환경·권한 거부·데모 상황을
 * 위해 수동 입력과 등록 코드 목록을 항상 함께 둔다.
 * (스캐너가 카메라에만 의존하면 시연장에서 못 쓰는 기능이 된다)
 * ================================================================== */

const TYPE_LABEL = { equip: "설비", lot: "로트", order: "작업지시", material: "자재" };

const ScanModal = ({ registry = [], brandColor = "#334155", label = "코드 스캔", onPick, onClose }) => {
  const [manual, setManual] = useState("");
  const [camState, setCamState] = useState("idle"); // idle | live | unsupported | denied
  const [err, setErr] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);

  const lookup = (code) => registry.find(r => r.code.toLowerCase() === code.trim().toLowerCase());

  const submit = (code) => {
    const hit = lookup(code);
    if (!hit) { setErr(`등록되지 않은 코드입니다: ${code}`); return; }
    onPick?.(hit);
  };

  /* 카메라 스캔 — 지원 여부를 먼저 확인하고, 안 되면 조용히 수동 입력으로 남는다 */
  const startCam = async () => {
    setErr(null);
    if (!("BarcodeDetector" in window)) { setCamState("unsupported"); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      setCamState("live");
      const det = new window.BarcodeDetector({ formats: ["qr_code", "code_128", "code_39", "ean_13"] });
      const tick = async () => {
        if (!videoRef.current || videoRef.current.readyState !== 4) { rafRef.current = requestAnimationFrame(tick); return; }
        try {
          const codes = await det.detect(videoRef.current);
          if (codes[0]?.rawValue) { submit(codes[0].rawValue); return; }
        } catch { /* 프레임 단위 실패는 무시하고 계속 */ }
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      setCamState("denied");
    }
  };

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-label={label}
        className="bg-white w-full max-w-lg max-h-[88vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="px-5 py-4 flex items-center gap-3 text-white shrink-0" style={{ backgroundColor: brandColor }}>
          <ScanLine className="w-5 h-5 shrink-0" />
          <div className="min-w-0">
            <div className="text-[15px] font-black">{label}</div>
            <div className="text-[11px] opacity-80">코드를 찍으면 해당 대상의 업무 화면으로 바로 들어갑니다</div>
          </div>
          <button onClick={onClose} aria-label="닫기" className="ml-auto p-2 rounded-lg hover:bg-white/15 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
          {/* 카메라 */}
          {camState === "live" ? (
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
              <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
              <div className="absolute inset-0 border-2 border-white/60 m-10 rounded-lg pointer-events-none" />
            </div>
          ) : (
            <button onClick={startCam}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 transition-colors text-[13px] font-bold">
              <Camera className="w-4 h-4" />카메라로 스캔
            </button>
          )}
          {(camState === "unsupported" || camState === "denied") && (
            <p className="flex items-start gap-1.5 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              {camState === "unsupported"
                ? "이 브라우저는 코드 인식을 지원하지 않습니다. 아래에서 코드를 직접 입력하세요."
                : "카메라를 사용할 수 없습니다(권한 거부 또는 장치 없음). 아래에서 코드를 직접 입력하세요."}
            </p>
          )}

          {/* 수동 입력 */}
          <div>
            <label className="text-[11px] font-black text-slate-500 flex items-center gap-1.5 mb-1.5">
              <Keyboard className="w-3.5 h-3.5" />코드 직접 입력
            </label>
            <div className="flex gap-1.5">
              <input value={manual} onChange={e => { setManual(e.target.value); setErr(null); }}
                onKeyDown={e => e.key === "Enter" && submit(manual)}
                placeholder="예: PRS-C03"
                className="flex-1 min-w-0 border border-slate-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-slate-200" />
              <button onClick={() => submit(manual)} disabled={!manual.trim()}
                className={cn("px-4 rounded-lg text-[13px] font-bold text-white transition-colors shrink-0",
                  manual.trim() ? "hover:opacity-90" : "bg-slate-300 cursor-not-allowed")}
                style={manual.trim() ? { backgroundColor: brandColor } : undefined}>조회</button>
            </div>
            {err && <p className="text-[11px] text-rose-600 mt-1.5">{err}</p>}
          </div>

          {/* 등록 코드 — 데모·현장 모두에서 '무엇을 찍을 수 있는지' 보여준다 */}
          {registry.length > 0 && (
            <div>
              <div className="text-[11px] font-black text-slate-500 mb-1.5">등록된 코드</div>
              <div className="space-y-1.5">
                {registry.map(r => (
                  <button key={r.code} onClick={() => onPick?.(r)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left group">
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded shrink-0 text-white" style={{ backgroundColor: brandColor }}>
                      {TYPE_LABEL[r.type] || "코드"}
                    </span>
                    <span className="text-[12px] font-mono font-bold text-slate-700 shrink-0">{r.code}</span>
                    <span className="text-[11px] text-slate-500 truncate flex-1 min-w-0">{r.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ScanModal;
