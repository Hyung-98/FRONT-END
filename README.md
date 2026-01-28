# Frontend Dev Blog

프론트엔드 개발 학습 자료 모음을 Next.js로 구현한 블로그입니다. Supabase를 백엔드로 사용하여 포스트 관리, 댓글 시스템, 사용자 인증 등의 기능을 제공합니다.

## 시작하기

### 사전 요구사항

- Node.js 18 이상
- npm 또는 yarn
- Supabase 프로젝트 (데이터베이스 및 인증용)

### 설치

```bash
npm install
```

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

> **참고**: `SUPABASE_SERVICE_ROLE_KEY`는 서버 사이드에서만 사용되며, 관리자 작업(포스트 생성/수정/삭제)에 필요합니다.

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

```bash
npm run build
```

### 프로덕션 실행

```bash
npm start
```

## 개발 명령어

```bash
# 개발
npm run dev              # 개발 서버 실행 (localhost:3000)
npm run build            # 프로덕션 빌드
npm start                # 프로덕션 서버 실행

# 코드 품질
npm run lint             # ESLint 실행
npm run lint:fix         # ESLint 자동 수정
npm run format           # Prettier 포맷팅
npm run format:check     # Prettier 포맷팅 검사
npm run type-check       # TypeScript 타입 검사

# 테스트
npm test                 # 모든 테스트 실행
npm run test:watch       # 테스트 감시 모드
npm run test:coverage    # 커버리지 리포트 생성

# 데이터베이스
npm run migrate          # Supabase 마이그레이션 스크립트 실행
```

## 프로젝트 구조

```
├── app/                      # Next.js App Router
│   ├── api/                  # API 라우트
│   │   ├── rest/
│   │   │   ├── posts/        # 포스트 API
│   │   │   └── comments/     # 댓글 API
│   │   └── user/             # 사용자 API
│   ├── admin/                # 관리자 페이지
│   │   ├── posts/            # 포스트 관리 (생성/수정/삭제)
│   │   └── login/            # 관리자 로그인
│   ├── detail/[slug]/        # 블로그 상세 페이지
│   ├── category/[category]/  # 카테고리별 포스트 목록
│   ├── search/               # 검색 페이지
│   ├── login/                # 사용자 로그인
│   ├── user/                 # 사용자 설정
│   ├── layout.tsx            # 루트 레이아웃
│   ├── registry.tsx          # Styled Components SSR 설정
│   ├── page.tsx              # 메인 페이지
│   └── globals.css           # 글로벌 스타일
├── components/               # React 컴포넌트
│   ├── Header.tsx            # 헤더
│   ├── Footer.tsx            # 푸터
│   ├── DetailHeader.tsx      # 상세 페이지 헤더
│   ├── HomeContent.tsx       # 홈 콘텐츠
│   ├── ListCard.tsx          # 포스트 카드
│   ├── FeaturedCard.tsx      # 추천 포스트 카드
│   ├── Comments.tsx          # 댓글 시스템
│   ├── CommentForm.tsx       # 댓글 작성 폼
│   ├── CategoryFilter.tsx    # 카테고리 필터
│   ├── Pagination.tsx        # 페이지네이션
│   └── ...
├── lib/                      # 유틸리티 및 라이브러리
│   ├── supabase/             # Supabase 클라이언트
│   │   ├── client.ts         # 클라이언트 사이드 클라이언트
│   │   ├── server.ts         # 서버 사이드 관리자 클라이언트
│   │   ├── posts.ts          # 포스트 데이터 액세스 레이어
│   │   ├── comments.ts       # 댓글 데이터 액세스 레이어
│   │   ├── auth.ts           # 인증 유틸리티
│   │   └── types.ts          # 데이터베이스 스키마 타입
│   ├── utils/                # 유틸리티 함수
│   └── config/               # 설정 파일
├── styles/                   # 공통 스타일
│   ├── theme.ts              # 테마 정의
│   ├── common.ts             # 공통 스타일 컴포넌트
│   ├── comments.ts           # 댓글 스타일
│   └── styled.d.ts           # TypeScript 타입 정의
├── public/                   # 정적 파일
│   └── assets/               # 이미지, 아이콘 등
└── scripts/                  # 스크립트
    └── migrate-to-supabase.ts # Supabase 마이그레이션 스크립트
```

