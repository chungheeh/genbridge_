import { createBrowserClient } from '@/lib/supabase/client';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { Profile } from './types';
import { Database } from '@/lib/database.types';

export async function getUserProfile(userId: string): Promise<Profile | null> {
  if (!userId) {
    console.error('Error: userId is required');
    return null;
  }

  const supabase = createBrowserClient();
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        created_at,
        updated_at,
        role,
        name,
        birth_year,
        gender,
        phone_number,
        address
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error.message);
      return null;
    }

    if (!profile) {
      console.error('Profile not found');
      return null;
    }

    return profile as Profile;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
}

export async function getSession() {
  const supabase = createServerClient(cookies);
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error fetching session:', error.message);
    return null;
  }
  
  return session;
}

export async function getUser() {
  const supabase = createServerClient(cookies);
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error fetching user:', error.message);
    return null;
  }
  
  return user;
}

export async function signOut() {
  const supabase = createBrowserClient();
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error signing out:', error.message);
    throw error;
  }
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    console.error('Error signing in:', error.message);
    throw error;
  }
  
  return data;
}

export async function signUpWithEmail(email: string, password: string) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) {
    console.error('Error signing up:', error.message);
    throw error;
  }
  
  return data;
} 