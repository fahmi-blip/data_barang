// src/pages/master/Barang.tsx
import { useEffect, useState } from "react"; // Tambahkan FormEvent
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta"; // <-- Pastikan PageMeta diimpor
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { PlusIcon, PencilIcon, TrashBinIcon } from "../../icons"; // <-- Pastikan ikon diimpor
import { ViewBarang,ViewBarangAktif, StatusToko } from "../../types/data";
import {
    fetchBarangAllData,
    fetchBarangActiveData,
    deleteBarangData,
} from "../../services/DataMasterServices";

export default function BarangPage() {
    const navigate = useNavigate();
    const [barangList, setBarangList] = useState<(ViewBarang | ViewBarangAktif ) []>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'active'>('active');

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            if (filter === 'active') {
                const data: ViewBarangAktif[] = await fetchBarangActiveData();
                setBarangList(data);
            } else {
                const data: ViewBarang[] = await fetchBarangAllData();
                setBarangList(data);
            }
            
        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan saat memuat data.");
            console.error("Load Data Error:", err);
            setBarangList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [filter]);

    const renderStatusBadge = (status: StatusToko) => (
        <Badge size="sm" color={status === 1 ? "success" : "error"}>
            {status === 1 ? "Aktif" : "Nonaktif"}
        </Badge>
    );
    const handleDelete = async (id: number, nama: string) => {
    if (!confirm(`Hapus barang "${nama}"?`)) return;

    try {
        await deleteBarangData(id);
        alert("Berhasil menghapus barang!");
        loadData();
    } catch (error: any) {
        alert(error.message || "Gagal menghapus barang.");
    }
};

 const toggleFilter = () => {
        setFilter(prev => (prev === "active" ? "all" : "active"));
    };

    return (
        <>
            <PageMeta title="Data Barang" description="Halaman mengelola data master barang." />
            <PageBreadcrumb pageTitle="Data Barang" />

            <div className="space-y-6">
                <ComponentCard title="Daftar Barang">
                    <div className="flex justify-end mb-4  ">
                        <Button
                            size="sm"
                            variant="primary"
                            onClick={() => navigate('/barang/tambah')}>
                            Tambah Barang Baru
                        </Button>
                        <Button
                            size="sm"
                            variant={filter === 'active' ? 'primary' : 'outline'}
                            onClick={toggleFilter} >
                            {filter === 'active' ? 'Tampilkan Semua' : 'Tampilkan Aktif'}
                        </Button>
                        
                    </div>

                    {loading && <p className="text-center py-10 text-gray-500 dark:text-gray-400">Memuat data barang...</p>}

                    {!loading && error && (
                         <div className="p-4 bg-error-50 border border-error-500 rounded-lg dark:bg-error-500/15">
                             <p className="font-semibold text-error-700 dark:text-error-400">Gagal Memuat Data</p>
                             <p className="text-sm text-error-600 dark:text-error-500 mt-1">{error}</p>
                             <Button size="sm" variant="outline" onClick={loadData} className="mt-3">Coba Lagi</Button>
                         </div>
                    )}

                    {!loading && !error && (
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                            <div className="max-w-full overflow-x-auto">
                                <Table className="w-full">
                                    <TableHeader className="border-b border-gray-100 bg-white dark:border-white/[0.05] dark:bg-gray-800">
                                        {filter === "active" ? (
                                            <TableRow>
                                                <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">ID</TableCell>
                                                <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Nama Barang</TableCell>
                                                <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Satuan</TableCell>
                                                
                                            </TableRow>
                                        ) : (
                                            <TableRow>
                                                <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">ID</TableCell>
                                                <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Nama Barang</TableCell>
                                                <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Jenis</TableCell>
                                                <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Satuan</TableCell>
                                                <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Harga</TableCell>
                                                <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Status</TableCell>
                                                <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Aksi</TableCell>
                                            </TableRow>
                                        )}
                                    </TableHeader>

                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                        {barangList.length === 0 ? (
                                            <TableRow className="hover:bg-gray-50 dark:hover:bg-white/5">
                                                <TableCell
                                                    colSpan={filter === "all" ? 3 : 6}
                                                    className="px-5 py-6 text-center text-gray-500 dark:text-gray-400"
                                                >
                                                    Tidak ada data barang.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            barangList.map((item: any) =>
                                                filter === "active" ? (
                                                    <TableRow key={item.idbarang} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                                        <TableCell className="px-5 py-4 text-sm">{item.idbarang}</TableCell>
                                                        <TableCell className="px-5 py-4 text-sm">{item.nama}</TableCell>
                                                        <TableCell className="px-5 py-4 text-sm">{item.nama_satuan || "-"}</TableCell>
                                                    </TableRow>
                                                ) : (
                                                    <TableRow key={item.idbarang} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                                        <TableCell className="px-5 py-4 text-sm">{item.idbarang}</TableCell>
                                                        <TableCell className="px-5 py-4 text-sm">{item.nama}</TableCell>
                                                        <TableCell className="px-5 py-4 text-sm">{item.jenis === "B" ? "Barang" : "Jasa"}</TableCell>
                                                        <TableCell className="px-5 py-4 text-sm">{item.nama_satuan || "-"}</TableCell>
                                                        <TableCell className="px-5 py-4 text-sm">{item.harga}</TableCell>
                                                        <TableCell className="px-5 py-4 text-sm">{renderStatusBadge(item.status)}</TableCell>
                                                        <TableCell className="px-5 py-4 text-sm">
                                                            <div className="flex justify-center gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="!p-1.5"
                                                                    onClick={() => navigate(`/barang/edit/${item.idbarang}`)}
                                                                >
                                                                    <PencilIcon className="size-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="!p-1.5 text-error-600 border-error-300 hover:bg-error-50"
                                                                    onClick={() => handleDelete(item.idbarang, item.nama)}
                                                                >
                                                                    <TrashBinIcon className="size-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </ComponentCard>
            </div>

        </>
    );
}