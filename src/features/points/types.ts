export interface PointHistory {
  id: string;
  user_id: string;
  amount: number;
  type: 'EARN' | 'USE';
  description: string;
  created_at: string;
}

export interface PointSummary {
  total_points: number;
} 