## 주요 기능

- ✅ **Next.js 14 App Router** - 최신 Next.js 기능 활용
- ✅ **TypeScript** - 타입 안정성 보장
- ✅ **Supabase 통합** - PostgreSQL 데이터베이스 및 인증
- ✅ **댓글 시스템** - 사용자 댓글 작성 및 관리
- ✅ **관리자 패널** - 포스트 생성/수정/삭제 기능
- ✅ **사용자 인증** - Supabase Auth를 통한 로그인/회원가입
- ✅ **카테고리 필터링** - JavaScript, React, TypeScript 등 카테고리별 필터링
- ✅ **검색 기능** - 포스트 검색
- ✅ **반응형 디자인** - 모바일/태블릿/데스크톱 지원
- ✅ **SEO 최적화** - 메타 태그, sitemap.xml, robots.txt
- ✅ **정적 생성 (SSG)** - 빌드 시점에 페이지 생성
- ✅ **마크다운 렌더링** - react-markdown을 통한 콘텐츠 렌더링
- ✅ **3D 시각화** - Three.js를 활용한 3D 콘텐츠 (선택적)

## 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript (strict mode)
- **UI 라이브러리**: React 18
- **스타일링**: Styled Components v6
- **데이터베이스**: Supabase (PostgreSQL)
- **인증**: Supabase Auth
- **마크다운**: react-markdown, remark-gfm
- **3D 라이브러리**: Three.js (선택적)
- **테스트**: Jest, React Testing Library
- **코드 품질**: ESLint, Prettier, Husky

## 라우트 구조

```
/                           # 홈 페이지 (포스트 목록)
/detail/[slug]              # 개별 포스트 페이지 (SSG)
/category/[category]        # 카테고리별 포스트 목록
/search                     # 검색 페이지
/login                      # 사용자 로그인
/user/settings              # 사용자 설정
/admin/posts                # 관리자 포스트 목록
/admin/posts/new            # 새 포스트 작성
/admin/posts/edit/[slug]    # 포스트 수정
/admin/posts/delete/[slug]  # 포스트 삭제
/api/rest/posts             # 포스트 API (GET, POST)
/api/rest/posts/[slug]      # 개별 포스트 API (GET)
/api/rest/comments          # 댓글 API
```

## 데이터베이스 스키마

데이터베이스 컬럼은 snake_case를 사용하며, 애플리케이션에서는 camelCase로 변환됩니다:

- `reading_time` → `readingTime`
- `hero_image` → `heroImage`
- `created_at` → `createdAt`

변환은 `lib/supabase/posts.ts`의 변환 함수에서 처리됩니다.

## 배포

### Vercel 배포

```bash
npm i -g vercel
vercel
```

환경 변수를 Vercel 대시보드에서 설정하세요:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### GitHub Pages 배포

정적 내보내기 모드로 빌드하여 GitHub Pages에 배포할 수 있습니다. 자세한 내용은 [GITHUB_PAGES_GUIDE.md](./GITHUB_PAGES_GUIDE.md)를 참조하세요.

## 테스트

프로젝트는 Jest와 React Testing Library를 사용하여 테스트됩니다.

```bash
# 모든 테스트 실행
npm test

# 감시 모드
npm run test:watch

# 커버리지 리포트
npm run test:coverage
```

테스트 파일은 다음 패턴으로 작성됩니다:
- `**/__tests__/**/*.[jt]s?(x)`
- `**/*.(spec|test).[jt]s?(x)`

## 추가 문서

- [CLAUDE.md](./CLAUDE.md) - 프로젝트 아키텍처 및 개발 가이드
- [API.md](./API.md) - API 엔드포인트 문서
- [SETUP.md](./SETUP.md) - 상세 설정 가이드
- [OPTIMIZATION.md](./OPTIMIZATION.md) - 최적화 가이드
- [GITHUB_PAGES_GUIDE.md](./GITHUB_PAGES_GUIDE.md) - GitHub Pages 배포 가이드
- [STYLING_GUIDE.md](./STYLING_GUIDE.md) - 스타일링 가이드

## 라이선스

이 프로젝트는 개인 학습 목적으로 제작되었습니다.
