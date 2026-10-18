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
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch {
      /* AudioContext fallback */
    }
  };

  const handleAdvance = (ticket: KitchenTicket) => {
    playKitchenChime();
    advanceTicketStatus(ticket.id);
    if (ticket.status === 'new') {
      showToast(`${ticket.tableNumber} mulai dimasak di dapur`, 'info');
    } else if (ticket.status === 'preparing') {
      showToast(`${ticket.tableNumber} SIAP DISAJIKAN! Waiter segera mengantar`, 'success');
    } else if (ticket.status === 'ready') {
      showToast(`${ticket.tableNumber} selesai diantar ke meja tamu`, 'success');
    }
  };

  const formatTimer = (seconds: number) => {
    if (seconds >= 3600) {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      return `${hours}j ${String(mins).padStart(2, '0')}m`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const stationTickets = kitchenTickets.filter((t) =>
    selectedStation === 'All stations' ? true : t.station === selectedStation
  );

  const newTickets      = stationTickets.filter((t) => t.status === 'new');
  const preparingTickets = stationTickets.filter((t) => t.status === 'preparing');
  const readyTickets    = stationTickets.filter((t) => t.status === 'ready');

  const visibleTickets =
    activeLaneFilter === 'all'      ? stationTickets.filter((t) => t.status !== 'served') :
    activeLaneFilter === 'new'      ? newTickets :
    activeLaneFilter === 'preparing'? preparingTickets : readyTickets;

  /* ── Warna kolom sesuai palet app ─────────────────────────────────────────
     NEW      → amber/kuning (menunggu)   : border-[#f59e0b]  bg-[#fffbeb]
     PREPARING → oranye/sekunder          : border-[#994703]  bg-[#fff7f0]
     READY    → hijau sage (tenang, sesuai palet beige) : border-[#4a7c59] bg-[#f0f7f3]
  ─────────────────────────────────────────────────────────────────────────── */
  const COL = {
    new:  { dot:'#f59e0b', badge:'bg-[#fef3c7] text-[#92400e] border-[#fcd34d]', border:'border-[#fcd34d]', tag:'bg-[#fef3c7] text-[#92400e] border-[#fde68a]', btn:'bg-[#92400e] hover:bg-[#78350f]', num:'bg-[#fef3c7] text-[#92400e]', label:'Menunggu dimasak' },
    prep: { dot:'#994703', badge:'bg-[#fff0e6] text-[#7a3200] border-[#fca96c]', border:'border-[#fc934f]', tag:'bg-[#fff0e6] text-[#7a3200] border-[#fca96c]', btn:'bg-[#994703] hover:bg-[#7a3200]', num:'bg-[#fff0e6] text-[#7a3200]', label:'Proses dapur' },
    ready:{ dot:'#4a7c59', badge:'bg-[#eaf3ee] text-[#2d5a3d] border-[#a7c9b4]', border:'border-[#6aab82]', tag:'bg-[#eaf3ee] text-[#2d5a3d] border-[#a7c9b4]', btn:'bg-[#2d5a3d] hover:bg-[#1e3d29]', num:'bg-[#eaf3ee] text-[#2d5a3d]', label:'Menunggu diantar waiter' },
  };

  /* ── Shared TicketCard ────────────────────────────────────────────────── */
  const TicketCard = ({ ticket, col }: { ticket: KitchenTicket; col: typeof COL.new }) => (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col transition-shadow hover:shadow-md ${
      ticket.isPriority ? 'border-red-500 ring-2 ring-red-300/50' : col.border
    }`}>
      {ticket.isPriority && (
        <div className="bg-[#ba1a1a] text-white text-[11px] font-bold px-4 py-1 flex items-center justify-between uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">warning</span>
            Lewat 15 menit • Prioritaskan
          </span>
          <span className="bg-white/25 px-2 py-0.5 rounded text-[10px]">URGENT</span>
        </div>
      )}

      <div className="p-4 sm:p-5 flex-1">
        {/* Header: nama meja + timer */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#1c1c19] tracking-tight leading-none">
              {ticket.tableNumber}
            </h3>
            <p className="text-xs text-[#524344] mt-1">
              {ticket.ticketNumber} &bull; {ticket.type}
            </p>
          </div>
          <div className="text-right shrink-0 ml-2">
            <span className={`inline-block font-mono font-bold text-xs px-2.5 py-1 rounded-lg border ${
              ticket.isPriority ? 'bg-[#ba1a1a] text-white border-transparent' : col.badge
            }`}>
              {formatTimer(ticket.elapsedSeconds)}
            </span>
            <p className="text-[10px] text-[#847374] mt-0.5">
              {ticket.status === 'ready' ? 'sejak siap' : 'sejak pesan'}
            </p>
          </div>
        </div>

        {/* Notes banner */}
        {ticket.notesBanner && (
          <div className="bg-[#fef3c7] border border-[#fde68a] rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs font-medium text-[#78350f] mb-3">
            <span className="material-symbols-outlined text-[15px] text-[#92400e] shrink-0">info</span>
            <span className="truncate">{ticket.notesBanner}</span>
          </div>
        )}

        {/* Item list */}
        <ul className="space-y-1.5 border-t border-dashed border-[#ebe8e3] pt-3">
          {ticket.items.map((it, idx) => (
            <li key={idx} className="flex items-center justify-between gap-2 py-0.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`shrink-0 font-mono font-bold text-[11px] px-1.5 py-0.5 rounded ${col.num}`}>
                  {it.quantity}×
                </span>
                <span className="font-semibold text-[#1c1c19] text-sm truncate">{it.name}</span>
              </div>
              {ticket.status === 'ready' ? (
                <span className="shrink-0 text-[11px] font-bold text-[#2d5a3d] bg-[#eaf3ee] px-2 py-0.5 rounded-full border border-[#a7c9b4] flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[12px]">done</span> Siap
                </span>
              ) : it.notes ? (
                <span className="shrink-0 text-[11px] font-medium text-[#7a3200] bg-[#fff0e6] px-2 py-0.5 rounded border border-[#fca96c] max-w-[120px] truncate">
                  {it.notes}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="bg-[#f6f3ee] px-4 sm:px-5 py-3 border-t border-[#ebe8e3]">
        <div className="flex items-center justify-between text-xs text-[#524344] mb-2.5 font-medium">
          <span className="truncate mr-2">Pelayan: {ticket.waiterName}</span>
          <span className="font-bold text-[#1c1c19] shrink-0">{ticket.totalItems} menu</span>
        </div>
        <button
          onClick={() => handleAdvance(ticket)}
          className={`w-full text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer ${col.btn}`}
        >
          <span className="material-symbols-outlined text-[15px]">
            {ticket.status === 'new' ? 'skillet' : ticket.status === 'preparing' ? 'notifications_active' : 'check_circle'}
          </span>
          <span>
            {ticket.status === 'new' ? 'Mulai Masak' : ticket.status === 'preparing' ? 'Selesai Masak (Siap Antar)' : 'Tandai Sudah Disajikan'}
          </span>
        </button>
      </div>
    </div>
  );

  /* ── Empty state ──────────────────────────────────────────────────────── */
  const EmptyState = ({ icon, title, sub }: { icon: string; title: string; sub: string }) => (
    <div className="rounded-2xl border-2 border-dashed border-[#e6e2db] p-8 text-center bg-white/50 flex flex-col items-center justify-center min-h-[200px]">
      <span className="material-symbols-outlined text-[38px] text-[#c4b5b4] mb-2">{icon}</span>
      <p className="font-bold text-sm text-[#524344]">{title}</p>
      <p className="text-xs text-[#847374] mt-1">{sub}</p>
    </div>
  );

  /* ── Column header ────────────────────────────────────────────────────── */
  const ColHeader = ({ label, count, note, dot }: { label: string; count: number; note: string; dot: string }) => (
    <div className="flex items-center justify-between pb-2 px-0.5 border-b border-[#ebe8e3] mb-4">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dot }}></span>
        <h2 className="text-sm font-extrabold text-[#1c1c19] tracking-tight">{label}</h2>
        <span className="w-5 h-5 rounded-full bg-[#f0ede9] text-[#524344] text-[11px] font-bold flex items-center justify-center border border-[#e0dcd8]">
          {count}
        </span>
      </div>
      <span className="text-[11px] text-[#847374] font-medium">{note}</span>
    </div>
  );

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#fcf9f4] text-[#1c1c19] pb-28 md:pb-12 max-w-[1720px] mx-auto px-4 sm:px-8 pt-4">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <section className="flex flex-col md:flex-row md:items-end justify-between mb-5 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4a7c59] animate-pulse"></span>
            <p className="text-[11px] uppercase font-extrabold tracking-widest text-[#994703]">
              Kitchen Display System (KDS)
            </p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1c19] tracking-tight mb-0.5">
            Pantauan Antrean Dapur &amp; Bar
          </h1>
          <p className="text-xs text-[#6b584d] flex items-center gap-2">
            <span className="font-semibold text-[#1c1c19]">{stationTickets.length} tiket aktif</span>
            <span className="text-[#c4b5b4]">•</span>
            <span>{stationTickets.reduce((a, t) => a + t.totalItems, 0)} item pesanan</span>
            <span className="text-[#c4b5b4]">•</span>
            <span>Rawon Gusti</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => { setSoundEnabled(!soundEnabled); showToast(`Suara KDS: ${!soundEnabled ? 'Aktif' : 'Mati'}`); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
              soundEnabled ? 'bg-white border-[#ebe8e3] text-[#1c1c19] hover:bg-[#f6f3ee]' : 'bg-[#f0ede9] border-[#ebe8e3] text-[#847374]'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">{soundEnabled ? 'volume_up' : 'volume_off'}</span>
            <span>{soundEnabled ? 'Suara Aktif' : 'Senyap'}</span>
          </button>

          <div className="relative">
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="appearance-none bg-white border border-[#ebe8e3] rounded-xl px-3.5 py-2 pr-8 text-xs font-semibold text-[#1c1c19] cursor-pointer outline-none hover:bg-[#f6f3ee] transition-colors"
            >
              <option value="All stations">Semua Stasiun</option>
              <option value="Stasiun Rawon & Dapur Panas">Stasiun Rawon &amp; Dapur Panas</option>
              <option value="Bar Minuman">Bar Minuman</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#847374] text-[15px] pointer-events-none">expand_more</span>
          </div>
        </div>
      </section>



      {/* ── Mobile tab filter ─────────────────────────────────────────────── */}
      <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-3">
        {[
          { key: 'all', label: `Semua (${stationTickets.length})` },
          { key: 'new', label: `Baru (${newTickets.length})` },
          { key: 'preparing', label: `Dimasak (${preparingTickets.length})` },
          { key: 'ready', label: `Siap Antar (${readyTickets.length})` },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveLaneFilter(f.key as any)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer ${
              activeLaneFilter === f.key
                ? 'bg-[#3d1018] text-white'
                : 'bg-white text-[#524344] border border-[#ebe8e3]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Desktop 3-column Kanban ────────────────────────────────────────── */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-5 items-start">
        {/* Column 1 — NEW */}
        <div>
          <ColHeader label="Pesanan Baru" count={newTickets.length} note={COL.new.label} dot={COL.new.dot} />
          <div className="space-y-4">
            {newTickets.length === 0
              ? <EmptyState icon="check_circle_outline" title="Tidak ada antrean baru" sub="Semua pesanan sudah masuk proses masak" />
              : newTickets.map((t) => <TicketCard key={t.id} ticket={t} col={COL.new} />)
            }
          </div>
        </div>

        {/* Column 2 — PREPARING */}
        <div>
          <ColHeader label="Sedang Dimasak" count={preparingTickets.length} note={COL.prep.label} dot={COL.prep.dot} />
          <div className="space-y-4">
            {preparingTickets.length === 0
              ? <EmptyState icon="skillet" title="Dapur sedang luang" sub="Tidak ada menu yang sedang dimasak" />
              : preparingTickets.map((t) => <TicketCard key={t.id} ticket={t} col={COL.prep} />)
            }
          </div>
        </div>

        {/* Column 3 — READY */}
        <div>
          <ColHeader label="Siap Diantar" count={readyTickets.length} note={COL.ready.label} dot={COL.ready.dot} />
          <div className="space-y-4">
            {readyTickets.length === 0
              ? <EmptyState icon="room_service" title="Semua hidangan terantar" sub="Tidak ada pesanan menunggu diantar waiter" />
              : readyTickets.map((t) => <TicketCard key={t.id} ticket={t} col={COL.ready} />)
            }
          </div>
        </div>
      </div>

      {/* ── Mobile stream ─────────────────────────────────────────────────── */}
      <div className="lg:hidden space-y-4">
        {visibleTickets.length === 0 ? (
          <EmptyState icon="check_circle_outline" title="Tidak ada pesanan" sub="Tidak ada pesanan di kategori ini" />
        ) : (
          visibleTickets.map((ticket) => {
            const col = ticket.status === 'new' ? COL.new : ticket.status === 'preparing' ? COL.prep : COL.ready;
            return <TicketCard key={ticket.id} ticket={ticket} col={col} />;
          })
        )}
      </div>
    </div>
  );
};
