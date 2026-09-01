import React, { useState, useEffect } from 'react';
import { DataAccessLayer } from '../../lib/dal';
import { useAuth } from '../../lib/authContext';
import {
  Users,
  Activity,
  Layers,
  HeartHandshake,
  Image as ImageIcon,
  HelpCircle,
  CalendarCheck,
  ArrowRight,
  Plus,
  RotateCcw,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import {
  Doctor,
  Service,
  Department,
  PatientStory,
  GalleryItem,
  FAQ,
  AppointmentRequest,
  AuditLog
} from '../../types';
import { ConfirmationDialog } from './ConfirmationDialog';
import { AdminTab } from './AdminSidebar';

interface AdminDashboardProps {
  setActiveTab: (tab: AdminTab) => void;
  onViewPublicWebsite: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  setActiveTab,
  onViewPublicWebsite
}) => {
  const { currentUser } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [stories, setStories] = useState<PatientStory[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

  const loadData = () => {
    setDoctors(DataAccessLayer.getAllDoctors());
    setServices(DataAccessLayer.getAllServices());
    setDepartments(DataAccessLayer.getAllDepartments());
    setStories(DataAccessLayer.getAllPatientStories());
    setGallery(DataAccessLayer.getAllGallery());
    setFaqs(DataAccessLayer.getAllFAQs());
    setAppointments(DataAccessLayer.getAllAppointmentRequests());
    setAuditLogs(DataAccessLayer.getAuditLogs());
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('careon_data_updated', handleUpdate);
    return () => window.removeEventListener('careon_data_updated', handleUpdate);
  }, []);

  const activeDoctorsCount = doctors.filter((d) => d.status === 'ACTIVE').length;
  const activeServicesCount = services.filter((s) => s.status === 'ACTIVE').length;
  const activeDepartmentsCount = departments.filter((d) => d.status === 'ACTIVE').length;
  const publishedStoriesCount = stories.filter((s) => s.published).length;
  const publishedFaqsCount = faqs.filter((f) => f.published).length;
  const newAppointments = appointments.filter((a) => a.status === 'NEW');

  const handleResetData = () => {
    if (!currentUser) return;
    DataAccessLayer.resetToDefaults(currentUser);
    setIsResetConfirmOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#132838] to-[#004d44] rounded-3xl p-6 sm:p-8 text-white shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-teal-300 text-[11px] font-bold tracking-wider uppercase backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CareOn Content Engine Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser?.name || 'Administrator'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Manage public website physicians, clinical services, patient stories, and online appointment requests in real-time. Changes publish instantly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onViewPublicWebsite}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition-colors flex items-center gap-2"
          >
            <span>Live Public Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="px-4 py-2.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 text-xs font-semibold rounded-xl border border-teal-400/30 transition-colors flex items-center gap-2"
            title="Reset to verified baseline seed data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Website Metrics Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Public Website Content Status
          </h2>
          <span className="text-xs text-slate-400">Strict Non-ERP Metrics</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div
            onClick={() => setActiveTab('doctors')}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-[#007E70] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <Users className="w-4 h-4 text-[#007E70]" />
              <span className="text-[11px] text-slate-400 group-hover:text-[#007E70] font-bold">
                {doctors.length} Total
              </span>
            </div>
            <div className="text-2xl font-extrabold text-[#0F172A]">{activeDoctorsCount}</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Active Doctors</div>
          </div>

          <div
            onClick={() => setActiveTab('services')}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-[#007E70] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <Activity className="w-4 h-4 text-teal-600" />
              <span className="text-[11px] text-slate-400 group-hover:text-teal-600 font-bold">
                {services.length} Total
              </span>
            </div>
            <div className="text-2xl font-extrabold text-[#0F172A]">{activeServicesCount}</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Active Services</div>
          </div>

          <div
            onClick={() => setActiveTab('departments')}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-[#007E70] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span className="text-[11px] text-slate-400 group-hover:text-emerald-600 font-bold">
                {departments.length} Total
              </span>
            </div>
            <div className="text-2xl font-extrabold text-[#0F172A]">{activeDepartmentsCount}</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Departments</div>
          </div>

          <div
            onClick={() => setActiveTab('patient-stories')}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-[#007E70] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <HeartHandshake className="w-4 h-4 text-rose-500" />
              <span className="text-[11px] text-slate-400 group-hover:text-rose-500 font-bold">
                {stories.length} Total
              </span>
            </div>
            <div className="text-2xl font-extrabold text-[#0F172A]">{publishedStoriesCount}</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Patient Stories</div>
          </div>

          <div
            onClick={() => setActiveTab('faqs')}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-[#007E70] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <span className="text-[11px] text-slate-400 group-hover:text-amber-500 font-bold">
                {faqs.length} Total
              </span>
            </div>
            <div className="text-2xl font-extrabold text-[#0F172A]">{publishedFaqsCount}</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Published FAQs</div>
          </div>

          <div
            onClick={() => setActiveTab('appointments')}
            className="bg-gradient-to-br from-teal-50 to-emerald-50/50 p-4 rounded-2xl border border-teal-200 shadow-2xs hover:border-[#007E70] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-teal-600 mb-2">
              <CalendarCheck className="w-4 h-4 text-[#007E70]" />
              <span className="text-[11px] font-bold text-[#007E70]">
                {appointments.length} Total
              </span>
            </div>
            <div className="text-2xl font-extrabold text-[#007E70]">{newAppointments.length}</div>
            <div className="text-xs font-bold text-slate-700 mt-1">New Booking Req.</div>
          </div>
        </div>
      </div>

      {/* Main Split: Recent Website Appointment Requests & Quick Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Pending Appointment Requests Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">
                Recent Website Appointment Requests
              </h3>
              <p className="text-xs text-slate-400">
                Patient consultation requests received from website booking form
              </p>
            </div>
            <button
              onClick={() => setActiveTab('appointments')}
              className="text-xs font-bold text-[#007E70] hover:text-[#005a50] flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {appointments.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No appointment requests in the queue.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 uppercase tracking-wider text-[10px]">
                    <th className="pb-2">Patient</th>
                    <th className="pb-2">Type / Target</th>
                    <th className="pb-2">Preferred Slot</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {appointments.slice(0, 4).map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-semibold text-slate-900">
                        {req.patientName}
                        <div className="text-[11px] font-normal text-slate-400">{req.phone}</div>
                      </td>
                      <td className="py-3">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {req.requestType}
                        </span>
                      </td>
                      <td className="py-3 text-slate-600">
                        {req.preferredDate}
                        <div className="text-[10px] text-slate-400">{req.preferredTime}</div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            req.status === 'NEW'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : req.status === 'CONFIRMED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => setActiveTab('appointments')}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-[#007E70] text-slate-600 rounded-lg text-[11px] font-bold transition-colors"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Quick Audit Log Feed */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">Administrative Audit Feed</h3>
              <p className="text-xs text-slate-400">Recent content mutations & actions</p>
            </div>
            <button
              onClick={() => setActiveTab('audit-logs')}
              className="text-xs font-bold text-[#007E70] hover:text-[#005a50]"
            >
              Logs
            </button>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {auditLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-bold text-slate-600">{log.entityType}</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="font-bold text-slate-900">{log.action}</div>
                {log.details && (
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {log.details}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Demo Data Reset */}
      <ConfirmationDialog
        isOpen={isResetConfirmOpen}
        title="Reset Content to Verified Baseline?"
        message="This will reset all Doctors, Services, FAQs, and Sample Appointments back to the verified seed dataset. Any customized records will be restored to default."
        confirmLabel="Reset Everything"
        cancelLabel="Keep Current Data"
        isDestructive={true}
        onConfirm={handleResetData}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
