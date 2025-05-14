-- AI 질문 삭제
DELETE FROM public.questions
WHERE is_ai_question = true;

-- questions 테이블의 RLS 정책 수정
DROP POLICY IF EXISTS "질문 조회 정책" ON public.questions;
CREATE POLICY "질문 조회 정책" ON public.questions
    FOR SELECT
    USING (
        (NOT is_ai_question) OR  -- youth는 AI 질문을 볼 수 없음
        (auth.uid() IN (
            SELECT id FROM auth.users
            WHERE raw_user_meta_data->>'role' = 'elder'
        ))  -- elder는 모든 질문을 볼 수 있음
    );

-- answers 테이블의 RLS 정책 수정
DROP POLICY IF EXISTS "답변 조회 정책" ON public.answers;
CREATE POLICY "답변 조회 정책" ON public.answers
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.questions
            WHERE id = answers.question_id
            AND (
                NOT is_ai_question OR  -- youth는 AI 질문의 답변을 볼 수 없음
                auth.uid() IN (
                    SELECT id FROM auth.users
                    WHERE raw_user_meta_data->>'role' = 'elder'
                )  -- elder는 모든 답변을 볼 수 있음
            )
        )
    ); 