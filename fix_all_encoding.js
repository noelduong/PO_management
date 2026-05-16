const fs = require('fs');
const path = 'd:/app 0205/Code.gs';

// Read the file as buffer
const buffer = fs.readFileSync(path);

// Convert buffer to string using latin1 (ISO-8859-1) which matches the garbage characters
const corruptedStr = buffer.toString('utf8'); // This is what we currently see

// We need to convert this corrupted UTF-8 string back to the original bytes
// If it was double-encoded, the bytes are the issue.
// Actually, let's try to convert the string to a Buffer using 'latin1' then read that Buffer as 'utf8'.

function fixDoubleEncoding(str) {
  return Buffer.from(str, 'latin1').toString('utf8');
}

const fixedLines = [];
const lines = corruptedStr.split('\n');

for (const line of lines) {
    try {
        // Only fix if it looks like it has corrupted chars
        if (line.includes('Ã')) {
            fixedLines.push(fixDoubleEncoding(line));
        } else {
            fixedLines.push(line);
        }
    } catch (e) {
        fixedLines.push(line);
    }
}

// Write the fixed content
fs.writeFileSync('d:/app 0205/Code_fixed_encoding.gs', fixedLines.join('\n'), 'utf8');
console.log('Fixed encoding check complete.');
