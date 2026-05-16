const fs = require('fs');

const csvText = fs.readFileSync('placement_database - data_order_details.csv', 'utf8');
const lines = csvText.split('\n').slice(1); // skip header

// Date mapping from original CSV (correct dates)
const dateMapping = {
  "0003/2026/PLMR-TLN":"2026-02-15","0004/2026/PLMR-TLN":"2026-02-15","0005/2026/PLMR-TLN":"2026-02-19","0006/2026/PLMR-TLN":"2026-02-19",
  "0009/2026/PLMR-AT":"2026-02-12","0010/2026/PLMR-AT":"2026-02-12","0011/2026/PLMR-AT":"2026-02-14","0012/2026/PLMR-AT":"2026-02-12",
  "0013/2026/PLMR-AT":"2026-02-14","0019/2026/PLMR-TLN":"2026-02-14","0020/2026/PLMR-TLN":"2026-02-21","0021/2026/PLMR-TLN":"2026-02-21",
  "0022/2026/PLMR-TLN":"2026-02-22","0023/2026/PLMR-TLN":"2026-04-12","0028/2026/PLMR-TLN":"2026-02-12","0029/2026/PLMR-AT":"2026-02-19",
  "0030/2026/PLMR-AT":"2026-03-22","0031/2026/PLMR-AT":"2026-02-20","0032/2026/PLMR-AT":"2026-02-20","0034/2026/PLMR-AN":"2026-02-27",
  "0035/2026/PLMR-AT":"2026-02-28","0036/2026/PLMR-AT":"2026-02-05","0037/2026/PLMR-AT":"2026-02-12","0038/2026/PLMR-AT":"2026-02-25",
  "0039/2026/PLMR-AT":"2026-02-26","0040/2026/PLMR-AT":"2026-02-07","0041/2026/PLMR-AT":"2026-02-22","0042/2026/PLMR-TLN":"2026-02-12",
  "0043/2026/PLMR-TLN":"2026-02-11","0044/2026/PLMR-LC":"2026-02-05","0045/2026/PLMR-LC":"2026-02-05","0046/2026/PLMR-LC":"2026-02-05",
  "0047/2026/PLMR-AT":"2026-02-07","0048/2026/PLMR-TLN":"2026-01-08","0049/2026/PLMR-TLN":"2026-03-06","0050/2026/PLMR-TLN":"2026-02-20",
  "0051/2026/PLMR-TLN":"2026-02-26","0052/2026/PLMR-TLN":"2026-02-27","0053/2026/PLMR-TLN":"2026-03-19","0056/2026/PLMR-TLN":"2026-03-27",
  "0057/2026/PLMR-TLN":"2026-03-06","0058/2026/PLMR-TLN":"2026-03-06","0059/2026/PLMR-TLN":"2026-02-11","0060/2026/PLMR-TLN":"2026-02-12",
  "0061/2026/PLMR-TLN":"2026-02-11","0062/2026/PLMR-AT":"2026-02-19","0063/2026/PLMR-AT":"2026-02-06","0064/2026/PLMR-LC":"2026-02-05",
  "0065/2026/PLMR-AT":"2026-02-04","0066/2026/PLMR-AT":"2026-02-04","0067/2026/PLMR-AT":"2026-02-05","0068/2026/PLMR-AT":"2026-02-05",
  "0069/2026/PLMR-AN":"2026-03-06","0070/2026/PLMR-TT":"2026-02-15","0071/2026/PLMR-TT":"2026-02-15","0072/2026/PLMR-TLN":"2026-03-08",
  "0073/2026/PLMR-TLN":"2026-04-08","0074/2026/PLMR-AT":"2026-03-26","0075/2026/PLMR-TLN":"2026-03-18","0076/2026/PLMR-TLN":"2026-05-08",
  "0077/2026/PLMR-AT":"2026-03-07","0078/2026/PLMR-AT":"2026-03-07","0080/2026/PLMR-TLN":"2026-06-05","0081/2026/PLMR-TLN":"2026-06-05",
  "0082/2026/PLMR-TLN":"2026-06-05","0083/2026/PLMR-TLN":"2026-04-13","0090/2026/PLMR-AT":"2026-03-18","0091/2026/PLMR-TLN":"2026-03-25",
  "0092/2026/PLMR-TLN":"2026-03-25","0094/2026/PLMR-TLN":"2026-03-21","0095/2026/PLMR-TLN":"2026-03-21","0096/2026/PLMR-TLN":"2026-03-19",
  "0106/2026/PLMR-LC":"2026-04-02","0107/2026/PLMR-LC":"2026-04-02","0108/2026/PLMR-LC":"2026-04-02","0109/2026/PLMR-LC":"2026-04-02",
  "0110/2026/PLMR-GLX":"2026-04-01","0112/2026/PLMR-GLX":"2026-04-01","0113/2026/PLMR-GLX":"2026-04-01","0116/2026/PLMR-GLX":"2026-03-28",
  "0117/2026/PLMR-GLX":"2026-03-28","0118/2026/PLMR-AT":"2026-04-17","0122/2026/PLMR-AT":"2026-04-06","0123/2026/PLMR-AT":"2026-04-12",
  "0124/2026/PLMR-AT":"2026-04-12","0129/2026/PLMR-AT":"2026-04-30","0130/2026/PLMR-AT":"2026-04-30","0131/2026/PLMR-TLN":"2026-04-13",
  "0133/2026/PLMR-TLN":"2026-04-18","0134/2026/PLMR-TLN":"2026-04-13","0135/2026/PLMR-TLN":"2026-04-06","0136/2026/PLMR-TLN":"2026-04-06",
  "0137/2026/PLMR-TLN":"2026-04-06","0138/2026/PLMR-TLN":"2026-04-23","0139/2026/PLMR-TLN":"2026-04-16","0140/2026/PLMR-TLN":"2026-04-16",
  "0141/2026/PLMR-TLN":"2026-04-16","0146/2026/PLMR-TLN":"2026-04-08","0147/2026/PLMR-TLN":"2026-04-08","0148/2026/PLMR-LC":"2026-04-24",
  "0149/2026/PLMR-LC":"2026-04-24","0150/2026/PLMR-LC":"2026-04-29","0152/2026/PLMR-GLX":"2026-04-25","0153/2026/PLMR-GLX":"2026-04-25",
  "0154/2026/PLMR-GLX":"2026-04-25","0155/2026/PLMR-GLX":"2026-04-25","0156/2026/PLMR-GLX":"2026-05-02","0157/2026/PLMR-GLX":"2026-05-02",
  "0158/2026/PLMR-GLX":"2026-05-02","0161/2026/PLMR-AT":"2026-05-17","0162/2026/PLMR-AT":"2026-05-17","0164/2026/PLMR-AT":"2026-05-22",
  "0165/2026/PLMR-AT":"2026-05-22","0166/2026/PLMR-TLN":"2026-05-07","0167/2026/PLMR-TLN":"2026-05-16","0168/2026/PLMR-TLN":"2026-05-16",
  "0169/2026/PLMR-TLN":"2026-05-16","0171/2026/PLMR-TLN":"2026-05-13","0173/2026/PLMR-TLN":"2026-05-28","0174/2026/PLMR-TLN":"2026-05-28",
  "0177/2026/PLMR-TLN":"2026-05-07","0179/2026/PLMR-LC":"2026-05-15","0180/2026/PLMR-LC":"2026-05-15","0181/2026/PLMR-LC":"2026-05-15",
  "0185/2026/PLMR-LC":"2026-05-31","0186/2026/PLMR-LC":"2026-05-31","0187/2026/PLMR-LC":"2026-05-31","0189/2026/PLMR-LC":"2026-05-31",
  "0196/2026/PLMR-AT":"2026-06-10","0198/2026/PLMR-AT":"2026-06-20","0200/2026/PLMR-AT":"2026-06-28","0201/2026/PLMR-TLN":"2026-06-10",
  "0202/2026/PLMR-TLN":"2026-06-10","0203/2026/PLMR-TLN":"2026-06-18","0204/2026/PLMR-TLN":"2026-06-21","0205/2026/PLMR-TLN":"2026-06-21",
  "0207/2026/PLMR-TLN":"2026-06-05","0208/2026/PLMR-TLN":"2026-06-05","0209/2026/PLMR-TLN":"2026-06-05","0210/2026/PLMR-TLN":"2026-06-18",
  "0212/2026/PLMR-TLN":"2026-06-08","0214/2026/PLMR-TLN":"2026-06-27","0215/2026/PLMR-TLN":"2026-06-27","0216/2026/PLMR-TLN":"2026-06-13",
  "0217/2026/PLMR-TLN":"2026-06-08","0218/2026/PLMR-TLN":"2026-06-08","0219/2026/PLMR-LC":"2026-06-18","0220/2026/PLMR-LC":"2026-06-18",
  "0221/2026/PLMR-LC":"2026-06-07","0222/2026/PLMR-LC":"2026-06-07","0223/2026/PLMR-LC":"2026-06-20","0224/2026/PLMR-LC":"2026-06-20",
  "0226/2026/PLMR-LC":"2026-06-25","0227/2026/PLMR-LC":"2026-06-25","0229/2026/PLMR-TLN":"2026-05-24","0230/2026/PLMR-GLX":"2026-07-01",
  "0231/2026/PLMR-GLX":"2026-07-01","0232/2026/PLMR-GLX":"2026-07-01","0233/2026/PLMR-GLX":"2026-07-01","0234/2026/PLMR-GLX":"2026-07-01",
  "0235/2026/PLMR-GLX":"2026-06-06","0236/2026/PLMR-GLX":"2026-06-06","0237/2026/PLMR-TLN":"2026-05-28","0238/2026/PLMR-TLN":"2026-06-13",
  "0239/2026/PLMR-AT":"2026-04-11","0240/2026/PLMR-AT":"2026-05-24","0241/2026/PLMR-HN KNIT":"2026-03-16","0242/2026/PLMR-HN KNIT":"2026-03-16",
  "0245/2026/PLMR-HN KNIT":"2026-06-03","0246/2026/PLMR-HN KNIT":"2026-06-03","0249/2026/PLMR-TLN":"2026-03-01","0250/2026/PLMR-TLN":"2026-04-08",
  "0251/2026/PLMR-TLN":"2026-05-09","0252/2026/PLMR-TLN":"2026-06-12","0254/2026/PLMR-WS":"2026-05-08","0255/2026/PLMR-WS":"2026-05-08",
  "0260/2026/PLMR-TLN":"2026-06-06","0261/2026/PLMR-TLN":"2026-06-06","0262/2026/PLMR-KP":"2026-05-08","0267/2026/PLMR-KP":"2026-09-26",
  "0268/2026/PLMR-KP":"2026-09-26","0269/2026/PLMR-KP":"2026-09-26","0270/2026/PLMR-VH":"2026-05-10","0271/2026/PLMR-VH":"2026-05-10"
};

