// src/services/MasterDataService.ts - Service untuk mengambil data dari Node.js API

import { ViewBarang } from '../types/data';
import { Satuan } from '../types/db';
import { Vendor } from '../types/db';

// >>> GANTI URL INI <<<
// Pastikan URL ini sesuai dengan port tempat server Node.js Anda berjalan (misal: 8000)
const API_BASE_URL = 'http://localhost:8000/api/v1'; 

/**
 * Mengambil semua data barang dari API Node.js/Express.
 */
export async function fetchBarangData(): Promise<ViewBarang[]> {
  try {
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

  } catch (error) {
    console.error("API Error [Barang]: Pastikan Node.js API server berjalan.", error);
    // Melemparkan error untuk ditangani oleh komponen React
    throw error;
  }
}

export async function fetchSatuanData(): Promise<Satuan[]> {
  try {
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

  } catch (error) {
    console.error("API Error [Satuan]: Gagal memproses respons.", error);
    if (error instanceof Error) {
        throw new Error(`[Response Error] ${error.message}`);
    } else {
        throw new Error("Gagal mengambil atau memproses data Satuan dari server.");
    }
  }
}

export async function fetchVendorData(): Promise<Vendor[]> {
  try {
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

  } catch (error) {
    console.error("API Error [Vendor]: Gagal memproses respons.", error);
    if (error instanceof Error) {
        throw new Error(`[Response Error] ${error.message}`);
    } else {
        throw new Error("Gagal mengambil atau memproses data Vendor dari server.");
    }
  }
}