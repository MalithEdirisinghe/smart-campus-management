module.exports = {
    HOST: process.env.DB_HOST || "localhost",
    USER: process.env.DB_USER || "root",
    PASSWORD: process.env.DB_PASSWORD || "",
    DB: process.env.DB_NAME || "campus_management",
    pool: {
      max: 10,         // Maximum number of connections in the pool
      min: 1,          // Minimum number of connections in the pool
      acquire: 30000,  // Maximum time in milliseconds to acquire a connection
      idle: 10000      // Maximum time in milliseconds that a connection can be idle
    }
  };