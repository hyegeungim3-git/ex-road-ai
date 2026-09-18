/* ================================================================== */
/* 지도 인텔리전스 (3단계) — GENERAL 채팅의 지역 질의 감지·응답 생성     */
/* 도메인 팩의 mapIntel 필드만 소비하는 도메인 중립 모듈.               */
/* 데이터·용어는 전부 팩에서 공급되며 여기에 조직 콘텐츠를 넣지 않는다.  */
/* ================================================================== */

/**
 * 질의가 지역 분석 요청인지 판별한다.
 * 규칙: 지표 키워드(metricKeywords) 필수 + (특정 지역 키워드 또는 광역 키워드) 동시 충족.
 * @param {string} q  소문자 변환된 질의
 * @returns {{ region: object|null } | null}  region=null이면 전체(광역) 질의
 */
export const matchMapIntel = (q, mapIntel) => {
  if (!mapIntel) return null;
  const metricHit = mapIntel.metricKeywords.some(k => q.includes(k));
  if (!metricHit) return null;
  const region = mapIntel.regions.find(r => r.keywords.some(k => q.includes(k))) || null;
  const wide = mapIntel.wideKeywords.some(k => q.includes(k));
  if (!region && !wide) return null;
  return { region };
};

const round2 = (v) => Math.round(v * 100) / 100;

/* 받침 유무에 따른 조사 선택 — 도메인마다 단위(%·건)와 지역 단위 명칭이 달라 하드코딩 불가 */
const lastMeaningful = (s) => s.replace(/[^가-힣0-9a-zA-Z%]/g, "").slice(-1);
const hasBatchim = (s) => {
  const ch = lastMeaningful(s);
  const code = ch.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28 !== 0;
  if (/[013678]/.test(ch)) return true;   // 영·일·삼·육·칠·팔
  return false;                            // 2·4·5·9, %, 영문 등은 무받침 취급
};
const isRieul = (s) => { const c = lastMeaningful(s).charCodeAt(0); return c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 === 8; };
const eunNeun = (s) => (hasBatchim(s) ? "은" : "는");
const eulReul = (s) => (hasBatchim(s) ? "을" : "를");
const euro = (s) => (hasBatchim(s) && !isRieul(s) ? "으로" : "로");

/** 매칭된 지역 질의에 대한 채팅 응답(본문 + mapIntel 페이로드)을 만든다. */
export const buildMapIntelResponse = (mapIntel, region) => {
  const sorted = [...mapIntel.regions].sort((a, b) => b.value - a.value);
  const focus = region || sorted[0];
  const rank = sorted.findIndex(r => r.id === focus.id) + 1;
  const n = mapIntel.regions.length;
  const top = sorted[0];
  const bottom = sorted[n - 1];
  const avg = round2(mapIntel.regions.reduce((s, r) => s + r.value, 0) / n);
  const u = mapIntel.unit;
  const ru = mapIntel.regionUnit;

  const val = (r) => `${r.value.toLocaleString()}${u}`;
  const lead = region
    ? `**${focus.name}**의 ${mapIntel.metricLabel}${eunNeun(mapIntel.metricLabel)} **${val(focus)}**${euro(u)}, 전체 ${n}개 ${ru} 중 **${rank}위**입니다.\n\n${focus.insight}`
    : `전체 ${n}개 ${ru} 중 최고는 **${top.name}(${val(top)})**, 최저는 **${bottom.name}(${val(bottom)})**이며, 평균은 **${avg.toLocaleString()}${u}**입니다.\n\n${focus.insight}`;

  return {
    confidence: 95,
    content: `**[지도 인텔리전스]** ${mapIntel.metricLabel} — ${mapIntel.periodLabel}\n\n${lead}\n\n아래 히트맵에서 다른 ${ru}${eulReul(ru)} 클릭하면 시계열 차트가 해당 ${ru} 기준으로 전환됩니다.\n\n${mapIntel.sourceNote}`,
    citations: [],
    steps: [
      { label: "지역 엔티티 인식", detail: region ? `질의에서 '${focus.name}' 추출 — ${ru} 코드 매핑 완료` : `${ru} 전체 범위 질의로 판별` },
      { label: `${mapIntel.sourceSystem} 집계`, detail: `${n}개 ${ru} × ${mapIntel.seriesLabels.length}개 시점 데이터 조회 완료` },
      { label: "공간 시각화 생성", detail: "히트맵 · 시계열 차트 렌더링 완료" },
    ],
    mapIntel: { config: mapIntel, focusId: focus.id },
  };
};
