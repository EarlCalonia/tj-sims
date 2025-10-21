import React, { useMemo, useState } from 'react';
import Navbar from '../../components/client/Navbar';
import Footer from '../../components/client/Footer';
import { salesAPI } from '../../utils/api';
import jsPDF from 'jspdf';

const peso = (n) => `₱${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Badge = ({ children, color }) => (
  <span style={{
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    background: color.bg,
    color: color.fg
  }}>{children}</span>
);

const statusColor = (s) => {
  const v = (s || '').toLowerCase();
  if (v.includes('pending')) return { bg: '#fff3cd', fg: '#856404' };
  if (v.includes('process')) return { bg: '#cce5ff', fg: '#004085' };
  if (v.includes('complete')) return { bg: '#d4edda', fg: '#155724' };
  if (v.includes('cancel')) return { bg: '#f8d7da', fg: '#721c24' };
  if (v.includes('delivery')) return { bg: '#fff3cd', fg: '#856404' };
  return { bg: '#e9ecef', fg: '#495057' };
};

const paymentColor = (s) => ((s || '').toLowerCase() === 'paid'
  ? { bg: '#d4edda', fg: '#155724' }
  : { bg: '#f8d7da', fg: '#721c24' });

const OrderStatus = () => {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null); // { header, items }

  const grandTotal = useMemo(() => {
    if (!order?.items) return 0;
    return order.items.reduce((sum, it) => sum + Number(it.subtotal || it.totalPrice || 0), 0);
  }, [order]);

  const handleSearch = async () => {
    if (!orderId.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      // Try filter by sale_number on backend; fallback to client filter if unsupported
      const list = await salesAPI.getSales({ sale_number: orderId.trim() });
      const found = (list || []).find(s => (s.sale_number || '').toLowerCase() === orderId.trim().toLowerCase()) || (list || [])[0];
      if (!found) {
        setError('Order not found');
        return;
      }
      const items = await salesAPI.getSaleItems(found.id);
      setOrder({ header: found, items });
    } catch (e) {
      setError(e.message || 'Failed to fetch order');
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    if (!order?.header) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('ORDER INFORMATION', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Order ID: ${order.header.sale_number}`, pageWidth / 2, 28, { align: 'center' });

    let y = 40;
    doc.setFontSize(10);
    doc.text(`Order Status: ${order.header.status}`, 20, y); y += 7;
    doc.text(`Payment Status: ${order.header.payment_status}`, 20, y); y += 7;
    doc.text(`Shipping Option: ${order.header.payment}`, 20, y); y += 10;

    // Table headers
    doc.setFont('helvetica', 'bold');
    doc.text('Product Name', 20, y);
    doc.text('Brand', 90, y);
    doc.text('Qty', 130, y);
    doc.text('Unit Price', 150, y);
    doc.text('Total', 180, y, { align: 'right' });
    y += 6;
    doc.line(18, y, pageWidth - 18, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    order.items.forEach(it => {
      if (y > 260) { doc.addPage(); y = 20; }
      const unit = Number(it.price || it.unitPrice || 0);
      const total = Number(it.subtotal || it.totalPrice || unit * (it.quantity || 0));
      const name = String(it.product_name || it.productName || '').slice(0, 35);
      doc.text(name, 20, y);
      doc.text(String(it.brand || ''), 90, y);
      doc.text(String(it.quantity || 0), 130, y);
      doc.text(peso(unit), 150, y);
      doc.text(peso(total), 180, y, { align: 'right' });
      y += 6;
    });

    y += 4; doc.line(18, y, pageWidth - 18, y); y += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Grand Total:', 140, y);
    doc.text(peso(grandTotal), 180, y, { align: 'right' });

    doc.save(`${order.header.sale_number}.pdf`);
  };

  return (
    <div className="order-status-page">
      <Navbar />

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '30px 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h1 style={{ margin: 0, color: '#0f2544', letterSpacing: 1 }}>CHECK ORDER STATUS</h1>
          <p style={{ color: '#5a6c7d' }}>Enter your Order ID to view current status and payment information</p>
        </div>

        <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', padding: 16, marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#334155', marginBottom: 6 }}>Order ID</label>
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter your Order ID"
            style={{ width: '100%', height: 40, borderRadius: 6, border: '1px solid #cbd5e1', padding: '0 12px', outline: 'none' }}
          />
          <button onClick={handleSearch} disabled={loading} style={{
            marginTop: 12,
            width: '100%',
            height: 44,
            background: '#0b63c5',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontWeight: 700,
            cursor: 'pointer'
          }}>Check Status</button>
          {error && <div style={{ marginTop: 10, color: '#b91c1c', fontSize: 14 }}>{error}</div>}
        </div>

        {loading && <div className="card">Loading...</div>}

        {order?.header && (
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', padding: 16, position: 'relative' }}>
            <div style={{ textAlign: 'center', marginBottom: 6 }}>
              <h2 style={{ margin: 0, color: '#0f2544' }}>ORDER INFORMATION</h2>
              <div style={{ color: '#0b63c5' }}>Order ID: <strong>{order.header.sale_number}</strong></div>
            </div>

            <button onClick={exportPDF} style={{ position: 'absolute', right: 16, top: 16, background: '#0b63c5', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 12px', cursor: 'pointer', fontWeight: 700 }}>Export as PDF</button>

            <div style={{ display: 'grid', gap: 10, marginTop: 12, marginBottom: 16 }}>
              <div>
                <div style={{ color: '#334155', fontSize: 14 }}>Order Status:</div>
                <Badge color={statusColor(order.header.status)}>{order.header.status}</Badge>
              </div>
              <div>
                <div style={{ color: '#334155', fontSize: 14 }}>Payment Status:</div>
                <Badge color={paymentColor(order.header.payment_status)}>{order.header.payment_status}</Badge>
              </div>
              <div>
                <div style={{ color: '#334155', fontSize: 14 }}>Shipping Option:</div>
                <Badge color={{ bg: '#e2e8f0', fg: '#0f172a' }}>{order.header.payment}</Badge>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#0b63c5', color: '#fff' }}>
                    <th style={{ textAlign: 'left', padding: 10 }}>PRODUCT NAME</th>
                    <th style={{ textAlign: 'left', padding: 10 }}>BRAND</th>
                    <th style={{ textAlign: 'right', padding: 10 }}>QUANTITY</th>
                    <th style={{ textAlign: 'right', padding: 10 }}>UNIT PRICE</th>
                    <th style={{ textAlign: 'right', padding: 10 }}>TOTAL PRICE</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).map((it, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: 10 }}>{it.product_name || it.productName}</td>
                      <td style={{ padding: 10 }}>{it.brand}</td>
                      <td style={{ padding: 10, textAlign: 'right' }}>{it.quantity}</td>
                      <td style={{ padding: 10, textAlign: 'right' }}>{peso(it.price)}</td>
                      <td style={{ padding: 10, textAlign: 'right' }}>{peso(it.subtotal || (Number(it.price) * Number(it.quantity)))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ textAlign: 'right', padding: 10, fontSize: 18, fontWeight: 800, color: '#0b63c5' }}>
              Grand Total: {peso(grandTotal)}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default OrderStatus;
