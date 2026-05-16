const fs = require('fs');
const codePath = 'd:\\app 0205\\Code.gs';

let codeContent = fs.readFileSync(codePath, 'utf8');

// Sanitize detailData map
codeContent = codeContent.replace(
    /detailData = detailData\.map\(function\(r\) \{ var row = r\.slice\(0,numCols\); while\(row\.length<numCols\) row\.push\(""\); return row; \}\);/,
    'detailData = detailData.map(function(r) { var row = r.slice(0,numCols); while(row.length<numCols) row.push(""); return row.map(function(v){ return (v === -1 || v === "-1") ? "" : v; }); });'
);

// Sanitize orderData map
codeContent = codeContent.replace(
    /orderData = orderData\.map\(function\(r\) \{ var row = r\.slice\(0,numOrderCols\); while\(row\.length<numOrderCols\) row\.push\(""\); return row; \}\);/,
    'orderData = orderData.map(function(r) { var row = r.slice(0,numOrderCols); while(row.length<numOrderCols) row.push(""); return row.map(function(v){ return (v === -1 || v === "-1") ? "" : v; }); });'
);

fs.writeFileSync(codePath, codeContent, 'utf8');
console.log('Sanitization added to order and detail data maps.');
