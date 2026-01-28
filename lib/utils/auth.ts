import { supabaseAdmin } from '@/lib/supabase/server'
import type { Session } from '@supabase/supabase-js'

/**
 * 사용자 역할 조회
 * @param userId 사용자 ID
 * @returns 사용자 역할 (admin, user, moderator 등) 또는 null
 */
export async function getUserRole(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Failed to get user role:', error)
      return null
    }

    return data?.role || null
  } catch (error) {
    console.error('Error getting user role:', error)
    return null
  }
}

/**
 * 관리자 여부 확인
 * @param userId 사용자 ID
 * @returns 관리자 여부
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId)
  return role === 'admin'
}

/**
 * 관리자 권한 필수 체크 (서버 사이드)
 * @param session Supabase 세션
 * @returns 관리자 여부, 세션이 없으면 false
 */
export async function requireAdmin(session: Session | null): Promise<boolean> {
  if (!session?.user) {
    return false
  }

  return await isAdmin(session.user.id)
}

/**
 * 사용자 프로필 생성 또는 업데이트
 * @param userId 사용자 ID
 * @param role 역할 (기본값: 'user')
 * @param displayName 표시 이름 (선택)
 * @returns 성공 여부
 */
export async function createOrUpdateProfile(
  userId: string,
  role: string = 'user',
  displayName?: string | null
): Promise<boolean> {
  try {
    const row: Record<string, unknown> = {
      id: userId,
      role,
      updated_at: new Date().toISOString(),
    }
    if (displayName !== undefined) {
      row.display_name = displayName === '' ? null : displayName
    }
    const { error } = await supabaseAdmin.from('profiles').upsert(row, {
      onConflict: 'id',
    })

    if (error) {
      console.error('Failed to create/update profile:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error creating/updating profile:', error)
    return false
  }
}

/**
 * 프로필 표시 이름만 업데이트
 */
export async function updateProfileDisplayName(
  userId: string,
  displayName: string | null
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        display_name: displayName === '' ? null : displayName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      console.error('Failed to update display_name:', error)
      return false
    }
    return true
  } catch (error) {
    console.error('Error updating display_name:', error)
    return false
  }
}
