// Test script to verify password hashing
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function testPassword() {
  console.log('Testing password hashing...\n');
  
  // Test 1: Generate a new hash for admin123
  const testPassword = 'admin123';
  const newHash = await bcrypt.hash(testPassword, 10);
  console.log('Newly generated hash for "admin123":');
  console.log(newHash);
  
  // Test 2: Verify the hash from database
  const dbHash = '$2a$10$N9qo8uLOickgx2ZMRZoMye1J0ixRgGPvXXE7YRbMvVjPkC3V8m1d2';
  const matchOld = await bcrypt.compare(testPassword, dbHash);
  console.log('\nVerifying DB hash matches "admin123":', matchOld);
  
  // Test 3: Query actual database
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Cz612727!',
      database: 'mira_agent_config',
    });
    
    console.log('\nQuerying database for admin user...');
    const [rows] = await connection.execute(
      'SELECT admin_id, username, password_hash, is_active FROM admin_users WHERE username = ?',
      ['admin']
    );
    
    if (rows.length > 0) {
      console.log('Found admin user:', {
        admin_id: rows[0].admin_id,
        username: rows[0].username,
        is_active: rows[0].is_active,
        password_hash: rows[0].password_hash
      });
      
      // Test password against DB hash
      const matchDb = await bcrypt.compare('admin123', rows[0].password_hash);
      console.log('\nPassword "admin123" matches DB hash:', matchDb);
      
      // If it doesn't match, update with a new hash
      if (!matchDb) {
        console.log('\n⚠️  Password mismatch! Updating with new hash...');
        await connection.execute(
          'UPDATE admin_users SET password_hash = ? WHERE username = ?',
          [newHash, 'admin']
        );
        console.log('✓ Password hash updated successfully!');
      }
    } else {
      console.log('❌ No admin user found in database!');
    }
    
    await connection.end();
  } catch (error) {
    console.error('Database error:', error.message);
  }
}

testPassword();
