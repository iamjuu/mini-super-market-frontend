import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlatformProvider } from './context/PlatformContext';
import { CartProvider } from './context/CartContext';
import { Login } from './pages/auth/Login';

// User / Customer Components
import { UserLayout } from './components/layout/UserLayout';
import { UserDashboard } from './pages/user/dashboard/Dashboard';
import { AboutPage } from './pages/user/about/AboutPage';
import { ShopCatalogPage } from './pages/user/shop/ShopCatalogPage';
import { NewsPage } from './pages/user/news/NewsPage';
import { ContactPage } from './pages/user/contact/ContactPage';
import { UserProfilePage } from './pages/user/profile/UserProfilePage';
import { ProductDetailPage } from './pages/user/product/ProductDetailPage';

// Operations & Catalog Admin Components
import { AdminRoutes } from './pages/admin';

const AdminRouter = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  
  // URL pathname sync: supports /admin/*, /login, /about, /shop, /news, /contact, /profile, /orders, /product/:id, /
  const getRouteFromUrl = () => {
    if (typeof window === 'undefined') return 'home';
    const path = window.location.pathname.replace(/^\/+/, '');

    // 1. Check if path is a dedicated admin route (e.g. /admin, /admin/dashboard, etc.)
    if (path === 'admin' || path === 'admin/') {
      return 'admin/dashboard';
    }
    if (path.startsWith('admin/')) {
      return path;
    }
    if (path.toLowerCase() === 'dashboard') {
      return 'admin/dashboard';
    }

    const validRoutes = ['login', 'about', 'shop', 'news', 'contact', 'profile', 'orders', 'home'];
    if (validRoutes.includes(path.toLowerCase())) return path.toLowerCase();
    if (path.toLowerCase().startsWith('product/')) return path;
    if (path.toLowerCase() === 'product') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      if (id) return `product/${id}`;
      return 'product/prod-chk-2';
    }
    if (window.location.hash) {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash === 'admin' || hash === 'admin/' || hash.toLowerCase() === 'dashboard') return 'admin/dashboard';
      if (hash.startsWith('admin/')) return hash;
      if (validRoutes.includes(hash.toLowerCase())) return hash.toLowerCase();
      if (hash.toLowerCase().startsWith('product/')) return hash;
    }
    return 'home';
  };

  const [currentRoute, setCurrentRoute] = useState(getRouteFromUrl);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(getRouteFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (route, params) => {
    let targetRoute = route;
    if (params?.id) {
      targetRoute = `product/${params.id}`;
    }
    
    // Normalize targetRoute if admin navigates to dashboard
    if (targetRoute === 'admin') {
      targetRoute = 'admin/dashboard';
    }

    setCurrentRoute(targetRoute);
    if (typeof window !== 'undefined') {
      if (targetRoute === 'login') {
        window.history.pushState(null, '', '/login');
      } else if (targetRoute === 'home') {
        window.history.pushState(null, '', '/');
      } else if (targetRoute === 'dashboard') {
        if (user?.role === 'ADMIN' || user?.isUser === 'admin') {
          targetRoute = 'admin/dashboard';
          setCurrentRoute('admin/dashboard');
          window.history.pushState(null, '', '/admin/dashboard');
        } else {
          window.history.pushState(null, '', '/');
        }
      } else {
        window.history.pushState(null, '', `/${targetRoute}`);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Only two roles: 'admin' and 'customer'
  const isUserType = (user?.role === 'ADMIN' || user?.isUser === 'admin') ? 'admin' : 'customer';

  // Auto-redirect authenticated users away from /login to their appropriate role portal
  useEffect(() => {
    if (isAuthenticated) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname.replace(/^\/+/, '') : '';
      if (currentRoute === 'login' || currentPath === 'login') {
        if (isUserType === 'admin') {
          navigateTo('admin/dashboard');
        } else {
          navigateTo('home');
        }
      }
    }
  }, [isAuthenticated, isUserType, currentRoute]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center text-slate-500 text-xs">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#FF7622] border-t-transparent animate-spin"></div>
          <p className="font-semibold text-slate-700">Authenticating Session...</p>
        </div>
      </div>
    );
  }

  // Renders customer pages based on route
  const renderUserContent = () => {
    if (currentRoute.startsWith('product/')) {
      const productId = currentRoute.substring('product/'.length);
      return <ProductDetailPage productId={productId} onNavigate={navigateTo} />;
    }
    if (currentRoute === 'product') {
      return <ProductDetailPage productId="prod-chk-2" onNavigate={navigateTo} />;
    }

    switch (currentRoute) {
      case 'about':
        return <AboutPage onNavigate={navigateTo} />;
      case 'shop':
        return <ShopCatalogPage onNavigate={navigateTo} />;
      case 'news':
        return <NewsPage onNavigate={navigateTo} />;
      case 'contact':
        return <ContactPage onNavigate={navigateTo} />;
      case 'profile':
        return <UserProfilePage key="profile" initialTab="profile" onNavigate={navigateTo} />;
      case 'orders':
        return <UserProfilePage key="orders" initialTab="orders" onNavigate={navigateTo} />;
      case 'home':
      case 'dashboard':
      default:
        return <UserDashboard key={refreshKey} onNavigate={navigateTo} />;
    }
  };

  const renderCurrentPortal = () => {
    // 1. Explicit login route
    if (currentRoute === 'login') {
      return <Login onBackToHome={() => navigateTo('home')} />;
    }

    // 2. ADMIN PORTAL: Only rendered when visiting dedicated admin routes (/admin, /admin/dashboard, etc.)
    const isAdminRoute = currentRoute === 'admin' || currentRoute.startsWith('admin/');
    if (isAdminRoute) {
      if (!isAuthenticated || isUserType !== 'admin') {
        return <Login onBackToHome={() => navigateTo('home')} />;
      }

      return (
        <AdminRoutes
          currentRoute={currentRoute}
          onNavigate={navigateTo}
          onRefresh={handleRefresh}
          refreshKey={refreshKey}
          renderUserContent={renderUserContent}
        />
      );
    }

    // 3. Fallback for profile / orders (no user login needed, route to home)
    if (currentRoute === 'profile' || currentRoute === 'orders') {
      return (
        <UserLayout
          currentRoute="home"
          onRouteChange={navigateTo}
          onRefresh={handleRefresh}
        >
          <UserDashboard key={refreshKey} onNavigate={navigateTo} />
        </UserLayout>
      );
    }

    // 4. Default / Initial / Storefront Home Portal (UserLayout)
    return (
      <UserLayout
        currentRoute={currentRoute}
        onRouteChange={navigateTo}
        onRefresh={handleRefresh}
      >
        {renderUserContent()}
      </UserLayout>
    );

    // Fallback
    return (
      <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-md space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF7622] mx-auto flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#181C2E]">Unknown User Role</h2>
          <p className="text-xs text-[#646982] leading-relaxed">
            Your authenticated role is <code className="text-[#FF7622] font-bold">{user?.role}</code>.
          </p>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-[#FF7622] hover:bg-[#E56314] text-xs font-bold text-white transition-all shadow-md"
          >
            Sign In Again
          </button>
        </div>
      </div>
    );
  };

  return renderCurrentPortal();
};

export default function App() {
  return (
    <AuthProvider>
      <PlatformProvider>
        <CartProvider>
          <AdminRouter />
        </CartProvider>
      </PlatformProvider>
    </AuthProvider>
  );
}
