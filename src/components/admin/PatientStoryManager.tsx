import React, { useState, useEffect } from 'react';
import { DataAccessLayer } from '../../lib/dal';
import { useAuth } from '../../lib/authContext';
import { PatientStory, Doctor, Service } from '../../types';
import {
  HeartHandshake,
  Plus,
  Edit2,
  ShieldCheck,
  CheckCircle2,
  EyeOff,
  Eye,
  X,
  Quote
} from 'lucide-react';

export const PatientStoryManager: React.FC = () => {
  const { currentUser } = useAuth();
  const [stories, setStories] = useState<PatientStory[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingStory, setEditingStory] = useState<Partial<PatientStory> | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [formState, setFormState] = useState<{
    patientName: string;
    patientNameBn: string;
    photoUrl: string;
    quote: string;
    quoteBn: string;
    doctorId: string;
    serviceId: string;
    careTag: string;
    published: boolean;
    displayOrder: number;
  }>({
    patientName: '',
    patientNameBn: '',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    quote: '',
    quoteBn: '',
    doctorId: '',
    serviceId: '',
    careTag: 'Cardiology Care',
    published: true,
    displayOrder: 1
  });

  const loadData = () => {
    setStories(DataAccessLayer.getAllPatientStories());
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
    setEditingStory(null);
    setFormError(null);
    const maxOrder = stories.reduce((max, s) => Math.max(max, s.displayOrder || 0), 0);
    setFormState({
      patientName: '',
      patientNameBn: '',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
      quote: '',
      quoteBn: '',
      doctorId: '',
      serviceId: '',
      careTag: 'General Consultation',
      published: true,
      displayOrder: maxOrder + 1
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (story: PatientStory) => {
    setEditingStory(story);
    setFormError(null);
    setFormState({
      patientName: story.patientName,
      patientNameBn: story.patientNameBn || '',
      photoUrl: story.photoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
      quote: story.quote,
      quoteBn: story.quoteBn || '',
      doctorId: story.doctorId || '',
      serviceId: story.serviceId || '',
      careTag: story.careTag || 'Patient Experience',
      published: story.published,
      displayOrder: story.displayOrder
    });
    setIsFormOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setFormError(null);

    if (!formState.patientName.trim()) {
      setFormError('Patient display name is required.');
      return;
    }
    if (!formState.quote.trim()) {
      setFormError('Patient feedback/quote is required.');
      return;
    }

    try {
      DataAccessLayer.savePatientStory(
        {
          ...(editingStory ? { id: editingStory.id } : {}),
          patientName: formState.patientName.trim(),
          patientNameBn: formState.patientNameBn.trim(),
          photoUrl: formState.photoUrl.trim(),
          quote: formState.quote.trim(),
          quoteBn: formState.quoteBn.trim(),
          doctorId: formState.doctorId || undefined,
          serviceId: formState.serviceId || undefined,
          careTag: formState.careTag.trim(),
          published: formState.published,
          displayOrder: Number(formState.displayOrder) || 1
        },
        currentUser
      );
      setIsFormOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save patient story.');
    }
  };

  const handleTogglePublish = (story: PatientStory) => {
    if (!currentUser) return;
    DataAccessLayer.togglePatientStoryPublish(story.id, currentUser);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
            Patient Stories & Authentic Feedback
          </h2>
          <p className="text-xs text-slate-500">
            Publish verified patient experiences, caregiver testimonials, and clinical care reflections.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#007E70] hover:bg-[#009282] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Patient Story</span>
        </button>
      </div>

      {/* Safety Guideline */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl flex items-start gap-3 text-xs text-emerald-950">
        <ShieldCheck className="w-5 h-5 text-[#007E70] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-bold">Authenticity & Privacy Assurance:</strong> Ensure quotes reflect genuine patient service experiences (punctuality, doctor attentiveness, cleanliness) rather than unverified medical cure guarantees.
        </div>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {stories.map((story) => (
          <div
            key={story.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-[#007E70] text-[10px] font-bold">
                  {story.careTag}
                </span>

                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    story.published
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {story.published ? 'Published' : 'Hidden'}
                </span>
              </div>

              <div className="relative">
                <Quote className="w-6 h-6 text-slate-200 absolute -top-2 -left-1 pointer-events-none" />
                <p className="text-xs text-slate-700 italic relative z-10 pl-5 leading-relaxed">
                  "{story.quote}"
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
                {story.photoUrl && (
                  <img
                    src={story.photoUrl}
                    alt={story.patientName}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                )}
                <div>
                  <div className="text-xs font-bold text-slate-900">{story.patientName}</div>
                  {story.patientNameBn && (
                    <div className="text-[10px] text-slate-400 font-bengali">{story.patientNameBn}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Order #{story.displayOrder}</span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(story)}
                  className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Edit Story"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleTogglePublish(story)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                    story.published
                      ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                      : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                  }`}
                >
                  {story.published ? 'Hide' : 'Publish'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ADD / EDIT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-base font-bold text-[#0F172A]">
                {editingStory ? 'Edit Patient Story' : 'Add Verified Patient Story'}
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0F172A]">
                    Patient Display Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.patientName}
                    onChange={(e) => setFormState({ ...formState, patientName: e.target.value })}
                    placeholder="e.g. S. Mukherjee, Ballygunge"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0F172A]">
                    Bengali Name (বাংলা নাম)
                  </label>
                  <input
                    type="text"
                    value={formState.patientNameBn}
                    onChange={(e) => setFormState({ ...formState, patientNameBn: e.target.value })}
                    placeholder="e.g. এস. মুখার্জী"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none font-bengali"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F172A]">
                  Care Tag / Department Focus
                </label>
                <input
                  type="text"
                  value={formState.careTag}
                  onChange={(e) => setFormState({ ...formState, careTag: e.target.value })}
                  placeholder="e.g. Cardiology Care, Diabetic Clinic"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F172A]">
                  Patient Feedback / Testimonial (English) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={formState.quote}
                  onChange={(e) => setFormState({ ...formState, quote: e.target.value })}
                  placeholder="Verified patient feedback..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F172A]">
                  Bengali Translation (বাংলা মন্তব্য)
                </label>
                <textarea
                  rows={2}
                  value={formState.quoteBn}
                  onChange={(e) => setFormState({ ...formState, quoteBn: e.target.value })}
                  placeholder="বাংলা মন্তব্য..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none font-bengali"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formState.published}
                    onChange={(e) => setFormState({ ...formState, published: e.target.checked })}
                    className="w-4 h-4 text-[#007E70] rounded border-slate-300 focus:ring-[#007E70]"
                  />
                  <span>Published on Public Website</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#007E70] text-white text-xs font-bold rounded-xl"
                  >
                    Save Story
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
