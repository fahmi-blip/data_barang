// src/types/data.d.ts - Mendefinisikan struktur data dari VIEW_BARANG

// Tipe untuk Status (0: Nonaktif, 1: Aktif)
export type StatusToko = 0 | 1;

export type BadanHukum = 'A' | 'T' | null; // 'T' = Terdaftar, 'TT' = Tidak Terdaftar
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
// Anda akan menambahkan interface lain di sini (ViewSatuan, ViewVendor, dll.)
// jika Anda mulai mengimplementasikan halaman tersebut.
