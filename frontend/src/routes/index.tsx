import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/routes/ProtectedRoute";
import PublicRoute from "@/routes/PublicRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Bills from "@/pages/Bills";
import CreateBill from "@/pages/CreateBill";
import ViewBill from "@/pages/ViewBill";
import EditBill from "@/pages/EditBill";
import ShopBills from "@/pages/ShopBills";
import Purchase from "@/pages/Purchase";
import AddPurchase from "@/pages/AddPurchase";
import ViewPurchase from "@/pages/ViewPurchase";
import EditPurchase from "@/pages/EditPurchase";
import Stock from "@/pages/Stock";
import AddStock from "@/pages/AddStock";
import EditStock from "@/pages/EditStock";
import Shops from "@/pages/Shops";
import ShopDetails from "@/pages/ShopDetails";
import EditShop from "@/pages/EditShop";
import AddShop from "@/pages/AddShop";
import Profile from "@/pages/Profile";
import SettingsPage from "@/pages/Settings";
import BusinessProfile from "@/pages/BusinessProfile";
import Users from "@/pages/Users";
import AddUser from "@/pages/AddUser";
import EditUser from "@/pages/EditUser";
import About from "@/pages/About";
import DataManagement from "@/pages/DataManagement";

function DefaultRedirect() {
  const { user } = useAuth();
  return <Navigate to={user?.role === "MARKETING" ? "/bills" : "/dashboard"} replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["OWNER", "SUPERADMIN"]}><Dashboard /></ProtectedRoute>} />
            <Route path="/bills" element={<Bills />} />
            <Route path="/bills/new" element={<CreateBill />} />
            <Route path="/bills/:id" element={<ViewBill />} />
            <Route path="/bills/:id/edit" element={<EditBill />} />
            <Route path="/bills/shop/:shopId" element={<ShopBills />} />
            <Route path="/purchase" element={<ProtectedRoute allowedRoles={["OWNER", "SUPERADMIN"]}><Purchase /></ProtectedRoute>} />
            <Route path="/purchase/new" element={<ProtectedRoute allowedRoles={["OWNER", "SUPERADMIN"]}><AddPurchase /></ProtectedRoute>} />
            <Route path="/purchase/:id" element={<ProtectedRoute allowedRoles={["OWNER", "SUPERADMIN"]}><ViewPurchase /></ProtectedRoute>} />
            <Route path="/purchase/:id/edit" element={<ProtectedRoute allowedRoles={["OWNER", "SUPERADMIN"]}><EditPurchase /></ProtectedRoute>} />
            <Route path="/stock" element={<ProtectedRoute allowedRoles={["OWNER", "SUPERADMIN"]}><Stock /></ProtectedRoute>} />
            <Route path="/stock/new" element={<ProtectedRoute allowedRoles={["OWNER", "SUPERADMIN"]}><AddStock /></ProtectedRoute>} />
            <Route path="/stock/:id/edit" element={<ProtectedRoute allowedRoles={["OWNER", "SUPERADMIN"]}><EditStock /></ProtectedRoute>} />
            <Route path="/shops" element={<ProtectedRoute allowedRoles={["OWNER", "SUPERADMIN"]}><Shops /></ProtectedRoute>} />
            <Route path="/shops/new" element={<ProtectedRoute allowedRoles={["OWNER", "SUPERADMIN"]}><AddShop /></ProtectedRoute>} />
            <Route path="/shops/:id" element={<ProtectedRoute allowedRoles={["OWNER", "SUPERADMIN"]}><ShopDetails /></ProtectedRoute>} />
            <Route path="/shops/:id/edit" element={<ProtectedRoute allowedRoles={["OWNER", "SUPERADMIN"]}><EditShop /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute allowedRoles={["SUPERADMIN"]}><Users /></ProtectedRoute>} />
            <Route path="/users/new" element={<ProtectedRoute allowedRoles={["SUPERADMIN"]}><AddUser /></ProtectedRoute>} />
            <Route path="/users/:id/edit" element={<ProtectedRoute allowedRoles={["SUPERADMIN"]}><EditUser /></ProtectedRoute>} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/business-profile" element={<ProtectedRoute allowedRoles={["OWNER", "SUPERADMIN"]}><BusinessProfile /></ProtectedRoute>} />
            <Route path="/settings/about" element={<About />} />
            <Route path="/settings/data-management" element={<DataManagement />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<DefaultRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
