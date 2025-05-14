'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useProfile } from '@/features/profile/hooks/useProfile'
import { Skeleton } from '@/components/ui/skeleton'
import type { Profile, Activity } from '@/features/profile/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from 'react'
import { SeniorHeader } from '@/features/senior/components/SeniorHeader'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

// 임시 활동 타입 정의
interface SampleActivity {
  id: string
  type: 'question' | 'answer' | 'point'
  title: string
  date: Date
  status: string
}

export default function SeniorProfilePage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [activities, setActivities] = useState<SampleActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)

  useEffect(() => {
    async function loadProfileData() {
      try {
        // 현재 로그인한 사용자 정보 가져오기
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          console.error('인증 에러:', authError)
          setError('인증에 실패했습니다.')
          setIsLoading(false)
          return
        }

        if (!user) {
          router.push('/login')
          return
        }

        // 프로필 정보 가져오기
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('프로필 데이터 에러:', profileError)
          
          // 기본 프로필 데이터 생성
          const defaultProfile: Profile = {
            id: user.id,
            name: user.email?.split('@')[0] || '사용자',
            email: user.email || '',
            role: '노인',
            points: 0,
            profileImage: 'https://picsum.photos/seed/genbridge-profile/400/200'
          }
          
          setProfile(defaultProfile)
        } else {
          // 기본 이미지 추가
          setProfile({
            ...profileData,
            profileImage: profileData.profileImage || 'https://picsum.photos/seed/genbridge-profile/400/200'
          })
        }

        // 데이터베이스에서 questions 테이블 확인
        try {
          // 사용자의 질문 데이터 가져오기
          const { data: questionsData, error: questionsError } = await supabase
            .from('questions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5)

          if (!questionsError && questionsData) {
            // 질문 데이터를 활동 데이터 형식으로 변환
            const questionActivities = questionsData.map(question => ({
              id: question.id,
              type: 'question' as const,
              title: question.content.substring(0, 50) + (question.content.length > 50 ? '...' : ''),
              date: new Date(question.created_at),
              status: question.status === 'pending' ? '답변 대기중' : '답변 완료'
            }))
            
            setActivities(questionActivities)
          } else {
            console.log('질문 데이터를 가져올 수 없습니다:', questionsError)
            setActivities([])
          }
        } catch (e) {
          console.error('질문 데이터 로딩 오류:', e)
          setActivities([])
        }
      } catch (e) {
        console.error('프로필 페이지 로딩 중 오류:', e)
        setError('데이터를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfileData()
  }, [supabase, router])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('로그아웃 오류:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <SeniorHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-2 mb-6">
            <h2 className="text-2xl font-bold">내 프로필</h2>
            <p className="text-neutral-400">개인정보와 활동 내역을 확인할 수 있습니다</p>
          </div>
          
          <Card className="mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div>
                  <Skeleton className="h-8 w-40 mb-2" />
                  <Skeleton className="h-4 w-60" />
                  <div className="flex items-center mt-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24 ml-4" />
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    {i > 1 && <Separator className="my-4" />}
                    <div className="flex justify-between items-center">
                      <div>
                        <Skeleton className="h-6 w-80 mb-2" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <SeniorHeader />
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-error">오류 발생</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center mb-4">{error}</p>
              <div className="flex justify-center">
                <Button onClick={() => window.location.reload()}>다시 시도</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SeniorHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-2 mb-6">
          <h2 className="text-2xl font-bold">내 프로필</h2>
          <p className="text-neutral-400">개인정보와 활동 내역을 확인할 수 있습니다</p>
        </div>
        
        {/* 프로필 카드 */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="https://picsum.photos/seed/genbridge-profile/400/200" alt={profile?.name || '사용자'} />
                <AvatarFallback>{profile?.name?.[0] || '사'}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl mb-2">{profile?.name || '사용자'}</CardTitle>
                <p className="text-neutral-400">{profile?.email || '이메일 정보 없음'}</p>
                <div className="flex items-center mt-2">
                  <span className="bg-primary text-white px-3 py-1 rounded-full text-sm">
                    {profile?.role || '노인'}
                  </span>
                  <span className="ml-4 text-primary font-semibold">
                    {profile?.points?.toLocaleString() || '0'}P
                  </span>
                </div>
              </div>
            </div>
            <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
              <DialogTrigger asChild>
                <button 
                  className="flex items-center text-error hover:bg-error/10 px-4 py-2 rounded-lg transition-colors"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  로그아웃
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>로그아웃</DialogTitle>
                  <DialogDescription>
                    정말 로그아웃 하시겠습니까?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsLogoutDialogOpen(false)}>
                    취소
                  </Button>
                  <Button variant="destructive" onClick={() => {
                    setIsLogoutDialogOpen(false)
                    handleLogout()
                  }}>
                    로그아웃
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
        </Card>

        {/* 활동 내역 */}
        <Card>
          <CardHeader>
            <CardTitle>활동 내역</CardTitle>
          </CardHeader>
          <CardContent>
            {activities && activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={activity.id}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{activity.title}</h3>
                        <p className="text-sm text-neutral-400">
                          {format(activity.date, 'PPP', { locale: ko })}
                        </p>
                      </div>
                      <div>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          activity.type === 'point' 
                            ? 'bg-primary/10 text-primary' 
                            : activity.type === 'question'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-neutral-100'
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                아직 활동 내역이 없습니다.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 