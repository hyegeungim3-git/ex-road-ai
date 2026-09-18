import React, { useState } from 'react';
import { Network, ShieldCheck, Users, ArrowRight, Lock, Unlock, AlertTriangle, CheckCircle2, XCircle, KeyRound, Ban } from 'lucide-react';
import { MOCK_DATA_FLOWS, MOCK_BOUNDARY_POLICY, MOCK_EXTERNAL_ACCESS } from '../mocks.js';
import { PageShell, useToast } from '../common.jsx';

/* ==================================================================
 * 보안 아키텍처 — OT/IT 망 경계와 외부 접근 통제
 * 발주처의 최대 우려("공장·품질 데이터를 AI에 쓰면 어디까지 나가나")에
 * 규칙표가 아니라 '실제 흐름'으로 답하는 화면.
 * ================================================================== */

const RULE = {
  '허용':   { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', Icon: CheckCircle2 },
  '조건부': { cls: 'bg-amber-100 text-amber-700 border-amber-200',       Icon: AlertTriangle },
  '차단':   { cls: 'bg-rose-100 text-rose-700 border-rose-200',          Icon: Ban },
};
const GRADE_CLS = {
  '기밀':   'bg-rose-600',
  '대외비': 'bg-amber-500',
  '내부':   'bg-blue-500',
  '공개':   'bg-slate-400',
};

const TABS = [
  { id: 'flow',   label: '데이터 흐름' },
  { id: 'policy', label: '등급·경계 정책' },
  { id: 'access', label: '외부·협력사 접근' },
];

export const SecurityArchPage = () => {
  const [tab, setTab] = useState('flow');
  const [rows, setRows] = useState(() => MOCK_EXTERNAL_ACCESS.map(r => ({ ...r })));
  const toast = useToast();

  const crossing = MOCK_DATA_FLOWS.filter(f => f.crossing);
  const expired = rows.filter(r => r.status === '만료');
  const noMfa = rows.filter(r => !r.mfa);

  const revoke = (id) => {
    setRows(p => p.map(r => r.id === id ? { ...r, status: '차단됨' } : r));
    toast('외부 계정 접근을 차단했습니다.');
  };

  return (
    <PageShell title="보안 아키텍처" desc="망 경계를 넘는 데이터 흐름과 외부 접근을 한 화면에서 통제합니다">
      {/* 지표 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: '정의된 데이터 흐름', value: `${MOCK_DATA_FLOWS.length}건`, cls: 'text-gray-800' },
          { label: '망 경계 통과 흐름', value: `${crossing.length}건`, cls: 'text-amber-600' },
          { label: '기밀 등급 외부 반출', value: '0건', cls: 'text-emerald-600' },
          { label: '만료·미인증 외부 계정', value: `${expired.length + noMfa.length}건`, cls: expired.length + noMfa.length ? 'text-rose-600' : 'text-emerald-600' },
        ].map(s => (
          <div key={s.label} className="bg-white border rounded-xl px-4 py-3">
            <div className={`text-[18px] font-black ${s.cls}`}>{s.value}</div>
            <div className="text-[11px] text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* 탭 */}
      <div className="flex gap-1 mb-4 border-b">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-[13px] font-bold border-b-2 -mb-px transition-colors ${
              tab === t.id ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── 데이터 흐름 ── */}
      {tab === 'flow' && (
        <div className="space-y-3">
          <p className="text-[12px] text-gray-500">
            망 경계를 넘는 흐름은 <b className="text-amber-600">주황</b>으로 표시됩니다. 경계를 넘는 건에는 반드시 마스킹·단방향 반입 등 통제가 붙습니다.
          </p>
          {MOCK_DATA_FLOWS.map(f => (
            <div key={f.id} className={`bg-white border rounded-xl p-4 ${f.crossing ? 'border-amber-300' : ''}`}>
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className="text-[13px] font-black text-gray-800">{f.name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${GRADE_CLS[f.dataClass] || 'bg-slate-400'}`}>{f.dataClass}</span>
                {f.crossing
                  ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1"><Unlock className="w-3 h-3" />망 경계 통과</span>
                  : <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1"><Lock className="w-3 h-3" />내부망 내 처리</span>}
                <span className="ml-auto text-[11px] text-gray-400">{f.volume}</span>
              </div>
              {/* 흐름 3단 */}
              <div className="flex items-center gap-2 flex-wrap text-[12px]">
                {[{ t: '출발', v: f.source, z: f.zone }, { t: '처리', v: f.processedAt }, { t: '도착', v: f.dest }].map((n, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />}
                    <div className="px-3 py-2 rounded-lg bg-gray-50 border min-w-0">
                      <div className="text-[9px] font-bold text-gray-400 uppercase">{n.t}</div>
                      <div className="font-bold text-gray-700 truncate">{n.v}</div>
                      {n.z && <div className="text-[10px] text-gray-400">{n.z}</div>}
                    </div>
                  </React.Fragment>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <span className="text-[11px] text-gray-600">{f.encryption}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 등급·경계 정책 ── */}
      {tab === 'policy' && (
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-gray-50 border-b">
                  {['데이터 등급', '내부망 처리', '보안 게이트웨이 경유', '외부 직접 전송', '비고'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left font-black text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_BOUNDARY_POLICY.map(p => (
                  <tr key={p.grade} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded text-white mr-1.5 ${GRADE_CLS[p.grade] || 'bg-slate-400'}`}>{p.label}</span>
                      <span className="font-bold text-gray-800">{p.grade}</span>
                    </td>
                    {[p.internal, p.gateway, p.external].map((v, i) => {
                      const r = RULE[v] || RULE['차단'];
                      return (
                        <td key={i} className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${r.cls}`}>
                            <r.Icon className="w-3 h-3" />{v}
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-gray-500">{p.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="px-4 py-3 text-[11px] text-gray-400 border-t bg-gray-50">
            이 표가 가드레일 필터·출력 마스킹 규칙의 근거가 됩니다. 등급 판정은 문서 등록 시 자동 부여되고 담당자가 조정할 수 있습니다.
          </p>
        </div>
      )}

      {/* ── 외부·협력사 접근 ── */}
      {tab === 'access' && (
        <div className="space-y-3">
          {(expired.length > 0 || noMfa.length > 0) && (
            <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-[12px] text-rose-800">
                조치 필요: 기한 만료 <b>{expired.length}건</b>, 2단계 인증 미적용 <b>{noMfa.length}건</b>.
                외부 계정은 만료 후에도 자동 삭제되지 않으므로 주기 점검이 필요합니다.
              </p>
            </div>
          )}
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    {['소속', '계정', '허용 범위', '접근 가능 등급', '유효기한', '2단계 인증', '최근 접근', '상태', ''].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left font-black text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r.id} className={`border-b last:border-0 ${r.status !== '활성' ? 'bg-gray-50/60' : ''}`}>
                      <td className="px-3 py-2.5 font-bold text-gray-800 whitespace-nowrap">{r.org}</td>
                      <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{r.user}</td>
                      <td className="px-3 py-2.5 text-gray-600">{r.scope}</td>
                      <td className="px-3 py-2.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${GRADE_CLS[r.grade] || 'bg-slate-400'}`}>{r.grade}</span>
                      </td>
                      <td className={`px-3 py-2.5 whitespace-nowrap ${r.status === '만료' ? 'text-rose-600 font-bold' : 'text-gray-600'}`}>{r.expires}</td>
                      <td className="px-3 py-2.5">
                        {r.mfa
                          ? <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700"><KeyRound className="w-3 h-3" />적용</span>
                          : <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600"><XCircle className="w-3 h-3" />미적용</span>}
                      </td>
                      <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{r.lastAccess}</td>
                      <td className="px-3 py-2.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          r.status === '활성' ? 'bg-emerald-100 text-emerald-700'
                          : r.status === '만료' ? 'bg-amber-100 text-amber-700' : 'bg-gray-200 text-gray-600'}`}>{r.status}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        {r.status !== '차단됨' && (
                          <button onClick={() => revoke(r.id)}
                            className="text-[11px] font-bold text-rose-600 hover:underline whitespace-nowrap">접근 차단</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-[11px] text-gray-400">
            외부 계정은 내부 직원과 권한 체계가 분리됩니다 — 원본 데이터 접근 없이 허용된 범위만, 유효기한과 2단계 인증이 필수입니다.
          </p>
        </div>
      )}
    </PageShell>
  );
};

export default SecurityArchPage;
