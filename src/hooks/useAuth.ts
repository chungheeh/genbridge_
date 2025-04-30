import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';

export function useAuth() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 현재 세션 확인
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Auth error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // 초기 사용자 상태 확인
    checkUser();

    // 인증 상태 변경 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 클린업 함수
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  // 테스트용 임시 사용자 설정
  useEffect(() => {
    if (!user && !loading) {
      setUser({
        id: "test-user-id",
        email: "senior@example.com",
        role: "authenticated",
        aud: "authenticated",
      } as User);
    }
  }, [user, loading]);

  return { user, loading };
} 