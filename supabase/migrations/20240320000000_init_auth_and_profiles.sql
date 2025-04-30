-- 필요한 확장 설치
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- auth 스키마 생성 (없는 경우)
CREATE SCHEMA IF NOT EXISTS auth;

-- 기존 객체 삭제
DROP FUNCTION IF EXISTS public.sign_in(text,text);
DROP FUNCTION IF EXISTS public.sign_up(text,text,text,text,text);
DROP FUNCTION IF EXISTS public.verify_email_code(text,text);
DROP FUNCTION IF EXISTS public.generate_email_verification_code(text);

DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.password_reset_tokens CASCADE;
DROP TABLE IF EXISTS public.email_verification_codes CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.answers CASCADE;
DROP TABLE IF EXISTS public.point_histories CASCADE;

-- 테이블 생성
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    role TEXT CHECK (role IN ('YOUTH', 'SENIOR')),
    username TEXT UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.email_verification_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('YOUTH', 'SENIOR')),
    is_senior_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- 질문과 답변 테이블 생성
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'answered')),
    created_by UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES questions(id) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID REFERENCES auth.users(id)
);

-- 이메일 인증 코드 생성 함수
CREATE OR REPLACE FUNCTION public.generate_email_verification_code(
    p_email TEXT
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_code TEXT;
    v_id UUID;
    v_result BOOLEAN;
    v_error TEXT;
BEGIN
    -- 이미 가입된 이메일인지 확인
    IF EXISTS (SELECT 1 FROM public.users WHERE email = p_email AND email_verified = true) THEN
        RETURN json_build_object(
            'success', false,
            'error', '이미 가입된 이메일입니다.'
        );
    END IF;

    -- 이전 코드 만료 처리
    UPDATE public.email_verification_codes
    SET expires_at = timezone('utc', now())
    WHERE email = p_email AND expires_at > timezone('utc', now());

    -- 6자리 숫자 코드 생성
    v_code := lpad(floor(random() * 1000000)::text, 6, '0');
    
    -- 새 코드 저장
    INSERT INTO public.email_verification_codes (email, code, expires_at)
    VALUES (
        p_email,
        v_code,
        timezone('utc', now()) + interval '10 minutes'
    )
    RETURNING id INTO v_id;

    RETURN json_build_object(
        'success', true,
        'id', v_id,
        'email', p_email,
        'code', v_code,
        'expires_at', timezone('utc', now()) + interval '10 minutes'
    );
END;
$$;

-- 이메일 인증 코드 확인 함수
CREATE OR REPLACE FUNCTION public.verify_email_code(
    p_email TEXT,
    p_code TEXT
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_code_record public.email_verification_codes;
BEGIN
    -- 유효한 코드 찾기
    SELECT * INTO v_code_record
    FROM public.email_verification_codes
    WHERE email = p_email 
    AND code = p_code
    AND expires_at > timezone('utc', now())
    AND verified_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_code_record IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', '유효하지 않은 인증 코드입니다.'
        );
    END IF;

    -- 코드 인증 완료 처리
    UPDATE public.email_verification_codes
    SET verified_at = timezone('utc', now())
    WHERE id = v_code_record.id;

    RETURN json_build_object(
        'success', true,
        'email', p_email,
        'verified_at', timezone('utc', now())
    );
END;
$$;

-- 회원가입 함수
CREATE OR REPLACE FUNCTION public.sign_up(
    p_email TEXT,
    p_password TEXT,
    p_name TEXT,
    p_role TEXT,
    p_username TEXT
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_token TEXT;
    v_verified BOOLEAN;
BEGIN
    -- 이메일 중복 체크
    IF EXISTS (SELECT 1 FROM public.users WHERE email = p_email) THEN
        RETURN json_build_object('success', false, 'error', '이미 사용 중인 이메일입니다.');
    END IF;

    -- 사용자명 중복 체크
    IF EXISTS (SELECT 1 FROM public.profiles WHERE username = p_username) THEN
        RETURN json_build_object('success', false, 'error', '이미 사용 중인 사용자명입니다.');
    END IF;
    
    -- 이메일 인증 여부 확인 (가장 최근의 유효한 인증 코드 확인)
    SELECT EXISTS (
        SELECT 1
        FROM public.email_verification_codes
        WHERE email = p_email
        AND verified_at IS NOT NULL
        AND expires_at > timezone('utc', now())
        ORDER BY created_at DESC
        LIMIT 1
    ) INTO v_verified;
    
    IF NOT v_verified THEN
        RETURN json_build_object('success', false, 'error', '이메일 인증이 필요합니다.');
    END IF;

    -- 사용자 생성
    INSERT INTO public.users (email, password_hash, name, role, username, email_verified)
    VALUES (
        p_email,
        crypt(p_password, gen_salt('bf')),
        p_name,
        p_role,
        p_username,
        true
    )
    RETURNING id INTO v_user_id;

    -- 프로필 생성
    INSERT INTO public.profiles (id, username, name, email, role, is_senior_verified)
    VALUES (
        v_user_id,
        p_username,
        p_name,
        p_email,
        p_role,
        p_role = 'SENIOR'
    );

    -- 세션 토큰 생성
    v_token := encode(gen_random_bytes(32), 'hex');
    
    INSERT INTO public.sessions (user_id, token, expires_at)
    VALUES (
        v_user_id,
        v_token,
        timezone('utc', now()) + interval '30 days'
    );

    RETURN json_build_object(
        'success', true,
        'user_id', v_user_id,
        'token', v_token
    );
END;
$$;

-- 로그인 함수
CREATE OR REPLACE FUNCTION public.sign_in(
    p_email TEXT,
    p_password TEXT
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user public.users;
    v_token TEXT;
BEGIN
    -- 사용자 확인 (비밀번호 검증 로직 수정)
    SELECT * INTO v_user
    FROM public.users
    WHERE email = p_email;

    IF v_user IS NULL THEN
        RETURN json_build_object('success', false, 'error', '이메일 또는 비밀번호가 올바르지 않습니다.');
    END IF;

    IF v_user.password_hash != crypt(p_password, v_user.password_hash) THEN
        RETURN json_build_object('success', false, 'error', '이메일 또는 비밀번호가 올바르지 않습니다.');
    END IF;

    -- 세션 토큰 생성
    v_token := encode(gen_random_bytes(32), 'hex');
    
    INSERT INTO public.sessions (user_id, token, expires_at)
    VALUES (
        v_user.id,
        v_token,
        timezone('utc', now()) + interval '30 days'
    );

    RETURN json_build_object(
        'success', true,
        'user_id', v_user.id,
        'email', v_user.email,
        'name', v_user.name,
        'role', v_user.role,
        'username', v_user.username,
        'token', v_token
    );
END;
$$;

-- 이메일 인증 정책 수정
ALTER TABLE auth.users ALTER COLUMN email_confirmed_at SET DEFAULT NOW();

-- 기존 사용자들의 이메일 인증 상태 업데이트
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;

-- 프로필 생성 함수 수정
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, username, role)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.email,  -- 임시로 이메일을 username으로 사용
        'SENIOR'    -- 기본값으로 SENIOR 설정
    );
    
    -- 이메일 인증 상태 자동 업데이트
    UPDATE auth.users 
    SET email_confirmed_at = NOW()
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 임시 비활성화
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 테스트 데이터 추가
-- 기존 테스트 데이터 삭제 (순서 중요)
DELETE FROM public.questions WHERE created_by IN (SELECT id FROM auth.users WHERE email = 'senior@example.com');
DELETE FROM public.profiles WHERE email = 'senior@example.com';
DELETE FROM public.users WHERE email = 'senior@example.com';
DELETE FROM public.sessions WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'senior@example.com');
DELETE FROM public.email_verification_codes WHERE email = 'senior@example.com';
DELETE FROM auth.users WHERE email = 'senior@example.com';

