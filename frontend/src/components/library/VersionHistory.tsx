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
      <div className="card-elevated rounded-lg w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-dark-border flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl tracking-wide text-accent-primary">Version History</h2>
            <p className="text-sm text-dark-muted mt-0.5">{configName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-dark-muted hover:text-dark-text hover:bg-dark-elevated rounded-lg transition-colors"
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
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-accent-primary border-t-transparent" />
              <p className="mt-3 text-dark-muted text-sm tracking-wide">Loading version history...</p>
            </div>
          )}

          {error && (
            <div className="bg-status-offline/10 border border-status-offline/30 rounded-lg p-4 text-center">
              <p className="text-status-offline text-sm">Failed to load version history</p>
            </div>
          )}

          {!isLoading && !error && versions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-dark-muted">No version history available</p>
            </div>
          )}

          {!isLoading && !error && versions.length > 0 && (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-2 bottom-2 w-px bg-dark-border" />

              <div className="space-y-4">
                {versions.map((version, index) => (
                  <div key={version.id} className="relative pl-10">
                    {/* Timeline dot */}
                    <div className={`absolute left-2.5 top-3 w-3 h-3 rounded-full border-2 ${
                      index === 0
                        ? 'bg-accent-primary border-accent-primary/70'
                        : 'bg-dark-surface border-dark-border-light'
                    }`} />

                    <div className={`bg-dark-bg border rounded-lg p-4 ${
                      index === 0 ? 'border-accent-primary/50' : 'border-dark-border'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-dark-text">
                              Version {version.version_number}
                            </span>
                            {index === 0 && (
                              <span className="px-2 py-0.5 text-[10px] font-medium bg-accent-primary/20 text-accent-primary rounded border border-accent-primary/30 uppercase">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-dark-muted mt-1">
                            {formatDate(version.created_at)}
                          </p>
                          {version.change_description && (
                            <p className="text-sm text-dark-text/80 mt-2">
                              {version.change_description}
                            </p>
                          )}
                        </div>

                        {/* Restore button (not for current version) */}
                        {index > 0 && (
                          <button
                            onClick={() => setRestoreConfirmId(version.id)}
                            disabled={restoreMutation.isPending}
                            className="btn-secondary px-3 py-1.5 text-xs font-medium disabled:opacity-50"
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
        <div className="px-6 py-4 border-t border-dark-border">
          <button
            onClick={onClose}
            className="btn-secondary w-full text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>

      {/* Restore Confirmation */}
      {restoreConfirmId !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="card-elevated rounded-lg p-6 max-w-md w-full mx-4 animate-fade-in">
            <h3 className="font-display text-lg tracking-wide text-accent-primary mb-3">Confirm Restore</h3>
            <p className="text-dark-text/80 text-sm mb-5">
              This will restore the configuration to the selected version. A new version entry will be created to record this change.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setRestoreConfirmId(null)}
                className="btn-secondary flex-1 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => restoreMutation.mutate(restoreConfirmId)}
                disabled={restoreMutation.isPending}
                className="btn-primary flex-1 text-sm disabled:opacity-50"
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
