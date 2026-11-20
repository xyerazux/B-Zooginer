// Supabase Edge Function: create-group-admin
// Runtime: Deno (TypeScript)
// Description: Secure server-side provisioning of Group Admin accounts.
// Restriction: Callable strictly by verified Master Admin.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CreateGroupAdminPayload {
  email: string;
  password?: string;
  full_name: string;
  group_id: string;
}

serve(async (req: Request) => {
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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Header Authorization diperlukan.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Konfigurasi server tidak lengkap.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Verify caller identity using JWT
    const supabaseCaller = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: callerUser }, error: userError } = await supabaseCaller.auth.getUser();
    if (userError || !callerUser) {
      return new Response(
        JSON.stringify({ error: 'Sesi otentikasi tidak valid atau sudah kadaluarsa.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if caller is master_admin in profiles table
    const { data: callerProfile, error: profileError } = await supabaseCaller
      .from('profiles')
      .select('role')
      .eq('id', callerUser.id)
      .single();

    if (profileError || callerProfile?.role !== 'master_admin') {
      return new Response(
        JSON.stringify({ error: 'Akses ditolak: Hanya Master Admin yang berhak membuat akun Group Admin.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Parse and validate payload
    const payload: CreateGroupAdminPayload = await req.json();

    if (!payload.email || !payload.email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Alamat email tidak valid.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!payload.full_name || payload.full_name.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Nama lengkap admin wajib diisi.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!payload.group_id) {
      return new Response(
        JSON.stringify({ error: 'ID kelompok wajib dipilih.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify target group exists
    const { data: targetGroup, error: groupErr } = await supabaseAdmin
      .from('groups')
      .select('id, name')
      .eq('id', payload.group_id)
      .single();

    if (groupErr || !targetGroup) {
      return new Response(
        JSON.stringify({ error: 'Kelompok sasaran tidak ditemukan.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Create auth user via Supabase Admin API
    const initialPassword = payload.password || `BZG-${Math.random().toString(36).substring(2, 10).toUpperCase()}!`;
    const { data: newAuthUser, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: payload.email.trim(),
      password: initialPassword,
      email_confirm: true,
      user_metadata: {
        full_name: payload.full_name.trim(),
        role: 'group_admin',
        group_id: payload.group_id,
      },
    });

    if (createAuthError || !newAuthUser.user) {
      console.error('Error saat membuat auth user:', createAuthError);
      return new Response(
        JSON.stringify({ error: createAuthError?.message || 'Gagal mendaftarkan akun di sistem auth.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Ensure profile is bound to group_admin role and group_id
    const { error: profileSetError } = await supabaseAdmin.rpc('create_group_admin_profile', {
      p_user_id: newAuthUser.user.id,
      p_full_name: payload.full_name.trim(),
      p_group_id: payload.group_id,
    });

    if (profileSetError) {
      console.error('Error setting group admin profile:', profileSetError);
      return new Response(
        JSON.stringify({ error: 'Akun auth dibuat namun gagal mengikat profil kelompok.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id: newAuthUser.user.id,
        email: newAuthUser.user.email,
        full_name: payload.full_name,
        group_id: payload.group_id,
        group_name: targetGroup.name,
        temporary_password: initialPassword,
        message: 'Akun Group Admin berhasil dibuat dan ditautkan ke kelompok.',
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
    return new Response(
      JSON.stringify({ error: errorMsg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
