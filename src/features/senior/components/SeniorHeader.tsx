'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLogout } from '@/hooks/useLogout'

export function SeniorHeader() {
  const pathname = usePathname()
  const isSeniorPath = pathname.startsWith('/senior')
  const { handleLogout } = useLogout()

  return (
    <header className="w-full py-4">
      <div className="max-w-[1200px] mx-auto px-4 flex justify-between items-center md:justify-between">
        {/* 모바일에서는 빈 div로 공간 확보, 데스크탑에서는 로고 왼쪽 정렬 */}
        <div className="hidden md:block">
          <Link href="/" className="text-2xl font-bold text-foreground">
            GenBridge
          </Link>
        </div>
        
        {/* 모바일에서만 로고 중앙 정렬 */}
        <div className="flex-1 md:hidden text-center">
          <Link href="/" className="text-2xl font-bold text-foreground inline-block">
            GenBridge
          </Link>
        </div>
        
        {/* 데스크탑에서는 Nav 메뉴 */}
        <div className="flex items-center gap-4">
          <button 
            onClick={handleLogout} 
            className="text-base text-muted-foreground hover:text-foreground cursor-pointer"
          >
            로그아웃
          </button>
          <Link href="/senior" className="text-base text-muted-foreground hover:text-foreground">
            홈
          </Link>
          <Link href="/senior/profile" className="text-base text-muted-foreground hover:text-foreground">
            회원
          </Link>
        </div>
      </div>
    </header>
  )
} 