import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, ShoppingCart, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { stockService, type StockItem } from "@/services/stock.service";
import { purchaseService } from "@/services/purchase.service";
import { z } from "zod";

const purchaseItemSchema = z.object({
  stockId: z.coerce.number().int().positive("Select an item"),
  quantity: z.coerce.number().int().positive("Qty must be at least 1"),
  unit: z.string().min(1, "Unit is required"),
  price: z.coerce.number().min(0),
});

const createPurchaseSchema = z.object({
  date: z.string().min(1, "Date is required"),
  invoiceNumber: z.string().optional(),
  paidAmount: z.coerce.number().min(0).optional(),
  items: z.array(purchaseItemSchema).min(1, "Add at least one item"),
});

type PurchaseFormData = z.infer<typeof createPurchaseSchema>;

const UNIT_OPTIONS = ["pcs", "kg", "liters", "boxes", "packets"];

export default function AddPurchase() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [allStocks, setAllStocks] = useState<StockItem[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<PurchaseFormData>({
    resolver: zodResolver(createPurchaseSchema) as any,
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      invoiceNumber: "",
      paidAmount: 0,
      items: [{ stockId: 0, quantity: 1, unit: "pcs", price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchItems = watch("items");
  const watchPaidAmount = watch("paidAmount");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const stockData = await stockService.getAll();
      setAllStocks(stockData.stocks);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load items");
    }
  };

  const handleStockChange = (index: number, stockId: number) => {
    const stock = allStocks.find((s) => s.id === stockId);
    if (stock) {
      setValue(`items.${index}.price`, stock.price);
      setValue(`items.${index}.unit`, stock.unit);
      setValue(`items.${index}.stockId`, stockId);
    }
  };

  const calculateTotal = () => {
    if (!watchItems) return 0;
    return watchItems.reduce((sum: number, item: any) => {
      return sum + (item.price || 0) * (item.quantity || 0);
    }, 0);
  };

  const dueAmount = calculateTotal() - (watchPaidAmount || 0);

  const onSubmit = async (data: PurchaseFormData) => {
    setIsSubmitting(true);
    setError("");
    try {
      const po = await purchaseService.create({
        date: data.date,
        invoiceNumber: data.invoiceNumber || undefined,
        paidAmount: data.paidAmount || 0,
        items: data.items.map((item) => ({
          stockId: item.stockId,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
        })),
      });
      navigate(`/purchase/${po.purchase.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create purchase order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/purchase")} className="text-muted-foreground hover:text-foreground -ml-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Purchase Orders
        </Button>
      </div>

      <div className="w-full">
        <Card className="border-0 shadow-md">
          <CardContent className="p-0">
            <div className="flex items-center gap-4 p-6 pb-5 border-b border-border">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <ShoppingCart className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Create Purchase Order</h2>
                <p className="text-sm text-muted-foreground">Record a new purchase. Stock will be added automatically.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="p-6 space-y-6">
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    Purchase Details
                    <span className="h-px flex-1 bg-border" />
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date <span className="text-destructive">*</span></Label>
                      <Input
                        id="date"
                        type="date"
                        {...register("date")}
                        className={`h-10 ${errors.date ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      />
                      {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="invoiceNumber">Invoice Number</Label>
                      <Input
                        id="invoiceNumber"
                        {...register("invoiceNumber")}
                        placeholder="e.g. INV-001"
                        className="h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paidAmount">Paid Amount (₹)</Label>
                      <Input
                        id="paidAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        {...register("paidAmount", { valueAsNumber: true })}
                        className="h-10"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    Items
                    <span className="h-px flex-1 bg-border" />
                  </h3>

                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 rounded-lg border border-border bg-muted/20">
                        <div className="sm:col-span-4 space-y-1">
                          <Label className="text-xs">Item <span className="text-destructive">*</span></Label>
                          <select
                            {...register(`items.${index}.stockId`)}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              register(`items.${index}.stockId`).onChange(e);
                              if (val > 0) handleStockChange(index, val);
                            }}
                            className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                          >
                            <option value={0}>Select item</option>
                            {allStocks.map((stock) => (
                              <option key={stock.id} value={stock.id}>{stock.name} ({stock.unit})</option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-2 space-y-1">
                          <Label className="text-xs">Qty <span className="text-destructive">*</span></Label>
                          <Input type="number" min="1" {...register(`items.${index}.quantity`)} className="h-9" />
                        </div>

                        <div className="sm:col-span-2 space-y-1">
                          <Label className="text-xs">Unit</Label>
                          <select
                            {...register(`items.${index}.unit`)}
                            className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                          >
                            {UNIT_OPTIONS.map((u) => (
                              <option key={u} value={u}>{u}</option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-2 space-y-1">
                          <Label className="text-xs">Price (₹)</Label>
                          <Input type="number" min="0" step="0.01" {...register(`items.${index}.price`)} className="h-9" />
                        </div>

                        <div className="sm:col-span-1 space-y-1">
                          <Label className="text-xs">Subtotal</Label>
                          <div className="h-9 flex items-center text-sm font-medium">
                            ₹{((watchItems?.[index]?.price || 0) * (watchItems?.[index]?.quantity || 0)).toFixed(2)}
                          </div>
                        </div>

                        <div className="sm:col-span-1 flex items-end">
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              className="text-destructive hover:text-destructive h-9"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ stockId: 0, quantity: 1, unit: "pcs", price: 0 })}
                    className="mt-3"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>

                  {errors.items && (
                    <p className="text-xs text-destructive mt-1">{typeof errors.items === 'object' && 'message' in errors.items ? (errors.items as any).message : ''}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <div className="w-full sm:w-72 p-4 rounded-lg border border-border bg-muted/20">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Items:</span>
                      <span>{watchItems?.length || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-medium">₹{calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Paid:</span>
                      <span className="text-emerald-600">₹{(watchPaidAmount || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-border pt-2">
                      <span className="text-muted-foreground">Due:</span>
                      <span className={`font-medium ${dueAmount > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                        ₹{dueAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30">
                <Button type="button" variant="outline" onClick={() => navigate("/purchase")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    "Create Purchase Order"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
