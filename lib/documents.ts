import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Customer, Payment, Sale, Setting } from '../types';
import { formatDate } from './utils';

export interface BusinessProfile {
  businessName: string;
  address: string;
  phone?: string;
  email?: string;
  taxNumber?: string;
}

const FALLBACK_BUSINESS: BusinessProfile = {
  businessName: 'Kuber Plywood Mart',
  address: 'Industrial Area, Timber Market Yard, Hubli, Karnataka',
  taxNumber: '29AAAAA0000A1Z5',
};

export function toBusinessProfile(settings?: Setting | null): BusinessProfile {
  if (!settings) return FALLBACK_BUSINESS;
  return {
    businessName: settings.businessName || FALLBACK_BUSINESS.businessName,
    address: settings.address || FALLBACK_BUSINESS.address,
    phone: settings.phone,
    email: settings.email,
    taxNumber: settings.taxNumber || FALLBACK_BUSINESS.taxNumber,
  };
}

export function rupees(amount: number | undefined | null): string {
  return `Rs. ${Number(amount || 0).toLocaleString('en-IN')}`;
}

function periodLabel(from?: string, to?: string): string {
  if (from && to) return `${formatDate(from)} to ${formatDate(to)}`;
  if (from) return `From ${formatDate(from)}`;
  if (to) return `Until ${formatDate(to)}`;
  return 'All dates';
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function printHtmlDocument(title: string, bodyHtml: string) {
  document.getElementById('kuber-print-root')?.remove();
  document.getElementById('kuber-print-style')?.remove();

  const style = document.createElement('style');
  style.id = 'kuber-print-style';
  style.textContent = `
    #kuber-print-root {
      font-family: Arial, Helvetica, sans-serif;
      color: #0f172a;
      background: #fff;
    }
    #kuber-print-root * { box-sizing: border-box; }
    #kuber-print-root h1, #kuber-print-root h2, #kuber-print-root h3, #kuber-print-root p { margin: 0; }
    #kuber-print-root .muted { color: #64748b; font-size: 12px; line-height: 1.45; word-break: break-word; }
    #kuber-print-root .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; border-bottom: 2px solid #e11f2b; padding-bottom: 16px; margin-bottom: 20px; }
    #kuber-print-root .brand { font-size: 20px; font-weight: 800; letter-spacing: 0.02em; text-transform: uppercase; margin-bottom: 6px; }
    #kuber-print-root .doc-title { color: #e11f2b; font-size: 18px; font-weight: 800; text-align: right; }
    #kuber-print-root .header-left { flex: 1; min-width: 0; }
    #kuber-print-root .header-right { flex: 0 0 210px; max-width: 220px; text-align: right; }
    #kuber-print-root table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
    #kuber-print-root th, #kuber-print-root td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; vertical-align: top; }
    #kuber-print-root th { background: #f8fafc; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; }
    #kuber-print-root .right { text-align: right; white-space: nowrap; }
    #kuber-print-root .section { margin-top: 24px; }
    #kuber-print-root .section h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #475569; margin-bottom: 8px; }
    #kuber-print-root .summary td { font-weight: 700; }
    #kuber-print-root .summary-box { width: 320px; margin-left: auto; }
    #kuber-print-root .summary-wide th, #kuber-print-root .summary-wide td { text-align: center; }
    #kuber-print-root .due { color: #e11f2b; }
    #kuber-print-root .paid { color: #059669; }
    @media screen {
      #kuber-print-root { position: absolute; left: -10000px; top: 0; width: 210mm; padding: 12mm; }
    }
    @media print {
      @page { margin: 12mm; size: A4; }
      body * { visibility: hidden !important; }
      #kuber-print-root, #kuber-print-root * { visibility: visible !important; }
      #kuber-print-root {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        padding: 0 !important;
        background: #fff !important;
      }
    }
  `;

  const root = document.createElement('div');
  root.id = 'kuber-print-root';
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML = bodyHtml;

  document.head.appendChild(style);
  document.body.appendChild(root);

  const previousTitle = document.title;
  document.title = title;

  const cleanup = () => {
    document.title = previousTitle;
    root.remove();
    style.remove();
  };
  window.addEventListener('afterprint', cleanup, { once: true });
  window.setTimeout(cleanup, 120000);

  window.focus();
  window.print();
}

function companyBlock(business: BusinessProfile): string {
  return `
    <div class="header-left">
      <p class="brand">${escapeHtml(business.businessName)}</p>
      <p class="muted">${escapeHtml(business.address || '')}</p>
      ${business.phone ? `<p class="muted">Phone: ${escapeHtml(business.phone)}</p>` : ''}
      ${business.email ? `<p class="muted">Email: ${escapeHtml(business.email)}</p>` : ''}
      ${business.taxNumber ? `<p class="muted">GSTIN: ${escapeHtml(business.taxNumber)}</p>` : ''}
    </div>
  `;
}

function applyPdfHeader(doc: jsPDF, business: BusinessProfile, title: string, subtitle?: string): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const left = 14;
  const right = pageWidth - 14;
  const titleCol = 58;
  const infoWidth = right - left - titleCol - 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  const nameLines = doc.splitTextToSize(business.businessName, infoWidth);
  doc.text(nameLines, left, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80);
  let y = 16 + nameLines.length * 5;
  const details = [
    business.address,
    [business.phone ? `Phone: ${business.phone}` : '', business.email ? `Email: ${business.email}` : '']
      .filter(Boolean)
      .join('   |   '),
    business.taxNumber ? `GSTIN: ${business.taxNumber}` : '',
  ].filter(Boolean);

  details.forEach((line) => {
    const wrapped = doc.splitTextToSize(String(line), infoWidth);
    doc.text(wrapped, left, y);
    y += wrapped.length * 4.2;
  });

  doc.setTextColor(225, 31, 43);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  const titleLines = doc.splitTextToSize(title, titleCol);
  doc.text(titleLines, right, 16, { align: 'right' });

  if (subtitle) {
    doc.setTextColor(80);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const subLines = doc.splitTextToSize(subtitle, titleCol);
    doc.text(subLines, right, 16 + titleLines.length * 5.2, { align: 'right' });
  }

  const lineY = Math.max(y, 30) + 3;
  doc.setDrawColor(225, 31, 43);
  doc.setLineWidth(0.6);
  doc.line(left, lineY, right, lineY);
  doc.setTextColor(15, 23, 42);
  return lineY + 8;
}