-- 시니어 계정 생성
DO $$
DECLARE
    v_user_id UUID := gen_random_uuid();
BEGIN
    -- auth.users에 시니어 계정 생성
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        role,
        aud,
        confirmation_token
    ) VALUES (
        v_user_id,
        '00000000-0000-0000-0000-000000000000',
        'senior@example.com',
        crypt('senior123!', gen_salt('bf')),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{"name": "테스트 시니어"}',
        now(),
        now(),
        'authenticated',
        'authenticated',
        encode(gen_random_bytes(32), 'hex')
    );

    -- 이메일 인증 코드 생성 및 확인
    INSERT INTO public.email_verification_codes (
        email,
        code,
        expires_at,
        verified_at
    ) VALUES (
        'senior@example.com',
        '123456',
        timezone('utc', now()) + interval '10 minutes',
        timezone('utc', now())
    );

    -- public.users에 시니어 계정 생성
    INSERT INTO public.users (
        id,
        email,
        password_hash,
        name,
        role,
        username,
        email_verified
    ) VALUES (
        v_user_id,
        'senior@example.com',
        crypt('senior123!', gen_salt('bf')),
        '테스트 시니어',
        'SENIOR',
        'testsenior',
        true
    );

    -- 프로필 생성
    INSERT INTO public.profiles (
        id,
        username,
        name,
        email,
        role,
        is_senior_verified
    ) VALUES (
        v_user_id,
        'testsenior',
        '테스트 시니어',
        'senior@example.com',
        'SENIOR',
        true
    );

    -- 변경사항 커밋 확인
    RAISE NOTICE 'Created user with ID: %', v_user_id;

    -- 트리거 재활성화
    CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
