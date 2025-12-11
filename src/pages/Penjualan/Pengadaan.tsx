import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { useNavigate } from "react-router-dom";
import { InfoIcon, PlusIcon } from "../../icons"; 
import { PencilIcon, TrashBinIcon} from "../../icons";
import { EyeIcon } from "../../icons";
import { ViewPengadaan } from "../../types/data";
import { StatusToko } from "../../types/data.d";
import { fetchPengadaanData } from "../../services/DataMasterServices"; 

export default function PengadaanPage() {
  const navigate = useNavigate();
  const [pengadaanList, setPengadaanList] = useState<ViewPengadaan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPengadaanData();
       console.log("🔍 Data dari API:", data); 
      setPengadaanList(data);
    } catch (err: any) {
      const errorMessage = err.message || "Terjadi kesalahan yang tidak diketahui.";
      setError(errorMessage);
      setPengadaanList([]);
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
      {isActive ? "Aktif" : "Nonaktif"}
    </Badge>
  );
};

const renderPenerimaanBadge = (isReceived: number | undefined) => {
  if (isReceived && isReceived > 0 ) {
    return <Badge size="sm" color="success">Diterima</Badge>;
  }
  return <Badge size="sm" color="warning">Belum Diterima</Badge>;
};

const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };


  return (
    <>
      <PageMeta title="Data Vendor" description="Halaman untuk mengelola data master Vendor." />
      <PageBreadcrumb pageTitle="Data Pengadaan" />
      
      <div className="space-y-6">
        <ComponentCard title="Daftar Pengadaan">
            
            <div className="flex justify-end mb-4">
                <Button size="sm" variant="primary"
                onClick={() => navigate('/pengadaan/tambah')}>
                    Tambah Pengadaan Baru
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
                      <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">ID Pengadaan</TableCell>
                      <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Tanggal Pengadaan</TableCell>
                      <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Nama User</TableCell>
                      <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Nama Vendor</TableCell>
                      <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">SubTotal Nilai</TableCell>
                      <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">PPN</TableCell>
                      <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Total Nilai</TableCell>
                      <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Status Penerimaan</TableCell>
                      <TableCell isHeader className="px-5 py-3 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">Aksi</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {pengadaanList.map((item) => (
                      <TableRow key={item.idpengadaan} className="hover:bg-gray-50 dark:hover:bg-white/5">
                        <TableCell className="px-5 py-4 text-sm">{item.idpengadaan}</TableCell>
                        <TableCell className="px-5 py-4 text-sm">{formatDate(item.tanggal_pengadaan)}</TableCell>
                        <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">{item.nama_user}</TableCell>
                        <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">{item.nama_vendor}</TableCell>
                        <TableCell className="px-5 py-4 text-sm">{item.subtotal_nilai}</TableCell>
                        <TableCell className="px-5 py-4 text-sm">{item.ppn}</TableCell>
                        <TableCell className="px-5 py-4 text-sm">{item.total_nilai}</TableCell>
                        <TableCell className="px-5 py-4 text-sm">{renderPenerimaanBadge(item.is_received)}</TableCell>
                        <TableCell className="px-5 py-4 text-sm">
                            <div className="flex items-center space-x-2">
                               <Button
                                  size="sm"
                                  className="!p-1.5"
                                  onClick={() => navigate(`/pengadaan/detail/${item.idpengadaan}`)}
                               >
                                   <svg
                                     className="fill-white dark:hover:fill-white"
                                     width="18"
                                     height="18"
                                     viewBox="0 0 24 24"
                                     fill="none"
                                     xmlns="http://www.w3.org/2000/svg"
                                   >
                                     <path
                                       fillRule="evenodd"
                                       clipRule="evenodd"
                                       d="M3.5 12C3.5 7.30558 7.30558 3.5 12 3.5C16.6944 3.5 20.5 7.30558 20.5 12C20.5 16.6944 16.6944 20.5 12 20.5C7.30558 20.5 3.5 16.6944 3.5 12ZM12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM11.0991 7.52507C11.0991 8.02213 11.5021 8.42507 11.9991 8.42507H12.0001C12.4972 8.42507 12.9001 8.02213 12.9001 7.52507C12.9001 7.02802 12.4972 6.62507 12.0001 6.62507H11.9991C11.5021 6.62507 11.0991 7.02802 11.0991 7.52507ZM12.0001 17.3714C11.5859 17.3714 11.2501 17.0356 11.2501 16.6214V10.9449C11.2501 10.5307 11.5859 10.1949 12.0001 10.1949C12.4143 10.1949 12.7501 10.5307 12.7501 10.9449V16.6214C12.7501 17.0356 12.4143 17.3714 12.0001 17.3714Z"
                                       fill=""
                                     />
                                   </svg>
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
