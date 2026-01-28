import { getCommentTree, createComment } from '@/lib/supabase/comments'
import { getSupabaseClient } from '@/lib/supabase/auth'
import {
  createErrorResponse,
  createSuccessResponse,
  createValidationErrorResponse,
  createUnauthorizedResponse,
} from '@/lib/utils/error-handler'
import { getClientIp, getUserAgent, isValidUUID } from '@/lib/utils/comments'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')
    const maxDepth = parseInt(searchParams.get('maxDepth') || '5', 10)
    const limit = parseInt(searchParams.get('limit') || '100', 10)

    if (!postId) {
      return createValidationErrorResponse('postId is required')
    }

    if (!isValidUUID(postId)) {
      return createValidationErrorResponse('Invalid postId format')
    }

    const comments = await getCommentTree(postId, maxDepth, limit)

    return createSuccessResponse(comments, {
      count: comments.length,
    })
  } catch (error) {
    return createErrorResponse(error, {
      defaultMessage: 'Failed to fetch comments',
    })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return createUnauthorizedResponse('Authentication required')
    }

    const body = await request.json()
    const { postId, content, parentId } = body

    if (!postId || !content) {
      return createValidationErrorResponse('postId and content are required')
    }

    if (!isValidUUID(postId)) {
      return createValidationErrorResponse('Invalid postId format')
    }

    if (typeof content !== 'string' || content.trim().length === 0) {
      return createValidationErrorResponse('Content cannot be empty')
    }

    if (content.length > 2000) {
      return createValidationErrorResponse('Content too long (max 2000 characters)')
    }

    if (parentId && !isValidUUID(parentId)) {
      return createValidationErrorResponse('Invalid parentId format')
    }

    const clientIp = getClientIp(request)
    const userAgent = getUserAgent(request)

    // 서버 사이드 Supabase 클라이언트를 사용하여 댓글 생성
    const comment = await createComment(
      {
        postId,
        content: content.trim(),
        parentId: parentId || null,
        actorIp: clientIp || null,
        userAgent: userAgent || null,
      },
      supabase
    )

    return createSuccessResponse(comment, {
      status: 201,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create comment'

    // Rate limit 에러 처리
    if (errorMessage.includes('Rate limit')) {
      return createErrorResponse(error, {
        status: 429,
        defaultMessage: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.',
      })
    }

    return createErrorResponse(error, {
      defaultMessage: 'Failed to create comment',
    })
  }
}
