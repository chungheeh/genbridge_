import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { AnswerList } from "./components/AnswerList"
import { SeniorHeader } from "@/features/senior/components/SeniorHeader"

export const metadata: Metadata = {
  title: "답변 확인 | GenBridge",
  description: "질문에 대한 답변을 확인하고 채택하실 수 있습니다.",
}

export default async function AnswersPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 섹션 */}
      <SeniorHeader />

      {/* 탭 메뉴 */}
      <div className="senior-nav">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex gap-8">
            <Link 
              href="/senior/ask"
              className="py-4 text-lg font-medium text-neutral-400 hover:text-neutral-600"
            >
              질문하기
            </Link>
            <Link 
              href="/senior/answers"
              className="py-4 text-lg font-medium border-b-2 border-[#00C73C] text-[#00C73C]"
            >
              답변 확인
            </Link>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <main className="flex-1">
        <div className="max-w-[1200px] mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-black">답변 확인</h1>
            <div className="flex gap-4">
              <Button 
                asChild
                className="bg-[#00C73C] hover:bg-[#00912C] text-white rounded-full h-10 px-4 flex items-center gap-2"
              >
                <Link href="/senior/ask">
                  <span className="text-xl font-bold">+</span>
                  <span>질문하기</span>
                </Link>
              </Button>
            </div>
          </div>
          <AnswerList />
        </div>
      </main>
    </div>
  )
} 