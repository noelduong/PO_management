const fs = require('fs');
let code = fs.readFileSync('Code.gs', 'utf8');

// Find the broken single-line version starting with function forceFixDates() {\
const marker = 'function forceFixDates() {\\';
const startIdx = code.indexOf(marker);
if (startIdx !== -1) {
  // Find next newline after this broken line
  const endIdx = code.indexOf('\n', startIdx);
  code = code.slice(0, startIdx) + code.slice(endIdx + 1);
  fs.writeFileSync('Code.gs', code);
  console.log('Removed broken single-line forceFixDates at char ' + startIdx);
} else {
  console.log('Broken line not found - nothing removed');
}
