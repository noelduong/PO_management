import csv
import json
import re
from datetime import datetime, timedelta

order_csv_file = 'PP_ KHSX TOTAL 26 - DATA Đặt Hàng 2026.csv'
receiving_csv_file = 'PP_ KHSX TOTAL 26 - DATA NHẬP PO 2026.csv'
output_gs_file = 'import_all_2026.gs'

def clean_int(val_str):
    if not val_str:
        return 0
    s = val_str.strip().replace('.', '').replace(',', '')
    # extract numeric part if any currency symbols exist
    m = re.search(r'(-?\d+)', s)
    if m:
        val = int(m.group(1))
        return val if val != -1 else 0
    return 0

def clean_size_str(val_str):
    if not val_str:
        return ""
    s = val_str.strip().replace('.', '').replace(',', '')
    m = re.search(r'(-?\d+)', s)
    if m:
        val = int(m.group(1))
        return str(val) if val > 0 else ""
    return ""

def parse_date(d_str, default_dt=None):
    d_str = d_str.strip()
    if not d_str or '1899' in d_str:
        return default_dt.strftime('%Y-%m-%d') if default_dt else ''
    m = re.search(r'(\d{1,2})/(\d{1,2})/(\d{2,4})', d_str)
    if m:
        day, month, year = int(m.group(1)), int(m.group(2)), int(m.group(3))
        if year < 100:
            year += 2000
        try:
            return datetime(year, month, day).strftime('%Y-%m-%d')
        except:
            pass
    return default_dt.strftime('%Y-%m-%d') if default_dt else d_str

def extract_po_month(s):
    s = s.strip()
    m = re.search(r'(\d+)', s)
    if m:
        return f"{int(m.group(1))}/2026"
    return "3/2026"

print("Reading Orders CSV...")

orders_mapping = {} # order_no -> {type, tier, partner, date, month}
detail_rows = []
order_groups = {} # order_no -> list of item dicts

default_order_dt = datetime(2026, 2, 14)

with open(order_csv_file, 'r', encoding='utf-8-sig') as f:
    reader = csv.reader(f)
    rows = list(reader)

# Row index 9 is the first data row
for idx, row in enumerate(rows[9:]):
    if not row or len(row) < 33:
        continue
    
    stt = row[0].strip()
    if not stt or not stt.isdigit():
        continue
        
    status = row[25].strip()
    if 'cancel' in status.lower():
        continue
        
    partner = row[17].strip()
    if not partner:
        partner = "TLN"
        
    stt_padded = stt.zfill(4)
    order_no = f"{stt_padded}/2026/PLMR-{partner}"
    
    order_type = row[1].strip()
    product_tier = row[2].strip()
    product_name = row[3].strip()
    art_code = row[5].strip()
    color = row[6].strip()
    
    s_qty = clean_size_str(row[9])
    m_qty = clean_size_str(row[10])
    l_qty = clean_size_str(row[11])
    xl_qty = clean_size_str(row[12])
    xxl_qty = clean_size_str(row[13])
    
    total_qty = clean_int(row[14])
    unit_price = clean_int(row[15])
    subtotal = total_qty * unit_price
    
    po_month = extract_po_month(row[18])
    order_date_str = parse_date(row[19], default_order_dt)
    
    # Delivery date fallback
    delivery_str = row[26].strip()
    if not delivery_str or '1899' in delivery_str:
        delivery_str = row[20].strip()
    delivery_date_str = parse_date(delivery_str, default_order_dt + timedelta(days=27))
    
    note = row[31].strip()
    
    if order_no not in orders_mapping:
        orders_mapping[order_no] = {
            'type': order_type,
            'tier': product_tier,
            'partner': partner,
            'partnerAddress': "",
            'order_date': order_date_str,
            'po_month': po_month,
            'company': "POLOMANOR"
        }
    else:
        # Update type/tier if missing
        if not orders_mapping[order_no]['type'] and order_type:
            orders_mapping[order_no]['type'] = order_type
        if not orders_mapping[order_no]['tier'] and product_tier:
            orders_mapping[order_no]['tier'] = product_tier
            
    # If total_qty is 0 but size qtys exist, sum them up
    if total_qty == 0:
        total_qty = sum([int(q) for q in [s_qty, m_qty, l_qty, xl_qty, xxl_qty] if q])
        subtotal = total_qty * unit_price
        
    free_qty = ""
    if total_qty > 0 and not any([s_qty, m_qty, l_qty, xl_qty, xxl_qty]): free_qty = str(total_qty)
    
    # Detail Row structure:
    # ["Mã đơn hàng", "Tên SP", "Art Code", "Màu", "Tổng SL", "Đơn giá", "Thành tiền (trước VAT)", "Thông tin NPL", "T.Gian Giao", "Ghi Chú", "Trạng thái Vải", "Trạng thái Bo", "Đóng bộ NPL", "Ngày đồng bộ", "Ghi chú duyệt", "Size S/29", "Size M/30", "Size L/31", "Size XL/32", "Size XXL/34", "Size FREE"]
    d_row = [
        order_no, product_name, art_code, color, total_qty, unit_price, subtotal,
        "", delivery_date_str, note, "Pending", "Pending", "Pending", "", "",
        s_qty, m_qty, l_qty, xl_qty, xxl_qty, free_qty
    ]
    detail_rows.append(d_row)
    
    if order_no not in order_groups:
        order_groups[order_no] = []
    order_groups[order_no].append({
        'product_name': product_name,
        'color': color,
        'total_qty': total_qty,
        'subtotal': subtotal,
        'note': note
    })

