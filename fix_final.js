const fs = require('fs');
const path = 'd:/app 0205/Code.gs';

// Read the raw bytes
const buffer = fs.readFileSync(path);

// Convert buffer to string assuming it's currently UTF-8 (the corrupted state)
const corruptedStr = buffer.toString('utf8');

// Now, treating each character in that string as a byte (ISO-8859-1), convert back to UTF-8
const fixedBuffer = Buffer.from(corruptedStr, 'binary'); // 'binary' is an alias for 'latin1'
const fixedStr = fixedBuffer.toString('utf8');

fs.writeFileSync('d:/app 0205/Code_fixed_final.gs', fixedStr, 'utf8');
console.log('Final fixed encoding attempt complete.');
