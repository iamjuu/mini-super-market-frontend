import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  RefreshCw,
  Sparkles,
  LayoutGrid,
  List,
  Image as ImageIcon,
  Tag,
  AlertCircle,
  Copy,
  Check,
  Apple,
  Milk,
  ShoppingBag,
  Coffee,
  Utensils,
  Cake,
  Fish,
  Flame,
  Zap,
  Package,
  Boxes,
  ArrowLeft,
  ChevronRight,
  Scale,
  Settings2,
  FolderTree,
  Truck,
  Upload,
  Loader2,
} from 'lucide-react';
import ApiClient from '../../../api/client';
import { ConfirmDialog, Modal } from '../../../components/common/Modal';
import { compressImage } from '../../../utils/imageCompressor';

// Preset icon options for quick selection
const ICON_OPTIONS = [
  { label: 'Boxes / General', value: 'Boxes', icon: Boxes },
  { label: 'Fruits & Veggies', value: 'Apple', icon: Apple },
  { label: 'Dairy & Bakery', value: 'Milk', icon: Milk },
  { label: 'Grocery & Staples', value: 'ShoppingBag', icon: ShoppingBag },
  { label: 'Snacks & Drinks', value: 'Coffee', icon: Coffee },
  { label: 'Hot Food / Meals', value: 'Utensils', icon: Utensils },
  { label: 'Cakes & Desserts', value: 'Cake', icon: Cake },
  { label: 'Meat & Seafood', value: 'Fish', icon: Fish },
  { label: 'Trending / Deals', value: 'Flame', icon: Flame },
  { label: 'Express / Fresh', value: 'Zap', icon: Zap },
  { label: 'Packages / Bundles', value: 'Package', icon: Package },
  { label: 'Tag / Specials', value: 'Tag', icon: Tag },
];

const PRESET_CATEGORIES = [
  {
    name: 'Fruits & Vegetables',
    icon: 'Apple',
    image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=500&auto=format&fit=crop&q=80',
    description: 'Fresh farm fruits, organic vegetables and greens',
  },
  {
    name: 'Grocery & Kitchen Essentials',
    icon: 'ShoppingBag',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
    description: 'Rice, wheat flour, pulses, spices, edible oils and sugar',
  },
  {
    name: 'Meat & Seafood',
    icon: 'Fish',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
    description: 'Fresh chicken, mutton, ocean fish, prawns and seafood cuts',
  },
  {
    name: 'Dairy & Bakery',
    icon: 'Milk',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
    description: 'Fresh milk, curd, paneer, artisan bread, butter and cheese',
  },
  {
    name: 'Snacks & Beverages',
    icon: 'Coffee',
    image: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=500&auto=format&fit=crop&q=80',
    description: 'Chips, biscuits, juices, cold drinks, tea and gourmet coffee',
  },
];

