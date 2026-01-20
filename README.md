# Frontend Dev Blog

프론트엔드 개발 학습 자료 모음을 Next.js로 구현한 블로그입니다.

## 시작하기

### 설치

```bash
npm install
```

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

## 프로젝트 구조

```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 루트 레이아웃
│   ├── registry.tsx       # Styled Components SSR 설정
│   ├── page.tsx          # 메인 페이지
│   ├── globals.css       # 글로벌 스타일
│   └── javascript/       # JavaScript 학습 자료
│       └── [slug]/       # 동적 라우트
│           └── page.tsx  # 상세 페이지
├── components/            # React 컴포넌트
│   ├── Header.tsx
│   ├── DetailHeader.tsx
│   └── Footer.tsx
├── styles/               # 공통 스타일
│   ├── theme.ts         # 테마 정의
│   ├── common.ts        # 공통 스타일 컴포넌트
│   └── styled.d.ts     # TypeScript 타입 정의
├── data/                  # 데이터 파일
│   └── posts.ts          # 블로그 포스트 데이터
├── public/                # 정적 파일
│   └── assets/           # 이미지, 아이콘 등
└── web/                   # 기존 정적 파일 (참고용)
```

## 주요 기능

- ✅ Next.js 14 App Router 사용
- ✅ TypeScript 지원
- ✅ 반응형 디자인
- ✅ SEO 최적화
- ✅ 정적 생성 (Static Generation)

## 정적 파일 설정

기존 `web/assets/` 디렉토리의 파일들을 `public/assets/`로 복사하세요:

```bash
cp -r web/assets public/
```

## 배포

Vercel, Netlify 등에 배포할 수 있습니다.

### Vercel 배포

```bash
npm i -g vercel
vercel
```

## 기술 스택

- Next.js 14
- React 18
- TypeScript
- Styled Components (CSS-in-JS)
