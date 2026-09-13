-- GameVault Security Hardening & Abuse Protection Migration
-- Phase 6: Server-side anti-spam, tamper-resistant audit trail, and admin privilege protection

-- ========================================================
-- 1. SERVER-SIDE ENQUIRY RATE LIMITING & ANTI-SPAM TRIGGER
-- ========================================================
-- Protects against automated script attacks, brute-force spam, and duplicate submissions.
-- Bypassing frontend JavaScript will still trigger this database-level protection.

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
  NEW.created_at := NOW();
  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if already exists and recreate
DROP TRIGGER IF EXISTS trg_enquiry_submission_safety ON public.enquiries;
CREATE TRIGGER trg_enquiry_submission_safety
BEFORE INSERT ON public.enquiries
FOR EACH ROW EXECUTE FUNCTION public.check_enquiry_submission_safety();


-- ========================================================
-- 2. TAMPER-RESISTANT AUDIT TRAIL IMMUTABILITY TRIGGER
-- ========================================================
-- Guarantees that historical audit log entries cannot be rewritten or erased by any user.

CREATE OR REPLACE FUNCTION public.prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit log records are strictly immutable and cannot be modified or deleted (Tamper-Resistant Audit Trail).'
    USING ERRCODE = 'P0001';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_audit_log_modification ON public.admin_audit_logs;
CREATE TRIGGER trg_prevent_audit_log_modification
BEFORE UPDATE OR DELETE ON public.admin_audit_logs
FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_log_modification();


-- ========================================================
-- 3. ADMIN PRIVILEGE ESCALATION DEFENSE TRIGGER
-- ========================================================
-- Restricts admin_users mutations exclusively to service_role and postgres superusers.
-- Prevents ordinary authenticated users from self-promoting or manipulating admin records.

CREATE OR REPLACE FUNCTION public.prevent_admin_self_promotion()
RETURNS TRIGGER AS $$
BEGIN
  -- Verify the execution role is a trusted system/service_role
  IF (current_user NOT IN ('service_role', 'postgres', 'supabase_admin')) THEN
    RAISE EXCEPTION 'Self-service creation or modification of administrator privileges is strictly forbidden.'
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_admin_self_promotion ON public.admin_users;
CREATE TRIGGER trg_prevent_admin_self_promotion
BEFORE INSERT OR UPDATE OR DELETE ON public.admin_users
FOR EACH ROW EXECUTE FUNCTION public.prevent_admin_self_promotion();
