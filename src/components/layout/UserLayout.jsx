import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Search, 
  LogOut, 
  LayoutGrid, 
  Menu as MenuIcon, 
  Plus, 
  Bell, 
  ChevronDown, 
  X, 
  Mail, 
  Sparkles,
  Phone,
  ArrowRight,
  Utensils,
  Check,
  Store,
  Clock,
  Home,
  Info,
  Newspaper,
  ShieldCheck,
  Tag,
  Grid,
  Globe,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import ApiClient from '../../api/client';
import { LANGUAGES, getTranslation, setAppLanguage, getAppLanguage } from '../../locales';

export const UserLayout = ({ currentRoute = 'home', onRouteChange, onRefresh, children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [liveCatalog, setLiveCatalog] = useState([]);

  // Language state (English, Arabic, Hindi)
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(getAppLanguage);
  const langDropdownRef = useRef(null);

  useEffect(() => {
    const handleLangSync = (e) => {
      if (e.detail) setSelectedLang(e.detail);
    };
    window.addEventListener('app_language_changed', handleLangSync);
    return () => window.removeEventListener('app_language_changed', handleLangSync);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleSelectLang = (code) => {
    setSelectedLang(code);
    setAppLanguage(code);
    setIsLangOpen(false);
  };

  const currentLangObj = LANGUAGES.find((l) => l.code === selectedLang) || LANGUAGES[0];
  const navT = getTranslation(selectedLang);

  // Fetch live products for real-time catalog search
  useEffect(() => {
    ApiClient.get('/products')
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.products || []);
        setLiveCatalog(list.map((p) => ({
          id: p._id,
          name: p.name,
          category: p.categoryName || p.categoryId?.name || 'General',
          subcategory: p.subcategoryName || p.subcategoryId?.name || '',
          brand: p.brandName || p.brandId?.name || '',
          price: p.price ? `₹${p.price}` : 'In Store',
          image: p.image || ''
        })));
      })
      .catch(() => {});
  }, []);
  const filteredItems = searchQuery.trim() === ''
    ? []
    : liveCatalog.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subcategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className="min-h-screen bg-white text-[#181C2E] flex flex-col font-sans selection:bg-[#FF7622]/20">
      
      {/* =============================================================
          1. TOP UTILITY BAR (Visible on sm: and above)
          Matches authentic web storefront with brand badge & shortcuts
         ============================================================= */}
      <div className="hidden sm:block bg-[#FBFBFB] border-b border-slate-200/60 text-[11px] text-slate-500 font-semibold py-2 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Product Showcase Tag */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 text-slate-600">
              <Sparkles className="w-3.5 h-3.5 text-[#FF7622]" />
              <span>{navT.topBanner}</span>
            </div>
          </div>

          {/* Center: Admin Portal Quick Switch */}
          {(user?.role === 'ADMIN' || user?.role === 'MASTER_ADMIN' || user?.isUser === 'admin' || user?.isUser === 'master') && (
            <button
              onClick={() => onRouteChange?.(user?.role === 'ADMIN' ? 'admin/dashboard' : 'dashboard')}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#18308c]/10 text-[#18308c] hover:bg-[#18308c] hover:text-white transition-all text-[10px] font-black uppercase tracking-wider shadow-2xs"
            >
              <span>{navT.adminReturn}</span>
            </button>
          )}

          {/* Right: Language Switch */}
          <div className="relative" ref={langDropdownRef}>
            <button
              type="button"
              onClick={() => setIsLangOpen((prev) => !prev)}
              className="flex items-center space-x-1.5 cursor-pointer hover:text-slate-900 text-slate-600 font-bold text-xs select-none"
            >
              <span>{selectedLang === 'ar' ? 'العربية' : selectedLang === 'hi' ? 'हिन्दी' : 'English / العربية'}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                  {navT.selectLang}
                </div>
                {LANGUAGES.map((lang) => {
                  const isSelected = selectedLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleSelectLang(lang.code)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-orange-50 text-[#FF7622] font-black'
                          : 'text-slate-700 hover:bg-slate-50 font-semibold'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span>{lang.native}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({lang.label})</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#FF7622]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =============================================================
          2. UNIFIED RESPONSIVE WEB NAVBAR
          Renders identical responsive web storefront across all screens
         ============================================================= */}
      <header className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs px-4 md:px-8 py-3.5 ${
        (currentRoute === 'home' || currentRoute === 'dashboard') ? 'hidden md:block' : 'block'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 md:gap-8">
          
          {/* Brand Logo & Name */}
          <div 
            onClick={() => onRouteChange?.('home')} 
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white border border-slate-200/80 p-0.5 shadow-sm group-hover:scale-105 transition-transform overflow-hidden flex items-center justify-center">
              <img src="/al-salhiya-logo.jpg" alt="Al Salhiya Logo" className="w-full h-full object-contain" />
            </div>
            <div className="leading-tight text-left">
              <div className="flex items-center space-x-1 sm:space-x-1.5">
                <span className="text-lg sm:text-xl font-black text-[#18308c] tracking-tight">
                  Al Salhiya
                </span>
                <span className="text-xs sm:text-sm font-black text-[#ff7824]">الصالحية</span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-amber-600 font-bold tracking-widest block uppercase">SUPERMARKET CATALOG</span>
            </div>
          </div>

          {/* Center: Nav Links OR Search Bar */}
          {showSearchOverlay ? (
            <div className="flex-1 max-w-xl mx-2 sm:mx-8 relative animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center bg-[#F4F6F8] rounded-2xl px-3 sm:px-4 py-2 border border-[#FF7622] shadow-sm focus-within:bg-white transition-all">
                <Search className="w-4 h-4 text-[#FF7622] shrink-0 mr-2 sm:mr-3" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={navT.searchPlaceholder}
                  className="w-full text-xs font-semibold text-[#181C2E] bg-transparent placeholder:text-slate-400 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-slate-400 hover:text-slate-600 mr-2 text-xs"
                  >
                    ✕
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowSearchOverlay(false);
                    setSearchQuery('');
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                  title="Close Search"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Autocomplete Results */}
              {searchQuery.trim() !== '' && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50 max-h-80 overflow-y-auto space-y-1.5 animate-in slide-in-from-top-2 duration-150">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                    Catalog Results ({filteredItems.length})
                  </div>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setShowSearchOverlay(false);
                          setSearchQuery('');
                          onRouteChange?.(`product/${item.id}`);
                        }}
                        className="p-2.5 rounded-xl hover:bg-orange-50 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="px-2 py-0.5 rounded-md bg-orange-100 text-[#FF7622] text-[10px] font-black">
                            {item.category}
                          </span>
                          <span className="text-xs font-bold text-[#181C2E]">{item.name}</span>
                          {item.brand && (
                            <span className="text-[10px] text-slate-400 font-medium">({item.brand})</span>
                          )}
                        </div>
                        <span className="text-xs font-black text-[#FF7622]">{item.price}</span>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-xs text-slate-400">
                      No products found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 text-xs font-bold text-[#1F2229]">
              <button 
                onClick={() => onRouteChange?.('home')}
                className={`transition-colors flex items-center space-x-1 ${
                  currentRoute === 'home' || currentRoute === 'dashboard'
                    ? 'text-[#FF7622] font-black'
                    : 'hover:text-[#FF7622]'
                }`}
              >
                <span>{navT.home}</span>
              </button>

              <button 
                onClick={() => onRouteChange?.('shop')}
                className={`transition-colors flex items-center space-x-1 ${
                  currentRoute === 'shop'
                    ? 'text-[#FF7622] font-black'
                    : 'hover:text-[#FF7622]'
                }`}
              >
                <span>{navT.productCatalog}</span>
              </button>

              <button 
                onClick={() => onRouteChange?.('about')}
                className={`transition-colors flex items-center space-x-1 ${
                  currentRoute === 'about'
                    ? 'text-[#FF7622] font-black'
                    : 'hover:text-[#FF7622]'
                }`}
              >
                <span>{navT.about}</span>
              </button>

              <button 
                onClick={() => onRouteChange?.('contact')}
                className={`transition-colors flex items-center space-x-1 ${
                  currentRoute === 'contact'
                    ? 'text-[#FF7622] font-black'
                    : 'hover:text-[#FF7622]'
                }`}
              >
                <span>{navT.contact}</span>
              </button>
            </nav>
          )}

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Catalog Button */}
            <button 
              onClick={() => onRouteChange?.('shop')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 sm:space-x-2 border shadow-xs active:scale-95 ${
                currentRoute === 'shop'
                  ? 'bg-[#FF7622] text-white border-[#FF7622]'
                  : 'bg-white hover:bg-orange-50 text-slate-800 border-slate-200/90 hover:border-[#FF7622]/40'
              }`}
              title="Explore Catalog"
            >
              <Grid className={`w-4 h-4 ${currentRoute === 'shop' ? 'text-white' : 'text-[#FF7622]'}`} />
              <span className="hidden sm:inline">{navT.browseCatalog}</span>
            </button>

            {/* Search Icon */}
            {!showSearchOverlay && (
              <button 
                onClick={() => setShowSearchOverlay(true)}
                className="p-2 text-slate-600 hover:text-[#FF7622] transition-colors" 
                title="Search Products"
              >
                <Search className="w-4 h-4" />
              </button>
            )}

            {/* Contact Button */}
            <button 
              onClick={() => onRouteChange?.('contact')}
              className={`p-2 transition-colors relative ${
                currentRoute === 'contact' ? 'text-[#FF7622]' : 'text-slate-600 hover:text-[#FF7622]'
              }`}
              title="Contact Us & Store Location"
            >
              <Phone className="w-4 h-4" />
            </button>

            {/* Mobile Responsive Hamburger Menu Toggle */}
            <button
              onClick={() => setShowMobileMenu(prev => !prev)}
              className="p-2 text-slate-700 hover:text-[#FF7622] md:hidden rounded-lg hover:bg-slate-100 transition-colors"
              title="Toggle Navigation Menu"
            >
              {showMobileMenu ? (
                <X className="w-5 h-5 text-[#FF7622]" />
              ) : (
                <MenuIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Responsive Navigation Dropdown */}
        {showMobileMenu && (
          <div className="md:hidden pt-3 pb-2 border-t border-slate-100 mt-3 animate-in slide-in-from-top-2 duration-150">
            <nav className="flex flex-col space-y-1">
              {[
                { id: 'home', label: navT.home, icon: Home },
                { id: 'shop', label: navT.productCatalog, icon: Grid },
                { id: 'about', label: navT.about, icon: Info },
                { id: 'contact', label: navT.contact, icon: Phone }
              ].map((item) => {
                const Icon = item.icon;
                const isActive = currentRoute === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setShowMobileMenu(false);
                      onRouteChange?.(item.id);
                    }}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                      isActive 
                        ? 'bg-[#FF7622] text-white' 
                        : 'text-slate-700 hover:bg-orange-50 hover:text-[#FF7622]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {(user?.role === 'ADMIN' || user?.role === 'MASTER_ADMIN' || user?.isUser === 'admin' || user?.isUser === 'master') && (
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    onRouteChange?.('admin/dashboard');
                  }}
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors bg-[#18308c]/10 text-[#18308c] hover:bg-[#18308c] hover:text-white"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{navT.adminReturn}</span>
                </button>
              )}

              {/* Mobile Menu Language Selector */}
              <div className="pt-2.5 mt-2 border-t border-slate-100 flex items-center justify-between px-3 py-1">
                <span className="text-[11px] font-bold text-slate-400">Language</span>
                <div className="flex items-center space-x-1.5">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => handleSelectLang(l.code)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                        selectedLang === l.code
                          ? 'bg-[#FF7622] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {l.native}
                    </button>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* =============================================================
          3. MAIN CONTENT
          Exact same responsive web layout rendered everywhere
         ============================================================= */}
      <main className="flex-1 w-full pb-20 md:pb-0">
        {children}
      </main>

      {/* =============================================================
          4. 5-SLOT FLOATING BOTTOM NAVIGATION BAR (Mobile Only: md:hidden)
          Mockup 5-slot design with center elevated action button.
          Catalog replacement for chat/orders:
          1. Home (Store/Home)
          2. Categories (Grid)
          3. Center Elevated Action (Quick Deals / Offers)
          4. Brands (Layers/Tags)
      {/* =============================================================
          4. 4-TAB BOTTOM NAVIGATION BAR (Mobile Only: md:hidden)
          Clean 4 tabs: Home, Shop, About, Connect
         ============================================================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-2 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="max-w-md mx-auto grid grid-cols-4 items-center">
          
          {/* 1. Home */}
          <button
            onClick={() => onRouteChange?.('home')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              currentRoute === 'home' || currentRoute === 'dashboard'
                ? 'text-[#FF7622]'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold">{navT.home}</span>
          </button>

          {/* 2. Shop */}
          <button
            onClick={() => onRouteChange?.('shop')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              currentRoute === 'shop'
                ? 'text-[#FF7622]'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Store className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold">{navT.productCatalog}</span>
          </button>

          {/* 3. About */}
          <button
            onClick={() => onRouteChange?.('about')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              currentRoute === 'about'
                ? 'text-[#FF7622]'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Info className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold">{navT.about}</span>
          </button>

          {/* 4. Connect */}
          <button
            onClick={() => onRouteChange?.('contact')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              currentRoute === 'contact'
                ? 'text-[#FF7622]'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Phone className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold">{navT.contact}</span>
          </button>

        </div>
      </nav>

    </div>
  );
};
