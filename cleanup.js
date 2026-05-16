const fs = require('fs');
const path = 'd:\\app 0205\\Code.gs';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove any existing HISTORICAL_MAPPING at the top
content = content.replace(/const HISTORICAL_MAPPING = \{[^\}]+\};/gs, '');

// 2. Extract the mapping from syncHistoricalOrderTypes (it's still there)
const mappingMatch = content.match(/const mapping = (\{[\s\S]+?\});/);
if (mappingMatch) {
    const mappingObj = mappingMatch[1];
    // Insert HISTORICAL_MAPPING at the top (after SPREADSHEET_ID)
    const firstConstEnd = content.indexOf(';', content.indexOf('const SPREADSHEET_ID')) + 1;
    content = content.substring(0, firstConstEnd) + '\n\nconst HISTORICAL_MAPPING = ' + mappingObj + ';\n' + content.substring(firstConstEnd);
}

// 3. Add fixOrderRow helper if not exists
if (!content.includes('function fixOrderRow')) {
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
    const firstConstEnd = content.indexOf(';', content.indexOf('const HISTORICAL_MAPPING')) + 1;
    const mappingEnd = content.indexOf('};', firstConstEnd) + 2;
    content = content.substring(0, mappingEnd) + '\n' + helperFunctions + content.substring(mappingEnd);
}

// 4. Apply the replacements in import functions (correct regex this time)
// For Part 1
content = content.replace(/if\(o\.length>0\)orderSheet\.getRange\(2,1,o\.length,noc\)\.setValues\(o\);/g, 
    'if(o.length>0) { o = o.map(r => fixOrderRow(r, HISTORICAL_MAPPING)); orderSheet.getRange(2,1,o.length,noc).setValues(o); }');

// For Part 2
content = content.replace(/if\(o\.length>0\)orderSheet\.getRange\(olr\+1,1,o\.length,noc\)\.setValues\(o\);/g, 
    'if(o.length>0) { o = o.map(r => fixOrderRow(r, HISTORICAL_MAPPING)); orderSheet.getRange(olr+1,1,o.length,noc).setValues(o); }');

// 5. Fix saveOrderData index 22
content = content.replace(/orderRowIndex !== -1 && orderDataRange\[orderRowIndex - 1\]\[22\] \? orderDataRange\[orderRowIndex - 1\]\[22\] : ""/g,
    'payload.note || (orderRowIndex !== -1 && orderDataRange[orderRowIndex - 1][22] ? orderDataRange[orderRowIndex - 1][22] : "")');

// 6. Remove duplicate importReceiving (keep the one at the end)
// The one at the end is line 2230+ in original, now shifted.
// I'll search for the one that has fewer rows or is older.
// Actually, the one at line 1023 was the old one.
// Let's find all function importReceiving and remove the first one if there are two.
const funcName = 'function importReceiving()';
const firstIdx = content.indexOf(funcName);
const lastIdx = content.lastIndexOf(funcName);
if (firstIdx !== lastIdx) {
    // Remove from firstIdx to the next '}' at the start of a line
    const endIdx = content.indexOf('\n}', firstIdx) + 2;
    content = content.substring(0, firstIdx) + content.substring(endIdx);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Cleanup and logic fix complete.');
