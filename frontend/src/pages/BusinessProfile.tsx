import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { businessProfileService } from "@/services/businessProfile.service";

export default function BusinessProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    stateCode: "",
    gstNo: "",
    fssaiNo: "",
    bankName: "",
    bankAccountNo: "",
    bankBranch: "",
    bankIFSC: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await businessProfileService.get();
      const p = data.profile;
      setForm({
        name: p.name || "",
        address: p.address || "",
        phone: p.phone || "",
        email: p.email || "",
        stateCode: p.stateCode || "",
        gstNo: p.gstNo || "",
        fssaiNo: p.fssaiNo || "",
        bankName: p.bankName || "",
        bankAccountNo: p.bankAccountNo || "",
        bankBranch: p.bankBranch || "",
        bankIFSC: p.bankIFSC || "",
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await businessProfileService.update(form);
      setSuccess("Business profile updated successfully");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--app-text-light)" }} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-7">
        <button onClick={() => navigate("/settings")} className="flex items-center gap-1.5 text-[13px] font-medium cursor-pointer mb-5 transition-colors" style={{ color: "var(--app-text-light)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--app-text-dark)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--app-text-light)")}>
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Settings
        </button>
        <h2 className="text-[26px] font-extrabold" style={{ color: "var(--app-text-dark)" }}>Business Profile</h2>
        <p className="text-[13.5px] mt-0.5" style={{ color: "var(--app-text-light)" }}>Configure your company details for GST invoices.</p>
      </div>

      <form onSubmit={onSubmit}>
        <div className="rounded-[16px] overflow-hidden" style={{ background: "var(--app-card)", border: "1px solid var(--app-border)" }}>
          <div className="p-6">
            {error && (
              <div className="p-3 rounded-[10px] text-[13px] mb-4" style={{ background: "#FEE2E2", color: "#DC2626", border: "1px solid #FECACA" }}>{error}</div>
            )}
            {success && (
              <div className="p-3 rounded-[10px] text-[13px] mb-4" style={{ background: "#E8F9EF", color: "#16A34A", border: "1px solid #BBF7D0" }}>{success}</div>
            )}

            <div className="mb-6">
              <h3 className="text-[13px] font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--app-text-dark)" }}>
                Company Information
                <span className="h-px flex-1" style={{ background: "var(--app-border)" }} />
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-medium mb-1.5 block" style={{ color: "var(--app-text-mid)" }}>Company Name <span style={{ color: "#EF4444" }}>*</span></label>
                  <input value={form.name} onChange={(e) => handleChange("name", e.target.value)} required className="w-full rounded-[10px] px-4 py-3 text-[13px] outline-none" style={{ background: "var(--app-card)", border: "1px solid var(--app-border)", color: "var(--app-text-dark)" }} />
                </div>
                <div>
                  <label className="text-[12px] font-medium mb-1.5 block" style={{ color: "var(--app-text-mid)" }}>State Code</label>
                  <input value={form.stateCode} onChange={(e) => handleChange("stateCode", e.target.value)} placeholder="e.g. 27" className="w-full rounded-[10px] px-4 py-3 text-[13px] outline-none" style={{ background: "var(--app-card)", border: "1px solid var(--app-border)", color: "var(--app-text-dark)" }} />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[12px] font-medium mb-1.5 block" style={{ color: "var(--app-text-mid)" }}>Address <span style={{ color: "#EF4444" }}>*</span></label>
                  <input value={form.address} onChange={(e) => handleChange("address", e.target.value)} required className="w-full rounded-[10px] px-4 py-3 text-[13px] outline-none" style={{ background: "var(--app-card)", border: "1px solid var(--app-border)", color: "var(--app-text-dark)" }} />
                </div>
                <div>
                  <label className="text-[12px] font-medium mb-1.5 block" style={{ color: "var(--app-text-mid)" }}>Phone</label>
                  <input value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} className="w-full rounded-[10px] px-4 py-3 text-[13px] outline-none" style={{ background: "var(--app-card)", border: "1px solid var(--app-border)", color: "var(--app-text-dark)" }} />
                </div>
                <div>
                  <label className="text-[12px] font-medium mb-1.5 block" style={{ color: "var(--app-text-mid)" }}>Email</label>
                  <input value={form.email} onChange={(e) => handleChange("email", e.target.value)} type="email" className="w-full rounded-[10px] px-4 py-3 text-[13px] outline-none" style={{ background: "var(--app-card)", border: "1px solid var(--app-border)", color: "var(--app-text-dark)" }} />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-[13px] font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--app-text-dark)" }}>
                Regulatory Details
                <span className="h-px flex-1" style={{ background: "var(--app-border)" }} />
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-medium mb-1.5 block" style={{ color: "var(--app-text-mid)" }}>GSTIN Number</label>
                  <input value={form.gstNo} onChange={(e) => handleChange("gstNo", e.target.value)} className="w-full rounded-[10px] px-4 py-3 text-[13px] outline-none" style={{ background: "var(--app-card)", border: "1px solid var(--app-border)", color: "var(--app-text-dark)" }} />
                </div>
                <div>
                  <label className="text-[12px] font-medium mb-1.5 block" style={{ color: "var(--app-text-mid)" }}>FSSAI Number</label>
                  <input value={form.fssaiNo} onChange={(e) => handleChange("fssaiNo", e.target.value)} className="w-full rounded-[10px] px-4 py-3 text-[13px] outline-none" style={{ background: "var(--app-card)", border: "1px solid var(--app-border)", color: "var(--app-text-dark)" }} />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[13px] font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--app-text-dark)" }}>
                Bank Details
                <span className="text-[12px] font-normal" style={{ color: "var(--app-text-light)" }}>(optional)</span>
                <span className="h-px flex-1" style={{ background: "var(--app-border)" }} />
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-medium mb-1.5 block" style={{ color: "var(--app-text-mid)" }}>Bank Name</label>
                  <input value={form.bankName} onChange={(e) => handleChange("bankName", e.target.value)} className="w-full rounded-[10px] px-4 py-3 text-[13px] outline-none" style={{ background: "var(--app-card)", border: "1px solid var(--app-border)", color: "var(--app-text-dark)" }} />
                </div>
                <div>
                  <label className="text-[12px] font-medium mb-1.5 block" style={{ color: "var(--app-text-mid)" }}>Account Number</label>
                  <input value={form.bankAccountNo} onChange={(e) => handleChange("bankAccountNo", e.target.value)} className="w-full rounded-[10px] px-4 py-3 text-[13px] outline-none" style={{ background: "var(--app-card)", border: "1px solid var(--app-border)", color: "var(--app-text-dark)" }} />
                </div>
                <div>
                  <label className="text-[12px] font-medium mb-1.5 block" style={{ color: "var(--app-text-mid)" }}>Branch</label>
                  <input value={form.bankBranch} onChange={(e) => handleChange("bankBranch", e.target.value)} className="w-full rounded-[10px] px-4 py-3 text-[13px] outline-none" style={{ background: "var(--app-card)", border: "1px solid var(--app-border)", color: "var(--app-text-dark)" }} />
                </div>
                <div>
                  <label className="text-[12px] font-medium mb-1.5 block" style={{ color: "var(--app-text-mid)" }}>IFSC Code</label>
                  <input value={form.bankIFSC} onChange={(e) => handleChange("bankIFSC", e.target.value)} className="w-full rounded-[10px] px-4 py-3 text-[13px] outline-none" style={{ background: "var(--app-card)", border: "1px solid var(--app-border)", color: "var(--app-text-dark)" }} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4" style={{ borderTop: "1px solid var(--app-border)" }}>
            <button type="button" onClick={() => navigate("/settings")} className="px-5 py-2.5 rounded-[10px] text-[13px] font-semibold cursor-pointer transition-colors" style={{ border: "1px solid var(--app-border)", background: "var(--app-card)", color: "var(--app-text-dark)" }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-[13px] font-semibold text-white cursor-pointer transition-colors" style={{ background: "var(--app-indigo)" }}>
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
