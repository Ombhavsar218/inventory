import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Plus,
  Trash2,
  Search,
  Loader2,
  Pencil,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { stockService, type StockItem } from "@/services/stock.service";
import { useAuth } from "@/contexts/AuthContext";

type SortBy = "newest" | "oldest" | "name-asc" | "name-desc" | "qty-low" | "qty-high";
type FilterBy = "all" | "in-stock" | "out-of-stock" | "low-stock";

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
  { value: "qty-low", label: "Qty: Low to High" },
  { value: "qty-high", label: "Qty: High to Low" },
];

const FILTER_OPTIONS: { value: FilterBy; label: string }[] = [
  { value: "all", label: "All items" },
  { value: "in-stock", label: "In Stock" },
  { value: "out-of-stock", label: "Out of Stock" },
  { value: "low-stock", label: "Low Stock" },
];

const UNIT_OPTIONS = ["pcs", "kg", "liters", "boxes", "packets"];

const ITEMS_PER_PAGE = 10;

export default function Stock() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StockItem | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [filterBy, setFilterBy] = useState<FilterBy>("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      const data = await stockService.getAll();
      setStocks(data.stocks);
    } catch (err) {
      console.error("Failed to fetch stocks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await stockService.delete(id);
      setStocks((prev) => prev.filter((s) => s.id !== id));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete stock:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredStocks = useMemo(() => {
    let result = [...stocks];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.sku && s.sku.toLowerCase().includes(q))
      );
    }

    switch (filterBy) {
      case "in-stock":
        result = result.filter((s) => s.quantity > 0);
        break;
      case "out-of-stock":
        result = result.filter((s) => s.quantity === 0);
        break;
      case "low-stock":
        result = result.filter((s) => s.quantity > 0 && s.quantity <= s.minStock);
        break;
    }

    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "qty-low":
        result.sort((a, b) => a.quantity - b.quantity);
        break;
      case "qty-high":
        result.sort((a, b) => b.quantity - a.quantity);
        break;
    }

    return result;
  }, [stocks, search, sortBy, filterBy]);

  const getQtyStyle = (item: StockItem): React.CSSProperties => {
    if (item.quantity === 0) return { color: "#EF4444", fontWeight: 600 };
    if (item.quantity <= item.minStock) return { color: "#D97706", fontWeight: 600 };
    return { color: "var(--app-text-dark)" };
  };

  const getUnitLabel = (unit: string) => {
    return UNIT_OPTIONS.includes(unit) ? unit : unit;
  };

  const totalPages = Math.max(1, Math.ceil(filteredStocks.length / ITEMS_PER_PAGE));
  const paginatedStocks = filteredStocks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const startEntry = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endEntry = Math.min(currentPage * ITEMS_PER_PAGE, filteredStocks.length);

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-[26px] font-extrabold" style={{ color: "var(--app-text-dark)" }}>Stock</h2>
            <p className="text-[13.5px] mt-0.5" style={{ color: "var(--app-text-light)" }}>Track inventory levels and stock movements.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/stock/new")}
            className="flex items-center gap-2 px-5 py-[11px] rounded-[11px] text-[14px] font-semibold text-white cursor-pointer transition-colors"
            style={{ background: "var(--app-indigo)" }}
          >
            <Plus className="h-4 w-4" />
            Add Stock
          </button>
        </div>
      </div>

      {!loading && stocks.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
          <div className="flex-1 flex items-center gap-2 rounded-[10px] px-4 py-3" style={{ background: "var(--app-card)", border: "1px solid var(--app-border)" }}>
            <Search className="h-4 w-4" style={{ color: "var(--app-text-light)" }} />
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="flex-1 border-none outline-none bg-transparent text-[13px]"
              style={{ color: "var(--app-text-dark)" }}
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value as SortBy); setCurrentPage(1); }}
            className="rounded-[10px] px-4 py-3 text-[13px] font-medium border-none outline-none cursor-pointer"
            style={{ background: "var(--app-card)", border: "1px solid var(--app-border)", color: "var(--app-text-dark)" }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            value={filterBy}
            onChange={(e) => { setFilterBy(e.target.value as FilterBy); setCurrentPage(1); }}
            className="rounded-[10px] px-4 py-3 text-[13px] font-medium border-none outline-none cursor-pointer"
            style={{ background: "var(--app-card)", border: "1px solid var(--app-border)", color: "var(--app-text-dark)" }}
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--app-text-light)" }} />
        </div>
      ) : stocks.length === 0 ? (
        <div className="rounded-[16px] overflow-hidden" style={{ background: "var(--app-card)", border: "1px solid var(--app-border)" }}>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td colSpan={8} className="text-center py-10">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-30" style={{ color: "var(--app-text-light)" }} />
                    <p className="text-[13px]" style={{ color: "var(--app-text-light)" }}>No stock items yet. Click "Add Stock" to create your first item.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : filteredStocks.length === 0 ? (
        <div className="rounded-[16px] overflow-hidden" style={{ background: "var(--app-card)", border: "1px solid var(--app-border)" }}>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td colSpan={8} className="text-center py-10">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-30" style={{ color: "var(--app-text-light)" }} />
                    <p className="text-[13px]" style={{ color: "var(--app-text-light)" }}>No items found</p>
                    <button
                      className="mt-3 text-[13px] font-medium cursor-pointer border-none bg-transparent"
                      style={{ color: "var(--app-indigo)" }}
                      onClick={() => { setSearch(""); setFilterBy("all"); }}
                    >
                      Clear filters
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-[16px] overflow-hidden" style={{ background: "var(--app-card)", border: "1px solid var(--app-border)" }}>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--app-border)", background: "#FFFFFF" }}>
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--app-text-light)" }}>#</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--app-text-light)" }}>Item Name</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--app-text-light)" }}>SKU</th>
                  <th className="text-right px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--app-text-light)" }}>Qty</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--app-text-light)" }}>Unit</th>
                  <th className="text-right px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--app-text-light)" }}>Price</th>
                  <th className="text-right px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--app-text-light)" }}>Min Stock</th>
                  <th className="text-right px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--app-text-light)" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStocks.map((item, index) => {
                  const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
                  return (
                    <tr
                      key={item.id}
                      style={{ borderBottom: "1px solid var(--app-border)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#F3F4F6")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                    >
                      <td className="px-5 py-3 text-[13px]" style={{ color: "var(--app-text-light)" }}>{globalIndex + 1}</td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => navigate(`/stock/${item.id}/edit`)}
                          className="font-bold cursor-pointer hover:underline text-[13px] border-none bg-transparent"
                          style={{ color: "var(--app-text-dark)" }}
                        >
                          {item.name}
                        </button>
                      </td>
                      <td className="px-5 py-3 text-[13px]" style={{ color: item.sku ? "var(--app-text-dark)" : "var(--app-text-light)" }}>
                        {item.sku || "—"}
                      </td>
                      <td className="px-5 py-3 text-[13px] text-right" style={getQtyStyle(item)}>
                        {item.quantity}
                      </td>
                      <td className="px-5 py-3 text-[13px]" style={{ color: "var(--app-text-dark)" }}>{getUnitLabel(item.unit)}</td>
                      <td className="px-5 py-3 text-[13px] text-right" style={{ color: "var(--app-text-dark)" }}>₹{item.price.toLocaleString()}</td>
                      <td className="px-5 py-3 text-[13px] text-right" style={{ color: "var(--app-text-dark)" }}>{item.minStock}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-0.5">
                          <button
                            onClick={() => navigate(`/stock/${item.id}/edit`)}
                            className="w-7 h-7 rounded-md flex items-center justify-center cursor-pointer border-none bg-transparent text-gray-400 hover:bg-indigo-50 hover:text-indigo-500 transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          {item.ownerId === user?.id && (
                            <button
                              onClick={() => setDeleteTarget(item)}
                              disabled={deletingId === item.id}
                              className="w-7 h-7 rounded-md flex items-center justify-center cursor-pointer border-none bg-transparent text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {deletingId === item.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredStocks.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid var(--app-border)" }}>
              <p className="text-[12px]" style={{ color: "var(--app-text-light)" }}>
                Showing {startEntry} to {endEntry} of {filteredStocks.length} entries
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

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !deletingId && setDeleteTarget(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-2" style={{ color: "var(--app-text-dark)" }}>Delete Stock Item?</h3>
            <p className="text-sm mb-6" style={{ color: "var(--app-text-mid)" }}>
              This will permanently delete "{deleteTarget.name}". This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)} disabled={deletingId !== null}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(deleteTarget.id)} disabled={deletingId !== null}>
                {deletingId === deleteTarget.id ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
