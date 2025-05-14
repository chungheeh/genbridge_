"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, Check, Clock } from "lucide-react";
import Link from "next/link";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { toast } from "@/hooks/use-toast";
import SignupSuccess from '@/components/SignupSuccess'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// Supabase 클라이언트 생성
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// 이메일 도메인 목록
const EMAIL_DOMAINS = [
  { value: "gmail.com", label: "gmail.com" },
  { value: "naver.com", label: "naver.com" },
  { value: "daum.net", label: "daum.net" },
  { value: "hanmail.net", label: "hanmail.net" },
  { value: "kakao.com", label: "kakao.com" },
  { value: "nate.com", label: "nate.com" },
  { value: "custom", label: "직접 입력" }
];

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordEntered, setPasswordEntered] = useState(false);
  const [allChecked, setAllChecked] = useState(false);
  const [emailId, setEmailId] = useState("");
  const [emailDomain, setEmailDomain] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("gmail.com");
  const [customDomain, setCustomDomain] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("YOUTH");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 이메일 인증 관련 상태
  const [emailVerifyCode, setEmailVerifyCode] = useState("");
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isEmailVerifying, setIsEmailVerifying] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationTimer, setVerificationTimer] = useState(0);
  
  const [checks, setChecks] = useState({
    terms: false,
    service: false,
    marketing: false
  });

  const [passwordError, setPasswordError] = useState<string>("");
  const [signupSuccessOpen, setSignupSuccessOpen] = useState(false);

  // 비밀번호 유효성 검사 함수
  const validatePassword = (password: string): boolean => {
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    const isLongEnough = password.length >= 8;
    
    if (!hasNumber || !hasLetter || !isLongEnough) {
      setPasswordError("비밀번호는 영문, 숫자를 포함하여 8자 이상이어야 합니다.");
      return false;
    }
    
    setPasswordError("");
    return true;
  };

  // 도메인 선택 핸들러
  const handleDomainChange = (value: string) => {
    setSelectedDomain(value);
    if (value === 'custom') {
      setCustomDomain(true);
      setEmailDomain('');
    } else {
      setCustomDomain(false);
      setEmailDomain(value);
    }
  };

  // 전체 동의 핸들러
  const handleAllCheck = (checked: boolean) => {
    setAllChecked(checked);
    setChecks({
      terms: checked,
      service: checked,
      marketing: checked
    });
  };

  // 개별 체크박스 핸들러
  const handleSingleCheck = (name: keyof typeof checks, checked: boolean) => {
    const newChecks = { ...checks, [name]: checked };
    setChecks(newChecks);
    
    // 모든 체크박스가 체크되었는지 확인
    const allChecked = Object.values(newChecks).every(value => value === true);
    setAllChecked(allChecked);
  };

  // 비밀번호 입력 시 확인 필드 표시 여부 결정
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordEntered(value.length > 0);
    if (value.length > 0) {
      validatePassword(value);
    } else {
      setPasswordError("");
    }
  };

  // 이메일 인증 코드 요청
  const requestVerificationCode = async () => {
    const email = emailId && emailDomain ? `${emailId}@${emailDomain}` : "";
    if (!email) {
      toast({
        title: "이메일 입력 필요",
        description: "이메일을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    
    setIsEmailSending(true);
    
    try {
      // 1. Supabase RPC를 통해 인증 코드 생성
      const { data, error } = await supabase.rpc('generate_email_verification_code', {
        p_email: email
      });
      
      if (error) {
        console.error('인증 코드 생성 오류:', error);
        toast({
          title: "인증 코드 생성 실패",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      // 타이머 설정 (2분 = 120초)
      setVerificationTimer(120);
      
      // 사용자명 자동 설정 (이메일 아이디)
      if (!username) {
        setUsername(emailId);
      }

      // 개발 환경에서는 이메일 발송을 시뮬레이션
      if (process.env.NODE_ENV === 'development') {
        console.log('========== 인증 코드 ==========');
        console.log('📧 이메일:', data.email);
        console.log('🔑 인증 코드:', data.code);
        console.log('==============================');
        toast({
          title: "개발 환경 알림",
          description: "콘솔에서 인증 코드를 확인해주세요.",
        });
        return;
      }

      // 프로덕션 환경에서만 실제 이메일 발송
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const edgeFunctionResponse = await fetch(`${supabaseUrl}/functions/v1/verify-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            email: email,
            code: data.code
          }),
        });
        
        // 디버깅을 위한 응답 출력
        console.log('인증 코드:', data.code);
        console.log('Edge Function 상태:', edgeFunctionResponse.status);
        const edgeFunctionResult = await edgeFunctionResponse.json();
        console.log('Edge Function 응답:', edgeFunctionResult);
        
        if (!edgeFunctionResponse.ok) {
          throw new Error(edgeFunctionResult.error || "이메일 발송에 실패했습니다.");
        }

        toast({
          title: "인증 코드 발송 완료",
          description: "이메일로 인증 코드가 발송되었습니다. 확인해주세요.",
        });
        
        setVerificationTimer(120);
        
        // 사용자명 자동 설정 (이메일 아이디)
        if (!username) {
          setUsername(emailId);
        }
      } catch (emailError: any) {
        console.error('이메일 발송 오류:', emailError);
        
        toast({
          title: "이메일 발송 실패",
          description: emailError.message || "인증 코드 이메일을 발송하는데 실패했습니다.",
          variant: "destructive"
        });
        
        // 개발/테스트를 위해 코드를 콘솔에 출력
        console.log('인증 코드(이메일 발송 실패, 디버깅용):', data.code);
        toast({
          title: "디버깅 정보",
          description: "콘솔에서 인증 코드를 확인하고 수동으로 입력할 수 있습니다.",
        });
        
        // 타이머 설정 (2분 = 120초)
        setVerificationTimer(120);
      }
    } catch (error) {
      console.error('인증 코드 요청 오류:', error);
      toast({
        title: "오류 발생",
        description: "인증 코드 요청 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsEmailSending(false);
    }
  };
  
  // 이메일 인증 코드 확인
  const verifyEmailCode = async () => {
    const email = emailId && emailDomain ? `${emailId}@${emailDomain}` : "";
    if (!email || !emailVerifyCode) {
      toast({
        title: "입력 필요",
        description: "이메일과 인증 코드를 모두 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    
    setIsEmailVerifying(true);
    
    try {
      const { data, error } = await supabase.rpc('verify_email_code', {
        p_email: email,
        p_code: emailVerifyCode
      });
      
      console.log('인증 코드 검증 응답:', { data, error });
      
      if (error) {
        console.error('인증 코드 검증 오류:', error);
        toast({
          title: "인증 실패",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      // 인증 성공
      setIsEmailVerified(true);
      setVerificationTimer(0);
      
      toast({
        title: "이메일 인증 성공",
        description: "이메일 인증이 완료되었습니다.",
      });
      
    } catch (error) {
      console.error('인증 확인 오류:', error);
      toast({
        title: "오류 발생",
        description: "인증 확인 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsEmailVerifying(false);
    }
  };
  
  // 타이머 관리
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (verificationTimer > 0) {
      intervalId = setInterval(() => {
        setVerificationTimer(prev => {
          if (prev <= 1) {
            clearInterval(intervalId);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [verificationTimer]);
  
  // 타이머 표시 형식
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // 회원가입 처리
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // 필수 필드 검증
      if (!emailId || !emailDomain || !password || !name) {
        toast({
          title: "필수 정보 미입력",
          description: "모든 필수 정보를 입력해주세요.",
          variant: "destructive"
        });
        return;
      }

      // 비밀번호 확인
      if (password !== passwordConfirm) {
        toast({
          title: "비밀번호 불일치",
          description: "비밀번호가 일치하지 않습니다.",
          variant: "destructive"
        });
        return;
      }

      // 필수 약관 동의 확인
      if (!checks.terms || !checks.service) {
        toast({
          title: "약관 동의 필요",
          description: "필수 약관에 동의해주세요.",
          variant: "destructive"
        });
        return;
      }

      const email = `${emailId}@${emailDomain}`;
      const finalUsername = username || emailId;

      try {
        // 1. 이메일과 사용자명 중복 체크
        const { data: existingUser, error: userCheckError } = await supabase
          .from('profiles')
          .select('id, email, username')
          .or(`email.eq.${email},username.eq.${finalUsername}`)
          .maybeSingle();

        if (existingUser) {
          if (existingUser.email === email) {
            toast({
              title: "이메일 중복",
              description: "이미 가입된 이메일입니다.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "사용자명 중복",
              description: "이미 사용 중인 사용자명입니다.",
              variant: "destructive"
            });
          }
          return;
        }

        // 2. Supabase Auth로 회원가입
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              name,
              role,
              username: username || emailId
            }
          }
        });

        if (signUpError) throw signUpError;
        if (!authData.user) throw new Error('사용자 정보를 찾을 수 없습니다.');

        // 3. 프로필 생성 전 잠시 대기 (Supabase Auth 사용자 생성 완료 대기)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 4. 프로필 생성 시도 (최대 3번)
        let profileCreated = false;
        let attempts = 0;
        const maxAttempts = 3;

        while (!profileCreated && attempts < maxAttempts) {
          attempts++;
          try {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: authData.user.id,
                email: email,
                name: name,
                role: role,
                username: finalUsername
              });

            if (!profileError) {
              profileCreated = true;
              break;
            }

            if (attempts < maxAttempts) {
              // 다음 시도 전 대기
              await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
              throw profileError;
            }
          } catch (error) {
            console.error(`프로필 생성 시도 ${attempts} 실패:`, error);
            if (attempts === maxAttempts) {
              throw error;
            }
          }
        }

        if (!profileCreated) {
          // 프로필 생성 실패 시 사용자 삭제 시도
          try {
            await supabase.auth.admin.deleteUser(authData.user.id);
          } catch (deleteError) {
            console.error('사용자 삭제 실패:', deleteError);
          }
          throw new Error('프로필 생성에 실패했습니다.');
        }

        // 5. 회원가입 성공
        setSignupSuccessOpen(true);
        
      } catch (error: any) {
        console.error('회원가입 처리 중 오류:', error);
        toast({
          title: "회원가입 실패",
          description: error.message || "회원가입 처리 중 오류가 발생했습니다.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('회원가입 처리 중 오류:', error);
      toast({
        title: "회원가입 실패",
        description: "회원가입 처리 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
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

      {/* 회원가입 컨텐츠 */}
      <div className="flex-1 container flex flex-col items-center justify-center p-4 mx-auto">
        <Card className="w-full max-w-lg border shadow-sm">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-center">회원가입</h1>
              <p className="text-center text-gray-600">세대 간 소통의 시작, 젠브릿지와 함께하세요.</p>
            </div>

            {/* 약관 동의 섹션 */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="all-agree" 
                    checked={allChecked} 
                    onCheckedChange={(checked) => handleAllCheck(checked as boolean)}
                  />
                  <label 
                    htmlFor="all-agree" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    약관에 모두 동의합니다.
                  </label>
                </div>

                <div className="pl-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="terms" 
                        checked={checks.terms}
                        onCheckedChange={(checked) => handleSingleCheck('terms', checked as boolean)}
                      />
                      <label 
                        htmlFor="terms" 
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        이용약관에 동의합니다. (필수)
                      </label>
                    </div>
                    <Button variant="link" className="text-xs h-auto p-0">내용보기</Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="service" 
                        checked={checks.service}
                        onCheckedChange={(checked) => handleSingleCheck('service', checked as boolean)}
                      />
                      <label 
                        htmlFor="service" 
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        서비스 약관에 동의합니다. (필수)
                      </label>
                    </div>
                    <Button variant="link" className="text-xs h-auto p-0">내용보기</Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="marketing" 
                        checked={checks.marketing}
                        onCheckedChange={(checked) => handleSingleCheck('marketing', checked as boolean)}
                      />
                      <label 
                        htmlFor="marketing" 
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        마케팅 서비스 이용에 동의합니다. (선택)
                      </label>
                    </div>
                    <Button variant="link" className="text-xs h-auto p-0">내용보기</Button>
                  </div>
                </div>
              </div>
            </div>

            {/* 회원가입 폼 */}
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="email-id">이메일</Label>
                <div className="flex items-center mt-1">
                  <Input 
                    id="email-id" 
                    placeholder="이메일 입력" 
                    type="text"
                    value={emailId}
                    onChange={(e) => setEmailId(e.target.value)}
                    className="flex-1"
                    required
                    disabled={isEmailVerified}
                  />
                  <span className="mx-2">@</span>
                  {customDomain ? (
                    <Input 
                      id="custom-domain" 
                      placeholder="도메인 입력" 
                      type="text"
                      value={emailDomain}
                      onChange={(e) => setEmailDomain(e.target.value)}
                      className="flex-1"
                      required
                      disabled={isEmailVerified}
                    />
                  ) : (
                    <div className="flex-1">
                      <Select 
                        value={selectedDomain} 
                        onValueChange={handleDomainChange}
                        disabled={isEmailVerified}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="도메인 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {EMAIL_DOMAINS.map((domain) => (
                            <SelectItem key={domain.value} value={domain.value}>
                              {domain.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 이메일 인증 섹션 */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={requestVerificationCode}
                    disabled={isEmailSending || isEmailVerified || !emailId || !emailDomain}
                  >
                    {isEmailSending ? '발송 중...' : '인증번호 발송'}
                  </Button>
                </div>
                
                {verificationTimer > 0 && !isEmailVerified && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="인증번호 입력"
                        value={emailVerifyCode}
                        onChange={(e) => setEmailVerifyCode(e.target.value)}
                        required
                      />
                      <div className="flex items-center whitespace-nowrap text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{formatTimer(verificationTimer)}</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full"
                      onClick={verifyEmailCode}
                      disabled={isEmailVerifying || !emailVerifyCode}
                    >
                      {isEmailVerifying ? '확인 중...' : '인증번호 확인'}
                    </Button>
                  </div>
                )}
                
                {isEmailVerified && (
                  <div className="flex items-center text-green-600 text-sm">
                    <Check className="w-4 h-4 mr-1" />
                    <span>이메일 인증 완료</span>
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="name">이름</Label>
                <Input 
                  id="name" 
                  placeholder="이름을 입력해주세요" 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">전화번호</Label>
                <Input 
                  id="phone" 
                  placeholder="휴대폰 번호 입력('-' 제외 11자리 입력)" 
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative mt-1">
                  <Input 
                    id="password" 
                    placeholder="비밀번호를 입력해주세요" 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    required
                  />
                  <button 
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-sm text-red-500 mt-1">{passwordError}</p>
                )}
                {passwordEntered && (
                  <div className="relative mt-2">
                    <Label htmlFor="password-confirm">비밀번호 확인</Label>
                    <div className="relative mt-1">
                      <Input 
                        id="password-confirm" 
                        placeholder="비밀번호를 재입력해주세요" 
                        type={showPasswordConfirm ? "text" : "password"}
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        required
                      />
                      <button 
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      >
                        {showPasswordConfirm ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="role">회원 유형</Label>
                <Select 
                  value={role} 
                  onValueChange={(value) => setRole(value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="회원 유형을 선택해주세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YOUTH">청년</SelectItem>
                    <SelectItem value="SENIOR">시니어</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-green-500 hover:bg-green-600 mt-2"
                disabled={isSubmitting || !isEmailVerified}
              >
                {isSubmitting ? '처리 중...' : '회원가입'}
              </Button>
              
              <div className="mt-4 text-center text-sm">
                이미 계정이 있으신가요? <Link href="/login" className="text-gb-primary hover:underline">로그인</Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <Dialog open={signupSuccessOpen} onOpenChange={setSignupSuccessOpen}>
        <DialogContent className="max-w-md p-0 bg-transparent shadow-none border-none">
          <DialogHeader className="sr-only">
            <DialogTitle>회원가입 성공</DialogTitle>
          </DialogHeader>
          <SignupSuccess onLogin={() => {
            setSignupSuccessOpen(false);
            router.push('/login');
          }} />
        </DialogContent>
      </Dialog>
    </div>
  );
} 