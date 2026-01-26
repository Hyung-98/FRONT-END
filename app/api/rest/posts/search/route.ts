import { searchPostsPaginated } from '@/lib/supabase/posts'
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/error-handler'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '10', 10)

  if (!query || query.trim().length === 0) {
    return createSuccessResponse(
      {
        posts: [],
        total: 0,
        page: 1,
        limit,
        totalPages: 0,
        query: '',
      },
      {
        count: 0,
        message: '검색어를 입력해주세요.',
      }
    )
  }

  try {
    const result = await searchPostsPaginated(query, page, limit)
    return createSuccessResponse(
      {
        ...result,
        query,
      },
      {
        count: result.posts.length,
      }
    )
  } catch (error) {
    return createErrorResponse(error, {
      defaultMessage: 'Failed to search posts',
    })
  }
}
