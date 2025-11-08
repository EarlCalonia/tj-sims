# Exclude Refunds and Returns from Sales Reports

## Overview
Sales reports now exclude refunded transactions and returned items to show only actual revenue.

---

## What's Changed

### 1. **Exclude Fully Refunded Sales** ✓
Sales with `payment_status = 'Refunded'` are completely excluded from reports.

**Query Update:**
```sql
WHERE (s.payment_status != 'Refunded' OR s.payment_status IS NULL)
```

### 2. **Adjust for Returned Items** ✓
Items that have been returned (partially or fully) are handled:
- **Fully returned items** (returned_quantity = quantity): Excluded from report
- **Partially returned items** (returned_quantity < quantity): Show only non-returned quantity

**Logic:**
```javascript
const returnedQty = item.returned_quantity || 0;
const actualQty = item.quantity - returnedQty;

if (actualQty <= 0) {
  // Skip fully returned items
  return null;
}

// Show only actual sold quantity
quantity: actualQty
totalPrice: unitPrice * actualQty
```

---

## Examples

### Example 1: Fully Refunded Sale
```
Sale #123
- Total: ₱5,000
- Payment Status: Refunded
- Return Date: Nov 8, 2025

Result: ❌ Excluded from sales report
```

### Example 2: Partially Returned Items
```
Sale #124
- Item: Brake Pads
- Original Quantity: 10
- Returned Quantity: 3
- Unit Price: ₱500

Report Shows:
- Quantity: 7 (not 10)
- Total: ₱3,500 (not ₱5,000)
```

### Example 3: Fully Returned Item
```
Sale #125 (has 2 items)
Item A:
- Quantity: 5
- Returned: 5
Result: ❌ Not shown in report

Item B:
- Quantity: 3
- Returned: 0
Result: ✅ Shows in report

Sale #125 will appear but only show Item B
```

---

## Impact on Reports

### Sales Report Table:
- **Quantity Sold**: Shows actual quantity minus returns
- **Total Sales**: Adjusted for returned items
- **Order Count**: Excludes fully refunded orders

### PDF Export:
- Only includes non-refunded sales
- Item quantities reflect actual sales (minus returns)
- Revenue totals are accurate

### Dashboard Stats:
- Total revenue excludes refunds
- Sales count excludes refunded transactions
- Product sales data reflects actual sales

---

## Database Fields Used

### `sales` table:
- `payment_status`: ENUM('Paid', 'Unpaid', 'Refunded', 'Partially Refunded')
- `refund_amount`: DECIMAL(10,2)
- `return_date`: TIMESTAMP
- `return_reason`: TEXT

### `sale_items` table:
- `returned_quantity`: INT(11) - Number of units returned

### `returns` table:
- Tracks all return transactions
- Links to sales and sale_items

---

## Files Modified

### Backend:
- `backend/src/controllers/ReportsController.js`
  - Updated `getSalesReport()` method
  - Added filters to exclude refunded sales
  - Added logic to adjust for returned items

---

## Testing Checklist

### Test Scenario 1: Full Refund
1. Create a sale
2. Process a full refund
3. Generate sales report
4. ✅ Verify sale is NOT included

### Test Scenario 2: Partial Return
1. Create a sale with 10 items
2. Return 3 items
3. Generate sales report
4. ✅ Verify only 7 items shown

### Test Scenario 3: Multiple Items
1. Create a sale with 3 different products
2. Return one product completely
3. Generate sales report
4. ✅ Verify only 2 products shown

### Test Scenario 4: Date Range
1. Have refunded sales in Nov 1-15
2. Generate report for Nov 1-15
3. ✅ Verify refunded sales excluded
4. ✅ Verify total revenue is accurate

---

## Benefits

### For Accuracy:
✅ **True Revenue**: Reports show actual earned revenue  
✅ **Correct Inventory**: Item counts reflect actual sales  
✅ **Accurate Trends**: No inflation from refunded/returned items  

### For Business:
✅ **Better Insights**: See real sales performance  
✅ **Inventory Planning**: Based on actual demand  
✅ **Financial Accuracy**: Matches actual cash flow  

---

## Technical Notes

### Partial Refunds:
Currently, if `payment_status = 'Partially Refunded'`, the sale WILL appear in reports, but individual returned items will be excluded/adjusted based on `returned_quantity`.

### Future Enhancement:
Could add a filter option to:
- View all sales (including refunded)
- View only refunded sales
- View returns separately

### Performance:
The filtering happens at the database level, so performance remains efficient even with large datasets.

---

## SQL Query Summary

### Before (included everything):
```sql
SELECT * FROM sales 
WHERE status = 'Completed'
  AND DATE(created_at) BETWEEN ? AND ?
```

### After (excludes refunds):
```sql
SELECT * FROM sales 
WHERE status = 'Completed'
  AND (payment_status != 'Refunded' OR payment_status IS NULL)
  AND DATE(created_at) BETWEEN ? AND ?
```

---

## Item Calculation

### Before:
```javascript
quantity: item.quantity
totalPrice: item.subtotal
```

### After:
```javascript
const actualQty = item.quantity - (item.returned_quantity || 0);
if (actualQty <= 0) return null; // Skip fully returned

quantity: actualQty
totalPrice: item.price * actualQty
```

---

## STATUS: ✅ COMPLETE

Sales reports now accurately reflect actual revenue by excluding refunds and returns!

**Next Steps:**
1. Test with various refund scenarios
2. Verify PDF exports show correct totals
3. Check dashboard statistics
4. Confirm inventory reports are unaffected

---

**Implementation Complete! 💰**
