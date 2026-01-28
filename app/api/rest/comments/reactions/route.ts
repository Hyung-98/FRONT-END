import { getCommentTree } from '@/lib/supabase/comments'
import { getSupabaseClient } from '@/lib/supabase/auth'
import {
  createErrorResponse,
  createSuccessResponse,
  createValidationErrorResponse,
  createUnauthorizedResponse,
} from '@/lib/utils/error-handler'
import { isValidUUID } from '@/lib/utils/comments'

/** 현재 사용자의 해당 글 댓글에 대한 좋아요/싫어요 반응 목록 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')

    if (!postId) {
      return createValidationErrorResponse('postId is required')
    }

    if (!isValidUUID(postId)) {
      return createValidationErrorResponse('Invalid postId format')
    }

    const supabase = await getSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return createUnauthorizedResponse('Authentication required')
    }

    const comments = await getCommentTree(postId)
    const commentIds = comments.map(c => c.id)

    if (commentIds.length === 0) {
      return createSuccessResponse({} as Record<string, 'like' | 'dislike'>)
    }

    const { data: rows } = await supabase
      .from('comment_reactions')
      .select('comment_id, reaction_type')
      .eq('user_id', user.id)
      .in('comment_id', commentIds)

    const userReactions: Record<string, 'like' | 'dislike'> = {}
    for (const r of rows ?? []) {
      userReactions[r.comment_id] = r.reaction_type
    }

    return createSuccessResponse(userReactions)
  } catch (error: unknown) {
    return createErrorResponse(error, {
      defaultMessage: 'Failed to fetch user reactions',
    })
  }
}
