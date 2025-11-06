// src/pages/Penjualan/TambahPengadaan.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import PageMeta from "../../components/common/PageMeta";

// Kita perlu membuat fungsi 'addPengadaanData' di service
import { addPengadaanData, fetchVendorData } from "../../services/DataMasterServices"; 
import { Vendor } from "../../types/db"; 
import { PengadaanSPBody } from "../../types/data"; // Kita akan buat tipe ini

interface SelectOption {
    value: string;
    label: string;
}

export default function TambahPengadaanPage() {
    const [idVendor, setIdVendor] = useState('');
    const [subtotal, setSubtotal] = useState(0);
    const [ppn, setPpn] = useState(11); // Default PPN 11%
    const [vendorOptions, setVendorOptions] = useState<SelectOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Mengambil data vendor untuk dropdown
    useEffect(() => {
        const loadVendors = async () => {
            try {
                const vendors = await fetchVendorData();
                const options = vendors
                    .filter(v => Number(v.status) === 1) // Hanya vendor aktif
                    .map(v => ({ value: String(v.idvendor), label: v.nama_vendor }));
                setVendorOptions(options);
            } catch (err: any) {
                setError("Gagal memuat data vendor: " + err.message);
            }
        };
        loadVendors();
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        if (!idVendor || subtotal <= 0) {
            setError("Vendor dan Subtotal (lebih dari 0) wajib diisi.");
            setLoading(false);
            return;
        }

        // Data ini akan dikirim ke API untuk memanggil SP Anda
        const dataUntukSP: PengadaanSPBody = {
            // Ganti '1' dengan ID user yang sedang login
            p_user_id: 1, 
            p_vendor_id: parseInt(idVendor),
            p_subtotal: subtotal,
            p_ppn: ppn 
        };

        try {
            const hasil = await addPengadaanData(dataUntukSP); 
            alert('Pengadaan baru berhasil ditambahkan! ID: ' + hasil.data.idpengadaan);
            // Arahkan ke halaman detail pengadaan (jika ada) atau kembali ke list
            navigate('/pengadaan'); 
        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan saat menyimpan.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <PageMeta title="Tambah Pengadaan" />
            <PageBreadcrumb pageTitle="Tambah Pengadaan Baru" />
            <ComponentCard title="Form Pengadaan (Header)">
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="vendor">Vendor</Label>
                            <Select
                                options={vendorOptions}
                                value={idVendor}
                                onChange={(value) => setIdVendor(value)}
                                placeholder="Pilih Vendor"
                                required
                                disabled={loading || vendorOptions.length === 0}
                                className="dark:bg-dark-900"
                            />
                        </div>
                        <div>
                            <Label htmlFor="subtotal">Subtotal Nilai</Label>
                            <Input
                                id="subtotal"
                                type="number"
                                value={subtotal}
                                onChange={(e) => setSubtotal(parseInt(e.target.value) || 0)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <Label htmlFor="ppn">PPN (%)</Label>
                            <Input
                                id="ppn"
                                type="number"
                                value={ppn}
                                onChange={(e) => setPpn(parseFloat(e.target.value) || 0)}
                                required
                                disabled={loading}
                            />
                        </div>
                        
                        {error && <p className="text-sm text-error-500 bg-error-50 p-3 rounded-lg dark:bg-error-500/15">{error}</p>}

                        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <Button type="button" variant="outline" onClick={() => navigate('/pengadaan')} disabled={loading}>
                                Batal
                            </Button>
                            <Button type="submit" variant="primary" disabled={loading}>
                                {loading ? 'Menyimpan...' : 'Simpan Pengadaan'}
                            </Button>
                        </div>
                    </div>
                </form>
            </ComponentCard>
        </>
    );
}