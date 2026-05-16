const fs = require('fs');
const https = require('https');

const csvFile = 'PP_ KHSX TOTAL 26 - DATA Đặt Hàng 2026.csv';
const url = 'https://script.google.com/macros/s/AKfycbyCUwPQbji4QRXS4E7KRQ3PERxlu-IByYSdJCXgeLucxFupJukqLq_0CdXKZpC7okKHsQ/exec';

const content = fs.readFileSync(csvFile, 'utf8');

/**
 * Properly parse CSV with multi-line quoted fields.
 * The old approach of content.split('\n') breaks when CSV fields
 * contain newlines inside quotes (e.g., "8/12/2025 ( RV)\nRV 11/3/26").
 */
function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentVal = '';
  let inQuote = false;
  
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    
    if (inQuote) {
      if (c === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          currentVal += '"';
          i++;
        } else {
          inQuote = false;
        }
      } else {
        currentVal += c;
      }
    } else {
      if (c === '"') {
        inQuote = true;
      } else if (c === ',') {
        currentRow.push(currentVal);
        currentVal = '';
      } else if (c === '\r') {
        // skip \r
      } else if (c === '\n') {
        currentRow.push(currentVal);
        currentVal = '';
        rows.push(currentRow);
        currentRow = [];
      } else {
        currentVal += c;
      }
    }
  }
  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal);
    rows.push(currentRow);
  }
  
  return rows;
}

const allRows = parseCSV(content);
console.log(`Total CSV rows parsed: ${allRows.length}`);

const updateMap = {};

// Data starts at row index 9 (0-based), skipping header rows 0-8
for (let i = 9; i < allRows.length; i++) {
    const cols = allRows[i];
    if (!cols || cols.length <= 17) continue;
    
    const stt = cols[0] ? cols[0].trim() : '';
    if (!stt || isNaN(stt)) continue;
    
    const orderType = cols[1] ? cols[1].trim() : '';
    const productTier = cols[2] ? cols[2].trim() : '';
    const partner = cols[17] ? cols[17].trim() : '';
    
    if (stt && partner) {
        const sttPadded = stt.padStart(4, '0');
        const orderNo = `${sttPadded}/2026/PLMR-${partner}`;
        
        if (!updateMap[orderNo]) {
            updateMap[orderNo] = {
                orderType: orderType,
                productTier: productTier
            };
        }
    }
}

console.log(`Prepared mapping for ${Object.keys(updateMap).length} orders.`);

if (Object.keys(updateMap).length > 0) {
    const payload = JSON.stringify({
        action: "updateClassifications",
        data: {
            updateMap: updateMap
        }
    });
    
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
        }
    };
    
    console.log("Sending request to Google Apps Script...");
    
    // Node.js doesn't natively follow redirects on POST seamlessly with https.request. 
    // We can use fetch if Node > 18.
    if (typeof fetch !== 'undefined') {
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: payload,
            redirect: 'follow'
        })
        .then(res => res.json())
        .then(data => console.log('Response:', data))
        .catch(err => console.error('Error:', err));
    } else {
        console.log("Node fetch API not available. Cannot send POST with follow-redirect natively. Please use Node v18+");
    }
}
