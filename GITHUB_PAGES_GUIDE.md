# GitHub Pages에서 동적 페이지 구현 가이드

GitHub Pages는 정적 사이트 호스팅만 지원하므로, Next.js의 서버 사이드 기능(API 라우트, ISR 등)을 직접 사용할 수 없습니다. 하지만 다음과 같은 방법으로 "동적"처럼 보이는 페이지를 구현할 수 있습니다.

## 📋 목차

1. [현재 설정 상태](#현재-설정-상태)
2. [정적 생성 (SSG) 전략](#정적-생성-ssg-전략)
3. [클라이언트 사이드 데이터 페칭](#클라이언트-사이드-데이터-페칭)
4. [GitHub Actions를 통한 자동 재빌드](#github-actions를-통한-자동-재빌드)
5. [실제 구현 방법](#실제-구현-방법)
6. [제한사항 및 해결책](#제한사항-및-해결책)

---

## 현재 설정 상태

### ✅ 이미 구현된 기능

1. **정적 내보내기 설정**: `next.config.js`에 `output: 'export'` 설정됨
2. **정적 생성 함수**: `generateStaticParams`가 동적 라우트에 구현됨
   - `/detail/[slug]/page.tsx`: 모든 포스트 slug를 빌드 시점에 생성
   - `/category/[category]/page.tsx`: 모든 카테고리를 빌드 시점에 생성

### ⚠️ 주의사항

- `revalidate = 60` 설정은 GitHub Pages에서 작동하지 않습니다 (ISR은 서버가 필요함)
- API 라우트 (`/api/rest/posts/*`)는 정적 내보내기에서 제외되며, 빌드 후 작동하지 않습니다

---

## 정적 생성 (SSG) 전략

### 1. 빌드 시점에 모든 페이지 생성

현재 프로젝트는 이미 이 방식으로 구현되어 있습니다:

```typescript
// app/detail/[slug]/page.tsx
export async function generateStaticParams() {
  const slugs = await getAllSlugs()
  return slugs.map(slug => ({ slug }))
}
```

**작동 방식:**
- 빌드 시점에 Supabase에서 모든 slug를 가져옴
- 각 slug에 대해 정적 HTML 파일 생성
- GitHub Pages에 배포되면 모든 페이지가 미리 생성되어 있음

**장점:**
- ✅ 빠른 로딩 속도 (정적 파일)
- ✅ SEO 최적화
- ✅ 서버 비용 없음

**단점:**
- ❌ 새 포스트 추가 시 재빌드 필요
- ❌ 빌드 시간이 포스트 수에 비례하여 증가

---

## 클라이언트 사이드 데이터 페칭

새 콘텐츠가 추가되었을 때 사용자에게 즉시 보여주려면, 클라이언트에서 Supabase를 직접 호출할 수 있습니다.

### 구현 예시

#### 1. 클라이언트 컴포넌트에서 데이터 페칭

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { BlogPost } from '@/lib/supabase/posts'

export default function DynamicPostList() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPosts() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setPosts(data.map(post => ({
          slug: post.slug,
          title: post.title,
          // ... 기타 필드 매핑
        })))
      }
      setLoading(false)
    }

    fetchPosts()
  }, [])

  if (loading) return <div>로딩 중...</div>

  return (
    <div>
      {posts.map(post => (
        <div key={post.slug}>{post.title}</div>
      ))}
    </div>
  )
}
```

#### 2. 하이브리드 접근법 (권장)

**빌드 시점에 생성된 페이지 + 클라이언트에서 최신 데이터 보완**

```typescript
// app/page.tsx (서버 컴포넌트)
export default async function Home() {
  // 빌드 시점 데이터 (빠른 초기 로딩)
  const initialPosts = await getAllPosts()

  return <HomeContent initialPosts={initialPosts} />
}

// components/HomeContent.tsx
'use client'

export default function HomeContent({ initialPosts }: { initialPosts: BlogPost[] }) {
  const [posts, setPosts] = useState(initialPosts)
  const [isStale, setIsStale] = useState(false)

  useEffect(() => {
    // 마운트 후 최신 데이터 확인
    async function checkForUpdates() {
      const supabase = createClient()
      const { data } = await supabase
        .from('posts')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data && new Date(data.created_at) > new Date(initialPosts[0]?.date || 0)) {
        setIsStale(true)
        // 필요시 최신 데이터 로드
        fetchLatestPosts()
      }
    }

    checkForUpdates()
  }, [])

  return (
    <div>
      {isStale && <button onClick={fetchLatestPosts}>최신 포스트 보기</button>}
      {/* 포스트 목록 렌더링 */}
    </div>
  )
}
```

---

## GitHub Actions를 통한 자동 재빌드

새 포스트가 추가되면 자동으로 사이트를 재빌드하고 배포하는 워크플로우를 설정할 수 있습니다.

### 1. Supabase Webhook 설정

Supabase에서 새 포스트가 생성될 때 GitHub Actions를 트리거하는 워크플로우:

```yaml
# .github/workflows/rebuild-on-new-post.yml
name: Rebuild on New Post

