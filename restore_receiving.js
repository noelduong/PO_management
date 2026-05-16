const fs = require('fs');
const codePath = 'd:\\app 0205\\Code.gs';
const recPath = 'd:\\app 0205\\import_receiving.gs';

let codeContent = fs.readFileSync(codePath, 'utf8');
let recContent = fs.readFileSync(recPath, 'utf8');

// Extract the data array 'd' from import_receiving.gs
const dMatch = recContent.match(/var d=\[\[.*\]\];/);
if (!dMatch) {
    console.error('Could not find data array in import_receiving.gs');
    process.exit(1);
}
const fullDataArray = dMatch[0];

// The new function structure with classification
const newFunc = `/**
 * Import dữ liệu nhập hàng từ CSV gốc.
 */
function importReceiving() {
  function toDate(s){if(!s)return"";var str=String(s);var m=str.match(/(\\d{4})-(\\d{2})-(\\d{2})/);if(m)return new Date(parseInt(m[1]),parseInt(m[2])-1,parseInt(m[3]));return s;}
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("data_receiving");
  if (!sheet) sheet = ss.insertSheet("data_receiving");
  var h=["Thời gian lưu","Mã đơn hàng","PO Tháng","Phân loại sản phẩm","Phân cấp sản phẩm","Người nhập","Ngày nhập","Đợt nhập","Tên SP","Art Code","Màu","Tổng SL nhận","Ghi chú","Size S/29","Size M/30","Size L/31","Size XL/32","Size XXL/34","Size FREE"];
  sheet.clearContents();
  sheet.getRange(1,1,1,h.length).setValues([h]);
  sheet.getRange(1,1,1,h.length).setFontWeight("bold").setBackground("#d9ead3");
  sheet.setFrozenRows(1);
  ${fullDataArray}
  var nc=h.length;
  d=d.map(function(r){
    // Shift data to make room for 2 new columns after index 2 (PO Tháng)
    // Original r: [0:Time, 1:OrderNo, 2:PO, 3:Person, 4:Date, 5:Batch, 6:SP, 7:Art, 8:Color, 9:Qty, 10:Note, 11+:Sizes]
    var row = [r[0], r[1], r[2], "", "", r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[10]];
    for(var i=11; i<r.length; i++) row.push(r[i]);
    
    while(row.length<nc) row.push("");
    
    // Auto-fill classification from mapping
    const orderNo = String(row[1]).trim();
    if (typeof HISTORICAL_MAPPING !== 'undefined' && HISTORICAL_MAPPING[orderNo]) {
      row[3] = HISTORICAL_MAPPING[orderNo].type || "";
      row[4] = HISTORICAL_MAPPING[orderNo].tier || "";
    }
    
    return row;
  });
  // Update the date conversion index (was 4, now 6)
  d.forEach(function(r) { r[6] = toDate(r[6]); });
  if(d.length>0)sheet.getRange(2,1,d.length,nc).setValues(d);
  if(d.length>0)sheet.getRange(2,7,d.length,1).setNumberFormat("dd/mm/yyyy"); // Col 7 is Ngày nhập
  SpreadsheetApp.getUi().alert("Import nhập hàng xong! " + d.length + " dòng.");
}`;

// Replace importReceiving in Code.gs
const funcStartMatch = codeContent.indexOf('function importReceiving()');
if (funcStartMatch !== -1) {
    // Find the end of the function (assuming it's at the end of the file or followed by another function)
    const nextFuncMatch = codeContent.indexOf('\nfunction ', funcStartMatch + 1);
    const end = (nextFuncMatch !== -1) ? nextFuncMatch : codeContent.length;
    
    // We also want to catch the JSDoc
    let start = codeContent.lastIndexOf('/**', funcStartMatch);
    if (start === -1) start = funcStartMatch;

    codeContent = codeContent.substring(0, start) + newFunc + codeContent.substring(end);
} else {
    // If not found, append it
    codeContent += '\n\n' + newFunc;
}

fs.writeFileSync(codePath, codeContent, 'utf8');
console.log('importReceiving restored with FULL data and classification support.');
