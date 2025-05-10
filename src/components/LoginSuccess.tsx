'use client'

import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'

interface LoginSuccessProps {
  role: string;
  onContinue: () => void;
}

export default function LoginSuccess({ role, onContinue }: LoginSuccessProps) {
  const roleName = role === 'SENIOR' ? '시니어' : '청년';
  const pageInfo = role === 'SENIOR' ? '시니어 홈' : '청년 홈';
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] bg-[#F5F6F7]">
      <Card className="w-full max-w-md border-[#E5E7EB] shadow-lg">
        <CardContent className="p-8 space-y-8 text-center">
          <motion.div 
            className="relative"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            <div className="absolute -inset-1 bg-[#00C73C]/20 rounded-full blur-lg" />
            <CheckCircle className="relative mx-auto h-16 w-16 text-[#00C73C]" />
          </motion.div>
          
          <motion.div 
            className="space-y-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-2xl font-semibold tracking-tight text-[#222222]">
              로그인에 성공했습니다
            </h1>
            <p className="text-sm text-[#B0B8C1]">
              {roleName} 역할로 로그인했습니다.<br />
              {pageInfo}으로 이동합니다.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              className="w-full bg-[#00C73C] hover:bg-[#00912C] text-white transition-all duration-300 transform active:scale-95 hover:shadow-lg"
              onClick={onContinue}
            >
              계속하기
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  )
} 