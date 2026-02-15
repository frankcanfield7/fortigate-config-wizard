import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../utils/api';
import type { AuditLogEntry } from '../../utils/api';

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  create: { label: 'Create', color: 'bg-status-online/20 text-status-online border-status-online/30' },
  update: { label: 'Update', color: 'bg-accent-cool/20 text-accent-cool border-accent-cool/30' },
  delete: { label: 'Delete', color: 'bg-status-offline/20 text-status-offline border-status-offline/30' },
  duplicate: { label: 'Duplicate', color: 'bg-status-degraded/20 text-status-degraded border-status-degraded/30' },
  export: { label: 'Export', color: 'bg-accent-primary/20 text-accent-primary border-accent-primary/30' },
  restore: { label: 'Restore', color: 'bg-accent-cool/20 text-accent-cool border-accent-cool/30' },
  login: { label: 'Login', color: 'bg-dark-border/20 text-dark-muted border-dark-border/30' },
  register: { label: 'Register', color: 'bg-dark-border/20 text-dark-muted border-dark-border/30' },
  create_from_template: { label: 'From Template', color: 'bg-accent-warm/20 text-accent-warm border-accent-warm/30' },
};

const AuditLogViewer: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['audit-logs', page, actionFilter, resourceFilter],
    queryFn: () =>
      adminApi.getAuditLogs(page, 50, {
        action: actionFilter || undefined,
        resource_type: resourceFilter || undefined,
      }),
  });

  const handleExportCsv = async () => {
    try {
      const blob = await adminApi.exportAuditLogs({
        action: actionFilter || undefined,
        resource_type: resourceFilter || undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'audit-logs.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to export audit logs');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getActionBadge = (action: string) => {
    const info = ACTION_LABELS[action] || { label: action, color: 'bg-dark-muted/20 text-dark-muted border-dark-muted/30' };
    return (
      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded border ${info.color}`}>
        {info.label}
      </span>
    );
  };

  const formatDetails = (details: Record<string, unknown> | null) => {
    if (!details || Object.keys(details).length === 0) return '—';
    return Object.entries(details)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-dark-border bg-dark-surface/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-dark-muted hover:text-dark-text transition-colors mb-2 flex items-center gap-2 text-sm tracking-wide"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Back to Dashboard
              </button>
              <h1 className="font-display text-2xl tracking-wide text-dark-text">Audit Log</h1>
              <p className="text-dark-muted text-sm mt-1 tracking-wide">
                Track all user actions and system events
              </p>
            </div>
            <button
              onClick={handleExportCsv}
              className="btn-secondary text-sm"
            >
              Export CSV
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="card-elevated rounded-lg p-4 mb-6 flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-dark-muted uppercase tracking-wide mb-1.5">
              Action
            </label>
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              className="input-field text-sm"
            >
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="duplicate">Duplicate</option>
              <option value="export">Export</option>
              <option value="restore">Restore</option>
              <option value="login">Login</option>
              <option value="register">Register</option>
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-dark-muted uppercase tracking-wide mb-1.5">
              Resource Type
            </label>
            <select
              value={resourceFilter}
              onChange={(e) => { setResourceFilter(e.target.value); setPage(1); }}
              className="input-field text-sm"
            >
              <option value="">All Types</option>
              <option value="configuration">Configuration</option>
              <option value="user">User</option>
              <option value="template">Template</option>
            </select>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-accent-primary border-t-transparent" />
            <p className="mt-4 text-dark-muted tracking-wide">Loading audit logs...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-status-offline/10 border border-status-offline/30 rounded-lg p-6 text-center">
            <p className="text-status-offline">
              {(error as any)?.response?.status === 403
                ? 'Admin privileges required to view audit logs'
                : 'Failed to load audit logs'}
            </p>
          </div>
        )}

        {/* Table */}
        {!isLoading && !error && data && (
          <div className="card-elevated rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-bg border-b border-dark-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark-muted tracking-wide">Timestamp</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark-muted tracking-wide">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark-muted tracking-wide">Action</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark-muted tracking-wide">Resource</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark-muted tracking-wide">Details</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark-muted tracking-wide">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {data.items.map((log: AuditLogEntry) => (
                    <tr key={log.id} className="hover:bg-dark-bg/50 transition-colors">
                      <td className="px-4 py-3 text-xs text-dark-muted whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-4 py-3 text-sm text-dark-text">
                        {log.username || `User #${log.user_id}`}
                      </td>
                      <td className="px-4 py-3">{getActionBadge(log.action)}</td>
                      <td className="px-4 py-3 text-sm text-dark-muted">
                        {log.resource_type}
                        {log.resource_id ? ` #${log.resource_id}` : ''}
                      </td>
                      <td className="px-4 py-3 text-xs text-dark-muted/70 max-w-xs truncate">
                        {formatDetails(log.details)}
                      </td>
                      <td className="px-4 py-3 text-xs text-dark-muted/70 font-mono">
                        {log.ip_address || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty */}
            {data.items.length === 0 && (
              <div className="px-6 py-12 text-center text-dark-muted">
                No audit log entries found
              </div>
            )}

            {/* Pagination */}
            {data.total > 50 && (
              <div className="bg-dark-bg border-t border-dark-border px-6 py-4 flex items-center justify-between">
                <div className="text-sm text-dark-muted">
                  Showing {(page - 1) * 50 + 1} to {Math.min(page * 50, data.total)} of {data.total} entries
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-secondary px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page * 50 >= data.total}
                    className="btn-secondary px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogViewer;
