/**
 * 사용자 타입 정의
 */

import type { User } from '@supabase/supabase-js'

export type AppUser = User | null

export interface UserProfile {
  id: string
  email?: string
  created_at?: string
}
