// src/pages/Penjualan/DetailPengadaan.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { ViewDetailPengadaan, ViewPengadaan,ViewBarangAktif } from "../../types/data";
import { fetchPengadaanById, fetchPengadaanItems } from "../../services/DataMasterServices";


interface DetailItem {
    id: string; 
    idbarang: number;
    nama_barang: string;
    harga_satuan: number;
    jumlah: number;
    sub_total: number;
}
export default function DetailPengadaanPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ppn, setPpn] = useState(10);
  const [detailItems, setDetailItems] = useState<DetailItem[]>([]);
      const [selectedBarang, setSelectedBarang] = useState('');
      const [jumlah, setJumlah] = useState<number>(0);
      const [hargaSatuan, setHargaSatuan] = useState<number>(0);
      const [barangList, setBarangList] = useState<ViewBarangAktif[]>([]);
      
  const [header, setHeader] = useState<ViewPengadaan | null>(null);
  const [items, setItems] = useState<ViewDetailPengadaan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [headerData, itemsData] = await Promise.all([
            fetchPengadaanById(id),
            fetchPengadaanItems(id)
        ]);
        
        console.log("Header Data:", headerData); 
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

  // const handleNewItem = () => {
        
  //       // const barang = barangList.find(b => String(b.idbarang) === selectedBarang);
  //       // if (!barang) {
  //       //     setError("Barang tidak ditemukan!");
  //       //     return;
  //       // }

  //       const newItem: DetailItem = {
  //           id: `temp-${Date.now()}`,
  //           idbarang: 0,
  //           nama_barang: '',
  //           harga_satuan: hargaSatuan,
  //           jumlah: jumlah,
  //           sub_total: hargaSatuan * jumlah
  //       };

  //       setDetailItems([...detailItems, newItem]);
        
        
  //   };
  const calculateSubtotal = () => {
        return detailItems.reduce((sum, item) => sum + item.sub_total, 0);
    };
  const calculatePPN = () => {
        return (calculateSubtotal() * ppn) / 100;
    };
    const calculateTotal = () => {
        return calculateSubtotal() + calculatePPN();
    };
  const formatDate = (dateString: string | undefined) => {
      if(!dateString) return "-";
      return new Date(dateString).toLocaleString('id-ID', {
          day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
  };

  if (loading) return <p className="p-10 text-center text-gray-500">Memuat detail pengadaan...</p>;
  if (error) return <div className="p-10 text-center text-red-500 bg-red-50 rounded-lg border border-red-200 m-4">Error: {error}</div>;
  if (!header) return <p className="p-10 text-center">Data tidak ditemukan.</p>;

  return (
    <>
      <PageMeta title={`Detail Pengadaan #${id}`} description="Detail transaksi pengadaan" />
      <PageBreadcrumb pageTitle="Detail Pengadaan" />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <Button size="sm" variant="outline" onClick={() => navigate('/pengadaan')}>
                &larr; Kembali ke Daftar
            </Button>
      </div>


        <ComponentCard title="Informasi Transaksi">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-2">
                <div>
                    <label className="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-1">No. Pengadaan</label>
                    <p className="text-xl font-bold text-gray-800 dark:text-white">#{header.idpengadaan}</p>
                </div>
                <div>
                    <label className="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-1">Tanggal</label>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">{formatDate(header.tanggal_pengadaan)}</p>
                </div>
                <div>
                    <label className="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-1">Vendor</label>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">{header.nama_vendor}</p>
                </div>
                <div>
                    <label className="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-1">Pembuat</label>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">{header.nama_user}</p>
                </div>
                <div>
                    <label className="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-1">Status Transaksi</label>
                    <div>
                        {header.status === 1 || Number(header.status) === 1 ? (
                            <Badge size="sm" color="success">Aktif</Badge>
                        ) : (
                            <Badge size="sm" color="error">Batal/Nonaktif</Badge>
                        )}
                    </div>
                </div>
                 <div>
                    <label className="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-1">Status Penerimaan</label>
                    <div>
                        {Number(header.is_received)  >0 ? (
                             <Badge size="sm" color="success">Sudah Diterima</Badge>
                        ) : (
                             <Badge size="sm" color="warning">Belum Diterima</Badge>
                        )}
                    </div>
                </div>
            </div>
        </ComponentCard>

        <ComponentCard title={`Daftar Item (${items.length} Barang)`}>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <Table className="w-full">
                <TableHeader className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 w-16 text-center">No</TableCell>
                    <TableCell isHeader className="px-5 py-3">Nama Barang</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-right">Harga Satuan</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-center">Qty</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-right">Sub Total</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {items.map((item, index) => (
                    <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-white/5">
                      <TableCell className="px-5 py-4 text-center text-gray-500">{index + 1}</TableCell>
                      <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white">
                          {item.nama_barang}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-right font-mono">
                          Rp {item.harga_satuan.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-center">
                          <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                              {item.jumlah}
                          </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-right font-mono font-semibold text-brand-600 dark:text-brand-400">
                          Rp {item.sub_total.toLocaleString('id-ID')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* <div className="flex items-end">
                            <Button
                                type="button"
                                variant="primary"
                                size="md"
                                onClick={handleNewItem}
                                disabled={loading}
                                className="w-full"
                            >
                                Tambah Item
                            </Button>
                        </div> */}
            <div className="mt-6 flex justify-end">
                <div className="w-full md:w-1/3 bg-gray-50 p-6 rounded-lg border border-gray-200 dark:bg-white/5 dark:border-white/10 space-y-3">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>Subtotal</span>
                        <span>Rp {header.subtotal_nilai.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>PPN (10%)</span>
                        <span>Rp {header.ppn.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <span className="text-base font-bold text-gray-900 dark:text-white">Total Akhir</span>
                        <span className="text-xl font-bold text-brand-600 dark:text-brand-400">
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