import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Plus, Loader2, Trash2, Search, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shopService, type Shop } from "@/services/shop.service";
import { useAuth } from "@/contexts/AuthContext";

const ITEMS_PER_PAGE = 10;

type SortBy = "newest" | "oldest" | "name-asc" | "name-desc";
type FilterBy = "all" | "has-gst" | "no-gst" | "has-fssai" | "no-fssai";

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
];

const FILTER_OPTIONS: { value: FilterBy; label: string }[] = [
  { value: "all", label: "All shops" },
  { value: "has-gst", label: "Has GST" },
  { value: "no-gst", label: "No GST" },
  { value: "has-fssai", label: "Has FSSAI" },
  { value: "no-fssai", label: "No FSSAI" },
];

export default function Shops() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Shop | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [filterBy, setFilterBy] = useState<FilterBy>("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const data = await shopService.getAll();
      setShops(data.shops);
    } catch (err) {
      console.error("Failed to fetch shops:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await shopService.delete(id);
      setShops((prev) => prev.filter((s) => s.id !== id));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete shop:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredShops = useMemo(() => {
    let result = [...shops];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q)
      );
    }

    switch (filterBy) {
      case "has-gst":
        result = result.filter((s) => s.gstNo && s.gstNo.trim() !== "");
        break;
      case "no-gst":
        result = result.filter((s) => !s.gstNo || s.gstNo.trim() === "");
        break;
      case "has-fssai":
        result = result.filter((s) => s.fssaiNo && s.fssaiNo.trim() !== "");
        break;
      case "no-fssai":
        result = result.filter((s) => !s.fssaiNo || s.fssaiNo.trim() === "");
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
    }

    return result;
  }, [shops, search, sortBy, filterBy]);

  const totalPages = Math.max(1, Math.ceil(filteredShops.length / ITEMS_PER_PAGE));
  const paginatedShops = filteredShops.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const startEntry = filteredShops.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endEntry = Math.min(currentPage * ITEMS_PER_PAGE, filteredShops.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortBy, filterBy]);

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-[26px] font-extrabold" style={{ color: "var(--app-text-dark)" }}>Shops</h2>
            <p className="text-[13.5px] mt-0.5" style={{ color: "var(--app-text-light)" }}>Manage your shops and locations.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/shops/new")}
            className="flex items-center gap-2 px-5 py-[11px] rounded-[11px] text-[14px] font-semibold text-white cursor-pointer transition-colors"
            style={{ background: "var(--app-indigo)" }}
          >
            <Plus className="h-4 w-4" />
            Add Shop
          </button>
        </div>
      </div>

      {!loading && shops.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
          <div className="flex-1 flex items-center gap-2 rounded-[10px] px-4 py-3" style={{ background: "var(--app-card)", border: "1px solid var(--app-border)" }}>
            <Search className="h-4 w-4" style={{ color: "var(--app-text-light)" }} />
            <input
              type="text"
              placeholder="Search by name or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border-none outline-none bg-transparent text-[13px]"
              style={{ color: "var(--app-text-dark)" }}
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="rounded-[10px] px-4 py-3 text-[13px] font-medium border-none outline-none cursor-pointer"
            style={{ background: "var(--app-card)", border: "1px solid var(--app-border)", color: "var(--app-text-dark)" }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as FilterBy)}
            className="rounded-[10px] px-4 py-3 text-[13px] font-medium border-none outline-none cursor-pointer"
            style={{ background: "var(--app-card)", border: "1px solid var(--app-border)", color: "var(--app-text-dark)" }}
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--app-text-light)" }} />
        </div>
      ) : shops.length === 0 ? (
        <div className="rounded-[16px] overflow-hidden" style={{ background: "var(--app-card)", border: "1px solid var(--app-border)" }}>
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td colSpan={7} className="text-center py-10">
                  <Store className="h-8 w-8 mx-auto mb-2 opacity-30" style={{ color: "var(--app-text-light)" }} />
                  <p className="text-[13px]" style={{ color: "var(--app-text-light)" }}>No shops yet</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-[16px] overflow-hidden" style={{ background: "var(--app-card)", border: "1px solid var(--app-border)" }}>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--app-border)", background: "#FFFFFF" }}>
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--app-text-light)" }}>#</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--app-text-light)" }}>Shop Name</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--app-text-light)" }}>Address</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--app-text-light)" }}>GST No.</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--app-text-light)" }}>FSSAI No.</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--app-text-light)" }}>Owner</th>
                  <th className="text-right px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--app-text-light)" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedShops.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10">
                      <Store className="h-8 w-8 mx-auto mb-2 opacity-30" style={{ color: "var(--app-text-light)" }} />
                      <p className="text-[13px]" style={{ color: "var(--app-text-light)" }}>No shops found</p>
                    </td>
                  </tr>
                ) : (
                  paginatedShops.map((shop, index) => {
                    const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
                    return (
                      <tr
                        key={shop.id}
                        style={{ borderBottom: "1px solid var(--app-border)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#F3F4F6")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                      >
                        <td className="px-5 py-3 text-[13px]" style={{ color: "var(--app-text-light)" }}>{globalIndex + 1}</td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => navigate(`/shops/${shop.id}`)}
                            className="font-bold cursor-pointer hover:underline border-none bg-transparent text-[13px]"
                            style={{ color: "var(--app-text-dark)" }}
                          >
                            {shop.name}
                          </button>
                        </td>
                        <td className="px-5 py-3 text-[13px] max-w-[200px] truncate" style={{ color: "var(--app-text-dark)" }}>{shop.address}</td>
                        <td className="px-5 py-3 text-[13px]" style={{ color: "var(--app-text-light)" }}>
                          {shop.gstNo && shop.gstNo.trim() !== "" ? shop.gstNo : "—"}
                        </td>
                        <td className="px-5 py-3 text-[13px]" style={{ color: "var(--app-text-light)" }}>
                          {shop.fssaiNo && shop.fssaiNo.trim() !== "" ? shop.fssaiNo : "—"}
                        </td>
                        <td className="px-5 py-3 text-[13px]" style={{ color: "var(--app-text-mid)" }}>{shop.owner.fullName}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-0.5">
                            <button
                              onClick={() => navigate(`/shops/${shop.id}/edit`)}
                              className="w-7 h-7 rounded-md flex items-center justify-center cursor-pointer border-none bg-transparent text-gray-400 hover:bg-indigo-50 hover:text-indigo-500 transition-colors"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            {shop.ownerId === user?.id && (
                              <button
                                onClick={() => setDeleteTarget(shop)}
                                disabled={deletingId === shop.id}
                                className="w-7 h-7 rounded-md flex items-center justify-center cursor-pointer border-none bg-transparent text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40"
                              >
                                {deletingId === shop.id ? (
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
                  })
                )}
              </tbody>
            </table>
          </div>

          {filteredShops.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid var(--app-border)" }}>
              <p className="text-[12px]" style={{ color: "var(--app-text-light)" }}>
                Showing {startEntry} to {endEntry} of {filteredShops.length} entries
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
            <h3 className="text-lg font-bold mb-2" style={{ color: "var(--app-text-dark)" }}>Delete Shop?</h3>
            <p className="text-sm mb-6" style={{ color: "var(--app-text-mid)" }}>
              Are you sure you want to delete "{deleteTarget.name}"? This action cannot be undone.
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
