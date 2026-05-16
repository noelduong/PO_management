const fs = require('fs');

const detailRows = JSON.parse(fs.readFileSync('data_detail_rows.json', 'utf8'));
const orderRows = JSON.parse(fs.readFileSync('data_order_rows.json', 'utf8'));

const detailJson = JSON.stringify(detailRows);
const orderJson = JSON.stringify(orderRows);

let gasCode = '';
gasCode += '/**\n';
gasCode += ' * Chạy hàm này 1 lần sau khi XÓA SẠCH data trên Sheet.\n';
gasCode += ' * Import ' + orderRows.length + ' đơn hàng từ CSV gốc (size đã fix đúng, không có Pass).\n';
gasCode += ' */\n';
gasCode += 'function masterImportFromCSV() {\n';
gasCode += '  var ss = SpreadsheetApp.getActiveSpreadsheet();\n';
gasCode += '  \n';
gasCode += '  // 1. IMPORT data_order_details\n';
gasCode += '  var detailSheet = ss.getSheetByName("data_order_details");\n';
gasCode += '  if (!detailSheet) detailSheet = ss.insertSheet("data_order_details");\n';
gasCode += '  var detailHeaders = ["Mã đơn hàng","Tên SP","Art Code","Màu","Tổng SL","Đơn giá","Thành tiền (trước VAT)","Thông tin NPL","T.Gian Giao","Ghi Chú","Trạng thái Vải","Trạng thái Bo","Đồng bộ NPL","Ngày đồng bộ","Ghi chú duyệt","Size S","Size M/29","Size L/30","Size XL/31","Size XXL/32","Size 34","Size FREE"];\n';
gasCode += '  detailSheet.clearContents();\n';
gasCode += '  detailSheet.getRange(1,1,1,detailHeaders.length).setValues([detailHeaders]);\n';
gasCode += '  detailSheet.getRange(1,1,1,detailHeaders.length).setFontWeight("bold").setBackground("#fff2cc");\n';
gasCode += '  detailSheet.setFrozenRows(1);\n';
gasCode += '  var detailData = ' + detailJson + ';\n';
gasCode += '  var numCols = detailHeaders.length;\n';
gasCode += '  detailData = detailData.map(function(r) { var row = r.slice(0,numCols); while(row.length<numCols) row.push(""); return row; });\n';
gasCode += '  if (detailData.length > 0) detailSheet.getRange(2,1,detailData.length,numCols).setValues(detailData);\n';
gasCode += '  \n';
gasCode += '  // 2. IMPORT data_order\n';
gasCode += '  var orderSheet = ss.getSheetByName("data_order");\n';
gasCode += '  if (!orderSheet) orderSheet = ss.insertSheet("data_order");\n';
gasCode += '  var orderHeaders = ["Thời gian lưu","Mã đơn hàng","Ngày đặt hàng","Người tạo","Công ty","Nhà cung cấp","Địa chỉ NCC","Thuế VAT (%)","Tổng tạm tính","Tiền VAT","Tổng cộng","PO Tháng","Phân loại sản phẩm","Phân cấp sản phẩm","Trạng thái Vải","Hạn Duyệt (D+18)","Hạn Cắt Vải (D+21)","Hạn Lên Chuyền (D+22)","Hạn Hoàn Thành (D+27)","Trạng thái Bo","Trạng thái NPL","Ngày Đồng Bộ","Ghi Chú","Tổng SL","Danh sách SP","Danh sách Màu"];\n';
gasCode += '  orderSheet.clearContents();\n';
gasCode += '  orderSheet.getRange(1,1,1,orderHeaders.length).setValues([orderHeaders]);\n';
gasCode += '  orderSheet.getRange(1,1,1,orderHeaders.length).setFontWeight("bold").setBackground("#d0e0e3");\n';
gasCode += '  orderSheet.setFrozenRows(1);\n';
gasCode += '  var orderData = ' + orderJson + ';\n';
gasCode += '  var numOrderCols = orderHeaders.length;\n';
gasCode += '  orderData = orderData.map(function(r) { var row = r.slice(0,numOrderCols); while(row.length<numOrderCols) row.push(""); return row; });\n';
gasCode += '  if (orderData.length > 0) orderSheet.getRange(2,1,orderData.length,numOrderCols).setValues(orderData);\n';
gasCode += '  \n';
gasCode += '  SpreadsheetApp.getUi().alert("Import xong! Details: " + detailData.length + " dong, Orders: " + orderData.length + " dong");\n';
gasCode += '}\n';

fs.writeFileSync('import_function.gs', gasCode, 'utf8');
console.log('Done! Orders: ' + orderRows.length + ', Details: ' + detailRows.length + ', File: ' + gasCode.length + ' chars');
