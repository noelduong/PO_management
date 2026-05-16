const fs = require('fs');
const csv = fs.readFileSync('PP_ KHSX TOTAL 26 - DATA Đặt Hàng 2026.csv', 'utf8');
const lines = csv.split('\n');

// Column mapping from CSV:
// Col 3: TÊN SẢN PHẨM
// Col 5: ART/MÃ SP
// Col 6: Màu
// Col 9-13: Size S/29, M/30, L/31, XL/32, XXL/34 (đặt hàng)
// Col 14: SL ĐẶT HÀNG
// Col 17: NHÀ MÁY
// Col 24: Mã Đơn Đặt Hàng
// Col 25: Trạng Thái
// Col 27: NGÀY GIAO THỰC TẾ  
// Col 28: SL NHẬP KHO / Thực tế

// data_receiving headers:
// "Thời gian lưu","Mã đơn hàng","PO Tháng","Người nhập","Ngày nhập","Đợt nhập",
// "Tên SP","Art Code","Màu","Tổng SL nhận","Ghi chú",
// "Size S/29","Size M/30","Size L/31","Size XL/32","Size XXL/34","Size FREE"

const receivingRows = [];
const timestamp = "2026-05-06T02:30:00.000Z";

for (let i = 9; i < lines.length; i++) {
  const cells = lines[i].split(',');
  if (cells.length < 29) continue;
  
  const ngayThucTe = (cells[27] || '').trim();
  const slNhapStr = (cells[28] || '').trim();
  const slNhap = parseInt(slNhapStr.replace(/\./g, '')) || 0;
  
  if (!ngayThucTe || ngayThucTe === '31/12/1899' || slNhap === 0) continue;
  
  const tenSP = (cells[3] || '').trim();
  const artCode = (cells[5] || '').trim();
  const mau = (cells[6] || '').trim();
  const nhaMay = (cells[17] || '').trim();
  const maDonRaw = (cells[24] || '').trim();
  const status = (cells[25] || '').trim();
  const slDat = parseInt((cells[14] || '0').replace(/\./g, '')) || 0;
  
  if (status === 'Cancel') continue;
  
  // Extract order number from maDonRaw (format: "3_PO88_KEM VÀNG NEW" -> need actual PO number)
  // The actual order number mapping was done in parse_big_csv.js
  // Let's read the detail rows to find the matching order
  
  // Size distribution: proportional to order sizes
  const sS = parseInt((cells[9] || '0').replace(/\./g, '')) || 0;
  const sM = parseInt((cells[10] || '0').replace(/\./g, '')) || 0;
  const sL = parseInt((cells[11] || '0').replace(/\./g, '')) || 0;
  const sXL = parseInt((cells[12] || '0').replace(/\./g, '')) || 0;
  const sXXL = parseInt((cells[13] || '0').replace(/\./g, '')) || 0;
  const totalOrderSize = sS + sM + sL + sXL + sXXL;
  
  // Calculate received qty per size (proportional)
  let rS = 0, rM = 0, rL = 0, rXL = 0, rXXL = 0;
  if (totalOrderSize > 0) {
    rS = Math.round(slNhap * sS / totalOrderSize);
    rM = Math.round(slNhap * sM / totalOrderSize);
    rL = Math.round(slNhap * sL / totalOrderSize);
    rXL = Math.round(slNhap * sXL / totalOrderSize);
    rXXL = slNhap - rS - rM - rL - rXL; // remainder to last size
  } else {
    rS = slNhap; // If no size breakdown, put all in first size
  }
  
  receivingRows.push({
    tenSP, artCode, mau, nhaMay, maDonRaw, ngayThucTe, slNhap, slDat,
    rS, rM, rL, rXL, rXXL,
    sS, sM, sL, sXL, sXXL
  });
}

console.log('Total receiving rows:', receivingRows.length);

// Now match with order numbers from detail rows
const detailRows = JSON.parse(fs.readFileSync('data_detail_rows.json', 'utf8'));

// Build lookup: tenSP+mau -> orderNo
const orderLookup = {};
detailRows.forEach(r => {
  const key = (r[1] || '').trim().toUpperCase() + '|' + (r[3] || '').trim().toUpperCase();
  if (!orderLookup[key]) orderLookup[key] = [];
  orderLookup[key].push({
    orderNo: r[0],
    artCode: r[2],
    totalQty: r[4]
  });
});

// Generate receiving data
const recData = [];
let matched = 0, unmatched = 0;

