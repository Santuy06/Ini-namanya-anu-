import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RESTAURANT_INFO } from '../data/menuData';

export const StatusScreen: React.FC = () => {
  const {
    activeOrder,
    selectedTable,
    callWaiter,
    waiterCalled,
    checkoutRequested,
    requestCheckout,
    navigate,
    showToast,
    formatRupiah,
  } = useApp();

  const [waPhone, setWaPhone] = useState('081234567890');
  const [waSent, setWaSent] = useState(false);
  const [isSendingWa, setIsSendingWa] = useState(false);
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [showWaiterToast, setShowWaiterToast] = useState(false);

  const handleSendWa = () => {
    if (!waPhone.trim()) return;
    setIsSendingWa(true);
    setTimeout(() => {
      setIsSendingWa(false);
      setWaSent(true);
      showToast('E-struk terkirim ke WhatsApp!', 'chat');
      setTimeout(() => setWaSent(false), 5000);
    }, 900);
  };

  const handleCopyWifi = () => {
    try {
      navigator.clipboard?.writeText(RESTAURANT_INFO.wifiPass);
    } catch {
      // ignore
    }
    setCopiedWifi(true);
    showToast(`Kata sandi WiFi "${RESTAURANT_INFO.wifiPass}" disalin!`, 'content_copy');
    setTimeout(() => setCopiedWifi(false), 2500);
  };

  const handleCallWaiterClick = () => {
    callWaiter();
    setShowWaiterToast(true);
  };

  if (!activeOrder) {
    return (
      <div className="flex flex-col items-center justify-center w-full px-6 pt-16 pb-28 bg-surface min-h-screen gap-3 text-center">
        <span className="material-symbols-outlined text-5xl text-secondary">receipt_long</span>
        <h2 className="font-serif text-xl font-bold text-primary">Belum ada pesanan</h2>
        <p className="font-sans text-[13px] text-on-surface-variant max-w-xs">Pesanan Anda akan muncul di sini beserta status dapurnya setelah dikirim.</p>
        <button onClick={() => navigate('menu')} className="mt-2 px-5 h-11 rounded-xl bg-primary text-on-primary font-sans font-semibold text-[14px] cursor-pointer">Lihat Menu</button>
      </div>
    );
  }

  const stage = activeOrder.statusStage || 2;
  const stagePercentages = {
    1: '25%',
    2: '50%',
    3: '75%',
    4: '100%',
  };

  const stageTitles = {
    1: 'Pesanan Diterima Dapur',
    2: 'Dapur Sedang Memasak',
    3: 'Makanan Siap Diantar',
    4: 'Pesanan Terhidang di Meja',
  };

  return (
    <div className="flex flex-col w-full px-4 pb-28 pt-16 bg-surface min-h-screen gap-3.5">
      {/* Status Estimasi Banner Card */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-4 shadow-sm border border-[#eae3d9]/70 mt-1">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-secondary-fixed/40 blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-secondary animate-ping" />
              <span className="font-sans text-[11px] uppercase tracking-wider text-secondary font-bold">
                {stageTitles[stage]}
              </span>
            </div>
            <p className="font-serif text-[22px] font-bold text-primary leading-tight">
              Tiket {activeOrder.orderNumbers && activeOrder.orderNumbers.length > 1 ? `${activeOrder.orderNumbers.length} pesanan` : activeOrder.ticketNumber}
            </p>
            <p className="font-sans text-[12px] text-on-surface-variant mt-0.5">
              Dipesan pukul {activeOrder.orderTime} • Meja {selectedTable}
            </p>
          </div>

          <div className="flex flex-col items-end">
            <div className="px-3 py-1.5 rounded-xl bg-surface-container-high text-right border border-[#eae3d9]/50">
              <span className="block font-sans text-[10px] text-on-surface-variant font-medium">
                Estimasi Siap
              </span>
              <span className="font-sans text-[16px] text-primary font-bold">
                {stage === 4 ? 'Siap Santap' : activeOrder.estimatedMinutes}
              </span>
            </div>
          </div>
        </div>

        {/* Micro Progress Bar */}
        <div className="mt-3.5 pt-2.5 flex flex-col gap-1.5 border-t border-[#eae3d9]/40">
          <div className="flex justify-between items-center text-on-surface-variant font-sans text-[11px]">
            <span>Kematangan Kuah Kluwek</span>
            <span className="text-secondary font-bold">Tahap {stage} dari 4</span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-container to-secondary rounded-full transition-all duration-700 ease-out"
              style={{ width: stagePercentages[stage] }}
            />
          </div>
        </div>
      </div>

      {/* Vertical Stepper Card */}
      <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm border border-[#eae3d9]/70">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sans font-bold text-[15px] text-primary flex items-center gap-2">
            <span
              className="material-symbols-outlined text-[20px] text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              timeline
            </span>
            Proses Dapur &amp; Saji
          </h2>
          <div className="flex items-center gap-2">
            <span className="font-sans text-[11px] px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold shadow-xs">
              Langsung
            </span>
          </div>
        </div>

        <div className="relative pl-6 space-y-5 before:absolute before:left-3 before:top-2 before:bottom-3 before:w-0.5 before:bg-[#eae3d9]">
          {/* Step 1: Pesanan Diterima Dapur */}
          <div className="relative">
            <div
              className={`absolute -left-[30px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-on-primary shadow-xs transition-all ${
                stage >= 1 ? 'bg-primary-container' : 'bg-surface-container-highest text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">check</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <span className="font-sans font-bold text-[13px] text-on-surface">
                  Pesanan Diterima Dapur
                </span>
                <span className="font-sans text-[11px] text-on-surface-variant">
                  {activeOrder.orderTime}
                </span>
              </div>
              <p className="font-sans text-[11px] text-on-surface-variant mt-0.5">
                Pesanan masuk sistem dan diverifikasi kepala koki.
              </p>
            </div>
          </div>

          {/* Step 2: Sedang Dimasak */}
          <div className="relative">
            <div
              className={`absolute -left-[30px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-on-secondary shadow-xs transition-all ${
                stage === 2
                  ? 'bg-secondary animate-pulse ring-2 ring-secondary/30'
                  : stage > 2
                  ? 'bg-primary-container text-on-primary'
                  : 'bg-surface-container-highest text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">
                {stage > 2 ? 'check' : 'skillet'}
              </span>
            </div>

            <div
              className={`flex flex-col p-3 rounded-xl -ml-1 transition-all ${
                stage === 2 ? 'bg-surface-container-low border border-[#eae3d9]/70' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`font-sans font-bold text-[13px] flex items-center gap-1.5 ${
                    stage === 2 ? 'text-secondary' : 'text-on-surface'
                  }`}
                >
                  Sedang Dimasak
                  {stage === 2 && <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />}
                </span>
                {stage === 2 && (
                  <span className="font-sans text-[10px] px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold">
                    Aktif
                  </span>
                )}
              </div>
              <p className="font-sans text-[11px] text-on-surface mt-1 leading-snug">
                Kuah kluwek rempah &amp; potongan daging rawon sedang dimatangkan di kuali tanah liat.
              </p>
              {stage === 2 && (
                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-[#eae3d9]/40 text-on-surface-variant font-sans text-[10px]">
                  <span className="material-symbols-outlined text-[15px] text-secondary">
                    local_fire_department
                  </span>
                  <span>Api stabil, racikan bumbu khas Jawa Timur</span>
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Siap Diantar Waiter */}
          <div className={`relative ${stage < 3 ? 'opacity-70' : ''}`}>
            <div
              className={`absolute -left-[30px] top-0 w-6 h-6 rounded-full flex items-center justify-center shadow-xs transition-all ${
                stage > 3
                  ? 'bg-primary-container text-on-primary'
                  : stage === 3
                  ? 'bg-secondary text-on-secondary animate-pulse'
                  : 'bg-surface-container-highest text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">
                {stage > 3 ? 'check' : 'room_service'}
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <span className="font-sans font-bold text-[13px] text-on-surface">
                  Siap Diantar Waiter
                </span>
                <span className="font-sans text-[10px] text-on-surface-variant font-medium">
                  {stage === 3 ? 'Sedang Diantar' : 'Tahap Berikutnya'}
                </span>
              </div>
              <p className="font-sans text-[11px] text-on-surface-variant mt-0.5">
                Penataan toge pendek, telur asin, dan sambal terasi.
              </p>
            </div>
          </div>

          {/* Step 4: Terhidang di Meja */}
          <div className={`relative ${stage < 4 ? 'opacity-60' : ''}`}>
            <div
              className={`absolute -left-[30px] top-0 w-6 h-6 rounded-full flex items-center justify-center shadow-xs transition-all ${
                stage === 4
                  ? 'bg-primary text-on-primary ring-2 ring-primary/40'
                  : 'bg-surface-container-highest text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">dinner_dining</span>
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-bold text-[13px] text-on-surface">
                Terhidang di Meja {selectedTable}
              </span>
              <p className="font-sans text-[11px] text-on-surface-variant mt-0.5">
                Disajikan hangat dengan kerupuk udang renyah.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Guest Table Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleCallWaiterClick}
          className={`flex items-center justify-center gap-2 h-12 px-3 rounded-xl shadow-xs active:scale-95 transition-all text-[13px] font-sans font-bold cursor-pointer border border-[#eae3d9]/70 ${
            waiterCalled
              ? 'bg-secondary-fixed text-on-secondary-fixed ring-1 ring-secondary/50'
              : 'bg-surface-container-lowest text-primary hover:bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-[20px] text-secondary">
            {waiterCalled ? 'hourglass_top' : 'notifications_active'}
          </span>
          <span>{waiterCalled ? 'Pelayan Menuju Meja' : 'Panggil Waiter'}</span>
        </button>

        <button
          onClick={() => navigate('menu')}
          className="flex items-center justify-center gap-2 h-12 px-3 rounded-xl bg-primary text-on-primary shadow-xs hover:bg-primary-container active:scale-95 transition-all text-[13px] font-sans font-bold cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          <span>Tambah Pesanan</span>
        </button>
      </div>

      {/* Waiter Toast Notification Card */}
      {showWaiterToast && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-secondary-fixed text-on-secondary-fixed shadow-md transition-all border border-secondary/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">person_pin_circle</span>
            <span className="font-sans text-[12px] font-bold">
              Waiter Mas Budi segera merapat ke Meja {selectedTable}
            </span>
          </div>
          <button
            onClick={() => setShowWaiterToast(false)}
            className="material-symbols-outlined text-[16px] cursor-pointer hover:opacity-75"
          >
            close
          </button>
        </div>
      )}

      {/* Rincian Hidangan Card */}
      <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm border border-[#eae3d9]/70 flex flex-col gap-3">
        <div className="flex items-center justify-between pb-1">
          <h3 className="font-sans font-bold text-[14px] text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary">restaurant</span>
            Rincian Hidangan
          </h3>
          <span className="font-sans text-[11px] text-on-surface-variant font-medium">
            {activeOrder.items?.length || 0} Macam Menu
          </span>
        </div>

        {/* Menu Items Breakdown */}
        <div className="space-y-2.5">
          {activeOrder.items?.map((item: any) => (
            <div
              key={item.cartItemId}
              className="flex items-start gap-3 py-2 bg-surface-container-low/70 p-2.5 rounded-xl border border-[#eae3d9]/50"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 rounded-xl object-cover shrink-0 bg-surface-variant"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="font-sans font-bold text-[13px] text-on-surface truncate">
                    {item.name}
                  </p>
                  <span className="font-sans text-[13px] text-primary font-bold ml-2">
                    {formatRupiah(item.totalPrice)}
                  </span>
                </div>
                <p className="font-sans text-[11px] text-secondary font-semibold">
                  {item.subtitleDesc || `${item.quantity}x Porsi`}
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {item.customization?.kitchenNotes && (
                    <span className="font-sans text-[10px] px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant">
                      {item.customization.kitchenNotes}
                    </span>
                  )}
                  {item.customization?.kuah === 'pisah' && (
                    <span className="font-sans text-[10px] px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant">
                      Kuah Pisah
                    </span>
                  )}
                  {item.customization?.pedas === '1' && (
                    <span className="font-sans text-[10px] px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant">
                      Pedas Sedang
                    </span>
                  )}
                  {item.customization?.pedas === '0' && (
                    <span className="font-sans text-[10px] px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant">
                      Tidak Pedas
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Card Status Transaksi & E-Struk */}
      <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm border border-[#eae3d9]/70">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-[20px] text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            <span className="font-sans font-bold text-[14px] text-on-surface">
              Status Pembayaran
            </span>
          </div>
          <span className="font-sans text-[11px] px-2.5 py-1 rounded-full bg-secondary text-on-secondary font-bold shadow-xs">
            {activeOrder.paymentStatus}
          </span>
        </div>

        <div className="space-y-1.5 py-1 font-sans text-[12px]">
          <div className="flex justify-between text-on-surface-variant">
            <span>Metode Bayar</span>
            <span className="font-sans font-bold text-[12px] text-on-surface flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-primary">qr_code_scanner</span>
              {activeOrder.paymentMethod === 'qris' ? 'QRIS Dinamis' : 'Bayar di Kasir'}
            </span>
          </div>
          <div className="flex justify-between text-on-surface-variant">
            <span>Total Tagihan (Inc. PB1 10%)</span>
            <span className="font-sans font-bold text-[13px] text-primary">
              {formatRupiah(activeOrder.total)}
            </span>
          </div>
          <div className="flex justify-between text-on-surface-variant">
            <span>Waktu Transaksi</span>
            <span>{activeOrder.orderTime}</span>
          </div>
        </div>

        {/* WhatsApp E-Receipt Module */}
        <div className="mt-3 pt-3 bg-surface-container-low rounded-xl p-3 flex flex-col gap-2 border border-[#eae3d9]/50">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-secondary">chat</span>
            <span className="font-sans font-bold text-[12px] text-on-surface">
              Kirim Salinan E-Struk
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="tel"
              value={waPhone}
              onChange={(e) => setWaPhone(e.target.value)}
              placeholder="08xxxxxxxxxx"
              className="flex-1 bg-surface-container-lowest px-3 py-2 rounded-lg text-[12px] font-sans text-on-surface outline-none border border-[#eae3d9]/60 focus:border-primary/50 transition-all"
            />
            <button
              onClick={handleSendWa}
              disabled={isSendingWa}
              className="px-3.5 py-2 bg-primary-container text-on-primary rounded-lg text-[11px] font-sans font-bold hover:bg-primary active:scale-95 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-75 shadow-xs"
            >
              <span className="material-symbols-outlined text-[15px]">
                {isSendingWa ? 'refresh' : 'send'}
              </span>
              <span>{isSendingWa ? 'Mengirim' : 'Kirim'}</span>
            </button>
          </div>
          {waSent && (
            <p className="font-sans text-[11px] text-secondary font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">done_all</span>
              E-struk terkirim ke WhatsApp!
            </p>
          )}
        </div>
      </div>

      {activeOrder.paymentStatus !== 'LUNAS' && (
        <button
          onClick={requestCheckout}
          disabled={checkoutRequested}
          className="w-full h-12 rounded-2xl bg-primary text-on-primary font-sans font-semibold text-[14px] shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
          {checkoutRequested ? 'Tagihan sudah diminta — kasir menuju meja' : 'Minta Tagihan ke Kasir'}
        </button>
      )}

      {/* WiFi Tamu Restoran Card */}
      <div className="rounded-2xl bg-surface-container-low p-4 flex items-center justify-between border border-[#eae3d9]/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-container-lowest flex items-center justify-center text-primary shadow-xs border border-[#eae3d9]/50">
            <span className="material-symbols-outlined text-[22px]">wifi</span>
          </div>
          <div>
            <p className="font-sans font-bold text-[13px] text-on-surface">
              WiFi Tamu: {RESTAURANT_INFO.wifiSsid}
            </p>
            <p className="font-sans text-[12px] text-on-surface-variant font-mono">
              Password: <span className="font-bold text-primary">{RESTAURANT_INFO.wifiPass}</span>
            </p>
          </div>
        </div>
        <button
          onClick={handleCopyWifi}
          className={`p-2 rounded-xl transition-all shadow-xs cursor-pointer ${
            copiedWifi
              ? 'bg-secondary-fixed text-on-secondary-fixed'
              : 'bg-surface-container-lowest text-primary hover:bg-surface-container-high'
          }`}
          title="Salin Kata Sandi"
        >
          <span className="material-symbols-outlined text-[20px]">
            {copiedWifi ? 'check' : 'content_copy'}
          </span>
        </button>
      </div>
    </div>
  );
};
