# Styled Components 사용 가이드

## 두 가지 방식 비교

### 방식 1: `app/styles.ts` 패턴 (현재 `app/detail/[slug]/page.tsx`)

```typescript
// app/styles.ts
export const Main = styled.main`...`
export const HeaderSection = styled.div`...`
export const ShareLink = styled(Link)`...`

// app/detail/[slug]/page.tsx
import * as S from '../../styles'

export default async function Page() {
  return (
    <S.Main>
      <S.HeaderSection>...</S.HeaderSection>
      <S.ShareLink href="#">...</S.ShareLink>
    </S.Main>
  )
}
```

**장점:**
- ✅ 페이지별 스타일을 한 곳에 모아 관리 (코로케이션)
- ✅ 페이지 컴포넌트가 간결해짐
- ✅ 스타일 재사용이 쉬움 (같은 페이지 내에서)
- ✅ 서버 컴포넌트에서 직접 사용 가능 (styled-components v6)

**단점:**
- ❌ 페이지 간 스타일 공유가 어려움
- ❌ 컴포넌트 재사용성이 낮음
- ❌ Link나 hover 효과 사용 시 클라이언트 컴포넌트로 분리 필요

---

### 방식 2: 컴포넌트 분리 패턴 (현재 `components/HomeContent.tsx`)

```typescript
// components/HomeContent.tsx (서버 컴포넌트)
const Main = styled.main`...`
const SectionTitle = styled.h2`...`

export default function HomeContent({ posts }) {
  return (
    <Main>
      <SectionTitle>...</SectionTitle>
      <ListCardComponent post={post} />
    </Main>
  )
}

// components/ListCard.tsx (클라이언트 컴포넌트)
'use client'
const ListCard = styled(Link)`...`

export default function ListCardComponent({ post }) {
  return <ListCard href={...}>...</ListCard>
}
```

**장점:**
- ✅ 컴포넌트 재사용성 높음
- ✅ Server/Client Component 명확히 분리
- ✅ 테스트하기 쉬움
- ✅ 관심사 분리 (스타일 + 로직 + 데이터)

**단점:**
- ❌ 파일 수가 많아짐
- ❌ 작은 컴포넌트의 경우 오버엔지니어링 가능

---

## 🎯 권장사항: **하이브리드 접근법**

### 사용 기준

#### ✅ `app/styles.ts` 패턴 사용 시기

1. **페이지 전용 스타일** (다른 곳에서 재사용하지 않음)
   ```typescript
   // app/detail/[slug]/page.tsx 전용 스타일
   // app/styles.ts에 정의
   ```

2. **복잡한 레이아웃 스타일** (여러 요소가 함께 사용)
   ```typescript
   // ContentWrapper, Sidebar 등 레이아웃 관련
   export const ContentWrapper = styled.div`...`
   export const Sidebar = styled.aside`...`
   ```

3. **서버 컴포넌트에서만 사용하는 스타일**
   ```typescript
   // Link나 hover 효과가 없는 순수 스타일 컴포넌트
   export const Main = styled.main`...`
   export const HeaderSection = styled.div`...`
   ```

#### ✅ 컴포넌트 분리 패턴 사용 시기

1. **재사용 가능한 컴포넌트**
   ```typescript
   // 여러 페이지에서 사용하는 카드, 버튼 등
   // components/ListCard.tsx
   // components/FeaturedCard.tsx
   ```

2. **클라이언트 기능이 필요한 컴포넌트**
   ```typescript
   // Link, hover, onClick 등 인터랙션이 있는 경우
   'use client'
   const ListCard = styled(Link)`...`
   ```

3. **비즈니스 로직이 있는 컴포넌트**
   ```typescript
   // 데이터 변환, 조건부 렌더링 등
   export default function FeaturedCard({ post }) {
     // 로직 처리
     return <FeaturedCardStyled>...</FeaturedCardStyled>
   }
   ```

---

## 📋 현재 프로젝트 적용 예시

