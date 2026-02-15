import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templateApi } from '../../utils/api';

const TemplateLibrary: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: templates, isLoading, error } = useQuery({
    queryKey: ['templates'],
    queryFn: () => templateApi.getAll(),
  });

  const createFromTemplateMutation = useMutation({
    mutationFn: ({ templateId, name }: { templateId: number; name: string }) =>
      templateApi.createFromTemplate(templateId, name),
    onSuccess: (newConfig) => {
      queryClient.invalidateQueries({ queryKey: ['configurations'] });
      navigate(`/dashboard/wizard/${newConfig.id}`);
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to create from template');
    },
  });

  const handleUseTemplate = (templateId: number, templateName: string) => {
    createFromTemplateMutation.mutate({
      templateId,
      name: `${templateName} - New`,
    });
  };

  const getConfigTypeInfo = (type: string) => {
    const types: Record<string, { label: string; color: string }> = {
      ipsec: { label: 'IPSEC Remote Access', color: 'bg-accent-primary/10 text-accent-primary border-accent-primary/30' },
      sdwan: { label: 'SD-WAN', color: 'bg-accent-cool/10 text-accent-cool border-accent-cool/30' },
      firewall: { label: 'Firewall', color: 'bg-status-offline/10 text-status-offline border-status-offline/30' },
    };
    return types[type] || { label: type, color: 'bg-dark-muted/10 text-dark-muted border-dark-muted/30' };
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
                Template Library
              </h1>
              <p className="text-dark-muted text-sm mt-1 tracking-wide">
                Pre-built configurations to get started quickly
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-accent-primary border-t-transparent" />
            <p className="mt-4 text-dark-muted tracking-wide">Loading templates...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-status-offline/10 border border-status-offline/30 rounded-lg p-6 text-center">
            <p className="text-status-offline">Failed to load templates</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && (!templates || templates.length === 0) && (
          <div className="card-elevated rounded-lg p-12 text-center">
            <h2 className="font-display text-xl tracking-wide text-dark-text/90 mb-2">No Templates Yet</h2>
            <p className="text-dark-muted mb-6">
              Save a configuration as a template from the Configuration Library to see it here.
            </p>
            <button
              onClick={() => navigate('/dashboard/library')}
              className="btn-primary"
            >
              Go to Library
            </button>
          </div>
        )}

        {/* Template Grid */}
        {!isLoading && !error && templates && templates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => {
              const typeInfo = getConfigTypeInfo(template.config_type);
              return (
                <div
                  key={template.id}
                  className="card-interactive rounded-lg p-6 flex flex-col"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>
                  </div>

                  <h3 className="font-display text-lg tracking-wide text-dark-text mb-1">{template.name}</h3>
                  <p className="text-sm text-dark-muted mb-4 flex-1">
                    {template.description || 'No description'}
                  </p>

                  <button
                    onClick={() => handleUseTemplate(template.id, template.name)}
                    disabled={createFromTemplateMutation.isPending}
                    className="btn-primary w-full mt-auto disabled:opacity-50"
                  >
                    {createFromTemplateMutation.isPending ? 'Creating...' : 'Use Template'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateLibrary;
