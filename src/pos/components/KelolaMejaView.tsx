import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TableItem, TableStatus } from '../types';

const KelolaMejaViewInner: React.FC = () => {
  const { tables, updateTable, addTable, openQrModal, showToast } = useApp();

  const [filterMode, setFilterMode] = useState<'Semua' | 'Terisi' | 'Kosong'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Add table modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTableNum, setNewTableNum] = useState('');
  const [newTableCap, setNewTableCap] = useState('4');
  const [newTableArea, setNewTableArea] = useState('Ruang utama');

  // Edit panel state — null = panel tertutup
  const [editingTable, setEditingTable] = useState<TableItem | null>(null);

  // Edit form fields
  const [editNumber, setEditNumber] = useState('');
  const [editCapacity, setEditCapacity] = useState('');
  const [editArea, setEditArea] = useState('Ruang utama');
  const [editStatus, setEditStatus] = useState<TableStatus>('kosong');

  const openEditPanel = (tbl: TableItem) => {
    setEditingTable(tbl);
    setEditNumber(tbl.number);
    setEditCapacity(tbl.capacity.toString());
    setEditArea(tbl.area || 'Ruang utama');
    setEditStatus(tbl.status);
  };

  const closeEditPanel = () => setEditingTable(null);

  const handleSaveTable = () => {
    if (!editingTable) return;
    const updated: TableItem = {
      ...editingTable,
      number: editNumber,
      capacity: parseInt(editCapacity, 10) || editingTable.capacity,
      area: editArea,
      status: editStatus,
      statusLabel:
        editStatus === 'kosong'
          ? 'Kosong'
          : editStatus === 'checkout'
          ? 'Minta Checkout'
          : editStatus === 'diproses'
          ? 'Diproses'
          : 'Terisi'
    };
    updateTable(updated);
    showToast(`Meja ${updated.number} berhasil diperbarui`, 'success');
    closeEditPanel();
  };

  const handleCreateNewTable = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(newTableNum, 10);
    const cap = parseInt(newTableCap, 10);
    if (!num || num <= 0) {
      showToast('Masukkan nomor meja yang valid (angka positif)', 'warning');
      return;
    }
    if (tables.some((t) => parseInt(t.number, 10) === num)) {
      showToast(`Nomor meja ${num} sudah terdaftar`, 'warning');
      return;
    }
    const ok = await addTable(num, cap || 4, newTableArea);
    if (ok) {
      setShowAddModal(false);
      setNewTableNum('');
      setNewTableCap('4');
    }
  };

  const handlePrintAllQr = () => {
    showToast('Semua stiker QR Meja siap dikirim ke printer label.', 'success');
  };

  // Filtered tables
  const filtered = tables.filter((t) => {
    const matchSearch =
      t.number.includes(searchQuery) ||
      t.qrCodeId.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchSearch) return false;
    if (filterMode === 'Semua') return true;
    if (filterMode === 'Kosong') return t.status === 'kosong';
    if (filterMode === 'Terisi') return t.status !== 'kosong';
    return true;
  });

  const occupiedTables = tables.filter((t) => t.status !== 'kosong');
  const emptyTables = tables.filter((t) => t.status === 'kosong');

  return (
    <div className="flex flex-col w-full p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1540px] mx-auto pb-28 md:pb-8">
      {/* Page Header & Action */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#524344]">
            <span className="hover:text-[#1c1c19] cursor-pointer">Operasional</span>
            <span className="text-[#d7c2c2]">›</span>
            <span className="font-semibold text-[#1c1c19]">Admin</span>
            <span className="text-[#d7c2c2]">›</span>
            <span className="text-[#994703] font-bold">Kelola Meja &amp; QR</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#1c1c19] tracking-tight">
            Kelola meja
          </h1>
          <p className="text-xs sm:text-sm text-[#524344] max-w-2xl">
            Setiap meja punya QR unik. Nomor meja pelanggan ditetapkan otomatis saat dipindai.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#58252c] text-white hover:bg-[#3d1018] transition-all shadow-sm text-xs font-bold active:scale-95 self-start md:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Tambah meja</span>
        </button>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl shadow-sm border border-[#ebe8e3] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#524344]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#847374]">
              Total meja
            </span>
            <span className="material-symbols-outlined text-[#994703] text-[22px]">
              table_restaurant
            </span>
          </div>
          <div className="mt-3">
            <span className="font-serif text-3xl font-bold text-[#1c1c19] tabular-nums">
              {tables.length}
            </span>
            <p className="text-xs text-[#994703] font-semibold mt-0.5">
              Semua QR aktif &amp; terdaftar
            </p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl shadow-sm border border-[#ebe8e3] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#524344]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#847374]">Terisi</span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ffdbc9] text-[#753400] text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#994703]"></span>
              <span>{tables.length ? Math.round((occupiedTables.length / tables.length) * 100) : 0}%</span>
            </div>
          </div>
          <div className="mt-3">
            <span className="font-serif text-3xl font-bold text-[#994703] tabular-nums">
              {occupiedTables.length}
            </span>
            <p className="text-xs text-[#524344] mt-0.5 truncate">
              {occupiedTables.length > 0
                ? `Meja ${occupiedTables.map((t) => t.number).join(', ')}`
                : 'Semua meja kosong'}
            </p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl shadow-sm border border-[#ebe8e3] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#524344]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#847374]">Kosong</span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ebe8e3] text-[#524344] text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#847374]"></span>
              <span>{tables.length ? Math.round((emptyTables.length / tables.length) * 100) : 0}%</span>
            </div>
          </div>
          <div className="mt-3">
            <span className="font-serif text-3xl font-bold text-[#1c1c19] tabular-nums">
              {emptyTables.length}
            </span>
            <p className="text-xs text-[#524344] mt-0.5 truncate">
              {emptyTables.length > 0
                ? `Meja ${emptyTables.map((t) => t.number).join(', ')}`
                : 'Tidak ada meja kosong'}
            </p>
          </div>
        </div>
      </div>

      {/* Search & Quick Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xl">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#847374] text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nomor meja atau kode..."
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl text-xs sm:text-sm text-[#1c1c19] placeholder-[#847374] outline-none border border-[#ebe8e3] focus:border-[#3d1018] shadow-sm"
          />
        </div>

        <button
          onClick={handlePrintAllQr}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-[#f6f3ee] text-[#1c1c19] shadow-sm border border-[#ebe8e3] text-xs font-bold transition-all active:scale-95 shrink-0"
        >
          <span className="material-symbols-outlined text-[18px] text-[#994703]">print</span>
          <span>Cetak semua QR</span>
        </button>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2">
        {(['Semua', 'Terisi', 'Kosong'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setFilterMode(mode)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filterMode === mode
                ? 'bg-[#3d1018] text-white shadow-sm'
                : 'bg-white text-[#524344] border border-[#ebe8e3] hover:bg-[#f6f3ee]'
            }`}
          >
            {mode} (
            {mode === 'Semua'
              ? tables.length
              : mode === 'Terisi'
              ? occupiedTables.length
              : emptyTables.length}
            )
          </button>
        ))}
      </div>

      {/* Table Grid — full width, no always-open sidebar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((tbl) => {
          const isTerisi = tbl.status !== 'kosong';

          return (
            <div
              key={tbl.id}
              className="rounded-2xl p-4 shadow-sm transition-all flex flex-col justify-between gap-3.5 bg-white hover:shadow-md border border-[#ebe8e3]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-serif text-xl font-bold text-[#1c1c19]">
                      Meja {tbl.number}
                    </h3>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      isTerisi
                        ? 'bg-[#ffdbc9] text-[#753400]'
                        : 'bg-[#ebe8e3] text-[#524344]'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isTerisi ? 'bg-[#994703]' : 'bg-[#847374]'
                      }`}
                    ></span>
                    {isTerisi ? 'Terisi' : 'Kosong'}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  {/* SVG QR Code Icon Box */}
                  <div className="w-16 h-16 p-2 bg-[#f6f3ee] rounded-xl flex items-center justify-center shrink-0 border border-[#ebe8e3]">
                    <svg
                      className="w-full h-full text-[#3d1018]"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm-2 10h8v8H2v-8zm2 2v4h4v-4H4zm10-14h8v8h-8V2zm2 2v4h4V4h-4zm3 8h3v2h-3v-2zm-3 2h2v3h-2v-3zm5 2h2v4h-4v-2h2v-2zm-2 2v2h-3v-2h3zm-3-4h2v2h-2v-2zm-2 2h2v2h-2v-2z"></path>
                    </svg>
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-[#1c1c19] truncate">
                      {tbl.qrCodeId}
                    </span>
                    <span className="text-[11px] text-[#524344] font-mono truncate">
                      {tbl.area || 'Ruang utama'}
                    </span>
                    <span className="text-[11px] text-[#994703] font-semibold mt-0.5">
                      {isTerisi
                        ? `${tbl.guestCount || 3} Pelanggan • Sesi aktif`
                        : `Siap pakai • ${tbl.capacity} kursi`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#ebe8e3]">
                <button
                  type="button"
                  onClick={() => openQrModal(tbl)}
                  className="w-full py-2 px-2 rounded-xl bg-[#f6f3ee] hover:bg-[#ebe8e3] text-[#1c1c19] text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#994703]">
                    qr_code_2
                  </span>
                  <span>Detail QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => openEditPanel(tbl)}
                  className="w-full py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors bg-[#f6f3ee] hover:bg-[#ebe8e3] text-[#1c1c19]"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  <span>Edit Meja</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Panel — Modal Overlay (appears at bottom / slide-in sheet on mobile, centered on desktop) */}
      {editingTable && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={closeEditPanel}
          />

          {/* Panel */}
          <div className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] z-50 bg-white rounded-t-3xl md:rounded-2xl p-6 shadow-2xl border border-[#ebe8e3] space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Handle (mobile) */}
            <div className="w-10 h-1 bg-[#d7c2c2] rounded-full mx-auto mb-1 md:hidden"></div>

            <div className="flex items-center justify-between pb-3 border-b border-[#ebe8e3]">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#1c1c19]">
                  Edit Meja {editingTable.number}
                </h2>
                <p className="text-xs text-[#524344]">Konfigurasi tata letak &amp; kapasitas</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#994703]">tune</span>
                <button
                  type="button"
                  onClick={closeEditPanel}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#847374] hover:text-[#3d1018] hover:bg-[#f0ede9] transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Nomor Meja */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#1c1c19]">Nomor meja</label>
              <input
                type="text"
                value={editNumber}
                onChange={(e) => setEditNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#f6f3ee] rounded-xl text-sm font-bold text-[#1c1c19] outline-none border border-[#ebe8e3] focus:border-[#3d1018]"
              />
            </div>

            {/* Kapasitas */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#1c1c19]">Kapasitas</label>
              <div className="relative">
                <input
                  type="number"
                  value={editCapacity}
                  min={1}
                  max={20}
                  onChange={(e) => setEditCapacity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f6f3ee] rounded-xl text-xs font-medium text-[#1c1c19] outline-none border border-[#ebe8e3] focus:border-[#3d1018]"
                />
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#847374] text-[18px] pointer-events-none">
                  group
                </span>
              </div>
            </div>

            {/* Area */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#1c1c19]">Area</label>
              <div className="relative">
                <select
                  value={editArea}
                  onChange={(e) => setEditArea(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 bg-[#f6f3ee] rounded-xl text-xs text-[#1c1c19] outline-none border border-[#ebe8e3] focus:border-[#3d1018] cursor-pointer pr-10"
                >
                  <option value="Ruang utama">Ruang utama</option>
                  <option value="Lantai 2 - Lesehan">Lantai 2 - Lesehan</option>
                  <option value="VIP Pendopo">VIP Pendopo</option>
                  <option value="Outdoor Taman">Outdoor Taman</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#847374] text-[18px] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Status Meja */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#1c1c19]">Status meja</label>
              <div className="relative">
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as TableStatus)}
                  className="w-full appearance-none px-3.5 py-2.5 bg-[#f6f3ee] rounded-xl text-xs text-[#1c1c19] outline-none border border-[#ebe8e3] focus:border-[#3d1018] cursor-pointer pr-10"
                >
                  <option value="terisi">Terisi (Sedang Digunakan)</option>
                  <option value="kosong">Kosong (Tersedia)</option>
                  <option value="checkout">Minta Checkout</option>
                  <option value="diproses">Diproses Kitchen</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#847374] text-[18px] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Identitas QR */}
            <div className="pt-1 space-y-2">
              <label className="block text-xs font-bold text-[#1c1c19]">Identitas QR</label>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#ffdbc9] text-[#753400] text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-[#994703]"></span>
                <span>Aktif • {editingTable.qrCodeId}</span>
              </div>
              <p className="text-xs text-[#524344] leading-relaxed">
                Nomor meja terkunci pada perangkat pelanggan saat memindai. Gunakan QR meja yang sesuai fisik meja.
              </p>
            </div>

            {/* Info Warning */}
            <div className="p-3 rounded-xl bg-[#f6f3ee] border border-[#ebe8e3] flex items-start gap-2">
              <span className="material-symbols-outlined text-[#994703] text-[16px] shrink-0 mt-0.5">
                info
              </span>
              <p className="text-[11px] text-[#524344] leading-normal">
                Ubah nomor meja membutuhkan cetak ulang stiker QR fisik. Jangan mengganti nomor QR saat meja masih digunakan sesi transaksi aktif.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="pt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => openQrModal(editingTable)}
                className="py-2.5 px-4 rounded-xl bg-[#f6f3ee] hover:bg-[#ebe8e3] text-[#1c1c19] text-xs font-semibold transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px] text-[#994703]">print</span>
                <span>Cetak QR</span>
              </button>
              <button
                type="button"
                onClick={handleSaveTable}
                className="py-3 px-4 rounded-xl bg-[#3d1018] hover:bg-[#58252c] text-white text-xs font-bold transition-all shadow-sm active:scale-98 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">check</span>
                <span>Simpan</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal Tambah Meja Baru */}
      {showAddModal && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setShowAddModal(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[460px] z-50 bg-white rounded-t-3xl md:rounded-2xl p-6 shadow-2xl border border-[#ebe8e3] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#ebe8e3]">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#1c1c19]">
                  Tambah Meja Baru
                </h2>
                <p className="text-xs text-[#524344]">QR token otomatis dibuat oleh sistem</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#847374] hover:text-[#3d1018] hover:bg-[#f0ede9] transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateNewTable} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1c1c19]">Nomor meja (angka)</label>
                <input
                  type="number"
                  min={1}
                  required
                  placeholder="Misal: 11"
                  value={newTableNum}
                  onChange={(e) => setNewTableNum(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f6f3ee] rounded-xl text-sm font-bold text-[#1c1c19] outline-none border border-[#ebe8e3] focus:border-[#3d1018]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1c1c19]">Kapasitas kursi</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  required
                  value={newTableCap}
                  onChange={(e) => setNewTableCap(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f6f3ee] rounded-xl text-xs font-medium text-[#1c1c19] outline-none border border-[#ebe8e3] focus:border-[#3d1018]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1c1c19]">Area penempatan</label>
                <div className="relative">
                  <select
                    value={newTableArea}
                    onChange={(e) => setNewTableArea(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 bg-[#f6f3ee] rounded-xl text-xs text-[#1c1c19] outline-none border border-[#ebe8e3] focus:border-[#3d1018] cursor-pointer pr-10"
                  >
                    <option value="Ruang utama">Ruang utama</option>
                    <option value="Lantai 2 - Lesehan">Lantai 2 - Lesehan</option>
                    <option value="VIP Pendopo">VIP Pendopo</option>
                    <option value="Outdoor Taman">Outdoor Taman</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#847374] text-[18px] pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-[#f6f3ee] hover:bg-[#ebe8e3] text-[#1c1c19] text-xs font-semibold transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 rounded-xl bg-[#3d1018] hover:bg-[#58252c] text-white text-xs font-bold transition-all shadow-sm active:scale-98"
                >
                  Tambah Meja
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export const KelolaMejaView: React.FC = () => {
  const { tables } = useApp();
  if (!tables.length) return <div className="p-10 text-center text-sm text-[#524344]">Belum ada meja aktif. Jalankan supabase/seed.sql terlebih dahulu.</div>;
  return <KelolaMejaViewInner />;
};
