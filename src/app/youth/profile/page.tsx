'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LucideUser, LucideMessageCircle, LucideShoppingBag, LucideLogOut, LucideCalendar, LucideMail } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLogout } from '@/hooks/useLogout'
import { createBrowserClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Database } from '@/lib/database.types'

interface Activity {
  id: string
  type: '답변' | '포인트 사용'
  title: string
  created_at: string
  points: number
}

interface Profile {
  id: string
  name: string
  email: string
  role: string
  created_at: string
  points: number
}

interface AnswerWithQuestion {
  id: string
  content: string
  created_at: string
  questions: {
    id: string
    title: string
  }
}

export default function YouthProfilePage() {
  const router = useRouter()
  const { handleLogout } = useLogout()
  const supabase = createBrowserClient()
  
  const [profile, setProfile] = useState<Profile | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [totalAnswers, setTotalAnswers] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfileData() {
      try {
        setIsLoading(true)
        setError(null)

        // 1. 사용자 인증 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          console.error('Auth error:', authError)
          setError('인증 오류가 발생했습니다.')
          router.push('/login')
          return
        }

        if (!user) {
          console.error('No user found')
          setError('로그인이 필요합니다.')
          router.push('/login')
          return
        }

        console.log('Current user:', user)

        // 2. 프로필 정보 조회
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, name, role, created_at, points')
          .eq('id', user.id)
          .single()

        console.log('Profile query result:', { profileData, profileError })

        if (profileError) {
          console.error('Profile error:', profileError)
          
          // RLS 정책이나 권한 문제로 인한 에러인 경우
          if (profileError.code === 'PGRST301') {
            setError('프로필 접근 권한이 없습니다.')
          } else {
            setError('프로필 정보를 불러오는데 실패했습니다.')
          }
          return
        }

        if (!profileData) {
          console.log('Creating new profile for user:', user.id)
          
          // 3. 프로필 생성
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                email: user.email,
                name: user.email?.split('@')[0] || '사용자',
                role: 'junior',
                points: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ])
            .select('id, email, name, role, created_at, points')
            .single()

          console.log('Profile creation result:', { newProfile, createError })

          if (createError) {
            console.error('Profile creation error:', createError)
            setError('프로필 생성에 실패했습니다.')
            return
          }

          if (!newProfile) {
            console.error('No profile data after creation')
            setError('프로필 생성 후 데이터를 불러올 수 없습니다.')
            return
          }

          console.log('New profile created:', newProfile)
          setProfile(newProfile)
        } else {
          console.log('Existing profile found:', profileData)
          setProfile(profileData)
        }

        // 4. 답변 수 조회
        const { count: answersCount, error: answersError } = await supabase
          .from('answers')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)

        if (answersError) {
          console.error('Answers count error:', answersError)
          // 답변 수 조회 실패는 치명적이지 않으므로 계속 진행
          setTotalAnswers(0)
        } else {
          setTotalAnswers(answersCount || 0)
        }

        // 5. 활동 내역 조회
        const { data: answersData, error: activitiesError } = await supabase
          .from('answers')
          .select('id, content, created_at, questions(id, title)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        if (activitiesError) {
          console.error('Activities error:', activitiesError)
          // 활동 내역 조회 실패는 치명적이지 않으므로 빈 배열로 설정
          setActivities([])
        } else if (answersData) {
          console.log('Activities data:', answersData)
          const formattedActivities: Activity[] = (answersData as unknown as AnswerWithQuestion[]).map(answer => ({
            id: answer.id,
            type: '답변' as const,
            title: answer.questions?.title || answer.content,
            created_at: answer.created_at,
            points: 100
          }))
          setActivities(formattedActivities)
        }

      } catch (error) {
        console.error('Unexpected error:', error)
        setError('예기치 않은 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfileData()
  }, [supabase, router])

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">로딩중...</div>
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => router.push('/login')}>
          로그인 페이지로 이동
        </Button>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <p className="text-neutral-500 mb-4">프로필을 불러올 수 없습니다.</p>
        <Button onClick={() => router.push('/login')}>
          로그인 페이지로 이동
        </Button>
      </div>
    )
  }

  const formatPoints = (points: number) => {
    return points > 0 ? "+" + points + "P" : points + "P"
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="flex flex-col md:flex-row gap-4 md:items-end">
        <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
          <AvatarImage src="https://picsum.photos/seed/youth-user/150/150" alt={profile.name} />
          <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{profile.name}</h1>
          <p className="text-neutral-500 flex items-center gap-2">
            <LucideUser className="h-4 w-4 text-youth" />
            {profile.role === 'YOUTH' ? '청년' : profile.role}
          </p>
        </div>
      </div>
      
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
                {profile.email}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-neutral-500">가입일</p>
              <p className="font-medium flex items-center gap-2">
                <LucideCalendar className="h-4 w-4 text-youth" />
                {format(new Date(profile.created_at), 'yyyy년 MM월 dd일', { locale: ko })}
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
                {totalAnswers}회
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-neutral-500">보유 포인트</p>
              <p className="font-medium flex items-center gap-2">
                <LucideShoppingBag className="h-4 w-4 text-youth" />
                {(profile.points || 0).toLocaleString()}P
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
            {activities.length > 0 ? (
              activities.map((activity) => (
                <Card key={activity.id} className="border-youth/10 hover:border-youth/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-youth text-white">{activity.type}</Badge>
                          <span className="text-sm text-neutral-400">
                            {format(new Date(activity.created_at), 'yyyy년 MM월 dd일', { locale: ko })}
                          </span>
                        </div>
                        <h4 className="font-medium">{activity.title}</h4>
                      </div>
                      <span className={activity.points > 0 ? "font-bold text-youth" : "font-bold text-error"}>
                        {formatPoints(activity.points)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-neutral-500">
                아직 활동 내역이 없습니다.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
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