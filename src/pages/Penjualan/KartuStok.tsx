import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Select from "../../components/form/Select";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge"; 
import { 
    fetchBarangActiveData, 
    fetchKartuStokByBarang 
} from "../../services/DataMasterServices";
import { ViewBarangAktif, ViewKartuStok } from "../../types/data";

interface KartuStokItem {
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

interface SelectOption {
    value: string;
    label: string;
}

export default function KartuStokPage() {
    // State
    const [selectedBarang, setSelectedBarang] = useState('');
    const [barangOptions, setBarangOptions] = useState<SelectOption[]>([]);
    const [kartuStokData, setKartuStokData] = useState<KartuStokItem[]>([]);
    
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadBarang = async () => {
            setLoading(true);
            try {
                const barangs = await fetchBarangActiveData();
                const options = barangs.map(b => ({
                    value: String(b.idbarang),
                    label: `${b.nama} (${b.nama_satuan})` 
                }));
                setBarangOptions(options);
            } catch (err: any) {
                setError("Gagal memuat data barang: " + err.message);
            } finally {
                setLoading(false);
            }
        };
        loadBarang();
    }, []);

    useEffect(() => {
        const loadKartuStok = async () => {
            if (!selectedBarang) {
                setKartuStokData([]);
                return;
            }

            setLoadingData(true);
            setError(null);
            try {
                const data = await fetchKartuStokByBarang(parseInt(selectedBarang));
                setKartuStokData(data);
            } catch (err: any) {
                console.error(err);
                setError("Gagal memuat kartu stok. Pastikan barang dipilih atau server aktif.");
                setKartuStokData([]);
            } finally {
                setLoadingData(false);
            }
        };

        loadKartuStok();
    }, [selectedBarang]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTransactionBadge = (jenis: string) => {
        const jenisLower = jenis.toLowerCase();
        if (jenisLower.includes('penerimaan') || jenisLower.includes('masuk')) {
            return <span className="inline-flex rounded-full bg-success-50 px-2 py-1 text-xs font-medium text-success-600 ring-1 ring-inset ring-success-500/10">Masuk</span>;
        } else if (jenisLower.includes('penjualan') || jenisLower.includes('keluar')) {
            return <span className="inline-flex rounded-full bg-error-50 px-2 py-1 text-xs font-medium text-error-600 ring-1 ring-inset ring-error-500/10">Keluar</span>;
        }
        return <span className="inline-flex rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">{jenis}</span>;
    };

    return (
        <>
            <PageMeta title="Kartu Stok" description="Riwayat pergerakan stok barang" />
            <PageBreadcrumb pageTitle="Kartu Stok Barang" />

            <div className="space-y-6">
                
                <ComponentCard title="Filter Barang">
                    <div className="max-w-lg">
                        <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-white">
                            Pilih Barang
                        </label>
                        <Select
                            options={barangOptions}
                            value={selectedBarang}
                            onChange={(val) => setSelectedBarang(val)}
                            placeholder="Cari dan pilih barang..."
                            disabled={loading}
                            className="dark:bg-gray-900"
                        />
                        <p className="mt-2 text-xs text-gray-500">
                            Pilih barang untuk melihat riwayat keluar masuk stok.
                        </p>
                    </div>
                </ComponentCard>

                <ComponentCard title={selectedBarang ? "Riwayat Transaksi" : "Data Kosong"}>
                    {error && (
                        <div className="mb-4 p-4 bg-error-50 border border-error-300 rounded-lg text-error-700 text-sm">
                            {error}
                        </div>
                    )}

                    {!selectedBarang ? (
                        <div className="py-10 text-center text-gray-500 dark:text-gray-400">
                            <p className="text-lg font-medium">Belum ada barang yang dipilih.</p>
                            <p className="text-sm">Silakan pilih barang pada form di atas.</p>
                        </div>
                    ) : loadingData ? (
                        <div className="py-10 text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status"></div>
                            <p className="mt-2 text-gray-500">Memuat data stok...</p>
                        </div>
                    ) : kartuStokData.length === 0 ? (
                        <div className="py-10 text-center text-gray-500 dark:text-gray-400">
                            <p>Tidak ada riwayat transaksi untuk barang ini.</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                            <Table className="w-full">
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white[0.03]">
                                    <TableRow>
                                        <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-white">Tanggal</TableCell>
                                        <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-white">Jenis Transaksi</TableCell>
                                        <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium  dark:text-white text-success-600">Masuk</TableCell>
                                        <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium  dark:text-white text-error-600">Keluar</TableCell>
                                        <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-white">Sisa Stok</TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                    {kartuStokData.map((item, index) => (
                                        <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                            <TableCell className="px-5 py-4 text-sm text-center text-gray-600 dark:text-gray-300">
                                                {formatDate(item.created_at)}
                                            </TableCell>
                                            <TableCell className="px-5 py-4  text-center text-sm font-medium">
                                                {getTransactionBadge(item.jenis_transaksi)}
                                               </TableCell>
                                            <TableCell className="px-5 py-4 text-center font-medium text-sm text-success-600">
                                                {item.masuk > 0 ? `+${item.masuk}` : '-'}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-center font-medium text-sm text-error-600">
                                                {item.keluar > 0 ? `-${item.keluar}` : '-'}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-center text-sm font-bold text-brand-600 dark:text-brand-400 bg-gray-50/30 dark:bg-white/5">
                                                {item.stock}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </ComponentCard>
            </div>
        </>
    );
}