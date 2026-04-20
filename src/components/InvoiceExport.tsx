import React from 'react';
import { jsPDF } from 'jspdf';
import { Download } from 'lucide-react';

interface InvoiceExportProps {
  ride: any;
  computedTotal: number;
  computedGst: number;
}

export default function InvoiceExport({ ride, computedTotal, computedGst }: InvoiceExportProps) {
  const exportPDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;

    const addText = (text: string, x: number, yPos: number, size = 10, bold = false, color = [31, 41, 55]) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(size);
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(text, x, yPos);
    };

    // Header section
    addText('ARA TRAVELS', margin, y, 24, true, [211, 47, 47]);
    addText('INVOICE', 190, y, 12, true, [100, 100, 100]);
    doc.text(`#${ride?.customId || ride?.id || ''}`, 190, y + 8, { align: 'right' });
    y += 25;

    // Billing details
    addText('Billed To:', margin, y, 9, true, [150, 150, 150]);
    addText('From:', 120, y, 9, true, [150, 150, 150]);
    y += 6;
    addText(ride?.user?.name || 'Customer', margin, y, 11, true);
    addText('ARA Travels Ride Hailing', 120, y, 11, true);
    y += 5;
    addText(`+${ride?.user?.phone || ''}`, margin, y, 10);
    addText('Contact: support@ara-travels.com', 120, y, 10);
    y += 20;

    // Ride Details
    doc.setDrawColor(240);
    doc.line(margin, y, 190, y);
    y += 10;
    addText('Ride Route:', margin, y, 9, true, [150, 150, 150]);
    y += 6;
    const pickup = doc.splitTextToSize(`Pickup: ${ride?.pickupAddress || 'N/A'}`, 160);
    doc.text(pickup, margin, y);
    y += (pickup.length * 5) + 2;
    const drop = doc.splitTextToSize(`Drop: ${ride?.dropAddress || 'N/A'}`, 160);
    doc.text(drop, margin, y);
    y += (drop.length * 5) + 10;

    // Pricing Table
    doc.setFillColor(245, 247, 250);
    doc.rect(margin, y, 170, 8, 'F');
    addText('Description', margin + 2, y + 5.5, 9, true);
    doc.text('Amount', 188, y + 5.5, { align: 'right' });
    y += 12;

    const extraKmCharges = Math.max(0, (ride?.distanceKm || 0) * (ride?.perKmPrice || 0));
    const items = [
      ['Base Fare', ride?.baseFare || 0],
      ['Extra KM Charges', extraKmCharges],
      ['GST (5%)', computedGst || 0],
      ['Permit', ride?.taxes || 0],
      ['Tolls & Additional', (ride?.tollCharges || 0) + (ride?.additionalCharges || 0)],
    ];

    items.forEach(([label, value]) => {
      addText(label as string, margin + 2, y, 10);
      doc.text(`Rs. ${Number(value).toFixed(2)}`, 188, y, { align: 'right' });
      y += 8;
    });

    if (ride?.partnerManualDiscount) {
      const isPositive = ride.partnerManualDiscount < 0;
      addText(isPositive ? 'Manual Adjustment (+)' : 'Manual Discount (-)', margin + 2, y, 10, false, [200, 0, 0]);
      doc.text(`${isPositive ? '+' : '-'}Rs. ${Math.abs(ride.partnerManualDiscount).toFixed(2)}`, 188, y, { align: 'right' });
      y += 10;
    }

    // Final Total
    y += 5;
    doc.setFillColor(31, 41, 55);
    doc.rect(margin, y, 170, 12, 'F');
    doc.setTextColor(255);
    doc.setFontSize(12);
    doc.text('TOTAL AMOUNT', margin + 5, y + 8);
    doc.text(`Rs. ${Number(computedTotal || 0).toFixed(2)}`, 188, y + 8, { align: 'right' });

    doc.save(`ARA_Travels_Invoice_${ride?.customId || 'Ride'}.pdf`);
  };

  return (
    <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 bg-[#673AB7] text-white rounded-lg hover:bg-[#512DA8] transition shadow font-bold text-xs uppercase">
      <Download size={16} /> Export Invoice
    </button>
  );
}
