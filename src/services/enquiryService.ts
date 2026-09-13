import { Enquiry, EnquiryStatus, EnquirySubmissionInput, EnquirySubmissionResult } from '../types/enquiry';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { auditService } from './auditService';
import { checkSubmissionRateLimit, sanitizeInput, validateEnquiryInput } from '../utils/security';

/**
 * Generates an unguessable, randomized enquiry reference code.
 * Format: GV-XXXXXX (alphanumeric characters, avoiding ambiguous 0/O, 1/I).
 * Contains no customer-identifying information.
 */
export function generateEnquiryReference(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `GV-${code}`;
}

// Initial development seed records for offline fallback
const initialSeedEnquiries: Enquiry[] = [
  {
    id: 'enq_init_001',
    referenceNumber: 'GV-M7X2K9',
    gameId: 'gv-cyberpunk-2077',
    gameSlug: 'cyberpunk-2077',
    gameTitle: 'Cyberpunk 2077',
    platform: 'steam',
    customerName: 'Marcus Vance',
    contactMethod: 'whatsapp',
    contactValue: '+1 555 234 8901',
    message: 'Looking for the standard Steam edition for Windows 11. Can we verify launcher compatibility?',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'NEW',
  },
  {
    id: 'enq_init_002',
    referenceNumber: 'GV-R4W8T3',
    gameId: 'gv-elden-ring',
    gameSlug: 'elden-ring',
    gameTitle: 'Elden Ring',
    platform: 'steam',
    customerName: 'Elena Rostova',
    contactMethod: 'email',
    contactValue: 'elena.rostova@example.com',
    message: 'Interested in reserving a key. Please email me instructions for the direct activation voucher.',
    createdAt: new Date(Date.now() - 3600000 * 26).toISOString(),
    status: 'CONTACTED',
  },
  {
    id: 'enq_init_003',
    referenceNumber: 'GV-H9P5B4',
    gameId: 'gv-portal-2',
    gameSlug: 'portal-2',
    gameTitle: 'Portal 2',
    platform: 'steam',
    customerName: 'David Chen',
    contactMethod: 'phone',
    contactValue: '+1 555 892 4110',
    message: 'Confirming DRM-free GOG release compatibility with Linux Proton.',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    status: 'COMPLETED',
  },
];

// In-memory fallback store
const localEnquiries: Enquiry[] = [...initialSeedEnquiries];

/**
 * Maps database row to Enquiry domain model.
 */
function mapRowToEnquiry(row: any): Enquiry {
  return {
    id: row.id,
    referenceNumber: row.reference_code,
    gameId: row.game_id,
    gameSlug: row.game_slug || '',
    gameTitle: row.game_title,
    platform: row.platform,
    customerName: row.customer_name,
    contactMethod: row.contact_method,
    contactValue: row.contact_value,
    message: row.message || '',
    status: row.status as EnquiryStatus,
    createdAt: row.created_at,
    adminNotes: row.admin_notes || '',
  };
}

/**
 * Enquiry service abstraction.
 * Persists to PostgreSQL via Supabase when configured, with offline local fallback.
 *
 * STRICT CREDENTIAL PRIVACY:
 * Passwords, OTPs, recovery codes, and payment credentials are never accepted, stored, or logged.
 */
