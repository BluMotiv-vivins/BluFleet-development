// Simple test to check if backend starts
const { spawn } = require('child_process');
const http = require('http');

console.log('🚀 Testing backend server startup...');

// Start the backend server
const server = spawn('npm', ['run', 'dev'], {
  cwd: './backend',
  stdio: 'pipe'
});

let serverStarted = false;

server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('Backend output:', output);
  
  if (output.includes('BluFleet API Gateway started') || output.includes('port 3000')) {
    serverStarted = true;
    console.log('✅ Backend server started successfully!');
    
    // Test health endpoint
    setTimeout(() => {
      http.get('http://localhost:3000/health', (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          console.log('✅ Health endpoint response:', data);
          server.kill();
          process.exit(0);
        });
      }).on('error', (err) => {
        console.log('❌ Health endpoint error:', err.message);
        server.kill();
        process.exit(1);
      });
    }, 2000);
  }
});

server.stderr.on('data', (data) => {
  console.log('Backend error:', data.toString());
});

server.on('close', (code) => {
  if (!serverStarted) {
    console.log('❌ Backend server failed to start');
    process.exit(1);
  }
});

// Timeout after 30 seconds
setTimeout(() => {
  if (!serverStarted) {
    console.log('❌ Backend server startup timeout');
    server.kill();
    process.exit(1);
  }
}, 30000);