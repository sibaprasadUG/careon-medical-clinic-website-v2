import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  Search,
  Filter,
  AlertCircle,
  FileText,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { MediaAsset, MediaCategory } from '../../types';
import { DataAccessLayer } from '../../lib/dal';
import {
  MediaStorageService,
  formatBytes,
  MAX_IMAGE_SIZE_BYTES,
  MAX_FAVICON_SIZE_BYTES
} from '../../lib/mediaStorage';
import { useAuth } from '../../lib/authContext';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (asset: MediaAsset) => void;
  initialCategory?: MediaCategory;
  title?: string;
  selectedAssetId?: string;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialCategory = 'DOCTOR',
  title = 'Select Media Asset',
  selectedAssetId
}) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory | 'ALL'>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(() => {
    if (selectedAssetId) {
      return DataAccessLayer.getMediaAssetById(selectedAssetId) || null;
    }
    return null;
  });

  // Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadAltText, setUploadAltText] = useState('');
  const [uploadCategory, setUploadCategory] = useState<MediaCategory>(initialCategory);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const allAssets = DataAccessLayer.getAllMediaAssets().filter((a) => a.status === 'ACTIVE');

  const filteredAssets = allAssets.filter((asset) => {
    const matchesCategory = selectedCategory === 'ALL' || asset.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;

    const matchesSearch =
      asset.fileName.toLowerCase().includes(q) ||
      asset.originalName.toLowerCase().includes(q) ||
      asset.altText.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    const validation = MediaStorageService.validate(file, {
      forCategory: uploadCategory
    });

    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file.');
      return;
    }

    setUploadFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setUploadPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    if (!uploadAltText) {
      const generatedAlt = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setUploadAltText(generatedAlt);
    }
  };

  const handleUploadAndSelect = async () => {
    if (!uploadFile) {
      setUploadError('Please choose a file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const asset = await MediaStorageService.upload(
        uploadFile,
        {
          category: uploadCategory,
          altText: uploadAltText,
          originalName: uploadFile.name
        },
        currentUser
      );

      onSelect(asset);
      onClose();
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload asset.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedAsset) {
      onSelect(selectedAsset);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#007E70]" />
              <span>{title}</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Select an existing asset from the CareOn Media Library or upload a new file.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/40 px-6 shrink-0">
          <button
            onClick={() => setActiveTab('library')}
            className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
              activeTab === 'library'
                ? 'border-[#007E70] text-[#007E70]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Media Library ({allAssets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'border-[#007E70] text-[#007E70]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload New File</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'library' ? (
            <div className="space-y-5">
              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar">
                  {(['ALL', 'DOCTOR', 'BRAND', 'FAVICON', 'GALLERY', 'SERVICE', 'DEPARTMENT'] as const).map(
                    (cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                          selectedCategory === cat
                            ? 'bg-[#007E70] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat === 'ALL' ? 'All Assets' : cat}
                      </button>
                    )
                  )}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search assets..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#007E70]/20 focus:border-[#007E70]"
                  />
                </div>
              </div>

              {/* Asset Grid */}
              {filteredAssets.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50">
                  <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600">No media assets found</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Try adjusting your filters or switch to the "Upload New File" tab.
                  </p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="mt-4 px-4 py-2 bg-[#007E70] text-white text-xs font-bold rounded-xl hover:bg-[#00665B] cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload First Asset</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredAssets.map((asset) => {
                    const isSelected = selectedAsset?.id === asset.id;
                    const usage = DataAccessLayer.getAssetUsage(asset.id);

                    return (
                      <div
                        key={asset.id}
                        onClick={() => setSelectedAsset(asset)}
                        className={`group relative rounded-2xl border-2 overflow-hidden cursor-pointer transition-all bg-white flex flex-col ${
                          isSelected
                            ? 'border-[#007E70] ring-4 ring-[#007E70]/10 shadow-md'
                            : 'border-slate-200 hover:border-teal-300 shadow-2xs'
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="aspect-[4/5] bg-slate-100 relative overflow-hidden flex items-center justify-center">
                          {asset.mimeType.startsWith('image/') ? (
                            <img
                              src={asset.url}
                              alt={asset.altText}
                              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <FileText className="w-8 h-8 text-slate-400" />
                          )}

                          {/* Selected Checkmark Badge */}
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#007E70] text-white flex items-center justify-center shadow-md">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}

                          {/* Category Pill */}
                          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/70 backdrop-blur-xs text-white text-[9px] font-bold uppercase tracking-wider">
                            {asset.category}
                          </div>
                        </div>

                        {/* Metadata Footer */}
                        <div className="p-2.5 bg-white border-t border-slate-100 flex flex-col justify-between flex-1">
                          <p className="text-[11px] font-bold text-slate-800 truncate" title={asset.fileName}>
                            {asset.fileName}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                            <span>
                              {asset.width && asset.height ? `${asset.width}×${asset.height}` : 'Vector'}
                            </span>
                            <span>{formatBytes(asset.fileSize)}</span>
                          </div>

                          {usage.length > 0 && (
                            <div className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-semibold text-[#007E70] bg-teal-50 px-1.5 py-0.5 rounded truncate">
                              <span className="truncate">Used by: {usage[0].name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Upload Tab */
            <div className="space-y-6 max-w-xl mx-auto py-2">
              {/* Dropzone Container */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                  uploadPreview
                    ? 'border-teal-400 bg-teal-50/20'
                    : 'border-slate-300 hover:border-[#007E70] bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {uploadPreview ? (
                  <div className="space-y-3">
                    <div className="w-32 h-40 mx-auto rounded-2xl overflow-hidden shadow-md border border-teal-200 bg-white">
                      <img
                        src={uploadPreview}
                        alt="Preview"
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{uploadFile?.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {uploadFile ? formatBytes(uploadFile.size) : ''} • Click to change file
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#007E70] border border-teal-100 flex items-center justify-center mx-auto shadow-2xs">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        Click or drag image file here to upload
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Supported formats: JPG, PNG, WebP (and SVG for Brand/Logo). Max 5 MB.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2 text-rose-700 text-xs animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Metadata inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Asset Category *
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as MediaCategory)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#007E70]/20 focus:border-[#007E70]"
                  >
                    <option value="DOCTOR">Doctor Profile Photo</option>
                    <option value="BRAND">CareOn Brand Logo</option>
                    <option value="FAVICON">Browser Favicon</option>
                    <option value="GALLERY">Clinic Gallery</option>
                    <option value="SERVICE">Service Asset</option>
                    <option value="DEPARTMENT">Department Cover</option>
                    <option value="OTHER">General Website Asset</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Alt Text (Accessibility) *
                  </label>
                  <input
                    type="text"
                    value={uploadAltText}
                    onChange={(e) => setUploadAltText(e.target.value)}
                    placeholder="Descriptive image label..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#007E70]/20 focus:border-[#007E70]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 truncate">
            {activeTab === 'library' && selectedAsset ? (
              <span className="font-semibold text-slate-700">
                Selected: <span className="text-[#007E70]">{selectedAsset.fileName}</span> (
                {formatBytes(selectedAsset.fileSize)})
              </span>
            ) : (
              <span>Choose an asset to proceed</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {activeTab === 'library' ? (
              <button
                onClick={handleConfirmSelection}
                disabled={!selectedAsset}
                className="px-5 py-2 bg-[#007E70] hover:bg-[#00665B] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Use Selected Asset</span>
              </button>
            ) : (
              <button
                onClick={handleUploadAndSelect}
                disabled={!uploadFile || isUploading}
                className="px-5 py-2 bg-[#007E70] hover:bg-[#00665B] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {isUploading ? (
                  <span>Uploading...</span>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload & Select</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
