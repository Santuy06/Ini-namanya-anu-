# Rawon Gusti Surabaya — Sistem POS & Self-Ordering QR

Sistem Point-of-Sale (POS), Manajemen Restoran, dan Pemesanan Mandiri berbasis QR Meja untuk **Rawon Gusti Surabaya**. 

Aplikasi ini dibangun menggunakan arsitektur **Monorepo Modern**:
* **Frontend (`src/`)**: Single Page Application (SPA) berbasis **React 19**, **TypeScript (`.ts`/`.tsx`)**, **Vite**, dan **Tailwind CSS**.
* **Backend (`backend/`)**: Web API berbasis **Next.js App Router** murni menggunakan **JavaScript (`.js`)** dengan paradigma **Functional Programming (FP)** tanpa *Class / OOP*.
* **Database & Realtime (`supabase/`)**: **Supabase PostgreSQL** dengan kebijakan keamanan ketat (*Row Level Security / RLS*), *Stored Procedures (RPC)*, dan *Postgres Realtime Changes*.

---

## Daftar Isi
1. [Arsitektur & Infrastruktur Sistem](#1-arsitektur--infrastruktur-sistem)
2. [Fitur-Fitur Utama yang Telah Selesai](#2-fitur-fitur-utama-yang-telah-selesai)
3. [Arsitektur Backend Next.js Functional Programming (FP)](#3-arsitektur-backend-nextjs-functional-programming-fp)
4. [Mitigasi Keamanan & Pencegahan Celah Kebobolan](#4-mitigasi-keamanan--pencegahan-celah-kebobolan)
5. [Penyempurnaan UI/UX & Fleksibilitas Layar](#5-penyempurnaan-uiux--fleksibilitas-layar)
6. [Panduan Menjalankan Sistem (Lokal & Mobile)](#6-panduan-menjalankan-sistem-lokal--mobile)
7. [Akun Demo Bawaan](#7-akun-demo-bawaan)

---

## 1. Arsitektur & Infrastruktur Sistem

```text
Fokus/ (Root Project Monorepo)
├── src/                          # FRONTEND: React 19 + TypeScript (.tsx / .ts)
│   ├── customer/                 # Self-ordering Pelanggan (Mobile-First Web App)
│   │   ├── components/           # Katalog menu, detail kustomisasi, keranjang, status pesanan
│   │   ├── context/AppContext.tsx# State manajemen pelanggan, cooldown timer, URL masking
│   │   └── data/                 # Fallback menu & opsi kustomisasi khas Jawa Timur
│   ├── pos/                      # Aplikasi Operasional Kasir, Dapur (KDS), & Admin Outlet
│   │   ├── components/           # Meja, Pesanan, Checkout, KDS, Dashboard, Menu, Meja, Staf, Laporan
│   │   ├── context/AppContext.tsx# State POS, sinkronisasi realtime, audio chime, RBAC
│   │   └── types/                # Kontrak tipe data TypeScript sistem POS
│   ├── lib/                      # Utilitas domain, kalkulasi tagihan murni, & adapter Supabase
│   └── main.tsx                  # Root entry point Vite
│
├── backend/                      # BACKEND: Next.js App Router murni JavaScript (.js) FP
│   ├── package.json              # Runtime Next.js (port 3001)
│   ├── next.config.js            # Konfigurasi Next.js
│   ├── jsconfig.json             # Path alias (@/*)
│   ├── lib/
│   │   ├── supabase.js           # Client Supabase factory
│   │   ├── fp/
│   │   │   └── result.js         # Result Monad (ok, err, match, pipe, map, flatMap)
│   │   ├── domain/
│   │   │   ├── billing.js        # Fungsi tagihan deterministik (Layanan 5%, PB1 10%, Kembalian)
│   │   │   └── orderStateMachine.js # Transisi status pesanan (finite state machine)
│   │   └── services/
│   │       ├── orderService.js   # Pipeline fungsional pemesanan QR & verifikasi stok
│   │       ├── paymentService.js # Pipeline fungsional pelunasan pembayaran kasir
│   │       └── reportService.js  # Pipeline analitik & agregasi data keuangan
│   └── app/
│       ├── page.js               # Health check endpoint
│       └── api/
│           ├── menu/route.js        # GET /api/menu
│           ├── tables/route.js      # GET /api/tables
│           ├── orders/route.js      # POST /api/orders
│           ├── orders/[id]/route.js # PATCH /api/orders/[id]
│           ├── checkout/pay/route.js# POST /api/checkout/pay
│           └── reports/route.js     # GET /api/reports
│
├── supabase/                     # INFRASTRUKTUR BASIS DATA POSTGRESQL
│   ├── schema.sql                # Skema tabel, indeks, RLS policy, fungsi RPC aman
│   ├── seed.sql                  # Data awal menu autentik Rawon Gusti & daftar meja
│   └── seed_demo.sql             # Akun staf demo (kasir, admin, dapur) & sampel transaksi
│
├── vite.config.ts                # Konfigurasi Vite (Host 0.0.0.0, Port 3000, Tailwind CSS v4)
├── package.json                  # Dependencies root project
└── .env                          # Kredensial Supabase & URL jaringan
```

---

## 2. Fitur-Fitur Utama yang Telah Selesai

### A. Aplikasi Pemesanan Mandiri QR Meja (Customer App)
1. **Katalog Menu & Kustomisasi Rasa Jawa Timur**:
   - Pemilihan varian kuah (kuah campur / kuah pisah), level kepedasan sambal terasi, pilihan sayur kecambah (lengkap / pisah), serta ekstra toping (telur asin, tempe mendol, empal suwir, sambal).
2. **Kalkulator Tagihan Transparan**:
   - Perhitungan otomatis subtotal pesanan, biaya layanan (*service charge*) 5%, dan Pajak Restoran (PB1) 10%.
3. **Fitur Panggil Pelayan & Minta Tagihan dengan Cooldown Timer**:
   - Pelanggan dapat memanggil pelayan atau meminta struk langsung dari meja.
   - Dilengkapi **timer pendingin (*cooldown*) 60 detik** untuk mencegah spam penekanan tombol.
4. **Proteksi Anti-Pesan dari Rumah (URL Masking)**:
   - Begitu QR dipindai dan dibuka di browser ponsel, sistem segera memindahkan token ke `sessionStorage` lokal tab tersebut dan membersihkan URL di address bar menggunakan `history.replaceState`.
   - Di address bar ponsel hanya tertulis `/pesan`. Jika pelanggan menyalin link dan membukanya di rumah/tab baru, tautan tersebut tidak memiliki token dan otomatis ditolak oleh sistem.

### B. Aplikasi POS Kasir & Pelayanan
1. **Denah & Monitoring Meja Realtime**:
   - Visualisasi status meja (*Kosong*, *Terisi*, *Minta Tagihan*, *Siap Diantar*).
   - Sinkronisasi instan via Supabase Realtime saat ada pesanan baru atau perubahan status meja.
2. **Notifikasi Audio (Synthesizer Chime)**:
   - Nada lonceng sintetis otomatis berbunyi via Web Audio API saat ada pelanggan yang memanggil pelayan atau meminta tagihan kasir.
3. **Checkout Terpadu (Tunai, QRIS, & Kartu Debit)**:
   - Pembayaran tunai dilengkapi numpad nominal cepat dan kalkulator uang kembalian otomatis.
   - Pembayaran QRIS mendukung QRIS dinamis/statis dengan simulator mutasi bank.
   - Cetak struk termal standar 58mm / 80mm yang siap cetak langsung.
4. **Pencetakan Stand Akrilik Meja Elegan**:
   - Cetak stiker QR meja beresolusi tinggi dengan logo Rawon Gusti, nomor meja besar, dan instruksi ringkas tanpa teks URL mentah yang mengotori kartu.

### C. Kitchen Display System (KDS - Dapur)
1. **Tiket Pesanan Dapur Realtime**:
   - Menampilkan rincian pesanan baru beserta catatan kustomisasi juru masak secara jelas.
2. **Alur Kerja Dapur 1-Klik**:
   - Tombol status progresif: **Mulai Masak (`preparing`)** ➔ **Siap Saji (`ready`)** ➔ **Diantar ke Meja (`served`)**.
   - Hak akses dapur dikunci ketat: staf dapur tidak dapat melihat nominal uang atau data keuangan.

### D. Panel Manajemen & Laporan (Khusus Admin Outlet)
1. **Dashboard Analitik Terpadu**:
   - Pemilih periode cepat: **1 Hari**, **1 Minggu**, **1 Bulan**, **1 Tahun**, serta 1 picker tanggal terpadu.
   - Ringkasan omzet bersih, pajak terkumpul, rata-rata belanja (*basket size*), dan rasio pembayaran tunai vs digital.
2. **Laporan Transaksi & Pajak Daerah**:
   - Pemilih tanggal native (`<input type="date">`), preset filter instan (*Hari Ini*, *7 Hari*, *30 Hari*), dan ekspor data ke file CSV.
3. **Rekap Tutup Shift Kasir (Audit Rekonsiliasi Kas)**:
   - Modal audit penghitungan fisik uang laci kasir vs rekap penjualan tunai sistem.
   - Penghitungan otomatis selisih kas (*Balans*, *Surplus/Lebih*, atau *Minus/Kurang*) serta cetak slip penutupan shift.
4. **Kelola Menu & Meja**:
   - Tambah menu baru, edit varian/harga, toggle ketersediaan habis/siap saji.
   - Panel edit menu bersifat *collapsible* (bisa ditutup-buka agar layar leluasa).
   - Tambah meja baru dan cetak QR stand meja instan.
5. **Manajemen Akun Staf & Role-Based Access Control (RBAC)**:
   - Pengelolaan akun operasional kasir, dapur, dan admin dengan hashing kata sandi aman.

---

## 3. Arsitektur Backend Next.js Functional Programming (FP)

Backend Next.js pada folder `backend/` dibangun murni menggunakan **JavaScript (`.js`)** dengan kaidah **Functional Programming (FP)**:

### Prinsip Utama FP yang Diterapkan:
1. **Zero OOP / No Classes**:
   - Tidak ada deklarasi `class`, pewarisan (*inheritance*), kata kunci `this`, maupun `new Object()`.
   - Seluruh logika bisnis direpresentasikan sebagai fungsi murni (*pure functions*) yang menerima input dan mengembalikan output tanpa memutasi data asal (*immutable*).
2. **Result Monad Pattern (`backend/lib/fp/result.js`)**:
   - Menghindari penggunaan `throw` dan runtime uncaught exceptions.
   - Operasi yang berpotensi gagal mengembalikan wadah monadik `ok(value)` atau `err(message)` yang dikonsumsi secara aman melalui fungsi `match(onOk, onErr)`:
     ```javascript
     export const ok = (value) => ({ ok: true, value, isOk: () => true, isErr: () => false });
     export const err = (error) => ({ ok: false, error, isOk: () => false, isErr: () => true });
     ```
3. **Penyusunan Alur Fungsi (*Pipeline Composition*)**:
   - Transformasi data dialirkan secara deklaratif menggunakan helper `pipe()`:
     ```javascript
     const processOrder = pipe(
       validateInput,
       flatMap(calculatePricing),
       flatMap(persistToDatabase)
     );
     ```
4. **Kalkulasi Tagihan Deterministik (`backend/lib/domain/billing.js`)**:
   - Formula matematika matematis murni untuk subtotal, layanan 5%, pajak daerah PB1 10%, dan kembalian tanpa efek samping (*side effects*).
5. **Finite State Machine Status Pesanan (`backend/lib/domain/orderStateMachine.js`)**:
   - Transisi status satu arah yang valid:
     $$\text{draft} \longrightarrow \text{submitted} \longrightarrow \text{preparing} \longrightarrow \text{ready} \longrightarrow \text{served}$$
   - Mencegah perubahan status ilegal di luar alur operasional dapur.

---

## 4. Mitigasi Keamanan & Pencegahan Celah Kebobolan

Sistem menerapkan arsitektur *Zero-Trust Client* untuk menutup seluruh potensi eksploitasi:

1. **Anti-Tampering Harga & Menu**:
   - Klien browser **tidak pernah diizinkan mengirim nominal harga**.
   - RPC Supabase `place_order` dan pipeline backend selalu membaca harga asli langsung dari tabel master `products.price` dan `extras.price`. Manipulasi nominal pada DevTools klien akan sia-sia.
2. **Row Level Security (RLS) & Isolasi Hak Akses**:
   - Pengguna publik / anonim tidak memiliki izin `SELECT` bebas ke tabel pesanan maupun pembayaran. Pembacaan pesanan pelanggan wajib melewati fungsi `my_orders(p_token)` yang memverifikasi kecocokan token meja aktif.
   - Staf dapur (`kitchen`) diisolasi dari tabel dan kolom pembayaran sehingga tidak dapat melihat data omzet.
   - Fungsi penambahan staf `admin_create_staff` hanya dapat dieksekusi oleh profil ber-role `admin`.
3. **Validasi Alur Pembayaran & Sesi Meja**:
   - Pembayaran sesi meja (`pay_session`) memvalidasi bahwa seluruh makanan telah berstatus `served` (telah disajikan ke meja).
   - Uang tunai yang diterima kasir divalidasi tidak boleh kurang dari total tagihan.
   - Sesi meja ditutup otomatis (`closed_at = now()`) saat pembayaran selesai.

---

## 5. Penyempurnaan UI/UX & Fleksibilitas Layar

Sesuai arahan desain operasional profesional (bebas *AI slop*):

1. **Fleksibilitas Responsif Otomatis (Android & Desktop)**:
   - Banner pemilih perangkat manual telah dihapus sepenuhnya.
   - **Mode Desktop/Tablet**: Sidebar kiri permanen, alur kerja kasir cepat dengan keyboard shortcut.
   - **Mode Ponsel/Android**: Header mobile ringkas, navigasi bawah (*bottom bar*) ramah ibu jari, dan *Slide-Up Drawer Menu Admin* khusus untuk akun admin.
2. **Pembersihan Elemen Redundan**:
   - Menghapus tulisan kotak "OUTLET" dan label shift yang tidak diperlukan di sidebar.
   - Menghapus tombol logout ganda di pojok kanan atas (terpusat rapi di pojok kiri bawah).
   - Menghapus tombol switch role manual di header; navigasi kini murni terkunci sesuai akun login yang sedang aktif.
   - Mengganti animasi dot kunang-kunang pada kartu "Siap Diantar" menjadi ikon jam (*schedule*) yang tenang dan elegan.
3. **Hierarki Hak Akses Navigasi**:
   - **Kitchen**: Hanya mengakses *Pantau Pesanan (KDS)*.
   - **Kasir**: Hanya mengakses navigasi operasional (*Meja & Pelanggan*, *Pesanan Baru*, *Checkout & Bayar*).
   - **Admin**: Akses penuh ke seluruh menu operasional serta menu manajemen (*Dashboard*, *Kelola Menu*, *Kelola Meja*, *Akun Staf*, *Laporan*).

---

## 6. Panduan Menjalankan Sistem (Lokal & Mobile)

### Prasyarat
* Node.js versi 18 atau lebih baru.
* Proyek Supabase aktif.

### Langkah Instalasi
1. Clone repositori ini dan masuk ke folder proyek:
   ```bash
   cd Fokus
   ```
2. Pasang dependensi frontend dan backend:
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```
3. Siapkan file environment [`.env`](file:///c:/Users/DAUD%20ACHMAD/Documents/MataKuliah/Semester%205/IUM/Proyek/Fokus/.env) di root:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_APP_URL=http://localhost:3000
   ```
4. Eksekusi skrip basis data di **Supabase SQL Editor** secara berurutan:
   - `supabase/schema.sql` (tabel, RLS, RPC, realtime)
   - `supabase/seed.sql` (master menu & meja)
   - `supabase/seed_demo.sql` (akun demo kasir, admin, dapur)
5. Jalankan server frontend:
   ```bash
   npm run dev
   ```

---

### Panduan Menguji Pemesanan via HP (Smartphone):

#### Opsi 1: Menggunakan Jaringan Wi-Fi yang Sama
1. Pastikan profil Wi-Fi di laptop Anda diatur ke **Private network**:
   * Windows Settings ➔ *Network & internet* ➔ *Wi-Fi* ➔ Klik nama Wi-Fi Anda ➔ Pilih **Private network**.
2. Cek alamat IP laptop Anda di Command Prompt via perintah `ipconfig` (misal: `192.168.1.9`).
3. Buka browser di ponsel Anda:
   * **Menu Pelanggan Meja 01**: `http://192.168.1.9:3000/pesan?meja=tbl_token_meja_01`
   * **Aplikasi POS Kasir di Ponsel**: `http://192.168.1.9:3000/`

#### Opsi 2: Menggunakan Hotspot Seluler Ponsel (Bypass Router)
Jika router Wi-Fi rumah mengaktifkan *AP/Client Isolation*:
1. Nyalakan Hotspot Pribadi di ponsel Anda dan sambungkan laptop ke hotspot tersebut.
2. Cek IP baru laptop via `ipconfig` (misal: `192.168.43.xxx`).
3. Buka alamat tersebut dari ponsel Anda.

---

## 7. Akun Demo Bawaan

Kata sandi untuk seluruh akun demo: **`password123`**

| Peran | Email | Akses Halaman |
|---|---|---|
| **Kasir** | `kasir@rawongusti.test` | Meja & Pelanggan, Pesanan Baru POS, Checkout & Pembayaran |
| **Dapur (Kitchen)** | `dapur@rawongusti.test` | Pantau Pesanan Dapur (KDS) saja |
| **Admin Outlet** | `admin@rawongusti.test` | Akses penuh ke seluruh menu operasional dan manajemen outlet |

---

*Dikembangkan dengan dedikasi untuk keunggulan kuliner Rawon Gusti Surabaya — Rasa Asli, Sepenuh Hati.*
