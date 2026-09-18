import React from "react";
import {
  MessageSquare, FileCheck, Languages, FileText, Bot, ShieldCheck,
  Star, AlertTriangle, BookOpen, Info, X,
} from "lucide-react";
import { cn } from "../../utils.jsx";

/* 사용 가이드(튜토리얼) 모달 — 주요 기능 8종 안내 */
const TutorialModal = ({ onClose }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 mx-4 animate-in zoom-in-90 duration-200 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border-2 border-blue-200 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800">사용 가이드</h3>
            <p className="text-[13px] text-slate-500 font-medium">RoadQ AI 플랫폼 주요 기능 안내</p>
          </div>
        </div>
        <button onClick={onClose} aria-label="닫기" className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"><X className="w-5 h-5" /></button>
      </div>
      {/* 기능 카드 2열 그리드 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { icon: MessageSquare, color: "bg-blue-50 border-blue-100 text-blue-600", title: "일반 질의", desc: "사내 규정·지식 기반 자연어 Q&A. 출처 문서와 유사도 점수를 함께 제공합니다." },
          { icon: FileCheck, color: "bg-purple-50 border-purple-100 text-purple-600", title: "문서 검토", desc: "업로드 문서를 사내 규정과 대조하여 보완 사항 및 위반 소지를 발췌합니다." },
          { icon: Languages, color: "bg-violet-50 border-violet-100 text-violet-600", title: "번역·요약", desc: "한↔영·중·일 번역 및 요약 길이(100~2,000자) 조절 기능을 제공합니다." },
          { icon: FileText, color: "bg-green-50 border-green-100 text-green-600", title: "보고서 작성", desc: "구두 지시 또는 데이터 입력으로 보고서 초안을 자동 생성합니다." },
          { icon: Bot, color: "bg-indigo-50 border-indigo-100 text-indigo-600", title: "에이전트 모드", desc: "다단계 파이프라인 에이전트가 복잡한 업무를 단계별로 자동 처리합니다." },
          { icon: ShieldCheck, color: "bg-slate-100 border-slate-200 text-slate-700", title: "보안 채팅", desc: "망분리·개인정보 마스킹 적용 구역. 대외비 문서를 안전하게 처리합니다." },
          { icon: Star, color: "bg-yellow-50 border-yellow-100 text-yellow-600", title: "만족도 평가", desc: "AI 답변 3회 후 자동으로 만족도 평가 요청이 팝업됩니다." },
          { icon: AlertTriangle, color: "bg-red-50 border-red-100 text-red-600", title: "오류 신고", desc: "AI 답변의 환각·부정확 내용을 즉시 신고하여 품질 개선에 기여합니다." },
        ].map(({ icon: Icon, color, title, desc }) => (
          <div key={title} className={cn("p-4 rounded-2xl border-2", color.split(' ').slice(0,2).join(' '))}>
            <div className={cn("w-9 h-9 rounded-xl border flex items-center justify-center mb-3", color)}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="font-black text-[14px] text-slate-800 mb-1">{title}</div>
            <div className="text-[12px] text-slate-500 font-medium leading-relaxed">{desc}</div>
          </div>
        ))}
      </div>
      {/* TIP 박스 */}
      <div className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-100">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <div className="font-black text-[13px] text-blue-800 mb-1">TIP</div>
            <ul className="text-[12px] text-blue-700 font-medium space-y-1 list-disc list-inside">
              <li>좌측 사이드바에서 대화 모드(탭)를 전환할 수 있습니다.</li>
              <li>우측 패널 "내 RAG" 탭에서 개인 지식 영역을 관리할 수 있습니다.</li>
              <li>질문 입력창에 파일을 첨부하거나 마이크로 음성 입력도 가능합니다.</li>
              <li>AI 답변에 마우스를 올리면 복사·평가·오류신고 버튼이 나타납니다.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default TutorialModal;
