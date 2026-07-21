import { useNavigate } from "react-router-dom";
import { Building2, User, Info, Database } from "lucide-react";

const settingsCards = [
  {
    title: "Business Profile",
    description: "Company details, GSTIN, FSSAI, and bank info for invoices.",
    icon: Building2,
    path: "/settings/business-profile",
  },
  {
    title: "My Profile",
    description: "View your account details and role.",
    icon: User,
    path: "/profile",
  },
  {
    title: "About",
    description: "App version and information.",
    icon: Info,
    path: "/settings/about",
  },
  {
    title: "Data Management",
    description: "Export and manage your inventory data.",
    icon: Database,
    path: "/settings/data-management",
  },
];

export default function SettingsPage() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-[26px] font-extrabold" style={{ color: "var(--app-text-dark)" }}>Settings</h2>
            <p className="text-[13.5px] mt-0.5" style={{ color: "var(--app-text-light)" }}>
              Configure your system preferences.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {settingsCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.title}
              onClick={() => navigate(card.path)}
              className="rounded-[16px] p-5 text-left cursor-pointer transition-all duration-200 hover:shadow-md group"
              style={{ background: "var(--app-card)", border: "1px solid var(--app-border)" }}
            >
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center mb-4" style={{ background: "#F4F4F7", color: "#6B7280" }}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-[14px] font-bold mb-1" style={{ color: "var(--app-text-dark)" }}>{card.title}</h3>
              <p className="text-[12px] leading-relaxed mb-4" style={{ color: "var(--app-text-light)" }}>{card.description}</p>
              <span className="text-[12px] font-semibold inline-flex items-center gap-1 transition-colors" style={{ color: "var(--app-indigo)" }}>
                Open
                <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
