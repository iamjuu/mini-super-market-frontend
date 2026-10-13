import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
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
  Layers,
  Tag,
  Scale,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Check,
  X,
  SlidersHorizontal,
  Sliders,
  Truck,
  Store,
  Star,
  Upload,
  Loader2,
} from 'lucide-react';
import ApiClient from '../../../api/client';
import { ConfirmDialog, Modal } from '../../../components/common/Modal';
import { cn } from '../../../lib/utils';

// Preset high quality product photography
const PRESET_PRODUCT_IMAGES = [
  {
    name: 'Spices / Powder',
    url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'Poultry / Meat',
    url: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'Fresh Fish',
    url: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'Beverage / Juice',
    url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'Dairy / Milk',
    url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'Rice & Grains',
    url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'Fresh Veggies',
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'Bakery / Bread',
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
  },
];

export const AdminProductsList = ({ onNavigate }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);

  const [search, setSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [selectedSubcategoryFilter, setSelectedSubcategoryFilter] = useState('ALL');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('');
  const [bestOffersOnly, setBestOffersOnly] = useState(false);

  const [viewMode, setViewMode] = useState('table'); // 'grid' | 'table'
  const [pageMode, setPageMode] = useState('list'); // 'list' | 'add' | 'edit'
  const [isLoading, setIsLoading] = useState(true);

  // Active product being edited / having variants managed
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Variant Management Modal state
  const [variantModalProduct, setVariantModalProduct] = useState(null);
  const [variantsList, setVariantsList] = useState([]);
  const [isVariantsLoading, setIsVariantsLoading] = useState(false);
  const [variantForm, setVariantForm] = useState({ unitId: '', quantity: '', sku: '', isActive: true });
  const [variantError, setVariantError] = useState('');
  const [variantSuccess, setVariantSuccess] = useState('');
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [deleteVariantTarget, setDeleteVariantTarget] = useState(null);

  // Form State for Add / Edit Product (Min 2, Max 3 Images)
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    subcategoryId: '',
    brandId: '',
    description: '',
    image: '',
    images: ['', '', ''],
    price: '',
    mrp: '',
    isBestOffer: false,
    deliveryPrice: '',
    isActive: true,
  });
  const [formSubcategories, setFormSubcategories] = useState([]);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch Products
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = {
        categoryId: selectedCategoryFilter !== 'ALL' ? selectedCategoryFilter : undefined,
        subcategoryId: selectedSubcategoryFilter !== 'ALL' ? selectedSubcategoryFilter : undefined,
        brandId: selectedBrandFilter !== 'ALL' ? selectedBrandFilter : undefined,
        status: statusFilter || undefined,
        search: search || undefined,
        isBestOffer: bestOffersOnly ? true : undefined,
      };
      const res = await ApiClient.get('/products', params);
      if (res?.success) {
        const list = Array.isArray(res.data) ? res.data : (res.data?.products || []);
        setProducts(list);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Fetch Master Taxonomies (Categories, Subcategories, Brands, Units)
  const fetchMasterData = async () => {
    try {
      const fetchEndpoint = async (adminUrl, pubUrl) => {
        try {
          const res = await ApiClient.get(adminUrl);
          if (res?.success && res.data) return res;
        } catch (_) {}
        try {
          return await ApiClient.get(pubUrl);
        } catch (_) {
          return null;
        }
      };

      const [catRes, subRes, brandRes, unitRes] = await Promise.all([
        fetchEndpoint('/admin/categories', '/categories'),
        fetchEndpoint('/admin/subcategories', '/subcategories'),
        fetchEndpoint('/admin/brands', '/brands'),
        fetchEndpoint('/admin/units', '/units'),
      ]);

      const fetchedCats = catRes?.success ? (Array.isArray(catRes.data) ? catRes.data : catRes.data?.categories || []) : [];
      const fetchedSubs = subRes?.success ? (Array.isArray(subRes.data) ? subRes.data : subRes.data?.subcategories || []) : [];
      const fetchedBrands = brandRes?.success ? (Array.isArray(brandRes.data) ? brandRes.data : brandRes.data?.brands || []) : [];
      const fetchedUnits = unitRes?.success ? (Array.isArray(unitRes.data) ? unitRes.data : unitRes.data?.units || []) : [];

      if (fetchedCats.length > 0) setCategories(fetchedCats);
      if (fetchedSubs.length > 0) setSubcategories(fetchedSubs);
      if (fetchedBrands.length > 0) setBrands(fetchedBrands);
      if (fetchedUnits.length > 0) setUnits(fetchedUnits);
    } catch (err) {
      console.error('Failed to load catalog masters:', err);
    }
  };

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategoryFilter, selectedSubcategoryFilter, selectedBrandFilter, statusFilter, bestOffersOnly]);

  // Load Subcategories when Category is selected in Product Form
  const handleCategoryChange = async (catId) => {
    setFormData((prev) => ({ ...prev, categoryId: catId, subcategoryId: '' }));
    if (!catId) {
      setFormSubcategories([]);
      return;
    }
    let filteredSubs = subcategories.filter(
      (s) => s.categoryId?._id === catId || s.categoryId === catId || s.category === catId
    );
    // If not found in memory, try fetching subcategories specifically for this category
    if (filteredSubs.length === 0) {
      try {
        const res = await ApiClient.get('/admin/subcategories', { categoryId: catId })
          .catch(() => ApiClient.get('/subcategories', { categoryId: catId }));
        if (res?.success && res.data) {
          const list = Array.isArray(res.data) ? res.data : (res.data?.subcategories || []);
          if (list.length > 0) {
            filteredSubs = list;
            setSubcategories((prev) => {
              const ids = new Set(prev.map((s) => s._id));
              return [...prev, ...list.filter((l) => !ids.has(l._id))];
            });
          }
        }
      } catch (_) {}
    }
    setFormSubcategories(filteredSubs);
  };

  const [uploadingSlot, setUploadingSlot] = useState(null);

  // Upload image from user device for product photo slots
  const handleProductImageUpload = (slotIndex, e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limit. Please choose a smaller photo.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        setUploadingSlot(slotIndex);
        try {
          const res = await ApiClient.post('/upload', {
            image: reader.result,
            folder: 'shamil_marketplace/products',
          });
          const uploadedUrl = res?.data?.url || reader.result;
          const next = [...(formData.images || ['', '', ''])];
          next[slotIndex] = uploadedUrl;
          setFormData((prev) => ({
            ...prev,
            images: next,
            image: next[0] || uploadedUrl,
          }));
        } catch {
          const next = [...(formData.images || ['', '', ''])];
          next[slotIndex] = reader.result;
          setFormData((prev) => ({
            ...prev,
            images: next,
            image: next[0] || reader.result,
          }));
        } finally {
          setUploadingSlot(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Open Add Product Page
  const handleOpenAdd = () => {
    setSelectedProduct(null);
    setFormData({
      name: '',
      categoryId: '',
      subcategoryId: '',
      brandId: '',
      description: '',
      image: '',
      images: ['', '', ''],
      price: '',
      mrp: '',
      isBestOffer: false,
      deliveryPrice: '',
      isActive: true,
    });
    setFormSubcategories([]);
    setFormError('');
    setFormSuccess('');
    setPageMode('add');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Edit Product Page
  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    const catId = product.categoryId?._id || product.categoryId || '';
    const subcatId = product.subcategoryId?._id || product.subcategoryId || '';
    const brandId = product.brandId?._id || product.brandId || '';

    const matchingSubs = subcategories.filter(
      (s) => s.categoryId?._id === catId || s.categoryId === catId
    );
    setFormSubcategories(matchingSubs);

    const existingImages = Array.isArray(product.gallery) && product.gallery.length > 0
      ? [...product.gallery]
      : (product.image ? [product.image] : []);
    while (existingImages.length < 3) {
      existingImages.push('');
    }

    setFormData({
      name: product.name,
      categoryId: catId,
      subcategoryId: subcatId,
      brandId: brandId,
      description: product.description || '',
      image: product.image || existingImages[0] || '',
      images: [existingImages[0] || '', existingImages[1] || '', existingImages[2] || ''],
      price: product.price !== undefined && product.price !== null ? product.price : '',
      mrp: product.mrp !== undefined && product.mrp !== null ? product.mrp : '',
      isBestOffer: Boolean(product.isBestOffer),
      deliveryPrice: product.deliveryPrice !== null && product.deliveryPrice !== undefined ? product.deliveryPrice : '',
      isActive: product.isActive !== undefined ? product.isActive : true,
    });
    setFormError('');
    setFormSuccess('');
    setPageMode('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save Product (Create or Update with Min 2, Max 3 Images validation)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Product name is required.');
      return;
    }
    if (!formData.categoryId) {
      setFormError('Please select a Category.');
      return;
    }
    if (!formData.subcategoryId) {
      setFormError('Please select a Subcategory.');
      return;
    }

    // Validate images: Minimum 2 required, Maximum 3 allowed
    const validImages = Array.isArray(formData.images)
      ? formData.images.map(img => (img || '').trim()).filter(Boolean)
      : (formData.image ? [formData.image.trim()] : []);

    if (validImages.length < 2) {
      setFormError('At least 2 product images are required (Image 1 & Image 2). Maximum 3 images allowed.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    setFormSuccess('');

    try {
      const payload = {
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId,
        brandId: formData.brandId || null,
        description: formData.description.trim(),
        image: validImages[0], // Primary cover image
        gallery: validImages.slice(0, 3), // Exact 2 to 3 gallery photos
        images: validImages.slice(0, 3),
        price: formData.price !== '' ? Number(formData.price) : 0,
        mrp: formData.mrp !== '' ? Number(formData.mrp) : 0,
        isBestOffer: Boolean(formData.isBestOffer),
        deliveryPrice: formData.deliveryPrice !== '' ? Number(formData.deliveryPrice) : null,
        isActive: formData.isActive,
      };

      let res;
      if (pageMode === 'add') {
        res = await ApiClient.post('/products', payload);
      } else {
        res = await ApiClient.patch(`/products/${selectedProduct._id}`, payload);
      }

      if (res?.success) {
        setFormSuccess(
          pageMode === 'add'
            ? `Product '${formData.name}' created! You can now manage its variants.`
            : `Product '${formData.name}' updated successfully.`
        );
        setTimeout(() => {
          setPageMode('list');
          fetchProducts();
        }, 1200);
      } else {
        setFormError(res?.message || 'Failed to save product.');
      }
    } catch (err) {
      setFormError(err.message || 'An unexpected error occurred while saving product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Toggle Best Offer
  const handleToggleBestOffer = async (product) => {
    try {
      const updatedVal = !product.isBestOffer;
      const res = await ApiClient.patch(`/products/${product._id}`, {
        isBestOffer: updatedVal
      });
      if (res?.success) {
        setProducts(prev => prev.map(p => p._id === product._id ? { ...p, isBestOffer: updatedVal } : p));
      }
    } catch (err) {
      console.error('Failed to toggle best offer:', err);
    }
  };

  // Delete Product
  const handleDeleteProduct = async () => {
    if (!deleteTarget) return;
    try {
      const res = await ApiClient.delete(`/products/${deleteTarget._id}`);
      if (res?.success) {
        setDeleteTarget(null);
        fetchProducts();
      } else {
        alert(res?.message || 'Failed to delete product.');
      }
    } catch (err) {
      alert(err.message || 'Error deleting product.');
    }
  };

  // ==========================================
  // VARIANT MANAGEMENT LOGIC
  // ==========================================
  const handleOpenVariantsModal = async (product) => {
    setVariantModalProduct(product);
    setVariantError('');
    setVariantSuccess('');
    setVariantForm({ unitId: '', quantity: '', sku: '', isActive: true });
    setIsVariantsLoading(true);

    try {
      const res = await ApiClient.get(`/products/${product._id}/variants`);
      if (res?.success) {
        setVariantsList(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load variants:', err);
    } finally {
      setIsVariantsLoading(false);
    }
  };

  // Get allowed units for the active product's subcategory
  const activeSubcategoryAllowedUnits = useMemo(() => {
    if (!variantModalProduct) return [];
    const subcatId = variantModalProduct.subcategoryId?._id || variantModalProduct.subcategoryId;
    const sub = subcategories.find((s) => s._id === subcatId);
    if (!sub) return [];

    // sub.allowedUnitIds contains array of Unit objects or ObjectIds
    const allowedIds = (sub.allowedUnitIds || []).map((u) => (typeof u === 'object' ? u._id : u));
    return units.filter((u) => allowedIds.includes(u._id) && u.isActive);
  }, [variantModalProduct, subcategories, units]);

  // Add Variant
  const handleAddVariant = async (e) => {
    e.preventDefault();
    if (!variantForm.unitId) {
      setVariantError('Please select an allowed unit.');
      return;
    }
    const q = Number(variantForm.quantity);
    if (!q || q <= 0) {
      setVariantError('Quantity must be greater than 0.');
      return;
    }

    setIsAddingVariant(true);
    setVariantError('');
    setVariantSuccess('');

    try {
      const res = await ApiClient.post(`/products/${variantModalProduct._id}/variants`, {
        unitId: variantForm.unitId,
        quantity: q,
        sku: variantForm.sku?.trim() || '',
        isActive: variantForm.isActive,
      });

      if (res?.success) {
        setVariantSuccess(`Variant added: ${q} ${res.data?.unitId?.symbol || ''}`);
        setVariantForm({ unitId: '', quantity: '', sku: '', isActive: true });
        // Refresh variants
        const refreshed = await ApiClient.get(`/products/${variantModalProduct._id}/variants`);
        if (refreshed?.success) setVariantsList(refreshed.data || []);
        fetchProducts(); // Refresh variant counts in table
      } else {
        setVariantError(res?.message || 'Failed to add variant.');
      }
    } catch (err) {
      setVariantError(err.message || 'Error creating variant.');
    } finally {
      setIsAddingVariant(false);
    }
  };

  // Delete Variant
  const handleDeleteVariant = async () => {
    if (!deleteVariantTarget) return;
    try {
      const res = await ApiClient.delete(`/variants/${deleteVariantTarget._id}`);
      if (res?.success) {
        setDeleteVariantTarget(null);
        // Refresh variants
        const refreshed = await ApiClient.get(`/products/${variantModalProduct._id}/variants`);
        if (refreshed?.success) setVariantsList(refreshed.data || []);
        fetchProducts();
      } else {
        alert(res?.message || 'Failed to delete variant.');
      }
    } catch (err) {
      alert(err.message || 'Error deleting variant.');
    }
  };

  // Toggle Variant Status
  const handleToggleVariantStatus = async (variant) => {
    try {
      const res = await ApiClient.patch(`/variants/${variant._id}`, {
        isActive: !variant.isActive,
      });
      if (res?.success) {
        const refreshed = await ApiClient.get(`/products/${variantModalProduct._id}/variants`);
        if (refreshed?.success) setVariantsList(refreshed.data || []);
        fetchProducts();
      }
    } catch (err) {
      alert(err.message || 'Failed to update variant status.');
    }
  };

  // Filter Subcategories by Category in main table filter
  const tableFilterSubcategories = useMemo(() => {
    if (selectedCategoryFilter === 'ALL') return subcategories;
    return subcategories.filter(
      (s) => s.categoryId?._id === selectedCategoryFilter || s.categoryId === selectedCategoryFilter
    );
  }, [selectedCategoryFilter, subcategories]);

  // ==========================================
  // VIEW: ADD / EDIT PRODUCT FORM
  // ==========================================
  if (pageMode === 'add' || pageMode === 'edit') {
    const activeSubcat = formSubcategories.find((s) => s._id === formData.subcategoryId);
    const subcatAllowedUnitObjects = activeSubcat
      ? units.filter((u) => (activeSubcat.allowedUnitIds || []).some((id) => (typeof id === 'object' ? id._id === u._id : id === u._id)))
      : [];

    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-200">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPageMode('list')}
            className="flex items-center space-x-2 text-sm text-[#6030ea] hover:text-[#4b22c2] font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products Catalog</span>
          </button>
          <div className="text-xs text-gray-500 flex items-center gap-1.5">
            <span>Catalog</span>
            <ChevronRight className="w-3 h-3" />
            <span>Products</span>
            <ChevronRight className="w-3 h-3" />
            <span className="font-semibold text-gray-800">Edit Product</span>
          </div>
        </div>

        {/* Header Card */}
        <div className="bg-gradient-to-r from-[#6030ea] to-[#8050f5] p-6 rounded-3xl text-white shadow-xl flex items-center justify-between">
          <div>
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider mb-2 inline-block">
              {pageMode === 'add' ? 'Step-by-Step Catalog Creation' : 'Product Details & Configuration'}
            </span>
            <h1 className="text-2xl font-black">
              {pageMode === 'add' ? 'Add New Product' : `Edit '${formData.name}'`}
            </h1>
            <p className="text-white/80 text-xs mt-1">
              {pageMode === 'add'
                ? 'Step 1: Choose Category → Step 2: Choose Subcategory → Step 3: Enter Product Details.'
                : 'Update Category, Subcategory, Brand, and specifications for this product.'}
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0 border border-white/30 backdrop-blur-md">
            <Package className="w-9 h-9" />
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSaveProduct} className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm space-y-6">
          {formError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
              <span>{formSuccess}</span>
            </div>
          )}

          {/* Section 1: Dependent Hierarchy Selection */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#6030ea]" />
              <span>1. Category, Subcategory & Brand Selection</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Category Dropdown */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6030ea]/20 focus:border-[#6030ea] font-medium"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory Dropdown (Dependent) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Subcategory <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.subcategoryId}
                  onChange={(e) => setFormData({ ...formData, subcategoryId: e.target.value })}
                  disabled={!formData.categoryId}
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6030ea]/20 focus:border-[#6030ea] font-medium disabled:opacity-50"
                >
                  <option value="">
                    {formData.categoryId ? '-- Select Subcategory --' : '-- First Select Category --'}
                  </option>
                  {formSubcategories.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand Dropdown (Independent Master) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Brand <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <select
                  value={formData.brandId}
                  onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6030ea]/20 focus:border-[#6030ea] font-medium"
                >
                  <option value="">-- No Specific Brand / Generic --</option>
                  {brands.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Allowed Units Preview Banner for Subcategory */}
            {activeSubcat && (
              <div className="mt-3 p-3.5 rounded-2xl bg-purple-50 border border-purple-200/60 flex items-center justify-between text-xs text-purple-900">
                <div className="flex items-center space-x-2">
                  <Scale className="w-4 h-4 text-[#6030ea] shrink-0" />
                  <span>
                    Allowed Units for <strong>{activeSubcat.name}</strong>:{' '}
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {subcatAllowedUnitObjects.length > 0 ? (
                      subcatAllowedUnitObjects.map((u) => (
                        <span
                          key={u._id}
                          className="px-2 py-0.5 rounded-md bg-white text-[#6030ea] font-bold border border-purple-200 shadow-2xs"
                        >
                          {u.name} ({u.symbol})
                        </span>
                      ))
                    ) : (
                      <span className="text-rose-600 font-bold">None configured. Please add allowed units in Categories.</span>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-purple-600 font-medium">Variants can only use these units</span>
              </div>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* Section 2: Product Details */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#6030ea]" />
              <span>2. Product Details</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Product Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Turmeric Powder, Whole Chicken, Sardine, Orange Juice"
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6030ea]/20 focus:border-[#6030ea] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of the product features, quality standards, or preparation instructions..."
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6030ea]/20 focus:border-[#6030ea] font-medium"
                />
              </div>

              {/* Product Images (Min 2 Required, Max 3) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-700">
                    Product Photography <span className="text-rose-500">* (Min 2, Max 3 Images)</span>
                  </label>
                  <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-100">
                    {(formData.images || []).filter(img => (img || '').trim()).length} of 3 uploaded (Min 2 Required)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[0, 1, 2].map((idx) => {
                    const isRequired = idx < 2; // Slot 1 and Slot 2 are required
                    const imgUrl = (formData.images && formData.images[idx]) || '';

                    return (
                      <div 
                        key={idx}
                        className={cn(
                          "p-3 rounded-2xl border transition-all flex flex-col justify-between",
                          imgUrl 
                            ? "bg-purple-50/40 border-purple-200" 
                            : isRequired 
                              ? "bg-white border-dashed border-gray-300 hover:border-purple-300" 
                              : "bg-gray-50/60 border-dashed border-gray-200"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-black uppercase text-gray-700 flex items-center gap-1">
                            <span>Image {idx + 1}</span>
                            {isRequired ? (
                              <span className="text-rose-500 font-bold">* Required</span>
                            ) : (
                              <span className="text-gray-400 font-normal">(Optional)</span>
                            )}
                          </span>
                          {imgUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...(formData.images || ['', '', ''])];
                                next[idx] = '';
                                setFormData({ ...formData, images: next, image: next[0] || '' });
                              }}
                              className="text-gray-400 hover:text-rose-500 p-0.5 rounded-md hover:bg-rose-50 transition-colors"
                              title="Clear Image"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Thumbnail Preview */}
                        <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-white border border-gray-200 flex items-center justify-center mb-2.5 relative group">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={`Slot ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80';
                              }}
                            />
                          ) : (
                            <div className="text-center p-2 text-gray-400">
                              <Package className="w-6 h-6 mx-auto mb-1 opacity-40" />
                              <span className="text-[10px] font-medium block">
                                {isRequired ? 'Required Image Slot' : 'Optional Angle 3'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* URL and Device Upload Inputs */}
                        <div className="space-y-1.5">
                          <input
                            type="url"
                            value={imgUrl}
                            onChange={(e) => {
                              const next = [...(formData.images || ['', '', ''])];
                              next[idx] = e.target.value;
                              setFormData({
                                ...formData,
                                images: next,
                                image: next[0] || '',
                              });
                            }}
                            placeholder={`Paste Image ${idx + 1} URL...`}
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6030ea] font-medium"
                          />
                          <label className="flex items-center justify-center space-x-1.5 py-1 px-2 rounded-lg bg-gray-50 hover:bg-[#6030ea]/10 text-gray-600 hover:text-[#6030ea] text-[10px] font-bold cursor-pointer transition-colors border border-gray-200">
                            {uploadingSlot === idx ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin text-[#6030ea]" />
                                <span className="text-[#6030ea]">Uploading to Cloudinary...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-3 h-3 text-[#6030ea]" />
                                <span>Upload File</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingSlot === idx}
                              onChange={(e) => handleProductImageUpload(idx, e)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Presets for Current Category */}
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200">
                  <span className="text-[11px] font-bold text-gray-600 mb-2 block flex items-center justify-between">
                    <span>Quick Fill Presets:</span>
                    <span className="text-[10px] text-gray-400 font-normal">Click preset to populate empty slots</span>
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PRESET_PRODUCT_IMAGES.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const next = [...(formData.images || ['', '', ''])];
                          const emptyIdx = next.findIndex(u => !(u || '').trim());
                          if (emptyIdx !== -1) {
                            next[emptyIdx] = img.url;
                          } else {
                            next[0] = img.url;
                          }
                          setFormData({ ...formData, images: next, image: next[0] || '' });
                        }}
                        className="flex items-center space-x-2 p-1.5 rounded-xl border border-gray-200 bg-white hover:border-[#6030ea]/40 hover:bg-[#6030ea]/5 text-left transition-all"
                      >
                        <img src={img.url} alt={img.name} className="w-7 h-7 rounded-lg object-cover shrink-0" />
                        <span className="text-[11px] font-medium text-gray-800 truncate">{img.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* In-Store Price & MRP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                    <span>In-Store Price (₹) <span className="text-rose-500">*</span></span>
                    <span className="text-[11px] text-gray-400 font-normal">Supermarket shelf price</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs font-bold text-[#6030ea]">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={formData.price !== undefined ? formData.price : ''}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="e.g. 45"
                      className="w-full pl-8 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6030ea]/20 focus:border-[#6030ea] font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                    <span>MRP / Original Price (₹)</span>
                    <span className="text-[11px] text-gray-400 font-normal">For discount display</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs font-bold text-gray-400">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={formData.mrp !== undefined ? formData.mrp : ''}
                      onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                      placeholder="e.g. 60"
                      className="w-full pl-8 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6030ea]/20 focus:border-[#6030ea] font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Best Offer / Carousel Feature Toggle */}
              <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-center justify-between">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                    <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Feature in "Best Offers" Carousel</h4>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      Displays this product in the top deals carousel banner on the mobile storefront home screen.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                  <input
                    type="checkbox"
                    checked={formData.isBestOffer}
                    onChange={(e) => setFormData({ ...formData, isBestOffer: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {/* Delivery Price Override */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#6030ea]" />
                    <span>Product Delivery Price (₹) (Optional Override)</span>
                  </span>
                  <span className="text-[11px] text-gray-400 font-normal">
                    Leave blank to inherit category rate
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-[#6030ea]">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.deliveryPrice !== undefined ? formData.deliveryPrice : ''}
                    onChange={(e) => setFormData({ ...formData, deliveryPrice: e.target.value })}
                    placeholder="e.g. 35 (or leave blank to inherit category rate)"
                    className="w-full pl-8 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6030ea]/20 focus:border-[#6030ea] font-medium"
                  />
                </div>
              </div>

              {/* Status Toggle */}
              <div className="pt-2 flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <div>
                  <h4 className="text-xs font-bold text-gray-800">Catalog Visibility</h4>
                  <p className="text-[11px] text-gray-500">Active products are visible to Shop Owners for store listing.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6030ea]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setPageMode('list')}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-bold text-white bg-[#6030ea] hover:bg-[#4e22c7] rounded-xl shadow-lg shadow-[#6030ea]/20 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>{pageMode === 'add' ? 'Create Product' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ==========================================
  // VIEW: MAIN PRODUCTS LIST & FILTERS
  // ==========================================
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#6030ea]"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#6030ea]">
              Master Catalog Governance
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Product Catalog Overview</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Platform-wide inventory across all 4 shops. Products are managed under their respective store.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchProducts()}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-all"
            title="Refresh Catalog"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-2 px-5 py-2.5 bg-[#6030ea] hover:bg-[#4b22c2] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#6030ea]/25 transition-all"
            title="Create a new product by selecting Category and Subcategory"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Product</span>
          </button>
        </div>
      </div>

      {/* Quick Filter Tabs: All vs Best Offers */}
      <div className="flex items-center space-x-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setBestOffersOnly(false)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            !bestOffersOnly
              ? 'bg-[#6030ea] text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          All Products ({products.length})
        </button>
        <button
          onClick={() => setBestOffersOnly(true)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            bestOffersOnly
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-white text-amber-600 hover:bg-amber-50 border border-amber-200'
          }`}
        >
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>⭐ Best Offers / Carousel Only</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product by name..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6030ea]/20 focus:border-[#6030ea]"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => {
                setSelectedCategoryFilter(e.target.value);
                setSelectedSubcategoryFilter('ALL');
              }}
              className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6030ea]/20 focus:border-[#6030ea] font-medium text-gray-700"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Filter */}
          <div>
            <select
              value={selectedSubcategoryFilter}
              onChange={(e) => setSelectedSubcategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6030ea]/20 focus:border-[#6030ea] font-medium text-gray-700"
            >
              <option value="ALL">All Subcategories</option>
              {tableFilterSubcategories.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div>
            <select
              value={selectedBrandFilter}
              onChange={(e) => setSelectedBrandFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6030ea]/20 focus:border-[#6030ea] font-medium text-gray-700"
            >
              <option value="ALL">All Brands</option>
              {brands.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter & View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6030ea]/20 focus:border-[#6030ea] font-medium text-gray-700"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>

            <div className="flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200 shrink-0">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  viewMode === 'table' ? 'bg-white text-[#6030ea] shadow-xs font-bold' : 'text-gray-500 hover:text-gray-800'
                }`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  viewMode === 'grid' ? 'bg-white text-[#6030ea] shadow-xs font-bold' : 'text-gray-500 hover:text-gray-800'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Table / Grid */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-200">
          <RefreshCw className="w-8 h-8 text-[#6030ea] animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-700">Loading master products catalog...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-200 space-y-3">
          <div className="w-14 h-14 bg-purple-50 text-[#6030ea] rounded-2xl flex items-center justify-center mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-gray-900">No Products Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Get started by adding your first product to the catalog.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-[#6030ea] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#4b22c2] transition-all inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Product</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Category & Subcategory</th>
                  <th className="py-3.5 px-4">Brand</th>
                  <th className="py-3.5 px-4">Price / MRP</th>
                  <th className="py-3.5 px-4 text-center">Best Offer Carousel</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((prod) => {
                  const catName = prod.categoryId?.name || prod.categoryName || 'Unknown Category';
                  const subcatName = prod.subcategoryId?.name || prod.subcategoryName || 'Unknown Subcategory';
                  const brandName = prod.brandId?.name || prod.brandName || null;
                  const price = prod.price || 0;
                  const mrp = prod.mrp || 0;

                  return (
                    <tr key={prod._id} className="hover:bg-purple-50/30 transition-colors">
                      {/* Product Name & Image */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-11 h-11 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center">
                            {prod.image ? (
                              <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block">{prod.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono">{prod.slug}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category & Subcategory */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-50 text-[#6030ea] font-semibold text-[10px] border border-purple-100">
                            {catName}
                          </span>
                          <span className="text-[11px] text-gray-600 block font-medium">
                            ↳ {subcatName}
                          </span>
                        </div>
                      </td>

                      {/* Brand */}
                      <td className="py-3 px-4">
                        {brandName ? (
                          <span className="inline-flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 font-semibold text-[11px]">
                            <Tag className="w-3 h-3 text-[#6030ea]" />
                            <span>{brandName}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">No Brand (Generic)</span>
                        )}
                      </td>

                      {/* Price & MRP */}
                      <td className="py-3 px-4">
                        <div>
                          <span className="font-black text-gray-900 text-xs">
                            {price > 0 ? `₹${price}` : 'In Store'}
                          </span>
                          {mrp > price && (
                            <span className="text-[10px] text-gray-400 line-through ml-1.5 font-medium">
                              ₹{mrp}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Best Offer Quick Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleBestOffer(prod)}
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all shadow-2xs ${
                            prod.isBestOffer
                              ? 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                              : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                          }`}
                          title="Click to toggle Best Offer Carousel feature"
                        >
                          <Star className={`w-3 h-3 ${prod.isBestOffer ? 'fill-amber-500 text-amber-500' : 'text-gray-400'}`} />
                          <span>{prod.isBestOffer ? 'Featured' : 'Add to Deals'}</span>
                        </button>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {prod.isActive ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-600 font-bold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-gray-400 font-bold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                            <span>Inactive</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleOpenVariantsModal(prod)}
                            className="px-2.5 py-1 rounded-lg bg-purple-50 text-[#6030ea] hover:bg-purple-100 font-bold text-[11px] transition-colors"
                            title="Manage Variants"
                          >
                            Variants
                          </button>
                          <button
                            onClick={() => handleOpenEdit(prod)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#6030ea] hover:bg-purple-50 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(prod)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Product"
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
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((prod) => {
            const catName = prod.categoryId?.name || prod.categoryName || 'Category';
            const subcatName = prod.subcategoryId?.name || prod.subcategoryName || 'Subcategory';
            const brandName = prod.brandId?.name || prod.brandName || null;
            const price = prod.price || 0;
            const mrp = prod.mrp || 0;

            return (
              <div
                key={prod._id}
                className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow group"
              >
                {/* Image Banner */}
                <div className="relative h-44 bg-gray-100 overflow-hidden">
                  {prod.image ? (
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Package className="w-12 h-12" />
                    </div>
                  )}

                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                      {catName}
                    </span>
                    {prod.isBestOffer && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center space-x-1 shadow">
                        <Star className="w-3 h-3 fill-white" />
                        <span>Best Offer</span>
                      </span>
                    )}
                  </div>

                  {brandName && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-gray-800 text-[10px] font-bold shadow">
                        {brandName}
                      </span>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[11px] text-[#6030ea] font-semibold">↳ {subcatName}</span>
                    <h3 className="text-base font-bold text-gray-900 mt-0.5">{prod.name}</h3>
                    {prod.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">{prod.description}</p>
                    )}
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="text-sm font-black text-[#6030ea]">
                        {price > 0 ? `₹${price}` : 'In Store'}
                      </span>
                      {mrp > price && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{mrp}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleToggleBestOffer(prod)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                        prod.isBestOffer
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${prod.isBestOffer ? 'fill-amber-500 text-amber-500' : ''}`} />
                      <span>{prod.isBestOffer ? 'Best Offer' : '+ Deal'}</span>
                    </button>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenVariantsModal(prod)}
                        className="px-2.5 py-1.5 rounded-xl bg-purple-50 text-[#6030ea] text-xs font-bold hover:bg-purple-100 transition-colors"
                      >
                        Variants
                      </button>
                      <button
                        onClick={() => handleOpenEdit(prod)}
                        className="p-2 rounded-xl text-gray-500 hover:text-[#6030ea] hover:bg-purple-50 transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(prod)}
                        className="p-2 rounded-xl text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==========================================
          MODAL: MANAGE PRODUCT VARIANTS (STRICT ENFORCEMENT)
          ========================================== */}
      {variantModalProduct && (
        <Modal
          isOpen={Boolean(variantModalProduct)}
          onClose={() => setVariantModalProduct(null)}
          title={`Product Variants: ${variantModalProduct.name}`}
          size="lg"
        >
          <div className="space-y-6">
            {/* Product & Subcategory Allowed Units Header */}
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-[#6030ea] uppercase tracking-wider block">
                  Category: {variantModalProduct.categoryId?.name || variantModalProduct.categoryName} ➔{' '}
                  {variantModalProduct.subcategoryId?.name || variantModalProduct.subcategoryName}
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-0.5">
                  {variantModalProduct.name}{' '}
                  {variantModalProduct.brandId?.name ? `(${variantModalProduct.brandId.name})` : ''}
                </h3>
              </div>

              {/* Allowed Units Pill Bar */}
              <div className="flex items-center space-x-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-purple-900">Allowed Units:</span>
                {activeSubcategoryAllowedUnits.length > 0 ? (
                  activeSubcategoryAllowedUnits.map((u) => (
                    <span
                      key={u._id}
                      className="px-2 py-0.5 rounded-md bg-white border border-purple-300 text-[#6030ea] font-extrabold text-xs shadow-2xs"
                    >
                      {u.symbol}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-rose-600 font-bold">No units allowed for this subcategory</span>
                )}
              </div>
            </div>

            {/* Existing Variants Table */}
            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                Current Variants ({variantsList.length})
              </h4>

              {isVariantsLoading ? (
                <div className="py-8 text-center text-gray-500 text-xs flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#6030ea]" />
                  <span>Loading variants...</span>
                </div>
              ) : variantsList.length === 0 ? (
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 text-center text-xs text-gray-500">
                  No variants added yet for this product. Use the form below to create valid quantity + unit combinations.
                </div>
              ) : (
                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-500 font-bold text-[10px] uppercase border-b border-gray-200">
                      <tr>
                        <th className="py-2.5 px-3">Variant (Quantity + Unit)</th>
                        <th className="py-2.5 px-3">SKU</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {variantsList.map((v) => (
                        <tr key={v._id} className="hover:bg-gray-50/50">
                          <td className="py-2.5 px-3 font-bold text-gray-900">
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-purple-50 text-[#6030ea] border border-purple-200 text-xs">
                              <span>{v.quantity}</span>
                              <span className="font-extrabold">{v.unitId?.symbol}</span>
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-gray-500">
                            {v.sku || '—'}
                          </td>
                          <td className="py-2.5 px-3">
                            <button
                              onClick={() => handleToggleVariantStatus(v)}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                                v.isActive
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                              }`}
                            >
                              {v.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => setDeleteVariantTarget(v)}
                              className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete Variant"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Add New Variant Form */}
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-4">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-1.5">
                <Plus className="w-3.5 h-3.5 text-[#6030ea]" />
                <span>Add New Variant</span>
              </h4>

              {variantError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{variantError}</span>
                </div>
              )}

              {variantSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{variantSuccess}</span>
                </div>
              )}

              <form onSubmit={handleAddVariant} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                {/* Unit Dropdown - STRICTLY FILTERED TO ALLOWED UNITS */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Allowed Unit <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={variantForm.unitId}
                    onChange={(e) => setVariantForm({ ...variantForm, unitId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6030ea]/20 focus:border-[#6030ea] font-medium"
                  >
                    <option value="">-- Select Unit --</option>
                    {activeSubcategoryAllowedUnits.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity Input */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Quantity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.001"
                    value={variantForm.quantity}
                    onChange={(e) => setVariantForm({ ...variantForm, quantity: e.target.value })}
                    placeholder="e.g. 500, 100, 1"
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6030ea]/20 focus:border-[#6030ea] font-medium"
                  />
                </div>

                {/* Optional SKU */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">SKU (Optional)</label>
                  <input
                    type="text"
                    value={variantForm.sku}
                    onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })}
                    placeholder="e.g. PROD-500G"
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6030ea]/20 focus:border-[#6030ea] font-medium"
                  />
                </div>

                {/* Submit button */}
                <div>
                  <button
                    type="submit"
                    disabled={isAddingVariant}
                    className="w-full py-2 bg-[#6030ea] hover:bg-[#4d22c4] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
                  >
                    {isAddingVariant ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>Add Variant</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Product Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Master Product?"
        message={`Are you sure you want to delete '${deleteTarget?.name}'? If variants exist without shop listings, they will also be removed.`}
        confirmText="Delete Product"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleDeleteProduct}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Delete Variant Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteVariantTarget)}
        title="Delete Product Variant?"
        message={`Are you sure you want to delete this variant (${deleteVariantTarget?.quantity} ${deleteVariantTarget?.unitId?.symbol})? It cannot be deleted if active in shops.`}
        confirmText="Delete Variant"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleDeleteVariant}
        onCancel={() => setDeleteVariantTarget(null)}
      />
    </div>
  );
};
