import { createClient } from "@/lib/supabase/client";
import { PointHistory, PointSummary } from "./types";

const supabase = createClient();

export async function getPointHistory(userId: string): Promise<PointHistory[]> {
  if (!userId) {
    throw new Error("사용자 ID가 필요합니다.");
  }

  try {
    const { data, error } = await supabase
      .from("point_histories")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("포인트 내역 조회 오류:", error);
      throw new Error(`포인트 내역을 불러오는데 실패했습니다: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error("포인트 내역 조회 중 예외 발생:", error);
    throw new Error("포인트 내역을 불러오는데 실패했습니다.");
  }
}

export async function getPointSummary(userId: string): Promise<PointSummary> {
  if (!userId) {
    throw new Error("사용자 ID가 필요합니다.");
  }

  try {
    const { data, error } = await supabase
      .from("point_histories")
      .select("amount, type")
      .eq("user_id", userId);

    if (error) {
      console.error("포인트 요약 조회 오류:", error);
      throw new Error(`포인트 요약을 불러오는데 실패했습니다: ${error.message}`);
    }

    const summary = (data || []).reduce(
      (acc, curr) => {
        if (curr.type === "EARN") {
          acc.total_earned += curr.amount;
        } else {
          acc.total_used += curr.amount;
        }
        return acc;
      },
      { total_earned: 0, total_used: 0, total_points: 0 }
    );

    summary.total_points = summary.total_earned - summary.total_used;

    return summary;
  } catch (error) {
    console.error("포인트 요약 조회 중 예외 발생:", error);
    throw new Error("포인트 요약을 불러오는데 실패했습니다.");
  }
} 