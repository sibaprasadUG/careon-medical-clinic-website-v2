import React, { useState, useEffect } from 'react';
import { DataAccessLayer, generateSlug } from '../../lib/dal';
import { useAuth } from '../../lib/authContext';
import { Department, Doctor, Service, ContentStatus } from '../../types';
import {
  Layers,
  Plus,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowUp,
  ArrowDown,
  X,
  Stethoscope,
  Activity,
  Heart,
  Baby,
  ShieldCheck,
  Eye,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { ConfirmationDialog } from './ConfirmationDialog';
import { autoTranslateToBengali } from '../../lib/bengaliTranslator';

export const DepartmentManager: React.FC = () => {
  const { currentUser } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingDept, setEditingDept] = useState<Partial<Department> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Department | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [deactivateWarning, setDeactivateWarning] = useState<{
    dept: Department;
    activeDoctors: Doctor[];
    activeServices: Service[];
  } | null>(null);

  const [formState, setFormState] = useState<{
    name: string;
    nameBn: string;
    slug: string;
    shortDescription: string;
    description: string;
    imageUrl: string;
    icon: string;
    featured: boolean;
    displayOrder: number;
    status: ContentStatus;
  }>({
    name: '',
    nameBn: '',
    slug: '',
    shortDescription: '',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
    icon: 'Stethoscope',
    featured: true,
    displayOrder: 1,
    status: 'ACTIVE'
  });

  const loadData = () => {
    setDepartments(DataAccessLayer.getAllDepartments());
    setDoctors(DataAccessLayer.getAllDoctors());
    setServices(DataAccessLayer.getAllServices());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('careon_data_updated', handleUpdate);
    return () => window.removeEventListener('careon_data_updated', handleUpdate);
  }, []);

  const handleOpenAdd = () => {
    setEditingDept(null);
    setFormError(null);
    const maxOrder = departments.reduce((max, d) => Math.max(max, d.displayOrder || 0), 0);
    setFormState({
      name: '',
      nameBn: '',
      slug: '',
      shortDescription: '',
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
      icon: 'Stethoscope',
      featured: true,
      displayOrder: maxOrder + 1,
      status: 'ACTIVE'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept);
    setFormError(null);
    setFormState({
      name: dept.name,
      nameBn: dept.nameBn || '',
      slug: dept.slug,
      shortDescription: dept.shortDescription,
      description: dept.description,
      imageUrl: dept.imageUrl || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
      icon: dept.icon || 'Stethoscope',
      featured: dept.featured,
      displayOrder: dept.displayOrder,
      status: dept.status
    });
    setIsFormOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setFormError(null);

    if (!formState.name.trim()) {
      setFormError('Department name is required.');
      return;
    }

    try {
      DataAccessLayer.saveDepartment(
        {
          ...(editingDept ? { id: editingDept.id } : {}),
          name: formState.name.trim(),
          nameBn: formState.nameBn.trim(),
          slug: formState.slug.trim() || generateSlug(formState.name),
          shortDescription: formState.shortDescription.trim(),
          description: formState.description.trim(),
          imageUrl: formState.imageUrl.trim(),
          icon: formState.icon,
          featured: formState.featured,
          displayOrder: Number(formState.displayOrder) || 1,
          status: formState.status
        },
        currentUser
      );
      setIsFormOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save department.');
    }
  };

  const handleDeactivateClick = (dept: Department) => {
    const deps = DataAccessLayer.getDepartmentDependencies(dept.id);
    setDeactivateWarning({
      dept,
      activeDoctors: deps.activeDoctors,
      activeServices: deps.activeServices
    });
  };

  const handleExecuteDeactivation = () => {
    if (!deactivateWarning || !currentUser) return;
    DataAccessLayer.toggleDepartmentStatus(deactivateWarning.dept.id, 'INACTIVE', currentUser);
    setDeactivateWarning(null);
  };

  const handleActivateClick = (dept: Department) => {
    if (!currentUser) return;
    DataAccessLayer.toggleDepartmentStatus(dept.id, 'ACTIVE', currentUser);
  };

  const handleDeleteDepartment = () => {
    if (!deleteConfirm || !currentUser) return;
    DataAccessLayer.deleteDepartment(deleteConfirm.id, currentUser);
    setDeleteConfirm(null);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
            Department Management
          </h2>
          <p className="text-xs text-slate-500">
            Organize medical specialties, manage relational links to doctors and services.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#007E70] hover:bg-[#009282] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Relational Architecture Notice */}
      <div className="p-4 bg-teal-50/70 border border-teal-200/70 rounded-2xl flex items-start gap-3 text-xs text-teal-950">
        <Layers className="w-5 h-5 text-[#007E70] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-bold">Relational Integrity:</strong> Doctors and Clinical Services link directly to these departments via <code className="px-1.5 py-0.5 bg-white rounded border border-teal-200 font-mono text-[10px]">departmentId</code>. Deactivating a department checks for linked practitioners to prevent broken patient pathways.
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {departments.map((dept) => {
          const linkedDocs = doctors.filter((d) => d.departmentId === dept.id);
          const linkedSrvs = services.filter((s) => s.departmentId === dept.id);

          return (
            <div
              key={dept.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#007E70] flex items-center justify-center font-bold">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      dept.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {dept.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">{dept.name}</h3>
                  {dept.nameBn && (
                    <p className="text-xs text-slate-400 font-bengali mt-0.5">{dept.nameBn}</p>
                  )}
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-2">
                    {dept.shortDescription}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center gap-3 text-[11px] text-slate-500">
                  <span>
                    <strong className="text-slate-800">{linkedDocs.length}</strong> Linked Doctors
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-slate-800">{linkedSrvs.length}</strong> Services
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  Slug: /{dept.slug}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(dept)}
                    className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Edit Department"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {dept.status === 'ACTIVE' ? (
                    <button
                      onClick={() => handleDeactivateClick(dept)}
                      className="px-2.5 py-1 text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivateClick(dept)}
                      className="px-2.5 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Activate
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD / EDIT DEPARTMENT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-base font-bold text-[#0F172A]">
                {editingDept ? 'Edit Clinical Department' : 'Create Clinical Department'}
              </h3>
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

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F172A]">
                  Department Name (English) <span className="text-rose-500">*</span>
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
                  placeholder="e.g. Cardiology & Preventive Heart Care"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#007E70] flex items-center justify-between">
                  <span>Bengali Name (বাংলা নাম)</span>
                  <span className="text-[10px] text-teal-600 font-semibold">✨ Auto-translated</span>
                </label>
                <input
                  type="text"
                  value={formState.nameBn}
                  onChange={(e) => setFormState({ ...formState, nameBn: e.target.value })}
                  placeholder="e.g. কার্ডিওলজি ও হৃদরোগ প্রতিরোধ"
                  className="w-full px-3 py-2 bg-teal-50/50 border border-teal-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none font-bengali"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F172A]">
                  Short Overview / Scope
                </label>
                <textarea
                  rows={2}
                  value={formState.shortDescription}
                  onChange={(e) => setFormState({ ...formState, shortDescription: e.target.value })}
                  placeholder="Plain-language scope of care..."
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

              {/* Department Image & Clear Action */}
              <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
                    <span>Department Banner Image URL</span>
                  </label>
                  {formState.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setFormState({ ...formState, imageUrl: '' })}
                      className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                    >
                      Clear Image
                    </button>
                  )}
                </div>
                <input
                  type="url"
                  value={formState.imageUrl}
                  onChange={(e) => setFormState({ ...formState, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#007E70] focus:outline-none"
                />
                {formState.imageUrl && (
                  <div className="relative w-full h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 mt-2">
                    <img
                      src={formState.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <div>
                  {editingDept?.id && (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(editingDept as Department)}
                      className="px-4 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Department</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#007E70] hover:bg-[#009282] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    {editingDept ? 'Save Changes' : 'Create Department'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      <ConfirmationDialog
        isOpen={Boolean(deleteConfirm)}
        title={`Permanently Delete Department "${deleteConfirm?.name}"?`}
        message={`This will permanently remove the department from the clinic database. Are you sure?`}
        confirmLabel="Delete Department"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleDeleteDepartment}
        onCancel={() => setDeleteConfirm(null)}
      />

      {/* DEPARTMENT DEACTIVATION SAFETY DIALOG */}
      {deactivateWarning && (
        <ConfirmationDialog
          isOpen={true}
          title={`Deactivate Department "${deactivateWarning.dept.name}"?`}
          message={`Warning: This department is currently linked to ${deactivateWarning.activeDoctors.length} active doctors and ${deactivateWarning.activeServices.length} active services. Deactivating it will hide the department discovery layer, though the linked records will be retained.`}
          confirmLabel="Deactivate Department"
          cancelLabel="Cancel"
          isDestructive={true}
          onConfirm={handleExecuteDeactivation}
          onCancel={() => setDeactivateWarning(null)}
        />
      )}
    </div>
  );
};
