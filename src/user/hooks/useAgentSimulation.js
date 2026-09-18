import { useState } from "react";

/**
 * 에이전트 진행 시뮬레이션 공통 훅 (8개 에이전트의 동일 패턴을 단일화)
 *
 * @param agents  [{ms, ...}] — 단계별 소요시간 배열
 * @param options
 *   onStepStart(i, prevDelay, agent) — 각 단계 "예약 시점"에 동기 호출.
 *     중간 티커(청크 진행, OCR 페이지 등)는 여기서 자체 setTimeout으로 스케줄한다.
 *   onComplete() — 마지막 단계 완료 직후(step 3 전환 전) 호출
 *   completeDelay — 마지막 단계 후 step 3 전환까지 대기(ms), 기본 600
 *
 * 반환: { step, setStep, agentIdx, doneIdx, start, resetSim }
 *   step: 1=입력, 2=처리 중, 3=결과 / agentIdx: 현재 단계(-1=완료) / doneIdx: 완료 단계 목록
 *   resetSim은 시뮬레이션 상태만 초기화 — 파일·폼 등 에이전트 고유 상태는 호출측 reset에서 함께 처리
 */
export function useAgentSimulation(agents, { onStepStart, onComplete, completeDelay = 600 } = {}) {
  const [step, setStep] = useState(1);
  const [agentIdx, setAgentIdx] = useState(-1);
  const [doneIdx, setDoneIdx] = useState([]);

  const start = () => {
    setStep(2); setAgentIdx(0); setDoneIdx([]);
    let delay = 0;
    agents.forEach((ag, i) => {
      const prev = delay;
      delay += ag.ms;
      if (onStepStart) onStepStart(i, prev, ag);
      setTimeout(() => {
        setAgentIdx(i + 1 < agents.length ? i + 1 : -1);
        setDoneIdx(p => [...p, i]);
        if (i === agents.length - 1) {
          if (onComplete) onComplete();
          setTimeout(() => setStep(3), completeDelay);
        }
      }, delay);
    });
  };

  const resetSim = () => { setStep(1); setAgentIdx(-1); setDoneIdx([]); };

  return { step, setStep, agentIdx, doneIdx, start, resetSim };
}
