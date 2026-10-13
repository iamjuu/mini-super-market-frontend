import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  MapPin,
  Star,
  Clock,
  ShieldCheck,
  Grid,
  Sparkles,
  Tag,
  Layers,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Globe,
  CheckCircle2,
  ArrowRight,
  User as UserIcon,
  LogIn,
  Store,
  SlidersHorizontal,
  RefreshCw,
  X,
  Package,
  Check,
  Apple,
  Milk,
  ShoppingBag,
  Coffee,
  Utensils,
  Cookie,
  Beef,
  Fish,
  Salad
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import ApiClient from '../../../../api/client';
import { cn } from '../../../../lib/utils';

// Fallback category images by keyword
const getCategoryFallbackImage = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('fruit')) return 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&auto=format&fit=crop&q=80';
  if (n.includes('veg')) return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80';
  if (n.includes('chicken') || n.includes('poultry')) return 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500&auto=format&fit=crop&q=80';
  if (n.includes('fish') || n.includes('seafood')) return 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=500&auto=format&fit=crop&q=80';
  if (n.includes('meat') || n.includes('beef') || n.includes('mutton')) return 'https://images.unsplash.com/photo-1551028150-64b9f398f678?w=500&auto=format&fit=crop&q=80';
  if (n.includes('dairy') || n.includes('milk') || n.includes('bakery')) return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80';
  if (n.includes('beverag') || n.includes('juice') || n.includes('drink')) return 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80';
  return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80';
};

// Fallback product images
const getProductFallbackImage = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('orange')) return 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=500&auto=format&fit=crop&q=80';
  if (n.includes('chicken')) return 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=500&auto=format&fit=crop&q=80';
  if (n.includes('fish') || n.includes('sardine')) return 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=500&auto=format&fit=crop&q=80';
  if (n.includes('juice')) return 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&auto=format&fit=crop&q=80';
  if (n.includes('turmeric') || n.includes('spice')) return 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=80';
  if (n.includes('oil')) return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80';
  return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80';
};

// Distinct pastel color themes for Circular Category Pills (matching reference screenshot)
const CIRCULAR_CATEGORY_THEMES = [
  {
    bg: 'bg-orange-50',
    border: 'border-orange-200/70',
    text: 'text-[#FF7622]',
  },
  {
    bg: 'bg-amber-50',
    border: 'border-amber-200/70',
    text: 'text-amber-600',
  },
  {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200/70',
    text: 'text-emerald-600',
  },
  {
    bg: 'bg-purple-50',
    border: 'border-purple-200/70',
    text: 'text-purple-600',
  },
  {
    bg: 'bg-sky-50',
    border: 'border-sky-200/70',
    text: 'text-sky-600',
  },
  {
    bg: 'bg-rose-50',
    border: 'border-rose-200/70',
    text: 'text-rose-600',
  },
  {
    bg: 'bg-teal-50',
    border: 'border-teal-200/70',
    text: 'text-teal-600',
  },
  {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200/70',
    text: 'text-indigo-600',
  }
];

// Helper to choose the best vector icon for each category name
const getCategoryIconComponent = (name = '') => {
  const n = (name || '').toLowerCase();
  if (n.includes('fruit') || n.includes('veg') || n.includes('produce')) return Apple;
  if (n.includes('dairy') || n.includes('milk') || n.includes('egg') || n.includes('cheese')) return Milk;
  if (n.includes('grocer') || n.includes('kitchen') || n.includes('oil') || n.includes('spice') || n.includes('daily')) return ShoppingBag;
  if (n.includes('snack') || n.includes('beverag') || n.includes('drink') || n.includes('juice') || n.includes('tea') || n.includes('coffee')) return Coffee;
  if (n.includes('restaurant') || n.includes('hot food') || n.includes('cooked') || n.includes('ready')) return Utensils;
  if (n.includes('baker') || n.includes('dessert') || n.includes('sweet') || n.includes('cake') || n.includes('bread')) return Cookie;
  if (n.includes('meat') || n.includes('poultry') || n.includes('chicken') || n.includes('beef') || n.includes('mutton')) return Beef;
  if (n.includes('fish') || n.includes('seafood')) return Fish;
  if (n.includes('fresh') || n.includes('salad')) return Salad;
  return Package;
};

// Distinct color themes for Deals banner slides
const DEAL_GRADIENTS = [
  'from-[#FF6B4A] via-[#FF5C38] to-[#FF4522]',
  'from-[#FF7824] via-[#F86B1D] to-[#E55A0F]',
  'from-[#0E9F6E] via-[#059669] to-[#047857]',
  'from-[#18308C] via-[#1E40AF] to-[#2563EB]',
  'from-[#8B5CF6] via-[#7C3AED] to-[#6D28D9]',
];

