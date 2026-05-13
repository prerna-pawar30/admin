/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useMemo } from "react";
import { InvoiceService } from "../../backend/ApiService";
import { Edit, Trash2, FileText, Search, User, ChevronRight, ChevronDown, Plus, Loader2 } from "lucide-react";
import UpdateInvoiceModal from "./UpdateInvoiceModal.jsx";
import logoMain from "../../assets/home/digident-png .png";
import logoWatermark from "../../assets/home/digident-png 2.png";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Pagination from "../ui/Pagination.jsx";
import bankQR from "../../assets/home/QR.png";

const InvoiceListPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedUser, setExpandedUser] = useState(null);

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // ── Pagination state (server-driven) ──────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 12; // matches your API default

  const navigate = useNavigate();

  const handleCreateInvoice = (user) => {
    const customerData = {
      companyName: user.customerName,
      contactPerson: user.contactPerson,
      contactNumber: user.contactNumber,
      address: user.allInvoices[0]?.billTo?.address || "",
      gstin: user.allInvoices[0]?.billTo?.gstin || "",
    };
    navigate("/sales/create-invoice", { state: { customerData } });
  };

  // ── Fetch invoices for a given page ───────────────────────────────────────
  const fetchInvoices = async (page = 1) => {
    setLoading(true);
    try {
      // Pass page & limit as query params so the API returns only that slice.
      // Update ApiService.getAllInvoices to accept (page, limit) and append
      // ?page=<page>&limit=<limit> to the request URL.
      const res = await InvoiceService.getAllInvoices(page, ITEMS_PER_PAGE);

      // Support two response shapes:
      //   shape A: { invoices: [...], pagination: { totalPages, totalItems, currentPage } }
      //   shape B (legacy flat array): [...]
      if (res && res.invoices) {
        setInvoices(res.invoices);
        setTotalPages(res.pagination?.totalPages ?? 1);
        setTotalItems(res.pagination?.totalItems ?? res.invoices.length);
        setCurrentPage(res.pagination?.currentPage ?? page);
      } else if (Array.isArray(res)) {
        // Fallback – API still returns a flat array (no server pagination)
        setInvoices(res);
        setTotalPages(1);
        setTotalItems(res.length);
      }
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const customerData = await InvoiceService.getCustomers();
      setCustomers(customerData);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Re-fetch whenever the page changes
  useEffect(() => {
    fetchInvoices(currentPage);
    // Collapse any expanded user row on page change for a clean UX
    setExpandedUser(null);
  }, [currentPage]);

  // ── Reset to page 1 when search term changes ──────────────────────────────
  // (search is client-side within the current page; remove this block if you
  //  want full server-side search instead)
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  /* ================= GROUPING & SEARCH LOGIC ================= */
  const groupedUsers = useMemo(() => {
    const filtered = invoices.filter(
      (inv) =>
        inv.billTo?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.billTo?.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groups = filtered.reduce((acc, inv) => {
      const key = inv.billTo?.companyName || "Unknown Customer";
      if (!acc[key]) {
        acc[key] = {
          customerName: key,
          contactPerson: inv.billTo?.contactPerson,
          contactNumber: inv.billTo?.contactNumber,
          invoiceCount: 0,
          totalAmount: 0,
          allInvoices: [],
        };
      }
      acc[key].allInvoices.push(inv);
      acc[key].invoiceCount += 1;
      acc[key].totalAmount += inv.summary?.totalPayAmount || 0;
      return acc;
    }, {});

    return Object.values(groups);
  }, [invoices, searchTerm]);

  const handleEditClick = (invoice) => {
    setSelectedInvoice(invoice);
    setUpdateModalOpen(true);
  };

  const toggleUser = (userName) => {
    setExpandedUser(expandedUser === userName ? null : userName);
  };

  /* ================= PDF GENERATOR LOGIC ================= */
  const handleDownloadClick = async (invoiceId) => {
    try {
      setIsDownloading(true);

      const response = await InvoiceService.getInvoiceById(invoiceId);
      const order = response.data || response;

      if (!order || !order.items) {
        alert("Invoice data not found or incomplete");
        return;
      }

      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF({ unit: "mm", format: "a4" });

      const ORANGE = [230, 135, 54];
      const BLACK = [0, 0, 0];
      const WHITE = [255, 255, 255];
      const PW = doc.internal.pageSize.width;
      const PH = doc.internal.pageSize.height;
      const LH = 6;

      const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "-");

      const drawWatermark = () => {
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.08 }));
        try {
          doc.addImage(logoWatermark, "PNG", 20, 60, 170, 140, undefined, "FAST");
        } catch (e) {
          console.warn("Watermark failed");
        }
        doc.restoreGraphicsState();
      };

      const drawHeader = () => {
        drawWatermark();
        doc.setFillColor(...ORANGE);
        doc.rect(0, 4, 45, 4, "F");
        doc.rect(0, 10, 34, 4, "F");
        doc.setFillColor(...BLACK);
        doc.rect(108, 0, PW - 108, 14, "F");
        doc.triangle(108, 0, 108, 14, 93, 0, "F");
        doc.setFont("helvetica", "bold").setFontSize(30).setTextColor(0);
        doc.text("INVOICE", 14, 32);
        try {
          doc.addImage(logoMain, "PNG", 148, 16, 47, 18);
        } catch (e) {
          doc.setFontSize(15).setTextColor(...ORANGE);
          doc.text("Digident", 162, 9);
        }
      };

      const drawFooter = () => {
        doc.setFillColor(...BLACK);
        doc.rect(0, PH - 13, 100, 13, "F");
        doc.triangle(100, PH - 13, 100, PH, 116, PH, "F");
        doc.setFillColor(...ORANGE);
        doc.rect(158, PH - 7, PW - 158, 7, "F");
        doc.triangle(158, PH - 7, 158, PH, 143, PH, "F");
        doc.setFont("helvetica", "bold").setFontSize(11.5).setTextColor(...BLACK);
        doc.text("DIGIDENT INDIA PRIVATE LIMITED.", 14, PH - 26);
        doc.setFont("helvetica", "normal").setFontSize(10);
        const footerAddr = order.seller?.address || "";
        const footerAddrLines = doc.splitTextToSize(footerAddr, 180);
        doc.text(footerAddrLines, 14, PH - 21);
        doc.setTextColor(...WHITE);
        doc.text(
          `Email: ${order.seller?.email || "info@digident.in"} | Contact: ${order.seller?.contactNumber || ""}`,
          14,
          PH - 6
        );
      };

      drawHeader();

      doc.setFontSize(11).setFont("helvetica", "normal").setTextColor(0);
      doc.text(`Invoice Number: ${order.invoiceNumber}`, 14, 45);
      doc.text(`Invoice Date: ${fmtDate(order.invoiceDate)}`, 14, 51);
      doc.setFont("helvetica", "bold");
      doc.text(`Due Date: ${fmtDate(order.dueDate)}`, 14, 57);

      const rightColX = 120;
      let rightY = 75;

      doc.setFont("helvetica", "bold").setFontSize(11);
      doc.text("BILL TO", rightColX, rightY);
      doc.setFont("helvetica", "normal").setFontSize(10);
      rightY += LH;
      doc.text(order.billTo?.contactPerson || "N/A", rightColX, rightY);
      rightY += LH;
      doc.text(order.billTo?.contactNumber || "N/A", rightColX, rightY);
      rightY += LH;
      doc.setFont("helvetica", "bold");
      doc.text(order.billTo?.companyName || "N/A", rightColX, rightY);
      rightY += 5;
      doc.setFont("helvetica", "normal");
      const addrLines = doc.splitTextToSize(order.billTo?.address || "", 75);
      doc.text(addrLines, rightColX, rightY);
      rightY += addrLines.length * LH;
      doc.setFont("helvetica", "bold");
      doc.text(`GSTIN: ${order.billTo?.gstin || "N/A"}`, rightColX, rightY);
      rightY += 10;
      doc.setFont("helvetica", "normal").setFontSize(10);
      doc.text(`Terms of Delivery : ${order.termsOfDelivery || "-"}`, rightColX, rightY);
      rightY += LH;
      doc.text(`Shipping Condition : ${order.shippingCondition || "-"}`, rightColX, rightY);
      rightY += LH;
      doc.text(`Order Date : ${fmtDate(order.orderDate)}`, rightColX, rightY);

      let leftY = 75;
      doc.setFont("helvetica", "bold").setFontSize(11);
      doc.text(`CUSTOMER NO : ${order.customerNo || "-"}`, 14, leftY);
      leftY += LH;
      doc.setFont("helvetica", "normal");
      doc.text(`Payment Terms : ${order.paymentTerms || "-"}`, 14, leftY);
      leftY += LH;
      doc.setFont("helvetica", "bold");
      doc.text(`Our GSTIN : ${order.seller?.gstin || "23AAKCD9669F1ZA"}`, 14, leftY);
      leftY += LH + 5;
      doc.setFont("helvetica", "normal");
      doc.text(`Order Number : ${order.orderNumber || "-"}`, 14, leftY);
      leftY += LH;
      doc.text(`Customer Service Rep : ${order.customerServiceRep || "-"}`, 14, leftY);

      const tableRows = order.items.map((item) => [
        item.articleNo || "-",
        item.description,
        item.qty,
        item.price.toFixed(2),
        `${item.discountPercent}%\n(${item.discountValue.toFixed(2)})`,
        item.gstAmount.toFixed(2),
        item.totalNet.toFixed(2),
        `${item.gstType} ${item.gstPercent}%`,
      ]);

      autoTable(doc, {
        startY: 155,
        head: [["ART. NO", "DESCRIPTION", "QTY", "PRICE", "DISC (%)", "GST AMT", "NET", "GST %"]],
        body: tableRows,
        theme: "plain",
        headStyles: { fillColor: ORANGE, textColor: WHITE, halign: "center" },
        bodyStyles: { fontSize: 8.5, halign: "center", cellPadding: 3 },
        didDrawCell: (data) => {
          if (data.section === "body") {
            doc.setDrawColor(...ORANGE);
            doc.setLineWidth(0.1);
            doc.line(
              data.cell.x,
              data.cell.y + data.cell.height,
              data.cell.x + data.cell.width,
              data.cell.y + data.cell.height
            );
          }
        },
        margin: { left: 14, right: 14 },
      });

      drawFooter();

      doc.addPage();
      drawHeader();

      doc.setFont("helvetica", "bold").setFontSize(18).setTextColor(...ORANGE);
      doc.text("SUMMARY & TAX DETAILS", 14, 50);

      const s = order.summary;
      autoTable(doc, {
        startY: 60,
        head: [["DESCRIPTION", "GOODS", "FREIGHT", "TOTAL"]],
        body: [
          ["Net Value", s.totalNet.toFixed(2), s.freightCost.toFixed(2), (s.totalNet + s.freightCost).toFixed(2)],
          ["Total Tax", s.totalTax.toFixed(2), "0.00", s.totalTax.toFixed(2)],
          ["Grand Total", s.totalPayAmount.toFixed(2), s.freightCost.toFixed(2), s.totalPayAmount.toFixed(2)],
        ],
        theme: "grid",
        headStyles: { fillColor: ORANGE },
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        margin: { left: 110 },
        body: [
          ["Total Payable", `INR ${s.totalPayAmount.toLocaleString("en-IN")}`],
          ["Paid Amount", `INR ${s.paidAmount.toLocaleString("en-IN")}`],
          ["Balance Due", `INR ${s.amountToPay.toLocaleString("en-IN")}`],
        ],
        theme: "grid",
        columnStyles: { 0: { fontStyle: "bold" } },
      });

      const finalY = doc.lastAutoTable.finalY + 100;
      const qrSize = 35;
      try {
        doc.addImage(bankQR, "PNG", 14, finalY, qrSize, qrSize);
      } catch (e) {
        console.warn("Bank QR failed to load", e);
      }

      const textX = 14 + qrSize + 10;
      let textY = finalY + 5;
      doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(0);
      doc.text("Bank Details", textX, textY);
      doc.setFont("helvetica", "normal").setFontSize(10);
      textY += 7;
      doc.text(`Account No : ${order.bankDetails?.accountNo || ""}`, textX, textY);
      textY += 6;
      doc.text(`Account Type : ${order.bankDetails?.accountType || ""}`, textX, textY);
      textY += 6;
      doc.text(`IFSC Code : ${order.bankDetails?.ifscCode || ""}`, textX, textY);
      textY += 6;
      doc.text(`Holder Name : ${order.bankDetails?.holderName || ""}`, textX, textY);

      drawFooter();
      doc.save(`Digident_Invoice_${order.invoiceNumber}.pdf`);
    } catch (error) {
      console.error("PDF Error:", error);
      alert("Failed to generate PDF. Check console for details.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-orange-500 mb-2" size={40} />
        <p className="text-gray-500 font-medium">Loading Database...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto">

        {/* TOP SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Customer Invoices</h1>
            <p className="text-gray-500 text-sm">
              Manage billing records grouped by customer
              {totalItems > 0 && (
                <span className="ml-2 text-orange-500 font-semibold">
                  ({totalItems} total invoices)
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => navigate("/sales/create-invoice")}
            className="flex items-center gap-2 bg-orange-500 text-white px-6 py-2.5 rounded-xl hover:bg-orange-600 transition-all font-semibold shadow-lg active:scale-95"
          >
            <Plus size={20} /> Create New Invoice
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by Customer Name or Company..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* GROUPED LIST */}
        <div className="space-y-4">
          {groupedUsers.length > 0 ? (
            groupedUsers.map((user) => (
              <div
                key={user.customerName}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* User Header Row */}
                <div
                  onClick={() => toggleUser(user.customerName)}
                  className="p-4 md:p-5 flex items-center justify-between cursor-pointer hover:bg-orange-50/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 md:text-lg">{user.customerName}</h3>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                        {user.contactPerson} • {user.invoiceCount}{" "}
                        {user.invoiceCount === 1 ? "Invoice" : "Invoices"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="hidden md:block text-right">
                      <p className="text-xs text-gray-400">Total Billing</p>
                      <p className="font-bold text-gray-800">
                        ₹{user.totalAmount.toLocaleString("en-IN")}
                      </p>
                    </div>
                    {expandedUser === user.customerName ? (
                      <ChevronDown className="text-gray-400" />
                    ) : (
                      <ChevronRight className="text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Invoice List */}
                {expandedUser === user.customerName && (
                  <div className="border-t border-gray-50 bg-gray-50/30 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] uppercase text-gray-500 font-bold">
                          <tr>
                            <th className="p-3">Inv No.</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Amount</th>
                            <th className="p-3 text-center">Status</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {user.allInvoices.map((inv) => (
                            <tr key={inv._id} className="hover:bg-gray-50 transition-colors">
                              <td className="p-3 font-bold text-orange-600 text-sm">
                                {inv.invoiceNumber}
                              </td>
                              <td className="p-3 text-xs text-gray-600">
                                {new Date(inv.invoiceDate).toLocaleDateString("en-IN")}
                              </td>
                              <td className="p-3 font-semibold text-gray-800 text-sm">
                                ₹{inv.summary?.totalPayAmount?.toLocaleString("en-IN")}
                              </td>
                              <td className="p-3 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-black ${
                                    inv.status === "issued"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-amber-100 text-amber-700"
                                  }`}
                                >
                                  {inv.status}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => handleDownloadClick(inv.invoiceId || inv._id)}
                                    className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg transition-all"
                                    title="Download PDF"
                                  >
                                    <FileText size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleEditClick(inv)}
                                    className="text-orange-500 hover:bg-orange-50 p-1.5 rounded-lg transition-all"
                                    title="Edit"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleCreateInvoice(user)}
                                    className="text-green-500 hover:bg-green-50 p-1.5 rounded-lg transition-all"
                                    title="Create New Invoice"
                                  >
                                    <PlusCircle size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white p-20 text-center rounded-3xl border border-dashed border-gray-200">
              <Search className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-400 font-medium">No customers found matching your search.</p>
            </div>
          )}
        </div>

{/* ── PAGINATION ─────────────────────────────────────────────────────── */}
{totalPages > 1 && (
  <div className="mt-8 flex flex-col items-center gap-4">
    <div className="flex items-center gap-4">
      {/* Previous Button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all shadow-sm
          ${currentPage === 1 
            ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
            : "bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 border border-gray-200"
          }`}
      >
        <ChevronRight className="rotate-180" size={18} />
        Previous
      </button>

      {/* Your existing Numeric Pagination Component */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Next Button */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all shadow-sm
          ${currentPage === totalPages 
            ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
            : "bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 border border-gray-200"
          }`}
      >
        Next
        <ChevronRight size={18} />
      </button>
    </div>

    {/* Page info text */}
    {totalItems > 0 && (
      <p className="text-center text-xs text-gray-400">
        Showing Page <span className="font-semibold text-gray-600">{currentPage}</span> of <span className="font-semibold text-gray-600">{totalPages}</span> 
        &nbsp;•&nbsp; {totalItems} total invoices
      </p>
    )}
  </div>
)}
      </div>

      {isUpdateModalOpen && (
        <UpdateInvoiceModal
          invoice={selectedInvoice}
          onClose={() => setUpdateModalOpen(false)}
          onRefresh={() => fetchInvoices(currentPage)}
        />
      )}
    </div>
  );
};

export default InvoiceListPage;