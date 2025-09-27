const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3005,
  path: '/api/predictions',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('Data count:', jsonData.data ? jsonData.data.length : 0);
      console.log('Total:', jsonData.total);
      console.log('Source:', jsonData.source);
      console.log('Date range:', jsonData.dateRange);
      if (jsonData.data && jsonData.data.length > 0) {
        console.log('First record:', JSON.stringify(jsonData.data[0], null, 2));
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.end();