END $$;

-- RLS 정책 설정
-- Questions 테이블 RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read questions"
    ON public.questions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create their own questions"
    ON public.questions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

-- Answers 테이블 RLS
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read answers"
    ON public.answers FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create their own answers"
    ON public.answers FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

-- 인덱스 생성
CREATE INDEX questions_status_idx ON public.questions(status);
CREATE INDEX questions_created_at_idx ON public.questions(created_at DESC);
CREATE INDEX answers_question_id_idx ON public.answers(question_id);

-- 포인트 내역 테이블 생성
CREATE TABLE IF NOT EXISTS public.point_histories (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('EARN', 'USE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 포인트 내역 인덱스 생성
CREATE INDEX idx_point_histories_user_id ON point_histories(user_id);

-- 포인트 내역 RLS 활성화
ALTER TABLE public.point_histories ENABLE ROW LEVEL SECURITY;

-- 포인트 내역 조회 정책
CREATE POLICY "Users can view their own point histories"
  ON point_histories
  FOR SELECT
  USING (auth.uid() = user_id);

-- 포인트 내역 생성 정책
CREATE POLICY "System can insert point histories"
  ON point_histories
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 포인트 내역 updated_at 트리거
CREATE TRIGGER update_point_histories_updated_at
  BEFORE UPDATE ON point_histories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 포인트 내역 테스트 데이터 추가
INSERT INTO public.point_histories (user_id, amount, description, type, created_at)
SELECT 
    (SELECT id FROM auth.users WHERE email = 'senior@example.com'),
    amount,
    description,
    type,
    created_at
FROM (VALUES
    (100, '답변 채택 보상', 'EARN', NOW() - INTERVAL '1 day'),
    (50, '답변 작성 보상', 'EARN', NOW() - INTERVAL '2 days'),
    (100, '답변 채택 보상', 'EARN', NOW() - INTERVAL '3 days'),
    (50, '답변 작성 보상', 'EARN', NOW() - INTERVAL '4 days'),
    (200, '우수 답변 보너스', 'EARN', NOW() - INTERVAL '5 days'),
    (100, '답변 채택 보상', 'EARN', NOW() - INTERVAL '6 days'),
    (50, '답변 작성 보상', 'EARN', NOW() - INTERVAL '7 days'),
    (500, '이달의 조력자 보상', 'EARN', NOW() - INTERVAL '8 days'),
    (100, '포인트 사용', 'USE', NOW() - INTERVAL '9 days'),
    (200, '포인트 사용', 'USE', NOW() - INTERVAL '10 days')
) AS v(amount, description, type, created_at); 