function drawTotalsBox(doc: jsPDF, startY: number, rows: Array<[string, string]>) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const tableWidth = 92;
  autoTable(doc, {
    startY,
    body: rows,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3.5, overflow: 'linebreak', valign: 'middle' },
    columnStyles: {
      0: { cellWidth: 52, fontStyle: 'bold', textColor: [51, 65, 85] },
      1: { cellWidth: 40, halign: 'right', fontStyle: 'bold', textColor: [15, 23, 42] },
    },
    margin: { left: pageWidth - 14 - tableWidth, right: 14 },
    tableWidth,
  });
}

function drawSummaryTable(doc: jsPDF, startY: number, rows: Array<[string, string]>) {
  const pageWidth = doc.internal.pageSize.getWidth();
  autoTable(doc, {
    startY,
    head: [rows.map(([label]) => label)],
    body: [rows.map(([, value]) => value)],
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 4,
      halign: 'center',
      overflow: 'linebreak',
      valign: 'middle',
    },
    headStyles: { fillColor: [248, 250, 252], textColor: [51, 65, 85], fontStyle: 'bold' },
    bodyStyles: { fontStyle: 'bold', textColor: [15, 23, 42] },
    margin: { left: 14, right: 14 },
    tableWidth: pageWidth - 28,
  });
}

