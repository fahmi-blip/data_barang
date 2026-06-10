# 🏪 Adhi Store — Inventory Management System

Aplikasi manajemen inventaris dan penjualan berbasis web untuk toko, dibangun menggunakan **React + TypeScript** (frontend) dan **Node.js + Express** (backend) dengan database **MySQL**.

---

## 📋 Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Struktur Proyek](#struktur-proyek)
- [Prasyarat](#prasyarat)
- [Instalasi & Menjalankan](#instalasi--menjalankan)
- [Konfigurasi Database](#konfigurasi-database)
- [API Endpoints](#api-endpoints)
- [Halaman & Fitur](#halaman--fitur)
- [Screenshot Fitur](#screenshot-fitur)

---

## 📌 Tentang Proyek

**Adhi Store** adalah sistem manajemen inventaris dan transaksi toko yang mencakup alur lengkap dari pengadaan barang dari vendor, penerimaan fisik barang, hingga penjualan ke pelanggan. Sistem ini dilengkapi dengan kartu stok otomatis yang mencatat setiap mutasi barang secara real-time.

---

## ✨ Fitur Utama

### 📦 Manajemen Master Data
- **Barang** — CRUD data barang (nama, jenis, satuan, harga, status aktif/nonaktif)
- **Satuan** — CRUD satuan ukuran barang (PCS, Unit, Kg, dll.)
- **Vendor** — Manajemen data pemasok/vendor
- **User & Role** — Manajemen pengguna dan hak akses
- **Margin Penjualan** — Pengaturan persentase keuntungan penjualan

### 🔄 Transaksi
- **Pengadaan** — Pemesanan barang dari vendor dengan detail item, harga, dan PPN (10%)
- **Penerimaan** — Konfirmasi penerimaan fisik barang berdasarkan pengadaan, dengan validasi kesesuaian jumlah
- **Penjualan** — Transaksi penjualan dengan perhitungan harga jual otomatis berdasarkan margin dan PPN (11%)

### 📊 Laporan & Monitoring
- **Kartu Stok** — Riwayat mutasi stok per barang (masuk & keluar) secara real-time
- **Dashboard** — Ringkasan total barang aktif, total penjualan, total penerimaan, dan grafik penjualan bulanan
- **Detail Transaksi** — Halaman detail lengkap untuk setiap pengadaan, penerimaan, dan penjualan

### 🎨 UI/UX
- Tema gelap (Dark Mode) & terang (Light Mode)
- Responsive layout untuk desktop dan mobile
- Sidebar navigasi yang dapat di-collapse

---

## 🛠 Tech Stack

### Frontend
| Teknologi | Keterangan |
|-----------|-----------|
| React 18 | Library UI utama |
| TypeScript | Type safety |
| Vite | Build tool & dev server |
| Tailwind CSS v4 | Styling utility-first |
| React Router v7 | Client-side routing |
| ApexCharts | Grafik & visualisasi data |
| Flatpickr | Date picker |

### Backend
| Teknologi | Keterangan |
|-----------|-----------|
| Node.js | Runtime JavaScript |
| Express v5 | Framework API server |
| mysql2 | Driver koneksi MySQL |
| CORS | Cross-Origin Resource Sharing |

### Database
| Teknologi | Keterangan |
|-----------|-----------|
| MySQL | Relational database |
| Views | `view_barang`, `view_pengadaan`, `view_penjualan`, dll. |
| Stored Procedure | `sp_tambah_pengadaan` |
| Function | `fn_hitung_harga_jual` |
| Trigger | Update kartu stok otomatis saat penerimaan & penjualan |

---

## 📁 Struktur Proyek

```
adhi-store/
├── src/
│   ├── backend/                  # Node.js API Server
│   │   ├── server.js             # Entry point backend
│   │   └── package.json
│   │
│   ├── components/               # Komponen React reusable
│   │   ├── common/               # PageBreadcrumb, PageMeta, dll.
│   │   ├── ecommerce/            # EcommerceMetrics, RecentOrders, Charts
│   │   ├── form/                 # Input, Select, Label, MultiSelect
│   │   ├── header/               # AppHeader, NotificationDropdown
│   │   └── ui/                   # Badge, Button, Modal, Table, Alert
│   │
│   ├── context/                  # React Context
│   │   ├── SidebarContext.tsx    # State sidebar
│   │   └── ThemeContext.tsx      # Dark/Light mode
│   │
│   ├── hooks/                    # Custom hooks
│   │   ├── useModal.ts
│   │   └── useGoBack.ts
│   │
│   ├── layout/                   # Layout aplikasi
│   │   ├── AppLayout.tsx
│   │   ├── AppHeader.tsx
│   │   ├── AppSidebar.tsx
│   │   └── Backdrop.tsx
│   │
│   ├── pages/                    # Halaman aplikasi
│   │   ├── Dashboard/Home.tsx
│   │   ├── master/               # Barang, Satuan, Vendor, User, Role, Margin
│   │   └── Penjualan/            # Pengadaan, Penerimaan, Penjualan, KartuStok
│   │
│   ├── services/
│   │   └── DataMasterServices.ts # Semua fungsi API call ke backend
│   │
│   └── types/
│       ├── data.d.ts             # Tipe data dari Views & API response
│       └── db.d.ts               # Tipe data struktur tabel database
│
├── App.tsx                       # Root component & routing
├── main.tsx                      # Entry point React
└── index.css                     # Global styles & Tailwind config
```

---

## ✅ Prasyarat

Pastikan sudah terinstal di komputer Anda:

- **Node.js** v18 atau lebih baru
- **npm** atau **yarn**
- **MySQL** v8 atau lebih baru
- **Git**

---

## 🚀 Instalasi & Menjalankan

### 1. Clone Repository

```bash
git clone https://github.com/username/adhi-store.git
cd adhi-store
```

### 2. Install Dependencies Frontend

```bash
npm install
```

### 3. Install Dependencies Backend

```bash
cd src/backend
npm install
cd ../..
```

### 4. Setup Database

Buat database MySQL dan jalankan script SQL (lihat bagian [Konfigurasi Database](#konfigurasi-database)).

### 5. Konfigurasi Backend

Edit file `src/backend/server.js` dan sesuaikan konfigurasi database:

```js
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',          // Sesuaikan password MySQL Anda
    database: 'dbdatabarang',
    port: 3306
};
```

### 6. Jalankan Backend Server

```bash
cd src/backend
node server.js
```

Backend akan berjalan di: `http://localhost:8000`

### 7. Jalankan Frontend (terminal terpisah)

```bash
npm run dev
```

Frontend akan berjalan di: `http://localhost:5173`

---

## 🗄️ Konfigurasi Database

### Nama Database
```
dbdatabarang
```

### Tabel Utama
| Tabel | Deskripsi |
|-------|-----------|
| `barang` | Data master barang |
| `satuan` | Data satuan ukuran |
| `vendor` | Data pemasok |
| `role` | Data role pengguna |
| `user` | Data pengguna sistem |
| `margin_penjualan` | Pengaturan margin keuntungan |
| `pengadaan` | Header transaksi pengadaan |
| `detail_pengadaan` | Detail item per pengadaan |
| `penerimaan` | Header transaksi penerimaan |
| `detail_penerimaan` | Detail item per penerimaan |
| `penjualan` | Header transaksi penjualan |
| `detail_penjualan` | Detail item per penjualan |
| `kartu_stok` | Log mutasi stok otomatis |

### Views yang Dibutuhkan
```sql
-- Contoh: View barang aktif beserta nama satuan
CREATE VIEW view_barang AS
SELECT b.idbarang, b.nama, b.jenis, b.status, b.harga, s.nama_satuan
FROM barang b
LEFT JOIN satuan s ON b.idsatuan = s.idsatuan;

CREATE VIEW view_barang_aktif AS
SELECT * FROM view_barang WHERE status = 1;
```

> **Catatan:** Pastikan semua views (`view_barang`, `view_satuan`, `view_vendor`, `view_pengadaan`, `view_penerimaan`, `view_penjualan`, `view_detail_pengadaan`, `view_detail_penerimaan`, `view_detail_penjualan`, `view_margin_penjualan`, `view_role`, `view_user`), stored procedure `sp_tambah_pengadaan`, dan function `fn_hitung_harga_jual` sudah dibuat di database.

---

## 🌐 API Endpoints

Base URL: `http://localhost:8000/api/v1`

### Barang
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/barang/all` | Semua data barang |
| GET | `/barang/active` | Barang aktif saja |
| GET | `/barang/:id` | Detail satu barang |
| POST | `/barang` | Tambah barang baru |
| PUT | `/barang/:id` | Update barang |
| DELETE | `/barang/:id` | Hapus barang |

### Satuan
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/satuan/all` | Semua satuan |
| GET | `/satuan/active` | Satuan aktif |
| GET | `/satuan/:id` | Detail satu satuan |
| POST | `/satuan` | Tambah satuan |
| PUT | `/satuan/:id` | Update satuan |
| DELETE | `/satuan/:id` | Hapus satuan |

### Transaksi
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/pengadaan` | Daftar pengadaan |
| POST | `/pengadaan` | Buat pengadaan baru |
| GET | `/pengadaan/:id` | Detail pengadaan |
| GET | `/pengadaan/:id/items` | Item dalam pengadaan |
| GET | `/penerimaan` | Daftar penerimaan |
| POST | `/penerimaan` | Buat penerimaan baru |
| GET | `/penerimaan/:id/items` | Item dalam penerimaan |
| GET | `/penjualan` | Daftar penjualan |
| POST | `/penjualan` | Buat penjualan baru |
| GET | `/penjualan/:id/items` | Item dalam penjualan |

### Lainnya
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/vendor/all` | Semua vendor |
| GET | `/vendor/active` | Vendor aktif |
| GET | `/margin/all` | Semua margin |
| GET | `/margin/active` | Margin aktif |
| GET | `/kartu-stok` | Semua kartu stok |
| GET | `/kartu-stok/:idbarang` | Kartu stok per barang |
| GET | `/role` | Daftar role |
| GET | `/user` | Daftar user |

---

## 📄 Halaman & Fitur

### Dashboard (`/`)
- Kartu ringkasan: Total Barang Aktif, Total Penjualan, Total Penerimaan
- Grafik penjualan bulanan (bar chart)
- Tabel 5 penjualan terbaru

### Master Data
| Halaman | Path | Fitur |
|---------|------|-------|
| Barang | `/barang` | List, tambah, edit, hapus, filter aktif/semua |
| Satuan | `/satuan` | List, tambah, edit, hapus, filter aktif/semua |
| Vendor | `/vendor` | List, filter aktif/semua |
| Role | `/role` | List role pengguna |
| User | `/user` | List pengguna |
| Margin | `/margin` | List margin, filter aktif/semua |

### Transaksi
| Halaman | Path | Fitur |
|---------|------|-------|
| Pengadaan | `/pengadaan` | List, tambah, lihat detail |
| Tambah Pengadaan | `/pengadaan/tambah` | Form pengadaan dengan multi-item |
| Detail Pengadaan | `/pengadaan/detail/:id` | Info header + daftar item + total |
| Penerimaan | `/penerimaan` | List, tambah, lihat detail |
| Tambah Penerimaan | `/penerimaan/tambah` | Form dengan validasi kesesuaian pengadaan, draft tersimpan di localStorage |
| Detail Penerimaan | `/penerimaan/detail/:id` | Info + daftar barang diterima |
| Penjualan | `/penjualan` | List, tambah, lihat detail |
| Tambah Penjualan | `/penjualan/tambah` | Form dengan harga jual otomatis, cek stok real-time |
| Detail Penjualan | `/penjualan/detail/:id` | Struk belanja lengkap |

### Kartu Stok (`/kartu-stock`)
- Filter barang menggunakan dropdown
- Tabel riwayat mutasi stok: tanggal, jenis transaksi, masuk, keluar, sisa stok

---
