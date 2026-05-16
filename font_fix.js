const fs = require('fs');
const path = 'd:\\app 0205\\Code.gs';
let content = fs.readFileSync(path, 'utf8');

const fixes = [
    [/XÃ M/g, 'XÁM'],
    [/NHàT/g, 'NHẠT'],
    [/BƯớC/g, 'BƯỚC'],
    [/TRƯớC/g, 'TRƯỚC'],
    [/Điờn/g, 'Điền'],
    [/thấ tự/g, 'thứ tự'],
    [/Đờc header/g, 'Đọc header'],
    [/Cấu vãn/g, 'Cứu vãn'],
    [/Xứ lý/g, 'Xử lý'],
    [/Chờn/g, 'Chọn'],
    [/đăng nhập/g, 'đăng nhập'], // ensure no hidden chars
    [/thành công/g, 'thành công'],
    [/đơn hàng/g, 'đơn hàng'],
    [/dữ liệu/g, 'dữ liệu'],
    [/Phân loại/g, 'Phân loại'],
    [/Phân cấp/g, 'Phân cấp'],
    [/Ghi chú/g, 'Ghi chú'],
    [/Trạng thái/g, 'Trạng thái'],
    [/Ngày đặt/g, 'Ngày đặt'],
    [/Người tạo/g, 'Người tạo'],
    [/Công ty/g, 'Công ty'],
    [/Nhà cung cấp/g, 'Nhà cung cấp'],
    [/Địa chỉ/g, 'Địa chỉ'],
    [/Thuế VAT/g, 'Thuế VAT'],
    [/Tổng tạm tính/g, 'Tổng tạm tính'],
    [/Tiền VAT/g, 'Tiền VAT'],
    [/Tổng cộng/g, 'Tổng cộng'],
    [/PO Tháng/g, 'PO Tháng'],
    [/Hạn Duyệt/g, 'Hạn Duyệt'],
    [/Hạn Cắt Vải/g, 'Hạn Cắt Vải'],
    [/Hạn Lên Chuyền/g, 'Hạn Lên Chuyền'],
    [/Hạn Hoàn Thành/g, 'Hạn Hoàn Thành'],
    [/Đóng bộ/g, 'Đóng bộ'],
    [/Ngày đồng bộ/g, 'Ngày đồng bộ'],
    [/Danh sách/g, 'Danh sách'],
    [/Tổng SL/g, 'Tổng SL']
];

fixes.forEach(([pattern, replacement]) => {
    content = content.replace(pattern, replacement);
});

// Also fix the case in importPart1/2 where it's hardcoded in arrays
// (The fixes above should cover them if they match)

fs.writeFileSync(path, content, 'utf8');
console.log('Font fixes applied.');
