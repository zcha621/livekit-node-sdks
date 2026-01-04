# Authentication & Authorization System Setup Guide

This guide explains the new authentication and authorization system with admin and normal user types, permission management, and password reset functionality.

## Features

### 1. **Two User Types**
- **Admin Users**: Full access to everything
- **Normal Users**: View-only by default, with granular permissions

### 2. **Permission System**
Normal users can be granted specific permissions by admins:
- `agent_builder_create`: Create new agents
- `agent_builder_edit`: Edit existing agents
- `agent_builder_delete`: Delete agents
- `agent_config_edit`: Edit agent configurations
- `livekit_token_create`: Create LiveKit tokens
- `livekit_room_manage`: Manage LiveKit rooms
- `video_conference_access`: Join video conferences
- `user_management`: Manage other normal users

### 3. **Password Reset**
- Users can reset forgotten passwords via email
- Reset tokens expire after 24 hours
- One-time use tokens

### 4. **Protected Routes**
- Main page requires authentication
- All pages check permissions before allowing access
- Unauthorized users are redirected to login

## Database Setup

### Step 1: Run the new database schema

```bash
# Connect to MySQL
mysql -u root -p

# Create database (if not exists)
CREATE DATABASE IF NOT EXISTS agent_config;
USE agent_config;

# Run the new schema
source database/users_and_permissions.sql
```

This creates the following tables:
- `admin_users`: User accounts with type (admin/normal)
- `user_permissions`: Permission assignments for normal users
- `password_reset_tokens`: Tokens for password reset

### Step 2: Default Accounts

After running the schema, you'll have:

**Admin Account**:
- Username: `admin`
- Password: `admin123`
- Email: `admin@example.com`
- Type: Admin (full access)

**Normal User Account**:
- Username: `viewer`
- Password: `user123`
- Email: `viewer@example.com`
- Type: Normal (view-only by default)

**IMPORTANT**: Change the admin password after first login!

## Environment Configuration

Update your `.env.local` file:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=agent_config

# Session Security
SECRET_COOKIE_PASSWORD=your_complex_password_at_least_32_characters_long

# Email Configuration (for password reset)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your_email@gmail.com
# SMTP_PASSWORD=your_app_password
# FROM_EMAIL=noreply@yourapp.com

# Base URL (for password reset links)
BASE_URL=http://localhost:3000
```

## Usage

### For Admin Users

#### 1. Login
Navigate to `http://localhost:3000` and login with admin credentials.

#### 2. Manage Users
- Go to "User Management"
- View all users and their permissions
- Grant or revoke permissions for normal users

#### 3. Grant Permissions
```typescript
// Via API
POST /api/admin/users/[userId]/permissions
{
  "permissionName": "agent_builder_create"
}
```

#### 4. Revoke Permissions
```typescript
// Via API
DELETE /api/admin/users/[userId]/permissions
{
  "permissionName": "agent_builder_create"
}
```

### For Normal Users

#### 1. Login
Normal users can login with their credentials and will see:
- View-only access to agents and configurations
- Only permitted actions are enabled

#### 2. Request Permissions
Contact an administrator to request additional permissions.

### Password Reset

#### 1. Forgot Password
- Click "Forgot password?" on the login page
- Enter your email address
- You'll receive a reset link (in development, check console logs)

#### 2. Reset Password
- Click the reset link from email
- Enter new password
- Confirm and submit

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/user` - Get current user info

### User Management (Admin Only)
- `GET /api/admin/users/list` - List all users
- `GET /api/admin/users/[userId]/permissions` - Get user permissions
- `POST /api/admin/users/[userId]/permissions` - Grant permission
- `DELETE /api/admin/users/[userId]/permissions` - Revoke permission

### Agent Management (Permission-based)
- `GET /api/agents/list` - View agents (all users)
- `POST /api/agents/create` - Create agent (requires permission)
- `PUT /api/agents/[agentId]/[capabilityId]/config` - Edit config (requires permission)

## Permission Checking in Code

### In API Routes
```typescript
import { withSessionRoute } from '../lib/session';
import { checkPermission, checkAdmin } from '../lib/permissions';
import { PERMISSIONS } from '../lib/session';

