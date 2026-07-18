import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Receipt, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { billService, type Bill } from "@/services/bill.service";

export default function ViewBill() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) fetchBill(parseInt(id));
  }, [id]);

  const fetchBill = async (billId: number) => {
    try {
      const data = await billService.getById(billId);
      setBill(data.bill);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load bill");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error || "Bill not found"}</p>
        <Button variant="ghost" onClick={() => navigate("/bills")} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Bills
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/bills")}
          className="text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Bills
        </Button>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-1" />
          Print
        </Button>
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
            <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
              <Receipt className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Bill #{bill.id}</h2>
              <p className="text-sm text-muted-foreground">
                Created by {bill.creator.fullName} on {new Date(bill.createdAt).toLocaleDateString("en-IN")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Customer</p>
              <p className="text-sm font-medium">{bill.customerName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Date</p>
              <p className="text-sm font-medium">{new Date(bill.date).toLocaleDateString("en-IN")}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">#</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Item</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Qty</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Unit</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground">Price</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {bill.items.map((item, index) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 text-sm text-muted-foreground">{index + 1}</td>
                    <td className="px-3 py-2 text-sm font-medium">{item.stock.name}</td>
                    <td className="px-3 py-2 text-sm">{item.quantity}</td>
                    <td className="px-3 py-2 text-sm text-muted-foreground">{item.unit}</td>
                    <td className="px-3 py-2 text-sm text-right">₹{item.price.toFixed(2)}</td>
                    <td className="px-3 py-2 text-sm text-right font-medium">₹{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border">
                  <td colSpan={5} className="px-3 py-3 text-sm font-bold text-right">Total</td>
                  <td className="px-3 py-3 text-sm font-bold text-right">₹{bill.totalAmount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
