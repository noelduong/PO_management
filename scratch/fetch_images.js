const https = require('https');

https.get('https://docs.google.com/spreadsheets/d/1tH11Kr6tlG1sChsjMfP9LUN_aRfbqer0Gm9U2n7HK94/gviz/tq?gid=140619625', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // google viz response is wrapped in a callback
    const match = data.match(/google\.visualization\.Query\.setResponse\((.*)\);/);
    if (match) {
      const json = JSON.parse(match[1]);
      // Print headers
      const headers = json.table.cols.map(c => c ? c.label : 'null');
      console.log('Headers:', headers);
      // Print first few rows
      for (let i = 0; i < 10 && i < json.table.rows.length; i++) {
        const row = json.table.rows[i];
        console.log(`Row ${i}:`, row.c ? row.c.map(cell => cell ? cell.v : 'null') : 'null');
      }
    } else {
      console.log('Could not parse response:', data.substring(0, 200));
    }
  });
}).on('error', err => console.log('Error:', err));
