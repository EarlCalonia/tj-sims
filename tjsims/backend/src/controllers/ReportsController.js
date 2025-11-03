import { Sales } from '../models/Sales.js';
import { getPool } from '../config/database.js';

export class ReportsController {
  // Helper function to convert UTC to Philippine Time (UTC+8)
  static convertToPhilippineTime(utcDateString) {
    if (!utcDateString) return null;
    const utcDate = new Date(utcDateString);
    // Add 8 hours for Philippine Time (UTC+8)
    utcDate.setHours(utcDate.getHours() + 8);
    return utcDate.toISOString().replace('Z', '+08:00');
  }

  // Get sales report data with pagination and filtering
  static async getSalesReport(req, res) {
    try {
      const { page = 1, limit = 10, start_date, end_date } = req.query;

      const offset = (page - 1) * limit;

      // Build query for sales with filtering - get individual sales records
      let salesQuery = `
        SELECT s.id, s.sale_number, s.customer_name, s.contact, s.total, s.payment,
               s.created_at, s.status
        FROM sales s
        WHERE 1=1
          AND (s.status = 'Completed' OR s.status IS NULL)
      `;
      let salesParams = [];

      if (start_date) {
        salesQuery += ' AND DATE(s.created_at) >= ?';
        salesParams.push(start_date);
      }

      if (end_date) {
        salesQuery += ' AND DATE(s.created_at) <= ?';
        salesParams.push(end_date);
      }

      salesQuery += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
      salesParams.push(parseInt(limit), parseInt(offset));

      const pool = getPool();
      const [sales] = await pool.execute(salesQuery, salesParams);

      // Get total count for pagination (apply same filters)
      let countQuery = "SELECT COUNT(*) as total FROM sales WHERE 1=1 AND (status = 'Completed' OR status IS NULL)";
      let countParams = [];

      if (start_date) {
        countQuery += ' AND DATE(created_at) >= ?';
        countParams.push(start_date);
      }

      if (end_date) {
        countQuery += ' AND DATE(created_at) <= ?';
        countParams.push(end_date);
      }

      const [totalResult] = await pool.execute(countQuery, countParams);
      const total = totalResult[0].total;
      const totalPages = Math.ceil(total / limit);

      // For each sale, get its items and calculate aggregated data
      const salesWithItems = [];
      for (const sale of sales) {
        try {
          const items = await Sales.getSaleItems(sale.id);
          const itemCount = items.length;
          const calculatedTotal = items.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0);

          salesWithItems.push({
            id: sale.id,
            orderId: sale.sale_number,
            customerName: sale.customer_name,
            contact: sale.contact,
            orderDate: ReportsController.convertToPhilippineTime(sale.created_at),
            totalAmount: sale.total,
            paymentMethod: sale.payment,
            status: sale.status || 'N/A',
            itemCount: itemCount,
            calculatedTotal: calculatedTotal,
            items: items.map(item => ({
              productName: item.product_name || 'N/A',
              brand: item.brand || 'N/A',
              quantity: item.quantity || 0,
              unitPrice: item.price || 0,
              totalPrice: item.subtotal || 0
            }))
          });
        } catch (error) {
          console.error(`Error fetching items for sale ${sale.id}:`, error);
          // Add sale without items if there's an error
          salesWithItems.push({
            id: sale.id,
            orderId: sale.sale_number,
            customerName: sale.customer_name,
            contact: sale.contact,
            orderDate: ReportsController.convertToPhilippineTime(sale.created_at),
            totalAmount: sale.total,
            paymentMethod: sale.payment,
            status: sale.status || 'N/A',
            itemCount: 0,
            calculatedTotal: 0,
            items: []
          });
        }
      }

      // Calculate summary statistics
      const summary = {
        totalSales: total,
        totalRevenue: salesWithItems.reduce((sum, sale) => sum + parseFloat(sale.total || 0), 0),
        averageSale: salesWithItems.length > 0 ? salesWithItems.reduce((sum, sale) => sum + parseFloat(sale.total || 0), 0) / salesWithItems.length : 0,
        totalItems: salesWithItems.reduce((sum, sale) => sum + sale.items.length, 0)
      };

      res.json({
        success: true,
        data: {
          sales: salesWithItems,
          pagination: {
            current_page: parseInt(page),
            per_page: parseInt(limit),
            total: total,
            total_pages: totalPages,
            from: offset + 1,
            to: Math.min(offset + parseInt(limit), total)
          },
          summary: summary
        }
      });
    } catch (error) {
      console.error('Error fetching sales report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sales report'
      });
    }
  }

  // Get inventory report data with pagination
  static async getInventoryReport(req, res) {
    try {
      const { page = 1, limit = 10, search, category, brand, status, stock_status } = req.query;

      const offset = (page - 1) * limit;

      // Build query for products with inventory data
      let query = `
        SELECT p.product_id, p.name, p.brand, p.category, p.price, p.status,
               p.created_at,
               COALESCE(i.stock, 0) as current_stock,
               COALESCE(i.reorder_point, 10) as reorder_point,
               CASE
                 WHEN COALESCE(i.stock, 0) <= 0 THEN 'Out of Stock'
                 WHEN COALESCE(i.stock, 0) < COALESCE(i.reorder_point, 10) THEN 'Low Stock'
                 WHEN COALESCE(i.stock, 0) >= COALESCE(i.reorder_point, 10) * 2 THEN 'Overstock'
                 ELSE 'In Stock'
               END as stock_status
        FROM products p
        LEFT JOIN inventory i ON p.product_id = i.product_id
        WHERE 1=1
      `;
      let params = [];

      if (search) {
        query += ' AND (p.name LIKE ? OR p.product_id LIKE ? OR p.brand LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (category && category !== 'All Categories') {
        query += ' AND p.category = ?';
        params.push(category);
      }

      if (brand && brand !== 'All Brand') {
        query += ' AND p.brand = ?';
        params.push(brand);
      }

      if (status && status !== 'All Status') {
        query += ' AND p.status = ?';
        params.push(status);
      }

      // Filter by computed stock_status via HAVING
      if (stock_status && stock_status !== 'All Status') {
        query += ' HAVING stock_status = ?';
        params.push(stock_status);
      }

      query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));

      const pool = getPool();
      const [products] = await pool.execute(query, params);

      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) as total FROM (
          SELECT p.product_id,
                 CASE
                   WHEN COALESCE(i.stock, 0) <= 0 THEN 'Out of Stock'
                   WHEN COALESCE(i.stock, 0) < COALESCE(i.reorder_point, 10) THEN 'Low Stock'
                   WHEN COALESCE(i.stock, 0) >= COALESCE(i.reorder_point, 10) * 2 THEN 'Overstock'
                   ELSE 'In Stock'
                 END as stock_status
          FROM products p
          LEFT JOIN inventory i ON p.product_id = i.product_id
          WHERE 1=1
        `;
      let countParams = [];

      if (search) {
        countQuery += ' AND (p.name LIKE ? OR p.product_id LIKE ? OR p.brand LIKE ?)';
        countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (category && category !== 'All Categories') {
        countQuery += ' AND p.category = ?';
        countParams.push(category);
      }

      if (brand && brand !== 'All Brand') {
        countQuery += ' AND p.brand = ?';
        countParams.push(brand);
      }

      if (status && status !== 'All Status') {
        countQuery += ' AND p.status = ?';
        countParams.push(status);
      }
      countQuery += ') t';
      if (stock_status && stock_status !== 'All Status') {
        countQuery += ' WHERE t.stock_status = ?';
        countParams.push(stock_status);
      }

      const [totalResult] = await pool.execute(countQuery, countParams);
      const total = totalResult[0].total;
      const totalPages = Math.ceil(total / limit);

      // Calculate summary statistics
      const summary = {
        totalProducts: total,
        inStockProducts: products.filter(p => p.stock_status === 'In Stock').length,
        lowStockProducts: products.filter(p => p.stock_status === 'Low Stock').length,
        outOfStockProducts: products.filter(p => p.stock_status === 'Out of Stock').length,
        totalInventoryValue: products.reduce((sum, product) => {
          const stock = product.current_stock || 0;
          const price = parseFloat(product.price || 0);
          return sum + (stock * price);
        }, 0)
      };

      res.json({
        success: true,
        data: {
          products: products.map(product => ({
            id: product.product_id,
            productName: product.name || 'N/A',
            category: product.category || 'N/A',
            brand: product.brand || 'N/A',
            currentStock: product.current_stock || 0,
            stockStatus: product.stock_status || 'Out of Stock',
            price: parseFloat(product.price || 0),
            status: product.status || 'N/A',
            createdDate: ReportsController.convertToPhilippineTime(product.created_at)
          })),
          pagination: {
            current_page: parseInt(page),
            per_page: parseInt(limit),
            total: total,
            total_pages: totalPages,
            from: offset + 1,
            to: Math.min(offset + parseInt(limit), total)
          },
          summary: summary
        }
      });
    } catch (error) {
      console.error('Error fetching inventory report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch inventory report'
      });
    }
  }

  // Export sales report as CSV
  static async exportSalesReportCSV(req, res) {
    try {
      const { start_date, end_date } = req.query;

      // Build query for all sales data (no pagination for export)
      let query = `
        SELECT s.*, si.product_name, si.brand, si.quantity, si.price, si.subtotal
        FROM sales s
        LEFT JOIN sale_items si ON s.id = si.sale_id
        WHERE 1=1
          AND (s.status = 'Completed' OR s.status IS NULL)
      `;
      let params = [];

      if (start_date) {
        query += ' AND DATE(s.created_at) >= ?';
        params.push(start_date);
      }

      if (end_date) {
        query += ' AND DATE(s.created_at) <= ?';
        params.push(end_date);
      }

      query += ' ORDER BY s.created_at DESC, si.id';

      const pool = getPool();
      const [rows] = await pool.execute(query, params);

      // Create CSV content
      const csvHeaders = [
        'Order ID',
        'Customer Name',
        'Contact',
        'Order Date',
        'Total Amount',
        'Payment Method',
        'Product Name',
        'Brand',
        'Quantity',
        'Unit Price',
        'Total Price'
      ];

      const csvRows = [csvHeaders.join(',')];

      // Group sales by order ID
      const salesMap = new Map();
      rows.forEach(row => {
        if (!salesMap.has(row.id)) {
          salesMap.set(row.id, {
            orderId: row.sale_number,
            customerName: row.customer_name,
            contact: row.contact,
            orderDate: ReportsController.convertToPhilippineTime(row.created_at),
            totalAmount: row.total,
            paymentMethod: row.payment,
            items: []
          });
        }

        if (row.product_name) {
          salesMap.get(row.id).items.push({
            productName: row.product_name,
            brand: row.brand,
            quantity: row.quantity,
            unitPrice: row.price,
            totalPrice: row.subtotal
          });
        }
      });

      // Add each sale and its items to CSV
      salesMap.forEach(sale => {
        if (sale.items.length === 0) {
          csvRows.push([
            sale.orderId,
            sale.customerName,
            sale.contact,
            sale.orderDate,
            sale.totalAmount,
            sale.paymentMethod,
            '',
            '',
            '',
            '',
            ''
          ].join(','));
        } else {
          sale.items.forEach((item, index) => {
            csvRows.push([
              index === 0 ? sale.orderId : '',
              index === 0 ? sale.customerName : '',
              index === 0 ? sale.contact : '',
              index === 0 ? sale.orderDate : '',
              index === 0 ? sale.totalAmount : '',
              index === 0 ? sale.paymentMethod : '',
              item.productName,
              item.brand,
              item.quantity,
              item.unitPrice,
              item.totalPrice
            ].join(','));
          });
        }
      });

      const csvContent = csvRows.join('\n');

      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="sales_report_${new Date().toISOString().split('T')[0]}.csv"`);

      res.send(csvContent);
    } catch (error) {
      console.error('Error exporting sales CSV:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export sales report'
      });
    }
  }

  // Export inventory report as CSV
  static async exportInventoryReportCSV(req, res) {
    try {
      const { search, category, brand, status } = req.query;

      // Build query for all products (no pagination for export)
      let query = `
        SELECT p.*, p.created_at, i.stock as current_stock,
               CASE
                 WHEN i.stock <= 0 THEN 'Out of Stock'
                 WHEN i.stock <= 10 THEN 'Low Stock'
                 ELSE 'In Stock'
               END as stock_status
        FROM products p
        LEFT JOIN inventory i ON p.product_id = i.product_id
        WHERE 1=1
      `;
      let params = [];

      if (search) {
        query += ' AND (p.name LIKE ? OR p.product_id LIKE ? OR p.brand LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (category && category !== 'All Categories') {
        query += ' AND p.category = ?';
        params.push(category);
      }

      if (brand && brand !== 'All Brand') {
        query += ' AND p.brand = ?';
        params.push(brand);
      }

      if (status && status !== 'All Status') {
        query += ' AND p.status = ?';
        params.push(status);
      }

      query += ' ORDER BY p.created_at DESC';

      const pool = getPool();
      const [products] = await pool.execute(query, params);

      // Create CSV content
      const csvHeaders = [
        'Product ID',
        'Product Name',
        'Brand',
        'Category',
        'Price',
        'Current Stock',
        'Stock Status',
        'Status',
        'Created Date'
      ];

      const csvRows = [csvHeaders.join(',')];

      products.forEach(product => {
        csvRows.push([
          product.product_id,
          product.name,
          product.brand,
          product.category,
          product.price,
          product.current_stock || 0,
          product.stock_status,
          product.status,
          ReportsController.convertToPhilippineTime(product.created_at) || ''
        ].join(','));
      });

      const csvContent = csvRows.join('\n');

      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="inventory_report_${new Date().toISOString().split('T')[0]}.csv"`);

      res.send(csvContent);
    } catch (error) {
      console.error('Error exporting inventory CSV:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export inventory report'
      });
    }
  }

  // Export sales report as PDF
  static async exportSalesReportPDF(req, res) {
    try {
      const { start_date, end_date } = req.query;

      // Build query for all sales data (no pagination for export)
      let query = `
        SELECT s.*, si.product_name, si.brand, si.quantity, si.price, si.subtotal
        FROM sales s
        LEFT JOIN sale_items si ON s.id = si.sale_id
        WHERE 1=1
      `;
      let params = [];

      if (start_date) {
        query += ' AND DATE(s.created_at) >= ?';
        params.push(start_date);
      }

      if (end_date) {
        query += ' AND DATE(s.created_at) <= ?';
        params.push(end_date);
      }

      query += ' ORDER BY s.created_at DESC, si.id';

      const pool = getPool();
      const [rows] = await pool.execute(query, params);

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No sales data found for export'
        });
      }

      // Create PDF document
      const doc = new PDFDocument({ margin: 30, size: 'A4' });

      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="sales_report_${new Date().toISOString().split('T')[0]}.pdf"`);

      // Pipe PDF to response
      doc.pipe(res);

      // PDF Title
      doc.fontSize(20).text('Sales Report', { align: 'center' });
      doc.moveDown(2);

      // Group sales by order ID for PDF formatting
      const salesMap = new Map();
      rows.forEach(row => {
        if (!salesMap.has(row.id)) {
          salesMap.set(row.id, {
            orderId: row.sale_number,
            customerName: row.customer_name,
            contact: row.contact,
            orderDate: ReportsController.convertToPhilippineTime(row.created_at),
            totalAmount: row.total,
            paymentMethod: row.payment,
            items: []
          });
        }

        if (row.product_name) {
          salesMap.get(row.id).items.push({
            productName: row.product_name,
            brand: row.brand,
            quantity: row.quantity,
            unitPrice: row.price,
            totalPrice: row.subtotal
          });
        }
      });

      let yPosition = 80;

      salesMap.forEach((sale, index) => {
        // Check if we need a new page
        if (yPosition > 600) {
          doc.addPage();
          yPosition = 50;
        }

        // Sale header
        doc.fontSize(14).text(`Order #${sale.orderId}`, 50, yPosition);
        yPosition += 25;

        doc.fontSize(10).text(`Customer: ${sale.customerName || 'N/A'}`, 50, yPosition);
        yPosition += 18;
        doc.fontSize(10).text(`Contact: ${sale.contact || 'N/A'}`, 50, yPosition);
        yPosition += 18;
        doc.fontSize(10).text(`Date: ${sale.orderDate}`, 50, yPosition);
        yPosition += 18;
        doc.fontSize(10).text(`Payment: ${sale.paymentMethod}`, 50, yPosition);
        yPosition += 18;
        doc.fontSize(10).text(`Total: ₱${parseFloat(sale.totalAmount || 0).toFixed(2)}`, 50, yPosition);
        yPosition += 25;

        // Items
        if (sale.items.length > 0) {
          doc.fontSize(10).text('Items:', 50, yPosition);
          yPosition += 18;

          sale.items.forEach((item) => {
            if (yPosition > 700) {
              doc.addPage();
              yPosition = 50;
            }

            const itemText = `• ${item.productName} (${item.brand}) - Qty: ${item.quantity} × ₱${parseFloat(item.unitPrice || 0).toFixed(2)} = ₱${parseFloat(item.totalPrice || 0).toFixed(2)}`;
            doc.fontSize(9).text(itemText, 60, yPosition);
            yPosition += 15;
          });
        }

        yPosition += 15;

        // Separator line
        if (index < salesMap.size - 1) {
          doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
          yPosition += 25;
        }
      });

      // Finalize PDF
      doc.end();

    } catch (error) {
      console.error('Error exporting sales PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export sales report as PDF'
      });
    }
  }

  // Export inventory report as PDF
  static async exportInventoryReportPDF(req, res) {
    try {
      const { search, category, brand, status } = req.query;

      // Build query for all products (no pagination for export)
      let query = `
        SELECT p.*, p.created_at, i.stock as current_stock,
               CASE
                 WHEN i.stock <= 0 THEN 'Out of Stock'
                 WHEN i.stock <= 10 THEN 'Low Stock'
                 ELSE 'In Stock'
               END as stock_status
        FROM products p
        LEFT JOIN inventory i ON p.product_id = i.product_id
        WHERE 1=1
      `;
      let params = [];

      if (search) {
        query += ' AND (p.name LIKE ? OR p.product_id LIKE ? OR p.brand LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (category && category !== 'All Categories') {
        query += ' AND p.category = ?';
        params.push(category);
      }

      if (brand && brand !== 'All Brand') {
        query += ' AND p.brand = ?';
        params.push(brand);
      }

      if (status && status !== 'All Status') {
        query += ' AND p.status = ?';
        params.push(status);
      }

      query += ' ORDER BY p.created_at DESC';

      const pool = getPool();
      const [products] = await pool.execute(query, params);

      // Create PDF document
      const doc = new PDFDocument({ margin: 30, size: 'A4' });

      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="inventory_report_${new Date().toISOString().split('T')[0]}.pdf"`);

      // Pipe PDF to response
      doc.pipe(res);

      // PDF Title
      doc.fontSize(20).text('Inventory Report', { align: 'center' });
      doc.moveDown();

      let yPosition = 80;

      products.forEach((product, index) => {
        // Check if we need a new page
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }

        // Product details
        doc.fontSize(12).text(`Product ID: ${product.product_id}`, 50, yPosition);
        yPosition += 20;

        doc.fontSize(10).text(`Name: ${product.name}`, 50, yPosition);
        yPosition += 15;
        doc.fontSize(10).text(`Brand: ${product.brand}`, 50, yPosition);
        yPosition += 15;
        doc.fontSize(10).text(`Category: ${product.category}`, 50, yPosition);
        yPosition += 15;
        doc.fontSize(10).text(`Price: ₱${parseFloat(product.price).toFixed(2)}`, 50, yPosition);
        yPosition += 15;
        doc.fontSize(10).text(`Stock: ${product.current_stock || 0}`, 50, yPosition);
        yPosition += 15;
        doc.fontSize(10).text(`Status: ${product.stock_status}`, 50, yPosition);
        yPosition += 15;
        doc.fontSize(10).text(`Created: ${ReportsController.convertToPhilippineTime(product.created_at) || 'N/A'}`, 50, yPosition);
        yPosition += 25;

        // Separator line
        if (index < products.length - 1) {
          doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
          yPosition += 20;
        }
      });

      // Finalize PDF
      doc.end();

    } catch (error) {
      console.error('Error exporting inventory PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export inventory report as PDF'
      });
    }
  }
}
