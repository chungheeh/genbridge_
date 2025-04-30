export interface PointHistory {
  id: number;
  user_id: string;
  amount: number;
  description: string;
  created_at: string;
  type: 'EARN' | 'USE';
}

export interface PointSummary {
  total_points: number;
  total_earned: number;
  total_used: number;
} 