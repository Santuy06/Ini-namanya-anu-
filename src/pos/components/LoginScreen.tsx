import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const LoginScreen: React.FC = () => {
  const { login, showToast } = useApp();
  const DEMO: Record<UserRole, string> = { kasir: 'kasir@rawongusti.test', admin: 'admin@rawongusti.test', kitchen: 'dapur@rawongusti.test' };
  const [selectedRole, setSelectedRole] = useState<UserRole>('kasir');
  const [email, setEmail] = useState(DEMO.kasir);
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [busy, setBusy] = useState(false);

  // Tab peran hanya mengisi akun demo; peran sebenarnya ditentukan oleh akun di database.
  const pickRole = (r: UserRole) => {
    setSelectedRole(r);
    if (Object.values(DEMO).includes(email) || !email) setEmail(DEMO[r]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setErrorMsg('Email dan kata sandi wajib diisi.'); return; }
    setBusy(true);
    const err = await login(email, password);
    setBusy(false);
    setErrorMsg(err ?? '');
  };

  return (
    <div className="min-h-screen w-full bg-[#fcf9f4] flex flex-col justify-between items-center px-4 py-8 relative selection:bg-[#58252c] selection:text-white">
      {/* Brand Header */}
      <div className="flex flex-col items-center mt-4">
        {/* Logo Monogram */}
        <div className="w-16 h-16 rounded-2xl bg-[#3d1018] flex items-center justify-center p-2 shadow-md">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4jDTg2zGsW66D3mPi0LCCgkEKAz6A3C_LyMjRjF33cCX-hxn-FMKJ-VmnANEDzHK36CnYdj065-0rxRIyAzaBK6gX8QPIzL_SZbagw1SD7hPd2ZxzJIZ6yhPlB0wT0wYg5V1QYZIndg6LMBj-RspFW4GjCZKuvGWpMCQZZXFIpvETPHdcZZBqLKJziB4JXaXmcwodTl3uHGVnuzTEmOl9Fam2CBCupu5HozhgUINKbYrxNyF4ccQ9FOYEpUIXWooGFlE"
            alt="Logo Rawon Gusti"
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#3d1018] mt-4 tracking-tight">
          Rawon Gusti
        </h1>
        <p className="font-serif italic text-sm text-[#847374] mt-0.5">
          Rasa asli, sepenuh hati.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-[420px] bg-white rounded-3xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(43,35,37,0.06)] border border-[#ebe8e3] my-6">
        <div className="text-center mb-6">
          <h2 className="font-serif text-2xl font-bold text-[#1c1c19]">
            Masuk Akun Staf
          </h2>
          <p className="text-xs text-[#524344] mt-1 max-w-xs mx-auto">
            Pilih peran atau masukkan kredensial untuk memulai shift
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-[#f0ede9] p-1 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => pickRole('kasir')}
            className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              selectedRole === 'kasir'
                ? 'bg-[#3d1018] text-white shadow-sm'
                : 'text-[#524344] hover:text-[#1c1c19]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
            <span>Kasir</span>
          </button>
          <button
            type="button"
            onClick={() => pickRole('admin')}
            className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              selectedRole === 'admin'
                ? 'bg-[#3d1018] text-white shadow-sm'
                : 'text-[#524344] hover:text-[#1c1c19]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">storefront</span>
            <span className="truncate">Admin Outlet</span>
          </button>
          <button
            type="button"
            onClick={() => pickRole('kitchen')}
            className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              selectedRole === 'kitchen'
                ? 'bg-[#3d1018] text-white shadow-sm'
                : 'text-[#524344] hover:text-[#1c1c19]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">soup_kitchen</span>
            <span>Kitchen</span>
          </button>
        </div>

        {/* Error Notice */}
        {errorMsg && (
          <div className="bg-[#ffdad6] border border-[#ba1a1a]/20 text-[#93000a] rounded-xl p-3 mb-4 flex items-start gap-2.5 text-xs">
            <span className="material-symbols-outlined text-[18px] text-[#ba1a1a] shrink-0 mt-0.5">
              error
            </span>
            <div className="flex-1">
              <span className="font-bold block">{errorMsg}</span>
              <span className="opacity-90">Periksa kembali data Anda, atau minta admin untuk reset akun.</span>
            </div>
            <button
              onClick={() => setErrorMsg('')}
              className="text-[#93000a] hover:opacity-80"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#524344] mb-1">
              Email atau ID Pengguna
            </label>
            <div className="relative flex items-center bg-[#f0ede9] rounded-xl px-3.5 h-11 border border-transparent focus-within:border-[#3d1018] transition-colors">
              <span className="material-symbols-outlined text-[#847374] text-[18px] mr-2">
                badge
              </span>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@rawongusti.com"
                className="w-full bg-transparent text-sm text-[#1c1c19] placeholder:text-[#847374] outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#524344]">
                Kata Sandi
              </label>
              <button
                type="button"
                onClick={() => showToast('Hubungi admin outlet untuk reset kata sandi', 'info')}
                className="text-xs text-[#994703] font-semibold hover:underline"
              >
                Lupa kata sandi?
              </button>
            </div>
            <div className="relative flex items-center bg-[#f0ede9] rounded-xl px-3.5 h-11 border border-transparent focus-within:border-[#3d1018] transition-colors">
              <span className="material-symbols-outlined text-[#847374] text-[18px] mr-2">
                lock
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-sm text-[#1c1c19] placeholder:text-[#847374] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#847374] hover:text-[#1c1c19] ml-1"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-[#524344]">
              <input
                type="checkbox"
                checked={rememberSession}
                onChange={(e) => setRememberSession(e.target.checked)}
                className="w-4 h-4 rounded text-[#3d1018] accent-[#3d1018] cursor-pointer"
              />
              <span>Ingat sesi POS ini</span>
            </label>
            <span className="text-[#994703] font-semibold">Akun demo: password123</span>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full h-12 disabled:opacity-60 rounded-xl bg-[#3d1018] hover:bg-[#58252c] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] mt-2"
          >
            <span className="material-symbols-outlined text-[18px]">login</span>
            <span>{busy ? 'Memproses…' : 'Masuk Sistem'}</span>
          </button>
        </form>

      </div>

      {/* Footer Info */}
      <div className="flex flex-col items-center gap-1.5 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0ede9] text-xs text-[#524344]">
          <span className="w-2 h-2 rounded-full bg-[#994703] animate-pulse"></span>
          <span>Shift Siang • Surabaya • v2.4.0 Online</span>
        </div>
        <p className="text-[11px] text-[#847374]">
          Perlu bantuan teknis? Hubungi IT Support Internal: +62 811-3450-RAWON
        </p>
      </div>

    </div>
  );
};
