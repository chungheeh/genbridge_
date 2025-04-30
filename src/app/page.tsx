'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LucideMessageCircle, LucideMic, LucideWallet, UserCircle, ChevronUp, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, useScroll, useInView, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';

export default function HomePage() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // refs for animation
  const serviceRef = useRef(null);
  const featuresRef = useRef(null);
  const isServiceInView = useInView(serviceRef, { once: true, amount: 0.2 });
  const isFeaturesInView = useInView(featuresRef, { once: true, amount: 0.2 });

  // 스크롤 위치에 따라 상단으로 스크롤 버튼 표시 여부 결정
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 상단으로 스크롤
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 하단으로 스크롤
  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  // 애니메이션 변수
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 12 
      }
    }
  };

  const iconVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 15 
      }
    },
    hover: { 
      scale: 1.1, 
      rotate: [0, -5, 5, -5, 0],
      transition: { 
        type: "spring",
        duration: 0.3
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-background">
      {/* 헤더 */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.8 }}
        className="sticky top-0 w-full h-14 flex items-center bg-white border-b border-gb-neutral-200 z-50"
      >
        <div className="container mx-auto px-0 flex items-center">
          <div className="font-bold text-lg text-gb-black pl-2">GenBridge</div>
          <div className="flex-grow"></div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-full p-1 hover:bg-gb-neutral-100 transition-colors"
              >
                <UserCircle className="w-7 h-7 text-gb-neutral-400" />
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">프로필 확인</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/login" className="cursor-pointer">로그인 하기</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.header>

      {/* Hero 섹션 */}
      <section className="relative h-[400px] w-full">
        <Image
          src="https://picsum.photos/seed/genbridge-hero/1440/400"
          alt="GenBridge Hero"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="container relative z-10 flex h-full flex-col items-center justify-center text-center text-white"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1
            }}
            transition={{ 
              duration: 1.2, 
              delay: 0.3,
              scale: {
                type: "spring",
                stiffness: 100,
                damping: 10
              }
            }}
            whileInView={{ scale: [1, 1.05, 1] }}
            viewport={{ once: false }}
            className="mb-4 text-4xl font-bold md:text-6xl drop-shadow-lg text-white"
          >
            GenBridge
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-8 text-lg md:text-xl drop-shadow"
          >
            세대를 연결하는 새로운 방법
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex gap-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                asChild 
                className="bg-gb-primary hover:bg-gb-primary-dark text-white font-bold px-8 py-6 rounded-lg shadow-md border-none"
              >
                <Link href="/signup">회원가입</Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                asChild 
                className="bg-gb-primary hover:bg-gb-primary-dark text-white font-bold px-8 py-6 rounded-lg shadow-md border-none"
              >
                <Link href="/login">로그인</Link>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* 서비스 소개 카드 섹션 */}
      <motion.section 
        ref={serviceRef}
        className="container py-16"
      >
        <motion.h2 
          variants={fadeInUp}
          initial="hidden"
          animate={isServiceInView ? "visible" : "hidden"}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center text-4xl font-bold text-gb-black"
        >
          서비스 소개
        </motion.h2>
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate={isServiceInView ? "visible" : "hidden"}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          <motion.div variants={cardVariants}>
            <Card className="border border-gb-neutral-200 shadow-sm bg-white hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-gb-black text-2xl font-bold">세대 소통</CardTitle>
                <CardDescription className="text-sm text-gray-700 font-medium leading-relaxed">
                  AI를 통해 세대 간의 언어 차이를 줄이고 원활한 소통을 도와드립니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Image
                  src="https://picsum.photos/seed/genbridge-feature/400/200"
                  alt="세대 소통"
                  width={400}
                  height={200}
                  className="rounded border border-gb-neutral-200"
                />
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={cardVariants}>
            <Card className="border border-gb-neutral-200 shadow-sm bg-white hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-gb-black text-2xl font-bold">AI 기반 서비스</CardTitle>
                <CardDescription className="text-sm text-gray-700 font-medium leading-relaxed">
                  최신 AI 기술을 활용하여 정확하고 신뢰할 수 있는 답변을 제공합니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Image
                  src="https://picsum.photos/seed/genbridge-feature-2/400/200"
                  alt="AI 기반 서비스"
                  width={400}
                  height={200}
                  className="rounded border border-gb-neutral-200"
                />
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={cardVariants}>
            <Card className="border border-gb-neutral-200 shadow-sm bg-white hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-gb-black text-2xl font-bold">안전한 서비스</CardTitle>
                <CardDescription className="text-sm text-gray-700 font-medium leading-relaxed">
                  철저한 보안과 검증된 시스템으로 안전한 서비스를 제공합니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Image
                  src="https://picsum.photos/seed/genbridge-feature-3/400/200"
                  alt="안전한 서비스"
                  width={400}
                  height={200}
                  className="rounded border border-gb-neutral-200"
                />
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* 주요 기능 미리보기 섹션 */}
      <motion.section 
        ref={featuresRef}
        className="bg-gb-neutral-100 py-16"
      >
        <div className="container">
          <motion.h2 
            variants={fadeInUp}
            initial="hidden"
            animate={isFeaturesInView ? "visible" : "hidden"}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center text-3xl font-bold text-gb-black"
          >
            주요 기능
          </motion.h2>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate={isFeaturesInView ? "visible" : "hidden"}
            className="grid gap-6 md:grid-cols-3"
          >
            <motion.div variants={cardVariants} className="flex flex-col items-center text-center">
              <motion.div 
                variants={iconVariants}
                whileHover="hover"
                className="mb-4 rounded-full bg-gb-primary p-4 text-white shadow"
              >
                <LucideMessageCircle size={32} />
              </motion.div>
              <h3 className="mb-2 text-2xl font-semibold text-gb-black">질문과 답변</h3>
              <p className="text-sm text-gray-700 font-medium leading-relaxed">
                궁금한 점을 질문하고 도움이 되는 답변을 받아보세요.
              </p>
            </motion.div>
            <motion.div variants={cardVariants} className="flex flex-col items-center text-center">
              <motion.div 
                variants={iconVariants}
                whileHover="hover"
                className="mb-4 rounded-full bg-gb-primary p-4 text-white shadow"
              >
                <LucideWallet size={32} />
              </motion.div>
              <h3 className="mb-2 text-2xl font-semibold text-gb-black">포인트 적립</h3>
              <p className="text-sm text-gray-700 font-medium leading-relaxed">
                답변을 작성하고 포인트를 적립하세요.
              </p>
            </motion.div>
            <motion.div variants={cardVariants} className="flex flex-col items-center text-center">
              <motion.div 
                variants={iconVariants}
                whileHover="hover"
                className="mb-4 rounded-full bg-gb-primary p-4 text-white shadow"
              >
                <LucideMic size={32} />
              </motion.div>
              <h3 className="mb-2 text-2xl font-semibold text-gb-black">음성 인식</h3>
              <p className="text-sm text-gray-700 font-medium leading-relaxed">
                텍스트 입력이 어려우시다면 음성으로 질문하세요.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* 푸터 */}
      <footer className="bg-white py-8 border-t border-gb-neutral-200">
        <div className="container">
          <div className="flex flex-col items-center justify-center gap-4 text-sm text-gb-neutral-400 md:flex-row">
            <Link href="/terms" className="hover:text-gb-primary flex items-center gap-2">
              <LucideMessageCircle size={16} />
              이용약관
            </Link>
            <Link href="/privacy" className="hover:text-gb-primary flex items-center gap-2">
              <UserCircle size={16} />
              개인정보처리방침
            </Link>
            <Link href="/contact" className="hover:text-gb-primary flex items-center gap-2">
              <LucideMic size={16} />
              문의하기
            </Link>
          </div>
          <div className="mt-4 text-center text-sm text-gb-neutral-400">
            © 2024 GenBridge. All rights reserved.
          </div>
        </div>
      </footer>

      {/* 스크롤 버튼 */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
        <AnimatePresence>
          {showScrollTop && (
            <motion.button 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              onClick={scrollToTop} 
              className="bg-gb-primary hover:bg-gb-primary-dark text-white rounded-full p-3 shadow-md transition-all"
              aria-label="맨 위로 스크롤"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronUp size={24} />
            </motion.button>
          )}
        </AnimatePresence>
        <motion.button 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          onClick={scrollToBottom} 
          className="bg-gb-primary hover:bg-gb-primary-dark text-white rounded-full p-3 shadow-md transition-all"
          aria-label="맨 아래로 스크롤"
          whileHover={{ y: 2 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronDown size={24} />
        </motion.button>
      </div>
    </main>
  );
}