# Construct order_rows
order_rows = []
iso_now = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')

for order_no, items in order_groups.items():
    meta = orders_mapping[order_no]
    order_total_qty = sum(it['total_qty'] for it in items)
    order_subtotal = sum(it['subtotal'] for it in items)
    
    # summaries
    products = []
    color_combos = []
    notes = []
    for it in items:
        p = it['product_name'] or "SP"
        c = it['color'] or "Không màu"
        if p not in products: products.append(p)
        combo = f"{p} ({c})"
        if combo not in color_combos: color_combos.append(combo)
        if it['note'] and it['note'] not in notes: notes.append(it['note'])
        
    p_summary = ", ".join(products)
    c_summary = ", ".join(color_combos)
    n_summary = ", ".join(notes)
    
    # compute D+ benchmarks
    o_dt = datetime.strptime(meta['order_date'], '%Y-%m-%d') if meta['order_date'] else default_order_dt
    d18 = (o_dt + timedelta(days=18)).strftime('%Y-%m-%d')
    d21 = (o_dt + timedelta(days=21)).strftime('%Y-%m-%d')
    d22 = (o_dt + timedelta(days=22)).strftime('%Y-%m-%d')
    d27 = (o_dt + timedelta(days=27)).strftime('%Y-%m-%d')
    
    # Order Row structure:
    # ["Thời gian lưu", "Mã đơn hàng", "Ngày đặt hàng", "Người tạo", "Công ty", "Nhà cung cấp", "Địa chỉ NCC", "Thuế VAT (%)", "Tổng tạm tính", "Tiền VAT", "Tổng cộng", "PO Tháng", "Phân Loại ĐH", "Phân Cấp SP", "Trạng thái Vải", "Hạn Duyệt (D+18)", "Hạn Cắt Vải (D+21)", "Hạn Lên Chuyền (D+22)", "Hạn Hoàn Thành (D+27)", "Trạng thái Bo", "Trạng thái NPL", "Ngày Đồng Bộ", "Ghi Chú", "Tổng SL", "Danh sách SP", "Danh sách Màu"]
    o_row = [
        iso_now, order_no, meta['order_date'], "System Import", meta['company'],
        meta['partner'], meta['partnerAddress'], 0, order_subtotal, 0, order_subtotal,
        meta['po_month'], meta['type'], meta['tier'], "Pending", d18, d21, d22, d27,
        "Pending", "Pending", "", n_summary, order_total_qty, p_summary, c_summary
    ]
    order_rows.append(o_row)

print(f"Parsed {len(order_rows)} unique orders and {len(detail_rows)} detail items.")

print("Reading Receiving CSV...")
receiving_rows = []

with open(receiving_csv_file, 'r', encoding='utf-8-sig') as f:
    reader = csv.reader(f)
    rec_csv_rows = list(reader)

