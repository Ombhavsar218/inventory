import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Receipt, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { shopService, type Shop } from "@/services/shop.service";
import { stockService, type StockItem } from "@/services/stock.service";
import { billService } from "@/services/bill.service";
import { z } from "zod";

const billItemSchema = z.object({
  stockId: z.coerce.number().int().positive("Select an item"),
  quantity: z.coerce.number().int().positive("Qty must be at least 1"),
  unit: z.string().min(1, "Unit is required"),
  price: z.coerce.number().min(0),
});

const createBillSchema = z.object({
  shopId: z.coerce.number().int().positive("Shop is required"),
  date: z.string().min(1, "Date is required"),
  items: z.array(billItemSchema).min(1, "Add at least one item"),
});

type BillFormData = z.infer<typeof createBillSchema>;

const UNIT_OPTIONS = ["pcs", "kg", "liters", "boxes", "packets"];

export default function CreateBill() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [shops, setShops] = useState<Shop[]>([]);
  const [allStocks, setAllStocks] = useState<StockItem[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<BillFormData>({
    resolver: zodResolver(createBillSchema) as any,
    defaultValues: {
      shopId: 0,
      date: new Date().toISOString().split("T")[0],
      items: [{ stockId: 0, quantity: 1, unit: "pcs", price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchItems = watch("items");

  const availableStocks = allStocks.filter((s) => s.quantity > 0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const shopData = await shopService.getAll();
      setShops(shopData.shops);
    } catch (err: any) {
      console.error("Failed to fetch shops:", err);
      setError(err.response?.data?.message || "Failed to load shops");
    }
    try {
      const stockData = await stockService.getAll();
      setAllStocks(stockData.stocks);
    } catch (err: any) {
      console.error("Failed to fetch items:", err);
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

  const onSubmit = async (data: BillFormData) => {
    setIsSubmitting(true);
    setError("");
    try {
      await billService.create({
        shopId: data.shopId,
        date: data.date,
        items: data.items.map((item) => ({
          stockId: item.stockId,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
        })),
      });
      navigate("/bills");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create bill. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/bills")}
          className="text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Bills
        </Button>
      </div>

      <div className="w-full">
        <Card className="border-0 shadow-md">
          <CardContent className="p-0">
            <div className="flex items-center gap-4 p-6 pb-5 border-b border-border">
              <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                <Receipt className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Create New Bill</h2>
                <p className="text-sm text-muted-foreground">Create a bill for a shop.</p>
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
                    Bill Details
                    <span className="h-px flex-1 bg-border" />
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shopId">Shop <span className="text-destructive">*</span></Label>
                      <select
                        id="shopId"
                        {...register("shopId", { valueAsNumber: true })}
                        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${errors.shopId ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      >
                        <option value={0}>Select a shop</option>
                        {shops.map((shop) => (
                          <option key={shop.id} value={shop.id}>
                            {shop.name}
                          </option>
                        ))}
                      </select>
                      {errors.shopId && <p className="text-xs text-destructive">{errors.shopId.message}</p>}
                    </div>

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
                            {availableStocks.map((stock) => (
                              <option key={stock.id} value={stock.id}>
                                {stock.name} ({stock.quantity} {stock.unit} available)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-2 space-y-1">
                          <Label className="text-xs">Qty <span className="text-destructive">*</span></Label>
                          <Input
                            type="number"
                            min="1"
                            {...register(`items.${index}.quantity`)}
                            className="h-9"
                          />
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
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            {...register(`items.${index}.price`)}
                            className="h-9"
                          />
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
                    <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                      <span>Total:</span>
                      <span>₹{calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30">
                <Button type="button" variant="outline" onClick={() => navigate("/bills")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    "Create Bill"
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
