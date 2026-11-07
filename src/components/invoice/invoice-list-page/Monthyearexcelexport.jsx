/* eslint-disable no-empty */
import React, { useState } from "react";
import { FileText } from "lucide-react";
import { Dialog, DialogBody, DialogButton, DialogFooter, DialogHeader } from "../../ui/Dialog";
import logoMain from "../../../assets/home/digident-png .png";
import logoWatermark from "../../../assets/home/digident-png 2.png";

// ─── Constants ────────────────────────────────────────────────────────────────
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Same colours as the customer statement
const ORA   = [230, 135, 54];
const ORA_D = [212, 112, 42];
const BLK   = [0, 0, 0];
const WHT   = [255, 255, 255];
const GRY   = [243, 243, 243];
const RED   = [210, 59, 59];
const GREEN = [22, 163, 74];
const AMBER = [202, 138, 4];
const MUTED = [136, 136, 136];
const TEXT  = [25, 25, 25];

// GST state codes (first 2 digits of a GSTIN)
const STATES = {
  "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab", "04": "Chandigarh",
  "05": "Uttarakhand", "06": "Haryana", "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
  "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh", "13": "Nagaland", "14": "Manipur",
  "15": "Mizoram", "16": "Tripura", "17": "Meghalaya", "18": "Assam", "19": "West Bengal",
  "20": "Jharkhand", "21": "Odisha", "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
  "26": "Dadra & Nagar Haveli and Daman & Diu", "27": "Maharashtra", "29": "Karnataka", "30": "Goa",
  "31": "Lakshadweep", "32": "Kerala", "33": "Tamil Nadu", "34": "Puducherry",
  "35": "Andaman & Nicobar", "36": "Telangana", "37": "Andhra Pradesh", "38": "Ladakh",
  "97": "Other Territory",
};
const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d) => {
  if (!d) return "-";
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, "0")}-${MONTH_SHORT[dt.getMonth()]}-${dt.getFullYear()}`;
};
const lastDayOf = (m, y) => new Date(y, m, 0).getDate();
const sum = (arr, fn) => arr.reduce((s, x) => s + (Number(fn(x)) || 0), 0);
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

// 4,88,217.50
const num = (n) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// INR 4,88,217.50  |  INR 60,800
const inr = (n) => {
  const v = r2(n);
  return `INR ${Number.isInteger(v) ? v.toLocaleString("en-IN") : num(v)}`;
};

const getCity = (inv) =>
  inv.billTo?.city || inv.billTo?.address?.split("\n")[0]?.split(",").pop()?.trim() || "";
const invNo = (inv) => (inv.invoiceNumber ? `#${String(inv.invoiceNumber).replace(/^#+/, "")}` : "-");
const isCancelled = (inv) => String(inv.status || "").toLowerCase() === "cancelled";

// "IGST" | "CGST+SGST"
const taxType = (t) => {
  const s = String(t || "").toUpperCase();
  if (s.includes("IGST")) return "IGST";
  if (s.includes("CGST") || s.includes("SGST") || s.includes("UTGST")) return "CGST+SGST";
  return s || "GST";
};

// e.g. "IGST 5%"  /  "IGST 5/12%"
const gstLabel = (inv) => {
  const items = inv.items || [];
  const taxed = items.filter((it) => Number(it.gstAmount) > 0);
  const use = taxed.length ? taxed : items;
  if (!use.length) return "-";
  const byType = {};
  use.forEach((it) => {
    const t = taxType(it.gstType);
    (byType[t] = byType[t] || new Set()).add(Number(it.gstPercent) || 0);
  });
  return Object.entries(byType)
    .map(([t, rates]) => `${t} ${[...rates].sort((a, b) => a - b).join("/")}%`)
    .join(", ");
};

// Paid / balance straight from the invoice summary
const paidAndBalance = (inv) => ({
  paid:    Number(inv.summary?.paidAmount  || 0),
  balance: Number(inv.summary?.amountToPay || 0),
});

