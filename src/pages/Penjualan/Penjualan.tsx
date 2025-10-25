// src/pages/Master/SatuanPage.tsx

import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { PlusIcon } from "../../icons"; 

// Import tipe data dan service
import { ViewPenjualan } from "../../types/data";
import { StatusToko } from "../../types/data.d";
import { fetchPenjualanData } from "../../services/DataMasterServices"; // Menggunakan fungsi baru


export default function PenjualanPage() {
  const [penjualanList, setPenjualanList] = useState<ViewPenjualan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
          const data = await fetchPenjualanData(); // Memanggil fungsi fetch Satuan
          setPenjualanList(data);
        } catch (err: any) {
          const errorMessage = err.message || "Terjadi kesalahan yang tidak diketahui.";
          setError(errorMessage);
          setPenjualanList([]);
        } finally {
          setLoading(false);
        }
    };
  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      <PageMeta title="Data Vendor" description="Halaman untuk mengelola data master Vendor." />
      <PageBreadcrumb pageTitle="Data Penjualan" />
      
      <div className="space-y-6">
        <ComponentCard title="Daftar Penjualan">
            <div className="flex justify-end mb-4">
                <Button size="sm" variant="primary">
                    Tambah Penjualan Baru
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
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3">ID Penjualan</TableCell>
                      <TableCell isHeader className="px-5 py-3">Creat_at</TableCell>
                      <TableCell isHeader className="px-5 py-3">SubTotal Nilai</TableCell>
                      <TableCell isHeader className="px-5 py-3">PPN</TableCell>
                      <TableCell isHeader className="px-5 py-3">Total Nilai</TableCell>
                      <TableCell isHeader className="px-5 py-3">User</TableCell>
                      <TableCell isHeader className="px-5 py-3">Margin</TableCell>
                      <TableCell isHeader className="px-5 py-3">Aksi</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {penjualanList.map((item) => (
                      <TableRow key={item.idpenjualan} className="hover:bg-gray-50 dark:hover:bg-white/5">
                        <TableCell className="px-5 py-4">{item.idpenjualan}</TableCell>
                        <TableCell className="px-5 py-4">{item.created_at}</TableCell>
                        <TableCell className="px-5 py-4">{item.subtotal_nilai}</TableCell>
                        <TableCell className="px-5 py-4">{item.ppn}</TableCell>
                        <TableCell className="px-5 py-4">{item.total_nilai}</TableCell>
                        <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">{item.nama_user}</TableCell>
                        <TableCell className="px-5 py-4">{item.margin}</TableCell>
                        <TableCell className="px-5 py-4">
                            <Button size="sm" variant="outline" className="text-xs">Edit</Button>
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