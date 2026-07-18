import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Store } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { shopSchema, type ShopFormData } from "@/validations/shop.schema";
import { useEffect, useState } from "react";
import { shopService } from "@/services/shop.service";

export default function EditShop() {
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
  } = useForm<ShopFormData>({
    resolver: zodResolver(shopSchema),
  });

  useEffect(() => {
    if (!id) return;
    fetchShop(Number(id));
  }, [id]);

  const fetchShop = async (shopId: number) => {
    try {
      const data = await shopService.getById(shopId);
      reset({
        shopName: data.shop.name,
        address: data.shop.address,
        gstNo: data.shop.gstNo || "",
        fssaiNo: data.shop.fssaiNo || "",
        phone: data.shop.phone || "",
        email: data.shop.email || "",
        stateCode: data.shop.stateCode || "",
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load shop data.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ShopFormData) => {
    if (!id) return;
    setIsSubmitting(true);
    setError("");
    try {
      await shopService.update(Number(id), {
        name: data.shopName,
        address: data.address,
        gstNo: data.gstNo || undefined,
        fssaiNo: data.fssaiNo || undefined,
        phone: data.phone || undefined,
        email: data.email || undefined,
        stateCode: data.stateCode || undefined,
      });
      navigate(`/shops/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update shop. Please try again.");
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
          onClick={() => navigate(id ? `/shops/${id}` : "/shops")}
          className="text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Shop
        </Button>
      </div>

      <div className="w-full">
        <Card className="border-0 shadow-md">
          <CardContent className="p-0">
            <div className="flex items-center gap-4 p-6 pb-5 border-b border-border">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Store className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Edit Shop</h2>
                <p className="text-sm text-muted-foreground">Update the shop information below.</p>
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
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="shopName">Shop Name <span className="text-destructive">*</span></Label>
                        <Input
                          id="shopName"
                          placeholder="Enter shop name"
                          {...register("shopName")}
                          className={`h-10 ${errors.shopName ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        />
                        {errors.shopName && (
                          <p className="text-xs text-destructive">{errors.shopName.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address <span className="text-destructive">*</span></Label>
                        <Input
                          id="address"
                          placeholder="Enter full shop address"
                          {...register("address")}
                          className={`h-10 ${errors.address ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        />
                        {errors.address && (
                          <p className="text-xs text-destructive">{errors.address.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                      Regulatory Details
                      <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                      <span className="h-px flex-1 bg-border" />
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gstNo">GST Number</Label>
                        <Input
                          id="gstNo"
                          placeholder="Enter GST number"
                          {...register("gstNo")}
                          className="h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fssaiNo">FSSAI Number</Label>
                        <Input
                          id="fssaiNo"
                          placeholder="Enter FSSAI number"
                          {...register("fssaiNo")}
                          className="h-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                      Contact Details
                      <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                      <span className="h-px flex-1 bg-border" />
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          placeholder="Enter phone number"
                          {...register("phone")}
                          className="h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          placeholder="Enter email address"
                          {...register("email")}
                          className="h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stateCode">State Code</Label>
                        <Input
                          id="stateCode"
                          placeholder="Enter state code"
                          {...register("stateCode")}
                          className="h-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(id ? `/shops/${id}` : "/shops")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      "Update Shop"
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
