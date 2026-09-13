-- GameVault Admin Enhancements Migration
-- Phase 8: Real-World Admin + Catalog Operations
-- Adds internal admin notes to enquiries, reinforces safety triggers, and adds performance indexes

-- 1. Add internal admin_notes to public.enquiries
ALTER TABLE public.enquiries 
ADD COLUMN IF NOT EXISTS admin_notes TEXT DEFAULT '';

-- 2. Update enquiry submission safety trigger to force empty admin_notes on public insert
CREATE OR REPLACE FUNCTION public.check_enquiry_submission_safety()
RETURNS TRIGGER AS $$
DECLARE
  recent_submissions_count INTEGER;
  duplicate_submissions_count INTEGER;
BEGIN
  -- 1. Anti-Spam: Maximum 3 enquiries per 60 seconds per contact_value
  SELECT COUNT(*) INTO recent_submissions_count
  FROM public.enquiries
  WHERE contact_value = NEW.contact_value
    AND created_at > (NOW() - INTERVAL '60 seconds');

  IF recent_submissions_count >= 3 THEN
    RAISE EXCEPTION 'Rate limit exceeded: Maximum 3 enquiries per 60 seconds. Please wait before submitting again.'
      USING ERRCODE = 'P0001';
  END IF;

  -- 2. Duplicate Detection: Max 1 enquiry for same game and contact within 120 seconds
  SELECT COUNT(*) INTO duplicate_submissions_count
  FROM public.enquiries
  WHERE contact_value = NEW.contact_value
    AND game_id = NEW.game_id
    AND created_at > (NOW() - INTERVAL '120 seconds');

  IF duplicate_submissions_count >= 1 THEN
    RAISE EXCEPTION 'Duplicate enquiry detected: An enquiry for this title was already submitted recently.'
      USING ERRCODE = 'P0001';
  END IF;

  -- 3. Enforce Server-Controlled Defaults (Prevent client tampering)
  NEW.status := 'NEW';
  NEW.admin_notes := ''; -- Guarantee public users cannot inject internal admin notes
  NEW.created_at := NOW();
  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Performance Indexes for Admin Queries & Audit Inspections
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_admin_user_id ON public.admin_audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_status_created ON public.enquiries(status, created_at DESC);
