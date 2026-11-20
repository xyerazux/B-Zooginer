-- Migration 003: Products and Multi-Dimensional Variants
-- Project: B-Zooginer Pre-Order Platform

-- 1. Create PRODUCTS table
CREATE TABLE public.products (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id           uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  name               text NOT NULL,
  slug               text NOT NULL,
  description        text,
  image_url          text,
  base_price         numeric(12,2) NOT NULL CHECK (base_price >= 0),
  variant_dimensions jsonb NOT NULL DEFAULT '[]'::jsonb,
  has_variants       boolean NOT NULL DEFAULT false,
  track_stock        boolean NOT NULL DEFAULT false,
  max_po_qty         integer CHECK (max_po_qty IS NULL OR max_po_qty > 0),
  is_active          boolean NOT NULL DEFAULT true,
  is_featured        boolean NOT NULL DEFAULT false,
  po_open_at         timestamptz,
  po_close_at        timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_id, slug),
  CONSTRAINT products_name_not_empty CHECK (char_length(trim(name)) > 0),
  CONSTRAINT products_slug_format CHECK (slug ~ '^[a-z0-9\-]+$'),
  CONSTRAINT products_po_window CHECK (
    po_close_at IS NULL OR po_open_at IS NULL OR po_close_at > po_open_at
  )
);

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 2. Create PRODUCT_VARIANTS table (multi-dimensional option combination matrix)
CREATE TABLE public.product_variants (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id       uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  title            text NOT NULL, -- e.g. "Ukuran: L, Rasa: Cokelat"
  attributes       jsonb NOT NULL DEFAULT '{}'::jsonb, -- e.g. {"ukuran": "L", "rasa": "Cokelat"}
  sku              text,
  price_adjustment numeric(12,2) NOT NULL DEFAULT 0.00,
  stock            integer CHECK (stock IS NULL OR stock >= 0),
  is_active        boolean NOT NULL DEFAULT true,
  sort_order       integer NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT variants_title_not_empty CHECK (char_length(trim(title)) > 0)
);

CREATE TRIGGER set_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
