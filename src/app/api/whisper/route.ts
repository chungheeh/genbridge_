import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as Blob
    
    if (!file) {
      return NextResponse.json(
        { error: '오디오 파일이 필요합니다.' },
        { status: 400 }
      )
    }

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'ko'
    })

    return NextResponse.json({ text: transcription.text })
  } catch (error) {
    console.error('Whisper API 오류:', error)
    return NextResponse.json(
      { error: '음성 인식 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 