import React, { useState, useEffect } from 'react';
import { DataAccessLayer } from '../../lib/dal';
import { useAuth } from '../../lib/authContext';
import { GalleryItem } from '../../types';
import {
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Filter,
  ExternalLink
} from 'lucide-react';
import { ConfirmationDialog } from './ConfirmationDialog';

export const GalleryManager: React.FC = () => {
  const { currentUser } = useAuth();
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Partial<GalleryItem> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<GalleryItem | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [formState, setFormState] = useState<{
    title: string;
    imageUrl: string;
    caption: string;
    category: 'Clinic' | 'Facilities' | 'Doctors' | 'Events' | 'Team';
    altText: string;
    published: boolean;
    displayOrder: number;
  }>({
    title: '',
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800',
    caption: '',
    category: 'Clinic',
    altText: 'CareOn Medical Clinic consultation room',
    published: true,
    displayOrder: 1
  });

  const loadData = () => {
    setGallery(DataAccessLayer.getAllGallery());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('careon_data_updated', handleUpdate);
    return () => window.removeEventListener('careon_data_updated', handleUpdate);
  }, []);

  const filteredGallery = gallery.filter((item) => {
    return selectedCategory === 'all' || item.category === selectedCategory;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormError(null);
    const maxOrder = gallery.reduce((max, g) => Math.max(max, g.displayOrder || 0), 0);
    setFormState({
      title: '',
      imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800',
      caption: '',
      category: 'Clinic',
      altText: 'CareOn Medical Clinic premises',
      published: true,
      displayOrder: maxOrder + 1
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setFormError(null);
    setFormState({
      title: item.title,
      imageUrl: item.imageUrl,
      caption: item.caption || '',
      category: item.category,
      altText: item.altText,
      published: item.published,
      displayOrder: item.displayOrder
    });
    setIsFormOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setFormError(null);

    if (!formState.title.trim()) {
      setFormError('Image title is required.');
      return;
    }
    if (!formState.imageUrl.trim()) {
      setFormError('Image URL is required.');
      return;
    }

    try {
      DataAccessLayer.saveGalleryItem(
        {
          ...(editingItem ? { id: editingItem.id } : {}),
          title: formState.title.trim(),
          imageUrl: formState.imageUrl.trim(),
          caption: formState.caption.trim(),
          category: formState.category,
          altText: formState.altText.trim(),
          published: formState.published,
          displayOrder: Number(formState.displayOrder) || 1
        },
        currentUser
      );
      setIsFormOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save gallery item.');
    }
  };

  const handleDeleteGalleryItem = () => {
    if (!deleteConfirm || !currentUser) return;
    DataAccessLayer.deleteGalleryItem(deleteConfirm.id, currentUser);
    setDeleteConfirm(null);
    setIsFormOpen(false);
  };

  const handleTogglePublish = (item: GalleryItem) => {
    if (!currentUser) return;
    DataAccessLayer.toggleGalleryPublish(item.id, currentUser);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
            Clinic Facility Gallery
          </h2>
          <p className="text-xs text-slate-500">
            Showcase welcoming waiting lounges, consultation rooms, diagnostic areas, and sterile environments.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#007E70] hover:bg-[#009282] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Gallery Photo</span>
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {['all', 'Clinic', 'Facilities', 'Doctors', 'Events', 'Team'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#007E70] text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat === 'all' ? 'All Images' : cat}
          </button>
        ))}
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGallery.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs space-y-3 p-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                <img
                  src={item.imageUrl}
                  alt={item.altText}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/70 text-white text-[10px] font-bold backdrop-blur-xs">
                  {item.category}
                </span>
                <span
                  className={`absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    item.published ? 'bg-emerald-600 text-white' : 'bg-slate-800/80 text-slate-200'
                  }`}
                >
                  {item.published ? 'Published' : 'Hidden'}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#0F172A]">{item.title}</h4>
                {item.caption && (
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{item.caption}</p>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Order #{item.displayOrder}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleTogglePublish(item)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                    item.published
                      ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                      : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                  }`}
                >
                  {item.published ? 'Hide' : 'Publish'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ADD/EDIT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-base font-bold text-[#0F172A]">
                {editingItem ? 'Edit Gallery Asset' : 'Add Facility Photograph'}
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
                  Image Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  placeholder="e.g. Clean & Welcoming Patient Reception"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#0F172A]">
                    Image URL <span className="text-rose-500">*</span>
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
                  required
                  value={formState.imageUrl}
                  onChange={(e) => setFormState({ ...formState, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                />
                {formState.imageUrl && (
                  <div className="relative w-full h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 mt-2">
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
                        category: e.target.value as 'Clinic' | 'Facilities' | 'Doctors' | 'Events' | 'Team'
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                  >
                    <option value="Clinic">Clinic Premises</option>
                    <option value="Facilities">Facilities & Diagnostics</option>
                    <option value="Doctors">Doctor Chambers</option>
                    <option value="Events">Health Camps & Events</option>
                    <option value="Team">Clinical Care Team</option>
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
                  Caption (Optional)
                </label>
                <input
                  type="text"
                  value={formState.caption}
                  onChange={(e) => setFormState({ ...formState, caption: e.target.value })}
                  placeholder="Short explanatory caption..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F172A]">
                  Accessibility Alt Text
                </label>
                <input
                  type="text"
                  value={formState.altText}
                  onChange={(e) => setFormState({ ...formState, altText: e.target.value })}
                  placeholder="Descriptive text for screen readers..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
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

                  {editingItem?.id && (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(editingItem as GalleryItem)}
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
                    {editingItem ? 'Save Changes' : 'Add Image'}
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
        title="Permanently Delete Gallery Image?"
        message={`Are you sure you want to permanently delete the gallery photo "${deleteConfirm?.title}"?`}
        confirmLabel="Delete Image"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleDeleteGalleryItem}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
};
