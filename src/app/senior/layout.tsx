'use client';

import { PropsWithChildren } from 'react';

export default function SeniorLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#04c73c05] to-[#04c73c10]">
      {children}

      <style jsx global>{`
        .senior-card {
          @apply bg-white/90 backdrop-blur-sm border-senior-light/20 hover:border-senior-DEFAULT transition-all;
        }
        .senior-card:hover {
          @apply shadow-lg;
        }
        .senior-hover-bg:hover {
          @apply bg-[#04c73c20] transition-colors;
        }
        .senior-button {
          @apply bg-senior-DEFAULT hover:bg-senior-dark text-white transition-colors;
        }
        .senior-nav {
          @apply bg-gradient-to-b from-[#04c73c10] to-white/80 backdrop-blur-sm;
        }
      `}</style>
    </div>
  );
} 