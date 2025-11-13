import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addBarangData, fetchSatuanOptions } from "../../services/DataMasterServices";
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

export default function BarangTambah() {
    const navigate = useNavigate();
    const [nama, setNama] = useState("");
    const [jenis, setJenis] = useState("B");
    const [harga, setHarga] = useState("");
    const [idSatuan, setIdSatuan] = useState<string>("");
    const [status, setStatus] = useState<StatusToko>(1);
    const [loading, setLoading] = useState(false);
    const [loadingSatuan, setLoadingSatuan] = useState(true);
    const [satuanOptions, setSatuanOptions] = useState<SelectOption[]>([]);
    const [formError, setFormError] = useState<string | null>(null);
    const [fetchSatuanError, setFetchSatuanError] = useState<string | null>(null);

    useEffect(() => {
        const loadSatuan = async () => {
            setLoadingSatuan(true);
            setFetchSatuanError(null);
            try {
                const dataSatuan = await fetchSatuanOptions();
                const options = dataSatuan.map(satuan => ({
                    value: String(satuan.idsatuan),
                    label: satuan.nama_satuan
                }));
                setSatuanOptions(options);
                if (options.length === 0) {
                    setFetchSatuanError("Tidak ada data satuan aktif yang tersedia.");
                }
            } catch (error: any) {
                console.error("Gagal fetch satuan:", error);
                setFetchSatuanError(error.message || "Gagal memuat opsi satuan.");
            } finally {
                setLoadingSatuan(false);
            }
        };

        loadSatuan();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setFormError(null);

        if (!nama.trim()) {
            setFormError("Nama barang wajib diisi.");
            setLoading(false);
            return;
        }

        if (!idSatuan) {
            setFormError("Satuan wajib dipilih.");
            setLoading(false);
            return;
        }
        if (Number(harga) < 0) {
            setFormError("Harga tidak boleh negatif.");
            setLoading(false);
            return;
        }

        try {
            await addBarangData({
                nama: nama.trim(),
                jenis,
                idsatuan: Number(idSatuan),
                status,
                harga: Number(harga)
            });
            alert("Barang berhasil ditambahkan!");
            navigate("/barang");
        } catch (error: any) {
            console.error(error);
            setFormError(error.message || "Gagal menambah barang");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <PageMeta title="Tambah Barang" description="Halaman untuk menambah data barang baru." />
            <PageBreadcrumb pageTitle="Tambah Barang Baru" />
            
            <ComponentCard title="Form Tambah Barang">
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="nama">Nama Barang</Label>
                            <Input
                                id="nama"
                                type="text"
                                value={nama}
                                onChange={(e) => setNama(e.target.value)}
                                placeholder="Masukkan nama barang"
                                required
                                disabled={loading}
                                className="mt-1.5"
                            />
                        </div>
                        <div>
                            <Label htmlFor="harga">Harga Satuan Barang</Label>
                            <Input
                                id="harga"
                                type="text"
                                value={harga}
                                onChange={(e) => setHarga(e.target.value)}
                                placeholder="Masukkan Harga barang"
                                required
                                disabled={loading}
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
                                onChange={(value) => setJenis(value)}
                                disabled={loading}
                                className="dark:bg-gray-900 mt-1.5"
                            />
                        </div>

                        <div>
                            <Label htmlFor="satuan">Satuan</Label>
                            <Select
                                id="satuan"
                                options={satuanOptions}
                                value={idSatuan}
                                onChange={(value) => setIdSatuan(value)}
                                placeholder={loadingSatuan ? "Memuat satuan..." : "-- Pilih Satuan --"}
                                required
                                disabled={loading || loadingSatuan || !!fetchSatuanError || satuanOptions.length === 0}
                                className="dark:bg-gray-900 mt-1.5"
                            />
                            {!loadingSatuan && !fetchSatuanError && satuanOptions.length === 0 && (
                                <p className="text-xs text-yellow-600 mt-1">Tidak ada satuan aktif.</p>
                            )}
                            {fetchSatuanError && (
                                <p className="text-xs text-error-600 mt-1">{fetchSatuanError}</p>
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
                                onClick={() => navigate("/barang")}
                                disabled={loading}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={loading || loadingSatuan}
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