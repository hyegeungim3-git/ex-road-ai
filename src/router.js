/**
 * router.js — 해시 기반 라우팅 (도메인 중립 코어)
 *
 * GitHub Pages는 서버 리라이트가 없으므로 history API 대신 해시를 쓴다.
 * 형식:
 *   #/                                  포털 선택
 *   #/<domainId>/user/general           사용자 포털 · 일반
 *   #/<domainId>/user/agent             사용자 포털 · 에이전트 허브
 *   #/<domainId>/user/agent/<agentId>   특정 에이전트 (orchestration:0 포함)
 *   #/<domainId>/user/data              사용자 포털 · 데이터(시계열)
 *   #/<domainId>/user/secure            사용자 포털 · 보안
 *   #/<domainId>/admin/<menuId>         관리자 (menuId 예: dashboard.system)
 *
 * route 객체: { view:'SELECTOR'|'USER'|'ADMIN', domainId, tab:'GENERAL'|'AGENT'|'DATA'|'SECURE',
 *              agentId:string|null, adminId:string }
 */

export const DEFAULT_ADMIN_ID = 'dashboard.system';

const TAB_TO_SLUG = { GENERAL: 'general', AGENT: 'agent', DATA: 'data', SECURE: 'secure' };
const SLUG_TO_TAB = { general: 'GENERAL', agent: 'AGENT', data: 'DATA', secure: 'SECURE' };

export function parseRoute(hash = window.location.hash) {
  const segs = String(hash).replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  if (!segs.length) return { view: 'SELECTOR', domainId: null, tab: 'GENERAL', agentId: null, adminId: DEFAULT_ADMIN_ID };

  const [domainId, portal, ...rest] = segs;
  if (portal === 'admin') {
    return { view: 'ADMIN', domainId, tab: 'GENERAL', agentId: null, adminId: rest[0] || DEFAULT_ADMIN_ID };
  }
  if (portal === 'user') {
    const tab = SLUG_TO_TAB[rest[0]] || 'GENERAL';
    return { view: 'USER', domainId, tab, agentId: tab === 'AGENT' ? (rest[1] || null) : null, adminId: DEFAULT_ADMIN_ID };
  }
  return { view: 'SELECTOR', domainId, tab: 'GENERAL', agentId: null, adminId: DEFAULT_ADMIN_ID };
}

export function buildRoute(route) {
  if (!route || route.view === 'SELECTOR' || !route.domainId) return '#/';
  const d = encodeURIComponent(route.domainId);
  if (route.view === 'ADMIN') return `#/${d}/admin/${encodeURIComponent(route.adminId || DEFAULT_ADMIN_ID)}`;
  const slug = TAB_TO_SLUG[route.tab] || 'general';
  if (route.tab === 'AGENT' && route.agentId) return `#/${d}/user/agent/${encodeURIComponent(route.agentId)}`;
  return `#/${d}/user/${slug}`;
}

/** 현재 해시와 다를 때만 갱신 (같은 값 반복 기록 방지) */
export function syncHash(route) {
  const next = buildRoute(route);
  if (window.location.hash !== next) window.location.hash = next;
}

export function sameRoute(a, b) {
  return !!a && !!b && a.view === b.view && a.domainId === b.domainId
    && a.tab === b.tab && a.agentId === b.agentId && a.adminId === b.adminId;
}
