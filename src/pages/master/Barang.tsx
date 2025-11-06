// src/pages/master/Barang.tsx
import { useEffect, useState } from "react"; // Tambahkan FormEvent
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta"; // <-- Pastikan PageMeta diimpor
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
// import { Modal } from "../../components/ui/modal";
// import { useModal } from "../../hooks/useModal";
// import Label from "../../components/form/Label";
// import Input from "../../components/form/input/InputField";
// import Select from "../../components/form/Select";
import { PlusIcon, PencilIcon, TrashBinIcon } from "../../icons"; // <-- Pastikan ikon diimpor
import { ViewBarang,ViewBarangAktif, StatusToko } from "../../types/data";
// import { Barang} from "../../types/db"; // <-- Ganti impor ke data.d.ts jika perlu
import {
    fetchBarangAllData,
    fetchBarangActiveData,
    deleteBarangData,
    // fetchSingleBarangData,
    // updateBarangData,
    // fetchSatuanOptions // <-- Ganti nama fungsi
} from "../../services/DataMasterServices";

// Tipe untuk opsi Select
// interface SelectOption {
//     value: string;
//     label: string;
// }

// // Komponen Form Edit (didefinisikan di sini atau impor dari file lain)
// interface EditBarangFormProps {
//     initialData: Barang;
//     satuanOptions: SelectOption[];
//     onSubmit: (updatedData: Omit<Barang, 'idbarang' | 'nama_satuan'>) => Promise<void>;
//     onCancel: () => void;
//     required: boolean;
//     isSaving: boolean;
// }

// function EditBarangForm({ initialData, satuanOptions, onSubmit, onCancel, isSaving }: EditBarangFormProps) {
//     const [nama, setNama] = useState(initialData.nama || '');
//     const [jenis, setJenis] = useState(initialData.jenis || 'B');
//     // Pastikan initialData.idsatuan tidak null sebelum konversi ke string
//     const [idSatuan, setIdSatuan] = useState(initialData.idsatuan ? String(initialData.idsatuan) : '');
//     const [status, setStatus] = useState(initialData.status ?? 1); // Default ke 1 jika null/undefined
//     const [formError, setFormError] = useState<string | null>(null);

//     // Update state jika initialData berubah (misalnya, modal dibuka untuk item berbeda)
//     useEffect(() => {
//         setNama(initialData.nama || '');
//         setJenis(initialData.jenis || 'B');
//         setIdSatuan(initialData.idsatuan ? String(initialData.idsatuan) : '');
//         setStatus(initialData.status ?? 1);
//         setFormError(null); // Reset error saat data awal berubah
//     }, [initialData]);


//     const handleSubmit = async (event: FormEvent) => { // Gunakan FormEvent
//         event.preventDefault();
//         setFormError(null);
//         if (!nama || !idSatuan) {
//             setFormError('Nama Barang dan Satuan wajib diisi.');
//             return;
//         }

//         const updatedData = {
//             nama: nama,
//             jenis: jenis,
//             idsatuan: parseInt(idSatuan, 10), // Pastikan basis 10
//             status: status
//         };

//         try {
//             await onSubmit(updatedData); // Panggil fungsi onSubmit dari parent
//         } catch (err: any) {
//              // Error sudah ditangani di parent (handleUpdateBarang),
//              // tapi bisa juga set error spesifik di sini jika perlu
//              // setFormError(err.message || "Gagal menyimpan perubahan.");
//              console.error("Edit Form Submit Error:", err); // Log error
//         }
//     };

//     return (
//          // Pastikan ada return statement di sini
//         <form onSubmit={handleSubmit}>
//             <div className="space-y-4">
//                  <div>
//                     <Label htmlFor={`editNamaBarang-${initialData.idbarang}`}>Nama Barang</Label> {/* ID unik */}
//                     <Input
//                         id={`editNamaBarang-${initialData.idbarang}`}
//                         value={nama}
//                         onChange={(e) => setNama(e.target.value)}
//                         placeholder="Masukkan nama barang"
                        
//                         disabled={isSaving}
//                         className="mt-1.5"
//                     />
//                 </div>
//                  <div>
//                     <Label htmlFor={`editJenis-${initialData.idbarang}`}>Jenis</Label>
//                     <Select
//                         options={[{ value: 'B', label: 'Barang' }, { value: 'J', label: 'Jasa' }]}
//                         defaultValue={jenis}
//                         onChange={(value) => setJenis(value)}
                      
