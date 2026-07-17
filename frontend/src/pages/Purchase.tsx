import { ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Purchase() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Purchase</h2>
        <p className="text-muted-foreground mt-1">Manage your purchase orders.</p>
      </div>
      <Card className="border-0 shadow-md">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
            <ShoppingCart className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Coming Soon</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            The purchase management feature is under development. Stay tuned!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
