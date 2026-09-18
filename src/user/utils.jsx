export function cn(...classes) { return classes.filter(Boolean).join(" "); }

/* 도메인 팩 orchestration 필드 정규화 — 객체 1개(기존 팩 하위호환) 또는 배열(시나리오 여러 개) 모두 허용 */
export const orchList = (o) => (Array.isArray(o) ? o : o ? [o] : []);

/* 텍스트 계열 파일 내려받기 공용 헬퍼 — BOM을 붙여 엑셀·워드에서 한글이 깨지지 않게 한다.
   mime: 'text/plain' | 'text/tab-separated-values'(.xls) | 'application/msword'(.doc) 등 */
export function downloadTextFile(filename, text, mime = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob(['﻿' + text], { type: mime }));
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/* 에이전트 화면 제목·설명의 단일 승계 경로.
   이름이 허브 카드(agentCatalog)와 안쪽 화면 두 곳에 따로 정의되면 반드시 어긋난다(실제 사고 이력).
   제목 우선순위: 팩 agentContent.headerTitle > 팩 agentCatalog.name > 코어 AGENT_TEAMS.name > 컴포넌트 기본값.
   설명은 카탈로그를 승계하지 않는다 — 카드 desc는 '무엇을 하는가'(홍보 문장),
   내부 headerDesc는 '어떤 순서로 진행되는가'(작업 흐름)로 역할이 다르기 때문.
   teams: 순환 import를 피하려고 호출부가 AGENT_TEAMS를 넘긴다. */
export function agentHeader(domain, agentId, defaults = {}, teams = null) {
  const pack = domain?.agentContent?.[agentId] || {};
  const cat = domain?.agentCatalog?.[agentId] || {};
  const core = teams?.find(t => t.id === agentId) || null;
  return {
    title: pack.headerTitle || cat.name || core?.name || defaults.headerTitle || '',
    desc: pack.headerDesc || defaults.headerDesc || '',
  };
}

/* 문서 레터헤드 로고를 도메인 정보로 즉석 생성한다(SVG data URI).
   예전엔 REB 로고 래스터 이미지가 기본값이라, 팩이 자기 로고를 안 주면
   제조·행정·의료 문서에도 포크 원본 발주처의 레터헤드가 찍혔다.
   이미지를 팩마다 넣게 하는 대신 조직명·약칭·브랜드컬러로 그려서 팩 작업을 0으로 만든다.
   <img src>와 인쇄 HTML 문자열 양쪽에서 그대로 쓸 수 있다. */
export function orgLogoDataUri(org = {}) {
  const name = org.name || "조직명";
  const short = (org.short || "ORG").toUpperCase();
  const color = org.color || "#334155";
  /* 사이드바와 동일한 OCUBE / RoadQ 락업을 그대로 쓴다.
     조직명을 문자로 넣던 이전 방식은 한글 폭을 SVG가 미리 알 수 없어 글자가 겹쳤다(실제 사고).
     문구가 고정 영문이라 폭이 예측 가능하고, 발행 조직은 문서 헤더의
     담당부서·문서번호 필드가 이미 나타낸다. 색만 도메인 브랜드컬러를 따른다. */
  const FONT = "'Malgun Gothic','Apple SD Gothic Neo','Noto Sans KR',sans-serif";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 132 52" width="132" height="52">
<title>${String(short).toUpperCase()} ${name} — OCUBE RoadQ</title>
<rect x="0" y="4" width="44" height="44" rx="11" fill="${color}"/>
<g transform="translate(9,13) scale(0.82)">
<path d="M16 4.2 L26.6 10.3 L16 16.4 L5.4 10.3 Z" fill="#fff"/>
<path d="M5.4 10.3 L16 16.4 L16 28.2 L5.4 22.1 Z" fill="#fff" opacity="0.62"/>
<path d="M26.6 10.3 L26.6 22.1 L16 28.2 L16 16.4 Z" stroke="#fff" stroke-width="1.5" fill="none" opacity="0.85"/>
<circle cx="23.2" cy="21.4" r="2.1" fill="#fff"/>
</g>
<text x="53" y="23" font-family="${FONT}" font-size="9" font-weight="800" fill="#94a3b8" letter-spacing="2.6">OCUBE</text>
<text x="53" y="42" font-family="${FONT}" font-size="21" font-weight="800" fill="${color}" letter-spacing="0.2">RoadQ</text>
</svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

/* 워드(.doc)로 열리는 최소 HTML 문서 — 제목 + 본문 문단 */
export function buildDocHtml(title, body) {
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const paras = String(body).split('\n').map(l => l.trim() ? `<p>${esc(l)}</p>` : '<p>&nbsp;</p>').join('\n');
  return `<html xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8">
<title>${esc(title)}</title>
<style>body{font-family:'맑은 고딕',Malgun Gothic,sans-serif;font-size:11pt;line-height:1.6}
h1{font-size:15pt}p{margin:0 0 6pt}</style></head>
<body><h1>${esc(title)}</h1>
${paras}
</body></html>`;
}

/* 데이터 보안 등급 체계 (정보공개법 제9조 기반) */
export const SECURITY_LEVELS = {
  C: { label:"기밀", code:"C", bg:"bg-red-600",    text:"text-red-700",    border:"border-red-200",    light:"bg-red-50",    dot:"bg-red-500",    desc:"법률상 비밀 / 안보·국방·외교·국민 생명·안전",       fullDesc:"법률상 비밀·비공개 / 안보·국방·외교·국민 생명·안전과 직결" },
  S: { label:"민감", code:"S", bg:"bg-orange-500", text:"text-orange-700", border:"border-orange-200", light:"bg-orange-50", dot:"bg-orange-400", desc:"개인정보·경영비밀 등 비공개 정보",                   fullDesc:"개인·국가 이익 침해 가능한 비공개 정보 (개인정보·경영비밀 등)" },
  O: { label:"공개", code:"O", bg:"bg-green-600",  text:"text-green-700",  border:"border-green-200",  light:"bg-green-50",  dot:"bg-green-500",  desc:"기밀·민감 외 공개 가능한 정보",                     fullDesc:"기밀·민감 외 공개 가능한 모든 정보" },
};

import React from "react";
export const SecurityBadge = ({ level, size = "sm" }) => {
  const cfg = SECURITY_LEVELS[level] || { bg:"bg-slate-400", label:"미분류", code:"?" };
  const sz = size === "xs" ? "text-[8px] px-1.5 py-0.5"
           : size === "md" ? "text-[11px] px-2.5 py-1"
           : "text-[9px] px-1.5 py-0.5";
  return (
    <span className={`${cfg.bg} text-white ${sz} rounded font-black tracking-wide shrink-0 leading-none whitespace-nowrap`}>
      {cfg.label}({cfg.code})
    </span>
  );
};
