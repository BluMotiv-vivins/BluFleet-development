// Database Service Module for BluFleet
// Version: 1.0.0
// Handles database connections and operations using real PostgreSQL data

import { Pool } from 'pg';
import dotenv from 'dotenv';
import { logger } from './logger';

// Load environment variables
dotenv.config();

// Log database connection parameters (without password)
logger.info('Database connection configuration:', {
  host: process.env.DATABASE_HOST || 'from connection string',
  port: process.env.DATABASE_PORT || 'from connection string',
  database: process.env.DATABASE_NAME || 'from connection string',
  user: process.env.DATABASE_USER || 'from connection string',
  ssl: process.env.DATABASE_SSL === 'true' ? 'enabled' : 'disabled',
  poolSize: process.env.DATABASE_POOL_SIZE || 20
});

// Create database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: parseInt(process.env.DATABASE_POOL_SIZE || '20'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000, // Extended timeout
});

// Handle pool errors
pool.on('error', (err) => {
  logger.error('Unexpected error on idle database client', err);
  // Don't exit the process, just log the error
  // process.exit(-1);
});

// Test the database connection
const testConnection = async () => {
  logger.info('Testing database connection...');
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT version();');
    logger.info(`Successfully connected to PostgreSQL database: ${result.rows[0].version}`);
    client.release();
    return true;
  } catch (error: any) {
    logger.error(`Failed to connect to PostgreSQL database: ${error.message}`, error);
    
    // More descriptive error logging based on error code
    if (error.code === '28000') {
      logger.error('Authentication failed. Check username and password.');
    } else if (error.code === '3D000') {
      logger.error('Database does not exist. Check database name.');
    } else if (error.code === 'ECONNREFUSED') {
      logger.error('Connection refused. Check if database server is running and accessible.');
    }
    
    throw error;
  }
};

// Generic query function
const query = async (text: string, params: any[] = []) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug(`Query executed in ${duration}ms: ${text}`);
    return result;
  } catch (error) {
    logger.error(`Query error: ${text}`, { error, params });
    throw error;
  }
};

// Transaction helper
const transaction = async (callback: (client: any) => Promise<any>) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export default {
  pool,
  query,
  transaction,
  testConnection,
};
