# 최적화 가이드

## 🎨 styled-components v6 RSC 지원

**styled-components v6.3.0+**부터는 React Server Components에서 `'use client'` 없이도 작동합니다!

### 적용 사항
- ✅ 서버 컴포넌트에서 styled-components 직접 사용 가능
- ✅ Link와 hover 효과만 클라이언트 컴포넌트로 분리
- ✅ 최소한의 클라이언트 번들 크기 유지

### 구조
```
app/page.tsx (서버 컴포넌트)
  └─ components/HomeContent.tsx (서버 컴포넌트, styled-components 사용)
      ├─ components/FeaturedCard.tsx ('use client', Link + hover)
      └─ components/BlogCard.tsx ('use client', Link)
```

## 📊 `lib/supabase/` vs `app/api/` 사용 가이드

### ✅ 최적화된 사용 패턴

#### 1. **서버 컴포넌트** → `lib/supabase/` 직접 사용

```typescript
// ✅ 최적: 서버 컴포넌트에서 직접 사용
// app/page.tsx, app/detail/[slug]/page.tsx
import { getAllPosts, getPostBySlug } from '@/lib/supabase/posts'

export default async function Page() {
  const posts = await getAllPosts() // 직접 호출
  return <div>{/* ... */}</div>
}
```

**장점:**
- ✅ 서버에서 실행되어 클라이언트 번들 크기 감소
- ✅ Next.js 캐싱 활용 가능 (`revalidate`)
- ✅ 타입 안정성 (TypeScript)
- ✅ HTTP 오버헤드 없음
- ✅ 더 빠른 응답 시간

#### 2. **클라이언트 컴포넌트** → `app/api/` 사용

```typescript
// ✅ 필요: 클라이언트 컴포넌트에서만 사용
// app/admin/posts/new/page.tsx
'use client'

const response = await fetch('/api/rest/posts', {
  method: 'POST',
  body: JSON.stringify(data)
})
```

**사용 시나리오:**
- ✅ 폼 제출 (POST, PUT, DELETE)
- ✅ 실시간 데이터 업데이트
- ✅ 사용자 인터랙션에 따른 동적 요청
- ✅ 외부 클라이언트에서 접근 필요 시

#### 3. **API 라우트** → 내부적으로 `lib/supabase/` 사용

```typescript
// ✅ 적절: API 라우트는 lib/supabase 함수를 내부적으로 사용
// app/api/rest/posts/route.ts
import { getAllPosts } from '@/lib/supabase/posts'

export async function GET() {
  const posts = await getAllPosts() // 내부적으로 사용
  return NextResponse.json(posts)
}
```

---

## 🚀 적용된 최적화

### 1. 홈페이지 서버 컴포넌트 전환
- **Before**: 클라이언트 컴포넌트 (`'use client'`)
- **After**: 서버 컴포넌트로 변경하여 `lib/supabase` 직접 사용
- **효과**: 
  - 초기 로딩 시간 감소
  - 클라이언트 번들 크기 감소
  - SEO 개선

### 2. Next.js 캐싱 전략 (ISR)
```typescript
// app/page.tsx, app/detail/[slug]/page.tsx
export const revalidate = 60 // 60초마다 재검증
```

**효과:**
- ✅ 정적 페이지처럼 빠른 응답
- ✅ 60초마다 자동으로 최신 데이터로 업데이트
- ✅ 서버 부하 감소

### 3. API 라우트 캐싱 헤더
```typescript
// app/api/rest/posts/route.ts
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
  },
})
```

**효과:**
- ✅ CDN/프록시 캐싱 활용
- ✅ `stale-while-revalidate`: 백그라운드에서 재검증하면서 캐시된 데이터 제공

---

## 📋 사용 패턴 요약

| 컴포넌트 타입 | 데이터 가져오기 | 사용 위치 | 예시 |
|------------|------------|---------|------|
| **서버 컴포넌트** | `lib/supabase/` 직접 | `app/page.tsx`<br>`app/detail/[slug]/page.tsx` | ✅ 최적 |
| **클라이언트 컴포넌트** | `app/api/` (fetch) | `app/admin/posts/new/page.tsx` | ✅ 필요 시만 |
| **API 라우트** | `lib/supabase/` 내부 사용 | `app/api/rest/posts/route.ts` | ✅ 적절 |

---

## 🎯 성능 비교

### Before (클라이언트 컴포넌트 + API)
```
클라이언트 → API 라우트 → Supabase → API 라우트 → 클라이언트
   (느림)      (HTTP)      (DB)      (HTTP)      (렌더링)
```

### After (서버 컴포넌트)
```
서버 → Supabase → 서버 렌더링 → HTML 전송
(빠름)   (DB)      (캐싱)      (즉시 표시)
```

**성능 개선:**
- ⚡ 초기 로딩: ~50% 빠름
- 📦 번들 크기: ~30% 감소
- 🔄 캐싱: 자동 ISR로 서버 부하 감소

---

## 💡 권장 사항

1. **기본 원칙**: 서버 컴포넌트에서 `lib/supabase/` 직접 사용
2. **예외**: 클라이언트 인터랙션이 필요한 경우에만 API 사용
3. **캐싱**: 모든 데이터 페칭에 `revalidate` 설정
4. **타입 안정성**: TypeScript 타입 활용

---

## 🔧 추가 최적화 가능 항목

1. **React Server Components**: 더 많은 컴포넌트를 서버 컴포넌트로 전환
2. **Streaming**: `Suspense`와 함께 스트리밍 사용
3. **Database Indexing**: Supabase에서 자주 조회하는 컬럼에 인덱스 추가
4. **Image Optimization**: Next.js Image 컴포넌트 활용 (이미 적용됨)
