import { useState, useEffect, useMemo } from "react";
import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { Receipt, Plus, Eye, Trash2, Search, Loader2, Pencil, ChevronDown, ChevronRight, Printer, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { billService, type Bill, type BillGrouped } from "@/services/bill.service";
import { useAuth } from "@/contexts/AuthContext";
import PrintShopBill from "@/components/PrintShopBill";
import PrintBill from "@/components/PrintBill";
import PrintAllBills from "@/components/PrintAllBills";

export default function Bills() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isOwner = user?.role === "OWNER";

  const [bills, setBills] = useState<Bill[]>([]);
  const [groups, setGroups] = useState<BillGrouped[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [expandedShops, setExpandedShops] = useState<Set<number>>(new Set());
  const [printShopId, setPrintShopId] = useState<number | null>(null);
  const [printBillId, setPrintBillId] = useState<number | null>(null);
  const [showPrintAll, setShowPrintAll] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    if (isOwner) {
      try {
        const data = await billService.getGrouped(selectedDate);
        setGroups(data.groups);
      } catch (err) {
        console.error("Failed to fetch grouped bills:", err);
      }
    } else {
      try {
        const data = await billService.getAll();
        setBills(data.bills);
      } catch (err) {
        console.error("Failed to fetch bills:", err);
      }
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    try {
      await billService.delete(id);
      setBills(bills.filter((b) => b.id !== id));
      setGroups(groups.map((g) => ({
        ...g,
        bills: g.bills.filter((b) => b.id !== id),
        totalItems: g.bills.filter((b) => b.id !== id).reduce((sum, b) => sum + b.items.length, 0),
        totalAmount: g.bills.filter((b) => b.id !== id).reduce((sum, b) => sum + b.totalAmount, 0),
        billsCount: g.bills.filter((b) => b.id !== id).length,
      })).filter((g) => g.billsCount > 0));
      setDeleteId(null);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete bill");
    }
  };

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return groups;
    const q = search.toLowerCase();
    return groups.filter((g) => g.shopName.toLowerCase().includes(q));
  }, [groups, search]);

  const filteredBills = useMemo(() => {
    if (!search.trim()) return bills;
    const q = search.toLowerCase();
    return bills.filter(
      (bill) =>
        bill.shop.name.toLowerCase().includes(q) ||
        bill.creator.fullName.toLowerCase().includes(q)
    );
  }, [bills, search]);

  const dateInputKey = isOwner ? "owner-date" : "marketing-date";

  if (printShopId) {
    return (
      <div>
        <div className="mb-4 no-print">
          <Button variant="ghost" size="sm" onClick={() => setPrintShopId(null)} className="text-muted-foreground hover:text-foreground -ml-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Bills
          </Button>
        </div>
        <PrintShopBill shopId={printShopId} date={selectedDate} onClose={() => setPrintShopId(null)} />
      </div>
    );
  }

  if (printBillId) {
    return (
      <div>
        <div className="mb-4 no-print">
          <Button variant="ghost" size="sm" onClick={() => setPrintBillId(null)} className="text-muted-foreground hover:text-foreground -ml-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Bills
          </Button>
        </div>
        <PrintBill billId={printBillId} onReady={() => {}} />
      </div>
    );
  }

  if (showPrintAll) {
    return (
      <div>
        <div className="mb-4 no-print">
          <Button variant="ghost" size="sm" onClick={() => setShowPrintAll(false)} className="text-muted-foreground hover:text-foreground -ml-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Bills
          </Button>
        </div>
        <PrintAllBills groups={filteredGroups} date={selectedDate} onClose={() => setShowPrintAll(false)} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Bills</h2>
          <p className="text-muted-foreground mt-1">
            {isOwner ? "View bills grouped by shop." : "Manage and track your bills."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isOwner && filteredGroups.length > 0 && (
            <Button variant="outline" onClick={() => setShowPrintAll(true)}>
              <Printer className="h-4 w-4 mr-2" />
              Print All
            </Button>
          )}
          <Button onClick={() => navigate("/bills/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Bill
          </Button>
        </div>
      </div>

      {!loading && ((isOwner && groups.length > 0) || (!isOwner && bills.length > 0)) && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={isOwner ? "Search by shop name..." : "Search by shop or creator..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
          <Input
            key={dateInputKey}
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-10 w-44"
          />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : isOwner ? (
        filteredGroups.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
                <Receipt className="h-8 w-8 text-rose-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {search ? "No shops found" : "No bills for this date"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                {search ? "Try a different search term." : "No bills were created on this date."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">#</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shop Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bills</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Items</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGroups.map((group, index) => {
                    const isExpanded = expandedShops.has(group.shopId);
                    return (
                      <Fragment key={`group-${group.shopId}`}>
                        <tr className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => {
                          const next = new Set(expandedShops);
                          if (next.has(group.shopId)) next.delete(group.shopId);
                          else next.add(group.shopId);
                          setExpandedShops(next);
                        }}>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                              {index + 1}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            <span
                              className="text-blue-600 hover:underline cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/bills/shop/${group.shopId}?date=${selectedDate}`);
                              }}
                            >
                              {group.shopName}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{group.billsCount}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{group.totalItems}</td>
                          <td className="px-4 py-3 text-sm font-medium">₹{group.totalAmount.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/bills/shop/${group.shopId}?date=${selectedDate}`)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setPrintShopId(group.shopId)}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-blue-600"
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const next = new Set(expandedShops);
                                  if (!next.has(group.shopId)) next.add(group.shopId);
                                  setExpandedShops(next);
                                }}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-green-600"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (group.bills.length === 1) {
                                    setDeleteId(group.bills[0].id);
                                  } else {
                                    const next = new Set(expandedShops);
                                    if (!next.has(group.shopId)) next.add(group.shopId);
                                    setExpandedShops(next);
                                  }
                                }}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && group.bills.map((bill) => (
                          <tr key={`bill-${bill.id}`} className="border-b border-border last:border-0 bg-muted/10">
                            <td className="px-4 py-2 text-sm text-muted-foreground pl-10">—</td>
                            <td className="px-4 py-2 text-sm text-muted-foreground">{bill.creator.fullName}</td>
                            <td className="px-4 py-2 text-sm text-muted-foreground">{bill.items.length} item(s)</td>
                            <td className="px-4 py-2 text-sm text-muted-foreground" />
                            <td className="px-4 py-2 text-sm font-medium">₹{bill.totalAmount.toFixed(2)}</td>
                            <td className="px-4 py-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/bills/${bill.id}`)}
                                  className="h-7 w-7 p-0"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/bills/${bill.id}/edit`)}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-green-600"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setPrintShopId(group.shopId)}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-blue-600"
                                >
                                  <Printer className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteId(bill.id)}
                                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )
      ) : filteredBills.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
              <Receipt className="h-8 w-8 text-rose-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              {search ? "No bills found" : "No bills yet"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {search ? "Try a different search term." : "Create your first bill to get started."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shop</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Items</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created By</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill) => (
                  <tr key={bill.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm">{new Date(bill.date).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3 text-sm font-medium">{bill.shop.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{bill.items.length} item(s)</td>
                    <td className="px-4 py-3 text-sm font-medium">₹{bill.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{bill.creator.fullName}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/bills/${bill.id}`)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/bills/${bill.id}/edit`)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-green-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(bill.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Bill?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This will also restore stock quantities. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteId && handleDelete(deleteId)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
