# Returns Functionality - Additional Updates

## Summary of Changes

### ✅ Completed Updates:

1. **Refund Methods Limited to Cash and GCash Only**
2. **Photo Proof Upload Required**
3. **Refund Receipt with Print Functionality**
4. **View Return Details After Processing**
5. **Revenue Calculation Fixed (Subtracts Refunds)**

---

## 1. Refund Methods Changed

### Database Schema Update:
```sql
-- Changed in: add_returns_functionality.sql
`refund_method` ENUM('Cash', 'GCash') NOT NULL
-- Removed: 'Store Credit', 'Original Payment Method'
```

### Frontend Update:
- Return modal now shows only 2 radio buttons: **Cash** and **GCash**
- File: `src/pages/admin/OrdersPage.jsx` (lines 993-1015)

---

## 2. Photo Proof Upload

### Database Schema:
```sql
-- Added to returns table
`photo_proof` VARCHAR(255) DEFAULT NULL
```

### Backend Updates:

#### File: `backend/src/controllers/ReturnController.js`
- Added `multer` configuration for file uploads
- Upload directory: `src/uploads/returns/`
- File size limit: 5MB
- Accepted formats: jpeg, jpg, png, gif
- Automatic unique filename generation

```javascript
const storage = multer.diskStorage({
  destination: 'src/uploads/returns',
  filename: `return-${Date.now()}-${random}${ext}`
});
```

#### File: `backend/src/routes/api/returns.js`
- Added `uploadReturnPhoto` middleware to process route

#### File: `backend/src/models/Return.js`
- Added `photoProof` parameter to processReturn method

### Frontend Updates:

#### File: `src/pages/admin/OrdersPage.jsx`
- Added `photoProof` state
- Added file input field with validation
- Shows selected filename
- Required field (validation alert if missing)
- Uses FormData for multipart upload

```jsx
<input
  type="file"
  accept="image/*"
  onChange={(e) => setPhotoProof(e.target.files[0])}
  required
/>
```

#### File: `src/utils/api.js`
- Updated `processReturn` to handle FormData
- Automatically detects FormData vs JSON

---

## 3. Refund Receipt

### Features:
- **Auto-generated after successful return processing**
- **Professional receipt format**
- **Printable** (window.print())
- **Company branding** (TJC AUTO SUPPLY)
- **Complete transaction details**

### Receipt Contents:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           TJC AUTO SUPPLY
  TJ Cabrera St. cor A, Maceda St.,
   Ayala Alabang, Muntinlupa, 1770
         Contact: 0917 420 5498
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

           REFUND RECEIPT

Refund ID:           RET-1234567890-1234
Original Order ID:   SL251103002
Refund Date:         November 09, 2025
Customer:            Customer Name

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RETURNED ITEMS:

Product Name (SKU)
  Qty: 2 x ₱250.00        ₱500.00

Product Name 2 (SKU)
  Qty: 1 x ₱450.00        ₱450.00

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Refund Reason: Defective/Damaged
Refund Method: Cash
Items Restocked: Yes

TOTAL REFUND:            ₱950.00

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Original Order Date: 11/3/2025
Original Payment: Cash

Processed by: Admin Name
Signature: _________________

Thank you for your business!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Modal Features:
- Clean, centered layout
- Monospace font for receipt aesthetics
- Two action buttons:
  - **Close** - Dismisses modal
  - **Print Receipt** - Triggers browser print dialog
- Print-optimized CSS (hides buttons during print)

### Implementation:
- File: `src/pages/admin/OrdersPage.jsx` (lines 1119-1223)
- State: `showRefundReceipt`, `refundReceiptData`
- Auto-opens after successful return processing
- Data includes all return details and calculated totals

---

## 4. View Return Details

### Features:
- **View button appears** for orders with status "Returned" or "Partially Returned"
- **Shows complete return history** for the order
- **Displays photo proof** (if uploaded)
- **Lists all returned items** with details
- **Multiple returns supported** (shows all returns for an order)

