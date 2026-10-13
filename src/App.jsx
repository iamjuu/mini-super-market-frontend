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

// Error Experience Components
import { NotFoundPage, ServerErrorPage, ErrorBoundary } from './pages/error';

const AdminRouter = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  
  // URL pathname sync: supports /admin/*, /login, /about, /shop, /news, /contact, /profile, /orders, /product/:id, /404, /500, /
  const getRouteFromUrl = () => {
    if (typeof window === 'undefined') return 'home';
    const path = window.location.pathname.replace(/^\/+/, '');

    // 0. Dedicated testing routes for error pages
    if (path === '404' || path === 'not-found') return '404';
    if (path === '500' || path === 'server-error') return '500';

    // 1. Root storefront home
    if (!path || path === '') return 'home';

    // 2. Strict Dedicated Administrator Login Route:
    // ONLY display the login page when entering properly the complete URL: admin/dashboard/login-admin
    const cleanPath = path.toLowerCase().replace(/\/+$/, '');
    if (cleanPath === 'admin/dashboard/login-admin') {
      return 'login';
    }

    // 3. Dedicated admin operational routes (e.g. /admin, /admin/dashboard, etc.)
    // Note: If unauthenticated, renderCurrentPortal will strictly show 404 Not Found.
    if (cleanPath === 'admin' || cleanPath === 'admin/dashboard') {
      return 'admin/dashboard';
    }
    if (cleanPath.startsWith('admin/')) {
      return cleanPath;
    }

    const validRoutes = ['about', 'shop', 'news', 'contact', 'profile', 'orders', 'home'];
    if (validRoutes.includes(cleanPath)) return cleanPath;
    if (cleanPath.startsWith('product/')) return cleanPath;
    if (cleanPath === 'product') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      if (id) return `product/${id}`;
      return 'product/prod-chk-2';
    }
    if (window.location.hash) {
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase().replace(/\/+$/, '');
      if (hash === '404' || hash === 'not-found') return '404';
      if (hash === '500' || hash === 'server-error') return '500';
      if (hash === 'admin/dashboard/login-admin') return 'login';
      if (hash === 'admin' || hash === 'admin/dashboard') return 'admin/dashboard';
      if (hash.startsWith('admin/')) return hash;
      if (validRoutes.includes(hash)) return hash;
      if (hash.startsWith('product/')) return hash;
    }

    // Any other URL (e.g. /login, /admin/login, /admin/login-admin, or invalid route) -> 404
    return '404';
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

    if (targetRoute === 'admin/dashboard/login-admin' || targetRoute === 'login') {
      setCurrentRoute('login');
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', '/admin/dashboard/login-admin');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentRoute(targetRoute);
    if (typeof window !== 'undefined') {
      if (targetRoute === 'home') {
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

  // Auto-redirect authenticated users away from admin login to their appropriate portal
  useEffect(() => {
    if (isAuthenticated) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname.replace(/^\/+/, '').toLowerCase().replace(/\/+$/, '') : '';
      if (
        currentRoute === 'login' ||
        currentPath === 'admin/dashboard/login-admin'
      ) {
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
    // 1. Explicit 404 Route
    if (currentRoute === '404') {
      return (
        <NotFoundPage
          onNavigate={navigateTo}
          attemptedPath={typeof window !== 'undefined' ? window.location.pathname : ''}
        />
      );
    }

    // 2. Explicit 500 Route
    if (currentRoute === '500') {
      return (
        <ServerErrorPage
          onNavigate={navigateTo}
          resetErrorBoundary={handleRefresh}
        />
      );
    }

    // 3. Strict Administrator Login Route:
    // ONLY rendered when visiting the exact complete URL: /admin/dashboard/login-admin
    if (currentRoute === 'login') {
      return <Login onBackToHome={() => navigateTo('home')} />;
    }

    // 4. ADMIN PORTAL: Only rendered when visiting dedicated admin routes (/admin, /admin/dashboard, etc.)
    const isAdminRoute = currentRoute === 'admin' || currentRoute.startsWith('admin/');
    if (isAdminRoute) {
      // If NOT authenticated as admin, strictly show 404 Not Found! Do NOT show login or redirect.
      if (!isAuthenticated || isUserType !== 'admin') {
        return (
          <NotFoundPage
            onNavigate={navigateTo}
            attemptedPath={typeof window !== 'undefined' ? window.location.pathname : ''}
          />
        );
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

    // 5. Fallback for profile / orders (no user login needed, route to home)
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

    // 6. Default / Initial / Storefront Home Portal (UserLayout)
    return (
      <UserLayout
        currentRoute={currentRoute}
        onRouteChange={navigateTo}
        onRefresh={handleRefresh}
      >
        {renderUserContent()}
      </UserLayout>
    );
  };

  return renderCurrentPortal();
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PlatformProvider>
          <CartProvider>
            <AdminRouter />
          </CartProvider>
        </PlatformProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
