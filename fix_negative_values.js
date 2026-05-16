const fs = require('fs');
const codePath = 'd:\\app 0205\\Code.gs';

let codeContent = fs.readFileSync(codePath, 'utf8');

// Find the importReceiving function
const startMatch = codeContent.indexOf('function importReceiving()');
if (startMatch === -1) {
    console.error('Could not find importReceiving');
    process.exit(1);
}

// Look for the map function inside importReceiving
const mapStartIdx = codeContent.indexOf('d=d.map(function(r){', startMatch);
const mapEndIdx = codeContent.indexOf('return row;', mapStartIdx);

if (mapStartIdx !== -1 && mapEndIdx !== -1) {
    // Insert the cleanup logic before 'return row;'
    const cleanupLogic = '\n    // Sanitize data: replace -1 with empty string\n    row = row.map(function(v){ return v === -1 ? "" : v; });\n    ';
    codeContent = codeContent.substring(0, mapEndIdx) + cleanupLogic + codeContent.substring(mapEndIdx);
    
    fs.writeFileSync(codePath, codeContent, 'utf8');
    console.log('Sanitization logic added to importReceiving (replacing -1 with empty).');
} else {
    console.error('Could not find insertion point in importReceiving');
}
