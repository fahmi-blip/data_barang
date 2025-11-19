// src/pages/Penjualan/TambahPenerimaan.tsx
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
import { TrashBinIcon } from "../../icons";

import { fetchPengadaanData, fetchBarangActiveData } from "../../services/DataMasterServices";
import { ViewPengadaan, ViewBarangAktif } from "../../types/data";

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

export default function TambahPenerimaanPage() {
    // State untuk Header
    const [idPengadaan, setIdPengadaan] = useState('');
    
    // State untuk Detail Items
    const [detailItems, setDetailItems] = useState<DetailItem[]>([]);
    
    // State untuk Form Input Detail
    const [selectedBarang, setSelectedBarang] = useState('');
    const [jumlahTerima, setJumlahTerima] = useState<number>(0);
    const [hargaSatuan, setHargaSatuan] = useState<number>(0);
    
    // State untuk Dropdown Options
    const [pengadaanOptions, setPengadaanOptions] = useState<SelectOption[]>([]);
    const [barangOptions, setBarangOptions] = useState<SelectOption[]>([]);
    const [barangList, setBarangList] = useState<ViewBarangAktif[]>([]);
    
    // State untuk Loading dan Error
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const navigate = useNavigate();

    useEffect(() => {
        const loadInitialData = async () => {
            setLoadingData(true);
            try {
                const [pengadaans, barangs] = await Promise.all([
                    fetchPengadaanData(),
                    fetchBarangActiveData()
                ]);

                // Filter pengadaan dengan status = 1
                const pengadaanOpts = pengadaans
                    .filter(p => Number(p.status) === 1)
                    .map(p => ({
                        value: String(p.idpengadaan),
                        label: `ID: ${p.idpengadaan} - ${p.nama_vendor} (${p.tanggal_pengadaan})`
                    }));
                setPengadaanOptions(pengadaanOpts);

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

    useEffect(() => {
        if (selectedBarang) {
            const barang = barangList.find(b => String(b.idbarang) === selectedBarang);
            if (barang && barang.harga) {
                setHargaSatuan(barang.harga);
            }
        }
    }, [selectedBarang, barangList]);

    const handleAddItem = () => {
        if (!selectedBarang) {
            setError("Pilih barang terlebih dahulu!");
            return;
        }
        if (jumlahTerima <= 0) {
            setError("Jumlah terima harus lebih dari 0!");
            return;
        }
        if (hargaSatuan <= 0) {
            setError("Harga satuan harus lebih dari 0!");
            return;
        }

        const barang = barangList.find(b => String(b.idbarang) === selectedBarang);
        if (!barang) {
            setError("Barang tidak ditemukan!");
            return;
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
        setSelectedBarang('');
        setJumlahTerima(0);
        setHargaSatuan(0);
        setError(null);
    };

    const handleRemoveItem = (id: string) => {
        setDetailItems(detailItems.filter(item => item.id !== id));
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

        try {
            // Simpan ke API (sesuaikan dengan endpoint yang ada)
            // await addPenerimaanData({ idpengadaan: parseInt(idPengadaan), items: detailItems });
            alert('Penerimaan berhasil ditambahkan!');
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
                <ComponentCard title="Informasi Penerimaan">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="pengadaan">Pengadaan *</Label>
                            <Select
                                id="pengadaan"
                                options={pengadaanOptions}
                                value={idPengadaan}
                                onChange={(value) => setIdPengadaan(value)}
                                placeholder="Pilih Pengadaan"
                                required
                                disabled={loading || pengadaanOptions.length === 0}
                                className="dark:bg-gray-900"
                            />
                        </div>
                    </div>
                </ComponentCard>

                <ComponentCard title="Tambah Item Barang Diterima">
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
                            <Label htmlFor="harga">Harga Satuan *</Label>
                            <Input
                                id="harga"
                                type="number"
                                value={hargaSatuan || ''}
                                onChange={(e) => setHargaSatuan(parseFloat(e.target.value) || 0)}
                                placeholder="0"
                                disabled={loading}
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
                                Tambah Item
                            </Button>
                        </div>
                    </div>
                </ComponentCard>

                <ComponentCard title="Daftar Barang Diterima">
                    {detailItems.length === 0 ? (
                        <p className="text-center py-10 text-gray-500 dark:text-gray-400">
                            Belum ada item barang. Tambahkan item di atas.
                        </p>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                            <div className="max-w-full overflow-x-auto">
                                <Table className="w-full">
                                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                        <TableRow>
                                            <TableCell isHeader className="px-5 py-3">Nama Barang</TableCell>
                                            <TableCell isHeader className="px-5 py-3 text-right">Harga Satuan</TableCell>
                                            <TableCell isHeader className="px-5 py-3 text-right">Jumlah Terima</TableCell>
                                            <TableCell isHeader className="px-5 py-3 text-right">Sub Total</TableCell>
                                            <TableCell isHeader className="px-5 py-3 text-center">Aksi</TableCell>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                        {detailItems.map((item) => (
                                            <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                                <TableCell className="px-5 py-4">{item.nama_barang}</TableCell>
                                                <TableCell className="px-5 py-4 text-right">
                                                    Rp {item.harga_satuan_terima.toLocaleString('id-ID')}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-right">{item.jumlah_terima}</TableCell>
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
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </ComponentCard>

                <ComponentCard title="Ringkasan">
                    <div className="space-y-3">
                        <div className="flex justify-between text-lg font-semibold">
                            <span>Total:</span>
                            <span className="text-brand-600 dark:text-brand-400">
                                Rp {calculateTotal().toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-error-50 border border-error-500 rounded-lg dark:bg-error-500/15">
                            <p className="text-sm text-error-500 dark:text-error-400">{error}</p>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/penerimaan')}
                            disabled={loading}
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            onClick={handleSubmit}
                            disabled={loading || detailItems.length === 0}
                        >
                            {loading ? 'Menyimpan...' : 'Simpan Penerimaan'}
                        </Button>
                    </div>
                </ComponentCard>
            </div>
        </>
    );
}