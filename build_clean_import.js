const fs = require('fs');

const orderCsvFile = 'PP_ KHSX TOTAL 26 - DATA Đặt Hàng 2026.csv';
const receivingCsvFile = 'PP_ KHSX TOTAL 26 - DATA NHẬP PO 2026.csv';
const outputGsFile = 'import_all_2026.gs';

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

function cleanInt(valStr) {
    if (!valStr) return 0;
    let s = String(valStr).trim().replace(/\./g, '').replace(/,/g, '').replace(/đ/gi, '').replace(/\s+/g, '');
    let m = s.match(/(-?\d+)/);
    if (m) {
        let v = parseInt(m[1], 10);
        return v !== -1 ? v : 0;
    }
    return 0;
}

function cleanSizeStr(valStr) {
    if (!valStr) return "";
    let s = String(valStr).trim().replace(/\./g, '').replace(/,/g, '');
    let m = s.match(/(-?\d+)/);
    if (m) {
        let v = parseInt(m[1], 10);
        return v > 0 ? String(v) : "";
    }
    return "";
}

function parseDateStr(dStr, defaultDt) {
    if (!dStr) return defaultDt ? defaultDt.toISOString().split('T')[0] : "";
    let s = String(dStr).trim();
    if (s.includes('1899')) return defaultDt ? defaultDt.toISOString().split('T')[0] : "";
    
    let m = s.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
    if (m) {
        let day = parseInt(m[1], 10);
        let month = parseInt(m[2], 10);
        let year = parseInt(m[3], 10);
        if (year < 100) year += 2000;
        let mm = month < 10 ? '0' + month : String(month);
        let dd = day < 10 ? '0' + day : String(day);
        return `${year}-${mm}-${dd}`;
    }
    return defaultDt ? defaultDt.toISOString().split('T')[0] : s;
}

function extractPoMonth(s) {
    if (!s) return "3/2026";
    let str = String(s).trim();
    let m = str.match(/(\d+)/);
    if (m) {
        return `${m[1]}/2026`;
    }
    return "3/2026";
}

console.log("Reading Orders CSV...");
let orderCsvContent = fs.readFileSync(orderCsvFile, 'utf8').replace(/^\uFEFF/, '');
const orderRowsRaw = parseCSV(orderCsvContent);

const ordersMapping = {};
const detailRows = [];
const orderGroups = {};

// JS Month is 0-indexed: 1 means Feb
const defaultOrderDt = new Date(Date.UTC(2026, 1, 14));

