import {
  getAllPosts,
  getAllSlugs,
  getPostBySlug,
  getPostsByCategory,
  type BlogPost,
} from '../posts'

// Supabase 클라이언트 모킹
const mockSupabaseClient = {
  from: jest.fn(),
}

jest.mock('../client', () => {
  const mockClient = {
    from: jest.fn(),
  }
  return {
    createClient: jest.fn(() => mockClient),
    supabase: mockClient,
  }
})

describe('lib/supabase/posts', () => {
  const { supabase } = require('../client')
  const mockSupabase = supabase

  // 테스트용 더미 데이터
  const mockPostData = {
    id: '1',
    slug: 'test-post',
    title: 'Test Post',
    subtitle: 'Test Subtitle',
    content: 'Test Content',
    category: 'JavaScript',
    date: 'JANUARY 1, 2024',
    reading_time: '10 Min',
    hero_image: '/test-image.jpg',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  const mockPostData2 = {
    id: '2',
    slug: 'test-post-2',
    title: 'Test Post 2',
    subtitle: 'Test Subtitle 2',
    content: 'Test Content 2',
    category: 'React',
    date: 'JANUARY 2, 2024',
    reading_time: '5 Min',
    hero_image: '/test-image-2.jpg',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  }

  const expectedBlogPost: BlogPost = {
    slug: 'test-post',
    title: 'Test Post',
    subtitle: 'Test Subtitle',
    date: 'JANUARY 1, 2024',
    category: 'JavaScript',
    readingTime: '10 Min',
    heroImage: '/test-image.jpg',
    content: 'Test Content',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllPosts', () => {
    it('모든 포스트를 성공적으로 가져와야 함', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [mockPostData, mockPostData2],
          error: null,
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await getAllPosts()

      expect(mockSupabase.from).toHaveBeenCalledWith('posts')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', {
        ascending: false,
      })
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        slug: mockPostData.slug,
        title: mockPostData.title,
        subtitle: mockPostData.subtitle,
        date: mockPostData.date,
        category: mockPostData.category,
        readingTime: mockPostData.reading_time,
        heroImage: mockPostData.hero_image,
        content: mockPostData.content,
      })
    })

    it('데이터가 없을 때 빈 배열을 반환해야 함', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await getAllPosts()

      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('에러 발생 시 에러를 throw해야 함', async () => {
      const mockError = {
        message: 'Database connection failed',
        code: 'PGRST301',
      }

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      await expect(getAllPosts()).rejects.toEqual(mockError)
    })

    it('snake_case를 camelCase로 올바르게 변환해야 함', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [mockPostData],
          error: null,
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await getAllPosts()

      expect(result[0].readingTime).toBe(mockPostData.reading_time)
      expect(result[0].heroImage).toBe(mockPostData.hero_image)
      expect(result[0]).not.toHaveProperty('reading_time')
      expect(result[0]).not.toHaveProperty('hero_image')
    })
  })

  describe('getPostsByCategory', () => {
    it('카테고리별 포스트를 성공적으로 가져와야 함', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [mockPostData],
          error: null,
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await getPostsByCategory('JavaScript')

      expect(mockSupabase.from).toHaveBeenCalledWith('posts')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.eq).toHaveBeenCalledWith('category', 'JavaScript')
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', {
        ascending: false,
      })
      expect(result).toHaveLength(1)
      expect(result[0].category).toBe('JavaScript')
    })

    it('해당 카테고리에 포스트가 없을 때 빈 배열을 반환해야 함', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await getPostsByCategory('TypeScript')

      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('에러 발생 시 에러를 throw해야 함', async () => {
      const mockError = {
        message: 'Query failed',
        code: 'PGRST301',
      }

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      await expect(getPostsByCategory('JavaScript')).rejects.toEqual(mockError)
    })
  })

  describe('getPostBySlug', () => {
    it('슬러그로 포스트를 성공적으로 가져와야 함', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockPostData,
          error: null,
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await getPostBySlug('test-post')

      expect(mockSupabase.from).toHaveBeenCalledWith('posts')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.eq).toHaveBeenCalledWith('slug', 'test-post')
      expect(mockQuery.single).toHaveBeenCalled()
      expect(result).toEqual(expectedBlogPost)
    })

    it('포스트가 없을 때 null을 반환해야 함', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: {
            code: 'PGRST116',
            message: 'No rows returned',
          },
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await getPostBySlug('non-existent-post')

      expect(result).toBeNull()
    })

    it('PGRST116 에러 외의 에러 발생 시 에러를 throw해야 함', async () => {
      const mockError = {
        message: 'Database error',
        code: 'PGRST301',
      }

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      await expect(getPostBySlug('test-post')).rejects.toEqual(mockError)
    })

    it('snake_case를 camelCase로 올바르게 변환해야 함', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockPostData,
          error: null,
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await getPostBySlug('test-post')

      expect(result?.readingTime).toBe(mockPostData.reading_time)
      expect(result?.heroImage).toBe(mockPostData.hero_image)
      expect(result).not.toHaveProperty('reading_time')
      expect(result).not.toHaveProperty('hero_image')
    })
  })

  describe('getAllSlugs', () => {
    it('모든 슬러그를 성공적으로 가져와야 함', async () => {
      const mockQuery = {
        select: jest.fn().mockResolvedValue({
          data: [{ slug: 'test-post' }, { slug: 'test-post-2' }, { slug: 'test-post-3' }],
          error: null,
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await getAllSlugs()

      expect(mockSupabase.from).toHaveBeenCalledWith('posts')
      expect(mockQuery.select).toHaveBeenCalledWith('slug')
      expect(result).toEqual(['test-post', 'test-post-2', 'test-post-3'])
      expect(result).toHaveLength(3)
    })

    it('슬러그가 없을 때 빈 배열을 반환해야 함', async () => {
      const mockQuery = {
        select: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await getAllSlugs()

      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('에러 발생 시 에러를 throw해야 함', async () => {
      const mockError = {
        message: 'Query failed',
        code: 'PGRST301',
      }

      const mockQuery = {
        select: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      await expect(getAllSlugs()).rejects.toEqual(mockError)
    })
  })
})
