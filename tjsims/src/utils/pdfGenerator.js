import jsPDF from 'jspdf';
import logoUrl from '../assets/tcj_logo.png?url';

// Helper to load image URL into DataURL for jsPDF
const loadImageAsDataURL = async (url) => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

// Utility function to format currency
const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return `P${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = pageWidth / 2;

  const logoDataUrl = await loadImageAsDataURL(logoUrl);

  // Header section - centered
  // Header with logo and titles
if (logoDataUrl) {
  const pageWidth = doc.internal.pageSize.getWidth(); // page width
  const imgWidth = 30; // image width
  const imgHeight = 22; // image height
  const x = (pageWidth - imgWidth) / 2; // center horizontally
  const y = 12; // top margin
  doc.addImage(logoDataUrl, 'PNG', x, y, imgWidth, imgHeight);

  const centerX = pageWidth / 2;

  // Title
  const titleY = y + imgHeight + 5; // 5 = space below image
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Sales Report', centerX, titleY, { align: 'center' });

  // Date / period
  const dateY = titleY + 7; // 7 = space below title
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Period: ${formatDate(startDate)} - ${formatDate(endDate)}`, centerX, dateY, { align: 'center' });
}

  // Filter data by date range
  // Filter orders by date and status (Completed only)
  const filteredOrders = (salesData || []).filter(order => {
    const d = new Date(order.orderDate);
    const withinRange = d >= new Date(startDate) && d <= new Date(endDate);
    const isCompleted = (order.status ?? 'Completed') === 'Completed';
    return withinRange && isCompleted;
  });

  // Flatten the filtered data for table display
  const flattenedData = filteredOrders.flatMap(order =>
    order.items.map(item => ({
      orderId: order.orderId,
      customerName: order.customerName,
      orderDate: order.orderDate,
      productName: item.productName,
      quantity: Number(item.quantity) || 0,
      unitPrice: Number(item.unitPrice) || 0,
      totalPrice: Number(item.totalPrice) || 0
    }))
  );

  let yPosition = 50;

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

    doc.text(formatDate(item.orderDate), colPositions.date, yPosition);
    doc.text(productName, colPositions.productName, yPosition);
    doc.text((Number(item.quantity) || 0).toString(), colPositions.quantity, yPosition);
    doc.text(formatCurrency(Number(item.unitPrice) || 0), colPositions.unitPrice, yPosition);
    doc.text(formatCurrency(Number(item.totalPrice) || 0), colPositions.totalSales, yPosition);

    grandTotal += (Number(item.totalPrice) || 0);
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
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);
  const totalItems = filteredOrders.reduce((sum, order) => {
    return sum + order.items.reduce((itemSum, item) => itemSum + (Number(item.quantity) || 0), 0);
  }, 0);
  const totalTransactions = filteredOrders.length;
  const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  // Find best selling product
  const productCounts = {};
  filteredOrders.forEach(order => {
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

  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Header: Logo + Title + Period
  try {
    const logoDataUrl = await loadImageAsDataURL(logoUrl);// replace with your logo loading function
    const imgWidth = 30;
    const imgHeight = 22;
    const x = (pageWidth - imgWidth) / 2;
    doc.addImage(logoDataUrl, 'PNG', x, yPosition, imgWidth, imgHeight);
    yPosition += imgHeight + 5;
  } catch (error) {
    console.warn('Could not load logo:', error);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Inventory Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Period: ${formatDate(startDate)} - ${formatDate(endDate)}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // Table headers
  const colPositions = {
    productName: 20,
    category: 70,
    brand: 110,
    quantity: 150,
    status: 175
  };

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Product Name', colPositions.productName, yPosition);
  doc.text('Category', colPositions.category, yPosition);
  doc.text('Brand', colPositions.brand, yPosition);
  doc.text('Remaining Qty', colPositions.quantity, yPosition);
  doc.text('Status', colPositions.status, yPosition);
  yPosition += 3;

  // Header line
  doc.setLineWidth(0.5);
  doc.line(15, yPosition, pageWidth - 15, yPosition);
  yPosition += 5;

  // Table rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  inventoryData.forEach((item, index) => {
    // Check for new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;

      // Repeat headers
      doc.setFont('helvetica', 'bold');
      doc.text('Product Name', colPositions.productName, yPosition);
      doc.text('Category', colPositions.category, yPosition);
      doc.text('Brand', colPositions.brand, yPosition);
      doc.text('Remaining Qty', colPositions.quantity, yPosition);
      doc.text('Status', colPositions.status, yPosition);
      yPosition += 3;
      doc.line(15, yPosition, pageWidth - 15, yPosition);
      yPosition += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
    }

    // Optional: alternating row color
    if (index % 2 === 0) {
      doc.setFillColor(240, 240, 240); // light gray
      doc.rect(15, yPosition - 4, pageWidth - 30, 6, 'F');
    }

    const maxProductNameLength = 35;
    const productName = item.productName.length > maxProductNameLength
      ? item.productName.substring(0, maxProductNameLength) + '...'
      : item.productName;

    doc.setTextColor(0, 0, 0);
    doc.text(productName, colPositions.productName, yPosition);
    doc.text(item.category, colPositions.category, yPosition);
    doc.text(item.brand, colPositions.brand, yPosition);
    doc.text(item.currentStock.toString(), colPositions.quantity, yPosition);
    doc.text(item.stockStatus, colPositions.status, yPosition);

    yPosition += 6;
  });

  yPosition += 5;
  doc.line(15, yPosition, pageWidth - 15, yPosition);
  yPosition += 10;

  // Summary
  const totalItems = inventoryData.length;
  const lowStockItems = inventoryData.filter(item => item.stockStatus === 'Low Stock').length;
  const totalRemaining = inventoryData.reduce((sum, item) => sum + item.currentStock, 0);

  if (yPosition > 200) {
    doc.addPage();
    yPosition = 30;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Inventory Summary', 20, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
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
    doc.text(`Generated by: ${adminName}`, 15, 285);
    doc.text(`Report Generated: ${formatDate(new Date().toISOString().split('T')[0])}`, 15, 290);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 15, 290, { align: 'right' });
  }

 

  return doc;
};
