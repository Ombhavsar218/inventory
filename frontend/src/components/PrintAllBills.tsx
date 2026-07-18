import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { type BillGrouped } from "@/services/bill.service";
import { businessProfileService, type BusinessProfile } from "@/services/businessProfile.service";

const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function numberToWords(num: number): string {
  if (num === 0) return "Zero";
  const n = Math.round(num);
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : "");
  if (n < 1000) return ONES[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + numberToWords(n % 100) : "");
  if (n < 100000) return numberToWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + numberToWords(n % 1000) : "");
  if (n < 10000000) return numberToWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + numberToWords(n % 100000) : "");
  return numberToWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + numberToWords(n % 10000000) : "");
}

function roundTo2(n: number) {
  return Math.round(n * 100) / 100;
}

function formatDate(d: string) {
  const date = new Date(d);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

interface ShopInvoiceData {
  shop: { name: string; address?: string; gstNo?: string | null; fssaiNo?: string | null };
  items: { stockName: string; quantity: number; price: number; mrp: number | null; hsnCode: string | null; gstRate: number | null }[];
}

function computeInvoice(items: ShopInvoiceData["items"]) {
  let taxableTotal = 0;
  let mrpTotal = 0;
  const gstBreakdown: Record<number, { taxable: number; sgst: number; cgst: number }> = {};

  for (const item of items) {
    const amount = roundTo2(item.price * item.quantity);
    taxableTotal += amount;
    mrpTotal += roundTo2((item.mrp ?? item.price) * item.quantity);
    const gstRate = item.gstRate ?? 5;
    if (!gstBreakdown[gstRate]) {
      gstBreakdown[gstRate] = { taxable: 0, sgst: 0, cgst: 0 };
    }
    gstBreakdown[gstRate].taxable += amount;
    gstBreakdown[gstRate].sgst += roundTo2(amount * (gstRate / 2) / 100);
    gstBreakdown[gstRate].cgst += roundTo2(amount * (gstRate / 2) / 100);
  }

  let totalSgst = 0;
  let totalCgst = 0;
  for (const rate of Object.keys(gstBreakdown).map(Number).sort()) {
    totalSgst += gstBreakdown[rate].sgst;
    totalCgst += gstBreakdown[rate].cgst;
  }

  const grandTotal = roundTo2(taxableTotal + totalSgst + totalCgst);
  const roundOff = roundTo2(Math.round(grandTotal) - grandTotal);
  const finalTotal = Math.round(grandTotal);
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);

  return { taxableTotal, mrpTotal, gstBreakdown, totalSgst, totalCgst, grandTotal, roundOff, finalTotal, totalQty };
}

interface PrintAllBillsProps {
  groups: BillGrouped[];
  date: string;
  onClose?: () => void;
}

