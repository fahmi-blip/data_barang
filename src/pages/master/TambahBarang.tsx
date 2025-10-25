// src/pages/master/TambahBarang.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField"; // <-- Import InputField
import Select from "../../components/form/Select"; // <-- Import Select
import Button from "../../components/ui/button/Button"; // <-- Import Button
import Label from "../../components/form/Label"; // <-- Import Label
import { addBarangData, fetchSatuanOptions } from "../../services/DataMasterServices"; // Ambil fetchSatuanOptions
import { Satuan } from "../../types/db";

// Tipe untuk opsi Select
interface SelectOption {
    value: string;
    label: string;
}

export default function TambahBarangPage() {
    const [nama, setNama] = useState('');
    const [jenis, setJenis] = useState('B');
    const [idSatuan, setIdSatuan] = useState<string>(''); // Value Select harus string
    const [status, setStatus] = useState<number>(1);
    const [satuanOptions, setSatuanOptions] = useState<SelectOption[]>([]);
    const [loading, setLoading] = useState(false); // Loading saat submit
    const [loadingSatuan, setLoadingSatuan] = useState(true); // Loading saat fetch satuan
    const [formError, setFormError] = useState<string | null>(null); // Error form submit
    const [fetchSatuanError, setFetchSatuanError] = useState<string | null>(null); // Error fetch satuan
    const navigate = useNavigate();

    // Fetch data satuan aktif untuk dropdown
    useEffect(() => {
        const loadSatuan = async () => {
            setLoadingSatuan(true);
            setFetchSatuanError(null);
            try {
                const satuanData = await fetchSatuanOptions(); // Gunakan fungsi baru
                const options = satuanData.map(s => ({ value: String(s.idsatuan), label: s.nama_satuan }));
                setSatuanOptions(options);
            } catch (err: any) {
                setFetchSatuanError("Gagal memuat data satuan: " + err.message);
            } finally {
                setLoadingSatuan(false);
            }
        };
        loadSatuan();
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setFormError(null);

        if (!nama || !idSatuan) {
            setFormError('Nama Barang dan Satuan wajib diisi.');
            setLoading(false);
            return;
        }

        const barangBaru = {
            nama: nama,
            jenis: jenis,
            idsatuan: parseInt(idSatuan), // Konversi ke number
            status: status
        };

        try {
            await addBarangData(barangBaru);
            // Idealnya gunakan notifikasi toast
            alert('Barang berhasil ditambahkan!');
            navigate('/barang');
        } catch (err: any) {
            setFormError(err.message || "Terjadi kesalahan saat menyimpan.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <PageMeta title="Tambah Barang" description="Form tambah data barang baru." />
            <PageBreadcrumb pageTitle="Tambah Barang Baru" />
            <ComponentCard title="Form Tambah Barang">
                {fetchSatuanError && <p className="text-sm text-error-500 mb-4">Error: {fetchSatuanError}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Nama Barang */}
                        <div>
                            <Label htmlFor="namaBarang">Nama Barang</Label>
                            <Input
                                id="namaBarang"
                                value={nama}
                                onChange={(e) => setNama(e.target.value)}
                                placeholder="Masukkan nama barang"
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Jenis */}
                        <div>
                            <Label htmlFor="jenis">Jenis</Label>
                            <Select
                                options={[{ value: 'B', label: 'Barang' }, { value: 'J', label: 'Jasa' }]}
                                value={jenis}
                                onChange={(value) => setJenis(value)}
                                defaultValue="B" // Default value
                                disabled={loading}
                                className="dark:bg-dark-900" // Tambahkan class jika perlu style dark mode
                            />
                        </div>

                         {/* Satuan */}
                         <div>
                            <Label htmlFor="satuan">Satuan</Label>
                            <Select
                                options={satuanOptions}
                                value={idSatuan}
                                onChange={(value) => setIdSatuan(value)}
                                placeholder={loadingSatuan ? "Memuat..." : "Pilih Satuan"}
                                required
                                disabled={loading || loadingSatuan || !!fetchSatuanError}
                                className="dark:bg-dark-900"
                            />
                        </div>

                         {/* Status */}
                         <div>
                            <Label htmlFor="status">Status</Label>
                            <Select
                                options={[{ value: '1', label: 'Aktif' }, { value: '0', label: 'Nonaktif' }]}
                                value={String(status)} // Value Select harus string
                                onChange={(value) => setStatus(parseInt(value))} // Konversi ke number saat state diupdate
                                defaultValue="1" // Default value
                                disabled={loading}
                                className="dark:bg-dark-900"
                            />
                        </div>

                         {/* Pesan Error */}
                         {formError && <p className="text-sm text-error-500">{formError}</p>}

                        {/* Tombol Aksi */}
                        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <Button type="button" variant="outline" onClick={() => navigate('/barang')} disabled={loading}>
                                Batal
                            </Button>
                            <Button type="submit" variant="primary" disabled={loading || loadingSatuan || !!fetchSatuanError}>
                                {loading ? 'Menyimpan...' : 'Simpan Barang'}
                            </Button>
                        </div>
                    </div>
                </form>
            </ComponentCard>
        </>
    );
}