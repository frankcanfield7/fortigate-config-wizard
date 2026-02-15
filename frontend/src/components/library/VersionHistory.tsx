import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { configApi } from '../../utils/api';
import type { ConfigurationVersion } from '../../types';

interface VersionHistoryProps {
  configId: number;
  configName: string;
  onClose: () => void;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({ configId, configName, onClose }) => {
  const queryClient = useQueryClient();
  const [restoreConfirmId, setRestoreConfirmId] = useState<number | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['versions', configId],
    queryFn: () => configApi.getVersions(configId),
  });

  const restoreMutation = useMutation({
    mutationFn: (versionId: number) => configApi.restoreVersion(configId, versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['versions', configId] });
      queryClient.invalidateQueries({ queryKey: ['configurations'] });
      setRestoreConfirmId(null);
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to restore version');
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const versions: ConfigurationVersion[] = data?.versions || [];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#262626] border-2 border-[#404040] rounded-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#404040] flex items-center justify-between">
          <div>
            <h2 className="text-xl font-medium text-red-400">Version History</h2>
            <p className="text-sm text-gray-400 mt-0.5">{configName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#404040] rounded-lg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-700 border-t-transparent" />
              <p className="mt-3 text-gray-400 text-sm">Loading version history...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 text-center">
              <p className="text-red-300 text-sm">Failed to load version history</p>
            </div>
          )}

          {!isLoading && !error && versions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">No version history available</p>
            </div>
          )}

          {!isLoading && !error && versions.length > 0 && (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-2 bottom-2 w-px bg-[#404040]" />

              <div className="space-y-4">
                {versions.map((version, index) => (
                  <div key={version.id} className="relative pl-10">
                    {/* Timeline dot */}
                    <div className={`absolute left-2.5 top-3 w-3 h-3 rounded-full border-2 ${
                      index === 0
                        ? 'bg-red-600 border-red-500'
                        : 'bg-[#262626] border-[#525252]'
                    }`} />

                    <div className={`bg-[#171717] border rounded-lg p-4 ${
                      index === 0 ? 'border-red-700/50' : 'border-[#404040]'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">
                              Version {version.version_number}
                            </span>
                            {index === 0 && (
                              <span className="px-2 py-0.5 text-[10px] font-medium bg-red-700/20 text-red-400 rounded border border-red-700/30 uppercase">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(version.created_at)}
                          </p>
                          {version.change_description && (
                            <p className="text-sm text-gray-300 mt-2">
                              {version.change_description}
                            </p>
                          )}
                        </div>

                        {/* Restore button (not for current version) */}
                        {index > 0 && (
                          <button
                            onClick={() => setRestoreConfirmId(version.id)}
                            disabled={restoreMutation.isPending}
                            className="px-3 py-1.5 text-xs font-medium bg-[#262626] border border-[#525252] text-gray-300 rounded-lg hover:border-red-700 hover:text-red-400 transition-colors disabled:opacity-50"
                          >
                            Restore
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#404040]">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-[#404040] text-white rounded-lg hover:bg-[#525252] transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>

      {/* Restore Confirmation */}
      {restoreConfirmId !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-[#262626] border-2 border-[#404040] rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-red-400 mb-3">Confirm Restore</h3>
            <p className="text-gray-300 text-sm mb-5">
              This will restore the configuration to the selected version. A new version entry will be created to record this change.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setRestoreConfirmId(null)}
                className="flex-1 px-4 py-2 bg-[#404040] text-white rounded-lg hover:bg-[#525252] transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => restoreMutation.mutate(restoreConfirmId)}
                disabled={restoreMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-600 transition-colors text-sm disabled:opacity-50"
              >
                {restoreMutation.isPending ? 'Restoring...' : 'Restore Version'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionHistory;
