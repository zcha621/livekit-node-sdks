#!/usr/bin/env node
/**
 * Database Setup Script
 * Sets up separate databases for user management and agent configuration
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabases() {
  console.log('🔧 Setting up separate databases for user management and agent config...\n');

  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  };

  let connection;
  
  try {
    // Connect to MySQL without selecting a database
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to MySQL server');

    // Create user management database
    console.log('\n📦 Creating user management database (mira_user_mgmt)...');
    await connection.query('CREATE DATABASE IF NOT EXISTS mira_user_mgmt CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ User management database created');

    // Ensure agent config database exists
    console.log('\n📦 Verifying agent config database (mira_agent_config)...');
    await connection.query('CREATE DATABASE IF NOT EXISTS mira_agent_config CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ Agent config database verified');

    // Read and execute user management SQL
    console.log('\n📝 Loading user management schema...');
    const userMgmtSql = fs.readFileSync(
      path.join(__dirname, 'database', 'user_management.sql'),
      'utf8'
    );

    // Execute the SQL statements
    await connection.query('USE mira_user_mgmt');
    
    // Split by semicolons and execute each statement
    const statements = userMgmtSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.query(statement);
        } catch (err) {
          // Ignore delimiter statements and other non-critical errors
          if (!err.message.includes('DELIMITER')) {
            console.warn('⚠️  Warning:', err.message.substring(0, 100));
          }
        }
      }
    }

    console.log('✅ User management schema loaded');

    // Verify setup
    console.log('\n🔍 Verifying setup...');
    
    await connection.query('USE mira_user_mgmt');
    const [userTables] = await connection.query('SHOW TABLES');
    console.log(`  - User DB tables: ${userTables.length}`);
    
    const [users] = await connection.query('SELECT username, user_type FROM admin_users');
    console.log(`  - Users created: ${users.length}`);
    users.forEach(u => console.log(`    • ${u.username} (${u.user_type})`));

    await connection.query('USE mira_agent_config');
    const [agentTables] = await connection.query('SHOW TABLES');
    console.log(`  - Agent DB tables: ${agentTables.length}`);

    console.log('\n✅ Database setup complete!');
    console.log('\n📚 Summary:');
    console.log('  • User Management DB: mira_user_mgmt');
    console.log('  • Agent Config DB:    mira_agent_config');
    console.log('\n🔐 Default accounts:');
    console.log('  • Admin:  username=admin,  password=admin123');
    console.log('  • Viewer: username=viewer, password=user123');
    console.log('\n⚠️  Remember to change default passwords in production!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run if called directly
if (require.main === module) {
  // Load .env manually if dotenv is available
  try {
    require('dotenv').config();
  } catch (e) {
    console.log('ℹ️  dotenv not found, using environment variables directly');
  }
  setupDatabases();
}

module.exports = { setupDatabases };
