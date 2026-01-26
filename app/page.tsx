import Footer from '@/components/Footer'
import Header from '@/components/Header'
import HomeContent from '@/components/HomeContent'
import {
  getAllCategories,
  getAllPosts,
  getPostsByCategoryPaginated,
  getPostsPaginated,
} from '@/lib/supabase/posts'

// Next.js 캐싱: 60초마다 재검증
export const revalidate = 60

// 클라이언트 필터링 모드 활성화 여부
// true로 설정하면 전체 포스트를 로드하여 클라이언트에서 필터링
// false로 설정하면 기존 서버 사이드 필터링 사용 (기본값)
const ENABLE_CLIENT_FILTERING = true

interface HomeProps {
  searchParams: { page?: string; category?: string }
}

export default async function Home({ searchParams }: HomeProps) {
  const currentPage = parseInt(searchParams.page || '1', 10)
  const category = searchParams.category
  const postsPerPage = 10

  // 카테고리 목록 가져오기
  const categories = await getAllCategories()

  // 클라이언트 필터링 모드인 경우 전체 포스트 로드
  if (ENABLE_CLIENT_FILTERING) {
    const allPosts = await getAllPosts()

    // 첫 번째 포스트를 Featured로 사용 (카테고리 필터 없을 때만)
    const featuredPost = !category && allPosts.length > 0 ? allPosts[0] : undefined

    return (
      <>
        <Header />
        <main id="main-content">
          <HomeContent
            featuredPost={featuredPost}
            recentPosts={[]} // 클라이언트 필터링 모드에서는 사용되지 않음
            currentPage={currentPage}
            totalPages={1} // 클라이언트 필터링 모드에서는 사용되지 않음
            categories={categories}
            currentCategory={category}
            allPosts={allPosts}
            clientFiltering={true}
            postsPerPage={postsPerPage}
          />
        </main>
        <Footer />
      </>
    )
  }

  // 서버 사이드 필터링 모드 (기본 동작)
  const result = category
    ? await getPostsByCategoryPaginated(category, currentPage, postsPerPage)
    : await getPostsPaginated(currentPage, postsPerPage)

  const { posts, totalPages, page } = result

  // 첫 번째 포스트를 Featured로 사용 (첫 페이지일 때만, 카테고리 필터 없을 때만)
  const featuredPost = !category && page === 1 && posts.length > 0 ? posts[0] : undefined
  const recentPosts = !category && page === 1 ? posts.slice(1) : posts

  return (
    <>
      <Header />
      <main id="main-content">
        <HomeContent
          featuredPost={featuredPost}
          recentPosts={recentPosts}
          currentPage={page}
          totalPages={totalPages}
          categories={categories}
          currentCategory={category}
        />
      </main>
      <Footer />
    </>
  )
}
