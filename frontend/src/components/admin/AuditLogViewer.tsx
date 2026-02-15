import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../utils/api';
import type { AuditLogEntry } from '../../utils/api';

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  create: { label: 'Create', color: 'bg-green-700/20 text-green-400 border-green-700/30' },
  update: { label: 'Update', color: 'bg-blue-700/20 text-blue-400 border-blue-700/30' },
  delete: { label: 'Delete', color: 'bg-red-700/20 text-red-400 border-red-700/30' },
  duplicate: { label: 'Duplicate', color: 'bg-yellow-700/20 text-yellow-400 border-yellow-700/30' },
  export: { label: 'Export', color: 'bg-purple-700/20 text-purple-400 border-purple-700/30' },
  restore: { label: 'Restore', color: 'bg-cyan-700/20 text-cyan-400 border-cyan-700/30' },
  login: { label: 'Login', color: 'bg-neutral-700/20 text-neutral-400 border-neutral-700/30' },
  register: { label: 'Register', color: 'bg-neutral-700/20 text-neutral-400 border-neutral-700/30' },
  create_from_template: { label: 'From Template', color: 'bg-amber-700/20 text-amber-400 border-amber-700/30' },
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
    const info = ACTION_LABELS[action] || { label: action, color: 'bg-gray-700/20 text-gray-400 border-gray-700/30' };
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
    <div className="min-h-screen bg-[#171717]">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-900 to-red-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-white hover:text-[#262626] transition-colors mb-2 flex items-center gap-2"
              >
                <span>←</span> Back to Dashboard
              </button>
              <h1 className="text-3xl font-semibold text-white">Audit Log</h1>
              <p className="text-white/70 text-sm mt-1">
                Track all user actions and system events
              </p>
            </div>
            <button
              onClick={handleExportCsv}
              className="px-5 py-2.5 bg-neutral-200 text-neutral-900 rounded-lg hover:bg-neutral-300 transition-colors font-medium text-sm"
            >
              Export CSV
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-[#262626] border-2 border-[#404040] rounded-xl p-4 mb-6 flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1.5">
              Action
            </label>
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2.5 bg-[#171717] border-2 border-[#404040] rounded-lg text-white focus:border-red-700 focus:outline-none text-sm"
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
            <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1.5">
              Resource Type
            </label>
            <select
              value={resourceFilter}
              onChange={(e) => { setResourceFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2.5 bg-[#171717] border-2 border-[#404040] rounded-lg text-white focus:border-red-700 focus:outline-none text-sm"
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
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-700 border-t-transparent" />
            <p className="mt-4 text-gray-400">Loading audit logs...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border-2 border-red-500 rounded-xl p-6 text-center">
            <p className="text-red-300">
              {(error as any)?.response?.status === 403
                ? 'Admin privileges required to view audit logs'
                : 'Failed to load audit logs'}
            </p>
          </div>
        )}

        {/* Table */}
        {!isLoading && !error && data && (
          <div className="bg-[#262626] border-2 border-[#404040] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#171717] border-b-2 border-[#404040]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-red-400 uppercase">Timestamp</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-red-400 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-red-400 uppercase">Action</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-red-400 uppercase">Resource</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-red-400 uppercase">Details</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-red-400 uppercase">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#404040]">
                  {data.items.map((log: AuditLogEntry) => (
                    <tr key={log.id} className="hover:bg-[#171717]/50 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-4 py-3 text-sm text-white">
                        {log.username || `User #${log.user_id}`}
                      </td>
                      <td className="px-4 py-3">{getActionBadge(log.action)}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {log.resource_type}
                        {log.resource_id ? ` #${log.resource_id}` : ''}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">
                        {formatDetails(log.details)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                        {log.ip_address || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty */}
            {data.items.length === 0 && (
              <div className="px-6 py-12 text-center text-gray-400">
                No audit log entries found
              </div>
            )}

            {/* Pagination */}
            {data.total > 50 && (
              <div className="bg-[#171717] border-t-2 border-[#404040] px-6 py-4 flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Showing {(page - 1) * 50 + 1} to {Math.min(page * 50, data.total)} of {data.total} entries
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-[#262626] border border-[#404040] rounded text-white hover:bg-[#404040] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page * 50 >= data.total}
                    className="px-4 py-2 bg-[#262626] border border-[#404040] rounded text-white hover:bg-[#404040] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
