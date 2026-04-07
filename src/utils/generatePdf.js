import html2pdf from 'html2pdf.js';
import { format } from 'date-fns';

const CURRENCY_SYMBOLS = { USD: '$', CAD: 'C$', CRC: '₡' };
const MAX_IMG_WIDTH = 800;
const MAX_IMG_HEIGHT = 800;
const IMG_QUALITY = 0.6;

function formatAmount(amount, currency = 'USD') {
  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  return `${symbol}${Number(amount).toFixed(2)}`;
}

function compressImage(dataUrl) {
  return new Promise((resolve) => {
    if (!dataUrl) return resolve(dataUrl);
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_IMG_WIDTH || height > MAX_IMG_HEIGHT) {
        const ratio = Math.min(MAX_IMG_WIDTH / width, MAX_IMG_HEIGHT / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', IMG_QUALITY));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export async function generatePdf(data) {
  const { expenses, documents, writeup, claimInfo } = data;
  const totals = expenses.reduce((acc, e) => {
    const cur = e.currency || 'USD';
    acc[cur] = (acc[cur] || 0) + Number(e.amount);
    return acc;
  }, {});
  const totalLine = Object.entries(totals).map(([cur, amt]) => formatAmount(amt, cur)).join(' + ');
  const today = format(new Date(), 'MMMM d, yyyy');

  // Compress all embedded images
  for (const e of expenses) {
    if (e.receipt) e.receipt = await compressImage(e.receipt);
  }
  for (const d of documents) {
    if (d.fileData && d.fileType && d.fileType.startsWith('image/')) {
      d.fileData = await compressImage(d.fileData);
    }
  }

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; max-width: 800px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; border-bottom: 3px solid #1e3a5f; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px; color: #1e3a5f;">Lost Baggage Claim Report</h1>
        <p style="margin: 8px 0 0; color: #666; font-size: 14px;">Generated on ${today}</p>
      </div>

      <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 30px; page-break-inside: avoid;">
        <h2 style="margin: 0 0 15px; font-size: 18px; color: #1e3a5f;">Claim Information</h2>
        <table style="width: 100%; border-collapse: collapse;">
          ${claimInfo.airline ? `<tr><td style="padding: 6px 12px 6px 0; font-weight: 600; width: 180px; vertical-align: top;">Airline:</td><td style="padding: 6px 0;">${claimInfo.airline}</td></tr>` : ''}
          ${claimInfo.flightNumber ? `<tr><td style="padding: 6px 12px 6px 0; font-weight: 600; vertical-align: top;">Flight Number:</td><td style="padding: 6px 0;">${claimInfo.flightNumber}</td></tr>` : ''}
          ${claimInfo.flightDate ? `<tr><td style="padding: 6px 12px 6px 0; font-weight: 600; vertical-align: top;">Flight Date:</td><td style="padding: 6px 0;">${claimInfo.flightDate}</td></tr>` : ''}
          ${claimInfo.bagTagNumbers ? `<tr><td style="padding: 6px 12px 6px 0; font-weight: 600; vertical-align: top;">Bag Tag Numbers:</td><td style="padding: 6px 0;">${claimInfo.bagTagNumbers}</td></tr>` : ''}
          ${claimInfo.referenceNumber ? `<tr><td style="padding: 6px 12px 6px 0; font-weight: 600; vertical-align: top;">Reference / PIR Number:</td><td style="padding: 6px 0;">${claimInfo.referenceNumber}</td></tr>` : ''}
          ${claimInfo.passengerNames ? `<tr><td style="padding: 6px 12px 6px 0; font-weight: 600; vertical-align: top;">Passenger Name(s):</td><td style="padding: 6px 0;">${claimInfo.passengerNames}</td></tr>` : ''}
          ${claimInfo.description ? `<tr><td style="padding: 6px 12px 6px 0; font-weight: 600; vertical-align: top;">Description of Bag:</td><td style="padding: 6px 0;">${claimInfo.description}</td></tr>` : ''}
        </table>
      </div>

      ${writeup ? `
      <div style="margin-bottom: 30px; page-break-inside: avoid;">
        <h2 style="font-size: 18px; color: #1e3a5f; border-bottom: 2px solid #e0e0e0; padding-bottom: 8px;">Statement / Write-Up</h2>
        <div style="white-space: pre-wrap; line-height: 1.7; font-size: 14px;">${writeup}</div>
      </div>
      ` : ''}

      <div style="margin-bottom: 30px;">
        <h2 style="font-size: 18px; color: #1e3a5f; border-bottom: 2px solid #e0e0e0; padding-bottom: 8px;">Expense Summary</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr style="background: #1e3a5f; color: white;">
              <th style="padding: 10px 12px; text-align: left; font-size: 13px;">Date</th>
              <th style="padding: 10px 12px; text-align: left; font-size: 13px;">Category</th>
              <th style="padding: 10px 12px; text-align: left; font-size: 13px;">Description</th>
              <th style="padding: 10px 12px; text-align: right; font-size: 13px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${expenses.map((e, i) => `
              <tr style="background: ${i % 2 === 0 ? '#ffffff' : '#f8f9fa'}; border-bottom: 1px solid #e0e0e0; page-break-inside: avoid;">
                <td style="padding: 10px 12px; font-size: 13px;">${e.date}</td>
                <td style="padding: 10px 12px; font-size: 13px;">${e.category}</td>
                <td style="padding: 10px 12px; font-size: 13px;">${e.description}${e.notes ? `<br/><span style="color: #666; font-size: 12px;">${e.notes}</span>` : ''}</td>
                <td style="padding: 10px 12px; text-align: right; font-size: 13px;">${formatAmount(e.amount, e.currency)}</td>
              </tr>
            `).join('')}
            <tr style="background: #1e3a5f; color: white; font-weight: 700; page-break-inside: avoid;">
              <td colspan="3" style="padding: 12px; font-size: 14px;">TOTAL</td>
              <td style="padding: 12px; text-align: right; font-size: 14px;">${totalLine}</td>
            </tr>
          </tbody>
        </table>
      </div>

      ${expenses.filter(e => e.receipt).length > 0 ? `
      <div style="margin-bottom: 30px; page-break-before: always;">
        <h2 style="font-size: 18px; color: #1e3a5f; border-bottom: 2px solid #e0e0e0; padding-bottom: 8px;">Receipts</h2>
        ${expenses.filter(e => e.receipt).map(e => `
          <div style="margin-bottom: 25px; page-break-inside: avoid;">
            <p style="font-weight: 600; margin-bottom: 8px; font-size: 14px;">${e.description} — ${formatAmount(e.amount, e.currency)} (${e.date})</p>
            <img src="${e.receipt}" style="max-width: 100%; max-height: 600px; border: 1px solid #ddd; border-radius: 4px;" />
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${documents.length > 0 ? `
      <div style="page-break-before: always;">
        <h2 style="font-size: 18px; color: #1e3a5f; border-bottom: 2px solid #e0e0e0; padding-bottom: 8px;">Supporting Documents</h2>
        ${documents.map(d => `
          <div style="margin-bottom: 25px; page-break-inside: avoid;">
            <p style="font-weight: 600; margin-bottom: 4px; font-size: 14px;">${d.name}</p>
            ${d.notes ? `<p style="color: #666; font-size: 13px; margin-bottom: 8px;">${d.notes}</p>` : ''}
            ${d.fileData && d.fileType && d.fileType.startsWith('image/') ? `<img src="${d.fileData}" style="max-width: 100%; max-height: 600px; border: 1px solid #ddd; border-radius: 4px;" />` : `<p style="color: #999; font-style: italic; font-size: 13px;">[Attached file: ${d.fileName}]</p>`}
          </div>
        `).join('')}
      </div>
      ` : ''}
    </div>
  `;

  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);

  const opt = {
    margin: [10, 10, 10, 10],
    filename: `baggage-claim-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`,
    image: { type: 'jpeg', quality: 0.7 },
    html2canvas: { scale: 1.5, useCORS: true },
    jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  };

  await html2pdf().set(opt).from(container).save();
  document.body.removeChild(container);
}
