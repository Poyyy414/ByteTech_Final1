const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'mysql-c8cdfc5-ariasampoy414-f96b.c.aivencloud.com',
    user: process.env.DB_USER || 'avnadmin',
    password: process.env.DB_PASSWORD || 'AVNS_eOmYS1PNHeCkK945wot',
    database: process.env.DB_NAME || 'defaultdb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection on startup
pool.getConnection()
    .then(conn => {
        console.log('MySQL Connected');
        conn.release();
    })
    .catch(err => {
        console.error('DB Connection Error:', err);
    });

module.exports = pool;