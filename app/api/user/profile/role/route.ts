import { getSupabaseClient } from '@/lib/supabase/auth'
import {
  createErrorResponse,
  createSuccessResponse,
  createUnauthorizedResponse,
} from '@/lib/utils/error-handler'

/**
 * 현재 사용자의 역할 조회
 * GET /api/user/profile/role
 */
export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return createUnauthorizedResponse('Authentication required')
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      // 프로필이 없으면 기본값 'user' 반환
      return createSuccessResponse({
        role: 'user',
      })
    }

    return createSuccessResponse({
      role: profile.role || 'user',
    })
  } catch (error: unknown) {
    return createErrorResponse(error, {
      defaultMessage: 'Failed to get user role',
    })
  }
}
