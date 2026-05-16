import re

with open('d:/ORDER_APP/ORDER_APP/Code.gs', 'r', encoding='utf-8') as f:
    code = f.read()

old_row_assign = """      // Khởi tạo dòng dữ liệu tương ứng với số lượng cột hiện tại
      const rowData = new Array(currentHeaders.length).fill("");
      
      // Điền thông tin cố định
      rowData[0] = payload.orderNo;
      rowData[1] = it.productName;
      rowData[2] = it.artCode;
      rowData[3] = it.color;
      rowData[4] = it.totalQty;
      rowData[5] = it.unitPrice;
      rowData[6] = lineSubtotal;
      rowData[7] = it.nplInfo;
      rowData[8] = deliveryDateStr;
      rowData[9] = it.note;"""

new_row_assign = """      // Khởi tạo dòng dữ liệu tương ứng với số lượng cột hiện tại
      const rowData = new Array(currentHeaders.length).fill("");
      
      // Điền thông tin cố định theo tên cột
      const setVal = (colName, val) => {
          const idx = currentHeaders.indexOf(colName);
          if (idx !== -1) rowData[idx] = val;
      };
      
      setVal("Mã đơn hàng", payload.orderNo);
      setVal("Tên SP", it.productName);
      setVal("Link Ảnh", it.imageUrl || "");
      setVal("Art Code", it.artCode);
      setVal("Màu", it.color);
      setVal("Tổng SL", it.totalQty);
      setVal("Đơn giá", it.unitPrice);
      setVal("Thành tiền (trước VAT)", lineSubtotal);
      setVal("Thông tin NPL", it.nplInfo);
      setVal("T.Gian Giao", deliveryDateStr);
      setVal("Ghi Chú", it.note);"""

code = code.replace(old_row_assign, new_row_assign)

old_header_logic = """    // Quét qua tất cả các size để thêm cột mới vào header nếu cần
    const neededSizes = new Set();"""

new_header_logic = """    // Thêm Link Ảnh nếu chưa có
    if (!currentHeaders.includes("Link Ảnh")) {
        currentHeaders.push("Link Ảnh");
        headerChanged = true;
    }

    // Quét qua tất cả các size để thêm cột mới vào header nếu cần
    const neededSizes = new Set();"""

code = code.replace(old_header_logic, new_header_logic)

old_dopost = """    if (payload.action === 'saveOrder' || payload.action === 'updateOrder') {"""

new_dopost = """    if (payload.action === 'deleteOrder') {
      const result = deleteOrderData(payload.orderNo);
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    }

    if (payload.action === 'saveOrder' || payload.action === 'updateOrder') {"""

code = code.replace(old_dopost, new_dopost)

delete_func = """
function deleteOrderData(orderNo) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let deletedCount = 0;
    
    // Xóa từ data_order
    const orderSheet = ss.getSheetByName("data_order");
    if (orderSheet) {
      const orderData = orderSheet.getDataRange().getValues();
      for (let i = orderData.length - 1; i >= 1; i--) {
        if (String(orderData[i][1]).trim() === String(orderNo).trim()) {
          orderSheet.deleteRow(i + 1);
          deletedCount++;
        }
      }
    }
    
    // Xóa từ data_order_details
    const detailSheet = ss.getSheetByName("data_order_details");
    if (detailSheet) {
      const detailData = detailSheet.getDataRange().getValues();
      for (let i = detailData.length - 1; i >= 1; i--) {
        if (String(detailData[i][0]).trim() === String(orderNo).trim()) {
          detailSheet.deleteRow(i + 1);
          deletedCount++;
        }
      }
    }
    
    if (deletedCount > 0) {
      return { success: true, message: "Đã xóa đơn hàng thành công!" };
    } else {
      return { success: false, message: "Không tìm thấy đơn hàng để xóa!" };
    }
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}
"""

if "function deleteOrderData" not in code:
    code += delete_func

with open('d:/ORDER_APP/ORDER_APP/Code.gs', 'w', encoding='utf-8') as f:
    f.write(code)
print('Done!')
