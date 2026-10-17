import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RESTAURANT_INFO } from '../data/menuData';

export const WelcomeScreen: React.FC = () => {
  const {
    selectedTable,
    tableArea,
    guestsCount,
    setGuests,
    openTableModal,
    navigate,
  } = useApp();

  const [isLoadingMenu, setIsLoadingMenu] = useState(false);

  const handleStartOrder = () => {
    setIsLoadingMenu(true);
    setTimeout(() => {
      setIsLoadingMenu(false);
      navigate('menu');
    }, 400);
  };

  return (
    <div className="flex flex-col w-full pb-10 min-h-screen bg-surface">
      {/* Top Heritage Hero Header */}
      <div className="relative overflow-hidden bg-primary px-6 py-8 rounded-b-3xl shadow-md">
        {/* Glow ambient effects */}
        <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-primary-container opacity-40 blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-36 h-36 rounded-full bg-secondary opacity-20 blur-xl pointer-events-none" />

        {/* Brand bar */}
        <div className="relative flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <img
              alt="Logo Rawon Gusti Surabaya"
              className="w-12 h-12 rounded-full object-cover shadow-sm bg-surface-container-lowest p-0.5 border border-primary-fixed/20"
              src={RESTAURANT_INFO.logoUrl}
            />
            <div className="flex flex-col">
              <span className="font-serif text-[22px] font-bold text-on-primary tracking-wide">
                {RESTAURANT_INFO.name}
              </span>
              <span className="font-sans text-[11px] text-primary-fixed-dim uppercase tracking-wider font-semibold">
                {RESTAURANT_INFO.tagline}
              </span>
            </div>
          </div>
          <button
            onClick={openTableModal}
            className="flex items-center space-x-1.5 bg-primary-container/90 px-3 py-1.5 rounded-full text-on-primary shadow-xs hover:bg-primary-container active:scale-95 transition-all cursor-pointer"
          >
            <span
              className="material-symbols-outlined text-[17px] text-secondary-container"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              table_restaurant
            </span>
            <span className="font-sans text-[12px] font-semibold">Meja {selectedTable}</span>
          </button>
        </div>

        {/* Greetings */}
        <div className="relative space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary-container/20 text-secondary-fixed">
            <span
              className="material-symbols-outlined text-[14px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              spa
            </span>
            <span className="font-sans text-[11px] font-semibold tracking-wide">Sugeng Rawuh</span>
          </div>
          <h1 className="font-serif text-[26px] font-bold text-on-primary leading-tight">
            Selamat Datang di Rawon Gusti
          </h1>
          <p className="font-sans text-[12px] text-on-primary/80">
            {RESTAURANT_INFO.branch} • Suasana Hangat Kuliner Warisan
          </p>
        </div>
      </div>

      {/* Table & Guest Card */}
      <div className="px-5 -mt-5">
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-lg space-y-4 border border-[#eae3d9]/70">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-xl bg-primary-fixed/30 text-primary flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  sensor_door
                </span>
              </div>
              <div>
                <span className="font-sans text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                  Lokasi Duduk Anda
                </span>
                <h2 className="font-sans text-[18px] font-bold text-on-surface">Meja {selectedTable}</h2>
                <p className="font-sans text-[12px] text-on-surface-variant">{tableArea}</p>
              </div>
            </div>
            <button
              onClick={openTableModal}
              className="px-3 py-1.5 text-secondary bg-surface-container-low rounded-lg font-sans font-semibold text-[12px] hover:bg-surface-container active:scale-95 transition-all cursor-pointer"
            >
              Ganti Meja
            </button>
          </div>

          {/* Guest Count Stepper */}
          <div className="bg-surface-container-low rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="material-symbols-outlined text-[18px] text-primary">groups</span>
                <label className="font-sans font-bold text-[15px] text-on-surface">Jumlah Pelanggan</label>
              </div>
              <span className="font-sans text-[11px] text-on-surface-variant font-medium">Makan di Tempat</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <p className="font-sans text-[12px] text-on-surface-variant">Berapa orang yang bersantap bersama?</p>
              <div className="flex items-center space-x-3 bg-surface-container-lowest px-2.5 py-1 rounded-full shadow-xs border border-[#eae3d9]/60">
                <button
                  onClick={() => setGuests(guestsCount - 1)}
                  disabled={guestsCount <= 1}
                  className="w-7 h-7 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-bold text-[15px] active:scale-90 transition-transform disabled:opacity-40 cursor-pointer"
                >
                  -
                </button>
                <span className="font-sans text-[16px] font-bold text-primary w-5 text-center">
                  {guestsCount}
                </span>
                <button
                  onClick={() => setGuests(guestsCount + 1)}
                  disabled={guestsCount >= 12}
                  className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-[15px] active:scale-90 transition-transform disabled:opacity-40 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="px-5 mt-5 space-y-3">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-4 bg-secondary rounded-full" />
          <h3 className="font-sans font-bold text-[16px] text-on-surface">Kemudahan Makan di Meja</h3>
        </div>

        <div className="space-y-2.5">
          <div className="bg-surface-container-lowest p-3.5 rounded-xl shadow-xs flex items-start space-x-3.5 border border-[#eae3d9]/60">
            <div className="w-9 h-9 rounded-full bg-secondary-fixed/50 text-secondary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">phonelink_setup</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-sans font-bold text-[14px] text-on-surface">Tanpa Perlu Instal Aplikasi</h4>
              <p className="font-sans text-[12px] text-on-surface-variant mt-0.5 leading-snug">
                Pemesanan langsung berjalan mulus melalui browser smartphone Anda.
              </p>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-3.5 rounded-xl shadow-xs flex items-start space-x-3.5 border border-[#eae3d9]/60">
            <div className="w-9 h-9 rounded-full bg-primary-fixed/40 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">soup_kitchen</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-sans font-bold text-[14px] text-on-surface">Terhubung ke Dapur &amp; Kasir</h4>
              <p className="font-sans text-[12px] text-on-surface-variant mt-0.5 leading-snug">
                Pesanan langsung tampil di Kitchen Display System (KDS) koki secara instan.
              </p>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-3.5 rounded-xl shadow-xs flex items-start space-x-3.5 border border-[#eae3d9]/60">
            <div className="w-9 h-9 rounded-full bg-secondary-container/20 text-on-secondary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-sans font-bold text-[14px] text-on-surface">Fleksibilitas Bayar</h4>
              <p className="font-sans text-[12px] text-on-surface-variant mt-0.5 leading-snug">
                Pilihan bayar cepat QRIS dari meja atau bayar di kasir saat bersiap pulang.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Heritage Quote Card */}
      <div className="px-5 mt-5">
        <div className="relative bg-surface-container-low rounded-2xl p-4 overflow-hidden border border-[#eae3d9]/80">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-2 translate-y-2">
            <span className="material-symbols-outlined text-7xl text-primary">local_dining</span>
          </div>
          <div className="relative flex items-center space-x-1.5 mb-1 text-secondary">
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
            <span className="font-sans text-[11px] font-bold tracking-wider uppercase">
              Warisan Rasa Tradisi
            </span>
          </div>
          <p className="font-serif text-[15px] text-primary italic leading-snug font-semibold">
            “Resep Autentik Sejak 1982 • Kuah Kluwek Rempah Jawa Timur”
          </p>
          <p className="font-sans text-[12px] text-on-surface-variant mt-1.5 leading-relaxed">
            Daging sapi pilihan empuk berpadu tauge segar, telur asin Masir, dan sambal terasi khas Surabaya.
          </p>
        </div>
      </div>

      {/* Main CTA */}
      <div className="px-5 mt-6">
        <button
          onClick={handleStartOrder}
          disabled={isLoadingMenu}
          className="w-full h-12 bg-primary hover:bg-primary-container text-on-primary font-sans font-bold text-[15px] rounded-xl shadow-md active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-80"
        >
          {isLoadingMenu ? (
            <>
              <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
              <span>Mempersiapkan Menu...</span>
            </>
          ) : (
            <>
              <span>Mulai Pilih Menu Lezat</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </>
          )}
        </button>
        <p className="text-center font-sans text-[11px] text-on-surface-variant mt-2 font-medium">
          Sentuh tombol di atas untuk membuka daftar kuliner rawon legendaris
        </p>
      </div>
    </div>
  );
};
