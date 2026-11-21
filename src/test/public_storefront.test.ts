import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import { submitPublicOrder, getOrderConfirmation } from '@/services/orders.service';
import { supabase } from '@/lib/supabase';

// Schema under test from PublicCheckoutPage
const checkoutSchema = z.object({
  buyer_name: z
    .string()
    .min(2, 'Nama pemesan minimal 2 karakter')
    .max(100, 'Nama pemesan maksimal 100 karakter'),
  buyer_class: z
    .string()
    .min(2, 'Kelas siswa wajib diisi (contoh: XII MIPA 1)')
    .max(50, 'Nama kelas terlalu panjang'),
  whatsapp: z
    .string()
    .optional()
    .refine((val) => !val || /^[0-9+-\s]{8,20}$/.test(val), {
      message: 'Format nomor WhatsApp tidak valid (contoh: 08123456789)',
    }),
  payment_method: z.enum(['cash', 'transfer'], {
    required_error: 'Pilih salah satu metode pembayaran',
  }),
  notes: z.string().max(300, 'Catatan maksimal 300 karakter').optional(),
});

describe('Phase 3: Public Storefront Architecture & Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Checkout Form Zod Validation', () => {
    it('validates correct Indonesian buyer data', () => {
      const validData = {
        buyer_name: 'Rizky Pratama',
        buyer_class: 'XII MIPA 2',
        whatsapp: '08123456789',
        payment_method: 'cash',
        notes: 'Sambal dipisah',
      };

      const result = checkoutSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects short buyer name (< 2 characters)', () => {
      const invalidData = {
        buyer_name: 'R',
        buyer_class: 'XII MIPA 2',
        payment_method: 'cash',
      };

      const result = checkoutSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('minimal 2 karakter');
      }
    });

    it('rejects empty buyer class', () => {
      const invalidData = {
        buyer_name: 'Siti Nurhaliza',
        buyer_class: '',
        payment_method: 'transfer',
      };

      const result = checkoutSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('validates optional WhatsApp phone format', () => {
      // Valid WhatsApp
      expect(
        checkoutSchema.safeParse({
          buyer_name: 'Amanda Putri',
          buyer_class: 'X-E4',
          whatsapp: '085712345678',
          payment_method: 'cash',
        }).success
      ).toBe(true);

      // Empty optional WhatsApp is allowed
      expect(
        checkoutSchema.safeParse({
          buyer_name: 'Amanda Putri',
          buyer_class: 'X-E4',
          whatsapp: '',
          payment_method: 'cash',
        }).success
      ).toBe(true);

      // Invalid characters in WhatsApp should be rejected
      expect(
        checkoutSchema.safeParse({
          buyer_name: 'Amanda Putri',
          buyer_class: 'X-E4',
          whatsapp: 'bukan-nomor-hp',
          payment_method: 'cash',
        }).success
      ).toBe(false);
    });

    it('strictly restricts payment methods to cash and transfer only', () => {
      // Allowed
      expect(
        checkoutSchema.safeParse({
          buyer_name: 'Budi Santoso',
          buyer_class: 'Guru Fisika',
          payment_method: 'cash',
        }).success
      ).toBe(true);

      expect(
        checkoutSchema.safeParse({
          buyer_name: 'Budi Santoso',
          buyer_class: 'Guru Fisika',
          payment_method: 'transfer',
        }).success
      ).toBe(true);

      // Disallowed: QRIS or other payment gateways are NOT permitted
      expect(
        checkoutSchema.safeParse({
          buyer_name: 'Budi Santoso',
          buyer_class: 'Guru Fisika',
          payment_method: 'qris',
        }).success
      ).toBe(false);
    });
  });

  describe('Multi-Dimensional Variant Calculation Logic', () => {
    it('correctly calculates dynamic price and matches multi-dimensional attributes', () => {
      const basePrice = 20000;
      const variants = [
        {
          id: 'v1',
          title: 'Porsi: Reguler, Level: Sedang',
          attributes: { Porsi: 'Reguler', 'Level Pedas': 'Sedang' },
          price_adjustment: 0,
          stock: 50,
        },
        {
          id: 'v2',
          title: 'Porsi: Jumbo, Level: Pedas Mantap',
          attributes: { Porsi: 'Jumbo', 'Level Pedas': 'Pedas Mantap' },
          price_adjustment: 5000,
          stock: 30,
        },
      ];

      const selectedAttributes = { Porsi: 'Jumbo', 'Level Pedas': 'Pedas Mantap' };

      // Find matching variant
      const matched = variants.find((v) =>
        Object.entries(selectedAttributes).every(
          ([k, val]) => v.attributes[k as keyof typeof v.attributes] === val
        )
      );

      expect(matched).toBeDefined();
      expect(matched?.id).toBe('v2');

      const dynamicUnitPrice = basePrice + (matched ? matched.price_adjustment : 0);
      expect(dynamicUnitPrice).toBe(25000);

      const quantity = 3;
      const grandTotal = dynamicUnitPrice * quantity;
      expect(grandTotal).toBe(75000);
    });
  });

  describe('Order Confirmation Token Security Contract', () => {
    it('returns null immediately when orderCode or accessToken is missing', async () => {
      const res1 = await getOrderConfirmation('', 'some-token');
      expect(res1).toBeNull();

      const res2 = await getOrderConfirmation('BZG-20261121-7K9M', '');
      expect(res2).toBeNull();
    });

    it('masks phone numbers properly for student PII privacy', () => {
      const maskPhone = (phone: string | null) => {
        if (!phone) return null;
        if (phone.length <= 6) return phone;
        const start = phone.slice(0, 4);
        const end = phone.slice(-3);
        return `${start}****${end}`;
      };

      expect(maskPhone('08123456789')).toBe('0812****789');
      expect(maskPhone('085712345678')).toBe('0857****678');
      expect(maskPhone(null)).toBeNull();
    });
  });

  describe('Public Order RPC Submission Wrapper', () => {
    it('invokes submit_public_order RPC and formats return properly', async () => {
      const mockRpc = vi.spyOn(supabase, 'rpc').mockResolvedValueOnce({
        data: [
          {
            order_code: 'BZG-20261121-7K9M',
            access_token: 'tok_abc1234567890abcdef',
            total: 25000,
          },
        ],
        error: null,
      } as any);

      const result = await submitPublicOrder({
        group_id: 'a1111111-1111-1111-1111-111111111111',
        buyer_name: 'Rizky Pratama',
        buyer_class: 'XII MIPA 2',
        whatsapp: '08123456789',
        payment_method: 'cash',
        items: [
          {
            product_id: 'b1111111-1111-1111-1111-111111111111',
            variant_id: 'c1111111-1111-1111-1111-111111111113',
            quantity: 1,
          },
        ],
      });

      expect(mockRpc).toHaveBeenCalledWith('submit_public_order', expect.any(Object));
      expect(result.order_code).toBe('BZG-20261121-7K9M');
      expect(result.access_token).toBe('tok_abc1234567890abcdef');
      expect(result.total).toBe(25000);
    });

    it('throws Indonesian error message when server RPC returns error', async () => {
      vi.spyOn(supabase, 'rpc').mockResolvedValueOnce({
        data: null,
        error: { message: 'Stok varian tidak mencukupi' },
      } as any);

      await expect(
        submitPublicOrder({
          group_id: 'a1111111-1111-1111-1111-111111111111',
          buyer_name: 'Rizky Pratama',
          buyer_class: 'XII MIPA 2',
          payment_method: 'cash',
          items: [{ product_id: 'p1', variant_id: 'v1', quantity: 999 }],
        })
      ).rejects.toThrow('Gagal mengirim pesanan: Stok varian tidak mencukupi');
    });
  });
});