const DEAL_ACCENTS = [
  'text-[#FF5C38]',
  'text-[#FF7824]',
  'text-[#0E9F6E]',
  'text-[#18308C]',
  'text-[#7C3AED]',
];

import { LANGUAGES, getTranslation, setAppLanguage, getAppLanguage } from '../../../../locales';

export const MobileStorefront = ({ onNavigate }) => {
  const { user, isAuthenticated } = useAuth();

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Language switcher state (English, Arabic, Hindi)
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
  const t = getTranslation(selectedLang);

  // Filter selections
  const [selectedCategoryId, setSelectedCategoryId] = useState('ALL');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('ALL');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTabFilter, setActiveTabFilter] = useState('ALL'); // 'ALL' | 'BEST_OFFERS'
  const [animatingCatId, setAnimatingCatId] = useState(null);

  // Carousel state
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselTimerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef(0);
  const touchCurrentXRef = useRef(0);
  const [touchOffset, setTouchOffset] = useState(0);
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);

  // Circular Category Auto-Scroll into view when switching categories
  const circularCategoryScrollRef = useRef(null);
  useEffect(() => {
    if (circularCategoryScrollRef.current && selectedCategoryId) {
      const activeEl = circularCategoryScrollRef.current.querySelector(
        `[data-category-id="${selectedCategoryId}"]`
      );
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [selectedCategoryId]);

  // Fetch catalog collections
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.allSettled([
      ApiClient.get('/categories'),
      ApiClient.get('/subcategories'),
      ApiClient.get('/brands'),
      ApiClient.get('/products'),
      ApiClient.get('/offers')
    ]).then(([catRes, subRes, brandRes, prodRes, offerRes]) => {
      if (!isMounted) return;

      if (catRes.status === 'fulfilled') {
        const catList = Array.isArray(catRes.value?.data) ? catRes.value.data : (catRes.value?.data?.data || catRes.value || []);
        setCategories(Array.isArray(catList) ? catList : []);
      }
      if (subRes.status === 'fulfilled') {
        const subList = Array.isArray(subRes.value?.data) ? subRes.value.data : (subRes.value?.data?.data || subRes.value || []);
        setSubcategories(Array.isArray(subList) ? subList : []);
      }
      if (brandRes.status === 'fulfilled') {
        const brandList = Array.isArray(brandRes.value?.data) ? brandRes.value.data : (brandRes.value?.data?.data || brandRes.value || []);
        setBrands(Array.isArray(brandList) ? brandList : []);
      }
      if (prodRes.status === 'fulfilled') {
        const prodList = Array.isArray(prodRes.value?.data) ? prodRes.value.data : (prodRes.value?.data?.data || prodRes.value || []);
        setProducts(Array.isArray(prodList) ? prodList : []);
      }
      if (offerRes.status === 'fulfilled') {
        const offerList = Array.isArray(offerRes.value?.data) ? offerRes.value.data : (offerRes.value?.data?.offers || []);
        if (Array.isArray(offerList) && offerList.length > 0) {
          setDashboardOffers(offerList);
          try {
            localStorage.setItem('app_offers', JSON.stringify(offerList));
          } catch (_) {}
        }
      }

      setIsLoading(false);
    }).catch(() => {
      if (isMounted) setIsLoading(false);
    });

    return () => { isMounted = false; };
  }, []);

  // Dynamic Dashboard Offers sync (Storefront Carousel)
  const [dashboardOffers, setDashboardOffers] = useState(() => {
    try {
      const stored = localStorage.getItem('app_offers');
      if (stored) return JSON.parse(stored);
    } catch (_) {}
    return [];
  });

  useEffect(() => {
    const loadOffers = () => {
      try {
        const stored = localStorage.getItem('app_offers');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setDashboardOffers(parsed);
          }
        }
      } catch (_) {}
    };

    loadOffers();
    window.addEventListener('app_offers_updated', loadOffers);
    window.addEventListener('storage', loadOffers);
    return () => {
      window.removeEventListener('app_offers_updated', loadOffers);
      window.removeEventListener('storage', loadOffers);
    };
  }, []);

  // Best offer items for Carousel (reads dashboard offers dynamically, fallbacks to product deals)
  const bestOfferProducts = useMemo(() => {
    const activeDashboardOffers = (dashboardOffers || []).filter((o) => o.isActive !== false);
    if (activeDashboardOffers.length > 0) {
      return activeDashboardOffers.map((o) => ({
        _id: o._id,
        name: o.title,
        title: o.title,
        description: o.description,
        categoryName: o.description || 'Special Deal',
        price: o.offerPrice,
        offerPrice: o.offerPrice,
        mrp: o.actualPrice,
        actualPrice: o.actualPrice,
        image: o.image,
        tagBadge: o.tagBadge || '⭐ Deal of the Day',
        isBestOffer: true,
      }));
    }

    const flagged = products.filter(p => p.isBestOffer);
    if (flagged.length > 0) return flagged;
    return products.slice(0, 3);
  }, [dashboardOffers, products]);

  // Carousel auto-play (smoothly transitions deals every 4s, pauses on touch/drag/hover)
  useEffect(() => {
    if (bestOfferProducts.length <= 1 || isPaused) return;
    carouselTimerRef.current = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % bestOfferProducts.length);
    }, 4000);

    return () => {
      if (carouselTimerRef.current) clearInterval(carouselTimerRef.current);
    };
  }, [bestOfferProducts.length, isPaused]);

  // Touch and drag swipe handlers for horizontal carousel floating
  const handleTouchStart = (e) => {
    setIsPaused(true);
    const clientX = e.touches[0].clientX;
    touchStartXRef.current = clientX;
    touchCurrentXRef.current = clientX;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current) return;
    touchCurrentXRef.current = e.touches[0].clientX;
    const diff = touchCurrentXRef.current - touchStartXRef.current;
    if (Math.abs(diff) > 6) {
      hasDraggedRef.current = true;
    }
    setTouchOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current) return;
    const diff = touchCurrentXRef.current - touchStartXRef.current;
    const threshold = 45;

    if (diff > threshold) {
      // Swiped right -> slide to previous deal
      setActiveSlide(prev => (prev === 0 ? bestOfferProducts.length - 1 : prev - 1));
    } else if (diff < -threshold) {
      // Swiped left -> slide to next deal
      setActiveSlide(prev => (prev + 1) % bestOfferProducts.length);
    }

    setTouchOffset(0);
    isDraggingRef.current = false;
    setTimeout(() => {
      hasDraggedRef.current = false;
      setIsPaused(false);
    }, 2000);
  };

  const handleMouseDown = (e) => {
    setIsPaused(true);
    touchStartXRef.current = e.clientX;
    touchCurrentXRef.current = e.clientX;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    touchCurrentXRef.current = e.clientX;
    const diff = touchCurrentXRef.current - touchStartXRef.current;
    if (Math.abs(diff) > 6) {
      hasDraggedRef.current = true;
    }
    setTouchOffset(diff);
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    const diff = touchCurrentXRef.current - touchStartXRef.current;
    const threshold = 45;

    if (diff > threshold) {
      setActiveSlide(prev => (prev === 0 ? bestOfferProducts.length - 1 : prev - 1));
    } else if (diff < -threshold) {
      setActiveSlide(prev => (prev + 1) % bestOfferProducts.length);
    }

    setTouchOffset(0);
    isDraggingRef.current = false;
    setTimeout(() => {
      hasDraggedRef.current = false;
      setIsPaused(false);
    }, 2000);
  };

  // Subcategories belonging to active category
  const activeSubcategories = useMemo(() => {
    if (selectedCategoryId === 'ALL') return subcategories;
    return subcategories.filter(s => {
      const cId = typeof s.categoryId === 'object' ? s.categoryId?._id : s.categoryId;
      return cId === selectedCategoryId;
    });
  }, [subcategories, selectedCategoryId]);

  // Filtered products list (shows index 0 / 1st product of each category when ALL is active)
  const filteredProducts = useMemo(() => {
    // If 'ALL' is selected and no active search or tab filter:
    // Show index 0 (1st product) of EVERY category
    if (selectedCategoryId === 'ALL' && selectedSubcategoryId === 'ALL' && selectedBrand === 'ALL' && !searchQuery.trim() && activeTabFilter === 'ALL') {
      const firstProductPerCategory = [];
      const seenCategoryIds = new Set();

      if (categories.length > 0) {
        categories.forEach((cat) => {
          const firstProd = products.find((p) => {
            const pCatId = typeof p.categoryId === 'object' ? p.categoryId?._id : p.categoryId;
            const pCatName = (p.categoryName || (typeof p.categoryId === 'object' ? p.categoryId?.name : '') || '').toLowerCase();
            return pCatId === cat._id || (pCatName && pCatName === (cat.name || '').toLowerCase());
          });
          if (firstProd && !seenCategoryIds.has(firstProd._id)) {
            firstProductPerCategory.push(firstProd);
            seenCategoryIds.add(firstProd._id);
          }
        });
      }

      if (firstProductPerCategory.length > 0) {
        return firstProductPerCategory;
      }

      // Fallback: group by category and take index 0
      products.forEach((p) => {
        const cKey = (typeof p.categoryId === 'object' ? p.categoryId?._id : p.categoryId) || p.categoryName || 'general';
        if (!seenCategoryIds.has(cKey)) {
          seenCategoryIds.add(cKey);
          firstProductPerCategory.push(p);
        }
      });
      return firstProductPerCategory;
    }

    // Normal filtering when a specific category or search is active
    return products.filter(p => {
      // 1. Tab filter (Best Offers)
      if (activeTabFilter === 'BEST_OFFERS' && !p.isBestOffer) return false;

      // 2. Category
      if (selectedCategoryId !== 'ALL') {
        const pCatId = typeof p.categoryId === 'object' ? p.categoryId?._id : p.categoryId;
        const pCatName = (p.categoryName || (typeof p.categoryId === 'object' ? p.categoryId?.name : '') || '').toLowerCase();
        const targetCat = categories.find(c => c._id === selectedCategoryId);
        const targetCatName = (targetCat?.name || '').toLowerCase();

        const matchId = pCatId === selectedCategoryId;
        const matchName = targetCatName && pCatName === targetCatName;
        if (!matchId && !matchName) return false;
      }

      // 3. Subcategory
      if (selectedSubcategoryId !== 'ALL') {
        const pSubId = typeof p.subcategoryId === 'object' ? p.subcategoryId?._id : p.subcategoryId;
        const targetSub = subcategories.find(s => s._id === selectedSubcategoryId);
        const targetSubName = (targetSub?.name || '').toLowerCase();
        const pSubName = (p.subcategoryName || '').toLowerCase();
        const matchId = pSubId === selectedSubcategoryId;
        const matchName = targetSubName && pSubName === targetSubName;
        if (!matchId && !matchName) return false;
      }

      // 4. Brand
      if (selectedBrand !== 'ALL') {
        const pBrandName = p.brandName || (typeof p.brandId === 'object' ? p.brandId?.name : '');
        if (pBrandName.toLowerCase() !== selectedBrand.toLowerCase()) return false;
      }

      // 5. Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = p.name?.toLowerCase().includes(q);
        const catMatch = (p.categoryName || '').toLowerCase().includes(q);
        const subMatch = (p.subcategoryName || '').toLowerCase().includes(q);
        const brandMatch = (p.brandName || '').toLowerCase().includes(q);
        if (!nameMatch && !catMatch && !subMatch && !brandMatch) return false;
      }

      return true;
    });
  }, [products, categories, selectedCategoryId, selectedSubcategoryId, selectedBrand, searchQuery, activeTabFilter]);

  // Show 8 items initially and load 8 more on "Show More"
  const ITEMS_PER_PAGE = 8;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Reset to 8 when filters change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [selectedCategoryId, selectedSubcategoryId, selectedBrand, searchQuery, activeTabFilter]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const hasMore = visibleCount < filteredProducts.length;

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  // Handle Category Click: selects category instantly, triggers bounce animation, and smoothly scrolls category bar to stand at top
  const handleSelectCategory = (catId) => {
    const nextCatId = selectedCategoryId === catId ? 'ALL' : catId;
    setSelectedCategoryId(nextCatId);
    setSelectedSubcategoryId('ALL');
    setAnimatingCatId(catId);
    setTimeout(() => {
      setAnimatingCatId(null);
    }, 400);

    setTimeout(() => {
      const anchor = document.getElementById('category-sticky-anchor');
      if (anchor) {
        const anchorRect = anchor.getBoundingClientRect();
        if (Math.abs(anchorRect.top) > 4) {
          const targetY = window.pageYOffset + anchorRect.top;
          window.scrollTo({
            top: Math.max(0, targetY),
            behavior: 'smooth'
          });
        }
      }
    }, 40);
  };

  return (
    <div className="w-full bg-[#F8F9FA] text-[#181C2E] min-h-screen pb-28">

      {/* =============================================================
          1. TOP MOBILE HEADER (Coral Gradient + Auth Switch + Capsule Search)
         ============================================================= */}
      <section className="bg-gradient-to-b from-[#FF5C38] via-[#FF6D40] to-[#FF7E47] px-4 pt-4 pb-6 rounded-b-[2rem] shadow-md text-white">
        
        {/* Top Bar: Supermarket Brand Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-11 h-11 rounded-2xl bg-white p-1 border border-white/40 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
              <img 
                src="/al-salhiya-logo.jpg" 
                alt="Al Salhiya Logo" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div className="leading-tight">
              <div className="flex items-center space-x-1.5">
                <span className="text-base font-black text-white tracking-tight">Al Salhiya</span>
                <span className="text-xs font-bold text-amber-200">الصالحية</span>
              </div>
              <span className="text-[10px] text-white/80 font-bold uppercase tracking-wider block">
                SUPERMARKET CATALOG
              </span>
            </div>
          </div>

          {/* Right Action: Language Switch Dropdown (Identical Pill Design + English, Arabic, Hindi) */}
          <div className="relative" ref={langDropdownRef}>
            <button
              type="button"
              onClick={() => setIsLangOpen((prev) => !prev)}
              aria-expanded={isLangOpen}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold hover:bg-white/25 active:scale-95 transition-all shadow-xs cursor-pointer select-none"
            >
              <Globe className="w-3.5 h-3.5 text-amber-200 shrink-0" />
              <span>{currentLangObj.native}</span>
              <ChevronDown className={cn("w-3 h-3 text-white/80 transition-transform duration-200", isLangOpen && "rotate-180")} />
            </button>

            {isLangOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                  {t.selectLanguage}
                </div>
                {LANGUAGES.map((lang) => {
                  const isSelected = selectedLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleSelectLang(lang.code)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer",
                        isSelected
                          ? "bg-orange-50 text-[#FF7622] font-black"
                          : "text-slate-700 hover:bg-slate-50 font-semibold"
                      )}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-xs">{lang.native}</span>
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

        {/* Capsule Search Bar */}
        <div className="relative mt-2">
          <div className="flex items-center bg-white rounded-full px-4 py-2.5 shadow-sm text-slate-800">
            <Search className="w-4 h-4 text-[#FF7622] shrink-0 mr-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full text-xs font-semibold bg-transparent placeholder:text-slate-400 focus:outline-none"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-700 text-xs px-1"
              >
                ✕
              </button>
            ) : (
              <div className="w-6 h-6 rounded-full bg-[#FF7622]/10 flex items-center justify-center text-[#FF7622] shrink-0">
                <SlidersHorizontal className="w-3 h-3" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =============================================================
          2. STORE STATUS STRIP (Open Hours & 100% In-Store Fresh)
         ============================================================= */}
      <section className="px-4 mt-3">
        <div className="bg-white rounded-2xl p-2.5 border border-slate-200/80 shadow-2xs grid grid-cols-2 divide-x divide-slate-100 text-[11px] font-bold text-slate-600">
          <div className="flex items-center space-x-2 pl-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">{t.storeHours}</span>
              <span className="text-slate-800 font-black">{t.openHours}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 pl-3">
            <div className="w-6 h-6 rounded-lg bg-orange-50 text-[#FF7622] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">{t.verifiedFresh}</span>
              <span className="text-slate-800 font-black">{t.freshLabel}</span>
            </div>
          </div>
        </div>
      </section>

      {/* =============================================================
          3. BEST OFFERS CAROUSEL (Top Deals Carousel with Indicators)
         ============================================================= */}
      <section className="px-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-[#FF7622]" />
            <h2 className="text-sm font-black text-[#1F2229]">{t.bestOffers}</h2>
          </div>
          <button
            onClick={() => setActiveTabFilter(prev => prev === 'BEST_OFFERS' ? 'ALL' : 'BEST_OFFERS')}
            className={cn(
              "text-[11px] font-bold transition-colors",
              activeTabFilter === 'BEST_OFFERS' ? "text-[#FF7622] underline" : "text-slate-400"
            )}
          >
            {activeTabFilter === 'BEST_OFFERS' ? t.showingDeals : t.viewAll}
          </button>
        </div>

        {bestOfferProducts.length > 0 ? (
          <div className="relative group select-none">
            {/* Carousel Viewport Container */}
            <div 
              className="relative overflow-hidden rounded-2xl shadow-sm cursor-grab active:cursor-grabbing touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => {
                if (isDraggingRef.current) handleMouseUp();
                setIsPaused(false);
              }}
              onMouseEnter={() => setIsPaused(true)}
            >
              {/* Horizontal Sliding Track (Smooth float from left to right) */}
              <div 
                className="flex w-full"
                style={{
                  transform: `translateX(calc(-${activeSlide * 100}% + ${touchOffset}px))`,
                  transition: touchOffset !== 0 ? 'none' : 'transform 500ms cubic-bezier(0.25, 1, 0.5, 1)',
                  willChange: 'transform'
                }}
              >
                {bestOfferProducts.map((prod, idx) => {
                  const gradient = DEAL_GRADIENTS[idx % DEAL_GRADIENTS.length];
                  const accentColor = DEAL_ACCENTS[idx % DEAL_ACCENTS.length];
                  const fallbackImg = getProductFallbackImage(prod?.name);
                  const prodImg = prod?.image || fallbackImg;

                  return (
                    <div 
                      key={prod._id || idx}
                      className={cn(
                        "w-full shrink-0 flex-none relative overflow-hidden text-white p-4 min-h-[140px] flex items-center justify-between bg-gradient-to-r",
                        gradient
                      )}
                    >
                      {/* Left Content */}
                      <div className="flex-1 pr-3 z-10">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black tracking-wider uppercase mb-1.5 shadow-2xs">
                          {prod?.tagBadge || '⭐ Deal of the Day'}
                        </span>
                        <h3 className="text-base font-black text-white line-clamp-1 leading-tight">
                          {prod?.title || prod?.name}
                        </h3>
                        <p className="text-[11px] text-white/85 line-clamp-1 mt-0.5">
                          {prod?.description || prod?.categoryName || 'Supermarket Special'}
                        </p>

                        <div className="mt-2.5 flex items-center space-x-2">
                          <span className="text-base font-black text-white">
                            ₹{prod?.offerPrice !== undefined ? prod.offerPrice : (prod?.price || '99')}
                          </span>
                          {(prod?.actualPrice || prod?.mrp) > (prod?.offerPrice || prod?.price) && (
                            <span className="text-xs text-white/70 line-through">
                              ₹{prod?.actualPrice || prod?.mrp}
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              if (hasDraggedRef.current) return;
                              onNavigate?.(`product/${prod._id}`);
                            }}
                            className={cn(
                              "ml-2 px-2.5 py-1 rounded-full bg-white text-[10px] font-black shadow-xs active:scale-95 transition-all hover:bg-white/95",
                              accentColor
                            )}
                          >
                            {t.viewDeal}
                          </button>
                        </div>
                      </div>

                      {/* Right Image */}
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-white/10 shrink-0 border border-white/20 shadow-inner">
                        <img
                          src={prodImg}
                          alt={prod?.name || 'Deal product'}
                          className="w-full h-full object-cover select-none pointer-events-none"
                          draggable={false}
                        />
                      </div>

                      {/* Decorative Background Circles */}
                      <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
                      <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
                    </div>
                  );
                })}
              </div>

              {/* Prev / Next Quick Nav Arrows */}
              {bestOfferProducts.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSlide(prev => (prev === 0 ? bestOfferProducts.length - 1 : prev - 1));
                    }}
                    className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/25 hover:bg-black/45 text-white flex items-center justify-center backdrop-blur-xs transition-opacity opacity-0 group-hover:opacity-95 active:scale-90 z-20"
                    title="Previous deal"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSlide(prev => (prev + 1) % bestOfferProducts.length);
                    }}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/25 hover:bg-black/45 text-white flex items-center justify-center backdrop-blur-xs transition-opacity opacity-0 group-hover:opacity-95 active:scale-90 z-20"
                    title="Next deal"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>

            {/* Carousel Dot Indicators */}
            <div className="flex items-center justify-center space-x-1.5 mt-2.5">
              {bestOfferProducts.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    activeSlide === idx ? "w-5 bg-[#FF5C38]" : "w-1.5 bg-slate-300 hover:bg-slate-400"
                  )}
                  title={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-400">
            No active deals today. Check back soon!
          </div>
        )}
      </section>

      {/* Sentinel Anchor to accurately compute scroll top position */}
      <div id="category-sticky-anchor" className="h-0 w-full pointer-events-none" />

      {/* =============================================================
          4. CIRCULAR CATEGORIES (Sticky Top with Real Category Images)
         ============================================================= */}
      <section 
        id="daily-categories-block" 
        className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs py-2 px-4 mt-4 transition-all"
      >
        {/* Circular Categories Horizontal Scroll Row */}
        <div 
          ref={circularCategoryScrollRef}
          className="flex items-start space-x-2.5 overflow-x-auto no-scrollbar py-1"
        >
          {/* 'All Items' Circular Button */}
          <button
            data-category-id="ALL"
            onClick={() => handleSelectCategory('ALL')}
            className={cn(
              "flex flex-col items-center space-y-1.5 shrink-0 group w-[72px] transition-all",
              animatingCatId === 'ALL' ? "animate-category-bounce" : "active:scale-95 transition-transform"
            )}
          >
            <div className={cn(
              "w-16 h-16 min-w-[64px] min-h-[64px] max-w-[64px] max-h-[64px] aspect-square rounded-full overflow-hidden transition-all duration-300 relative flex items-center justify-center shrink-0",
              selectedCategoryId === 'ALL'
                ? "bg-[#181C2E] text-white border-[2.5px] border-[#181C2E] shadow-[0_4px_14px_rgba(24,28,46,0.35)] scale-105"
                : "bg-slate-100 text-slate-700 border-2 border-slate-200 hover:border-slate-300"
            )}>
              <Grid className={cn(
                "w-7 h-7 shrink-0 transition-transform duration-300",
                selectedCategoryId === 'ALL' ? "scale-110" : "group-hover:scale-105"
              )} />
            </div>
            <div className="flex flex-col items-center">
              {selectedCategoryId === 'ALL' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#181C2E] animate-pulse mt-0.5" />
              )}
            </div>
          </button>

          {/* Dynamic DB Categories with Clean Single Border */}
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat._id;
            const isBouncing = animatingCatId === cat._id;
            const catImg = cat.image || getCategoryFallbackImage(cat.name);

            return (
              <button
                key={cat._id}
                data-category-id={cat._id}
                onClick={() => handleSelectCategory(cat._id)}
                className={cn(
                  "flex flex-col items-center space-y-1.5 shrink-0 group w-[72px] transition-all",
                  isBouncing ? "animate-category-bounce" : "active:scale-95 transition-transform"
                )}
              >
                <div className={cn(
                  "w-16 h-16 min-w-[64px] min-h-[64px] max-w-[64px] max-h-[64px] aspect-square rounded-full overflow-hidden transition-all duration-300 p-0.5 bg-white relative flex items-center justify-center shrink-0",
                  isSelected
                    ? "border-[2.5px] border-[#FF7622] shadow-[0_4px_16px_rgba(255,118,34,0.38)] scale-105 ring-2 ring-[#FF7622]/20"
                    : "border-2 border-slate-200/90 hover:border-slate-300"
                )}>
                  <img
                    src={catImg}
                    alt={cat.name}
                    className={cn(
                      "w-full h-full aspect-square object-cover rounded-full block select-none pointer-events-none transition-transform duration-300",
                      isSelected ? "scale-105" : "group-hover:scale-105"
                    )}
                    loading="lazy"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-[#FF7622]/10 rounded-full pointer-events-none" />
                  )}
                </div>
                <div className="flex flex-col items-center">
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF7622] animate-pulse mt-0.5" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* =============================================================
          6. PRODUCTS GRID (Exact Current 2-Column Card Design with Fixed Height)
         ============================================================= */}
      <section id="supermarket-products-section" className="px-4 mt-4 min-h-[calc(100vh-140px)]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-black text-[#1F2229]">
              {selectedCategoryId !== 'ALL'
                ? `${categories.find(c => c._id === selectedCategoryId)?.name || 'Category'} Products`
                : activeTabFilter === 'BEST_OFFERS'
                  ? t.bestOffersOnly
                  : t.supermarketProducts}
            </h2>
            <span className="text-[10px] font-medium text-slate-400">
              {filteredProducts.length > ITEMS_PER_PAGE
                ? `${t.showing} ${displayedProducts.length} ${t.of} ${filteredProducts.length} ${t.items}`
                : `${t.showing} ${filteredProducts.length} ${t.items}`}
            </span>
          </div>

          {(selectedCategoryId !== 'ALL' || selectedSubcategoryId !== 'ALL' || searchQuery || activeTabFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSelectedCategoryId('ALL');
                setSelectedSubcategoryId('ALL');
                setSelectedBrand('ALL');
                setSearchQuery('');
                setActiveTabFilter('ALL');
              }}
              className="text-[10px] font-black text-[#FF7622] uppercase tracking-wider hover:underline"
            >
              {t.reset}
            </button>
          )}
        </div>

        {/* Subcategories Filter Pills (shown when a specific category is selected) */}
        {selectedCategoryId !== 'ALL' && activeSubcategories.length > 0 && (
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-3 pt-0.5 mb-1">
            <button
              onClick={() => setSelectedSubcategoryId('ALL')}
              className={cn(
                'px-3 py-1 rounded-full text-[11px] font-bold transition-all shrink-0',
                selectedSubcategoryId === 'ALL'
                  ? 'bg-[#FF7622] text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              )}
            >
              All
            </button>
            {activeSubcategories.map((sub) => (
              <button
                key={sub._id}
                onClick={() => setSelectedSubcategoryId(prev => prev === sub._id ? 'ALL' : sub._id)}
                className={cn(
                  'px-3 py-1 rounded-full text-[11px] font-bold transition-all shrink-0 border',
                  selectedSubcategoryId === sub._id
                    ? 'bg-[#FF7622] text-white border-[#FF7622] shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                )}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-white border border-slate-200 p-3 flex flex-col justify-between animate-pulse">
                <div className="h-36 rounded-xl bg-slate-100 w-full" />
                <div className="space-y-1.5 py-1">
                  <div className="h-3.5 bg-slate-100 rounded w-3/4" />
                  <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                </div>
                <div className="h-7 bg-slate-100 rounded-lg w-full" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-orange-50 text-[#FF7622] flex items-center justify-center mx-auto">
              <Grid className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-black text-slate-800">No Products Found</h4>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              No products match this category filter or search query.
            </p>
            <button
              onClick={() => {
                setSelectedCategoryId('ALL');
                setSelectedSubcategoryId('ALL');
                setSearchQuery('');
                setActiveTabFilter('ALL');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#FF7622] text-white text-[11px] font-bold shadow-xs"
            >
              Show All Products
            </button>
          </div>
        ) : (
          /* 2-Column Grid with Fixed-Height Uniform Cards & Smooth Entrance Animation */
          <>
            <div 
              key={`${selectedCategoryId}-${selectedSubcategoryId}-${activeTabFilter}-${searchQuery}`}
              className="grid grid-cols-2 gap-3 animate-products-in items-start"
            >
              {displayedProducts.map((p) => {
                const prodImg = p.image || getProductFallbackImage(p.name);
                const catName = p.categoryName || (typeof p.categoryId === 'object' ? p.categoryId?.name : '') || 'General';
                const brandName = p.brandName || (typeof p.brandId === 'object' ? p.brandId?.name : '') || '';
                const price = p.price || 0;
                const mrp = p.mrp || 0;

                return (
                  <div
                    key={p._id}
                    className="bg-white rounded-2xl p-2.5 border border-slate-200/90 shadow-2xs hover:shadow-md active:scale-[0.98] transition-all duration-200 flex flex-col justify-between h-full group"
                  >
                    <div className="flex-1 flex flex-col">
                      {/* Fixed Height Uniform Product Image Frame */}
                      <div
                        onClick={() => onNavigate?.(`product/${p._id}`)}
                        className="relative rounded-xl overflow-hidden bg-slate-100 h-36 w-full flex items-center justify-center cursor-pointer mb-2 shrink-0 group-hover:scale-[1.01] transition-transform"
                      >
                        <img
                          src={prodImg}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />

                        {/* In-Stock Badge */}
                        <div className="absolute top-1.5 left-1.5 bg-white/95 backdrop-blur-xs px-1.5 py-0.5 rounded-md text-[8px] font-black text-emerald-700 shadow-2xs border border-emerald-100 flex items-center space-x-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          <span>{t.inStock}</span>
                        </div>

                        {/* Best Offer Tag */}
                        {p.isBestOffer && (
                          <div className="absolute top-1.5 right-1.5 bg-[#FF5C38] px-1.5 py-0.5 rounded-md text-[8px] font-black text-white shadow-2xs flex items-center space-x-0.5">
                            <Star className="w-2.5 h-2.5 fill-white" />
                            <span>{t.deal}</span>
                          </div>
                        )}
                      </div>

                      {/* Category & Brand Tags */}
                      <div className="flex items-center space-x-1 mb-1">
                        <span className="px-1.5 py-0.5 rounded bg-orange-100 text-[#FF7622] text-[8px] font-black uppercase truncate max-w-[70px]">
                          {catName}
                        </span>
                        {brandName && (
                          <span className="text-[8px] text-slate-400 font-semibold truncate max-w-[60px]">
                            {brandName}
                          </span>
                        )}
                      </div>

                      {/* Product Name */}
                      <h3
                        onClick={() => onNavigate?.(`product/${p._id}`)}
                        className="font-black text-xs text-[#181C2E] hover:text-[#FF7622] transition-colors cursor-pointer line-clamp-2 leading-tight"
                        title={p.name}
                      >
                        {p.name}
                      </h3>
                    </div>

                    {/* Price Row & Action Button */}
                    <div className="pt-2 border-t border-slate-100 mt-2 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black text-[#18308C] block leading-tight">
                          {price > 0 ? `₹${price}` : t.inStore}
                        </span>
                        {mrp > price && (
                          <span className="text-[9px] text-slate-400 line-through">
                            ₹${mrp}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => onNavigate?.(`product/${p._id}`)}
                        className="px-2.5 py-1 rounded-lg bg-[#FF7622] text-white text-[10px] font-black hover:bg-[#e06115] active:scale-95 transition-all shadow-2xs"
                      >
                        {t.details}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Show More Button */}
            {hasMore && (
              <div className="pt-4 pb-2 flex flex-col items-center justify-center space-y-2">
                <button
                  onClick={handleShowMore}
                  className="w-full py-3 rounded-xl bg-[#FF7622] hover:bg-[#e06115] text-white font-black text-xs shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <span>{t.showMore}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] text-slate-400 font-medium">
                  {t.showing} {displayedProducts.length} {t.of} {filteredProducts.length} {t.items}
                </span>
              </div>
            )}

            {!hasMore && filteredProducts.length > ITEMS_PER_PAGE && (
              <div className="pt-4 pb-2 text-center">
                <span className="text-[10px] text-slate-400 font-semibold bg-white px-3 py-1.5 rounded-full border border-slate-200/80 shadow-2xs inline-block">
                  ✓ {t.allLoaded}
                </span>
              </div>
            )}
          </>
        )}
      </section>

    </div>
  );
};
