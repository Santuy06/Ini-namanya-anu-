import React from 'react';
import { useApp } from '../context/AppContext';
import { RESTAURANT_INFO } from '../data/menuData';

interface HeaderProps {
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onBack }) => {
  const { currentScreen, selectedTable, navigate } = useApp();

  if (currentScreen === 'welcome') {
    return null;
  }

  const screenSubtitleMap = {
    menu: 'Menu',
    cart: 'Keranjang',
    status: 'Status Pesanan',
    detail: `Meja ${selectedTable}`,
  };

  const subtitle = screenSubtitleMap[currentScreen] || 'Menu';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-safe bg-[#fcf9f4]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="max-w-md mx-auto h-16 px-4 flex items-center justify-between">
        {currentScreen === 'detail' ? (
          <div className="flex items-center gap-2">
            <button
              aria-label="Kembali"
              className="w-10 h-10 flex items-center justify-center text-primary rounded-lg hover:bg-surface-container active:scale-95 transition-all cursor-pointer"
              onClick={onBack || (() => navigate('menu'))}
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <div className="flex flex-col">
              <h1 className="font-sans font-bold text-[18px] text-primary leading-tight">Detail Menu</h1>
              <span className="font-sans text-[11px] text-on-surface-variant">Meja {selectedTable}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div
              onClick={() => navigate('welcome')}
              className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-on-primary shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
              title="Ke Layar Awal"
            >
              <span className="material-symbols-outlined text-[20px]">soup_kitchen</span>
            </div>
            <div>
              <h1 className="font-serif text-[17px] font-bold text-primary leading-tight tracking-tight">
                {RESTAURANT_INFO.name}
              </h1>
              <div className="flex items-center gap-1">
                <span className="text-[12px] font-sans text-on-surface-variant">{subtitle}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[11px] font-semibold tracking-wide shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            Meja {selectedTable}
          </span>
          <img
            alt="Profil Pelanggan"
            className="w-8 h-8 rounded-full object-cover border border-[#e5e2dd] shadow-xs"
            src={RESTAURANT_INFO.profileAvatarUrl}
          />
        </div>
      </div>
    </header>
  );
};
