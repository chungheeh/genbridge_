'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface QuestionForm {
  title: string;
  content: string;
}

export default function AskPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<QuestionForm>();

  const onSubmit = async (data: QuestionForm) => {
    try {
      // 1. 사용자 인증 확인
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('인증 확인 오류:', authError);
        toast.error('인증 확인에 실패했습니다');
        return;
      }

      if (!authData.user) {
        toast.error('로그인이 필요합니다');
        return;
      }

      console.log('인증된 사용자:', authData.user.id);

      // 2. 질문 등록
      const { data: insertData, error: insertError } = await supabase
        .from('questions')
        .insert({
          title: data.title,
          content: data.content,
          user_id: authData.user.id,
          is_ai_question: false
        })
        .select()
        .single();

      if (insertError) {
        console.error('질문 등록 오류:', insertError);
        
        if (insertError.code === '42501') {
          toast.error('질문을 등록할 권한이 없습니다');
        } else if (insertError.code === '23503') {
          toast.error('사용자 정보가 올바르지 않습니다');
        } else {
          toast.error(`질문 등록 실패: ${insertError.message}`);
        }
        return;
      }

      console.log('등록된 질문:', insertData);

      toast.success('질문이 등록되었습니다');
      router.push('/elder/my-questions');
    } catch (error) {
      console.error('예상치 못한 오류:', error);
      toast.error('질문 등록 중 오류가 발생했습니다');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>질문하기</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                placeholder="제목을 입력해주세요"
                {...register('title', { required: '제목을 입력해주세요' })}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>
            <div>
              <Textarea
                placeholder="질문 내용을 입력해주세요"
                className="min-h-[200px]"
                {...register('content', { required: '내용을 입력해주세요' })}
              />
              {errors.content && (
                <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full">
              질문 등록하기
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 