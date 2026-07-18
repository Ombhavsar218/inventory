import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { businessProfileService, type BusinessProfile } from "@/services/businessProfile.service";

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
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/settings")}
          className="text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Settings
        </Button>
      </div>

      <div className="w-full">
        <Card className="border-0 shadow-md">
          <CardContent className="p-0">
            <div className="flex items-center gap-4 p-6 pb-5 border-b border-border">
              <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                <Building2 className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Business Profile</h2>
                <p className="text-sm text-muted-foreground">Configure your company details for GST invoices.</p>
              </div>
            </div>

            <form onSubmit={onSubmit}>
              <div className="p-6 space-y-6">
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">{error}</div>
                )}
                {success && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">{success}</div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    Company Information
                    <span className="h-px flex-1 bg-border" />
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Company Name <span className="text-destructive">*</span></Label>
                      <Input value={form.name} onChange={(e) => handleChange("name", e.target.value)} className="h-10" required />
                    </div>
                    <div className="space-y-2">
                      <Label>State Code</Label>
                      <Input value={form.stateCode} onChange={(e) => handleChange("stateCode", e.target.value)} placeholder="e.g. 27" className="h-10" />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Address <span className="text-destructive">*</span></Label>
                      <Input value={form.address} onChange={(e) => handleChange("address", e.target.value)} className="h-10" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} className="h-10" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={form.email} onChange={(e) => handleChange("email", e.target.value)} type="email" className="h-10" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    Regulatory Details
                    <span className="h-px flex-1 bg-border" />
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>GSTIN Number</Label>
                      <Input value={form.gstNo} onChange={(e) => handleChange("gstNo", e.target.value)} className="h-10" />
                    </div>
                    <div className="space-y-2">
                      <Label>FSSAI Number</Label>
                      <Input value={form.fssaiNo} onChange={(e) => handleChange("fssaiNo", e.target.value)} className="h-10" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    Bank Details
                    <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                    <span className="h-px flex-1 bg-border" />
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Bank Name</Label>
                      <Input value={form.bankName} onChange={(e) => handleChange("bankName", e.target.value)} className="h-10" />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Number</Label>
                      <Input value={form.bankAccountNo} onChange={(e) => handleChange("bankAccountNo", e.target.value)} className="h-10" />
                    </div>
                    <div className="space-y-2">
                      <Label>Branch</Label>
                      <Input value={form.bankBranch} onChange={(e) => handleChange("bankBranch", e.target.value)} className="h-10" />
                    </div>
                    <div className="space-y-2">
                      <Label>IFSC Code</Label>
                      <Input value={form.bankIFSC} onChange={(e) => handleChange("bankIFSC", e.target.value)} className="h-10" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30">
                <Button type="button" variant="outline" onClick={() => navigate("/settings")}>Cancel</Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (<><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</>) : ("Save Profile")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
