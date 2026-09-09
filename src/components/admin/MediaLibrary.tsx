import React, { useState, useRef, useEffect } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Search,
  Filter,
  Trash2,
  RefreshCw,
  Eye,
  Archive,
  ArchiveRestore,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  FileText,
  Layers,
  Sparkles,
  Info,
  Grid,
  List,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';
import { MediaAsset, MediaCategory, MediaAssetStatus } from '../../types';
import { DataAccessLayer } from '../../lib/dal';
import {
  MediaStorageService,
  formatBytes,
  MAX_IMAGE_SIZE_BYTES,
  MAX_FAVICON_SIZE_BYTES
} from '../../lib/mediaStorage';
import { useAuth } from '../../lib/authContext';

export const MediaLibrary: React.FC = () => {
  const { currentUser } = useAuth();
  const [assets, setAssets] = useState<MediaAsset[]>(() => DataAccessLayer.getAllMediaAssets());
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<MediaAssetStatus | 'ALL'>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [detailAsset, setDetailAsset] = useState<MediaAsset | null>(null);
  const [replaceAsset, setReplaceAsset] = useState<MediaAsset | null>(null);
  const [deleteWarning, setDeleteWarning] = useState<{ asset: MediaAsset; usage: any[] } | null>(null);
  const [deleteConfirmCandidate, setDeleteConfirmCandidate] = useState<MediaAsset | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Synchronize media assets with production server / Supabase PostgreSQL on mount
  useEffect(() => {
    DataAccessLayer.syncMediaAssetsWithServer().then((serverAssets) => {
      if (serverAssets && serverAssets.length > 0) {
        setAssets(serverAssets);
      }
    });
  }, []);

  // Upload Form State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadCategory, setUploadCategory] = useState<MediaCategory>('DOCTOR');
  const [uploadAltText, setUploadAltText] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Replace Form State
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replacePreview, setReplacePreview] = useState<string | null>(null);
  const [replaceError, setReplaceError] = useState<string | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  // Copy Feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  const showBanner = (msg: string) => {
    setFeedbackBanner(msg);
    setTimeout(() => setFeedbackBanner(null), 4000);
  };

  const refreshList = () => {
    setAssets(DataAccessLayer.getAllMediaAssets());
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesCategory = selectedCategory === 'ALL' || asset.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || asset.status === selectedStatus;
    const q = searchQuery.toLowerCase().trim();

    if (!q) return matchesCategory && matchesStatus;

    const matchesSearch =
      asset.fileName.toLowerCase().includes(q) ||
      asset.originalName.toLowerCase().includes(q) ||
      asset.altText.toLowerCase().includes(q) ||
      asset.category.toLowerCase().includes(q);

    return matchesCategory && matchesStatus && matchesSearch;
  });

  // Calculate Metrics
  const totalAssets = assets.length;
  const activeAssets = assets.filter((a) => a.status === 'ACTIVE').length;
  const doctorPhotos = assets.filter((a) => a.category === 'DOCTOR' && a.status === 'ACTIVE').length;
  const brandAssets = assets.filter((a) => (a.category === 'BRAND' || a.category === 'FAVICON') && a.status === 'ACTIVE').length;
  const totalStorageBytes = assets.reduce((sum, a) => sum + (a.fileSize || 0), 0);

  // Upload Handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = MediaStorageService.validate(file, { forCategory: uploadCategory });
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file.');
      return;
    }

    setUploadFile(file);
    const reader = new FileReader();
    reader.onload = () => setUploadPreview(reader.result as string);
    reader.readAsDataURL(file);

    if (!uploadAltText) {
      const generated = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setUploadAltText(generated);
    }
  };

  const submitUpload = async () => {
    if (!uploadFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      await MediaStorageService.upload(
        uploadFile,
        {
          category: uploadCategory,
          altText: uploadAltText,
          originalName: uploadFile.name
        },
        currentUser
      );

      refreshList();
      setIsUploadOpen(false);
      setUploadFile(null);
      setUploadPreview(null);
      setUploadAltText('');
      showBanner(`Asset "${uploadFile.name}" uploaded successfully.`);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload asset.');
    } finally {
      setIsUploading(false);
    }
  };

  // Replace Handlers
  const handleReplaceSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!replaceAsset) return;
    setReplaceError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = MediaStorageService.validate(file, { forCategory: replaceAsset.category });
    if (!validation.valid) {
      setReplaceError(validation.error || 'Invalid file.');
      return;
    }

    setReplaceFile(file);
    const reader = new FileReader();
    reader.onload = () => setReplacePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const submitReplace = async () => {
    if (!replaceAsset || !replaceFile) return;

    setIsReplacing(true);
    setReplaceError(null);

    try {
      const updated = await MediaStorageService.replace(replaceAsset.id, replaceFile, currentUser);
      refreshList();
      if (detailAsset?.id === updated.id) {
        setDetailAsset(updated);
      }
      setReplaceAsset(null);
      setReplaceFile(null);
      setReplacePreview(null);
      showBanner(`Asset "${updated.fileName}" successfully replaced (v${updated.version}).`);
    } catch (err: any) {
      setReplaceError(err.message || 'Failed to replace asset.');
    } finally {
      setIsReplacing(false);
    }
  };

  // Archive / Restore
  const toggleArchive = (asset: MediaAsset) => {
    if (asset.status === 'ACTIVE') {
      MediaStorageService.archive(asset.id, currentUser);
      showBanner(`Asset "${asset.fileName}" archived.`);
    } else {
      MediaStorageService.unarchive(asset.id, currentUser);
      showBanner(`Asset "${asset.fileName}" restored to ACTIVE.`);
    }
    refreshList();
    if (detailAsset?.id === asset.id) {
      setDetailAsset(DataAccessLayer.getMediaAssetById(asset.id) || null);
    }
  };

  // Delete Handlers
  const initiateDelete = (asset: MediaAsset) => {
    setDeleteError(null);
    const usage = DataAccessLayer.getAssetUsage(asset.id);
    if (usage.length > 0) {
      setDeleteWarning({ asset, usage });
    } else {
      setDeleteConfirmCandidate(asset);
    }
  };

  const handleExecutePermanentDelete = async (asset: MediaAsset) => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await MediaStorageService.delete(asset, currentUser, true);
      if (!res.success) {
        setDeleteError(res.error || 'Failed to permanently delete asset.');
        showBanner(`Deletion failed: ${res.error || 'Server rejected deletion'}`);
        return;
      }
      setAssets((prev) =>
        prev.filter((a) => a.id !== asset.id && a.fileName !== asset.fileName && a.storageKey !== asset.storageKey)
      );
      if (detailAsset?.id === asset.id) setDetailAsset(null);
      setDeleteConfirmCandidate(null);
      showBanner(`Asset "${asset.fileName}" permanently removed and storage reclaimed.`);
    } catch (err: any) {
      setDeleteError(err.message || 'An error occurred during deletion.');
      showBanner(`Deletion failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmForcedDelete = async () => {
    if (!deleteWarning) return;
    const targetAsset = deleteWarning.asset;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await MediaStorageService.delete(targetAsset, currentUser, true);
      if (!res.success) {
        setDeleteError(res.error || 'Failed to permanently delete asset.');
        showBanner(`Deletion failed: ${res.error || 'Server rejected deletion'}`);
        return;
      }
      setAssets((prev) =>
        prev.filter((a) => a.id !== targetAsset.id && a.fileName !== targetAsset.fileName && a.storageKey !== targetAsset.storageKey)
      );
      if (detailAsset?.id === targetAsset.id) setDetailAsset(null);
      showBanner(`Asset "${targetAsset.fileName}" permanently deleted and storage reclaimed.`);
      setDeleteWarning(null);
    } catch (err: any) {
      setDeleteError(err.message || 'An error occurred during deletion.');
      showBanner(`Deletion failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const copyUrl = (url: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner Notice if triggered */}
      {feedbackBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center justify-between shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedbackBanner}</span>
          </div>
          <button
            onClick={() => setFeedbackBanner(null)}
            className="text-emerald-600 hover:text-emerald-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#007E70] text-xs font-bold uppercase tracking-wider border border-teal-100 mb-1.5">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Centralized Asset Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Media & Brand Asset Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 max-w-2xl">
            One centralized storage architecture for Doctor Profile Photos, CareOn Logos, Favicons, and website graphics. Change an image once, and it propagates across all public pages.
          </p>
        </div>

        <button
          onClick={() => {
            setUploadError(null);
            setUploadFile(null);
            setUploadPreview(null);
            setUploadAltText('');
            setIsUploadOpen(true);
          }}
          className="px-5 py-2.5 bg-[#007E70] hover:bg-[#00665B] text-white text-xs font-bold rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload New Asset</span>
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Total Assets</span>
            <Layers className="w-4 h-4 text-[#007E70]" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-2">{totalAssets}</p>
          <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
            {activeAssets} active • {totalAssets - activeAssets} archived
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Doctor Photos</span>
            <ShieldCheck className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-2">{doctorPhotos}</p>
          <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
            4:5 portrait standard
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Brand & Logo</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-2">{brandAssets}</p>
          <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
            Official vectors & favicons
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Storage Footprint</span>
            <Info className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-2">
            {formatBytes(totalStorageBytes)}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">
            IndexedDB Persistent Blob Store
          </span>
        </div>
      </div>

      {/* Filter, Search & View Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {(['ALL', 'DOCTOR', 'BRAND', 'FAVICON', 'GALLERY', 'SERVICE', 'DEPARTMENT', 'OTHER'] as const).map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#007E70] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'ALL' ? 'All Categories' : cat}
                </button>
              )
            )}
          </div>

          {/* Right Toolbar: Status, Search, View Toggle */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#007E70]/20 cursor-pointer"
            >
              <option value="ACTIVE">Active Assets</option>
              <option value="ARCHIVED">Archived Assets</option>
              <option value="ALL">All Statuses</option>
            </select>

            {/* Search Input */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assets..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#007E70]/20 focus:border-[#007E70]"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-slate-600 transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white shadow-2xs text-[#007E70] font-bold' : 'hover:text-slate-900'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-slate-600 transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white shadow-2xs text-[#007E70] font-bold' : 'hover:text-slate-900'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-3">
          <span>
            Showing <strong className="text-slate-700">{filteredAssets.length}</strong> of {totalAssets} assets
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[#007E70] hover:underline font-semibold cursor-pointer"
            >
              Clear search
            </button>
          )}
        </div>
      </div>

      {/* Asset Display Area */}
      {filteredAssets.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No media assets match your filter</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria, switching to another category tab, or uploading a new file.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('ALL');
              setSelectedStatus('ACTIVE');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {filteredAssets.map((asset) => {
            const usage = DataAccessLayer.getAssetUsage(asset.id);
            const isArchived = asset.status === 'ARCHIVED';

            return (
              <div
                key={asset.id}
                className={`group bg-white rounded-2xl border overflow-hidden flex flex-col transition-all hover:shadow-md ${
                  isArchived ? 'border-slate-200 opacity-75' : 'border-slate-200/90 hover:border-teal-300'
                }`}
              >
                {/* Thumbnail Container */}
                <div
                  onClick={() => setDetailAsset(asset)}
                  className="aspect-[4/5] bg-slate-100 relative overflow-hidden flex items-center justify-center cursor-pointer"
                >
                  {asset.mimeType.startsWith('image/') ? (
                    <img
                      src={asset.url}
                      alt={asset.altText}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <FileText className="w-10 h-10 text-slate-400" />
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <span className="px-2 py-0.5 rounded-md bg-slate-900/75 backdrop-blur-xs text-white text-[9px] font-bold uppercase tracking-wider">
                      {asset.category}
                    </span>
                    {asset.version && asset.version > 1 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-teal-600 text-white text-[9px] font-mono font-bold">
                        v{asset.version}
                      </span>
                    )}
                  </div>

                  {isArchived && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[9px] font-bold uppercase">
                      Archived
                    </div>
                  )}

                  {/* Hover Quick Overlay */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetailAsset(asset);
                      }}
                      className="p-2 bg-white text-slate-800 hover:text-[#007E70] rounded-xl shadow-md transition-transform hover:scale-110 cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setReplaceAsset(asset);
                        setReplaceFile(null);
                        setReplacePreview(null);
                        setReplaceError(null);
                      }}
                      className="p-2 bg-white text-slate-800 hover:text-teal-600 rounded-xl shadow-md transition-transform hover:scale-110 cursor-pointer"
                      title="Replace Image File"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h4
                      className="text-xs font-bold text-slate-800 truncate cursor-pointer hover:text-[#007E70]"
                      title={asset.fileName}
                      onClick={() => setDetailAsset(asset)}
                    >
                      {asset.fileName}
                    </h4>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {asset.altText}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-1 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{asset.width && asset.height ? `${asset.width}×${asset.height}` : 'Vector'}</span>
                      <span>{formatBytes(asset.fileSize)}</span>
                    </div>

                    {usage.length > 0 ? (
                      <div className="bg-teal-50 border border-teal-100/80 rounded-lg px-2 py-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#007E70] shrink-0" />
                        <span className="text-[10px] font-semibold text-[#007E70] truncate">
                          {usage[0].name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-300 italic block">Unreferenced</span>
                    )}
                  </div>

                  {/* Card Actions Footer */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-slate-400">
                    <button
                      onClick={() => copyUrl(asset.url, asset.id)}
                      className="p-1 hover:text-slate-700 rounded transition-colors cursor-pointer text-[10px] flex items-center gap-1"
                      title="Copy Public URL"
                    >
                      {copiedId === asset.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleArchive(asset)}
                        className="p-1 hover:text-amber-600 rounded transition-colors cursor-pointer"
                        title={isArchived ? 'Restore to Active' : 'Archive Asset'}
                      >
                        {isArchived ? (
                          <ArchiveRestore className="w-3.5 h-3.5" />
                        ) : (
                          <Archive className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => initiateDelete(asset)}
                        className="p-1 hover:text-rose-600 rounded transition-colors cursor-pointer"
                        title="Delete Asset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Preview</th>
                  <th className="py-3 px-4">File Name & Alt Text</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Dimensions</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Usage</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                {filteredAssets.map((asset) => {
                  const usage = DataAccessLayer.getAssetUsage(asset.id);
                  const isArchived = asset.status === 'ARCHIVED';

                  return (
                    <tr
                      key={asset.id}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                      onClick={() => setDetailAsset(asset)}
                    >
                      <td className="py-3 px-4">
                        <div className="w-12 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          {asset.mimeType.startsWith('image/') ? (
                            <img
                              src={asset.url}
                              alt={asset.altText}
                              className="w-full h-full object-cover object-top"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileText className="w-5 h-5 text-slate-400" />
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-800">{asset.fileName}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{asset.altText}</p>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                          {asset.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {asset.width && asset.height ? `${asset.width}×${asset.height}` : 'Vector'}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {formatBytes(asset.fileSize)}
                      </td>

                      <td className="py-3 px-4">
                        {usage.length > 0 ? (
                          <div className="inline-flex items-center gap-1 text-[11px] text-[#007E70] font-semibold bg-teal-50 px-2 py-0.5 rounded-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#007E70]" />
                            <span>{usage[0].name}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-300 italic">None</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isArchived
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {asset.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setReplaceAsset(asset);
                              setReplaceFile(null);
                              setReplacePreview(null);
                              setReplaceError(null);
                            }}
                            className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Replace File"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => toggleArchive(asset)}
                            className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title={isArchived ? 'Restore' : 'Archive'}
                          >
                            {isArchived ? (
                              <ArchiveRestore className="w-4 h-4" />
                            ) : (
                              <Archive className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            onClick={() => initiateDelete(asset)}
                            className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: UPLOAD NEW ASSET */}
      {/* ========================================================================= */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
          <div
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div>
                <h3 className="text-lg font-extrabold text-[#0F172A] flex items-center gap-2">
                  <Upload className="w-5 h-5 text-[#007E70]" />
                  <span>Upload Media Asset</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload doctor photos, logos, or clinic assets into centralized storage.
                </p>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Category Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Asset Category *
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as MediaCategory)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#007E70]/20 focus:border-[#007E70]"
                >
                  <option value="DOCTOR">Doctor Profile Photo (JPG/PNG/WebP, 4:5)</option>
                  <option value="BRAND">CareOn Brand Logo (SVG/PNG/WebP)</option>
                  <option value="FAVICON">Browser Favicon (SVG/PNG/ICO)</option>
                  <option value="GALLERY">Clinic Facility & Atmosphere</option>
                  <option value="SERVICE">Service Asset</option>
                  <option value="DEPARTMENT">Department Cover</option>
                  <option value="OTHER">General Graphic</option>
                </select>
              </div>

              {/* File Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all ${
                  uploadPreview
                    ? 'border-teal-400 bg-teal-50/20'
                    : 'border-slate-300 hover:border-[#007E70] bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {uploadPreview ? (
                  <div className="space-y-3">
                    <div className="w-28 h-36 mx-auto rounded-2xl overflow-hidden shadow-md border border-teal-200 bg-white">
                      <img
                        src={uploadPreview}
                        alt="Upload Preview"
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
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#007E70] border border-teal-100 flex items-center justify-center mx-auto shadow-2xs">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      Click to choose image or drag file here
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Max file size: 5 MB (1 MB for Favicons). Doctor photos must be JPG, PNG, or WebP.
                    </p>
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2 text-rose-700 text-xs animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Alt Text Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Alt Text (Screen Readers & SEO) *
                </label>
                <input
                  type="text"
                  value={uploadAltText}
                  onChange={(e) => setUploadAltText(e.target.value)}
                  placeholder="e.g. Dr. Debdutta Nayak - Consultant Physician"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#007E70]/20 focus:border-[#007E70]"
                />
              </div>
            </div>

            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsUploadOpen(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={submitUpload}
                disabled={!uploadFile || isUploading}
                className="px-5 py-2 bg-[#007E70] hover:bg-[#00665B] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isUploading ? (
                  <span>Uploading...</span>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Asset</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ASSET DETAILS & METADATA */}
      {/* ========================================================================= */}
      {detailAsset && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
          <div
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-teal-50 border border-teal-200 text-[#007E70] text-xs font-bold uppercase">
                  {detailAsset.category}
                </span>
                <h3 className="text-base font-extrabold text-[#0F172A] truncate max-w-sm">
                  {detailAsset.fileName}
                </h3>
              </div>
              <button
                onClick={() => setDetailAsset(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Asset Preview */}
              <div className="w-full aspect-[16/9] sm:aspect-[21/9] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center relative p-4">
                <img
                  src={detailAsset.url}
                  alt={detailAsset.altText}
                  className="max-h-full max-w-full object-contain rounded-lg"
                />
              </div>

              {/* Usage Banner */}
              {(() => {
                const usage = DataAccessLayer.getAssetUsage(detailAsset.id);
                return usage.length > 0 ? (
                  <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-2xl flex items-center gap-3 text-xs">
                    <ShieldCheck className="w-5 h-5 text-[#007E70] shrink-0" />
                    <div>
                      <p className="font-bold text-[#007E70]">Active Asset In Use</p>
                      <p className="text-teal-800">
                        Referenced by: {usage.map((u) => `${u.type} (${u.name})`).join(', ')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500 flex items-center gap-2">
                    <Info className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>This asset is not currently bound to any active doctor or brand entity.</span>
                  </div>
                );
              })()}

              {/* Technical Specifications */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Dimensions</span>
                  <span className="text-xs font-extrabold text-slate-800 font-mono">
                    {detailAsset.width && detailAsset.height
                      ? `${detailAsset.width} × ${detailAsset.height} px`
                      : 'Vector SVG'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">File Size</span>
                  <span className="text-xs font-extrabold text-slate-800 font-mono">
                    {formatBytes(detailAsset.fileSize)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">MIME Format</span>
                  <span className="text-xs font-extrabold text-slate-800 font-mono">
                    {detailAsset.mimeType}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Version</span>
                  <span className="text-xs font-extrabold text-[#007E70] font-mono">
                    v{detailAsset.version || 1}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Created At</span>
                  <span className="text-xs font-medium text-slate-700">
                    {new Date(detailAsset.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Storage Key</span>
                  <span className="text-xs font-mono text-slate-600 truncate block" title={detailAsset.storageKey}>
                    {detailAsset.storageKey}
                  </span>
                </div>
              </div>

              {/* Alt Text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alt Text (Accessibility)
                </label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800">
                  {detailAsset.altText}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
              <button
                onClick={() => copyUrl(detailAsset.url, detailAsset.id)}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedId === detailAsset.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied URL!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Asset URL</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setReplaceAsset(detailAsset);
                    setReplaceFile(null);
                    setReplacePreview(null);
                    setReplaceError(null);
                  }}
                  className="px-4 py-2 bg-[#007E70] hover:bg-[#00665B] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Replace File</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: REPLACE ASSET FILE */}
      {/* ========================================================================= */}
      {replaceAsset && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
          <div
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div>
                <h3 className="text-lg font-extrabold text-[#0F172A] flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-[#007E70]" />
                  <span>Replace Media Asset</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Replacing <strong className="text-slate-800">{replaceAsset.fileName}</strong>. All references will instantly use the new version.
                </p>
              </div>
              <button
                onClick={() => setReplaceAsset(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div
                onClick={() => replaceInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all ${
                  replacePreview
                    ? 'border-teal-400 bg-teal-50/20'
                    : 'border-slate-300 hover:border-[#007E70] bg-slate-50/50'
                }`}
              >
                <input
                  ref={replaceInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={handleReplaceSelect}
                  className="hidden"
                />

                {replacePreview ? (
                  <div className="space-y-3">
                    <div className="w-28 h-36 mx-auto rounded-2xl overflow-hidden shadow-md border border-teal-200 bg-white">
                      <img
                        src={replacePreview}
                        alt="New File Preview"
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{replaceFile?.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {replaceFile ? formatBytes(replaceFile.size) : ''} • Ready to replace
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#007E70] border border-teal-100 flex items-center justify-center mx-auto shadow-2xs">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      Click to choose replacement file
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Category: {replaceAsset.category}. Existing URL references will be updated.
                    </p>
                  </div>
                )}
              </div>

              {replaceError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2 text-rose-700 text-xs animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{replaceError}</span>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-2">
              <button
                onClick={() => setReplaceAsset(null)}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={submitReplace}
                disabled={!replaceFile || isReplacing}
                className="px-5 py-2 bg-[#007E70] hover:bg-[#00665B] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isReplacing ? (
                  <span>Replacing...</span>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Confirm Replacement</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: DELETE CONFIRMATION (PERMANENT & FREE STORAGE) */}
      {/* ========================================================================= */}
      {deleteConfirmCandidate && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
          <div
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col p-6 text-center space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-[#0F172A]">
                Permanently Delete Asset?
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-slate-900 font-bold">"{deleteConfirmCandidate.fileName}"</strong>?
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3 text-left">
              <img
                src={deleteConfirmCandidate.url}
                alt={deleteConfirmCandidate.fileName}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-white"
              />
              <div className="space-y-0.5 overflow-hidden">
                <p className="text-xs font-bold text-slate-800 truncate">{deleteConfirmCandidate.originalName}</p>
                <p className="text-[11px] text-emerald-600 font-bold">
                  Reclaims {formatBytes(deleteConfirmCandidate.fileSize)} storage
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold p-3 rounded-2xl flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <p className="text-[11px] text-slate-400">
              This will permanently delete the physical file from Supabase Storage and remove it from the production database.
            </p>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmCandidate(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleExecutePermanentDelete(deleteConfirmCandidate)}
                disabled={isDeleting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs font-sans disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting & Freeing Storage...</span>
                  </>
                ) : (
                  <span>Delete Permanently & Free Storage</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: DELETE WARNING (ACTIVE REFERENCES) */}
      {/* ========================================================================= */}
      {deleteWarning && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
          <div
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                <AlertCircle className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-[#0F172A]">
                  Asset is Actively Referenced
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  The asset <strong className="text-slate-900 font-bold">"{deleteWarning.asset.fileName}"</strong> is currently used by:
                </p>
              </div>

              <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-3 text-left space-y-1 max-h-32 overflow-y-auto">
                {deleteWarning.usage.map((u, i) => (
                  <div key={i} className="text-xs text-rose-900 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span>
                      {u.type}: <strong className="font-extrabold">{u.name}</strong>
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-slate-400">
                Deleting this file will force-delete the binary and reclaim storage ({formatBytes(deleteWarning.asset.fileSize)}). Fallback visuals will be shown.
              </p>

              {deleteError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                  {deleteError}
                </div>
              )}

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setDeleteWarning(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmForcedDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Force Delete & Free Storage</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
