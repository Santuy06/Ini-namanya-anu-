import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TableItem } from '../types';

const MejaPelangganViewInner: React.FC = () => {
  const {
    tables,
    selectedTableId,
    setSelectedTableId,
    setActiveView,
    setOrderTableNumber,
    setOrderCustomerName,
    setSelectedBillId,
    openReceiptModal,
    bills
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'terisi' | 'checkout' | 'kosong'>('all');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Filtered tables
  const filteredTables = tables.filter((table) => {
    const matchesSearch =
      table.number.includes(searchQuery) ||
      (table.name && table.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      table.statusLabel.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'all') return true;
    if (filterStatus === 'kosong') return table.status === 'kosong';
    if (filterStatus === 'checkout') return table.status === 'checkout';
    if (filterStatus === 'terisi') {
      return table.status !== 'kosong';
    }
    return true;
  });

  const selectedTable = tables.find((t) => t.number === selectedTableId) || tables[2]; // Default Meja 03

  const handleSelectTable = (table: TableItem) => {
    setSelectedTableId(table.number);
    setMobileDrawerOpen(true);
  };

  const handleBukaPesanan = (tableNumber: string) => {
    setOrderTableNumber(tableNumber);
    setOrderCustomerName('');
    setMobileDrawerOpen(false);
    setActiveView('pesanan-baru');
  };

  const handleBukaCheckout = (tableNumber: string) => {
    // Find bill matching table
    const matchedBill = bills.find((b) => b.tableNumber === tableNumber);
    if (matchedBill) {
      setSelectedBillId(matchedBill.id);
    }
    setMobileDrawerOpen(false);
    setActiveView('checkout');
  };

  const handleViewReceipt = () => {
    const matchedBill = bills.find((b) => b.tableNumber === selectedTable.number) || bills[0];
    openReceiptModal(matchedBill);
  };

  // Metrics counts
  const occupiedCount = tables.filter((t) => t.status !== 'kosong').length;
  const emptyCount = tables.filter((t) => t.status === 'kosong').length;
  const checkoutCount = tables.filter((t) => t.status === 'checkout').length;
  const readyCount = tables.filter((t) => t.status === 'siap_diantar').length;

  return (
    <div className="flex flex-col w-full pb-24 md:pb-8">
      {/* Sub-Header Title & Action */}
      <div className="px-3 sm:px-6 pt-3 pb-2 flex items-center justify-between gap-3">
        <div>
          <div className="hidden md:flex items-center gap-1.5 text-xs text-[#524344] mb-0.5">
            <span className="font-semibold text-[#1c1c19]">Rawon Gusti Surabaya</span>
            <span>/</span>
            <span>Layanan dine-in</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#3d1018] tracking-tight">
            Meja &amp; Pelanggan
          </h1>
          <p className="text-xs sm:text-sm text-[#524344]">
            Monitoring layanan santap di tempat real-time
          </p>
        </div>
        <button
          onClick={() => handleBukaPesanan('08')}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#58252c] hover:bg-[#3d1018] text-white shadow-sm active:scale-95 transition-all shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span className="font-semibold text-xs sm:text-sm">Pesanan Baru</span>
        </button>
      </div>

      {/* 4 Operational Metric Cards */}
      <div className="px-3 sm:px-6 py-2.5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Meja Terisi */}
          <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-[#ebe8e3] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#524344] uppercase tracking-wider">
                Meja Terisi
              </span>
              <span className="material-symbols-outlined text-[#3d1018] text-[20px]">
                table_restaurant
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#1c1c19] tabular-nums">
                {occupiedCount}
                <span className="text-base text-[#847374] font-medium">/{tables.length}</span>
              </span>
            </div>
            <span className="mt-1 text-xs text-[#524344]">{emptyCount} meja siap pakai</span>
          </div>

          {/* Pelanggan */}
          <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-[#ebe8e3] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#524344] uppercase tracking-wider">
                Pelanggan
              </span>
              <span className="material-symbols-outlined text-[#994703] text-[20px]">
                group
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#1c1c19] tabular-nums">
                23
              </span>
              <span className="text-xs text-[#524344]">orang</span>
            </div>
            <span className="mt-1 text-xs text-[#524344]">Sedang dilayani</span>
          </div>

          {/* Siap Diantar */}
          <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-[#ebe8e3] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#994703]">Siap Diantar</span>
              <span className="material-symbols-outlined text-[#994703] text-[20px]">
                schedule
              </span>
            </div>
            <div className="mt-1.5">
              <span className="text-lg sm:text-xl font-bold text-[#1c1c19]">
                {readyCount} Meja
              </span>
              <p className="text-xs text-[#994703] font-semibold truncate mt-0.5">
                Meja 09 (4 item)
              </p>
            </div>
          </div>

          {/* Minta Checkout */}
          <div className="bg-[#ffdbc9]/60 p-3.5 rounded-2xl shadow-sm border border-[#fc934f]/30 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#753400]">Minta Checkout</span>
              <span className="material-symbols-outlined text-[#753400] text-[20px]">
                receipt_long
              </span>
            </div>
            <div className="mt-1.5">
              <span className="text-lg sm:text-xl font-bold text-[#321200]">
                {checkoutCount} Meja
              </span>
              <p className="text-xs text-[#753400] font-medium truncate mt-0.5">
                Menunggu kasir
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Chips */}
      <div className="px-3 sm:px-6 pt-2 pb-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#847374] text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari meja atau nama pelanggan..."
            className="w-full h-11 pl-10 pr-9 rounded-xl bg-white text-[#1c1c19] placeholder-[#847374] text-sm shadow-sm border border-[#ebe8e3] outline-none focus:border-[#3d1018] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#f0ede9] flex items-center justify-center text-[#524344]"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
              filterStatus === 'all'
                ? 'bg-[#3d1018] text-white shadow-sm'
                : 'bg-white text-[#524344] border border-[#ebe8e3] hover:bg-[#f6f3ee]'
            }`}
          >
            <span>Semua meja</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                filterStatus === 'all' ? 'bg-white/20 text-white' : 'bg-[#ebe8e3] text-[#524344]'
              }`}
            >
              12
            </span>
          </button>
          <button
            onClick={() => setFilterStatus('terisi')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
              filterStatus === 'terisi'
                ? 'bg-[#3d1018] text-white shadow-sm'
                : 'bg-white text-[#524344] border border-[#ebe8e3] hover:bg-[#f6f3ee]'
            }`}
          >
            <span>Terisi</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                filterStatus === 'terisi' ? 'bg-white/20 text-white' : 'bg-[#ebe8e3] text-[#524344]'
              }`}
            >
              {occupiedCount}
            </span>
          </button>
          <button
            onClick={() => setFilterStatus('checkout')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
              filterStatus === 'checkout'
                ? 'bg-[#3d1018] text-white shadow-sm'
                : 'bg-white text-[#524344] border border-[#ebe8e3] hover:bg-[#f6f3ee]'
            }`}
          >
            <span>Minta Checkout</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#ffdbc9] text-[#753400] text-[10px] font-bold">
              {checkoutCount}
            </span>
          </button>
          <button
            onClick={() => setFilterStatus('kosong')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
              filterStatus === 'kosong'
                ? 'bg-[#3d1018] text-white shadow-sm'
                : 'bg-white text-[#524344] border border-[#ebe8e3] hover:bg-[#f6f3ee]'
            }`}
          >
            <span>Kosong</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                filterStatus === 'kosong' ? 'bg-white/20 text-white' : 'bg-[#ebe8e3] text-[#524344]'
              }`}
            >
              {emptyCount}
            </span>
          </button>
        </div>
      </div>

      {/* Main Layout: Tables Grid + Desktop Detail Panel */}
      <div className="px-3 sm:px-6 pt-2 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left/Main Column: 12 Tables Grid (8 cols on desktop) */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredTables.map((table) => {
            const isSelected = selectedTableId === table.number;
            const isCheckout = table.status === 'checkout';
            const isSiap = table.status === 'siap_diantar';
            const isKosong = table.status === 'kosong';

            let cardBgClass = 'bg-white';
            let borderClass = 'border border-[#ebe8e3]';

            if (isCheckout) {
              cardBgClass = 'bg-[#ffdbc9]/30';
              borderClass = isSelected ? 'ring-2 ring-[#994703]' : 'border border-[#fc934f]/40';
            } else if (isSelected) {
              borderClass = 'ring-2 ring-[#3d1018] shadow-md';
            }

            return (
              <div
                key={table.id}
                onClick={() => handleSelectTable(table)}
                className={`rounded-2xl p-3.5 shadow-sm active:scale-[0.98] transition-all cursor-pointer flex flex-col justify-between min-h-[148px] relative overflow-hidden ${cardBgClass} ${borderClass}`}
              >
                {/* Accent stripe for checkout */}
                {isCheckout && (
                  <div className="absolute top-0 right-0 w-1.5 h-full bg-[#994703]"></div>
                )}
                {isSiap && (
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#994703]"></div>
                )}

                {/* Top Row: Number & Status Badge */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-2xl sm:text-3xl font-extrabold tabular-nums leading-none ${
                        isKosong ? 'text-[#847374]' : 'text-[#3d1018]'
                      }`}
                    >
                      {table.number}
                    </span>
                    {isCheckout && (
                      <span className="material-symbols-outlined text-[#994703] text-[18px]">
                        verified
                      </span>
                    )}
                  </div>

                  {isKosong ? (
                    <span className="px-2 py-0.5 rounded-md bg-[#ebe8e3] text-[#524344] text-[11px] font-semibold">
                      Kosong
                    </span>
                  ) : isCheckout ? (
                    <span className="px-2 py-0.5 rounded-md bg-[#ffdbc9] text-[#753400] text-[11px] font-bold shadow-xs">
                      Minta Checkout
                    </span>
                  ) : isSiap ? (
                    <span className="px-2 py-0.5 rounded-md bg-[#ffdbc9] text-[#753400] text-[11px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#994703] animate-pulse"></span>
                      Siap Diantar
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-[#f0ede9] text-[#524344] text-[11px] font-semibold">
                      {table.statusLabel}
                    </span>
                  )}
                </div>

                {/* Middle Info */}
                <div className="mt-1.5">
                  {isKosong ? (
                    <>
                      <p className="font-semibold text-sm text-[#1c1c19]">Meja Siap</p>
                      <p className="text-xs text-[#524344] mt-0.5">{table.capacity} kursi kapasitas</p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-sm sm:text-base text-[#1c1c19] truncate">
                        {table.name} {table.guestCount ? `• ${table.guestCount} org` : ''}
                      </p>
                      <p className="text-xs text-[#524344] mt-0.5 truncate">
                        {table.billId ? `Bill ${table.billId} • ` : ''}
                        {table.items ? `${table.items.length} item` : 'Aktif'}
                      </p>
                    </>
                  )}
                </div>

                {/* Bottom Row */}
                {isKosong ? (
                  <div className="mt-2 pt-2 bg-[#f6f3ee]/60 -mx-3.5 -mb-3.5 px-3.5 py-1.5 rounded-b-2xl flex items-center justify-between text-[#847374] text-xs">
                    <span>0 pesanan</span>
                    <span className="material-symbols-outlined text-[16px]">touch_app</span>
                  </div>
                ) : (
                  <div className="mt-2 pt-1 flex items-center justify-between text-xs">
                    <span className="text-[#847374] font-medium">{table.infoSubtitle}</span>
                    <span
                      className={`font-bold ${
                        isCheckout ? 'text-[#994703] text-sm' : 'text-[#3d1018]'
                      }`}
                    >
                      {table.totalFormatted}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Table Detail Panel (Desktop 4 cols) */}
        <div className="hidden lg:flex lg:col-span-4 bg-white rounded-2xl shadow-sm border border-[#ebe8e3] p-5 flex-col gap-4 sticky top-20">
          <div className="flex items-start justify-between border-b border-[#ebe8e3] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#847374] uppercase tracking-wider">
                  Meja Terpilih
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    selectedTable.status === 'kosong'
                      ? 'bg-[#ebe8e3] text-[#524344]'
                      : selectedTable.status === 'checkout'
                      ? 'bg-[#ffdbc9] text-[#753400]'
                      : 'bg-[#f0ede9] text-[#3d1018]'
                  }`}
                >
                  {selectedTable.statusLabel}
                </span>
              </div>
              <h2 className="font-serif text-3xl font-bold text-[#3d1018] mt-1">
                Meja {selectedTable.number}
              </h2>
              <p className="text-xs text-[#524344] mt-0.5">
                {selectedTable.name
                  ? `${selectedTable.name} • ${selectedTable.guestCount || 2} pelanggan`
                  : `${selectedTable.capacity} Kursi kapasitas tersedia`}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#f0ede9] flex items-center justify-center text-[#3d1018]">
              <span className="material-symbols-outlined text-[24px]">table_restaurant</span>
            </div>
          </div>

          {selectedTable.status === 'kosong' ? (
            <div className="py-6 flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-[#f6f3ee] flex items-center justify-center text-[#847374]">
                <span className="material-symbols-outlined text-[32px]">table_restaurant</span>
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[#1c1c19]">
                  Meja Ini Sedang Kosong
                </h3>
                <p className="text-xs text-[#524344] max-w-xs mt-1">
                  Siap menerima pelanggan baru untuk pesanan dine-in atau reservasi langsung.
                </p>
              </div>
              <button
                onClick={() => handleBukaPesanan(selectedTable.number)}
                className="w-full h-11 mt-2 rounded-xl bg-[#3d1018] hover:bg-[#58252c] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Buka Pesanan untuk Meja {selectedTable.number}</span>
              </button>
            </div>
          ) : (
            <>
              {/* Timeline Info */}
              <div className="bg-[#f6f3ee] p-3 rounded-xl flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#524344] uppercase tracking-wider text-[10px]">
                    Aktivitas Pesanan
                  </span>
                  <span className="font-mono text-[#847374]">
                    Bill {selectedTable.billId || 'B-031'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#524344]">
                  <span className="w-2 h-2 rounded-full bg-[#994703]"></span>
                  <span>{selectedTable.infoSubtitle} • Diteruskan ke kasir</span>
                </div>
              </div>

              {/* Items Snapshot */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs text-[#847374]">
                  <span className="font-bold uppercase tracking-wider text-[10px]">
                    Ringkasan Bill
                  </span>
                  <span>{selectedTable.items?.length || 4} Item Menu</span>
                </div>
                <div className="flex flex-col divide-y divide-[#ebe8e3] text-xs">
                  {(
                    selectedTable.items || [
                      { name: '2x Rawon Daging Spesial', price: 96000 },
                      { name: '2x Nasi Putih Wangi', price: 16000 },
                      { name: '2x Telur Asin Brebes', price: 18000 },
                      { name: '2x Es Sinom Tradisional', price: 30000 }
                    ]
                  ).map((item, idx) => (
                    <div key={idx} className="py-1.5 flex justify-between items-center">
                      <span className="text-[#1c1c19] truncate">{item.name}</span>
                      <span className="font-semibold text-[#1c1c19] tabular-nums shrink-0 ml-2">
                        Rp {item.price.toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Price */}
              <div className="flex items-center justify-between bg-[#f6f3ee] px-4 py-3 rounded-xl">
                <span className="text-xs font-bold text-[#1c1c19]">Total Pembayaran</span>
                <span className="font-serif text-2xl font-bold text-[#3d1018] tabular-nums">
                  {selectedTable.totalFormatted || 'Rp 207.900'}
                </span>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleViewReceipt}
                  className="h-11 rounded-xl bg-[#ebe8e3] hover:bg-[#d7c2c2] text-[#1c1c19] font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">receipt</span>
                  <span>Ringkasan Bill</span>
                </button>
                <button
                  onClick={() => handleBukaCheckout(selectedTable.number)}
                  className="h-11 rounded-xl bg-[#3d1018] hover:bg-[#58252c] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">point_of_sale</span>
                  <span>Buka Checkout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Drawer (Bottom Sheet) */}
      {mobileDrawerOpen && (
        <>
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 lg:hidden"
          ></div>
          <div className="fixed bottom-16 inset-x-0 z-50 bg-white rounded-t-3xl shadow-2xl p-5 border-t border-[#ebe8e3] max-h-[80vh] overflow-y-auto lg:hidden animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 bg-[#ebe8e3] rounded-full mx-auto mb-3"></div>

            <div className="flex items-start justify-between border-b border-[#ebe8e3] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-2xl font-bold text-[#3d1018]">
                    Meja {selectedTable.number}
                  </h2>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedTable.status === 'kosong'
                        ? 'bg-[#ebe8e3] text-[#524344]'
                        : selectedTable.status === 'checkout'
                        ? 'bg-[#ffdbc9] text-[#753400]'
                        : 'bg-[#f0ede9] text-[#3d1018]'
                    }`}
                  >
                    {selectedTable.statusLabel}
                  </span>
                </div>
                <p className="text-xs text-[#524344] mt-0.5">
                  {selectedTable.name
                    ? `${selectedTable.name} • ${selectedTable.guestCount || 2} pelanggan`
                    : `${selectedTable.capacity} Kursi kapasitas`}
                </p>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f0ede9] flex items-center justify-center text-[#524344]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {selectedTable.status === 'kosong' ? (
              <div className="py-6 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#f6f3ee] flex items-center justify-center text-[#847374]">
                  <span className="material-symbols-outlined text-[28px]">table_restaurant</span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1c1c19]">Meja Ini Kosong</h3>
                  <p className="text-xs text-[#524344] mt-0.5">
                    Buka pesanan baru untuk meja {selectedTable.number}
                  </p>
                </div>
                <button
                  onClick={() => handleBukaPesanan(selectedTable.number)}
                  className="w-full h-11 mt-2 rounded-xl bg-[#3d1018] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  <span>Buka Pesanan untuk Meja Ini</span>
                </button>
              </div>
            ) : (
              <div className="py-3 flex flex-col gap-3">
                <div className="bg-[#f6f3ee] p-3 rounded-xl flex flex-col gap-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#524344] text-[10px] uppercase">
                      Aktivitas
                    </span>
                    <span className="font-mono text-[#847374]">
                      Bill {selectedTable.billId || 'B-031'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[#524344] mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-[#994703]"></span>
                    <span>{selectedTable.infoSubtitle} • Diteruskan ke kasir</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-[#ebe8e3] p-3 text-xs flex flex-col gap-1.5">
                  <div className="flex justify-between items-center pb-1 border-b border-[#ebe8e3]">
                    <span className="font-bold text-[#1c1c19]">Ringkasan Bill</span>
                    <span className="text-[#847374]">8 Menu Dipesan</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2x Rawon Daging Spesial</span>
                    <span className="font-semibold">Rp 96.000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2x Nasi Putih Wangi</span>
                    <span className="font-semibold">Rp 16.000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2x Telur Asin Brebes &amp; Sambal</span>
                    <span className="font-semibold">Rp 18.000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2x Es Sinom Tradisional</span>
                    <span className="font-semibold">Rp 30.000</span>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-[#f6f3ee] px-4 py-3 rounded-xl">
                  <span className="text-xs font-bold text-[#1c1c19]">Total Tagihan</span>
                  <span className="font-serif text-xl font-bold text-[#3d1018] tabular-nums">
                    {selectedTable.totalFormatted || 'Rp 207.900'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={handleViewReceipt}
                    className="h-11 rounded-xl bg-[#ebe8e3] text-[#1c1c19] font-semibold text-xs flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">receipt</span>
                    <span>Ringkasan Bill</span>
                  </button>
                  <button
                    onClick={() => handleBukaCheckout(selectedTable.number)}
                    className="h-11 rounded-xl bg-[#3d1018] text-white font-semibold text-xs flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">point_of_sale</span>
                    <span>Buka Checkout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export const MejaPelangganView: React.FC = () => {
  const { tables } = useApp();
  if (!tables.length) return <div className="p-10 text-center text-sm text-[#524344]">Belum ada meja aktif. Jalankan supabase/seed.sql terlebih dahulu.</div>;
  return <MejaPelangganViewInner />;
};
