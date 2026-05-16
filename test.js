const fs = require('fs');
const content = fs.readFileSync('PP_ KHSX TOTAL 26 - DATA Đặt Hàng 2026.csv', 'utf8');
const lines = content.split('\n');

const parseCSVLine = (text) => {
    let ret = [], val = '', inQuote = false;
    for (let j = 0; j < text.length; j++) {
        let c = text[j];
        if (c === '"') inQuote = !inQuote;
        else if (c === ',' && !inQuote) { ret.push(val); val = ''; }
        else val += c;
    }
    ret.push(val);
    return ret;
}

const parsedCols = parseCSVLine(lines[8]);
console.log('Row 8 length: ' + parsedCols.length);
parsedCols.forEach((c, i) => { if(c.trim()) console.log(i + ': ' + c.trim()) });