import { useState, useEffect,FormEvent} from "react";
import { useNavigate } from "react-router-dom";
import { addBarangData, fetchSatuanOptions } from "../../services/DataMasterServices";
import { StatusToko} from "../../types/data";
import ComponentCard from "../../components/common/ComponentCard";
import { Satuan } from "../../types/data";

interface SelectOption {
    value: string;
    label: string;
}
export default function BarangTambah() {
    const navigate = useNavigate();
    const [nama, setNama] = useState("");
    const [jenis, setJenis] = useState("B");
    const [idSatuan, setIdSatuan] = useState<string>("");
    const [status, setStatus] = useState<StatusToko>(1);
    const [loading, setLoading] = useState(false);
    const [loadingSatuan, setLoadingSatuan] = useState(true); // State loading untuk satuan
    const [satuanOptions, setSatuanOptions] = useState<SelectOption[]>([]); // State untuk menyimpan opsi satuan
    const [formError, setFormError] = useState<string | null>(null); // State untuk error submit
    const [fetchSatuanError, setFetchSatuanError] = useState<string | null>(null);

    useEffect(() => {
        const loadSatuan = async () => {
            setLoadingSatuan(true);
            setFetchSatuanError(null);
            try {
                const dataSatuan = await fetchSatuanOptions(); // Panggil service
                const options = dataSatuan.map(satuan => ({
                    value: String(satuan.idsatuan), // Value tetap ID (dalam string)
                    label: satuan.nama_satuan      // Label adalah nama
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
        try {
            await addBarangData({
                nama,
                jenis,
                idsatuan: Number(idSatuan),
                status
            });
            alert("Barang berhasil ditambahkan!");
            navigate("/barang");
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Gagal menambah barang");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ComponentCard title="Tambah Barang">
        <form onSubmit={handleSubmit}>

            <div className="mb-3">
                <label>Nama</label>
                <input type="text" className="border p-2 w-full"
                       onChange={(e) => setNama(e.target.value)}
                       required />
            </div>

            <div className="mb-3">
                <label>Jenis</label>
                <select className="border p-2 w-full"
                        onChange={(e) => setJenis(e.target.value)}>
                    <option value="B">Barang</option>
                </select>
            </div>

            <div className="mb-3">
                    <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-400">Satuan</label>
                    <select
                        className="border p-2 w-full  dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        value={idSatuan} // Bind value (ID satuan)
                        onChange={(e) => setIdSatuan(e.target.value)}
                        required
                        disabled={loading || loadingSatuan || !!fetchSatuanError || satuanOptions.length === 0} // Disable saat loading/error/kosong
                    >
                        <option value="" disabled>
                            {loadingSatuan ? "Memuat satuan..." : "-- Pilih Satuan --"}
                        </option>
                        {satuanOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label} {/* Tampilkan nama satuan */}
                            </option>
                        ))}
                    </select>
                     {/* Tampilkan pesan jika satuan kosong dan tidak error */}
                    { !loadingSatuan && !fetchSatuanError && satuanOptions.length === 0 &&
                        <p className="text-xs text-yellow-600 mt-1">Tidak ada satuan aktif.</p>
                    }
                </div>

            <div className="mb-3">
                <label>Status</label>
                <select value={status} className="border p-2 w-full"
                        onChange={(e) => setStatus(Number(e.target.value) as StatusToko)}>
                    <option value={1}>Aktif</option>
                    <option value={0}>Nonaktif</option>
                </select>
            </div>

            <button type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                {loading ? "Menyimpan..." : "Simpan"}
            </button>
            <button type="button"
                    onClick={() => navigate("/barang")}
                    className="px-4 py-2 bg-gray-400 text-white rounded-lg ml-2">
                    Kembali 
            </button>
        </form>
        </ComponentCard>
    )
}
