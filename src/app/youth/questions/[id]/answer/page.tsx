'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { createBrowserClient } from '@/lib/supabase';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { use } from 'react';

interface Question {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface AnswerForm {
  content: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AnswerPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<AnswerForm>();
  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchQuestion = async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('질문 조회 오류:', error);
        toast.error('질문을 불러오는데 실패했습니다');
        router.push('/youth/questions');
        return;
      }

      setQuestion(data);
    };

    fetchQuestion();
  }, [id, router, supabase]);

  const onSubmit = async (data: AnswerForm) => {
    try {
      setIsLoading(true);

      // 1. 사용자 인증 확인
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        toast.error('로그인이 필요합니다');
        router.push('/auth/login');
        return;
      }

      const userId = session.session.user.id;
      console.log('인증된 사용자:', userId);

      // 2. 질문 상태 확인
      const { data: questionData, error: questionError } = await supabase
        .from('questions')
        .select('status, user_id')
        .eq('id', id)
        .single();

      if (questionError) {
        console.error('질문 상태 확인 오류:', questionError);
        toast.error('질문 상태를 확인하는데 실패했습니다');
        return;
      }

      if (!questionData) {
        toast.error('존재하지 않는 질문입니다');
        return;
      }

      if (questionData.status !== 'pending') {
        toast.error('이미 답변이 완료된 질문입니다');
        return;
      }

      if (questionData.user_id === userId) {
        toast.error('자신의 질문에는 답변할 수 없습니다');
        return;
      }

      // 3. 답변 등록
      const { data: answerData, error: answerError } = await supabase
        .from('answers')
        .insert({
          question_id: id,
          content: data.content.trim(),
          user_id: userId,
          is_selected: false
        })
        .select('*, question:questions(*)')
        .single();

      if (answerError) {
        console.error('답변 등록 오류:', answerError);
        
        if (answerError.code === '42501') {
          toast.error('답변을 등록할 권한이 없습니다');
        } else if (answerError.code === '23503') {
          toast.error('질문 또는 사용자 정보가 올바르지 않습니다');
        } else {
          toast.error('답변 등록에 실패했습니다');
          console.error('상세 오류:', answerError);
        }
        return;
      }

      if (!answerData) {
        toast.error('답변이 생성되지 않았습니다');
        return;
      }

      console.log('등록된 답변:', answerData);

      // 4. 질문 상태 업데이트
      const { error: statusError } = await supabase
        .from('questions')
        .update({ 
          status: 'answered',
          answered_at: new Date().toISOString(),
          answered_by: userId
        })
        .eq('id', id);

      if (statusError) {
        console.error('질문 상태 업데이트 오류:', statusError);
        toast.error('질문 상태 업데이트에 실패했습니다');
        return;
      }

      toast.success('답변이 등록되었습니다');
      router.push('/youth/questions');
    } catch (error) {
      console.error('예상치 못한 오류:', error);
      toast.error('답변 등록 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  if (!question) {
    return <div className="container mx-auto py-8">질문을 불러오는 중...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
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

        <Card>
          <CardHeader>
            <CardTitle>답변 작성</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Textarea
                  placeholder="답변 내용을 입력해주세요"
                  className="min-h-[200px]"
                  disabled={isLoading}
                  {...register('content', { required: '답변 내용을 입력해주세요' })}
                />
                {errors.content && (
                  <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
                )}
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => router.push('/youth/questions')}
                >
                  취소
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? '등록 중...' : '답변 등록하기'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 