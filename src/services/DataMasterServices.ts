// src/services/DataMasterServices.ts - Service untuk mengambil data dari Node.js API

import { ViewBarang, ViewBarangAktif, ViewPengadaan, ViewPenerimaan, ViewPenjualan,
     Role, User, ViewDetailPengadaan, MarginPenjualan, MarginPenjualanAktif,
     ViewDetailPenerimaan, ViewDetailPenjualan,
     PengadaanSPBody, NewDetailPenerimaanBody,
     SatuanAktif, VendorAktif, Vendor, StatusToko } from '../types/data';
import { Satuan, Barang } from '../types/db';

const API_BASE_URL = 'http://localhost:8000/api/v1';


async function handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type");
    let responseBody;

    if (contentType && contentType.includes("application/json")) {
        responseBody = await response.json();
    } else {
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Gagal melakukan request: HTTP Status ${response.status}`);
        }
        return null as T;
    }

    if (!response.ok) {
        if (responseBody && responseBody.message) {
            throw new Error(responseBody.message);
        }
        throw new Error(`HTTP Error ${response.status}`);
    }

    if (responseBody && responseBody.status === 'success') {
        return responseBody.data as T;
    }

    return responseBody.data || responseBody as T || null as T;
}

// ===================================
// BARANG SERVICES
// ===================================

export async function fetchBarangAllData(): Promise<ViewBarang[]> {
    const response = await fetch(`${API_BASE_URL}/barang/all`);
    return handleResponse<ViewBarang[]>(response);
}

export async function fetchBarangActiveData(): Promise<ViewBarangAktif[]> {
    const response = await fetch(`${API_BASE_URL}/barang/active`);
    return handleResponse<ViewBarangAktif[]>(response);
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
    console.log("🔄 Mengirim request PUT ke:", `${API_BASE_URL}/barang/${id}`);
    console.log("📦 Data yang dikirim:", JSON.stringify(barangData, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/barang/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(barangData),
    });
    
    console.log("📡 Response status:", response.status);
    const result = await handleResponse<ViewBarang>(response);
    console.log("✅ Response data:", result);
    
    return result;
}

export async function deleteBarangData(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/barang/${id}`, {
        method: 'DELETE',
    });
    await handleResponse<void>(response);
}

// ===================================
// SATUAN SERVICES
// ===================================

export async function fetchSatuanData(): Promise<Satuan[]> {
    const response = await fetch(`${API_BASE_URL}/satuan/all`);
    const result = await handleResponse<Satuan[]>(response);
    return result.map((item: any) => ({
        ...item,
        status: Number(item.status ?? item.STATUS),
    }));
}

export async function fetchSatuanDataAktif(): Promise<SatuanAktif[]> {
    const response = await fetch(`${API_BASE_URL}/satuan/active`);
    const result = await handleResponse<SatuanAktif[]>(response);
    return result.map((item: any) => ({
        ...item,
        status: Number(item.status ?? item.STATUS),
    }));
}

export async function fetchSatuanOptions(): Promise<Pick<Satuan, 'idsatuan' | 'nama_satuan'>[]> {
    const response = await fetch(`${API_BASE_URL}/satuan/active`);
    return handleResponse<Pick<Satuan, 'idsatuan' | 'nama_satuan'>[]>(response);
}

export async function addSatuanData(satuanData: Omit<Satuan, 'idsatuan'>): Promise<Satuan> {
    const response = await fetch(`${API_BASE_URL}/satuan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(satuanData),
    });
    return handleResponse<Satuan>(response);
}

export async function updateSatuanData(id: number, satuanData: Omit<Satuan, 'idsatuan'>): Promise<Satuan> {
    const response = await fetch(`${API_BASE_URL}/satuan/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(satuanData),
    });
    return handleResponse<Satuan>(response);
}

