# 환경 설정 가이드

## 1. 패키지 설치

터미널에서 다음 명령어를 실행하세요:

```bash
npm install
```

또는

```bash
yarn install
```

## 2. 정적 파일 복사

기존 `web/assets/` 디렉토리의 파일들을 `public/assets/`로 복사하세요:

```bash
cp -r web/assets public/
```

또는 수동으로:
- `web/assets/images/` → `public/assets/images/`

## 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 4. 빌드 및 배포

### 로컬 빌드

```bash
npm run build
npm start
```

### Vercel 배포

```bash
npm i -g vercel
vercel
```

## 문제 해결

### npm install 오류

권한 문제가 발생하는 경우:

```bash
sudo npm install
```

또는 nvm을 사용하는 경우:

```bash
nvm use node
npm install
```

### 이미지가 표시되지 않는 경우

1. `public/assets/` 디렉토리가 올바르게 복사되었는지 확인
2. 이미지 경로가 `/assets/...` 형식인지 확인

### TypeScript 오류

패키지 설치 후에도 오류가 발생하면:

```bash
rm -rf node_modules .next
npm install
```

## 프로젝트 구조

```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 메인 페이지
│   ├── globals.css        # 글로벌 스타일
│   └── javascript/        # JavaScript 학습 자료
│       └── [slug]/        # 동적 라우트
├── components/            # React 컴포넌트
├── data/                  # 데이터 파일
│   └── posts.ts          # 블로그 포스트 데이터
└── public/                # 정적 파일
    └── assets/            # 이미지, 아이콘 등
```