export const enquiryService = {
  /**
   * Submit a customer booking/enquiry request with server-boundary rate limiting and sanitization.
   */
  async submitEnquiry(input: EnquirySubmissionInput): Promise<EnquirySubmissionResult> {
    // 1. Anti-abuse rate limiting check
    const rateCheck = checkSubmissionRateLimit();
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: `Submission rate limit reached. Please wait ${rateCheck.retryAfterSeconds} seconds before submitting again.`,
      };
    }

    // 2. Server-boundary validation
    const validation = validateEnquiryInput({
      customerName: input.customerName,
      contactValue: input.contactValue,
      contactMethod: input.contactMethod,
      gameTitle: input.gameTitle,
      gameId: input.gameId,
      platform: input.platform,
      message: input.message,
    });
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error || 'Invalid enquiry input.',
      };
    }

    const referenceNumber = generateEnquiryReference();
    const id = `enq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const sanitizedName = sanitizeInput(input.customerName);
    const sanitizedContact = sanitizeInput(input.contactValue);
    const sanitizedTitle = sanitizeInput(input.gameTitle);
    const sanitizedMsg = sanitizeInput(input.message || '');
    const createdAt = new Date().toISOString();

    const newEnquiry: Enquiry = {
      id,
      referenceNumber,
      gameId: input.gameId,
      gameSlug: input.gameSlug,
      gameTitle: sanitizedTitle,
      platform: input.platform,
      customerName: sanitizedName,
      contactMethod: input.contactMethod,
      contactValue: sanitizedContact,
      message: sanitizedMsg,
      createdAt,
      status: 'NEW',
    };

    localEnquiries.unshift(newEnquiry);

    // 3. Persist to PostgreSQL via Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('enquiries').insert({
          id,
          reference_code: referenceNumber,
          game_id: input.gameId,
          game_slug: input.gameSlug,
          game_title: sanitizedTitle,
          platform: input.platform,
          customer_name: sanitizedName,
          contact_method: input.contactMethod,
          contact_value: sanitizedContact,
          message: sanitizedMsg,
          status: 'NEW',
          created_at: createdAt,
          updated_at: createdAt,
        });

        if (error) {
          // If server rate-limit or RLS validation rejected the insert, surface safe feedback
          if (error.code === 'P0001') {
            return {
              success: false,
              error: error.message || 'Submission rate limit reached. Please wait before submitting again.',
            };
          }
          console.warn('[EnquiryService] Database submission failed:', error.message);
        }
      } catch (err: any) {
        console.warn('[EnquiryService] Connection error during submission');
      }
    }

    return {
      success: true,
      referenceNumber,
      enquiry: newEnquiry,
    };
  },

  /**
   * Retrieves all submitted enquiries for authorized administrators.
   * Public or unauthenticated queries receive zero records.
   */
  async getAllEnquiries(): Promise<Enquiry[]> {
    if (!isSupabaseConfigured()) {
      return [...localEnquiries];
    }

    try {
      const { data, error } = await supabase
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Strict isolation: unauthenticated users or non-admins receive zero enquiry records
        return [];
      }

      if (data && data.length > 0) {
        return data.map(mapRowToEnquiry);
      }
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Retrieves a single enquiry record by ID for authorized administrators.
   */
  async getEnquiryById(id: string): Promise<Enquiry | undefined> {
    if (!isSupabaseConfigured()) {
      return localEnquiries.find((e) => e.id === id);
    }

    try {
      const { data, error } = await supabase
        .from('enquiries')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return undefined;
      }
      return mapRowToEnquiry(data);
    } catch {
      return undefined;
    }
  },

  /**
   * Updates the workflow status of an enquiry (NEW, CONTACTED, COMPLETED, CANCELLED).
   */
  async updateEnquiryStatus(id: string, status: EnquiryStatus): Promise<boolean> {
    // 1. Update local state
    const target = localEnquiries.find((e) => e.id === id);
    if (target) {
      target.status = status;
    }

    // 2. Log admin mutation
    auditService.logAction({
      action: 'ENQUIRY_STATUS_CHANGE',
      entityType: 'enquiry',
      entityId: id,
      details: { newStatus: status },
    });

    // 3. Persist to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('enquiries')
          .update({
            status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) {
          console.error('[EnquiryService] Supabase update status error:', error.message);
          return false;
        }
      } catch (err: any) {
        console.warn('[EnquiryService] Supabase update error:', err.message);
      }
    }

    return true;
  },

  /**
   * Updates internal administrator follow-up notes for an enquiry.
   */
  async updateEnquiryNotes(id: string, notes: string): Promise<boolean> {
    const target = localEnquiries.find((e) => e.id === id);
    if (target) {
      target.adminNotes = notes;
    }

    auditService.logAction({
      action: 'ENQUIRY_NOTE_UPDATE',
      entityType: 'enquiry',
      entityId: id,
      details: { notesLength: notes.length },
    });

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('enquiries')
          .update({
            admin_notes: notes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) {
          console.error('[EnquiryService] Supabase update notes error:', error.message);
          return false;
        }
      } catch (err: any) {
        console.warn('[EnquiryService] Supabase update notes exception:', err.message);
      }
    }

    return true;
  },

  /**
   * Retrieves paginated enquiries with search, contact method, and status filtering.
   */
  async getEnquiries(filters: {
    page?: number;
    pageSize?: number;
    status?: string;
    search?: string;
    contactMethod?: string;
  } = {}): Promise<{ enquiries: Enquiry[]; total: number }> {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 15;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    if (!isSupabaseConfigured()) {
      let list = [...localEnquiries];
      if (filters.status && filters.status !== 'ALL') {
        list = list.filter((e) => e.status === filters.status);
      }
      if (filters.contactMethod && filters.contactMethod !== 'ALL') {
        list = list.filter((e) => e.contactMethod === filters.contactMethod);
      }
      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        list = list.filter(
          (e) =>
            e.referenceNumber.toLowerCase().includes(q) ||
            e.customerName.toLowerCase().includes(q) ||
            e.gameTitle.toLowerCase().includes(q) ||
            e.contactValue.toLowerCase().includes(q)
        );
      }
      return {
        enquiries: list.slice(from, from + pageSize),
        total: list.length,
      };
    }

    try {
      let query = supabase.from('enquiries').select('*', { count: 'exact' });

      if (filters.status && filters.status !== 'ALL') {
        query = query.eq('status', filters.status);
      }
      if (filters.contactMethod && filters.contactMethod !== 'ALL') {
        query = query.eq('contact_method', filters.contactMethod);
      }
      if (filters.search && filters.search.trim()) {
        const q = filters.search.trim();
        query = query.or(
          `reference_code.ilike.%${q}%,customer_name.ilike.%${q}%,game_title.ilike.%${q}%,contact_value.ilike.%${q}%`
        );
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        return {
          enquiries: localEnquiries.slice(from, from + pageSize),
          total: localEnquiries.length,
        };
      }

      const mapped = (data || []).map(mapRowToEnquiry);
      return {
        enquiries: mapped,
        total: count ?? mapped.length,
      };
    } catch {
      return {
        enquiries: localEnquiries.slice(from, from + pageSize),
        total: localEnquiries.length,
      };
    }
  },

  /**
   * Retrieves the count of submitted enquiries in this session.
   */
  getSessionEnquiriesCount(): number {
    return localEnquiries.length;
  },
};
