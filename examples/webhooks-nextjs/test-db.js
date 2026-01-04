// Quick test to check database connection and users
const mysql = require('mysql2/promise');

async function testDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'Cz612727!',
      database: 'mira_agent_config'
    });

    console.log('✅ Connected to database');

    // Check if admin_users table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'admin_users'");
    console.log('admin_users table exists:', tables.length > 0);

    if (tables.length > 0) {
      // Get all users
      const [users] = await connection.query('SELECT user_id, username, email, user_type FROM admin_users');
      console.log('\nUsers in database:');
      console.table(users);

      // Check if admin user exists
      const [adminUser] = await connection.query('SELECT * FROM admin_users WHERE username = ?', ['admin']);
      console.log('\nAdmin user found:', adminUser.length > 0);
      if (adminUser.length > 0) {
        console.log('Admin details:', {
          id: adminUser[0].user_id,
          username: adminUser[0].username,
          email: adminUser[0].email,
          user_type: adminUser[0].user_type,
          password_hash: adminUser[0].password_hash.substring(0, 20) + '...'
        });
      }
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDatabase();
