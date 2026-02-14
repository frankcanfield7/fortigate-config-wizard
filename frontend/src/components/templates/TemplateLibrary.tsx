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
    const types: Record<string, { icon: string; label: string; color: string }> = {
      ipsec: { icon: '🔒', label: 'IPSEC Remote Access', color: 'bg-red-700/10 text-red-400 border-red-700/30' },
      sdwan: { icon: '🌐', label: 'SD-WAN', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
      firewall: { icon: '🛡️', label: 'Firewall', color: 'bg-red-500/10 text-red-400 border-red-500/30' },
    };
    return types[type] || { icon: '⚙️', label: type, color: 'bg-gray-500/10 text-gray-400 border-gray-500/30' };
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
              <h1 className="text-3xl font-semibold text-white">
                Template Library 📋
              </h1>
              <p className="text-white/70 text-sm mt-1">
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
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-700 border-t-transparent" />
            <p className="mt-4 text-gray-400">Loading templates...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border-2 border-red-500 rounded-xl p-6 text-center">
            <p className="text-red-300">Failed to load templates</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && (!templates || templates.length === 0) && (
          <div className="bg-[#262626] border-2 border-[#404040] rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-medium text-red-400 mb-2">No Templates Yet</h2>
            <p className="text-gray-400 mb-6">
              Save a configuration as a template from the Configuration Library to see it here.
            </p>
            <button
              onClick={() => navigate('/dashboard/library')}
              className="px-6 py-3 bg-gradient-to-r from-red-900 to-red-800 text-white rounded-lg hover:shadow-lg hover:shadow-red-700/50 transition-all font-medium"
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
                  className="bg-[#262626] border-2 border-[#404040] rounded-xl p-6 hover:border-red-700 transition-all flex flex-col"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs ${typeInfo.color}`}>
                      <span>{typeInfo.icon}</span>
                      <span>{typeInfo.label}</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-medium text-white mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-400 mb-4 flex-1">
                    {template.description || 'No description'}
                  </p>

                  <button
                    onClick={() => handleUseTemplate(template.id, template.name)}
                    disabled={createFromTemplateMutation.isPending}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-red-900 to-red-800 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-red-700/50 transition-all mt-auto disabled:opacity-50"
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
