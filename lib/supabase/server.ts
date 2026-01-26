import { createClient } from '@supabase/supabase-js'
import { serverEnv } from '@/lib/config/env'

// 서버 사이드에서만 사용하는 클라이언트 (RLS 우회)
export const supabaseAdmin = createClient(serverEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
