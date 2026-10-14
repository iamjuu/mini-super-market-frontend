import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  Filter, 
  Check, 
  ArrowUpDown, 
  Eye, 
  Sparkles, 
  Star,
  ChevronRight, 
  ChevronDown,
  Layers, 
  Tag, 
  Store,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import ApiClient from '@/api/client';

// Fallback product images matching Home
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

export const ShopCatalogPage = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSubcategory, setSelectedSubcategory] = useState('ALL');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [maxPrice, setMaxPrice] = useState(1000);
  const [loading, setLoading] = useState(true);
  const [catalog, setCatalog] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [dbSubcategories, setDbSubcategories] = useState([]);
  const [dbBrands, setBrands] = useState([]);

  // Fetch live products, categories, subcategories, and brands
  useEffect(() => {
    let isMounted = true;

    const fetchCatalogData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes, subcategoriesRes, brandsRes] = await Promise.allSettled([
          ApiClient.get('/products'),
          ApiClient.get('/categories'),
          ApiClient.get('/subcategories'),
          ApiClient.get('/brands'),
        ]);

        if (!isMounted) return;

        if (productsRes.status === 'fulfilled') {
          const rawProds = Array.isArray(productsRes.value?.data) 
            ? productsRes.value.data 
            : (productsRes.value?.data?.data || productsRes.value || []);

          if (Array.isArray(rawProds)) {
            const fetchedProds = rawProds.map((p) => {
              let discount = null;
              if (p.mrp && p.mrp > p.price) {
                const diff = Math.round(((p.mrp - p.price) / p.mrp) * 100);
                discount = `-${diff}%`;
              }

              return {
                id: p._id,
                _id: p._id,
                slug: p.slug,
                name: p.name,
                category: (p.categoryName || p.categoryId?.name || 'GENERAL').toUpperCase(),
                categoryName: p.categoryName || p.categoryId?.name || 'General',
                categoryId: typeof p.categoryId === 'object' ? p.categoryId?._id : p.categoryId,
                subcategoryName: p.subcategoryName || p.subcategoryId?.name || '',
                subcategoryId: typeof p.subcategoryId === 'object' ? p.subcategoryId?._id : p.subcategoryId,
                brandName: p.brandName || p.brandId?.name || '',
                brandId: typeof p.brandId === 'object' ? p.brandId?._id : p.brandId,
                price: Number(p.price) || 0,
                mrp: Number(p.mrp) || 0,
                originalPrice: Number(p.mrp) || Number(p.price) * 1.25,
                discount: discount,
                isBestOffer: p.isBestOffer || false,
                image: p.image || getProductFallbackImage(p.name),
                description: p.description || 'Verified supermarket product available in-store.',
                unit: p.unit || 'piece',
              };
            });
            setCatalog(fetchedProds);
          }
        }

        if (categoriesRes.status === 'fulfilled') {
          const cats = Array.isArray(categoriesRes.value?.data) ? categoriesRes.value.data : (categoriesRes.value?.data?.data || []);
          if (Array.isArray(cats)) setDbCategories(cats);
        }

        if (subcategoriesRes.status === 'fulfilled') {
          const subs = Array.isArray(subcategoriesRes.value?.data) ? subcategoriesRes.value.data : (subcategoriesRes.value?.data?.data || []);
          if (Array.isArray(subs)) setDbSubcategories(subs);
        }

        if (brandsRes.status === 'fulfilled') {
          const brs = Array.isArray(brandsRes.value?.data) ? brandsRes.value.data : (brandsRes.value?.data?.data || []);
          if (Array.isArray(brs)) setBrands(brs);
        }
      } catch (err) {
        console.error('Failed to load catalog:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCatalogData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Category list with counts
  const categoriesList = useMemo(() => {
    const counts = {};
    catalog.forEach((item) => {
      const catKey = (item.categoryName || 'General').trim();
      counts[catKey] = (counts[catKey] || 0) + 1;
    });

    const list = [
      { id: 'ALL', label: 'All Categories', count: catalog.length },
    ];

    dbCategories.forEach((cat) => {
      list.push({
        id: cat.name.toUpperCase(),
        label: cat.name,
        count: counts[cat.name] || 0,
      });
    });

    return list;
  }, [catalog, dbCategories]);

  // Subcategories available based on selected category
  const filteredSubcategories = useMemo(() => {
    if (selectedCategory === 'ALL') return dbSubcategories;
    const cat = dbCategories.find(c => c.name.toUpperCase() === selectedCategory);
    if (!cat) return dbSubcategories;
    return dbSubcategories.filter(s => {
      const sCatId = typeof s.categoryId === 'object' ? s.categoryId?._id : s.categoryId;
      return sCatId === cat._id;
    });
  }, [dbSubcategories, selectedCategory, dbCategories]);

  // Filtering
  const filtered = useMemo(() => {
    return catalog.filter((item) => {
      const itemCat = (item.categoryName || '').toUpperCase();
      const matchesCategory = selectedCategory === 'ALL' || itemCat === selectedCategory;

      const itemSub = (item.subcategoryName || '').toLowerCase();
      const matchesSubcategory = selectedSubcategory === 'ALL' || itemSub === selectedSubcategory.toLowerCase();

      const itemBrand = (item.brandName || '').toLowerCase();
      const matchesBrand = selectedBrand === 'ALL' || itemBrand === selectedBrand.toLowerCase();

      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.categoryName && item.categoryName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.subcategoryName && item.subcategoryName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPrice = item.price === 0 || item.price <= maxPrice;
      return matchesCategory && matchesSubcategory && matchesBrand && matchesSearch && matchesPrice;
    });
  }, [catalog, selectedCategory, selectedSubcategory, selectedBrand, searchQuery, maxPrice]);

  // Sorting
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0; // default popular
    });
  }, [filtered, sortBy]);

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const mobileTabsRef = useRef(null);

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    setSelectedSubcategory('ALL');
    if (mobileTabsRef.current) {
      const btn = mobileTabsRef.current.querySelector(`[data-cat-id="${catId}"]`);
      if (btn) {
        btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  };

  return (
    <div className="w-full bg-[#FAFAFA] font-sans selection:bg-[#FF7622]/20 min-h-screen">
      
      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-slate-200/80 py-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-slate-400 font-bold mb-1">
              <span onClick={() => onNavigate?.('home')} className="hover:text-[#FF7622] cursor-pointer">Home</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-700">Digital Product Catalog</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1F2229]">
              Al Salhiya Product Catalog
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Browse our wholesale product catalog for supermarket partners
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 z-10" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search catalog items..."
              className="pl-10 h-11 rounded-xl"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        
        {/* Mobile Horizontal Category Tabs (< lg) */}
        <div className="lg:hidden mb-6">
          <div className="flex items-center justify-between mb-2.5 px-0.5">
            <div className="flex items-center space-x-2 font-black text-sm text-[#1F2229]">
              <Layers className="w-4 h-4 text-[#FF7622]" />
              <span>Categories</span>
            </div>
            {selectedCategory !== 'ALL' && (
              <button
                onClick={() => handleCategorySelect('ALL')}
                className="text-xs font-bold text-[#FF7622] hover:underline"
              >
                Reset
              </button>
            )}
          </div>

          {/* Horizontal scrollable tab row */}
          <div className="relative">
            <div 
              ref={mobileTabsRef}
              className="flex items-center space-x-2.5 overflow-x-auto no-scrollbar scroll-smooth py-1 -mx-4 px-4 sm:mx-0 sm:px-0"
            >
              {categoriesList.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    data-cat-id={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`shrink-0 flex items-center space-x-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-200 select-none active:scale-95 ${
                      isSelected
                        ? 'bg-[#FF7622] text-white shadow-md shadow-[#FF7622]/25 scale-[1.02]'
                        : 'bg-white text-slate-700 border border-slate-200/90 hover:bg-orange-50/50 hover:text-[#FF7622] hover:border-orange-200 shadow-2xs'
                    }`}
                  >
                    <span className="whitespace-nowrap">{cat.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold transition-colors ${
                        isSelected 
                          ? 'bg-white/25 text-white' 
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Filter Sidebar */}
          <div className="w-full lg:w-64 space-y-4 lg:space-y-6 shrink-0 lg:sticky lg:top-24 lg:self-start">
            
            {/* Category Filter - Desktop Sidebar Only (>= lg) */}
            <div className="hidden lg:block bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center space-x-2 font-black text-sm text-[#1F2229]">
                <Layers className="w-4 h-4 text-[#FF7622]" />
                <span>Categories</span>
              </div>
              
              <div className="space-y-1 text-xs font-bold">
                {categoriesList.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSelectedSubcategory('ALL');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-[#FF7622] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-orange-50 hover:text-[#FF7622]'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                      selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Toggle Button for Additional Filters (Brands & Price) */}
            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white border border-slate-200/80 text-xs font-bold text-slate-700 shadow-2xs active:bg-slate-50"
              >
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF7622]" />
                  <span>More Filters (Brand &amp; Price)</span>
                  {(selectedBrand !== 'ALL' || maxPrice < 1000) && (
                    <span className="w-2 h-2 rounded-full bg-[#FF7622]" />
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showMobileFilters ? 'rotate-180 text-[#FF7622]' : 'text-slate-400'}`} />
              </button>
            </div>

            {/* Brands & Price Filter Container (Collapsible on mobile, always open on desktop) */}
            <div className={`${showMobileFilters ? 'space-y-4' : 'hidden'} lg:block lg:space-y-6`}>
              {/* Brands Filter */}
              {dbBrands.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between font-black text-sm text-[#1F2229]">
                    <span>Brands</span>
                    {selectedBrand !== 'ALL' && (
                      <button
                        onClick={() => setSelectedBrand('ALL')}
                        className="text-[10px] text-[#FF7622] hover:underline"
                      >
                        All
                      </button>
                    )}
                  </div>

                  <div className="space-y-1 text-xs font-bold max-h-40 overflow-y-auto">
                    <button
                      onClick={() => setSelectedBrand('ALL')}
                      className={`w-full flex items-center px-3 py-1.5 rounded-xl text-left transition-all ${
                        selectedBrand === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>All Brands</span>
                    </button>
                    {dbBrands.map((b) => (
                      <button
                        key={b._id}
                        onClick={() => setSelectedBrand(b.name)}
                        className={`w-full flex items-center px-3 py-1.5 rounded-xl text-left transition-all ${
                          selectedBrand.toLowerCase() === b.name.toLowerCase()
                            ? 'bg-slate-800 text-white'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{b.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Filter Slider (INR ₹) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between font-black text-sm text-[#1F2229]">
                  <span>Filter by Price</span>
                  <span className="text-xs text-[#FF7622] font-black">₹{maxPrice}</span>
                </div>
                <Slider
                  value={[maxPrice]}
                  min={20}
                  max={1000}
                  step={10}
                  onValueChange={(vals) => setMaxPrice(vals[0])}
                  className="w-full py-1"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                  <span>₹20</span>
                  <span>₹1,000</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Product Grid */}
          <div className="flex-1 space-y-6">
            
            {/* Top Sort & Count Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-xs text-slate-500 font-bold">
                Showing <span className="text-[#1F2229] font-black">{sorted.length}</span> items in Al Salhiya catalog
                {loading && <span className="ml-2 text-slate-400 font-normal">(Syncing with database...)</span>}
              </span>

              <div className="flex items-center justify-between space-x-2 text-xs font-bold text-slate-600">
           <div className='flex items-center space-x-2'>
                <ArrowUpDown className="w-3.5 h-3.5 text-[#FF7622]" />
                <span className="shrink-0">Sort by:</span>
                </div>
                <div className="w-44">
                  <Select value={sortBy} onValueChange={(val) => setSortBy(val)}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Product Cards Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-2xs animate-pulse flex flex-col justify-between h-72">
                    <div className="rounded-xl bg-slate-100 h-40 sm:h-52 w-full" />
                    <div className="space-y-2 py-2">
                      <div className="h-4 bg-slate-100 rounded-md w-3/4" />
                      <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center space-y-3 border border-slate-200">
                <p className="text-sm font-bold text-slate-600">No products match your current filters.</p>
                <Button
                  onClick={() => {
                    setSelectedCategory('ALL');
                    setSelectedSubcategory('ALL');
                    setSelectedBrand('ALL');
                    setSearchQuery('');
                    setMaxPrice(1000);
                  }}
                  variant="default"
                  size="sm"
                >
                  Reset All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
                {sorted.map((item) => {
                  const navTargetId = item._id || item.id || item.slug;
                  const prodImg = item.image || getProductFallbackImage(item.name);
                  const catName = item.categoryName || 'General';
                  const brandName = item.brandName || '';
                  const price = item.price || 0;
                  const mrp = item.mrp || 0;

                  return (
                    <div
                      key={item.id || item._id}
                      className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/90 shadow-2xs hover:shadow-md active:scale-[0.98] transition-all duration-200 flex flex-col justify-between h-full group"
                    >
                      <div className="flex-1 flex flex-col">
                        {/* Fixed Height Uniform Product Image Frame */}
                        <div 
                          onClick={() => onNavigate?.(`product/${navTargetId}`)}
                          className="relative rounded-xl overflow-hidden bg-slate-100 h-36 sm:h-44 md:h-48 w-full flex items-center justify-center cursor-pointer mb-2 shrink-0 group-hover:scale-[1.01] transition-transform"
                        >
                          <img
                            src={prodImg}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />

                          {/* In-Stock Badge */}
                          <div className="absolute top-1.5 left-1.5 bg-white/95 backdrop-blur-xs px-1.5 sm:px-2 py-0.5 rounded-md text-[8px] sm:text-[9px] font-black text-emerald-700 shadow-2xs border border-emerald-100 flex items-center space-x-1">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            <span>In Stock</span>
                          </div>

                          {/* Best Offer Tag */}
                          {item.isBestOffer && (
                            <div className="absolute top-1.5 right-1.5 bg-[#FF5C38] px-1.5 py-0.5 rounded-md text-[8px] font-black text-white shadow-2xs flex items-center space-x-0.5">
                              <Star className="w-2.5 h-2.5 fill-white" />
                              <span>Deal</span>
                            </div>
                          )}

                          {/* Brand badge if not deal */}
                          {brandName && !item.isBestOffer && (
                            <div className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded-md text-[8px] font-bold text-white max-w-[45%] truncate">
                              {brandName}
                            </div>
                          )}
                        </div>

                        {/* Category & Brand Tags */}
                        <div className="flex items-center space-x-1 mb-1">
                          <span className="px-1.5 py-0.5 rounded bg-orange-100 text-[#FF7622] text-[8px] sm:text-[9px] font-black uppercase truncate max-w-[85px]">
                            {catName}
                          </span>
                          {brandName && (
                            <span className="text-[8px] sm:text-[9px] text-slate-400 font-semibold truncate max-w-[75px]">
                              {brandName}
                            </span>
                          )}
                        </div>

                        {/* Product Name */}
                        <h3 
                          onClick={() => onNavigate?.(`product/${navTargetId}`)}
                          className="font-black text-xs sm:text-sm text-[#181C2E] hover:text-[#FF7622] transition-colors cursor-pointer line-clamp-2 leading-tight"
                          title={item.name}
                        >
                          {item.name}
                        </h3>
                      </div>

                      {/* Price Row & Action Button */}
                      <div className="pt-2 border-t border-slate-100 mt-2 flex items-center justify-between">
                        <div>
                          <span className="text-xs sm:text-sm font-black text-[#18308C] block leading-tight">
                            {price > 0 ? `₹${price}` : 'In Store'}
                          </span>
                          {mrp > price && (
                            <span className="text-[9px] sm:text-[10px] text-slate-400 line-through">
                              ₹{mrp}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => onNavigate?.(`product/${navTargetId}`)}
                          className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-[#FF7622] text-white text-[10px] sm:text-xs font-black hover:bg-[#e06115] active:scale-95 transition-all shadow-2xs"
                        >
                          Details
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>
      </div>

    </div>
  );
};
