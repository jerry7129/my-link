# GEMINI.md

이 파일은 **마이링크 (My Link)** 프로젝트에 대한 지침과 컨텍스트를 제공합니다.

## 1. 프로젝트 개요
- **프로젝트명**: 마이링크 (My Link)
- **목적**: 여러 소셜 미디어, 포트폴리오, 웹사이트 링크를 단일 URL로 통합 관리 및 공유하는 서비스 (Linktree 유사 서비스)
- **핵심 가치**: 100% 무료, 모바일 최적화, 깔끔하고 직관적인 UI/UX (인라인 편집 지원)

## 2. 주요 기술 스택
- **프론트엔드**: Next.js 15+ (App Router), React 19
- **스타일링**: Tailwind CSS 4, shadcn/ui
- **백엔드/DB**: Firebase (Authentication, Firestore)
- **언어**: TypeScript
- **패키지 관리**: npm

## 3. 핵심 기능 (PRD 기준)
- **인증**: Google 소셜 로그인 전용
- **프로필 관리**: 
  - 고유 식별자(`displayName`) 기반 URL 제공 (예: `mylink.com/username`)
  - 인라인 편집(Inline Editing)을 통한 프로필 정보(이름, 소개) 수정
  - Google 프로필 이미지 연동
- **링크 관리**: 
  - 링크 CRUD (생성, 조회, 수정, 삭제)
  - Google Favicon API를 이용한 자동 파비콘 아이콘 적용
- **랜딩 페이지**: 방문자용 모바일 최적화 프로필 뷰

## 4. 데이터베이스 구조 (Firestore)
- **`users` 컬렉션**:
  - `uid` (Doc ID), `displayName`, `username`, `photoURL`, `bio`, `email`, `createdAt`
- **`links` 서브 컬렉션** (`users/{uid}/links`):
  - `linkId` (Doc ID), `title`, `url`, `createdAt`

## 5. 개발 가이드라인

### 주요 명령어
- `npm run dev`: 개발 서버 실행 (Turbopack 사용)
- `npm run build`: 프로젝트 빌드
- `npm run lint`: ESLint 검사
- `npm run format`: Prettier를 사용한 코드 포맷팅 (`**/*.{ts,tsx}`)
- `npm run typecheck`: TypeScript 타입 검사

### 개발 컨벤션
- **컴포넌트**: `shadcn/ui` 라이브러리를 적극 활용하며, `components/ui` 폴더에 배치합니다.
- **스타일링**: Tailwind CSS 4의 기능을 활용하며, 일관된 간격과 타이포그래피를 유지합니다.
- **UI/UX**: 
  - 관리자 화면에서는 별도의 수정 폼 대신 클릭 시 바로 수정 가능한 **인라인 편집** 방식을 우선시합니다.
  - 모든 외부 링크는 `target="_blank"` 속성을 사용하여 **새 탭**으로 열리도록 구현합니다.
  - 링크 삭제와 같은 파괴적인 작업 시에는 `shadcn/ui`의 **AlertDialog** 컴포넌트를 사용하여 사용자에게 명확한 확인 과정을 거칩니다.
  - 방문자용 화면 상단에 '공유하기' 기능을 배치하여, 클릭 시 현재 페이지의 고유 URL이 **클립보드에 복사**되도록 구현합니다.
- **레이아웃**: 모바일 우선(Mobile-First) 디자인을 적용하며, 상단 프로필 영역(이미지, 이름, 소개)과 하단 링크 리스트 영역으로 구성합니다.
- **검증**: 개발 완료 후 반드시 `npm run build`, `npm run lint`, `npm run typecheck`를 실행하여 정적 분석 및 빌드 오류가 없는지 확인합니다.
- **커밋 메시지**: 작업 내용을 상세히 설명하는 한글 메시지를 작성합니다.
- **파일 참조**: 대화나 문서 내에서 특정 파일을 언급할 때는 파일명 앞에 `@`를 붙여서 표현합니다 (예: `@package.json`, `@app/page.tsx`).

## 6. 추가 지침
- 새로운 컴포넌트 추가 시 `npx shadcn@latest add [component-name]` 명령어를 사용합니다.
- 모든 기능 구현 전 `docs/PRD.md` 및 관련 문서를 먼저 숙지하여 요구사항에 부합하는지 확인합니다.
- 확실하지 않은 아키텍처나 기능 구현 방향은 사용자에게 질문 후 진행합니다.
