'use client'

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Question {
  id: string;
  title: string;
  content: string;
  created_at: string;
  status: string;
  user_id: string;
}

export default function QuestionsPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('status', 'pending')
        .eq('is_ai_question', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('질문을 불러오는데 실패했습니다:', error);
        return;
      }

      setQuestions(data || []);
    };

    fetchQuestions();

    // 실시간 구독 설정
    const channel = supabase
      .channel('questions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'questions',
          filter: 'status=eq.pending and is_ai_question=eq.false'
        },
        async (payload: any) => {
          if (payload.eventType === 'INSERT' && payload.new.status === 'pending') {
            setQuestions(prev => [payload.new as Question, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setQuestions(prev => prev.filter(q => q.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            if (payload.new.status !== 'pending') {
              setQuestions(prev => prev.filter(q => q.id !== payload.new.id));
            } else {
              setQuestions(prev => prev.map(q => q.id === payload.new.id ? (payload.new as Question) : q));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">답변을 기다리는 질문들</h1>
      <div className="grid gap-4">
        {questions.map((question) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle>{question.title}</CardTitle>
              <p className="text-sm text-gray-500">
                {format(new Date(question.created_at), 'yyyy년 MM월 dd일 HH시 mm분')}
              </p>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{question.content}</p>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => router.push(`/youth/questions/${question.id}/answer`)}
              >
                답변하기
              </Button>
            </CardFooter>
          </Card>
        ))}
        {questions.length === 0 && (
          <p className="text-center text-gray-500">
            현재 답변을 기다리는 질문이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
} 