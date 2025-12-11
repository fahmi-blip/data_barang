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

import { addPengadaanData, fetchVendorData, fetchBarangActiveData } from "../../services/DataMasterServices";
import { Vendor } from "../../types/data";
import { ViewBarangAktif } from "../../types/data";

interface SelectOption {
    value: string;
    label: string;
}

interface DetailItem {
    id: string; 
    idbarang: number;
    nama_barang: string;
    harga_satuan: number;
    jumlah: number;
    sub_total: number;
}

export default function TambahPengadaanPage() {
    const [idVendor, setIdVendor] = useState('');
    const [ppn, setPpn] = useState(10); 
    const [detailItems, setDetailItems] = useState<DetailItem[]>([]);
    const [selectedBarang, setSelectedBarang] = useState('');
    const [jumlah, setJumlah] = useState<number>(0);
    const [hargaSatuan, setHargaSatuan] = useState<number>(0);
    const [vendorOptions, setVendorOptions] = useState<SelectOption[]>([]);
    const [barangOptions, setBarangOptions] = useState<SelectOption[]>([]);
    const [barangList, setBarangList] = useState<ViewBarangAktif[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const navigate = useNavigate();
    useEffect(() => {
        const loadInitialData = async () => {
            setLoadingData(true);
            try {
                const [vendors, barangs] = await Promise.all([
                    fetchVendorData(),
                    fetchBarangActiveData()
                ]);

                const vendorOpts = vendors
                    .filter(v => Number(v.status) === 1)
                    .map(v => ({ value: String(v.idvendor), label: v.nama_vendor }));
                setVendorOptions(vendorOpts);

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
        if (jumlah <= 0) {
            setError("Jumlah harus lebih dari 0!");
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
            harga_satuan: hargaSatuan,
            jumlah: jumlah,
            sub_total: hargaSatuan * jumlah
        };

        setDetailItems([...detailItems, newItem]);
        
        setSelectedBarang('');
        setJumlah(0);
        setHargaSatuan(0);
        setError(null);
    };

    const handleRemoveItem = (id: string) => {
        setDetailItems(detailItems.filter(item => item.id !== id));
    };

    const calculateSubtotal = () => {
        return detailItems.reduce((sum, item) => sum + item.sub_total, 0);
    };

    const calculatePPN = () => {
        return (calculateSubtotal() * ppn) / 100;
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculatePPN();
    };

    const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    if (!idVendor) {
        setError("Vendor wajib dipilih!");
        setLoading(false);
        return;
    }

    if (detailItems.length === 0) {
        setError("Minimal harus ada 1 item barang!");
        setLoading(false);
        return;
    }

    const subtotal = calculateSubtotal();
    const ppnValue = (subtotal * ppn) / 100;

    const dataToSend = {
        user_id: 1, 
        vendor_id: parseInt(idVendor),
        subtotal_nilai: subtotal,
        ppn: ppnValue,
        details: detailItems.map(item => ({
            idbarang: item.idbarang,
            jumlah: item.jumlah,
            harga_satuan: item.harga_satuan
        }))
    };

    console.log("📤 Data yang akan dikirim:", JSON.stringify(dataToSend, null, 2));

    try {
        const response = await fetch('http://localhost:8000/api/v1/pengadaan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Gagal menyimpan pengadaan');
        }

        console.log("✅ Response dari server:", result);
        
        alert(`Pengadaan berhasil ditambahkan!\nID Pengadaan: ${result.data.idpengadaan}`);
        navigate('/pengadaan');
        
    } catch (err: any) {
        console.error("❌ Error:", err);
        setError(err.message || "Terjadi kesalahan saat menyimpan.");
    } finally {
        setLoading(false);
    }
};

    if (loadingData) {
        return (
            <>
                <PageMeta title="Tambah Pengadaan" description=""/>
                <PageBreadcrumb pageTitle="Tambah Pengadaan Baru" />
                <ComponentCard title="Memuat Data...">
                    <p className="text-center py-10">Memuat data vendor dan barang...</p>
                </ComponentCard>
            </>
        );
    }

    return (
        <>
            <PageMeta title="Tambah Pengadaan" description=""/>
            <PageBreadcrumb pageTitle="Tambah Pengadaan Baru" />
            
            <div className="space-y-6">
                <ComponentCard title="Informasi Pengadaan">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="vendor">Vendor *</Label>
                            <Select
                                id="vendor"
                                options={vendorOptions}
                                value={idVendor}
                                onChange={(value) => setIdVendor(value)}
                                placeholder="Pilih Vendor"
                                required
                                disabled={loading || vendorOptions.length === 0}
                                className="dark:bg-gray-900"
                            />
                        </div>
                        
                        <div>
                            <Label htmlFor="ppn">PPN (%)</Label>
                            <Input
                                id="ppn"
                                type="number"
                                value={ppn}
                                onChange={(e) => setPpn(parseFloat(e.target.value) || 0)}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>
                </ComponentCard>

                <ComponentCard title="Tambah Item Barang">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <Label htmlFor="barang">Barang *</Label>
                            <Select
                                id="barang"
                                options={barangOptions}
                                value={selectedBarang}
                                onChange={(value) => setSelectedBarang(value)}
                                placeholder="Pilih Barang"
                                disabled={loading || barangOptions.length === 0}
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
                            <Label htmlFor="jumlah">Jumlah *</Label>
                            <Input
                                id="jumlah"
                                type="number"
                                value={jumlah || ''}
                                onChange={(e) => setJumlah(parseInt(e.target.value) || 0)}
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

                <ComponentCard title="Daftar Barang">
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
                                            <TableCell isHeader className="px-5 py-3 text-right">Jumlah</TableCell>
                                            <TableCell isHeader className="px-5 py-3 text-right">Sub Total</TableCell>
                                            <TableCell isHeader className="px-5 py-3 text-center">Aksi</TableCell>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                        {detailItems.map((item) => (
                                            <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                                <TableCell className="px-5 py-4">{item.nama_barang}</TableCell>
                                                <TableCell className="px-5 py-4 text-right">
                                                    Rp {item.harga_satuan.toLocaleString('id-ID')}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-right">{item.jumlah}</TableCell>
                                                <TableCell className="px-5 py-4 text-right">
                                                    Rp {item.sub_total.toLocaleString('id-ID')}
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
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                            <span className="font-medium">Rp {calculateSubtotal().toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">PPN ({ppn}%):</span>
                            <span className="font-medium">Rp {calculatePPN().toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-lg font-semibold pt-3 border-t border-gray-200 dark:border-gray-700">
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
                            onClick={() => navigate('/pengadaan')}
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
                            {loading ? 'Menyimpan...' : 'Simpan Pengadaan'}
                        </Button>
                    </div>
                </ComponentCard>
            </div>
        </>
    );
}