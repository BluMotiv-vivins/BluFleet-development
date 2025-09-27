const { Pool } = require('pg');

const pool = new Pool({
  host: '127.0.0.1',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'postgres'
});

async function testConnection() {
  try {
    const client = await pool.connect();
    
    // List databases
    const dbResult = await client.query("SELECT datname FROM pg_database WHERE datistemplate = false;");
    console.log('Available databases:', dbResult.rows.map(row => row.datname));
    
    const result = await client.query('SELECT NOW()');
    console.log('Connection successful!');
    console.log('Current time in database:', result.rows[0].now);
    client.release();
  } catch (err) {
    console.error('Connection error:', err);
  } finally {
    await pool.end();
  }
}

testConnection();
