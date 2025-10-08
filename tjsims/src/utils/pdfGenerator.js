import jsPDF from 'jspdf';

// Utility function to format currency
const formatCurrency = (amount) => {
  return `P${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Utility function to format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Generate Sales Report PDF
export const generateSalesReportPDF = async (salesData, startDate, endDate, adminName) => {
  const doc = new jsPDF();

  // Header section - centered
  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = pageWidth / 2;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');

  // TJC Auto Supply (centered)
  doc.text('TJC Auto Supply', centerX, 25, { align: 'center' });

  // Sales Report (centered)
  doc.text('Sales Report', centerX, 35, { align: 'center' });

  // Date range (centered)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Period: ${formatDate(startDate)} - ${formatDate(endDate)}`, centerX, 45, { align: 'center' });

  // Filter data by date range
  const filteredData = salesData.filter(item => {
    const itemDate = new Date(item.orderDate);
    return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
  });

  // Flatten the filtered data for table display
  const flattenedData = filteredData.flatMap(order =>
    order.items.map(item => ({
      orderId: order.orderId,
      customerName: order.customerName,
      orderDate: order.orderDate,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice
    }))
  );

  let yPosition = 60;

  // Draw separator line
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 10;

  // Table headers
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');

  const colPositions = {
    date: 25,
    productName: 50,
    quantity: 110,
    unitPrice: 125,
    totalSales: 150
  };

  doc.text('Date', colPositions.date, yPosition);
  doc.text('Product Name', colPositions.productName, yPosition);
  doc.text('Qty', colPositions.quantity, yPosition);
  doc.text('Unit Price', colPositions.unitPrice, yPosition);
  doc.text('Total', colPositions.totalSales, yPosition);

  yPosition += 8;

  // Draw table header line
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 5;

  // Table data
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);

  let grandTotal = 0;

  flattenedData.forEach((item, index) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 30;

      // Repeat headers on new page
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Date', colPositions.date, yPosition);
      doc.text('Product Name', colPositions.productName, yPosition);
      doc.text('Qty', colPositions.quantity, yPosition);
      doc.text('Unit Price', colPositions.unitPrice, yPosition);
      doc.text('Total', colPositions.totalSales, yPosition);

      yPosition += 8;
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
    }

    const maxProductNameLength = 30;
    const productName = item.productName.length > maxProductNameLength
      ? item.productName.substring(0, maxProductNameLength) + '...'
      : item.productName;

    doc.text(item.orderDate, colPositions.date, yPosition);
    doc.text(productName, colPositions.productName, yPosition);
    doc.text(item.quantity.toString(), colPositions.quantity, yPosition);
    doc.text(formatCurrency(item.unitPrice), colPositions.unitPrice, yPosition);
    doc.text(formatCurrency(item.totalPrice), colPositions.totalSales, yPosition);

    grandTotal += item.totalPrice;
    yPosition += 6;
  });

  // Draw line below table
  yPosition += 5;
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 10;

  // Grand Total row
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Grand Total:', 120, yPosition);
  doc.text(formatCurrency(grandTotal), 150, yPosition);
  yPosition += 10;

  // Draw line below grand total
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 15;

  // Calculate summary data
  const totalRevenue = filteredData.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalItems = filteredData.reduce((sum, order) => {
    return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
  }, 0);
  const totalTransactions = filteredData.length;
  const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  // Find best selling product
  const productCounts = {};
  filteredData.forEach(order => {
    order.items.forEach(item => {
      productCounts[item.productName] = (productCounts[item.productName] || 0) + item.quantity;
    });
  });
  const bestSellingProduct = Object.keys(productCounts).reduce((a, b) =>
    productCounts[a] > productCounts[b] ? a : b, 'N/A');

  // Summary section
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Sales Summary', centerX, yPosition, { align: 'center' });
  yPosition += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  // First row: Total Revenue and Average transaction value
  doc.text(`Total Revenue: ${formatCurrency(totalRevenue)}`, 25, yPosition);
  const avgText = `Average transaction value: ${formatCurrency(avgTransactionValue)}`;
  doc.text(avgText, centerX + 20, yPosition, { align: 'left' });
  yPosition += 8;

  // Second row: Total Items sold and Best selling product
  doc.text(`Total Items sold: ${totalItems}`, 25, yPosition);
  doc.text(`Best selling product: ${bestSellingProduct}`, centerX + 20, yPosition, { align: 'left' });
  yPosition += 8;

  // Third row: Number of transactions
  doc.text(`Number of transactions: ${totalTransactions}`, 25, yPosition);
  yPosition += 15;

  // Draw line below summary
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 15;

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Generated by and Report Generated on same line
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated by: ${adminName}`, 25, 280);
    doc.text(`Report Generated: ${formatDate(new Date().toISOString().split('T')[0])}`, 120, 280);

    // Page _ of _ centered
    doc.text(`Page ${i} of ${pageCount}`, centerX, 285, { align: 'center' });
  }

  return doc;
};

// Generate Inventory Report PDF
export const generateInventoryReportPDF = async (inventoryData, startDate, endDate, adminName) => {
  const doc = new jsPDF();

  try {
    // Add TJC logo
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('TJC', 20, 35);

    // Header with title
    doc.setFontSize(18);
    doc.text('Inventory Report', 60, 35);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Period: ${formatDate(startDate)} - ${formatDate(endDate)}`, 20, 50);
  } catch (error) {
    console.warn('Could not load logo:', error);
    // Fallback header without logo
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('TJSIMS', 20, 30);

    doc.setFontSize(16);
    doc.text('Inventory Report', 20, 45);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Period: ${formatDate(startDate)} - ${formatDate(endDate)}`, 20, 55);
  }

  // Filter data by date range (inventory reports typically don't filter by date, but keeping for consistency)
  const filteredData = inventoryData; // You might want to filter by last updated date if available

  // Inventory table
  let yPosition = 70;

  // Table headers
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');

  // Column positions
  const colPositions = {
    productName: 20,
    category: 65,
    brand: 100,
    quantity: 135,
    status: 160
  };

  doc.text('Product Name', colPositions.productName, yPosition);
  doc.text('Category', colPositions.category, yPosition);
  doc.text('Brand', colPositions.brand, yPosition);
  doc.text('Remaining Qty', colPositions.quantity, yPosition);
  doc.text('Status', colPositions.status, yPosition);

  yPosition += 8;

  // Draw table header line
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 5;

  // Table data
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  filteredData.forEach((item, index) => {
    if (yPosition > 250) { // Check if we need a new page
      doc.addPage();
      yPosition = 30;

      // Repeat headers on new page
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Product Name', colPositions.productName, yPosition);
      doc.text('Category', colPositions.category, yPosition);
      doc.text('Brand', colPositions.brand, yPosition);
      doc.text('Remaining Qty', colPositions.quantity, yPosition);
      doc.text('Status', colPositions.status, yPosition);

      yPosition += 8;
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
    }

    // Ensure text fits in columns
    const maxProductNameLength = 35;
    const productName = item.productName.length > maxProductNameLength
      ? item.productName.substring(0, maxProductNameLength) + '...'
      : item.productName;

    doc.text(productName, colPositions.productName, yPosition);
    doc.text(item.category, colPositions.category, yPosition);
    doc.text(item.brand, colPositions.brand, yPosition);
    doc.text(item.currentStock.toString(), colPositions.quantity, yPosition);
    doc.text(item.stockStatus, colPositions.status, yPosition);

    yPosition += 6;
  });

  // Draw line below table
  yPosition += 5;
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 10;

  // Calculate summary data
  const totalItems = filteredData.length;
  const lowStockItems = filteredData.filter(item => item.stockStatus === 'Low Stock').length;
  const totalRemaining = filteredData.reduce((sum, item) => sum + item.currentStock, 0);

  // Summary section
  if (yPosition > 200) {
    doc.addPage();
    yPosition = 30;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Inventory Summary', 20, yPosition);
  yPosition += 12;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Items: ${totalItems}`, 20, yPosition);
  yPosition += 6;
  doc.text(`Low Stock Items: ${lowStockItems}`, 20, yPosition);
  yPosition += 6;
  doc.text(`Total Remaining: ${totalRemaining}`, 20, yPosition);

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated by: ${adminName}`, 20, 280);
    doc.text(`Report Generated: ${formatDate(new Date().toISOString().split('T')[0])}`, 20, 285);
    doc.text(`Page ${i} of ${pageCount}`, 180, 285);
  }

  return doc;
};