export function printSaleInvoice(sale: Sale, business?: BusinessProfile) {
  const company = business || FALLBACK_BUSINESS;
  const customer = sale.customerId as Customer;
  const body = `
    <div class="header">
      ${companyBlock(company)}
      <div class="header-right">
        <p class="doc-title">TAX INVOICE</p>
        <p><strong>${escapeHtml(sale.invoiceNumber)}</strong></p>
        <p class="muted">Date: ${formatDate(sale.saleDate)}</p>
        <p class="muted">${sale.paymentStatus} / ${sale.status}</p>
      </div>
    </div>
    <div class="section">
      <h3>Billed To</h3>
      <p><strong>${escapeHtml(customer?.name || 'Walk-in Customer')}</strong></p>
      ${customer?.company ? `<p class="muted">${escapeHtml(customer.company)}</p>` : ''}
      ${customer?.phone ? `<p class="muted">Phone: ${escapeHtml(customer.phone)}</p>` : ''}
      ${customer?.address ? `<p class="muted">${escapeHtml(customer.address)}</p>` : ''}
      ${customer?.taxNumber ? `<p class="muted">GST: ${escapeHtml(customer.taxNumber)}</p>` : ''}
    </div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Product</th>
          <th>SKU</th>
          <th class="right">Qty</th>
          <th class="right">Unit Price</th>
          <th class="right">Disc</th>
          <th class="right">Tax</th>
          <th class="right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${(sale.items || [])
          .map(
            (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(item.productNameSnapshot || '')}</td>
            <td>${escapeHtml(item.skuSnapshot || '-')}</td>
            <td class="right">${item.quantity} ${escapeHtml(item.unitSnapshot || '')}</td>
            <td class="right">${rupees(item.sellingPrice)}</td>
            <td class="right">${item.discount ? rupees(item.discount) : '-'}</td>
            <td class="right">${item.tax ? rupees(item.tax) : '-'}</td>
            <td class="right">${rupees(item.total)}</td>
          </tr>`,
          )
          .join('')}
      </tbody>
    </table>
    <table class="summary summary-box">
      <tbody>
        <tr><td>Subtotal</td><td class="right">${rupees(sale.subtotal)}</td></tr>
        ${sale.discount ? `<tr><td>Discount</td><td class="right">- ${rupees(sale.discount)}</td></tr>` : ''}
        <tr><td>GST Tax</td><td class="right">+ ${rupees(sale.tax)}</td></tr>
        <tr><td>Grand Total</td><td class="right">${rupees(sale.total)}</td></tr>
        <tr><td class="paid">Paid</td><td class="right paid">${rupees(sale.paidAmount)}</td></tr>
        <tr><td class="${sale.dueAmount > 0 ? 'due' : 'paid'}">Balance Due</td><td class="right ${sale.dueAmount > 0 ? 'due' : 'paid'}">${rupees(sale.dueAmount)}</td></tr>
      </tbody>
    </table>
  `;
  printHtmlDocument(sale.invoiceNumber, body);
}

export function downloadSaleInvoicePdf(sale: Sale, business?: BusinessProfile) {
  const company = business || FALLBACK_BUSINESS;
  const customer = sale.customerId as Customer;
  const doc = new jsPDF();
  const contentStart = applyPdfHeader(
    doc,
    company,
    'TAX INVOICE',
    `${sale.invoiceNumber} | ${formatDate(sale.saleDate)}`,
  );

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Billed To', 14, contentStart);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const billed = [
    customer?.name || 'Walk-in Customer',
    customer?.company,
    customer?.phone ? `Phone: ${customer.phone}` : '',
    customer?.address,
    customer?.taxNumber ? `GST: ${customer.taxNumber}` : '',
  ].filter(Boolean) as string[];
  const billedLines = doc.splitTextToSize(billed.join('\n'), 110);
  doc.text(billedLines, 14, contentStart + 6);

  const paymentLines = doc.splitTextToSize(
    [`Payment: ${sale.paymentMethod || '-'}`, `Status: ${sale.paymentStatus} / ${sale.status}`].join('\n'),
    60,
  );
  doc.text(paymentLines, doc.internal.pageSize.getWidth() - 14, contentStart, { align: 'right' });

  const tableStart = contentStart + Math.max(billedLines.length, 3) * 5 + 10;

  autoTable(doc, {
    startY: tableStart,
    head: [['#', 'Product', 'SKU', 'Qty', 'Unit Price', 'Disc', 'Tax', 'Total']],
    body: (sale.items || []).map((item, index) => [
      index + 1,
      item.productNameSnapshot,
      item.skuSnapshot || '-',
      `${item.quantity} ${item.unitSnapshot || ''}`.trim(),
      rupees(item.sellingPrice),
      item.discount ? rupees(item.discount) : '-',
      item.tax ? rupees(item.tax) : '-',
      rupees(item.total),
    ]),
    styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak', valign: 'middle' },
    headStyles: { fillColor: [225, 31, 43], textColor: 255, halign: 'center' },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 48 },
      2: { cellWidth: 24 },
      3: { cellWidth: 18, halign: 'right' },
      4: { cellWidth: 24, halign: 'right' },
      5: { cellWidth: 18, halign: 'right' },
      6: { cellWidth: 18, halign: 'right' },
      7: { cellWidth: 22, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
    tableWidth: doc.internal.pageSize.getWidth() - 28,
  });

  const endY = (doc as any).lastAutoTable?.finalY || tableStart + 20;
  drawTotalsBox(doc, endY + 8, [
    ['Subtotal', rupees(sale.subtotal)],
    ...(sale.discount ? [['Discount', `- ${rupees(sale.discount)}`] as [string, string]] : []),
    ['GST Tax', `+ ${rupees(sale.tax)}`],
    ['Grand Total', rupees(sale.total)],
    ['Paid', rupees(sale.paidAmount)],
    ['Balance Due', rupees(sale.dueAmount)],
  ]);

  doc.save(`${sale.invoiceNumber}.pdf`);
}

export function printCustomerLedger(options: {
  customer: Customer;
  sales: Sale[];
  payments: Payment[];
  from?: string;
  to?: string;
  business?: BusinessProfile;
}) {
  const { customer, sales, payments, from, to } = options;
  const company = options.business || FALLBACK_BUSINESS;
  const invoiced = sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
  const received = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const body = `
    <div class="header">
      ${companyBlock(company)}
      <div class="header-right">
        <p class="doc-title">CUSTOMER LEDGER</p>
        <p class="muted">Period: ${periodLabel(from, to)}</p>
        <p class="muted">Generated: ${formatDate(new Date())}</p>
      </div>
    </div>
    <div class="section">
      <h3>Customer Details</h3>
      <p><strong>${escapeHtml(customer.name)}</strong> ${customer.company ? `• ${escapeHtml(customer.company)}` : ''}</p>
      <p class="muted">Code: ${escapeHtml(customer.customerCode || '-')} | Type: ${escapeHtml(customer.customerType || '-')}</p>
      <p class="muted">Phone: ${escapeHtml(customer.phone || '-')} | Email: ${escapeHtml(customer.email || '-')}</p>
      <p class="muted">${escapeHtml([customer.address, customer.city, customer.state].filter(Boolean).join(', ') || '-')}</p>
    </div>
    <div class="section">
      <h3>Invoices / Orders</h3>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Invoice</th>
            <th>Date</th>
            <th>Status</th>
            <th class="right">Total</th>
            <th class="right">Paid</th>
            <th class="right">Due</th>
          </tr>
        </thead>
        <tbody>
          ${
            sales.length
              ? sales
                  .map(
                    (sale, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${escapeHtml(sale.invoiceNumber)}</td>
              <td>${formatDate(sale.saleDate)}</td>
              <td>${sale.paymentStatus}</td>
              <td class="right">${rupees(sale.total)}</td>
              <td class="right">${rupees(sale.paidAmount)}</td>
              <td class="right">${rupees(sale.dueAmount)}</td>
            </tr>`,
                  )
                  .join('')
              : '<tr><td colspan="7">No invoices in this period</td></tr>'
          }
        </tbody>
      </table>
    </div>
    <div class="section">
      <h3>Payment Receipts</h3>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Receipt</th>
            <th>Date</th>
            <th>Method</th>
            <th class="right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${
            payments.length
              ? payments
                  .map(
                    (payment, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${escapeHtml(payment.paymentNumber)}</td>
              <td>${formatDate(payment.paymentDate)}</td>
              <td>${escapeHtml(payment.paymentMethod)}</td>
              <td class="right">${rupees(payment.amount)}</td>
            </tr>`,
                  )
                  .join('')
              : '<tr><td colspan="5">No payments in this period</td></tr>'
          }
        </tbody>
      </table>
    </div>
    <table class="summary summary-wide">
      <thead>
        <tr>
          <th>Invoices in period</th>
          <th>Receipts in period</th>
          <th>Account outstanding</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="right">${rupees(invoiced)}</td>
          <td class="right paid">${rupees(received)}</td>
          <td class="right due">${rupees(customer.totalDue)}</td>
        </tr>
      </tbody>
    </table>
  `;
  printHtmlDocument(`${customer.customerCode || customer.name}-ledger`, body);
}

export function downloadCustomerLedgerPdf(options: {
  customer: Customer;
  sales: Sale[];
  payments: Payment[];
  from?: string;
  to?: string;
  business?: BusinessProfile;
}) {
  const { customer, sales, payments, from, to } = options;
  const company = options.business || FALLBACK_BUSINESS;
  const invoiced = sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
  const received = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const doc = new jsPDF();
  const contentStart = applyPdfHeader(doc, company, 'CUSTOMER LEDGER', `Period: ${periodLabel(from, to)}`);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(customer.name, 14, contentStart);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const customerLines = [
    `${customer.company || 'Direct Client'}  |  Code: ${customer.customerCode || '-'}  |  Type: ${customer.customerType || '-'}`,
    `Phone: ${customer.phone || '-'}  |  Email: ${customer.email || '-'}`,
    [customer.address, customer.city, customer.state].filter(Boolean).join(', ') || '-',
  ].map((line) => doc.splitTextToSize(line, doc.internal.pageSize.getWidth() - 28));
  let customerY = contentStart + 6;
  customerLines.forEach((wrapped) => {
    doc.text(wrapped, 14, customerY);
    customerY += wrapped.length * 4.4;
  });

  autoTable(doc, {
    startY: customerY + 6,
    head: [['#', 'Invoice', 'Date', 'Status', 'Total', 'Paid', 'Due']],
    body: sales.length
      ? sales.map((sale, index) => [
          index + 1,
          sale.invoiceNumber,
          formatDate(sale.saleDate),
          sale.paymentStatus,
          rupees(sale.total),
          rupees(sale.paidAmount),
          rupees(sale.dueAmount),
        ])
      : [['-', 'No invoices in this period', '-', '-', '-', '-', '-']],
    styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak', valign: 'middle' },
    headStyles: { fillColor: [225, 31, 43], textColor: 255, halign: 'center' },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 36 },
      2: { cellWidth: 28 },
      3: { cellWidth: 22, halign: 'center' },
      4: { cellWidth: 28, halign: 'right' },
      5: { cellWidth: 28, halign: 'right' },
      6: { cellWidth: 28, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
    tableWidth: doc.internal.pageSize.getWidth() - 28,
  });

  const afterInvoices = (doc as any).lastAutoTable?.finalY || customerY + 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Payment Receipts', 14, afterInvoices + 10);

  autoTable(doc, {
    startY: afterInvoices + 14,
    head: [['#', 'Receipt', 'Date', 'Method', 'Amount']],
    body: payments.length
      ? payments.map((payment, index) => [
          index + 1,
          payment.paymentNumber,
          formatDate(payment.paymentDate),
          payment.paymentMethod,
          rupees(payment.amount),
        ])
      : [['-', 'No payments in this period', '-', '-', '-']],
    styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak', valign: 'middle' },
    headStyles: { fillColor: [15, 23, 42], textColor: 255, halign: 'center' },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 44 },
      2: { cellWidth: 36 },
      3: { cellWidth: 40 },
      4: { cellWidth: 50, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
    tableWidth: doc.internal.pageSize.getWidth() - 28,
  });

  const afterPayments = (doc as any).lastAutoTable?.finalY || afterInvoices + 40;
  drawSummaryTable(doc, afterPayments + 10, [
    ['Invoices in period', rupees(invoiced)],
    ['Receipts in period', rupees(received)],
    ['Account outstanding', rupees(customer.totalDue)],
  ]);

  const safeName = (customer.customerCode || customer.name || 'customer').replace(/[^\w-]+/g, '_');
  doc.save(`${safeName}-ledger.pdf`);
}
