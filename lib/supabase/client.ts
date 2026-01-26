import { createBrowserClient } from '@supabase/ssr'
import { getClientEnvConfig } from '@/lib/config/env'

export function createClient() {
  const { supabaseUrl, supabaseAnonKey } = getClientEnvConfig()

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = createClient()
