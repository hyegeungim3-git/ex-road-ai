/**
 * 시계열 엔진 — 도메인 중립 코어
 *
 * 이 플랫폼의 정체성은 "도로에서 올라오는 시계열"이다. 그 시계열을 팩에 수천 개
 * 좌표로 박아 두는 대신, 팩은 '사건의 형태'(기준값·급락 시점·깊이·시드)만 주고
 * 여기서 결정적(deterministic)으로 생성한다.
 *   - 팩 파일이 비대해지지 않는다
 *   - 같은 입력이면 항상 같은 그래프 → 검증 스크립트가 값을 판정할 수 있다
 *   - 새 구간·설비를 추가하는 비용이 한 줄이다
 *
 * 스키마 정본: 팩의 domain.timeSeries (작성 예시는 src/domains/expressway.js)
 *   forecast.segments[] : { baseline, threshold, warn, seed, dip:{atPct,to,width}, forecast:{value,lo,hi}, mae, drift }
 *   anomaly             : { streamBase, streamSeed, streamDip, events[] }
 *   health.assets[]     : { value, threshold, rulMonths, seed, trendUp }
 *   quality             : { pipelines[], rules[], models[] }
 *
 * ※ 전부 시뮬레이션 데이터다. 실서비스에서는 EXTIS·EX-DataLake 조회로 대체된다.
 */

/** 시드 기반 난수 (mulberry32) — 같은 시드면 같은 수열 */
export function seeded(seed = 1) {
  let t = seed >>> 0;
  return function next() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** 분 단위 라벨 (기준 시각에서 거꾸로) — "07:42" 형식 */
export function timeLabels(points, stepMin, endHour = 8, endMin = 0) {
  const out = [];
  let total = endHour * 60 + endMin - (points - 1) * stepMin;
  for (let i = 0; i < points; i += 1) {
    const m = ((total % 1440) + 1440) % 1440;
    out.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
    total += stepMin;
  }
  return out;
}

/**
 * 관측 시계열 생성 — 기준값 주변의 완만한 변동 + 지정 구간의 급락(dip)
 * @returns [{ t, v }]
 */
export function buildSeries({ points = 24, base = 90, noise = 2.4, wave = 3.2, dip = null, seed = 1, stepMin = 5, endHour = 8, endMin = 0, min = 0 }) {
  const rand = seeded(seed);
  const labels = timeLabels(points, stepMin, endHour, endMin);
  const out = [];
  for (let i = 0; i < points; i += 1) {
    const pct = points === 1 ? 0 : i / (points - 1);
    let v = base + Math.sin(pct * Math.PI * 2 + seed) * wave + (rand() - 0.5) * noise * 2;
    if (dip) {
      // 급락 구간: 가우시안 형태로 dip.to 까지 끌어내린다
      const d = (pct - dip.atPct) / (dip.width || 0.1);
      const weight = Math.exp(-(d * d));
      v = v + (dip.to - base) * weight;
    }
    out.push({ t: labels[i], v: Math.max(min, Math.round(v * 10) / 10) });
  }
  // 급락이 '지금'에 걸린 경우(atPct=1) 마지막 관측값은 잡음 없이 원장 수치 그대로 보여준다.
  // 화면의 '현재 관측'이 세계관 수치(예: 38km/h)와 어긋나면 데모의 신뢰가 깨진다.
  if (dip && dip.atPct >= 0.999 && out.length) out[out.length - 1].v = dip.to;
  return out;
}

/**
 * 예측 구간 생성 — 마지막 관측값에서 목표 예측값으로 수렴하며 신뢰구간이 벌어진다
 * @returns [{ t, v:null, p, lo, hi }] (관측 마지막 점은 이어붙이기용으로 v도 채운다)
 */
export function buildForecast(series, { value, lo, hi }, { steps = 6, stepMin = 5 } = {}) {
  if (!series.length) return [];
  const last = series[series.length - 1];
  const [h, m] = last.t.split(":").map(Number);
  const out = [{ t: last.t, v: last.v, p: last.v, lo: last.v, hi: last.v }];
  for (let i = 1; i <= steps; i += 1) {
    const total = h * 60 + m + i * stepMin;
    const tt = `${String(Math.floor((total % 1440) / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
    const k = i / steps;
    const p = last.v + (value - last.v) * k;
    out.push({
      t: tt,
      v: null,
      p: Math.round(p * 10) / 10,
      lo: Math.round((p - (p - lo) * k) * 10) / 10,
      hi: Math.round((p + (hi - p) * k) * 10) / 10,
    });
  }
  return out;
}

/** 계측 추세 (일 단위 30점) — 예지보전 카드용 */
export function buildTrend({ value, threshold, seed = 1, trendUp = true, points = 30 }) {
  const rand = seeded(seed);
  const start = trendUp ? value * 0.82 : value * 1.06;
  const out = [];
  for (let i = 0; i < points; i += 1) {
    const k = points === 1 ? 1 : i / (points - 1);
    const v = start + (value - start) * k + (rand() - 0.5) * (threshold * 0.02);
    out.push({ t: `D-${points - 1 - i}`, v: Math.round(v * 100) / 100 });
  }
  out[out.length - 1].v = value;
  return out;
}

/** 임계 대비 상태 — 'ok' | 'warn' | 'alert' */
export function gradeOf(value, threshold, { below = false, warnRatio = 0.8 } = {}) {
  if (below) {
    if (value <= threshold) return "alert";
    if (value <= threshold / warnRatio) return "warn";
    return "ok";
  }
  if (value >= threshold) return "alert";
  if (value >= threshold * warnRatio) return "warn";
  return "ok";
}

export const GRADE_STYLE = {
  ok:    { text: "text-emerald-700", bg: "bg-emerald-50",  border: "border-emerald-200", dot: "bg-emerald-500", label: "정상" },
  warn:  { text: "text-amber-700",   bg: "bg-amber-50",    border: "border-amber-200",   dot: "bg-amber-500",   label: "주의" },
  alert: { text: "text-rose-700",    bg: "bg-rose-50",     border: "border-rose-200",    dot: "bg-rose-500",    label: "경고" },
};
