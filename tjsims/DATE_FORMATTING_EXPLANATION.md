# Date Formatting in Sales Reports - How It Works

## Overview
The date formatting in sales reports dynamically adjusts based on the **Range Label** selection (Daily, Weekly, Monthly) to show user-friendly date ranges.

---

## How It Works

### 1. User Selects Range Label in Reports Page

In `ReportsPage.jsx`, there's a dropdown for "Range Label":

```javascript
const [rangeLabel, setRangeLabel] = useState('Daily'); // Options: Daily, Weekly, Monthly
```

When user generates a PDF, this `rangeLabel` is passed to the PDF generator along with the start and end dates:

```javascript
doc = await generateSalesReportPDF(
  allSalesResult.sales,
  exportStartDate,      // e.g., "2025-11-01"
  exportEndDate,        // e.g., "2025-11-07"
  adminName,
  rangeLabel            // "Daily", "Weekly", or "Monthly"
);
```

---

### 2. PDF Generator Formats the Date

In `pdfGenerator.js`, there's a helper function `formatPeriodText()`:

```javascript
const formatPeriodText = (startDate, endDate, rangeLabel) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (rangeLabel === 'Weekly') {
    // Format: Nov 1–7, 2025
    const monthName = start.toLocaleDateString('en-US', { month: 'short' });
    const year = start.getFullYear();
    return `${monthName} ${start.getDate()}–${end.getDate()}, ${year}`;
    
  } else if (rangeLabel === 'Monthly') {
    // Format: November 2025
    return start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
  } else {
    // Daily or custom range: January 1, 2025 - January 7, 2025
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }
};
```

---

### 3. Examples

#### Weekly Report
**User Input:**
- Range Label: `Weekly`
- Start Date: `2025-11-01`
- End Date: `2025-11-07`

**PDF Shows:**
```
Period: Nov 1–7, 2025
```

---

#### Monthly Report
**User Input:**
- Range Label: `Monthly`
- Start Date: `2025-11-01`
- End Date: `2025-11-30`

**PDF Shows:**
```
Period: November 2025
```

---

#### Daily Report (Default)
**User Input:**
- Range Label: `Daily`
- Start Date: `2025-11-01`
- End Date: `2025-11-03`

**PDF Shows:**
```
Period: November 1, 2025 - November 3, 2025
```

---

## Key Points

1. **Range Label is Manual:** User must manually select "Weekly" or "Monthly" from the dropdown. It doesn't auto-detect based on date range.

2. **Date Range Still Matters:** The start and end dates control what data is included in the report. The range label only affects how it's displayed in the PDF header.

3. **Smart Formatting:**
   - Weekly: Shows compact range within same month (e.g., "Nov 1–7, 2025")
   - Monthly: Shows just month and year (e.g., "November 2025")
   - Daily: Shows full date range (e.g., "November 1, 2025 - November 3, 2025")

---

## Usage Flow

1. User opens Reports page
2. Selects date range (start and end dates)
3. Selects Range Label dropdown: Daily / Weekly / Monthly
4. Clicks "Export to PDF"
5. PDF generates with formatted period text based on the label

---

## Code Location

- **Frontend Range Selector:** `src/pages/admin/ReportsPage.jsx` (line ~17)
- **PDF Generator:** `src/utils/pdfGenerator.js` (line ~70-90)
- **Format Function:** `formatPeriodText()` in `pdfGenerator.js`

---

## Important Note

The rangeLabel is just for **display purposes** in the PDF. It doesn't affect:
- Which data is fetched from the database
- How the data is filtered
- The actual date range calculation

The start and end dates control the actual data, while rangeLabel controls how the period is displayed to the user.
