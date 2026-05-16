const fs = require('fs');
const path = 'd:\\app 0205\\Code.gs';
let content = fs.readFileSync(path, 'utf8');

// Extract mapping from syncHistoricalOrderTypes
const mappingStart = content.indexOf('const mapping = {');
const mappingEnd = content.indexOf('};', mappingStart) + 2;
const mappingContent = content.substring(mappingStart, mappingEnd);

// Prepare the new global constant
const globalMapping = mappingContent.replace('const mapping =', 'const HISTORICAL_MAPPING =');

// Prepare the helper function
const helperFunctions = `
/**
 * Helper function to fix classification and notes in order rows
 */
function fixOrderRow(row, mapping) {
  const orderNo = String(row[1]).trim();
  const existingNote = String(row[22] || "").trim();
  
  // 1. Try to get type/tier from mapping
  let type = "";
  let tier = "";
  if (mapping && mapping[orderNo]) {
    type = mapping[orderNo].type || "";
    tier = mapping[orderNo].tier || "";
  }
  
  // 2. Try to extract from note if columns are empty
  if ((!row[12] || !row[13]) && existingNote.includes(" - ")) {
    const parts = existingNote.split(" - ");
    if (parts.length === 2) {
      const t1 = parts[0].trim();
      const t2 = parts[1].trim();
      // Heuristic: if t1 is RESTOCK/NEW IN or t2 is CHỦ LỰC/NEWIN/etc
      if (["RESTOCK", "NEW IN", "PROMOTION"].includes(t1.toUpperCase()) || 
          ["CHỦ LỰC", "NEWIN", "DUY TRÌ", "PHỄU"].includes(t2.toUpperCase())) {
        if (!type) type = t1;
        if (!tier) tier = t2;
        // If the note was ONLY the classification, clear it
        if (existingNote === t1 + " - " + t2) {
          row[22] = "";
        }
      }
    }
  }
  
  if (type) row[12] = type;
  if (tier) row[13] = tier;
  
  return row;
}
`;

// Now insert them at the top of the file (after SPREADSHEET_ID)
const firstConstEnd = content.indexOf(';', content.indexOf('const SPREADSHEET_ID')) + 1;
content = content.substring(0, firstConstEnd) + '\\n\\n' + globalMapping + '\\n' + helperFunctions + content.substring(firstConstEnd);

// Also update importPart1 and importPart2 to use fixOrderRow
content = content.replace(/if\\(o\\.length>0\\)orderSheet\\.getRange\\(2,1,o\\.length,noc\\)\\.setValues\\(o\\);/g, 
    'if(o.length>0) { o = o.map(r => fixOrderRow(r, HISTORICAL_MAPPING)); orderSheet.getRange(2,1,o.length,noc).setValues(o); }');

content = content.replace(/if\\(o\\.length>0\\)orderSheet\\.getRange\\(olr\\+1,1,o\\.length,noc\\)\\.setValues\\(o\\);/g, 
    'if(o.length>0) { o = o.map(r => fixOrderRow(r, HISTORICAL_MAPPING)); orderSheet.getRange(olr+1,1,o.length,noc).setValues(o); }');

// Update masterImportFromCSV orderData processing
content = content.replace(/if \\(orderData\\.length > 0\\) orderSheet\\.getRange\\(2,1,orderData\\.length,numOrderCols\\)\\.setValues\\(orderData\\);/g,
    'if (orderData.length > 0) { orderData = orderData.map(r => fixOrderRow(r, HISTORICAL_MAPPING)); orderSheet.getRange(2,1,orderData.length,numOrderCols).setValues(orderData); }');

// Fix saveOrderData index 22
content = content.replace(/orderRowIndex !== -1 && orderDataRange\\[orderRowIndex - 1\\]\\[22\\] \\? orderDataRange\\[orderRowIndex - 1\\]\\[22\\] : ""/g,
    'payload.note || (orderRowIndex !== -1 && orderDataRange[orderRowIndex - 1][22] ? orderDataRange[orderRowIndex - 1][22] : "")');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed classification logic and restored data processing.');
