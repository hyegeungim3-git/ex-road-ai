#!/usr/bin/env node
/**
 * Cloudflare Pages 배포 (GitHub Pages와 별개 채널).
 *
 * 왜 이 스크립트가 필요한가:
 *  1) 이 저장소 경로(C:\한국부동산원)는 한글이라 로컬 `vite build`가 조용히 죽는다.
 *     → ASCII 임시 경로로 복사한 뒤 그곳에서 빌드한다 (CLAUDE.md §4 참조).
 *  2) Cloudflare Pages는 루트에서 서빙하므로 base가 '/' 여야 한다 (GitHub Pages는 '/agentq-platform/').
 *     → VITE_BASE=/ 로 덮어쓴다.
 *
 * 사용: npm run deploy:cf
 * 전제: wrangler 로그인(`npx wrangler login`) + Pages 프로젝트 agentq-platform 존재
 */
import { spawnSync } from 'node:child_process'
import { existsSync, rmSync } from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const PROJECT = 'agentq-platform'
const repo = path.resolve(import.meta.dirname, '..')
const work = path.join(os.tmpdir(), 'agentq-cf')

const run = (cmd, args, opts = {}) => {
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: true, ...opts })
  return r.status ?? 1
}

if (existsSync(work)) rmSync(work, { recursive: true, force: true })

// robocopy 종료코드 0~7은 정상(8 이상이 실패). /XD는 절대경로여야 node_modules/vite/dist가 살아남는다.
const rc = run('robocopy', [
  `"${repo}"`, `"${work}"`, '/E',
  '/XD', `"${path.join(repo, '.git')}"`, `"${path.join(repo, 'dist')}"`,
  '/NFL', '/NDL', '/NJH', '/NJS', '/NC', '/NS',
])
if (rc >= 8) { console.error(`robocopy 실패 (exit ${rc})`); process.exit(1) }

const build = run('node', ['node_modules/vite/bin/vite.js', 'build'], {
  cwd: work,
  env: { ...process.env, VITE_BASE: '/' },
})
if (build !== 0) { console.error(`빌드 실패 (exit ${build})`); process.exit(1) }

const deploy = run('npx', [
  '--yes', 'wrangler@latest', 'pages', 'deploy', 'dist',
  '--project-name', PROJECT, '--branch', 'main', '--commit-dirty=true',
], { cwd: work })
if (deploy !== 0) { console.error(`배포 실패 (exit ${deploy})`); process.exit(1) }

console.log(`\n✅ https://${PROJECT}.pages.dev/`)
