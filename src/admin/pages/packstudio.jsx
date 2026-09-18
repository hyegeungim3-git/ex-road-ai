import React, { useState } from 'react';
import { Layers, Save, Trash2, FileJson, ExternalLink, Palette } from 'lucide-react';
import { PageShell, Modal } from '../common.jsx';
import { DOMAIN_LIST, DOMAINS, CUSTOM_ID, getActiveDomainId, setActiveDomainId, loadCustomPack, saveCustomPack, deleteCustomPack, buildCustomDomain } from '../../domains/index.js';

/* ================================================================== */
/* 도메인 팩 스튜디오 — 기존 팩을 복제해 노코드로 새 발주처 도메인 구성  */
/* 저장: localStorage(roadq.customPack) → 포털 스위처에 4번째 도메인    */
/* 아이콘·함수 필드는 베이스 팩에서 상속 (JSON 직렬화 한계 — 정식 팩    */
/* 승격 시 JSON 내보내기를 src/domains/_template.js 규격으로 옮긴다)    */
/* ================================================================== */

const emptyForm = (baseId) => {
  // 베이스 팩 선택은 정식 팩 한정이 의도 — getDomain() 대신 DOMAINS 직접 참조 (ADR-8 승인 예외: 커스텀 팩 자기참조 순환 방지)
  // 팩 목록은 바뀔 수 있다(삭제된 팩 id가 저장돼 있을 수 있음) — 없으면 첫 정식 팩으로 폴백한다.
  const b = DOMAINS[baseId] || DOMAIN_LIST[0];
  const orch = Array.isArray(b.orchestration) ? b.orchestration : [b.orchestration].filter(Boolean);
  return {
    baseId,
    orgName: '', orgShort: '', platformTitle: '', brandColor: b.brandColor,
    welcome: '', statusBadge: '', footerNote: '',
    user: { name: '', dept: '', title: '' },
    workspaceNames: b.workspaces.map(() => ''),
    suggestions: b.suggestions.map(() => ({ title: '', query: '' })),
    orchestration: orch.map(() => ({ title: '', brief: '' })),
  };
};

/* 저장된 overrides → 폼 상태 (빈 칸 = 베이스 상속) */
const formFromSaved = (saved) => {
  const f = emptyForm(DOMAINS[saved.baseId] ? saved.baseId : DOMAIN_LIST[0].id);
  const ov = saved.overrides || {};
  ['orgName','orgShort','platformTitle','brandColor','welcome','statusBadge','footerNote'].forEach(k => { if (ov[k]) f[k] = ov[k]; });
  if (ov.user) f.user = { ...f.user, ...ov.user };
  (ov.workspaceNames || []).forEach((n, i) => { if (n) f.workspaceNames[i] = n; });
  (ov.suggestions || []).forEach((s, i) => { if (s) f.suggestions[i] = { ...f.suggestions[i], ...s }; });
  (ov.orchestration || []).forEach((o, i) => { if (o) f.orchestration[i] = { ...f.orchestration[i], ...o }; });
  return f;
};

/* 폼 → overrides (빈 문자열 필드는 제외 = 베이스 상속) */
const toOverrides = (f) => {
  const ov = {};
  ['orgName','orgShort','platformTitle','welcome','statusBadge','footerNote'].forEach(k => { if (f[k]?.trim()) ov[k] = f[k].trim(); });
  if (f.brandColor && f.brandColor !== DOMAINS[f.baseId].brandColor) ov.brandColor = f.brandColor;
  const user = {}; ['name','dept','title'].forEach(k => { if (f.user[k]?.trim()) user[k] = f.user[k].trim(); });
  if (Object.keys(user).length) ov.user = user;
  if (f.workspaceNames.some(n => n?.trim())) ov.workspaceNames = f.workspaceNames.map(n => n?.trim() || null);
  if (f.suggestions.some(s => s.title?.trim() || s.query?.trim()))
    ov.suggestions = f.suggestions.map(s => {
      const o = {}; if (s.title?.trim()) o.title = s.title.trim(); if (s.query?.trim()) o.query = s.query.trim();
      return Object.keys(o).length ? o : null;
    });
  if (f.orchestration.some(o => o.title?.trim() || o.brief?.trim()))
    ov.orchestration = f.orchestration.map(o => {
      const x = {}; if (o.title?.trim()) x.title = o.title.trim(); if (o.brief?.trim()) x.brief = o.brief.trim();
      return Object.keys(x).length ? x : null;
    });
  return ov;
};

/* 병합 도메인 → 팩 스키마 JSON (함수·아이콘은 stringify가 자동 제외) */
const exportJson = (saved) => {
  const merged = buildCustomDomain(saved);
  return JSON.stringify({
    _meta: {
      baseId: saved.baseId,
      note: '아이콘·함수 필드는 JSON에서 제외됨 — 정식 팩 승격 시 src/domains/_template.js에 이 값을 옮기고 lucide 아이콘을 지정하라. 스키마: docs/DOMAIN-PACK-GUIDE.md',
    },
    ...merged,
  }, (k, v) => (typeof v === 'function' ? undefined : v), 2);
};

