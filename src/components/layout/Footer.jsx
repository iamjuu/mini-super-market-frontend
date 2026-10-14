import React, { useEffect, useState } from 'react';
import { 
  Facebook, 
  Instagram, 
  Linkedin, 
  ArrowUp 
} from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import ApiClient from '../../api/client';

export const Footer = ({ onNavigate }) => {
  const { appearance } = usePlatform();
  const brandName = appearance?.platformName || 'Alfaysal Bakery';
  const brandLogo = appearance?.logoUrl || '/al-salhiya-logo.jpg';
  const brandTagline =
    appearance?.tagline ||
    'Premium products manufactured for supermarket partners since 1991.';

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let mounted = true;
    ApiClient.get('/categories')
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res?.data)
          ? res.data
          : (res?.data?.data || res || []);
        setCategories(Array.isArray(list) ? list.filter((c) => c?.name) : []);
      })
      .catch(() => {
        if (mounted) setCategories([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { label: 'Home', route: 'home' },
    { label: 'Product Catalog', route: 'shop' },
    { label: 'Our Story', route: 'about' },
    { label: 'Media', route: 'news' },
    { label: 'Contact', route: 'contact' },
  ];

  // Show a clean subset in the footer (avoid huge lists)
  const footerCategories = categories.slice(0, 8);

  return (
    <footer className="bg-[#181C2E] border-t border-stone-800 text-stone-300 relative z-20 font-sans pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-12 sm:pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 items-start text-left">
          
          {/* Column 1: Brand Logo & Tagline */}
          <div className="space-y-4">
            <div 
              onClick={() => {
                onNavigate?.('home');
                scrollToTop();
              }}
              className="w-36 h-20 bg-white rounded-2xl border border-stone-700/60 shadow-2xs flex items-center justify-center p-2.5 overflow-hidden cursor-pointer hover:border-stone-500 transition-all"
              title={brandName}
            >
              <img 
                src={brandLogo} 
                alt={brandName} 
                className="h-full w-auto object-contain"
              />
            </div>
            <p className="text-xs sm:text-[13px] text-stone-400 leading-relaxed max-w-[220px]">
              {brandTagline}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3.5">
            <h4 className="text-sm font-bold text-white tracking-tight">
              Quick links
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-[13px] text-stone-400 font-normal">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => {
                      onNavigate?.(link.route);
                      scrollToTop();
                    }}
                    className="hover:text-[#FF7622] transition-colors cursor-pointer text-left block"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Live Categories from API */}
          <div className="space-y-3.5">
            <h4 className="text-sm font-bold text-white tracking-tight">
              Categories
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-[13px] text-stone-400 font-normal">
              {footerCategories.length > 0 ? (
                footerCategories.map((cat) => (
                  <li key={cat._id || cat.name}>
                    <button
                      onClick={() => {
                        onNavigate?.('shop');
                        scrollToTop();
                      }}
                      className="hover:text-[#FF7622] transition-colors cursor-pointer text-left block"
                    >
                      {cat.name}
                    </button>
                  </li>
                ))
              ) : (
                <li>
                  <button
                    onClick={() => {
                      onNavigate?.('shop');
                      scrollToTop();
                    }}
                    className="hover:text-[#FF7622] transition-colors cursor-pointer text-left block"
                  >
                    View all products
                  </button>
                </li>
              )}
              {categories.length > 8 && (
                <li>
                  <button
                    onClick={() => {
                      onNavigate?.('shop');
                      scrollToTop();
                    }}
                    className="text-[#FF7622] hover:text-orange-300 transition-colors cursor-pointer text-left block font-semibold"
                  >
                    View all →
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Column 4: Get in touch */}
          <div className="space-y-3.5">
            <h4 className="text-sm font-bold text-white tracking-tight">
              Get in touch
            </h4>
            <div className="space-y-2 text-xs sm:text-[13px] text-stone-400">
              <p>
                <a 
                  href="tel:+96524739900" 
                  className="hover:text-[#FF7622] transition-colors"
                >
                  +965 24739900
                </a>
              </p>
              <p>
                <a 
                  href="mailto:info@alfaysalgroup.com" 
                  className="hover:text-[#FF7622] transition-colors"
                >
                  info@alfaysalgroup.com
                </a>
              </p>
              
              {/* Social Icons */}
              <div className="flex items-center space-x-3.5 pt-2 text-stone-300">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-[#FF7622] transition-colors"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4 fill-current stroke-none" />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-[#FF7622] transition-colors"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-[#FF7622] transition-colors"
                  title="LinkedIn"
                >
                  <Linkedin className="w-4 h-4 fill-current stroke-none" />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar with Scroll-to-Top Action Button */}
        <div className="mt-12 pt-6 border-t border-stone-800 flex items-center justify-between">
          <p className="text-[11px] text-stone-500">
            © {new Date().getFullYear()} {brandName}. All rights reserved.
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            className="w-10 h-10 rounded-full bg-[#272052] hover:bg-[#342b6d] text-white flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
            title="Scroll to top"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};
