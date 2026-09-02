import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/authContext';
import { DataAccessLayer } from '../../lib/dal';
import { AdminLogin } from './AdminLogin';
import { AdminSidebar, AdminTab } from './AdminSidebar';
import { AdminDashboard } from './AdminDashboard';
import { DoctorManager } from './DoctorManager';
import { DepartmentManager } from './DepartmentManager';
import { ServiceManager } from './ServiceManager';
import { PatientStoryManager } from './PatientStoryManager';
import { GalleryManager } from './GalleryManager';
import { FAQManager } from './FAQManager';
import { AppointmentRequestManager } from './AppointmentRequestManager';
import { WebsiteSettingsManager } from './WebsiteSettingsManager';
import { MediaLibrary } from './MediaLibrary';
import { InsuranceManager } from './InsuranceManager';
import { SectionMediaManager } from './SectionMediaManager';
import { SEOSettingsManager } from './SEOSettingsManager';
import { AuditLogViewer } from './AuditLogViewer';
import { Menu, ExternalLink } from 'lucide-react';

interface AdminLayoutProps {
  onBackToPublic: () => void;
  initialPath?: string;
  onNavigatePath?: (path: string) => void;
}

function getTabFromPath(path?: string): AdminTab {
  if (!path) return 'dashboard';
  const clean = path.replace(/^\/admin\/?/, '').toLowerCase();
  if (clean === 'doctors') return 'doctors';
  if (clean === 'services') return 'services';
  if (clean === 'departments') return 'departments';
  if (clean === 'insurance') return 'insurance';
  if (clean === 'section-media') return 'section-media';
  if (clean === 'media-library' || clean === 'assets' || clean === 'media') return 'media-library';
  if (clean === 'patient-stories' || clean === 'stories') return 'patient-stories';
  if (clean === 'gallery') return 'gallery';
  if (clean === 'faqs') return 'faqs';
  if (clean === 'appointments') return 'appointments';
  if (clean === 'website-settings' || clean === 'settings') return 'website-settings';
  if (clean === 'seo-settings' || clean === 'seo') return 'seo-settings';
  if (clean === 'audit-logs' || clean === 'logs') return 'audit-logs';
  return 'dashboard';
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onBackToPublic, initialPath, onNavigatePath }) => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>(() => getTabFromPath(initialPath || (typeof window !== 'undefined' ? window.location.pathname : '')));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [newAppointmentsCount, setNewAppointmentsCount] = useState<number>(0);

  const updateCounts = () => {
    const apps = DataAccessLayer.getAllAppointmentRequests();
    setNewAppointmentsCount(apps.filter((a) => a.status === 'NEW').length);
  };

  useEffect(() => {
    updateCounts();
    const handleUpdate = () => updateCounts();
    window.addEventListener('careon_data_updated', handleUpdate);
    return () => window.removeEventListener('careon_data_updated', handleUpdate);
  }, []);

  const handleSelectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    const subPath = tab === 'dashboard' ? '/admin' : `/admin/${tab}`;
    if (onNavigatePath) {
      onNavigatePath(subPath);
    } else if (typeof window !== 'undefined') {
      try {
        window.history.pushState({}, '', subPath);
      } catch {
        window.location.hash = subPath;
      }
    }
  };

  if (!isAuthenticated) {
    return <AdminLogin onBackToPublic={onBackToPublic} />;
  }

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <AdminDashboard
            setActiveTab={handleSelectTab}
            onViewPublicWebsite={onBackToPublic}
          />
        );
      case 'doctors':
        return <DoctorManager />;
      case 'departments':
        return <DepartmentManager />;
      case 'insurance':
        return <InsuranceManager />;
      case 'section-media':
        return <SectionMediaManager />;
      case 'media-library':
        return <MediaLibrary />;
      case 'services':
        return <ServiceManager />;
      case 'patient-stories':
        return <PatientStoryManager />;
      case 'gallery':
        return <GalleryManager />;
      case 'faqs':
        return <FAQManager />;
      case 'appointments':
        return <AppointmentRequestManager />;
      case 'website-settings':
        return <WebsiteSettingsManager />;
      case 'seo-settings':
        return <SEOSettingsManager />;
      case 'audit-logs':
        return <AuditLogViewer />;
      default:
        return (
          <AdminDashboard
            setActiveTab={handleSelectTab}
            onViewPublicWebsite={onBackToPublic}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-800 font-sans selection:bg-[#007E70]/20 selection:text-[#005A50]">
      {/* Admin Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
        onViewPublicWebsite={onBackToPublic}
        newAppointmentsCount={newAppointmentsCount}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar for mobile & quick info */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-700 capitalize">
                {activeTab.replace('-', ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBackToPublic}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-teal-50 hover:text-[#007E70] text-slate-600 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              <span>View Public Website</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </header>

        {/* Dynamic Content Panel */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {renderActiveModule()}
        </main>
      </div>
    </div>
  );
};
