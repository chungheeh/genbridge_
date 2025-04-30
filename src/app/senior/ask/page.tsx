"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { toast } from 'sonner';
import { VoiceRecorder } from "@/features/senior/components/VoiceRecorder";
import { SeniorHeader } from "@/features/senior/components/SeniorHeader";

export default function SeniorPage() {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('질문 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast.error('로그인이 필요합니다.');
        router.push('/login');
        return;
      }

      const { error: insertError } = await supabase
        .from('questions')
        .insert([
          {
            user_id: user.id,
            content: content.trim(),
            status: 'PENDING'
          }
        ]);

      if (insertError) {
        throw insertError;
      }

      toast.success('질문이 등록되었습니다.');
      router.push('/senior');
    } catch (error) {
      console.error('Error submitting question:', error);
      toast.error('질문 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTranscriptionComplete = (text: string) => {
    setContent((prev) => prev + (prev ? '\n' : '') + text);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 섹션 */}
      <SeniorHeader />

      {/* 탭 메뉴 */}
      <div className="senior-nav">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex gap-8">
            <Link 
              href="/senior/ask"
              className="py-4 text-lg font-medium border-b-2 border-[#00C73C] text-[#00C73C]"
            >
              질문하기
            </Link>
            <Link 
              href="/senior/answers"
              className="py-4 text-lg font-medium text-neutral-400 hover:text-neutral-600"
            >
              답변 확인
            </Link>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <main className="flex-1">
        <div className="max-w-[1200px] mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-black">질문하기</h1>
            <div className="flex gap-4">
              <Button 
                asChild
                className="bg-[#00C73C] hover:bg-[#00912C] text-white rounded-full h-10 px-4 flex items-center gap-2"
              >
                <Link href="/senior/answers">
                  <Search className="h-4 w-4" />
                  <span>답변확인</span>
                </Link>
              </Button>
            </div>
          </div>
          <p className="text-xl text-neutral-400 mb-8">궁금하신 질문을 자유롭게 물어보세요.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 왼쪽: 질문 입력 폼 */}
            <Card className="border border-neutral-200">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-medium text-black">질문 내용</h2>
                    <VoiceRecorder onTranscriptionComplete={handleTranscriptionComplete} />
                  </div>
                  <div className="relative">
                    <Textarea
                      placeholder="궁금한 점을 입력하세요..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[200px] resize-none bg-white border-neutral-200 text-xl p-4"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    취소
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isSubmitting ? '등록 중...' : '질문하기'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 오른쪽: 도움말 */}
            <Card className="border border-neutral-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-medium mb-6 text-black">질문 작성 도움말</h2>
                <ul className="space-y-4 text-neutral-400">
                  <li className="text-lg">• 구체적인 상황을 설명해주세요</li>
                  <li className="text-lg">• 하나의 질문에 여러 개의 궁금한 점을 함께 물어보셔도 됩니다</li>
                  <li className="text-lg">• 음성으로도 질문하실 수 있어요</li>
                  <li className="text-lg">• 답변이 오면 알림으로 알려드립니다</li>
                </ul>

                {/* 도움말 이미지 */}
                <div className="mt-8">
                  <img
                    src="https://picsum.photos/800/400"
                    alt="도움말 이미지"
                    className="w-full h-[300px] object-cover rounded-lg"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 