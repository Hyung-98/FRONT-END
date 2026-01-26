import { getAllPosts, getPostsByCategory } from '@/lib/supabase/posts'
import { supabaseAdmin } from '@/lib/supabase/server'
import { GET, POST } from '../route'

// 의존성 모킹
jest.mock('@/lib/supabase/posts', () => ({
  getAllPosts: jest.fn(),
  getPostsByCategory: jest.fn(),
}))

jest.mock('@/lib/supabase/server', () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}))

// Rate limiting 모킹
jest.mock('@/lib/utils/rate-limit', () => ({
  checkRateLimit: jest.fn(() => ({
    allowed: true,
    remaining: 10,
    resetTime: Date.now() + 60000,
  })),
}))

describe('app/api/rest/posts/route.ts', () => {
  const mockGetAllPosts = getAllPosts as jest.MockedFunction<typeof getAllPosts>
  const mockGetPostsByCategory = getPostsByCategory as jest.MockedFunction<
    typeof getPostsByCategory
  >
  const mockSupabaseAdmin = supabaseAdmin as jest.Mocked<typeof supabaseAdmin>

  const mockBlogPost = {
    slug: 'test-post',
    title: 'Test Post',
    subtitle: 'Test Subtitle',
    date: 'JANUARY 1, 2024',
    category: 'JavaScript',
    readingTime: '10 Min',
    heroImage: '/test-image.jpg',
    content: 'Test Content',
  }

  const mockBlogPost2 = {
    slug: 'test-post-2',
    title: 'Test Post 2',
    subtitle: 'Test Subtitle 2',
    date: 'JANUARY 2, 2024',
    category: 'React',
    readingTime: '5 Min',
    heroImage: '/test-image-2.jpg',
    content: 'Test Content 2',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/rest/posts', () => {
    it('모든 포스트를 성공적으로 반환해야 함', async () => {
      mockGetAllPosts.mockResolvedValue([mockBlogPost, mockBlogPost2])

      const request = new Request('http://localhost:3000/api/rest/posts')
      const response = await GET(request)
      const data = await response.json()

      expect(mockGetAllPosts).toHaveBeenCalledTimes(1)
      expect(data).toEqual({
        success: true,
        data: [mockBlogPost, mockBlogPost2],
        count: 2,
      })
      expect(response.status).toBe(200)
      const cacheControl = response.headers.get('Cache-Control')
      expect(cacheControl).toContain('public')
      expect(cacheControl).toContain('s-maxage=60')
      expect(cacheControl).toContain('stale-while-revalidate=300')
    })

    it('카테고리 쿼리 파라미터가 있을 때 카테고리별 포스트를 반환해야 함', async () => {
      mockGetPostsByCategory.mockResolvedValue([mockBlogPost])

      const request = new Request('http://localhost:3000/api/rest/posts?category=JavaScript')
      const response = await GET(request)
      const data = await response.json()

      expect(mockGetPostsByCategory).toHaveBeenCalledWith('JavaScript')
      expect(mockGetAllPosts).not.toHaveBeenCalled()
      expect(data).toEqual({
        success: true,
        data: [mockBlogPost],
        count: 1,
      })
      expect(response.status).toBe(200)
    })

    it('빈 배열을 반환해야 함 (포스트가 없을 때)', async () => {
      mockGetAllPosts.mockResolvedValue([])

      const request = new Request('http://localhost:3000/api/rest/posts')
      const response = await GET(request)
      const data = await response.json()

      expect(data).toEqual({
        success: true,
        data: [],
        count: 0,
      })
      expect(response.status).toBe(200)
    })

    it('에러 발생 시 500 상태와 에러 메시지를 반환해야 함', async () => {
      const mockError = new Error('Database connection failed')
      mockGetAllPosts.mockRejectedValue(mockError)

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      const request = new Request('http://localhost:3000/api/rest/posts')
      const response = await GET(request)
      const data = await response.json()

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'API Error:',
        expect.objectContaining({
          message: 'Database connection failed',
          status: 500,
        })
      )
      expect(data).toEqual({
        success: false,
        error: 'Database connection failed',
      })
      expect(response.status).toBe(500)

      consoleErrorSpy.mockRestore()
    })

    it('카테고리별 조회 시 에러 발생 시 500 상태를 반환해야 함', async () => {
      const mockError = new Error('Category query failed')
      mockGetPostsByCategory.mockRejectedValue(mockError)

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      const request = new Request('http://localhost:3000/api/rest/posts?category=JavaScript')
      const response = await GET(request)
      const data = await response.json()

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'API Error:',
        expect.objectContaining({
          message: 'Category query failed',
          status: 500,
        })
      )
      expect(data).toEqual({
        success: false,
        error: 'Category query failed',
      })
      expect(response.status).toBe(500)

      consoleErrorSpy.mockRestore()
    })
  })

  describe('POST /api/rest/posts', () => {
    const mockInsertData = {
      id: '1',
      slug: 'new-post',
      title: 'New Post',
      subtitle: 'New Subtitle',
      content: 'New Content',
      category: 'JavaScript',
      date: 'JANUARY 1, 2024',
      reading_time: '10 Min',
      hero_image: '/new-image.jpg',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    it('포스트를 성공적으로 생성해야 함', async () => {
      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockInsertData,
          error: null,
        }),
      }

      mockSupabaseAdmin.from.mockReturnValue(mockQuery as any)

      const requestBody = {
        slug: 'new-post',
        title: 'New Post',
        subtitle: 'New Subtitle',
        content: 'New Content',
        category: 'JavaScript',
      }

      const request = new Request('http://localhost:3000/api/rest/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('posts')
      expect(mockQuery.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'new-post',
          title: 'New Post',
          subtitle: 'New Subtitle',
          content: 'New Content',
          category: 'JavaScript',
        })
      )
      expect(mockQuery.select).toHaveBeenCalled()
      expect(mockQuery.single).toHaveBeenCalled()
      expect(data).toEqual({
        success: true,
        data: mockInsertData,
      })
      expect(response.status).toBe(201)
    })

    it('기본값이 올바르게 설정되어야 함 (category, date, reading_time, hero_image)', async () => {
      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockInsertData,
          error: null,
        }),
      }

      mockSupabaseAdmin.from.mockReturnValue(mockQuery as any)

      const requestBody = {
        slug: 'new-post',
        title: 'New Post',
        subtitle: 'New Subtitle',
        content: 'New Content',
        // category, date, reading_time, hero_image 없음
      }

      const request = new Request('http://localhost:3000/api/rest/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      await POST(request)

      const insertCall = mockQuery.insert.mock.calls[0][0]
      expect(insertCall.category).toBe('JavaScript')
      expect(insertCall.date).toBeDefined()
      expect(insertCall.reading_time).toBe('10 Min')
      expect(insertCall.hero_image).toBe('')
    })

    it('readingTime 필드명도 지원해야 함 (camelCase)', async () => {
      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockInsertData,
          error: null,
        }),
      }

      mockSupabaseAdmin.from.mockReturnValue(mockQuery as any)

      const requestBody = {
        slug: 'new-post',
        title: 'New Post',
        subtitle: 'New Subtitle',
        content: 'New Content',
        readingTime: '15 Min', // camelCase
      }

      const request = new Request('http://localhost:3000/api/rest/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      await POST(request)

      const insertCall = mockQuery.insert.mock.calls[0][0]
      expect(insertCall.reading_time).toBe('15 Min')
    })

    it('heroImage 필드명도 지원해야 함 (camelCase)', async () => {
      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockInsertData,
          error: null,
        }),
      }

      mockSupabaseAdmin.from.mockReturnValue(mockQuery as any)

      const requestBody = {
        slug: 'new-post',
        title: 'New Post',
        subtitle: 'New Subtitle',
        content: 'New Content',
        heroImage: '/custom-image.jpg', // camelCase
      }

      const request = new Request('http://localhost:3000/api/rest/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      await POST(request)

      const insertCall = mockQuery.insert.mock.calls[0][0]
      expect(insertCall.hero_image).toBe('/custom-image.jpg')
    })

    it('slug가 없을 때 400 상태와 에러 메시지를 반환해야 함', async () => {
      const requestBody = {
        title: 'New Post',
        subtitle: 'New Subtitle',
        content: 'New Content',
        // slug 없음
      }

      const request = new Request('http://localhost:3000/api/rest/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data).toEqual({
        success: false,
        error: 'Missing required fields: slug',
      })
      expect(response.status).toBe(400)
      expect(mockSupabaseAdmin.from).not.toHaveBeenCalled()
    })

    it('title이 없을 때 400 상태와 에러 메시지를 반환해야 함', async () => {
      const requestBody = {
        slug: 'new-post',
        subtitle: 'New Subtitle',
        content: 'New Content',
        // title 없음
      }

      const request = new Request('http://localhost:3000/api/rest/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data).toEqual({
        success: false,
        error: 'Missing required fields: title',
      })
      expect(response.status).toBe(400)
    })

    it('subtitle이 없을 때 400 상태와 에러 메시지를 반환해야 함', async () => {
      const requestBody = {
        slug: 'new-post',
        title: 'New Post',
        content: 'New Content',
        // subtitle 없음
      }

      const request = new Request('http://localhost:3000/api/rest/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data).toEqual({
        success: false,
        error: 'Missing required fields: subtitle',
      })
      expect(response.status).toBe(400)
    })

    it('content가 없을 때 400 상태와 에러 메시지를 반환해야 함', async () => {
      const requestBody = {
        slug: 'new-post',
        title: 'New Post',
        subtitle: 'New Subtitle',
        // content 없음
      }

      const request = new Request('http://localhost:3000/api/rest/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data).toEqual({
        success: false,
        error: 'Missing required fields: content',
      })
      expect(response.status).toBe(400)
    })

    it('Supabase 에러 발생 시 400 상태와 에러 메시지를 반환해야 함', async () => {
      const mockError = {
        message: 'Duplicate key value violates unique constraint',
        code: '23505',
      }

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }

      mockSupabaseAdmin.from.mockReturnValue(mockQuery as any)

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      const requestBody = {
        slug: 'new-post',
        title: 'New Post',
        subtitle: 'New Subtitle',
        content: 'New Content',
      }

      const request = new Request('http://localhost:3000/api/rest/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'API Error:',
        expect.objectContaining({
          message: mockError.message,
          status: 400,
        })
      )
      expect(data).toEqual({
        success: false,
        error: mockError.message,
        code: mockError.code,
      })
      expect(response.status).toBe(400)

      consoleErrorSpy.mockRestore()
    })

    it('예상치 못한 에러 발생 시 500 상태를 반환해야 함', async () => {
      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockRejectedValue(new Error('Unexpected error')),
      }

      mockSupabaseAdmin.from.mockReturnValue(mockQuery as any)

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      const requestBody = {
        slug: 'new-post',
        title: 'New Post',
        subtitle: 'New Subtitle',
        content: 'New Content',
      }

      const request = new Request('http://localhost:3000/api/rest/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(consoleErrorSpy).toHaveBeenCalled()
      expect(data).toEqual({
        success: false,
        error: 'Unexpected error',
      })
      expect(response.status).toBe(500)

      consoleErrorSpy.mockRestore()
    })

    it('JSON 파싱 에러 발생 시 500 상태를 반환해야 함', async () => {
      const { checkRateLimit } = require('@/lib/utils/rate-limit')
      // Rate limiting을 통과하도록 설정
      ;(checkRateLimit as jest.Mock).mockReturnValue({
        allowed: true,
        remaining: 10,
        resetTime: Date.now() + 60000,
      })

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      // 유효하지 않은 JSON - Request.json()이 실패하면 에러가 발생
      const request = new Request('http://localhost:3000/api/rest/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json',
      })

      // request.json()이 실패하면 에러가 발생하므로 route.ts의 catch 블록에서 처리됨
      const response = await POST(request)
      const data = await response.json()

      expect(consoleErrorSpy).toHaveBeenCalled()
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
      expect(response.status).toBe(500)

      consoleErrorSpy.mockRestore()
    })
  })
})
