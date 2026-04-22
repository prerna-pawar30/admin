/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { InvoiceService } from "../../backend/ApiService"; 
import { Edit, Trash2, Eye, Loader2, Plus, FileText } from "lucide-react";
import UpdateInvoiceModal from "./UpdateInvoiceModal.jsx";
import logoMain from "../../assets/home/digident-png .png";
import logoWatermark from "../../assets/home/digident-png 2.png";
import { useNavigate } from "react-router-dom";
import Pagination from "../ui/Pagination.jsx";
import bankQR from "../../assets/home/QR.png";
const InvoiceListPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // You can change this number

  const navigate = useNavigate();
  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const data = await InvoiceService.getAllInvoices();
      setInvoices(data);
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  };
// --- PAGINATION LOGIC ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = invoices.slice(indexOfFirstItem, indexOfLastItem);

  // Reset to page 1 if search/filter logic is ever added
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Optional: scroll to top on page change
  };
  const handleEditClick = (invoice) => {
    setSelectedInvoice(invoice);
    setUpdateModalOpen(true);
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
      doc.text(`${order.seller?.address || ""}`, 14, PH - 20);
      doc.setTextColor(...WHITE);
      doc.text(`Email: ${order.seller?.email || "info@digident.in"} | Contact: ${order.seller?.contactNumber || ""}`, 14, PH - 6);
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
      head: [["ART. NO", "DESCRIPTION", "QTY", "PRICE", "DISC (%)", "NET", "GST"]],
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
  doc.addImage(bankQR, "PNG", 14, finalY, qrSize, qrSize);
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
        <p className="text-gray-500 font-medium">Loading Invoices...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Invoice Management</h1>
            <p className="text-gray-500 text-sm">View and manage your recent billing records</p>
          </div>
          <button 
            onClick={() => navigate("/sales/create-invoice")} 
            className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-lg hover:bg-orange-600 transition-all font-semibold shadow-md active:scale-95"
          >
            <Plus size={18} /> Create New Invoice
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-bold text-gray-600 uppercase text-xs">Invoice No.</th>
                <th className="p-4 font-bold text-gray-600 uppercase text-xs">Customer</th>
                <th className="p-4 font-bold text-gray-600 uppercase text-xs">Date</th>
                <th className="p-4 font-bold text-gray-600 uppercase text-xs">Amount</th>
                <th className="p-4 font-bold text-gray-600 uppercase text-xs text-center">Status</th>
                <th className="p-4 font-bold text-gray-600 uppercase text-xs text-right pr-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.length > 0 ? (
                invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="p-4"><span className="font-bold text-orange-600">{inv.invoiceNumber}</span></td>
                    <td className="p-4">
                      <div className="font-medium text-gray-700">{inv.billTo?.companyName}</div>
                      <div className="text-xs text-gray-400">{inv.billTo?.contactPerson}</div>
                    </td>
                    <td className="p-4 text-gray-600">{new Date(inv.invoiceDate).toLocaleDateString('en-IN')}</td>
                    <td className="p-4 font-semibold text-gray-800">₹{inv.summary?.totalPayAmount?.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest ${inv.status === 'issued' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2 pr-6">
                        <button 
                          onClick={() => handleDownloadClick(inv.invoiceId || inv._id)} 
                          title="Download PDF" 
                          className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition-all"
                        >
                          <FileText size={18} />
                        </button>
                        <button onClick={() => handleEditClick(inv)} title="Edit" className="text-orange-500 hover:bg-orange-100 p-2 rounded-full transition-all">
                          <Edit size={18} />
                        </button>
                        
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="p-10 text-center text-gray-400 italic">No invoices found.</td></tr>
              )}
            </tbody>
          </table>

          <Pagination 
            totalItems={invoices.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            setCurrentPage={handlePageChange}
          />
        </div>
      </div>

      {isUpdateModalOpen && (
        <UpdateInvoiceModal 
          invoice={selectedInvoice} 
          onClose={() => setUpdateModalOpen(false)} 
          onRefresh={fetchInvoices}
        />
      )}
    </div>
  );
};

export default InvoiceListPage;