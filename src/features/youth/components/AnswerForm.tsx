'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Question, submitAnswer } from '../api'

const formSchema = z.object({
  content: z.string().min(10, '답변은 최소 10자 이상이어야 합니다.'),
})

type FormValues = z.infer<typeof formSchema>

interface AnswerFormProps {
  question: Question
  onClose: () => void
}

export function AnswerForm({ question, onClose }: AnswerFormProps) {
  const queryClient = useQueryClient()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
    },
  })

  const { mutate: submitAnswerMutation, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
      await submitAnswer(question.id, values.content)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingQuestions'] })
      toast.success('답변이 성공적으로 등록되었습니다.')
      onClose()
    },
    onError: (error) => {
      console.error('Error submitting answer:', error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('답변 등록에 실패했습니다. 다시 시도해주세요.')
      }
    },
  })

  const onSubmit = (values: FormValues) => {
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