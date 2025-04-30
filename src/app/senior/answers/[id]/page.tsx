import { Metadata } from "next"

export const metadata: Metadata = {
  title: "답변 상세 | GenBridge",
  description: "답변 내용을 자세히 확인하실 수 있습니다.",
}

type Props = {
  params: {
    id: string
  }
}

export default async function AnswerDetailPage({ params }: Props) {
  // TODO: API로 답변 상세 정보 가져오기
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">답변 상세</h1>
      <p>답변 ID: {params.id}</p>
    </main>
  )
} 