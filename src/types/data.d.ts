// src/types/data.d.ts - Mendefinisikan struktur data dari VIEW_BARANG

// Tipe untuk Status (0: Nonaktif, 1: Aktif)
export type StatusToko = 0 | 1;

export type BadanHukum = 'A' | 'T' | null; 
 // 'T' = Terdaftar, 'TT' = Tidak Terdaftar
/**
 * Interface untuk data Barang yang diambil dari API (menggunakan VIEW_BARANG)
 */
export interface ViewBarang {
  idbarang: number;
  nama_barang: string; // dari kolom 'nama' di tabel barang
  jenis: string;      // CHAR(1)
  nama_satuan: string; // Hasil JOIN dari tabel satuan
  status: StatusToko;
}

export interface Satuan {
  idsatuan: number;
  nama_satuan: string;
  status: StatusToko;
}
export interface Vendor {
  idvendor: number;
  nama_vendor: string;
  badan_hukum: string | null;
  status: StatusToko;
}

export interface ViewPengadaan{
  idpengadaan: number;
  timestamp: string;
  nama_user: string;
  nama_vendor: string;
  subtotal_nilai: number;
  ppn: number;
  total_nilai: number;
  status: StatusToko;
}

export interface ViewPenerimaan {
  idpenerimaan: number; // INT
    created_at: string;
    status: string; // CHAR(1) - default '1'
    idpengadaan: number | null; // INT
    nama_vendor: string; // Untuk display
    diterima_oleh: string; // Untuk display
    pengadaan?: Pengadaan; // Untuk mendapatkan data pengadaan
    details?: DetailPenerimaan[];
}

export interface ViewPenjualan {
  idpenjualan: number; // INT
  created_at: string;
  subtotal_nilai: number;
  ppn: number;
  total_nilai: number;
  nama_user: string; // Untuk display
  margin: number; // Untuk display
  idmargin_penjualan: number | null;
  details?: DetailPenjualan[]; //menampung detail relasi
}


// Anda akan menambahkan interface lain di sini (ViewSatuan, ViewVendor, dll.)
// jika Anda mulai mengimplementasikan halaman tersebut.
