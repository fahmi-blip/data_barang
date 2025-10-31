// src/pages/Penjualan/DetailPengadaan.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import { ViewDetailPenjualan} from "../../types/data"; // Perlu ditambahkan di types
import { fetchDetailPenjualanData } from "../../services/DataMasterServices"; // Perlu ditambahkan di services

export default function DetailPenjualanPage() {
  const navigate = useNavigate();
  const [detailList, setDetailList] = useState<ViewDetailPenjualan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchDetailPenjualanData();
        setDetailList(data);
      } catch (err: any) {
        const errorMessage = err.message || "Terjadi kesalahan yang tidak diketahui.";
        setError(errorMessage);
        setDetailList([]);
      } finally {
        setLoading(false);
      }
    };
    loadData(); 
  }, []);


  return (
    <>
      <PageMeta title={`Detail Penjualan`} description="Detail item pada transaksi pengadaan." />
      <PageBreadcrumb pageTitle={`Detail Penjualan`} />
      
      <div className="space-y-6">
        <ComponentCard title="Daftar Barang Penjualan">
            <div className="flex justify-start mb-4">
                <Button size="sm" variant="outline" onClick={() => navigate('/penjualan')}>
                    Kembali ke Daftar Penjualan
                </Button>
            </div>

          {loading ? (
            <p className="p-4 text-center text-gray-500 dark:text-gray-400">Memuat data detail...</p>
          ) : error ? (
            <div className="p-4 bg-error-50 border border-error-500 rounded-lg dark:bg-error-500/15">
                <p className="font-medium text-error-600 dark:text-error-500">Koneksi Gagal!</p>
                <p className="text-sm text-error-500 dark:text-error-400">{error}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Pastikan server API berjalan dan endpoint untuk `view_detail_pengadaan` sudah dibuat.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <Table className="w-full">
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3">ID Detail</TableCell>
                      <TableCell isHeader className="px-5 py-3">Nama Barang</TableCell>
                      <TableCell isHeader className="px-5 py-3">Harga Satuan</TableCell>
                      <TableCell isHeader className="px-5 py-3">Jumlah</TableCell>
                      <TableCell isHeader className="px-5 py-3">Sub Total</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {detailList.map((item) => (
                      <TableRow key={item.iddetail_penjualan} className="hover:bg-gray-50 dark:hover:bg-white/5">
                        <TableCell className="px-5 py-4">{item.iddetail_penjualan}</TableCell>
                        <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">{item.nama_barang}</TableCell>
                        <TableCell className="px-5 py-4">{item.harga_satuan}</TableCell>
                        <TableCell className="px-5 py-4">{item.jumlah}</TableCell>
                        <TableCell className="px-5 py-4">{item.subtotal}</TableCell>
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