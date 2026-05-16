const fs = require('fs');

const detailRows = JSON.parse(fs.readFileSync('data_detail_rows.json', 'utf8'));
const orderRows = JSON.parse(fs.readFileSync('data_order_rows.json', 'utf8'));

// Fix detail rows: merge Size 34 into XXL/34, keep dates as ISO
const fixedDetailRows = detailRows.map(row => {
  const newRow = row.slice(0, 19);
  const xxl32 = parseInt(row[19]) || 0;
  const s34 = parseInt(row[20]) || 0;
  newRow.push((xxl32 + s34) || '');
  newRow.push(row[21] || '');
  // Col 8 stays as ISO string "2026-03-14" - will be converted in GAS
  return newRow;
});

// Order rows stay as-is with ISO dates

// Split
const mid = Math.ceil(fixedDetailRows.length / 2);
const dp1 = fixedDetailRows.slice(0, mid);
const dp2 = fixedDetailRows.slice(mid);
const omid = Math.ceil(orderRows.length / 2);
const op1 = orderRows.slice(0, omid);
const op2 = orderRows.slice(omid);

// Date converter helper (inline in GAS)
const dateHelper = `
  // Convert ISO date strings to Date objects
  function toDate(s) {
    if (!s) return "";
    var str = String(s);
    var m = str.match(/(\\d{4})-(\\d{2})-(\\d{2})/);
    if (m) return new Date(parseInt(m[1]), parseInt(m[2])-1, parseInt(m[3]));
    return s;
  }
`;

const detailDateFix = `
  // Convert T.Gian Giao (col 8) to Date objects
  d.forEach(function(row) { row[8] = toDate(row[8]); });
`;

const orderDateFix = `
  // Convert date columns to Date objects
  o.forEach(function(row) {
    row[2] = toDate(row[2]);   // Ngày đặt hàng
    row[15] = toDate(row[15]); // Hạn Duyệt
    row[16] = toDate(row[16]); // Hạn Cắt Vải
    row[17] = toDate(row[17]); // Hạn Lên Chuyền
    row[18] = toDate(row[18]); // Hạn Hoàn Thành
  });
`;

const detailFormatFix = `
  // Format date column as dd/mm/yyyy
  if(d.length>0) detailSheet.getRange(2,9,d.length,1).setNumberFormat("dd/mm/yyyy");
`;

const orderFormatFix = `
  // Format date columns as dd/mm/yyyy
  if(o.length>0) {
    orderSheet.getRange(2,3,o.length,1).setNumberFormat("dd/mm/yyyy");
    orderSheet.getRange(2,16,o.length,4).setNumberFormat("dd/mm/yyyy");
  }
`;

