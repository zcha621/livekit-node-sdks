# Database Separation Guide

The user management system has been separated into its own database.

## Setup

1. Run the setup script:
```bash
node setup-databases.js
```

2. This creates two databases:
   - **mira_user_mgmt** - Users, permissions, password resets
   - **mira_agent_config** - Agent configurations (existing)

3. Default accounts:
   - Admin: `admin` / `admin123`
   - Viewer: `viewer` / `user123`

## Environment Variables

Your `.env` now has separate database configs:
- `DB_*` - Agent config database  
- `USER_DB_*` - User management database

See `database/README.md` for full documentation.
