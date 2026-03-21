export const exportToCSV = (data: any[], filename: string) => {
  if (!data || !data.length) return;

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  const headers = Object.keys(data[0]);

  const csvRows = [];
  // Header row
  csvRows.push(headers.join(','));

  // Data rows
  for (const row of data) {
    const values = headers.map(header => {
      let val = getNestedValue(row, header);
      
      // Handle objects/arrays formatting for pure CSV
      if (typeof val === 'object' && val !== null) {
        val = JSON.stringify(val);
      }
      
      // Escape quotes and wrap in quotes to prevent comma breaking
      const stringVal = String(val || '');
      const escapedVal = stringVal.replace(/"/g, '""');
      return `"${escapedVal}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
