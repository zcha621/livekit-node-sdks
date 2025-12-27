# Admin User Management

This system provides database-backed authentication for admin users.

## Database Setup

### 1. Create the admin_users table

Run the SQL script to create the table and insert default accounts:

```bash
# Using MySQL command line (if available)
mysql -h localhost -u root -p mira_agent_config < database/admin_users.sql

# Or connect to MySQL and run the SQL manually
```

The script creates:
- **admin_users** table with fields:
  - `admin_id`: Primary key
  - `username`: Unique username
  - `password_hash`: Bcrypt hashed password
  - `email`: Admin email address
  - `full_name`: Full name
  - `is_active`: Account status (boolean)
  - `last_login`: Timestamp of last login
  - `created_at`: Account creation timestamp
  - `updated_at`: Last update timestamp

### 2. Default Accounts

The script creates two default admin accounts:

| Username | Password | Email | Full Name |
|----------|----------|-------|-----------|
| admin | admin123 | admin@example.com | System Administrator |
| support | admin456 | support@example.com | Support Administrator |

**⚠️ IMPORTANT: Change these default passwords immediately after first login!**

## API Endpoints

### Authentication

#### POST `/api/auth/login`
Login with admin credentials

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "username": "admin",
    "email": "admin@example.com",
    "fullName": "System Administrator",
    "isAdmin": true
  }
}
```

### Admin User Management

#### GET `/api/admin/users`
List all admin users (requires authentication)

**Response:**
```json
[
  {
    "admin_id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "full_name": "System Administrator",
    "is_active": true,
    "last_login": "2025-12-27T00:00:00.000Z",
    "created_at": "2025-12-27T00:00:00.000Z"
  }
]
```

#### POST `/api/admin/users`
Create a new admin user (requires authentication)

**Request Body:**
```json
{
  "username": "newadmin",
  "password": "securePassword123",
  "email": "newadmin@example.com",
  "full_name": "New Administrator"
}
```

**Requirements:**
- Password must be at least 8 characters long
- Username must be unique

**Response:**
```json
{
  "success": true,
  "message": "Admin user created successfully",
  "admin_id": 3
}
```

#### PUT `/api/admin/users`
Update admin user information (requires authentication)

**Request Body:**
```json
{
  "admin_id": 2,
  "email": "updated@example.com",
  "full_name": "Updated Name",
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin user updated successfully"
}
```

#### DELETE `/api/admin/users`
Deactivate an admin user (soft delete, requires authentication)

**Request Body:**
```json
{
  "admin_id": 2
}
```

**Note:** Cannot delete your own account

**Response:**
```json
{
  "success": true,
  "message": "Admin user deactivated successfully"
}
```

### Password Management

#### POST `/api/admin/change-password`
Change password for current user or another admin (requires authentication)

**Change own password:**
```json
{
  "current_password": "admin123",
  "new_password": "newSecurePassword123"
}
```

**Change another user's password (admin only):**
```json
{
  "admin_id": 2,
  "new_password": "newSecurePassword123"
}
```

**Requirements:**
- New password must be at least 8 characters long
- Current password required when changing own password

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt with cost factor 10
2. **Session Management**: Uses iron-session for secure cookie-based sessions
3. **Active Account Check**: Only active accounts can log in
4. **Self-Deletion Prevention**: Admins cannot delete their own accounts
5. **Last Login Tracking**: Timestamp updated on each successful login
6. **Soft Delete**: Accounts are deactivated rather than deleted

## Migration from Hardcoded Credentials

The old system used hardcoded credentials in the login API:
```typescript
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('admin123', 10);
```

This has been replaced with database queries to the `admin_users` table, providing:
- Multiple admin accounts
- Easier credential management
- Password change functionality
- Account activation/deactivation
- Login tracking

## Usage Example with curl

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -c cookies.txt

# List admin users (using session cookie)
curl -X GET http://localhost:3000/api/admin/users \
  -b cookies.txt

# Create new admin
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "username":"newadmin",
    "password":"securePass123",
    "email":"newadmin@example.com",
    "full_name":"New Admin"
  }'

# Change password
curl -X POST http://localhost:3000/api/admin/change-password \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "current_password":"admin123",
    "new_password":"newSecurePassword123"
  }'
```

## Next Steps

1. Run the SQL script to create the admin_users table
2. Restart your Next.js server to load the new API endpoints
3. Login with default credentials (admin/admin123)
4. **Immediately change the default password!**
5. Create additional admin accounts as needed
6. Deactivate or delete the default "support" account if not needed
