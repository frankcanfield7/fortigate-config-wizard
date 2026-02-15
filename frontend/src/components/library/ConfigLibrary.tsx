import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { configApi } from '../../utils/api';
import VersionHistory from './VersionHistory';

const ConfigLibrary: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [exportingId, setExportingId] = useState<number | null>(null);
  const [historyConfig, setHistoryConfig] = useState<{ id: number; name: string } | null>(null);

  // Fetch configurations
  const { data, isLoading, error } = useQuery({
    queryKey: ['configurations', page],
    queryFn: () => configApi.getAll(page, 20),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => configApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configurations'] });
      setDeleteConfirmId(null);
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to delete configuration');
    },
  });

  // Duplicate mutation
  const duplicateMutation = useMutation({
    mutationFn: (id: number) => configApi.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configurations'] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to duplicate configuration');
    },
  });

  // Save as template mutation
  const templateMutation = useMutation({
    mutationFn: (id: number) => configApi.makeTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configurations'] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to save as template');
    },
  });

  // Export handler
  const handleExport = async (id: number, format: 'cli' | 'json' | 'yaml') => {
    try {
      const result = await configApi.export(id, format);

      const blob = new Blob([result.data], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setExportingId(null);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to export configuration');
    }
  };

  // Filter configurations by search term
  const filteredConfigs = data?.items.filter(
    (config) =>
      config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.config_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Config type icons and labels
  const getConfigTypeInfo = (type: string) => {
    const types: Record<string, { label: string; color: string }> = {
      ipsec: { label: 'IPSEC Remote Access', color: 'bg-accent-primary/10 text-accent-primary border-accent-primary/30' },
      sdwan: { label: 'SD-WAN', color: 'bg-accent-cool/10 text-accent-cool border-accent-cool/30' },
      firewall: { label: 'Firewall', color: 'bg-status-offline/10 text-status-offline border-status-offline/30' },
      routing: { label: 'Routing', color: 'bg-status-online/10 text-status-online border-status-online/30' },
      interfaces: { label: 'Interfaces', color: 'bg-status-degraded/10 text-status-degraded border-status-degraded/30' },
    };
    return types[type] || { label: type, color: 'bg-dark-muted/10 text-dark-muted border-dark-muted/30' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
              <h1 className="font-display text-2xl tracking-wide text-dark-text">
                Configuration Library
              </h1>
              <p className="text-dark-muted text-sm mt-1 tracking-wide">
                Manage your saved FortiGate configurations
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard/wizard')}
              className="btn-primary"
            >
              + New Configuration
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="card-elevated rounded-lg p-4 mb-6">
          <input
            type="text"
            placeholder="Search configurations by name, type, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-accent-primary border-t-transparent"></div>
            <p className="mt-4 text-dark-muted tracking-wide">Loading configurations...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-status-offline/10 border border-status-offline/30 rounded-lg p-6 text-center">
            <p className="text-status-offline">Failed to load configurations</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredConfigs?.length === 0 && (
          <div className="card-elevated rounded-lg p-12 text-center">
            <h2 className="font-display text-xl tracking-wide text-dark-text/90 mb-2">
              {searchTerm ? 'No matching configurations' : 'No configurations yet'}
            </h2>
            <p className="text-dark-muted mb-6">
              {searchTerm
                ? 'Try adjusting your search criteria'
                : 'Create your first configuration to get started'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate('/dashboard/wizard')}
                className="btn-primary"
              >
                Create Configuration
              </button>
            )}
          </div>
        )}

        {/* Configurations Table */}
        {!isLoading && !error && filteredConfigs && filteredConfigs.length > 0 && (
          <div className="card-elevated rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-bg border-b border-dark-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm tracking-wide text-dark-muted">Name</th>
                    <th className="px-6 py-4 text-left text-sm tracking-wide text-dark-muted">Type</th>
                    <th className="px-6 py-4 text-left text-sm tracking-wide text-dark-muted">Description</th>
                    <th className="px-6 py-4 text-left text-sm tracking-wide text-dark-muted">Created</th>
                    <th className="px-6 py-4 text-left text-sm tracking-wide text-dark-muted">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {filteredConfigs.map((config) => {
                    const typeInfo = getConfigTypeInfo(config.config_type);
                    return (
                      <tr key={config.id} className="hover:bg-dark-bg/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-dark-text">{config.name}</div>
                          {config.is_template && (
                            <span className="inline-block mt-1 px-2 py-1 text-xs bg-accent-primary/10 text-accent-primary rounded border border-accent-primary/30">
                              Template
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg border ${typeInfo.color} text-sm`}>
                            {typeInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-dark-muted text-sm max-w-xs truncate">
                            {config.description || <span className="italic">No description</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-dark-muted text-sm">{formatDate(config.created_at)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/dashboard/wizard/${config.id}`)}
                              className="px-2 py-1 text-xs text-accent-primary hover:bg-accent-primary/10 rounded transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setHistoryConfig({ id: config.id, name: config.name })}
                              className="px-2 py-1 text-xs text-accent-primary hover:bg-accent-primary/10 rounded transition-colors"
                            >
                              History
                            </button>
                            <button
                              onClick={() => setExportingId(config.id)}
                              className="px-2 py-1 text-xs text-accent-primary hover:bg-accent-primary/10 rounded transition-colors"
                            >
                              Export
                            </button>
                            {!config.is_template && (
                              <button
                                onClick={() => templateMutation.mutate(config.id)}
                                disabled={templateMutation.isPending}
                                className="px-2 py-1 text-xs text-accent-primary hover:bg-accent-primary/10 rounded transition-colors disabled:opacity-50"
                              >
                                Template
                              </button>
                            )}
                            <button
                              onClick={() => duplicateMutation.mutate(config.id)}
                              disabled={duplicateMutation.isPending}
                              className="px-2 py-1 text-xs text-accent-primary hover:bg-accent-primary/10 rounded transition-colors disabled:opacity-50"
                            >
                              Duplicate
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(config.id)}
                              className="px-2 py-1 text-xs text-status-offline hover:bg-status-offline/10 rounded transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data && data.total > 20 && (
              <div className="bg-dark-bg border-t border-dark-border px-6 py-4 flex items-center justify-between">
                <div className="text-sm text-dark-muted">
                  Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, data.total)} of {data.total} configurations
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-secondary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page * 20 >= data.total}
                    className="btn-secondary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmId !== null && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="card-elevated rounded-lg p-6 max-w-md w-full mx-4 animate-fade-in">
              <h2 className="font-display text-xl tracking-wide text-dark-text/90 mb-4">Confirm Delete</h2>
              <p className="text-dark-muted mb-6">
                Are you sure you want to delete this configuration? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deleteConfirmId)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 px-4 py-3 bg-status-offline/20 text-status-offline border border-status-offline/30 rounded-lg hover:bg-status-offline/30 transition-colors disabled:opacity-50"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Version History Modal */}
        {historyConfig && (
          <VersionHistory
            configId={historyConfig.id}
            configName={historyConfig.name}
            onClose={() => setHistoryConfig(null)}
          />
        )}

        {/* Export Modal */}
        {exportingId !== null && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="card-elevated rounded-lg p-6 max-w-md w-full mx-4 animate-fade-in">
              <h2 className="font-display text-xl tracking-wide text-dark-text/90 mb-4">Export Configuration</h2>
              <p className="text-dark-muted mb-6">Choose an export format:</p>
              <div className="space-y-3">
                <button
                  onClick={() => handleExport(exportingId, 'cli')}
                  className="w-full card-interactive rounded-lg p-4 text-left"
                >
                  <div className="font-medium text-dark-text">CLI Script</div>
                  <div className="text-sm text-dark-muted">FortiGate command-line script</div>
                </button>
                <button
                  onClick={() => handleExport(exportingId, 'json')}
                  className="w-full card-interactive rounded-lg p-4 text-left"
                >
                  <div className="font-medium text-dark-text">JSON</div>
                  <div className="text-sm text-dark-muted">Structured data format</div>
                </button>
                <button
                  onClick={() => handleExport(exportingId, 'yaml')}
                  className="w-full card-interactive rounded-lg p-4 text-left"
                >
                  <div className="font-medium text-dark-text">YAML</div>
                  <div className="text-sm text-dark-muted">Human-readable format</div>
                </button>
              </div>
              <button
                onClick={() => setExportingId(null)}
                className="btn-secondary w-full mt-4"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigLibrary;
