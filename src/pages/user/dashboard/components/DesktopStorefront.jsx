import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Eye, 
  Grid, 
  Store, 
  CheckCircle2, 
  ChevronRight, 
  ShieldCheck,
  ChevronDown,
  Cookie,
} from 'lucide-react';
import ApiClient from '../../../../api/client';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { cn } from '../../../../lib/utils';
import { usePlatform } from '../../../../context/PlatformContext';

// Fallback high-quality food/grocery images by keyword
const getCategoryFallbackImage = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('fruit')) return 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&auto=format&fit=crop&q=80';
  if (n.includes('veg')) return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80';
  if (n.includes('chicken') || n.includes('poultry')) return 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500&auto=format&fit=crop&q=80';
  if (n.includes('fish') || n.includes('seafood')) return 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=500&auto=format&fit=crop&q=80';
  if (n.includes('meat') || n.includes('beef') || n.includes('mutton')) return 'https://images.unsplash.com/photo-1551028150-64b9f398f678?w=500&auto=format&fit=crop&q=80';
  if (n.includes('dairy') || n.includes('milk') || n.includes('bakery')) return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80';
  if (n.includes('spice') || n.includes('masala')) return 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=80';
  if (n.includes('sugar') || n.includes('salt') || n.includes('sweet')) return 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=80';
  if (n.includes('flour') || n.includes('atta') || n.includes('grain')) return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80';
  if (n.includes('beverag') || n.includes('tea') || n.includes('coffee') || n.includes('juice') || n.includes('drink')) return 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&auto=format&fit=crop&q=80';
  return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80';
};

const getProductFallbackImage = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('chilli') || n.includes('chili') || n.includes('pepper')) return 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=80';
  if (n.includes('turmeric') || n.includes('spice') || n.includes('masala') || n.includes('coriander')) return 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=80';
  if (n.includes('sugar') || n.includes('sweet') || n.includes('jaggery')) return 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=80';
  if (n.includes('salt')) return 'https://images.unsplash.com/photo-1626197031507-c17099753214?w=500&auto=format&fit=crop&q=80';
  if (n.includes('flour') || n.includes('atta') || n.includes('besan') || n.includes('podi') || n.includes('powder')) return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80';
  if (n.includes('tea') || n.includes('coffee')) return 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&auto=format&fit=crop&q=80';
  if (n.includes('orange')) return 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=500&auto=format&fit=crop&q=80';
  if (n.includes('chicken')) return 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=500&auto=format&fit=crop&q=80';
  if (n.includes('fish') || n.includes('sardine')) return 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=500&auto=format&fit=crop&q=80';
  if (n.includes('juice')) return 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&auto=format&fit=crop&q=80';
  if (n.includes('oil')) return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80';
  return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80';
};

import { getTranslation, getAppLanguage } from '../../../../locales';

