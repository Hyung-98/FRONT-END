import { createOrUpdateProfile, updateProfileDisplayName } from '@/lib/utils/auth'
import { getSupabaseClient } from '@/lib/supabase/auth'
import {
  createErrorResponse,
  createSuccessResponse,
  createUnauthorizedResponse,
  createValidationErrorResponse,
} from '@/lib/utils/error-handler'

/**
 * 내 프로필 조회
 * GET /api/user/profile
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

    const { data, error } = await supabase
      .from('profiles')
      .select('display_name, avatar_url, role')
      .eq('id', user.id)
      .single()

    if (error || !data) {
      return createSuccessResponse({
        display_name: null,
        avatar_url: null,
        role: 'user',
      })
    }

    return createSuccessResponse({
      display_name: data.display_name ?? null,
      avatar_url: data.avatar_url ?? null,
      role: data.role ?? 'user',
    })
  } catch (error: unknown) {
    return createErrorResponse(error, {
      defaultMessage: 'Failed to get profile',
    })
  }
}

/**
 * 프로필 생성 또는 업데이트
 * POST /api/user/profile
 */
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
    const { userId, role, display_name: displayName } = body

    // 요청한 사용자와 인증된 사용자가 일치하는지 확인
    if (userId !== user.id) {
      return createUnauthorizedResponse('You can only create/update your own profile')
    }

    if (!userId) {
      return createValidationErrorResponse('userId is required')
    }

    // role이 제공되지 않으면 기본값 'user' 사용
    const userRole = role || 'user'

    // 유효한 role인지 확인
    const validRoles = ['user', 'admin', 'moderator']
    if (!validRoles.includes(userRole)) {
      return createValidationErrorResponse(`Invalid role. Must be one of: ${validRoles.join(', ')}`)
    }

    const success = await createOrUpdateProfile(
      userId,
      userRole,
      displayName !== undefined ? displayName : undefined
    )

    if (!success) {
      return createErrorResponse(new Error('Failed to create/update profile'), {
        defaultMessage: 'Failed to create/update profile',
      })
    }

    return createSuccessResponse(
      {
        userId,
        role: userRole,
        display_name: displayName ?? null,
      },
      {
        message: 'Profile created/updated successfully',
      }
    )
  } catch (error: unknown) {
    return createErrorResponse(error, {
      defaultMessage: 'Failed to create/update profile',
    })
  }
}

/**
 * 프로필 표시 이름 수정
 * PATCH /api/user/profile
 * Body: { display_name: string | null }
 */
export async function PATCH(request: Request) {
  try {
    const supabase = await getSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return createUnauthorizedResponse('Authentication required')
    }

    const body = await request.json()
    const displayName = body.display_name

    if (displayName !== undefined && typeof displayName !== 'string' && displayName !== null) {
      return createValidationErrorResponse('display_name must be a string or null')
    }

    const value = displayName === undefined ? null : displayName === '' ? null : displayName

    if (typeof value === 'string' && value.length > 100) {
      return createValidationErrorResponse('display_name is too long (max 100)')
    }

    const success = await updateProfileDisplayName(user.id, value)

    if (!success) {
      return createErrorResponse(new Error('Failed to update display name'), {
        defaultMessage: 'Failed to update display name',
      })
    }

    return createSuccessResponse({ display_name: value }, { message: 'Display name updated' })
  } catch (error: unknown) {
    return createErrorResponse(error, {
      defaultMessage: 'Failed to update profile',
    })
  }
}
