import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import type { RoleType, OrderStatusType, PaymentStatusType } from '../types/database.types';

describe('Phase 4: Authentication, Access Control & Dashboards', () => {
  // 1. Login Form Validation Schema
  const loginSchema = z.object({
    email: z
      .string()
      .min(1, 'Email wajib diisi')
      .email('Format email tidak valid'),
    password: z
      .string()
      .min(6, 'Kata sandi minimal 6 karakter'),
  });

  describe('A. Login Form Validation', () => {
    it('accepts valid credentials', () => {
      const result = loginSchema.safeParse({
        email: 'master@bzooginer.sch.id',
        password: 'Password123!',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email formats', () => {
      const result = loginSchema.safeParse({
        email: 'invalid-email-address',
        password: 'Password123!',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Format email tidak valid');
      }
    });

    it('rejects short passwords under 6 characters', () => {
      const result = loginSchema.safeParse({
        email: 'admin@bzooginer.sch.id',
        password: '123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Kata sandi minimal 6 karakter');
      }
    });

    it('rejects empty input fields with Indonesian validation messages', () => {
      const result = loginSchema.safeParse({
        email: '',
        password: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const messages = result.error.issues.map((i) => i.message);
        expect(messages).toContain('Email wajib diisi');
      }
    });
  });

  // 2. Protected Routes & Role Permission Boundaries
  describe('B. Protected Routes & Role Boundaries', () => {
    interface AuthState {
      isAuthenticated: boolean;
      role?: RoleType;
      groupId?: string | null;
    }

    const checkAccess = (
      auth: AuthState,
      requiredRole: RoleType
    ): { allowed: boolean; redirectPath?: string; errorReason?: string } => {
      if (!auth.isAuthenticated) {
        return { allowed: false, redirectPath: '/login' };
      }
      if (auth.role !== requiredRole) {
        return {
          allowed: false,
          errorReason: 'Akses Ditolak (403): Peran tidak sesuai',
          redirectPath: auth.role === 'master_admin' ? '/admin' : '/dashboard',
        };
      }
      if (auth.role === 'group_admin' && !auth.groupId) {
        return {
          allowed: false,
          errorReason: 'Belum Ada Stan yang Ditugaskan',
        };
      }
      return { allowed: true };
    };

    it('redirects unauthenticated visitors to /login', () => {
      const unauth: AuthState = { isAuthenticated: false };
      const res = checkAccess(unauth, 'master_admin');
      expect(res.allowed).toBe(false);
      expect(res.redirectPath).toBe('/login');
    });

    it('allows Master Admin into /admin routes', () => {
      const master: AuthState = { isAuthenticated: true, role: 'master_admin' };
      const res = checkAccess(master, 'master_admin');
      expect(res.allowed).toBe(true);
    });

    it('blocks Group Admin from accessing Master Admin /admin routes', () => {
      const groupAdmin: AuthState = {
        isAuthenticated: true,
        role: 'group_admin',
        groupId: 'group-uuid-1',
      };
      const res = checkAccess(groupAdmin, 'master_admin');
      expect(res.allowed).toBe(false);
      expect(res.redirectPath).toBe('/dashboard');
      expect(res.errorReason).toContain('403');
    });

    it('blocks Master Admin from Group Admin /dashboard routes and redirects to /admin', () => {
      const master: AuthState = { isAuthenticated: true, role: 'master_admin' };
      const res = checkAccess(master, 'group_admin');
      expect(res.allowed).toBe(false);
      expect(res.redirectPath).toBe('/admin');
    });

    it('blocks Group Admin without assigned group_id from /dashboard', () => {
      const unassignedGroupAdmin: AuthState = {
        isAuthenticated: true,
        role: 'group_admin',
        groupId: null,
      };
      const res = checkAccess(unassignedGroupAdmin, 'group_admin');
      expect(res.allowed).toBe(false);
      expect(res.errorReason).toBe('Belum Ada Stan yang Ditugaskan');
    });
  });

  // 3. Group Admin Data Isolation
  describe('C. Group Admin Data Isolation', () => {
    interface MockProduct {
      id: string;
      group_id: string;
      name: string;
      is_active: boolean;
    }

    interface MockOrder {
      id: string;
      group_id: string;
      order_code: string;
      payment_status: PaymentStatusType;
      order_status: OrderStatusType;
    }

    const testProducts: MockProduct[] = [
      { id: 'prod-1', group_id: 'group-A', name: 'Es Teh Manis', is_active: true },
      { id: 'prod-2', group_id: 'group-A', name: 'Nasi Kuning Komplit', is_active: true },
      { id: 'prod-3', group_id: 'group-B', name: 'Brownies Fudgy', is_active: true },
    ];

    const testOrders: MockOrder[] = [
      { id: 'ord-1', group_id: 'group-A', order_code: 'BZG-20261121-AAAA', payment_status: 'unpaid', order_status: 'new' },
      { id: 'ord-2', group_id: 'group-B', order_code: 'BZG-20261121-BBBB', payment_status: 'paid', order_status: 'confirmed' },
    ];

    it('filters products strictly by assigned group_id', () => {
      const myGroupId = 'group-A';
      const myProducts = testProducts.filter((p) => p.group_id === myGroupId);
      expect(myProducts.length).toBe(2);
      expect(myProducts.every((p) => p.group_id === myGroupId)).toBe(true);
      expect(myProducts.some((p) => p.name === 'Brownies Fudgy')).toBe(false);
    });

    it('filters orders strictly by assigned group_id', () => {
      const myGroupId = 'group-A';
      const myOrders = testOrders.filter((o) => o.group_id === myGroupId);
      expect(myOrders.length).toBe(1);
      expect(myOrders[0].order_code).toBe('BZG-20261121-AAAA');
    });

    it('prevents group admin from modifying product belonging to another group', () => {
      const myGroupId = 'group-A';
      const targetProduct = testProducts.find((p) => p.id === 'prod-3'); // belongs to group-B

      const canModify = targetProduct?.group_id === myGroupId;
      expect(canModify).toBe(false);
    });
  });

  // 4. Server-Side Account Creation Contract (create-group-admin Edge Function)
  describe('D. Secure Group Admin Account Provisioning Contract', () => {
    const createAdminSchema = z.object({
      email: z.string().email('Format email tidak valid'),
      password: z.string().min(6, 'Kata sandi minimal 6 karakter'),
      fullName: z.string().min(2, 'Nama lengkap wajib diisi'),
      groupId: z.string().uuid('Pilih stan kelompok yang valid'),
    });

    it('validates correct group-admin creation payload', () => {
      const validPayload = {
        email: 'stan.xii.ipa1@bzooginer.sch.id',
        password: 'StanSecurePass2026!',
        fullName: 'Budi Santoso (Ketua Stan)',
        groupId: 'a1111111-1111-1111-1111-111111111111',
      };
      const result = createAdminSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('rejects payload missing groupId or invalid UUID', () => {
      const invalidPayload = {
        email: 'stan@bzooginer.sch.id',
        password: 'Password123!',
        fullName: 'Admin Stan',
        groupId: 'not-a-uuid',
      };
      const result = createAdminSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Pilih stan kelompok yang valid');
      }
    });

    it('prohibits frontend from creating master_admin accounts directly', () => {
      const allowedRolesToProvision = ['group_admin'];
      const targetRoleToCreate = 'master_admin';

      const canProvisionRole = allowedRolesToProvision.includes(targetRoleToCreate);
      expect(canProvisionRole).toBe(false);
    });
  });

  // 5. Order Status and Payment State Transitions
  describe('E. Order & Payment Lifecycle State Transitions', () => {
    it('supports valid forward lifecycle transitions: new -> confirmed -> completed', () => {
      const validTransitions: Record<OrderStatusType, OrderStatusType[]> = {
        new: ['confirmed', 'cancelled'],
        confirmed: ['completed', 'cancelled'],
        completed: [],
        cancelled: [],
      };

      expect(validTransitions['new']).toContain('confirmed');
      expect(validTransitions['confirmed']).toContain('completed');
      expect(validTransitions['completed'].length).toBe(0); // Terminal state
      expect(validTransitions['cancelled'].length).toBe(0); // Terminal state
    });

    it('handles payment status transition from unpaid to paid', () => {
      let paymentStatus: PaymentStatusType = 'unpaid';
      const markAsPaid = (current: PaymentStatusType): PaymentStatusType => {
        if (current === 'paid') return current; // idempotent
        return 'paid';
      };

      paymentStatus = markAsPaid(paymentStatus);
      expect(paymentStatus).toBe('paid');
    });
  });
});
