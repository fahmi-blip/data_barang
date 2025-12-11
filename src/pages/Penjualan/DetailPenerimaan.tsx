import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { ViewDetailPenerimaan, ViewPenerimaan } from "../../types/data";
import { fetchPenerimaanById, fetchPenerimaanItems } from "../../services/DataMasterServices";

export default function DetailPenerimaanPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [header, setHeader] = useState<ViewPenerimaan | null>(null);
  const [items, setItems] = useState<ViewDetailPenerimaan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [headerData, itemsData] = await Promise.all([
            fetchPenerimaanById(id),
            fetchPenerimaanItems(id)
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

  if (loading) return <p className="p-10 text-center text-gray-500">Memuat detail penerimaan...</p>;
  if (error) return <div className="p-4 m-4 bg-red-50 text-red-600 border border-red-200 rounded">{error}</div>;
  if (!header) return <p className="p-10 text-center">Data tidak ditemukan.</p>;

  return (
    <>
      <PageMeta title={`Detail Penerimaan #${id}`} description="Detail transaksi penerimaan" />
      <PageBreadcrumb pageTitle="Detail Penerimaan" />
      
      <div className="space-y-6">
        <Button size="sm" variant="outline" onClick={() => navigate('/penerimaan')}>
            &larr; Kembali ke Daftar
        </Button>

        <ComponentCard title="Informasi Penerimaan">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                    <label className="text-xs text-gray-500 uppercase font-bold block mb-1">ID Penerimaan</label>
                    <p className="text-xl font-bold text-gray-800 dark:text-white">#{header.idpenerimaan}</p>
                </div>
                <div>
                    <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Tanggal Terima</label>
                    <p className="text-gray-800 dark:text-white">{formatDate(header.tanggal_penerimaan)}</p>
                </div>
                <div>
                    <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Vendor Asal</label>
                    <p className="font-medium text-gray-800 dark:text-white">{header.nama_vendor}</p>
                </div>
                <div>
                    <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Diterima Oleh</label>
                    <p className="text-gray-800 dark:text-white">{header.nama_user}</p>
                </div>
                <div>
                    <label className="text-xs text-gray-500 uppercase font-bold block mb-1">ID Pengadaan Ref.</label>
                    <Button size="sm" variant="outline" className="text-xs py-1 h-auto" onClick={() => navigate(`/pengadaan/detail/${header.idpengadaan}`)}>
                        Lihat Pengadaan #{header.idpengadaan}
                    </Button>
                </div>
                <div>
                    <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Status</label>
                    {header.status === '1' || Number(header.status) === 1 ? (
                        <Badge color="success">Selesai</Badge>
                    ) : (
                        <Badge color="warning">Proses</Badge>
                    )}
                </div>
            </div>
        </ComponentCard>

        <ComponentCard title={`Barang Diterima (${items.length} Item)`}>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <Table className="w-full">
                <TableHeader className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 w-12 text-center">No</TableCell>
                    <TableCell isHeader className="px-5 py-3">Nama Barang</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-center">Jml Diterima</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-right">Harga Satuan</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-right">Sub Total</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {items.map((item, index) => (
                    <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-white/5">
                      <TableCell className="px-5 py-4 text-center text-gray-500">{index + 1}</TableCell>
                      <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white">{item.nama_barang}</TableCell>
                      <TableCell className="px-5 py-4 text-center">
                          <span className="font-bold bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            {item.jumlah_terima}
                          </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-right">Rp {item.harga_satuan_terima.toLocaleString('id-ID')}</TableCell>
                      <TableCell className="px-5 py-4 text-right font-semibold text-brand-600">Rp {item.sub_total_terima.toLocaleString('id-ID')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
        </ComponentCard>
      </div>
    </>
  );
}