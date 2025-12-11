import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import { ViewDetailPenjualan, ViewPenjualan } from "../../types/data";
import { fetchPenjualanById, fetchPenjualanItems } from "../../services/DataMasterServices";

export default function DetailPenjualanPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [header, setHeader] = useState<ViewPenjualan | null>(null);
  const [items, setItems] = useState<ViewDetailPenjualan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [headerData, itemsData] = await Promise.all([
            fetchPenjualanById(id),
            fetchPenjualanItems(id)
        ]);
        setHeader(headerData);
        setItems(itemsData);
      } catch (err: any) {
        setError(err.message || "Gagal memuat detail transaksi.");
      } finally {
        setLoading(false);
      }
    };
    loadData(); 
  }, [id]);

  const formatDate = (dateString: string | undefined) => {
      if(!dateString) return "-";
      return new Date(dateString).toLocaleString('id-ID', {
          day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
  };

  if (loading) return <p className="p-10 text-center text-gray-500">Memuat detail penjualan...</p>;
  if (error) return <div className="p-4 m-4 bg-red-50 text-red-600 border border-red-200 rounded">{error}</div>;
  if (!header) return <p className="p-10 text-center">Data tidak ditemukan.</p>;

  return (
    <>
      <PageMeta title={`Detail Penjualan #${id}`} description="Detail transaksi penjualan" />
      <PageBreadcrumb pageTitle="Detail Penjualan" />
      
      <div className="space-y-6">
        <Button size="sm" variant="outline" onClick={() => navigate('/penjualan')}>
            &larr; Kembali ke Daftar
        </Button>

        <ComponentCard title="Informasi Penjualan">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                    <label className="text-xs text-gray-500 uppercase font-bold block mb-1">No. Struk / ID</label>
                    <p className="text-xl font-bold text-gray-800 dark:text-white">#{header.idpenjualan}</p>
                </div>
                <div>
                    <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Waktu Transaksi</label>
                    <p className="text-gray-800 dark:text-white">{formatDate(header.tanggal_penjualan)}</p>
                </div>
                <div>
                    <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Kasir</label>
                    <p className="text-gray-800 dark:text-white font-medium">{header.nama_user}</p>
                </div>
                <div>
                    <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Margin Digunakan</label>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {header.margin_penjualan}%
                    </span>
                </div>
            </div>
        </ComponentCard>

        <ComponentCard title={`Keranjang Belanja (${items.length} Item)`}>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <Table className="w-full">
                <TableHeader className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 w-12 text-center">No</TableCell>
                    <TableCell isHeader className="px-5 py-3">Nama Barang</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-right">Harga Jual</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-center">Qty</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-right">Sub Total</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {items.map((item, index) => (
                    <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-white/5">
                      <TableCell className="px-5 py-4 text-center text-gray-500">{index + 1}</TableCell>
                      <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white">{item.nama_barang}</TableCell>
                      <TableCell className="px-5 py-4 text-right">Rp {item.harga_satuan.toLocaleString('id-ID')}</TableCell>
                      <TableCell className="px-5 py-4 text-center">
                          <span className="font-bold bg-gray-100 text-gray-800 px-2 py-1 rounded dark:bg-gray-700 dark:text-white">
                              {item.jumlah}
                          </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-right font-semibold text-brand-600">Rp {item.subtotal.toLocaleString('id-ID')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6 flex justify-end">
                <div className="w-full md:w-1/3 bg-gray-50 p-6 rounded-lg border border-gray-200 dark:bg-white/5 dark:border-white/10 space-y-2">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>Subtotal</span>
                        <span>Rp {header.subtotal_nilai.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>PPN</span>
                        <span>Rp {header.ppn.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">Total Bayar</span>
                        <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                            Rp {header.total_nilai.toLocaleString('id-ID')}
                        </span>
                    </div>
                </div>
            </div>
        </ComponentCard>
      </div>
    </>
  );
}