import React from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { AdminDashboard } from './dashboard/Dashboard';
// Catalog Admin Components
import { CategoriesList } from './categories/CategoriesList';
import { BrandsList } from './brands/BrandsList';
import { AdminProductsList } from './products/AdminProductsList';

// Settings & Appearance views
import { AppearanceSettings } from './appearance/AppearanceSettings';
import { OffersList } from './offers/OffersList';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';

export const AdminRoutes = ({
  currentRoute = 'admin/dashboard',
  onNavigate,
  onRefresh,
  refreshKey = 0,
  renderUserContent,
}) => {
  // Normalize route to get subRoute (e.g., 'admin/categories' -> 'categories', 'admin' -> 'dashboard')
  const normalizeSubRoute = (route) => {
    if (!route || route === 'admin' || route === 'dashboard') return 'dashboard';
    if (route.startsWith('admin/')) {
      const sub = route.replace(/^admin\//, '').trim();
      return sub || 'dashboard';
    }
    return route;
  };

  const subRoute = normalizeSubRoute(currentRoute);

  // Centralized navigation handler ensuring admin routes have '/admin/<subRoute>' URL path
  const handleAdminNavigate = (target) => {
    if (!onNavigate) return;
    if (target === 'home' || target === '/') {
      onNavigate('home');
      return;
    }
    if (target.startsWith('admin/')) {
      onNavigate(target);
    } else if (target === 'admin' || target === 'dashboard') {
      onNavigate('admin/dashboard');
    } else {
      onNavigate(`admin/${target}`);
    }
  };

  // Render view corresponding to subRoute
  const renderContent = () => {
    switch (subRoute) {
      case 'dashboard':
        return <AdminDashboard key={refreshKey} onNavigate={handleAdminNavigate} />;
      case 'categories':
        return <CategoriesList key={refreshKey} defaultTab="categories" />;
      case 'subcategories':
      case 'categories-sub':
        return <CategoriesList key={refreshKey} defaultTab="subcategories" />;
      case 'brands':
        return <BrandsList key={refreshKey} />;
      case 'products':
        return <AdminProductsList key={refreshKey} onNavigate={handleAdminNavigate} />;
      case 'offers':
      case 'deals':
      case 'carousel':
        return <OffersList key={refreshKey} />;
      case 'appearance':
        return <AppearanceSettings key={refreshKey} />;
      default:
        return <AdminDashboard key={refreshKey} onNavigate={handleAdminNavigate} />;
    }
  };

  return (
    <AdminLayout
      currentRoute={subRoute}
      onRouteChange={handleAdminNavigate}
      onRefresh={onRefresh}
    >
      <ErrorBoundary key={`${subRoute}-${refreshKey}`}>
        {renderContent()}
      </ErrorBoundary>
    </AdminLayout>
  );
};
