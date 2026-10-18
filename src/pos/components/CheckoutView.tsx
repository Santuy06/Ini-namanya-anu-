import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BillItem } from '../types';

export const CheckoutView: React.FC = () => {
  const {
    bills,
    selectedBillId,
    setSelectedBillId,
    selectedBill,
    settlePayment,
    openReceiptModal,
    showToast,
    recentReceipts,
    refresh,
  } = useApp();

  const [queueTab, setQueueTab] = useState<'unpaid' | 'history'>('unpaid');
  const [selectedHistoryBill, setSelectedHistoryBill] = useState<BillItem | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<'Tunai' | 'QRIS' | 'Kartu Debit'>('Tunai');
  const [cashTendered, setCashTendered] = useState<number>(250000);
  const [autoPrintReceipt, setAutoPrintReceipt] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showQrisCode, setShowQrisCode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredBills = bills.filter(
    (b) =>
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tableNumber.includes(searchQuery) ||
      b.billNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHistory = recentReceipts.filter(
    (b) =>
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tableNumber.includes(searchQuery) ||
      b.billNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentBill: BillItem =
    queueTab === 'history'
      ? selectedHistoryBill || filteredHistory[0] || {
          id: 'empty-history',
          billNumber: '-',
          tableNumber: '-',
          customerName: 'Tidak ada riwayat',
          guestCount: 0,
          itemCount: 0,
          items: [],
          subtotal: 0,
          serviceFee: 0,
          tax: 0,
          total: 0,
          requestedAt: '-',
          elapsedMinutesAgo: 0,
          waiterName: '-',
          openedAtTime: '-',
          status: 'lunas',
        }
      : selectedBill || filteredBills[0] || bills[0] || {
          id: 'empty-bill',
          billNumber: 'B-000',
          tableNumber: '00',
          customerName: 'Tamu',
          guestCount: 0,
          itemCount: 0,
          items: [],
          subtotal: 0,
          serviceFee: 0,
          tax: 0,
          total: 0,
          requestedAt: '12:00',
          elapsedMinutesAgo: 0,
          waiterName: '-',
          openedAtTime: '12.00 WIB',
          status: 'belum_dibayar',
        };

  // Change computation
  const change = cashTendered - currentBill.total;
  const isChangeNegative = change < 0;

  const handleCashPreset = (amount: number) => {
    setCashTendered(amount);
  };

  const handleNumpad = (val: string) => {
    let str = cashTendered.toString();
    if (str === '0') str = '';
    str += val;
    setCashTendered(parseInt(str, 10) || 0);
  };

  const handleBackspace = () => {
    let str = cashTendered.toString();
    if (str.length > 1) {
      str = str.slice(0, -1);
      setCashTendered(parseInt(str, 10) || 0);
    } else {
      setCashTendered(0);
    }
  };

  const handleExecutePayment = () => {
    if (currentBill.isAllServed === false) {
      showToast('Tidak bisa bayar! Masih ada pesanan di dapur yang belum disajikan.', 'warning');
      return;
    }

    if (paymentMethod === 'Tunai' && isChangeNegative) {
      showToast('Nominal uang tunai kurang dari total tagihan!', 'warning');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      settlePayment(currentBill.id, paymentMethod, cashTendered);
    }, 300);
  };

  const handleManualRefresh = () => {
    refresh();
    showToast('Antrean tagihan diperbarui live dari meja & waiter', 'info');
  };

  const totalQueueAmount = bills.reduce((acc, b) => acc + b.total, 0);
  const totalGuestsWaiting = bills.reduce((acc, b) => acc + b.guestCount, 0);

  return (
    <div className="flex flex-col w-full pb-28 md:pb-12 max-w-7xl mx-auto px-3 sm:px-6">
      {/* Top Header & Fast Live Refresh */}
      <div className="pt-3 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl shadow-sm border border-[#ebe8e3] mb-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#3d1018]">
            Checkout Pelanggan
          </h1>
          <p className="text-xs text-[#524344] mt-0.5">
            Daftar bill yang diminta selesai. Pilih bill aktif untuk verifikasi dan penyelesaian kasir.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleManualRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f0ede9] hover:bg-[#ebe8e3] text-[#1c1c19] text-xs font-semibold active:scale-95 transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px] text-[#3d1018]">sync</span>
            <span>Segarkan daftar</span>
          </button>
          <span className="text-xs text-[#847374] bg-[#f6f3ee] px-2.5 py-1.5 rounded-xl hidden sm:inline-block font-mono">
            12:45 WIB
          </span>
        </div>
      </div>

      {/* Stepper Pipeline Indicator */}
      <div className="overflow-x-auto no-scrollbar py-1 mb-4">
        <div className="flex items-center gap-2 min-w-[540px] px-1 text-xs">
          <div className="flex items-center gap-1 text-[#847374] opacity-70">
            <span className="w-5 h-5 rounded-full bg-[#ebe8e3] flex items-center justify-center font-bold text-[10px]">
              1
            </span>
            <span>Pesanan</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </div>
          <div className="flex items-center gap-1 text-[#847374] opacity-70">
            <span className="w-5 h-5 rounded-full bg-[#ebe8e3] flex items-center justify-center font-bold text-[10px]">
              2
            </span>
            <span>Kitchen</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </div>
          <div className="flex items-center gap-1 text-[#847374] opacity-70">
            <span className="w-5 h-5 rounded-full bg-[#ebe8e3] flex items-center justify-center font-bold text-[10px]">
              3
            </span>
            <span>Disajikan</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </div>
          <div className="flex items-center gap-1.5 text-white bg-[#3d1018] px-3 py-1 rounded-full shadow-sm font-semibold">
            <span className="w-4 h-4 rounded-full bg-white text-[#3d1018] flex items-center justify-center font-bold text-[10px]">
              4
            </span>
            <span>Checkout (Kasir)</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </div>
          <div className="flex items-center gap-1 text-[#847374] opacity-60">
            <span className="w-5 h-5 rounded-full bg-[#ebe8e3] flex items-center justify-center font-bold text-[10px]">
              5
            </span>
            <span>Pembayaran Lunas</span>
          </div>
        </div>
      </div>

      {/* 3 KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-white p-4 rounded-2xl border border-[#ebe8e3] shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-[#524344]">Menunggu Kasir</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-[#3d1018] tabular-nums">
                {bills.length} bill
              </span>
              <span className="text-xs text-[#847374]">/ {totalGuestsWaiting} tamu</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#f0ede9] flex items-center justify-center text-[#3d1018]">
            <span className="material-symbols-outlined text-[22px]">receipt_long</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#ebe8e3] shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-[#524344]">Total Antrean Tagihan</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-bold text-[#994703] tabular-nums">
                Rp {totalQueueAmount.toLocaleString('id-ID')}
              </span>
            </div>
            <span className="text-[11px] text-[#994703] font-medium">Belum dibayar</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#ffdbc9]/60 flex items-center justify-center text-[#994703]">
            <span className="material-symbols-outlined text-[22px]">account_balance_wallet</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#ebe8e3] shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-[#524344]">Struk Lunas Tersimpan</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-bold text-emerald-800 tabular-nums">
                {recentReceipts.length} struk
              </span>
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">Bisa cetak ulang kapan saja</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
            <span className="material-symbols-outlined text-[22px]">print</span>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-white px-3.5 py-2.5 rounded-xl shadow-sm border border-[#ebe8e3]">
          <span className="material-symbols-outlined text-[20px] text-[#847374]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pelanggan, nomor meja, atau ID bill..."
            className="bg-transparent w-full text-xs sm:text-sm text-[#1c1c19] placeholder-[#847374] outline-none"
          />
        </div>
        <button className="flex items-center gap-1 px-3 py-2.5 rounded-xl bg-white text-[#1c1c19] text-xs font-semibold shadow-sm border border-[#ebe8e3] shrink-0">
          <span className="material-symbols-outlined text-[18px] text-[#994703]">sort</span>
          <span>Terlama</span>
        </button>
      </div>

      {/* Two-Section Core Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Bill Queue (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {/* Tab Filter: Antrean vs Riwayat Struk */}
          <div className="flex items-center bg-[#f0ede9] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setQueueTab('unpaid')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                queueTab === 'unpaid'
                  ? 'bg-white text-[#3d1018] shadow-xs'
                  : 'text-[#524344] hover:text-[#1c1c19]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">receipt_long</span>
              <span>Antrean Tagihan ({bills.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setQueueTab('history')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                queueTab === 'history'
                  ? 'bg-white text-[#3d1018] shadow-xs'
                  : 'text-[#524344] hover:text-[#1c1c19]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">history</span>
              <span>Riwayat Struk ({recentReceipts.length})</span>
            </button>
          </div>

          {queueTab === 'unpaid' ? (
            <>
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-[#524344] uppercase tracking-wider">
                  Daftar Antrean Tagihan ({bills.length})
                </span>
                <span className="text-[11px] text-[#994703] font-semibold">
                  Semua item kitchen disajikan
                </span>
              </div>

              {bills.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-[#ebe8e3] shadow-sm flex flex-col items-center">
                  <span className="material-symbols-outlined text-4xl text-emerald-600 mb-2">
                    check_circle
                  </span>
                  <p className="font-serif font-bold text-base text-[#1c1c19]">
                    Tidak Ada Antrean Checkout
                  </p>
                  <p className="text-xs text-[#524344] mt-1">
                    Semua meja telah diselesaikan atau masih menikmati santapan.
                  </p>
                </div>
              ) : (
                filteredBills.map((bill) => {
                  const isSelected = bill.id === currentBill.id;
                  return (
                    <div
                      key={bill.id}
                      onClick={() => setSelectedBillId(bill.id)}
                      className={`cursor-pointer transition-all rounded-2xl p-4 shadow-sm border relative overflow-hidden ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#ffdbc9]/30 via-white to-white border-[#994703] shadow-md ring-1 ring-[#994703]'
                          : 'bg-white hover:bg-[#f6f3ee] border-[#ebe8e3]'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#994703]"></div>
                      )}

                      <div className="flex items-start justify-between gap-3 pl-1">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold shrink-0 shadow-xs ${
                              isSelected
                                ? 'bg-[#994703] text-white'
                                : 'bg-[#f0ede9] text-[#1c1c19]'
                            }`}
                          >
                            <span className="text-[9px] uppercase leading-none opacity-80">Meja</span>
                            <span className="text-lg tabular-nums leading-tight">{bill.tableNumber}</span>
                          </div>

                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-sm text-[#1c1c19] truncate">
                                {bill.customerName}
                              </span>
                              {isSelected && (
                                <span className="px-1.5 py-0.2 rounded bg-[#994703] text-white text-[10px] font-bold">
                                  Dipilih
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 text-[#524344] text-xs mt-0.5">
                              <span>{bill.billNumber}</span>
                              <span>•</span>
                              <span>{bill.guestCount} Tamu</span>
                              <span>•</span>
                              <span className="font-semibold text-[#3d1018]">
                                {bill.itemCount} item
                              </span>
                            </div>

                            <div className="flex items-center gap-1 text-[11px] text-[#847374] mt-1.5">
                              <span className="material-symbols-outlined text-[14px] text-[#994703]">
                                schedule
                              </span>
                              <span>
                                Diminta {bill.requestedAt} ({bill.elapsedMinutesAgo} mnt lalu)
                              </span>
                              <span>•</span>
                              <span>Waiter: {bill.waiterName}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end shrink-0">
                          <span className="font-bold text-sm text-[#3d1018] tabular-nums">
                            Rp {bill.total.toLocaleString('id-ID')}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${
                              bill.status === 'minta_checkout'
                                ? 'bg-[#ffdbc9] text-[#753400]'
                                : 'bg-[#f0ede9] text-[#524344]'
                            }`}
                          >
                            {bill.status === 'minta_checkout' ? 'Minta checkout' : 'Belum dibayar'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-[#524344] uppercase tracking-wider">
                  Riwayat Pembayaran &amp; Struk ({filteredHistory.length})
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  Tersimpan Otomatis
                </span>
              </div>

              {filteredHistory.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-[#ebe8e3] shadow-sm flex flex-col items-center">
                  <span className="material-symbols-outlined text-4xl text-[#847374] mb-2">
                    history
                  </span>
                  <p className="font-serif font-bold text-base text-[#1c1c19]">
                    Belum Ada Riwayat Transaksi
                  </p>
                  <p className="text-xs text-[#524344] mt-1">
                    Transaksi yang selesai dibayar kasir akan otomatis tersimpan di sini dan bukti struknya bisa dicetak ulang kapan saja.
                  </p>
                </div>
              ) : (
                filteredHistory.map((bill) => {
                  const isSelected = bill.id === currentBill.id;
                  return (
                    <div
                      key={bill.id}
                      onClick={() => setSelectedHistoryBill(bill)}
                      className={`cursor-pointer transition-all rounded-2xl p-4 shadow-sm border relative overflow-hidden ${
                        isSelected
                          ? 'bg-gradient-to-r from-emerald-50/50 via-white to-white border-emerald-600 shadow-md ring-1 ring-emerald-600'
                          : 'bg-white hover:bg-[#f6f3ee] border-[#ebe8e3]'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-emerald-600"></div>
                      )}

                      <div className="flex items-start justify-between gap-3 pl-1">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold shrink-0 shadow-xs ${
                              isSelected
                                ? 'bg-emerald-700 text-white'
                                : 'bg-[#f0ede9] text-[#1c1c19]'
                            }`}
                          >
                            <span className="text-[9px] uppercase leading-none opacity-80">Meja</span>
                            <span className="text-lg tabular-nums leading-tight">{bill.tableNumber}</span>
                          </div>

                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-sm text-[#1c1c19] truncate">
                                {bill.customerName}
                              </span>
                              <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                LUNAS
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-[#524344] text-xs mt-0.5">
                              <span>{bill.billNumber}</span>
                              <span>•</span>
                              <span>{bill.guestCount} Tamu</span>
                              <span>•</span>
                              <span className="font-semibold text-[#3d1018]">
                                {bill.itemCount} item
                              </span>
                            </div>

                            <div className="flex items-center gap-1 text-[11px] text-[#847374] mt-1.5">
                              <span className="material-symbols-outlined text-[14px] text-emerald-700">
                                schedule
                              </span>
                              <span>
                                {bill.paidAtTime || `Selesai ${bill.requestedAt}`}
                              </span>
                              <span>•</span>
                              <span className="capitalize">{bill.paymentMethod || 'Tunai'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end shrink-0 gap-2">
                          <span className="font-bold text-sm text-[#3d1018] tabular-nums">
                            Rp {bill.total.toLocaleString('id-ID')}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openReceiptModal(bill);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-[#3d1018] hover:bg-[#58252c] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition cursor-pointer"
                            title="Cetak Ulang Struk"
                          >
                            <span className="material-symbols-outlined text-[14px]">print</span>
                            <span>Cetak Struk</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* Operational Policy Note */}
          <div className="bg-[#f6f3ee] p-4 rounded-2xl border border-[#ebe8e3] flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[20px] text-[#994703] shrink-0 mt-0.5">
              verified_user
            </span>
            <p className="text-xs text-[#524344] leading-relaxed">
              Checkout bukan kas pembukuan akhir. Permintaan dari waiter diverifikasi otomatis dan
              hanya kasir terotorisasi yang dapat mencetak struk resmi serta menutup sesi meja.
            </p>
          </div>
        </div>

        {/* Right Column: Invoice Details & Cashier Payment Keypad (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#ebe8e3] flex flex-col gap-4">
            {/* Bill Header */}
            <div className="flex items-start justify-between pb-3 bg-[#f6f3ee]/60 -m-5 p-5 rounded-t-2xl border-b border-[#ebe8e3]">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl text-white flex items-center justify-center font-bold ${
                  currentBill.status === 'lunas' ? 'bg-emerald-700' : 'bg-[#3d1018]'
                }`}>
                  <span className="material-symbols-outlined text-[22px]">
                    {currentBill.status === 'lunas' ? 'verified' : 'restaurant'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-xl sm:text-2xl font-bold text-[#3d1018]">
                      Meja {currentBill.tableNumber} • {currentBill.customerName}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      currentBill.status === 'lunas'
                        ? 'bg-emerald-100 text-emerald-800'
                        : currentBill.status === 'minta_checkout'
                        ? 'bg-[#ffdbc9] text-[#753400]'
                        : 'bg-[#f0ede9] text-[#524344]'
                    }`}>
                      {currentBill.status === 'lunas' ? 'Lunas' : currentBill.status === 'minta_checkout' ? 'Minta Checkout' : 'Belum Dibayar'}
                    </span>
                  </div>
                  <span className="text-xs text-[#524344] mt-0.5">
                    ID: {currentBill.billNumber} • Pelayan: {currentBill.waiterName} • {currentBill.status === 'lunas' ? `Waktu Bayar: ${currentBill.paidAtTime || currentBill.requestedAt}` : `Buka Pesanan: ${currentBill.openedAtTime}`}
                  </span>
                </div>
              </div>

              <button
                onClick={() => openReceiptModal(currentBill)}
                title="Pratinjau Struk Kasir"
                className="p-2 rounded-xl bg-[#f0ede9] hover:bg-[#ebe8e3] text-[#1c1c19] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">print</span>
              </button>
            </div>

            {/* 3-Point Fast Verification Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-[#f6f3ee] p-2.5 rounded-xl border border-[#ebe8e3]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1c1c19]">
                <span className={`material-symbols-outlined text-[18px] ${
                  currentBill.status === 'lunas' || currentBill.isAllServed !== false ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {currentBill.status === 'lunas' || currentBill.isAllServed !== false ? 'check_circle' : 'skillet'}
                </span>
                <span>
                  {currentBill.status === 'lunas' || currentBill.isAllServed !== false
                    ? `${currentBill.itemCount || 0} Item Disajikan`
                    : `${currentBill.itemCount || 0} Item Dimasak Dapur`}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1c1c19]">
                <span className={`material-symbols-outlined text-[18px] ${
                  currentBill.status === 'lunas' || currentBill.isAllServed !== false ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {currentBill.status === 'lunas' || currentBill.isAllServed !== false ? 'check_circle' : 'pending'}
                </span>
                <span>
                  {currentBill.status === 'lunas' || currentBill.isAllServed !== false
                    ? '0 Pesanan Tertunda'
                    : `${currentBill.unservedCount || 1} Belum Disajikan`}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1c1c19]">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">
                  check_circle
                </span>
                <span>Dikonfirmasi Meja</span>
              </div>
            </div>

            {/* Itemized Menu Breakdown */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-[#524344] uppercase tracking-wider">
                Rincian Menu Yang Dipesan
              </span>
              <div className="flex flex-col divide-y divide-[#ebe8e3]">
                {currentBill.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-md bg-[#f0ede9] text-[#3d1018] flex items-center justify-center font-bold text-xs shrink-0 tabular-nums">
                        {item.quantity}x
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-xs sm:text-sm text-[#1c1c19] truncate">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-[#524344]">
                          Rp {item.price.toLocaleString('id-ID')} / porsi
                          {item.notes ? ` • ${item.notes}` : ''}
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-[#1c1c19] tabular-nums shrink-0 ml-2">
                      Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Calculation Breakdown */}
            <div className="bg-[#f6f3ee] p-4 rounded-xl flex flex-col gap-2 text-xs border border-[#ebe8e3]">
              <div className="flex items-center justify-between text-[#524344]">
                <span>Subtotal Makanan &amp; Minuman</span>
                <span className="font-semibold text-[#1c1c19] tabular-nums">
                  Rp {currentBill.subtotal.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#524344]">
                <span>Biaya Layanan Restoran (5%)</span>
                <span className="font-semibold text-[#1c1c19] tabular-nums">
                  Rp {currentBill.serviceFee.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#524344]">
                <span>Pajak Daerah PB1 (10%)</span>
                <span className="font-semibold text-[#1c1c19] tabular-nums">
                  Rp {currentBill.tax.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#ebe8e3] text-[#1c1c19]">
                <div>
                  <span className="font-bold text-sm text-[#3d1018] block leading-none">
                    TOTAL TAGIHAN
                  </span>
                  <span className="text-[11px] text-[#524344]">Sudah termasuk pajak &amp; service</span>
                </div>
                <span className="font-serif text-2xl font-bold text-[#3d1018] tabular-nums">
                  Rp {currentBill.total.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Direct Settlement (Pembayaran Cepat) OR Lunas History View */}
            {currentBill.status === 'lunas' ? (
              <div className="flex flex-col gap-3 pt-1">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[24px]">verified</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-emerald-900">Tagihan Sudah Dibayar &amp; Lunas</p>
                      <p className="text-xs text-emerald-700">
                        {currentBill.paidAtTime || `Waktu: ${currentBill.requestedAt}`} • Metode:{' '}
                        {(currentBill.paymentMethod || 'Tunai').toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider">
                    LUNAS
                  </span>
                </div>

                {currentBill.paymentMethod === 'tunai' && currentBill.cashTendered ? (
                  <div className="grid grid-cols-2 gap-2 bg-[#f6f3ee] p-3 rounded-xl border border-[#ebe8e3] text-xs">
                    <div>
                      <span className="text-[#847374] block">Uang Tunai Diterima:</span>
                      <span className="font-bold text-[#1c1c19] text-sm tabular-nums">
                        Rp {currentBill.cashTendered.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#847374] block">Kembalian Kasir:</span>
                      <span className="font-bold text-[#994703] text-sm tabular-nums">
                        Rp {(currentBill.changeAmount || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => openReceiptModal(currentBill)}
                    className="w-full flex-1 py-3.5 px-5 rounded-xl bg-[#3d1018] hover:bg-[#58252c] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">print</span>
                    <span>Cetak Ulang Struk Kasir</span>
                  </button>
                </div>

                <p className="text-center text-[11px] text-[#847374] mt-1">
                  Struk transaksi ini tersimpan di sistem kasir. Dapat dicetak ulang kapan saja jika printer mati, macet, atau kasir di-reset.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 pt-1">
                {currentBill.isAllServed === false && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5 animate-in fade-in">
                    <span className="material-symbols-outlined text-[20px] text-amber-700 shrink-0 mt-0.5">
                      soup_kitchen
                    </span>
                    <div>
                      <span className="font-bold block text-amber-950">
                        Pesanan Belum Selesai Disajikan ({currentBill.unservedCount || 1} pesanan di dapur)
                      </span>
                      <span className="text-[11px] text-amber-800 leading-relaxed block mt-0.5">
                        Demi mencegah selisih kas dan pembayaran berulang, kasir hanya dapat menerima pembayaran setelah dapur memajukan status pesanan menjadi <strong>Disajikan</strong> di layar Pantau Pesanan (KDS).
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#3d1018]">Pilihan Metode Pembayaran</span>
                <span className="text-[11px] text-[#524344] flex items-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-[15px] text-[#994703]">
                    security
                  </span>
                  Otorisasi Kasir Aktif
                </span>
              </div>

              {/* Payment Method Chips */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('Tunai');
                    setShowQrisCode(false);
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl font-semibold text-xs transition-all shadow-xs ${
                    paymentMethod === 'Tunai'
                      ? 'bg-[#3d1018] text-white shadow-sm'
                      : 'bg-[#f0ede9] text-[#1c1c19] hover:bg-[#ebe8e3]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[24px]">payments</span>
                  <span className="mt-1">Tunai</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('QRIS');
                    setShowQrisCode(true);
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl font-semibold text-xs transition-all shadow-xs ${
                    paymentMethod === 'QRIS'
                      ? 'bg-[#3d1018] text-white shadow-sm'
                      : 'bg-[#f0ede9] text-[#1c1c19] hover:bg-[#ebe8e3]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[24px] text-[#994703]">
                    qr_code_scanner
                  </span>
                  <span className="mt-1">QRIS Dinamis</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('Kartu Debit');
                    setShowQrisCode(false);
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl font-semibold text-xs transition-all shadow-xs ${
                    paymentMethod === 'Kartu Debit'
                      ? 'bg-[#3d1018] text-white shadow-sm'
                      : 'bg-[#f0ede9] text-[#1c1c19] hover:bg-[#ebe8e3]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[24px]">credit_card</span>
                  <span className="mt-1">Kartu Debit</span>
                </button>
              </div>

              {/* QRIS Dynamic Code Display */}
              {showQrisCode && (
                <div className="bg-[#f6f3ee] p-4 rounded-xl flex flex-col items-center text-center gap-2 border border-[#ebe8e3] animate-in fade-in">
                  <div className="w-44 h-44 bg-white p-2.5 rounded-xl border border-[#ebe8e3] shadow-inner flex flex-col items-center justify-center">
                    <svg className="w-full h-full text-[#3d1018]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm-2 10h8v8H2v-8zm2 2v4h4v-4H4zm10-14h8v8h-8V2zm2 2v4h4V4h-4zm3 8h3v2h-3v-2zm-3 2h2v3h-2v-3zm5 2h2v4h-4v-2h2v-2zm-2 2v2h-3v-2h3zm-3-4h2v2h-2v-2zm-2 2h2v2h-2v-2z" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-[#1c1c19]">
                    NMID: ID1029384756 • RAWON GUSTI SURABAYA
                  </span>
                  <span className="text-[11px] text-[#524344]">
                    Tunjukkan QR ke pelanggan. Pembayaran akan terverifikasi otomatis.
                  </span>
                </div>
              )}

              {/* Cash Calculator Box */}
              {paymentMethod === 'Tunai' && (
                <div className="flex flex-col gap-2.5 bg-[#f6f3ee] p-4 rounded-xl border border-[#ebe8e3]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-[#524344] uppercase">
                        Uang Tunai Diterima
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xl font-bold text-[#3d1018]">Rp</span>
                        <input
                          type="text"
                          value={cashTendered.toLocaleString('id-ID')}
                          onChange={(e) => {
                            const raw = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0;
                            setCashTendered(raw);
                          }}
                          className="bg-white text-xl font-bold text-[#3d1018] px-3 py-1.5 rounded-xl w-44 text-right shadow-xs outline-none border border-[#ebe8e3] focus:border-[#3d1018]"
                        />
                      </div>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleCashPreset(currentBill.total)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#ebe8e3] text-xs font-semibold text-[#1c1c19] shadow-xs border border-[#ebe8e3]"
                      >
                        Uang Pas
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCashPreset(210000)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#ebe8e3] text-xs font-semibold text-[#1c1c19] shadow-xs border border-[#ebe8e3]"
                      >
                        210.000
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCashPreset(250000)}
                        className="px-2.5 py-1 rounded-lg bg-[#58252c] text-white text-xs font-semibold shadow-xs"
                      >
                        250.000
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCashPreset(300000)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#ebe8e3] text-xs font-semibold text-[#1c1c19] shadow-xs border border-[#ebe8e3]"
                      >
                        300.000
                      </button>
                    </div>
                  </div>

                  {/* Numpad Array */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {['1', '2', '3', '000', '4', '5', '6', '00', '7', '8', '9'].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleNumpad(val)}
                        className="h-10 rounded-xl bg-white hover:bg-[#ebe8e3] font-bold text-sm text-[#1c1c19] shadow-xs border border-[#ebe8e3] active:scale-95 transition-all"
                      >
                        {val}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handleBackspace}
                      className="h-10 rounded-xl bg-[#f0ede9] text-[#ba1a1a] hover:bg-[#ffdad6] font-bold shadow-xs border border-[#ebe8e3] flex items-center justify-center active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">backspace</span>
                    </button>
                  </div>

                  {/* Computed Kembalian Highlight */}
                  <div className="bg-white p-3 rounded-xl flex items-center justify-between shadow-xs border border-[#ebe8e3] mt-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#ffdbc9]/60 flex items-center justify-center text-[#994703]">
                        <span className="material-symbols-outlined text-[18px]">
                          currency_exchange
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#524344] block leading-tight">
                          Uang Kembalian Pelanggan
                        </span>
                        <span className="text-[11px] text-[#847374]">
                          Rp {cashTendered.toLocaleString('id-ID')} − Rp{' '}
                          {currentBill.total.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-xl font-bold tabular-nums ${
                        isChangeNegative ? 'text-[#ba1a1a]' : 'text-[#994703]'
                      }`}
                    >
                      {isChangeNegative
                        ? `Kurang Rp ${Math.abs(change).toLocaleString('id-ID')}`
                        : `Rp ${change.toLocaleString('id-ID')}`}
                    </span>
                  </div>
                </div>
              )}

              {/* Automatic Print Receipt Toggle */}
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={autoPrintReceipt}
                  onChange={(e) => setAutoPrintReceipt(e.target.checked)}
                  className="w-4 h-4 rounded text-[#3d1018] accent-[#3d1018] cursor-pointer"
                />
                <span className="text-xs text-[#1c1c19]">
                  Cetak struk kasir dan kitchen bill otomatis setelah konfirmasi
                </span>
              </label>

              {/* Main Settlement Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => openReceiptModal(currentBill)}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl bg-[#f0ede9] hover:bg-[#ebe8e3] text-[#1c1c19] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">receipt</span>
                  <span>Lihat Rincian Bill</span>
                </button>

                <button
                  type="button"
                  onClick={handleExecutePayment}
                  disabled={isProcessing || bills.length === 0 || currentBill.isAllServed === false}
                  className={`w-full flex-1 px-5 py-3 rounded-xl text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all ${
                    currentBill.isAllServed === false
                      ? 'bg-[#847374] opacity-75 cursor-not-allowed'
                      : 'bg-[#3d1018] hover:bg-[#58252c]'
                  }`}
                  title={currentBill.isAllServed === false ? 'Harap selesaikan pesanan di dapur terlebih dahulu' : 'Konfirmasi pembayaran kasir'}
                >
                  {isProcessing ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">
                        sync
                      </span>
                      <span>Memproses Struk &amp; Pembayaran...</span>
                    </>
                  ) : currentBill.isAllServed === false ? (
                    <>
                      <span className="material-symbols-outlined text-[20px]">skillet</span>
                      <span>
                        Menunggu Dapur Menyajikan ({currentBill.unservedCount || 1} pesanan)
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">check</span>
                      <span>
                        Konfirmasi Pembayaran (Rp {currentBill.total.toLocaleString('id-ID')})
                      </span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-[11px] text-[#847374] mt-1">
                Meja {currentBill.tableNumber} akan otomatis berstatus kosong (tersedia) setelah
                pembayaran tervalidasi.
              </p>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
