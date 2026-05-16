const fs = require('fs');

// Read the big CSV (correct sizes, no "Pass" corruption)
const bigCsv = fs.readFileSync('PP_ KHSX TOTAL 26 - DATA Đặt Hàng 2026.csv', 'utf8');
const bigLines = bigCsv.split('\n');

// Data starts at row index 9 (row 10 in file = first actual data row)
const dataRows = bigLines.slice(9);

// Also read detail CSV for NPL info mapping
const detailCsv = fs.readFileSync('placement_database - data_order_details.csv', 'utf8');
const detailLines = detailCsv.split('\n').slice(1);
const nplMap = {}; // orderNo -> nplInfo
for (const line of detailLines) {
  const raw = line.replace(/\r/g, '').trim();
  if (!raw) continue;
  const cols = raw.split(',');
  const orderNo = cols[0].trim();
  const nplInfo = cols[7] || '';
  const ghiChu = cols[9] || '';
  if (!nplMap[orderNo]) nplMap[orderNo] = { nplInfo, ghiChu };
}

const SIZE_NAMES = ['S', 'M/29', 'L/30', 'XL/31', 'XXL/32'];
const SIZE_COLS_IDX = [9, 10, 11, 12, 13];

const detailRows = [];
const orderRows = [];
let count = 0;

for (const line of dataRows) {
  const raw = line.replace(/\r/g, '').trim();
  if (!raw) continue;

  // Handle quoted fields with embedded newlines by basic split
  const cols = raw.split(',');
  if (!cols[0] || !cols[0].trim() || !cols[0].trim().match(/^\d+$/)) continue;
  if (cols.length < 26) continue;

  const stt = cols[0].trim();
  const sttPadded = stt.padStart(4, '0');
  const factory = (cols[17] || '').trim();
  if (!factory) continue;

  const orderNo = `${sttPadded}/2026/PLMR-${factory}`;
  const productName = (cols[3] || '').trim();
  const artCode = (cols[5] || '').trim();
  const color = (cols[6] || '').trim();

  if (!productName || !color) continue;

  // Skip cancelled
  const status = (cols[25] || '').trim();
  if (status.toLowerCase() === 'cancel') continue;

  // Parse sizes
  const sizeData = {};
  for (let i = 0; i < SIZE_COLS_IDX.length; i++) {
    const raw_val = (cols[SIZE_COLS_IDX[i]] || '').trim().replace(/\./g, '').replace(/,/g, '');
    if (raw_val && /^\d+$/.test(raw_val) && parseInt(raw_val) > 0) {
      sizeData[SIZE_NAMES[i]] = parseInt(raw_val);
    }
  }

  // Qty
  const qtyRaw = (cols[14] || '').trim().replace(/\./g, '').replace(/,/g, '');
  const qty = parseInt(qtyRaw) || 0;
  if (qty === 0 && Object.keys(sizeData).length === 0) continue;

  // If no size data and qty > 0, use FREE
  if (Object.keys(sizeData).length === 0 && qty > 0) {
    sizeData['FREE'] = qty;
  }

  // Price
  const priceRaw = (cols[15] || '').trim().replace(/\./g, '').replace(/ ?đ/g, '').replace(/,/g, '.');
  const unitPrice = parseFloat(priceRaw) || 0;
  const totalRaw = (cols[16] || '').trim().replace(/\./g, '').replace(/ ?đ/g, '').replace(/,/g, '.');
  const totalVal = parseFloat(totalRaw) || 0;

  // Delivery date - col 26 = NGÀY NHẬP KHO DỰ KIẾN, fallback col 20
  let deliveryStr = (cols[26] || '').trim();
  if (!deliveryStr || deliveryStr === '31/12/1899') deliveryStr = (cols[20] || '').trim();
  
  // Parse delivery date DD/MM/YYYY
  let deliveryISO = '';
  let orderDateISO = '';
  if (deliveryStr && deliveryStr.match(/\d{1,2}\/\d{1,2}\/\d{4}/)) {
    const m = deliveryStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (m) {
      deliveryISO = `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
      // Order date = delivery - 27 days
      const dDate = new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
      dDate.setDate(dDate.getDate() - 27);
      orderDateISO = dDate.toISOString().split('T')[0];
    }
  }

  // PO Month from timeline col 18
  let poMonth = '';
  const timeline = (cols[18] || '').trim();
  const monthMatch = timeline.match(/Tháng\s+(\d+)/i);
  if (monthMatch) poMonth = `${monthMatch[1]}/2026`;

  const nplInfo = (nplMap[orderNo] || {}).nplInfo || '';
  const ghiChu = (cols[32] || (nplMap[orderNo] || {}).ghiChu || '').trim();

  // Build detail row: [OrderNo,TenSP,ArtCode,Mau,TongSL,DonGia,ThanhTien,NplInfo,TGianGiao,GhiChu,Vai,Bo,NPL,NgaySyn,GhiChuDuyet,SizeS,SizeM,SizeL,SizeXL,SizeXXL,Size34,SizeFREE]
  const sizeRow = [
    sizeData['S'] || '',
    sizeData['M/29'] || '',
    sizeData['L/30'] || '',
    sizeData['XL/31'] || '',
    sizeData['XXL/32'] || '',
    sizeData['34'] || '',
    sizeData['FREE'] || ''
  ];
  detailRows.push([orderNo, productName, artCode, color, qty, unitPrice, totalVal, nplInfo, deliveryISO, ghiChu, 'Pending', 'Pending', 'Pending', '', '', ...sizeRow]);

  const orderType = (cols[1] || '').trim();
  const productTier = (cols[2] || '').trim();

  // Build order row (26 columns)
  let d18='', d21='', d22='', d27='';
  if (orderDateISO) {
    const base = new Date(orderDateISO);
    const add = n => { const d = new Date(base); d.setDate(d.getDate() + n); return d.toISOString().split('T')[0]; };
    d18 = add(18); d21 = add(21); d22 = add(22); d27 = add(27);
  }
  const ts = new Date().toISOString();
  // Columns: Thoi gian luu, Ma DH, Ngay DH, Nguoi tao, Cong ty, NCC, Dia chi NCC, Thue VAT, Tam tinh, Tien VAT, Tong cong, PO Thang, Phan Loai, Phan Cap, TT Vai, D+18, D+21, D+22, D+27, TT Bo, TT NPL, Ngay Syn, Ghi Chu, Tong SL, DSSP, DSMau
  orderRows.push([ts, orderNo, orderDateISO, 'System Import', 'POLOMANOR', factory, '', 0, totalVal, 0, totalVal, poMonth, orderType, productTier, 'Pending', d18, d21, d22, d27, 'Pending', 'Pending', '', ghiChu, qty, productName, color]);

  count++;
}

console.log(`Parsed ${count} valid orders`);
fs.writeFileSync('data_detail_rows.json', JSON.stringify(detailRows));
fs.writeFileSync('data_order_rows.json', JSON.stringify(orderRows));
console.log('Saved data_detail_rows.json and data_order_rows.json');
