'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useQuery } from '@tanstack/react-query'
import { fetchPendingQuestions, Question } from '../api'
import { AnswerForm } from './AnswerForm'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Loader2, Clock, MessageCircle } from 'lucide-react'

export function QuestionList() {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  
  const { data: questions, isLoading, error } = useQuery({
    queryKey: ['pendingQuestions'],
    queryFn: fetchPendingQuestions
  })

  if (isLoading) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center min-h-[300px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-youth" />
        <p className="text-neutral-400">질문을 불러오는 중입니다...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="col-span-full">
        <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <div className="rounded-full bg-red-100 p-3 mb-4">
            <MessageCircle className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-red-500">오류가 발생했습니다</h3>
          <p className="text-sm text-neutral-400 mt-2">질문을 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            새로고침
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!questions?.length) {
    return (
      <Card className="col-span-full">
        <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <div className="rounded-full bg-youth-bg p-3 mb-4">
            <MessageCircle className="h-6 w-6 text-youth" />
          </div>
          <h3 className="text-lg font-medium">답변 대기 중인 질문이 없습니다</h3>
          <p className="text-sm text-neutral-400 mt-2">새로운 질문이 등록되면 이곳에 표시됩니다.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {questions.map((question) => (
        <Card key={question.id} className="hover:shadow-lg transition-all hover:border-youth group flex flex-col">
          <CardHeader className="flex-1">
            <CardTitle className="text-lg font-medium line-clamp-2 group-hover:text-youth transition-colors">
              {question.content}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 text-neutral-400">
              <Clock className="h-4 w-4" />
              {format(new Date(question.createdAt), 'PPP', { locale: ko })}
            </CardDescription>
          </CardHeader>
          <CardFooter className="pt-0">
            <Button 
              onClick={() => setSelectedQuestion(question)}
              className="w-full bg-youth hover:bg-youth-hover text-white"
            >
              답변하기
            </Button>
          </CardFooter>
        </Card>
      ))}

      <Dialog open={selectedQuestion !== null} onOpenChange={(open) => !open && setSelectedQuestion(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>질문에 답변하기</DialogTitle>
            <DialogDescription className="text-neutral-400">
              시니어분께서 이해하기 쉽도록 자세하고 친절하게 답변해주세요.
            </DialogDescription>
          </DialogHeader>
          {selectedQuestion && (
            <div className="mt-4">
              <Card className="mb-4 bg-youth-bg">
                <CardContent className="pt-6">
                  <p className="text-neutral-600">{selectedQuestion.content}</p>
                  <p className="text-sm text-neutral-400 mt-2">
                    {format(new Date(selectedQuestion.createdAt), 'PPP', { locale: ko })}
                  </p>
                </CardContent>
              </Card>
              <AnswerForm
                question={selectedQuestion}
                onClose={() => setSelectedQuestion(null)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
} 