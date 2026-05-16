const fs = require('fs');
const path = 'd:\\app 0205\\Code.gs';
let content = fs.readFileSync(path, 'utf8');

// 1. Replace literal \n with actual newlines
content = content.replace(/\\n/g, '\n');

// 2. Remove duplicate HISTORICAL_MAPPING
// We want to keep ONLY ONE HISTORICAL_MAPPING at the top.
// Find the first one
const firstMappingStart = content.indexOf('const HISTORICAL_MAPPING = {');
if (firstMappingStart !== -1) {
    const firstMappingEnd = content.indexOf('};', firstMappingStart) + 2;
    // Search for any other HISTORICAL_MAPPING after this one
    let secondMappingStart = content.indexOf('const HISTORICAL_MAPPING = {', firstMappingEnd);
    while (secondMappingStart !== -1) {
        const secondMappingEnd = content.indexOf('};', secondMappingStart) + 2;
        content = content.substring(0, secondMappingStart) + content.substring(secondMappingEnd);
        secondMappingStart = content.indexOf('const HISTORICAL_MAPPING = {', secondMappingEnd);
    }
}

// 3. Remove duplicate fixOrderRow
const funcName = 'function fixOrderRow';
const firstFuncStart = content.indexOf(funcName);
if (firstFuncStart !== -1) {
    const firstFuncEnd = content.indexOf('\n}', firstFuncStart) + 2;
    let secondFuncStart = content.indexOf(funcName, firstFuncEnd);
    while (secondFuncStart !== -1) {
        const secondFuncEnd = content.indexOf('\n}', secondFuncStart) + 2;
        content = content.substring(0, secondFuncStart) + content.substring(secondFuncEnd);
        secondFuncStart = content.indexOf(funcName, secondFuncEnd);
    }
}

// 4. Ensure no literal \r\n or other mess
content = content.replace(/\r/g, ''); // Standardize on \n

fs.writeFileSync(path, content, 'utf8');
console.log('Emergency fix complete.');
