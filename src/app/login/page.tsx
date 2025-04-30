"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from "sonner";
import { AuthError } from '@supabase/supabase-js';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [showPassword, setShowPassword] = useState(false);
  const [seniorEmail, setSeniorEmail] = useState("");
  const [seniorPassword, setSeniorPassword] = useState("");
  const [youthEmail, setYouthEmail] = useState("");
  const [youthPassword, setYouthPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthError = (error: AuthError) => {
    switch (error.message) {
      case 'Invalid login credentials':
        return '이메일 또는 비밀번호가 올바르지 않습니다. 회원가입을 하지 않으셨다면 회원가입을 먼저 진행해주세요.';
      case 'Email not confirmed':
        return '이메일 인증이 필요합니다. 이메일을 확인해주세요.';
      case 'User not found':
        return '등록되지 않은 사용자입니다. 회원가입을 먼저 진행해주세요.';
      default:
        return `로그인 오류: ${error.message}`;
    }
  };

  const handleSeniorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seniorEmail || !seniorPassword) {
      toast.error('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    const trimmedEmail = seniorEmail.trim().toLowerCase();
    const trimmedPassword = seniorPassword.trim();
    
    setIsLoading(true);
    try {
      // 현재 세션이 있다면 로그아웃
      await supabase.auth.signOut();

      // 프로필 테이블에서 이메일로 검색
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', trimmedEmail)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('프로필 검색 에러:', profileError);
        toast.error('프로필 확인 중 오류가 발생했습니다.');
        return;
      }

      // 프로필이 있지만 SENIOR가 아닌 경우
      if (existingProfile && existingProfile.role !== 'SENIOR') {
        toast.error('시니어 계정이 아닙니다.');
        return;
      }

      // 로그인 시도
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (signInError) {
        console.error('로그인 에러:', signInError);
        
        // 계정이 없는 경우
        if (signInError.message === 'Invalid login credentials' && !existingProfile) {
          toast.error('등록되지 않은 계정입니다. 회원가입을 먼저 진행해주세요.');
          return;
        }
        
        // 비밀번호가 틀린 경우
        if (signInError.message === 'Invalid login credentials' && existingProfile) {
          toast.error('비밀번호가 올바르지 않습니다.');
          return;
        }

        toast.error(handleAuthError(signInError));
        return;
      }

      const { user } = data;
      if (!user) {
        toast.error('로그인에 실패했습니다.');
        return;
      }

      // 프로필이 없는 경우 생성
      if (!existingProfile) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              email: user.email,
              username: user.email?.split('@')[0] || user.id,
              role: 'SENIOR',
              created_at: new Date().toISOString()
            }
          ]);

        if (insertError) {
          console.error('프로필 생성 에러:', insertError);
          toast.error('프로필 생성에 실패했습니다.');
          await supabase.auth.signOut();
          return;
        }
      }

      toast.success('로그인 성공!');
      router.push('/senior');
      router.refresh();
    } catch (error) {
      console.error('예상치 못한 오류:', error);
      toast.error('로그인 중 오류가 발생했습니다.');
      await supabase.auth.signOut();
    } finally {
      setIsLoading(false);
    }
  };

  const handleYouthLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youthEmail || !youthPassword) {
      toast.error('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    const trimmedEmail = youthEmail.trim().toLowerCase();
    const trimmedPassword = youthPassword.trim();

    setIsLoading(true);
    try {
      // 현재 세션이 있다면 로그아웃
      await supabase.auth.signOut();

      // 프로필 테이블에서 이메일로 검색
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', trimmedEmail)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('프로필 검색 에러:', profileError);
        toast.error('프로필 확인 중 오류가 발생했습니다.');
        return;
      }

      // 프로필이 있지만 YOUTH가 아닌 경우
      if (existingProfile && existingProfile.role !== 'YOUTH') {
        toast.error('청년 계정이 아닙니다.');
        return;
      }

      // 로그인 시도
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (signInError) {
        console.error('로그인 에러:', signInError);
        
        // 계정이 없는 경우
        if (signInError.message === 'Invalid login credentials' && !existingProfile) {
          toast.error('등록되지 않은 계정입니다. 회원가입을 먼저 진행해주세요.');
          return;
        }
        
        // 비밀번호가 틀린 경우
        if (signInError.message === 'Invalid login credentials' && existingProfile) {
          toast.error('비밀번호가 올바르지 않습니다.');
          return;
        }

        toast.error(handleAuthError(signInError));
        return;
      }

      const { user } = data;
      if (!user) {
        toast.error('로그인에 실패했습니다.');
        return;
      }

      // 프로필이 없는 경우 생성
      if (!existingProfile) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              email: user.email,
              username: user.email?.split('@')[0] || user.id,
              role: 'YOUTH',
              created_at: new Date().toISOString()
            }
          ]);

        if (insertError) {
          console.error('프로필 생성 에러:', insertError);
          toast.error('프로필 생성에 실패했습니다.');
          await supabase.auth.signOut();
          return;
        }
      }

      toast.success('로그인 성공!');
      router.push('/youth');
      router.refresh();
    } catch (error) {
      console.error('예상치 못한 오류:', error);
      toast.error('로그인 중 오류가 발생했습니다.');
      await supabase.auth.signOut();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 섹션 */}
      <header className="w-full py-4 px-6 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            GenBridge
          </Link>
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              홈
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900">
              소개
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900">
              문의
            </Link>
          </nav>
        </div>
      </header>

      {/* 로그인 컨텐츠 */}
      <div className="flex-1 container flex flex-col items-center justify-center p-4 mx-auto">
        <Card className="w-full max-w-md border shadow-sm">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-center">로그인</h1>
              <p className="text-center text-gray-600">젠브릿지에 오신 것을 환영합니다</p>
            </div>
            
            <Tabs defaultValue="청년" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="청년">청년</TabsTrigger>
                <TabsTrigger value="시니어">시니어</TabsTrigger>
              </TabsList>
              
              <TabsContent value="청년" className="mt-4 space-y-4">
                <Card className="overflow-hidden border">
                  <CardContent className="p-0">
                    <Image 
                      src="https://picsum.photos/seed/genbridge-login/800/400" 
                      alt="로그인 이미지"
                      width={800}
                      height={400}
                      className="object-cover w-full h-56"
                    />
                  </CardContent>
                </Card>
                
                <form onSubmit={handleYouthLogin} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block mb-2 text-sm font-medium">이메일</label>
                    <Input 
                      id="email" 
                      placeholder="이메일을 입력해주세요" 
                      type="email"
                      value={youthEmail}
                      onChange={(e) => setYouthEmail(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block mb-2 text-sm font-medium">비밀번호</label>
                    <div className="relative">
                      <Input 
                        id="password" 
                        placeholder="비밀번호를 입력해주세요" 
                        type={showPassword ? "text" : "password"}
                        value={youthPassword}
                        onChange={(e) => setYouthPassword(e.target.value)}
                      />
                      <button 
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                      </button>
                    </div>
                    <div className="mt-2 text-right">
                      <Link href="/reset-password" className="text-sm text-green-600 hover:text-green-700">
                        비밀번호를 잊으셨나요?
                      </Link>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full bg-green-500 hover:bg-green-600" disabled={isLoading}>로그인</Button>
                  
                  <div className="text-center text-sm text-gray-600">
                    계정이 없으신가요?{' '}
                    <Link href="/signup" className="text-green-600 hover:text-green-700">
                      회원가입
                    </Link>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="시니어" className="mt-4 space-y-4">
                <Card className="overflow-hidden border">
                  <CardContent className="p-0">
                    <Image 
                      src="https://picsum.photos/seed/genbridge-login/800/400" 
                      alt="로그인 이미지"
                      width={800}
                      height={400}
                      className="object-cover w-full h-56"
                    />
                  </CardContent>
                </Card>
                
                <form onSubmit={handleSeniorLogin} className="space-y-4">
                  <div>
                    <label htmlFor="senior-email" className="block mb-2 text-sm font-medium">이메일</label>
                    <Input 
                      id="senior-email" 
                      placeholder="이메일을 입력해주세요" 
                      type="email"
                      value={seniorEmail}
                      onChange={(e) => setSeniorEmail(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="senior-password" className="block mb-2 text-sm font-medium">비밀번호</label>
                    <div className="relative">
                      <Input 
                        id="senior-password" 
                        placeholder="비밀번호를 입력해주세요" 
                        type={showPassword ? "text" : "password"}
                        value={seniorPassword}
                        onChange={(e) => setSeniorPassword(e.target.value)}
                      />
                      <button 
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                      </button>
                    </div>
                    <div className="mt-2 text-right">
                      <Link href="/reset-password" className="text-sm text-green-600 hover:text-green-700">
                        비밀번호를 잊으셨나요?
                      </Link>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full bg-green-500 hover:bg-green-600" disabled={isLoading}>로그인</Button>
                  
                  <div className="text-center text-sm text-gray-600">
                    계정이 없으신가요?{' '}
                    <Link href="/signup" className="text-green-600 hover:text-green-700">
                      회원가입
                    </Link>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 