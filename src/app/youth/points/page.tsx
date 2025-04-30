"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPointHistory, getPointSummary } from "@/features/points/api";
import { PointHistory, PointSummary } from "@/features/points/types";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { AlertCircle, Loader2, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function PointsPage() {
  const { user, loading: authLoading } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { 
    data: summary, 
    isLoading: isSummaryLoading, 
    error: summaryError,
    refetch: refetchSummary 
  } = useQuery<PointSummary>({
    queryKey: ["pointSummary", user?.id],
    queryFn: () => getPointSummary(user?.id as string),
    enabled: !!user?.id,
    retry: 2,
  });

  const { 
    data: history, 
    isLoading: isHistoryLoading, 
    error: historyError,
    refetch: refetchHistory 
  } = useQuery<PointHistory[]>({
    queryKey: ["pointHistory", user?.id],
    queryFn: () => getPointHistory(user?.id as string),
    enabled: !!user?.id,
    retry: 2,
  });

  if (authLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center space-y-2">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
          <p className="text-lg font-medium">로그인이 필요합니다</p>
        </div>
      </div>
    );
  }

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([
        refetchSummary(),
        refetchHistory()
      ]);
      toast.success('포인트 내역이 갱신되었습니다.');
    } catch (error) {
      toast.error('포인트 내역 갱신에 실패했습니다.');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (summaryError || historyError) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
          <p className="text-lg font-medium">데이터를 불러오는데 실패했습니다</p>
          <p className="text-sm text-neutral-400">
            {summaryError?.message || historyError?.message || "잠시 후 다시 시도해주세요"}
          </p>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            className="gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            새로고침
          </Button>
        </div>
      </div>
    );
  }

  if (isSummaryLoading || isHistoryLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">
            포인트 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-primary">
              {summary?.total_points.toLocaleString() ?? 0}P
            </div>
            <div className="text-sm text-neutral-400">
              총 적립: {summary?.total_earned.toLocaleString() ?? 0}P / 총 사용:{" "}
              {summary?.total_used.toLocaleString() ?? 0}P
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold">포인트 내역</CardTitle>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 w-8"
          >
            <RefreshCcw className={cn("h-4 w-4", {
              "animate-spin": isRefreshing
            })} />
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>날짜</TableHead>
                  <TableHead>내용</TableHead>
                  <TableHead className="text-right">포인트</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history && history.length > 0 ? (
                  history.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {format(new Date(item.created_at), "yyyy.MM.dd", {
                          locale: ko,
                        })}
                      </TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          item.type === "EARN"
                            ? "text-primary"
                            : "text-destructive"
                        }`}
                      >
                        {item.type === "EARN" ? "+" : "-"}
                        {item.amount.toLocaleString()}P
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      <p className="text-neutral-400">포인트 내역이 없습니다</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
} 