// Row index 9 is the first data row
for (let idx = 9; idx < orderRowsRaw.length; idx++) {
    const row = orderRowsRaw[idx];
    if (!row || row.length < 33) continue;
    
    const stt = row[0] ? row[0].trim() : "";
    if (!stt || isNaN(stt)) continue;
    
    const status = row[25] ? row[25].trim() : "";
    if (status.toLowerCase().includes('cancel')) continue;
    
    let partner = row[17] ? row[17].trim() : "";
    if (!partner) partner = "TLN";
    
    const sttPadded = stt.padStart(4, '0');
    const orderNo = `${sttPadded}/2026/PLMR-${partner}`;
    
    const orderType = row[1] ? row[1].trim() : "";
    const productTier = row[2] ? row[2].trim() : "";
    const productName = row[3] ? row[3].trim() : "";
    const artCode = row[5] ? row[5].trim() : "";
    const color = row[6] ? row[6].trim() : "";
    
    const sQty = cleanSizeStr(row[9]);
    const mQty = cleanSizeStr(row[10]);
    const lQty = cleanSizeStr(row[11]);
    const xlQty = cleanSizeStr(row[12]);
    const xxlQty = cleanSizeStr(row[13]);
    
    let totalQty = cleanInt(row[14]);
    const unitPrice = cleanInt(row[15]);
    
    // If totalQty is 0 but sizes exist, sum them up
    if (totalQty === 0) {
        let sumSizes = 0;
        [sQty, mQty, lQty, xlQty, xxlQty].forEach(q => { if (q) sumSizes += parseInt(q, 10); });
        if (sumSizes > 0) totalQty = sumSizes;
    }
    
    // Bỏ qua dòng rác/template trống không có thông tin đơn hàng
    if (!productName && totalQty === 0) continue;
    
    let subtotal = totalQty * unitPrice;
    
    let freeQty = "";
    if (totalQty > 0 && !sQty && !mQty && !lQty && !xlQty && !xxlQty) {
        freeQty = String(totalQty);
    }
    
    const poMonth = extractPoMonth(row[18]);
    const orderDateStr = parseDateStr(row[19], defaultOrderDt);
    
    let deliveryStr = row[26] ? row[26].trim() : "";
    if (!deliveryStr || deliveryStr.includes('1899')) {
        deliveryStr = row[20] ? row[20].trim() : "";
    }
    
    // Delivery date default fallback: order date + 27 days
    let oBaseDt = defaultOrderDt;
    if (orderDateStr) {
        let parts = orderDateStr.split('-');
        if (parts.length === 3) oBaseDt = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2])));
    }
    let delDefaultDt = new Date(oBaseDt.getTime() + 27 * 86400000);
    const deliveryDateStr = parseDateStr(deliveryStr, delDefaultDt);
    
    const note = row[31] ? row[31].trim() : "";
    
    if (!ordersMapping[orderNo]) {
        ordersMapping[orderNo] = {
            type: orderType,
            tier: productTier,
            partner: partner,
            partnerAddress: "",
            orderDate: orderDateStr,
            poMonth: poMonth,
            company: "POLOMANOR"
        };
    } else {
        if (!ordersMapping[orderNo].type && orderType) ordersMapping[orderNo].type = orderType;
        if (!ordersMapping[orderNo].tier && productTier) ordersMapping[orderNo].tier = productTier;
    }
    
    // Detail Row structure:
    // ["Mã đơn hàng", "Tên SP", "Art Code", "Màu", "Tổng SL", "Đơn giá", "Thành tiền (trước VAT)", "Thông tin NPL", "T.Gian Giao", "Ghi Chú", "Trạng thái Vải", "Trạng thái Bo", "Đóng bộ NPL", "Ngày đồng bộ", "Ghi chú duyệt", "Size S/29", "Size M/30", "Size L/31", "Size XL/32", "Size XXL/34", "Size FREE"]
    const dRow = [
        orderNo, productName, artCode, color, totalQty, unitPrice, subtotal,
        "", deliveryDateStr, note, "Pending", "Pending", "Pending", "", "",
        sQty, mQty, lQty, xlQty, xxlQty, freeQty
    ];
    detailRows.push(dRow);
    
    if (!orderGroups[orderNo]) orderGroups[orderNo] = [];
    orderGroups[orderNo].push({
        productName: productName,
        color: color,
        totalQty: totalQty,
        subtotal: subtotal,
        note: note
    });
}

// Construct orderRows
const orderRows = [];
const isoNow = new Date().toISOString();

Object.keys(orderGroups).forEach(orderNo => {
    const items = orderGroups[orderNo];
    const meta = ordersMapping[orderNo];
    
    let orderTotalQty = 0;
    let orderSubtotal = 0;
    const products = [];
    const colorCombos = [];
    const notes = [];
    
    items.forEach(it => {
        orderTotalQty += it.totalQty;
        orderSubtotal += it.subtotal;
        const p = it.productName || "SP";
        const c = it.color || "Không màu";
        if (!products.includes(p)) products.push(p);
        const combo = `${p} (${c})`;
        if (!colorCombos.includes(combo)) colorCombos.push(combo);
        if (it.note && !notes.includes(it.note)) notes.push(it.note);
    });
    
    const pSummary = products.join(", ");
    const cSummary = colorCombos.join(", ");
    const nSummary = notes.join(", ");
    
    let baseDt = defaultOrderDt;
    if (meta.orderDate) {
        let parts = meta.orderDate.split('-');
        if (parts.length === 3) baseDt = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2])));
    }
    
    const calcD = (days) => new Date(baseDt.getTime() + days * 86400000).toISOString().split('T')[0];
    const d18 = calcD(18);
    const d21 = calcD(21);
    const d22 = calcD(22);
    const d27 = calcD(27);
    
    // Order Row structure:
    // ["Thời gian lưu", "Mã đơn hàng", "Ngày đặt hàng", "Người tạo", "Công ty", "Nhà cung cấp", "Địa chỉ NCC", "Thuế VAT (%)", "Tổng tạm tính", "Tiền VAT", "Tổng cộng", "PO Tháng", "Phân Loại ĐH", "Phân Cấp SP", "Trạng thái Vải", "Hạn Duyệt (D+18)", "Hạn Cắt Vải (D+21)", "Hạn Lên Chuyền (D+22)", "Hạn Hoàn Thành (D+27)", "Trạng thái Bo", "Trạng thái NPL", "Ngày Đồng Bộ", "Ghi Chú", "Tổng SL", "Danh sách SP", "Danh sách Màu"]
    const oRow = [
        isoNow, orderNo, meta.orderDate, "System Import", meta.company,
        meta.partner, meta.partnerAddress, 0, orderSubtotal, 0, orderSubtotal,
        meta.poMonth, meta.type, meta.tier, "Pending", d18, d21, d22, d27,
        "Pending", "Pending", "", nSummary, orderTotalQty, pSummary, cSummary
    ];
    orderRows.push(oRow);
});

