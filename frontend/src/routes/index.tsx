import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/routes/ProtectedRoute";
import PublicRoute from "@/routes/PublicRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Bills from "@/pages/Bills";
import Purchase from "@/pages/Purchase";
import Stock from "@/pages/Stock";
import AddStock from "@/pages/AddStock";
import EditStock from "@/pages/EditStock";
import Shops from "@/pages/Shops";
import ShopDetails from "@/pages/ShopDetails";
import EditShop from "@/pages/EditShop";
import AddShop from "@/pages/AddShop";
import Profile from "@/pages/Profile";
import SettingsPage from "@/pages/Settings";

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
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["OWNER"]}><Dashboard /></ProtectedRoute>} />
            <Route path="/bills" element={<Bills />} />
            <Route path="/purchase" element={<ProtectedRoute allowedRoles={["OWNER"]}><Purchase /></ProtectedRoute>} />
            <Route path="/stock" element={<ProtectedRoute allowedRoles={["OWNER"]}><Stock /></ProtectedRoute>} />
            <Route path="/stock/new" element={<ProtectedRoute allowedRoles={["OWNER"]}><AddStock /></ProtectedRoute>} />
            <Route path="/stock/:id/edit" element={<ProtectedRoute allowedRoles={["OWNER"]}><EditStock /></ProtectedRoute>} />
            <Route path="/shops" element={<ProtectedRoute allowedRoles={["OWNER"]}><Shops /></ProtectedRoute>} />
            <Route path="/shops/new" element={<ProtectedRoute allowedRoles={["OWNER"]}><AddShop /></ProtectedRoute>} />
            <Route path="/shops/:id" element={<ProtectedRoute allowedRoles={["OWNER"]}><ShopDetails /></ProtectedRoute>} />
            <Route path="/shops/:id/edit" element={<ProtectedRoute allowedRoles={["OWNER"]}><EditShop /></ProtectedRoute>} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<DefaultRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
