import { supabase } from './client'
import type { Database } from './types'

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

  return data.map((post) => ({
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

  return data.map((post) => ({
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
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single()

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
  const { data, error } = await supabase
    .from('posts')
    .select('slug')

  if (error) {
    console.error('Error fetching slugs:', error)
    throw error
  }

  return data.map((post) => post.slug)
}