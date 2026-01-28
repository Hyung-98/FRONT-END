import { toggleReaction } from '@/lib/supabase/comments'
import { getSupabaseClient } from '@/lib/supabase/auth'
import type { ReactionType } from '@/lib/supabase/types'
import {
  createErrorResponse,
  createSuccessResponse,
  createValidationErrorResponse,
  createUnauthorizedResponse,
} from '@/lib/utils/error-handler'
import { isValidUUID } from '@/lib/utils/comments'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!isValidUUID(id)) {
      return createValidationErrorResponse('Invalid comment ID format')
    }

    const supabase = await getSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return createUnauthorizedResponse('Authentication required')
    }

    const body = await request.json()
    const { reactionType } = body

    if (!reactionType || !['like', 'dislike'].includes(reactionType)) {
      return createValidationErrorResponse('reactionType must be "like" or "dislike"')
    }

    const result = await toggleReaction(
      {
        commentId: id,
        reactionType: reactionType as ReactionType,
      },
      supabase
    )

    return createSuccessResponse(result)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to toggle reaction'

    if (errorMessage.includes('Rate limit')) {
      return createErrorResponse(error, {
        status: 429,
        defaultMessage: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.',
      })
    }

    return createErrorResponse(error, {
      defaultMessage: 'Failed to toggle reaction',
    })
  }
}