const Field = ({ label, value, onChange, placeholder, wide }) => (
  <label className={`block ${wide ? 'col-span-2' : ''}`}>
    <span className="text-xs text-gray-500 font-medium">{label}</span>
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:border-blue-400 outline-none" />
  </label>
);

export const PackStudioPage = () => {
  const [saved, setSaved] = useState(loadCustomPack);
  const [form, setForm] = useState(() => (loadCustomPack() ? formFromSaved(loadCustomPack()) : emptyForm(DOMAIN_LIST[0].id)));
  const [banner, setBanner] = useState(null);
  const [showJson, setShowJson] = useState(false);
  const base = DOMAINS[form.baseId] || DOMAIN_LIST[0];
  const preview = buildCustomDomain({ baseId: form.baseId, overrides: toOverrides(form) });
  const flash = (msg) => { setBanner(msg); setTimeout(() => setBanner(null), 3500); };
  const set = (patch) => setForm(f => ({ ...f, ...patch }));

  const handleSave = () => {
    const pack = { baseId: form.baseId, overrides: toOverrides(form), savedAt: new Date().toISOString().slice(0, 10) };
    saveCustomPack(pack); setSaved(pack);
    flash('저장됨 — 우상단 [포털 선택] → 도메인 스위처에서 새 도메인을 선택하세요.');
  };
  const handleDelete = () => {
    const wasActiveCustomDomain = getActiveDomainId() === CUSTOM_ID;
    deleteCustomPack(); setSaved(null); setForm(emptyForm(form.baseId));
    if (wasActiveCustomDomain) setActiveDomainId(form.baseId);
    flash('커스텀 도메인이 삭제되었습니다.');
  };

  return (
    <PageShell breadcrumb={['AI 서비스','도메인 팩 스튜디오']} title="도메인 팩 스튜디오"
      sub="기존 도메인을 복제해 새 발주처 데모를 코드 없이 구성합니다 — 빈 칸은 베이스 값을 그대로 사용">
      {banner && <div className="mb-4 px-4 py-2.5 rounded-lg bg-blue-50 border border-blue-200 text-sm font-medium text-blue-700">{banner}</div>}

      <div className="grid grid-cols-3 gap-5">
        {/* ── 편집 폼 ── */}
        <div className="col-span-2 space-y-5">
          <div className="bg-white rounded-xl border shadow-sm p-5">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Layers size={15} className="text-blue-600"/>베이스 팩 · 기본 정보</h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs text-gray-500 font-medium">베이스 도메인 (복제 원본)</span>
                <select value={form.baseId} onChange={e => setForm(formFromSaved({ baseId: e.target.value, overrides: toOverrides(form) }))}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-white">
                  {DOMAIN_LIST.map(d => <option key={d.id} value={d.id}>{d.orgName} ({d.id})</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-gray-500 font-medium flex items-center gap-1"><Palette size={11}/>브랜드 컬러</span>
                <div className="mt-1 flex items-center gap-2">
                  <input type="color" value={form.brandColor} onChange={e => set({ brandColor: e.target.value })} className="h-9 w-14 border rounded cursor-pointer" />
                  <span className="text-sm font-mono text-gray-500">{form.brandColor}</span>
                </div>
              </label>
              <Field label="조직명" value={form.orgName} onChange={v => set({ orgName: v })} placeholder={base.orgName} />
              <Field label="약칭 (영문)" value={form.orgShort} onChange={v => set({ orgShort: v })} placeholder={base.orgShort} />
              <Field label="플랫폼명" value={form.platformTitle} onChange={v => set({ platformTitle: v })} placeholder={base.platformTitle} wide />
              <Field label="환영 문구" value={form.welcome} onChange={v => set({ welcome: v })} placeholder={base.welcome} wide />
              <Field label="상태 배지" value={form.statusBadge} onChange={v => set({ statusBadge: v })} placeholder={base.statusBadge} wide />
              <Field label="푸터 문구" value={form.footerNote} onChange={v => set({ footerNote: v })} placeholder={base.footerNote} wide />
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-5">
            <h3 className="font-bold text-sm mb-3">사용자 페르소나 · 워크스페이스</h3>
            <div className="grid grid-cols-3 gap-3">
              <Field label="이름" value={form.user.name} onChange={v => set({ user: { ...form.user, name: v } })} placeholder={base.user.name} />
              <Field label="부서" value={form.user.dept} onChange={v => set({ user: { ...form.user, dept: v } })} placeholder={base.user.dept} />
              <Field label="직급" value={form.user.title} onChange={v => set({ user: { ...form.user, title: v } })} placeholder={base.user.title} />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3">
              {form.workspaceNames.map((n, i) => (
                <Field key={i} label={`워크스페이스 ${i + 1}`} value={n} onChange={v => set({ workspaceNames: form.workspaceNames.map((x, j) => j === i ? v : x) })} placeholder={base.workspaces[i]?.name} />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-5">
            <h3 className="font-bold text-sm mb-3">제안 카드 (일반 채팅 첫 화면)</h3>
            <div className="space-y-3">
              {form.suggestions.map((s, i) => (
                <div key={i} className="grid grid-cols-3 gap-3">
                  <Field label={`카드 ${i + 1} 제목`} value={s.title} onChange={v => set({ suggestions: form.suggestions.map((x, j) => j === i ? { ...x, title: v } : x) })} placeholder={base.suggestions[i]?.title} />
                  <label className="block col-span-2">
                    <span className="text-xs text-gray-500 font-medium">질의문</span>
                    <input value={s.query} onChange={e => set({ suggestions: form.suggestions.map((x, j) => j === i ? { ...x, query: e.target.value } : x) })} placeholder={base.suggestions[i]?.query}
                      className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:border-blue-400 outline-none" />
                  </label>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">※ 질의문을 바꾸면 답변(sampleAnswers)은 베이스 것이 매칭되지 않을 수 있음 — 정식 팩 승격 시 답변도 함께 작성</p>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-5">
            <h3 className="font-bold text-sm mb-3">오케스트레이션 시나리오 제목</h3>
            <div className="space-y-3">
              {form.orchestration.map((o, i) => {
                const bo = (Array.isArray(base.orchestration) ? base.orchestration : [base.orchestration])[i];
                return (
                  <div key={i} className="grid grid-cols-3 gap-3">
                    <Field label={`시나리오 ${i + 1} 제목`} value={o.title} onChange={v => set({ orchestration: form.orchestration.map((x, j) => j === i ? { ...x, title: v } : x) })} placeholder={bo?.title} />
                    <label className="block col-span-2">
                      <span className="text-xs text-gray-500 font-medium">설명 (카드·헤더)</span>
                      <input value={o.brief} onChange={e => set({ orchestration: form.orchestration.map((x, j) => j === i ? { ...x, brief: e.target.value } : x) })} placeholder={bo?.brief}
                        className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:border-blue-400 outline-none" />
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── 미리보기 + 액션 ── */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border shadow-sm p-5">
            <h3 className="font-bold text-sm mb-3">미리보기</h3>
            <div className="rounded-xl border p-4 flex flex-col items-center text-center" style={{ borderColor: `${preview.brandColor}55` }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md mb-2" style={{ backgroundColor: preview.brandColor }}>
                <span className="text-lg font-black text-white">{(preview.orgShort || 'G')[0]}</span>
              </div>
              <div className="text-sm font-black" style={{ color: preview.brandColor }}>{preview.orgShort}</div>
              <div className="text-sm font-bold text-gray-800">{preview.platformTitle}</div>
              <div className="text-xs text-gray-400 mt-1">{preview.user.name} {preview.user.title} · {preview.user.dept}</div>
            </div>
            <div className="mt-3 space-y-1">
              {preview.suggestions.map((s, i) => (
                <div key={i} className="text-xs text-gray-500 truncate">· {s.title}</div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-5 space-y-2">
            <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700">
              <Save size={15}/> 저장 (포털에 4번째 도메인 등록)
            </button>
            <button onClick={() => setShowJson(true)} disabled={!saved && !preview}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-bold text-gray-600 hover:bg-gray-50">
              <FileJson size={15}/> 팩 JSON 미리보기·내보내기
            </button>
            {saved && (
              <button onClick={handleDelete} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-200 text-sm font-bold text-red-600 hover:bg-red-50">
                <Trash2 size={15}/> 커스텀 도메인 삭제
              </button>
            )}
            <p className="text-xs text-gray-400 pt-1 flex items-start gap-1"><ExternalLink size={11} className="mt-0.5 shrink-0"/>저장 후 상단 [포털 선택] 버튼 → 우상단 도메인 스위처에서 선택하면 즉시 시연 가능합니다.</p>
          </div>
        </div>
      </div>

      <Modal isOpen={showJson} onClose={() => setShowJson(false)} title="팩 JSON (DOMAIN-PACK-GUIDE 스키마)" size="lg">
        <textarea readOnly value={exportJson({ baseId: form.baseId, overrides: toOverrides(form) })}
          className="w-full h-96 border rounded-lg p-3 text-xs font-mono bg-gray-50" data-testid="pack-json" />
        <div className="flex justify-end mt-3">
          <button onClick={() => {
            const blob = new Blob([exportJson({ baseId: form.baseId, overrides: toOverrides(form) })], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `roadq-pack-${(form.orgShort || 'custom').toLowerCase()}.json`;
            a.click(); URL.revokeObjectURL(a.href);
          }} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700">JSON 파일 다운로드</button>
        </div>
      </Modal>
    </PageShell>
  );
};
