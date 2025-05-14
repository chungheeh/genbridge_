-- Drop existing answers table if exists
DROP TABLE IF EXISTS public.answers;

-- Create answers table with complete schema
CREATE TABLE public.answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_selected BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create updated_at trigger
CREATE TRIGGER update_answers_updated_at
    BEFORE UPDATE ON public.answers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "답변 조회 정책" ON public.answers;
DROP POLICY IF EXISTS "답변 생성 정책" ON public.answers;
DROP POLICY IF EXISTS "답변 수정 정책" ON public.answers;
DROP POLICY IF EXISTS "답변 삭제 정책" ON public.answers;

-- Create new policies
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS answers_user_id_idx ON public.answers(user_id);
CREATE INDEX IF NOT EXISTS answers_question_id_idx ON public.answers(question_id);
CREATE INDEX IF NOT EXISTS answers_created_at_idx ON public.answers(created_at);

-- Grant permissions
GRANT ALL ON public.answers TO authenticated;
GRANT SELECT ON public.answers TO anon; 