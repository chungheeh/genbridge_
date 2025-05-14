import { createBrowserClient } from "@/lib/supabase/client";
import { Database } from "@/lib/database.types";
import { PointHistory, PointSummary } from "./types";

const supabase = createBrowserClient();

export async function getPointHistory(userId: string): Promise<PointHistory[]> {
  const { data, error } = await supabase
    .from('point_history')
    .select('*')
    .eq('id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching point history:', error);
    return [];
  }

  return data || [];
}

export async function getPointSummary(userId: string): Promise<PointSummary | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('points')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching point summary:', error);
    return null;
  }

  return {
    total_points: data?.points || 0
  };
} 