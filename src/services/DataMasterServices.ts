// src/services/MasterDataService.ts - Service untuk mengambil data dari Node.js API

import { ViewBarang, ViewBarangAktif,ViewPengadaan, ViewPenerimaan, ViewPenjualan,
     Role, User, ViewDetailPengadaan, MarginPenjualan, MarginPenjualanAktif,
     ViewDetailPenerimaan, ViewDetailPenjualan,
     PengadaanSPBody, NewDetailPenerimaanBody,
     SatuanAktif,
     VendorAktif,Vendor} from '../types/data';
import { Satuan, Barang} from '../types/db';

// >>> GANTI URL INI <<<
// Pastikan URL ini sesuai dengan port tempat server Node.js Anda berjalan (misal: 8000)
const API_BASE_URL = 'http://localhost:8000/api/v1'; 

/**
 * Mengambil semua data barang dari API Node.js/Express.
 */
// Ambil semua data barang
export async function fetchBarangAllData(): Promise<ViewBarang[]> {
    const response = await fetch(`${API_BASE_URL}/barang/all`);
    if (!response.ok) throw new Error(`Gagal mengambil semua data barang`);
    const result = await response.json();
    return result.data || [];
}

// Ambil hanya data barang aktif
export async function fetchBarangActiveData(): Promise<ViewBarangAktif[]> {
    const response = await fetch(`${API_BASE_URL}/barang/active`);
    if (!response.ok) throw new Error(`Gagal mengambil data barang aktif`);
    const result = await response.json();
    return result.data || [];
}


export async function fetchSatuanData(): Promise<Satuan[]> {
    const response = await fetch(`${API_BASE_URL}/satuan/all`);
    
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
export async function fetchSatuanDataAktif(): Promise<SatuanAktif[]> {
    const response = await fetch(`${API_BASE_URL}/satuan/active`);
    
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
      return normalizedData as SatuanAktif[];
    }
    throw new Error("Format respons API Satuan tidak valid. Properti 'data' (array) tidak ditemukan.");
  } 

export async function fetchVendorData(): Promise<Vendor[]> {
    const response = await fetch(`${API_BASE_URL}/vendor/all`);
    
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
export async function fetchVendorDataAktif(): Promise<VendorAktif[]> {
    const response = await fetch(`${API_BASE_URL}/vendor/active`);
    
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
      return normalizedData as VendorAktif[];
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
export async function fetchRoleData(): Promise<Role[]> {
    const response = await fetch(`${API_BASE_URL}/role`);
    
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || `Gagal mengambil data: HTTP Status ${response.status}`);
    }
    
     const result = await response.json();
    // Asumsikan API Node.js mengembalikan format { status: 'success', data: [...] }
    if (result.data) {
        return result.data as Role[];
    }
    return [];
}
export async function fetchUserData(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/user`);
    
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || `Gagal mengambil data: HTTP Status ${response.status}`);
    }
    
     const result = await response.json();
    // Asumsikan API Node.js mengembalikan format { status: 'success', data: [...] }
    if (result.data) {
        return result.data as User[];
    }
    return [];
}
export async function fetchMarginPenjualan(): Promise<MarginPenjualan[]> {
    const response = await fetch(`${API_BASE_URL}/margin/all`);
    
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || `Gagal mengambil data: HTTP Status ${response.status}`);
    }
    
     const result = await response.json();
    if (result && Array.isArray(result.data)) {
        const normalizedData = result.data.map((item: any) => ({
            ...item,
            status: Number(item.status ?? item.STATUS), // Konversi status ke angka
        }));
        return normalizedData as MarginPenjualan[];
    }
    return [];
}
export async function fetchMarginPenjualanAktif(): Promise<MarginPenjualanAktif[]> {
    const response = await fetch(`${API_BASE_URL}/margin/active`);
    
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || `Gagal mengambil data: HTTP Status ${response.status}`);
    }
    
     const result = await response.json();
    if (result && Array.isArray(result.data)) {
        const normalizedData = result.data.map((item: any) => ({
            ...item,
            status: Number(item.status ?? item.STATUS), // Konversi status ke angka
        }));
        return normalizedData as MarginPenjualanAktif[];
    }
    return [];
}

async function handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type");
    let responseBody;
  
    // Coba parse JSON jika content type-nya JSON
    if (contentType && contentType.includes("application/json")) {
        responseBody = await response.json();
        
    } else {
        // Jika bukan JSON (misal: DELETE sukses tanpa body), cukup cek status OK
        if (!response.ok) {
            // Coba baca text jika ada error message non-JSON
            const errorText = await response.text();
            throw new Error(errorText || `Gagal melakukan request: HTTP Status ${response.status}`);
        }
         // Jika OK dan bukan JSON, kembalikan null atau representasi sukses yang sesuai
         // Untuk DELETE, kita bisa anggap sukses jika status OK
        return null as T; // Atau sesuaikan return type jika perlu
    }
    if (!response.ok) {
    if (responseBody && responseBody.message) {
        throw new Error(responseBody.message);
    }
    const text = await response.text();
    throw new Error(text || `HTTP Error ${response.status}`);
  }
    // Jika response OK dan JSON
    if (response.ok) {
         // Cek format standard { status: 'success', data: ... }
        if (responseBody && responseBody.status === 'success') {
            return responseBody.data as T;
        } else {
             // Jika format tidak sesuai tapi status OK (jarang terjadi, tapi antisipasi)
            console.warn("API mengembalikan status OK tapi format tidak sesuai:", responseBody);
            // Kembalikan data langsung jika ada, atau error jika tidak ada data
            return responseBody.data || responseBody as T || null as T;
        }
    } else {
         // Jika response TIDAK OK tapi JSON (ada pesan error dari backend)
        throw new Error(responseBody.message || `Operasi gagal: HTTP Status ${response.status}`);
    }
    
}

export async function fetchSingleBarangData(id: number): Promise<Barang> {
    const response = await fetch(`${API_BASE_URL}/barang/${id}`);
    return handleResponse<Barang>(response);
}

export async function addBarangData(barangData: Omit<Barang, 'idbarang' | 'nama_satuan'>): Promise<ViewBarang> {
    const response = await fetch(`${API_BASE_URL}/barang`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(barangData),
    });
    return handleResponse<ViewBarang>(response);
}

export async function updateBarangData(id: number, barangData: Omit<Barang, 'idbarang' | 'nama_satuan'>): Promise<ViewBarang> {
    const response = await fetch(`${API_BASE_URL}/barang/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(barangData),
    });
    return handleResponse<ViewBarang>(response);
}


