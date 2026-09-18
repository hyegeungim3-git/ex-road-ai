import React, { useState, useEffect, useRef } from "react";
import {
  SidebarClose, SidebarOpen, ChevronLeft, Activity, FolderOpen, X,
  ZoomIn, ZoomOut, CheckCircle2, Sparkles, Bot, Mic, Database, Shield,
  Server, Cpu, Plus, UploadCloud, FileText, ArrowRight, ShieldCheck,
  Clock, ExternalLink,
} from "lucide-react";
import { cn, SECURITY_LEVELS, SecurityBadge } from "../../utils.jsx";
import {
  MCP_TOOLS, SECURE_SUGGESTIONS as BASE_SECURE_SUGGESTIONS, FILE_DATA, MY_RAG_INIT, MY_RAG_DOCS_INIT,
  AGENT_TEAMS,
} from "../../data/constants.js";

/* 추천 카드 버튼에 쓸 에이전트 짧은 이름 — 도메인 카탈로그가 정본.
   코어 이름을 하드코딩하면 발주처 화면에 남의 에이전트 이름이 뜬다(실제 사고 이력). */
const shortAgentName = (domain, id) =>
  domain?.agentCatalog?.[id]?.shortName || domain?.agentCatalog?.[id]?.name
  || AGENT_TEAMS?.find(t => t.id === id)?.shortName || '에이전트';

