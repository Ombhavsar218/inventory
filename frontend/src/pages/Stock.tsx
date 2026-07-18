import { Package, Plus, Loader2, Trash2, Search, Pencil, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
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

  const getQtyColor = (item: StockItem) => {
    if (item.quantity === 0) return "text-destructive font-semibold";
    if (item.quantity <= item.minStock) return "text-amber-600 font-semibold";
    return "text-foreground";
  };

  const getUnitLabel = (unit: string) => {
    return UNIT_OPTIONS.includes(unit) ? unit : unit;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Stock</h2>
          <p className="text-muted-foreground mt-1">Track inventory levels and stock movements.</p>
        </div>
        <Button onClick={() => navigate("/stock/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Stock
        </Button>
      </div>

      {!loading && stocks.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as FilterBy)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : stocks.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-violet-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No Stock Items Yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              You haven't added any stock items yet. Click the button above to add your first item.
            </p>
          </CardContent>
        </Card>
      ) : filteredStocks.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-amber-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No Items Found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              No stock items match your current search or filters. Try adjusting your criteria.
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => { setSearch(""); setFilterBy("all"); }}>
              Clear filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">#</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Item Name</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">SKU</th>
                  <th className="text-right font-medium text-muted-foreground px-4 py-3">Qty</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Unit</th>
                  <th className="text-right font-medium text-muted-foreground px-4 py-3">Price</th>
                  <th className="text-right font-medium text-muted-foreground px-4 py-3">Min Stock</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Shop</th>
                  <th className="text-right font-medium text-muted-foreground px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStocks.map((item, index) => (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/stock/${item.id}/edit`)}
                        className="text-primary hover:underline font-medium cursor-pointer"
                      >
                        {item.name}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      {item.sku ? (
                        <span className="text-muted-foreground">{item.sku}</span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </td>
                    <td className={`px-4 py-3 text-right ${getQtyColor(item)}`}>
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{getUnitLabel(item.unit)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">₹{item.price.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{item.minStock}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.shop?.name ?? ""}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-green-600"
                          onClick={() => navigate(`/stock/${item.id}/edit`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {item.ownerId === user?.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteTarget(item)}
                            disabled={deletingId === item.id}
                          >
                            {deletingId === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !deletingId && setDeleteTarget(null)}
          />
          <div className="relative bg-card rounded-xl shadow-xl border border-border w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Delete Stock Item</h3>
                <p className="text-xs text-muted-foreground">This cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              Are you sure you want to delete <span className="font-semibold text-foreground">"{deleteTarget.name}"</span>?
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
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
