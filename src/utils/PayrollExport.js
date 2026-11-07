/**
 * Excel and PDF exports of the payroll table and of one employee's day-by-day breakdown.
 * They only lay out numbers the server calculated; nothing is recomputed here.
 * exceljs / jspdf are loaded on demand (same as the invoice exports) to keep the bundle small.
 */
import { MONTH_NAMES, formatDateKey, formatIstTime, minutesToHm } from "./IstTime";
import { PAYROLL_COLUMNS } from "../constants/PayrollConstants";

const downloadBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

const monthLabel = ({ month, year }) => `${MONTH_NAMES[month - 1]} ${year}`;
const fileStem = ({ month, year }) => `Digident_Payroll_${year}-${String(month).padStart(2, "0")}`;
const rawValue = (row, column) => (column.get ? column.get(row) : row[column.key]);
const cellValue = (row, column) => (column.money ? Number(rawValue(row, column) || 0) : rawValue(row, column) ?? "");

const DAY_COLUMNS = [
  ["Date", (day) => formatDateKey(day.date)],
  ["In (IST)", (day) => (day.punchIn ? formatIstTime(day.punchIn) : "")],
  ["Out (IST)", (day) => (day.punchOut ? formatIstTime(day.punchOut) : "")],
  ["Worked", (day) => (day.workedMinutes ? minutesToHm(day.workedMinutes) : "")],
  ["Status", (day) => day.status],
  ["Leave", (day) => (day.leave ? `${day.leave.leaveType}${day.leave.fraction === 0.5 ? ` ½ ${day.leave.halfDaySession || ""}` : ""}${day.leave.isPending ? " (pending)" : ""}` : "")],
  ["Deduction", (day) => Number(day.deduction || 0)],
  ["Extra", (day) => (day.extraMinutes ? minutesToHm(day.extraMinutes) : "")],
  ["Extra pay", (day) => Number(day.extraPay || 0)],
];

/**
 * Payroll table to .xlsx (one row per employee, plus a totals row).
 *
 * @param {object[]} rows server rows
 * @param {{ month: number, year: number, status: string }} month
 */
export const exportPayrollExcel = async (rows, month) => {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(`Payroll ${monthLabel(month)}`);
  sheet.addRow([`Payroll - ${monthLabel(month)} (${month.status === "FINALIZED" ? "finalized" : "live, not final"})`]).font = { bold: true, size: 13 };
  sheet.addRow([]);
  const header = sheet.addRow(["Email", ...PAYROLL_COLUMNS.map((column) => column.label)]);
  header.font = { bold: true };
  header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFDE6D3" } };
  for (const row of rows) sheet.addRow([row.email, ...PAYROLL_COLUMNS.map((column) => cellValue(row, column))]);
  const totals = sheet.addRow([
    "",
    "TOTAL",
    ...PAYROLL_COLUMNS.slice(1).map((column) =>
      column.money ? Math.round(rows.reduce((sum, row) => sum + Math.round(Number(rawValue(row, column) || 0) * 100), 0)) / 100 : ""
    ),
  ]);
  totals.font = { bold: true };
  PAYROLL_COLUMNS.forEach((column, index) => {
    if (column.money) sheet.getColumn(index + 2).numFmt = "#,##0.00";
  });
  sheet.columns.forEach((column) => {
    column.width = 16;
  });
  sheet.getColumn(1).width = 30;
  sheet.getColumn(2).width = 24;
  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `${fileStem(month)}.xlsx`);
};

/**
 * Payroll table to PDF (landscape A4).
 */
export const exportPayrollPdf = async (rows, month) => {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  doc.setFontSize(14);
  doc.text(`Payroll - ${monthLabel(month)}`, 40, 40);
  doc.setFontSize(9);
  doc.text(month.status === "FINALIZED" ? `Finalized (version ${month.version})` : "Live figures - month not finalized", 40, 56);
  const money = (value) => Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  autoTable(doc, {
    startY: 70,
    head: [PAYROLL_COLUMNS.map((column) => column.label)],
    body: rows.map((row) => PAYROLL_COLUMNS.map((column) => (column.money ? money(rawValue(row, column)) : String(rawValue(row, column) ?? "")))),
    styles: { fontSize: 7, cellPadding: 3 },
    headStyles: { fillColor: [230, 135, 54] },
  });
  doc.save(`${fileStem(month)}.pdf`);
};

/**
 * One employee's breakdown to .xlsx (summary + day-by-day).
 */
export const exportPayrollDetailExcel = async (detail) => {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Breakdown");
  sheet.addRow([`${detail.employee.name} - ${monthLabel(detail)}`]).font = { bold: true, size: 13 };
  sheet.addRow([]);
  for (const column of PAYROLL_COLUMNS.slice(1)) sheet.addRow([column.label, cellValue(detail, column)]);
  sheet.addRow(["Per day", detail.perDay]);
  sheet.addRow(["Per hour", detail.perHour]);
  sheet.addRow([]);
  const header = sheet.addRow(DAY_COLUMNS.map(([label]) => label));
  header.font = { bold: true };
  for (const day of detail.days) sheet.addRow(DAY_COLUMNS.map(([, read]) => read(day)));
  sheet.columns.forEach((column) => {
    column.width = 18;
  });
  const buffer = await workbook.xlsx.writeBuffer();
  const stem = `${fileStem(detail)}_${detail.employee.name.replace(/\s+/g, "_")}`;
  downloadBlob(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `${stem}.xlsx`);
};

/**
 * One employee's breakdown to PDF (salary slip style).
 */
export const exportPayrollDetailPdf = async (detail) => {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const money = (value) => `Rs ${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  doc.setFontSize(14);
  doc.text(`${detail.employee.name} - ${monthLabel(detail)}`, 40, 40);
  autoTable(doc, {
    startY: 56,
    body: [
      ["Base salary", money(detail.baseSalary), "Working days", String(detail.workingDays)],
      ["Per day", money(detail.perDay), "Per hour", money(detail.perHour)],
      ["Present", String(detail.presentDays), "Half days", String(detail.halfDays)],
      ["Paid leave", String(detail.paidLeaveDays), "Unpaid leave", String(detail.unpaidLeaveDays)],
      ["Absent", String(detail.absentDays), "Worked hours", String(detail.totalWorkedHours)],
      ["Leave deduction", money(detail.leaveDeduction), "Absent deduction", money(detail.absentDeduction)],
      ["Short-hours deduction", money(detail.shortHoursDeduction), "Extra pay", money(detail.extraPay)],
      ["Total deductions", money(detail.totalDeductions), "NET PAYABLE", money(detail.netPayable)],
    ],
    styles: { fontSize: 9 },
    theme: "grid",
  });
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 16,
    head: [DAY_COLUMNS.map(([label]) => label)],
    body: detail.days.map((day) => DAY_COLUMNS.map(([, read]) => String(read(day)))),
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [230, 135, 54] },
  });
  doc.save(`${fileStem(detail)}_${detail.employee.name.replace(/\s+/g, "_")}.pdf`);
};
