// Service: Comprehensive Sales, Financial & Performance Reporting
// Project: B-Zooginer Pre-Order Platform
// Rules:
// - Revenue MUST only count eligible paid orders (payment_status = 'paid' AND order_status <> 'cancelled')
// - Cancelled orders MUST NOT be counted in revenue or receivable
// - Group Admins can only query and see metrics for their own assigned group

import { supabase } from '@/lib/supabase';
import type {
  OrderRow,
  OrderItemRow,
  GroupRow,
  OrderSourceType,
} from '@/types/database.types';

export interface DailySalesItem {
  date: string;
  revenue: number;
  ordersCount: number;
  itemsCount: number;
}

export interface GroupPerformanceItem {
  groupId: string;
  groupName: string;
  totalOrders: number;
  paidOrders: number;
  unpaidOrders: number;
  paidRevenue: number;
  unpaidReceivable: number;
  paidRatio: number;
}

export interface ProductPerformanceItem {
  productId: string;
  productName: string;
  groupName: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

export interface OrderSourceBreakdownItem {
  source: OrderSourceType;
  sourceLabel: string;
  count: number;
  revenue: number;
}

export interface ReportFilterOptions {
  startDate?: string;
  endDate?: string;
  groupId?: string;
  orderStatus?: string;
  paymentStatus?: string;
  source?: string;
  productId?: string;
}

export interface OrderWithRelations extends OrderRow {
  group?: GroupRow | null;
  items: OrderItemRow[];
}

export interface ComprehensiveReportData {
  totalRevenue: number; // ONLY eligible paid orders (payment_status === 'paid' && order_status !== 'cancelled')
  unpaidReceivable: number; // payment_status === 'unpaid' && order_status !== 'cancelled'
  totalOrdersCount: number; // Total valid non-cancelled orders
  paidOrdersCount: number;
  unpaidOrdersCount: number;
  cancelledOrdersCount: number;
  totalItemsSold: number;
  dailySales: DailySalesItem[];
  groupPerformance: GroupPerformanceItem[];
  productPerformance: ProductPerformanceItem[];
  orderSourceBreakdown: OrderSourceBreakdownItem[];
  rawOrders: OrderWithRelations[];
}

/**
 * Fetch and calculate comprehensive financial and sales reports with strict revenue validation
 */
export async function getComprehensiveReport(
  filters: ReportFilterOptions = {}
): Promise<ComprehensiveReportData> {
  let query = supabase
    .from('orders')
    .select(`
      *,
      group:groups (*),
      items:order_items (*)
    `)
    .order('created_at', { ascending: false });

  // 1. Group filtering
  if (filters.groupId && filters.groupId !== 'all') {
    query = query.eq('group_id', filters.groupId);
  }

  // 2. Date range filtering
  if (filters.startDate) {
    query = query.gte('order_date', filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte('order_date', filters.endDate);
  }

  // 3. Payment status filtering
  if (filters.paymentStatus && filters.paymentStatus !== 'all') {
    query = query.eq('payment_status', filters.paymentStatus as any);
  }

  // 4. Order status filtering
  if (filters.orderStatus && filters.orderStatus !== 'all') {
    query = query.eq('order_status', filters.orderStatus as any);
  }

  // 5. Order source filtering
  if (filters.source && filters.source !== 'all') {
    query = query.eq('source', filters.source as any);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Gagal memuat data laporan: ${error.message}`);
  }

  let orders = (data as unknown as OrderWithRelations[]) || [];

  // 6. Optional Product ID filtering in memory based on order_items
  if (filters.productId && filters.productId !== 'all') {
    orders = orders.filter((o) =>
      o.items?.some((i) => i.product_id === filters.productId)
    );
  }

  // Aggregation variables
  let totalRevenue = 0;
  let unpaidReceivable = 0;
  let paidOrdersCount = 0;
  let unpaidOrdersCount = 0;
  let cancelledOrdersCount = 0;
  let totalItemsSold = 0;

  const dailySalesMap: Record<string, { revenue: number; ordersCount: number; itemsCount: number }> = {};
  const groupPerfMap: Record<
    string,
    {
      groupName: string;
      totalOrders: number;
      paidOrders: number;
      unpaidOrders: number;
      paidRevenue: number;
      unpaidReceivable: number;
    }
  > = {};

  const productPerfMap: Record<
    string,
    { productName: string; groupName: string; quantity: number; revenue: number }
  > = {};

  const sourceMap: Record<OrderSourceType, { count: number; revenue: number }> = {
    public: { count: 0, revenue: 0 },
    group_admin: { count: 0, revenue: 0 },
    master_admin: { count: 0, revenue: 0 },
  };

  orders.forEach((o) => {
    const isCancelled = o.order_status === 'cancelled';
    const isPaid = o.payment_status === 'paid';
    const amount = Number(o.total || 0);
    const dateKey = o.order_date || o.created_at.slice(0, 10);
    const gid = o.group_id;
    const gname = o.group?.name || 'Stan Kelompok';

    // Count items in order
    const orderItemsCount = (o.items || []).reduce(
      (acc, item) => acc + Number(item.quantity || 1),
      0
    );

    // Initial group record
    if (!groupPerfMap[gid]) {
      groupPerfMap[gid] = {
        groupName: gname,
        totalOrders: 0,
        paidOrders: 0,
        unpaidOrders: 0,
        paidRevenue: 0,
        unpaidReceivable: 0,
      };
    }

    // Initial daily record
    if (!dailySalesMap[dateKey]) {
      dailySalesMap[dateKey] = { revenue: 0, ordersCount: 0, itemsCount: 0 };
    }

    if (isCancelled) {
      cancelledOrdersCount++;
    } else {
      // NON-CANCELLED ORDERS
      groupPerfMap[gid].totalOrders++;

      if (isPaid) {
        paidOrdersCount++;
        totalRevenue += amount;
        groupPerfMap[gid].paidOrders++;
        groupPerfMap[gid].paidRevenue += amount;
        totalItemsSold += orderItemsCount;

        // Daily sales breakdown (only paid revenue)
        dailySalesMap[dateKey].revenue += amount;
        dailySalesMap[dateKey].ordersCount++;
        dailySalesMap[dateKey].itemsCount += orderItemsCount;

        // Source breakdown
        if (sourceMap[o.source]) {
          sourceMap[o.source].count++;
          sourceMap[o.source].revenue += amount;
        }

        // Product performance breakdown
        (o.items || []).forEach((item) => {
          const pid = item.product_id;
          const pName = item.product_name_snapshot;
          const itemSubtotal = Number(item.subtotal || 0);
          const itemQty = Number(item.quantity || 1);

          if (!productPerfMap[pid]) {
            productPerfMap[pid] = {
              productName: pName,
              groupName: gname,
              quantity: 0,
              revenue: 0,
            };
          }

          productPerfMap[pid].quantity += itemQty;
          productPerfMap[pid].revenue += itemSubtotal;
        });
      } else {
        // UNPAID (Receivable)
        unpaidOrdersCount++;
        unpaidReceivable += amount;
        groupPerfMap[gid].unpaidOrders++;
        groupPerfMap[gid].unpaidReceivable += amount;
      }
    }
  });

  // Transform daily sales to sorted array
  const dailySales: DailySalesItem[] = Object.entries(dailySalesMap)
    .map(([date, val]) => ({
      date,
      revenue: val.revenue,
      ordersCount: val.ordersCount,
      itemsCount: val.itemsCount,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Transform group performance
  const groupPerformance: GroupPerformanceItem[] = Object.entries(groupPerfMap).map(
    ([groupId, val]) => {
      const totalCount = val.totalOrders;
      const paidRatio = totalCount > 0 ? Math.round((val.paidOrders / totalCount) * 100) : 0;
      return {
        groupId,
        groupName: val.groupName,
        totalOrders: val.totalOrders,
        paidOrders: val.paidOrders,
        unpaidOrders: val.unpaidOrders,
        paidRevenue: val.paidRevenue,
        unpaidReceivable: val.unpaidReceivable,
        paidRatio,
      };
    }
  ).sort((a, b) => b.paidRevenue - a.paidRevenue);

  // Transform product performance (Top best-selling)
  const productPerformance: ProductPerformanceItem[] = Object.entries(productPerfMap)
    .map(([productId, val]) => ({
      productId,
      productName: val.productName,
      groupName: val.groupName,
      totalQuantitySold: val.quantity,
      totalRevenue: val.revenue,
    }))
    .sort((a, b) => b.totalQuantitySold - a.totalQuantitySold);

  // Transform source breakdown
  const sourceLabels: Record<OrderSourceType, string> = {
    public: 'Publik / Toko Web',
    group_admin: 'Admin Stan (Roadshow)',
    master_admin: 'Master Admin (Pusat)',
  };

  const orderSourceBreakdown: OrderSourceBreakdownItem[] = (
    ['public', 'group_admin', 'master_admin'] as OrderSourceType[]
  ).map((src) => ({
    source: src,
    sourceLabel: sourceLabels[src],
    count: sourceMap[src].count,
    revenue: sourceMap[src].revenue,
  }));

  return {
    totalRevenue,
    unpaidReceivable,
    totalOrdersCount: paidOrdersCount + unpaidOrdersCount,
    paidOrdersCount,
    unpaidOrdersCount,
    cancelledOrdersCount,
    totalItemsSold,
    dailySales,
    groupPerformance,
    productPerformance,
    orderSourceBreakdown,
    rawOrders: orders,
  };
}
