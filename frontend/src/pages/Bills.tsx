import { useState, useEffect, useMemo } from "react";
import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import {
  Receipt,
  Plus,
  Eye,
  Trash2,
  Search,
  Loader2,
  Pencil,
  ChevronDown,
  ChevronRight,
  Printer,
  ArrowLeft,
  ChevronLeft,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { billService, type Bill, type BillGrouped } from "@/services/bill.service";
import { useAuth } from "@/contexts/AuthContext";
import PrintShopBill from "@/components/PrintShopBill";
import PrintBill from "@/components/PrintBill";
import PrintAllBills from "@/components/PrintAllBills";

const ITEMS_PER_PAGE = 10;

export default function Bills() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isOwner = user?.role === "OWNER" || user?.role === "SUPERADMIN";

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
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData();
    setCurrentPage(1);
  }, [selectedDate]);

  useEffect(() => {
    const checkDateChange = setInterval(() => {
      const today = new Date().toISOString().split("T")[0];
      setSelectedDate((prev) => {
        if (today !== prev) return today;
        return prev;
      });
    }, 60000);
    return () => clearInterval(checkDateChange);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
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
    let result = bills.filter((bill) => bill.date.startsWith(selectedDate));
    if (!search.trim()) return result;
    const q = search.toLowerCase();
    return result.filter(
      (bill) =>
        bill.shop.name.toLowerCase().includes(q) ||
        bill.creator.fullName.toLowerCase().includes(q)
    );
  }, [bills, search, selectedDate]);

  const totalPages = isOwner ? Math.max(1, Math.ceil(filteredGroups.length / ITEMS_PER_PAGE)) : Math.max(1, Math.ceil(filteredBills.length / ITEMS_PER_PAGE));
  const paginatedGroups = filteredGroups.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const paginatedBills = filteredBills.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const startEntry = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endEntry = isOwner ? Math.min(currentPage * ITEMS_PER_PAGE, filteredGroups.length) : Math.min(currentPage * ITEMS_PER_PAGE, filteredBills.length);
  const totalEntries = isOwner ? filteredGroups.length : filteredBills.length;

  const totalShops = groups.length;
  const totalBills = groups.reduce((sum, g) => sum + g.billsCount, 0);
  const totalItems = groups.reduce((sum, g) => sum + g.totalItems, 0);
  const totalAmount = groups.reduce((sum, g) => sum + g.totalAmount, 0);

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
      {/* Page Header */}
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-[26px] font-extrabold" style={{ color: "var(--app-text-dark)" }}>Bills</h2>
            <p className="text-[13.5px] mt-0.5" style={{ color: "var(--app-text-light)" }}>
              {isOwner ? "View bills grouped by shop." : "Manage and track your bills."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isOwner && filteredGroups.length > 0 && (
            <button
              onClick={() => setShowPrintAll(true)}
              className="flex items-center gap-2 px-5 py-[11px] rounded-[11px] text-[14px] font-semibold cursor-pointer transition-colors"
              style={{ background: "var(--app-card)", border: "1px solid var(--app-border)", color: "var(--app-text-dark)" }}
            >
              <Printer className="h-4 w-4" />
              Print All
            </button>
          )}
          <button
            onClick={() => navigate("/bills/new")}
            className="flex items-center gap-2 px-5 py-[11px] rounded-[11px] text-[14px] font-semibold text-white cursor-pointer transition-colors"
            style={{ background: "var(--app-indigo)" }}
          >
            <Plus className="h-4 w-4" />
            Create Bill
          </button>
        </div>
      </div>

      {/* Stats Cards — Owner/SuperAdmin only */}
      {isOwner && !loading && groups.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <div className="rounded-[12px] p-3 flex items-center gap-3" style={{ background: "var(--app-card)", border: "1px solid var(--app-border)" }}>
            <div className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0" style={{ background: "#F4F4F7", color: "#6B7280" }}>
              <span className="text-[14px] font-bold">S</span>
            </div>
            <div>
              <p className="text-[12px]" style={{ color: "var(--app-text-light)" }}>Shops</p>
              <p className="text-[18px] font-extrabold leading-tight" style={{ color: "var(--app-text-dark)" }}>{totalShops}</p>
            </div>
          </div>
          <div className="rounded-[12px] p-3 flex items-center gap-3" style={{ background: "var(--app-card)", border: "1px solid var(--app-border)" }}>
            <div className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0" style={{ background: "#F4F4F7", color: "#6B7280" }}>
              <span className="text-[14px] font-bold">B</span>
            </div>
            <div>
              <p className="text-[12px]" style={{ color: "var(--app-text-light)" }}>Bills</p>
              <p className="text-[18px] font-extrabold leading-tight" style={{ color: "var(--app-text-dark)" }}>{totalBills}</p>
            </div>
          </div>
          <div className="rounded-[12px] p-3 flex items-center gap-3" style={{ background: "var(--app-card)", border: "1px solid var(--app-border)" }}>
            <div className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0" style={{ background: "#F4F4F7", color: "#6B7280" }}>
              <span className="text-[14px] font-bold">I</span>
            </div>
            <div>
              <p className="text-[12px]" style={{ color: "var(--app-text-light)" }}>Items</p>
              <p className="text-[18px] font-extrabold leading-tight" style={{ color: "var(--app-text-dark)" }}>{totalItems}</p>
            </div>
          </div>
          <div className="rounded-[12px] p-3 flex items-center gap-3" style={{ background: "var(--app-card)", border: "1px solid var(--app-border)" }}>
            <div className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0" style={{ background: "#F4F4F7", color: "#6B7280" }}>
              <span className="text-[13px] font-bold">₹</span>
            </div>
            <div>
              <p className="text-[12px]" style={{ color: "var(--app-text-light)" }}>Amount</p>
              <p className="text-[18px] font-extrabold leading-tight" style={{ color: "var(--app-text-dark)" }}>₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1 flex items-center gap-2 rounded-[10px] px-4 py-3" style={{ background: "var(--app-card)", border: "1px solid var(--app-border)" }}>
          <Search className="h-4 w-4" style={{ color: "var(--app-text-light)" }} />
          <input
            type="text"
            placeholder={isOwner ? "Search by shop name..." : "Search by shop or creator..."}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="flex-1 border-none outline-none bg-transparent text-[13px]"
            style={{ color: "var(--app-text-dark)" }}
          />
        </div>
        <div className="flex items-center gap-2 rounded-[10px] px-4 py-3 min-w-[160px]" style={{ background: "var(--app-card)", border: "1px solid var(--app-border)" }}>
          <Calendar className="h-3.5 w-3.5" style={{ color: "var(--app-text-mid)" }} />
          <input
            key={dateInputKey}
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border-none outline-none bg-transparent text-[13px] font-medium flex-1"
            style={{ color: "var(--app-text-dark)" }}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--app-text-light)" }} />
        </div>
      ) : (
        <div className="rounded-[16px] overflow-hidden" style={{ background: "var(--app-card)", border: "1px solid var(--app-border)" }}>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--app-border)", background: "#FFFFFF" }}>
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--app-text-light)" }}>#</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--app-text-light)" }}>Shop Name</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--app-text-light)" }}>Bills</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--app-text-light)" }}>Items</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--app-text-light)" }}>Total</th>
                  <th className="text-right px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--app-text-light)" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isOwner ? (
                  paginatedGroups.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10">
                        <Receipt className="h-8 w-8 mx-auto mb-2 opacity-30" style={{ color: "var(--app-text-light)" }} />
                        <p className="text-[13px]" style={{ color: "var(--app-text-light)" }}>
                          {search ? "No shops found" : "No bills for this date"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedGroups.map((group, index) => {
                      const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
                      const isExpanded = expandedShops.has(group.shopId);

                      return (
                        <Fragment key={`group-${group.shopId}`}>
                          <tr
                            className="transition-colors cursor-pointer"
                            style={{ borderBottom: "1px solid var(--app-border)" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#F3F4F6")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                            onClick={() => {
                              const next = new Set(expandedShops);
                              if (next.has(group.shopId)) next.delete(group.shopId);
                              else next.add(group.shopId);
                              setExpandedShops(next);
                            }}
                          >
                            <td className="px-5 py-3 text-[13px]" style={{ color: "var(--app-text-light)" }}>
                              <span className="inline-flex items-center gap-1.5">
                                {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                                {globalIndex + 1}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: "#F4F4F7", color: "#6B7280" }}>
                                  {group.shopName.charAt(0).toUpperCase()}
                                </div>
                                <span
                                  className="text-[13px] font-bold cursor-pointer hover:underline"
                                  style={{ color: "var(--app-text-dark)" }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/bills/shop/${group.shopId}?date=${selectedDate}`);
                                  }}
                                >
                                  {group.shopName}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-[13px]" style={{ color: "var(--app-text-dark)" }}>{group.billsCount}</td>
                            <td className="px-5 py-3 text-[13px]" style={{ color: "var(--app-text-dark)" }}>{group.totalItems}</td>
                            <td className="px-5 py-3 text-[13px] font-semibold" style={{ color: "var(--app-text-dark)" }}>₹{group.totalAmount.toFixed(2)}</td>
                            <td className="px-5 py-3">
                              <div className="flex items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => navigate(`/bills/shop/${group.shopId}?date=${selectedDate}`)}
                                  className="w-7 h-7 rounded-md flex items-center justify-center cursor-pointer border-none bg-transparent text-gray-400 hover:bg-indigo-50 hover:text-indigo-500 transition-colors"

                                  title="View"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => setPrintShopId(group.shopId)}
                                  className="w-7 h-7 rounded-md flex items-center justify-center cursor-pointer border-none bg-transparent text-gray-400 hover:bg-indigo-50 hover:text-indigo-500 transition-colors"

                                  title="Print"
                                >
                                  <Printer className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    const next = new Set(expandedShops);
                                    if (!next.has(group.shopId)) next.add(group.shopId);
                                    setExpandedShops(next);
                                  }}
                                  className="w-7 h-7 rounded-md flex items-center justify-center cursor-pointer border-none bg-transparent text-gray-400 hover:bg-indigo-50 hover:text-indigo-500 transition-colors"

                                  title="Expand"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (group.bills.length === 1) {
                                      setDeleteId(group.bills[0].id);
                                    } else {
                                      const next = new Set(expandedShops);
                                      if (!next.has(group.shopId)) next.add(group.shopId);
                                      setExpandedShops(next);
                                    }
                                  }}
                                  className="w-7 h-7 rounded-md flex items-center justify-center cursor-pointer border-none bg-transparent text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"

                                  title="Delete"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {isExpanded && group.bills.map((bill) => (
                            <tr key={`bill-${bill.id}`} style={{ borderBottom: "1px solid var(--app-border)", background: "rgba(0,0,0,0.01)" }}>
                              <td className="px-5 py-2 text-[13px] pl-10" style={{ color: "var(--app-text-light)" }}>—</td>
                              <td className="px-5 py-2 text-[13px]" style={{ color: "var(--app-text-mid)" }}>{bill.creator.fullName}</td>
                              <td className="px-5 py-2 text-[13px]" style={{ color: "var(--app-text-mid)" }}>{bill.items.length} item(s)</td>
                              <td className="px-5 py-2" />
                              <td className="px-5 py-2 text-[13px] font-semibold" style={{ color: "var(--app-text-dark)" }}>₹{bill.totalAmount.toFixed(2)}</td>
                              <td className="px-5 py-2">
                                <div className="flex items-center justify-end gap-0.5">
                                  <button
                                    onClick={() => navigate(`/bills/${bill.id}`)}
                                    className="w-6 h-6 rounded-md flex items-center justify-center cursor-pointer border-none bg-transparent text-gray-400 hover:bg-indigo-50 hover:text-indigo-500 transition-colors"
  
                                  >
                                    <Eye className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => navigate(`/bills/${bill.id}/edit`)}
                                    className="w-6 h-6 rounded-md flex items-center justify-center cursor-pointer border-none bg-transparent text-gray-400 hover:bg-indigo-50 hover:text-indigo-500 transition-colors"
  
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => setPrintShopId(group.shopId)}
                                    className="w-6 h-6 rounded-md flex items-center justify-center cursor-pointer border-none bg-transparent text-gray-400 hover:bg-indigo-50 hover:text-indigo-500 transition-colors"
  
                                  >
                                    <Printer className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteId(bill.id)}
                                    className="w-6 h-6 rounded-md flex items-center justify-center cursor-pointer border-none bg-transparent text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
  
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </Fragment>
                      );
                    })
                  )
                ) : (
                  paginatedBills.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10">
                        <Receipt className="h-8 w-8 mx-auto mb-2 opacity-30" style={{ color: "var(--app-text-light)" }} />
                        <p className="text-[13px]" style={{ color: "var(--app-text-light)" }}>
                          {search ? "No bills found" : "No bills yet"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedBills.map((bill, index) => {
                      return (
                        <tr
                          key={bill.id}
                          style={{ borderBottom: "1px solid var(--app-border)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#F3F4F6")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                        >
                          <td className="px-5 py-3 text-[13px]" style={{ color: "var(--app-text-light)" }}>{index + 1}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: "#F4F4F7", color: "#6B7280" }}>
                                {bill.shop.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-[13px] font-medium" style={{ color: "var(--app-text-dark)" }}>{bill.shop.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-[13px]" style={{ color: "var(--app-text-dark)" }}>{new Date(bill.date).toLocaleDateString("en-IN")}</td>
                          <td className="px-5 py-3 text-[13px]" style={{ color: "var(--app-text-mid)" }}>{bill.items.length} item(s)</td>
                          <td className="px-5 py-3 text-[13px] font-semibold" style={{ color: "var(--app-text-dark)" }}>₹{bill.totalAmount.toFixed(2)}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center justify-end gap-0.5">
                              <button
                                onClick={() => navigate(`/bills/${bill.id}`)}
                                className="w-7 h-7 rounded-md flex items-center justify-center cursor-pointer border-none bg-transparent text-gray-400 hover:bg-indigo-50 hover:text-indigo-500 transition-colors"
                                style={{ background: "transparent", color: "#9CA3AF" }}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => navigate(`/bills/${bill.id}/edit`)}
                                className="w-7 h-7 rounded-md flex items-center justify-center cursor-pointer border-none bg-transparent text-gray-400 hover:bg-indigo-50 hover:text-indigo-500 transition-colors"
                                style={{ background: "transparent", color: "#9CA3AF" }}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteId(bill.id)}
                                className="w-7 h-7 rounded-md flex items-center justify-center cursor-pointer border-none bg-transparent text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                style={{ background: "transparent", color: "#9CA3AF" }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Pagination */}
          {((isOwner && filteredGroups.length > 0) || (!isOwner && filteredBills.length > 0)) && (
            <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid var(--app-border)" }}>
              <p className="text-[12px]" style={{ color: "var(--app-text-light)" }}>
                Showing {startEntry} to {endEntry} of {totalEntries} entries
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ border: "1px solid var(--app-border)", background: "var(--app-card)", color: "var(--app-text-mid)" }}
                >
                  <ChevronLeft className="h-[15px] w-[15px]" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center cursor-pointer text-[13px] font-bold"
                    style={{
                      border: `1px solid ${page === currentPage ? "var(--app-indigo)" : "var(--app-border)"}`,
                      background: page === currentPage ? "var(--app-indigo)" : "var(--app-card)",
                      color: page === currentPage ? "#fff" : "var(--app-text-mid)",
                    }}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ border: "1px solid var(--app-border)", background: "var(--app-card)", color: "var(--app-text-mid)" }}
                >
                  <ChevronRight className="h-[15px] w-[15px]" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-2" style={{ color: "var(--app-text-dark)" }}>Delete Bill?</h3>
            <p className="text-sm mb-6" style={{ color: "var(--app-text-mid)" }}>
              This will also restore stock quantities. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
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
