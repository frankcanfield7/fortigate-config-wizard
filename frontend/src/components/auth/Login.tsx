import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Clear auth error
    if (error) {
      clearError();
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await login(formData);
      navigate('/dashboard');
    } catch {
      // Error is handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md animate-fade-in">
        {/* Decorative accent element */}
        <div className="flex justify-center mb-8">
          <div className="w-12 h-1 bg-accent-primary/40 rounded-full" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl tracking-wide text-dark-text">
            FortiGate Spartan Wizard
          </h1>
          <p className="text-dark-muted mt-2 tracking-wide text-sm">
            Precision. Excellence. No compromise.
          </p>
        </div>

        {/* Login Card */}
        <div className="card-elevated rounded-lg p-8">
          <h2 className="font-display text-xl tracking-wide text-dark-text/90 mb-6 text-center">
            Sign In
          </h2>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 px-4 py-3 bg-status-offline/10 border border-status-offline/30 rounded-lg">
              <p className="text-sm text-status-offline">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="block text-sm tracking-wide text-dark-muted"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`input-field ${
                  validationErrors.username ? 'border-status-offline focus:border-status-offline' : ''
                }`}
                placeholder="Enter your username"
                disabled={isSubmitting}
              />
              {validationErrors.username && (
                <p className="text-sm text-status-offline">{validationErrors.username}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm tracking-wide text-dark-muted"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`input-field ${
                  validationErrors.password ? 'border-status-offline focus:border-status-offline' : ''
                }`}
                placeholder="Enter your password"
                disabled={isSubmitting}
              />
              {validationErrors.password && (
                <p className="text-sm text-status-offline">{validationErrors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Contact admin for account */}
          <p className="mt-6 text-center text-xs text-dark-muted">
            Contact your administrator for account access
          </p>
        </div>

        {/* Footer accent */}
        <div className="flex justify-center mt-8">
          <div className="w-24 h-px bg-dark-border" />
        </div>
      </div>
    </div>
  );
};

export default Login;
