# GameVault — Digital PC Game Catalog & Enquiry Showcase

GameVault is a premium dark-themed PC digital game catalog and manual enquiry platform. Customers browse canonical PC titles across major launchers and submit manual booking/enquiry requests.

**Important Operational Model:**
* Payment, order confirmation, and product delivery are processed **manually** outside the website.
* **Strict Zero-Price & Zero-Stock Policy:** GameVault contains NO prices, discounts, stock counters, inventory quantities, checkout, or automated fulfillment.
* **Zero Credential Collection:** GameVault NEVER collects or stores customer passwords, OTPs, recovery codes, credit cards, or platform account credentials.

---

## Production Backend Setup (Supabase + PostgreSQL)

### 1. Create a Supabase Project
1. Navigate to [Supabase](https://supabase.com) and create a new project.
2. Note your **Project URL** and **Public Anon Key** from **Project Settings → API**.

### 2. Configure Environment Variables
Copy the template configuration:
```bash
cp .env.example .env
```
Fill in your public Supabase variables in `.env`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```
> **Security Notice:** NEVER commit `SUPABASE_SERVICE_ROLE_KEY` or database passwords to `.env` or frontend files. Only the public anonymous key is exposed to Vite.

### 3. Run Database Migrations
Execute the SQL migration scripts in order using the Supabase SQL Editor or Supabase CLI:
1. `supabase/migrations/20260913000001_create_schema.sql` (Creates `games`, `enquiries`, `admin_users`, `admin_audit_logs`)
2. `supabase/migrations/20260913000002_rls_policies.sql` (Enforces Row Level Security with strict public field constraints)
3. `supabase/migrations/20260913000003_indexes.sql` (Creates performance indexes)
4. `supabase/migrations/20260913000004_security_hardening.sql` (Server-side anti-spam trigger, tamper-resistant audit logs, admin privilege protection)

### 4. Seed Canonical PC Game Catalog (805 Titles)
Execute the seed script to populate the 805 canonical titles with verified CDN artwork:
```bash
npm run seed-supabase
```
Alternatively, run `supabase/seed.sql` directly in the Supabase SQL Editor.

### 5. Provision the Administrator Account
1. In Supabase Dashboard → **Authentication → Users**, create an admin account (e.g. `admin@gamevault.com`).
2. Copy the user's generated UUID.
3. In **SQL Editor**, grant administrator authorization:
```sql
INSERT INTO public.admin_users (id, email, role)
VALUES ('<user-uuid-here>', 'admin@gamevault.com', 'admin');
```
> **RBAC Security:** Authentication alone does NOT grant access. An account MUST have a matching entry in `admin_users` to pass Row Level Security checks and access `/admin`.

### 6. Start the Application
```bash
npm run dev
```
* Public Storefront: `http://localhost:3000/`
* Admin Security Gateway: `http://localhost:3000/admin/login`

---

## Security Architecture & Abuse Protection

* **Database Row Level Security (RLS):**
  * `games`: Public read access; mutations strictly restricted to `admin_users`.
  * `enquiries`: Public insert check requires `status = 'NEW'`, valid `contact_method`, and strict string length bounds. Inspection, update, and deletion strictly restricted to `admin_users` (public queries receive 0 records).
  * `admin_users`: Explicit read-own-record policy (`auth.uid() = id`). Trigger `trg_prevent_admin_self_promotion` forbids client-initiated mutations.
  * `admin_audit_logs`: Append-only audit trail. Trigger `trg_prevent_audit_log_modification` rejects any UPDATE or DELETE operations, guaranteeing immutability.
* **Server-Side Anti-Spam & Abuse Throttling:**
  * Trigger `trg_enquiry_submission_safety` enforces a strict server-side rate limit (max 3 enquiries per 60s per contact) and detects duplicates (max 1 enquiry per title per contact within 120s), neutralizing curl/incognito bypasses.
  * Client-side brute-force throttling locks admin login for 60 seconds after 5 consecutive failed attempts.
* **Application Boundary Defenses:**
  * Deep input sanitization strips script tags, HTML entities, and malicious event handlers.
  * Image URL security whitelist prevents `javascript:` and arbitrary executable URL schemes.
  * Content Security Policy (CSP) active without `'unsafe-eval'`, enforcing `frame-ancestors 'none'` and strict cross-origin referrer policy.
  * Secret scanning and `.gitignore` protect against credential leakage.

---

## Verification & Security Audit Commands

```bash
# Automated Security Audit Suite (13 categories verified)
npm run test-security

# TypeScript compilation (must return 0 errors)
npx tsc --noEmit

# Production build
npm run build

# Seed verification
npm run seed-supabase
```
