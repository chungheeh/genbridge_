'use client';

import { Skeleton } from "@/components/ui/skeleton";

export function LoadingAnswers() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((index) => (
        <div key={index} className="border rounded-lg p-6 space-y-4">
          {/* 질문 스켈레톤 */}
          <div>
            <Skeleton className="h-7 w-3/4 mb-2" />
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-4 w-1/4" />
          </div>

          {/* 답변 목록 스켈레톤 */}
          <div className="mt-4 space-y-4">
            <Skeleton className="h-6 w-24" />
            <div className="space-y-4">
              {[1, 2].map((answerIndex) => (
                <div
                  key={answerIndex}
                  className="bg-gray-50 rounded-lg p-4 space-y-2"
                >
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 