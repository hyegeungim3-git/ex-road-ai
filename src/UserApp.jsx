import React, { useState, useEffect, useMemo, useRef, Suspense, lazy } from "react";
import { ShieldCheck } from "lucide-react";

import { cn } from "./user/utils.jsx";
import { initLive, stepLive, liveAlertOf } from "./user/liveEngine.js";
import { logAudit } from "./user/auditLog.js";
import { allScenarios } from "./user/scenarios.js";
import { uiStrings, loadUiPrefs, saveUiPrefs, UI_LANGS } from "./user/i18n.js";
import Toast from "./user/components/Toast.jsx";
import {
  MODES as BASE_MODES, HISTORY as BASE_HISTORY, DOCS as BASE_DOCS,
  SUGGESTIONS as BASE_SUGGESTIONS, AGENT_TEAMS as BASE_AGENT_TEAMS,
  SECURE_SUGGESTIONS as BASE_SECURE_SUGGESTIONS,
} from "./user/data/constants.js";
import { AI_RESPONSES, generateDocHTML } from "./user/data/responses.js";
import { checkInputFilter, applyOutputGuardrails } from "./user/guardrails.js";
import { matchMapIntel, buildMapIntelResponse } from "./user/mapIntel.js";
import { mergeAgentTeams } from "./domains/index.js";
import { demoStorage, makeDomainStorageKey } from "./core/demoStorage.js";

/* 레이아웃 컴포넌트 (2-C 분해: 탭·패널 단위) */
import Sidebar from "./user/components/layout/Sidebar.jsx";
import ChatHeader from "./user/components/layout/ChatHeader.jsx";
import ChatMessages from "./user/components/layout/ChatMessages.jsx";
import ChatInput from "./user/components/layout/ChatInput.jsx";
import RightPanel from "./user/components/layout/RightPanel.jsx";

/* 모달 컴포넌트 */
import AgentBuilderModal from "./user/components/modals/AgentBuilderModal.jsx";
import SatisfactionModal from "./user/components/modals/SatisfactionModal.jsx";
import TutorialModal from "./user/components/modals/TutorialModal.jsx";
import ShiftHandoverModal from "./user/components/ShiftHandoverModal.jsx";
import ScanModal from "./user/components/ScanModal.jsx";
import WorkOrderModal from "./user/components/WorkOrderModal.jsx";
import { seedOrders, readOrders, summarize } from "./user/workOrders.js";
import { buildDraft, readIncoming } from "./user/shiftHandover.js";
import ErrorReportModal from "./user/components/modals/ErrorReportModal.jsx";
import QnaModal from "./user/components/modals/QnaModal.jsx";
import DocPreviewModal from "./user/components/modals/DocPreviewModal.jsx";
import LLMDropdownPortal from "./user/components/modals/LLMDropdownPortal.jsx";

import AgentHub from "./user/components/agents/AgentHub.jsx";
// 에이전트 코드 스플리팅: 각 에이전트는 클릭 시점에 로드되어 초기 번들 크기를 줄임
const ChatbotAgent = lazy(() => import("./user/components/agents/ChatbotAgent.jsx"));
const ReportAgent = lazy(() => import("./user/components/agents/ReportAgent.jsx"));
const MeetingMinutesAgent = lazy(() => import("./user/components/agents/MeetingMinutesAgent.jsx"));
const InternalRegAgent = lazy(() => import("./user/components/agents/InternalRegAgent.jsx"));
const OCRAgent = lazy(() => import("./user/components/agents/OCRAgent.jsx"));
const KnowledgeAgent = lazy(() => import("./user/components/agents/KnowledgeAgent.jsx"));
const DBQueryAgent = lazy(() => import("./user/components/agents/DBQueryAgent.jsx"));
const AddressAgent = lazy(() => import("./user/components/agents/AddressAgent.jsx"));
const DataAnalysisAgent = lazy(() => import("./user/components/agents/DataAnalysisAgent.jsx"));
const SummaryAgent = lazy(() => import("./user/components/agents/SummaryAgent.jsx"));
const TranslateAgent = lazy(() => import("./user/components/agents/TranslateAgent.jsx"));
const DocReviewAgent = lazy(() => import("./user/components/agents/DocReviewAgent.jsx"));
const SafetyPlanAgent = lazy(() => import("./user/components/agents/SafetyPlanAgent.jsx"));
const OrchestrationScenario = lazy(() => import("./user/components/agents/OrchestrationScenario.jsx"));
// 시계열 인텔리전스(데이터 탭) — recharts를 쓰므로 별도 청크로 분리
const TimeSeriesPanel = lazy(() => import("./user/timeseries/TimeSeriesPanel.jsx"));

/* 4단계: 새로고침 대화 유지 — localStorage에서 대화 목록·활성 대화 복원 */
const VALID_MODES = ["GENERAL", "REVIEW", "TRANSLATE", "REPORT"];
const loadInitialConvoState = (domainId) => {
  const stored = demoStorage.readJson(makeDomainStorageKey("convos", domainId), []);
  const list = Array.isArray(stored) ? stored : [];
  const id = demoStorage.readText(makeDomainStorageKey("activeConvo", domainId));
  const c = list.find((x) => x.id === id) || null;
  return {
    list,
    id: c ? id : null,
    messages: c?.messages || [],
    mode: c && VALID_MODES.includes(c.mode) ? c.mode : "GENERAL",
  };
};

// 에이전트 로딩 폴백
const AgentLoadingFallback = () => (
  <div className="flex-1 flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-3 border-[#00539F] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm font-bold text-slate-600">에이전트 로딩 중…</p>
    </div>
  </div>
);


