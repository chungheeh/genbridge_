"use client";

import { motion } from 'framer-motion';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, MessageSquare, CheckCircle, User, Plus, Clock, HelpCircle, MessageCircle, UserCircle, Bot } from "lucide-react";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { SeniorHeader } from '@/features/senior/components/SeniorHeader';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Question {
  id: string;
  content: string;
  status: 'pending' | 'answered' | 'completed';
  created_at: string;
  user_id: string;
  title: string;
}

export default function SeniorMainPage() {
  const [userName, setUserName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleAskClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push('/senior/ask');
  };

  useEffect(() => {
    async function getUserProfile() {
      try {
        // 현재 로그인한 사용자 정보 가져오기
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('Auth error:', authError);
          router.push('/login');
          return;
        }

        if (!user) {
          router.push('/login');
          return;
        }

        // profiles 테이블에서 사용자 정보 가져오기
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Profile error:', profileError);
          // 프로필이 없는 경우 이메일의 @ 앞부분을 이름으로 사용
          const defaultName = '사용자';
          setUserName(defaultName);
          return;
        }

        if (profile?.name) {
          setUserName(profile.name);
        } else {
          // 프로필은 있지만 이름이 없는 경우
          setUserName('사용자');
        }

        try {
          // 질문 목록 가져오기
          const { data: questionsData, error: questionsError } = await supabase
            .from('questions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);

          if (questionsError) {
            console.error('Questions error:', JSON.stringify(questionsError));
            return;
          }

          setQuestions(questionsData || []);
        } catch (questionsException) {
          console.error('Questions exception:', questionsException);
          // 질문 로드 실패 시에도 UI는 계속 표시
          setQuestions([]);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        // 에러 발생 시 기본값 사용
        setUserName('사용자');
        setQuestions([]);
      } finally {
        setIsLoading(false);
      }
    }

    getUserProfile();

    // 실시간 구독 설정
    const channel = supabase
      .channel('questions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'questions'
        },
        async (payload: any) => {
          // 현재 로그인한 사용자의 질문만 처리
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          if (payload.eventType === 'INSERT' && payload.new.user_id === user.id) {
            setQuestions(prev => [payload.new as Question, ...prev].slice(0, 5));
          } else if (payload.eventType === 'DELETE' && payload.old.user_id === user.id) {
            setQuestions(prev => prev.filter(q => q.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE' && payload.new.user_id === user.id) {
            setQuestions(prev => prev.map(q => q.id === payload.new.id ? (payload.new as Question) : q));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 50,
        damping: 10,
      },
    },
  };

  const menuItems = [
    {
      title: '질문하기',
      description: '궁금한 점을 물어보세요',
      icon: <HelpCircle className="w-6 h-6 text-[#00C73C]" />,
      href: '/senior/ask',
    },
    {
      title: 'AI에게 질문하기',
      description: 'AI가 24시간 답변해드려요',
      icon: <Bot className="w-6 h-6 text-[#FF6B6B]" />,
      href: '/senior/ask-ai',
    },
    {
      title: '답변 확인하기',
      description: '받은 답변을 확인하세요',
      icon: <MessageCircle className="w-6 h-6 text-[#1F8FFF]" />,
      href: '/senior/answers',
    },
    {
      title: '내 정보',
      description: '프로필 정보를 관리하세요',
      icon: <UserCircle className="w-6 h-6 text-[#FFD600]" />,
      href: '/senior/profile',
    },
  ];

  const getStatusBadgeColor = (status: Question['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'answered':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Question['status']) => {
    switch (status) {
      case 'pending':
        return '답변 대기중';
      case 'answered':
        return '답변 완료';
      case 'completed':
        return '채택 완료';
      default:
        return '알 수 없음';
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (error) {
        throw error;
      }

      setQuestions(questions.filter(q => q.id !== questionId));
      toast.success('질문이 삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('질문 삭제에 실패했습니다.');
    }
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
              className="py-4 text-lg font-medium text-neutral-400 hover:text-neutral-600"
              onClick={handleAskClick}
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
              className="py-4 text-lg font-medium text-neutral-400 hover:text-neutral-600"
            >
              AI에게 질문하기
            </Link>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <main className="flex-1">
        <div className="max-w-[1200px] mx-auto px-4 py-8">
          <div className="text-left space-y-2 mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold text-primary"
            >
              {isLoading ? (
                <span className="animate-pulse">로딩중...</span>
              ) : (
                `${userName}님, 환영합니다`
              )}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-muted-foreground"
            >
              무엇을 도와드릴까요?
            </motion.p>
          </div>

          <div className="space-y-8">
            {/* 메인 메뉴 카드 */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-6"
            >
              {menuItems.map((item, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Link 
                    href={item.href} 
                    onClick={item.href === '/senior/ask' ? handleAskClick : undefined}
                  >
                    <Card className="senior-card h-full p-8 cursor-pointer">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center space-x-8"
                      >
                        <div className="p-4 bg-senior-bg rounded-full">
                          {item.icon}
                        </div>
                        <div className="flex flex-col items-start text-left">
                          <h2 className="text-2xl font-semibold mb-2">{item.title}</h2>
                          <p className="text-lg text-gray-600">{item.description}</p>
                        </div>
                      </motion.div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* 나의 질문 섹션 */}
            <div>
              <h2 className="text-2xl font-bold mb-4">나의 질문</h2>
              <Card className="senior-card p-8">
                {questions.length > 0 ? (
                  <div className="space-y-4">
                    {questions.map((question) => (
                      <div
                        key={question.id}
                        className="flex items-center justify-between p-4 senior-hover-bg rounded-lg transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(question.status)}`}>
                              {getStatusText(question.status)}
                            </span>
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {format(new Date(question.created_at), 'PPP a h시 mm분', { locale: ko })}
                            </span>
                          </div>
                          <p className="text-lg font-medium line-clamp-1">{question.content}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-4 hover:bg-senior-bg"
                            asChild
                          >
                            <Link href={`/senior/answers/${question.id}`}>
                              자세히 보기
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                              >
                                삭제
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>질문 삭제</AlertDialogTitle>
                                <AlertDialogDescription>
                                  이 질문을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>취소</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500 hover:bg-red-600"
                                  onClick={() => handleDeleteQuestion(question.id)}
                                >
                                  삭제
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="mb-4 p-4 bg-senior-bg rounded-full">
                      <Plus className="w-8 h-8 text-senior-DEFAULT" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">아직 질문이 없습니다</h3>
                    <p className="text-gray-600 mb-6">새로운 질문을 작성해보세요!</p>
                    <Button 
                      asChild
                      className="senior-button"
                    >
                      <Link 
                        href="/senior/ask"
                        onClick={handleAskClick}
                      >
                        질문하기
                      </Link>
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 