import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { fetchProfile, fetchActivities } from '../api'

export function useProfile() {
  const router = useRouter()

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile
  })

  const { data: activities, isLoading: isActivitiesLoading } = useQuery({
    queryKey: ['profile', 'activities'],
    queryFn: fetchActivities
  })

  const handleLogout = async () => {
    // 로그아웃 처리 로직
    router.push('/login')
  }

  return {
    profile,
    activities,
    isLoading: isProfileLoading || isActivitiesLoading,
    handleLogout
  }
} 