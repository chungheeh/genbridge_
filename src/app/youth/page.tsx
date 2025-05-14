'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { LucideHelpCircle, LucideShoppingBag, LucideUser, LucideMessageCircle, LucidePencil } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface YouthHomeProps {
  params: {
    id: string
  }
}

interface Answer {
  id: string
  content: string
  created_at: string
  question: {
    id: string
    title: string
    content: string
    status: string
  }
}

type DatabaseAnswer = {
  id: string
  content: string
  created_at: string
  question: {
    id: string
    title: string
    content: string
    status: string
  }
}

interface Database {
  public: {
    Tables: {
      answers: {
        Row: {
          id: string
          content: string
          created_at: string
          question: {
            id: string
            title: string
            content: string
            status: string
          }
        }
      }
    }
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 50,
      damping: 10,
    }
  }
}

export default function YouthHome({ params }: YouthHomeProps) {
  const router = useRouter()
  const [stats, setStats] = useState({
    waitingQuestions: 0,
  })
  const [recentAnswers, setRecentAnswers] = useState<Answer[]>([])
  const [editingAnswer, setEditingAnswer] = useState<Answer | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchStats = async () => {
      const { count } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .eq('is_ai_question', false)

      setStats({
        waitingQuestions: count || 0,
      })
    }

    const fetchRecentAnswers = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('answers')
        .select(`
          id,
          content,
          created_at,
          question:questions!inner (
            id,
            title,
            content,
            status
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3)
        .returns<DatabaseAnswer[]>()

      if (error) {
        console.error('답변을 불러오는데 실패했습니다:', error)
        return
      }

      const answers = (data || []).map((item) => ({
        id: item.id,
        content: item.content,
        created_at: item.created_at,
        question: {
          id: item.question.id,
          title: item.question.title,
          content: item.question.content,
          status: item.question.status
        }
      }))

      setRecentAnswers(answers)
    }

    fetchStats()
    fetchRecentAnswers()

    // 실시간 구독 설정
    const questionsChannel = supabase
      .channel('questions_stats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'questions',
          filter: 'status=eq.pending and is_ai_question=eq.false'
        },
        async () => {
          await fetchStats()
        }
      )
      .subscribe()

    const answersChannel = supabase
      .channel('answers_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'answers'
        },
        async () => {
          await fetchRecentAnswers()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(questionsChannel)
      supabase.removeChannel(answersChannel)
    }
  }, [supabase])

  const handleEditAnswer = async () => {
    if (!editingAnswer || !editContent.trim()) return

    setIsEditing(true)
    try {
      const { error } = await supabase
        .from('answers')
        .update({ content: editContent.trim() })
        .eq('id', editingAnswer.id)

      if (error) throw error

      // 로컬 상태 업데이트
      setRecentAnswers(prev =>
        prev.map(answer =>
          answer.id === editingAnswer.id
            ? { ...answer, content: editContent.trim() }
            : answer
        )
      )

      toast.success('답변이 수정되었습니다.')
      setEditingAnswer(null)
      setEditContent('')
    } catch (error) {
      console.error('답변 수정 실패:', error)
      toast.error('답변 수정에 실패했습니다.')
    } finally {
      setIsEditing(false)
    }
  }

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 메인 액션 섹션 */}
      <motion.section 
        className="grid gap-4 md:grid-cols-3"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <Link href="/youth/questions">
            <Card className="hover:border-youth transition-colors group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LucideHelpCircle className="text-youth" />
                  답변하기
                </CardTitle>
                <CardDescription>
                  시니어분들의 질문에 답변해주세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-youth group-hover:text-youth-hover transition-colors">{stats.waitingQuestions}개</div>
                <p className="text-sm text-neutral-400">답변을 기다리는 질문</p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Link href="/youth/points">
            <Card className="hover:border-youth transition-colors group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LucideShoppingBag className="text-youth" />
                  스토어 및 포인트
                </CardTitle>
                <CardDescription>
                  답변으로 모은 포인트를 사용해보세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-youth group-hover:text-youth-hover transition-colors">포인트</div>
                <p className="text-sm text-neutral-400">사용 가능한 포인트</p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Link href="/youth/profile">
            <Card className="hover:border-youth transition-colors group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LucideUser className="text-youth" />
                  내 정보
                </CardTitle>
                <CardDescription>
                  프로필과 활동 내역을 확인하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-youth group-hover:text-youth-hover transition-colors">프로필</div>
                <p className="text-sm text-neutral-400">내 정보 관리</p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </motion.section>

      {/* 나의 최근 답변 섹션 */}
      <motion.section variants={containerVariants}>
        <motion.h2 
          className="text-xl font-bold mb-4 flex items-center gap-2"
          variants={itemVariants}
        >
          <LucideMessageCircle className="text-youth" />
          나의 최근 답변
        </motion.h2>
        <motion.div 
          className="grid gap-4"
          variants={containerVariants}
        >
          {recentAnswers.map((answer) => (
            <motion.div 
              key={answer.id}
              variants={itemVariants}
            >
              <Card className="hover:border-youth transition-colors group">
                <CardHeader>
                  <CardTitle className="text-lg group-hover:text-youth transition-colors">
                    {answer.question.title}
                  </CardTitle>
                  <CardDescription>
                    {format(new Date(answer.created_at), 'PPP', { locale: ko })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-400 line-clamp-2">
                    {answer.content}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-end items-center">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-youth hover:text-youth-hover hover:border-youth"
                        onClick={() => {
                          setEditingAnswer(answer)
                          setEditContent(answer.content)
                        }}
                      >
                        <LucidePencil className="w-4 h-4 mr-2" />
                        수정하기
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>답변 수정하기</DialogTitle>
                        <DialogDescription>
                          {answer.question.title}에 대한 답변을 수정합니다.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          placeholder="수정할 답변을 입력하세요"
                          className="min-h-[200px]"
                        />
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">취소</Button>
                        </DialogClose>
                        <Button
                          onClick={handleEditAnswer}
                          disabled={isEditing || !editContent.trim()}
                          className="bg-youth hover:bg-youth-hover"
                        >
                          {isEditing ? '수정 중...' : '수정 완료'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
          {recentAnswers.length === 0 && (
            <Card className="p-8 text-center text-neutral-400">
              <p>아직 답변한 질문이 없습니다.</p>
              <p className="mt-2">
                <Link href="/youth/questions" className="text-youth hover:underline">
                  질문에 답변하러 가기
                </Link>
              </p>
            </Card>
          )}
        </motion.div>
      </motion.section>
    </motion.div>
  )
} 