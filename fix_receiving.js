const fs = require('fs');
const path = 'd:\\app 0205\\Code.gs';
let content = fs.readFileSync(path, 'utf8');

// 1. Update saveReceivingData FIXED_HEADERS
content = content.replace(
    /const FIXED_HEADERS = \["Thời gian lưu", "Mã đơn hàng", "PO Tháng", "Người nhập", "Ngày nhập", "Đợt nhập", "Tên SP", "Art Code", "Màu", "Tổng SL nhận", "Ghi chú"\];/g,
    'const FIXED_HEADERS = ["Thời gian lưu", "Mã đơn hàng", "PO Tháng", "Phân loại sản phẩm", "Phân cấp sản phẩm", "Người nhập", "Ngày nhập", "Đợt nhập", "Tên SP", "Art Code", "Màu", "Tổng SL nhận", "Ghi chú"];'
);

// 2. Update saveReceivingData rowData population logic
// We need to insert the classification data
const receivingLogicOld = `      rowData[currentHeaders.indexOf("PO Tháng")] = payload.poMonth || "";
      rowData[currentHeaders.indexOf("Người nhập")] = payload.receiverName || "";`;

const receivingLogicNew = `      rowData[currentHeaders.indexOf("PO Tháng")] = payload.poMonth || "";
      
      // Auto-fill classification from mapping if available
      const orderNo = payload.orderNo || "";
      let type = "";
      let tier = "";
      if (typeof HISTORICAL_MAPPING !== 'undefined' && HISTORICAL_MAPPING[orderNo]) {
        type = HISTORICAL_MAPPING[orderNo].type || "";
        tier = HISTORICAL_MAPPING[orderNo].tier || "";
      }
      if (currentHeaders.indexOf("Phân loại sản phẩm") >= 0) rowData[currentHeaders.indexOf("Phân loại sản phẩm")] = type;
      if (currentHeaders.indexOf("Phân cấp sản phẩm") >= 0) rowData[currentHeaders.indexOf("Phân cấp sản phẩm")] = tier;

      rowData[currentHeaders.indexOf("Người nhập")] = payload.receiverName || "";`;

content = content.replace(receivingLogicOld, receivingLogicNew);

// 3. Update importReceiving headers and logic
content = content.replace(
    /var h=\["Thời gian lưu","Mã đơn hàng","PO Tháng","Người nhập","Ngày nhập","Đợt nhập","Tên SP","Art Code","Màu","Tổng SL nhận","Ghi chú","Size S\/29","Size M\/30","Size L\/31","Size XL\/32","Size XXL\/34","Size FREE"\];/g,
    'var h=["Thời gian lưu","Mã đơn hàng","PO Tháng","Phân loại sản phẩm","Phân cấp sản phẩm","Người nhập","Ngày nhập","Đợt nhập","Tên SP","Art Code","Màu","Tổng SL nhận","Ghi chú","Size S/29","Size M/30","Size L/31","Size XL/32","Size XXL/34","Size FREE"];'
);

// Update importReceiving mapping logic
const importRecOld = `  d=d.map(function(r){var row=r.slice(0,nc);while(row.length<nc)row.push("");row[4]=toDate(row[4]);return row;});`;
const importRecNew = `  d=d.map(function(r){
    // Shift data to make room for 2 new columns after index 2
    var row = [r[0], r[1], r[2], "", "", r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[10]];
    // Add size data (starts from index 11 in original r)
    for(var i=11; i<r.length; i++) row.push(r[i]);
    
    while(row.length<nc) row.push("");
    
    // Pull from mapping
    const orderNo = String(row[1]).trim();
    if (typeof HISTORICAL_MAPPING !== 'undefined' && HISTORICAL_MAPPING[orderNo]) {
      row[3] = HISTORICAL_MAPPING[orderNo].type || "";
      row[4] = HISTORICAL_MAPPING[orderNo].tier || "";
    }
    
    return row;
  });
  // Update the date conversion index (was 4, now 6)
  d.forEach(function(r) { r[6] = toDate(r[6]); });`;

// Wait, I need to check the 'd' array in importReceiving to see if I need to shift elements.
// var d=[["2026-05-06T02:30:00.000Z","0003/2026/PLMR-TLN","","System Import","2026-03-13","Đợt 1",...]];
// Indices: 0:Timestamp, 1:OrderNo, 2:PO Month, 3:Người nhập, 4:Ngày nhập...

content = content.replace(importRecOld, importRecNew);

fs.writeFileSync(path, content, 'utf8');
console.log('Receiving import and save logic updated.');
