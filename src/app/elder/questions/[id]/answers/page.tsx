'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createBrowserClient } from '@/lib/supabase';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { use } from 'react';

interface Answer {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    email: string;
  } | null;
}

interface Question {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AnswersPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createBrowserClient();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        router.push('/auth/login');
        return;
      }

      // 질문 정보 가져오기
      const { data: questionData, error: questionError } = await supabase
        .from('questions')
        .select('*')
        .eq('id', id)
        .single();

      if (questionError) {
        console.error('질문을 불러오는데 실패했습니다:', questionError);
        router.push('/elder/my-questions');
        return;
      }

      setQuestion(questionData);

      // 답변 정보 가져오기
      const { data: answersData, error: answersError } = await supabase
        .from('answers')
        .select(`
          *,
          user:user_id (
            id,
            email
          )
        `)
        .eq('question_id', id)
        .order('created_at', { ascending: true });

      if (answersError) {
        console.error('답변을 불러오는데 실패했습니다:', answersError);
        return;
      }

      setAnswers(answersData || []);
    };

    fetchData();
  }, [id, router, supabase]);

  if (!question) {
    return <div className="container mx-auto py-8">질문을 불러오는 중...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        {/* 질문 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>{question.title}</CardTitle>
            <p className="text-sm text-gray-500">
              {format(new Date(question.created_at), 'yyyy년 MM월 dd일 HH시 mm분')}
            </p>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{question.content}</p>
          </CardContent>
        </Card>

        {/* 답변 목록 */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">답변 목록</h2>
          {answers.map((answer) => (
            <Card key={answer.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">
                    답변자: {answer.user?.email || '알 수 없음'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(answer.created_at), 'yyyy년 MM월 dd일 HH시 mm분')}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{answer.content}</p>
              </CardContent>
            </Card>
          ))}
          {answers.length === 0 && (
            <p className="text-center text-gray-500">
              아직 답변이 없습니다.
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => router.push('/elder/my-questions')}
          >
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
} 