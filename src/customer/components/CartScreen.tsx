import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';

export const CartScreen: React.FC = () => {
  const {
    selectedTable,
    cartItems,
    cartCount,
    cartSubtotal,
    cartServiceFee,
    cartTax,
    cartTotal,
    updateCartItemQty,
    removeCartItem,
    submitOrder,
    navigate,
    openDetail,
    extraOptions = [],
    formatRupiah,
    tableNotes,
    setTableNotes,
  } = useApp() as any;

  const [paymentMode, setPaymentMode] = useState<'qris' | 'cashier'>('cashier');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kitchenToastVisible, setKitchenToastVisible] = useState(false);

  const handleOrderSubmission = async () => {
    setIsSubmitting(true);

    try {
      // Trigger festive confetti
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#58252C', '#D97736', '#FFB2B9', '#2B2325'],
      });
    } catch {
      // ignore
    }

    setKitchenToastVisible(true);
    await submitOrder(paymentMode, tableNotes);
    setTimeout(() => {
      setIsSubmitting(false);
      setKitchenToastVisible(false);
      navigate('status');
    }, 900);
  };

  return (
    <div className="flex flex-col w-full pb-28 pt-16 bg-surface min-h-screen">
      {/* Table & Branch Bar */}
      <div className="px-4 pt-3 pb-1">
        <div className="bg-surface-container-high rounded-2xl p-3 flex items-center justify-between shadow-xs border border-[#eae3d9]/70">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[18px]">table_restaurant</span>
            </div>
            <div className="min-w-0">
              <p className="font-sans font-bold text-[14px] text-primary truncate">
                Pesanan Meja {selectedTable}
              </p>
              <p className="font-sans text-[11px] text-on-surface-variant flex items-center gap-1 truncate">
                <span className="material-symbols-outlined text-[13px] text-secondary">location_on</span>
                Surabaya, Jawa Timur
              </p>
            </div>
          </div>
          <span className="shrink-0 px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-sans text-[11px] font-bold flex items-center gap-1 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
            Aktif
          </span>
        </div>
      </div>

      {/* Section Header: Daftar Hidangan */}
      <div className="px-4 pt-3">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[20px]">room_service</span>
            <h2 className="font-sans font-bold text-[16px] text-on-surface">
              Daftar Hidangan ({cartCount} Item)
            </h2>
          </div>
          <button
            onClick={() => navigate('menu')}
            className="font-sans text-[12px] font-semibold text-secondary hover:text-on-secondary-fixed-variant transition-colors flex items-center gap-0.5 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[15px]">add_circle</span> Tambah Menu
          </button>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="px-4 space-y-3 pt-1">
        {cartItems.map((item: any) => (
          <div
            key={item.cartItemId}
            className="bg-surface-container-lowest rounded-2xl p-3.5 shadow-xs border border-[#eae3d9]/70 transition-all hover:shadow-sm"
          >
            <div className="flex gap-3">
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 rounded-xl object-cover shrink-0 bg-surface-container"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <h3 className="font-sans font-bold text-[14px] text-primary truncate">
                    {item.name}
                  </h3>
                  <span className="font-sans font-bold text-[14px] text-primary shrink-0">
                    {formatRupiah(item.totalPrice)}
                  </span>
                </div>
                <p className="font-sans text-[11px] text-on-surface-variant mt-0.5">
                  {item.subtitleDesc || `${item.quantity}x porsi (${formatRupiah(item.basePrice)})`}
                </p>

                {/* Customization Pills */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.customization?.kuah === 'pisah' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-sans text-[10px] font-medium">
                      <span className="material-symbols-outlined text-[12px] text-secondary">soup_kitchen</span>
                      Kuah pisah
                    </span>
                  )}
                  {item.customization?.pedas === '0' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-sans text-[10px] font-medium">
                      <span className="material-symbols-outlined text-[12px] text-secondary">check_circle</span>
                      Tidak pedas
                    </span>
                  )}
                  {item.customization?.pedas === '1' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-sans text-[10px] font-medium">
                      <span className="material-symbols-outlined text-[12px] text-secondary">local_fire_department</span>
                      Pedas sedang
                    </span>
                  )}
                  {item.customization?.pedas === '2' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-sans text-[10px] font-medium">
                      <span className="material-symbols-outlined text-[12px] text-secondary">local_fire_department</span>
                      Mantap 🔥
                    </span>
                  )}

                  {item.customization?.extras?.map((ext: string, i: number) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed font-sans text-[10px] font-semibold"
                    >
                      +{ext} (+{formatRupiah(extraOptions.find((e: any) => e.name === ext)?.price ?? 0)})
                    </span>
                  ))}

                  {item.customization?.kitchenNotes && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-sans text-[10px] font-medium truncate max-w-full">
                      {item.customization.kitchenNotes}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Steppers & Action Links */}
            <div className="mt-3 pt-2 flex items-center justify-between border-t border-[#eae3d9]/40">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label="Kurangi jumlah"
                  onClick={() => updateCartItemQty(item.cartItemId, -1)}
                  className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-primary active:scale-90 transition-transform cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">remove</span>
                </button>
                <span className="font-sans font-bold text-[14px] text-primary w-6 text-center">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  aria-label="Tambah jumlah"
                  onClick={() => updateCartItemQty(item.cartItemId, 1)}
                  className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-primary active:scale-90 transition-transform cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('menu')}
                  className="font-sans text-[11px] font-medium text-on-surface-variant hover:text-primary flex items-center gap-0.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">tune</span> Ubah
                </button>
                <button
                  type="button"
                  onClick={() => removeCartItem(item.cartItemId)}
                  className="font-sans text-[11px] font-medium text-error hover:text-on-error-container flex items-center gap-0.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">delete</span> Hapus
                </button>
              </div>
            </div>
          </div>
        ))}

        {cartItems.length === 0 && (
          <div className="bg-surface-container-lowest rounded-2xl p-8 text-center border border-[#eae3d9]/70 space-y-3">
            <span className="material-symbols-outlined text-4xl text-outline">shopping_cart_checkout</span>
            <p className="font-sans font-bold text-[15px] text-on-surface">Keranjang Anda masih kosong</p>
            <p className="font-sans text-[12px] text-on-surface-variant">Pilih menu favorit untuk dinikmati di Meja {selectedTable}</p>
            <button
              onClick={() => navigate('menu')}
              className="mt-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-sans font-semibold text-[13px] shadow-sm hover:bg-primary-container cursor-pointer"
            >
              Buka Katalog Menu
            </button>
          </div>
        )}
      </div>

      {cartItems.length > 0 && (
        <>
          {/* Catatan Meja untuk Dapur & Pelayan */}
          <div className="px-4 pt-3.5">
            <div className="bg-surface-container-lowest rounded-2xl p-3.5 shadow-xs border border-[#eae3d9]/70 space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[20px]">edit_note</span>
                <label htmlFor="table-notes" className="font-sans font-bold text-[13px] text-primary">
                  Catatan Meja untuk Dapur &amp; Pelayan
                </label>
              </div>
              <div className="relative">
                <textarea
                  id="table-notes"
                  value={tableNotes}
                  onChange={(e) => setTableNotes(e.target.value)}
                  maxLength={100}
                  rows={2}
                  placeholder="Contoh: Jangan pakai daun bawang, tolong pisahkan sendok garpu..."
                  className="w-full bg-surface-container-low rounded-xl p-2.5 font-sans text-[12px] text-on-surface placeholder:text-on-surface-variant/70 border border-[#eae3d9]/60 focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              <div className="flex items-center justify-between text-on-surface-variant font-sans text-[11px]">
                <span className="flex items-center gap-1 text-[11px]">
                  <span className="material-symbols-outlined text-[13px] text-secondary">campaign</span>
                  Langsung tercetak di Kitchen Display System
                </span>
                <span>{tableNotes.length}/100</span>
              </div>
            </div>
          </div>

          {/* Pilihan Metode Transaksi */}
          <div className="px-4 pt-3.5">
            <div className="bg-surface-container-lowest rounded-2xl p-3.5 shadow-xs border border-[#eae3d9]/70 space-y-2.5">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
                <h3 className="font-sans font-bold text-[14px] text-primary">Pilihan Metode Transaksi</h3>
              </div>

              <div className="space-y-2">
                {/* QRIS Option */}
                <label
                  onClick={() => setPaymentMode('qris')}
                  className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                    paymentMode === 'qris'
                      ? 'bg-surface-container-highest border-primary/30 shadow-xs'
                      : 'bg-surface-container-low border-transparent hover:bg-surface-container'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_mode"
                    value="qris"
                    checked={paymentMode === 'qris'}
                    onChange={() => setPaymentMode('qris')}
                    className="mt-1 accent-primary cursor-pointer"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-sans font-bold text-[13px] text-on-surface">
                        Bayar Langsung via QRIS
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-sans text-[10px] font-bold">
                        Paling Cepat
                      </span>
                    </div>
                    <p className="font-sans text-[11px] text-on-surface-variant mt-0.5 leading-snug">
                      Pesanan langsung diteruskan ke dapur. Kasir akan mengonfirmasi pembayaran QRIS Anda di meja.
                    </p>
                  </div>
                </label>

                {/* Cashier Option */}
                <label
                  onClick={() => setPaymentMode('cashier')}
                  className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                    paymentMode === 'cashier'
                      ? 'bg-surface-container-highest border-primary/30 shadow-xs'
                      : 'bg-surface-container-low border-transparent hover:bg-surface-container'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_mode"
                    value="cashier"
                    checked={paymentMode === 'cashier'}
                    onChange={() => setPaymentMode('cashier')}
                    className="mt-1 accent-primary cursor-pointer"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-sans font-bold text-[13px] text-on-surface">
                        Bayar Nanti di Kasir
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-surface-variant text-on-surface-variant font-sans text-[10px] font-bold">
                        Tunai / EDC
                      </span>
                    </div>
                    <p className="font-sans text-[11px] text-on-surface-variant mt-0.5 leading-snug">
                      Tiket tetap dikirim ke dapur sekarang, selesaikan pembayaran setelah santap selesai.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Rincian Pembayaran */}
          <div className="px-4 pt-3.5">
            <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-[#eae3d9]/70 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-sans font-bold text-[14px] text-primary">Rincian Pembayaran</h3>
                <span className="font-sans text-[11px] px-2 py-0.5 bg-surface-container rounded-md text-on-surface-variant font-medium">
                  Billing Meja
                </span>
              </div>

              <div className="space-y-1.5 font-sans text-[12px]">
                <div className="flex justify-between items-center text-on-surface-variant">
                  <span>Subtotal Menu</span>
                  <span className="font-sans font-bold text-[13px] text-on-surface">
                    {formatRupiah(cartSubtotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    Biaya Layanan Meja (5%)
                    <span
                      className="material-symbols-outlined text-[13px] text-on-surface-variant"
                      title="Biaya operasional pelayanan meja"
                    >
                      help_outline
                    </span>
                  </span>
                  <span className="text-on-surface font-medium">{formatRupiah(cartServiceFee)}</span>
                </div>
                <div className="flex justify-between items-center text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    PB1 Pajak Daerah (10%)
                    <span
                      className="material-symbols-outlined text-[13px] text-on-surface-variant"
                      title="Pajak restoran pemerintah kota"
                    >
                      help_outline
                    </span>
                  </span>
                  <span className="text-on-surface font-medium">{formatRupiah(cartTax)}</span>
                </div>
              </div>

              {/* Total Row */}
              <div className="pt-2 bg-surface-container-low -mx-4 px-4 py-3 rounded-b-2xl flex items-center justify-between border-t border-[#eae3d9]/50">
                <div>
                  <span className="font-sans text-[10px] text-on-surface-variant block uppercase tracking-wider font-bold">
                    Total Pembayaran
                  </span>
                  <span className="font-sans text-[22px] font-bold text-primary leading-tight">
                    {formatRupiah(cartTotal)}
                  </span>
                </div>
                <span className="material-symbols-outlined text-secondary text-[26px]">receipt</span>
              </div>
            </div>
          </div>

          {/* Verification info note */}
          <div className="px-4 pt-2.5">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-container-high text-on-surface-variant border border-[#eae3d9]/50">
              <span className="material-symbols-outlined text-secondary text-[18px] shrink-0">
                verified_user
              </span>
              <p className="font-sans text-[11px] leading-snug">
                Pesanan terikat langsung dengan nomor{' '}
                <span className="font-bold text-primary">Meja {selectedTable}</span> yang terverifikasi via QR Code meja.
              </p>
            </div>
          </div>

          {/* Main Submission Button */}
          <div className="px-4 pt-3.5 pb-6">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleOrderSubmission}
              className={`w-full h-12 text-on-primary rounded-xl font-sans font-bold text-[14px] flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all cursor-pointer ${
                isSubmitting ? 'bg-secondary' : 'bg-primary hover:bg-primary-container'
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  <span>Menghubungkan ke Dapur (KDS)...</span>
                </>
              ) : (
                <>
                  <span>Kirim Pesanan ke Dapur (KDS)</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
            <p className="text-center font-sans text-[11px] text-on-surface-variant mt-2 flex items-center justify-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[13px] text-secondary">schedule</span>
              Rata-rata penyajian: 12 - 18 menit
            </p>
          </div>
        </>
      )}

      {/* Kitchen Feedback Toast Banner */}
      {kitchenToastVisible && (
        <div className="fixed top-20 left-4 right-4 z-50 max-w-md mx-auto bg-primary text-on-primary rounded-2xl p-4 shadow-2xl flex items-center gap-3 border border-secondary/30 animate-in slide-in-from-top duration-300">
          <div className="w-9 h-9 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">done_all</span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-sans font-bold text-[14px] text-on-primary leading-tight">
              Tiket Diterima Dapur!
            </h4>
            <p className="font-sans text-[12px] text-inverse-on-surface mt-0.5 truncate">
              Dapur mulai menyiapkan Meja {selectedTable}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
