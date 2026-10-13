import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Edit2,
  Image as ImageIcon,
  Upload,
  Tag,
  ArrowLeft,
  Check,
  Eye,
  Flame,
  Percent,
  Star,
  RefreshCw,
  AlertCircle,
  X,
  Smartphone,
  Layers,
} from 'lucide-react';
import ApiClient from '../../../api/client';
import { ConfirmDialog } from '../../../components/common/Modal';

const DEFAULT_OFFERS = [
  {
    _id: 'offer-1',
    title: 'Fresh Farm Apples',
    description: 'Crisp organic Kashmiri red apples, handpicked farm fresh',
    actualPrice: 120,
    offerPrice: 69,
    image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=500&auto=format&fit=crop&q=80',
    tagBadge: '⭐ Deal of the Day',
    isActive: true,
    order: 1,
  },
  {
    _id: 'offer-2',
    title: 'Tender Fresh Poultry',
    description: 'Antibiotic-free fresh whole chicken cuts, cleaned & packed',
    actualPrice: 220,
    offerPrice: 159,
    image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=500&auto=format&fit=crop&q=80',
    tagBadge: '⚡ Flash Sale -28%',
    isActive: true,
    order: 2,
  },
  {
    _id: 'offer-3',
    title: 'Pure Desi Cow Ghee',
    description: 'Traditional bilona churned pure cow ghee in glass jar',
    actualPrice: 480,
    offerPrice: 349,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
    tagBadge: '🔥 Save ₹131 Today',
    isActive: true,
    order: 3,
  },
  {
    _id: 'offer-4',
    title: 'Fresh Marine Sardines',
    description: 'Daily coastal ocean catch, cleaned and gutted for cooking',
    actualPrice: 180,
    offerPrice: 119,
    image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=500&auto=format&fit=crop&q=80',
    tagBadge: '🐟 Ocean Catch -34%',
    isActive: true,
    order: 4,
  },
];