//                         className="dark:bg-gray-900 mt-1.5"
//                     />
//                 </div>
//                  <div>
//                     <Label htmlFor={`editSatuan-${initialData.idbarang}`}>Satuan</Label>
//                     <Select
//                         options={satuanOptions}
//                         defaultValue={idSatuan}
//                         onChange={(value) => setIdSatuan(value)}
//                         placeholder="Pilih Satuan"
//                         className="dark:bg-gray-900 mt-1.5"
//                     />
//                       {satuanOptions.length === 0 && <p className="text-xs text-warning-500 mt-1">Opsi satuan tidak tersedia.</p>}
//                 </div>
//                  <div>
//                     <Label htmlFor={`editStatus-${initialData.idbarang}`}>Status</Label>
//                     <Select
//                         options={[{ value: '1', label: 'Aktif' }, { value: '0', label: 'Nonaktif' }]}
//                         defaultValue={String(status)}
//                         onChange={(value) => setStatus(parseInt(value, 10) as 0 | 1)}
//                         className="dark:bg-gray-900 mt-1.5"
//                     />
//                 </div>
//                  {formError && <p className="text-sm text-error-500 mt-2">{formError}</p>}
//             </div>
//             {/* Tombol Aksi di Modal */}
//             <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-800">
//                 <Button variant="outline" size="sm" onClick={onCancel} disabled={isSaving}>
//                     Batal
//                 </Button>
//                 <Button variant="primary" size="sm" disabled={isSaving}>
//                     {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
//                 </Button>
//             </div>
//         </form>
//     );
// }
// Akhir Komponen Form Edit

export default function BarangPage() {
    const navigate = useNavigate();
    const [barangList, setBarangList] = useState<(ViewBarang | ViewBarangAktif ) []>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'active'>('all');

    // const { isOpen: isEditModalOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();
    // const [editingBarang, setEditingBarang] = useState<Barang | null>(null);
    // const [loadingEditData, setLoadingEditData] = useState(false); // State loading untuk fetch data edit
    // const [satuanOptions, setSatuanOptions] = useState<SelectOption[]>([]);
    // const [isSaving, setIsSaving] = useState(false);
    // const [modalError, setModalError] = useState<string | null>(null);

    // const { isOpen: isDeleteModalOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
    // const [deletingId, setDeletingId] = useState<number | null>(null);
    // const [deletingNama, setDeletingNama] = useState<string>(''); // Nama barang yang akan dihapus
    // const [isDeleting, setIsDeleting] = useState(false);
    // const [deleteError, setDeleteError] = useState<string | null>(null);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        // setSatuanOptions([]); // Kosongkan dulu
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
        setFilter(prev => (prev === "all" ? "active" : "all"));
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
                                        {filter === "all" ? (
                                            <TableRow>
                                                <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">ID</TableCell>
                                                <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Nama Barang</TableCell>
                                                <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Jenis</TableCell>
                                                <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Satuan</TableCell>
                                                <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Status</TableCell>
                                                <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Aksi</TableCell>
                                            </TableRow>
                                        ) : (
                                            <TableRow>
                                                <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">ID</TableCell>
                                                <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Nama Barang</TableCell>
                                                <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Satuan</TableCell>
                                            </TableRow>
                                        )}
                                    </TableHeader>

                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                        {barangList.length === 0 ? (
                                            <TableRow className="hover:bg-gray-50 dark:hover:bg-white/5">
                                                <TableCell
                                                    colSpan={filter === "active" ? 3 : 6}
                                                    className="px-5 py-6 text-center text-gray-500 dark:text-gray-400"
                                                >
                                                    Tidak ada data barang.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            barangList.map((item: any) =>
                                                filter === "active" ? (
                                                    // 🔹 Tampilan tabel untuk barang aktif saja
                                                    <TableRow key={item.idbarang} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                                        <TableCell className="px-5 py-4 text-sm">{item.idbarang}</TableCell>
                                                        <TableCell className="px-5 py-4 text-sm">{item.nama}</TableCell>
                                                        <TableCell className="px-5 py-4 text-sm">{item.nama_satuan || "-"}</TableCell>
                                                    </TableRow>
                                                ) : (
                                                    // 🔹 Tampilan tabel lengkap (semua barang)
                                                    <TableRow key={item.idbarang} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                                        <TableCell className="px-5 py-4 text-sm">{item.idbarang}</TableCell>
                                                        <TableCell className="px-5 py-4 text-sm">{item.nama}</TableCell>
                                                        <TableCell className="px-5 py-4 text-sm">{item.jenis === "B" ? "Barang" : "Jasa"}</TableCell>
                                                        <TableCell className="px-5 py-4 text-sm">{item.nama_satuan || "-"}</TableCell>
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