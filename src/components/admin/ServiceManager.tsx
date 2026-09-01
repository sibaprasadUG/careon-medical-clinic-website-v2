import React, { useState, useEffect } from 'react';
import { DataAccessLayer, generateSlug } from '../../lib/dal';
import { useAuth } from '../../lib/authContext';
import { Service, Department, ContentStatus, ServiceType } from '../../types';
import {
  Activity,
  Plus,
  Search,
  Filter,
  Star,
  Edit2,
  Eye,
  CheckCircle2,
  XCircle,
  ArrowUp,
  ArrowDown,
  X,
  Clock,
  FileText,
  Home,
  Building2
} from 'lucide-react';
import { ConfirmationDialog } from './ConfirmationDialog';
import { autoTranslateToBengali } from '../../lib/bengaliTranslator';

export const ServiceManager: React.FC = () => {
  const { currentUser } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
  const [previewService, setPreviewService] = useState<Service | null>(null);
  const [statusConfirm, setStatusConfirm] = useState<{ service: Service; targetStatus: ContentStatus } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [formState, setFormState] = useState<{
    name: string;
    nameBn: string;
    slug: string;
    departmentId: string;
    category: 'Diagnostic' | 'Preventive' | 'Consultation' | 'Specialized';
    serviceType: ServiceType;
    availableForHome: boolean;
    availableAtClinic: boolean;
    shortDescription: string;
    description: string;
    prepInstructionsStr: string;
    reportTurnaroundTime: string;
    bookingEnabled: boolean;
    featured: boolean;
    displayOrder: number;
    status: ContentStatus;
  }>({
    name: '',
    nameBn: '',
    slug: '',
    departmentId: '',
    category: 'Preventive',
    serviceType: 'CLINIC',
    availableForHome: false,
    availableAtClinic: true,
    shortDescription: '',
    description: '',
    prepInstructionsStr: 'Overnight fasting of 8-10 hours required for fasting tests.\nDrink normal water as needed.',
    reportTurnaroundTime: 'Same-day evening or 24 hours',
    bookingEnabled: true,
    featured: false,
    displayOrder: 1,
    status: 'ACTIVE'
  });

  const loadData = () => {
    setServices(DataAccessLayer.getAllServices());
    setDepartments(DataAccessLayer.getAllDepartments());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('careon_data_updated', handleUpdate);
    return () => window.removeEventListener('careon_data_updated', handleUpdate);
  }, []);

  const departmentMap = new Map(departments.map((d) => [d.id, d.name]));

  const filteredServices = services.filter((srv) => {
    const matchesSearch =
      srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'all' || srv.category === selectedCategoryFilter;
    const matchesType =
      selectedTypeFilter === 'all' ||
      srv.serviceType === selectedTypeFilter ||
      (selectedTypeFilter === 'HOME' && srv.availableForHome) ||
      (selectedTypeFilter === 'CLINIC' && srv.availableAtClinic);
    const matchesStatus = selectedStatusFilter === 'all' || srv.status === selectedStatusFilter;
    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormError(null);
    const maxOrder = services.reduce((max, s) => Math.max(max, s.displayOrder || 0), 0);
    setFormState({
      name: '',
      nameBn: '',
      slug: '',
      departmentId: departments[0]?.id || 'dept-gen-med',
      category: 'Preventive',
      serviceType: 'CLINIC',
      availableForHome: false,
      availableAtClinic: true,
      shortDescription: '',
      description: '',
      prepInstructionsStr: '',
      reportTurnaroundTime: 'Same-day',
      bookingEnabled: true,
      featured: false,
      displayOrder: maxOrder + 1,
      status: 'ACTIVE'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (srv: Service) => {
    setEditingService(srv);
    setFormError(null);
    const prepStr = Array.isArray(srv.preparationInstructions)
      ? srv.preparationInstructions.join('\n')
      : (srv.preparationInstructions || '');
    setFormState({
      name: srv.name,
      nameBn: srv.nameBn || '',
      slug: srv.slug,
      departmentId: srv.departmentId,
      category: srv.category as 'Preventive' | 'Diagnostic' | 'Consultation' | 'Specialized',
      serviceType: srv.serviceType || 'CLINIC',
      availableForHome: srv.availableForHome ?? (srv.serviceType === 'HOME' || srv.serviceType === 'BOTH'),
      availableAtClinic: srv.availableAtClinic ?? (srv.serviceType === 'CLINIC' || srv.serviceType === 'BOTH'),
      shortDescription: srv.shortDescription,
      description: srv.description,
      prepInstructionsStr: prepStr,
      reportTurnaroundTime: srv.reportTurnaroundTime || 'Same-day',
      bookingEnabled: srv.bookingEnabled,
      featured: srv.featured,
      displayOrder: srv.displayOrder,
      status: srv.status
    });
    setIsFormOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setFormError(null);

    if (!formState.name.trim()) {
      setFormError('Service name is required.');
      return;
    }
    if (!formState.departmentId) {
      setFormError('Please select a department for this service.');
      return;
    }

    const prepList = formState.prepInstructionsStr
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      DataAccessLayer.saveService(
        {
          ...(editingService ? { id: editingService.id } : {}),
          name: formState.name.trim(),
          nameBn: formState.nameBn.trim(),
          slug: formState.slug.trim() || generateSlug(formState.name),
          departmentId: formState.departmentId,
          category: formState.category,
          serviceType: formState.serviceType,
          availableForHome: formState.availableForHome,
          availableAtClinic: formState.availableAtClinic,
          shortDescription: formState.shortDescription.trim(),
          description: formState.description.trim(),
          preparationInstructions: prepList,
          reportTurnaroundTime: formState.reportTurnaroundTime.trim(),
          bookingEnabled: formState.bookingEnabled,
          featured: formState.featured,
          displayOrder: Number(formState.displayOrder) || 1,
          status: formState.status
        },
        currentUser
      );
      setIsFormOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save service.');
    }
  };

  const handleToggleStatus = (srv: Service, target: ContentStatus) => {
    setStatusConfirm({ service: srv, targetStatus: target });
  };

  const handleExecuteStatusChange = () => {
    if (!statusConfirm || !currentUser) return;
    DataAccessLayer.toggleServiceStatus(statusConfirm.service.id, statusConfirm.targetStatus, currentUser);
    setStatusConfirm(null);
  };

  const getServiceTypeBadge = (type: ServiceType) => {
    switch (type) {
      case 'HOME':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
            <Home className="w-3 h-3" />
            <span>HOME SERVICE</span>
          </span>
        );
      case 'BOTH':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[10px] font-bold border border-teal-200">
            <Building2 className="w-3 h-3" />
            <span>CLINIC & HOME</span>
          </span>
        );
      case 'CLINIC':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
            <Building2 className="w-3 h-3" />
            <span>CLINIC SERVICE</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
            Clinical & Home Services
          </h2>
          <p className="text-xs text-slate-500">
            Manage medical checkup packages, diagnostic tests, doorstep home sample collections, and booking triggers.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#007E70] hover:bg-[#009282] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#007E70]"
            />
          </div>

          <div>
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#007E70]"
            >
              <option value="all">All Service Types</option>
              <option value="CLINIC">Clinic Services Only</option>
              <option value="HOME">Home Services Only</option>
              <option value="BOTH">Clinic & Home (Both)</option>
            </select>
          </div>

          <div>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#007E70]"
            >
              <option value="all">All Categories</option>
              <option value="Preventive">Preventive</option>
              <option value="Diagnostic">Diagnostic</option>
              <option value="Consultation">Consultation</option>
              <option value="Specialized">Specialized</option>
            </select>
          </div>

          <div>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#007E70]"
            >
              <option value="all">All Statuses</option>
              <option value="ACTIVE">ACTIVE (Published)</option>
              <option value="INACTIVE">INACTIVE (Hidden)</option>
              <option value="DRAFT">DRAFT</option>
            </select>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Service Details</th>
                <th className="py-3.5 px-4">Type & Category</th>
                <th className="py-3.5 px-4">Report Turnaround</th>
                <th className="py-3.5 px-4 text-center">Online Booking</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredServices.map((srv) => (
                <tr key={srv.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{srv.name}</div>
                    {srv.nameBn && (
                      <div className="text-[11px] text-slate-400 font-bengali">{srv.nameBn}</div>
                    )}
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      {srv.shortDescription}
                    </p>
                  </td>

                  <td className="py-3.5 px-4 space-y-1">
                    <div>{getServiceTypeBadge(srv.serviceType || 'CLINIC')}</div>
                    <div className="text-[10px] text-slate-400">
                      {srv.category} • {departmentMap.get(srv.departmentId) || 'General'}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{srv.reportTurnaroundTime || 'Standard'}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        srv.bookingEnabled
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {srv.bookingEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        srv.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {srv.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setPreviewService(srv)}
                        className="p-1.5 text-slate-400 hover:text-[#007E70] hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                        title="Preview Public Service Card"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenEdit(srv)}
                        className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {srv.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleToggleStatus(srv, 'INACTIVE')}
                          className="px-2 py-1 text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(srv, 'ACTIVE')}
                          className="px-2 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#007E70] flex items-center justify-center font-bold">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">
                    {editingService ? 'Edit Clinical / Home Service' : 'Add New Service'}
                  </h3>
                  <p className="text-xs text-slate-400">Configure medical service delivery modality and clinical guidelines</p>
                </div>
              </div>

              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 text-xs rounded-xl">
                  {formError}
                </div>
              )}

              {/* Service Type Delivery Choice */}
              <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <label className="block text-xs font-bold text-[#0F172A]">
                  Service Delivery Modality <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormState({
                        ...formState,
                        serviceType: 'CLINIC',
                        availableAtClinic: true,
                        availableForHome: false
                      })
                    }
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      formState.serviceType === 'CLINIC'
                        ? 'bg-teal-50 border-[#007E70] text-[#007E70] shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Clinic Service</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormState({
                        ...formState,
                        serviceType: 'HOME',
                        availableAtClinic: false,
                        availableForHome: true
                      })
                    }
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      formState.serviceType === 'HOME'
                        ? 'bg-purple-50 border-purple-600 text-purple-700 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>Home Service</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormState({
                        ...formState,
                        serviceType: 'BOTH',
                        availableAtClinic: true,
                        availableForHome: true
                      })
                    }
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      formState.serviceType === 'BOTH'
                        ? 'bg-teal-50 border-[#007E70] text-[#007E70] shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Clinic & Home</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F172A]">
                  Service Title (English) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formState.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormState((prev) => ({
                      ...prev,
                      name: val,
                      nameBn: autoTranslateToBengali(val)
                    }));
                  }}
                  placeholder="e.g. Comprehensive Health & Preventive Checkup"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#007E70] flex items-center justify-between">
                  <span>Bengali Title (বাংলা নাম)</span>
                  <span className="text-[10px] text-teal-600 font-semibold">✨ Auto-translated</span>
                </label>
                <input
                  type="text"
                  value={formState.nameBn}
                  onChange={(e) => setFormState({ ...formState, nameBn: e.target.value })}
                  placeholder="e.g. সার্বিক স্বাস্থ্য পরীক্ষা ও প্রতিরোধমূলক চেকআপ"
                  className="w-full px-3 py-2 bg-teal-50/50 border border-teal-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none font-bengali"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0F172A]">
                    Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formState.departmentId}
                    onChange={(e) => setFormState({ ...formState, departmentId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0F172A]">
                    Category
                  </label>
                  <select
                    value={formState.category}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        category: e.target.value as 'Diagnostic' | 'Preventive' | 'Consultation' | 'Specialized'
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                  >
                    <option value="Preventive">Preventive</option>
                    <option value="Diagnostic">Diagnostic</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Specialized">Specialized</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F172A]">
                  Short Summary
                </label>
                <textarea
                  rows={2}
                  value={formState.shortDescription}
                  onChange={(e) => setFormState({ ...formState, shortDescription: e.target.value })}
                  placeholder="Clear description for public cards..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F172A]">
                  Preparation Instructions (One per line)
                </label>
                <textarea
                  rows={3}
                  value={formState.prepInstructionsStr}
                  onChange={(e) => setFormState({ ...formState, prepInstructionsStr: e.target.value })}
                  placeholder="Overnight fasting required...&#10;Drink normal water..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F172A]">
                  Report Turnaround Time
                </label>
                <input
                  type="text"
                  value={formState.reportTurnaroundTime}
                  onChange={(e) => setFormState({ ...formState, reportTurnaroundTime: e.target.value })}
                  placeholder="e.g. Same-day evening or 24 hours"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0F172A]">
                    Status
                  </label>
                  <select
                    value={formState.status}
                    onChange={(e) =>
                      setFormState({ ...formState, status: e.target.value as ContentStatus })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE (Published)</option>
                    <option value="INACTIVE">INACTIVE (Hidden)</option>
                    <option value="DRAFT">DRAFT</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0F172A]">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formState.displayOrder}
                    onChange={(e) => setFormState({ ...formState, displayOrder: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formState.bookingEnabled}
                    onChange={(e) => setFormState({ ...formState, bookingEnabled: e.target.checked })}
                    className="w-4 h-4 text-[#007E70] rounded border-slate-300 focus:ring-[#007E70]"
                  />
                  <span>Enable Online Booking Trigger</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formState.featured}
                    onChange={(e) => setFormState({ ...formState, featured: e.target.checked })}
                    className="w-4 h-4 text-[#007E70] rounded border-slate-300 focus:ring-[#007E70]"
                  />
                  <span>Feature on Homepage</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#007E70] hover:bg-[#009282] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  {editingService ? 'Save Changes' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                Service Preview
              </span>
              <button
                onClick={() => setPreviewService(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-teal-50 text-[#007E70] text-[10px] font-bold">
                  {previewService.category}
                </span>
                {getServiceTypeBadge(previewService.serviceType || 'CLINIC')}
              </div>
              <h4 className="text-sm font-bold text-[#0F172A]">{previewService.name}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{previewService.shortDescription}</p>

              {previewService.preparationInstructions && (
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-[11px] space-y-1">
                  <div className="text-slate-400 text-[10px] font-bold uppercase">Preparation Guidelines</div>
                  {Array.isArray(previewService.preparationInstructions) ? (
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                      {previewService.preparationInstructions.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-600">{previewService.preparationInstructions}</p>
                  )}
                </div>
              )}

              <button className="w-full py-2 bg-[#007E70] text-white text-xs font-bold rounded-xl text-center">
                Book This Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATUS CONFIRMATION */}
      <ConfirmationDialog
        isOpen={Boolean(statusConfirm)}
        title={
          statusConfirm?.targetStatus === 'ACTIVE'
            ? 'Publish Clinical Service?'
            : 'Deactivate Clinical Service?'
        }
        message={
          statusConfirm?.targetStatus === 'ACTIVE'
            ? `Service "${statusConfirm.service.name}" will become immediately discoverable on the public website.`
            : `Service "${statusConfirm?.service.name}" will be hidden from the public website, but its configuration is retained.`
        }
        confirmLabel={statusConfirm?.targetStatus === 'ACTIVE' ? 'Publish Service' : 'Deactivate'}
        isDestructive={statusConfirm?.targetStatus !== 'ACTIVE'}
        onConfirm={handleExecuteStatusChange}
        onCancel={() => setStatusConfirm(null)}
      />
    </div>
  );
};
