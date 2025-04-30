'use client'

import { useState } from 'react'
import { useReactMediaRecorder } from 'react-media-recorder'
import { Button } from '@/components/ui/button'
import { Mic, Square } from 'lucide-react'

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void
}

export const VoiceRecorder = ({ onTranscriptionComplete }: VoiceRecorderProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const { status, startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({
    audio: true,
    blobPropertyBag: { type: 'audio/webm' }
  })

  const handleStopRecording = async () => {
    stopRecording()
    if (mediaBlobUrl) {
      setIsLoading(true)
      try {
        const response = await fetch(mediaBlobUrl)
        const audioBlob = await response.blob()
        
        // Blob을 File로 변환
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
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="flex items-center gap-2">
      {status === 'recording' ? (
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