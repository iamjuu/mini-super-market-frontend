import React, { useState, useEffect } from 'react';
import {
  Palette,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Loader2,
  Trash2
} from 'lucide-react';
import ApiClient from '../../../api/client';
import { useAuth } from '../../../context/AuthContext';
import { usePlatform } from '../../../context/PlatformContext';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { compressImage } from '../../../utils/imageCompressor';

export const AppearanceSettings = () => {
  const { user } = useAuth();
  const isReadOnly = false;
  const { appearance, setAppearance, updateAppearance } = usePlatform();
  const [formData, setFormData] = useState({ ...appearance });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    setFormData({ ...appearance });
  }, [appearance]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleHeroImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingHero(true);
    try {
      const compressedBase64 = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.85,
      });

      const res = await ApiClient.post('/upload', {
        image: compressedBase64,
        folder: 'shamil_marketplace/hero',
      });

      const url = res?.data?.url || compressedBase64;
      setFormData((prev) => ({ ...prev, heroImageUrl: url }));
    } catch (err) {
      console.error('Failed to upload hero image:', err);
      setNotification({
        type: 'error',
        title: 'Upload failed',
        description: 'Could not upload hero image. Try again or paste a URL.',
      });
    } finally {
      setIsUploadingHero(false);
      e.target.value = '';
    }
  };

  const applyPreset = (primary, secondary) => {
    setFormData((prev) => ({
      ...prev,
      primaryThemeColor: primary,
      secondaryThemeColor: secondary,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setNotification(null);

    try {
      if (updateAppearance) {
        await updateAppearance(formData);
      } else {
        setAppearance(formData);
      }

      setNotification({
        type: 'success',
        title: 'Theme & Appearance Updated!',
        description: 'New Primary and Secondary colors are now active across the website and mobile app.',
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      setNotification({
        type: 'error',
        title: 'Notice',
        description: 'Applied locally to active session.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="theme-card p-6 space-y-3">
        <div className="flex items-center space-x-2">
          <span className="p-2 rounded-2xl bg-[#ece8ff] text-[#6339f4]">
            <Palette className="w-5 h-5" />
          </span>
          <h2 className="text-[14px] font-normal text-[#181829] tracking-tight">
            Platform Appearance & Global Branding
          </h2>
        </div>
        <p className="text-xs text-[#8a87a6]">
          Centralized styling, branding, and theme configuration. Changes dynamically propagate to both web and mobile client views.
        </p>

        {/* shadcn Alert Component */}
        {notification && (
          <Alert
            variant={notification.type === 'success' ? 'success' : 'destructive'}
            className="transition-all animate-in fade-in slide-in-from-top-2"
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <AlertTitle>{notification.title}</AlertTitle>
            <AlertDescription>{notification.description}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Settings */}
        <div className="lg:col-span-2 theme-card p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#6339f4] flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>General Platform Identity</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#181829]">Platform Name</label>
                  <input
                    type="text"
                    name="platformName"
                    value={formData.platformName || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#f0f2fb] border border-slate-200/80 text-xs text-[#181829] font-medium focus:outline-none focus:border-[#6339f4]"
                    placeholder="Virtual Dashboard Marketplace"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#181829]">Logo Image URL</label>
                  <input
                    type="text"
                    name="logoUrl"
                    value={formData.logoUrl || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#f0f2fb] border border-slate-200/80 text-xs text-[#181829] font-medium focus:outline-none focus:border-[#6339f4]"
                    placeholder="https://..."
                  />
                </div>

                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-[#181829]">Platform Tagline</label>
                  <input
                    type="text"
                    name="tagline"
                    value={formData.tagline || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#f0f2fb] border border-slate-200/80 text-xs text-[#181829] font-medium focus:outline-none focus:border-[#6339f4]"
                    placeholder="Premium baked snacks, crafted with heritage since 1991"
                  />
                </div>
              </div>
            </div>

            {/* Home Hero Image */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#18308c] flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>Home Hero Image</span>
                </h3>
                <span className="text-[10px] text-slate-400">Shows on storefront first section</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#FF7824] bg-[#f8f9fd] hover:bg-orange-50/50 cursor-pointer transition-all text-center group">
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-xs text-[#FF7824] mb-1.5 group-hover:scale-110 transition-transform">
                    {isUploadingHero ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#FF7824]" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-[#181829]">
                    {isUploadingHero ? 'Uploading...' : 'Upload Hero Image'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    Wide image recommended (1920×1080)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploadingHero || isReadOnly}
                    onChange={handleHeroImageUpload}
                    className="hidden"
                  />
                </label>

                <div className="flex flex-col justify-center space-y-1.5 p-3 rounded-2xl bg-[#f0f2fb] border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Or Direct Image URL
                  </span>
                  <input
                    type="url"
                    name="heroImageUrl"
                    value={formData.heroImageUrl || ''}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-[#181829] focus:outline-none focus:border-[#FF7824]"
                  />
                  {formData.heroImageUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, heroImageUrl: '' }))}
                      className="self-start flex items-center space-x-1 text-[10px] font-bold text-red-500 hover:text-red-600 mt-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear hero image</span>
                    </button>
                  )}
                </div>
              </div>

              {formData.heroImageUrl && (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-36 bg-slate-100">
                  <img
                    src={formData.heroImageUrl}
                    alt="Hero preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute bottom-2 left-3 text-[10px] font-black text-white uppercase tracking-wider">
                    Live hero preview
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#FF7824]">
                  Theme Color Customization (Primary &amp; Secondary Orange)
                </h3>
                <span className="text-[10px] text-slate-400">Controls website &amp; mobile app colors</span>
              </div>

              {/* Quick Preset Color Themes */}
              <div className="p-3 rounded-2xl bg-[#f0f2fb] border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                  Click a Preset Theme Palette:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset('#18308c', '#ff7824')}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-[#FF7824] text-xs font-bold text-slate-800 flex items-center space-x-1.5 transition-all shadow-2xs"
                  >
                    <span className="w-3 h-3 rounded-full bg-[#18308c] inline-block" />
                    <span className="w-3 h-3 rounded-full bg-[#ff7824] inline-block" />
                    <span>Al Salhiya Classic (Navy &amp; Orange)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('#181C2E', '#ff7622')}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-[#FF7824] text-xs font-bold text-slate-800 flex items-center space-x-1.5 transition-all shadow-2xs"
                  >
                    <span className="w-3 h-3 rounded-full bg-[#181C2E] inline-block" />
                    <span className="w-3 h-3 rounded-full bg-[#ff7622] inline-block" />
                    <span>White &amp; Radiant Orange</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('#6339f4', '#ff7622')}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-[#6339f4] text-xs font-bold text-slate-800 flex items-center space-x-1.5 transition-all shadow-2xs"
                  >
                    <span className="w-3 h-3 rounded-full bg-[#6339f4] inline-block" />
                    <span className="w-3 h-3 rounded-full bg-[#ff7622] inline-block" />
                    <span>Royal Purple &amp; Orange</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('#047857', '#f59e0b')}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-600 text-xs font-bold text-slate-800 flex items-center space-x-1.5 transition-all shadow-2xs"
                  >
                    <span className="w-3 h-3 rounded-full bg-[#047857] inline-block" />
                    <span className="w-3 h-3 rounded-full bg-[#f59e0b] inline-block" />
                    <span>Emerald &amp; Amber</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#181829]">Primary Brand Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      name="primaryThemeColor"
                      value={formData.primaryThemeColor || '#18308c'}
                      onChange={handleChange}
                      className="w-10 h-10 rounded-2xl bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      name="primaryThemeColor"
                      value={formData.primaryThemeColor || '#18308c'}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-2xl bg-[#f0f2fb] border border-slate-200/80 text-xs text-[#181829] font-mono font-bold uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#181829]">Secondary Accent (Orange)</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      name="secondaryThemeColor"
                      value={formData.secondaryThemeColor || '#ff7824'}
                      onChange={handleChange}
                      className="w-10 h-10 rounded-2xl bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      name="secondaryThemeColor"
                      value={formData.secondaryThemeColor || '#ff7824'}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-2xl bg-[#f0f2fb] border border-slate-200/80 text-xs text-[#181829] font-mono font-bold uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end items-center space-x-3">
              {isReadOnly ? (
                <span className="text-[11px] text-[#8a87a6] font-bold">
                  🔒 Branding changes are managed exclusively by Admins.
                </span>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-2xl bg-[#FF7824] hover:bg-[#e56312] text-white font-black text-xs shadow-lg shadow-[#FF7824]/30 flex items-center space-x-2 transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Publishing Updates...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Publish Branding Updates</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Live Preview Card */}
        <div className="theme-card p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-[#181829]">
              <Eye className="w-4 h-4 text-[#6339f4]" />
              <span>Live Theme Visualizer</span>
            </div>

            <div className="p-6 rounded-3xl bg-[#f0f2fb] space-y-4 text-center border border-slate-200/80">
              <div
                style={{ backgroundColor: formData.primaryThemeColor || '#6339f4' }}
                className="w-14 h-14 rounded-3xl mx-auto flex items-center justify-center text-white shadow-xl shadow-[#6339f4]/25 font-black text-xl"
              >
                {formData.platformName ? formData.platformName[0] : 'V'}
              </div>

              <div>
                <h4 className="font-black text-[#181829] text-base">{formData.platformName || 'Platform'}</h4>
                <p className="text-xs text-[#8a87a6] mt-1 leading-relaxed font-medium">
                  {formData.tagline || 'Marketplace Platform'}
                </p>
              </div>

              <div className="flex items-center justify-center space-x-2 pt-2">
                <div
                  style={{ backgroundColor: formData.primaryThemeColor || '#6339f4' }}
                  className="px-3.5 py-1 rounded-full text-[10px] font-black text-white shadow-md shadow-[#6339f4]/20"
                >
                  Primary Royal Purple
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#ece8ff] text-[11px] text-[#6339f4] font-semibold">
            Appearance configuration is decoupled from core order routing business logic.
          </div>
        </div>
      </div>
    </div>
  );
};
