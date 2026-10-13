import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShoppingBag,
  Users,
  Package,
  Store,
  Layers,
  Tag,
  AlertTriangle,
  History,
  Bell,
  Palette,
  ArrowRight,
  Clock,
  CheckCircle2,
  RefreshCw,
  Scale,
  Sparkles,
  FolderTree,
} from 'lucide-react';
import ApiClient from '../../../api/client';

export const AdminDashboard = ({ onNavigate }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await ApiClient.get('/admin/dashboard');
      if (response.success) {
        setData(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner */}
      <div className="theme-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-14 h-14 rounded-2xl bg-white p-1 flex items-center justify-center shadow-md border border-slate-200 overflow-hidden shrink-0">
            <img src="/al-salhiya-logo.jpg" alt="Al Salhiya" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-black text-[#0E1D4A] tracking-tight">
                Al Salhiya • Operations Control Center
              </h2>
              <span className="text-xs font-black text-[#FF7824]">الصالحية</span>
            </div>
            <p className="text-xs text-[#5E6B8C] font-medium">
              Product catalog oversight, taxonomy management, partner showcase &amp; customer inquiries.
            </p>
          </div>
        </div>

        <button
          onClick={fetchDashboard}
          disabled={isLoading}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-[#181829] hover:bg-slate-50 transition-all shadow-sm self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#18308c] ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Refreshing Feed...' : 'Refresh Feed'}</span>
        </button>
      </div>

      {/* 2. Top Catalog KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Categories */}
        <div 
          onClick={() => onNavigate && onNavigate('categories')}
          className="theme-card p-4 space-y-2 border border-slate-100 cursor-pointer hover:border-[#18308c]/40 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8a87a6]">Categories</span>
            <div className="p-2 rounded-xl bg-orange-50 text-[#FF7824]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#181829]">
            {data?.totalCategories ?? (isLoading ? '...' : 5)}
          </div>
          <span className="text-[10px] text-[#FF7824] font-bold">● Department Sections</span>
        </div>

        {/* Subcategories */}
        <div 
          onClick={() => onNavigate && onNavigate('subcategories')}
          className="theme-card p-4 space-y-2 border border-slate-100 cursor-pointer hover:border-[#18308c]/40 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8a87a6]">Subcategories</span>
            <div className="p-2 rounded-xl bg-purple-50 text-[#6030ea]">
              <FolderTree className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#181829]">
            {data?.totalSubcategories ?? (isLoading ? '...' : 14)}
          </div>
          <span className="text-[10px] text-[#6030ea] font-bold">● Nested Aisles</span>
        </div>

        {/* Brands */}
        <div 
          onClick={() => onNavigate && onNavigate('brands')}
          className="theme-card p-4 space-y-2 border border-slate-100 cursor-pointer hover:border-[#18308c]/40 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8a87a6]">Brands</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#181829]">
            {data?.totalBrands ?? (isLoading ? '...' : 6)}
          </div>
          <span className="text-[10px] text-amber-600 font-bold">● Brand Directory</span>
        </div>

        {/* Products */}
        <div 
          onClick={() => onNavigate && onNavigate('products')}
          className="theme-card p-4 space-y-2 border border-slate-100 cursor-pointer hover:border-[#18308c]/40 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8a87a6]">Products</span>
            <div className="p-2 rounded-xl bg-blue-50 text-[#18308c]">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#181829]">
            {data?.totalProducts ?? (isLoading ? '...' : 18)}
          </div>
          <span className="text-[10px] text-[#18308c] font-bold">● Active Digital Catalog</span>
        </div>
      </div>

      {/* 3. Catalog Quick Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Categories Card */}
        <div
          onClick={() => onNavigate && onNavigate('categories')}
          className="theme-card p-5 cursor-pointer hover:border-[#18308c]/40 hover:shadow-lg transition-all group space-y-3"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#FF7824]/10 text-[#FF7824] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#181829] group-hover:text-[#18308c]">
              1. Categories
            </h3>
            <p className="text-[11px] text-[#8a87a6] mt-0.5">
              Supermarket departments with image upload
            </p>
          </div>
          <div className="flex items-center text-[11px] font-bold text-[#18308c] pt-1">
            <span>Manage</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Subcategories Card */}
        <div
          onClick={() => onNavigate && onNavigate('subcategories')}
          className="theme-card p-5 cursor-pointer hover:border-[#18308c]/40 hover:shadow-lg transition-all group space-y-3"
        >
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#6030ea] flex items-center justify-center group-hover:scale-110 transition-transform">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#181829] group-hover:text-[#18308c]">
              2. Subcategories
            </h3>
            <p className="text-[11px] text-[#8a87a6] mt-0.5">
              Aisles linked to parent categories
            </p>
          </div>
          <div className="flex items-center text-[11px] font-bold text-[#18308c] pt-1">
            <span>Manage</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Brands Card */}
        <div
          onClick={() => onNavigate && onNavigate('brands')}
          className="theme-card p-5 cursor-pointer hover:border-[#18308c]/40 hover:shadow-lg transition-all group space-y-3"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#181829] group-hover:text-[#18308c]">
              3. Brands
            </h3>
            <p className="text-[11px] text-[#8a87a6] mt-0.5">
              Brand logos &amp; manufacturer directory
            </p>
          </div>
          <div className="flex items-center text-[11px] font-bold text-[#18308c] pt-1">
            <span>Manage</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Products Card */}
        <div
          onClick={() => onNavigate && onNavigate('products')}
          className="theme-card p-5 cursor-pointer hover:border-[#18308c]/40 hover:shadow-lg transition-all group space-y-3"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#18308c] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#181829] group-hover:text-[#18308c]">
              4. Products
            </h3>
            <p className="text-[11px] text-[#8a87a6] mt-0.5">
              Category, subcategory &amp; pricing
            </p>
          </div>
          <div className="flex items-center text-[11px] font-bold text-[#18308c] pt-1">
            <span>Manage</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Offer Banners Card */}
        <div
          onClick={() => onNavigate && onNavigate('offers')}
          className="theme-card p-5 cursor-pointer hover:border-[#FF7824]/60 hover:shadow-lg transition-all group space-y-3 border-orange-100 bg-orange-50/20"
        >
          <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#FF7824] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#181829] group-hover:text-[#FF7824]">
              5. Offer Banners
            </h3>
            <p className="text-[11px] text-[#8a87a6] mt-0.5">
              Mobile carousel deals with offer prices
            </p>
          </div>
          <div className="flex items-center text-[11px] font-bold text-[#FF7824] pt-1">
            <span>Manage Offers</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* 4. Digital Catalog Governance Banner */}
      <div className="theme-card p-6 bg-gradient-to-r from-[#18308c] to-[#2546b8] text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider mb-2 inline-block">
            Al Salhiya Supermarket System
          </span>
          <h3 className="text-xl font-black">Digital Supermarket In-Store Catalog</h3>
          <p className="text-white/80 text-xs mt-1 max-w-xl">
            Manage your physical supermarket's online catalog. Create categories with department images, add subcategories, and upload products with high-resolution photos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate && onNavigate('categories')}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/20"
          >
            + Add Category
          </button>
          <button
            onClick={() => onNavigate && onNavigate('products')}
            className="px-5 py-2.5 rounded-xl bg-[#FF7824] hover:bg-[#e06516] text-white font-black text-xs transition-all shadow-lg shadow-[#FF7824]/30"
          >
            + Add Product
          </button>
        </div>
      </div>
    </div>
  );
};
