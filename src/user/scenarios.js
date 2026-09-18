/* ================================================================== */
/* 커스텀 오케스트레이션 시나리오 오버레이 (시나리오 빌더가 생성)       */
/* 팩 orchestration 뒤에 도메인별 localStorage 시나리오를 이어 붙인다.  */
/* 코어의 시나리오 조회는 반드시 allScenarios(domain)를 경유할 것 —     */
/* domain.orchestration 직접 참조 시 커스텀 시나리오가 누락된다.        */
/* ================================================================== */
import { orchList } from "./utils.jsx";
import { demoStorage, makeDomainStorageKey } from "../core/demoStorage.js";

const keyOf = (d) => makeDomainStorageKey("customScenarios", d);
export const SCENARIO_CAP = 3; // 도메인당 커스텀 시나리오 상한 (허브 카드 과밀 방지)

export function loadCustomScenarios(domainId) {
  const scenarios = demoStorage.readJson(keyOf(domainId), []);
  return Array.isArray(scenarios) ? scenarios : [];
}

export function saveCustomScenarios(domainId, arr) {
  return demoStorage.writeJson(keyOf(domainId), arr.slice(0, SCENARIO_CAP));
}

/** 팩 시나리오 + 커스텀 시나리오 병합 목록 — 라우팅 인덱스(orchestration:<idx>)의 정본 */
export function allScenarios(domain) {
  if (!domain) return [];
  return [
    ...orchList(domain.orchestration),
    ...loadCustomScenarios(domain.id).map(s => ({ ...s, _custom: true })),
  ];
}
