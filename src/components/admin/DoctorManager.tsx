import React, { useState, useEffect, useMemo } from 'react';
import { DataAccessLayer } from '../../lib/dal';
import { apiClient } from '../../lib/apiClient';
import { useAuth } from '../../lib/authContext';
import { Doctor, ContentStatus } from '../../types';
import { MASTER_DEPARTMENTS } from '../../data/medicalMasters';
import { DoctorFormModal } from './DoctorFormModal';
import { ConfirmationDialog } from './ConfirmationDialog';
import { CareOnDoctorFallback } from '../common/CareOnMedia';
import {
  Users,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Stethoscope,
  Filter,
  RefreshCw,
  Server,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';

export const DoctorManager: React.FC = () => {
  const { currentUser } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<{ message: string; type: 'success' | 'error' | 'idle' }>({
    message: '',
    type: 'idle'
  });
  const [dbHealth, setDbHealth] = useState<{
    connected?: boolean;
    permissionsGranted?: boolean;
    tablesReady?: boolean;
    sqlGrantScript?: string;
    doctorsCount?: number;
    error?: string;
  } | null>(null);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [doctorToEdit, setDoctorToEdit] = useState<Partial<Doctor> | null>(null);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);

  const checkHealthStatus = async () => {
    try {
      const health = await apiClient.checkHealth();
      if (health?.database) {
        setDbHealth(health.database);
      }
    } catch {
      // ignore
    }
  };

  const loadDoctors = async (forceApiFetch = false) => {
    try {
      if (forceApiFetch) {
        setIsLoading(true);
        checkHealthStatus();
        const fetched = await DataAccessLayer.fetchDoctorsFromApi();
        setDoctors(fetched);
        setSyncStatus({ message: `Synchronized ${fetched.length} doctor(s) from Production API`, type: 'success' });
      } else {
        const local = DataAccessLayer.getAllDoctors();
        setDoctors(local);
        // Also fetch from API in background if needed
        DataAccessLayer.fetchDoctorsFromApi().then((fresh) => {
          setDoctors(fresh);
        }).catch(() => {});
      }
    } catch (err: any) {
      setSyncStatus({ message: `API Sync warning: ${err.message}`, type: 'error' });
      setDoctors(DataAccessLayer.getAllDoctors());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors(true);
    const handleUpdate = () => {
      setDoctors(DataAccessLayer.getAllDoctors());
    };
    window.addEventListener('careon_data_updated', handleUpdate);
    return () => window.removeEventListener('careon_data_updated', handleUpdate);
  }, []);

  // Filtered doctors based on search, status, and department
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      // Status filter
      if (statusFilter === 'active' && doc.status !== 'ACTIVE' && doc.active === false) {
        return false;
      }
      if (statusFilter === 'inactive' && doc.status === 'ACTIVE' && doc.active !== false) {
        return false;
      }

      // Department filter
      if (departmentFilter !== 'all' && doc.departmentId !== departmentFilter) {
        return false;
      }

      // Search query (doctor name, department name, qualification, specialty)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const deptObj = MASTER_DEPARTMENTS.find((d) => d.id === doc.departmentId);
        const deptName = deptObj ? deptObj.name.toLowerCase() : '';
        const nameMatches = doc.name.toLowerCase().includes(q) || (doc.nameBn && doc.nameBn.includes(q));
        const deptMatches = deptName.includes(q);
        const qualMatches = doc.qualification && doc.qualification.toLowerCase().includes(q);
        const specMatches = doc.specialtyId && doc.specialtyId.toLowerCase().includes(q);

        if (!nameMatches && !deptMatches && !qualMatches && !specMatches) {
          return false;
        }
      }

      return true;
    });
  }, [doctors, statusFilter, departmentFilter, searchQuery]);

  // Handle Save Doctor (Create or Update)
  const handleSaveDoctor = async (doctorData: Partial<Doctor>) => {
    if (!doctorData.name || !doctorData.departmentId) {
      alert('Doctor Name and Department are required.');
      return;
    }

    if (!currentUser) {
      alert('You must be logged in as an Administrator to save doctor records.');
      return;
    }

    setIsSaving(true);
    try {
      if (doctorToEdit && doctorToEdit.id) {
        await DataAccessLayer.saveDoctorAsync(
          { ...doctorData, id: doctorToEdit.id, name: doctorData.name, departmentId: doctorData.departmentId },
          currentUser
        );
      } else {
        await DataAccessLayer.saveDoctorAsync(
          { ...doctorData, name: doctorData.name, departmentId: doctorData.departmentId },
          currentUser
        );
      }
      setIsFormOpen(false);
      setDoctorToEdit(null);
      await loadDoctors(true);
      setSyncStatus({ message: 'Doctor successfully saved to Production Store.', type: 'success' });
    } catch (err: any) {
      alert(err?.message || 'Error saving doctor. Please try again.');
      setSyncStatus({ message: `Save error: ${err.message}`, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete Doctor
  const handleConfirmDelete = async () => {
    if (!doctorToDelete || !currentUser) return;
    setIsSaving(true);
    try {
      await DataAccessLayer.deleteDoctorAsync(doctorToDelete.id, currentUser);
      setDoctorToDelete(null);
      await loadDoctors(true);
      setSyncStatus({ message: `Doctor ${doctorToDelete.name} removed from Production Store.`, type: 'success' });
    } catch (err: any) {
      alert(err?.message || 'Error deleting doctor.');
      setSyncStatus({ message: `Delete error: ${err.message}`, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle active status
  const handleToggleStatus = (doc: Doctor) => {
    if (!currentUser) return;
    const nextStatus: ContentStatus = doc.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    DataAccessLayer.toggleDoctorStatus(doc.id, nextStatus, currentUser);
    loadDoctors();
  };

  // Get department display name
  const getDepartmentName = (deptId: string): string => {
    const found = MASTER_DEPARTMENTS.find((d) => d.id === deptId);
    return found ? found.name : deptId;
  };

  // Format schedule text for card
  const getScheduleSummary = (doc: Doctor): string => {
    if (Array.isArray(doc.schedules) && doc.schedules.length > 0) {
      return doc.schedules.map((s) => `${s.day.slice(0, 3)}: ${s.startTime} – ${s.endTime}`).join(' | ');
    }
    if (doc.consultationDays && doc.consultationDays.length > 0) {
      return `${doc.consultationDays.join(', ')} • ${doc.consultationTime || 'Consultation'}`;
    }
    return doc.consultationTime || 'Schedule on appointment';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Users className="w-6 h-6 text-[#007E70]" />
              <span>Doctor Management</span>
            </h1>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
              <Server className="w-3 h-3" />
              <span>Production API Connected ({apiClient.getBaseUrl()})</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {doctors.length} configured doctor{doctors.length === 1 ? '' : 's'} registered at CareOn Medical Clinic — Synchronized across Preview, Admin & Public Website
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => loadDoctors(true)}
            disabled={isLoading}
            title="Fetch authoritative doctor records from Production Store"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer min-h-[44px] disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Syncing...' : 'Sync Server'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setDoctorToEdit(null);
              setIsFormOpen(true);
            }}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#007E70] hover:bg-[#009282] active:bg-[#006e62] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm shadow-teal-900/20 transition-all cursor-pointer min-h-[44px] disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add Doctor</span>
          </button>
        </div>
      </div>

      {/* PostgreSQL Permission Alert Banner */}
      {dbHealth && dbHealth.permissionsGranted === false && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  Supabase PostgreSQL Permissions (GRANT) Required
                </h4>
                <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                  The application is connected to Supabase PostgreSQL, but the database role requires table access permissions.
                  Run the SQL command below in your <span className="font-semibold underline">Supabase Dashboard &gt; SQL Editor</span>, then click "Sync Server".
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (dbHealth.sqlGrantScript) {
                  navigator.clipboard.writeText(dbHealth.sqlGrantScript);
                  setCopiedSql(true);
                  setTimeout(() => setCopiedSql(false), 3000);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer self-start sm:self-auto"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Grant Script'}</span>
            </button>
          </div>
          {dbHealth.sqlGrantScript && (
            <pre className="p-3 bg-white/80 border border-amber-200 rounded-xl text-[11px] font-mono text-amber-950 overflow-x-auto select-all leading-snug">
              {dbHealth.sqlGrantScript}
            </pre>
          )}
        </div>
      )}

      {/* Sync Status Banner */}
      {syncStatus.message && (
        <div
          className={`flex items-center justify-between p-3 rounded-xl text-xs font-semibold ${
            syncStatus.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-teal-50 text-[#007E70] border border-teal-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {syncStatus.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#007E70] shrink-0" />
            )}
            <span>{syncStatus.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setSyncStatus({ message: '', type: 'idle' })}
            className="text-slate-400 hover:text-slate-600 cursor-pointer text-xs ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Filters Bar */}
      <div className="space-y-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by doctor name, department, qualification, or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007E70]/20 focus:border-[#007E70] transition-all min-h-[44px]"
            />
          </div>

          {/* Department Filter */}
          <div className="w-full md:w-64">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007E70]/20 focus:border-[#007E70] min-h-[44px]"
            >
              <option value="all">All Departments</option>
              {MASTER_DEPARTMENTS.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Status:
          </span>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer min-h-[36px] ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({doctors.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer min-h-[36px] ${
              statusFilter === 'active'
                ? 'bg-[#007E70] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Active ({doctors.filter((d) => d.status === 'ACTIVE').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer min-h-[36px] ${
              statusFilter === 'inactive'
                ? 'bg-rose-700 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Inactive ({doctors.filter((d) => d.status !== 'ACTIVE').length})
          </button>
        </div>
      </div>

      {/* Doctor Cards List - Mobile First */}
      {filteredDoctors.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#007E70] flex items-center justify-center mx-auto">
            <Stethoscope className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {doctors.length === 0
              ? 'No Doctors Configured Yet'
              : 'No doctors match your search or filter'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {doctors.length === 0
              ? 'Click "+ Add Doctor" above to configure your first clinical doctor profile with schedule and chamber.'
              : 'Try clearing your search query or selecting "All Departments" to view registered doctors.'}
          </p>
          {doctors.length === 0 && (
            <button
              type="button"
              onClick={() => {
                setDoctorToEdit(null);
                setIsFormOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#007E70] text-white text-xs font-bold rounded-xl hover:bg-[#009282] transition-colors cursor-pointer min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Doctor</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {filteredDoctors.map((doctor) => {
            const isActive = doctor.status === 'ACTIVE';
            const photo = doctor.photoUrl || doctor.profilePhotoUrl;

            return (
              <div
                key={doctor.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between gap-4"
              >
                {/* Top Row: Photo + Core Info */}
                <div className="flex items-start gap-3.5">
                  {/* Photo */}
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-2xs">
                    {photo ? (
                      <img
                        src={photo}
                        alt={doctor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <CareOnDoctorFallback
                        doctor={doctor}
                        className="w-full h-full"
                      />
                    )}
                  </div>

                  {/* Text Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                        {doctor.name}
                      </h3>
                      {/* Active Status Badge Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(doctor)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-slate-400" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Bengali Name if set */}
                    {doctor.nameBn && (
                      <p className="text-xs text-slate-500 font-medium truncate">
                        {doctor.nameBn}
                      </p>
                    )}

                    {/* Designation & Qualification */}
                    <p className="text-xs font-semibold text-[#007E70] mt-0.5 truncate">
                      {doctor.designation} • {doctor.qualification}
                    </p>

                    {/* Department Tag */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[10px] font-bold border border-teal-100 truncate max-w-[200px]">
                        {getDepartmentName(doctor.departmentId)}
                      </span>
                      {doctor.registrationNumber && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          Reg: {doctor.registrationNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Middle Info: Schedule & Chamber */}
                <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-[#007E70] shrink-0" />
                    <span className="font-semibold truncate">{getScheduleSummary(doctor)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {doctor.chamberCustom || doctor.chamberId || doctor.roomNumber || 'CareOn Medical Clinic'}
                    </span>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    ID: {doctor.id}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDoctorToEdit(doctor);
                        setIsFormOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors cursor-pointer min-h-[36px]"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDoctorToDelete(doctor)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg text-xs font-medium border border-transparent hover:border-rose-200 transition-colors cursor-pointer min-h-[36px]"
                      title="Delete doctor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Doctor Form Modal */}
      <DoctorFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setDoctorToEdit(null);
        }}
        onSave={handleSaveDoctor}
        initialData={doctorToEdit}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(doctorToDelete)}
        onCancel={() => setDoctorToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Doctor Profile"
        message={`Are you sure you want to permanently remove "${doctorToDelete?.name}" from CareOn Medical Clinic? This will immediately remove their profile and consultation schedule from the public website.`}
        confirmLabel="Delete Doctor"
        isDestructive={true}
      />
    </div>
  );
};
