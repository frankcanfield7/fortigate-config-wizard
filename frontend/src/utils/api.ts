import { supabase } from '../lib/supabase';
import type {
  Configuration,
  ConfigurationCreate,
  ConfigurationUpdate,
  ConfigurationVersion,
  PaginatedResponse,
} from '../types';

// Type helper for RPC calls (Supabase's strict typing can be overly restrictive)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rpc = supabase.rpc.bind(supabase) as (fn: string, args?: Record<string, unknown>) => any;

// Configuration API
export const configApi = {
  getAll: async (page = 1, perPage = 20): Promise<PaginatedResponse<Configuration>> => {
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    // Get total count
    const { count } = await supabase
      .from('configurations')
      .select('*', { count: 'exact', head: true })
      .eq('is_template', false);

    // Get paginated data
    const { data, error } = await supabase
      .from('configurations')
      .select('*')
      .eq('is_template', false)
      .order('updated_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      items: (data || []) as Configuration[],
      total: count || 0,
      page,
      per_page: perPage,
      pages: Math.ceil((count || 0) / perPage),
    };
  },

  getById: async (id: number): Promise<Configuration> => {
    const { data, error } = await supabase
      .from('configurations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Configuration;
  },

  create: async (configData: ConfigurationCreate): Promise<Configuration> => {
    const { data, error } = await rpc('create_configuration_with_version', {
      p_name: configData.name,
      p_description: configData.description || null,
      p_config_type: configData.config_type,
      p_data_json: configData.data,
    });

    if (error) throw error;

    // rpc returns an array, get the first item
    const result = Array.isArray(data) ? data[0] : data;
    return result as Configuration;
  },

  update: async (id: number, configData: ConfigurationUpdate): Promise<Configuration> => {
    // First get current config to merge data
    const current = await configApi.getById(id);

    const { data, error } = await rpc('update_configuration_with_version', {
      p_id: id,
      p_name: configData.name || current.name,
      p_description: configData.description !== undefined ? configData.description : current.description,
      p_data_json: configData.data || current.data_json,
      p_change_description: configData.change_description || 'Updated',
    });

    if (error) throw error;

    const result = Array.isArray(data) ? data[0] : data;
    return result as Configuration;
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('configurations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  duplicate: async (id: number): Promise<Configuration> => {
    const { data, error } = await rpc('duplicate_configuration', { p_id: id });

    if (error) throw error;

    const result = Array.isArray(data) ? data[0] : data;
    return result as Configuration;
  },

  export: async (
    id: number,
    format: 'cli' | 'json' | 'yaml'
  ): Promise<{ data: string; filename: string }> => {
    const config = await configApi.getById(id);

    // For CLI format, the generators handle this client-side
    // For JSON/YAML, return the data_json
    const exportData = JSON.stringify(config.data_json, null, 2);
    const filename = `${config.name.replace(/\s+/g, '-').toLowerCase()}.${format === 'cli' ? 'txt' : format}`;

    return { data: exportData, filename };
  },

  getVersions: async (id: number): Promise<{ versions: ConfigurationVersion[] }> => {
    const { data, error } = await supabase
      .from('configuration_versions')
      .select('*')
      .eq('configuration_id', id)
      .order('version_number', { ascending: false });

    if (error) throw error;
    return { versions: (data || []) as ConfigurationVersion[] };
  },

  getVersion: async (id: number, versionNumber: number): Promise<ConfigurationVersion> => {
    const { data, error } = await supabase
      .from('configuration_versions')
      .select('*')
      .eq('configuration_id', id)
      .eq('version_number', versionNumber)
      .single();

    if (error) throw error;
    return data as ConfigurationVersion;
  },

  restoreVersion: async (id: number, versionId: number): Promise<Configuration> => {
    const { data, error } = await rpc('restore_configuration_version', {
      p_config_id: id,
      p_version_id: versionId,
    });

    if (error) throw error;

    const result = Array.isArray(data) ? data[0] : data;
    return result as Configuration;
  },

  makeTemplate: async (id: number): Promise<Configuration> => {
    const { data, error } = await supabase
      .from('configurations')
      .update({ is_template: true } as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Configuration;
  },
};

// Template API
export const templateApi = {
  getAll: async (): Promise<Configuration[]> => {
    const { data, error } = await supabase
      .from('configurations')
      .select('*')
      .eq('is_template', true)
      .order('name');

    if (error) throw error;
    return (data || []) as Configuration[];
  },

  createFromTemplate: async (templateId: number, name: string): Promise<Configuration> => {
    const { data, error } = await rpc('create_from_template', {
      p_template_id: templateId,
      p_name: name,
    });

    if (error) throw error;

    const result = Array.isArray(data) ? data[0] : data;
    return result as Configuration;
  },
};

// Audit log entry type (for admin API)
export interface AuditLogEntry {
  id: number;
  user_id: string | null;
  username: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

// Admin API
export const adminApi = {
  getAuditLogs: async (
    page = 1,
    perPage = 50,
    filters?: { action?: string; user_id?: string; resource_type?: string }
  ): Promise<PaginatedResponse<AuditLogEntry>> => {
    const offset = (page - 1) * perPage;

    const { data, error } = await rpc('get_audit_logs', {
      p_limit: perPage,
      p_offset: offset,
      p_action: filters?.action || null,
      p_user_id: filters?.user_id || null,
    });

    if (error) throw error;

    const items = (data || []) as AuditLogEntry[];

    return {
      items,
      total: items.length < perPage ? offset + items.length : offset + perPage + 1,
      page,
      per_page: perPage,
      pages: items.length < perPage ? page : page + 1,
    };
  },

  exportAuditLogs: async (
    filters?: { action?: string; user_id?: string; resource_type?: string }
  ): Promise<Blob> => {
    const { data, error } = await rpc('get_audit_logs', {
      p_limit: 10000,
      p_offset: 0,
      p_action: filters?.action || null,
      p_user_id: filters?.user_id || null,
    });

    if (error) throw error;

    const items = (data || []) as AuditLogEntry[];
    const headers = ['id', 'username', 'action', 'resource_type', 'resource_id', 'details', 'created_at'];
    const csvContent = [
      headers.join(','),
      ...items.map((item: AuditLogEntry) =>
        headers.map(h => {
          const value = item[h as keyof AuditLogEntry];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value).replace(/,/g, ';');
          return String(value).replace(/,/g, ';');
        }).join(',')
      )
    ].join('\n');

    return new Blob([csvContent], { type: 'text/csv' });
  },
};

// Auth API is now handled by AuthContext directly using supabase.auth
// Keeping this export for backwards compatibility but it's not used
export const authApi = {
  login: async () => { throw new Error('Use useAuth().login() instead'); },
  register: async () => { throw new Error('Use useAuth().register() instead'); },
  logout: async () => { throw new Error('Use useAuth().logout() instead'); },
  getCurrentUser: async () => { throw new Error('Use useAuth().user instead'); },
  refreshToken: async () => { throw new Error('Token refresh is handled automatically by Supabase'); },
};
