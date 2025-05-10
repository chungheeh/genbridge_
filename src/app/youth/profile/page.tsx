'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LucideUser, LucideMessageCircle, LucideShoppingBag, LucideLogOut, LucideCalendar, LucideMail } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLogout } from '@/hooks/useLogout'

export default function YouthProfilePage() {
  const router = useRouter()
  const { handleLogout } = useLogout()
  
  const [user, setUser] = useState({
    name: '김청년',
    email: 'youth@example.com',
    role: '청년',
    joinDate: '2024년 1월 15일',
    totalAnswers: 12,
    totalPoints: 1200,
    activities: [
      { id: 1, type: '답변', title: '스마트폰으로 사진 정리하는 방법', date: '2024년 3월 1일', points: 100 },
      { id: 2, type: '답변', title: '유튜브 동영상 저장하는 방법', date: '2024년 2월 28일', points: 100 },
      { id: 3, type: '답변', title: '카카오톡에서 사진 여러장 보내는 방법', date: '2024년 2월 25일', points: 100 },
      { id: 4, type: '포인트 사용', title: '기프티콘 교환', date: '2024년 2월 20일', points: -500 },
    ]
  })

  // 실제 데이터 패칭은 useEffect에서 처리
  useEffect(() => {
    // TODO: API 호출로 실제 사용자 데이터 가져오기
    // const fetchUserData = async () => {
    //   const response = await fetch('/api/youth/profile')
    //   const data = await response.json()
    //   setUser(data)
    // }
    // fetchUserData()
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      {/* 헤더 */}
      <div className="flex flex-col md:flex-row gap-4 md:items-end">
        <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
          <AvatarImage src="https://picsum.photos/seed/youth-user/150/150" alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-neutral-500 flex items-center gap-2">
            <LucideUser className="h-4 w-4 text-youth" />
            {user.role}
          </p>
        </div>
      </div>
      
      {/* 정보 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-youth/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LucideUser className="text-youth" />
              기본 정보
            </CardTitle>
            <CardDescription>
              계정과 관련된 기본 정보입니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-neutral-500">이메일</p>
              <p className="font-medium flex items-center gap-2">
                <LucideMail className="h-4 w-4 text-youth" />
                {user.email}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-neutral-500">가입일</p>
              <p className="font-medium flex items-center gap-2">
                <LucideCalendar className="h-4 w-4 text-youth" />
                {user.joinDate}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-youth/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LucideMessageCircle className="text-youth" />
              활동 요약
            </CardTitle>
            <CardDescription>
              지금까지의 활동과 포인트 정보입니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-neutral-500">답변 횟수</p>
              <p className="font-medium flex items-center gap-2">
                <LucideMessageCircle className="h-4 w-4 text-youth" />
                {user.totalAnswers}회
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-neutral-500">보유 포인트</p>
              <p className="font-medium flex items-center gap-2">
                <LucideShoppingBag className="h-4 w-4 text-youth" />
                {user.totalPoints.toLocaleString()}P
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="border-youth/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LucideCalendar className="text-youth" />
            활동 내역
          </CardTitle>
          <CardDescription>
            답변 및 포인트 사용 내역을 확인하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {user.activities.map((activity) => (
              <Card key={activity.id} className="border-youth/10 hover:border-youth/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {activity.type === '답변' ? (
                          <Badge className="bg-youth text-white">{activity.type}</Badge>
                        ) : (
                          <Badge className="bg-neutral-200 text-neutral-700">{activity.type}</Badge>
                        )}
                        <span className="text-sm text-neutral-400">{activity.date}</span>
                      </div>
                      <h4 className="font-medium">{activity.title}</h4>
                    </div>
                    <span className={`font-bold ${activity.points > 0 ? 'text-youth' : 'text-error'}`}>
                      {activity.points > 0 ? `+${activity.points}P` : `${activity.points}P`}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* 로그아웃 버튼 */}
      <Button 
        variant="outline" 
        className="w-full border-youth text-youth hover:bg-youth hover:text-white"
        onClick={handleLogout}
      >
        <LucideLogOut className="h-4 w-4 mr-2" />
        로그아웃
      </Button>
    </div>
  )
} 