// Every number the ledger needs for one invoice
const invoiceFigures = (inv) => {
  const s = inv.summary || {};
  const items = inv.items || [];
  const pay = paidAndBalance(inv);
  const gstin = String(inv.billTo?.gstin || "").trim().toUpperCase();
  const due = inv.dueDate ? new Date(inv.dueDate) : null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const overdueDays = due && pay.balance > 0.01 ? Math.floor((today - due) / 86400000) : 0;
  return {
    gross:    Number(s.totalGrossValue ?? sum(items, (it) => it.grossAmount ?? it.qty * it.price)),
    discount: Number(s.totalDiscount   ?? sum(items, (it) => it.discountValue)),
    taxable:  Number(s.totalNet        ?? sum(items, (it) => it.totalNet)),
    tax:      Number(s.totalTax        ?? sum(items, (it) => it.gstAmount)),
    total:    Number(s.totalPayAmount  || 0),
    paid:     pay.paid,
    balance:  pay.balance,
    gstin,
    gstinOk:  !gstin || GSTIN_RE.test(gstin),
    state:    STATES[gstin.slice(0, 2)] || "",
    gstText:  gstLabel(inv),
    overdueDays,
  };
};

// Status from the amounts (an invoice marked "paid" with a balance left shows PARTIAL)
const statusOf = (inv, f) => {
  const st = String(inv.status || "").toLowerCase();
  if (st === "cancelled") return ["CANCELLED", MUTED];
  if (st === "draft")     return ["DRAFT", MUTED];
  if (f.balance <= 0.01)  return ["PAID", GREEN];
  if (f.paid > 0.01)      return ["PARTIAL", AMBER];
  if (f.overdueDays > 0)  return ["OVERDUE", RED];
  return ["UNPAID", [234, 88, 12]];
};

