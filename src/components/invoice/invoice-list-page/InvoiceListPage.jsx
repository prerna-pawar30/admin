/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useMemo } from "react";
import { InvoiceService } from "../../../backend/ApiService.js"; 
import { Plus, Loader2, Search as SearchIcon, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import UpdateInvoiceModal from "../UpdateInvoiceModal.jsx";
import logoMain from "../../../assets/home/digident-png .png";
import logoWatermark from "../../../assets/home/digident-png 2.png";
import bankQR from "../../../assets/home/QR.png";

// New Components
import InvoiceSearch from "./InvoiceSearch";
import CustomerGroupItem from "./CustomerGroupItem";
import Pagination from "../../ui/Pagination.jsx"; // Ensure this path is correct

const InvoiceListPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedUser, setExpandedUser] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // ── Pagination state ──
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 12;

  const navigate = useNavigate();

  // Fetch data when page changes
  useEffect(() => {
    fetchAllData(currentPage);
    setExpandedUser(null); // Reset accordion on page change
  }, [currentPage]);

  // Reset to page 1 when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchAllData = async (page = 1) => {
    setLoading(true);
    try {
      const [invoiceRes, customerData] = await Promise.all([
        InvoiceService.getAllInvoices(page, ITEMS_PER_PAGE),
        InvoiceService.getCustomers()
      ]);

      // Handle Paginated Response
      if (invoiceRes && invoiceRes.invoices) {
        setInvoices(invoiceRes.invoices);
        setTotalPages(invoiceRes.pagination?.totalPages ?? 1);
        setTotalItems(invoiceRes.pagination?.totalItems ?? invoiceRes.invoices.length);
      } else if (Array.isArray(invoiceRes)) {
        setInvoices(invoiceRes);
        setTotalPages(1);
        setTotalItems(invoiceRes.length);
      }

      setCustomers(customerData);
    } catch (error) {
      console.error("Failed to fetch initial page data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const groupedUsers = useMemo(() => {
    const filtered = invoices.filter(inv => 
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
          allInvoices: []
        };
      }
      acc[key].allInvoices.push(inv);
      acc[key].invoiceCount += 1;
      acc[key].totalAmount += (inv.summary?.totalPayAmount || 0);
      return acc;
    }, {});

    return Object.values(groups);
  }, [invoices, searchTerm]);

  const handleCreateInvoice = async (user) => {
    try {
      setLoading(true);

      // customerNo from latest invoice
      const customerId = user.allInvoices?.[0]?.customerNo;

      // Fetch all customer invoices
      const customerInvoices =
        await InvoiceService.getCustomerInvoicesById(customerId);

      // Latest invoice
      const latestInvoice = customerInvoices?.[0] || null;

      const customerData = {
        companyName: user.customerName,
        contactPerson: user.contactPerson,
        contactNumber: user.contactNumber,
        address: latestInvoice?.billTo?.address || "",
        gstin: latestInvoice?.billTo?.gstin || "",

        // pass previous invoices also
        invoices: customerInvoices,

        // latest invoice data
        latestInvoice,
      };

      navigate("/sales/create-invoice", {
        state: { customerData },
      });

    } catch (error) {
      console.error("Create Invoice Navigation Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (invoice) => {
    setSelectedInvoice(invoice);
    setUpdateModalOpen(true);
  };

  const toggleUser = (userName) => {
    setExpandedUser(expandedUser === userName ? null : userName);
  };

const handleDownloadCustomerReport = async (user) => {
  try {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const ORANGE = [230, 135, 54];
    
    // Header
    doc.setFillColor(...ORANGE);
    doc.rect(0, 0, 210, 40, "F");
    doc.setFont("helvetica", "bold").setFontSize(22).setTextColor(255);
    doc.text("CUSTOMER STATEMENT", 14, 25);
    
    // Customer Info
    doc.setFontSize(12).setTextColor(0);
    doc.text("BILL TO:", 14, 50);
    doc.setFont("helvetica", "normal");
    doc.text(`${user.customerName}`, 14, 57);
    doc.text(`Contact: ${user.contactPerson} (${user.contactNumber})`, 14, 63);
    
    // Summary Stats
    const totalRemaining = user.allInvoices.reduce((sum, inv) => sum + (inv.summary?.amountToPay || 0), 0);
    
    autoTable(doc, {
      startY: 75,
      head: [["Total Invoices", "Total Billing", "Remaining Balance"]],
      body: [[
        user.invoiceCount, 
        `INR ${user.totalAmount.toLocaleString('en-IN')}`, 
        `INR ${totalRemaining.toLocaleString('en-IN')}`
      ]],
      theme: "grid",
      headStyles: { fillColor: [40, 40, 40] }
    });

    // Detailed Invoices Table
    const tableRows = user.allInvoices.map((inv) => [
      inv.invoiceNumber,
      new Date(inv.invoiceDate).toLocaleDateString('en-IN'),
      inv.summary?.totalPayAmount.toFixed(2),
      inv.summary?.paidAmount.toFixed(2),
      inv.summary?.amountToPay.toFixed(2),
      inv.status.toUpperCase()
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Inv No.", "Date", "Total Amount", "Paid", "Balance", "Status"]],
      body: tableRows,
      theme: "striped",
      headStyles: { fillColor: ORANGE },
      columnStyles: {
        4: { fontStyle: 'bold' } // Balance column bold
      }
    });

    doc.save(`Statement_${user.customerName.replace(/\s+/g, '_')}.pdf`);
  } catch (error) {
    console.error("Report Error:", error);
    alert("Failed to generate report");
  }
};

 /* ================= PDF GENERATOR LOGIC ================= */
 const handleDownloadClick = async (invoiceId) => {
   try {
     setIsDownloading(true);
     
     // 1. Fetch data - using _id ensures we get the specific record
     const response = await InvoiceService.getInvoiceById(invoiceId);
     const order = response.data || response; 
 
     if (!order || !order.items) {
       alert("Invoice data not found or incomplete");
       return;
     }
 
     const { default: jsPDF } = await import("jspdf");
     const { default: autoTable } = await import("jspdf-autotable");
 
     const doc = new jsPDF({ unit: "mm", format: "a4" });
 
     // Constants
     const ORANGE = [230, 135, 54];
     const BLACK = [0, 0, 0];
     const WHITE = [255, 255, 255];
     const PW = doc.internal.pageSize.width;
     const PH = doc.internal.pageSize.height;
     const LH = 6; // Global Line Height for consistent spacing
 
     const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "-";
 
     const drawWatermark = () => {
       doc.saveGraphicsState();
       doc.setGState(new doc.GState({ opacity: 0.03 })); 
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
         doc.addImage(logoMain, "PNG", 148, 16, 47, 18, 'main_logo');
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
   
   /* --- FIX: Split Address into multiple lines --- */
   const footerAddr = order.seller?.address || "";
   // 180 is the max width in mm before it wraps
   const footerAddrLines = doc.splitTextToSize(footerAddr, 180); 
   
   // Use text() with the array; jsPDF will render each item on a new line
   doc.text(footerAddrLines, 14, PH - 21); 
   /* ---------------------------------------------- */
 
   doc.setTextColor(...WHITE);
   doc.text(
     `Email: ${order.seller?.email || "info@digident.in"} | Contact: ${order.seller?.contactNumber || ""}`, 
     14, 
     PH - 6
   );
 };
 
     // --- PAGE 1 ---
     drawHeader();
 
     // 1. Meta Info
     doc.setFontSize(11).setFont("helvetica", "normal").setTextColor(0);
     doc.text(`Invoice Number: ${order.invoiceNumber}`, 14, 45);
     doc.text(`Invoice Date: ${fmtDate(order.invoiceDate)}`, 14, 51);
     doc.setFont("helvetica", "bold");
     doc.text(`Due Date: ${fmtDate(order.dueDate)}`, 14, 57);
 
     // 2. Billing & Shipping Section
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
     
     rightY += 5; // Extra gap before address
     doc.setFont("helvetica", "normal");
     const addrLines = doc.splitTextToSize(order.billTo?.address || "", 75);
     doc.text(addrLines, rightColX, rightY);
     
     // Dynamically update Y based on address length
     rightY += (addrLines.length * LH);
     doc.setFont("helvetica", "bold");
     doc.text(`GSTIN: ${order.billTo?.gstin || "N/A"}`, rightColX, rightY);
 
     // Shipping info below GSTIN
     rightY += 10;
     doc.setFont("helvetica", "normal").setFontSize(10);
     doc.text(`Terms of Delivery : ${order.termsOfDelivery || "-"}`, rightColX, rightY);
     rightY += LH;
     doc.text(`Shipping Condition : ${order.shippingCondition || "-"}`, rightColX, rightY);
     rightY += LH;
     doc.text(`Order Date : ${fmtDate(order.orderDate)}`, rightColX, rightY);
 
     // Left Column Info (Customer Info)
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
 
     // 4. Line Items Table
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
       head: [["ART. NO", "DESCRIPTION", "QTY", "PRICE", "DISC (%)",  "GST AMT", "NET", "GST %"]],
       body: tableRows,
       theme: "plain",
       headStyles: { fillColor: ORANGE, textColor: WHITE, halign: 'center' },
       bodyStyles: { fontSize: 8.5, halign: 'center', cellPadding: 3 },
       didDrawCell: (data) => {
         if (data.section === 'body') {
           doc.setDrawColor(...ORANGE);
           doc.setLineWidth(0.1);
           doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
         }
       },
       margin: { left: 14, right: 14 }
     });
 
     drawFooter();
 
     // --- PAGE 2 ---
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
       headStyles: { fillColor: ORANGE }
     });
 
     autoTable(doc, {
       startY: doc.lastAutoTable.finalY + 10,
       margin: { left: 110 },
       body: [
         ["Total Payable", `INR ${s.totalPayAmount.toLocaleString('en-IN')}`],
         ["Paid Amount", `INR ${s.paidAmount.toLocaleString('en-IN')}`],
         ["Balance Due", `INR ${s.amountToPay.toLocaleString('en-IN')}`],
       ],
       theme: "grid",
       columnStyles: { 0: { fontStyle: 'bold' } }
     });
 
 /* ================= BANK DETAILS WITH QR CODE ================= */
 const finalY = doc.lastAutoTable.finalY + 100; // Adjusted spacing
 const qrSize = 35; // Size of the QR code in mm
 
 // 1. Add the QR Code (Left side)
 try {
   // Parameters: image, format, x, y, width, height
   doc.addImage(bankQR, "PNG", 14, finalY, qrSize, qrSize, undefined, 'NONE');
 } catch (e) {
   console.warn("Bank QR failed to load", e);
 }
 
 // 2. Add Bank Details Text (Right side of the QR)
 const textX = 14 + qrSize + 10; // 14 (margin) + 35 (QR width) + 10 (gap)
 let textY = finalY + 5; // Align text vertically with the top of the QR
 
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Customer Invoices</h1>
            <p className="text-gray-500 text-sm">
              Manage billing records 
              {totalItems > 0 && <span className="ml-2 text-orange-500 font-semibold">({totalItems} total)</span>}
            </p>
          </div>
          <button 
            onClick={() => navigate("/sales/create-invoice")} 
            className="flex items-center gap-2 bg-orange-500 text-white px-6 py-2.5 rounded-xl hover:bg-orange-600 transition-all font-semibold shadow-lg active:scale-95"
          >
            <Plus size={20} /> Create New Invoice
          </button>
        </div>

        <InvoiceSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <div className="space-y-4">
          {groupedUsers.length > 0 ? (
            groupedUsers.map((user) => (
              <CustomerGroupItem
                key={user.customerName}
                user={user}
                expandedUser={expandedUser}
                toggleUser={toggleUser}
                handleDownloadClick={handleDownloadClick}
                handleEditClick={handleEditClick}
                handleCreateInvoice={handleCreateInvoice}
                handleDownloadCustomerReport={handleDownloadCustomerReport}
              />
            ))
          ) : customers.length > 0 ? (
            customers.map((customer) => (
              <CustomerGroupItem
                key={customer.customerNo}
                user={{
                  customerName: customer.companyName,
                  contactPerson: customer.contactPerson,
                  contactNumber: customer.contactNumber,
                  invoiceCount: 0,
                  totalAmount: 0,
                  allInvoices: []
                }}
                expandedUser={expandedUser}
                toggleUser={toggleUser}
                handleDownloadClick={handleDownloadClick}
                handleEditClick={handleEditClick}
                handleCreateInvoice={handleCreateInvoice}
                handleDownloadCustomerReport={handleDownloadCustomerReport}
              />
            ))
          ) : (
            <div className="bg-white p-20 text-center rounded-3xl border border-dashed border-gray-200">
              <SearchIcon className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-400 font-medium">No customers found matching your search.</p>
            </div>
          )}
        </div>

        {/* ── PAGINATION ── */}
        {totalPages > 1 && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex items-center gap-4">
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

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />

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
            <p className="text-xs text-gray-400">
              Page <span className="font-semibold text-gray-600">{currentPage}</span> of {totalPages}
            </p>
          </div>
        )}
      </div>

      {isUpdateModalOpen && (
        <UpdateInvoiceModal 
          invoice={selectedInvoice} 
          onClose={() => setUpdateModalOpen(false)} 
          onRefresh={() => fetchAllData(currentPage)}
        />
      )}
    </div>
  );
};

export default InvoiceListPage;