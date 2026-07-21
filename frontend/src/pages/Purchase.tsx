import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Receipt,
  Plus,
  Eye,
  Trash2,
  Search,
  Loader2,
  Pencil,
  Calendar,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { purchaseService, type PurchaseOrder } from "@/services/purchase.service";

const ITEMS_PER_PAGE = 10;

type FilterStatus = "ALL" | "PENDING" | "RECEIVED";

export default function Purchase() {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPurchases();
    setCurrentPage(1);
  }, [selectedDate, statusFilter]);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const params: { date?: string; status?: string } = { date: selectedDate };
      if (statusFilter !== "ALL") params.status = statusFilter;
      const data = await purchaseService.getAll(params);
      setPurchases(data.purchases);
    } catch (err) {
      console.error("Failed to fetch purchases:", err);
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    try {
      await purchaseService.delete(id);
      setPurchases((prev) => prev.filter((p) => p.id !== id));
      setDeleteId(null);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete purchase order");
    }
  };

  const filteredPurchases = useMemo(() => {
    if (!search.trim()) return purchases;
    const q = search.toLowerCase();
    return purchases.filter(
      (p) =>
        (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(q))
    );
  }, [purchases, search]);

  const statusTabs: { label: string; value: FilterStatus; count: number }[] = [
    { label: "All", value: "ALL", count: purchases.length },
    { label: "Pending", value: "PENDING", count: purchases.filter((p) => p.status === "PENDING").length },
    { label: "Received", value: "RECEIVED", count: purchases.filter((p) => p.status === "RECEIVED").length },
  ];

  const totalPages = Math.max(1, Math.ceil(filteredPurchases.length / ITEMS_PER_PAGE));
  const paginatedPurchases = filteredPurchases.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const startEntry = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endEntry = Math.min(currentPage * ITEMS_PER_PAGE, filteredPurchases.length);
  const totalEntries = filteredPurchases.length;

  const dateInputKey = "purchase-date";

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-[26px] font-extrabold" style={{ color: "var(--app-text-dark)" }}>Purchase Orders</h2>
            <p className="text-[13.5px] mt-0.5" style={{ color: "var(--app-text-light)" }}>Track and manage your purchase orders.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/purchase/new")}
            className="flex items-center gap-2 px-5 py-[11px] rounded-[11px] text-[14px] font-semibold text-white cursor-pointer transition-colors"
            style={{ background: "var(--app-indigo)" }}
          >
            <Plus className="h-4 w-4" />
            Create Purchase
          </button>
        </div>
      </div>

      {!loading && purchases.length > 0 && (
        <div className="flex gap-1 p-1 rounded-[10px] w-fit mb-5" style={{ background: "var(--app-card)", border: "1px solid var(--app-border)" }}>
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className="px-4 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer"
              style={{
                background: statusFilter === tab.value ? "var(--app-indigo)" : "transparent",
                color: statusFilter === tab.value ? "#fff" : "var(--app-text-mid)",
              }}
            >
              {tab.label}
              <span className="ml-1.5 text-[11px]" style={{ color: statusFilter === tab.value ? "#fff" : "var(--app-text-light)" }}>{tab.count}</span>
            </button>
          ))}
        </div>
      )}

      {!loading && purchases.length > 0 && (
        <div className="flex gap-3 mb-5">
          <div className="flex-1 flex items-center gap-2 rounded-[10px] px-4 py-3" style={{ background: "var(--app-card)", border: "1px solid var(--app-border)" }}>
            <Search className="h-4 w-4" style={{ color: "var(--app-text-light)" }} />
            <input
              type="text"
              placeholder="Search by invoice number..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="flex-1 border-none outline-none bg-transparent text-[13px]"
              style={{ color: "var(--app-text-dark)" }}
            />
          </div>
          <div className="flex items-center gap-2 rounded-[10px] px-4 py-3 min-w-[160px]" style={{ background: "var(--app-card)", border: "1px solid var(--app-border)" }}>
            <Calendar className="h-3.5 w-3.5" style={{ color: "var(--app-text-mid)" }} />
            <input
              key={dateInputKey}
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border-none outline-none bg-transparent text-[13px] font-medium flex-1"
              style={{ color: "var(--app-text-dark)" }}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--app-text-light)" }} />
        </div>
      ) : (
        <div className="rounded-[16px] overflow-hidden" style={{ background: "var(--app-card)", border: "1px solid var(--app-border)" }}>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--app-border)", background: "#FFFFFF" }}>
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--app-text-light)" }}>#</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--app-text-light)" }}>Date</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--app-text-light)" }}>Invoice #</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--app-text-light)" }}>Items</th>
                  <th className="text-right px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--app-text-light)" }}>Total</th>
                  <th className="text-right px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--app-text-light)" }}>Paid</th>
                  <th className="text-right px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--app-text-light)" }}>Due</th>
                  <th className="text-center px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--app-text-light)" }}>Status</th>
                  <th className="text-right px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--app-text-light)" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10">
                      <Receipt className="h-8 w-8 mx-auto mb-2 opacity-30" style={{ color: "var(--app-text-light)" }} />
                      <p className="text-[13px]" style={{ color: "var(--app-text-light)" }}>
                        {search ? "No purchases found" : "No purchase orders yet"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedPurchases.map((po, index) => {
                    const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
                    return (
                      <tr
                        key={po.id}
                        style={{ borderBottom: "1px solid var(--app-border)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#F3F4F6")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                      >
                        <td className="px-5 py-3 text-[13px]" style={{ color: "var(--app-text-light)" }}>{globalIndex + 1}</td>
                        <td className="px-5 py-3 text-[13px]">
                          <div className="flex items-center gap-1.5" style={{ color: "var(--app-text-mid)" }}>
                            <Calendar className="h-3 w-3" style={{ color: "var(--app-text-light)" }} />
                            {new Date(po.date).toLocaleDateString("en-IN")}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-[13px]" style={{ color: "var(--app-text-dark)" }}>{po.invoiceNumber || "-"}</td>
                        <td className="px-5 py-3 text-[13px]" style={{ color: "var(--app-text-mid)" }}>{po.items.length} item(s)</td>
                        <td className="px-5 py-3 text-[13px] text-right font-semibold" style={{ color: "var(--app-text-dark)" }}>₹{po.totalAmount.toFixed(2)}</td>
                        <td className="px-5 py-3 text-[13px] text-right" style={{ color: "#16A34A" }}>₹{po.paidAmount.toFixed(2)}</td>
                        <td className="px-5 py-3 text-[13px] text-right" style={{ color: "#EF4444" }}>₹{po.dueAmount.toFixed(2)}</td>
                        <td className="px-5 py-3 text-center">
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              background: po.status === "RECEIVED" ? "#E8F9EF" : "#FDF3E1",
                              color: po.status === "RECEIVED" ? "#16A34A" : "#D97706",
                            }}
                          >
                            {po.status === "RECEIVED" ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                            {po.status}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-0.5">
                            <button
                              onClick={() => navigate(`/purchase/${po.id}`)}
                              className="w-7 h-7 rounded-md flex items-center justify-center cursor-pointer border-none bg-transparent text-gray-400 hover:bg-indigo-50 hover:text-indigo-500 transition-colors"
                              title="View"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => navigate(`/purchase/${po.id}/edit`)}
                              className="w-7 h-7 rounded-md flex items-center justify-center cursor-pointer border-none bg-transparent text-gray-400 hover:bg-indigo-50 hover:text-indigo-500 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteId(po.id)}
                              className="w-7 h-7 rounded-md flex items-center justify-center cursor-pointer border-none bg-transparent text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {filteredPurchases.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid var(--app-border)" }}>
              <p className="text-[12px]" style={{ color: "var(--app-text-light)" }}>
                Showing {startEntry} to {endEntry} of {totalEntries} entries
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ border: "1px solid var(--app-border)", background: "var(--app-card)", color: "var(--app-text-mid)" }}
                >
                  <ChevronLeft className="h-[15px] w-[15px]" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center cursor-pointer text-[13px] font-bold"
                    style={{
                      border: `1px solid ${page === currentPage ? "var(--app-indigo)" : "var(--app-border)"}`,
                      background: page === currentPage ? "var(--app-indigo)" : "var(--app-card)",
                      color: page === currentPage ? "#fff" : "var(--app-text-mid)",
                    }}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ border: "1px solid var(--app-border)", background: "var(--app-card)", color: "var(--app-text-mid)" }}
                >
                  <ChevronRight className="h-[15px] w-[15px]" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-2" style={{ color: "var(--app-text-dark)" }}>Delete Purchase Order?</h3>
            <p className="text-sm mb-6" style={{ color: "var(--app-text-mid)" }}>
              This will also restore stock quantities. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteId && handleDelete(deleteId)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
