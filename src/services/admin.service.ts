// Service: Master Admin Management Operations
// Project: B-Zooginer Pre-Order Platform
// Rule: Pure async functions, strict TypeScript, no React hooks

import { supabase } from '@/lib/supabase';
import type {
  GroupRow,
  ProfileRow,
  OrderRow,
  ActivityLogRow,
  PoStatusType,
} from '@/types/database.types';

export interface MasterAdminStats {
  totalGroups: number;
  publishedGroups: number;
  totalProducts: number;
  totalOrders: number;
  paidRevenue: number;
  unpaidReceivable: number;
  todayOrdersCount: number;
  topGroupName: string;
}

export interface AdminAccountItem extends ProfileRow {
  group: GroupRow | null;
}

export interface OrderWithGroupAndItems extends OrderRow {
  group: { name: string } | null;
  items?: import('@/types/database.types').OrderItemRow[];
}

/**
 * Fetch platform-wide aggregate statistics for Master Admin dashboard
 */
export async function getMasterAdminStats(): Promise<MasterAdminStats> {
  // 1. Fetch groups stats
  const { data: groups } = await supabase.from('groups').select('*');
  const allGroups: GroupRow[] = groups || [];
  const totalGroups = allGroups.length;
  const publishedGroups = allGroups.filter((g) => g.is_published).length;

  // 2. Fetch products count
  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  // 3. Fetch orders data
  const { data: orders } = await supabase.from('orders').select('*');

  const allOrders: OrderRow[] = orders || [];
  const totalOrders = allOrders.length;

  let paidRevenue = 0;
  let unpaidReceivable = 0;
  let todayOrdersCount = 0;
  const groupOrderCounts: Record<string, number> = {};

  const todayStr = new Date().toISOString().slice(0, 10);

  allOrders.forEach((o) => {
    // CRITICAL: Exclude cancelled orders from revenue and receivable calculations
    if (o.order_status === 'cancelled') return;

    const val = Number(o.total || 0);
    if (o.payment_status === 'paid') {
      paidRevenue += val;
    } else {
      unpaidReceivable += val;
    }

    if (o.created_at && o.created_at.startsWith(todayStr)) {
      todayOrdersCount++;
    }

    if (o.group_id) {
      groupOrderCounts[o.group_id] = (groupOrderCounts[o.group_id] || 0) + 1;
    }
  });

  // Determine top group
  let topGroupId = '';
  let maxCount = 0;
  Object.entries(groupOrderCounts).forEach(([gid, cnt]) => {
    if (cnt > maxCount) {
      maxCount = cnt;
      topGroupId = gid;
    }
  });

  const topGroup = allGroups.find((g) => g.id === topGroupId);
  const topGroupName = topGroup ? topGroup.name : 'Belum Ada Transaksi';

  return {
    totalGroups,
    publishedGroups,
    totalProducts: totalProducts || 0,
    totalOrders,
    paidRevenue,
    unpaidReceivable,
    todayOrdersCount,
    topGroupName,
  };
}

/**
 * Fetch all groups (published and unpublished)
 */
export async function getAllGroups(): Promise<GroupRow[]> {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Gagal memuat daftar kelompok: ${error.message}`);
  }

  return data || [];
}

/**
 * Toggle publish status of a group
 */
export async function toggleGroupPublish(groupId: string, isPublished: boolean): Promise<void> {
  const { error } = await (supabase.from('groups') as any)
    .update({ is_published: isPublished })
    .eq('id', groupId);

  if (error) {
    throw new Error(`Gagal memperbarui status terbit stan: ${error.message}`);
  }
}

/**
 * Create a new group
 */
export async function createGroup(payload: {
  name: string;
  slug: string;
  description?: string;
  po_status?: PoStatusType;
}): Promise<GroupRow> {
  const { data, error } = await supabase
    .from('groups')
    .insert({
      name: payload.name.trim(),
      slug: payload.slug.trim().toLowerCase(),
      description: payload.description?.trim() || null,
      po_status: payload.po_status || 'open',
      is_published: true,
    } as any)
    .select()
    .single();

  if (error) {
    throw new Error(`Gagal membuat stan kelompok: ${error.message}`);
  }

  return data;
}

/**
 * Fetch all administrator accounts with their assigned group details
 */
export async function getAdminAccounts(): Promise<AdminAccountItem[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      group:groups (*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Gagal memuat akun administrator: ${error.message}`);
  }

  return (data as unknown as AdminAccountItem[]) || [];
}

/**
 * Provision a new group administrator account through secure Edge Function
 */
export async function createGroupAdminAccount(payload: {
  email: string;
  password: string;
  full_name: string;
  group_id: string;
}): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  if (!token) {
    throw new Error('Autentikasi Master Admin diperlukan.');
  }

  // Invoke secure create-group-admin Edge Function
  const { data, error } = await supabase.functions.invoke('create-group-admin', {
    body: {
      email: payload.email.trim(),
      password: payload.password,
      full_name: payload.full_name.trim(),
      group_id: payload.group_id,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (error) {
    throw new Error(`Gagal membuat akun admin: ${error.message}`);
  }

  if (data && !data.success) {
    throw new Error(data.error || 'Pembuatan akun admin ditolak oleh server.');
  }
}

/**
 * Fetch all orders with multi-filter for Master Admin
 */
export async function getAllOrders(filters?: {
  groupId?: string;
  orderStatus?: string;
  paymentStatus?: string;
  source?: string;
  search?: string;
  sortBy?: string;
}): Promise<OrderWithGroupAndItems[]> {
  let query = supabase
    .from('orders')
    .select(`
      *,
      group:groups (name),
      items:order_items (*)
    `);

  if (filters?.groupId && filters.groupId !== 'all') {
    query = query.eq('group_id', filters.groupId);
  }

  if (filters?.orderStatus && filters.orderStatus !== 'all') {
    query = query.eq('order_status', filters.orderStatus as any);
  }

  if (filters?.paymentStatus && filters.paymentStatus !== 'all') {
    query = query.eq('payment_status', filters.paymentStatus as any);
  }

  if (filters?.source && filters.source !== 'all') {
    query = query.eq('source', filters.source as any);
  }

  if (filters?.search) {
    const s = `%${filters.search.trim()}%`;
    query = query.or(`buyer_name.ilike.${s},buyer_class.ilike.${s},order_code.ilike.${s}`);
  }

  if (filters?.sortBy === 'date_asc') {
    query = query.order('created_at', { ascending: true });
  } else if (filters?.sortBy === 'total_desc') {
    query = query.order('total', { ascending: false });
  } else if (filters?.sortBy === 'total_asc') {
    query = query.order('total', { ascending: true });
  } else if (filters?.sortBy === 'buyer_asc') {
    query = query.order('buyer_name', { ascending: true });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Gagal memuat daftar pesanan: ${error.message}`);
  }

  return (data as unknown as OrderWithGroupAndItems[]) || [];
}

/**
 * Fetch recent audit activity logs
 */
export async function getActivityLogs(): Promise<ActivityLogRow[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`Gagal memuat log aktivitas: ${error.message}`);
  }

  return data || [];
}
