import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { StaffUser, UserRole } from '../types';
import { supabase } from '../../lib/supabase';

export const StaffManagementView: React.FC = () => {
  const { showToast, currentUser } = useApp();
  type Row = StaffUser & { active: boolean };
  const [staffList, setStaffList] = useState<Row[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const ROLE: Record<string, UserRole> = { admin: 'admin', staff: 'kasir', kitchen: 'kitchen' };
  const loadStaff = useCallback(async () => {
    const { data, error } = await supabase.from('profiles').select('*').in('role', ['admin', 'staff', 'kitchen']).order('created_at');
    if (error) { showToast(error.message, 'warning'); return; }
    setStaffList((data ?? []).map((p: any) => ({
      id: p.id, name: p.full_name, email: p.email || '-', role: ROLE[p.role], avatar: '', shift: p.shift || '-', terminal: p.terminal || '-', active: p.is_active })));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { loadStaff(); }, [loadStaff]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('kasir');

  const filtered = staffList.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.role.includes(search.toLowerCase())
  );

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || saving) return;
    setSaving(true);
    const { data, error } = await supabase.rpc('admin_create_staff', {
      p_email: newEmail, p_password: newPassword, p_name: newName, p_role: newRole === 'kasir' ? 'staff' : newRole,
    });
    setSaving(false);
    if (error || data?.error) { showToast(error?.message || data.error, 'warning'); return; }
    setShowAddModal(false);
    showToast(`Staf baru ${newName} berhasil ditambahkan!`, 'success');
    setNewName(''); setNewEmail(''); setNewPassword('');
    loadStaff();
  };

  const toggleActive = async (staf: Row) => {
    if (staf.id === currentUser.id) { showToast('Tidak bisa menonaktifkan akun sendiri', 'warning'); return; }
    const { error } = await supabase.from('profiles').update({ is_active: !staf.active, updated_at: new Date().toISOString() }).eq('id', staf.id);
    if (error) { showToast(error.message, 'warning'); return; }
    showToast(`${staf.name} ${staf.active ? 'dinonaktifkan' : 'diaktifkan kembali'}`, 'info');
    loadStaff();
  };

  return (
    <div className="flex flex-col w-full p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1540px] mx-auto pb-28 md:pb-8">
      {/* Breadcrumb & Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#524344] mb-1">
            <span>Operasional</span>
            <span className="text-[#d7c2c2]">›</span>
            <span className="font-bold text-[#1c1c19]">Admin</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1c1c19] tracking-tight">
            Akun Staf &amp; Hak Akses
          </h1>
          <p className="text-xs sm:text-sm text-[#524344] mt-0.5">
            Kelola profil pengguna, shift operasional, dan peran staf kasir &amp; dapur.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#58252c] text-white hover:bg-[#3d1018] text-xs font-bold shadow-sm transition-all active:scale-95 self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>Tambah Akun Staf</span>
        </button>
      </div>

      {/* Role Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#ebe8e3] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#847374]">Kasir &amp; Waiter</span>
            <div className="font-serif text-2xl font-bold text-[#3d1018] mt-1">{staffList.filter((x) => x.role === 'kasir' && x.active).length} Staf</div>
            <p className="text-xs text-[#524344] mt-0.5">Akses POS &amp; penagihan</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#ffdadc] text-[#3d1018] flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">point_of_sale</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#ebe8e3] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#847374]">Dapur &amp; KDS</span>
            <div className="font-serif text-2xl font-bold text-[#994703] mt-1">{staffList.filter((x) => x.role === 'kitchen' && x.active).length} Staf</div>
            <p className="text-xs text-[#524344] mt-0.5">Akses antrean tiket dapur</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#ffdbc9] text-[#753400] flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">soup_kitchen</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#ebe8e3] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#847374]">Admin Outlet</span>
            <div className="font-serif text-2xl font-bold text-[#1c1c19] mt-1">{staffList.filter((x) => x.role === 'admin' && x.active).length} Staf</div>
            <p className="text-xs text-[#524344] mt-0.5">Akses penuh laporan &amp; menu</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#f0ede9] text-[#1c1c19] flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-[#ebe8e3] shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#ebe8e3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#847374] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama staf atau email..."
              className="w-full pl-10 pr-4 py-2 bg-[#f6f3ee] rounded-xl text-xs sm:text-sm text-[#1c1c19] outline-none border border-[#ebe8e3] focus:border-[#3d1018]"
            />
          </div>
          <span className="text-xs text-[#524344]">
            Total {filtered.length} staf terdaftar
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f6f3ee] text-[#847374] uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Nama Staf</th>
                <th className="py-3 px-4">Email / ID</th>
                <th className="py-3 px-4">Peran (Role)</th>
                <th className="py-3 px-4">Shift Aktif</th>
                <th className="py-3 px-4">Terminal</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebe8e3]">
              {filtered.map((staf) => (
                <tr key={staf.id} className={`hover:bg-[#f6f3ee] transition-colors ${staf.active ? '' : 'opacity-50'}`}>
                  <td className="py-3 px-4 font-bold text-[#1c1c19] flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#f0ede9] text-[#3d1018] flex items-center justify-center font-bold text-xs">
                      {staf.name.charAt(0)}
                    </div>
                    <span>{staf.name}</span>
                  </td>
                  <td className="py-3 px-4 text-[#524344] font-mono">{staf.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        staf.role === 'admin'
                          ? 'bg-[#f0ede9] text-[#1c1c19]'
                          : staf.role === 'kitchen'
                          ? 'bg-[#ffdbc9] text-[#753400]'
                          : 'bg-[#ffdadc] text-[#3d1018]'
                      }`}
                    >
                      {staf.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#524344]">{staf.shift}</td>
                  <td className="py-3 px-4 text-[#524344] font-semibold">{staf.terminal}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => toggleActive(staf)}
                      className="text-[#3d1018] font-bold hover:underline"
                    >
                      {staf.active ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddStaff}
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-[#ebe8e3] pb-2">
              <span className="font-serif text-lg font-bold text-[#3d1018]">
                Tambah Akun Staf
              </span>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-[#f0ede9] flex items-center justify-center text-[#524344]"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#1c1c19] block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Rian Pratama"
                  className="w-full h-11 px-3 bg-[#f6f3ee] rounded-xl outline-none border border-[#ebe8e3] focus:border-[#3d1018]"
                />
              </div>

              <div>
                <label className="font-bold text-[#1c1c19] block mb-1">Email / ID</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="rian@rawongusti.com"
                  className="w-full h-11 px-3 bg-[#f6f3ee] rounded-xl outline-none border border-[#ebe8e3] focus:border-[#3d1018]"
                />
              </div>

              <div>
                <label className="font-bold text-[#1c1c19] block mb-1">Kata Sandi Awal</label>
                <input
                  type="text"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full h-11 px-3 bg-[#f6f3ee] rounded-xl outline-none border border-[#ebe8e3] focus:border-[#3d1018]"
                />
              </div>

              <div>
                <label className="font-bold text-[#1c1c19] block mb-1">Peran (Role)</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full h-11 px-3 bg-[#f6f3ee] rounded-xl outline-none border border-[#ebe8e3] focus:border-[#3d1018]"
                >
                  <option value="kasir">Kasir</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="admin">Admin Outlet</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 h-11 rounded-xl bg-[#f0ede9] text-[#1c1c19] text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 h-11 rounded-xl bg-[#3d1018] text-white text-xs font-bold shadow-sm"
              >
                {saving ? 'Menyimpan…' : 'Simpan Staf'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
