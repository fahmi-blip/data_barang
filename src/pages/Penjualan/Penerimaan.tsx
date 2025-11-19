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
import { ViewPenerimaan } from "../../types/data";
import { StatusToko } from "../../types/data.d";
import { fetchPenerimaanData } from "../../services/DataMasterServices"; // Menggunakan fungsi baru


export default function PenerimaanPage() {
  const navigate = useNavigate();
  const [penerimaanList, setPenerimaanList] = useState<ViewPenerimaan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
          const data = await fetchPenerimaanData(); // Memanggil fungsi fetch Satuan
          setPenerimaanList(data);
        } catch (err: any) {
          const errorMessage = err.message || "Terjadi kesalahan yang tidak diketahui.";
          setError(errorMessage);
          setPenerimaanList([]);
        } finally {
          setLoading(false);
        }
    };
  useEffect(() => {
    loadData();
  }, []);

 const renderStatusBadge = (status: StatusToko | string | number) => {
  const numericStatus = typeof status === "string" ? Number(status) : Number(status);
  const isActive = numericStatus === 1;
  return (
    <Badge size="sm" color={isActive ? "success" : "error"}>
      {isActive ? "Diterima" : "Belum Diterima"}
    </Badge>
  );
};
  return (
    <>
      <PageMeta title="Data Vendor" description="Halaman untuk mengelola data master Vendor." />
      <PageBreadcrumb pageTitle="Data Penerimaan" />
      
      <div className="space-y-6">
        <ComponentCard title="Daftar Penerimaan">
            <div className="flex justify-end mb-4">
                <Button size="sm" variant="primary"
                onClick={() => navigate('/penerimaan/detail')}>
                    Detail Penerimaan
                </Button>
            </div>
            <div className="flex justify-end mb-4">
                <Button size="sm" variant="primary"
                onClick={() => navigate('/penerimaan/tambah')}>
                    Tambah Penerimaan Baru
                </Button>
            </div>

          {loading ? (
            <p className="p-4 text-center text-gray-500 dark:text-gray-400">Memuat data satuan dari server...</p>
          ) : error ? (
            <div className="p-4 bg-error-50 border border-error-500 rounded-lg dark:bg-error-500/15">
                <p className="font-medium text-error-600 dark:text-error-500">Koneksi Gagal!</p>
                <p className="text-sm text-error-500 dark:text-error-400">**{error}**</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Pastikan **Node.js API Server** Anda berjalan dan endpoint `/api/v1/satuan` berfungsi.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <Table className="w-full">
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.03]">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">ID Penerimaan</TableCell>
                      <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Creat_at</TableCell>
                      <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Nama Vendor</TableCell>
                      <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Diterima oleh</TableCell>
                      <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Status</TableCell>
                      <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Aksi</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {penerimaanList.map((item) => (
                      <TableRow key={item.idpenerimaan} className="hover:bg-gray-50 dark:hover:bg-white/5">
                        <TableCell className="px-5 py-4 text-sm">{item.idpenerimaan}</TableCell>
                        <TableCell className="px-5 py-4 text-sm">{item.tanggal_penerimaan}</TableCell>
                        <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">{item.nama_vendor}</TableCell>
                        <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">{item.nama_user}</TableCell>
                        <TableCell className="px-5 py-4 text-sm">{renderStatusBadge(item.status)}</TableCell>
                        <TableCell className="px-5 py-4 text-sm">
                            <div className="flex justify-center items-center space-x-2">
                              {/* <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs !p-1.5" // Ukuran lebih kecil
                                  // onClick={() => handleEditClick(item.idbarang)}
                              >
                                   <PencilIcon className="size-4"/>
                                   {/* <span className="sr-only">Edit {item.nama_barang}</span> */}
                              {/* </Button> */}
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
                    ))}
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