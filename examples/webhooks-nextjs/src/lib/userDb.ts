/**
 * User Management Database Connection
 * Separate database for authentication, authorization, and user management
 */
import mysql from 'mysql2/promise';

// Connection pool for user management database
const userDbPool = mysql.createPool({
  host: process.env.USER_DB_HOST || process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.USER_DB_PORT || process.env.DB_PORT || '3306'),
  user: process.env.USER_DB_USER || process.env.DB_USER || 'root',
  password: process.env.USER_DB_PASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.USER_DB_NAME || 'mira_user_mgmt',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

/**
 * Execute a query on the user management database
 */
export async function queryUserDb<T = any>(sql: string, params?: any[]): Promise<T> {
  try {
    const [results] = await userDbPool.execute(sql, params);
    return results as T;
  } catch (error) {
    console.error('User DB query error:', error);
    throw error;
  }
}

/**
 * Get a connection from the user database pool
 */
export async function getUserDbConnection() {
  return await userDbPool.getConnection();
}

/**
 * Close the user database connection pool
 */
export async function closeUserDbPool() {
  await userDbPool.end();
}

export default userDbPool;
