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
      showToast(`${ticket.tableNumber} mulai dimasak di stasiun dapur`, 'info');
    } else if (ticket.status === 'preparing') {
      showToast(`${ticket.tableNumber} SIAP DISAJIKAN! Notifikasi dikirim ke waiter`, 'success');
    } else if (ticket.status === 'ready') {
      showToast(`${ticket.tableNumber} selesai diantar ke meja tamu`, 'success');
    }
  };

  const formatTimer = (seconds: number) => {
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
    <div className="flex flex-col w-full min-h-screen bg-[#fcf9f4] text-[#1c1c19] pb-28 md:pb-12 max-w-[1720px] mx-auto px-4 sm:px-8 pt-4">
      {/* SubHeader Overview Controls */}
      <section className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          <p className="text-xs uppercase font-extrabold tracking-widest text-[#3d1018] mb-1">
            Kitchen Display System (KDS)
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1c1c19] tracking-tight mb-1">
            Every ticket, right on time.
          </h1>
          <p className="text-xs sm:text-sm text-[#524344] font-medium flex items-center space-x-2">
            <span>{stationTickets.length} active tickets</span>
            <span className="text-[#847374]">•</span>
            <span>
              {stationTickets.reduce((acc, t) => acc + t.totalItems, 0)} items
            </span>
            <span className="text-[#847374]">•</span>
            <span>Lunch service</span>
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
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border shadow-xs transition-colors ${
              soundEnabled
                ? 'bg-white border-[#ebe8e3] text-[#1c1c19]'
                : 'bg-[#f0ede9] border-transparent text-[#847374]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {soundEnabled ? 'volume_up' : 'volume_off'}
            </span>
            <span>{soundEnabled ? 'Sound on' : 'Muted'}</span>
          </button>

          <div className="relative">
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="appearance-none bg-white border border-[#ebe8e3] hover:bg-[#f6f3ee] rounded-xl px-4 py-2.5 pr-8 text-xs sm:text-sm font-semibold text-[#1c1c19] shadow-xs cursor-pointer outline-none"
            >
              <option value="All stations">All stations</option>
              <option value="Stasiun Rawon & Dapur Panas">Stasiun Rawon & Dapur Panas</option>
              <option value="Bar Minuman">Bar Minuman</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#847374] text-[16px] pointer-events-none">
              expand_more
            </span>
          </div>
        </div>
      </section>

      {/* 3 Metric Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Metric 1 */}
        <div className="bg-white border border-[#ebe8e3] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#f0ede9] flex items-center justify-center text-[#1c1c19]">
              <span className="material-symbols-outlined text-[22px]">timer</span>
            </div>
            <div>
              <p className="text-xs text-[#524344] font-medium">Average prep time</p>
              <p className="text-2xl font-bold text-[#1c1c19] tabular-nums mt-0.5">11 min</p>
            </div>
          </div>
          <span className="text-xs text-[#524344] font-medium bg-[#f6f3ee] px-2.5 py-1 rounded-lg border border-[#ebe8e3]">
            Target under 15 min
          </span>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-[#ebe8e3] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px] text-emerald-700">
                check_circle
              </span>
            </div>
            <div>
              <p className="text-xs text-[#524344] font-medium">Completed this service</p>
              <p className="text-2xl font-bold text-[#1c1c19] tabular-nums mt-0.5">38 tickets</p>
            </div>
          </div>
          <span className="text-xs text-[#524344] font-medium bg-[#f6f3ee] px-2.5 py-1 rounded-lg border border-[#ebe8e3]">
            Since 11:00 AM
          </span>
        </div>

        {/* Metric 3: Needs Attention Alert */}
        <div className="bg-white border border-red-200 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between bg-gradient-to-r from-white to-red-50/40">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center text-red-700">
              <span className="material-symbols-outlined text-[22px] text-red-600">
                alarm_on
              </span>
            </div>
            <div>
              <p className="text-xs text-red-700 font-bold">Needs attention</p>
              <p className="text-2xl font-bold text-red-800 tabular-nums mt-0.5">1 ticket</p>
            </div>
          </div>
          <span className="text-xs text-red-800 font-bold bg-red-100 px-2.5 py-1 rounded-lg border border-red-200">
            Table 02 • 18 min elapsed
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
      <div className="hidden lg:grid lg:grid-cols-3 gap-6">
        {/* ================= COLUMN 1: NEW ================= */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-1 px-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-[#1c1c19] tracking-tight">New</h2>
              <span className="w-5 h-5 rounded-full bg-[#ebe8e3] text-[#1c1c19] text-xs font-bold flex items-center justify-center">
                {newTickets.length}
              </span>
            </div>
            <span className="text-xs text-[#847374]">Waiting to be started</span>
          </div>

          <div className="space-y-4">
            {newTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-2xl border-2 border-[#1c1c19] shadow-sm overflow-hidden flex flex-col justify-between"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-2xl font-serif font-bold text-[#1c1c19]">
                        {ticket.tableNumber}
                      </h3>
                      <p className="text-xs text-[#524344] mt-0.5">
                        {ticket.ticketNumber} • {ticket.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block bg-rose-50 text-rose-700 text-xs font-mono font-bold px-2 py-0.5 rounded-md border border-rose-200">
                        {formatTimer(ticket.elapsedSeconds)}
                      </span>
                      <p className="text-[10px] text-[#847374] mt-0.5">elapsed</p>
                    </div>
                  </div>

                  {ticket.notesBanner && (
                    <div className="bg-[#ffdad6]/40 border border-[#ba1a1a]/20 rounded-xl px-3 py-1.5 flex items-center space-x-2 text-xs font-medium text-[#93000a] mb-3">
                      <span className="material-symbols-outlined text-[16px]">
                        arrow_downward
                      </span>
                      <span>{ticket.notesBanner}</span>
                    </div>
                  )}

                  <ul className="space-y-2.5 text-xs sm:text-sm text-[#1c1c19] border-t border-dashed border-[#ebe8e3] pt-3">
                    {ticket.items.map((it, idx) => (
                      <li key={idx}>
                        <div className="flex items-start">
                          <span className="font-bold text-[#3d1018] mr-2 w-5 font-mono">
                            {it.quantity}×
                          </span>
                          <span className="font-semibold text-[#1c1c19]">{it.name}</span>
                        </div>
                        {it.notes && (
                          <p className="text-xs text-[#994703] font-medium pl-7 mt-0.5">
                            {it.notes}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#f6f3ee] px-5 py-3 border-t border-[#ebe8e3]">
                  <div className="flex items-center justify-between text-xs text-[#524344] mb-3 font-medium">
                    <span>Waiter: {ticket.waiterName}</span>
                    <span>{ticket.totalItems} items</span>
                  </div>
                  <button
                    onClick={() => handleAdvance(ticket)}
                    className="w-full bg-[#3d1018] hover:bg-[#58252c] text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-all active:scale-[0.99]"
                  >
                    <span className="material-symbols-outlined text-[16px]">local_fire_department</span>
                    <span>Start preparing</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= COLUMN 2: PREPARING ================= */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-1 px-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-[#1c1c19] tracking-tight">Preparing</h2>
              <span className="w-5 h-5 rounded-full bg-[#ffdbc9] text-[#753400] text-xs font-bold flex items-center justify-center">
                {preparingTickets.length}
              </span>
            </div>
            <span className="text-xs text-[#847374]">In the kitchen now</span>
          </div>

          <div className="space-y-4">
            {preparingTickets.map((ticket) => (
              <div
                key={ticket.id}
                className={`bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between border-2 ${
                  ticket.isPriority ? 'border-red-600 ring-2 ring-red-400' : 'border-[#ebe8e3]'
                }`}
              >
                {ticket.isPriority && (
                  <div className="bg-red-600 text-white text-[11px] font-bold px-4 py-1 flex items-center justify-between uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">warning</span>
                      Over 15 min target • prioritize
                    </span>
                    <span className="bg-white/20 px-1.5 py-0.2 rounded text-[10px]">URGENT</span>
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-2xl font-serif font-bold text-[#1c1c19]">
                        {ticket.tableNumber}
                      </h3>
                      <p className="text-xs text-[#524344] mt-0.5">
                        {ticket.ticketNumber} • {ticket.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block font-mono font-bold text-xs px-2.5 py-0.5 rounded-md ${
                          ticket.isPriority
                            ? 'bg-red-600 text-white'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {formatTimer(ticket.elapsedSeconds)}
                      </span>
                      <p className="text-[10px] text-[#847374] mt-0.5">elapsed</p>
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs sm:text-sm text-[#1c1c19] border-t border-dashed border-[#ebe8e3] pt-3">
                    {ticket.items.map((it, idx) => (
                      <li key={idx}>
                        <div className="flex items-start">
                          <span
                            className={`font-bold mr-2 w-5 font-mono ${
                              ticket.isPriority ? 'text-red-700' : 'text-[#3d1018]'
                            }`}
                          >
                            {it.quantity}×
                          </span>
                          <span className="font-semibold text-[#1c1c19]">{it.name}</span>
                        </div>
                        {it.notes && (
                          <p className="text-xs text-red-700 font-medium pl-7 mt-0.5 bg-red-50 p-1 rounded inline-block">
                            {it.notes}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#f6f3ee] px-5 py-3 border-t border-[#ebe8e3]">
                  <div className="flex items-center justify-between text-xs text-[#524344] mb-3 font-medium">
                    <span>Waiter: {ticket.waiterName}</span>
                    <span>{ticket.totalItems} items</span>
                  </div>
                  <button
                    onClick={() => handleAdvance(ticket)}
                    className="w-full bg-[#3d1018] hover:bg-[#58252c] text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-all active:scale-[0.99]"
                  >
                    <span className="material-symbols-outlined text-[16px]">notifications_active</span>
                    <span>Mark as ready</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= COLUMN 3: READY ================= */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-1 px-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-[#1c1c19] tracking-tight">Ready</h2>
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                {readyTickets.length}
              </span>
            </div>
            <span className="text-xs text-[#847374]">Ready for waiter pickup</span>
          </div>

          <div className="space-y-4">
            {readyTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-2xl border border-emerald-300 shadow-sm overflow-hidden flex flex-col justify-between"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-2xl font-serif font-bold text-[#1c1c19]">
                        {ticket.tableNumber}
                      </h3>
                      <p className="text-xs text-[#524344] mt-0.5">
                        {ticket.ticketNumber} • {ticket.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block bg-emerald-50 text-emerald-800 text-xs font-mono font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                        {formatTimer(ticket.elapsedSeconds)}
                      </span>
                      <p className="text-[10px] text-[#847374] mt-0.5">since ready</p>
                    </div>
                  </div>

                  <ul className="space-y-2 text-xs sm:text-sm text-[#1c1c19] border-t border-dashed border-[#ebe8e3] pt-3">
                    {ticket.items.map((it, idx) => (
                      <li key={idx} className="flex items-start text-[#524344]">
                        <span className="font-bold mr-2 w-5 font-mono">{it.quantity}×</span>
                        <span className="line-through">{it.name}</span>
                        <span className="ml-2 text-emerald-700 text-xs font-bold">✓ Diplating</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#f6f3ee] px-5 py-3 border-t border-[#ebe8e3]">
                  <div className="flex items-center justify-between text-xs text-[#524344] mb-3 font-medium">
                    <span>Waiter: {ticket.waiterName}</span>
                    <span>{ticket.totalItems} items</span>
                  </div>
                  <button
                    onClick={() => handleAdvance(ticket)}
                    className="w-full bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-600 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-colors active:scale-[0.99]"
                  >
                    <span className="material-symbols-outlined text-[16px] text-emerald-700">
                      check
                    </span>
                    <span>Mark as served</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Stream Cards (shown on small screens) */}
      <div className="lg:hidden space-y-4">
        {visibleTickets.map((ticket) => (
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
                <h3 className="text-xl font-serif font-bold text-[#1c1c19]">
                  {ticket.tableNumber}
                </h3>
                <span className="text-xs text-[#524344]">
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
                <div key={idx} className="flex justify-between">
                  <span>
                    <strong>{it.quantity}x</strong> {it.name}
                  </span>
                  {it.notes && <span className="text-[#994703] font-medium">{it.notes}</span>}
                </div>
              ))}
            </div>

            <button
              onClick={() => handleAdvance(ticket)}
              className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all ${
                ticket.status === 'ready'
                  ? 'bg-white border border-emerald-600 text-emerald-800'
                  : 'bg-[#3d1018] text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {ticket.status === 'new'
                  ? 'local_fire_department'
                  : ticket.status === 'preparing'
                  ? 'notifications_active'
                  : 'check'}
              </span>
              <span>
                {ticket.status === 'new'
                  ? 'Mulai Masak'
                  : ticket.status === 'preparing'
                  ? 'Tandai Siap Saji'
                  : 'Selesai Diantar Pelayan'}
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
