import React, { useState, useEffect } from 'react';
import { Lock, User, AlertCircle, Eye, EyeOff, ShieldCheck, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface AdminLoginFormProps {
  onLoginSuccess: () => void;
  onBackToHome: () => void;
}

export default function AdminLoginForm({ onLoginSuccess, onBackToHome }: AdminLoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Focus on username input on mount
    const usernameInput = document.getElementById('admin-username');
    if (usernameInput) {
      usernameInput.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        sessionStorage.setItem('isAdminLoggedIn', 'true');
        sessionStorage.setItem('adminToken', data.token || '');
        onLoginSuccess();
      } else {
        setError(data.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      console.error('Error logging in:', err);
      setError('A system communication error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-[#f7f6f2]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md bg-white border border-[#dfded4] rounded-3xl p-8 sm:p-10 shadow-sm relative overflow-hidden"
      >
        {/* Subtle accent border on top */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#123e35]" />

        <div className="space-y-6">
          {/* Header block */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#123e35]/5 border border-[#123e35]/10 flex items-center justify-center mx-auto text-[#123e35] mb-4 shadow-3xs">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#bc5f40] font-mono">
              Administrative Lockroom
            </span>
            <h1 className="text-2xl font-black font-display text-[#151716] tracking-tight">
              Sign In to Lead Board
            </h1>
            <p className="text-xs text-[#888b88] font-semibold max-w-xs mx-auto leading-relaxed">
              Unlock lead submissions, real-time citation analysis briefs, and automated local audit summaries.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1.5">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3.5 bg-rose-50 border border-rose-200/60 rounded-xl text-xs text-rose-600 font-semibold flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Username Input */}
            <div className="space-y-1.5">
              <label 
                htmlFor="admin-username" 
                className="block text-[10px] font-black uppercase tracking-wider text-[#4e524f] font-mono"
              >
                Admin Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#888b88]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="admin-username"
                  type="text"
                  required
                  disabled={loading}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  className="bg-[#faf9f6]/80 text-sm font-semibold text-[#1a1c1a] border border-[#dfded4] rounded-xl w-full pl-10 pr-4 py-3 placeholder-[#b8b8b0] focus:outline-none focus:border-[#123e35] focus:ring-4 focus:ring-[#123e35]/5 transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label 
                htmlFor="admin-password" 
                className="block text-[10px] font-black uppercase tracking-wider text-[#4e524f] font-mono"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#888b88]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="bg-[#faf9f6]/80 text-sm font-semibold text-[#1a1c1a] border border-[#dfded4] rounded-xl w-full pl-10 pr-10 py-3 placeholder-[#b8b8b0] focus:outline-none focus:border-[#123e35] focus:ring-4 focus:ring-[#123e35]/5 transition-all text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#888b88] hover:text-[#4e524f] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#123e35] hover:bg-[#185246] disabled:bg-[#123e35]/65 text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider font-mono cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-3xs"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Access Dashboard</span>
              )}
            </button>
          </form>

          {/* Navigation clean link */}
          <div className="border-t border-[#dfded4]/80 pt-4 flex justify-between items-center text-[11px] font-bold text-[#888b88]">
            <button
              onClick={onBackToHome}
              className="hover:text-[#123e35] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
            <span className="font-mono text-[9px] text-[#b4b4ac]">SECURE REGISTRY</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
