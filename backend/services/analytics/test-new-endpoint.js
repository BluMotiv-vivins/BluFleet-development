const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3005,
  path: '/api/analytics/predictions',
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
      console.log('✅ Analytics endpoint working!');
      console.log('Data count:', jsonData.data ? jsonData.data.length : 0);
      console.log('Source:', jsonData.source);
      console.log('Total records:', jsonData.total);
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.end();