// ─── PDF Builder ──────────────────────────────────────────────────────────────
const generateStatementPdf = async (rawInvoices, month, year) => {
  const invoices = [...rawInvoices].sort((a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate));

  const { default: jsPDF }     = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const PW = doc.internal.pageSize.getWidth();   // 297
  const PH = doc.internal.pageSize.getHeight();  // 210
  const M  = 14;
  const W  = PW - 2 * M;                         // 269

  const monthName  = MONTH_NAMES[month - 1];
  const monthShort = MONTH_SHORT[month - 1];
  const seller     = invoices[0]?.seller || {};
  const sellerGstin = String(seller.gstin || "").toUpperCase();

  // ── Figures ──
  const figs   = invoices.map(invoiceFigures);
  const active = invoices.map((inv) => !isCancelled(inv));
  const tot = (key) => figs.reduce((s, f, i) => s + (active[i] ? f[key] : 0), 0);
  const T = {
    gross: tot("gross"), discount: tot("discount"), taxable: tot("taxable"), tax: tot("tax"),
    total: tot("total"), paid: tot("paid"), balance: tot("balance"),
  };
  const activeInv = invoices.filter((_, i) => active[i]);
  const cancelledCount = invoices.length - activeInv.length;
  const overdueAmt = figs.reduce((s, f, i) => s + (active[i] && f.overdueDays > 0 ? f.balance : 0), 0);
  const customerCount = new Set(
    activeInv.map((i) => i.billTo?.companyName || i.billTo?.contactPerson || "Unknown")
  ).size;

  /* ── Page chrome ── */
  const drawWatermark = () => {
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.05 }));
    try { doc.addImage(logoWatermark, "PNG", (PW - 130) / 2, 52, 130, 101, undefined, "FAST"); } catch {}
    doc.restoreGraphicsState();
  };

  const drawHeader = () => {
    drawWatermark();
    doc.setFillColor(...ORA);
    doc.rect(0, 4, 44, 3.6, "F");
    doc.rect(0, 10, 33, 3.6, "F");
    doc.setFillColor(...BLK);
    doc.rect(PW - 92, 0, 92, 14, "F");
    doc.triangle(PW - 92, 0, PW - 92, 14, PW - 107, 0, "F");
    doc.setFont("helvetica", "bold").setFontSize(26).setTextColor(0);
    doc.text("STATEMENT", M, 30);
    try {
      doc.addImage(logoMain, "PNG", PW - 13 - 38, 15, 38, 19.7, "lg");
    } catch {
      doc.setFontSize(15).setTextColor(...ORA);
      doc.text("Digident", PW - M, 26, { align: "right" });
    }
  };

  const drawFooter = () => {
    doc.setFillColor(...BLK);
    doc.rect(0, PH - 11, 92, 11, "F");
    doc.triangle(92, PH - 11, 92, PH, 103, PH, "F");
    doc.setFillColor(...ORA);
    doc.rect(PW - 60, PH - 6, 60, 6, "F");
    doc.triangle(PW - 60, PH - 6, PW - 60, PH, PW - 70, PH, "F");

    doc.setFont("helvetica", "bold").setFontSize(8.5).setTextColor(0);
    doc.text(`${(seller.companyName || "DIGIDENT INDIA PRIVATE LIMITED").toUpperCase()}${sellerGstin ? `   |   GSTIN: ${sellerGstin}` : ""}`, M, PH - 20);
    const addr = seller.address ||
      "Digident India Pvt Ltd, 314, Professor Colony, Near Matlani Garden, Behind Agrawal Sweets, Sapna Sangita Road,Indore, (M.P.) 452001.";
    doc.setFont("helvetica", "normal").setFontSize(7.3).setTextColor(50, 50, 50);
    doc.text(doc.splitTextToSize(addr, W), M, PH - 15.8);

    doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(...WHT);
    doc.text(
      `Email: ${seller.email || "info@digident.in"}  |  Contact: ${seller.contactNumber || "+91 9294503001"}`,
      M, PH - 4.3
    );
  };

  const decorated = new Set();
  const decorate = () => {
    const p = doc.internal.getCurrentPageInfo().pageNumber;
    if (decorated.has(p)) return;
    decorated.add(p);
    drawHeader();
    drawFooter();
  };

  const TOP_NEXT = 38;   // table top on page 2+
  const BOTTOM   = 26;   // keeps content clear of the footer block

  /* ══════════ PAGE 1 TOP ══════════ */
  decorate();

  // Left: what this statement is
  doc.setFillColor(...ORA);
  doc.rect(M, 37, 1.8, 21, "F");
  doc.setFont("helvetica", "bold").setFontSize(12.5).setTextColor(0);
  doc.text(`Monthly Sales Ledger - ${monthName} ${year}`, 20, 42);
  doc.setFont("helvetica", "normal").setFontSize(8.3).setTextColor(85, 85, 85);
  doc.text(`All Customers (${customerCount})   |   Period: 01 ${monthShort} ${year} - ${lastDayOf(month, year)} ${monthShort} ${year}`, 20, 48);
  if (sellerGstin) {
    const st = STATES[sellerGstin.slice(0, 2)];
    doc.text(`Seller GSTIN: ${sellerGstin}${st ? `   |   State: ${st} (${sellerGstin.slice(0, 2)})` : ""}`, 20, 53);
  }
  doc.text("All amounts in INR.   Net Value (before GST) + GST = Gross Value (after GST).", 20, 58);

  // Right: statement date
  doc.setFont("helvetica", "bold").setFontSize(7.3).setTextColor(...ORA);
  doc.text("STATEMENT DATE", PW - M, 41, { align: "right" });
  doc.setFont("helvetica", "normal").setFontSize(9.3).setTextColor(0);
  doc.text(
    new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }),
    PW - M, 47, { align: "right" }
  );

  doc.setDrawColor(155, 155, 155).setLineWidth(0.25);
  doc.line(M, 62, PW - M, 62);

  // Summary cards
  const cardY = 66, cardH = 18, gap = 4;
  const cards = [
    { label: "TOTAL INVOICES", value: String(activeInv.length), accent: ORA },
    { label: "NET VALUE (BEFORE GST)",  value: inr(T.taxable),  accent: ORA },
    { label: "GST",                     value: inr(T.tax),      accent: ORA },
    { label: "GROSS VALUE (AFTER GST)", value: inr(T.total),    accent: ORA },
    { label: "RECEIVED",       value: inr(T.paid),              accent: GREEN },
    { label: "BALANCE DUE",    value: inr(T.balance),           accent: T.balance > 0.01 ? RED : GREEN },
  ];
  const cardW = (W - gap * (cards.length - 1)) / cards.length;
  cards.forEach((c, i) => {
    const cx = M + i * (cardW + gap);
    doc.setFillColor(...GRY);
    doc.roundedRect(cx, cardY, cardW, cardH, 1.5, 1.5, "F");
    doc.setFillColor(...c.accent);
    doc.roundedRect(cx, cardY, cardW, 1.4, 0.7, 0.7, "F");
    doc.setFont("helvetica", "bold").setFontSize(6.2).setTextColor(110, 110, 110);
    doc.text(c.label, cx + cardW / 2, cardY + 7, { align: "center" });
    doc.setFont("helvetica", "bold").setFontSize(9.8).setTextColor(...c.accent);
    doc.text(c.value, cx + cardW / 2, cardY + 13.8, { align: "center" });
  });

  const notes = [
    `List value (before discount): ${inr(T.gross)}`,
    `Discount: ${inr(T.discount)}`,
    overdueAmt > 0.01 ? `Overdue now: ${inr(overdueAmt)}` : "",
    cancelledCount ? `Cancelled: ${cancelledCount} (not in totals)` : "",
  ].filter(Boolean).join("   |   ");
  doc.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(105, 105, 105);
  doc.text(notes, PW - M, cardY + cardH + 4.8, { align: "right" });

  /* ══════════ LEDGER TABLE ══════════ */
  // widths sum to W (269mm) so the Grand Total row lines up
  const colStyles = {
    0: { cellWidth: 21, halign: "left" },    // Inv No.
    1: { cellWidth: 22, halign: "left" },    // Date / Due
    2: { cellWidth: 70, halign: "left" },    // Customer / GSTIN
    3: { cellWidth: 20, halign: "right" },   // Discount
    4: { cellWidth: 25, halign: "right" },   // Net Value (before GST)  = summary.totalNet
    5: { cellWidth: 22, halign: "right" },   // GST                      = summary.totalTax
    6: { cellWidth: 26, halign: "right" },   // Gross Value (after GST)  = summary.totalPayAmount
    7: { cellWidth: 21, halign: "right" },   // Paid
    8: { cellWidth: 24, halign: "right" },   // Balance
    9: { cellWidth: 18, halign: "center" },  // Status
  };

  const meta = invoices.map((inv, i) => {
    const f = figs[i];
    const [label, color] = statusOf(inv, f);
    const city = getCity(inv);
    let sub2;
    if (f.gstin) sub2 = `GSTIN ${f.gstin}${f.state ? ` | ${f.state}` : ""}${f.gstinOk ? "" : "  (check GSTIN)"}`;
    else sub2 = `Unregistered${city ? ` | ${city}` : ""}`;
    return {
      label, color, f, cancelled: !active[i],
      sub1: f.overdueDays > 0 ? `${f.overdueDays} days overdue` : `Due ${fmtDate(inv.dueDate)}`,
      sub1Color: f.overdueDays > 0 ? RED : MUTED,
      sub2, sub2Color: f.gstin && !f.gstinOk ? AMBER : MUTED,
      sub6: f.gstText,
    };
  });

  const body = invoices.map((inv, i) => {
    const f = figs[i];
    return [
      invNo(inv),
      fmtDate(inv.invoiceDate),
      inv.billTo?.companyName || inv.billTo?.contactPerson || "-",
      f.discount > 0 ? num(f.discount) : "-",
      num(f.taxable),
      num(f.tax),
      num(f.total),
      f.paid > 0 ? num(f.paid) : "-",
      num(f.balance),
      meta[i].label,
    ];
  });

  const PAD   = { top: 2.4, bottom: 2.4, left: 1.8, right: 1.8 };
  const PAD2  = { top: 2.4, bottom: 5.8, left: 1.8, right: 1.8 }; // room for a 2nd line

  autoTable(doc, {
    startY: cardY + cardH + 8,
    head: [["Inv No.", "Date / Due", "Customer / GSTIN", "Discount", "Net Value\n(before GST)", "GST", "Gross Value\n(after GST)", "Paid", "Balance", "Status"]],
    body,
    theme: "plain",
    margin: { left: M, right: M, top: TOP_NEXT, bottom: BOTTOM },
    headStyles: { fillColor: ORA, textColor: WHT, fontSize: 7.2, fontStyle: "bold", cellPadding: { top: 3, bottom: 3, left: 1.8, right: 1.8 } },
    bodyStyles: { fontSize: 7.3, textColor: TEXT, valign: "top", cellPadding: PAD2 },
    alternateRowStyles: { fillColor: [250, 246, 242] },
    columnStyles: colStyles,
    didParseCell: (d) => {
      if (d.section === "head") { d.cell.styles.halign = colStyles[d.column.index].halign; return; }
      if (d.section !== "body") return;
      const m = meta[d.row.index];
      const c = d.column.index;
      if (c === 0) { d.cell.styles.fontStyle = "bold"; d.cell.styles.textColor = ORA_D; }
      if (c === 2) d.cell.styles.fontStyle = "bold";
      if (c === 3 && m.f.discount > 0) d.cell.styles.textColor = AMBER;
      if (c === 6) d.cell.styles.fontStyle = "bold";
      if (c === 7 && m.f.paid > 0) d.cell.styles.textColor = GREEN;
      if (c === 8) { d.cell.styles.fontStyle = "bold"; d.cell.styles.textColor = m.f.balance > 0.01 ? RED : GREEN; }
      if (c === 9) { d.cell.styles.fontStyle = "bold"; d.cell.styles.fontSize = 6.1; d.cell.styles.textColor = m.color; }
      if (m.cancelled) d.cell.styles.textColor = MUTED;
    },
    didDrawCell: (d) => {
      if (d.section !== "body") return;
      const m = meta[d.row.index];
      const c = d.column.index;
      const subY = d.cell.y + d.cell.height - 2.1;
      const subLine = (text, color, align = "left") => {
        doc.setFont("helvetica", "normal").setFontSize(5.9).setTextColor(...color);
        const maxW = d.cell.width - 3.6;
        let t = doc.splitTextToSize(text, maxW)[0] || "";
        if (t.length < text.length) t = t.replace(/.{0,3}$/, "...");
        const x = align === "right" ? d.cell.x + d.cell.width - 1.8 : d.cell.x + 1.8;
        doc.text(t, x, subY, { align });
      };
      if (c === 1) subLine(m.sub1, m.sub1Color);
      if (c === 2) subLine(m.sub2, m.sub2Color);
      if (c === 5) subLine(m.sub6, MUTED, "right");
      // row divider
      doc.setDrawColor(230, 230, 230).setLineWidth(0.2);
      doc.line(d.cell.x, d.cell.y + d.cell.height, d.cell.x + d.cell.width, d.cell.y + d.cell.height);
    },
    didDrawPage: decorate,
  });

  /* ── Grand total ── */
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 3,
    body: [[
      { content: `Grand Total  (${activeInv.length} invoices)`, colSpan: 3 },
      num(T.discount), num(T.taxable), num(T.tax), num(T.total), num(T.paid), num(T.balance), "",
    ]],
    showHead: false,
    theme: "plain",
    margin: { left: M, right: M, top: TOP_NEXT, bottom: BOTTOM },
    bodyStyles: { fillColor: [245, 240, 235], fontStyle: "bold", fontSize: 7.4, cellPadding: { top: 3.4, bottom: 3.4, left: 1.8, right: 1.8 }, overflow: "visible" },
    columnStyles: colStyles,
    didParseCell: (d) => {
      const c = d.column.index;
      if (c === 0) d.cell.styles.textColor = ORA;
      if (c === 3) d.cell.styles.textColor = AMBER;
      if (c === 7) d.cell.styles.textColor = GREEN;
      if (c === 8) d.cell.styles.textColor = T.balance > 0.01 ? RED : GREEN;
    },
    didDrawPage: decorate,
  });

  /* ══════════ GST SUMMARY ══════════ */
  const rateMap = {}, hsnMap = {};
  const reg = { n: 0, taxable: 0, tax: 0, total: 0 }, unreg = { n: 0, taxable: 0, tax: 0, total: 0 };
  invoices.forEach((inv, i) => {
    if (!active[i]) return;
    const f = figs[i];
    const bucket = f.gstin ? reg : unreg;
    bucket.n += 1; bucket.taxable += f.taxable; bucket.tax += f.tax; bucket.total += f.total;
    (inv.items || []).forEach((it) => {
      const type = taxType(it.gstType);
      const rate = Number(it.gstPercent) || 0;
      const taxable = Number(it.totalNet) || 0;
      const tax = Number(it.gstAmount) || 0;
      const k = `${type}|${rate}`;
      const row = (rateMap[k] = rateMap[k] || { type, rate, taxable: 0, igst: 0, cgst: 0, sgst: 0 });
      row.taxable += taxable;
      if (type === "IGST") row.igst += tax; else { row.cgst += tax / 2; row.sgst += tax / 2; }
      const h = String(it.hsnCode || "-");
      const hr = (hsnMap[h] = hsnMap[h] || { qty: 0, taxable: 0, tax: 0, total: 0, rates: new Set() });
      hr.qty += Number(it.qty) || 0; hr.taxable += taxable; hr.tax += tax;
      hr.total += Number(it.totalAmount) || taxable + tax; hr.rates.add(rate);
    });
  });
  const rateRows = Object.values(rateMap).sort((a, b) => a.type.localeCompare(b.type) || a.rate - b.rate);
  const hsnRows  = Object.entries(hsnMap).sort(([a], [b]) => a.localeCompare(b));

  let y = doc.lastAutoTable.finalY + 8;
  const need = 26 + 7 * Math.max(rateRows.length + 2, 4);
  if (y + need > PH - BOTTOM) { doc.addPage(); decorate(); y = TOP_NEXT; }

  const sectionTitle = (text, yy) => {
    doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(...ORA);
    doc.text(text, M, yy);
    doc.setDrawColor(...ORA).setLineWidth(0.3);
    doc.line(M + doc.getTextWidth(text) + 3, yy - 1.2, PW - M, yy - 1.2);
  };
  sectionTitle("GST SUMMARY", y);
  y += 3;

  const small = {
    theme: "plain",
    headStyles: { fillColor: [252, 236, 222], textColor: [120, 60, 20], fontSize: 6.8, fontStyle: "bold", cellPadding: 2 },
    bodyStyles: { fontSize: 7, textColor: TEXT, cellPadding: 2 },
    footStyles: { fillColor: [245, 240, 235], textColor: [0, 0, 0], fontSize: 7, fontStyle: "bold", cellPadding: 2 },
    didDrawCell: (d) => {
      if (d.section !== "body") return;
      doc.setDrawColor(232, 232, 232).setLineWidth(0.2);
      doc.line(d.cell.x, d.cell.y + d.cell.height, d.cell.x + d.cell.width, d.cell.y + d.cell.height);
    },
    didDrawPage: decorate,
  };
  const rightCols = (from, n) => Object.fromEntries(Array.from({ length: n }, (_, i) => [from + i, { halign: "right" }]));

  // 1) Rate-wise
  const startPage = doc.internal.getCurrentPageInfo().pageNumber;
  const leftW = 158;
  autoTable(doc, {
    ...small,
    startY: y,
    margin: { left: M, right: PW - M - leftW, top: TOP_NEXT, bottom: BOTTOM },
    tableWidth: leftW,
    head: [["Tax Type", "Rate", "Net Value (before GST)", "IGST", "CGST", "SGST", "Total GST"]],
    body: rateRows.map((r) => [r.type, `${r.rate}%`, num(r.taxable), num(r.igst), num(r.cgst), num(r.sgst), num(r.igst + r.cgst + r.sgst)]),
    foot: [["Total", "", num(sum(rateRows, (r) => r.taxable)), num(sum(rateRows, (r) => r.igst)), num(sum(rateRows, (r) => r.cgst)), num(sum(rateRows, (r) => r.sgst)), num(sum(rateRows, (r) => r.igst + r.cgst + r.sgst))]],
    showFoot: "lastPage",
    columnStyles: { 0: { fontStyle: "bold" }, 1: { halign: "center" }, ...rightCols(2, 5) },
    didParseCell: (d) => {
      if (d.section !== "body" && d.column.index >= 2) d.cell.styles.halign = "right";
      if (d.section === "head" && d.column.index === 1) d.cell.styles.halign = "center";
    },
  });
  const yLeft = doc.lastAutoTable.finalY;
  const pageLeft = doc.internal.getCurrentPageInfo().pageNumber;
  doc.setPage(startPage); // right-hand table starts on the same page as the left one

  // 2) Registered (B2B) vs unregistered (B2C)
  const rightX = M + leftW + 7;
  autoTable(doc, {
    ...small,
    startY: y,
    pageBreak: "avoid",
    margin: { left: rightX, right: M, top: TOP_NEXT, bottom: BOTTOM },
    head: [["Customer Type", "Inv.", "Net Value", "GST", "Gross Value"]],
    body: [
      ["Registered (with GSTIN) - B2B", reg.n, num(reg.taxable), num(reg.tax), num(reg.total)],
      ["Unregistered - B2C", unreg.n, num(unreg.taxable), num(unreg.tax), num(unreg.total)],
    ],
    foot: [["Total", reg.n + unreg.n, num(reg.taxable + unreg.taxable), num(reg.tax + unreg.tax), num(reg.total + unreg.total)]],
    columnStyles: { 0: { cellWidth: 44 }, 1: { halign: "center" }, ...rightCols(2, 3) },
    didParseCell: (d) => {
      if (d.section !== "body" && d.column.index >= 2) d.cell.styles.halign = "right";
      if (d.column.index === 1) d.cell.styles.halign = "center";
    },
  });
  // continue below whichever table ended lower
  const yRight = doc.lastAutoTable.finalY;
  const pageRight = doc.internal.getCurrentPageInfo().pageNumber;
  if (pageLeft > pageRight)      { doc.setPage(pageLeft);  y = yLeft + 7; }
  else if (pageRight > pageLeft) { y = yRight + 7; }
  else                           { y = Math.max(yLeft, yRight) + 7; }

  // 3) HSN-wise
  if (y + 24 > PH - BOTTOM) { doc.addPage(); decorate(); y = TOP_NEXT; }
  doc.setFont("helvetica", "bold").setFontSize(7.5).setTextColor(90, 90, 90);
  doc.text("HSN-wise Summary", M, y);
  autoTable(doc, {
    ...small,
    startY: y + 2,
    margin: { left: M, right: M, top: TOP_NEXT, bottom: BOTTOM },
    head: [["HSN Code", "GST Rate", "Total Qty", "Net Value (before GST)", "GST Amount", "Gross Value (after GST)"]],
    body: hsnRows.map(([h, r]) => [h, [...r.rates].sort((a, b) => a - b).map((x) => `${x}%`).join(", "), r.qty, num(r.taxable), num(r.tax), num(r.total)]),
    foot: [["Total", "", sum(hsnRows, ([, r]) => r.qty), num(sum(hsnRows, ([, r]) => r.taxable)), num(sum(hsnRows, ([, r]) => r.tax)), num(sum(hsnRows, ([, r]) => r.total))]],
    showFoot: "lastPage",
    columnStyles: { 0: { fontStyle: "bold" }, 1: { halign: "center" }, 2: { halign: "center" }, ...rightCols(3, 3) },
    didParseCell: (d) => {
      const c = d.column.index;
      if (d.section !== "body") d.cell.styles.halign = c >= 3 ? "right" : c >= 1 ? "center" : "left";
    },
  });

  /* ── Authorised Signatory (last page; new page if no room) ── */
  const sigY = PH - 37;
  if (doc.lastAutoTable.finalY + 6 > sigY) { doc.addPage(); decorate(); }
  doc.setDrawColor(...ORA).setLineWidth(0.3);
  doc.line(PW - M - 58, sigY, PW - M, sigY);
  doc.setFont("helvetica", "normal").setFontSize(7.3).setTextColor(85, 85, 85);
  doc.text("Authorised Signatory", PW - M - 29, sigY + 4.5, { align: "center" });
  doc.setFont("helvetica", "bold").setFontSize(7.8).setTextColor(0);
  doc.text("DIGIDENT INDIA PRIVATE LIMITED.", PW - M - 29, sigY + 9.5, { align: "center" });

  /* ── Page numbers ── */
  const pages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(...WHT);
    doc.text(`${monthName} ${year}  |  Page ${p} of ${pages}`, PW - M, 8.5, { align: "right" });
  }

  doc.save(`Digident_${monthName}_${year}_Ledger.pdf`);
};

