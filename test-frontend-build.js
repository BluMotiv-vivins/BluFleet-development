// Simple test to check if frontend builds
const { spawn } = require('child_process');

console.log('🚀 Testing frontend build...');

// Build the frontend
const build = spawn('npm', ['run', 'build'], {
  cwd: './frontend',
  stdio: 'pipe'
});

let buildSuccess = false;

build.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('Frontend build output:', output);
  
  if (output.includes('built in') || output.includes('Build completed')) {
    buildSuccess = true;
  }
});

build.stderr.on('data', (data) => {
  console.log('Frontend build error:', data.toString());
});

build.on('close', (code) => {
  if (code === 0 || buildSuccess) {
    console.log('✅ Frontend build successful!');
    process.exit(0);
  } else {
    console.log('❌ Frontend build failed with code:', code);
    process.exit(1);
  }
});

// Timeout after 60 seconds
setTimeout(() => {
  console.log('❌ Frontend build timeout');
  build.kill();
  process.exit(1);
}, 60000);