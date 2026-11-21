// Service: Products & Variants Management
// Project: B-Zooginer Pre-Order Platform
// Rule: Pure async functions, no React hooks, no JSX

import { supabase } from '@/lib/supabase';
import type { ProductRow, ProductVariantRow, GroupRow } from '@/types/database.types';

export interface ProductDetailWithRelations extends ProductRow {
  group: GroupRow;
  variants: ProductVariantRow[];
}

/**
 * Fetch active products for public storefront, optionally filtered by group_id
 */
export async function getActiveProducts(groupId?: string): Promise<ProductRow[]> {
  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (groupId) {
    query = query.eq('group_id', groupId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Gagal memuat daftar produk: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch product detail by ID or slug with group and active variants
 */
export async function getProductByIdOrSlug(identifier: string): Promise<ProductDetailWithRelations | null> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

  let query = supabase
    .from('products')
    .select(`
      *,
      group:groups (*),
      variants:product_variants (*)
    `)
    .eq('is_active', true);

  if (isUuid) {
    query = query.eq('id', identifier);
  } else {
    query = query.eq('slug', identifier);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(`Gagal memuat detail produk: ${error.message}`);
  }

  if (!data) return null;

  const productData = data as unknown as ProductDetailWithRelations;

  // Filter variants to only active variants
  if (productData.variants) {
    productData.variants = productData.variants
      .filter(v => v.is_active)
      .sort((a, b) => a.sort_order - b.sort_order);
  } else {
    productData.variants = [];
  }

  return productData;
}