export const CategoriesList = ({ defaultTab = 'categories' }) => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [pageMode, setPageMode] = useState('list'); // 'list' | 'add' | 'edit'
  const [activeCatalogTab, setActiveCatalogTab] = useState(defaultTab); // 'categories' | 'subcategories'
  const [isLoading, setIsLoading] = useState(true);

  // All Subcategories across all categories (for Subcategories Master tab)
  const [allSubcategories, setAllSubcategories] = useState([]);
  const [isAllSubcategoriesLoading, setIsAllSubcategoriesLoading] = useState(false);
  const [subcatCategoryFilter, setSubcatCategoryFilter] = useState('ALL');
  const [subcatSearch, setSubcatSearch] = useState('');
  const [isQuickSubModalOpen, setIsQuickSubModalOpen] = useState(false);
  const [quickSubModalMode, setQuickSubModalMode] = useState('add');
  const [quickSubModalId, setQuickSubModalId] = useState(null);
  const [quickSubFormData, setQuickSubFormData] = useState({
    categoryId: '',
    name: '',
    description: '',
    allowedUnitIds: [],
    isActive: true,
  });
  const [quickSubError, setQuickSubError] = useState('');
  const [isSubmittingQuickSub, setIsSubmittingQuickSub] = useState(false);

  // Modals & Target States
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);

  // Available Global Units for Subcategory Assignment
  const [availableUnits, setAvailableUnits] = useState([]);

  // Subcategories linked to active category (when in edit / view page)
  const [subcategories, setSubcategories] = useState([]);
  const [isSubcategoriesLoading, setIsSubcategoriesLoading] = useState(false);
  const [activeSubcategoryForm, setActiveSubcategoryForm] = useState(null); // null or { mode: 'add'|'edit', data }
  const [subcategoryFormError, setSubcategoryFormError] = useState('');
  const [deleteSubcategoryTarget, setDeleteSubcategoryTarget] = useState(null);

  // Category Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'Boxes',
    image: '',
    deliveryPrice: 30,
    isActive: true,
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState(null);

  // 1. Fetch Categories
  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await ApiClient.get('/admin/categories', {
        search: search || undefined,
        status: statusFilter || undefined,
      });
      if (response.success && response.data) {
        const catList = Array.isArray(response.data)
          ? response.data
          : (response.data.categories || []);
        setCategories(catList);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Fetch Available Units
  const fetchUnits = async () => {
    try {
      const response = await ApiClient.get('/admin/units', { status: 'ACTIVE' });
      if (response.success && response.data) {
        const unitList = Array.isArray(response.data)
          ? response.data
          : (response.data.units || []);
        setAvailableUnits(unitList);
      }
    } catch (err) {
      console.error('Failed to load units:', err);
    }
  };

  // 3. Fetch Subcategories for a Category
  const fetchSubcategories = async (categoryId) => {
    if (!categoryId) return;
    setIsSubcategoriesLoading(true);
    try {
      const response = await ApiClient.get('/admin/subcategories', { categoryId });
      if (response.success && response.data) {
        const subList = Array.isArray(response.data)
          ? response.data
          : (response.data.subcategories || []);
        setSubcategories(subList);
      }
    } catch (err) {
      console.error('Failed to load subcategories:', err);
    } finally {
      setIsSubcategoriesLoading(false);
    }
  };

  const fetchAllSubcategories = async () => {
    setIsAllSubcategoriesLoading(true);
    try {
      const response = await ApiClient.get('/admin/subcategories');
      if (response.success && response.data) {
        const list = Array.isArray(response.data)
          ? response.data
          : (response.data.subcategories || []);
        setAllSubcategories(list);
      }
    } catch (err) {
      console.error('Failed to load all subcategories:', err);
    } finally {
      setIsAllSubcategoriesLoading(false);
    }
  };

  const handleOpenAddQuickSubcategory = (presetCategoryId = '') => {
    setQuickSubModalMode('add');
    setQuickSubModalId(null);
    setQuickSubFormData({
      categoryId: presetCategoryId || (categories[0]?._id || ''),
      name: '',
      description: '',
      allowedUnitIds: availableUnits.slice(0, 3).map((u) => u._id),
      isActive: true,
    });
    setQuickSubError('');
    setIsQuickSubModalOpen(true);
  };

  const handleOpenEditQuickSubcategory = (sub) => {
    setQuickSubModalMode('edit');
    setQuickSubModalId(sub._id);
    setQuickSubFormData({
      categoryId: sub.categoryId?._id || sub.categoryId || '',
      name: sub.name,
      description: sub.description || '',
      allowedUnitIds: (sub.allowedUnitIds || []).map((u) => u._id || u),
      isActive: sub.isActive !== undefined ? sub.isActive : true,
    });
    setQuickSubError('');
    setIsQuickSubModalOpen(true);
  };

  const handleSaveQuickSubcategory = async (e) => {
    e.preventDefault();
    if (!quickSubFormData.categoryId) {
      setQuickSubError('Please select a parent category.');
      return;
    }
    if (!quickSubFormData.name.trim()) {
      setQuickSubError('Subcategory name is required.');
      return;
    }
    if (quickSubFormData.allowedUnitIds.length === 0) {
      setQuickSubError('Please select at least one allowed unit type.');
      return;
    }

    setIsSubmittingQuickSub(true);
    setQuickSubError('');
    try {
      let res;
      if (quickSubModalMode === 'add') {
        res = await ApiClient.post('/admin/subcategories', quickSubFormData);
      } else {
        res = await ApiClient.patch(`/admin/subcategories/${quickSubModalId}`, quickSubFormData);
      }
      if (res.success) {
        setIsQuickSubModalOpen(false);
        fetchAllSubcategories();
        fetchCategories();
      } else {
        setQuickSubError(res.message || 'Failed to save subcategory');
      }
    } catch (err) {
      setQuickSubError(err.message || 'Error saving subcategory');
    } finally {
      setIsSubmittingQuickSub(false);
    }
  };

  useEffect(() => {
    setActiveCatalogTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    fetchCategories();
    fetchUnits();
    fetchAllSubcategories();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCategories();
  };

  // Switch to Full Page ADD Mode (Replaces modal)
  const handleOpenAddPage = () => {
    setSelectedCategory(null);
    setSubcategories([]);
    setActiveSubcategoryForm(null);
    setFormData({
      name: '',
      description: '',
      image: '',
      isActive: true,
    });
    setFormError('');
    setFormSuccess('');
    setPageMode('add');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Switch to Full Page EDIT Mode
  const handleOpenEditPage = (cat) => {
    setSelectedCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      image: cat.image || '',
      isActive: cat.isActive !== undefined ? cat.isActive : true,
    });
    setFormError('');
    setFormSuccess('');
    setActiveSubcategoryForm(null);
    setPageMode('edit');
    fetchSubcategories(cat._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setPageMode('list');
    setSelectedCategory(null);
    setSubcategories([]);
    setActiveSubcategoryForm(null);
    fetchCategories();
  };

  // Save Category (Create or Update)
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Category name is required.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    setFormSuccess('');

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: formData.image.trim(),
        isActive: formData.isActive,
      };

      let response;
      if (pageMode === 'add') {
        response = await ApiClient.post('/admin/categories', payload);
      } else {
        response = await ApiClient.patch(`/admin/categories/${selectedCategory._id}`, payload);
      }

      if (response.success) {
        setFormSuccess(response.message || 'Category saved successfully!');
        setTimeout(() => {
          handleBackToList();
        }, 800);
      } else {
        setFormError(response.message || 'Failed to save category');
      }
    } catch (err) {
      setFormError(err.message || 'An error occurred while saving category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleCategoryImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingImage(true);
      try {
        // Compress image client-side (max 1000px, quality 0.82)
        const compressedBase64 = await compressImage(file, {
          maxWidth: 1000,
          maxHeight: 1000,
          quality: 0.82,
        });

        const res = await ApiClient.post('/upload', {
          image: compressedBase64,
          folder: 'shamil_marketplace/categories',
        });
        if (res?.data?.url) {
          setFormData((prev) => ({ ...prev, image: res.data.url }));
        } else {
          setFormData((prev) => ({ ...prev, image: compressedBase64 }));
        }
      } catch (err) {
        console.error('Failed to compress/upload category image:', err);
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const [addingPresetName, setAddingPresetName] = useState(null);
  const [togglingCatId, setTogglingCatId] = useState(null);
  const [isSubmittingSubcategory, setIsSubmittingSubcategory] = useState(false);

  const handleToggleStatus = async (cat) => {
    if (togglingCatId === cat._id) return;
    setTogglingCatId(cat._id);
    try {
      await ApiClient.patch(`/admin/categories/${cat._id}`, {
        isActive: !cat.isActive,
      });
      await fetchCategories();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    } finally {
      setTogglingCatId(null);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteTarget) return;
    try {
      await ApiClient.delete(`/admin/categories/${deleteTarget._id}`);
      setDeleteTarget(null);
      await fetchCategories();
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  };

  // Quick Preset Add with loading state to prevent duplicates
  const handleAddPreset = async (preset) => {
    if (addingPresetName) return;
    setAddingPresetName(preset.name);
    try {
      await ApiClient.post('/admin/categories', {
        name: preset.name,
        description: preset.description,
        icon: preset.icon,
        image: preset.image,
        isActive: true,
      });
      await fetchCategories();
    } catch (err) {
      console.error('Failed to add preset category:', err);
    } finally {
      setAddingPresetName(null);
    }
  };

  // Subcategory Actions
  const handleOpenAddSubcategory = () => {
    setActiveSubcategoryForm({
      mode: 'add',
      data: {
        name: '',
        description: '',
        allowedUnitIds: availableUnits.slice(0, 2).map((u) => u._id), // default to first 2 units
        isActive: true,
      },
    });
    setSubcategoryFormError('');
  };

  const handleOpenEditSubcategory = (sub) => {
    setActiveSubcategoryForm({
      mode: 'edit',
      subcategoryId: sub._id,
      data: {
        name: sub.name,
        description: sub.description || '',
        allowedUnitIds: (sub.allowedUnitIds || []).map((u) => (u._id ? u._id : u)),
        isActive: sub.isActive !== undefined ? sub.isActive : true,
      },
    });
    setSubcategoryFormError('');
  };

  const handleSaveSubcategory = async (e) => {
    e.preventDefault();
    if (!activeSubcategoryForm?.data?.name?.trim()) {
      setSubcategoryFormError('Subcategory name is required.');
      return;
    }

    setIsSubmittingSubcategory(true);
    setSubcategoryFormError('');

    try {
      const payload = {
        categoryId: selectedCategory._id,
        name: activeSubcategoryForm.data.name.trim(),
        description: activeSubcategoryForm.data.description || '',
        allowedUnitIds: activeSubcategoryForm.data.allowedUnitIds || [],
        isActive: activeSubcategoryForm.data.isActive,
      };

      let res;
      if (activeSubcategoryForm.mode === 'add') {
        res = await ApiClient.post('/admin/subcategories', payload);
      } else {
        res = await ApiClient.patch(`/admin/subcategories/${activeSubcategoryForm.subcategoryId}`, payload);
      }

      if (res.success) {
        setActiveSubcategoryForm(null);
        await fetchSubcategories(selectedCategory._id);
        await fetchAllSubcategories();
      } else {
        setSubcategoryFormError(res.message || 'Failed to save subcategory');
      }
    } catch (err) {
      setSubcategoryFormError(err.message || 'Error saving subcategory');
    } finally {
      setIsSubmittingSubcategory(false);
    }
  };

  const handleDeleteSubcategory = async () => {
    if (!deleteSubcategoryTarget) return;
    try {
      const res = await ApiClient.delete(`/admin/subcategories/${deleteSubcategoryTarget._id}`);
      if (res.success) {
        setDeleteSubcategoryTarget(null);
        fetchSubcategories(selectedCategory._id);
      } else {
        alert(res.message || 'Cannot delete subcategory');
      }
    } catch (err) {
      alert(err.message || 'Cannot delete subcategory');
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedSlug(id);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const getIconComponent = (iconName) => {
    const found = ICON_OPTIONS.find((opt) => opt.value === iconName);
    const IconComp = found ? found.icon : Boxes;
    return <IconComp className="w-5 h-5" />;
  };

  const safeCategories = Array.isArray(categories) ? categories : [];
  const activeCount = safeCategories.filter((c) => c.isActive).length;

  // ==========================================
  // VIEW: FULL PAGE ADD / EDIT CATEGORY (NO MODAL)
  // ==========================================
  if (pageMode === 'add' || pageMode === 'edit') {
    const isEdit = pageMode === 'edit';
    return (
      <div className="space-y-6 pb-16">
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBackToList}
              className="p-2.5 rounded-2xl bg-[#f0f2fb] hover:bg-[#e4e7f5] text-[#181829] transition-all"
              title="Back to Categories"
            >
              <ArrowLeft className="w-5 h-5 text-[#6339f4]" />
            </button>
            <div>
              <div className="flex items-center space-x-2 text-xs text-[#8a87a6]">
                <span className="hover:underline cursor-pointer" onClick={handleBackToList}>
                  Category Catalog
                </span>
                <span>/</span>
                <span className="text-[#6339f4] font-bold">
                  {isEdit ? `Edit: ${selectedCategory?.name}` : 'Create Category'}
                </span>
              </div>
              <h1 className="text-lg font-black text-[#181829]">
                {isEdit ? `Category: ${formData.name || 'Category'}` : 'Configure New Marketplace Category'}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto">
            <button
              onClick={handleBackToList}
              className="px-4 py-2 rounded-2xl bg-[#f0f2fb] hover:bg-[#e4e7f5] text-xs font-bold text-[#8a87a6] hover:text-[#181829] transition-all"
            >
              Back to Catalog
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 cols): Category Details Form & Subcategories */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Information Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#181829]">Category Details</h2>
                <p className="text-xs text-[#8a87a6] mt-0.5">
                  Configure the primary supermarket category name, description, and image.
                </p>
              </div>

              {formError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center space-x-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="font-medium">{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs flex items-center space-x-2.5">
                  <Check className="w-4 h-4 shrink-0" />
                  <span className="font-medium">{formSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSaveCategory} className="space-y-5">
                {/* 1. Category Name */}
                <div>
                  <label className="block text-xs font-bold text-[#181829] mb-1.5">
                    Category Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Fruits & Vegetables, Dairy, Bakery, Beverages"
                    className="w-full px-4 py-3 rounded-2xl bg-[#f0f2fb] border border-slate-200 text-xs font-semibold text-[#181829] focus:outline-none focus:border-[#6339f4] focus:bg-white transition-all"
                  />
                  {formData.name && (
                    <p className="text-[10px] text-slate-400 font-mono mt-1">
                      Slug: /{formData.name
                        .toLowerCase()
                        .trim()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/[\s_-]+/g, '-')
                        .replace(/^-+|-+$/g, '')}
                    </p>
                  )}
                </div>

                {/* 2. Description */}
                <div>
                  <label className="block text-xs font-bold text-[#181829] mb-1.5">
                    Description <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of products available in this category..."
                    className="w-full px-4 py-3 rounded-2xl bg-[#f0f2fb] border border-slate-200 text-xs font-medium text-[#181829] focus:outline-none focus:border-[#6339f4] focus:bg-white resize-none transition-all"
                  />
                </div>

                {/* 3. Category Image with Upload Field */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#181829]">
                      Category Image <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-semibold">Upload file or enter URL</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* File Upload Box */}
                    <label className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#6339f4] bg-[#f8f9fd] hover:bg-[#ece8ff]/30 cursor-pointer transition-all text-center group">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-xs text-[#6339f4] mb-2 group-hover:scale-110 transition-transform">
                        {isUploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                      </div>
                      <span className="text-xs font-bold text-[#181829]">
                        {isUploadingImage ? 'Uploading to Cloudinary...' : 'Choose Image File'}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        {isUploadingImage ? 'Please wait...' : 'PNG, JPG, WEBP (Cloudinary auto-optimized)'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingImage}
                        onChange={handleCategoryImageUpload}
                        className="hidden"
                      />
                    </label>

                    {/* Direct URL Input */}
                    <div className="flex flex-col justify-center space-y-1.5 p-3 rounded-2xl bg-[#f0f2fb] border border-slate-200">
                      <span className="text-[10px] font-bold text-[#8a87a6] uppercase tracking-wider">
                        Or Paste Image URL
                      </span>
                      <div className="relative">
                        <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="url"
                          value={formData.image}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-[#181829] focus:outline-none focus:border-[#6339f4] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {formData.image && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                      <div className="flex items-center space-x-3">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-2xs">
                          <img
                            src={formData.image}
                            alt="Category Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Category Image Loaded</span>
                          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Ready for catalog & storefront display
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '' })}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* 4. Active Toggle */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#f0f2fb] border border-slate-200">
                  <div>
                    <div className="text-xs font-bold text-[#181829]">Category Published & Active</div>
                    <div className="text-[10px] text-[#8a87a6]">
                      Make this category visible across customer storefront and mobile app.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 text-[#6339f4] rounded focus:ring-[#6339f4] accent-[#6339f4] cursor-pointer"
                  />
                </div>

                {/* Submit Action Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleBackToList}
                    className="px-6 py-2.5 rounded-2xl text-xs font-bold text-[#8a87a6] hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center space-x-2 px-7 py-2.5 rounded-2xl bg-[#6339f4] hover:bg-[#5327ec] text-xs font-bold text-white transition-all shadow-md shadow-[#6339f4]/25 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{isEdit ? 'Save Changes' : 'Create Category'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

                      </div>

          {/* Right Column (1 col): Clean Live Storefront Category Preview Card */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 sticky top-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#8a87a6] uppercase tracking-wider">
                  Storefront Preview
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  formData.isActive
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}>
                  {formData.isActive ? 'Active' : 'Draft'}
                </span>
              </div>

              {/* Mock Marketplace Category Card */}
              <div className="rounded-2xl overflow-hidden border border-slate-200/80 shadow-md bg-white">
                <div className="h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt="Category Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#6339f4]/10 to-slate-200 flex flex-col items-center justify-center text-slate-400 space-y-1">
                      <ImageIcon className="w-8 h-8 opacity-40 text-[#6339f4]" />
                      <span className="text-[11px] font-medium text-slate-400">No Image Provided</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>

                  <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-300 block mb-0.5">
                      Supermarket Category
                    </span>
                    <h4 className="font-black text-base tracking-tight truncate drop-shadow-md">
                      {formData.name || 'Category Name'}
                    </h4>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {formData.description || 'Category description will appear here on customer storefront and mobile app.'}
                  </p>
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-slate-400 text-[10px]">
                      /{formData.name
                        ? formData.name
                            .toLowerCase()
                            .trim()
                            .replace(/[^\w\s-]/g, '')
                            .replace(/[\s_-]+/g, '-')
                        : 'category-slug'}
                    </span>
                    <span className="font-black text-[#6339f4] text-[10px] uppercase">
                      Al Salhiya Catalog
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredSubcategories = allSubcategories.filter((sub) => {
    const parentId = sub.categoryId?._id || sub.categoryId;
    if (subcatCategoryFilter !== 'ALL' && String(parentId) !== String(subcatCategoryFilter)) {
      return false;
    }
    if (subcatSearch.trim()) {
      const q = subcatSearch.toLowerCase().trim();
      const matchName = (sub.name || '').toLowerCase().includes(q);
      const matchParent = (sub.categoryId?.name || '').toLowerCase().includes(q);
      const matchDesc = (sub.description || '').toLowerCase().includes(q);
      return matchName || matchParent || matchDesc;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header Banner & Main Actions */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-[#6339f4]/10 text-[#6339f4] ring-4 ring-[#ece8ff]">
            {activeCatalogTab === 'categories' ? <Layers className="w-6 h-6" /> : <FolderTree className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-base font-black text-[#181829] tracking-tight">
              {activeCatalogTab === 'categories' ? 'Product Category Catalog' : 'Subcategories & Unit Restrictions'}
            </h2>
            <p className="text-xs text-[#8a87a6] font-medium">
              {activeCatalogTab === 'categories'
                ? 'Organize marketplace items into primary categories with storefront banners and icons.'
                : 'Manage subcategories linked to parent categories with admin-governed unit types for shop listings.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 self-start md:self-auto">
          {activeCatalogTab === 'categories' ? (
            <>
              <button
                onClick={() => setIsPresetsModalOpen(true)}
                className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-2xl bg-[#f0f2fb] hover:bg-[#e4e7f5] text-xs font-bold text-[#6339f4] transition-all border border-slate-200"
              >
                <Sparkles className="w-4 h-4" />
                <span>Add Presets</span>
              </button>

              <button
                onClick={handleOpenAddPage}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-[#6339f4] hover:bg-[#5327ec] text-xs font-bold text-white transition-all shadow-md shadow-[#6339f4]/25 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => handleOpenAddQuickSubcategory(subcatCategoryFilter !== 'ALL' ? subcatCategoryFilter : '')}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-[#6339f4] hover:bg-[#5327ec] text-xs font-bold text-white transition-all shadow-md shadow-[#6339f4]/25 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subcategory</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Catalog Tabs Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => setActiveCatalogTab('categories')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeCatalogTab === 'categories'
              ? 'bg-[#6339f4] text-white shadow-md shadow-[#6339f4]/20'
              : 'bg-white text-[#8a87a6] hover:text-[#181829] border border-slate-200/80'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Primary Categories ({safeCategories.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveCatalogTab('subcategories');
            fetchAllSubcategories();
          }}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeCatalogTab === 'subcategories'
              ? 'bg-[#6339f4] text-white shadow-md shadow-[#6339f4]/20'
              : 'bg-white text-[#8a87a6] hover:text-[#181829] border border-slate-200/80'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Subcategories Master ({allSubcategories.length})</span>
        </button>
      </div>

      {activeCatalogTab === 'categories' ? (
        <>
          {/* Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-[#8a87a6]">Total Categories</span>
              <div className="text-xl font-black text-[#181829]">{safeCategories.length}</div>
              <span className="text-[10px] text-[#6339f4] font-medium">Catalog taxonomy</span>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-[#8a87a6]">Active In App</span>
              <div className="text-xl font-black text-emerald-600">{activeCount}</div>
              <span className="text-[10px] text-emerald-600 font-medium">● Visible to shoppers</span>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-[#8a87a6]">Inactive / Drafts</span>
              <div className="text-xl font-black text-slate-400">
                {safeCategories.length - activeCount}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Hidden from catalog</span>
            </div>
          </div>

          {/* Search & View Toggle Filter Bar */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#8a87a6] absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search category name or details..."
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#f0f2fb] border border-slate-200/80 text-xs text-[#181829] placeholder:text-[#8a87a6] focus:outline-none focus:border-[#6339f4]"
              />
            </form>

            <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3.5 py-2 rounded-2xl bg-[#f0f2fb] border border-slate-200/80 text-xs text-[#181829] font-medium focus:outline-none focus:border-[#6339f4]"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Inactive Only</option>
              </select>

              {/* Table / Grid View Switcher */}
              <div className="flex items-center bg-[#f0f2fb] p-1 rounded-2xl border border-slate-200/80">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-xl transition-all ${
                    viewMode === 'grid'
                      ? 'bg-[#6339f4] text-white shadow-sm'
                      : 'text-[#8a87a6] hover:text-[#181829]'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-xl transition-all ${
                    viewMode === 'table'
                      ? 'bg-[#6339f4] text-white shadow-sm'
                      : 'text-[#8a87a6] hover:text-[#181829]'
                  }`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Categories Grid or Table View */}
          {isLoading ? (
            <div className="py-24 text-center text-slate-400 text-xs">
              <div className="w-6 h-6 rounded-full border-2 border-[#6339f4] border-t-transparent animate-spin mx-auto mb-2" />
              <p>Loading product categories...</p>
            </div>
          ) : safeCategories.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-6 space-y-3">
              <Layers className="w-10 h-10 text-[#8a87a6] mx-auto opacity-50" />
              <h4 className="font-bold text-sm text-[#181829]">No Categories Found</h4>
              <p className="text-xs text-[#8a87a6] max-w-sm mx-auto">
                No categories match your search or filter criteria. Create a category or import presets.
              </p>
              <button
                onClick={handleOpenAddPage}
                className="px-4 py-2 rounded-2xl bg-[#6339f4] text-white text-xs font-bold inline-flex items-center space-x-1.5 shadow-md shadow-[#6339f4]/20"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Category</span>
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {safeCategories.map((cat) => (
                <div
                  key={cat._id}
                  className="theme-card rounded-3xl overflow-hidden flex flex-col justify-between hover:border-purple-200 transition-all group"
                >
                  <div className="relative h-36 bg-slate-100 overflow-hidden">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#6339f4]/15 to-indigo-100/50 flex items-center justify-center text-[#6339f4]">
                        {getIconComponent(cat.icon)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>

                    <div className="absolute top-3 left-3 w-8 h-8 rounded-xl bg-white/95 backdrop-blur-md flex items-center justify-center text-[#6339f4] shadow-md">
                      {getIconComponent(cat.icon)}
                    </div>

                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => handleToggleStatus(cat)}
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs backdrop-blur-md cursor-pointer transition-all ${
                          cat.isActive
                            ? 'bg-emerald-500/90 text-white hover:bg-emerald-600'
                            : 'bg-rose-500/90 text-white hover:bg-rose-600'
                        }`}
                      >
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </div>

                    <div className="absolute bottom-2 left-3 right-3">
                      <h3 className="text-white font-bold text-sm tracking-tight drop-shadow-md truncate">
                        {cat.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <p className="text-xs text-[#8a87a6] line-clamp-2 min-h-[32px]">
                      {cat.description || 'No description provided for this category.'}
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center space-x-1">
                          <Truck className="w-3 h-3" />
                          <span>Delivery: ₹{cat.deliveryPrice !== undefined ? cat.deliveryPrice : 30}</span>
                        </span>
                        <div className="flex items-center space-x-1.5 text-slate-400">
                          <span className="font-mono text-[11px] text-slate-500">/{cat.slug}</span>
                          <button
                            onClick={() => copyToClipboard(cat.slug, cat._id)}
                            className="p-1 hover:text-[#6339f4] transition-colors"
                            title="Copy Slug"
                          >
                            {copiedSlug === cat._id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleOpenEditPage(cat)}
                          className="px-2.5 py-1 rounded-xl bg-[#6339f4]/10 hover:bg-[#6339f4] text-[#6339f4] hover:text-white text-[11px] font-bold transition-all flex items-center space-x-1"
                          title="Manage Subcategories & Unit Restrictions"
                        >
                          <Layers className="w-3 h-3" />
                          <span>Subcategories</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditPage(cat)}
                          className="p-1.5 rounded-xl hover:bg-[#ece8ff] text-[#8a87a6] hover:text-[#6339f4] transition-all"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(cat)}
                          className="p-1.5 rounded-xl hover:bg-rose-50 text-[#8a87a6] hover:text-rose-600 transition-all"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f0f2fb] text-[#8a87a6] uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4 font-bold">Category</th>
                      <th className="py-3.5 px-4 font-bold">Slug Identifier</th>
                      <th className="py-3.5 px-4 font-bold">Description</th>
                      <th className="py-3.5 px-4 font-bold">Subcategories</th>
                      <th className="py-3.5 px-4 font-bold">Status</th>
                      <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[#181829]">
                    {safeCategories.map((cat) => (
                      <tr key={cat._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200/80 text-[#6339f4]">
                              {cat.image ? (
                                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                              ) : (
                                getIconComponent(cat.icon)
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-xs text-[#181829]">{cat.name}</div>
                              <span className="text-[10px] text-[#8a87a6]">Icon: {cat.icon || 'Boxes'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{cat.slug}</td>
                        <td className="py-3 px-4 text-[#8a87a6] max-w-xs truncate">
                          {cat.description || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-lg bg-[#f0f2fb] text-[#6339f4] font-bold text-[11px]">
                            {cat.subcategoriesCount !== undefined ? cat.subcategoriesCount : '—'} subcategories
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleStatus(cat)}
                            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                              cat.isActive
                                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                                : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                            }`}
                          >
                            {cat.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            <span>{cat.isActive ? 'Active' : 'Inactive'}</span>
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => handleOpenEditPage(cat)}
                              className="px-2.5 py-1 rounded-xl bg-[#6339f4]/10 hover:bg-[#6339f4] text-[#6339f4] hover:text-white text-[11px] font-bold transition-all flex items-center space-x-1"
                              title="Manage Subcategories & Unit Restrictions"
                            >
                              <Layers className="w-3 h-3" />
                              <span>Subcategories</span>
                            </button>
                            <button
                              onClick={() => handleOpenEditPage(cat)}
                              className="p-1.5 rounded-xl hover:bg-[#ece8ff] text-[#8a87a6] hover:text-[#6339f4] transition-all"
                              title="Edit Category"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(cat)}
                              className="p-1.5 rounded-xl hover:bg-rose-50 text-[#8a87a6] hover:text-rose-600 transition-all"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        /* SUBCATEGORIES MASTER VIEW */
        <div className="space-y-6">
          {/* Subcategories Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-[#8a87a6]">Total Subcategories</span>
              <div className="text-xl font-black text-[#181829]">{allSubcategories.length}</div>
              <span className="text-[10px] text-[#6339f4] font-medium">Secondary taxonomy</span>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-[#8a87a6]">Active In App</span>
              <div className="text-xl font-black text-emerald-600">
                {allSubcategories.filter((s) => s.isActive).length}
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">● Available for product creation</span>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-[#8a87a6]">Linked Parent Categories</span>
              <div className="text-xl font-black text-[#6339f4]">
                {new Set(allSubcategories.map((s) => s.categoryId?._id || s.categoryId).filter(Boolean)).size}
              </div>
              <span className="text-[10px] text-[#8a87a6] font-medium">Categories with subcategories</span>
            </div>
          </div>

          {/* Search & Parent Category Filter */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#8a87a6] absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={subcatSearch}
                  onChange={(e) => setSubcatSearch(e.target.value)}
                  placeholder="Search subcategory or units..."
                  className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#f0f2fb] border border-slate-200/80 text-xs text-[#181829] placeholder:text-[#8a87a6] focus:outline-none focus:border-[#6339f4]"
                />
              </div>

              <select
                value={subcatCategoryFilter}
                onChange={(e) => setSubcatCategoryFilter(e.target.value)}
                className="px-3.5 py-2 rounded-2xl bg-[#f0f2fb] border border-slate-200/80 text-xs text-[#181829] font-medium focus:outline-none focus:border-[#6339f4]"
              >
                <option value="ALL">All Categories ({safeCategories.length})</option>
                {safeCategories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => handleOpenAddQuickSubcategory(subcatCategoryFilter !== 'ALL' ? subcatCategoryFilter : '')}
              className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-2xl bg-[#6339f4] hover:bg-[#5327ec] text-xs font-bold text-white transition-all shadow-md shadow-[#6339f4]/25 shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subcategory</span>
            </button>
          </div>

          {/* Subcategories Table */}
          {isAllSubcategoriesLoading ? (
            <div className="py-24 text-center text-slate-400 text-xs">
              <div className="w-6 h-6 rounded-full border-2 border-[#6339f4] border-t-transparent animate-spin mx-auto mb-2" />
              <p>Loading subcategories...</p>
            </div>
          ) : filteredSubcategories.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-6 space-y-3">
              <FolderTree className="w-10 h-10 text-[#8a87a6] mx-auto opacity-50" />
              <h4 className="font-bold text-sm text-[#181829]">No Subcategories Found</h4>
              <p className="text-xs text-[#8a87a6] max-w-sm mx-auto">
                {subcatSearch || subcatCategoryFilter !== 'ALL'
                  ? 'No subcategories match your current search/filter.'
                  : 'Add subcategories to organize products under parent categories and enforce unit constraints.'}
              </p>
              <button
                onClick={() => handleOpenAddQuickSubcategory(subcatCategoryFilter !== 'ALL' ? subcatCategoryFilter : '')}
                className="px-4 py-2 rounded-2xl bg-[#6339f4] text-white text-xs font-bold inline-flex items-center space-x-1.5 shadow-md shadow-[#6339f4]/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add Subcategory</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f0f2fb] text-[#8a87a6] uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4 font-bold">Subcategory</th>
                      <th className="py-3.5 px-4 font-bold">Parent Category</th>
                      <th className="py-3.5 px-4 font-bold">Allowed Unit Types</th>
                      <th className="py-3.5 px-4 font-bold">Status</th>
                      <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[#181829]">
                    {filteredSubcategories.map((sub) => {
                      const parentCat =
                        safeCategories.find(
                          (c) => c._id === (sub.categoryId?._id || sub.categoryId)
                        ) || sub.categoryId;
                      return (
                        <tr key={sub._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div>
                              <span className="font-bold text-xs text-[#181829]">{sub.name}</span>
                              {sub.description && (
                                <p className="text-[11px] text-[#8a87a6] line-clamp-1">{sub.description}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-purple-50 text-[#6339f4] font-bold text-[11px] border border-purple-100">
                              <Layers className="w-3 h-3" />
                              <span>{parentCat?.name || 'Unassigned Category'}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1">
                              {(sub.allowedUnitIds || []).length === 0 ? (
                                <span className="text-[10px] text-rose-500 font-bold">No units allowed</span>
                              ) : (
                                (sub.allowedUnitIds || []).map((u) => (
                                  <span
                                    key={u._id || u}
                                    className="px-2 py-0.5 rounded-md bg-[#6339f4]/10 text-[#6339f4] text-[10px] font-mono font-bold"
                                  >
                                    {u.symbol || u.name || u}
                                  </span>
                                ))
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                sub.isActive
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-400'
                              }`}
                            >
                              <span>{sub.isActive ? 'Active' : 'Inactive'}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => handleOpenEditQuickSubcategory(sub)}
                                className="p-1.5 rounded-xl hover:bg-[#ece8ff] text-[#8a87a6] hover:text-[#6339f4] transition-all"
                                title="Edit Subcategory & Allowed Units"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteSubcategoryTarget(sub)}
                                className="p-1.5 rounded-xl hover:bg-rose-50 text-[#8a87a6] hover:text-rose-600 transition-all"
                                title="Delete Subcategory"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* QUICK ADD / EDIT SUBCATEGORY MODAL */}
      <Modal
        isOpen={isQuickSubModalOpen}
        onClose={() => setIsQuickSubModalOpen(false)}
        title={quickSubModalMode === 'add' ? 'Add New Subcategory' : 'Edit Subcategory & Allowed Units'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveQuickSubcategory} className="space-y-4 text-xs">
          {quickSubError && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{quickSubError}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-[#181829] mb-1.5">
              Parent Category <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={quickSubFormData.categoryId}
              onChange={(e) => setQuickSubFormData({ ...quickSubFormData, categoryId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#f0f2fb] border border-slate-200/80 text-xs text-[#181829] font-medium focus:outline-none focus:border-[#6339f4]"
            >
              <option value="">Select a Category</option>
              {safeCategories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#181829] mb-1.5">
              Subcategory Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rice & Dals, Ocean Fish, Artisan Bread"
              value={quickSubFormData.name}
              onChange={(e) => setQuickSubFormData({ ...quickSubFormData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#f0f2fb] border border-slate-200/80 text-xs text-[#181829] focus:outline-none focus:border-[#6339f4]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#181829] mb-1.5">
              Description <span className="text-[#8a87a6] font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="Brief summary of items in this subcategory..."
              value={quickSubFormData.description}
              onChange={(e) => setQuickSubFormData({ ...quickSubFormData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#f0f2fb] border border-slate-200/80 text-xs text-[#181829] focus:outline-none focus:border-[#6339f4]"
            />
          </div>

          {/* Allowed Units Selection */}
          <div>
            <label className="block font-bold text-[#181829] mb-1.5 flex items-center justify-between">
              <span>
                Allowed Units <span className="text-rose-500">*</span>
              </span>
              <span className="text-[10px] text-[#8a87a6] font-normal">
                Vendors can only list with checked units
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-[#f0f2fb] p-3 rounded-2xl border border-slate-200/80 max-h-48 overflow-y-auto">
              {availableUnits.map((u) => {
                const isChecked = quickSubFormData.allowedUnitIds.includes(u._id);
                return (
                  <label
                    key={u._id}
                    className={`flex items-center space-x-2 p-2 rounded-xl cursor-pointer transition-all border ${
                      isChecked
                        ? 'bg-white border-[#6339f4] shadow-xs'
                        : 'bg-white/60 border-slate-200/60 hover:bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        const newIds = e.target.checked
                          ? [...quickSubFormData.allowedUnitIds, u._id]
                          : quickSubFormData.allowedUnitIds.filter((id) => id !== u._id);
                        setQuickSubFormData({ ...quickSubFormData, allowedUnitIds: newIds });
                      }}
                      className="w-4 h-4 accent-[#6339f4] rounded cursor-pointer shrink-0"
                    />
                    <div className="truncate">
                      <span className="font-bold text-[#181829] text-[11px] block truncate">{u.name}</span>
                      <span className="font-mono text-[#6339f4] text-[10px] block">({u.symbol})</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2.5 border-t border-slate-100">
            <button
              type="button"
              disabled={isSubmittingQuickSub}
              onClick={() => setIsQuickSubModalOpen(false)}
              className="px-4 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-[#8a87a6] hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingQuickSub}
              className="px-5 py-2 rounded-2xl bg-[#6339f4] hover:bg-[#5225e6] text-white text-xs font-bold shadow-md shadow-[#6339f4]/25 transition-all flex items-center space-x-1.5 active:scale-95"
            >
              {isSubmittingQuickSub ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{quickSubModalMode === 'add' ? 'Create Subcategory' : 'Update Subcategory'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Preset Modal (For quick loading presets) */}
      <Modal
        isOpen={isPresetsModalOpen}
        onClose={() => setIsPresetsModalOpen(false)}
        title="Add Popular Marketplace Categories"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#8a87a6]">
            Quickly expand your grocery catalog with popular categories.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
            {PRESET_CATEGORIES.map((preset, idx) => {
              const alreadyExists = safeCategories.some(
                (c) => c.name.toLowerCase() === preset.name.toLowerCase()
              );
              return (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-[#f0f2fb] border border-slate-200 flex items-center justify-between space-x-3"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={preset.image}
                      alt={preset.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#181829] truncate">{preset.name}</h4>
                      <p className="text-[10px] text-[#8a87a6] truncate">{preset.description}</p>
                    </div>
                  </div>

                  <button
                    disabled={alreadyExists || Boolean(addingPresetName)}
                    onClick={() => handleAddPreset(preset)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all flex items-center space-x-1.5 ${
                      alreadyExists
                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        : 'bg-[#6339f4] text-white hover:bg-[#5327ec] shadow-sm disabled:opacity-50'
                    }`}
                  >
                    {addingPresetName === preset.name ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Adding...</span>
                      </>
                    ) : alreadyExists ? (
                      'Added'
                    ) : (
                      '+ Add'
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setIsPresetsModalOpen(false)}
              className="px-4 py-2 rounded-2xl bg-[#f0f2fb] text-xs font-bold text-[#181829] hover:bg-[#e4e7f5]"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Category Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete the category "${deleteTarget?.name}"? Items linked to this category may lose their taxonomy.`}
        confirmText="Yes, Delete Category"
        isDestructive={true}
      />
    </div>
  );
};
