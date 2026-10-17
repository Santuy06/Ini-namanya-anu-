import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MenuItem } from '../types';

interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem;
}

export const CustomizationModal: React.FC<CustomizationModalProps> = ({ isOpen, onClose, item }) => {
  const { addToCart } = useApp();
  const [sambalLevel, setSambalLevel] = useState<'0' | '1' | '2'>('1');
  const [sayurOption, setSayurOption] = useState<'lengkap' | 'pisah'>('lengkap');

  if (!isOpen) return null;

  const handleApply = () => {
    addToCart(
      item,
      {
        kuah: 'campur',
        pedas: sambalLevel,
        sayur: sayurOption,
        extras: [],
      },
      1
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#261e20]/60 backdrop-blur-xs flex items-end justify-center p-0 transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white rounded-t-2xl p-6 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between pb-1">
          <div className="flex flex-col">
            <h3 className="font-sans font-bold text-[18px] text-[#1c1c19]">Kustomisasi {item.name}</h3>
            <p className="font-sans text-[12px] text-on-surface-variant">Sesuaikan tingkat pedas dan racikan pelengkap</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center hover:bg-surface-variant cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Option 1: Level Pedas */}
        <div className="flex flex-col gap-2">
          <span className="font-sans font-semibold text-[13px] text-on-surface">Level Sambal Terasi Terpisah</span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSambalLevel('1')}
              className={`px-3 py-2.5 rounded-lg font-sans text-[12px] text-center font-medium transition-all cursor-pointer ${
                sambalLevel === '1'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container text-on-surface hover:bg-surface-variant'
              }`}
            >
              Sedang (Standar)
            </button>
            <button
              type="button"
              onClick={() => setSambalLevel('2')}
              className={`px-3 py-2.5 rounded-lg font-sans text-[12px] text-center font-medium transition-all cursor-pointer ${
                sambalLevel === '2'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container text-on-surface hover:bg-surface-variant'
              }`}
            >
              Pedas Mantap 🔥
            </button>
            <button
              type="button"
              onClick={() => setSambalLevel('0')}
              className={`px-3 py-2.5 rounded-lg font-sans text-[12px] text-center font-medium transition-all cursor-pointer ${
                sambalLevel === '0'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container text-on-surface hover:bg-surface-variant'
              }`}
            >
              Tanpa Sambal
            </button>
          </div>
        </div>

        {/* Option 2: Tauge & Daun Bawang */}
        <div className="flex flex-col gap-2">
          <span className="font-sans font-semibold text-[13px] text-on-surface">Penyajian Sayur Pelengkap</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSayurOption('lengkap')}
              className={`px-3 py-2.5 rounded-lg font-sans text-[12px] text-center font-medium transition-all cursor-pointer ${
                sayurOption === 'lengkap'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container text-on-surface hover:bg-surface-variant'
              }`}
            >
              Tauge & Bawang Lengkap
            </button>
            <button
              type="button"
              onClick={() => setSayurOption('pisah')}
              className={`px-3 py-2.5 rounded-lg font-sans text-[12px] text-center font-medium transition-all cursor-pointer ${
                sayurOption === 'pisah'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container text-on-surface hover:bg-surface-variant'
              }`}
            >
              Pisah Sayur
            </button>
          </div>
        </div>

        <button
          onClick={handleApply}
          className="w-full h-11 bg-primary text-on-primary rounded-lg font-sans font-semibold text-[14px] mt-2 active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-md hover:bg-primary-container cursor-pointer"
        >
          <span>Terapkan & Tambah ke Pesanan</span>
          <span className="material-symbols-outlined text-[18px]">check</span>
        </button>
      </div>
    </div>
  );
};
