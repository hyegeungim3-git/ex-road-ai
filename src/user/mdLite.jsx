import React from "react";
import { cn } from "./utils.jsx";

/* ================================================================== */
/* 경량 마크다운 렌더러 — 채팅 말풍선 전용                              */
/* 지원: **볼드**, 마크다운 표(| 행). 나머지는 원문 유지(pre-wrap 전제) */
/* React 엘리먼트 생성 방식 — dangerouslySetInnerHTML 미사용 (XSS 안전) */
/* ================================================================== */

/* 인라인 **볼드** → <strong> */
const renderInline = (text, keyBase) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((seg, i) =>
    seg.startsWith("**") && seg.endsWith("**") && seg.length > 4
      ? <strong key={`${keyBase}-${i}`} className="font-black">{seg.slice(2, -2)}</strong>
      : seg
  );

/* 표 블록 파싱 — 셀 배열 반환 (가장자리 빈 셀 제거) */
const parseRow = (line) => {
  const cells = line.split("|").map(c => c.trim());
  if (cells[0] === "") cells.shift();
  if (cells[cells.length - 1] === "") cells.pop();
  return cells;
};
const isSeparatorRow = (line) => /^\s*\|?[\s|:-]+\|?\s*$/.test(line) && line.includes("-");

export const renderMdLite = (content, isSecure = false) => {
  if (typeof content !== "string" || !content.includes("|") && !content.includes("**")) return content;
  const lines = content.split("\n");
  const blocks = []; // { type: 'text'|'table', lines: [] }
  for (const line of lines) {
    const isTableLine = line.trim().startsWith("|") && line.trim().length > 1;
    const last = blocks[blocks.length - 1];
    if (isTableLine) {
      if (last?.type === "table") last.lines.push(line);
      else blocks.push({ type: "table", lines: [line] });
    } else {
      if (last?.type === "text") last.lines.push(line);
      else blocks.push({ type: "text", lines: [line] });
    }
  }
  return blocks.map((b, bi) => {
    if (b.type === "text") {
      // 텍스트 블록 — 개행 보존(말풍선의 whitespace-pre-wrap), 인라인 볼드만 치환
      const joined = b.lines.join("\n");
      return <React.Fragment key={bi}>{renderInline(joined, bi)}</React.Fragment>;
    }
    // 표 블록 — 2번째 행이 구분선(---)이면 1번째 행을 헤더로
    const rows = b.lines.map(parseRow);
    const hasHeader = b.lines.length >= 2 && isSeparatorRow(b.lines[1]);
    const header = hasHeader ? rows[0] : null;
    const body = hasHeader ? rows.slice(2) : rows;
    return (
      <div key={bi} className="overflow-x-auto my-1.5 not-italic">
        <table className={cn("w-full text-[12.5px] border rounded-lg overflow-hidden", isSecure ? "border-slate-700" : "border-slate-200")}>
          {header && (
            <thead>
              <tr className={isSecure ? "bg-slate-800" : "bg-slate-50"}>
                {header.map((h, hi) => (
                  <th key={hi} className={cn("px-2.5 py-1.5 text-left font-black border-b whitespace-nowrap", isSecure ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600")}>
                    {renderInline(h, `h${hi}`)}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {body.map((r, ri) => (
              <tr key={ri} className={cn("border-b last:border-b-0", isSecure ? "border-slate-800" : "border-slate-100")}>
                {r.map((c, ci) => (
                  <td key={ci} className={cn("px-2.5 py-1.5 align-top", isSecure ? "text-slate-300" : "text-slate-700")}>
                    {renderInline(c, `${ri}-${ci}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  });
};
