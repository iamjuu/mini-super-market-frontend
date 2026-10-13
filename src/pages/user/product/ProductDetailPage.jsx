import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Share2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import ApiClient from '../../../api/client';
import { cn } from '../../../lib/utils';

// Helper to remove weight/quantity like (500g), (1kg), - 500g, etc.
const cleanProductName = (name = '') => {
  if (!name) return '';
  return name
    .replace(/\s*\(\s*\d+(\.\d+)?\s*(g|kg|gm|gms|ml|l|ltr|pcs|pc|pack|units?|oz|lb)\s*\)/gi, '')
    .replace(/\s*[-–—]\s*\d+(\.\d+)?\s*(g|kg|gm|gms|ml|l|ltr|pcs|pc|pack)\b/gi, '')
    .trim();
};

export const ProductDetailPage = ({ productId = 'prod-chk-2', onNavigate }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [sameCategoryProducts, setSameCategoryProducts] = useState([]);

  // Fetch product from DB dynamically
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadProduct = async () => {
      try {
        let dbItem = null;
        try {
          const res = await ApiClient.get(`/products/${productId}`);
          if (res?.data) dbItem = res.data;
        } catch (e) {
          const searchRes = await ApiClient.get('/products', { search: productId });
          const items = Array.isArray(searchRes.data) ? searchRes.data : searchRes.data?.products || [];
          dbItem = items.find((p) => p.slug === productId || p._id === productId) || items[0];
        }

        if (!isMounted) return;

        if (dbItem) {
          const formatted = {
            id: dbItem._id,
            _id: dbItem._id,
            slug: dbItem.slug,
            name: dbItem.name,
            category: (dbItem.categoryId?.name || dbItem.categoryName || 'GENERAL').toUpperCase(),
            categoryLabel: dbItem.categoryId?.name || dbItem.categoryName || 'General',
            subcategoryName: dbItem.subcategoryId?.name || dbItem.subcategoryName || '',
            brandName: dbItem.brandId?.name || dbItem.brandName || '',
            shopName: dbItem.shopName || dbItem.shopId?.name || 'Al Salhiya Supermarket',
            price: Number(dbItem.price) || 0,
            originalPrice: Number(dbItem.mrp) || Number(dbItem.price) * 1.25,
            discount: dbItem.mrp && dbItem.mrp > dbItem.price 
              ? `-${Math.round(((dbItem.mrp - dbItem.price) / dbItem.mrp) * 100)}%` 
              : null,
            inStock: dbItem.inStock !== false,
            weight: dbItem.unit ? `1 ${dbItem.unit}` : '1 Kg',
            origin: dbItem.origin || 'Farm Fresh Daily Harvest',
            image: dbItem.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
            gallery: dbItem.gallery?.length ? dbItem.gallery : [dbItem.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80'],
            description: dbItem.description || 'Fresh, high-grade produce carefully inspected and stocked daily at Al Salhiya Supermarket.',
          };

          setProduct(formatted);
          setSelectedImage(formatted.image);

          // Fetch recommended products and same category products
          try {
            const allRes = await ApiClient.get('/products');
            const allList = Array.isArray(allRes.data) ? allRes.data : allRes.data?.products || [];
            const catId = dbItem.categoryId?._id || dbItem.categoryId;
            const currentCatName = (dbItem.categoryId?.name || dbItem.categoryName || '').toLowerCase();

            // 1. Same category products
            const sameCat = allList
              .filter((p) => {
                if (p._id === dbItem._id) return false;
                const pCatId = typeof p.categoryId === 'object' ? p.categoryId?._id : p.categoryId;
                const pCatName = (p.categoryName || (typeof p.categoryId === 'object' ? p.categoryId?.name : '') || '').toLowerCase();
                return (catId && pCatId === catId) || (currentCatName && pCatName === currentCatName);
              })
              .slice(0, 4)
              .map((p) => ({
                id: p._id,
                _id: p._id,
                name: p.name,
                category: (p.categoryId?.name || p.categoryName || 'GENERAL').toUpperCase(),
                categoryName: (p.categoryId?.name || p.categoryName || 'General').toUpperCase(),
                brandName: p.brandName || (typeof p.brandId === 'object' ? p.brandId?.name : '') || '',
                price: Number(p.price) || 0,
                originalPrice: Number(p.mrp) || Number(p.price) * 1.25,
                discount: p.mrp && p.mrp > p.price ? `-${Math.round(((p.mrp - p.price) / p.mrp) * 100)}%` : null,
                image: p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
                description: p.description,
              }));
            setSameCategoryProducts(sameCat);

            // 2. Recommended products
            const recCandidates = allList.filter((p) => p._id !== dbItem._id);
            const bestOffers = recCandidates.filter(p => p.isBestOffer);
            const otherItems = recCandidates.filter(p => !p.isBestOffer);
            const combinedRec = [...bestOffers, ...otherItems].slice(0, 4).map((p) => ({
              id: p._id,
              _id: p._id,
              name: p.name,
              category: (p.categoryId?.name || p.categoryName || 'GENERAL').toUpperCase(),
              categoryName: (p.categoryId?.name || p.categoryName || 'General').toUpperCase(),
              brandName: p.brandName || (typeof p.brandId === 'object' ? p.brandId?.name : '') || '',
              price: Number(p.price) || 0,
              originalPrice: Number(p.mrp) || Number(p.price) * 1.25,
              discount: p.mrp && p.mrp > p.price ? `-${Math.round(((p.mrp - p.price) / p.mrp) * 100)}%` : null,
              image: p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
              description: p.description,
            }));
            setRecommendedProducts(combinedRec);
          } catch (relErr) {
            console.error('Failed to load related products:', relErr);
          }
        }
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      isMounted = false;
    };
  }, [productId]);

  // Multi-angle gallery images (always provides 3 preview photos)
  const galleryImages = useMemo(() => {
    if (!product) return [];
    if (product.gallery && product.gallery.length >= 3) {
      return product.gallery.slice(0, 3);
    }
    const main = product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80';
    if (product.gallery && product.gallery.length === 2) {
      return [product.gallery[0], product.gallery[1], main];
    }
    const cat = (product.categoryLabel || product.category || '').toLowerCase();
    let alt1 = main;
    let alt2 = main;

    if (cat.includes('fruit') || cat.includes('veg') || cat.includes('orange') || cat.includes('apple') || cat.includes('produce') || cat.includes('broccoli')) {
      alt1 = 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&auto=format&fit=crop&q=80';
      alt2 = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80';
    } else if (cat.includes('dairy') || cat.includes('milk') || cat.includes('egg') || cat.includes('cheese')) {
      alt1 = 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80';
      alt2 = 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=80';
    } else if (cat.includes('meat') || cat.includes('chicken') || cat.includes('poultry') || cat.includes('beef')) {
      alt1 = 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500&auto=format&fit=crop&q=80';
      alt2 = 'https://images.unsplash.com/photo-1551028150-64b9f398f678?w=500&auto=format&fit=crop&q=80';
    } else {
      alt1 = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80';
      alt2 = 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&auto=format&fit=crop&q=80';
    }

    return [main, alt1, alt2];
  }, [product]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#FF7622] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Loading catalog item...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <AlertCircle className="w-10 h-10 text-[#FF7622] mx-auto" />
          <h2 className="text-base font-black text-slate-900">Product Not Found</h2>
          <p className="text-xs text-slate-500">This catalog item is currently unavailable.</p>
          <button
            onClick={() => onNavigate?.('home')}
            className="px-4 py-2 rounded-xl bg-[#FF7622] text-white text-xs font-bold"
          >
            Back to Supermarket
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#181C2E] font-sans pb-28">
      {/* Copied Link Toast */}
      {copiedLink && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#181C2E] text-white px-4 py-2 rounded-full shadow-xl text-xs font-bold animate-in fade-in duration-150">
          ✓ Link copied to clipboard
        </div>
      )}

      {/* 1. Sleek Mobile Top Navigation Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-2xs">
        <div className="max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => onNavigate?.('home')}
            className="flex items-center space-x-1.5 text-xs font-black text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 px-3 py-1.5 rounded-full transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <span className="text-[11px] font-black uppercase tracking-wider text-[#FF7622] bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
            {product.categoryLabel || product.category}
          </span>

          <button
            onClick={handleShare}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center text-slate-700 transition-all"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-7xl mx-auto px-4 pt-4 space-y-6">
        
        {/* =============================================================
            2 & 3. CLEAN PRODUCT SHOWCASE & INFORMATION (Desktop 2-Col Split)
           ============================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-start">
          
          {/* LEFT: Product Image Showcase & 3-Angle Gallery (md:col-span-7) */}
          <div className="md:col-span-7 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
            <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 items-stretch">
              
              {/* Thumbnail Rail */}
              {galleryImages.length > 1 && (
                <div className="order-2 sm:order-1 flex sm:flex-col gap-2.5 shrink-0 justify-start overflow-x-auto sm:overflow-visible pb-1 sm:pb-0">
                  {galleryImages.map((imgUrl, idx) => {
                    const isActive = selectedImage === imgUrl;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImage(imgUrl)}
                        className={cn(
                          "w-16 h-16 sm:w-20 sm:h-20 aspect-square rounded-xl overflow-hidden bg-slate-50 border-2 transition-all duration-200 p-0.5 relative group cursor-pointer shrink-0 flex items-center justify-center",
                          isActive 
                            ? "border-[#FF7622] ring-2 ring-[#FF7622]/20 shadow-xs" 
                            : "border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100"
                        )}
                        title={`View photo ${idx + 1}`}
                      >
                        <img
                          src={imgUrl}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Main Hero Preview Display */}
              <div className="order-1 sm:order-2 flex-1 relative aspect-square sm:aspect-[4/3] rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center group">
                <img
                  key={selectedImage}
                  src={selectedImage}
                  alt={cleanProductName(product.name)}
                  className="w-full h-full object-contain p-3 sm:p-6 transition-all duration-300 group-hover:scale-105"
                />
              </div>

            </div>
          </div>

          {/* RIGHT: Product Details (Clean, Minimal, Non-AI) */}
          <div className="md:col-span-5 bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs space-y-4 md:sticky md:top-20 text-left">
            {/* Product Title (Without quantity) */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 leading-snug tracking-tight">
              {cleanProductName(product.name)}
            </h1>

            {/* Price Row */}
            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                ₹{Number(product.price).toFixed(2)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-sm sm:text-base text-slate-400 line-through font-normal">
                  ₹{Number(product.originalPrice).toFixed(2)}
                </span>
              )}
              {product.discount && (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  {String(product.discount).replace(/^-+/, '')} OFF
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {product.description}
                </p>
              </div>
            )}
          </div>

        </div>

        {/* =============================================================
            4. RECOMMENDED PRODUCTS (Clean Grid matching Home Card style)
           ============================================================= */}
        {recommendedProducts.length > 0 && (
          <div className="pt-4 text-left space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Recommended Products
              </h3>
              <button
                onClick={() => onNavigate?.('home')}
                className="text-xs font-bold text-[#FF7622] hover:underline"
              >
                View All →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {recommendedProducts.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full group"
                >
                  <div className="flex-1 flex flex-col">
                    {/* Product Image Frame */}
                    <div 
                      onClick={() => {
                        onNavigate?.(`product/${item.id}`);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="relative rounded-xl overflow-hidden bg-slate-100 h-36 sm:h-44 w-full flex items-center justify-center cursor-pointer mb-2 shrink-0 group-hover:scale-[1.01] transition-transform"
                    >
                      <img
                        src={item.image}
                        alt={cleanProductName(item.name)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* In-Stock Badge */}
                      <div className="absolute top-1.5 left-1.5 bg-white/95 backdrop-blur-xs px-1.5 py-0.5 rounded-md text-[8px] font-bold text-emerald-700 shadow-2xs border border-emerald-100 flex items-center space-x-1">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        <span>In Stock</span>
                      </div>
                    </div>

                    {/* Category Tag */}
                    <div className="flex items-center space-x-1 mb-1">
                      <span className="px-1.5 py-0.5 rounded bg-orange-100 text-[#FF7622] text-[8px] font-bold uppercase truncate max-w-[80px]">
                        {item.categoryName || item.category || 'General'}
                      </span>
                      {item.brandName && (
                        <span className="text-[8px] text-slate-400 font-medium truncate max-w-[70px]">
                          {item.brandName}
                        </span>
                      )}
                    </div>

                    {/* Product Name */}
                    <h4 
                      onClick={() => {
                        onNavigate?.(`product/${item.id}`);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="font-bold text-xs sm:text-sm text-slate-900 hover:text-[#FF7622] transition-colors cursor-pointer line-clamp-2 leading-snug"
                      title={cleanProductName(item.name)}
                    >
                      {cleanProductName(item.name)}
                    </h4>
                  </div>

                  {/* Bottom Row: Price & Details Action */}
                  <div className="pt-2 border-t border-slate-100 mt-2 flex items-center justify-between gap-1.5">
                    <div className="min-w-0 flex-1">
                      <span className="text-xs sm:text-sm font-bold text-[#18308C] leading-none block truncate">
                        {item.price ? `₹${Number(item.price).toFixed(2)}` : 'In Store'}
                      </span>
                      {item.originalPrice > item.price && (
                        <span className="text-[10px] text-slate-400 line-through leading-none block mt-0.5">
                          ₹{Number(item.originalPrice).toFixed(2)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        onNavigate?.(`product/${item.id}`);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-[#FF7622] text-white text-[10px] sm:text-xs font-bold hover:bg-[#e06115] active:scale-95 transition-all shadow-2xs whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =============================================================
            5. RELATED PRODUCTS (Same Category Grid)
           ============================================================= */}
        {sameCategoryProducts.length > 0 && (
          <div className="pt-4 text-left space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Related Products
              </h3>
              <button
                onClick={() => onNavigate?.('home')}
                className="text-xs font-bold text-[#FF7622] hover:underline"
              >
                View Category →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {sameCategoryProducts.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full group"
                >
                  <div className="flex-1 flex flex-col">
                    {/* Product Image Frame */}
                    <div 
                      onClick={() => {
                        onNavigate?.(`product/${item.id}`);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="relative rounded-xl overflow-hidden bg-slate-100 h-36 sm:h-44 w-full flex items-center justify-center cursor-pointer mb-2 shrink-0 group-hover:scale-[1.01] transition-transform"
                    >
                      <img
                        src={item.image}
                        alt={cleanProductName(item.name)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* In-Stock Badge */}
                      <div className="absolute top-1.5 left-1.5 bg-white/95 backdrop-blur-xs px-1.5 py-0.5 rounded-md text-[8px] font-bold text-emerald-700 shadow-2xs border border-emerald-100 flex items-center space-x-1">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        <span>In Stock</span>
                      </div>
                    </div>

                    {/* Category Tag */}
                    <div className="flex items-center space-x-1 mb-1">
                      <span className="px-1.5 py-0.5 rounded bg-orange-100 text-[#FF7622] text-[8px] font-bold uppercase truncate max-w-[80px]">
                        {item.categoryName || item.category || 'General'}
                      </span>
                      {item.brandName && (
                        <span className="text-[8px] text-slate-400 font-medium truncate max-w-[70px]">
                          {item.brandName}
                        </span>
                      )}
                    </div>

                    {/* Product Name */}
                    <h4 
                      onClick={() => {
                        onNavigate?.(`product/${item.id}`);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="font-bold text-xs sm:text-sm text-slate-900 hover:text-[#FF7622] transition-colors cursor-pointer line-clamp-2 leading-snug"
                      title={cleanProductName(item.name)}
                    >
                      {cleanProductName(item.name)}
                    </h4>
                  </div>

                  {/* Bottom Row: Price & Details Action */}
                  <div className="pt-2 border-t border-slate-100 mt-2 flex items-center justify-between gap-1.5">
                    <div className="min-w-0 flex-1">
                      <span className="text-xs sm:text-sm font-bold text-[#18308C] leading-none block truncate">
                        {item.price ? `₹${Number(item.price).toFixed(2)}` : 'In Store'}
                      </span>
                      {item.originalPrice > item.price && (
                        <span className="text-[10px] text-slate-400 line-through leading-none block mt-0.5">
                          ₹{Number(item.originalPrice).toFixed(2)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        onNavigate?.(`product/${item.id}`);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-[#FF7622] text-white text-[10px] sm:text-xs font-bold hover:bg-[#e06115] active:scale-95 transition-all shadow-2xs whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