# Row index 2 is the first data row
for row in rec_csv_rows[2:]:
    if not row or len(row) < 17 or not row[0].strip():
        continue
        
    ma_don = row[0].strip()
    stt_str = ma_don.split('_')[0]
    if not stt_str.isdigit():
        continue
        
    status_note = row[10].strip()
    if 'cancel' in status_note.lower():
        continue
        
    stt_padded = stt_str.zfill(4)
    partner = row[12].strip() if len(row) > 12 and row[12].strip() else "TLN"
    order_no = f"{stt_padded}/2026/PLMR-{partner}"
    
    product_name = row[1].strip()
    batch_name = row[2].strip() if row[2].strip() else "Lần 1"
    
    s_qty = clean_size_str(row[3])
    m_qty = clean_size_str(row[4])
    l_qty = clean_size_str(row[5])
    xl_qty = clean_size_str(row[6])
    xxl_qty = clean_size_str(row[7]) Free size total is row[8]
    
    total_rec = clean_int(row[8])
    if total_rec <= 0:
        # sum up sizes if any
        total_rec = sum([int(q) for q in [s_qty, m_qty, l_qty, xl_qty, xxl_qty] if q]) ফ্রি size qty setup
        
    if total_rec <= 0:
        continue
        
    free_qty = ""
    if total_rec > 0 and not any([s_qty, m_qty, l_qty, xl_qty, xxl_qty]):
        free_qty = str(total_rec)
        
    rec_date_str = parse_date(row[9], default_order_dt + timedelta(days=30))
    note = row[10].strip()
    
    po_month = extract_po_month(row[13]) if len(row) > 13 and row[13].strip() else "3/2026"
    
    # lookup classification from our extracted orders mapping
    o_type = ""
    o_tier = ""
    if order_no in orders_mapping:
        o_type = orders_mapping[order_no]['type']
        o_tier = orders_mapping[order_no]['tier']
        if orders_mapping[order_no]['po_month']:
            po_month = orders_mapping[order_no]['po_month']
            
    # Receiving Row structure:
    # ["Thời gian lưu", "Mã đơn hàng", "PO Tháng", "Phân loại sản phẩm", "Phân cấp sản phẩm", "Người nhập", "Ngày nhập", "Đợt nhập", "Tên SP", "Art Code", "Màu", "Tổng SL nhận", "Ghi chú", "Size S/29", "Size M/30", "Size L/31", "Size XL/32", "Size XXL/34", "Size FREE"]
    # Try to lookup art_code and color from detail rows if available
    a_code = ""
    col = ""
    for dr in detail_rows:
        if dr[0] == order_no and dr[1] == product_name:
            a_code = dr[2]
            col = dr[3]
            break
            
    r_row = [
        iso_now, order_no, po_month, o_type, o_tier, "System Import", rec_date_str,
        batch_name, product_name, a_code, col, total_rec, note,
        s_qty, m_qty, l_qty, xl_qty, xxl_qty, free_qty
    ]
    receiving_rows.append(r_row)

print(f"Parsed {len(receiving_rows)} receiving rows.")

print(f"Generating {output_gs_file}...")

# Format beautifully as JS Code
js_details = json.dumps(detail_rows, ensure_ascii=False)
js_orders = json.dumps(order_rows, ensure_ascii=False)
js_receiving = json.dumps(receiving_rows, ensure_ascii=False)