receivingRows.forEach(r => {
  const key = r.tenSP.toUpperCase() + '|' + r.mau.toUpperCase();
  const matches = orderLookup[key] || [];
  
  let orderNo = '';
  let artCodeFinal = r.artCode;
  
  if (matches.length === 1) {
    orderNo = matches[0].orderNo;
    artCodeFinal = matches[0].artCode;
    matched++;
  } else if (matches.length > 1) {
    // Find best match by qty
    const best = matches.find(m => m.totalQty === r.slDat) || matches[0];
    orderNo = best.orderNo;
    artCodeFinal = best.artCode;
    matched++;
  } else {
    unmatched++;
    console.log('UNMATCHED:', r.tenSP, '|', r.mau, '| SL:', r.slNhap);
    return;
  }
  
  // Get PO month from order
  const orderRow = detailRows.find(dr => dr[0] === orderNo);
  const poMonth = '';
  
  // Convert date DD/MM/YYYY to ISO for consistent import
  let ngayISO = r.ngayThucTe;
  const dm = r.ngayThucTe.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dm) {
    ngayISO = dm[3] + '-' + dm[2].padStart(2,'0') + '-' + dm[1].padStart(2,'0');
  }
  
  recData.push([
    timestamp,           // Thời gian lưu
    orderNo,            // Mã đơn hàng
    poMonth,            // PO Tháng
    "System Import",    // Người nhập
    ngayISO,            // Ngày nhập
    "Đợt 1",           // Đợt nhập
    r.tenSP,            // Tên SP
    artCodeFinal,       // Art Code
    r.mau,              // Màu
    r.slNhap,           // Tổng SL nhận
    "",                 // Ghi chú
    r.rS || "",         // Size S/29
    r.rM || "",         // Size M/30
    r.rL || "",         // Size L/31
    r.rXL || "",        // Size XL/32
    r.rXXL || "",       // Size XXL/34
    ""                  // Size FREE
  ]);
});

console.log('Matched:', matched, '| Unmatched:', unmatched);
console.log('Total receiving records to import:', recData.length);

// Generate GAS function
const recHeaders = '["Thời gian lưu","Mã đơn hàng","PO Tháng","Người nhập","Ngày nhập","Đợt nhập","Tên SP","Art Code","Màu","Tổng SL nhận","Ghi chú","Size S/29","Size M/30","Size L/31","Size XL/32","Size XXL/34","Size FREE"]';

let gas = '/**\n * Import dữ liệu nhập hàng từ CSV gốc.\n * Chạy 1 lần sau importPart1+2.\n */\n';
gas += 'function importReceiving() {\n';
gas += '  function toDate(s){if(!s)return"";var str=String(s);var m=str.match(/(\\d{4})-(\\d{2})-(\\d{2})/);if(m)return new Date(parseInt(m[1]),parseInt(m[2])-1,parseInt(m[3]));return s;}\n';
gas += '  var ss = SpreadsheetApp.getActiveSpreadsheet();\n';
gas += '  var sheet = ss.getSheetByName("data_receiving");\n';
gas += '  if (!sheet) sheet = ss.insertSheet("data_receiving");\n';
gas += '  var h=' + recHeaders + ';\n';
gas += '  sheet.clearContents();\n';
gas += '  sheet.getRange(1,1,1,h.length).setValues([h]);\n';
gas += '  sheet.getRange(1,1,1,h.length).setFontWeight("bold").setBackground("#d9ead3");\n';
gas += '  sheet.setFrozenRows(1);\n';
gas += '  var d=' + JSON.stringify(recData) + ';\n';
gas += '  var nc=h.length;\n';
gas += '  d=d.map(function(r){var row=r.slice(0,nc);while(row.length<nc)row.push("");row[4]=toDate(row[4]);return row;});\n';
gas += '  if(d.length>0)sheet.getRange(2,1,d.length,nc).setValues(d);\n';
gas += '  if(d.length>0)sheet.getRange(2,5,d.length,1).setNumberFormat("dd/mm/yyyy");\n';
gas += '  SpreadsheetApp.getUi().alert("Import nhập hàng xong! " + d.length + " dòng.");\n';
gas += '}\n';

fs.writeFileSync('import_receiving.gs', gas, 'utf8');
console.log('Generated import_receiving.gs:', gas.length, 'chars');

// Sample output
console.log('\nSample data:');
recData.slice(0, 3).forEach(r => {
  console.log(r[1], '|', r[6], '|', r[8], '| SL:', r[9], '| Ngày:', r[4]);
});
