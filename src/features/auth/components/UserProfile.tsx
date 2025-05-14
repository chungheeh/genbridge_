'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getUserProfile } from '../api';
import { Profile } from '../types';

export function UserProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const profileData = await getUserProfile(user.id);
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) {
    return <div>로딩중...</div>;
  }

  return (
    <div>
      <h2 className="text-lg font-medium">
        {profile?.name || '사용자'} 님, 환영합니다!
      </h2>
    </div>
  );
} 