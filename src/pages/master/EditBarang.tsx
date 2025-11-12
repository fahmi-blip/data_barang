import { useState, useEffect, FormEvent } from "react";
// 1. Import useParams untuk mengambil ID dari URL
import { useNavigate, useParams } from "react-router-dom";
import {
    fetchSatuanOptions,
    updateBarangData,
    fetchSingleBarangData // 2. Import fungsi untuk mengambil 1 barang
} from "../../services/DataMasterServices";
import { StatusToko } from "../../types/data";
import ComponentCard from "../../components/common/ComponentCard";
// Import komponen UI yang Anda perlukan
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Label from "../../components/form/Label"; // Asumsi Anda punya ini
import Input from "../../components/form/input/InputField"; // Asumsi Anda punya ini
import Select from "../../components/form/Select"; // Asumsi Anda punya ini
import Button from "../../components/ui/button/Button"; // Asumsi Anda punya ini

interface SelectOption {
    value: string;
    label: string;
}

export default function EditBarangPage() {
    const navigate = useNavigate();
    // 3. Ambil 'id' dari parameter URL. (Misal: /barang/edit/8 -> id akan "8")
    const { id } = useParams<{ id: string }>();
    const [barangId, setBarangId] = useState<number | null>(null);

    // State untuk form
    const [nama, setNama] = useState("");
    const [jenis, setJenis] = useState("B");
    const [idSatuan, setIdSatuan] = useState<string>("");
    const [status, setStatus] = useState<StatusToko>(1);

    // State untuk loading dan error
    const [loadingData, setLoadingData] = useState(true); // Loading saat fetch data
    const [isSaving, setIsSaving] = useState(false); // Loading saat submit
    const [loadingSatuan, setLoadingSatuan] = useState(true);
    const [submitError, setSubmitError] = useState<string | null>(null); // Error saat submit
    const [fetchError, setFetchError] = useState<string | null>(null); // Error saat mengambil data

    // State untuk dropdown satuan
    const [satuanOptions, setSatuanOptions] = useState<SelectOption[]>([]);

    // 4. useEffect untuk memuat data saat komponen dimuat
    useEffect(() => {
        // Validasi ID dari URL
        if (!id) {
            setFetchError("ID Barang tidak ditemukan di URL.");
            setLoadingData(false);
            setLoadingSatuan(false);
            return;
        }

        const numId = parseInt(id, 10);
        if (isNaN(numId)) {
            setFetchError("ID Barang tidak valid.");
            setLoadingData(false);
            setLoadingSatuan(false);
            return;
        }

        setBarangId(numId); // Simpan ID dalam bentuk angka

        const loadAllData = async () => {
            setLoadingData(true);
            setLoadingSatuan(true);
            setFetchError(null);
            try {
                // Ambil data barang dan data satuan secara bersamaan
                const [barangData, satuanData] = await Promise.all([
                    fetchSingleBarangData(numId), // Ambil data barang (misal: "Beras")
                    fetchSatuanOptions()          // Ambil daftar satuan (PCS, Unit, dll)
                ]);

                // 5. ISI STATE FORM DENGAN DATA LAMA (Ini yang Anda maksud)
                setNama(barangData.nama);
                setJenis(barangData.jenis);
                setIdSatuan(String(barangData.idsatuan)); // Konversi ke string untuk <Select>
                setStatus(barangData.status ?? 1);

                // Isi dropdown satuan
                const options = satuanData.map(satuan => ({
                    value: String(satuan.idsatuan),
                    label: satuan.nama_satuan
                }));
                setSatuanOptions(options);

            } catch (err: any) {
                console.error("Gagal fetch data:", err);
                setFetchError(err.message || "Gagal memuat data");
            } finally {
                setLoadingData(false);
                setLoadingSatuan(false);
            }
        };

        loadAllData();
    }, [id]); // Dependency array [id], agar dieksekusi jika ID berubah

    // 6. Handle Submit untuk menyimpan perubahan
    const handleSubmit = async (e: FormEvent) => { // Ganti React.FormEvent menjadi FormEvent
        e.preventDefault();
        
        if (!barangId) {
             setSubmitError("ID Barang tidak valid, tidak bisa menyimpan.");
             return;
        }
        
        setIsSaving(true); // Ganti setLoading menjadi setIsSaving
        setSubmitError(null);
        try {
            await updateBarangData(barangId, { // Kirim ID yang benar
                nama,
                jenis,
                idsatuan: Number(idSatuan), // Konversi kembali ke angka
                status
            });
            alert("Barang berhasil diperbarui!"); // Pesan lebih sesuai
            navigate("/barang"); // Kembali ke daftar barang
        } catch (error: any) {
            console.error(error);
            setSubmitError(error.message || "Gagal memperbarui barang"); // Set error submit
        } finally {
            setIsSaving(false); // Ganti setLoading menjadi setIsSaving
        }
    };

    // 7. Render JSX
    return (
        <>
            {/* Tambahkan PageMeta dan PageBreadcrumb agar konsisten */}
            <PageMeta title={`Edit Barang ID: ${id}`} description={"Halaman untuk mengedit data barang yang sudah ada."} />
            <PageBreadcrumb pageTitle="Edit Barang" />

            <ComponentCard title={`Edit Data Barang (ID: ${id})`}>
                {loadingData ? (
                    <p className="text-center py-10">Memuat data barang...</p>
                ) : fetchError ? (
                    // Tampilkan pesan error jika fetch gagal
                    <div className="text-red-600 bg-red-50 p-4 rounded border border-red-200">
                        <strong>Error:</strong> {fetchError}
                         <Button variant="outline" size="sm" onClick={() => navigate("/barang")} className="ml-4">
                            Kembali
                        </Button>
                    </div>
                ) : (
                    // Tampilkan form jika data berhasil dimuat
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="mb-3">
                            {/* Ganti ke komponen Label dan Input kustom */}
                            <Label htmlFor="nama">Nama</Label>
                            <Input
                                id="nama"
                                type="text"
                                className="border p-2 w-full mt-1.5"
                                value={nama} // 8. Bind state 'nama' ke value
                                onChange={(e) => setNama(e.target.value)}
                                required
                                disabled={isSaving} // Gunakan isSaving
                            />
                        </div>

                        <div className="mb-3">
                            <Label htmlFor="jenis">Jenis</Label>
                            {/* Ganti ke komponen Select kustom */}
                            <Select
                                id="jenis"
                                className="border p-2 w-full mt-1.5 dark:bg-gray-900"
                                options={[{ value: 'B', label: 'Barang' }]}
                                value={jenis} // 9. Bind state 'jenis' ke value
                                onChange={(val) => setJenis(val)}
                                disabled={isSaving}
                            />
                        </div>

                        <div className="mb-3">
                            <Label htmlFor="satuan">Satuan</Label>
                            <Select
                                id="satuan"
                                className="border p-2 w-full mt-1.5 dark:bg-gray-900"
                                value={idSatuan} // 10. Bind state 'idSatuan' ke value
                                onChange={(val) => setIdSatuan(val)}
                                required
                                disabled={isSaving || loadingSatuan || !!fetchError || satuanOptions.length === 0}
                                options={satuanOptions}
                                placeholder={loadingSatuan ? "Memuat satuan..." : "-- Pilih Satuan --"}
                            />
                            {!loadingSatuan && !fetchError && satuanOptions.length === 0 &&
                                <p className="text-xs text-yellow-600 mt-1">Tidak ada satuan aktif.</p>
                            }
                        </div>

                        <div className="mb-3">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                id="status"
                                value={String(status)} // 11. Bind state 'status' ke value
                                className="border p-2 w-full mt-1.5 dark:bg-gray-900"
                                options={[{ value: '1', label: 'Aktif' }, { value: '0', label: 'Nonaktif' }]}
                                onChange={(val) => setStatus(Number(val) as StatusToko)}
                                disabled={isSaving}
                            />
                        </div>
                        
                        {/* Tampilkan error submit */}
                        {submitError && (
                             <div className="text-red-600 bg-red-50 p-3 rounded border border-red-200">
                                {submitError}
                            </div>
                        )}

                        {/* Ganti ke komponen Button kustom */}
                        <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/barang")}
                                disabled={isSaving}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={isSaving || loadingData} // Disable juga jika data masih loading
                            >
                                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                            </Button>
                        </div>
                    </form>
                )}
            </ComponentCard>
        </>
    );
}