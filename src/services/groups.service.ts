// Service: Groups Management
// Project: B-Zooginer Pre-Order Platform
// Rule: Pure async functions, no React hooks, no JSX

import { supabase } from '@/lib/supabase';
import type { GroupRow, ProductRow, PoStatusType } from '@/types/database.types';

export interface GroupWithProducts extends GroupRow {
  products: ProductRow[];
}

export interface UpdateGroupProfileInput {
  name?: string;
  description?: string | null;
  logo_url?: string | null;
  poster_url?: string | null;
  po_status?: PoStatusType;
}

/**
 * Fetch all published groups for public storefront
 */
export async function getPublishedGroups(): Promise<GroupRow[]> {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Gagal memuat daftar stan kelompok: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch a single published group by ID or slug along with its active products
 */
export async function getGroupBySlugOrId(identifier: string): Promise<GroupWithProducts | null> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

  let query = supabase
    .from('groups')
    .select(`
      *,
      products (*)
    `)
    .eq('is_published', true);

  if (isUuid) {
    query = query.eq('id', identifier);
  } else {
    query = query.eq('slug', identifier);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(`Gagal memuat detail stan: ${error.message}`);
  }

  if (!data) return null;

  // Filter products to only active products for public display
  const groupData = data as unknown as GroupWithProducts;
  if (groupData.products) {
    groupData.products = groupData.products.filter((p) => p.is_active);
  } else {
    groupData.products = [];
  }

  return groupData;
}

/**
 * Update group profile details (description, poster, logo, po_status)
 */
export async function updateGroupProfile(
  groupId: string,
  input: UpdateGroupProfileInput
): Promise<void> {
  const payload: Record<string, any> = {};
  if (input.name !== undefined) payload.name = input.name.trim();
  if (input.description !== undefined) payload.description = input.description?.trim() || null;
  if (input.logo_url !== undefined) payload.logo_url = input.logo_url;
  if (input.poster_url !== undefined) payload.poster_url = input.poster_url;
  if (input.po_status !== undefined) payload.po_status = input.po_status;

  const { error } = await (supabase.from('groups') as any)
    .update(payload)
    .eq('id', groupId);

  if (error) {
    throw new Error(`Gagal memperbarui profil stan: ${error.message}`);
  }
}
