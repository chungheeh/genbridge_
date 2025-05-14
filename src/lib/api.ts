import { supabase } from './supabase';
import type { Question, Answer } from '@/types/database.types';

export const createQuestion = async (
  title: string,
  content: string,
  userId: string,
  isAiQuestion: boolean = false
): Promise<Question> => {
  const { data, error } = await supabase
    .from('questions')
    .insert([
      {
        title,
        content,
        user_id: userId,
        is_ai_question: isAiQuestion
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getQuestions = async (): Promise<Question[]> => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getQuestionsByUserId = async (userId: string): Promise<Question[]> => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createAnswer = async (
  questionId: string,
  content: string,
  userId: string
): Promise<Answer> => {
  try {
    // 먼저 질문이 존재하는지 확인
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('status')
      .eq('id', questionId)
      .single();

    if (questionError) {
      console.error('Error checking question:', questionError);
      throw new Error('질문을 확인하는데 실패했습니다.');
    }

    if (!question) {
      throw new Error('존재하지 않는 질문입니다.');
    }

    if (question.status !== 'pending') {
      throw new Error('이미 답변이 완료된 질문입니다.');
    }

    // 답변 등록
    const { data, error: answerError } = await supabase
      .from('answers')
      .insert({
        question_id: questionId,
        content: content.trim(),
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (answerError) {
      console.error('Error creating answer:', answerError);
      if (answerError.code === '23503') {
        throw new Error('질문 또는 사용자 정보가 올바르지 않습니다.');
      } else if (answerError.code === '42501') {
        throw new Error('답변을 등록할 권한이 없습니다.');
      } else {
        throw new Error('답변 등록에 실패했습니다.');
      }
    }

    if (!data) {
      throw new Error('답변이 생성되지 않았습니다.');
    }

    // 질문 상태 업데이트
    const { error: updateError } = await supabase
      .from('questions')
      .update({ 
        status: 'answered',
        answered_at: new Date().toISOString(),
        answered_by: userId
      })
      .eq('id', questionId);

    if (updateError) {
      console.error('Error updating question status:', updateError);
      throw new Error('질문 상태 업데이트에 실패했습니다.');
    }

    return data;
  } catch (error) {
    console.error('Error in createAnswer:', error);
    throw error instanceof Error ? error : new Error('답변 등록 중 오류가 발생했습니다.');
  }
};

export const getAnswersByQuestionId = async (questionId: string): Promise<Answer[]> => {
  const { data, error } = await supabase
    .from('answers')
    .select('*')
    .eq('question_id', questionId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getAnswersByUserId = async (userId: string): Promise<Answer[]> => {
  const { data, error } = await supabase
    .from('answers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}; 