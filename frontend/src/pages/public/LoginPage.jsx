import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Droplet, Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await login(email, password);
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/donor/dashboard', { replace: true });
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Invalid email or password credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo autofill helper
  const handleQuickLogin = (role) => {
    if (role === 'admin') {
      setEmail('admin@hemora.org');
      setPassword('AdminPass123!');
    } else {
      setEmail('donor@hemora.org');
      setPassword('DonorPass123!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-crimson-950 via-slate-900 to-crimson-900 px-4 py-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-crimson-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-red-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group mb-3">
            <div className="w-12 h-12 rounded-2xl bg-crimson-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
              <Droplet className="w-7 h-7 fill-white" />
            </div>
            <span className="font-heading text-3xl font-black tracking-tight text-white">
              HEMORA
            </span>
          </Link>
          <h2 className="font-heading text-2xl font-bold text-white">Sign in to your account</h2>
          <p className="text-sm text-slate-400 mt-1">Access the blood bank management portal</p>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 animate-slide-up">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              icon={Mail}
              required
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={Lock}
              required
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-crimson-900 focus:ring-crimson-500"
                />
                <span>Remember me</span>
              </label>
              <a href="#" className="font-semibold text-crimson-800 hover:text-crimson-900">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 text-base font-bold shadow-md shadow-crimson-900/30"
              isLoading={isLoading}
            >
              Sign In
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
              One-Click Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('donor')}
                className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:border-crimson-300 hover:bg-crimson-50 text-slate-700 transition-colors"
              >
                Demo Donor
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:border-crimson-300 hover:bg-crimson-50 text-slate-700 transition-colors"
              >
                Demo Admin
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-sm text-slate-300 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-white hover:underline">
            Register as a Lifesaver
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
