import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Building,
  Upload,
  Search,
  Sparkles,
  Info,
  X,
  RefreshCw,
  ExternalLink,
  Shield,
  Layers
} from 'lucide-react';
import { InsurancePartner } from '../../types';
import { DataAccessLayer } from '../../lib/dal';
import { autoTranslateToBengali } from '../../lib/bengaliTranslator';
import { useAuth } from '../../lib/authContext';

export const InsuranceManager: React.FC = () => {
  const { currentUser } = useAuth();
  const [partners, setPartners] = useState<InsurancePartner[]>(() => DataAccessLayer.getAllInsurancePartners());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<InsurancePartner | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<InsurancePartner | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    nameBn: '',
    type: 'Health Insurance',
    typeBn: 'স্বাস্থ্য বীমা',
    logoUrl: '',
    color: 'from-blue-700 to-indigo-800',
    description: '',
    descriptionBn: '',
    coverageDetails: '',
    coverageDetailsBn: '',
    helpline: '',
    website: '',
    isActive: true,
    displayOrder: 0
  });

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const refreshList = () => {
    setPartners(DataAccessLayer.getAllInsurancePartners());
  };

  useEffect(() => {
    const handleUpdate = () => refreshList();
    window.addEventListener('careon_data_updated', handleUpdate);
    return () => window.removeEventListener('careon_data_updated', handleUpdate);
  }, []);

  const handleOpenAdd = () => {
    setEditingPartner(null);
    setFormData({
      name: '',
      nameBn: '',
      type: 'Health Insurance',
      typeBn: 'স্বাস্থ্য বীমা',
      logoUrl: '',
      color: 'from-blue-700 to-indigo-800',
      description: '',
      descriptionBn: '',
      coverageDetails: '',
      coverageDetailsBn: '',
      helpline: '',
      website: '',
      isActive: true,
      displayOrder: partners.length + 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (partner: InsurancePartner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      nameBn: partner.nameBn || '',
      type: partner.type,
      typeBn: partner.typeBn || '',
      logoUrl: partner.logoUrl || '',
      color: partner.color || 'from-blue-700 to-indigo-800',
      description: partner.description || '',
      descriptionBn: partner.descriptionBn || '',
      coverageDetails: partner.coverageDetails || '',
      coverageDetailsBn: partner.coverageDetailsBn || '',
      helpline: partner.helpline || '',
      website: partner.website || '',
      isActive: partner.isActive,
      displayOrder: partner.displayOrder || 0
    });
    setIsModalOpen(true);
  };

  // Real-time Bengali Auto-Translation Handler
  const handleEnglishNameChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      name: val,
      nameBn: autoTranslateToBengali(val)
    }));
  };

  const handleEnglishTypeChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      type: val,
      typeBn: autoTranslateToBengali(val)
    }));
  };

  const handleEnglishDescChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      description: val,
      descriptionBn: autoTranslateToBengali(val)
    }));
  };

  const handleEnglishCoverageChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      coverageDetails: val,
      coverageDetailsBn: autoTranslateToBengali(val)
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const partnerToSave: InsurancePartner = {
      id: editingPartner ? editingPartner.id : `ins-${Date.now()}`,
      name: formData.name.trim(),
      nameBn: formData.nameBn.trim() || autoTranslateToBengali(formData.name.trim()),
      type: formData.type.trim(),
      typeBn: formData.typeBn.trim() || autoTranslateToBengali(formData.type.trim()),
      logoUrl: formData.logoUrl.trim() || undefined,
      color: formData.color,
      description: formData.description.trim() || undefined,
      descriptionBn: formData.descriptionBn.trim() || undefined,
      coverageDetails: formData.coverageDetails.trim() || undefined,
      coverageDetailsBn: formData.coverageDetailsBn.trim() || undefined,
      helpline: formData.helpline.trim() || undefined,
      website: formData.website.trim() || undefined,
      isActive: formData.isActive,
      status: formData.isActive ? 'ACTIVE' : 'INACTIVE',
      displayOrder: Number(formData.displayOrder) || 1,
      createdAt: editingPartner?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    DataAccessLayer.saveInsurancePartner(partnerToSave, currentUser);
    refreshList();
    setIsModalOpen(false);
    showNotification(
      editingPartner
        ? `Insurance partner "${partnerToSave.name}" updated successfully.`
        : `New insurance partner "${partnerToSave.name}" added.`
    );
  };

  const handleToggleStatus = (id: string) => {
    DataAccessLayer.toggleInsurancePartnerStatus(id, currentUser);
    refreshList();
    showNotification(`Status updated.`);
  };

  const handleDelete = (partner: InsurancePartner) => {
    DataAccessLayer.deleteInsurancePartner(partner.id, currentUser);
    refreshList();
    setDeleteCandidate(null);
    showNotification(`Insurance partner "${partner.name}" deleted permanently.`);
  };

  const filteredPartners = partners.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.nameBn && p.nameBn.includes(searchQuery)) ||
      p.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'ACTIVE' && p.isActive) ||
      (filterStatus === 'INACTIVE' && !p.isActive);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center justify-between shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#007E70] text-xs font-bold uppercase tracking-wider border border-teal-100 mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Insurance & Health Schemes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Insurance Partners Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 max-w-2xl">
            Add, update, or remove accepted health insurance plans, government schemes (e.g. Swasthya Sathi), and TPA coverage displayed across public pages.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-[#007E70] hover:bg-[#00665B] text-white text-xs font-bold rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Insurance Partner</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search insurance or scheme..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#007E70] focus:ring-1 focus:ring-[#007E70]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500">Status:</span>
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  filterStatus === st
                    ? 'bg-white text-[#0B192C] shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {st === 'ALL' ? 'All' : st === 'ACTIVE' ? 'Active' : 'Inactive'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPartners.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-3xl p-5 border transition-all flex flex-col justify-between ${
              item.isActive
                ? 'border-slate-200 shadow-xs hover:shadow-md'
                : 'border-slate-200/60 bg-slate-50/50 opacity-75'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {item.logoUrl ? (
                    <img
                      src={item.logoUrl}
                      alt={item.name}
                      className="w-11 h-11 rounded-2xl object-contain p-1 border border-slate-100 bg-white shadow-2xs"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white flex items-center justify-center font-extrabold text-sm shadow-2xs">
                      {item.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-extrabold text-[#0B192C] leading-tight">
                      {item.name}
                    </h3>
                    {item.nameBn && (
                      <p className="text-xs font-semibold text-[#007E70] font-bengali">
                        {item.nameBn}
                      </p>
                    )}
                  </div>
                </div>

                {/* Active Badge */}
                <button
                  onClick={() => handleToggleStatus(item.id)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase cursor-pointer transition-colors ${
                    (item.isActive !== false && item.status !== 'INACTIVE')
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {(item.isActive !== false && item.status !== 'INACTIVE') ? 'Active' : 'Inactive'}
                </button>
              </div>

              {/* Type and Description */}
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-600">
                  {item.type} {item.typeBn && <span className="font-bengali text-slate-400 font-normal">({item.typeBn})</span>}
                </div>
                {item.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-400 text-[11px]">Order: #{item.displayOrder || 1}</span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-[#007E70] text-slate-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => setDeleteCandidate(item)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal with Bengali Auto-Translate */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
          <div
            className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#007E70] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0F172A]">
                    {editingPartner ? 'Edit Insurance Partner' : 'Add New Insurance Partner'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Typing in English auto-generates Bengali translations.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center border border-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4">
              {/* Partner Name (English + Bengali) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span>Partner / Scheme Name (English)</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleEnglishNameChange(e.target.value)}
                    placeholder="e.g. Swasthya Sathi / Star Health"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#007E70]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#007E70] flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    <span>বাংলা নাম (Auto-translated)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nameBn}
                    onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                    placeholder="স্বাস্থ্য সাথী / স্টার হেলথ"
                    className="w-full px-3.5 py-2 bg-teal-50/50 border border-teal-200 rounded-xl text-xs font-medium text-slate-800 font-bengali focus:outline-none focus:border-[#007E70]"
                  />
                </div>
              </div>

              {/* Type (English + Bengali) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Category / Type (English)
                  </label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) => handleEnglishTypeChange(e.target.value)}
                    placeholder="e.g. Govt Health Scheme, Health Insurance"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#007E70]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#007E70] flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    <span>বাংলা ধরণ (Auto-translated)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.typeBn}
                    onChange={(e) => setFormData({ ...formData, typeBn: e.target.value })}
                    placeholder="সরকারি স্বাস্থ্য স্কিম / স্বাস্থ্য বীমা"
                    className="w-full px-3.5 py-2 bg-teal-50/50 border border-teal-200 rounded-xl text-xs font-medium text-slate-800 font-bengali focus:outline-none focus:border-[#007E70]"
                  />
                </div>
              </div>

              {/* Logo URL */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Logo Image URL (Optional)</label>
                  {formData.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logoUrl: '' })}
                      className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                    >
                      Clear Logo
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="https://... or choose from Media Library"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#007E70]"
                />
                {formData.logoUrl && (
                  <div className="mt-1 h-12 w-24 p-1 rounded-lg border border-slate-200 bg-white flex items-center justify-center overflow-hidden">
                    <img
                      src={formData.logoUrl}
                      alt="Logo preview"
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>

              {/* Description (English + Bengali) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Description (English)</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => handleEnglishDescChange(e.target.value)}
                    placeholder="Brief description of coverage or reimbursement support"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#007E70]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#007E70] flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    <span>বাংলা বিবরণ (Auto-translated)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formData.descriptionBn}
                    onChange={(e) => setFormData({ ...formData, descriptionBn: e.target.value })}
                    placeholder="কভারেজ ও রিইমবার্সমেন্ট সহায়তার বিবরণ"
                    className="w-full px-3.5 py-2 bg-teal-50/50 border border-teal-200 rounded-xl text-xs font-medium text-slate-800 font-bengali focus:outline-none focus:border-[#007E70]"
                  />
                </div>
              </div>

              {/* Display Order & Active */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#007E70]"
                  />
                </div>

                <div className="flex items-center gap-3 pt-5">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#007E70]"></div>
                  </label>
                  <span className="text-xs font-bold text-slate-700">Display as Active on Website</span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <div>
                  {editingPartner && (
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteCandidate(editingPartner);
                      }}
                      className="px-4 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Partner</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#007E70] hover:bg-[#00665B] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    {editingPartner ? 'Save Changes' : 'Create Partner'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
          <div
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col p-6 text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-[#0F172A]">
                Delete Insurance Partner?
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Are you sure you want to permanently remove <strong className="text-slate-900 font-bold">"{deleteCandidate.name}"</strong>? This will remove it from public display.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteCandidate)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
              >
                Delete Partner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
