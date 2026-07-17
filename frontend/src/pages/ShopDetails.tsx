import { ArrowLeft, Loader2, Store, MapPin, Calendar, User, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { shopService, type Shop } from "@/services/shop.service";

export default function ShopDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchShop(Number(id));
  }, [id]);

  const fetchShop = async (shopId: number) => {
    try {
      const data = await shopService.getById(shopId);
      setShop(data.shop);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load shop details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/shops")}
          className="text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Shops
        </Button>
      </div>

      <div className="w-full">
        <Card className="border-0 shadow-md">
          <CardContent className="p-0">
            <div className="flex items-center gap-4 p-6 pb-5 border-b border-border">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Store className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">Shop Details</h2>
                <p className="text-sm text-muted-foreground">View complete shop information.</p>
              </div>
              {shop && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/shops/${shop.id}/edit`)}
                >
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </Button>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <p className="text-sm text-destructive">{error}</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate("/shops")}>
                  Go back
                </Button>
              </div>
            ) : shop ? (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    Basic Information
                    <span className="h-px flex-1 bg-border" />
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Store className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Shop Name</p>
                        <p className="text-sm font-medium text-foreground">{shop.name}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Address</p>
                        <p className="text-sm text-foreground">{shop.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    Regulatory Details
                    <span className="h-px flex-1 bg-border" />
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="h-4 w-4 mt-0.5 shrink-0 flex items-center justify-center text-xs font-bold text-muted-foreground">G</div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">GST Number</p>
                        <p className="text-sm text-foreground">{shop.gstNo || "—"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-4 w-4 mt-0.5 shrink-0 flex items-center justify-center text-xs font-bold text-muted-foreground">F</div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">FSSAI Number</p>
                        <p className="text-sm text-foreground">{shop.fssaiNo || "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    Metadata
                    <span className="h-px flex-1 bg-border" />
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <User className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Owner</p>
                        <p className="text-sm text-foreground">{shop.owner.fullName}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Created</p>
                        <p className="text-sm text-foreground">
                          {new Date(shop.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
