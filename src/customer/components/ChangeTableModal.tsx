import React from 'react';
import { useApp } from '../context/AppContext';

// Meja dikenali dari QR yang dipindai (bukan dipilih manual) agar pesanan tidak salah meja.
export const ChangeTableModal: React.FC = () => {
  const { isTableModalOpen, closeTableModal, selectedTable } = useApp();
  if (!isTableModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#31302d]/60 backdrop-blur-xs flex items-end justify-center p-0"
      onClick={(e) => { if (e.target === e.currentTarget) closeTableModal(); }}
    >
      <div className="bg-white w-full max-w-md rounded-t-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-sans font-bold text-[18px] text-[#1c1c19]">Pindah / Ubah Meja</h3>
          <button onClick={closeTableModal} className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant cursor-pointer">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
        <p className="font-sans text-[13px] text-on-surface-variant leading-relaxed">
          Anda sedang memesan untuk <strong>Meja {selectedTable}</strong>. Untuk pindah meja, pindai kode QR pada meja tujuan
          dengan kamera ponsel, atau minta bantuan pelayan.
        </p>
        <button onClick={closeTableModal} className="w-full h-11 bg-primary text-on-primary rounded-lg font-sans font-semibold text-[14px] shadow-md cursor-pointer">
          Mengerti
        </button>
      </div>
    </div>
  );
};
