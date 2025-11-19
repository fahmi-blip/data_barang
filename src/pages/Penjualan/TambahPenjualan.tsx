// src/pages/Penjualan/TambahPenjualan.tsx - Form dengan Function Hitung Harga
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

export default function TambahPenjualanPage() {
    const navigate = useNavigate();
    
    const [idMargin, setIdMargin] = useState('');
    const [persenMargin, setPersenMargin] = useState(0);
    const [marginOptions, setMarginOptions] = useState<SelectOption[]>([]);
    const [barangOptions, setBarangOptions] = useState<SelectOption[]>([]);
    
    const [details, setDetails] = useState<DetailItem[]>([]);
    const [selectedBarang, setSelectedBarang] = useState('');
    const [jumlah, setJumlah] = useState(0);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    // Update persentase margin saat margin dipilih
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

    const handleAddDetail = () => {
        if (!selectedBarang || jumlah <= 0) {
            alert("Pilih barang dan isi jumlah yang valid");
            return;
        }

        const barangOption = barangOptions.find(b => b.value === selectedBarang);
        if (!barangOption) return;

        // Extract harga beli dari label
        const hargaBeliStr = barangOption.label.split('Rp ')[1]?.replace(/,/g, '');
        const hargaBeli = parseInt(hargaBeliStr) || 0;

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

    // Hitung harga jual menggunakan function (simulasi di frontend)
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
        return Math.round(calculateSubtotal() * 0.11); // PPN 11%
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculatePPN();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!idMargin) {
            setError("Margin penjualan wajib dipilih");
            return;
        }
        
        if (details.length === 0) {
            setError("Tambahkan minimal 1 item barang");
            return;
        }

        setLoading(true);
        setError(null);

        const dataToSubmit: NewPenjualanData = {
            iduser: 1, // Ganti dengan ID user yang login
            idmargin_penjualan: parseInt(idMargin),
            details: details.map(d => ({
                idbarang: d.idbarang,
                jumlah: d.jumlah
            }))
        };

        try {
            const result = await addPenjualanData(dataToSubmit);
            alert(`Penjualan berhasil ditambahkan!\nID: ${result.data.idpenjualan}\nHarga dihitung otomatis menggunakan function database dengan margin ${persenMargin}%\nKartu stok telah diupdate otomatis.`);
            navigate('/penjualan');
        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan saat menyimpan");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <PageMeta title="Tambah Penjualan" description=""/>
            <PageBreadcrumb pageTitle="Tambah Transaksi Penjualan" />
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <ComponentCard title="Informasi Penjualan">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="margin">Margin Penjualan</Label>
                            <Select
                                id="margin"
                                options={marginOptions}
                                value={idMargin}
                                onChange={(value) => setIdMargin(value)}
                                placeholder="Pilih Margin"
                                required
                                disabled={loading}
                                className="dark:bg-gray-900 mt-1.5"
                            />
                        </div>
                        {persenMargin > 0 && (
                            <div className="p-3 bg-success-50 border border-success-300 rounded-lg dark:bg-success-500/10">
                                <p className="text-sm text-success-700 dark:text-success-400">
                                    ✓ Harga jual akan dihitung otomatis dengan margin <strong>{persenMargin}%</strong> menggunakan function database <code>fn_hitung_harga_jual()</code>
                                </p>
                            </div>
                        )}
                    </div>
                </ComponentCard>

                <ComponentCard title="Barang yang Dijual">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <Label htmlFor="barang">Barang</Label>
                            <Select
                                id="barang"
                                options={barangOptions}
                                value={selectedBarang}
                                onChange={(value) => setSelectedBarang(value)}
                                placeholder="Pilih Barang"
                                disabled={loading || !idMargin}
                                className="dark:bg-gray-900 mt-1.5"
                            />
                        </div>
                        <div>
                            <Label htmlFor="jumlah">Jumlah</Label>
                            <Input
                                id="jumlah"
                                type="number"
                                value={jumlah}
                                onChange={(e) => setJumlah(parseInt(e.target.value) || 0)}
                                min="1"
                                disabled={loading || !idMargin}
                                className="mt-1.5"
                            />
                        </div>
                        <div className="flex items-end">
                            <Button
                                type="button"
                                variant="primary"
                                onClick={handleAddDetail}
                                disabled={loading || !idMargin}
                                startIcon={<PlusIcon className="size-4" />}
                            >
                                Tambah
                            </Button>
                        </div>
                    </div>

                    {details.length > 0 && (
                        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                            <Table className="w-full">
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow>
                                        <TableCell isHeader className="px-5 py-3">Nama Barang</TableCell>
                                        <TableCell isHeader className="px-5 py-3 text-right">Jumlah</TableCell>
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
                                            <TableRow key={index}>
                                                <TableCell className="px-5 py-4">{item.nama_barang}</TableCell>
                                                <TableCell className="px-5 py-4 text-right">{item.jumlah}</TableCell>
                                                <TableCell className="px-5 py-4 text-right">
                                                    Rp {item.harga_beli.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-right font-medium text-success-600">
                                                    Rp {hargaJual.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-right">
                                                    Rp {subtotal.toLocaleString()}
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
                    )}
                </ComponentCard>

                {details.length > 0 && (
                    <ComponentCard title="Ringkasan">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                                <span className="font-medium">Rp {calculateSubtotal().toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">PPN (11%):</span>
                                <span className="font-medium">Rp {calculatePPN().toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2 dark:border-gray-700">
                                <span className="text-lg font-semibold">Total:</span>
                                <span className="text-lg font-bold text-brand-500">
                                    Rp {calculateTotal().toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </ComponentCard>
                )}

                {error && (
                    <div className="p-4 bg-error-50 border border-error-500 rounded-lg dark:bg-error-500/15">
                        <p className="text-sm text-error-600 dark:text-error-400">{error}</p>
                    </div>
                )}

                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/penjualan')}
                        disabled={loading}
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={loading || details.length === 0 || !idMargin}
                    >
                        {loading ? 'Menyimpan...' : 'Simpan Penjualan'}
                    </Button>
                </div>
            </form>
        </>
    );
}