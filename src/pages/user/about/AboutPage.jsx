import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Star,
  Building2,
  Truck,
  Package,
  Handshake
} from 'lucide-react';
import { usePlatform } from '../../../context/PlatformContext';

export const AboutPage = ({ onNavigate }) => {
  const { appearance } = usePlatform();
  const brandName = appearance?.platformName || 'Alfaysal Bakery';
  const brandTagline =
    appearance?.tagline ||
    'Premium baked snacks, crafted with heritage since 1991';
  const brandLogo = appearance?.logoUrl || '/al-salhiya-logo.jpg';
  const heroImage = appearance?.heroImageUrl || brandLogo;

  return (
    <div className="w-full bg-white font-sans selection:bg-[#FF7622]/20">
      
      {/* Hero Header */}
      <section className="bg-[#FFF9F5] py-16 lg:py-20 border-b border-orange-100/60">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-4">
          <span className="text-xs font-black uppercase tracking-widest text-[#FF7622]">
            About {brandName}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#1F2229] tracking-tight max-w-3xl mx-auto leading-tight">
            Supplying Premium Products to Supermarket Partners
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {brandName} is a manufacturing and wholesale company. We craft quality products
            and distribute them to supermarket chains and retail partners across Kuwait —
            not a consumer grocery or doorstep delivery service.
          </p>
        </div>
      </section>

      {/* Mission & Story */}
      <section className="py-16 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <span className="text-xs font-black uppercase tracking-wider text-[#FF7622]">
              Our Mission
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1F2229] leading-snug">
              From Our Production Lines to Your Supermarket Shelves
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              At {brandName}, we believe supermarket partners deserve reliable supply,
              consistent quality, and products built with tradition. {brandTagline}.
              Our catalog helps retailers browse, plan, and order the range we manufacture
              for wholesale distribution.
            </p>
            
            <div className="space-y-3 pt-2">
              {[
                'B2B wholesale supply for supermarket & retail chains',
                'Consistent quality from heritage manufacturing (Est. 1991)',
                'Nationwide Kuwait distribution to partner stores',
                'Full product catalog for retail buyers & category planners'
              ].map((item, idx) => (
                <div key={idx} className="flex items-center space-x-3 text-xs sm:text-sm font-bold text-stone-800">
                  <CheckCircle2 className="w-5 h-5 text-[#FF7622] shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <button 
                onClick={() => onNavigate?.('shop')}
                className="px-8 py-3.5 rounded-xl bg-[#FF7622] hover:bg-[#E56314] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#FF7622]/25 transition-all flex items-center space-x-2"
              >
                <span>Browse Product Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-stone-200/80 bg-[#0e1d4a] min-h-[280px] flex items-center justify-center">
              {appearance?.heroImageUrl ? (
                <img
                  src={heroImage}
                  alt={`${brandName} production`}
                  className="w-full h-full object-cover min-h-[280px]"
                />
              ) : (
                <div className="p-10 flex flex-col items-center gap-4 text-center">
                  <img
                    src={brandLogo}
                    alt={brandName}
                    className="w-28 h-28 object-contain rounded-2xl bg-white p-2"
                  />
                  <p className="text-white/80 text-xs font-semibold max-w-xs">
                    Manufacturing · Wholesale · Supermarket Supply
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How we work with supermarket partners */}
      <section className="py-14 bg-[#FFF9F5] border-t border-b border-orange-100/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10 space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-[#FF7622]">
              B2B Partnership
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#1F2229]">
              Built for Supermarket Buyers
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Package, title: 'Product Range', desc: 'Browse our full wholesale catalog by category and brand.' },
              { icon: Building2, title: 'Retail Ready', desc: 'Packaging and SKUs designed for supermarket shelves.' },
              { icon: Truck, title: 'Distribution', desc: 'Reliable supply across Kuwait to partner stores.' },
              { icon: Handshake, title: 'Long-term Supply', desc: 'Stable partnerships with consistent product quality.' },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="bg-white rounded-2xl border border-orange-100/80 p-5 text-left space-y-3 shadow-xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF7622] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-black text-[#1F2229]">{card.title}</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="py-14 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { num: '1991', label: 'Heritage Since' },
            { num: '100+', label: 'Unique Products' },
            { num: 'Kuwait', label: 'Nationwide Supply' },
            { num: 'B2B', label: 'Supermarket Partners' }
          ].map((stat, idx) => (
            <div key={idx} className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-[#FF7622] font-mono">
                {stat.num}
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Partner Testimonials */}
      <section className="py-16 max-w-7xl mx-auto px-6 sm:px-8 text-center space-y-10">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-[#FF7622]">
            What Our Partners Say
          </span>
          <h3 className="text-3xl font-black text-[#1F2229] mt-1">
            Trusted by Retail Buyers
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {[
            {
              name: 'Category Manager',
              role: 'Regional Supermarket Chain',
              quote: `${brandName} keeps our snack aisle stocked with consistent quality and reliable wholesale delivery schedules.`,
              rating: 5
            },
            {
              name: 'Procurement Lead',
              role: 'Retail Buying Office',
              quote: 'Clear catalog, stable SKUs, and heritage branding that customers recognize on our shelves.',
              rating: 5
            },
            {
              name: 'Store Operations',
              role: 'Multi-branch Retailer',
              quote: 'A dependable manufacturing partner — products arrive retail-ready for supermarket display.',
              rating: 5
            }
          ].map((rev, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-4">
              <div className="flex items-center space-x-1">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                "{rev.quote}"
              </p>
              <div>
                <h4 className="font-extrabold text-xs text-stone-800">{rev.name}</h4>
                <span className="text-[11px] text-slate-400 font-semibold">{rev.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
