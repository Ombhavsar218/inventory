import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2, Store, Pencil, Trash2, Printer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { billService, type ShopBillsResponse } from "@/services/bill.service";
import PrintShopBill from "@/components/PrintShopBill";

export default function ShopBills() {
  const navigate = useNavigate();
  const { shopId } = useParams<{ id: string; shopId: string }>();
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const [data, setData] = useState<ShopBillsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showPrint, setShowPrint] = useState(false);

  useEffect(() => {
    fetchShopBills();
  }, [shopId, dateParam]);

  const fetchShopBills = async () => {
    try {
      const result = await billService.getShopBills(parseInt(shopId!), dateParam);
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load shop bills");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (billId: number) => {
    try {
      await billService.delete(billId);
      setDeleteId(null);
      fetchShopBills();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete bill");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error || "No data found"}</p>
        <Button variant="ghost" onClick={() => navigate("/bills")} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Bills
        </Button>
      </div>
    );
  }

  if (showPrint) {
    return (
      <div>
        <div className="mb-4 no-print">
          <Button variant="ghost" size="sm" onClick={() => setShowPrint(false)} className="text-muted-foreground hover:text-foreground -ml-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Shop Bills
          </Button>
        </div>
        <PrintShopBill shopId={parseInt(shopId!)} date={dateParam} onClose={() => setShowPrint(false)} />
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
        {data.items.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPrint(true)}
          >
            <Printer className="h-4 w-4 mr-1" />
            Print Bill
          </Button>
        )}
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Store className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{data.shop?.name || "Shop"}</h2>
              <p className="text-sm text-muted-foreground">
                {new Date(data.date).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                {" · "}{data.billsCount} bill(s) · {data.totalItems} item(s)
              </p>
            </div>
          </div>

          {data.items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No items found for this date.</p>
          ) : (
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
                    <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Created By</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item, index) => (
                    <tr key={index} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 text-sm text-muted-foreground">{index + 1}</td>
                      <td className="px-3 py-2 text-sm font-medium">{item.stockName}</td>
                      <td className="px-3 py-2 text-sm">{item.quantity}</td>
                      <td className="px-3 py-2 text-sm text-muted-foreground">{item.unit}</td>
                      <td className="px-3 py-2 text-sm text-right">₹{item.price.toFixed(2)}</td>
                      <td className="px-3 py-2 text-sm text-right font-medium">₹{item.subtotal.toFixed(2)}</td>
                      <td className="px-3 py-2 text-sm text-muted-foreground">{item.createdBy}</td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/bills/${item.billId}/edit`)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-green-600"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(item.billId)}
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border">
                    <td colSpan={5} className="px-3 py-3 text-sm font-bold text-right">Total</td>
                    <td className="px-3 py-3 text-sm font-bold text-right">₹{data.totalAmount.toFixed(2)}</td>
                    <td />
                    <td />
                  </tr>
                </tfoot>
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
