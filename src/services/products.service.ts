// Service: Products & Variants Management
// Project: B-Zooginer Pre-Order Platform
// Rule: Pure async functions, no React hooks, no JSX

import { supabase } from '@/lib/supabase';
import type {
  ProductRow,
  ProductVariantRow,
  GroupRow,
  VariantDimension,
} from '@/types/database.types';

export interface ProductDetailWithRelations extends ProductRow {
  group: GroupRow;
  variants: ProductVariantRow[];
}

export interface VariantInput {
  id?: string;
  title: string;
  attributes: Record<string, string>;
  sku?: string | null;
  price_adjustment: number;
  stock: number | null;
  is_active: boolean;
  sort_order?: number;
}

export interface ProductFormData {
  group_id: string;
  name: string;
  slug?: string;
  description?: string | null;
  image_url?: string | null;
  base_price: number;
  variant_dimensions: VariantDimension[];
  has_variants: boolean;
  track_stock: boolean;
  max_po_qty?: number | null;
  is_active: boolean;
  is_featured: boolean;
  po_open_at?: string | null;
  po_close_at?: string | null;
  variants: VariantInput[];
}

/**
 * Helper to generate URL slug from product name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
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
export async function getProductByIdOrSlug(
  identifier: string
): Promise<ProductDetailWithRelations | null> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    identifier
  );

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

  if (productData.variants) {
    productData.variants = productData.variants
      .filter((v) => v.is_active)
      .sort((a, b) => a.sort_order - b.sort_order);
  } else {
    productData.variants = [];
  }

  return productData;
}

/**
 * Fetch complete product with all variants (including inactive ones) for Admin editor
 */
export async function getProductForAdmin(
  productId: string
): Promise<{ product: ProductRow; variants: ProductVariantRow[] } | null> {
  const { data: product, error: prodError } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .maybeSingle();

  if (prodError || !product) {
    return null;
  }

  const { data: variants, error: varError } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId)
    .order('sort_order', { ascending: true });

  if (varError) {
    throw new Error(`Gagal memuat varian produk: ${varError.message}`);
  }

  return {
    product,
    variants: variants || [],
  };
}

/**
 * Create a new product along with variants
 */
export async function createProductWithVariants(
  input: ProductFormData
): Promise<ProductRow> {
  const slug = input.slug?.trim() || `${generateSlug(input.name)}-${Date.now().toString(36)}`;

  // 1. Insert product
  const { data: product, error: prodError } = await (supabase.from('products') as any)
    .insert({
      group_id: input.group_id,
      name: input.name.trim(),
      slug,
      description: input.description?.trim() || null,
      image_url: input.image_url || null,
      base_price: input.base_price,
      variant_dimensions: input.variant_dimensions || [],
      has_variants: input.has_variants,
      track_stock: input.track_stock,
      max_po_qty: input.max_po_qty ?? null,
      is_active: input.is_active ?? true,
      is_featured: input.is_featured ?? false,
      po_open_at: input.po_open_at || null,
      po_close_at: input.po_close_at || null,
    })
    .select()
    .single();

  if (prodError || !product) {
    throw new Error(`Gagal membuat produk: ${prodError?.message || 'Terjadi kesalahan'}`);
  }

  // 2. Insert variants if product has variants
  if (input.has_variants && input.variants && input.variants.length > 0) {
    const variantsToInsert = input.variants.map((v, index) => ({
      product_id: product.id,
      title: v.title,
      attributes: v.attributes || {},
      sku: v.sku?.trim() || null,
      price_adjustment: v.price_adjustment || 0,
      stock: input.track_stock ? v.stock ?? 0 : null,
      is_active: v.is_active ?? true,
      sort_order: v.sort_order ?? index,
    }));

    const { error: varError } = await (supabase.from('product_variants') as any)
      .insert(variantsToInsert);

    if (varError) {
      throw new Error(`Produk dibuat namun gagal menyimpan varian: ${varError.message}`);
    }
  }

  return product;
}

/**
 * Update an existing product and synchronize its variants
 */
export async function updateProductWithVariants(
  productId: string,
  input: Partial<ProductFormData>
): Promise<void> {
  // 1. Update product base data
  const updatePayload: Record<string, any> = {};
  if (input.name !== undefined) updatePayload.name = input.name.trim();
  if (input.slug !== undefined) updatePayload.slug = input.slug.trim();
  if (input.description !== undefined) updatePayload.description = input.description?.trim() || null;
  if (input.image_url !== undefined) updatePayload.image_url = input.image_url;
  if (input.base_price !== undefined) updatePayload.base_price = input.base_price;
  if (input.variant_dimensions !== undefined) updatePayload.variant_dimensions = input.variant_dimensions;
  if (input.has_variants !== undefined) updatePayload.has_variants = input.has_variants;
  if (input.track_stock !== undefined) updatePayload.track_stock = input.track_stock;
  if (input.max_po_qty !== undefined) updatePayload.max_po_qty = input.max_po_qty;
  if (input.is_active !== undefined) updatePayload.is_active = input.is_active;
  if (input.is_featured !== undefined) updatePayload.is_featured = input.is_featured;
  if (input.po_open_at !== undefined) updatePayload.po_open_at = input.po_open_at || null;
  if (input.po_close_at !== undefined) updatePayload.po_close_at = input.po_close_at || null;

  if (Object.keys(updatePayload).length > 0) {
    const { error: prodError } = await (supabase.from('products') as any)
      .update(updatePayload)
      .eq('id', productId);

    if (prodError) {
      throw new Error(`Gagal memperbarui data produk: ${prodError.message}`);
    }
  }

  // 2. Synchronize variants if variants are supplied
  if (input.variants !== undefined) {
    if (input.has_variants && input.variants.length > 0) {
      // Upsert current variants
      for (let i = 0; i < input.variants.length; i++) {
        const v = input.variants[i];
        if (v.id) {
          // Update existing variant
          await (supabase.from('product_variants') as any)
            .update({
              title: v.title,
              attributes: v.attributes || {},
              sku: v.sku?.trim() || null,
              price_adjustment: v.price_adjustment || 0,
              stock: input.track_stock ? v.stock ?? 0 : null,
              is_active: v.is_active ?? true,
              sort_order: v.sort_order ?? i,
            })
            .eq('id', v.id);
        } else {
          // Insert new variant
          await (supabase.from('product_variants') as any).insert({
            product_id: productId,
            title: v.title,
            attributes: v.attributes || {},
            sku: v.sku?.trim() || null,
            price_adjustment: v.price_adjustment || 0,
            stock: input.track_stock ? v.stock ?? 0 : null,
            is_active: v.is_active ?? true,
            sort_order: v.sort_order ?? i,
          });
        }
      }
    }
  }
}

/**
 * Soft-delete product (set is_active = false)
 */
export async function deleteProduct(productId: string): Promise<void> {
  const { error } = await (supabase.from('products') as any)
    .update({ is_active: false })
    .eq('id', productId);

  if (error) {
    throw new Error(`Gagal menonaktifkan produk: ${error.message}`);
  }
}
