// src/pages/master/EditBarang.tsx

import { useState, useEffect, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom"; // Import useParams untuk mengambil ID
import {
    fetchSingleBarangData, // Service untuk mengambil 1 data barang
    updateBarangData,        // Service untuk menyimpan perubahan
    fetchSatuanOptions       // Service untuk mengambil opsi dropdown satuan
} from "../../services/DataMasterServices";
import { StatusToko } from "../../types/data";
import { Barang } from "../../types/db"; // Kita butuh tipe data Barang

// Import komponen UI yang Anda miliki
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";

// Tipe untuk opsi Select
interface SelectOption {
    value: string;
    label: string;
}

export default function EditBarang() {
    const navigate = useNavigate();
    // 1. Ambil 'id' dari URL (contoh: /barang/edit/1 -> id akan berisi "1")
    const { id } = useParams<{ id: string }>();
    const [barangId, setBarangId] = useState<number | null>(null);

    // 2. State untuk form (dimulai kosong)
    const [nama, setNama] = useState("");
    const [jenis, setJenis] = useState("B");
    const [idSatuan, setIdSatuan] = useState("");
    const [status, setStatus] = useState<StatusToko>(1);

    // State untuk dropdown satuan
    const [satuanOptions, setSatuanOptions] = useState<SelectOption[]>([]);

    // State untuk loading dan error
    const [loadingData, setLoadingData] = useState(true); // Loading saat mengambil data
    const [isSaving, setIsSaving] = useState(false);     // Loading saat menyimpan
    const [fetchError, setFetchError] = useState<string | null>(null); // Error saat mengambil data
    const [submitError, setSubmitError] = useState<string | null>(null); // Error saat menyimpan

    // 3. useEffect untuk mengambil data saat komponen dimuat
    useEffect(() => {
        // Validasi ID dari URL
        if (!id) {
            setFetchError("ID Barang tidak ditemukan di URL.");
            setLoadingData(false);
            return;
        }

        const numId = parseInt(id, 10);
        if (isNaN(numId)) {
            setFetchError("ID Barang tidak valid.");
            setLoadingData(false);
            return;
        }

        setBarangId(numId); // Simpan ID dalam bentuk angka

        // Fungsi untuk mengambil data barang dan data satuan
        const loadAllData = async () => {
            setLoadingData(true);
            setFetchError(null);
            try {
                // Ambil data barang (misal: "Beras") DAN daftar satuan (PCS, Unit, dll)
                const [barangData, satuanData] = await Promise.all([
                    fetchSingleBarangData(numId), // Mengambil data barang berdasarkan ID
                    fetchSatuanOptions()          // Mengambil semua opsi satuan untuk dropdown
                ]);

                // 4. ISI STATE FORM DENGAN DATA LAMA (Ini yang Anda maksud)
                setNama(barangData.nama);
                setJenis(barangData.jenis);
                setIdSatuan(String(barangData.idsatuan)); // Konversi ke string untuk <Select>
                setStatus(barangData.status ?? 1); // ?? 1 = jika status null, anggap 1

                // Isi state untuk dropdown satuan
                const options = satuanData.map(s => ({
                    value: String(s.idsatuan),
                    label: s.nama_satuan
                }));
                setSatuanOptions(options);

            } catch (err: any) {
                console.error(err);
                setFetchError(err.message || "Gagal memuat data barang atau satuan");
            } finally {
                setLoadingData(false);
            }
        };

        loadAllData();
    }, [id]); // Efek ini akan berjalan setiap kali 'id' dari URL berubah

    // 5. Fungsi untuk menyimpan perubahan
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!barangId) {
            setSubmitError("ID Barang tidak valid, tidak bisa menyimpan.");
            return;
        }

        setIsSaving(true);
        setSubmitError(null);

        try {
            await updateBarangData(barangId, { // Panggil service update
                nama,
                jenis,
                idsatuan: Number(idSatuan), // Konversi kembali ke angka
                status
            });
            alert("Barang berhasil diperbarui!");
            navigate("/barang"); // Kembali ke halaman daftar
        } catch (error: any) {
            console.error(error);
            setSubmitError(error.message || "Gagal memperbarui barang");
        } finally {
            setIsSaving(false);
        }
    };

    // 6. Tampilkan UI (form)
    return (
        <>
            <PageMeta title="Edit Barang" description={`Edit data barang ID: ${id}`} />
            <PageBreadcrumb pageTitle="Edit Barang" />

            <ComponentCard title={`Form Edit Barang (ID: ${barangId})`}>
                {loadingData ? (
                    // Tampilan saat data sedang diambil
                    <p className="text-center py-10 text-gray-500 dark:text-gray-400">
                        Memuat data barang...
                    </p>
                ) : fetchError ? (
                    // Tampilan jika data gagal diambil
                    <div className="p-4 bg-error-50 text-error-700 rounded border border-error-200 dark:bg-error-500/15 dark:text-error-400">
                        <strong>Gagal memuat data:</strong> {fetchError}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate("/barang")}
                            className="ml-4"
                        >
                            Kembali ke Daftar
                        </Button>
                    </div>
                ) : (
                    // Tampilan Form (setelah data berhasil dimuat)
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 p-1">
                            {/* Nama Barang */}
                            <div>
                                <Label htmlFor="namaBarang">Nama Barang</Label>
                                <Input
                                    id="namaBarang"
                                    value={nama} // <-- Di sinilah "Beras" akan muncul
                                    onChange={(e) => setNama(e.target.value)}
                                    required
                                    disabled={isSaving}
                                    className="mt-1.5"
                                    placeholder="Masukkan nama barang..."
                                />
                            </div>

                            {/* Jenis */}
                            <div>
                                <Label htmlFor="jenis">Jenis</Label>
                                <Select
                                    id="jenis"
                                    options={[{ value: 'B', label: 'Barang' }, { value: 'J', label: 'Jasa' }]}
                                    value={jenis} // <-- Data jenis lama akan terpilih
                                    onChange={setJenis}
                                    disabled={isSaving}
                                    className="dark:bg-gray-900 mt-1.5"
                                />
                            </div>

                            {/* Satuan */}
                            <div>
                                <Label htmlFor="satuan">Satuan</Label>
                                <Select
                                    id="satuan"
                                    options={satuanOptions}
                                    value={idSatuan} // <-- Data satuan lama akan terpilih
                                    onChange={setIdSatuan}
                                    placeholder="Pilih Satuan"
                                    required
                                    disabled={isSaving || satuanOptions.length === 0}
                                    className="dark:bg-gray-900 mt-1.5"
                                />
                                {satuanOptions.length === 0 &&
                                    <p className="text-xs text-warning-600 dark:text-warning-500 mt-1">
                                        Opsi satuan tidak tersedia.
                                    </p>
                                }
                            </div>

                            {/* Status */}
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    id="status"
                                    options={[{ value: '1', label: 'Aktif' }, { value: '0', label: 'Nonaktif' }]}
                                    value={String(status)} // <-- Data status lama akan terpilih
                                    onChange={(v) => setStatus(Number(v) as StatusToko)}
                                    disabled={isSaving}
                                    className="dark:bg-gray-900 mt-1.5"
                                />
                            </div>

                            {/* Error saat submit */}
                            {submitError && (
                                <div className="p-3 bg-error-50 text-error-700 rounded border border-error-200 dark:bg-error-500/15 dark:text-error-400">
                                    {submitError}
                                </div>
                            )}

                            {/* Tombol Aksi */}
                            <div className="flex justify-end gap-3 pt-5 border-t border-gray-100 dark:border-gray-800">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate("/barang")}
                                    disabled={isSaving}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="sm"
                                    disabled={isSaving || loadingData || !!fetchError} // Disable jika loading/error
                                >
                                    {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                                </Button>
                            </div>
                        </div>
                    </form>
                )}
            </ComponentCard>
        </>
    );
}