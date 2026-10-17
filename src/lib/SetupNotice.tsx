// Ditampilkan bila .env belum diisi, supaya tidak berakhir sebagai layar kosong.
export const SetupNotice = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#fcf9f4', fontFamily: 'system-ui, sans-serif' }}>
    <div style={{ maxWidth: 460, background: '#fff', border: '1px solid #ebe8e3', borderRadius: 20, padding: 28, color: '#1c1c19' }}>
      <h1 style={{ margin: 0, fontSize: 22, color: '#3d1018' }}>Supabase belum dikonfigurasi</h1>
      <p style={{ fontSize: 14, lineHeight: 1.6, color: '#524344' }}>
        Salin <code>.env.example</code> menjadi <code>.env</code>, isi <code>VITE_SUPABASE_URL</code> dan{' '}
        <code>VITE_SUPABASE_ANON_KEY</code> dari Project Settings → API, lalu jalankan ulang <code>npm run dev</code>.
      </p>
      <p style={{ fontSize: 13, color: '#847374' }}>Pastikan <code>supabase/schema.sql</code>, <code>seed.sql</code>, lalu <code>seed_demo.sql</code> sudah dijalankan di SQL Editor.</p>
    </div>
  </div>
);
