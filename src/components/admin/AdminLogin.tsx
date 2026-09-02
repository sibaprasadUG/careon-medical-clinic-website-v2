import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/authContext';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react';
import { CareOnLogo } from '../common/CareOnMedia';
import { DataAccessLayer } from '../../lib/dal';
import { WebsiteSettings } from '../../types';

interface AdminLoginProps {
  onBackToPublic: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToPublic }) => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [settings, setSettings] = useState<WebsiteSettings>(() => DataAccessLayer.getWebsiteSettings());

  useEffect(() => {
    const handleUpdate = () => setSettings(DataAccessLayer.getWebsiteSettings());
    window.addEventListener('careon_data_updated', handleUpdate);
    return () => window.removeEventListener('careon_data_updated', handleUpdate);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both admin ID/email and password.');
      return;
    }

    const result = await login(email, password);
    if (!result.success) {
      setErrorMessage(result.error || 'Invalid admin credentials. Please verify your ID and password.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center px-4 py-12 selection:bg-[#007E70]/20 selection:text-[#005A50]">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <div className="mb-2">
            <CareOnLogo
              settings={settings}
              size="lg"
              showTagline={false}
              onClick={onBackToPublic}
            />
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
            CareOn Admin Portal
          </h1>
          <p className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
            Clinical Administration & Content Control Center
          </p>
          <p className="text-xs text-[#475569]">
            কেয়ারঅন মেডিক্যাল ক্লিনিক অ্যাডমিন পোর্টাল • প্রবেশ করতে আপনার আইডি ও পাসওয়ার্ড দিন
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F172A] flex items-center justify-between">
                <span>Admin ID / Email (আইডি)</span>
                <span className="text-[11px] font-normal text-slate-500">e.g. admin or clinic email</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@careonclinic.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007E70]/20 focus:border-[#007E70] transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F172A] flex items-center justify-between">
                <span>Password (পাসওয়ার্ড)</span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 cursor-pointer flex items-center gap-1"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007E70]/20 focus:border-[#007E70] transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#007E70] hover:bg-[#009282] active:bg-[#006e62] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm shadow-teal-900/20 disabled:opacity-60 cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Login & Open Admin Panel (লগইন করুন)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security & Return */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Authenticated Admin Session</span>
          </div>
          <button
            onClick={onBackToPublic}
            className="text-teal-700 hover:text-teal-900 font-bold transition-colors cursor-pointer"
          >
            ← Return to Public Website (ওয়েবসাইটে ফিরুন)
          </button>
        </div>
      </div>
    </div>
  );
};