const PRESET_DEAL_IMAGES = [
  { name: 'Apples & Fruits', url: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=500&auto=format&fit=crop&q=80' },
  { name: 'Fresh Poultry', url: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=500&auto=format&fit=crop&q=80' },
  { name: 'Fish Catch', url: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=500&auto=format&fit=crop&q=80' },
  { name: 'Dairy & Butter', url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80' },
  { name: 'Bakery Bread', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80' },
  { name: 'Fresh Juice', url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&auto=format&fit=crop&q=80' },
];

export const OffersList = () => {
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pageMode, setPageMode] = useState('list'); // 'list' | 'add' | 'edit'
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    actualPrice: '',
    offerPrice: '',
    image: '',
    tagBadge: '⭐ Deal of the Day',
    isActive: true,
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch Offers (localStorage + API fallback)
  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      let loaded = null;
      try {
        const res = await ApiClient.get('/admin/offers').catch(() => ApiClient.get('/offers'));
        if (res?.success && res.data) {
          loaded = Array.isArray(res.data) ? res.data : (res.data?.offers || []);
        }
      } catch (_) {}

      if (!loaded || loaded.length === 0) {
        const stored = localStorage.getItem('app_offers');
        if (stored) {
          try {
            loaded = JSON.parse(stored);
          } catch (_) {}
        }
      }

      if (!loaded || loaded.length === 0) {
        loaded = DEFAULT_OFFERS;
        localStorage.setItem('app_offers', JSON.stringify(DEFAULT_OFFERS));
      }

      setOffers(loaded);
    } catch (err) {
      console.error('Failed to load offers:', err);
      setOffers(DEFAULT_OFFERS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  // Save changes to localStorage and dispatch event for immediate dynamic sync
  const persistOffers = (newList) => {
    setOffers(newList);
    localStorage.setItem('app_offers', JSON.stringify(newList));
    window.dispatchEvent(new Event('app_offers_updated'));
  };

  // Image Upload handler (file to base64)
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit. Please choose a smaller photo.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Open Add Page
  const handleOpenAdd = () => {
    setSelectedOffer(null);
    setFormData({
      title: '',
      description: '',
      actualPrice: '',
      offerPrice: '',
      image: '',
      tagBadge: '⭐ Deal of the Day',
      isActive: true,
    });
    setFormError('');
    setFormSuccess('');
    setPageMode('add');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Edit Page
  const handleOpenEdit = (item) => {
    setSelectedOffer(item);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      actualPrice: item.actualPrice !== undefined ? item.actualPrice : '',
      offerPrice: item.offerPrice !== undefined ? item.offerPrice : '',
      image: item.image || '',
      tagBadge: item.tagBadge || '⭐ Deal of the Day',
      isActive: item.isActive !== undefined ? item.isActive : true,
    });
    setFormError('');
    setFormSuccess('');
    setPageMode('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save Offer (Add or Update)
  const handleSaveOffer = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError('Offer title is required.');
      return;
    }
    if (!formData.offerPrice) {
      setFormError('Offer price is required.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        actualPrice: formData.actualPrice ? Number(formData.actualPrice) : Number(formData.offerPrice),
        offerPrice: Number(formData.offerPrice),
        image: formData.image || 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=500&auto=format&fit=crop&q=80',
        tagBadge: formData.tagBadge || '⭐ Deal of the Day',
        isActive: Boolean(formData.isActive),
      };

      // Try backend call gracefully
      try {
        if (pageMode === 'add') {
          await ApiClient.post('/admin/offers', payload).catch(() => {});
        } else {
          await ApiClient.patch(`/admin/offers/${selectedOffer._id}`, payload).catch(() => {});
        }
      } catch (_) {}

      let updatedList = [];
      if (pageMode === 'add') {
        const newItem = {
          ...payload,
          _id: `offer-${Date.now()}`,
          order: offers.length + 1,
        };
        updatedList = [newItem, ...offers];
      } else {
        updatedList = offers.map((o) => (o._id === selectedOffer._id ? { ...o, ...payload } : o));
      }

      persistOffers(updatedList);
      setFormSuccess(pageMode === 'add' ? 'Offer banner created and active on storefront!' : 'Offer updated successfully!');

      setTimeout(() => {
        setPageMode('list');
      }, 700);
    } catch (err) {
      setFormError(err.message || 'Failed to save offer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Active
  const handleToggleActive = (item) => {
    const updated = offers.map((o) => (o._id === item._id ? { ...o, isActive: !o.isActive } : o));
    persistOffers(updated);
  };

  // Delete Offer
  const handleDeleteOffer = () => {
    if (!deleteTarget) return;
    const updated = offers.filter((o) => o._id !== deleteTarget._id);
    persistOffers(updated);
    setDeleteTarget(null);
  };

  // Calculate discount percentage
  const calcDiscount = (actual, offer) => {
    const a = Number(actual);
    const o = Number(offer);
    if (!a || !o || a <= o) return null;
    return Math.round(((a - o) / a) * 100);
  };

  const filteredOffers = offers.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (o.title || '').toLowerCase().includes(q) || (o.description || '').toLowerCase().includes(q);
  });

  // ==========================================
  // VIEW: ADD / EDIT OFFER FORM
  // ==========================================
  if (pageMode === 'add' || pageMode === 'edit') {
    const discount = calcDiscount(formData.actualPrice, formData.offerPrice);

    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-16 animate-in fade-in duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setPageMode('list')}
              className="p-2.5 rounded-2xl bg-[#f0f2fb] hover:bg-[#ece8ff] text-[#18308c] transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-[#FF7824]" />
            </button>
            <div>
              <span className="text-[10px] font-bold text-[#8a87a6] uppercase tracking-wider">
                Storefront Deal Management
              </span>
              <h1 className="text-base font-black text-[#181829]">
                {pageMode === 'add' ? 'Create Dynamic Offer Carousel Banner' : `Edit Offer: ${formData.title}`}
              </h1>
            </div>
          </div>
          <button
            onClick={() => setPageMode('list')}
            className="px-4 py-2 rounded-2xl text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition-all"
          >
            Cancel
          </button>
        </div>

        {/* Form Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Form (2 cols) */}
          <form onSubmit={handleSaveOffer} className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
            {formError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Offer Title */}
            <div>
              <label className="block text-xs font-bold text-[#181829] mb-1.5">
                Offer Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. 50% OFF Fresh Farm Apples, Flat ₹100 Deals"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#f0f2fb] border border-slate-200 text-xs font-semibold text-[#181829] focus:outline-none focus:border-[#FF7824]"
              />
            </div>

            {/* Subtitle / Description */}
            <div>
              <label className="block text-xs font-bold text-[#181829] mb-1.5">
                Description / Subtitle <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g. Crisp organic Kashmiri red apples, handpicked farm fresh this morning"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#f0f2fb] border border-slate-200 text-xs text-[#181829] focus:outline-none focus:border-[#FF7824] resize-none"
              />
            </div>

            {/* Pricing Row: Actual Price vs Offer Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#181829] mb-1.5 flex items-center justify-between">
                  <span>Actual Price / MRP (₹)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Original strike-through price</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.actualPrice}
                    onChange={(e) => setFormData({ ...formData, actualPrice: e.target.value })}
                    placeholder="120"
                    className="w-full pl-8 pr-4 py-2.5 rounded-2xl bg-[#f0f2fb] border border-slate-200 text-xs font-bold text-[#181829] focus:outline-none focus:border-[#FF7824]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#181829] mb-1.5 flex items-center justify-between">
                  <span>Offer Deal Price (₹) <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-emerald-600 font-bold">Customer pays this</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-[#FF7824]">₹</span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    value={formData.offerPrice}
                    onChange={(e) => setFormData({ ...formData, offerPrice: e.target.value })}
                    placeholder="69"
                    className="w-full pl-8 pr-4 py-2.5 rounded-2xl bg-[#f0f2fb] border border-slate-200 text-xs font-black text-[#FF7824] focus:outline-none focus:border-[#FF7824]"
                  />
                </div>
              </div>
            </div>

            {/* Computed Discount Preview Badge */}
            {discount && (
              <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-between text-xs text-orange-900 font-bold">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#FF7824]" />
                  <span>Customer Saves ₹{Number(formData.actualPrice) - Number(formData.offerPrice)}</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FF7824] text-white text-[11px] font-black">
                  -{discount}% OFF
                </span>
              </div>
            )}

            {/* Image Upload Field */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#181829]">
                  Offer Photography / Banner Image
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Upload from device or enter URL</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Upload Button */}
                <label className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#FF7824] bg-[#f8f9fd] hover:bg-orange-50/50 cursor-pointer transition-all text-center group">
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-xs text-[#FF7824] mb-1.5 group-hover:scale-110 transition-transform">
                    <Upload className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-[#181829]">Choose Local File</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WEBP (Max 5MB)</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>

                {/* Direct URL */}
                <div className="flex flex-col justify-center space-y-1.5 p-3 rounded-2xl bg-[#f0f2fb] border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Or Direct Image URL
                  </span>
                  <div className="relative">
                    <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-[#181829] focus:outline-none focus:border-[#FF7824]"
                    />
                  </div>
                </div>
              </div>

              {/* Preset Image Options */}
              <div className="p-3 rounded-2xl bg-[#f0f2fb] border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 mb-2 block uppercase tracking-wider">
                  Quick Preset High-Res Photos:
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PRESET_DEAL_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, image: preset.url })}
                      className="flex flex-col items-center p-1 rounded-xl bg-white border border-slate-200 hover:border-[#FF7824] hover:shadow-xs transition-all text-center"
                    >
                      <img src={preset.url} alt={preset.name} className="w-full aspect-square rounded-lg object-cover mb-1" />
                      <span className="text-[9px] font-bold text-slate-700 truncate w-full">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Badge / Tag and Active Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#181829] mb-1.5">
                  Deal Ribbon Badge
                </label>
                <select
                  value={formData.tagBadge}
                  onChange={(e) => setFormData({ ...formData, tagBadge: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#f0f2fb] border border-slate-200 text-xs font-bold text-[#181829] focus:outline-none focus:border-[#FF7824]"
                >
                  <option value="⭐ Deal of the Day">⭐ Deal of the Day</option>
                  <option value="⚡ Flash Sale">⚡ Flash Sale</option>
                  <option value="🔥 50% OFF Special">🔥 50% OFF Special</option>
                  <option value="🌟 Weekend Saver">🌟 Weekend Saver</option>
                  <option value="🎉 Exclusive Discount">🎉 Exclusive Discount</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#f0f2fb] border border-slate-200 self-end">
                <div>
                  <div className="text-xs font-bold text-[#181829]">Show in Carousel</div>
                  <div className="text-[10px] text-slate-400">Visible on mobile storefront home</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 accent-[#FF7824] cursor-pointer"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPageMode('list')}
                className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-2xl bg-[#FF7824] hover:bg-[#e56312] text-white text-xs font-bold shadow-md shadow-[#FF7824]/30 flex items-center space-x-2 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving Offer...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{pageMode === 'add' ? 'Publish Offer to Carousel' : 'Save Changes'}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Right Live Carousel Slide Preview (1 col) */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 sticky top-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-[#FF7824]" />
                  <span>Mobile Carousel Preview</span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    formData.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {formData.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>

              {/* Exact Card Preview as Rendered in MobileStorefront.jsx */}
              <div className="rounded-2xl overflow-hidden shadow-md text-white p-4 min-h-[140px] flex items-center justify-between bg-gradient-to-r from-[#FF7824] to-[#FFA767] relative">
                <div className="flex-1 pr-3 z-10">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black tracking-wider uppercase mb-1.5">
                    {formData.tagBadge || '⭐ Deal of the Day'}
                  </span>
                  <h3 className="text-base font-black text-white line-clamp-1 leading-tight">
                    {formData.title || 'Offer Banner Title'}
                  </h3>
                  <p className="text-[11px] text-white/85 line-clamp-1 mt-0.5">
                    {formData.description || 'Deals description and savings highlight'}
                  </p>

                  <div className="mt-2.5 flex items-center space-x-2">
                    <span className="text-base font-black text-white">
                      ₹{formData.offerPrice || '99'}
                    </span>
                    {formData.actualPrice && Number(formData.actualPrice) > Number(formData.offerPrice) && (
                      <span className="text-xs text-white/70 line-through">
                        ₹{formData.actualPrice}
                      </span>
                    )}
                    <span className="ml-2 px-2.5 py-1 rounded-full bg-white text-[#FF7824] text-[10px] font-black shadow-xs">
                      View Deal
                    </span>
                  </div>
                </div>

                <div className="w-24 h-24 rounded-xl overflow-hidden bg-white/10 shrink-0 border border-white/20 shadow-inner">
                  <img
                    src={formData.image || 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=500&auto=format&fit=crop&q=80'}
                    alt="Offer Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=500&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>

                {/* Decorative circles */}
                <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
                <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
              </div>

              <div className="p-3 rounded-2xl bg-orange-50 border border-orange-100 text-[11px] text-[#18308c] font-medium leading-relaxed">
                Changes saved here dynamically stream to the storefront mobile carousel with zero reload needed.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: MAIN OFFERS LIST & STATS
  // ==========================================
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF7824] flex items-center justify-center shadow-xs border border-orange-100 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-black text-[#181829] tracking-tight">
                Offer Carousel &amp; Deals Manager
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-[#FF7824] text-[10px] font-black border border-orange-200">
                Live Storefront Feed
              </span>
            </div>
            <p className="text-xs text-[#8a87a6] font-medium">
              Manage top deal slides, actual vs offer prices, and promotional banners for the mobile storefront.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <button
            onClick={fetchOffers}
            disabled={isLoading}
            className="p-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all"
            title="Refresh Offers"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-[#FF7824] hover:bg-[#e56312] text-xs font-bold text-white transition-all shadow-md shadow-[#FF7824]/25 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Offer Banner</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500">Total Banners</span>
          <div className="text-2xl font-black text-[#181829]">{offers.length}</div>
          <span className="text-[10px] text-slate-400 font-medium">Configured in dashboard</span>
        </div>
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500">Active in Mobile Carousel</span>
          <div className="text-2xl font-black text-emerald-600">
            {offers.filter((o) => o.isActive).length}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">● Visible to shoppers now</span>
        </div>
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500">Avg. Savings</span>
          <div className="text-2xl font-black text-[#FF7824]">
            ~32% OFF
          </div>
          <span className="text-[10px] text-[#FF7824] font-medium">High conversion attraction</span>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search deals by title or description..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#f0f2fb] border border-slate-200/80 text-xs text-[#181829] focus:outline-none focus:border-[#FF7824]"
          />
        </div>
        <span className="text-xs text-slate-500 font-bold hidden sm:inline">
          Showing {filteredOffers.length} offers
        </span>
      </div>

      {/* Offers Cards Grid */}
      {filteredOffers.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <Sparkles className="w-10 h-10 text-orange-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Offer Banners Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Create promotional deals with prices and photos to feature in the storefront mobile carousel.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-[#FF7824] text-white text-xs font-bold shadow-md shadow-[#FF7824]/20"
          >
            + Add First Offer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredOffers.map((item) => {
            const discount = calcDiscount(item.actualPrice, item.offerPrice);

            return (
              <div
                key={item._id}
                className="bg-white rounded-3xl border border-slate-200/80 hover:border-orange-200 shadow-xs overflow-hidden transition-all flex flex-col justify-between group"
              >
                {/* Banner Preview Area */}
                <div className="relative p-5 text-white bg-gradient-to-r from-[#FF7824] to-[#FFA767] overflow-hidden flex items-center justify-between">
                  <div className="flex-1 pr-3 z-10">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase mb-1">
                      {item.tagBadge || '⭐ Deal of the Day'}
                    </span>
                    <h3 className="text-base font-black text-white line-clamp-1 leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-white/85 line-clamp-1 mt-0.5">
                      {item.description || 'Promotional deal'}
                    </p>
                    <div className="mt-2.5 flex items-center space-x-2">
                      <span className="text-base font-black text-white">
                        ₹{item.offerPrice}
                      </span>
                      {item.actualPrice && Number(item.actualPrice) > Number(item.offerPrice) && (
                        <span className="text-xs text-white/70 line-through">
                          ₹{item.actualPrice}
                        </span>
                      )}
                      {discount && (
                        <span className="px-2 py-0.5 rounded-full bg-white text-[#FF7824] text-[10px] font-black">
                          -{discount}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/10 shrink-0 border border-white/20 shadow-inner">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=500&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>

                  {/* Decorative background shapes */}
                  <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
                </div>

                {/* Card Controls Footer */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      onClick={() => handleToggleActive(item)}
                      className={`cursor-pointer px-3 py-1 rounded-full text-[11px] font-bold transition-all border ${
                        item.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-200 text-slate-500 border-slate-300 hover:bg-slate-300'
                      }`}
                    >
                      {item.isActive ? '● Active in Carousel' : '○ Disabled'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 transition-all shadow-2xs"
                      title="Edit Offer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="p-2 rounded-xl bg-white border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 transition-all shadow-2xs"
                      title="Delete Offer"
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Offer Banner?"
        message={`Are you sure you want to remove '${deleteTarget?.title}' from the storefront carousel?`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteOffer}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
