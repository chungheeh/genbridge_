'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createBrowserClient } from '@/lib/supabase';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Question {
  id: string;
  title: string;
  content: string;
  created_at: string;
  status: string;
}

export default function MyQuestionsPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        router.push('/auth/login');
        return;
      }

      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('질문을 불러오는데 실패했습니다:', error);
        return;
      }

      setQuestions(data || []);
    };

    fetchQuestions();
  }, [router, supabase]);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">내 질문 목록</h1>
        <Button onClick={() => router.push('/elder/ask')}>
          새 질문하기
        </Button>
      </div>
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
              <p className="mt-2 text-sm font-medium">
                상태: {
                  question.status === 'pending' ? '답변 대기중' :
                  question.status === 'answered' ? '답변 완료' :
                  question.status === 'closed' ? '종료됨' : '알 수 없음'
                }
              </p>
            </CardContent>
            {question.status === 'answered' && (
              <CardFooter>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/elder/questions/${question.id}/answers`)}
                >
                  답변 보기
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
        {questions.length === 0 && (
          <p className="text-center text-gray-500">
            아직 등록한 질문이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
} 