-- GameVault Production PostgreSQL Schema
-- Phase 5: Production Backend + Secure Admin Authentication + Database

-- STRICT ZERO-PRICE & ZERO-STOCK POLICY ENFORCED:
-- No price, discount, currency, stock, inventory, or quantity columns.

-- 1. Games Table (Canonical PC Game Catalog)
CREATE TABLE IF NOT EXISTS public.games (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  platforms TEXT[] NOT NULL DEFAULT '{}',
  genres TEXT[] NOT NULL DEFAULT '{}',
  description TEXT DEFAULT '',
  short_description TEXT DEFAULT '',
  developer TEXT DEFAULT '',
  publisher TEXT DEFAULT '',
  release_date TEXT DEFAULT '',
  rating NUMERIC DEFAULT 4.5,
  cover_image TEXT DEFAULT '',
  hero_image TEXT DEFAULT '',
  screenshots TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  popular BOOLEAN DEFAULT false,
  badges TEXT[] DEFAULT '{}',
  searchable_tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Enquiries Table (Manual Booking & Enquiry Records)
-- STRICT CREDENTIAL PRIVACY: No passwords, OTPs, recovery codes, or payment data.
CREATE TABLE IF NOT EXISTS public.enquiries (
  id TEXT PRIMARY KEY,
  reference_code TEXT UNIQUE NOT NULL,
  game_id TEXT NOT NULL,
  game_slug TEXT NOT NULL,
  game_title TEXT NOT NULL,
  platform TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  contact_method TEXT NOT NULL,
  contact_value TEXT NOT NULL,
  message TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'COMPLETED', 'CANCELLED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Admin Users Table (Role-Based Authorization)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Admin Audit Logs (Administrative Mutation Audit Trail)
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
