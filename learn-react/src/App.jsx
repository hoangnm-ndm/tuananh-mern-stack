import { Route, Routes } from "react-router";
import "./App.css";
import Layout from "./components/Layout";
import AboutPage from "./pages/AboutPage";
import DashBoardPage from "./pages/admin/DashBoardPage";
import ContactPage from "./pages/ContactPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProductPage from "./pages/ProductPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./ProtectedRoute";
import ProductManagement from "./pages/admin/ProductManagement";

const App = () => {
  return (
    <>
      <Routes>
        {/* Client */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="san-pham" element={<ProductPage />} />
          <Route path="san-pham/:id" element={<ProductDetailPage />} />
          <Route path="lien-he" element={<ContactPage />} />
          <Route path="ve-chung-toi" element={<AboutPage />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route index element={<DashBoardPage />} />
          <Route path="products" element={<ProductManagement />} />
        </Route>

        {/* Empty layout */}
        <Route path="dang-ky" element={<RegisterPage />} />
        <Route path="dang-nhap" element={<LoginPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
};

export default App;
