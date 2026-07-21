import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Receipt, ShoppingCart, Download, Clock } from "lucide-react";

const exportOptions = [
  {
    title: "Stock Items",
    description: "Export your inventory list with SKUs, quantities, and prices.",
    icon: Package,
  },
  {
    title: "Bills",
    description: "Export all bills with invoice numbers, dates, and amounts.",
    icon: Receipt,
  },
  {
    title: "Purchase Orders",
    description: "Export purchase orders with status, amounts, and items.",
    icon: ShoppingCart,
  },
];

export default function DataManagement() {
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
        <h2 className="text-[26px] font-extrabold" style={{ color: "var(--app-text-dark)" }}>Data Management</h2>
        <p className="text-[13.5px] mt-0.5" style={{ color: "var(--app-text-light)" }}>
          Export and manage your inventory data.
        </p>
      </div>

      <div className="rounded-[16px] overflow-hidden" style={{ background: "var(--app-card)", border: "1px solid var(--app-border)" }}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-[9px] flex items-center justify-center" style={{ background: "#F4F4F7", color: "#6B7280" }}>
              <Download className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-[14px] font-bold" style={{ color: "var(--app-text-dark)" }}>Export Data</h3>
              <p className="text-[12px]" style={{ color: "var(--app-text-light)" }}>Download your data as CSV files.</p>
            </div>
          </div>

          <div className="space-y-2">
            {exportOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.title}
                  className="flex items-center justify-between p-4 rounded-[12px] transition-colors"
                  style={{ border: "1px solid var(--app-border)" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#F4F4F7", color: "#6B7280" }}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold" style={{ color: "var(--app-text-dark)" }}>{option.title}</p>
                      <p className="text-[11.5px]" style={{ color: "var(--app-text-light)" }}>{option.description}</p>
                    </div>
                  </div>
                  <button
                    className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-[12px] font-semibold cursor-pointer transition-colors"
                    style={{ background: "var(--app-indigo-bg)", color: "var(--app-indigo)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--app-indigo)"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "var(--app-indigo-bg)"; e.currentTarget.style.color = "var(--app-indigo)"; }}
                    onClick={() => alert("Coming soon!")}
                  >
                    <Download className="h-3 w-3" />
                    Export
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-4 flex items-center gap-2" style={{ borderTop: "1px solid var(--app-border)", background: "rgba(0,0,0,0.01)" }}>
          <Clock className="h-3.5 w-3.5" style={{ color: "var(--app-text-light)" }} />
          <p className="text-[12px]" style={{ color: "var(--app-text-light)" }}>Export feature coming soon. Backend support is under development.</p>
        </div>
      </div>
    </div>
  );
}
