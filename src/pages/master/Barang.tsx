// src/pages/master/Barang.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { PlusIcon, PencilIcon, TrashBinIcon } from "../../icons"; // Import ikon
import { ViewBarang, StatusToko } from "../../types/data";
import { Barang } from "../../types/db"; // Tipe data asli barang
import { fetchBarangData, deleteBarangData, fetchSingleBarangData, updateBarangData, fetchSatuanData } from "../../services/DataMasterServices";
import { useModal } from "../../hooks/useModal"; // Import hook modal
import { Modal } from "../../components/ui/modal"; // Import komponen Modal
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";


// Komponen Form Edit (diletakkan di file yang sama atau file terpisah)
interface EditBarangFormProps {
    initialData: Barang; // Menggunakan tipe data asli Barang
    satuanOptions: { value: string; label: string }[];
    onSubmit: (updatedData: Omit<Barang, 'idbarang' | 'nama_satuan'>) => Promise<void>; // Promise untuk async
    onCancel: () => void;
    isSaving: boolean; // Status loading simpan
}

function EditBarangForm({ initialData, satuanOptions, onSubmit, onCancel, isSaving }: EditBarangFormProps) {
    const [nama, setNama] = useState(initialData.nama || '');
    const [jenis, setJenis] = useState(initialData.jenis || 'B');
    const [idSatuan, setIdSatuan] = useState(String(initialData.idsatuan) || '');
    const [status, setStatus] = useState(initialData.status ?? 1); // Default ke 1 jika null
    const [formError, setFormError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setFormError(null);
         if (!nama || !idSatuan) {
            setFormError('Nama Barang dan Satuan tidak boleh kosong.');
            return;
        }

        const updatedData = {
            nama: nama,
            jenis: jenis,
            idsatuan: parseInt(idSatuan),
            status: status
        };

        try {
            await onSubmit(updatedData); // Panggil fungsi onSubmit dari parent
        } catch (err: any) {
            setFormError(err.message || "Gagal menyimpan perubahan.");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-4">
                 <div>
                    <Label htmlFor="editNamaBarang">Nama Barang</Label>
                    <Input
                        id="editNamaBarang"
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        placeholder="Masukkan nama barang"
                        required
                        disabled={isSaving}
                    />
                </div>
                 <div>
                    <Label htmlFor="editJenis">Jenis</Label>
                    <Select
                        options={[{ value: 'B', label: 'Barang' }, { value: 'J', label: 'Jasa' }]}
                        value={jenis}
                        onChange={(value) => setJenis(value)}
                        disabled={isSaving}
                    />
                </div>
                 <div>
                    <Label htmlFor="editSatuan">Satuan</Label>
                    <Select
                        options={satuanOptions}
                        value={idSatuan}
                        onChange={(value) => setIdSatuan(value)}
                        placeholder="Pilih Satuan"
                        required
                        disabled={isSaving || satuanOptions.length === 0}
                    />
                </div>
                 <div>
                    <Label htmlFor="editStatus">Status</Label>
                    <Select
                        options={[{ value: '1', label: 'Aktif' }, { value: '0', label: 'Nonaktif' }]}
                        value={String(status)}
                        onChange={(value) => setStatus(parseInt(value))}
                        disabled={isSaving}
                    />
                </div>
                 {formError && <p className="text-sm text-error-500">{formError}</p>}
            </div>
            <div className="flex justify-end gap-2 pt-6 mt-6 border-t border-gray-200 dark:border-gray-800">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
                    Batal
                </Button>
                <Button type="submit" variant="primary" disabled={isSaving}>
                    {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
            </div>
        </form>
    );
}
// Akhir Komponen Form Edit


export default function BarangPage() {
    const navigate = useNavigate();
    const [barangList, setBarangList] = useState<ViewBarang[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State untuk Modal Edit
    const { isOpen: isEditModalOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();
    const [editingBarang, setEditingBarang] = useState<Barang | null>(null); // State untuk data yg diedit (tipe asli)
    const [satuanOptions, setSatuanOptions] = useState<{ value: string; label: string }[]>([]);
    const [isSaving, setIsSaving] = useState(false); // State loading untuk simpan edit
    const [modalError, setModalError] = useState<string | null>(null); // Error di dalam modal

     // State untuk Modal Konfirmasi Hapus
    const { isOpen: isDeleteModalOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // Fungsi load data utama
    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchBarangData();
            setBarangList(data);
        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan saat memuat data.");
            setBarangList([]);
        } finally {
            setLoading(false);
        }
    };

    // Fungsi load data satuan (sekali saja atau sesuai kebutuhan)
    const loadSatuanOptions = async () => {
         try {
            const satuanData = await fetchSatuanData();
            const options = satuanData
                .filter(s => Number(s.status) === 1) // Hanya tampilkan satuan aktif
                .map(s => ({ value: String(s.idsatuan), label: s.nama_satuan }));
            setSatuanOptions(options);
         } catch (err: any) {
             console.error("Gagal memuat data satuan:", err);
             setError("Gagal memuat data satuan untuk form edit."); // Tampilkan error jika gagal load satuan
         }
    };

    useEffect(() => {
        loadData();
        loadSatuanOptions(); // Load satuan saat komponen dimuat
    }, []);

    // Handler saat tombol Edit diklik
    const handleEditClick = async (idbarang: number) => {
        setModalError(null);
        setEditingBarang(null); // Reset dulu
         if (satuanOptions.length === 0) {
            setError("Data satuan belum dimuat, tidak bisa mengedit.");
            return;
        }
        try {
            // Ambil data barang yang spesifik dari API (bukan dari view)
            const dataBarang = await fetchSingleBarangData(idbarang);
            setEditingBarang(dataBarang);
            openEditModal();
        } catch (err: any) {
            setError(`Gagal memuat data barang (ID: ${idbarang}): ${err.message}`);
        }
    };

     // Handler saat form Edit disubmit
    const handleUpdateBarang = async (updatedData: Omit<Barang, 'idbarang' | 'nama_satuan'>) => {
        if (!editingBarang) return;
        setIsSaving(true);
        setModalError(null);

        try {
            await updateBarangData(editingBarang.idbarang, updatedData);
            closeEditModal();
            alert('Barang berhasil diperbarui!'); // Ganti notifikasi
            loadData(); // Reload data tabel setelah update
        } catch (err: any) {
             setModalError(err.message || 'Gagal memperbarui barang.');
             // Jangan tutup modal jika error
        } finally {
            setIsSaving(false);
        }
    };

     // Handler saat tombol Hapus diklik
    const handleDeleteClick = (idbarang: number) => {
        setDeletingId(idbarang);
        setDeleteError(null); // Reset error
        openDeleteModal();
    };

    // Handler saat konfirmasi Hapus
    const handleConfirmDelete = async () => {
        if (!deletingId) return;
        setIsDeleting(true);
        setDeleteError(null);

        try {
            await deleteBarangData(deletingId);
            closeDeleteModal();
            alert('Barang berhasil dihapus!'); // Ganti notifikasi
            loadData(); // Reload data tabel
        } catch (err: any) {
            setDeleteError(err.message || "Gagal menghapus barang.");
            // Jangan tutup modal jika error
        } finally {
            setIsDeleting(false);
            setDeletingId(null); // Reset ID setelah selesai
        }
    };


    const renderStatusBadge = (status: StatusToko) => (
        <Badge size="sm" color={status === 1 ? "success" : "error"}>
            {status === 1 ? "Aktif" : "Nonaktif"}
        </Badge>
    );

    return (
        <>
            <PageMeta title="Data Barang" description="Halaman untuk mengelola data master barang." />
            <PageBreadcrumb pageTitle="Data Barang" />

            <div className="space-y-6">
                <ComponentCard title="Daftar Barang">
                    <div className="flex justify-end mb-4">
                        <Button
                            size="sm"
                            variant="primary"
                            startIcon={<PlusIcon className="size-5" />}
                            onClick={() => navigate('/barang/tambah')} // Arahkan ke halaman tambah
                        >
                            Tambah Barang Baru
                        </Button>
                    </div>

                    {loading ? (
                        <p className="p-4 text-center text-gray-500 dark:text-gray-400">Memuat data...</p>
                    ) : error ? (
                        <div className="p-4 bg-error-50 border border-error-500 rounded-lg dark:bg-error-500/15">
                            <p className="font-medium text-error-600 dark:text-error-500">Gagal Memuat Data!</p>
                            <p className="text-sm text-error-500 dark:text-error-400">{error}</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                            <div className="max-w-full overflow-x-auto">
                                <Table className="w-full">
                                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                        <TableRow>
                                            <TableCell isHeader className="px-5 py-3">ID</TableCell>
                                            <TableCell isHeader className="px-5 py-3">Nama Barang</TableCell>
                                            <TableCell isHeader className="px-5 py-3">Jenis</TableCell>
                                            <TableCell isHeader className="px-5 py-3">Satuan</TableCell>
                                            <TableCell isHeader className="px-5 py-3">Status</TableCell>
                                            <TableCell isHeader className="px-5 py-3 text-center">Aksi</TableCell>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                        {barangList.length === 0 ? (
                                             <TableRow>
                                                <TableCell colSpan={6} className="px-5 py-4 text-center text-gray-500 dark:text-gray-400">
                                                    Tidak ada data barang.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            barangList.map((item) => (
                                            <TableRow key={item.idbarang} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                                <TableCell className="px-5 py-4">{item.idbarang}</TableCell>
                                                <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">{item.nama_barang}</TableCell>
                                                <TableCell className="px-5 py-4">{item.jenis === 'B' ? 'Barang' : 'Jasa'}</TableCell>
                                                <TableCell className="px-5 py-4">{item.nama_satuan}</TableCell>
                                                <TableCell className="px-5 py-4">{renderStatusBadge(item.status)}</TableCell>
                                                <TableCell className="px-5 py-4">
                                                    <div className="flex justify-center items-center space-x-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-xs !p-2" // Perkecil padding
                                                            onClick={() => handleEditClick(item.idbarang)} // Memperbaiki pemanggilan fungsi
                                                            title="Edit"
                                                         >
                                                             <PencilIcon className="size-4"/>
                                                        </Button>
                                                         <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-xs !p-2 text-error-500 border-error-300 hover:bg-error-50 hover:border-error-500 dark:border-error-500/30 dark:hover:bg-error-500/10"
                                                            onClick={() => handleDeleteClick(item.idbarang)}
                                                             title="Hapus"
                                                         >
                                                             <TrashBinIcon className="size-4"/>
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

            {/* --- Modal Edit --- */}
            {editingBarang && (
                <Modal isOpen={isEditModalOpen} onClose={closeEditModal} className="max-w-[700px]">
                    <div className="p-6">
                        <h4 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white/90">Edit Barang</h4>
                         {modalError && <p className="text-sm text-error-500 mb-4 bg-error-50 p-2 rounded dark:bg-error-500/15">{modalError}</p>}
                        <EditBarangForm
                            initialData={editingBarang}
                            satuanOptions={satuanOptions}
                            onSubmit={handleUpdateBarang}
                            onCancel={closeEditModal}
                            isSaving={isSaving}
                         />
                    </div>
                </Modal>
            )}

             {/* --- Modal Konfirmasi Hapus --- */}
            <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} className="max-w-md">
                 <div className="p-6">
                     <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white/90">Konfirmasi Hapus</h4>
                     <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                         Apakah Anda yakin ingin menghapus barang ini? Tindakan ini tidak dapat dibatalkan.
                     </p>
                    {deleteError && <p className="text-sm text-error-500 mb-4 bg-error-50 p-2 rounded dark:bg-error-500/15">{deleteError}</p>}
                     <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
                         <Button variant="outline" onClick={closeDeleteModal} disabled={isDeleting}>
                             Batal
                         </Button>
                         <Button
                             variant="primary"
                             className="bg-error-600 hover:bg-error-700 focus:ring-error-500/30" // Styling tombol hapus
                             onClick={handleConfirmDelete}
                             disabled={isDeleting}
                         >
                            {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                        </Button>
                    </div>
                 </div>
            </Modal>

        </>
    );
}