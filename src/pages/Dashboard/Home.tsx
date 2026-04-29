import { useEffect, useState } from "react";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import PageMeta from "../../components/common/PageMeta";
import {
  fetchBarangActiveData,
  fetchPenjualanData,
  fetchPenerimaanData,
} from "../../services/DataMasterServices";

export default function Home() {
  const [dashboardData, setDashboardData] = useState<{
    totalBarang: number;
    totalPenjualan: number;
    totalPenerimaan: number;
  }>({ totalBarang: 0, totalPenjualan: 0, totalPenerimaan: 0 });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [barangs, penjualans, penerimaans] = await Promise.all([
          fetchBarangActiveData(),
          fetchPenjualanData(),
          fetchPenerimaanData(),
        ]);

        setDashboardData({
          totalBarang: barangs.length,
          totalPenjualan: penjualans.length,
          totalPenerimaan: penerimaans.length,
        });
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      }
    };

    loadData();
  }, []);

  return (
    <>
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Row 1: 3 Metric Cards */}
        <div className="col-span-12">
          <EcommerceMetrics
            totalBarang={dashboardData.totalBarang}
            totalPenjualan={dashboardData.totalPenjualan}
            totalPenerimaan={dashboardData.totalPenerimaan}
          />
        </div>

        {/* Row 2: Monthly Sales Chart */}
        <div className="col-span-12">
          <MonthlySalesChart />
        </div>

        {/* Row 3: Recent Orders */}
        <div className="col-span-12">
          <RecentOrders />
        </div>
      </div>
    </>
  );
}
