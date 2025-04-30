'use client'

import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LucideHelpCircle, LucideShoppingBag, LucideUser, LucideMessageCircle } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface YouthLayoutProps {
  children: React.ReactNode
  params: {
    username?: string
  }
}

const navigation = [
  {
    name: '답변하기',
    href: '/youth/questions',
    icon: LucideHelpCircle,
  },
  {
    name: '포인트',
    href: '/youth/points',
    icon: LucideShoppingBag,
  },
  {
    name: '내 정보',
    href: '/youth/profile',
    icon: LucideUser,
  },
]

export default function YouthLayout({ children, params }: YouthLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gradient-to-b from-youth-bg/80 via-youth-bg/40 to-white/80">
      <Header />
      <main className="container mx-auto px-4">
        {/* 환영 섹션 */}
        <section className="py-8 border-b border-youth-light/20">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="https://picsum.photos/seed/user/64/64" />
              <AvatarFallback>MZ</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">안녕하세요, {params.username || '청년'}님!</h1>
              <p className="text-neutral-400">오늘도 세대간 소통을 도와주세요 💜</p>
            </div>
          </div>
        </section>

        {/* 네비게이션 */}
        <nav className="py-4 border-b border-youth-light/20 bg-white/60 backdrop-blur-sm sticky top-[65px] z-10">
          <div className="flex gap-4">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                    "hover:bg-youth-bg hover:text-youth",
                    isActive && "bg-youth text-white"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* 메인 콘텐츠 */}
        <div className="py-8">
          {children}
        </div>
      </main>
    </div>
  )
} 