### Button Location:
- Actions column in orders table
- Icon: Eye icon (BsEye)
- Blue/cyan color (#17a2b8)
- Only visible for returned orders

### Modal Contents:
For each return record:
- **Return ID**
- **Return Date**
- **Return Reason**
- **Refund Method**
- **Refund Amount**
- **Restocked Status**
- **Photo Proof Image** (clickable, full view)
- **Returned Items Table**:
  - Product name
  - Quantity
  - Price
  - Subtotal
- **Additional Notes** (if any)
- **Processed By** (staff name)

### Implementation:
- Handler: `handleViewReturns()` - Fetches return history via API
- Modal: Lines 1225-1333 in `OrdersPage.jsx`
- API Call: `returnsAPI.getReturnsByOrder(orderId)`
- Returns include parsed items array from JSON_ARRAYAGG

### CSS Styling:
- Card-based layout for each return
- Grid layout for details
- Responsive image display
- Professional table styling
- Scrollable content area (max-height: 600px)

---

## 5. Revenue Calculation Fix

### Problem:
Total revenue was not accounting for refunded amounts, showing inflated revenue figures.

### Solution:
Updated the stats calculation to subtract `refund_amount` from order totals.

### Code Change:
```javascript
// File: src/pages/admin/OrdersPage.jsx (lines 574-589)

totalRevenue: ordersList
  .filter(order => order.status !== 'Cancelled')
  .reduce((sum, order) => {
    const orderTotal = parseFloat(order.total || 0);
    const refundAmount = parseFloat(order.refund_amount || 0);
    return sum + (orderTotal - refundAmount);
  }, 0)
```

### Impact:
- **Total Revenue stat** now shows net revenue (after refunds)
- Cancelled orders still excluded
- Refunded amounts properly deducted
- Partially refunded orders show partial deduction
- Real-time update as returns are processed

---

## 6. Frontend API Update

### File: `src/utils/api.js`

Updated `returnsAPI.processReturn()` to handle both JSON and FormData:

```javascript
processReturn: async (returnData) => {
  const isFormData = returnData instanceof FormData;
  const response = await fetch(`${API_BASE_URL}/returns/process`, {
    method: 'POST',
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    body: isFormData ? returnData : JSON.stringify(returnData),
    credentials: 'include'
  });
  return handleResponse(response);
}
```

---

## 7. CSS Updates

### File: `src/styles/OrdersPage.css`

**Added Styles:**

1. **View Returns Button** (lines 1202-1226)
   - Cyan/blue color scheme
   - Hover effects with elevation
   - Consistent with other action buttons

2. **Refund Receipt Modal** (lines 1228-1255)
   - Courier New monospace font
   - Professional receipt formatting
   - Proper line spacing

3. **Print Media Queries** (lines 1257-1287)
   - Hides modal overlay for printing
   - Shows only receipt content
   - Removes buttons during print
   - Optimizes layout for paper

---

## 8. Files Modified

### Backend:
1. ✅ `backend/src/database/migrations/add_returns_functionality.sql`
   - Updated refund_method ENUM
   - Added photo_proof column

2. ✅ `backend/src/models/Return.js`
   - Added photoProof parameter handling

3. ✅ `backend/src/controllers/ReturnController.js`
   - Added multer configuration
   - Added file upload middleware
   - Process uploaded photo

4. ✅ `backend/src/routes/api/returns.js`
   - Added uploadReturnPhoto middleware

### Frontend:
1. ✅ `src/pages/admin/OrdersPage.jsx`
   - Updated refund methods (Cash/GCash only)
   - Added photo upload field
   - Added refund receipt modal
   - Added view returns modal
   - Fixed revenue calculation
   - Added view returns button

2. ✅ `src/utils/api.js`
   - Updated processReturn for FormData

3. ✅ `src/styles/OrdersPage.css`
   - Added view-returns-btn styles
   - Added receipt modal styles
   - Added print media queries

---

## 9. Testing Checklist

- [ ] **Photo Upload**
  - [ ] Upload a photo when processing return
  - [ ] Verify file is saved in `backend/src/uploads/returns/`
  - [ ] Check file path stored in database
  - [ ] Verify 5MB size limit enforcement
  - [ ] Test with different image formats (jpg, png, gif)

- [ ] **Refund Methods**
  - [ ] Verify only Cash and GCash options show
  - [ ] Test return with Cash method
  - [ ] Test return with GCash method

- [ ] **Refund Receipt**
  - [ ] Verify receipt appears after successful return
  - [ ] Check all fields display correctly
  - [ ] Test print functionality
  - [ ] Verify business info is correct
  - [ ] Check calculations are accurate

- [ ] **View Return Details**
  - [ ] View Returns button appears for returned orders
  - [ ] Click button opens modal with return history
  - [ ] Photo proof displays correctly
  - [ ] Returned items table shows accurate data
  - [ ] Multiple returns display correctly

- [ ] **Revenue Calculation**
  - [ ] Check Total Revenue before any returns
  - [ ] Process a full return
  - [ ] Verify Total Revenue decreases by refund amount
  - [ ] Process a partial return
  - [ ] Verify Total Revenue decreases proportionally
  - [ ] Check that cancelled orders still excluded

- [ ] **Database Records**
  - [ ] Verify `photo_proof` field populated in `returns` table
  - [ ] Check `refund_amount` in `sales` table updated
  - [ ] Confirm refund_method is Cash or GCash only

---

## 10. Usage Instructions

### Processing a Return:
1. Navigate to Orders Page
2. Find a "Completed" order with "Paid" status
3. Click the red "Return" button (arrow icon)
4. Select items to return with checkboxes
5. Enter return quantities
6. Select return reason from dropdown
7. Choose refund method: **Cash or GCash**
8. **Upload photo proof** (required)
9. Check/uncheck inventory restock option
10. Add optional notes
11. Click "Process Return"
12. **Refund receipt appears automatically**
13. Print or close receipt

### Viewing Return History:
1. Find order with "Returned" or "Partially Returned" status
2. Click blue "View Returns" button (eye icon)
3. Modal shows all returns for that order
4. View photo proof, items, amounts, etc.
5. Close when done

### Revenue Tracking:
- Total Revenue on Orders Page now shows net revenue
- Refunds automatically deducted
- No manual adjustment needed

---

## 11. Important Notes

- **Photo proof is required** - Returns cannot be processed without it
- **Only Cash and GCash** - No other refund methods available
- **Receipt auto-generates** - No manual creation needed
- **Revenue auto-adjusts** - Reflects refunds immediately
- **Multiple returns supported** - Can process partial returns multiple times
- **Print-optimized** - Receipts format correctly for printing
- **Photo storage** - Photos stored in `backend/src/uploads/returns/`
- **File size limit** - 5MB maximum per photo

---

## 12. Next Steps

1. **Run the updated database migration**
2. **Restart backend server** (to load multer dependency)
3. **Create `src/uploads/returns/` directory** if it doesn't exist
4. **Test all functionality** using the checklist above
5. **Verify revenue calculations** match expected values
6. **Test print functionality** on different browsers
7. **Check photo uploads** work correctly

---

**All Features Completed and Ready for Testing!** ✅