export async function deleteSatuanData(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/satuan/${id}`, {
        method: 'DELETE',
    });
    await handleResponse<void>(response);
}

export async function fetchSingleSatuanData(id: number): Promise<Satuan> {
    const response = await fetch(`${API_BASE_URL}/satuan/${id}`);
    return handleResponse<Satuan>(response);
}

// ===================================
// VENDOR SERVICES
// ===================================

export async function fetchVendorData(): Promise<Vendor[]> {
    const response = await fetch(`${API_BASE_URL}/vendor/all`);
    const result = await handleResponse<Vendor[]>(response);
    return result.map((item: any) => ({
        ...item,
        status: Number(item.status ?? item.STATUS),
    }));
}

export async function fetchVendorDataAktif(): Promise<VendorAktif[]> {
    const response = await fetch(`${API_BASE_URL}/vendor/active`);
    const result = await handleResponse<VendorAktif[]>(response);
    return result.map((item: any) => ({
        ...item,
        status: Number(item.status ?? item.STATUS),
    }));
}

// ===================================
// OTHER SERVICES (unchanged)
// ===================================

export async function fetchPengadaanData(): Promise<ViewPengadaan[]> {
    const response = await fetch(`${API_BASE_URL}/pengadaan`);
    return handleResponse<ViewPengadaan[]>(response);
}

export async function fetchPenerimaanData(): Promise<ViewPenerimaan[]> {
    const response = await fetch(`${API_BASE_URL}/penerimaan`);
    return handleResponse<ViewPenerimaan[]>(response);
}

export async function fetchPenjualanData(): Promise<ViewPenjualan[]> {
    const response = await fetch(`${API_BASE_URL}/penjualan`);
    return handleResponse<ViewPenjualan[]>(response);
}

export async function fetchRoleData(): Promise<Role[]> {
    const response = await fetch(`${API_BASE_URL}/role`);
    return handleResponse<Role[]>(response);
}

export async function fetchUserData(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/user`);
    return handleResponse<User[]>(response);
}

export async function fetchMarginPenjualan(): Promise<MarginPenjualan[]> {
    const response = await fetch(`${API_BASE_URL}/margin/all`);
    const result = await handleResponse<MarginPenjualan[]>(response);
    return result.map((item: any) => ({
        ...item,
        status: Number(item.status ?? item.STATUS),
    }));
}

export async function fetchMarginPenjualanAktif(): Promise<MarginPenjualanAktif[]> {
    const response = await fetch(`${API_BASE_URL}/margin/active`);
    const result = await handleResponse<MarginPenjualanAktif[]>(response);
    return result.map((item: any) => ({
        ...item,
        status: Number(item.status ?? item.STATUS),
    }));
}

export async function fetchDetailPengadaanData(): Promise<ViewDetailPengadaan[]> {
    const response = await fetch(`${API_BASE_URL}/pengadaan/detail`);
    return handleResponse<ViewDetailPengadaan[]>(response);
}
export interface NewPengadaanData {
    user_id: number;
    vendor_id: number;
    subtotal_nilai: number;
    details: Array<{
        idbarang: number;
        jumlah: number;
        harga_satuan: number;
    }>;
}
export async function addPenerimaanData(data: NewPenerimaanData): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/penerimaan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
}
export async function fetchDetailPenerimaanData(): Promise<ViewDetailPenerimaan[]> {
    const response = await fetch(`${API_BASE_URL}/penerimaan/detail`);
    return handleResponse<ViewDetailPenerimaan[]>(response);
}
export interface NewPenerimaanData {
    idpengadaan: number;
    iduser: number;
    details: Array<{
        barang_idbarang: number;
        jumlah_terima: number;
        harga_satuan_terima: number;
    }>;
}

export async function fetchDetailPenjualanData(): Promise<ViewDetailPenjualan[]> {
    const response = await fetch(`${API_BASE_URL}/penjualan/detail`);
    return handleResponse<ViewDetailPenjualan[]>(response);
}
export interface NewPenjualanData {
    iduser: number;
    idmargin_penjualan: number;
    details: Array<{
        idbarang: number;
        jumlah: number;
    }>;
}

export async function addPenjualanData(data: NewPenjualanData): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/penjualan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
}


export async function addPengadaanData(data: PengadaanSPBody): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/pengadaan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
}

export async function addDetailPenerimaanData(data: NewDetailPenerimaanBody): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/penerimaan/detail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
}
export interface KartuStok {
    idkartu_stok: number;
    jenis_transaksi: string;
    masuk: number;
    keluar: number;
    stock: number;
    created_at: string;
    idtransaksi: number;
    idbarang: number;
    nama_barang?: string;
}

export async function fetchKartuStokData(): Promise<KartuStok[]> {
    const response = await fetch(`${API_BASE_URL}/kartu-stok`);
    return handleResponse<KartuStok[]>(response);
}

export async function fetchKartuStokByBarang(idbarang: number): Promise<KartuStok[]> {
    const response = await fetch(`${API_BASE_URL}/kartu-stok/${idbarang}`);
    return handleResponse<KartuStok[]>(response);
}