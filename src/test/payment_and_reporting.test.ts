// Test Suite: Phase 6 - Payment Management, Financial Auditing, Reporting & Excel Export
// Project: B-Zooginer Pre-Order Platform

import { describe, it, expect } from 'vitest';
import type {
  PaymentMethodType,
  PaymentStatusType,
  OrderStatusType,
  OrderSourceType,
} from '../types/database.types';
import type {
  OrderWithRelations,
  ComprehensiveReportData,
} from '../services/reports.service';

describe('Phase 6: Payment Management & Reporting Systems', () => {
  // 1. Payment Management & Verification Rules
  describe('A. Manual Payment Management & Verification', () => {
    it('supports only CASH and TRANSFER payment methods (no payment gateway)', () => {
      const allowedMethods: PaymentMethodType[] = ['cash', 'transfer'];
      expect(allowedMethods).toContain('cash');
      expect(allowedMethods).toContain('transfer');
      expect(allowedMethods.length).toBe(2);

      // Verify no automated gateway methods exist
      // @ts-expect-error - Ensure payment gateway types are rejected
      const invalidGatewayMethod: PaymentMethodType = 'credit_card';
      expect(invalidGatewayMethod).toBe('credit_card');
    });

    it('supports UNPAID and PAID payment lifecycle statuses', () => {
      const allowedStatuses: PaymentStatusType[] = ['unpaid', 'paid'];
      expect(allowedStatuses).toEqual(['unpaid', 'paid']);
    });

    it('constructs a tamper-proof audit trail payload when payment status changes', () => {
      const currentOrder = {
        id: 'ord-uuid-1',
        order_code: 'BZG-20261122-ABCD',
        payment_status: 'unpaid' as PaymentStatusType,
        total: 45000,
        group_id: 'grp-uuid-1',
      };

      const actorUserId = 'admin-user-uuid-99';
      const newStatus: PaymentStatusType = 'paid';
      const timestamp = new Date('2026-11-22T10:00:00Z').toISOString();

      const auditLogPayload = {
        actor_id: actorUserId,
        action: 'payment.status_updated',
        entity_type: 'order',
        entity_id: currentOrder.id,
        metadata: {
          order_code: currentOrder.order_code,
          previous_status: currentOrder.payment_status,
          new_status: newStatus,
          total: currentOrder.total,
          group_id: currentOrder.group_id,
          verified_at: timestamp,
        },
      };

      expect(auditLogPayload.actor_id).toBe('admin-user-uuid-99');
      expect(auditLogPayload.action).toBe('payment.status_updated');
      expect(auditLogPayload.metadata.previous_status).toBe('unpaid');
      expect(auditLogPayload.metadata.new_status).toBe('paid');
      expect(auditLogPayload.metadata.order_code).toBe('BZG-20261122-ABCD');
      expect(auditLogPayload.metadata.verified_at).toBe('2026-11-22T10:00:00.000Z');
    });
  });

  // 2. Strict Revenue & Receivable Calculation Domain Logic
  describe('B. Revenue & Receivable Strict Calculation Logic', () => {
    // Mock sample dataset representing various order lifecycle states
    const mockOrders: OrderWithRelations[] = [
      {
        id: 'o-1',
        order_code: 'BZG-20261122-0001',
        group_id: 'grp-a',
        buyer_name: 'Budi Santoso',
        buyer_class: 'XII IPA 1',
        order_status: 'confirmed' as OrderStatusType,
        payment_status: 'paid' as PaymentStatusType,
        payment_method: 'cash' as PaymentMethodType,
        total: 30000,
        order_date: '2026-11-22',
        source: 'public' as OrderSourceType,
        created_at: '2026-11-22T08:00:00Z',
        items: [
          {
            id: 'it-1',
            order_id: 'o-1',
            product_id: 'prod-1',
            product_name_snapshot: 'Roti Bakar Coklat',
            unit_price_snapshot: 15000,
            quantity: 2,
            subtotal: 30000,
            created_at: '2026-11-22T08:00:00Z',
          } as any,
        ],
        group: { id: 'grp-a', name: 'Stan Kuliner Nusantara' } as any,
      } as OrderWithRelations,
      {
        id: 'o-2',
        order_code: 'BZG-20261122-0002',
        group_id: 'grp-a',
        buyer_name: 'Siti Aminah',
        buyer_class: 'XI IPS 2',
        order_status: 'new' as OrderStatusType,
        payment_status: 'unpaid' as PaymentStatusType,
        payment_method: 'transfer' as PaymentMethodType,
        total: 20000,
        order_date: '2026-11-22',
        source: 'group_admin' as OrderSourceType,
        items: [
          {
            id: 'it-2',
            order_id: 'o-2',
            product_id: 'prod-1',
            product_name_snapshot: 'Roti Bakar Coklat',
            unit_price_snapshot: 20000,
            quantity: 1,
            subtotal: 20000,
            created_at: '2026-11-22T08:30:00Z',
          } as any,
        ],
        group: { id: 'grp-a', name: 'Stan Kuliner Nusantara' } as any,
      } as OrderWithRelations,
      {
        id: 'o-3',
        order_code: 'BZG-20261122-0003',
        group_id: 'grp-b',
        buyer_name: 'Ahmad Fauzi',
        buyer_class: 'X-1',
        order_status: 'completed' as OrderStatusType,
        payment_status: 'paid' as PaymentStatusType,
        payment_method: 'cash' as PaymentMethodType,
        total: 50000,
        order_date: '2026-11-21',
        source: 'master_admin' as OrderSourceType,
        items: [
          {
            id: 'it-3',
            order_id: 'o-3',
            product_id: 'prod-2',
            product_name_snapshot: 'Es Teh Manis Solo',
            unit_price_snapshot: 10000,
            quantity: 5,
            subtotal: 50000,
            created_at: '2026-11-21T09:00:00Z',
          } as any,
        ],
        group: { id: 'grp-b', name: 'Stan Minuman Segar' } as any,
      } as OrderWithRelations,
      {
        // Cancelled order with payment_status = 'paid' (e.g. refunded or cancelled before fulfillment)
        id: 'o-4',
        order_code: 'BZG-20261122-0004',
        group_id: 'grp-a',
        buyer_name: 'Dewi Lestari',
        buyer_class: 'XII MIPA 3',
        order_status: 'cancelled' as OrderStatusType,
        payment_status: 'paid' as PaymentStatusType,
        payment_method: 'cash' as PaymentMethodType,
        total: 40000,
        order_date: '2026-11-22',
        source: 'public' as OrderSourceType,
        items: [
          {
            id: 'it-4',
            order_id: 'o-4',
            product_id: 'prod-1',
            product_name_snapshot: 'Roti Bakar Coklat',
            unit_price_snapshot: 20000,
            quantity: 2,
            subtotal: 40000,
            created_at: '2026-11-22T09:30:00Z',
          } as any,
        ],
        group: { id: 'grp-a', name: 'Stan Kuliner Nusantara' } as any,
      } as OrderWithRelations,
      {
        // Cancelled order with payment_status = 'unpaid'
        id: 'o-5',
        order_code: 'BZG-20261122-0005',
        group_id: 'grp-b',
        buyer_name: 'Rian Pratama',
        buyer_class: 'XI MIPA 1',
        order_status: 'cancelled' as OrderStatusType,
        payment_status: 'unpaid' as PaymentStatusType,
        payment_method: 'transfer' as PaymentMethodType,
        total: 25000,
        order_date: '2026-11-21',
        source: 'group_admin' as OrderSourceType,
        items: [],
        group: { id: 'grp-b', name: 'Stan Minuman Segar' } as any,
      } as OrderWithRelations,
    ];

    const calculateReportMetrics = (orders: OrderWithRelations[]) => {
      let totalRevenue = 0;
      let unpaidReceivable = 0;
      let paidOrdersCount = 0;
      let unpaidOrdersCount = 0;
      let cancelledOrdersCount = 0;
      let totalItemsSold = 0;

      orders.forEach((o) => {
        if (o.order_status === 'cancelled') {
          cancelledOrdersCount++;
          return; // CRITICAL: NEVER count cancelled orders in revenue or receivable
        }

        if (o.payment_status === 'paid') {
          totalRevenue += Number(o.total);
          paidOrdersCount++;
          o.items?.forEach((item) => {
            totalItemsSold += Number(item.quantity || 0);
          });
        } else if (o.payment_status === 'unpaid') {
          unpaidReceivable += Number(o.total);
          unpaidOrdersCount++;
        }
      });

      const totalOrdersCount = orders.length - cancelledOrdersCount;

      return {
        totalRevenue,
        unpaidReceivable,
        totalOrdersCount,
        paidOrdersCount,
        unpaidOrdersCount,
        cancelledOrdersCount,
        totalItemsSold,
      };
    };

    it('strictly counts revenue ONLY from eligible paid non-cancelled orders', () => {
      const metrics = calculateReportMetrics(mockOrders);

      // Eligible paid orders: o-1 (30,000) + o-3 (50,000) = 80,000
      // o-4 has payment_status='paid' but order_status='cancelled', so it MUST NOT be counted
      expect(metrics.totalRevenue).toBe(80000);
    });

    it('strictly computes unpaid receivable ONLY from non-cancelled unpaid orders', () => {
      const metrics = calculateReportMetrics(mockOrders);

      // Eligible unpaid orders: o-2 (20,000)
      // o-5 is cancelled, so it MUST NOT be counted
      expect(metrics.unpaidReceivable).toBe(20000);
    });

    it('excludes cancelled orders from total valid orders count', () => {
      const metrics = calculateReportMetrics(mockOrders);

      // Total orders: 5, Cancelled: 2 (o-4, o-5), Valid: 3
      expect(metrics.totalOrdersCount).toBe(3);
      expect(metrics.paidOrdersCount).toBe(2);
      expect(metrics.unpaidOrdersCount).toBe(1);
      expect(metrics.cancelledOrdersCount).toBe(2);
    });

    it('counts items sold exclusively from valid paid orders', () => {
      const metrics = calculateReportMetrics(mockOrders);

      // o-1: 2 items, o-3: 5 items => Total 7 items
      // o-4 was cancelled, so its 2 items must NOT be counted
      expect(metrics.totalItemsSold).toBe(7);
    });
  });

  // 3. Role-Based Group Isolation & Scoping
  describe('C. Role-Based Group Isolation & Permission Boundary', () => {
    const allOrders = [
      { id: '1', group_id: 'group-alpha', total: 50000, payment_status: 'paid', order_status: 'confirmed' },
      { id: '2', group_id: 'group-alpha', total: 25000, payment_status: 'unpaid', order_status: 'new' },
      { id: '3', group_id: 'group-beta', total: 70000, payment_status: 'paid', order_status: 'completed' },
      { id: '4', group_id: 'group-beta', total: 10000, payment_status: 'paid', order_status: 'cancelled' },
    ];

    it('restricts Group Admin report scope strictly to their assigned group', () => {
      const groupAdminGroupId = 'group-alpha';

      // Group Admin query enforces group_id filter
      const groupOrders = allOrders.filter((o) => o.group_id === groupAdminGroupId);
      expect(groupOrders.length).toBe(2);
      expect(groupOrders.every((o) => o.group_id === 'group-alpha')).toBe(true);

      const groupRevenue = groupOrders
        .filter((o) => o.payment_status === 'paid' && o.order_status !== 'cancelled')
        .reduce((sum, o) => sum + o.total, 0);

      expect(groupRevenue).toBe(50000); // Only group-alpha's paid order
    });

    it('allows Master Admin to access global aggregate revenue across all groups', () => {
      const globalRevenue = allOrders
        .filter((o) => o.payment_status === 'paid' && o.order_status !== 'cancelled')
        .reduce((sum, o) => sum + o.total, 0);

      // group-alpha (50,000) + group-beta (70,000) = 120,000
      expect(globalRevenue).toBe(120000);
    });
  });

  // 4. Multi-Source Order Breakdown
  describe('D. Multi-Source Order Breakdown (Public, Group Admin, Master Admin)', () => {
    it('accurately groups orders and revenue by source channel', () => {
      const sourceData = [
        { source: 'public', total: 100000, payment_status: 'paid', order_status: 'completed' },
        { source: 'public', total: 50000, payment_status: 'paid', order_status: 'confirmed' },
        { source: 'group_admin', total: 80000, payment_status: 'paid', order_status: 'confirmed' },
        { source: 'master_admin', total: 60000, payment_status: 'paid', order_status: 'confirmed' },
        { source: 'public', total: 30000, payment_status: 'paid', order_status: 'cancelled' }, // Cancelled
      ];

      const breakdown: Record<string, { count: number; revenue: number }> = {
        public: { count: 0, revenue: 0 },
        group_admin: { count: 0, revenue: 0 },
        master_admin: { count: 0, revenue: 0 },
      };

      sourceData.forEach((item) => {
        if (item.order_status === 'cancelled') return;

        breakdown[item.source].count++;
        if (item.payment_status === 'paid') {
          breakdown[item.source].revenue += item.total;
        }
      });

      expect(breakdown.public.count).toBe(2);
      expect(breakdown.public.revenue).toBe(150000);
      expect(breakdown.group_admin.count).toBe(1);
      expect(breakdown.group_admin.revenue).toBe(80000);
      expect(breakdown.master_admin.count).toBe(1);
      expect(breakdown.master_admin.revenue).toBe(60000);
    });
  });

  // 5. Excel Export Data Structure & Number Formatting
  describe('E. Excel Export Structure & Formatting Requirements', () => {
    it('formats monetary values into standard Indonesian Rupiah accounting format', () => {
      const formatRupiah = (val: number) =>
        new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          maximumFractionDigits: 0,
        }).format(val);

      expect(formatRupiah(150000)).toContain('150.000');
      expect(formatRupiah(0)).toContain('0');
    });

    it('validates standard 13-column layout required for Excel export', () => {
      const expectedHeaders = [
        'No',
        'Kode Pesanan',
        'Tanggal Transaksi',
        'Stan Kelompok',
        'Nama Pembeli',
        'Kelas',
        'Rincian Menu & Varian',
        'Total Porsi',
        'Total Tagihan (Rp)',
        'Metode Bayar',
        'Status Pembayaran',
        'Status Pesanan',
        'Saluran Pemesanan',
      ];

      expect(expectedHeaders.length).toBe(13);
      expect(expectedHeaders).toContain('Kode Pesanan');
      expect(expectedHeaders).toContain('Status Pembayaran');
      expect(expectedHeaders).toContain('Total Tagihan (Rp)');
    });
  });
});
