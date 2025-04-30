"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Volume2, Square } from "lucide-react"

type Answer = {
  id: string
  question: string
  answer: string
  date: Date
  status: "pending" | "accepted" | "rejected"
  type: "ai" | "youth"
}

const mockAnswers: Answer[] = [
  {
    id: "1",
    question: "스마트폰으로 사진 찍는 방법이 궁금해요",
    answer: "스마트폰 카메라 앱을 실행한 후, 하단의 큰 동그란 버튼을 누르시면 사진이 찍힙니다. 사진 촬영 전 화면을 터치하시면 초점을 맞출 수 있습니다.",
    date: new Date(),
    status: "pending",
    type: "youth"
  },
  {
    id: "2", 
    question: "카카오톡 프로필 사진 변경하는 법",
    answer: "카카오톡 앱을 열고 하단의 '더보기' 탭을 선택하신 후, 프로필 영역을 터치하시면 프로필 사진을 변경하실 수 있습니다.",
    date: new Date(),
    status: "accepted",
    type: "ai"
  }
]

export function AnswerList() {
  const [answers, setAnswers] = useState<Answer[]>(mockAnswers)
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [speechUtterance, setSpeechUtterance] = useState<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    // 컴포넌트가 언마운트될 때 음성 재생 중지
    return () => {
      if (speechUtterance) {
        window.speechSynthesis.cancel()
      }
    }
  }, [speechUtterance])

  const handleAccept = (answerId: string) => {
    // TODO: 답변 채택 API 호출
    setAnswers(prev => prev.map(answer => 
      answer.id === answerId 
        ? { ...answer, status: "accepted" } 
        : answer
    ))
    setIsDialogOpen(false)
  }

  const handleReject = (answerId: string) => {
    // TODO: 답변 거절 API 호출
    setAnswers(prev => prev.map(answer => 
      answer.id === answerId 
        ? { ...answer, status: "rejected" } 
        : answer
    ))
    setIsDialogOpen(false)
  }

  const handleTextToSpeech = (text: string, id: string) => {
    if (playingId === id) {
      window.speechSynthesis.cancel()
      setPlayingId(null)
      setSpeechUtterance(null)
      return
    }

    // 다른 음성이 재생 중이면 중지
    if (playingId) {
      window.speechSynthesis.cancel()
    }

    const utterance = new SpeechSynthesisUtterance(text)
    
    // 한국어 음성으로 설정
    utterance.lang = 'ko-KR'
    
    // 음성 속성 설정
    utterance.rate = 0.9 // 속도 (0.1 ~ 10)
    utterance.pitch = 1 // 음높이 (0 ~ 2)
    utterance.volume = 1 // 볼륨 (0 ~ 1)

    // 음성 재생 완료 시 상태 초기화
    utterance.onend = () => {
      setPlayingId(null)
      setSpeechUtterance(null)
    }

    // 음성 재생 에러 시 상태 초기화
    utterance.onerror = () => {
      setPlayingId(null)
      setSpeechUtterance(null)
    }

    setSpeechUtterance(utterance)
    window.speechSynthesis.speak(utterance)
    setPlayingId(id)
  }

  return (
    <div className="space-y-4">
      {answers.map((answer) => (
        <Card key={answer.id} className="w-full senior-card">
          <CardHeader>
            <CardTitle className="text-lg text-[#222222]">
              {answer.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#B0B8C1] mb-2">
              {format(answer.date, "yyyy년 MM월 dd일", { locale: ko })}
            </p>
            <p className="text-[#222222]">
              {answer.answer.length > 100 
                ? `${answer.answer.slice(0, 100)}...` 
                : answer.answer}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="rounded-full border-neutral-200 hover:bg-neutral-100 text-[#222222]"
                onClick={() => {
                  setSelectedAnswer(answer)
                  setIsDialogOpen(true)
                }}
              >
                자세히 보기
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-full ${playingId === answer.id ? 'bg-neutral-100' : ''} text-[#00C73C] hover:text-[#00912C]`}
                onClick={() => handleTextToSpeech(answer.answer, answer.id)}
              >
                {playingId === answer.id ? <Square className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex gap-2">
              {answer.status === "pending" && (
                <>
                  <Button 
                    variant="default" 
                    size="sm"
                    className="rounded-full bg-[#00C73C] hover:bg-[#00912C] text-white"
                    onClick={() => handleAccept(answer.id)}
                  >
                    채택하기
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    className="rounded-full"
                    onClick={() => handleReject(answer.id)}
                  >
                    불만족
                  </Button>
                </>
              )}
              {answer.status === "accepted" && (
                <span className="text-[#00C73C] text-sm font-medium">채택완료</span>
              )}
              {answer.status === "rejected" && (
                <span className="text-destructive text-sm font-medium">불만족</span>
              )}
            </div>
          </CardFooter>
        </Card>
      ))}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedAnswer && (
          <DialogContent className="max-w-2xl senior-card">
            <DialogHeader>
              <DialogTitle className="text-[#222222]">{selectedAnswer.question}</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <p className="text-sm text-[#B0B8C1] mb-2">
                {format(selectedAnswer.date, "yyyy년 MM월 dd일", { locale: ko })}
              </p>
              <p className="text-[#222222] whitespace-pre-wrap">
                {selectedAnswer.answer}
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="ghost"
                className={`rounded-full ${playingId === selectedAnswer.id ? 'bg-neutral-100' : ''} text-[#00C73C] hover:text-[#00912C]`}
                onClick={() => handleTextToSpeech(selectedAnswer.answer, selectedAnswer.id)}
              >
                {playingId === selectedAnswer.id ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    <span>정지하기</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4 mr-2" />
                    <span>읽어주기</span>
                  </>
                )}
              </Button>
              {selectedAnswer.status === "pending" && (
                <>
                  <Button 
                    variant="default"
                    className="rounded-full bg-[#00C73C] hover:bg-[#00912C] text-white"
                    onClick={() => handleAccept(selectedAnswer.id)}
                  >
                    채택하기
                  </Button>
                  <Button 
                    variant="destructive"
                    className="rounded-full"
                    onClick={() => handleReject(selectedAnswer.id)}
                  >
                    불만족
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
} 