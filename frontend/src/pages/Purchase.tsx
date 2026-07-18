import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Plus, Eye, Trash2, Search, Loader2, Pencil, Calendar, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { purchaseService, type PurchaseOrder } from "@/services/purchase.service";

type FilterStatus = "ALL" | "PENDING" | "RECEIVED";

export default function Purchase() {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");

  useEffect(() => {
    fetchPurchases();
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

  const dateInputKey = "purchase-date";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Purchase Orders</h2>
          <p className="text-muted-foreground mt-1">Track and manage your purchase orders.</p>
        </div>
        <Button onClick={() => navigate("/purchase/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Purchase
        </Button>
      </div>

      {!loading && purchases.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by shop or invoice number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
          <Input
            key={dateInputKey}
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-10 w-44"
          />
        </div>
      )}

      {!loading && purchases.length > 0 && (
        <div className="flex gap-1 mb-6 bg-muted p-1 rounded-lg w-fit">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                statusFilter === tab.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-xs ${statusFilter === tab.value ? "text-primary" : "text-muted-foreground"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredPurchases.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
              <ShoppingCart className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              {search ? "No purchases found" : "No purchase orders yet"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {search ? "Try a different search term." : "Create your first purchase order to get started."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Invoice #</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Items</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Paid</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Due</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.map((po) => (
                  <tr key={po.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(po.date).toLocaleDateString("en-IN")}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{po.invoiceNumber || "-"}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{po.items.length} item(s)</td>
                    <td className="px-4 py-3 text-sm font-medium text-right">₹{po.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-right text-emerald-600">₹{po.paidAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-right text-rose-600">₹{po.dueAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        po.status === "RECEIVED"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}>
                        {po.status === "RECEIVED" ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {po.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/purchase/${po.id}`)} className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/purchase/${po.id}/edit`)} className="h-8 w-8 p-0 text-muted-foreground hover:text-green-600">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteId(po.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Purchase Order?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This will also restore stock quantities. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="destructive" size="sm" onClick={() => deleteId && handleDelete(deleteId)}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
