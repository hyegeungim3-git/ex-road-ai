import React, { useState } from 'react';
import { LayoutDashboard, Database, Settings, Cpu, ChevronDown, Bot, Box, Layers, Code, BarChart2, Shield, Briefcase, Users, Grid, List, PieChart, Wrench, Bell, Columns, Monitor, FolderOpen, UserCog, Unplug, Megaphone, Scale, Network, LayoutGrid } from 'lucide-react';
import { ToastProvider, SidebarItem } from './admin/common.jsx';
import { applyAdminDomain, ADMIN_PERSONA, ADMIN_APPROVAL_ROWS, MOCK_ABUSE_ALERTS } from './admin/mocks.js';
import { UsageHistoryPage, SatisfactionMgmtPage, UsageStatsPage, InfoServiceStatsPage } from './admin/pages/analytics.jsx';
import { ChatAppPage, ReportGenPage, DataAnalysisPage } from './admin/pages/applications.jsx';
import { AnnouncementPage, ContentMgmtPage, ApiPromptPage } from './admin/pages/content.jsx';
import { SystemDashboard, ServiceDashboard, GpuDashboard, DashboardTrainer } from './admin/pages/dashboard.jsx';
import { MCPToolsPage, MCPServerPage, PromptLibraryPage, ServingPage, TaskflowBuilderPage, TaskflowDeployPage, WorkflowPage } from './admin/pages/deployment.jsx';
import { DatasetPage, VectorDbPage, AutoLoadPage, CodespacePage, SharedVolumePage, ModelRegistry } from './admin/pages/infra.jsx';
import { KnowledgeManagementPage, RagPipelinePage } from './admin/pages/knowledge.jsx';
import { LlmManagePage, GuardrailFilterPage, GuardrailLogPage, TrustManagePage, QualityManagementPage } from './admin/pages/llmops.jsx';
import { AiActCompliancePage } from './admin/pages/compliance.jsx';
import { PackStudioPage } from './admin/pages/packstudio.jsx';
import { ScenarioBuilderPage } from './admin/pages/scenariobuilder.jsx';
import { SecurityArchPage } from './admin/pages/security.jsx';
import { PredictionOpsPage } from './admin/pages/predops.jsx';
import { DataCatalogPage } from './admin/pages/catalog.jsx';
import { AugmentStrategyPage } from './admin/pages/augment.jsx';
import { SafetyActPage } from './admin/pages/safetyact.jsx';
import { ReproPage } from './admin/pages/repro.jsx';
import { SystemMonitorPage, AdminPage, UserPage, ConnectedMonitorPage } from './admin/pages/system.jsx';
import { LlmTraining, VlmTraining, EmbeddingPage, RerankingPage, LeaderboardPage, EvalMetricsPage } from './admin/pages/training.jsx';
import { ApprovalPage, QuotaPage, UserManagementPage, AccessLogPage, AccessSecurityPage, WorkLogPage, UsageMonitorPage, HrSyncPage } from './admin/pages/users.jsx';

// 관리자 콘솔 타이포그래피 — 자체 호스팅 Pretendard(index.html에서 로드).
// 한글은 자간을 살짝 좁혀야 UI 밀도가 맞고, 대시보드 수치는 tnum(고정폭 숫자)이라야 표가 흔들리지 않는다.
const ADMIN_TYPE = {
  fontFamily: "'Pretendard Variable', 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
  letterSpacing: '-0.011em',
  fontFeatureSettings: '"tnum" 1',
  wordBreak: 'keep-all',
};

