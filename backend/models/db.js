const mysql = require('mysql2/promise');
const dbConfig = require('../config/db.config');

// ✅ Create a connection pool with error handling (NO `.promise()` needed)
const pool = mysql.createPool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  waitForConnections: true,
  connectionLimit: dbConfig.pool.max,
  queueLimit: 0
});

// ✅ Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connection has been established successfully.');
    connection.release();
    return true;
  } catch (error) {
    console.error('🚨 Unable to connect to the database:', error);
    return false;
  }
};

// ✅ Execute SQL query with parameters (NO `.promise()` needed)
const query = async (sql, params = []) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('❌ Error executing query:', sql, params, error);
    throw error;
  }
};

// ✅ Execute a transaction
const transaction = async (callback) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    console.error("❌ Transaction error:", error);
    throw error;
  } finally {
    connection.release();
  }
};

// ✅ Close connection pool gracefully (For app shutdown)
const closePool = async () => {
  try {
    await pool.end();
    console.log("✅ Database pool closed.");
  } catch (error) {
    console.error("❌ Error closing database pool:", error);
  }
};

// ✅ Export functions (pool is now directly used)
module.exports = {
  pool,
  testConnection,
  query,
  transaction,
  closePool
};