export default function PrintAllBills({ groups, date, onClose }: PrintAllBillsProps) {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const printed = useRef(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await businessProfileService.get();
      setProfile(res.profile);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load business profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile && !printed.current) {
      printed.current = true;
      setTimeout(() => {
        window.print();
        onClose?.();
      }, 500);
    }
  }, [profile, onClose]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error || "Failed to load data"}</p>
      </div>
    );
  }

  const gstRates = [0, 5, 12, 18, 28];
  const s: Record<string, string> = { border: "1px solid #000", borderCollapse: "collapse", fontSize: "10.5px" };

  const invoices: ShopInvoiceData[] = groups.map((group) => {
    const allItems: ShopInvoiceData["items"] = [];
    for (const bill of group.bills) {
      for (const item of bill.items) {
        allItems.push({
          stockName: item.stock.name,
          quantity: item.quantity,
          price: item.price,
          mrp: item.stock.mrp ?? null,
          hsnCode: item.stock.hsnCode ?? null,
          gstRate: item.stock.gstRate ?? null,
        });
      }
    }
    const shop = group.bills[0]?.shop || { name: group.shopName };
    return { shop, items: allItems };
  });

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-all, #print-all * { visibility: visible; }
          #print-all { position: absolute; left: 0; top: 0; width: 100%; }
          @page { margin: 5mm; size: A4; }
          .invoice-page { page-break-after: always; }
          .invoice-page:last-child { page-break-after: auto; }
        }
      `}</style>
      <div id="print-all">
        {invoices.map((invoice, idx) => {
          const inv = computeInvoice(invoice.items);
          return (
            <div key={idx} className={idx < invoices.length - 1 ? "invoice-page" : ""} style={{ marginBottom: idx < invoices.length - 1 ? "0" : "0" }}>
              <div style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: "11px", color: "#000", maxWidth: "950px", margin: "0 auto", padding: "8px 10px 4px 10px", border: "1.5px solid #000", background: "#fff" }}>
                {/* Company Name */}
                <div style={{ textAlign: "center", fontSize: "24px", fontWeight: "bold", letterSpacing: "1px", margin: 0 }}>{profile.name}</div>
                <div style={{ textAlign: "center", fontSize: "10.5px", margin: "0 0 2px 0" }}>
                  {profile.address}{profile.phone ? `, Phone No.: ${profile.phone}` : ""}
                </div>
                <div style={{ textAlign: "center", fontSize: "10.5px", margin: "0 0 2px 0" }}>
                  {profile.stateCode ? `STATE CODE-${profile.stateCode}` : ""}
                  {profile.gstNo ? ` \u00A0GSTIN NO.- ${profile.gstNo}` : ""}
                  {profile.fssaiNo ? ` \u00A0FSSAI NO.-${profile.fssaiNo}` : ""}
                  {profile.email ? ` \u00A0EMAIL ID- ${profile.email}` : ""}
                </div>

                {/* Top Block */}
                <table style={{ borderCollapse: "collapse", width: "100%" }}>
                  <tbody>
                    <tr>
                      <td style={{ width: "60%", border: "1px solid #000", padding: "4px 6px" }}>
                        <div style={{ fontWeight: "bold", textDecoration: "underline", fontSize: "10.5px" }}>Details of Receiver | Bill to :</div>
                        <div style={{ fontWeight: "bold", fontSize: "12px" }}>{invoice.shop.name}</div>
                        <div>{invoice.shop.address || ""}</div>
                        {invoice.shop.gstNo && <div>GST No.: {invoice.shop.gstNo} \u00A0\u00A0 SALESAMN :</div>}
                        {invoice.shop.fssaiNo && <div>FSSAI Number :{invoice.shop.fssaiNo} \u00A0\u00A0 PHONE NO. :</div>}
                      </td>
                      <td style={{ width: "40%", border: "1px solid #000", padding: 0 }}>
                        <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "13px", borderBottom: "1px solid #000" }}>GST Tax Invoice</div>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <tbody>
                            <tr>
                              <td style={{ fontWeight: "bold", width: "45%", padding: "2px 4px" }}>Invoice Number</td>
                              <td style={{ width: "5%", textAlign: "center", padding: "2px 4px" }}>:</td>
                              <td style={{ padding: "2px 4px" }}>CONSOLIDATED</td>
                            </tr>
                            <tr>
                              <td style={{ fontWeight: "bold", width: "45%", padding: "2px 4px" }}>Invoice Date</td>
                              <td style={{ width: "5%", textAlign: "center", padding: "2px 4px" }}>:</td>
                              <td style={{ padding: "2px 4px" }}>{formatDate(date)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Product Table */}
                <table style={{ borderCollapse: "collapse", width: "100%", marginTop: "4px" }}>
                  <thead>
                    <tr>
                      <th style={{ ...s, width: "3%", padding: "3px 2px", fontWeight: "bold" }}>Sr.</th>
                      <th style={{ ...s, width: "22%", textAlign: "left" as const, padding: "3px 2px", fontWeight: "bold" }}>Product</th>
                      <th style={{ ...s, width: "7%", padding: "3px 2px", fontWeight: "bold" }}>MRP</th>
                      <th style={{ ...s, width: "7%", padding: "3px 2px", fontWeight: "bold" }}>HSN</th>
                      <th style={{ ...s, width: "5%", padding: "3px 2px", fontWeight: "bold" }}>Qty.</th>
                      <th style={{ ...s, width: "6%", padding: "3px 2px", fontWeight: "bold" }}>FREE</th>
                      <th style={{ ...s, width: "7%", padding: "3px 2px", fontWeight: "bold" }}>Rate</th>
                      <th style={{ ...s, width: "5%", padding: "3px 2px", fontWeight: "bold" }}>TD%</th>
                      <th style={{ ...s, width: "5%", padding: "3px 2px", fontWeight: "bold" }}>CD%</th>
                      <th style={{ ...s, width: "5%", padding: "3px 2px", fontWeight: "bold" }}>SCH</th>
                      <th style={{ ...s, width: "6%", padding: "3px 2px", fontWeight: "bold" }}>SGST</th>
                      <th style={{ ...s, width: "6%", padding: "3px 2px", fontWeight: "bold" }}>CGST</th>
                      <th style={{ ...s, width: "8%", padding: "3px 2px", fontWeight: "bold" }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, i) => {
                      const amount = roundTo2(item.price * item.quantity);
                      const gstRate = item.gstRate ?? 5;
                      const sgst = roundTo2(amount * (gstRate / 2) / 100);
                      const cgst = roundTo2(amount * (gstRate / 2) / 100);
                      const mrp = item.mrp ?? item.price;
                      return (
                        <tr key={i}>
                          <td style={{ ...s, textAlign: "center", padding: "2px 4px" }}>{i + 1}.</td>
                          <td style={{ ...s, textAlign: "left", fontWeight: "bold", padding: "2px 4px" }}>{item.stockName}</td>
                          <td style={{ ...s, textAlign: "center", padding: "2px 4px" }}>{mrp.toFixed(2)}</td>
                          <td style={{ ...s, textAlign: "center", padding: "2px 4px" }}>{item.hsnCode || "-"}</td>
                          <td style={{ ...s, textAlign: "center", padding: "2px 4px" }}>{item.quantity}</td>
                          <td style={{ ...s, textAlign: "center", padding: "2px 4px" }}>0.00</td>
                          <td style={{ ...s, textAlign: "center", padding: "2px 4px" }}>{item.price.toFixed(2)}</td>
                          <td style={{ ...s, textAlign: "center", padding: "2px 4px" }}>0.00</td>
                          <td style={{ ...s, textAlign: "center", padding: "2px 4px" }}>0.00</td>
                          <td style={{ ...s, textAlign: "center", padding: "2px 4px" }}>0.00</td>
                          <td style={{ ...s, textAlign: "center", padding: "2px 4px" }}>{sgst.toFixed(2)}</td>
                          <td style={{ ...s, textAlign: "center", padding: "2px 4px" }}>{cgst.toFixed(2)}</td>
                          <td style={{ ...s, textAlign: "center", padding: "2px 4px" }}>{amount.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                    {/* Watermark */}
                    <tr>
                      <td colSpan={13} style={{ border: "1px solid #000", height: "170px", position: "relative" }}>
                        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "46px", fontWeight: 900, color: "#dfe8e2", letterSpacing: "4px", whiteSpace: "nowrap", zIndex: 0, userSelect: "none" }}>{profile.name}</div>
                      </td>
                    </tr>
                    {/* Total */}
                    <tr>
                      <td style={{ ...s, textAlign: "left", fontWeight: "normal", padding: "2px 4px" }} colSpan={4}></td>
                      <td style={{ ...s, textAlign: "center", fontWeight: "bold", padding: "2px 4px" }}>{inv.totalQty}</td>
                      <td colSpan={7} style={{ ...s, textAlign: "right", fontWeight: "bold", padding: "2px 4px" }}>Total Amount Before Tax</td>
                      <td style={{ ...s, textAlign: "center", fontWeight: "bold", padding: "2px 4px" }}>{inv.taxableTotal.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Bottom Wrap */}
                <div style={{ display: "flex", marginTop: 0 }}>
                  <div style={{ width: "24%", border: "1px solid #000", borderTop: "none", padding: "4px 6px", fontSize: "10.5px" }}>
                    <div style={{ fontWeight: "bold" }}>BANK DETAILS</div>
                    {profile.bankName && <div>BANK- {profile.bankName}</div>}
                    {profile.bankAccountNo && <div>A/C NO.: {profile.bankAccountNo}</div>}
                    {profile.bankBranch && <div>BRANCH: {profile.bankBranch}</div>}
                    {profile.bankIFSC && <div>IFSC - {profile.bankIFSC}</div>}
                  </div>
                  <div style={{ width: "40%", border: "1px solid #000", borderLeft: "none", borderTop: "none" }}>
                    <table style={{ borderCollapse: "collapse", width: "100%" }}>
                      <thead>
                        <tr>
                          <th style={{ border: "1px solid #000", fontSize: "10px", textAlign: "center", padding: "1px 3px" }}>GST%</th>
                          <th style={{ border: "1px solid #000", fontSize: "10px", textAlign: "center", padding: "1px 3px" }}>Taxable</th>
                          <th style={{ border: "1px solid #000", fontSize: "10px", textAlign: "center", padding: "1px 3px" }}>SGST</th>
                          <th style={{ border: "1px solid #000", fontSize: "10px", textAlign: "center", padding: "1px 3px" }}>CGST</th>
                          <th style={{ border: "1px solid #000", fontSize: "10px", textAlign: "center", padding: "1px 3px" }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gstRates.map((rate) => {
                          const data = inv.gstBreakdown[rate] || { taxable: 0, sgst: 0, cgst: 0 };
                          const total = data.sgst + data.cgst;
                          return (
                            <tr key={rate}>
                              <td style={{ border: "1px solid #000", fontSize: "10px", textAlign: "center", padding: "1px 3px" }}>{rate}%</td>
                              <td style={{ border: "1px solid #000", fontSize: "10px", textAlign: "center", padding: "1px 3px" }}>{data.taxable.toFixed(2)}</td>
                              <td style={{ border: "1px solid #000", fontSize: "10px", textAlign: "center", padding: "1px 3px" }}>{data.sgst.toFixed(2)}</td>
                              <td style={{ border: "1px solid #000", fontSize: "10px", textAlign: "center", padding: "1px 3px" }}>{data.cgst.toFixed(2)}</td>
                              <td style={{ border: "1px solid #000", fontSize: "10px", textAlign: "center", padding: "1px 3px" }}>{total.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ width: "36%", border: "1px solid #000", borderLeft: "none", borderTop: "none", padding: 0, fontSize: "10.5px" }}>
                    <table style={{ borderCollapse: "collapse", width: "100%" }}>
                      <tbody>
                        <tr><td style={{ padding: "1px 6px", textAlign: "left" }}>Discount</td><td style={{ padding: "1px 6px", textAlign: "right" }}>0.00</td></tr>
                        <tr><td style={{ padding: "1px 6px", textAlign: "left" }}>Cash Discount</td><td style={{ padding: "1px 6px", textAlign: "right" }}>0.00</td></tr>
                        <tr><td style={{ padding: "1px 6px", textAlign: "left" }}>SGST Payble</td><td style={{ padding: "1px 6px", textAlign: "right" }}>{inv.totalSgst.toFixed(2)}</td></tr>
                        <tr><td style={{ padding: "1px 6px", textAlign: "left" }}>CGST Payble</td><td style={{ padding: "1px 6px", textAlign: "right" }}>{inv.totalCgst.toFixed(2)}</td></tr>
                        <tr><td style={{ padding: "1px 6px", textAlign: "left" }}>C/R Note</td><td style={{ padding: "1px 6px", textAlign: "right" }}>0.00</td></tr>
                        <tr><td style={{ padding: "1px 6px", textAlign: "left" }}>DISPLAY SCH</td><td style={{ padding: "1px 6px", textAlign: "right" }}>0.00</td></tr>
                        <tr><td style={{ padding: "1px 6px", textAlign: "left" }}>Round Off</td><td style={{ padding: "1px 6px", textAlign: "right" }}>{inv.roundOff.toFixed(2)}</td></tr>
                        <tr><td style={{ padding: "1px 6px", textAlign: "left", fontWeight: "bold", fontSize: "12px", borderTop: "1px solid #000" }}>MRP T. &nbsp;&nbsp; {inv.mrpTotal.toFixed(2)} &nbsp;&nbsp; G.TOTAL</td><td style={{ padding: "1px 6px", textAlign: "right", fontWeight: "bold", fontSize: "12px", borderTop: "1px solid #000" }}>{inv.finalTotal}</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Certify */}
                <div style={{ border: "1px solid #000", borderTop: "none", fontSize: "10px", padding: "3px 6px" }}>
                  We hereby certify that the foods mentioned in this invoice is warranted to be of the nature &amp; the quality which they purport to be
                </div>

                {/* Amount in Words */}
                <div style={{ border: "1px solid #000", borderTop: "none", fontSize: "10.5px", padding: "3px 6px", display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                  <div>Amount In Words :- Rs. {numberToWords(inv.finalTotal)} only</div>
                </div>

                {/* Terms */}
                <div style={{ border: "1px solid #000", borderTop: "none", fontSize: "10px", padding: "3px 6px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <b>Terms &amp; Conditions :-</b> 1. Cheque bouncing charges amounts to Rs 500. &nbsp; 2. All disputes are subject to {profile.stateCode ? profile.stateCode : "local"} Jurisdiction
                    <br />
                    Note:- Certified that the particulars given above are true &amp; correct. E &amp; OE
                  </div>
                  <div style={{ textAlign: "right", fontWeight: "bold", whiteSpace: "nowrap" }}>
                    For {profile.name}
                    <div style={{ height: "30px" }}></div>
                    Authorised Signatory
                  </div>
                </div>

                {/* Footer */}
                <div style={{ textAlign: "center", fontStyle: "italic", fontSize: "10px", marginTop: "4px", border: "1px solid #000", borderTop: "none", padding: "2px 0" }}>
                  Powered by {profile.name} | Stocks, Accounts, GST
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
