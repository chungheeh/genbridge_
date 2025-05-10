import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 현재 세션 확인
    const checkUser = async () => {
      try {
        // 만료된 세션 처리
        const { data: { session } } = await supabase.auth.getSession();

        // 세션이 만료되었거나 유효하지 않으면 로그아웃
        if (!session) {
          // 로컬 스토리지 정리
          if (typeof window !== 'undefined') {
            localStorage.removeItem('supabase.auth.token');
          }
          setUser(null);
          setLoading(false);
          return;
        }

        // 유효한 세션이 있는 경우
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Auth error:', error);
        // 에러가 발생한 경우 로그아웃 처리
        if (typeof window !== 'undefined') {
          localStorage.removeItem('supabase.auth.token');
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // 초기 사용자 상태 확인
    checkUser();

    // 인증 상태 변경 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
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

  const handleLogout = async () => {
    try {
      // 로컬 스토리지 정리
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token');
      }
      await supabase.auth.signOut();
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
    }
  };

  return { user, loading, handleLogout };
} 