export async function deleteBarangData(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/barang/${id}`, {
        method: 'DELETE',
    });
    await handleResponse<void>(response); // Akan throw error jika gagal
}

export async function fetchSatuanOptions(): Promise<Pick<Satuan, 'idsatuan' | 'nama_satuan'>[]> {
    const response = await fetch(`${API_BASE_URL}/satuan/active`);
    return handleResponse<Pick<Satuan, 'idsatuan' | 'nama_satuan'>[]>(response);
}
export async function addPengadaanData(data: PengadaanSPBody): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/pengadaan`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || `Gagal menyimpan data: HTTP Status ${response.status}`);
    }
    return result; // Kembalikan data (termasuk ID baru)
}

export async function fetchDetailPengadaanData(): Promise<ViewDetailPengadaan[]> {
    const response = await fetch(`${API_BASE_URL}/pengadaan/detail`); // Anda perlu buat endpoint ini di server.js
    
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || `Gagal mengambil data: HTTP Status ${response.status}`);
    }
    
     const result = await response.json();
    if (result.data) {
        return result.data as ViewDetailPengadaan[];
    }
    return [];
}
export async function fetchDetailPenerimaanData(): Promise<ViewDetailPenerimaan[]> {
    const response = await fetch(`${API_BASE_URL}/penerimaan/detail`); // Anda perlu buat endpoint ini di server.js
    
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || `Gagal mengambil data: HTTP Status ${response.status}`);
    }
    
     const result = await response.json();
    if (result.data) {
        return result.data as ViewDetailPenerimaan[];
    }
    return [];
}
export async function addDetailPenerimaanData(data: NewDetailPenerimaanBody): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/penerimaan/detail`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || `Gagal menyimpan item: HTTP Status ${response.status}`);
    }
    return result;
}
export async function fetchDetailPenjualanData(): Promise<ViewDetailPenjualan[]> {
    const response = await fetch(`${API_BASE_URL}/penjualan/detail`); // Anda perlu buat endpoint ini di server.js
    
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || `Gagal mengambil data: HTTP Status ${response.status}`);
    }
    
     const result = await response.json();
    if (result.data) {
        return result.data as ViewDetailPenjualan[];
    }
    return [];
}