// CSV size headers
const sizeHeaders = ['Size S','Size M/29','Size L/30','Size XL/31','Size XXL/32','Size 34','Size FREE'];

// Parse all rows
const orders = {};
for (const line of lines) {
  const raw = line.replace(/\r/g,'').trim();
  if (!raw) continue;
  const cols = raw.split(',');
  const orderNo = cols[0].trim();
  const tenSP = cols[1].trim();
  const artCode = cols[2].trim();
  const mau = cols[3].trim();
  const tongSL = cols[4].trim();
  const donGia = cols[5].trim();
  const thanhTien = cols[6].trim();
  const nplInfo = cols[7].trim();
  const deliveryDate = cols[8].trim();
  const ghiChu = cols[9].trim();
  // sizes
  const sizeData = {};
  sizeHeaders.forEach((h, i) => {
    const v = (cols[10+i] || '').trim();
    if (v && v !== '') sizeData[h] = v;
  });

  if (!orders[orderNo]) orders[orderNo] = { orderNo, rows:[], delivery: deliveryDate };
  orders[orderNo].rows.push({ tenSP, artCode, mau, tongSL, donGia, thanhTien, nplInfo, deliveryDate, ghiChu, sizeData });
}

// Build detail rows and order rows
const detailRows = [];
const orderRows = [];
const SIZE_COLS = ['Size S','Size M/29','Size L/30','Size XL/31','Size XXL/32','Size 34','Size FREE'];

