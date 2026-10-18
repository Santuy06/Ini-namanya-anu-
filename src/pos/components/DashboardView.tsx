import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { today } from '../../lib/domain';
import { fetchPaid } from '../../lib/report';
import { TransactionRecord } from '../types';

const toWIBDate = (iso: string) =>
  new Date(iso).toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' });

export const DashboardView: React.FC = () => {
  const { transactions, setActiveView } = useApp();
  const todayStr = today();
  const [dateFrom, setDateFrom] = useState(todayStr);
  const [dateTo, setDateTo] = useState(todayStr);
  const [customRangeTrx, setCustomRangeTrx] = useState<TransactionRecord[] | null>(null);
  const [isLoadingRange, setIsLoadingRange] = useState(false);

  // Period presets
  type Period = '1hari' | '1minggu' | '1bulan' | '1tahun' | 'custom';
  const [period, setPeriod] = useState<Period>('1hari');

  const getDaysAgo = (days: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' });
  };

  const getYearStart = (): string => {
    const d = new Date();
    const wib = d.toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' });
    return `${wib.slice(0, 4)}-01-01`;
  };

  const handlePeriodChange = (p: Period) => {
    setPeriod(p);
    if (p === '1hari') {
      setDateFrom(todayStr);
      setDateTo(todayStr);
    } else if (p === '1minggu') {
      setDateFrom(getDaysAgo(6));
      setDateTo(todayStr);
    } else if (p === '1bulan') {
      setDateFrom(getDaysAgo(29));
      setDateTo(todayStr);
    } else if (p === '1tahun') {
      setDateFrom(getYearStart());
      setDateTo(todayStr);
    }
  };

  // If viewing past date range, query Supabase for historical records
  useEffect(() => {
    if (dateFrom === todayStr && dateTo === todayStr) {
      setCustomRangeTrx(null);
      return;
    }
    let isCurrent = true;
    setIsLoadingRange(true);
    fetchPaid(dateFrom, dateTo)
      .then((rows) => {
        if (!isCurrent) return;
        const mapped: TransactionRecord[] = rows.map((r, idx) => {
          const hhmm = new Date(r.at)
            .toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })
            .replace('.', ':');
          return {
            id: `paid-range-${idx}-${r.no}`,
            code: `#${r.no}`,
            time: hhmm,
            at: r.at,
            typeMeja: r.table ? `Meja ${String(r.table).padStart(2, '0')}` : 'Bawa Pulang',
            source: r.src === 'qr' ? 'QR meja' : 'Manual',
            method: r.method === 'cash' ? 'Tunai' : r.method === 'qris' ? 'QRIS' : 'Kartu Debit',
            subtotal: r.subtotal,
            tax: r.total - r.subtotal,
            total: r.total,
            status: 'Lunas'
          };
        });
        setCustomRangeTrx(mapped);
      })
      .catch((err) => {
        console.warn('Dashboard fetchPaid error:', err);
      })
      .finally(() => {
        if (isCurrent) setIsLoadingRange(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [dateFrom, dateTo, todayStr]);

  const activeTransactions = customRangeTrx !== null ? customRangeTrx : transactions;

  const filteredTrx = useMemo(() => {
    return activeTransactions.filter((t) => {
      const d = toWIBDate(t.at ?? new Date().toISOString());
      return d >= dateFrom && d <= dateTo;
    });
  }, [activeTransactions, dateFrom, dateTo]);

  const totalPenjualan = filteredTrx.reduce((acc, t) => acc + t.total, 0);
  const totalSubtotal = filteredTrx.reduce((acc, t) => acc + t.subtotal, 0);
  const totalPajak = filteredTrx.reduce((acc, t) => acc + t.tax, 0);
  const avgTransaksi = Math.round(totalPenjualan / (filteredTrx.length || 1));

  const tunaiTrx = filteredTrx.filter((t) => t.method === 'Tunai');
  const qrisTrx = filteredTrx.filter((t) => t.method === 'QRIS');

  const tunaiTotal = tunaiTrx.reduce((acc, t) => acc + t.total, 0);
  const qrisTotal = qrisTrx.reduce((acc, t) => acc + t.total, 0);

  const tunaiPct = totalPenjualan ? Math.round((tunaiTotal / totalPenjualan) * 1000) / 10 : 0;
  const qrisPct = totalPenjualan ? Math.round((qrisTotal / totalPenjualan) * 1000) / 10 : 0;

  const isToday = dateFrom === todayStr && dateTo === todayStr;
  const dateLabel = isToday
    ? 'Hari ini'
    : dateFrom === dateTo
    ? new Date(dateFrom).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : `${new Date(dateFrom).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} – ${new Date(dateTo).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  return (
    <div className="flex flex-col w-full p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1540px] mx-auto pb-24 md:pb-8">
      {/* Top Action Bar & Title Block */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[#524344] text-xs font-semibold uppercase tracking-wider">
            <span>Rawon Gusti Surabaya</span>
            <span className="text-[#524344]">/</span>
            <span>Layanan Operasional</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#3d1018] tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#524344] flex items-center gap-1.5">
            {isLoadingRange ? (
              <span className="inline-flex items-center gap-1 text-[#994703]">
                <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                <span>Memuat data rentang tanggal...</span>
              </span>
            ) : (
              <span>{filteredTrx.length} transaksi • {dateLabel}</span>
            )}
          </p>
        </div>

        {/* Unified Date & Period Selector (1 Hari, 1 Minggu, 1 Bulan, 1 Tahun + 1 Unified Date Picker) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Presets */}
          <div className="inline-flex items-center bg-white p-1 rounded-xl border border-[#ebe8e3] shadow-xs">
            {(
              [
                { id: '1hari', label: '1 Hari' },
                { id: '1minggu', label: '1 Minggu' },
                { id: '1bulan', label: '1 Bulan' },
                { id: '1tahun', label: '1 Tahun' },
              ] as const
            ).map((p) => {
              const active = period === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePeriodChange(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#3d1018] text-white shadow-xs'
                      : 'text-[#524344] hover:text-[#1c1c19] hover:bg-[#f6f3ee]'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Unified Single Date Picker Box */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#ebe8e3] rounded-xl shadow-xs">
            <span className="material-symbols-outlined text-[#994703] text-[18px] shrink-0">calendar_today</span>
            <input
              id="dash-unified-date"
              type="date"
              value={dateFrom === dateTo ? dateFrom : dateTo}
              max={todayStr}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return;
                setDateFrom(val);
                setDateTo(val);
                setPeriod('custom');
              }}
              title="Pilih tanggal tertentu"
              className="text-xs font-semibold text-[#1c1c19] bg-transparent outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#ebe8e3] flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[#524344] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#524344]">
              Penjualan Lunas
            </span>
            <span className="w-8 h-8 rounded-full bg-[#f0ede9] flex items-center justify-center text-[#3d1018]">
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            </span>
          </div>
          <div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-[#3d1018] tabular-nums">
              Rp {totalPenjualan.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-[#524344] mt-1">Termasuk layanan 5% + PB1 10%</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#ebe8e3] flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[#524344] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#524344]">
              Transaksi Lunas
            </span>
            <span className="w-8 h-8 rounded-full bg-[#f0ede9] flex items-center justify-center text-[#3d1018]">
              <span className="material-symbols-outlined text-[18px]">checklist</span>
            </span>
          </div>
          <div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-[#3d1018] tabular-nums">
              {transactions.length}
            </div>
            <p className="text-xs text-[#524344] mt-1">{filteredTrx.length} transaksi selesai</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#ebe8e3] flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[#524344] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#524344]">
              Rata-rata Transaksi
            </span>
            <span className="w-8 h-8 rounded-full bg-[#f0ede9] flex items-center justify-center text-[#3d1018]">
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            </span>
          </div>
          <div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-[#3d1018] tabular-nums">
              Rp {avgTransaksi.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-[#524344] mt-1">Dibulatkan ke rupiah</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#ebe8e3] flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[#524344] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#524344]">
              Pajak Terkumpul
            </span>
            <span className="w-8 h-8 rounded-full bg-[#f0ede9] flex items-center justify-center text-[#3d1018]">
              <span className="material-symbols-outlined text-[18px]">percent</span>
            </span>
          </div>
          <div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-[#3d1018] tabular-nums">
              Rp {totalPajak.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-[#524344] mt-1">
              Subtotal Rp {totalSubtotal.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>

      {/* Middle Section: Chart Tren Penjualan & Metode Pembayaran */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Chart: Tren Penjualan (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#ebe8e3] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1c1c19]">
                  Tren penjualan
                </h2>
                <p className="text-xs text-[#524344]">
                  {dateLabel} • total Rp {totalPenjualan.toLocaleString('id-ID')}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#f0ede9] text-[#1c1c19] text-xs font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3d1018]"></span>
                Hari ini
              </span>
            </div>

            {/* Bar Chart Visualization */}
            <div className="mt-6 pt-4 pb-2">
              <div className="h-48 w-full flex items-end justify-between gap-2 sm:gap-4 px-2 sm:px-6">
                {/* 10-11 */}
                <div className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] text-[#524344] group-hover:text-[#1c1c19] transition-colors">
                    Rp0
                  </span>
                  <div className="w-full max-w-[48px] h-1 bg-[#f0ede9] rounded-t"></div>
                  <span className="text-[11px] text-[#524344]">10–11</span>
                </div>
                {/* 11-12 */}
                <div className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] text-[#524344] group-hover:text-[#1c1c19] transition-colors">
                    Rp0
                  </span>
                  <div className="w-full max-w-[48px] h-1 bg-[#f0ede9] rounded-t"></div>
                  <span className="text-[11px] text-[#524344]">11–12</span>
                </div>
                {/* 12-12.20 */}
                <div className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[11px] font-bold text-[#994703] group-hover:scale-105 transition-transform">
                    Rp147.400
                  </span>
                  <div className="w-full max-w-[48px] h-28 bg-[#ffdbc9] rounded-t transition-all group-hover:bg-[#ffb68c]"></div>
                  <span className="text-[11px] text-[#1c1c19] font-bold">12–12.20</span>
                </div>
                {/* 12.20-12.30 */}
                <div className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[11px] font-bold text-[#3d1018] group-hover:scale-105 transition-transform">
                    Rp220.000
                  </span>
                  <div className="w-full max-w-[48px] h-40 bg-[#58252c] rounded-t transition-all group-hover:bg-[#3d1018]"></div>
                  <span className="text-[11px] text-[#1c1c19] font-bold">12.20–12.30</span>
                </div>
                {/* 13-14 */}
                <div className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] text-[#524344] group-hover:text-[#1c1c19] transition-colors">
                    Rp0
                  </span>
                  <div className="w-full max-w-[48px] h-1 bg-[#f0ede9] rounded-t"></div>
                  <span className="text-[11px] text-[#524344]">13–14</span>
                </div>
                {/* 14-15 */}
                <div className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] text-[#524344] group-hover:text-[#1c1c19] transition-colors">
                    Rp0
                  </span>
                  <div className="w-full max-w-[48px] h-1 bg-[#f0ede9] rounded-t"></div>
                  <span className="text-[11px] text-[#524344]">14–15</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 mt-2 text-[#524344] text-xs bg-[#f6f3ee] px-4 py-2 rounded-xl">
            Data s.d. 12.30 WIB • interval jam mendatang belum ada transaksi tercatat.
          </div>
        </div>

        {/* Payment Method Card (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#ebe8e3] flex flex-col justify-between">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1c1c19]">
              Metode pembayaran
            </h2>
            <div className="mt-3">
              <span className="text-[11px] font-bold text-[#524344] uppercase tracking-wider block">
                Total Penerimaan
              </span>
              <div className="font-serif text-2xl font-bold text-[#3d1018] tracking-tight mt-0.5 tabular-nums">
                Rp {totalPenjualan.toLocaleString('id-ID')}
              </div>
            </div>

            {/* Proportion Progress Bar */}
            <div className="w-full h-3 rounded-full bg-[#f0ede9] overflow-hidden flex my-4">
              <div
                className="h-full bg-[#58252c] transition-all"
                style={{ width: `${tunaiPct}%` }}
                title={`Tunai ${tunaiPct}%`}
              ></div>
              <div
                className="h-full bg-[#fc934f] transition-all"
                style={{ width: `${qrisPct}%` }}
                title={`QRIS ${qrisPct}%`}
              ></div>
            </div>

            {/* Breakdown List */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-[#f6f3ee] transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#58252c] inline-block"></span>
                  <span className="text-[#1c1c19] font-medium">
                    Tunai • {tunaiTrx.length} transaksi ({tunaiPct}%)
                  </span>
                </div>
                <span className="font-bold text-[#1c1c19] tabular-nums">
                  Rp {tunaiTotal.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-[#f6f3ee] transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#fc934f] inline-block"></span>
                  <span className="text-[#1c1c19] font-medium">
                    QRIS • {qrisTrx.length} transaksi ({qrisPct}%)
                  </span>
                </div>
                <span className="font-bold text-[#1c1c19] tabular-nums">
                  Rp {qrisTotal.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-[#f6f3ee] flex items-start gap-2 text-[#524344] text-xs">
            <span className="material-symbols-outlined text-[16px] text-[#994703] shrink-0 mt-0.5">
              info
            </span>
            <span>QRIS dicatat setelah kasir memeriksa dana merchant secara berkala.</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Menu Terlaris & Transaksi Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Menu Terlaris (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#ebe8e3] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#1c1c19]">Menu terlaris</h2>
                <p className="text-xs text-[#524344]">Berdasarkan kuantitas transaksi lunas</p>
              </div>
              <span className="material-symbols-outlined text-[#994703]">
                local_fire_department
              </span>
            </div>

            <div className="divide-y divide-[#ebe8e3] space-y-3 mt-3">
              {/* Item 1 */}
              <div className="flex items-center justify-between pt-2 first:pt-0">
                <div className="flex items-center gap-3">
                  <img
                    className="w-12 h-12 rounded-xl object-cover shadow-xs"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFHSGMKXQx63I6WBr9cugQ8S2GdGhN6R-eMVPx6SlumIcNoHCJd0bnu_1YQnGjqrukL2SRb9WVZQ0Ksld_wCxuqM2lQ5j0eEoaGGcRwj_GWsz7xUi2hFnIWedNIQiO91PyFU8VF8Anm_Y2lh6wvGp3DWIb_XNxuRi31yIzmkt73v85U75smBDD12-TzWIosmL4yKHH41MTSgcJN1x3EwDMC3h_MSeRMXyHvgoV_FXis9HRXo3D_bXcPQ"
                    alt="Rawon Daging"
                    width={48}
                    height={48}
                    loading="lazy"
                    decoding="async"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-[#1c1c19]">Rawon Daging</h3>
                    <span className="text-xs text-[#524344]">8 porsi terjual</span>
                  </div>
                </div>
                <span className="font-bold text-sm text-[#3d1018] tabular-nums">Rp 168.000</span>
              </div>

              {/* Item 2 */}
              <div className="flex items-center justify-between pt-3">
                <div className="flex items-center gap-3">
                  <img
                    className="w-12 h-12 rounded-xl object-cover shadow-xs"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCutdZvEnhdcvQ8PaXqmbYd_s_eDADnaXr7jH1dPMzrgIcAHelx4cFb-nxA6cGLY6n4EWNZQXZJugpa6SOSg8-7sDqhB_Ku8YjaFYAEwAtTCHKVzppaXTsfOKALkDmmTQJnNShsGv2r3fvYLeDcmOeQ3rhfyYRf7cTWtpQbiwW3p_-x4RncOKitZiGcYo8YYJC0L2-xbtAxfkIGXzuV70HGh2tuUqswYutqbVcNdOsyyaphZSigUFTOow"
                    alt="Nasi Putih"
                    width={48}
                    height={48}
                    loading="lazy"
                    decoding="async"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-[#1c1c19]">Nasi Putih</h3>
                    <span className="text-xs text-[#524344]">8 porsi terjual</span>
                  </div>
                </div>
                <span className="font-bold text-sm text-[#3d1018] tabular-nums">Rp 40.000</span>
              </div>

              {/* Item 3 */}
              <div className="flex items-center justify-between pt-3">
                <div className="flex items-center gap-3">
                  <img
                    className="w-12 h-12 rounded-xl object-cover shadow-xs"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQo4qWiJ4sHgMDfwQT_6x16KuBJU4HC3DlzT8y55nwVgHeFLBz44Dd6prXwQf4nfgdUqTK3_HZBnBvLtbg5L6RGSrVbAOMeM0Vaws9p04DE3mkL_CFWVEdrvk8kHBmrCPGvUsuH9_3x55Y29PJQt58g9Qm-fWdRAOYdT2uWq2qfLUlueA-I7_ItWeE8ohmmVXS4qbEFnEQF9xgaJOuG_O0CyFi6glns0o0QhViaFX-lrBzP6q6s6Bl4A"
                    alt="Rawon Campur"
                    width={48}
                    height={48}
                    loading="lazy"
                    decoding="async"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-[#1c1c19]">Rawon Campur</h3>
                    <span className="text-xs text-[#524344]">3 porsi terjual</span>
                  </div>
                </div>
                <span className="font-bold text-sm text-[#3d1018] tabular-nums">Rp 81.000</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 space-y-2 border-t border-[#ebe8e3]">
            <div className="flex items-center justify-between text-xs text-[#524344]">
              <span>Total item terjual</span>
              <span className="font-bold text-[#1c1c19]">27 item</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('kelola-menu')}
              className="w-full py-2.5 px-4 rounded-xl bg-[#f0ede9] hover:bg-[#ebe8e3] text-[#1c1c19] text-xs font-semibold transition-colors flex items-center justify-center gap-1 active:scale-95"
            >
              <span>Lihat kelola menu</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Transaksi Terbaru (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#ebe8e3] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg font-bold text-[#1c1c19]">Transaksi terbaru</h2>
              <button
                onClick={() => setActiveView('laporan')}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#3d1018] hover:underline"
              >
                <span>Lihat laporan</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            {/* Transaction Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[#524344] uppercase tracking-wider bg-[#f6f3ee] text-[10px] font-bold">
                    <th scope="col" className="py-2.5 px-3 rounded-l-xl">Pesanan</th>
                    <th scope="col" className="py-2.5 px-3">Tipe / Meja</th>
                    <th scope="col" className="py-2.5 px-3">Metode</th>
                    <th scope="col" className="py-2.5 px-3">Total</th>
                    <th scope="col" className="py-2.5 px-3 rounded-r-xl text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ebe8e3]">
                  {filteredTrx.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-xs text-[#524344]">
                        Belum ada transaksi pada periode ini
                      </td>
                    </tr>
                  ) : (
                    filteredTrx.slice(0, 6).map((trx, idx) => (
                      <tr
                        key={trx.id}
                        className={`hover:bg-[#f6f3ee] transition-colors ${
                          idx === 0 ? 'bg-[#ffdadc]/30 font-medium' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-bold text-[#3d1018]">{trx.code}</td>
                        <td className="py-3 px-3 text-[#1c1c19]">{trx.typeMeja}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              trx.method === 'Tunai'
                                ? 'bg-amber-50 text-amber-900 border border-amber-300'
                                : 'bg-rose-50 text-[#3d1018] border border-rose-200'
                            }`}
                          >
                            {trx.method}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-[#1c1c19] tabular-nums">
                          Rp {trx.total.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="px-2 py-0.5 rounded-full bg-[#f0ede9] text-[#524344] text-[10px] font-semibold">
                            {trx.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 mt-3 text-xs text-[#524344] flex items-center justify-between border-t border-[#ebe8e3]">
            <span>
              {filteredTrx.length} transaksi • subtotal Rp {totalSubtotal.toLocaleString('id-ID')} +
              pajak Rp {totalPajak.toLocaleString('id-ID')}
            </span>
            <span className="flex items-center gap-1 text-[#524344]">
              <span className="material-symbols-outlined text-[14px]">sync</span>
              Data live
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
