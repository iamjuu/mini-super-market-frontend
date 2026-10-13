import React from 'react';
import { DesktopStorefront } from './components/DesktopStorefront';
import { MobileStorefront } from './components/MobileStorefront';

export const UserDashboard = ({ onNavigate }) => {
  return (
    <div className="w-full">
      {/* Mobile Viewport: Dedicated Mockup Layout */}
      <div className="block md:hidden">
        <MobileStorefront onNavigate={onNavigate} />
      </div>

      {/* Desktop Viewport: Rich Web Storefront Layout */}
      <div className="hidden md:block">
        <DesktopStorefront onNavigate={onNavigate} />
      </div>
    </div>
  );
};

