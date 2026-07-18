import { useNavigate } from "react-router-dom";
import { Settings, Building2, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  const navigate = useNavigate();

  const settingsItems = [
    {
      title: "Business Profile",
      description: "Configure company details, GSTIN, FSSAI, and bank details for invoices.",
      icon: Building2,
      color: "text-violet-600",
      bg: "bg-violet-50",
      path: "/settings/business-profile",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground mt-1">Configure your system preferences.</p>
      </div>

      <div className="space-y-3">
        {settingsItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.title}
              className="border-0 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => navigate(item.path)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
