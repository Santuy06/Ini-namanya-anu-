import React, { useState } from 'react';
import { useApp, AppView } from '../context/AppContext';
import { UserRole } from '../types';

export const HelpModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl z-50 border border-[#ebe8e3] max-h-[85vh] overflow-y-auto space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#ebe8e3]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#3d1018] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">help</span>
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1c1c19]">
                Bantuan &amp; Panduan Operasional
              </h3>
              <p className="text-xs text-[#524344]">Sistem POS Rawon Gusti Surabaya</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#847374] hover:text-[#3d1018] hover:bg-[#f0ede9] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="space-y-3.5 text-xs text-[#524344] leading-relaxed">
          <div className="p-3 bg-[#fcf9f4] rounded-xl border border-[#ebe8e3]">
            <h4 className="font-bold text-[#3d1018] flex items-center gap-1.5 mb-1 text-sm">
              <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
              <span>1. Peran Kasir</span>
            </h4>
            <p>
              Kasir berfokus pada <strong>Meja &amp; Pelanggan</strong>, <strong>Pesanan Baru</strong>, dan{' '}
              <strong>Checkout &amp; Bayar</strong>. Kasir dapat memilih tagihan meja, menghitung uang tunai &amp; kembalian, menampilkan QRIS, dan mencetak struk kasir termal.
            </p>
          </div>

          <div className="p-3 bg-[#fcf9f4] rounded-xl border border-[#ebe8e3]">
            <h4 className="font-bold text-[#3d1018] flex items-center gap-1.5 mb-1 text-sm">
              <span className="material-symbols-outlined text-[16px]">skillet</span>
              <span>2. Peran Dapur (Kitchen KDS)</span>
            </h4>
            <p>
              Dapur hanya memiliki akses ke <strong>Kitchen Display (Pantau Pesanan)</strong>. Tiket pesanan pelanggan yang masuk dari QR maupun kasir dapat dimajukan statusnya: <em>Baru ➔ Dimasak ➔ Siap Diantar ➔ Disajikan</em>.
            </p>
          </div>

          <div className="p-3 bg-[#fcf9f4] rounded-xl border border-[#ebe8e3]">
            <h4 className="font-bold text-[#3d1018] flex items-center gap-1.5 mb-1 text-sm">
              <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
              <span>3. Peran Admin Outlet</span>
            </h4>
            <p>
              Admin memiliki akses penuh baik di layar desktop maupun layar ponsel/Android: Dashboard analytics (1 hari / 1 minggu / 1 bulan / 1 tahun), Kelola Menu, Kelola Meja &amp; QR, Manajemen Akun Staf, Laporan Transaksi, dan Rekap Kas Tutup Shift.
            </p>
          </div>

          <div className="p-3 bg-[#fcf9f4] rounded-xl border border-[#ebe8e3]">
            <h4 className="font-bold text-[#3d1018] flex items-center gap-1.5 mb-1 text-sm">
              <span className="material-symbols-outlined text-[16px]">notifications_active</span>
              <span>4. Panggilan Pelayan &amp; Minta Tagihan</span>
            </h4>
            <p>
              Pelanggan di meja dapat memanggil pelayan atau meminta tagihan via smartphone. Notifikasi dan lonceng suara otomatis berbunyi di POS kasir dan dapur.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#3d1018] text-white text-xs font-bold hover:bg-[#58252c] transition-all shadow-sm"
          >
            Mengerti &amp; Tutup
          </button>
        </div>
      </div>
    </>
  );
};

