const NORMALIZE_PATTERN = /[^\p{L}\p{N}]+/gu;

function normalize(value = '') {
  return String(value).toLowerCase().replace(NORMALIZE_PATTERN, ' ').trim();
}

function tokens(value = '') {
  return normalize(value).split(/\s+/).filter(token => token.length > 1);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function matchScore(question, candidate) {
  const normalizedCandidate = normalize(candidate);
  if (!normalizedCandidate) return 0;
  if (question.includes(normalizedCandidate)) return 6;

  const questionTokens = new Set(tokens(question));
  return tokens(normalizedCandidate).reduce(
    (score, token) => score + (questionTokens.has(token) ? 2 : question.includes(token) ? 1 : 0),
    0,
  );
}

function nodeScore(question, node) {
  const candidates = [node.label, node.type, ...(node.aliases || []), ...(node.keywords || [])];
  return candidates.reduce((score, candidate) => score + matchScore(question, candidate), 0);
}

function resolveIntent(pack, question) {
  return (pack.queryIntents || [])
    .map(intent => ({
      intent,
      score: (intent.keywords || []).reduce(
        (score, keyword) => score + matchScore(question, keyword),
        0,
      ),
    }))
    .sort((a, b) => b.score - a.score)[0];
}

function buildAdjacency(pack) {
  const adjacency = new Map();
  const add = (from, to, relation, edge, reversed = false) => {
    const links = adjacency.get(from) || [];
    links.push({ from, to, relation, edge, reversed });
    adjacency.set(from, links);
  };

  for (const edge of pack.edges || []) {
    add(edge.from, edge.to, edge.label || edge.relation, edge);
    add(edge.to, edge.from, edge.inverseLabel || edge.label || edge.relation, edge, true);
  }
  return adjacency;
}

function shortestPath(adjacency, fromId, toId, maxDepth) {
  if (fromId === toId) return { nodeIds: [fromId], links: [] };
  const queue = [{ nodeId: fromId, nodeIds: [fromId], links: [] }];
  const visited = new Set([fromId]);

  while (queue.length) {
    const current = queue.shift();
    if (current.links.length >= maxDepth) continue;

    for (const link of adjacency.get(current.nodeId) || []) {
      if (visited.has(link.to)) continue;
      const next = {
        nodeId: link.to,
        nodeIds: [...current.nodeIds, link.to],
        links: [...current.links, link],
      };
      if (link.to === toId) return next;
      visited.add(link.to);
      queue.push(next);
    }
  }
  return null;
}

function collectPaths(pack, focusNodeIds, maxDepth, maxPaths) {
  const adjacency = buildAdjacency(pack);
  const paths = [];
  const signatures = new Set();
  const addPath = path => {
    if (!path || path.nodeIds.length < 2) return;
    const signature = path.nodeIds.join('>');
    if (signatures.has(signature)) return;
    signatures.add(signature);
    paths.push(path);
  };

  for (let i = 0; i < focusNodeIds.length && paths.length < maxPaths; i += 1) {
    for (let j = i + 1; j < focusNodeIds.length && paths.length < maxPaths; j += 1) {
      addPath(shortestPath(adjacency, focusNodeIds[i], focusNodeIds[j], maxDepth));
    }
  }

  if (paths.length === 0) {
    for (const focusNodeId of focusNodeIds) {
      if (paths.length >= maxPaths) break;
      for (const link of adjacency.get(focusNodeId) || []) {
        addPath({ nodeIds: [focusNodeId, link.to], links: [link] });
        if (paths.length >= maxPaths) break;
      }
    }
  }

  return paths;
}

function evidenceScore(evidenceId, focusNodeIds, paths, pack) {
  let score = 70;
  const focusNodes = (pack.nodes || []).filter(node => focusNodeIds.includes(node.id));
  if (focusNodes.some(node => (node.evidenceRefs || []).includes(evidenceId))) score += 15;
  if (paths.some(path => path.links.some(link => (link.edge.evidenceRefs || []).includes(evidenceId)))) score += 10;
  return Math.min(score, 98);
}

/**
 * Domain-neutral deterministic graph retrieval for the RoadQ demo.
 * Production replacement point: call an on-prem Graph RAG/MCP service and
 * return the same result contract used by KnowledgeAgent.
 */
export function queryOntology(pack, question, options = {}) {
  if (!pack?.nodes?.length || !pack?.edges?.length) return null;

  const hasKnowledgeBaseScope = Array.isArray(options.allowedKbIds);
  const allowedKbIds = hasKnowledgeBaseScope ? new Set(options.allowedKbIds) : null;
  const scopedEvidence = hasKnowledgeBaseScope
    ? (pack.evidence || []).filter(item => allowedKbIds.has(item.kbId))
    : (pack.evidence || []);
  const scopedEvidenceIds = new Set(scopedEvidence.map(item => item.id));
  const scopeEvidenceRefs = refs => hasKnowledgeBaseScope
    ? (refs || []).filter(id => scopedEvidenceIds.has(id))
    : (refs || []);
  const scopedPack = {
    ...pack,
    evidence: scopedEvidence,
    nodes: pack.nodes.map(node => ({ ...node, evidenceRefs: scopeEvidenceRefs(node.evidenceRefs) })),
    edges: pack.edges
      .map(edge => ({ ...edge, evidenceRefs: scopeEvidenceRefs(edge.evidenceRefs) }))
      .filter((edge, index) => !(pack.edges[index].evidenceRefs || []).length || edge.evidenceRefs.length),
    queryIntents: (pack.queryIntents || []).map(intent => ({
      ...intent,
      evidenceRefs: scopeEvidenceRefs(intent.evidenceRefs),
    })),
  };
  const normalizedQuestion = normalize(question);
  const intentMatch = resolveIntent(scopedPack, normalizedQuestion);
  const intent = intentMatch?.score > 0 ? intentMatch.intent : null;
  const rankedNodes = scopedPack.nodes
    .map(node => ({ node, score: nodeScore(normalizedQuestion, node) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const focusNodeIds = unique(
    intent?.focusNodeIds?.length
      ? intent.focusNodeIds
      : rankedNodes.slice(0, 4).map(item => item.node.id),
  ).filter(id => scopedPack.nodes.some(node => node.id === id));
  const fallbackFocus = focusNodeIds.length ? focusNodeIds : scopedPack.nodes.slice(0, 3).map(node => node.id);
  const paths = collectPaths(
    scopedPack,
    fallbackFocus,
    options.maxDepth || pack.maxDepth || 3,
    options.maxPaths || 4,
  );

  const nodeById = new Map(scopedPack.nodes.map(node => [node.id, node]));
  const evidenceIds = unique([
    ...(intent?.evidenceRefs || []),
    ...(!intent ? fallbackFocus.flatMap(id => nodeById.get(id)?.evidenceRefs || []) : []),
    ...paths.flatMap(path => path.links.flatMap(link => link.edge.evidenceRefs || [])),
  ]);
  const evidence = evidenceIds
    .map(id => scopedPack.evidence.find(item => item.id === id))
    .filter(Boolean)
    .map(item => ({
      ...item,
      score: evidenceScore(item.id, fallbackFocus, paths, scopedPack),
    }))
    .sort((a, b) => b.score - a.score);

  const pathEdges = paths.flatMap(path => path.links);
  const supportedEdges = pathEdges.filter(link => (link.edge.evidenceRefs || []).length > 0).length;
  const evidenceCoverage = pathEdges.length ? Math.round((supportedEdges / pathEdges.length) * 100) : 0;

  return {
    label: pack.label,
    version: pack.version,
    statusLabel: pack.statusLabel,
    notice: pack.notice,
    summary: evidence.length
      ? (intent?.summary || pack.defaultSummary)
      : '선택한 지식베이스 범위에서 이 관계를 뒷받침하는 근거를 찾지 못했습니다. 검색 범위와 접근 권한을 확인하세요.',
    intentLabel: intent?.label || '연관 개념 탐색',
    matchedNodes: fallbackFocus.map(id => nodeById.get(id)).filter(Boolean),
    paths: paths.map((path, index) => ({
      id: `path-${index + 1}`,
      nodes: path.nodeIds.map(id => nodeById.get(id)).filter(Boolean),
      relations: path.links.map(link => link.relation),
      evidenceRefs: unique(path.links.flatMap(link => link.edge.evidenceRefs || [])),
    })),
    evidence,
    stats: {
      searchedNodes: scopedPack.nodes.length,
      searchedEdges: scopedPack.edges.length,
      matchedNodes: fallbackFocus.length,
      pathCount: paths.length,
      evidenceCoverage,
    },
  };
}
