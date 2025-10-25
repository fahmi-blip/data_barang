// src/services/MasterDataService.ts - Service untuk mengambil data dari Node.js API

import { ViewBarang, ViewPengadaan, ViewPenerimaan, ViewPenjualan } from '../types/data';
import { Satuan, Vendor, Barang} from '../types/db';

// >>> GANTI URL INI <<<
// Pastikan URL ini sesuai dengan port tempat server Node.js Anda berjalan (misal: 8000)
const API_BASE_URL = 'http://localhost:8000/api/v1'; 

/**
 * Mengambil semua data barang dari API Node.js/Express.
 */
export async function fetchBarangData(): Promise<ViewBarang[]> {
    const response = await fetch(`${API_BASE_URL}/barang`);
    
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || `Gagal mengambil data: HTTP Status ${response.status}`);
    }
    
    const result = await response.json();
    // Asumsikan API Node.js mengembalikan format { status: 'success', data: [...] }
    if (result.data) {
        return result.data as ViewBarang[];
    }
    return [];

  }

export async function fetchSatuanData(): Promise<Satuan[]> {
    const response = await fetch(`${API_BASE_URL}/satuan`);
    
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || `Gagal mengambil data: HTTP Status ${response.status}`);
    }
    
    const result = await response.json();

    if (result && Array.isArray(result.data)) {
        if (result.data.length === 0) {
            console.warn("API berhasil dihubungi, namun array data Satuan kosong.");
            return [];
        }
        const normalizedData = result.data.map((item: any) => ({
        ...item,
        status: Number(item.status ?? item.STATUS),
      }));
      return normalizedData as Satuan[];
    }
    throw new Error("Format respons API Satuan tidak valid. Properti 'data' (array) tidak ditemukan.");
  } 

export async function fetchVendorData(): Promise<Vendor[]> {
    const response = await fetch(`${API_BASE_URL}/vendor`);
    
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || `Gagal mengambil data: HTTP Status ${response.status}`);
    }
    
    const result = await response.json();

    if (result && Array.isArray(result.data)) {
        if (result.data.length === 0) {
            console.warn("API berhasil dihubungi, namun array data Satuan kosong.");
            return [];
        }
        const normalizedData = result.data.map((item: any) => ({
        ...item,
        status: Number(item.status ?? item.STATUS),
      }));
      return normalizedData as Vendor[];
    }
    
    throw new Error("Format respons API Vendor tidak valid. Properti 'data' (array) tidak ditemukan.");
}

export async function fetchPengadaanData(): Promise<ViewPengadaan[]> {
    const response = await fetch(`${API_BASE_URL}/pengadaan`);
    
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || `Gagal mengambil data: HTTP Status ${response.status}`);
    }
    
     const result = await response.json();
    // Asumsikan API Node.js mengembalikan format { status: 'success', data: [...] }
    if (result.data) {
        return result.data as ViewPengadaan[];
    }
    return [];

  }

export async function fetchPenerimaanData(): Promise<ViewPenerimaan[]> {
    const response = await fetch(`${API_BASE_URL}/penerimaan`);
    
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || `Gagal mengambil data: HTTP Status ${response.status}`);
    }
    
     const result = await response.json();
    // Asumsikan API Node.js mengembalikan format { status: 'success', data: [...] }
    if (result.data) {
        return result.data as ViewPenerimaan[];
    }
    return [];
}

export async function fetchPenjualanData(): Promise<ViewPenjualan[]> {
    const response = await fetch(`${API_BASE_URL}/penjualan`);
    
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || `Gagal mengambil data: HTTP Status ${response.status}`);
    }
    
     const result = await response.json();
    // Asumsikan API Node.js mengembalikan format { status: 'success', data: [...] }
    if (result.data) {
        return result.data as ViewPenjualan[];
    }
    return [];
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: `HTTP Status ${response.status}` }));
        throw new Error(errorBody.message || `Gagal melakukan request: HTTP Status ${response.status}`);
    }
    const result = await response.json();
    if (result.status === 'success') {
        return result.data as T;
    } else {
        throw new Error(result.message || "Operasi gagal.");
    }
}
export async function fetchSingleBarangData(id: number): Promise<Barang> { // Mengambil data asli untuk form edit
    const response = await fetch(`${API_BASE_URL}/barang/${id}`);
    return handleResponse<Barang>(response);
}

export async function addBarangData(barangData: Omit<Barang, 'idbarang' | 'nama_satuan'>): Promise<ViewBarang> { // Return type bisa ViewBarang jika API mengembalikan data dari view
    const response = await fetch(`${API_BASE_URL}/barang`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(barangData),
    });
    return handleResponse<ViewBarang>(response); // Sesuaikan return type jika perlu
}

export async function updateBarangData(id: number, barangData: Omit<Barang, 'idbarang' | 'nama_satuan'>): Promise<ViewBarang> { // Return type bisa ViewBarang
    const response = await fetch(`${API_BASE_URL}/barang/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(barangData),
    });
     return handleResponse<ViewBarang>(response); // Sesuaikan return type jika perlu
}

export async function deleteBarangData(id: number): Promise<void> { // Biasanya tidak mengembalikan data
    const response = await fetch(`${API_BASE_URL}/barang/${id}`, {
        method: 'DELETE',
    });
     if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: `HTTP Status ${response.status}` }));
        throw new Error(errorBody.message || `Gagal menghapus data: HTTP Status ${response.status}`);
    }
    // Tidak perlu parse JSON jika status 200/204 OK dan tidak ada body
}
export async function fetchSatuanOptions(): Promise<Satuan[]> { // Ubah nama fungsi agar lebih jelas
    const response = await fetch(`${API_BASE_URL}/satuan`);
    // API backend sudah memfilter status=1
    return handleResponse<Satuan[]>(response);
}