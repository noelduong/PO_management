const fs = require('fs');
const codePath = 'd:\\app 0205\\Code.gs';
const impPath = 'd:\\app 0205\\import_function.gs';

let codeContent = fs.readFileSync(codePath, 'utf8');
let impContent = fs.readFileSync(impPath, 'utf8');

// Extract the masterImportFromCSV function from import_function.gs
const startMarker = 'function masterImportFromCSV() {';
const startIdx = impContent.indexOf(startMarker);
const endIdx = impContent.lastIndexOf('}'); // Assuming the last } is the end of the function

if (startIdx === -1) {
    console.error('Could not find masterImportFromCSV in import_function.gs');
    process.exit(1);
}

let masterFunc = impContent.substring(startIdx, endIdx + 1);

// Add the call to importReceiving() before the final alert
masterFunc = masterFunc.replace(/SpreadsheetApp\.getUi\(\)\.alert\("Import xong! .*"\);/, 'importReceiving();\n  SpreadsheetApp.getUi().alert("Đã phục hồi xong toàn bộ dữ liệu: Đơn hàng, Chi tiết đơn hàng và Nhập kho!");');

// Replace masterImportFromCSV in Code.gs
const codeStartMatch = codeContent.indexOf('function masterImportFromCSV()');
if (codeStartMatch !== -1) {
    const nextFuncMatch = codeContent.indexOf('\nfunction ', codeStartMatch + 1);
    const end = (nextFuncMatch !== -1) ? nextFuncMatch : codeContent.length;
    
    let start = codeContent.lastIndexOf('/**', codeStartMatch);
    if (start === -1) start = codeStartMatch;

    codeContent = codeContent.substring(0, start) + '\n/**\n * Chạy hàm này 1 lần sau khi XÓA SẠCH data trên Sheet.\n */\n' + masterFunc + codeContent.substring(end);
}

fs.writeFileSync(codePath, codeContent, 'utf8');
console.log('masterImportFromCSV updated with FULL 171 records and integrated receiving.');