gas_template = f"""/**
 * Hàm nhập toàn bộ dữ liệu sạch 2026 vào hệ thống.
 * Chạy hàm này trên giao diện Google Apps Script để tự động làm sạch và đồng bộ 100% dữ liệu.
 */
function importCleanData2026() {{
  function toDate(s) {{
    if (!s) return "";
    var str = String(s);
    var m = str.match(/(\\d{{4}})-(\\d{{2}})-(\\d{{2}})/);
    if (m) return new Date(parseInt(m[1]), parseInt(m[2])-1, parseInt(m[3]));
    return s;
  }}
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {{
    SpreadsheetApp.getUi().alert("Vui lòng mở bảng tính hoặc chạy trực tiếp từ Apps Script gắn với file Google Sheets.");
    return;
  }}
  
  // 1. IMPORT data_order_details
  var detailSheet = ss.getSheetByName("data_order_details");
  if (!detailSheet) detailSheet = ss.insertSheet("data_order_details");
  var detailHeaders = ["Mã đơn hàng","Tên SP","Art Code","Màu","Tổng SL","Đơn giá","Thành tiền (trước VAT)","Thông tin NPL","T.Gian Giao","Ghi Chú","Trạng thái Vải","Trạng thái Bo","Đóng bộ NPL","Ngày đồng bộ","Ghi chú duyệt","Size S/29","Size M/30","Size L/31","Size XL/32","Size XXL/34","Size FREE"];
  detailSheet.clearContents();
  detailSheet.getRange(1, 1, 1, detailHeaders.length).setValues([detailHeaders]);
  detailSheet.getRange(1, 1, 1, detailHeaders.length).setFontWeight("bold").setBackground("#fff2cc");
  detailSheet.setFrozenRows(1);
  
  var detailData = {js_details};
  var numCols = detailHeaders.length;
  detailData = detailData.map(function(r) {{
    var row = r.slice(0, numCols);
    while (row.length < numCols) row.push("");
    row[8] = toDate(row[8]); // T.Gian Giao
    return row;
  }});
  if (detailData.length > 0) {{
    detailSheet.getRange(2, 1, detailData.length, numCols).setValues(detailData);
    detailSheet.getRange(2, 9, detailData.length, 1).setNumberFormat("dd/mm/yyyy");
  }}
  
  // 2. IMPORT data_order
  var orderSheet = ss.getSheetByName("data_order");
  if (!orderSheet) orderSheet = ss.insertSheet("data_order");
  var orderHeaders = ["Thời gian lưu","Mã đơn hàng","Ngày đặt hàng","Người tạo","Công ty","Nhà cung cấp","Địa chỉ NCC","Thuế VAT (%)","Tổng tạm tính","Tiền VAT","Tổng cộng","PO Tháng","Phân Loại ĐH","Phân Cấp SP","Trạng thái Vải","Hạn Duyệt (D+18)","Hạn Cắt Vải (D+21)","Hạn Lên Chuyền (D+22)","Hạn Hoàn Thành (D+27)","Trạng thái Bo","Trạng thái NPL","Ngày Đồng Bộ","Ghi Chú","Tổng SL","Danh sách SP","Danh sách Màu"];
  orderSheet.clearContents();
  orderSheet.getRange(1, 1, 1, orderHeaders.length).setValues([orderHeaders]);
  orderSheet.getRange(1, 1, 1, orderHeaders.length).setFontWeight("bold").setBackground("#d0e0e3");
  orderSheet.setFrozenRows(1);
  
  var orderData = {js_orders};
  var numOrderCols = orderHeaders.length;
  orderData = orderData.map(function(r) {{
    var row = r.slice(0, numOrderCols);
    while (row.length < numOrderCols) row.push("");
    row[0] = r[0] ? new Date(r[0]) : new Date(); // Thời gian lưu
    row[2] = toDate(row[2]); // Ngày đặt hàng
    row[15] = toDate(row[15]);
    row[16] = toDate(row[16]);
    row[17] = toDate(row[17]);
    row[18] = toDate(row[18]);
    return row;
  }});
  if (orderData.length > 0) {{
    orderSheet.getRange(2, 1, orderData.length, numOrderCols).setValues(orderData);
    orderSheet.getRange(2, 3, orderData.length, 1).setNumberFormat("dd/mm/yyyy");
    orderSheet.getRange(2, 16, orderData.length, 4).setNumberFormat("dd/mm/yyyy");
  }}
  
  // 3. IMPORT data_receiving
  var receivingSheet = ss.getSheetByName("data_receiving");
  if (!receivingSheet) receivingSheet = ss.insertSheet("data_receiving");
  var receivingHeaders = ["Thời gian lưu","Mã đơn hàng","PO Tháng","Phân loại sản phẩm","Phân cấp sản phẩm","Người nhập","Ngày nhập","Đợt nhập","Tên SP","Art Code","Màu","Tổng SL nhận","Ghi chú","Size S/29","Size M/30","Size L/31","Size XL/32","Size XXL/34","Size FREE"];
  receivingSheet.clearContents();
  receivingSheet.getRange(1, 1, 1, receivingHeaders.length).setValues([receivingHeaders]);
  receivingSheet.getRange(1, 1, 1, receivingHeaders.length).setFontWeight("bold").setBackground("#d9ead3");
  receivingSheet.setFrozenRows(1);
  
  var receivingData = {js_receiving};
  var numRecCols = receivingHeaders.length;
  receivingData = receivingData.map(function(r) {{
    var row = r.slice(0, numRecCols);
    while (row.length < numRecCols) row.push("");
    row[0] = r[0] ? new Date(r[0]) : new Date();
    row[6] = toDate(row[6]); // Ngày nhập
    return row;
  }});
  if (receivingData.length > 0) {{
    receivingSheet.getRange(2, 1, receivingData.length, numRecCols).setValues(receivingData);
    receivingSheet.getRange(2, 7, receivingData.length, 1).setNumberFormat("dd/mm/yyyy");
  }}
  
  SpreadsheetApp.getUi().alert("Đã đồng bộ thành công toàn bộ dữ liệu 2026 sạch lên Google Sheets!\\n- Chi tiết ĐH: " + detailData.length + " dòng\\n- Đơn hàng: " + orderData.length + " dòng\\n- Nhập kho: " + receivingData.length + " dòng");
}}
"""

with open(output_gs_file, 'w', encoding='utf-8') as f:
    f.write(gas_template)

print(f"Done! Created {output_gs_file} successfully.")