async function myApiRoute(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Check admin
  if (!checkAdmin(req)) {
    return res.status(403).json({ message: 'Admin only' });
  }

  // Check specific permission
  if (!checkPermission(req, PERMISSIONS.AGENT_BUILDER_CREATE)) {
    return res.status(403).json({ message: 'Insufficient permissions' });
  }

  // Your code here...
}

export default withSessionRoute(myApiRoute);
```

### In Pages (Server-Side)
```typescript
import { GetServerSideProps } from 'next';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData, hasPermission, PERMISSIONS } from '../lib/session';

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  // Redirect if not authenticated
  if (!session.user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  // Check permission
  if (!hasPermission(session, PERMISSIONS.AGENT_BUILDER_CREATE)) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: session.user,
    },
  };
};
```

## Security Best Practices

1. **Change Default Passwords**
   - Immediately change the default admin password after setup

2. **Use Strong Passwords**
   - Minimum 6 characters (enforced)
   - Recommend using complex passwords with mixed characters

3. **Session Security**
   - Use a strong SECRET_COOKIE_PASSWORD (32+ characters)
   - Enable secure cookies in production (HTTPS)

4. **Password Reset Tokens**
   - Tokens expire after 24 hours
   - One-time use only
   - Clean up old tokens regularly

5. **Email Configuration**
   - In production, configure SMTP for sending password reset emails
   - Use app-specific passwords for Gmail
   - Implement rate limiting for password reset requests

## Database Maintenance

### Clean up expired reset tokens
```sql
DELETE FROM password_reset_tokens 
WHERE expires_at < NOW() OR is_used = TRUE;
```

Schedule this to run daily via cron job or database event.

### View user permissions
```sql
SELECT * FROM v_user_permissions_summary;
```

### Check user permission
```sql
CALL sp_check_user_permission(2, 'agent_builder_create');
```

## Troubleshooting

### "Unauthorized" Error
- Ensure you're logged in
- Check if your session has expired
- Try logging out and back in

### "Forbidden" Error
- Check if you have the required permission
- Contact an administrator to request access

### Password Reset Not Working
- Check if email is configured correctly
- In development, check console logs for reset token
- Verify token hasn't expired (24 hours)

### Permission Not Granted
- Verify you're logged in as admin
- Check the target user is not an admin (admins can't have permissions modified)
- Ensure permission name is valid

## Migration from Old System

If you have existing admin_users table:

1. **Backup existing data**
```sql
CREATE TABLE admin_users_backup AS SELECT * FROM admin_users;
```

2. **Run new schema** (will drop and recreate tables)
```sql
source database/users_and_permissions.sql
```

3. **Migrate existing users** (if needed)
```sql
INSERT INTO admin_users (username, password_hash, email, full_name, user_type)
SELECT username, password_hash, email, full_name, 'admin'
FROM admin_users_backup;
```

## Testing

### Test Admin Access
1. Login as `admin` / `admin123`
2. Access all features
3. Grant permissions to normal users

### Test Normal User
1. Login as `viewer` / `user123`
2. Verify view-only access
3. Confirm restricted features are disabled

### Test Password Reset
1. Go to forgot password page
2. Enter email address
3. Use reset token from console (development)
4. Reset password successfully

## Production Deployment

Before deploying to production:

1. ✅ Change all default passwords
2. ✅ Configure SMTP for email sending
3. ✅ Use HTTPS (set NODE_ENV=production)
4. ✅ Set strong SECRET_COOKIE_PASSWORD
5. ✅ Set up automated token cleanup
6. ✅ Configure proper BASE_URL
7. ✅ Review and test all permissions
8. ✅ Set up monitoring and logging

## Support

For issues or questions:
- Check the troubleshooting section
- Review API endpoint documentation
- Check server logs for detailed errors
- Verify database schema is up to date
