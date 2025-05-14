'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query'
import { fetchPendingQuestions, Question } from '../api'
import { AnswerForm } from './AnswerForm'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Loader2, Clock, MessageCircle, RefreshCw } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'sonner'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function QuestionList() {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const queryClient = useQueryClient()
  
  const { 
    data: questions = [], 
    isLoading, 
    error, 
    refetch, 
    isRefetching 
  } = useQuery<Question[], Error>({
    queryKey: ['pendingQuestions'],
    queryFn: fetchPendingQuestions,
    refetchInterval: 5000,
    retry: 3,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true
  })

  // Supabase 실시간 구독 설정
  useEffect(() => {
    console.log('Setting up Supabase subscription...');
    
    const channel = supabase
      .channel('questions-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'questions',
          filter: 'status=eq.pending'
        },
        (payload) => {
          console.log('Database change detected:', payload);
          void queryClient.invalidateQueries({ queryKey: ['pendingQuestions'] });
          
          if (payload.eventType === 'INSERT') {
            toast.info('새로운 질문이 등록되었습니다.');
          } else if (payload.eventType === 'UPDATE' && payload.new.status !== 'pending') {
            toast.info('질문의 상태가 변경되었습니다.');
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to changes');
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('Failed to subscribe to changes');
          toast.error('실시간 업데이트 연결에 실패했습니다.');
        }
      });

    return () => {
      console.log('Cleaning up Supabase subscription...');
      channel.unsubscribe();
    }
  }, [queryClient]);

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
          <p className="text-sm text-neutral-400 mt-2">질문을 불러오는 중 문제가 발생했습니다.</p>
          <p className="text-sm text-neutral-600 mt-1">{error.message}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            {isRefetching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                새로고침 중...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                다시 시도
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!questions.length) {
    return (
      <Card className="col-span-full">
        <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <div className="rounded-full bg-youth-bg p-3 mb-4">
            <MessageCircle className="h-6 w-6 text-youth" />
          </div>
          <h3 className="text-lg font-medium">답변 대기 중인 질문이 없습니다</h3>
          <p className="text-sm text-neutral-400 mt-2">새로운 질문이 등록되면 이곳에 표시됩니다.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            {isRefetching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                새로고침 중...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                새로고침
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">답변 대기 중인 질문 {questions.length}개</h2>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="text-youth hover:text-youth-hover"
        >
          {isRefetching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              새로고침 중...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              새로고침
            </>
          )}
        </Button>
      </div>

      {questions.map((question) => (
        <Card key={question.id} className="hover:shadow-lg transition-all hover:border-youth group flex flex-col">
          <CardHeader className="flex-1">
            <CardTitle className="text-lg font-medium line-clamp-2 group-hover:text-youth transition-colors">
              {question.title || question.content}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 text-neutral-400">
              <Clock className="h-4 w-4" />
              {format(new Date(question.createdAt), 'PPP', { locale: ko })}
            </CardDescription>
            {!question.title && (
              <p className="text-neutral-600 mt-2 line-clamp-3">{question.content}</p>
            )}
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