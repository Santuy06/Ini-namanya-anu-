import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KitchenTicket } from '../types';

export const KitchenDisplayView: React.FC = () => {
  const { kitchenTickets, advanceTicketStatus, showToast } = useApp();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedStation, setSelectedStation] = useState('All stations');
  const [activeLaneFilter, setActiveLaneFilter] = useState<'all' | 'new' | 'preparing' | 'ready'>('all');

  const playKitchenChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch {
      // AudioContext fallback
    }
  };

  const handleAdvance = (ticket: KitchenTicket) => {
    playKitchenChime();
    advanceTicketStatus(ticket.id);
    if (ticket.status === 'new') {
      showToast(`${ticket.tableNumber} mulai dimasak di dapur`, 'info');
    } else if (ticket.status === 'preparing') {
      showToast(`${ticket.tableNumber} SIAP DISAJIKAN! Notifikasi terkirim ke waiter`, 'success');
    } else if (ticket.status === 'ready') {
      showToast(`${ticket.tableNumber} selesai diantar ke meja tamu`, 'success');
    }
  };

  const formatTimer = (seconds: number) => {
    if (seconds >= 3600) {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      return `${hours}j ${mins}m`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Filter tickets by station
  const stationTickets = kitchenTickets.filter((t) => {
    if (selectedStation === 'All stations') return true;
    return t.station === selectedStation;
  });

  const newTickets = stationTickets.filter((t) => t.status === 'new');
  const preparingTickets = stationTickets.filter((t) => t.status === 'preparing');
  const readyTickets = stationTickets.filter((t) => t.status === 'ready');
  const overdueTickets = stationTickets.filter((t) => t.isPriority || (t.elapsedSeconds > 900 && t.status !== 'ready'));

  // For mobile lane filter
  const visibleTickets =
    activeLaneFilter === 'all'
      ? stationTickets.filter((t) => t.status !== 'served')
      : activeLaneFilter === 'new'
      ? newTickets
      : activeLaneFilter === 'preparing'
      ? preparingTickets
      : readyTickets;

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#fcf9f4] text-[#1c1c19] pb-28 md:pb-12 max-w-[1720px] mx-auto px-4 sm:px-8 pt-4 font-sans">
      {/* SubHeader Overview Controls */}
      <section className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="text-xs uppercase font-extrabold tracking-wider text-[#73351b]">
              KITCHEN DISPLAY SYSTEM (KDS)
            </p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1c19] tracking-tight mb-1">
            Pantauan Antrean Dapur & Bar
          </h1>
          <p className="text-xs sm:text-sm text-[#6b584d] font-medium flex items-center space-x-2">
            <span className="font-semibold text-[#1c1c19]">{stationTickets.length} tiket aktif</span>
            <span className="text-[#847374]">•</span>
            <span>{stationTickets.reduce((acc, t) => acc + t.totalItems, 0)} item pesanan</span>
            <span className="text-[#847374]">•</span>
            <span>Rawon Gusti</span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              showToast(`Suara notifikasi KDS: ${!soundEnabled ? 'Aktif' : 'Mati'}`);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border shadow-xs transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-white border-[#ebe8e3] text-[#1c1c19] hover:bg-[#f6f3ee]'
                : 'bg-[#f0ede9] border-transparent text-[#847374]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {soundEnabled ? 'volume_up' : 'volume_off'}
            </span>
            <span>{soundEnabled ? 'Suara Aktif' : 'Senyap'}</span>
          </button>

          <div className="relative">
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="appearance-none bg-white border border-[#ebe8e3] hover:bg-[#f6f3ee] rounded-xl px-4 py-2.5 pr-8 text-xs sm:text-sm font-semibold text-[#1c1c19] shadow-xs cursor-pointer outline-none"
            >
              <option value="All stations">Semua Stasiun</option>
              <option value="Stasiun Rawon & Dapur Panas">Stasiun Rawon & Dapur Panas</option>
              <option value="Bar Minuman">Bar Minuman</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#847374] text-[16px] pointer-events-none">
              expand_more
            </span>
          </div>
        </div>
      </section>

      {/* 3 Metric Cards Dinamis (Real Data) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Metric 1: Menunggu Dimasak */}
        <div className="bg-white border border-[#ebe8e3] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">receipt_long</span>
            </div>
            <div>
              <p className="text-xs text-[#6b584d] font-medium">Antrean Baru</p>
              <p className="text-2xl font-bold text-[#1c1c19] tabular-nums mt-0.5">
                {newTickets.length} <span className="text-sm font-medium text-[#847374]">tiket</span>
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold bg-amber-50 text-amber-800 px-3 py-1 rounded-lg border border-amber-200">
            Menunggu Dapur
          </span>
        </div>

        {/* Metric 2: Sedang Dimasak */}
        <div className="bg-white border border-[#ebe8e3] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">skillet</span>
            </div>
            <div>
              <p className="text-xs text-[#6b584d] font-medium">Sedang Dimasak</p>
              <p className="text-2xl font-bold text-[#1c1c19] tabular-nums mt-0.5">
                {preparingTickets.length} <span className="text-sm font-medium text-[#847374]">tiket</span>
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold bg-orange-50 text-orange-800 px-3 py-1 rounded-lg border border-orange-200">
            Proses Masak
          </span>
        </div>

        {/* Metric 3: Siap Disajikan / Perlu Perhatian */}
        <div className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between ${
          overdueTickets.length > 0
            ? 'border-red-200 bg-gradient-to-r from-white to-red-50/40'
            : 'border-emerald-200 bg-gradient-to-r from-white to-emerald-50/30'
        }`}>
          <div className="flex items-center space-x-3.5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold ${
              overdueTickets.length > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
            }`}>
              <span className="material-symbols-outlined text-[24px]">
                {overdueTickets.length > 0 ? 'warning' : 'room_service'}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-[#6b584d]">
                {overdueTickets.length > 0 ? 'Perlu Perhatian (>15m)' : 'Siap Disajikan'}
              </p>
              <p className={`text-2xl font-bold tabular-nums mt-0.5 ${
                overdueTickets.length > 0 ? 'text-red-800' : 'text-emerald-800'
              }`}>
                {overdueTickets.length > 0 ? overdueTickets.length : readyTickets.length}{' '}
                <span className="text-sm font-medium text-[#847374]">tiket</span>
              </p>
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-lg border ${
            overdueTickets.length > 0
              ? 'bg-red-100 text-red-800 border-red-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}>
            {overdueTickets.length > 0 ? 'Segera Prioritaskan' : 'Siap Antar'}
          </span>
        </div>
      </section>

      {/* Mobile Tab Filter Bar */}
      <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-3">
        <button
          onClick={() => setActiveLaneFilter('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 ${
            activeLaneFilter === 'all'
              ? 'bg-[#3d1018] text-white'
              : 'bg-white text-[#524344] border border-[#ebe8e3]'
          }`}
        >
          Semua ({stationTickets.length})
        </button>
        <button
          onClick={() => setActiveLaneFilter('new')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 ${
            activeLaneFilter === 'new'
              ? 'bg-[#3d1018] text-white'
              : 'bg-white text-[#524344] border border-[#ebe8e3]'
          }`}
        >
          Baru ({newTickets.length})
        </button>
        <button
          onClick={() => setActiveLaneFilter('preparing')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 ${
            activeLaneFilter === 'preparing'
              ? 'bg-[#3d1018] text-white'
              : 'bg-white text-[#524344] border border-[#ebe8e3]'
          }`}
        >
          Dimasak ({preparingTickets.length})
        </button>
        <button
          onClick={() => setActiveLaneFilter('ready')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 ${
            activeLaneFilter === 'ready'
              ? 'bg-[#3d1018] text-white'
              : 'bg-white text-[#524344] border border-[#ebe8e3]'
          }`}
        >
          Siap Antar ({readyTickets.length})
        </button>
      </div>

      {/* Desktop 3-Column Kanban Board */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-6 items-start">
        {/* ================= COLUMN 1: NEW ================= */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-1 px-1 border-b border-[#ebe8e3]">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h2 className="text-base font-bold text-[#1c1c19] tracking-tight">Pesanan Baru</h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                {newTickets.length}
              </span>
            </div>
            <span className="text-xs text-[#847374]">Menunggu dimasak</span>
          </div>

          <div className="space-y-4">
            {newTickets.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-[#e6e2db] p-8 text-center bg-white/60 flex flex-col items-center justify-center min-h-[220px]">
                <span className="material-symbols-outlined text-[36px] text-[#b4a89f] mb-2">check_circle_outline</span>
                <p className="font-bold text-sm text-[#524344]">Tidak ada antrean baru</p>
                <p className="text-xs text-[#847374] mt-1">Semua pesanan sudah masuk proses masak</p>
              </div>
            ) : (
              newTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white rounded-2xl border border-amber-300 shadow-sm overflow-hidden flex flex-col justify-between transition-all hover:shadow-md"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-2xl font-black text-[#1c1c19] tracking-tight">
                          {ticket.tableNumber}
                        </h3>
                        <p className="text-xs text-[#524344] mt-0.5 font-medium">
                          {ticket.ticketNumber} • {ticket.type}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block bg-amber-50 text-amber-800 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-amber-200">
                          {formatTimer(ticket.elapsedSeconds)}
                        </span>
                        <p className="text-[10px] text-[#847374] mt-0.5">sejak dipesan</p>
                      </div>
                    </div>

                    {ticket.notesBanner && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 flex items-center space-x-2 text-xs font-medium text-amber-900 mb-3">
                        <span className="material-symbols-outlined text-[16px] text-amber-700">info</span>
                        <span>{ticket.notesBanner}</span>
                      </div>
                    )}

                    <ul className="space-y-2.5 text-xs sm:text-sm text-[#1c1c19] border-t border-dashed border-[#ebe8e3] pt-3">
                      {ticket.items.map((it, idx) => (
                        <li key={idx} className="flex items-start justify-between py-0.5">
                          <div className="flex items-start">
                            <span className="font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded mr-2 text-xs font-mono">
                              {it.quantity}×
                            </span>
                            <span className="font-semibold text-[#1c1c19]">{it.name}</span>
                          </div>
                          {it.notes && (
                            <span className="text-[11px] text-[#994703] font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200 max-w-[140px] truncate">
                              {it.notes}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[#fcfaf7] px-5 py-3 border-t border-[#ebe8e3]">
                    <div className="flex items-center justify-between text-xs text-[#524344] mb-3 font-medium">
                      <span>Pelayan: {ticket.waiterName}</span>
                      <span className="font-bold text-[#1c1c19]">{ticket.totalItems} menu</span>
                    </div>
                    <button
                      onClick={() => handleAdvance(ticket)}
                      className="w-full bg-[#73351b] hover:bg-[#5b2a15] text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-all active:scale-[0.99] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">skillet</span>
                      <span>Mulai Masak</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ================= COLUMN 2: PREPARING ================= */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-1 px-1 border-b border-[#ebe8e3]">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              <h2 className="text-base font-bold text-[#1c1c19] tracking-tight">Sedang Dimasak</h2>
              <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-900 text-xs font-bold">
                {preparingTickets.length}
              </span>
            </div>
            <span className="text-xs text-[#847374]">Proses dapur</span>
          </div>

          <div className="space-y-4">
            {preparingTickets.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-[#e6e2db] p-8 text-center bg-white/60 flex flex-col items-center justify-center min-h-[220px]">
                <span className="material-symbols-outlined text-[36px] text-[#b4a89f] mb-2">skillet</span>
                <p className="font-bold text-sm text-[#524344]">Dapur sedang luang</p>
                <p className="text-xs text-[#847374] mt-1">Tidak ada menu yang sedang dimasak</p>
              </div>
            ) : (
              preparingTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between border-2 transition-all hover:shadow-md ${
                    ticket.isPriority ? 'border-red-500 ring-2 ring-red-300' : 'border-orange-300'
                  }`}
                >
                  {ticket.isPriority && (
                    <div className="bg-red-600 text-white text-[11px] font-bold px-4 py-1 flex items-center justify-between uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">warning</span>
                        Lewat 15 menit • Prioritaskan
                      </span>
                      <span className="bg-white/20 px-1.5 py-0.2 rounded text-[10px]">URGENT</span>
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-2xl font-black text-[#1c1c19] tracking-tight">
                          {ticket.tableNumber}
                        </h3>
                        <p className="text-xs text-[#524344] mt-0.5 font-medium">
                          {ticket.ticketNumber} • {ticket.type}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block font-mono font-bold text-xs px-2.5 py-1 rounded-md ${
                            ticket.isPriority
                              ? 'bg-red-600 text-white'
                              : 'bg-orange-100 text-orange-950 border border-orange-300'
                          }`}
                        >
                          {formatTimer(ticket.elapsedSeconds)}
                        </span>
                        <p className="text-[10px] text-[#847374] mt-0.5">durasi masak</p>
                      </div>
                    </div>

                    <ul className="space-y-2.5 text-xs sm:text-sm text-[#1c1c19] border-t border-dashed border-[#ebe8e3] pt-3">
                      {ticket.items.map((it, idx) => (
                        <li key={idx} className="flex items-start justify-between py-0.5">
                          <div className="flex items-start">
                            <span
                              className={`font-bold mr-2 text-xs font-mono px-1.5 py-0.5 rounded ${
                                ticket.isPriority ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-900'
                              }`}
                            >
                              {it.quantity}×
                            </span>
                            <span className="font-semibold text-[#1c1c19]">{it.name}</span>
                          </div>
                          {it.notes && (
                            <span className="text-[11px] text-red-700 font-medium bg-red-50 px-2 py-0.5 rounded border border-red-200 max-w-[140px] truncate">
                              {it.notes}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[#fcfaf7] px-5 py-3 border-t border-[#ebe8e3]">
                    <div className="flex items-center justify-between text-xs text-[#524344] mb-3 font-medium">
                      <span>Pelayan: {ticket.waiterName}</span>
                      <span className="font-bold text-[#1c1c19]">{ticket.totalItems} menu</span>
                    </div>
                    <button
                      onClick={() => handleAdvance(ticket)}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-all active:scale-[0.99] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">notifications_active</span>
                      <span>Selesai Masak (Siap Antar)</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ================= COLUMN 3: READY ================= */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-1 px-1 border-b border-[#ebe8e3]">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h2 className="text-base font-bold text-[#1c1c19] tracking-tight">Siap Diantar</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                {readyTickets.length}
              </span>
            </div>
            <span className="text-xs text-[#847374]">Menunggu diantar waiter</span>
          </div>

          <div className="space-y-4">
            {readyTickets.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-[#e6e2db] p-8 text-center bg-white/60 flex flex-col items-center justify-center min-h-[220px]">
                <span className="material-symbols-outlined text-[36px] text-[#b4a89f] mb-2">room_service</span>
                <p className="font-bold text-sm text-[#524344]">Semua hidangan terantar</p>
                <p className="text-xs text-[#847374] mt-1">Tidak ada pesanan menunggu diantar</p>
              </div>
            ) : (
              readyTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white rounded-2xl border border-emerald-300 shadow-sm overflow-hidden flex flex-col justify-between transition-all hover:shadow-md"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-2xl font-black text-[#1c1c19] tracking-tight">
                          {ticket.tableNumber}
                        </h3>
                        <p className="text-xs text-[#524344] mt-0.5 font-medium">
                          {ticket.ticketNumber} • {ticket.type}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block bg-emerald-50 text-emerald-800 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-emerald-200">
                          {formatTimer(ticket.elapsedSeconds)}
                        </span>
                        <p className="text-[10px] text-[#847374] mt-0.5">sejak siap</p>
                      </div>
                    </div>

                    <ul className="space-y-2 text-xs sm:text-sm text-[#1c1c19] border-t border-dashed border-[#ebe8e3] pt-3">
                      {ticket.items.map((it, idx) => (
                        <li key={idx} className="flex items-center justify-between py-1 border-b border-[#f4f1eb] last:border-0">
                          <div className="flex items-center">
                            <span className="font-bold mr-2 text-xs font-mono text-emerald-900 bg-emerald-100 px-1.5 py-0.5 rounded text-center">
                              {it.quantity}×
                            </span>
                            <span className="font-semibold text-[#1c1c19]">{it.name}</span>
                          </div>
                          <span className="ml-2 text-emerald-800 text-[11px] font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">done</span>
                            Siap Saji
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[#fcfaf7] px-5 py-3 border-t border-[#ebe8e3]">
                    <div className="flex items-center justify-between text-xs text-[#524344] mb-3 font-medium">
                      <span>Pelayan: {ticket.waiterName}</span>
                      <span className="font-bold text-[#1c1c19]">{ticket.totalItems} menu</span>
                    </div>
                    <button
                      onClick={() => handleAdvance(ticket)}
                      className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-colors active:scale-[0.99] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        check_circle
                      </span>
                      <span>Tandai Sudah Disajikan (Served)</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mobile Stream Cards (shown on small screens) */}
      <div className="lg:hidden space-y-4">
        {visibleTickets.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-[#ebe8e3] p-8 text-center text-sm text-[#847374]">
            Tidak ada pesanan di kategori ini
          </div>
        ) : (
          visibleTickets.map((ticket) => (
            <div
              key={ticket.id}
              className={`bg-white rounded-2xl shadow-sm border p-4 flex flex-col gap-3 ${
                ticket.isPriority
                  ? 'border-red-500 ring-1 ring-red-400'
                  : ticket.status === 'ready'
                  ? 'border-emerald-300'
                  : 'border-[#ebe8e3]'
              }`}
            >
              <div className="flex items-start justify-between border-b border-[#ebe8e3] pb-2">
                <div>
                  <h3 className="text-xl font-black text-[#1c1c19]">
                    {ticket.tableNumber}
                  </h3>
                  <span className="text-xs text-[#524344] font-medium">
                    {ticket.ticketNumber} • Pelayan: {ticket.waiterName}
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                      ticket.isPriority
                        ? 'bg-red-600 text-white'
                        : ticket.status === 'ready'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-[#f0ede9] text-[#1c1c19]'
                    }`}
                  >
                    {formatTimer(ticket.elapsedSeconds)}
                  </span>
                  <span className="text-[10px] text-[#847374] block mt-0.5">
                    {ticket.status === 'ready' ? 'sejak siap' : 'sedang dimasak'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                {ticket.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center py-0.5">
                    <span className="font-semibold text-[#1c1c19]">
                      <strong className="text-amber-900 bg-amber-50 px-1 rounded mr-1">{it.quantity}x</strong> {it.name}
                    </span>
                    {ticket.status === 'ready' ? (
                      <span className="text-emerald-700 font-bold text-[11px]">✓ Siap</span>
                    ) : it.notes ? (
                      <span className="text-[#994703] font-medium text-[11px] bg-amber-50 px-1.5 rounded">{it.notes}</span>
                    ) : null}
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleAdvance(ticket)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                  ticket.status === 'ready'
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                    : 'bg-[#73351b] hover:bg-[#5b2a15] text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {ticket.status === 'new'
                    ? 'skillet'
                    : ticket.status === 'preparing'
                    ? 'notifications_active'
                    : 'check_circle'}
                </span>
                <span>
                  {ticket.status === 'new'
                    ? 'Mulai Masak'
                    : ticket.status === 'preparing'
                    ? 'Tandai Siap Saji'
                    : 'Tandai Sudah Disajikan'}
                </span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
