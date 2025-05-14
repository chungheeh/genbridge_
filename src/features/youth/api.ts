import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface Question {
  id: string
  content: string
  createdAt: string
  status: 'pending' | 'answered' | 'completed'
  title?: string
  user_id: string
}

export interface Answer {
  id: string
  questionId: string
  content: string
  createdAt: string
}

export async function fetchPendingQuestions(): Promise<Question[]> {
  try {
    console.log('Fetching pending questions...');
    
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('status', 'pending')
      .eq('is_ai_question', false) // AI 질문 제외
      .order('created_at', { ascending: false })
      .limit(50); // 최대 50개의 질문만 가져오도록 제한

    if (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }

    console.log('Fetched questions:', data);

    const mappedQuestions = (data || []).map(question => ({
      id: question.id,
      content: question.content,
      createdAt: question.created_at,
      status: question.status,
      title: question.title,
      user_id: question.user_id
    }));

    console.log('Mapped questions:', mappedQuestions);
    return mappedQuestions;
  } catch (error) {
    console.error('Unexpected error in fetchPendingQuestions:', error);
    throw new Error('질문 목록을 불러오는데 실패했습니다.');
  }
}

export async function submitAnswer(questionId: string, content: string): Promise<void> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth error:', authError);
      throw new Error('인증 확인에 실패했습니다.');
    }
    
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    // 트랜잭션 처리를 위해 먼저 질문 상태를 확인
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('status, user_id')
      .eq('id', questionId)
      .single();

    if (questionError) {
      console.error('Error checking question status:', questionError);
      throw new Error('질문 상태를 확인하는데 실패했습니다.');
    }

    if (!question) {
      throw new Error('존재하지 않는 질문입니다.');
    }

    if (question.status !== 'pending') {
      throw new Error('이미 답변이 완료된 질문입니다.');
    }

    if (question.user_id === user.id) {
      throw new Error('자신의 질문에는 답변할 수 없습니다.');
    }

    // 답변 등록
    const { error: answerError } = await supabase
      .from('answers')
      .insert({
        question_id: questionId,
        user_id: user.id,
        content: content.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (answerError) {
      console.error('Error submitting answer:', answerError);
      if (answerError.code === '23503') {
        throw new Error('질문 또는 사용자 정보가 올바르지 않습니다.');
      } else if (answerError.code === '42501') {
        throw new Error('답변을 등록할 권한이 없습니다.');
      } else {
        throw new Error('답변 등록에 실패했습니다.');
      }
    }

    // 질문 상태 업데이트
    const { error: updateError } = await supabase
      .from('questions')
      .update({ 
        status: 'answered',
        answered_at: new Date().toISOString(),
        answered_by: user.id
      })
      .eq('id', questionId);

    if (updateError) {
      console.error('Error updating question status:', updateError);
      throw new Error('질문 상태 업데이트에 실패했습니다.');
    }
  } catch (error) {
    console.error('Error in submitAnswer:', error);
    throw error instanceof Error ? error : new Error('답변 등록 중 오류가 발생했습니다.');
  }
} 