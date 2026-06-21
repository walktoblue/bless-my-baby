# Bless My Baby

기술 이름(slug): `bless-my-baby`

## 한 줄 소개
아이 사진(최대 3장)을 올리면 신체 부위 한글/영어 라벨 브로마이드를 A3/600DPI로 자동 생성해 다운로드하거나 이메일로 받는 웹앱

## 핵심 흐름
1. 아이 사진(1-3장)을 올리고 나이·문구·날짜·이름을 입력한다
2. 서버가 얼굴을 추출해 신체 라벨 템플릿에 합성한다
3. 완성된 A3 브로마이드를 다운로드하거나 이메일로 받는다

## 참고 앱/사이트
없음 — 참고 자료: `D:\claude\참고 자료\bless my baby\ex1.png`

참고 이미지 확인 완료 (2026-06-21):
- 크림 베이지 배경, "나의 몸 / MY BODY" 제목
- 전신 사진 중앙, 좌우로 21개 신체 부위 라벨 (한글+영어 + 지시선)
- 라벨: 머리/head, 이마/forehead, 눈썹/eyebrow, 얼굴/face, 목/neck, 가슴/chest,
         팔/arm, 손/hand, 손가락/finger, 다리/leg, 무릎/knee, 발/foot, 발가락/toe
         머리카락/hair, 눈/eye, 귀/ear, 코/nose, 입/mouth, 어깨/shoulder, 배/tummy,
         손목/wrist, 허벅지/thigh, 종아리/calf, 발목/ankle
- 오른쪽 하단: 날짜 + 키/몸무게 소자 텍스트
- 구현 시: 예시 실사 사진은 저작권·개인정보 문제로 사용 불가 → 동일 스타일의 중립 신체 일러스트 템플릿을 별도 제작, 얼굴 위치만 아이 사진으로 교체

## 설정
- 로그인: 필요 없음 (누구나)
- LLM API: 불필요 (Canvas/sharp 이미지 합성)
- 외부 연동:
  - 이메일 발송: Resend API
  - 얼굴 감지: face-api.js (브라우저, 무료)
  - 배경 제거: @imgly/background-removal (브라우저, 무료)
  - 이미지 합성: sharp (서버사이드, Next.js API Route)
  - 임시 파일 저장: Supabase Storage
- 민감정보: 없음

## 디자인
- 강조색: `#2563EB` (Stitch 기준) — 버튼·링크·강조
- 배경: `#FBF9F8` (크림) · 글자: `#1A1B22` · 카드: `#FFFFFF` · 테두리: `#E3E1EC`
- 상태색: 성공 `#16A34A` · 오류 `#BA1A1A`
- 폰트: Noto Sans KR (한글 body, UI) · Plus Jakarta Sans (영문 헤딩 — Stitch 시스템 기준)
- 모서리(radius): 8px (일반) · 12px (업로드 존) · 그림자: `0 4px 20px rgba(0,0,0,0.04)` · 간격: 넉넉하게
- 레이아웃 원칙: 중앙 1단 카드 (입력), 중앙 히어로 미리보기 + 하단 버튼 (결과)
- 하단 탭 네비: Create / Gallery(stub) / Profile(stub) — 3탭, 현재 탭 파란 강조

## 화면
1. **입력 화면** — `/`
   - 보임: 앱 타이틀 "Bless My Baby"(1순위) → 사진 업로드 영역(최대 3장, 점선 테두리) → 아이 나이 입력 → 상단 문구(선택) → 하단 문구: 날짜(생일, 선택)·이름(선택) → '브로마이드 만들기' 버튼 → 프라이버시 안내("업로드된 사진은 생성 후 즉시 파기됩니다")
   - 동작: 파일 업로드 → 입력 → 버튼 클릭 → 생성 중 스피너 → 결과 화면으로 이동
   - 데이터: 없음 (파일은 API로 직접 전송)
   - 상태: 업로드 전(초기) / 생성 중(버튼 위 스피너 + "브로마이드를 만들고 있어요...") / 오류(얼굴 감지 실패 안내)
   - 디자인: design/mobile_2/code.html

2. **결과 화면** — `/result`
   - 보임: "완성된 브로마이드" 제목(1순위) → 브로마이드 미리보기 카드(세로 전체) → '다운로드 (A3 고화질)' 버튼 → 이메일 입력란 + '이메일로 받기' 버튼 → "다운로드와 이메일을 동시에 받을 수 있어요" → '← 다시 만들기' 링크
   - 동작: 다운로드(A3 PNG 600DPI) / 이메일 발송 — 동시 가능
   - 데이터: Supabase Storage URL (쿼리 파라미터로 전달)
   - 상태: 다운로드 중 / 이메일 발송 중 / 성공(초록 메시지) / 오류(이메일 형식 / 발송 실패)
   - 디자인: design/mobile_1/code.html

3. **Gallery (stub)** — `/gallery`
   - 보임: "준비 중입니다" 안내 문구
   - 동작: 없음
   - 디자인: 없음 (탭 네비 연결용 stub 페이지)

## 데이터 (Supabase Storage)
- 테이블 없음 — Supabase Storage 버킷만 사용
- **버킷**: `bromides`
  - 파일명: `[uuid].png` (서버에서 UUID 발급)
  - 접근: Public URL (24시간 후 자동 만료)

## 기술 스택
Next.js (App Router, TypeScript) · Tailwind CSS · shadcn/ui · Supabase Storage · Resend · sharp · face-api.js · Vercel

## MVP 범위
- 포함: 사진 업로드(최대 3장)·얼굴 추출·합성, 나이/상단문구/날짜/이름 입력, A3 600DPI 다운로드, 이메일 발송(Resend), 신체 부위 한글/영어 라벨 템플릿(1종), 탭 네비(Gallery·Profile은 stub)
- 제외 — 다음에: Gallery 실제 기능(기록 저장), Profile 기능, 템플릿 여러 종, 고급 보정 옵션, 소셜 공유, 영문 UI

## 진행 상황
- [x] 기획 완료
- [x] Stitch 프로토타입
- [x] 연결 (GitHub · Vercel · Supabase)
- [ ] 구현: 입력 화면
- [ ] 구현: 결과 화면 (미리보기 + 다운로드 + 이메일)
- [ ] 구현: 이미지 합성 API (얼굴 추출 + 템플릿 합성 + 고해상도 저장)
- [ ] 배포 확인
