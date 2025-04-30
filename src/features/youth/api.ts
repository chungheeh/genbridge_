import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface Question {
  id: number
  content: string
  createdAt: string
}

export interface Answer {
  id: string
  questionId: string
  content: string
  createdAt: string
}

export async function fetchPendingQuestions(): Promise<Question[]> {
  // TODO: API 구현
  return [
    {
      id: 1,
      content: '스마트폰으로 사진을 정리하는 방법을 알려주세요.',
      createdAt: '2024-03-15T12:00:00Z'
    },
    {
      id: 2,
      content: '유튜브에서 좋아하는 동영상을 저장하는 방법이 궁금합니다.',
      createdAt: '2024-03-15T13:00:00Z'
    }
  ]
}

export async function submitAnswer(questionId: number, data: string | FormData): Promise<void> {
  // TODO: API 구현
  return new Promise((resolve) => setTimeout(resolve, 1000))
} 