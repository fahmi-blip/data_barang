import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchSingleSatuanData, updateSatuanData } from "../../services/DataMasterServices";
import { StatusToko } from "../../types/data";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import Button from "../../components/ui/button/Button";

export default function EditSatuanPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [satuanId, setSatuanId] = useState<number | null>(null);
    
    const [namaSatuan, setNamaSatuan] = useState("");
    const [status, setStatus] = useState<StatusToko>(1);
    
    const [loadingData, setLoadingData] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setFetchError("ID Satuan tidak ditemukan di URL.");
            setLoadingData(false);
            return;
        }

        const numId = parseInt(id, 10);
        if (isNaN(numId)) {
            setFetchError("ID Satuan tidak valid.");
            setLoadingData(false);
            return;
        }

        setSatuanId(numId);

        const loadData = async () => {
            setLoadingData(true);
            setFetchError(null);
            try {
                const satuanData = await fetchSingleSatuanData(numId);
                setNamaSatuan(satuanData.nama_satuan);
                setStatus(satuanData.status ?? 1);
            } catch (err: any) {
                console.error("Gagal fetch data:", err);
                setFetchError(err.message || "Gagal memuat data");
            } finally {
                setLoadingData(false);
            }
        };

        loadData();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!satuanId) {
            setSubmitError("ID Satuan tidak valid, tidak bisa menyimpan.");
            return;
        }
        
        setIsSaving(true);
        setSubmitError(null);
        
        try {
            await updateSatuanData(satuanId, {
                nama_satuan: namaSatuan.trim(),
                status
            });
            alert("Satuan berhasil diperbarui!");
            navigate("/satuan");
        } catch (error: any) {
            console.error(error);
            setSubmitError(error.message || "Gagal memperbarui satuan");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <PageMeta title={`Edit Satuan ID: ${id}`} description="Halaman untuk mengedit data satuan." />
            <PageBreadcrumb pageTitle="Edit Satuan" />

            <ComponentCard title={`Edit Data Satuan (ID: ${id})`}>
                {loadingData ? (
                    <p className="text-center py-10">Memuat data satuan...</p>
                ) : fetchError ? (
                    <div className="text-red-600 bg-red-50 p-4 rounded border border-red-200">
                        <strong>Error:</strong> {fetchError}
                        <Button variant="outline" size="sm" onClick={() => navigate("/satuan")} className="ml-4">
                            Kembali
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="nama_satuan">Nama Satuan</Label>
                            <Input
                                id="nama_satuan"
                                type="text"
                                value={namaSatuan}
                                onChange={(e) => setNamaSatuan(e.target.value)}
                                required
                                disabled={isSaving}
                                className="mt-1.5"
                            />
                        </div>

                        <div>
                            <Label htmlFor="status">Status</Label>
                            <Select
                                id="status"
                                value={String(status)}
                                options={[
                                    { value: '1', label: 'Aktif' },
                                    { value: '0', label: 'Nonaktif' }
                                ]}
                                onChange={(val) => setStatus(Number(val) as StatusToko)}
                                disabled={isSaving}
                                className="dark:bg-gray-900 mt-1.5"
                            />
                        </div>

                        {submitError && (
                            <div className="text-red-600 bg-red-50 p-3 rounded border border-red-200">
                                {submitError}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/satuan")}
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