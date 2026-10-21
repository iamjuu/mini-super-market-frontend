import React from 'react';
import {
  LayoutDashboard,
  Store,
  Layers,
  Tag,
  Users,
  Palette,
  Shield,
  Clock,
  MoreVertical,
  Scale,
  Package,
  FolderTree,
  Sparkles,
} from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';

export const AdminSidebar = ({ currentRoute, onRouteChange }) => {
  const { appearance } = usePlatform();

  const isActive = (route) => {
    let cleanRoute = currentRoute || 'dashboard';
    if (cleanRoute.startsWith('admin/')) {
      cleanRoute = cleanRoute.substring('admin/'.length);
    } else if (cleanRoute === 'admin') {
      cleanRoute = 'dashboard';
    }
    if (route === 'orders') return cleanRoute.startsWith('orders');
    return cleanRoute === route;
  };

  return (
    <aside className="w-64 my-4 ml-4 flex flex-col h-[calc(100vh-2rem)] select-none shrink-0 z-30">
      {/* Floating Pill Container with Purple Gradient Header */}
      <div className="theme-sidebar flex-1 flex flex-col p-4 text-white overflow-hidden shadow-2xl relative">
        {/* Brand Header */}
        <div className="py-3 px-2 flex flex-col items-center justify-center text-center border-b border-white/10 mb-3">
          <div className="w-14 h-14 rounded-2xl bg-white p-1 flex items-center justify-center mb-2 shadow-lg border border-white/30 overflow-hidden">
            <img src="/al-salhiya-logo.jpg" alt="Al Salhiya" className="w-full h-full object-contain" />
          </div>
          <h1 className="font-extrabold text-xs tracking-wider text-white uppercase">
            {appearance?.platformName || 'Al Salhiya'}
          </h1>
          <span className="text-[10px] text-amber-300 font-bold tracking-wider">الصالحية • Admin Console</span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto pr-1 space-y-1 text-xs">
          {/* Dashboard */}
          <button
            onClick={() => onRouteChange('dashboard')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium transition-all ${
              isActive('dashboard')
                ? 'bg-white text-[#18308c] font-bold shadow-lg shadow-black/10'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Dashboard</span>
          </button>

          {/* Categories */}
          <button
            onClick={() => onRouteChange('categories')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium transition-all ${
              isActive('categories')
                ? 'bg-white text-[#18308c] font-bold shadow-lg shadow-black/10'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span>Categories</span>
          </button>

          {/* Subcategories */}
          <button
            onClick={() => onRouteChange('subcategories')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium transition-all ${
              isActive('subcategories')
                ? 'bg-white text-[#18308c] font-bold shadow-lg shadow-black/10'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <FolderTree className="w-4 h-4 shrink-0" />
            <span>Subcategories</span>
          </button>

          {/* Units / Allowed Units */}
          <button
            onClick={() => onRouteChange('units')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium transition-all ${
              isActive('units')
                ? 'bg-white text-[#18308c] font-bold shadow-lg shadow-black/10'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Scale className="w-4 h-4 shrink-0" />
            <span>Allowed Units</span>
          </button>

          {/* Brands */}
          <button
            onClick={() => onRouteChange('brands')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium transition-all ${
              isActive('brands')
                ? 'bg-white text-[#18308c] font-bold shadow-lg shadow-black/10'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Tag className="w-4 h-4 shrink-0" />
            <span>Brands</span>
          </button>

          {/* Products & Catalog */}
          <button
            onClick={() => onRouteChange('products')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium transition-all ${
              isActive('products')
                ? 'bg-white text-[#18308c] font-bold shadow-lg shadow-black/10'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Package className="w-4 h-4 shrink-0" />
            <span>Products</span>
          </button>

          {/* Offers & Carousel Deals */}
          <button
            onClick={() => onRouteChange('offers')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium transition-all ${
              isActive('offers')
                ? 'bg-white text-[#18308c] font-bold shadow-lg shadow-black/10'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0 text-amber-300" />
            <span>Offer Banners</span>
          </button>


          {/* Customers */}
          <button
            onClick={() => onRouteChange('customers')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium transition-all ${
              isActive('customers')
                ? 'bg-white text-[#18308c] font-bold shadow-lg shadow-black/10'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>Customers</span>
          </button>


          {/* Appearance */}
          <button
            onClick={() => onRouteChange('appearance')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium transition-all ${
              isActive('appearance')
                ? 'bg-white text-[#18308c] font-bold shadow-lg shadow-black/10'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Palette className="w-4 h-4 shrink-0" />
            <span>Appearance</span>
          </button>


       

        </nav>

        {/* Operational Oversight Card */}
        <div className="mt-3 theme-sidebar-card p-3.5 text-white">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-xs">Live Ops Stream</span>
            </div>
            <MoreVertical className="w-3.5 h-3.5 text-white/60 cursor-pointer" />
          </div>
          <p className="text-[10px] text-white/80 leading-tight">
            Active session with operations privileges. Order overrides & dispute resolution enabled.
          </p>
        </div>
      </div>
    </aside>
  );
};