const App = ({ onSwitchToUser, onExitPortal, domain, initialMenuId, onRouteChange }) => {
  // 도메인 리졸버: 하위 페이지들이 import하는 mocks.js 상수를 팩 adminContent로 교체 (렌더 최상단에서 호출 — 페이지 렌더보다 먼저)
  applyAdminDomain(domain);
  const orgName = domain?.orgName || '한국도로공사';
  const admin = ADMIN_PERSONA;
  const [activeId,setActiveId]=useState(initialMenuId||'dashboard.system');
  // 현재 메뉴를 주소에 반영 (새로고침 시 같은 페이지로 복귀)
  React.useEffect(()=>{ onRouteChange&&onRouteChange(activeId); },[activeId]);
  const [sidebarOpen,setSidebarOpen]=useState(true);   // 상단바 Columns 버튼으로 접기/펼치기
  const [notifOpen,setNotifOpen]=useState(false);      // 상단바 알림 드롭다운
  const [notifRead,setNotifRead]=useState(false);
  // 운영 알림 — 기존 목업(승인 대기·오남용 탐지)에서 파생
  const pendingApprovals=ADMIN_APPROVAL_ROWS.filter(r=>r.status==='대기 중');
  const notifItems=[
    ...(pendingApprovals.length?[{id:'n-approval',title:`승인 대기 ${pendingApprovals.length}건`,body:pendingApprovals[0].type+' 외',to:'ops.approval'}]:[]),
    ...(MOCK_ABUSE_ALERTS.length?[{id:'n-abuse',title:`오남용 탐지 ${MOCK_ABUSE_ALERTS.length}건`,body:MOCK_ABUSE_ALERTS[0].user+' '+MOCK_ABUSE_ALERTS[0].type,to:'admin.accesssec'}]:[]),
    {id:'n-quality',title:'답변 품질 검토 대기',body:'사용자 피드백이 반영된 검토 목록을 확인하세요.',to:'admin.quality'},
  ];

  const menu = [
    /* ════════════════════════════════════
       대메뉴 1 — 대시보드
    ════════════════════════════════════ */
    {id:'dashboard', label:'대시보드', icon:LayoutDashboard, children:[
      {id:'dashboard.system',  label:'시스템 현황'},
      {id:'dashboard.service', label:'서비스 현황'},
      {id:'dashboard.gpu',     label:'GPU 현황'},
      {id:'dashboard.trainer', label:'트레이너 현황'},
    ]},

    /* ════════════════════════════════════
       대메뉴 2 — 인프라 · 개발
    ════════════════════════════════════ */
    {id:'_s1', label:'인프라 · 개발', section:true},
    {id:'data', label:'데이터 관리', icon:Database, children:[
      {id:'data.dataset',  label:'데이터셋'},
      {id:'data.vectordb', label:'벡터 DB'},
      {id:'data.autoload', label:'자동 적재'},
      {id:'data.catalog',  label:'카탈로그 · 리니지'},
    ]},
    {id:'dev', label:'개발 환경', icon:Code, children:[
      {id:'dev.codespace', label:'코드스페이스'},
      {id:'dev.volume',    label:'공유 볼륨'},
    ]},
    {id:'model.registry', label:'모델 레지스트리', icon:Box},
    {id:'trainer', label:'학습 · 튜닝', icon:Layers, children:[
      {id:'trainer.llm',       label:'LLM 파인튜닝'},
      {id:'trainer.vlm',       label:'VLM 학습'},
      {id:'trainer.embedding', label:'임베딩 학습'},
      {id:'trainer.reranking', label:'리랭킹 학습'},
    ]},
    {id:'eval', label:'모델 평가', icon:BarChart2, children:[
      {id:'eval.leaderboard', label:'리더보드'},
      {id:'eval.metrics',     label:'평가 지표'},
      {id:'eval.predops',     label:'예측 모델 운영'},
    ]},

    /* ════════════════════════════════════
       대메뉴 3 — AI 서비스
    ════════════════════════════════════ */
    {id:'_s2', label:'AI 서비스', section:true},
    {id:'guardrail', label:'가드레일', icon:Shield, children:[
      {id:'guardrail.filter', label:'필터 설정'},
      {id:'guardrail.log',    label:'탐지 로그'},
    ]},
    {id:'security.arch', label:'보안 아키텍처', icon:Network},
    {id:'compliance', label:'규제 대응', icon:Scale, children:[
      {id:'aiact',     label:'AI 기본법 대응'},
      {id:'safetyact', label:'중대재해처벌법 대응'},
      {id:'repro',     label:'답변 재현성'},
    ]},
    {id:'packstudio', label:'도메인 팩 스튜디오', icon:LayoutGrid},
    {id:'deploy', label:'도구 · 배포', icon:Wrench, children:[
      {id:'deploy.tools.mcp',    label:'MCP 도구'},
      {id:'deploy.tools.server', label:'MCP 서버'},
      {id:'deploy.tools.prompt', label:'프롬프트 라이브러리'},
      {id:'deploy.serving',      label:'서빙 관리'},
    ]},
    {id:'agent', label:'에이전트', icon:Bot, children:[
      {id:'agent.taskflow.builder', label:'태스크플로우 빌더'},
      {id:'agent.taskflow.deploy',  label:'태스크플로우 배포'},
      {id:'agent.workflow',         label:'워크플로우'},
      {id:'agent.scenario',         label:'시나리오 빌더'},
    ]},
    {id:'app', label:'애플리케이션', icon:Grid, children:[
      {id:'app.chat',     label:'채팅'},
      {id:'app.report',   label:'보고서 생성'},
      {id:'app.analysis', label:'데이터 분석'},
    ]},

    /* ════════════════════════════════════
       대메뉴 4 — 지식 · RAG
    ════════════════════════════════════ */
    {id:'_s3', label:'지식 · RAG', section:true},
    {id:'knowledge', label:'지식 관리', icon:FolderOpen, children:[
      {id:'admin.knowledge', label:'지식영역 설정'},
      {id:'admin.rag',       label:'RAG 파이프라인'},
      {id:'admin.augment',   label:'지식 증강 전략'},
    ]},

    /* ════════════════════════════════════
       대메뉴 5 — 운영 · 관리
    ════════════════════════════════════ */
    {id:'_s4', label:'운영 · 관리', section:true},
    {id:'usermgmt', label:'사용자 관리', icon:Users, children:[
      {id:'admin.users',      label:'사용자 목록'},
      {id:'ops.approval',     label:'승인 관리'},
      {id:'ops.quota',        label:'할당량'},
      {id:'admin.logs',       label:'접근 로그'},
      {id:'admin.accesssec',  label:'접근권한·차단'},
    ]},
    {id:'admin.hrsync', label:'HR 연계·그룹 관리', icon:UserCog},
    {id:'llmops', label:'LLM 운영', icon:Cpu, children:[
      {id:'admin.llm',     label:'LLM 설정'},
      {id:'admin.trust',   label:'신뢰성 관리'},
      {id:'admin.quality', label:'AI 품질 관리'},
    ]},
    {id:'analytics', label:'서비스 분석', icon:PieChart, children:[
      {id:'admin.history',      label:'이용 이력'},
      {id:'admin.satisfaction', label:'이용만족도'},
      {id:'admin.stats',        label:'이용 통계'},
      {id:'admin.infostats',    label:'서비스 통계 리포트'},
    ]},
    {id:'logmgmt', label:'로그·모니터링', icon:List, children:[
      {id:'admin.worklog',   label:'통합 로그 관리'},
      {id:'admin.usagemon',  label:'사용량 모니터링'},
    ]},
    {id:'content', label:'콘텐츠 관리', icon:Megaphone, children:[
      {id:'admin.content', label:'공지사항·Q&A·설문'},
    ]},
    {id:'apiops', label:'API·프롬프트', icon:Unplug, children:[
      {id:'admin.apiprompt', label:'API·프롬프트 관리'},
    ]},
    {id:'system', label:'시스템 설정', icon:Settings, children:[
      {id:'admin.manage',       label:'관리 홈'},
      {id:'admin.announce',     label:'공지사항'},
      {id:'admin.monitor',      label:'시스템 모니터링'},
      {id:'admin.connectedmon', label:'연계 SW 모니터링'},
    ]},
  ];

  const pages = {
    'dashboard.system':<SystemDashboard/>,'dashboard.service':<ServiceDashboard/>,'dashboard.gpu':<GpuDashboard/>,'dashboard.trainer':<DashboardTrainer/>,
    'data.dataset':<DatasetPage/>,'data.vectordb':<VectorDbPage/>,'data.autoload':<AutoLoadPage/>,'data.catalog':<DataCatalogPage/>,
    'dev.codespace':<CodespacePage/>,'dev.volume':<SharedVolumePage/>,
    'model.registry':<ModelRegistry/>,
    'trainer.llm':<LlmTraining/>,'trainer.vlm':<VlmTraining/>,'trainer.embedding':<EmbeddingPage/>,'trainer.reranking':<RerankingPage/>,
    'eval.leaderboard':<LeaderboardPage/>,'eval.metrics':<EvalMetricsPage/>,'eval.predops':<PredictionOpsPage/>,
    'guardrail.filter':<GuardrailFilterPage/>,'guardrail.log':<GuardrailLogPage/>,
    'security.arch':<SecurityArchPage/>,
    'aiact':<AiActCompliancePage/>,'safetyact':<SafetyActPage/>,'repro':<ReproPage/>,
    'packstudio':<PackStudioPage/>,
    'deploy.tools.mcp':<MCPToolsPage/>,'deploy.tools.server':<MCPServerPage/>,'deploy.tools.prompt':<PromptLibraryPage/>,
    'deploy.serving':<ServingPage/>,
    'agent.taskflow.builder':<TaskflowBuilderPage/>,'agent.taskflow.deploy':<TaskflowDeployPage/>,'agent.workflow':<WorkflowPage/>,'agent.scenario':<ScenarioBuilderPage domain={domain}/>,
    'app.chat':<ChatAppPage/>,'app.report':<ReportGenPage/>,'app.analysis':<DataAnalysisPage/>,
    'ops.approval':<ApprovalPage/>,'ops.quota':<QuotaPage/>,
    'admin.manage':<AdminPage/>,'admin.users':<UserManagementPage/>,'admin.knowledge':<KnowledgeManagementPage/>,'admin.rag':<RagPipelinePage/>,'admin.augment':<AugmentStrategyPage/>,
    'admin.llm':<LlmManagePage/>,
    'admin.trust':<TrustManagePage/>,
    'admin.history':<UsageHistoryPage/>,'admin.satisfaction':<SatisfactionMgmtPage/>,
    'admin.stats':<UsageStatsPage/>,'admin.logs':<AccessLogPage/>,'admin.quality':<QualityManagementPage/>,
    'admin.announce':<AnnouncementPage/>,'admin.monitor':<SystemMonitorPage/>,
    'admin.infostats':<InfoServiceStatsPage/>,'admin.content':<ContentMgmtPage/>,'admin.accesssec':<AccessSecurityPage/>,
    'admin.worklog':<WorkLogPage/>,'admin.usagemon':<UsageMonitorPage/>,'admin.apiprompt':<ApiPromptPage/>,
    'admin.hrsync':<HrSyncPage/>,'admin.connectedmon':<ConnectedMonitorPage/>,
    'user.page':<UserPage/>,
  };

  return (
    <ToastProvider>
    <div className="flex h-screen bg-gray-50 text-gray-800" style={ADMIN_TYPE}>
      {/* Sidebar — 상단바 Columns 버튼으로 접기 */}
      <div className={`bg-white flex-col h-full border-r border-gray-200 shrink-0 shadow-sm ${sidebarOpen?'w-60 flex':'hidden'}`}>
        <div className="px-5 py-4 flex items-center space-x-3 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-sm backdrop-blur-sm">G</div>
          <div>
            <div className="text-[15px] font-black tracking-tight text-white leading-tight">RoadQ</div>
            <div className="text-[9px] font-bold tracking-widest text-blue-100 uppercase">Admin Console</div>
          </div>
        </div>
        <div className="flex-1 py-2 overflow-y-auto text-sm custom-scrollbar" style={{scrollbarWidth:'thin'}}>
          {menu.map(item=>
            item.section
              ? <div key={item.id} className="px-4 pt-5 pb-1.5 flex items-center gap-2">
                  <div className="flex-1 h-px bg-gray-100"/>
                  <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase whitespace-nowrap">{item.label}</span>
                  <div className="flex-1 h-px bg-gray-100"/>
                </div>
              : <SidebarItem key={item.id} item={item} activeId={activeId} onNav={setActiveId}/>
          )}
        </div>
        <div className="border-t">
          <div onClick={()=> onSwitchToUser ? onSwitchToUser() : setActiveId('user.page')} className={`mx-2 my-2 flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-all ${activeId==='user.page'&&!onSwitchToUser?'bg-blue-50 text-blue-700 font-bold border-l-[3px] border-blue-600':'hover:bg-gray-50 text-gray-600'}`}>
            <Monitor size={16} className={activeId==='user.page'&&!onSwitchToUser?'text-blue-600':'text-gray-400'}/><span>사용자 포털</span>
          </div>
        </div>
        <div className="p-3 border-t">
          <div className="flex items-center space-x-2.5 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-xs font-bold shadow-sm">{admin.name.charAt(0)}</div>
            <div className="flex-1 min-w-0"><div className="text-sm font-bold truncate">{admin.name}·{admin.role}</div><div className="text-xs text-gray-400 truncate">{orgName}</div></div>
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Top bar */}
        <div className="h-14 bg-white border-b shadow-sm flex items-center justify-end px-6 shrink-0 space-x-2">
          {onExitPortal && (
            <button onClick={onExitPortal} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors border border-gray-200">
              <LayoutGrid size={15}/> 포털 선택
            </button>
          )}
          {onSwitchToUser && (
            <button onClick={onSwitchToUser} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors border border-blue-200 mr-1">
              <Monitor size={15}/> 사용자 포털 전환
            </button>
          )}
          <button onClick={()=>setSidebarOpen(v=>!v)} aria-label={sidebarOpen?'사이드바 접기':'사이드바 펼치기'} aria-pressed={!sidebarOpen}
            title={sidebarOpen?'사이드바 접기':'사이드바 펼치기'}
            className={`p-2 rounded-lg hover:bg-gray-100 ${sidebarOpen?'text-gray-400 hover:text-gray-600':'text-blue-600 bg-blue-50'}`}><Columns size={18}/></button>
          <button onClick={()=>setActiveId('admin.manage')} aria-label="시스템 설정" title="시스템 설정"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><Settings size={18}/></button>
          <div className="relative">
            <button onClick={()=>{setNotifOpen(v=>!v);setNotifRead(true);}} aria-label="알림" aria-expanded={notifOpen} title="알림"
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg relative"><Bell size={18}/>
              {!notifRead&&<span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"/>}</button>
            {notifOpen&&(
              <>
                <div className="fixed inset-0 z-40" onClick={()=>setNotifOpen(false)}/>
                <div className="absolute right-0 top-11 z-50 w-80 bg-white rounded-xl border shadow-xl overflow-hidden">
                  <div className="px-4 py-2.5 border-b text-xs font-bold text-gray-500">운영 알림 {notifItems.length}건</div>
                  {notifItems.map(n=>(
                    <button key={n.id} onClick={()=>{setActiveId(n.to);setNotifOpen(false);}}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50/60 border-b last:border-b-0 transition-colors">
                      <div className="text-[13px] font-bold text-gray-800">{n.title}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">{n.body}</div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="flex items-center space-x-2 ml-3 pl-3 border-l text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-[10px] font-bold">{admin.name.charAt(0)}</div>
            <span>{admin.name}</span><ChevronDown size={14}/>
          </div>
        </div>
        <div className="flex-1 overflow-hidden bg-[#F8F9FA]">
          {pages[activeId] || (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Briefcase size={48} className="mb-4 text-gray-300"/><h3 className="text-lg font-medium">준비 중인 페이지입니다</h3><p className="text-sm mt-1 font-mono bg-gray-100 px-3 py-1 rounded">{activeId}</p>
            </div>
          )}
        </div>
      </main>
    </div>
    </ToastProvider>
  );
};

export default App;

