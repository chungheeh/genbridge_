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
import { useState } from 'react'

export default function ProfilePage() {
  const { profile: profileData, activities, isLoading, handleLogout } = useProfile()
  const profile = profileData as Profile | null
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
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
    )
  }

  if (!profile) return null

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 프로필 카드 */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.profileImage} alt={profile.name} />
              <AvatarFallback>{profile.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl mb-2">{profile.name}</CardTitle>
              <p className="text-neutral-400">{profile.email}</p>
              <div className="flex items-center mt-2">
                <span className="bg-primary text-white px-3 py-1 rounded-full text-sm">
                  {profile.role}
                </span>
                <span className="ml-4 text-primary font-semibold">
                  {profile.points.toLocaleString()}P
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
          <div className="space-y-4">
            {(activities as Activity[])?.map((activity, index) => (
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
                        : 'bg-neutral-100'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 