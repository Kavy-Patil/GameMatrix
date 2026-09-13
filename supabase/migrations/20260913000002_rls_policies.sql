-- GameVault Row Level Security (RLS) Policies
-- Strict public/admin isolation enforced at the database layer

-- Enable RLS on all sensitive tables
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- 1. GAMES POLICIES
-- ========================================================
-- Public can read active catalog records
CREATE POLICY "Public games read access"
  ON public.games
  FOR SELECT
  USING (true);

-- Only verified admins can insert games
CREATE POLICY "Admins can insert games"
  ON public.games
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM public.admin_users)
  );

-- Only verified admins can update games
CREATE POLICY "Admins can update games"
  ON public.games
  FOR UPDATE
  USING (
    auth.uid() IN (SELECT id FROM public.admin_users)
  );

-- Only verified admins can delete games
CREATE POLICY "Admins can delete games"
  ON public.games
  FOR DELETE
  USING (
    auth.uid() IN (SELECT id FROM public.admin_users)
  );

-- ========================================================
-- 2. ENQUIRIES POLICIES
-- ========================================================
-- Public can submit an enquiry with strict field constraints
-- Enforces status = 'NEW' to prevent unauthorized status manipulation at the RLS boundary
CREATE POLICY "Public can submit enquiries with validation"
  ON public.enquiries
  FOR INSERT
  WITH CHECK (
    status = 'NEW' AND
    lower(contact_method) IN ('whatsapp', 'email', 'discord', 'telegram') AND
    length(customer_name) >= 2 AND
    length(customer_name) <= 100 AND
    length(contact_value) >= 3 AND
    length(contact_value) <= 120 AND
    length(game_id) >= 1 AND
    length(game_title) >= 1 AND
    length(message) <= 2000
  );

-- Only authorized admins can view enquiries (public receives 0 records)
CREATE POLICY "Only admins can view enquiries"
  ON public.enquiries
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM public.admin_users)
  );

-- Only authorized admins can update enquiry status
CREATE POLICY "Only admins can update enquiries"
  ON public.enquiries
  FOR UPDATE
  USING (
    auth.uid() IN (SELECT id FROM public.admin_users)
  );

-- Only authorized admins can delete enquiry records
CREATE POLICY "Only admins can delete enquiries"
  ON public.enquiries
  FOR DELETE
  USING (
    auth.uid() IN (SELECT id FROM public.admin_users)
  );

-- ========================================================
-- 3. ADMIN USERS POLICIES
-- ========================================================
-- Users can check their own admin status
CREATE POLICY "Users can check their own admin status"
  ON public.admin_users
  FOR SELECT
  USING (
    auth.uid() = id
  );

-- ========================================================
-- 4. ADMIN AUDIT LOGS POLICIES
-- ========================================================
-- Only authorized admins can inspect audit logs
CREATE POLICY "Only admins can view audit logs"
  ON public.admin_audit_logs
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM public.admin_users)
  );

-- Only authorized admins can write audit logs
CREATE POLICY "Admins can insert audit logs"
  ON public.admin_audit_logs
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM public.admin_users)
  );
