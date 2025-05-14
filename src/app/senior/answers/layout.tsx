import { Metadata } from "next";

export const metadata: Metadata = {
  title: "답변 확인 | GenBridge",
  description: "질문에 대한 답변을 확인하고 채택하실 수 있습니다.",
};

export default function AnswersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 