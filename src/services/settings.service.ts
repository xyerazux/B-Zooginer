// Service: Site Settings
// Project: B-Zooginer Pre-Order Platform
// Rule: Pure async functions, no React hooks, no JSX

import { supabase } from '@/lib/supabase';
import type { SiteSettingsRow } from '@/types/database.types';

/**
 * Fetch public site settings for banner, announcement, and event title
 */
export async function getPublicSiteSettings(): Promise<SiteSettingsRow | null> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();

  if (error) {
    console.warn('Gagal memuat pengaturan situs, menggunakan nilai default:', error.message);
    return null;
  }

  return data;
}
