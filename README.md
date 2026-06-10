Data Barang - Sistem Manajemen Inventaris & Penjualan
Data Barang adalah aplikasi sistem informasi manajemen inventaris dan penjualan berbasis web yang dikembangkan untuk memudahkan pengelolaan data barang, vendor, satuan, serta pencatatan transaksi pengadaan, penerimaan, dan penjualan barang.

🚀 Fitur Utama
Manajemen Data Master:

Pengelolaan Barang: CRUD barang dengan sistem kategori dan satuan.

Pengelolaan Satuan: Pengaturan satuan ukuran barang (Unit).

Pengelolaan Vendor: Manajemen data pemasok/supplier.

Pengelolaan Role & User: Kontrol akses dan manajemen pengguna sistem.

Margin Penjualan: Pengaturan margin keuntungan secara fleksibel.

Transaksi:

Pengadaan: Pencatatan pembelian/pengadaan barang dari vendor.

Penerimaan: Pengelolaan barang masuk ke gudang.

Penjualan: Sistem pencatatan transaksi penjualan kepada pelanggan.

Kartu Stock: Pelacakan mutasi dan riwayat ketersediaan barang secara real-time.

Dashboard & UI:

Desain modern menggunakan Tailwind CSS.

Responsif dan mendukung Dark Mode.

Visualisasi data menggunakan ApexCharts untuk ringkasan operasional.

🛠️ Stack Teknologi
Frontend
Framework: React 19

Bahasa: TypeScript

Styling: Tailwind CSS (v4)

Routing: React Router v7

Charts: ApexCharts & React-ApexCharts

State/Form Management: Hooks & native React state

Backend
Environment: Node.js (CommonJS)

Framework: Express.js

Database: MySQL

📋 Struktur Folder
Plaintext
src/
├── backend/          # API Server (Express + MySQL)
├── components/       # Komponen UI (Atomic Design)
├── context/          # Global state (Sidebar & Theme)
├── hooks/            # Custom React hooks
├── layout/           # Wrapper layout aplikasi
├── pages/            # Halaman aplikasi (Master, Penjualan, Dashboard)
├── services/         # API Service untuk komunikasi frontend-backend
└── types/            # Definisi tipe data TypeScript (db.d.ts, data.d.ts)
⚙️ Cara Instalasi & Menjalankan Proyek
Prerequisites
Node.js 18.x atau 20.x ke atas.

Database MySQL yang sudah berjalan.

Langkah-langkah
Clone Repository:

Bash
git clone [URL_REPOSITORI_ANDA]
cd data_barang
Instalasi Dependensi:

Bash
npm install
# Atau jika menggunakan yarn
yarn install
Konfigurasi Database:

Siapkan database MySQL Anda.

Sesuaikan koneksi database di src/backend/server.js.

Menjalankan Server:

Jalankan backend:

Bash
node server.js

Jalankan frontend:

Bash
npm run dev
