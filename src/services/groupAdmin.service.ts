// Service: Group Admin Operations (Group Isolated via RLS)
// Project: B-Zooginer Pre-Order Platform
// Rule: Group admins can strictly only access data matching their assigned group_id

import { supabase } from '@/lib/supabase';
import type {
  GroupRow,
  ProductRow,
  ProductVariantRow,
  OrderRow,
  OrderStatusType,
} from '@/types/database.types';

export interface GroupAdminStats {
  totalOrders: number;
  paidRevenue: number;
  unpaidOrdersCount: number;
  activeProductsCount: number;
}

export interface ProductWithVariants extends ProductRow {
  variants: ProductVariantRow[];
}

/**
 * Fetch performance statistics for specific group
 */
export async function getGroupAdminStats(groupId: string): Promise<GroupAdminStats> {
  if (!groupId) {
    return {
      totalOrders: 0,
      paidRevenue: 0,
      unpaidOrdersCount: 0,
      activeProductsCount: 0,
    };
  }

  // 1. Fetch group's orders
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('group_id', groupId);

  const groupOrders: OrderRow[] = orders || [];
  const totalOrders = groupOrders.length;
  let paidRevenue = 0;
  let unpaidOrdersCount = 0;

  groupOrders.forEach((o) => {
    if (o.payment_status === 'paid') {
      paidRevenue += Number(o.total || 0);
    } else {
      unpaidOrdersCount++;
    }
  });

  // 2. Fetch group's active products
  const { count: activeProductsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', groupId)
    .eq('is_active', true);

  return {
    totalOrders,
    paidRevenue,
    unpaidOrdersCount,
    activeProductsCount: activeProductsCount || 0,
  };
}

/**
 * Fetch group details
 */
export async function getMyGroup(groupId: string): Promise<GroupRow | null> {
  if (!groupId) return null;

  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal memuat data stan: ${error.message}`);
  }

  return data;
}

/**
 * Fetch products belonging to group
 */
export async function getGroupProducts(groupId: string): Promise<ProductWithVariants[]> {
  if (!groupId) return [];

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      variants:product_variants (*)
    `)
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Gagal memuat produk stan: ${error.message}`);
  }

  return (data as unknown as ProductWithVariants[]) || [];
}

/**
 * Toggle product active status
 */
export async function toggleProductActive(productId: string, isActive: boolean): Promise<void> {
  const { error } = await (supabase.from('products') as any)
    .update({ is_active: isActive })
    .eq('id', productId);

  if (error) {
    throw new Error(`Gagal mengubah status aktif produk: ${error.message}`);
  }
}

/**
 * Fetch orders belonging to group with optional filters
 */
export async function getGroupOrders(
  groupId: string,
  filters?: {
    orderStatus?: string;
    paymentStatus?: string;
    search?: string;
  }
): Promise<OrderRow[]> {
  if (!groupId) return [];

  let query = supabase
    .from('orders')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });

  if (filters?.orderStatus && filters.orderStatus !== 'all') {
    query = query.eq('order_status', filters.orderStatus as any);
  }

  if (filters?.paymentStatus && filters.paymentStatus !== 'all') {
    query = query.eq('payment_status', filters.paymentStatus as any);
  }

  if (filters?.search) {
    const s = `%${filters.search.trim()}%`;
    query = query.or(`buyer_name.ilike.${s},buyer_class.ilike.${s},order_code.ilike.${s}`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Gagal memuat pesanan stan: ${error.message}`);
  }

  return data || [];
}

/**
 * Update order lifecycle status (new -> confirmed -> completed / cancelled)
 */
export async function updateOrderStatus(
  orderId: string,
  orderStatus: OrderStatusType
): Promise<void> {
  const { error } = await (supabase.from('orders') as any)
    .update({ order_status: orderStatus })
    .eq('id', orderId);

  if (error) {
    throw new Error(`Gagal memperbarui status pesanan: ${error.message}`);
  }
}

/**
 * Confirm order payment as paid
 */
export async function confirmOrderPayment(orderId: string): Promise<void> {
  const { error } = await (supabase.from('orders') as any)
    .update({ payment_status: 'paid' })
    .eq('id', orderId);

  if (error) {
    throw new Error(`Gagal mengonfirmasi status pembayaran: ${error.message}`);
  }
}
