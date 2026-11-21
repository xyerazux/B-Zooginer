// Service: Public Order Submission and Confirmation
// Project: B-Zooginer Pre-Order Platform
// Rule: Direct anon INSERT into orders is FORBIDDEN. All public orders use submit_public_order RPC.

import { supabase } from '@/lib/supabase';
import type { PaymentMethodType, OrderStatusType, PaymentStatusType, Json } from '@/types/database.types';

export interface PublicOrderItemInput {
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
  items: PublicOrderItemInput[];
}

export interface OrderSubmissionResult {
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

interface RawSubmitPublicOrderResult {
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
 * Submit public order through approved RPC function with atomic stock deduction and server-side validation
 */
export async function submitPublicOrder(payload: PublicOrderPayload): Promise<OrderSubmissionResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
 * Retrieve verified order confirmation using order code and secure 256-bit access token
 */
export async function getOrderConfirmation(orderCode: string, accessToken: string): Promise<OrderConfirmationData | null> {
  if (!orderCode || !accessToken) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parsedItems = row.items.map((item: any) => ({
      product_name: String(item.product_name_snapshot || item.product_name || 'Produk'),
      variant_title: item.variant_snapshot || item.variant_title || null,
      attributes: (item.variant_attributes_snapshot || item.attributes || {}) as Record<string, string>,
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
