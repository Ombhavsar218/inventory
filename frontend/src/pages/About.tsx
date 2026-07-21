import { useNavigate } from "react-router-dom";
import { ArrowLeft, Warehouse } from "lucide-react";

export default function About() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="mb-7">
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center gap-1.5 text-[13px] font-medium cursor-pointer mb-5 transition-colors"
          style={{ color: "var(--app-text-light)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--app-text-dark)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--app-text-light)")}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Settings
        </button>
        <h2 className="text-[26px] font-extrabold" style={{ color: "var(--app-text-dark)" }}>About</h2>
        <p className="text-[13.5px] mt-0.5" style={{ color: "var(--app-text-light)" }}>
          App version and information.
        </p>
      </div>

      <div className="rounded-[16px] overflow-hidden" style={{ background: "var(--app-card)", border: "1px solid var(--app-border)" }}>
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: "var(--app-indigo-bg)", color: "var(--app-indigo)" }}>
            <Warehouse className="h-8 w-8" />
          </div>
          <h3 className="text-[20px] font-extrabold mb-1" style={{ color: "var(--app-text-dark)" }}>Total Stock</h3>
          <p className="text-[13px] mb-6" style={{ color: "var(--app-text-light)" }}>Inventory Management System</p>

          <div className="w-full max-w-sm space-y-3">
            <div className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid var(--app-border)" }}>
              <span className="text-[13px]" style={{ color: "var(--app-text-mid)" }}>Version</span>
              <span className="text-[13px] font-semibold" style={{ color: "var(--app-text-dark)" }}>1.0.0</span>
            </div>
            <div className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid var(--app-border)" }}>
              <span className="text-[13px]" style={{ color: "var(--app-text-mid)" }}>Last Updated</span>
              <span className="text-[13px] font-semibold" style={{ color: "var(--app-text-dark)" }}>July 2026</span>
            </div>
            <div className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid var(--app-border)" }}>
              <span className="text-[13px]" style={{ color: "var(--app-text-mid)" }}>Support Email</span>
              <span className="text-[13px] font-semibold" style={{ color: "var(--app-text-dark)" }}>support@totalstock.com</span>
            </div>
            <div className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid var(--app-border)" }}>
              <span className="text-[13px]" style={{ color: "var(--app-text-mid)" }}>License</span>
              <span className="text-[13px] font-semibold" style={{ color: "var(--app-text-dark)" }}>Proprietary</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-[13px]" style={{ color: "var(--app-text-mid)" }}>Developer</span>
              <span className="text-[13px] font-semibold" style={{ color: "var(--app-text-dark)" }}>Total Stock</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
