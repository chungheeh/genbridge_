-- Add answered_at and answered_by columns to questions table
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS answered_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS answered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for answered_by column
CREATE INDEX IF NOT EXISTS questions_answered_by_idx ON public.questions(answered_by);

-- Update RLS policies for questions table
DROP POLICY IF EXISTS "질문 수정 정책" ON public.questions;
CREATE POLICY "질문 수정 정책" ON public.questions
    FOR UPDATE
    USING (
      auth.uid() = user_id OR 
      (auth.uid() = answered_by AND status = 'answered')
    );

-- Create answers table if not exists
CREATE TABLE IF NOT EXISTS public.answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_selected BOOLEAN DEFAULT false NOT NULL
);

-- Create ai_answers table if not exists
CREATE TABLE IF NOT EXISTS public.ai_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for answers table
CREATE INDEX IF NOT EXISTS answers_question_id_idx ON public.answers(question_id);
CREATE INDEX IF NOT EXISTS answers_user_id_idx ON public.answers(user_id);

-- Create indexes for ai_answers table
CREATE INDEX IF NOT EXISTS ai_answers_question_id_idx ON public.ai_answers(question_id);

-- Enable RLS for answers table
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- Enable RLS for ai_answers table
ALTER TABLE public.ai_answers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for answers table
DROP POLICY IF EXISTS "답변 조회 정책" ON public.answers;
CREATE POLICY "답변 조회 정책" ON public.answers
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.questions
            WHERE id = answers.question_id
            AND NOT is_ai_question
        )
    );

DROP POLICY IF EXISTS "답변 생성 정책" ON public.answers;
CREATE POLICY "답변 생성 정책" ON public.answers
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.questions
            WHERE id = question_id
            AND status = 'pending'
            AND user_id != auth.uid()
            AND NOT is_ai_question
        )
    );

DROP POLICY IF EXISTS "답변 수정 정책" ON public.answers;
CREATE POLICY "답변 수정 정책" ON public.answers
    FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "답변 삭제 정책" ON public.answers;
CREATE POLICY "답변 삭제 정책" ON public.answers
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create RLS policies for ai_answers table
DROP POLICY IF EXISTS "AI 답변 조회 정책" ON public.ai_answers;
CREATE POLICY "AI 답변 조회 정책" ON public.ai_answers
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.questions
            WHERE id = ai_answers.question_id
            AND is_ai_question
        )
    );

DROP POLICY IF EXISTS "AI 답변 생성 정책" ON public.ai_answers;
CREATE POLICY "AI 답변 생성 정책" ON public.ai_answers
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.questions
            WHERE id = question_id
            AND is_ai_question
        )
    );

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS answers_updated_at ON public.answers;
CREATE TRIGGER answers_updated_at
    BEFORE UPDATE ON public.answers
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS ai_answers_updated_at ON public.ai_answers;
CREATE TRIGGER ai_answers_updated_at
    BEFORE UPDATE ON public.ai_answers
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 