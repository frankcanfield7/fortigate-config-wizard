import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { configApi } from '../../utils/api';

const ConfigLibrary: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [exportingId, setExportingId] = useState<number | null>(null);

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

  // Export handler
  const handleExport = async (id: number, format: 'cli' | 'json' | 'yaml') => {
    try {
      const result = await configApi.export(id, format);

      // Create download link
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
    const types: Record<string, { icon: string; label: string; color: string }> = {
      ipsec: { icon: '🔒', label: 'IPSEC Remote Access', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
      sdwan: { icon: '🌐', label: 'SD-WAN', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
      firewall: { icon: '🛡️', label: 'Firewall', color: 'bg-red-500/10 text-red-400 border-red-500/30' },
      routing: { icon: '🗺️', label: 'Routing', color: 'bg-green-500/10 text-green-400 border-green-500/30' },
      interfaces: { icon: '🔌', label: 'Interfaces', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
    };
    return types[type] || { icon: '⚙️', label: type, color: 'bg-gray-500/10 text-gray-400 border-gray-500/30' };
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
    <div className="min-h-screen bg-[#0f172a]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-[#0f172a] hover:text-[#1e293b] transition-colors mb-2 flex items-center gap-2"
              >
                <span>←</span> Back to Dashboard
              </button>
              <h1 className="text-3xl font-black text-[#0f172a]">
                Configuration Library 📚
              </h1>
              <p className="text-[#0f172a]/70 text-sm mt-1">
                Manage your saved FortiGate configurations
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard/wizard')}
              className="px-6 py-3 bg-white text-[#0f172a] rounded-lg hover:bg-gray-100 transition-colors font-bold"
            >
              + New Configuration
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="bg-[#1e293b] border-2 border-[#334155] rounded-xl p-4 mb-6">
          <input
            type="text"
            placeholder="Search configurations by name, type, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-[#0f172a] border-2 border-[#334155] rounded-lg text-white placeholder-gray-500 focus:border-[#06b6d4] focus:outline-none"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#06b6d4] border-t-transparent"></div>
            <p className="mt-4 text-gray-400">Loading configurations...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/30 border-2 border-red-500 rounded-xl p-6 text-center">
            <p className="text-red-300">Failed to load configurations</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredConfigs?.length === 0 && (
          <div className="bg-[#1e293b] border-2 border-[#334155] rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-[#22d3ee] mb-2">
              {searchTerm ? 'No matching configurations' : 'No configurations yet'}
            </h2>
            <p className="text-gray-400 mb-6">
              {searchTerm
                ? 'Try adjusting your search criteria'
                : 'Create your first configuration to get started'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate('/dashboard/wizard')}
                className="px-6 py-3 bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] text-[#0f172a] rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all font-bold"
              >
                Create Configuration
              </button>
            )}
          </div>
        )}

        {/* Configurations Table */}
        {!isLoading && !error && filteredConfigs && filteredConfigs.length > 0 && (
          <div className="bg-[#1e293b] border-2 border-[#334155] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0f172a] border-b-2 border-[#334155]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#22d3ee]">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#22d3ee]">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#22d3ee]">Description</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#22d3ee]">Created</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#22d3ee]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155]">
                  {filteredConfigs.map((config) => {
                    const typeInfo = getConfigTypeInfo(config.config_type);
                    return (
                      <tr key={config.id} className="hover:bg-[#0f172a]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">{config.name}</div>
                          {config.is_template && (
                            <span className="inline-block mt-1 px-2 py-1 text-xs bg-[#06b6d4]/20 text-[#06b6d4] rounded border border-[#06b6d4]/30">
                              Template
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border ${typeInfo.color} text-sm`}>
                            <span>{typeInfo.icon}</span>
                            <span>{typeInfo.label}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-400 text-sm max-w-xs truncate">
                            {config.description || <span className="italic">No description</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-400 text-sm">{formatDate(config.created_at)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {/* Edit Button */}
                            <button
                              onClick={() => navigate(`/dashboard/wizard/${config.id}`)}
                              className="p-2 text-[#22d3ee] hover:bg-[#22d3ee]/10 rounded transition-colors"
                              title="Edit"
                            >
                              ✏️
                            </button>

                            {/* Export Button */}
                            <button
                              onClick={() => setExportingId(config.id)}
                              className="p-2 text-[#22d3ee] hover:bg-[#22d3ee]/10 rounded transition-colors"
                              title="Export"
                            >
                              📥
                            </button>

                            {/* Duplicate Button */}
                            <button
                              onClick={() => duplicateMutation.mutate(config.id)}
                              disabled={duplicateMutation.isPending}
                              className="p-2 text-[#22d3ee] hover:bg-[#22d3ee]/10 rounded transition-colors disabled:opacity-50"
                              title="Duplicate"
                            >
                              📋
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => setDeleteConfirmId(config.id)}
                              className="p-2 text-red-400 hover:bg-red-400/10 rounded transition-colors"
                              title="Delete"
                            >
                              🗑️
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
              <div className="bg-[#0f172a] border-t-2 border-[#334155] px-6 py-4 flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, data.total)} of {data.total} configurations
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-[#1e293b] border border-[#334155] rounded text-white hover:bg-[#334155] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page * 20 >= data.total}
                    className="px-4 py-2 bg-[#1e293b] border border-[#334155] rounded text-white hover:bg-[#334155] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="bg-[#1e293b] border-2 border-[#334155] rounded-xl p-6 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-[#22d3ee] mb-4">Confirm Delete</h2>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this configuration? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-2 bg-[#334155] text-white rounded-lg hover:bg-[#475569] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deleteConfirmId)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Export Modal */}
        {exportingId !== null && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-[#1e293b] border-2 border-[#334155] rounded-xl p-6 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-[#22d3ee] mb-4">Export Configuration</h2>
              <p className="text-gray-300 mb-6">Choose an export format:</p>
              <div className="space-y-3">
                <button
                  onClick={() => handleExport(exportingId, 'cli')}
                  className="w-full px-4 py-3 bg-[#0f172a] border-2 border-[#334155] rounded-lg text-white hover:border-[#06b6d4] transition-colors text-left"
                >
                  <div className="font-bold">CLI Script</div>
                  <div className="text-sm text-gray-400">FortiGate command-line script</div>
                </button>
                <button
                  onClick={() => handleExport(exportingId, 'json')}
                  className="w-full px-4 py-3 bg-[#0f172a] border-2 border-[#334155] rounded-lg text-white hover:border-[#06b6d4] transition-colors text-left"
                >
                  <div className="font-bold">JSON</div>
                  <div className="text-sm text-gray-400">Structured data format</div>
                </button>
                <button
                  onClick={() => handleExport(exportingId, 'yaml')}
                  className="w-full px-4 py-3 bg-[#0f172a] border-2 border-[#334155] rounded-lg text-white hover:border-[#06b6d4] transition-colors text-left"
                >
                  <div className="font-bold">YAML</div>
                  <div className="text-sm text-gray-400">Human-readable format</div>
                </button>
              </div>
              <button
                onClick={() => setExportingId(null)}
                className="w-full mt-4 px-4 py-2 bg-[#334155] text-white rounded-lg hover:bg-[#475569] transition-colors"
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
