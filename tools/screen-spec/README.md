# screen-spec-tool — 화면설계서 자동 생성 도구

프로토타입의 전 화면을 헤드리스 크롬으로 자동 캡처하고, 화면설계서 PPTX를 생성한다.
방법론 정본: `~/.claude/skills/screen-spec/SKILL.md` (/screen-spec 스킬)

## 구성

| 파일 | 역할 |
|---|---|
| `screens-common.mjs` | 1차·2차 공통 화면 정의 — 기능 명세({label, desc, sel})·CRUD 포함 |
| `manifest.mjs` / `manifest-p2.mjs` | 트랙별 정본 — 대상(target) 지정 + 2차 오버라이드·전용 화면 |
| `capture.mjs` | 범용 캡처 러너 — 풀페이지/모달 캡처 + **기능 셀렉터 좌표 자동 측정**(번호 마커용) |
| `gen_spec_pptx.py` | 범용 문서 생성기 — 표지·개요·목록·화면별 슬라이드(**번호 마커·기능 명세·CRUD**)·모바일 부록 |
| `captures/` | 산출물 (desktop/, mobile/, manifest.json, _pptx_crops/) |

기능 sel 규칙: CSS 셀렉터 또는 `text:버튼문구`. 캡처 로그 `(마커 k/n)`으로 측정률 확인.

## 사용

```bash
# 전제: 대상 프로토타입 서버 실행 중 (매니페스트의 baseUrl)
node capture.mjs all [매니페스트=./manifest.mjs] [출력폴더=captures]
python gen_spec_pptx.py [캡처폴더=captures] [출력.pptx]

# 이 프로젝트 (1차 MVP + 2차 확장, 트랙별 문서)
node capture.mjs all ./manifest.mjs captures
node capture.mjs all ./manifest-p2.mjs captures-p2
python gen_spec_pptx.py captures    "../내아이설명서_화면설계서_1차_YYYYMMDD.pptx"
python gen_spec_pptx.py captures-p2 "../내아이설명서_화면설계서_2차확장_YYYYMMDD.pptx"
```

## 생성 후 검수 (필수)

1. read-back: 슬라이드 수·화면별 3표(메타/Description/CRUD)·폰트
2. PowerPoint COM으로 위험 슬라이드(기능 최다·최장 페이지·모달·부록) PNG export → 눈 확인
3. 발견 → **매니페스트/생성기 수정** → 재생성 (문서 직접 수정 금지 — 재생성 시 소실)

## 프로토타입이 바뀌었을 때

1. 화면 추가/변경 시 `manifest.mjs`만 갱신 (새 화면 = 항목 추가, 설명 변경 = desc 수정)
2. 위 두 명령 재실행 → 문서 최신화 (약 2분)

## 다른 프로젝트에 적용

폴더째 복사 → `manifest.mjs`의 target(baseUrl·계정)과 screens 배열을 새 프로토타입에 맞게 재작성.
capture.mjs·gen_spec_pptx.py는 수정 없이 재사용.

## 주의 (내장 해결책)

- 첫 방문 투어 팝업: `scon_tour_seen` 선주입으로 억제 — 다른 앱이면 해당 키로 교체
- setup으로 생성한 데이터(공유 등)는 cleanup으로 삭제해 데모 상태 원복
- 캡처 실패 시 exit code 1 — setup 셀렉터가 화면 변경으로 깨졌는지 먼저 확인

---

## RoadQ 이관 메모 (2026-09-18)

이 파이프라인(`capture.mjs` → `gen_spec_pptx.py`)은 그대로 쓸 수 있으나, **화면 정본인 `manifest.mjs`는
포크 원본(제조 분야)용이라 삭제했다.** 화면설계서를 만들 때 RoadQ 화면 구성(포털 / 사용자 포털 4탭:
일반·에이전트·**데이터**·보안 / 관리자 61메뉴)에 맞춰 새로 작성할 것.
manifest 스키마는 `capture.mjs`가 읽는 필드(`screens[].id/route/desc/markers`)를 따른다.
