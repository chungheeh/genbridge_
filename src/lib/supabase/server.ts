import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const createServerClient = (cookies: ReturnType<typeof cookies>) => {
  return createServerComponentClient({ cookies });
}; 