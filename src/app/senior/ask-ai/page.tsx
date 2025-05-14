'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { SeniorHeader } from '@/features/senior/components/SeniorHeader';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { Bot, Loader2, Volume2, VolumeX } from 'lucide-react';
import { Database } from '@/types/supabase';
import { useSpeech } from '@/hooks/useSpeech';

const VoiceRecorder = dynamic(() => import('@/features/senior/components/VoiceRecorder'), {
  ssr: false
});

export default function AskAIPage() {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();
  const { speak, stop, isPlaying } = useSpeech();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('질문 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setAiResponse('');
    setIsTyping(false);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast.error('로그인이 필요합니다.');
        router.push('/login');
        return;
      }

      // 질문을 데이터베이스에 저장
      const { data: question, error: questionError } = await supabase
        .from('questions')
        .insert({
          title: 'AI 질문',
          content: content.trim(),
          user_id: user.id,
          status: 'pending',
          is_ai_question: true
        })
        .select('*')
        .single();

      if (questionError) {
        console.error('Question insert error:', questionError);
        throw new Error('질문을 저장하는 중 오류가 발생했습니다.');
      }

      if (!question || !question.id) {
        throw new Error('질문 ID를 찾을 수 없습니다.');
      }

      let response;
      try {
        response = await fetch('/api/ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: content.trim() }),
        });
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
      }

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Server error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorData
        });
        
        let errorMessage = '답변을 생성하는 중 오류가 발생했습니다.';
        try {
          const error = JSON.parse(errorData);
          errorMessage = error.error || errorMessage;
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      if (!response.body) {
        throw new Error('서버 응답에 내용이 없습니다.');
      }

      const reader = response.body.getReader();
      let fullResponse = '';

      // 스트리밍 응답 처리
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setIsTyping(false);
              break;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.content) {
                setIsTyping(true);
                fullResponse += parsed.content;
                setAiResponse(fullResponse);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e, 'Raw data:', data);
            }
          }
        }
      }

      // AI 답변을 데이터베이스에 저장
      const { error: answerError } = await supabase
        .from('ai_answers')
        .insert({
          question_id: question.id,
          content: fullResponse
        });

      if (answerError) {
        console.error('Answer insert error:', answerError);
        throw new Error('답변을 저장하는 중 오류가 발생했습니다.');
      }

      try {
        // 질문 상태를 업데이트
        const { data: updatedQuestion, error: updateError } = await supabase
          .from('questions')
          .update({
            status: 'answered' as const,
            updated_at: new Date().toISOString()
          })
          .eq('id', question.id)
          .select('*')
          .single();

        if (updateError) {
          console.error('Status update error:', updateError);
          // 상태 업데이트 실패는 치명적이지 않으므로 사용자에게 알리지 않음
        } else {
          console.log('Question updated successfully:', updatedQuestion);
        }
      } catch (updateError) {
        console.error('Status update error:', updateError);
        // 상태 업데이트 실패는 치명적이지 않으므로 사용자에게 알리지 않음
      }

      toast.success('AI가 답변을 완료했습니다.');
    } catch (error) {
      console.error('Error submitting AI question:', error);
      setIsTyping(false);
      toast.error(error instanceof Error ? error.message : '답변 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTranscriptionComplete = (text: string) => {
    setContent((prev) => prev + (prev ? '\n' : '') + text);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SeniorHeader />

      <div className="senior-nav">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex gap-8">
            <Link 
              href="/senior/ask"
              className="py-4 text-lg font-medium text-neutral-400 hover:text-neutral-600"
            >
              질문하기
            </Link>
            <Link 
              href="/senior/answers"
              className="py-4 text-lg font-medium text-neutral-400 hover:text-neutral-600"
            >
              답변 확인
            </Link>
            <Link 
              href="/senior/ask-ai"
              className="py-4 text-lg font-medium border-b-2 border-[#00C73C] text-[#00C73C]"
            >
              AI에게 질문하기
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-1">
        <div className="max-w-[1200px] mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-black">AI에게 질문하기</h1>
          </div>
          <p className="text-xl text-neutral-400 mb-8">AI에게 궁금한 점을 자유롭게 물어보세요.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border border-neutral-200">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-medium text-black">질문 내용</h2>
                    <VoiceRecorder onTranscriptionComplete={handleTranscriptionComplete} />
                  </div>
                  <div className="relative">
                    <Textarea
                      placeholder="AI에게 궁금한 점을 입력하세요..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[200px] resize-none bg-white border-neutral-200 text-xl p-4"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    취소
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        답변 생성 중...
                      </>
                    ) : (
                      'AI에게 질문하기'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-neutral-200">
              <CardContent className="p-8">
                {aiResponse || isSubmitting ? (
                  <>
                    <div className="flex items-center gap-2 mb-6">
                      <Bot className="w-6 h-6 text-primary" />
                      <h2 className="text-2xl font-medium text-black">AI 답변</h2>
                      {(isSubmitting || isTyping) && (
                        <Loader2 className="ml-2 h-4 w-4 animate-spin text-primary" />
                      )}
                      {aiResponse && !isSubmitting && !isTyping && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-2"
                          onClick={() => isPlaying ? stop() : speak(aiResponse)}
                        >
                          {isPlaying ? (
                            <VolumeX className="h-5 w-5 text-primary" />
                          ) : (
                            <Volume2 className="h-5 w-5 text-primary" />
                          )}
                        </Button>
                      )}
                    </div>
                    <div className="prose prose-neutral max-w-none">
                      {aiResponse.split('\n').map((line, index) => (
                        <p key={index} className="text-lg leading-relaxed">
                          {line}
                        </p>
                      ))}
                      {isTyping && (
                        <span className="inline-block w-2 h-4 bg-primary animate-pulse" />
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-medium mb-6 text-black">AI 질문 도움말</h2>
                    <ul className="space-y-4 text-neutral-400">
                      <li className="text-lg">• AI는 24시간 언제든지 답변 가능합니다</li>
                      <li className="text-lg">• 구체적인 질문일수록 더 정확한 답변을 받을 수 있습니다</li>
                      <li className="text-lg">• 음성으로도 질문하실 수 있어요</li>
                      <li className="text-lg">• 답변은 즉시 확인하실 수 있습니다</li>
                      <li className="text-lg">• 답변을 음성으로도 들을 수 있어요</li>
                    </ul>

                    <div className="mt-8">
                      <img
                        src="https://picsum.photos/800/400"
                        alt="AI 도움말 이미지"
                        className="w-full h-[300px] object-cover rounded-lg"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 