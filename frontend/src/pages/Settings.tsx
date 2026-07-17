import { Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground mt-1">Configure your system preferences.</p>
      </div>
      <Card className="border-0 shadow-md">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Settings className="h-8 w-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Coming Soon</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            The settings page is under development. Stay tuned!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
