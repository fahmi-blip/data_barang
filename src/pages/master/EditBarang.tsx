import { useState, useEffect, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    fetchSatuanOptions,
    updateBarangData,
    fetchSingleBarangData
} from "../../services/DataMasterServices";
import { StatusToko } from "../../types/data";
import ComponentCard from "../../components/common/ComponentCard";
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
    const { id } = useParams<{ id: string }>();
    const [barangId, setBarangId] = useState<number | null>(null);

    // State untuk form
    const [nama, setNama] = useState("");
    const [jenis, setJenis] = useState("B");
    const [idSatuan, setIdSatuan] = useState<string>("");
    const [status, setStatus] = useState<StatusToko>(1);

    // State untuk loading dan error
    const [loadingData, setLoadingData] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [loadingSatuan, setLoadingSatuan] = useState(true);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // State untuk dropdown satuan
    const [satuanOptions, setSatuanOptions] = useState<SelectOption[]>([]);

    useEffect(() => {
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

        setBarangId(numId);

        const loadAllData = async () => {
            setLoadingData(true);
            setLoadingSatuan(true);
            setFetchError(null);
            try {
                // Ambil data barang dan data satuan secara bersamaan
                const [barangData, satuanData] = await Promise.all([
                    fetchSingleBarangData(numId),
                    fetchSatuanOptions()
                ]);

                console.log("📦 Data barang dari API:", barangData);
                console.log("📋 Data satuan dari API:", satuanData);

                // ISI STATE FORM DENGAN DATA LAMA
                setNama(barangData.nama || "");
                setJenis(barangData.jenis || "B");
                setIdSatuan(barangData.idsatuan ? String(barangData.idsatuan) : "");
                setStatus(barangData.status ?? 1);

                // Isi dropdown satuan
                const options = satuanData.map(satuan => ({
                    value: String(satuan.idsatuan),
                    label: satuan.nama_satuan
                }));
                setSatuanOptions(options);

            } catch (err: any) {
                console.error("❌ Gagal fetch data:", err);
                setFetchError(err.message || "Gagal memuat data");
            } finally {
                setLoadingData(false);
                setLoadingSatuan(false);
            }
        };

        loadAllData();
    }, [id]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        if (!barangId) {
            setSubmitError("ID Barang tidak valid, tidak bisa menyimpan.");
            return;
        }

        if (!nama.trim()) {
            setSubmitError("Nama barang wajib diisi.");
            return;
        }

        if (!idSatuan) {
            setSubmitError("Satuan wajib dipilih.");
            return;
        }
        
setIsSaving(true);
setSubmitError(null);

const dataToUpdate = {
    nama: nama.trim(),
    jenis: jenis,
    idsatuan: Number(idSatuan),
    status: status
};

console.log("📤 Data yang akan dikirim:", dataToUpdate);
console.log("🔑 ID Barang:", barangId);

        try {
            const result = await updateBarangData(barangId, dataToUpdate);
            console.log("Response dari server:", result);
            alert("Barang berhasil diperbarui!");
            navigate("/barang");
        } catch (error: any) {
            console.error("❌ Error saat update:", error);
            setSubmitError(error.message || "Gagal memperbarui barang");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <PageMeta title={`Edit Barang ID: ${id}`} description="Halaman untuk mengedit data barang yang sudah ada." />
            <PageBreadcrumb pageTitle="Edit Barang" />

            <ComponentCard title={`Edit Data Barang (ID: ${id})`}>
                {loadingData ? (
                    <p className="text-center py-10">Memuat data barang...</p>
                ) : fetchError ? (
                    <div className="text-red-600 bg-red-50 p-4 rounded border border-red-200 dark:bg-red-500/15 dark:border-red-500">
                        <strong>Error:</strong> {fetchError}
                        <Button variant="outline" size="sm" onClick={() => navigate("/barang")} className="ml-4">
                            Kembali
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="nama">Nama Barang</Label>
                            <Input
                                id="nama"
                                type="text"
                                value={nama}
                                onChange={(e) => setNama(e.target.value)}
                                placeholder="Masukkan nama barang"
                                required
                                disabled={isSaving}
                                className="mt-1.5"
                            />
                        </div>

                        <div>
                            <Label htmlFor="jenis">Jenis</Label>
                            <Select
                                id="jenis"
                                options={[
                                    { value: 'B', label: 'Barang' }
                                ]}
                                value={jenis}
                                onChange={(val) => setJenis(val)}
                                disabled={isSaving}
                                className="dark:bg-gray-900 mt-1.5"
                            />
                        </div>

                        <div>
                            <Label htmlFor="satuan">Satuan</Label>
                            <Select
                                id="satuan"
                                options={satuanOptions}
                                value={idSatuan}
                                onChange={(val) => setIdSatuan(val)}
                                placeholder={loadingSatuan ? "Memuat satuan..." : "-- Pilih Satuan --"}
                                required
                                disabled={isSaving || loadingSatuan || satuanOptions.length === 0}
                                className="dark:bg-gray-900 mt-1.5"
                            />
                            {!loadingSatuan && satuanOptions.length === 0 && (
                                <p className="text-xs text-yellow-600 mt-1">Tidak ada satuan aktif.</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="status">Status</Label>
                            <Select
                                id="status"
                                options={[
                                    { value: '1', label: 'Aktif' },
                                    { value: '0', label: 'Nonaktif' }
                                ]}
                                value={String(status)}
                                onChange={(val) => setStatus(Number(val) as StatusToko)}
                                disabled={isSaving}
                                className="dark:bg-gray-900 mt-1.5"
                            />
                        </div>
                        
                        {submitError && (
                            <div className="p-3 bg-error-50 border border-error-500 rounded-lg dark:bg-error-500/15">
                                <p className="text-sm font-medium text-error-600 dark:text-error-400">
                                    ⚠️ {submitError}
                                </p>
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