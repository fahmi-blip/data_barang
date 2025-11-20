import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { PencilIcon, TrashBinIcon } from "../../icons";
import { Satuan, SatuanAktif, StatusToko } from "../../types/data.d";
import { fetchSatuanData, fetchSatuanDataAktif, deleteSatuanData } from "../../services/DataMasterServices";

export default function SatuanPage() {
  const navigate = useNavigate();
  const [satuanList, setSatuanList] = useState<(Satuan | SatuanAktif)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active">("active");

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (filter === 'active') {
        const data: SatuanAktif[] = await fetchSatuanDataAktif();
        setSatuanList(data);
      } else {
        const data: Satuan[] = await fetchSatuanData();
        setSatuanList(data);
      }
    } catch (err: any) {
      console.error("Gagal load data satuan:", err);
      setError(err.message || "Terjadi kesalahan saat memuat data.");
      setSatuanList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter]);

  const handleDelete = async (id: number, nama: string) => {
    if (!confirm(`Hapus satuan "${nama}"?`)) return;

    try {
      await deleteSatuanData(id);
      alert("Berhasil menghapus satuan!");
      loadData();
    } catch (error: any) {
      alert(error.message || "Gagal menghapus satuan.");
    }
  };

  const renderStatusBadge = (status: StatusToko) => {
    const isActive = Number(status) === 1;
    return (
      <Badge size="sm" color={isActive ? "success" : "error"}>
        {isActive ? "Aktif" : "Nonaktif"}
      </Badge>
    );
  };

  const toggleFilter = () => {
    setFilter(prev => (prev === "active" ? "all" : "active"));
  };

  return (
    <>
      <PageMeta title="Data Satuan" description="Halaman untuk mengelola data master Satuan." />
      <PageBreadcrumb pageTitle="Data Satuan" />
      
      <div className="space-y-6">
        <ComponentCard title="Daftar Satuan">
          <div className="flex justify-end gap-2 mb-4">
            <Button
              size="sm"
              variant="primary"
              onClick={() => navigate('/satuan/tambah')}
            >
              Tambah Satuan Baru
            </Button>
            <Button
              size="sm"
              variant={filter === 'active' ? 'primary' : 'outline'}
              onClick={toggleFilter}
            >
              {filter === 'active' ? 'Tampilkan Semua' : 'Tampilkan Aktif'}
            </Button>
          </div>

          {loading && <p className="text-center py-10 text-gray-500 dark:text-gray-400">Memuat data satuan...</p>}

          {!loading && error && (
            <div className="p-4 bg-error-50 border border-error-500 rounded-lg dark:bg-error-500/15">
              <p className="font-semibold text-error-700 dark:text-error-400">Gagal Memuat Data</p>
              <p className="text-sm text-error-600 dark:text-error-500 mt-1">{error}</p>
              <Button size="sm" variant="outline" onClick={loadData} className="mt-3">Coba Lagi</Button>
            </div>
          )}

          {!loading && !error && (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <Table className="w-full">
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.03]">
                    {filter === "active" ? (
                      <TableRow>
                        <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">ID Satuan</TableCell>
                        <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Nama Satuan</TableCell>
                      </TableRow>
                    ) : (
                      <TableRow>
                        <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">ID Satuan</TableCell>
                        <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Nama Satuan</TableCell>
                        <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Status</TableCell>
                        <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Aksi</TableCell>
                      </TableRow>
                    )}
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {satuanList.length === 0 ? (
                      <TableRow className="hover:bg-gray-50 dark:hover:bg-white/5">
                        <TableCell
                          colSpan={filter === "all" ? 2 : 4}
                          className="px-5 py-6 text-center text-gray-500 dark:text-gray-400"
                        >
                          Tidak ada data satuan.
                        </TableCell>
                      </TableRow>
                    ) : (
                      satuanList.map((item: any) =>
                        filter === "active" ? (
                          <TableRow key={item.idsatuan} className="hover:bg-gray-50 dark:hover:bg-white/5">
                            <TableCell className="px-5 py-4 text-sm">{item.idsatuan}</TableCell>
                            <TableCell className="px-5 py-4 text-sm">{item.nama_satuan}</TableCell>
                          </TableRow>
                        ) : (
                          <TableRow key={item.idsatuan} className="hover:bg-gray-50 dark:hover:bg-white/5">
                            <TableCell className="px-5 py-4 text-sm">{item.idsatuan}</TableCell>
                            <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">{item.nama_satuan}</TableCell>
                            <TableCell className="px-5 py-4 text-sm">{renderStatusBadge(item.status)}</TableCell>
                            <TableCell className="px-5 py-4 text-sm">
                              <div className="flex justify-center items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs !p-1.5"
                                  onClick={() => navigate(`/satuan/edit/${item.idsatuan}`)}
                                >
                                  <PencilIcon className="size-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs !p-1.5 text-error-600 border-error-300 hover:bg-error-50 hover:border-error-500 dark:border-error-500/30 dark:hover:bg-error-500/10 dark:text-error-400"
                                  onClick={() => handleDelete(item.idsatuan, item.nama_satuan)}
                                >
                                  <TrashBinIcon className="size-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      )
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
}