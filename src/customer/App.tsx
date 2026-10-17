import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { WelcomeScreen } from './components/WelcomeScreen';
import { MenuScreen } from './components/MenuScreen';
import { DetailScreen } from './components/DetailScreen';
import { CartScreen } from './components/CartScreen';
import { StatusScreen } from './components/StatusScreen';
import { ChangeTableModal } from './components/ChangeTableModal';
import { Toast } from './components/Toast';
import { supabaseConfigured } from '../lib/supabase';
import { SetupNotice } from '../lib/SetupNotice';

const Notice: React.FC<{ icon: string; title: string; body: string }> = ({ icon, title, body }) => (
  <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 p-8 min-h-screen">
    <span className="material-symbols-outlined text-5xl text-secondary">{icon}</span>
    <h1 className="font-serif text-2xl font-bold text-primary">{title}</h1>
    <p className="font-sans text-sm text-on-surface-variant max-w-xs leading-relaxed">{body}</p>
  </div>
);

const AppContent: React.FC = () => {
  const { currentScreen, tableState } = useApp();

  return (
    <div className="min-h-screen bg-[#2b2325]/10 flex flex-col items-center justify-start text-[#1c1c19]">
      <div className="w-full max-w-md bg-surface min-h-screen relative shadow-2xl flex flex-col border-x border-[#eae3d9]/40">
        {tableState === 'loading' && <Notice icon="hourglass_top" title="Memuat menu…" body="Sebentar ya, kami menyiapkan menu untuk meja Anda." />}
        {tableState === 'invalid' && <Notice icon="qr_code_scanner" title="QR meja tidak dikenali" body="Silakan pindai ulang kode QR yang ada di meja Anda, atau minta bantuan pelayan." />}
        {tableState === 'error' && <Notice icon="cloud_off" title="Tidak dapat terhubung" body="Periksa koneksi internet Anda lalu muat ulang halaman ini." />}
        {tableState === 'ok' && (
          <>
            <Header />
            <main className="flex-1 w-full flex flex-col relative">
              {currentScreen === 'welcome' && <WelcomeScreen />}
              {currentScreen === 'menu' && <MenuScreen />}
              {currentScreen === 'detail' && <DetailScreen />}
              {currentScreen === 'cart' && <CartScreen />}
              {currentScreen === 'status' && <StatusScreen />}
            </main>
            <BottomNav />
            <ChangeTableModal />
          </>
        )}
        <Toast />
      </div>
    </div>
  );
};

export default function App() {
  if (!supabaseConfigured) return <SetupNotice />;
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
