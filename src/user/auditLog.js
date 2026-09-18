/* ================================================================== */
/* AI 상호작용 감사 추적 (AI 기본법 제34조 기록·감독 서사)              */
/* 사용자 포털의 실사용 이벤트를 도메인별 localStorage에 축적하고,      */
/* 관리자 'AI 기본법 대응 > 감사 추적' 탭이 실데이터로 집계한다.        */
/*                                                                    */
/* 이벤트 유형: query(질의·답변) · xai_open(왜 이 답변인가 열람) ·      */
/*   orch_complete(시나리오 완주, HITL 지점 포함) · live_alert(실시간   */
/*   임계 돌파) · feedback(답변 평가)                                  */
/* SECURE 세션은 호출부에서 제외한다 (무저장 서사) — 이 모듈은 저장만   */
/* ================================================================== */
import { getActiveDomainId } from "../domains/index.js";
import { demoStorage, makeDomainStorageKey } from "../core/demoStorage.js";

export const AUDIT_CAP = 200; // 도메인당 보관 상한 (초과 시 오래된 것부터 삭제)
const keyOf = (d) => makeDomainStorageKey("audit", d);

export function logAudit(event, { sensitive = false } = {}) {
  const d = getActiveDomainId();
  const k = keyOf(d);
  const options = { sensitive };
  const stored = demoStorage.readJson(k, [], options);
  const arr = Array.isArray(stored) ? stored : [];
  arr.unshift({
    id: `au-${Date.now()}-${Math.floor(Math.random() * 1e4)}`,
    ts: new Date().toISOString().slice(0, 19).replace("T", " "),
    ...event,
  });
  return demoStorage.writeJson(k, arr.slice(0, AUDIT_CAP), options);
}

export function readAudit(domainId = getActiveDomainId()) {
  const events = demoStorage.readJson(keyOf(domainId), []);
  return Array.isArray(events) ? events : [];
}

export function clearAudit(domainId = getActiveDomainId()) {
  return demoStorage.remove(keyOf(domainId));
}
