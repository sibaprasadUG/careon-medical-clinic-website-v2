import React, { useState, useEffect } from 'react';
import { DataAccessLayer } from '../../lib/dal';
import { useAuth } from '../../lib/authContext';
import { FAQ } from '../../types';
import {
  HelpCircle,
  Plus,
  Edit2,
  CheckCircle2,
  X,
  Search,
  ChevronDown,
  ChevronUp,
  Trash2
} from 'lucide-react';
import { ConfirmationDialog } from './ConfirmationDialog';

export const FAQManager: React.FC = () => {
  const { currentUser } = useAuth();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingFaq, setEditingFaq] = useState<Partial<FAQ> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<FAQ | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [formState, setFormState] = useState<{
    question: string;
    questionBn: string;
    answer: string;
    answerBn: string;
    category: 'Appointments' | 'Consultations' | 'Services' | 'Visiting';
    published: boolean;
    displayOrder: number;
  }>({
    question: '',
    questionBn: '',
    answer: '',
    answerBn: '',
    category: 'Appointments',
    published: true,
    displayOrder: 1
  });

  const loadData = () => {
    setFaqs(DataAccessLayer.getAllFAQs());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('careon_data_updated', handleUpdate);
    return () => window.removeEventListener('careon_data_updated', handleUpdate);
  }, []);

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleOpenAdd = () => {
    setEditingFaq(null);
    setFormError(null);
    const maxOrder = faqs.reduce((max, f) => Math.max(max, f.displayOrder || 0), 0);
    setFormState({
      question: '',
      questionBn: '',
      answer: '',
      answerBn: '',
      category: 'Appointments',
      published: true,
      displayOrder: maxOrder + 1
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormError(null);
    setFormState({
      question: faq.question,
      questionBn: faq.questionBn || '',
      answer: faq.answer,
      answerBn: faq.answerBn || '',
      category: faq.category,
      published: faq.published,
      displayOrder: faq.displayOrder
    });
    setIsFormOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setFormError(null);

    if (!formState.question.trim()) {
      setFormError('Question is required.');
      return;
    }
    if (!formState.answer.trim()) {
      setFormError('Answer is required.');
      return;
    }

    try {
      DataAccessLayer.saveFAQ(
        {
          ...(editingFaq ? { id: editingFaq.id } : {}),
          question: formState.question.trim(),
          questionBn: formState.questionBn.trim(),
          answer: formState.answer.trim(),
          answerBn: formState.answerBn.trim(),
          category: formState.category,
          published: formState.published,
          displayOrder: Number(formState.displayOrder) || 1
        },
        currentUser
      );
      setIsFormOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save FAQ.');
    }
  };

  const handleDeleteFAQ = () => {
    if (!deleteConfirm || !currentUser) return;
    DataAccessLayer.deleteFAQ(deleteConfirm.id, currentUser);
    setDeleteConfirm(null);
    setIsFormOpen(false);
  };

  const handleTogglePublish = (faq: FAQ) => {
    if (!currentUser) return;
    DataAccessLayer.toggleFAQPublish(faq.id, currentUser);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500">
            Address patient concerns regarding consultation timing, appointment prep, report delivery, and clinic guidelines.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#007E70] hover:bg-[#009282] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add FAQ</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search question or answer..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {['all', 'Appointments', 'Consultations', 'Services', 'Visiting'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#007E70] text-white shadow-2xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ List */}
      <div className="space-y-3">
        {filteredFaqs.map((faq) => (
          <div
            key={faq.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-teal-50 text-[#007E70] text-[10px] font-bold">
                    {faq.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      faq.published ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {faq.published ? 'Published' : 'Hidden'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#0F172A]">{faq.question}</h4>
                {faq.questionBn && (
                  <p className="text-xs text-slate-400 font-bengali">{faq.questionBn}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(faq)}
                  className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleTogglePublish(faq)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                    faq.published
                      ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                      : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                  }`}
                >
                  {faq.published ? 'Hide' : 'Publish'}
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2">
              {faq.answer}
            </p>
            {faq.answerBn && (
              <p className="text-xs text-slate-500 leading-relaxed font-bengali">
                {faq.answerBn}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* ADD/EDIT FAQ MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-base font-bold text-[#0F172A]">
                {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
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
                    Category
                  </label>
                  <select
                    value={formState.category}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        category: e.target.value as 'Appointments' | 'Consultations' | 'Services' | 'Visiting'
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                  >
                    <option value="Appointments">Appointments & Booking</option>
                    <option value="Consultations">Consultations & Doctors</option>
                    <option value="Services">Services & Diagnostics</option>
                    <option value="Visiting">Visiting & Clinic Info</option>
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

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F172A]">
                  Question (English) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formState.question}
                  onChange={(e) => setFormState({ ...formState, question: e.target.value })}
                  placeholder="e.g. Can I reschedule my appointment?"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F172A]">
                  Bengali Question (বাংলা প্রশ্ন)
                </label>
                <input
                  type="text"
                  value={formState.questionBn}
                  onChange={(e) => setFormState({ ...formState, questionBn: e.target.value })}
                  placeholder="e.g. আমি কি আমার অ্যাপয়েন্টমেন্ট পুনর্নির্ধারণ করতে পারি?"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none font-bengali"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F172A]">
                  Answer (English) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={formState.answer}
                  onChange={(e) => setFormState({ ...formState, answer: e.target.value })}
                  placeholder="Clear patient guidance..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F172A]">
                  Bengali Answer (বাংলা উত্তর)
                </label>
                <textarea
                  rows={2}
                  value={formState.answerBn}
                  onChange={(e) => setFormState({ ...formState, answerBn: e.target.value })}
                  placeholder="বাংলা উত্তর..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none font-bengali"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={formState.published}
                      onChange={(e) => setFormState({ ...formState, published: e.target.checked })}
                      className="w-4 h-4 text-[#007E70] rounded border-slate-300 focus:ring-[#007E70]"
                    />
                    <span>Published on Website</span>
                  </label>

                  {editingFaq?.id && (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(editingFaq as FAQ)}
                      className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#007E70] hover:bg-[#009282] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    {editingFaq ? 'Save Changes' : 'Create FAQ'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      <ConfirmationDialog
        isOpen={Boolean(deleteConfirm)}
        title="Permanently Delete FAQ?"
        message={`Are you sure you want to permanently delete the FAQ "${deleteConfirm?.question.substring(0, 40)}..."?`}
        confirmLabel="Delete FAQ"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleDeleteFAQ}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
};
