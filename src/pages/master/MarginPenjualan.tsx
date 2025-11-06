// src/pages/Master/SatuanPage.tsx

import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { useNavigate } from "react-router-dom";
import { PlusIcon } from "../../icons"; 
import { PencilIcon, TrashBinIcon} from "../../icons";
// Import tipe data dan service
import { MarginPenjualan, MarginPenjualanAktif} from "../../types/data";
import { StatusToko } from "../../types/data.d";
import { fetchMarginPenjualan, fetchMarginPenjualanAktif } from "../../services/DataMasterServices"; // Menggunakan fungsi baru

export default function MarginPenjualanPage() {
  // const navigate = useNavigate();
  const [marginPenjualanList, setMarginPenjualanList] = useState<(MarginPenjualan | MarginPenjualanAktif)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active">("all");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (filter === "active") {
        const data: MarginPenjualanAktif[] = await fetchMarginPenjualanAktif();
        setMarginPenjualanList(data);
      } else {
        const data: MarginPenjualan[] = await fetchMarginPenjualan();
        setMarginPenjualanList(data);
      }
    } catch (err: any) {
      const errorMessage = err.message || "Terjadi kesalahan yang tidak diketahui.";
      setError(errorMessage);
      setMarginPenjualanList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter]);

const renderStatusBadge = (status: StatusToko) => {
    const isActive = Number(status) === 1;
    return (
        <Badge size="sm" color={isActive ? "success" : "error"}>
            {isActive ? "Aktif" : "Nonaktif"}
        </Badge>
    );
};

const toggleFilter = () => {
        setFilter(prev => (prev === "all" ? "active" : "all"));
    };

  return (
    <>
      <PageMeta title="Data Vendor" description="Halaman untuk mengelola data master Vendor." />
      <PageBreadcrumb pageTitle="Data Margin Penjualan" />
      
      <div className="space-y-6">
        <ComponentCard title="Daftar Margin Penjualan">
          <div className="flex justify-end mb-4">
                <Button size="sm" variant="primary">
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
          {loading && <p className="text-center py-10 text-gray-500 dark:text-gray-400">Memuat data barang...</p>}

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
                  <TableHeader className="border-b border-gray-100 bg-white dark:border-white/[0.05] dark:bg-gray-800">
                    {filter == "all" ? (
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">ID Margin</TableCell>
                      <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Creat At</TableCell>
                      <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Persen</TableCell>
                      <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Status</TableCell>
                      <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">User</TableCell>
                      <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Update At</TableCell>
                      <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Aksi</TableCell>
                    </TableRow>
                    ) : (
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">ID Margin</TableCell>
                      <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Persen</TableCell>
                      <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Dibuat Oleh</TableCell>
                      <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Update at</TableCell> 
                  </TableRow>
                    )}
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {marginPenjualanList.length === 0 ? (
                      <TableRow className="hover:bg-gray-50 dark:hover:bg-white/5">
                          <TableCell
                              colSpan={filter === "active" ? 2 : 4}
                              className="px-5 py-6 text-center text-gray-500 dark:text-gray-400"
                          >
                              Tidak ada data barang.
                          </TableCell>
                      </TableRow>
                    ) : (
                      marginPenjualanList.map((item: any) =>
                        filter === "active" ? (
                          <TableRow key={item.idmargin_penjualan} className="hover:bg-gray-50 dark:hover:bg-white/5">
                        <TableCell className="px-5 py-4 text-sm">{item.idmargin_penjualan}</TableCell>
                        <TableCell className="px-5 py-4 text-sm">{item.persen}</TableCell>
                        <TableCell className="px-5 py-4 text-sm">{item.dibuat_oleh}</TableCell>
                        <TableCell className="px-5 py-4 text-sm">{item.update_at}</TableCell>
                          </TableRow>
                        ) : (
                      <TableRow key={item.idmargin_penjualan} className="hover:bg-gray-50 dark:hover:bg-white/5">
                        <TableCell className="px-5 py-4 text-sm">{item.idmargin_penjualan}</TableCell>
                        <TableCell className="px-5 py-4 text-sm">{item.created_at}</TableCell>
                        <TableCell className="px-5 py-4 text-sm">{item.persen}</TableCell>
                        <TableCell className="px-5 py-4 text-sm">{renderStatusBadge(item.status)}</TableCell>
                        <TableCell className="px-5 py-4 text-sm">{item.dibuat_oleh}</TableCell>
                        <TableCell className="px-5 py-4 text-sm">{item.update_at}</TableCell>
                        <TableCell className="px-5 py-4 text-sm">
                            <div className="flex justify-center items-center space-x-2">
                               <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs !p-1.5" 
                                  // onClick={() => handleEditClick(item.idbarang)}
                              >
                                   <PencilIcon className="size-4"/>
                                   {/* <span className="sr-only">Edit {item.nama_barang}</span>  */}
                              </Button>
                               <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs !p-1.5 text-error-600 border-error-300 hover:bg-error-50 hover:border-error-500 dark:border-error-500/30 dark:hover:bg-error-500/10 dark:text-error-400"
                                  // onClick={() => handleDeleteClick(item.idbarang, item.nama_barang)}
                               >
                                   <TrashBinIcon className="size-4"/>
                                   {/* <span className="sr-only">Hapus {item.nama_barang}</span> */}
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