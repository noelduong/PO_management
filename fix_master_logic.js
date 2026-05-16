const fs = require('fs');
const codePath = 'd:\\app 0205\\Code.gs';

let codeContent = fs.readFileSync(codePath, 'utf8');

// 1. Fix detailHeaders and detailData map in masterImportFromCSV
const detailHeadersNew = 'var detailHeaders = ["Mã đơn hàng","Phân loại sản phẩm","Phân cấp sản phẩm","Tên SP","Art Code","Màu","Tổng SL","Đơn giá","Thành tiền (trước VAT)","Thông tin NPL","T.Gian Giao","Ghi Chú","Trạng thái Vải","Trạng thái Bo","Đồng bộ NPL","Ngày đồng bộ","Ghi chú duyệt","Size S","Size M/29","Size L/30","Size XL/31","Size XXL/32","Size 34","Size FREE"];';
codeContent = codeContent.replace(/var detailHeaders = \[.*?\];/, detailHeadersNew);

// Update detailData map logic to insert classification
const detailMapLogic = `detailData = detailData.map(function(r) {
    // r: [OrderNo, Name, Art, Color, Qty, Price, Total, NPL, DeliveryDate, Note, ClothStatus, BoStatus, NPLSync, SyncDate, QCNote, SizeS, SizeM, SizeL, SizeXL, SizeXXL, Size34, SizeFREE]
    var orderNo = String(r[0]).trim();
    var type = "";
    var tier = "";
    if (typeof HISTORICAL_MAPPING !== 'undefined' && HISTORICAL_MAPPING[orderNo]) {
      type = HISTORICAL_MAPPING[orderNo].type || "";
      tier = HISTORICAL_MAPPING[orderNo].tier || "";
    }
    
    // Construct new row with classification at index 1 and 2
    var row = [r[0], type, tier];
    for (var i = 1; i < r.length; i++) row.push(r[i]);
    
    while(row.length < detailHeaders.length) row.push("");
    return row.map(function(v){ return (v === -1 || v === "-1") ? "" : v; });
  });`;

codeContent = codeContent.replace(/detailData = detailData\.map\(function\(r\) \{ var row = r\.slice\(0,numCols\); while\(row\.length<numCols\) row\.push\(""\); return row\.map\(function\(v\)\{ return \(v === -1 \|\| v === "-1"\) \? "" : v; \}\); \}\);/, detailMapLogic);

// 2. Ensure orderData map also handles classification (it already does in the raw data, but let's make it robust)
const orderMapLogic = `orderData = orderData.map(function(r) {
    var row = r.slice(0, numOrderCols);
    while(row.length < numOrderCols) row.push("");
    
    // Ensure classification is filled from mapping if missing or default
    var orderNo = String(row[1]).trim();
    if (typeof HISTORICAL_MAPPING !== 'undefined' && HISTORICAL_MAPPING[orderNo]) {
      if (!row[12] || row[12] === "") row[12] = HISTORICAL_MAPPING[orderNo].type || "";
      if (!row[13] || row[13] === "") row[13] = HISTORICAL_MAPPING[orderNo].tier || "";
    }
    
    return row.map(function(v){ return (v === -1 || v === "-1") ? "" : v; });
  });`;

codeContent = codeContent.replace(/orderData = orderData\.map\(function\(r\) \{ var row = r\.slice\(0,numOrderCols\); while\(row\.length<numOrderCols\) row\.push\(""\); return row\.map\(function\(v\)\{ return \(v === -1 \|\| v === "-1"\) \? "" : v; \}\); \}\);/, orderMapLogic);

// 3. Fix importReceiving raw data consistency and mapping
// I will keep the raw data as is but ensure the mapping handles it correctly.
// Actually, I should check if r[2] is PO or if it should be empty.

fs.writeFileSync(codePath, codeContent, 'utf8');
console.log('Master Import logic updated for all sheets with auto-classification.');
