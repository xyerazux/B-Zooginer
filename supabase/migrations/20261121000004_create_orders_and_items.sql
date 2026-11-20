-- Migration 004: Orders and Order Line Items
-- Project: B-Zooginer Pre-Order Platform

-- 1. Create ORDERS table
CREATE TABLE public.orders (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code      text NOT NULL UNIQUE,
  access_token    text NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  group_id        uuid NOT NULL REFERENCES public.groups(id) ON DELETE RESTRICT,
  buyer_name      text NOT NULL,
  buyer_class     text NOT NULL,
  whatsapp        text,
  source          public.order_source_type NOT NULL DEFAULT 'public',
  order_date      date NOT NULL DEFAULT CURRENT_DATE,
  payment_method  public.payment_method_type NOT NULL,
  payment_status  public.payment_status_type NOT NULL DEFAULT 'unpaid',
  order_status    public.order_status_type NOT NULL DEFAULT 'new',
  total           numeric(12,2) NOT NULL CHECK (total >= 0),
  notes           text,
  created_by      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT orders_buyer_name_not_empty CHECK (char_length(trim(buyer_name)) > 0),
  CONSTRAINT orders_buyer_class_not_empty CHECK (char_length(trim(buyer_class)) > 0),
  CONSTRAINT orders_code_format CHECK (order_code ~ '^BZG-[0-9]{8}-[A-Z0-9]{4}$')
);

CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 2. Create ORDER_ITEMS table
CREATE TABLE public.order_items (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                    uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id                  uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  variant_id                  uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_name_snapshot       text NOT NULL,
  variant_snapshot            text,
  variant_attributes_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  unit_price_snapshot         numeric(12,2) NOT NULL CHECK (unit_price_snapshot >= 0),
  quantity                    integer NOT NULL CHECK (quantity > 0),
  subtotal                    numeric(12,2) NOT NULL CHECK (subtotal >= 0),
  created_at                  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT order_items_subtotal_check CHECK (subtotal = unit_price_snapshot * quantity)
);
