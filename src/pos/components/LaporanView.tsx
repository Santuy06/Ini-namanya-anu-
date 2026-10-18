import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { today } from '../../lib/domain';
import { fetchPaid } from '../../lib/report';
import { TransactionRecord } from '../types';

export const LaporanView: React.FC = () => {
  const { transactions, showToast, currentUser, openReceiptModal } = useApp();
  const todayStr = today();

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [methodFilter, setMethodFilter] = useState('Semua metode');
  const [typeFilter, setTypeFilter] = useState('Dine in & Take away');
  const [appliedNotice, setAppliedNotice] = useState(false);
  const [customRangeTrx, setCustomRangeTrx] = useState<TransactionRecord[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modal Rekap Tutup Shift Kasir
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [modalAwalKas, setModalAwalKas] = useState(200000); // Rp 200.000 floating cash
  const [uangFisikKasir, setUangFisikKasir] = useState<number | ''>('');

  const getDaysAgo = (days: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' });
  };

  const handlePreset = (preset: 'today' | '7days' | '30days') => {
    if (preset === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === '7days') {
      setStartDate(getDaysAgo(6));
      setEndDate(todayStr);
    } else if (preset === '30days') {
      setStartDate(getDaysAgo(29));
      setEndDate(todayStr);
    }
  };

  const activeTransactions = customRangeTrx !== null ? customRangeTrx : transactions;

  const filteredTransactions = activeTransactions.filter((t) => {
    if (methodFilter !== 'Semua metode' && t.method !== methodFilter) return false;
    if (typeFilter === 'Dine in saja' && t.typeMeja.toLowerCase().includes('take away')) return false;
    if (typeFilter === 'Take away saja' && !t.typeMeja.toLowerCase().includes('take away')) return false;
    return true;
  });

  const totalPenjualan = filteredTransactions.reduce((acc, t) => acc + t.total, 0);
  const totalSubtotal = filteredTransactions.reduce((acc, t) => acc + t.subtotal, 0);
  const totalPajak = filteredTransactions.reduce((acc, t) => acc + t.tax, 0);
  const avgTransaksi = Math.round(totalPenjualan / (filteredTransactions.length || 1));

  const tunaiTrx = filteredTransactions.filter((t) => t.method === 'Tunai');
  const qrisTrx = filteredTransactions.filter((t) => t.method === 'QRIS');
  const tunaiTotal = tunaiTrx.reduce((acc, t) => acc + t.total, 0);
  const qrisTotal = qrisTrx.reduce((acc, t) => acc + t.total, 0);
  const tunaiPct = totalPenjualan ? Math.round((tunaiTotal / totalPenjualan) * 1000) / 10 : 59.9;
  const qrisPct = totalPenjualan ? Math.round((qrisTotal / totalPenjualan) * 1000) / 10 : 40.1;

  const handleApplyFilter = async () => {
    setIsLoading(true);
    setAppliedNotice(true);
    try {
      const dbMethod = methodFilter === 'Tunai' ? 'cash' : methodFilter === 'QRIS' ? 'qris' : methodFilter === 'Kartu Debit' ? 'debit' : 'all';
      const rows = await fetchPaid(startDate, endDate, dbMethod);
      if (rows && rows.length > 0) {
        const mapped: TransactionRecord[] = rows.map((r, idx) => {
          const hhmm = new Date(r.at)
            .toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })
            .replace('.', ':');
          return {
            id: `rep-${idx}-${r.no}`,
            code: `#${r.no}`,
            time: hhmm,
            at: r.at,
            typeMeja: r.table ? `Meja ${String(r.table).padStart(2, '0')}` : 'Bawa Pulang',
            source: r.src === 'qr' ? 'QR meja' : 'Manual',
            method: r.method === 'cash' ? 'Tunai' : r.method === 'qris' ? 'QRIS' : 'Kartu Debit',
            subtotal: r.subtotal,
            tax: r.total - r.subtotal,
            total: r.total,
            status: 'Lunas',
          };
        });
        setCustomRangeTrx(mapped);
      } else {
        // Fallback to local filtering
        setCustomRangeTrx(null);
      }
      showToast(`Filter laporan diterapkan (${startDate} s/d ${endDate})`, 'success');
    } catch (e) {
      console.warn('Laporan fetchPaid error:', e);
      showToast('Memuat laporan lokal aktif', 'info');
    } finally {
      setIsLoading(false);
      setTimeout(() => setAppliedNotice(false), 2000);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Kode', 'Waktu', 'Tipe/Meja', 'Sumber', 'Metode', 'Subtotal', 'Pajak', 'Total', 'Status'];
    const rows = filteredTransactions.map((t) => [
      t.code,
      t.time,
      `"${t.typeMeja}"`,
      t.source,
      t.method,
      t.subtotal,
      t.tax,
      t.total,
      t.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Rawon_Gusti_${startDate}_sd_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Laporan transaksi berhasil diunduh dalam format CSV!', 'success');
  };

  const handlePrintReport = () => {
    window.print();
  };

  // Tutup Shift Calculation
  const totalKasSeharusnya = modalAwalKas + tunaiTotal;
  const fisikKas = typeof uangFisikKasir === 'number' ? uangFisikKasir : 0;
  const selisihKas = fisikKas - totalKasSeharusnya;

  return (
    <div className="flex flex-col w-full p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1540px] mx-auto pb-28 md:pb-8">
      {/* Top Header Breadcrumb & Title */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#524344] mb-1">
            <span>Operasional</span>
            <span className="text-[#d7c2c2]">›</span>
            <span className="font-bold text-[#1c1c19]">Admin</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1c1c19] tracking-tight">
            Laporan Transaksi
          </h1>
          <p className="text-xs sm:text-sm text-[#524344] mt-0.5">
            Penjualan lunas, pajak daerah, dan audit rekonsiliasi kasir dalam satu dashboard.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShiftModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white border border-[#ebe8e3] hover:bg-[#f6f3ee] text-[#3d1018] text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-[#994703]">price_check</span>
            <span>Rekap Tutup Shift Kasir</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#58252c] hover:bg-[#3d1018] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Ekspor CSV</span>
          </button>
        </div>
      </section>

      {/* Filter Controls Panel */}
      <section className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ebe8e3] shadow-xs space-y-3">
        {/* Quick Date Presets */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#847374]">Pilihan Cepat:</span>
          <button
            type="button"
            onClick={() => handlePreset('today')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              startDate === todayStr && endDate === todayStr
                ? 'bg-[#3d1018] text-white'
                : 'bg-[#f6f3ee] text-[#524344] hover:bg-[#ebe8e3]'
            }`}
          >
            Hari Ini
          </button>
          <button
            type="button"
            onClick={() => handlePreset('7days')}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#f6f3ee] text-[#524344] hover:bg-[#ebe8e3] cursor-pointer transition-all"
          >
            7 Hari Terakhir
          </button>
          <button
            type="button"
            onClick={() => handlePreset('30days')}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#f6f3ee] text-[#524344] hover:bg-[#ebe8e3] cursor-pointer transition-all"
          >
            30 Hari Terakhir
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end text-xs">
          {/* Tanggal Mulai (Date Picker) */}
          <div>
            <label className="block text-[11px] font-bold text-[#524344] mb-1">Tanggal mulai</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#847374]">
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
              </span>
              <input
                id="laporan-date-start"
                type="date"
                value={startDate}
                max={endDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#ebe8e3] bg-[#f6f3ee] text-[#1c1c19] font-medium outline-none focus:border-[#3d1018] cursor-pointer"
              />
            </div>
          </div>

          {/* Tanggal Akhir (Date Picker) */}
          <div>
            <label className="block text-[11px] font-bold text-[#524344] mb-1">Tanggal akhir</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#847374]">
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
              </span>
              <input
                id="laporan-date-end"
                type="date"
                value={endDate}
                min={startDate}
                max={todayStr}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#ebe8e3] bg-[#f6f3ee] text-[#1c1c19] font-medium outline-none focus:border-[#3d1018] cursor-pointer"
              />
            </div>
          </div>

          {/* Metode Pembayaran */}
          <div>
            <label className="block text-[11px] font-bold text-[#524344] mb-1">
              Metode pembayaran
            </label>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-[#ebe8e3] bg-[#f6f3ee] text-[#1c1c19] font-medium outline-none focus:border-[#3d1018] cursor-pointer"
            >
              <option value="Semua metode">Semua metode</option>
              <option value="Tunai">Tunai</option>
              <option value="QRIS">QRIS</option>
              <option value="Kartu Debit">Kartu Debit</option>
            </select>
          </div>

          {/* Tipe Pesanan */}
          <div>
            <label className="block text-[11px] font-bold text-[#524344] mb-1">Tipe pesanan</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-[#ebe8e3] bg-[#f6f3ee] text-[#1c1c19] font-medium outline-none focus:border-[#3d1018] cursor-pointer"
            >
              <option value="Dine in & Take away">Dine in &amp; Take away</option>
              <option value="Dine in saja">Dine in saja</option>
              <option value="Take away saja">Take away saja</option>
            </select>
          </div>

          {/* Tombol Terapkan */}
          <div>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleApplyFilter}
              className="w-full py-2 px-4 bg-[#3d1018] hover:bg-[#58252c] text-white font-bold rounded-xl text-xs transition active:scale-95 shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-[15px] animate-spin">progress_activity</span>
                  <span>Memuat...</span>
                </>
              ) : (
                <span>Terapkan</span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* 4 Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#ebe8e3] shadow-sm flex flex-col justify-between">
          <p className="text-xs text-[#524344] font-medium">Penjualan lunas</p>
          <div className="my-2">
            <h3 className="text-2xl font-bold text-[#1c1c19] font-serif tabular-nums">
              Rp {totalPenjualan.toLocaleString('id-ID')}
            </h3>
          </div>
          <p className="text-[11px] text-[#847374]">Termasuk pajak contoh 10%</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#ebe8e3] shadow-sm flex flex-col justify-between">
          <p className="text-xs text-[#524344] font-medium">Transaksi lunas</p>
          <div className="my-2">
            <h3 className="text-2xl font-bold text-[#1c1c19] font-serif tabular-nums">
              {filteredTransactions.length}
            </h3>
          </div>
          <p className="text-[11px] text-[#847374]">5 dine in • 1 take away</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#ebe8e3] shadow-sm flex flex-col justify-between">
          <p className="text-xs text-[#524344] font-medium">Rata-rata transaksi</p>
          <div className="my-2">
            <h3 className="text-2xl font-bold text-[#1c1c19] font-serif tabular-nums">
              Rp {avgTransaksi.toLocaleString('id-ID')}
            </h3>
          </div>
          <p className="text-[11px] text-[#847374]">Dibulatkan ke rupiah</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#ebe8e3] shadow-sm flex flex-col justify-between">
          <p className="text-xs text-[#524344] font-medium">Pajak terkumpul</p>
          <div className="my-2">
            <h3 className="text-2xl font-bold text-[#1c1c19] font-serif tabular-nums">
              Rp {totalPajak.toLocaleString('id-ID')}
            </h3>
          </div>
          <p className="text-[11px] text-[#847374]">
            Subtotal Rp {totalSubtotal.toLocaleString('id-ID')}
          </p>
        </div>
      </section>

      {/* Charts & Proportion Row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tren Penjualan Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-[#ebe8e3] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#1c1c19]">Tren penjualan</h3>
              <p className="text-xs text-[#524344] mt-0.5">
                10 Oktober 2026 • total Rp {totalPenjualan.toLocaleString('id-ID')}
              </p>
            </div>
            <span className="text-[11px] bg-[#ffdadc] text-[#3d1018] px-2.5 py-0.5 rounded-full font-bold">
              Hari ini
            </span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-4 border-b border-[#ebe8e3]">
            <div className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-[#847374]">Rp0</span>
              <div className="w-full bg-[#f0ede9] rounded-t h-1"></div>
              <span className="text-[11px] text-[#524344] mt-2">10–11</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-[#847374]">Rp0</span>
              <div className="w-full bg-[#f0ede9] rounded-t h-1"></div>
              <span className="text-[11px] text-[#524344] mt-2">11–12</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-bold text-[#994703]">Rp147.400</span>
              <div className="w-full bg-[#ffdbc9] rounded-t h-28"></div>
              <span className="text-[11px] text-[#1c1c19] mt-2 font-bold">12–12.20</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-bold text-[#3d1018]">Rp220.000</span>
              <div className="w-full bg-[#58252c] rounded-t h-36"></div>
              <span className="text-[11px] text-[#1c1c19] mt-2 font-bold">12.20–12.30</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-[#847374]">Rp0</span>
              <div className="w-full bg-[#f0ede9] rounded-t h-1"></div>
              <span className="text-[11px] text-[#524344] mt-2">13–14</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-[#847374]">Rp0</span>
              <div className="w-full bg-[#f0ede9] rounded-t h-1"></div>
              <span className="text-[11px] text-[#524344] mt-2">14–15</span>
            </div>
          </div>
          <p className="text-[10px] text-[#847374] mt-3 italic">
            Data s.d. 12.30 WIB - interval mendatang belum ada transaksi.
          </p>
        </div>

        {/* Payment Breakdown Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#ebe8e3] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#1c1c19]">Metode pembayaran</h3>
            <div className="mt-3">
              <h4 className="text-2xl font-bold font-serif text-[#1c1c19] tracking-tight tabular-nums">
                Rp {totalPenjualan.toLocaleString('id-ID')}
              </h4>
            </div>

            <div className="w-full h-3 flex rounded-full overflow-hidden mt-4 bg-[#f0ede9]">
              <div className="bg-[#58252c] h-full" style={{ width: `${tunaiPct}%` }}></div>
              <div className="bg-[#fc934f] h-full" style={{ width: `${qrisPct}%` }}></div>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#58252c]"></span>
                  <span className="text-[#524344] font-medium">
                    Tunai • {tunaiTrx.length} transaksi ({tunaiPct}%)
                  </span>
                </div>
                <span className="font-bold text-[#1c1c19] tabular-nums">
                  Rp {tunaiTotal.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#fc934f]"></span>
                  <span className="text-[#524344] font-medium">
                    QRIS • {qrisTrx.length} transaksi ({qrisPct}%)
                  </span>
                </div>
                <span className="font-bold text-[#1c1c19] tabular-nums">
                  Rp {qrisTotal.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 bg-[#f6f3ee] border border-[#ebe8e3] rounded-xl flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] text-[#994703] shrink-0 mt-0.5">
              info
            </span>
            <p className="text-[11px] text-[#524344] leading-tight">
              QRIS dicatat setelah kasir memeriksa mutasi merchant bank.
            </p>
          </div>
        </div>
      </section>

      {/* Transaction Details Table Section */}
      <section className="bg-white rounded-2xl border border-[#ebe8e3] shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#ebe8e3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#1c1c19]">Rincian transaksi lunas</h3>
            <p className="text-xs text-[#524344] mt-0.5">
              {startDate === endDate ? startDate : `${startDate} s.d. ${endDate}`} • {methodFilter} • {filteredTransactions.length} transaksi
            </p>
          </div>
          <div>
            <button
              onClick={handlePrintReport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-[#ebe8e3] hover:bg-[#f6f3ee] text-[#1c1c19] text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Cetak laporan</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f6f3ee] border-b border-[#ebe8e3] text-[10px] font-bold text-[#847374] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Pesanan</th>
                <th className="py-3 px-3">Waktu</th>
                <th className="py-3 px-4">Tipe / meja</th>
                <th className="py-3 px-3">Sumber</th>
                <th className="py-3 px-3">Metode</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4 text-right">Pajak 10%</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-3 text-center">Struk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebe8e3]">
              {filteredTransactions.map((trx, idx) => (
                <tr
                  key={trx.id}
                  className={`transition-colors ${
                    idx === 0 ? 'bg-[#ffdadc]/30 font-semibold' : 'hover:bg-[#f6f3ee]'
                  }`}
                >
                  <td className="py-3 px-4 font-bold text-[#3d1018]">{trx.code}</td>
                  <td className="py-3 px-3 text-[#524344]">{trx.time}</td>
                  <td className="py-3 px-4 font-semibold text-[#1c1c19]">{trx.typeMeja}</td>
                  <td className="py-3 px-3 text-[#524344]">{trx.source}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        trx.method === 'Tunai'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-[#3d1018] border-rose-200'
                      }`}
                    >
                      {trx.method}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-[#524344] tabular-nums">
                    Rp {trx.subtotal.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-right text-[#524344] tabular-nums">
                    Rp {trx.tax.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-[#1c1c19] tabular-nums">
                    Rp {trx.total.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        const bill = trx.billData || {
                          id: trx.id,
                          billNumber: trx.code.replace('#', ''),
                          tableNumber: trx.typeMeja.replace('Meja ', ''),
                          customerName: 'Pelanggan',
                          guestCount: 1,
                          itemCount: 1,
                          items: [{ name: 'Pesanan Meja Restoran', quantity: 1, price: trx.subtotal }],
                          subtotal: trx.subtotal,
                          serviceFee: Math.round(trx.subtotal * 0.05),
                          tax: trx.tax,
                          total: trx.total,
                          requestedAt: trx.time,
                          elapsedMinutesAgo: 0,
                          waiterName: trx.source,
                          openedAtTime: `${trx.time} WIB`,
                          status: 'lunas',
                          paymentMethod: trx.method.toLowerCase() as any,
                          paidAtTime: `${trx.at ? new Date(trx.at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''} ${trx.time} WIB`,
                        };
                        openReceiptModal(bill);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#f0ede9] hover:bg-[#3d1018] text-[#3d1018] hover:text-white transition-colors text-[11px] font-bold shadow-2xs cursor-pointer"
                      title="Cetak Ulang Struk Kasir"
                    >
                      <span className="material-symbols-outlined text-[14px]">print</span>
                      <span>Struk</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Summary Row */}
        <div className="p-4 bg-[#f6f3ee] border-t border-[#ebe8e3] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <p className="text-[11px] text-[#847374]">
              {filteredTransactions.length} transaksi lunas
            </p>
            <p className="font-bold text-[#1c1c19] mt-0.5">Dine in &amp; Take away</p>
          </div>
          <div>
            <p className="text-[11px] text-[#847374]">Subtotal</p>
            <p className="font-bold text-[#1c1c19] mt-0.5 tabular-nums">
              Rp {totalSubtotal.toLocaleString('id-ID')}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-[#847374]">Pajak 10%</p>
            <p className="font-bold text-[#1c1c19] mt-0.5 tabular-nums">
              Rp {totalPajak.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-[11px] text-[#847374]">Total penjualan</p>
            <p className="font-serif font-bold text-lg text-[#3d1018] mt-0.5 tabular-nums">
              Rp {totalPenjualan.toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        {/* Bottom Reconciliation Notice */}
        <div className="px-4 py-3 bg-[#f0ede9] border-t border-[#ebe8e3] flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-[#847374] shrink-0">
            info
          </span>
          <p className="text-[11px] text-[#524344]">
            Hanya transaksi lunas dihitung. Pesanan menunggu konfirmasi atau pembayaran tidak masuk laporan.
          </p>
        </div>
      </section>

      {/* Modal Rekap Tutup Shift Kasir */}
      {shiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#ebe8e3] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#ebe8e3]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#58252c]/10 text-[#3d1018] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">price_check</span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#1c1c19]">Rekap Tutup Shift Kasir</h3>
                  <p className="text-xs text-[#847374]">Rekonsiliasi uang kasir fisik vs sistem POS</p>
                </div>
              </div>
              <button
                onClick={() => setShiftModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#847374] hover:bg-[#f6f3ee] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 bg-[#f6f3ee] rounded-xl">
                <span className="font-semibold text-[#524344]">Modal Awal Kas (Floating Cash)</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#847374]">Rp</span>
                  <input
                    type="number"
                    value={modalAwalKas}
                    onChange={(e) => setModalAwalKas(Number(e.target.value) || 0)}
                    className="w-28 text-right font-bold text-[#1c1c19] bg-white border border-[#ebe8e3] rounded-lg px-2 py-1 outline-none focus:border-[#3d1018]"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-[#f6f3ee] rounded-xl">
                <div>
                  <span className="font-semibold text-[#524344]">Penjualan Tunai Sistem ({startDate})</span>
                  <p className="text-[10px] text-[#847374]">{tunaiTrx.length} transaksi tunai</p>
                </div>
                <span className="font-bold text-[#1c1c19] tabular-nums">
                  Rp {tunaiTotal.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-[#58252c]/5 rounded-xl border border-[#58252c]/20">
                <span className="font-bold text-[#3d1018]">Total Kas Seharusnya di Laci</span>
                <span className="font-serif font-bold text-base text-[#3d1018] tabular-nums">
                  Rp {totalKasSeharusnya.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="p-3 bg-white border border-[#ebe8e3] rounded-xl space-y-1.5">
                <label className="block font-bold text-[#1c1c19]">
                  Jumlah Uang Fisik Hasil Hitungan Kasir:
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center font-bold text-[#847374]">
                    Rp
                  </span>
                  <input
                    type="number"
                    placeholder="Masukkan total uang di laci kasir"
                    value={uangFisikKasir}
                    onChange={(e) => setUangFisikKasir(e.target.value ? Number(e.target.value) : '')}
                    className="w-full pl-10 pr-3 py-2 rounded-xl border border-[#ebe8e3] font-serif font-bold text-base text-[#1c1c19] outline-none focus:border-[#3d1018]"
                  />
                </div>
              </div>

              {uangFisikKasir !== '' && (
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    selisihKas === 0
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : selisihKas > 0
                      ? 'bg-blue-50 border-blue-200 text-blue-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">
                      {selisihKas === 0 ? 'check_circle' : selisihKas > 0 ? 'arrow_upward' : 'warning'}
                    </span>
                    <span className="font-bold">
                      {selisihKas === 0 ? 'Kas Cocok Tepat (Balans)' : selisihKas > 0 ? 'Surplus / Lebih' : 'Minus / Kurang'}
                    </span>
                  </div>
                  <span className="font-serif font-bold tabular-nums">
                    {selisihKas >= 0 ? `+Rp ${selisihKas.toLocaleString('id-ID')}` : `-Rp ${Math.abs(selisihKas).toLocaleString('id-ID')}`}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#ebe8e3]">
              <button
                type="button"
                onClick={() => setShiftModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#524344] hover:bg-[#f6f3ee] transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  showToast('Slip rekap tutup shift dicetak!', 'success');
                  setShiftModalOpen(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#3d1018] text-white text-xs font-bold hover:bg-[#58252c] transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Cetak Rekap Shift</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
