const fs = require('fs');
const path = 'd:\\app 0205\\Code.gs';
let content = fs.readFileSync(path, 'utf8');

const replacements = [
    { from: /XÃ M/g, to: 'XÁM' },
    { from: /NHàT/g, to: 'NHẠT' },
    { from: /XANH LÃ /g, to: 'XANH LÁ' },
    { from: /Đảt/g, to: 'Đợt' },
    { from: /chờn/g, to: 'chọn' },
    { from: /lái/g, to: 'lại' },
    { from: /dướci/g, to: 'dưới' },
    { from: /tráng thái/g, to: 'trạng thái' },
    { from: /Dờn dỳp/g, to: 'Dọn dẹp' },
    { from: /Sứa lỗi/g, to: 'Sửa lỗi' },
    { from: /soán thảo/g, to: 'soạn thảo' },
    { from: /Cháy/g, to: 'Chạy' },
    { from: /đướci/g, to: 'dưới' },
    { from: /Đồng bộ NPL/g, to: 'Đóng bộ NPL' }, // Fixed inconsistent header in some parts
    { from: /"Đồng bộ NPL"/g, to: '"Đóng bộ NPL"' },
    { from: /"Phân Loại ĐH"/g, to: '"Phân loại sản phẩm"' }, // Standardize with user request
    { from: /"Phân Cấp SP"/g, to: '"Phân cấp sản phẩm"' }
];

replacements.forEach(r => {
    content = content.replace(r.from, r.to);
});

// Also fix the logic in importPart1 and importPart2 to split classification
// I'll do this by finding the data rows and applying a regex fix
// But that's risky. I'll add a helper function instead.

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed Vietnamese font and standardized headers.');
