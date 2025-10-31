import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
// import UserProfiles from "./pages/UserProfiles";
// import Videos from "./pages/UiElements/Videos";
// import Images from "./pages/UiElements/Images";
// import Alerts from "./pages/UiElements/Alerts";
// import Badges from "./pages/UiElements/Badges";
// import Avatars from "./pages/UiElements/Avatars";
// import Buttons from "./pages/UiElements/Buttons";
// import LineChart from "./pages/Charts/LineChart";
// import BarChart from "./pages/Charts/BarChart";
// import Calendar from "./pages/Calendar";
import BarangPage from "./pages/master/Barang";
import BarangTambahPage from "./pages/master/BarangTambah";
import EditBarangPage from "./pages/master/EditBarang";
import SatuanPage from "./pages/master/Satuan";
import VendorPage from "./pages/master/Vendor";
import PengadaanPage from "./pages/Penjualan/Pengadaan";
import DetailPengadaanPage from "./pages/Penjualan/DetailPengadaan";
import PenerimaanPage from "./pages/Penjualan/Penerimaan";
import RolePage from "./pages/master/Role";
import UserPage from "./pages/master/User";
import MarginPenjualanPage from "./pages/master/MarginPenjualan";
import PenjualanPage from "./pages/Penjualan/Penjualan";
// import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";


export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            <Route path="/barang" element={<BarangPage />} />
            <Route path="/barang/tambah" element={<BarangTambahPage />} />
            <Route path="/barang/edit/:id" element={<EditBarangPage />} />
            <Route path="/satuan" element={<SatuanPage />} />
            <Route path="/vendor" element={<VendorPage />} />
            <Route path="/role" element={<RolePage />} />
            <Route path="/user" element={<UserPage />} />
            <Route path="/margin" element={<MarginPenjualanPage />} />

            {/* Tambahkan rute untuk Transaksi (Ganti <Blank /> dengan komponen Anda) */}
            <Route path="/pengadaan" element={<PengadaanPage />} />
            <Route path="/pengadaan/detail" element={<DetailPengadaanPage />} />
            <Route path="/penerimaan" element={<PenerimaanPage />} />
            <Route path="/penjualan" element={<PenjualanPage />} />
            
            {/* Others Page */}
            {/* <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} /> */}

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            {/* <Route path="/basic-tables" element={<BasicTables />} /> */}

            {/* Ui Elements */}
            {/* <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} /> */}

            {/* Charts */}
            {/* <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} /> */}
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
