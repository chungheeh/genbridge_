import { createClient } from '@/lib/supabase/client'

export interface Profile {
  id: string
  name: string
  email: string
  role: '노인' | '청년'
  points: number
  profileImage: string
}

export interface Activity {
  id: string
  type: 'question' | 'answer' | 'point'
  title: string
  date: Date
  status: string
}

export async function fetchProfile(): Promise<Profile> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('인증되지 않은 사용자입니다.')

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) throw error
  return data
}

export async function fetchActivities(): Promise<Activity[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('인증되지 않은 사용자입니다.')

  const { data: activities, error } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) throw error
  return activities.map(activity => ({
    ...activity,
    date: new Date(activity.created_at)
  }))
} 