// src/pages/Penjualan/TambahPenjualan.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { TrashBinIcon, PlusIcon } from "../../icons";

import {
    addPenjualanData,
    fetchMarginPenjualanAktif,
    fetchBarangActiveData,
    NewPenjualanData
} from "../../services/DataMasterServices";

interface SelectOption {
    value: string;
    label: string;
}

interface DetailItem {
    idbarang: number;
    nama_barang: string;
    jumlah: number;
    harga_beli: number;
}

// Key untuk Local Storage
const STORAGE_KEY = "penjualan_draft";

export default function TambahPenjualanPage() {
    const navigate = useNavigate();
    
    // --- Logic Load Draft ---
    const loadDraft = () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Gagal load draft penjualan", e);
            }
        }
        return { idMargin: '', persenMargin: 0, details: [] };
    };

    const initialDraft = loadDraft();

    // State
    const [idMargin, setIdMargin] = useState<string>(initialDraft.idMargin);
    const [persenMargin, setPersenMargin] = useState<number>(initialDraft.persenMargin);
    const [details, setDetails] = useState<DetailItem[]>(initialDraft.details);
    
    const [marginOptions, setMarginOptions] = useState<SelectOption[]>([]);
    const [barangOptions, setBarangOptions] = useState<SelectOption[]>([]);
    
    const [selectedBarang, setSelectedBarang] = useState('');
    const [jumlah, setJumlah] = useState(0);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- Effects ---

    // 1. Auto-Save ke Local Storage
    useEffect(() => {
        const dataToSave = {
            idMargin,
            persenMargin,
            details
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }, [idMargin, persenMargin, details]);

    // 2. Load Data Master
    useEffect(() => {
        const loadOptions = async () => {
            try {
                const [margins, barangs] = await Promise.all([
                    fetchMarginPenjualanAktif(),
                    fetchBarangActiveData()
                ]);
                
                setMarginOptions(margins.map(m => ({
                    value: String(m.idmargin_penjualan),
                    label: `${m.persen}% (${m.dibuat_oleh})`
                })));
                
                setBarangOptions(barangs.map(b => ({
                    value: String(b.idbarang),
                    label: `${b.nama} - Harga Beli: Rp ${b.harga?.toLocaleString() || 0}`
                })));
            } catch (err: any) {
                setError("Gagal memuat data: " + err.message);
            }
        };
        loadOptions();
    }, []);

    // 3. Update persentase margin
    useEffect(() => {
        const fetchMarginPersen = async () => {
            if (!idMargin) return;
            try {
                const margins = await fetchMarginPenjualanAktif();
                const selectedMargin = margins.find(m => m.idmargin_penjualan === parseInt(idMargin));
                if (selectedMargin) {
                    setPersenMargin(selectedMargin.persen);
                }
            } catch (err) {
                console.error("Error fetching margin:", err);
            }
        };
        fetchMarginPersen();
    }, [idMargin]);

    // --- Handlers ---

    const handleClearDraft = () => {
        if (confirm("Apakah Anda yakin ingin menghapus seluruh draft penjualan ini?")) {
            setDetails([]);
            setIdMargin('');
            setPersenMargin(0);
            localStorage.removeItem(STORAGE_KEY);
        }
    };

    const handleAddDetail = () => {
        if (!selectedBarang || jumlah <= 0) {
            alert("Pilih barang dan isi jumlah yang valid");
            return;
        }

        // Cek duplikasi
        const existingItemIndex = details.findIndex(d => d.idbarang === parseInt(selectedBarang));
        if (existingItemIndex >= 0) {
            if (confirm("Barang ini sudah ada di daftar. Apakah ingin menambahkan jumlahnya?")) {
                const newDetails = [...details];
                newDetails[existingItemIndex].jumlah += jumlah;
                setDetails(newDetails);
                setSelectedBarang('');
                setJumlah(0);
                return;
            } else {
                return;
            }
        }

        const barangOption = barangOptions.find(b => b.value === selectedBarang);
        if (!barangOption) return;

        const labelParts = barangOption.label.split('Rp ');
        let hargaBeli = 0;
        if (labelParts.length > 1) {
             hargaBeli = parseInt(labelParts[1].replace(/,/g, '').replace('.', '')) || 0;
        }

        const newDetail: DetailItem = {
            idbarang: parseInt(selectedBarang),
            nama_barang: barangOption.label.split(' - ')[0],
            jumlah,
            harga_beli: hargaBeli
        };

        setDetails([...details, newDetail]);
        setSelectedBarang('');
        setJumlah(0);
    };

    const handleRemoveDetail = (index: number) => {
        setDetails(details.filter((_, i) => i !== index));
    };

    const hitungHargaJual = (hargaBeli: number, persen: number) => {
        const margin = hargaBeli * (persen / 100);
        return hargaBeli + margin;
    };

    const calculateSubtotal = () => {
        return details.reduce((sum, item) => {
            const hargaJual = hitungHargaJual(item.harga_beli, persenMargin);
            return sum + (hargaJual * item.jumlah);
        }, 0);
    };

    const calculatePPN = () => {
        return Math.round(calculateSubtotal() * 0.11);
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculatePPN();
    };

   
    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        if (!idMargin) {
            setError("Margin penjualan wajib dipilih");
            return;
        }
        
        if (details.length === 0) {
            setError("Tambahkan minimal 1 item barang");
            return;
        }

        
        try {
            const dataToSubmit: NewPenjualanData = {
                iduser: 1, // PERHATIAN: Pastikan User ID 1 ada di database Anda
                idmargin_penjualan: parseInt(idMargin),
                details: details.map(d => ({
                    idbarang: d.idbarang,
                    jumlah: d.jumlah
                }))
            };
            await addPenjualanData(dataToSubmit);
            
            
            alert(`Penjualan berhasil disimpan!`);
            
            localStorage.removeItem(STORAGE_KEY);
            navigate('/penjualan');
        } catch (err: any) {
            console.error("Error Detail:", err); // Cek Console F12 jika gagal
            setError(err.message || "Gagal menyimpan data. Periksa koneksi atau data input.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <PageMeta title="Tambah Penjualan" description=""/>
            <PageBreadcrumb pageTitle="Tambah Transaksi Penjualan" />
            
            {/* Info Draft */}
            {details.length > 0 && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300 flex justify-between items-center">
                    <span>
                        <strong>Mode Draft:</strong> Data penjualan tersimpan otomatis.
                    </span>
                    <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleClearDraft} 
                        className="bg-white border-red-200 text-red-600 hover:bg-red-50"
                    >
                        Hapus Draft
                    </Button>
                </div>
            )}

            <form className="space-y-6">
                <ComponentCard title="Informasi Penjualan">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="margin">Margin Penjualan *</Label>
                            <Select
                                id="margin"
                                options={marginOptions}
                                value={idMargin}
                                onChange={(value) => setIdMargin(value)}
                                placeholder="Pilih Margin Keuntungan"
                                required
                                disabled={loading}
                                className="dark:bg-gray-900 mt-1.5"
                            />
                        </div>
                        {persenMargin > 0 && (
                            <div className="p-3 bg-success-50 border border-success-300 rounded-lg dark:bg-success-500/10">
                                <p className="text-sm text-success-700 dark:text-success-400">
                                    ✓ Margin <strong>{persenMargin}%</strong> dipilih.
                                </p>
                            </div>
                        )}
                    </div>
                </ComponentCard>

                <ComponentCard title="Input Barang">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="md:col-span-2">
                            <Label htmlFor="barang">Pilih Barang</Label>
                            <Select
                                id="barang"
                                options={barangOptions}
                                value={selectedBarang}
                                onChange={(value) => setSelectedBarang(value)}
                                placeholder="Cari nama barang..."
                                disabled={loading || !idMargin}
                                className="dark:bg-gray-900 mt-1.5"
                            />
                        </div>
                        <div>
                            <Label htmlFor="jumlah">Jumlah</Label>
                            <div className="flex gap-2 mt-1.5">
                                <Input
                                    id="jumlah"
                                    type="number"
                                    value={jumlah || ''}
                                    onChange={(e) => setJumlah(parseInt(e.target.value) || 0)}
                                    min="1"
                                    placeholder="Qty"
                                    disabled={loading || !idMargin}
                                    className="w-full"
                                />
                                <Button
                                    type="button"
                                    variant="primary"
                                    onClick={handleAddDetail}
                                    disabled={loading || !idMargin}
                                    className="px-6"
                                >
                                    Tambah
                                </Button>
                            </div>
                        </div>
                    </div>

                    {details.length > 0 ? (
                        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                            <Table className="w-full">
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow>
                                        <TableCell isHeader className="px-5 py-3">Nama Barang</TableCell>
                                        <TableCell isHeader className="px-5 py-3 text-right">Qty</TableCell>
                                        <TableCell isHeader className="px-5 py-3 text-right">Harga Beli</TableCell>
                                        <TableCell isHeader className="px-5 py-3 text-right">Harga Jual</TableCell>
                                        <TableCell isHeader className="px-5 py-3 text-right">Subtotal</TableCell>
                                        <TableCell isHeader className="px-5 py-3 text-center">Aksi</TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                    {details.map((item, index) => {
                                        const hargaJual = hitungHargaJual(item.harga_beli, persenMargin);
                                        const subtotal = hargaJual * item.jumlah;
                                        
                                        return (
                                            <TableRow key={`${item.idbarang}-${index}`} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                                <TableCell className="px-5 py-4 font-medium">{item.nama_barang}</TableCell>
                                                <TableCell className="px-5 py-4 text-right">{item.jumlah}</TableCell>
                                                <TableCell className="px-5 py-4 text-right text-gray-500">
                                                    Rp {item.harga_beli.toLocaleString('id-ID')}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-right font-semibold text-brand-600">
                                                    Rp {hargaJual.toLocaleString('id-ID')}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-right">
                                                    Rp {subtotal.toLocaleString('id-ID')}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-center">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        className="!p-1.5 text-error-600 border-error-300 hover:bg-error-50"
                                                        onClick={() => handleRemoveDetail(index)}
                                                    >
                                                        <TrashBinIcon className="size-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="mt-8 text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 dark:bg-transparent dark:border-gray-700">
                            <p className="text-gray-500">Keranjang belanja kosong.</p>
                        </div>
                    )}
                </ComponentCard>

                {details.length > 0 && (
                    <ComponentCard title="Pembayaran">
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Subtotal (Estimasi):</span>
                                <span className="font-medium">Rp {calculateSubtotal().toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">PPN (10%):</span>
                                <span className="font-medium">Rp {calculatePPN().toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between border-t pt-3 dark:border-gray-700 mt-2">
                                <span className="text-xl font-bold text-gray-800 dark:text-white">Total Akhir:</span>
                                <span className="text-xl font-bold text-brand-600 dark:text-brand-500">
                                    Rp {calculateTotal().toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>
                    </ComponentCard>
                )}

                {error && (
                    <div className="p-4 bg-error-50 border border-error-500 rounded-lg dark:bg-error-500/15">
                        <div className="flex items-center gap-2 text-error-700 dark:text-error-400 font-medium mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                                <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                            </svg>
                            Gagal Menyimpan
                        </div>
                        <p className="text-sm text-error-600 dark:text-error-400 ml-7">{error}</p>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/penjualan')}
                        disabled={loading}
                    >
                        Batal & Keluar
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={loading || details.length === 0 || !idMargin}
                        className="min-w-[150px]"
                    >
                        {loading ? 'Memproses...' : 'Simpan Penjualan'}
                    </Button>
                </div>
            </form>
        </>
    );
}