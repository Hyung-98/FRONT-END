import { createClient } from './client'
import type { Database } from './types'

const supabase = createClient()

type Post = Database['public']['Tables']['posts']['Row']

export interface BlogPost {
  slug: string
  title: string
  subtitle: string
  date: string
  category: string
  readingTime: string
  heroImage: string
  content: string
}

// 모든 포스트 가져오기
export async function getAllPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching posts:', error)
    throw error
  }

  return data.map(post => ({
    slug: post.slug,
    title: post.title,
    subtitle: post.subtitle,
    date: post.date,
    category: post.category,
    readingTime: post.reading_time,
    heroImage: post.hero_image,
    content: post.content,
  }))
}

// 카테고리별 포스트 가져오기
export async function getPostsByCategory(category: string): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching posts by category:', error)
    throw error
  }

  return data.map(post => ({
    slug: post.slug,
    title: post.title,
    subtitle: post.subtitle,
    date: post.date,
    category: post.category,
    readingTime: post.reading_time,
    heroImage: post.hero_image,
    content: post.content,
  }))
}

// 슬러그로 포스트 가져오기
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase.from('posts').select('*').eq('slug', slug).single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    console.error('Error fetching post:', error)
    throw error
  }

  return {
    slug: data.slug,
    title: data.title,
    subtitle: data.subtitle,
    date: data.date,
    category: data.category,
    readingTime: data.reading_time,
    heroImage: data.hero_image,
    content: data.content,
  }
}

// 모든 슬러그 가져오기 (generateStaticParams용)
export async function getAllSlugs(): Promise<string[]> {
  const { data, error } = await supabase.from('posts').select('slug')

  if (error) {
    console.error('Error fetching slugs:', error)
    throw error
  }

  return data.map(post => post.slug)
}

// 검색어로 포스트 검색
export async function searchPosts(query: string): Promise<BlogPost[]> {
  if (!query || query.trim().length === 0) {
    return []
  }

  const searchTerm = `%${query.trim()}%`

  // Supabase의 or() 메서드는 올바른 형식으로 사용
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .or(`title.ilike.${searchTerm},subtitle.ilike.${searchTerm},content.ilike.${searchTerm}`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error searching posts:', error)
    throw error
  }

  return data.map(post => ({
    slug: post.slug,
    title: post.title,
    subtitle: post.subtitle,
    date: post.date,
    category: post.category,
    readingTime: post.reading_time,
    heroImage: post.hero_image,
    content: post.content,
  }))
}

// 페이지네이션을 지원하는 포스트 가져오기
export interface PaginatedPosts {
  posts: BlogPost[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export async function getPostsPaginated(
  page: number = 1,
  limit: number = 10
): Promise<PaginatedPosts> {
  const from = (page - 1) * limit
  const to = from + limit - 1

  // 총 개수와 데이터를 동시에 가져오기
  const { data, error, count } = await supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching paginated posts:', error)
    throw error
  }

  const total = count || 0
  const totalPages = Math.ceil(total / limit)

  return {
    posts: (data || []).map(post => ({
      slug: post.slug,
      title: post.title,
      subtitle: post.subtitle,
      date: post.date,
      category: post.category,
      readingTime: post.reading_time,
      heroImage: post.hero_image,
      content: post.content,
    })),
    total,
    page,
    limit,
    totalPages,
  }
}

// 총 포스트 수 가져오기
export async function getPostsCount(): Promise<number> {
  const { count, error } = await supabase.from('posts').select('*', { count: 'exact', head: true })

  if (error) {
    console.error('Error fetching posts count:', error)
    throw error
  }

  return count || 0
}

// 카테고리별 페이지네이션 포스트 가져오기
export async function getPostsByCategoryPaginated(
  category: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedPosts> {
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .eq('category', category)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching paginated posts by category:', error)
    throw error
  }

  const total = count || 0
  const totalPages = Math.ceil(total / limit)

  return {
    posts: (data || []).map(post => ({
      slug: post.slug,
      title: post.title,
      subtitle: post.subtitle,
      date: post.date,
      category: post.category,
      readingTime: post.reading_time,
      heroImage: post.hero_image,
      content: post.content,
    })),
    total,
    page,
    limit,
    totalPages,
  }
}

// 검색 결과 페이지네이션
export async function searchPostsPaginated(
  query: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedPosts> {
  if (!query || query.trim().length === 0) {
    return {
      posts: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    }
  }

  const searchTerm = `%${query.trim()}%`
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .or(`title.ilike.${searchTerm},subtitle.ilike.${searchTerm},content.ilike.${searchTerm}`)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error searching posts:', error)
    throw error
  }

  const total = count || 0
  const totalPages = Math.ceil(total / limit)

  return {
    posts: (data || []).map(post => ({
      slug: post.slug,
      title: post.title,
      subtitle: post.subtitle,
      date: post.date,
      category: post.category,
      readingTime: post.reading_time,
      heroImage: post.hero_image,
      content: post.content,
    })),
    total,
    page,
    limit,
    totalPages,
  }
}

// 모든 고유 카테고리 목록 가져오기
export async function getAllCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('category')
    .order('category', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    throw error
  }

  // 중복 제거
  const uniqueCategories = Array.from(new Set(data.map(post => post.category)))
  return uniqueCategories
}

// 관련 포스트 가져오기 (같은 카테고리, 현재 포스트 제외)
export async function getRelatedPosts(
  currentSlug: string,
  category: string,
  limit: number = 3
): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('category', category)
    .neq('slug', currentSlug)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching related posts:', error)
    throw error
  }

  return (data || []).map(post => ({
    slug: post.slug,
    title: post.title,
    subtitle: post.subtitle,
    date: post.date,
    category: post.category,
    readingTime: post.reading_time,
    heroImage: post.hero_image,
    content: post.content,
  }))
}