for (const [orderNo, o] of Object.entries(orders)) {
  const orderDate = dateMapping[orderNo] || '';
  const factory = orderNo.split('/')[2] || '';
  let totalQty = 0, subtotal = 0;
  const products = new Set(), colors = new Set();

  // Parse PO month from order date
  let poMonth = '';
  if (orderDate) {
    const d = new Date(orderDate);
    poMonth = d.getMonth() + 1 + '/' + d.getFullYear();
  }

  for (const r of o.rows) {
    totalQty += parseInt(r.tongSL) || 0;
    subtotal += parseFloat(r.thanhTien) || 0;
    products.add(r.tenSP);
    colors.add(r.mau);
    
    // Build detail row: [OrderNo,TenSP,ArtCode,Mau,TongSL,DonGia,ThanhTien,NplInfo,TGianGiao,GhiChu, Vai,Bo,NPL,NgaySyn,GhiChuDuyet, S,M/29,L/30,XL/31,XXL/32,34,FREE]
    const row = [
      orderNo, r.tenSP, r.artCode, r.mau, r.tongSL, r.donGia, r.thanhTien, r.nplInfo, r.deliveryDate, r.ghiChu,
      'Pending','Pending','Pending','',''
    ];
    SIZE_COLS.forEach(s => row.push((r.sizeData[s] || '')));
    detailRows.push(row);
  }

  // Build order row: [Timestamp,OrderNo,OrderDate,Creator,Company,Factory,Address,VAT,Subtotal,VATAmt,Total,PoMonth,Vai,D18,D21,D22,D27,Bo,NPL,SyncDate,Note,TotalQty,Products,Colors]
  const ts = new Date().toISOString();
  let d18='',d21='',d22='',d27='';
  if (orderDate) {
    const base = new Date(orderDate);
    const addDays = (n) => { const d = new Date(base); d.setDate(d.getDate()+n); return d.toISOString().split('T')[0]; };
    d18=addDays(18); d21=addDays(21); d22=addDays(22); d27=addDays(27);
  }
  orderRows.push([ts, orderNo, orderDate, 'Admin', 'PLMR', factory,'', 0, subtotal, 0, subtotal, poMonth,
    'Pending', d18, d21, d22, d27, 'Pending','Pending','','', totalQty,
    [...products].join(', '), [...colors].join(', ')]);
}

