export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          created_at: string
          updated_at: string
          role: 'senior' | 'junior'
          name: string | null
          birth_year: number | null
          gender: 'male' | 'female' | 'other' | null
          phone_number: string | null
          address: string | null
          points: number
        }
        Insert: {
          id: string
          email?: string | null
          created_at?: string
          updated_at?: string
          role: 'senior' | 'junior'
          name?: string | null
          birth_year?: number | null
          gender?: 'male' | 'female' | 'other' | null
          phone_number?: string | null
          address?: string | null
          points?: number
        }
        Update: {
          id?: string
          email?: string | null
          created_at?: string
          updated_at?: string
          role?: 'senior' | 'junior'
          name?: string | null
          birth_year?: number | null
          gender?: 'male' | 'female' | 'other' | null
          phone_number?: string | null
          address?: string | null
          points?: number
        }
      }
      questions: {
        Row: {
          id: string
          title: string
          content: string
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      answers: {
        Row: {
          id: string
          content: string
          created_at: string
          updated_at: string
          user_id: string
          question_id: string
          questions: {
            id: string
            title: string
          }
        }
        Insert: {
          id?: string
          content: string
          created_at?: string
          updated_at?: string
          user_id: string
          question_id: string
        }
        Update: {
          id?: string
          content?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          question_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 