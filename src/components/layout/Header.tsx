'use client'

import Link from 'next/link'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { usePathname } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLogout } from '@/hooks/useLogout'

const navigation = [
  { name: '답변하기', href: '/youth/questions' },
  { name: '스토어', href: '/youth/points' },
  { name: '홈', href: '/youth' },
]

export function Header() {
  const pathname = usePathname()
  const { handleLogout } = useLogout()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container px-4 md:px-6 flex h-14 items-center">
        <Sheet>
          <SheetTrigger asChild>
            <button className="flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">메뉴 열기</span>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="md:hidden">
            <nav className="flex flex-col space-y-4 p-4 text-sm font-medium">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition-colors hover:text-primary ${
                    pathname === item.href ? 'text-primary' : 'text-neutral-500'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="ml-4 md:ml-0 flex items-center space-x-2">
          <span className="text-xl font-bold">GenBridge</span>
        </Link>

        <div className="flex flex-1 justify-end items-center space-x-6">
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors hover:text-primary ${
                  pathname === item.href ? 'text-primary' : 'text-neutral-500'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-2 hover:opacity-80">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://picsum.photos/seed/user/32/32" />
                  <AvatarFallback>MZ</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-block text-sm text-neutral-600">김청년</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>내 계정</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/youth/profile">
                <DropdownMenuItem>
                  프로필 설정
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem className="text-red-500" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>로그아웃</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
} 