// ─── Component ────────────────────────────────────────────────────────────────
const MonthYearPdfExport = ({ fetchInvoices }) => {
  const now = new Date();
  const [month,   setMonth]   = useState(now.getMonth() + 1);
  const [year,    setYear]    = useState(now.getFullYear());
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);

  const yearOptions = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  const handleExport = async () => {
    setLoading(true);
    try {
      const invoices = await fetchInvoices(month, year);
      if (!invoices || invoices.length === 0) {
        alert(`No invoices found for ${MONTH_NAMES[month - 1]} ${year}.`);
        return;
      }
      await generateStatementPdf(invoices, month, year);
      setOpen(false);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("Export failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const selectCls =
    "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
      >
        <FileText size={16} className="text-red-500" />
        Monthly Ledger
      </button>

      <Dialog open={open} onClose={() => !loading && setOpen(false)} size="sm" label="Download monthly ledger">
        <DialogHeader icon={FileText} title="Monthly ledger" subtitle="PDF ledger with GST details of all invoices in the month" onClose={() => setOpen(false)} />
        <DialogBody className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0">
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Month</label>
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className={selectCls}>
                {MONTH_NAMES.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Year</label>
              <select value={year} onChange={(e) => setYear(Number(e.target.value))} className={selectCls}>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-900 px-4 py-3">
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Ledger for</p>
              <p className="mt-0.5 truncate text-base font-bold text-white">
                {MONTH_NAMES[month - 1]} {year}
              </p>
            </div>
            <p className="shrink-0 text-sm font-semibold text-brand-400">.pdf</p>
          </div>

          <ul className="space-y-2 rounded-xl bg-slate-50 px-4 py-3 text-sm">
            {[
              ["Summary", "Invoices, net value (before GST), GST, gross value (after GST), received, balance due"],
              ["Ledger", "Every invoice with customer GSTIN, discount, net value, GST, gross value, paid and balance"],
              ["GST", "Rate-wise (IGST / CGST / SGST), B2B vs B2C and HSN-wise summary"],
            ].map(([k, desc]) => (
              <li key={k} className="flex items-start gap-2.5">
                <span className="shrink-0 rounded-md bg-brand-50 px-1.5 py-0.5 text-xs font-bold text-brand-600">{k}</span>
                <span className="min-w-0 text-slate-500">{desc}</span>
              </li>
            ))}
          </ul>
        </DialogBody>
        <DialogFooter>
          <DialogButton tone="ghost" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </DialogButton>
          <DialogButton tone="primary" onClick={handleExport} isLoading={loading} className="flex-1 sm:flex-none">
            {!loading && <FileText size={16} />}
            {loading ? "Generating..." : "Download PDF"}
          </DialogButton>
        </DialogFooter>
      </Dialog>
    </>
  );
};

export default MonthYearPdfExport;