/* ================================================================== */
/* 우측 패널 — 문서 목록/원문 뷰어/연동 도구/내 RAG + 에이전트 활동 피드 */
/* 패널 전용 상태(탭·내 RAG)는 이 컴포넌트가 소유 (항상 마운트 유지)    */
/* ================================================================== */
const RightPanel = ({
  th, isSecure, isAgent,
  rightOpen, setRightOpen,
  panelView, setPanelView, activeCitation,
  domain, setActiveAgentId, activeLLM,
  DOCS, SUGGESTIONS, SECURE_SUGGESTIONS = BASE_SECURE_SUGGESTIONS, mode, handleSend,
  fileInputRef, onSwitchToAdmin,
}) => {
  const [panelTab, setPanelTab] = useState("DOCS");
  // 내 RAG 지식영역 state
  const [myRagAreas, setMyRagAreas] = useState(MY_RAG_INIT.map(a=>({...a})));
  const [selRagArea, setSelRagArea] = useState('mra-1');
  const [myRagDocs, setMyRagDocs] = useState(JSON.parse(JSON.stringify(MY_RAG_DOCS_INIT)));
  const [zoom, setZoom] = useState(100); // 문서 뷰어 확대율 (70~150%)
  const [newAreaName, setNewAreaName] = useState('');
  const [showNewArea, setShowNewArea] = useState(false);

  const readerRef = useRef(null);
  useEffect(() => {
    if (panelView === "READER" && activeCitation && readerRef.current) {
      setTimeout(() => { readerRef.current?.querySelector("mark")?.scrollIntoView({ behavior: "smooth", block: "center" }); }, 300);
    }
  }, [panelView, activeCitation]);

  /* ── 문서 원문 텍스트 렌더러 (인용 구절 하이라이트) ── */
  const renderDocText = () => {
    if (!activeCitation) return null;
    const fd = (domain?.fileData || FILE_DATA)[activeCitation.id];
    if (!fd) return <p className="text-slate-400 text-center py-10">미리보기를 지원하지 않는 파일입니다.</p>;
    const parts = [];
    let idx = 0;
    const { text, highlights = [] } = fd;
    const matches = highlights.map(h => ({ start: text.indexOf(h), end: text.indexOf(h) + h.length })).filter(m => m.start !== -1).sort((a, b) => a.start - b.start);
    matches.forEach((m, i) => {
      if (m.start > idx) parts.push(<span key={`t${i}`}>{text.slice(idx, m.start)}</span>);
      parts.push(
        <mark key={`m${i}`} className={cn("px-0.5 rounded font-semibold", isSecure ? "bg-blue-900/60 text-blue-300 border-b-2 border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]" : "bg-yellow-200 text-slate-900 shadow-sm")}>
          {text.slice(m.start, m.end)}
        </mark>
      );
      idx = m.end;
    });
    if (idx < text.length) parts.push(<span key="end">{text.slice(idx)}</span>);
    return (
      <div className="whitespace-pre-wrap leading-8">
        <h2 className={cn("text-lg font-black mb-2 pb-3 border-b-2", isSecure ? "text-slate-100 border-slate-700" : "text-slate-900 border-slate-200")}>{fd.title}</h2>
        <p className={cn("text-xs mb-8 flex items-center gap-1.5 font-medium", isSecure ? "text-slate-400" : "text-slate-400")}><Clock className="w-3.5 h-3.5" />{fd.date}</p>
        <div className={cn("font-serif text-[15px]", isSecure ? "text-slate-300" : "text-slate-700")}>{parts}</div>
      </div>
    );
  };

  return (
    <aside
      aria-label="문서·활동 패널"
      className={cn(
        "shrink-0 flex flex-col border-l transition-all duration-300 shadow-sm",
        th.panel,
        rightOpen ? "w-[380px]" : "w-7",
        // 모바일(<768): 오버레이 — 열림 시 화면 위, 폭은 화면의 92% 이하
        "max-md:fixed max-md:inset-y-0 max-md:right-0 md:relative",
        rightOpen ? "max-md:w-[min(380px,92vw)] max-md:z-40 max-md:shadow-2xl" : "z-20"
      )}>
      {/* Toggle handle — mirrors left sidebar pattern */}
      <button onClick={() => setRightOpen(!rightOpen)}
        title={rightOpen ? "패널 닫기" : "RAG 패널 열기"}
        aria-label={rightOpen ? "우측 패널 닫기" : "우측 패널 열기"}
        className={cn("absolute -left-3.5 top-[72px] w-7 h-7 rounded-full flex items-center justify-center shadow-md z-40 transition-colors border",
          isSecure ? "bg-[#0a0f1c] border-slate-700 text-slate-400 hover:text-blue-400" : "bg-white border-slate-200 text-slate-400 hover:text-slate-700")}>
        {rightOpen ? <SidebarClose className="w-4 h-4" /> : <SidebarOpen className="w-4 h-4" />}
      </button>

      {/* Inner wrapper — hides content when panel is collapsed */}
      <div className={cn("flex flex-col flex-1 min-h-0 transition-opacity duration-200", rightOpen ? "opacity-100" : "opacity-0 overflow-hidden pointer-events-none invisible")}>

      {/* Panel Header */}
      <div className={cn("border-b flex items-start justify-between px-5 pt-[17px] pb-3 shrink-0", isSecure ? "border-slate-800/60" : "border-slate-100")}>
        {panelView === "READER" && activeCitation ? (
          <div className="flex items-center gap-3 w-full pr-3 animate-in fade-in">
            <button onClick={() => setPanelView("DOCS")} aria-label="문서 목록으로 돌아가기" className={cn("p-2 rounded-xl transition-colors shrink-0", isSecure ? "hover:bg-[#1e293b] text-blue-400" : "hover:bg-slate-100 text-slate-500")}>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 overflow-hidden">
                <h3 className={cn("text-[13px] font-black truncate min-w-0 flex-1", th.text)}>{activeCitation.name}</h3>
                {activeCitation.secLevel && <SecurityBadge level={activeCitation.secLevel} size="xs" />}
              </div>
              <p className={cn("text-[13px] font-medium", th.subtext)}>원문 뷰어 · 관련 구절 강조</p>
            </div>
          </div>
        ) : isAgent ? (
          <div className="flex items-center gap-2.5 animate-in fade-in">
            <Activity className="w-5 h-5 text-indigo-600" />
            <h3 className={cn("text-[15px] font-black", th.text)}>내 에이전트 활동</h3>
            <span className="text-[13px] px-2 py-0.5 rounded-full font-black border bg-indigo-50 text-indigo-700 border-indigo-200">이번 주 8회</span>
          </div>
        ) : (
          <div className="flex flex-col w-full animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <FolderOpen className={cn("w-5 h-5", isSecure ? "text-blue-400/70" : "text-slate-500")} />
              <h3 className={cn("text-[15px] font-black", th.text)}>
                {isSecure ? "참조 문서" : "RAG 연동 문서"}
              </h3>
              {!isSecure && <span className="text-[13px] px-2 py-0.5 rounded-full font-black border bg-green-100 text-green-700 border-green-200">VectorDB 연결됨</span>}
            </div>
            <div className={cn("flex gap-1 mt-3 p-1 rounded-xl", isSecure ? "bg-[#040814]" : "bg-slate-200/70")}>
              {(isSecure ? ["DOCS", "TOOLS"] : ["DOCS", "TOOLS", "MYRAG"]).map(tab => (
                <button key={tab} onClick={() => setPanelTab(tab)} className={cn("flex-1 py-1.5 text-[13px] font-black rounded-lg transition-all", panelTab === tab ? (isSecure ? "bg-slate-800 text-blue-400 shadow-sm" : "bg-blue-600 text-white shadow-sm") : (isSecure ? "text-slate-500 hover:text-slate-300" : "text-slate-500 hover:text-slate-700"))}>
                  {tab === "DOCS" ? "문서 목록" : tab === "TOOLS" ? "연동 도구" : "내 RAG"}
                </button>
              ))}
            </div>
          </div>
        )}
        <button onClick={() => setRightOpen(false)} className={cn("p-2 rounded-xl shrink-0 transition-colors ml-2 -mt-0.5", isSecure ? "hover:bg-[#1e293b] text-slate-400" : "hover:bg-slate-100 text-slate-400")}>
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Panel Content */}
      <div className={cn("flex-1 overflow-y-auto custom-scrollbar", th.panelInner)}>
        {/* 보안 채팅 지식 영역 안내 */}
        {isSecure && panelView !== "READER" && (
          <div className="mx-4 mt-4 px-3 py-2.5 bg-[#0a1428] border border-blue-900/40 rounded-xl flex items-start gap-2.5 text-[13px] text-blue-400/70 font-medium leading-relaxed">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600/60 shrink-0 mt-0.5"/>
            <span>문서·지식 영역은 내부망에 저장된 자료입니다. <span className="text-slate-500">무저장</span>은 <span className="text-slate-400">대화 내용</span>에만 적용됩니다.</span>
          </div>
        )}
        {panelView === "READER" && !isAgent ? (
          /* ── 문서 뷰어 ── */
          <div className="flex flex-col h-full">
            <div className={cn("h-11 border-b flex items-center justify-end px-4 gap-2 shrink-0", isSecure ? "bg-[#0a0f1c] border-slate-800" : "bg-white border-slate-100 shadow-sm")}>
              <div className={cn("flex items-center rounded-lg border p-0.5 shadow-sm", isSecure ? "bg-[#040814] border-slate-700" : "bg-white border-slate-200")}>
                <button aria-label="축소" onClick={() => setZoom(z => Math.max(70, z - 10))} disabled={zoom <= 70}
                  className={cn("p-1.5 rounded-md transition-colors disabled:opacity-30", isSecure ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500")}><ZoomOut className="w-3.5 h-3.5" /></button>
                <button onClick={() => setZoom(100)} title="100%로 되돌리기"
                  className={cn("text-[13px] font-bold px-2 w-12 text-center rounded transition-colors", isSecure ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-100")}>{zoom}%</button>
                <button aria-label="확대" onClick={() => setZoom(z => Math.min(150, z + 10))} disabled={zoom >= 150}
                  className={cn("p-1.5 rounded-md transition-colors disabled:opacity-30", isSecure ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500")}><ZoomIn className="w-3.5 h-3.5" /></button>
              </div>
              <span className={cn("text-[13px] px-2 py-0.5 rounded font-bold border", isSecure ? "bg-slate-800 text-blue-400 border-slate-700" : "bg-yellow-50 text-yellow-700 border-yellow-200")}>관련 구절 강조됨</span>
            </div>
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar" ref={readerRef}>
              {/* 본문 글자 크기가 고정 px 클래스라 font-size 상속으로는 확대되지 않는다 — zoom으로 레이아웃까지 배율 적용 */}
              <div style={{ zoom: zoom / 100 }}
                className={cn("rounded-xl shadow-md border p-6 sm:p-8 min-h-full", isSecure ? "bg-[#0a0f1c] border-slate-800" : "bg-white border-slate-200")}>
                {renderDocText()}
              </div>
            </div>
          </div>
        ) : isAgent ? (
          /* ── 내 에이전트 활동 ── */
          <div className="p-4 space-y-4 animate-in fade-in">

            {/* 빠른 실행 */}
            <div>
              <div className={cn("text-[11px] font-black uppercase tracking-wider mb-2", th.subtext)}>빠른 실행</div>
              <div className="flex flex-wrap gap-1.5">
                {/* 라벨은 도메인 카탈로그를 따른다 — 코어 이름을 박아두면
                    발주처 화면에 남의 에이전트 이름이 뜬다(실제 사고 이력) */}
                {['agent-chatbot', 'agent-meeting', 'agent-knowledge', 'agent-summary']
                  .map(id => ({ id, label: shortAgentName(domain, id) })).map(a => (
                  <button key={a.id} onClick={() => setActiveAgentId(a.id)}
                    className={cn("px-3 py-1.5 rounded-full text-[13px] font-bold border-2 transition-all",
                      isSecure ? "bg-[#0a0f1c] border-slate-700 text-slate-300 hover:border-indigo-600 hover:text-indigo-300"
                               : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-700 shadow-sm")}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={cn("h-px", th.divider)} />

            {/* 최근 작업 이력 */}
            <div>
              <div className={cn("text-[11px] font-black uppercase tracking-wider mb-2 flex items-center justify-between", th.subtext)}>
                <span>최근 작업</span>
                <span className="font-medium normal-case">이번 주 8회 실행</span>
              </div>
              <div className="space-y-2">
                {(domain.agentFeed?.recent || [
                  { agentId: 'agent-meeting',      agentName: '회의록 작성',  time: '오늘 14:32', result: '교통데이터 분석반 회의록 생성' },
                  { agentId: 'agent-knowledge',    agentName: '지식 검색',    time: '오늘 10:15', result: '교통량 상시조사 기준 5건 검색' },
                  { agentId: 'agent-dataanalysis', agentName: '데이터 분석',  time: '어제 16:44', result: '경부선 속도 급락 구간 분석 완료' },
                ]).map((task, i) => (
                  <div key={i} className={cn("p-3 rounded-xl border cursor-pointer transition-all group",
                    isSecure ? "bg-[#0a0f1c]/80 border-slate-800 hover:border-slate-600"
                             : "bg-white border-slate-100 shadow-sm hover:border-indigo-200")}>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className={cn("text-[13px] font-black truncate", th.text)}>{task.agentName}</span>
                          <span className={cn("text-[13px] font-medium shrink-0", th.subtext)}>{task.time}</span>
                        </div>
                        <div className={cn("text-[13px] font-medium truncate mt-0.5", th.subtext)}>{task.result}</div>
                      </div>
                    </div>
                    <button onClick={() => setActiveAgentId(task.agentId)}
                      className={cn("mt-2 w-full text-[13px] font-bold py-1 rounded-lg transition-all opacity-0 group-hover:opacity-100",
                        isSecure ? "bg-slate-800 text-indigo-400" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100")}>
                      이어하기 →
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className={cn("h-px", th.divider)} />

            {/* AI 추천 다음 작업 */}
            <div>
              <div className={cn("text-[11px] font-black uppercase tracking-wider mb-2 flex items-center gap-1.5", th.subtext)}>
                <Sparkles className="w-3 h-3" /><span>AI 추천</span>
              </div>
              <div className={cn("p-3 rounded-xl border-2 mb-2",
                isSecure ? "bg-indigo-900/20 border-indigo-800/40" : "bg-indigo-50/60 border-indigo-100")}>
                <div className={cn("text-[13px] font-black mb-1", isSecure ? "text-indigo-300" : "text-indigo-800")}>
                  {domain.agentFeed?.recommendTitle || "경부선 VDS 결측률 임계 초과 3일째"}
                </div>
                <p className={cn("text-[13px] leading-relaxed mb-2.5", isSecure ? "text-indigo-400" : "text-indigo-700")}>
                  {domain.agentFeed?.recommendBody || "결측 지점 점검 이력과 유지관리 매뉴얼을 대조 검토하여 조치 절차를 확인하시겠습니까?"}
                </p>
                <button onClick={() => setActiveAgentId('agent-knowledge')}
                  className={cn("w-full flex items-center justify-center gap-1.5 h-7 rounded-lg text-[13px] font-bold transition-all",
                    isSecure ? "bg-indigo-800 text-indigo-200 hover:bg-indigo-700" : "bg-indigo-600 text-white hover:bg-indigo-700")}>
                  <Bot className="w-3 h-3 shrink-0" />
                  <span className="truncate">{shortAgentName(domain,'agent-knowledge')} 시작 →</span>
                </button>
              </div>
              <div className={cn("p-3 rounded-xl border",
                isSecure ? "bg-[#0a0f1c]/80 border-slate-800" : "bg-white border-slate-100 shadow-sm")}>
                <div className={cn("text-[13px] font-black mb-1", th.text)}>미처리 회의 녹음 파일</div>
                <p className={cn("text-[13px] leading-relaxed mb-2", th.subtext)}>
                  {domain.agentFeed?.pendingBody || "2026-09-18 교통데이터 분석반 정례회의 녹음이 미처리 상태입니다."}
                </p>
                <button onClick={() => setActiveAgentId('agent-meeting')}
                  className={cn("text-[13px] font-bold flex items-center gap-1 transition-colors",
                    isSecure ? "text-violet-400 hover:text-violet-300" : "text-violet-600 hover:text-violet-800")}>
                  <Mic className="w-3 h-3 shrink-0" />
                  <span className="truncate">{shortAgentName(domain,'agent-meeting')} 시작 →</span>
                </button>
              </div>
            </div>

            <div className={cn("h-px", th.divider)} />

            {/* 이번 주 성과 */}
            <div className={cn("p-3 rounded-xl border grid grid-cols-3 gap-2 text-center",
              isSecure ? "bg-[#0a0f1c] border-slate-800" : "bg-slate-50 border-slate-200")}>
              <div>
                <div className={cn("text-[18px] font-black leading-tight", isSecure ? "text-blue-400" : "text-indigo-700")}>8회</div>
                <div className={cn("text-[13px] font-bold mt-0.5", th.subtext)}>이번 주 실행</div>
              </div>
              <div>
                <div className={cn("text-[18px] font-black leading-tight", isSecure ? "text-emerald-400" : "text-emerald-700")}>2.4h</div>
                <div className={cn("text-[13px] font-bold mt-0.5", th.subtext)}>절감 시간</div>
              </div>
              <div>
                <div className={cn("text-[18px] font-black leading-tight", isSecure ? "text-amber-400" : "text-amber-700")}>5건</div>
                <div className={cn("text-[13px] font-bold mt-0.5", th.subtext)}>생성 산출물</div>
              </div>
            </div>

          </div>
        ) : panelTab === "TOOLS" ? (
          /* ── 연동 도구 탭 ── */
          <div className="p-6 space-y-5 animate-in fade-in">
            <div>
              <h4 className={cn("text-[13px] font-black uppercase tracking-wider mb-1", th.subtext)}>사내 시스템 연동 (MCP)</h4>
              <p className={cn("text-[13px] font-medium mb-4", th.subtext)}>관리자가 인가한 사내 도구 목록입니다.</p>
            </div>
            <div className="space-y-3">
              {MCP_TOOLS.map(tool => (
                <div key={tool.id} className={cn("p-4 rounded-2xl border-2 transition-all", isSecure ? "bg-[#0a0f1c]/80 border-slate-800" : "bg-white border-slate-100 shadow-sm")}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center border shrink-0", isSecure ? "bg-[#040814] text-blue-400 border-slate-700" : "bg-blue-50 text-blue-600 border-blue-100")}>
                      {tool.type === "벡터 DB" ? <Database className="w-4 h-4" /> : tool.type === "보안 모듈" ? <Shield className="w-4 h-4" /> : <Server className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn("text-[13px] font-bold truncate", th.text)}>{tool.name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={cn("text-[13px] px-1.5 py-0.5 rounded font-black border", isSecure ? "bg-slate-800 text-blue-400 border-slate-700" : "bg-slate-100 text-slate-600 border-slate-200")}>{tool.type}</span>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                          <span className={cn("text-[13px] font-bold text-green-600")}>{tool.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className={cn("text-[13px] font-medium leading-relaxed", th.subtext)}>{tool.desc}</p>
                </div>
              ))}
            </div>

            {/* ── 현재 사용 모델 카드 (NEW) ── */}
            <div className={cn("h-px", th.divider)}></div>
            <div>
              <h4 className={cn("text-[13px] font-black uppercase tracking-wider mb-3", th.subtext)}>현재 사용 AI 모델</h4>
              <div className={cn("p-4 rounded-2xl border-2", isSecure ? "bg-[#0a0f1c] border-slate-800" : "bg-white border-slate-100 shadow-sm")}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border shrink-0", isSecure ? "bg-[#040814] text-blue-400 border-blue-900/50" : "bg-blue-50 text-blue-600 border-blue-100")}>
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <div className={cn("text-[14px] font-black", th.text)}>{activeLLM.name}</div>
                    <div className={cn("text-[13px] font-medium", th.subtext)}>{activeLLM.type} · Context {activeLLM.context}</div>
                  </div>
                </div>
                <p className={cn("text-[13px] font-medium", th.subtext)}>{activeLLM.desc}</p>
                <div className={cn("flex items-center gap-2 mt-3 p-2 rounded-lg", isSecure ? "bg-[#040814]" : "bg-slate-50")}>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className={cn("text-[13px] font-bold", isSecure ? "text-green-400" : "text-green-700")}>온프레미스 · 내부망 전용 · 외부 전송 없음</span>
                </div>
              </div>
            </div>
          </div>
        ) : panelTab === "MYRAG" ? (
          /* ── 내 RAG 지식영역 탭 ── */
          <div className="p-6 space-y-5 animate-in fade-in">
            {/* 영역 헤더 */}
            <div className="flex items-center justify-between">
              <h4 className={cn("text-[13px] font-black uppercase tracking-wider", th.subtext)}>내 지식 영역</h4>
              <button onClick={() => setShowNewArea(v => !v)} className={cn("flex items-center gap-1 text-[13px] px-2.5 py-1 rounded-lg border font-bold transition-colors", isSecure ? "border-slate-700 text-blue-400 hover:bg-slate-800" : "border-slate-200 text-blue-600 hover:bg-blue-50")}>
                <Plus className="w-3 h-3"/> 영역 추가
              </button>
            </div>
            {/* 신규 영역 입력 */}
            {showNewArea && (
              <div className={cn("flex gap-2 p-3 rounded-xl border-2", isSecure ? "border-slate-700 bg-[#0a0f1c]" : "border-blue-100 bg-blue-50")}>
                <input value={newAreaName} onChange={e => setNewAreaName(e.target.value)} placeholder="영역 이름 입력" className={cn("flex-1 px-3 py-1.5 rounded-lg text-[13px] border outline-none", isSecure ? "bg-[#040814] border-slate-700 text-slate-200 placeholder:text-slate-600" : "bg-white border-slate-200 text-slate-800")}/>
                <button onClick={() => { if(newAreaName.trim()){setMyRagAreas(p=>[...p,{id:'mra-'+Date.now(),name:newAreaName.trim(),docs:0,active:true}]);setNewAreaName('');setShowNewArea(false);} }} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[13px] font-bold hover:bg-blue-700">생성</button>
              </div>
            )}
            {/* 영역 칩 목록 */}
            <div className="flex flex-wrap gap-2">
              {myRagAreas.map(a => (
                <button key={a.id} onClick={() => setSelRagArea(a.id)} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 text-[13px] font-bold transition-all", selRagArea === a.id ? (isSecure ? "border-blue-500 bg-blue-900/30 text-blue-300" : "border-blue-500 bg-blue-50 text-blue-700") : (isSecure ? "border-slate-800 text-slate-400 hover:border-slate-700" : "border-slate-200 text-slate-600 hover:border-slate-300"))}>
                  <FolderOpen className="w-3.5 h-3.5"/>
                  {a.name}
                  <span className={cn("text-[13px]", isSecure ? "text-slate-500" : "text-slate-400")}>{(myRagDocs[a.id]||[]).length}개</span>
                </button>
              ))}
            </div>
            <div className={cn("h-px", th.divider)}/>
            {/* 선택 영역 문서 목록 헤더 */}
            <div className="flex items-center justify-between">
              <h4 className={cn("text-[13px] font-black uppercase tracking-wider truncate max-w-[180px]", th.subtext)}>
                {myRagAreas.find(a => a.id === selRagArea)?.name || '영역 선택'} 문서
              </h4>
              <button onClick={() => fileInputRef.current?.click()} className={cn("flex items-center gap-1 text-[13px] px-2.5 py-1 rounded-lg border font-bold transition-colors shrink-0", isSecure ? "border-slate-700 text-blue-400 hover:bg-slate-800" : "border-slate-200 text-blue-600 hover:bg-blue-50")}>
                <UploadCloud className="w-3 h-3"/> 업로드
              </button>
            </div>
            {/* 문서 목록 (체크박스로 범위 설정) */}
            <div className="space-y-2">
              {(myRagDocs[selRagArea] || []).map(d => (
                <div key={d.id} className={cn("flex items-center gap-2 p-3 rounded-xl border-2 transition-all", isSecure ? "border-slate-800 bg-[#0a0f1c]" : "border-slate-100 bg-white shadow-sm")}>
                  <input type="checkbox" checked={d.inScope} onChange={() => setMyRagDocs(p => ({...p, [selRagArea]: p[selRagArea].map(x => x.id === d.id ? {...x, inScope: !x.inScope} : x)}))} className="w-4 h-4 rounded accent-blue-600 shrink-0"/>
                  <FileText className={cn("w-4 h-4 shrink-0", isSecure ? "text-blue-400" : "text-blue-500")}/>
                  <div className="flex-1 min-w-0">
                    <div className={cn("text-[13px] font-bold truncate", th.text)}>{d.name}</div>
                    <div className={cn("flex items-center gap-1.5 text-[13px] font-medium mt-0.5 flex-wrap", th.subtext)}>
                      <span>{d.size}</span>
                      {d.pii && <span className={cn("px-1.5 py-0.5 rounded font-bold", isSecure ? "bg-orange-900/30 text-orange-400" : "bg-orange-100 text-orange-600")}>PII</span>}
                      {d.secLevel && <SecurityBadge level={d.secLevel} size="xs" />}
                    </div>
                  </div>
                  <button onClick={() => setMyRagDocs(p => ({...p, [selRagArea]: p[selRagArea].filter(x => x.id !== d.id)}))} className={cn("p-1 rounded-lg transition-colors shrink-0", isSecure ? "hover:bg-slate-800 text-slate-600 hover:text-slate-400" : "hover:bg-red-50 text-slate-300 hover:text-red-500")}>
                    <X className="w-3.5 h-3.5"/>
                  </button>
                </div>
              ))}
              {(myRagDocs[selRagArea] || []).length === 0 && (
                <div className={cn("text-center py-8 text-[13px] font-medium", th.subtext)}>
                  문서를 업로드하여 개인 RAG 영역을 구성하세요
                </div>
              )}
            </div>
            {/* 안내 박스 */}
            <div className={cn("p-3 rounded-xl border text-[13px] font-medium leading-relaxed", isSecure ? "border-slate-800 bg-[#0a0f1c] text-slate-400" : "border-blue-100 bg-blue-50 text-blue-600")}>
              <div className="flex items-center gap-1.5 font-bold mb-1"><Shield className="w-3 h-3"/>개인 영역 격리 보장</div>
              체크된 문서만 질의 범위에 포함됩니다. 타 사용자와 격리된 개인 전용 벡터 공간에 저장됩니다.
            </div>
          </div>
        ) : (
          /* ── 문서 목록 탭 ── */
          <div className="p-6 space-y-6 animate-in fade-in">
            {/* ── 보안 등급 범례 ── */}
            <div className={cn("rounded-xl border overflow-hidden mb-1", isSecure ? "border-slate-800" : "border-slate-200")}>
              <div className={cn("px-3 py-2 text-[12px] font-black uppercase tracking-wider border-b", isSecure ? "bg-[#040814] border-slate-800 text-slate-500" : "bg-slate-100 border-slate-200 text-slate-500")}>데이터 보안 등급 기준</div>
              <div className={cn("divide-y", isSecure ? "divide-slate-800 bg-[#0a0f1c]" : "divide-slate-100 bg-white")}>
                {(["C","S","O"]).map(lvl => {
                  const sl = SECURITY_LEVELS[lvl];
                  return (
                    <div key={lvl} className="flex items-center gap-2.5 px-3 py-2">
                      <SecurityBadge level={lvl} size="xs" />
                      <span className={cn("text-[13px] font-medium truncate", th.subtext)}>{sl.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              {DOCS.map(doc => {
                return (
                <div key={doc.id} className={cn("p-4 rounded-2xl border-2 cursor-default group transition-all",
                  isSecure ? "bg-[#0a0f1c]/50 border-slate-800 hover:border-blue-700"
                  : doc.secLevel === "C" ? "bg-white border-red-100 hover:border-red-300 hover:shadow-md"
                  : doc.secLevel === "S" ? "bg-white border-orange-100 hover:border-orange-300 hover:shadow-md"
                  : "bg-white border-slate-100 hover:border-green-200 hover:shadow-md")}>
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                      isSecure ? "bg-[#040814] text-blue-400 border-slate-700"
                      : doc.secLevel === "C" ? "bg-red-50 text-red-600 border-red-100"
                      : doc.secLevel === "S" ? "bg-orange-50 text-orange-600 border-orange-100"
                      : "bg-green-50 text-green-600 border-green-100")}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn("text-[13px] font-bold truncate mb-0.5", th.text)}>{doc.name}</div>
                      <div className={cn("flex items-center gap-2 text-[13px] font-medium", th.subtext)}>
                        <span>{doc.size}</span><span className="opacity-50">|</span><span>{doc.date}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <SecurityBadge level={doc.secLevel} size="xs" />
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span className="text-[13px] text-green-600 font-bold">적재됨</span>
                      </div>
                    </div>
                  </div>
                  {/* 팩이 주는 데이터라 경계에서만 방어 — tags 미기재 팩도 화면이 죽지 않게 */}
                  {doc.tags?.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 ml-[52px]">
                      {doc.tags.map(tag => (
                        <span key={tag} className={cn("text-[13px] px-1.5 py-0.5 rounded font-bold border", isSecure ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-slate-100 text-slate-600 border-slate-200")}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                );
              })}
              <button onClick={() => fileInputRef.current?.click()} className={cn("w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl border-2 border-dashed font-bold text-[13px] transition-all", isSecure ? "border-slate-700 text-slate-500 hover:border-blue-600 hover:text-blue-400" : "border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-600")}>
                <UploadCloud className="w-4 h-4" /> 문서 추가 업로드
              </button>
            </div>

            <div className={cn("h-px", th.divider)}></div>

            {/* 빠른 질문 */}
            <div>
              <h4 className={cn("text-[13px] font-black uppercase tracking-wider mb-4", th.subtext)}>
                {isSecure ? "보안 스캔 지시" : "빠른 질문"}
              </h4>
              <div className="space-y-2">
                {(isSecure ? SECURE_SUGGESTIONS : SUGGESTIONS[mode])?.map((s, i) => (
                  <button key={i} onClick={() => handleSend(s.query)} className={cn("w-full text-left p-3.5 rounded-xl border-2 text-[13px] font-bold transition-all flex items-center justify-between group shadow-sm", isSecure ? "bg-[#0a0f1c] border-slate-800 text-slate-300 hover:border-blue-600 hover:text-blue-300" : "bg-white border-slate-100 text-slate-700 hover:border-slate-300 hover:text-blue-700")}>
                    <span>{s.title}</span>
                    <ArrowRight className={cn("w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all", isSecure ? "text-blue-400" : "text-blue-500")} />
                  </button>
                ))}
              </div>
            </div>

            <div className={cn("h-px", th.divider)}></div>

            {/* 보안 정보 */}
            <div className={cn("p-4 rounded-2xl border", isSecure ? "bg-blue-900/20 border-blue-800/50" : "bg-blue-50 border-blue-100")}>
              <div className="flex items-start gap-3">
                <ShieldCheck className={cn("w-5 h-5 mt-0.5 shrink-0", isSecure ? "text-blue-400" : "text-blue-600")} />
                <div>
                  <div className={cn("text-[13px] font-black mb-1", isSecure ? "text-blue-300" : "text-blue-800")}>망분리 보안 환경 적용</div>
                  <div className={cn("text-[13px] font-medium leading-relaxed", isSecure ? "text-blue-400" : "text-blue-700")}>
                    입력하신 정보는 외부로 절대 전송되지 않으며, 사내 로컬 서버에서만 처리됩니다.
                  </div>
                </div>
              </div>
            </div>

            {/* 관리자 전환 */}
            {onSwitchToAdmin && (
              <div className={cn("p-4 rounded-2xl border", isSecure ? "bg-[#0a0f1c] border-slate-800" : "bg-slate-50 border-slate-200")}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className={cn("w-4 h-4", isSecure ? "text-blue-400" : "text-indigo-600")} />
                    <span className={cn("text-[13px] font-black", th.text)}>RoadQ 관리자 시스템</span>
                  </div>
                  <button onClick={onSwitchToAdmin} className={cn("flex items-center gap-1.5 text-[13px] font-bold transition-colors", isSecure ? "text-blue-400 hover:text-blue-300" : "text-indigo-600 hover:text-indigo-800")}>
                    전환 <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className={cn("text-[13px] mt-1 font-medium", th.subtext)}>에이전트 편집, LLM 관리, 보안 대시보드</p>
              </div>
            )}
          </div>
        )}
      </div>
      </div>{/* /inner wrapper */}
    </aside>
  );
};

export default RightPanel;
