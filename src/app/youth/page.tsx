'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LucideHelpCircle, LucideShoppingBag, LucideUser, LucideMessageCircle } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/Header'

interface YouthHomeProps {
  params: {
    username: string
  }
}

export default function YouthHome({ params }: YouthHomeProps) {
  const [stats, setStats] = useState({
    waitingQuestions: 3,
    points: 1200,
    totalAnswers: 12
  })

  const [recentAnswers] = useState([
    {
      id: 1,
      title: '스마트폰으로 사진 정리하는 방법',
      date: '2024년 3월 1일',
      content: '스마트폰에서 사진을 정리하는 방법을 상세히 설명드렸습니다. 갤러리 앱에서 앨범을 만들고...'
    },
    {
      id: 2,
      title: '스마트폰으로 사진 정리하는 방법',
      date: '2024년 3월 2일',
      content: '스마트폰에서 사진을 정리하는 방법을 상세히 설명드렸습니다. 갤러리 앱에서 앨범을 만들고...'
    },
    {
      id: 3,
      title: '스마트폰으로 사진 정리하는 방법',
      date: '2024년 3월 3일',
      content: '스마트폰에서 사진을 정리하는 방법을 상세히 설명드렸습니다. 갤러리 앱에서 앨범을 만들고...'
    }
  ])

  // 실제 데이터 패칭은 useEffect에서 처리
  useEffect(() => {
    // TODO: API 호출로 실제 데이터 가져오기
    // const fetchData = async () => {
    //   const response = await fetch('/api/youth/stats')
    //   const data = await response.json()
    //   setStats(data)
    // }
    // fetchData()
  }, [])

  return (
    <div className="space-y-8">
      {/* 메인 액션 섹션 */}
      <section className="grid gap-4 md:grid-cols-3">
        <Link href="/youth/questions">
          <Card className="hover:border-youth transition-colors group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LucideHelpCircle className="text-youth" />
                답변하기
              </CardTitle>
              <CardDescription>
                시니어분들의 질문에 답변해주세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-youth group-hover:text-youth-hover transition-colors">{stats.waitingQuestions}개</div>
              <p className="text-sm text-neutral-400">답변을 기다리는 질문</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/youth/points">
          <Card className="hover:border-youth transition-colors group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LucideShoppingBag className="text-youth" />
                스토어 및 포인트
              </CardTitle>
              <CardDescription>
                답변으로 모은 포인트를 사용해보세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-youth group-hover:text-youth-hover transition-colors">{stats.points}P</div>
              <p className="text-sm text-neutral-400">사용 가능한 포인트</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/youth/profile">
          <Card className="hover:border-youth transition-colors group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LucideUser className="text-youth" />
                내 정보
              </CardTitle>
              <CardDescription>
                프로필과 활동 내역을 확인하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-youth group-hover:text-youth-hover transition-colors">{stats.totalAnswers}개</div>
              <p className="text-sm text-neutral-400">총 답변 수</p>
            </CardContent>
          </Card>
        </Link>
      </section>

      {/* 나의 답변 섹션 */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <LucideMessageCircle className="text-youth" />
          나의 최근 답변
        </h2>
        <div className="grid gap-4">
          {recentAnswers.map((answer) => (
            <Card key={answer.id} className="hover:border-youth transition-colors group">
              <CardHeader>
                <CardTitle className="text-lg group-hover:text-youth transition-colors">{answer.title}</CardTitle>
                <CardDescription>
                  {answer.date}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-400 line-clamp-2">
                  {answer.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
} 