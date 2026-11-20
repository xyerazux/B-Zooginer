-- Migration 001: Extensions and Enumerations
-- Project: B-Zooginer Pre-Order Platform

-- Enable required cryptographic and UUID extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enumeration: User roles in system
CREATE TYPE public.role_type AS ENUM (
  'master_admin',
  'group_admin'
);

-- Enumeration: Group Pre-Order status
CREATE TYPE public.po_status_type AS ENUM (
  'open',
  'coming_soon',
  'closed'
);

-- Enumeration: Source of order entry
CREATE TYPE public.order_source_type AS ENUM (
  'master_admin',
  'group_admin',
  'public'
);

-- Enumeration: Payment method
CREATE TYPE public.payment_method_type AS ENUM (
  'cash',
  'transfer'
);

-- Enumeration: Payment status
CREATE TYPE public.payment_status_type AS ENUM (
  'unpaid',
  'paid'
);

-- Enumeration: Order lifecycle status
CREATE TYPE public.order_status_type AS ENUM (
  'new',
  'confirmed',
  'cancelled',
  'completed'
);

-- Helper trigger function to maintain updated_at timestamps
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
