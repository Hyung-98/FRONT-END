import Footer from '@/components/Footer'
import Header from '@/components/Header'
import HomeContent from '@/components/HomeContent'
import { BlogPost, getAllPosts } from '@/lib/supabase/posts'

// Next.js 캐싱: 60초마다 재검증
export const revalidate = 60

export default async function Home() {
  // 서버 컴포넌트에서 직접 데이터 가져오기 (최적화)
  const blogPosts: BlogPost[] = await getAllPosts()
  
  // 첫 번째 포스트를 Featured로 사용
  const featuredPost = blogPosts[0]
  const recentPosts = blogPosts.slice(1)

  return (
    <>
      <Header />
      <HomeContent featuredPost={featuredPost} recentPosts={recentPosts} />
      <Footer />
    </>
  )
}
