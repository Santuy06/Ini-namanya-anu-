import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** false bila .env belum diisi -> UI menampilkan petunjuk setup, bukan error blank. */
export const supabaseConfigured = Boolean(url && key);

export const supabase = createClient(url || 'http://localhost:54321', key || 'missing-key', {
  auth: { persistSession: true, autoRefreshToken: true },
});

/** Alamat dasar untuk URL QR meja. Isi VITE_APP_URL dengan IP LAN agar bisa dipindai HP. */
export const appBaseUrl = () => ((import.meta.env.VITE_APP_URL as string) || window.location.origin).replace(/\/$/, '');
export const tableUrl = (qrToken: string) => `${appBaseUrl()}/pesan?meja=${encodeURIComponent(qrToken)}`;