// Generate GAS function
let gasCode = 
/**
 * Ch?y hàm này 1 l?n d? import toàn b? d? li?u t? CSV g?c vào Google Sheets.
 * Hãy XÓA S?CH d? li?u trong data_order và data_order_details tru?c khi ch?y.
 */
function masterImportFromCSV() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // ===== 1. IMPORT data_order_details =====
  var detailSheet = ss.getSheetByName('data_order_details');
  if (!detailSheet) detailSheet = ss.insertSheet('data_order_details');
  
  var detailHeaders = ['Mã don hàng','Tên SP','Art Code','Màu','T?ng SL','Ðon giá','Thành ti?n (tru?c VAT)','Thông tin NPL','T.Gian Giao','Ghi Chú','Tr?ng thái V?i','Tr?ng thái Bo','Ð?ng b? NPL','Ngày d?ng b?','Ghi chú duy?t','Size S','Size M/29','Size L/30','Size XL/31','Size XXL/32','Size 34','Size FREE'];
  detailSheet.clearContents();
  detailSheet.getRange(1,1,1,detailHeaders.length).setValues([detailHeaders]);
  detailSheet.getRange(1,1,1,detailHeaders.length).setFontWeight('bold').setBackground('#fff2cc');
  detailSheet.setFrozenRows(1);

  var detailData = ;
  var numCols = detailHeaders.length;
  var normalizedDetail = detailData.map(function(r) {
    var row = r.slice(0, numCols);
    while (row.length < numCols) row.push('');
    return row;
  });
  if (normalizedDetail.length > 0) {
    detailSheet.getRange(2,1,normalizedDetail.length,numCols).setValues(normalizedDetail);
  }

  // ===== 2. IMPORT data_order =====
  var orderSheet = ss.getSheetByName('data_order');
  if (!orderSheet) orderSheet = ss.insertSheet('data_order');
  
  var orderHeaders = ['Th?i gian luu','Mã don hàng','Ngày d?t hàng','Ngu?i t?o','Công ty','Nhà cung c?p','Ð?a ch? NCC','Thu? VAT (%)','T?ng t?m tính','Ti?n VAT','T?ng c?ng','PO Tháng','Tr?ng thái V?i','H?n Duy?t (D+18)','H?n C?t V?i (D+21)','H?n Lên Chuy?n (D+22)','H?n Hoàn Thành (D+27)','Tr?ng thái Bo','Tr?ng thái NPL','Ngày Ð?ng B?','Ghi Chú','T?ng SL','Danh sách SP','Danh sách Màu'];
  orderSheet.clearContents();
  orderSheet.getRange(1,1,1,orderHeaders.length).setValues([orderHeaders]);
  orderSheet.getRange(1,1,1,orderHeaders.length).setFontWeight('bold').setBackground('#d0e0e3');
  orderSheet.setFrozenRows(1);
  
  var orderData = ;
  var numOrderCols = orderHeaders.length;
  var normalizedOrder = orderData.map(function(r) {
    var row = r.slice(0, numOrderCols);
    while (row.length < numOrderCols) row.push('');
    return row;
  });
  if (normalizedOrder.length > 0) {
    orderSheet.getRange(2,1,normalizedOrder.length,numOrderCols).setValues(normalizedOrder);
  }

  SpreadsheetApp.getUi().alert('Import xong!\\n- data_order_details: ' + normalizedDetail.length + ' dòng\\n- data_order: ' + normalizedOrder.length + ' dòng');
}
;

fs.writeFileSync('import_function.gs', gasCode);
console.log('Generated import_function.gs');
console.log('Total orders:', Object.keys(orders).length);
console.log('Total detail rows:', detailRows.length);
