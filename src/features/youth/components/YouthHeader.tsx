'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface YouthHeaderProps {
  username: string
  description?: string
}

export function YouthHeader({ username, description }: YouthHeaderProps) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src="https://picsum.photos/seed/user/64/64" />
          <AvatarFallback>MZ</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold text-primary">안녕하세요, {username}님!</h1>
          <p className="text-neutral-400">{description || '오늘도 세대간 소통을 도와주세요 💚'}</p>
        </div>
      </div>
    </section>
  )
} 