// Service: Orders Management (Public, Group Admin, and Master Admin)
// Project: B-Zooginer Pre-Order Platform
// Rules:
// - Public orders use submit_public_order RPC
// - Admin manual orders use submit_admin_order RPC (atomic stock validation & role checking)
// - Cancelling an order automatically releases reserved stock via database trigger

import { supabase } from '@/lib/supabase';
import type {
  PaymentMethodType,
  OrderStatusType,
  PaymentStatusType,
  OrderSourceType,
  OrderRow,
  OrderItemRow,
  GroupRow,
  Json,
} from '@/types/database.types';

export interface OrderItemInput {
  product_id: string;
  variant_id: string | null;
  quantity: number;
}

export interface PublicOrderPayload {
  group_id: string;
  buyer_name: string;
  buyer_class: string;
  whatsapp?: string;
  payment_method: PaymentMethodType;
  notes?: string;
  items: OrderItemInput[];
}

export interface AdminOrderPayload {
  group_id: string;
  buyer_name: string;
  buyer_class: string;
  whatsapp?: string;
  payment_method: PaymentMethodType;
  payment_status: PaymentStatusType;
  notes?: string;
  items: OrderItemInput[];
}

export interface OrderSubmissionResult {
  order_id?: string;
  order_code: string;
  access_token: string;
  total: number;
}

