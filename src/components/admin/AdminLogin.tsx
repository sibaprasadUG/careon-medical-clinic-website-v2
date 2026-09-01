import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/authContext';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff, KeyRound, UserCheck } from 'lucide-react';
import { CareOnLogo } from '../common/CareOnMedia';
import { DataAccessLayer } from '../../lib/dal';
import { WebsiteSettings } from '../../types';

interface AdminLoginProps {
  onBackToPublic: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToPublic }) => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState<string>('admin@careonclinic.com');
  const [password, setPassword] = useState<string>('CareOnAdmin2026!');
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

    const result = await login(email, password);
    if (!result.success) {
      setErrorMessage(result.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  const handleFillDemoCredentials = () => {
    setEmail('admin@careonclinic.com');
    setPassword('CareOnAdmin2026!');
    setErrorMessage(null);
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
            Website Management & Patient Intake System
          </p>
          <p className="text-xs text-[#475569]">
            কেয়ারঅন মেডিক্যাল ক্লিনিক অ্যাডমিন পোর্টাল • প্রবেশ করতে আপনার আইডি এবং পাসওয়ার্ড দিন
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F172A] flex items-center justify-between">
                <span>Admin ID / Email (আইডি)</span>
                <span className="text-[11px] font-normal text-slate-500">e.g. admin or email</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@careonclinic.com or admin"
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
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#007E70] hover:bg-[#009282] active:bg-[#006e62] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm shadow-teal-900/20 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <span>Verifying & Opening Admin Panel...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Login & Open Admin Panel (লগইন করুন)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Preset Helper */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
            <button
              type="button"
              onClick={handleFillDemoCredentials}
              className="text-[11px] font-semibold text-slate-600 hover:text-teal-700 bg-slate-100 hover:bg-teal-50 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer w-full justify-center"
            >
              <UserCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Click to auto-fill default admin login info</span>
            </button>
          </div>
        </div>

        {/* Security & Return */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure Admin Control</span>
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
