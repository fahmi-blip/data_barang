// src/pages/Master/BarangPage.tsx
import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button"; // Asumsi ikon PlusIcon tersedia
import { ViewBarang, StatusToko } from "../../types/data"; 
import { fetchBarangData } from "../../services/DataMasterServices"; 

export default function BarangPage() {
  // State untuk menyimpan daftar barang yang diambil dari API
  const [barangList, setBarangList] = useState<ViewBarang[]>([]);
  // State untuk melacak status loading
  const [loading, setLoading] = useState(true);
  // State untuk menyimpan pesan error (misal: jika API down/CORS error)
  const [error, setError] = useState<string | null>(null);

  /**
   * Fungsi untuk memuat data dari service layer (yang berkomunikasi dengan Node.js API)
   */
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Panggil fungsi service untuk mengambil data
      const data = await fetchBarangData();
      setBarangList(data);
    } catch (err: any) {
      // Tangani error koneksi atau API
      setError(err.message || "Terjadi kesalahan saat memuat data.");
      setBarangList([]);
    } finally {
      setLoading(false);
    }
  };

  // Efek untuk memuat data saat komponen pertama kali di-mount
  useEffect(() => {
    loadData();
  }, []);

  /**
   * Helper untuk merender Badge status Aktif/Nonaktif
   */
  const renderStatusBadge = (status: StatusToko) => (
    <Badge size="sm" color={status === 1 ? "success" : "error"}>
      {status === 1 ? "Aktif" : "Nonaktif"}
    </Badge>
  );

  return (
    <>
      {/* Meta Title untuk halaman */}
      <PageMeta title="Data Barang" description="Halaman untuk mengelola data master barang." />
      <PageBreadcrumb pageTitle="Data Barang" />
      
      <div className="space-y-6">
        <ComponentCard title="Daftar Barang">
            {/* Tombol Tambah Baru */}
            <div className="flex justify-end mb-4">
                <Button size="sm" variant="primary">
                    Tambah Barang Baru
                </Button>
            </div>

          {loading ? (
            // Tampilan Loading
            <p className="p-4 text-center text-gray-500 dark:text-gray-400">Memuat data dari server Node.js...</p>
          ) : error ? (
            // Tampilan Error Koneksi
            <div className="p-4 bg-error-50 border border-error-500 rounded-lg dark:bg-error-500/15">
                <p className="font-medium text-error-600 dark:text-error-500">Koneksi Gagal!</p>
                <p className="text-sm text-error-500 dark:text-error-400">**{error}**</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Pastikan **Node.js API Server** Anda berjalan di port 8000, dan konfigurasi **CORS** sudah benar.</p>
            </div>
          ) : (
            // Tampilan Data Tabel
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <Table className="w-full">
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3">ID</TableCell>
                      <TableCell isHeader className="px-5 py-3">Nama Barang</TableCell>
                      <TableCell isHeader className="px-5 py-3">Jenis</TableCell>
                      <TableCell isHeader className="px-5 py-3">Satuan</TableCell>
                      <TableCell isHeader className="px-5 py-3">Status</TableCell>
                      <TableCell isHeader className="px-5 py-3">Aksi</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {barangList.map((item) => (
                      <TableRow key={item.idbarang} className="hover:bg-gray-50 dark:hover:bg-white/5">
                        <TableCell className="px-5 py-4">{item.idbarang}</TableCell>
                        <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">{item.nama_barang}</TableCell>
                        <TableCell className="px-5 py-4">{item.jenis === 'B' ? 'Barang' : 'Jasa'}</TableCell>
                        <TableCell className="px-5 py-4">{item.nama_satuan}</TableCell>
                        <TableCell className="px-5 py-4">{renderStatusBadge(item.status)}</TableCell>
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
