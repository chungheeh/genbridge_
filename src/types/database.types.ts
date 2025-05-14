export interface Question {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  status: 'pending' | 'answered' | 'completed';
  is_ai_question: boolean;
  answered_at?: string;
  answered_by?: string;
  satisfaction?: 'neutral' | 'good' | 'excellent';
}

export interface Answer {
  id: string;
  question_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_selected: boolean;
  question?: {
    id: string;
    title: string;
    content: string;
    status: string;
  };
} 