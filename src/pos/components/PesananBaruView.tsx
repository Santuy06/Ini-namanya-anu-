import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MenuItem } from '../types';

export const PesananBaruView: React.FC = () => {
  const {
    menuItems,
    menuCategories,
    cartItems,
    orderTableNumber,
    setOrderTableNumber,
    orderCustomerName,
    setOrderCustomerName,
    orderGuestCount,
    setOrderGuestCount,
    kitchenGeneralNote,
    setKitchenGeneralNote,
    addToCart,
    updateCartQuantity,
    updateCartItemNotes,
    sendOrderToKitchen,
    saveDraftOrder
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailExpanded, setDetailExpanded] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSuccessSent, setIsSuccessSent] = useState(false);

  // Edit Note Modal state
  const [editingNoteItem, setEditingNoteItem] = useState<{ id: string; name: string; notes: string } | null>(null);

  // Filter menu items
  const filteredMenu = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeCategory === 'Semua') return true;
    if (activeCategory === 'Favorit') return !!item.isFavorite;
    return item.category === activeCategory;
  });

  // Calculate totals
  const subtotal = cartItems.reduce((acc, curr) => acc + curr.menuItem.price * curr.quantity, 0);
  const totalItemCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const serviceCharge = Math.round(subtotal * 0.055); // 5.5%
  const pb1Tax = Math.round(subtotal * 0.1); // 10%
  const grandTotal = subtotal + serviceCharge + pb1Tax;

  const handleKirimKitchen = () => {
    if (cartItems.length === 0) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSuccessSent(true);
      sendOrderToKitchen();
      setTimeout(() => {
        setIsSuccessSent(false);
      }, 1800);
    }, 700);
  };

  const openNoteEditor = (menuItem: MenuItem, currentNote = '') => {
    setEditingNoteItem({
      id: menuItem.id,
      name: menuItem.name,
      notes: currentNote
    });
  };

  const saveNoteEditor = () => {
    if (editingNoteItem) {
      updateCartItemNotes(editingNoteItem.id, editingNoteItem.notes);
      setEditingNoteItem(null);
    }
  };

  return (
    <div className="flex flex-col w-full pb-48 md:pb-36 max-w-5xl mx-auto">
      {/* Top Workflow Context Ribbon */}
      <div className="px-3 sm:px-6 pt-3 pb-2 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-[#524344] text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#3d1018] text-white font-bold text-[10px]">
              1
            </span>
            <span className="font-bold text-[#3d1018]">Buat Pesanan</span>
            <span className="text-[#847374]">›</span>
            <span className="truncate">Kirim Kitchen</span>
            <span className="text-[#847374]">›</span>
            <span>Kasir</span>
          </div>
          <button
            onClick={saveDraftOrder}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#ebe8e3] hover:bg-[#d7c2c2] text-[#1c1c19] text-xs font-semibold active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[15px]">save</span>
            <span>Simpan Draf</span>
          </button>
        </div>

        {/* Table & Guest Selector Card */}
        <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-[#ebe8e3] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#994703] text-[18px]">
                table_restaurant
              </span>
              <span className="font-bold text-sm text-[#1c1c19]">Meja &amp; Pelanggan</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#ffdbc9] text-[#753400] text-[11px] font-bold">
              Dine-in • Draf Aktif
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Meja Dropdown Box */}
            <div className="bg-[#f6f3ee] rounded-xl p-2.5 flex flex-col justify-between">
              <span className="text-[11px] text-[#524344]">No. Meja</span>
              <div className="flex items-center justify-between mt-0.5">
                <select
                  value={orderTableNumber}
                  onChange={(e) => setOrderTableNumber(e.target.value)}
                  className="bg-transparent font-bold text-sm sm:text-base text-[#3d1018] outline-none cursor-pointer w-full appearance-none"
                >
                  {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(
                    (num) => (
                      <option key={num} value={num}>
                        Meja {num}
                      </option>
                    )
                  )}
                </select>
                <span className="material-symbols-outlined text-[#847374] text-[16px] pointer-events-none">
                  arrow_drop_down
                </span>
              </div>
            </div>

            {/* Nama Pelanggan Box */}
            <div className="bg-[#f6f3ee] rounded-xl p-2.5 flex flex-col justify-between">
              <span className="text-[11px] text-[#524344]">Pelanggan</span>
              <div className="flex items-center justify-between mt-0.5">
                <input
                  type="text"
                  value={orderCustomerName}
                  onChange={(e) => setOrderCustomerName(e.target.value)}
                  placeholder="Nama tamu..."
                  className="bg-transparent font-bold text-xs sm:text-sm text-[#1c1c19] outline-none w-full truncate"
                />
              </div>
            </div>

            {/* Jumlah Tamu Pax */}
            <div className="bg-[#f6f3ee] rounded-xl p-2.5 flex flex-col justify-between">
              <span className="text-[11px] text-[#524344]">Jumlah</span>
              <div className="flex items-center justify-between mt-0.5">
                <select
                  value={orderGuestCount}
                  onChange={(e) => setOrderGuestCount(parseInt(e.target.value, 10))}
                  className="bg-transparent font-bold text-xs sm:text-sm text-[#1c1c19] outline-none cursor-pointer w-full appearance-none"
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((num) => (
                    <option key={num} value={num}>
                      {num} orang
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined text-[#847374] text-[16px] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Category Tabs */}
      <div className="px-3 sm:px-6 flex flex-col gap-2.5 mt-1">
        {/* Search Bar */}
        <div className="relative flex items-center bg-white rounded-xl px-3.5 h-11 shadow-sm border border-[#ebe8e3]">
          <span className="material-symbols-outlined text-[#847374] text-[20px] mr-2">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari menu, kluwek, rawon, soto..."
            className="w-full bg-transparent text-sm text-[#1c1c19] placeholder-[#847374] outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="w-5 h-5 rounded-full bg-[#f0ede9] flex items-center justify-center text-[#524344] mr-1"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          )}
          <button
            title="Pencarian Suara"
            className="w-7 h-7 rounded-full bg-[#f0ede9] flex items-center justify-center text-[#524344] active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-[16px]">mic</span>
          </button>
        </div>

        {/* Category Horizontal Filter */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setActiveCategory('Semua')}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeCategory === 'Semua'
                ? 'bg-[#3d1018] text-white shadow-sm'
                : 'bg-white text-[#524344] border border-[#ebe8e3] hover:bg-[#f6f3ee]'
            }`}
          >
            <span>Semua menu</span>
            <span
              className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                activeCategory === 'Semua' ? 'bg-[#58252c] text-white' : 'bg-[#ebe8e3] text-[#524344]'
              }`}
            >
              {menuItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('Favorit')}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors ${
              activeCategory === 'Favorit'
                ? 'bg-[#3d1018] text-white shadow-sm'
                : 'bg-white text-[#524344] border border-[#ebe8e3] hover:bg-[#f6f3ee]'
            }`}
          >
            <span className="material-symbols-outlined text-[#994703] text-[15px]">star</span>
            <span>Favorit</span>
          </button>

          {menuCategories.filter((c) => menuItems.some((m) => m.category === c)).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeCategory === cat
                  ? 'bg-[#3d1018] text-white shadow-sm'
                  : 'bg-white text-[#524344] border border-[#ebe8e3] hover:bg-[#f6f3ee]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Catalog List */}
      <div className="px-3 sm:px-6 flex flex-col gap-3 mt-3">
        {filteredMenu.map((item) => {
          const cartEntry = cartItems.find((ci) => ci.menuItem.id === item.id);
          const quantity = cartEntry ? cartEntry.quantity : 0;
          const currentNotes = cartEntry ? cartEntry.notes : '';

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-3 shadow-sm border border-[#ebe8e3] flex flex-col gap-2.5 transition-shadow hover:shadow-md"
            >
              <div className="flex gap-3">
                {/* Photo with quantity badge */}
                <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-[#f0ede9]">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {quantity > 0 && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-[#3d1018] text-white text-[10px] font-bold shadow-xs">
                      {quantity}
                    </span>
                  )}
                  {item.isSignature && quantity === 0 && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-[#994703] text-white text-[9px] font-bold uppercase tracking-wider">
                      Khas
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm sm:text-base text-[#1c1c19] truncate">
                        {item.name}
                      </span>
                      {item.isFavorite && (
                        <span className="material-symbols-outlined text-[#994703] text-[15px]">
                          star
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#524344] mt-0.5 truncate">
                      {item.isFavorite ? 'Favorit • ' : ''}
                      {item.category} • {item.description}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <span className="font-bold text-sm sm:text-base text-[#3d1018] tabular-nums">
                      Rp {item.price.toLocaleString('id-ID')}
                    </span>

                    {/* Quantity Selector */}
                    {quantity > 0 ? (
                      <div className="flex items-center bg-[#f6f3ee] rounded-xl p-0.5 border border-[#ebe8e3]">
                        <button
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="w-7 h-7 rounded-lg bg-white text-[#3d1018] flex items-center justify-center font-bold text-sm shadow-xs active:scale-90 transition-transform"
                        >
                          <span className="material-symbols-outlined text-[16px]">remove</span>
                        </button>
                        <span className="w-8 text-center font-bold text-sm text-[#1c1c19] tabular-nums">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="w-7 h-7 rounded-lg bg-[#3d1018] text-white flex items-center justify-center font-bold text-sm shadow-xs active:scale-90 transition-transform"
                        >
                          <span className="material-symbols-outlined text-[16px]">add</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item, 1)}
                        className="w-8 h-8 rounded-xl bg-[#f0ede9] hover:bg-[#3d1018] text-[#3d1018] hover:text-white flex items-center justify-center font-bold active:scale-90 transition-all shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Kitchen Note Badge for this item */}
              {quantity > 0 && (
                <div className="flex items-center justify-between bg-[#f6f3ee] rounded-xl px-3 py-1.5 text-[#524344]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="material-symbols-outlined text-[#994703] text-[16px]">
                      edit_note
                    </span>
                    <span className="text-xs font-medium text-[#1c1c19] truncate">
                      {currentNotes || 'Tanpa catatan khusus'}
                    </span>
                  </div>
                  <button
                    onClick={() => openNoteEditor(item, currentNotes)}
                    className="text-xs text-[#994703] font-bold hover:underline shrink-0 ml-2"
                  >
                    Ubah
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Special General Kitchen Instruction */}
      <div className="px-3 sm:px-6 mt-4">
        <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-[#ebe8e3] flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-[#3d1018]">
            <span className="material-symbols-outlined text-[18px]">soup_kitchen</span>
            <span className="font-bold text-xs">Catatan Umum Dapur</span>
          </div>
          <textarea
            value={kitchenGeneralNote}
            onChange={(e) => setKitchenGeneralNote(e.target.value)}
            rows={2}
            className="w-full bg-[#f6f3ee] rounded-xl p-2.5 text-xs text-[#1c1c19] outline-none border border-transparent focus:border-[#3d1018] transition-colors resize-none"
            placeholder="Tambahkan catatan untuk koki dapur..."
          />
        </div>
      </div>

      {/* Sticky Bottom Cart & Checkout Bar */}
      <div className="fixed bottom-16 md:bottom-0 inset-x-0 md:left-64 z-30 bg-white/95 backdrop-blur-md px-4 py-3 shadow-[0_-4px_16px_rgba(43,35,37,0.08)] border-t border-[#ebe8e3]">
        <div className="max-w-4xl mx-auto">
          {/* Collapsible Total & Tax Preview Row */}
          <div className="flex items-center justify-between pb-2">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-xs text-[#524344]">
                <span>Subtotal ({totalItemCount} item)</span>
                <span className="w-1 h-1 rounded-full bg-[#847374]"></span>
                <span>Pajak PB1 10% + Layanan</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-bold text-[#3d1018] tabular-nums">
                  Rp {grandTotal.toLocaleString('id-ID')}
                </span>
                <span className="text-xs text-[#847374] line-through tabular-nums">
                  Rp {subtotal.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <button
              onClick={() => setDetailExpanded(!detailExpanded)}
              className="px-2.5 py-1 rounded-lg bg-[#f0ede9] text-[#1c1c19] text-xs font-semibold flex items-center gap-1 active:scale-95 transition-transform"
            >
              <span>Detail</span>
              <span
                className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${
                  detailExpanded ? 'rotate-180' : ''
                }`}
              >
                expand_less
              </span>
            </button>
          </div>

          {/* Collapsible Details Drawer */}
          {detailExpanded && (
            <div className="flex flex-col gap-1.5 py-2 mb-2 bg-[#f6f3ee] rounded-xl px-3 text-xs border border-[#ebe8e3] animate-in fade-in">
              {cartItems.map((ci) => (
                <div key={ci.menuItem.id} className="flex justify-between text-[#524344]">
                  <span>
                    {ci.menuItem.name} ({ci.quantity}x)
                  </span>
                  <span className="font-semibold text-[#1c1c19]">
                    Rp {(ci.menuItem.price * ci.quantity).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
              <div className="flex justify-between text-[#524344] pt-1.5 border-t border-[#ebe8e3]">
                <span>Biaya Layanan Restoran (5%)</span>
                <span>Rp {serviceCharge.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-[#524344]">
                <span>Pajak PB1 Restoran (10%)</span>
                <span>Rp {pb1Tax.toLocaleString('id-ID')}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-5 gap-2">
            <button
              onClick={saveDraftOrder}
              className="col-span-2 h-11 rounded-xl bg-[#f0ede9] hover:bg-[#ebe8e3] text-[#1c1c19] text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[18px]">bookmark</span>
              <span>Simpan Draf</span>
            </button>

            <button
              onClick={handleKirimKitchen}
              disabled={isSending || cartItems.length === 0}
              className={`col-span-3 h-11 rounded-xl text-white text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all ${
                isSuccessSent
                  ? 'bg-emerald-600'
                  : cartItems.length === 0
                  ? 'bg-[#847374] opacity-50 cursor-not-allowed'
                  : 'bg-[#3d1018] hover:bg-[#58252c]'
              }`}
            >
              {isSending ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">
                    autorenew
                  </span>
                  <span>Mengirim Tiket...</span>
                </>
              ) : isSuccessSent ? (
                <>
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Terkirim ke Kitchen!</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  <span>Kirim ke Kitchen</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Edit Item Note Modal */}
      {editingNoteItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl flex flex-col gap-3 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#ebe8e3] pb-2">
              <span className="font-bold text-sm text-[#3d1018]">
                Catatan: {editingNoteItem.name}
              </span>
              <button
                onClick={() => setEditingNoteItem(null)}
                className="w-6 h-6 rounded-full bg-[#f0ede9] flex items-center justify-center text-[#524344]"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <p className="text-xs text-[#524344]">
              Ketik instruksi khusus untuk koki dapur saat memasak menu ini:
            </p>

            <input
              type="text"
              value={editingNoteItem.notes}
              onChange={(e) =>
                setEditingNoteItem({ ...editingNoteItem, notes: e.target.value })
              }
              placeholder="Contoh: Tidak pedas / Sambal terpisah / Less ice..."
              className="w-full h-11 px-3.5 bg-[#f6f3ee] text-xs text-[#1c1c19] rounded-xl outline-none border border-[#ebe8e3] focus:border-[#3d1018]"
            />

            {/* Quick Note Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                'Tidak pedas',
                'Pedas sedang',
                'Pedas mantap',
                'Sambal pisah',
                'Less ice',
                'Bumbu kacang pisah',
                'Kuah pisah'
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() =>
                    setEditingNoteItem({
                      ...editingNoteItem,
                      notes: `Catatan: ${preset}`
                    })
                  }
                  className="px-2.5 py-1 rounded-lg bg-[#f0ede9] hover:bg-[#ebe8e3] text-[11px] font-medium text-[#1c1c19]"
                >
                  {preset}
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingNoteItem(null)}
                className="flex-1 h-10 rounded-xl bg-[#f0ede9] text-[#1c1c19] text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={saveNoteEditor}
                className="flex-1 h-10 rounded-xl bg-[#3d1018] text-white text-xs font-semibold shadow-sm"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
