'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export function useLogout() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // 로컬 스토리지에서 토큰 삭제
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token');
      }
      
      // Supabase 로그아웃 처리
      await supabase.auth.signOut()
      
      // 루트 경로로 리디렉션
      router.push('/')
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error)
    }
  }

  return { handleLogout }
} 