import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, ShoppingCart, Pencil, Trash2, CheckCircle, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { purchaseService, type PurchaseOrder } from "@/services/purchase.service";

export default function ViewPurchase() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [purchase, setPurchase] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(false);

  useEffect(() => {
    fetchPurchase();
  }, [id]);

  const fetchPurchase = async () => {
    try {
      const data = await purchaseService.getById(parseInt(id!));
      setPurchase(data.purchase);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load purchase order");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await purchaseService.delete(parseInt(id!));
      navigate("/purchase");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete purchase order");
    }
  };

  const handleMarkReceived = async () => {
    if (!purchase) return;
    try {
      const data = await purchaseService.updateStatus(purchase.id, "RECEIVED");
      setPurchase(data.purchase);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !purchase) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error || "Purchase order not found"}</p>
        <Button variant="ghost" size="sm" onClick={() => navigate("/purchase")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Purchase Orders
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/purchase")} className="text-muted-foreground hover:text-foreground -ml-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Purchase Orders
        </Button>
        <div className="flex items-center gap-2">
          {purchase.status === "PENDING" && (
            <Button variant="default" size="sm" onClick={handleMarkReceived}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark as Received
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => navigate(`/purchase/${purchase.id}/edit`)}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDeleteId(true)} className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <ShoppingCart className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Purchase Order #{purchase.invoiceNumber || `#${purchase.id}`}
              </h2>
              <p className="text-sm text-muted-foreground">Created by {purchase.creator.fullName}</p>
            </div>
          </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Date</p>
              <div className="flex items-center gap-1.5 text-sm">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                {new Date(purchase.date).toLocaleDateString("en-IN")}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Status</p>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                purchase.status === "RECEIVED"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}>
                {purchase.status === "RECEIVED" ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                {purchase.status}
              </span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Amount</p>
              <p className="text-sm font-medium">₹{purchase.totalAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Paid Amount</p>
              <p className="text-sm font-medium text-emerald-600">₹{purchase.paidAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Due Amount</p>
              <p className={`text-sm font-medium ${purchase.dueAmount > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                ₹{purchase.dueAmount.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">#</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Item</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-muted-foreground">Qty</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Unit</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-muted-foreground">Price</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-muted-foreground">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {purchase.items.map((item, index) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2 text-sm text-muted-foreground">{index + 1}</td>
                    <td className="px-4 py-2 text-sm font-medium">{item.stock.name}</td>
                    <td className="px-4 py-2 text-sm text-right">{item.quantity}</td>
                    <td className="px-4 py-2 text-sm text-muted-foreground">{item.unit}</td>
                    <td className="px-4 py-2 text-sm text-right">₹{item.price.toFixed(2)}</td>
                    <td className="px-4 py-2 text-sm text-right font-medium">₹{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border bg-muted/30">
                  <td colSpan={5} className="px-4 py-2 text-sm font-semibold text-right">Total:</td>
                  <td className="px-4 py-2 text-sm font-bold text-right">₹{purchase.totalAmount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Purchase Order?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This will restore stock quantities. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteId(false)}>Cancel</Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
