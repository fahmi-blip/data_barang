// src/pages/Penjualan/TambahPenerimaan.tsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { TrashBinIcon } from "../../icons";

import { 
    fetchPengadaanData, 
    fetchBarangActiveData, 
    fetchDetailPengadaanData,
    addPenerimaanData
} from "../../services/DataMasterServices";
import { ViewBarangAktif, ViewDetailPengadaan } from "../../types/data";

interface SelectOption {
    value: string;
    label: string;
}

interface DetailItem {
    id: string;
    idbarang: number;
    nama_barang: string;
    jumlah_terima: number;
    harga_satuan_terima: number;
    sub_total_terima: number;
}

// Key untuk Local Storage
const STORAGE_KEY = "penerimaan_draft";

export default function TambahPenerimaanPage() {
    const navigate = useNavigate();

    // --- State ---
    
    // 1. Load Draft dari Local Storage saat inisialisasi
    const loadDraft = () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Gagal load draft", e);
            }
        }
        return { idPengadaan: '', detailItems: [] };
    };

    const initialDraft = loadDraft();

    const [idPengadaan, setIdPengadaan] = useState<string>(initialDraft.idPengadaan);
    const [detailItems, setDetailItems] = useState<DetailItem[]>(initialDraft.detailItems);
    
    // State Data Master
    const [pengadaanOptions, setPengadaanOptions] = useState<SelectOption[]>([]);
    const [barangOptions, setBarangOptions] = useState<SelectOption[]>([]);
    const [barangList, setBarangList] = useState<ViewBarangAktif[]>([]);
    
    // State Data Referensi (Detail Pengadaan untuk Validasi)
    const [refDetailPengadaan, setRefDetailPengadaan] = useState<ViewDetailPengadaan[]>([]);
    
    // State Form Input
    const [selectedBarang, setSelectedBarang] = useState('');
    const [jumlahTerima, setJumlahTerima] = useState<number>(0);
    const [hargaSatuan, setHargaSatuan] = useState<number>(0);
    
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Effects ---

    // 2. Auto-Save ke Local Storage setiap ada perubahan data
    useEffect(() => {
        const dataToSave = {
            idPengadaan,
            detailItems
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }, [idPengadaan, detailItems]);

    // Load Initial Data (Master)
    useEffect(() => {
        const loadInitialData = async () => {
            setLoadingData(true);
            try {
                const [pengadaans, barangs, allDetails] = await Promise.all([
                    fetchPengadaanData(),
                    fetchBarangActiveData(),
                    fetchDetailPengadaanData()
                ]);

                // Filter pengadaan status = 1 (Aktif)
                const pengadaanOpts = pengadaans
                    .filter(p => Number(p.status) === 1)
                    .map(p => ({
                        value: String(p.idpengadaan),
                        label: `ID: ${p.idpengadaan} - ${p.nama_vendor} (${p.tanggal_pengadaan})`
                    }));
                setPengadaanOptions(pengadaanOpts);

                // Simpan semua detail pengadaan untuk referensi validasi nanti
                setRefDetailPengadaan(allDetails);

                const barangOpts = barangs.map(b => ({
                    value: String(b.idbarang),
                    label: `${b.nama} (${b.nama_satuan})`
                }));
                setBarangOptions(barangOpts);
                setBarangList(barangs);

            } catch (err: any) {
                setError("Gagal memuat data: " + err.message);
            } finally {
                setLoadingData(false);
            }
        };
        loadInitialData();
    }, []);

    // Auto-fill harga saat barang dipilih
    useEffect(() => {
        if (selectedBarang) {
            const barang = barangList.find(b => String(b.idbarang) === selectedBarang);
            if (barang && barang.harga) {
                setHargaSatuan(barang.harga);
            }
        }
    }, [selectedBarang, barangList]);

    // --- Helpers & Logic ---

    // Ambil detail target berdasarkan Pengadaan yang dipilih
    const targetItems = useMemo(() => {
        if (!idPengadaan) return [];
        return refDetailPengadaan.filter(d => String(d.idpengadaan) === idPengadaan);
    }, [idPengadaan, refDetailPengadaan]);

    // Cek apakah item yang diterima sudah sesuai dengan pengadaan
    const validatePenerimaan = () => {
        if (targetItems.length === 0) return { valid: false, message: "Data detail pengadaan tidak ditemukan." };

        // 1. Cek Jumlah Item Unik
        // Note: Ini validasi sederhana. Idealnya kita grouping by idbarang.
        // Disini kita asumsikan user menginput barang yang sama hanya sekali di tabel penerimaan.
        
        for (const target of targetItems) {
            // Cari barang ini di daftar terima (match by Nama karena view detail pengadaan mungkin tidak ada idbarang eksplisit di tipe data Anda, sesuaikan jika ada)
            // Best practice: gunakan ID. Jika ViewDetailPengadaan belum punya idbarang, gunakan nama sebagai fallback.
            const receivedItem = detailItems.find(d => d.nama_barang === target.nama_barang); 
            
            if (!receivedItem) {
                return { valid: false, message: `Barang "${target.nama_barang}" belum ada di daftar terima.` };
            }

            if (receivedItem.jumlah_terima !== target.jumlah) {
                return { 
                    valid: false, 
                    message: `Jumlah "${target.nama_barang}" tidak sesuai. Dipesan: ${target.jumlah}, Diterima: ${receivedItem.jumlah_terima}` 
                };
            }
        }

        if (detailItems.length > targetItems.length) {
             return { valid: false, message: "Ada barang di penerimaan yang tidak ada di pesanan pengadaan." };
        }

        return { valid: true, message: "Semua barang sesuai." };
    };

    // --- Handlers ---

    const handleAddItem = () => {
        if (!selectedBarang) return setError("Pilih barang terlebih dahulu!");
        if (jumlahTerima <= 0) return setError("Jumlah terima harus lebih dari 0!");
        
        const barang = barangList.find(b => String(b.idbarang) === selectedBarang);
        if (!barang) return setError("Barang tidak ditemukan!");

        // Validasi: Apakah barang ini ada di Pengadaan yang dipilih?
        if (idPengadaan) {
            const isInOrder = targetItems.find(t => t.nama_barang === barang.nama);
            if (!isInOrder) {
                // Optional: Block user atau sekedar warning
                if(!confirm(`Peringatan: Barang "${barang.nama}" sepertinya tidak ada dalam detail Pengadaan ID ${idPengadaan}. Lanjutkan?`)) {
                    return;
                }
            } else {
                // Cek jumlah over
                const currentQty = isInOrder.jumlah;
                if (jumlahTerima > currentQty) {
                     if(!confirm(`Peringatan: Jumlah terima (${jumlahTerima}) melebihi jumlah pesan (${currentQty}) untuk "${barang.nama}". Lanjutkan?`)) {
                        return;
                    }
                }
            }
        }

        const newItem: DetailItem = {
            id: `temp-${Date.now()}`,
            idbarang: barang.idbarang,
            nama_barang: barang.nama,
            jumlah_terima: jumlahTerima,
            harga_satuan_terima: hargaSatuan,
            sub_total_terima: hargaSatuan * jumlahTerima
        };

        setDetailItems([...detailItems, newItem]);
        
        // Reset input kecil
        setSelectedBarang('');
        setJumlahTerima(0);
        setError(null);
    };

    const handleRemoveItem = (id: string) => {
        setDetailItems(detailItems.filter(item => item.id !== id));
    };

    const handleClearDraft = () => {
        if(confirm("Apakah Anda yakin ingin menghapus semua data draft ini?")) {
            setDetailItems([]);
            setIdPengadaan('');
            localStorage.removeItem(STORAGE_KEY);
        }
    };

    const calculateTotal = () => {
        return detailItems.reduce((sum, item) => sum + item.sub_total_terima, 0);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        if (!idPengadaan) {
            setError("Pengadaan wajib dipilih!");
            setLoading(false);
            return;
        }

        if (detailItems.length === 0) {
            setError("Minimal harus ada 1 item barang!");
            setLoading(false);
            return;
        }

        // VALIDASI FINAL "Sesuai Banyak Pengadaan"
        const validation = validatePenerimaan();
        if (!validation.valid) {
            setError("Gagal Simpan: " + validation.message);
            setLoading(false);
            return;
        }

        try {
            const dataToSend = {
                idpengadaan: parseInt(idPengadaan),
                iduser: 1, 
                details: detailItems.map(d => ({
                    barang_idbarang: d.idbarang,
                    jumlah_terima: d.jumlah_terima,
                    harga_satuan_terima: d.harga_satuan_terima
                }))
            };

            console.log("Sending Data:", dataToSend);
            
            await addPenerimaanData(dataToSend);
            
            alert('Penerimaan berhasil disimpan permanen!');
            
            localStorage.removeItem(STORAGE_KEY);
            
            navigate('/penerimaan');
        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan saat menyimpan.");
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <>
                <PageMeta title="Tambah Penerimaan" description=""/>
                <PageBreadcrumb pageTitle="Tambah Penerimaan Baru" />
                <ComponentCard title="Memuat Data...">
                    <p className="text-center py-10">Memuat data...</p>
                </ComponentCard>
            </>
        );
    }

    return (
        <>
            <PageMeta title="Tambah Penerimaan" description="" />
            <PageBreadcrumb pageTitle="Tambah Penerimaan Baru" />
            
            <div className="space-y-6">
                {/* Info Draft
                {detailItems.length > 0 && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300 flex justify-between items-center">
                        <span>
                            <strong>Mode Cicil (Draft):</strong> Data Anda tersimpan otomatis di browser. 
                            Belum masuk database sampai Anda klik "Simpan Permanen".
                        </span>
                        <Button size="sm" variant="outline" onClick={handleClearDraft} className="bg-white border-red-200 text-red-600 hover:bg-red-50">
                            Hapus Draft
                        </Button>
                    </div>
                )} */}

                <ComponentCard title="Informasi Penerimaan">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="pengadaan">Pilih Pengadaan *</Label>
                            <Select
                                id="pengadaan"
                                options={pengadaanOptions}
                                value={idPengadaan}
                                onChange={(value) => setIdPengadaan(value)}
                                placeholder="Pilih Nomor Pengadaan"
                                required
                                disabled={loading || pengadaanOptions.length === 0}
                                className="dark:bg-gray-900"
                            />
                        </div>
                        
                       {idPengadaan && targetItems.length > 0 && (
                             <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                                <h4 className="text-sm font-semibold mb-2">Target Barang dari Pengadaan Terpilih:</h4>
                                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                                    {targetItems.map((t, idx) => (
                                        <li key={idx}>
                                            {t.nama_barang}: <strong>{t.jumlah}</strong> unit
                                        </li>
                                    ))}
                                </ul>
                             </div>
                        )}
                    </div>
                </ComponentCard>

                <ComponentCard title="Input Barang Diterima (Cicil)">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <Label htmlFor="barang">Barang *</Label>
                            <Select
                                id="barang"
                                options={barangOptions}
                                value={selectedBarang}
                                onChange={(value) => setSelectedBarang(value)}
                                placeholder="Pilih Barang"
                                disabled={loading}
                                className="dark:bg-gray-900"
                            />
                        </div>
                        
                        <div>
                            <Label htmlFor="harga">Harga Satuan</Label>
                            <Input
                                id="harga"
                                type="number"
                                value={hargaSatuan || ''}
                                onChange={(e) => setHargaSatuan(parseFloat(e.target.value) || 0)}
                                placeholder="0"
                                disabled={true} 
                                className="bg-gray-100 cursor-not-allowed"
                            />
                        </div>
                        
                        <div>
                            <Label htmlFor="jumlah">Jumlah Terima *</Label>
                            <Input
                                id="jumlah"
                                type="number"
                                value={jumlahTerima || ''}
                                onChange={(e) => setJumlahTerima(parseInt(e.target.value) || 0)}
                                placeholder="0"
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="flex items-end">
                            <Button
                                type="button"
                                variant="primary"
                                size="md"
                                onClick={handleAddItem}
                                disabled={loading}
                                className="w-full"
                            >
                                Tambah ke List
                            </Button>
                        </div>
                    </div>
                </ComponentCard>

                <ComponentCard title="Daftar Barang Diterima (Draft)">
                    {detailItems.length === 0 ? (
                        <p className="text-center py-10 text-gray-500 dark:text-gray-400">
                            Belum ada item barang yang diterima.
                        </p>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                            <div className="max-w-full overflow-x-auto">
                                <Table className="w-full">
                                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                        <TableRow>
                                            <TableCell isHeader className="px-5 py-3">Nama Barang</TableCell>
                                            <TableCell isHeader className="px-5 py-3 text-right">Harga Satuan</TableCell>
                                            <TableCell isHeader className="px-5 py-3 text-right">Jml Terima</TableCell>
                                            <TableCell isHeader className="px-5 py-3 text-center">Status</TableCell>
                                            <TableCell isHeader className="px-5 py-3 text-right">Sub Total</TableCell>
                                            <TableCell isHeader className="px-5 py-3 text-center">Aksi</TableCell>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                        {detailItems.map((item) => {
                                            // Cek kesesuaian dengan target
                                            const target = targetItems.find(t => t.nama_barang === item.nama_barang);
                                            const isMatch = target ? target.jumlah === item.jumlah_terima : false;
                                            const targetQty = target ? target.jumlah : '?';

                                            return (
                                                <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                                    <TableCell className="px-5 py-4">{item.nama_barang}</TableCell>
                                                    <TableCell className="px-5 py-4 text-right">
                                                        Rp {item.harga_satuan_terima.toLocaleString('id-ID')}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-right font-semibold">
                                                        {item.jumlah_terima} / <span className="text-gray-400">{targetQty}</span>
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-center">
                                                        {isMatch ? (
                                                            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">Sesuai</span>
                                                        ) : (
                                                            <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded">Belum Sesuai</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-right">
                                                        Rp {item.sub_total_terima.toLocaleString('id-ID')}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-center">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="!p-1.5 text-error-600 border-error-300 hover:bg-error-50"
                                                            onClick={() => handleRemoveItem(item.id)}
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
                        </div>
                    )}
                </ComponentCard>

                <ComponentCard title="Penyelesaian">
                    <div className="flex justify-between items-center">
                        <div className="text-lg font-semibold">
                            <span>Total Nilai Penerimaan: </span>
                            <span className="text-brand-600 dark:text-brand-400 ml-2">
                                Rp {calculateTotal().toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-error-50 border border-error-500 rounded-lg dark:bg-error-500/15">
                            <p className="text-sm text-error-600 dark:text-error-400 font-medium">
                                ⚠️ {error}
                            </p>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/penerimaan')}
                            disabled={loading}
                        >
                            Keluar
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            onClick={handleSubmit}
                            disabled={loading || detailItems.length === 0}
                        >
                            {loading ? 'Menyimpan...' : 'Simpan Permanen'}
                        </Button>
                    </div>
                    
                </ComponentCard>
            </div>
        </>
    );
}