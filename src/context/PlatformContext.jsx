import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiClient from '../api/client';

const PlatformContext = createContext(null);

const DEFAULT_APPEARANCE = {
  platformName: 'Alfaysal Bakery',
  tagline: 'Premium baked snacks, crafted with heritage since 1991',
  logoUrl: '/al-salhiya-logo.jpg',
  heroImageUrl: '',
  primaryThemeColor: '#18308c',
  secondaryThemeColor: '#ff7824',
  accentGold: '#ffba18',
};

export const PlatformProvider = ({ children }) => {
  const [appearance, setAppearance] = useState(() => {
    try {
      const stored = localStorage.getItem('app_appearance');
      if (stored) return { ...DEFAULT_APPEARANCE, ...JSON.parse(stored) };
    } catch (_) {}
    return DEFAULT_APPEARANCE;
  });

  const [settings, setSettings] = useState({
    openingTime: '07:00 AM',
    closingTime: '10:00 PM',
    timezone: 'Asia/Kolkata',
    acceptOrdersGlobally: true,
    baseDeliveryFee: 30,
    freeDeliveryThreshold: 499,
  });

  const [featureFlags, setFeatureFlags] = useState({
    customer_wallet: true,
    live_gps_broadcasting: true,
    razorpay_gateway: true,
    continuous_audio_alarm: true,
    doorstep_otp_required: true,
  });

  const [loading, setLoading] = useState(true);

  // Dynamic CSS Variable Injection into :root as specified in frontend.md
  useEffect(() => {
    const primary = appearance?.primaryThemeColor || appearance?.primaryColor || '#18308c';
    const secondary = appearance?.secondaryThemeColor || appearance?.accentOrange || '#ff7824';

    document.documentElement.style.setProperty('--primary', primary);
    document.documentElement.style.setProperty('--primary-hover', appearance.primaryHover || `${primary}e6`);
    document.documentElement.style.setProperty('--primary-light', appearance.primaryLight || `${primary}1a`);
    document.documentElement.style.setProperty('--accent-orange', secondary);
    document.documentElement.style.setProperty('--accent-orange-hover', `${secondary}e6`);
    document.documentElement.style.setProperty('--brand-orange', secondary);

    // Sync browser tab favicon and title with supermarket branding
    const iconUrl = appearance?.logoUrl || '/al-salhiya-logo.jpg';
    const favicons = document.querySelectorAll("link[rel*='icon']");
    favicons.forEach((el) => {
      el.href = iconUrl;
    });

    if (appearance?.platformName) {
      document.title = `${appearance.platformName} — Digital Supermarket Catalog (الصالحية)`;
    }

    try {
      localStorage.setItem('app_appearance', JSON.stringify(appearance));
    } catch (_) {}
  }, [appearance]);

  const updateAppearance = async (newConfig) => {
    const merged = { ...appearance, ...newConfig };
    setAppearance(merged);
    try {
      localStorage.setItem('app_appearance', JSON.stringify(merged));
      await ApiClient.patch('/master-admin/appearance', merged).catch(() => {});
    } catch (_) {}
  };

  const fetchPlatformConfig = async () => {
    try {
      const [appRes, setRes, featRes] = await Promise.all([
        ApiClient.get('/public/appearance').catch(() => ({ data: appearance })),
        ApiClient.get('/public/settings').catch(() => ({ data: settings })),
        ApiClient.get('/public/features').catch(() => ({ data: featureFlags })),
      ]);

      if (appRes?.data) setAppearance((prev) => ({ ...prev, ...appRes.data }));
      if (setRes?.data) setSettings((prev) => ({ ...prev, ...setRes.data }));
      if (featRes?.data) setFeatureFlags((prev) => ({ ...prev, ...featRes.data }));
    } catch (err) {
      console.error('Error loading platform config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatformConfig();
  }, []);

  return (
    <PlatformContext.Provider
      value={{
        appearance,
        setAppearance,
        updateAppearance,
        settings,
        setSettings,
        featureFlags,
        setFeatureFlags,
        reloadPlatformConfig: fetchPlatformConfig,
        loading,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
};
