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
import { ViewBarang, StatusToko } from "../../types/data";
// import { Barang} from "../../types/db"; // <-- Ganti impor ke data.d.ts jika perlu
import {
    fetchBarangData,
    deleteBarangData
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
    const [barangList, setBarangList] = useState<ViewBarang[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
            const [barangData /*satuanData*/] = await Promise.all([
                fetchBarangData()
                // fetchSatuanOptions()
            ]);
            setBarangList(barangData);
            // const options = satuanData.map(s => ({ value: String(s.idsatuan), label: s.nama_satuan }));
            // setSatuanOptions(options);
            //  if (options.length === 0) {
            //      // Beri peringatan jika satuan kosong, tapi jangan error utama
            //      console.warn("Tidak ada data satuan aktif yang bisa dimuat untuk dropdown.");
            // }
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
    }, []);

    // const handleEditClick = async (idbarang: number) => {
    //     setModalError(null);
    //     setEditingBarang(null); // Reset state editing
    //     setLoadingEditData(true); // Mulai loading data edit
    //     openEditModal(); // Buka modal

    //     // Cek lagi apakah opsi satuan sudah ada
    //     if (satuanOptions.length === 0 && !loading) {
    //         setModalError("Data satuan belum dimuat. Coba muat ulang halaman.");
    //         setLoadingEditData(false);
    //         return; // Jangan lanjutkan fetch jika satuan belum ada
    //     }

    //     try {
    //         const dataBarang = await fetchSingleBarangData(idbarang);
    //         setEditingBarang(dataBarang);
    //     } catch (err: any) {
    //         setModalError(`Gagal memuat detail barang (ID: ${idbarang}): ${err.message || "Error tidak diketahui"}`);
    //         console.error("Fetch Single Barang Error:", err);
    //     } finally {
    //          setLoadingEditData(false); // Selesai loading data edit
    //     }
    // };

    // const handleUpdateBarang = async (updatedData: Omit<Barang, 'idbarang' | 'nama_satuan'>) => {
    //     if (!editingBarang) return;

    //     setIsSaving(true);
    //     setModalError(null); // Reset modal error sebelum mencoba menyimpan

    //     try {
    //         await updateBarangData(editingBarang.idbarang, updatedData);
    //         closeEditModal();
    //         alert('Barang berhasil diperbarui!');
    //         loadData(); // Reload data tabel setelah update
    //     } catch (err: any) {
    //          setModalError(err.message || 'Gagal memperbarui barang.');
    //          console.error("Update Barang Error:", err);
    //     } finally {
    //         setIsSaving(false);
    //     }
    // };

    // const handleDeleteClick = (idbarang: number, namaBarang: string) => {
    //     setDeletingId(idbarang);
    //     setDeletingNama(namaBarang); // Simpan nama untuk konfirmasi
    //     setDeleteError(null);
    //     openDeleteModal();
    // };

    // const handleConfirmDelete = async () => {
    //     if (!deletingId) return;
    //     setIsDeleting(true);
    //     setDeleteError(null);

    //     try {
    //         await deleteBarangData(deletingId);
    //         closeDeleteModal();
    //         alert(`Barang "${deletingNama}" berhasil dihapus!`);
    //         loadData();
    //     } catch (err: any) {
    //         setDeleteError(err.message || "Gagal menghapus barang.");
    //         console.error("Delete Barang Error:", err);
    //         // Jangan tutup modal jika error
    //     } finally {
    //         setIsDeleting(false);
    //         // Tidak perlu reset deletingId di sini, akan direset saat modal ditutup atau berhasil
    //     }
    // };

    // const handleCloseDeleteModal = () => {
    //     closeDeleteModal();
    //     // Reset state hanya jika modal ditutup secara manual (bukan karena error)
    //     if (!deleteError) {
    //          setDeletingId(null);
    //          setDeletingNama('');
    //     }
    // }

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


    return (
        <>
            <PageMeta title="Data Barang" description="Halaman mengelola data master barang." />
            <PageBreadcrumb pageTitle="Data Barang" />

            <div className="space-y-6">
                <ComponentCard title="Daftar Barang">
                    <div className="flex justify-end mb-4">
                        <Button
                            size="sm"
                            variant="primary"
                            onClick={() => navigate('/barang/tambah')}
                        >
                            Tambah Barang Baru
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
                                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-gray-800">
                                        <TableRow>
                                            <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">ID</TableCell>
                                            <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Nama Barang</TableCell>
                                            <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Jenis</TableCell>
                                            <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Satuan</TableCell>
                                            <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Status</TableCell>
                                            <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400 text-center">Aksi</TableCell>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                        {barangList.length === 0 ? (
                                             <TableRow>
                                                <TableCell  className="px-5 py-6 text-center text-gray-500 dark:text-gray-400 col-span-6" >
                                                    Belum ada data barang.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            barangList.map((item) => (
                                            <TableRow key={item.idbarang} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                                <TableCell className="px-5 py-4 text-sm">{item.idbarang}</TableCell>
                                                <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">{item.nama_barang}</TableCell>
                                                <TableCell className="px-5 py-4 text-sm">{item.jenis === 'B' ? 'Barang' : 'Jasa'}</TableCell>
                                                <TableCell className="px-5 py-4 text-sm">{item.nama_satuan || '-'}</TableCell> {/* Handle jika nama_satuan null */}
                                                <TableCell className="px-5 py-4 text-sm">{renderStatusBadge(item.status)}</TableCell>
                                                <TableCell className="px-5 py-4 text-sm">
                                                    <div className="flex justify-center items-center space-x-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-xs !p-1.5" // Ukuran lebih kecil
                                                            onClick={() => navigate(`/barang/edit/${item.idbarang}`)}
                                                        >
                                                             <PencilIcon className="size-4"/>
                                                             <span className="sr-only">Edit {item.nama_barang}</span>
                                                        </Button>
                                                         <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-xs !p-1.5 text-error-600 border-error-300 hover:bg-error-50 hover:border-error-500 dark:border-error-500/30 dark:hover:bg-error-500/10 dark:text-error-400"
                                                            onClick={() => handleDelete(item.idbarang, item.nama_barang)}
                                                         >
                                                             <TrashBinIcon className="size-4"/>
                                                             <span className="sr-only">Hapus {item.nama_barang}</span>
                                                         </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                            ))
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