on:
  repository_dispatch:
    types: [new-post]
  workflow_dispatch: # 수동 실행도 가능

jobs:
  rebuild:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
```

### 2. Supabase Edge Function으로 Webhook 호출

Supabase에서 새 포스트가 생성될 때 GitHub API를 호출하는 Edge Function:

```typescript
// supabase/functions/trigger-rebuild/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { GITHUB_TOKEN, GITHUB_REPO } = Deno.env.toObject()

  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/dispatches`,
    {
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        event_type: 'new-post',
      }),
    }
  )

  return new Response(JSON.stringify({ success: response.ok }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

### 3. Supabase Database Trigger 설정

```sql
-- 새 포스트가 생성될 때 Edge Function 호출
CREATE OR REPLACE FUNCTION trigger_rebuild()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM
    net.http_post(
      url := 'https://your-project.supabase.co/functions/v1/trigger-rebuild',
      headers := jsonb_build_object(
        'Authorization', 'Bearer YOUR_ANON_KEY',
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object('slug', NEW.slug)
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_new_post
  AFTER INSERT ON posts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_rebuild();
```

---

## 실제 구현 방법

### 방법 1: 순수 정적 생성 (현재 방식)

**장점:** 가장 간단하고 안정적  
**단점:** 새 포스트 추가 시 수동 재빌드 필요

**사용 시나리오:**
- 포스트 업데이트가 자주 발생하지 않음
- 빌드 시간이 문제되지 않음

### 방법 2: 클라이언트 사이드 페칭 (추천)

**구현 단계:**

1. **홈페이지에 최신 포스트 확인 기능 추가**

```typescript
// components/HomeContent.tsx에 추가
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function HomeContent({ initialPosts, ... }) {
  const [posts, setPosts] = useState(initialPosts)
  const [hasNewPosts, setHasNewPosts] = useState(false)

  useEffect(() => {
    async function checkNewPosts() {
      const supabase = createClient()
      const { data } = await supabase
        .from('posts')
        .select('slug, created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      // 빌드 시점 이후 새 포스트가 있는지 확인
      const latestBuildPost = initialPosts[0]
      if (data && latestBuildPost) {
        const newPostDate = new Date(data.created_at)
        const buildPostDate = new Date(latestBuildPost.date)
        if (newPostDate > buildPostDate) {
          setHasNewPosts(true)
        }
      }
    }

    // 5분마다 확인
    checkNewPosts()
    const interval = setInterval(checkNewPosts, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  async function loadNewPosts() {
    const supabase = createClient()
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setPosts(data.map(/* 변환 로직 */))
      setHasNewPosts(false)
    }
  }

  return (
    <>
      {hasNewPosts && (
        <button onClick={loadNewPosts}>
          새 포스트 보기
        </button>
      )}
      {/* 기존 렌더링 */}
    </>
  )
}
```

2. **상세 페이지에 폴백 처리**

```typescript
// app/detail/[slug]/page.tsx
export default async function BlogPostPage({ params }: PageProps) {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    // 정적 생성되지 않은 새 포스트일 수 있음
    // 클라이언트 컴포넌트로 폴백
    return <ClientPostPage slug={params.slug} />
  }

  // 기존 렌더링
}

// components/ClientPostPage.tsx
'use client'
export default function ClientPostPage({ slug }: { slug: string }) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPost() {
      const supabase = createClient()
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .single()

      if (data) {
        setPost(/* 변환 */)
      }
      setLoading(false)
    }
    fetchPost()
  }, [slug])

  if (loading) return <div>로딩 중...</div>
  if (!post) return <div>포스트를 찾을 수 없습니다.</div>

  // 포스트 렌더링
}
```

### 방법 3: GitHub Actions 자동 재빌드

**구현 단계:**

1. GitHub Personal Access Token 생성
   - Settings → Developer settings → Personal access tokens
   - `repo` 권한 필요

2. Repository Secrets에 추가
   - Settings → Secrets and variables → Actions
   - `GITHUB_TOKEN`: Personal Access Token
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`: 기존 secrets

3. 워크플로우 파일 생성 (위의 예시 참고)

4. Supabase Edge Function 또는 Database Trigger 설정

---

## 제한사항 및 해결책

### 제한사항

1. **API 라우트 작동 안 함**
   - 정적 내보내기에서는 `/api/*` 라우트가 작동하지 않음
   - **해결책:** 클라이언트에서 직접 Supabase 호출

2. **ISR (Incremental Static Regeneration) 불가**
   - `revalidate` 설정이 무시됨
   - **해결책:** GitHub Actions로 주기적 재빌드 또는 클라이언트 사이드 페칭

3. **서버 사이드 기능 제한**
   - 미들웨어, 서버 액션 등 제한적
   - **해결책:** 클라이언트 사이드로 대체

4. **빌드 시간 증가**
   - 포스트가 많아질수록 빌드 시간 증가
   - **해결책:** 
     - 페이지네이션으로 빌드 시 생성 페이지 수 제한
     - 클라이언트 사이드 페칭으로 보완

### 최적화 팁

1. **선택적 정적 생성**
   ```typescript
   // 인기 포스트만 정적 생성, 나머지는 클라이언트에서 로드
   export async function generateStaticParams() {
     const popularSlugs = await getPopularSlugs(limit: 50)
     return popularSlugs.map(slug => ({ slug }))
   }
   ```

2. **점진적 로딩**
   - 초기에는 빌드 시 생성된 페이지만 표시
   - 사용자 스크롤 시 클라이언트에서 추가 데이터 로드

3. **캐싱 전략**
   - 클라이언트에서 Supabase 데이터를 localStorage에 캐싱
   - 빌드 시점 데이터와 비교하여 업데이트

---

## 권장 구현 전략

### 하이브리드 접근법 (최적)

1. **빌드 시점**: 주요 페이지 정적 생성
   - 홈페이지
   - 인기 포스트 상세 페이지
   - 모든 카테고리 페이지

2. **클라이언트 사이드**: 최신 콘텐츠 보완
   - 새 포스트 알림
   - 검색 기능
   - 실시간 필터링

3. **자동 재빌드**: 주기적 업데이트
   - GitHub Actions로 매일 자동 재빌드
   - 또는 Supabase Webhook으로 즉시 재빌드

이 방식으로 GitHub Pages의 제한을 우회하면서도 사용자에게 최신 콘텐츠를 제공할 수 있습니다.

---

## 참고 자료

- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Supabase Client Library](https://supabase.com/docs/reference/javascript/introduction)