export interface OrderConfirmationItem {
  product_name: string;
  variant_title: string | null;
  attributes: Record<string, string>;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderConfirmationData {
  order_code: string;
  buyer_name: string;
  buyer_class: string;
  whatsapp: string | null;
  group_name: string;
  order_status: OrderStatusType;
  payment_status: PaymentStatusType;
  payment_method: PaymentMethodType;
  total: number;
  order_date: string;
  items: OrderConfirmationItem[];
}

export interface OrderWithFullDetails extends OrderRow {
  group?: GroupRow | null;
  items: OrderItemRow[];
}

interface RawSubmitPublicOrderResult {
  order_code: string;
  access_token: string;
  total: number;
}

interface RawSubmitAdminOrderResult {
  order_id: string;
  order_code: string;
  access_token: string;
  total: number;
}

interface RawOrderConfirmationResult {
  order_code: string;
  buyer_name: string;
  buyer_class: string;
  whatsapp: string | null;
  group_name: string;
  order_status: OrderStatusType;
  payment_status: PaymentStatusType;
  payment_method: PaymentMethodType;
  total: number;
  order_date: string;
  items: Json;
}

/**
 * Submit public order through approved RPC function with atomic stock deduction
 */
export async function submitPublicOrder(
  payload: PublicOrderPayload
): Promise<OrderSubmissionResult> {
  const rpcCall = supabase.rpc as any;
  const { data, error } = (await rpcCall('submit_public_order', {
    p_group_id: payload.group_id,
    p_buyer_name: payload.buyer_name.trim(),
    p_buyer_class: payload.buyer_class.trim(),
    p_whatsapp: payload.whatsapp ? payload.whatsapp.trim() : null,
    p_payment_method: payload.payment_method,
    p_notes: payload.notes ? payload.notes.trim() : null,
    p_items: payload.items,
  })) as { data: RawSubmitPublicOrderResult[] | null; error: Error | null };

  if (error) {
    throw new Error(`Gagal mengirim pesanan: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error('Pesanan gagal diproses oleh server.');
  }

  return {
    order_code: data[0].order_code,
    access_token: data[0].access_token,
    total: Number(data[0].total),
  };
}

/**
 * Submit manual admin order through transaction-safe RPC function (Roadshow Mode)
 * Enforces atomic stock check and preserves historical item snapshots
 */
export async function submitAdminOrder(
  payload: AdminOrderPayload
): Promise<OrderSubmissionResult> {
  const rpcCall = supabase.rpc as any;
  const { data, error } = (await rpcCall('submit_admin_order', {
    p_group_id: payload.group_id,
    p_buyer_name: payload.buyer_name.trim(),
    p_buyer_class: payload.buyer_class.trim(),
    p_whatsapp: payload.whatsapp ? payload.whatsapp.trim() : null,
    p_payment_method: payload.payment_method,
    p_payment_status: payload.payment_status || 'unpaid',
    p_notes: payload.notes ? payload.notes.trim() : null,
    p_items: payload.items,
  })) as { data: RawSubmitAdminOrderResult[] | null; error: Error | null };

  if (error) {
    throw new Error(`Gagal membuat pesanan manual: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error('Pesanan gagal diproses oleh server.');
  }

  return {
    order_id: data[0].order_id,
    order_code: data[0].order_code,
    access_token: data[0].access_token,
    total: Number(data[0].total),
  };
}

/**
 * Retrieve verified order confirmation using order code and secure access token
 */
export async function getOrderConfirmation(
  orderCode: string,
  accessToken: string
): Promise<OrderConfirmationData | null> {
  if (!orderCode || !accessToken) {
    return null;
  }

  const rpcCall = supabase.rpc as any;
  const { data, error } = (await rpcCall('get_order_confirmation', {
    p_order_code: orderCode.trim().toUpperCase(),
    p_access_token: accessToken.trim(),
  })) as { data: RawOrderConfirmationResult[] | null; error: Error | null };

  if (error) {
    throw new Error(`Gagal memuat konfirmasi pesanan: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return null;
  }

  const row = data[0];
  let parsedItems: OrderConfirmationItem[] = [];

  if (Array.isArray(row.items)) {
    parsedItems = row.items.map((item: any) => ({
      product_name: String(item.product_name_snapshot || item.product_name || 'Produk'),
      variant_title: item.variant_snapshot || item.variant_title || null,
      attributes: (item.variant_attributes_snapshot || item.attributes || {}) as Record<
        string,
        string
      >,
      unit_price: Number(item.unit_price_snapshot || item.unit_price || 0),
      quantity: Number(item.quantity || 1),
      subtotal: Number(item.subtotal || 0),
    }));
  }

  return {
    order_code: row.order_code,
    buyer_name: row.buyer_name,
    buyer_class: row.buyer_class,
    whatsapp: row.whatsapp,
    group_name: row.group_name,
    order_status: row.order_status,
    payment_status: row.payment_status,
    payment_method: row.payment_method,
    total: Number(row.total),
    order_date: row.order_date,
    items: parsedItems,
  };
}

/**
 * Fetch detailed order with items and group for admin view
 */
export async function getOrderDetailsWithItems(
  orderId: string
): Promise<OrderWithFullDetails | null> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      group:groups (*),
      items:order_items (*)
    `)
    .eq('id', orderId)
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal memuat detail pesanan: ${error.message}`);
  }

  return (data as unknown as OrderWithFullDetails) || null;
}

/**
 * Cancel an order (atomically triggers stock restoration via DB trigger)
 */
export async function cancelOrder(orderId: string): Promise<void> {
  const { error } = await (supabase.from('orders') as any)
    .update({ order_status: 'cancelled' })
    .eq('id', orderId);

  if (error) {
    throw new Error(`Gagal membatalkan pesanan: ${error.message}`);
  }
}

/**
 * Update order payment status and record audit log into activity_logs
 * Records: Who changed status (actor_id), when (timestamp), previous status, new status
 */
export async function updateOrderPayment(
  orderId: string,
  paymentStatus: PaymentStatusType
): Promise<void> {
  // 1. Fetch current order to obtain previous status and details
  const { data: currentOrder } = await supabase
    .from('orders')
    .select('id, order_code, payment_status, total, group_id')
    .eq('id', orderId)
    .maybeSingle();

  const orderRecord = currentOrder as {
    id: string;
    order_code: string;
    payment_status: PaymentStatusType;
    total: number;
    group_id: string;
  } | null;

  const previousStatus = orderRecord?.payment_status || 'unpaid';

  // 2. Update payment status
  const { error } = await (supabase.from('orders') as any)
    .update({ payment_status: paymentStatus })
    .eq('id', orderId);

  if (error) {
    throw new Error(`Gagal memperbarui status pembayaran: ${error.message}`);
  }

  // 3. Record tamper-proof audit log in activity_logs
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await (supabase.from('activity_logs') as any).insert({
        actor_id: user.id,
        action: 'payment.status_updated',
        entity_type: 'order',
        entity_id: orderId,
        metadata: {
          order_code: orderRecord?.order_code || null,
          previous_status: previousStatus,
          new_status: paymentStatus,
          total: orderRecord?.total || 0,
          group_id: orderRecord?.group_id || null,
          verified_at: new Date().toISOString(),
        },
      });
    }
  } catch (logErr) {
    console.error('Peringatan: Gagal mencatat audit log pembayaran:', logErr);
  }
}

/**
 * Update order lifecycle status (new -> confirmed -> completed)
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatusType
): Promise<void> {
  const { error } = await (supabase.from('orders') as any)
    .update({ order_status: status })
    .eq('id', orderId);

  if (error) {
    throw new Error(`Gagal memperbarui status pesanan: ${error.message}`);
  }
}
