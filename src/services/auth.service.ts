// Service: Authentication and Profile Access
// Project: B-Zooginer Pre-Order Platform
// Rule: Pure async functions, strict TypeScript, no React hooks

import { supabase } from '@/lib/supabase';
import type { ProfileRow, GroupRow } from '@/types/database.types';

export interface UserProfileWithGroup extends ProfileRow {
  group: GroupRow | null;
}

export interface SignInResult {
  userId: string;
  email: string;
  profile: UserProfileWithGroup | null;
}

/**
 * Sign in with email and password
 */
export async function signInWithPassword(email: string, password: string): Promise<SignInResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      throw new Error('Alamat email atau kata sandi tidak sesuai.');
    }
    throw new Error(`Gagal masuk: ${error.message}`);
  }

  if (!data.user) {
    throw new Error('Sesi pengguna tidak valid.');
  }

  const profile = await getUserProfile(data.user.id);

  return {
    userId: data.user.id,
    email: data.user.email || '',
    profile,
  };
}

/**
 * Sign out current session
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(`Gagal keluar dari sesi: ${error.message}`);
  }
}

/**
 * Get current session
 */
export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    return null;
  }
  return data.session;
}

/**
 * Get authenticated user's database profile (with assigned group if group_admin)
 */
export async function getUserProfile(userId: string): Promise<UserProfileWithGroup | null> {
  if (!userId) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      group:groups (*)
    `)
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user profile:', error.message);
    return null;
  }

  return (data as unknown as UserProfileWithGroup) || null;
}
