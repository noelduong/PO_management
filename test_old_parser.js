const fs = require('fs');
const content = fs.readFileSync('PP_ KHSX TOTAL 26 - DATA Đặt Hàng 2026.csv', 'utf8');
const lines = content.split('\n');
console.log('Old split lines:', lines.length);

let count = 0;
const mapping = {};

for (let i = 8; i < lines.length; i++) {
  const line = lines[i];
  if (!line) continue;
  
  let ret = [], val = '', inQ = false;
  for (let j = 0; j < line.length; j++) {
    let c = line[j];
    if (c === '"') inQ = !inQ;
    else if (c === ',' && !inQ) { ret.push(val); val = ''; }
    else val += c;
  }
  ret.push(val);

  if (ret.length > 17) {
    const s = ret[0] ? ret[0].trim() : '';
    if (!s || isNaN(s)) continue;
    const p = ret[17] ? ret[17].trim() : '';
    if (s && p) {
      const orderNo = s.padStart(4, '0') + '/2026/PLMR-' + p;
      if (!mapping[orderNo]) {
        mapping[orderNo] = { type: ret[1] ? ret[1].trim() : '', tier: ret[2] ? ret[2].trim() : '' };
        count++;
      }
    }
  }
}
console.log('Old mapping entries:', count);

// Show some samples of bad parsing
let badCount = 0;
for (const key of Object.keys(mapping)) {
  if (!mapping[key].type && !mapping[key].tier) {
    if (badCount < 5) console.log('  Bad entry:', key, JSON.stringify(mapping[key]));
    badCount++;
  }
}
console.log('Entries with empty type AND tier:', badCount);