console.log(`Parsed ${orderRows.length} unique orders and ${detailRows.length} detail items.`);

console.log("Reading Receiving CSV...");
let recCsvContent = fs.readFileSync(receivingCsvFile, 'utf8').replace(/^\uFEFF/, '');
const recRowsRaw = parseCSV(recCsvContent);
const receivingRows = [];

// Row index 2 is the first data row
for (let idx = 2; idx < recRowsRaw.length; idx++) {
    const row = recRowsRaw[idx];
    if (!row || row.length < 17 || !row[0] || !row[0].trim()) continue;
    
    const maDon = row[0].trim();
    const sttStr = maDon.split('_')[0];
    if (!sttStr || isNaN(sttStr)) continue;
    
    const statusNote = row[10] ? row[10].trim() : "";
    if (statusNote.toLowerCase().includes('cancel')) continue;
    
    const sttPadded = sttStr.padStart(4, '0');
    let partner = (row.length > 12 && row[12] && row[12].trim()) ? row[12].trim() : "TLN";
    const orderNo = `${sttPadded}/2026/PLMR-${partner}`;
    
    const productName = row[1] ? row[1].trim() : "";
    const batchName = (row[2] && row[2].trim()) ? row[2].trim() : "Lần 1";
    
    const sQty = cleanSizeStr(row[3]);
    const mQty = cleanSizeStr(row[4]);
    const lQty = cleanSizeStr(row[5]);
    const xlQty = cleanSizeStr(row[6]);
    const xxlQty = cleanSizeStr(row[7]);
    
    let totalRec = cleanInt(row[8]);
    if (totalRec <= 0) {
        let sSum = 0;
        [sQty, mQty, lQty, xlQty, xxlQty].forEach(q => { if (q) sSum += parseInt(q, 10); });
        if (sSum > 0) totalRec = sSum;
    }
    
    if (totalRec <= 0) continue;
    
    let freeQty = "";
    if (totalRec > 0 && !sQty && !mQty && !lQty && !xlQty && !xxlQty) {
        freeQty = String(totalRec);
    }
    
    const recDateStr = parseDateStr(row[9], new Date(defaultOrderDt.getTime() + 30 * 86400000));
    const note = row[10] ? row[10].trim() : "";
    
    let poMonth = (row.length > 13 && row[13] && row[13].trim()) ? extractPoMonth(row[13]) : "3/2026";
    
    let oType = "";
    let oTier = "";
    if (ordersMapping[orderNo]) {
        oType = ordersMapping[orderNo].type;
        oTier = ordersMapping[orderNo].tier;
        if (ordersMapping[orderNo].poMonth) poMonth = ordersMapping[orderNo].poMonth;
    }
    
    // Try to lookup artCode and color from detail rows
    let aCode = "";
    let col = "";
    for (let dr of detailRows) {
        if (dr[0] === orderNo && dr[1] === productName) {
            aCode = dr[2];
            col = dr[3];
            break;
        }
    }
    
    // Receiving Row structure:
    // ["Thời gian lưu", "Mã đơn hàng", "PO Tháng", "Phân loại sản phẩm", "Phân cấp sản phẩm", "Người nhập", "Ngày nhập", "Đợt nhập", "Tên SP", "Art Code", "Màu", "Tổng SL nhận", "Ghi chú", "Size S/29", "Size M/30", "Size L/31", "Size XL/32", "Size XXL/34", "Size FREE"]
    const rRow = [
        isoNow, orderNo, poMonth, oType, oTier, "System Import", recDateStr,
        batchName, productName, aCode, col, totalRec, note,
        sQty, mQty, lQty, xlQty, xxlQty, freeQty
    ];
    receivingRows.push(rRow);
}

console.log(`Parsed ${receivingRows.length} receiving rows.`);

console.log(`Generating ${outputGsFile}...`);

