'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, Square } from 'lucide-react'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void
}

const VoiceRecorder = ({ onTranscriptionComplete }: VoiceRecorderProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: Blob[] = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        setAudioChunks(chunks)
      }

      setMediaRecorder(recorder)
      recorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Failed to start recording:', error)
      toast.error('마이크 접근에 실패했습니다.')
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
      mediaRecorder.stream.getTracks().forEach(track => track.stop())
    }
  }, [mediaRecorder, isRecording])

  const handleStopRecording = async () => {
    stopRecording()
    if (audioUrl && audioChunks.length > 0) {
      setIsLoading(true)
      try {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        const audioFile = new File([audioBlob], 'audio.webm', { type: 'audio/webm' })
        
        const formData = new FormData()
        formData.append('file', audioFile)
        formData.append('model', 'whisper-1')
        
        const whisperResponse = await fetch('/api/whisper', {
          method: 'POST',
          body: formData,
        })
        
        const data = await whisperResponse.json()
        if (data.error) {
          throw new Error(data.error)
        }
        onTranscriptionComplete(data.text)
      } catch (error) {
        console.error('음성 인식 중 오류가 발생했습니다:', error)
        toast.error('음성 인식 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
        setAudioUrl(null)
        setAudioChunks([])
      }
    }
  }

  useEffect(() => {
    return () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop()
        mediaRecorder.stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [mediaRecorder])

  return (
    <div className="flex items-center gap-2">
      {isRecording ? (
        <Button
          variant="destructive"
          size="icon"
          onClick={handleStopRecording}
          disabled={isLoading}
        >
          <Square className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          variant="outline"
          size="icon"
          onClick={startRecording}
          disabled={isLoading}
        >
          <Mic className="h-4 w-4" />
        </Button>
      )}
      {isLoading && <span className="text-sm text-muted-foreground">음성을 처리중입니다...</span>}
    </div>
  )
}

// NoSSR로 감싸서 클라이언트 사이드에서만 렌더링되도록 합니다
export default dynamic(() => Promise.resolve(VoiceRecorder), {
  ssr: false
}) 