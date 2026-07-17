import { Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import TopNavbar from "@/components/layout/TopNavbar";
import BottomNav from "@/components/layout/BottomNav";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64 pb-16 lg:pb-0">
        <TopNavbar />
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
