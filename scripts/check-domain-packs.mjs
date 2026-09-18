import { AGENT_TEAMS } from '../src/user/data/constants.js'
import { DOMAINS, DOMAIN_LIST } from '../src/domains/index.js'

const EXPECTED_DOMAIN_IDS = ['expressway']
const errors = []

function check(condition, message) {
  if (!condition) errors.push(message)
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

const domainIds = Object.keys(DOMAINS)
const listedIds = DOMAIN_LIST.map(domain => domain.id)
const agentIds = AGENT_TEAMS.map(agent => agent.id)
const agentIdSet = new Set(agentIds)

check(domainIds.length === EXPECTED_DOMAIN_IDS.length, `도메인 수가 ${EXPECTED_DOMAIN_IDS.length}개가 아닙니다.`)
check(new Set(domainIds).size === domainIds.length, '도메인 id가 중복되었습니다.')
check(new Set(listedIds).size === listedIds.length, 'DOMAIN_LIST의 도메인 id가 중복되었습니다.')
check(EXPECTED_DOMAIN_IDS.every(id => DOMAINS[id]), '필수 도메인 팩이 누락되었습니다.')
check(domainIds.every(id => listedIds.includes(id)), 'DOMAINS와 DOMAIN_LIST가 일치하지 않습니다.')
check(agentIds.length === 13, `기본 agent 수가 13개가 아닙니다: ${agentIds.length}`)
check(agentIdSet.size === agentIds.length, '기본 agent id가 중복되었습니다.')

for (const [id, domain] of Object.entries(DOMAINS)) {
  const prefix = `[${id}]`
  check(domain.id === id, `${prefix} registry key와 domain.id가 다릅니다.`)
  check(isNonEmptyString(domain.orgName), `${prefix} orgName이 비어 있습니다.`)
  check(isNonEmptyString(domain.platformTitle), `${prefix} platformTitle이 비어 있습니다.`)
  check(isNonEmptyString(domain.brandColor), `${prefix} brandColor가 비어 있습니다.`)
  check(Array.isArray(domain.workspaces) && domain.workspaces.length > 0, `${prefix} workspaces가 비어 있습니다.`)
  check(Array.isArray(domain.suggestions) && domain.suggestions.length > 0, `${prefix} suggestions가 비어 있습니다.`)
  check(Array.isArray(domain.orchestration), `${prefix} orchestration은 배열이어야 합니다.`)

  const workspaceIds = (domain.workspaces || []).map(workspace => workspace.id)
  check(new Set(workspaceIds).size === workspaceIds.length, `${prefix} workspace id가 중복되었습니다.`)
  for (const workspace of domain.workspaces || []) {
    check(isNonEmptyString(workspace.id) && isNonEmptyString(workspace.name), `${prefix} workspace id/name이 비어 있습니다.`)
  }

  for (const suggestion of domain.suggestions || []) {
    check(isNonEmptyString(suggestion.title) && isNonEmptyString(suggestion.query), `${prefix} suggestion title/query가 비어 있습니다.`)
  }

  for (const scenario of domain.orchestration || []) {
    check(isNonEmptyString(scenario.title), `${prefix} orchestration title이 비어 있습니다.`)
    check(Array.isArray(scenario.stages) && scenario.stages.length > 0, `${prefix} orchestration stages가 비어 있습니다.`)
    for (const stage of scenario.stages || []) {
      check(agentIdSet.has(stage.agentId), `${prefix} 알 수 없는 orchestration agentId: ${stage.agentId}`)
    }
  }

  for (const overrideId of Object.keys(domain.agentCatalog || {})) {
    check(agentIdSet.has(overrideId), `${prefix} 알 수 없는 agentCatalog id: ${overrideId}`)
  }
}

if (errors.length > 0) {
  console.error(`Domain pack validation failed (${errors.length})`)
  for (const error of errors) console.error(`- ${error}`)
  process.exitCode = 1
} else {
  console.log(`Domain pack validation passed: ${domainIds.length} domains, ${agentIds.length} agents`)
}