export const DesktopStorefront = ({ onNavigate }) => {
  const { appearance } = usePlatform();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rangeVisible, setRangeVisible] = useState(false);
  const rangeSectionRef = useRef(null);

  // Language state (synced with app_language)
  const [selectedLang, setSelectedLang] = useState(getAppLanguage);

  const heroImage = appearance?.heroImageUrl || '';
  const brandName = appearance?.platformName || 'Alfaysal Bakery';
  const brandLogo = appearance?.logoUrl || '/al-salhiya-logo.jpg';

  useEffect(() => {
    const handleLangSync = (e) => {
      if (e.detail) setSelectedLang(e.detail);
    };
    window.addEventListener('app_language_changed', handleLangSync);
    return () => window.removeEventListener('app_language_changed', handleLangSync);
  }, []);

  // Reveal "What We Bake" cards on scroll
  useEffect(() => {
    const el = rangeSectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRangeVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const t = getTranslation(selectedLang);

  // Active selections
  const [selectedCategory, setSelectedCategory] = useState(null); // category object or null for all
  const [selectedSubcategory, setSelectedSubcategory] = useState(null); // subcategory object or null
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Live fetch from database API (the 5 collections)
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
        const offerList = Array.isArray(offerRes.value?.data) ? offerRes.value.data : (offerRes.value?.data?.offers || offerRes.value || []);
        setOffers(Array.isArray(offerList) ? offerList : []);
      }

      setIsLoading(false);
    }).catch((err) => {
      console.error('Error fetching catalog data:', err);
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter subcategories for currently selected category
  const activeSubcategories = useMemo(() => {
    if (!selectedCategory) return subcategories;
    const catId = selectedCategory._id;
    return subcategories.filter(s => {
      const sCatId = typeof s.categoryId === 'object' ? s.categoryId?._id : s.categoryId;
      return sCatId === catId;
    });
  }, [subcategories, selectedCategory]);

  // Filter products by selectedCategory -> selectedSubcategory -> selectedBrand -> search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Category match
      if (selectedCategory) {
        const pCatId = typeof p.categoryId === 'object' ? p.categoryId?._id : p.categoryId;
        const pCatName = (p.categoryName || '').toLowerCase();
        const selCatName = (selectedCategory.name || '').toLowerCase();
        const matchesCat = pCatId === selectedCategory._id || pCatName === selCatName;
        if (!matchesCat) return false;
      }

      // 2. Subcategory match
      if (selectedSubcategory) {
        const pSubId = typeof p.subcategoryId === 'object' ? p.subcategoryId?._id : p.subcategoryId;
        const pSubName = (p.subcategoryName || '').toLowerCase();
        const selSubName = (selectedSubcategory.name || '').toLowerCase();
        const matchesSub = pSubId === selectedSubcategory._id || pSubName === selSubName;
        if (!matchesSub) return false;
      }

      // 3. Brand match
      if (selectedBrand !== 'ALL') {
        const pBrandName = (p.brandName || (typeof p.brandId === 'object' ? p.brandId?.name : '') || '').toLowerCase();
        if (pBrandName !== selectedBrand.toLowerCase()) return false;
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = (p.name || '').toLowerCase().includes(q);
        const descMatch = (p.description || '').toLowerCase().includes(q);
        const catMatch = (p.categoryName || '').toLowerCase().includes(q);
        const subMatch = (p.subcategoryName || '').toLowerCase().includes(q);
        const brandMatch = (p.brandName || '').toLowerCase().includes(q);
        if (!nameMatch && !descMatch && !catMatch && !subMatch && !brandMatch) return false;
      }

      return true;
    });
  }, [products, selectedCategory, selectedSubcategory, selectedBrand, searchQuery]);

  // Show 8 items initially and load 8 more on "Show More"
  const ITEMS_PER_PAGE = 8;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Reset to 8 when filters change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [selectedCategory, selectedSubcategory, selectedBrand, searchQuery]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const hasMore = visibleCount < filteredProducts.length;

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  // Handle Category Click
  const handleSelectCategory = (cat) => {
    if (selectedCategory?._id === cat?._id) {
      // Toggle off to show all
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    } else {
      setSelectedCategory(cat);
      setSelectedSubcategory(null);
    }
    const el = document.getElementById('catalog-browser-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle Subcategory Click
  const handleSelectSubcategory = (sub) => {
    if (selectedSubcategory?._id === sub?._id) {
      setSelectedSubcategory(null);
    } else {
      setSelectedSubcategory(sub);
    }
  };

  return (
    <div className="w-full bg-[#FFFFFF] font-sans selection:bg-[#FF7622]/20">
      
      {/* =============================================================
          1. HERO — Full-bleed brand hero (admin image)
         ============================================================= */}
      <section className="relative min-h-[72vh] lg:min-h-[78vh] overflow-hidden flex items-end lg:items-center">
        {/* Background image from admin (or branded fallback) */}
        <div className="absolute inset-0 bg-[#0e1d4a]">
          {heroImage ? (
            <img
              src={heroImage}
              alt={brandName}
              className="w-full h-full object-cover animate-hero-ken-burns"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#18308c] via-[#0e1d4a] to-[#1a0f08] flex items-center justify-center">
              <img
                src={brandLogo}
                alt={brandName}
                className="w-40 h-40 object-contain opacity-30"
              />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1228]/90 via-[#0e1d4a]/72 to-[#0e1d4a]/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1228]/80 via-transparent to-black/20" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-xl text-left text-white space-y-5">
            <div className="animate-hero-fade-up inline-flex items-center space-x-2 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200/95">
              <span className="w-8 h-px bg-amber-300/80" />
              <span>{t.heroTag}</span>
            </div>

            <p className="animate-hero-fade-up-delay-1 text-sm font-semibold text-white/70 tracking-wide">
              {brandName}
            </p>

            <h1 className="animate-hero-fade-up-delay-1 text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight">
              {t.heroTitle1}
              {t.heroTitle2 ? (
                <>
                  <br />
                  <span className="text-amber-300">{t.heroTitle2}</span>
                </>
              ) : null}
            </h1>

            <p className="animate-hero-fade-up-delay-2 text-sm sm:text-base text-white/80 max-w-md leading-relaxed font-medium">
              {appearance?.tagline || t.heroDesc}
            </p>

            <div className="animate-hero-fade-up-delay-3 pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  const el = document.getElementById('what-we-bake-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-7 py-3.5 rounded-full bg-[#FF7622] hover:bg-[#E56314] text-white font-black text-xs shadow-lg shadow-orange-500/30 hover:shadow-orange-500/45 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center space-x-2"
              >
                <span>{t.browseCategories}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate?.('about')}
                className="px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/35 text-white font-black text-xs backdrop-blur-sm hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
              >
                {t.fullCatalogList}
              </button>
            </div>

            <div className="animate-hero-fade-up-delay-3 pt-3 flex flex-wrap items-center gap-5 text-[11px] text-white/65 font-semibold">
              <div className="flex items-center space-x-1.5">
                <Store className="w-3.5 h-3.5 text-amber-300" />
                <span>{t.physicalStock}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>{t.verifiedQuality}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =============================================================
          2. WHAT WE BAKE — Aesthetic heritage gallery
         ============================================================= */}
      <section
        id="what-we-bake-section"
        ref={rangeSectionRef}
        className="relative py-20 lg:py-28 overflow-hidden border-b border-[#eadfce]/80"
      >
        {/* Soft bakery atmosphere */}
        <div className="absolute inset-0 bg-[#FBF7F1]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,186,24,0.12),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(24,48,140,0.06),_transparent_50%)]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'radial-gradient(rgba(120,90,50,0.07) 0.7px, transparent 0.7px)',
            backgroundSize: '18px 18px',
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Centered elegant header */}
          <div className="text-center max-w-2xl mx-auto mb-14 lg:mb-16 space-y-4">
            <div className="flex items-center justify-center gap-3">
              <span className="h-px w-10 sm:w-14 bg-gradient-to-r from-transparent to-[#d4a017]" />
              <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.28em] text-[#b8870f]">
                <Cookie className="w-3.5 h-3.5" />
                {t.exploreRange}
              </span>
              <span className="h-px w-10 sm:w-14 bg-gradient-to-l from-transparent to-[#d4a017]" />
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black text-[#1a1630] tracking-[-0.03em] leading-tight">
              {t.whatWeBake}
            </h2>
            <p className="text-sm sm:text-[15px] text-[#6f6680] font-medium leading-relaxed max-w-md mx-auto">
              {t.whatWeBakeDesc}
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-10 overflow-hidden py-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col items-center gap-4 shrink-0">
                  <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-[#efe8dc] animate-pulse" />
                  <div className="h-3 w-20 rounded-full bg-[#efe8dc] animate-pulse" />
                </div>
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
              {/* Soft edge fades */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-20 z-10 bg-gradient-to-r from-[#FBF7F1] to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-20 z-10 bg-gradient-to-l from-[#FBF7F1] to-transparent" />

              <div className="overflow-hidden py-4 group/marquee">
                <div className="flex w-max animate-marquee-right hover:[animation-play-state:paused]">
                  {[...categories, ...categories].map((cat, idx) => {
                    const catImg = cat.image || getCategoryFallbackImage(cat.name);
                    const isSelected = selectedCategory?._id === cat._id;
                    return (
                      <button
                        key={`${cat._id}-${idx}`}
                        type="button"
                        onClick={() => handleSelectCategory(cat)}
                        className="group flex flex-col items-center text-center focus:outline-none shrink-0 mx-5 sm:mx-7"
                      >
                        <div
                          className={cn(
                            'relative w-32 h-32 sm:w-36 sm:h-36 rounded-full p-[3px] transition-all duration-500 ease-out',
                            isSelected
                              ? 'bg-gradient-to-br from-[#FF7622] via-[#ffba18] to-[#18308c] shadow-[0_12px_30px_rgba(255,118,34,0.28)] scale-[1.03]'
                              : 'bg-gradient-to-br from-[#e8dcc8] via-[#f3ebe0] to-[#d9cbb6] group-hover:from-[#FF7622]/70 group-hover:via-[#ffba18]/50 group-hover:to-[#18308c]/40 group-hover:shadow-[0_14px_32px_rgba(24,48,140,0.12)] group-hover:scale-[1.04]'
                          )}
                        >
                          <div className="w-full h-full rounded-full overflow-hidden bg-white p-1">
                            <div className="w-full h-full rounded-full overflow-hidden relative">
                              <img
                                src={catImg}
                                alt={cat.name}
                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                loading="lazy"
                                draggable={false}
                              />
                              <div className="absolute inset-0 bg-[#1a1630]/0 group-hover:bg-[#1a1630]/10 transition-colors duration-500" />
                            </div>
                          </div>

                          <span
                            className={cn(
                              'absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-md border border-[#eadfce] flex items-center justify-center transition-all duration-300',
                              isSelected
                                ? 'opacity-100 translate-y-0 bg-[#FF7622] border-[#FF7622] text-white'
                                : 'opacity-0 translate-y-1 text-[#18308c] group-hover:opacity-100 group-hover:translate-y-0'
                            )}
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>

                        <div className="mt-4 space-y-1.5 px-1 w-32 sm:w-36">
                          <h3
                            className={cn(
                              'text-[13px] sm:text-sm font-black tracking-tight leading-snug transition-colors duration-300 line-clamp-2',
                              isSelected ? 'text-[#FF7622]' : 'text-[#1a1630] group-hover:text-[#FF7622]'
                            )}
                          >
                            {cat.name}
                          </h3>
                          <span
                            className={cn(
                              'mx-auto block h-0.5 rounded-full transition-all duration-500',
                              isSelected
                                ? 'w-8 bg-[#FF7622]'
                                : 'w-0 bg-[#FF7622] group-hover:w-8'
                            )}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory(null);
                setSelectedSubcategory(null);
                document.getElementById('catalog-browser-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#d9cbb6] bg-white/80 backdrop-blur-sm text-xs font-black text-[#1a1630] hover:border-[#FF7622] hover:text-[#FF7622] hover:shadow-md transition-all duration-300 active:scale-95"
            >
              <span>{t.browseCategories}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* =============================================================
          FEATURED IN-STORE OFFER BANNERS
         ============================================================= */}
      {offers.length > 0 && (
        <section className="py-10 bg-gradient-to-b from-orange-50/40 via-white to-slate-50/50 border-b border-orange-100/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="inline-flex items-center space-x-1.5 text-[11px] font-black uppercase tracking-wider text-[#FF7622] mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.promotionsTag}</span>
                </div>
                <h2 className="text-2xl font-black text-[#1F2229] tracking-tight">
                  {t.dealsTitle}
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-white px-3 py-1.5 rounded-full border border-slate-200/80 shadow-2xs self-start sm:self-auto">
                {t.activeDiscounts}
              </span>
            </div>

            {/* Offer Banners Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {offers.slice(0, 4).map((offer, idx) => {
                const discount = offer.actualPrice && Number(offer.actualPrice) > Number(offer.offerPrice)
                  ? Math.round(((Number(offer.actualPrice) - Number(offer.offerPrice)) / Number(offer.actualPrice)) * 100)
                  : null;

                const fallbackImg = getProductFallbackImage(offer.title);
                const bannerImg = offer.image || fallbackImg;

                return (
                  <div
                    key={offer._id || idx}
                    className="relative rounded-2xl overflow-hidden p-5 bg-white  border-[#FF7622] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 pr-1">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#18308C]/10 text-[#18308C] text-[10px] font-black uppercase mb-2 border border-[#18308C]/15">
                          {offer.tagBadge || t.specialOffer}
                        </span>
                        <h3 className="text-sm font-black text-[#0E1D4A] line-clamp-2 leading-tight group-hover:text-[#FF7824] transition-colors">
                          {offer.title}
                        </h3>
                        <p className="text-[11px] text-[#5E6B8C] line-clamp-2 mt-1 font-medium">
                          {offer.description || 'Promotional deal available in-store.'}
                        </p>
                      </div>

                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-slate-200 shadow-xs">
                        <img
                          src={bannerImg}
                          alt={offer.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-base font-black text-[#18308C]">
                          ₹{offer.offerPrice}
                        </span>
                        {offer.actualPrice && Number(offer.actualPrice) > Number(offer.offerPrice) && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{offer.actualPrice}
                          </span>
                        )}
                        {discount && (
                          <span className="px-1.5 py-0.5 rounded-md bg-orange-100 text-[#FF7824] text-[10px] font-black border border-orange-200/60">
                            -{discount}%
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          if (offer.productId) {
                            onNavigate?.(`product/${offer.productId}`);
                          } else {
                            const el = document.getElementById('catalog-browser-section');
                            el?.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-full bg-[#18308C] text-white text-[10px] font-black hover:bg-[#FF7824] active:scale-95 transition-all shadow-xs"
                      >
                        {t.viewDeal}
                      </button>
                    </div>

                    {/* Decorative subtle ambient shape */}
                    <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-[#18308C]/5 pointer-events-none" />
                  </div>
                );
              })}
            </div>

          </div>
        </section>
      )}

      {/* =============================================================
          3. INTERACTIVE CATALOG BROWSER (Category -> Products)
         ============================================================= */}
      <section id="catalog-browser-section" className="py-14 bg-[#FAFAFA] border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

          {/* Subcategories Filter Pill Bar (shown when category is selected) */}
          {selectedCategory && activeSubcategories.length > 0 && (
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
              <span className="font-bold text-slate-400 shrink-0 text-[11px] uppercase tracking-wider">{t.subcategoriesLabel}</span>
              <button
                onClick={() => setSelectedSubcategory(null)}
                className={cn(
                  'px-3 py-1 rounded-lg font-bold text-[11px] transition-colors shrink-0',
                  !selectedSubcategory
                    ? 'bg-[#FF7622] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                )}
              >
                {t.allSubcat} {selectedCategory.name}
              </button>
              {activeSubcategories.map((sub) => (
                <button
                  key={sub._id}
                  onClick={() => handleSelectSubcategory(sub)}
                  className={cn(
                    'px-3 py-1 rounded-lg font-bold text-[11px] transition-colors shrink-0 border',
                    selectedSubcategory?._id === sub._id
                      ? 'bg-[#FF7622] text-white border-[#FF7622] shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                  )}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          )}

          {/* Brands Filter Pill Bar (if brands exist) */}
          {brands.length > 0 && (
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
              <span className="font-bold text-slate-400 shrink-0 text-[11px] uppercase tracking-wider">{t.brandsLabel}</span>
              <button
                onClick={() => setSelectedBrand('ALL')}
                className={cn(
                  'px-3 py-1 rounded-lg font-bold text-[11px] transition-colors shrink-0',
                  selectedBrand === 'ALL'
                    ? 'bg-slate-800 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                )}
              >
                {t.allBrands}
              </button>
              {brands.map((b) => (
                <button
                  key={b._id}
                  onClick={() => setSelectedBrand(b.name)}
                  className={cn(
                    'px-3 py-1 rounded-lg font-bold text-[11px] transition-colors shrink-0 border',
                    selectedBrand.toLowerCase() === b.name.toLowerCase()
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                  )}
                >
                  {b.name}
                </button>
              ))}
            </div>
          )}

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-72 rounded-2xl bg-white border border-slate-200 animate-pulse p-3 sm:p-4 flex flex-col justify-between">
                  <div className="h-40 sm:h-52 rounded-xl bg-slate-100 w-full" />
                  <div className="space-y-2 py-2">
                    <div className="h-4 bg-slate-100 rounded-md w-3/4" />
                    <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                  </div>
                  <div className="h-8 bg-slate-100 rounded-lg w-full" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF7622] flex items-center justify-center mx-auto">
                <Grid className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-800">{t.noProductsFound}</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {t.noProductsDesc}
              </p>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedSubcategory(null);
                  setSelectedBrand('ALL');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-[#FF7622] text-white font-bold text-xs shadow-xs"
              >
                {t.resetFilters}
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {displayedProducts.map((p) => {
                  const prodImg = p.image || getProductFallbackImage(p.name);
                  const catName = p.categoryName || (typeof p.categoryId === 'object' ? p.categoryId?.name : '') || 'General';
                  const subName = p.subcategoryName || (typeof p.subcategoryId === 'object' ? p.subcategoryId?.name : '') || '';
                  const brandName = p.brandName || (typeof p.brandId === 'object' ? p.brandId?.name : '') || '';

                  return (
                    <div
                      key={p._id}
                      className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full group"
                    >
                      <div className="flex-1 flex flex-col">
                        {/* Product Image Frame (Consistent Fixed Height for all images) */}
                        <div 
                          onClick={() => onNavigate?.(`product/${p._id}`)}
                          className="relative rounded-xl overflow-hidden bg-slate-100 h-40 sm:h-48 md:h-52 w-full flex items-center justify-center cursor-pointer mb-2.5 sm:mb-3 shrink-0 group-hover:scale-[1.01] transition-transform"
                        >
                          <img
                            src={prodImg}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />

                          {/* In-Stock Badge */}
                          <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-black text-emerald-700 shadow-2xs border border-emerald-100 flex items-center space-x-1">
                            <CheckCircle2 className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-emerald-600" />
                            <span>{t.inStock}</span>
                          </div>

                          {/* Brand badge if present */}
                          {brandName && (
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-bold text-white max-w-[45%] truncate">
                              {brandName}
                            </div>
                          )}
                        </div>

                        {/* Category & Subcategory Tags */}
                        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mb-1.5 sm:mb-2">
                          <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-orange-100 text-[#FF7622] text-[9px] sm:text-[10px] font-black uppercase">
                            {catName}
                          </span>
                          {subName && (
                            <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[9px] sm:text-[10px] font-bold">
                              {subName}
                            </span>
                          )}
                        </div>

                        {/* Product Name */}
                        <h3 
                          onClick={() => onNavigate?.(`product/${p._id}`)}
                          className="font-black text-xs sm:text-sm md:text-base text-[#181C2E] hover:text-[#FF7622] transition-colors cursor-pointer line-clamp-1 sm:line-clamp-2 leading-snug"
                          title={p.name}
                        >
                          {p.name}
                        </h3>

                        {/* Description (visible on tablet/desktop, compact) */}
                        <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 leading-relaxed mt-1 font-normal hidden sm:block">
                          {p.description || 'Verified supermarket product available in-store.'}
                        </p>
                      </div>

                      {/* Bottom Row: Price & View Details Action */}
                      <div className="pt-2.5 sm:pt-4 border-t border-slate-100 mt-2.5 sm:mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 block uppercase">{t.inStorePrice}</span>
                          <span className="text-xs sm:text-base font-black text-[#FF7622]">
                            {p.price ? `₹${Number(p.price).toFixed(2)}` : t.inStore}
                          </span>
                        </div>

                        <button
                          onClick={() => setQuickViewProduct({ ...p, image: prodImg, catName, subName, brandName })}
                          className="w-full sm:w-auto px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-orange-50 hover:bg-[#FF7622] text-[#FF7622] hover:text-white font-black text-[11px] sm:text-xs transition-all flex items-center justify-center space-x-1 shadow-2xs"
                        >
                          <Eye className="w-3 sm:w-3.5 h-3 sm:h-3.5 shrink-0" />
                          <span className="hidden sm:inline">{t.viewDetails}</span>
                          <span className="sm:hidden">{t.details}</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Show More Products Button */}
              {hasMore && (
                <div className="pt-8 flex flex-col items-center justify-center space-y-2.5">
                  <button
                    onClick={handleShowMore}
                    className="px-8 py-3.5 rounded-2xl bg-[#FF7622] hover:bg-[#E56314] text-white font-black text-xs sm:text-sm shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 active:scale-95 transition-all duration-200 flex items-center space-x-2 cursor-pointer"
                  >
                    <span>{t.showMore}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <p className="text-[11px] sm:text-xs text-slate-400 font-semibold">
                    {t.showing} {displayedProducts.length} {t.of} {filteredProducts.length} {t.products}
                  </p>
                </div>
              )}

              {!hasMore && filteredProducts.length > ITEMS_PER_PAGE && (
                <div className="pt-8 text-center">
                  <span className="text-[11px] sm:text-xs text-slate-400 font-semibold bg-white px-4 py-2 rounded-full border border-slate-200/80 shadow-2xs inline-block">
                    ✓ {t.allLoaded} ({filteredProducts.length})
                  </span>
                </div>
              )}
            </>
          )}

        </div>
      </section>

      {/* =============================================================
          QUICK VIEW MODAL (Catalog Details)
         ============================================================= */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
            >
              ✕
            </button>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-44 h-44 rounded-2xl bg-slate-50 border border-slate-100 p-2 shrink-0 flex items-center justify-center overflow-hidden">
                <img
                  src={quickViewProduct.image}
                  alt={quickViewProduct.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>

              <div className="space-y-2 text-left flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-orange-100 text-[#FF7622] px-2 py-0.5 rounded-md">
                    {quickViewProduct.catName || 'Category'}
                  </span>
                  {quickViewProduct.subName && (
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      {quickViewProduct.subName}
                    </span>
                  )}
                  {quickViewProduct.brandName && (
                    <span className="text-[10px] font-bold bg-blue-50 text-[#18308C] px-2 py-0.5 rounded-md">
                      {quickViewProduct.brandName}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-black text-stone-900 leading-tight">
                  {quickViewProduct.name}
                </h3>

                <p className="text-xs text-stone-500 leading-relaxed font-normal">
                  {quickViewProduct.description || 'Verified product in stock at Al Salhiya Supermarket.'}
                </p>

                <div className="pt-2 flex items-baseline space-x-2">
                  <span className="text-xs font-bold text-slate-400">{t.inStorePrice}:</span>
                  <span className="text-lg font-black text-[#FF7622]">
                    {quickViewProduct.price ? `₹${Number(quickViewProduct.price).toFixed(2)}` : t.inStore}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => {
                  const id = quickViewProduct._id;
                  setQuickViewProduct(null);
                  onNavigate?.(`product/${id}`);
                }}
                className="w-full py-3 rounded-2xl bg-[#FF7622] hover:bg-[#E56314] text-white font-black text-xs shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <span>{t.viewProductPage}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setQuickViewProduct(null)}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