### ✅ 올바른 사용 예시

#### 1. `app/detail/[slug]/page.tsx` - `app/styles.ts` 패턴 ✅
```typescript
// 페이지 전용 스타일, 재사용하지 않음
import * as S from '../../styles'

export default async function BlogPostPage({ params }) {
  return (
    <S.Main>
      <S.HeaderSection>...</S.HeaderSection>
      <S.ContentWrapper>...</S.ContentWrapper>
    </S.Main>
  )
}
```

**이유:**
- 페이지 전용 레이아웃 스타일
- 다른 곳에서 재사용하지 않음
- 서버 컴포넌트에서 직접 사용 가능

#### 2. `components/HomeContent.tsx` - 컴포넌트 분리 패턴 ✅
```typescript
// 재사용 가능한 컴포넌트
export default function HomeContent({ posts }) {
  return (
    <Main>
      <FeaturedCardComponent post={featuredPost} />
      <ListCardComponent post={post} />
    </Main>
  )
}
```

**이유:**
- 여러 곳에서 재사용 가능
- 클라이언트 기능(Link) 분리 필요

---

## 🔄 개선 제안

### `app/detail/[slug]/page.tsx` 개선

현재 `ShareLink`가 `app/styles.ts`에 있는데, 이는 클라이언트 컴포넌트로 분리하는 것이 좋습니다:

```typescript
// ❌ 현재: app/styles.ts
export const ShareLink = styled(Link)`...` // Link는 클라이언트 기능

// ✅ 개선: components/ShareLink.tsx
'use client'
const ShareLink = styled(Link)`...`
export default function ShareLinkComponent({ href, children }) {
  return <ShareLink href={href}>{children}</ShareLink>
}
```

---

## 📊 최종 권장사항

### 1. **페이지 전용 스타일** → `app/styles.ts`
- 레이아웃 컴포넌트 (Main, ContentWrapper, Sidebar)
- 페이지 특정 스타일 (HeaderSection, Hero)
- 서버 컴포넌트에서만 사용하는 스타일

### 2. **재사용 가능한 컴포넌트** → `components/`
- 카드, 버튼, 링크 등 UI 컴포넌트
- 클라이언트 기능이 필요한 컴포넌트
- 비즈니스 로직이 있는 컴포넌트

### 3. **공통 스타일** → `styles/common.ts`
- 전역적으로 사용하는 기본 컴포넌트
- Container, Button, Grid 등

---

## 🎨 구조 예시

```
app/
  ├─ detail/[slug]/
  │   └─ page.tsx (서버 컴포넌트)
  │       └─ import * as S from '../../styles'
  │
  ├─ styles.ts (페이지 전용 스타일)
  │   ├─ Main, HeaderSection, ContentWrapper
  │   └─ (서버 컴포넌트용, Link 없음)
  │
components/
  ├─ HomeContent.tsx (서버 컴포넌트)
  │   └─ styled-components 직접 사용
  │
  ├─ ListCard.tsx ('use client')
  │   └─ Link + hover 효과
  │
  └─ ShareLink.tsx ('use client')
      └─ Link 사용

styles/
  └─ common.ts (전역 공통 컴포넌트)
      └─ Container, Button, Grid, Section
```

---

## ✅ 체크리스트

스타일을 어디에 둘지 결정할 때:

- [ ] 다른 페이지/컴포넌트에서 재사용하나요?
  - ✅ Yes → `components/`
  - ❌ No → `app/styles.ts`

- [ ] Link, hover, onClick 등 클라이언트 기능이 있나요?
  - ✅ Yes → `components/` + `'use client'`
  - ❌ No → `app/styles.ts` (서버 컴포넌트)

- [ ] 비즈니스 로직이나 데이터 변환이 있나요?
  - ✅ Yes → `components/`
  - ❌ No → `app/styles.ts`

- [ ] 전역적으로 사용하나요?
  - ✅ Yes → `styles/common.ts`
  - ❌ No → 페이지별로 결정
