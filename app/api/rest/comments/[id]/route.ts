import { updateComment, deleteComment } from '@/lib/supabase/comments'
import { getSupabaseClient } from '@/lib/supabase/auth'
import {
  createErrorResponse,
  createSuccessResponse,
  createValidationErrorResponse,
  createUnauthorizedResponse,
  createNotFoundResponse,
} from '@/lib/utils/error-handler'
import { isValidUUID } from '@/lib/utils/comments'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
    const { content, editReason } = body

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return createValidationErrorResponse('Content cannot be empty')
    }

    if (content.length > 2000) {
      return createValidationErrorResponse('Content too long (max 2000 characters)')
    }

    const comment = await updateComment(
      {
        commentId: id,
        content: content.trim(),
        editReason: editReason || null,
      },
      supabase
    )

    return createSuccessResponse(comment)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update comment'

    if (errorMessage.includes('not found') || errorMessage.includes('no permission')) {
      return createNotFoundResponse('Comment not found or no permission')
    }

    if (errorMessage.includes('Rate limit')) {
      return createErrorResponse(error, {
        status: 429,
        defaultMessage: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.',
      })
    }

    return createErrorResponse(error, {
      defaultMessage: 'Failed to update comment',
    })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const success = await deleteComment(id, supabase)

    if (!success) {
      return createNotFoundResponse('Comment not found or no permission')
    }

    return createSuccessResponse(
      { success: true },
      {
        message: 'Comment deleted successfully',
      }
    )
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete comment'

    if (errorMessage.includes('not found') || errorMessage.includes('no permission')) {
      return createNotFoundResponse('Comment not found or no permission')
    }

    return createErrorResponse(error, {
      defaultMessage: 'Failed to delete comment',
    })
  }
}