const gasTemplate = `/**
 * Hàm nhập toàn bộ dữ liệu sạch 2026 vào hệ thống.
 * Chạy hàm này trên giao diện Google Apps Script để tự động làm sạch và đồng bộ 100% dữ liệu.
 */
function importCleanData2026() {
  function toDate(s) {
    if (!s) return "";
    var str = String(s);
    var m = str.match(/(\\d{4})-(\\d{2})-(\\d{2})/);
    if (m) return new Date(parseInt(m[1]), parseInt(m[2])-1, parseInt(m[3]));
    return s;
  }
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    SpreadsheetApp.getUi().alert("Vui lòng mở bảng tính hoặc chạy trực tiếp từ script gắn liền với bảng tính.");
    return;
  }
  
  // 1. IMPORT data_order_details
  var detailSheet = ss.getSheetByName("data_order_details");
  if (!detailSheet) detailSheet = ss.insertSheet("data_order_details");
  var detailHeaders = ["Mã đơn hàng","Tên SP","Art Code","Màu","Tổng SL","Đơn giá","Thành tiền (trước VAT)","Thông tin NPL","T.Gian Giao","Ghi Chú","Trạng thái Vải","Trạng thái Bo","Đóng bộ NPL","Ngày đồng bộ","Ghi chú duyệt","Size S/29","Size M/30","Size L/31","Size XL/32","Size XXL/34","Size FREE"];
  detailSheet.clearContents();
  detailSheet.getRange(1, 1, 1, detailHeaders.length).setValues([detailHeaders]);
  detailSheet.getRange(1, 1, 1, detailHeaders.length).setFontWeight("bold").setBackground("#fff2cc");
  detailSheet.setFrozenRows(1);
  
  var detailData = ${JSON.stringify(detailRows)};
  var numCols = detailHeaders.length;
  detailData = detailData.map(function(r) {
    var row = r.slice(0, numCols);
    while (row.length < numCols) row.push("");
    row[8] = toDate(row[8]); // T.Gian Giao
    return row;
  });
  if (detailData.length > 0) {
    detailSheet.getRange(2, 1, detailData.length, numCols).setValues(detailData);
    detailSheet.getRange(2, 9, detailData.length, 1).setNumberFormat("dd/mm/yyyy");
  }
  
  // 2. IMPORT data_order
  var orderSheet = ss.getSheetByName("data_order");
  if (!orderSheet) orderSheet = ss.insertSheet("data_order");
  var orderHeaders = ["Thời gian lưu","Mã đơn hàng","Ngày đặt hàng","Người tạo","Công ty","Nhà cung cấp","Địa chỉ NCC","Thuế VAT (%)","Tổng tạm tính","Tiền VAT","Tổng cộng","PO Tháng","Phân Loại ĐH","Phân Cấp SP","Trạng thái Vải","Hạn Duyệt (D+18)","Hạn Cắt Vải (D+21)","Hạn Lên Chuyền (D+22)","Hạn Hoàn Thành (D+27)","Trạng thái Bo","Trạng thái NPL","Ngày Đồng Bộ","Ghi Chú","Tổng SL","Danh sách SP","Danh sách Màu"];
  orderSheet.clearContents();
  orderSheet.getRange(1, 1, 1, orderHeaders.length).setValues([orderHeaders]);
  orderSheet.getRange(1, 1, 1, orderHeaders.length).setFontWeight("bold").setBackground("#d0e0e3");
  orderSheet.setFrozenRows(1);
  
  var orderData = ${JSON.stringify(orderRows)};
  var numOrderCols = orderHeaders.length;
  orderData = orderData.map(function(r) {
    var row = r.slice(0, numOrderCols);
    while (row.length < numOrderCols) row.push("");
    row[0] = r[0] ? new Date(r[0]) : new Date(); // Thời gian lưu
    row[2] = toDate(row[2]); // Ngày đặt hàng
    row[15] = toDate(row[15]);
    row[16] = toDate(row[16]);
    row[17] = toDate(row[17]);
    row[18] = toDate(row[18]);
    return row;
  });
  if (orderData.length > 0) {
    orderSheet.getRange(2, 1, orderData.length, numOrderCols).setValues(orderData);
    orderSheet.getRange(2, 3, orderData.length, 1).setNumberFormat("dd/mm/yyyy");
    orderSheet.getRange(2, 16, orderData.length, 4).setNumberFormat("dd/mm/yyyy");
  }
  
  // 3. IMPORT data_receiving
  var receivingSheet = ss.getSheetByName("data_receiving");
  if (!receivingSheet) receivingSheet = ss.insertSheet("data_receiving");
  var receivingHeaders = ["Thời gian lưu","Mã đơn hàng","PO Tháng","Phân loại sản phẩm","Phân cấp sản phẩm","Người nhập","Ngày nhập","Đợt nhập","Tên SP","Art Code","Màu","Tổng SL nhận","Ghi chú","Size S/29","Size M/30","Size L/31","Size XL/32","Size XXL/34","Size FREE"];
  receivingSheet.clearContents();
  receivingSheet.getRange(1, 1, 1, receivingHeaders.length).setValues([receivingHeaders]);
  receivingSheet.getRange(1, 1, 1, receivingHeaders.length).setFontWeight("bold").setBackground("#d9ead3");
  receivingSheet.setFrozenRows(1);
  
  var receivingData = ${JSON.stringify(receivingRows)};
  var numRecCols = receivingHeaders.length;
  receivingData = receivingData.map(function(r) {
    var row = r.slice(0, numRecCols);
    while (row.length < numRecCols) row.push("");
    row[0] = r[0] ? new Date(r[0]) : new Date();
    row[6] = toDate(row[6]); // Ngày nhập
    return row;
  });
  if (receivingData.length > 0) {
    receivingSheet.getRange(2, 1, receivingData.length, numRecCols).setValues(receivingData);
    receivingSheet.getRange(2, 7, receivingData.length, 1).setNumberFormat("dd/mm/yyyy");
  }
  
  SpreadsheetApp.getUi().alert("Đã đồng bộ thành công toàn bộ dữ liệu 2026 sạch lên Google Sheets!\\n- Chi tiết ĐH: " + detailData.length + " dòng\\n- Đơn hàng: " + orderData.length + " dòng\\n- Nhập kho: " + receivingData.length + " dòng");
}
`;

