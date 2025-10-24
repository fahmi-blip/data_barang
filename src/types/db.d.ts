// ===================================
// UTILITY INTERFACES
// ===================================

/**
 * Tipe dasar untuk Status Aktif/Tidak Aktif
 * Status: 1 (Aktif), 0 (Tidak Aktif)
 */
export type StatusToko = 0 | 1; 

// Gunakan 'number' untuk BIGINT/INT, asumsikan aman dalam rentang Number JavaScript.

// ===================================
// MASTER DATA (Data Master)
// ===================================

export interface Satuan {
  idsatuan: number;
  nama_satuan: string;
  status: StatusToko;
}

export interface Vendor {
  idvendor: number;
  nama_vendor: string;
  badan_hukum: string | null; // CHAR(1) - misal 'T' untuk Terdaftar
  status: string; // CHAR(1) - default '1'
}

export interface Role {
    idrole: number;
    nama_role: string;
}

export interface User {
  iduser: number;
  username: string;
  // password: string; // TIDAK PERLU di frontend
  idrole: number | null;
  nama_role?: string; // Untuk display
}

export interface MarginPenjualan {
  idmargin_penjualan: number;
  created_at: string; // TIMESTAMP
  persen: number;
  status: StatusToko;
  iduser: number | null;
  update_at: string; // TIMESTAMP
}

export interface Barang {
  idbarang: number;
  jenis: string; // CHAR(1) - Misal 'B' untuk Barang, 'J' untuk Jasa
  nama: string;
  idsatuan: number | null;
  status: StatusToko;
  nama_satuan?: string; // Untuk display
}


// ===================================
// TRANSAKSI (Transactions)
// ===================================

export interface DetailPengadaan {
  iddetail_pengadaan: number; // INT
  harga_satuan: number;
  jumlah: number;
  sub_total: number | null;
  idbarang: number | null;
  idpengadaan: number | null; // INT
  nama_barang?: string; // Untuk display
}

export interface Pengadaan {
  idpengadaan: number; // INT
  timestamp: string;
  user_iduser: number | null;
  vendor_idvendor: number | null;
  subtotal_nilai: number;
  ppn: number;
  total_nilai: number;
  status: string; // CHAR(1) - default '1'
  nama_vendor?: string; // Untuk display
  username?: string; // Untuk display
  details?: DetailPengadaan[]; // Untuk menampung detail relasi
}

export interface DetailPenerimaan {
  iddetail_penerimaan: number; // INT
  idpenerimaan: number | null; // INT
  barang_idbarang: number | null;
  jumlah_terima: number;
  harga_satuan_terima: number;
  sub_total_terima: number | null;
  nama_barang?: string; // Untuk display
}

export interface Penerimaan {
  idpenerimaan: number; // INT
  created_at: string;
  status: string; // CHAR(1) - default '1'
  idpengadaan: number | null; // INT
  iduser: number | null;
  username?: string; // Untuk display
  pengadaan?: Pengadaan; // Untuk mendapatkan data pengadaan
  details?: DetailPenerimaan[]; // Untuk menampung detail relasi
}

export interface DetailPenjualan {
  iddetail_penjualan: number; // INT
  harga_satuan: number | null;
  jumlah: number | null;
  subtotal: number | null;
  penjualan_idpenjualan: number | null; // INT
  idbarang: number | null;
  nama_barang?: string; // Untuk display
}

export interface Penjualan {
  idpenjualan: number; // INT
  created_at: string;
  subtotal_nilai: number;
  ppn: number;
  total_nilai: number;
  iduser: number | null;
  idmargin_penjualan: number | null;
  username?: string; // Untuk display
  details?: DetailPenjualan[]; // Untuk menampung detail relasi
}

// export interface KartuStok { ... } // Biasanya diurus oleh backend