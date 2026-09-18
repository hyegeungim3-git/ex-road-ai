import expressway from '../src/domains/expressway.js';
import { queryOntology } from '../src/user/ontologyGraph.js';

const pack = expressway.agentContent?.['agent-knowledge']?.ontologyPack;
const errors = [];
const assert = (condition, message) => {
  if (!condition) errors.push(message);
};
const duplicateIds = items => {
  const seen = new Set();
  return items.map(item => item.id).filter(id => seen.has(id) || !seen.add(id));
};

assert(pack, 'expressway agent-knowledge ontologyPack is required');

if (pack) {
  const nodes = pack.nodes || [];
  const edges = pack.edges || [];
  const evidence = pack.evidence || [];
  const intents = pack.queryIntents || [];
  const nodeIds = new Set(nodes.map(node => node.id));
  const evidenceIds = new Set(evidence.map(item => item.id));

  assert(nodes.length > 0, 'ontologyPack.nodes must not be empty');
  assert(edges.length > 0, 'ontologyPack.edges must not be empty');
  assert(evidence.length > 0, 'ontologyPack.evidence must not be empty');
  assert(intents.length > 0, 'ontologyPack.queryIntents must not be empty');
  assert(duplicateIds(nodes).length === 0, 'ontologyPack.nodes contains duplicate ids');
  assert(duplicateIds(edges).length === 0, 'ontologyPack.edges contains duplicate ids');
  assert(duplicateIds(evidence).length === 0, 'ontologyPack.evidence contains duplicate ids');
  assert(duplicateIds(intents).length === 0, 'ontologyPack.queryIntents contains duplicate ids');

  for (const node of nodes) {
    assert(node.id && node.label && node.type, `node ${node.id || '(missing id)'} requires id, label, and type`);
    for (const evidenceRef of node.evidenceRefs || []) {
      assert(evidenceIds.has(evidenceRef), `node ${node.id} references missing evidence ${evidenceRef}`);
    }
  }

  for (const edge of edges) {
    assert(nodeIds.has(edge.from), `edge ${edge.id} references missing from node ${edge.from}`);
    assert(nodeIds.has(edge.to), `edge ${edge.id} references missing to node ${edge.to}`);
    assert(edge.label, `edge ${edge.id} requires label`);
    for (const evidenceRef of edge.evidenceRefs || []) {
      assert(evidenceIds.has(evidenceRef), `edge ${edge.id} references missing evidence ${evidenceRef}`);
    }
  }

  for (const item of evidence) {
    assert(item.kbId && item.title && item.source && item.excerpt, `evidence ${item.id} is missing display fields`);
    assert(Number.isFinite(item.page), `evidence ${item.id} page must be a number`);
    assert(['O', 'S', 'C'].includes(item.secLevel), `evidence ${item.id} has invalid secLevel`);
  }

  for (const intent of intents) {
    for (const nodeId of intent.focusNodeIds || []) {
      assert(nodeIds.has(nodeId), `intent ${intent.id} references missing node ${nodeId}`);
    }
    for (const evidenceRef of intent.evidenceRefs || []) {
      assert(evidenceIds.has(evidenceRef), `intent ${intent.id} references missing evidence ${evidenceRef}`);
    }
  }

  const scenarios = [
    {
      query: '돌발상황 검지와 VMS 경보 송출 기준',
      intentId: 'intent-incident',
      nodeLabels: ['돌발상황 검지', '2차사고 위험도'],
      evidenceIds: ['ev-incident-manual', 'ev-vms-criteria'],
    },
    {
      query: 'VDS 결측률 관리 임계와 정비 조치',
      intentId: 'intent-quality',
      nodeLabels: ['결측률', '차량검지기(VDS)'],
      evidenceIds: ['ev-quality-rule', 'ev-device-maint'],
    },
    {
      query: '속도 예측 모델 드리프트와 재학습',
      intentId: 'intent-forecast',
      nodeLabels: ['구간 속도 예측 모델', '구간 속도 시계열'],
      evidenceIds: ['ev-survey-guide'],
    },
    {
      query: '교량 계측 변위와 정밀안전진단 기준',
      intentId: 'intent-structure',
      nodeLabels: ['교량 계측(신축이음·가속도)', '정밀안전진단'],
      evidenceIds: ['ev-structure-criteria'],
    },
  ];

  for (const scenario of scenarios) {
    const result = queryOntology(pack, scenario.query, { allowedKbIds: ['kb1', 'kb2', 'kb3', 'kb4'] });
    assert(result, `query returned no result: ${scenario.query}`);
    assert(result?.intentLabel === intents.find(intent => intent.id === scenario.intentId)?.label, `query resolved wrong intent: ${scenario.query}`);
    assert(result?.stats.pathCount > 0, `query returned no relation path: ${scenario.query}`);
    assert(result?.stats.evidenceCoverage === 100, `query has incomplete evidence coverage: ${scenario.query}`);
    for (const label of scenario.nodeLabels) {
      assert(result?.matchedNodes.some(node => node.label === label), `query missed node ${label}: ${scenario.query}`);
    }
    for (const id of scenario.evidenceIds) {
      assert(result?.evidence.some(item => item.id === id), `query missed evidence ${id}: ${scenario.query}`);
    }
  }

  // 지식베이스 범위를 좁히면 그 범위 밖 근거로만 지지되는 경로는 답이 되면 안 된다
  const filtered = queryOntology(pack, '교량 계측 변위와 정밀안전진단 기준', { allowedKbIds: ['kb1'] });
  assert(filtered?.evidence.length === 0, 'knowledge-base filter must exclude evidence outside the selected scope');
  assert(filtered?.paths.length === 0, 'knowledge-base filter must exclude relation paths supported only outside the selected scope');
  assert(filtered?.summary.includes('근거를 찾지 못했습니다'), 'empty knowledge-base scope must not return an unsupported answer');
}

if (errors.length) {
  console.error(`Ontology graph check failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Ontology graph check passed: ${pack.nodes.length} nodes, ${pack.edges.length} edges, ${pack.evidence.length} evidence records`);
