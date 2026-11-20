# B-Zooginer Testing Guide

> Testing strategy, test cases, and tooling reference for the B-Zooginer pre-order management platform.

---

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Tool Stack](#tool-stack)
3. [Test Directory Structure](#test-directory-structure)
4. [Unit Tests — Vitest + React Testing Library](#unit-tests--vitest--react-testing-library)
5. [Integration Tests — Key User Flows](#integration-tests--key-user-flows)
6. [E2E Tests — Playwright (Plan)](#e2e-tests--playwright-plan)
7. [RLS Policy Tests — Supabase Local Dev](#rls-policy-tests--supabase-local-dev)
8. [Form Validation Test Cases](#form-validation-test-cases)
9. [Edge Cases](#edge-cases)
10. [CI Pipeline](#ci-pipeline)
11. [Coverage Targets](#coverage-targets)

---

## Testing Philosophy

| Level | Purpose | Speed | Required |
|-------|---------|-------|----------|
| **Unit** | Isolate functions, hooks, and pure components | Fast (<5s total) | Yes |
| **Integration** | Verify user flows with mocked Supabase | Moderate (10–30s) | Yes |
| **E2E** | Full browser + real Supabase local | Slow (1–5 min) | Planned (Phase 7) |
| **RLS** | Confirm row-level security in Postgres | Moderate | Yes (before deploy) |

> [!IMPORTANT]
> Tests must run without an internet connection and without a real Supabase project. All Supabase calls are mocked in unit/integration tests. RLS tests run against `supabase start` local stack.

---

## Tool Stack

| Tool | Version | Purpose |
|------|---------|---------|
| [Vitest](https://vitest.dev) | `^1.x` | Unit and integration test runner |
| [React Testing Library](https://testing-library.com/docs/react-testing-library) | `^14.x` | DOM queries and user event simulation |
| [`@testing-library/user-event`](https://github.com/testing-library/user-event) | `^14.x` | Realistic user interaction simulation |
| [`@testing-library/jest-dom`](https://github.com/testing-library/jest-dom) | `^6.x` | Additional DOM matchers |
| [`vitest-fetch-mock`](https://github.com/IanVS/vitest-fetch-mock) | `^0.x` | Fetch mocking for edge function calls |
| [MSW (Mock Service Worker)](https://mswjs.io) | `^2.x` | Supabase REST API mocking |
| [Playwright](https://playwright.dev) | `^1.x` | E2E browser automation (Phase 7) |
| `supabase` CLI | latest | Local Supabase stack for RLS tests |

### Installation

```bash
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom msw vitest-fetch-mock
npm install -D @playwright/test  # Phase 7 only
```

### Vitest Config

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['src/test/**', 'src/types/**', 'src/lib/supabase.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Test Setup File

```ts
// src/test/setup.ts
import '@testing-library/jest-dom'
import { afterEach, beforeAll, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './mocks/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
})
afterAll(() => server.close())
```

---

## Test Directory Structure

```
src/
  test/
    setup.ts                    # Global test setup
    utils.tsx                   # Custom render helpers, test factories
    mocks/
      server.ts                 # MSW server instance
      handlers/
        auth.ts                 # Auth endpoint mocks
        groups.ts               # Groups REST mocks
        products.ts             # Products REST mocks
        orders.ts               # Orders REST mocks
      factories/
        order.factory.ts        # createMockOrder(), createMockOrderItem()
        product.factory.ts      # createMockProduct(), createMockVariant()
        group.factory.ts        # createMockGroup()
        profile.factory.ts      # createMockProfile()

  components/
    ui/
      Button.test.tsx
      StatusBadge.test.tsx
    shared/
      EmptyState.test.tsx
      SkeletonTable.test.tsx
    public/
      ProductCard.test.tsx
      GroupCard.test.tsx
      OrderForm.test.tsx
    admin/
      OrderTable.test.tsx
      ProductForm.test.tsx

  hooks/
    useOrderStatus.test.ts
    useStockCheck.test.ts

  services/
    orders.service.test.ts
    products.service.test.ts

  lib/
    orderCode.test.ts
    formatCurrency.test.ts
    validation.test.ts

tests/
  e2e/                          # Playwright tests (Phase 7)
    public-order.spec.ts
    admin-login.spec.ts
    admin-order-manage.spec.ts

supabase/
  tests/
    rls/
      orders.rls.test.sql
      products.rls.test.sql
      profiles.rls.test.sql
```

---

## Unit Tests — Vitest + React Testing Library

### Custom Render Helper

```tsx
// src/test/utils.tsx
import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
}

function AllProviders({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: AllProviders, ...options })
}
```

### Mock Data Factories

```ts
// src/test/mocks/factories/order.factory.ts
import type { Order, OrderItem } from '@/types'

let seq = 1

export function createMockOrder(overrides?: Partial<Order>): Order {
  const id = `order-${seq++}`
  return {
    id,
    order_code: `BZG-20261121-${id.toUpperCase()}`,
    access_token: 'mock-access-token-64chars-random-hex-string',
    group_id: 'group-1',
    buyer_name: 'Budi Santoso',
    buyer_class: 'XI IPA 2',
    whatsapp: '081234567890',
    source: 'public',
    order_date: '2026-11-21',
    payment_method: 'transfer',
    payment_status: 'unpaid',
    order_status: 'new',
    total: 85000,
    notes: null,
    created_by: null,
    created_at: '2026-11-21T10:00:00Z',
    updated_at: '2026-11-21T10:00:00Z',
    ...overrides,
  }
}

export function createMockOrderItem(overrides?: Partial<OrderItem>): OrderItem {
  return {
    id: `item-${seq++}`,
    order_id: 'order-1',
    product_id: 'product-1',
    variant_id: null,
    product_name_snapshot: 'Nasi Goreng Spesial',
    variant_snapshot: null,
    variant_attributes_snapshot: {},
    quantity: 2,
    unit_price_snapshot: 25000,
    subtotal: 50000,
    ...overrides,
  }
}
```

### Component Tests

#### StatusBadge

```tsx
// src/components/ui/StatusBadge.test.tsx
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { StatusBadge } from './StatusBadge'

describe('StatusBadge', () => {
  it.each([
    ['new', 'Baru'],
    ['confirmed', 'Dikonfirmasi'],
    ['cancelled', 'Dibatalkan'],
    ['completed', 'Selesai'],
  ] as const)('renders correct label for %s status', (status, label) => {
    renderWithProviders(<StatusBadge status={status} />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('applies correct color class for cancelled status', () => {
    renderWithProviders(<StatusBadge status="cancelled" />)
    const badge = screen.getByText('Dibatalkan').parentElement
    expect(badge).toHaveClass('bg-red-50', 'text-red-700')
  })

  it('renders an icon alongside the label', () => {
    renderWithProviders(<StatusBadge status="new" />)
    const badge = screen.getByText('Baru').parentElement
    expect(badge?.querySelector('svg')).toBeInTheDocument()
  })
})
```

#### OrderForm (Public)

```tsx
// src/components/public/OrderForm.test.tsx
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/utils'
import { OrderForm } from './OrderForm'
import { createMockProduct } from '@/test/mocks/factories/product.factory'

describe('OrderForm', () => {
  const product = createMockProduct()
  const user = userEvent.setup()

  it('renders all required fields', () => {
    renderWithProviders(<OrderForm product={product} />)
    expect(screen.getByLabelText(/nama pembeli/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/kelas/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/whatsapp/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/metode pembayaran/i)).toBeInTheDocument()
  })

  it('shows validation errors when submitted empty', async () => {
    renderWithProviders(<OrderForm product={product} />)
    await user.click(screen.getByRole('button', { name: /pesan/i }))
    await waitFor(() => {
      expect(screen.getByText(/nama wajib diisi/i)).toBeInTheDocument()
      expect(screen.getByText(/kelas wajib diisi/i)).toBeInTheDocument()
    })
  })

  it('submits successfully with valid data', async () => {
    const onSuccess = vi.fn()
    renderWithProviders(<OrderForm product={product} onSuccess={onSuccess} />)

    await user.type(screen.getByLabelText(/nama pembeli/i), 'Budi Santoso')
    await user.type(screen.getByLabelText(/kelas/i), 'XI IPA 2')
    await user.type(screen.getByLabelText(/whatsapp/i), '081234567890')
    await user.click(screen.getByLabelText(/transfer/i))
    await user.click(screen.getByRole('button', { name: /pesan/i }))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce())
  })
})
```

#### ProductCard

```tsx
// src/components/public/ProductCard.test.tsx
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { ProductCard } from './ProductCard'
import { createMockProduct } from '@/test/mocks/factories/product.factory'

describe('ProductCard', () => {
  it('renders product name and price', () => {
    const product = createMockProduct({ name: 'Nasi Goreng', base_price: 25000 })
    renderWithProviders(<ProductCard product={product} />)
    expect(screen.getByText('Nasi Goreng')).toBeInTheDocument()
    expect(screen.getByText(/25\.000/)).toBeInTheDocument()
  })

  it('renders image in correct 1:1 aspect ratio wrapper', () => {
    const product = createMockProduct()
    renderWithProviders(<ProductCard product={product} />)
    const img = screen.getByRole('img')
    const wrapper = img.parentElement
    expect(wrapper).toHaveClass('aspect-square')
  })

  it('renders fallback icon when image_url is null', () => {
    const product = createMockProduct({ image_url: null })
    renderWithProviders(<ProductCard product={product} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    // Lucide ImageOff icon present
    expect(document.querySelector('svg')).toBeInTheDocument()
  })
})
```

### Hook Tests

```ts
// src/hooks/useStockCheck.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { createWrapper } from '@/test/utils'
import { useStockCheck } from './useStockCheck'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'

describe('useStockCheck', () => {
  it('returns in-stock when stock > 0', async () => {
    server.use(
      http.get('*/rest/v1/product_variants', () =>
        HttpResponse.json([{ id: 'v1', stock: 10, is_active: true }])
      )
    )
    const { result } = renderHook(() => useStockCheck('v1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.inStock).toBe(true)
    expect(result.current.remaining).toBe(10)
  })

  it('returns out-of-stock when stock is 0', async () => {
    server.use(
      http.get('*/rest/v1/product_variants', () =>
        HttpResponse.json([{ id: 'v1', stock: 0, is_active: true }])
      )
    )
    const { result } = renderHook(() => useStockCheck('v1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.inStock).toBe(false)
  })
})
```

### Utility Tests

```ts
// src/lib/orderCode.test.ts
import { generateOrderCode, parseOrderCode } from './orderCode'

describe('generateOrderCode', () => {
  it('generates code with BZG prefix', () => {
    expect(generateOrderCode()).toMatch(/^BZG-/)
  })

  it('includes today\'s date segment', () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    expect(generateOrderCode()).toContain(today)
  })

  it('generates unique codes on repeated calls', () => {
    const codes = Array.from({ length: 100 }, () => generateOrderCode())
    const unique = new Set(codes)
    expect(unique.size).toBe(100)
  })

  it('code length is predictable', () => {
    // Format: BZG-YYYYMMDD-XXXX (4 random chars)
    expect(generateOrderCode().length).toBe(18)
  })
})

// src/lib/formatCurrency.test.ts
import { formatCurrency } from './formatCurrency'

describe('formatCurrency', () => {
  it('formats integer amounts', () => {
    expect(formatCurrency(25000)).toBe('Rp 25.000')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('Rp 0')
  })

  it('formats large amounts', () => {
    expect(formatCurrency(1250000)).toBe('Rp 1.250.000')
  })
})
```

---

## Integration Tests — Key User Flows

Integration tests render the full component tree with mocked network calls and verify complete user interactions.

### Flow 1: Public Order Submission

**File:** `src/components/public/OrderFlow.integration.test.tsx`

**Scenario:** A public user browses a group, selects a product, fills the order form, and receives a confirmation with an order code.

```
Steps:
1. Render <GroupPage groupSlug="koperasi-siswa" />
2. MSW returns mock group + products list
3. User clicks on product card → navigates to product detail
4. User selects variant (if applicable), sets quantity
5. User fills: nama, kelas, whatsapp, payment_method=transfer
6. User submits form
7. MSW returns { order_code: "BZG-20261121-A3X9" } from edge function
8. Assert: success toast shown with order code
9. Assert: form reset / redirect to confirmation page
```

**Assertions:**
- [ ] Form cannot be submitted with missing required fields
- [ ] Quantity input respects `max_po_qty` constraint
- [ ] Order code displayed in `font-mono` after success
- [ ] "Pesan Lagi" button appears post-submission

### Flow 2: Admin Login

**File:** `src/pages/LoginPage.integration.test.tsx`

**Scenario:** A user signs in as GROUP_ADMIN and is redirected to the correct dashboard.

```
Steps:
1. Render <LoginPage />
2. User types email + password
3. MSW mocks Supabase auth.signInWithPassword → returns session
4. MSW mocks profile fetch → returns { role: 'group_admin', group_id: 'group-1' }
5. Assert: redirect to /admin/group/group-1
6. Repeat with master_admin role → redirect to /admin/master
```

**Assertions:**
- [ ] Wrong password → error message displayed (not raw Supabase error)
- [ ] Network error → user-friendly error message
- [ ] Loading state shows spinner in button during sign-in
- [ ] Successful login clears the form

### Flow 3: Admin Creates Product

**File:** `src/pages/admin/ProductFormPage.integration.test.tsx`

**Scenario:** A GROUP_ADMIN creates a new product with variants.

```
Steps:
1. Render <ProductFormPage /> with mocked auth context (group_admin, group-1)
2. Fill: name, description, base_price=25000
3. Toggle has_variants=true
4. Add variant: "Ukuran" / "Small" / price_adjustment=0 / stock=20
5. Add variant: "Ukuran" / "Large" / price_adjustment=5000 / stock=15
6. Upload image → MSW mocks Supabase Storage upload
7. Submit
8. MSW returns created product { id: "prod-1", ... }
9. Assert: toast "Produk berhasil dibuat"
10. Assert: redirect to /admin/group/group-1/products
```

**Assertions:**
- [ ] Name field required; validates on submit
- [ ] Price must be a positive number
- [ ] Variant rows can be added and removed
- [ ] Image preview shows after file selection
- [ ] Submit button disabled during mutation

### Flow 4: Admin Updates Order Status

**File:** `src/pages/admin/OrderDetailPage.integration.test.tsx`

```
Steps:
1. Render <OrderDetailPage orderId="order-1" />
2. MSW returns order with status=new, payment_status=unpaid
3. Admin clicks "Konfirmasi Pesanan"
4. Confirmation dialog appears
5. Admin clicks "Ya, Konfirmasi"
6. MSW patches order → returns status=confirmed
7. Assert: StatusBadge updates to "Dikonfirmasi"
8. Assert: Toast success shown
```

---

## E2E Tests — Playwright (Plan)

> [!NOTE]
> E2E tests are planned for **Phase 7** and are not required for the initial build. The plan below defines the target spec files and scenarios.

### Setup

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // sequential to avoid order code conflicts
  retries: 1,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

### Planned Spec Files

| File | Scenario | Priority |
|------|----------|----------|
| `public-browse.spec.ts` | Browse groups → view products → no login required | P1 |
| `public-order.spec.ts` | Full order submission flow, receive order code | P1 |
| `public-order-lookup.spec.ts` | Look up order status by order code | P2 |
| `admin-login.spec.ts` | Login as master_admin, login as group_admin | P1 |
| `admin-order-manage.spec.ts` | Confirm, cancel, complete an order | P1 |
| `admin-product-create.spec.ts` | Create product with image and variants | P2 |
| `admin-payment-mark.spec.ts` | Mark payment as paid, verify status update | P1 |
| `admin-export.spec.ts` | Export orders to Excel, verify file download | P2 |
| `mobile-responsive.spec.ts` | Mobile viewport: nav drawer, table card view | P2 |

### Sample E2E Spec (Public Order)

```ts
// tests/e2e/public-order.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Public Order Flow', () => {
  test('user can place an order for a product', async ({ page }) => {
    await page.goto('/')
    
    // Browse to a group
    await page.click('[data-testid="group-card-koperasi-siswa"]')
    await expect(page).toHaveURL(/\/koperasi-siswa/)
    
    // Click first product
    await page.click('[data-testid="product-card"]:first-child')
    
    // Fill order form
    await page.fill('[name="buyer_name"]', 'Budi Santoso')
    await page.fill('[name="buyer_class"]', 'XI IPA 2')
    await page.fill('[name="whatsapp"]', '081234567890')
    await page.click('[value="transfer"]')
    
    // Submit
    await page.click('[data-testid="submit-order"]')
    
    // Verify order code shown
    await expect(page.locator('[data-testid="order-code"]')).toBeVisible()
    await expect(page.locator('[data-testid="order-code"]')).toHaveText(/BZG-/)
  })
})
```

---

## RLS Policy Tests — Supabase Local Dev

RLS tests run directly against a local Supabase instance using `pgTAP` or raw SQL sessions.

### Prerequisites

```bash
supabase start
# Local Studio: http://localhost:54323
# DB connection: postgresql://postgres:postgres@localhost:54322/postgres
```

### Test Structure

RLS tests simulate different JWT contexts by using `SET LOCAL role` and `SET LOCAL "request.jwt.claims"`.

```sql
-- supabase/tests/rls/orders.rls.test.sql

BEGIN;

-- Helper: set JWT claims for a user
CREATE OR REPLACE FUNCTION set_auth_context(user_id uuid, role text, group_id uuid DEFAULT NULL)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM set_config('request.jwt.claims',
    json_build_object(
      'sub', user_id::text,
      'role', role,
      'group_id', COALESCE(group_id::text, '')
    )::text,
    true
  );
  SET LOCAL role TO authenticated;
END;
$$;

-- Seed test data
INSERT INTO public.groups (id, name, slug, is_published) VALUES
  ('g1', 'Kelompok A', 'kelompok-a', true),
  ('g2', 'Kelompok B', 'kelompok-b', true);

INSERT INTO public.profiles (id, role, group_id) VALUES
  ('master-uid', 'master_admin', NULL),
  ('admin-g1-uid', 'group_admin', 'g1'),
  ('admin-g2-uid', 'group_admin', 'g2');

INSERT INTO public.orders (id, order_code, group_id, buyer_name, buyer_class, source, payment_method, payment_status, order_status, total)
VALUES
  ('ord-g1', 'BZG-TEST-0001', 'g1', 'Budi', 'X IPA', 'public', 'transfer', 'unpaid', 'new', 50000),
  ('ord-g2', 'BZG-TEST-0002', 'g2', 'Ani', 'X IPS', 'public', 'cash', 'unpaid', 'new', 30000);

-- TEST 1: master_admin can read all orders
SELECT set_auth_context('master-uid'::uuid, 'master_admin');
DO $$
BEGIN
  ASSERT (SELECT count(*) FROM public.orders) = 2,
    'master_admin should see all orders';
END;
$$;

-- TEST 2: group_admin sees only own group
SELECT set_auth_context('admin-g1-uid'::uuid, 'group_admin', 'g1'::uuid);
DO $$
BEGIN
  ASSERT (SELECT count(*) FROM public.orders) = 1,
    'group_admin should see only their group orders';
  ASSERT (SELECT group_id FROM public.orders LIMIT 1) = 'g1'::uuid,
    'group_admin order must belong to g1';
END;
$$;

-- TEST 3: anon cannot SELECT orders directly
SET LOCAL role TO anon;
DO $$
BEGIN
  ASSERT (SELECT count(*) FROM public.orders) = 0,
    'anon should not be able to SELECT orders';
END;
$$;

-- TEST 4: group_admin cannot UPDATE payment_status
SELECT set_auth_context('admin-g1-uid'::uuid, 'group_admin', 'g1'::uuid);
DO $$
DECLARE
  rows_affected int;
BEGIN
  UPDATE public.orders SET payment_status = 'paid' WHERE id = 'ord-g1';
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  ASSERT rows_affected = 0,
    'group_admin should not be able to update payment_status';
END;
$$;

-- TEST 5: master_admin can update payment_status
SELECT set_auth_context('master-uid'::uuid, 'master_admin');
DO $$
DECLARE
  rows_affected int;
BEGIN
  UPDATE public.orders SET payment_status = 'paid' WHERE id = 'ord-g1';
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  ASSERT rows_affected = 1,
    'master_admin should be able to update payment_status';
END;
$$;

-- TEST 6: anon cannot INSERT directly into orders
SET LOCAL role TO anon;
DO $$
BEGIN
  BEGIN
    INSERT INTO public.orders (order_code, group_id, buyer_name, buyer_class, source, payment_method, payment_status, order_status, total)
    VALUES ('BZG-HACK-9999', 'g1', 'Hacker', 'X', 'public', 'cash', 'unpaid', 'new', 0);
    ASSERT false, 'anon INSERT should have been rejected';
  EXCEPTION WHEN insufficient_privilege THEN
    -- Expected
  END;
END;
$$;

ROLLBACK;
```

### Running RLS Tests

```bash
# Run against local Supabase
psql postgresql://postgres:postgres@localhost:54322/postgres \
  -f supabase/tests/rls/orders.rls.test.sql

# Or via Supabase CLI (when pgTAP integration added)
supabase test db
```

---

## Form Validation Test Cases

All validation is defined with Zod and tested via unit tests against the schema directly.

### Order Form Schema

```ts
// src/lib/validation/orderSchema.ts
import { z } from 'zod'

export const orderSchema = z.object({
  buyer_name: z.string().min(2, 'Nama minimal 2 karakter').max(100),
  buyer_class: z.string().min(2, 'Kelas wajib diisi').max(20),
  whatsapp: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^(08|\+628)\d{8,11}$/.test(val),
      'Nomor WhatsApp tidak valid'
    ),
  payment_method: z.enum(['cash', 'transfer'], {
    errorMap: () => ({ message: 'Pilih metode pembayaran' }),
  }),
  quantity: z.number().min(1, 'Minimal 1 item').max(100, 'Maksimal 100 per pesanan'),
  variant_id: z.string().uuid().optional().nullable(),
  notes: z.string().max(500, 'Catatan maksimal 500 karakter').optional(),
})
```

### Validation Unit Tests

```ts
// src/lib/validation/orderSchema.test.ts
import { orderSchema } from './orderSchema'

describe('orderSchema', () => {
  const validData = {
    buyer_name: 'Budi Santoso',
    buyer_class: 'XI IPA 2',
    whatsapp: '081234567890',
    payment_method: 'transfer' as const,
    quantity: 2,
  }

  it('passes with valid data', () => {
    expect(orderSchema.safeParse(validData).success).toBe(true)
  })

  describe('buyer_name', () => {
    it('rejects names shorter than 2 chars', () => {
      const result = orderSchema.safeParse({ ...validData, buyer_name: 'A' })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('Nama minimal 2 karakter')
    })

    it('rejects empty string', () => {
      const result = orderSchema.safeParse({ ...validData, buyer_name: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('whatsapp', () => {
    it.each(['081234567890', '+6281234567890', '0812345678901'])(
      'accepts valid number: %s',
      (num) => {
        expect(orderSchema.safeParse({ ...validData, whatsapp: num }).success).toBe(true)
      }
    )

    it.each(['123456', 'abcdefghij', '0712345678'])(
      'rejects invalid number: %s',
      (num) => {
        expect(orderSchema.safeParse({ ...validData, whatsapp: num }).success).toBe(false)
      }
    )

    it('allows empty/undefined whatsapp', () => {
      const { whatsapp: _, ...withoutWa } = validData
      expect(orderSchema.safeParse(withoutWa).success).toBe(true)
    })
  })

  describe('quantity', () => {
    it('rejects zero', () => {
      expect(orderSchema.safeParse({ ...validData, quantity: 0 }).success).toBe(false)
    })

    it('rejects values over 100', () => {
      const result = orderSchema.safeParse({ ...validData, quantity: 101 })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('Maksimal 100 per pesanan')
    })
  })

  describe('payment_method', () => {
    it('rejects unknown payment method', () => {
      expect(orderSchema.safeParse({ ...validData, payment_method: 'bitcoin' }).success).toBe(false)
    })
  })
})
```

### Product Form Validation Cases

| Field | Rule | Expected Error |
|-------|------|---------------|
| `name` | required, min 3, max 100 | "Nama produk wajib diisi" |
| `base_price` | required, > 0, integer | "Harga harus lebih dari 0" |
| `max_po_qty` | optional, integer ≥ 1 | "Jumlah harus minimal 1" |
| `slug` | auto-generated, URL-safe | — (computed, not user-input) |
| `po_open_at` | optional, must be before `po_close_at` | "Tanggal buka harus sebelum tutup" |
| variant `value` | required when has_variants=true | "Nama varian wajib diisi" |
| variant `stock` | nullable (null = unlimited), if set ≥ 0 | "Stok tidak boleh negatif" |

---

## Edge Cases

### Edge Case 1: Concurrent Stock Deduction

**Risk:** Two users submit an order for the last item simultaneously. Without protection, both orders succeed and stock goes negative.

**Solution:** Atomic DB function with stock check.

```sql
-- supabase/functions/sql/deduct_stock.sql
CREATE OR REPLACE FUNCTION deduct_variant_stock(
  p_variant_id uuid,
  p_quantity    int
)
RETURNS TABLE (success bool, remaining int)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stock   int;
BEGIN
  -- Row-level lock
  SELECT stock INTO v_stock
  FROM product_variants
  WHERE id = p_variant_id
  FOR UPDATE;

  IF v_stock IS NULL THEN
    -- Stock tracking disabled for this variant
    RETURN QUERY SELECT true, NULL::int;
    RETURN;
  END IF;

  IF v_stock < p_quantity THEN
    RETURN QUERY SELECT false, v_stock;
    RETURN;
  END IF;

  UPDATE product_variants
  SET stock = stock - p_quantity
  WHERE id = p_variant_id;

  RETURN QUERY SELECT true, (v_stock - p_quantity);
END;
$$;
```

**Test:**

```ts
// src/services/orders.service.test.ts — concurrent stock test
it('rejects second order when only 1 item in stock', async () => {
  // Mock: first call succeeds (stock=1→0)
  // Second call: deduct_stock returns { success: false, remaining: 0 }
  server.use(
    http.post('*/rest/v1/rpc/deduct_variant_stock', async ({ request }) => {
      const body = await request.json() as { p_quantity: number }
      callCount++
      if (callCount === 1) return HttpResponse.json({ success: true, remaining: 0 })
      return HttpResponse.json({ success: false, remaining: 0 })
    })
  )
  
  const [result1, result2] = await Promise.all([
    submitOrder({ variantId: 'v1', quantity: 1 }),
    submitOrder({ variantId: 'v1', quantity: 1 }),
  ])
  
  const successes = [result1, result2].filter(r => r.success)
  expect(successes).toHaveLength(1)
})
```

### Edge Case 2: Duplicate Order Code

**Risk:** Order code generation (timestamp + random) could collide under high load.

**Solution:** `order_code` column has `UNIQUE` constraint. Edge function retries on conflict.

```ts
// src/services/orders.service.ts
async function createOrderWithRetry(payload: OrderPayload, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const orderCode = generateOrderCode()
    const { data, error } = await supabase
      .from('orders')
      .insert({ ...payload, order_code: orderCode })
      .select()
      .single()

    if (!error) return data

    // 23505 = unique_violation in PostgreSQL
    if (error.code === '23505' && attempt < maxAttempts) continue

    throw error
  }
}
```

**Test:**

```ts
it('retries on duplicate order code and succeeds on second attempt', async () => {
  let callCount = 0
  server.use(
    http.post('*/rest/v1/orders', () => {
      callCount++
      if (callCount === 1) {
        return HttpResponse.json({ code: '23505', message: 'duplicate key' }, { status: 409 })
      }
      return HttpResponse.json(createMockOrder({ order_code: 'BZG-RETRY-0001' }), { status: 201 })
    })
  )

  const result = await createOrderWithRetry(mockPayload)
  expect(callCount).toBe(2)
  expect(result.order_code).toBe('BZG-RETRY-0001')
})

it('throws after max retry attempts', async () => {
  server.use(
    http.post('*/rest/v1/orders', () =>
      HttpResponse.json({ code: '23505' }, { status: 409 })
    )
  )
  await expect(createOrderWithRetry(mockPayload, 3)).rejects.toThrow()
})
```

### Edge Case 3: Session Expiry Mid-Flow

**Test:** Admin is filling a product form when their session token expires. Expected: they are redirected to login with a toast "Sesi habis, silakan masuk kembali" and form data is preserved via session storage.

### Edge Case 4: Image Upload Failure

**Test:** User attempts to upload a 3 MB file. Expected: client-side validation rejects before upload with "Ukuran file maksimal 2 MB". Upload never reaches Supabase Storage.

### Edge Case 5: Group PO Status = Closed

**Test:** A product's group has `po_status = 'closed'`. Expected: order form is replaced with an informational banner ("Pre-order sudah ditutup"). Submit button is not rendered.

---

## CI Pipeline

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  unit-integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v4

  rls:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
      - run: supabase start
      - run: supabase db push
      - run: psql $DATABASE_URL -f supabase/tests/rls/orders.rls.test.sql
      - run: psql $DATABASE_URL -f supabase/tests/rls/products.rls.test.sql
      - run: supabase stop
```

### package.json Scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test"
  }
}
```

---

## Coverage Targets

| Module | Target |
|--------|--------|
| `src/lib/**` (utils, validation) | ≥ 90% |
| `src/services/**` | ≥ 80% |
| `src/hooks/**` | ≥ 75% |
| `src/components/ui/**` | ≥ 70% |
| `src/components/public/**` | ≥ 70% |
| `src/components/admin/**` | ≥ 60% |
| `src/pages/**` | Integration-covered; unit ≥ 40% |

> [!TIP]
> Run `npm run test:ui` during development for Vitest's interactive browser UI — it shows coverage inline and re-runs affected tests on save.