/* ================================================================== */
/* MAIN USER APP COMPONENT — 상태·핸들러·조립만 담당 (2-C 분해 후)      */
/* ================================================================== */
const UserApp = ({ onSwitchToAdmin, onExitPortal, domain, initialTab, initialAgentId, onRouteChange }) => {
  // ── 도메인 팩 주입: 조직·사용자·워크스페이스·LLM·에이전트 카탈로그는 팩에서 공급 ──
  const USER_INFO = domain.user;
  const WORKSPACES = domain.workspaces;
  const LLM_MODELS = domain.llmModels;
  const AGENT_TEAMS = useMemo(() => mergeAgentTeams(BASE_AGENT_TEAMS, domain), [domain]);
  const HISTORY = domain.history || BASE_HISTORY;
  const DOCS = domain.docs || BASE_DOCS;
  const MODES = useMemo(() => {
    if (!domain.modeDesc) return BASE_MODES;
    const merged = { ...BASE_MODES };
    for (const k of Object.keys(domain.modeDesc)) merged[k] = { ...merged[k], desc: domain.modeDesc[k] };
    return merged;
  }, [domain]);
  const SUGGESTIONS = useMemo(
    () => (domain.suggestions ? { ...BASE_SUGGESTIONS, GENERAL: domain.suggestions } : BASE_SUGGESTIONS),
    [domain]
  );
  const SECURE_SUGG = domain.secureSuggestions || BASE_SECURE_SUGGESTIONS;

  // 새로고침 복원: 컴포넌트 최초 렌더 시 1회만 localStorage에서 읽음
  const [initialConvo] = useState(() => loadInitialConvoState(domain.id));

  const [chatTab, setChatTab] = useState(initialTab || "GENERAL");   // GENERAL | AGENT | DATA | SECURE
  const [mode, setMode] = useState(initialConvo.mode);   // GENERAL 탭 서브모드
  // 반응형 초기값: 모바일(<768)은 사이드바 접힘, <1280은 우측 패널 접힘
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window === "undefined" || window.matchMedia("(min-width: 768px)").matches);
  const [rightOpen, setRightOpen] = useState(() => typeof window === "undefined" || window.matchMedia("(min-width: 1280px)").matches);
  const [messages, setMessages] = useState(initialConvo.messages);
  // 대화 이력(4단계): 사용자 대화는 localStorage에 지속, 팩 HISTORY는 시드로 병합 표시
  const [convos, setConvos] = useState(initialConvo.list);
  const [activeConvoId, setActiveConvoId] = useState(initialConvo.id);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [ragMode, setRagMode] = useState(true);
  const [panelView, setPanelView] = useState("DOCS");
  const [activeCitation, setActiveCitation] = useState(null);
  const [toast, setToast] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState("ws1");
  const [activeLLM, setActiveLLM] = useState(LLM_MODELS[0]);
  const [showLLMDropdown, setShowLLMDropdown] = useState(false);
  // 에이전트 탭 전용 state
  const [activeAgentId, setActiveAgentId] = useState(initialAgentId || null);
  // 현재 탭·에이전트를 주소에 반영 (새로고침 시 같은 화면으로 복귀)
  useEffect(() => { onRouteChange && onRouteChange(chatTab, activeAgentId); }, [chatTab, activeAgentId]);
  const [selectedAgent] = useState(AGENT_TEAMS[0]);
  const [showBuilderModal, setShowBuilderModal] = useState(false);
  const [builderTab, setBuilderTab] = useState("WORKFLOW");
  const [selectedNode, setSelectedNode] = useState(null);
  // 번역·요약 컨트롤
  const [translateLang, setTranslateLang] = useState("한→영");
  const [summaryLen, setSummaryLen] = useState(500);
  // 이용만족도 평가
  const [showSatisfaction, setShowSatisfaction] = useState(false);
  const [satRating, setSatRating] = useState(0);
  const [satComment, setSatComment] = useState('');
  // 튜토리얼
  const [showTutorial, setShowTutorial] = useState(false);
  const [showHandover, setShowHandover] = useState(false);
  const [showScan, setShowScan] = useState(false);
  const [showWorkOrders, setShowWorkOrders] = useState(false);
  const [woTick, setWoTick] = useState(0); // 지시 상태 변경 후 카드 갱신용
  const [handoverTick, setHandoverTick] = useState(0); // 인수인계 확정 후 카드 갱신용
  // 오류 신고
  const [showErrReport, setShowErrReport] = useState(false);
  const [, setErrReportMsgId] = useState(null);
  const [errReportText, setErrReportText] = useState('');

  /* 공지 배너 & Q&A 모달 */
  const [showNoticeBanner, setShowNoticeBanner] = useState(true);
  const [showQnaModal, setShowQnaModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [docModalData, setDocModalData] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const userMenuRef = useRef(null);
  const llmDropdownRef = useRef(null);
  const llmButtonRef = useRef(null);
  const llmPortalRef = useRef(null);
  const [llmDropdownPos, setLlmDropdownPos] = useState(null);

  const isSecure = chatTab === "SECURE";
  const isAgent = chatTab === "AGENT";
  const mc = MODES[mode];

  /* ---------------------------------------------------------------- */
  /* EFFECTS                                                           */
  /* ---------------------------------------------------------------- */
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  /* ── 대화 지속(4단계): GENERAL 탭 대화만 저장 — SECURE는 무저장 서사 유지 ── */
  useEffect(() => {
    demoStorage.writeJson(
      makeDomainStorageKey("convos", domain.id),
      convos.slice(0, 20),
      { sensitive: chatTab === "SECURE" },
    );
  }, [convos, domain.id, chatTab]);
  useEffect(() => {
    const key = makeDomainStorageKey("activeConvo", domain.id);
    const options = { sensitive: chatTab === "SECURE" };
    if (activeConvoId) demoStorage.writeText(key, activeConvoId, options);
    else demoStorage.remove(key, options);
  }, [activeConvoId, domain.id, chatTab]);
  useEffect(() => {
    if (chatTab !== "GENERAL" || messages.length === 0) return undefined;
    const timer = setTimeout(() => {
      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      if (!activeConvoId) {
        const firstUser = messages.find((message) => message.role === "user");
        if (!firstUser) return;
        const id = `c-${firstUser.id}`;
        setActiveConvoId(id);
        setConvos((prev) => [{ id, title: firstUser.content.slice(0, 26), mode, time: now, isToday: true, starred: false, messages }, ...prev]);
      } else {
        setConvos((prev) => prev.map((convo) => (convo.id === activeConvoId ? { ...convo, messages, mode, time: now } : convo)));
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [messages, chatTab, activeConvoId, mode]);

  /* ── 접근성(4단계): Esc로 최상위 모달·드롭다운 닫기 ── */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (showDocModal) setShowDocModal(false);
      else if (showQnaModal) setShowQnaModal(false);
      else if (showErrReport) setShowErrReport(false);
      else if (showTutorial) setShowTutorial(false);
      else if (showSatisfaction) setShowSatisfaction(false);
      else if (showBuilderModal) { setShowBuilderModal(false); setSelectedNode(null); }
      else if (showLLMDropdown) setShowLLMDropdown(false);
      else if (showUserMenu) setShowUserMenu(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showDocModal, showQnaModal, showErrReport, showTutorial, showSatisfaction, showBuilderModal, showLLMDropdown, showUserMenu]);
  useEffect(() => {
    const h = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
      if (llmDropdownRef.current && !llmDropdownRef.current.contains(e.target) &&
          (!llmPortalRef.current || !llmPortalRef.current.contains(e.target))) setShowLLMDropdown(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* ---------------------------------------------------------------- */
  /* RESPONSE LOGIC                                                    */
  /* ---------------------------------------------------------------- */
  // modeOverride/tabOverride: 이력 복원처럼 상태 반영 전에 호출할 때 사용
  const getAIResponse = (query, modeOverride, tabOverride) => {
    const q = query.toLowerCase();
    const curMode = modeOverride || mode;
    const curTab = tabOverride || chatTab;
    const secure = curTab === "SECURE";
    const agent = curTab === "AGENT";
    const MA = domain.modeAnswers || {};   // 팩 오버라이드: SECURE_AIRGAP/SECURE_DEFAULT/REVIEW/TRANSLATE/REPORT
    if (secure) {
      if (q.includes("망분리") || q.includes("보안") || q.includes("차단")) return MA.SECURE_AIRGAP || AI_RESPONSES.SECURE_AIRGAP;
      return MA.SECURE_DEFAULT || AI_RESPONSES.SECURE_DEFAULT;
    }
    if (agent) {
      if (selectedAgent.id === "agent-1") return AI_RESPONSES.AGENT1;
      if (selectedAgent.id === "agent-2") return AI_RESPONSES.AGENT2;
      return AI_RESPONSES.AGENT3;
    }
    if (curMode === "GENERAL") {
      // 지도 인텔리전스: 지역 질의 감지 시 히트맵+시계열 응답 (팩 mapIntel 공급, 샘플 응답보다 우선)
      const mapHit = matchMapIntel(q, domain.mapIntel);
      if (mapHit) return buildMapIntelResponse(domain.mapIntel, mapHit.region);
      // 도메인 팩이 자체 샘플 응답을 제공하면 우선 매칭
      if (domain.sampleAnswers) {
        const hit = domain.sampleAnswers.find(sa => sa.keywords.some(k => q.includes(k)));
        if (hit) return { ...hit.answer };
      }
      if (domain.id === "expressway") {
        if (q.includes("교통량") || q.includes("결측") || q.includes("VDS") || q.includes("상시조사") || q.includes("주기")) return AI_RESPONSES.GENERAL_PSV;
        if (q.includes("예산") || q.includes("과업") || q.includes("사업비") || q.includes("금액") || q.includes("기간")) return AI_RESPONSES.GENERAL_BUDGET;
      }
    }
    if (curMode === "REVIEW") return MA.REVIEW || AI_RESPONSES.REVIEW_DEFAULT;
    if (curMode === "TRANSLATE") return MA.TRANSLATE || AI_RESPONSES.TRANSLATE_DEFAULT;
    if (curMode === "REPORT") return MA.REPORT || AI_RESPONSES.REPORT_DEFAULT;
    return { content: `**[${MODES[curMode]?.label || curMode} 모드]**\n\n${ragMode ? "사내 지식망(RAG)에서 검색했으나 정확히 일치하는 항목을 찾지 못했습니다." : "직접 응답 모드(LLM Only)로 답변드립니다."}\n\n좀 더 구체적인 질문을 입력해 주세요.`, citations: [], steps: null };
  };

  /* ── 대화 전환·이력(4단계) ── */
  const newConversation = () => {
    setMessages([]); setInput(""); setPanelView("DOCS"); setActiveCitation(null); setActiveConvoId(null);
  };
  const handleModeChange = (m) => {
    if (m === mode) return;
    setMode(m);
    newConversation();
  };
  const loadHistoryItem = (h) => {
    const m = VALID_MODES.includes(h.mode) ? h.mode : "GENERAL";
    setChatTab("GENERAL"); setPanelView("DOCS"); setActiveCitation(null); setMode(m);
    if (h.messages) {
      // 저장된 실제 대화 복원
      setMessages(h.messages);
      setActiveConvoId(h.id);
    } else {
      // 팩 시드 이력 — 제목 질의로 당시 대화를 재구성
      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const resp = applyOutputGuardrails(getAIResponse(h.title, m, "GENERAL"));
      setActiveConvoId(null);
      setMessages([
        { id: Date.now(), role: "user", content: h.title, time: now },
        { id: Date.now() + 1, role: "assistant", time: now, ...resp },
      ]);
    }
    // 모바일: 이력 선택 후 오버레이 사이드바 닫기
    if (window.matchMedia("(max-width: 767px)").matches) setSidebarOpen(false);
  };
  // 사이드바·빈 화면에 표시할 이력: 사용자 대화(최신순) + 팩 시드(제목 중복 시 시드 숨김)
  const displayHistory = useMemo(
    () => [...convos, ...HISTORY.filter((h) => !convos.some((c) => c.title === h.title || h.title.startsWith(c.title)))],
    [convos, HISTORY]
  );

  const handleSend = (text = null) => {
    const msgText = (text || input).trim();
    if (!msgText) return;

    // ── 입력 필터링 검사 (관리자 가드레일) ──
    const { blocked, warning, matchedRule } = checkInputFilter(msgText);
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    if (blocked) {
      // 차단: 사용자 메시지 + 시스템 차단 안내 메시지 추가 후 종료
      setMessages(prev => [...prev,
        { id: Date.now(), role: "user", content: msgText, time: now, filtered: true },
        { id: Date.now() + 1, role: "blocked", time: now, ruleName: matchedRule.n, ruleCategory: matchedRule.category, keywords: matchedRule.p },
      ]);
      setInput("");
      return;
    }

    // 경고: 사용자 메시지에 경고 플래그 부착
    setMessages(prev => [...prev, {
      id: Date.now(), role: "user", content: msgText, time: now,
      ...(warning ? { warningRule: matchedRule.n, warningKeywords: matchedRule.p } : {}),
    }]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      const resp = applyOutputGuardrails(getAIResponse(msgText));
      // 채팅→에이전트 핸드오프: 팩 agentRouting 키워드 매칭 (GENERAL 탭 한정, 지도 응답 제외)
      let handoff = null;
      if (chatTab === "GENERAL" && !resp.mapIntel && domain.agentRouting) {
        const q = msgText.toLowerCase();
        const hit = domain.agentRouting.find(r => r.keywords.some(k => q.includes(k)));
        if (hit) {
          const name = hit.agentId.startsWith("orchestration")
            ? (allScenarios(domain)[Number(hit.agentId.split(":")[1]) || 0]?.title ?? "복합 업무 시나리오")
            : (AGENT_TEAMS.find(a => a.id === hit.agentId)?.name ?? "AI 에이전트");
          handoff = { agentId: hit.agentId, name, reason: hit.reason };
        }
      }
      // 감사 추적 — SECURE는 무저장 서사 유지
      if (chatTab !== "SECURE") {
        logAudit({
          type: "query", mode, summary: msgText.slice(0, 60),
          confidence: typeof resp.confidence === "number" ? resp.confidence : null,
          grounded: (resp.citations?.length || 0) > 0 || !!resp.xai,
        });
      }
      setIsTyping(false);
      setMessages(prev => {
        const newMsgs = [...prev, { id: Date.now() + 1, role: "assistant", time: now, ...resp, ...(handoff ? { handoff } : {}) }];
        const aiCount = newMsgs.filter(m => m.role === "assistant").length;
        if (aiCount === 3) setTimeout(() => setShowSatisfaction(true), 1200);
        return newMsgs;
      });
    }, 1800);
  };

  const handleCitationClick = (cite) => { setRightOpen(true); setPanelView("READER"); setActiveCitation(cite); };

  // 답변 피드백 → localStorage 저장(관리자 'AI 답변 품질 관리'가 병합 표시). SECURE는 무저장 서사 유지
  const handleFeedback = (msg, rating, reason) => {
    if (chatTab !== "SECURE") {
      const key = makeDomainStorageKey("feedback", domain.id);
      const stored = demoStorage.readJson(key, []);
      const arr = Array.isArray(stored) ? stored : [];
      const idx = messages.findIndex(m => m.id === msg.id);
      let query = "";
      for (let i = idx - 1; i >= 0; i--) if (messages[i].role === "user") { query = messages[i].content; break; }
      /* 한 답변에 대한 평가는 하나만 남긴다 — 평가를 바꾸면 이전 것을 대체.
         그러지 않으면 마음을 바꾼 사용자 한 명이 '정확 1건 + 할루시네이션 1건'으로
         양쪽에 계상돼 관리자 품질 지표가 부풀려진다. */
      const rest = arr.filter(f => f.msgId !== msg.id);
      rest.unshift({
        id: `UF-${msg.id}`, msgId: msg.id, query, answer: (msg.content || "").slice(0, 120),
        rating, reason: reason || "",
        confidence: typeof msg.confidence === "number" ? msg.confidence / 100 : null,
        date: new Date().toISOString().slice(0, 10),
      });
      demoStorage.writeJson(key, rest.slice(0, 30), { sensitive: false });
    }
    if (chatTab !== "SECURE") logAudit({ type: "feedback", summary: `${rating === "good" ? "도움됨" : "도움 안 됨"}${reason ? ` · ${reason}` : ""}` });
    setToast({
      message: chatTab === "SECURE"
        ? "피드백이 반영되었습니다 (보안 세션 — 기록은 저장되지 않습니다)"
        : rating === "good" ? "피드백이 반영되었습니다. 감사합니다!" : "품질 리뷰에 등록되었습니다 — 관리자 > AI 답변 품질 관리",
    });
  };

  // ── UI 환경설정 (테마·언어) — 크롬 라벨만 전환, 콘텐츠는 한국어 유지 ──
  const [uiPrefs, setUiPrefs] = useState(loadUiPrefs);
  const [showSettings, setShowSettings] = useState(false);
  const L = uiStrings(uiPrefs.lang);
  const isDark = uiPrefs.theme === "dark";
  const updatePrefs = (patch) => setUiPrefs(p => { const next = { ...p, ...patch }; saveUiPrefs(next); return next; });

  // ── 라이브 데이터 엔진 (팩 liveMetric 공급 시에만 구동) ──
  // 엔진은 UserApp 수준에서 1초 틱 — 탭 전환·카드 언마운트와 무관하게 상태 유지
  const liveCfg = domain.liveMetric || null;
  const [liveState, setLiveState] = useState(() => (liveCfg ? initLive(liveCfg) : null));
  const [liveSpeed, setLiveSpeed] = useState(1);
  const liveSpeedRef = useRef(1);
  useEffect(() => { liveSpeedRef.current = liveSpeed; }, [liveSpeed]);
  const [liveNotifs, setLiveNotifs] = useState([]);
  // 엔진 상태는 ref가 정본 — setState 업데이터 안에서 부수효과를 내면 StrictMode 이중 호출로 알림이 중복된다
  // 진행량은 벽시계 경과 기반 — 브라우저가 백그라운드 탭 타이머를 스로틀해도 다음 발화 때 따라잡는다
  const liveRef = useRef(liveState);
  const liveLastRef = useRef(null);
  useEffect(() => {
    if (!liveCfg) return;
    liveLastRef.current = Date.now();
    const t = setInterval(() => {
      const now = Date.now();
      let remain = Math.min(((now - liveLastRef.current) / 1000) * liveSpeedRef.current, 600); // 장시간 스로틀 후 과도 점프 상한(10 시뮬레이션분)
      liveLastRef.current = now;
      let st = liveRef.current, crossedAny = false, crossVal = null;
      while (remain > 0) {
        const dt = Math.min(remain, 60); // 큰 경과는 60초 단위로 분할 (임계·회복 거동 보존)
        const r = stepLive(st, liveCfg, dt);
        st = r.next;
        if (r.crossed) { crossedAny = true; crossVal = st.value; }
        remain -= dt;
      }
      liveRef.current = st;
      setLiveState(st);
      if (crossedAny) {
        const notif = liveAlertOf(liveCfg, crossVal, `live-${Date.now()}`);
        setLiveNotifs(p => [notif, ...p].slice(0, 5)); // 최근 5건만 유지
        setToast({ message: `[실시간 알림] ${notif.title}` });
        logAudit(
          { type: "live_alert", summary: `${liveCfg.label} ${crossVal.toFixed(liveCfg.decimals ?? 1)}${liveCfg.unit} — ${liveCfg.thresholdLabel} 돌파` },
          { sensitive: chatTab === "SECURE" },
        );
      }
    }, 1000);
    return () => clearInterval(t);
  }, [liveCfg, chatTab]);
  // 알림 센터·브리핑에 실시간 알림을 정적 알림 앞에 병합
  const NOTIFS = useMemo(
    () => [...liveNotifs, ...(domain.notifications || [])],
    [liveNotifs, domain.notifications]
  );

  /* 작업지시 요약 — 팩 시드를 최초 1회 주입한 뒤 요약한다.
     woTick은 상태 전이(작업 착수·완료·검증) 후 카드를 다시 읽기 위한 것. */
  const woSummary = useMemo(() => {
    if (!domain.workOrderSeed?.length && !readOrders(domain.id).length) return null;
    seedOrders(domain);
    return summarize(readOrders(domain.id));
  }, [domain, woTick]);

  /* 교대 인수인계 카드 — 팩이 shiftHandover를 주지 않으면 null(카드 비노출).
     handoverTick은 확정 저장 후 '받은 인수인계' 건수를 다시 읽기 위한 것. */
  const handoverCard = useMemo(() => {
    if (!domain.shiftHandover) return null;
    const draft = buildDraft(domain, { notifications: NOTIFS });
    const incoming = readIncoming(domain);
    return {
      title: domain.shiftHandover.title || "",
      hint: domain.shiftHandover.hint || "",
      shiftLabel: draft?.shiftLabel || "",
      shiftTime: draft?.shiftTime || "",
      draftCount: draft?.items?.length || 0,
      incomingCount: incoming?.items?.length || 0,
    };
  }, [domain, NOTIFS, handoverTick]);

  // 데스크톱→모바일 뷰포트 전환 시 열려 있던 사이드바·우측 패널이 오버레이로 겹쳐 뜨는 것 방지
  // (matchMedia change와 resize를 병행 — 에뮬레이션 환경에서 change 미발화 대비)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    let wasMobile = mq.matches;
    const sync = () => {
      if (mq.matches && !wasMobile) { setSidebarOpen(false); setRightOpen(false); }
      wasMobile = mq.matches;
    };
    mq.addEventListener("change", sync);
    window.addEventListener("resize", sync);
    return () => { mq.removeEventListener("change", sync); window.removeEventListener("resize", sync); };
  }, []);

  const handleWorkspaceSwitch = (wsId) => {
    setActiveWorkspace(wsId);
    newConversation();
    const ws = WORKSPACES.find(w => w.id === wsId);
    setToast({ message: `[${ws?.name}] 작업공간으로 전환되었습니다.` });
  };

  const handleTabSwitch = (tab) => {
    setChatTab(tab);
    newConversation();
    if (tab === "AGENT") setActiveAgentId(null);
    if (tab === "SECURE") {
      const localModel = LLM_MODELS.find(model => model.type === "구축형" && model.status === "running") || LLM_MODELS[0];
      if (activeLLM.type !== "구축형") setActiveLLM(localModel);
      setToast({ message: `보안 채팅 활성화 — 대화 내용 무저장 · 로컬 LLM(${localModel.name}) 전용 처리` });
    }
    else if (tab === "AGENT") setToast({ message: "에이전트 모드 — AI 에이전트를 선택하세요.", duration: 1200 });
    else setToast({ message: "일반 채팅 모드로 전환되었습니다." });
  };

  const handleDocDownload = (doc) => {
    const html = generateDocHTML(doc, { name: domain.orgName, short: domain.orgShort, color: domain.brandColor, en: domain.orgEn });
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.type || "보고서"}_${doc.docNo.replace(/[/\\:*?"<>|]/g, "_")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setToast({ message: "다운로드 완료 — 브라우저에서 열어 인쇄(PDF 저장) 가능합니다." });
  };

  /* ---------------------------------------------------------------- */
  /* SECURE / NORMAL THEME TOKENS                                      */
  /* ---------------------------------------------------------------- */
  const th = {
    app: isSecure ? "bg-[#040814]" : "bg-white",
    sidebar: isSecure ? "bg-[#0a0f1c] border-r border-slate-800/60" : "bg-[#F2F5FB] border-r border-slate-200",
    header: isSecure ? "bg-[#0a0f1c]/90 backdrop-blur-md border-b border-slate-800" : "bg-white/90 backdrop-blur-md border-b border-slate-200",
    panel: isSecure ? "bg-[#0a0f1c] border-l border-slate-800/60" : "bg-[#F2F5FB] border-l border-slate-200",
    panelInner: isSecure ? "bg-[#040814]" : "bg-white/60",
    card: isSecure ? "bg-[#0a0f1c]/80 border-slate-800" : "bg-white border-slate-200",
    text: isSecure ? "text-slate-100" : "text-slate-900",
    subtext: isSecure ? "text-slate-400" : "text-slate-500",
    divider: isSecure ? "bg-slate-800" : "bg-slate-200",
    inputBg: isSecure ? "bg-[#0a0f1c] border-slate-700 focus-within:border-blue-500" : `bg-white border-slate-200 ${mc.colors.inputFocus}`,
    chatBg: isSecure ? "bg-[#0a0f1c] border border-slate-700 text-slate-300 rounded-tl-sm shadow-lg" : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-md",
    modeActive: isSecure ? "bg-blue-900/40 text-blue-400 border border-blue-800/50" : mc.colors.active,
    /* sidebar-specific tokens */
    sidebarSection: isSecure ? "border-slate-800/60" : "border-slate-200/70",
    sidebarLabel: isSecure ? "text-slate-500" : "text-slate-400",
    sidebarItem: isSecure ? "text-slate-300 hover:bg-[#1e293b]" : "text-slate-600 hover:bg-white/80",
    sidebarItemActive: isSecure ? "bg-blue-900/40 text-blue-400 border border-blue-800/50" : "bg-white text-slate-900 shadow-sm border border-slate-200/80",
  };

  const activeWs = WORKSPACES.find(w => w.id === activeWorkspace);

  /* ================================================================ */
  /* RENDER — 분해된 레이아웃·모달 컴포넌트 조립                       */
  /* ================================================================ */
  return (
    <div
      className={cn("flex flex-col h-dvh w-full overflow-hidden transition-all duration-500", th.app, isDark && "roadq-dark")}
      style={{ fontFamily: "'Pretendard Variable', 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif" }}
    >
      {toast && <Toast message={toast.message} type={toast.type} duration={toast.duration} onClose={() => setToast(null)} />}

      {/* ── 보안 채팅 배너 ─────────────────────────────────────── */}
      {isSecure && (
        <div className="w-full h-8 bg-gradient-to-r from-[#050c1a] via-[#091428] to-[#050c1a] text-blue-400/80 flex items-center justify-center text-[11px] font-bold tracking-wide shrink-0 border-b border-blue-950 overflow-hidden px-4 gap-2">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-blue-500" />
          <span className="truncate">보안 채팅 — 대화 내용 무저장 · 로컬 LLM 전용 처리 · 외부망 차단 · AI 학습 미활용</span>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* 모바일: 사이드바 오버레이 배경 */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 bg-black/40 z-20" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
        )}
        {/* ====================== LEFT SIDEBAR ====================== */}
        <Sidebar
          domain={domain} th={th} isSecure={isSecure} isAgent={isAgent} chatTab={chatTab}
          sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}
          onTabSwitch={handleTabSwitch} onNewChat={newConversation}
          WORKSPACES={WORKSPACES} activeWorkspace={activeWorkspace} onWorkspaceSwitch={handleWorkspaceSwitch}
          MODES={MODES} mode={mode} setMode={handleModeChange}
          AGENT_TEAMS={AGENT_TEAMS} activeAgentId={activeAgentId} setActiveAgentId={setActiveAgentId}
          HISTORY={displayHistory} onLoadHistory={loadHistoryItem} USER_INFO={USER_INFO}
          showUserMenu={showUserMenu} setShowUserMenu={setShowUserMenu} userMenuRef={userMenuRef}
          setShowNoticeBanner={setShowNoticeBanner} setShowQnaModal={setShowQnaModal}
          onSwitchToAdmin={onSwitchToAdmin}
          onOpenTutorial={() => setShowTutorial(true)}
          onOpenSettings={() => setShowSettings(true)}
          L={L}
        />

        {/* ======================== CENTER ========================== */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* 보안 채팅 배경 워터마크 */}
          {isSecure && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-[0.025] z-0 overflow-hidden select-none">
              <div className="text-[120px] font-black text-blue-400 transform -rotate-12 tracking-widest whitespace-nowrap">SECURE</div>
              <div className="text-[120px] font-black text-blue-400 transform -rotate-12 tracking-widest whitespace-nowrap mt-8">NOT SAVED</div>
            </div>
          )}

          {/* Header + Notice Banner */}
          <ChatHeader
            th={th} isSecure={isSecure} isAgent={isAgent} mc={mc} domain={domain}
            sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}
            activeAgentId={activeAgentId} AGENT_TEAMS={AGENT_TEAMS}
            setShowQnaModal={setShowQnaModal} setShowTutorial={setShowTutorial}
            showNoticeBanner={showNoticeBanner} setShowNoticeBanner={setShowNoticeBanner}
            onExitPortal={onExitPortal}
            notifications={NOTIFS}
            onNotifNavigate={(agentId) => { setChatTab("AGENT"); setActiveAgentId(agentId); }}
            L={L}
          />

          {/* ── AGENT 탭: 허브 & 개별 에이전트 (lazy loading) ── */}
          {chatTab === "AGENT" && (
            <Suspense fallback={<AgentLoadingFallback />}>
              {activeAgentId === null               ? <AgentHub onLaunch={setActiveAgentId} agents={AGENT_TEAMS} orgName={domain.orgName} orchestration={allScenarios(domain)} /> :
               activeAgentId.startsWith("orchestration") && allScenarios(domain).length > 0
                                                      ? <OrchestrationScenario key={activeAgentId} scenario={allScenarios(domain)[Number(activeAgentId.split(":")[1]) || 0] ?? allScenarios(domain)[0]} agents={AGENT_TEAMS} user={USER_INFO} onBack={() => setActiveAgentId(null)} /> :
               activeAgentId === "agent-chatbot"      ? <ChatbotAgent      domain={domain} onBack={() => setActiveAgentId(null)} /> :
               activeAgentId === "agent-report"       ? <ReportAgent       domain={domain} onBack={() => setActiveAgentId(null)} /> :
               activeAgentId === "agent-meeting"      ? <MeetingMinutesAgent domain={domain} onBack={() => setActiveAgentId(null)} /> :
               activeAgentId === "agent-internalreg"  ? <InternalRegAgent  domain={domain} onBack={() => setActiveAgentId(null)} /> :
               activeAgentId === "agent-ocr"          ? <OCRAgent          domain={domain} onBack={() => setActiveAgentId(null)} /> :
               activeAgentId === "agent-knowledge"    ? <KnowledgeAgent    domain={domain} onBack={() => setActiveAgentId(null)} /> :
               activeAgentId === "agent-dbquery"      ? <DBQueryAgent      domain={domain} onBack={() => setActiveAgentId(null)} onNavigate={setActiveAgentId} /> :
               activeAgentId === "agent-address"      ? <AddressAgent      domain={domain} onBack={() => setActiveAgentId(null)} /> :
               activeAgentId === "agent-dataanalysis" ? <DataAnalysisAgent domain={domain} onBack={() => setActiveAgentId(null)} /> :
               activeAgentId === "agent-summary"      ? <SummaryAgent      domain={domain} onBack={() => setActiveAgentId(null)} /> :
               activeAgentId === "agent-translate"    ? <TranslateAgent    domain={domain} onBack={() => setActiveAgentId(null)} /> :
               activeAgentId === "agent-review"       ? <DocReviewAgent    domain={domain} onBack={() => setActiveAgentId(null)} /> :
               activeAgentId === "agent-safety"       ? <SafetyPlanAgent   domain={domain} onBack={() => setActiveAgentId(null)} /> :
               <AgentHub onLaunch={setActiveAgentId} agents={AGENT_TEAMS} orgName={domain.orgName} orchestration={allScenarios(domain)} />}
            </Suspense>
          )}

          {/* ── DATA 탭: 시계열 인텔리전스 (lazy loading) ── */}
          {chatTab === "DATA" && (
            <Suspense fallback={<AgentLoadingFallback />}>
              <TimeSeriesPanel
                domain={domain}
                onNavigateAgent={(agentId) => { setChatTab("AGENT"); setActiveAgentId(agentId); }}
              />
            </Suspense>
          )}

          {/* Chat Messages */}
          {chatTab !== "AGENT" && chatTab !== "DATA" && (
            <ChatMessages
              th={th} isSecure={isSecure} isAgent={isAgent} mc={mc} mode={mode}
              messages={messages} isTyping={isTyping} messagesEndRef={messagesEndRef}
              USER_INFO={USER_INFO} selectedAgent={selectedAgent} activeWs={activeWs}
              DOCS={DOCS} HISTORY={displayHistory} onLoadHistory={loadHistoryItem}
              SUGGESTIONS={SUGGESTIONS} SECURE_SUGGESTIONS={SECURE_SUGG}
              translateLang={translateLang} setTranslateLang={setTranslateLang}
              summaryLen={summaryLen} setSummaryLen={setSummaryLen}
              activeLLM={activeLLM}
              handleSend={handleSend} handleCitationClick={handleCitationClick} handleDocDownload={handleDocDownload}
              setShowBuilderModal={setShowBuilderModal} setToast={setToast}
              onErrReport={(msg) => { setErrReportMsgId(msg.id); setErrReportText(''); setShowErrReport(true); }}
              onDocPreview={(doc) => { setDocModalData(doc); setShowDocModal(true); }}
              onFeedback={handleFeedback}
              briefingItems={NOTIFS}
              onNavigateAgent={(agentId) => { setChatTab("AGENT"); setActiveAgentId(agentId); }}
              liveCfg={liveCfg} liveState={liveState} liveSpeed={liveSpeed} setLiveSpeed={setLiveSpeed}
              handover={handoverCard} onOpenHandover={() => setShowHandover(true)} domainColor={domain.brandColor}
              workOrders={woSummary} onOpenWorkOrders={() => setShowWorkOrders(true)}
              L={L}
            />
          )}

          {/* Input Area — 통합 단일 박스 (AGENT 탭에서는 숨김) */}
          {chatTab !== "AGENT" && chatTab !== "DATA" && (
            <ChatInput
              th={th} isSecure={isSecure} isAgent={isAgent} mc={mc}
              input={input} setInput={setInput} handleSend={handleSend}
              fileInputRef={fileInputRef} setToast={setToast}
              ragMode={ragMode} setRagMode={setRagMode}
              llmDropdownRef={llmDropdownRef} llmButtonRef={llmButtonRef}
              showLLMDropdown={showLLMDropdown} setShowLLMDropdown={setShowLLMDropdown}
              setLlmDropdownPos={setLlmDropdownPos}
              activeLLM={activeLLM} setShowBuilderModal={setShowBuilderModal}
              onOpenScan={domain.scanRegistry?.length ? () => setShowScan(true) : undefined}
              scanLabel={domain.scanLabel || "코드 스캔"}
            />
          )}
        </main>

        {/* ====================== RIGHT PANEL ======================= */}
        <RightPanel
          th={th} isSecure={isSecure} isAgent={isAgent}
          rightOpen={rightOpen} setRightOpen={setRightOpen}
          panelView={panelView} setPanelView={setPanelView} activeCitation={activeCitation}
          domain={domain} setActiveAgentId={setActiveAgentId} activeLLM={activeLLM}
          DOCS={DOCS} SUGGESTIONS={SUGGESTIONS} SECURE_SUGGESTIONS={SECURE_SUGG} mode={mode} handleSend={handleSend}
          fileInputRef={fileInputRef} onSwitchToAdmin={onSwitchToAdmin}
        />
      </div>

      {/* ====================== MODALS ====================== */}
      {/* 환경설정 — 테마(다크 스킨은 사용자 포털 스코프)·UI 언어 */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSettings(false)} aria-hidden="true" />
          <div className={cn("relative w-full max-w-sm rounded-2xl border shadow-2xl p-5", isDark || isSecure ? "bg-[#111c33] border-slate-700" : "bg-white border-slate-200")}>
            <div className={cn("text-[15px] font-black mb-4", isDark || isSecure ? "text-slate-100" : "text-slate-900")}>{L.settings}</div>
            <div className="space-y-4">
              <div>
                <div className={cn("text-[11px] font-black uppercase tracking-wider mb-1.5", isDark || isSecure ? "text-slate-500" : "text-slate-400")}>{L.theme}</div>
                <div className="flex gap-2">
                  {[["light", L.themeLight], ["dark", L.themeDark]].map(([v, label]) => (
                    <button key={v} onClick={() => updatePrefs({ theme: v })} aria-pressed={uiPrefs.theme === v}
                      className={cn("flex-1 py-2 rounded-xl border text-[13px] font-bold transition-colors",
                        uiPrefs.theme === v ? "bg-indigo-600 text-white border-indigo-600" : isDark || isSecure ? "border-slate-600 text-slate-300" : "border-slate-200 text-slate-600 hover:border-indigo-300")}>
                      {label}
                    </button>
                  ))}
                </div>
                <p className={cn("text-[11px] mt-1.5 font-medium", isDark || isSecure ? "text-slate-500" : "text-slate-400")}>{L.themeNote}</p>
              </div>
              <div>
                <div className={cn("text-[11px] font-black uppercase tracking-wider mb-1.5", isDark || isSecure ? "text-slate-500" : "text-slate-400")}>{L.language}</div>
                <div className="flex gap-2">
                  {UI_LANGS.map(lg => (
                    <button key={lg.id} onClick={() => updatePrefs({ lang: lg.id })} aria-pressed={uiPrefs.lang === lg.id}
                      className={cn("flex-1 py-2 rounded-xl border text-[13px] font-bold transition-colors",
                        uiPrefs.lang === lg.id ? "bg-indigo-600 text-white border-indigo-600" : isDark || isSecure ? "border-slate-600 text-slate-300" : "border-slate-200 text-slate-600 hover:border-indigo-300")}>
                      {lg.label}
                    </button>
                  ))}
                </div>
                <p className={cn("text-[11px] mt-1.5 font-medium", isDark || isSecure ? "text-slate-500" : "text-slate-400")}>{L.langNote}</p>
              </div>
            </div>
            <button onClick={() => setShowSettings(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-slate-800 text-white text-[13px] font-black hover:bg-slate-700 transition-colors">
              닫기 · Close
            </button>
          </div>
        </div>
      )}
      {showBuilderModal && selectedAgent && (
        <AgentBuilderModal
          selectedAgent={selectedAgent}
          builderTab={builderTab} setBuilderTab={setBuilderTab}
          selectedNode={selectedNode} setSelectedNode={setSelectedNode}
          onClose={() => { setShowBuilderModal(false); setSelectedNode(null); }}
        />
      )}
      {showSatisfaction && (
        <SatisfactionModal
          satRating={satRating} setSatRating={setSatRating}
          satComment={satComment} setSatComment={setSatComment}
          onClose={() => setShowSatisfaction(false)} setToast={setToast}
        />
      )}
      {showHandover && domain.shiftHandover && (
        <ShiftHandoverModal
          domain={domain}
          incoming={readIncoming(domain)}
          draft={buildDraft(domain, { notifications: NOTIFS })}
          userName={USER_INFO?.name}
          onClose={() => setShowHandover(false)}
          onSaved={() => { setHandoverTick(t => t + 1); setToast({ message: "인수인계를 확정했습니다. 다음 조가 이어받습니다." }); }}
        />
      )}
      {showWorkOrders && (
        <WorkOrderModal domain={domain} userName={USER_INFO?.name}
          onClose={() => setShowWorkOrders(false)} onChanged={() => setWoTick(t => t + 1)} />
      )}
      {showScan && (
        <ScanModal
          registry={domain.scanRegistry || []}
          brandColor={domain.brandColor}
          label={domain.scanLabel || "코드 스캔"}
          onClose={() => setShowScan(false)}
          onPick={(hit) => {
            setShowScan(false);
            // 코드가 가리키는 곳으로 바로 들어간다 — 에이전트/시나리오면 이동, 아니면 질의 실행
            if (hit.agentId) { setChatTab("AGENT"); setActiveAgentId(hit.agentId); }
            else if (hit.query) { setChatTab("GENERAL"); handleSend(hit.query); }
            setToast({ message: `${hit.code} · ${hit.label}` });
          }}
        />
      )}
      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
      {showErrReport && (
        <ErrorReportModal
          errReportText={errReportText} setErrReportText={setErrReportText}
          onClose={() => setShowErrReport(false)} setToast={setToast}
        />
      )}
      {showQnaModal && <QnaModal onClose={() => setShowQnaModal(false)} />}
      {showDocModal && docModalData && (
        <DocPreviewModal
          docModalData={docModalData}
          onClose={() => setShowDocModal(false)}
          onDownload={handleDocDownload}
          org={{ name: domain.orgName, short: domain.orgShort, color: domain.brandColor, en: domain.orgEn }}
        />
      )}

      {/* ── LLM 드롭다운 Portal: overflow-hidden 상위 컨테이너를 우회하여 body에 직접 렌더링 ── */}
      {showLLMDropdown && llmDropdownPos && (
        <LLMDropdownPortal
          llmPortalRef={llmPortalRef} llmDropdownPos={llmDropdownPos} isSecure={isSecure}
          llmModels={LLM_MODELS} activeLLM={activeLLM} setActiveLLM={setActiveLLM}
          setShowLLMDropdown={setShowLLMDropdown} setToast={setToast}
        />
      )}

    </div>
  );
};

export default UserApp;
