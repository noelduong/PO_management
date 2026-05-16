const https = require('https');
https.get('https://docs.google.com/spreadsheets/d/1NbNxKCyZV_lTabuYwjLA27sqrANBZ55gVoLkKatVZOM/gviz/tq?sheet=m%C3%A3%20PO', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('PO Data Sheet Response start:', data.substring(0, 100));
  });
});
