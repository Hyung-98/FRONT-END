import { reportComment } from '@/lib/supabase/comments'
import { getSupabaseClient } from '@/lib/supabase/auth'
import type { ReportReason } from '@/lib/supabase/types'
import {
  createErrorResponse,
  createSuccessResponse,
  createValidationErrorResponse,
  createUnauthorizedResponse,
} from '@/lib/utils/error-handler'
import { isValidUUID } from '@/lib/utils/comments'

const VALID_REPORT_REASONS: ReportReason[] = [
  'spam',
  'offensive',
  'harassment',
  'misinformation',
  'violence',
  'hate_speech',
  'other',
]

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
    const { reason, description } = body

    if (!reason || !VALID_REPORT_REASONS.includes(reason)) {
      return createValidationErrorResponse(
        `reason must be one of: ${VALID_REPORT_REASONS.join(', ')}`
      )
    }

    const result = await reportComment({
      commentId: id,
      reason: reason as ReportReason,
      description: description || null,
    })

    return createSuccessResponse(result, {
      status: 201,
      message: 'Report submitted successfully',
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to report comment'

    if (errorMessage.includes('Rate limit') || errorMessage.includes('Too many reports')) {
      return createErrorResponse(error, {
        status: 429,
        defaultMessage: '너무 많은 신고 요청입니다. 잠시 후 다시 시도해주세요.',
      })
    }

    return createErrorResponse(error, {
      defaultMessage: 'Failed to report comment',
    })
  }
}
