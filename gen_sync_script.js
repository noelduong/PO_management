const fs = require('fs');
const content = fs.readFileSync('PP_ KHSX TOTAL 26 - DATA Đặt Hàng 2026.csv', 'utf8');

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
const mapping = {};

for (let i = 9; i < allRows.length; i++) {
  const parsedCols = allRows[i];
  if (!parsedCols || parsedCols.length <= 17) continue;
  
  const stt = parsedCols[0] ? parsedCols[0].trim() : '';
  if (!stt || isNaN(stt)) continue;
  
  const orderType = parsedCols[1] ? parsedCols[1].trim() : '';
  const productTier = parsedCols[2] ? parsedCols[2].trim() : '';
  const partner = parsedCols[17] ? parsedCols[17].trim() : '';
  
  if (stt && partner) {
    const sttPadded = stt.padStart(4, '0');
    const orderNo = `${sttPadded}/2026/PLMR-${partner}`;
    
    if (!mapping[orderNo]) mapping[orderNo] = { type: orderType, tier: productTier };
  }
}

let gasCode = `function syncHistoricalOrderTypes() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const orderSheet = ss.getSheetByName("data_order");
  if (!orderSheet) {
    SpreadsheetApp.getUi().alert("Không tìm thấy data_order");
    return;
  }
  
  const mapping = ${JSON.stringify(mapping, null, 2)};
  
  const data = orderSheet.getDataRange().getValues();
  if (data.length <= 1) return;

  // Kiểm tra xem dữ liệu có bị lệch cột không (do thêm 2 cột Phân Loại ĐH, Phân Cấp SP vào giữa)
  // Cột M (index 12) trước đây là "Trạng thái Vải", thường có giá trị "Pending", "Cancel", v.v.
  let needsShift = false;
  for (let i = 1; i < Math.min(10, data.length); i++) {
    const sample = String(data[i][12] || "").toLowerCase().trim();
    if (sample === "pending" || sample === "cancel" || sample === "hoàn thành" || sample === "chờ duyệt" || sample.includes("dệt")) {
      needsShift = true;
      break;
    }
  }

  if (needsShift) {
    // Dịch toàn bộ dữ liệu từ cột M -> X sang phải 2 cột (thành O -> Z) cho tất cả các dòng dữ liệu
    const numRows = orderSheet.getLastRow() - 1;
    const oldDataRange = orderSheet.getRange(2, 13, numRows, 14); // Lấy dư ra chút
    const oldData = oldDataRange.getValues();
    oldDataRange.clearContent();
    orderSheet.getRange(2, 15, numRows, 14).setValues(oldData);
  }

  // Cập nhật lại Headers cho chuẩn
  const ORDER_HEADERS = ["Thời gian lưu", "Mã đơn hàng", "Ngày đặt hàng", "Người tạo", "Công ty", "Nhà cung cấp", "Địa chỉ NCC", "Thuế VAT (%)", "Tổng tạm tính", "Tiền VAT", "Tổng cộng", "PO Tháng", "Phân Loại ĐH", "Phân Cấp SP", "Trạng thái Vải", "Hạn Duyệt (D+18)", "Hạn Cắt Vải (D+21)", "Hạn Lên Chuyền (D+22)", "Hạn Hoàn Thành (D+27)", "Trạng thái Bo", "Trạng thái NPL", "Ngày Đồng Bộ", "Ghi Chú", "Tổng SL", "Danh sách SP", "Danh sách Màu"];
  orderSheet.getRange(1, 1, 1, ORDER_HEADERS.length).setValues([ORDER_HEADERS]);
  orderSheet.getRange(1, 1, 1, ORDER_HEADERS.length).setFontWeight("bold").setBackground("#d0e0e3");

  const newData = orderSheet.getDataRange().getValues();
  const typesCol = [];
  const tiersCol = [];
  let updated = 0;
  
  for (let i = 1; i < newData.length; i++) {
    const orderNo = String(newData[i][1]).trim();
    const currentType = String(newData[i][12] || "").trim();
    const currentTier = String(newData[i][13] || "").trim();
    
    let nextType = currentType;
    let nextTier = currentTier;
    let needsUpdate = false;

    if (mapping[orderNo]) {
      if (currentType === "" || currentType !== mapping[orderNo].type) {
        nextType = mapping[orderNo].type;
        needsUpdate = true;
      }
      if (currentTier === "" || currentTier !== mapping[orderNo].tier) {
        nextTier = mapping[orderNo].tier;
        needsUpdate = true;
      }
    }
    
    typesCol.push([nextType]);
    tiersCol.push([nextTier]);
    
    if (needsUpdate) updated++;
  }
  
  if (typesCol.length > 0) {
    orderSheet.getRange(2, 13, typesCol.length, 1).setValues(typesCol);
    orderSheet.getRange(2, 14, tiersCol.length, 1).setValues(tiersCol);
  }
  
  SpreadsheetApp.getUi().alert("Đã tự động sửa lỗi lệch cột và đồng bộ thành công " + updated + " đơn hàng cũ!");
}
`;

fs.writeFileSync('syncScript.gs', gasCode);
console.log("Generated optimized syncScript.gs");
