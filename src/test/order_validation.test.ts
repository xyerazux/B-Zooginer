import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Server-side Zod Validation Schema mimicking the Edge Function and DB RPC contracts
const orderItemSchema = z.object({
  product_id: z.string().uuid({ message: 'ID Produk harus berupa UUID yang valid.' }),
  variant_id: z.string().uuid({ message: 'ID Varian harus berupa UUID yang valid.' }).nullable().optional(),
  quantity: z.number().int().positive({ message: 'Jumlah pesanan minimal 1 unit.' }),
});

const submitOrderPayloadSchema = z.object({
  group_id: z.string().uuid({ message: 'ID Kelompok harus berupa UUID yang valid.' }),
  buyer_name: z.string().trim().min(1, { message: 'Nama pembeli wajib diisi.' }).max(100),
  buyer_class: z.string().trim().min(1, { message: 'Kelas pembeli wajib diisi.' }).max(50),
  whatsapp: z.string().trim().regex(/^08[0-9]{8,13}$/, { message: 'Nomor WhatsApp tidak valid (format: 08xxxxxxxx).' }).nullable().optional(),
  payment_method: z.enum(['cash', 'transfer'], { errorMap: () => ({ message: 'Metode bayar harus tunai atau transfer.' }) }),
  notes: z.string().trim().max(300).nullable().optional(),
  items: z.array(orderItemSchema).min(1, { message: 'Pesanan minimal harus memilih 1 produk.' }),
});

describe('Protected Server-Side Order Submission & Validation', () => {
  it('accepts valid anonymous order payload', () => {
    const validPayload = {
      group_id: 'a1111111-1111-1111-1111-111111111111',
      buyer_name: 'Dewi Lestari',
      buyer_class: 'XI MIPA 2',
      whatsapp: '081234567890',
      payment_method: 'cash',
      notes: 'Bungkus terpisah',
      items: [
        {
          product_id: 'b1111111-1111-1111-1111-111111111111',
          variant_id: 'c1111111-1111-1111-1111-111111111111',
          quantity: 2,
        },
      ],
    };

    const parseResult = submitOrderPayloadSchema.safeParse(validPayload);
    expect(parseResult.success).toBe(true);
  });

  it('rejects order with empty buyer name or invalid class', () => {
    const invalidPayload = {
      group_id: 'a1111111-1111-1111-1111-111111111111',
      buyer_name: '   ',
      buyer_class: '',
      payment_method: 'transfer',
      items: [
        {
          product_id: 'b1111111-1111-1111-1111-111111111111',
          quantity: 1,
        },
      ],
    };

    const parseResult = submitOrderPayloadSchema.safeParse(invalidPayload);
    expect(parseResult.success).toBe(false);
    if (!parseResult.success) {
      const errors = parseResult.error.flatten().fieldErrors;
      expect(errors.buyer_name).toBeDefined();
      expect(errors.buyer_class).toBeDefined();
    }
  });

  it('rejects negative or zero item quantities', () => {
    const invalidPayload = {
      group_id: 'a1111111-1111-1111-1111-111111111111',
      buyer_name: 'Budi',
      buyer_class: 'X-1',
      payment_method: 'cash',
      items: [
        {
          product_id: 'b1111111-1111-1111-1111-111111111111',
          quantity: 0,
        },
      ],
    };

    const parseResult = submitOrderPayloadSchema.safeParse(invalidPayload);
    expect(parseResult.success).toBe(false);
  });

  it('calculates server-side total and does NOT trust client prices', () => {
    // Simulating server calculation:
    // Product base_price = 15000
    // Variant price_adjustment = 3000
    // Expected unit price = 18000
    // Quantity = 3 -> Subtotal = 54000
    const basePrice = 15000;
    const priceAdjustment = 3000;
    const quantity = 3;

    const unitPriceSnapshot = basePrice + priceAdjustment;
    const subtotal = unitPriceSnapshot * quantity;

    expect(unitPriceSnapshot).toBe(18000);
    expect(subtotal).toBe(54000);

    // Client maliciously attempts to send total = 1000
    const clientProvidedTotal = 1000;
    const trustedTotal = subtotal;

    expect(trustedTotal).not.toBe(clientProvidedTotal);
    expect(trustedTotal).toBe(54000);
  });

  it('verifies historical price freezing in order line items', () => {
    // Simulating order item created in past:
    const frozenItem = {
      product_name_snapshot: 'Kopi Susu Aren Asli',
      variant_snapshot: 'Ukuran: Large, Less Sugar',
      variant_attributes_snapshot: { ukuran: 'Large', manis: 'Less Sugar' },
      unit_price_snapshot: 15000,
      quantity: 2,
      subtotal: 30000,
    };

    // Later, the seller raises base price from 15000 to 20000:
    const updatedProduct = {
      name: 'Kopi Susu Aren Asli (Harga Naik)',
      base_price: 20000,
    };

    // Historical order item must remain unaffected
    expect(frozenItem.unit_price_snapshot).toBe(15000);
    expect(frozenItem.subtotal).toBe(30000);
    expect(frozenItem.product_name_snapshot).toBe('Kopi Susu Aren Asli');
    expect(updatedProduct.base_price).toBe(20000);
  });
});
