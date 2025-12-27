# Admin Authentication & Agent Configuration

This application now includes a secure admin system with two main functionalities:

1. **Agent Configuration Management** - Configure agent parameters from your MySQL database
2. **LiveKit Room Management** - Manage LiveKit rooms, participants, and tokens

## Quick Start

### 1. Database Setup

First, create the MySQL database using the provided schema:

```bash
mysql -u root -p < path/to/agent_config_schema.sql
```

### 2. Environment Configuration

Copy the example environment file and update with your credentials:

```bash
cp .env.example .env
```

Edit `.env` file:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=agent_config
SECRET_COOKIE_PASSWORD=change_this_to_a_random_32_character_string
```

### 3. Start the Application

```bash
pnpm run dev
# or
npx next dev
```

Visit http://localhost:3000

## Features

### Login System
- **Default Credentials**: `admin` / `admin123`
- **Location**: http://localhost:3000/login
- Secure session-based authentication using iron-session
- Sessions persist across page reloads

### Agent Configuration Page
- **Location**: http://localhost:3000/agent-config (requires login)
- View all agents from your database
- Browse agent capabilities
- Edit capability parameters
- Save configuration changes back to database
- Shows which parameters are overridden vs defaults

### LiveKit Admin Dashboard
- **Location**: http://localhost:3000/livekit-admin (requires login)
- Create and delete LiveKit rooms
- View active participants
- Generate access tokens with custom permissions
- Mute/unmute participants
- Remove participants from rooms

## Architecture

### Frontend Pages
- `/pages/login.tsx` - Admin login form
- `/pages/agent-config.tsx` - Agent configuration interface
- `/pages/livekit-admin.tsx` - LiveKit room management
- `/pages/index.tsx` - Homepage with navigation

### API Routes

#### Authentication
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/logout` - Logout and destroy session
- `GET /api/auth/user` - Get current user session

#### Agent Configuration
- `GET /api/agents/list` - Fetch all agents
- `GET /api/agents/[agentId]/capabilities` - Get agent capabilities
- `GET /api/agents/[agentId]/[capabilityId]/config` - Get capability parameters
- `PUT /api/agents/[agentId]/[capabilityId]/config` - Update capability parameters

#### LiveKit Management
- `GET /api/rooms/list` - List all rooms
- `POST /api/rooms/create` - Create new room
- `DELETE /api/rooms/delete` - Delete room
- `GET /api/participants/list` - List participants in room
- `POST /api/participants/mute` - Mute participant
- `POST /api/participants/remove` - Remove participant
- `POST /api/token` - Generate access token

### Backend Libraries
- `/lib/db.ts` - MySQL connection pool and query helper
- `/lib/session.ts` - Iron session configuration and wrappers

## Database Schema

The application uses the following main tables:

- **agents** - Agent instances with metadata
- **agent_types** - Types of agents (ConvaiAgent, etc.)
- **capabilities** - Available capabilities (Conversation, Locomotion, etc.)
- **agent_capabilities** - Many-to-many mapping of agents to capabilities
- **capability_parameters** - Default parameter configurations
- **agent_capability_config** - Agent-specific parameter overrides

## Security Features

- **Session-based Authentication**: Uses iron-session with encrypted cookies
- **Protected Routes**: Both admin pages check authentication before rendering
- **API Protection**: All agent config APIs verify user session
- **Password Hashing**: Uses bcrypt for password storage (change default!)

## Customization

### Changing Admin Password

Edit `/pages/api/auth/login.ts`:

```typescript
const ADMIN_USERNAME = 'your_username';
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('your_password', 10);
```

### Adding More Users

For production, create a users table and update the login logic to query the database instead of using hardcoded credentials.

### Database Configuration

Update `/lib/db.ts` or use environment variables to connect to your MySQL server.

## Development

The application uses:
- **Next.js 12.3.0** - React framework
- **mysql2** - MySQL client
- **bcryptjs** - Password hashing
- **iron-session** - Secure session management
- **LiveKit SDK** - Real-time communication

## Navigation Flow

```
Homepage (/)
    ↓
Login (/login)
    ↓
Agent Config (/agent-config) ⟷ LiveKit Admin (/livekit-admin)
    ↓
Logout → Back to Login
```

## Troubleshooting

### Can't connect to database
- Verify MySQL is running: `mysql -u root -p`
- Check credentials in `.env` file
- Ensure database exists: `CREATE DATABASE agent_config;`

### Session not persisting
- Check SECRET_COOKIE_PASSWORD is set and at least 32 characters
- Clear browser cookies
- Restart the dev server

### TypeScript errors
- Some files are excluded from strict type checking in `tsconfig.json`
- Run `pnpm install` to ensure all types are installed

## Production Deployment

Before deploying to production:

1. ✅ Change default admin password
2. ✅ Set strong SECRET_COOKIE_PASSWORD
3. ✅ Enable HTTPS (secure cookies)
4. ✅ Move credentials to proper user database
5. ✅ Configure production MySQL server
6. ✅ Review CORS settings
7. ✅ Enable rate limiting on auth endpoints

## API Examples

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Get Agents
```bash
curl http://localhost:3000/api/agents/list \
  -H "Cookie: livekit_admin_session=..."
```

### Update Capability Config
```bash
curl -X PUT http://localhost:3000/api/agents/1/1/config \
  -H "Content-Type: application/json" \
  -H "Cookie: livekit_admin_session=..." \
  -d '{"parameters":[{"parameter_key":"voice_type","parameter_value":"female_1","parameter_type":"string"}]}'
```
