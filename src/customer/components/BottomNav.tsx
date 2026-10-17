import React from 'react';
import { useApp } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { currentScreen, navigate, cartCount } = useApp();

  // Don't show bottom nav on welcome or detail screen
  if (currentScreen === 'welcome' || currentScreen === 'detail') {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pb-safe bg-[#fcf9f4]/95 backdrop-blur-xl shadow-[0_-4px_16px_rgba(43,35,37,0.06)] border-t border-[#e5e2dd]/60">
      <div className="max-w-md mx-auto flex justify-around items-center h-18 px-4">
        {/* Menu Tab */}
        <button
          onClick={() => navigate('menu')}
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] gap-1 transition-colors cursor-pointer ${
            currentScreen === 'menu'
              ? 'text-primary font-semibold'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: currentScreen === 'menu' ? "'FILL' 1" : "'FILL' 0" }}
          >
            restaurant_menu
          </span>
          <span className="text-[11px] font-sans">Menu</span>
        </button>

        {/* Keranjang Tab */}
        <button
          onClick={() => navigate('cart')}
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] gap-1 relative transition-colors cursor-pointer ${
            currentScreen === 'cart'
              ? 'text-primary font-semibold'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="relative">
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: currentScreen === 'cart' ? "'FILL' 1" : "'FILL' 0" }}
            >
              shopping_bag
            </span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1.5 py-0.2 bg-secondary text-on-secondary rounded-full text-[10px] leading-tight font-bold shadow-xs">
                {cartCount}
              </span>
            )}
          </span>
          <span className="text-[11px] font-sans">Keranjang</span>
        </button>

        {/* Status Pesanan Tab */}
        <button
          onClick={() => navigate('status')}
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] gap-1 transition-colors cursor-pointer ${
            currentScreen === 'status'
              ? 'text-primary font-semibold'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: currentScreen === 'status' ? "'FILL' 1" : "'FILL' 0" }}
          >
            receipt_long
          </span>
          <span className="text-[11px] font-sans">Status Pesanan</span>
        </button>
      </div>
    </nav>
  );
};
