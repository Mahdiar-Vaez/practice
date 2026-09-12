import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../config/env.js';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000,
});

export let isDatabaseConnected = false;

/**
 * Helper to run SQL queries
 */
export async function query<T extends pg.QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<pg.QueryResult<T>> {
  return pool.query<T>(text, params);
}

/**
 * Check connection and initialize schema if needed
 */
export async function initDatabase(): Promise<boolean> {
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      isDatabaseConnected = true;
      console.log('✅ Connected to PostgreSQL database:', env.DB_NAME);

      // Verify and initialize schema if init.sql exists
      const initSqlPath = path.join(__dirname, 'init.sql');
      if (fs.existsSync(initSqlPath)) {
        const sql = fs.readFileSync(initSqlPath, 'utf8');
        await client.query(sql);
        console.log('✅ PostgreSQL schema verified & synchronized');
      }
      return true;
    } finally {
      client.release();
    }
  } catch (error: any) {
    isDatabaseConnected = false;
    console.warn(
      `⚠️ PostgreSQL is not reachable (${error.message || 'connection error'}).` +
      ` Falling back to in-memory repositories. Run 'docker compose up -d' to start PostgreSQL & pgAdmin.`
    );
    return false;
  }
}
