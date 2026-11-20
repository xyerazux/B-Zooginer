// Supabase Edge Function: submit-order
// Runtime: Deno (TypeScript)
// Description: Secure server-side validation and atomic creation for public anonymous pre-orders.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface OrderItemPayload {
  product_id: string;
  variant_id?: string | null;
  quantity: number;
}

interface SubmitOrderPayload {
  group_id: string;
  buyer_name: string;
  buyer_class: string;
  whatsapp?: string | null;
  payment_method: 'cash' | 'transfer';
  notes?: string | null;
  items: OrderItemPayload[];
}

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Metode HTTP tidak diizinkan. Gunakan POST.' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Konfigurasi server tidak lengkap: SUPABASE_URL atau SERVICE_ROLE_KEY hilang.');
      return new Response(
        JSON.stringify({ error: 'Terjadi kesalahan konfigurasi pada server.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    let payload: SubmitOrderPayload;
    try {
      payload = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Format JSON permintaan tidak valid.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Basic validation
    if (!payload.group_id) {
      return new Response(
        JSON.stringify({ error: 'ID Kelompok wajib diisi.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!payload.buyer_name || payload.buyer_name.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Nama pembeli wajib diisi.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!payload.buyer_class || payload.buyer_class.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Kelas pembeli wajib diisi.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!payload.payment_method || !['cash', 'transfer'].includes(payload.payment_method)) {
      return new Response(
        JSON.stringify({ error: 'Metode pembayaran harus "cash" (tunai) atau "transfer".' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!payload.items || !Array.isArray(payload.items) || payload.items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Pesanan harus memilih minimal 1 produk.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Delegate to the atomic database procedure (submit_public_order)
    // The database function performs row locking, stock validation, and price snapshotting in a single atomic transaction.
    const { data, error } = await supabaseAdmin.rpc('submit_public_order', {
      p_group_id: payload.group_id,
      p_buyer_name: payload.buyer_name.trim(),
      p_buyer_class: payload.buyer_class.trim(),
      p_whatsapp: payload.whatsapp ? payload.whatsapp.trim() : null,
      p_payment_method: payload.payment_method,
      p_notes: payload.notes ? payload.notes.trim() : null,
      p_items: payload.items,
    });

    if (error) {
      console.error('Error saat submit_public_order:', error);
      return new Response(
        JSON.stringify({ error: error.message || 'Gagal memproses pesanan.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = data && data[0] ? data[0] : null;
    if (!result) {
      return new Response(
        JSON.stringify({ error: 'Gagal mendapatkan konfirmasi pesanan dari database.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Return unique order code and high-entropy access token to buyer
    return new Response(
      JSON.stringify({
        success: true,
        order_code: result.order_code,
        access_token: result.access_token,
        total: result.total,
        message: 'Pesanan berhasil dibuat.',
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem internal';
    console.error('Unhandled Edge Function exception:', err);
    return new Response(
      JSON.stringify({ error: errorMsg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
