// Script to create admin_users table and insert default accounts
// Run this with: node database/setup-admin-users.js

const mysql = require('mysql2/promise');

async function setupAdminUsers() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Cz612727!',
    database: 'mira_agent_config',
  });

  try {
    console.log('Creating admin_users table...');
    
    // Create table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admin_users (
        admin_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        full_name VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_username (username),
        INDEX idx_is_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('✓ Table created successfully');
    
    // Insert default admin account (password: admin123)
    console.log('Inserting default admin account (username: admin, password: admin123)...');
    await connection.execute(`
      INSERT INTO admin_users (username, password_hash, email, full_name) 
      VALUES (
        'admin', 
        '$2a$10$N9qo8uLOickgx2ZMRZoMye1J0ixRgGPvXXE7YRbMvVjPkC3V8m1d2',
        'admin@example.com',
        'System Administrator'
      ) ON DUPLICATE KEY UPDATE username = username
    `);
    
    console.log('✓ Default admin account created');
    
    // Insert support admin account (password: admin456)
    console.log('Inserting support admin account (username: support, password: admin456)...');
    await connection.execute(`
      INSERT INTO admin_users (username, password_hash, email, full_name) 
      VALUES (
        'support', 
        '$2a$10$ZkQeHXN5LqEpPJ0xK9m5COWJFvGx6vTqPqYqXQP5yR8K.OPB1T5Q.',
        'support@example.com',
        'Support Administrator'
      ) ON DUPLICATE KEY UPDATE username = username
    `);
    
    console.log('✓ Support admin account created');
    console.log('\n✓✓✓ Setup completed successfully! ✓✓✓');
    console.log('\nYou can now login with:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('\nOr:');
    console.log('  Username: support');
    console.log('  Password: admin456');
    console.log('\n⚠️  Please change these passwords after first login!');
    
  } catch (error) {
    console.error('Error setting up admin users:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

setupAdminUsers();
