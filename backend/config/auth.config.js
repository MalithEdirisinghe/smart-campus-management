module.exports = {
    secret: process.env.JWT_SECRET || "smart-campus-management-secret-key",
    jwtExpiration: 86400, // 24 hours
    jwtRefreshExpiration: 604800, // 7 days
    resetTokenExpiration: 3600, // 1 hour
    verificationTokenExpiration: 86400 // 24 hours
  };