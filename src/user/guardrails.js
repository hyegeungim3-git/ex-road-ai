import { demoStorage } from "../core/demoStorage.js";

/* ================================================================== */
/* GUARDRAIL ENGINE (관리자 필터링 → localStorage 브리지)              */
/* 관리자 시스템이 localStorage에 기록한 규칙을 사용자 앱이 읽어 적용   */
/* ================================================================== */

/** localStorage에서 관리자 필터 규칙을 읽어 입력 텍스트를 검사합니다.
 *  returns: { blocked, warning, matchedRule } */
export const checkInputFilter = (text) => {
  try {
    const rules = demoStorage.readJson('roadq_filter_rules', []);
    if (!Array.isArray(rules)) return { blocked: false, warning: false, matchedRule: null };
    const q = text.toLowerCase();
    const matched = rules.filter(r => {
      if (!r.active) return false;
      return r.p.split(',').map(k => k.trim().toLowerCase()).some(k => k && q.includes(k));
    });
    const blockedRule  = matched.find(r => r.a === '차단');
    const warningRule  = matched.find(r => r.a === '경고');
    return {
      blocked:     !!blockedRule,
      warning:     !blockedRule && !!warningRule,
      matchedRule: blockedRule || warningRule || null,
    };
  } catch { return { blocked: false, warning: false, matchedRule: null }; }
};

/** localStorage에서 출력 가드레일 규칙을 읽어 AI 응답에 적용합니다. */
export const applyOutputGuardrails = (resp) => {
  try {
    const rules = demoStorage.readJson('roadq_output_guardrails', []);
    if (!Array.isArray(rules)) return resp;
    let content = resp.content || '';
    const applied = [];

    // og-003: 불확실 표현 감지 → 신뢰도 감점 배지
    const og003 = rules.find(r => r.id === 'og-003' && r.enabled);
    if (og003) {
      const uncertain = ['아마도','추정','잘 모르겠','확실하지 않','불분명','정확하지 않'];
      const hits = uncertain.filter(p => content.includes(p));
      if (hits.length) applied.push({ id:'og-003', rule:og003.name, action:og003.action, detail:`'${hits[0]}' 등 감지` });
    }

    // og-004: 응답 길이 제한 (2,000자)
    const og004 = rules.find(r => r.id === 'og-004' && r.enabled);
    if (og004 && content.length > 2000) {
      content = content.substring(0, 2000) + '\n\n*\\[자동 요약\\] 응답이 2,000자를 초과하여 잘렸습니다.*';
      applied.push({ id:'og-004', rule:og004.name, action:og004.action, detail:`${resp.content.length}자 → 2,000자로 요약` });
    }

    // og-005: 외부 URL 출력 차단
    const og005 = rules.find(r => r.id === 'og-005' && r.enabled);
    if (og005) {
      const urlRx = /https?:\/\/[^\s)>\]"']+|www\.[^\s)>\]"']+/g;
      if (urlRx.test(content)) {
        content = content.replace(/https?:\/\/[^\s)>\]"']+|www\.[^\s)>\]"']+/g, '`[URL 제거됨]`');
        applied.push({ id:'og-005', rule:og005.name, action:og005.action, detail:'외부 URL 자동 제거' });
      }
    }

    // og-006: PII 자동 마스킹 (전화번호·주민번호)
    const og006 = rules.find(r => r.id === 'og-006' && r.enabled);
    if (og006) {
      const before = content;
      content = content
        .replace(/\b01[016789]-?\d{3,4}-?\d{4}\b/g, '***-****-****')
        .replace(/\b\d{6}-[1-4]\d{6}\b/g, '******-*******');
      if (content !== before) applied.push({ id:'og-006', rule:og006.name, action:og006.action, detail:'전화번호·주민번호 마스킹' });
    }

    // og-007: 반복 루프 감지 (동일 문장 3회↑)
    const og007 = rules.find(r => r.id === 'og-007' && r.enabled);
    if (og007) {
      const sentences = content.split(/(?<=[.!?。])\s+/);
      const cnt = {};
      sentences.forEach(s => { const k=s.trim().toLowerCase(); if(k.length>10) cnt[k]=(cnt[k]||0)+1; });
      if (Object.values(cnt).some(c => c >= 3)) {
        content += '\n\n*\\[가드레일\\] 반복 패턴이 감지되어 응답이 중단되었습니다.*';
        applied.push({ id:'og-007', rule:og007.name, action:og007.action, detail:'동일 문장 3회 이상 반복' });
      }
    }

    return { ...resp, content, guardrailsApplied: applied.length ? applied : undefined };
  } catch { return resp; }
};
