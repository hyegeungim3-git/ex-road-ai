import React from "react";
import { FileText, Printer, FileDown, X } from "lucide-react";
import { generateDocHTML } from "../../data/responses.js";

/* 공문서 미리보기 모달 — iframe 렌더링 + 인쇄/다운로드. org: 도메인 조직 정보(브랜딩) */
const DocPreviewModal = ({ docModalData, onClose, onDownload, org }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
    <div className="w-full max-w-3xl h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border-2 border-slate-200 animate-in zoom-in-95 duration-200">
      {/* 모달 헤더 */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-black text-slate-800 leading-tight truncate">{docModalData.title}</div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-mono truncate">{docModalData.docNo} · {docModalData.issueDate}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          <button
            onClick={() => { const w = window.open("", "_blank"); w.document.write(generateDocHTML(docModalData, org)); w.document.close(); setTimeout(() => w.print(), 500); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition-colors">
            <Printer className="w-4 h-4" /> 인쇄 / PDF
          </button>
          <button
            onClick={() => onDownload(docModalData)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white text-[12px] font-bold hover:bg-emerald-700 transition-colors shadow-sm">
            <FileDown className="w-4 h-4" /> 다운로드
          </button>
          <button onClick={onClose} aria-label="닫기" className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors ml-1">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      {/* iframe 문서 렌더링 */}
      <iframe
        srcDoc={generateDocHTML(docModalData)}
        className="flex-1 w-full border-none"
        title="공문서 미리보기"
        sandbox="allow-same-origin allow-scripts allow-popups"
      />
    </div>
  </div>
);

export default DocPreviewModal;
