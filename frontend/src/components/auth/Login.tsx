import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
      console.log('Attempting login with:', { username: formData.username });
      await login(formData);
      console.log('Login successful, navigating to dashboard...');
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by AuthContext
      console.error('Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold mb-2">
            <span className="bg-gradient-to-r from-red-700 to-red-500 bg-clip-text text-transparent">
              FortiGate Spartan Wizard
            </span>
          </h1>
          <p className="text-gray-400 text-sm">🏛️⚔️ Precision. Excellence. No compromise.</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#262626] border-2 border-[#404040] rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-medium text-red-400 mb-6">Login</h2>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-500 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-[#171717] border-2 ${
                  validationErrors.username ? 'border-red-500' : 'border-[#404040]'
                } rounded-lg text-white placeholder-gray-500 focus:border-red-700 focus:outline-none transition-colors`}
                placeholder="Enter your username"
                disabled={isSubmitting}
              />
              {validationErrors.username && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.username}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-[#171717] border-2 ${
                  validationErrors.password ? 'border-red-500' : 'border-[#404040]'
                } rounded-lg text-white placeholder-gray-500 focus:border-red-700 focus:outline-none transition-colors`}
                placeholder="Enter your password"
                disabled={isSubmitting}
              />
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-red-800 to-red-700 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-red-700/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-red-400 hover:text-red-300 font-medium transition-colors"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-gray-500 text-xs">
          <p>FortiGate Spartan Configuration Wizard</p>
          <p>Enterprise Configuration Management</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
