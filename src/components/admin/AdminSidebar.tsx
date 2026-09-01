import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/authContext';
import {
  Stethoscope,
  LayoutDashboard,
  Users,
  Activity,
  Layers,
  HeartHandshake,
  Image as ImageIcon,
  HelpCircle,
  CalendarCheck,
  Settings,
  Globe,
  ScrollText,
  LogOut,
  ExternalLink,
  Shield,
  ShieldCheck,
  Sliders,
  X
} from 'lucide-react';
import { AdminRole, WebsiteSettings } from '../../types';
import { CareOnLogo } from '../common/CareOnMedia';
import { DataAccessLayer } from '../../lib/dal';

export type AdminTab =
  | 'dashboard'
  | 'doctors'
  | 'services'
  | 'departments'
  | 'insurance'
  | 'section-media'
  | 'media-library'
  | 'patient-stories'
  | 'gallery'
  | 'faqs'
  | 'appointments'
  | 'website-settings'
  | 'seo-settings'
  | 'audit-logs';

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  onViewPublicWebsite: () => void;
  newAppointmentsCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  onViewPublicWebsite,
  newAppointmentsCount,
  isOpenMobile,
  onCloseMobile
}) => {
  const { currentUser, logout } = useAuth();
  const [settings, setSettings] = useState<WebsiteSettings>(() => DataAccessLayer.getWebsiteSettings());

  useEffect(() => {
    const handleUpdate = () => setSettings(DataAccessLayer.getWebsiteSettings());
    window.addEventListener('careon_data_updated', handleUpdate);
    return () => window.removeEventListener('careon_data_updated', handleUpdate);
  }, []);

  const navItems: { id: AdminTab; label: string; icon: React.FC<{ className?: string }>; badge?: number; minRole?: AdminRole }[] = [
    { id: 'dashboard', label: 'Control Dashboard', icon: LayoutDashboard },
    { id: 'doctors', label: 'Doctors', icon: Users },
    { id: 'services', label: 'Services', icon: Activity },
    { id: 'departments', label: 'Departments', icon: Layers },
    { id: 'insurance', label: 'Insurance Plans', icon: ShieldCheck },
    { id: 'section-media', label: 'Hero & Section Images', icon: Sliders },
    { id: 'media-library', label: 'Media Library', icon: ImageIcon },
    { id: 'patient-stories', label: 'Patient Stories', icon: HeartHandshake },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle },
    { id: 'appointments', label: 'Appointment Requests', icon: CalendarCheck, badge: newAppointmentsCount },
    { id: 'website-settings', label: 'Website Settings', icon: Settings },
    { id: 'seo-settings', label: 'SEO Settings', icon: Globe },
    { id: 'audit-logs', label: 'Audit Logs', icon: ScrollText }
  ];

  const handleTabClick = (tab: AdminTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  const getRoleBadge = (_role?: AdminRole) => {
    return <span className="px-2 py-0.5 rounded-md bg-teal-50 text-[#007E70] text-[10px] font-bold">Admin</span>;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-72 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand & Clinic Title */}
        <div>
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <CareOnLogo
              settings={settings}
              size="sm"
              showTagline={true}
              subtitle="Control Center"
              onClick={onViewPublicWebsite}
              className="cursor-pointer"
            />
            <button
              onClick={onCloseMobile}
              className="lg:hidden text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav List */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Content Architecture
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-teal-50 text-[#007E70] font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#007E70]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Area: User Info + Switch back */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/70 space-y-2">
          <button
            onClick={onViewPublicWebsite}
            className="w-full py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-between transition-colors shadow-2xs cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-[#007E70]" />
              <span>Public Patient View</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-teal-100 text-[#007E70] flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser?.name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-800 truncate">
                  {currentUser?.name || 'Administrator'}
                </div>
                <div>{getRoleBadge(currentUser?.role)}</div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
