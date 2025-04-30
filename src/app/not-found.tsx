'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6 text-center">
        <div className="mb-6 flex justify-center">
          <Image
            src="https://picsum.photos/seed/404/200/200"
            alt="404 이미지"
            width={200}
            height={200}
            className="rounded-lg"
          />
        </div>
        <h1 className="mb-2 text-4xl font-bold text-foreground">404</h1>
        <h2 className="mb-4 text-xl font-semibold text-foreground">페이지를 찾을 수 없습니다</h2>
        <p className="mb-6 text-muted-foreground">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild>
            <Link href="/">
              홈으로 돌아가기
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
} 