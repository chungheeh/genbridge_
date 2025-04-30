'use client'

import { Card } from '@/components/ui/card'
import { QuestionList } from '@/features/youth/components/QuestionList'
import { AnswerForm } from '@/features/youth/components/AnswerForm'

export default function YouthQuestionsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">답변 대기 중인 질문</h2>
        <p className="text-neutral-400">시니어분들의 질문에 답변해주세요. 자세하고 친절한 답변은 더 많은 포인트를 받을 수 있습니다.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <QuestionList />
      </div>
    </div>
  )
} 