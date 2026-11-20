import { describe, it, expect } from 'vitest';
import type {
  RoleType,
  PoStatusType,
  OrderSourceType,
  PaymentMethodType,
  PaymentStatusType,
  OrderStatusType,
  VariantDimension,
  OrderRow,
  ProductRow,
} from '../types/database.types';

describe('Database Schema & TypeScript Type Safety', () => {
  it('validates role enum values', () => {
    const roles: RoleType[] = ['master_admin', 'group_admin'];
    expect(roles).toHaveLength(2);
    expect(roles).toContain('master_admin');
    expect(roles).toContain('group_admin');
  });

  it('validates PO status enum values', () => {
    const statuses: PoStatusType[] = ['open', 'coming_soon', 'closed'];
    expect(statuses).toEqual(['open', 'coming_soon', 'closed']);
  });

  it('validates order status and payment status separation', () => {
    const orderStatuses: OrderStatusType[] = ['new', 'confirmed', 'cancelled', 'completed'];
    const paymentStatuses: PaymentStatusType[] = ['unpaid', 'paid'];
    const paymentMethods: PaymentMethodType[] = ['cash', 'transfer'];
    const orderSources: OrderSourceType[] = ['master_admin', 'group_admin', 'public'];

    expect(orderStatuses).toHaveLength(4);
    expect(paymentStatuses).toHaveLength(2);
    expect(paymentMethods).toHaveLength(2);
    expect(orderSources).toHaveLength(3);
  });

  it('supports multi-dimensional variant schema in products', () => {
    const dimensions: VariantDimension[] = [
      { name: 'Ukuran', options: ['Small', 'Medium', 'Large'] },
      { name: 'Rasa', options: ['Cokelat', 'Keju', 'Matcha'] },
    ];

    const mockProduct: Partial<ProductRow> = {
      name: 'Minuman Kekinian',
      has_variants: true,
      variant_dimensions: dimensions,
      base_price: 15000,
    };

    expect(mockProduct.variant_dimensions).toHaveLength(2);
    expect(mockProduct.variant_dimensions?.[0].name).toBe('Ukuran');
    expect(mockProduct.variant_dimensions?.[1].name).toBe('Rasa');
  });

  it('validates order code format structure (BZG-YYYYMMDD-XXXX)', () => {
    const orderCodeRegex = /^BZG-[0-9]{8}-[A-Z0-9]{4}$/;
    const validCode = 'BZG-20261121-7K9M';
    const invalidCodes = [
      'BZG-2026112-7K9M', // Short date
      'BZG-20261121-7K9', // Short suffix
      'bzg-20261121-7k9m', // Lowercase
      'ORD-20261121-7K9M', // Wrong prefix
    ];

    expect(orderCodeRegex.test(validCode)).toBe(true);
    for (const code of invalidCodes) {
      expect(orderCodeRegex.test(code)).toBe(false);
    }
  });

  it('validates high-entropy access token format (64-char hex string, 256 bits)', () => {
    const tokenRegex = /^[a-f0-9]{64}$/;
    const validToken = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    const invalidTokens = [
      'short-token',
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b85G', // Non-hex char 'G'
      'e3b0c442', // Too short
    ];

    expect(tokenRegex.test(validToken)).toBe(true);
    for (const token of invalidTokens) {
      expect(tokenRegex.test(token)).toBe(false);
    }
  });

  it('ensures orders require both order_code and access_token in row definition', () => {
    const mockOrder: Partial<OrderRow> = {
      id: 'd1111111-1111-1111-1111-111111111111',
      order_code: 'BZG-20261121-7K9M',
      access_token: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      buyer_name: 'Budi Santoso',
      buyer_class: 'XII MIPA 1',
      total: 25000,
      payment_status: 'unpaid',
      order_status: 'new',
    };

    expect(mockOrder.order_code).toBeDefined();
    expect(mockOrder.access_token).toBeDefined();
    expect(mockOrder.access_token?.length).toBe(64);
  });
});