fs.writeFileSync(outputGsFile, gasTemplate, 'utf8');
console.log(`Done! Created ${outputGsFile} successfully.`);

console.log("Updating HISTORICAL_MAPPING in Code.gs...");
const codeGsPath = 'Code.gs';
if (fs.existsSync(codeGsPath)) {
    let codeGsContent = fs.readFileSync(codeGsPath, 'utf8');
    const startMarker = 'const HISTORICAL_MAPPING = {';
    const startIndex = codeGsContent.indexOf(startMarker);
    if (startIndex !== -1) {
        const endMarkerMarker = 'function fixOrderRow';
        const fixOrderRowIndex = codeGsContent.indexOf(endMarkerMarker, startIndex);
        if (fixOrderRowIndex !== -1) {
            const blockSub = codeGsContent.substring(startIndex, fixOrderRowIndex);
            const lastClosingIndex = blockSub.lastIndexOf('};');
            if (lastClosingIndex !== -1) {
                const absoluteClosingIndex = startIndex + lastClosingIndex + 2;
                
                let existingMapping = {};
                try {
                    const objStr = codeGsContent.substring(startIndex + startMarker.length - 1, absoluteClosingIndex - 1);
                    existingMapping = JSON.parse(objStr);
                } catch(e) {
                    console.log("Could not JSON.parse existing mapping, using regex fallback...");
                    const regex = /"([^"]+)":\s*\{\s*"type":\s*"([^"]*)",\s*"tier":\s*"([^"]*)"\s*\}/g;
                    let m;
                    while ((m = regex.exec(codeGsContent.substring(startIndex, absoluteClosingIndex))) !== null) {
                        existingMapping[m[1]] = { type: m[2], tier: m[3] };
                    }
                }
                
                const mergedMapping = {};
                Object.keys(existingMapping).forEach(k => {
                    mergedMapping[k] = {
                        type: existingMapping[k].type || "",
                        tier: existingMapping[k].tier || ""
                    };
                });
                
                Object.keys(ordersMapping).forEach(k => {
                    if (!mergedMapping[k]) {
                        mergedMapping[k] = { type: "", tier: "" };
                    }
                    if (ordersMapping[k].type) mergedMapping[k].type = ordersMapping[k].type;
                    if (ordersMapping[k].tier) mergedMapping[k].tier = ordersMapping[k].tier;
                });
                
                const sortedKeys = Object.keys(mergedMapping).sort();
                let newMappingStr = "const HISTORICAL_MAPPING = {\n";
                sortedKeys.forEach((k, idx) => {
                    newMappingStr += `  "${k}": {\n`;
                    newMappingStr += `    "type": "${mergedMapping[k].type}",\n`;
                    newMappingStr += `    "tier": "${mergedMapping[k].tier}"\n`;
                    newMappingStr += `  }${idx < sortedKeys.length - 1 ? ',' : ''}\n`;
                });
                newMappingStr += "};";
                
                const newCodeGsContent = codeGsContent.substring(0, startIndex) + newMappingStr + codeGsContent.substring(absoluteClosingIndex);
                fs.writeFileSync(codeGsPath, newCodeGsContent, 'utf8');
                console.log(`Successfully updated Code.gs with ${sortedKeys.length} historical product mappings!`);
            }
        }
    }
}