// Part 1
let g1 = '/**\n * BƯỚC 1: Chạy hàm này TRƯỚC.\n */\n';
g1 += 'function importPart1() {\n';
g1 += dateHelper;
g1 += '  var ss = SpreadsheetApp.getActiveSpreadsheet();\n';
g1 += '  var detailSheet = ss.getSheetByName("data_order_details");\n';
g1 += '  if (!detailSheet) detailSheet = ss.insertSheet("data_order_details");\n';
g1 += '  var dh=["Mã đơn hàng","Tên SP","Art Code","Màu","Tổng SL","Đơn giá","Thành tiền (trước VAT)","Thông tin NPL","T.Gian Giao","Ghi Chú","Trạng thái Vải","Trạng thái Bo","Đồng bộ NPL","Ngày đồng bộ","Ghi chú duyệt","Size S/29","Size M/30","Size L/31","Size XL/32","Size XXL/34","Size FREE"];\n';
g1 += '  detailSheet.clearContents();\n';
g1 += '  detailSheet.getRange(1,1,1,dh.length).setValues([dh]);\n';
g1 += '  detailSheet.getRange(1,1,1,dh.length).setFontWeight("bold").setBackground("#fff2cc");\n';
g1 += '  detailSheet.setFrozenRows(1);\n';
g1 += '  var d=' + JSON.stringify(dp1) + ';\n';
g1 += '  var nc=dh.length;\n';
g1 += '  d=d.map(function(r){var row=r.slice(0,nc);while(row.length<nc)row.push("");return row;});\n';
g1 += detailDateFix;
g1 += '  if(d.length>0)detailSheet.getRange(2,1,d.length,nc).setValues(d);\n';
g1 += detailFormatFix;
g1 += '  var orderSheet = ss.getSheetByName("data_order");\n';
g1 += '  if (!orderSheet) orderSheet = ss.insertSheet("data_order");\n';
g1 += '  var oh=["Thời gian lưu","Mã đơn hàng","Ngày đặt hàng","Người tạo","Công ty","Nhà cung cấp","Địa chỉ NCC","Thuế VAT (%)","Tổng tạm tính","Tiền VAT","Tổng cộng","PO Tháng","Phân Loại ĐH","Phân Cấp SP","Trạng thái Vải","Hạn Duyệt (D+18)","Hạn Cắt Vải (D+21)","Hạn Lên Chuyền (D+22)","Hạn Hoàn Thành (D+27)","Trạng thái Bo","Trạng thái NPL","Ngày Đồng Bộ","Ghi Chú","Tổng SL","Danh sách SP","Danh sách Màu"];\n';
g1 += '  orderSheet.clearContents();\n';
g1 += '  orderSheet.getRange(1,1,1,oh.length).setValues([oh]);\n';
g1 += '  orderSheet.getRange(1,1,1,oh.length).setFontWeight("bold").setBackground("#d0e0e3");\n';
g1 += '  orderSheet.setFrozenRows(1);\n';
g1 += '  var o=' + JSON.stringify(op1) + ';\n';
g1 += '  var noc=oh.length;\n';
g1 += '  o=o.map(function(r){var row=r.slice(0,noc);while(row.length<noc)row.push("");return row;});\n';
g1 += orderDateFix;
g1 += '  if(o.length>0)orderSheet.getRange(2,1,o.length,noc).setValues(o);\n';
g1 += orderFormatFix;
g1 += '  SpreadsheetApp.getUi().alert("Part 1 xong! "+d.length+" details + "+o.length+" orders. Tiep tuc chay importPart2()");\n';
g1 += '}\n';

// Part 2
let g2 = '\n/**\n * BƯỚC 2: Chạy SAU importPart1().\n */\n';
g2 += 'function importPart2() {\n';
g2 += dateHelper;
g2 += '  var ss = SpreadsheetApp.getActiveSpreadsheet();\n';
g2 += '  var detailSheet = ss.getSheetByName("data_order_details");\n';
g2 += '  var lr=detailSheet.getLastRow();\n';
g2 += '  var d=' + JSON.stringify(dp2) + ';\n';
g2 += '  var nc=21;\n';
g2 += '  d=d.map(function(r){var row=r.slice(0,nc);while(row.length<nc)row.push("");return row;});\n';
g2 += detailDateFix;
g2 += '  if(d.length>0)detailSheet.getRange(lr+1,1,d.length,nc).setValues(d);\n';
g2 += '  if(d.length>0)detailSheet.getRange(lr+1,9,d.length,1).setNumberFormat("dd/mm/yyyy");\n';
g2 += '  var orderSheet = ss.getSheetByName("data_order");\n';
g2 += '  var olr=orderSheet.getLastRow();\n';
g2 += '  var o=' + JSON.stringify(op2) + ';\n';
g2 += '  var noc=26;\n';
g2 += '  o=o.map(function(r){var row=r.slice(0,noc);while(row.length<noc)row.push("");return row;});\n';
g2 += orderDateFix;
g2 += '  if(o.length>0)orderSheet.getRange(olr+1,1,o.length,noc).setValues(o);\n';
g2 += '  if(o.length>0) {\n';
g2 += '    orderSheet.getRange(olr+1,3,o.length,1).setNumberFormat("dd/mm/yyyy");\n';
g2 += '    orderSheet.getRange(olr+1,14,o.length,4).setNumberFormat("dd/mm/yyyy");\n';
g2 += '  }\n';
g2 += '  SpreadsheetApp.getUi().alert("Import hoan tat! Tong: 171 don hang.");\n';
g2 += '}\n';

fs.writeFileSync('import_part1.gs', g1, 'utf8');
fs.writeFileSync('import_part2.gs', g2, 'utf8');
console.log('Part1:', g1.length, 'chars | Part2:', g2.length, 'chars');
console.log('Dates will be real Date objects with dd/mm/yyyy format');
