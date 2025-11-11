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
// Import komponen UI yang diperlukan
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import Button from "../../components/ui/button/Button";

interface SelectOption {
    value: string;
    label: string;
}

export default function EditBarangPage() {
    const navigate = useNavigate();
    // 3. Ambil 'id' dari URL. (Misal: /barang/edit/8 -> id akan "8")
    const { id } = useParams<{ id: string }>();
    const [barangId, setBarangId] = useState<number | null>(null);

    // State untuk form
    const [nama, setNama] = useState("");
    const [jenis, setJenis] = useState("B");
    const [idSatuan, setIdSatuan] = useState<string>("");
    const [status, setStatus] = useState<StatusToko>(1);

    // State untuk loading dan error
    const [loadingData, setLoadingData] = useState(true); // Ganti nama 'loading' agar lebih jelas
    const [isSaving, setIsSaving] = useState(false); // State untuk proses simpan
    const [loadingSatuan, setLoadingSatuan] = useState(true);
    const [formError, setFormError] = useState<string | null>(null); // Error saat submit
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
                // Ambil data barang (misal: "Beras") DAN daftar satuan (PCS, Unit, dll)
                const [barangData, satuanData] = await Promise.all([
                    fetchSingleBarangData(numId), // Ambil data barang berdasarkan ID
                    fetchSatuanOptions()          // Ambil semua opsi satuan
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
    }, [id]); // Efek ini akan berjalan jika 'id' dari URL berubah

    // 6. Handle Submit untuk menyimpan perubahan
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!barangId) {
            setFormError("ID Barang tidak valid, tidak bisa menyimpan.");
            return;
        }

        setIsSaving(true);
        setFormError(null);
        try {
            await updateBarangData(barangId, { // Kirim ID yang benar
                nama,
                jenis,
                idsatuan: Number(idSatuan), // Konversi kembali ke angka
                status
            });
            alert("Barang berhasil diperbarui!");
            navigate("/barang");
        } catch (error: any) {
            console.error(error);
            setFormError(error.message || "Gagal memperbarui barang");
        } finally {
            setIsSaving(false);
        }
    };

    // 7. Render JSX
    return (
        <>
            <PageBreadcrumb pageTitle="Edit Barang" />

            <ComponentCard title={`Edit Data Barang (ID: ${id})`}>
                {loadingData ? (
                    <p className="text-center py-10">Memuat data barang...</p>
                ) : fetchError ? (
                    <div className="text-red-600 bg-red-50 p-4 rounded border border-red-200">
                        <strong>Error:</strong> {fetchError}
                        <Button variant="outline" size="sm" onClick={() => navigate("/barang")} className="ml-4">
                            Kembali
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="mb-3">
                            <Label htmlFor="nama">Nama</Label>
                            {/* Bind 'value' ke state 'nama' */}
                            <Input
                                id="nama"
                                type="text"
                                className="border p-2 w-full mt-1.5"
                                value={nama} 
                                onChange={(e) => setNama(e.target.value)}
                                required
                                disabled={isSaving}
                            />
                        </div>

                        <div className="mb-3">
                            <Label htmlFor="jenis">Jenis</Label>
                             {/* Ganti ke komponen Select dan bind 'value' */}
                            <Select
                                id="jenis"
                                className="border p-2 w-full mt-1.5 dark:bg-gray-900"
                                options={[{ value: 'B', label: 'Barang'}]}
                                value={jenis} 
                                onChange={(val) => setJenis(val)}
                                disabled={isSaving}
                            />
                        </div>

                        <div className="mb-3">
                            <Label htmlFor="satuan">Satuan</Label>
                            <Select
                                id="satuan"
                                className="border p-2 w-full mt-1.5 dark:bg-gray-900"
                                value={idSatuan} // Bind 'value'
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
                                value={String(status)} // Bind 'value' (pastikan string)
                                className="border p-2 w-full mt-1.5 dark:bg-gray-900"
                                options={[{ value: '1', label: 'Aktif' }, { value: '0', label: 'Nonaktif' }]}
                                onChange={(val) => setStatus(Number(val) as StatusToko)}
                                disabled={isSaving}
                            />
                        </div>

                        {formError && (
                             <div className="text-red-600 bg-red-50 p-3 rounded border border-red-200">
                                {formError}
                            </div>
                        )}

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
                                disabled={isSaving || loadingData}
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