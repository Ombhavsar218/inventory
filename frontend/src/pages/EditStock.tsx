import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Package } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { stockService } from "@/services/stock.service";
import { z } from "zod";

const editStockSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  sku: z.string().optional(),
  quantity: z.coerce.number().int().min(0, "Quantity must be 0 or more"),
  unit: z.string().min(1, "Unit is required"),
  price: z.coerce.number().min(0, "Price must be 0 or more"),
  minStock: z.coerce.number().int().min(0, "Min stock must be 0 or more").optional(),
  description: z.string().optional(),
  mrp: z.coerce.number().min(0).optional(),
  hsnCode: z.string().optional(),
  gstRate: z.coerce.number().min(0).max(100).optional(),
});

type EditStockFormData = z.output<typeof editStockSchema>;

const UNIT_OPTIONS = ["pcs", "kg", "liters", "boxes", "packets"];

export default function EditStock() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditStockFormData>({
    resolver: zodResolver(editStockSchema) as any,
  });

  useEffect(() => {
    if (!id) return;
    stockService.getById(Number(id)).then(
      (stockData) => {
          reset({
            name: stockData.stock.name,
            sku: stockData.stock.sku || "",
            quantity: stockData.stock.quantity,
            unit: stockData.stock.unit,
            price: stockData.stock.price,
            minStock: stockData.stock.minStock,
            description: stockData.stock.description || "",
            mrp: stockData.stock.mrp || 0,
            hsnCode: stockData.stock.hsnCode || "",
            gstRate: stockData.stock.gstRate || 0,
          });
      }
    ).catch((err: any) => {
      setError(err.response?.data?.message || "Failed to load data.");
    }).finally(() => {
      setLoading(false);
    });
  }, [id]);

  const onSubmit = async (data: EditStockFormData) => {
    if (!id) return;
    setIsSubmitting(true);
    setError("");
    try {
      await stockService.update(Number(id), {
        name: data.name,
        sku: data.sku || undefined,
        quantity: data.quantity,
        unit: data.unit,
        price: data.price,
        minStock: data.minStock || 0,
        description: data.description || undefined,
        mrp: data.mrp || undefined,
        hsnCode: data.hsnCode || undefined,
        gstRate: data.gstRate || undefined,
      });
      navigate("/stock");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update stock item. Please try again.");
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
          onClick={() => navigate("/stock")}
          className="text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Stock
        </Button>
      </div>

      <div className="w-full">
        <Card className="border-0 shadow-md">
          <CardContent className="p-0">
            <div className="flex items-center gap-4 p-6 pb-5 border-b border-border">
              <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                <Package className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Edit Stock Item</h2>
                <p className="text-sm text-muted-foreground">Update the stock item information below.</p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="p-6 space-y-6">
                  {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                      Basic Information
                      <span className="h-px flex-1 bg-border" />
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Item Name <span className="text-destructive">*</span></Label>
                        <Input
                          id="name"
                          placeholder="Enter item name"
                          {...register("name")}
                          className={`h-10 ${errors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        />
                        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sku">SKU <span className="text-muted-foreground font-normal">(optional)</span></Label>
                        <Input
                          id="sku"
                          placeholder="e.g. WA-001"
                          {...register("sku")}
                          className="h-10"
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="description">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
                        <Input
                          id="description"
                          placeholder="Enter item description"
                          {...register("description")}
                          className="h-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                      Stock Details
                      <span className="h-px flex-1 bg-border" />
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity <span className="text-destructive">*</span></Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="0"
                          {...register("quantity")}
                          className={`h-10 ${errors.quantity ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        />
                        {errors.quantity && <p className="text-xs text-destructive">{errors.quantity.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="unit">Unit <span className="text-destructive">*</span></Label>
                        <select
                          id="unit"
                          {...register("unit")}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          {UNIT_OPTIONS.map((u) => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="minStock">Min Stock Level</Label>
                        <Input
                          id="minStock"
                          type="number"
                          min="0"
                          {...register("minStock")}
                          className="h-10"
                        />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    GST & Tax Details
                    <span className="h-px flex-1 bg-border" />
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mrp">MRP (₹)</Label>
                      <Input
                        id="mrp"
                        type="number"
                        min="0"
                        step="0.01"
                        {...register("mrp")}
                        className="h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hsnCode">HSN Code</Label>
                      <Input
                        id="hsnCode"
                        placeholder="e.g. 9401"
                        {...register("hsnCode")}
                        className="h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gstRate">GST Rate (%)</Label>
                      <Input
                        id="gstRate"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        {...register("gstRate")}
                        className="h-10"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    Pricing
                      <span className="h-px flex-1 bg-border" />
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Unit Price (₹) <span className="text-destructive">*</span></Label>
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="0.01"
                          {...register("price")}
                          className={`h-10 ${errors.price ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        />
                        {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
                      </div>
                    </div>
                </div>
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30">
                  <Button type="button" variant="outline" onClick={() => navigate("/stock")}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      "Update Item"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
