'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Question, submitAnswer } from '../api'
import { Loader2, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

const formSchema = z.object({
  content: z.string().min(10, '답변은 최소 10자 이상 작성해주세요.'),
  videoFile: z.instanceof(File).optional(),
})

interface AnswerFormProps {
  question: Question
  onClose: () => void
}

export function AnswerForm({ question, onClose }: AnswerFormProps) {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
    },
  })

  const { mutate: submitAnswerMutation, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const formData = new FormData()
      formData.append('content', values.content)
      if (values.videoFile) {
        formData.append('video', values.videoFile)
      }
      return submitAnswer(question.id, formData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingQuestions'] })
      onClose()
    },
    onError: (error) => {
      setError('답변 제출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    },
  })

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      setError('영상 파일은 100MB를 초과할 수 없습니다.')
      return
    }

    const videoUrl = URL.createObjectURL(file)
    setVideoPreview(videoUrl)
    form.setValue('videoFile', file)
  }

  const removeVideo = () => {
    form.setValue('videoFile', undefined)
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview)
      setVideoPreview(null)
    }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null)
    submitAnswerMutation(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-youth">답변 내용</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="시니어분께서 이해하기 쉽도록 자세하고 친절하게 답변해주세요..."
                  className="min-h-[200px] resize-none focus-visible:ring-youth"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel className="text-youth">영상 답변 (선택)</FormLabel>
          {!videoPreview ? (
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="video-upload"
                className={cn(
                  "flex flex-col items-center justify-center w-full h-32",
                  "border-2 border-dashed rounded-lg",
                  "cursor-pointer bg-youth-bg hover:bg-youth-bg/80",
                  "transition-colors"
                )}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-youth" />
                  <p className="text-sm text-youth">
                    영상을 드래그하거나 클릭하여 업로드
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    MP4, MOV (최대 100MB)
                  </p>
                </div>
                <input
                  id="video-upload"
                  type="file"
                  accept="video/mp4,video/quicktime"
                  className="hidden"
                  onChange={handleVideoChange}
                />
              </label>
            </div>
          ) : (
            <div className="relative rounded-lg overflow-hidden">
              <video
                src={videoPreview}
                className="w-full h-48 object-cover"
                controls
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={removeVideo}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="hover:bg-youth-bg hover:text-youth"
          >
            취소
          </Button>
          <Button 
            type="submit" 
            disabled={isPending}
            className="bg-youth hover:bg-youth-hover"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                제출 중...
              </>
            ) : (
              '답변 제출'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
} 