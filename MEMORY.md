# Bless My Baby — 만들기 기록

## 기획 (2026-06-21)

**무엇을 / 누구를 위해**
방문자(학부모)가 아이 사진을 올리면 신체 부위 한글·영어 라벨이 있는 브로마이드를 자동으로 만들어 A3 600DPI 고해상도로 다운로드하거나 이메일로 받는 웹앱. 특정 지인·가족에게 먼저 보여줄 목적으로 시작한다.

**왜 이렇게 정했나 — 현재 방식의 고통점**
ex1.png 같은 브로마이드(나의 몸 / MY BODY)를 직접 만들려면 Photoshop이나 그래픽 도구가 필요하고, 예시 사진에서 얼굴을 교체하는 과정이 복잡하다. 부모 입장에서는 그냥 사진 몇 장 올리면 바로 나왔으면 하는 니즈가 분명하다.

**갈대상자 컨셉이 아니라 신체 교육 브로마이드**
참고 이미지(ex1.png)는 실사 아이 사진 위에 머리/head, 눈/eye, 어깨/shoulder 등 신체 부위 이름이 한글·영어로 동시 표기된 A5~A4 사이즈 브로마이드다. 날짜·키·몸무게도 하단에 표기 가능한 형태. 결과물 스타일이 사진+라벨 오버레이 방식임을 확인하고 기획에 반영했다.

**얼굴 합성 방식 결정**
AI API 기반 face swap(Replicate 등)은 방문자 1회당 소액 API 비용이 발생하므로, Canvas/sharp 기반의 서버사이드 합성 방식으로 결정했다. 구체적으로:
- face-api.js: 브라우저에서 얼굴 위치·크기 감지 (무료, 오프라인)
- @imgly/background-removal: 브라우저에서 배경 제거해 얼굴만 분리 (무료)
- sharp: 서버사이드에서 얼굴 이미지를 템플릿에 합성, A3 600DPI PNG 출력
단점: AI face swap에 비해 자연스러움이 다소 떨어질 수 있지만, 비용 제로로 무제한 사용 가능하다. 사용자가 "비용 없이"를 명확하게 선택했다.

**템플릿 수 결정**
처음에 봄/여름/가을 3종 템플릿을 제안했으나, 사용자가 1종으로 단순하게 시작하기로 결정. MVP의 핵심 가치 검증 후 템플릿 다양화는 다음 버전으로 미룬다.

**고해상도 출력 요구사항**
A3(297×420mm)에서 600DPI = 7016×9922픽셀. 파일 크기가 크므로:
- 다운로드: PNG 원본 (600DPI)
- 이메일: 압축 JPEG 버전 별도 생성 (~5-10MB)

**이메일 발송**
Resend API 사용 (무료 tier: 월 3,000통). 다운로드와 이메일 동시 진행 가능.

**고민하다 버린 선택지**
- 멀티 템플릿(3종): 복잡도 증가, MVP에선 1종으로 단순화
- AI face swap (Replicate): 비용 발생 → Canvas 합성으로 대체
- 키/몸무게 기록: 사용자가 불필요하다고 판단, 제외
- DB 테이블: 이미지만 임시 저장하므로 Supabase Storage만으로 충분

## 연결 (2026-06-21)

**스택·배포 연결 순서**
1. Stitch zip → design/ 폴더 정리 (mobile_1=결과화면, mobile_2=입력화면)
2. npx create-next-app@latest (TypeScript·Tailwind·App Router)
3. shadcn/ui init + button·card·input·label·select·textarea·table·badge 설치
4. globals.css: PLAN.md 디자인 토큰 → oklch 변환 후 :root 변수에 적용
5. layout.tsx: Noto Sans KR 폰트 설정 (Geist 대체)
6. git init → gh repo create bless-my-baby --public --push
7. vercel link → GitHub 자동 연결됨 (이미 기존 프로젝트에서 Vercel GitHub App 설치돼 있어서 바로 성공)
8. Supabase: vercel integration add 실패 ("Cannot install more than one integration at a time") → 기존 handong-donor-wall 프로젝트와 같은 Supabase 프로젝트(zbxnadgqarloklefhrph) 공유하기로 결정. bless-my-baby는 Storage 버킷(bromides)만 쓰고 테이블 없어서 충돌 없음
9. .env.local에 Supabase URL/anon key/service role key 설정
10. Vercel env vars 등록 (production·preview·development 3개 환경)
11. lib/supabase.ts 생성 (anon 클라이언트 + service role admin 클라이언트 분리)

**막힌 설정과 해결**
- **shadcn init 멈춤**: `--yes` 플래그로 실행했을 때 "Installing dependencies." 단계에서 수 분간 응답 없음. 이 단계는 npm 패키지 네트워크 다운로드 시간이므로 기다리면 완료됨 (실제로 2-3분 후 정상 완료).
- **Supabase 인테그레이션 중복 오류**: Vercel CLI `vercel integration add supabase` → "Cannot install more than one integration at a time" 오류. 기존 handong-donor-wall 프로젝트의 Supabase 통합이 이미 팀 계정에 활성화돼 있어서 발생. 해결: 기존 Supabase 프로젝트 자격증명을 그대로 재사용. 두 앱이 같은 DB 프로젝트를 쓰지만 서로 다른 테이블/버킷을 쓰므로 충돌 없음.
- **git commit 이메일 없음**: 새 디렉토리라 git user.email 미설정 → `git config user.email kim.shingyun@gmail.com` 로컬 설정 후 해결.
- **CLAUDE.md 덮어쓰기**: create-next-app이 AGENTS.md를 자동 생성하고, 기존에 CLAUDE.md가 "@AGENTS.md" 한 줄만 있어서 Write tool에서 "read first" 오류 발생. 파일을 먼저 Read 후 Write로 교체.

**배포 현황**
- GitHub: https://github.com/walktoblue/bless-my-baby
- Supabase: zbxnadgqarloklefhrph (handong-donor-wall과 공유)
- 라이브: 배포 전 (구현 완료 후 자동 배포됨)