export const MobileHeader: React.FC = () => {
  const { activeView, setActiveView, currentRole, setCurrentRole, logout } = useApp();
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  const getPageTitleBadge = () => {
    switch (activeView) {
      case 'meja-dan-pelanggan':
        return 'Meja Dan Pelanggan';
      case 'pesanan-baru':
        return 'Pesanan Baru';
      case 'checkout':
      case 'pembayaran':
        return 'Checkout & Bayar';
      case 'pantau-pesanan':
        return 'Kitchen KDS';
      case 'dashboard':
        return 'Dashboard';
      case 'kelola-menu':
        return 'Kelola Menu';
      case 'kelola-meja':
        return 'Kelola Meja';
      case 'akun-staf-dan-role':
        return 'Akun Staf';
      case 'laporan':
        return 'Laporan Transaksi';
      default:
        return 'Operasional';
    }
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 bg-[#fcf9f4]/95 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(43,35,37,0.04)] border-b border-[#ebe8e3]">
        <div className="h-16 px-3 sm:px-4 flex items-center justify-between gap-2 max-w-[1720px] mx-auto">
          {/* Brand Left */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#3d1018] flex items-center justify-center p-0.5 shrink-0 shadow-xs">
              <img
                alt="Logo Rawon Gusti"
                className="w-full h-full object-contain"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4jDTg2zGsW66D3mPi0LCCgkEKAz6A3C_LyMjRjF33cCX-hxn-FMKJ-VmnANEDzHK36CnYdj065-0rxRIyAzaBK6gX8QPIzL_SZbagw1SD7hPd2ZxzJIZ6yhPlB0wT0wYg5V1QYZIndg6LMBj-RspFW4GjCZKuvGWpMCQZZXFIpvETPHdcZZBqLKJziB4JXaXmcwodTl3uHGVnuzTEmOl9Fam2CBCupu5HozhgUINKbYrxNyF4ccQ9FOYEpUIXWooGFlE"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm sm:text-base text-[#3d1018] truncate">
                  Rawon Gusti
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-[#ebe8e3] text-[#524344] text-[10px] font-semibold truncate hidden xs:inline">
                  {getPageTitleBadge()}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#524344]">
                <span className="w-2 h-2 rounded-full bg-[#994703] animate-pulse shrink-0"></span>
                <span className="truncate">Surabaya • Dine-in</span>
              </div>
            </div>
          </div>

          {/* Role Switcher & Admin Drawer Button */}
          <div className="flex items-center gap-1.5 shrink-0">
            {currentRole === 'admin' && (
              <button
                onClick={() => setAdminMenuOpen(true)}
                title="Buka Menu Manajemen"
                className="px-2.5 py-1.5 rounded-lg bg-[#58252c] text-white text-xs font-bold flex items-center gap-1 shadow-xs hover:bg-[#3d1018] transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">menu_open</span>
                <span className="hidden xs:inline">Menu Admin</span>
              </button>
            )}

            <button
              onClick={logout}
              title="Keluar Shift"
              className="w-8 h-8 rounded-full bg-[#3d1018] flex items-center justify-center shrink-0 shadow-sm text-white hover:bg-[#58252c] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Mobile Slide-Up Drawer */}
      {adminMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50"
            onClick={() => setAdminMenuOpen(false)}
          />
          <div className="fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-3xl p-5 shadow-2xl border-t border-[#ebe8e3] space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="w-10 h-1 bg-[#d7c2c2] rounded-full mx-auto mb-2"></div>
            <div className="flex items-center justify-between pb-2 border-b border-[#ebe8e3]">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1c1c19]">Menu Manajemen Outlet</h3>
                <p className="text-xs text-[#524344]">Akses penuh admin pada perangkat mobile</p>
              </div>
              <button
                onClick={() => setAdminMenuOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#847374] hover:bg-[#f0ede9]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: 'Dashboard', icon: 'grid_view', view: 'dashboard' as AppView, desc: 'Metrik & grafik penjualan' },
                { label: 'Kelola Menu', icon: 'restaurant_menu', view: 'kelola-menu' as AppView, desc: 'Katalog harga & stok' },
                { label: 'Kelola Meja', icon: 'deck', view: 'kelola-meja' as AppView, desc: 'Nomor meja & cetak QR' },
                { label: 'Akun Staf', icon: 'badge', view: 'akun-staf-dan-role' as AppView, desc: 'Hak akses staf & shift' },
                { label: 'Laporan', icon: 'query_stats', view: 'laporan' as AppView, desc: 'Rekap penjualan & CSV' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setActiveView(item.view);
                    setAdminMenuOpen(false);
                  }}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    activeView === item.view
                      ? 'bg-[#3d1018] text-white border-[#3d1018] shadow-sm'
                      : 'bg-[#fcf9f4] hover:bg-[#f0ede9] text-[#1c1c19] border-[#ebe8e3]'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[24px] mb-2 ${activeView === item.view ? 'text-[#ffdadc]' : 'text-[#994703]'}`}>
                    {item.icon}
                  </span>
                  <div>
                    <span className="font-bold text-xs block leading-tight">{item.label}</span>
                    <span className={`text-[10px] mt-0.5 block ${activeView === item.view ? 'text-[#ffdadc]/70' : 'text-[#847374]'}`}>
                      {item.desc}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export const MobileBottomNav: React.FC = () => {
  const { activeView, setActiveView, currentRole } = useApp();
  const [mobileAdminOpen, setMobileAdminOpen] = useState(false);

  // Role-based mobile navigation tabs
  const getNavItems = (): { label: string; icon: string; view: AppView | 'admin-drawer' }[] => {
    if (currentRole === 'kitchen') {
      return [{ label: 'Kitchen KDS', icon: 'skillet', view: 'pantau-pesanan' }];
    }
    if (currentRole === 'kasir') {
      return [
        { label: 'Meja', icon: 'table_restaurant', view: 'meja-dan-pelanggan' },
        { label: 'Pesanan', icon: 'restaurant_menu', view: 'pesanan-baru' },
        { label: 'Checkout', icon: 'point_of_sale', view: 'checkout' },
      ];
    }
    // Admin role: operational + management drawer trigger
    return [
      { label: 'Meja', icon: 'table_restaurant', view: 'meja-dan-pelanggan' },
      { label: 'Pesanan', icon: 'restaurant_menu', view: 'pesanan-baru' },
      { label: 'Checkout', icon: 'point_of_sale', view: 'checkout' },
      { label: 'Kitchen', icon: 'skillet', view: 'pantau-pesanan' },
      { label: 'Manajemen', icon: 'apps', view: 'admin-drawer' },
    ];
  };

  const navItems = getNavItems();

  return (
    <>
      <nav className="fixed bottom-0 inset-x-0 z-40 pb-safe bg-[#fcf9f4]/95 backdrop-blur-xl border-t border-[#ebe8e3] shadow-[0_-2px_12px_rgba(43,35,37,0.06)]">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-1">
          {navItems.map((item) => {
            const isDrawer = item.view === 'admin-drawer';
            const isActive =
              !isDrawer &&
              (activeView === item.view ||
                (item.view === 'checkout' && activeView === 'pembayaran'));

            return (
              <button
                key={item.label}
                onClick={() => {
                  if (isDrawer) {
                    setMobileAdminOpen(true);
                  } else {
                    setActiveView(item.view as AppView);
                  }
                }}
                className={`flex flex-col items-center justify-center gap-0.5 w-16 h-14 transition-colors ${
                  isActive ? 'text-[#3d1018] font-bold' : 'text-[#847374] hover:text-[#3d1018]'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[22px] transition-transform ${
                    isActive ? 'scale-110 text-[#3d1018]' : ''
                  }`}
                >
                  {item.icon}
                </span>
                <span className="text-[11px] leading-tight text-center">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Admin Quick Bottom Sheet on Mobile */}
      {mobileAdminOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50"
            onClick={() => setMobileAdminOpen(false)}
          />
          <div className="fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-3xl p-5 shadow-2xl border-t border-[#ebe8e3] space-y-3 max-h-[85vh] overflow-y-auto">
            <div className="w-10 h-1 bg-[#d7c2c2] rounded-full mx-auto mb-1"></div>
            <div className="flex items-center justify-between pb-2 border-b border-[#ebe8e3]">
              <h3 className="font-serif text-base font-bold text-[#1c1c19]">Menu Manajemen Outlet</h3>
              <button
                onClick={() => setMobileAdminOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#847374]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Dashboard', icon: 'grid_view', view: 'dashboard' as AppView },
                { label: 'Kelola Menu', icon: 'restaurant_menu', view: 'kelola-menu' as AppView },
                { label: 'Kelola Meja', icon: 'deck', view: 'kelola-meja' as AppView },
                { label: 'Akun Staf', icon: 'badge', view: 'akun-staf-dan-role' as AppView },
                { label: 'Laporan Transaksi', icon: 'query_stats', view: 'laporan' as AppView },
              ].map((m) => (
                <button
                  key={m.label}
                  onClick={() => {
                    setActiveView(m.view);
                    setMobileAdminOpen(false);
                  }}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    activeView === m.view
                      ? 'bg-[#3d1018] text-white border-[#3d1018]'
                      : 'bg-[#fcf9f4] hover:bg-[#f0ede9] text-[#1c1c19] border-[#ebe8e3]'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${activeView === m.view ? 'text-[#ffdadc]' : 'text-[#994703]'}`}>
                    {m.icon}
                  </span>
                  <span className="font-bold text-xs">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export const DesktopSidebar: React.FC = () => {
  const { activeView, setActiveView, logout, currentUser, currentRole } = useApp();

  // Role-based Navigasi Operasional
  const getOperationalNav = () => {
    if (currentRole === 'kitchen') {
      return [{ label: 'Pantau pesanan (KDS)', icon: 'skillet', view: 'pantau-pesanan' as AppView }];
    }
    if (currentRole === 'kasir') {
      return [
        { label: 'Meja & Pelanggan', icon: 'table_restaurant', view: 'meja-dan-pelanggan' as AppView },
        { label: 'Pesanan baru', icon: 'add_shopping_cart', view: 'pesanan-baru' as AppView },
        { label: 'Checkout & Bayar', icon: 'point_of_sale', view: 'checkout' as AppView },
      ];
    }
    // Admin
    return [
      { label: 'Dashboard', icon: 'grid_view', view: 'dashboard' as AppView },
      { label: 'Meja & Pelanggan', icon: 'table_restaurant', view: 'meja-dan-pelanggan' as AppView },
      { label: 'Pesanan baru', icon: 'add_shopping_cart', view: 'pesanan-baru' as AppView },
      { label: 'Checkout & Bayar', icon: 'point_of_sale', view: 'checkout' as AppView },
      { label: 'Pantau pesanan', icon: 'skillet', view: 'pantau-pesanan' as AppView },
    ];
  };

  const managementNav = [
    { label: 'Kelola menu', icon: 'restaurant_menu', view: 'kelola-menu' as AppView },
    { label: 'Kelola meja', icon: 'deck', view: 'kelola-meja' as AppView },
    { label: 'Akun staf & role', icon: 'badge', view: 'akun-staf-dan-role' as AppView },
    { label: 'Laporan', icon: 'query_stats', view: 'laporan' as AppView },
  ];

  const operationalNav = getOperationalNav();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#3d1018] text-white z-40 flex flex-col justify-between shadow-[0_4px_24px_rgba(43,35,37,0.12)]">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header */}
        <div className="p-4 flex items-center gap-3 bg-[#3d1018]/50 border-b border-white/10">
          <img
            alt="Rawon Gusti Brand"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-[#ffb2b9]/40"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4jDTg2zGsW66D3mPi0LCCgkEKAz6A3C_LyMjRjF33cCX-hxn-FMKJ-VmnANEDzHK36CnYdj065-0rxRIyAzaBK6gX8QPIzL_SZbagw1SD7hPd2ZxzJIZ6yhPlB0wT0wYg5V1QYZIndg6LMBj-RspFW4GjCZKuvGWpMCQZZXFIpvETPHdcZZBqLKJziB4JXaXmcwodTl3uHGVnuzTEmOl9Fam2CBCupu5HozhgUINKbYrxNyF4ccQ9FOYEpUIXWooGFlE"
          />
          <div className="flex flex-col overflow-hidden">
            <span className="font-serif font-bold text-base text-[#ffdadc] leading-tight tracking-wide truncate">
              Rawon Gusti
            </span>
            <span className="text-[11px] text-[#ffdadc]/70 truncate">Surabaya • Dine-in</span>
          </div>
        </div>


        {/* Operational Nav */}
        <div className="px-4 mt-1">
          <span className="text-[10px] font-bold text-[#ffdadc]/70 uppercase tracking-wider block mb-1">
            Navigasi Operasional
          </span>
        </div>
        <nav className="px-2 space-y-0.5 overflow-y-auto custom-scrollbar flex-1">
          {operationalNav.map((item) => {
            const isActive =
              activeView === item.view ||
              (item.view === 'checkout' && activeView === 'pembayaran');
            return (
              <button
                key={item.label}
                onClick={() => setActiveView(item.view)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all text-left ${
                  isActive
                    ? 'bg-[#58252c] text-white font-semibold shadow-xs'
                    : 'text-white/80 hover:bg-[#58252c]/40 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Hanya tampilkan Manajemen & Laporan untuk peran admin */}
          {currentRole === 'admin' && (
            <>
              <div className="pt-3 pb-1 px-2">
                <span className="text-[10px] font-bold text-[#ffdadc]/70 uppercase tracking-wider block">
                  Manajemen &amp; Laporan
                </span>
              </div>

              {managementNav.map((item) => {
                const isActive = activeView === item.view;
                return (
                  <button
                    key={item.label}
                    onClick={() => setActiveView(item.view)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all text-left ${
                      isActive
                        ? 'bg-[#58252c] text-white font-semibold shadow-xs'
                        : 'text-white/80 hover:bg-[#58252c]/40 hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </>
          )}
        </nav>
      </div>

      {/* Sidebar Footer: Hanya Info Akun dan Tombol Keluar di Pojok Kiri Bawah */}
      <div className="p-3 bg-[#58252c]/40 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#58252c] flex items-center justify-center text-xs font-bold text-[#ffdadc] ring-1 ring-white/20 shrink-0 uppercase">
            {currentUser.name ? currentUser.name.slice(0, 2) : 'RG'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-white truncate leading-tight">
              {currentUser.name || 'Staf Operasional'}
            </span>
            <span className="text-[10px] text-[#ffdadc]/70 truncate capitalize">
              {currentRole} Outlet
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          title="Keluar Shift"
          className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
        </button>
      </div>
    </aside>
  );
};

export const DesktopHeader: React.FC = () => {
  const { activeView, setActiveView, currentRole, setCurrentRole } = useApp();
  const [helpOpen, setHelpOpen] = useState(false);

  const getViewTitle = () => {
    switch (activeView) {
      case 'dashboard':
        return 'Dashboard Operasional';
      case 'meja-dan-pelanggan':
        return 'Meja & Pelanggan';
      case 'pesanan-baru':
        return 'Pesanan Baru (POS)';
      case 'checkout':
      case 'pembayaran':
        return 'Checkout & Pembayaran';
      case 'pantau-pesanan':
        return 'Pantau Pesanan (KDS)';
      case 'kelola-menu':
        return 'Kelola Menu Restoran';
      case 'kelola-meja':
        return 'Kelola Meja & QR';
      case 'akun-staf-dan-role':
        return 'Akun Staf & Role';
      case 'laporan':
        return 'Laporan Transaksi & Pajak';
      default:
        return 'Operasional';
    }
  };

  return (
    <>
      <header className="fixed top-0 left-64 right-0 z-30 bg-[#fcf9f4]/90 backdrop-blur-xl border-b border-[#ebe8e3] shadow-[0_1px_8px_rgba(43,35,37,0.04)]">
        <div className="h-16 px-6 flex items-center justify-between">
          {/* Left: Breadcrumbs */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-[#524344]">
              <span className="material-symbols-outlined text-[18px] text-[#994703]">
                store
              </span>
              <span className="font-semibold text-[#1c1c19]">Rawon Gusti Surabaya</span>
              <span className="text-[#847374]">/</span>
              <span className="font-medium">{getViewTitle()}</span>
            </div>
            <span className="h-4 w-px bg-[#d7c2c2]"></span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ebe8e3] text-xs font-medium text-[#1c1c19]">
              <span className="material-symbols-outlined text-[15px] text-[#994703]">
                schedule
              </span>
              <span>
                {new Date().toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  timeZone: 'Asia/Jakarta',
                })}
              </span>
            </div>
          </div>

          {/* Right: Status & Quick Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#f0ede9] rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-semibold text-[#1c1c19]">POS Aktif &amp; Sinkron</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveView('laporan')}
                title="Laporan Transaksi"
                className="p-2 rounded-lg text-[#524344] hover:bg-[#ebe8e3] hover:text-[#1c1c19] transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">query_stats</span>
              </button>
              <button
                onClick={() => setHelpOpen(true)}
                title="Bantuan & Petunjuk Operasional"
                className="p-2 rounded-lg text-[#524344] hover:bg-[#ebe8e3] hover:text-[#1c1c19] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">help</span>
              </button>
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-[#ebe8e3]">
              <img
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover ring-1 ring-[#d7c2c2]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4jDTg2zGsW66D3mPi0LCCgkEKAz6A3C_LyMjRjF33cCX-hxn-FMKJ-VmnANEDzHK36CnYdj065-0rxRIyAzaBK6gX8QPIzL_SZbagw1SD7hPd2ZxzJIZ6yhPlB0wT0wYg5V1QYZIndg6LMBj-RspFW4GjCZKuvGWpMCQZZXFIpvETPHdcZZBqLKJziB4JXaXmcwodTl3uHGVnuzTEmOl9Fam2CBCupu5HozhgUINKbYrxNyF4ccQ9FOYEpUIXWooGFlE"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Global Help & Guide Modal */}
      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
};
