import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const roleLabels: Record<string, string> = {
  SUPERADMIN: "Super Admin",
  OWNER: "Owner",
  MARKETING: "Marketing",
  API: "API User",
};

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-[26px] font-extrabold" style={{ color: "var(--app-text-dark)" }}>Profile</h2>
            <p className="text-[13.5px] mt-0.5" style={{ color: "var(--app-text-light)" }}>View and manage your account.</p>
          </div>
        </div>
      </div>

      <div className="rounded-[16px] overflow-hidden max-w-lg" style={{ background: "var(--app-card)", border: "1px solid var(--app-border)" }}>
        <div className="flex items-center gap-4 p-6 pb-0">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "var(--app-indigo-bg)", color: "var(--app-indigo)" }}>
            <span className="text-2xl font-bold">{user?.fullName?.charAt(0) || "U"}</span>
          </div>
          <div>
            <h3 className="text-xl font-bold" style={{ color: "var(--app-text-dark)" }}>{user?.fullName}</h3>
            <p className="text-[13px] mt-0.5" style={{ color: "var(--app-text-light)" }}>
              {roleLabels[user?.role || ""] || user?.role}
            </p>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--app-text-light)" }}>Email</p>
            <p className="text-[13px]" style={{ color: "var(--app-text-dark)" }}>{user?.email || "N/A"}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--app-text-light)" }}>Role</p>
            <p className="text-[13px]" style={{ color: "var(--app-text-dark)" }}>{roleLabels[user?.role || ""] || user?.role}</p>
          </div>
        </div>

        <div className="px-6 py-4" style={{ borderTop: "1px solid var(--app-border)" }}>
          <button onClick={handleLogout} className="px-5 py-2.5 rounded-[10px] text-[13px] font-semibold cursor-pointer transition-colors" style={{ background: "#FEE2E2", color: "#DC2626", border: "1px solid #FECACA" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#DC2626"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#FEE2E2"; e.currentTarget.style.color = "#DC2626"; }}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
