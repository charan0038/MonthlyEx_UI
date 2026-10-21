import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Transaction, MonthlySummary, YearlySummary, User } from '../types';
import { getMonthName } from './formatters';

interface MonthlyPdfOptions {
  monthYear: string;
  user: User | null;
  summary: MonthlySummary | null;
  budgetAmount: number;
  transactions: Transaction[];
}

interface YearlyPdfOptions {
  year: number;
  user: User | null;
  summary: YearlySummary;
}

/**
 * Clean currency formatting specifically for standard PDF fonts (Helvetica)
 * Avoids the Unicode Rupee symbol (₹) which renders as a broken superscript "¹" in jsPDF.
 */
function cleanCurrency(amount: number | null | undefined): string {
  const num = Math.round(Number(amount) || 0);
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Math.abs(num));
  return (num < 0 ? '- Rs. ' : 'Rs. ') + formatted;
}

/**
 * Format date for PDF display (e.g., "14 Oct 2026")
 */
function formatPdfDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

/**
 * Exports a clean, executive-grade Monthly Financial Statement PDF
 */
export function exportMonthlyPdfReport({
  monthYear,
  user,
  summary,
  budgetAmount,
  transactions,
}: MonthlyPdfOptions) {
  const [yearStr, monthStr] = monthYear.split('-');
  const year = parseInt(yearStr, 10);
  const monthIndex = parseInt(monthStr, 10) - 1;
  const monthName = getMonthName(monthIndex, year);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 14;

  // 1. Elegant Header Banner (Deep Navy Gradient feel)
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.roundedRect(12, currentY, pageWidth - 24, 28, 4, 4, 'F');

  // Decorative Accent bar on the left edge
  doc.setFillColor(16, 185, 129); // Emerald Green
  doc.rect(12, currentY, 3.5, 28, 'F');

  // Title & Subtitle inside banner
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('VESSEL  |  MONTHLY FINANCIAL STATEMENT', 19, currentY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // Slate-400
  const genTime = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Statement Period: ${monthName}   |   Issued: ${genTime}`, 19, currentY + 19);

  currentY += 34;

  // 2. User & Account Info Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(12, currentY, pageWidth - 24, 18, 3, 3, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Account Holder:', 18, currentY + 7);
  doc.text('Registered Mobile:', 18, currentY + 13);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(user?.fullName || 'Personal Account', 52, currentY + 7);
  doc.text(user?.mobileNumber ? `+91 ${user.mobileNumber}` : '—', 52, currentY + 13);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Total Recorded Transactions:', pageWidth / 2 + 6, currentY + 7);
  doc.text('Budget Health Status:', pageWidth / 2 + 6, currentY + 13);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${transactions.length} record${transactions.length === 1 ? '' : 's'}`, pageWidth / 2 + 62, currentY + 7);

  // Derive summary numbers safely
  const calculatedExpenses = transactions
    .filter((t) => t.type?.toLowerCase() === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const calculatedIncome = transactions
    .filter((t) => t.type?.toLowerCase() === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const budgetLimit = summary?.budgetLimit ?? budgetAmount;
  const totalExpense = summary?.totalExpense || calculatedExpenses;
  const totalIncome = summary?.totalIncome || calculatedIncome;
  const netBalance = summary?.netBalance ?? (totalIncome - totalExpense);
  const budgetLeft = summary?.budgetLeft ?? (budgetLimit - totalExpense);

  const isOverBudget = budgetLeft < 0;
  if (isOverBudget) {
    doc.setTextColor(225, 29, 72);
    doc.text('Over Budget', pageWidth / 2 + 62, currentY + 13);
  } else {
    doc.setTextColor(16, 185, 129);
    doc.text('On Track (Healthy)', pageWidth / 2 + 62, currentY + 13);
  }

  currentY += 24;

  // 3. Executive Financial Summary Cards (AutoTable Grid)
  autoTable(doc, {
    startY: currentY,
    margin: { left: 12, right: 12 },
    theme: 'grid',
    head: [['Monthly Budget', 'Total Income', 'Total Expenses', 'Net Balance', 'Budget Left']],
    body: [[
      cleanCurrency(budgetLimit),
      cleanCurrency(totalIncome),
      cleanCurrency(totalExpense),
      (netBalance >= 0 ? '+ ' : '') + cleanCurrency(netBalance),
      cleanCurrency(budgetLeft),
    ]],
    headStyles: {
      fillColor: [79, 70, 229], // Brand Indigo
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center',
      textColor: [15, 23, 42],
      cellPadding: 4,
    },
    columnStyles: {
      0: { textColor: [79, 70, 229] },
      1: { textColor: [16, 185, 129] },
      2: { textColor: [225, 29, 72] },
      3: { textColor: netBalance >= 0 ? [16, 185, 129] : [225, 29, 72] },
      4: { textColor: budgetLeft >= 0 ? [14, 165, 233] : [225, 29, 72] },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // 4. Category Breakdown Table (if available)
  const categoryBreakdown = summary?.categoryBreakdown || [];
  if (categoryBreakdown.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Spending by Category', 14, currentY);

    const catRows = categoryBreakdown.map((cat, idx) => [
      (idx + 1).toString(),
      cat.category,
      cleanCurrency(cat.amount),
      `${cat.percentage.toFixed(1)}%`,
    ]);

    autoTable(doc, {
      startY: currentY + 3,
      margin: { left: 12, right: 12 },
      head: [['#', 'Category', 'Total Spent', '% Share']],
      body: catRows,
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [51, 65, 85],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: [15, 23, 42],
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        2: { halign: 'right', fontStyle: 'bold' },
        3: { halign: 'right' },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // 5. Complete Transaction Ledger Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Transactions Ledger (${transactions.length} records)`, 14, currentY);

  const txRows = transactions.map((tx, idx) => {
    const isIncome = tx.type?.toLowerCase() === 'income';
    const amountStr = (isIncome ? '+ ' : '- ') + cleanCurrency(tx.amount);
    const catName = typeof tx.category === 'object' ? (tx.category?.name || 'Other') : (tx.category || 'Other');
    const subName = tx.subcategory || '—';
    const payment = tx.paymentMethod ? tx.paymentMethod.toUpperCase() : 'UPI';
    const note = tx.note || '—';

    return [
      (idx + 1).toString(),
      formatPdfDate(tx.date),
      note,
      catName,
      subName,
      payment,
      tx.type?.toUpperCase() || 'EXPENSE',
      amountStr,
    ];
  });

  autoTable(doc, {
    startY: currentY + 3,
    margin: { left: 12, right: 12 },
    head: [['#', 'Date', 'Description / Note', 'Category', 'Subcategory', 'Method', 'Type', 'Amount']],
    body: txRows.length > 0 ? txRows : [['—', '—', 'No transactions recorded for this month', '—', '—', '—', '—', '—']],
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [15, 23, 42],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 22 },
      2: { cellWidth: 44 },
      3: { cellWidth: 26 },
      4: { cellWidth: 26 },
      5: { cellWidth: 18, halign: 'center' },
      6: { cellWidth: 18, halign: 'center' },
      7: { cellWidth: 24, halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      // Color-code income vs expense amounts
      if (data.section === 'body' && data.column.index === 7) {
        const text = String(data.cell.raw || '');
        if (text.startsWith('+')) {
          data.cell.styles.textColor = [16, 185, 129];
        } else if (text.startsWith('-')) {
          data.cell.styles.textColor = [225, 29, 72];
        }
      }
    },
  });

  // 6. Professional Footer on all pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Vessel Monthly Expense Tracker  |  Verified Financial Record  |  Page ${i} of ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }

  // Save the PDF
  doc.save(`Vessel_Statement_${monthYear}.pdf`);
}

/**
 * Exports an Annual Financial Statement PDF for a given year
 */
export function exportYearlyPdfReport({
  year,
  user,
  summary,
}: YearlyPdfOptions) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 14;

  // 1. Header Banner
  doc.setFillColor(15, 23, 42); // Dark Navy
  doc.roundedRect(12, currentY, pageWidth - 24, 28, 4, 4, 'F');

  // Decorative Accent bar on the left edge
  doc.setFillColor(79, 70, 229); // Indigo
  doc.rect(12, currentY, 3.5, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(`VESSEL  |  ANNUAL FINANCIAL STATEMENT - ${year}`, 19, currentY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  const genTime = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`12-Month Performance Overview   |   Issued: ${genTime}`, 19, currentY + 19);

  currentY += 34;

  // 2. User & Overview Details Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(12, currentY, pageWidth - 24, 18, 3, 3, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Account Holder:', 18, currentY + 7);
  doc.text('Registered Mobile:', 18, currentY + 13);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(user?.fullName || 'Personal Account', 52, currentY + 7);
  doc.text(user?.mobileNumber ? `+91 ${user.mobileNumber}` : '—', 52, currentY + 13);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Annual Transactions:', pageWidth / 2 + 6, currentY + 7);
  doc.text('Annual Savings Rate:', pageWidth / 2 + 6, currentY + 13);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${summary.totalTransactions || 0} items`, pageWidth / 2 + 56, currentY + 7);

  doc.setTextColor(summary.savingsRate >= 20 ? 16 : 79, summary.savingsRate >= 20 ? 185 : 70, summary.savingsRate >= 20 ? 129 : 229);
  doc.text(`${summary.savingsRate}% Saved`, pageWidth / 2 + 56, currentY + 13);

  currentY += 24;

  // 3. Key Annual KPI Summary Cards
  autoTable(doc, {
    startY: currentY,
    margin: { left: 12, right: 12 },
    theme: 'grid',
    head: [['Annual Income', 'Annual Expenses', 'Net Annual Savings', 'Monthly Avg Expense', 'Top Category']],
    body: [[
      cleanCurrency(summary.totalIncome),
      cleanCurrency(summary.totalExpense),
      (summary.netSavings >= 0 ? '+ ' : '') + cleanCurrency(summary.netSavings),
      cleanCurrency(summary.averageMonthlyExpense),
      summary.topExpenseCategory || 'None',
    ]],
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 9.5,
      fontStyle: 'bold',
      halign: 'center',
      textColor: [15, 23, 42],
      cellPadding: 4,
    },
    columnStyles: {
      0: { textColor: [16, 185, 129] },
      1: { textColor: [225, 29, 72] },
      2: { textColor: summary.netSavings >= 0 ? [16, 185, 129] : [225, 29, 72] },
      3: { textColor: [100, 116, 139] },
      4: { textColor: [15, 23, 42] },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // 4. Smart Insight Callout
  if (summary.insightMessage) {
    doc.setFillColor(238, 242, 255);
    doc.setDrawColor(199, 210, 254);
    doc.roundedRect(12, currentY, pageWidth - 24, 14, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(67, 56, 202);
    doc.text('Key Annual Insight: ', 18, currentY + 9);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(summary.insightMessage, 54, currentY + 9, { maxWidth: pageWidth - 70 });

    currentY += 20;
  }

  // 5. 12-Month Performance Breakdown Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('12-Month Breakdown Summary', 14, currentY);

  const monthBreakdownRows = (summary.monthlyBreakdown || []).map((m, idx) => {
    const isSurplus = m.netBalance >= 0;
    return [
      (idx + 1).toString(),
      m.monthName,
      m.totalIncome > 0 ? cleanCurrency(m.totalIncome) : '—',
      m.totalExpense > 0 ? cleanCurrency(m.totalExpense) : '—',
      m.totalIncome > 0 || m.totalExpense > 0
        ? (isSurplus ? '+ ' : '') + cleanCurrency(m.netBalance)
        : '—',
      m.topCategory && m.topCategory !== 'None' ? m.topCategory : '—',
    ];
  });

  autoTable(doc, {
    startY: currentY + 3,
    margin: { left: 12, right: 12 },
    head: [['#', 'Month', 'Income', 'Expenses', 'Net Savings', 'Top Category']],
    body: monthBreakdownRows,
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [15, 23, 42],
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 32, fontStyle: 'bold' },
      2: { cellWidth: 32, halign: 'right', textColor: [16, 185, 129] },
      3: { cellWidth: 32, halign: 'right', textColor: [225, 29, 72] },
      4: { cellWidth: 36, halign: 'right', fontStyle: 'bold' },
      5: { cellWidth: 44, halign: 'left' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 4) {
        const text = String(data.cell.raw || '');
        if (text.startsWith('+')) {
          data.cell.styles.textColor = [16, 185, 129];
        } else if (text.startsWith('-')) {
          data.cell.styles.textColor = [225, 29, 72];
        }
      }
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // 6. Annual Category Breakdown Table
  const categories = summary.categoryBreakdown || [];
  if (categories.length > 0) {
    if (currentY > doc.internal.pageSize.getHeight() - 60) {
      doc.addPage();
      currentY = 16;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Annual Spending by Category', 14, currentY);

    const catRows = categories.map((cat, idx) => [
      (idx + 1).toString(),
      cat.category,
      cleanCurrency(cat.amount),
      `${cat.percentage.toFixed(1)}%`,
    ]);

    autoTable(doc, {
      startY: currentY + 3,
      margin: { left: 12, right: 12 },
      head: [['#', 'Category', 'Total Spent', '% of Annual Expenses']],
      body: catRows,
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [51, 65, 85],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: [15, 23, 42],
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        2: { halign: 'right', fontStyle: 'bold' },
        3: { halign: 'right' },
      },
    });
  }

  // 7. Footer on all pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Vessel Monthly Expense Tracker  |  Annual Financial Statement  |  Page ${i} of ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }

  doc.save(`Vessel_Annual_Report_${year}.pdf`);
}
