// Test password verification
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function testPassword() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'Cz612727!',
      database: 'mira_agent_config'
    });

    // Get admin user
    const [users] = await connection.query('SELECT * FROM admin_users WHERE username = ?', ['admin']);
    
    if (users.length === 0) {
      console.log('❌ Admin user not found');
      return;
    }

    const user = users[0];
    console.log('Testing password for user:', user.username);
    console.log('Password hash from DB:', user.password_hash);

    // Test password
    const testPassword = 'admin123';
    const isMatch = await bcrypt.compare(testPassword, user.password_hash);
    
    console.log('\nPassword test:');
    console.log('  Input password:', testPassword);
    console.log('  Match result:', isMatch ? '✅ CORRECT' : '❌ INCORRECT');

    if (!isMatch) {
      console.log('\n🔧 Generating new hash for admin123...');
      const newHash = await bcrypt.hash('admin123', 10);
      console.log('New hash:', newHash);
      
      // Update the database
      await connection.query('UPDATE admin_users SET password_hash = ? WHERE username = ?', [newHash, 'admin']);
      console.log('✅ Password updated in database');
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPassword();
