import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storageKey: 'supabase.auth.token',
    storage: {
      getItem: (key) => {
        if (typeof window === 'undefined') {
          return null
        }
        const itemStr = localStorage.getItem(key)
        if (!itemStr) return null
        
        const item = JSON.parse(itemStr)
        
        if (Date.now() > item.expiresAt) {
          localStorage.removeItem(key)
          return null
        }
        return item.value
      },
      setItem: (key, value) => {
        if (typeof window === 'undefined') {
          return
        }
        const expiresAt = Date.now() + 43200000
        localStorage.setItem(key, JSON.stringify({ value, expiresAt }))
      },
      removeItem: (key) => {
        if (typeof window === 'undefined') {
          return
        }
        localStorage.removeItem(key)
      }
    }
  }
}) 