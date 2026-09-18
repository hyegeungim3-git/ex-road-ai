/* ================================================================== */
/* 라이브 데이터 엔진 — 팩 liveMetric 설정으로 구동되는 시뮬레이션 틱   */
/* 순수 함수로 분리: UI 없이도 장시간 거동(고착 없음)을 검증 가능       */
/*                                                                    */
/* 팩 스키마 (liveMetric — 선택, 생략 시 라이브 카드·실시간 알림 비활성) */
/*   label, unit, decimals, source: 표시용                            */
/*   initial, min, max, window: 초기값·표시 범위·스파크라인 길이       */
/*   threshold, thresholdLabel: 임계값 (기본은 상향 돌파 시 alert 발화)  */
/*   thresholdDirection: 'above'(기본) | 'below'                       */
/*     — 'below'는 값이 낮을수록 나쁜 지표(예: 구간 평균속도·가용률).    */
/*       돌파 판정과 recovery 도달 판정이 함께 뒤집힌다.                */
/*   drift: 초당 기저 상승량 / noise: 랜덤 워크 진폭                   */
/*   recovery: { at, to } — at 도달 시 to로 리셋 (조치 서사 + 고착 방지) */
/*     'below'에서는 at 이하로 내려가면 to로 되돌린다                   */
/*   alert: { severity, title, body('{value}' 치환), link:{agentId} }  */
/* ================================================================== */

/** 임계 돌파 여부 — 'below' 지표는 판정을 뒤집는다 */
const isBreach = (v, cfg) =>
  cfg.thresholdDirection === "below" ? v <= cfg.threshold : v >= cfg.threshold;

export function initLive(cfg) {
  const n = cfg.window || 48;
  return {
    value: cfg.initial,
    series: Array(n).fill(cfg.initial),
    above: isBreach(cfg.initial, cfg),   // 'above'는 이름만 유산 — 의미는 '임계 돌파 상태'
    crossings: 0,   // 임계 상향 돌파 누적 (검증·데모 지표)
    simSeconds: 0,  // 경과 시뮬레이션 시간
  };
}

/* dt = 이번 스텝이 나타내는 시뮬레이션 초 (배속 = 실제 1초당 dt) */
export function stepLive(state, cfg, dt = 1) {
  let v = state.value + cfg.drift * dt + (Math.random() - 0.5) * cfg.noise * Math.sqrt(dt);
  let recovered = false;
  const hitRecovery = cfg.recovery
    && (cfg.thresholdDirection === "below" ? v <= cfg.recovery.at : v >= cfg.recovery.at);
  if (hitRecovery) { v = cfg.recovery.to; recovered = true; }
  v = Math.min(cfg.max, Math.max(cfg.min, v));
  const above = isBreach(v, cfg);
  const crossed = above && !state.above; // 임계를 '막 넘은' 순간에만 true
  return {
    next: {
      value: v,
      series: [...state.series.slice(1), v],
      above,
      crossings: state.crossings + (crossed ? 1 : 0),
      simSeconds: state.simSeconds + dt,
    },
    crossed,
    recovered,
  };
}

/* 알림 본문 생성 — body의 '{value}'를 현재 값으로 치환 */
export function liveAlertOf(cfg, value, id) {
  return {
    id,
    severity: cfg.alert.severity || "alert",
    title: cfg.alert.title,
    body: cfg.alert.body.replace("{value}", value.toFixed(cfg.decimals ?? 1)),
    time: "방금",
    link: cfg.alert.link,
  };
}
