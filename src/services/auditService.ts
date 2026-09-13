import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export type AuditActionType =
  | 'GAME_CREATE'
  | 'GAME_UPDATE'
  | 'GAME_DELETE'
  | 'ENQUIRY_STATUS_CHANGE'
  | 'ENQUIRY_NOTE_UPDATE'
  | 'CATALOG_BULK_IMPORT'
  | 'CATALOG_EXPORT'
  | 'ARTWORK_UPDATE';

export type AuditEntityType = 'game' | 'enquiry' | 'catalog' | 'artwork';

export interface AuditLogEntry {
  action: AuditActionType;
  entityType: AuditEntityType;
  entityId: string;
  details?: Record<string, any>;
}

export interface AuditLogRecord extends AuditLogEntry {
  id: string;
  adminUserId: string | null;
  createdAt: string;
}

export interface AuditLogFilters {
  page?: number;
  pageSize?: number;
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// In-memory fallback for local offline development
const localAuditLogs: AuditLogRecord[] = [];

export const auditService = {
  /**
   * Log an administrative mutation to PostgreSQL via Supabase or local memory.
   */
  async logAction(entry: AuditLogEntry): Promise<void> {
    const timestamp = new Date().toISOString();
    const id = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    if (!isSupabaseConfigured()) {
      localAuditLogs.unshift({
        id,
        ...entry,
        adminUserId: 'local-dev-admin',
        createdAt: timestamp,
      });
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from('admin_audit_logs').insert({
        admin_user_id: user?.id || null,
        action: entry.action,
        entity_type: entry.entityType,
        entity_id: entry.entityId,
        details: entry.details || {},
        created_at: timestamp,
      });

      if (error) {
        console.warn('[AuditService] Supabase insert warning:', error.message);
      }

      // Also mirror to local buffer for immediate UI reactivity
      localAuditLogs.unshift({
        id,
        ...entry,
        adminUserId: user?.id || 'admin',
        createdAt: timestamp,
      });
    } catch (err) {
      // Non-blocking: audit log errors should not crash the main admin mutation
      console.warn('[AuditService] Failed to persist audit log:', err);
    }
  },

  /**
   * Retrieve recent audit logs for administration inspection.
   */
  async getRecentLogs(limit = 20): Promise<AuditLogRecord[]> {
    const result = await this.getAuditLogs({ page: 1, pageSize: limit });
    return result.logs;
  },

  /**
   * Paginated audit log retrieval with composable filters.
   */
  async getAuditLogs(filters: AuditLogFilters = {}): Promise<{
    logs: AuditLogRecord[];
    total: number;
  }> {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 15;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    if (!isSupabaseConfigured()) {
      let filtered = [...localAuditLogs];

      if (filters.action && filters.action !== 'ALL') {
        filtered = filtered.filter((l) => l.action === filters.action);
      }
      if (filters.entityType && filters.entityType !== 'ALL') {
        filtered = filtered.filter((l) => l.entityType === filters.entityType);
      }
      if (filters.startDate) {
        filtered = filtered.filter((l) => l.createdAt >= filters.startDate!);
      }
      if (filters.endDate) {
        filtered = filtered.filter((l) => l.createdAt <= filters.endDate!);
      }
      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        filtered = filtered.filter(
          (l) =>
            l.action.toLowerCase().includes(q) ||
            l.entityId.toLowerCase().includes(q) ||
            JSON.stringify(l.details || {}).toLowerCase().includes(q)
        );
      }

      return {
        logs: filtered.slice(from, from + pageSize),
        total: filtered.length,
      };
    }

    try {
      let query = supabase
        .from('admin_audit_logs')
        .select('*', { count: 'exact' });

      if (filters.action && filters.action !== 'ALL') {
        query = query.eq('action', filters.action);
      }
      if (filters.entityType && filters.entityType !== 'ALL') {
        query = query.eq('entity_type', filters.entityType);
      }
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
      if (filters.search && filters.search.trim()) {
        query = query.ilike('entity_id', `%${filters.search.trim()}%`);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.warn('[AuditService] Supabase fetch error, fallback to local buffer:', error.message);
        return {
          logs: localAuditLogs.slice(from, from + pageSize),
          total: localAuditLogs.length,
        };
      }

      const mapped: AuditLogRecord[] = (data || []).map((row: any) => ({
        id: row.id,
        action: row.action,
        entityType: row.entity_type,
        entityId: row.entity_id,
        adminUserId: row.admin_user_id,
        details: row.details,
        createdAt: row.created_at,
      }));

      return {
        logs: mapped,
        total: count ?? mapped.length,
      };
    } catch {
      return {
        logs: localAuditLogs.slice(from, from + pageSize),
        total: localAuditLogs.length,
      };
    }
  },
};
