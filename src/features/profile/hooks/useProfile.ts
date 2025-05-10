import { useQuery } from '@tanstack/react-query'
import { fetchProfile, fetchActivities } from '../api'
import { useLogout } from '@/hooks/useLogout'

export function useProfile() {
  const { handleLogout } = useLogout()

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile
  })

  const { data: activities, isLoading: isActivitiesLoading } = useQuery({
    queryKey: ['profile', 'activities'],
    queryFn: fetchActivities
  })

  return {
    profile,
    activities,
    isLoading: isProfileLoading || isActivitiesLoading,
    handleLogout
  }
} 