import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Receipt, Plus, Eye, Trash2, Search, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { billService, type Bill } from "@/services/bill.service";
import { useAuth } from "@/contexts/AuthContext";

export default function Bills() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const data = await billService.getAll();
      setBills(data.bills);
    } catch (err) {
      console.error("Failed to fetch bills:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await billService.delete(id);
      setBills(bills.filter((b) => b.id !== id));
      setDeleteId(null);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete bill");
    }
  };

  const filteredBills = bills.filter(
    (bill) =>
      bill.customerName.toLowerCase().includes(search.toLowerCase()) ||
      bill.creator.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Bills</h2>
          <p className="text-muted-foreground mt-1">Manage and track your bills.</p>
        </div>
        <Button onClick={() => navigate("/bills/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Bill
        </Button>
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer or creator..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
                <Receipt className="h-8 w-8 text-rose-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {search ? "No bills found" : "No bills yet"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                {search ? "Try a different search term." : "Create your first bill to get started."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Items</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created By</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.map((bill) => (
                    <tr key={bill.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-sm">{new Date(bill.date).toLocaleDateString("en-IN")}</td>
                      <td className="px-4 py-3 text-sm font-medium">{bill.customerName}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{bill.items.length} item(s)</td>
                      <td className="px-4 py-3 text-sm font-medium">₹{bill.totalAmount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{bill.creator.fullName}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/bills/${bill.id}`)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(bill.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Bill?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This will also restore stock quantities. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
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
