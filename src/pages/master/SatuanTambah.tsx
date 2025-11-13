import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addSatuanData } from "../../services/DataMasterServices";
import { StatusToko } from "../../types/data";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import Button from "../../components/ui/button/Button";

export default function SatuanTambah() {
    const navigate = useNavigate();
    const [namaSatuan, setNamaSatuan] = useState("");
    const [status, setStatus] = useState<StatusToko>(1);
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setFormError(null);

        if (!namaSatuan.trim()) {
            setFormError("Nama satuan wajib diisi.");
            setLoading(false);
            return;
        }

        try {
            await addSatuanData({
                nama_satuan: namaSatuan.trim(),
                status
            });
            alert("Satuan berhasil ditambahkan!");
            navigate("/satuan");
        } catch (error: any) {
            console.error(error);
            setFormError(error.message || "Gagal menambah satuan");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <PageMeta title="Tambah Satuan" description="Halaman untuk menambah data satuan baru." />
            <PageBreadcrumb pageTitle="Tambah Satuan Baru" />
            
            <ComponentCard title="Form Tambah Satuan">
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="nama_satuan">Nama Satuan</Label>
                            <Input
                                id="nama_satuan"
                                type="text"
                                value={namaSatuan}
                                onChange={(e) => setNamaSatuan(e.target.value)}
                                placeholder="Contoh: PCS, Unit, Kilogram"
                                required
                                disabled={loading}
                                className="mt-1.5"
                            />
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
                                onChange={(value) => setStatus(Number(value) as StatusToko)}
                                disabled={loading}
                                className="dark:bg-gray-900 mt-1.5"
                            />
                        </div>

                        {formError && (
                            <div className="p-3 bg-error-50 border border-error-500 rounded-lg dark:bg-error-500/15">
                                <p className="text-sm text-error-600 dark:text-error-400">{formError}</p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/satuan")}
                                disabled={loading}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={loading}
                            >
                                {loading ? "Menyimpan..." : "Simpan"}
                            </Button>
                        </div>
                    </div>
                </form>
            </ComponentCard>
        </>
    );
}