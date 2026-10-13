import React, { useState } from 'react';
import {
  ShoppingBag,
  Home,
  ArrowLeft,
  Search,
  Store,
  Tag,
  PhoneCall,
  Sparkles,
  Compass,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export const NotFoundPage = ({ onNavigate, attemptedPath = '' }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && onNavigate) {
      onNavigate('shop');
    }
  };

  const isAdminPath =
    attemptedPath.includes('admin') ||
    (typeof window !== 'undefined' && window.location.pathname.includes('admin'));

  const popularAisles = [
    {
      label: 'Explore Catalog',
      arabic: 'تصفح المتجر',
      icon: Store,
      route: 'shop',
      color: 'from-blue-600 to-indigo-700',
    },
    {
      label: "Today's Flash Deals",
      arabic: 'عروض اليوم',
      icon: Tag,
      route: 'home',
      color: 'from-amber-500 to-orange-600',
    },
    {
      label: 'Customer Support',
      arabic: 'خدمة العملاء',
      icon: PhoneCall,
      route: 'contact',
      color: 'from-emerald-500 to-teal-700',
    },
  ];

  return (
    <div
      id="error-404-container"
      className="min-h-screen bg-gradient-to-b from-[#f4f7fc] via-[#eef2f9] to-[#e6ecf8] text-[#0e1d4a] flex flex-col justify-between selection:bg-orange-500 selection:text-white"
    >
      {/* Top ambient banner */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <button
          onClick={() => (onNavigate ? onNavigate('home') : (window.location.href = '/'))}
          className="flex items-center space-x-3 group text-left focus:outline-none"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#18308c] to-[#254bdb] flex items-center justify-center shadow-lg shadow-indigo-900/15 group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="block text-xl font-extrabold tracking-tight text-[#0e1d4a]">
              Al Salhiya <span className="text-[#ff7824]">Supermarket</span>
            </span>
            <span className="block text-xs font-semibold text-[#5e6b8c] tracking-wider uppercase">
              الصالحية ماركت • Fresh Daily
            </span>
          </div>
        </button>

        <button
          id="btn-404-go-home-header"
          onClick={() => (onNavigate ? onNavigate('home') : (window.location.href = '/'))}
          className="hidden sm:inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#18308c] hover:text-[#ff7824] transition-colors py-2 px-4 rounded-xl hover:bg-white/60 border border-transparent hover:border-slate-200"
        >
          <Home className="w-4 h-4" />
          <span>Home Storefront</span>
        </button>
      </header>

      {/* Main hero card */}
      <main className="w-full max-w-4xl mx-auto px-6 py-8 flex flex-col items-center text-center">
        {/* Animated 404 floating orb */}
        <div className="relative mb-6">
          <div className="absolute -inset-4 bg-gradient-to-r from-orange-400/20 via-blue-500/20 to-purple-500/20 rounded-full blur-2xl animate-pulse"></div>

          <div className="relative flex items-center justify-center">
            {/* Big 404 Numbers with Gradient */}
            <div className="flex items-center font-black tracking-tighter select-none">
              <span className="text-8xl sm:text-9xl font-black bg-gradient-to-br from-[#18308c] via-[#2a45af] to-[#122470] bg-clip-text text-transparent drop-shadow-sm">
                4
              </span>
              <div className="relative mx-1 sm:mx-3 w-20 h-20 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-[#ff7824] via-[#ff9047] to-[#ffba18] flex items-center justify-center shadow-2xl shadow-orange-500/30 rotate-6 hover:rotate-12 transition-transform duration-300">
                <Compass className="w-10 h-10 sm:w-14 sm:h-14 text-white animate-[spin_12s_linear_infinite]" />
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white text-[#ff7824] flex items-center justify-center font-black text-xs shadow-md">
                  ?
                </div>
              </div>
              <span className="text-8xl sm:text-9xl font-black bg-gradient-to-br from-[#18308c] via-[#2a45af] to-[#122470] bg-clip-text text-transparent drop-shadow-sm">
                4
              </span>
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-orange-100/80 border border-orange-200/80 text-orange-800 text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#ff7824]" />
          <span>Aisle Not Found • الصفحة غير موجودة</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0e1d4a] tracking-tight mb-3">
          We couldn’t find the aisle you were looking for
        </h1>

        <p className="text-base sm:text-lg text-[#5e6b8c] max-w-xl mx-auto mb-8 font-medium">
          The shelf or page may have been moved, renamed, or temporarily taken out of stock in our digital market.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="w-full max-w-md relative mb-8">
          <input
            id="input-404-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search groceries, brands, vegetables, spices..."
            className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white border border-slate-200 shadow-lg shadow-indigo-950/5 text-sm text-[#0e1d4a] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7824] focus:border-transparent transition-all"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <button
            id="btn-404-search-submit"
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-[#18308c] to-[#2443bb] text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity shadow-sm"
          >
            Find
          </button>
        </form>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <button
            id="btn-404-back"
            onClick={() => window.history.back()}
            className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-white text-slate-700 font-bold text-sm border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Go Back</span>
          </button>

          <button
            id="btn-404-home"
            onClick={() => (onNavigate ? onNavigate('home') : (window.location.href = '/'))}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#ff7824] to-[#ff9047] text-white font-bold text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Take Me Home (الرئيسية)</span>
          </button>

          {isAdminPath ? (
            <button
              id="btn-404-admin-login"
              onClick={() => (onNavigate ? onNavigate('admin/dashboard/login-admin') : (window.location.href = '/admin/dashboard/login-admin'))}
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-[#18308c] text-white font-bold text-sm shadow-md hover:bg-[#122470] hover:-translate-y-0.5 transition-all"
            >
              <ShieldAlert className="w-4 h-4 text-amber-300" />
              <span>Admin Portal Login</span>
            </button>
          ) : (
            <button
              id="btn-404-catalog"
              onClick={() => (onNavigate ? onNavigate('shop') : (window.location.href = '/shop'))}
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-white text-[#18308c] font-bold text-sm border border-indigo-100 shadow-sm hover:bg-indigo-50/50 transition-all hover:-translate-y-0.5"
            >
              <Store className="w-4 h-4 text-[#ff7824]" />
              <span>Browse Catalog</span>
            </button>
          )}
        </div>

        {/* Popular Aisles Grid */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Popular Aisles To Explore
            </span>
            <span className="text-xs font-semibold text-slate-400">الأقسام الأكثر طلباً</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {popularAisles.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <button
                  key={idx}
                  id={`btn-404-aisle-${idx}`}
                  onClick={() => (onNavigate ? onNavigate(item.route) : (window.location.href = `/${item.route}`))}
                  className="group flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all text-left hover:-translate-y-0.5"
                >
                  <div className="flex items-center space-x-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-[#0e1d4a] group-hover:text-[#18308c] transition-colors">
                        {item.label}
                      </span>
                      <span className="block text-xs font-medium text-slate-400">
                        {item.arabic}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#ff7824] group-hover:translate-x-1 transition-all" />
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <p>© 2026 Al Salhiya Supermarket. All rights reserved.</p>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => (onNavigate ? onNavigate('contact') : null)}
            className="hover:text-[#18308c] transition-colors"
          >
            Helpdesk
          </button>
          <span>•</span>
          <button
            onClick={() => (onNavigate ? onNavigate('about') : null)}
            className="hover:text-[#18308c] transition-colors"
          >
            About Us
          </button>
          <span>•</span>
          <button
            onClick={() => (onNavigate ? onNavigate('shop') : null)}
            className="hover:text-[#18308c] transition-colors"
          >
            Catalog
          </button>
        </div>
      </footer>
    </div>
  );
};

export default NotFoundPage;
