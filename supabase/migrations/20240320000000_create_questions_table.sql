-- 질문 테이블 생성
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'completed')),
    is_ai_question BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 답변 테이블 생성
CREATE TABLE IF NOT EXISTS public.answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_selected BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- updated_at을 자동으로 업데이트하는 함수 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- questions 테이블에 트리거 추가
DROP TRIGGER IF EXISTS update_questions_updated_at ON public.questions;
CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON public.questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- answers 테이블에 트리거 추가
DROP TRIGGER IF EXISTS update_answers_updated_at ON public.answers;
CREATE TRIGGER update_answers_updated_at
    BEFORE UPDATE ON public.answers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS(Row Level Security) 정책 설정
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- 기존 정책들을 먼저 삭제
DROP POLICY IF EXISTS "질문 조회 정책" ON public.questions;
DROP POLICY IF EXISTS "질문 생성 정책" ON public.questions;
DROP POLICY IF EXISTS "질문 수정 정책" ON public.questions;
DROP POLICY IF EXISTS "질문 삭제 정책" ON public.questions;
DROP POLICY IF EXISTS "답변 조회 정책" ON public.answers;
DROP POLICY IF EXISTS "답변 생성 정책" ON public.answers;
DROP POLICY IF EXISTS "답변 수정 정책" ON public.answers;
DROP POLICY IF EXISTS "답변 삭제 정책" ON public.answers;

-- 질문 테이블 정책 재설정
CREATE POLICY "질문 조회 정책" ON public.questions
    FOR SELECT USING (true);

CREATE POLICY "질문 생성 정책" ON public.questions
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "질문 수정 정책" ON public.questions
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "질문 삭제 정책" ON public.questions
    FOR DELETE
    USING (auth.uid() = user_id);

-- 답변 테이블 정책
CREATE POLICY "답변 조회 정책" ON public.answers
    FOR SELECT USING (true);

CREATE POLICY "답변 생성 정책" ON public.answers
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "답변 수정 정책" ON public.answers
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "답변 삭제 정책" ON public.answers
    FOR DELETE
    USING (auth.uid() = user_id);

-- 실시간 구독을 위한 publication 생성
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE questions, answers;

-- 테이블 권한 설정
GRANT ALL ON public.questions TO authenticated;
GRANT ALL ON public.answers TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.questions TO anon;
GRANT SELECT ON public.answers TO anon;

-- 만족도 enum 타입이 없을 경우에만 생성
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'satisfaction_level') THEN
        CREATE TYPE satisfaction_level AS ENUM ('neutral', 'good', 'excellent');
    END IF;
END
$$;

-- questions 테이블에 satisfaction 컬럼 추가
ALTER TABLE questions ADD COLUMN IF NOT EXISTS satisfaction satisfaction_level; 